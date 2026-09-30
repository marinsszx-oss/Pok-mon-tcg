// =========================================================
// POKÉMON TCG v23.0 — multiplayer.js
// Cliente Socket.io: Duelos PvP, Trocas, Presentes, Ranking, Torneios
// =========================================================
'use strict';

// =============== CONFIGURAÇÃO ===============
// ⚠️ TROQUE PELA URL DO SEU SERVIDOR DEPOIS DE HOSPEDAR
// Para testar localmente: 'http://localhost:3000'
// Para produção: 'https://seu-app.onrender.com'
var SERVIDOR_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : null; // ← COLOQUE SUA URL AQUI DEPOIS (ex: 'https://pokemon-tcg-server.onrender.com')

// =============== ESTADO ===============
var _mpSocket = null;
var _mpConectado = false;
var _mpSalaAtual = null;
var _mpSalaTipo = null;
var _mpEuPronto = false;
var _mpJogadoresSala = {};
var _mpChat = [];
var _mpAmigos = [];
var _mpHistoricoOnline = [];
var _mpMatchmakingAtivo = false;
var _mpTorneioAtual = null;
var _mpReconectarTimer = null;

// =============== INICIAR MULTIPLAYER ===============
function mpIniciar(){
  if(typeof io === 'undefined'){
    console.warn('[MP] Socket.io client não carregado.');
    mpAtualizarStatus('offline', 'Socket.io indisponível');
    return;
  }
  if(!SERVIDOR_URL){
    console.warn('[MP] Servidor URL não configurada. Multiplayer desativado.');
    mpAtualizarStatus('offline', 'Servidor não configurado');
    // Atualiza todos os indicadores
    setTimeout(function(){ mpAtualizarTodaUI(); }, 500);
    return;
  }
  if(_mpSocket && _mpConectado) return;

  mpAtualizarStatus('conectando', 'Conectando...');

  try{
    _mpSocket = io(SERVIDOR_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000
    });

    _mpSocket.on('connect', function(){
      console.log('[MP] Conectado! ID:', _mpSocket.id);
      _mpConectado = true;
      mpAtualizarStatus('online', 'Conectado');
      AudioSFX.online();
      // Registra o jogador
      if(jogador && nomeAtual){
        _mpSocket.emit('registrar', {
          nome: nomeAtual,
          nivel: jogador.nivel,
          titulo: jogador.tituloAtual || getTitulo(jogador.nivel).nome,
          bg: jogador.bg || 0,
          insignias: contarInsignias(jogador),
          eloPvP: jogador.eloPvP || 1000,
          foto: jogador.fotoPerfil || null
        });
      }
    });

    _mpSocket.on('disconnect', function(reason){
      console.log('[MP] Desconectado:', reason);
      _mpConectado = false;
      mpAtualizarStatus('offline', 'Desconectado');
      AudioSFX.offline();
    });

    _mpSocket.on('connect_error', function(err){
      console.warn('[MP] Erro de conexão:', err.message);
      _mpConectado = false;
      mpAtualizarStatus('offline', 'Servidor indisponível');
    });

    // ========== EVENTOS DE SALA ==========
    _mpSocket.on('sala-criada', function(data){
      _mpSalaAtual = data.codigo;
      _mpSalaTipo = data.tipo;
      _mpJogadoresSala = {};
      _mpJogadoresSala[data.host] = {nome:data.host, host:true, pronto:false};
      mpMostrarTelaSala(data.codigo, data.tipo);
    });

    _mpSocket.on('sala-atualizada', function(data){
      _mpJogadoresSala = data.jogadores || {};
      mpRenderJogadoresSala();
    });

    _mpSocket.on('jogador-entrou', function(data){
      AudioSFX.clickMenu();
      mostrarToastOnline('Jogador entrou!', data.nome + ' entrou na sala');
      _mpJogadoresSala[data.nome] = {nome:data.nome, host:false, pronto:false};
      mpRenderJogadoresSala();
    });

    _mpSocket.on('jogador-saiu', function(data){
      mostrarToastOnline('Jogador saiu', data.nome + ' saiu da sala');
      delete _mpJogadoresSala[data.nome];
      mpRenderJogadoresSala();
    });

    _mpSocket.on('pronto-atualizado', function(data){
      if(_mpJogadoresSala[data.nome]) _mpJogadoresSala[data.nome].pronto = data.pronto;
      mpRenderJogadoresSala();
    });

    _mpSocket.on('chat-recebido', function(data){
      _mpChat.push(data);
      if(_mpChat.length > 100) _mpChat.shift();
      mpRenderChat();
    });

    _mpSocket.on('erro-sala', function(data){
      AudioSFX.erro();
      alert('Erro na sala:\n\n' + (data.msg || 'Erro desconhecido'));
    });

    // ========== DUELO PVP ==========
    _mpSocket.on('duelo-iniciado', function(data){
      console.log('[MP] Duelo iniciado:', data);
      mpIniciarDueloPvP(data);
    });

    _mpSocket.on('duelo-acao', function(data){
      // Recebeu ação do oponente
      mpAplicarAcaoOponente(data);
    });

    _mpSocket.on('duelo-finalizado', function(data){
      mpFinalizarDueloPvP(data);
    });

    // ========== TROCA ONLINE ==========
    _mpSocket.on('troca-oferta', function(data){
      mpMostrarOfertaTroca(data);
    });

    _mpSocket.on('troca-confirmada', function(data){
      mpAplicarTrocaOnline(data);
    });

    _mpSocket.on('troca-cancelada', function(data){
      AudioSFX.erro();
      alert('A troca foi cancelada: ' + (data.motivo || 'jogador cancelou'));
    });

    // ========== PRESENTES ==========
    _mpSocket.on('presente-recebido', function(data){
      mpReceberPresente(data);
    });

    _mpSocket.on('presente-confirmado', function(data){
      AudioSFX.conquista();
      mostrarToastOnline('Presente enviado!', 'Para ' + data.destinatario);
    });

    // ========== MATCHMAKING ==========
    _mpSocket.on('matchmaking-encontrado', function(data){
      _mpMatchmakingAtivo = false;
      mpFecharModal('modal-mp-matchmaking');
      _mpSalaAtual = data.codigo;
      _mpSalaTipo = 'duelo';
      mpMostrarTelaSala(data.codigo, 'duelo');
      mostrarToastOnline('Oponente encontrado!', data.oponente);
    });

    _mpSocket.on('matchmaking-timeout', function(){
      _mpMatchmakingAtivo = false;
      mpFecharModal('modal-mp-matchmaking');
      AudioSFX.erro();
      alert('Nenhum oponente encontrado. Tente novamente em alguns minutos.');
    });

    // ========== RANKING GLOBAL ==========
    _mpSocket.on('ranking-global', function(data){
      mpRenderRankingGlobal(data);
    });

    // ========== AMIGOS ==========
    _mpSocket.on('amigo-online', function(data){
      mostrarToastOnline('Amigo online!', data.nome);
      var amigo = _mpAmigos.find(function(a){ return a.nome === data.nome; });
      if(amigo) amigo.online = true;
      mpRenderAmigos();
    });

    _mpSocket.on('amigo-offline', function(data){
      var amigo = _mpAmigos.find(function(a){ return a.nome === data.nome; });
      if(amigo) amigo.online = false;
      mpRenderAmigos();
    });

    _mpSocket.on('status-amigos', function(data){
      data.forEach(function(a){
        var amigo = _mpAmigos.find(function(x){ return x.nome === a.nome; });
        if(amigo) amigo.online = a.online;
        else _mpAmigos.push({nome:a.nome, online:a.online});
      });
      mpRenderAmigos();
    });

    // ========== TORNEIOS ==========
    _mpSocket.on('torneio-atualizado', function(data){
      _mpTorneioAtual = data;
      mpRenderTorneio();
    });

    _mpSocket.on('torneio-iniciado', function(data){
      AudioSFX.taca();
      mostrarToastOnline('Torneio iniciado!', data.nome);
      _mpTorneioAtual = data;
      mpRenderTorneio();
    });

    _mpSocket.on('torneio-finalizado', function(data){
      mpFinalizarTorneio(data);
    });

  }catch(e){
    console.error('[MP] Erro ao conectar:', e);
    mpAtualizarStatus('offline', 'Erro');
  }
}

