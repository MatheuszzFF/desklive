# Molas no JS (constantes reais)

> L3 · referência. Conceito e fórmula: [padroes/motion](../../padroes/motion/README.md). Mudou uma constante no código? Atualize aqui e anote no [CHANGELOG](../../CHANGELOG.md).

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
