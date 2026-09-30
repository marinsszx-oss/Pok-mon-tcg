// =========================================================
// POKÉMON TCG v23.0 — script3.js
// Render + UI + Loja + Itens + Pokédex + Centro + Regiões
// + Ranking + Conquistas + Missões + Copas + Liga
// + Rocket aba + Regras modal + Nome + Apelido
// =========================================================
'use strict';

// =============== DROPDOWN DE POKÉBOLA ===============
function getPokebolasDoInventario(){
  var r = [];
  LISTA_POKEBOLAS.forEach(function(pb){
    var q = jogador.itens[pb.nome] || 0;
    if(q > 0) r.push({nome:pb.nome, img:pb.img, quantidade:q});
  });
  return r;
}
function renderDropdownBola(){
  var selecionado = document.getElementById('dropdown-bola-selecionado');
  var lista = document.getElementById('dropdown-bola-lista');
  if(!selecionado || !lista) return;
  var disponiveis = getPokebolasDoInventario();
  if(disponiveis.length > 0){
    if(!bolaSelecionada || !disponiveis.find(function(b){ return b.nome === bolaSelecionada.nome; })){
      bolaSelecionada = {
        nome:disponiveis[0].nome,
        slug:disponiveis[0].img.split('/').pop().replace('.png', '')
      };
    }
  }else{ bolaSelecionada = null; }
  selecionado.innerHTML = '';
  if(bolaSelecionada){
    var pb = disponiveis.find(function(b){ return b.nome === bolaSelecionada.nome; });
    if(pb){
      selecionado.appendChild(criarImagem(pb.img, '26px', 'Bola'));
      var span = document.createElement('span');
      span.textContent = pb.nome + ' (x' + pb.quantidade + ')';
      selecionado.appendChild(span);
    }
  }else{
    var span2 = document.createElement('span');
    span2.style.color = '#ee1515';
    span2.textContent = 'Sem Pokébolas';
    selecionado.appendChild(span2);
  }
  lista.innerHTML = '';
  if(disponiveis.length === 0){
    var v = document.createElement('div');
    v.className = 'dropdown-bola-vazio';
    v.textContent = 'Compre Pokébolas na Loja!';
    lista.appendChild(v);
    return;
  }
  disponiveis.forEach(function(b){
    var opt = document.createElement('div');
    opt.className = 'dropdown-bola-opcao';
    opt.appendChild(criarImagem(b.img, '26px', 'Bola'));
    var s = document.createElement('span'); s.textContent = b.nome; opt.appendChild(s);
    var q = document.createElement('span'); q.className = 'qtd'; q.textContent = 'x' + b.quantidade; opt.appendChild(q);
    opt.onclick = function(){
      AudioSFX.clickMenu();
      bolaSelecionada = {nome:b.nome, slug:b.img.split('/').pop().replace('.png', '')};
      renderDropdownBola();
      lista.classList.remove('aberta');
    };
    lista.appendChild(opt);
  });
}
function toggleDropdownBola(){
  AudioSFX.clickMenu();
  var l = document.getElementById('dropdown-bola-lista');
  if(l) l.classList.toggle('aberta');
}

// =============== RARIDADE ===============
function toggleRaridade(){
  AudioSFX.clickMenu();
  var modal = document.getElementById('modal-raridade');
  var lista = document.getElementById('modal-raridade-lista');
  if(!modal || !lista) return;
  lista.innerHTML = '';
  var temBolaEspecial = (jogador.itens['Ultra Ball'] || 0) > 0 || (jogador.itens['Master Ball'] || 0) > 0;
  var opcoes = [
    {id:'normal', nome:'Normal', desc:'Comum', cor:'#666'},
    {id:'EX', nome:'EX', desc:'Requer bola especial', cor:'#ff9800', req:true},
    {id:'GX', nome:'GX', desc:'Requer bola especial', cor:'#2196f3', req:true},
    {id:'Vmax', nome:'Vmax', desc:'Requer bola especial', cor:'#e91e63', req:true},
    {id:'Gmax Permanente', nome:'Gmax Permanente', desc:'Requer bola especial', cor:'#9c27b0', req:true},
    {id:'Mega Permanente', nome:'Mega Permanente', desc:'Requer bola especial', cor:'#ffd700', req:true}
  ];
  opcoes.forEach(function(op){
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    if(op.req && !temBolaEspecial) div.style.opacity = '0.4';
    div.innerHTML = '<div style="width:48px;height:48px;border-radius:50%;background:' + op.cor + ';display:flex;align-items:center;justify-content:center;">' +
      '<i class="fas fa-star" style="color:#fff;font-size:20px;"></i></div>' +
      '<div class="info"><div class="nome">' + op.nome + '</div><div class="lvl">' + op.desc + '</div></div>';
    if(!op.req || temBolaEspecial) div.onclick = function(){ selecionarRaridade(op.id); };
    lista.appendChild(div);
  });
  modal.classList.add('aberto');
}
function selecionarRaridade(rar){
  AudioSFX.clickMenu();
  raridadeSelecionada = rar;
  var info = document.getElementById('raridade-info');
  var texto = document.getElementById('raridade-texto');
  var btn = document.getElementById('btn-raridade');
  if(rar === 'normal'){
    if(info) info.classList.remove('ativa');
    if(btn) btn.classList.remove('ativa');
  }else{
    if(info) info.classList.add('ativa');
    if(texto) texto.textContent = 'Raridade: ' + rar;
    if(btn) btn.classList.add('ativa');
  }
  fecharModalRaridade();
}
function fecharModalRaridade(){
  AudioSFX.clickMenu();
  var el = document.getElementById('modal-raridade');
  if(el) el.classList.remove('aberto');
}

// =============== AUTOCOMPLETE ===============
function configurarAutocomplete(){
  var input = document.getElementById('c-pokemon');
  var lista = document.getElementById('c-pokemon-lista');
  if(!input || !lista || autocompleteConfigurado) return;
  autocompleteConfigurado = true;
  var buscar = debounce(function(){
    var termo = input.value.trim().toLowerCase();
    if(termo.length < 2){ lista.classList.remove('aberta'); return; }
    var listaPoke = (typeof LISTA_POKEMON_COMPLETA !== 'undefined') ? LISTA_POKEMON_COMPLETA : [];
    var sugestoes = listaPoke.filter(function(p){
      return p.toLowerCase().indexOf(termo) === 0;
    }).slice(0, 10);
    if(sugestoes.length === 0){ lista.classList.remove('aberta'); return; }
    lista.innerHTML = '';
    sugestoes.forEach(function(nome){
      var item = document.createElement('div');
      item.className = 'autocomplete-item';
      var id = listaPoke.indexOf(nome) + 1;
      item.appendChild(criarImagem(spritePokemon(id), '32px'));
      var span = document.createElement('span'); span.textContent = nome;
      item.appendChild(span);
      item.onclick = function(){ input.value = nome; lista.classList.remove('aberta'); };
      lista.appendChild(item);
    });
    lista.classList.add('aberta');
  }, 150);
  input.addEventListener('input', buscar);
  document.addEventListener('click', function(e){
    if(!e.target.closest('.autocomplete-wrapper')) lista.classList.remove('aberta');
  });
}

// =============== REGISTRAR CAPTURA ===============
async function registrarCaptura(){
  var nome = document.getElementById('c-pokemon').value.trim();
  var regiao = document.getElementById('c-regiao').value;
  var forma = document.getElementById('c-forma').value || '';
  if(!nome){ AudioSFX.erro(); alert('Digite o nome!'); return; }
  var critica = document.getElementById('c-critica').checked;
  var shiny = document.getElementById('c-shiny').checked;
  var sexoEscolhido = document.getElementById('c-sexo') ? document.getElementById('c-sexo').value : 'aleatorio';
  if(!bolaSelecionada){ AudioSFX.erro(); alert('Sem Pokébolas!'); return; }
  var chaveBola = bolaSelecionada.nome;
  if(raridadeSelecionada !== 'normal'){
    var temBola = (jogador.itens['Ultra Ball'] || 0) > 0 || (jogador.itens['Master Ball'] || 0) > 0;
    if(!temBola){ AudioSFX.erro(); alert('Precisa de bola especial!'); return; }
    var bolaOK = chaveBola === 'Ultra Ball' || chaveBola === 'Master Ball';
    if(!bolaOK){ AudioSFX.erro(); alert('Use Ultra ou Master Ball!'); return; }
  }
  var idForma = null, nomeFinal = nome;
  if(forma){
    var formasDisp = FORMAS_REGIONAIS_POR_POKEMON[nome];
    if(!formasDisp || !formasDisp[forma]){ AudioSFX.erro(); alert(nome + ' não tem essa forma!'); return; }
    idForma = formasDisp[forma].id;
    nomeFinal = formasDisp[forma].nome;
  }
  if(!critica){
    if(!jogador.itens[chaveBola] || jogador.itens[chaveBola] <= 0){
      AudioSFX.erro(); alert('Sem essa Pokébola!'); renderDropdownBola(); return;
    }
  }
  try{
    mostrarLoading(true);
    var p = null;
    try{ p = await buscarPokemon(nome); }catch(err){}
    if(!p || !p.id){
      var lista = (typeof LISTA_POKEMON_COMPLETA !== 'undefined') ? LISTA_POKEMON_COMPLETA : [];
      var idx = lista.indexOf(nome);
      if(idx !== -1){ p = await buscarPokemonPorId(idx + 1); }
    }
    mostrarLoading(false);
    if(!p || !p.id){
      AudioSFX.erro();
      alert('Pokémon "' + nome + '" não encontrado.\n\nVerifique o nome.');
      return;
    }
    var bolaImg = imagemBola(bolaSelecionada.slug);
    var spriteAnimacao = idForma ? idForma : p.id;
    await mostrarAnimacaoCaptura(nomeFinal, spriteAnimacao, bolaImg, critica);
    var sexoFinal = sexoEscolhido === 'aleatorio' ? sortearSexo(nomeFinal) : sexoEscolhido;
    var pokemonObj = {
      id:p.id, nome:nomeFinal, lvl:p.lvl, batalhas:0, bg:0, bp:0,
      tipo:p.tipo, baseStats:p.baseStats || await carregarBaseStats(p.id),
      favorito:false, regiaoOrigem:regiao, notas:'', capturadoEm:new Date().toISOString(),
      amizade:0, batalhasSemUso:0, trocado:false, itemEquipado:null,
      raridade:raridadeSelecionada, forma:forma, idForma:idForma,
      mega:false, megaForma:null, nomeMega:null, gigantamax:false, idGmax:null,
      permanente:false, permanenteMega:false,
      shiny:shiny, sexo:sexoFinal, natureza:sortearNatureza(),
      hpAtual:null, status:null, statusTurnos:0,
      moves:gerarMovesIniciaisFallback(p.tipo),
      habilidade:sortearHabilidade(p.tipo),
      boosts:{}, boostPermanente:{atk:1, def:1, spa:1, spd:1, spe:1},
      apelido:''
    };
    if(raridadeSelecionada === 'Gmax Permanente'){
      pokemonObj.gigantamax = true;
      pokemonObj.permanente = true;
      if(GMAX_SPRITES[nome]) pokemonObj.idGmax = GMAX_SPRITES[nome];
    }
    if(raridadeSelecionada === 'Mega Permanente'){
      var megaInfo = MEGA_EVOLUCOES[nome];
      if(megaInfo){
        pokemonObj.mega = true;
        pokemonObj.megaForma = 'X';
        pokemonObj.nomeMega = nome + ' Mega';
        pokemonObj.permanenteMega = true;
      }
    }
    inicializarHP(pokemonObj);
    var slotVazio = jogador.time.indexOf(null);
    if(slotVazio !== -1) jogador.time[slotVazio] = pokemonObj;
    else jogador.banco.push(pokemonObj);
    if(!critica){
      jogador.itens[chaveBola]--;
      if(jogador.itens[chaveBola] <= 0) delete jogador.itens[chaveBola];
    }
    var isUB = ULTRA_BEASTS && ULTRA_BEASTS.indexOf(nomeFinal) !== -1;
    jogador.capturas.unshift({
      nome:nomeFinal, bola:bolaSelecionada.nome, bolaSlug:bolaSelecionada.slug,
      critica:critica, regiao:regiao, raridade:raridadeSelecionada, forma:forma,
      sexo:sexoFinal, shiny:shiny, id:Date.now(), modo:'hibrido', rota:null
    });
    if(typeof marcarPokedex === 'function') marcarPokedex(p.id, true, shiny, isUB);
    var xpQtd = XP_ACOES.captura;
    if(raridadeSelecionada !== 'normal') xpQtd = XP_ACOES.captura_mega_gmax;
    if(shiny) xpQtd += 100;
    darXP(xpQtd, 'Captura: ' + nomeFinal);
    registrarContador('capturas');
    if(shiny) jogador.shiniesCapturados = (jogador.shiniesCapturados || 0) + 1;
    salvar();
    AudioSFX.pokemonNovo();
    if(shiny) setTimeout(function(){ mostrarToastShiny(nomeFinal); }, 500);
    document.getElementById('c-pokemon').value = '';
    document.getElementById('c-critica').checked = false;
    document.getElementById('c-shiny').checked = false;
    document.getElementById('c-forma').value = '';
    if(document.getElementById('c-sexo')) document.getElementById('c-sexo').value = 'aleatorio';
    raridadeSelecionada = 'normal';
    var infoR = document.getElementById('raridade-info');
    var btnR = document.getElementById('btn-raridade');
    if(infoR) infoR.classList.remove('ativa');
    if(btnR) btnR.classList.remove('ativa');
    renderDropdownBola();
    atualizarTudo();
  }catch(e){
    mostrarLoading(false);
    AudioSFX.erro();
    console.error('Erro registrarCaptura:', e);
    alert('Erro ao registrar.');
  }
}
async function registrarFuga(){
  if(!bolaSelecionada){ AudioSFX.erro(); alert('Sem Pokébolas!'); return; }
  var nome = document.getElementById('c-pokemon').value.trim() || 'Pokémon selvagem';
  var chaveBola = bolaSelecionada.nome;
  var bolaInfo = LISTA_POKEBOLAS.find(function(b){ return b.nome === chaveBola; });
  var resistente = bolaInfo && (bolaInfo.garantida || bolaInfo.nome === 'Master Ball');
  if(!confirm('Registrar FUGA?\n\n' + nome + ' fugiu!')) return;
  if(!resistente){
    if(!jogador.itens[chaveBola] || jogador.itens[chaveBola] <= 0){ AudioSFX.erro(); return; }
    jogador.itens[chaveBola]--;
    if(jogador.itens[chaveBola] <= 0) delete jogador.itens[chaveBola];
  }
  jogador.fugas = (jogador.fugas || 0) + 1;
  AudioSFX.somFuga();
  salvar();
  renderDropdownBola();
  atualizarTudo();
  alert(nome + ' fugiu!');
}
async function mostrarAnimacaoCaptura(nome, id, bolaImg, critica){
  try{
    var overlay = document.getElementById('overlay-animacao');
    var img = document.getElementById('overlay-img');
    var pokebola = document.getElementById('overlay-pokebola');
    var titulo = document.getElementById('overlay-titulo');
    if(!overlay || !img) return;
    img.src = spritePokemon(id);
    img.style.opacity = '1';
    img.className = '';
    pokebola.src = bolaImg;
    pokebola.style.display = 'none';
    titulo.textContent = 'Um ' + nome + ' selvagem apareceu!';
    overlay.classList.add('ativo');
    await new Promise(function(r){ setTimeout(r, 800); });
    titulo.textContent = 'Você jogou uma Pokébola!';
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
    pokebola.classList.add('anim-pokebola-balanco');
    for(var i = 0; i < 3; i++){
      AudioSFX.somBalanco();
      await new Promise(function(r){ setTimeout(r, 600); });
    }
    pokebola.classList.remove('anim-pokebola-balanco');
    AudioSFX.somCapturaFinal();
    titulo.textContent = critica ? 'CAPTURA CRÍTICA!' : nome + ' foi capturado!';
    await new Promise(function(r){ setTimeout(r, 1500); });
    overlay.classList.remove('ativo');
    img.className = '';
    pokebola.style.display = 'none';
  }catch(e){
    var ov = document.getElementById('overlay-animacao');
    if(ov) ov.classList.remove('ativo');
  }
}

// =============== RENDER CAPTURAS ===============
function renderCapturas(){
  var cont = document.getElementById('capturas-lista');
  if(!cont) return;
  cont.innerHTML = '';
  if(!jogador.capturas || jogador.capturas.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhuma captura.</p>';
    return;
  }
  jogador.capturas.slice(0, 50).forEach(function(c){
    var div = document.createElement('div');
    div.className = 'captura-item' + (c.shiny ? ' shiny' : '');
    div.appendChild(criarImagem(imagemBola(c.bolaSlug), '34px', 'Bola'));
    var info = document.createElement('div');
    info.className = 'info';
    var rarTag = (c.raridade && c.raridade !== 'normal') ? ' [' + c.raridade + ']' : '';
    var formaTag = c.forma ? ' (' + NOMES_FORMAS[c.forma] + ')' : '';
    var shinyTag = c.shiny ? ' ✨' : '';
    var sexoTag = c.sexo === 'M' ? ' ♂' : c.sexo === 'F' ? ' ♀' : '';
    var modoTag = c.modo === 'digital' ? ' <i class="fas fa-gamepad" style="color:#00bcd4;"></i>' : '';
    var rotaTag = c.rota ? ' em ' + c.rota : '';
    info.innerHTML = '<b>' + c.nome + sexoTag + shinyTag + rarTag + formaTag + '</b> — ' + (c.regiao || '?') + rotaTag + ' — <b>' + c.bola + '</b>' + (c.critica ? ' (Crítica!)' : '') + modoTag;
    div.appendChild(info);
    var btn = document.createElement('button');
    btn.className = 'btn-x';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    btn.addEventListener('click', function(){
      if(!confirm('Apagar?')) return;
      jogador.capturas = jogador.capturas.filter(function(x){ return x.id !== c.id; });
      salvar();
      renderCapturas();
    });
    div.appendChild(btn);
    cont.appendChild(div);
  });
}

// =============== INSÍGNIAS DROPDOWN ===============
function atualizarInsigniasDropdown(){
  var selectRegiao = document.getElementById('h-regiao');
  var selectInsignia = document.getElementById('h-insignia');
  if(!selectRegiao || !selectInsignia) return;
  var regiao = selectRegiao.value;
  selectInsignia.innerHTML = '';
  if(INSIGNIAS[regiao]){
    INSIGNIAS[regiao].forEach(function(nome, i){
      var opt = document.createElement('option');
      opt.value = i; opt.textContent = nome;
      selectInsignia.appendChild(opt);
    });
  }
}
function atualizarMVP(){
  var sel = document.getElementById('h-pokemon');
  if(!sel) return;
  var anterior = sel.value;
  sel.innerHTML = '<option value="">- Selecione -</option>';
  jogador.time.filter(Boolean).forEach(function(p){
    var opt = document.createElement('option');
    opt.value = p.nome;
    opt.textContent = (p.apelido || p.nome) + (p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '') + (p.shiny ? ' ✨' : '') + ' (Lvl ' + p.lvl + ') [Time]';
    sel.appendChild(opt);
  });
  jogador.banco.forEach(function(p){
    var opt = document.createElement('option');
    opt.value = p.nome;
    opt.textContent = (p.apelido || p.nome) + (p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '') + (p.shiny ? ' ✨' : '') + ' (Lvl ' + p.lvl + ') [Banco]';
    sel.appendChild(opt);
  });
  if(anterior){
    var existe = Array.from(sel.options).some(function(o){ return o.value === anterior; });
    if(existe) sel.value = anterior;
  }
}

// =============== REGISTRAR BATALHA MANUAL ===============
async function registrarBatalha(){
  var regiao = document.getElementById('h-regiao').value;
  var resultado = document.getElementById('h-resultado').value;
  var tipo = document.getElementById('h-tipo').value;
  var pokemon = document.getElementById('h-pokemon').value || '-';
  var pass = 0, pc = 0;
  AudioSFX.batalhaInicio();
  var isRocket = (tipo === 'Equipe Rocket');
  if(resultado === 'Ganhou'){
    if(isRocket){
      pc = 40; pass = 2;
      jogador.rocketDerrotados = (jogador.rocketDerrotados || 0) + 1;
    }else{
      switch(tipo){
        case 'Selvagem': pc = 1; break;
        case 'Amador': pass = 0.5; pc = 3; break;
        case 'Profissional': pass = 1; pc = 5; break;
        case 'Treinador de Ginásio': pass = 2; pc = 8; break;
        case 'Líder de Ginásio': pass = 6; pc = 15; break;
        case 'Boss de Ginásio': pass = 3; pc = 20; jogador.energiaMax = (jogador.energiaMax || 0) + 25; break;
        case 'Boss GX': pass = 4; pc = 25; break;
        case 'Boss Vmax': pass = 4; pc = 25; jogador.energiaMax = (jogador.energiaMax || 0) + 25; break;
        case 'Boss EX': pass = 4; pc = 25; break;
        case 'Treinador de Copa': pass = 5; pc = 30; break;
        case 'Treinador de Liga': pass = 5; pc = 35; break;
      }
    }
    jogador.passaportes += pass;
    jogador.pc += pc;
    jogador.bg++;
    jogador.sequenciaAtual = (jogador.sequenciaAtual || 0) + 1;
    if(jogador.sequenciaAtual > (jogador.maiorSequencia || 0)) jogador.maiorSequencia = jogador.sequenciaAtual;
    if(isRocket) AudioSFX.rocketDerrotada();
    else AudioSFX.batalhaVitoria();
    darXP(isRocket ? XP_ACOES.rocket_recruta : XP_ACOES.vitoria_batalha, isRocket ? 'Rocket derrotado!' : 'Vitória em batalha');
    registrarContador('batalhas');
    // Chave Rocket 10% no manual
    if(isRocket && Math.random() < 0.10){
      jogador.itens['Chave Rocket'] = (jogador.itens['Chave Rocket'] || 0) + 1;
      jogador.chavesRocket = (jogador.chavesRocket || 0) + 1;
      setTimeout(function(){
        mostrarToastNotificacao('🔑 CHAVE ROCKET!', 'Você pode abrir a base secreta!');
      }, 2000);
    }
  }else{
    jogador.bp = (jogador.bp || 0) + 1;
    jogador.sequenciaAtual = 0;
    AudioSFX.batalhaDerrota();
  }
  var insigniaIdx = undefined;
  if((tipo === 'Boss de Ginásio' || tipo === 'Líder de Ginásio') && resultado === 'Ganhou'){
    var selectIns = document.getElementById('h-insignia');
    if(selectIns && selectIns.value !== ''){
      insigniaIdx = parseInt(selectIns.value);
      if(!jogador.insignias[regiao]) jogador.insignias[regiao] = [];
      jogador.insignias[regiao][insigniaIdx] = true;
    }
  }
  var mvpObj = null;
  if(pokemon && pokemon !== '-'){
    var todos = jogador.time.filter(Boolean).concat(jogador.banco);
    mvpObj = todos.find(function(x){ return x.nome === pokemon; });
  }
  if(mvpObj){
    mvpObj.batalhas++;
    if(resultado === 'Ganhou'){ mvpObj.bg++; mvpObj.lvl++; } else mvpObj.bp++;
    adicionarAmizade(mvpObj, AMIZADE_POR_BATALHA);
  }
  perderAmizadePorDesuso();
  jogador.historico.unshift({
    regiao:regiao, resultado:resultado, tipo:tipo, pokemon:pokemon,
    id:Date.now(), insigniaIdx:insigniaIdx, modo:'hibrido'
  });
  if(isRocket){
    if(!jogador.rocketHistorico) jogador.rocketHistorico = [];
    jogador.rocketHistorico.unshift({
      id:Date.now(), tipo:'Manual', nome:'Equipe Rocket (registro manual)',
      resultado:resultado, regiao:regiao, data:new Date().toISOString()
    });
  }
  salvar();
  mostrarAnimacaoAtaque(resultado === 'Ganhou', mvpObj);
  await verificarTodasEvolucoes();
  atualizarTudo();
  var msg = resultado === 'Ganhou' ? ('Vitória!\n\n+' + pc + ' PC' + (pass > 0 ? '\n+' + pass + ' Passaporte' : '')) : 'Derrota...';
  setTimeout(function(){ alert(msg); }, 600);
}
function mostrarAnimacaoAtaque(ganhou, mvp){
  var overlay = document.getElementById('anim-ataque');
  var flash = document.getElementById('flash-ataque');
  var sprite = document.getElementById('sprite-mvp-ataque');
  var texto = document.getElementById('texto-ataque');
  if(!overlay) return;
  flash.className = 'flash-ataque ' + (ganhou ? 'ganhou' : 'perdeu');
  if(mvp){
    sprite.onerror = function(){ this.onerror = null; this.src = spritePokemon(mvp.id || 0); };
    sprite.src = spritePokemonAtual(mvp);
    sprite.style.display = 'block';
    texto.textContent = ganhou ? mvp.nome + ' atacou!' : mvp.nome + ' foi derrotado!';
  }else{
    sprite.style.display = 'none';
    texto.textContent = ganhou ? 'Vitória!' : 'Derrota...';
  }
  overlay.classList.add('ativo');
  ataqueEmAndamento = true;
  AudioSFX.vibrar(ganhou ? 60 : 150);
  if(ganhou) AudioSFX.ataque();
  setTimeout(function(){
    ataqueEmAndamento = false;
    overlay.classList.remove('ativo');
    sprite.style.display = 'none';
  }, 700);
}

// =============== HISTÓRICO ===============
function getHistoricoFiltrado(){
  var busca = (document.getElementById('filtro-hist-busca')?.value || '').toLowerCase();
  var regiao = (document.getElementById('filtro-hist-regiao')?.value || 'todas');
  var resultado = (document.getElementById('filtro-hist-resultado')?.value || 'todos');
  var lista = (jogador.historico || []).slice();
  if(busca) lista = lista.filter(function(h){ return (h.pokemon || '').toLowerCase().indexOf(busca) !== -1; });
  if(regiao !== 'todas') lista = lista.filter(function(h){ return h.regiao === regiao; });
  if(resultado !== 'todos') lista = lista.filter(function(h){ return h.resultado === resultado; });
  return lista;
}
function desfazerBatalha(idBatalha){
  var batalha = jogador.historico.find(function(h){ return h.id === idBatalha; });
  if(!batalha) return;
  if(!confirm('Desfazer essa batalha?')) return;
  var pass = 0, pc = 0;
  if(batalha.resultado === 'Ganhou'){
    switch(batalha.tipo){
      case 'Selvagem': pc = 1; break;
      case 'Amador': pass = 0.5; pc = 3; break;
      case 'Profissional': pass = 1; pc = 5; break;
      case 'Treinador de Ginásio': pass = 2; pc = 8; break;
      case 'Líder de Ginásio': pass = 6; pc = 15; break;
      case 'Boss de Ginásio': pass = 3; pc = 20; break;
      case 'Treinador de Copa': pass = 5; pc = 30; break;
      case 'Treinador de Liga': pass = 5; pc = 35; break;
      case 'Equipe Rocket': pass = 2; pc = 40; break;
    }
    jogador.passaportes = Math.max(0, jogador.passaportes - pass);
    jogador.pc = Math.max(0, jogador.pc - pc);
    jogador.bg = Math.max(0, jogador.bg - 1);
    jogador.xp = Math.max(0, (jogador.xp || 0) - XP_ACOES.vitoria_batalha);
  }else{ jogador.bp = Math.max(0, jogador.bp - 1); }
  if((batalha.tipo === 'Boss de Ginásio' || batalha.tipo === 'Líder de Ginásio') && batalha.resultado === 'Ganhou' && batalha.insigniaIdx !== undefined){
    if(jogador.insignias[batalha.regiao]) jogador.insignias[batalha.regiao][batalha.insigniaIdx] = false;
  }
  if(batalha.pokemon && batalha.pokemon !== '-'){
    var todos = jogador.time.filter(Boolean).concat(jogador.banco);
    var p = todos.find(function(x){ return x.nome === batalha.pokemon; });
    if(p){
      p.batalhas = Math.max(0, p.batalhas - 1);
      if(batalha.resultado === 'Ganhou'){ p.bg = Math.max(0, p.bg - 1); p.lvl = Math.max(1, p.lvl - 1); }
      else p.bp = Math.max(0, p.bp - 1);
    }
  }
  jogador.historico = jogador.historico.filter(function(h){ return h.id !== idBatalha; });
  salvar();
  atualizarTudo();
}
function renderHistorico(){
  var cont = document.getElementById('historico-lista');
  if(!cont) return;
  cont.innerHTML = '';
  if(!jogador.historico || jogador.historico.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhuma batalha.</p>';
    return;
  }
  var lista = getHistoricoFiltrado();
  if(lista.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhum resultado.</p>';
    return;
  }
  lista.slice(0, 100).forEach(function(h){
    var classe = getClasseHistorico(h);
    var div = document.createElement('div');
    div.className = 'historico-item ' + classe;
    var info = document.createElement('div');
    info.className = 'info';
    var faseTxt = h.faseCopa ? ' (' + h.faseCopa + ')' : '';
    var modoTxt = h.modo === 'digital' ? ' <i class="fas fa-gamepad" style="color:#00bcd4;"></i>' : '';
    var rotaTxt = h.rota ? ' · ' + h.rota : '';
    info.innerHTML = '<b>' + h.regiao + '</b>' + faseTxt + rotaTxt + modoTxt + ' — ' + h.resultado + ' — <b>' + h.tipo + '</b> — MVP: <b>' + h.pokemon + '</b>';
    div.appendChild(info);
    var btn = document.createElement('button');
    btn.className = 'btn-x';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    btn.addEventListener('click', function(){ desfazerBatalha(h.id); });
    div.appendChild(btn);
    cont.appendChild(div);
  });
}
function mudarAbaHistorico(aba){
  AudioSFX.clickMenu();
  _abaHistoricoAtual = aba;
  var tabB = document.getElementById('hist-tab-batalhas');
  var tabC = document.getElementById('hist-tab-capturas');
  var listaB = document.getElementById('historico-lista');
  var listaC = document.getElementById('capturas-lista');
  if(aba === 'batalhas'){
    if(tabB) tabB.classList.add('ativa');
    if(tabC) tabC.classList.remove('ativa');
    if(listaB) listaB.style.display = 'block';
    if(listaC) listaC.style.display = 'none';
    renderHistorico();
  }else{
    if(tabC) tabC.classList.add('ativa');
    if(tabB) tabB.classList.remove('ativa');
    if(listaB) listaB.style.display = 'none';
    if(listaC) listaC.style.display = 'block';
    renderCapturas();
  }
}

