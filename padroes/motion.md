# Linguagem de motion

Como a Órbita, a Onda e o Eco se mexem: as molas, as curvas, os tempos, a fusão com a borda, o descolar líquido, o esticar no arrasto, o sensor de borda e a troca de forma sem a janela tremer. Os números saem do código atual. Serve pra recriar o mesmo nível em qualquer app novo. Não é pra copiar a interface de um app no outro: cada app tem forma e interação próprias (R20).

> Leia junto: [layout-posicao-e-tamanho.md](layout-posicao-e-tamanho.md) (o que cada app precisa ter) e [design.md](design.md) (o visual). Aqui fica o **como**.

## 1. Princípios

1. **Mola de verdade, não duração fixa.** Tudo que anda no JS é um oscilador massa-mola (massa 1) integrado a cada quadro. No CSS, a curva `linear()` é a resposta dessa mesma mola, amostrada (seção 3).
2. **Um laço por quadro (`requestAnimationFrame`)**, com `dt` limitado a 1/30 s (a Onda usa 1/20 s). Com isso, um quadro atrasado não gera um salto. A integração é Euler semi-implícito, com 3 ou 4 subpassos por quadro.
3. **O alvo muda e a mola só persegue.** Trocar de lado, de degrau ou de estado mexe só nos alvos. Nada é "cancelado e reiniciado", e uma animação no meio do caminho continua de onde estava.
4. **Parou, desliga.** Cada laço se desliga quando posição e velocidade ficam abaixo de um limiar. Nada fica rodando em repouso, a não ser o que é vivo de propósito: a onda e a marca do Eco.
5. **Crescer na hora, encolher depois.** Isso vale pra janela, pra ilha da Órbita e pra caixa da Onda (seção 10).

Fórmula comum (todos os apps):

```
a = k·(alvo − x) − c·v      c = 2·√k·ζ      (ζ = razão de amortecimento)
v += a·h ;  x += v·h        h = dt / n_subpassos
```

## 2. Molas no JS (constantes reais)

| Onde | k | ζ | Subpassos | Observação |
|---|---|---|---|---|
| Motor: arrasto (persegue o mouse) | 1500 | 1,0 | 4 | crítica + *feed-forward* da velocidade do mouse |
| Motor: assentar (padrão) | 210 | 0,86 | 4 | quase sem quique |
| Motor: assentar no **Eco** | 230 | 0,80 | 4 | sobrescrito via `springs:{ settle }` |
| Motor: encaixe firme numa borda | 240 | 1,0 | 4 | sem passar do ponto |
| Motor: deslize suave (menu, "centralizar") | 130 | 1,0 | 4 | |
| Motor: "levantar" ao pegar (0→1) | 520 | 0,9 | 1 | vira `--grab` |
| Motor: micro-amassado ao bater | 900 | 0,45 | 1 | oscila e some |
| Órbita: retângulo da ilha | 300 | 0,86 | 3 | |
| Órbita: ilha **crescendo** | 2600 | 1,0 | 3 | praticamente na hora (nenhum ícone sai da ilha) |
| Órbita: "colado" de cada lado (ombros) | 170 | 0,70 | 3 | mais mole, pra parecer líquido |
| Onda: posição e tamanho de cada peça | 300 | 0,78 | 3 | x, y, w, h, raio |
| Onda: opacidade de cada peça | 520 | 0,95 | 3 | |
| Onda: fusão com a borda ("fuse") | 150 | 0,74 | 3 | "um tiquinho de balanço, sem quicar" |
| Eco: deslocamento do `.rig` | 260 | 0,86 | 4 | devolve a marca ao lugar depois de um reframe |

Critérios de parada: o motor para com menos de 0,35 px do alvo e velocidade abaixo de 6 px/s. As peças da Onda param com ε = 0,05 (opacidade: 0,002). A ilha da Órbita desliga depois de 20 quadros calmos, e um `setInterval` de 700 ms dá um "chute" de garantia caso algo mude sem avisar.

## 3. Curvas e durações no CSS

