// =========================================================
// POKÉMON TCG v23.0 — script1.js
// Constantes + Estado + Save + Modos + Áudio + Base Stats
// + Novas: Equipe Rocket, Habilidade, Apelido, Mudar Nome
// + IA Adaptativa + Multiplayer hooks
// =========================================================
'use strict';

// =============== ESTADO GLOBAL ===============
var nomeAtual = null;
var jogador = null;
var autoSaveInterval = null;
var bolaSelecionada = null;
var mostrarSoFavoritos = false;
var filtroConquistaAtual = 'Todas';
var filtroRankingAtual = 'nivel';
var modoLoja = 'comprar';
var categoriaLoja = 'itens';
var raridadeSelecionada = 'normal';
var autocompleteConfigurado = false;
var ataqueEmAndamento = false;
var dragSrcIndex = null;
var _conquistasDebounce = null;
var _batalha = null;
var _copaPendente = null;
var _ginasioPendente = null;
var contextoClima = null;
var _modaisAbertos = [];
var _tmEstadoAtual = null;
var _abaRotasAtual = 'rotas';
var _abaHistoricoAtual = 'batalhas';
var _compararPokemon1 = null;
var _compararPokemon2 = null;
var _filaModaisMove = [];
var _modoEscolhidoTemp = null;
var _nomeTemp = '';

// Multiplayer
var _mpSocket = null;
var _mpConectado = false;
var _mpSalaAtual = null;
var _mpSalaTipo = null;
var _mpEuPronto = false;
var _mpJogadoresSala = {};
var _mpChat = [];
var _mpAmigos = [];
var _mpHistoricoOnline = [];

// IA Adaptativa
var _iaAdaptativa = false;
var _iaNivel = 'intermediario';
var _iaHistoricoBatalhas = [];

// =============== CONSTANTES ===============
var AMIZADE_MAX = 1500;
var AMIZADE_POR_BATALHA = 30;
var AMIZADE_PERDA_10_BATALHAS = 50;
var XP_BASE_NIVEL = 300;
var XP_AUMENTO_POR_NIVEL = 50;
var USOS_PEDRA_MEGA = 5;
var VERSAO_SAVE = '23.0';
var CHANCE_LENDARIO = 0.05;
var CHANCE_LENDARIO_CAVERNA = 0.35;
var CHANCE_CRITICA = 0.0625;
var CHANCE_SHINY = 1/500;
var CHANCE_SHINY_CAVERNA = 1/100;
var CHANCE_SHINY_MISTICA = 0.45;
var CHANCE_ROCKET = 0.06;          // 6% de chance por rota
var CHANCE_CHAVE_ROCKET = 0.10;    // 10% ao derrotar membro
var LIMITE_BATALHAS_COPA = 15;
var LIMITE_BATALHAS_COPA_REGIAO = 20;
var LIMITE_BATALHAS_CONTINENTAL = 50;
var LIMITE_BATALHAS_LIGA = 15;
var INTERVALO_ASTRAL = 10;
var INTERVALO_MISTICA = 10;
var INTERVALO_CRISTAL = 10;
var INTERVALO_LENDARIO = 10;
var COOLDOWN_MUDAR_NOME = 30 * 24 * 60 * 60 * 1000; // 30 dias
var CUSTO_MUDAR_NOME = 500;

// URLs
var API_ITEM = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/";
var POKESPRITE = "https://raw.githubusercontent.com/msikma/pokesprite/master/items/";
var SEREBII_ITEM = "https://www.serebii.net/itemdex/sprites/";
var POKEAPI_POKEMON = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
var POKEAPI_POKEMON_SHINY = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/";
var SHOWDOWN = "https://play.pokemonshowdown.com/sprites/";
var SHOWDOWN_SHINY = "https://play.pokemonshowdown.com/sprites/gen5-shiny/";
var SHOWDOWN_TRAINERS = "https://play.pokemonshowdown.com/sprites/trainers/";
var POKEAPI_HOME = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/";
var POKEAPI_HOME_SHINY = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/";

// Imagens externas
var IMG_TROFEU_COPA = "https://files.catbox.moe/rixqbn.png";
var IMG_TROFEU_LIGA = "https://files.catbox.moe/jznbyz.png";
var IMG_MEDALHA = "https://files.catbox.moe/r8j4e6.png";
var IMG_MEDALHA_REGIAO = "https://files.catbox.moe/hz37gj.png";
var IMG_PULSEIRA_MEGA = "https://files.catbox.moe/zdrvum.png";
var IMG_PULSEIRA_GMAX = "https://files.catbox.moe/mrut98.png";
var IMG_TROFEU_SUPERCOPA = "https://files.catbox.moe/yucu93.png";
var IMG_TROFEU_CONTINENTAL = "https://files.catbox.moe/3zs5hj.png";
var IMG_CHAVE_ROCKET = "https://files.catbox.moe/k7gqx6.png";
var IMG_TROFEUS_REGIAO = {
  Kanto:"https://files.catbox.moe/1xrzth.png", Johto:"https://files.catbox.moe/ftxtmu.png",
  Hoenn:"https://files.catbox.moe/mmrlid.png", Sinnoh:"https://files.catbox.moe/i0eoz1.png",
  Unova:"https://files.catbox.moe/v2adle.png", Kalos:"https://files.catbox.moe/svi9xt.png",
  Alola:"https://files.catbox.moe/girba8.png", Galar:"https://files.catbox.moe/why7wq.png",
  Paldea:"https://files.catbox.moe/qypglt.png"
};

// =============== ÁUDIO ===============
var AudioSFX = {
  ctx:null, masterGain:null, musicaGain:null, efeitosGain:null,
  mudo:false, volumeMusica:0.10, volumeEfeitos:0.30, vibracaoAtiva:true, audioBatalha:null,
  init:function(){
    if(this.ctx) return;
    try{
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);
      this.musicaGain = this.ctx.createGain();
      this.musicaGain.gain.value = this.volumeMusica;
      this.musicaGain.connect(this.masterGain);
      this.efeitosGain = this.ctx.createGain();
      this.efeitosGain.gain.value = this.volumeEfeitos;
      this.efeitosGain.connect(this.masterGain);
    }catch(e){}
    this.audioBatalha = document.getElementById('audio-batalha');
    if(this.audioBatalha) this.audioBatalha.volume = this.volumeMusica;
  },
  garantirInicio:function(){
    this.init();
    if(!this.ctx) return;
    if(this.ctx.state === 'suspended'){ try{ this.ctx.resume(); }catch(e){} }
  },
  vibrar:function(ms){ if(ms === undefined) ms = 30; if(!this.vibracaoAtiva) return; if(navigator.vibrate){ try{ navigator.vibrate(ms); }catch(e){} } },
  nota:function(freq, dur, tipo, vol, atraso){
    if(!tipo) tipo = 'square'; if(vol === undefined) vol = 0.5; if(atraso === undefined) atraso = 0;
    if(!this.ctx || this.mudo) return;
    try{
      var t = this.ctx.currentTime + atraso;
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      osc.type = tipo;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g); g.connect(this.efeitosGain);
      osc.start(t); osc.stop(t + dur + 0.05);
    }catch(e){}
  },
  click:function(){ this.garantirInicio(); this.nota(880, 0.06, 'square', 0.4); this.vibrar(15); },
  clickMenu:function(){ this.garantirInicio(); this.nota(660, 0.05, 'triangle', 0.3); this.vibrar(10); },
  clickLoja:function(){ this.garantirInicio(); this.nota(880, 0.06, 'square', 0.4); this.nota(1100, 0.06, 'square', 0.35, 0.05); this.vibrar(15); },
  clickBatalha:function(){ this.garantirInicio(); this.nota(1200, 0.05, 'square', 0.5); this.nota(900, 0.05, 'square', 0.4, 0.04); this.vibrar(20); },
  clickErro:function(){ this.garantirInicio(); this.nota(220, 0.15, 'sawtooth', 0.4); this.vibrar(80); },
  moeda:function(){ this.garantirInicio(); this.nota(988, 0.08, 'square', 0.5); this.nota(1319, 0.15, 'square', 0.5, 0.08); },
  cura:function(){ this.garantirInicio(); var s=this; [523,659,784,1047].forEach(function(f,i){ s.nota(f, 0.15, 'sine', 0.5, i*0.08); }); },
  erro:function(){ this.garantirInicio(); this.nota(220, 0.15, 'sawtooth', 0.4); this.nota(180, 0.2, 'sawtooth', 0.4, 0.1); },
  levelUp:function(){ this.garantirInicio(); var s=this; [523,659,784,1047,1319].forEach(function(f,i){ s.nota(f, 0.15, 'triangle', 0.6, i*0.08); }); },
  conquista:function(){ this.garantirInicio(); var s=this; [523,659,784,1047,1319].forEach(function(f,i){ s.nota(f, 0.2, 'triangle', 0.7, i*0.1); }); },
  pokemonNovo:function(){ this.garantirInicio(); var s=this; [660,880,1047,1319].forEach(function(f,i){ s.nota(f, 0.12, 'triangle', 0.5, i*0.08); }); },
  shiny:function(){ this.garantirInicio(); var s=this; [1047,1319,1568,2093,2637].forEach(function(f,i){ s.nota(f, 0.15, 'triangle', 0.8, i*0.08); }); },
  mega:function(){ this.garantirInicio(); var s=this; [523,659,784,1047,1319].forEach(function(f,i){ s.nota(f, 0.2, 'sine', 0.7, i*0.1); }); },
  gmax:function(){ this.garantirInicio(); var s=this; [131,262,392,523,659,784,1047].forEach(function(f,i){ s.nota(f, 0.25, 'sawtooth', 0.5, i*0.1); }); },
  batalhaInicio:function(){ this.garantirInicio(); var s=this; [392,523,659,784].forEach(function(f,i){ s.nota(f, 0.2, 'square', 0.5, i*0.1); }); },
  batalhaTema:function(tipo){
    this.init();
    if(!this.audioBatalha) return;
    var temas = {
      selvagem:"https://play.pokemonshowdown.com/audio/bw2-battle-wild.ogg",
      treinador:"https://play.pokemonshowdown.com/audio/bw2-battle-trainer.ogg",
      ginásio:"https://play.pokemonshowdown.com/audio/bw2-battle-gym.ogg",
      copa:"https://play.pokemonshowdown.com/audio/bw2-battle-trainer.ogg",
      liga:"https://play.pokemonshowdown.com/audio/bw2-battle-elite4.ogg",
      rocket:"https://play.pokemonshowdown.com/audio/bw2-battle-plasma.ogg"
    };
    var tema = temas[tipo] || temas.selvagem;
    this.audioBatalha.src = tema;
    this.audioBatalha.volume = this.volumeMusica;
    this.audioBatalha.loop = true;
    if(!this.mudo){ try{ this.audioBatalha.play().catch(function(){}); }catch(e){} }
  },
  pararBatalhaTema:function(){
    if(this.audioBatalha){ try{ this.audioBatalha.pause(); this.audioBatalha.currentTime = 0; }catch(e){} }
  },
  batalhaVitoria:function(){ this.garantirInicio(); this.pararBatalhaTema(); var s=this; [523,659,784].forEach(function(f,i){ s.nota(f, 0.15, 'square', 0.6, i*0.12); }); this.nota(1047, 0.4, 'triangle', 0.7, 0.4); },
  batalhaDerrota:function(){ this.garantirInicio(); this.pararBatalhaTema(); var s=this; [392,349,330,262].forEach(function(f,i){ s.nota(f, 0.3, 'sawtooth', 0.4, i*0.15); }); },
  somPokebolaAbre:function(){ this.garantirInicio(); this.nota(600, 0.05, 'square', 0.6); this.nota(900, 0.08, 'square', 0.6, 0.05); this.nota(1200, 0.1, 'square', 0.6, 0.1); },
  somSucao:function(){
    this.garantirInicio();
    if(!this.ctx || this.mudo) return;
    try{
      var t = this.ctx.currentTime;
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.4);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(g); g.connect(this.efeitosGain);
      osc.start(t); osc.stop(t + 0.45);
    }catch(e){}
  },
  somBalanco:function(){ this.garantirInicio(); this.nota(500, 0.06, 'square', 0.5); this.nota(700, 0.06, 'square', 0.5, 0.06); },
  somCapturaFinal:function(){ this.garantirInicio(); this.nota(1319, 0.1, 'square', 0.7); this.nota(1568, 0.1, 'square', 0.7, 0.1); this.nota(2093, 0.3, 'triangle', 0.8, 0.2); },
  somFuga:function(){ this.garantirInicio(); var s=this; [880,698,523,392].forEach(function(f,i){ s.nota(f, 0.15, 'sawtooth', 0.5, i*0.1); }); },
  evolucao:function(){ var s=this; this.garantirInicio(); [262,330,392,523,659,784].forEach(function(f,i){ s.nota(f, 0.2, 'square', 0.5, i*0.1); }); },
  taca:function(){ this.garantirInicio(); var s=this; [523,659,784,1047,1319].forEach(function(f,i){ s.nota(f, 0.3, 'triangle', 0.8, i*0.15); }); },
  trofeu:function(){ this.garantirInicio(); var s=this; [784,988,1175,1568].forEach(function(f,i){ s.nota(f, 0.2, 'triangle', 0.8, i*0.1); }); },
  ataque:function(){ this.garantirInicio(); this.nota(1600, 0.05, 'square', 0.6); this.nota(1200, 0.05, 'square', 0.6, 0.05); },
  amizade:function(){ this.garantirInicio(); var s=this; [784,988,1175].forEach(function(f,i){ s.nota(f, 0.12, 'sine', 0.5, i*0.08); }); },
  troca:function(){ this.garantirInicio(); this.nota(523, 0.1, 'triangle', 0.5); this.nota(659, 0.1, 'triangle', 0.5, 0.1); this.nota(784, 0.2, 'triangle', 0.6, 0.2); },
  xpGanho:function(){ this.garantirInicio(); this.nota(1319, 0.08, 'triangle', 0.6); this.nota(1568, 0.12, 'triangle', 0.6, 0.06); },
  supercopa:function(){ this.garantirInicio(); var s=this; [523,659,784,1047,1319,1568,2093].forEach(function(f,i){ s.nota(f, 0.4, 'triangle', 0.9, i*0.2); }); },
  golpe:function(efet, tipo){
    this.garantirInicio();
    if(efet > 1){ this.nota(1600, 0.08, 'square', 0.8); this.nota(2000, 0.12, 'square', 0.7, 0.08); }
    else if(efet < 1 && efet > 0){ this.nota(400, 0.15, 'sawtooth', 0.4); }
    else{ this.nota(1200, 0.08, 'square', 0.6); }
  },
  statusAplicado:function(){ this.garantirInicio(); this.nota(400, 0.1, 'sawtooth', 0.5); this.nota(300, 0.15, 'sawtooth', 0.5, 0.1); },
  rocketAlerta:function(){ this.garantirInicio(); var s=this; [330,392,330,392].forEach(function(f,i){ s.nota(f, 0.15, 'sawtooth', 0.6, i*0.12); }); },
  rocketDerrotada:function(){ this.garantirInicio(); var s=this; [784,659,523,392].forEach(function(f,i){ s.nota(f, 0.2, 'square', 0.6, i*0.12); }); },
  online:function(){ this.garantirInicio(); this.nota(1319, 0.08, 'triangle', 0.6); this.nota(1568, 0.12, 'triangle', 0.6, 0.08); },
  offline:function(){ this.garantirInicio(); this.nota(659, 0.1, 'sawtooth', 0.4); this.nota(440, 0.15, 'sawtooth', 0.4, 0.1); },
  toggleMudo:function(){
    this.mudo = !this.mudo;
    if(this.mudo && this.audioBatalha){ try{ this.audioBatalha.pause(); }catch(e){} }
    else if(!this.mudo && this.audioBatalha && this.audioBatalha.src){
      try{ this.audioBatalha.play().catch(function(){}); }catch(e){}
    }
    return this.mudo;
  }
};
document.addEventListener('pointerdown', function(){ AudioSFX.garantirInicio(); }, {capture:true});

