/* ===================== motor de movimento v2 (igual na Órbita, na Onda e no Eco) =====================
   Um motor só pra mexer a janela: física, envio pro Windows e o gesto do mouse.

   POSIÇÃO: a posição "lógica" (cur) anda numa mola, em ponto flutuante. A janela real é frame(cur), arredondada
   só na hora de mandar (nunca acumula erro). Toda ida pro Windows passa por uma bomba que roda no quadro (rAF):
   no máximo UM setBounds por quadro, sem esperar a volta do anterior (até 5 em voo; o Windows aplica em ordem).
   Arrastando, a posição nunca passa da área das telas (o app prende a janela dentro da tela): o motor acredita no
   que o Windows realmente faz e não cria "zona morta" quando o mouse volta. Assentando, quem manda é o destino
   que o app calculou (ele já cabe na tela).

   TAMANHO: mudar o tamanho é um "commit": tamanho novo + quanto a janela anda + o que mudar no CSS. O CSS só é
   aplicado quando a janela já está no lugar novo (no evento resize, que roda antes do próximo desenho), então o
   conteúdo nunca pisca fora do lugar. Commits seguidos se juntam (deslocamentos somam, vale o tamanho mais novo).

   ARRASTO: a janela persegue o mouse numa mola criticamente amortecida com "feed-forward" da velocidade do mouse
   (segue macio, mas sem atraso em velocidade constante). Soltando, a velocidade real (regressão nos últimos 80 ms,
   com os eventos agrupados do navegador) vira embalo; o destino é onde ela pararia com atrito.

   GESTO: máquina de estados explícita (parado → pressionado → arrastando → soltando → assentando). O limiar do
   arrasto é separado do clique, e o fim é garantido: pointerup, pointercancel, botão já solto (buttons===0),
   janela perdeu o foco, aba escondida, novo pointerdown, e um tempo-limite de segurança. */
