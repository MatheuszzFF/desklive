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

## A receita (Onda v21, em implementação)

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

Se a peça pega some (a opacidade cai na troca), a fração perde o sentido: a Órbita já resolve, mantendo embaixo do mouse o mesmo ponto **proporcional** da barra.

## Como medir

- **`grabtest.html`** (simulador, sem mouse real): `__suite()` roda os degraus `compact`, `exp` e `grand` × os caminhos `cruzaX` (400 → 1500 px), `cruzaY`, `diag` e `borda` (vai até 10 px das bordas e volta), em passos de 10 px por quadro, e mede a cada quadro a distância entre o ponto pego (fração na caixa da capa) e o mouse. Saída por caso: **pior** (e em que forma), **p95**, **final** (30 quadros depois) e **trocas** de forma. O relógio é trocado por `setTimeout(16)` porque a aba encoberta cai pra ~2 fps.
- **Modo de registro** no app instalado ([como medir](../../referencias/ambiente/como-medir.md#2-modo-de-registro-trace-no-app)): `pega.erro [x, y]` = onde a peça pega está na página menos onde o mouse está (inclui o atraso da janela). Critério: `|erro| ≤ 2 px` em todo quadro do arrasto.

## Limites conhecidos (a vigiar)

- O `setBounds` sai no mesmo quadro, mas a janela chega 1–4 ms depois: se perder o vsync, aquele quadro mostra o CSS novo com a janela velha, um erro do tamanho do `d` do quadro (com mola k 300, alguns px). Se aparecer, compensar esse `d` no CSS (`--px`) até a volta.
- Com um commit de tamanho esperando o `resize` (`S.landing`), o `nudge` não envia na hora: o ponto pode ficar 1 quadro atrás.
- Contra uma parede, a janela não pode andar o que o `nudge` pede (trava do host): o ponto escorrega. Aí o certo é o conteúdo ir até a beira dentro da janela (como o `over` do Eco), nunca pedir fora da tela (R25).

## Situação (25/11/2026)

Escrito na Onda v21 e no motor-piloto da sessão, **ainda não publicado nem medido no app instalado**. Os resultados do `grabtest` não foram salvos: não se sabe ainda se a meta de ≤ 2 px foi atingida. Registro: [diário](../../diario/2026-11.md).
