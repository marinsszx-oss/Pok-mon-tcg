// =========================================================
// POKÉMON TCG v23.0 — script2.js
// Batalha + IA Adaptativa + Captura + Ginásios + Equipe Rocket
// =========================================================
'use strict';

// =============== MOVES POOL ===============
var MOVES_POOL_POR_TIPO = {
  fire:[
    {nome:"Ember",move:"ember",tipo:"fire",poder:40,precisao:100,classe:"special",pp:25},
    {nome:"Flame Wheel",move:"flame-wheel",tipo:"fire",poder:60,precisao:100,classe:"physical",pp:25},
    {nome:"Fire Fang",move:"fire-fang",tipo:"fire",poder:65,precisao:95,classe:"physical",pp:15},
    {nome:"Flamethrower",move:"flamethrower",tipo:"fire",poder:90,precisao:100,classe:"special",pp:15},
    {nome:"Fire Blast",move:"fire-blast",tipo:"fire",poder:110,precisao:85,classe:"special",pp:5}
  ],
  water:[
    {nome:"Water Gun",move:"water-gun",tipo:"water",poder:40,precisao:100,classe:"special",pp:25},
    {nome:"Aqua Jet",move:"aqua-jet",tipo:"water",poder:40,precisao:100,classe:"physical",pp:20},
    {nome:"Water Pulse",move:"water-pulse",tipo:"water",poder:60,precisao:100,classe:"special",pp:20},
    {nome:"Surf",move:"surf",tipo:"water",poder:90,precisao:100,classe:"special",pp:15},
    {nome:"Hydro Pump",move:"hydro-pump",tipo:"water",poder:110,precisao:80,classe:"special",pp:5}
  ],
  grass:[
    {nome:"Vine Whip",move:"vine-whip",tipo:"grass",poder:45,precisao:100,classe:"physical",pp:25},
    {nome:"Razor Leaf",move:"razor-leaf",tipo:"grass",poder:55,precisao:95,classe:"physical",pp:25},
    {nome:"Magical Leaf",move:"magical-leaf",tipo:"grass",poder:60,precisao:100,classe:"special",pp:20},
    {nome:"Energy Ball",move:"energy-ball",tipo:"grass",poder:90,precisao:100,classe:"special",pp:10},
    {nome:"Solar Beam",move:"solar-beam",tipo:"grass",poder:120,precisao:100,classe:"special",pp:10}
  ],
  electric:[
    {nome:"Thunder Shock",move:"thunder-shock",tipo:"electric",poder:40,precisao:100,classe:"special",pp:30},
    {nome:"Spark",move:"spark",tipo:"electric",poder:65,precisao:100,classe:"physical",pp:20},
    {nome:"Thunderbolt",move:"thunderbolt",tipo:"electric",poder:90,precisao:100,classe:"special",pp:15},
    {nome:"Thunder",move:"thunder",tipo:"electric",poder:110,precisao:70,classe:"special",pp:10}
  ],
  psychic:[
    {nome:"Confusion",move:"confusion",tipo:"psychic",poder:50,precisao:100,classe:"special",pp:25},
    {nome:"Psybeam",move:"psybeam",tipo:"psychic",poder:65,precisao:100,classe:"special",pp:20},
    {nome:"Psychic",move:"psychic",tipo:"psychic",poder:90,precisao:100,classe:"special",pp:10},
    {nome:"Future Sight",move:"future-sight",tipo:"psychic",poder:120,precisao:100,classe:"special",pp:10}
  ],
  ice:[
    {nome:"Ice Shard",move:"ice-shard",tipo:"ice",poder:40,precisao:100,classe:"physical",pp:30},
    {nome:"Icy Wind",move:"icy-wind",tipo:"ice",poder:55,precisao:95,classe:"special",pp:15},
    {nome:"Ice Beam",move:"ice-beam",tipo:"ice",poder:90,precisao:100,classe:"special",pp:10},
    {nome:"Blizzard",move:"blizzard",tipo:"ice",poder:110,precisao:70,classe:"special",pp:5}
  ],
  dragon:[
    {nome:"Dragon Breath",move:"dragon-breath",tipo:"dragon",poder:60,precisao:100,classe:"special",pp:20},
    {nome:"Dragon Claw",move:"dragon-claw",tipo:"dragon",poder:80,precisao:100,classe:"physical",pp:15},
    {nome:"Dragon Pulse",move:"dragon-pulse",tipo:"dragon",poder:85,precisao:100,classe:"special",pp:10},
    {nome:"Outrage",move:"outrage",tipo:"dragon",poder:120,precisao:100,classe:"physical",pp:10}
  ],
  dark:[
    {nome:"Pursuit",move:"pursuit",tipo:"dark",poder:40,precisao:100,classe:"physical",pp:20},
    {nome:"Bite",move:"bite",tipo:"dark",poder:60,precisao:100,classe:"physical",pp:25},
    {nome:"Crunch",move:"crunch",tipo:"dark",poder:80,precisao:100,classe:"physical",pp:15},
    {nome:"Dark Pulse",move:"dark-pulse",tipo:"dark",poder:80,precisao:100,classe:"special",pp:15}
  ],
  fighting:[
    {nome:"Karate Chop",move:"karate-chop",tipo:"fighting",poder:50,precisao:100,classe:"physical",pp:25},
    {nome:"Low Kick",move:"low-kick",tipo:"fighting",poder:60,precisao:100,classe:"physical",pp:20},
    {nome:"Brick Break",move:"brick-break",tipo:"fighting",poder:75,precisao:100,classe:"physical",pp:15},
    {nome:"Close Combat",move:"close-combat",tipo:"fighting",poder:120,precisao:100,classe:"physical",pp:5}
  ],
  poison:[
    {nome:"Poison Sting",move:"poison-sting",tipo:"poison",poder:15,precisao:100,classe:"physical",pp:35},
    {nome:"Acid",move:"acid",tipo:"poison",poder:40,precisao:100,classe:"special",pp:30},
    {nome:"Sludge",move:"sludge",tipo:"poison",poder:65,precisao:100,classe:"special",pp:20},
    {nome:"Sludge Bomb",move:"sludge-bomb",tipo:"poison",poder:90,precisao:100,classe:"special",pp:10}
  ],
  rock:[
    {nome:"Rock Throw",move:"rock-throw",tipo:"rock",poder:50,precisao:90,classe:"physical",pp:15},
    {nome:"Ancient Power",move:"ancient-power",tipo:"rock",poder:60,precisao:100,classe:"special",pp:5},
    {nome:"Rock Slide",move:"rock-slide",tipo:"rock",poder:75,precisao:90,classe:"physical",pp:10},
    {nome:"Stone Edge",move:"stone-edge",tipo:"rock",poder:100,precisao:80,classe:"physical",pp:5}
  ],
  ground:[
    {nome:"Mud Shot",move:"mud-shot",tipo:"ground",poder:55,precisao:95,classe:"special",pp:15},
    {nome:"Bulldoze",move:"bulldoze",tipo:"ground",poder:60,precisao:100,classe:"physical",pp:20},
    {nome:"Dig",move:"dig",tipo:"ground",poder:80,precisao:100,classe:"physical",pp:10},
    {nome:"Earthquake",move:"earthquake",tipo:"ground",poder:100,precisao:100,classe:"physical",pp:10}
  ],
  flying:[
    {nome:"Peck",move:"peck",tipo:"flying",poder:35,precisao:100,classe:"physical",pp:35},
    {nome:"Wing Attack",move:"wing-attack",tipo:"flying",poder:60,precisao:100,classe:"physical",pp:35},
    {nome:"Air Slash",move:"air-slash",tipo:"flying",poder:75,precisao:95,classe:"special",pp:15},
    {nome:"Brave Bird",move:"brave-bird",tipo:"flying",poder:120,precisao:100,classe:"physical",pp:15}
  ],
  bug:[
    {nome:"Bug Bite",move:"bug-bite",tipo:"bug",poder:60,precisao:100,classe:"physical",pp:20},
    {nome:"Struggle Bug",move:"struggle-bug",tipo:"bug",poder:50,precisao:100,classe:"special",pp:20},
    {nome:"X-Scissor",move:"x-scissor",tipo:"bug",poder:80,precisao:100,classe:"physical",pp:15},
    {nome:"Megahorn",move:"megahorn",tipo:"bug",poder:120,precisao:85,classe:"physical",pp:10}
  ],
  ghost:[
    {nome:"Lick",move:"lick",tipo:"ghost",poder:30,precisao:100,classe:"physical",pp:30},
    {nome:"Shadow Sneak",move:"shadow-sneak",tipo:"ghost",poder:40,precisao:100,classe:"physical",pp:30},
    {nome:"Shadow Claw",move:"shadow-claw",tipo:"ghost",poder:70,precisao:100,classe:"physical",pp:15},
    {nome:"Shadow Ball",move:"shadow-ball",tipo:"ghost",poder:80,precisao:100,classe:"special",pp:15}
  ],
  steel:[
    {nome:"Metal Claw",move:"metal-claw",tipo:"steel",poder:50,precisao:95,classe:"physical",pp:35},
    {nome:"Steel Wing",move:"steel-wing",tipo:"steel",poder:70,precisao:90,classe:"physical",pp:25},
    {nome:"Iron Head",move:"iron-head",tipo:"steel",poder:80,precisao:100,classe:"physical",pp:15},
    {nome:"Flash Cannon",move:"flash-cannon",tipo:"steel",poder:80,precisao:100,classe:"special",pp:10}
  ],
  fairy:[
    {nome:"Fairy Wind",move:"fairy-wind",tipo:"fairy",poder:40,precisao:100,classe:"special",pp:30},
    {nome:"Draining Kiss",move:"draining-kiss",tipo:"fairy",poder:50,precisao:100,classe:"special",pp:10},
    {nome:"Dazzling Gleam",move:"dazzling-gleam",tipo:"fairy",poder:80,precisao:100,classe:"special",pp:10},
    {nome:"Moonblast",move:"moonblast",tipo:"fairy",poder:95,precisao:100,classe:"special",pp:15}
  ],
  normal:[
    {nome:"Tackle",move:"tackle",tipo:"normal",poder:40,precisao:100,classe:"physical",pp:35},
    {nome:"Quick Attack",move:"quick-attack",tipo:"normal",poder:40,precisao:100,classe:"physical",pp:30},
    {nome:"Headbutt",move:"headbutt",tipo:"normal",poder:70,precisao:100,classe:"physical",pp:15},
    {nome:"Body Slam",move:"body-slam",tipo:"normal",poder:85,precisao:100,classe:"physical",pp:15},
    {nome:"Hyper Beam",move:"hyper-beam",tipo:"normal",poder:150,precisao:90,classe:"special",pp:5}
  ]
};
var MOVES_PRIORIDADE = {
  'quick-attack':1,'aqua-jet':1,'ice-shard':1,'mach-punch':1,'shadow-sneak':1,
  'bullet-punch':1,'sucker-punch':1,'extreme-speed':2,'accelerock':1,'water-shuriken':1
};

function gerarMovesIniciaisFallback(tipo){
  var pool = MOVES_POOL_POR_TIPO[tipo] || MOVES_POOL_POR_TIPO.normal;
  var escolhidos = pool.slice().sort(function(a,b){ return a.poder - b.poder; }).slice(0, 3);
  return escolhidos.map(function(mv){
    return {
      nome:mv.nome, move:mv.move, tipo:mv.tipo, poder:mv.poder,
      precisao:mv.precisao, classe:mv.classe, pp:mv.pp || 20, ppAtual:mv.pp || 20,
      prioridade:MOVES_PRIORIDADE[mv.move] || 0
    };
  });
}
function gerarMovesIniciais(tipo){
  return gerarMovesIniciaisFallback(tipo);
}

// =============== CARREGAR MOVES DA API ===============
async function carregarMoves(pokemon){
  try{
    var r = await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemon.id);
    if(!r.ok) throw new Error();
    var dados = await r.json();
    var moves = dados.moves.filter(function(m){ return m.version_group_details.length > 0; });
    var escolhidos = moves.slice(0, 8);
    var lista = [];
    for(var i = 0; i < escolhidos.length; i++){
      try{
        var mvR = await fetch(escolhidos[i].move.url);
        var mvD = await mvR.json();
        var tipo = mvD.type ? mvD.type.name : 'normal';
        var poder = mvD.power || 40;
        var precisao = (mvD.accuracy !== null && mvD.accuracy !== undefined) ? mvD.accuracy : 100;
        var classe = mvD.damage_class ? mvD.damage_class.name : 'physical';
        var pp = mvD.pp || 15;
        var nome = mvD.name.split('-').map(function(s){ return s.charAt(0).toUpperCase() + s.slice(1); }).join(' ');
        var efeito = (mvD.meta && mvD.meta.ailment && mvD.meta.ailment.name !== 'none') ? mvD.meta.ailment.name : null;
        if(!tipo || !TIPOS_POKEMON[tipo]) tipo = 'normal';
        if(!classe || ['physical','special','status'].indexOf(classe) === -1) classe = 'physical';
        lista.push({
          nome:nome, move:mvD.name, tipo:tipo, poder:poder, precisao:precisao,
          classe:classe, pp:pp, ppAtual:pp, efeito:efeito,
          prioridade:MOVES_PRIORIDADE[mvD.name] || 0
        });
      }catch(e){}
    }
    lista.sort(function(a,b){ return (b.poder||0) - (a.poder||0); });
    lista = lista.slice(0, 4);
    if(lista.length === 0) lista = gerarMovesIniciaisFallback(pokemon.tipo);
    return lista;
  }catch(e){
    return gerarMovesIniciaisFallback(pokemon.tipo);
  }
}

// =============== STATUS ===============
function checarStatusAntesDeAgir(p){
  if(!p.status) return true;
  if(p.status === 'PAR'){
    if(Math.random() < 0.25){ addLog(p.nome + ' está paralisado!'); return false; }
    return true;
  }
  if(p.status === 'SLP'){
    if(p._slpTurnos === undefined) p._slpTurnos = 1 + Math.floor(Math.random() * 3);
    if(p._slpTurnos <= 0){ p.status = null; addLog(p.nome + ' acordou!'); return true; }
    p._slpTurnos--;
    addLog(p.nome + ' está dormindo...');
    return false;
  }
  if(p.status === 'FRZ'){
    if(Math.random() < 0.2){ p.status = null; addLog(p.nome + ' descongelou!'); return true; }
    addLog(p.nome + ' está congelado!');
    return false;
  }
  if(p.status === 'CNF'){
    if(p._cnfTurnos === undefined) p._cnfTurnos = 1 + Math.floor(Math.random() * 4);
    if(p._cnfTurnos <= 0){ p.status = null; addLog(p.nome + ' não está mais confuso!'); return true; }
    p._cnfTurnos--;
    if(Math.random() < 0.33){
      addLog(p.nome + ' está confuso! Se machucou!');
      var autoDano = Math.floor(p._hpMax / 8);
      p.hpAtual = Math.max(0, p.hpAtual - autoDano);
      return false;
    }
    return true;
  }
  if(p.status === 'FLN'){
    if(Math.random() < 0.30){ p.status = null; addLog(p.nome + ' hesitou!'); return false; }
    return true;
  }
  if(p.status === 'TXC'){
    p.statusTurnos = (p.statusTurnos || 0) + 1;
    var danoToxic = Math.floor(p._hpMax * (p.statusTurnos) / 16);
    p.hpAtual = Math.max(0, p.hpAtual - danoToxic);
    addLog(p.nome + ' sofreu ' + danoToxic + ' de dano tóxico!');
    return true;
  }
  return true;
}
function aplicarStatus(pokemon, status, log){
  if(!pokemon || !status) return;
  if(pokemon.status) return;
  pokemon.status = status;
  pokemon.statusTurnos = 0;
  var nomes = {BRN:'queimado',PAR:'paralisado',PSN:'envenenado',SLP:'dormindo',FRZ:'congelado',CNF:'confuso',FLN:'hesitante',TXC:'gravemente envenenado'};
  if(log) addLog(pokemon.nome + ' ficou ' + (nomes[status] || status) + '!');
  AudioSFX.statusAplicado();
  if(pokemon._lado === 'jogador') renderStatus('jogador', pokemon);
  else if(pokemon._lado === 'inimigo') renderStatus('inimigo', pokemon);
}

