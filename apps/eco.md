# Eco — assistente

- **Conteúdo:** forma líquida em WebGL (com alternativa em 2D), campo de pergunta, atalhos, conversa. No degrau grande aparece o histórico de conversas. A interface é **só do Eco**: sem cartão de música e sem painel do PC.
- **Ferramentas:** abrir apps e pastas, controlar a música (pela Onda), ver o status do PC e os discos, pesquisar na web. O modelo é Claude Haiku 5.5, pela capability `sample`.
- **Formas por lado** ([padrão](../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Topo:** a ilha, fundida à borda e inclinando pro lado do mouse. É o padrão mínimo de qualidade dos apps.
  - **Laterais:** uma espinha que se desenrola atrás do mouse e vira uma folha alta.
  - **Embaixo:** uma barra de comando, com uma luz correndo atrás do mouse.
  - **Cantos:** um arco de sugestões que gira até o mouse.
- **Voz:** desligada (`VOICE=false`). O ditado não funciona em janelas de app, e o whisper.cpp é bloqueado pelo Smart App Control.
- **Barramento:** publica `eco.json`.

## Como é feito

A linguagem de movimento comum está em [padroes/motion.md](../padroes/motion.md). Aqui fica o que é só do Eco.

### Estrutura
- Classes no `<html>`: `m-float` (solta) ou `m-dock` (fundida); `d-vert` (lateral) e `d-corner` (canto); `k-top`, `k-side`, `k-bottom` e `k-corner` (a forma do lado); `i-hover` (prévia) e `i-open` (painel); `h-r` (marca à direita); `v-t` (a conversa desce); `z-g` (degrau grande).
- Tudo mora em `.rig`, que o JS desloca (`--ox/--oy`) quando a janela troca de tamanho e devolve a zero numa mola (k 260 / ζ 0,86). **A marca nunca pula.**
- Tamanhos de janela: **112 × 112** fechado (só a marca e o brilho dela); **548** de largura na pílula média; **720** no grande; altura até **600**, acompanhando a conversa (`ResizeObserver` na pilha de mensagens).
- Presa a uma borda, o JS calcula em coordenadas de tela a geometria de cada lado e estado (forma, raios, ombros, campo, conversa, coluna, alça, sugestões) e escreve em variáveis CSS que animam todas na mesma mola `--sp` (motion, seção 9). Crescendo, a janela cresce antes; encolhendo, o CSS anima antes e a janela encolhe depois.

### Forma e tamanho por lado e estado (`dockDims`)
| Lado | Repouso | Prévia (mouse em cima) | Aberto (médio / grande) |
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
- Durante o arrasto, uma **forma-fantasma** se forma do lado da borda mais perto (até 160 px) e a marca se inclina e achata na direção dela (motion, seção 8).
- Ao soltar: perto de um canto (< 76 px nos dois eixos) se funde ao canto; perto de uma borda (< 44 px), à borda; senão, assenta solta, a pelo menos 44 px das bordas. Ao fundir, a marca voa até ficar a 22 px do lugar final e só então a forma nasce dela como uma gota de 44 px. Se estava aberta antes de arrastar, reabre (300 ms depois numa borda, na hora solta).
- O "sentir" do Eco: a marca estica até 17 % na direção do movimento e amassa 12 % contra a borda ao bater (motion, seção 7).

### A marca líquida (WebGL)
Uma forma 3D desenhada por **raymarching de um campo de distância (SDF)** num único *fragment shader*, sobre um quadrado que cobre o canvas.
- **Canvas:** 100 × 100 px CSS, transbordando 18 px de cada lado do botão de 64 px (é a margem do brilho). `devicePixelRatio` limitado a 2. WebGL com `alpha` e `premultipliedAlpha`, então o fundo é transparente de verdade.
- **Câmera:** origem em z = 3,2, raio `normalize(uv, −2,7)`, `uv` escalado × 2,45. São **56 passos** com passo de 0,82 × distância, parando com d < 0,0015 ou t > 6,5. A normal é a diferença central com ε = 0,0025.
- **Corpo:** esfera de raio `0,48 + 0,02·sen(1,1t)` (mais `0,07 × nível` ouvindo), deformada por **ruído simplex 3D** em duas oitavas: `snoise(p·1,05 + t·(0,16; 0,12; 0,22)) + 0,22·snoise(p·2,3 − …)`.
  ```
  amplitude = 0,05 + 0,035·hover + 0,2·nível·ouvindo + 0,03·pensando
  ```
- **Três gotas orbitando**, fundidas no corpo com **mínimo suave** (`smin`, k = 0,24), como mercúrio. Raios de 0,105 a 0,069; órbita `0,74 + 0,16·sen(…)` (+0,06 com hover); velocidade angular `0,42 + 0,17·i` (× 3 pensando).
- **Pensando:** um redemoinho torce o espaço no plano xz, mais forte perto do centro (`1,2 − |p.xy|`).
- **Material: vidro escuro iridescente laranja.**
  - Base que mistura `deep (.16,.035,.03)` com `body (.72,.26,.15)` pela luz difusa^1,4.
  - **Núcleo quente** `core (1,.5,.28) × facing³` que acende por dentro (mais forte ouvindo ou pensando).
  - **Borda** de Fresnel (`(1 − n·v)^2,6`) com uma paleta de cosseno iridescente (laranja → rosa → violeta) que gira devagar com o tempo.
  - Reflexo nítido `^90 × 1,6`, reflexo largo `^14 × 0,18` e um **segundo reflexo frio** violeta `^24 × 0,35`, vindo de outra luz.
- **Brilho fora do corpo:** `exp(−7 × distância mínima do raio)`, na cor de laranja a violeta, mais forte com hover, voz ou pensando. Sai como alfa (`max(a, glow × 0,95)`), então o halo é parte da própria marca e não é cortado.
- **Estados** (cada um suavizado por quadro): hover 0,1, pensando 0,06, ouvindo 0,08. O relógio do shader acelera com eles: `1 + 0,9·hover + 1,4·pensando + 1,5·nível`. Com movimento reduzido, roda a 0,15.
- **Sem WebGL:** uma reserva em canvas 2D com núcleo em degradê radial (#fff3ec → #d97757 → #a3482a, brilho de 14 px) e três ondas de eco que saem dele.
- **Nascer:** a marca entra de `scale(.01)` na mola. Em repouso solta, flutua 4 px em 6 s. Pressionada, fica com 93 %.

### Visual
- **Pílula solta (vidro):** `linear-gradient(rgba(255,255,255,.07), rgba(255,255,255,.02))` sobre `rgba(11,13,19,.62)`, borda de 1 px a 11 %, sombra `0 18px 44px -16px rgba(0,0,0,.7)` + brilho interno no topo a 8 %, raio 28. Ela **abre a partir da marca** com `clip-path: inset(0 calc(100% − 52px) 0 0 round 28px)` → `inset(0)`. Com foco, a borda fica laranja a 38 %.
- **Forma presa:** `rgba(8,9,13,.88)`. **Painel grande solto:** `rgba(9,10,15,.87)` com reflexo de 5 % no topo e raio 30.
- **Pensando:** um brilho laranja → pêssego → lilás percorre a borda da pílula ou da ilha (`conic-gradient` girando em 1,8 s, recortado com máscara `xor` num anel de 1,3 px), com uma cópia desfocada a 7 px por baixo. O texto da resposta faz shimmer.
- **Conversa:** a resposta é texto solto com sombra forte (`0 1px 2px rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.55)`), sem balão. Só a fala do usuário tem balão (`rgba(38,40,52,.82)`, raio 17/17/5/17, a ponta do lado da marca). A rolagem some nas pontas com uma máscara de 56 px. Na barra de baixo, cada mensagem vira um **cartão** (`rgba(9,10,15,.88)`, raio 18).
- **Penumbra de leitura** (solta): `radial-gradient(closest-side, rgba(4,5,9,.58), rgba(4,5,9,.38) 55%, transparente)`, que chega a zero antes das bordas da janela.
- Cor de marca: Claude `#d97757` e `#f0a98a`; fontes Space Grotesk e Inter. Ícones das sugestões com traço de 1,9 px em `#f0a98a`.
- Atalho global `Alt + Shift + Espaço` abre e fecha; ele também é o que a Órbita aciona ao clicar no orbe.
