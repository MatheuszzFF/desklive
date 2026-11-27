/* Frases: o que um compasso usa e uma ideia pra tocar em cima dele (ritmo + graus + aproximação do próximo acorde),
   e o retrato de uma nota (papel no acorde, penta, braço, escala do momento). Tudo em dado; quem desenha é o balão. */
const Frases = (() => {
const T = typeof Teoria !== 'undefined' ? Teoria : require('./teoria.js');
const { mod12, DEG, PAPEL, grafar, pretty, modoDe, posicoes, INS } = T;
const RITMOS = { '4':[[1, 1, 1, 1], [1.5, .5, 1, 1], [1, .5, .5, 1, 1], [1.5, .5, 1.5, .5], [2, 1, 1], [.5, .5, 1, .5, .5, 1]],
  '3':[[1, 1, 1], [2, 1], [1, .5, .5, 1], [1.5, .5, 1]], '6/8':[[1.5, 1.5], [1, .5, 1, .5], [1.5, .5, .5, .5], [.5, .5, .5, 1.5]], '2':[[1, 1], [.5, .5, 1], [1.5, .5]] };
const POOL = { dom:[[0, 4, 7, 10, 9, 7, 4, 0], [0, 7, 10, 12, 10, 7, 4, 0], [0, 2, 4, 7, 9, 10, 9, 7]], min:[[0, 3, 7, 10, 7, 3, 0, 7], [0, 3, 5, 7, 10, 7, 5, 3], [0, 7, 10, 12, 10, 7, 3, 0]],
  maj:[[0, 4, 7, 9, 7, 4, 0, 7], [0, 2, 4, 7, 9, 7, 4, 2], [0, 7, 12, 7, 4, 7, 0, 4]], dim:[[0, 3, 6, 9, 6, 3, 0, 3], [0, 3, 6, 3, 0, 6, 3, 0], [0, 1, 3, 6, 3, 1, 0, 3]] };
const CAT = { ct:'nota do acorde', pn:'passagem pela penta do acorde', sc:'passagem pela escala', cr:'cromática, de aproximação', ap:'aproximação do próximo acorde' };
const FRASES_PRONTAS = { dom:[['1 3 5 ♭7', 'arpejo'], ['1 3 5 6 ♭7 6 5 3', 'walking de blues'], ['1 5 ♭7 8', 'oitava com ♭7']],
  min:[['1 ♭3 5 ♭7', 'arpejo m7'], ['1 ♭3 4 5', 'penta menor'], ['1 5 ♭7 8', 'fundamental, quinta, sétima']], maj:[['1 3 5 6', 'arpejo com sexta'], ['1 2 3 5', 'penta maior'], ['1 5 8 5', 'fundamental e quinta']],
  dim:[['1 ♭3 ♭5 6', 'arpejo diminuto'], ['1 ♭3 ♭5 ♭3', 'vai e volta'], ['1 ♭2 ♭3 ♭5', 'lócrio']] };
const tipo = ci => ci.dim ? 'dim' : ci.dom ? 'dom' : ci.menor ? 'min' : 'maj';
function grade(ctx){ const c = ctx.mus.compasso; return c === '6/8' ? { n:6, p:.5, fortes:[0, 3] } : { n:Math.round(ctx.barQ), p:1, fortes:ctx.barQ === 4 ? [0, 2] : [0] }; }
const off0 = (ctx, bar) => ctx.anacruse && bar.i === 0 ? ctx.barQ - bar.len : 0;
function tempoTxt(ctx, t){ const g = grade(ctx), u = t / g.p, b = Math.floor(u + 1e-6); return (b + 1) + (u - b > .2 ? 'e' : ''); }
// uma ideia pro compasso (varia com v): ritmo de um conjunto, graus de um banco do tipo do acorde, última nota aproxima o próximo
function ideia(ctx, bar, v = 0){
  const ci = bar.ci; if (!ci) return [];
  const q = Math.round(ctx.barQ), set = RITMOS[ctx.mus.compasso === '6/8' ? '6/8' : String(q)] || [Array(q).fill(1)];
  const k0 = bar.i + v, rh = set[k0 % set.length], pool = POOL[tipo(ci)][Math.floor(k0 / 2) % 3];
  const nci = (ctx.compassos[(bar.i + 1) % ctx.compassos.length] || {}).ci;
  let t = 0; const out = rh.map((d, k) => { const o = { t, d, off:pool[k % pool.length] }; t += d; return o; });
  out.forEach(o => { const iv = o.off % 12; o.cat = ci.tons.includes(iv) ? 'ct' : ci.penta.includes(iv) ? 'pn' : 'sc'; o.grau = o.off === 12 ? '8' : DEG[iv]; o.nota = grafar(ci.raizNome, iv); });
  if (nci && nci.raiz !== ci.raiz && out.length >= 3){ const L = out[out.length - 1]; L.off = mod12(nci.raiz - 1 - ci.raiz); L.cat = 'ap'; L.para = nci; L.grau = '→'; L.nota = grafar(nci.raizNome, 11); }
  return out;
}
// o retrato do compasso: o que toca, em que tempos, e a ideia
function compasso(ctx, bar, v = 0){
  const ci = bar.ci, notas = bar.evs.filter(e => !e.pausa), o0 = off0(ctx, bar), g = grade(ctx);
  const usa = notas.map(e => ({ i:e.i, t:e.beat - bar.ini + o0, d:e.dur, grau:e.ci ? DEG[e.iv] : DEG[e.off], nota:grafar(ctx.tonica, e.off), cat:e.cat || 'sc', tempo:tempoTxt(ctx, e.beat - bar.ini + o0) }));
  const conta = k => notas.filter(e => e.cat === k).length;
  const r = { i:bar.i, acordes:bar.acordes, romanos:bar.acordes.map(n => T.romano(n, ctx.tpc, ctx.menor)), secao:bar.secao, grade:g, barQ:ctx.barQ, usa,
    numero:ctx.anacruse ? (bar.i === 0 ? 'anacruse' : bar.i + ' de ' + ctx.nCompassos) : (bar.i + 1) + ' de ' + ctx.nCompassos,
    resumo:{ acorde:conta('ct'), passagem:notas.length - conta('ct') - conta('cr'), cromaticas:conta('cr') } };
  if (ci){
    const md = modoDe(ci, ctx), id = ideia(ctx, bar, v), ap = id.find(o => o.cat === 'ap');
    r.acorde = { nome:ci.nome, raiz:ci.raizNome, tons:ci.tons.map(o => ({ grau:DEG[o], nota:grafar(ci.raizNome, o), papel:PAPEL[o] })) };
    r.modo = { nome:pretty(ci.raizNome) + ' ' + md.nome, notas:md.notas };
    r.ideia = id; r.chegada = ap ? { acorde:ap.para.nome, por:grafar(ap.para.raizNome, 11) } : null;
    r.prontas = FRASES_PRONTAS[tipo(ci)].map(([d, porque]) => ({ graus:d, notas:d.split(' ').map(x => grafar(ci.raizNome, x === '8' ? 0 : DEG.indexOf(x))).join(' '), porque }));
  }
  return r;
}
// o retrato de uma nota
function nota(ctx, i, ins){
  const ev = ctx.eventos[i]; if (!ev || ev.pausa) return null;
  const ci = ev.ci, I = INS[ins] || INS.baixo;
  const r = { i, nota:grafar(ctx.tonica, ev.off), grau:DEG[ev.off], cat:ev.cat || 'sc', catTxt:CAT[ev.cat] || '', penta:ev.kp,
    braco:posicoes(ev.m, ins).map(p => I.letras[p.s] + ' casa ' + p.f) };
  if (ci){ r.papel = PAPEL[ev.iv] + ' de ' + pretty(ci.nome); r.pentaAcorde = ci.penta.includes(ev.iv); }
  return r;
}
// pra tocar a ideia: notas soando (midi) com tempo em batidas
function tocavel(ctx, bar, v, ins){
  const id = ideia(ctx, bar, v), I = INS[ins] || INS.baixo, n = I.cordas.length; if (!id.length) return [];
  const base = Math.min(...[n - 1, n - 2].map(s => I.cordas[s] + mod12(bar.ci.raiz - I.cordas[s])));
  return id.map(o => ({ midi:base + o.off, t:o.t, d:o.d }));
}
return { ideia, compasso, nota, tocavel, grade, CAT, tipo };
})();
if (typeof module !== 'undefined') module.exports = Frases;
