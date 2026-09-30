// =========================================================
// POKÉMON TCG v23.0 — server.js
// Servidor Socket.io: salas, duelos, trocas, presentes, ranking, torneios
// =========================================================
'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());

// =============== ESTADO GLOBAL DO SERVIDOR ===============
const jogadoresOnline = {};     // { socketId: { nome, nivel, elo, amigos } }
const jogadoresPorNome = {};    // { nome: socketId }
const salas = {};               // { codigo: { host, tipo, jogadores: {}, chat: [] } }
const filaMatchmaking = [];     // [ { nome, socketId, nivel, elo } ]
const saves = {};               // { nome: { save, timestamp } }
const torneios = {};            // { id: { nome, host, jogadores, bracket, estado, campeao } }
const presentesPendentes = {};  // { nome: [ { de, item, mensagem } ] }
const dueloAtivo = {};          // { codigo: { jogadores, turnos } }

// =============== UTILITÁRIOS ===============
function gerarCodigoSala(){
  var letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var codigo = '';
  do{
    codigo = '';
    for(var i = 0; i < 6; i++){
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
  }while(salas[codigo]);
  return codigo;
}

function enviarListaRanking(limite, categoria, callback){
  var lista = Object.keys(jogadoresOnline).map(function(sid){
    return jogadoresOnline[sid];
  });
  // Ordena
  switch(categoria){
    case 'bg':
      lista.sort(function(a, b){ return (b.bg || 0) - (a.bg || 0); });
      break;
    case 'insignias':
      lista.sort(function(a, b){ return (b.insignias || 0) - (a.insignias || 0); });
      break;
    case 'copas':
      lista.sort(function(a, b){ return (b.copas || 0) - (a.copas || 0); });
      break;
    case 'shinies':
      lista.sort(function(a, b){ return (b.shinies || 0) - (a.shinies || 0); });
      break;
    case 'elo':
      lista.sort(function(a, b){ return (b.eloPvP || 1000) - (a.eloPvP || 1000); });
      break;
    case 'nivel':
    default:
      lista.sort(function(a, b){ return (b.nivel || 1) - (a.nivel || 1); });
      break;
  }
  lista = lista.slice(0, limite || 100);
  // Não mostra senhas nem saves completos — só perfil público
  var publico = lista.map(function(j){
    return {
      nome: j.nome,
      nivel: j.nivel,
      titulo: j.titulo,
      bg: j.bg,
      insignias: j.insignias,
      copas: j.copas,
      shinies: j.shinies,
      eloPvP: j.eloPvP,
      valor: (function(){
        switch(categoria){
          case 'bg': return (j.bg || 0) + ' vitórias';
          case 'insignias': return (j.insignias || 0) + '/72';
          case 'copas': return (j.copas || 0) + ' copas';
          case 'shinies': return (j.shinies || 0) + ' ✨';
          case 'elo': return (j.eloPvP || 1000) + ' elo';
          default: return 'Nv ' + (j.nivel || 1);
        }
      })()
    };
  });
  if(callback) callback(publico);
  return publico;
}

// =============== CONEXÃO SOCKET ===============
io.on('connection', function(socket){
  console.log('[+] Conectado:', socket.id);

  // ========== REGISTRAR JOGADOR ==========
  socket.on('registrar', function(data){
    if(!data || !data.nome) return;
    jogadoresOnline[socket.id] = {
      nome: data.nome,
      nivel: data.nivel || 1,
      titulo: data.titulo || 'Novato',
      bg: data.bg || 0,
      insignias: data.insignias || 0,
      copas: data.copas || 0,
      shinies: data.shinies || 0,
      eloPvP: data.eloPvP || 1000,
      foto: data.foto || null,
      online: true,
      amigos: []
    };
    jogadoresPorNome[data.nome] = socket.id;
    console.log('[R] Registrado:', data.nome);

    // Envia presentes pendentes
    if(presentesPendentes[data.nome] && presentesPendentes[data.nome].length > 0){
      presentesPendentes[data.nome].forEach(function(p){
        socket.emit('presente-recebido', p);
      });
      delete presentesPendentes[data.nome];
    }

    // Notifica amigos que ficaram online
    Object.keys(jogadoresOnline).forEach(function(sid){
      var j = jogadoresOnline[sid];
      if(j.nome !== data.nome && j.amigos && j.amigos.indexOf(data.nome) !== -1){
        io.to(sid).emit('amigo-online', {nome: data.nome});
      }
    });

    // Envia lista de amigos online
    var amigosOnline = [];
    Object.keys(jogadoresOnline).forEach(function(sid){
      var j = jogadoresOnline[sid];
      if(j.nome !== data.nome && j.amigos && j.amigos.indexOf(data.nome) !== -1){
        amigosOnline.push({nome: j.nome, online: true});
      }
    });
    socket.emit('status-amigos', amigosOnline);
  });

  // ========== ATUALIZAR NOME (mudança de apelido) ==========
  socket.on('atualizar-nome', function(data){
    if(!data || !data.nome) return;
    if(jogadoresOnline[socket.id]){
      var nomeAntigo = jogadoresOnline[socket.id].nome;
      delete jogadoresPorNome[nomeAntigo];
      jogadoresOnline[socket.id].nome = data.nome;
      jogadoresPorNome[data.nome] = socket.id;
      console.log('[N] Jogador renomeado:', nomeAntigo, '->', data.nome);
    }
  });

  // ========== CRIAR SALA ==========
  socket.on('criar-sala', function(data){
    if(!data || !data.nome) return;
    var codigo = gerarCodigoSala();
    salas[codigo] = {
      host: data.nome,
      tipo: data.tipo || 'duelo',
      jogadores: {},
      chat: [],
      criadaEm: Date.now()
    };
    salas[codigo].jogadores[data.nome] = {nome: data.nome, host: true, pronto: false};
    socket.join(codigo);
    socket.emit('sala-criada', {codigo: codigo, tipo: data.tipo, host: data.nome});
    console.log('[S] Sala criada:', codigo, 'por', data.nome);
  });

  // ========== ENTRAR SALA ==========
  socket.on('entrar-sala', function(data){
    if(!data || !data.codigo || !data.nome) return;
    var sala = salas[data.codigo];
    if(!sala){
      socket.emit('erro-sala', {msg: 'Sala não existe ou já foi fechada.'});
      return;
    }
    if(Object.keys(sala.jogadores).length >= 2 && !sala.jogadores[data.nome]){
      socket.emit('erro-sala', {msg: 'Sala cheia!'});
      return;
    }
    sala.jogadores[data.nome] = {nome: data.nome, host: false, pronto: false};
    socket.join(data.codigo);
    io.to(data.codigo).emit('sala-atualizada', {jogadores: sala.jogadores});
    socket.to(data.codigo).emit('jogador-entrou', {nome: data.nome});
    console.log('[S] ', data.nome, 'entrou na sala', data.codigo);
  });

  // ========== SAIR DA SALA ==========
  socket.on('sair-sala', function(data){
    if(!data || !data.codigo || !data.nome) return;
    var sala = salas[data.codigo];
    if(!sala) return;
    delete sala.jogadores[data.nome];
    socket.leave(data.codigo);
    socket.to(data.codigo).emit('jogador-saiu', {nome: data.nome});
    if(Object.keys(sala.jogadores).length === 0){
      delete salas[data.codigo];
      console.log('[S] Sala fechada:', data.codigo);
    }else{
      io.to(data.codigo).emit('sala-atualizada', {jogadores: sala.jogadores});
    }
  });

  // ========== TOGGLE PRONTO ==========
  socket.on('toggle-pronto', function(data){
    if(!data || !data.codigo) return;
    var sala = salas[data.codigo];
    if(!sala) return;
    if(sala.jogadores[data.nome]){
      sala.jogadores[data.nome].pronto = data.pronto;
    }
    io.to(data.codigo).emit('pronto-atualizado', {nome: data.nome, pronto: data.pronto});
    // Se todos prontos e tem 2 jogadores, inicia duelo
    var nomes = Object.keys(sala.jogadores);
    if(sala.tipo === 'duelo' && nomes.length === 2){
      var todosProntos = nomes.every(function(n){ return sala.jogadores[n].pronto; });
      if(todosProntos){
        io.to(data.codigo).emit('duelo-iniciado', {
          oponente: nomes.find(function(n){ return n !== data.nome; }),
          codigo: data.codigo
        });
      }
    }
  });

  // ========== CHAT ==========
  socket.on('chat', function(data){
    if(!data || !data.codigo) return;
    var sala = salas[data.codigo];
    if(!sala) return;
    var msg = {
      autor: data.autor,
      texto: (data.texto || '').substring(0, 200),
      timestamp: Date.now()
    };
    sala.chat.push(msg);
    if(sala.chat.length > 100) sala.chat.shift();
    io.to(data.codigo).emit('chat-recebido', msg);
  });

  // ========== MATCHMAKING ==========
  socket.on('matchmaking', function(data){
    if(!data || !data.nome) return;
    // Remove da fila se já estava
    var idx = filaMatchmaking.findIndex(function(f){ return f.nome === data.nome; });
    if(idx !== -1) filaMatchmaking.splice(idx, 1);
    // Procura oponente do mesmo nível ±5
    var oponenteIdx = filaMatchmaking.findIndex(function(f){
      return Math.abs(f.nivel - (data.nivel || 1)) <= 5;
    });
    if(oponenteIdx !== -1){
      var oponente = filaMatchmaking.splice(oponenteIdx, 1)[0];
      var codigo = gerarCodigoSala();
      salas[codigo] = {
        host: data.nome,
        tipo: 'duelo',
        jogadores: {},
        chat: [],
        criadaEm: Date.now()
      };
      salas[codigo].jogadores[data.nome] = {nome: data.nome, host: true, pronto: true};
      salas[codigo].jogadores[oponente.nome] = {nome: oponente.nome, host: false, pronto: true};
      // Junta os dois na sala
      socket.join(codigo);
      if(jogadoresPorNome[oponente.nome]){
        io.sockets.sockets.get(jogadoresPorNome[oponente.nome])?.join(codigo);
      }
      io.to(codigo).emit('matchmaking-encontrado', {
        codigo: codigo,
        oponente: oponente.nome
      });
      console.log('[M] Match:', data.nome, 'vs', oponente.nome, 'na sala', codigo);
    }else{
      filaMatchmaking.push({
        nome: data.nome,
        socketId: socket.id,
        nivel: data.nivel || 1,
        elo: data.elo || 1000,
        timestamp: Date.now()
      });
      // Timeout de 60s
      setTimeout(function(){
        var aindaNaFila = filaMatchmaking.findIndex(function(f){ return f.nome === data.nome; });
        if(aindaNaFila !== -1){
          filaMatchmaking.splice(aindaNaFila, 1);
          socket.emit('matchmaking-timeout');
        }
      }, 60000);
    }
  });

  socket.on('cancelar-matchmaking', function(data){
    if(!data || !data.nome) return;
    var idx = filaMatchmaking.findIndex(function(f){ return f.nome === data.nome; });
    if(idx !== -1) filaMatchmaking.splice(idx, 1);
  });

  // ========== DUELO PVP ==========
  socket.on('duelo-acao', function(data){
    if(!data || !data.codigo) return;
    socket.to(data.codigo).emit('duelo-acao', data);
  });

  socket.on('duelo-resultado', function(data){
    if(!data || !data.codigo) return;
    io.to(data.codigo).emit('duelo-finalizado', data);
    // Atualiza elo
    var vencedor = data.vencedor;
    var perdedor = data.perdedor;
    Object.keys(jogadoresOnline).forEach(function(sid){
      var j = jogadoresOnline[sid];
      if(j.nome === vencedor) j.eloPvP = (j.eloPvP || 1000) + 25;
      if(j.nome === perdedor) j.eloPvP = Math.max(0, (j.eloPvP || 1000) - 20);
    });
    // Fecha a sala
    setTimeout(function(){
      delete salas[data.codigo];
    }, 5000);
  });

  // ========== TROCA ONLINE ==========
  socket.on('troca-oferta', function(data){
    if(!data || !data.codigo) return;
    socket.to(data.codigo).emit('troca-oferta', data);
  });

  socket.on('troca-aceitar', function(data){
    if(!data || !data.codigo) return;
    // Confirma para ambos
    var sala = salas[data.codigo];
    if(!sala) return;
    var nomes = Object.keys(sala.jogadores);
    var outro = nomes.find(function(n){ return n !== data.nome; });
    io.to(data.codigo).emit('troca-confirmada', {
      pokemon1: data.pokemonOferecido,
      pokemon2: '__PENDENTE__',
      jogador1: data.nome,
      jogador2: outro
    });
  });

  socket.on('troca-recusar', function(data){
    if(!data || !data.codigo) return;
    io.to(data.codigo).emit('troca-cancelada', {motivo: data.nome + ' recusou'});
  });

  // ========== PRESENTES ==========
  socket.on('enviar-presente', function(data){
    if(!data || !data.para || !data.item) return;
    var alvoSocket = jogadoresPorNome[data.para];
    if(alvoSocket && jogadoresOnline[alvoSocket]){
      // Jogador online, entrega já
      io.to(alvoSocket).emit('presente-recebido', {
        de: data.de,
        item: data.item,
        mensagem: data.mensagem,
        timestamp: Date.now()
      });
    }else{
      // Jogador offline, guarda
      if(!presentesPendentes[data.para]) presentesPendentes[data.para] = [];
      presentesPendentes[data.para].push({
        de: data.de,
        item: data.item,
        mensagem: data.mensagem,
        timestamp: Date.now()
      });
    }
    socket.emit('presente-confirmado', {destinatario: data.para});
    console.log('[P]', data.de, 'enviou', data.item, 'para', data.para);
  });

  // ========== AMIGOS ==========
  socket.on('adicionar-amigo', function(data){
    if(!data || !data.nome || !data.amigo) return;
    if(jogadoresOnline[socket.id]){
      if(!jogadoresOnline[socket.id].amigos) jogadoresOnline[socket.id].amigos = [];
      if(jogadoresOnline[socket.id].amigos.indexOf(data.amigo) === -1){
        jogadoresOnline[socket.id].amigos.push(data.amigo);
      }
    }
    // Verifica se o amigo está online
    var amigoSocket = jogadoresPorNome[data.amigo];
    if(amigoSocket && jogadoresOnline[amigoSocket]){
      socket.emit('amigo-online', {nome: data.amigo});
    }else{
      socket.emit('amocketigo-offline', {nome: data.amigo});
.id    }
  });

  // ========== RANK].ING GLOBAL ==========
bg  socket =.on('buscar-ranking', function ((data){
    var cat = (data && data.categoria) || 'nivel';
    var lim = (data && data.limit) || 100;
    var lista = enviarListaRanking(lim, cat);
    socket.emit('ranking-global', lista);
  });

  // ========== SAVE NA NUVEM ==========
  socket.on('salvar-nuvem', function(data){
    if(!data || !data.nome || !data.save) return;
    saves[data.nome] = {
      save: data.save,
      timestamp: Date.now()
    };
    socket.emit('nuvem-salva');
    console.log('[C] Save na nuvem de', data.nome);
  });

  socket.on('carregar-nuvem', function(data){
    if(!data || !data.nome) return;
    var s = saves[data.nome];
    if(s){
      socket.emit('nuvem-carregada', {save: s.save, timestamp: s.timestamp});
    }else{
      socket.emit('nuvem-vazia');
    }
  });

  // ========== TORNEIOS ==========
  socket.on('criar-torneio', function(data){
    if(!data || !data.nome) return;
    var id = 'tor-' + Date.now();
    torneios[id] = {
      id: id,
      nome: data.nome || 'Torneio',
      host: data.host || data.nome,
      jogadores: [{nome: data.host || data.nome, nivel: data.nivel || 1}],
      estado: 'aguardando',
      bracket: null,
      campeao: null,
      criadoEm: Date.now()
    };
    socket.emit('torneio-atualizado', {
      id: id,
      nome: torneios[id].nome,
      jogadores: torneios[id].jogadores.length,
      estado: 'aguardando'
    });
  });

  socket.on('entrar-torneio', function(data){
    if(!data || !data.nome) return;
    Object.keys(torneios).forEach(function(id){
      var t = torneios[id];
      if(t.estado === 'aguardando' && t.jogadores.length < 16){
        if(!t.jogadores.find(function(j){ return j.nome === data.nome; })){
          t.jogadores.push({nome: data.nome, nivel: data.nivel || 1});
          io.emit('torneio-atualizado', {
            id: t.id,
            nome: t.nome,
            jogadores: t.jogadores.length,
            estado: 'aguardando'
          });
          // Se chegou a 16, inicia
          if(t.jogadores.length === 16) iniciarTorneio(t.id);
        }
      }
    });
  });

  socket.on('listar-torneios', function(){
    var lista = Object.values(torneios).map(function(t){
      return {
        id: t.id,
        nome: t.nome,
        jogadores: t.jogadores.length,
        estado: t.estado,
        campeao: t.campeao
      };
    });
    socket.emit('torneio-atualizado', lista[0] || null);
  });

  // ========== VITÓRIA EM BATALHA (atualiza stats no servidor) ==========
  socket.on('vitoria-batalha', function(data){
    if(jogadoresOnline[socket.id]){
      jogadoresOnline[sjogadoresOnline[socket.id].bg || 0) + 1;
    }
  });

  // ========== DESCONEXÃO ==========
  socket.on('disconnect', function(){
    var j = jogadoresOnline[socket.id];
    if(j){
      console.log('[-] Desconectado:', j.nome);
      delete jogadoresPorNome[j.nome];
      // Notifica amigos
      Object.keys(jogadoresOnline).forEach(function(sid){
        var outro = jogadoresOnline[sid];
        if(outro.amigos && outro.amigos.indexOf(j.nome) !== -1){
          io.to(sid).emit('amigo-offline', {nome: j.nome});
        }
      });
    }
    delete jogadoresOnline[socket.id];
    // Remove da fila
    var idx = filaMatchmaking.findIndex(function(f){ return f.socketId === socket.id; });
    if(idx !== -1) filaMatchmaking.splice(idx, 1);
  });
});

// =============== TORNEIO ===============
function iniciarTorneio(id){
  var t = torneios[id];
  if(!t) return;
  t.estado = 'em-andamento';
  // Shuffle
  var jogadores = t.jogadores.slice();
  for(var i = jogadores.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = jogadores[i]; jogadores[i] = jogadores[j]; jogadores[j] = tmp;
  }
  // Bracket 16 → 8 → 4 → 2 → 1
  t.bracket = jogadores.map(function(j){ return {nome: j.nome, nivel: j.nivel}; });
  io.emit('torneio-iniciado', {
    id: t.id,
    nome: t.nome,
    estado: 'em-andamento',
    bracket: t.bracket
  });

  // Simula o torneio (o ideal seria real, mas simplificamos)
  setTimeout(function(){
    var vencedores = t.bracket;
    while(vencedores.length > 1){
      var proxima = [];
      for(var k = 0; k < vencedores.length; k += 2){
        if(k + 1 < vencedores.length){
          var venc = Math.random() < 0.5 ? vencedores[k] : vencedores[k + 1];
          proxima.push(venc);
        }else{
          proxima.push(vencedores[k]);
        }
      }
      vencedores = proxima;
    }
    t.campeao = vencedores[0].nome;
    t.estado = 'finalizado';
    io.emit('torneio-finalizado', {
      id: t.id,
      campeao: t.campeao
    });
    console.log('[T] Torneio', t.nome, 'vencido por', t.campeao);
  }, 30000);
}

// =============== ROTAS EXPRESS ===============
app.get('/', function(req, res){
  res.json({
    status: 'online',
    nome: 'Pokémon TCG v23.0 Server',
    jogadoresOnline: Object.keys(jogadoresOnline).length,
    salas: Object.keys(salas).length,
    torneios: Object.keys(torneios).length,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/ping', function(req, res){
  res.json({pong: true, timestamp: Date.now()});
});

app.get('/status', function(req, res){
  res.json({
    status: 'ok',
    jogadoresOnline: Object.keys(jogadoresOnline).length,
    salas: Object.keys(salas).length,
    torneios: Object.keys(torneios).length,
    filaMatchmaking: filaMatchmaking.length,
    saves: Object.keys(saves).length,
    jogadores: Object.values(jogadoresOnline).map(function(j){
      return {nome: j.nome, nivel: j.nivel, eloPvP: j.eloPvP};
    })
  });
});

// =============== LIMPEZA PERIÓDICA ===============
setInterval(function(){
  var agora = Date.now();
  // Salas vazias há mais de 1 hora
  Object.keys(salas).forEach(function(codigo){
    var s = salas[codigo];
    if(Object.keys(s.jogadores).length === 0 && (agora - s.criadaEm) > 3600000){
      delete salas[codigo];
      console.log('[L] Sala removida por inatividade:', codigo);
    }
  });
  // Torneios finalizados há mais de 1 dia
  Object.keys(torneios).forEach(function(id){
    var t = torneios[id];
    if(t.estado === 'finalizado' && (agora - t.criadoEm) > 86400000){
      delete torneios[id];
    }
  });
}, 60000);

// =============== INICIALIZAÇÃO ===============
var PORT = process.env.PORT || 3000;
server.listen(PORT, function(){
  console.log('======================================');
  console.log('Pokémon TCG v23.0 — Servidor iniciado!');
  console.log('Porta:', PORT);
  console.log('Status: ONLINE');
  console.log('======================================');
  console.log('Criado por: Enzo Souza de Marins');
});