// cenários v3: extremidades do monitor 2, curvas de contato, estresse do passe, metades na emenda
(() => {
  const { delay } = SIM, st = T.st;
  const copias = () => SIM.FR.filter(F => SIM.bd(F.nome)?.pecas.has('sonda')).length;
  /* amostra a cada 16 ms a posição física da Sonda e o cursor: "salto" = a peça andou bem mais que o cursor num quadro */
  function vigiaSaltos(){
    const l = []; let on = true;
    const f = () => { if (!on) return; const s = SIM.sondaGlobal(); if (s) l.push([performance.now(), s.x, s.y, SIM.M.x, SIM.M.y, s.F.nome, s.P.drag ? 1 : 0]); setTimeout(f, 16); }; f();
    return () => { on = false; let saltos = 0, pior = 0; const ex = [];
      for (let i = 1; i < l.length; i++){ const a = l[i - 1], b = l[i]; if (a[5] !== b[5] || !b[6] || !a[6]) continue;
        const dp = Math.hypot(b[1] - a[1], b[2] - a[2]), dc = Math.hypot(b[3] - a[3], b[4] - a[4]), exc = dp - dc;
        if (exc > 14){ saltos++; if (ex.length < 4) ex.push({ dp:+dp.toFixed(1), dc:+dc.toFixed(1) }); } pior = Math.max(pior, exc); }
      return { amostras:l.length, saltosNoArrasto:saltos, piorExcessoPx:+pior.toFixed(1), exemplos:ex }; };
  }
  async function extremidades(){
  const saltosBoards = () => { const s = Object.values(T.prec()).filter(Boolean).map(p => p.saltos); return { quadros:s.reduce((a, b) => a + b.quadros, 0), acima16px:s.reduce((a, b) => a + b.acima16px, 0), maiorExcessoPx:Math.max(...s.map(b => b.maiorExcessoPx)), pegaMaxPx:Math.max(0, ...Object.values(T.prec()).filter(Boolean).map(p => p.pegaErroPx.max || 0)) }; };
    const r = {}, f = SIM.ds[1].fis, f1 = SIM.ds[0].fis;
    const alvoEm = async (nome, p, n = 70) => { const o = await T.encaixar(p, { n, parar:350, depois:1300 }); const sal = saltosBoards();
      r[nome] = `${o.dono} ${o.forma}/${o.degrau} ${Math.round(o.x)},${Math.round(o.y)} · quadros ${sal.quadros} · saltos>16px ${sal.acima16px} · maior excesso ${sal.maiorExcessoPx} px · pega máx ${sal.pegaMaxPx} px`; };
    await alvoEm('m2 meio', [f.x + f.w * .45, f.y + f.h * .45]);
    await alvoEm('m2 borda direita', [f.x + f.w - 20, f.y + f.h * .5]);
    await alvoEm('m2 borda de cima', [f.x + f.w * .6, f.y + 15]);
    await alvoEm('m2 borda de baixo', [f.x + f.w * .6, f.y + f.h - 15]);
    await alvoEm('m2 canto sup. dir.', [f.x + f.w - 25, f.y + 25]);
    await alvoEm('m2 canto inf. dir.', [f.x + f.w - 25, f.y + f.h - 25]);
    await alvoEm('m2 canto inf. esq. (junto do degrau)', [f.x + 40, f.y + f.h - 20], 140);
    { const s = SIM.sondaGlobal(), p = T.pega(); await alvoEm('m2 canto sup. esq. (emenda, devagar)', [f.x + (p[0] - s.x) + 14, f.y + (p[1] - s.y) + 10], 160); }   // o canto do painel chega a ~15 px do canto
    // rápido contra a parede direita: o elástico cede e volta; nada trava seco
    let p = T.pega(); T.zerar(); SIM.mover(...p); await delay(50); SIM.apertar(); await SIM.caminho(SIM.linha(p, [f.x + f.w + 300, p[1]], 12)); await delay(250);
    const s0 = SIM.sondaGlobal(); r['elástico cedeu (px)'] = +((s0.x + s0.w) - (f.x + f.w)).toFixed(1);
    SIM.soltar(); await delay(1400); const s1 = SIM.sondaGlobal(); r['depois de soltar'] = `${s1.F.nome} ${s1.P.forma}, lado direito em ${Math.round(s1.x + s1.w)} (o monitor acaba em ${f.x + f.w})`; r['saltos (rápido na parede)'] = saltosBoards();
    // pela quina do degrau: do monitor 1 pra faixa de 48 px que só existe à direita (y 1032..1080) e volta
    await T.encaixar([f1.x + 1400, f1.y + 600]);
    T.zerar(); p = T.pega(); SIM.mover(...p); await delay(50); SIM.apertar();
    await SIM.caminho(SIM.linha(p, [2050, 1060], 50)); await SIM.caminho(SIM.linha([2050, 1060], [1750, 1060], 40)); await SIM.caminho(SIM.linha([1750, 1060], [2300, 900], 40)); await delay(300); SIM.soltar(); await delay(1600);
    const s2 = SIM.sondaGlobal(); r['pela quina do degrau'] = `${s2.F.nome} ${s2.P.forma} · ${JSON.stringify(saltosBoards())}`;
    await delay(800); r.copias = copias(); r.erros = SIM.FR.map(F => SIM.bd(F.nome).erros);
    return r;
  }
  /* curvas contínuas: batida na parede (jogar contra ela) e elástico (arrastar além e soltar), em câmera lenta */
  async function curvas(){
    const B = SIM.sondaGlobal().b.B; const tr = [];
    const reg = () => { let on = true; const f = () => { if (!on) return; const q = SIM.sondaGlobal(); if (q) tr.push([performance.now(), q.x, q.P.vel[0], q.P.v[11]]); setTimeout(f, 8); }; f(); return () => { on = false; }; };
    await T.clicarEm('[data-t="recolher"]', 900);   // a cápsula (236×44): longe das bordas de cima e de baixo
    B.EF.camLenta = 1; await T.encaixar([700, 500]); B.EF.camLenta = .35;
    let p = T.pega(); SIM.mover(...p); await delay(40); SIM.apertar(); await SIM.caminho(SIM.linha(p, [p[0] - 420, p[1]], 7)); SIM.soltar(); let parar = reg(); await delay(3400); parar();
    const batida = tr.splice(0);
    B.EF.camLenta = 1; await T.encaixar([900, 500]); B.EF.camLenta = .35;
    const p2 = T.pega(); SIM.mover(...p2); await delay(40); SIM.apertar(); await SIM.caminho(SIM.linha(p2, [p2[0] - 1300, p2[1]], 70)); await delay(250); parar = reg(); await delay(120); SIM.soltar(); await delay(3400); parar();
    const elas = tr.splice(0); B.EF.camLenta = 1;
    const desc = l => { let mdv = 0, mdx = 0; for (let i = 1; i < l.length; i++){ mdx = Math.max(mdx, Math.abs(l[i][1] - l[i - 1][1])); mdv = Math.max(mdv, Math.abs(l[i][2] - l[i - 1][2])); } return { amostras:l.length, xMin:+Math.min(...l.map(v => v[1])).toFixed(1), maiorPassoX:+mdx.toFixed(2), maiorPassoV:+mdv.toFixed(1), amassouSx:+Math.min(...l.map(v => v[3])).toFixed(4) }; };
    SIM.grafico([{ nome:'batida: x (px)', cor:'#f0a98a', pts:batida.map(v => [v[0], v[1]]) }, { nome:'batida: velocidade x (px/s)', cor:'#8fd3ff', pts:batida.map(v => [v[0], v[2]]) }, { nome:'elástico: x (px)', cor:'#f0a98a', pts:elas.map(v => [v[0], v[1]]) }, { nome:'elástico: velocidade x (px/s)', cor:'#8fd3ff', pts:elas.map(v => [v[0], v[2]]) }], 'câmera lenta 0,35× · batida na parede e elástico');
    return { batida:desc(batida), elastico:desc(elas) };
  }
  async function passes(n = 8){
    const r = [], f2 = SIM.ds[1].fis;
    for (let i = 0; i < n; i++){
      const s = SIM.sondaGlobal(), indo = s.F.nome === 'A', p = T.pega();
      SIM.mover(...p); await delay(40); SIM.apertar(); await SIM.caminho(SIM.linha(p, [indo ? f2.x + 500 : 900, p[1]], 14)); SIM.soltar();
      await delay(1500); const q = SIM.sondaGlobal(); r.push(`${s.F.nome}→${q?.F.nome}`);
    }
    const P1 = SIM.bd('A').B.PASSE, P2 = SIM.bd('B').B.PASSE;
    return { sequencia:r.join(' '), copias:copias(), adotados:P1.adotados + P2.adotados, liberados:P1.liberados + P2.liberados, cancelados:P1.cancelados + P2.cancelados, devolvidos:P1.devolvidos + P2.devolvidos,
      latencia:{ bc:st([...P1.latPorCanal.bc, ...P2.latPorCanal.bc]), arquivo:st([...P1.latPorCanal.arquivo, ...P2.latPorCanal.arquivo]) }, lidasQuebradas:P1.lidasQuebradas + P2.lidasQuebradas, foraDeOrdem:P1.foraDeOrdem + P2.foraDeOrdem };
  }
  async function fecharNoMeio(espera = 15){
    let s = SIM.sondaGlobal(); if (s.F.nome !== 'A'){ await passes(1); s = SIM.sondaGlobal(); }
    const p = T.pega(), f2 = SIM.ds[1].fis; SIM.mover(...p); await delay(40); SIM.apertar(); await SIM.caminho(SIM.linha(p, [f2.x + 500, p[1]], 12)); SIM.soltar();
    await delay(espera); SIM.fechar('B');
    const t0 = performance.now(); let volta = null; for (let i = 0; i < 100; i++){ await delay(100); const q = SIM.sondaGlobal(); if (q && q.F.nome === 'A' && !q.P.passando){ volta = Math.round(performance.now() - t0); break; } }
    await delay(800); const q = SIM.sondaGlobal();
    return { fechouApos_ms:espera, voltouProA_ms:volta, dono:q?.F.nome, forma:q?.P.forma, copias:copias(), erros:SIM.bd('A').erros };
  }
  async function metades(){
    const f1 = SIM.ds[0].fis; await T.encaixar([f1.x + 1300, 400]);
    for (const F of SIM.FR){ const b = SIM.bd(F.nome); b.POSES.l = []; b.POSES.on = true; }
    const p = T.pega(); SIM.mover(...p); await delay(40); SIM.apertar();
    await SIM.caminho(SIM.linha(p, [f1.x + f1.w - 150, p[1]], 30));
    for (const F of SIM.FR) SIM.bd(F.nome).POSES.l = [];
    await SIM.caminho(SIM.linha([f1.x + f1.w - 150, p[1]], [f1.x + f1.w + 150, p[1]], 75));       // ~250 px/s, constante, metade em cada monitor
    const lA = SIM.bd('A').POSES.l.slice(), lB = SIM.bd('B').POSES.l.slice();
    await delay(400); for (const F of SIM.FR) SIM.bd(F.nome).POSES.l = []; await delay(600);          // parado no meio da emenda (depois de 400 ms: regime)
    const pB = SIM.bd('B').POSES.l.filter(v => v[3] === 1), pA = SIM.bd('A').POSES.l.filter(v => v[3] === 0);
    SIM.soltar(); await delay(1500); for (const F of SIM.FR) SIM.bd(F.nome).POSES.on = false;
    const dono = lA.filter(v => v[3] === 0), fant = lB.filter(v => v[3] === 1), err = [];
    for (const g of fant){ const i = dono.findIndex(v => v[0] >= g[0]); if (i <= 0) continue; const a = dono[i - 1], b = dono[i], u = (g[0] - a[0]) / (b[0] - a[0]); err.push(Math.hypot(g[1] - (a[1] + (b[1] - a[1]) * u), g[2] - (a[2] + (b[2] - a[2]) * u))); }
    const jit = l => l.length ? +(Math.max(...l.map(v => Math.hypot(v[1] - l[0][1], v[2] - l[0][2])))).toFixed(3) : null;
    const hz = l => l.length > 2 ? +(1000 / ((l.at(-1)[0] - l[0][0]) / (l.length - 1))).toFixed(1) : null;
    return { cfg:SIM.NOME_CFG, quadrosDono:dono.length, hzDono:hz(dono), quadrosFantasma:fant.length, hzFantasma:hz(fant), erroEntreMetadesPx:st(err), jitterParadoFantasmaPx:jit(pB), jitterParadoDonoPx:jit(pA), copias:copias() };
  }
  Object.assign(T, { vigiaSaltos, extremidades, curvas, passes, fecharNoMeio, metades });
})();
(() => {
  const { delay } = SIM;
  // donos ao longo do tempo: cópias que NÃO estão em oferta (a meta é sempre 1)
  T.donos = () => { const l = []; let on = true; const f = () => { if (!on) return; let n = 0, ofertas = 0; for (const F of SIM.FR){ const P = SIM.bd(F.nome)?.pecas.get('sonda'); if (P){ if (P.passando) ofertas++; else n++; } } l.push([n, ofertas]); setTimeout(f, 10); }; f();
    return () => { on = false; return { amostras:l.length, maxDonos:Math.max(...l.map(v => v[0])), minDonos:Math.min(...l.map(v => v[0])), amostrasSemDono:l.filter(v => v[0] === 0 && v[1] === 0).length }; }; };
})();
