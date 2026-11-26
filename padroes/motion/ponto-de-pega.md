# Ponto de pega: o que você segurou fica embaixo do mouse

> L1 · motion. Índice: [motion](README.md). **O que é:** como manter o ponto exato que o mouse pegou embaixo do ponteiro enquanto a forma troca de lado, espelha, muda de degrau ou de tamanho no meio do arrasto. **Meta:** erro **≤ 2 px** em todo quadro, inclusive nas trocas de forma. **Quando ler:** antes de mexer no arrasto de qualquer app cuja forma muda durante o gesto (os três). O motor que move a janela: [motor-piloto](../../referencias/motor/motor-piloto.md).

## O sintoma

No vídeo da Onda v20 (30 fps), durante arrastos e trocas de forma, a Onda vai e volta **±10–60 px** em relação ao mouse: o ponto pego "escorrega" e depois a mola o traz de volta.

## A causa

- O motor só sabe da âncora: `tx = wx + (mouse − início)`. A âncora da Onda é o canto da capa compacta.
- Quando a forma muda (ex.: solta → coluna da direita, ou o espelho `x' = 64 − (x + w)`), as peças andam **dentro** da janela em molas próprias (posição e tamanho **k 300, ζ 0,78**, 3 subpassos). O ponto pego (num pedaço da capa, do texto, da tira) anda junto com a peça, mas a âncora não.
- **Onda v20:** nenhuma compensação; quem fica embaixo do mouse é a âncora.
- **Órbita:** `regrab(dx, dy)` na troca de forma com FLIP ([troca de forma](troca-de-forma.md)) move só o **alvo**; a mola de arrasto (k 1500) leva a janela até lá em alguns quadros, e nesse meio tempo o ponto também sai de baixo do mouse. As duas dão o vai e volta.
- Esticar e inclinar (`--sx --sy --tilt`) giravam em volta do centro da capa (`32px 32px`), não do ponto pego: num arrasto rápido o ponto também andava alguns px.

## A receita (Onda v21)

1. **Ao virar arrasto** (`onStart`, depois de 5 px), guardar **qual peça** está embaixo do ponto do pressionar (`elementFromPoint` dentro da peça, opacidade > 0,3; senão a capa) e a **fração** do ponto dentro dela, nas coordenadas das molas (sem o levantar e o esticar):
   ```
   grab = { peça, fx: (lx − x) / max(1, w), fy: (ly − y) / max(1, h) }
   ponto(grab) = (x + fx·w, y + fy·h)      ← x, y, w, h = molas da peça agora
   ```
2. **A cada quadro**, depois de andar as molas e antes de desenhar: medir quanto o ponto andou **dentro** do conteúdo e mandar a janela andar o contrário **na hora**:
   ```
   d = ponto(grab) − ponto_anterior
   se |d| > 0,01 px:  motor.nudge(−d.x, −d.y);  ponto_anterior = ponto(grab)
   --gox / --goy = ponto(grab)              ← estica e inclina giram no ponto pego
   ```
3. **`nudge` no motor:** anda posição lógica, alvo e referência do arrasto juntos (sem mola) e envia já, pro `setBounds` sair no mesmo quadro do CSS das peças ([motor-piloto](../../referencias/motor/motor-piloto.md#v21-nudge-em-implementação)).
4. `.frame` e `.lift` usam `transform-origin: var(--gox) var(--goy)`.
5. **A zona sai do ponto pego, não da âncora.** A metade da tela (lado `hx`/`vy`) e o monitor são decididos pelo ponto pego (`âncora + ponto(grab)`), que fica parado embaixo do mouse. Pela âncora vira laço: o espelho move o ponto, o `nudge` move a âncora, a âncora cruza o meio de volta e a forma troca de novo (14 trocas na emenda). Depois de soltar, o assentar e a zona continuam usando esse ponto até o próximo arrasto, senão a forma trocaria ao soltar.
6. **Janela presa na tela? A caixa vira só a forma nova.** Numa troca grande (grande, de cima pra baixo) a caixa carregava o antes **e** o depois (769 px), a janela encostava na borda da tela e o `nudge` não tinha pra onde ir. Arrastando com o motor dizendo que o alvo passa da tela (`S.over`), a caixa conta só onde as peças vão ficar e encolhe na hora, sem esperar a vez dos 100 ms. As peças que ainda saem do lugar velho ficam cortadas por poucos quadros.

Se a peça pega some (a opacidade cai na troca), a fração perde o sentido: a Órbita já resolve, mantendo embaixo do mouse o mesmo ponto **proporcional** da barra.

## Como medir

- **`grabtest.html`** (simulador, sem mouse real): `__suite()` roda os degraus `compact`, `exp` e `grand` × os caminhos `cruzaX` (400 → 1500 px), `cruzaY`, `diag` e `borda` (vai até 10 px das bordas e volta), em passos de 3 px por quadro (`__step`), e mede a cada quadro a distância entre o ponto pego (fração na caixa da capa) e o mouse. Saída por caso: **pior** (e em que forma), **p95**, **final** (30 quadros depois), **trocas** de forma (forma + lado), **parado** (o pior erro 14 quadros depois de cada ponto do caminho, com o mouse parado) e **salto** (quanto o erro cresce nos 5 quadros depois de uma troca). O salto inclui ~3 px do atraso normal de seguir o mouse; o parado não. O relógio é trocado por `setTimeout(16)` porque a aba encoberta cai pra ~2 fps.
- **Modo de registro** no app instalado ([como medir](../../referencias/ambiente/como-medir.md#2-modo-de-registro-trace-no-app)): `pega.erro [x, y]` = onde a peça pega está na página menos onde o mouse está (inclui o atraso da janela). Critério: `|erro| ≤ 2 px` em todo quadro do arrasto.

## Limites conhecidos (a vigiar)

- O `setBounds` sai no mesmo quadro, mas a janela chega 1–4 ms depois: se perder o vsync, aquele quadro mostra o CSS novo com a janela velha, um erro do tamanho do `d` do quadro (com mola k 300, alguns px). Se aparecer, compensar esse `d` no CSS (`--px`) até a volta.
- Com um commit de tamanho esperando o `resize` (`S.landing`), o `nudge` não envia na hora: o ponto pode ficar 1 quadro atrás.
- Contra uma parede, a janela não pode andar o que o `nudge` pede (trava do host): o ponto escorrega. O item 6 resolve quando é a caixa que sobra; quando é o próprio conteúdo que teria de sair da tela, o ponto escorrega (uma rodada isolada: 56 px no grande na borda de baixo, não repetiu em 4). O certo aí é o conteúdo ir até a beira dentro da janela (como o `over` do Eco), nunca pedir fora da tela (R25).

## Situação (25/11/2026)

**Publicado na Onda v21.** Simulador, 12 casos (3 degraus × 4 caminhos), 3 px por quadro:

| Degrau | Parado v20 → v21 | Salto na troca v20 → v21 |
|---|---|---|
| compacto | 1,4–18 → **0,0 px** | 1,6–10 → 0–4 px |
| expandido | 85–121 → **0,0–0,4 px** | 49–73 → 0–3 px |
| grande | 141–200 → **0,3 px** | 73–108 → 0–3 px |

- **Emenda (`#duplo`):** 2 trocas, salto ≤ 2,5 px.
- **Meta ≤ 2 px:** cumprida com o mouse parado. Andando, o salto medido inclui o atraso de 1 quadro; o registro no app instalado (`pega.erro`) decide.
- **Registro:** [diário](../../diario/2026-11.md).