### Molas como `linear()`
Cada app simula a mola uma vez no boot e escreve a curva numa variável CSS. Quando `CSS.supports('transition-timing-function','linear(0, 1)')` falha, entra um `cubic-bezier` de reserva.

| App / variável | Mola | Duração resultante | Overshoot | Reserva |
|---|---|---|---|---|
| Órbita `MORPH` (FLIP da troca de lado) | k 210, ζ 0,8 (passo 1/120, ~44 pontos) | ≈ 567 ms | ≈ 0,7 % | `cubic-bezier(.2,.9,.25,1.08)` 560 ms |
| Órbita `--springy` (leque, pílulas, medidores) | k 240, ζ 0,74 | ≈ 542 ms | ≈ 2 % | `cubic-bezier(.2,.9,.25,1.1)` |
| Eco `--sp` / `--spd` (forma, pílula, conversa) | ζ 0,8, ω 14 (k 196; passo 1/600, 48 pontos) | ≈ 0,61 s | ≈ 1,4 % | `cubic-bezier(.2,.9,.25,1.12)` .7 s |
| Eco `--sp2` / `--spd2` (ombros, prévia, chips) | ζ 0,92, ω 17 (k 289) | ≈ 0,43 s | ~0 | `cubic-bezier(.2,.8,.2,1)` .6 s |

A duração é o tempo até a mola ficar a menos de 0,0015 do fim e com velocidade abaixo de 0,02. Assim, a transição CSS termina exatamente quando a mola assenta.

### Curvas fixas (as mesmas nos três apps)
- `--ease: cubic-bezier(.2,.8,.2,1)`: saída suave, usada em fades, balões e texto.
- `--spring: cubic-bezier(.2,.9,.25,1.12)`: um pouco de quique pra micro-interações (hover de ícone, botão, alça).

### Durações de referência
| O quê | Duração |
|---|---|
| Balão (tooltip) aparecer | opacidade .15 s, deslocamento .2 s (4 px) |
| Hover de ícone (sobe 5 px, escala 1,12) | .28 s `--spring` |
| Pulo ao abrir app (`hop`) | .55 s, sobe 10 px, escala 1,06 |
| Anel de CPU/RAM mudar de valor | .7 s `--ease`; ao nascer, se desenha em .8 s (os concêntricos do canto, 1,1 s) |
| Texto que surge num degrau maior (`fadein`) | .45 s com .12 s de atraso, de `blur(3px)` a nítido |
| Troca de música (título, artista, álbum) | .55 s, sobe 7 px com blur de 3 px; atrasos de 0, .05 e .1 s |
| Mensagem nova do Eco (`rise`) | .4 s, 10 px (na metade de cima da tela, `drop`: desce 10 px) |
| Capa nova | fade .6 s + escala 1,06 → 1 em .9 s |
| Texto "pensando" (shimmer) | gradiente correndo em 1,4 s; anel cônico girando em 1,8 s |

## 4. Entradas em sequência (stagger)

Nada aparece tudo de uma vez. Primeiro vem a forma, depois o campo, depois a conversa e, por fim, os detalhes.

- **Órbita, troca de lado (FLIP):** os itens partem um depois do outro, com atraso `min(160 ms, i × 14 ms)`. Um item novo entra crescendo de `scale(.6)` com 60 ms de atraso.
- **Órbita, leque do canto:** ao abrir, cada app atrasa `i × 24 ms`. Ao fechar, a ordem inverte: `(n−1−i) × 14 ms`, e o último que saiu é o primeiro a voltar.
- **Onda, abrindo um degrau:** ordem `cover → arc → meta → bars → mctrls → ctrls → wave → list → vt → vwave → prog`, com uma peça a cada 55 ms, dentro de uma janela de 600 ms. Enquanto não chega a vez dela, a peça fica com opacidade-alvo 0.
- **Onda, lista da fila:** cada linha entra com `--i × 35 ms`.
- **Eco, painel preso a uma borda:** campo com .2 s (opacidade) e .1 s (escala); conversa com .28 s e .12 s; coluna lateral com .34 s e .2 s; itens do histórico com `.38 s + i × .045 s`; ombros com .07 s depois da forma; sugestões do canto com `i × .05 s`; cartões da barra de baixo com 0, .05 e .1 s. Os chips de sugestão na pílula solta entram com 0, .06 e .12 s.