function createMotor(cfg){
  const getDesktop = typeof cfg.desktop === 'function' ? cfg.desktop : () => cfg.desktop;
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spring = (k, z) => ({ k, c:2 * Math.sqrt(k) * z });
  const SP = Object.assign({ drag:[1500, 1], settle:[210, .86], firm:[240, 1], soft:[130, 1] }, cfg.springs || {});
  const DRAG = spring(...SP.drag), SETTLE = spring(...SP.settle), FIRM = spring(...SP.firm), SOFT = spring(...SP.soft);
  const slow = cfg.slow || (() => 1);
  const S = {
    cur:null, w:cfg.width || 0, h:cfg.height || 0, vx:0, vy:0, tx:0, ty:0, k:SETTLE.k, c:SETTLE.c,
    mode:'idle', raf:0, last:0, waiters:[], drag:null, ds:null, dsAt:0, dsKey:'',
    inflight:0, want:false, pending:null, sent:null, landing:null, strict:0,
    tvx:0, tvy:0,                            // velocidade do alvo (feed-forward do arrasto)
    lift:0, liftV:0, bump:0, bumpV:0, bumpN:{ x:0, y:0 }, land:null, over:{ x:0, y:0 },
  };
  const stats = { sets:0, frames:0, maxPerFrame:0, overlaps:0, setsThisFrame:0, frameTimes:[], applies:0, clamps:0 };

  /* ---------- telas ---------- */
  const inside = (d, p) => p.x >= d.bounds.x && p.x < d.bounds.x + d.bounds.width && p.y >= d.bounds.y && p.y < d.bounds.y + d.bounds.height;
  function displayFor(p, ds = S.ds || []){
    let best = ds[0], bd = Infinity;
    for (const d of ds){
      if (inside(d, p)) return d;
      const b = d.bounds, dx = Math.max(b.x - p.x, 0, p.x - (b.x + b.width)), dy = Math.max(b.y - p.y, 0, p.y - (b.y + b.height));
      if (dx*dx + dy*dy < bd){ bd = dx*dx + dy*dy; best = d; }
    }
    return best;
  }
  async function displays(fresh){
    if (fresh || !S.ds || performance.now() - S.dsAt > 4000){
      try {
        const ds = await getDesktop().screen.getAllDisplays();
        if (Array.isArray(ds) && ds.length){
          const key = JSON.stringify(ds.map(d => [d.id, d.bounds, d.workArea, d.scaleFactor]));
          const changed = S.dsKey && key !== S.dsKey;
          S.ds = ds; S.dsAt = performance.now(); S.dsKey = key;
          if (changed) cfg.onDisplaysChanged?.(ds);
        }
      } catch {}
    }
    return S.ds || [];
  }
  /** a janela (rect) tem de ficar dentro das telas: devolve o deslocamento que o Windows aplicaria */
  function screenClamp(r){
    const ds = S.ds; if (!ds || !ds.length || cfg.clamp === false) return { dx:0, dy:0 };
    // telas que cruzam a faixa vertical/horizontal da janela (assim dá pra passar de um monitor pro outro)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const d of ds){
      const b = d.bounds;
      if (b.y < r.y + r.height && b.y + b.height > r.y){ minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x + b.width); }
      if (b.x < r.x + r.width && b.x + b.width > r.x){ minY = Math.min(minY, b.y); maxY = Math.max(maxY, b.y + b.height); }
    }
    if (minX === Infinity){ const d = displayFor({ x:r.x + r.width / 2, y:r.y + r.height / 2 }, ds).bounds; minX = d.x; maxX = d.x + d.width; }
    if (minY === Infinity){ const d = displayFor({ x:r.x + r.width / 2, y:r.y + r.height / 2 }, ds).bounds; minY = d.y; maxY = d.y + d.height; }
    let dx = 0, dy = 0;
    if (r.width <= maxX - minX){ if (r.x < minX) dx = minX - r.x; else if (r.x + r.width > maxX) dx = maxX - (r.x + r.width); }
    if (r.height <= maxY - minY){ if (r.y < minY) dy = minY - r.y; else if (r.y + r.height > maxY) dy = maxY - (r.y + r.height); }
    return { dx, dy };
  }

  /* ---------- a janela real a partir da posição lógica ---------- */
  const frame = cfg.frame || (p => ({ x:Math.round(p.x), y:Math.round(p.y), width:S.w, height:S.h }));
  const unframe = cfg.unframe || (b => ({ x:b.x, y:b.y }));
  /** prende a posição lógica pra a janela não sair das telas (zera a velocidade contra a parede) */
  function keepIn(){
    if (!S.cur) return;
    const c = screenClamp(frame(S.cur));
    // bateu na borda arrastando rápido: a janela para (o Windows não deixa passar), mas a batida vira o micro-amassado
    // contra a borda (o mesmo do encaixe), proporcional à velocidade, pra não parecer uma parede seca
    const hit = (v, n) => { const s = Math.abs(v); if (s > 500 && !reduce && S.bump < .05){ S.bumpN = n; S.bumpV += Math.min(1, s / 3000) * 6; stats.hits = (stats.hits || 0) + 1; } };
    if (c.dx){ S.cur.x += c.dx; if (Math.sign(S.vx) === -Math.sign(c.dx)){ hit(S.vx, { x:-Math.sign(c.dx), y:0 }); S.vx = 0; } stats.clamps++; }
    if (c.dy){ S.cur.y += c.dy; if (Math.sign(S.vy) === -Math.sign(c.dy)){ hit(S.vy, { x:0, y:-Math.sign(c.dy) }); S.vy = 0; } stats.clamps++; }
  }
  /** quanto a janela ainda pode andar pra cada lado até a parede da tela (pro freio de aproximação) */
  function wallRoom(){
    if (!S.ds || !S.ds.length || !S.cur || cfg.clamp === false) return null;
    const r = frame(S.cur), BIG = 1e5;
    return {
      x0:S.cur.x, y0:S.cur.y,
      r:BIG + screenClamp({ ...r, x:r.x + BIG }).dx, l:BIG - screenClamp({ ...r, x:r.x - BIG }).dx,
      b:BIG + screenClamp({ ...r, y:r.y + BIG }).dy, t:BIG - screenClamp({ ...r, y:r.y - BIG }).dy,
    };
  }
  function clampTarget(){
    const c = screenClamp(frame({ x:S.tx, y:S.ty }));
    S.tx += c.dx; S.ty += c.dy;
  }
  /** o que vai pro Windows: nunca maior que a tela (por eixo) e nunca fora dela (por eixo, um eixo não trava o outro).
      Janela maior que a tela fazia o host recusar o setBounds inteiro: a janela parava nos dois eixos ("não arrasta
      pros lados"). Com strict (depois de uma recusa), usa só a área útil do monitor do centro da janela. */
  function fitRect(r, strict){
    const ds = S.ds; if (!ds || !ds.length || cfg.clamp === false) return r;
    const o = { ...r };
    const c0 = { x:r.x + r.width / 2, y:r.y + r.height / 2 }, d0 = displayFor(c0, ds);
    if (strict){
      const a = d0.workArea || d0.bounds;
      o.width = Math.min(o.width, a.width); o.height = Math.min(o.height, a.height);
      o.x = Math.max(a.x, Math.min(a.x + a.width - o.width, o.x)); o.y = Math.max(a.y, Math.min(a.y + a.height - o.height, o.y));
      return o;
    }
    // teto por eixo: a maior tela que a janela cruza naquele eixo
    let maxW = 0, maxH = 0;
    for (const d of ds){
      const b = d.bounds;
      if (b.x < o.x + o.width && b.x + b.width > o.x) maxH = Math.max(maxH, b.height);
      if (b.y < o.y + o.height && b.y + b.height > o.y) maxW += b.width;    // telas lado a lado somam (atravessar a emenda)
    }
    if (!maxH) maxH = d0.bounds.height; if (!maxW) maxW = d0.bounds.width;
    if (o.height > maxH){ o.height = maxH; stats.capped = (stats.capped || 0) + 1; }
    if (o.width > maxW){ o.width = maxW; stats.capped = (stats.capped || 0) + 1; }
    const c = screenClamp(o); o.x += c.dx; o.y += c.dy;
    return o;
  }

  /* ---------- bomba: no máximo um setBounds por quadro, em fila curta ----------
     No app instalado o setBounds leva ~50–70 ms pra voltar. Esperar a volta antes de mandar o próximo (v2)
     deixava a janela andar só ~15 vezes por segundo, aos saltos de 100–500 px. Agora vai um por quadro, sem
     esperar, com no máximo MAXFLY em voo (o Windows aplica em ordem); se a fila encher, o quadro pula e o
     próximo manda a posição mais nova. Assim a janela anda todo quadro, com ~1 a 3 quadros de atraso. */
  const MAXFLY = cfg.maxInFlight ?? 5;
  function pump(){
    if (!S.cur) return;
    const desk = getDesktop(); if (!desk?.window) return;
    const c = S.pending;
    if (!S.want && !c) return;
    if (S.inflight >= MAXFLY){ stats.full = (stats.full || 0) + 1; return; }
    // um commit com CSS só sai depois que o CSS do anterior entrou (a ordem janela ↔ CSS não pode cruzar)
    if (c && S.landing) return;
    S.pending = null; S.want = false;
    if (S.mode === 'drag') keepIn();            // arrastando, a janela não passa da tela (o Windows também não deixa)
    const r = fitRect(frame(S.cur), S.strict > 0);
    if (S.strict > 0) S.strict--;
    const sized = !S.sent || S.sent.width !== r.width || S.sent.height !== r.height;
    if (!c && S.sent && S.sent.x === r.x && S.sent.y === r.y && !sized) return;
    S.inflight++; stats.sets++; stats.setsThisFrame++;
    if (stats.setsThisFrame > stats.maxPerFrame) stats.maxPerFrame = stats.setsThisFrame;
    if (S.inflight > (stats.maxFly || 0)) stats.maxFly = S.inflight;
    const sent = { ...r }, t0 = performance.now();
    S.sent = sent;                              // o último pedido (pra não repetir o mesmo)
    Promise.resolve().then(() => desk.window.setBounds(sent)).catch(err => {
      // o Windows recusou (ex.: janela que não cabe): nada de ficar parado calado; os próximos 10 envios vão
      // encaixados na área útil do monitor, e o erro fica registrado pro diagnóstico
      stats.rejects = (stats.rejects || 0) + 1; stats.lastError = String(err?.message || err).slice(0, 160);
      S.strict = 10; if (S.sent === sent) S.sent = null; S.want = true;
    }).finally(() => {
      S.inflight--; const lat = performance.now() - t0;
      stats.lat = stats.lat ? stats.lat * .9 + lat * .1 : lat;     // atraso médio do Windows (diagnóstico)
      if (c) land(c, sent, sized); else kick();
    });
  }
  /** o commit chegou no Windows: aplica o CSS quando a janela já tem o tamanho novo (no resize, antes do próximo desenho) */
  function land(c, r, sized){
    const done = () => {
      if (S.landing !== L) return;
      S.landing = null; removeEventListener('resize', onR); clearTimeout(to);
      c.apply.forEach(f => { try { f(); } catch (err) { console.error(err); } }); stats.applies++;
      c.done.forEach(f => f());
      kick();
    };
    const matches = () => Math.abs(innerWidth - r.width) <= 1 && Math.abs(innerHeight - r.height) <= 1;
    const onR = () => { if (matches()) done(); };
    const L = {}; S.landing = L;
    let to = 0;
    if (!sized || !c.apply.length || matches()){ done(); return; }
    addEventListener('resize', onR);
    to = setTimeout(done, 100);                         // garantia: se o resize não vier, aplica assim mesmo
  }
  /** muda posição e/ou tamanho já (estado lógico) e manda tudo junto no próximo quadro;
      apply = o CSS que só entra quando a janela chegar lá. Commits seguidos se juntam num envio só. */
  function commit({ x, y, dx = 0, dy = 0, width, height, apply, keepTarget } = {}){
    if (!S.cur) S.cur = { x:x ?? 0, y:y ?? 0 };
    if (x != null){
      if (S.drag){ S.drag.wx += x - S.cur.x; S.drag.wy += y - S.cur.y; }
      S.cur.x = x; S.cur.y = y;
      if (!keepTarget){ S.tx = x; S.ty = y; }
    } else if (dx || dy){
      S.cur.x += dx; S.cur.y += dy; S.tx += dx; S.ty += dy;
      if (S.drag){ S.drag.wx += dx; S.drag.wy += dy; }
    }
    if (width) S.w = width; if (height) S.h = height;
    const c = S.pending || (S.pending = { apply:[], done:[] });
    if (apply) c.apply.push(apply);
    const p = new Promise(r => c.done.push(r));
    kick();
    return p;
  }

  /* ---------- física ---------- */
  function finish(){
    S.cur.x = S.tx; S.cur.y = S.ty; S.vx = S.vy = 0;
    const landed = S.land; S.land = null;
    S.mode = 'idle'; S.want = true;
    if (landed && !reduce){
      // assentou numa borda: um micro-amassado na direção da batida, que volta numa mola (bem pouco)
      const amt = Math.min(1, landed.speed / 1800);
      if (amt > .08){ S.bumpN = landed.n; S.bumpV += amt * 9; }
    }
    const w = S.waiters; S.waiters = []; w.forEach(f => f());
    checkHost();
  }
  function step(dt){
    if (S.mode === 'idle' || !S.cur) return;
    const n = 4, h = dt / n, ff = S.mode === 'drag' && S.drag;
    // arrastando: entre um evento do mouse e outro, prevê onde ele está (velocidade × tempo, até 1 quadro);
    // se o mouse parou (34 ms sem evento), o feed-forward some e a janela assenta no ponto exato
    let gx = S.tx, gy = S.ty, fvx = 0, fvy = 0;
    if (ff){
      const age = (performance.now() - (S.drag.at || 0)) / 1000;
      const H = .017, k = age < H ? age : Math.max(0, H - (age - H)), f = age < H ? 1 : Math.max(0, 1 - (age - H) / H);   // no máximo 1 quadro; some macio
      gx += S.tvx * k; gy += S.tvy * k; fvx = S.tvx * f; fvy = S.tvy * f;
    }
    // freio de aproximação (só arrastando): perto de uma parede da tela, a velocidade rumo a ela fica limitada a
    // √(2·A·distância). A janela chega encostada do mesmo jeito, mas desacelera nos últimos px em vez de bater seco
    // (antes: chegava a ~6000 px/s e parava em 1 quadro). A = 90000 px/s² ⇒ a 20 px no máx. ~1900 px/s.
    const room = ff ? wallRoom() : null, A = 90000;
    for (let i = 0; i < n; i++){
      const ax = S.k * (gx - S.cur.x) + S.c * (fvx - S.vx);
      const ay = S.k * (gy - S.cur.y) + S.c * (fvy - S.vy);
      S.vx += ax * h; S.vy += ay * h;
      if (room){
        const dxw = S.vx > 0 ? room.r - (S.cur.x - room.x0) : (S.cur.x - room.x0) + room.l, dyw = S.vy > 0 ? room.b - (S.cur.y - room.y0) : (S.cur.y - room.y0) + room.t;
        const capX = Math.sqrt(2 * A * Math.max(0, dxw)), capY = Math.sqrt(2 * A * Math.max(0, dyw));
        if (Math.abs(S.vx) > capX){ S.vx = Math.sign(S.vx) * capX; stats.brakes = (stats.brakes || 0) + 1; }
        if (Math.abs(S.vy) > capY){ S.vy = Math.sign(S.vy) * capY; stats.brakes = (stats.brakes || 0) + 1; }
      }
      S.cur.x += S.vx * h; S.cur.y += S.vy * h;
    }
    if (S.mode === 'drag'){
      keepIn();
      // quanto o mouse empurra além da tela (a janela parou na borda): o app pode levar o conteúdo até a beira
      const c = screenClamp(frame({ x:S.tx, y:S.ty })); S.over.x = -c.dx; S.over.y = -c.dy;
    } else if (S.over.x || S.over.y){ S.over.x = 0; S.over.y = 0; }
    if (S.mode !== 'drag' && Math.abs(S.tx - S.cur.x) < .35 && Math.abs(S.ty - S.cur.y) < .35 && Math.hypot(S.vx, S.vy) < 6) finish();
    else S.want = true;
  }
  function feel(dt){
    // levantar (0..1): sobe ao pegar, desce ao soltar, numa mola
    const lt = S.mode === 'drag' && !reduce ? 1 : 0;
    { const k = 520, c = 2 * Math.sqrt(k) * .9; S.liftV += (k * (lt - S.lift) - c * S.liftV) * dt; S.lift += S.liftV * dt; }
    if (Math.abs(S.lift - lt) < .002 && Math.abs(S.liftV) < .01){ S.lift = lt; S.liftV = 0; }
    { const k = 900, c = 2 * Math.sqrt(k) * .45; S.bumpV += (-k * S.bump - c * S.bumpV) * dt; S.bump += S.bumpV * dt; }
    if (Math.abs(S.bump) < .0008 && Math.abs(S.bumpV) < .01){ S.bump = 0; S.bumpV = 0; }
    const still = S.mode === 'idle' || reduce;
    const f = { vx:still ? 0 : S.vx, vy:still ? 0 : S.vy, speed:still ? 0 : Math.hypot(S.vx, S.vy), lift:Math.max(0, S.lift),
                bump:S.bump, bumpN:S.bumpN, over:S.over, mode:S.mode, dragging:S.mode === 'drag', reduce };
    return cfg.feel ? !!cfg.feel(f, dt) : false;
  }
  function loop(t){
    S.raf = 0;
    const raw = S.last ? (t - S.last) / 1000 : 1 / 60; S.last = t;
    if (stats.on){ stats.frames++; stats.frameTimes.push(raw * 1000); if (stats.frameTimes.length > 600) stats.frameTimes.shift(); }
    stats.setsThisFrame = 0;
    const dt = Math.min(1 / 30, raw) / slow();
    step(dt);
    const busyFeel = feel(dt) || S.lift !== 0 || S.bump !== 0;
    pump();
    cfg.onFrame?.(dt);
    if (S.mode !== 'idle' || busyFeel || S.want || S.pending || S.inflight || S.landing || stats.on) S.raf = requestAnimationFrame(loop);
    else S.last = 0;
  }
  function kick(){ if (!S.raf){ if (!S.last) S.last = 0; S.raf = requestAnimationFrame(loop); } }
  const settled = () => new Promise(r => S.mode === 'idle' ? r() : S.waiters.push(r));

  /* ---------- velocidade do mouse: regressão linear nos últimos 80 ms ---------- */
  function velocity(samples, now){
    const W = 80, s = samples.filter(p => now - p.t <= W + 20);
    if (s.length < 2) return { vx:0, vy:0 };
    const last = s[s.length - 1];
    if (now - last.t > 60) return { vx:0, vy:0 };        // parou antes de soltar: sem embalo
    let st = 0, sx = 0, sy = 0, stt = 0, stx = 0, sty = 0; const n = s.length, t0 = last.t;
    for (const p of s){ const t = (p.t - t0) / 1000; st += t; sx += p.x; sy += p.y; stt += t * t; stx += t * p.x; sty += t * p.y; }
    // amostras coladas no tempo (ex.: o clique e o primeiro movimento no mesmo milissegundo) dão velocidade absurda:
    // só confia com pelo menos 12 ms de janela, e nunca acima de 6000 px/s
    if (last.t - s[0].t < 12) return { vx:0, vy:0 };
    const den = n * stt - st * st; if (Math.abs(den) < 1e-9) return { vx:0, vy:0 };
    let vx = (n * stx - st * sx) / den, vy = (n * sty - st * sy) / den;
    const sp = Math.hypot(vx, vy); if (sp > 6000){ vx *= 6000 / sp; vy *= 6000 / sp; }
    return { vx, vy };
  }
  function pushSamples(d, e){
    const list = e.getCoalescedEvents?.() || [];
    const evs = list.length ? list : [e];
    for (const q of evs){
      const t = q.timeStamp && q.timeStamp > 0 && Math.abs(q.timeStamp - performance.now()) < 1000 ? q.timeStamp : performance.now();
      if (d.samples.length && t <= d.samples[d.samples.length - 1].t) continue;
      d.samples.push({ t, x:q.screenX, y:q.screenY });
    }
    const now = d.samples.length ? d.samples[d.samples.length - 1].t : performance.now();
    while (d.samples.length > 2 && now - d.samples[0].t > 160) d.samples.shift();
  }

  /** ao assentar, confere com o Windows onde a janela ficou de verdade: se a trava dele (ex.: na emenda dos monitores)
      segurou a janela num lugar diferente do que o motor achava, a posição lógica passa a ser a real (sem erro acumulado) */
  function checkHost(){
    const w = getDesktop()?.window; if (!w?.getBounds) return;
    setTimeout(() => {
      if (S.inflight || S.mode !== 'idle' || !S.sent) return;
      const s = S.sent;
      w.getBounds().then(b => {
        if (S.inflight || S.mode !== 'idle' || S.sent !== s) return;
        const dx = b.x - s.x, dy = b.y - s.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1){ S.cur.x += dx; S.cur.y += dy; S.tx = S.cur.x; S.ty = S.cur.y; S.sent = { ...b }; stats.hostFix = (stats.hostFix || 0) + 1; cfg.onHostMoved?.(dx, dy); kick(); }
      }).catch(() => {});
    }, 200);
  }

  const api = {
    S, stats, displays, displayFor, inside, commit,
    get ready(){ return !!S.cur; },
    get moving(){ return S.mode !== 'idle'; },
    get dragging(){ return S.mode === 'drag'; },
    get phase(){ return S.mode; },
    get cached(){ return S.ds || []; },
    get size(){ return { w:S.w, h:S.h }; },
    /** para onde a janela está indo (ou onde está, parada) — posição lógica + tamanho */
    get target(){ return S.cur ? { x:Math.round(S.tx), y:Math.round(S.ty), width:S.w, height:S.h } : null; },
    get pos(){ return S.cur ? { x:S.cur.x, y:S.cur.y } : null; },
    get now(){ return S.cur ? { x:S.cur.x, y:S.cur.y } : null; },
    get vel(){ return { x:S.vx, y:S.vy }; },
    get busy(){ return S.inflight > 0 || !!S.pending || !!S.landing; },
    settled,
    /** roda fn quando não houver nada indo pro Windows */
    afterFlush(fn){ if (!api.busy) fn(); else { const c = S.pending; if (c) c.apply.push(fn); else { const t = () => api.busy ? requestAnimationFrame(t) : fn(); requestAnimationFrame(t); } } },
    refresh(){ S.want = true; kick(); },
    async sync(){
      const b = await getDesktop().window.getBounds();
      const p = unframe(b);
      S.cur = { x:p.x, y:p.y }; S.tx = p.x; S.ty = p.y; S.vx = S.vy = 0;
      if (!cfg.frame){ S.w = b.width; S.h = b.height; }
      S.sent = { ...b };
      displays(true);
      return b;
    },
    /** vai direto, sem animar (com tamanho e CSS juntos, se vierem) */
    set(r, { apply } = {}){
      if (!S.cur) S.cur = { x:r.x, y:r.y };
      if (S.mode !== 'drag'){ S.vx = S.vy = 0; if (S.mode !== 'idle'){ S.mode = 'idle'; S.land = null; const w = S.waiters; S.waiters = []; w.forEach(f => f()); } }
      return commit({ x:r.x, y:r.y, width:r.width, height:r.height, apply });
    },
    /** anda até r numa mola. vx/vy: embalo de um arrasto; firm: sem passar do ponto (encaixe numa borda);
        land: {x:-1|0|1, y:-1|0|1} a borda em que vai bater (pro micro-amassado) */
    glide(r, { vx, vy, soft, firm, land } = {}){
      if (!S.cur || reduce) return api.set(r);
      if ((r.width && r.width !== S.w) || (r.height && r.height !== S.h)) commit({ width:r.width || S.w, height:r.height || S.h });
      S.tx = r.x; S.ty = r.y;
      if (vx != null){
        // embalo só na direção do destino e nunca mais do que ele "pede" (senão passa do ponto e volta)
        const cap = (v, d) => (Math.sign(v) !== Math.sign(d) || !d) ? 0 : Math.sign(d) * Math.min(Math.abs(v), Math.abs(d) / .13);
        S.vx = cap(vx, S.tx - S.cur.x); S.vy = cap(vy, S.ty - S.cur.y);
      }
      const sp = soft ? SOFT : firm ? FIRM : SETTLE; S.k = sp.k; S.c = sp.c;
      S.land = land ? { n:{ x:land.x || 0, y:land.y || 0 }, speed:Math.hypot(S.vx, S.vy) + Math.hypot(S.tx - S.cur.x, S.ty - S.cur.y) * 3 } : null;
      if (S.mode !== 'drag') S.mode = 'glide';
      if (S.mode !== 'drag' && Math.abs(S.tx - S.cur.x) < .5 && Math.abs(S.ty - S.cur.y) < .5 && Math.hypot(S.vx, S.vy) < 6){ finish(); kick(); return Promise.resolve(); }
      kick(); return settled();
    },
    /** a janela muda de tamanho e anda (dx, dy) junto com o CSS (apply), no mesmo quadro, pra nada pular */
    reshape(w, h, dx = 0, dy = 0, apply){
      if (!S.cur) return Promise.resolve();
      return commit({ width:w, height:h, dx, dy, apply });
    },
    /** o conteúdo andou (dx, dy) dentro da janela: a janela anda o contrário, junto com o CSS */
    shift(dx, dy, apply){ if (!S.cur || (!dx && !dy && !apply)) return Promise.resolve(); return commit({ dx, dy, apply }); },
    /** o ponto que o mouse segura mudou de lugar dentro da janela: o destino anda, a mola leva a janela até lá */
    regrab(dx, dy){
      if (!S.cur || (!dx && !dy)) return;
      S.tx += dx; S.ty += dy;
      if (S.drag){ S.drag.wx += dx; S.drag.wy += dy; }
      if (S.mode === 'idle'){ S.mode = 'glide'; S.k = SETTLE.k; S.c = SETTLE.c; }
      kick();
    },
    /** começa a arrastar (o gesto já passou do limiar). from = onde o botão desceu */
    startDrag(e, from){
      if (!S.cur) return;
      const sx = from?.screenX ?? e.screenX, sy = from?.screenY ?? e.screenY;
      S.drag = { sx, sy, wx:S.cur.x, wy:S.cur.y, samples:[{ t:(from?.t ?? performance.now()), x:sx, y:sy }], lx:e.screenX, ly:e.screenY };
      S.mode = 'drag'; S.k = DRAG.k; S.c = DRAG.c; S.tvx = S.tvy = 0; S.land = null;
      root.classList.add('lifted');
      displays(true);
      api.moveDrag(e);
    },
    moveDrag(e){
      const d = S.drag; if (!d) return;
      const mx = e.screenX - (d.lx ?? e.screenX), my = e.screenY - (d.ly ?? e.screenY);
      d.lx = e.screenX; d.ly = e.screenY; d.at = performance.now();
      S.tx = d.wx + e.screenX - d.sx; S.ty = d.wy + e.screenY - d.sy;
      // o alvo pode passar da borda empurrando CONTRA ela (o app "sente" o lado por ele; a janela para na borda).
      // Mas se o alvo está além de uma parede e o mouse anda PRA LONGE dela, o ponto seguro escorrega: a janela
      // acompanha o mouse na hora, sem zona morta. (Num app grande, a troca de forma joga o alvo centenas de px
      // pra fora da tela; sem isso, arrastar pros lados "não andava" até o mouse vencer essa distância.)
      const c = screenClamp(frame({ x:S.tx, y:S.ty }));
      if (c.dx && Math.sign(mx) === Math.sign(c.dx)){ d.wx += c.dx; S.tx += c.dx; stats.slips = (stats.slips || 0) + 1; }
      if (c.dy && Math.sign(my) === Math.sign(c.dy)){ d.wy += c.dy; S.ty += c.dy; stats.slips = (stats.slips || 0) + 1; }
      pushSamples(d, e);
      const v = velocity(d.samples, d.samples[d.samples.length - 1].t);
      // feed-forward suavizado: o alvo "puxa" a janela com a velocidade do mouse (zero atraso andando reto)
      S.tvx += (v.vx - S.tvx) * .5; S.tvy += (v.vy - S.tvy) * .5;
      if (reduce){ S.cur.x = S.tx; S.cur.y = S.ty; }
      kick();
    },
    /** onde a janela pararia se soltasse agora (pra mostrar a prévia do encaixe antes de soltar) */
    projected(tau = .14){
      const d = S.drag; if (!d) return S.cur ? { x:S.tx, y:S.ty } : null;
      const v = velocity(d.samples, performance.now());
      return { x:S.tx + v.vx * tau, y:S.ty + v.vy * tau, vx:v.vx, vy:v.vy };
    },
    /** solta: devolve o embalo e onde a janela pararia por inércia (com atrito) */
    endDrag(tau = .14){
      const d = S.drag; S.drag = null;
      root.classList.remove('lifted');
      if (!d) return null;
      let { vx, vy } = velocity(d.samples, performance.now());
      const sp = Math.hypot(vx, vy), max = 3200;
      if (sp > max){ vx *= max / sp; vy *= max / sp; }
      if (sp < 120){ vx = 0; vy = 0; }                 // gesto parado: sem embalo, só assenta
      S.tvx = S.tvy = 0;
      S.mode = 'glide'; S.k = SETTLE.k; S.c = SETTLE.c;
      kick();
      return { vx, vy, tau, rest:{ x:Math.round(S.tx + vx * tau), y:Math.round(S.ty + vy * tau), width:S.w, height:S.h } };
    },
    /** cancela o arrasto sem embalo (ex.: o soltar se perdeu) */
    cancelDrag(){ const r = api.endDrag(); if (r){ r.vx = r.vy = 0; r.rest = { x:Math.round(S.tx), y:Math.round(S.ty), width:S.w, height:S.h }; } return r; },
    /** medidor (testes): fps e setBounds por quadro */
    meter(on){ stats.on = !!on; if (on){ Object.assign(stats, { sets:0, frames:0, maxPerFrame:0, frameTimes:[], applies:0, clamps:0, overlapsAvoided:0 }); kick(); } return stats; },
  };
  // telas podem entrar e sair: confere de vez em quando, parada
  setInterval(() => { if (S.mode === 'idle' && S.cur) displays(true); }, 3000);
  return api;
}

