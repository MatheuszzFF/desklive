/* Música: o repertório, o leitor de ABC (melodias escritas) e o leitor de cifra (acordes por compasso, de qualquer
   música que o agente trouxer), e o contexto de uma música no tom escolhido: eventos, compassos, análise de escala.
   Usa só a Teoria. Sem DOM. */
const Musica = (() => {
const T = typeof Teoria !== 'undefined' ? Teoria : require('./teoria.js');
const { mod12, rootPc, acorde, analisar, ESCALAS, transporAcorde, romano } = T;
const fracVal = s => { const [a, b] = String(s).split('/').map(Number); return b ? a / b : a; };

const REPERTORIO = [
  { id:'blues', titulo:'Blues em Lá · walking', artista:'Linha de baixo de estudo', compasso:'4/4', L:'1/4', tom:'A', bpm:108,
    linhas:[{ abc:'"A7"A, C E F|=G F E C|"A7"A, C E F|=G F E C|' }, { abc:'"D7"D F A B|=c B A F|"A7"A, C E F|=G F E C|' }, { abc:'"E7"E G B d|"D7"D F A =c|"A7"A, C E F|"E7"E B, E G|]' }] },
  { id:'groove', titulo:'Groove em Mi menor', artista:'Linha de baixo de estudo · penta menor com aproximações', compasso:'4/4', L:'1/8', tom:'Em', bpm:92,
    linhas:[{ abc:'"Em"E2 E G A2 B d|"C"C2 C E G2 E D|"G"G,2 G, B, D2 G B|"D"D2 D F A2 F D|' }, { abc:'"Em"E2 B, E G2 A ^A|"C"C2 G, C E2 G ^F|"G"G,2 D G B2 A G|"D"D2 A, D F2 E ^D|]' }] },
  { id:'ode', titulo:'Ode an die Freude', artista:'Beethoven · texto de Schiller', compasso:'4/4', L:'1/4', tom:'C', bpm:100,
    linhas:[{ abc:'"C"E E F G|"G"G F E D|"C"C C D E|"G"E3/2 D/ D2|', w:'Freu-de, schö-ner Göt-ter-fun-ken, Toch-ter aus E-ly-si-um,' },
      { abc:'"C"E E F G|"G"G F E D|"C"C C D E|"G"D3/2 C/ "C"C2|]', w:'Wir be-tre-ten feu-er-trun-ken, Himm-li-sche, dein Hei-lig-tum!' }] },
  { id:'grace', titulo:'Amazing Grace', artista:'Tradicional americana · texto de John Newton', compasso:'3/4', L:'1/4', tom:'G', bpm:80,
    linhas:[{ abc:'D|"G"G2 B/G/|"G7"B2 A|"C"G2 E|"G"D2 D|', w:'A-ma-zing _ grace, how sweet the sound, that' }, { abc:'"G"G2 B/G/|"Em"B2 A/B/|"D"d3|d2 B|', w:'saved a _ wretch like _ me, _ I' },
      { abc:'"G"d2 B/G/|"G7"B2 A|"C"G2 E|"G"D2 D|', w:'once was _ lost, but now am found, was' }, { abc:'"Em"G2 B/G/|"D"B2 A|"G"G3|G2|]', w:'blind, but _ now I see. _' }] },
  { id:'green', titulo:'Greensleeves', artista:'Tradicional inglesa, século XVI', compasso:'6/8', L:'1/8', tom:'Am', bpm:66,
    linhas:[{ abc:'A|"Am"c2d e3/2f/e|"G"d2B G3/2A/B|"Am"c2A A3/2^G/A|"E"B2^G E2A|' }, { abc:'"Am"c2d e3/2f/e|"G"d2B G3/2A/B|"Am"c3/2B/A "E"^G3/2^F/^G|"Am"A3 z2|]' }] },
];

// ---------- ABC (o suficiente pra linhas de estudo) ----------
function parseLen(s){ if (!s) return 1; const m = s.match(/^(\d+)?(\/(\d*))?$/); if (!m) return 1; const num = m[1] ? +m[1] : 1; return m[2] ? num / (m[3] ? +m[3] : 2) : num; }
function lerABC(abc, mus){
  const unidade = fracVal(mus.L || '1/4') * 4, arm = T.armadura(mus.tom);
  const re = /"([^"]+)"|(\|\]|\|)|([\^_=]?)([A-Ga-gz])([,']*)((?:\d+)?(?:\/\d*)?)/g;
  const comps = [[]]; let barAcc = {}, pend = null, m;
  while ((m = re.exec(abc))){
    if (m[1]){ pend = m[1]; continue; }
    if (m[2]){ barAcc = {}; if (comps[comps.length - 1].length) comps.push([]); continue; }
    const L = m[4], ev = { dur:parseLen(m[6]) * unidade, acorde:pend }; pend = null;
    if (L === 'z') ev.pausa = true;
    else {
      const up = L.toUpperCase(); let midi = (L === up ? 60 : 72) + { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[up];
      for (const c of m[5]) midi += c === "'" ? 12 : -12;
      const oct = L + m[5]; if (m[3]) barAcc[oct] = m[3] === '^' ? 1 : m[3] === '_' ? -1 : 0;
      ev.midi = midi + (oct in barAcc ? barAcc[oct] : (arm[up] || 0));
    }
    comps[comps.length - 1].push(ev);
  }
  if (!comps[comps.length - 1].length) comps.pop();
  return comps;
}
function lerLetra(w){ const out = []; for (const p of String(w).trim().split(/\s+/)){ if (p === '_' || p === '*'){ out.push({ segura:true }); continue; } const ps = p.split('-'); ps.forEach((x, i) => out.push({ t:x, hif:i < ps.length - 1 })); } return out; }

// ---------- cifra: { titulo, artista, tom, compasso, bpm, secoes:[{ nome, compassos:['Am', 'F G', …], letra? }] } ----------
// cada compasso vira uma linha de baixo de estudo: fundamental nos tempos fortes, quinta ou oitava, e aproximação cromática pro próximo acorde
function baixoDaCifra(nomes, proximo, tempos){
  const dur = tempos / nomes.length, out = [];
  nomes.forEach((n, k) => {
    const ci = acorde(n); if (!ci){ out.push({ dur, pausa:true }); return; }
    const r = 36 + ci.baixo, prox = (k < nomes.length - 1 ? acorde(nomes[k + 1]) : proximo);
    const notas = dur >= 4 ? [r, r + 7, r + 12, prox ? 36 + prox.baixo - 1 : r + 7] : dur >= 3 ? [r, r + 7, r + 12] : dur >= 2 ? [r, prox ? 36 + prox.baixo - 1 : r + 7] : [r];
    const cada = dur / notas.length;
    notas.forEach((m, j) => out.push({ dur:cada, midi:m + 24, acorde:j === 0 ? n : null }));
  });
  return out;
}
function lerCifra(mus){
  const tempos = fracVal(mus.compasso || '4/4') * 4, todos = [];
  (mus.secoes || []).forEach(s => (s.compassos || []).forEach(c => todos.push({ s, nomes:String(c).trim().split(/\s+/).filter(Boolean) })));
  return todos.map((c, i) => {
    const prox = todos[i + 1] ? acorde(todos[i + 1].nomes[0]) : null;
    const evs = c.nomes.length ? baixoDaCifra(c.nomes, prox, tempos) : [{ dur:tempos, pausa:true }];
    if (i === 0 || todos[i - 1].s !== c.s) evs.secao = c.s.nome || '';
    return evs;
  });
}

// ---------- o contexto: tudo que as vistas precisam, no tom escolhido (t = semitons) ----------
function contexto(mus, t = 0){
  const menor = /m$/.test(mus.tom), raiz0 = mus.tom.replace(/m$/, ''), tpc0 = rootPc(raiz0);
  const tonica = transporAcorde(raiz0, t), tpc = rootPc(tonica), barQ = fracVal(mus.compasso || '4/4') * 4;
  const usados = {}, acordes = [], eventos = [], compassos = [], pentaTom = ESCALAS[menor ? 'pentm' : 'pentM'].graus;
  let ci = null, beat = 0;
  const blocos = mus.secoes ? [{ comps:lerCifra(mus) }] : mus.linhas.map(l => ({ comps:lerABC(l.abc, mus), letra:l.w ? lerLetra(l.w) : null }));
  const linhas = blocos.map(bl => {
    const lu = {}, st = { n:0, ct:0, pn:0 }; let k = 0;
    bl.comps.flat().forEach(ev => {
      ev.i = eventos.length; ev.beat = beat; beat += ev.dur; eventos.push(ev);
      if (ev.acorde){ ev.acordeT = transporAcorde(ev.acorde, t); ev.romano = romano(ev.acordeT, tpc, menor); ci = acorde(ev.acordeT); if (!acordes.includes(ev.acordeT)) acordes.push(ev.acordeT); }
      ev.ci = ci;
      if (ev.pausa) return;
      ev.m = ev.midi + t; ev.off = mod12(ev.midi - tpc0);
      usados[ev.off] = (usados[ev.off] || 0) + 1; lu[ev.off] = 1;
      ev.kp = pentaTom.includes(ev.off); st.n++; if (ev.kp) st.pn++;
      if (ci){ ev.iv = mod12(ev.m - ci.raiz); if (ci.tons.includes(ev.iv)) st.ct++; }
      if (bl.letra){ const y = bl.letra[k++]; ev.silaba = y && !y.segura ? y.t + (y.hif ? '-' : '') : ''; }
    });
    bl.comps.forEach(evs => { const b = { i:compassos.length, evs, ini:evs[0].beat, len:evs.reduce((a, e) => a + e.dur, 0), ci:(evs.find(e => e.ci) || {}).ci || null, acordes:evs.filter(e => e.acordeT).map(e => e.acordeT), secao:evs.secao };
      if (!b.acordes.length && b.ci) b.acordes = [b.ci.nome]; evs.forEach(e => e.bar = b.i); compassos.push(b); });
    return { comps:bl.comps, letra:!!bl.letra, st, an:analisar(Object.keys(lu).map(Number), menor) };
  });
  const primeiro = linhas[0]?.comps[0]?.reduce((a, e) => a + e.dur, 0) || barQ, anacruse = primeiro < barQ - 1e-6;
  const offs = Object.keys(usados).map(Number).sort((a, b) => a - b), an = analisar(offs, menor);
  const cheia = ESCALAS[an.melhor].graus.length === 7 ? ESCALAS[an.melhor].graus : ESCALAS[menor ? 'natural' : 'maior'].graus;
  eventos.forEach(ev => { if (!ev.pausa && ev.ci) ev.cat = ev.ci.tons.includes(ev.iv) ? 'ct' : ev.ci.penta.includes(ev.iv) ? 'pn' : cheia.includes(ev.off) ? 'sc' : 'cr'; });
  return { mus, t, menor, tonica, tpc, linhas, usados, offs, acordes, anacruse, an, eventos, compassos, barQ, total:beat, bpm:mus.bpm || 90,
    nCompassos:compassos.length - (anacruse ? 1 : 0) };
}
// valida e normaliza uma cifra que veio de fora (agente): devolve a música pronta ou um erro claro
function daCifra(d){
  const tom = String(d.tom || '').trim();
  if (!/^[A-G][#b]?m?$/.test(tom)) throw new Error('tom inválido: use algo como "Am", "C", "F#m" (só a tônica e o "m")');
  const secoes = (d.secoes || []).map(s => ({ nome:String(s.nome || '').slice(0, 40), compassos:(s.compassos || []).map(c => String(c).trim()).slice(0, 64), letra:s.letra ? String(s.letra).slice(0, 2000) : undefined }));
  if (!secoes.length || !secoes.some(s => s.compassos.length)) throw new Error('mande ao menos uma seção com compassos (um item por compasso, ex.: ["Am", "F G"])');
  for (const s of secoes) for (const c of s.compassos) for (const n of c.split(/\s+/).filter(Boolean)) if (!acorde(n)) throw new Error('não entendi o acorde "' + n + '" (use C, Am, G7, F#m7b5, Bbmaj7, Dsus4, C/E…)');
  const compasso = /^\d+\/\d+$/.test(d.compasso || '') ? d.compasso : '4/4';
  return { id:'c-' + String(d.titulo || 'musica').toLowerCase().normalize('NFD').replace(/[^\w]+/g, '-').slice(0, 40), titulo:String(d.titulo || 'Sem título').slice(0, 80), artista:String(d.artista || '').slice(0, 80),
    tom, compasso, bpm:Math.max(40, Math.min(240, Number(d.bpm) || 90)), secoes, fonte:d.fonte ? String(d.fonte).slice(0, 200) : undefined, cifra:true };
}
return { REPERTORIO, lerABC, lerLetra, lerCifra, contexto, daCifra, fracVal };
})();
if (typeof module !== 'undefined') module.exports = Musica;
