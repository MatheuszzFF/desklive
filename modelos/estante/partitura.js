/* Partitura em camadas: desenha a música do contexto como SVG (cifra, partitura, tablatura, notas, graus, papel no
   acorde, saltos, letra), quebrando em sistemas pela largura. Devolve o html e marca em cada compasso e evento onde ele
   ficou (px0/px1/pr e px/pr), pro cursor e pros balões. Sem estado próprio. */
const Partitura = (() => {
const T = typeof Teoria !== 'undefined' ? Teoria : require('./teoria.js');
const { mod12, DEG, SALTO, grafar, pretty, sp, accTxt, LETTERS, ESCALAS, INS, posicoes } = T;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const CAMADAS = [['cifra', 'Cifra'], ['partitura', 'Partitura'], ['tab', 'Tablatura'], ['graus', 'Graus'], ['acorde', 'No acorde'], ['saltos', 'Saltos'], ['notas', 'Notas'], ['letra', 'Letra']];
function desenha(ctx, o){
  const on = k => o.camadas.has(k), faixa = !!o.faixa, W = faixa ? 100000 : Math.max(240, Math.floor(o.largura || 600));
  const I = INS[o.ins] || INS.baixo, nStr = I.cordas.length, base = ESCALAS[ctx.an.melhor].graus;
  const temLetra = on('letra') && ctx.linhas.some(l => l.letra), temSecao = ctx.compassos.some(b => b.secao);
  const padL = on('partitura') ? 50 : on('tab') ? 20 : 4, meds = [];
  ctx.linhas.forEach((ln, li) => ln.comps.forEach((evs, mi) => {
    let x = 9;
    evs.forEach(ev => {
      let w = 20 + 14 * ev.dur;
      if (temLetra && ev.silaba) w = Math.max(w, ev.silaba.length * 6.6 + 8);
      if (on('cifra') && ev.acordeT) w = Math.max(w, ev.acordeT.length * 8.4 + (on('graus') ? ev.romano.length * 6 + 5 : 0) + 6);
      if (on('saltos')) w = Math.max(w, 32);
      ev.rx = x + 9; ev.rw = w; x += w;
    });
    meds.push({ evs, w:x + 2, li, primeiro:mi === 0, b:evs[0].bar });
  }));
  const linhas = [[]]; let acc = 0; const disp = W - padL - 4;
  meds.forEach(m => { const quebra = acc + m.w > disp || (temSecao && ctx.compassos[m.b].secao && linhas[linhas.length - 1].length && !faixa); if (quebra && linhas[linhas.length - 1].length){ linhas.push([]); acc = 0; } linhas[linhas.length - 1].push(m); acc += m.w; });
  let y = 2; const Y = {};
  if (temSecao){ Y.sec = y + 10; y += 15; }
  if (on('cifra')){ Y.ch = y + 12; y += 17; }
  if (on('partitura')){ Y.st = y + 26; y = Y.st + 32 + 24; }
  if (on('tab')){ Y.tab = y + 8; y = Y.tab + (nStr - 1) * 10 + 11; }
  if (on('notas')){ Y.nn = y + 10; y += 14; }
  if (on('graus')){ Y.gr = y + 10; y += 14; }
  if (on('acorde')){ Y.ac = y + 10; y += 14; }
  if (on('saltos')){ Y.sa = y + 9; y += 13; }
  if (temLetra){ Y.ly = y + 12; y += 16; }
  const H = y + 6;
  if (H < 20) return { html:'<p class="es-vazio">Ligue pelo menos uma camada.</p>', altura:0 };
  let prev = null, html = '';
  linhas.forEach((row, ri) => {
    const soma = row.reduce((a, m) => a + m.w, 0), ultima = ri === linhas.length - 1;
    let f = disp / soma; if (f > (ultima ? 1.12 : 1.7)) f = 1;
    let x = padL, g = '', hits = '', mb = '';
    const dir = padL + soma * f, topo = Y.sec != null ? 14 : 0;
    if (Y.st != null){
      for (let i = 0; i < 5; i++) g += `<line class="st" x1="2" x2="${dir}" y1="${Y.st + i * 8}" y2="${Y.st + i * 8}"/>`;
      g += `<text class="clave" x="4" y="${Y.st + 33}" font-size="42">𝄞</text>`;
      if (ri === 0){ const [a, b] = ctx.mus.compasso.split('/'); g += `<text class="fc" x="40" y="${Y.st + 15}">${a}</text><text class="fc" x="40" y="${Y.st + 31}">${b}</text>`; }
    }
    const vaos = Array.from({ length:nStr }, () => []);
    if (Y.tab != null) for (let i = 0; i < nStr; i++) g += `<text class="lab" x="${padL - 16}" y="${Y.tab + i * 10 + 3}">${I.letras[i]}</text>`;
    const barra = bx => { let b = ''; if (Y.st != null) b += `<line class="bl" x1="${bx}" x2="${bx}" y1="${Y.st}" y2="${Y.st + 32}"/>`; if (Y.tab != null) b += `<line class="bl" x1="${bx}" x2="${bx}" y1="${Y.tab}" y2="${Y.tab + (nStr - 1) * 10}"/>`; if (Y.st == null && Y.tab == null) b += `<line class="bl fraca" x1="${bx}" x2="${bx}" y1="${topo + 4}" y2="${H - 4}"/>`; return b; };
    row.forEach(m => {
      const bar = ctx.compassos[m.b]; bar.px0 = x; bar.px1 = x + m.w * f; bar.pr = ri;
      mb += `<rect class="mbg" data-b="${m.b}" x="${x + 1}" y="${topo}" width="${m.w * f - 2}" height="${H - topo}" rx="8"/>`;
      if (Y.sec != null && bar.secao) g += `<text class="sec" x="${x + 4}" y="${Y.sec}">${esc(bar.secao)}</text>`;
      m.evs.forEach(ev => {
        const X = x + ev.rx * f; ev.px = X; ev.pr = ri;
        if (Y.ch != null && ev.acordeT) g += `<text class="ch" data-b="${m.b}" x="${X - 5}" y="${Y.ch}">${esc(pretty(ev.acordeT))}${on('graus') ? `<tspan class="rom" dx="4">${esc(ev.romano)}</tspan>` : ''}</text>`;
        if (ev.pausa){ if (Y.st != null) g += `<path class="ink" d="M${X - 2} ${Y.st + 8} l5 6 l-5 5 l5 6 l-3 3"/>`; return; }
        const dp = ` data-i="${ev.i}"`;
        hits += `<rect class="hit" data-i="${ev.i}" x="${X - 10}" y="${topo}" width="${Math.max(20, ev.rw * f - 1)}" height="${H - topo}" rx="6"/>`;
        if (Y.st != null){
          const q = sp(ctx.tonica, ev.off), step = (Math.floor((ev.m - q.acc) / 12) - 1) * 7 + LETTERS.indexOf(q.L);
          const ny = Y.st + 32 - (step - 30) * 4, oca = ev.dur >= 2, up = step < 34;
          for (let k = 28; k >= step; k -= 2) g += `<line class="ink" x1="${X - 8}" x2="${X + 8}" y1="${Y.st + 32 - (k - 30) * 4}" y2="${Y.st + 32 - (k - 30) * 4}"/>`;
          for (let k = 40; k <= step; k += 2) g += `<line class="ink" x1="${X - 8}" x2="${X + 8}" y1="${Y.st + 32 - (k - 30) * 4}" y2="${Y.st + 32 - (k - 30) * 4}"/>`;
          if (q.acc) g += `<text x="${X - 14}" y="${ny + 4}" font-size="12">${accTxt(q.acc)}</text>`;
          g += `<ellipse class="nh${oca ? ' oca' : ''}"${dp} cx="${X}" cy="${ny}" rx="4.8" ry="3.4" transform="rotate(-20 ${X} ${ny})"/>`;
          if (ev.dur < 4){ const sx = up ? X + 4.4 : X - 4.4, ey = up ? ny - 27 : ny + 27; g += `<line class="ink" x1="${sx}" x2="${sx}" y1="${ny}" y2="${ey}"/>`;
            const bandeiras = ev.dur <= .375 ? 2 : ev.dur <= .75 ? 1 : 0; for (let k = 0; k < bandeiras; k++){ const fy = ey + (up ? 1 : -1) * k * 6; g += `<path class="ink" d="M${sx} ${fy} q8 ${up ? 5 : -5} 4 ${up ? 13 : -13}"/>`; } }
          if ([3, 1.5, .75].includes(ev.dur)) g += `<circle cx="${X + 9}" cy="${ny - (step % 2 === 0 ? 4 : 0)}" r="1.4" class="ponto"/>`;
        }
        if (Y.tab != null){ const p = posicoes(ev.m, o.ins)[0]; if (p){ const tx = String(p.f), ty = Y.tab + p.s * 10; vaos[p.s].push([X - tx.length * 3.4 - 2, X + tx.length * 3.4 + 2]); g += `<text class="fr"${dp} x="${X}" y="${ty + 3.8}">${tx}</text>`; } }
        if (Y.nn != null) g += `<text class="nn"${dp} x="${X}" y="${Y.nn}">${esc(grafar(ctx.tonica, ev.off))}</text>`;
        if (Y.gr != null) g += `<text class="gr${ev.off === 0 ? ' t' : base.includes(ev.off) ? '' : ' o'}"${dp} x="${X}" y="${Y.gr}">${DEG[ev.off]}</text>`;
        if (Y.ac != null && ev.ci) g += `<text class="ac ${ev.cat}"${dp} x="${X}" y="${Y.ac}">${DEG[ev.iv]}</text>`;
        if (Y.sa != null && prev){ const d = ev.m - prev.m, a = Math.abs(d); g += `<text class="sa" x="${prev.ri === ri ? (prev.X + X) / 2 : X - 13}" y="${Y.sa}">${d > 0 ? '↑' : d < 0 ? '↓' : ''}${a <= 12 ? SALTO[a] : a + 'st'}</text>`; }
        if (Y.ly != null && ev.silaba) g += `<text class="ly" x="${X}" y="${Y.ly}">${esc(ev.silaba)}</text>`;
        prev = { m:ev.m, X, ri };
      });
      x += m.w * f; g += barra(x);
    });
    if (Y.tab != null) vaos.forEach((gp, i) => { let a = padL - 6; const ty = Y.tab + i * 10; [...gp.sort((p, q) => p[0] - q[0]), [dir, dir]].forEach(([b, e]) => { if (b > a) g += `<line class="st" x1="${a}" x2="${b}" y1="${ty}" y2="${ty}"/>`; a = Math.max(a, e); }); });
    const SW = faixa ? Math.ceil(dir + 16) : W;
    html += `<div class="sys" style="--n:${ri}"><svg viewBox="0 0 ${SW} ${H}" width="${SW}" height="${H}" role="img" aria-label="Sistema ${ri + 1}">${mb}${hits}${g}</svg></div>`;
  });
  return { html, altura:H * linhas.length, sistemas:linhas.length };
}
// a escala da música em 12 casas: usadas, da escala, fora
function escalaFaixa(ctx){
  const a = ctx.an, sc = ESCALAS[a.melhor];
  return { titulo:pretty(ctx.tonica) + ' ' + sc.nome.toLowerCase(), formula:T.formula(sc.graus), porque:sc.porque,
    casas:DEG.map((d, o) => ({ grau:d, nota:grafar(ctx.tonica, o), usada:(ctx.usados[o] || 0) > 0, naEscala:sc.graus.includes(o), vezes:ctx.usados[o] || 0 })),
    fora:a.fora.map(x => ({ nota:grafar(ctx.tonica, x.o), grau:DEG[x.o], de:x.de ? ESCALAS[x.de].curto : '' })), tambem:a.tambem.map(id => ESCALAS[id].curto) };
}
// o braço: casas de 0 a ate, com pontos dados [{ s, f, rotulo, classe }]
function braco(ins, pontos, de = 0, ate = 12){
  const I = INS[ins] || INS.baixo, n = I.cordas.length, cw = 34, ch = 16, L = 26, W = L + (ate - de + 1) * cw + 8, H = n * ch + 18;
  let g = '';
  for (let s = 0; s < n; s++) g += `<line class="corda" x1="${L}" x2="${W - 8}" y1="${10 + s * ch}" y2="${10 + s * ch}"/><text class="lab" x="6" y="${13 + s * ch}">${I.letras[s]}</text>`;
  for (let f = de; f <= ate + 1; f++){ const x = L + (f - de) * cw; g += `<line class="${f === 0 ? 'pestana' : 'traste'}" x1="${x}" x2="${x}" y1="${10}" y2="${10 + (n - 1) * ch}"/>`; if (f <= ate && [3, 5, 7, 9, 12, 15].includes(f)) g += `<text class="casa" x="${x + cw / 2}" y="${H - 1}">${f}</text>`; }
  for (const p of pontos){ if (p.f < de || p.f > ate) continue; const x = L + (p.f - de) * cw + cw / 2 - (p.f === 0 ? cw / 2 - 6 : 0), y = 10 + p.s * ch;
    g += `<g class="pt ${p.classe || ''}" data-s="${p.s}" data-f="${p.f}"><circle cx="${x}" cy="${y}" r="7"/><text x="${x}" y="${y + 3.2}">${esc(p.rotulo ?? '')}</text></g>`; }
  return `<svg class="braco" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Braço">${g}</svg>`;
}
return { desenha, escalaFaixa, braco, CAMADAS, esc };
})();
if (typeof module !== 'undefined') module.exports = Partitura;
