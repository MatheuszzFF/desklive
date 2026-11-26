// cenários v3b: balão por cima da peça vizinha, custo do laço com peças animando
(() => {
  const { delay } = SIM;
  T.balao = async () => {
    const s = SIM.sondaGlobal(), b = s.b, d = s.F.el.contentDocument, a = b.area();
    await T.clicarEm('[data-t="afinacao"]', 900);
    const Af = b.pecas.get('afinacao'), bt = d.querySelector('[data-t=afinacao]').getBoundingClientRect();
    b.B.teleportar(Af, bt.left - 40, bt.top - 520 - 12); await delay(900);   // logo acima do botão (as peças não se sobrepõem: ficam encostadas)
    const ab = { x:Af.rv[0], y:Af.rv[1], w:Af.rv[2], h:Af.rv[3] };
    const c = SIM.dipParaFis(SIM.monDe(b.minha()), bt.left + bt.width / 2 + a.x, bt.top + bt.height / 2 + a.y);
    SIM.mover(c[0] - 20, c[1] + 4); await delay(40); SIM.mover(c[0], c[1]); await delay(700);
    const dica = d.getElementById('dica'), db = dica.getBoundingClientRect();
    const sobre = db.left < ab.x + ab.w && db.right > ab.x && db.top < ab.y + ab.h && db.bottom > ab.y;
    dica.style.setProperty('pointer-events', 'auto', 'important'); const topo = d.elementFromPoint(db.left + db.width / 2, db.top + db.height / 2); dica.style.removeProperty('pointer-events');
    return { balaoVisivel:dica.classList.contains('on'), texto:dica.textContent, sobrepoeAfinacao:sobre, quemEstaPorCima:topo === dica ? 'balão' : (topo?.closest('.peca')?.dataset.peca || topo?.tagName), zAfinacao:+Af.el.style.zIndex, zSonda:+s.P.el.style.zIndex };
  };
  T.custo = async () => {
    const s = SIM.sondaGlobal(), b = s.b, so = b.B.sonda;
    so.ligarAnimacao(true); await delay(500);
    const p = T.pega(); SIM.mover(...p); await delay(40); SIM.apertar();
    for (let i = 0; i < 180; i++){ SIM.mover(p[0] - 200 + Math.sin(i / 14) * 160, p[1] + 120 + Math.cos(i / 17) * 90); await delay(16); }
    const laco = b.statsLaco(), n = b.pecas.size; SIM.soltar(); await delay(300); so.ligarAnimacao(false); await delay(3000);
    const q0 = b.quadro(); await delay(1500);
    return { pecasNoBoard:n, animando:'Sonda arrastada + onda (canvas) + bolha (WebGL) + pílula em órbita + cartão', jsPorQuadro:laco, laçoDormeParado:!b.rodando() && b.quadro() === q0 };
  };
})();
