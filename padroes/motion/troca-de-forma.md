# Como uma forma vira a outra ao trocar de lado

> L1 · motion. Índice: [motion](README.md). As curvas citadas (`MORPH`, `--sp`, `--spd`) estão em [referencias/motion/curvas-e-duracoes.md](../../referencias/motion/curvas-e-duracoes.md).

Cada app resolve a troca de um jeito diferente, de acordo com o que ele é:

- **Órbita: FLIP com Web Animations.** Mede onde cada item está (`getBoundingClientRect`), troca as classes de lado com `.nomotion` ligada (sem transições), mede de novo e anima cada item do lugar antigo pro novo com `el.animate([{transform:translate(dx,dy)}, {transform:none}])` na curva `MORPH`.
  - Quando a largura ou a altura de um item muda mais de 10 px, o delta é medido **pelo lado da borda**, e não pelo centro: o ícone fica no lugar e o resto cresce pra dentro.
  - Durante o arrasto, o item que você segura continua embaixo do mouse: a diferença vira `regrab`, e a mola leva a janela até lá.
  - Fora do arrasto (`jump`), a janela pula na hora pra compensar.
  - A ilha é deslocada pelo mesmo tanto (`island.shift`) e escorre até o formato novo.
- **Onda: tudo é mola.** Não existe FLIP. Cada peça (capa, texto, controles, onda, barras, arco, lista, progresso) tem x, y, largura, altura, opacidade e raio, cada um numa mola que persegue o alvo da tabela de arranjos.
  - Os arranjos são medidos com a capa compacta em (0, 0) e a borda em cima e à esquerda. Os outros lados são espelhos: `x' = 64 − (x + w)` e `y' = 64 − (y + h)`.
  - Trocar de lado só muda os alvos.
  - Quando a capa troca de lado, o texto apaga por 160 ms enquanto atravessa. O alinhamento troca quando a opacidade fica abaixo de 0,05 (ou 260 ms depois), e o texto reaparece já do outro lado.
- **Eco: variáveis CSS na mesma mola.** O JS calcula a geometria inteira de cada lado e estado (retângulo, quatro raios, ombros, campo, conversa, coluna, alça, sugestões) e escreve tudo em variáveis (`--px --py --pw --ph --r1..4 --qx --kx --dx --ux --gx`…). Todas transicionam em `--spd`/`--sp`, então a forma inteira anda junta. Pra trocar a janela no meio de uma animação, `rebaseDock` fotografa os valores **computados** de agora, reescreve tudo relativo à janela nova com `.instant` (sem transição) e deixa a animação continuar dali.
