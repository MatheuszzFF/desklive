// node modelos/estante/teste/nucleo.teste.js — testes da parte sem tela (teoria, música, frases, estudo)
const assert = require('assert');
global.Teoria = require('../teoria.js'); global.Musica = require('../musica.js'); global.Frases = require('../frases.js'); global.Estudo = require('../estudo.js');
const { Teoria:T } = global;
let n = 0; const t = (nome, fn) => { try { fn(); n++; } catch (e) { console.error('FALHOU:', nome, '\n ', e.message); process.exitCode = 1; } };

t('armaduras', () => { assert.deepStrictEqual(T.armadura('D'), { F:1, C:1 }); assert.deepStrictEqual(T.armadura('Gm'), { B:-1, E:-1 }); assert.deepStrictEqual(T.armadura('Am'), {}); });
t('grafia por letra', () => { assert.strictEqual(T.grafar('F', 10), 'E♭'); assert.strictEqual(T.grafar('E', 3), 'G'); assert.strictEqual(T.grafar('A', 4), 'C♯'); });
t('acordes', () => {
  assert.deepStrictEqual(T.acorde('Am7').tons, [0, 3, 7, 10]); assert.strictEqual(T.acorde('G7').dom, true);
  assert.deepStrictEqual(T.acorde('Bm7b5').tons, [0, 3, 6, 10]); assert.strictEqual(T.acorde('Bm7b5').dim, true);
  assert.deepStrictEqual(T.acorde('Cmaj7').tons, [0, 4, 7, 11]); assert.deepStrictEqual(T.acorde('Dsus4').tons, [0, 5, 7]);
  assert.strictEqual(T.acorde('C/E').baixo, 4); assert.strictEqual(T.acorde('X'), null);
});
t('transpor com baixo invertido', () => assert.strictEqual(T.transporAcorde('C/E', 2), 'D/F#'));
t('modo do acorde', () => { const tom = { tpc:9, menor:true }; assert.strictEqual(T.modoDoAcorde(T.acorde('Dm7'), tom), 'dorico'); assert.strictEqual(T.modoDoAcorde(T.acorde('E7'), tom), 'frigdom'); });
t('contexto ABC', () => { const c = Musica.contexto(Musica.REPERTORIO[0]); assert.strictEqual(c.compassos.length, 12); assert.ok(c.eventos.every(e => e.pausa || e.cat)); assert.strictEqual(c.tonica, 'A'); });
t('contexto transposto', () => { const c = Musica.contexto(Musica.REPERTORIO[0], 2); assert.strictEqual(c.tonica, 'B'); assert.strictEqual(c.compassos[0].acordes[0], 'B7'); });
t('anacruse', () => { const c = Musica.contexto(Musica.REPERTORIO.find(m => m.id === 'grace')); assert.ok(c.anacruse); });
t('cifra de fora', () => {
  const m = Musica.daCifra({ titulo:'Teste', tom:'Am', compasso:'4/4', bpm:100, secoes:[{ nome:'Verso', compassos:['Am', 'F G', 'C', 'E7'] }, { nome:'Refrão', compassos:['Dm7 G7', 'Cmaj7'] }] });
  const c = Musica.contexto(m); assert.strictEqual(c.compassos.length, 6); assert.strictEqual(c.compassos[0].secao, 'Verso'); assert.strictEqual(c.compassos[4].secao, 'Refrão');
  assert.deepStrictEqual(c.compassos[1].acordes, ['F', 'G']); assert.ok(Math.abs(c.total - 24) < 1e-9);
  assert.throws(() => Musica.daCifra({ titulo:'x', tom:'H', secoes:[{ compassos:['Am'] }] }));
  assert.throws(() => Musica.daCifra({ titulo:'x', tom:'Am', secoes:[{ compassos:['Qm'] }] }));
});
t('frase do compasso', () => {
  const c = Musica.contexto(Musica.REPERTORIO[0]), r = Frases.compasso(c, c.compassos[3]);
  assert.ok(r.ideia.length >= 3); assert.strictEqual(r.ideia[r.ideia.length - 1].cat, 'ap'); assert.strictEqual(r.chegada.acorde, 'D7'); assert.ok(r.modo.nome.includes('mixolídio'));
  const nt = Frases.nota(c, 0, 'baixo'); assert.strictEqual(nt.nota, 'A'); assert.ok(nt.braco.length);
  assert.ok(Frases.tocavel(c, c.compassos[0], 0, 'baixo').every(o => o.midi >= 28 && o.midi < 60));
});
t('estudo', () => {
  const e = Estudo.escala('A', 'maior'); assert.strictEqual(e.passos[0].seq.length, 15); assert.ok(e.sub.includes('C♯'));
  const p = Estudo.pentatonica('A', true, 1); assert.strictEqual(p.braco.de, 4); assert.strictEqual(p.desenho, 1);
  assert.strictEqual(Estudo.pentatonica('A', true, 2).braco.de, 7);
  const md = Estudo.modo('D', 'dorico'); assert.ok(md.texto.includes('Dm7')); assert.ok(md.texto.includes('B'));
  assert.ok(Estudo.arpejo('G7').sub.includes(' F'));
  const l = Estudo.livre({ titulo:'Slap básico', raiz:'E', passos:[{ titulo:'Polegar', graus:[0, 12, 0, 12] }] }); assert.strictEqual(l.passos[0].seq.length, 4);
  assert.throws(() => Estudo.livre({ passos:[] }));
  assert.ok(Estudo.tocavel(e, e.passos[0]).every(o => o.midi > 20));
});
console.log(n + ' testes ok' + (process.exitCode ? ' (com falhas acima)' : ''));