// =============== ATUALIZAR STATUS ===============
function mpAtualizarStatus(status, texto){
  var classes = ['mp-dot', 'mp-dot-' + status];
  document.querySelectorAll('.mp-dot').forEach(function(dot){
    dot.className = 'mp-dot ' + status;
  });
  document.querySelectorAll('.mp-status').forEach(function(el){
    el.className = 'mp-status ' + status;
  });
  var textos = ['mp-status-texto', 'mp-status-jogo-texto', 'mp-status-aba-texto'];
  textos.forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = texto || status;
  });
}
function mpAtualizarTodaUI(){
  mpAtualizarStatus('offline', 'Servidor não configurado');
}

// =============== TELA MULTIPLAYER ===============
function irMultiplayer(){
  AudioSFX.clickMenu();
  if(!nomeAtual || !jogador){
    alert('Crie ou entre em um jogador primeiro!');
    mostrarTela('tela-menu');
    return;
  }
  mostrarTela('tela-multiplayer');
  mpAtualizarStatus(_mpConectado ? 'online' : 'offline', _mpConectado ? 'Conectado' : 'Desconectado');
  if(!_mpConectado && SERVIDOR_URL) mpIniciar();
}

// =============== CRIAR SALA DE DUELO ===============
function mpCriarSalaDuelo(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Você não está conectado ao servidor!\n\n' + 
      (!SERVIDOR_URL ? 'O servidor multiplayer não está configurado.\n\nVeja o tutorial de deploy.' : 'Tentando reconectar...'));
    if(SERVIDOR_URL) mpIniciar();
    return;
  }
  _mpSocket.emit('criar-sala', {
    tipo: 'duelo',
    nome: nomeAtual,
    nivel: jogador.nivel
  });
}

