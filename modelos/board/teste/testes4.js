// cenário da API aberta do Board (ver, mexer, dados, criar, ouvir, furo). Roda no simulador, sem mouse de verdade:
//   await T4.api()   → um objeto com "ok" e o que falhou
(() => {
  const { delay } = SIM;
  async function api(){
    await T.pronto();
    const s = SIM.sondaGlobal(), W = s.F.el.contentWindow, B = W.Board, b = SIM.bd(s.F.nome), a = b.area(), falhas = [], r = {};
    const confere = (nome, ok, visto) => { r[nome] = visto; if (!ok) falhas.push(nome); };
    const evs = []; const larga = B.ouvir('*', (d, t) => evs.push(t));
    const m0 = B.mapa();
    confere('mapa', m0.area.w === a.w && m0.pecas.some(p => p.id === 'sonda') && Array.isArray(m0.livre), { area:m0.area, pecas:m0.pecas.map(p => p.id), livre:m0.livre.length });
    B.degrau('sonda', 'compacto'); await delay(900);
    B.mover('sonda', { x:200, y:300 }); await delay(1200);
    const P = b.pecas.get('sonda');
    confere('mover solto', Math.abs(P.rv[0] - 200) < 1 && Math.abs(P.rv[1] - 300) < 1 && P.forma === 'livre', [P.rv[0], P.rv[1], P.forma]);
    B.mover('sonda', { forma:'c-br' }); await delay(1300);
    confere('mover pro canto', P.forma === 'c-br' && Math.abs(P.rv[0] + P.rv[2] - a.w) < 1 && Math.abs(P.rv[1] + P.rv[3] - a.h) < 1, [P.forma, P.rv[0] + P.rv[2], P.rv[1] + P.rv[3]]);
    let n = 0;
    B.definir({ id:'teste-api', nome:'Teste da API', criar:() => { const el = W.document.createElement('div'); el.style.cssText = 'width:220px;height:120px';
      return { el, fundo:'rgba(20,22,30,.95)', tamanho:() => ({ w:220, h:120 }), furos:() => [{ x:60, y:30, w:80, h:50 }],
        automacao:{ ver:() => ({ n }), comandos:[{ nome:'soma', descricao:'soma 1', roda:() => ++n }], regras:'peça de teste' } }; } });
    await delay(900);
    const Q = b.pecas.get('teste-api');
    confere('definir', !!Q && Q.visivel, !!Q);
    confere('comando', await B.comando('teste-api', 'soma') === 1 && B.peca('teste-api').ver.n === 1, B.peca('teste-api').ver);
    let erro = ''; try { await B.comando('teste-api', 'nada'); } catch (e) { erro = e.message; }
    confere('comando que não existe', /não tem o comando/.test(erro), erro);
    const fis = (lx, ly) => SIM.dipParaFis(SIM.monDe(b.minha()), lx + a.x, ly + a.y);
    const c1 = fis(Q.rv[0] + 100, Q.rv[1] + 55), c2 = fis(Q.rv[0] + 20, Q.rv[1] + 100);
    const noFuro = (await SIM.clicar(c1[0], c1[1])).foi; await delay(200); const fora = (await SIM.clicar(c2[0], c2[1])).foi;
    confere('furo', noFuro === 'desktop' && fora === 'board', { noFuro, foraDoFuro:fora });
    B.remover('teste-api'); await delay(600);
    confere('remover', !b.pecas.get('teste-api') || b.pecas.get('teste-api').removendo, !!b.pecas.get('teste-api'));
    confere('eventos', ['peca:moveu', 'peca:definida', 'peca:comando', 'peca:removida'].every(t => evs.includes(t)), [...new Set(evs)]);
    larga();
    confere('sem erros', SIM.FR.every(F => !SIM.bd(F.nome).erros.length), SIM.FR.map(F => SIM.bd(F.nome).erros.length));
    return { ok:!falhas.length, falhas, r };
  }
  window.T4 = { api };
})();