// =============== ANIMAÇÕES ===============
function animarAtaqueJogador(cb){
  var sprite = document.getElementById('sprite-jogador');
  if(!sprite){ if(cb) cb(); return; }
  sprite.classList.add('sprite-ataque-jogador');
  setTimeout(function(){ sprite.classList.remove('sprite-ataque-jogador'); if(cb) cb(); }, 500);
}
function animarDanoInimigo(cb){
  var sprite = document.getElementById('sprite-inimigo');
  if(!sprite){ if(cb) cb(); return; }
  sprite.classList.add('sprite-leva-dano-inimigo');
  setTimeout(function(){ sprite.classList.remove('sprite-leva-dano-inimigo'); if(cb) cb(); }, 400);
}
function animarAtaqueInimigo(cb){
  var sprite = document.getElementById('sprite-inimigo');
  if(!sprite){ if(cb) cb(); return; }
  sprite.classList.add('sprite-ataque-inimigo');
  setTimeout(function(){ sprite.classList.remove('sprite-ataque-inimigo'); if(cb) cb(); }, 500);
}
function animarDanoJogador(cb){
  var sprite = document.getElementById('sprite-jogador');
  if(!sprite){ if(cb) cb(); return; }
  sprite.classList.add('sprite-leva-dano-jogador');
  setTimeout(function(){ sprite.classList.remove('sprite-leva-dano-jogador'); if(cb) cb(); }, 400);
}
function screenShake(){
  var arena = document.getElementById('arena-batalha');
  if(!arena) return;
  arena.classList.add('screen-shake');
  setTimeout(function(){ arena.classList.remove('screen-shake'); }, 500);
}
function addLog(msg){
  if(!_batalha) return;
  _batalha.log.push(msg);
  if(_batalha.log.length > 2) _batalha.log.shift();
  var msgEl = document.getElementById('campo-msg');
  if(msgEl) msgEl.textContent = _batalha.log.join(' ');
}

// =============== CÁLCULO DE DANO ===============
function calcularDano(atacante, defensor, move, statsAtk, statsDef){
  var nivel = atacante.lvl || 1;
  var poder = move.poder || 40;
  if(poder === 0 || move.classe === 'status') return {dano:0, efetividade:1, critico:false, status:true};
  var fisico = move.classe === 'physical';
  var A = fisico ? statsAtk.atk : statsAtk.spa;
  var D = fisico ? statsDef.def : statsDef.spd;
  var boostAtk = 1, boostDef = 1;
  if(atacante.boosts){
    var b = atacante.boosts[fisico ? 'atk' : 'spa'] || 0;
    boostAtk = b >= 0 ? (2 + b) / 2 : 2 / (2 - b);
  }
  if(defensor.boosts){
    var bD = defensor.boosts[fisico ? 'def' : 'spd'] || 0;
    boostDef = bD >= 0 ? (2 + bD) / 2 : 2 / (2 - bD);
  }
  var base = Math.floor(Math.floor(Math.floor((2 * nivel / 5 + 2) * poder * (A * boostAtk) / (D * boostDef)) / 50) + 2);
  var stab = (atacante.tipo === move.tipo) ? 1.5 : 1.0;
  var efet = getEfetividade(move.tipo, defensor.tipo);
  if(efet === 0) return {dano:0, efetividade:0, critico:false, imunidade:true};
  var crit = Math.random() * 100 < 6.25 ? 1.5 : 1.0;
  var itemAtk = atacante.itemEquipado;
  if(itemAtk && typeof HOLD_ITEM_MODS !== 'undefined' && HOLD_ITEM_MODS[itemAtk]){
    var mod = HOLD_ITEM_MODS[itemAtk];
    if(mod.dano) base = Math.floor(base * mod.dano);
    if(mod.superEfetivo && efet > 1) base = Math.floor(base * mod.superEfetivo);
  }
  if(atacante.habilidade && HABILIDADES_EFEITOS[atacante.habilidade]){
    var hab = HABILIDADES_EFEITOS[atacante.habilidade];
    if(hab.tipoBonus === move.tipo && atacante.hpAtual <= atacante._hpMax * hab.hpHurdle){
      base = Math.floor(base * hab.mult);
    }
  }
  var rand = 0.85 + Math.random() * 0.15;
  var dano = Math.floor(base * stab * efet * crit * rand);
  return {dano:Math.max(1, dano), efetividade:efet, critico:crit > 1};
}
function checarAcerto(move, atacante, defensor){
  var precisao = (move.precisao !== undefined && move.precisao !== null) ? move.precisao : 100;
  if(precisao >= 100) return true;
  return Math.random() * 100 < precisao;
}

// =============== EFEITOS SECUNDÁRIOS ===============
var EFEITOS_SECUNDARIOS_POR_TIPO = {
  fire:{status:'BRN',chance:0.10}, water:{status:null},
  electric:{status:'PAR',chance:0.10}, grass:{status:null},
  ice:{status:'FRZ',chance:0.10}, fighting:{status:null},
  poison:{status:'PSN',chance:0.30}, ground:{status:null},
  flying:{status:null}, psychic:{status:'CNF',chance:0.30},
  bug:{status:null}, rock:{status:null},
  ghost:{status:'CNF',chance:0.20}, dragon:{status:null},
  dark:{status:'FLN',chance:0.20}, steel:{status:null},
  fairy:{status:'CNF',chance:0.10}, normal:{status:'FLN',chance:0.15}
};
var EFEITOS_MOVES_ESPECIFICOS = {
  'will-o-wisp':{status:'BRN',chance:1.0},
  'thunder-wave':{status:'PAR',chance:1.0},
  'toxic':{status:'TXC',chance:1.0},
  'sleep-powder':{status:'SLP',chance:1.0},
  'spore':{status:'SLP',chance:1.0},
  'confuse-ray':{status:'CNF',chance:1.0},
  'body-slam':{status:'PAR',chance:0.30},
  'thunder':{status:'PAR',chance:0.30},
  'thunderbolt':{status:'PAR',chance:0.10},
  'ice-beam':{status:'FRZ',chance:0.10},
  'blizzard':{status:'FRZ',chance:0.10},
  'flamethrower':{status:'BRN',chance:0.10},
  'fire-blast':{status:'BRN',chance:0.10},
  'scald':{status:'BRN',chance:0.30},
  'sludge-bomb':{status:'PSN',chance:0.30},
  'poison-jab':{status:'PSN',chance:0.30},
  'iron-head':{status:'FLN',chance:0.30},
  'bite':{status:'FLN',chance:0.30},
  'crunch':{status:'DEF',chance:0.20}
};
function getEfeitoSecundario(move){
  if(!move) return null;
  var moveId = move.move || move.nome.toLowerCase().replace(/\s+/g,'-');
  if(EFEITOS_MOVES_ESPECIFICOS[moveId]) return EFEITOS_MOVES_ESPECIFICOS[moveId];
  var efeito = EFEITOS_SECUNDARIOS_POR_TIPO[move.tipo];
  if(!efeito || !efeito.status) return null;
  return efeito;
}

// =============== RENDER BATALHA ===============
function renderBatalha(){
  if(!_batalha) return;
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  if(!meu || !inimigo) return;
  meu._lado = 'jogador';
  inimigo._lado = 'inimigo';

  var spriteJog = document.getElementById('sprite-jogador');
  var spriteIni = document.getElementById('sprite-inimigo');
  if(spriteJog){
    spriteJog.src = spritePokemonAtual(meu);
    spriteJog.onerror = function(){ this.src = spritePokemon(meu.id); };
    spriteJog.style.opacity = '1';
    spriteJog.classList.toggle('shiny', meu.shiny === true);
  }
  if(spriteIni){
    spriteIni.src = spritePokemonAtual(inimigo);
    spriteIni.onerror = function(){ this.src = spritePokemon(inimigo.id); };
    spriteIni.style.opacity = '1';
    spriteIni.classList.toggle('shiny', inimigo.shiny === true);
  }
  atualizarAuraStatus('jogador', meu);
  atualizarAuraStatus('inimigo', inimigo);

  var nomeJogEl = document.getElementById('nome-jogador');
  var lvlJogEl = document.getElementById('lvl-jogador');
  var nomeIniEl = document.getElementById('nome-inimigo');
  var lvlIniEl = document.getElementById('lvl-inimigo');
  var shinyTag = function(p){ return p.shiny ? ' ✨' : ''; };
  var sexoTag = function(p){
    if(p.sexo === 'M') return ' ♂';
    if(p.sexo === 'F') return ' ♀';
    return '';
  };
  if(nomeJogEl) nomeJogEl.textContent = (meu.apelido || meu.nome) + sexoTag(meu) + shinyTag(meu);
  if(lvlJogEl) lvlJogEl.textContent = 'Lv' + meu.lvl;
  if(nomeIniEl) nomeIniEl.textContent = (inimigo.apelido || inimigo.nome) + sexoTag(inimigo) + shinyTag(inimigo);
  if(lvlIniEl) lvlIniEl.textContent = 'Lv' + inimigo.lvl;

  atualizarBarraHP('jogador', meu);
  atualizarBarraHP('inimigo', inimigo);
  renderStatus('jogador', meu);
  renderStatus('inimigo', inimigo);
  renderMenuBatalha();
}
function atualizarAuraStatus(lado, p){
  var aura = document.getElementById('aura-' + lado);
  if(!aura) return;
  aura.className = 'sprite-status-aura';
  aura.style.display = 'none';
  if(!p.status) return;
  aura.style.display = 'block';
  var map = {PAR:'aura-par',BRN:'aura-brn',PSN:'aura-psn',SLP:'aura-slp',FRZ:'aura-frz',CNF:'aura-cnf',FLN:'aura-par',TXC:'aura-txc'};
  if(map[p.status]) aura.classList.add(map[p.status]);
}
function atualizarBarraHP(lado, p){
  var max = p._hpMax || 1;
  var atual = Math.max(0, p.hpAtual || 0);
  var pct = Math.max(0, (atual / max) * 100);
  var barra = document.getElementById('hp-' + lado + '-barra');
  var texto = document.getElementById('hp-' + lado + '-texto');
  if(barra){
    barra.style.width = pct + '%';
    barra.className = 'hp-fill ' + (pct > 50 ? 'hp-verde' : pct > 20 ? 'hp-amarelo' : 'hp-vermelho');
  }
  if(texto) texto.textContent = atual + ' / ' + max;
}
function renderStatus(lado, p){
  var cont = document.getElementById('status-' + lado);
  if(!cont) return;
  cont.innerHTML = '';
  if(p.status){
    var badge = document.createElement('span');
    badge.className = 'status-badge-inline status-' + p.status.toLowerCase().slice(0, 3);
    badge.textContent = p.status;
    cont.appendChild(badge);
  }
}

// =============== MENU BATALHA ===============
function renderMenuBatalha(){
  var cont = document.getElementById('menu-acao-container');
  if(!cont || !_batalha) return;
  if(_batalha.bloqueado){ cont.innerHTML = ''; return; }
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  if(!meu) return;

  cont.innerHTML = '';
  var menu = document.createElement('div');
  menu.className = 'menu-acao';

  var btnLuta = document.createElement('button');
  btnLuta.className = 'menu-luta';
  btnLuta.innerHTML = '<i class="fas fa-bolt"></i> LUTAR';
  btnLuta.onclick = function(){ AudioSFX.clickBatalha(); renderMenuMoves(); };
  menu.appendChild(btnLuta);

  var btnPokemon = document.createElement('button');
  btnPokemon.className = 'menu-pokemon';
  btnPokemon.innerHTML = '<i class="fas fa-right-left"></i> POKÉMON';
  var temOutroVivo = _batalha.meuTime.some(function(p, i){
    return i !== _batalha.indiceMeu && p && p.hpAtual > 0;
  });
  if(!temOutroVivo){
    btnPokemon.disabled = true;
    btnPokemon.style.opacity = '0.5';
  }else{
    btnPokemon.onclick = function(){ AudioSFX.clickBatalha(); trocarPokemonBatalha(); };
  }
  menu.appendChild(btnPokemon);

  var btnItem = document.createElement('button');
  btnItem.className = 'menu-item';
  btnItem.innerHTML = '<i class="fas fa-flask"></i> ITEM';
  btnItem.onclick = function(){ AudioSFX.clickBatalha(); usarItemBatalha(); };
  menu.appendChild(btnItem);

  var btnBola = document.createElement('button');
  btnBola.className = 'menu-bola';
  btnBola.innerHTML = '<i class="fas fa-circle-dot"></i> BOLA';
  if(_batalha.tipo === 'treinador'){
    btnBola.disabled = true;
    btnBola.style.opacity = '0.5';
  }else{
    btnBola.onclick = function(){ AudioSFX.clickBatalha(); tentarCapturaBatalha(); };
  }
  menu.appendChild(btnBola);

  var btnFugir = document.createElement('button');
  btnFugir.className = 'menu-fugir';
  btnFugir.innerHTML = '<i class="fas fa-person-running"></i> ' + (_batalha.tipo === 'selvagem' ? 'FUGIR' : 'DESISTIR');
  btnFugir.onclick = function(){ AudioSFX.clickBatalha(); tentarFugir(); };
  menu.appendChild(btnFugir);

  var btnTransform = document.createElement('button');
  btnTransform.className = 'menu-transform';
  if(meu.mega && !meu.permanenteMega){
    btnTransform.innerHTML = '<i class="fas fa-rotate-left"></i> DESMEGA';
    btnTransform.onclick = function(){ AudioSFX.clickBatalha(); desfazerMegaEmBatalha(); };
    menu.appendChild(btnTransform);
  }else if(meu.gigantamax && !meu.permanente){
    btnTransform.innerHTML = '<i class="fas fa-rotate-left"></i> DESGMAX';
    btnTransform.onclick = function(){ AudioSFX.clickBatalha(); desfazerGmaxEmBatalha(); };
    menu.appendChild(btnTransform);
  }else if(typeof podeMegaEvoluir === 'function' && podeMegaEvoluir(meu)){
    btnTransform.innerHTML = '<i class="fas fa-star"></i> MEGA';
    btnTransform.onclick = function(){ AudioSFX.clickBatalha(); megaEvoluirEmBatalha(); };
    menu.appendChild(btnTransform);
  }else if(typeof podeGigantamax === 'function' && podeGigantamax(meu)){
    btnTransform.innerHTML = '<i class="fas fa-dragon"></i> GMAX';
    btnTransform.onclick = function(){ AudioSFX.clickBatalha(); ativarGigantamaxEmBatalha(); };
    menu.appendChild(btnTransform);
  }

  cont.appendChild(menu);
}