// =============== LOJA ===============
function mudarModoLoja(modo){
  AudioSFX.clickLoja();
  modoLoja = modo;
  var btnC = document.getElementById('btn-loja-comprar');
  var btnV = document.getElementById('btn-loja-vender');
  var catBar = document.getElementById('loja-categorias');
  var filtrosC = document.getElementById('filtros-loja-comprar');
  var listaC = document.getElementById('loja-lista');
  var listaV = document.getElementById('loja-vender-lista');
  if(modo === 'comprar'){
    if(btnC) btnC.classList.add('ativo');
    if(btnV) btnV.classList.remove('ativo');
    if(catBar) catBar.style.display = 'flex';
    if(filtrosC) filtrosC.style.display = 'flex';
    if(listaC) listaC.style.display = 'grid';
    if(listaV) listaV.style.display = 'none';
    renderLojaCategoria();
  }else{
    if(btnV) btnV.classList.add('ativo');
    if(btnC) btnC.classList.remove('ativo');
    if(catBar) catBar.style.display = 'none';
    if(filtrosC) filtrosC.style.display = 'none';
    if(listaC) listaC.style.display = 'none';
    if(listaV) listaV.style.display = 'grid';
    renderLojaVender();
  }
}
function mudarCategoriaLoja(cat){
  AudioSFX.clickLoja();
  categoriaLoja = cat;
  document.querySelectorAll('#loja-categorias .cat-btn').forEach(function(b){ b.classList.remove('ativa'); });
  var btn = document.querySelector('#loja-categorias .cat-btn[data-cat="' + cat + '"]');
  if(btn) btn.classList.add('ativa');
  var mapa = {
    pokebolas:'filtro-pokebolas-busca', pedras:'filtro-pedras-busca',
    'pedras-mega':'filtro-pedras-mega-busca', itens:'filtros-loja-comprar',
    evolucao:'filtro-evolucao-busca', tms:'filtro-tms-busca'
  };
  ['filtro-pokebolas-busca','filtro-pedras-busca','filtro-pedras-mega-busca',
   'filtro-evolucao-busca','filtro-tms-busca','filtros-loja-comprar'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.style.display = (mapa[cat] === id) ? 'flex' : 'none';
  });
  if(cat === 'tms') preencherFiltroTiposTM();
  renderLojaCategoria();
}
function preencherFiltroTiposTM(){
  var sel = document.getElementById('filtro-tms-tipo');
  if(!sel || sel.options.length > 1) return;
  Object.keys(TIPOS_POKEMON).forEach(function(t){
    var o = document.createElement('option');
    o.value = t; o.textContent = TIPOS_POKEMON[t].nome;
    sel.appendChild(o);
  });
}
function renderLojaCategoria(){
  var cont = document.getElementById('loja-lista');
  if(!cont) return;
  cont.innerHTML = '';
  var timerEl = document.getElementById('timer-desc');
  if(timerEl) timerEl.textContent = getTimerDescontos();
  if(categoriaLoja === 'itens'){
    getLojaFiltrada().forEach(function(item){ cont.appendChild(criarCardLoja(item)); });
  }else if(categoriaLoja === 'pokebolas'){
    var busca = (document.getElementById('filtro-pokebolas-input')?.value || '').toLowerCase();
    LISTA_POKEBOLAS.filter(function(pb){ return !busca || pb.nome.toLowerCase().indexOf(busca) !== -1; })
      .forEach(function(item){
        var div = document.createElement('div');
        div.className = 'item-card';
        var imgC = document.createElement('div');
        imgC.className = 'item-img';
        imgC.appendChild(criarImagem(item.img, '44px', 'Bola'));
        div.appendChild(imgC);
        var info = document.createElement('div');
        info.className = 'item-info';
        info.innerHTML = '<div class="nome">' + item.nome + '</div><div class="desc">' + item.desc + '</div>' +
          '<div class="preco">' + item.preco + ' PC</div>';
        var btn = document.createElement('button');
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
        (function(nm, pr){ btn.addEventListener('click', function(){ comprarItem(nm, pr); }); })(item.nome, item.preco);
        info.appendChild(btn);
        div.appendChild(info);
        cont.appendChild(div);
      });
  }else if(categoriaLoja === 'pedras'){
    var buscaP = (document.getElementById('filtro-pedras-input')?.value || '').toLowerCase();
    PEDRAS.filter(function(p){ return !buscaP || p.nome.toLowerCase().indexOf(buscaP) !== -1; })
      .forEach(function(p){
        var div = document.createElement('div');
        div.className = 'pedra-item';
        div.appendChild(criarImagem(IMG_PEDRA[p.nome], '44px', 'Pedra'));
        var info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = '<div class="nome">' + p.nome + '</div><div class="preco">75 PC</div>';
        var btn = document.createElement('button');
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
        btn.addEventListener('click', function(){ comprarPedra(p.nome); });
        info.appendChild(btn);
        div.appendChild(info);
        cont.appendChild(div);
      });
  }else if(categoriaLoja === 'evolucao'){
    var buscaE = (document.getElementById('filtro-evolucao-input')?.value || '').toLowerCase();
    LISTA_ITENS_EVOLUCAO.filter(function(it){ return !buscaE || it.nome.toLowerCase().indexOf(buscaE) !== -1; })
      .forEach(function(item){ cont.appendChild(criarCardLoja(item)); });
  }else if(categoriaLoja === 'pedras-mega'){
    var buscaM = (document.getElementById('filtro-pedras-mega-input')?.value || '').toLowerCase();
    var pedrasMega = {};
    Object.keys(MEGA_EVOLUCOES).forEach(function(k){
      var m = MEGA_EVOLUCOES[k];
      if(m.pedra) pedrasMega[m.pedra] = {serebii:m.stoneSerebii, pokemon:k};
      if(m.pedraAlternativa) pedrasMega[m.pedraAlternativa] = {serebii:m.stoneSerebiiAlt, pokemon:k};
    });
    Object.keys(pedrasMega).forEach(function(nomePedra){
      if(buscaM && nomePedra.toLowerCase().indexOf(buscaM) === -1) return;
      var info2 = pedrasMega[nomePedra];
      var div = document.createElement('div');
      div.className = 'pedra-item';
      div.appendChild(criarImagem(info2.serebii ? (SEREBII_ITEM + info2.serebii + '.png') : null, '44px', 'Pedra Mega'));
      var info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = '<div class="nome">' + nomePedra + '</div><div class="preco">70 PC → ' + info2.pokemon + '</div>';
      var btn = document.createElement('button');
      btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
      btn.addEventListener('click', function(){ comprarPedraMega(nomePedra); });
      info.appendChild(btn);
      div.appendChild(info);
      cont.appendChild(div);
    });
  }else if(categoriaLoja === 'pulseiras'){
    PULSEIRAS.forEach(function(item){
      var div = document.createElement('div');
      div.className = 'item-card';
      var imgC = document.createElement('div');
      imgC.className = 'item-img';
      imgC.appendChild(criarImagem(item.img, '44px', 'Pulseira'));
      div.appendChild(imgC);
      var info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = '<div class="nome">' + item.nome + '</div><div class="desc">' + item.desc + '</div><div class="preco">' + item.preco + ' PC</div>';
      var btn = document.createElement('button');
      btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
      btn.addEventListener('click', function(){ comprarPulseira(item); });
      info.appendChild(btn);
      div.appendChild(info);
      cont.appendChild(div);
    });
  }else if(categoriaLoja === 'tms'){
    renderLojaTMs(cont);
  }else if(categoriaLoja === 'descontos'){
    (jogador.descontos || []).forEach(function(d){
      var item = LOJA.find(function(i){ return i.nome === d.nome; });
      if(!item) return;
      var precoFinal = Math.round(item.preco * (1 - d.desconto / 100));
      var div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = '<div class="badge-desconto">-' + d.desconto + '%</div>';
      var imgC = document.createElement('div');
      imgC.className = 'item-img';
      imgC.appendChild(criarImagem(imagemItem(item.nome), '44px', item.nome));
      div.appendChild(imgC);
      var info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = '<div class="nome">' + item.nome + '</div><div class="desc">' + item.desc + '</div><div class="preco-final">' + precoFinal + ' PC</div>';
      var btn = document.createElement('button');
      btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
      btn.addEventListener('click', function(){ comprarItem(item.nome, precoFinal); });
      info.appendChild(btn);
      div.appendChild(info);
      cont.appendChild(div);
    });
  }
}
function renderLojaTMs(cont){
  var busca = (document.getElementById('filtro-tms-input')?.value || '').toLowerCase();
  var tipoFiltro = document.getElementById('filtro-tms-tipo')?.value || 'todos';
  var classeFiltro = document.getElementById('filtro-tms-classe')?.value || 'todas';
  var lista = TMS_LOJA.slice();
  if(busca) lista = lista.filter(function(tm){ return tm.nome.toLowerCase().indexOf(busca) !== -1; });
  if(tipoFiltro !== 'todos') lista = lista.filter(function(tm){ return tm.tipo === tipoFiltro; });
  if(classeFiltro !== 'todas') lista = lista.filter(function(tm){ return tm.classe === classeFiltro; });
  if(lista.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;text-align:center;grid-column:1/-1;padding:20px;">Nenhuma TM encontrada.</p>';
    return;
  }
  lista.forEach(function(tm){
    var tipoInfo = TIPOS_POKEMON[tm.tipo] || {cor:'#888', nome:tm.tipo};
    var cores = corTM(tm.tipo);
    var div = document.createElement('div');
    div.className = 'tm-card';
    div.style.setProperty('--tm-cor', cores.cor);
    div.style.setProperty('--tm-cor-escuro', cores.escuro);
    var imgC = document.createElement('div');
    imgC.className = 'tm-img';
    imgC.innerHTML = '<i class="fas fa-compact-disc"></i>';
    div.appendChild(imgC);
    var info = document.createElement('div');
    info.className = 'tm-info';
    var classeLbl = tm.classe === 'physical' ? 'Físico' : tm.classe === 'special' ? 'Especial' : 'Status';
    info.innerHTML = '<div class="tm-nome">' + tm.nome + '</div>' +
      '<span class="tm-tipo-badge">' + tipoInfo.nome + '</span>' +
      '<span class="tm-classe-badge">' + classeLbl + '</span>' +
      '<div class="tm-desc">Poder: ' + (tm.poder || '—') + ' · Prec: ' + (tm.precisao || '—') + '</div>' +
      '<div class="tm-preco">' + tm.preco + ' PC</div>';
    var btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
    btn.addEventListener('click', function(){ comprarTM(tm); });
    info.appendChild(btn);
    var btnCompat = document.createElement('button');
    btnCompat.className = 'btn-compativeis';
    btnCompat.innerHTML = '<i class="fas fa-users"></i> Compatíveis';
    btnCompat.addEventListener('click', function(){ mostrarTMCompativeis(tm); });
    info.appendChild(btnCompat);
    div.appendChild(info);
    cont.appendChild(div);
  });
}
function mostrarTMCompativeis(tm){
  AudioSFX.clickMenu();
  var modal = document.getElementById('modal-tm-compativeis');
  if(!modal) return;
  document.getElementById('modal-tm-compativeis-titulo').textContent = tm.nome;
  document.getElementById('modal-tm-compativeis-desc').textContent = 'Tipo: ' + tm.tipo;
  var lista = document.getElementById('modal-tm-compativeis-lista');
  lista.innerHTML = '';
  var compativeis = encontrarPokemonsCompativeisTM(tm);
  if(compativeis.length === 0){
    lista.innerHTML = '<p style="color:#ee1515;font-size:9px;text-align:center;padding:20px;">Nenhum Pokémon compatível.</p>';
  }else{
    compativeis.forEach(function(p){
      var div = document.createElement('div');
      div.className = 'pokemon-opcao';
      div.innerHTML = '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
        '<div class="info"><div class="nome">' + (p.apelido || p.nome) + (p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '') + (p.shiny ? ' ✨' : '') + '</div><div class="lvl">Lvl ' + p.lvl + ' · ' + p.tipo + '</div></div>';
      lista.appendChild(div);
    });
  }
  modal.classList.add('aberto');
}
function fecharModalTMCompativeis(){
  var modal = document.getElementById('modal-tm-compativeis');
  if(modal) modal.classList.remove('aberto');
}
function comprarTM(tm){
  if(jogador.pc < tm.preco){ AudioSFX.erro(); alert('Dinheiro insuficiente!'); return; }
  AudioSFX.moeda();
  jogador.pc -= tm.preco;
  jogador.pcGastos = (jogador.pcGastos || 0) + tm.preco;
  var chave = 'TM_' + tm.move;
  if(!jogador.itens[chave]){
    jogador.itens[chave] = {
      quantidade:0, tipo:'tm', move:tm.move, nome:tm.nome,
      poder:tm.poder, precisao:tm.precisao, classe:tm.classe, tipoMov:tm.tipo
    };
  }
  jogador.itens[chave].quantidade++;
  registrarContador('compras');
  salvar();
  atualizarTudo();
  mostrarToastNotificacao('TM comprada!', tm.nome);
}
function criarCardLoja(item){
  var div = document.createElement('div');
  div.className = 'item-card';
  var imgC = document.createElement('div');
  imgC.className = 'item-img';
  imgC.appendChild(criarImagem(imagemItem(item.nome) || item.img, '44px', item.nome));
  div.appendChild(imgC);
  var info = document.createElement('div');
  info.className = 'item-info';
  info.innerHTML = '<div class="nome">' + item.nome + ' (' + item.usos + ' ' + (item.usos === 1 ? 'uso' : 'usos') + ')</div>' +
    '<div class="desc">' + item.desc + '</div>' +
    '<div class="preco">' + item.preco + ' PC</div>';
  var btn = document.createElement('button');
  btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
  btn.addEventListener('click', function(){ comprarItem(item.nome, item.preco); });
  info.appendChild(btn);
  div.appendChild(info);
  return div;
}
function getLojaFiltrada(){
  var busca = (document.getElementById('filtro-busca')?.value || '').toLowerCase();
  var cat = document.getElementById('filtro-categoria')?.value || 'todas';
  var ordem = document.getElementById('filtro-ordem')?.value || 'preco-asc';
  var lista = LOJA.slice();
  if(busca) lista = lista.filter(function(i){ return i.nome.toLowerCase().indexOf(busca) !== -1; });
  if(cat !== 'todas') lista = lista.filter(function(i){ return i.categoria === cat; });
  if(ordem === 'preco-asc') lista.sort(function(a, b){ return a.preco - b.preco; });
  else if(ordem === 'preco-desc') lista.sort(function(a, b){ return b.preco - a.preco; });
  else if(ordem === 'nome-asc') lista.sort(function(a, b){ return a.nome.localeCompare(b.nome); });
  return lista;
}
function comprarItem(nome, preco){
  if(jogador.pc < preco){ AudioSFX.erro(); alert('Dinheiro insuficiente!'); return; }
  AudioSFX.moeda();
  jogador.pc -= preco;
  jogador.pcGastos = (jogador.pcGastos || 0) + preco;
  if(nome === 'Energia Max (25)'){
    jogador.energiaMax = (jogador.energiaMax || 0) + 25;
  }else{
    var atual = jogador.itens[nome];
    if(atual && typeof atual === 'object' && atual.usos !== undefined){
      atual.quantidade = (atual.quantidade || 1) + 1;
      atual.usos = Math.min(USOS_PEDRA_MEGA, (atual.usos || 0) + USOS_PEDRA_MEGA);
    }else{
      jogador.itens[nome] = (typeof atual === 'number' ? atual : 0) + 1;
    }
  }
  registrarContador('compras');
  salvar();
  atualizarTudo();
  mostrarToastNotificacao('Comprado!', nome);
}
function venderItem(nome, precoVenda){
  if(!jogador.itens[nome]) return;
  if(!confirm('Vender 1x ' + nome + ' por ' + precoVenda + ' PC?')) return;
  AudioSFX.moeda();
  var obj = jogador.itens[nome];
  if(typeof obj === 'object' && obj.usos !== undefined){ delete jogador.itens[nome]; }
  else{
    jogador.itens[nome]--;
    if(jogador.itens[nome] <= 0) delete jogador.itens[nome];
  }
  jogador.pc += precoVenda;
  salvar();
  renderLojaVender();
  atualizarStatus();
  renderItens();
}
function comprarPedra(nome){
  if(jogador.pc < 75){ AudioSFX.erro(); alert('Dinheiro insuficiente!'); return; }
  AudioSFX.moeda();
  jogador.pc -= 75;
  jogador.itens['PEDRA_' + nome] = (jogador.itens['PEDRA_' + nome] || 0) + 1;
  salvar();
  atualizarStatus();
  renderItens();
  alert(nome + ' comprada!');
}
function comprarPedraMega(nome){
  if(jogador.pc < 70){ AudioSFX.erro(); alert('Dinheiro insuficiente!'); return; }
  AudioSFX.moeda();
  jogador.pc -= 70;
  if(jogador.itens[nome] && typeof jogador.itens[nome] === 'object'){
    jogador.itens[nome].quantidade = (jogador.itens[nome].quantidade || 1) + 1;
    jogador.itens[nome].usos = Math.min(USOS_PEDRA_MEGA, (jogador.itens[nome].usos || 0) + USOS_PEDRA_MEGA);
  }else{
    jogador.itens[nome] = {quantidade:1, usos:USOS_PEDRA_MEGA};
  }
  salvar();
  atualizarStatus();
  renderItens();
  alert(nome + ' comprada!');
}
function comprarPulseira(item){
  if(jogador.pc < item.preco){ AudioSFX.erro(); alert('Dinheiro insuficiente!'); return; }
  AudioSFX.moeda();
  jogador.pc -= item.preco;
  if(item.tipo === 'mega') jogador.pulseiraMega = {quantidade:1, usos:20};
  else jogador.pulseiraGmax = {quantidade:1, usos:20};
  salvar();
  atualizarStatus();
  alert(item.nome + ' comprada!');
}
function renderLojaVender(){
  var cont = document.getElementById('loja-vender-lista');
  if(!cont) return;
  cont.innerHTML = '';
  var entries = Object.entries(jogador.itens || {});
  if(entries.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nada para vender.</p>';
    return;
  }
  entries.forEach(function(entry){
    var nome = entry[0], val = entry[1];
    var precoVenda = 0, imgUrl = null, nomeExibir = nome, qtdExibir = val;
    if(nome.indexOf('TM_') === 0){
      var tmInfo = (typeof val === 'object' && val.nome) ? val : null;
      if(tmInfo){ nomeExibir = tmInfo.nome; qtdExibir = tmInfo.quantidade; precoVenda = Math.floor(tmInfo.poder ? tmInfo.poder * 1.2 : 100); }
      else{ nomeExibir = nome.replace('TM_', 'TM ').replace(/-/g, ' '); precoVenda = 100; }
      var cores = corTM(tmInfo ? tmInfo.tipoMov : 'normal');
      var div2 = document.createElement('div');
      div2.className = 'item-card';
      var ic2 = document.createElement('div');
      ic2.className = 'item-img';
      ic2.innerHTML = '<i class="fas fa-compact-disc" style="font-size:28px;color:' + cores.cor + ';"></i>';
      div2.appendChild(ic2);
      var in2 = document.createElement('div');
      in2.className = 'item-info';
      in2.innerHTML = '<div class="nome">' + nomeExibir + '</div><div class="desc">Quantidade: ' + qtdExibir + '</div>' +
        '<div style="color:#ff9800;font-size:9px;">Vender por: ' + precoVenda + ' PC</div>';
      var btn2 = document.createElement('button');
      btn2.className = 'btn-vender';
      btn2.innerHTML = '<i class="fas fa-sack-dollar"></i> Vender';
      (function(n, p){ btn2.addEventListener('click', function(){ venderTM(n, p); }); })(nome, precoVenda);
      in2.appendChild(btn2);
      div2.appendChild(in2);
      cont.appendChild(div2);
      return;
    }
    if(val && typeof val === 'object' && val.usos !== undefined){
      imgUrl = imagemMegaStone(nome);
      precoVenda = 35;
      qtdExibir = '1';
    }else if(nome.indexOf('PEDRA_MEGA_') === 0){
      nomeExibir = nome.replace('PEDRA_MEGA_', '');
      imgUrl = imagemMegaStone(nomeExibir);
      precoVenda = 35;
    }else if(nome.indexOf('PEDRA_') === 0){
      nomeExibir = nome.replace('PEDRA_', '');
      imgUrl = IMG_PEDRA[nomeExibir];
      precoVenda = 37;
    }else{
      var itemLoja = LOJA.find(function(i){ return i.nome === nome; });
      var pokebola = LISTA_POKEBOLAS.find(function(pb){ return pb.nome === nome; });
      if(itemLoja){ precoVenda = Math.max(1, itemLoja.preco - 10); imgUrl = imagemItem(nome); }
      else if(pokebola){ precoVenda = Math.max(1, Math.round(pokebola.preco * 0.7)); imgUrl = pokebola.img; }
      else{ precoVenda = 1; imgUrl = imagemItem(nome); }
    }
    if(precoVenda < 1) precoVenda = 1;
    var div = document.createElement('div');
    div.className = 'item-card';
    var imgC = document.createElement('div');
    imgC.className = 'item-img';
    imgC.appendChild(criarImagem(imgUrl, '44px', nome));
    div.appendChild(imgC);
    var info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = '<div class="nome">' + nomeExibir + '</div><div class="desc">Quantidade: ' + qtdExibir + '</div>' +
      '<div style="color:#ff9800;font-size:9px;">Vender por: ' + precoVenda + ' PC</div>';
    var btn = document.createElement('button');
    btn.className = 'btn-vender';
    btn.innerHTML = '<i class="fas fa-sack-dollar"></i> Vender';
    (function(n, p){ btn.addEventListener('click', function(){ venderItem(n, p); }); })(nome, precoVenda);
    info.appendChild(btn);
    div.appendChild(info);
    cont.appendChild(div);
  });
}
function venderTM(nome, preco){
  if(!jogador.itens[nome]) return;
  if(!confirm('Vender 1x ' + nome + ' por ' + preco + ' PC?')) return;
  AudioSFX.moeda();
  var obj = jogador.itens[nome];
  if(obj && typeof obj === 'object' && obj.quantidade){
    obj.quantidade--;
    if(obj.quantidade <= 0) delete jogador.itens[nome];
  }else{ delete jogador.itens[nome]; }
  jogador.pc += preco;
  salvar();
  atualizarStatus();
  renderLojaVender();
  renderItens();
}
function atualizarDescontos(){
  var agora = Date.now();
  var ultimo = jogador.descontosTimestamp || 0;
  var CICLO = 4 * 60 * 60 * 1000;
  if(!jogador.descontos || (agora - ultimo) >= CICLO){
    var descontos = [];
    var percentuais = [25, 30, 50, 70, 90];
    var usados = {};
    var tentativas = 0;
    while(descontos.length < 10 && tentativas < 200){
      var item = LOJA[Math.floor(Math.random() * LOJA.length)];
      tentativas++;
      if(usados[item.nome]) continue;
      usados[item.nome] = true;
      var pct = percentuais[Math.floor(Math.random() * percentuais.length)];
      descontos.push({nome:item.nome, desconto:pct});
    }
    jogador.descontos = descontos;
    jogador.descontosTimestamp = agora;
    salvar();
  }
}
function getTimerDescontos(){
  if(!jogador || !jogador.descontosTimestamp) return '';
  var CICLO = 4 * 60 * 60 * 1000;
  var restante = CICLO - (Date.now() - jogador.descontosTimestamp);
  if(restante <= 0) return '';
  var h = Math.floor(restante / 3600000), m = Math.floor((restante % 3600000) / 60000);
  return '(' + h + 'h' + m + 'm)';
}

// =============== ITENS ===============
var ITENS_SEM_USO = {"Substituição":true, "Mata-Energia":true, "Cirda de Fuga":true, "Roto-Bastão":true};
var ITENS_HOLD = {
  "Choice Band":true, "Choice Specs":true, "Choice Scarf":true, "Focus Sash":true,
  "Life Orb":true, "Leftovers":true, "Black Sludge":true, "Rocky Helmet":true,
  "Eviolite":true, "Quick Claw":true, "King's Rock":true, "Scope Lens":true,
  "Wise Glasses":true, "Expert Belt":true, "Air Balloon":true, "Safety Goggles":true,
  "Assault Vest":true, "Weakness Policy":true, "Muscle Band":true,
  "Mental Herb":true, "White Herb":true, "Power Herb":true, "Red Card":true,
  "Eject Button":true, "Protective Pads":true, "Throat Spray":true
};
function renderItens(){
  var cont = document.getElementById('itens-lista');
  if(!cont) return;
  if(!jogador.itens || typeof jogador.itens !== 'object'){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhum item.</p>';
    return;
  }
  cont.innerHTML = '';
  var busca = (document.getElementById('filtro-itens-busca')?.value || '').toLowerCase();
  var entries = Object.entries(jogador.itens);
  if(entries.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhum item.</p>';
    return;
  }
  entries.forEach(function(entry){
    var nome = entry[0], val = entry[1];
    var nomeExibir = nome, imgUrl = null, tipoAcao = 'usar', qtd = 1;
    if(nome.indexOf('TM_') === 0){
      var tmInfo = (typeof val === 'object' && val.nome) ? val : null;
      var coresTM = corTM(tmInfo ? tmInfo.tipoMov : 'normal');
      var div3 = document.createElement('div');
      div3.className = 'tm-card';
      div3.style.setProperty('--tm-cor', coresTM.cor);
      div3.style.setProperty('--tm-cor-escuro', coresTM.escuro);
      var ic3 = document.createElement('div');
      ic3.className = 'tm-img';
      ic3.innerHTML = '<i class="fas fa-compact-disc"></i>';
      div3.appendChild(ic3);
      var in3 = document.createElement('div');
      in3.className = 'tm-info';
      var nomeTM = tmInfo ? tmInfo.nome : 'TM';
      var tipoTM = tmInfo ? tmInfo.tipoMov : 'normal';
      var tipoInfo3 = TIPOS_POKEMON[tipoTM] || {cor:'#888', nome:tipoTM};
      in3.innerHTML = '<div class="tm-nome">' + nomeTM + '</div>' +
        '<span class="tm-tipo-badge" style="background:' + coresTM.cor + '">' + tipoInfo3.nome + '</span>' +
        '<div class="tm-desc">Quantidade: ' + (tmInfo ? tmInfo.quantidade : 1) + '</div>';
      var btnUsar = document.createElement('button');
      btnUsar.innerHTML = '<i class="fas fa-graduation-cap"></i> Ensinar';
      (function(nm){ btnUsar.addEventListener('click', function(){ abrirModalTMUnificado(nm); }); })(nome);
      in3.appendChild(btnUsar);
      div3.appendChild(in3);
      cont.appendChild(div3);
      return;
    }
    if(val && typeof val === 'object' && val.usos !== undefined){
      imgUrl = imagemMegaStone(nome);
      tipoAcao = 'pedra-mega';
      qtd = val.quantidade || 1;
    }else if(nome.indexOf('PEDRA_MEGA_') === 0){
      nomeExibir = nome.replace('PEDRA_MEGA_', '');
      imgUrl = imagemMegaStone(nomeExibir);
      tipoAcao = 'pedra-mega';
      qtd = val;
    }else if(nome.indexOf('PEDRA_') === 0){
      nomeExibir = nome.replace('PEDRA_', '');
      imgUrl = IMG_PEDRA[nomeExibir];
      tipoAcao = 'pedra-evo';
      qtd = val;
    }else{
      qtd = val;
      imgUrl = imagemItem(nome);
      if(!imgUrl){
        var pb = LISTA_POKEBOLAS.find(function(b){ return b.nome === nome; });
        if(pb) imgUrl = pb.img;
      }
      if(nome === 'Rare Candy') tipoAcao = 'rare-candy';
      else if(ITENS_HOLD[nome]) tipoAcao = 'equipar';
      else if(nome === 'Revive' || nome === 'Máximo Reviver') tipoAcao = 'revive';
      else if(ITENS_EVOLUCAO && ITENS_EVOLUCAO[nome]) tipoAcao = 'item-evolucao';
      else if(ITENS_SEM_USO[nome]) tipoAcao = 'info';
      else if(LOJA.find(function(i){ return i.nome === nome; })) tipoAcao = 'habilitar-generico';
      else if(nome === 'Chave Rocket') tipoAcao = 'chave-rocket';
      else tipoAcao = 'usar';
    }
    if(busca && nomeExibir.toLowerCase().indexOf(busca) === -1) return;
    var div = document.createElement('div');
    div.className = 'item-card';
    var imgC = document.createElement('div');
    imgC.className = 'item-img';
    imgC.appendChild(criarImagem(imgUrl, '44px', nomeExibir));
    div.appendChild(imgC);
    var info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = '<div class="nome">' + nomeExibir + '</div><div class="desc">Quantidade: ' + qtd + '</div>';
    if(tipoAcao === 'pedra-mega'){
      var btnHab = document.createElement('button');
      btnHab.innerHTML = '<i class="fas fa-gem"></i> Habilitar';
      (function(nm){ btnHab.addEventListener('click', function(){ usarMegaStone(nm); }); })(nomeExibir);
      info.appendChild(btnHab);
    }else if(tipoAcao === 'rare-candy'){
      var btnRC = document.createElement('button');
      btnRC.style.background = 'linear-gradient(135deg, #ffcb05, #ee1515)';
      btnRC.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Habilitar';
      btnRC.addEventListener('click', usarRareCandy);
      info.appendChild(btnRC);
    }else if(tipoAcao === 'revive'){
      var btnRv = document.createElement('button');
      btnRv.innerHTML = '<i class="fas fa-heart-pulse"></i> Habilitar';
      (function(nm){ btnRv.addEventListener('click', function(){ usarRevive(nm); }); })(nome);
      info.appendChild(btnRv);
    }else if(tipoAcao === 'equipar'){
      var btnEq = document.createElement('button');
      btnEq.innerHTML = '<i class="fas fa-hand"></i> Habilitar';
      (function(nm){ btnEq.addEventListener('click', function(){ equiparItem(nm); }); })(nome);
      info.appendChild(btnEq);
    }else if(tipoAcao === 'pedra-evo'){
      var btnPe = document.createElement('button');
      btnPe.innerHTML = '<i class="fas fa-hand-point-up"></i> Usar';
      var slug = (PEDRAS.find(function(p){ return p.nome === nomeExibir; }) || {}).slug;
      (function(nm, sl){ btnPe.addEventListener('click', function(){ usarPedra(nm, sl); }); })(nome, slug);
      info.appendChild(btnPe);
    }else if(tipoAcao === 'item-evolucao'){
      var btnIE = document.createElement('button');
      btnIE.style.background = 'linear-gradient(135deg, #9c27b0, #e91e63)';
      btnIE.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Usar';
      (function(nm){ btnIE.addEventListener('click', function(){ usarItemEvolucao(nm); }); })(nome);
      info.appendChild(btnIE);
    }else if(tipoAcao === 'chave-rocket'){
      var btnCR = document.createElement('button');
      btnCR.style.background = 'linear-gradient(135deg, #c41e1e, #8a0000)';
      btnCR.innerHTML = '<i class="fas fa-key"></i> Usar Chave';
      btnCR.addEventListener('click', usarChaveRocket);
      info.appendChild(btnCR);
    }else if(tipoAcao === 'habilitar-generico'){
      var btnH = document.createElement('button');
      btnH.innerHTML = '<i class="fas fa-medkit"></i> Habilitar';
      (function(nm){ btnH.addEventListener('click', function(){ usarItemGenerico(nm); }); })(nome);
      info.appendChild(btnH);
    }else if(tipoAcao === 'usar'){
      var btnU = document.createElement('button');
      btnU.innerHTML = '<i class="fas fa-hand-point-up"></i> Usar';
      (function(nm){ btnU.addEventListener('click', function(){ usarItem(nm); }); })(nome);
      info.appendChild(btnU);
    }else{
      var btnI = document.createElement('button');
      btnI.style.background = '#666';
      btnI.innerHTML = '<i class="fas fa-info-circle"></i> Info';
      (function(nm){ btnI.addEventListener('click', function(){ alert(nm + '\n\nUsado em batalhas físicas.'); }); })(nome);
      info.appendChild(btnI);
    }
    div.appendChild(info);
    cont.appendChild(div);
  });
}

