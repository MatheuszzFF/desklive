# Eco — assistente

> **O que é:** o doc L2 do Eco, o assistente com uma marca líquida em WebGL. **Quando ler:** antes de criar, refinar ou depurar qualquer coisa do Eco. O comum a todos os apps está em [padroes/](../../padroes/README.md); os detalhes profundos, em [marca-webgl.md](marca-webgl.md) (o shader), [visual.md](visual.md) e o histórico em [refinos.md](refinos.md).

- **Conteúdo:** forma líquida em WebGL (com alternativa em 2D), campo de pergunta, atalhos, conversa. No degrau grande aparece o histórico de conversas. A interface é **só do Eco**: sem cartão de música e sem painel do PC.
- **Ferramentas:** abrir apps e pastas, controlar a música (pela Onda), ver o status do PC e os discos, pesquisar na web. O modelo é Claude Haiku 5.5, pela capability `sample`.
- **Formas por lado** ([padrão](../../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Topo:** a ilha, fundida à borda e inclinando pro lado do mouse. É o padrão mínimo de qualidade dos apps.
  - **Laterais:** uma espinha que se desenrola atrás do mouse e vira uma folha alta.
  - **Embaixo:** uma barra de comando, com uma luz correndo atrás do mouse.
  - **Cantos:** um arco de sugestões que gira até o mouse.
- **Voz:** desligada (`VOICE=false`). O ditado não funciona em janelas de app, e o whisper.cpp é bloqueado pelo Smart App Control.
- **Atalho:** `Alt + Shift + Espaço` abre e fecha; ele também é o que a Órbita aciona ao clicar no orbe.
- **Barramento:** publica `eco.json`.

## Como é feito

A linguagem de movimento comum está em [padroes/motion](../../padroes/motion/README.md). Aqui fica o que é só do Eco.

### Estrutura
- Classes no `<html>`: `m-float` (solta) ou `m-dock` (fundida); `d-vert` (lateral) e `d-corner` (canto); `k-top`, `k-side`, `k-bottom` e `k-corner` (a forma do lado); `i-hover` (prévia) e `i-open` (painel); `h-r` (marca à direita); `v-t` (a conversa desce); `z-g` (degrau grande).
- Tudo mora em `.rig`, que o JS desloca (`--ox/--oy`) quando a janela troca de tamanho e devolve a zero numa mola (k 260 / ζ 0,86). **A marca nunca pula.**
- Tamanhos de janela: **112 × 112** fechado (só a marca e o brilho dela); **548** de largura na pílula média; **720** no grande; altura até **600**, acompanhando a conversa (`ResizeObserver` na pilha de mensagens).
- Presa a uma borda, o JS calcula em coordenadas de tela a geometria de cada lado e estado (forma, raios, ombros, campo, conversa, coluna, alça, sugestões) e escreve em variáveis CSS que animam todas na mesma mola `--sp` ([troca de forma](../../padroes/motion/troca-de-forma.md)). Crescendo, a janela cresce antes; encolhendo, o CSS anima antes e a janela encolhe depois.

### Forma e tamanho por lado e estado (`dockDims`)
| Lado | Repouso (tamanho mínimo) | Prévia (mouse em cima) | Aberto (médio / grande) |
|---|---|---|---|
| **Topo: ilha** | cápsula 92 × 38, raio 19 | 360 × 50, raio 25 | 480 × (altura da conversa) / 760 × 548, raio 28 / 32 |
| **Laterais: espinha** | recorte em pé 32 × 124, raio 16 | 54 × 340, raio 27 | folha alta de 392 / 520 de largura × (altura da tela − 96, entre 360 e 860), raio 30 |
| **Embaixo: barra de comando** | traço 128 × 34, raio 17 | campo largo 540 × 52 | barra 640 / 880 × 58, com a conversa subindo **em cartões soltos** acima dela |
| **Cantos: quarto de órbita** | quarto de círculo 54 × 54 | 84 × 84 + o arco de sugestões | cartão no canto 400 × (conversa) / 640 × 520 |

A marca muda de escala com o estado: 0,55 a 0,6 em repouso, 0,62 a 0,7 na prévia, 0,72 a 0,8 aberto e 0,86 na pílula solta aberta. A prévia entra 60 ms depois do mouse chegar e sai 340 ms depois dele sair.

### Interação própria de cada lado
- **Ilha (topo), ímã:** `--mx = clamp((x_mouse − centro) / (largura/2 + 60), −1, 1)`. A forma e os ombros andam `--mx × 7 px` e a marca `--mx × 11 px`, em .5 s `--sp2`, como se o mouse puxasse.
- **Espinha (laterais), desenrolar:** na prévia, a parte visível começa com 160 px, centrada, e **se desenrola acompanhando a altura do mouse** (±60 px em volta dele, nunca menos de 150 px). Os ombros e a marca vão junto. No grande, o histórico vira **abas redondas de 38 px** com as iniciais, presas na própria espinha.
- **Barra de comando (embaixo), luz que corre:** em repouso é só um traço de 2 px que **se estica até onde o mouse está** (`--fl` de 0,2 a 1). Com o mouse em cima, uma luz laranja corre atrás dele: um `radial-gradient` de 170 × 54 px mais uma linha de 1 px que acende ±90 px em volta do ponteiro. A dica do atalho aparece à direita.
- **Quarto de órbita (cantos), arco que gira:** as três sugestões saem do canto num arco de raio `ORBIT = 124` (levemente oval, × 1,4 na vertical), nos ângulos 46° ± 28°. O arco **gira até o ângulo do mouse**, limitado a 40–52° pra caber na tela, e a sugestão mais perto (a menos de 120 px) cresce 8 % e esquenta a borda.
- **Solta:** clique na marca abre a pílula, que cresce pro lado de dentro da tela. Na metade de cima, a conversa **desce**, com a mais nova perto do campo e o sumiço na ponta de baixo.

### Degraus e alça
- Três degraus: **só a marca** (fechado), **médio** (pílula com a conversa) e **grande** (painel com o histórico de conversas).
- A alça é um canto curvo de 15 px (solta, embaixo e nos cantos) ou uma barrinha de 32 × 4 px no lado de dentro (topo e laterais), e cresce pra 46 px com hover.
- A distância é medida "pra fora". Do médio: passa pro grande acima de 80 px (volta abaixo de 62) e **fecha** abaixo de −96 px (−76 pra desistir). Do grande: vai pro médio abaixo de −80 (−62) e fecha abaixo de −270 (−250).
- **Elástico:** `r = clamp((d − centro_do_degrau)/140, ±1,4)` e escala `1 + r/(1 + |r|·0,6) × 1,5 %`. Passando do ponto de fechar, o painel apaga pra 45 % antes de soltar.

### Arrastar, descolar e fundir
- Vira arrasto depois de 4 px. A marca **descola**: a janela encolhe pra 112 × 112 em volta dela, e a forma presa vira uma gota de 48 px que some atrás da marca, com os ombros recolhendo. Se estava aberta, a conversa recolhe na marca.
- Durante o arrasto, uma **forma-fantasma** se forma do lado da borda mais perto (até 160 px) e a marca se inclina e achata na direção dela ([sensor de borda](../../padroes/motion/sensor-de-borda-e-encaixe.md)).
- Ao soltar: perto de um canto (< 76 px nos dois eixos) se funde ao canto; perto de uma borda (< 44 px), à borda; senão, assenta solta, a pelo menos 44 px das bordas. Ao fundir, a marca voa até ficar a 22 px do lugar final e só então a forma nasce dela como uma gota de 44 px. Se estava aberta antes de arrastar, reabre (300 ms depois numa borda, na hora solta).
- O "sentir" do Eco: a marca estica até 17 % na direção do movimento e amassa 12 % contra a borda ao bater ([sentir o arrasto](../../padroes/motion/sentir-o-arrasto.md)).

## Testado

Ainda não registrado neste doc. O teste é no simulador `eco-sim.html` (localhost, gancho `window.__eco`), nunca no mouse do PC (R19). O próximo refino preenche esta seção: o que foi conferido por print (cada lado e canto, em repouso, com o mouse em cima e aberto) e o que ficou "não testado" no app instalado.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [marca-webgl.md](marca-webgl.md) | L3: a marca líquida (raymarching SDF, ruído, gotas, material, estados) |
| [visual.md](visual.md) | vidro, forma presa, "pensando", conversa, penumbra, cores e fontes |
| [refinos.md](refinos.md) | registro de cada refino, com data e números |
