/* Estante: o widget de música do Board. Junta os módulos (Teoria, Musica, Frases, Estudo, Partitura, Som, Baloes)
   num corpo de camadas que estica conforme o foco (tocar, partitura, escala, estudo), solta os balões na tela, toca
   junto da Onda e expõe comandos pro seu agente, que conversa com o Dengas. Usa o objeto Mesa (ponte do Board) ou
   o do simulador (teste/estante.html), com a mesma interface. */
{
const T = Teoria, esc = Partitura.esc;
const CSS = `
.es{display:flex;flex-direction:column;gap:10px;height:100%;overflow-y:auto;scrollbar-width:none;color:#eef0ff;font:13px/1.45 var(--corpo,Inter,system-ui,sans-serif);--ct:#3ee6d4;--pn:#a584ff;--cr:#ff6482;--ch:#ffb85c;--mut:#8f95ad;--lin:rgba(255,255,255,.12)}
.es>section{flex:none;transition:opacity .35s,transform .5s cubic-bezier(.2,1.3,.3,1)}.es>section[hidden]{display:none}
.es-cab{display:flex;align-items:center;gap:10px;min-width:0}
.es-play{flex:none;width:38px;height:38px;border-radius:50%;border:0;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#a584ff,#3ee6d4);box-shadow:0 0 18px rgba(165,132,255,.45);cursor:pointer;transition:transform .45s cubic-bezier(.2,1.5,.3,1)}
.es-play:active{transform:scale(.88)}.es-play svg{width:14px;height:14px;fill:currentColor}.es.tocando .es-play{animation:es-pulso calc(60s / var(--bpm,90)) ease-out infinite}
@keyframes es-pulso{0%{box-shadow:0 0 0 0 rgba(62,230,212,.55),0 0 18px rgba(165,132,255,.45)}100%{box-shadow:0 0 0 12px transparent,0 0 18px rgba(165,132,255,.45)}}
.es-agora{min-width:0;flex:1}.es-agora b{display:block;font:700 22px/1.05 Sora,Inter,sans-serif;color:var(--ch);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.es-agora span{display:block;font-size:11.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.es-vals{display:flex;gap:6px;flex:none}.es-val{border:1px solid var(--lin);background:rgba(255,255,255,.04);color:#eef0ff;border-radius:999px;height:28px;padding:0 10px;font:600 12px "JetBrains Mono",monospace;cursor:ns-resize}
.es-val i{font:500 9.5px var(--corpo,Inter,sans-serif);font-style:normal;color:var(--mut);margin-right:5px;text-transform:uppercase;letter-spacing:.06em}.es-val:hover{border-color:var(--ct)}
.es-onda{font-size:11px;color:var(--mut);display:flex;gap:8px;align-items:center}.es-onda b{color:var(--ct);font-weight:600}.es-onda button{border:1px solid var(--lin);background:none;color:#eef0ff;border-radius:999px;padding:1px 8px;font-size:11px;cursor:pointer}
.es-prog{height:2px;border-radius:2px;background:rgba(255,255,255,.06);overflow:hidden}.es-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#a584ff,#3ee6d4);box-shadow:0 0 8px #3ee6d4}
.es-cams{display:flex;gap:5px;flex-wrap:wrap}.es-cam{border:1px solid var(--lin);background:none;color:var(--mut);border-radius:999px;height:24px;padding:0 9px;font-size:11.5px;cursor:pointer;transition:color .2s,border-color .2s,background .2s}
.es-cam[aria-pressed=true]{color:#eef0ff;border-color:rgba(62,230,212,.6);background:rgba(62,230,212,.1)}
.es-pauta{position:relative;overflow:hidden}.es-pauta.faixa{overflow-x:auto;scrollbar-width:none}.es-pauta.faixa::-webkit-scrollbar{display:none}
.es-sheet svg{display:block}.es-sheet text{font-family:"JetBrains Mono",monospace;fill:#eef0ff;user-select:none}
.es-sheet .st{stroke:#eef0ff;opacity:.28}.es-sheet .bl{stroke:#eef0ff;opacity:.45}.es-sheet .bl.fraca{opacity:.14}.es-sheet .ink{stroke:#eef0ff;stroke-width:1.2;fill:none}.es-sheet .clave{font-family:serif!important}
.es-sheet .fc{font:700 15px Sora,serif!important;text-anchor:middle}.es-sheet .lab{font-size:8px;fill:var(--mut)!important}.es-sheet .sec{font:600 10px var(--corpo,Inter,sans-serif)!important;fill:var(--pn)!important;letter-spacing:.06em;text-transform:uppercase}
.es-sheet .ch{font:700 13px Sora,sans-serif!important;fill:var(--ch)!important}.es-sheet .rom{font:500 9.5px "JetBrains Mono",monospace;fill:var(--mut)}
.es-sheet .nh{fill:#eef0ff;stroke:#eef0ff;stroke-width:1.2}.es-sheet .nh.oca{fill:none}.es-sheet .ponto{fill:#eef0ff}.es-sheet .fr{font-size:11px;font-weight:600;text-anchor:middle}
.es-sheet .nn,.es-sheet .gr,.es-sheet .ac,.es-sheet .sa,.es-sheet .ly{text-anchor:middle;font-size:10.5px}.es-sheet .nn{fill:var(--mut)!important}.es-sheet .gr.t{fill:var(--pn)!important;font-weight:700}.es-sheet .gr.o{fill:var(--cr)!important}
.es-sheet .ac{font-weight:600}.es-sheet .ac.ct{fill:var(--ct)!important}.es-sheet .ac.pn{fill:var(--pn)!important}.es-sheet .ac.sc{fill:var(--mut)!important}.es-sheet .ac.cr{fill:var(--cr)!important}.es-sheet .sa{font-size:9px;fill:var(--mut)!important}.es-sheet .ly{font:12px Inter,sans-serif!important}
.es-sheet .hit{fill:transparent;cursor:pointer;transition:fill .15s}.es-sheet .hit:hover{fill:rgba(165,132,255,.12)}.es-sheet .mbg{fill:transparent;transition:fill .35s}.es-sheet .mbg.agora{fill:rgba(62,230,212,.07)}
.es-sheet [data-i].on:not(.hit):not(.nh){fill:var(--ct)!important;font-weight:700}.es-sheet .nh.on{stroke:var(--ct);fill:var(--ct)}
.es-ph{position:absolute;left:0;top:0;width:2px;border-radius:2px;background:#3ee6d4;box-shadow:0 0 14px 2px #3ee6d4;pointer-events:none;will-change:transform;opacity:0;transition:opacity .25s}.es-ph.vivo{opacity:1}
.es-esc .tit b{font:700 14px Sora,sans-serif}.es-esc .tit span{color:var(--mut);font-size:11.5px}
.es-faixa{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-top:6px}.es-faixa div{border:1px solid var(--lin);border-radius:9px;padding:3px 0;text-align:center;opacity:.4}
.es-faixa div b{display:block;font:600 12px "JetBrains Mono",monospace}.es-faixa div span{font-size:10px;color:var(--mut)}.es-faixa .na{opacity:.75}.es-faixa .us{opacity:1;border-color:var(--pn);background:rgba(165,132,255,.12)}.es-faixa .fo{opacity:1;border-color:var(--cr)}
.es-est h3{margin:0;font:700 16px Sora,sans-serif}.es-est .sub{color:var(--ct);font:12px "JetBrains Mono",monospace}.es-est p{margin:6px 0 0;color:#d6d9ea}
.es-braco .corda{stroke:rgba(255,255,255,.35)}.es-braco .traste{stroke:rgba(255,255,255,.14)}.es-braco .pestana{stroke:rgba(255,255,255,.6);stroke-width:3}.es-braco .lab,.es-braco .casa{font:9px "JetBrains Mono",monospace;fill:var(--mut);text-anchor:middle}
.es-braco .pt circle{fill:rgba(165,132,255,.28);stroke:rgba(165,132,255,.8)}.es-braco .pt.raiz circle{fill:rgba(255,184,92,.35);stroke:var(--ch)}.es-braco .pt.marca circle{fill:rgba(255,100,130,.25);stroke:var(--cr)}
.es-braco .pt text{font:600 8.5px "JetBrains Mono",monospace;fill:#fff;text-anchor:middle}.es-braco .pt.on circle{fill:var(--ct);stroke:#fff;filter:drop-shadow(0 0 6px var(--ct))}
.es-passos{display:flex;flex-direction:column;gap:6px;margin-top:8px}.es-passo{display:flex;gap:10px;align-items:flex-start;padding:7px 9px;border-radius:12px;border:1px solid var(--lin);background:rgba(255,255,255,.03);transition:border-color .2s,background .2s}
.es-passo.on{border-color:rgba(62,230,212,.6);background:rgba(62,230,212,.07)}.es-passo button{flex:none;width:26px;height:26px;border-radius:50%;border:0;background:linear-gradient(135deg,#a584ff,#3ee6d4);color:#fff;cursor:pointer;font-size:10px}
.es-passo b{display:block;font-size:12.5px}.es-passo span{font-size:11.5px;color:var(--mut)}.es-passo .sq{font:11px "JetBrains Mono",monospace;color:var(--ct);margin-top:2px}.es-passo .sq i{font-style:normal;transition:color .1s}.es-passo .sq i.on{color:#fff;text-shadow:0 0 8px var(--ct)}
.es-rep input{width:100%;height:32px;border-radius:999px;border:1px solid var(--lin);background:rgba(255,255,255,.04);color:#eef0ff;padding:0 14px;font:13px var(--corpo,Inter,sans-serif)}
.es-rep ul{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:3px}.es-rep li{display:flex;justify-content:space-between;gap:10px;padding:6px 10px;border-radius:10px;cursor:pointer}.es-rep li:hover,.es-rep li.on{background:rgba(165,132,255,.12)}
.es-rep li span{color:var(--mut);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.es-rep .msg{color:var(--mut);font-size:11.5px;margin-top:6px;min-height:16px}
.es-vazio{color:var(--mut)}
.es[data-tam=xs] section:not(.es-cab-s){display:none}.es[data-tam=xs] .es-vals,.es[data-tam=xs] .es-agora span{display:none}
`;
const LS_CAMADAS = ['cifra', 'tab', 'graus', 'acorde'];
// formas do corpo por foco (o Dengas escolhe; o corpo estica com a mola da moldura)
const FOCOS = {
  compacto:{ secoes:['cab'], w:340, h:96 },
  tocar:{ secoes:['cab', 'pauta'], w:620, h:300 },
  partitura:{ secoes:['cab', 'cams', 'pauta'], w:760, h:560 },
  escala:{ secoes:['cab', 'esc', 'pauta'], w:620, h:420 },
  estudo:{ secoes:['cab', 'est'], w:520, h:600 },
  musicas:{ secoes:['cab', 'rep'], w:420, h:460 },
};
Mesa.define({
  id:'estante', nome:'Estante', descricao:'música: cifra, partitura, tablatura, graus, balões de acorde e frase, estudo de escalas, pentatônica e modos; toca junto da Onda',
  w:620, h:300, minW:300, minH:90, ancoras:['interior', 'direita', 'esquerda', 'inferior', 'superior'],
  tamanhos:{ direita:{ w:440, h:620 }, esquerda:{ w:440, h:620 }, inferior:{ w:900, h:230 }, superior:{ w:900, h:230 } },
  icone:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  monta(corpo, api){
    if (!document.getElementById('es-css')){ const s = document.createElement('style'); s.id = 'es-css'; s.textContent = CSS; document.head.appendChild(s); }
    const S = Object.assign({ musica:'blues', t:0, bpm:{}, ins:'baixo', camadas:LS_CAMADAS, foco:'tocar', carregadas:[], licao:null, baloes:true, onda:{ ligada:false, offset:0 } }, api.ler({}));
    const salva = () => api.salvar({ musica:S.musica, t:S.t, bpm:S.bpm, ins:S.ins, camadas:[...camadas], foco:S.foco, carregadas:S.carregadas.slice(-20), licao:S.licao, baloes:S.baloes, onda:S.onda });
    let camadas = new Set(S.camadas), CTX = null, faixaPauta = false, licao = null, cancelaFrase = null, vary = {}, barAgora = -1, evAgora = -1;
    corpo.innerHTML = `<div class="es">
      <section class="es-cab-s" data-s="cab"><div class="es-cab"><button class="es-play" type="button" aria-label="Tocar ou pausar"><svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg></button>
        <div class="es-agora"><b></b><span></span></div><div class="es-vals"><button class="es-val" data-v="tom" type="button" title="Tom: role o mouse ou clique (esq/dir)"><i>tom</i><span></span></button><button class="es-val" data-v="bpm" type="button" title="Andamento: role o mouse"><i>bpm</i><span></span></button></div></div>
        <div class="es-onda" hidden></div><div class="es-prog"><i></i></div></section>
      <section data-s="cams"><div class="es-cams"></div></section>
      <section data-s="esc" class="es-esc"></section>
      <section data-s="pauta" class="es-pauta"><div class="es-sheet"></div><i class="es-ph"></i></section>
      <section data-s="est" class="es-est"></section>
      <section data-s="rep" class="es-rep"><input type="text" placeholder="Música: escolha abaixo ou peça (ex.: Come Together, Beatles)" spellcheck="false"><ul></ul><div class="msg"></div></section></div>`;
    const R = corpo.querySelector('.es'), $ = s => R.querySelector(s), secao = id => R.querySelector(`[data-s="${id}"]`);
    const sheet = $('.es-sheet'), ph = $('.es-ph'), pauta = secao('pauta');
    const raizBaloes = (typeof Mesa.camada !== 'undefined' && Mesa.camada?.parentNode) || document.body;
    const baloes = Baloes.criar({ raiz:raizBaloes, caixa:() => { const r = corpo.getBoundingClientRect(); return r.width ? r : null; },
      tocar:(o, aceso) => { const bar = CTX?.compassos[barAgora]; if (!bar) return; if (o === 'outra'){ vary[bar.i] = (vary[bar.i] || 0) + 1; mostraBaloes(true); }
        cancelaFrase?.(); cancelaFrase = Som.frase(Frases.tocavel(CTX, bar, vary[bar.i] || 0, S.ins), bpm(), aceso); } });
    const todas = () => [...Musica.REPERTORIO, ...S.carregadas];
    const musica = () => todas().find(m => m.id === S.musica) || Musica.REPERTORIO[0];
    const bpm = () => S.bpm[S.musica] || musica().bpm || 90;
    const tocador = Som.tocador({ ctx:() => CTX, bpm, midiSoando:ev => T.soa(ev.m, S.ins) });
    // ---------- desenho ----------
    function recalcula(){ CTX = Musica.contexto(musica(), S.t); vary = {}; barAgora = Math.min(barAgora, CTX.compassos.length - 1); desenha(); }
    function desenha(){
      const largura = pauta.clientWidth || corpo.clientWidth - 20, r = Partitura.desenha(CTX, { camadas, largura, ins:S.ins, faixa:faixaPauta });
      sheet.innerHTML = r.html; pauta.classList.toggle('faixa', faixaPauta);
      const sc = Partitura.escalaFaixa(CTX);
      secao('esc').innerHTML = `<div class="tit"><b>${esc(sc.titulo)}</b> <span>· ${esc(sc.formula)} · ${esc(sc.porque)}</span></div><div class="es-faixa">${sc.casas.map(c => `<div class="${c.usada ? (c.naEscala ? 'us' : 'fo') : c.naEscala ? 'na' : ''}"><b>${esc(c.nota)}</b><span>${esc(c.grau)}</span></div>`).join('')}</div>` +
        (sc.fora.length ? `<p class="es-vazio">fora: ${sc.fora.map(f => esc(f.nota + ' (' + f.grau + ')' + (f.de ? ', da ' + f.de : ''))).join('; ')}</p>` : '');
      cabeca(); cams(); repertorio(); R.style.setProperty('--bpm', bpm()); evAgora = -2; encaixa(); if (barAgora >= 0) sheet.querySelector(`.mbg[data-b="${barAgora}"]`)?.classList.add('agora');
    }
    function cabeca(){
      const m = musica(), bar = CTX.compassos[Math.max(0, barAgora)];
      $('.es-agora b').textContent = bar?.acordes?.length ? bar.acordes.map(T.pretty).join(' → ') : T.pretty(CTX.tonica) + (CTX.menor ? 'm' : '');
      $('.es-agora span').textContent = m.titulo + (m.artista ? ' · ' + m.artista : '');
      $('[data-v=tom] span').textContent = T.pretty(CTX.tonica) + (CTX.menor ? 'm' : '') + (S.t ? ` (${S.t > 0 ? '+' : ''}${S.t})` : '');
      $('[data-v=bpm] span').textContent = bpm();
    }
    function cams(){ $('.es-cams').innerHTML = Partitura.CAMADAS.map(([id, nm]) => `<button class="es-cam" type="button" data-c="${id}" aria-pressed="${camadas.has(id)}">${nm}</button>`).join(''); }
    function repertorio(filtro = ''){
      const q = filtro.trim().toLowerCase(), l = todas().filter(m => !q || (m.titulo + ' ' + (m.artista || '')).toLowerCase().includes(q));
      $('.es-rep ul').innerHTML = l.map(m => `<li data-m="${esc(m.id)}" class="${m.id === S.musica ? 'on' : ''}"><b>${esc(m.titulo)}</b><span>${esc(m.cifra ? 'cifra · ' : '')}${esc(m.artista || '')}</span></li>`).join('') || `<li class="es-vazio">Nada aqui com esse nome. Enter pede pro agente trazer a cifra.</li>`;
    }
    function aplicaFoco(f, redimensiona = true){
      const F = FOCOS[f] || FOCOS.tocar; S.foco = f;
      R.querySelectorAll('section').forEach(s => { s.hidden = !F.secoes.includes(s.dataset.s); });
      faixaPauta = (api.moldura?.estado?.()?.orient === 'h' && f === 'tocar');
      if (redimensiona && api.moldura?.redimensionar) api.moldura.redimensionar(F.w, F.h);
      salva(); requestAnimationFrame(desenha);
    }
    // o corpo do tamanho do conteúdo: depois de desenhar, mede as seções visíveis e estica ou encolhe (com a mola da moldura)
    let encaixeT = 0;
    function encaixa(){
      clearTimeout(encaixeT); encaixeT = setTimeout(() => {
        const e = api.moldura?.estado?.(); if (!e || !api.moldura.redimensionar) return;
        const vis = [...R.querySelectorAll('section')].filter(x => !x.hidden), F = FOCOS[S.foco] || FOCOS.tocar;
        const conteudo = vis.reduce((a, x) => a + x.scrollHeight, 0) + 10 * Math.max(0, vis.length - 1), pad = Math.max(0, (e.h || 0) - corpo.clientHeight);
        const alvo = Math.round(Math.min(Math.max(F.h, 160), conteudo + pad + 4));
        if (Math.abs(alvo - (e.h || 0)) > 12) api.moldura.redimensionar(e.w, alvo);
      }, 160);
    }
    function mostraBaloes(forca){
      if (!S.baloes || !CTX){ baloes.limpa(); return; }
      const bar = CTX.compassos[Math.max(0, barAgora)]; if (!bar) return;
      const r = Frases.compasso(CTX, bar, vary[bar.i] || 0);
      baloes.compasso(r); baloes.acorde(r);
    }
    function estudo(l){
      licao = l; S.licao = l; cancelaFrase?.();
      if (!l){ secao('est').innerHTML = '<p class="es-vazio">Peça um estudo: escala, pentatônica, modos, arpejos ou um tema livre.</p>'; return; }
      const pontos = T.noBraco(T.rootPc(l.raiz), l.graus, S.ins, l.braco.de, l.braco.ate).map(p => ({ s:p.s, f:p.f, rotulo:T.DEG[p.off], classe:p.raiz ? 'raiz' : (l.marca || []).includes(p.off) ? 'marca' : '' }));
      secao('est').innerHTML = `<h3>${esc(l.titulo)}</h3><div class="sub">${esc(l.sub)}</div><p>${esc(l.texto)}</p><div class="es-braco">${Partitura.braco(S.ins, pontos, l.braco.de, l.braco.ate)}</div>` +
        `<div class="es-passos">${l.passos.map((p, k) => `<div class="es-passo" data-p="${k}"><button type="button" aria-label="Tocar este passo">▶</button><div><b>${esc(p.titulo)}</b><span>${esc(p.texto)}</span><div class="sq">${p.seq.map(x => `<i>${esc(x.off === 12 ? '8' : x.off > 12 ? T.DEG[x.off % 12] + '↑' : T.DEG[T.mod12(x.off)])}</i>`).join(' ')}</div></div></div>`).join('')}</div>`;
      salva(); encaixa();
    }
    function tocaPasso(k){
      const l = licao, p = l?.passos[k]; if (!p) return; cancelaFrase?.();
      const el = R.querySelector(`.es-passo[data-p="${k}"]`), is = el?.querySelectorAll('.sq i') || [], notas = Estudo.tocavel(l, p, S.ins);
      R.querySelectorAll('.es-passo').forEach(x => x.classList.toggle('on', x === el));
      cancelaFrase = Som.frase(notas, p.bpm, j => { is.forEach((x, n) => x.classList.toggle('on', n === j));
        R.querySelectorAll('.es-braco .pt').forEach(g => g.classList.remove('on')); if (j >= 0){ const ps = T.posicoes(notas[j].midi + T.INS[S.ins].desce, S.ins); const q = ps.find(x => x.f >= l.braco.de && x.f <= l.braco.ate) || ps[0]; if (q) R.querySelector(`.es-braco .pt[data-s="${q.s}"][data-f="${q.f}"]`)?.classList.add('on'); } },
        () => el?.classList.remove('on'));
    }
    // ---------- o laço: cursor, compasso e acorde do momento ----------
    let rafId = 0, ondaEst = null;
    function laco(){
      rafId = requestAnimationFrame(laco); if (!CTX) return;
      tocador.laco(); const ativo = tocador.ativo(), b = tocador.batida(), E = CTX.eventos;
      R.classList.toggle('tocando', ativo);
      $('.es-play svg').innerHTML = ativo ? '<path d="M3.5 2.5h3.2v11H3.5zM9.3 2.5h3.2v11H9.3z"/>' : '<path d="M4 2.5v11l9-5.5z"/>';
      $('.es-prog i').style.width = Math.max(0, Math.min(100, 100 * b / CTX.total)) + '%';
      let i = -1; if (b >= 0) for (let k = 0; k < E.length; k++){ if (E[k].beat <= b + 1e-6) i = k; else break; }
      if (i < 0 || (!ativo && b === 0)){ ph.classList.remove('vivo'); return; }
      const ev = E[i], nx = E[i + 1], fr = Math.min(1, (b - ev.beat) / ev.dur), sys = sheet.querySelectorAll('.sys')[ev.pr];
      if (sys && ev.px != null){ const x = ev.px + (nx && nx.pr === ev.pr && nx.px != null ? (nx.px - ev.px) * fr : fr * 16); ph.classList.add('vivo'); ph.style.height = sys.offsetHeight + 'px'; ph.style.transform = `translate(${x - 1}px,${sys.offsetTop}px)`;
        if (faixaPauta) pauta.scrollLeft = Math.max(0, x - pauta.clientWidth * .3); }
      if (i !== evAgora){ sheet.querySelectorAll('.on').forEach(x => x.classList.remove('on')); sheet.querySelectorAll(`[data-i="${i}"]`).forEach(x => x.classList.add('on')); evAgora = i; baloes.acende(i); }
      if (ev.bar !== barAgora){ barAgora = ev.bar; sheet.querySelectorAll('.mbg.agora').forEach(x => x.classList.remove('agora')); sheet.querySelector(`.mbg[data-b="${barAgora}"]`)?.classList.add('agora'); cabeca(); if (ativo) mostraBaloes(); api.emitir?.('compasso', { n:barAgora, acorde:CTX.compassos[barAgora]?.acordes?.join(' ') }); }
    }
    // ---------- Onda: a música de verdade dá o relógio ----------
    let ondaTimer = 0;
    async function leOnda(){
      const fs = api.podePC?.() ? api.host?.()?.fs : null; if (!fs) return null;
      try { const j = JSON.parse(await fs.readFile('~/.orbita/musica.json', 'utf8')); return j && Date.now() - j.updated < 8000 ? j : null; } catch { return null; }
    }
    function ligaOnda(on){
      S.onda.ligada = !!on; clearInterval(ondaTimer); ondaEst = null;
      if (!on){ tocador.externo(null); $('.es-onda').hidden = true; salva(); return; }
      const lido = { s:null, em:0, toca:false };
      ondaTimer = setInterval(async () => { const j = await leOnda(); ondaEst = j; if (j){ lido.toca = j.status === 'tocando'; lido.s = (Number(j.posicao_s) || 0) + (lido.toca ? Math.max(0, Date.now() - j.updated) / 1000 : 0); lido.em = performance.now(); }
        $('.es-onda').hidden = false; $('.es-onda').innerHTML = j ? `Onda: <b>${esc([j.tocando?.titulo, j.tocando?.artista].filter(Boolean).join(' · ') || 'música')}</b> ${esc(j.status || '')} <button type="button" data-a="marca">marcar o 1º tempo</button>` : 'Onda: sem leitura (ela está aberta e tocando?)'; }, 1000);
      tocador.externo({ tempo:() => lido.s == null ? null : lido.s + (lido.toca ? (performance.now() - lido.em) / 1000 : 0), tocando:() => lido.toca, offset:() => S.onda.offset || 0 });
      salva();
    }
    // ---------- interação ----------
    $('.es-play').addEventListener('click', () => { if (tocador.externoLigado) return api.avisar?.('Quem toca agora é a Onda: dê play nela.'); tocador.alternar(); if (tocador.ativo()) mostraBaloes(); });
    R.addEventListener('wheel', e => { const v = e.target.closest('.es-val'); if (!v) return; e.preventDefault(); const d = e.deltaY < 0 ? 1 : -1;
      if (v.dataset.v === 'tom'){ S.t = T.mod12(S.t + d + 6) - 6; tocador.mudou(); recalcula(); } else { S.bpm[S.musica] = Math.max(40, Math.min(240, bpm() + d * 2)); tocador.mudou(); cabeca(); } salva(); }, { passive:false });
    R.addEventListener('click', e => {
      const v = e.target.closest('.es-val'); if (v?.dataset.v === 'tom'){ const r = v.getBoundingClientRect(), d = e.clientX < r.left + r.width / 2 ? -1 : 1; S.t = T.mod12(S.t + d + 6) - 6; tocador.mudou(); recalcula(); salva(); return; }
      const c = e.target.closest('.es-cam'); if (c){ camadas.has(c.dataset.c) ? camadas.delete(c.dataset.c) : camadas.add(c.dataset.c); salva(); desenha(); return; }
      const li = e.target.closest('.es-rep li[data-m]'); if (li){ abreMusica(li.dataset.m); return; }
      const p = e.target.closest('.es-passo button'); if (p){ tocaPasso(+p.closest('.es-passo').dataset.p); return; }
      if (e.target.closest('[data-a=marca]')){ S.onda.offset = ondaEst ? Number(ondaEst.posicao_s) || 0 : 0; salva(); api.avisar?.('1º tempo marcado em ' + S.onda.offset.toFixed(1) + ' s'); return; }
      const h = e.target.closest('.hit,.mbg'); if (h && CTX){ const i = h.dataset.i != null ? +h.dataset.i : CTX.compassos[+h.dataset.b].evs[0].i; if (!tocador.externoLigado) tocador.ir(CTX.eventos[i].beat); barAgora = -2; }
    });
    sheet.addEventListener('mousemove', e => { const h = e.target.closest('.hit'); if (!h || !CTX || tocador.ativo()) return; const ev = CTX.eventos[+h.dataset.i]; if (ev && ev.bar !== barAgora){ barAgora = ev.bar; cabeca(); mostraBaloes(); } baloes.nota(Frases.nota(CTX, +h.dataset.i, S.ins)); });
    sheet.addEventListener('mouseleave', () => setTimeout(() => { if (!tocador.ativo()) baloes.fecha('nota'); }, 600));
    const campo = $('.es-rep input');
    campo.addEventListener('input', () => repertorio(campo.value));
    campo.addEventListener('keydown', e => { if (e.key !== 'Enter') return; const q = campo.value.trim(); if (!q) return; const m = todas().find(x => (x.titulo + ' ' + (x.artista || '')).toLowerCase().includes(q.toLowerCase())); if (m) return abreMusica(m.id); buscaCifra(q); });
    // ---------- música ----------
    function abreMusica(id){ if (!todas().some(m => m.id === id)) throw new Error('não tenho a música "' + id + '"'); S.musica = id; S.t = 0; tocador.reinicia(); recalcula(); salva(); mostraBaloes(); return { musica:musica().titulo, tom:CTX.tonica + (CTX.menor ? 'm' : ''), compassos:CTX.nCompassos, bpm:bpm() }; }
    function carrega(d){ const m = Musica.daCifra(d); S.carregadas = [...S.carregadas.filter(x => x.id !== m.id), m]; return abreMusica(m.id); }
    // o harness próprio da Estante: pede a cifra pro Claude (o mesmo que o Dengas usa), valida e carrega
    async function buscaCifra(q){
      const msg = $('.es-rep .msg'), sample = Mesa.sample?.(); if (!sample){ msg.textContent = 'Sem Claude aqui: peça pro Dengas trazer a cifra.'; return; }
      msg.textContent = 'Buscando a cifra de "' + q + '"…';
      try {
        const r = await sample('Você monta a cifra de uma música pra uma estante de estudo de baixo. Música pedida: "' + q.slice(0, 120) + '". Responda SÓ um JSON: {"titulo","artista","tom" (tônica e "m" se menor, ex. "Am"),"compasso" ("4/4"),"bpm",' +
          '"secoes":[{"nome","compassos":["um item por compasso, acordes separados por espaço, ex. \\"Am\\", \\"F G\\""]}]}. Use a forma da música (intro, verso, refrão…) com a progressão real que você conhece. Se não conhecer a música com segurança, responda {"erro":"não conheço"}.', { modelTier:'default', cache:false });
        const j = JSON.parse((/\{[\s\S]*\}/.exec(r.text || '') || ['{}'])[0]); if (j.erro) throw new Error(j.erro);
        const res = carrega(j); msg.textContent = 'Carreguei ' + res.musica + ' (' + res.compassos + ' compassos). Confira com a gravação: a cifra veio do Claude.';
      } catch (e) { msg.textContent = 'Não consegui: ' + String(e.message || e).slice(0, 140); }
    }
    // ---------- começa ----------
    estudo(S.licao); recalcula(); aplicaFoco(S.foco, false); if (S.onda.ligada) ligaOnda(true); laco();
    new ResizeObserver(() => { clearTimeout(R._rt); R._rt = setTimeout(desenha, 120); }).observe(corpo);
    const MODO_EST = { escala:(a) => Estudo.escala(a.raiz, a.escala || 'maior', S.ins), pentatonica:(a) => Estudo.pentatonica(a.raiz, a.menor !== false, a.desenho || 1, S.ins), modos:(a) => Estudo.modo(a.raiz, a.modo || 'dorico', S.ins), arpejos:(a) => Estudo.arpejo(a.acorde || (a.raiz + 'm7'), S.ins) };
    return {
      vistas:{ xs:() => { R.dataset.tam = 'xs'; }, padrao:() => { R.dataset.tam = ''; } },
      aoMudar:() => { faixaPauta = (api.moldura?.estado?.()?.orient === 'h' && S.foco === 'tocar'); requestAnimationFrame(desenha); baloes.anda(); },
      estado:() => ({ musica:musica().titulo, artista:musica().artista, id:S.musica, tom:CTX ? T.pretty(CTX.tonica) + (CTX.menor ? 'm' : '') : '', transposto:S.t, bpm:bpm(), compasso:musica().compasso,
        tocando:tocador.ativo(), relogio:tocador.externoLigado ? 'onda' : 'interno', compasso_agora:barAgora + 1, acorde_agora:CTX?.compassos[Math.max(0, barAgora)]?.acordes?.join(' ') || '',
        foco:S.foco, camadas:[...camadas], instrumento:S.ins, estudo:licao ? licao.titulo : null, baloes:baloes.abertos(),
        repertorio:todas().map(m => ({ id:m.id, titulo:m.titulo })) }),
      comandos:[
        { nome:'foco', descricao:'Muda o corpo da Estante pro que o dono está fazendo (o corpo estica ou encolhe com mola): compacto (só o acorde do momento), tocar (acorde + pauta), partitura (pauta grande com camadas), escala (escala da música + pauta), estudo (lição), musicas (escolher música).',
          esquema:{ type:'object', properties:{ modo:{ type:'string', enum:Object.keys(FOCOS) } }, required:['modo'] }, roda:({ modo }) => { aplicaFoco(modo); return 'foco ' + modo; } },
        { nome:'abrir_musica', descricao:'Abre uma música do repertório da Estante pelo id ou pelo título (veja repertorio no estado).',
          esquema:{ type:'object', properties:{ musica:{ type:'string' } }, required:['musica'] }, roda:({ musica:q }) => { const s = String(q || '').toLowerCase(), m = todas().find(x => x.id === q) || todas().find(x => x.titulo.toLowerCase().includes(s)); if (!m) throw new Error('não está no repertório: use carregar_cifra'); return abreMusica(m.id); } },
        { nome:'carregar_cifra', descricao:'Carrega uma música qualquer pela cifra e já abre. tom: tônica e "m" se menor (ex.: "Am"). secoes: [{ nome:"Verso", compassos:["Am","F G","C","E7"] }], um item por compasso, acordes separados por espaço. A Estante gera a linha de baixo de estudo, os graus, os balões e a escala. Use a progressão real da música.',
          esquema:{ type:'object', properties:{ titulo:{ type:'string' }, artista:{ type:'string' }, tom:{ type:'string' }, compasso:{ type:'string' }, bpm:{ type:'number' }, secoes:{ type:'array', items:{ type:'object', properties:{ nome:{ type:'string' }, compassos:{ type:'array', items:{ type:'string' } } } } } }, required:['titulo', 'tom', 'secoes'] },
          roda:d => carrega(d) },
        { nome:'buscar_cifra', descricao:'A Estante pede ela mesma a cifra de uma música pro Claude e carrega. busca: "título, artista".', esquema:{ type:'object', properties:{ busca:{ type:'string' } }, required:['busca'] },
          async roda({ busca }){ await buscaCifra(String(busca || '')); return $('.es-rep .msg').textContent; } },
        { nome:'tocar_com_onda', descricao:'Liga o relógio da Onda: a pauta e os balões seguem a música tocando no Spotify. Se busca vier, pede pra Onda tocar essa música. Depois o dono marca o 1º tempo (ou use sincronizar).',
          esquema:{ type:'object', properties:{ busca:{ type:'string' } } },
          async roda({ busca } = {}){ if (busca){ const c = Mesa.comandos?.().find(q => q.widget === 'onda' && q.nome === 'escolher'); if (!c) throw new Error('a Onda não está aberta'); await c.roda({ acao:'tocar_busca', busca:String(busca), tipo:'musica' }); } ligaOnda(true); aplicaFoco(S.foco === 'compacto' ? 'tocar' : S.foco); return 'seguindo a Onda' + (busca ? ' (' + busca + ')' : ''); } },
        { nome:'relogio_interno', descricao:'Desliga a Onda como relógio e volta a tocar a linha pelo sintetizador da Estante.', roda:() => { ligaOnda(false); return 'relógio interno'; } },
        { nome:'sincronizar', descricao:'Acerta onde a música começa na gravação da Onda (segundos do 1º tempo).', esquema:{ type:'object', properties:{ inicio_s:{ type:'number' } }, required:['inicio_s'] }, roda:({ inicio_s }) => { S.onda.offset = Math.max(0, Number(inicio_s) || 0); salva(); return 'início em ' + S.onda.offset + ' s'; } },
        { nome:'tocar', descricao:'Toca a linha da música (relógio interno).', roda:() => { tocador.tocar(); mostraBaloes(); return 'tocando'; } },
        { nome:'pausar', descricao:'Pausa a linha.', roda:() => { tocador.pausar(); return 'pausado'; } },
        { nome:'ir_compasso', descricao:'Vai pro compasso n (1 é o primeiro).', esquema:{ type:'object', properties:{ n:{ type:'number' } }, required:['n'] }, roda:({ n }) => { const b = CTX.compassos[Math.max(0, Math.min(CTX.compassos.length - 1, (n | 0) - 1 + (CTX.anacruse ? 1 : 0)))]; tocador.ir(b.ini); barAgora = -2; return 'compasso ' + n; } },
        { nome:'tom', descricao:'Transpõe: semitons (-6 a 6) a partir do tom original, ou para (a nova tônica, ex. "G").', esquema:{ type:'object', properties:{ semitons:{ type:'number' }, para:{ type:'string' } } },
          roda:({ semitons, para }) => { if (para){ const alvo = T.rootPc(Estudo.normRaiz(para)), orig = T.rootPc(musica().tom.replace(/m$/, '')); S.t = T.mod12(alvo - orig + 6) - 6; } else S.t = Math.max(-6, Math.min(6, semitons | 0)); tocador.mudou(); recalcula(); salva(); return 'tom ' + CTX.tonica; } },
        { nome:'andamento', descricao:'Muda o bpm da música aberta (40 a 240).', esquema:{ type:'object', properties:{ bpm:{ type:'number' } }, required:['bpm'] }, roda:({ bpm:v }) => { S.bpm[S.musica] = Math.max(40, Math.min(240, v | 0)); tocador.mudou(); cabeca(); salva(); return bpm() + ' bpm'; } },
        { nome:'instrumento', descricao:'baixo, baixo5 ou violao.', esquema:{ type:'object', properties:{ nome:{ type:'string', enum:Object.keys(T.INS) } }, required:['nome'] }, roda:({ nome }) => { S.ins = nome; tocador.mudou(); desenha(); estudo(licao); salva(); return T.INS[nome].nome; } },
        { nome:'camadas', descricao:'Liga e desliga camadas da pauta: cifra, partitura, tab, graus, acorde (papel no acorde), saltos, notas, letra. so: lista exata; ou ligar/desligar.',
          esquema:{ type:'object', properties:{ so:{ type:'array', items:{ type:'string' } }, ligar:{ type:'array', items:{ type:'string' } }, desligar:{ type:'array', items:{ type:'string' } } } },
          roda:({ so, ligar, desligar }) => { const ok = new Set(Partitura.CAMADAS.map(c => c[0])); if (so) camadas = new Set(so.filter(x => ok.has(x))); (ligar || []).forEach(x => ok.has(x) && camadas.add(x)); (desligar || []).forEach(x => camadas.delete(x)); salva(); desenha(); return [...camadas]; } },
        { nome:'estudo', descricao:'Abre uma lição no modo estudo (o corpo vira estudo). tema: escala (raiz, escala: maior/natural/harm/melod/dorico/frigio/lidio/mixo/locrio/pentm/pentM/blues), pentatonica (raiz, menor true/false, desenho 1-5), modos (raiz, modo: jonio/dorico/frigio/lidio/mixo/eolio/locrio), arpejos (acorde, ex. "Am7").',
          esquema:{ type:'object', properties:{ tema:{ type:'string', enum:Object.keys(MODO_EST) }, raiz:{ type:'string' }, escala:{ type:'string' }, modo:{ type:'string' }, desenho:{ type:'number' }, menor:{ type:'boolean' }, acorde:{ type:'string' } }, required:['tema'] },
          roda:a => { const l = MODO_EST[a.tema]({ ...a, raiz:a.raiz || CTX?.tonica || 'A' }); estudo(l); aplicaFoco('estudo'); return { licao:l.titulo, passos:l.passos.map(p => p.titulo) }; } },
        { nome:'estudo_livre', descricao:'Uma lição sobre qualquer tema (slap, groove, ghost notes, walking…). passos: [{ titulo, texto, graus:[semitons a partir da raiz, ex. 0, 7, 12], bpm }].',
          esquema:{ type:'object', properties:{ titulo:{ type:'string' }, sub:{ type:'string' }, texto:{ type:'string' }, raiz:{ type:'string' }, escala:{ type:'string' }, passos:{ type:'array', items:{ type:'object' } } }, required:['titulo', 'passos'] },
          roda:d => { const l = Estudo.livre(d); estudo(l); aplicaFoco('estudo'); return { licao:l.titulo }; } },
        { nome:'tocar_passo', descricao:'Toca um passo da lição aberta (1 é o primeiro), acendendo as notas no braço.', esquema:{ type:'object', properties:{ n:{ type:'number' } }, required:['n'] }, roda:({ n }) => { tocaPasso((n | 0) - 1); return 'tocando o passo ' + n; } },
        { nome:'baloes', descricao:'Liga ou desliga os balões soltos na tela (acorde do momento, o que o compasso usa, ideia de frase).', esquema:{ type:'object', properties:{ ligados:{ type:'boolean' } }, required:['ligados'] }, roda:({ ligados }) => { S.baloes = !!ligados; salva(); mostraBaloes(); return ligados ? 'balões ligados' : 'balões desligados'; } },
      ],
      aoFechar(){ cancelAnimationFrame(rafId); clearInterval(ondaTimer); tocador.reinicia(); cancelaFrase?.(); baloes.limpa(); },
    };
  },
});
}
Mesa.agente('estante', 'Você é o agente da Estante, o widget de estudo de música (baixo) do dono. Quem te pede é o Dengas. Antes de agir, olhe o estado (música, tom, foco, se toca com a Onda). Regras: ' +
  '1) O corpo acompanha o que ele faz: tocar junto → foco "tocar"; ler a música inteira → "partitura"; entender a harmonia → "escala"; aprender algo → "estudo"; escolher música → "musicas"; só de olho → "compacto". ' +
  '2) Música que não está no repertório: carregar_cifra com a progressão real (seções e um item por compasso); se não tiver certeza da cifra, use buscar_cifra e diga que a cifra veio do Claude. ' +
  '3) Pra tocar junto da gravação: tocar_com_onda com a busca "título artista"; avise que ele marca o 1º tempo no botão. ' +
  '4) Estudo: escala, pentatonica (desenhos 1 a 5), modos, arpejos; tema livre (slap, groove, walking…) vira estudo_livre com passos curtos e tocáveis. ' +
  '5) Responda em até três frases com o que ficou na tela.');