// =============== ENTRAR EM SALA ===============
function mpAbrirModalEntrarSala(tipo){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Você não está conectado!');
    return;
  }
  var input = document.getElementById('mp-codigo-input');
  if(input) input.value = '';
  abrirModal('modal-mp-entrar-sala');
}
function mpEntrarSalaComCodigo(){
  var input = document.getElementById('mp-codigo-input');
  if(!input) return;
  var codigo = input.value.trim().toUpperCase();
  if(codigo.length !== 6){
    AudioSFX.erro();
    alert('Código deve ter 6 caracteres!');
    return;
  }
  AudioSFX.clickMenu();
  _mpSocket.emit('entrar-sala', {codigo: codigo, nome: nomeAtual});
  mpFecharModal('modal-mp-entrar-sala');
}

// =============== MOSTRAR TELA DE SALA ===============
function mpMostrarTelaSala(codigo, tipo){
  AudioSFX.clickMenu();
  mostrarTela('tela-sala');
  _mpSalaAtual = codigo;
  _mpSalaTipo = tipo || 'duelo';
  var codeEl = document.getElementById('sala-codigo-display');
  if(codeEl) codeEl.textContent = codigo;
  var titulo = document.getElementById('sala-titulo');
  if(titulo) titulo.textContent = tipo === 'duelo' ? 'Sala de Duelo' : (tipo === 'troca' ? 'Sala de Troca' : (tipo === 'presente' ? 'Sala de Presentes' : 'Sala'));
  mpRenderJogadoresSala();
  mpRenderChat();
}

// =============== COPIAR CÓDIGO ===============
function mpCopiarCodigo(){
  if(!_mpSalaAtual) return;
  AudioSFX.clickMenu();
  try{
    navigator.clipboard.writeText(_mpSalaAtual);
    mostrarToastOnline('Código copiado!', _mpSalaAtual);
  }catch(e){
    alert('Código: ' + _mpSalaAtual);
  }
}

// =============== RENDER JOGADORES DA SALA ===============
function mpRenderJogadoresSala(){
  var cont = document.getElementById('sala-jogadores-lista');
  if(!cont) return;
  cont.innerHTML = '';
  Object.keys(_mpJogadoresSala).forEach(function(nome){
    var j = _mpJogadoresSala[nome];
    var div = document.createElement('div');
    div.className = 'sala-jogador-card' + (j.host ? ' host' : '');
    var prontoTxt = j.pronto ? '<i class="fas fa-check" style="color:#4caf50;"></i> Pronto' : '<i class="fas fa-clock" style="color:#ff9800;"></i> Aguardando';
    if(j.host) prontoTxt = '<i class="fas fa-crown" style="color:#ffcb05;"></i> Host';
    div.innerHTML = '<div class="nome">' + nome + (nome === nomeAtual ? ' (Você)' : '') + '</div>' +
      '<div class="status">' + prontoTxt + '</div>';
    cont.appendChild(div);
  });
}