// =============== DESCRIÇÕES DE HABILIDADES ===============
var DESCRICOES_HABILIDADES = {
  'Blaze': 'Quando o HP cai abaixo de 1/3, o poder de ataques de Fogo aumenta em 50%.',
  'Torrent': 'Quando o HP cai abaixo de 1/3, o poder de ataques de Água aumenta em 50%.',
  'Overgrow': 'Quando o HP cai abaixo de 1/3, o poder de ataques de Planta aumenta em 50%.',
  'Swarm': 'Quando o HP cai abaixo de 1/3, o poder de ataques de Inseto aumenta em 50%.',
  'Intimidate': 'Ao entrar em batalha, reduz o Ataque do oponente em 1 estágio.',
  'Levitate': 'Imune a ataques do tipo Terra.',
  'Sturdy': 'Sobrevive a qualquer ataque com pelo menos 1 HP se estiver com HP cheio.',
  'Static': '30% de chance de paralisar o atacante ao receber dano de contato.',
  'Flame Body': '30% de chance de queimar o atacante ao receber dano de contato.',
  'Poison Point': '30% de chance de envenenar o atacante ao receber dano de contato.',
  'Effect Spore': '30% de chance de aplicar status (paralisia, sono ou veneno) ao atacante.',
  'Rough Skin': 'Causa 1/8 de dano máximo ao atacante em contato.',
  'Synchronize': 'Passa queimadura, paralisia ou veneno de volta ao atacante.',
  'Flash Fire': 'Imune a Fogo. Se atingido por Fogo, potencia seus próprios ataques de Fogo.',
  'Drought': 'Ao entrar em batalha, invoca sol por 5 turnos.',
  'Drizzle': 'Ao entrar em batalha, invoca chuva por 5 turnos.',
  'Water Absorb': 'Cura 25% do HP quando atingido por ataques de Água.',
  'Chlorophyll': 'Dobra a Velocidade sob sol.',
  'Lightning Rod': 'Atrai ataques Elétricos e aumenta o Ataque Especial.',
  'Motor Drive': 'Imune a Elétrico. Aumenta Velocidade quando atingido.',
  'Snow Cloak': 'Aumenta evasão sob tempestade de neve.',
  'Ice Body': 'Cura 1/16 do HP por turno sob tempestade de neve.',
  'Slush Rush': 'Dobra a Velocidade sob tempestade de neve.',
  'Guts': 'Aumenta Ataque em 50% quando afetado por status.',
  'Inner Focus': 'Imune a hesitação (flinch).',
  'Justified': 'Aumenta Ataque quando atingido por ataques Sombrios.',
  'Corrosion': 'Pode envenenar Pokémons de Aço ou Venenosos.',
  'Sand Veil': 'Aumenta evasão sob tempestade de areia.',
  'Sand Rush': 'Dobra a Velocidade sob tempestade de areia.',
  'Arena Trap': 'Impede que Pokémons do oponente fujam.',
  'Keen Eye': 'Imune a redução de precisão.',
  'Gale Wings': 'Ataques Voadores têm prioridade +1 quando HP está cheio.',
  'Magic Guard': 'Só recebe dano de ataques diretos.',
  'Compound Eyes': 'Aumenta precisão em 30%.',
  'Tinted Lens': 'Ataques pouco efetivos causam dobro de dano.',
  'Solid Rock': 'Reduz dano super efetivo em 25%.',
  'Sand Stream': 'Ao entrar em batalha, invoca tempestade de areia por 5 turnos.',
  'Cursed Body': '30% de chance de desabilitar o move do atacante.',
  'Infiltrator': 'Ignora barreiras como Reflect e Light Screen.',
  'Multiscale': 'Reduz dano em 50% quando HP está cheio.',
  'Rivalry': 'Aumenta dano contra Pokémons do mesmo sexo.',
  'Moxie': 'Aumenta Ataque após nocautear um oponente.',
  'Dark Aura': 'Aumenta poder de ataques Sombrios em 33%.',
  'Clear Body': 'Impede redução de stats pelo oponente.',
  'Iron Barbs': 'Causa 1/8 de dano máximo ao atacante em contato.',
  'Light Metal': 'Reduz o peso do Pokémon pela metade.',
  'Pixilate': 'Ataques Normais viram Fada e ganham 30% de poder.',
  'Cute Charm': '30% de chance de atrair o atacante em contato.',
  'Misty Surge': 'Ao entrar em batalha, cria névoa por 5 turnos.',
  'Run Away': 'Permite fugir de qualquer batalha selvagem.',
  'Adaptability': 'STAB aumenta de 1.5× para 2.0×.',
  'Serene Grace': 'Dobra a chance de efeitos secundários dos moves.'
};

// =============== TIPOS ===============
var TIPOS_POKEMON = {
  normal:{cor:'#a8a878',nome:'Normal'}, fire:{cor:'#f08030',nome:'Fogo'},
  water:{cor:'#6890f0',nome:'Água'}, electric:{cor:'#f8d030',nome:'Elétrico'},
  grass:{cor:'#78c850',nome:'Planta'}, ice:{cor:'#98d8d8',nome:'Gelo'},
  fighting:{cor:'#c03028',nome:'Lutador'}, poison:{cor:'#a040a0',nome:'Venenoso'},
  ground:{cor:'#e0c068',nome:'Terra'}, flying:{cor:'#a890f0',nome:'Voador'},
  psychic:{cor:'#f85888',nome:'Psíquico'}, bug:{cor:'#a8b820',nome:'Inseto'},
  rock:{cor:'#b8a038',nome:'Pedra'}, ghost:{cor:'#705898',nome:'Fantasma'},
  dragon:{cor:'#7038f8',nome:'Dragão'}, dark:{cor:'#705848',nome:'Sombrio'},
  steel:{cor:'#b8b8d0',nome:'Aço'}, fairy:{cor:'#ee99ac',nome:'Fada'}
};
var ICONES_TIPO = {
  fire:'fa-fire', water:'fa-droplet', grass:'fa-leaf', electric:'fa-bolt',
  psychic:'fa-brain', dragon:'fa-dragon', ice:'fa-snowflake', fighting:'fa-hand-fist',
  poison:'fa-skull-crossbones', ground:'fa-mountain', flying:'fa-dove', bug:'fa-bug',
  rock:'fa-gem', ghost:'fa-ghost', dark:'fa-moon', steel:'fa-gear',
  fairy:'fa-wand-sparkles', normal:'fa-circle'
};
var CORES_TIPO_TM = {
  normal:{cor:'#a8a878',escuro:'#7a7a52'}, fire:{cor:'#f08030',escuro:'#a85420'},
  water:{cor:'#6890f0',escuro:'#4060b0'}, electric:{cor:'#f8d030',escuro:'#b89800'},
  grass:{cor:'#78c850',escuro:'#4a8a2c'}, ice:{cor:'#98d8d8',escuro:'#589898'},
  fighting:{cor:'#c03028',escuro:'#80201a'}, poison:{cor:'#a040a0',escuro:'#6a2a6a'},
  ground:{cor:'#e0c068',escuro:'#a08030'}, flying:{cor:'#a890f0',escuro:'#7060b0'},
  psychic:{cor:'#f85888',escuro:'#b02858'}, bug:{cor:'#a8b820',escuro:'#708014'},
  rock:{cor:'#b8a038',escuro:'#806a20'}, ghost:{cor:'#705898',escuro:'#48386a'},
  dragon:{cor:'#7038f8',escuro:'#4a20b0'}, dark:{cor:'#705848',escuro:'#483830'},
  steel:{cor:'#b8b8d0',escuro:'#8080a0'}, fairy:{cor:'#ee99ac',escuro:'#b06070'}
};
function corTM(tipo){ return CORES_TIPO_TM[tipo] || CORES_TIPO_TM.normal; }

var ICONES_ITEM_FALLBACK = {
  "Poção":"fa-flask","Super Poção":"fa-flask","Hiper Poção":"fa-flask","Poção Máxima":"fa-flask",
  "Antídoto":"fa-syringe","Anti-Paralisia":"fa-syringe","Despertar":"fa-syringe","Full Heal":"fa-syringe",
  "Revive":"fa-heart-pulse","Máximo Reviver":"fa-heart-pulse",
  "Rare Candy":"fa-candy-cane","Maca de Resgate":"fa-apple-whole","Mel Doce":"fa-jar","Jumbo Sorvete":"fa-ice-cream",
  "Oran Berry":"fa-apple-whole","Sitrus Berry":"fa-apple-whole","Cheri Berry":"fa-apple-whole",
  "Choice Band":"fa-hand-fist","Choice Specs":"fa-glasses","Choice Scarf":"fa-scarf",
  "Focus Sash":"fa-bandage","Life Orb":"fa-gem","Leftovers":"fa-utensils",
  "Energia Max (25)":"fa-bolt","Chave Rocket":"fa-key"
};
function iconeItem(nome){ return ICONES_ITEM_FALLBACK[nome] || 'fa-cube'; }

