/* Arrumar: acha um lugar sem sobreposição pra cada peça, em qualquer tamanho de tela. Só contas, sem tela
   (testado em teste/arrumar.teste.js). Ordem de saída: mexer o menos possível, depois encolher, depois soltar da
   borda e, só em último caso, fechar quem não está em uso.
   planejar({ area:{w,h}, fixos:[{x,y,w,h}], itens:[{ id, x, y, w, h, forma, min:{w,h}, quer:{w,h}, emUso, prioridade }],
     aplica(item, lugar) -> {x,y,w,h} (o tamanho que a peça aceitou mesmo), fecha(item) })
   forma: 'livre' | top | bottom | left | right | c-tl | c-tr | c-bl | c-br (a peça presa continua presa no lado dela). */
const Arrumar = (() => {
  const FOLGA = 8, ESCALAS = [1, .85, .7, .55, .4, 0];
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const bate = (a, b) => a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1;
  const livreDe = (r, ocupados) => !ocupados.some(o => bate(r, o));
  // o que a forma prende: null = pode andar nesse eixo
  const presoX = (f, A, w) => f === 'left' || f === 'c-tl' || f === 'c-bl' ? 0 : f === 'right' || f === 'c-tr' || f === 'c-br' ? A.w - w : null;
  const presoY = (f, A, h) => f === 'top' || f === 'c-tl' || f === 'c-tr' ? 0 : f === 'bottom' || f === 'c-bl' || f === 'c-br' ? A.h - h : null;

  // o lugar vago mais perto de onde a peça está, com esse tamanho; os candidatos são as beiras da tela e dos vizinhos
  function lugar(A, ocupados, it, forma, w, h){
    const fx = presoX(forma, A, w), fy = presoY(forma, A, h);
    const eixo = (preso, atual, max, inicio, tam) => preso != null ? [preso]
      : [...new Set([lim(atual, 0, max), 0, max, ...ocupados.flatMap(o => [o[inicio] + o[tam] + FOLGA, o[inicio] - (inicio === 'x' ? w : h) - FOLGA])].filter(v => v >= 0 && v <= max).map(Math.round))];
    const xs = eixo(fx, it.x, A.w - w, 'x', 'w'), ys = eixo(fy, it.y, A.h - h, 'y', 'h');
    let melhor = null, dist = Infinity;
    for (const x of xs) for (const y of ys){
      const d = Math.abs(x - it.x) + Math.abs(y - it.y);
      if (d < dist && livreDe({ x, y, w, h }, ocupados)){ melhor = { x, y, w, h, forma }; dist = d; }
    }
    return melhor;
  }

  function tamanhos(A, it){
    const min = { w:Math.min(it.min?.w || 160, A.w), h:Math.min(it.min?.h || 110, A.h) };
    const q = { w:lim(Math.round(it.quer?.w || it.w), min.w, A.w), h:lim(Math.round(it.quer?.h || it.h), min.h, A.h) };
    const l = [];
    // encolhe primeiro um lado de cada vez (perde menos área) e depois os dois
    for (const s of ESCALAS){ const w = Math.max(min.w, Math.round(q.w * s)), h = Math.max(min.h, Math.round(q.h * s)); l.push([q.w, h], [w, q.h], [w, h]); }
    const vistos = new Set();
    return l.filter(([w, h]) => !vistos.has(w + 'x' + h) && vistos.add(w + 'x' + h)).sort((a, b) => b[0] * b[1] - a[0] * a[1]);
  }

  function planejar({ area:A, fixos = [], itens, aplica, fecha }){
    const ocupados = fixos.map(r => ({ ...r })), feito = { mexidos:[], fechados:[], apertados:[] };
    const ordem = [...itens].sort((a, b) => (!!b.emUso - !!a.emUso) || ((b.prioridade || 0) - (a.prioridade || 0)));
    for (const it of ordem){
      const formas = it.forma && it.forma !== 'livre' ? [it.forma, 'livre'] : ['livre'];
      let alvo = null, fica = null;
      busca: for (const f of formas) for (const [w, h] of tamanhos(A, it)){
        alvo = lugar(A, ocupados, it, f, w, h); if (!alvo) continue;
        const igual = alvo.forma === (it.forma || 'livre') && ['x', 'y', 'w', 'h'].every(k => Math.abs(alvo[k] - it[k]) <= 1);
        if (igual){ fica = { x:it.x, y:it.y, w:it.w, h:it.h }; break busca; }
        const r = aplica(it, alvo); feito.mexidos.push(it.id);
        if (livreDe(r, ocupados)){ fica = r; break busca; }
        // a peça não aceitou o tamanho pedido: procura lugar pro tamanho que ela ficou
        const outro = lugar(A, ocupados, { ...it, ...r }, f, r.w, r.h);
        if (outro){ const r2 = aplica(it, outro); if (livreDe(r2, ocupados)){ fica = r2; break busca; } }
      }
      if (fica) ocupados.push(fica);
      else if (!it.emUso){ fecha(it); feito.fechados.push(it.id); }
      else { feito.apertados.push(it.id); ocupados.push({ x:it.x, y:it.y, w:it.w, h:it.h }); }
    }
    feito.mexidos = [...new Set(feito.mexidos)].filter(id => !feito.fechados.includes(id));
    return feito;
  }
  return { planejar, bate };
})();