// =============== CHAVE ROCKET ===============
function usarChaveRocket(){
  if(!jogador.itens['Chave Rocket'] || jogador.itens['Chave Rocket'] <= 0){
    AudioSFX.erro();
    alert('Sem Chave Rocket!');
    return;
  }
  var regiaoEscolhida = prompt('Base secreta Rocket!\n\nEscolha a região:\n' + NOMES_REGIOES.join(', '), 'Kanto');
  if(!regiaoEscolhida) return;
  if(NOMES_REGIOES.indexOf(regiaoEscolhida) === -1){
    AudioSFX.erro();
    alert('Região inválida!');
    return;
  }
  if(!confirm('Usar 1 Chave Rocket para invadir a base secreta de ' + regiaoEscolhida + '?\n\nDentro: Chefe Rocket + recompensas lendárias!')) return;
  jogador.itens['Chave Rocket']--;
  if(jogador.itens['Chave Rocket'] <= 0) delete jogador.itens['Chave Rocket'];
  jogador.chaveRocketUsada = true;
  salvar();
  AudioSFX.rocketAlerta();
  alert('🚨 Invadindo base da Equipe Rocket em ' + regiaoEscolhida + '...\n\nA batalha contra o Chefe começará!');
  setTimeout(function(){
    // Batalha contra Giovanni (Chefe Rocket)
    iniciarBatalhaBaseRocket(regiaoEscolhida);
  }, 800);
}
async function iniciarBatalhaBaseRocket(regiao){
  var timeAtivo = jogador.time.filter(Boolean);
  if(timeAtivo.length === 0){ AudioSFX.erro(); alert('Sem Pokémon!'); return; }
  mostrarLoading(true);
  // Time do Giovanni: poderoso
  var timeInimigo = [];
  var tiposGiovanni = ['ground','dark','poison'];
  for(var i = 0; i < 5; i++){
    var tipo = tiposGiovanni[i % tiposGiovanni.length];
    var ids = POKEMON_POR_TIPO_GINASIO[tipo] || [];
    var idEscolhido = ids[Math.floor(Math.random() * ids.length)];
    try{
      var p = await buscarPokemonPorId(idEscolhido);
      if(p && p.id){
        p.lvl = 70 + Math.floor(Math.random() * 5);
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
  if(timeInimigo.length === 0){ AudioSFX.erro(); alert('Erro.'); return; }
  var treinador = {
    nome: 'Giovanni',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
    regiao: regiao,
    time: timeInimigo.map(function(p){ return {tipoDesejado:p.tipo, lvl:p.lvl, pokemonObj:p}; }),
    recompensa: { pc: 500, pass: 10 },
    isRocket: true,
    membro: ROCKET_MEMBROS[3]
  };
  var rota = {
    id:'base-rocket-' + Date.now(), nome:'Base Rocket — ' + regiao,
    bg:'gymPurple', minLvl:70, maxLvl:75, tipos:tiposGiovanni
  };
  abrirModalEscolherPokemonBatalha(timeAtivo, function(idx){
    iniciarBatalhaDigital('treinador', treinador, null, rota, idx, regiao);
    setTimeout(function(){
      if(_batalha){
        _batalha.isRocket = true;
        _batalha.membroRocket = ROCKET_MEMBROS[3];
        _batalha.isBaseRocket = true;
      }
    }, 100);
  });
}

// =============== MODAL TM UNIFICADO ===============
function abrirModalTMUnificado(chaveTM){
  var tm = (jogador.itens[chaveTM] && typeof jogador.itens[chaveTM] === 'object') ? jogador.itens[chaveTM] : null;
  if(!tm || !tm.quantidade || tm.quantidade <= 0){ AudioSFX.erro(); alert('Sem essa TM!'); return; }
  AudioSFX.clickMenu();
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var elegiveis = todos.filter(function(p){ return podeAprenderTM(p, tm); });
  if(elegiveis.length === 0){ AudioSFX.erro(); alert('Nenhum Pokémon compatível!'); return; }
  _tmEstadoAtual = {chaveTM:chaveTM, tm:tm, elegiveis:elegiveis, step:1, pokemonEscolhido:null, moveEsquecerIdx:null, moveNovo:null};
  var titulo = document.getElementById('modal-tm-titulo');
  if(titulo) titulo.innerHTML = '<i class="fas fa-compact-disc"></i> ' + tm.nome;
  atualizarModalTMSteps();
  var modal = document.getElementById('modal-tm-unificado');
  if(modal) modal.classList.add('aberto');
}
function fecharModalTMUnificado(){
  AudioSFX.clickMenu();
  _tmEstadoAtual = null;
  var modal = document.getElementById('modal-tm-unificado');
  if(modal) modal.classList.remove('aberto');
}
function atualizarModalTMSteps(){
  var est = _tmEstadoAtual;
  if(!est) return;
  var ind1 = document.getElementById('tm-step-ind-1');
  var ind2 = document.getElementById('tm-step-ind-2');
  var ind3 = document.getElementById('tm-step-ind-3');
  var btnVoltar = document.getElementById('modal-tm-btn-voltar');
  [ind1, ind2, ind3].forEach(function(el, i){
    if(!el) return;
    el.classList.remove('ativo', 'completo');
    var step = i + 1;
    if(step < est.step) el.classList.add('completo');
    else if(step === est.step) el.classList.add('ativo');
  });
  if(btnVoltar) btnVoltar.style.display = est.step > 1 ? 'inline-flex' : 'none';
  var cont = document.getElementById('modal-tm-conteudo');
  if(!cont) return;
  if(est.step === 1) renderStepEscolherPokemon(cont, est);
  else if(est.step === 2) renderStepEscolherMove(cont, est);
  else if(est.step === 3) renderStepConfirmar(cont, est);
}
function renderStepEscolherPokemon(cont, est){
  var html = '<p style="color:var(--texto-secundario);font-size:9px;margin-bottom:15px;">Escolha qual Pokémon vai aprender <b style="color:var(--acento-amarelo);">' + est.tm.nome + '</b>:</p>';
  html += '<div class="tm-modal-pokemon-grid">';
  est.elegiveis.forEach(function(p, idx){
    var local = jogador.time.indexOf(p) !== -1 ? 'Time' : 'Banco';
    var sexo = p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '';
    html += '<div class="tm-modal-pokemon-opcao" data-idx="' + idx + '">' +
      '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="info"><div class="nome">' + (p.apelido || p.nome) + sexo + (p.shiny ? ' ✨' : '') + '</div>' +
      '<div class="lvl">Lvl ' + p.lvl + ' · ' + local + ' · ' + p.tipo + '</div></div></div>';
  });
  html += '</div>';
  cont.innerHTML = html;
  cont.querySelectorAll('.tm-modal-pokemon-opcao').forEach(function(el){
    el.addEventListener('click', function(){
      var idx = parseInt(el.dataset.idx);
      selecionarPokemonTM(est.elegiveis[idx]);
    });
  });
}
function selecionarPokemonTM(pokemon){
  var est = _tmEstadoAtual;
  if(!est || !pokemon) return;
  AudioSFX.clickMenu();
  est.pokemonEscolhido = pokemon;
  var novoMove = {
    nome:est.tm.nome.replace('TM ', ''), move:est.tm.move,
    tipo:est.tm.tipoMov || est.tm.tipo, poder:est.tm.poder,
    precisao:est.tm.precisao, classe:est.tm.classe, pp:15, ppAtual:15
  };
  if(!novoMove.tipo || !TIPOS_POKEMON[novoMove.tipo]) novoMove.tipo = pokemon.tipo || 'normal';
  est.moveNovo = novoMove;
  var jaTemMove = (pokemon.moves || []).some(function(m){ return m.move === novoMove.move || m.nome === novoMove.nome; });
  if(jaTemMove){ alert(pokemon.nome + ' já conhece esse move!'); est.pokemonEscolhido = null; return; }
  if(!pokemon.moves || pokemon.moves.length < 4){ est.step = 3; est.moveEsquecerIdx = null; }
  else est.step = 2;
  atualizarModalTMSteps();
}
function renderStepEscolherMove(cont, est){
  var pokemon = est.pokemonEscolhido;
  var novoMove = est.moveNovo;
  var html = '<p style="color:var(--texto-secundario);font-size:9px;margin-bottom:15px;">' + pokemon.nome + ' quer aprender <b style="color:var(--acento-amarelo);">' + novoMove.nome + '</b>. Escolha qual esquecer:</p>';
  html += '<div class="tm-modal-moves-lista">';
  pokemon.moves.forEach(function(mv, idx){
    var ti = TIPOS_POKEMON[mv.tipo] || {cor:'#888'};
    html += '<div class="tm-modal-move-opcao" data-idx="' + idx + '">' +
      '<div class="mo-info"><div class="mo-nome">' + mv.nome + '</div>' +
      '<div class="mo-stats">Poder: ' + (mv.poder || '—') + ' · PP: ' + (mv.ppAtual || mv.pp) + '/' + mv.pp + '</div></div>' +
      '<span class="mo-tipo" style="background:' + ti.cor + '">' + (mv.tipo || 'normal') + '</span></div>';
  });
  html += '</div>';
  cont.innerHTML = html;
  cont.querySelectorAll('.tm-modal-move-opcao').forEach(function(el){
    el.addEventListener('click', function(){
      est.moveEsquecerIdx = parseInt(el.dataset.idx);
      est.step = 3;
      atualizarModalTMSteps();
    });
  });
}
function renderStepConfirmar(cont, est){
  var pokemon = est.pokemonEscolhido;
  var novoMove = est.moveNovo;
  var html = '<div class="tm-modal-confirmar">';
  html += '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:15px;">' + pokemon.nome + ' vai aprender:</div>';
  html += '<div class="nome-move">' + novoMove.nome + '</div>';
  var ti = TIPOS_POKEMON[novoMove.tipo] || {cor:'#888'};
  html += '<div style="margin-bottom:15px;">' +
    '<span style="display:inline-block;padding:4px 12px;border-radius:8px;background:' + ti.cor + ';color:#fff;font-size:9px;text-transform:uppercase;font-weight:bold;">' + novoMove.tipo + '</span>' +
  '</div>';
  if(est.moveEsquecerIdx !== null && est.moveEsquecerIdx !== undefined){
    html += '<div style="font-size:9px;color:var(--texto-terciario);margin-bottom:15px;">Vai esquecer: <b style="color:#ee1515;">' + pokemon.moves[est.moveEsquecerIdx].nome + '</b></div>';
  }
  html += '<button onclick="confirmarEnsinarTM()"><i class="fas fa-check"></i> Confirmar</button>';
  html += '<button class="btn-cancelar" onclick="fecharModalTMUnificado()"><i class="fas fa-times"></i> Cancelar</button>';
  html += '</div>';
  cont.innerHTML = html;
}
function voltarStepTM(){
  var est = _tmEstadoAtual;
  if(!est || est.step <= 1) return;
  AudioSFX.clickMenu();
  if(est.step === 3){
    if(est.moveEsquecerIdx !== null && est.moveEsquecerIdx !== undefined) est.step = 2;
    else{ est.step = 1; est.pokemonEscolhido = null; est.moveNovo = null; }
  }else if(est.step === 2){
    est.step = 1; est.pokemonEscolhido = null; est.moveNovo = null; est.moveEsquecerIdx = null;
  }
  atualizarModalTMSteps();
}
function confirmarEnsinarTM(){
  var est = _tmEstadoAtual;
  if(!est || !est.pokemonEscolhido || !est.moveNovo) return;
  var pokemon = est.pokemonEscolhido;
  var chaveTM = est.chaveTM;
  var novoMove = est.moveNovo;
  if(!pokemon.moves) pokemon.moves = [];
  if(est.moveEsquecerIdx !== null && est.moveEsquecerIdx !== undefined){
    var antigo = pokemon.moves[est.moveEsquecerIdx];
    pokemon.moves[est.moveEsquecerIdx] = novoMove;
    alert(pokemon.nome + ' esqueceu ' + antigo.nome + ' e aprendeu ' + novoMove.nome + '!');
  }else{
    pokemon.moves.push(novoMove);
    alert(pokemon.nome + ' aprendeu ' + novoMove.nome + '!');
  }
  var obj = jogador.itens[chaveTM];
  if(obj && typeof obj === 'object' && obj.quantidade){
    obj.quantidade--;
    if(obj.quantidade <= 0) delete jogador.itens[chaveTM];
  }
  AudioSFX.conquista();
  salvar();
  fecharModalTMUnificado();
  renderItens();
  renderTime();
  renderBanco();
}

// =============== ITENS GENÉRICOS ===============
function usarItemGenerico(nomeItem){
  if(!jogador.itens[nomeItem] || jogador.itens[nomeItem] <= 0){ AudioSFX.erro(); return; }
  AudioSFX.clickMenu();
  abrirModalEscolherPokemon('Item: ' + nomeItem, 'Escolha um Pokémon.', function(nomePokemon){
    var todos = jogador.time.filter(Boolean).concat(jogador.banco);
    var p = todos.find(function(x){ return x.nome === nomePokemon; });
    if(!p) return;
    adicionarAmizade(p, 100);
    jogador.itens[nomeItem]--;
    if(jogador.itens[nomeItem] <= 0) delete jogador.itens[nomeItem];
    AudioSFX.cura();
    salvar();
    atualizarTudo();
    alert(p.nome + ' recebeu ' + nomeItem + '!');
  });
}
function usarItem(nome){
  if(!jogador.itens[nome]) return;
  AudioSFX.cura();
  jogador.itens[nome]--;
  if(jogador.itens[nome] <= 0) delete jogador.itens[nome];
  salvar();
  renderItens();
}
function abrirModalEscolherPokemon(titulo, subtitulo, callback, filtroFn){
  var antigo = document.getElementById('modal-escolher-pokemon-generico');
  if(antigo) antigo.remove();
  var modal = document.createElement('div');
  modal.className = 'modal-fundo aberto';
  modal.id = 'modal-escolher-pokemon-generico';
  var listaHtml = '';
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var elegiveis = filtroFn ? todos.filter(filtroFn) : todos;
  if(elegiveis.length === 0){
    listaHtml = '<p style="color:#888;font-size:9px;text-align:center;padding:20px;">Nenhum Pokémon elegível.</p>';
  }else{
    elegiveis.forEach(function(p){
      var idxTime = jogador.time.indexOf(p);
      var local = idxTime !== -1 ? 'Time' : 'Banco';
      var sexo = p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '';
      listaHtml += '<div class="pokemon-opcao" data-nome="' + p.nome + '">' +
        '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
        '<div class="info"><div class="nome">' + (p.apelido || p.nome) + sexo + (p.shiny ? ' ✨' : '') + '</div>' +
        '<div class="lvl">Lvl ' + p.lvl + ' · ' + local + '</div></div></div>';
    });
  }
  modal.innerHTML = '<div class="modal"><h3>' + titulo + '</h3>' +
    '<p style="color:var(--texto-secundario);font-size:9px;margin-bottom:15px;">' + subtitulo + '</p>' +
    '<div style="max-height:400px;overflow-y:auto;">' + listaHtml + '</div>' +
    '<button class="btn-fechar" onclick="fecharModalEscolherPokemon()">Cancelar</button></div>';
  document.body.appendChild(modal);
  window._cbEscolherPoke = callback;
  modal.querySelectorAll('.pokemon-opcao').forEach(function(el){
    el.onclick = function(){
      var n = el.dataset.nome;
      var cb = window._cbEscolherPoke;
      fecharModalEscolherPokemon();
      if(cb) cb(n);
    };
  });
}
function fecharModalEscolherPokemon(){
  var m = document.getElementById('modal-escolher-pokemon-generico');
  if(m) m.remove();
}
function usarRareCandy(){
  if(!jogador.itens['Rare Candy'] || jogador.itens['Rare Candy'] <= 0){ AudioSFX.erro(); alert('Sem Rare Candy!'); return; }
  AudioSFX.clickMenu();
  abrirModalEscolherPokemon('Rare Candy', 'Escolha um Pokémon para evoluir.', executarRareCandy);
}
async function executarRareCandy(nomePokemon){
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var p = todos.find(function(x){ return x.nome === nomePokemon; });
  if(!p){ AudioSFX.erro(); alert('Pokémon não encontrado!'); return; }
  if(EVOLUCOES_AMIZADE && EVOLUCOES_AMIZADE[p.nome]){
    var evo = EVOLUCOES_AMIZADE[p.nome];
    await finalizarRareCandy(p, evo.proximo);
    return;
  }
  mostrarLoading(true);
  try{
    var mapa = await buscarCadeiaEvolucao(p.nome);
    var slug = p.nome.toLowerCase().replace(/\s+/g, '-');
    var proxima = mapa[slug];
    mostrarLoading(false);
    if(proxima && proxima.proximo){ await finalizarRareCandy(p, proxima.proximo); return; }
    for(var pedraSlug in PEDRAS_EVOLUCAO){
      var alvo = PEDRAS_EVOLUCAO[pedraSlug][p.nome];
      if(alvo){ await finalizarRareCandy(p, alvo); return; }
    }
    AudioSFX.erro();
    alert(p.nome + ' não tem evolução!');
  }catch(e){ mostrarLoading(false); AudioSFX.erro(); }
}
async function finalizarRareCandy(pokemon, nomeEvolucao){
  try{
    mostrarLoading(true);
    var novo = await buscarPokemon(nomeEvolucao);
    mostrarLoading(false);
    await mostrarAnimacaoEvolucao(pokemon, novo);
    pokemon.id = novo.id;
    pokemon.nome = novo.nome;
    pokemon.tipo = novo.tipo;
    pokemon.baseStats = novo.baseStats || await carregarBaseStats(novo.id);
    pokemon.amizade = 0; pokemon.batalhasSemUso = 0;
    pokemon.forma = ''; pokemon.idForma = null;
    jogador.itens['Rare Candy']--;
    if(jogador.itens['Rare Candy'] <= 0) delete jogador.itens['Rare Candy'];
    jogador.totalEvolucoes = (jogador.totalEvolucoes || 0) + 1;
    if(typeof marcarPokedex === 'function') marcarPokedex(pokemon.id, true, pokemon.shiny);
    darXP(XP_ACOES.evolucao, 'Evolução');
    registrarContador('evolucoes');
    salvar();
    atualizarTudo();
  }catch(e){ mostrarLoading(false); AudioSFX.erro(); }
}
function usarRevive(nomeItem){
  if(!jogador.itens[nomeItem] || jogador.itens[nomeItem] <= 0){ AudioSFX.erro(); return; }
  AudioSFX.clickMenu();
  abrirModalEscolherPokemon(nomeItem, 'Escolha um Pokémon.', function(nomePokemon){
    var todos = jogador.time.filter(Boolean).concat(jogador.banco);
    var p = todos.find(function(x){ return x.nome === nomePokemon; });
    if(!p) return;
    p.bp = Math.max(0, (p.bp || 0) - 1);
    p.hpAtual = null;
    p.status = null;
    jogador.itens[nomeItem]--;
    if(jogador.itens[nomeItem] <= 0) delete jogador.itens[nomeItem];
    AudioSFX.cura();
    salvar();
    atualizarTudo();
    alert(p.nome + ' foi revivido!');
  });
}
function usarPedra(nomeComPrefixo, slug){
  var nomePedra = nomeComPrefixo.replace('PEDRA_', '');
  var evolucoes = PEDRAS_EVOLUCAO[slug];
  if(!evolucoes){ AudioSFX.erro(); alert('Essa pedra não tem evoluções.'); return; }
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var elegiveisComEscolha = todos.filter(function(p){
    return EVOLUCOES_COM_ESCOLHA[p.nome] && EVOLUCOES_COM_ESCOLHA[p.nome][slug];
  });
  var elegiveisNormais = todos.filter(function(p){ return evolucoes[p.nome]; });
  if(elegiveisComEscolha.length === 0 && elegiveisNormais.length === 0){
    AudioSFX.erro(); alert('Nenhum Pokémon pode evoluir com ' + nomePedra);
    return;
  }
  AudioSFX.clickMenu();
  document.getElementById('modal-pedra-titulo').textContent = nomePedra + ' → escolha';
  var lista = document.getElementById('modal-pedra-lista');
  lista.innerHTML = '';
  elegiveisComEscolha.forEach(function(p){
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    div.appendChild(criarImagem(spritePokemonAtual(p), '48px'));
    var info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = '<div class="nome">' + p.nome + '</div><div class="lvl">Múltiplas evoluções</div>';
    div.appendChild(info);
    div.addEventListener('click', function(){ fecharModalPedra(); abrirEscolhaEvolucao(p, slug, nomeComPrefixo); });
    lista.appendChild(div);
  });
  elegiveisNormais.forEach(function(p){
    if(elegiveisComEscolha.indexOf(p) !== -1) return;
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    div.appendChild(criarImagem(spritePokemonAtual(p), '48px'));
    var info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = '<div class="nome">' + p.nome + ' → ' + evolucoes[p.nome] + '</div><div class="lvl">Lvl ' + p.lvl + '</div>';
    div.appendChild(info);
    div.addEventListener('click', function(){ evoluirComPedra(p, evolucoes[p.nome], nomeComPrefixo); });
    lista.appendChild(div);
  });
  document.getElementById('modal-pedra').classList.add('aberto');
}
function abrirEscolhaEvolucao(pokemon, slug, nomePedraComPrefixo){
  var opcoes = EVOLUCOES_COM_ESCOLHA[pokemon.nome][slug];
  document.getElementById('modal-evolucao-titulo').textContent = pokemon.nome + ' → escolha';
  var cont = document.getElementById('modal-evolucao-conteudo');
  cont.innerHTML = '';
  opcoes.forEach(function(op){
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    div.appendChild(criarImagem(spritePokemon(op.id), '48px'));
    var info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = '<div class="nome">' + op.label + '</div>';
    div.appendChild(info);
    div.addEventListener('click', function(){
      fecharModalEvolucaoEscolha();
      evoluirComPedra(pokemon, op.nome, nomePedraComPrefixo, op.id, op.slugApi);
    });
    cont.appendChild(div);
  });
  document.getElementById('modal-evolucao-escolha').classList.add('aberto');
}
function fecharModalEvolucaoEscolha(){
  AudioSFX.clickMenu();
  document.getElementById('modal-evolucao-escolha').classList.remove('aberto');
}
async function evoluirComPedra(pokemon, nomeEvolucao, nomePedraComPrefixo, idForcado, slugApi){
  fecharModalPedra();
  try{
    mostrarLoading(true);
    var novo;
    if(slugApi){ novo = await buscarPokemon(slugApi); novo.nome = nomeEvolucao; if(idForcado) novo.id = idForcado; }
    else{ novo = await buscarPokemon(nomeEvolucao); }
    mostrarLoading(false);
    await mostrarAnimacaoEvolucao(pokemon, novo);
    pokemon.id = novo.id;
    pokemon.nome = novo.nome;
    pokemon.tipo = novo.tipo;
    pokemon.baseStats = novo.baseStats || await carregarBaseStats(novo.id);
    pokemon.amizade = 0; pokemon.batalhasSemUso = 0;
    pokemon.forma = ''; pokemon.idForma = null;
    jogador.itens[nomePedraComPrefixo]--;
    if(jogador.itens[nomePedraComPrefixo] <= 0) delete jogador.itens[nomePedraComPrefixo];
    jogador.totalEvolucoes = (jogador.totalEvolucoes || 0) + 1;
    if(typeof marcarPokedex === 'function') marcarPokedex(pokemon.id, true, pokemon.shiny);
    darXP(XP_ACOES.evolucao, 'Evolução');
    registrarContador('evolucoes');
    salvar();
    atualizarTudo();
  }catch(e){ mostrarLoading(false); AudioSFX.erro(); alert('Erro ao evoluir.'); }
}
function fecharModalPedra(){
  AudioSFX.clickMenu();
  document.getElementById('modal-pedra').classList.remove('aberto');
}
function usarItemEvolucao(nomeItem){
  if(!jogador.itens[nomeItem] || jogador.itens[nomeItem] <= 0){ AudioSFX.erro(); return; }
  var info = ITENS_EVOLUCAO[nomeItem];
  if(!info){ AudioSFX.erro(); return; }
  AudioSFX.clickMenu();
  abrirModalEscolherPokemon(nomeItem, 'Escolha um Pokémon para evoluir para ' + info.para, function(nomePokemon){
    var todos = jogador.time.filter(Boolean).concat(jogador.banco);
    var p = todos.find(function(x){ return x.nome === nomePokemon; });
    if(!p) return;
    var evolui = false, alvo = info.para;
    if(p.nome === info.de) evolui = true;
    if(info.alternativo && p.nome === info.alternativo){ evolui = true; alvo = info.alternativoPara; }
    if(!evolui){ AudioSFX.erro(); alert(p.nome + ' não pode usar esse item!'); return; }
    if(!confirm('Evoluir ' + p.nome + ' para ' + alvo + '?')) return;
    executarEvolucaoPorItem(p, alvo, nomeItem);
  }, function(p){
    return p.nome === info.de || (info.alternativo && p.nome === info.alternativo);
  });
}
async function executarEvolucaoPorItem(pokemon, alvo, nomeItem){
  try{
    mostrarLoading(true);
    var novo = await buscarPokemon(alvo);
    mostrarLoading(false);
    await mostrarAnimacaoEvolucao(pokemon, novo);
    pokemon.id = novo.id;
    pokemon.nome = novo.nome;
    pokemon.tipo = novo.tipo;
    pokemon.baseStats = novo.baseStats || await carregarBaseStats(novo.id);
    pokemon.amizade = 0; pokemon.batalhasSemUso = 0;
    pokemon.forma = ''; pokemon.idForma = null;
    jogador.itens[nomeItem]--;
    if(jogador.itens[nomeItem] <= 0) delete jogador.itens[nomeItem];
    jogador.totalEvolucoes = (jogador.totalEvolucoes || 0) + 1;
    if(typeof marcarPokedex === 'function') marcarPokedex(pokemon.id, true, pokemon.shiny);
    darXP(XP_ACOES.evolucao, 'Evolução por Item');
    registrarContador('evolucoes');
    salvar();
    atualizarTudo();
  }catch(e){ mostrarLoading(false); AudioSFX.erro(); }
}

// =============== MEGA / GMAX ===============
function temMegaStoneNoInventario(nomePedra){
  return !!(jogador.itens[nomePedra] && typeof jogador.itens[nomePedra] === 'object' && jogador.itens[nomePedra].usos > 0);
}
function getMegaStoneObj(nomePedra){
  return (jogador.itens[nomePedra] && typeof jogador.itens[nomePedra] === 'object') ? jogador.itens[nomePedra] : null;
}
function temPedraMegaPara(p){
  if(!p) return false;
  var megaInfo = MEGA_EVOLUCOES[p.nome];
  if(!megaInfo) return false;
  var pedra = megaInfo.pedra, pedraAlt = megaInfo.pedraAlternativa;
  if(jogador.itens[pedra] && typeof jogador.itens[pedra] === 'object' && jogador.itens[pedra].usos > 0) return true;
  if(pedraAlt && jogador.itens[pedraAlt] && typeof jogador.itens[pedraAlt] === 'object' && jogador.itens[pedraAlt].usos > 0) return true;
  return false;
}
function podeMegaEvoluir(p){
  if(!p || p.mega || p.gigantamax) return false;
  if(!MEGA_EVOLUCOES[p.nome]) return false;
  if(!jogador.pulseiraMega || jogador.pulseiraMega.usos <= 0) return false;
  return temPedraMegaPara(p);
}
function podeGigantamax(p){
  if(!p || p.mega || p.gigantamax) return false;
  if(p.lvl < 50) return false;
  if(!jogador.pulseiraGmax || jogador.pulseiraGmax.usos <= 0) return false;
  if((jogador.energiaMax || 0) < 100) return false;
  return true;
}
function usarMegaStone(nomePedra){
  if(!temMegaStoneNoInventario(nomePedra)){ AudioSFX.erro(); alert('Você não tem essa pedra!'); return; }
  if(!jogador.pulseiraMega || jogador.pulseiraMega.usos <= 0){ AudioSFX.erro(); alert('Precisa da Pulseira Mega!'); return; }
  var found = encontrarPokemonPorMegaStone(nomePedra);
  if(!found){ AudioSFX.erro(); alert('Nenhum Pokémon compatível.'); return; }
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var candidatos = todos.filter(function(p){
    return p.nome === found.pokemon && !p.mega && !p.gigantamax && !p.permanenteMega && !p.permanente;
  });
  if(candidatos.length === 0){ AudioSFX.erro(); alert('Nenhum ' + found.pokemon + ' elegível.'); return; }
  abrirModalEscolhaPokemonParaMega(nomePedra, found, candidatos);
}
function abrirModalEscolhaPokemonParaMega(nomePedra, found, candidatos){
  var antigo = document.getElementById('modal-mega-escolha');
  if(antigo) antigo.remove();
  var modal = document.createElement('div');
  modal.className = 'modal-fundo aberto';
  modal.id = 'modal-mega-escolha';
  var pedraObj = getMegaStoneObj(nomePedra);
  var usosRestantes = pedraObj ? pedraObj.usos : '?';
  var listaHtml = '';
  candidatos.forEach(function(p, idx){
    var idxTime = jogador.time.indexOf(p);
    var local = idxTime !== -1 ? 'Time' : 'Banco';
    var sexo = p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '';
    listaHtml += '<div class="pokemon-opcao" data-idx="' + idx + '">' +
      '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="info"><div class="nome">' + (p.apelido || p.nome) + sexo + (p.shiny ? ' ✨' : '') + ' (Lvl ' + p.lvl + ')</div>' +
      '<div class="lvl">' + local + '</div></div></div>';
  });
  modal.innerHTML = '<div class="modal"><h3><i class="fas fa-gem"></i> ' + nomePedra + '</h3>' +
    '<p style="color:var(--acento-amarelo);font-size:9px;margin-bottom:15px;">Restam <b>' + usosRestantes + '</b> usos</p>' +
    '<div style="max-height:400px;overflow-y:auto;">' + listaHtml + '</div>' +
    '<button class="btn-fechar" onclick="fecharModalMegaEscolha()">Cancelar</button></div>';
  document.body.appendChild(modal);
  modal.querySelectorAll('.pokemon-opcao').forEach(function(el){
    el.addEventListener('click', function(){
      var idx = parseInt(el.dataset.idx);
      var p = candidatos[idx];
      fecharModalMegaEscolha();
      executarMegaEvolucao(p, nomePedra, found);
    });
  });
}
function fecharModalMegaEscolha(){
  var m = document.getElementById('modal-mega-escolha');
  if(m) m.remove();
}
function executarMegaEvolucao(pokemon, nomePedra, found){
  if(!pokemon) return;
  if(pokemon.mega || pokemon.gigantamax){ AudioSFX.erro(); alert('Já transformado.'); return; }
  if(!temMegaStoneNoInventario(nomePedra)){ AudioSFX.erro(); alert('Sem pedra!'); return; }
  if(!jogador.pulseiraMega || jogador.pulseiraMega.usos <= 0){ AudioSFX.erro(); alert('Pulseira sem usos!'); return; }
  if(!confirm('Mega Evoluir ' + pokemon.nome + '?')) return;
  var obj = jogador.itens[nomePedra];
  if(typeof obj === 'object' && obj){
    obj.usos -= 1;
    if(obj.usos <= 0){ delete jogador.itens[nomePedra]; alert('A ' + nomePedra + ' quebrou!'); }
  }
  AudioSFX.mega();
  pokemon.mega = true;
  pokemon.megaForma = found.eAlt ? 'Y' : 'X';
  pokemon.nomeMega = pokemon.nome + ' Mega' + (found.info.duasFormas ? ' ' + pokemon.megaForma : '');
  if(!pokemon.boostPermanente) pokemon.boostPermanente = {atk:1, def:1, spa:1, spd:1, spe:1};
  var boost = found.info.boost || {};
  if(boost.atk) pokemon.boostPermanente.atk = (pokemon.boostPermanente.atk || 1) * boost.atk;
  if(boost.def) pokemon.boostPermanente.def = (pokemon.boostPermanente.def || 1) * boost.def;
  if(boost.spa) pokemon.boostPermanente.spa = (pokemon.boostPermanente.spa || 1) * boost.spa;
  if(boost.spd) pokemon.boostPermanente.spd = (pokemon.boostPermanente.spd || 1) * boost.spd;
  if(boost.spe) pokemon.boostPermanente.spe = (pokemon.boostPermanente.spe || 1) * boost.spe;
  jogador.pulseiraMega.usos -= 1;
  jogador.totalMega = (jogador.totalMega || 0) + 1;
  if(jogador.pulseiraMega.usos <= 0){ jogador.pulseiraMega.quantidade = 0; alert('Pulseira Mega quebrou!'); }
  darXP(XP_ACOES.mega_evolucao, 'Mega Evolução');
  registrarContador('mega');
  salvar();
  atualizarTudo();
}

// =============== EQUIPAR ===============
function equiparItem(nomeItem){
  if(!jogador.itens[nomeItem] || jogador.itens[nomeItem] <= 0){ AudioSFX.erro(); return; }
  var timeAtivo = jogador.time.filter(Boolean);
  if(timeAtivo.length === 0){ AudioSFX.erro(); alert('Sem Pokémons!'); return; }
  document.getElementById('modal-equipar-item-nome').textContent = nomeItem;
  var lista = document.getElementById('modal-equipar-lista');
  lista.innerHTML = '';
  jogador.time.forEach(function(p, idx){
    if(!p) return;
    var div = document.createElement('div');
    div.className = 'pokemon-opcao';
    div.appendChild(criarImagem(spritePokemonAtual(p), '48px'));
    var info = document.createElement('div');
    info.className = 'info';
    var extra = p.itemEquipado ? '<div class="lvl" style="color:#ff9800;">Já tem: ' + p.itemEquipado + '</div>' : '';
    var sexo = p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '';
    info.innerHTML = '<div class="nome">' + (p.apelido || p.nome) + sexo + (p.shiny ? ' ✨' : '') + '</div><div class="lvl">Lvl ' + p.lvl + '</div>' + extra;
    div.appendChild(info);
    div.onclick = function(){ confirmarEquipar(idx, nomeItem); };
    lista.appendChild(div);
  });
  document.getElementById('modal-equipar').classList.add('aberto');
}
function fecharModalEquipar(){
  AudioSFX.clickMenu();
  document.getElementById('modal-equipar').classList.remove('aberto');
}
function confirmarEquipar(idxTime, nomeItem){
  var p = jogador.time[idxTime];
  if(!p) return;
  if(p.itemEquipado){ AudioSFX.erro(); alert(p.nome + ' já tem item.'); return; }
  if(!jogador.itens[nomeItem] || jogador.itens[nomeItem] <= 0){ AudioSFX.erro(); return; }
  AudioSFX.clickMenu();
  jogador.itens[nomeItem]--;
  if(jogador.itens[nomeItem] <= 0) delete jogador.itens[nomeItem];
  p.itemEquipado = nomeItem;
  salvar();
  fecharModalEquipar();
  renderTime();
  renderItens();
  alert(nomeItem + ' equipado em ' + p.nome + '!');
}
function desequiparItem(nomePokemon){
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var p = todos.find(function(x){ return x.nome === nomePokemon; });
  if(!p || !p.itemEquipado) return;
  var item = p.itemEquipado;
  if(!confirm('Desequipar ' + item + '?')) return;
  AudioSFX.clickMenu();
  jogador.itens[item] = (jogador.itens[item] || 0) + 1;
  p.itemEquipado = null;
  salvar();
  fecharModalDetalhes();
  renderTime();
  renderBanco();
  renderItens();
  alert(item + ' devolvido!');
}

// =============== MEGA / GMAX FORA DE BATALHA ===============
function ativarGigantamax(idx){
  var p = jogador.time[idx];
  if(!p) return;
  if(p.lvl < 50){ AudioSFX.erro(); alert('Precisa nível 50+!'); return; }
  if(!jogador.pulseiraGmax || jogador.pulseiraGmax.usos <= 0){ AudioSFX.erro(); alert('Precisa de Pulseira Gmax!'); return; }
  if((jogador.energiaMax || 0) < 100){ AudioSFX.erro(); alert('Precisa de 100 Energia Max!'); return; }
  if(p.mega){ AudioSFX.erro(); alert('Este Pokémon já é Mega.'); return; }
  if(!confirm('Transformar ' + p.nome + ' em Gigantamax?')) return;
  AudioSFX.gmax();
  p.gigantamax = true;
  if(GMAX_SPRITES[p.nome]) p.idGmax = GMAX_SPRITES[p.nome];
  if(!p.boostPermanente) p.boostPermanente = {atk:1, def:1, spa:1, spd:1, spe:1};
  p.boostPermanente.hp = (p.boostPermanente.hp || 1) * 1.5;
  p.boostPermanente.atk = (p.boostPermanente.atk || 1) * 1.15;
  p.boostPermanente.spa = (p.boostPermanente.spa || 1) * 1.15;
  p.boostPermanente.def = (p.boostPermanente.def || 1) * 1.15;
  p.boostPermanente.spd = (p.boostPermanente.spd || 1) * 1.15;
  jogador.pulseiraGmax.usos -= 1;
  jogador.energiaMax = Math.max(0, (jogador.energiaMax || 0) - 100);
  jogador.totalGmax = (jogador.totalGmax || 0) + 1;
  if(jogador.pulseiraGmax.usos <= 0){ jogador.pulseiraGmax.quantidade = 0; alert('Pulseira Gmax quebrou!'); }
  darXP(XP_ACOES.gmax, 'Gigantamax usado');
  registrarContador('mega');
  salvar();
  atualizarTudo();
}
function desfazerGigantamax(idx){
  var p = jogador.time[idx];
  if(!p || !p.gigantamax) return;
  if(p.permanente){ AudioSFX.erro(); alert('Gmax Permanente!'); return; }
  AudioSFX.clickMenu();
  p.gigantamax = false;
  p.idGmax = null;
  if(p.boostPermanente){
    p.boostPermanente.hp = (p.boostPermanente.hp || 1.5) / 1.5;
    p.boostPermanente.atk = (p.boostPermanente.atk || 1.15) / 1.15;
    p.boostPermanente.spa = (p.boostPermanente.spa || 1.15) / 1.15;
    p.boostPermanente.def = (p.boostPermanente.def || 1.15) / 1.15;
    p.boostPermanente.spd = (p.boostPermanente.spd || 1.15) / 1.15;
  }
  salvar();
  renderTime();
  atualizarStatus();
}
function megaEvoluir(idx){
  var p = jogador.time[idx];
  if(!p) return;
  var megaInfo = MEGA_EVOLUCOES[p.nome];
  if(!megaInfo){ AudioSFX.erro(); alert('Não pode Mega Evoluir.'); return; }
  if(p.gigantamax){ AudioSFX.erro(); alert('Já é Gmax.'); return; }
  if(p.mega){ AudioSFX.erro(); alert('Já é Mega.'); return; }
  if(!jogador.pulseiraMega || jogador.pulseiraMega.usos <= 0){ AudioSFX.erro(); alert('Precisa de Pulseira Mega!'); return; }
  var pedra = megaInfo.pedra, pedraAlt = megaInfo.pedraAlternativa;
  var pd = null, pda = null;
  if(jogador.itens[pedra] && typeof jogador.itens[pedra] === 'object' && jogador.itens[pedra].usos > 0) pd = pedra;
  if(pedraAlt && jogador.itens[pedraAlt] && typeof jogador.itens[pedraAlt] === 'object' && jogador.itens[pedraAlt].usos > 0) pda = pedraAlt;
  if(!pd && !pda){ AudioSFX.erro(); alert('Precisa da ' + pedra + '!'); return; }
  var pedraUsar, forma;
  if(megaInfo.duasFormas && pd && pda){
    var esc = confirm('OK = ' + pedra + '\nCancelar = ' + pedraAlt);
    pedraUsar = esc ? pd : pda;
    forma = esc ? 'X' : 'Y';
  }else{ pedraUsar = pd || pda; forma = pd ? 'X' : 'Y'; }
  if(!confirm('Mega Evoluir ' + p.nome + '?')) return;
  var obj = jogador.itens[pedraUsar];
  if(typeof obj === 'object'){
    obj.usos -= 1;
    if(obj.usos <= 0){ delete jogador.itens[pedraUsar]; alert('A ' + pedraUsar + ' quebrou!'); }
  }
  AudioSFX.mega();
  p.mega = true;
  p.megaForma = forma;
  p.nomeMega = p.nome + ' Mega' + (megaInfo.duasFormas ? ' ' + forma : '');
  if(!p.boostPermanente) p.boostPermanente = {atk:1, def:1, spa:1, spd:1, spe:1};
  var boost = megaInfo.boost || {};
  if(boost.atk) p.boostPermanente.atk = (p.boostPermanente.atk || 1) * boost.atk;
  if(boost.def) p.boostPermanente.def = (p.boostPermanente.def || 1) * boost.def;
  if(boost.spa) p.boostPermanente.spa = (p.boostPermanente.spa || 1) * boost.spa;
  if(boost.spd) p.boostPermanente.spd = (p.boostPermanente.spd || 1) * boost.spd;
  if(boost.spe) p.boostPermanente.spe = (p.boostPermanente.spe || 1) * boost.spe;
  jogador.pulseiraMega.usos -= 1;
  jogador.totalMega = (jogador.totalMega || 0) + 1;
  if(jogador.pulseiraMega.usos <= 0){ jogador.pulseiraMega.quantidade = 0; alert('Pulseira Mega quebrou!'); }
  darXP(XP_ACOES.mega_evolucao, 'Mega Evolução');
  registrarContador('mega');
  salvar();
  atualizarTudo();
}
function desfazerMega(idx){
  var p = jogador.time[idx];
  if(!p || !p.mega) return;
  if(p.permanenteMega){ AudioSFX.erro(); alert('Mega Permanente!'); return; }
  AudioSFX.clickMenu();
  var megaInfo = MEGA_EVOLUCOES[p.nome];
  var boost = (megaInfo && megaInfo.boost) || {};
  if(p.boostPermanente){
    if(boost.atk) p.boostPermanente.atk = (p.boostPermanente.atk || 1) / boost.atk;
    if(boost.def) p.boostPermanente.def = (p.boostPermanente.def || 1) / boost.def;
    if(boost.spa) p.boostPermanente.spa = (p.boostPermanente.spa || 1) / boost.spa;
    if(boost.spd) p.boostPermanente.spd = (p.boostPermanente.spd || 1) / boost.spd;
    if(boost.spe) p.boostPermanente.spe = (p.boostPermanente.spe || 1) / boost.spe;
  }
  p.mega = false;
  p.megaForma = null;
  p.nomeMega = null;
  salvar();
  renderTime();
  atualizarStatus();
}

// =============== RENDER TIME / BANCO ===============
function renderTime(){
  var cont = document.getElementById('time-slots');
  if(!cont) return;
  cont.innerHTML = '';
  jogador.time.forEach(function(p, i){
    var div = document.createElement('div');
    div.className = 'pokemon-card';
    div.dataset.idx = i;
    if(p){
      if(p.favorito) div.classList.add('favorito');
      if(p.gigantamax) div.classList.add('gmax-ativo');
      if(p.mega) div.classList.add('mega-ativo');
      if(p.shiny) div.classList.add('shiny');
      var img = criarImagem(spritePokemonAtual(p), '84px');
      img.className = 'sprite-principal';
      img.draggable = false;
      div.appendChild(img);
      if(p.shiny) div.insertAdjacentHTML('beforeend', '<div class="badge-shiny">✨ SHINY</div>');
      var btnFav = document.createElement('button');
      btnFav.className = 'btn-favorito' + (p.favorito ? ' ativo' : '');
      btnFav.innerHTML = '<i class="fas fa-star"></i>';
      btnFav.onclick = function(e){ e.stopPropagation(); toggleFavorito(p); };
      div.appendChild(btnFav);
      if(p.itemEquipado){
        var badge = document.createElement('div');
        badge.className = 'badge-item-equipado';
        badge.title = p.itemEquipado;
        badge.appendChild(criarImagem(imagemItem(p.itemEquipado) || imagemBola('poke-ball'), '22px', p.itemEquipado));
        div.appendChild(badge);
      }
      if(p.raridade && p.raridade !== 'normal') div.insertAdjacentHTML('beforeend', criarBadgeRaridade(p.raridade));
      if(p.forma) div.insertAdjacentHTML('beforeend', criarBadgeForma(p.forma));
      if(p.status){
        var stCard = document.createElement('div');
        stCard.className = 'badge-status-card';
        stCard.innerHTML = criarBadgeStatusCard(p.status);
        div.appendChild(stCard);
      }
      var nomeLinha = document.createElement('div');
      nomeLinha.className = 'nome-linha';
      var nomeExibir = (p.mega && p.nomeMega) ? p.nomeMega : p.nome;
      var apelidoHtml = p.apelido ? '<span class="apelido-sub">(' + p.nome + ')</span>' : '';
      nomeLinha.innerHTML = '<span class="nome">' + (p.apelido || nomeExibir) + '</span> ' + criarBadgeTipo(p.tipo) + ' ' + criarBadgeSexo(p.sexo) + apelidoHtml;
      div.appendChild(nomeLinha);
      var info1 = document.createElement('div');
      info1.className = 'info';
      info1.textContent = 'Lvl ' + p.lvl;
      div.appendChild(info1);
      div.appendChild(criarBarraHPMini(p));
      var info2 = document.createElement('div');
      info2.className = 'info';
      info2.innerHTML = 'Bat: ' + p.batalhas + '<br>BG: ' + p.bg + ' | BP: ' + p.bp;
      div.appendChild(info2);
      var statsDiv = renderBarrinhasStats(p);
      if(statsDiv) div.appendChild(statsDiv);
      var habTag = document.createElement('div');
      habTag.className = 'habilidade-tag';
      habTag.innerHTML = '<i class="fas fa-sparkles"></i> ' + (p.habilidade || 'Habilidade');
      habTag.onclick = function(e){ e.stopPropagation(); mostrarInfoHabilidade(p.habilidade); };
      div.appendChild(habTag);
      var evoInfo = document.createElement('div');
      evoInfo.className = 'info-evo';
      evoInfo.innerHTML = '<i class="fas fa-arrow-trend-up"></i> ...';
      div.appendChild(evoInfo);
      getInfoEvolucao(p).then(function(info){
        if(!info){ evoInfo.style.display = 'none'; return; }
        if(info.evolucaoFinal){
          evoInfo.innerHTML = '<i class="fas fa-crown"></i> Evolução Final';
        }else if(info.faltam <= 0){
          evoInfo.innerHTML = '<i class="fas fa-arrow-trend-up"></i> Pronto p/ ' + info.proximo + '!';
        }else{
          evoInfo.innerHTML = '<i class="fas fa-arrow-trend-up"></i> ' + info.faltam + ' lvl p/ ' + info.proximo;
        }
      });
      var btn = document.createElement('button');
      btn.className = 'btn-mover';
      btn.innerHTML = '<i class="fas fa-arrow-right"></i> Banco';
      btn.addEventListener('click', function(e){ e.stopPropagation(); moverParaBanco(i); });
      div.appendChild(btn);
      renderBotoesEspeciais(div, p, i);
      if(p.mega){
        var bMega = document.createElement('div');
        bMega.className = 'badge-mega';
        bMega.textContent = 'MEGA';
        div.appendChild(bMega);
      }else if(p.gigantamax){
        var bGmax = document.createElement('div');
        bGmax.className = 'badge-gmax';
        bGmax.textContent = 'GMAX';
        div.appendChild(bGmax);
      }
      div.addEventListener('click', function(e){
        if(e.target.closest('button')) return;
        abrirDetalhesPokemon(p);
      });
    }else{
      div.innerHTML = '<div class="info" style="padding:35px 0;">Slot ' + (i + 1) + ' vazio</div>';
    }
    cont.appendChild(div);
  });
}
function renderBotoesEspeciais(div, p, i){
  if(p.mega && !p.permanenteMega){
    var btnM = document.createElement('button');
    btnM.className = 'btn-mover';
    btnM.innerHTML = '<i class="fas fa-rotate-left"></i> Desfazer Mega';
    btnM.addEventListener('click', function(e){ e.stopPropagation(); desfazerMega(i); });
    div.appendChild(btnM);
    return;
  }
  if(p.gigantamax && !p.permanente){
    var btnG = document.createElement('button');
    btnG.className = 'btn-mover';
    btnG.innerHTML = '<i class="fas fa-rotate-left"></i> Desfazer Gmax';
    btnG.addEventListener('click', function(e){ e.stopPropagation(); desfazerGigantamax(i); });
    div.appendChild(btnG);
    return;
  }
  var podeMega = podeMegaEvoluir(p);
  var podeGmax = podeGigantamax(p);
  if(!podeMega && !podeGmax) return;
  var wrapper = document.createElement('div');
  wrapper.className = 'acoes-especiais';
  if(podeMega){
    var btnMg = document.createElement('button');
    btnMg.className = 'btn-mega';
    btnMg.innerHTML = '<i class="fas fa-star"></i> Mega';
    btnMg.addEventListener('click', function(e){ e.stopPropagation(); megaEvoluir(i); });
    wrapper.appendChild(btnMg);
  }
  if(podeGmax){
    var btnGx = document.createElement('button');
    btnGx.className = 'btn-gmax';
    btnGx.innerHTML = '<i class="fas fa-dragon"></i> Gmax';
    btnGx.addEventListener('click', function(e){ e.stopPropagation(); ativarGigantamax(i); });
    wrapper.appendChild(btnGx);
  }
  div.appendChild(wrapper);
}
function renderBanco(){
  var cont = document.getElementById('banco-slots');
  if(!cont) return;
  cont.innerHTML = '';
  var lista = jogador.banco.slice();
  var busca = (document.getElementById('filtro-banco-busca')?.value || '').toLowerCase();
  var tipo = (document.getElementById('filtro-banco-tipo')?.value || 'todos');
  var raridadeFiltro = (document.getElementById('filtro-banco-raridade')?.value || 'todas');
  var sexoFiltro = (document.getElementById('filtro-banco-sexo')?.value || 'todos');
  var statsFiltro = (document.getElementById('filtro-banco-stats')?.value || 'todos');
  var ordem = (document.getElementById('filtro-banco-ordem')?.value || 'padrao');
  if(busca) lista = lista.filter(function(p){
    return p.nome.toLowerCase().indexOf(busca) !== -1 || (p.apelido || '').toLowerCase().indexOf(busca) !== -1;
  });
  if(tipo !== 'todos') lista = lista.filter(function(p){ return p.tipo === tipo; });
  if(raridadeFiltro !== 'todas') lista = lista.filter(function(p){ return (p.raridade || 'normal') === raridadeFiltro; });
  if(sexoFiltro !== 'todos') lista = lista.filter(function(p){ return (p.sexo || 'N') === sexoFiltro; });
  if(statsFiltro === 'lvl50') lista = lista.filter(function(p){ return p.lvl >= 50; });
  else if(statsFiltro === 'lvl70') lista = lista.filter(function(p){ return p.lvl >= 70; });
  else if(statsFiltro === 'lvl100') lista = lista.filter(function(p){ return p.lvl >= 100; });
  if(mostrarSoFavoritos) lista = lista.filter(function(p){ return p.favorito; });
  if(ordem === 'nivel-desc') lista.sort(function(a, b){ return b.lvl - a.lvl; });
  else if(ordem === 'nivel-asc') lista.sort(function(a, b){ return a.lvl - b.lvl; });
  else if(ordem === 'nome-asc') lista.sort(function(a, b){ return a.nome.localeCompare(b.nome); });
  if(lista.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhum Pokémon encontrado.</p>';
    return;
  }
  lista.forEach(function(p){
    var div = document.createElement('div');
    div.className = 'pokemon-card';
    if(p.favorito) div.classList.add('favorito');
    if(p.gigantamax) div.classList.add('gmax-ativo');
    if(p.mega) div.classList.add('mega-ativo');
    if(p.shiny) div.classList.add('shiny');
    var img = criarImagem(spritePokemonAtual(p), '84px');
    img.className = 'sprite-principal';
    img.draggable = false;
    div.appendChild(img);
    if(p.shiny) div.insertAdjacentHTML('beforeend', '<div class="badge-shiny">✨ SHINY</div>');
    var btnFav = document.createElement('button');
    btnFav.className = 'btn-favorito' + (p.favorito ? ' ativo' : '');
    btnFav.innerHTML = '<i class="fas fa-star"></i>';
    btnFav.onclick = function(e){ e.stopPropagation(); toggleFavorito(p); };
    div.appendChild(btnFav);
    if(p.raridade && p.raridade !== 'normal') div.insertAdjacentHTML('beforeend', criarBadgeRaridade(p.raridade));
    if(p.forma) div.insertAdjacentHTML('beforeend', criarBadgeForma(p.forma));
    if(p.status){
      var stCard = document.createElement('div');
      stCard.className = 'badge-status-card';
      stCard.innerHTML = criarBadgeStatusCard(p.status);
      div.appendChild(stCard);
    }
    var nomeLinha = document.createElement('div');
    nomeLinha.className = 'nome-linha';
    var nomeExibir = (p.mega && p.nomeMega) ? p.nomeMega : p.nome;
    var apelidoHtml = p.apelido ? '<span class="apelido-sub">(' + p.nome + ')</span>' : '';
    nomeLinha.innerHTML = '<span class="nome">' + (p.apelido || nomeExibir) + '</span> ' + criarBadgeTipo(p.tipo) + ' ' + criarBadgeSexo(p.sexo) + apelidoHtml;
    div.appendChild(nomeLinha);
    var info1 = document.createElement('div');
    info1.className = 'info';
    info1.textContent = 'Lvl ' + p.lvl;
    div.appendChild(info1);
    div.appendChild(criarBarraHPMini(p));
    var statsDiv = renderBarrinhasStats(p);
    if(statsDiv) div.appendChild(statsDiv);
    var btn = document.createElement('button');
    btn.className = 'btn-mover';
    btn.innerHTML = '<i class="fas fa-arrow-left"></i> Time';
    btn.addEventListener('click', function(e){ e.stopPropagation(); moverParaTimePorPokemon(p); });
    div.appendChild(btn);
    div.addEventListener('click', function(e){
      if(e.target.closest('button')) return;
      abrirDetalhesPokemon(p);
    });
    cont.appendChild(div);
  });
}
function toggleFavorito(pokemon){
  AudioSFX.clickMenu();
  pokemon.favorito = !pokemon.favorito;
  salvar();
  renderTime();
  renderBanco();
}
function toggleMostrarFavoritos(){
  AudioSFX.clickMenu();
  mostrarSoFavoritos = !mostrarSoFavoritos;
  var btn = document.getElementById('btn-favoritos');
  if(btn) btn.style.background = mostrarSoFavoritos ? 'rgba(255,203,5,0.3)' : '';
  renderBanco();
}
function moverParaTimePorPokemon(p){
  var slotVazio = jogador.time.indexOf(null);
  if(slotVazio === -1){ AudioSFX.erro(); alert('Time cheio!'); return; }
  var idx = jogador.banco.indexOf(p);
  if(idx === -1) return;
  AudioSFX.clickMenu();
  jogador.banco.splice(idx, 1);
  jogador.time[slotVazio] = p;
  salvar();
  renderTime();
  renderBanco();
  atualizarStatus();
}
function moverParaBanco(idxTime){
  var p = jogador.time[idxTime];
  if(!p) return;
  if(p.gigantamax && !p.permanente){ AudioSFX.erro(); alert('Desfaça o Gigantamax!'); return; }
  if(p.mega && !p.permanenteMega){ AudioSFX.erro(); alert('Desfaça a Mega Evolução!'); return; }
  var naoNulos = jogador.time.filter(function(x){ return x !== null; }).length;
  if(naoNulos <= 1){ AudioSFX.erro(); alert('Precisa de pelo menos 1 Pokémon!'); return; }
  AudioSFX.clickMenu();
  jogador.time[idxTime] = null;
  jogador.banco.push(p);
  salvar();
  renderTime();
  renderBanco();
  atualizarStatus();
}
function recolherTudoParaBanco(){
  if(!confirm('Mover todos para o banco?')) return;
  var mantidos = 0;
  for(var i = 0; i < jogador.time.length; i++){
    var p = jogador.time[i];
    if(!p) continue;
    if(mantidos === 0){
      if(p.mega && !p.permanenteMega){ p.mega = false; p.megaForma = null; p.nomeMega = null; }
      if(p.gigantamax && !p.permanente){ p.gigantamax = false; p.idGmax = null; }
      mantidos++;
      continue;
    }
    if(p.mega && !p.permanenteMega){ p.mega = false; p.megaForma = null; p.nomeMega = null; }
    if(p.gigantamax && !p.permanente){ p.gigantamax = false; p.idGmax = null; }
    jogador.banco.push(p);
    jogador.time[i] = null;
  }
  AudioSFX.clickMenu();
  salvar();
  renderTime();
  renderBanco();
  atualizarStatus();
  alert('Time recolhido!');
}

// =============== INFO EVOLUÇÃO ===============
var CACHE_EVO_INFO = {};
async function getInfoEvolucao(pokemon){
  if(!pokemon) return null;
  if(CACHE_EVO_INFO[pokemon.nome]) return CACHE_EVO_INFO[pokemon.nome];
  try{
    var mapa = await buscarCadeiaEvolucao(pokemon.nome);
    var slug = pokemon.nome.toLowerCase().replace(/\s+/g, '-');
    var proxima = mapa[slug];
    if(!proxima){
      CACHE_EVO_INFO[pokemon.nome] = {evolucaoFinal:true};
      return {evolucaoFinal:true};
    }
    var faltam = Math.max(0, proxima.nivel - pokemon.lvl);
    var result = {proximo:proxima.proximo, nivelNecessario:proxima.nivel, faltam:faltam};
    CACHE_EVO_INFO[pokemon.nome] = result;
    return result;
  }catch(e){ return null; }
}

// =============== POKÉDEX ===============
function getHabitatPokemon(id){
  var biomas = Object.keys(POKEMON_POR_BIOMA);
  var nomes = {
    grass:'Grama', grassSpot:'Campo', forest:'Floresta', cave:'Caverna',
    desert:'Deserto', snow:'Neve', water:'Água', stoneDay:'Rochoso',
    redDesert:'Deserto Vermelho', nightGround:'Noturno', deepCave:'Caverna Profunda',
    redCave:'Caverna Vermelha', underwater:'Oceano', mirror:'Espelho',
    fireArena:'Arena de Fogo', crystalCave:'Cristais', mystic:'Místico', astral:'Astral'
  };
  for(var i = 0; i < biomas.length; i++){
    var arr = POKEMON_POR_BIOMA[biomas[i]];
    if(arr && arr.indexOf(id) !== -1) return nomes[biomas[i]] || biomas[i];
  }
  return null;
}
function ehLendario(nome){
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
  for(var reg in LENDARIOS_POR_REGIAO){
    if(LENDARIOS_POR_REGIAO[reg].indexOf(nome) !== -1) return true;
  }
  return false;
}
function renderPokedex(){
  var cont = document.getElementById('pokedex-grid');
  if(!cont) return;
  var resumo = document.getElementById('pokedex-resumo');
  var totalCapturados = 0, totalVistos = 0, totalShinies = 0;
  var busca = (document.getElementById('pokedex-busca')?.value || '').toLowerCase();
  var filtroStatus = document.getElementById('pokedex-filtro-status')?.value || 'todos';
  Object.keys(jogador.pokedex || {}).forEach(function(id){
    var reg = jogador.pokedex[id];
    if(reg.capturado) totalCapturados++;
    if(reg.visto) totalVistos++;
    if(reg.shiny) totalShinies++;
  });
  if(resumo){
    resumo.innerHTML = '<h3><i class="fas fa-book"></i> Pokédex</h3>' +
      '<div class="contador-grande">' + totalCapturados + ' / 1025</div>' +
      '<p style="color:var(--texto-secundario);font-size:9px;">Vistos: ' + totalVistos + ' · ✨ Shinies: ' + totalShinies + '</p>';
  }
  cont.innerHTML = '';
  var ids = Object.keys(jogador.pokedex || {}).map(function(k){ return parseInt(k); });
  if(ids.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;grid-column:1/-1;text-align:center;">Nenhum Pokémon.</p>';
    return;
  }
  ids.sort(function(a, b){ return a - b; });
  var listaPoke = (typeof LISTA_POKEMON_COMPLETA !== 'undefined') ? LISTA_POKEMON_COMPLETA : [];
  for(var i = 0; i < ids.length; i++){
    var id = ids[i];
    var reg = jogador.pokedex[id];
    var nome = listaPoke[id - 1] || ('Pokémon #' + id);
    if(busca && nome.toLowerCase().indexOf(busca) === -1) continue;
    if(filtroStatus === 'capturado' && !reg.capturado) continue;
    if(filtroStatus === 'visto' && !reg.visto) continue;
    if(filtroStatus === 'shiny' && !reg.shiny) continue;
    if(filtroStatus === 'lendarios' && !ehLendario(nome)) continue;
    if(filtroStatus === 'ultrabeasts' && !reg.ultraBeast) continue;
    var habitat = getHabitatPokemon(id);
    var classe = reg.capturado ? 'capturado' : (reg.visto ? 'visto' : 'nao-visto');
    if(reg.shiny) classe += ' shiny';
    var div = document.createElement('div');
    div.className = 'pokedex-card ' + classe;
    var habHtml = habitat ? '<div class="pokedex-habitat"><i class="fas fa-map-pin"></i> ' + habitat + '</div>' : '';
    var shinyTag = reg.shiny ? '<div class="pokedex-shiny-tag">✨</div>' : '';
    div.innerHTML = '<div class="pokedex-num">#' + String(id).padStart(4, '0') + '</div>' +
      shinyTag +
      '<img src="' + (reg.shiny ? spritePokemonShiny(id) : spritePokemon(id)) + '" onerror="this.src=\'' + API_ITEM + 'poke-ball.png\'">' +
      '<div class="pokedex-nome">' + nome + '</div>' + habHtml;
    (function(idF){
      div.onclick = function(){
        var todos = jogador.time.filter(Boolean).concat(jogador.banco);
        var p = todos.find(function(x){ return x.id === idF; });
        if(p) abrirTelaPokemonCheia(p.nome);
        else alert('Pokémon #' + idF + ' registrado.');
      };
    })(id);
    cont.appendChild(pokedex);
  }
}

// =============== CENTRO POKÉMON ===============
function curarTimeCentro(){
  var timeAtivo = jogador.time.filter(Boolean);
  if(timeAtivo.length === 0){ AudioSFX.erro(); alert('Você não tem Pokémons!'); return; }
  var todosDesmaiados = timeAtivo.every(function(p){
    return p.hpAtual === null || p.hpAtual === undefined || p.hpAtual <= 0;
  });
  var custo = todosDesmaiados ? 0 : 10;
  if(jogador.pc < custo){ AudioSFX.erro(); alert('PC insuficientes!'); return; }
  if(!confirm(todosDesmaiados ? 'Curar GRÁTIS?' : 'Curar por 10 PC?')) return;
  AudioSFX.cura();
  jogador.pc -= custo;
  timeAtivo.forEach(function(p){
    p.hpAtual = null;
    p.status = null;
    p.statusTurnos = 0;
    p._slpTurnos = 0;
    p._cnfTurnos = 0;
    inicializarHP(p);
  });
  salvar();
  atualizarStatus();
  mostrarToastNotificacao('Centro Pokémon', 'Time curado!');
  renderCentroPokemon();
  atualizarCustoCentro();
}
function atualizarCustoCentro(){
  var timeAtivo = jogador.time.filter(Boolean);
  var todosDesmaiados = timeAtivo.length > 0 && timeAtivo.every(function(p){
    return p.hpAtual === null || p.hpAtual === undefined || p.hpAtual <= 0;
  });
  var custoEl = document.getElementById('custo-centro');
  if(custoEl){
    if(todosDesmaiados){ custoEl.textContent = 'GRÁTIS'; custoEl.classList.add('gratis'); }
    else{ custoEl.textContent = 'Custo: 10 PC'; custoEl.classList.remove('gratis'); }
  }
}
function renderCentroPokemon(){
  var cont = document.getElementById('centro-time-lista');
  if(!cont) return;
  cont.innerHTML = '';
  var timeAtivo = jogador.time.filter(Boolean);
  if(timeAtivo.length === 0){
    cont.innerHTML = '<p style="color:#fff;font-size:10px;text-align:center;grid-column:1/-1;">Nenhum Pokémon.</p>';
    return;
  }
  timeAtivo.forEach(function(p){
    inicializarHP(p);
    var hp = (p.hpAtual !== null && p.hpAtual !== undefined) ? p.hpAtual : (p._hpMax || 0);
    var max = p._hpMax || 1;
    var pct = Math.max(0, (hp / max) * 100);
    var cor = pct > 50 ? '#4caf50' : pct > 20 ? '#ff9800' : '#f44336';
    var div = document.createElement('div');
    div.className = 'ct-poke';
    div.innerHTML = '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="ct-nome">' + (p.apelido || p.nome) + (p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '') + (p.shiny ? ' ✨' : '') + '</div>' +
      '<div class="ct-hp">Lvl ' + p.lvl + ' · HP ' + hp + '/' + max + '</div>' +
      '<div class="ct-barra-hp"><div class="ct-fill" style="width:' + pct + '%;background:' + cor + ';"></div></div>';
    cont.appendChild(div);
  });
}

// =============== REGIÕES ===============
function renderRegioes(){
  var cont = document.getElementById('regioes-lista');
  if(!cont) return;
  cont.innerHTML = '';
  REGIOES.forEach(function(r){
    var liberada = jogador.passaportes >= r.passaportes;
    var div = document.createElement('div');
    div.className = 'regiao-card ' + (liberada ? 'liberada' : 'bloqueada');
    div.onclick = function(){ mostrarMapaRegiao(r.nome); };
    var insigniasGanhas = ((jogador.insignias[r.nome] || []).filter(function(x){ return x; })).length;
    var totalInsignias = INSIGNIAS[r.nome] ? INSIGNIAS[r.nome].length : 8;
    var batalhas = jogador.historico.filter(function(h){ return h.regiao === r.nome; }).length;
    var vitorias = jogador.historico.filter(function(h){ return h.regiao === r.nome && h.resultado === 'Ganhou'; }).length;
    var capturados = (jogador.capturas || []).filter(function(c){ return c.regiao === r.nome; }).length;
    var porcentagem = Math.round((insigniasGanhas / totalInsignias) * 100);
    div.innerHTML = '<div class="nome">' + r.nome + '</div>' +
      '<div class="barra-progresso"><div class="preenchimento" style="width:' + porcentagem + '%"></div></div>' +
      '<div class="regiao-stats"><span><i class="fas fa-award"></i> ' + insigniasGanhas + '/' + totalInsignias + '</span><span>' + porcentagem + '%</span></div>' +
      '<div class="regiao-stats" style="margin-top:6px;"><span><i class="fas fa-khanda"></i> ' + batalhas + '</span><span>' + vitorias + 'V</span></div>' +
      '<div class="regiao-stats" style="margin-top:6px;"><span><i class="fas fa-circle-dot"></i> ' + capturados + '</span></div>' +
      '<div class="status">' + (liberada ? '<i class="fas fa-lock-open"></i> Liberada' : '<i class="fas fa-lock"></i> ' + r.passaportes + ' P') + '</div>';
    cont.appendChild(div);
  });
}
function mostrarMapaRegiao(regiao){
  var cont = document.getElementById('mapa-regiao-container');
  if(!cont) return;
  var lideres = LIDERES_GINASIO[regiao] || [];
  var insigniasRegiao = INSIGNIAS[regiao] || [];
  var html = '<div class="mapa-regiao"><div class="nome-mapa">' + regiao + '</div><div class="gym-info">';
  lideres.forEach(function(l, i){
    var ganhou = jogador.insignias[regiao] && jogador.insignias[regiao][i];
    html += '<div class="gym-item"><div class="lider">' + (ganhou ? '<i class="fas fa-check"></i> ' : '<i class="fas fa-lock"></i> ') + l.lider + '</div>' +
      '<div>' + l.cidade + '</div><div>Tipo: ' + l.tipo + '</div>' +
      '<div>' + (insigniasRegiao[i] || 'Insígnia ' + (i + 1)) + '</div></div>';
  });
  html += '</div></div>';
  cont.innerHTML = html;
  cont.scrollIntoView({behavior:'smooth', block:'start'});
}

// =============== INSÍGNIAS ===============
function renderInsignias(){
  var cont = document.getElementById('insignias-lista');
  if(!cont) return;
  cont.innerHTML = '';
  Object.keys(INSIGNIAS).forEach(function(regiao){
    var bloco = document.createElement('div');
    bloco.className = 'insignia-bloco';
    var html = '<h3>' + regiao + '</h3><div class="insignia-grid">';
    var sprites = SPRITES_INSIGNIAS[regiao] || [];
    var fallbackIcons = ICONES_INSIGNIAS_FA[regiao] || [];
    INSIGNIAS[regiao].forEach(function(nome, i){
      var ganha = jogador.insignias[regiao] && jogador.insignias[regiao][i];
      if(ganha){
        var spriteUrl = sprites[i];
        var iconFallback = fallbackIcons[i] || 'fa-award';
        html += '<div class="insignia-item ganha">' +
          '<img class="insignia-sprite" src="' + spriteUrl + '" ' +
            'onerror="this.style.display=\'none\';var x=document.createElement(\'i\');x.className=\'fas ' + iconFallback + ' insignia-sprite\';this.parentNode.insertBefore(x,this);">' +
          '<div>' + nome + '</div></div>';
      }else{
        html += '<div class="insignia-item"><span class="cadeado"><i class="fas fa-lock"></i></span><div>' + nome + '</div></div>';
      }
    });
    html += '</div>';
    var total = INSIGNIAS[regiao].length;
    var ganhas = (jogador.insignias[regiao] || []).filter(function(x){ return x; }).length;
    if(ganhas >= total){
      var bloqueada = jogador.copasRegiaoBloqueadaAte > 0;
      html += '<button class="btn-copa-regiao" ' + (bloqueada ? 'disabled' : '') +
        ' onclick="' + (bloqueada ? '' : "irParaCopaRegiao('" + regiao + "')") + '">' +
        '<i class="fas fa-trophy"></i> Copa de ' + regiao + '</button>';
    }
    bloco.innerHTML = html;
    cont.appendChild(bloco);
  });
}
function irParaCopaRegiao(regiao){
  AudioSFX.clickMenu();
  document.querySelectorAll('.aba-btn').forEach(function(b){ b.classList.remove('ativa'); });
  document.querySelectorAll('.aba').forEach(function(a){ a.classList.remove('ativa'); });
  var btnCopa = document.querySelector('.aba-btn[data-aba="copa"]');
  if(btnCopa) btnCopa.classList.add('ativa');
  var secCopa = document.getElementById('aba-copa');
  if(secCopa) secCopa.classList.add('ativa');
  renderCopa();
  renderCopaHistorico();
  setTimeout(function(){ iniciarCopaRegiao(regiao); }, 300);
}

// =============== RANKING ===============
var RANKING_OPCOES = [
  {id:'nivel', icone:'fa-star', label:'Maior Nível'},
  {id:'bg', icone:'fa-trophy', label:'Mais Vitórias'},
  {id:'batalhas', icone:'fa-khanda', label:'Mais Batalhas'},
  {id:'nome', icone:'fa-sort-alpha-down', label:'Nome (A-Z)'},
  {id:'shiny', icone:'fa-star-of-life', label:'Shinies'},
  {id:'mega', icone:'fa-crown', label:'Megas'},
  {id:'gmax', icone:'fa-dragon', label:'Gmax'},
  {id:'amizade', icone:'fa-heart', label:'Amizade'},
  {id:'lendario', icone:'fa-bolt', label:'Lendários'},
  {id:'capturas', icone:'fa-circle-dot', label:'Capturas'}
];
function renderRankingFiltros(){
  var cont = document.getElementById('ranking-filtros');
  if(!cont) return;
  cont.innerHTML = '';
  RANKING_OPCOES.forEach(function(op){
    var btn = document.createElement('button');
    btn.className = 'ranking-filtro' + (filtroRankingAtual === op.id ? ' ativo' : '');
    btn.innerHTML = '<i class="fas ' + op.icone + '"></i> ' + op.label;
    btn.onclick = function(){
      AudioSFX.clickMenu();
      filtroRankingAtual = op.id;
      renderRankingFiltros();
      renderRanking();
    };
    cont.appendChild(btn);
  });
}
function renderRanking(){
  var cont = document.getElementById('ranking-lista');
  if(!cont) return;
  cont.innerHTML = '';
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var unicos = [], vistos = {};
  todos.forEach(function(p){
    var chave = p.nome + '_' + (p.shiny ? 's' : 'n') + '_' + (p.sexo || 'N');
    if(!vistos[chave]){ vistos[chave] = true; unicos.push(p); }
  });
  if(unicos.length === 0){ cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhum Pokémon.</p>'; return; }
  var lista = [], titulo = '', chave = null, sufixo = '';
  if(filtroRankingAtual === 'nivel'){
    titulo = 'Top 20 — Maior Nível';
    lista = unicos.slice().sort(function(a, b){ return b.lvl - a.lvl; }).slice(0, 20);
    chave = function(p){ return p.lvl; };
  }else if(filtroRankingAtual === 'bg'){
    titulo = 'Top 20 — Mais Vitórias';
    lista = unicos.slice().sort(function(a, b){ return (b.bg || 0) - (a.bg || 0); }).slice(0, 20);
    chave = function(p){ return p.bg || 0; };
    sufixo = ' vit';
  }else if(filtroRankingAtual === 'batalhas'){
    titulo = 'Top 20 — Mais Batalhas';
    lista = unicos.slice().sort(function(a, b){ return (b.batalhas || 0) - (a.batalhas || 0); }).slice(0, 20);
    chave = function(p){ return p.batalhas || 0; };
    sufixo = ' bat';
  }else if(filtroRankingAtual === 'nome'){
    titulo = 'Top 20 — Nome (A-Z)';
    lista = unicos.slice().sort(function(a, b){ return a.nome.localeCompare(b.nome); }).slice(0, 20);
    chave = function(){ return ''; };
  }else if(filtroRankingAtual === 'shiny'){
    titulo = 'Shinies';
    lista = unicos.filter(function(p){ return p.shiny; }).slice(0, 20);
    chave = function(){ return '✨'; };
  }else if(filtroRankingAtual === 'mega'){
    titulo = 'Megas';
    lista = unicos.filter(function(p){ return p.mega || p.permanenteMega; }).slice(0, 20);
    chave = function(){ return 'MEGA'; };
  }else if(filtroRankingAtual === 'gmax'){
    titulo = 'Gigantamax';
    lista = unicos.filter(function(p){ return p.gigantamax || p.permanente; }).slice(0, 20);
    chave = function(){ return 'GMAX'; };
  }else if(filtroRankingAtual === 'amizade'){
    titulo = 'Top 20 — Amizade';
    lista = unicos.slice().sort(function(a, b){ return (b.amizade || 0) - (a.amizade || 0); }).slice(0, 20);
    chave = function(p){ return (p.amizade || 0) + ' pts'; };
  }else if(filtroRankingAtual === 'lendario'){
    titulo = 'Lendários';
    lista = unicos.filter(function(p){ return ehLendario(p.nome); }).slice(0, 20);
    chave = function(p){ return 'Lvl ' + p.lvl; };
  }else if(filtroRankingAtual === 'capturas'){
    titulo = 'Capturas';
    lista = unicos.slice(0, 20);
    chave = function(){ return (jogador.capturas || []).length; };
  }
  var bloco = document.createElement('div');
  bloco.className = 'ranking-bloco';
  var html = '<h3>' + titulo + '</h3>';
  if(lista.length === 0) html += '<p style="color:#888;font-size:9px;">Sem dados.</p>';
  else lista.forEach(function(p, i){
    var sexo = p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '';
    html += '<div class="ranking-item">' +
      '<span class="pos">' + (i + 1) + 'º</span>' +
      '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<span class="nome">' + (p.apelido || p.nome) + sexo + (p.shiny ? ' ✨' : '') + '</span>' +
      '<span class="valor">' + chave(p) + sufixo + '</span></div>';
  });
  bloco.innerHTML = html;
  cont.appendChild(bloco);
}

// =============== ESTATÍSTICAS ===============
function renderEstatisticas(){
  var cont = document.getElementById('stats-lista');
  if(!cont) return;
  cont.innerHTML = '';
  var totalBatalhas = (jogador.bg || 0) + (jogador.bp || 0);
  var taxaVitoria = totalBatalhas > 0 ? Math.round((jogador.bg / totalBatalhas) * 100) : 0;
  var stats = [
    {icone:'fa-circle-dot', label:'Capturas', valor:(jogador.capturas || []).length},
    {icone:'fa-star-of-life', label:'Shinies', valor:jogador.shiniesCapturados || 0},
    {icone:'fa-khanda', label:'Vitórias', valor:jogador.bg || 0},
    {icone:'fa-skull', label:'Derrotas', valor:jogador.bp || 0},
    {icone:'fa-chart-line', label:'Taxa', valor:taxaVitoria + '%'},
    {icone:'fa-person-running', label:'Fugas', valor:jogador.fugas || 0},
    {icone:'fa-award', label:'Insígnias', valor:contarInsignias(jogador) + '/72'},
    {icone:'fa-dumbbell', label:'Ginásios', valor:jogador.ginasiosVencidos || 0},
    {icone:'fa-medal', label:'Título', valor:jogador.tituloAtual || getTitulo(jogador.nivel).nome},
    {icone:'fa-fire', label:'Maior Seq.', valor:jogador.maiorSequencia || 0},
    {icone:'fa-arrow-trend-up', label:'Evoluções', valor:jogador.totalEvolucoes || 0},
    {icone:'fa-dragon', label:'Gmax', valor:jogador.totalGmax || 0},
    {icone:'fa-star', label:'Mega', valor:jogador.totalMega || 0},
    {icone:'fa-bolt', label:'Lendários Venc.', valor:jogador.lendariosDerrotados || 0},
    {icone:'fa-meteor', label:'Ultra Beasts', valor:jogador.ultraBeastsCapturados || 0},
    {icone:'fa-user-secret', label:'Rocket Derrotados', valor:jogador.rocketDerrotados || 0},
    {icone:'fa-user-ninja', label:'Chefes Rocket', valor:jogador.rocketChefesDerrotados || 0},
    {icone:'fa-key', label:'Chaves Rocket', valor:jogador.chavesRocket || 0},
    {icone:'fa-box-archive', label:'Banco', valor:(jogador.banco || []).length},
    {icone:'fa-landmark', label:'Hall Fama', valor:(jogador.hallFama || []).length},
    {icone:'fa-trophy', label:'Copas', valor:jogador.copasVencidas || 0},
    {icone:'fa-crown', label:'Copas Região', valor:jogador.copasRegiaoVencidas || 0},
    {icone:'fa-globe', label:'Continentais', valor:jogador.copasContinentaisVencidas || 0},
    {icone:'fa-crown', label:'Supercopas', valor:jogador.supercopasVencidas || 0},
    {icone:'fa-medal', label:'Ligas', valor:jogador.ligasVencidas || 0},
    {icone:'fa-right-left', label:'Trocas', valor:(jogador.trocasHistorico || []).length},
    {icone:'fa-list-check', label:'Missões', valor:jogador.missoesCompletas || 0},
    {icone:'fa-wifi', label:'Duelos PvP', valor:(jogador.duelosPvPVencidos || 0) + 'V / ' + (jogador.duelosPvPDerrotas || 0) + 'D'},
    {icone:'fa-trophy', label:'Torneios', valor:jogador.torneiosVencidos || 0},
    {icone:'fa-gift', label:'Presentes', valor:(jogador.presentesEnviados || 0) + ' env / ' + (jogador.presentesRecebidos || 0) + ' rec'}
  ];
  stats.forEach(function(s){
    var div = document.createElement('div');
    div.className = 'stat-card';
    div.innerHTML = '<div class="icone-box"><i class="fas ' + s.icone + '"></i></div>' +
      '<div class="texto"><div class="label">' + s.label + '</div><div class="valor">' + s.valor + '</div></div>';
    cont.appendChild(div);
  });
}

// =============== HALL DA FAMA ===============
function renderHallFama(){
  var cont = document.getElementById('hall-lista');
  if(!cont) return;
  cont.innerHTML = '';
  if(!jogador.hallFama || jogador.hallFama.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;text-align:center;">Nenhum Pokémon no Hall.</p>';
    return;
  }
  var html = '<h3 style="color:var(--cor-titulo);font-size:13px;margin-bottom:15px;">Pokémon Aposentados (' + jogador.hallFama.length + ')</h3>';
  jogador.hallFama.forEach(function(p){
    html += '<div class="item-card" style="margin-bottom:10px;">' +
      '<img src="' + spritePokemon(p.id) + '" style="width:60px;height:60px;image-rendering:pixelated;">' +
      '<div class="item-info"><div class="nome">' + p.nome + '</div>' +
      '<div class="desc">Lvl ' + p.lvl + ' · ' + p.bg + ' BG · ' + p.bp + ' BP</div></div></div>';
  });
  cont.innerHTML = html;
}

// =============== ABRIR DETALHES ===============
async function abrirDetalhesPokemon(pokemon){
  try{
    AudioSFX.clickMenu();
    if(!pokemon.baseStats || !pokemon.baseStats.hp){
      try{ await garantirBaseStats(pokemon); }catch(e){}
    }
    inicializarHP(pokemon);
    var modal = document.getElementById('modal-detalhes');
    var conteudo = document.getElementById('modal-detalhes-conteudo');
    if(!modal || !conteudo) return;
    document.getElementById('modal-detalhes-titulo').textContent = (pokemon.apelido || pokemon.nome);
    var tipoInfo = TIPOS_POKEMON[pokemon.tipo] || {nome:'?', cor:'#888'};
    var botoesEspeciais = '';
    if(pokemon.mega && !pokemon.permanenteMega){
      botoesEspeciais = '<div style="margin-top:15px;"><button style="width:100%;padding:13px;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:8px;background:linear-gradient(135deg,#ffd700,#ff9800);color:#000;font-weight:bold;" onclick="desfazerMegaDoModal(\'' + escaparNome(pokemon.nome) + '\')">Desfazer Mega</button></div>';
    }else if(pokemon.gigantamax && !pokemon.permanente){
      botoesEspeciais = '<div style="margin-top:15px;"><button style="width:100%;padding:13px;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:8px;background:linear-gradient(135deg,#e91e63,#9c27b0);color:#fff;font-weight:bold;" onclick="desfazerGmaxDoModal(\'' + escaparNome(pokemon.nome) + '\')">Desfazer Gmax</button></div>';
    }else{
      var bts = [];
      if(podeMegaEvoluir(pokemon)){
        bts.push('<button style="flex:1;padding:13px;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:8px;background:linear-gradient(135deg,#ffd700,#ff9800);color:#000;font-weight:bold;" onclick="megaEvoluirDoModal(\'' + escaparNome(pokemon.nome) + '\')">Mega</button>');
      }
      if(podeGigantamax(pokemon)){
        bts.push('<button style="flex:1;padding:13px;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:8px;background:linear-gradient(135deg,#e91e63,#9c27b0);color:#fff;font-weight:bold;" onclick="gmaxDoModal(\'' + escaparNome(pokemon.nome) + '\')">Gmax</button>');
      }
      if(bts.length > 0) botoesEspeciais = '<div style="display:flex;gap:10px;margin-top:15px;">' + bts.join('') + '</div>';
    }
    var raridadeTag = (pokemon.raridade && pokemon.raridade !== 'normal') ? '<div style="color:#ff9800;font-size:9px;margin-bottom:6px;">' + pokemon.raridade + '</div>' : '';
    var formaTag = pokemon.forma ? '<div style="color:#2196f3;font-size:9px;margin-bottom:6px;">Forma ' + (NOMES_FORMAS[pokemon.forma] || pokemon.forma) + '</div>' : '';
    var shinyTag = pokemon.shiny ? '<div style="color:#00e5ff;font-size:10px;margin-bottom:6px;font-weight:bold;">✨ SHINY ✨</div>' : '';
    var sexoTag = '';
    if(pokemon.sexo === 'M') sexoTag = '<div style="color:var(--acento-macho);font-size:11px;margin-bottom:6px;font-weight:bold;">♂ Macho</div>';
    else if(pokemon.sexo === 'F') sexoTag = '<div style="color:var(--acento-femea);font-size:11px;margin-bottom:6px;font-weight:bold;">♀ Fêmea</div>';
    else sexoTag = '<div style="color:var(--texto-terciario);font-size:9px;margin-bottom:6px;">Sem sexo</div>';
    var habTag = pokemon.habilidade ? 
      '<span class="habilidade-tag" onclick="mostrarInfoHabilidade(\'' + escaparNome(pokemon.habilidade) + '\')">' +
        '<i class="fas fa-sparkles"></i> ' + pokemon.habilidade +
      '</span>' : '';
    var apelidoHtml =
      '<div style="margin:15px 0;">' +
        '<label style="display:block;font-size:9px;color:var(--acento-amarelo);margin-bottom:8px;">Apelido:</label>' +
        '<input type="text" id="apelido-input" value="' + (pokemon.apelido || '') + '" ' +
          'placeholder="' + pokemon.nome + '" maxlength="12" ' +
          'style="width:100%;background:var(--bg-input);color:var(--texto-principal);border:2px solid var(--borda-secundaria);border-radius:8px;padding:12px;font-family:inherit;font-size:10px;outline:none;">' +
        '<button onclick="salvarApelido(\'' + escaparNome(pokemon.nome) + '\')" ' +
          'style="margin-top:8px;background:linear-gradient(135deg,#2196f3,#0d47a1);color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:9px;width:100%;">' +
          '<i class="fas fa-tag"></i> Salvar Apelido</button>' +
      '</div>';
    var natTag = '';
    if(pokemon.natureza){
      natTag = '<div style="background:rgba(156,39,176,.15);border:2px solid var(--acento-roxo);border-radius:10px;padding:12px;margin:15px 0;text-align:center;">' +
        '<div style="color:var(--acento-roxo);font-size:9px;margin-bottom:6px;font-weight:bold;">Natureza</div>' +
        '<div style="color:var(--texto-principal);font-size:11px;">' + pokemon.natureza.nome + '</div>' +
        '<div style="color:var(--texto-secundario);font-size:8px;">' + pokemon.natureza.desc + '</div></div>';
    }
    var hpAtual = (pokemon.hpAtual !== null && pokemon.hpAtual !== undefined) ? pokemon.hpAtual : (pokemon._hpMax || '—');
    var hpMax = pokemon._hpMax || 1;
    var hpPct = (pokemon.hpAtual !== null && pokemon.hpAtual !== undefined) ? Math.max(0, (pokemon.hpAtual / hpMax) * 100) : 100;
    var hpCor = hpPct > 50 ? '#4caf50' : hpPct > 20 ? '#ff9800' : '#f44336';
    var hpHtml = '<div style="background:rgba(0,0,0,.3);border:2px solid var(--borda-principal);border-radius:10px;padding:12px;margin:15px 0;">' +
      '<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:6px;"><span>HP</span><span>' + hpAtual + ' / ' + hpMax + '</span></div>' +
      '<div style="width:100%;height:14px;background:rgba(0,0,0,.5);border-radius:7px;overflow:hidden;">' +
        '<div style="height:100%;width:' + hpPct + '%;background:' + hpCor + ';"></div></div></div>';
    var statusTag = pokemon.status ? '<div style="margin:15px 0;text-align:center;">' + criarBadgeStatusCard(pokemon.status) + '</div>' : '';
    var itemHtml = '';
    if(pokemon.itemEquipado){
      itemHtml = '<div style="background:rgba(255,203,5,.1);border:2px solid var(--acento-amarelo);border-radius:10px;padding:14px;margin:15px 0;text-align:center;">' +
        '<div style="color:var(--acento-amarelo);font-size:9px;margin-bottom:10px;">Equipado: ' + pokemon.itemEquipado + '</div>' +
        '<button style="background:var(--acento-vermelho);color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:9px;" onclick="desequiparItem(\'' + escaparNome(pokemon.nome) + '\')">Desequipar</button></div>';
    }
    var amizadeAtual = pokemon.amizade || 0;
    var amizadePct = Math.round((amizadeAtual / AMIZADE_MAX) * 100);
    var amizadeHtml = '<div style="margin:15px 0;">' +
      '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--acento-rosa);margin-bottom:6px;"><span>Amizade</span><span>' + amizadeAtual + ' / ' + AMIZADE_MAX + '</span></div>' +
      '<div style="width:100%;height:14px;background:var(--bg-input);border-radius:7px;overflow:hidden;border:2px solid var(--acento-rosa);">' +
        '<div style="height:100%;width:' + amizadePct + '%;background:linear-gradient(90deg,#f48fb1,#e91e63);"></div></div></div>';
    conteudo.innerHTML =
      '<div style="display:flex;gap:15px;align-items:center;margin-bottom:20px;flex-wrap:wrap;">' +
        '<img src="' + spritePokemonAtual(pokemon) + '" style="width:100px;height:100px;image-rendering:pixelated;' + (pokemon.shiny ? 'filter:drop-shadow(0 0 12px #00e5ff);' : '') + '">' +
        '<div style="flex:1;">' +
          '<h3 style="color:var(--cor-titulo);font-size:14px;margin-bottom:8px;">' + (pokemon.apelido || (pokemon.mega && pokemon.nomeMega ? pokemon.nomeMega : pokemon.nome)) + '</h3>' +
          '<div style="color:var(--texto-secundario);font-size:9px;">' + tipoInfo.nome + '</div>' +
          sexoTag + shinyTag + raridadeTag + formaTag + habTag +
        '</div></div>' +
      hpHtml + statusTag + amizadeHtml + natTag + apelidoHtml + itemHtml + botoesEspeciais +
      '<div style="display:flex;justify-content:space-between;padding:13px 5px;border-bottom:1px dashed var(--borda-principal);font-size:10px;"><span>Nível</span><span>' + pokemon.lvl + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:13px 5px;border-bottom:1px dashed var(--borda-principal);font-size:10px;"><span>Batalhas</span><span>' + pokemon.batalhas + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:13px 5px;border-bottom:1px dashed var(--borda-principal);font-size:10px;"><span>Vitórias</span><span>' + pokemon.bg + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:13px 5px;border-bottom:1px dashed var(--borda-principal);font-size:10px;"><span>Derrotas</span><span>' + pokemon.bp + '</span></div>' +
      '<div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">' +
        '<button style="background:linear-gradient(135deg,#2196f3,#0d47a1);color:#fff;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:9px;" onclick="fecharModalDetalhes();abrirTelaPokemonCheia(\'' + escaparNome(pokemon.nome) + '\')">Tela Cheia</button>' +
      '</div>' +
      '<label style="display:block;margin-top:20px;margin-bottom:8px;font-size:9px;color:var(--acento-amarelo);">Notas:</label>' +
      '<textarea id="detalhes-notas-input" style="width:100%;background:var(--bg-input);color:var(--texto-principal);border:2px solid var(--borda-secundaria);border-radius:8px;padding:12px;font-family:inherit;font-size:9px;min-height:90px;resize:vertical;outline:none;">' + (pokemon.notas || '') + '</textarea>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;margin-top:25px;">' +
        '<button style="background:linear-gradient(135deg,#ee1515,#b71c1c);color:#fff;border:none;padding:13px 20px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:9px;" onclick="abandonarPokemon(\'' + escaparNome(pokemon.nome) + '\')">Abandonar (-10 P)</button>' +
        '<button style="background:linear-gradient(135deg,#ffcb05,#ff9800);color:#000;border:none;padding:13px 20px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:9px;font-weight:bold;" onclick="salvarNotasPokemon(\'' + escaparNome(pokemon.nome) + '\')">Salvar Notas</button></div>';
    modal.classList.add('aberto');
  }catch(e){ console.error(e); }
}
function megaEvoluirDoModal(nome){
  var idx = -1;
  for(var i = 0; i < jogador.time.length; i++){
    if(jogador.time[i] && jogador.time[i].nome === nome){ idx = i; break; }
  }
  if(idx === -1) return;
  fecharModalDetalhes();
  megaEvoluir(idx);
}
function gmaxDoModal(nome){
  var idx = -1;
  for(var i = 0; i < jogador.time.length; i++){
    if(jogador.time[i] && jogador.time[i].nome === nome){ idx = i; break; }
  }
  if(idx === -1) return;
  fecharModalDetalhes();
  ativarGigantamax(idx);
}
function desfazerMegaDoModal(nome){
  var idx = -1;
  for(var i = 0; i < jogador.time.length; i++){
    if(jogador.time[i] && jogador.time[i].nome === nome){ idx = i; break; }
  }
  if(idx === -1) return;
  fecharModalDetalhes();
  desfazerMega(idx);
}
function desfazerGmaxDoModal(nome){
  var idx = -1;
  for(var i = 0; i < jogador.time.length; i++){
    if(jogador.time[i] && jogador.time[i].nome === nome){ idx = i; break; }
  }
  if(idx === -1) return;
  fecharModalDetalhes();
  desfazerGigantamax(idx);
}
function fecharModalDetalhes(){
  AudioSFX.clickMenu();
  var el = document.getElementById('modal-detalhes');
  if(el) el.classList.remove('aberto');
}
function salvarNotasPokemon(nome){
  AudioSFX.clickMenu();
  var notasEl = document.getElementById('detalhes-notas-input');
  if(!notasEl) return;
  var notas = notasEl.value;
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var p = todos.find(function(x){ return x.nome === nome; });
  if(p){ p.notas = notas; salvar(); alert('Notas salvas!'); }
}
function abandonarPokemon(nome){
  if(jogador.passaportes < 10){ AudioSFX.erro(); alert('Precisa de 10 passaportes!'); return; }
  if(!confirm('Abandonar ' + nome + '? Gasta 10 passaportes.')) return;
  if(!jogador.hallFama) jogador.hallFama = [];
  var removido = null;
  for(var i = 0; i < jogador.time.length; i++){
    if(jogador.time[i] && jogador.time[i].nome === nome){ removido = jogador.time[i]; jogador.time[i] = null; break; }
  }
  if(!removido){
    var idx = -1;
    for(var j = 0; j < jogador.banco.length; j++){
      if(jogador.banco[j].nome === nome){ idx = j; break; }
    }
    if(idx !== -1) removido = jogador.banco.splice(idx, 1)[0];
  }
  if(!removido){ AudioSFX.erro(); alert('Não encontrado!'); return; }
  removido.abandonadoEm = new Date().toISOString();
  jogador.hallFama.push(removido);
  jogador.passaportes -= 10;
  fecharModalDetalhes();
  salvar();
  atualizarTudo();
  alert(nome + ' foi pro Hall!');
}

// =============== COMPARAR POKÉMON ===============
function abrirModalComparar(){
  AudioSFX.clickMenu();
  var antigo = document.getElementById('modal-escolher-comparar');
  if(antigo) antigo.remove();
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  if(todos.length < 2){ AudioSFX.erro(); alert('Precisa de pelo menos 2 Pokémon!'); return; }
  var modal = document.createElement('div');
  modal.className = 'modal-fundo aberto';
  modal.id = 'modal-escolher-comparar';
  var html = '<div class="modal"><h3>Escolha o 1º Pokémon</h3><div style="max-height:400px;overflow-y:auto;">';
  todos.forEach(function(p, idx){
    html += '<div class="pokemon-opcao" data-idx="' + idx + '">' +
      '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="info"><div class="nome">' + (p.apelido || p.nome) + (p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '') + (p.shiny ? ' ✨' : '') + '</div>' +
      '<div class="lvl">Lvl ' + p.lvl + ' · ' + p.tipo + '</div></div></div>';
  });
  html += '</div><button class="btn-fechar" onclick="fecharModalCompararEscolha()">Cancelar</button></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  modal.querySelectorAll('.pokemon-opcao').forEach(function(el){
    el.onclick = function(){
      var idx = parseInt(el.dataset.idx);
      _compararPokemon1 = todos[idx];
      modal.remove();
      abrirEscolhaSegundoComparar(todos);
    };
  });
}
function fecharModalCompararEscolha(){
  var m = document.getElementById('modal-escolher-comparar');
  if(m) m.remove();
}
function abrirEscolhaSegundoComparar(todos){
  var modal = document.createElement('div');
  modal.className = 'modal-fundo aberto';
  modal.id = 'modal-escolher-comparar';
  var html = '<div class="modal"><h3>Escolha o 2º Pokémon</h3><div style="max-height:400px;overflow-y:auto;">';
  todos.forEach(function(p){
    if(p === _compararPokemon1) return;
    html += '<div class="pokemon-opcao" data-nome="' + p.nome + '">' +
      '<img src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'">' +
      '<div class="info"><div class="nome">' + (p.apelido || p.nome) + (p.sexo === 'M' ? ' ♂' : p.sexo === 'F' ? ' ♀' : '') + (p.shiny ? ' ✨' : '') + '</div>' +
      '<div class="lvl">Lvl ' + p.lvl + ' · ' + p.tipo + '</div></div></div>';
  });
  html += '</div><button class="btn-fechar" onclick="fecharModalCompararEscolha()">Cancelar</button></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  modal.querySelectorAll('.pokemon-opcao').forEach(function(el){
    el.onclick = function(){
      var nome = el.dataset.nome;
      _compararPokemon2 = todos.find(function(x){ return x.nome === nome; });
      modal.remove();
      executarComparacao();
    };
  });
}
async function executarComparacao(){
  if(!_compararPokemon1 || !_compararPokemon2) return;
  AudioSFX.clickMenu();
  var p1 = _compararPokemon1, p2 = _compararPokemon2;
  if(!p1.baseStats || !p1.baseStats.hp){ try{ await garantirBaseStats(p1); }catch(e){} }
  if(!p2.baseStats || !p2.baseStats.hp){ try{ await garantirBaseStats(p2); }catch(e){} }
  var stats1 = calcularStatsCompletos(p1, p1.baseStats);
  var stats2 = calcularStatsCompletos(p2, p2.baseStats);
  var modal = document.getElementById('modal-comparar');
  var cont = document.getElementById('modal-comparar-conteudo');
  if(!modal || !cont) return;
  var statLabels = [
    {key:'hp', lbl:'HP'}, {key:'atk', lbl:'Ataque'}, {key:'def', lbl:'Defesa'},
    {key:'spa', lbl:'Atq. Esp.'}, {key:'spd', lbl:'Def. Esp.'}, {key:'spe', lbl:'Velocidade'}
  ];
  var html = '<div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">' +
    '<div style="flex:1;min-width:200px;text-align:center;background:rgba(33,150,243,.1);border-radius:10px;padding:15px;">' +
      '<img src="' + spritePokemonAtual(p1) + '" style="width:80px;height:80px;image-rendering:pixelated;">' +
      '<div style="color:var(--cor-nome-pokemon);font-size:11px;font-weight:bold;margin-top:8px;">' + (p1.apelido || p1.nome) + '</div>' +
      '<div style="color:var(--texto-secundario);font-size:9px;">Lvl ' + p1.lvl + '</div>' +
    '</div>' +
    '<div style="flex:1;min-width:200px;text-align:center;background:rgba(238,21,21,.1);border-radius:10px;padding:15px;">' +
      '<img src="' + spritePokemonAtual(p2) + '" style="width:80px;height:80px;image-rendering:pixelated;">' +
      '<div style="color:var(--cor-nome-pokemon);font-size:11px;font-weight:bold;margin-top:8px;">' + (p2.apelido || p2.nome) + '</div>' +
      '<div style="color:var(--texto-secundario);font-size:9px;">Lvl ' + p2.lvl + '</div>' +
    '</div></div>';
  statLabels.forEach(function(s){
    var v1 = stats1[s.key];
    var v2 = stats2[s.key];
    var cor1 = v1 > v2 ? '#4caf50' : (v1 < v2 ? '#f44336' : '#888');
    var cor2 = v2 > v1 ? '#4caf50' : (v2 < v1 ? '#f44336' : '#888');
    html += '<div style="display:grid;grid-template-columns:1fr 100px 1fr;gap:10px;align-items:center;padding:10px 0;border-bottom:1px dashed var(--borda-principal);">' +
      '<div style="text-align:right;color:' + cor1 + ';font-size:12px;font-weight:bold;">' + v1 + '</div>' +
      '<div style="text-align:center;font-size:9px;color:var(--texto-secundario);">' + s.lbl + '</div>' +
      '<div style="text-align:left;color:' + cor2 + ';font-size:12px;font-weight:bold;">' + v2 + '</div>' +
    '</div>';
  });
  cont.innerHTML = html;
  modal.classList.add('aberto');
}
function fecharModalComparar(){
  AudioSFX.clickMenu();
  var m = document.getElementById('modal-comparar');
  if(m) m.classList.remove('aberto');
  _compararPokemon1 = null;
  _compararPokemon2 = null;
}