## 5. Ombros côncavos: fundir a forma à borda da tela

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

## 6. O descolar líquido ("pescoço líquido")

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

## 7. Esticar na direção do arrasto (o "sentir" de cada app)

O motor entrega a cada quadro a velocidade `vx, vy`, a `speed`, o `lift` (0..1) e o `bump` (amassado, com a normal da borda). Cada app traduz isso do seu jeito, em variáveis CSS:

| | Órbita | Onda | Eco (a marca) |
|---|---|---|---|
| Inclinação | `clamp(vx·0,0017, ±3°)`, aplicada × 0,35 | `clamp(vx·0,0015, ±2,5°)` | — |
| Esticar | por eixo: `min(1, |v|/2600) × 5 %`; o outro eixo afina metade | na direção do movimento: `min(6 %, speed/30000)`; a perpendicular afina metade | na direção do movimento: `min(17 %, speed/7000)`; a perpendicular afina 55 % |
| Suavização | `dt × 12` (inclinação `dt × 14`) | `dt × 9` (inclinação `dt × 14`) | `dt × 12` |
| Levantar ao pegar | +2 % de escala, sombra cresce até 11 px / alfa .3 | escala 1,03 (`@property --lf`, .5 s), sombra 5 px / 10 px / .38 | `--press 1.04`, sombra 3 px / 5 px / .32 |
| Bater na borda | amassa 6 % contra a normal, alarga 3 % no outro eixo | amassa 5 % contra a normal | amassa 12 % contra a normal |

Esticar numa direção arbitrária com CSS (Onda e Eco), girando o sistema, escalando e desgirando:
```
transform: rotate(var(--sa)) scale(1 + s, 1 − s·k) rotate(calc(var(--sa) * -1))
```
O ângulo `--sa = atan2(vy, vx)` só é atualizado acima de 40 a 60 px/s, pra não girar à toa quando quase parado.

O micro-amassado vem do motor: ao assentar numa borda com `land`, a força é `min(1, velocidade_de_chegada / 1800)`. Abaixo de 0,08 é ignorado; acima disso, entra como impulso (`bumpV += força × 9`) na mola k 900 / ζ 0,45.

O Eco ainda **inclina pra borda que está perto** durante o arrasto (seção 8): a marca anda até 7 px na horizontal ou 6 px na vertical na direção dela e achata 6 a 8 %. Em repouso solta, ela flutua (`translateY` de 4 px em 6 s, `ease-in-out`).

## 8. Sensor de borda, ímã e encaixe

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

## 9. Como uma forma vira a outra ao trocar de lado

Cada app resolve a troca de um jeito diferente, de acordo com o que ele é:

- **Órbita: FLIP com Web Animations.** Mede onde cada item está (`getBoundingClientRect`), troca as classes de lado com `.nomotion` ligada (sem transições), mede de novo e anima cada item do lugar antigo pro novo com `el.animate([{transform:translate(dx,dy)}, {transform:none}])` na curva `MORPH`.
  - Quando a largura ou a altura de um item muda mais de 10 px, o delta é medido **pelo lado da borda**, e não pelo centro: o ícone fica no lugar e o resto cresce pra dentro.
  - Durante o arrasto, o item que você segura continua embaixo do mouse: a diferença vira `regrab`, e a mola leva a janela até lá.
  - Fora do arrasto (`jump`), a janela pula na hora pra compensar.
  - A ilha é deslocada pelo mesmo tanto (`island.shift`) e escorre até o formato novo.