// =============== MENU MOVES ===============
async function renderMenuMoves(){
  if(!_batalha || _batalha.bloqueado) return;
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  if(!meu || !inimigo) return;

  if(!meu.moves || meu.moves.length === 0){
    mostrarLoading(true);
    meu.moves = await carregarMoves(meu);
    mostrarLoading(false);
  }

  var menu = document.createElement('div');
  menu.className = 'menu-moves';
  var grid = document.createElement('div');
  grid.className = 'moves-grid';

  meu.moves.forEach(function(mv){
    var btn = document.createElement('button');
    btn.className = 'move-btn';
    var tipoFinal = (mv.tipo && TIPOS_POKEMON[mv.tipo]) ? mv.tipo : 'normal';
    var tipoInfo = TIPOS_POKEMON[tipoFinal] || {cor:'#888'};
    var ppAtual = mv.ppAtual !== undefined ? mv.ppAtual : mv.pp;
    var podeUsar = ppAtual > 0;
    btn.disabled = !podeUsar;
    var indicador = getIndicadorEficacia(tipoFinal, inimigo.tipo);
    btn.innerHTML =
      '<span class="mv-tipo" style="background:' + tipoInfo.cor + '">' + tipoFinal.toUpperCase().slice(0, 3) + '</span>' +
      '<div class="mv-nome">' + mv.nome + indicador + '</div>' +
      '<div class="mv-stats"><span>Poder: ' + (mv.poder || '—') + '</span><span>PP: ' + ppAtual + '/' + mv.pp + '</span></div>';
    btn.onclick = function(){ executarTurnoJogador(mv); };
    grid.appendChild(btn);
  });
  menu.appendChild(grid);

  var btnVoltar = document.createElement('button');
  btnVoltar.className = 'voltar-btn';
  btnVoltar.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar';
  btnVoltar.onclick = function(){ AudioSFX.clickBatalha(); renderMenuBatalha(); };
  menu.appendChild(btnVoltar);

  var cont = document.getElementById('menu-batalha-container');
  if(cont){ cont.innerHTML = ''; cont.appendChild(menu); }
}
function getIndicadorEficacia(tipoMove, tipoInimigo){
  if(!tipoMove || !tipoInimigo) return '';
  var efet = getEfetividade(tipoMove, tipoInimigo);
  if(efet === 0) return '<span class="eficacia-indicador imune">0</span>';
  if(efet > 1)  return '<span class="eficacia-indicador super">▲</span>';
  if(efet < 1)  return '<span class="eficacia-indicador fraco">▼</span>';
  return '';
}
function aplicarHabilidadeEntrada(atacante, defensor){
  if(!atacante.habilidade) return;
  var hab = HABILIDADES_EFEITOS[atacante.habilidade];
  if(!hab) return;
  if(hab.reduzAtkInimigo){
    if(!defensor.boosts) defensor.boosts = {};
    if((defensor.boosts.atk || 0) > -3){
      defensor.boosts.atk = (defensor.boosts.atk || 0) - 1;
      addLog(atacante.nome + ' intimida! Ataque de ' + defensor.nome + ' caiu!');
    }
  }
}

// =============== TURNO JOGADOR ===============
function executarTurnoJogador(move){
  if(!_batalha || _batalha.bloqueado) return;
  _batalha.bloqueado = true;
  _batalha.turno = (_batalha.turno || 0) + 1;
  var contMsg = document.getElementById('menu-batalha-container');
  if(contMsg) contMsg.innerHTML = '';

  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  if(!meu || !inimigo) return;
  meu._lado = 'jogador';
  inimigo._lado = 'inimigo';

  // Registra jogada para IA adaptativa
  if(typeof registrarJogadaIA === 'function'){
    registrarJogadaIA(move, {hpMeu:meu.hpAtual, hpIni:inimigo.hpAtual});
  }

  if(!checarStatusAntesDeAgir(meu)){
    atualizarBarraHP('jogador', meu);
    if(meu.hpAtual <= 0){ setTimeout(function(){ meuDesmaiou(); }, 800); }
    else{ setTimeout(function(){ turnoInimigo(); }, 900); }
    return;
  }
  if(!checarAcerto(move, meu, inimigo)){
    addLog(meu.nome + ' usou ' + move.nome + ' mas errou!');
    if(move.ppAtual !== undefined) move.ppAtual = Math.max(0, move.ppAtual - 1);
    setTimeout(function(){ turnoInimigo(); }, 900);
    return;
  }
  if(move.poder === 0 || move.classe === 'status'){
    var ef = move.efeito;
    var statusMap = {poison:'PSN',burn:'BRN',paralysis:'PAR',sleep:'SLP',freeze:'FRZ',confusion:'CNF',flinch:'FLN',toxic:'TXC'};
    if(ef && statusMap[ef]){ aplicarStatus(inimigo, statusMap[ef], true); }
    else { addLog(meu.nome + ' usou ' + move.nome + '!'); }
    if(move.ppAtual !== undefined) move.ppAtual = Math.max(0, move.ppAtual - 1);
    renderStatus('inimigo', inimigo);
    setTimeout(function(){ turnoInimigo(); }, 1000);
    return;
  }

  animarAtaqueJogador(function(){
    var statsAtk = calcularStatsCompletos(meu, meu.baseStats);
    var statsDef = calcularStatsCompletos(inimigo, inimigo.baseStats);
    var res = calcularDano(meu, inimigo, move, statsAtk, statsDef);
    AudioSFX.golpe(res.efetividade, move.tipo);
    animarDanoInimigo(function(){
      if(res.efetividade > 1) screenShake();
      inimigo.hpAtual = Math.max(0, inimigo.hpAtual - res.dano);
      var efetTxt = res.efetividade > 1 ? ' (Super efetivo!)' : (res.efetividade < 1 && res.efetividade > 0) ? ' (Pouco efetivo...)' : res.efetividade === 0 ? ' (Não afeta!)' : '';
      var critTxt = res.critico ? ' Crítico!' : '';
      addLog(meu.nome + ' usou ' + move.nome + '! ' + res.dano + ' de dano' + efetTxt + critTxt);
      atualizarBarraHP('inimigo', inimigo);
      if(move.ppAtual !== undefined) move.ppAtual = Math.max(0, move.ppAtual - 1);
      if(inimigo.hpAtual > 0 && !inimigo.status){
        var efSec = getEfeitoSecundario(move);
        if(efSec && efSec.status && Math.random() < efSec.chance){
          aplicarStatus(inimigo, efSec.status, true);
        }
      }
      if(inimigo.hpAtual > 0 && inimigo.habilidade === 'Static' && !meu.status){
        if(Math.random() < 0.30) aplicarStatus(meu, 'PAR', true);
      }
      if(inimigo.itemEquipado === 'Rocky Helmet' && res.dano > 0){
        var retorno = Math.floor(meu._hpMax * 0.15);
        meu.hpAtual = Math.max(0, meu.hpAtual - retorno);
        addLog(meu.nome + ' levou dano do Rocky Helmet!');
        atualizarBarraHP('jogador', meu);
      }
      if(inimigo.hpAtual <= 0){ setTimeout(function(){ inimigoDesmaiou(); }, 800); }
      else{ setTimeout(function(){ turnoInimigo(); }, 900); }
    });
  });
}

// =============== TURNO INIMIGO (IA) ===============
async function turnoInimigo(){
  if(!_batalha) return;
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  if(!inimigo || inimigo.hpAtual <= 0){ _batalha.bloqueado = false; renderMenuBatalha(); return; }
  inimigo._lado = 'inimigo';
  meu._lado = 'jogador';
  if(!checarStatusAntesDeAgir(inimigo)){
    atualizarBarraHP('inimigo', inimigo);
    setTimeout(function(){ aplicarEfeitosPosTurno(); }, 700);
    return;
  }
  if(!inimigo.moves || inimigo.moves.length === 0) inimigo.moves = await carregarMoves(inimigo);
  
  var moveEscolhido = escolherMoveIA(inimigo, meu);
  
  if(!checarAcerto(moveEscolhido, inimigo, meu)){
    addLog(inimigo.nome + ' usou ' + moveEscolhido.nome + ' mas errou!');
    setTimeout(function(){ aplicarEfeitosPosTurno(); }, 700);
    return;
  }
  if(moveEscolhido.poder === 0 || moveEscolhido.classe === 'status'){
    var ef = moveEscolhido.efeito;
    var statusMap = {poison:'PSN',burn:'BRN',paralysis:'PAR',sleep:'SLP',freeze:'FRZ',confusion:'CNF',toxic:'TXC'};
    if(ef && statusMap[ef] && !meu.status){
      aplicarStatus(meu, statusMap[ef], true);
    }else{
      addLog(inimigo.nome + ' usou ' + moveEscolhido.nome + '!');
    }
    setTimeout(function(){ aplicarEfeitosPosTurno(); }, 900);
    return;
  }
  var statsAtk = calcularStatsCompletos(inimigo, inimigo.baseStats);
  var statsDef = calcularStatsCompletos(meu, meu.baseStats);
  var res = calcularDano(inimigo, meu, moveEscolhido, statsAtk, statsDef);
  animarAtaqueInimigo(function(){
    AudioSFX.golpe(res.efetividade, moveEscolhido.tipo);
    animarDanoJogador(function(){
      if(res.efetividade > 1) screenShake();
      meu.hpAtual = Math.max(0, meu.hpAtual - res.dano);
      var efetTxt = res.efetividade > 1 ? ' (Super efetivo!)' : (res.efetividade < 1 && res.efetividade > 0) ? ' (Pouco efetivo...)' : '';
      addLog(inimigo.nome + ' usou ' + moveEscolhido.nome + '! ' + res.dano + ' de dano' + efetTxt);
      atualizarBarraHP('jogador', meu);
      if(meu.hpAtual > 0 && !meu.status){
        var efSec = getEfeitoSecundario(moveEscolhido);
        if(efSec && efSec.status && Math.random() < efSec.chance){
          aplicarStatus(meu, efSec.status, true);
        }
      }
      if(meu.hpAtual <= 0){ setTimeout(function(){ meuDesmaiou(); }, 800); }
      else{ setTimeout(function(){ aplicarEfeitosPosTurno(); }, 900); }
    });
  });
}

// =============== IA ADAPTATIVA ===============
function escolherMoveIA(inimigo, meu){
  var moves = inimigo.moves || [];
  if(moves.length === 0) return {nome:'Tackle',tipo:'normal',poder:40,precisao:100,classe:'physical',pp:35,ppAtual:35};
  
  var melhor = null;
  var melhorScore = -Infinity;
  moves.forEach(function(mv){
    var score = 0;
    var efet = getEfetividade(mv.tipo, meu.tipo);
    var poder = mv.poder || 0;
    var ppAtual = mv.ppAtual !== undefined ? mv.ppAtual : mv.pp;
    if(ppAtual <= 0){ return; }
    if(efet === 0 && poder > 0) return;
    score += poder * efet;
    if(efet > 1) score *= 1.5;
    if(mv.classe === 'status' || poder === 0){
      if(inimigo.hpAtual > inimigo._hpMax * 0.5 && !meu.status){
        score = 30;
      }else{
        score = -50;
      }
    }
    if(meu.hpAtual < meu._hpMax * 0.30 && poder > 0) score *= 1.3;
    if(mv.tipo === inimigo.tipo && poder > 0) score *= 1.5;
    if(inimigo.hpAtual < inimigo._hpMax * 0.30 && mv.precisao < 90) score *= 0.7;

    // IA Adaptativa: se o jogador usa muito um tipo, a IA prioriza counters
    if(_iaAdaptativa && typeof _iaHistoricoBatalhas !== 'undefined'){
      var tipoMaisUsado = null;
      var tiposCount = {};
      _iaHistoricoBatalhas.forEach(function(b){
        if(b.tipo) tiposCount[b.tipo] = (tiposCount[b.tipo] || 0) + 1;
      });
      var maxCount = 0;
      Object.keys(tiposCount).forEach(function(t){
        if(tiposCount[t] > maxCount){ maxCount = tiposCount[t]; tipoMaisUsado = t; }
      });
      if(tipoMaisUsado && getEfetividade(mv.tipo, tipoMaisUsado) > 1){
        score *= 1.4;
      }
    }

    if(score > melhorScore){ melhorScore = score; melhor = mv; }
  });
  
  if(melhor) return melhor;
  return moves.reduce(function(a, b){
    var efetA = getEfetividade(a.tipo, meu.tipo);
    var efetB = getEfetividade(b.tipo, meu.tipo);
    return ((b.poder || 0) * (efetB || 1)) > ((a.poder || 0) * (efetA || 1)) ? b : a;
  });
}

function aplicarEfeitosPosTurno(){
  if(!_batalha) return;
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  [meu, inimigo].forEach(function(p){
    if(!p || p.hpAtual <= 0) return;
    if(p.status === 'PSN'){
      var dmg = Math.floor(p._hpMax / 8);
      p.hpAtual = Math.max(0, p.hpAtual - dmg);
    }else if(p.status === 'BRN'){
      var dmg2 = Math.floor(p._hpMax / 16);
      p.hpAtual = Math.max(0, p.hpAtual - dmg2);
    }else if(p.status === 'TXC'){
      p.statusTurnos = (p.statusTurnos || 0) + 1;
      var dmgT = Math.floor(p._hpMax * p.statusTurnos / 16);
      p.hpAtual = Math.max(0, p.hpAtual - dmgT);
    }
    if(p.itemEquipado === 'Leftovers' && p.hpAtual > 0 && p.hpAtual < p._hpMax){
      var regen = Math.floor(p._hpMax * 0.06);
      p.hpAtual = Math.min(p._hpMax, p.hpAtual + regen);
    }
  });
  atualizarBarraHP('jogador', meu);
  atualizarBarraHP('inimigo', inimigo);
  setTimeout(function(){
    if(inimigo.hpAtual <= 0){ inimigoDesmaiou(); return; }
    if(meu.hpAtual <= 0){ meuDesmaiou(); return; }
    _batalha.bloqueado = false;
    renderMenuBatalha();
  }, 700);
}

// =============== DESMAIOS ===============
function inimigoDesmaiou(){
  if(!_batalha) return;
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  var sprite = document.getElementById('sprite-inimigo');
  if(sprite) sprite.style.opacity = '0.3';
  addLog(inimigo.nome + ' desmaiou!');
  var proximo = null;
  for(var i = _batalha.indiceInimigo + 1; i < _batalha.timeInimigo.length; i++){
    if(_batalha.timeInimigo[i].hpAtual > 0){
      proximo = _batalha.timeInimigo[i]; _batalha.indiceInimigo = i; break;
    }
  }
  if(proximo){
    setTimeout(function(){
      addLog((_batalha.treinador ? _batalha.treinador.nome + ' enviou ' : '') + proximo.nome + '!');
      if(sprite) sprite.style.opacity = '1';
      aplicarHabilidadeEntrada(proximo, _batalha.meuTime[_batalha.indiceMeu]);
      renderBatalha();
      _batalha.bloqueado = false;
      renderMenuBatalha();
    }, 1500);
  }else{
    setTimeout(function(){ vitoriaBatalha(); }, 1500);
  }
}
function meuDesmaiou(){
  if(!_batalha) return;
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var sprite = document.getElementById('sprite-jogador');
  if(sprite) sprite.style.opacity = '0.3';
  addLog(meu.nome + ' desmaiou!');
  meu.hpAtual = 0;
  meu.status = null;
  var proximo = null;
  for(var i = 0; i < _batalha.meuTime.length; i++){
    if(_batalha.meuTime[i].hpAtual > 0){ proximo = _batalha.meuTime[i]; _batalha.indiceMeu = i; break; }
  }
  if(proximo){
    setTimeout(function(){
      addLog('Vá, ' + proximo.nome + '!');
      if(sprite) sprite.style.opacity = '1';
      aplicarHabilidadeEntrada(proximo, _batalha.timeInimigo[_batalha.indiceInimigo]);
      renderBatalha();
      _batalha.bloqueado = false;
      renderMenuBatalha();
    }, 1500);
  }else{
    setTimeout(function(){ perderBatalha(false); }, 1500);
  }
}