// =============== TELA POKÉMON CHEIA ===============
async function abrirTelaPokemonCheia(nome){
  var todos = jogador.time.filter(Boolean).concat(jogador.banco);
  var p = todos.find(function(x){ return x.nome === nome; });
  if(!p) return;
  AudioSFX.clickMenu();
  var tela = document.getElementById('tela-pokemon-cheia');
  var cont = document.getElementById('tela-pokemon-conteudo');
  if(!tela || !cont) return;
  tela.classList.add('aberta');
  cont.innerHTML = '<p style="text-align:center;color:var(--acento-amarelo);">Carregando...</p>';
  if(!p.baseStats || !p.baseStats.hp){
    try{ p.baseStats = await carregarBaseStats(p.id); }catch(e){}
  }
  inicializarHP(p);
  if(!p.moves){
    mostrarLoading(true);
    try{ p.moves = await carregarMoves(p); }catch(e){}
    mostrarLoading(false);
  }
  var stats = p._stats || calcularStatsCompletos(p, p.baseStats);
  var base = p.baseStats || BASE_STATS_FALLBACK;
  var tipoInfo = TIPOS_POKEMON[p.tipo] || {nome:'?', cor:'#888'};
  var nomeExibir = p.apelido || ((p.mega && p.nomeMega) ? p.nomeMega : p.nome);
  var movesHtml = '';
  if(p.moves && p.moves.length > 0){
    p.moves.forEach(function(mv){
      var tipoFinal = (mv.tipo && TIPOS_POKEMON[mv.tipo]) ? mv.tipo : 'normal';
      var ti = TIPOS_POKEMON[tipoFinal];
      movesHtml += '<div class="move-card">' +
        '<span class="move-tipo" style="background:' + ti.cor + '">' + tipoFinal + '</span>' +
        '<div class="move-nome">' + mv.nome + '</div>' +
        '<div class="move-info">Poder: ' + (mv.poder || '—') + ' · Prec: ' + (mv.precisao || '—') + ' · PP: ' + (mv.ppAtual || mv.pp) + '/' + mv.pp + '</div></div>';
    });
  }else{
    movesHtml = '<p style="color:#888;font-size:9px;grid-column:1/-1;">Sem moves.</p>';
  }
  var statBoxes = [
    {lbl:'HP', v:stats.hp, base:base.hp, cor:'linear-gradient(90deg,#4caf50,#8bc34a)'},
    {lbl:'Ataque', v:stats.atk, base:base.atk, cor:'linear-gradient(90deg,#f44336,#ff9800)'},
    {lbl:'Defesa', v:stats.def, base:base.def, cor:'linear-gradient(90deg,#2196f3,#03a9f4)'},
    {lbl:'Atq. Esp.', v:stats.spa, base:base.spa, cor:'linear-gradient(90deg,#9c27b0,#e91e63)'},
    {lbl:'Def. Esp.', v:stats.spd, base:base.spd, cor:'linear-gradient(90deg,#00bcd4,#4dd0e1)'},
    {lbl:'Velocidade', v:stats.spe, base:base.spe, cor:'linear-gradient(90deg,#ffcb05,#ff9800)'}
  ];
  var statsHtml = '';
  statBoxes.forEach(function(s){
    var pct = Math.min(100, Math.round((s.base / 160) * 100));
    statsHtml += '<div class="stat-box">' +
      '<div class="stat-nome">' + s.lbl + '</div>' +
      '<div class="stat-valor">' + s.v + '</div>' +
      '<div class="stat-barra"><div class="stat-barra-fill" style="width:' + pct + '%;background:' + s.cor + ';"></div></div>' +
      '<div style="font-size:7px;color:var(--texto-terciario);margin-top:4px;">Base: ' + s.base + '</div></div>';
  });
  var sexoTag = p.sexo === 'M' ? ' <span style="color:var(--acento-macho);">♂</span>' : p.sexo === 'F' ? ' <span style="color:var(--acento-femea);">♀</span>' : '';
  var habHtml = p.habilidade ? '<span class="habilidade-tag" onclick="mostrarInfoHabilidade(\'' + escaparNome(p.habilidade) + '\')"><i class="fas fa-sparkles"></i> ' + p.habilidade + '</span>' : '';
  cont.innerHTML =
    '<div class="pokemon-hero">' +
      '<img class="pokemon-hero-img" src="' + spritePokemonAtual(p) + '" onerror="this.src=\'' + spritePokemon(p.id) + '\'" style="' + (p.shiny ? 'filter:drop-shadow(0 0 20px #00e5ff);' : '') + '">' +
      '<div class="pokemon-hero-info">' +
        '<h2 style="color:var(--cor-nome-pokemon);">' + nomeExibir + sexoTag + (p.shiny ? ' ✨' : '') + ' <span style="font-size:12px;color:var(--texto-secundario);">Lvl ' + p.lvl + '</span></h2>' +
        '<div class="tipo-tags"><span class="tipo-tag" style="background:' + tipoInfo.cor + '">' + tipoInfo.nome + '</span></div>' +
        habHtml +
      '</div></div>' +
    '<h3 style="color:var(--acento-amarelo);font-size:12px;margin-top:20px;margin-bottom:10px;">Estatísticas</h3>' +
    '<div class="stats-hexagon">' + statsHtml + '</div>' +
    '<h3 style="color:var(--acento-amarelo);font-size:12px;margin-top:20px;margin-bottom:10px;">Moves</h3>' +
    '<div class="moves-grid">' + movesHtml + '</div>' +
    '<div style="text-align:center;margin-top:25px;">' +
      '<button onclick="fecharTelaPokemonCheia()" style="background:var(--acento-vermelho);color:#fff;border:none;padding:14px 28px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:10px;"><i class="fas fa-times"></i> Fechar</button></div>';
}
function fecharTelaPokemonCheia(){
  var el = document.getElementById('tela-pokemon-cheia');
  if(el) el.classList.remove('aberta');
}

