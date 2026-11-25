# Esticar na direção do arrasto (o "sentir" de cada app)

> L1 · motion. Índice: [motion](README.md). O motor que entrega esses valores: [referencias/motor](../../referencias/motor/README.md).

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

O Eco ainda **inclina pra borda que está perto** durante o arrasto ([sensor de borda](sensor-de-borda-e-encaixe.md)): a marca anda até 7 px na horizontal ou 6 px na vertical na direção dela e achata 6 a 8 %. Em repouso solta, ela flutua (`translateY` de 4 px em 6 s, `ease-in-out`).