// =============== TROCAR POKÉMON ===============
function trocarPokemonBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  var popup = document.getElementById('popup-batalha-trocar');
  var grid = document.getElementById('popup-trocar-grid');
  if(!popup || !grid) return;
  grid.innerHTML = '';
  _batalha.meuTime.forEach(function(p, i){
    if(!p || i === _batalha.indiceMeu) return;
    var desmaiado = p.hpAtual <= 0;
    var div = document.createElement('div');
    div.className = 'popup-item';
    if(desmaiado) div.style.opacity = '0.4';
    div.innerHTML = '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="popup-info"><div class="popup-nome">' + p.nome + '</div>' +
      '<div class="popup-sub">Lvl ' + p.lvl + ' · HP ' + p.hpAtual + '/' + p._hpMax + (desmaiado ? ' (Desmaiado)' : '') + '</div></div>';
    if(!desmaiado){
      div.onclick = function(){ fecharPopupBatalha('trocar'); executarTrocaBatalha(i); };
    }
    grid.appendChild(div);
  });
  popup.classList.add('aberto');
}
function fecharPopupBatalha(tipo){
  var id = tipo === 'itens' ? 'popup-batalha-itens' : 'popup-batalha-trocar';
  var el = document.getElementById(id);
  if(el) el.classList.remove('aberto');
}
function executarTrocaBatalha(idx){
  if(!_batalha) return;
  _batalha.indiceMeu = idx;
  var p = _batalha.meuTime[idx];
  addLog('Vá, ' + p.nome + '!');
  aplicarHabilidadeEntrada(p, _batalha.timeInimigo[_batalha.indiceInimigo]);
  _batalha.bloqueado = true;
  renderBatalha();
  setTimeout(function(){ turnoInimigo(); }, 1200);
}

// =============== ITENS EM BATALHA ===============
function usarItemBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  var popup = document.getElementById('popup-batalha-itens');
  var grid = document.getElementById('popup-itens-grid');
  if(!popup || !grid) return;
  var itens = Object.keys(jogador.itens).filter(function(k){
    var v = jogador.itens[k];
    if(v <= 0) return false;
    if(LISTA_POKEBOLAS && LISTA_POKEBOLAS.find(function(b){ return b.nome === k; })) return false;
    if(k.indexOf('TM_') === 0) return false;
    if(typeof v === 'object' && v.usos !== undefined) return false;
    return true;
  });
  grid.innerHTML = '';
  if(itens.length === 0){
    grid.innerHTML = '<p style="color:#888;font-size:9px;text-align:center;padding:20px;grid-column:1/-1;">Sem itens.</p>';
  }else{
    itens.forEach(function(nome){
      var img = typeof imagemItem === 'function' ? imagemItem(nome) : null;
      var div = document.createElement('div');
      div.className = 'popup-item';
      var imgTag = img ? '<img src="' + img + '" onerror="this.style.display=\'none\'">' : '<i class="fas ' + iconeItem(nome) + '" style="font-size:32px;color:var(--acento-amarelo);"></i>';
      div.innerHTML = imgTag + '<div class="popup-info"><div class="popup-nome">' + nome + '</div><div class="popup-sub">x' + jogador.itens[nome] + '</div></div>';
      div.onclick = function(){ fecharPopupBatalha('itens'); aplicarItemBatalha(nome); };
      grid.appendChild(div);
    });
  }
  popup.classList.add('aberto');
}
function aplicarItemBatalha(nome){
  if(!_batalha) return;
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  if(!meu) return;
  if(!jogador.itens[nome] || jogador.itens[nome] <= 0) return;
  var cura = 0;
  if(nome === 'Poção') cura = 30;
  else if(nome === 'Super Poção') cura = 60;
  else if(nome === 'Hiper Poção') cura = 100;
  else if(nome === 'Poção Máxima' || nome === 'Restaurador Total') cura = 9999;
  else if(nome === 'Mel Doce') cura = 40;
  else if(nome === 'Jumbo Sorvete') cura = 80;
  else if(nome === 'Oran Berry') cura = 10;
  else if(nome === 'Sitrus Berry') cura = 25;
  if(cura > 0){
    meu.hpAtual = Math.min(meu._hpMax, meu.hpAtual + cura);
    jogador.itens[nome]--;
    if(jogador.itens[nome] <= 0) delete jogador.itens[nome];
    addLog('Usou ' + nome + '! ' + meu.nome + ' recuperou HP.');
    atualizarBarraHP('jogador', meu);
    AudioSFX.cura();
    _batalha.bloqueado = true;
    setTimeout(function(){ turnoInimigo(); }, 1000);
    return;
  }
  if(nome === 'Antídoto' || nome === 'Full Heal' || nome === 'Restaurador Total'){ meu.status = null; }
  jogador.itens[nome]--;
  if(jogador.itens[nome] <= 0) delete jogador.itens[nome];
  AudioSFX.cura();
  renderStatus('jogador', meu);
  atualizarAuraStatus('jogador', meu);
  _batalha.bloqueado = true;
  setTimeout(function(){ turnoInimigo(); }, 1000);
}

// =============== FUGIR ===============
function tentarFugir(){
  if(!_batalha || _batalha.bloqueado) return;
  if(_batalha.tipo === 'treinador'){
    if(!confirm('Desistir? Será derrota.')) return;
    perderBatalha(false);
    return;
  }
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  var velMeu = (meu._stats || calcularStatsCompletos(meu, meu.baseStats)).spe;
  var velIni = (inimigo._stats || calcularStatsCompletos(inimigo, inimigo.baseStats)).spe;
  var chance = Math.max(0.2, Math.min(0.95, 0.5 + (velMeu - velIni) * 0.01));
  if(Math.random() < chance){
    addLog('Você fugiu!');
    AudioSFX.somFuga();
    setTimeout(function(){ fecharTelaBatalha(); if(typeof atualizarTudo === 'function') atualizarTudo(); }, 1200);
  }else{
    addLog('Não conseguiu fugir!');
    _batalha.bloqueado = true;
    setTimeout(function(){ turnoInimigo(); }, 1000);
  }
}

// =============== TRANSFORMAÇÕES ===============
function megaEvoluirEmBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  var idx = _batalha.indiceMeu;
  if(typeof megaEvoluir === 'function') megaEvoluir(idx);
  _batalha.bloqueado = true;
  setTimeout(function(){ renderBatalha(); _batalha.bloqueado = false; renderMenuBatalha(); turnoInimigo(); }, 1500);
}
function ativarGigantamaxEmBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  var idx = _batalha.indiceMeu;
  if(typeof ativarGigantamax === 'function') ativarGigantamax(idx);
  _batalha.bloqueado = true;
  setTimeout(function(){ renderBatalha(); _batalha.bloqueado = false; renderMenuBatalha(); turnoInimigo(); }, 1800);
}
function desfazerMegaEmBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  if(typeof desfazerMega === 'function') desfazerMega(_batalha.indiceMeu);
  renderBatalha();
  renderMenuBatalha();
}
function desfazerGmaxEmBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  if(typeof desfazerGigantamax === 'function') desfazerGigantamax(_batalha.indiceMeu);
  renderBatalha();
  renderMenuBatalha();
}

// =============== CAPTURA ===============
function calcularMultiplicadorBola(bola, pokemon, contexto){
  var mult = bola.mult || 1.0;
  var efeito = bola.efeito;
  if(!efeito) return mult;
  var ctx = contexto || {};
  var tipos = Array.isArray(pokemon.tipos) ? pokemon.tipos : [pokemon.tipo];
  
  switch(efeito){
    case 'dusk':
      if(ctx.bioma === 'cave' || ctx.bioma === 'nightGround' || ctx.bioma === 'deepCave' || 
         ctx.bioma === 'redCave' || ctx.bioma === 'crystalCave' || ctx.noturno){
        mult = 3.5;
      }
      break;
    case 'net':
      if(tipos.indexOf('water') !== -1 || tipos.indexOf('bug') !== -1) mult = 3.5;
      break;
    case 'dive':
      if(tipos.indexOf('water') !== -1 || tipos.indexOf('ice') !== -1 || 
         tipos.indexOf('dragon') !== -1 || ctx.bioma === 'underwater') mult = 3.5;
      break;
    case 'nest':
      mult = Math.max(1, (41 - (pokemon.lvl || 1)) / 10);
      break;
    case 'repeat':
      if(jogador.pokedex && jogador.pokedex[pokemon.id] && jogador.pokedex[pokemon.id].capturado){
        mult = 3.5;
      }
      break;
    case 'timer':
      mult = Math.min(4, 1 + ((_batalha && _batalha.turno) || 0) * 0.3);
      break;
    case 'quick':
      if(((_batalha && _batalha.turno) || 0) <= 1) mult = 5;
      break;
    case 'luxury':
    case 'friend':
      mult = 1.0;
      break;
    case 'love':
      var eu = _batalha && _batalha.meuTime[_batalha.indiceMeu];
      if(eu && eu.sexo && pokemon.sexo && eu.sexo !== pokemon.sexo && eu.sexo !== 'N' && pokemon.sexo !== 'N'){
        mult = 8;
      }
      break;
    case 'moon':
      var evoluiComLua = ['Clefairy','Jigglypuff','Skitty','Munna','Nidorina','Nidorino','Cleffa','Igglybuff','Eevee'];
      if(evoluiComLua.indexOf(pokemon.nome) !== -1) mult = 4;
      break;
    case 'lure':
      if(ctx.pescado) mult = 4;
      break;
    case 'level':
      var meuPoke = _batalha && _batalha.meuTime[_batalha.indiceMeu];
      if(meuPoke){
        var diff = pokemon.lvl - meuPoke.lvl;
        if(diff >= 30) mult = 1;
        else if(diff >= 20) mult = 2;
        else if(diff >= 10) mult = 3;
        else mult = 4;
      }
      break;
    case 'heavy':
      var peso = pokemon.peso || 100;
      if(peso >= 3000) mult = 0.8;
      else if(peso >= 2000) mult = 1.2;
      else if(peso <= 100) mult = 1.4;
      break;
    case 'fast':
      if(pokemon.baseStats && pokemon.baseStats.spe >= 100) mult = 4;
      break;
    case 'dream':
      if(pokemon.status === 'SLP') mult = 4;
      break;
    case 'beast':
      var isUB = ULTRA_BEASTS && ULTRA_BEASTS.indexOf(pokemon.nome) !== -1 || pokemon.isUltraBeast;
      if(isUB){
        mult = (ctx.bioma === 'astral') ? 4 : 5;
      }else{
        mult = 0.1;
      }
      break;
  }
  return mult;
}
function calcularChanceCaptura(pokemon, bola, contexto){
  var hpMax = pokemon._hpMax || 100;
  var hpAtual = Math.max(1, pokemon.hpAtual || 1);
  var taxaBase = 45;
  if(pokemon.isLendario) taxaBase = 3;
  else if(pokemon.isUltraBeast) taxaBase = 30;
  else if(pokemon.raridade === 'GX' || pokemon.raridade === 'EX') taxaBase = 45;
  if(pokemon.taxaCaptura) taxaBase = pokemon.taxaCaptura;
  
  var statusBonus = 1;
  if(pokemon.status === 'SLP' || pokemon.status === 'FRZ') statusBonus = 2.0;
  else if(pokemon.status === 'PAR' || pokemon.status === 'PSN' || pokemon.status === 'BRN') statusBonus = 1.5;
  
  var bolaMult = calcularMultiplicadorBola(bola, pokemon, contexto);
  if(bola.garantida) return 1.0;
  
  var a = ((3 * hpMax - 2 * hpAtual) * taxaBase * bolaMult * statusBonus) / (3 * hpMax);
  
  if(a >= 255) return 1.0;
  var b = 65536 / Math.pow(255 / a, 0.25);
  return Math.min(1.0, b / 65536);
}
async function tentarCapturaBatalha(){
  if(!_batalha || _batalha.bloqueado) return;
  if(_batalha.tipo !== 'selvagem'){
    AudioSFX.erro();
    alert('Não pode capturar Pokémon de treinadores!');
    return;
  }
  var itens = LISTA_POKEBOLAS.filter(function(b){ return jogador.itens[b.nome] && jogador.itens[b.nome] > 0; });
  if(itens.length === 0){ AudioSFX.erro(); alert('Você não tem Pokébolas!'); return; }
  var popup = document.getElementById('popup-batalha-itens');
  var grid = document.getElementById('popup-itens-grid');
  if(!popup || !grid) return;
  grid.innerHTML = '';
  itens.forEach(function(bola){
    var div = document.createElement('div');
    div.className = 'popup-item';
    div.innerHTML = '<img src="' + bola.img + '" onerror="this.style.display=\'none\'">' +
      '<div class="popup-info"><div class="popup-nome">' + bola.nome + '</div>' +
      '<div class="popup-sub">x' + jogador.itens[bola.nome] + ' · ' + bola.desc + '</div></div>';
    div.onclick = function(){ 
      AudioSFX.clickBatalha();
      fecharPopupBatalha('itens'); 
      executarCapturaBatalha(bola.nome); 
    };
    grid.appendChild(div);
  });
  popup.classList.add('aberto');
}
async function executarCapturaBatalha(nomeBola){
  var bolaInfo = LISTA_POKEBOLAS.find(function(b){ return b.nome === nomeBola; });
  if(!bolaInfo) return;
  var inimigo = _batalha.timeInimigo[_batalha.indiceInimigo];
  if(!jogador.itens[nomeBola] || jogador.itens[nomeBola] <= 0){ AudioSFX.erro(); return; }
  
  var contexto = {
    bioma:_batalha.rota ? _batalha.rota.bg : 'grass',
    noturno:_batalha.rota && (_batalha.rota.bg === 'nightGround' || ehNoite()),
    pescado:false
  };
  
  var chance = calcularChanceCaptura(inimigo, bolaInfo, contexto);
  var critica = Math.random() < CHANCE_CRITICA;
  var capturou = Math.random() < chance;
  if(critica){
    capturou = true;
    chance = 1.0;
  }

  await mostrarAnimacaoCapturaBatalha(inimigo, bolaInfo, capturou, critica, chance);

  if(capturou){
    if(!critica){
      jogador.itens[nomeBola]--;
      if(jogador.itens[nomeBola] <= 0) delete jogador.itens[nomeBola];
    }
    await finalizarCapturaBatalha(inimigo, nomeBola, critica);
  }else{
    jogador.itens[nomeBola]--;
    if(jogador.itens[nomeBola] <= 0) delete jogador.itens[nomeBola];
    addLog('Ah! O ' + inimigo.nome + ' escapou!');
    _batalha.bloqueado = true;
    setTimeout(function(){ turnoInimigo(); }, 1200);
  }
}
async function finalizarCapturaBatalha(inimigo, nomeBola, critica){
  var slotVazio = jogador.time.indexOf(null);
  var novoP = {
    id:inimigo.id, nome:inimigo.nome, lvl:inimigo.lvl, batalhas:0, bg:0, bp:0,
    tipo:inimigo.tipo, baseStats:inimigo.baseStats || await carregarBaseStats(inimigo.id),
    favorito:false, regiaoOrigem:(_batalha && _batalha.regiao) ? _batalha.regiao : 'Kanto',
    notas:'', capturadoEm:new Date().toISOString(),
    amizade:0, batalhasSemUso:0, trocado:false, itemEquipado:null,
    raridade:'normal', forma:inimigo.forma || '', idForma:inimigo.idForma || null,
    mega:false, megaForma:null, nomeMega:null, gigantamax:false, idGmax:null,
    permanente:false, permanenteMega:false,
    shiny:inimigo.shiny === true,
    sexo:inimigo.sexo || sortearSexo(inimigo.nome),
    natureza:sortearNatureza(),
    hpAtual:null, status:null, statusTurnos:0,
    moves:inimigo.moves || null,
    habilidade:sortearHabilidade(inimigo.tipo),
    boosts:{}, boostPermanente:{atk:1, def:1, spa:1, spd:1, spe:1},
    apelido:''
  };
  var bolaInfo = LISTA_POKEBOLAS.find(function(b){ return b.nome === nomeBola; });
  if(bolaInfo && (bolaInfo.efeito === 'luxury' || bolaInfo.efeito === 'friend')){
    novoP.amizade = 200;
  }
  if(bolaInfo && bolaInfo.efeito === 'heal'){
    novoP.hpAtual = null;
  }
  if(slotVazio !== -1) jogador.time[slotVazio] = novoP;
  else jogador.banco.push(novoP);
  var isUB = ULTRA_BEASTS && ULTRA_BEASTS.indexOf(novoP.nome) !== -1;
  if(typeof marcarPokedex === 'function') marcarPokedex(novoP.id, true, novoP.shiny, isUB);
  if(inimigo.isLendario) jogador.lendariosCapturados[inimigo.id] = true;
  if(isUB){
    if(!jogador.ultraBeastsCapturados) jogador.ultraBeastsCapturados = {};
    jogador.ultraBeastsCapturados[inimigo.id] = true;
  }
  jogador.capturas.unshift({
    nome:novoP.nome, bola:nomeBola,
    bolaSlug:nomeBola.toLowerCase().replace(/\s+/g, '-'),
    critica:critica, regiao:novoP.regiaoOrigem, raridade:'normal',
    forma:novoP.forma, sexo:novoP.sexo, shiny:novoP.shiny, id:Date.now(),
    modo:_batalha ? 'digital' : 'hibrido',
    rota:_batalha && _batalha.rota ? _batalha.rota.nome : null
  });
  jogador.nCapturasDigitais = (jogador.nCapturasDigitais || 0) + 1;
  if(novoP.shiny) jogador.shiniesCapturados = (jogador.shiniesCapturados || 0) + 1;
  if(isUB) jogador.ultraBeastsCapturados = (jogador.ultraBeastsCapturados || 0) + 1;
  var xpQtd = XP_ACOES.captura;
  if(inimigo.isLendario) xpQtd = XP_ACOES.captura_lendario;
  if(isUB) xpQtd = XP_ACOES.captura_mega_gmax;
  if(novoP.shiny) xpQtd += 100;
  darXP(xpQtd, 'Captura: ' + novoP.nome);
  registrarContador('capturas');
  salvar();
  addLog(novoP.nome + (novoP.shiny ? ' SHINY' : '') + ' foi capturado!');
  var eraDuelo = _batalha && _batalha.isDuelo === true;
  var vencedorDuelo = _batalha && _batalha.vencedorDuelo;
  setTimeout(function(){
    var pc = inimigo.isLendario ? 50 : (isUB ? 40 : 2);
    if(novoP.shiny) pc += 20;
    jogador.pc += pc;
    salvar();
    if(typeof atualizarStatus === 'function') atualizarStatus();
    var msg = 'Captura!\n\n' + novoP.nome + ' (Lvl ' + novoP.lvl + ')' + (novoP.shiny ? '\n✨ SHINY ✨' : '') + (isUB ? '\n🌟 ULTRA BEAST!' : '') + '\n+PC: ' + pc;
    alert(msg);
    fecharTelaBatalha();
    if(typeof verificarTodasEvolucoes === 'function') verificarTodasEvolucoes();
    if(typeof atualizarTudo === 'function') atualizarTudo();
    if(eraDuelo && vencedorDuelo && typeof finalizarDueloDigital === 'function') setTimeout(function(){ finalizarDueloDigital(vencedorDuelo); }, 500);
  }, 1000);
}
async function mostrarAnimacaoCapturaBatalha(inimigo, bola, capturou, critica, chance){
  try{
    var overlay = document.getElementById('overlay-animacao');
    var img = document.getElementById('overlay-img');
    var pokebola = document.getElementById('overlay-pokebola');
    var titulo = document.getElementById('overlay-titulo');
    if(!overlay || !img) return;
    _batalha.bloqueado = true;
    img.src = spritePokemonAtual(inimigo);
    img.style.opacity = '1';
    img.className = '';
    pokebola.src = bola.img;
    pokebola.style.display = 'none';
    titulo.textContent = 'Você jogou uma ' + bola.nome + '!';
    overlay.classList.add('ativo');
    await new Promise(function(r){ setTimeout(r, 800); });
    pokebola.style.display = 'block';
    pokebola.classList.add('anim-pokebola-chega');
    AudioSFX.somPokebolaAbre();
    await new Promise(function(r){ setTimeout(r, 700); });
    pokebola.classList.remove('anim-pokebola-chega');
    AudioSFX.somSucao();
    img.classList.add('anim-succao');
    await new Promise(function(r){ setTimeout(r, 600); });
    pokebola.classList.add('anim-pokebola-chao');
    await new Promise(function(r){ setTimeout(r, 800); });
    pokebola.classList.remove('anim-pokebola-chao');
    var balancos = capturou ? 3 : Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1));
    pokebola.classList.add('anim-pokebola-balanco');
    for(var i = 0; i < balancos; i++){
      AudioSFX.somBalanco();
      await new Promise(function(r){ setTimeout(r, 600); });
    }
    pokebola.classList.remove('anim-pokebola-balanco');
    if(capturou){
      AudioSFX.somCapturaFinal();
      titulo.textContent = critica ? 'CAPTURA CRÍTICA!' : inimigo.nome + ' foi capturado!';
      await new Promise(function(r){ setTimeout(r, 1500); });
    }else{
      AudioSFX.erro();
      img.classList.remove('anim-succao');
      img.style.opacity = '1';
      img.className = '';
      titulo.textContent = 'Ah! O ' + inimigo.nome + ' escapou!';
      await new Promise(function(r){ setTimeout(r, 1500); });
    }
    overlay.classList.remove('ativo');
    img.className = '';
    pokebola.style.display = 'none';
  }catch(e){
    var ov = document.getElementById('overlay-animacao');
    if(ov) ov.classList.remove('ativo');
  }
}

