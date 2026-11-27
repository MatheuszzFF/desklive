/* Balões soltos na tela: acorde do momento, o que o compasso usa, a ideia de frase e o retrato de uma nota.
   Moram fora do corpo da Estante (na camada do Board), empilhados do lado com mais tela e seguindo o corpo com mola.
   Arrastou um balão, ele fica solto onde você largou (e continua vivo, mudando com a música); × fecha.
   Nada pisca: o conteúdo troca por cima (crossfade) e a posição anda com mola. */
const Baloes = (() => {
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const CSS = `
.es-bal{position:fixed;left:0;top:0;z-index:4800;width:300px;padding:11px 13px 10px;border-radius:16px;color:#eef0ff;font:12.5px/1.45 var(--corpo,Inter,system-ui,sans-serif);
  background:linear-gradient(rgba(255,255,255,.07),rgba(255,255,255,.02)),rgba(14,15,24,.82);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(18px) saturate(1.4);
  box-shadow:0 18px 44px -18px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.07);opacity:0;scale:.86;transition:opacity .3s,scale .5s cubic-bezier(.2,1.4,.3,1);will-change:transform;cursor:grab;user-select:none}
.es-bal.vivo{opacity:1;scale:1}.es-bal.pego{cursor:grabbing;scale:1.02}
.es-bal .x{position:absolute;right:6px;top:5px;width:20px;height:20px;border:0;border-radius:50%;background:none;color:#8f95ad;font:14px/1 sans-serif;cursor:pointer;opacity:0;transition:opacity .2s}
.es-bal:hover .x{opacity:1}.es-bal .x:hover{color:#fff;background:rgba(255,255,255,.08)}
.es-bal .tp{font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:#8f95ad;display:flex;gap:8px;align-items:center}
.es-bal .tp .pino{width:6px;height:6px;border-radius:50%;background:#3ee6d4;box-shadow:0 0 8px #3ee6d4;opacity:0;transition:opacity .3s}.es-bal.solto .tp .pino{opacity:1}
.es-bal .cab{display:flex;align-items:baseline;gap:8px;margin:3px 0 2px}.es-bal .cab b{font:700 19px/1.1 Sora,sans-serif;color:#ffb85c}.es-bal .cab span{color:#8f95ad;font:500 11px "JetBrains Mono",monospace}
.es-bal p{margin:5px 0 0}.es-bal .k{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#8f95ad;margin-right:6px}
.es-bal .tons{display:flex;gap:6px;margin-top:6px}.es-bal .tons span{flex:1;padding:4px 0 3px;border-radius:9px;border:1px solid rgba(62,230,212,.35);background:rgba(62,230,212,.1);text-align:center}
.es-bal .tons b{display:block;font:600 13px "JetBrains Mono",monospace}.es-bal .tons i{font-style:normal;font-size:9.5px;color:#8f95ad}
.es-bal .lane{position:relative;height:36px;margin-top:6px;border-radius:9px;background:rgba(255,255,255,.04);overflow:hidden}
.es-bal .lane .gl{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.08)}.es-bal .lane .gl.f{width:2px;background:rgba(255,255,255,.16)}
.es-bal .blk{position:absolute;top:3px;bottom:3px;border-radius:7px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);display:flex;flex-direction:column;justify-content:center;padding:0 5px;overflow:hidden;transition:transform .35s cubic-bezier(.2,1.4,.3,1),box-shadow .2s,filter .15s}
.es-bal .blk b{font:700 12.5px/1.1 "JetBrains Mono",monospace}.es-bal .blk i{font-style:normal;font-size:9px;opacity:.75;white-space:nowrap}
.es-bal .blk.ct{background:rgba(62,230,212,.2);border-color:rgba(62,230,212,.55)}.es-bal .blk.pn{background:rgba(165,132,255,.22);border-color:rgba(165,132,255,.55)}
.es-bal .blk.cr,.es-bal .blk.ap{background:rgba(255,100,130,.18);border-color:rgba(255,100,130,.55)}.es-bal .blk.on{transform:translateY(-2px);box-shadow:0 0 14px rgba(62,230,212,.45);filter:brightness(1.4)}
.es-bal .lane.toca{cursor:pointer}.es-bal .lane.toca:hover{background:rgba(255,255,255,.07)}
.es-bal .seq{font:11.5px "JetBrains Mono",monospace;display:block}.es-bal .seq i{font-style:normal;color:#8f95ad}
.es-bal b.ct{color:#3ee6d4}.es-bal b.pn{color:#a584ff}.es-bal b.cr,.es-bal b.ap{color:#ff6482}.es-bal .c{font:700 12.5px Sora,sans-serif;color:#ffb85c}
.es-bal .corpo{transition:opacity .22s}.es-bal .corpo.troca{opacity:.25}
.es-bal .bt{display:flex;gap:6px;margin-top:7px}.es-bal .bt button{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#eef0ff;border-radius:999px;padding:3px 10px;font:500 11.5px var(--corpo,Inter,sans-serif);cursor:pointer}
.es-bal .bt button:hover{border-color:#3ee6d4}
`;
function criar({ raiz, caixa, tocar, aoSoltar }){
  if (!document.getElementById('es-bal-css')){ const s = document.createElement('style'); s.id = 'es-bal-css'; s.textContent = CSS; document.head.appendChild(s); }
  const B = new Map();   // id → { el, corpo, pos:[x,y], vel:[vx,vy], alvo:[x,y], solto, ordem, html }
  let ordem = 0, raf = 0, ult = 0, ladoAtual = 1;
  function pega(id, tipo){
    let b = B.get(id); if (b) return b;
    const el = document.createElement('div'); el.className = 'es-bal alvo'; el.dataset.id = id;
    el.innerHTML = `<div class="tp"><i class="pino"></i><span class="tipo">${esc(tipo)}</span></div><button class="x" type="button" aria-label="Fechar">×</button><div class="corpo"></div>`;
    raiz.appendChild(el);
    const r = caixa(); b = { id, el, corpo:el.querySelector('.corpo'), pos:[r ? r.right + 14 : 100, r ? r.top : 100], vel:[0, 0], alvo:null, solto:null, ordem:ordem++, html:'' };
    B.set(id, b); arrasta(b);
    el.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); fecha(id); });
    requestAnimationFrame(() => el.classList.add('vivo')); anda();
    return b;
  }
  // troca o conteúdo sem piscar: só se mudou, com um crossfade curtinho
  function poe(b, html){
    if (b.html === html) return; const primeira = !b.html; b.html = html;
    if (primeira){ b.corpo.innerHTML = html; return; }
    b.corpo.classList.add('troca'); clearTimeout(b.tt); b.tt = setTimeout(() => { b.corpo.innerHTML = html; b.corpo.classList.remove('troca'); }, 120);
  }
  function arrasta(b){
    let g = null;
    b.el.addEventListener('pointerdown', e => { if (e.button !== 0 || e.target.closest('button,.lane.toca')) return; g = { id:e.pointerId, dx:e.clientX - b.pos[0], dy:e.clientY - b.pos[1], x0:e.clientX, y0:e.clientY, on:false }; });
    b.el.addEventListener('pointermove', e => {
      if (!g || e.pointerId !== g.id) return;
      if (!g.on){ if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 4) return; g.on = true; b.el.setPointerCapture(g.id); b.el.classList.add('pego'); }
      b.solto = [e.clientX - g.dx, e.clientY - g.dy]; b.pos = [...b.solto]; b.vel = [0, 0]; b.el.classList.add('solto'); poePos(b);
    });
    const fim = () => { if (g?.on){ b.el.classList.remove('pego'); aoSoltar?.(b.id, b.solto); } g = null; };
    b.el.addEventListener('pointerup', fim); b.el.addEventListener('pointercancel', fim);
    b.el.addEventListener('dblclick', () => { b.solto = null; b.el.classList.remove('solto'); anda(); });   // duplo clique: volta pro lado do corpo
  }
  const poePos = b => { b.el.style.transform = `translate3d(${b.pos[0].toFixed(1)}px,${b.pos[1].toFixed(1)}px,0)`; };
  // os grudados empilham do lado com mais tela, alinhados ao topo do corpo
  function alvos(){
    const r = caixa(); if (!r) return;
    const W = innerWidth, H = innerHeight, gr = [...B.values()].filter(b => !b.solto).sort((a, c) => a.ordem - c.ordem);
    const larg = 300, cabeDir = r.right + 14 + larg <= W - 8, cabeEsq = r.left - 14 - larg >= 8;
    ladoAtual = cabeDir && (!cabeEsq || W - r.right >= r.left) ? 1 : cabeEsq ? -1 : 0;
    let y = Math.max(8, r.top);
    for (const b of gr){
      const h = b.el.offsetHeight || 120;
      if (ladoAtual === 0){ b.alvo = [Math.min(W - larg - 8, Math.max(8, r.left)), Math.min(H - h - 8, r.bottom + 12 + (y - Math.max(8, r.top)))]; }
      else b.alvo = [ladoAtual > 0 ? r.right + 14 : r.left - 14 - larg, Math.min(H - h - 8, y)];
      y += h + 10;
    }
  }
  // mola crítica (k 210, ζ 0,9) com passo fixo: segue o corpo sem tremer
  function anda(){ if (!raf){ ult = performance.now(); raf = requestAnimationFrame(passo); } }
  function passo(now){
    raf = 0; const dt = Math.min(.25, (now - ult) / 1000), n = Math.max(1, Math.ceil(dt / .012)), h = dt / n; ult = now; alvos(); let mexe = false;
    for (const b of B.values()){
      if (b.solto || !b.alvo) continue;
      const k = 210, z = .9, c = 2 * z * Math.sqrt(k);
      for (let q = 0; q < n; q++){ const dx = b.alvo[0] - b.pos[0], dy = b.alvo[1] - b.pos[1]; b.vel[0] += (k * dx - c * b.vel[0]) * h; b.vel[1] += (k * dy - c * b.vel[1]) * h; b.pos[0] += b.vel[0] * h; b.pos[1] += b.vel[1] * h; }
      poePos(b); if (Math.hypot(b.alvo[0] - b.pos[0], b.alvo[1] - b.pos[1]) > .3 || Math.hypot(...b.vel) > .5) mexe = true;
    }
    if (mexe) raf = requestAnimationFrame(passo);
  }
  function fecha(id){ const b = B.get(id); if (!b) return; B.delete(id); b.el.classList.remove('vivo'); setTimeout(() => b.el.remove(), 320); anda(); }
  // ---------- os tipos ----------
  const lane = (itens, barQ, grade, toca) => { let h = ''; for (let k = 0; k < grade.n; k++) h += `<i class="gl${grade.fortes.includes(k) ? ' f' : ''}" style="left:${100 * k * grade.p / barQ}%"></i>`;
    return `<div class="lane${toca ? ' toca' : ''}">` + h + itens.map((o, k) => `<span class="blk ${o.cat}" data-k="${k}" style="left:calc(${100 * o.t / barQ}% + 2px);width:calc(${100 * o.d / barQ}% - 4px)"><b>${esc(o.grau)}</b><i>${esc(o.nota)}</i></span>`).join('') + '</div>'; };
  function compasso(r){
    const b = pega('compasso', 'compasso'); b.dado = r;
    let h = `<div class="cab"><b>${esc(r.acordes.map(n => Teoria.pretty(n)).join(' → ') || '—')}</b><span>${esc(r.romanos.join(' → '))}</span><span style="margin-left:auto">${esc(r.numero)}</span></div>`;
    if (r.usa.length) h += `<p><span class="k">toca</span>${r.usa.map(u => `<b class="${u.cat}">${esc(u.grau)}</b>`).join(' · ')} <span style="color:#8f95ad">nos tempos ${esc(r.usa.map(u => u.tempo).join(' · '))}</span></p>` + lane(r.usa, r.barQ, r.grade);
    if (r.ideia?.length) h += `<p><span class="k">tente</span>em <b>${esc(r.modo.nome)}</b>${r.chegada ? `, chegando em <span class="c">${esc(Teoria.pretty(r.chegada.acorde))}</span> por <b class="ap">${esc(r.chegada.por)}</b>` : ''}</p>` + lane(r.ideia, r.barQ, r.grade, true) + `<div class="bt"><button type="button" data-a="ouvir">▶ ouvir a ideia</button><button type="button" data-a="outra">↻ outra</button></div>`;
    poe(b, h); ligaBotoes(b); anda();
  }
  function acorde(r){
    if (!r.acorde){ fecha('acorde'); return; }
    const b = pega('acorde', 'acorde agora');
    poe(b, `<div class="cab"><b>${esc(Teoria.pretty(r.acorde.nome))}</b><span>${esc(r.modo.nome)}</span></div><div class="tons">${r.acorde.tons.map(t => `<span><b>${esc(t.nota)}</b><i>${esc(t.grau)}</i></span>`).join('')}</div>` +
      `<p><span class="k">escala</span><span class="seq">${esc(r.modo.notas.join(' '))}</span></p><p><span class="k">frases</span>${r.prontas.map(f => `<span class="seq">${esc(f.graus)} <i>→ ${esc(f.notas)} · ${esc(f.porque)}</i></span>`).join('')}</p>`); anda();
  }
  function nota(r){
    if (!r){ fecha('nota'); return; }
    const b = pega('nota', 'nota');
    poe(b, `<div class="cab"><b>${esc(r.nota)}</b><span>grau ${esc(r.grau)}</span></div>` + (r.papel ? `<p><b class="${r.cat}">${esc(r.papel)}</b> · ${esc(r.catTxt)}</p>` : '') +
      `<p><span class="k">penta</span>${r.penta ? 'dentro' : 'fora'} da penta do tom${r.pentaAcorde != null ? ' · ' + (r.pentaAcorde ? 'dentro' : 'fora') + ' da penta do acorde' : ''}</p>` + (r.braco.length ? `<p><span class="k">braço</span>${esc(r.braco.join(' · '))}</p>` : '')); anda();
  }
  function ligaBotoes(b){
    if (b.ligado) return; b.ligado = true;
    b.el.addEventListener('click', e => {
      const a = e.target.closest('[data-a]')?.dataset.a, lnT = e.target.closest('.lane.toca');
      if (a === 'ouvir' || lnT) tocar?.('ideia', k => b.corpo.querySelectorAll('.lane.toca .blk').forEach((x, j) => x.classList.toggle('on', j === k)));
      if (a === 'outra') tocar?.('outra');
    });
  }
  // o tempo do compasso acende o bloco do que está tocando agora
  function acende(i){ const b = B.get('compasso'); if (!b?.dado) return; const k = b.dado.usa.findIndex(u => u.i === i); b.corpo.querySelectorAll('.lane:not(.toca) .blk').forEach((x, j) => x.classList.toggle('on', j === k)); }
  return { compasso, acorde, nota, acende, fecha, anda, abertos:() => [...B.keys()], soltos:() => [...B.values()].filter(b => b.solto).map(b => b.id), lado:() => ladoAtual,
    limpa(){ for (const id of [...B.keys()]) fecha(id); } };
}
return { criar };
})();
