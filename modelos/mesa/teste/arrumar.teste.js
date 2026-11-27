// node modelos/mesa/teste/arrumar.teste.js
const assert = require('assert'), fs = require('fs'), path = require('path');
const Arrumar = new Function(fs.readFileSync(path.join(__dirname, '..', 'arrumar.js'), 'utf8') + '\nreturn Arrumar;')();

function roda(area, itens, fixos = [], teimoso = {}){
  const L = new Map(itens.map(i => [i.id, { ...i }]));
  const r = Arrumar.planejar({ area, fixos, itens,
    aplica:(it, a) => { const p = L.get(it.id); Object.assign(p, a, teimoso[it.id]); return { x:p.x, y:p.y, w:p.w, h:p.h }; },
    fecha:it => L.delete(it.id) });
  const todos = [...L.values()];
  for (const [i, a] of todos.entries()){
    if (r.apertados.includes(a.id)) continue;
    assert(a.x >= -1 && a.y >= -1 && a.x + a.w <= area.w + 1 && a.y + a.h <= area.h + 1, 'fora da tela: ' + JSON.stringify(a));
    for (const b of [...todos.slice(i + 1), ...fixos]) assert(!Arrumar.bate(a, b), 'sobrepôs: ' + JSON.stringify([a, b]));
  }
  return { r, L };
}
const peca = (id, x, y, w, h, mais = {}) => ({ id, x, y, w, h, forma:'livre', min:{ w:160, h:110 }, ...mais });

// nada sobreposto: nada se mexe
let t = roda({ w:1600, h:900 }, [peca('a', 0, 0, 400, 300), peca('b', 600, 0, 400, 300)]);
assert.deepStrictEqual(t.r, { mexidos:[], fechados:[], apertados:[] });

// o caso do monitor em pé: Estante no topo em cima da Onda; a Onda e a Órbita são fixas
t = roda({ w:685, h:1197 }, [peca('estante', 0, 0, 685, 560, { forma:'top', emUso:true }), peca('video', 0, 591, 320, 480, { forma:'left' })],
  [{ x:0, y:0, w:244, h:244 }, { x:418, y:920, w:267, h:277 }, { x:593, y:0, w:92, h:92 }]);
assert.deepStrictEqual(t.r.fechados, []);

// peça presa na lateral continua presa quando há lugar
t = roda({ w:1600, h:900 }, [peca('a', 0, 0, 500, 500, { emUso:true }), peca('lado', 0, 100, 300, 400, { forma:'left' })]);
assert.strictEqual(t.L.get('lado').forma, 'left'); assert.strictEqual(t.L.get('lado').x, 0);

// tela encolheu: todo mundo cabe, menor
t = roda({ w:800, h:600 }, [peca('a', 900, 100, 700, 500, { emUso:true }), peca('b', 1200, 400, 500, 400)]);
assert(t.L.has('a'));

// sem lugar: fecha quem não está em uso, nunca quem está
t = roda({ w:400, h:300 }, [peca('ocioso', 0, 0, 380, 280, { prioridade:9 }), peca('uso', 0, 0, 400, 300, { emUso:true, min:{ w:400, h:300 } })]);
assert.deepStrictEqual(t.r.fechados, ['ocioso']); assert(t.L.has('uso'));

// quando a tela cresce, volta pro tamanho que a pessoa queria
t = roda({ w:1600, h:900 }, [peca('a', 0, 0, 300, 200, { quer:{ w:700, h:500 } })]);
assert.strictEqual(t.L.get('a').w, 700); assert.strictEqual(t.L.get('a').h, 500);

// peça que não aceita encolher abaixo de um tamanho não derruba o resto
t = roda({ w:900, h:700 }, [peca('a', 0, 0, 500, 700, { emUso:true }), peca('teima', 0, 0, 600, 600)], [], { teima:{ w:380, h:600 } });
assert(t.L.has('teima'));
console.log('arrumar: tudo certo');