// =============== CARTÃO TREINADOR ===============
function renderCartaoTreinador(){
  var foto = document.getElementById('foto-perfil');
  var placeholder = document.getElementById('foto-placeholder');
  if(jogador.fotoPerfil){
    if(foto){ foto.src = jogador.fotoPerfil; foto.style.display = 'block'; }
    if(placeholder) placeholder.style.display = 'none';
  }else{
    if(foto) foto.style.display = 'none';
    if(placeholder) placeholder.style.display = 'flex';
  }
  var nomeEl = document.getElementById('cartao-nome');
  if(nomeEl) nomeEl.textContent = jogador.nome;
  var tituloBase = getTitulo(jogador.nivel).nome;
  var tituloEl = document.getElementById('cartao-titulo');
  if(tituloEl) tituloEl.innerHTML = '<i class="fas fa-medal"></i> ' + (jogador.tituloAtual || tituloBase);
  var nivelEl = document.getElementById('cartao-nivel');
  if(nivelEl) nivelEl.textContent = jogador.nivel;
  var insEl = document.getElementById('cartao-insignias');
  if(insEl) insEl.textContent = contarInsignias(jogador);
  var favEl = document.getElementById('cartao-favorito');
  if(favEl){
    var fav = jogador.time.filter(Boolean).concat(jogador.banco).find(function(p){ return p.favorito; });
    favEl.textContent = fav ? (fav.apelido || fav.nome) : '-';
  }
  var bgEl = document.getElementById('cartao-bg'); if(bgEl) bgEl.textContent = jogador.bg || 0;
  var capEl = document.getElementById('cartao-capturas'); if(capEl) capEl.textContent = (jogador.capturas || []).length;
  var bancoEl = document.getElementById('cartao-banco'); if(bancoEl) bancoEl.textContent = (jogador.banco || []).length;
  var xpNec = xpNecessarioParaNivel(jogador.nivel + 1);
  var xpPct = Math.min(100, Math.round((jogador.xp / xpNec) * 100));
  var xpBarra = document.getElementById('xp-barra'); if(xpBarra) xpBarra.style.width = xpPct + '%';
  var xpTexto = document.getElementById('xp-texto'); if(xpTexto) xpTexto.textContent = jogador.xp + ' / ' + xpNec;
  var pulseiras = document.getElementById('pulseiras-cantos');
  if(pulseiras){
    pulseiras.innerHTML = '';
    if(jogador.pulseiraMega && jogador.pulseiraMega.usos > 0){
      var pm = document.createElement('div');
      pm.className = 'pulseira-box';
      pm.appendChild(criarImagem(IMG_PULSEIRA_MEGA, '36px', 'Pulseira'));
      pulseiras.appendChild(pm);
    }
    if(jogador.pulseiraGmax && jogador.pulseiraGmax.usos > 0){
      var pg = document.createElement('div');
      pg.className = 'pulseira-box';
      pg.appendChild(criarImagem(IMG_PULSEIRA_GMAX, '36px', 'Pulseira'));
      pulseiras.appendChild(pg);
    }
  }
  var medalhas = document.getElementById('cartao-medalhas');
  if(medalhas){
    medalhas.innerHTML = '';
    var medalhasGanhas = Object.keys(jogador.medalhasGanhas || {});
    if(medalhasGanhas.length === 0){
      medalhas.innerHTML = '<span class="vazio">Sem medalhas</span>';
    }else{
      medalhasGanhas.forEach(function(m){
        var div = document.createElement('div');
        div.className = 'cartao-medalha-item';
        div.appendChild(criarImagem(IMG_MEDALHA, '40px', 'Medalha'));
        medalhas.appendChild(div);
      });
    }
  }
  var cores = {
    azul:'linear-gradient(135deg,#1a3a5c,#0d1f33)', vermelho:'linear-gradient(135deg,#5c1a1a,#330d0d)',
    verde:'linear-gradient(135deg,#1a5c2e,#0d3318)', amarelo:'linear-gradient(135deg,#5c4a1a,#332a0d)',
    roxo:'linear-gradient(135deg,#4a1a5c,#280d33)', ciano:'linear-gradient(135deg,#1a5c5c,#0d3333)',
    rosa:'linear-gradient(135deg,#5c1a4a,#330d28)', preto:'linear-gradient(135deg,#1f1f1f,#0a0a0a)'
  };
  var cartao = document.getElementById('cartao-treinador');
  if(cartao) cartao.style.background = cores[jogador.corCartao] || cores.azul;
}
function escolherCorCartao(cor){
  AudioSFX.clickMenu();
  jogador.corCartao = cor;
  salvar();
  renderCartaoTreinador();
}
function uploadFotoPerfil(event){
  var arq = event.target.files[0];
  if(!arq) return;
  var reader = new FileReader();
  reader.onload = function(e){
    jogador.fotoPerfil = e.target.result;
    salvar();
    renderCartaoTreinador();
  };
  reader.readAsDataURL(arq);
}