// =============== VITÓRIA / DERROTA ===============
function vitoriaBatalha(){
  if(!_batalha) return;
  addLog('Você venceu!');
  var meu = _batalha.meuTime[_batalha.indiceMeu];
  var pc = 0, pass = 0, xp = XP_ACOES.vitoria_digital;
  var xpRota = 0;
  if(_batalha.rota && !_batalha.rota.lendario) xpRota = _batalha.rota.maxLvl * 10;
  var isLendario = _batalha.rota && _batalha.rota.lendario;
  var isUB = _batalha.timeInimigo[0] && ULTRA_BEASTS && ULTRA_BEASTS.indexOf(_batalha.timeInimigo[0].nome) !== -1;
  var isRocket = _batalha.isRocket === true;

  if(_batalha.tipo === 'selvagem'){
    if(isLendario){ pc = _batalha.timeInimigo[0].lvl; xp += XP_ACOES.vitoria_lendario; }
    else if(isUB){ pc = _batalha.timeInimigo[0].lvl; xp += XP_ACOES.vitoria_ultrabeast; }
    else { pc = 2; }
  }else if(_batalha.treinador){
    pc = _batalha.treinador.recompensa.pc || 5;
    pass = _batalha.treinador.recompensa.pass || 0.5;
  }
  xp += xpRota;
  if(isLendario || isUB){ pc += 30; }

  // ===== RECOMPENSA EQUIPE ROCKET =====
  if(isRocket && _batalha.membroRocket){
    var m = _batalha.membroRocket;
    xp += m.xpMult * XP_ACOES.vitoria_batalha;
    pc = m.pc;
    jogador.rocketDerrotados = (jogador.rocketDerrotados || 0) + 1;
    if(m.tipo === 'Chefe') jogador.rocketChefesDerrotados = (jogador.rocketChefesDerrotados || 0) + 1;
    // Item garantido
    if(m.item){
      jogador.itens[m.item] = (jogador.itens[m.item] || 0) + 1;
    }
    // Chance de Chave Rocket
    if(Math.random() < m.chaveChance){
      jogador.itens['Chave Rocket'] = (jogador.itens['Chave Rocket'] || 0) + 1;
      jogador.chavesRocket = (jogador.chavesRocket || 0) + 1;
      setTimeout(function(){
        mostrarToastNotificacao('🔑 CHAVE ROCKET!', 'Você pode abrir a base secreta!');
      }, 2000);
      AudioSFX.conquista();
    }
    // Registra no histórico
    if(!jogador.rocketHistorico) jogador.rocketHistorico = [];
    jogador.rocketHistorico.unshift({
      id:Date.now(), tipo:m.tipo, nome:m.nome, resultado:'Ganhou',
      regiao:_batalha.regiao, data:new Date().toISOString()
    });
    AudioSFX.rocketDerrotada();
  }

  jogador.pc += pc;
  jogador.passaportes += pass;
  jogador.bg = (jogador.bg || 0) + 1;
  jogador.nBatalhasDigitais = (jogador.nBatalhasDigitais || 0) + 1;
  if(isLendario) jogador.lendariosDerrotados = (jogador.lendariosDerrotados || 0) + 1;
  
  darXP(xp, isLendario ? 'Lendário derrotado!' : (isUB ? 'Ultra Beast derrotada!' : (isRocket ? 'Rocket derrotado!' : 'Vitória Digital')));
  
  if(meu){
    var nivelAntes = meu.lvl;
    meu.batalhas++;
    meu.bg++;
    meu.lvl++;
    if(meu.moves) meu.moves.forEach(function(mv){ mv.ppAtual = mv.pp; });
    meu.status = null;
    meu.statusTurnos = 0;
    if(typeof adicionarAmizade === 'function') adicionarAmizade(meu, AMIZADE_POR_BATALHA);
    if(typeof tentarAprenderMoveAoSubirNivel === 'function') tentarAprenderMoveAoSubirNivel(meu, nivelAntes, meu.lvl);
  }
  if(_batalha.rota && _batalha.rota.id){
    if(!jogador.rotasCompletadas[_batalha.rota.id]) jogador.rotasCompletadas[_batalha.rota.id] = 0;
    jogador.rotasCompletadas[_batalha.rota.id]++;
  }
  var regiaoNome = _batalha.regiao || 'Digital';
  jogador.historico.unshift({
    regiao:regiaoNome, resultado:'Ganhou',
    tipo:isRocket ? 'Equipe Rocket' : (isLendario ? 'Lendário' : (isUB ? 'Ultra Beast' : (_batalha.tipo === 'treinador' ? 'Amador' : 'Selvagem'))),
    pokemon:meu ? meu.nome : '-', id:Date.now(), modo:'digital',
    rota:_batalha.rota ? _batalha.rota.nome : null, xpGanho:xp
  });
  registrarContador('batalhas');
  var eraCopa = _copaPendente !== null;
  var eraGinasio = _ginasioPendente !== null;
  var eraDuelo = _batalha.isDuelo === true;
  var vencedorDuelo = _batalha.vencedorDuelo;
  salvar();
  
  // Incrementa contadores de intervalo (v23)
  incrementarContadoresIntervalo();
  
  setTimeout(function(){
    var meu2 = _batalha ? _batalha.meuTime[_batalha.indiceMeu] : null;
    mostrarOverlayVitoria(meu2);
    setTimeout(function(){
      var msg = 'Vitória!\n\n+' + xp + ' XP\n+' + pc + ' PC' + (pass > 0 ? '\n' + pass + ' Passaporte' : '');
      if(xpRota > 0) msg += '\n\nRota completada (+' + xpRota + ' XP)';
      if(isRocket) msg += '\n\n🚨 Equipe Rocket derrotada!';
      alert(msg);
      fecharTelaBatalha();
      if(typeof verificarTodasEvolucoes === 'function') verificarTodasEvolucoes();
      if(typeof atualizarTudo === 'function') atualizarTudo();
      if(eraCopa && typeof iniciarBatalhaDigitalCopaCallback === 'function') setTimeout(function(){ iniciarBatalhaDigitalCopaCallback(true); }, 500);
      if(eraGinasio && typeof callbackBatalhaGinasio === 'function') setTimeout(function(){ callbackBatalhaGinasio(true); }, 500);
      if(eraDuelo && vencedorDuelo && typeof finalizarDueloDigital === 'function') setTimeout(function(){ finalizarDueloDigital(vencedorDuelo); }, 500);
      // Notifica servidor multiplayer
      if(_mpSocket && _mpConectado){
        _mpSocket.emit('vitoria-batalha', {tipo:_batalha.tipo, xp:xp});
      }
    }, 1900);
  }, 500);
}
function perderBatalha(saiu){
  if(!_batalha) return;
  var treinadorNome = _batalha.tipo === 'treinador' ? _batalha.treinador.nome : null;
  var eraCopa = _copaPendente !== null;
  var eraGinasio = _ginasioPendente !== null;
  var eraDuelo = _batalha.isDuelo === true;
  var vencedorDuelo = _batalha.vencedorDuelo;
  var isRocket = _batalha.isRocket === true;

  jogador.bp = (jogador.bp || 0) + 1;
  _batalha.meuTime.forEach(function(p){
    if(p && p.hpAtual <= 0){
      p.bp++;
      p.batalhas++;
      p.hpAtual = 0;
      p.status = null;
    }
  });
  var regiaoNome = _batalha.regiao || 'Digital';
  var meuMVP = _batalha.meuTime[_batalha.indiceMeu];
  jogador.historico.unshift({
    regiao:regiaoNome, resultado:'Perdeu',
    tipo:isRocket ? 'Equipe Rocket' : ((_batalha.rota && _batalha.rota.lendario) ? 'Lendário' : (_batalha.tipo === 'treinador' ? 'Amador' : 'Selvagem')),
    pokemon:meuMVP ? meuMVP.nome : '-', id:Date.now(), modo:'digital', xpGanho:0
  });
  if(isRocket && _batalha.membroRocket){
    if(!jogador.rocketHistorico) jogador.rocketHistorico = [];
    jogador.rocketHistorico.unshift({
      id:Date.now(), tipo:_batalha.membroRocket.tipo, nome:_batalha.membroRocket.nome,
      resultado:'Perdeu', regiao:_batalha.regiao, data:new Date().toISOString()
    });
  }
  salvar();
  incrementarContadoresIntervalo();
  setTimeout(function(){
    alert(saiu ? 'Você saiu da batalha.' : ('Você perdeu!' + (treinadorNome ? '\n\n' + treinadorNome + ' venceu.' : '')));
    fecharTelaBatalha();
    if(typeof atualizarTudo === 'function') atualizarTudo();
    if(eraCopa && typeof iniciarBatalhaDigitalCopaCallback === 'function') setTimeout(function(){ iniciarBatalhaDigitalCopaCallback(false); }, 500);
    if(eraGinasio && typeof callbackBatalhaGinasio === 'function') setTimeout(function(){ callbackBatalhaGinasio(false); }, 500);
    if(eraDuelo && vencedorDuelo && typeof finalizarDueloDigital === 'function') setTimeout(function(){ finalizarDueloDigital(vencedorDuelo === 1 ? 2 : 1); }, 500);
  }, 700);
}
function mostrarOverlayVitoria(meu){
  var overlay = document.getElementById('vitoria-overlay');
  var sprite = document.getElementById('sprite-vitoria');
  var texto = document.getElementById('texto-vitoria');
  if(!overlay || !sprite) return;
  if(meu){
    sprite.src = spritePokemonAtual(meu);
    sprite.onerror = function(){ this.src = spritePokemon(meu.id); };
  }
  texto.textContent = 'VITORIA!';
  overlay.classList.add('ativo');
  setTimeout(function(){ overlay.classList.remove('ativo'); }, 2500);
}
function fecharTelaBatalha(){
  document.getElementById('tela-batalha').classList.remove('aberta');
  if(AudioSFX && AudioSFX.pararBatalhaTema) AudioSFX.pararBatalhaTema();
  var sj = document.getElementById('sprite-jogador');
  var si = document.getElementById('sprite-inimigo');
  if(sj) sj.style.opacity = '1';
  if(si) si.style.opacity = '1';
  _batalha = null;
}
function confirmarSairBatalha(){
  if(!_batalha){ fecharTelaBatalha(); return; }
  if(!confirm('Sair da batalha?')) return;
  perderBatalha(true);
}

