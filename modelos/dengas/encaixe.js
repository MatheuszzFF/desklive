/* ---------- encaixe do Dengas: onde e como ele gruda na beira da tela ----------
   Mora no mesmo bloco do dengas.js (vem logo depois na montagem), então enxerga D, raiz, area etc.
   Tudo aqui é posição e forma; a escolha de clipes do espiar (clipesEspia) é o padrão mínimo, quem cuida
   do ritmo e da arte pode trocar à vontade.
   - canto (lado + cima/baixo): a bolinha (o disco com o rostinho), em dengas.js
   - lateral (só o lado): ESPIANDO da borda — os pés na beira, metade do corpo pra fora, inclinado pra dentro,
     olhando pro meio da tela; puxou, volta inteiro
   - beira de baixo: sentado na barrinha (dengas.js) */
Mesa.estilo(`
#dg.espia #dgBanco{opacity:0!important}
#dg.espia canvas{transform-origin:50% 100%;transition:filter .2s,rotate .45s var(--mola)}
#dg.espia.esq canvas{rotate:16deg}
#dg.espia.dir canvas{rotate:-16deg}
#dg.espia.esq #dgHit{left:0;width:46px;top:-118px;height:104px}
#dg.espia.dir #dgHit{left:-46px;width:46px;top:-118px;height:104px}
`);
// os pés ficam na própria beira (x = 0 ou a largura), na altura em que foi solto, sem encostar em cima nem embaixo
function lugarEspia(b){ const A = area(); return { x:b.lado === 'l' ? 0 : A.w, y:clamp(b.y, 170, A.h - 70) }; }
function classesEncaixe(b){ raiz.classList.toggle('bolinha', !!b && !b.espia); raiz.classList.toggle('espia', !!b?.espia); raiz.classList.toggle('esq', !!b?.espia && b.lado === 'l'); raiz.classList.toggle('dir', !!b?.espia && b.lado === 'r'); }
// olhando pro meio da tela (pra direita na beira esquerda e vice-versa); falando e pensando, as poses normais
function clipesEspia(fala){
  if (fala) return [clip('falando')];
  if (D.pensando) return [clip('pensando')];
  return [clip('olhando_' + (D.bolinha.lado === 'l' ? 'dir' : 'esq'))];
}
