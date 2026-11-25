# Onda — player do Spotify

- **Conteúdo:** capa (o brilho usa as cores dela), título e artista, uma onda que reage ao áudio real, controles. Quatro degraus de tamanho: mínima, compacta, expandida e grande, que mostra a fila e as últimas tocadas.
- **Formas por lado** ([padrão](../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Laterais:** coluna vertical, com o nome em pé e a onda em barras. Deslizar ao longo dela ajusta o progresso.
  - **Topo:** faixa com a onda como horizonte. A rodinha do mouse avança ou volta 5 s.
  - **Embaixo:** prateleira com o equalizador subindo da borda. Clicar ou arrastar pula na música.
  - **Cantos:** quarto de disco. Girar a capa como um vinil anda na música.
- **Spotify:** Web API com PKCE (app no Spotify for Developers, em modo de desenvolvimento). Busca, tocar, fila e playlists.
- **Barramento:** publica `musica.json` e aceita comandos em `musica-cmd/` (inclusive `posicao`).
- **Ajudantes:** `musica-helper.ps1`, `meter.ps1`, `spotify-auth.ps1`.

## Como é feito

A linguagem de movimento comum está em [padroes/motion.md](../padroes/motion.md). Aqui fica o que é só da Onda.

### Estrutura: peças soltas em molas
- **Tudo é medido a partir da capa compacta** (64 × 64 px, a "âncora"). A posição lógica do motor é o canto dessa capa. A janela real é âncora + caixa `LR` (o que se vê, mais a margem do brilho de 48 px; do lado de uma borda encostada, só `G = 16`).
- Onze peças absolutas: `cover`, `meta`, `ctrls`, `wave`, `vt` (nome em pé), `vwave`, `list`, `bars`, `arc`, `mctrls` (controles móveis) e `prog`. Cada uma tem **x, y, largura, altura, opacidade e raio** em molas (k 300 / ζ 0,78 pra geometria, k 520 / ζ 0,95 pra opacidade). Os arranjos são uma **tabela de retângulos**, e trocar de lado ou de degrau só muda os alvos (motion, seção 9).
- Os arranjos são medidos com a borda em cima e à esquerda e espelhados (`x' = 64 − (x + w)`). A zona `Z` diz o tipo (`free`, `edge`, `side`, `corner`), de que lado fica a capa (`hx` L/R) e pra onde cresce (`vy` T/B).
- O **corpo fundido à borda** é um canvas atrás do player, com o pescoço líquido de até 60 px (motion, seções 5 e 6).

### Arranjos (forma × degrau)
| Forma | mínima | compacta | expandida | grande |
|---|---|---|---|---|
| **Solta** | capa + onda (112 px) | linha: capa, texto de 236 px e onda embaixo | capa de 146, texto, controles, onda de 416 × 40 | capa de 200, texto, controles, fila de 220 × 200, onda de 690 × 52 |
| **Coluna** (laterais) | barras de 52 × 80 | nome em pé (20 × 176), barras de 36 × 176, controles empilhados | capa de 150, texto, barras de 102 × 140 + controles | capa de 210, texto, barras, controles, fila |
| **Faixa** (topo) | capa de 40 + onda de 150 | capa de 48, texto, onda de 320 × 24 (o horizonte), controles à direita | capa de 120, onda de 500 × 32 | capa de 150, onda de 520 × 40, fila à direita |
| **Prateleira** (base) | equalizador de 200 × 26 + capa de 44 | equalizador de 380 × 40, capa de 64 elevada | equalizador de 560 × 62, capa de 140 | equalizador de 780 × 80, capa de 180, fila |
| **Quarto de disco** (cantos) | capa redonda de 60 + anel de progresso | capa-vinil de 92, arco com R 226 | capa de 130, R 362 | capa de 170, R 448 |

O progresso (`prog`) é uma linha de 3 px **na junção com a borda**, correndo a partir da capa. Raios do disco por degrau (`DISC`): R 140 / 226 / 362 / 448; anel da onda 114 / 158 / 304 / 384; controles ao longo do arco em 198 / 338 / 422, nos ângulos 18°, 45° e 72°.

### Interação própria de cada forma
- **Quarto de disco, vinil:** a capa fica redonda (raio = metade), com um furinho de 14 % no meio, e **gira em 9 s por volta** enquanto toca. Arrastar a capa **gira o disco** (o gesto aqui é girar, não mover a janela): o ângulo do mouse em volta do centro vira tempo, **1 volta = 30 s** (horário avança, anti-horário volta). Só conta depois de 0,12 rad, pra não confundir com clique. Com o mouse em cima, o vinil cresce 5 %.
- **Coluna, agulha:** passar o mouse mostra uma agulha branca de 2 px atravessando as barras, com brilho de 10 px na cor da capa e o tempo escrito ao lado. Deslizar ajusta o progresso.
- **Prateleira, equalizador que sobe com o toque:** as barras sobem como uma onda embaixo do mouse, com acréscimo gaussiano `profundidade × 0,75 × e^(−((u − u_mouse)/0,07)²)`. Clicar ou arrastar pula na música.
- **Faixa, horizonte:** a rodinha anda ±5 s (com um aviso no lugar do artista e o comando real só depois de 280 ms parado). Com o mouse na onda, o horizonte se agita: a amplitude ganha +0,35.
- **Capa (qualquer forma):** clique alterna os degraus (mínima → compacta → expandida ⇄ compacta; grande → expandida). No compacto, o play/pausa aparece sobre a capa (30 px, vidro com `blur(8px)`).

### Degraus e alça
- A alça são **dois arcos finos** de 22 px no canto de crescimento (o oposto da capa) e só aparece com o mouse. Puxando, ela segue o mouse com elástico (`+= (mouse − alça) × 0,55`).
- O degrau é o que tiver a caixa mais parecida com o tamanho puxado: `((Δw − W)/260)² + ((Δh − H)/160)²`, com o degrau atual valendo × 0,72 (histerese).
- Abrindo um degrau, as peças novas entram em sequência, uma a cada 55 ms.

### A onda (barra de tempo que reage ao som)
- **Nível do som:** o `meter.ps1` manda o pico do áudio do PC. O ganho é automático: `gainMax = max(gainMax × 0,996, pico, 0,04)`, e o alvo é `(pico/gainMax)^0,85`. O nível sobe rápido (fator 0,5 por quadro) e desce devagar (0,1). Sem medidor, uma respiração falsa: `0,35 + 0,2·sen(t/380)`.
- **Amplitude** `amp → 0,14 + 0,86 × nível` (suavização 0,12 tocando, 0,06 parado). **Fase** avança `1,6 + 4,2 × nível` rad/s, então a música mais alta corre mais.
- **Camadas** (frequência, sentido da fase, amplitude, espessura): `{2,2; 1,0; 1,0; 2,0}`, `{3,4; −1,35; 0,62; 1,4}`, `{1,5; 0,7; 0,42; 1,1}`. No degrau grande entram mais duas (`{4,6; 1,8; 0,36; 0,9}` e `{0,9; −0,55; 0,5; 0,9}`) e uma **fita espelhada** preenchida entre as duas primeiras camadas.
- **Envelope:** `sen(π·u)^1,6` nas pontas, então a onda nasce e morre em zero. A frequência escala com o comprimento: `fk = clamp(L/236, 0,55, 1,25)`.
  ```
  y(u) = meio + A·a·sen(πu)^1,6 · sen(2π·f·fk·u + fase·s + f)
  ```
- **Tocado × por tocar:** a parte tocada usa o degradê das duas cores da capa com `shadowBlur 8` (camada principal opaca, as outras a 55 %). A parte por tocar fica branca apagada (32 % na principal, 14 % nas outras). O ponto do tempo é um círculo branco de 4,5 px (3,2 no compacto) com brilho de 12 px na segunda cor.
- **Barras** (coluna e prateleira): uma a cada 7 px, com 3 px de vão e ponta redonda, crescendo **a partir da borda**. A altura vem de um ruído barato: `0,5 + 0,5·sen(i·1,9 + fase·1,4 + sen(i·0,7 + fase·0,6)·2)`, multiplicado pelo nível.
- **Arco** (cantos): a mesma onda dobrada num quarto de círculo em volta do vinil (120 segmentos, envelope `^1,4`). A amplitude é de 7 / 11 / 15 px nos degraus compacto / expandido / grande, mais calma no compacto pra não encostar nos botões.
- A capa **pulsa** com o som nos degraus grandes: escala `1 + nível × 0,022`.

### Cor tirada da capa
1. Desenha a capa num canvas de **32 × 32** e lê os pixels.
2. Dá uma nota pra cada pixel: `saturação × (0,35 + brilho/255)`, que favorece cor viva e clara.
3. A primeira cor é a de nota mais alta. A segunda é a melhor com **matiz a mais de 40°** da primeira e saturação acima de 0,18; se não houver, o pixel no percentil 15.
4. "Levanta" cada cor: escala até o canal mais forte valer 235 e mistura 80 % com 20 % de branco. Capa cinza (saturação < 0,12) cai num lilás neutro `#c9d2ff`.
5. Vira `--c1`/`--c2` (padrão `#a9b8ff` e `#9fffc4`) e pinta a onda, as barras, o arco, o progresso e o halo.

### Visual
- **Halo** atrás da capa: dois `radial-gradient` com as cores da capa, 80 % do tamanho dela e caído 15 % pra baixo, `blur(14px) saturate(1.4)` com opacidade .55 (`blur(18px)` e .6 nos degraus grandes).
- **Capa:** raio de 16 px no compacto (22 a 26 nos grandes), sombra `0 14px 28px -10px rgba(0,0,0,.7)` e anel de 1 px a 7 %. A capa nova entra com fade de .6 s e escala 1,06 → 1 em .9 s.
- **Texto solto** com sombra dupla (`0 1px 2px rgba(0,0,0,.7), 0 0 16px rgba(0,0,0,.4)`). Título em Space Grotesk 600, 15 px (20 px no expandido, 25 px no grande); artista em Inter 12,5 px (14 e 15). Trocar de música faz o texto subir 7 px com blur.
- **Nome em pé** (coluna): `writing-mode: vertical-rl`, lendo de baixo pra cima na esquerda e de cima pra baixo na direita, sempre começando perto da capa.
- Botão principal branco de 44 px com sombra `0 6px 18px rgba(0,0,0,.45)`; os outros são transparentes e ganham fundo de 12 % com hover. O play vira pausa girando 90°.
- Ícone do app: uma onda em degradê verde → lilás, desenhada em canvas.
- O estado do Spotify é lido a cada 1 s; o barramento, a cada 400 ms. A janela nasce invisível (`booting`) e entra com fade, sem animar a chegada.