// =============== TOGGLE PRONTO ===============
function mpTogglePronto(){
  AudioSFX.clickMenu();
  if(!_mpSocket || !_mpConectado) return;
  _mpEuPronto = !_mpEuPronto;
  _mpSocket.emit('toggle-pronto', {codigo: _mpSalaAtual, nome: nomeAtual, pronto: _mpEuPronto});
  var btn = document.getElementById('sala-btn-pronto');
  if(btn){
    btn.innerHTML = _mpEuPronto ? '<i class="fas fa-times"></i> Cancelar Pronto' : '<i class="fas fa-check"></i> Pronto';
    btn.style.background = _mpEuPronto ? 'linear-gradient(135deg,#ff9800,#f57c00)' : '';
  }
}

// =============== CHAT ===============
function mpEnviarChat(){
  var input = document.getElementById('chat-input');
  if(!input || !_mpSocket || !_mpConectado) return;
  var msg = input.value.trim();
  if(!msg) return;
  _mpSocket.emit('chat', {
    codigo: _mpSalaAtual,
    autor: nomeAtual,
    texto: msg,
    timestamp: Date.now()
  });
  input.value = '';
}
function mpRenderChat(){
  var cont = document.getElementById('chat-mensagens');
  if(!cont) return;
  cont.innerHTML = '';
  _mpChat.slice(-50).forEach(function(m){
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (m.autor === nomeAtual ? 'autor-eu' : 'autor-outro');
    div.innerHTML = '<span class="autor">' + m.autor + ':</span>' + m.texto;
    cont.appendChild(div);
  });
  cont.scrollTop = cont.scrollHeight;
}

// =============== SAIR DA SALA ===============
function mpSairSala(){
  AudioSFX.clickMenu();
  if(_mpSocket && _mpConectado && _mpSalaAtual){
    _mpSocket.emit('sair-sala', {codigo: _mpSalaAtual, nome: nomeAtual});
  }
  _mpSalaAtual = null;
  _mpSalaTipo = null;
  _mpEuPronto = false;
  _mpJogadoresSala = {};
  _mpChat = [];
  mostrarTela('tela-multiplayer');
}

// =============== MATCHMAKING ===============
function mpAbrirMatchmaking(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado ao servidor!');
    return;
  }
  _mpMatchmakingAtivo = true;
  abrirModal('modal-mp-matchmaking');
  _mpSocket.emit('matchmaking', {
    nome: nomeAtual,
    nivel: jogador.nivel,
    elo: jogador.eloPvP || 1000
  });
}
function mpCancelarMatchmaking(){
  AudioSFX.clickMenu();
  _mpMatchmakingAtivo = false;
  mpFecharModal('modal-mp-matchmaking');
  if(_mpSocket && _mpConectado){
    _mpSocket.emit('cancelar-matchmaking', {nome: nomeAtual});
  }
}

// =============== DUELO PVP ===============
function mpIniciarDueloPvP(data){
  AudioSFX.batalhaInicio();
  AudioSFX.batalhaTema('treinador');
  alert('Duelo encontrado!\n\nVocê vs ' + data.oponente + '\n\nA batalha começará agora!');
  // Aqui, idealmente, monta a batalha com o time do oponente
  // Por enquanto vamos simplificar: duelo é simulado
  setTimeout(function(){
    var venceu = Math.random() < 0.5;
    if(_mpSocket && _mpConectado){
      _mpSocket.emit('duelo-resultado', {
        codigo: _mpSalaAtual,
        vencedor: venceu ? nomeAtual : data.oponente,
        perdedor: venceu ? data.oponente : nomeAtual
      });
    }
    if(venceu){
      AudioSFX.batalhaVitoria();
      jogador.duelosPvPVencidos = (jogador.duelosPvPVencidos || 0) + 1;
      jogador.eloPvP = (jogador.eloPvP || 1000) + 25;
      darXP(XP_ACOES.duelo_pvp_vitoria, 'Vitória PvP!');
      jogador.pc += 20;
      alert('VOCÊ VENCEU!\n\n+100 XP\n+20 PC\n+25 Elo');
    }else{
      AudioSFX.batalhaDerrota();
      jogador.duelosPvPDerrotas = (jogador.duelosPvPDerrotas || 0) + 1;
      jogador.eloPvP = Math.max(0, (jogador.eloPvP || 1000) - 20);
      darXP(XP_ACOES.duelo_pvp_derrota, 'Duelo PvP');
      alert('Você perdeu!\n\n+20 XP\n-20 Elo');
    }
    salvar();
    atualizarTudo();
    mpSairSala();
  }, 1500);
}
function mpAplicarAcaoOponente(data){
  // Aqui aplicaria o ataque do oponente no duelo
  console.log('[MP] Ação do oponente:', data);
}
function mpFinalizarDueloPvP(data){
  console.log('[MP] Duelo finalizado:', data);
}

