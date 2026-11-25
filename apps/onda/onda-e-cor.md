# Onda — a onda que reage ao som e a cor da capa

> **O que é:** a referência L3 das fórmulas da Onda. **Quando ler:** pra mexer na onda, nas barras, no arco ou na cor tirada da capa. Visão geral do app: [README.md](README.md).

## A onda (barra de tempo que reage ao som)
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

## Cor tirada da capa
1. Desenha a capa num canvas de **32 × 32** e lê os pixels.
2. Dá uma nota pra cada pixel: `saturação × (0,35 + brilho/255)`, que favorece cor viva e clara.
3. A primeira cor é a de nota mais alta. A segunda é a melhor com **matiz a mais de 40°** da primeira e saturação acima de 0,18; se não houver, o pixel no percentil 15.
4. "Levanta" cada cor: escala até o canal mais forte valer 235 e mistura 80 % com 20 % de branco. Capa cinza (saturação < 0,12) cai num lilás neutro `#c9d2ff`.
5. Vira `--c1`/`--c2` (padrão `#a9b8ff` e `#9fffc4`) e pinta a onda, as barras, o arco, o progresso e o halo.
