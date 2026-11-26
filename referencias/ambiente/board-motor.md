# Board: o motor de motion

> L3 · referência. Índice: [ambiente](README.md) · peças em [board-pecas](board-pecas.md). **O que é:** o laço central do Board v1 (canais, molas por estado, passo fixo, entrada, ganchos, afinação) e os números do simulador. **Quando ler:** antes de afinar qualquer movimento dentro do Board.

## Canais e molas

- **Canais por peça (15):** `x y w h` · `s` escala · `rot` · `o` opacidade · `r0..r3` raios · `sx sy kx` deformação simétrica `[[sx,kx],[kx,sy]]` · `f` fusão (ombros).
- **Física:** passo fixo de **240 Hz** com subpassos (até 30 por quadro), render **interpolado** entre os dois últimos passos: igual a 60, 120 ou 144 Hz. Câmera lenta global 0,1–1×.
- **Mola por canal e por estado:** `PERFIS[estado][grupo] = nome`, grupos `pos tam escala rot opac raio deform fusao`. Estados: `arrastando`, `soltando`, `encaixando`, `trocando`, `assentado`. `k = 0` = **direto** (segue na hora, subpixel).

| Mola | k | ζ | Onde |
|---|---|---|---|
| direto | 0 | — | posição arrastando (padrão) |
| cola | 1600 | 1 | posição arrastando (opção, um fio de atraso) |
| encaixe | 320 | 0,78 | soltar num alvo (posição e tamanho) |
| assentar | 240 | 0,9 | soltar solto, com o embalo (0,16 s da velocidade) |
| forma | 300 | 0,8 | troca de forma ou degrau |
| raio | 380 | 0,92 | raios e fusão |
| levantar | 520 | 0,62 | escala 1,012 e inclinação (0,0005°·px/s, máx. 2,2°) |
| deforma | 700 | 0,5 | estica na direção da velocidade (1/40000 por px/s, máx. 3,5 %) |
| surgir | 200 | 0,95 | opacidade, entrar e sair |

- **CSS nunca move peça:** posição, tamanho e forma são só do motor (`matrix(...)` com 3 casas, sem arredondar; opacidade; o recorte). CSS fica com o cosmético de dentro (crossfade das vistas, ping do sonar).
- **Zero alocação nossa por quadro:** canais em `Float64Array`, alvo do ímã e limites em objetos reaproveitados, estilos só escritos quando mudam.
- **Dorme parado:** sem nada se mexendo, o laço para (sem rAF); acorda com entrada, mola ou animação. `will-change` só nas peças em movimento, sai 300 ms depois de assentar.

## Entrada e ponto pego

- `pointerrawupdate` quando existe, senão `pointermove` + `getCoalescedEvents()`; anel de 128 amostras com o `timeStamp` do evento.
- **Velocidade:** regressão linear das amostras dos últimos 64 ms; aceleração suavizada. **Previsão** de 1 quadro (`v × dt`), máx. 32 px, some em 60 ms sem amostra nova.
- **Ponto pego em pixels:** migra do ponto original pro ponto mapeado junto com o tamanho (nunca empurra a peça pra fora da tela); a escala, a inclinação e a deformação giram nele.
- **Ímã:** `k = 0,5 · smoothstep(1 − d/zona)`, suavizado a 14/s, puxando o lado da peça pro lado do alvo. Zonas: borda 72, canto 120 (ganha da borda: pontuação `d·0,35 − 30`), degrau 100, emenda 44 e canto da emenda 60, **só abaixo de 260 px/s**.

## Ganchos e afinação

- **Fases** (`Board.on` ou `onFase`): `pegou`, `arrastando` (todo quadro), `perto` (alvo novo), `encaixou`, `soltou`, `assentou`, `trocouForma`, `adotada`.
- **Camadas somadas:** `ctx.camada(nome, fn(t, P, soma))` soma deltas por canal sem brigar com a física; `ctx.animar(fn)` mantém o laço acordado. `Board.entrada` dá velocidade e aceleração.
- **Afinação** (Ctrl+Alt+Shift+B, menu ou botão da Sonda): sliders de cada mola, câmera lenta, prever, levantar, inclinar, esticar; overlay de vetores, alvos e formas; **registro** por quadro em `~/.orbita/board-trace.json` (até 30 s: posição, alvo, velocidade, erro do ponto pego, ímã, forma, fases e amostras de entrada).

## Números (simulador, 25/11/2026)

Dois Boards em iframes, monitor 1 1920 × 1032 úteis + monitor 2 1707 × 912 (2560 × 1440 a 1,5), 200 px mais alto; relógio por `setTimeout(16)` (aba encoberta), disco imitado em memória. **(sim)**: nada aqui substitui o app instalado.

| Medida | Resultado |
|---|---|
| erro do ponto pego (fora do ímã e da parede) | **0 px** em 5 arrastos (n 45–68 quadros cada) |
| tremida com o mouse parado no arrasto | 0 / 0,0002 px em 60 quadros |
| entrada → quadro que a desenha | p50 16,7 ms (é o relógio do simulador; no host, evento → rAF) |
| JS do laço, 5 peças (arrasto + onda + WebGL + órbita) | p50 0,1 · p95 0,2–0,3 · máx. 0,4–1,2 ms |
| parado | o laço dorme: 0 quadros em 1,5 s |
| emenda: devagar (~190 px/s) / rápido (~2400 px/s) | gruda (forma `right`) / atravessa, adotada 51 ms depois de soltar |
| barramento (memória) | p50 14 ms, p95 18 |
| área visível somada nos dois Boards ao cruzar | nunca abaixo de 100 % (122 amostras); rasgo entre as cópias 22–41 px |
| monitor 2 some | a Sonda passa pro Board 1 em 1,3–2,8 s, o Board 2 se esconde, 1 cópia |
| cliques fora das peças | 3/3 na área de trabalho, 0 eventos no Board |
| cliques em cada parte da Sonda | 8/8 no alvo certo |

**Falta medir no app instalado:** CPU e GPU parado e animando (seção 5 da Sonda), o rAF de verdade, a latência do disco no passe, `pointerrawupdate` no host, DPI 1,5 real (os iframes do simulador têm o mesmo dpr) e o vídeo quadro a quadro (R25).