// =============== TROCA ONLINE ===============
function mpAbrirTrocaOnline(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado ao servidor!');
    return;
  }
  var cont = document.getElementById('mp-troca-pokemon-lista');
  if(!cont) return;
  cont.innerHTML = '';
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  todos.forEach(function(p){
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    div.innerHTML = '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="info"><div class="nome">' + (p.apelido || p.nome) + (p.shiny ? ' ✨' : '') + '</div>' +
      '<div class="lvl">Lvl ' + p.lvl + ' · ' + p.tipo + '</div></div>';
    div.onclick = function(){
      window._mpPokemonOferecido = p.nome;
      AudioSFX.clickMenu();
      div.style.borderColor = '#4caf50';
      div.style.background = 'rgba(76,175,80,.15)';
      var irmaos = cont.querySelectorAll('.pokemon-opcao');
      irmaos.forEach(function(el){ if(el !== div){ el.style.borderColor = ''; el.style.background = ''; } });
    };
    cont.appendChild(div);
  });
  abrirModal('modal-mp-troca-online');
}
function mpConfirmarTrocaOnline(){
  var pkm = window._mpPokemonOferecido;
  if(!pkm){
    AudioSFX.erro();
    alert('Escolha um Pokémon!');
    return;
  }
  if(!_mpSalaAtual){
    AudioSFX.erro();
    alert('Você precisa estar em uma sala!\n\nCrie ou entre em uma sala de troca.');
    return;
  }
  _mpSocket.emit('troca-oferta', {
    codigo: _mpSalaAtual,
    nome: nomeAtual,
    pokemon: pkm
  });
  mpFecharModal('modal-mp-troca-online');
  mostrarToastOnline('Oferta enviada!', 'Aguardando oponente...');
}
function mpMostrarOfertaTroca(data){
  AudioSFX.clickMenu();
  var aceitou = confirm('🔄 OFERTA DE TROCA\n\nDe: ' + data.nome + '\nOferece: ' + data.pokemon + '\n\nAceitar?');
  if(aceitou){
    var meuPkm = prompt('Qual Pokémon você vai oferecer? (nome exato)', '');
    if(!meuPkm) return;
    _mpSocket.emit('troca-aceitar', {
      codigo: _mpSalaAtual,
      nome: nomeAtual,
      pokemonOferecido: meuPkm
    });
  }else{
    _mpSocket.emit('troca-recusar', {
      codigo: _mpSalaAtual,
      nome: nomeAtual
    });
  }
}
function mpAplicarTrocaOnline(data){
  AudioSFX.troca();
  alert('Troca realizada!\n\n' + data.pokemon1 + ' ↔ ' + data.pokemon2);
  salvar();
  atualizarTudo();
}

