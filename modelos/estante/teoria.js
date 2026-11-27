/* Teoria: notas, graus, acordes, escalas, modos e o braço do instrumento. Sem DOM, sem estado: entra e sai dado.
   Vem da Estante original (v11), com tons e acordes ampliados pra cifra de qualquer música. */
const Teoria = (() => {
const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const PC = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
const LETTERS = 'CDEFGAB', NAT = [0, 2, 4, 5, 7, 9, 11];
const DEG = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
const DEG_NUM = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7];
const ROM = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV', 'V', '♭VI', 'VI', '♭VII', 'VII'];
const SALTO = ['=', '2m', '2M', '3m', '3M', '4J', 'trít.', '5J', '6m', '6M', '7m', '7M', '8J'];
const PAPEL = ['fundamental', 'nona menor', 'nona', 'terça menor', 'terça maior', 'quarta', 'trítono', 'quinta', 'sexta menor', 'sexta', 'sétima menor', 'sétima maior'];
const mod12 = n => ((n % 12) + 12) % 12;
const rootPc = n => mod12(PC[n[0]] + (n[1] === '#' ? 1 : n[1] === 'b' ? -1 : 0));
const accTxt = a => ({ '-2':'𝄫', '-1':'♭', '0':'', '1':'♯', '2':'𝄪' }[a] ?? '');
const pretty = n => String(n || '').replace(/#/g, '♯').replace(/^([A-G])b/, '$1♭').replace(/\/([A-G])b/, '/$1♭');

// armadura de qualquer tom maior ou menor: quantos ♯ ou ♭ e em que notas
const ORD_S = 'FCGDAEB', ORD_B = 'BEADGCF';
const SIG = { C:0, G:1, D:2, A:3, E:4, B:5, 'F#':6, 'C#':7, F:-1, Bb:-2, Eb:-3, Ab:-4, Db:-5, Gb:-6, Cb:-7 };
const REL = { Am:'C', Em:'G', Bm:'D', 'F#m':'A', 'C#m':'E', 'G#m':'B', 'D#m':'F#', 'A#m':'C#', Dm:'F', Gm:'Bb', Cm:'Eb', Fm:'Ab', Bbm:'Db', Ebm:'Gb', Abm:'Cb' };
function armadura(tom){
  const maior = REL[tom] || tom.replace(/m$/, ''), n = SIG[maior] ?? 0, acc = {};
  if (n > 0) for (let i = 0; i < n; i++) acc[ORD_S[i]] = 1; else for (let i = 0; i < -n; i++) acc[ORD_B[i]] = -1;
  return acc;
}
function transporAcorde(ch, t){
  const m = String(ch).match(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/); if (!m || !t) return ch;
  return NAMES[mod12(rootPc(m[1]) + t)] + m[2] + (m[3] ? '/' + NAMES[mod12(rootPc(m[3]) + t)] : '');
}
// grafia da nota a partir do grau (respeita a letra: em F, o ♭7 é Eb, não D#)
function sp(tonica, off){
  const L = LETTERS[(LETTERS.indexOf(tonica[0]) + DEG_NUM[off] - 1) % 7];
  const acc = mod12(rootPc(tonica) + off - NAT[LETTERS.indexOf(L)] + 6) - 6;
  return { L, acc, txt:L + accTxt(acc) };
}
const grafar = (tonica, off) => sp(tonica, off).txt;
function romano(ch, tpc, menor){
  const m = String(ch).match(/^([A-G][#b]?)(.*)$/); if (!m) return '';
  const d = mod12(rootPc(m[1]) - tpc), r = menor && [3, 8, 10].includes(d) ? ROM[d].slice(1) : ROM[d], min = /^m(?!aj)/.test(m[2]);
  return (min ? r.toLowerCase() : r) + m[2].replace(/^m(?!aj)/, '').replace(/\/.*$/, '');
}
// acorde: aceita m, 7, maj7, m7, m7b5 (ø), dim/°, aug/+, sus2, sus4, 6, m6, 9, add9, e baixo invertido (/E)
function acorde(nome){
  const m = String(nome || '').trim().match(/^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/); if (!m) return null;
  const q = m[2], root = rootPc(m[1]);
  const dim = /dim|°|m7b5|ø/.test(q), aug = /aug|\+/.test(q), menor = dim || /^m(?!aj)/.test(q), sus = (q.match(/sus([24])/) || [])[1];
  const maj7 = /maj7|7M|Δ/.test(q), tem7 = /7|9|11|13/.test(q) && !maj7, seis = /(^|[^1])6/.test(q) && !/13/.test(q);
  const tons = [0, sus === '2' ? 2 : sus === '4' ? 5 : menor ? 3 : 4, dim ? 6 : aug ? 8 : 7];
  if (maj7) tons.push(11); else if (/dim7|°7/.test(q)) tons.push(9); else if (tem7) tons.push(dim && !/m7b5|ø/.test(q) ? 9 : 10);
  if (seis) tons.push(9); if (/9|add9/.test(q)) tons.push(2);
  return { nome:String(nome).trim(), raizNome:m[1], raiz:root, baixo:m[3] ? rootPc(m[3]) : root, menor, dim, aug, dom:!menor && tem7 && !maj7 && !sus,
    tons, penta:menor ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9] };
}
const ESCALAS = {
  maior:   { nome:'Maior (jônio)', curto:'maior', graus:[0, 2, 4, 5, 7, 9, 11], marca:[4, 11], porque:'3 e 7 maiores: o som "resolvido" da escala maior.' },
  mixo:    { nome:'Mixolídio', curto:'mixolídio', graus:[0, 2, 4, 5, 7, 9, 10], marca:[10], porque:'Maior com ♭7: o som de blues, rock e baião.' },
  lidio:   { nome:'Lídio', curto:'lídio', graus:[0, 2, 4, 6, 7, 9, 11], marca:[6], porque:'Maior com ♯4: soa aberto, "flutuante".' },
  pentM:   { nome:'Pentatônica maior', curto:'penta maior', graus:[0, 2, 4, 7, 9], marca:[], porque:'Cinco notas, sem 4 e 7, portanto sem semitons.' },
  natural: { nome:'Menor natural (eólio)', curto:'menor natural', graus:[0, 2, 3, 5, 7, 8, 10], marca:[8, 10], porque:'♭3, ♭6 e ♭7: a menor "pura", sem sensível.' },
  harm:    { nome:'Menor harmônica', curto:'menor harmônica', graus:[0, 2, 3, 5, 7, 8, 11], marca:[11], porque:'Menor com 7 elevado: o salto de 1½ tom entre ♭6 e 7 dá o sabor "árabe".' },
  melod:   { nome:'Menor melódica', curto:'menor melódica', graus:[0, 2, 3, 5, 7, 9, 11], marca:[9, 11], porque:'Menor com 6 e 7 elevados: sobe sem o salto de 1½ tom.' },
  dorico:  { nome:'Dórico', curto:'dórico', graus:[0, 2, 3, 5, 7, 9, 10], marca:[9], porque:'Menor com 6 maior: menos triste, comum em funk, música celta e jazz.' },
  frigio:  { nome:'Frígio', curto:'frígio', graus:[0, 1, 3, 5, 7, 8, 10], marca:[1], porque:'Menor com ♭2: o som flamenco.' },
  locrio:  { nome:'Lócrio', curto:'lócrio', graus:[0, 1, 3, 5, 6, 8, 10], marca:[1, 6], porque:'♭2 e ♭5: instável, mora em cima do acorde meio-diminuto.' },
  pentm:   { nome:'Pentatônica menor', curto:'penta menor', graus:[0, 3, 5, 7, 10], marca:[], porque:'Cinco notas, sem 2 e ♭6: a base do blues e do rock.' },
  blues:   { nome:'Blues', curto:'blues', graus:[0, 3, 5, 6, 7, 10], marca:[6], porque:'Penta menor com a ♭5, a "blue note".' },
};
const MODOS = { jonio:['jônio', [0, 2, 4, 5, 7, 9, 11]], dorico:['dórico', [0, 2, 3, 5, 7, 9, 10]], frigio:['frígio', [0, 1, 3, 5, 7, 8, 10]], lidio:['lídio', [0, 2, 4, 6, 7, 9, 11]],
  mixo:['mixolídio', [0, 2, 4, 5, 7, 9, 10]], eolio:['eólio', [0, 2, 3, 5, 7, 8, 10]], locrio:['lócrio', [0, 1, 3, 5, 6, 8, 10]], frigdom:['frígio dominante', [0, 1, 4, 5, 7, 8, 10]] };
// o modo que nasce da escala do tom sobre este acorde
function modoDoAcorde(ci, tom){
  const d = mod12(ci.raiz - tom.tpc);
  if (ci.dim) return 'locrio';
  if (ci.dom || (tom.menor && d === 7 && !ci.menor)) return tom.menor && d === 7 ? 'frigdom' : 'mixo';
  const map = tom.menor ? { 0:'eolio', 2:'locrio', 3:'jonio', 5:'dorico', 7:'frigio', 8:'lidio', 10:'mixo' } : { 0:'jonio', 2:'dorico', 4:'frigio', 5:'lidio', 7:'mixo', 9:'eolio', 11:'locrio' };
  const id = map[d];
  return id && MODOS[id][1].includes(3) === ci.menor ? id : ci.menor ? 'dorico' : 'jonio';
}
function modoDe(ci, tom){ const id = modoDoAcorde(ci, tom), [nm, graus] = MODOS[id]; return { id, nome:nm, graus, notas:graus.map(o => grafar(ci.raizNome, o)) }; }
const ORDEM_MAI = ['maior', 'mixo', 'lidio', 'natural', 'harm', 'melod', 'dorico', 'frigio'];
const ORDEM_MEN = ['natural', 'harm', 'melod', 'dorico', 'frigio', 'maior', 'mixo', 'lidio'];
function formula(graus){
  return graus.map((d, i) => { const n = mod12(graus[(i + 1) % graus.length] - d) || 12; return n === 1 ? 'S' : n === 2 ? 'T' : n === 3 ? '1½' : n / 2 + 'T'; }).join(' ');
}
// qual escala explica as notas usadas
function analisar(offs, menor){
  const used = [...offs], ordem = menor ? ORDEM_MEN : ORDEM_MAI, penta = menor ? 'pentm' : 'pentM';
  const fora = id => used.filter(o => !ESCALAS[id].graus.includes(o));
  const cabem = ordem.filter(id => fora(id).length === 0);
  const melhor = !fora(penta).length ? penta : cabem.length ? cabem[0] : ordem.reduce((a, b) => fora(b).length < fora(a).length ? b : a);
  return { melhor, fora:fora(melhor).map(o => ({ o, de:ordem.find(id => ESCALAS[id].graus.includes(o) && id !== melhor) })),
    tambem:[...cabem, ...(melhor !== penta && !fora(penta).length ? [penta] : [])].filter(id => id !== melhor),
    faltam:ESCALAS[melhor].graus.filter(d => !used.includes(d)), marcas:ESCALAS[melhor].marca.filter(m => used.includes(m)) };
}
// instrumento: cordas (da mais aguda pra mais grave), afinação padrão; o baixo soa uma oitava abaixo do escrito
const INS = { baixo:{ nome:'Baixo', cordas:[43, 38, 33, 28], letras:['G', 'D', 'A', 'E'], desce:24 }, baixo5:{ nome:'Baixo 5', cordas:[43, 38, 33, 28, 23], letras:['G', 'D', 'A', 'E', 'B'], desce:24 },
  violao:{ nome:'Violão', cordas:[64, 59, 55, 50, 45, 40], letras:['e', 'B', 'G', 'D', 'A', 'E'], desce:12 } };
function soa(midiEscrito, ins){ const I = INS[ins] || INS.baixo, c = I.cordas; let p = midiEscrito - I.desce; while (p < c[c.length - 1]) p += 12; while (p > c[0] + 12) p -= 12; return p; }
function posicoes(midiEscrito, ins, ate = 12){ const I = INS[ins] || INS.baixo, p = soa(midiEscrito, ins), out = []; I.cordas.forEach((o, s) => { const f = p - o; if (f >= 0 && f <= ate) out.push({ s, f }); }); return out.sort((a, b) => a.f - b.f); }
// todas as casas de uma escala no braço, entre duas casas
function noBraco(raiz, graus, ins, de = 0, ate = 12){
  const I = INS[ins] || INS.baixo, out = [];
  I.cordas.forEach((o, s) => { for (let f = de; f <= ate; f++){ const off = mod12(o + f - raiz); if (graus.includes(off)) out.push({ s, f, off, raiz:off === 0 }); } });
  return out;
}
const midiDe = (nome, oit = 2) => 12 * (oit + 1) + rootPc(nome);
return { NAMES, DEG, ROM, SALTO, PAPEL, mod12, rootPc, pretty, armadura, transporAcorde, sp, grafar, romano, acorde, ESCALAS, MODOS, modoDoAcorde, modoDe, formula, analisar, INS, soa, posicoes, noBraco, midiDe, LETTERS, accTxt };
})();
if (typeof module !== 'undefined') module.exports = Teoria;
