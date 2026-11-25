# Sensor de borda, ímã e encaixe

> L1 · motion. Índice: [motion](README.md).

Todo app **sente o lado antes de encostar**: a forma já se reorganiza durante o arrasto. A emenda entre dois monitores **não conta como borda**. Cada app testa um ponto 30 px além da borda (a Onda usa tolerância de 3 px entre os `bounds`). Se cair em outra tela, a borda é ignorada e dá pra passar direto.

| | Órbita | Onda | Eco |
|---|---|---|---|
| Referência | o ponteiro do mouse | a capa compacta (64 px) | o centro da marca (raio 32) |
| Canto | os dois eixos < **160 px** (fica até 230) | uma lateral **e** topo/base ao mesmo tempo | os dois eixos < **76 px** (`CSNAP`) |
| Lateral | eixo horizontal < **230 px** (fica até 300) **e** < vertical + 60 | lado < **90 px** (`SENSE`), fica até **130** (`KEEP`) | lado mais perto < **44 px** (`SNAP`) |
| Topo | < **250 px** (fica até 330) | idem | idem |
| Encosta ao soltar se | estiver a < **60 px** (130 nas laterais) da posição encostada | a zona sentiu a borda | o destino projetado cai num `dock` |
| Ímã extra | centraliza na borda se o centro estiver a < **30 px** do meio | — | — |
| Folga da tela | `G = 12 px` (24 a mais em cima/embaixo na coluna) | `G = 16 px` | solta: 44 px; presa: rente |
| Histerese de lado | — | metade esquerda/direita com ± **40 px** (`MIDH`) | — |

- **Prévia do encaixe:** durante o arrasto, cada app pergunta ao motor onde a janela pararia se soltasse agora (`projected`, com τ = 0,14 s) e acende o lado: na Órbita, o contorno azul da ilha; no Eco, uma **forma-fantasma** que cresce do lado da borda.
- **Forma-fantasma do Eco:** intensidade `n = (1 − gap/160)^1.6`, só do lado mais perto. Ela é deitada (64 → 100 × 40 px) em cima e embaixo, em pé nas laterais, e se desloca até 16 px na direção da borda. Fundo `rgba(8,9,13,.8)`; quando vai encaixar, a borda fica laranja `rgba(240,169,138,.45)` com brilho.
- **Pouso do Eco:** a marca voa com o embalo até ficar a menos de 22 px do lugar final, numa mola firme. Só então a forma se funde, herdando metade da velocidade. As âncoras ficam a 19 px da borda (lados) e a 27 px (cantos), sempre a pelo menos 80 px das pontas da borda.
- **Limiares do gesto:** vira arrasto depois de **6 px** na Órbita, **5 px** na Onda e **4 px** no Eco. Se o botão ficar segurado mais de 220 ms, basta 2,5 px. Um arrasto engole o clique seguinte por 400 ms. Um *watchdog* encerra qualquer gesto parado há 12 s.