// =============== SPRITES DE TREINADORES ===============
var TRAINER_SPRITES_MAP = {
  "Brock":"brock","Misty":"misty","Lt. Surge":"ltsurge","Erika":"erika","Koga":"koga",
  "Sabrina":"sabrina","Blaine":"blaine","Giovanni":"giovanni",
  "Blue":"blue","Red":"red","Green":"green","Trace":"trace","Leaf":"leaf",
  "Falkner":"falkner","Bugsy":"bugsy","Whitney":"whitney","Morty":"morty","Chuck":"chuck",
  "Jasmine":"jasmine","Pryce":"pryce","Clair":"clair","Lance":"lance",
  "Roxanne":"roxanne","Brawly":"brawly","Wattson":"wattson","Flannery":"flannery",
  "Norman":"norman","Winona":"winona","Tate":"tate","Liza":"liza",
  "Wallace":"wallace","Steven":"steven","May":"may","Brendan":"brendan","Wally":"wally",
  "Roark":"roark","Gardenia":"gardenia","Maylene":"maylene","Crasher Wake":"crasherwake",
  "Fantina":"fantina","Byron":"byron","Candice":"candice","Volkner":"volkner",
  "Cynthia":"cynthia","Barry":"barry","Lucas":"lucas","Dawn":"dawn",
  "Cilan":"cilan","Lenora":"lenora","Burgh":"burgh","Elesa":"elesa","Clay":"clay",
  "Skyla":"skyla","Brycen":"brycen","Drayden":"drayden",
  "Alder":"alder","N":"n","Hilda":"hilda","Hilbert":"hilbert","Bianca":"bianca",
  "Cheren":"cheren","Iris":"iris",
  "Viola":"viola","Grant":"grant","Korrina":"korrina","Ramos":"ramos",
  "Clemont":"clemont","Valerie":"valerie","Olympia":"olympia","Wulfric":"wulfric",
  "Diantha":"diantha","Serena":"serena","Calem":"calem","Shauna":"shauna",
  "Ilima":"ilima","Lana":"lana","Kiawe":"kiawe","Mallow":"mallow",
  "Sophocles":"sophocles","Acerola":"acerola","Mina":"mina","Hapu":"hapu",
  "Kukui":"kukui","Gladion":"gladion","Hau":"hau","Lillie":"lillie",
  "Milo":"milo","Nessa":"nessa","Kabu":"kabu","Bea":"bea","Allister":"allister",
  "Opal":"opal","Gordie":"gordie","Melony":"melony","Piers":"piers",
  "Raihan":"raihan","Leon":"leon","Marnie":"marnie","Hop":"hop","Bede":"bede","Sonia":"sonia",
  "Katy":"katy","Brassius":"brassius","Iono":"iono","Kofu":"kofu","Larry":"larry",
  "Ryme":"ryme","Tulip":"tulip","Grusha":"grusha",
  "Geeta":"geeta","Nemona":"nemona","Arven":"arven","Penny":"penny","Clavell":"clavell",
  "Jovem":"youngster","Pescador":"fisherman","Campista":"camper","Ciclista":"cyclist",
  "Estudante":"student","Cientista":"scientist","Mochileiro":"backpacker",
  "Aventureiro":"hiker","Ranger":"pokemonranger","Cultivador":"aromalady",
  "Lutador":"blackbelt","Professor":"professor",
  "Rocket Recruta":"teamrocket","Rocket Agente":"teamrocket",
  "Rocket Executivo":"teamrocket","Rocket Chefe":"giovanni"
};
function spriteTreinador(nome){
  if(!nome) return null;
  var slug = TRAINER_SPRITES_MAP[nome] || nome.toLowerCase().replace(/\s+/g,'').replace(/\./g,'').replace(/'/g,'');
  return SHOWDOWN_TRAINERS + slug + '.png';
}

// =============== REGIÕES ===============
var REGIOES = [
  {nome:"Kanto",passaportes:0}, {nome:"Johto",passaportes:5}, {nome:"Hoenn",passaportes:14},
  {nome:"Sinnoh",passaportes:25}, {nome:"Unova",passaportes:36}, {nome:"Kalos",passaportes:48},
  {nome:"Alola",passaportes:61}, {nome:"Galar",passaportes:82}, {nome:"Paldea",passaportes:112}
];
var NOMES_REGIOES = REGIOES.map(function(r){return r.nome;});

var INICIAIS = {
  Kanto:[{id:1,nome:"Bulbasaur"},{id:4,nome:"Charmander"},{id:7,nome:"Squirtle"}],
  Johto:[{id:152,nome:"Chikorita"},{id:155,nome:"Cyndaquil"},{id:158,nome:"Totodile"}],
  Hoenn:[{id:252,nome:"Treecko"},{id:255,nome:"Torchic"},{id:258,nome:"Mudkip"}],
  Sinnoh:[{id:387,nome:"Turtwig"},{id:390,nome:"Chimchar"},{id:393,nome:"Piplup"}],
  Unova:[{id:495,nome:"Snivy"},{id:498,nome:"Tepig"},{id:501,nome:"Oshawott"}],
  Kalos:[{id:650,nome:"Chespin"},{id:653,nome:"Fennekin"},{id:656,nome:"Froakie"}],
  Alola:[{id:722,nome:"Rowlet"},{id:725,nome:"Litten"},{id:728,nome:"Popplio"}],
  Galar:[{id:810,nome:"Grookey"},{id:813,nome:"Scorbunny"},{id:816,nome:"Sobble"}],
  Paldea:[{id:906,nome:"Sprigatito"},{id:909,nome:"Fuecoco"},{id:912,nome:"Quaxly"}]
};

var GERACOES_POR_REGIAO = {
  Kanto:{min:1,max:151}, Johto:{min:152,max:251}, Hoenn:{min:252,max:386},
  Sinnoh:{min:387,max:493}, Unova:{min:494,max:649}, Kalos:{min:650,max:721},
  Alola:{min:722,max:809}, Galar:{min:810,max:905}, Paldea:{min:906,max:1025}
};
var REGIOES_POR_FAIXA = ['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola','Galar','Paldea'];

function regioesPermitidas(regiaoAtual){
  var idx = REGIOES_POR_FAIXA.indexOf(regiaoAtual);
  if(idx < 0) idx = 0;
  return REGIOES_POR_FAIXA.slice(0, idx + 1);
}
function idPermitidoNaRegiao(id, regiaoAtual){
  var permitidas = regioesPermitidas(regiaoAtual);
  for(var i = 0; i < permitidas.length; i++){
    var g = GERACOES_POR_REGIAO[permitidas[i]];
    if(id >= g.min && id <= g.max) return true;
  }
  return false;
}

// =============== NATUREZAS ===============
var NATUREZAS = [
  {nome:"Hardy",desc:"Neutra",up:null,down:null}, {nome:"Lonely",desc:"+Ataque/-Defesa",up:'atk',down:'def'},
  {nome:"Brave",desc:"+Ataque/-Velocidade",up:'atk',down:'spe'}, {nome:"Adamant",desc:"+Ataque/-Atq.Esp.",up:'atk',down:'spa'},
  {nome:"Naughty",desc:"+Ataque/-Def.Esp.",up:'atk',down:'spd'}, {nome:"Bold",desc:"+Defesa/-Ataque",up:'def',down:'atk'},
  {nome:"Docile",desc:"Neutra",up:null,down:null}, {nome:"Relaxed",desc:"+Defesa/-Velocidade",up:'def',down:'spe'},
  {nome:"Impish",desc:"+Defesa/-Atq.Esp.",up:'def',down:'spa'}, {nome:"Lax",desc:"+Defesa/-Def.Esp.",up:'def',down:'spd'},
  {nome:"Timid",desc:"+Velocidade/-Ataque",up:'spe',down:'atk'}, {nome:"Hasty",desc:"+Velocidade/-Defesa",up:'spe',down:'def'},
  {nome:"Serious",desc:"Neutra",up:null,down:null}, {nome:"Jolly",desc:"+Velocidade/-Atq.Esp.",up:'spe',down:'spa'},
  {nome:"Naive",desc:"+Velocidade/-Def.Esp.",up:'spe',down:'spd'}, {nome:"Modest",desc:"+Atq.Esp./-Ataque",up:'spa',down:'atk'},
  {nome:"Mild",desc:"+Atq.Esp./-Defesa",up:'spa',down:'def'}, {nome:"Quiet",desc:"+Atq.Esp./-Velocidade",up:'spa',down:'spe'},
  {nome:"Bashful",desc:"Neutra",up:null,down:null}, {nome:"Rash",desc:"+Atq.Esp./-Def.Esp.",up:'spa',down:'spd'},
  {nome:"Calm",desc:"+Def.Esp./-Ataque",up:'spd',down:'atk'}, {nome:"Gentle",desc:"+Def.Esp./-Defesa",up:'spd',down:'def'},
  {nome:"Sassy",desc:"+Def.Esp./-Velocidade",up:'spd',down:'spe'}, {nome:"Careful",desc:"+Def.Esp./-Atq.Esp.",up:'spd',down:'spa'},
  {nome:"Quirky",desc:"Neutra",up:null,down:null}
];
function sortearNatureza(){ return NATUREZAS[Math.floor(Math.random() * NATUREZAS.length)]; }

// =============== SEXO ===============
var POKEMON_SEM_SEXO = ['Articuno','Zapdos','Moltres','Mewtwo','Mew','Raikou','Entei','Suicune','Lugia','Ho-Oh','Celebi','Regirock','Regice','Registeel','Kyogre','Groudon','Rayquaza','Jirachi','Deoxys','Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Regigigas','Giratina','Cresselia','Phione','Manaphy','Darkrai','Shaymin','Arceus','Victini','Cobalion','Terrakion','Virizion','Tornadus','Thundurus','Reshiram','Zekrom','Landorus','Kyurem','Keldeo','Meloetta','Genesect','Xerneas','Yveltal','Zygarde','Diancie','Hoopa','Volcanion','Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Cosmog','Cosmoem','Solgaleo','Lunala','Nihilego','Buzzwole','Pheromosa','Xurkitree','Celesteela','Kartana','Guzzlord','Necrozma','Magearna','Marshadow','Poipole','Naganadel','Stakataka','Blacephalon','Zeraora','Meltan','Melmetal','Zacian','Zamazenta','Eternatus','Kubfu','Urshifu','Zarude','Regieleki','Regidrago','Glastrier','Spectrier','Calyrex','Enamorus','Koraidon','Miraidon','Wo-Chien','Chien-Pao','Ting-Lu','Chi-Yu','Roaring Moon','Iron Valiant','Walking Wake','Iron Leaves','Okidogi','Munkidori','Fezandipiti','Ogerpon','Terapagos','Pecharunt','Ditto','Porygon','Porygon2','Porygon-Z','Magnemite','Magneton','Magnezone','Beldum','Metang','Metagross','Rotom','Klink','Klang','Klinklang','Golett','Golurk','Falinks','Sinistea','Polteageist','Voltorb','Electrode','Staryu','Starmie','Baltoy','Claydol','Shedinja','Carbink','Minior'];
function pokemonTemSexo(nome){ return POKEMON_SEM_SEXO.indexOf(nome) === -1; }
function sortearSexo(nome){
  if(!pokemonTemSexo(nome)) return 'N';
  return Math.random() < 0.5 ? 'M' : 'F';
}

// =============== FORMAS REGIONAIS ===============
var FORMAS_REGIONAIS_POR_POKEMON = {
  "Rattata":{alola:{id:10091,nome:"Rattata de Alola"}}, "Raticate":{alola:{id:10092,nome:"Raticate de Alola"}},
  "Raichu":{alola:{id:10100,nome:"Raichu de Alola"}}, "Sandshrew":{alola:{id:10101,nome:"Sandshrew de Alola"}},
  "Sandslash":{alola:{id:10102,nome:"Sandslash de Alola"}}, "Vulpix":{alola:{id:10103,nome:"Vulpix de Alola"}},
  "Ninetales":{alola:{id:10104,nome:"Ninetales de Alola"}}, "Diglett":{alola:{id:10105,nome:"Diglett de Alola"}},
  "Dugtrio":{alola:{id:10106,nome:"Dugtrio de Alola"}}, "Meowth":{alola:{id:10107,nome:"Meowth de Alola"},galar:{id:10161,nome:"Meowth de Galar"}},
  "Persian":{alola:{id:10108,nome:"Persian de Alola"}}, "Geodude":{alola:{id:10109,nome:"Geodude de Alola"}},
  "Graveler":{alola:{id:10110,nome:"Graveler de Alola"}}, "Golem":{alola:{id:10111,nome:"Golem de Alola"}},
  "Grimer":{alola:{id:10112,nome:"Grimer de Alola"}}, "Muk":{alola:{id:10113,nome:"Muk de Alola"}},
  "Exeggutor":{alola:{id:10114,nome:"Exeggutor de Alola"}}, "Marowak":{alola:{id:10115,nome:"Marowak de Alola"}},
  "Ponyta":{galar:{id:10162,nome:"Ponyta de Galar"}}, "Rapidash":{galar:{id:10163,nome:"Rapidash de Galar"}},
  "Slowpoke":{galar:{id:10164,nome:"Slowpoke de Galar"}}, "Slowbro":{galar:{id:10165,nome:"Slowbro de Galar"}},
  "Farfetchd":{galar:{id:10166,nome:"Farfetch'd de Galar"}}, "Weezing":{galar:{id:10167,nome:"Weezing de Galar"}},
  "MrMime":{galar:{id:10168,nome:"Mr. Mime de Galar"}}, "Corsola":{galar:{id:10173,nome:"Corsola de Galar"}},
  "Zigzagoon":{galar:{id:10174,nome:"Zigzagoon de Galar"}}, "Linoone":{galar:{id:10175,nome:"Linoone de Galar"}},
  "Darumaka":{galar:{id:10176,nome:"Darumaka de Galar"}}, "Darmanitan":{galar:{id:10177,nome:"Darmanitan de Galar"}},
  "Yamask":{galar:{id:10179,nome:"Yamask de Galar"}}, "Stunfisk":{galar:{id:10180,nome:"Stunfisk de Galar"}},
  "Growlithe":{hisui:{id:10229,nome:"Growlithe de Hisui"}}, "Arcanine":{hisui:{id:10230,nome:"Arcanine de Hisui"}},
  "Voltorb":{hisui:{id:10231,nome:"Voltorb de Hisui"}}, "Electrode":{hisui:{id:10232,nome:"Electrode de Hisui"}},
  "Typhlosion":{hisui:{id:10233,nome:"Typhlosion de Hisui"}}, "Samurott":{hisui:{id:10236,nome:"Samurott de Hisui"}},
  "Zorua":{hisui:{id:10238,nome:"Zorua de Hisui"}}, "Zoroark":{hisui:{id:10239,nome:"Zoroark de Hisui"}},
  "Braviary":{hisui:{id:10240,nome:"Braviary de Hisui"}}, "Sliggoo":{hisui:{id:10241,nome:"Sliggoo de Hisui"}},
  "Goodra":{hisui:{id:10242,nome:"Goodra de Hisui"}}, "Avalugg":{hisui:{id:10243,nome:"Avalugg de Hisui"}},
  "Decidueye":{hisui:{id:10244,nome:"Decidueye de Hisui"}},
  "Tauros":{paldea:{id:10250,nome:"Tauros de Paldea"}}, "Wooper":{paldea:{id:10253,nome:"Wooper de Paldea"}}
};
var NOMES_FORMAS = {alola:'Alolan',galar:'Galarian',hisui:'Hisuian',paldea:'Paldean'};

// =============== EVOLUÇÕES DIA/NOITE ===============
var EVOLUCOES_DIA_NOITE = {
  "Eevee":{dia:"Espeon",noite:"Umbreon",nivelMinimo:25,amizadeNecessaria:800},
  "Rockruff":{dia:"Lycanroc",noite:"Lycanroc",nivelMinimo:25,formasDiferentes:true,
    diaForma:"lycanroc-midday",noiteForma:"lycanroc-midnight"},
  "Fomantis":{dia:"Lurantis",nivelMinimo:34},
  "Yungoos":{dia:"Gumshoos",nivelMinimo:20},
  "Pikipek":{dia:"Toucannon",nivelMinimo:28},
  "Grubbin":{dia:"Charjabug",nivelMinimo:20},
  "Murkrow":{noite:"Honchkrow",nivelMinimo:30},
  "Misdreavus":{noite:"Mismagius",nivelMinimo:30},
  "Sneasel":{noite:"Weavile",nivelMinimo:30}
};
function ehNoite(){ var h = new Date().getHours(); return h >= 18 || h < 6; }
function ehDia(){ var h = new Date().getHours(); return h >= 6 && h < 18; }

// =============== MEGA EVOLUÇÕES (Z-A incluídas) ===============
var MEGA_EVOLUCOES = {
  "Venusaur":{showdown:"venusaur-mega",pedra:"Venusaurita",stoneSerebii:"venusaurite",boost:{atk:1.2,spa:1.3,def:1.15}},
  "Charizard":{showdown:"charizard-megax",pedra:"Charizardita X",pedraAlternativa:"Charizardita Y",showdownAlt:"charizard-megay",stoneSerebii:"charizarditex",stoneSerebiiAlt:"charizarditey",duasFormas:true,boost:{atk:1.4,def:1.2}},
  "Blastoise":{showdown:"blastoise-mega",pedra:"Blastoisita",stoneSerebii:"blastoisinite",boost:{spa:1.3,spd:1.2}},
  "Beedrill":{showdown:"beedrill-mega",pedra:"Beedrillita",stoneSerebii:"beedrillite",boost:{atk:1.5,spe:1.3}},
  "Pidgeot":{showdown:"pidgeot-mega",pedra:"Pidgeotita",stoneSerebii:"pidgeotite",boost:{spa:1.3,spe:1.2}},
  "Alakazam":{showdown:"alakazam-mega",pedra:"Alakazamita",stoneSerebii:"alakazite",boost:{spa:1.4,spe:1.3}},
  "Slowbro":{showdown:"slowbro-mega",pedra:"Slowbronita",stoneSerebii:"slowbronite",boost:{def:1.5,spa:1.2}},
  "Gengar":{showdown:"gengar-mega",pedra:"Gengarita",stoneSerebii:"gengarite",boost:{spa:1.4,spe:1.3}},
  "Kangaskhan":{showdown:"kangaskhan-mega",pedra:"Kangaskhanita",stoneSerebii:"kangaskhanite",boost:{atk:1.3,def:1.2}},
  "Pinsir":{showdown:"pinsir-mega",pedra:"Pinsirita",stoneSerebii:"pinsirite",boost:{atk:1.4,def:1.2}},
  "Gyarados":{showdown:"gyarados-mega",pedra:"Gyaradosita",stoneSerebii:"gyaradosite",boost:{atk:1.3,def:1.2}},
  "Aerodactyl":{showdown:"aerodactyl-mega",pedra:"Aerodactylita",stoneSerebii:"aerodactylite",boost:{atk:1.3,spe:1.3}},
  "Mewtwo":{showdown:"mewtwo-megax",pedra:"Mewtwonita X",pedraAlternativa:"Mewtwonita Y",showdownAlt:"mewtwo-megay",stoneSerebii:"mewtwonitex",stoneSerebiiAlt:"mewtwonitey",duasFormas:true,boost:{atk:1.4,spa:1.4}},
  "Ampharos":{showdown:"ampharos-mega",pedra:"Ampharosita",stoneSerebii:"ampharosite",boost:{spa:1.4,spd:1.2}},
  "Steelix":{showdown:"steelix-mega",pedra:"Steelixita",stoneSerebii:"steelixite",boost:{def:1.5,atk:1.2}},
  "Scizor":{showdown:"scizor-mega",pedra:"Scizorita",stoneSerebii:"scizorite",boost:{atk:1.3,def:1.3}},
  "Heracross":{showdown:"heracross-mega",pedra:"Heracrossita",stoneSerebii:"heracronite",boost:{atk:1.5,def:1.2}},
  "Houndoom":{showdown:"houndoom-mega",pedra:"Houndoomita",stoneSerebii:"houndoominite",boost:{spa:1.3,spe:1.2}},
  "Tyranitar":{showdown:"tyranitar-mega",pedra:"Tyranitarita",stoneSerebii:"tyranitarite",boost:{atk:1.3,def:1.3}},
  "Sceptile":{showdown:"sceptile-mega",pedra:"Sceptilita",stoneSerebii:"sceptilite",boost:{spa:1.4,spe:1.3}},
  "Blaziken":{showdown:"blaziken-mega",pedra:"Blazikenita",stoneSerebii:"blazikenite",boost:{atk:1.4,spe:1.2}},
  "Swampert":{showdown:"swampert-mega",pedra:"Swampertita",stoneSerebii:"swampertite",boost:{atk:1.3,def:1.3}},
  "Gardevoir":{showdown:"gardevoir-mega",pedra:"Gardevoirita",stoneSerebii:"gardevoirite",boost:{spa:1.4,spd:1.2}},
  "Sableye":{showdown:"sableye-mega",pedra:"Sableyeita",stoneSerebii:"sablenite",boost:{def:1.5,spd:1.3}},
  "Mawile":{showdown:"mawile-mega",pedra:"Mawilita",stoneSerebii:"mawilite",boost:{atk:1.4,def:1.3}},
  "Aggron":{showdown:"aggron-mega",pedra:"Aggronita",stoneSerebii:"aggronite",boost:{def:1.5,atk:1.2}},
  "Medicham":{showdown:"medicham-mega",pedra:"Medichamita",stoneSerebii:"medichamite",boost:{atk:1.3,spe:1.2}},
  "Manectric":{showdown:"manectric-mega",pedra:"Manectricita",stoneSerebii:"manectite",boost:{spa:1.3,spe:1.3}},
  "Banette":{showdown:"banette-mega",pedra:"Banettita",stoneSerebii:"banettite",boost:{atk:1.5}},
  "Absol":{showdown:"absol-mega",pedra:"Absolita",stoneSerebii:"absolite",boost:{atk:1.4,spe:1.3}},
  "Glalie":{showdown:"glalie-mega",pedra:"Glalitita",stoneSerebii:"glalitite",boost:{spa:1.3,spe:1.2}},
  "Salamence":{showdown:"salamence-mega",pedra:"Salamencita",stoneSerebii:"salamencite",boost:{atk:1.4,def:1.2}},
  "Metagross":{showdown:"metagross-mega",pedra:"Metagrossita",stoneSerebii:"metagrossite",boost:{atk:1.4,def:1.2}},
  "Latias":{showdown:"latias-mega",pedra:"Latiasita",stoneSerebii:"latiasite",boost:{spa:1.3,spd:1.3}},
  "Latios":{showdown:"latios-mega",pedra:"Latiosita",stoneSerebii:"latiosite",boost:{spa:1.4,spd:1.2}},
  "Rayquaza":{showdown:"rayquaza-mega",pedra:"Rayquazita",stoneSerebii:"rayquazite",boost:{atk:1.4,spa:1.4}},
  "Lopunny":{showdown:"lopunny-mega",pedra:"Lopunnita",stoneSerebii:"lopunnite",boost:{atk:1.4,spe:1.3}},
  "Garchomp":{showdown:"garchomp-mega",pedra:"Garchompita",stoneSerebii:"garchompite",boost:{atk:1.4,def:1.2}},
  "Lucario":{showdown:"lucario-mega",pedra:"Lucarita",stoneSerebii:"lucarionite",boost:{atk:1.4,spa:1.3}},
  "Abomasnow":{showdown:"abomasnow-mega",pedra:"Abomasnowita",stoneSerebii:"abomasite",boost:{atk:1.3,spa:1.3}},
  "Gallade":{showdown:"gallade-mega",pedra:"Galladita",stoneSerebii:"galladite",boost:{atk:1.4,spe:1.3}},
  "Audino":{showdown:"audino-mega",pedra:"Audinita",stoneSerebii:"audinite",boost:{def:1.4,spd:1.4}},
  "Diancie":{showdown:"diancie-mega",pedra:"Diancita",stoneSerebii:"diancite",boost:{atk:1.3,spa:1.3}},
  // ============ NOVAS MEGAS Z-A (v23.0) ============
  "Raichu":{showdown:null,img:"https://files.catbox.moe/sx2ejf.png",imgAlt:"https://files.catbox.moe/jwimte.png",pedra:"Raichunita X",pedraAlternativa:"Raichunita Y",duasFormas:true,boost:{spa:1.3,spe:1.4}},
  "Meganium":{showdown:null,img:"https://files.catbox.moe/0n42bp.png",pedra:"Meganiumita",boost:{spa:1.3,spd:1.3}},
  "Feraligatr":{showdown:null,img:"https://files.catbox.moe/1mhjip.gif",pedra:"Feraligatrita",boost:{atk:1.4,def:1.2}},
  "Emboar":{showdown:null,img:"https://files.catbox.moe/v4biy4.png",pedra:"Emboarita",boost:{atk:1.4,spa:1.2}},
  "Excadrill":{showdown:null,img:"https://files.catbox.moe/co1307.png",pedra:"Excadrillita",boost:{atk:1.4,spe:1.2}},
  "Scolipede":{showdown:null,img:"https://files.catbox.moe/lcytue.png",pedra:"Scolipedita",boost:{atk:1.4,spe:1.3}},
  "Scrafty":{showdown:null,img:"https://files.catbox.moe/2ta3qz.png",pedra:"Scraftyita",boost:{atk:1.4,def:1.3}},
  "Eelektross":{showdown:null,img:"https://files.catbox.moe/iphxh9.gif",pedra:"Eelektrossita",boost:{spa:1.4,atk:1.2}},
  "Pyroar":{showdown:null,img:"https://files.catbox.moe/j6r1iz.png",pedra:"Pyroarita",boost:{spa:1.4,spe:1.2}},
  "Malamar":{showdown:null,img:"https://files.catbox.moe/m9ayu3.png",pedra:"Malamarita",boost:{atk:1.4,def:1.2}},
  "Barbaracle":{showdown:null,img:"https://files.catbox.moe/9khkrq.png",pedra:"Barbaraclita",boost:{atk:1.4,def:1.3}},
  "Dragalge":{showdown:null,img:"https://files.catbox.moe/70ygq1.png",pedra:"Dragalgita",boost:{spa:1.4,spd:1.2}},
  "Hawlucha":{showdown:null,img:"https://files.catbox.moe/pu7ijk.png",pedra:"Hawluchita",boost:{atk:1.4,spe:1.3}},
  "Zygarde":{showdown:null,img:"https://files.catbox.moe/8uu9pm.gif",pedra:"Zygardita",boost:{atk:1.4,def:1.3}},
  "Crabominable":{showdown:null,img:"https://files.catbox.moe/c7ty1z.png",pedra:"Crabominablita",boost:{atk:1.4,def:1.3}},
  "Falinks":{showdown:null,img:"https://files.catbox.moe/8kzrf5.png",pedra:"Falinksita",boost:{atk:1.4,def:1.3}}
};

var GMAX_SPRITES = {
  "Venusaur":10195,"Charizard":10196,"Blastoise":10197,"Butterfree":10198,"Pikachu":10199,
  "Meowth":10200,"Machamp":10201,"Gengar":10202,"Kingler":10203,"Lapras":10204,
  "Eevee":10205,"Snorlax":10206,"Garbodor":10207,"Melmetal":10208,"Rillaboom":10209,
  "Cinderace":10210,"Inteleon":10211,"Corviknight":10212,"Orbeetle":10213,"Drednaw":10214,
  "Coalossal":10215,"Flapple":10216,"Appletun":10217,"Sandaconda":10218,"Toxtricity":10219,
  "Centiskorch":10220,"Hatterene":10221,"Grimmsnarl":10222,"Alcremie":10223,"Copperajah":10224,
  "Duraludon":10225,"Urshifu":10226
};

// =============== INSÍGNIAS ===============
function urlInsignia(slug){ return API_ITEM + slug + "-badge.png"; }
var SPRITES_INSIGNIAS = {
  Kanto:["boulder","cascade","thunder","rainbow","soul","marsh","volcano","earth"].map(urlInsignia),
  Johto:["zephyr","hive","plain","fog","storm","mineral","glacier","rising"].map(urlInsignia),
  Hoenn:["stone","knuckle","dynamo","heat","balance","feather","mind","rain"].map(urlInsignia),
  Sinnoh:["coal","forest","cobble","fen","relic","mine","icicle","beacon"].map(urlInsignia),
  Unova:["trio","basic","insect","bolt","quake","jet","freeze","legend"].map(urlInsignia),
  Kalos:["bug","cliff","rumble","plant","voltage","fairy","psychic","iceberg"].map(urlInsignia),
  Alola:["normalium-z","fightinium-z","flyinium-z","poisonium-z","groundium-z","rockium-z","buginium-z","ghostium-z"].map(urlInsignia),
  Galar:["grass","water","fire","fighting","fairy","rock","dark","dragon"].map(urlInsignia),
  Paldea:["bug","grass","water","fire","normal","ghost","psychic","ice"].map(urlInsignia)
};
var ICONES_INSIGNIAS_FA = {
  Kanto:["fa-mountain","fa-droplet","fa-bolt","fa-rainbow","fa-heart","fa-skull","fa-fire","fa-globe"],
  Johto:["fa-dove","fa-bug","fa-star","fa-ghost","fa-cloud-bolt","fa-gear","fa-snowflake","fa-dragon"],
  Hoenn:["fa-gem","fa-hand-fist","fa-bolt","fa-fire","fa-scale-balanced","fa-feather","fa-brain","fa-droplet"],
  Sinnoh:["fa-fire","fa-leaf","fa-mountain","fa-water","fa-landmark","fa-gem","fa-snowflake","fa-lightbulb"],
  Unova:["fa-dice","fa-circle","fa-bug","fa-bolt","fa-mountain","fa-jet-fighter","fa-snowflake","fa-dragon"],
  Kalos:["fa-bug","fa-mountain","fa-hand-fist","fa-leaf","fa-bolt","fa-wand-sparkles","fa-brain","fa-snowflake"],
  Alola:["fa-circle","fa-hand-fist","fa-dove","fa-skull","fa-mountain","fa-gem","fa-bug","fa-ghost"],
  Galar:["fa-leaf","fa-droplet","fa-fire","fa-hand-fist","fa-wand-sparkles","fa-gem","fa-moon","fa-dragon"],
  Paldea:["fa-bug","fa-leaf","fa-droplet","fa-fire","fa-circle","fa-ghost","fa-brain","fa-snowflake"]
};

var INSIGNIAS = {
  Kanto:["Rocha","Cascata","Trovão","Arco-Íris","Alma","Lama","Vulcão","Terra"],
  Johto:["Zéfiro","Colmeia","Planície","Névoa","Tempestade","Mineral","Geleira","Nascente"],
  Hoenn:["Pedra","Punho","Dínamo","Calor","Equilíbrio","Pena","Mente","Chuva"],
  Sinnoh:["Carvão","Floresta","Cascalho","Pântano","Relíquia","Mina","Gelo","Farol"],
  Unova:["Trio","Básica","Inseto","Raio","Tremor","Jato","Frio","Lendária"],
  Kalos:["Carapaça","Penhasco","Luta","Planta","Voltagem","Fada","Psíquico","Gelo"],
  Alola:["Normalium Z","Fightinium Z","Flyinium Z","Poisonium Z","Groundium Z","Rockium Z","Buginium Z","Ghostium Z"],
  Galar:["Grama","Água","Fogo","Lutador","Fada","Rocha","Sombrio","Dragão"],
  Paldea:["Inseto","Grama","Água","Fogo","Normal","Fantasma","Psíquico","Gelo"]
};

var LIDERES_GINASIO = {
  Kanto:[{lider:"Brock",cidade:"Pewter City",tipo:"Pedra",tipoSlug:"rock"},{lider:"Misty",cidade:"Cerulean City",tipo:"Água",tipoSlug:"water"},{lider:"Lt. Surge",cidade:"Vermilion City",tipo:"Elétrico",tipoSlug:"electric"},{lider:"Erika",cidade:"Celadon City",tipo:"Planta",tipoSlug:"grass"},{lider:"Koga",cidade:"Fuchsia City",tipo:"Venenoso",tipoSlug:"poison"},{lider:"Sabrina",cidade:"Saffron City",tipo:"Psíquico",tipoSlug:"psychic"},{lider:"Blaine",cidade:"Cinnabar Island",tipo:"Fogo",tipoSlug:"fire"},{lider:"Giovanni",cidade:"Viridian City",tipo:"Terra",tipoSlug:"ground"}],
  Johto:[{lider:"Falkner",cidade:"Violet City",tipo:"Voador",tipoSlug:"flying"},{lider:"Bugsy",cidade:"Azalea Town",tipo:"Inseto",tipoSlug:"bug"},{lider:"Whitney",cidade:"Goldenrod City",tipo:"Normal",tipoSlug:"normal"},{lider:"Morty",cidade:"Ecruteak City",tipo:"Fantasma",tipoSlug:"ghost"},{lider:"Chuck",cidade:"Cianwood City",tipo:"Lutador",tipoSlug:"fighting"},{lider:"Jasmine",cidade:"Olivine City",tipo:"Aço",tipoSlug:"steel"},{lider:"Pryce",cidade:"Mahogany Town",tipo:"Gelo",tipoSlug:"ice"},{lider:"Clair",cidade:"Blackthorn City",tipo:"Dragão",tipoSlug:"dragon"}],
  Hoenn:[{lider:"Roxanne",cidade:"Rustboro City",tipo:"Pedra",tipoSlug:"rock"},{lider:"Brawly",cidade:"Dewford Town",tipo:"Lutador",tipoSlug:"fighting"},{lider:"Wattson",cidade:"Mauville City",tipo:"Elétrico",tipoSlug:"electric"},{lider:"Flannery",cidade:"Lavaridge Town",tipo:"Fogo",tipoSlug:"fire"},{lider:"Norman",cidade:"Petalburg City",tipo:"Normal",tipoSlug:"normal"},{lider:"Winona",cidade:"Fortree City",tipo:"Voador",tipoSlug:"flying"},{lider:"Tate & Liza",cidade:"Mossdeep City",tipo:"Psíquico",tipoSlug:"psychic"},{lider:"Wallace",cidade:"Sootopolis City",tipo:"Água",tipoSlug:"water"}],
  Sinnoh:[{lider:"Roark",cidade:"Oreburgh City",tipo:"Pedra",tipoSlug:"rock"},{lider:"Gardenia",cidade:"Eterna City",tipo:"Planta",tipoSlug:"grass"},{lider:"Maylene",cidade:"Veilstone City",tipo:"Lutador",tipoSlug:"fighting"},{lider:"Crasher Wake",cidade:"Pastoria City",tipo:"Água",tipoSlug:"water"},{lider:"Fantina",cidade:"Hearthome City",tipo:"Fantasma",tipoSlug:"ghost"},{lider:"Byron",cidade:"Canalave City",tipo:"Aço",tipoSlug:"steel"},{lider:"Candice",cidade:"Snowpoint City",tipo:"Gelo",tipoSlug:"ice"},{lider:"Volkner",cidade:"Sunyshore City",tipo:"Elétrico",tipoSlug:"electric"}],
  Unova:[{lider:"Cilan",cidade:"Striaton City",tipo:"Planta",tipoSlug:"grass"},{lider:"Lenora",cidade:"Nacrene City",tipo:"Normal",tipoSlug:"normal"},{lider:"Burgh",cidade:"Castelia City",tipo:"Inseto",tipoSlug:"bug"},{lider:"Elesa",cidade:"Nimbasa City",tipo:"Elétrico",tipoSlug:"electric"},{lider:"Clay",cidade:"Driftveil City",tipo:"Terra",tipoSlug:"ground"},{lider:"Skyla",cidade:"Mistralton City",tipo:"Voador",tipoSlug:"flying"},{lider:"Brycen",cidade:"Icirrus City",tipo:"Gelo",tipoSlug:"ice"},{lider:"Drayden",cidade:"Opelucid City",tipo:"Dragão",tipoSlug:"dragon"}],
  Kalos:[{lider:"Viola",cidade:"Santalune City",tipo:"Inseto",tipoSlug:"bug"},{lider:"Grant",cidade:"Cyllage City",tipo:"Pedra",tipoSlug:"rock"},{lider:"Korrina",cidade:"Shalour City",tipo:"Lutador",tipoSlug:"fighting"},{lider:"Ramos",cidade:"Coumarine City",tipo:"Planta",tipoSlug:"grass"},{lider:"Clemont",cidade:"Lumiose City",tipo:"Elétrico",tipoSlug:"electric"},{lider:"Valerie",cidade:"Laverre City",tipo:"Fada",tipoSlug:"fairy"},{lider:"Olympia",cidade:"Anistar City",tipo:"Psíquico",tipoSlug:"psychic"},{lider:"Wulfric",cidade:"Snowbelle City",tipo:"Gelo",tipoSlug:"ice"}],
  Alola:[{lider:"Ilima",cidade:"Hau'oli City",tipo:"Normal",tipoSlug:"normal"},{lider:"Lana",cidade:"Brooklet Hill",tipo:"Água",tipoSlug:"water"},{lider:"Kiawe",cidade:"Wela Volcano Park",tipo:"Fogo",tipoSlug:"fire"},{lider:"Mallow",cidade:"Lush Jungle",tipo:"Planta",tipoSlug:"grass"},{lider:"Sophocles",cidade:"Hokulani Observatory",tipo:"Elétrico",tipoSlug:"electric"},{lider:"Acerola",cidade:"Thrifty Megamart",tipo:"Fantasma",tipoSlug:"ghost"},{lider:"Mina",cidade:"Seafolk Village",tipo:"Fada",tipoSlug:"fairy"},{lider:"Hapu",cidade:"Vast Poni Canyon",tipo:"Terra",tipoSlug:"ground"}],
  Galar:[{lider:"Milo",cidade:"Turffield",tipo:"Planta",tipoSlug:"grass"},{lider:"Nessa",cidade:"Hulbury",tipo:"Água",tipoSlug:"water"},{lider:"Kabu",cidade:"Motostoke",tipo:"Fogo",tipoSlug:"fire"},{lider:"Bea",cidade:"Stow-on-Side",tipo:"Lutador",tipoSlug:"fighting"},{lider:"Opal",cidade:"Ballonlea",tipo:"Fada",tipoSlug:"fairy"},{lider:"Gordie",cidade:"Circhester",tipo:"Pedra",tipoSlug:"rock"},{lider:"Piers",cidade:"Spikemuth",tipo:"Sombrio",tipoSlug:"dark"},{lider:"Raihan",cidade:"Hammerlocke",tipo:"Dragão",tipoSlug:"dragon"}],
  Paldea:[{lider:"Katy",cidade:"Cortondo",tipo:"Inseto",tipoSlug:"bug"},{lider:"Brassius",cidade:"Artazon",tipo:"Planta",tipoSlug:"grass"},{lider:"Iono",cidade:"Levincia",tipo:"Elétrico",tipoSlug:"electric"},{lider:"Kofu",cidade:"Cascarrafa",tipo:"Água",tipoSlug:"water"},{lider:"Larry",cidade:"Medali",tipo:"Normal",tipoSlug:"normal"},{lider:"Ryme",cidade:"Montenevera",tipo:"Fantasma",tipoSlug:"ghost"},{lider:"Tulip",cidade:"Alfornada",tipo:"Psíquico",tipoSlug:"psychic"},{lider:"Grusha",cidade:"Glaseado",tipo:"Gelo",tipoSlug:"ice"}]
};

// =============== TÍTULOS ===============
var TITULOS = [
  {min:0,max:9,nome:'Novato'}, {min:10,max:29,nome:'Aprendiz'},
  {min:30,max:49,nome:'Treinador Amador'}, {min:50,max:99,nome:'Treinador Profissional'},
  {min:100,max:149,nome:'Treinador de Ginásio'}, {min:150,max:199,nome:'Líder de Ginásio'},
  {min:200,max:299,nome:'Campeão Regional'}, {min:300,max:399,nome:'Campeão Nacional'},
  {min:400,max:499,nome:'Mestre'}, {min:500,max:99999,nome:'Lenda'}
];
function getTitulo(nivel){
  for(var i = 0; i < TITULOS.length; i++){
    if(nivel >= TITULOS[i].min && nivel <= TITULOS[i].max) return TITULOS[i];
  }
  return TITULOS[0];
}

// =============== EQUIPE ROCKET ===============
var ROCKET_MEMBROS = [
  { tipo: 'Recruta', nome: 'Rocket Recruta', sprite: 'teamrocket', nivelExtra: 0, pc: 20, xpMult: 0.5, item: 'Poké Ball', chaveChance: 0.0, raridade: 'comum' },
  { tipo: 'Agente', nome: 'Rocket Agente', sprite: 'teamrocket', nivelExtra: 5, pc: 50, xpMult: 0.75, item: 'Great Ball', chaveChance: 0.05, raridade: 'incomum' },
  { tipo: 'Executivo', nome: 'Rocket Executivo', sprite: 'teamrocket', nivelExtra: 10, pc: 100, xpMult: 1.0, item: 'Ultra Ball', chaveChance: 0.20, raridade: 'raro' },
  { tipo: 'Chefe', nome: 'Rocket Chefe', sprite: 'giovanni', nivelExtra: 20, pc: 500, xpMult: 3.0, item: 'Master Ball', chaveChance: 0.50, raridade: 'chefe' }
];
var TIPOS_ROCKET = ['poison', 'dark', 'ground'];

// =============== XP ===============
var XP_ACOES = {
  vitoria_batalha:50, captura:70, captura_lendario:200, captura_mega_gmax:200,
  conquista:100, medalha:500, trofeu:750, copa:1200, copa_continental:2000,
  supercopa:5000, liga:3000, missao_diaria:150, evolucao:80, mega_evolucao:150,
  gmax:150, vitoria_digital:60, vitoria_lendario:500, vitoria_ultrabeast:400,
  // Novas fontes v23
  duelo_pvp_vitoria:100, duelo_pvp_derrota:20,
  presente_enviado:10, presente_recebido:5,
  rocket_recruta:75, rocket_agente:150, rocket_executivo:300, rocket_chefe:1500,
  torneio_1:3000, torneio_2:1500, torneio_3:800,
  combo_5:500, combo_10:1500, combo_20:5000
};
var XP_MULTIPLICADORES = {
  fimDeSemana: 1.25,
  amigoOnline: 0.10
};
function getMultiplicadorXP(){
  var mult = 1;
  var d = new Date().getDay();
  if(d === 0 || d === 6) mult *= XP_MULTIPLICADORES.fimDeSemana;
  var amigosOnline = _mpAmigos.filter(function(a){ return a.online; }).length;
  mult *= (1 + amigosOnline * XP_MULTIPLICADORES.amigoOnline);
  return mult;
}

// =============== UTILITÁRIOS ===============
function contarInsignias(j){
  var total = 0;
  if(!j || !j.insignias) return 0;
  Object.keys(j.insignias).forEach(function(reg){
    var arr = j.insignias[reg];
    if(Array.isArray(arr)) total += arr.filter(function(x){return x;}).length;
  });
  return total;
}
function xpNecessarioParaNivel(nivel){ return XP_BASE_NIVEL + XP_AUMENTO_POR_NIVEL * (nivel - 1); }

function spritePokemon(id){
  if(!id) return POKEAPI_POKEMON + "0.png";
  return POKEAPI_POKEMON + id + ".png";
}
function spritePokemonShiny(id){
  if(!id) return POKEAPI_POKEMON_SHINY + "0.png";
  return POKEAPI_POKEMON_SHINY + id + ".png";
}
function spritePokemonAtual(p){
  if(!p) return spritePokemon(0);
  var shiny = p.shiny === true;
  var base = shiny ? POKEAPI_POKEMON_SHINY : POKEAPI_POKEMON;
  // Novas megas Z-A (Catbox)
  if(p.mega){
    var megaInfo = MEGA_EVOLUCOES[p.nome];
    if(megaInfo){
      if(megaInfo.showdown){
        var slug = (p.megaForma === 'Y' && megaInfo.showdownAlt) ? megaInfo.showdownAlt : megaInfo.showdown;
        var baseUrl = shiny ? SHOWDOWN_SHINY : SHOWDOWN;
        return baseUrl + "gen5/" + slug + ".png";
      }else if(megaInfo.img){
        if(p.megaForma === 'Y' && megaInfo.imgAlt) return megaInfo.imgAlt;
        return megaInfo.img;
      }
    }
  }
  if(p.gigantamax && p.idGmax){
    return base + p.idGmax + ".png";
  }
  if(p.forma && p.idForma){
    return base + p.idForma + ".png";
  }
  return base + p.id + ".png";
}
function imagemBola(slug){ return API_ITEM + slug + ".png"; }
function imagemItem(nome){
  if(nome === 'Chave Rocket') return IMG_CHAVE_ROCKET;
  if(BERRIES_LISTA && BERRIES_LISTA[nome]) return API_ITEM + BERRIES_LISTA[nome] + "-berry.png";
  if(typeof ITENS_EVOLUCAO !== 'undefined' && ITENS_EVOLUCAO[nome]) return API_ITEM + ITENS_EVOLUCAO[nome].slug + ".png";
  var path = IMG_LOJA ? IMG_LOJA[nome] : null;
  if(!path) return null;
  return POKESPRITE + path + ".png";
}
function imagemMegaStone(nomePedra){
  var keys = Object.keys(MEGA_EVOLUCOES);
  for(var i = 0; i < keys.length; i++){
    var m = MEGA_EVOLUCOES[keys[i]];
    if(m.pedra === nomePedra && m.stoneSerebii) return SEREBII_ITEM + m.stoneSerebii + ".png";
    if(m.pedraAlternativa === nomePedra && m.stoneSerebiiAlt) return SEREBII_ITEM + m.stoneSerebiiAlt + ".png";
  }
  return null;
}
function encontrarPokemonPorMegaStone(nomePedra){
  var keys = Object.keys(MEGA_EVOLUCOES);
  for(var i = 0; i < keys.length; i++){
    var m = MEGA_EVOLUCOES[keys[i]];
    if(m.pedra === nomePedra || m.pedraAlternativa === nomePedra){
      return {pokemon:keys[i], info:m, eAlt:m.pedraAlternativa === nomePedra};
    }
  }
  return null;
}
function escaparNome(nome){ return String(nome).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function shuffleArray(arr){
  var a = arr.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
function debounce(fn, ms){
  var t;
  return function(){
    var args = arguments, ctx = this;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(ctx, args); }, ms);
  };
}
function criarImagem(url, tamanho, nomeItemFallback){
  if(!tamanho) tamanho = '28px';
  var wrapper = document.createElement('div');
  wrapper.style.width = tamanho;
  wrapper.style.height = tamanho;
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  if(!url){
    if(nomeItemFallback) wrapper.appendChild(criarIconeItem(nomeItemFallback, tamanho));
    else{ wrapper.style.background = 'rgba(255,203,5,0.2)'; wrapper.style.borderRadius = '4px'; }
    return wrapper;
  }
  var img = document.createElement('img');
  img.src = url;
  img.style.objectFit = 'contain';
  img.style.width = tamanho;
  img.style.height = tamanho;
  img.loading = 'lazy';
  img.addEventListener('error', function(){
    if(this.dataset.fallback){ this.style.display = 'none'; return; }
    this.dataset.fallback = '1';
    this.style.display = 'none';
    if(nomeItemFallback) wrapper.appendChild(criarIconeItem(nomeItemFallback, tamanho));
    else{ this.src = API_ITEM + 'poke-ball.png'; this.style.display = 'block'; }
  }, {once:true});
  wrapper.appendChild(img);
  return wrapper;
}
function criarIconeItem(nome, tamanho){
  var icone = iconeItem(nome);
  var span = document.createElement('span');
  span.className = 'item-fallback';
  span.style.fontSize = tamanho || '24px';
  span.style.color = 'var(--acento-amarelo)';
  span.innerHTML = '<i class="fas ' + icone + '"></i>';
  return span;
}
function mostrarLoading(ativo){
  var el = document.getElementById('tela-loading');
  if(el) el.classList.toggle('ativo', ativo);
}
function getClasseHistorico(h){
  if(!h) return 'selvagem';
  var tipo = h.tipo || '';
  if(h.tipo === 'Equipe Rocket') return 'rocket';
  if(h.resultado === 'Perdeu' && tipo !== 'Lendário' && tipo !== 'Ultra Beast') return 'perdeu';
  if(tipo === 'Lendário' || (h.rota && h.rota.indexOf('Lend') !== -1)) return 'lendario';
  if(tipo === 'Ultra Beast') return 'ultrabeast';
  if(tipo === 'Selvagem') return 'selvagem';
  if(tipo === 'Amador') return 'amador';
  if(tipo === 'Profissional') return 'profissional';
  if(tipo === 'Treinador de Ginásio') return 'treinador-ginasio';
  if(tipo === 'Líder de Ginásio') return 'lider-ginasio';
  if(tipo === 'Boss de Ginásio' || tipo === 'Boss GX' || tipo === 'Boss Vmax' || tipo === 'Boss EX') return 'boss-ginasio';
  if(tipo === 'Treinador de Copa') return 'copa';
  if(tipo === 'Treinador de Liga' || tipo === 'Liga') return 'liga';
  return 'selvagem';
}

// =============== NOME EXIBIDO (com apelido) ===============
function getNomeExibir(p){
  if(!p) return '-';
  if(p.apelido) return p.apelido;
  return p.nome;
}
function getNomeCompleto(p){
  if(!p) return '-';
  if(p.apelido) return p.apelido + ' (' + p.nome + ')';
  return p.nome;
}

// =============== MIGRAÇÃO ===============
function migrarPokemon(p){
  if(!p || typeof p !== 'object') return p;
  if(p.amizade === undefined) p.amizade = 0;
  if(p.batalhasSemUso === undefined) p.batalhasSemUso = 0;
  if(p.trocado === undefined) p.trocado = false;
  if(p.itemEquipado === undefined) p.itemEquipado = null;
  if(p.raridade === undefined) p.raridade = 'normal';
  if(p.forma === undefined) p.forma = '';
  if(p.idForma === undefined) p.idForma = null;
  if(p.mega === undefined) p.mega = false;
  if(p.megaForma === undefined) p.megaForma = null;
  if(p.nomeMega === undefined) p.nomeMega = null;
  if(p.gigantamax === undefined) p.gigantamax = false;
  if(p.idGmax === undefined) p.idGmax = null;
  if(p.permanente === undefined) p.permanente = false;
  if(p.permanenteMega === undefined) p.permanenteMega = false;
  if(p.shiny === undefined) p.shiny = false;
  if(p.sexo === undefined || p.sexo === null) p.sexo = sortearSexo(p.nome);
  if(p.natureza === undefined || !p.natureza) p.natureza = sortearNatureza();
  if(p.hpAtual === undefined) p.hpAtual = null;
  if(p.status === undefined) p.status = null;
  if(p.statusTurnos === undefined) p.statusTurnos = 0;
  if(p.moves === undefined) p.moves = null;
  if(p.baseStats === undefined) p.baseStats = null;
  if(p.habilidade === undefined) p.habilidade = null;
  if(p.boosts === undefined) p.boosts = {};
  if(p.boostPermanente === undefined) p.boostPermanente = {atk:1, def:1, spa:1, spd:1, spe:1};
  if(p.batalhas === undefined) p.batalhas = 0;
  if(p.bg === undefined) p.bg = 0;
  if(p.bp === undefined) p.bp = 0;
  if(p.lvl === undefined || isNaN(p.lvl)) p.lvl = 1;
  if(p.favorito === undefined) p.favorito = false;
  if(p.notas === undefined) p.notas = '';
  if(p.regiaoOrigem === undefined) p.regiaoOrigem = 'Kanto';
  if(p.tags === undefined) p.tags = [];
  // NOVO v23
  if(p.apelido === undefined) p.apelido = '';
  return p;
}
function migrarInventario(j){
  if(!j.itens || typeof j.itens !== 'object' || Array.isArray(j.itens)){
    j.itens = {"Poké Ball":2,"Maca de Resgate":1};
  }
}
function migrarJogador(j){
  if(!j) j = {};
  var campos = {
    xp:0, xpTotalGanho:0, bp:0, totalEvolucoes:0, totalGmax:0, totalMega:0,
    maiorSequencia:0, sequenciaAtual:0, fugas:0,
    copasVencidas:0, copaVencida:false, duelosVencidos:0,
    copasRegiaoVencidas:0, copasRegiaoBloqueadaAte:0, batalhasDesdeCopaRegiao:0,
    copasContinentaisVencidas:0, continentaisBloqueadaAte:0, batalhasDesdeContinental:0,
    supercopasVencidas:0, trofeuSupercopaGanho:false,
    copaBloqueadaAte:0, batalhasDesdeCopa:0,
    ligasVencidas:0, ligaBloqueadaAte:0, batalhasDesdeLiga:0,
    pcGastos:0, missoesCompletas:0, missoesData:'', modo:'hibrido',
    nBatalhasDigitais:0, nCapturasDigitais:0,
    ginasiosVencidos:0, shiniesCapturados:0, lendariosDerrotados:0,
    ultraBeastsCapturados:0,
    batalhasDesdeAstral:0, batalhasDesdeMistica:0,
    batalhasDesdeCristal:0, batalhasDesdeLendario:0,
    // NOVO v23
    rocketDerrotados:0, rocketChefesDerrotados:0,
    chavesRocket:0, chaveRocketUsada:false,
    presentesEnviados:0, presentesRecebidos:0,
    ultimaTrocaNome:0,
    torneiosVencidos:0, torneiosParticipados:0,
    duelosPvPVencidos:0, duelosPvPDerrotas:0,
    eloPvP:1000
  };
  Object.keys(campos).forEach(function(k){
    if(j[k] === undefined || (typeof campos[k] === 'number' && isNaN(j[k]))) j[k] = campos[k];
  });
  if(!Array.isArray(j.time)) j.time = [null,null,null,null,null,null];
  while(j.time.length < 6) j.time.push(null);
  if(j.time.length > 6) j.time = j.time.slice(0, 6);
  migrarInventario(j);
  if(!Array.isArray(j.banco)) j.banco = [];
  if(!j.insignias || typeof j.insignias !== 'object') j.insignias = {};
  if(!Array.isArray(j.historico)) j.historico = [];
  if(!Array.isArray(j.capturas)) j.capturas = [];
  if(!Array.isArray(j.conquistasDesbloqueadas)) j.conquistasDesbloqueadas = [];
  if(!Array.isArray(j.hallFama)) j.hallFama = [];
  if(!Array.isArray(j.copasHistorico)) j.copasHistorico = [];
  if(!Array.isArray(j.duelosHistorico)) j.duelosHistorico = [];
  if(!Array.isArray(j.trocasHistorico)) j.trocasHistorico = [];
  if(!Array.isArray(j.ligasHistorico)) j.ligasHistorico = [];
  if(!Array.isArray(j.rocketHistorico)) j.rocketHistorico = [];
  if(!Array.isArray(j.presentesHistorico)) j.presentesHistorico = [];
  if(!Array.isArray(j.amigos)) j.amigos = [];
  if(!j.medalhasGanhas) j.medalhasGanhas = {};
  if(!j.medalhasRegiaoGanhas) j.medalhasRegiaoGanhas = {};
  if(!j.trofeusGanhos) j.trofeusGanhos = {};
  if(!j.trofeusRegiaoGanhos) j.trofeusRegiaoGanhos = {};
  if(!j.copasRegiaoPorRegiao) j.copasRegiaoPorRegiao = {};
  if(!j.copasContinentaisPorRegiao) j.copasContinentaisPorRegiao = {};
  if(j.pulseiraMega === undefined) j.pulseiraMega = null;
  if(j.pulseiraGmax === undefined) j.pulseiraGmax = null;
  if(!j.descontos) j.descontos = null;
  if(!j.descontosTimestamp) j.descontosTimestamp = 0;
  if(!j.tituloAtual) j.tituloAtual = null;
  if(!j.missoesDiarias) j.missoesDiarias = null;
  if(!j.contadoresDiarios) j.contadoresDiarios = {batalhas:0,capturas:0,evolucoes:0,mega:0,compras:0};
  if(!j.corCartao) j.corCartao = 'azul';
  if(j.fotoPerfil === undefined) j.fotoPerfil = null;
  if(j.inicialEscolhido === undefined) j.inicialEscolhido = false;
  if(!j.pokedex) j.pokedex = {};
  if(!j.rotasCompletadas) j.rotasCompletadas = {};
  if(!j.lendariosCapturados) j.lendariosCapturados = {};
  if(!j.ultraBeastsCapturados) j.ultraBeastsCapturados = {};
  if(!j.ginasiosCompletos) j.ginasiosCompletos = {};
  if(j.ginasioProgresso === undefined) j.ginasioProgresso = null;
  if(j.ligaEstado === undefined) j.ligaEstado = null;
  if(j.copaEstado === undefined) j.copaEstado = null;
  if(!j.modoFixo) j.modoFixo = 'livre';
  var todos = (j.time || []).filter(Boolean).concat(j.banco || []);
  todos.forEach(function(p){ migrarPokemon(p); });
  return j;
}

// =============== SAVE ===============
function calcularChecksum(obj){
  try{
    var str = JSON.stringify(obj);
    var hash = 0;
    for(var i = 0; i < str.length; i++){
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return 'ck_' + Math.abs(hash).toString(36);
  }catch(e){ return 'ck_0'; }
}
function empacotarSave(j){
  var clone = JSON.parse(JSON.stringify(j));
  delete clone._checksum;
  clone._checksum = calcularChecksum(clone);
  return clone;
}
function validarSave(j){
  if(!j) return false;
  if(!j._checksum) return true;
  var ck = j._checksum;
  var clone = JSON.parse(JSON.stringify(j));
  delete clone._checksum;
  return calcularChecksum(clone) === ck;
}
function iniciarAutoSave(){
  if(autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(function(){
    if(jogador && nomeAtual && !ataqueEmAndamento){
      var bt = document.getElementById('tela-batalha');
      if(!bt || !bt.classList.contains('aberta')) salvar();
    }
  }, 5000);
}
function salvar(){
  if(!nomeAtual || !jogador) return;
  try{ localStorage.setItem('jogador_' + nomeAtual, JSON.stringify(empacotarSave(jogador))); }catch(e){}
}
function exportarSave(){
  if(!jogador){ AudioSFX.erro(); alert('Nenhum jogo!'); return; }
  AudioSFX.clickMenu();
  var dados = {versao:VERSAO_SAVE, dataExportacao:new Date().toISOString(), nome:nomeAtual, jogador:jogador};
  var blob = new Blob([JSON.stringify(dados, null, 2)], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'pokemon-tcg-' + nomeAtual + '-' + Date.now() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('Save exportado!');
}
function importarSave(){
  AudioSFX.garantirInicio();
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e){
    var arq = e.target.files[0];
    if(!arq) return;
    var reader = new FileReader();
    reader.onload = function(event){
      try{
        var dados = JSON.parse(event.target.result);
        if(!dados.nome || !dados.jogador) throw new Error('Inválido');
        if(!confirm('Importar save de "' + dados.nome + '"?')) return;
        var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
        if(jogadores.indexOf(dados.nome) === -1){
          jogadores.push(dados.nome);
          localStorage.setItem('listaJogadores', JSON.stringify(jogadores));
        }
        var migrado = migrarJogador(dados.jogador);
        localStorage.setItem('jogador_' + dados.nome, JSON.stringify(migrado));
        alert('Save importado!');
        renderListaJogadores();
      }catch(err){ AudioSFX.erro(); alert('Erro: ' + err.message); }
    };
    reader.readAsText(arq);
  };
  input.click();
}
function gerarCodigoSave(){
  if(!jogador){ AudioSFX.erro(); alert('Nenhum jogo!'); return; }
  try{
    var dados = {v:VERSAO_SAVE, n:nomeAtual, j:empacotarSave(jogador), t:Date.now()};
    var codigo = btoa(unescape(encodeURIComponent(JSON.stringify(dados))));
    var ta = document.getElementById('texto-codigo-save');
    if(ta) ta.value = codigo;
    abrirModal('modal-codigo-save');
  }catch(e){ AudioSFX.erro(); }
}
function copiarCodigoSave(){
  var t = document.getElementById('texto-codigo-save');
  if(!t) return;
  t.select();
  try{ document.execCommand('copy'); alert('Copiado!'); }catch(e){ alert('Copie manualmente.'); }
}
function fecharModalCodigoSave(){ AudioSFX.clickMenu(); fecharModal('modal-codigo-save'); }
function abrirImportarCodigo(){ AudioSFX.clickMenu(); var ta = document.getElementById('texto-importar-codigo'); if(ta) ta.value = ''; abrirModal('modal-importar-codigo'); }
function fecharModalImportarCodigo(){ AudioSFX.clickMenu(); fecharModal('modal-importar-codigo'); }
function carregarCodigoSave(){
  var codigo = document.getElementById('texto-importar-codigo').value.trim();
  if(!codigo){ AudioSFX.erro(); alert('Cole um código!'); return; }
  try{
    var json = decodeURIComponent(escape(atob(codigo)));
    var dados = JSON.parse(json);
    if(!dados.j || !dados.n) throw new Error('Código inválido');
    if(!confirm('Carregar save de "' + dados.n + '"?')) return;
    var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
    if(jogadores.indexOf(dados.n) === -1){
      jogadores.push(dados.n);
      localStorage.setItem('listaJogadores', JSON.stringify(jogadores));
    }
    var migrado = migrarJogador(dados.j);
    localStorage.setItem('jogador_' + dados.n, JSON.stringify(migrado));
    alert('Save carregado!');
    fecharModalImportarCodigo();
    renderListaJogadores();
    mostrarTela('tela-menu');
  }catch(e){ AudioSFX.erro(); alert('Erro: ' + e.message); }
}

// =============== MODAIS ===============
function abrirModal(id){
  var el = document.getElementById(id);
  if(!el) return;
  if(_modaisAbertos.indexOf(id) === -1) _modaisAbertos.push(id);
  el.classList.add('aberto');
}
function fecharModal(id){
  var el = document.getElementById(id);
  if(el) el.classList.remove('aberto');
  var idx = _modaisAbertos.indexOf(id);
  if(idx !== -1) _modaisAbertos.splice(idx, 1);
}

// =============== HABILIDADE ===============
function mostrarInfoHabilidade(nome){
  AudioSFX.clickMenu();
  var desc = DESCRICOES_HABILIDADES[nome] || 'Uma habilidade misteriosa que afeta a batalha de alguma forma.';
  var titulo = document.getElementById('modal-habilidade-titulo');
  var descEl = document.getElementById('modal-habilidade-desc');
  if(titulo) titulo.innerHTML = '<i class="fas fa-sparkles" style="color:#9c27b0;"></i> ' + nome;
  if(descEl) descEl.innerHTML = '<p>' + desc + '</p>';
  abrirModal('modal-habilidade');
}
function fecharModalHabilidade(){
  AudioSFX.clickMenu();
  fecharModal('modal-habilidade');
}

// =============== MUDAR NOME ===============
function abrirModalMudarNome(){
  AudioSFX.clickMenu();
  var input = document.getElementById('input-novo-nome');
  if(input) input.value = jogador.nome;
  abrirModal('modal-mudar-nome');
}
function fecharModalMudarNome(){
  AudioSFX.clickMenu();
  fecharModal('modal-mudar-nome');
}
function confirmarMudarNome(){
  var novoNome = document.getElementById('input-novo-nome').value.trim();
  if(!novoNome){ AudioSFX.erro(); alert('Digite um nome!'); return; }
  if(novoNome === jogador.nome){ alert('Mesmo nome!'); return; }
  if(novoNome.length < 3){ AudioSFX.erro(); alert('Mínimo 3 caracteres'); return; }
  var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
  if(jogadores.indexOf(novoNome) !== -1){
    AudioSFX.erro();
    alert('Nome já em uso!');
    return;
  }
  var agora = Date.now();
  var ultimaTroca = jogador.ultimaTrocaNome || 0;
  var gratis = (agora - ultimaTroca) >= COOLDOWN_MUDAR_NOME;
  var custo = gratis ? 0 : CUSTO_MUDAR_NOME;
  if(jogador.pc < custo){
    AudioSFX.erro();
    alert('Precisa de ' + custo + ' PC!');
    return;
  }
  if(!confirm('Mudar de "' + jogador.nome + '" para "' + novoNome + '"?' + 
    (custo > 0 ? '\n\nCusto: ' + custo + ' PC' : '\n\nGRÁTIS!'))) return;
  jogador.pc -= custo;
  jogador.ultimaTrocaNome = agora;
  jogador.nome = novoNome;
  var idx = jogadores.indexOf(nomeAtual);
  if(idx !== -1) jogadores[idx] = novoNome;
  else jogadores.push(novoNome);
  localStorage.setItem('listaJogadores', JSON.stringify(jogadores));
  var oldNome = nomeAtual;
  nomeAtual = novoNome;
  salvar();
  localStorage.removeItem('jogador_' + oldNome);
  // Notifica servidor multiplayer se conectado
  if(_mpSocket && _mpConectado){
    _mpSocket.emit('atualizar-nome', {nome: novoNome});
  }
  AudioSFX.conquista();
  fecharModalMudarNome();
  if(typeof atualizarTudo === 'function') atualizarTudo();
  alert('Nome alterado para "' + novoNome + '"!');
}

// =============== APELIDO ===============
function salvarApelido(nome){
  var input = document.getElementById('apelido-input');
  if(!input) return;
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var p = todos.find(function(x){ return x.nome === nome; });
  if(!p) return;
  p.apelido = input.value.trim();
  salvar();
  if(typeof atualizarTudo === 'function') atualizarTudo();
  AudioSFX.clickMenu();
  alert('Apelido salvo!');
}

// =============== XP ===============
function darXP(quantidade, motivo){
  if(!jogador) return;
  var mult = getMultiplicadorXP();
  var qtdFinal = Math.floor(quantidade * mult);
  if(!jogador.xp || isNaN(jogador.xp)) jogador.xp = 0;
  jogador.xp += qtdFinal;
  if(!jogador.xpTotalGanho) jogador.xpTotalGanho = 0;
  jogador.xpTotalGanho += qtdFinal;
  mostrarToastXP(qtdFinal, motivo || 'XP Ganho');
  AudioSFX.xpGanho();
  verificarSubirNivel();
  salvar();
  if(typeof atualizarStatus === 'function') atualizarStatus();
}
function verificarSubirNivel(){
  var subiu = false, limite = 100;
  while(limite-- > 0){
    var xpNec = xpNecessarioParaNivel(jogador.nivel + 1);
    if(jogador.xp >= xpNec){ jogador.xp -= xpNec; jogador.nivel++; subiu = true; }
    else break;
  }
  if(subiu){
    AudioSFX.levelUp();
    setTimeout(function(){
      alert('Subiu para o Nível ' + jogador.nivel + '!\n\nTítulo: ' + getTitulo(jogador.nivel).nome);
    }, 500);
  }
}
function mostrarToastXP(qtd, motivo){
  var toast = document.getElementById('toast-xp');
  if(!toast) return;
  var el1 = toast.querySelector('.xp-ganho');
  var el2 = toast.querySelector('.xp-motivo');
  if(el1) el1.textContent = '+' + qtd + ' XP';
  if(el2) el2.textContent = motivo;
  toast.classList.add('ativo');
  setTimeout(function(){ toast.classList.remove('ativo'); }, 2000);
}
function mostrarToastShiny(nome){
  var toast = document.getElementById('toast-shiny');
  if(!toast) return;
  var d = toast.querySelector('.desc');
  if(d) d.textContent = nome + ' é SHINY! ✨';
  toast.classList.add('ativo');
  AudioSFX.shiny();
  setTimeout(function(){ toast.classList.remove('ativo'); }, 3500);
}
function mostrarToastNotificacao(titulo, desc){
  var toast = document.getElementById('toast-notificacao');
  if(!toast) return;
  var t = toast.querySelector('.titulo');
  var d = toast.querySelector('.desc');
  if(t) t.textContent = titulo;
  if(d) d.textContent = desc || '';
  toast.classList.add('ativo');
  setTimeout(function(){ toast.classList.remove('ativo'); }, 3000);
}
function mostrarToastOnline(titulo, desc){
  var toast = document.getElementById('toast-online');
  if(!toast) return;
  var t = toast.querySelector('.titulo');
  var d = toast.querySelector('.desc');
  if(t) t.textContent = titulo;
  if(d) d.textContent = desc || '';
  toast.classList.add('ativo');
  setTimeout(function(){ toast.classList.remove('ativo'); }, 2500);
}
function mostrarToastTrofeu(texto, nome){
  var toast = document.getElementById('toast-trofeu');
  if(!toast) return;
  var d = toast.querySelector('.desc');
  var t = toast.querySelector('.titulo');
  if(d) d.textContent = texto;
  if(t) t.textContent = nome;
  toast.classList.add('ativo');
  AudioSFX.trofeu();
  setTimeout(function(){ toast.classList.remove('ativo'); }, 3500);
}
function mostrarToastConquista(c){
  var toast = document.getElementById('toast-conquista');
  if(!toast) return;
  var ic = toast.querySelector('.icone-box');
  var d = toast.querySelector('.desc');
  if(ic) ic.innerHTML = '<i class="fas ' + c.icone + '"></i>';
  if(d) d.textContent = c.nome;
  toast.classList.add('ativo');
  AudioSFX.conquista();
  setTimeout(function(){ toast.classList.remove('ativo'); }, 1600);
}

// =============== CONTADORES ===============
function registrarContador(tipo){
  if(!jogador) return;
  if(!jogador.contadoresDiarios) jogador.contadoresDiarios = {batalhas:0,capturas:0,evolucoes:0,mega:0,compras:0};
  jogador.contadoresDiarios[tipo] = (jogador.contadoresDiarios[tipo] || 0) + 1;
  if(typeof verificarMissoes === 'function') verificarMissoes();
}
function incrementarContadoresIntervalo(){
  if(!jogador) return;
  jogador.batalhasDesdeAstral = (jogador.batalhasDesdeAstral || 0) + 1;
  jogador.batalhasDesdeMistica = (jogador.batalhasDesdeMistica || 0) + 1;
  jogador.batalhasDesdeCristal = (jogador.batalhasDesdeCristal || 0) + 1;
  jogador.batalhasDesdeLendario = (jogador.batalhasDesdeLendario || 0) + 1;
  if(jogador.copasRegiaoBloqueadaAte > 0) jogador.copasRegiaoBloqueadaAte--;
  if(jogador.copaBloqueadaAte > 0) jogador.copaBloqueadaAte--;
  if(jogador.continentaisBloqueadaAte > 0) jogador.continentaisBloqueadaAte--;
  if(jogador.ligaBloqueadaAte > 0) jogador.ligaBloqueadaAte--;
}

// =============== TOGGLE MUDO ===============
function toggleMudo(){
  var m = AudioSFX.toggleMudo();
  var btn = document.getElementById('btn-mudo');
  if(btn) btn.innerHTML = m ? '<i class="fas fa-volume-xmark"></i>' : '<i class="fas fa-volume-high"></i>';
}

// =============== TEMA ===============
function toggleTema(){ AudioSFX.clickMenu(); abrirModal('modal-tema'); }
function fecharModalTema(){ AudioSFX.clickMenu(); fecharModal('modal-tema'); }
function escolherTema(t){
  AudioSFX.clickMenu();
  if(t === 'claro') document.body.classList.add('modo-claro');
  else document.body.classList.remove('modo-claro');
  localStorage.setItem('tema', t);
  fecharModal('modal-tema');
}

// =============== CONFIGURAÇÕES ===============
function abrirConfiguracoes(){
  AudioSFX.clickMenu();
  AudioSFX.init();
  var iaToggle = document.getElementById('toggle-ia-adaptativa');
  if(iaToggle) iaToggle.checked = _iaAdaptativa;
  var iaLabel = document.getElementById('ia-nivel-label');
  if(iaLabel) iaLabel.textContent = _iaAdaptativa ? _iaNivel : 'Desligada';
  abrirModal('modal-config');
}
function fecharConfiguracoes(){ AudioSFX.clickMenu(); fecharModal('modal-config'); }
function mudarVolumeMusica(v){
  AudioSFX.init();
  AudioSFX.volumeMusica = v / 100;
  if(AudioSFX.musicaGain) AudioSFX.musicaGain.gain.value = AudioSFX.volumeMusica;
  if(AudioSFX.audioBatalha) AudioSFX.audioBatalha.volume = AudioSFX.volumeMusica;
  var el = document.getElementById('val-musica'); if(el) el.textContent = v + '%';
}
function mudarVolumeEfeitos(v){
  AudioSFX.init();
  AudioSFX.volumeEfeitos = v / 100;
  if(AudioSFX.efeitosGain) AudioSFX.efeitosGain.gain.value = AudioSFX.volumeEfeitos;
  var el = document.getElementById('val-efeitos'); if(el) el.textContent = v + '%';
}
function toggleVibracao(ativo){ AudioSFX.vibracaoAtiva = ativo; }

// =============== IA ADAPTATIVA ===============
function toggleIAAdaptativa(ativo){
  _iaAdaptativa = ativo;
  var label = document.getElementById('ia-nivel-label');
  if(label) label.textContent = ativo ? _iaNivel : 'Desligada';
  if(ativo){
    AudioSFX.conquista();
    mostrarToastNotificacao('IA Adaptativa', 'A IA agora aprende com suas batalhas!');
  }else{
    AudioSFX.clickMenu();
  }
  salvar();
}
function registrarJogadaIA(moveUsado, contexto){
  if(!_iaAdaptativa) return;
  _iaHistoricoBatalhas.push({
    move: moveUsado ? (moveUsado.move || moveUsado.nome) : null,
    tipo: moveUsado ? moveUsado.tipo : null,
    contexto: contexto,
    timestamp: Date.now()
  });
  if(_iaHistoricoBatalhas.length > 20) _iaHistoricoBatalhas.shift();
  var usos = {};
  _iaHistoricoBatalhas.forEach(function(b){
    if(!b.move) return;
    usos[b.move] = (usos[b.move] || 0) + 1;
  });
  var total = Object.values(usos).reduce(function(a,b){ return a+b; }, 0);
  if(total > 8){
    var maisUsado = Object.keys(usos).reduce(function(a,b){ return usos[a] > usos[b] ? a : b; });
    _iaContraAtaque = maisUsado;
  }
}

// =============== TELAS E FLUXO ===============
function mostrarTela(id){
  ['tela-menu','tela-novo','tela-modo','tela-entrar','tela-regiao','tela-inicial','jogo','tela-multiplayer','tela-sala'].forEach(function(t){
    var el = document.getElementById(t);
    if(el) el.style.display = 'none';
  });
  var el = document.getElementById(id);
  if(el) el.style.display = (id === 'jogo') ? 'block' : 'flex';
}
function voltarMenu(){ AudioSFX.garantirInicio(); mostrarTela('tela-menu'); }
function irNovoJogador(){
  AudioSFX.garantirInicio();
  mostrarTela('tela-novo');
  var input = document.getElementById('input-nome-novo');
  if(input){ input.value = ''; setTimeout(function(){ input.focus(); }, 100); }
}
function voltarNome(){ AudioSFX.clickMenu(); mostrarTela('tela-novo'); }
function irEntrar(){ AudioSFX.garantirInicio(); mostrarTela('tela-entrar'); renderListaJogadores(); }
function irEscolherModo(){
  var nome = document.getElementById('input-nome-novo').value.trim();
  if(!nome){ AudioSFX.erro(); alert('Digite um nome!'); return; }
  _nomeTemp = nome;
  _modoEscolhidoTemp = null;
  AudioSFX.clickMenu();
  document.querySelectorAll('.modo-card').forEach(function(c){ c.classList.remove('ativo'); });
  var btn = document.getElementById('btn-criar-final');
  if(btn) btn.disabled = true;
  mostrarTela('tela-modo');
}
function selecionarModo(modo){
  AudioSFX.clickMenu();
  _modoEscolhidoTemp = modo;
  document.querySelectorAll('.modo-card').forEach(function(c){
    c.classList.toggle('ativo', c.dataset.modo === modo);
  });
  var btn = document.getElementById('btn-criar-final');
  if(btn) btn.disabled = false;
}
function renderRegioesInicial(){
  var cont = document.getElementById('lista-regioes-inicial');
  if(!cont) return;
  cont.innerHTML = '';
  REGIOES.forEach(function(r){
    var btn = document.createElement('button');
    btn.className = 'btn-grande';
    btn.textContent = r.nome;
    btn.onclick = function(){ abrirIniciais(r.nome); };
    cont.appendChild(btn);
  });
}
function abrirIniciais(regiao){
  AudioSFX.clickMenu();
  mostrarTela('tela-inicial');
  var el = document.getElementById('regiao-escolhida-nome');
  if(el) el.textContent = 'Região: ' + regiao;
  var cont = document.getElementById('lista-iniciais');
  if(!cont) return;
  cont.innerHTML = '';
  if(!INICIAIS[regiao]) return;
  INICIAIS[regiao].forEach(function(p){
    var card = document.createElement('div');
    card.className = 'inicial-card';
    var img = criarImagem(spritePokemon(p.id), '130px');
    img.style.width = '100%';
    img.style.maxWidth = '130px';
    card.appendChild(img);
    var nome = document.createElement('div');
    nome.className = 'nome';
    nome.textContent = p.nome;
    card.appendChild(nome);
    card.onclick = function(){ escolherInicial(p, regiao); };
    cont.appendChild(card);
  });
}
function voltarRegioes(){ AudioSFX.clickMenu(); mostrarTela('tela-regiao'); }

// =============== CRIAR JOGADOR ===============
function criarJogador(){
  var nome = _nomeTemp || document.getElementById('input-nome-novo').value.trim();
  if(!nome){ AudioSFX.erro(); alert('Digite um nome!'); return; }
  if(!_modoEscolhidoTemp){ AudioSFX.erro(); alert('Escolha um modo!'); return; }
  var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
  if(jogadores.indexOf(nome) !== -1){ AudioSFX.erro(); alert('Já existe!'); return; }
  AudioSFX.clickMenu();
  jogadores.push(nome);
  localStorage.setItem('listaJogadores', JSON.stringify(jogadores));
  nomeAtual = nome;
  var modoInicial = _modoEscolhidoTemp;
  var modoJogo = modoInicial === 'livre' ? 'hibrido' : modoInicial;
  jogador = migrarJogador({
    nome:nome, nivel:1, xp:0, passaportes:0, pc:0, energiaMax:0, bg:0, bp:0,
    time:[null,null,null,null,null,null], banco:[],
    itens:{"Poké Ball":2,"Maca de Resgate":1},
    insignias:{}, historico:[], capturas:[],
    inicialEscolhido:false, conquistasDesbloqueadas:[],
    modo:modoJogo,
    modoFixo:modoInicial
  });
  salvar();
  mostrarTela('tela-regiao');
  renderRegioesInicial();
}

// =============== LISTA DE JOGADORES ===============
function renderListaJogadores(){
  var cont = document.getElementById('lista-jogadores');
  if(!cont) return;
  cont.innerHTML = '';
  var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
  if(jogadores.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;text-align:center;">Nenhum jogador salvo.</p>';
    return;
  }
  jogadores.forEach(function(nome){
    var div = document.createElement('div');
    div.className = 'jogador-btn';
    div.innerHTML = '<span><i class="fas fa-user" style="color:var(--acento-amarelo);"></i> ' + nome + '</span>';
    var btnDel = document.createElement('button');
    btnDel.className = 'btn-deletar';
    btnDel.textContent = 'Deletar';
    btnDel.onclick = function(e){ e.stopPropagation(); deletarJogador(nome); };
    div.appendChild(btnDel);
    div.onclick = function(){ entrarJogador(nome); };
    cont.appendChild(div);
  });
}
function deletarJogador(nome){
  if(!confirm('Deletar "' + nome + '"?')) return;
  AudioSFX.erro();
  var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
  jogadores = jogadores.filter(function(j){ return j !== nome; });
  localStorage.setItem('listaJogadores', JSON.stringify(jogadores));
  localStorage.removeItem('jogador_' + nome);
  renderListaJogadores();
}
function trocarJogador(){
  AudioSFX.clickMenu();
  if(jogador) salvar();
  if(autoSaveInterval){ clearInterval(autoSaveInterval); autoSaveInterval = null; }
  AudioSFX.pararBatalhaTema();
  // Desconecta multiplayer
  if(_mpSocket && _mpConectado){
    _mpSocket.disconnect();
    _mpConectado = false;
  }
  nomeAtual = null;
  jogador = null;
  _modoEscolhidoTemp = null;
  mostrarTela('tela-menu');
}

// =============== ENTRAR JOGADOR ===============
async function entrarJogador(nome){
  AudioSFX.clickMenu();
  nomeAtual = nome;
  var dados = localStorage.getItem('jogador_' + nome);
  if(dados){
    try{
      var parsed = JSON.parse(dados);
      if(!validarSave(parsed)){
        if(!confirm('Save corrompido! Carregar mesmo assim?')){ nomeAtual = null; return; }
      }
      jogador = migrarJogador(parsed);
      if(jogador.inicialEscolhido){
        await inicializarPokemons();
        mostrarTela('jogo');
        if(typeof atualizarTudo === 'function') atualizarTudo();
        iniciarAutoSave();
        // Tenta conectar multiplayer automaticamente
        if(typeof mpIniciar === 'function') mpIniciar();
        return;
      }
    }catch(e){}
  }
  jogador = migrarJogador({
    nome:nome, nivel:1, xp:0, passaportes:0, pc:0, energiaMax:0, bg:0, bp:0,
    time:[null,null,null,null,null,null], banco:[],
    itens:{"Poké Ball":2,"Maca de Resgate":1},
    insignias:{}, historico:[], capturas:[],
    inicialEscolhido:false, conquistasDesbloqueadas:[], modo:'hibrido', modoFixo:'livre'
  });
  mostrarTela('tela-regiao');
  renderRegioesInicial();
}

// =============== INICIALIZAR POKÉMONS ===============
async function inicializarPokemons(){
  var todos = (jogador.time || []).filter(Boolean).concat(jogador.banco || []);
  for(var i = 0; i < todos.length; i++){
    var p = todos[i];
    if(!p) continue;
    migrarPokemon(p);
    if(!p.baseStats || !p.baseStats.hp){
      try{ await garantirBaseStats(p); }catch(e){}
    }
    if(typeof inicializarHP === 'function') inicializarHP(p);
  }
}

// =============== CACHE BASE STATS ===============
var BASE_STATS_FALLBACK = {hp:60,atk:60,def:60,spa:60,spd:60,spe:60};
var CACHE_BASE_STATS = {};
var CACHE_BASE_STATS_PROMISES = {};

async function carregarBaseStats(id){
  if(!id || id <= 0) return BASE_STATS_FALLBACK;
  if(CACHE_BASE_STATS[id]) return CACHE_BASE_STATS[id];
  if(CACHE_BASE_STATS_PROMISES[id]) return CACHE_BASE_STATS_PROMISES[id];
  var promise = (async function(){
    try{
      var r = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
      if(!r.ok) throw new Error();
      var dados = await r.json();
      var base = {hp:60,atk:60,def:60,spa:60,spd:60,spe:60};
      if(dados.stats){
        var map = {hp:'hp', attack:'atk', defense:'def', 'special-attack':'spa', 'special-defense':'spd', speed:'spe'};
        dados.stats.forEach(function(s){
          var k = map[s.stat.name];
          if(k) base[k] = s.base_stat;
        });
      }
      CACHE_BASE_STATS[id] = base;
      return base;
    }catch(e){
      CACHE_BASE_STATS[id] = BASE_STATS_FALLBACK;
      return BASE_STATS_FALLBACK;
    }finally{
      delete CACHE_BASE_STATS_PROMISES[id];
    }
  })();
  CACHE_BASE_STATS_PROMISES[id] = promise;
  return promise;
}
async function garantirBaseStats(pokemon){
  if(!pokemon) return BASE_STATS_FALLBACK;
  if(pokemon.baseStats && pokemon.baseStats.hp) return pokemon.baseStats;
  var base = await carregarBaseStats(pokemon.id);
  pokemon.baseStats = base;
  return base;
}

// =============== CÁLCULO DE STATS ===============
function calcularStatPokemon(base, iv, ev, nivel, naturezaMod){
  if(naturezaMod === 'hp') return Math.floor((2 * base + iv + Math.floor(ev / 4)) * nivel / 100) + nivel + 10;
  return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * nivel / 100) + 5) * (naturezaMod || 1));
}
function calcularStatsCompletos(pokemon, baseStats){
  var nivel = pokemon.lvl || 1;
  var iv = 31, ev = 0;
  var nat = pokemon.natureza || {up:null, down:null};
  var mods = {atk:1, def:1, spa:1, spd:1, spe:1};
  if(nat.up) mods[nat.up] = 1.1;
  if(nat.down) mods[nat.down] = 0.9;
  var base = baseStats || pokemon.baseStats || CACHE_BASE_STATS[pokemon.id] || BASE_STATS_FALLBACK;
  var boost = pokemon.boostPermanente || {atk:1, def:1, spa:1, spd:1, spe:1};
  return {
    hp:  calcularStatPokemon(base.hp,  iv, ev, nivel, 'hp'),
    atk: Math.floor(calcularStatPokemon(base.atk, iv, ev, nivel, mods.atk) * (boost.atk || 1)),
    def: Math.floor(calcularStatPokemon(base.def, iv, ev, nivel, mods.def) * (boost.def || 1)),
    spa: Math.floor(calcularStatPokemon(base.spa, iv, ev, nivel, mods.spa) * (boost.spa || 1)),
    spd: Math.floor(calcularStatPokemon(base.spd, iv, ev, nivel, mods.spd) * (boost.spd || 1)),
    spe: Math.floor(calcularStatPokemon(base.spe, iv, ev, nivel, mods.spe) * (boost.spe || 1))
  };
}
function inicializarHP(p){
  if(!p) return;
  var stats = calcularStatsCompletos(p, p.baseStats);
  p._hpMax = stats.hp;
  p._stats = stats;
  if(p.hpAtual === null || p.hpAtual === undefined || isNaN(p.hpAtual)){
    p.hpAtual = stats.hp;
  }else{
    if(p.hpAtual > stats.hp) p.hpAtual = stats.hp;
    if(p.hpAtual < 0) p.hpAtual = 0;
  }
  if(!p.boosts) p.boosts = {};
  if(!p.habilidade) p.habilidade = sortearHabilidade(p.tipo || 'normal');
}

