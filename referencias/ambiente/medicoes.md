# Medições no app instalado

> L3 · referência. **O que é:** os números medidos pela [sonda](tempo-e-medicao.md#sonda-de-diagnóstico) no host de verdade, que confirmam ou corrigem o que a pesquisa deduziu lendo código. **Quando ler:** antes de decidir qualquer coisa de movimento, tamanho ou hover. Estes números valem mais que os marcados **(inferido)** nos outros arquivos.

Rodada de 25/11/2026. Host com Electron 45.3.3 e Chromium 156. Dois monitores de 1920 × 1080, escala 1, área útil igual à tela (barra de tarefas oculta), monitor de 60 Hz. A sonda tinha 440 × 600, sempre no topo e transparente.

## Tempo

| Medida | p50 | p95 | máx | Leitura |
|---|---|---|---|---|
| rAF parado | 16,7 ms | 16,9 | 18,7 | 60 fps estável, 0 % dos quadros acima de 20 ms |
| rAF com a janela andando | 16,7 ms | 16,9 | 17,0 | mover a janela não derruba os quadros |
| IPC vazio (`os.platform`) | 0,2 ms | 0,3 | 0,6 | ida e volta ao processo principal quase de graça |
| `getCursorScreenPoint` | 0,2 ms | 0,3 | 0,9 | dá pra ler o cursor real a cada quadro |
| `setBounds` (só mover), 1 por vez | 1,2 ms | 2,4 | 3,5 | `window.screenX` já mudou quando a promessa volta |
| `setBounds` 1 por quadro (rajada) | 3,8 ms | 7,6 | 8,7 | no máximo 1 em voo; janela parada em só **0,7 %** dos quadros; ordem certa |
| redimensionar: volta do `setBounds` | 4,0 ms | 6,9 | 13,3 | — |
| redimensionar: até o `resize` chegar | 16,2 ms | 26,8 | 26,8 | o conteúdo novo leva **1 quadro** (às vezes 2) |
| ligar ou desligar o clique-passa | 1,4 / 6 ms | — | — | — |

**O que muda:** o atraso de 50 a 70 ms que se supunha antes **não existe** no host atual. Mover por `setBounds` a cada quadro é liso. O tranco que aparecia no vídeo antigo era do motor esperando confirmação, e foi corrigido na v2.1.

## Redimensionar pela borda esquerda ou de cima

Teste visual: uma faixa que deveria ficar parada na tela, enquanto a janela cresce e encolhe 60 px pela esquerda a cada 300 ms, gravado a 30 fps.
- Em cerca de **1 a cada 3 trocas**, a faixa saltou 60 px por **1 ou 2 quadros do vídeo** (33 a 67 ms). Isso confirma o "quadro velho ancorado no canto de cima à esquerda".
- **Regra:** nunca deixe a borda esquerda ou de cima andar com o conteúdo visível no lugar. Mantenha o canto de cima à esquerda fixo, ou esconda e congele o quadro durante a troca ([receitas](receitas-recomendadas.md), T2).

## Trava do host (confirmada)

| Pedido | Ficou | Leitura |
|---|---|---|
| fora da tela (esquerda, cima, baixo) | encostada na área útil daquele monitor | trava por monitor |
| maior que a área útil (2320 × 1380) | 1920 × 1080 | encolhe, não recusa |
| 10 × 10 | 40 × 40 | mínimo 40 |
| fracionária (100,4; 100,6; 300,5 × 200,5) | 100; 101; 301 × 201 | arredonda |
| emenda: 40 % no monitor da esquerda | pula inteira pro da direita (x = 1920) | vai pro monitor com mais área |
| emenda: 50 % ou 60 % no da esquerda | pula inteira pro da esquerda (x = 1620) | empate fica no da esquerda |
| `NaN`, chave extra, x = 200 000 | erro `EINVAL`, nada muda | validação estrita |

O evento `change` do `window.screen` disparou 4 vezes durante a rodada: ele funciona no host e serve pra reler as telas (receita M5).

## Hover e clique-passa

- Com o clique-passa ligado, o `forward` entregou **132 movimentos em 8 s**, com intervalo p50 de 17 ms e p95 de 27 ms (≈ 60 Hz enquanto o mouse anda). Nada chegou com o mouse parado. Veio 1 `mouseleave`.
- **Corrida do clique:** 20 de 20 cliques recebidos, 10 sem margem e 10 com margem de 16 px. O clique mais rápido veio 89 ms depois de entrar, e desligar o clique-passa leva cerca de 3 ms. Na prática a corrida não acontece neste PC, mas a margem de aproximação (H1) continua barata e segura.