// =============== ATUALIZAR STATUS ===============
function atualizarStatus(){
  if(!jogador) return;
  var el;
  el = document.getElementById('nivel-treinador'); if(el) el.textContent = jogador.nivel;
  el = document.getElementById('passaportes'); if(el) el.textContent = Math.floor(jogador.passaportes * 10) / 10;
  el = document.getElementById('pc'); if(el) el.textContent = jogador.pc;
  el = document.getElementById('energia-max'); if(el) el.textContent = jogador.energiaMax || 0;
  el = document.getElementById('nome-treinador-topo'); if(el) el.textContent = jogador.nome;
  el = document.getElementById('perfil-nome'); if(el) el.textContent = jogador.nome;
  el = document.getElementById('perfil-titulo'); if(el) el.textContent = jogador.tituloAtual || getTitulo(jogador.nivel).nome;
  el = document.getElementById('perfil-nivel'); if(el) el.textContent = jogador.nivel;
  el = document.getElementById('perfil-passaportes'); if(el) el.textContent = Math.floor(jogador.passaportes * 10) / 10;
  el = document.getElementById('perfil-pc'); if(el) el.textContent = jogador.pc;
  el = document.getElementById('perfil-energia'); if(el) el.textContent = jogador.energiaMax || 0;
  el = document.getElementById('perfil-bg'); if(el) el.textContent = jogador.bg || 0;
  el = document.getElementById('perfil-bp'); if(el) el.textContent = jogador.bp || 0;
  el = document.getElementById('perfil-modo'); if(el) el.textContent = jogador.modo === 'digital' ? 'Digital' : 'Híbrido';
  renderCartaoTreinador();
}

// =============== ROCKET ABA ===============
function renderRocketAba(){
  var cont = document.getElementById('rocket-conteudo');
  if(!cont) return;
  var hist = jogador.rocketHistorico || [];
  var chaves = jogador.itens['Chave Rocket'] || 0;
  var totalVit = hist.filter(function(h){ return h.resultado === 'Ganhou'; }).length;
  var totalDer = hist.filter(function(h){ return h.resultado === 'Perdeu'; }).length;
  var html = '<div class="copa-hero" style="background:linear-gradient(135deg,rgba(196,30,30,.2),rgba(0,0,0,.4));border-color:#c41e1e;">' +
    '<h2 style="color:#ff6b6b;"><i class="fas fa-user-secret"></i> Equipe Rocket</h2>' +
    '<p style="color:#ffcccc;">' + (jogador.rocketDerrotados || 0) + ' rockets derrotados</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:20px 0;">' +
      '<div class="cartao-stat" style="justify-content:center;background:rgba(0,0,0,.5);"><i class="fas fa-trophy"></i> ' + totalVit + ' V</div>' +
      '<div class="cartao-stat" style="justify-content:center;background:rgba(0,0,0,.5);"><i class="fas fa-skull"></i> ' + totalDer + ' D</div>' +
      '<div class="cartao-stat" style="justify-content:center;background:rgba(0,0,0,.5);"><i class="fas fa-key"></i> ' + chaves + ' Chaves</div>' +
      '<div class="cartao-stat" style="justify-content:center;background:rgba(0,0,0,.5);"><i class="fas fa-crown"></i> ' + (jogador.rocketChefesDerrotados || 0) + ' Chefes</div>' +
    '</div>' +
    (chaves > 0 ? '<button class="btn-grande" style="max-width:100%;background:linear-gradient(135deg,#c41e1e,#8a0000);color:#fff;border-color:#ff6b6b;" onclick="usarChaveRocket()"><i class="fas fa-key"></i> Usar Chave Rocket (' + chaves + ')</button>' : '<p style="color:#888;font-size:9px;">Derrote membros Rocket nas rotas para ganhar Chaves!</p>') +
  '</div>';
  if(hist.length === 0){
    html += '<div class="copa-bloqueada"><h3>Nenhuma batalha Rocket</h3><p style="font-size:10px;">Vá para as rotas! 6% de chance de encontrar a Equipe Rocket.</p></div>';
  }else{
    html += '<h3 style="color:var(--cor-titulo);margin:20px 0 15px;">Histórico Rocket</h3>';
    hist.slice(0, 30).forEach(function(h){
      var div = document.createElement('div');
      div.className = 'historico-item rocket';
      div.innerHTML = '<div class="info"><b>' + h.nome + '</b> — ' + h.resultado + ' — ' + h.regiao + ' — ' + new Date(h.data).toLocaleString('pt-BR') + '</div>';
      html += div.outerHTML;
    });
  }
  cont.innerHTML = html;
}