// =============== EVOLUÇÃO INIMIGO POR NÍVEL ===============
async function evoluirInimigoPorNivel(pokemon){
  if(!pokemon) return pokemon;
  var nomeAtual = pokemon.nome;
  var tentativas = 0;
  while(tentativas < 3){
    tentativas++;
    var mapa = await buscarCadeiaEvolucao(nomeAtual);
    var slugAtual = nomeAtual.toLowerCase().replace(/\s+/g, '-');
    var proxima = mapa[slugAtual];
    if(!proxima) break;
    if(pokemon.lvl < proxima.nivel) break;
    try{
      var novo = await buscarPokemon(proxima.proximo);
      pokemon.id = novo.id;
      pokemon.nome = novo.nome;
      pokemon.tipo = novo.tipo;
      pokemon.baseStats = novo.baseStats || await carregarBaseStats(novo.id);
      nomeAtual = novo.nome;
    }catch(e){ break; }
  }
  return pokemon;
}
async function buscarCadeiaEvolucao(nomePokemon){
  var slug = nomePokemon.toLowerCase().replace(/\s+/g, '-');
  if(typeof CACHE_EVOLUCOES === 'undefined') window.CACHE_EVOLUCOES = {};
  if(CACHE_EVOLUCOES[slug]) return CACHE_EVOLUCOES[slug];
  try{
    var r = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + slug);
    if(!r.ok) throw new Error();
    var dados = await r.json();
    var evoR = await fetch(dados.evolution_chain.url);
    var evoDados = await evoR.json();
    var mapa = {};
    function percorrer(chain){
      var nomeAtual = chain.species.name;
      for(var i = 0; i < chain.evolves_to.length; i++){
        var evo = chain.evolves_to[i];
        var nivel = null;
        if(evo.evolution_details && evo.evolution_details[0]){
          var d = evo.evolution_details[0];
          if(d.min_level) nivel = d.min_level;
        }
        if(nivel !== null) mapa[nomeAtual] = {proximo:evo.species.name, nivel:nivel};
        percorrer(evo);
      }
    }
    percorrer(evoDados.chain);
    CACHE_EVOLUCOES[slug] = mapa;
    return mapa;
  }catch(e){ CACHE_EVOLUCOES[slug] = {}; return {}; }
}
async function buscarPokemon(nome){
  var slug = nome.toLowerCase().replace(/\s+/g, '-').replace(/[♀]/g, '-f').replace(/[♂]/g, '-m');
  if(typeof CACHE_API_POKEMON === 'undefined') window.CACHE_API_POKEMON = {};
  if(CACHE_API_POKEMON[slug]) return CACHE_API_POKEMON[slug];
  try{
    var r = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + slug);
    if(!r.ok) throw new Error('Não encontrado');
    var dados = await r.json();
    var id = dados.id;
    var nomeOficial = dados.name.charAt(0).toUpperCase() + dados.name.slice(1);
    var pokeR = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
    var pokeDados = await pokeR.json();
    var tipo = (pokeDados.types && pokeDados.types.length > 0) ? pokeDados.types[0].type.name : 'normal';
    var baseStats = {hp:60,atk:60,def:60,spa:60,spd:60,spe:60};
    if(pokeDados.stats){
      var map = {hp:'hp', attack:'atk', defense:'def', 'special-attack':'spa', 'special-defense':'spd', speed:'spe'};
      pokeDados.stats.forEach(function(s){
        var k = map[s.stat.name];
        if(k) baseStats[k] = s.base_stat;
      });
    }
    CACHE_BASE_STATS[id] = baseStats;
    var lvl = 1;
    try{
      var evo = await fetch(dados.evolution_chain.url);
      var evoDados = await evo.json();
      var res = calcularNivel(evoDados.chain, dados.name.toLowerCase(), 0);
      if(res !== null) lvl = res;
    }catch(e){}
    var result = {id:id, nome:nomeOficial, lvl:lvl, tipo:tipo, baseStats:baseStats, peso:pokeDados.weight || 100};
    CACHE_API_POKEMON[slug] = result;
    return result;
  }catch(e){
    var lista = (typeof LISTA_POKEMON_COMPLETA !== 'undefined') ? LISTA_POKEMON_COMPLETA : [];
    var idx = lista.indexOf(nome);
    var idFallback = idx !== -1 ? idx + 1 : 0;
    var res = {id:idFallback, nome:nome, lvl:1, tipo:'normal', baseStats:BASE_STATS_FALLBACK, peso:100};
    CACHE_API_POKEMON[slug] = res;
    return res;
  }
}
async function buscarPokemonPorId(id){
  try{
    var r = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
    if(!r.ok) return null;
    var pokeDados = await r.json();
    var tipo = (pokeDados.types && pokeDados.types.length > 0) ? pokeDados.types[0].type.name : 'normal';
    var baseStats = {hp:60,atk:60,def:60,spa:60,spd:60,spe:60};
    if(pokeDados.stats){
      var map = {hp:'hp', attack:'atk', defense:'def', 'special-attack':'spa', 'special-defense':'spd', speed:'spe'};
      pokeDados.stats.forEach(function(s){
        var k = map[s.stat.name];
        if(k) baseStats[k] = s.base_stat;
      });
    }
    CACHE_BASE_STATS[id] = baseStats;
    var nomeOficial = pokeDados.name.charAt(0).toUpperCase() + pokeDados.name.slice(1).replace(/-/g, ' ');
    return {id:id, nome:nomeOficial, tipo:tipo, baseStats:baseStats, peso:pokeDados.weight || 100};
  }catch(e){ return null; }
}
function calcularNivel(chain, nomeAlvo, nivelAnterior){
  if(chain.species.name === nomeAlvo) return nivelAnterior === 0 ? 1 : nivelAnterior;
  for(var i = 0; i < chain.evolves_to.length; i++){
    var evo = chain.evolves_to[i];
    var proximoNivel = nivelAnterior + 1;
    if(evo.evolution_details && evo.evolution_details[0]){
      var d = evo.evolution_details[0];
      if(d.min_level) proximoNivel = d.min_level;
      else proximoNivel = 30;
    }
    var res = calcularNivel(evo, nomeAlvo, proximoNivel);
    if(res !== null) return res;
  }
  return null;
}

// =============== SORTEAR SELVAGEM (COM ESTÁGIOS) ===============
function determinarEstagio(id){
  // Estágio 1, 2 ou 3 baseado em ID (aproximação)
  // Usamos uma lista pré-definida simplificada
  var ESTAGIO_3 = [3,6,9,12,15,18,20,22,24,26,28,31,34,36,38,40,45,47,49,51,53,55,57,59,62,65,68,71,73,76,78,80,82,85,87,89,91,94,97,99,101,103,105,107,109,110,112,113,115,117,119,121,122,123,124,125,126,127,128,130,131,132,134,135,136,137,139,141,142,143,144,145,146,149,150,151,154,157,160,162,164,166,168,169,171,176,178,180,181,182,184,185,186,189,192,193,195,196,197,199,201,202,203,205,206,208,210,211,212,213,214,217,219,220,221,222,224,225,226,227,228,229,230,232,233,234,237,239,240,241,242,243,244,245,247,248,249,250,251,254,257,260,262,264,267,269,272,275,277,279,282,284,286,289,291,292,295,297,299,301,302,303,305,306,308,310,311,312,313,314,317,319,321,323,324,326,327,328,329,330,332,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,389,392,395,398,400,402,405,407,409,411,413,414,416,417,419,421,423,424,426,428,429,430,432,435,437,441,442,444,445,448,450,452,454,455,457,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,500,503,505,508,510,512,514,516,518,521,523,526,528,530,534,537,539,542,545,547,549,553,555,558,560,563,565,567,569,571,573,576,579,581,584,586,589,591,593,596,598,601,604,606,609,612,614,617,620,623,625,628,630,632,634,635,637,639,640,641,642,643,644,645,646,647,648,649,652,655,658,660,663,666,668,671,673,675,678,681,683,685,687,689,691,693,695,697,699,700,701,702,703,704,705,706,707,709,711,713,715,716,717,718,719,720,721,724,727,730,733,735,738,740,743,745,746,748,750,752,754,756,758,760,762,763,765,766,768,770,771,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,812,815,818,820,823,826,828,830,832,834,836,839,841,842,844,845,847,849,851,853,855,858,861,863,865,867,869,871,873,875,877,879,881,882,883,884,887,889,890,892,893,895,896,897,898,899,900,901,902,903,904,905,908,911,914,916,918,920,923,925,927,930,934,936,937,939,941,943,945,947,949,952,954,956,959,961,964,966,968,970,972,975,977,979,981,983,985,987,989,990,992,994,996,998,1000,1002,1004,1006,1008,1010,1012,1014,1016,1018,1020,1022,1024];
  var idNum = parseInt(id) || 0;
  if(ESTAGIO_3.indexOf(idNum) !== -1) return 3;
  var ESTAGIO_2 = [2,5,8,11,14,17,19,21,23,25,27,30,33,35,37,39,42,44,46,48,50,52,54,56,58,61,64,67,70,72,75,77,79,81,84,86,88,90,93,96,98,100,102,104,108,111,114,116,118,120,129,133,138,140,147,148,152,153,155,156,158,159,161,163,165,167,170,172,173,174,175,177,179,183,187,188,190,191,194,198,200,204,207,209,215,216,218,223,231,236,238,246,247,252,253,255,256,258,259,261,263,265,266,268,270,271,273,274,276,278,280,281,283,285,287,288,290,293,294,296,298,300,304,305,307,309,315,316,318,320,322,325,328,329,331,333,339,341,343,345,347,349,353,355,361,363,366,371,372,374,375,387,388,390,391,393,394,396,397,399,400,401,402,403,404,406,408,410,412,415,418,420,422,425,427,431,433,434,436,438,439,440,443,444,446,447,449,451,453,456,458,459,461,465,467,469,471,472,473,475,476,477,478,489,490,495,496,498,499,501,502,504,506,507,509,511,513,515,517,519,520,522,524,525,527,529,532,533,535,536,538,540,541,543,544,546,548,550,551,552,554,556,557,559,561,562,564,566,568,570,572,574,575,577,578,580,582,583,585,587,588,590,592,594,595,597,599,600,602,603,605,607,608,610,611,613,615,616,618,619,621,622,624,626,627,629,631,633,636,650,651,653,654,656,657,659,661,662,664,665,667,669,670,672,674,675,677,679,680,682,684,686,688,690,692,694,696,698,708,710,712,714,722,723,725,726,728,729,731,732,734,736,737,739,741,742,744,747,749,751,753,755,757,759,761,767,769,772,782,783,790,793,794,795,796,797,798,799,803,804,805,806,807,808,809,810,811,813,814,816,817,819,821,822,824,825,827,829,831,833,835,837,838,840,843,846,848,850,852,854,856,857,859,860,862,864,866,868,870,872,874,876,878,880,883,885,886,888,891,894,909,910,912,913,915,917,919,921,922,924,926,928,929,931,932,933,935,938,940,942,944,946,948,950,951,953,955,957,958,960,962,963,965,967,969,971,973,974,976,978,980,982,984,986,988,991,993,995,997,999,1001,1003,1005,1007,1009,1011,1013,1015,1017,1019,1021,1023,1025];
  if(ESTAGIO_2.indexOf(idNum) !== -1) return 2;
  return 1;
}
function filtrarPorNivel(id, nivelRota){
  var estagio = determinarEstagio(id);
  var maxEstagio = nivelRota < 20 ? 1 : (nivelRota < 40 ? 2 : 3);
  return estagio <= maxEstagio;
}

async function sortearSelvagem(rota, regiaoNome){
  var tentativas = 0;
  var maxTentativas = 12;
  var biomaIds = POKEMON_POR_BIOMA[rota.bg] || POKEMON_POR_BIOMA.grass;
  biomaIds = biomaIds.filter(function(id){ return typeof id === 'number'; });
  var regiaoChave = regiaoNome || 'Kanto';
  var idsValidos = biomaIds.filter(function(id){
    return id >= 1 && id <= 1025 && idPermitidoNaRegiao(id, regiaoChave) && filtrarPorNivel(id, rota.minLvl);
  });
  if(idsValidos.length === 0){
    var permitidas = regioesPermitidas(regiaoChave);
    var gMin = GERACOES_POR_REGIAO[permitidas[0]].min;
    var gMax = GERACOES_POR_REGIAO[permitidas[permitidas.length - 1]].max;
    for(var k = gMin; k <= gMax && idsValidos.length < 50; k++){
      if(filtrarPorNivel(k, rota.minLvl)) idsValidos.push(k);
    }
  }
  idsValidos = Array.from(new Set(idsValidos));
  
  var totalRotas = (rota.numeroTotal) ? rota.numeroTotal : 18;
  var indiceRota = (rota.numero) ? rota.numero : 0;
  var chanceRaro = 0;
  if(indiceRota >= totalRotas - 3){
    chanceRaro = 0.4 + (indiceRota - (totalRotas - 3)) * 0.1;
  }
  
  while(tentativas < maxTentativas){
    tentativas++;
    var idEscolhido = idsValidos[Math.floor(Math.random() * idsValidos.length)];
    try{
      var info = await buscarPokemonPorId(idEscolhido);
      if(!info || !info.id) continue;
      var lvl = rota.minLvl + Math.floor(Math.random() * (rota.maxLvl - rota.minLvl + 1));
      var chanceShiny = CHANCE_SHINY;
      if(rota.bg === 'mystic') chanceShiny = CHANCE_SHINY_MISTICA;
      else if(rota.lendario) chanceShiny = CHANCE_SHINY_CAVERNA;
      else if(rota.rara) chanceShiny = 1/300;
      var ehShiny = Math.random() < chanceShiny;
      var sexo = sortearSexo(info.nome);
      var formaFinal = '', idFormaFinal = null, nomeFinal = info.nome;
      var formasDisp = FORMAS_REGIONAIS_POR_POKEMON[info.nome];
      if(formasDisp){
        var formaRegiao = null;
        if(regiaoChave === 'Alola' && formasDisp.alola) formaRegiao = 'alola';
        else if(regiaoChave === 'Galar' && formasDisp.galar) formaRegiao = 'galar';
        else if((regiaoChave === 'Sinnoh') && formasDisp.hisui && Math.random() < 0.3) formaRegiao = 'hisui';
        else if(regiaoChave === 'Paldea' && formasDisp.paldea) formaRegiao = 'paldea';
        if(formaRegiao && Math.random() < 0.4){
          formaFinal = formaRegiao;
          idFormaFinal = formasDisp[formaRegiao].id;
          nomeFinal = formasDisp[formaRegiao].nome;
        }
      }
      var selvagem = {
        id:info.id, nome:nomeFinal, lvl:lvl, tipo:info.tipo, baseStats:info.baseStats,
        hpAtual:null, status:null, statusTurnos:0, moves:null,
        habilidade:sortearHabilidade(info.tipo), boosts:{},
        shiny:ehShiny,
        sexo:sexo,
        peso:info.peso || 100,
        taxaCaptura:45,
        forma:formaFinal,
        idForma:idFormaFinal
      };
      await evoluirInimigoPorNivel(selvagem);
      if(selvagem.forma){
        selvagem.id = idFormaFinal || selvagem.id;
      }
      inicializarHP(selvagem);
      return selvagem;
    }catch(e){ continue; }
  }
  return null;
}

// =============== ULTRA BEASTS ===============
var ULTRA_BEASTS = ['Nihilego','Buzzwole','Pheromosa','Xurkitree','Celesteela','Kartana','Guzzlord','Poipole','Naganadel','Stakataka','Blacephalon'];

