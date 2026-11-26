# Board: o motor de motion

> L3 · referência. Índice: [ambiente](README.md) · peças em [board-pecas](board-pecas.md) · telas em [board-telas](board-telas.md) · conexão em [board-conexao](board-conexao.md). **O que é:** o laço central do Board (canais, molas por estado, passo fixo, entrada, contatos, ganchos, afinação) e os números do simulador. **Quando ler:** antes de afinar qualquer movimento dentro do Board.

## Canais e molas (v2, finais)

- **16 canais por peça:** `x y w h` · `s` escala · `rot` · `o` opacidade · `r0..r3` raios · `sx sy kx` deformação `[[sx,kx],[kx,sy]]` · `f` fusão (ombros) · `l` levantar (sombra).
- **Passo fixo de 240 Hz**, até 30 subpassos, render interpolado no vsync de cada monitor; câmera lenta global 0,1–1×. **Mola por canal e por estado:** `PERFIS[estado][grupo]`; estados `arrastando`, `soltando`, `encaixando`, `trocando`, `assentado` e `saltando` (pílula). `k = 0` = direto (subpixel).

| Mola | k | ζ | Onde |
|---|---|---|---|
| direto | 0 | — | posição no arrasto |
| cola | 1600 | 1 | opção de arrasto com um fio de atraso |
| encaixe | 320 | 0,78 | soltar num alvo |
| assentar | 240 | 0,9 | soltar solto, com o embalo (0,16 s da velocidade) |
| forma | 300 | 0,8 | troca de forma, degrau, abrir e recolher |
| raio | 380 | 0,92 | raios e fusão (ombros recolhem ao descolar) |
| levantar | 520 | **0,72** | escala, sombra e inclinação (v1: 0,62, quicava demais) |
| deforma | 700 | 0,5 | estica, amassa e volta |
| surgir | 200 | 0,95 | peças nascendo e sumindo (escala 0,94 ↔ 1 e opacidade) |
| salto | 230 | 0,8 | a pílula pulando de lugar, com um estalo na escala |
| secao | 260 | 0,92 | alturas internas (seções, aviso, listas) |
| rolar | 300 | 1 | rolagem do log |

| Efeito | Valor |
|---|---|
| levantar no arrasto | escala 1,012 e sombra (canal `l` 0 → 1); perto da guia a sombra baixa (`1 − 1,8 × ímã`): ela "pousa" antes de encaixar |
| inclinar | 0,00035°·px/s da velocidade + 0,00002°·px/s² da aceleração, máx. 2° |
| esticar | 1/40000 por px/s na direção do movimento, máx. 3,5 % |
| descolar | estirão de 0,55/s na escala, pra fora da borda (líquido) |
| amassar | contato com a parede: 0,32 × 3,6 por px de penetração, na direção do contato |
| hover | escala 1,006 e sombra 0,22 pelo motor; margem de saída 0 → 10 px em ~90 ms |

## Entrada e ponto pego

- `pointerrawupdate` quando existe, senão `pointermove` + `getCoalescedEvents()`; anel de 128 amostras com o `timeStamp` do evento; velocidade por regressão de 64 ms; previsão de 1 quadro (máx. 32 px, some em 60 ms sem amostra).
- **Ponto pego em pixels** (migra junto com o tamanho); a escala, a inclinação e a deformação giram nele. Parado, o pivô é a **âncora** (o lado fundido fica no lugar quando a peça amassa ou cresce).
- **Ímã:** `0,5 · smoothstep(1 − d/zona)`, suavizado a 14/s e **no máximo 6 px por quadro** (trocar de alvo nunca dá degrau). Zonas: borda 72, canto 120 (`d·0,35 − 30`), degrau 100, emenda 44 e canto da emenda 60, só abaixo de 260 px/s; o degrau na ponta de uma emenda aberta segue a regra da emenda.

## Contatos e limites

- **Limite do arrasto:** projeção na união de retângulos (meu monitor, monitores com Board e a faixa de cada emenda aberta, só do tamanho da emenda) — ver [board-telas](board-telas.md). Se a projeção saltaria (troca de região no degrau), a peça desliza **no máximo 10 px por quadro além do cursor**.
- **Elástico (rubber-band)** contra a parede no arrasto: cede `d·(1 − 1/(x/d + 1))` com d = 36 px; a velocidade sai multiplicada pela derivada `1/(x/d + 1)²` (contínua ao soltar) e volta com mola.
- **Parede macia** fora do arrasto: mola dura k 16000, ζ 0,34 contra a borda da tela (com o tamanho **atual** da peça). Quique curto e proporcional à velocidade, sem salto de velocidade, com o micro-amassado.
- **Peças não se sobrepõem:** se encostam (folga de 8 px), a de baixo (ou a não arrastada) desliza pra fora em 35 % por quadro, pela mola dela; fundida numa borda, só desliza ao longo dela; canto não é empurrado.
- **CSS nunca move peça:** posição, tamanho e forma só pelo motor; a translação é arredondada no pixel físico do monitor. CSS só no cosmético de dentro.

## Ganchos, afinação, desempenho

- Fases: `pegou`, `arrastando`, `perto`, `encaixou`, `soltou`, `assentou`, `trocouForma`, `adotada`. Camadas somadas: `ctx.camada`. `Board.entrada` dá velocidade e aceleração.
- **Afinação** (Ctrl+Alt+Shift+B ou menu): molas, câmera lenta, prever, levantar, inclinar (vel. e acel.), esticar, amassar, escorrer; overlay; registro `~/.orbita/board-trace.json` (posição, alvo, velocidade, erro do ponto pego, ímã, forma, degrau, opacidade, escala, deformação, fusão, levantar, rotação, fases, entrada); **Telas e conexão**.
- Laço **dorme** parado; acorda com entrada, mola, animação, oferta de passe ou sinal pendente. Um erro num quadro é registrado e o laço continua (nunca congela).

## Números (simulador, 26/11/2026; relógio por MessageChannel, sem estrangulamento)

| Medida | Resultado |
|---|---|
| erro do ponto pego fora do ímã e da parede | **0 px** (todos os arrastos) |
| saltos no arrasto (peça andando > 16 px além do cursor num quadro) | **0** nas 4 bordas, 4 cantos e degrau do monitor 2; maior excesso 0,5–3,3 px (10 px só no deslize limitado pela quina do degrau) |
| observador de layout (caixa mudando > 1 px num quadro sem animação) | **0** em 5030 quadros: seções, botões, testes (inclusive 20 cliques na pílula), arrasto, emenda |
| câmera lenta 0,25×: encaixar, descolar, pular, recolher, abrir, peças nascendo e sumindo | 0 quedas de opacidade; maior passo de escala 0,003–0,005; fora do arrasto, maior passo 25 px/quadro (mola de 720 px) |
| batida na parede (0,35×) | entra 4,2 px, volta com um quique; velocidade −3743 → +189 → 0 px/s, contínua; amassa 0,5 % |
| elástico (0,35×) | cede 33,7 px e volta; velocidade em sino, maior passo 64 px/s por amostra |
| JS do laço, 5 peças (Sonda arrastada + onda + WebGL + órbita + cartão) | p50 0,2 · p95 0,3 · máx. 0,8 ms; parado o laço dorme |

**Falta no app instalado:** CPU e GPU (seção 5 da Sonda), o rAF de verdade, `pointerrawupdate` no host, vídeo quadro a quadro (R25).