- **Onda: tudo é mola.** Não existe FLIP. Cada peça (capa, texto, controles, onda, barras, arco, lista, progresso) tem x, y, largura, altura, opacidade e raio, cada um numa mola que persegue o alvo da tabela de arranjos.
  - Os arranjos são medidos com a capa compacta em (0, 0) e a borda em cima e à esquerda. Os outros lados são espelhos: `x' = 64 − (x + w)` e `y' = 64 − (y + h)`.
  - Trocar de lado só muda os alvos.
  - Quando a capa troca de lado, o texto apaga por 160 ms enquanto atravessa. O alinhamento troca quando a opacidade fica abaixo de 0,05 (ou 260 ms depois), e o texto reaparece já do outro lado.
- **Eco: variáveis CSS na mesma mola.** O JS calcula a geometria inteira de cada lado e estado (retângulo, quatro raios, ombros, campo, conversa, coluna, alça, sugestões) e escreve tudo em variáveis (`--px --py --pw --ph --r1..4 --qx --kx --dx --ux --gx`…). Todas transicionam em `--spd`/`--sp`, então a forma inteira anda junta. Pra trocar a janela no meio de uma animação, `rebaseDock` fotografa os valores **computados** de agora, reescreve tudo relativo à janela nova com `.instant` (sem transição) e deixa a animação continuar dali.

## 10. Redimensionar a janela sem tremer

O problema: o host prende a janela dentro da tela e cada `setBounds` é assíncrono. Se a janela muda de tamanho e o CSS muda em quadros diferentes, o conteúdo pisca fora do lugar. As regras:

1. **A janela tem só o tamanho do conteúdo**, com a margem do brilho do lado de dentro e só a folga `G` do lado da borda (Órbita: `PADS` de 50 a 62 px por dentro, 196 px no lado de dentro da coluna pros balões; Onda: `MARGIN = 48`; Eco: `MARGIN = 36`).
2. **Crescer antes, encolher depois.**
   - Órbita: durante o morph, a janela é a **união** do layout antigo com o novo, e só volta ao tamanho do conteúdo quando nada voa nem é arrastado, `MORPH.duration + 40 ms` depois.
   - Onda: cada lado da caixa cresce na hora. Encolher espera 250 ms de calma. Perto de uma borda, o lado é sempre exato.
   - Eco: a janela vira a união atual ∪ nova antes da animação e encolhe `--spd × 1000 + 420 ms` depois.
3. **Commit atômico (motor):** tamanho novo + quanto a janela anda + o CSS que muda viram um "commit". O CSS só é aplicado quando chega o evento `resize` com `innerWidth/innerHeight` iguais ao tamanho pedido (±1 px). Se o evento não vier, aplica depois de 160 ms. Commits seguidos se juntam: os deslocamentos somam e vale o tamanho mais novo.
4. **No máximo um `setBounds` por quadro, nunca dois ao mesmo tempo.** Se o anterior não voltou, vale só o mais novo (nada de fila atrasada).
5. **Posição lógica em ponto flutuante.** Só é arredondada na hora de enviar, então nunca acumula erro de meio pixel. A Órbita arredonda as margens e passa o resto pro deslocamento.
6. **O conteúdo andou dentro da janela? A janela anda o contrário**, no mesmo commit (`shift`). No Eco, o `.rig` recebe o deslocamento e volta a zero numa mola (k 260): a marca nunca pula.
7. **Arrastando, a janela nunca passa da área das telas** (`screenClamp`), do mesmo jeito que o Windows faz. Assim não existe "zona morta" quando o mouse volta.

## 11. Brilho e sombra sempre dentro da janela

O Windows corta em linha reta tudo que passa da janela (R4). Por isso:
- Os canvas da onda, das barras e do arco têm **12 px de folga** em volta, pro `shadowBlur` de 8 a 12 px não ser cortado.
- O halo da capa da Onda tem 80 % do tamanho dela, desce 15 % e usa `blur(14px)` (18 px nos degraus grandes). Ele cabe na margem de 48 px.
- A penumbra de leitura do Eco é um `radial-gradient(closest-side, …, rgba(4,5,9,0))`, que chega a zero antes de bater em qualquer borda da janela.
- As sombras de "levantar" crescem com `--grab`, mas os tamanhos máximos (5 a 11 px) cabem na margem.
- Os balões da Órbita são empurrados pra ficar a pelo menos 6 px da beirada da janela (`fitTip`).
- **Truque da transparência:** no modo app, `color-scheme: light` de propósito. Um esquema diferente do da janela faz o Chromium pintar um fundo opaco.

