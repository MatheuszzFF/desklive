# Curvas e durações no CSS

> L3 · referência. Conceito: [padroes/motion](../../padroes/motion/README.md). As molas de origem: [molas.md](molas.md).

## Molas como `linear()`
Cada app simula a mola uma vez no boot e escreve a curva numa variável CSS. Quando `CSS.supports('transition-timing-function','linear(0, 1)')` falha, entra um `cubic-bezier` de reserva.

| App / variável | Mola | Duração resultante | Overshoot | Reserva |
|---|---|---|---|---|
| Órbita `MORPH` (FLIP da troca de lado) | k 210, ζ 0,8 (passo 1/120, ~44 pontos) | ≈ 567 ms | ≈ 0,7 % | `cubic-bezier(.2,.9,.25,1.08)` 560 ms |
| Órbita `--springy` (leque, pílulas, medidores) | k 240, ζ 0,74 | ≈ 542 ms | ≈ 2 % | `cubic-bezier(.2,.9,.25,1.1)` |
| Eco `--sp` / `--spd` (forma, pílula, conversa) | ζ 0,8, ω 14 (k 196; passo 1/600, 48 pontos) | ≈ 0,61 s | ≈ 1,4 % | `cubic-bezier(.2,.9,.25,1.12)` .7 s |
| Eco `--sp2` / `--spd2` (ombros, prévia, chips) | ζ 0,92, ω 17 (k 289) | ≈ 0,43 s | ~0 | `cubic-bezier(.2,.8,.2,1)` .6 s |

A duração é o tempo até a mola ficar a menos de 0,0015 do fim e com velocidade abaixo de 0,02. Assim, a transição CSS termina exatamente quando a mola assenta.

## Curvas fixas (as mesmas nos três apps)
- `--ease: cubic-bezier(.2,.8,.2,1)`: saída suave, usada em fades, balões e texto.
- `--spring: cubic-bezier(.2,.9,.25,1.12)`: um pouco de quique pra micro-interações (hover de ícone, botão, alça).

## Durações de referência
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