async function sortearUltraBeast(regiaoNome){
  if(['Alola','Galar','Paldea'].indexOf(regiaoNome) === -1) return null;
  var lista = ULTRA_BEASTS;
  var nomeUB = lista[Math.floor(Math.random() * lista.length)];
  try{
    var info = await buscarPokemon(nomeUB);
    if(!info.id) return null;
    var lvl = 60 + Math.floor(Math.random() * 15);
    var baseStats = info.baseStats || await carregarBaseStats(info.id);
    var chanceShiny = CHANCE_SHINY_CAVERNA;
    var ehShiny = Math.random() < chanceShiny;
    return {
      id:info.id, nome:info.nome, lvl:lvl, tipo:info.tipo, baseStats:baseStats,
      hpAtual:null, status:null, statusTurnos:0, moves:null,
      habilidade:sortearHabilidade(info.tipo), boosts:{},
      shiny:ehShiny, sexo:'N',
      peso:info.peso || 100,
      isUltraBeast:true,
      taxaCaptura:30
    };
  }catch(e){ return null; }
}
async function sortearLendario(regiaoNome){
  var LENDARIOS_POR_REGIAO = {
    Kanto:['Articuno','Zapdos','Moltres','Mewtwo','Mew'],
    Johto:['Raikou','Entei','Suicune','Lugia','Ho-Oh','Celebi'],
    Hoenn:['Regirock','Regice','Registeel','Latias','Latios','Kyogre','Groudon','Rayquaza','Jirachi','Deoxys'],
    Sinnoh:['Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Regigigas','Giratina','Cresselia','Phione','Manaphy','Darkrai','Shaymin','Arceus'],
    Unova:['Victini','Cobalion','Terrakion','Virizion','Tornadus','Thundurus','Reshiram','Zekrom','Landorus','Kyurem','Keldeo','Meloetta','Genesect'],
    Kalos:['Xerneas','Yveltal','Zygarde','Diancie','Hoopa','Volcanion'],
    Alola:['Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Cosmog','Cosmoem','Solgaleo','Lunala','Necrozma','Magearna','Marshadow','Zeraora','Meltan','Melmetal'],
    Galar:['Zacian','Zamazenta','Eternatus','Kubfu','Urshifu','Zarude','Regieleki','Regidrago','Glastrier','Spectrier','Calyrex','Enamorus'],
    Paldea:['Koraidon','Miraidon','Wo-Chien','Chien-Pao','Ting-Lu','Chi-Yu','Roaring Moon','Iron Valiant','Walking Wake','Iron Leaves','Okidogi','Munkidori','Fezandipiti','Ogerpon','Terapagos','Pecharunt']
  };
  var lista = LENDARIOS_POR_REGIAO[regiaoNome] || LENDARIOS_POR_REGIAO.Kanto;
  var nomeLendario = lista[Math.floor(Math.random() * lista.length)];
  try{
    var info = await buscarPokemon(nomeLendario);
    if(!info.id) return null;
    var lvl = 70;
    var baseStats = info.baseStats || await carregarBaseStats(info.id);
    var chanceShiny = CHANCE_SHINY_CAVERNA;
    var ehShiny = Math.random() < chanceShiny;
    return {
      id:info.id, nome:info.nome, lvl:lvl, tipo:info.tipo, baseStats:baseStats,
      hpAtual:null, status:null, statusTurnos:0, moves:null,
      habilidade:sortearHabilidade(info.tipo), boosts:{},
      shiny:ehShiny, sexo:'N',
      peso:info.peso || 100,
      isLendario:true,
      taxaCaptura:3
    };
  }catch(e){ return null; }
}

// =============== TREINADOR ADVERSÁRIO ===============
function gerarTreinadorAdversario(regiao, rota){
  var nomes = ['Jovem','Pescador','Campista','Ciclista','Estudante','Cientista','Mochileiro'];
  var nome = nomes[Math.floor(Math.random() * nomes.length)];
  var numPokemon = Math.random() < 0.5 ? 4 : 5;
  var time = [];
  for(var i = 0; i < numPokemon; i++){
    time.push({tipoDesejado:'normal', lvl:rota.minLvl + Math.floor(Math.random() * (rota.maxLvl - rota.minLvl + 1))});
  }
  return {nome:nome, sprite:spriteTreinador(nome), regiao:regiao, time:time, recompensa:{pc:5 + Math.floor(Math.random() * 15), pass:0.5}};
}

// ============================================================
// =============== EQUIPE ROCKET ===============
// ============================================================

function rolarEquipeRocket(){
  return Math.random() < CHANCE_ROCKET;
}
function escolherMembroRocket(){
  // Chefe é raro (2% dentro dos 6%)
  if(Math.random() < 0.02) return ROCKET_MEMBROS[3];
  // Executivo 15%
  if(Math.random() < 0.15) return ROCKET_MEMBROS[2];
  // Agente 35%
  if(Math.random() < 0.35) return ROCKET_MEMBROS[1];
  // Recruta 48%
  return ROCKET_MEMBROS[0];
}

async function iniciarBatalhaRocket(regiao, rota, timeAtivo){
  mostrarLoading(true);
  
  var membro = escolherMembroRocket();
  var nome = membro.nome;
  var nivelBase = rota.minLvl + membro.nivelExtra;
  
  // Time Rocket (poison, dark, ground)
  var timeInimigo = [];
  var numPokemon = 4 + Math.floor(Math.random() * 2);
  for(var i = 0; i < numPokemon; i++){
    var tipo = TIPOS_ROCKET[Math.floor(Math.random() * TIPOS_ROCKET.length)];
    var ids = POKEMON_POR_TIPO_GINASIO[tipo] || [];
    var idsFiltrados = ids.filter(function(id){
      return idPermitidoNaRegiao(id, regiao) && filtrarPorNivel(id, nivelBase);
    });
    if(idsFiltrados.length === 0) idsFiltrados = ids;
    if(idsFiltrados.length === 0) continue;
    var idEscolhido = idsFiltrados[Math.floor(Math.random() * idsFiltrados.length)];
    try{
      var p = await buscarPokemonPorId(idEscolhido);
      if(p && p.id){
        p.lvl = nivelBase + Math.floor(Math.random() * 5);
        p.baseStats = p.baseStats || await carregarBaseStats(p.id);
        p.hpAtual = null;
        p.status = null;
        p.boosts = {};
        p.habilidade = sortearHabilidade(p.tipo);
        p.sexo = sortearSexo(p.nome);
        p.shiny = false;
        await evoluirInimigoPorNivel(p);
        inicializarHP(p);
        timeInimigo.push(p);
      }
    }catch(e){}
  }
  
  mostrarLoading(false);
  if(timeInimigo.length === 0){ AudioSFX.erro(); alert('Erro ao gerar Rocket.'); return; }
  
  // Aviso
  AudioSFX.rocketAlerta();
  var alerta = confirm('🚨 EQUIPE ROCKET DETECTADA! 🚨\n\n' + nome + ' bloqueia seu caminho!\n\nBatalhar?');
  if(!alerta){
    // Fugiu - não perde nada
    return;
  }
  
  var treinador = {
    nome: nome,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/' + membro.sprite + '.png',
    regiao: regiao,
    time: timeInimigo.map(function(p){ return {tipoDesejado:p.tipo, lvl:p.lvl, pokemonObj:p}; }),
    recompensa: { pc: membro.pc, pass: 2 },
    isRocket: true,
    membro: membro
  };
  
  // Rota especial Rocket
  var rotaRocket = Object.assign({}, rota, { 
    id:'rocket-' + Date.now(), 
    nome: '🚨 Rocket: ' + membro.tipo, 
    bg: 'gymPurple',
    minLvl: nivelBase,
    maxLvl: nivelBase + 5
  });
  
  abrirModalEscolherPokemonBatalha(timeAtivo, function(idx){
    iniciarBatalhaDigital('treinador', treinador, null, rotaRocket, idx, regiao);
    setTimeout(function(){
      if(_batalha){
        _batalha.isRocket = true;
        _batalha.membroRocket = membro;
      }
    }, 100);
  });
}

// =============== INICIAR BATALHA ===============
async function iniciarBatalhaDigital(tipo, treinador, selvagem, rota, indiceInicial, regiaoNome){
  var timeAtivo = jogador.time.filter(Boolean);
  if(timeAtivo.length === 0){ AudioSFX.erro(); alert('Precisa de pelo menos 1 Pokémon!'); return; }
  for(var i = 0; i < timeAtivo.length; i++){
    if(!timeAtivo[i].baseStats || !timeAtivo[i].baseStats.hp){
      try{ await garantirBaseStats(timeAtivo[i]); }catch(e){}
    }
    inicializarHP(timeAtivo[i]);
  }
  mostrarLoading(true);
  var timeInimigo = [];
  var regiaoBatalha = regiaoNome || 'Kanto';
  if(tipo === 'selvagem'){
    if(!selvagem.baseStats || !selvagem.baseStats.hp){
      selvagem.baseStats = await carregarBaseStats(selvagem.id);
    }
    await evoluirInimigoPorNivel(selvagem);
    inicializarHP(selvagem);
    timeInimigo = [selvagem];
  }else{
    for(var j = 0; j < treinador.time.length; j++){
      var p = treinador.time[j];
      // Se já tem pokemonObj (Rocket, Ginásio), usa direto
      if(p.pokemonObj){
        inicializarHP(p.pokemonObj);
        timeInimigo.push(p.pokemonObj);
        continue;
      }
      try{
        var sw = await sortearSelvagem(rota, regiaoBatalha);
        if(sw && sw.id){
          sw.lvl = p.lvl;
          await evoluirInimigoPorNivel(sw);
          timeInimigo.push(sw);
        }
      }catch(e){}
    }
    timeInimigo.forEach(function(p){ inicializarHP(p); });
  }
  if(timeInimigo.length === 0){ mostrarLoading(false); AudioSFX.erro(); alert('Nenhum Pokémon adversário!'); return; }
  var idxInicial = (indiceInicial !== undefined && indiceInicial !== null) ? indiceInicial : 0;
  var meuPrimeiro = timeAtivo[idxInicial];
  if(!meuPrimeiro || meuPrimeiro.hpAtual <= 0){
    meuPrimeiro = timeAtivo.find(function(p){ return p.hpAtual > 0; });
    idxInicial = timeAtivo.indexOf(meuPrimeiro);
  }
  if(!meuPrimeiro){ mostrarLoading(false); AudioSFX.erro(); alert('Nenhum Pokémon saudável!'); return; }
  _batalha = {
    tipo:tipo, rota:rota, regiao:regiaoBatalha, treinador:treinador,
    meuTime:timeAtivo, indiceMeu:idxInicial,
    timeInimigo:timeInimigo, indiceInimigo:0,
    turno:0, bloqueado:false, log:[],
    isCopa:(_copaPendente !== null), isDuelo:false,
    isGinasio:(_ginasioPendente !== null),
    isRocket: treinador && treinador.isRocket === true,
    membroRocket: treinador ? treinador.membro : null
  };
  mostrarLoading(false);
  document.getElementById('tela-batalha').classList.add('aberta');
  var arena = document.getElementById('arena-batalha');
  if(arena && rota){
    var bgUrl = BATTLE_BG_URLS[rota.bg] || BATTLE_BG_URLS.default;
    arena.style.backgroundImage = 'url(' + bgUrl + ')';
  }
  AudioSFX.batalhaInicio();
  var temaTipo;
  if(_batalha.isRocket) temaTipo = 'rocket';
  else if(tipo === 'treinador') temaTipo = _batalha.isCopa ? 'copa' : 'treinador';
  else temaTipo = 'selvagem';
  AudioSFX.batalhaTema(temaTipo);
  aplicarHabilidadeEntrada(meuPrimeiro, timeInimigo[0]);
  aplicarHabilidadeEntrada(timeInimigo[0], meuPrimeiro);
  renderBatalha();
  if(_batalha.isRocket){
    addLog('🚨 ' + treinador.nome + ' enviou ' + timeInimigo[0].nome + '!');
  }else{
    addLog((tipo === 'selvagem' ? 'Um ' : 'Treinador ' + treinador.nome + ' enviou ') + timeInimigo[0].nome + '!');
  }
  if(tipo === 'selvagem' && selvagem && selvagem.shiny){
    setTimeout(function(){ mostrarToastShiny(selvagem.nome); }, 1500);
  }
}

// =============== MODAL ESCOLHER POKÉMON INICIAL ===============
function abrirModalEscolherPokemonBatalha(timeAtivo, callback){
  var antigo = document.getElementById('modal-escolher-inicial');
  if(antigo) antigo.remove();
  var modal = document.createElement('div');
  modal.className = 'modal-fundo aberto';
  modal.id = 'modal-escolher-inicial';
  var html = '<div class="modal"><h3>Escolha seu Pokémon inicial</h3><p style="color:var(--texto-secundario);font-size:9px;margin-bottom:15px;">Primeiro a entrar na batalha.</p><div style="max-height:400px;overflow-y:auto;">';
  timeAtivo.forEach(function(p, idx){
    var hp = (p.hpAtual !== null && p.hpAtual !== undefined) ? p.hpAtual : (p._hpMax || '—');
    var sexo = p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '';
    html += '<div class="pokemon-opcao" data-idx="' + idx + '">' +
      '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="info"><div class="nome">' + (p.apelido || p.nome) + sexo + (p.shiny ? ' ✨' : '') + '</div>' +
      '<div class="lvl">Lvl ' + p.lvl + ' · HP: ' + hp + '</div></div></div>';
  });
  html += '</div></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  modal.querySelectorAll('.pokemon-opcao').forEach(function(el){
    el.onclick = function(){
      var idx = parseInt(el.dataset.idx);
      modal.remove();
      callback(idx);
    };
  });
}