## 12. Movimento reduzido

`prefers-reduced-motion: reduce` é respeitado nos três apps:
- **Motor:** `glide` vira `set` (vai direto), o arrasto segue o mouse sem mola e não há levantar, amassado nem inclinação.
- **CSS:** transições com `0s` e `animation: none` no conteúdo de cada app.
- **Onda:** as molas das peças pulam direto pro alvo, a fase da onda congela, a capa não pulsa e a fusão com a borda é imediata.
- **Eco:** o deslocamento do `.rig` é zerado na hora, e a marca WebGL continua viva, mas a 15 % da velocidade.

## 13. Motor de movimento da janela (`motor.js`), em revisão

> **Em revisão:** outra sessão está refatorando o motor neste momento. Isto descreve o que existe em 25/11/2026 (motor v2) e pode mudar.

Um motor só, igual nos três apps, injetado no lugar do marcador `/*MOTOR*/` na hora de montar cada app. Ele cuida de três coisas:
- **Física:** as molas da seção 2. Arrastando, a janela persegue o mouse numa mola crítica (k 1500) com *feed-forward*: a velocidade do mouse entra no termo de amortecimento (`c·(v_mouse − v)`), então em velocidade constante não há atraso. O *feed-forward* é suavizado (fator 0,5) e decai com τ = 50 ms quando o mouse para.
- **Velocidade ao soltar:** regressão linear nos últimos 80 ms de amostras, usando `getCoalescedEvents()`. Se a última amostra tem mais de 60 ms, não há embalo; se a janela de amostras é menor que 12 ms, a leitura é descartada; o máximo é 6000 px/s. Ao soltar, a velocidade é limitada a 3200 px/s, e abaixo de 120 px/s vira 0 ("só assenta"). O destino é onde a janela pararia com atrito exponencial: `x + v·τ`, com τ = 0,14 s. O embalo só vale na direção do destino e nunca passa de `distância / 0,13`, pra mola não passar do ponto e voltar.
- **Gesto:** uma máquina de estados (parado → pressionado → arrastando → soltando → assentando). O fim é garantido por `pointerup`, `pointercancel`, `buttons === 0`, perda de foco, aba escondida, novo `pointerdown`, `mouseup` de reserva e o *watchdog*. Se a captura do ponteiro se perde, ela é recapturada pela raiz.

Cada app pluga no motor o seu `frame`/`unframe` (como a posição lógica vira a janela real; a Onda usa a âncora da capa + caixa `LR`) e o seu `feel` (seção 7).

Versão anterior (`mover.js`, v1, referência histórica): arrasto k 900 / ζ 0,95, assentar k 210 / ζ 0,86, suave k 150 / ζ 1, ímã de 40 px, velocidade pelas pontas dos últimos 90 ms, sem embalo abaixo de 140 px/s e τ de atrito 0,13 s.

## 14. Checklist pra um app novo

- [ ] Forma e interação **próprias** em cada lado, canto e degrau (R20), fundida à borda com ombros côncavos e descolando como líquido.
- [ ] Molas reais no JS (subpassos, `dt` limitado) e curvas `linear()` geradas da mesma mola no CSS, com `cubic-bezier` de reserva.
- [ ] Sensor de borda com histerese e emenda entre monitores ignorada; prévia do encaixe durante o arrasto.
- [ ] `feel` próprio: inclinar, esticar na direção do movimento, levantar ao pegar, amassar ao bater.
- [ ] Janela do tamanho do conteúdo, crescendo antes e encolhendo depois; CSS aplicado no `resize`; um `setBounds` por quadro.
- [ ] Brilhos e sombras dentro da janela, com folga medida.
- [ ] Stagger nas entradas; nada aparece de uma vez nem some seco.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Prints de cada lado e canto, em repouso, com hover e aberto, antes de publicar (R10).