// =============== PRESENTES ===============
function mpAbrirPresentes(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado!');
    return;
  }
  var cont = document.getElementById('mp-presente-itens');
  if(!cont) return;
  cont.innerHTML = '';
  // Lista itens que podem ser enviados
  var itensEnviaveis = [];
  Object.keys(jogador.itens || {}).forEach(function(k){
    var v = jogador.itens[k];
    if(v <= 0) return;
    if(k === 'Master Ball') return; // não pode enviar
    if(k.indexOf('TM_') === 0){
      itensEnviaveis.push({nome:k, qtd:v.quantidade || 1, tipo:'tm'});
    }else if(typeof v === 'number' && v > 0){
      itensEnviaveis.push({nome:k, qtd:v, tipo:'item'});
    }
  });
  if(itensEnviaveis.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:9px;text-align:center;">Sem itens para enviar.</p>';
  }else{
    itensEnviaveis.forEach(function(it){
      var div = document.createElement('div');
      div.className = 'pokemon-opcao';
      div.style.padding = '8px';
      div.innerHTML = '<div class="info"><div class="nome">' + it.nome + '</div><div class="lvl">x' + it.qtd + '</div></div>';
      div.onclick = function(){
        window._mpPresenteEscolhido = it.nome;
        AudioSFX.clickMenu();
        var irmaos = cont.querySelectorAll('.pokemon-opcao');
        irmaos.forEach(function(el){ el.style.background = ''; el.style.borderColor = ''; });
        div.style.borderColor = '#4caf50';
        div.style.background = 'rgba(76,175,80,.15)';
      };
      cont.appendChild(div);
    });
  }
  var input = document.getElementById('mp-presente-destinatario');
  if(input) input.value = '';
  var msgInput = document.getElementById('mp-presente-mensagem');
  if(msgInput) msgInput.value = '';
  abrirModal('modal-mp-presente');
}
function mpEnviarPresente(){
  var destinatario = document.getElementById('mp-presente-destinatario').value.trim();
  var itemNome = window._mpPresenteEscolhido;
  var mensagem = document.getElementById('mp-presente-mensagem').value.trim();
  if(!destinatario){ AudioSFX.erro(); alert('Digite o destinatário!'); return; }
  if(destinatario === nomeAtual){ AudioSFX.erro(); alert('Não pode enviar para si mesmo!'); return; }
  if(!itemNome){ AudioSFX.erro(); alert('Escolha um item!'); return; }
  if((jogador.presentesEnviados || 0) >= 5 * (new Date().getDate())){
    // limite diário simples
  }
  if(!confirm('Enviar ' + itemNome + ' para ' + destinatario + '?')) return;
  _mpSocket.emit('enviar-presente', {
    de: nomeAtual,
    para: destinatario,
    item: itemNome,
    mensagem: mensagem
  });
  // Remove do inventário (o servidor confirma depois)
  var v = jogador.itens[itemNome];
  if(typeof v === 'number'){
    jogador.itens[itemNome]--;
    if(jogador.itens[itemNome] <= 0) delete jogador.itens[itemNome];
  }else if(v && v.quantidade){
    v.quantidade--;
    if(v.quantidade <= 0) delete jogador.itens[itemNome];
  }
  jogador.presentesEnviados = (jogador.presentesEnviados || 0) + 1;
  darXP(XP_ACOES.presente_enviado, 'Presente enviado');
  salvar();
  atualizarTudo();
  mpFecharModal('modal-mp-presente');
  window._mpPresenteEscolhido = null;
}
function mpReceberPresente(data){
  AudioSFX.conquista();
  // Adiciona ao inventário
  if(data.item.indexOf('TM_') === 0){
    if(!jogador.itens[data.item]){
      jogador.itens[data.item] = {quantidade:1, tipo:'tm', nome:data.item.replace('TM_', 'TM ').replace(/-/g, ' ')};
    }else{
      jogador.itens[data.item].quantidade++;
    }
  }else{
    jogador.itens[data.item] = (jogador.itens[data.item] || 0) + 1;
  }
  jogador.presentesRecebidos = (jogador.presentesRecebidos || 0) + 1;
  darXP(XP_ACOES.presente_recebido, 'Presente recebido');
  if(!jogador.presentesHistorico) jogador.presentesHistorico = [];
  jogador.presentesHistorico.unshift({
    de: data.de, item: data.item, mensagem: data.mensagem,
    data: new Date().toISOString(), tipo: 'recebido'
  });
  salvar();
  atualizarTudo();
  alert('🎁 PRESENTE RECEBIDO!\n\nDe: ' + data.de + '\nItem: ' + data.item + (data.mensagem ? '\n\n"' + data.mensagem + '"' : ''));
}

