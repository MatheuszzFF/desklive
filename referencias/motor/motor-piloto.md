# Motor-piloto (só na Onda, R24)

> L3 · referência. Índice: [motor](README.md). **O que é:** o `motor-piloto.js`, uma cópia do motor v2.2 com as receitas do [ambiente](../ambiente/receitas-recomendadas.md) aplicadas, injetada **só na Onda** (o app piloto). **Quando ler:** antes de levar estas mudanças pros outros apps (depois da validação no app instalado) ou de mexer no envio, na trava ou no tamanho da Onda. Base: [motor de movimento](motor-de-movimento.md) e [tamanho e borda](tamanho-e-borda.md). Medições: [ambiente/medicoes.md](../ambiente/medicoes.md).

O `motor.js` compartilhado **não muda**: Órbita e Eco seguem nele. O build da Onda injeta o piloto no lugar de `/*MOTOR*/`.

## O que muda em relação ao v2.2

| # | Mudança | Como | Por quê |
|---|---|---|---|
| **M1** | **Trava igual à do host** | Monitor = o de **maior interseção** com o retângulo (empate: o primeiro da lista); vale a **área útil** dele; largura e altura entre `min(40, área)` e a área; tudo **arredondado**. O que vai pro Windows é exatamente isso. | Na emenda, o motor (que prendia pela união das telas) e o host discordavam |
| **M2** | **Emenda como portal** | As **paredes** são só as bordas da área útil sem monitor vizinho; na emenda o alvo passa livre. A janela vai pro retângulo do host (rente à emenda, no monitor com mais área) e o app desloca o conteúdo **por dentro** dela (`onPortal(dx, dy)` → `translate` no palco). Quando a maior parte troca de monitor, o conteúdo some por **2 quadros** (`onHide`), a janela pula e ele reaparece do outro lado | A janela não pode ficar entre dois monitores; antes ela esperava e pulava a própria largura |
| **T4** | **Teto = área útil de UM monitor** | Vem de graça do M1 (o host encolhe pra um monitor só) | O `fitRect` do v2.2 somava os monitores lado a lado |
| **T2** | **Quadro velho escondido** | Commit que **muda o tamanho e move o canto de cima à esquerda** (fora do arrasto): conteúdo escondido até o quadro novo chegar (o `resize`, mais 2 quadros) | O Windows mostra o quadro velho ancorado nesse canto por 1–2 quadros (confirmado em vídeo: ~1 em cada 3 trocas) |
| **M5** | **Telas pelo evento** | `window.screen` `change` → relê as telas (mais a conferência de 3 s parado) | O evento dispara no host |
| **H5** | **Movimento reduzido ao vivo** | `matchMedia(...).change` atualiza o `reduce` | O Windows muda isso sem reiniciar o app |

API nova: `hostRect(r)`, `hostDisplay(r)`, `portal` (o deslocamento atual), `stats.hides` (quantas vezes escondeu). Callbacks: `onPortal({ dx, dy })`, `onHide(on)`.

## O que a Onda faz do lado dela (junto com o piloto)

- **T3:** no máximo **1 mudança de tamanho a cada 100 ms** (posição pode ir todo quadro).
- **T2:** a borda esquerda e a de cima crescem com **40 px de folga** e, parado, só encolhem se a sobra passar de **120 px** (a sobra é transparente e deixa o clique passar). Rente a uma borda da tela é sempre exato. A caixa pedida inclui o **arranjo final inteiro desde o primeiro quadro** (a entrada em sequência não faz a janela crescer em degraus).
- **H1/H2/H3/H4:** ver [interação da Onda](../../apps/onda/interacao.md#hover-e-clique-passa).

## Simulador

O `onda-sim.html` imita o host como medido: trava por monitor (maior interseção, área útil, arredonda, mínimo 40), `resize` **~16 ms** depois de cada mudança de tamanho (sem isso o commit esperava a garantia de 100 ms e tudo parecia escondido ou parado), `innerWidth`/`innerHeight` = tamanho da janela, `getCursorScreenPoint` falso e `#duplo` (dois monitores: as metades da aba, com a emenda desenhada).

## Testado (Chrome, aba visível, 1920 × 991)

| Teste | Resultado |
|---|---|
| Arrastar pela emenda devagar (1000 px), nos 4 degraus, pros dois lados | âncora no lugar certo em **todos** os quadros visíveis (pior 0,5–1,5 px); conteúdo escondido **2 quadros** no pulo de monitor |
| Mudar de degrau onde a janela cresce pra esquerda ou pra cima (solta à direita, prateleira, coluna da direita, canto, topo) | âncora no lugar em todos os quadros visíveis; escondido **2 quadros** por troca (uma vez 4) |
| 16 arrastos (4 degraus × 4 direções), um monitor | 16/16 a ≤ 1 px, assentando em ≤ **1342 ms** |
| Zigue-zague no limiar da borda direita | **2 trocas** (linha → coluna → linha) |
| Hover pelo cursor real: a forma muda embaixo do mouse parado; mouse sai | liga sozinho (hover sim, clique-passa não) e desliga ao sair |

**Não testado:** no app instalado (é o que a validação do usuário confere). Em aberto: se esconder 2 quadros aparece como piscada, e o pulo de monitor com DPI misto.
