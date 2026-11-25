# Onda — player do Spotify

> **O que é:** o doc L2 da Onda, o player do Spotify com a onda que reage ao som. **Quando ler:** antes de criar, refinar ou depurar qualquer coisa da Onda. O comum a todos os apps está em [padroes/](../../padroes/README.md); os detalhes profundos, em [onda-e-cor.md](onda-e-cor.md) (fórmulas da onda e da cor da capa), [visual.md](visual.md) e o histórico em [refinos.md](refinos.md).

- **Conteúdo:** capa (o brilho usa as cores dela), título e artista, uma onda que reage ao áudio real, controles. Quatro degraus de tamanho: mínima, compacta, expandida e grande, que mostra a fila e as últimas tocadas.
- **Formas por lado** ([padrão](../../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Laterais:** coluna vertical, com o nome em pé e a onda em barras. Deslizar ao longo dela ajusta o progresso.
  - **Topo:** faixa com a onda como horizonte. A rodinha do mouse avança ou volta 5 s.
  - **Embaixo:** prateleira com o equalizador subindo da borda. Clicar ou arrastar pula na música.
  - **Cantos:** quarto de disco. Girar a capa como um vinil anda na música.
- **Spotify:** Web API com PKCE (app no Spotify for Developers, em modo de desenvolvimento). Busca, tocar, fila e playlists.
- **Barramento:** publica `musica.json` e aceita comandos em `musica-cmd/` (inclusive `posicao`).
- **Ajudantes:** `musica-helper.ps1`, `meter.ps1`, `spotify-auth.ps1` ([arquitetura](../../padroes/arquitetura.md)).

## Como é feito

A linguagem de movimento comum está em [padroes/motion](../../padroes/motion/README.md). Aqui fica o que é só da Onda.

### Estrutura: peças soltas em molas
- **Tudo é medido a partir da capa compacta** (64 × 64 px, a "âncora"). A posição lógica do motor é o canto dessa capa. A janela real é âncora + caixa `LR` (o que se vê, mais a margem do brilho de 48 px; do lado de uma borda encostada, só `G = 16`).
- Onze peças absolutas: `cover`, `meta`, `ctrls`, `wave`, `vt` (nome em pé), `vwave`, `list`, `bars`, `arc`, `mctrls` (controles móveis) e `prog`. Cada uma tem **x, y, largura, altura, opacidade e raio** em molas (k 300 / ζ 0,78 pra geometria, k 520 / ζ 0,95 pra opacidade). Os arranjos são uma **tabela de retângulos**, e trocar de lado ou de degrau só muda os alvos ([troca de forma](../../padroes/motion/troca-de-forma.md)).
- Os arranjos são medidos com a borda em cima e à esquerda e espelhados (`x' = 64 − (x + w)`). A zona `Z` diz o tipo (`free`, `edge`, `side`, `corner`), de que lado fica a capa (`hx` L/R) e pra onde cresce (`vy` T/B).
- O **corpo fundido à borda** é um canvas atrás do player, com o pescoço líquido de até 60 px ([fusão com a borda](../../padroes/motion/fusao-com-a-borda.md)).

### Arranjos (forma × degrau)
| Forma | mínima | compacta | expandida | grande |
|---|---|---|---|---|
| **Solta** | capa + onda (112 px) | linha: capa, texto de 236 px e onda embaixo | capa de 146, texto, controles, onda de 416 × 40 | capa de 200, texto, controles, fila de 220 × 200, onda de 690 × 52 |
| **Coluna** (laterais) | tira de barras de 26 × 176 colada na borda, sem capa; com o mouse a capa desliza de trás da borda e a tira desce pra 26 × 150 embaixo dela | nome em pé (20 × 176), barras de 36 × 176, controles empilhados | capa de 150, texto, barras de 102 × 140 + controles | capa de 210, texto, barras, controles, fila |
| **Faixa** (topo) | pílula pendurada: capa-bolinha de 30 + horizonte de 170 × 20; com o mouse o nome desce de dentro dela (200 × 40) | capa de 48, texto, onda de 320 × 24 (o horizonte), controles à direita | capa de 120, onda de 500 × 32 | capa de 150, onda de 520 × 40, fila à direita |
| **Prateleira** (base) | fio de equalizador de 240 × 18 rente à borda + capa-bolha redonda de 40 boiando acima, subindo até 7 px no ritmo; com o mouse o nome aparece do lado (196 × 40) | equalizador de 380 × 40, capa de 64 elevada | equalizador de 560 × 62, capa de 140 | equalizador de 780 × 80, capa de 180, fila |
| **Quarto de disco** (cantos) | quarto de vinil: disco de 152 com o centro no canto da tela (só um quarto aparece, com sulcos e reflexo fixo), girando com a música; anel de progresso em R 92 | capa-vinil de 92, arco com R 226 | capa de 130, R 362 | capa de 170, R 448 |

O progresso (`prog`) é uma linha de 3 px **na junção com a borda**, correndo a partir da capa. Raios do disco por degrau (`DISC`): R 110 / 226 / 362 / 448; anel da onda 92 / 158 / 304 / 384; controles ao longo do arco em 198 / 338 / 422, nos ângulos 18°, 45° e 72°.

### Interação própria de cada forma
- **Quarto de disco, vinil:** a capa fica redonda (raio = metade), com um furinho de 14 % no meio, e **gira em 9 s por volta** enquanto toca. Arrastar a capa **gira o disco** (o gesto aqui é girar, não mover a janela): o ângulo do mouse em volta do centro vira tempo, **1 volta = 30 s** (horário avança, anti-horário volta). Só conta depois de 0,12 rad, pra não confundir com clique. Com o mouse em cima, o vinil cresce 5 %.
- **Coluna, agulha:** passar o mouse mostra uma agulha branca de 2 px atravessando as barras, com brilho de 10 px na cor da capa e o tempo escrito ao lado. Deslizar ajusta o progresso.
- **Prateleira, equalizador que sobe com o toque:** as barras sobem como uma onda embaixo do mouse, com acréscimo gaussiano `profundidade × 0,75 × e^(−((u − u_mouse)/0,07)²)`. Clicar ou arrastar pula na música.
- **Faixa, horizonte:** a rodinha anda ±5 s (com um aviso no lugar do artista e o comando real só depois de 280 ms parado). Com o mouse na onda, o horizonte se agita: a amplitude ganha +0,35.
- **Mínimo, cada borda do seu jeito** (o mouse em cima troca o arranjo pela versão "-h", com a mesma demora de 420 ms pra voltar):
  - **coluna:** em repouso, só a tira de barras respirando com o som, colada na borda; a capa mora **atrás da borda** (fora da tela, sem opacidade). Com o mouse, ela desliza de trás da borda pra dentro e a tira desce 76 px. Deslizar na tira ajusta o progresso (agulha com o tempo).
  - **topo:** pílula com a capa-bolinha e o horizonte; com o mouse, o nome e o artista descem de dentro dela. A rodinha anda ±5 s.
  - **base:** a capa-bolha boia em cima do fio de equalizador, subindo `nível × 7 px` no ritmo; o fio sobe embaixo do mouse e clicar nele pula na música. Com o mouse, o nome aparece ao lado da bolha.
  - **canto:** quarto de vinil com o centro no canto da tela; girar o vinil com o mouse anda na música (1 volta = 30 s), como no disco grande.
  - **Peça atrás da borda:** a capa escondida da coluna e o vinil do canto contam pro tamanho da janela **só até a beira da tela**, pra janela nunca tentar sair dela (o Windows prenderia e o conteúdo pularia).
- **Capa (qualquer forma):** clique alterna os degraus (mínima → compacta → expandida ⇄ compacta; grande → expandida). No compacto, o play/pausa aparece sobre a capa (30 px, vidro com `blur(8px)`).

### Degraus e alça
- A alça são **dois arcos finos** de 22 px no canto de crescimento (o oposto da capa) e só aparece com o mouse. Puxando, ela segue o mouse com elástico (`+= (mouse − alça) × 0,55`).
- O degrau é o que tiver a caixa mais parecida com o tamanho puxado: `((Δw − W)/260)² + ((Δh − H)/160)²`, com o degrau atual valendo × 0,72 (histerese).
- Abrindo um degrau, as peças novas entram em sequência, uma a cada 55 ms ([entradas em sequência](../../padroes/motion/entradas-em-sequencia.md)).

## Testado

O teste é no simulador `onda-sim.html` (localhost, gancho `window.__onda`, janela presa dentro da tela como no app real), nunca no mouse do PC (R19).
- **Conferido por print (v14):** o mínimo em repouso e com o mouse na coluna (direita), no topo e na base, e o quarto de vinil nos cantos de cima à esquerda e de baixo à direita (janela de 140 × 140 dentro da tela). Degraus maiores: coluna, faixa, prateleira e disco (v11 e v12), as 32 combinações de degrau × borda/canto encostando a 4–16 px da borda (v10), girar o vinil 90° sem mover a janela e deslizar na coluna (v12).
- **Não testado:** tudo no app instalado (60 fps reais, se a capa escondida atrás da borda aparece certinha deslizando, Spotify de verdade na fila), monitores com DPI misto.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [onda-e-cor.md](onda-e-cor.md) | L3: a onda que reage ao som (nível, camadas, envelope, barras, arco) e a cor tirada da capa |
| [visual.md](visual.md) | halo, capa, texto, nome em pé, botões, ícone, ritmo de leitura |
| [refinos.md](refinos.md) | registro de cada refino, com data e números |
