# Órbita — hover, toque e tamanho máximo

> **O que é:** como a Órbita reage ao mouse por cima, ao pressionar e ao clicar, e o teto de área do degrau grande (L3, só da Órbita). **Quando ler:** antes de mexer em hover, balão, clique, zoom ou degrau grande. A regra geral pra todos os apps está em [hover e balões](../../padroes/hover-e-baloes.md); a reação própria de cada forma, no [README](README.md#forma-e-interação-por-lado) e no [degrau mínimo](degrau-minimo.md).

## Hover e pressionar (todas as formas)
- **Mola do hover:** `cubic-bezier(.22, .9, .32, 1.04)`, que passa só 4% do ponto. Ícone .26 s, halo .3 s, anéis .3 s. É mais calma que a mola dos morphs (1,12), pra não "quicar" a cada passada do mouse.
- **Pressionar:** o botão do app afunda pra **0,92** em .08 s (`ease-out`) e volta numa mola de .42 s ao soltar. Anel: 0,94. Setinha de recolher: 0,88.
- **Anéis:** crescem **8%** com o mouse em cima.
- **Propriedade separada:** o afundar e o crescer usam `scale`, que nunca briga com a lupa, o leque ou o FLIP (eles usam `transform` e `translate`).
- **Balão:** um só, por cima de tudo, posicionado pela imagem do ícone e pro lado de dentro da tela. Entra em 140 ms, desliza entre ícones em .22 s e sai em 160 ms. Não aparece onde a informação já está escrita: nomes na coluna larga, números na larga, pílulas, medidores e núcleo.
- **"Clique passa":** desliga na hora ao voltar pro que se vê e só liga depois de 140 ms fora.
- **Clique em botão dentro da área de arrasto:** o ponteiro só é segurado quando vira arrasto. A barra recolhida abre com clique no "‹", toque em qualquer ponto dela ou clique duplo.
- **Nada selecionável** (`user-select: none` na raiz).

## Colar e descolar sem trocar duas vezes
- A forma da borda (doca, barra de menu) e a pílula solta têm **histerese**: vira solta a **60 + 28 px** da posição encostada (130 + 28 nas laterais) e volta a ser doca abaixo de 60 (130). A prévia do encaixe e o soltar usam o mesmo limiar, então solta onde a prévia mostrou.
- Teste: arrastando e tremendo entre 50 e 110 px da borda, a forma troca **exatamente 2 vezes** (sai e volta), sem piscar.

## Teto de área (degrau grande e zoom)
- A janela nunca passa de **70% da altura útil** nem de **60% da largura útil**. Se a forma e o degrau, no zoom escolhido, passariam disso, a escala efetiva cai sozinha só o bastante (mínimo 0,5). O zoom escolhido fica salvo e volta quando cabe.
- O teto é conferido a cada troca de lado, de degrau e de conteúdo, antes de medir o layout novo.
- **Coluna larga reorganizada pra caber:** os medidores ficam **em linha** (12 px, número sempre à mostra em cima) em vez de três linhas com rótulo e gráfico. São ~90 px a menos.
- **Medido no simulador (1920 × 1080):** antes, coluna larga 76% da altura (99% com zoom 1,3) e barra larga embaixo 81% da largura com zoom 1,3. Depois, as 24 combinações (4 lugares × 3 degraus × 2 zooms) ficam dentro do teto (maior: 68% de altura, 60% de largura). Na coluna, arrastar ao longo da borda chega a ~57 px das pontas, onde o canto assume.