// =============== AMIGOS ===============
function mpAbrirAmigos(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado!');
    return;
  }
  mpRenderAmigos();
  abrirModal('modal-mp-amigos');
}
function mpRenderAmigos(){
  var cont = document.getElementById('mp-lista-amigos');
  if(!cont) return;
  cont.innerHTML = '';
  if(_mpAmigos.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:9px;text-align:center;">Nenhum amigo ainda.</p>';
    return;
  }
  _mpAmigos.forEach(function(a){
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    div.innerHTML = '<div class="info"><div class="nome">' + a.nome + '</div>' +
      '<div class="lvl">' + (a.online ? '<i class="fas fa-circle" style="color:#4caf50;"></i> Online' : '<i class="fas fa-circle" style="color:#888;"></i> Offline') + '</div></div>';
    cont.appendChild(div);
  });
}
function mpAdicionarAmigo(){
  var input = document.getElementById('mp-amigo-input');
  if(!input) return;
  var nome = input.value.trim();
  if(!nome){ AudioSFX.erro(); return; }
  if(nome === nomeAtual){ AudioSFX.erro(); alert('Não pode adicionar você mesmo!'); return; }
  if(_mpAmigos.find(function(a){ return a.nome === nome; })){ AudioSFX.erro(); alert('Já é seu amigo!'); return; }
  _mpSocket.emit('adicionar-amigo', {nome: nomeAtual, amigo: nome});
  _mpAmigos.push({nome: nome, online: false});
  if(!jogador.amigos) jogador.amigos = [];
  jogador.amigos.push(nome);
  salvar();
  mpRenderAmigos();
  input.value = '';
  mostrarToastOnline('Amigo adicionado!', nome);
}

// =============== RANKING GLOBAL ===============
function mpAbrirRankingGlobal(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado!');
    return;
  }
  var filtros = document.getElementById('mp-ranking-filtros');
  if(filtros){
    filtros.innerHTML = '';
    var cats = ['nivel', 'bg', 'insignias', 'copas', 'shinies', 'elo'];
    cats.forEach(function(cat){
      var btn = document.createElement('button');
      btn.className = 'ranking-filtro';
      btn.textContent = cat === 'nivel' ? 'Nível' : (cat === 'bg' ? 'Vitórias' : (cat === 'insignias' ? 'Insígnias' : (cat === 'copas' ? 'Copas' : (cat === 'shinies' ? 'Shinies' : 'Elo PvP'))));
      btn.onclick = function(){
        AudioSFX.clickMenu();
        filtros.querySelectorAll('.ranking-filtro').forEach(function(b){ b.classList.remove('ativo'); });
        btn.classList.add('ativo');
        _mpSocket.emit('buscar-ranking', {categoria: cat, limit: 100});
      };
      if(cat === 'nivel') btn.classList.add('ativo');
      filtros.appendChild(btn);
    });
  }
  abrirModal('modal-mp-ranking');
  _mpSocket.emit('buscar-ranking', {categoria: 'nivel', limit: 100});
}
function mpRenderRankingGlobal(data){
  var cont = document.getElementById('mp-ranking-lista');
  if(!cont) return;
  cont.innerHTML = '';
  if(!data || data.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:9px;text-align:center;">Sem dados.</p>';
    return;
  }
  data.forEach(function(j, i){
    var div = document.createElement('div');
    div.className = 'ranking-item';
    div.innerHTML = '<span class="pos">' + (i + 1) + 'º</span>' +
      '<span class="nome">' + j.nome + '</span>' +
      '<span class="valor">' + j.valor + '</span>';
    div.onclick = function(){
      mpVerPerfilPublico(j);
    };
    cont.appendChild(div);
  });
}
function mpVerPerfilPublico(j){
  AudioSFX.clickMenu();
  alert('👤 PERFIL PÚBLICO\n\n' +
    'Nome: ' + j.nome + '\n' +
    'Nível: ' + (j.nivel || '?') + '\n' +
    'Título: ' + (j.titulo || '?') + '\n' +
    'Vitórias: ' + (j.bg || 0) + '\n' +
    'Insígnias: ' + (j.insignias || 0) + '/72\n' +
    'Elo PvP: ' + (j.eloPvP || 1000));
}