// =============== TROFÉUS ===============
function renderTrofeus(){
  var resumo = document.getElementById('trofeus-resumo');
  if(resumo){
    var totalT = (jogador.copasVencidas || 0) + (jogador.copasRegiaoVencidas || 0) +
                 (jogador.copasContinentaisVencidas || 0) + (jogador.supercopasVencidas || 0) +
                 (jogador.ligasVencidas || 0);
    var totalM = Object.keys(jogador.medalhasGanhas || {}).length + Object.keys(jogador.medalhasRegiaoGanhas || {}).length;
    resumo.innerHTML = '<h3><i class="fas fa-trophy"></i> Sala de Troféus</h3>' +
      '<div class="contador-grande">' + totalT + ' Troféus · ' + totalM + ' Medalhas</div>';
  }
  var principais = document.getElementById('trofeus-lista');
  if(principais){
    principais.innerHTML = '';
    var lista = [
      {nome:'Troféu da Copa', img:IMG_TROFEU_COPA, ganho:(jogador.copasVencidas || 0) > 0, desc:'Vencer Copa dos Treinadores'},
      {nome:'Troféu da Liga', img:IMG_TROFEU_LIGA, ganho:(jogador.ligasVencidas || 0) > 0, desc:'Vencer a Liga dos Treinadores'}
    ];
    lista.forEach(function(t){
      var div = document.createElement('div');
      div.className = 'trofeu-card ' + (t.ganho ? 'ganho' : 'bloqueado');
      div.innerHTML = '<img class="trofeu-img" src="' + t.img + '" onerror="this.style.display=\'none\'">' +
        '<div class="nome">' + t.nome + '</div><div class="desc">' + t.desc + '</div>';
      principais.appendChild(div);
    });
  }
  var regiaoEl = document.getElementById('trofeus-regiao-lista');
  if(regiaoEl){
    regiaoEl.innerHTML = '';
    NOMES_REGIOES.forEach(function(r){
      var ganho = ((jogador.copasRegiaoPorRegiao || {})[r] || 0) > 0;
      var div = document.createElement('div');
      div.className = 'trofeu-card ' + (ganho ? 'ganho' : 'bloqueado');
      div.innerHTML = '<img class="trofeu-img" src="' + IMG_TROFEUS_REGIAO[r] + '" onerror="this.style.display=\'none\'">' +
        '<div class="nome">Copa de ' + r + '</div>' +
        '<div class="desc">' + (ganho ? 'Vencida' : 'Não vencida') + '</div>';
      regiaoEl.appendChild(div);
    });
  }
  var contEl = document.getElementById('trofeus-continental-lista');
  if(contEl){
    contEl.innerHTML = '';
    var divC = document.createElement('div');
    var contGanho = (jogador.copasContinentaisVencidas || 0) > 0;
    divC.className = 'trofeu-card ' + (contGanho ? 'ganho' : 'bloqueado');
    divC.innerHTML = '<img class="trofeu-img" src="' + IMG_TROFEU_CONTINENTAL + '" onerror="this.style.display=\'none\'">' +
      '<div class="nome">Troféu Continental</div>' +
      '<div class="desc">' + (jogador.copasContinentaisVencidas || 0) + ' vitória(s)</div>';
    contEl.appendChild(divC);
  }
  var supEl = document.getElementById('trofeus-supercopa-lista');
  if(supEl){
    supEl.innerHTML = '';
    var divS = document.createElement('div');
    var supGanho = (jogador.supercopasVencidas || 0) > 0;
    divS.className = 'trofeu-card ' + (supGanho ? 'ganho' : 'bloqueado');
    divS.innerHTML = '<img class="trofeu-img" src="' + IMG_TROFEU_SUPERCOPA + '" onerror="this.style.display=\'none\'">' +
      '<div class="nome">Troféu da Supercopa</div>' +
      '<div class="desc">' + (jogador.supercopasVencidas || 0) + ' vitória(s)</div>';
    supEl.appendChild(divS);
  }
  var medEl = document.getElementById('medalhas-lista');
  if(medEl){
    medEl.innerHTML = '';
    var tipos = ['Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'];
    tipos.forEach(function(t){
      var tem = jogador.medalhasGanhas && jogador.medalhasGanhas[t];
      var div = document.createElement('div');
      div.className = 'trofeu-card ' + (tem ? 'ganho' : 'bloqueado');
      div.innerHTML = '<img class="trofeu-img" src="' + IMG_MEDALHA + '" onerror="this.style.display=\'none\'">' +
        '<div class="nome">Medalha ' + t + '</div>' +
        '<div class="desc">' + (tem ? 'Ganha' : 'Não ganha') + '</div>';
      medEl.appendChild(div);
    });
  }
  var medRegEl = document.getElementById('medalhas-regiao-lista');
  if(medRegEl){
    medRegEl.innerHTML = '';
    NOMES_REGIOES.forEach(function(r){
      var tem = jogador.medalhasRegiaoGanhas && jogador.medalhasRegiaoGanhas[r];
      var div = document.createElement('div');
      div.className = 'trofeu-card ' + (tem ? 'ganho' : 'bloqueado');
      div.innerHTML = '<img class="trofeu-img" src="' + IMG_MEDALHA_REGIAO + '" onerror="this.style.display=\'none\'">' +
        '<div class="nome">Medalha de ' + r + '</div>' +
        '<div class="desc">' + (tem ? 'Ganha' : 'Complete 8 insígnias') + '</div>';
      medRegEl.appendChild(div);
    });
  }
}

// =============== CONQUISTAS ===============
var CONQUISTAS = [
  {id:'captura_1', cat:'Captura', nome:'Primeira Captura', desc:'Capture 1', icone:'fa-circle-dot', check:function(j){ return (j.capturas||[]).length >= 1; }},
  {id:'captura_10', cat:'Captura', nome:'Colecionador', desc:'Capture 10', icone:'fa-boxes', check:function(j){ return (j.capturas||[]).length >= 10; }},
  {id:'captura_50', cat:'Captura', nome:'Mestre Caçador', desc:'Capture 50', icone:'fa-boxes-stacked', check:function(j){ return (j.capturas||[]).length >= 50; }},
  {id:'shiny_1', cat:'Captura', nome:'Cintilante!', desc:'Capture 1 Shiny', icone:'fa-star-of-life', check:function(j){ return (j.shiniesCapturados||0) >= 1; }},
  {id:'shiny_5', cat:'Captura', nome:'Colecionador Shiny', desc:'Capture 5 Shinies', icone:'fa-star', check:function(j){ return (j.shiniesCapturados||0) >= 5; }},
  {id:'ub_1', cat:'Captura', nome:'Caçador de UBs', desc:'Capture 1 Ultra Beast', icone:'fa-meteor', check:function(j){ return (j.ultraBeastsCapturados||0) >= 1; }},
  {id:'vitoria_1', cat:'Batalha', nome:'Primeira Vitória', desc:'Vença 1', icone:'fa-khanda', check:function(j){ return (j.bg||0) >= 1; }},
  {id:'vitoria_10', cat:'Batalha', nome:'Combatente', desc:'Vença 10', icone:'fa-shield-halved', check:function(j){ return (j.bg||0) >= 10; }},
  {id:'vitoria_100', cat:'Batalha', nome:'Veterano', desc:'Vença 100', icone:'fa-crown', check:function(j){ return (j.bg||0) >= 100; }},
  {id:'nivel_10', cat:'Progressão', nome:'Iniciante', desc:'Nível 10', icone:'fa-star', check:function(j){ return j.nivel >= 10; }},
  {id:'nivel_50', cat:'Progressão', nome:'Profissional', desc:'Nível 50', icone:'fa-star-half-stroke', check:function(j){ return j.nivel >= 50; }},
  {id:'nivel_100', cat:'Progressão', nome:'Mestre', desc:'Nível 100', icone:'fa-crown', check:function(j){ return j.nivel >= 100; }},
  {id:'insignia_1', cat:'Insígnias', nome:'Primeira Insígnia', desc:'1 insígnia', icone:'fa-award', check:function(j){ return contarInsignias(j) >= 1; }},
  {id:'insignia_8', cat:'Insígnias', nome:'Campeão de Região', desc:'8 insígnias', icone:'fa-medal', check:function(j){ return contarInsignias(j) >= 8; }},
  {id:'insignia_72', cat:'Insígnias', nome:'Colecionador Supremo', desc:'72 insígnias', icone:'fa-trophy', check:function(j){ return contarInsignias(j) >= 72; }},
  {id:'ginasio_1', cat:'Ginásios', nome:'Primeiro Ginásio', desc:'Vença 1 ginásio', icone:'fa-dumbbell', check:function(j){ return (j.ginasiosVencidos||0) >= 1; }},
  {id:'ginasio_8', cat:'Ginásios', nome:'Campeão de Ginásios', desc:'Vença 8 ginásios', icone:'fa-medal', check:function(j){ return (j.ginasiosVencidos||0) >= 8; }},
  {id:'copa_1', cat:'Especiais', nome:'Primeira Copa', desc:'Vença a Copa', icone:'fa-trophy', check:function(j){ return (j.copasVencidas||0) >= 1; }},
  {id:'copa_region', cat:'Especiais', nome:'Campeão Regional', desc:'Copa de Região', icone:'fa-crown', check:function(j){ return (j.copasRegiaoVencidas||0) >= 1; }},
  {id:'supercopa', cat:'Especiais', nome:'Lenda Suprema', desc:'Supercopa', icone:'fa-crown', check:function(j){ return (j.supercopasVencidas||0) >= 1; }},
  {id:'liga_1', cat:'Especiais', nome:'Campeão da Liga', desc:'Liga', icone:'fa-medal', check:function(j){ return (j.ligasVencidas||0) >= 1; }},
  {id:'evolucao_1', cat:'Colecionador', nome:'Evolução', desc:'Evolua 1', icone:'fa-arrow-trend-up', check:function(j){ return (j.totalEvolucoes||0) >= 1; }},
  {id:'evolucao_10', cat:'Colecionador', nome:'Evolucionista', desc:'Evolua 10', icone:'fa-arrows-spin', check:function(j){ return (j.totalEvolucoes||0) >= 10; }},
  {id:'mega_1', cat:'Especiais', nome:'Mega Evolução', desc:'Use Mega', icone:'fa-star', check:function(j){ return (j.totalMega||0) >= 1; }},
  {id:'gmax_1', cat:'Especiais', nome:'Gigantamax!', desc:'Use Gmax', icone:'fa-dragon', check:function(j){ return (j.totalGmax||0) >= 1; }},
  {id:'lendario_1', cat:'Especiais', nome:'Caçador de Lendários', desc:'Derrote 1', icone:'fa-bolt', check:function(j){ return (j.lendariosDerrotados||0) >= 1; }},
  {id:'rocket_1', cat:'Especiais', nome:'Anti-Rocket', desc:'Derrote 1 Rocket', icone:'fa-user-secret', check:function(j){ return (j.rocketDerrotados||0) >= 1; }},
  {id:'rocket_10', cat:'Especiais', nome:'Caçador de Rockets', desc:'Derrote 10 Rockets', icone:'fa-user-ninja', check:function(j){ return (j.rocketDerrotados||0) >= 10; }},
  {id:'rocket_chefe', cat:'Especiais', nome:'Anti-Giovanni', desc:'Derrote o Chefe Rocket', icone:'fa-crown', check:function(j){ return (j.rocketChefesDerrotados||0) >= 1; }},
  {id:'chave_rocket_1', cat:'Especiais', nome:'Chave Roubada', desc:'Obtenha 1 Chave Rocket', icone:'fa-key', check:function(j){ return (j.chavesRocket||0) >= 1; }},
  {id:'missao_1', cat:'Missões', nome:'Primeira Missão', desc:'Complete 1', icone:'fa-list-check', check:function(j){ return (j.missoesCompletas||0) >= 1; }},
  {id:'missao_10', cat:'Missões', nome:'Dedicado', desc:'Complete 10', icone:'fa-clipboard-check', check:function(j){ return (j.missoesCompletas||0) >= 10; }},
  {id:'pvp_1', cat:'Multiplayer', nome:'Primeiro Duelo', desc:'Vença 1 duelo PvP', icone:'fa-khanda', check:function(j){ return (j.duelosPvPVencidos||0) >= 1; }},
  {id:'pvp_10', cat:'Multiplayer', nome:'Gladiador', desc:'Vença 10 duelos PvP', icone:'fa-shield-halved', check:function(j){ return (j.duelosPvPVencidos||0) >= 10; }},
  {id:'torneio_1', cat:'Multiplayer', nome:'Campeão Online', desc:'Vença 1 torneio', icone:'fa-trophy', check:function(j){ return (j.torneiosVencidos||0) >= 1; }},
  {id:'presente_1', cat:'Multiplayer', nome:'Generoso', desc:'Envie 1 presente', icone:'fa-gift', check:function(j){ return (j.presentesEnviados||0) >= 1; }},
  {id:'presente_10', cat:'Multiplayer', nome:'Amigo Fiel', desc:'Envie 10 presentes', icone:'fa-hand-holding-heart', check:function(j){ return (j.presentesEnviados||0) >= 10; }},
  {id:'apelido_1', cat:'Colecionador', nome:'Apelidado', desc:'Dê apelido a 1 Pokémon', icone:'fa-tag', check:function(j){
    var todos = (j.time||[]).filter(Boolean).concat(j.banco||[]);
    return todos.some(function(p){ return p.apelido; });
  }}
];
function verificarConquistas(){
  if(!jogador) return;
  if(_conquistasDebounce) clearTimeout(_conquistasDebounce);
  _conquistasDebounce = setTimeout(function(){
    if(!jogador.conquistasDesbloqueadas) jogador.conquistasDesbloqueadas = [];
    var novas = [];
    CONQUISTAS.forEach(function(c){
      if(jogador.conquistasDesbloqueadas.indexOf(c.id) !== -1) return;
      try{
        if(c.check(jogador)){
          jogador.conquistasDesbloqueadas.push(c.id);
          novas.push(c);
        }
      }catch(e){}
    });
    if(novas.length > 0){
      novas.forEach(function(c, i){
        setTimeout(function(){
          mostrarToastConquista(c);
          darXP(XP_ACOES.conquista, 'Conquista: ' + c.nome);
        }, i * 1800);
      });
      salvar();
    }
  }, 500);
}
function renderConquistas(){
  var cont = document.getElementById('conquistas-lista');
  if(!cont) return;
  cont.innerHTML = '';
  if(!jogador.conquistasDesbloqueadas) jogador.conquistasDesbloqueadas = [];
  var cats = ['Todas'].concat(Array.from(new Set(CONQUISTAS.map(function(c){ return c.cat; }))));
  var filtros = document.getElementById('conquistas-filtros');
  if(filtros){
    filtros.innerHTML = '';
    cats.forEach(function(cat){
      var btn = document.createElement('button');
      btn.className = 'conquista-filtro' + (filtroConquistaAtual === cat ? ' ativo' : '');
      btn.textContent = cat;
      btn.onclick = function(){ AudioSFX.clickMenu(); filtroConquistaAtual = cat; renderConquistas(); };
      filtros.appendChild(btn);
    });
  }
  CONQUISTAS.filter(function(c){ return filtroConquistaAtual === 'Todas' || c.cat === filtroConquistaAtual; })
    .forEach(function(c){
      var desbloqueada = jogador.conquistasDesbloqueadas.indexOf(c.id) !== -1;
      var div = document.createElement('div');
      div.className = 'conquista-card' + (desbloqueada ? ' desbloqueada' : '');
      div.innerHTML = '<div class="categoria-tag">' + c.cat + '</div>' +
        '<div class="icone-box"><i class="fas ' + c.icone + '"></i></div>' +
        '<div class="nome">' + c.nome + '</div>' +
        '<div class="desc">' + c.desc + '</div>' +
        (desbloqueada ? '<span class="xp-tag">+100 XP</span>' : '');
      cont.appendChild(div);
    });
}
function abrirModalConquistas(){
  AudioSFX.clickMenu();
  var cont = document.getElementById('modal-conquistas-conteudo');
  if(!cont) return;
  cont.innerHTML = '';
  var desbloqueadas = CONQUISTAS.filter(function(c){
    return (jogador.conquistasDesbloqueadas || []).indexOf(c.id) !== -1;
  });
  if(desbloqueadas.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;text-align:center;grid-column:1/-1;">Nenhuma conquista.</p>';
  }else{
    desbloqueadas.forEach(function(c){
      var div = document.createElement('div');
      div.className = 'conquista-card desbloqueada';
      div.innerHTML = '<div class="categoria-tag">' + c.cat + '</div>' +
        '<div class="icone-box"><i class="fas ' + c.icone + '"></i></div>' +
        '<div class="nome">' + c.nome + '</div><div class="desc">' + c.desc + '</div>';
      cont.appendChild(div);
    });
  }
  abrirModal('modal-conquistas-perfil');
}
function fecharModalConquistas(){ AudioSFX.clickMenu(); fecharModal('modal-conquistas-perfil'); }
function abrirModalTitulos(){
  AudioSFX.clickMenu();
  var tituloBase = getTitulo(jogador.nivel).nome;
  var titulosDisponiveis = [tituloBase];
  NOMES_REGIOES.forEach(function(r){
    var total = INSIGNIAS[r].length;
    var ganhas = (jogador.insignias[r] || []).filter(function(x){ return x; }).length;
    if(ganhas >= total) titulosDisponiveis.push('Campeão de ' + r);
  });
  if((jogador.copasContinentaisVencidas||0) >= 1) titulosDisponiveis.push('Campeão Continental');
  if((jogador.supercopasVencidas||0) >= 1) titulosDisponiveis.push('Lenda Suprema');
  if(contarInsignias(jogador) >= 72) titulosDisponiveis.push('Lenda Absoluta');
  var antigo = document.getElementById('modal-titulos');
  if(antigo) antigo.remove();
  var modal = document.createElement('div');
  modal.className = 'modal-fundo aberto';
  modal.id = 'modal-titulos';
  var html = '<div class="modal"><h3><i class="fas fa-medal"></i> Títulos</h3>';
  html += '<p style="color:var(--texto-secundario);font-size:9px;margin-bottom:15px;">Atual: <b style="color:var(--acento-amarelo);">' + (jogador.tituloAtual || tituloBase) + '</b></p>';
  html += '<div style="max-height:400px;overflow-y:auto;">';
  titulosDisponiveis.forEach(function(t){
    var ativo = (jogador.tituloAtual || tituloBase) === t;
    html += '<div class="pokemon-opcao" data-titulo="' + t + '" style="' + (ativo ? 'border-color:var(--acento-amarelo);background:rgba(255,203,5,.1);' : '') + '">' +
      '<i class="fas fa-medal" style="font-size:32px;color:var(--acento-amarelo);width:48px;text-align:center;"></i>' +
      '<div class="info"><div class="nome">' + t + '</div>' +
      (ativo ? '<div class="lvl" style="color:#4caf50;">Equipado</div>' : '<div class="lvl">Clique para equipar</div>') +
      '</div></div>';
  });
  html += '</div><button class="btn-fechar" onclick="fecharModalTitulos()">Fechar</button></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  modal.querySelectorAll('.pokemon-opcao').forEach(function(el){
    el.onclick = function(){
      jogador.tituloAtual = el.dataset.titulo;
      salvar();
      fecharModalTitulos();
      atualizarStatus();
    };
  });
}
function fecharModalTitulos(){
  var m = document.getElementById('modal-titulos');
  if(m) m.remove();
}

// =============== MISSÕES ===============
var MISSOES_POOL = [
  {id:'batalhas_3', icone:'fa-khanda', nome:'Vencer 3 batalhas', desc:'3 vitórias hoje', meta:3, tipo:'batalhas', xp:150, pc:20},
  {id:'batalhas_5', icone:'fa-fire', nome:'Vencer 5 batalhas', desc:'5 vitórias hoje', meta:5, tipo:'batalhas', xp:250, pc:35},
  {id:'batalhas_10', icone:'fa-crown', nome:'Vencer 10 batalhas', desc:'10 vitórias hoje', meta:10, tipo:'batalhas', xp:500, pc:60},
  {id:'capturas_3', icone:'fa-circle-dot', nome:'Capturar 3 Pokémon', desc:'3 capturas hoje', meta:3, tipo:'capturas', xp:200, pc:25},
  {id:'capturas_5', icone:'fa-boxes', nome:'Capturar 5 Pokémon', desc:'5 capturas hoje', meta:5, tipo:'capturas', xp:350, pc:40},
  {id:'capturas_10', icone:'fa-boxes-stacked', nome:'Capturar 10 Pokémon', desc:'10 capturas hoje', meta:10, tipo:'capturas', xp:600, pc:70},
  {id:'evoluir_1', icone:'fa-arrow-trend-up', nome:'Evoluir 1 Pokémon', desc:'1 evolução hoje', meta:1, tipo:'evolucoes', xp:150, pc:20},
  {id:'evoluir_3', icone:'fa-arrows-spin', nome:'Evoluir 3 Pokémon', desc:'3 evoluções hoje', meta:3, tipo:'evolucoes', xp:400, pc:50},
  {id:'mega_1', icone:'fa-star', nome:'Mega Evoluir 1', desc:'1 Mega hoje', meta:1, tipo:'mega', xp:200, pc:25},
  {id:'mega_3', icone:'fa-gem', nome:'Mega Evoluir 3', desc:'3 Megas hoje', meta:3, tipo:'mega', xp:500, pc:60},
  {id:'comprar_2', icone:'fa-cart-shopping', nome:'Comprar 2 itens', desc:'2 compras hoje', meta:2, tipo:'compras', xp:100, pc:15},
  {id:'comprar_5', icone:'fa-sack-dollar', nome:'Comprar 5 itens', desc:'5 compras hoje', meta:5, tipo:'compras', xp:250, pc:35},
  {id:'rocket_1', icone:'fa-user-secret', nome:'Derrotar 1 Rocket', desc:'1 Rocket hoje', meta:1, tipo:'rocket', xp:300, pc:40},
  {id:'rocket_3', icone:'fa-user-ninja', nome:'Derrotar 3 Rockets', desc:'3 Rockets hoje', meta:3, tipo:'rocket', xp:800, pc:100}
];
function gerarMissoesDiarias(){
  if(!jogador) return;
  var hoje = new Date().toISOString().split('T')[0];
  if(jogador.missoesData === hoje && jogador.missoesDiarias && jogador.missoesDiarias.length >= 10) return;
  var pool = shuffleArray(MISSOES_POOL).slice(0, 10);
  jogador.missoesDiarias = pool.map(function(m){
    return {id:m.id, icone:m.icone, nome:m.nome, desc:m.desc, meta:m.meta, tipo:m.tipo, xp:m.xp, pc:m.pc, progresso:0, completo:false};
  });
  jogador.missoesData = hoje;
  jogador.contadoresDiarios = {batalhas:0, capturas:0, evolucoes:0, mega:0, compras:0, rocket:0};
  salvar();
}
function verificarMissoes(){
  if(!jogador.missoesDiarias) return;
  var mudou = false;
  jogador.missoesDiarias.forEach(function(m){
    if(m.completo) return;
    m.progresso = (jogador.contadoresDiarios && jogador.contadoresDiarios[m.tipo]) || 0;
    if(m.progresso >= m.meta && !m.completo){
      m.completo = true;
      mudou = true;
      darXP(m.xp, 'Missão: ' + m.nome);
      jogador.pc += m.pc;
      jogador.missoesCompletas = (jogador.missoesCompletas || 0) + 1;
      setTimeout(function(){
        mostrarToastNotificacao('Missão Completa!', m.nome + ' — +' + m.xp + ' XP, +' + m.pc + ' PC');
      }, 300);
    }
  });
  if(mudou) salvar();
}
function renderMissoes(){
  var cont = document.getElementById('missoes-lista');
  if(!cont) return;
  gerarMissoesDiarias();
  cont.innerHTML = '';
  if(!jogador.missoesDiarias || jogador.missoesDiarias.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;text-align:center;">Nenhuma missão.</p>';
    return;
  }
  jogador.missoesDiarias.forEach(function(m){
    if(!m.completo) m.progresso = (jogador.contadoresDiarios && jogador.contadoresDiarios[m.tipo]) || 0;
  });
  var completas = jogador.missoesDiarias.filter(function(m){ return m.completo; }).length;
  cont.innerHTML = '<div class="trofeus-resumo" style="margin-bottom:20px;">' +
    '<h3><i class="fas fa-list-check"></i> Progresso Diário</h3>' +
    '<div class="contador-grande">' + completas + ' / ' + jogador.missoesDiarias.length + '</div>' +
    '<p style="color:var(--texto-secundario);font-size:9px;">Renova em ' + horasAteMeiaNoite() + 'h</p></div>';
  jogador.missoesDiarias.forEach(function(m){
    var pct = Math.min(100, Math.round((m.progresso / m.meta) * 100));
    var div = document.createElement('div');
    div.className = 'missao-card ' + (m.completo ? 'completa' : '');
    div.innerHTML = '<div class="missao-icone"><i class="fas ' + m.icone + '"></i></div>' +
      '<div class="missao-info">' +
        '<div class="missao-nome">' + (m.completo ? '<i class="fas fa-check"></i> ' : '') + m.nome + '</div>' +
        '<div class="missao-desc">' + m.desc + '</div>' +
        '<div class="missao-progresso"><div class="preenchimento" style="width:' + pct + '%"></div></div>' +
        '<div style="font-size:8px;color:var(--texto-terciario);margin-top:4px;">' + m.progresso + ' / ' + m.meta + '</div>' +
      '</div>' +
      '<div class="missao-recompensa">+' + m.xp + ' XP<br>+' + m.pc + ' PC</div>';
    cont.appendChild(div);
  });
}
function horasAteMeiaNoite(){
  var agora = new Date();
  var meiaNoite = new Date(agora);
  meiaNoite.setHours(24, 0, 0, 0);
  return Math.floor((meiaNoite - agora) / 3600000);
}

// =============== DUELO MANUAL ===============
function carregarJogadoresDuelo(){
  var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
  var sel1 = document.getElementById('duelo-j1');
  var sel2 = document.getElementById('duelo-j2');
  if(!sel1 || !sel2) return;
  var v1 = sel1.value, v2 = sel2.value;
  sel1.innerHTML = ''; sel2.innerHTML = '';
  jogadores.forEach(function(nome){
    var o1 = document.createElement('option'); o1.value = nome; o1.textContent = nome; sel1.appendChild(o1);
    var o2 = document.createElement('option'); o2.value = nome; o2.textContent = nome; sel2.appendChild(o2);
  });
  if(v1) sel1.value = v1;
  if(v2) sel2.value = v2;
  else if(jogadores.length >= 2) sel2.value = jogadores[1];
  atualizarDueloNomes();
  atualizarDueloMVPs();
}
function atualizarDueloNomes(){
  var sel1 = document.getElementById('duelo-j1'), sel2 = document.getElementById('duelo-j2');
  if(!sel1 || !sel2) return;
  var j1 = sel1.value, j2 = sel2.value;
  var d1 = JSON.parse(localStorage.getItem('jogador_' + j1) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + j2) || 'null');
  var n1 = document.getElementById('duelo-nome1'); var n2 = document.getElementById('duelo-nome2');
  var nv1 = document.getElementById('duelo-nivel1'); var nv2 = document.getElementById('duelo-nivel2');
  if(n1) n1.textContent = j1 || '-';
  if(n2) n2.textContent = j2 || '-';
  if(nv1) nv1.textContent = d1 ? 'Nível ' + (d1.nivel || 0) : 'Sem save';
  if(nv2) nv2.textContent = d2 ? 'Nível ' + (d2.nivel || 0) : 'Sem save';
}
function atualizarDueloMVPs(){
  var sel1 = document.getElementById('duelo-j1'), sel2 = document.getElementById('duelo-j2');
  if(!sel1 || !sel2) return;
  var d1 = JSON.parse(localStorage.getItem('jogador_' + sel1.value) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + sel2.value) || 'null');
  var msel1 = document.getElementById('duelo-mvp1'), msel2 = document.getElementById('duelo-mvp2');
  if(!msel1 || !msel2) return;
  msel1.innerHTML = '<option value="">MVP Jogador 1</option>';
  msel2.innerHTML = '<option value="">MVP Jogador 2</option>';
  var popular = function(sel, dados){
    if(!dados) return;
    (dados.time || []).forEach(function(p){
      if(p){ var o = document.createElement('option'); o.value = p.nome; o.textContent = (p.apelido || p.nome) + ' (Lvl ' + p.lvl + ')'; sel.appendChild(o); }
    });
  };
  popular(msel1, d1); popular(msel2, d2);
}
function resolverDuelo(vencedor){
  var sel1 = document.getElementById('duelo-j1'), sel2 = document.getElementById('duelo-j2');
  if(!sel1 || !sel2) return;
  var j1 = sel1.value, j2 = sel2.value;
  if(!j1 || !j2){ AudioSFX.erro(); alert('Selecione 2 jogadores!'); return; }
  if(j1 === j2){ AudioSFX.erro(); alert('Diferentes!'); return; }
  var d1 = JSON.parse(localStorage.getItem('jogador_' + j1) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + j2) || 'null');
  if(!d1 || !d2){ AudioSFX.erro(); alert('Um não tem save!'); return; }
  var mvp1 = document.getElementById('duelo-mvp1').value || '-';
  var mvp2 = document.getElementById('duelo-mvp2').value || '-';
  var nomeVencedor = vencedor === 1 ? j1 : j2;
  var nomePerdedor = vencedor === 1 ? j2 : j1;
  AudioSFX.batalhaVitoria();
  var registro = {
    id:Date.now(), jogador1:j1, jogador2:j2,
    vencedor:nomeVencedor, perdedor:nomePerdedor,
    mvp1:mvp1, mvp2:mvp2, data:new Date().toISOString()
  };
  if(!d1.duelosHistorico) d1.duelosHistorico = [];
  if(!d2.duelosHistorico) d2.duelosHistorico = [];
  d1.duelosHistorico.unshift(registro);
  d2.duelosHistorico.unshift(registro);
  if(vencedor === 1) d1.duelosVencidos = (d1.duelosVencidos || 0) + 1;
  else d2.duelosVencidos = (d2.duelosVencidos || 0) + 1;
  localStorage.setItem('jogador_' + j1, JSON.stringify(d1));
  localStorage.setItem('jogador_' + j2, JSON.stringify(d2));
  if(jogador && nomeAtual){
    if(nomeAtual === j1) jogador = d1;
    else if(nomeAtual === j2) jogador = d2;
  }
  renderDueloHistorico();
  alert(nomeVencedor + ' venceu!');
}
function renderDueloHistorico(){
  var cont = document.getElementById('duelo-historico');
  if(!cont) return;
  cont.innerHTML = '';
  var hist = jogador.duelosHistorico || [];
  if(hist.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhum duelo.</p>';
    return;
  }
  hist.slice(0, 20).forEach(function(d){
    var div = document.createElement('div');
    div.className = 'duelo-hist-item';
    var modoTxt = d.modo === 'digital' ? ' <i class="fas fa-gamepad" style="color:#00bcd4;"></i>' : '';
    div.innerHTML = '<div class="info"><div>' + d.vencedor + ' venceu ' + d.perdedor + modoTxt + '</div></div>';
    var btn = document.createElement('button');
    btn.className = 'btn-x';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    btn.onclick = function(){
      if(!confirm('Apagar?')) return;
      jogador.duelosHistorico = jogador.duelosHistorico.filter(function(x){ return x.id !== d.id; });
      salvar();
      renderDueloHistorico();
    };
    div.appendChild(btn);
    cont.appendChild(div);
  });
}
async function iniciarDueloDigital(){
  var sel1 = document.getElementById('duelo-j1'), sel2 = document.getElementById('duelo-j2');
  if(!sel1 || !sel2) return;
  var j1 = sel1.value, j2 = sel2.value;
  if(!j1 || !j2){ AudioSFX.erro(); alert('Selecione 2 jogadores!'); return; }
  if(j1 === j2){ AudioSFX.erro(); alert('Diferentes!'); return; }
  var d1 = JSON.parse(localStorage.getItem('jogador_' + j1) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + j2) || 'null');
  if(!d1 || !d2){ AudioSFX.erro(); alert('Um não tem save!'); return; }
  var time1 = (d1.time || []).filter(Boolean);
  var time2 = (d2.time || []).filter(Boolean);
  if(time1.length === 0 || time2.length === 0){ AudioSFX.erro(); alert('Um jogador não tem Pokémon!'); return; }
  var meuLado = null;
  if(nomeAtual === j1) meuLado = 1;
  else if(nomeAtual === j2) meuLado = 2;
  else{ AudioSFX.erro(); alert('Você precisa ser um dos jogadores!'); return; }
  var meuTime = meuLado === 1 ? time1 : time2;
  var advTime = meuLado === 1 ? time2 : time1;
  var meuNome = meuLado === 1 ? j1 : j2;
  var advNome = meuLado === 1 ? j2 : j1;
  var timeInimigo = [];
  for(var i = 0; i < advTime.length; i++){
    var p = JSON.parse(JSON.stringify(advTime[i]));
    if(!p.baseStats || !p.baseStats.hp){
      try{ p.baseStats = await carregarBaseStats(p.id); }catch(e){}
    }
    p.hpAtual = null;
    p.status = null;
    p.boosts = {};
    inicializarHP(p);
    timeInimigo.push(p);
  }
  for(var j = 0; j < meuTime.length; j++){
    if(!meuTime[j].baseStats || !meuTime[j].baseStats.hp){
      try{ meuTime[j].baseStats = await carregarBaseStats(meuTime[j].id); }catch(e){}
    }
    inicializarHP(meuTime[j]);
  }
  var rota = {
    id:'duelo-' + Date.now(), nome:'Duelo: ' + meuNome + ' vs ' + advNome,
    bg:'gymPurple', minLvl:50, maxLvl:100, tipos:['normal'], chanceTreinador:1
  };
  var treinador = {nome:advNome, sprite:spriteTreinador('Red'), regiao:'Kanto', time:[], recompensa:{pc:20, pass:2}};
  _batalha = {
    tipo:'treinador', rota:rota, regiao:'Kanto',
    treinador:treinador, meuTime:meuTime, indiceMeu:0,
    timeInimigo:timeInimigo, indiceInimigo:0,
    turno:0, bloqueado:false, log:[],
    isDuelo:true, vencedorDuelo:meuLado
  };
  document.getElementById('tela-batalha').classList.add('aberta');
  var arena = document.getElementById('arena-batalha');
  if(arena){
    var bgUrl = BATTLE_BG_URLS[rota.bg] || BATTLE_BG_URLS.default;
    arena.style.backgroundImage = 'url(' + bgUrl + ')';
  }
  AudioSFX.batalhaInicio();
  AudioSFX.batalhaTema('treinador');
  renderBatalha();
  addLog('Duelo: ' + meuNome + ' vs ' + advNome + '!');
}
function finalizarDueloDigital(ladoVencedor){
  if(!nomeAtual) return;
  var sel1 = document.getElementById('duelo-j1'), sel2 = document.getElementById('duelo-j2');
  if(!sel1 || !sel2) return;
  var j1 = sel1.value, j2 = sel2.value;
  var d1 = JSON.parse(localStorage.getItem('jogador_' + j1) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + j2) || 'null');
  if(!d1 || !d2) return;
  var nomeVencedor = ladoVencedor === 1 ? j1 : j2;
  var nomePerdedor = ladoVencedor === 1 ? j2 : j1;
  var registro = {
    id:Date.now(), jogador1:j1, jogador2:j2,
    vencedor:nomeVencedor, perdedor:nomePerdedor,
    modo:'digital', data:new Date().toISOString()
  };
  if(!d1.duelosHistorico) d1.duelosHistorico = [];
  if(!d2.duelosHistorico) d2.duelosHistorico = [];
  d1.duelosHistorico.unshift(registro);
  d2.duelosHistorico.unshift(registro);
  if(ladoVencedor === 1) d1.duelosVencidos = (d1.duelosVencidos || 0) + 1;
  else d2.duelosVencidos = (d2.duelosVencidos || 0) + 1;
  localStorage.setItem('jogador_' + j1, JSON.stringify(d1));
  localStorage.setItem('jogador_' + j2, JSON.stringify(d2));
  if(jogador && nomeAtual){
    if(nomeAtual === j1) jogador = d1;
    else if(nomeAtual === j2) jogador = d2;
  }
  renderDueloHistorico();
}