// =============== EFETIVIDADE ===============
var EFETIVIDADE = {
  normal:{rock:0.5,ghost:0,steel:0.5},
  fire:{fire:0.5,water:0.5,grass:2,ice:2,bug:2,rock:0.5,dragon:0.5,steel:2},
  water:{fire:2,water:0.5,grass:0.5,ground:2,rock:2,dragon:0.5},
  electric:{water:2,electric:0.5,grass:0.5,ground:0,flying:2,dragon:0.5},
  grass:{fire:0.5,water:2,grass:0.5,poison:0.5,ground:2,flying:0.5,bug:0.5,rock:2,dragon:0.5,steel:0.5},
  ice:{fire:0.5,water:0.5,grass:2,ice:0.5,ground:2,flying:2,dragon:2,steel:0.5},
  fighting:{normal:2,ice:2,poison:0.5,flying:0.5,psychic:0.5,bug:0.5,rock:2,ghost:0,dark:2,steel:2,fairy:0.5},
  poison:{grass:2,poison:0.5,ground:0.5,rock:0.5,ghost:0.5,steel:0,fairy:2},
  ground:{fire:2,electric:2,grass:0.5,poison:2,flying:0,bug:0.5,rock:2,steel:2},
  flying:{electric:0.5,grass:2,fighting:2,bug:2,rock:0.5,steel:0.5},
  psychic:{fighting:2,poison:2,psychic:0.5,dark:0,steel:0.5},
  bug:{fire:0.5,grass:2,fighting:0.5,poison:0.5,flying:0.5,psychic:2,ghost:0.5,dark:2,steel:0.5,fairy:0.5},
  rock:{fire:2,ice:2,fighting:0.5,ground:0.5,flying:2,bug:2,steel:0.5},
  ghost:{normal:0,psychic:2,ghost:2,dark:0.5},
  dragon:{dragon:2,steel:0.5,fairy:0},
  dark:{fighting:0.5,psychic:2,ghost:2,dark:0.5,fairy:0.5},
  steel:{fire:0.5,water:0.5,electric:0.5,ice:2,rock:2,steel:0.5,fairy:2},
  fairy:{fire:0.5,fighting:2,poison:0.5,dragon:2,dark:2,steel:0.5}
};
function getEfetividade(tipoAtk, tipoDef){
  if(!tipoAtk || !tipoDef) return 1;
  var tab = EFETIVIDADE[tipoAtk];
  if(!tab) return 1;
  return tab[tipoDef] !== undefined ? tab[tipoDef] : 1;
}

