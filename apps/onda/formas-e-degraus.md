# Onda — formas e degraus

> **O que é:** como a Onda é montada (peças em molas), a tabela de arranjos (forma × degrau) com os tamanhos reais, o teto de tamanho e a alça. **Quando ler:** antes de mexer num arranjo, num degrau ou no tamanho da janela da Onda. Índice: [Onda](README.md). A interação de cada forma está em [interacao.md](interacao.md).

## Estrutura: peças soltas em molas
- **Tudo é medido a partir da capa compacta** (64 × 64 px, a "âncora"). A posição lógica do motor é o canto dessa capa. A janela real é âncora + caixa `LR` (o que se vê, mais a margem do brilho de 48 px; do lado de uma borda encostada, só `G = 16`).
- Onze peças absolutas: `cover`, `meta`, `ctrls`, `wave`, `vt` (nome em pé), `vwave`, `list`, `bars`, `arc`, `mctrls` (controles móveis) e `prog`. Cada uma tem **x, y, largura, altura, opacidade e raio** em molas (k 300 / ζ 0,78 pra geometria, k 520 / ζ 0,95 pra opacidade). Os arranjos são uma **tabela de retângulos**, e trocar de lado ou de degrau só muda os alvos ([troca de forma](../../padroes/motion/troca-de-forma.md)).
- Os arranjos são medidos com a borda em cima e à esquerda e espelhados (`x' = 64 − (x + w)`). A zona `Z` diz o tipo (`free`, `edge`, `side`, `corner`), de que lado fica a capa (`hx` L/R) e pra onde cresce (`vy` T/B).
- O **corpo fundido à borda** é um canvas atrás do player, com o pescoço líquido de até 60 px ([fusão com a borda](../../padroes/motion/fusao-com-a-borda.md)).

## Arranjos (forma × degrau)
| Forma | mínima | compacta | expandida | grande |
|---|---|---|---|---|
| **Solta** | capa + onda (112 px) | linha: capa, texto de 236 px e onda embaixo | capa de 146, texto, controles, onda de 416 × 40 | capa de 200, texto, controles, fila de 220 × 200, onda de 690 × 52 |
| **Coluna** (laterais) | tira de barras de 26 × 176 colada na borda, sem capa; com o mouse a capa desliza de trás da borda e a tira desce pra 26 × 150 embaixo dela | nome em pé (20 × 176), barras de 36 × 176, controles empilhados | capa de 150, texto, barras de 102 × 140 + controles | capa de 150, texto (210 × 52), barras de 210 × 56, controles, fila de 210 × 156 (498 de altura) |
| **Faixa** (topo) | pílula pendurada: capa-bolinha de 30 + horizonte de 170 × 20; com o mouse o nome desce de dentro dela (200 × 40) | capa de 48, texto, onda de 320 × 24 (o horizonte), controles à direita | capa de 120, onda de 500 × 32 | capa de 130, texto de 300, onda de 440 × 36, controles, fila de 220 × 140 (1044 de largura) |
| **Prateleira** (base) | fio de equalizador de 240 × 18 rente à borda + capa-bolha redonda de 40 boiando acima, subindo até 7 px no ritmo; com o mouse o nome aparece do lado (196 × 40) | equalizador de 380 × 40, capa de 64 elevada | equalizador de 560 × 62, capa de 140 | equalizador de 780 × 80, capa de 180, fila |
| **Quarto de disco** (cantos) | quarto de vinil: disco de 152 com o centro no canto da tela (só um quarto aparece, com sulcos e reflexo fixo), girando com a música; anel de progresso em R 92 | quarto de vinil de raio 104, onda em arco a 120, controles a 150, corpo R 180 | vinil 150, onda 172, controles 210, R 248, nome num rótulo sobre o vinil | vinil 196, onda 220, controles 262, R 302, rótulo sobre o vinil |

O progresso (`prog`) é uma linha de 3 px **na junção com a borda**, correndo a partir da capa.

**Quarto de disco (`DISC`)**, por degrau mínima / compacta / expandida / grande: **em todos o vinil tem o centro no canto da tela** e tudo é concêntrico a ele, sem sobra: raio do vinil 76 / 104 / 150 / 196; anel da onda 92 / 120 / 172 / 220; controles ao longo do arco em 150 / 210 / 262, nos ângulos 18°, 45° e 72°; raio do corpo R 110 / 180 / 248 / 302. Os últimos 12 px do corpo são o **aro de pega** (faixa clara com pontinhos a cada 2,8°, mais forte com o mouse em cima). O nome, na expandida e na grande, fica num **rótulo** de vidro escuro (62 %, `blur(10px)`, raio 12) sobre o vinil, por cima de tudo.

## Teto de tamanho
- **Janela no máximo ~60 % da largura útil e ~70 % da altura útil** (em 1920 × 1080: 1152 × 756), contando a margem do brilho. Quando um arranjo passa disso, **reorganize** (capa menor, fila mais curta, peças lado a lado), nunca deixe crescer.
- Medido no simulador a 1920 × 1080 (v18), janela de cada degrau solta e em cada borda: o maior é a faixa grande, **1108 × 212 (58 %)**, e o mais alto é a coluna grande, **274 × 594 (55 %)**. A solta grande é 786 × 384 (41 % × 36 %).
- A caixa que a Onda pede pra janela é **cortada na tela contra o destino** (não contra a posição atual), com mínimo de 40 px: estável durante o assentar e nunca maior que a tela ([hover e balões](../../padroes/hover-e-baloes.md)).

## Degraus e alça
- O degrau só muda pela **alça** ou pelo **menu** (clique na capa toca/pausa).
- A alça são **dois arcos finos** de 22 px no canto de crescimento (o oposto da capa) e só aparece com o mouse. Puxando, ela segue o mouse com elástico (`+= (mouse − alça) × 0,55`).
- O degrau é o que tiver a caixa mais parecida com o tamanho puxado: `((Δw − W)/260)² + ((Δh − H)/160)²`, com o degrau atual valendo × 0,72 (histerese).
- Abrindo um degrau, as peças novas entram em sequência, uma a cada 55 ms ([entradas em sequência](../../padroes/motion/entradas-em-sequencia.md)).