// =========================================================
// GINÁSIOS
// =========================================================
function criarTreinadorGinasio(regiao, ginasio, indice, tipoFase){
  var lider = ginasio.lider;
  var tipo = ginasio.tipoSlug;
  if(tipoFase === 'lider'){
    return {
      nome:lider, sprite:spriteTreinador(lider), regiao:regiao,
      tipoGinasio:tipo, isLider:true,
      time:[], recompensa:{pc:30, pass:6}
    };
  }
  var nomesTreinadores = ['Jovem','Campista','Ciclista','Estudante','Cientista','Aventureiro','Mochileiro','Lutador'];
  var nomeTreinador = nomesTreinadores[Math.floor(Math.random() * nomesTreinadores.length)];
  return {
    nome:nomeTreinador, sprite:spriteTreinador(nomeTreinador), regiao:regiao,
    tipoGinasio:tipo, isLider:false,
    time:[], recompensa:{pc:5, pass:1}
  };
}
async function gerarTimeGinasio(regiao, ginasio, numPokemon, nivelBase){
  var tipo = ginasio.tipoSlug;
  var pool = POKEMON_POR_TIPO_GINASIO[tipo] || POKEMON_POR_TIPO_GINASIO.normal;
  var poolFiltrado = pool.filter(function(id){
    return idPermitidoNaRegiao(id, regiao) && filtrarPorNivel(id, nivelBase);
  });
  if(poolFiltrado.length < numPokemon) poolFiltrado = pool.filter(function(id){ return idPermitidoNaRegiao(id, regiao); });
  if(poolFiltrado.length < numPokemon) poolFiltrado = pool;
  var idsEscolhidos = shuffleArray(poolFiltrado).slice(0, numPokemon);
  var time = [];
  for(var i = 0; i < idsEscolhidos.length; i++){
    try{
      var info = await buscarPokemonPorId(idsEscolhidos[i]);
      if(!info || !info.id) continue;
      var lvl = nivelBase + Math.floor(Math.random() * 5);
      var p = {
        id:info.id, nome:info.nome, lvl:lvl, tipo:info.tipo,
        baseStats:info.baseStats, hpAtual:null, status:null, statusTurnos:0,
        moves:null, habilidade:sortearHabilidade(info.tipo), boosts:{},
        shiny:Math.random() < CHANCE_SHINY,
        sexo:sortearSexo(info.nome)
      };
      await evoluirInimigoPorNivel(p);
      time.push(p);
    }catch(e){}
  }
  return time;
}
async function iniciarGinasio(regiao, indiceGinasio){
  AudioSFX.clickMenu();
  var ginasio = LIDERES_GINASIO[regiao][indiceGinasio];
  if(!ginasio){ AudioSFX.erro(); alert('Ginásio não encontrado.'); return; }
  var jaGanhou = (jogador.insignias[regiao] && jogador.insignias[regiao][indiceGinasio]);
  if(jaGanhou){
    if(!confirm('Você já venceu esse ginásio. Batalhar de novo?')) return;
  }
  var timeAtivo = jogador.time.filter(Boolean);
  if(timeAtivo.length === 0){ AudioSFX.erro(); alert('Precisa de pelo menos 1 Pokémon!'); return; }
  mostrarLoading(true);
  var nivelBase = 20 + indiceGinasio * 5;
  for(var i = 0; i < timeAtivo.length; i++){
    timeAtivo[i].hpAtual = null;
    timeAtivo[i].status = null;
    timeAtivo[i].statusTurnos = 0;
    if(!timeAtivo[i].baseStats || !timeAtivo[i].baseStats.hp){
      try{ await garantirBaseStats(timeAtivo[i]); }catch(e){}
    }
    inicializarHP(timeAtivo[i]);
  }
  _ginasioPendente = {
    regiao:regiao,
    indiceGinasio:indiceGinasio,
    ginasio:ginasio,
    fase:0,
    nivelBase:nivelBase,
    timeSalvo:null
  };
  await iniciarBatalhaGinasioFase();
}
async function iniciarBatalhaGinasioFase(){
  if(!_ginasioPendente) return;
  var ctx = _ginasioPendente;
  var ginasio = ctx.ginasio;
  var regiao = ctx.regiao;
  var fase = ctx.fase;
  var nivelBase = ctx.nivelBase;
  
  var tipoFase = fase < 3 ? 'treinador' : 'lider';
  var numPokemon = fase < 3 ? 3 : 5;
  var nivelFase = tipoFase === 'lider' ? nivelBase + 5 : nivelBase + fase;
  
  var treinador = criarTreinadorGinasio(regiao, ginasio, fase, tipoFase);
  var time = await gerarTimeGinasio(regiao, ginasio, numPokemon, nivelFase);
  treinador.time = time.map(function(p){ return {tipoDesejado:p.tipo, lvl:p.lvl, pokemonObj:p}; });
  
  mostrarLoading(false);
  ctx.timeAtual = time;
  ctx.treinadorAtual = treinador;
  
  var timeAtivo = jogador.time.filter(Boolean);
  for(var i = 0; i < timeAtivo.length; i++){
    if(!timeAtivo[i].baseStats || !timeAtivo[i].baseStats.hp){
      try{ await garantirBaseStats(timeAtivo[i]); }catch(e){}
    }
    if(timeAtivo[i]._hpMax === undefined || timeAtivo[i]._hpMax === null){
      inicializarHP(timeAtivo[i]);
    }
  }
  time.forEach(function(p){ inicializarHP(p); });
  
  var idxInicial = -1;
  for(var k = 0; k < timeAtivo.length; k++){
    if(timeAtivo[k] && timeAtivo[k].hpAtual > 0){ idxInicial = k; break; }
  }
  if(idxInicial === -1){
    mostrarLoading(false);
    _ginasioPendente = null;
    AudioSFX.erro();
    alert('Todos os seus Pokémon desmaiaram!');
    return;
  }
  
  _batalha = {
    tipo:'treinador', rota:{id:'ginasio', nome:ginasio.cidade, bg:'gymWhite', minLvl:nivelFase, maxLvl:nivelFase+5, tipos:[ginasio.tipoSlug]},
    regiao:regiao, treinador:treinador,
    meuTime:timeAtivo, indiceMeu:idxInicial,
    timeInimigo:time, indiceInimigo:0,
    turno:0, bloqueado:false, log:[],
    isGinasio:true, isCopa:false, isDuelo:false,
    ginasioFase:fase
  };
  document.getElementById('tela-batalha').classList.add('aberta');
  var arena = document.getElementById('arena-batalha');
  if(arena){
    var bgMap = {water:'water', fire:'redDesert', ice:'snow'};
    var bgKey = bgMap[ginasio.tipoSlug] || 'gymWhite';
    var bgUrl = BATTLE_BG_URLS[bgKey] || BATTLE_BG_URLS.default;
    arena.style.backgroundImage = 'url(' + bgUrl + ')';
  }
  AudioSFX.batalhaInicio();
  AudioSFX.batalhaTema(tipoFase === 'lider' ? 'ginásio' : 'treinador');
  aplicarHabilidadeEntrada(timeAtivo[idxInicial], time[0]);
  aplicarHabilidadeEntrada(time[0], timeAtivo[idxInicial]);
  renderBatalha();
  var titulo = tipoFase === 'lider' ? 'Líder ' + treinador.nome + ' enviou ' : 'Treinador ' + treinador.nome + ' enviou ';
  addLog(titulo + time[0].nome + '!');
}
async function callbackBatalhaGinasio(venceu){
  if(!_ginasioPendente) return;
  var ctx = _ginasioPendente;
  if(!venceu){
    mostrarToastNotificacao('Ginásio Perdido', 'Você perdeu para ' + ctx.treinadorAtual.nome);
    _ginasioPendente = null;
    if(typeof atualizarTudo === 'function') atualizarTudo();
    return;
  }
  if(ctx.fase < 3){
    ctx.fase++;
    jogador.time.filter(Boolean).forEach(function(p){
      if(p.hpAtual !== null && p.hpAtual !== undefined && p._hpMax && p.hpAtual > 0){
        p.hpAtual = Math.min(p._hpMax, p.hpAtual + Math.floor(p._hpMax * 0.25));
      }
    });
    salvar();
    mostrarToastNotificacao('Vitória!', 'Próximo: treinador ' + ctx.fase + '/3');
    setTimeout(function(){ iniciarBatalhaGinasioFase(); }, 800);
  }else{
    var regiao = ctx.regiao;
    var idxG = ctx.indiceGinasio;
    if(!jogador.insignias[regiao]) jogador.insignias[regiao] = [];
    jogador.insignias[regiao][idxG] = true;
    jogador.ginasiosVencidos = (jogador.ginasiosVencidos || 0) + 1;
    jogador.time.filter(Boolean).forEach(function(p){
      p.hpAtual = null;
      p.status = null;
      p.statusTurnos = 0;
    });
    darXP(XP_ACOES.vitoria_batalha * 3, 'Ginásio vencido!');
    jogador.pc += 50;
    jogador.passaportes += 2;
    jogador.historico.unshift({
      regiao:regiao, resultado:'Ganhou', tipo:'Boss de Ginásio',
      pokemon:jogador.time.filter(Boolean)[0] ? jogador.time.filter(Boolean)[0].nome : '-',
      id:Date.now(), insigniaIdx:idxG, modo:'digital',
      rota:'Ginásio ' + ctx.ginasio.lider
    });
    salvar();
    AudioSFX.taca();
    setTimeout(function(){
      alert('Você venceu o Líder ' + ctx.ginasio.lider + '!\n\n+1 Insígnia: ' + INSIGNIAS[regiao][idxG] + '\n+50 PC\n+2 Passaportes');
    }, 500);
    var eraUltimo = (jogador.insignias[regiao] || []).filter(function(x){ return x; }).length === 8;
    if(eraUltimo){
      if(!jogador.medalhasRegiaoGanhas) jogador.medalhasRegiaoGanhas = {};
      jogador.medalhasRegiaoGanhas[regiao] = true;
      setTimeout(function(){ alert('PARABÉNS! Você ganhou TODAS as 8 insígnias de ' + regiao + '!\n\nMedalha de Região ganha!'); }, 1500);
    }
    _ginasioPendente = null;
    if(typeof atualizarTudo === 'function') atualizarTudo();
  }
}

// =============== EVOLUÇÕES ===============
async function verificarEvolucao(pokemon){
  if(!pokemon) return pokemon;
  if(pokemon.nome === 'Eevee'){
    var evoEevee = EVOLUCOES_DIA_NOITE['Eevee'];
    if(pokemon.lvl >= evoEevee.nivelMinimo && (pokemon.amizade || 0) >= evoEevee.amizadeNecessaria){
      var alvo = ehNoite() ? evoEevee.noite : evoEevee.dia;
      try{
        var novoEevee = await buscarPokemon(alvo);
        await mostrarAnimacaoEvolucao(pokemon, novoEevee);
        pokemon.id = novoEevee.id;
        pokemon.nome = novoEevee.nome;
        pokemon.tipo = novoEevee.tipo;
        pokemon.baseStats = novoEevee.baseStats || await carregarBaseStats(novoEevee.id);
        pokemon.amizade = 0;
        jogador.totalEvolucoes = (jogador.totalEvolucoes || 0) + 1;
        if(typeof marcarPokedex === 'function') marcarPokedex(pokemon.id, true, pokemon.shiny);
        registrarContador('evolucoes');
        return pokemon;
      }catch(e){}
    }
    return pokemon;
  }
  if(EVOLUCOES_AMIZADE && EVOLUCOES_AMIZADE[pokemon.nome]) return pokemon;
  if(EVOLUCOES_DIA_NOITE[pokemon.nome]){
    var evoDN = EVOLUCOES_DIA_NOITE[pokemon.nome];
    if(pokemon.lvl >= (evoDN.nivelMinimo || 1)){
      var alvoDN = null;
      if(ehNoite() && evoDN.noite) alvoDN = evoDN.noite;
      else if(ehDia() && evoDN.dia) alvoDN = evoDN.dia;
      if(alvoDN){
        try{
          var novoDN = await buscarPokemon(alvoDN);
          await mostrarAnimacaoEvolucao(pokemon, novoDN);
          pokemon.id = novoDN.id;
          pokemon.nome = novoDN.nome;
          pokemon.tipo = novoDN.tipo;
          pokemon.baseStats = novoDN.baseStats || await carregarBaseStats(novoDN.id);
          jogador.totalEvolucoes = (jogador.totalEvolucoes || 0) + 1;
          if(typeof marcarPokedex === 'function') marcarPokedex(pokemon.id, true, pokemon.shiny);
          registrarContador('evolucoes');
          return pokemon;
        }catch(e){}
      }
    }
  }
  var mapa = await buscarCadeiaEvolucao(pokemon.nome);
  var evoluiu = true;
  var nomeAtual = pokemon.nome;
  while(evoluiu){
    evoluiu = false;
    var slugAtual = nomeAtual.toLowerCase().replace(/\s+/g, '-');
    var proximaEvo = mapa[slugAtual];
    if(proximaEvo && pokemon.lvl >= proximaEvo.nivel){
      try{
        var novo = await buscarPokemon(proximaEvo.proximo);
        await mostrarAnimacaoEvolucao(pokemon, novo);
        pokemon.id = novo.id;
        pokemon.nome = novo.nome;
        pokemon.tipo = novo.tipo;
        pokemon.baseStats = novo.baseStats || await carregarBaseStats(novo.id);
        pokemon.forma = ''; pokemon.idForma = null;
        jogador.totalEvolucoes = (jogador.totalEvolucoes || 0) + 1;
        if(typeof marcarPokedex === 'function') marcarPokedex(pokemon.id, true, pokemon.shiny);
        nomeAtual = novo.nome;
        evoluiu = true;
        var novaCadeia = await buscarCadeiaEvolucao(novo.nome);
        for(var k in novaCadeia) mapa[k] = novaCadeia[k];
        registrarContador('evolucoes');
      }catch(e){ break; }
    }
  }
  return pokemon;
}
async function verificarTodasEvolucoes(){
  var mudou = false;
  for(var i = 0; i < jogador.time.length; i++){
    if(jogador.time[i]){
      var antes = jogador.time[i].nome;
      await verificarEvolucao(jogador.time[i]);
      if(jogador.time[i].nome !== antes) mudou = true;
    }
  }
  for(var j = 0; j < jogador.banco.length; j++){
    var antes2 = jogador.banco[j].nome;
    await verificarEvolucao(jogador.banco[j]);
    if(jogador.banco[j].nome !== antes2) mudou = true;
  }
  if(mudou){ salvar(); if(typeof atualizarTudo === 'function') atualizarTudo(); }
}
function adicionarAmizade(pokemon, qtd){
  if(!pokemon) return;
  if(pokemon.amizade === undefined) pokemon.amizade = 0;
  pokemon.amizade = Math.min(AMIZADE_MAX, pokemon.amizade + qtd);
  pokemon.batalhasSemUso = 0;
}
function perderAmizadePorDesuso(){
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  todos.forEach(function(p){
    if(!p) return;
    if(p.batalhasSemUso === undefined) p.batalhasSemUso = 0;
    p.batalhasSemUso++;
    if(p.batalhasSemUso >= 10){
      p.batalhasSemUso = 0;
      if(p.amizade === undefined) p.amizade = 0;
      p.amizade = Math.max(0, p.amizade - AMIZADE_PERDA_10_BATALHAS);
    }
  });
}
async function mostrarAnimacaoEvolucao(pokemonAntes, pokemonDepois){
  try{
    var overlay = document.getElementById('overlay-animacao');
    var img = document.getElementById('overlay-img');
    var pokebola = document.getElementById('overlay-pokebola');
    var particulas = document.getElementById('overlay-particulas');
    var titulo = document.getElementById('overlay-titulo');
    var texto = document.getElementById('overlay-texto');
    if(!overlay || !img) return;
    pokebola.style.display = 'none';
    particulas.innerHTML = '';
    img.src = spritePokemonAtual(pokemonAntes);
    img.style.opacity = '1';
    img.className = '';
    titulo.textContent = 'O quê? ' + pokemonAntes.nome + ' está evoluindo!';
    texto.textContent = '';
    overlay.classList.add('ativo');
    AudioSFX.evolucao();
    await new Promise(function(r){ setTimeout(r, 300); });
    img.classList.add('anim-pokemon-branco');
    await new Promise(function(r){ setTimeout(r, 1800); });
    img.src = spritePokemon(pokemonDepois.id);
    img.classList.remove('anim-pokemon-branco');
    img.classList.add('anim-pokemon-reaparece');
    await new Promise(function(r){ setTimeout(r, 1000); });
    titulo.textContent = pokemonAntes.nome + ' evoluiu para ' + pokemonDepois.nome + '!';
    await new Promise(function(r){ setTimeout(r, 1800); });
    overlay.classList.remove('ativo');
    img.className = '';
  }catch(e){
    var ov = document.getElementById('overlay-animacao');
    if(ov) ov.classList.remove('ativo');
  }
}
function soltarConfetes(){
  try{
    if(!document.getElementById('confeteStyle')){
      var style = document.createElement('style');
      style.id = 'confeteStyle';
      style.textContent = '@keyframes confeteFall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }';
      document.head.appendChild(style);
    }
    var cores = ['#ffcb05','#ee1515','#4caf50','#2196f3','#e91e63','#9c27b0'];
    for(var i = 0; i < 60; i++){
      var c = document.createElement('div');
      c.style.position = 'fixed';
      c.style.width = '10px'; c.style.height = '10px';
      c.style.left = Math.random() * 100 + '%';
      c.style.top = '-20px';
      c.style.background = cores[Math.floor(Math.random() * cores.length)];
      c.style.zIndex = '9999';
      c.style.pointerEvents = 'none';
      c.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      var dur = 2 + Math.random() * 2;
      c.style.animation = 'confeteFall ' + dur + 's linear forwards';
      document.body.appendChild(c);
      (function(el){ setTimeout(function(){ if(el && el.remove) el.remove(); }, dur * 1000 + 500); })(c);
    }
  }catch(e){}
}

console.log('Pokémon TCG v23.0 — script2.js carregado');