// =============== TROCA ===============
function carregarJogadoresTroca(){
  var jogadores = JSON.parse(localStorage.getItem('listaJogadores') || '[]');
  var sel1 = document.getElementById('troca-j1'), sel2 = document.getElementById('troca-j2');
  if(!sel1 || !sel2) return;
  var v1 = sel1.value, v2 = sel2.value;
  sel1.innerHTML = ''; sel2.innerHTML = '';
  jogadores.forEach(function(nome){
    var o1 = document.createElement('option'); o1.value = nome; o1.textContent = nome; sel1.appendChild(o1);
    var o2 = document.createElement('option'); o2.value = nome; o2.textContent = nome; sel2.appendChild(o2);
  });
  if(v1) sel1.value = v1;
  if(v2) sel2.value = v2;
  else if(jogadores.length >= 2) sel2.value = jogadores[1];
  atualizarTrocaPokemons();
}
function atualizarTrocaPokemons(){
  var sel1 = document.getElementById('troca-j1'), sel2 = document.getElementById('troca-j2');
  if(!sel1 || !sel2) return;
  var d1 = JSON.parse(localStorage.getItem('jogador_' + sel1.value) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + sel2.value) || 'null');
  var psel1 = document.getElementById('troca-pokemon1'), psel2 = document.getElementById('troca-pokemon2');
  if(!psel1 || !psel2) return;
  psel1.innerHTML = '<option value="">Escolha um Pokémon</option>';
  psel2.innerHTML = '<option value="">Escolha um Pokémon</option>';
  var popular = function(sel, dados){
    if(!dados) return;
    var todos = (dados.time || []).filter(Boolean).concat(dados.banco || []);
    todos.forEach(function(p){
      var o = document.createElement('option');
      o.value = p.nome;
      o.textContent = (p.apelido || p.nome) + ' (Lvl ' + p.lvl + ')' + (p.trocado ? ' [JA TROCADO]' : '');
      if(p.trocado) o.disabled = true;
      sel.appendChild(o);
    });
  };
  popular(psel1, d1); popular(psel2, d2);
}
async function confirmarTroca(){
  var sel1 = document.getElementById('troca-j1'), sel2 = document.getElementById('troca-j2');
  if(!sel1 || !sel2) return;
  var j1 = sel1.value, j2 = sel2.value;
  if(!j1 || !j2){ AudioSFX.erro(); alert('Selecione 2 jogadores!'); return; }
  if(j1 === j2){ AudioSFX.erro(); alert('Diferentes!'); return; }
  var p1Nome = document.getElementById('troca-pokemon1').value;
  var p2Nome = document.getElementById('troca-pokemon2').value;
  if(!p1Nome || !p2Nome){ AudioSFX.erro(); alert('Escolha Pokémon!'); return; }
  var d1 = JSON.parse(localStorage.getItem('jogador_' + j1) || 'null');
  var d2 = JSON.parse(localStorage.getItem('jogador_' + j2) || 'null');
  if(!d1 || !d2){ AudioSFX.erro(); alert('Um não tem save!'); return; }
  if(!d1.time) d1.time = [null,null,null,null,null,null];
  if(!d2.time) d2.time = [null,null,null,null,null,null];
  if(!d1.banco) d1.banco = []; if(!d2.banco) d2.banco = [];
  var todos1 = d1.time.filter(Boolean).concat(d1.banco);
  var todos2 = d2.time.filter(Boolean).concat(d2.banco);
  var p1 = todos1.find(function(p){ return p.nome === p1Nome; });
  var p2 = todos2.find(function(p){ return p.nome === p2Nome; });
  if(!p1 || !p2){ AudioSFX.erro(); alert('Não encontrado!'); return; }
  if(p1.trocado || p2.trocado){ AudioSFX.erro(); alert('Já foi trocado!'); return; }
  if(!confirm('Trocar ' + p1.nome + ' por ' + p2.nome + '?')) return;
  AudioSFX.troca();
  var idx = -1;
  for(var a = 0; a < d1.time.length; a++){ if(d1.time[a] && d1.time[a].nome === p1Nome){ idx = a; break; } }
  if(idx !== -1) d1.time[idx] = null;
  else{ idx = -1; for(var b = 0; b < d1.banco.length; b++){ if(d1.banco[b].nome === p1Nome){ idx = b; break; } } if(idx !== -1) d1.banco.splice(idx, 1); }
  idx = -1;
  for(var c = 0; c < d2.time.length; c++){ if(d2.time[c] && d2.time[c].nome === p2Nome){ idx = c; break; } }
  if(idx !== -1) d2.time[idx] = null;
  else{ idx = -1; for(var e = 0; e < d2.banco.length; e++){ if(d2.banco[e].nome === p2Nome){ idx = e; break; } } if(idx !== -1) d2.banco.splice(idx, 1); }
  p1.trocado = true;
  p2.trocado = true;
  if(EVOLUCOES_TROCA && EVOLUCOES_TROCA[p1.nome]){
    try{ var nv1 = await buscarPokemon(EVOLUCOES_TROCA[p1.nome]); p1.id = nv1.id; p1.nome = nv1.nome; p1.tipo = nv1.tipo; p1.baseStats = nv1.baseStats || await carregarBaseStats(nv1.id); }catch(e){}
  }
  if(EVOLUCOES_TROCA && EVOLUCOES_TROCA[p2.nome]){
    try{ var nv2 = await buscarPokemon(EVOLUCOES_TROCA[p2.nome]); p2.id = nv2.id; p2.nome = nv2.nome; p2.tipo = nv2.tipo; p2.baseStats = nv2.baseStats || await carregarBaseStats(nv2.id); }catch(e){}
  }
  var idxV1 = d1.time.indexOf(null);
  if(idxV1 !== -1) d1.time[idxV1] = p2; else d1.banco.push(p2);
  var idxV2 = d2.time.indexOf(null);
  if(idxV2 !== -1) d2.time[idxV2] = p1; else d2.banco.push(p1);
  var registro = {
    id:Date.now(), jogador1:j1, jogador2:j2,
    pokemon1:p1.nome, pokemon2:p2.nome, data:new Date().toISOString()
  };
  if(!d1.trocasHistorico) d1.trocasHistorico = [];
  if(!d2.trocasHistorico) d2.trocasHistorico = [];
  d1.trocasHistorico.unshift(registro);
  d2.trocasHistorico.unshift(registro);
  localStorage.setItem('jogador_' + j1, JSON.stringify(d1));
  localStorage.setItem('jogador_' + j2, JSON.stringify(d2));
  if(jogador && nomeAtual){
    if(nomeAtual === j1) jogador = d1;
    else if(nomeAtual === j2) jogador = d2;
  }
  atualizarTrocaPokemons();
  renderTrocaHistorico();
  atualizarStatus();
  renderTime();
  renderBanco();
  salvar();
  alert('Troca realizada!');
}
function renderTrocaHistorico(){
  var cont = document.getElementById('troca-historico');
  if(!cont) return;
  cont.innerHTML = '';
  var hist = jogador.trocasHistorico || [];
  if(hist.length === 0){
    cont.innerHTML = '<p style="color:#888;font-size:10px;">Nenhuma troca.</p>';
    return;
  }
  hist.slice(0, 20).forEach(function(t){
    var div = document.createElement('div');
    div.className = 'troca-hist-item';
    div.innerHTML = '<div class="info">' +
      '<div style="color:var(--acento-amarelo);font-size:10px;">' + t.jogador1 + ' ↔ ' + t.jogador2 + '</div>' +
      '<div style="font-size:8px;">' + t.pokemon1 + ' ↔ ' + t.pokemon2 + '</div></div>';
    var btn = document.createElement('button');
    btn.className = 'btn-x';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    btn.onclick = function(){
      if(!confirm('Apagar?')) return;
      jogador.trocasHistorico = jogador.trocasHistorico.filter(function(x){ return x.id !== t.id; });
      salvar();
      renderTrocaHistorico();
    };
    div.appendChild(btn);
    cont.appendChild(div);
  });
}

// =============== MODAL REGRAS ===============
function abrirModalRegras(){
  AudioSFX.clickMenu();
  var modal = document.getElementById('modal-regras');
  if(modal) modal.classList.add('aberto');
  // Setup das tabs
  document.querySelectorAll('#regras-tabs .regras-tab').forEach(function(btn){
    btn.onclick = function(){
      AudioSFX.clickMenu();
      document.querySelectorAll('#regras-tabs .regras-tab').forEach(function(b){ b.classList.remove('ativa'); });
      btn.classList.add('ativa');
      renderRegrasConteudo(btn.dataset.rtab);
    };
  });
  // Renderiza tab ativa
  var ativa = document.querySelector('#regras-tabs .regras-tab.ativa');
  if(ativa) renderRegrasConteudo(ativa.dataset.rtab);
  else renderRegrasConteudo('basico');
}
function fecharModalRegras(){
  AudioSFX.clickMenu();
  var modal = document.getElementById('modal-regras');
  if(modal) modal.classList.remove('aberto');
}
function renderRegrasConteudo(tab){
  var cont = document.getElementById('regras-conteudo');
  if(!cont) return;
  var html = '';
  if(tab === 'basico'){
    html = '<h4>🎮 Básico</h4>' +
      '<p><b>Pokémon TCG v23.0</b> é um jogo híbrido que combina cartas físicas e progressão digital.</p>' +
      '<h4>Modos</h4>' +
      '<ul>' +
        '<li><b>🎮 Digital:</b> Rotas, Pokédex, Centro, batalhas automáticas</li>' +
        '<li><b>🃏 Híbrido:</b> Você usa cartas físicas e registra manualmente</li>' +
        '<li><b>🔀 Livre:</b> Alterna entre Digital e Híbrido</li>' +
      '</ul>' +
      '<h4>Regiões e Passaportes</h4>' +
      '<table><tr><th>Região</th><th>Passaportes</th></tr>' +
      '<tr><td>Kanto</td><td>0</td></tr>' +
      '<tr><td>Johto</td><td>5</td></tr>' +
      '<tr><td>Hoenn</td><td>14</td></tr>' +
      '<tr><td>Sinnoh</td><td>25</td></tr>' +
      '<tr><td>Unova</td><td>36</td></tr>' +
      '<tr><td>Kalos</td><td>48</td></tr>' +
      '<tr><td>Alola</td><td>61</td></tr>' +
      '<tr><td>Galar</td><td>82</td></tr>' +
      '<tr><td>Paldea</td><td>112</td></tr></table>';
  }else if(tab === 'batalha'){
    html = '<h4>⚔️ Batalha</h4>' +
      '<h4>Estrutura</h4>' +
      '<ul>' +
        '<li>Amador: mínimo 4 Pokémons</li>' +
        '<li>Profissional/Ginásio/Líder/Boss: 6 Pokémons</li>' +
      '</ul>' +
      '<h4>Turnos (Digital)</h4>' +
      '<ol>' +
        '<li>Escolhe entre LUTAR / POKÉMON / ITEM / BOLA / FUGIR / MEGA-GMAX</li>' +
        '<li>Se LUTAR → escolhe 1 dos 4 moves</li>' +
        '<li>Dano calculado pela fórmula oficial</li>' +
        '<li>Inimigo revida</li>' +
      '</ol>' +
      '<h4>Status</h4>' +
      '<ul>' +
        '<li><b>PAR</b> (Amarelo): 25% de não agir</li>' +
        '<li><b>BRN</b> (Laranja): perde HP por turno</li>' +
        '<li><b>PSN</b> (Roxo): perde HP por turno</li>' +
        '<li><b>TXC</b> (Roxo): perde HP crescente</li>' +
        '<li><b>SLP</b> (Cinza): não age por 1-3 turnos</li>' +
        '<li><b>FRZ</b> (Azul claro): não age, 20% de descongelar</li>' +
        '<li><b>CNF</b> (Rosa): 33% de auto-dano</li>' +
        '<li><b>FLN</b> (Marrom): 30% de hesitar</li>' +
      '</ul>' +
      '<h4>Mega Evolução</h4>' +
      '<p>Requer Pulseira Mega + Pedra Mega específica. Cada pedra tem 5 usos.</p>' +
      '<h4>Gigantamax</h4>' +
      '<p>Requer nível 50+, Pulseira Gmax, 100 Energia Max. Dura a batalha inteira.</p>';
  }else if(tab === 'captura'){
    html = '<h4>🎯 Captura</h4>' +
      '<p>Requisito: Pokémon selvagem com ≤ 30% de HP.</p>' +
      '<h4>Fórmula</h4>' +
      '<p><code>chance = ((3×HP_max − 2×HP_atual) × taxa × bola × status) / (3×HP_max)</code></p>' +
      '<h4>Bônus de Status</h4>' +
      '<ul>' +
        '<li>Dormindo / Congelado: ×2.0</li>' +
        '<li>Paralisado / Envenenado / Queimado: ×1.5</li>' +
      '</ul>' +
      '<h4>Pokébolas Especiais</h4>' +
      '<table>' +
      '<tr><th>Bola</th><th>Efeito</th></tr>' +
      '<tr><td>Dusk Ball</td><td>3.5× em caverna/noite</td></tr>' +
      '<tr><td>Net Ball</td><td>3.5× em Água/Inseto</td></tr>' +
      '<tr><td>Quick Ball</td><td>5× no primeiro turno</td></tr>' +
      '<tr><td>Love Ball</td><td>8× se sexo oposto</td></tr>' +
      '<tr><td>Moon Ball</td><td>4× se evolui com Pedra da Lua</td></tr>' +
      '<tr><td>Fast Ball</td><td>4× se Speed base ≥ 100</td></tr>' +
      '<tr><td>Dream Ball</td><td>4× se dormindo</td></tr>' +
      '<tr><td>Beast Ball</td><td>5× em UB, 0.1× outros</td></tr>' +
      '</table>';
  }else if(tab === 'copas'){
    html = '<h4>🏆 Copas</h4>' +
      '<h4>Copa dos Treinadores</h4>' +
      '<p>32 treinadores, 5 fases. Requer nível 120, 6 Pokémon, 1 Gmax, 6 insígnias.</p>' +
      '<h4>Copa de Região</h4>' +
      '<p>Requer todas as 8 insígnias da região. 16 treinadores, 4 fases.</p>' +
      '<h4>Copa Continental</h4>' +
      '<p>Requer vencer Copa Regional + 3 Pokémons daquela região.</p>' +
      '<h4>Supercopa</h4>' +
      '<p>Requer vencer TODAS as 9 Copas Regionais. Recompensa única.</p>' +
      '<h4>Liga</h4>' +
      '<p>Requer nível 200, 1 Copa, 1 Continental, 6 Pokémons nível 50+.</p>' +
      '<h4>Equipe Rocket</h4>' +
      '<p>6% de chance nas rotas. 4 níveis: Recruta, Agente, Executivo, Chefe.</p>' +
      '<p>Ao derrotar, chance de ganhar <b>Chave Rocket</b> (10% a 50%). Use a chave para invadir a base secreta e enfrentar Giovanni!</p>';
  }else if(tab === 'multiplayer'){
    html = '<h4>🌐 Multiplayer</h4>' +
      '<h4>Duelo PvP</h4>' +
      '<p>Batalhas em tempo real via Socket.io. Vitória = 100 XP + 20 PC. Elo PvP é ajustado após cada duelo.</p>' +
      '<h4>Troca Online</h4>' +
      '<p>Troque Pokémons com jogadores online. Ambos precisam confirmar.</p>' +
      '<h4>Presentes</h4>' +
      '<p>Envie itens, Pokébolas, PC ou TMs. Limite: 5 presentes/dia. 1000 PC/dia máximo.</p>' +
      '<h4>Ranking Global</h4>' +
      '<p>Top 1000 jogadores, atualizado a cada 5 minutos. Categorias: Nível, Vitórias, Insígnias, Copas, Shinies, Elo PvP.</p>' +
      '<h4>Torneios</h4>' +
      '<p>16 treinadores. Precisa de 2+ jogadores reais para iniciar. NPCs completam o resto.</p>';
  }else if(tab === 'creditos'){
    html = '<div class="creditos">' +
      '<h4>Créditos</h4>' +
      '<p><strong>Criador:</strong> Enzo Souza de Marins</p>' +
      '<p><strong>Versão:</strong> 23.0</p>' +
      '<p><strong>Plataforma:</strong> Web (HTML/JS + Node.js + Socket.io)</p>' +
      '<br>' +
      '<p>Agradecimentos especiais:</p>' +
      '<ul style="text-align:left;display:inline-block;">' +
        '<li>PokéAPI — Sprites e dados</li>' +
        '<li>Pokémon Showdown — Sprites e músicas de batalha</li>' +
        '<li>PokeSprite — Ícones de itens</li>' +
        '<li>FontAwesome — Ícones de interface</li>' +
        '<li>Comunidade Pokémon — Inspiração</li>' +
      '</ul>' +
    '</div>';
  }
  cont.innerHTML = html;
}

// =============== ATUALIZAR TUDO ===============
function atualizarTudo(){
  if(!jogador) return;
  atualizarStatus();
  renderTime();
  renderBanco();
  renderDropdownBola();
  renderLojaCategoria();
  renderItens();
  renderRegioes();
  renderInsignias();
  renderRankingFiltros();
  renderRanking();
  renderEstatisticas();
  renderHallFama();
  if(_abaHistoricoAtual === 'capturas') renderCapturas();
  else renderHistorico();
  renderMissoes();
  renderConquistas();
  renderTrofeus();
  renderRocketAba();
  if(typeof renderCopa === 'function') renderCopa();
  if(typeof renderCopaHistorico === 'function') renderCopaHistorico();
  if(typeof renderLiga === 'function') renderLiga();
  if(typeof renderLigaHistorico === 'function') renderLigaHistorico();
  atualizarMVP();
  atualizarDescontos();
  atualizarCustoCentro();
  renderCentroPokemon();
  renderPokedex();
  if(typeof _abaRotasAtual !== 'undefined'){
    if(_abaRotasAtual === 'rotas' && typeof renderRotas === 'function') renderRotas();
    else if(typeof renderGinasios === 'function') renderGinasios();
  }
  carregarJogadoresDuelo();
  carregarJogadoresTroca();
  renderDueloHistorico();
  renderTrocaHistorico();
  aplicarModo();
  atualizarInsigniasDropdown();
  if(typeof verificarConquistas === 'function') verificarConquistas();
  if(typeof gerarMissoesDiarias === 'function') gerarMissoesDiarias();
}

// =============== CONFIGURAR ABAS ===============
function configurarAbas(){
  document.querySelectorAll('.aba-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var aba = btn.dataset.aba;
      AudioSFX.clickMenu();
      document.querySelectorAll('.aba-btn').forEach(function(b){ b.classList.remove('ativa'); });
      document.querySelectorAll('.aba').forEach(function(a){ a.classList.remove('ativa'); });
      btn.classList.add('ativa');
      var sec = document.getElementById('aba-' + aba);
      if(sec) sec.classList.add('ativa');
      if(aba === 'time') renderTime();
      else if(aba === 'banco') renderBanco();
      else if(aba === 'loja') renderLojaCategoria();
      else if(aba === 'itens') renderItens();
      else if(aba === 'regioes') renderRegioes();
      else if(aba === 'insignias') renderInsignias();
      else if(aba === 'ranking'){ renderRankingFiltros(); renderRanking(); }
      else if(aba === 'duelo'){ carregarJogadoresDuelo(); renderDueloHistorico(); }
      else if(aba === 'troca'){ carregarJogadoresTroca(); renderTrocaHistorico(); }
      else if(aba === 'rocket') renderRocketAba();
      else if(aba === 'hallfama') renderHallFama();
      else if(aba === 'trofeus') renderTrofeus();
      else if(aba === 'copa'){ if(typeof renderCopa === 'function') renderCopa(); if(typeof renderCopaHistorico === 'function') renderCopaHistorico(); }
      else if(aba === 'liga'){ if(typeof renderLiga === 'function') renderLiga(); if(typeof renderLigaHistorico === 'function') renderLigaHistorico(); }
      else if(aba === 'missoes') renderMissoes();
      else if(aba === 'conquistas') renderConquistas();
      else if(aba === 'estatisticas') renderEstatisticas();
      else if(aba === 'historico'){
        if(jogador.modo === 'digital') mudarAbaHistorico(_abaHistoricoAtual);
        else renderHistorico();
      }
      else if(aba === 'rotas'){ if(typeof mudarAbaRotas === 'function') mudarAbaRotas(_abaRotasAtual); }
      else if(aba === 'pokedex') renderPokedex();
      else if(aba === 'centro'){ atualizarCustoCentro(); renderCentroPokemon(); }
      else if(aba === 'online'){ if(typeof mpRenderAbaOnline === 'function') mpRenderAbaOnline(); }
    });
  });
}

// =============== INIT ===============
document.addEventListener('DOMContentLoaded', function(){
  var tema = localStorage.getItem('tema');
  if(tema === 'claro') document.body.classList.add('modo-claro');
  configurarAbas();
  document.addEventListener('click', function(e){
    if(!e.target.closest('.dropdown-bola')){
      var l = document.getElementById('dropdown-bola-lista');
      if(l) l.classList.remove('aberta');
    }
  });
  var btnCap = document.getElementById('btn-registrar-captura');
  if(btnCap) btnCap.addEventListener('click', registrarCaptura);
  var btnBat = document.getElementById('btn-registrar');
  if(btnBat) btnBat.addEventListener('click', registrarBatalha);
  ['filtro-busca','filtro-categoria','filtro-ordem',
   'filtro-pokebolas-input','filtro-pedras-input','filtro-evolucao-input',
   'filtro-pedras-mega-input','filtro-tms-input'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('input', renderLojaCategoria);
    if(el) el.addEventListener('change', renderLojaCategoria);
  });
  var itensBusca = document.getElementById('filtro-itens-busca');
  if(itensBusca) itensBusca.addEventListener('input', renderItens);
  ['filtro-banco-busca','filtro-banco-tipo','filtro-banco-raridade','filtro-banco-sexo','filtro-banco-stats','filtro-banco-ordem'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('input', renderBanco);
    if(el) el.addEventListener('change', renderBanco);
  });
  ['filtro-hist-busca','filtro-hist-regiao','filtro-hist-resultado'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('input', renderHistorico);
    if(el) el.addEventListener('change', renderHistorico);
  });
  ['pokedex-busca','pokedex-filtro-status','pokedex-filtro-tipo'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('input', renderPokedex);
    if(el) el.addEventListener('change', renderPokedex);
  });
  var selRegRotas = document.getElementById('filtro-rota-regiao');
  if(selRegRotas) selRegRotas.addEventListener('change', function(){ if(typeof mudarAbaRotas === 'function') mudarAbaRotas(_abaRotasAtual); });
  var selTipoRotas = document.getElementById('filtro-rota-tipo');
  if(selTipoRotas) selTipoRotas.addEventListener('change', function(){ if(typeof mudarAbaRotas === 'function') mudarAbaRotas('rotas'); });
  NOMES_REGIOES.forEach(function(r){
    ['c-regiao','h-regiao'].forEach(function(id){
      var sel = document.getElementById(id);
      if(sel){
        var o = document.createElement('option');
        o.value = r; o.textContent = r;
        sel.appendChild(o);
      }
    });
  });
  var selRegH = document.getElementById('h-regiao');
  if(selRegH) selRegH.addEventListener('change', atualizarInsigniasDropdown);
  var selRegF = document.getElementById('filtro-hist-regiao');
  if(selRegF){
    NOMES_REGIOES.forEach(function(r){
      var o = document.createElement('option'); o.value = r; o.textContent = r; selRegF.appendChild(o);
    });
  }
  var selTipo = document.getElementById('h-tipo');
  if(selTipo) selTipo.addEventListener('change', function(){
    var labelIns = document.getElementById('label-insignia');
    if(labelIns) labelIns.style.display = (selTipo.value === 'Boss de Ginásio' || selTipo.value === 'Líder de Ginásio') ? 'block' : 'none';
  });
  var selD1 = document.getElementById('duelo-j1');
  var selD2 = document.getElementById('duelo-j2');
  if(selD1) selD1.addEventListener('change', function(){ atualizarDueloNomes(); atualizarDueloMVPs(); });
  if(selD2) selD2.addEventListener('change', function(){ atualizarDueloNomes(); atualizarDueloMVPs(); });
  var selT1 = document.getElementById('troca-j1');
  var selT2 = document.getElementById('troca-j2');
  if(selT1) selT1.addEventListener('change', atualizarTrocaPokemons);
  if(selT2) selT2.addEventListener('change', atualizarTrocaPokemons);
  var catBtns = document.querySelectorAll('#loja-categorias .cat-btn');
  catBtns.forEach(function(btn){
    btn.addEventListener('click', function(){ mudarCategoriaLoja(btn.dataset.cat); });
  });
  var btnLojaC = document.getElementById('btn-loja-comprar');
  var btnLojaV = document.getElementById('btn-loja-vender');
  if(btnLojaC) btnLojaC.addEventListener('click', function(){ mudarModoLoja('comprar'); });
  if(btnLojaV) btnLojaV.addEventListener('click', function(){ mudarModoLoja('vender'); });
  configurarAutocomplete();
  renderDropdownBola();
  setInterval(function(){
    var el = document.getElementById('timer-desc');
    if(el) el.textContent = getTimerDescontos();
  }, 60000);
});

console.log('Pokémon TCG v23.0 — script3.js carregado');