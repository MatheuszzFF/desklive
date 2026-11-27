/* Estudo: lições geradas pela teoria (escala, pentatônica por desenho, modos, arpejos) ou trazidas pelo agente.
   Cada lição: { id, tema, titulo, sub, texto, raiz, graus, braco:{ de, ate }, passos:[{ titulo, texto, seq:[{ off, d }], bpm }] }.
   Os passos são tocáveis: seq em graus (semitons a partir da raiz, pode passar de 12) e duração em batidas. */
const Estudo = (() => {
const T = typeof Teoria !== 'undefined' ? Teoria : require('./teoria.js');
const { ESCALAS, MODOS, DEG, grafar, pretty, formula, rootPc, mod12, INS, acorde } = T;
const normRaiz = r => { const m = String(r || 'A').trim().match(/^([A-Ga-g])([#b♯♭]?)/); return m ? m[1].toUpperCase() + (m[2] === '♯' ? '#' : m[2] === '♭' ? 'b' : m[2]) : 'A'; };
// a escala subindo e descendo numa oitava (com a oitava no topo)
const sobeDesce = g => [...g, 12, ...[...g].reverse()].map(off => ({ off, d:.5 }));
// sequências clássicas de estudo
function grupos(g, n){ const ext = [...g, ...g.map(x => x + 12)], out = []; for (let i = 0; i < g.length; i++) for (let k = 0; k < n; k++) out.push({ off:ext[i + k], d:.5 }); out.push({ off:12, d:1 }); return out; }
function tercas(g){ const ext = [...g, ...g.map(x => x + 12)], out = []; for (let i = 0; i < g.length; i++) out.push({ off:ext[i], d:.5 }, { off:ext[i + 2], d:.5 }); out.push({ off:12, d:1 }); return out; }
// casa onde a raiz cai na corda mais grave, entre 0 e 11 (o desenho começa ali)
function casaRaiz(raiz, ins){ const I = INS[ins] || INS.baixo; return mod12(rootPc(raiz) - mod12(I.cordas[I.cordas.length - 1])); }

function escala(raiz, id = 'maior', ins = 'baixo'){
  raiz = normRaiz(raiz); const E = ESCALAS[id] || ESCALAS.maior, g = E.graus, c = casaRaiz(raiz, ins);
  return { id:'escala-' + id + '-' + raiz, tema:'escala', titulo:pretty(raiz) + ' ' + E.nome.toLowerCase(), sub:formula(g) + ' · ' + g.map(o => grafar(raiz, o)).join(' '),
    texto:E.porque, raiz, graus:g, marca:E.marca, braco:{ de:Math.max(0, c - 1), ate:c + 5 },
    passos:[
      { titulo:'Subir e descer', texto:'Uma oitava, devagar, falando o grau de cada nota. A raiz em destaque é o seu ponto de apoio.', seq:sobeDesce(g), bpm:70 },
      { titulo:'Grupos de 3', texto:'1-2-3, 2-3-4, 3-4-5… Treina o desenho sem decorar só a subida.', seq:grupos(g, 3), bpm:70 },
      { titulo:'Em terças', texto:'Pula uma nota da escala a cada passo: é o som dos arpejos escondido na escala.', seq:tercas(g), bpm:66 },
      ...(E.marca.length ? [{ titulo:'A nota que dá a cor', texto:'O grau ' + E.marca.map(m => DEG[m]).join(' e ') + ' é o que diferencia esta escala. Insista nele e ouça.', seq:[0, ...E.marca, 0, ...E.marca, 0].map(off => ({ off, d:1 })), bpm:60 }] : []),
    ] };
}
// pentatônica menor (ou maior) nos 5 desenhos: o desenho k começa no k-ésimo grau da penta, na corda mais grave
function pentatonica(raiz, menor = true, desenho = 1, ins = 'baixo'){
  raiz = normRaiz(raiz); const g = menor ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9], k = Math.max(1, Math.min(5, desenho | 0)) - 1;
  const c = casaRaiz(raiz, ins), ini = mod12(c + g[k]), de = ini === 0 && k ? 12 : ini;
  const giro = [...g.slice(k), ...g.slice(0, k).map(x => x + 12)];
  return { id:'penta-' + (menor ? 'm' : 'M') + '-' + raiz + '-' + (k + 1), tema:'pentatonica', titulo:'Penta ' + (menor ? 'menor' : 'maior') + ' de ' + pretty(raiz) + ' · desenho ' + (k + 1),
    sub:g.map(o => grafar(raiz, o)).join(' ') + ' · ' + (menor ? '1 ♭3 4 5 ♭7' : '1 2 3 5 6'),
    texto:'Cinco notas, cinco desenhos que se encaixam um no outro pelo braço todo. Este é o ' + (k + 1) + 'º, a partir da casa ' + de + '. ' + (menor ? 'É a base de blues, rock e funk.' : 'Mesmas notas da penta menor do relativo menor, com outro centro.'),
    raiz, graus:g, desenho:k + 1, braco:{ de:Math.max(0, de - 1), ate:de + 4 },
    passos:[
      { titulo:'O desenho', texto:'Suba e desça só neste desenho, duas notas por corda.', seq:[...giro, giro[0] + 12, ...[...giro].reverse()].map(off => ({ off, d:.5 })), bpm:72 },
      { titulo:'Sequência de 4', texto:'Quatro notas a partir de cada grau, subindo. Clássico de técnica e de frase.', seq:grupos(giro, 4), bpm:70 },
      { titulo:'Frase de blues', texto:'Repita até soar natural: ' + (menor ? '♭7 → 1, depois 4 → ♭3 → 1.' : '6 → 1, depois 3 → 2 → 1.'), seq:(menor ? [10, 12, 12, 5, 3, 0, 0, 7] : [9, 12, 12, 4, 2, 0, 0, 7]).map((off, j) => ({ off, d:j % 3 === 2 ? 1 : .5 })), bpm:80 },
      { titulo:'Ligue ao próximo desenho', texto:'Termine a frase já no desenho ' + (k % 5 + 2) + ': é assim que o braço vira um mapa só.', seq:[...giro, ...g.slice((k + 1) % 5).concat(g.slice(0, (k + 1) % 5).map(x => x + 12)).map(x => x + 12)].slice(0, 10).map(off => ({ off, d:.5 })), bpm:66 },
    ] };
}
// modos: os sete da escala maior a partir de uma raiz, com o acorde onde cada um mora e a nota característica
const CARAC = { jonio:[11], dorico:[9], frigio:[1], lidio:[6], mixo:[10], eolio:[8], locrio:[6] };
const ACORDE_MODO = { jonio:'maj7', dorico:'m7', frigio:'m7', lidio:'maj7', mixo:'7', eolio:'m7', locrio:'m7b5' };
function modo(raiz, id = 'dorico', ins = 'baixo'){
  raiz = normRaiz(raiz); const [nm, g] = MODOS[id] || MODOS.dorico, ch = raiz + ACORDE_MODO[id || 'dorico'], c = casaRaiz(raiz, ins), car = CARAC[id] || [];
  return { id:'modo-' + id + '-' + raiz, tema:'modos', titulo:pretty(raiz) + ' ' + nm, sub:formula(g) + ' · ' + g.map(o => grafar(raiz, o)).join(' '),
    texto:'Toque sobre ' + pretty(ch) + '. A nota que dá a cara do ' + nm + ' é o grau ' + car.map(m => DEG[m]).join(' e ') + ' (' + car.map(m => grafar(raiz, m)).join(', ') + ').',
    raiz, graus:g, marca:car, acorde:ch, braco:{ de:Math.max(0, c - 1), ate:c + 5 },
    passos:[
      { titulo:'A escala', texto:'Sobe e desce. Ouça onde ela "pesa".', seq:sobeDesce(g), bpm:70 },
      { titulo:'Arpejo + cor', texto:'1, 3, 5, 7 do acorde e depois a nota característica, resolvendo na raiz.', seq:[...acorde(ch).tons.slice(0, 4), ...car, 0].map(off => ({ off, d:1 })), bpm:66 },
      { titulo:'Vamp', texto:'Fique em cima de ' + pretty(ch) + ' alternando raiz e nota característica: é o exercício que mais ensina o som do modo.', seq:[0, 0, car[0] ?? 7, 0, 7, car[0] ?? 7, 0, 12].map(off => ({ off, d:.5 })), bpm:84 },
    ] };
}
function arpejo(nome, ins = 'baixo'){
  const ci = acorde(nome); if (!ci) throw new Error('acorde não reconhecido: ' + nome);
  const g = ci.tons.slice().sort((a, b) => a - b), c = casaRaiz(ci.raizNome, ins);
  return { id:'arpejo-' + nome, tema:'arpejos', titulo:'Arpejo de ' + pretty(nome), sub:g.map(o => DEG[o]).join(' ') + ' · ' + g.map(o => grafar(ci.raizNome, o)).join(' '),
    texto:'As notas do acorde, uma de cada vez. Na linha de baixo, são as notas mais seguras pra cair nos tempos fortes.', raiz:ci.raizNome, graus:g, braco:{ de:Math.max(0, c - 1), ate:c + 5 },
    passos:[
      { titulo:'Subindo e descendo', texto:'Fundamental, terça, quinta' + (g.length > 3 ? ', sétima' : '') + ', oitava e volta.', seq:[...g, 12, ...[...g].reverse()].map(off => ({ off, d:.5 })), bpm:72 },
      { titulo:'Fundamental e quinta', texto:'O esqueleto de 90% das linhas de baixo.', seq:[0, 7, 12, 7, 0, 7, 12, 7].map(off => ({ off, d:1 })), bpm:90 },
    ] };
}
// lição trazida pelo agente (assunto livre): valida o formato e completa o que dá
function livre(d){
  const raiz = normRaiz(d.raiz || 'A');
  const passos = (d.passos || []).slice(0, 8).map(p => ({ titulo:String(p.titulo || '').slice(0, 60), texto:String(p.texto || '').slice(0, 400),
    seq:(p.graus || []).slice(0, 32).map(x => ({ off:Math.max(-12, Math.min(24, Number(x?.off ?? x) || 0)), d:Math.max(.25, Math.min(4, Number(x?.d) || .5)) })), bpm:Math.max(40, Math.min(200, Number(p.bpm) || 72)) }));
  if (!d.titulo || !passos.length) throw new Error('a lição precisa de titulo e de pelo menos um passo');
  const graus = (d.escala ? (ESCALAS[d.escala]?.graus) : null) || [...new Set(passos.flatMap(p => p.seq.map(s => mod12(s.off))))].sort((a, b) => a - b);
  const c = casaRaiz(raiz, 'baixo');
  return { id:'livre-' + Date.now().toString(36), tema:String(d.tema || 'livre').slice(0, 30), titulo:String(d.titulo).slice(0, 80), sub:String(d.sub || '').slice(0, 120), texto:String(d.texto || '').slice(0, 800),
    raiz, graus, braco:{ de:Math.max(0, c - 1), ate:c + 5 }, passos };
}
// as notas soando de um passo, a partir da raiz no registro do instrumento
function tocavel(licao, passo, ins = 'baixo'){
  const I = INS[ins] || INS.baixo, n = I.cordas.length, raiz = rootPc(licao.raiz);
  const base = Math.min(...[n - 1, n - 2].map(s => I.cordas[s] + mod12(raiz - I.cordas[s])));
  let t = 0; return (passo.seq || []).map(x => { const o = { midi:base + x.off, t, d:x.d }; t += x.d; return o; });
}
const TEMAS = [
  { id:'escala', nome:'Escalas', exemplo:'escala de Lá maior, Mi menor natural, dórico…' },
  { id:'pentatonica', nome:'Pentatônica', exemplo:'os 5 desenhos, frases de blues' },
  { id:'modos', nome:'Modos', exemplo:'dórico sobre m7, mixolídio sobre 7…' },
  { id:'arpejos', nome:'Arpejos', exemplo:'Am7, G7, Cmaj7…' },
];
return { escala, pentatonica, modo, arpejo, livre, tocavel, TEMAS, normRaiz, casaRaiz };
})();
if (typeof module !== 'undefined') module.exports = Estudo;
