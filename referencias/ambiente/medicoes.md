# Medições no app instalado

> L3 · referência. **O que é:** os números medidos no host de verdade (sonda, gravações, vídeo), que confirmam ou corrigem o que a pesquisa deduziu lendo código. **Quando ler:** antes de decidir qualquer coisa de movimento, tamanho ou hover. Estes números valem mais que os marcados **(inferido)** nos outros arquivos. Como medir de novo: [como medir](como-medir.md). Depois de medir, atualize aqui e anote no [diário](../../diario/README.md).

## Rodada da sonda — 25/11/2026, 20:42

O PC de teste: dois monitores de 1920 × 1080 lado a lado, escala 1 (`devicePixelRatio` 1), área útil igual à tela (barra de tarefas oculta), monitor principal de 60 Hz, movimento reduzido desligado. Host com Electron 45.3.3 e Chromium 156. A sonda tinha 440 × 600, sempre no topo e transparente, no **segundo** monitor (x = 2782, y = 101), com `overlay` e `full-access`.

| Medida | n | p50 | p95 | máx | Leitura |
|---|---|---|---|---|---|
| rAF parado | 180 | 16,7 ms | 16,9 | 18,7 | 59,9 fps, 0 % dos quadros acima de 20 ms |
| rAF com a janela andando | 150 | 16,7 ms | 16,9 | 17,0 | mover a janela não derruba os quadros |
| IPC vazio (`os.platform`) | 40 | 0,2 ms | 0,3 | 0,6 | ida e volta ao processo principal quase de graça |
| `getCursorScreenPoint` | 20 | 0,2 ms | 0,3 | 0,9 | dá pra ler o cursor real a cada quadro |
| `setBounds` (só mover), 1 por vez | 30 | 1,2 ms | 2,4 | 3,5 | `window.screenX` já mudou quando a promessa volta; `getBounds` confere 3/3 |
| `setBounds` 1 por quadro (rajada de 2,5 s) | 151 | 3,8 ms | 7,6 | 8,7 | no máximo **1 em voo**; janela parada em só **0,7 %** dos quadros; ordem certa |
| redimensionar pela direita: volta | 16 | 4,0 ms | 6,9 | 6,9 | — |
| redimensionar pela direita: até o `resize` | 16 | 16,2 ms | 26,8 | 26,8 | o conteúdo novo leva **1 quadro** (às vezes 2); nenhum sem `resize` |
| redimensionar pela esquerda: volta | 16 | 4,2 ms | 13,3 | 13,3 | — |
| redimensionar pela esquerda: até o `resize` | 16 | 16,8 ms | 21,1 | 21,1 | — |
| ligar / desligar o clique-passa | 1 | 1,4 / 6 ms | — | — | — |

**O que muda:** o atraso de 50 a 70 ms que se supunha antes **não existe**. Mover por `setBounds` a cada quadro é liso. O tranco do vídeo antigo era o motor v2 esperando a volta (+1 quadro, ≈ 15 movimentos/s), corrigido na v2.1. O rAF a 60 fps estável **no segundo monitor** mostra que ele segue o ritmo do principal; a taxa do segundo monitor em si não foi lida (a API não dá).

## Redimensionar pela borda esquerda ou de cima

Teste visual: uma faixa que deveria ficar parada na tela, enquanto a janela cresce e encolhe 60 px pela esquerda a cada 300 ms, gravado a 30 fps.
- Em cerca de **1 a cada 3 trocas**, a faixa saltou 60 px por **1 ou 2 quadros do vídeo** (33 a 67 ms). Confirma o "quadro velho ancorado no canto de cima à esquerda".
- **Regra:** nunca deixe a borda esquerda ou de cima andar com o conteúdo visível no lugar. Esconder o quadro é proibido (R25): use as técnicas de [nada pisca](../../padroes/motion/janela-sem-tremer.md#nada-pisca-r25).

## Trava do host (confirmada)

| Pedido | Ficou | Leitura |
|---|---|---|
| fora à esquerda (x −500) / em cima (y −500) | 0 / 0 | encostada na área útil daquele monitor |
| fora embaixo (y 1280, h 200) | y 880 | idem |
| maior que a área útil (2320 × 1380) | 1920 × 1080 | encolhe, não recusa |
| 10 × 10 | 40 × 40 | mínimo 40 |
| fracionária (100,4; 100,6; 300,5 × 200,5) | 100; 101; 301 × 201 | arredonda |
| emenda: 40 % no monitor da esquerda (x 1800, w 300) | x 1920 | vai pro monitor com mais área |
| emenda: 50 % (x 1770) ou 60 % (x 1740) no da esquerda | x 1620 | empate fica no da esquerda |
| só `x` | os outros campos vêm do `getBounds` | — |
| `NaN`, chave `foo`, x 200 000 | erro `EINVAL`, nada muda | validação estrita |

Igual no segundo monitor. **Atenção:** o caso "segundo monitor, fora à esquerda" pediu x 1420, que cai inteiro no monitor da esquerda: não testou o que diz (ficou 1420, certo pra aquele monitor).

**`window.screen` na sonda:** `availLeft` 1920 e `availWidth` 1920 (o monitor onde a janela está); o `change` disparou 4 vezes na rodada: funciona no host e serve pra reler as telas (receita M5).

## Hover e clique-passa

- Com o clique-passa ligado, o `forward` entregou em 8 s **132 `pointermove` = 132 `mousemove`**, 0 com botão, 1 `mouseleave`, 0 `enter`. Intervalo entre movimentos (n 131): p50 17 ms, p95 27,2, máx 4557 (≈ 60 Hz andando; os buracos grandes são o mouse parado, quando nada chega).
- **Corrida do clique:** 20 de 20 cliques recebidos.

| Halo | n | entrada → clique p50 | p95 / máx | mínimo | desligar o clique-passa (p50) |
|---|---|---|---|---|---|
| 0 px | 10 | 148 ms | 1038 | 89 ms | 2,5 ms |
| 16 px | 10 | 145 ms | 1314 | 91 ms | 3,0 ms |

Na prática a corrida não acontece no PC de teste, mas o halo (H1) continua barato e seguro.

## Gravações e simulador (antes da sonda)

| O quê | Número | Método |
|---|---|---|
| arrasto com motor v2 (espera a volta) | janela parada em **43–63 %** dos quadros, saltos de **90–540 px** | gravação da tela, 30 fps |
| motor v2.1 (1 por quadro, até 5 em voo) | parada no arrasto lento **28–38 %** (v2: 100 %) | simulador com 60 ms de atraso (chute; a sonda mostrou que não existe) |
| Órbita grande contra a parede | conteúdo anda **6 %** do mouse, parada 74 % (v2.1) → **70 %**, parada 35 % (v2.2) | simulador |
| colar e descolar rápido (v2.2) | batidas secas 36 → 1 | simulador |
| Onda v20, 16 arrastos | 16/16 a ≤ 1 px, assentando em ≤ 1342 ms; emenda com âncora certa (pior 0,5–1,5 px) e 2 quadros escondidos | simulador, aba visível 1920 × 991 |

## Vídeo da Onda v20 (25/11/2026)

1 minuto, **30 fps**, só o monitor principal. Piscadas de 1–2 quadros (16,5 / 21,633 / 57,133 / 60,233 s), emenda voltando 1 quadro (10,967 s), tremedeira de ±70–170 px com o cursor parado (42,2–45,0 s) e vai e volta de ±10–60 px (ponto de pega). Causas e situação: [bugs e lições](../motor/bugs-e-licoes.md) 25–28.