/* gesto de arrastar: parado → pressionado → arrastando → (soltou) → parado.
   opts: { targets, accept(e) → dados|null, threshold, onStart(e, g), onMove(e, g), onEnd(g, why, e), onTap(e, g) }
   why: 'up' | 'cancel' | 'buttons' | 'blur' | 'hidden' | 'repress' | 'timeout' | 'abort' */
function createGesture(o){
  const TH = o.threshold ?? 5, SLOW_TH = o.slowThreshold ?? 2.5, HOLD = 220, WATCHDOG = o.watchdog ?? 12000;
  let g = null, swallowUntil = 0, dog = 0;
  const feed = () => { clearTimeout(dog); dog = setTimeout(() => finish('timeout', null), WATCHDOG); };
  function down(e){
    if (e.button !== 0) return;
    if (g) finish('repress', e);
    const data = o.accept ? o.accept(e) : {};
    if (!data) return;
    g = { id:e.pointerId, down:{ screenX:e.screenX, screenY:e.screenY, t:performance.now() }, data, on:false, el:e.currentTarget, target:e.target, synthetic:!e.isTrusted };
    if (o.capture !== false) try { (o.captureEl || e.currentTarget).setPointerCapture?.(e.pointerId); } catch {}
    o.onPress?.(e, g);
    feed();
  }
  function move(e){
    if (!g || e.pointerId !== g.id) return;
    // o botão já foi solto e o "soltar" se perdeu (ex.: caiu em outra janela): termina, nunca arrasta sem botão
    if (e.buttons === 0){ finish('buttons', e); return; }
    feed();
    if (!g.on){
      const d = Math.hypot(e.screenX - g.down.screenX, e.screenY - g.down.screenY);
      const held = performance.now() - g.down.t > HOLD;
      if (d < TH && !(held && d >= SLOW_TH)) return;
      g.on = true;
      o.onStart?.(e, g);
      return;
    }
    o.onMove?.(e, g);
  }
  function finish(why, e){
    clearTimeout(dog);
    if (!g) return;
    const was = g; g = null;
    try { was.el?.hasPointerCapture?.(was.id) && was.el.releasePointerCapture(was.id); } catch {}
    if (was.on){ swallowUntil = performance.now() + 400; o.onEnd?.(was, why, e); }
    else if (why === 'up') o.onTap?.(e, was);
    else o.onAbort?.(was, why);
  }
  const up = e => { if (g && e.pointerId === g.id) finish('up', e); };
  const cancel = e => { if (g && e.pointerId === g.id) finish('cancel', e); };
  for (const t of [].concat(o.targets)) t.addEventListener('pointerdown', down);
  addEventListener('pointermove', move, true);
  addEventListener('pointerup', up, true);
  addEventListener('pointercancel', cancel, true);
  // mouseup como reserva (alguns caminhos do Windows mandam só o mouse)
  addEventListener('mouseup', e => { if (g && !g.synthetic && e.button === 0) finish('up', e); }, true);
  addEventListener('blur', () => finish('blur', null));
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish('hidden', null); });
  // perder a captura sem soltar (o elemento sumiu ou mudou): segura de novo pela raiz e continua; os outros guardas encerram
  for (const t of [].concat(o.targets)) t.addEventListener('lostpointercapture', e => {
    if (!g || e.pointerId !== g.id) return;
    try { document.documentElement.setPointerCapture(e.pointerId); } catch {}
  });
  addEventListener('click', e => { if (performance.now() < swallowUntil){ e.stopPropagation(); e.preventDefault(); swallowUntil = 0; } }, true);
  return {
    get active(){ return !!g; },
    get dragging(){ return !!g?.on; },
    get state(){ return g ? (g.on ? 'arrastando' : 'pressionado') : 'parado'; },
    get current(){ return g; },
    /** encerra agora (ex.: o app precisa) */
    abort(){ finish('abort', null); },
    // ganchos de teste: os mesmos caminhos dos eventos de verdade
    _down:down, _move:move, _up:up, _cancel:cancel, _finish:finish,
  };
}
