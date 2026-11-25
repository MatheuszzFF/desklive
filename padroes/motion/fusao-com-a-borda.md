# Fusão com a borda: ombros côncavos e o descolar líquido

> L1 · motion. Índice: [motion](README.md). As molas citadas estão em [referencias/motion/molas.md](../../referencias/motion/molas.md).

## Ombros côncavos: fundir a forma à borda da tela

A ideia: quando o app encosta numa borda, ele deixa de ser um objeto solto e vira parte da tela. A forma vai até a beirada (a janela está rente à tela nesse lado). As quinas que encostam ficam retas, e nas pontas, ao longo da borda, uma curva **invertida** (côncava) liga a forma à borda, como se a tela escorresse nela. Cada app desenha isso de um jeito, e os três funcionam.

### Órbita: um path SVG gerado a cada quadro
- É um `<svg>` atrás da barra, com um `<path>` recalculado enquanto algo se mexe.
- Cada canto do retângulo é **uma curva só**, que varia continuamente entre três estados:
  1. **convexo** (canto solto e arredondado, raio `R = 22 × escala`, limitado à metade do lado);
  2. **ombro côncavo** (um dos dois lados está colado: a curva se abre ao longo da borda com largura `S = 18 × escala`);
  3. **reto** (os dois lados colados: é a quina da tela).
- Cada lado tem um fator de cola `a ∈ [0,1]`, que vem de uma mola mole (k 170, ζ 0,7). Pra um canto entre o lado horizontal `aH` e o vertical `aV`:
  ```
  conv = R·(1−aH)·(1−aV)
  offA = conv − S·aH·(1−aV) + S·(1−aH)·aV      (ao longo do lado horizontal)
  offB = conv + S·aH·(1−aV) − S·(1−aH)·aV      (ao longo do lado vertical)
  ```
  A curva é uma Bézier cúbica com o fator de círculo `K = 0,5523`.
- **Quando cola:** `a = smoothstep(1 − (gap − G) / 16)`, com `G = 12 px`. Ou seja, a fusão acontece nos **últimos 16 px** antes de encostar, que é quando a beirada da janela coincide com a da tela. O resto do movimento fica por conta da mola mole.
- O lado colado estica até a beirada da janela, mas **no máximo 30 px × escala**. Assim, enquanto a janela está maior no meio de uma troca, a forma não estica até longe.
- A forma abraça os itens **onde eles estão agora** (com as animações FLIP em voo), e não onde vão parar. Por isso ela escorre junto com os ícones.
- Material: degradê `#17181e → #0c0d11` com a luz vindo do lado de dentro da tela (a direção do gradiente gira conforme o lado), traço `rgba(255,255,255,.07)`, borda interna `rgba(255,255,255,.10)` que some em 35 %, `drop-shadow(0 10px 20px rgba(0,0,0,.42))` + `drop-shadow(0 1px 2px rgba(0,0,0,.35))`. Perto de encaixar, o traço acende em `rgba(169,184,255,.38)`.

### Onda: canvas 2D atrás do player
- O corpo é a caixa do conteúdo com folga `P = 14 px`, raio `Rc = 20 px` e ombros `SM = 24 px`, todos multiplicados pelo fator de fusão daquele lado.
- Os ombros são `quadraticCurveTo` com o ponto de controle na quina, e os cantos soltos são `arcTo`.
- **No canto** a forma muda: é um **quarto de disco** com centro no canto da tela, raio igual ao do arco da onda e ombros nas duas pontas. O ombro ocupa um ângulo `a1 = min(.35, S / Rd)` e o arco é desenhado com 48 segmentos.
- Preenchimento `rgba(16,17,21,.96) → rgba(11,12,15,.96)` (multiplicado pela fusão), sombra de blur 28 px deslocada 8 px pra dentro da tela (−6 px quando está embaixo) e traço `rgba(255,255,255,.075)`.
- Uma alça de 30 × 4 px, a `rgba(255,255,255,.22)`, fica no meio do lado de dentro (só numa borda, não no canto).
- A área do corpo vira um `div` invisível que pega o mouse, então dá pra arrastar pelo corpo.

### Eco: CSS puro (`border-radius` + dois quadradinhos com máscara radial)
- A forma (`.isle`) é um `div` com os quatro raios independentes (`--r1..--r4`). Quina encostada = 0, quina solta = o raio do estado (19 a 32 px).
- Os ombros são dois `span.shd` de **16 × 16 px** (`SHD = 16`), com
  `radial-gradient(circle at <quina>, transparent 15.4px, rgba(8,9,13,.88) 16px)`.
  Isso dá um quadrado cheio com um quarto de círculo recortado: é exatamente a curva côncava. Ficam encostados nas pontas da forma, ao longo da borda.
- Eles nascem com `scale: 0 → 1` (transform-origin na quina de dentro), em `--spd2` com 0,07 s de atraso. Primeiro a forma chega, depois os ombros "escorrem".
- Material da forma: `rgba(8,9,13,.88)`, `box-shadow: 0 12px 34px -18px rgba(0,0,0,.9), inset 0 0 0 1px rgba(255,255,255,.055)`.

## O descolar líquido ("pescoço líquido")

A fusão não é liga/desliga. Afastando da borda, a forma estica, afina e solta, como uma gota.

- **Onda (o pescoço de verdade):** a até `NECK = 60 px` da borda, o corpo ainda se liga a ela.
  - Alvo da fusão: `f = clamp(1 − (gap − G) / NECK, 0, 1)`, com `G = 16`.
  - Encostada numa borda só e com `f < 0,97`, em vez do corpo fundido, desenha-se um **pescoço**: uma faixa que sai da borda até o corpo. A largura dela é
    `nw = max(5, min(metade − Rc − k, metade × (0,18 + 0,82·f)))`,
    com ombros `S = 24·f` na borda e um filete côncavo `k = min(14, distância − 1)` onde o pescoço encontra o corpo.
  - Opacidade do corpo: `fm = min(1, max(f) × 1,8)`, que continua sólida até perto de soltar e só aí desaparece.
  - Enquanto o pescoço existe, a janela continua indo até a beirada da tela daquele lado (até `G + NECK`), senão não teria onde desenhar.
- **Eco (gota):** ao começar a arrastar uma forma presa, ela vira na hora uma **gota de 48 px** (raio 24) centrada atrás da marca, e os ombros encolhem pra 0. A janela já encolheu pra 112 × 112. Ao encaixar, é o contrário: a forma nasce como um **círculo de 44 px na marca** (sem ombros), e dois quadros depois recebe a geometria final. O CSS anima da gota até a forma fundida.
- **Órbita:** a cola de cada lado segue a distância até a borda com a mola mole (k 170, ζ 0,7), então os ombros se formam e recolhem com um pequeno balanço. Ao encolher, a ilha usa a mola do retângulo (k 300), devagar como líquido. Ao crescer, usa k 2600 (na hora).
