// cenários do simulador do Board v2 (rodam no harness; nunca usam o mouse de verdade)
(() => {
  const { delay } = SIM;
  const st = a => { a = a.filter(Number.isFinite); if (!a.length) return { n:0 }; const s = [...a].sort((x, y) => x - y), q = p => s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; return { n:s.length, p50:+q(.5).toFixed(4), p95:+q(.95).toFixed(4), max:+s[s.length - 1].toFixed(4) }; };
  async function pronto(){ for (let i = 0; i < 100; i++){ if (SIM.sondaGlobal() && SIM.FR.every(F => SIM.bd(F.nome))) return true; await delay(100); } return false; }
  const zerar = () => { for (const F of SIM.FR) SIM.bd(F.nome)?.B.zerarPrecisao(); };
  const prec = () => Object.fromEntries(SIM.FR.map(F => [F.nome, SIM.bd(F.nome)?.B.statsPrecisao()]));
  const dono = () => SIM.sondaGlobal();
  // onde pegar a Sonda: o título quando aberta (como na sonda original), o meio quando recolhida
  const paraFis = (s, lx, ly) => { const a = s.b.area(); return SIM.dipParaFis(SIM.monDe(s.b.minha()), lx + a.x, ly + a.y); };
  function pega(){ const s = dono(); if (s.P.degrau === 'aberto'){ const hd = s.P.el.querySelector('.sd-painel header .nome').getBoundingClientRect(); return paraFis(s, hd.left + hd.width / 2, hd.top + hd.height / 2); } return [s.x + s.w / 2, s.y + s.h / 2]; }
  // um botão ou título dentro do painel, em coordenadas globais (rola só o corpo do painel, nunca a janela)
  function alvo(sel){ const s = dono(), d = s.F.el.contentDocument, el = typeof sel === 'string' ? d.querySelector(sel) : sel, c = el.closest('.sd-corpo');
    if (c){ const cr = c.getBoundingClientRect(), er = el.getBoundingClientRect(); if (er.top < cr.top + 10 || er.bottom > cr.bottom - 10){ c.scrollTop += (er.top - cr.top) - c.clientHeight / 2; } }
    const b = el.getBoundingClientRect(); return paraFis(s, b.left + b.width / 2, b.top + b.height / 2); }
  async function clicarEm(sel, espera = 120){ const p = alvo(sel); await SIM.clicar(p[0], p[1]); await delay(espera); }
  async function encaixar(destino, opts = {}){
    const de = pega(); zerar();
    await SIM.arrastar(de, destino, opts.n || 60, { passoMs:16, parar:opts.parar ?? 350, depois:opts.depois ?? 1300 });
    const s = dono(); return { dono:s.F.nome, forma:s.P.forma, degrau:s.P.degrau, x:+s.x.toFixed(2), y:+s.y.toFixed(2), w:+s.w.toFixed(2), h:+s.h.toFixed(2), precisao:prec()[s.F.nome] };
  }

  /* ---------- observador de layout: acusa caixa que muda > 1 px num quadro sem animação ativa ---------- */
  function caixas(raiz){
    const m = new Map();
    for (const el of raiz.querySelectorAll('*')){
      if (!el.offsetWidth && !el.offsetHeight) continue;
      let x = 0, y = 0, e = el; while (e && e !== raiz && raiz.contains(e)){ x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
      // posição de layout (sem a rolagem: rolar é gesto do usuário, e a do log já anda com mola)
      m.set(el, [x, y, el.offsetWidth, el.offsetHeight]);
    }
    return m;
  }
  const nome = el => (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (el.dataset?.t ? `[${el.dataset.t}]` : '') + (el.textContent ? ` "${el.textContent.trim().slice(0, 24)}"` : ''));
  function observar(){
    let on = true, ant = new Map(), quadros = 0; const ocorr = [], saltos = [];
    const raizes = () => { const s = dono(); if (!s) return []; const r = [s.P.el.querySelector('.vista.on')]; for (const Q of s.b.pecas.values()) if (Q.id.startsWith('sonda-') && Q.visivel) r.push(Q.fo); return r.filter(Boolean); };
    const f = () => {
      if (!on) return; const s = dono(); if (!s){ setTimeout(f, 16); return; }
      const animando = s.b.B.sonda?.animando?.() || false, novo = new Map();
      for (const r of raizes()) for (const [el, c] of caixas(r)) novo.set(el, c);
      for (const [el, c] of novo){ const o = ant.get(el); if (!o) continue; const d = Math.max(Math.abs(c[0] - o[0]), Math.abs(c[1] - o[1]), Math.abs(c[2] - o[2]), Math.abs(c[3] - o[3]));
        if (d > 1 && !animando) ocorr.push({ el:nome(el), d:+d.toFixed(2), de:o.map(v => Math.round(v)), para:c.map(v => Math.round(v)) });
        if (d > 60 && !animando) saltos.push({ el:nome(el), d:+d.toFixed(1) }); }
      ant = novo; quadros++; setTimeout(f, 16);
    }; f();
    return () => { on = false; return { quadros, ocorrencias:ocorr.length, saltosGrandes:saltos.length, exemplos:ocorr.slice(0, 6), saltos:saltos.slice(0, 4) }; };
  }

  /* ---------- fluxos ---------- */
  async function fluxoSecoes(){
    for (let n = 1; n <= 8; n++){ await clicarEm(`.sec-tit[data-sec="${n}"]`, 650); await clicarEm(`.sec-tit[data-sec="${n}"]`, 650); }
    await clicarEm('.sec-tit[data-sec="0"]', 650); await clicarEm('.sec-tit[data-sec="0"]', 650);
    for (const n of [1, 2, 3, 7]) await clicarEm(`.sec-tit[data-sec="${n}"]`, 500);
    await delay(500);
  }
  async function fluxoBotoes(){
    for (let i = 0; i < 3; i++) await clicarEm('[data-t="perdeu+"]', 160);
    await clicarEm('[data-t="perdeu-"]', 300);
    await clicarEm('[data-t="reler"]', 400);
    await clicarEm('[data-t="animar"]', 1200); await clicarEm('[data-t="animar"]', 1200);
    await clicarEm('[data-t="folga-baixo"]', 900); await clicarEm('[data-t="folga-exato"]', 900);
    await clicarEm('.lista[data-sec=tela] button', 200);
    await clicarEm('[data-t="salvar"]', 400); await clicarEm('[data-t="we"]', 400); await clicarEm('[data-t="memoria"]', 400);
  }
  async function fluxoTestes(){
    await clicarEm('[data-t="fParado"]', 3800);
    await clicarEm('[data-t="quns"]', 5200);           // falha no simulador (sem PowerShell) e mostra o erro no log
    await clicarEm('[data-t="notif"]', 6000);
    await clicarEm('[data-t="gpu"]', 4200);
    // cliques: a pílula pula com mola; o mouse virtual clica nela 20 vezes
    await clicarEm('[data-t="cliques"]', 500);
    const s = dono(), Pi = s.b.B.sonda.tp.pilula, a = s.b.area(); let ok = 0;
    for (let i = 0; i < 20; i++){ await delay(520); const x = Pi.rv[0] + Pi.rv[2] / 2 + a.x, y = Pi.rv[1] + Pi.rv[3] / 2 + a.y; await SIM.clicar(x, y); ok++; }
    await delay(900);
    await clicarEm('[data-t="fAnim"]', 10800);
    return { cliquesFeitos:ok, recebidos:s.b.B.sonda.R.testes.cliques_halo?.recebidos };
  }
  async function fluxoArrasto(){
    const r = {};
    r.borda = await encaixar([40, 520]);
    r.canto = await encaixar([60, 30]);
    r.solta = await encaixar([900, 300]);
    r.baixo = await encaixar([900, 1015]);
    r.solta2 = await encaixar([1100, 400]);
    return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, `${v.forma}/${v.degrau} ${v.x},${v.y} ${v.w}×${v.h} pega ${v.precisao.pegaErroPx.max ?? '–'} px`]));
  }
  async function fluxoEmenda(){
    const r = {};
    await encaixar([1300, 250]);
    let de = pega(); SIM.mover(...de); await delay(50); SIM.apertar(); await SIM.caminho(SIM.linha(de, [1700, de[1]], 120)); await delay(450);
    SIM.soltar(); await delay(1400); let s = dono(); r.devagar = `${s.F.nome} ${s.P.forma} x ${s.x}`;
    de = pega(); SIM.mover(...de); await delay(50); SIM.apertar(); await SIM.caminho(SIM.linha(de, [de[0] - 150, de[1]], 8)); await SIM.caminho(SIM.linha([de[0] - 150, de[1]], [2700, de[1] + 40], 16)); SIM.soltar();
    await delay(2200); s = dono(); r.rapido = `${s.F.nome} ${s.P.forma}/${s.P.degrau} x ${s.x.toFixed(0)} · cópias ${SIM.FR.filter(F => SIM.bd(F.nome).pecas.has('sonda')).length}`;
    return r;
  }

  /* ---------- câmera lenta: grava o registro do motor e procura descontinuidade ---------- */
  async function camLenta(fator = .25){
    const s0 = dono(), B = s0.b.B; B.EF.camLenta = fator; B.iniciarTrace();
    await encaixar([60, 520], { n:90, parar:500, depois:3500 });      // encaixe à esquerda
    await encaixar([800, 420], { n:60, parar:200, depois:3500 });     // descolar e soltar solto
    const Pi = B.sonda.tp.pilula; B.sonda.pular(Pi, 300, 700); await delay(2500);
    await clicarEm('[data-t="recolher"]', 3500);                       // painel → cápsula
    const c = dono(); await SIM.clicar(c.x + c.w / 2, c.y + c.h / 2); await delay(3500);   // cápsula → painel
    B.sonda.ligarAnimacao(true); await delay(2500); B.sonda.ligarAnimacao(false); await delay(3000);
    const out = await B.pararTrace(); B.EF.camLenta = 1;
    const col = Object.fromEntries(out.colunas.map((c, i) => [c, i])), porPeca = new Map();
    for (const l of out.quadros){ if (!porPeca.has(l[1])) porPeca.set(l[1], []); porPeca.get(l[1]).push(l); }
    const r = {};
    for (const [id, ls] of porPeca){
      let dPos = 0, dTam = 0, dO = 0, quedaO = 0, dS = 0;
      for (let i = 1; i < ls.length; i++){ const a = ls[i - 1], b = ls[i]; if (b[0] - a[0] > 40) continue;   // intervalo sem movimento no meio
        dPos = Math.max(dPos, Math.hypot(b[col.x] - a[col.x], b[col.y] - a[col.y])); dTam = Math.max(dTam, Math.abs(b[col.w] - a[col.w]), Math.abs(b[col.h] - a[col.h]));
        dO = Math.max(dO, Math.abs(b[col.o] - a[col.o])); if (a[col.o] - b[col.o] > .15) quedaO++; dS = Math.max(dS, Math.abs(b[col.s] - a[col.s]), Math.abs(b[col.sx] - a[col.sx]), Math.abs(b[col.sy] - a[col.sy])); }
      r[id] = { quadros:ls.length, maiorPassoPosPx:+dPos.toFixed(2), maiorPassoTamPx:+dTam.toFixed(2), maiorPassoOpac:+dO.toFixed(3), quedasDeOpacidade:quedaO, maiorPassoEscala:+dS.toFixed(4) };
    }
    return { camLenta:fator, linhas:out.quadros.length, fases:[...new Set(out.eventos.map(e => e[2]))], porPeca:r };
  }
  async function cliquesFora(){
    const r = [], antes = SIM.DESK.cliques.length;
    for (const [x, y] of [[360, 540], [1360, 860], [2660, 340]]) r.push(await SIM.clicar(x, y));
    return { resultados:r.map(x => x.foi + ':' + (x.app || x.alvo)), cliquesNaAreaDeTrabalho:SIM.DESK.cliques.length - antes };
  }
  window.T = { pronto, zerar, prec, pega, alvo, clicarEm, encaixar, observar, fluxoSecoes, fluxoBotoes, fluxoTestes, fluxoArrasto, fluxoEmenda, camLenta, cliquesFora, st };
})();
