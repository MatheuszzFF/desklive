# Motor-piloto (só na Onda, R24)

> L3 · referência. Índice: [motor](README.md). **O que é:** o `motor-piloto.js`, uma cópia do motor v2.2 com as receitas do [ambiente](../ambiente/receitas-recomendadas.md) aplicadas, injetada **só na Onda** (o app piloto). **Quando ler:** antes de levar estas mudanças pros outros apps (depois da validação no app instalado) ou de mexer no envio, na trava ou no tamanho da Onda. Base: [motor de movimento](motor-de-movimento.md) e [tamanho e borda](tamanho-e-borda.md). Medições: [ambiente/medicoes.md](../ambiente/medicoes.md). Bugs abertos: [bugs e lições](bugs-e-licoes.md) 25–30.

O `motor.js` compartilhado **não muda**: Órbita e Eco seguem nele. O build da Onda injeta o piloto no lugar de `/*MOTOR*/`.

## O que muda em relação ao v2.2

| # | Mudança | Como | Por quê |
|---|---|---|---|
| **M1** | **Trava igual à do host** | `hostRect(r)`: monitor = o de **maior interseção** com o retângulo (empate: o primeiro da lista); vale a **área útil** dele (ou `bounds` se faltar); largura e altura entre `min(40, área)` e a área; tudo **arredondado** ([fórmula](../ambiente/mover-e-redimensionar.md#a-trava-real-do-host)). O que vai pro Windows é exatamente isso. | Na emenda, o motor (que prendia pela união das telas) e o host discordavam |
| **M2** | **Emenda como portal** | As **paredes** (`screenClamp`) são só as bordas da área útil sem monitor vizinho (`neighbor`, tolerância 2 px; a Onda usa 3 px no `outerEdge`); na emenda o alvo passa livre. A janela vai pro retângulo do host (rente à emenda, no monitor com mais área) e o app desloca o conteúdo **por dentro** dela (`onPortal(dx, dy)` → `--px/--py` → `translate` do palco). Quando a maior parte troca de monitor (`jumped`, comparando o `id` do monitor), o conteúdo some por **2 quadros** (`onHide`), a janela pula e ele reaparece do outro lado | A janela não pode ficar entre dois monitores; antes ela esperava e pulava a própria largura |
| **T4** | **Teto = área útil de UM monitor** | Vem de graça do M1 (o host encolhe pra um monitor só) | O `fitRect` do v2.2 somava os monitores lado a lado |
| **T2** | **Quadro velho escondido** | Commit que **muda o tamanho e move o canto de cima à esquerda** (fora do arrasto): conteúdo escondido (`html.hold .preview{visibility:hidden}`) até o quadro novo chegar (o `resize`, mais 2 quadros) | O Windows mostra o quadro velho ancorado nesse canto por 1–2 quadros (~1 em cada 3 trocas). **Proibido desde a R25:** no vídeo virou piscada ([nada pisca](../../padroes/motion/janela-sem-tremer.md#nada-pisca-r25)) |
| **M5** | **Telas pelo evento** | `window.screen` `change` → relê as telas (mais no início de todo arrasto e a cada 3 s parado) | O evento dispara no host |
| **H5** | **Movimento reduzido ao vivo** | `matchMedia(...).change` atualiza o `reduce` | O Windows muda isso sem reiniciar o app |

API nova: `hostRect(r)`, `hostDisplay(r)`, `portal` (o deslocamento atual), `stats.hides` (quantas vezes escondeu). Callbacks: `onPortal({ dx, dy })`, `onHide(on)`.

**O portal**, a cada envio: se o host manteve o tamanho pedido, o deslocamento é o que ele tirou da posição; senão, zero. Só avisa o app quando muda.
```
portal = (tamanho do host = round(tamanho pedido)) ? (round(want.x) − host.x, round(want.y) − host.y) : (0, 0)
```

## A bomba (um envio por quadro)

Tudo que vai pro Windows sai de `pump()`, chamada uma vez por quadro no laço do rAF: calcula `frame(cur)`, passa pela trava (`fitRect` → `hostRect`), não reenvia o que já foi pedido (`S.sent`), e um commit com CSS só sai depois que o CSS do anterior entrou (`S.landing`). A posição lógica é `float`; só o envio é arredondado. O `MAXFLY = 5` é só teto de segurança: medido, nunca passa de 1 em voo.

Ao assentar não há trava (o destino do app já cabe). 200 ms depois de parar, `checkHost()` lê `getBounds()`; se a real difere mais de 1 px, a lógica adota a real (`stats.hostFix`).

## v21: `nudge` e nada de esconder

Pro [ponto de pega](../../padroes/motion/ponto-de-pega.md): anda posição lógica, alvo e referência do arrasto juntos, sem mola, e envia no mesmo quadro (se não houver commit esperando o `resize`).
```
nudge(dx, dy): cur += d; alvo += d; se arrastando, referência do arrasto += d
               pedir envio; stats.nudges++; se não S.landing → pump() já
```

**Esconder removido (R25).** O v20 escondia o conteúdo 2 quadros no pulo de monitor e quando um commit de tamanho movia o canto de cima à esquerda; no app instalado isso virou piscada. Agora não esconde mais e só conta: `stats.tlMoves` (canto de cima à esquerda andou com o tamanho, quadro velho possível) e `stats.jumps` (pulo de monitor). O registro da Onda grava os dois por quadro.

## O que a Onda faz do lado dela (junto com o piloto)

- **Âncora:** a posição lógica é o canto da capa compacta (64 px). Janela = âncora + caixa `LR`: `x = round(p.x) + LR.l`, largura `LR.r − LR.l`. A caixa tem duas versões: `LR` (lógica, vale já pro motor) e `LRc` (a do CSS, `--ax --ay --ww --wh`, que entra no `apply` do commit); `reshape(w, h, dx, dy, apply)`.
- **Zonas** (`zoneAt`, pela capa): sente a borda a 90 px (`SENSE`), mantém até 130 (`KEEP`), metade esquerda/direita com ± 40 (`MIDH`), encosta a 16 px (`G`). Canto = lateral + topo/base. `restFor()` encosta e mantém tudo dentro da tela (3 iterações).
- **T3:** no máximo **1 mudança de tamanho a cada 100 ms** (posição pode ir todo quadro).
- **T2:** a borda esquerda e a de cima crescem com **40 px de folga** (`SLACK`) e, parado, só encolhem se a sobra passar de **120 px** (`KEEP_LT`); direita e baixo seguem exatos. Rente a uma borda da tela é sempre exato. A caixa pedida inclui o **arranjo final inteiro desde o primeiro quadro** e é cortada na tela contra o **destino** (`clampLR` com `mover.target`).
- **H1/H2/H3/H4:** ver [interação da Onda](../../apps/onda/interacao.md#hover-e-clique-passa) e a [receita](../ambiente/hover-e-clique-passa.md#receita-robusta).

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

**No app instalado (vídeo de 1 min a 30 fps, 25/11):** o esconder de 2 quadros **aparece como piscada**; a emenda volta 1 quadro pro monitor antigo; tremedeira de ±70–170 px no canto com o cursor parado; o ponto de pega escorrega ±10–60 px. Hipóteses e correções: [bugs e lições](bugs-e-licoes.md) 25–28. Em aberto também: o pulo de monitor com DPI misto.
