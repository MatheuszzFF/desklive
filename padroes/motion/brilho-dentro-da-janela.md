# Brilho e sombra sempre dentro da janela

> L1 · motion. Índice: [motion](README.md). Regra: R4 em [regras-de-trabalho.md](../../regras/regras-de-trabalho.md).

O Windows corta em linha reta tudo que passa da janela (R4). Por isso:
- Os canvas da onda, das barras e do arco têm **12 px de folga** em volta, pro `shadowBlur` de 8 a 12 px não ser cortado.
- O halo da capa da Onda tem 80 % do tamanho dela, desce 15 % e usa `blur(14px)` (18 px nos degraus grandes). Ele cabe na margem de 48 px.
- A penumbra de leitura do Eco é um `radial-gradient(closest-side, …, rgba(4,5,9,0))`, que chega a zero antes de bater em qualquer borda da janela.
- As sombras de "levantar" crescem com `--grab`, mas os tamanhos máximos (5 a 11 px) cabem na margem.
- Os balões da Órbita são empurrados pra ficar a pelo menos 6 px da beirada da janela (`fitTip`).
- **Truque da transparência:** no modo app, `color-scheme: light` de propósito. Um esquema diferente do da janela faz o Chromium pintar um fundo opaco.