// =============== HABILIDADES ===============
var HABILIDADES_POR_TIPO = {
  fire:['Blaze','Flash Fire','Drought'], water:['Torrent','Drizzle','Water Absorb'],
  grass:['Overgrow','Chlorophyll','Effect Spore'], electric:['Static','Lightning Rod','Motor Drive'],
  ice:['Snow Cloak','Ice Body','Slush Rush'], fighting:['Guts','Inner Focus','Justified'],
  poison:['Poison Point','Levitate','Corrosion'], ground:['Sand Veil','Sand Rush','Arena Trap'],
  flying:['Keen Eye','Levitate','Gale Wings'], psychic:['Synchronize','Magic Guard','Levitate'],
  bug:['Swarm','Compound Eyes','Tinted Lens'], rock:['Sturdy','Solid Rock','Sand Stream'],
  ghost:['Cursed Body','Levitate','Infiltrator'], dragon:['Multiscale','Inner Focus','Rivalry'],
  dark:['Intimidate','Moxie','Dark Aura'], steel:['Clear Body','Iron Barbs','Light Metal'],
  fairy:['Pixilate','Cute Charm','Misty Surge'], normal:['Run Away','Adaptability','Serene Grace']
};
function sortearHabilidade(tipo){
  var pool = HABILIDADES_POR_TIPO[tipo] || HABILIDADES_POR_TIPO.normal;
  return pool[Math.floor(Math.random() * pool.length)];
}
var HABILIDADES_EFEITOS = {
  'Blaze':{tipoBonus:'fire',hpHurdle:0.33,mult:1.5},
  'Torrent':{tipoBonus:'water',hpHurdle:0.33,mult:1.5},
  'Overgrow':{tipoBonus:'grass',hpHurdle:0.33,mult:1.5},
  'Swarm':{tipoBonus:'bug',hpHurdle:0.33,mult:1.5},
  'Intimidate':{reduzAtkInimigo:1},
  'Levitate':{imune:'ground'},
  'Sturdy':{sobrevive1HP:true},
  'Static':{chanceParalisar:0.30},
  'Flame Body':{chanceQueimar:0.30},
  'Poison Point':{chanceEnvenenar:0.30},
  'Effect Spore':{chanceStatus:0.30},
  'Rough Skin':{danoContato:0.125},
  'Synchronize':{passaStatus:true}
};

console.log('Pokémon TCG v23.0 — script1.js carregado');