// =============== TORNEIOS ===============
function mpAbrirTorneios(){
  AudioSFX.clickMenu();
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado!');
    return;
  }
  var cont = document.getElementById('mp-torneios-conteudo');
  if(!cont) return;
  cont.innerHTML = '<p style="color:var(--texto-secundario);font-size:9px;text-align:center;">Carregando torneios...</p>';
  _mpSocket.emit('listar-torneios');
  abrirModal('modal-mp-torneios');
}
function mpRenderTorneio(){
  var cont = document.getElementById('mp-torneios-conteudo');
  if(!cont) return;
  if(!_mpTorneioAtual){
    cont.innerHTML =
      '<div style="text-align:center;padding:20px;">' +
        '<p style="color:var(--texto-secundario);font-size:9px;margin-bottom:20px;">Nenhum torneio ativo. Crie um!</p>' +
        '<button class="btn-grande" style="max-width:100%;" onclick="mpCriarTorneio()"><i class="fas fa-plus"></i> Criar Torneio</button>' +
      '</div>';
    return;
  }
  var t = _mpTorneioAtual;
  var html = '<div class="copa-hero"><h2>' + t.nome + '</h2>' +
    '<p>' + t.jogadores + '/16 jogadores</p>';
  if(t.estado === 'aguardando'){
    html += '<button onclick="mpEntrarTorneio()"><i class="fas fa-sign-in-alt"></i> Entrar</button>';
  }else if(t.estado === 'em-andamento'){
    html += '<p style="color:#ff9800;">Em andamento</p>';
  }else if(t.estado === 'finalizado'){
    html += '<p style="color:#4caf50;">Finalizado — Campeão: ' + t.campeao + '</p>';
  }
  html += '</div>';
  cont.innerHTML = html;
}
function mpCriarTorneio(){
  AudioSFX.clickMenu();
  var nome = prompt('Nome do torneio:', 'Torneio ' + nomeAtual);
  if(!nome) return;
  _mpSocket.emit('criar-torneio', {
    nome: nome,
    host: nomeAtual,
    nivel: jogador.nivel
  });
  mostrarToastOnline('Torneio criado!', 'Aguardando jogadores...');
}
function mpEntrarTorneio(){
  _mpSocket.emit('entrar-torneio', {nome: nomeAtual, nivel: jogador.nivel});
}
function mpFinalizarTorneio(data){
  AudioSFX.supercopa();
  soltarConfetes();
  alert('🏆 TORNEIO FINALIZADO!\n\nCampeão: ' + data.campeao);
  if(data.campeao === nomeAtual){
    jogador.torneiosVencidos = (jogador.torneiosVencidos || 0) + 1;
    jogador.pc += 200;
    darXP(XP_ACOES.torneio_1, 'Campeão do Torneio!');
    salvar();
    atualizarTudo();
  }
}

// =============== ABA ONLINE ===============
function mpRenderAbaOnline(){
  var cont = document.getElementById('online-historico');
  if(!cont) return;
  var hist = _mpHistoricoOnline || [];
  if(hist.length === 0){
    cont.innerHTML = '';
    return;
  }
  cont.innerHTML = '<h3 style="color:var(--cor-titulo);font-size:12px;margin-bottom:15px;">Histórico Online</h3>' +
    hist.slice(0, 20).map(function(h){
      return '<div class="historico-item digital">' +
        '<div class="info">' + h.desc + ' — ' + new Date(h.data).toLocaleString('pt-BR') + '</div>' +
      '</div>';
    }).join('');
}

// =============== UTILITÁRIOS ===============
function mpFecharModal(id){
  var el = document.getElementById(id);
  if(el) el.classList.remove('aberto');
}

// =============== SALVAR NA NUVEM ===============
function mpSalvarNuvem(){
  if(!_mpConectado){
    AudioSFX.erro();
    alert('Não conectado ao servidor!\n\nVeja o tutorial de deploy.');
    return;
  }
  if(!jogador || !nomeAtual) return;
  AudioSFX.clickMenu();
  _mpSocket.emit('salvar-nuvem', {
    nome: nomeAtual,
    save: empacotarSave(jogador)
  });
  mostrarToastOnline('Salvando...', 'Enviando save para a nuvem');
  _mpSocket.once('nuvem-salva', function(){
    AudioSFX.conquista();
    mostrarToastOnline('Save salvo!', 'Na nuvem com sucesso');
  });
}

// =============== CONECTAR AUTOMATICAMENTE ===============
document.addEventListener('DOMContentLoaded', function(){
  // Aguarda um tempo e tenta conectar se houver jogador
  setTimeout(function(){
    if(nomeAtual && jogador && SERVIDOR_URL){
      mpIniciar();
    }
  }, 2000);
});

// Hook: tenta conectar ao entrar num jogador
var _entrarJogadorOriginal = window.entrarJogador;
if(typeof _entrarJogadorOriginal === 'function'){
  window.entrarJogador = async function(nome){
    var res = await _entrarJogadorOriginal.apply(this, arguments);
    setTimeout(function(){ mpIniciar(); }, 1500);
    return res;
  };
}

console.log('Pokémon TCG v23.0 — multiplayer.js carregado');