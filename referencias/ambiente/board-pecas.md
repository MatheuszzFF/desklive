# Board: peças, camadas e clique

> L3 · referência. Índice: [ambiente](README.md) · conceito em [board](board.md) · motor em [board-motor](board-motor.md). **O que é:** a API de peça do Board v1, a ordem das camadas, as regras do clique-passa e o passo a passo pra pôr a Onda (ou qualquer app) dentro. **Quando ler:** antes de criar ou migrar uma peça.

## Uma peça = um `Board.registrar` a mais

```
Board.registrar({ id, nome, passavel, persistir, noMenu, oculta, essencial, versaoEstado, inicial:{ forma, rx, ry, fixo, pos(area) },
  criar(ctx) → { el, fundo, caixa(area), tamanho(forma, degrau, area), raios(forma, degrau),
                 formaArrasto, arrastoMantemDegrau, pega(alvo), mapearPega(fx, fy, P), clique(e, P),
                 onForma, onDegrau, onSize, onHover, onFase, onArea, onMostrar,
                 estado(), restaurar(dados), menu(), ativar(), destruir() } })
```
- **`caixa`:** o maior tamanho possível. O shell cria uma camada desse tamanho uma vez; a forma visível é um **recorte** (`clip-path: inset(... round r0 r1 r2 r3)`), então crescer e encolher não faz layout.
- **`tamanho(forma, degrau)`:** o tamanho visível em cada lado e canto. Formas: `livre`, `top`, `bottom`, `left`, `right`, `c-tl`, `c-tr`, `c-bl`, `c-br` (emenda e degrau usam a forma do lado). Degraus: `compacto`, `espiar` (hover), `aberto` (clique, fixo até recolher).
- **`raios`:** opcional; o padrão põe 0 no lado fundido e o raio no resto. Os **ombros côncavos** de 16 px aparecem sozinhos nas pontas do lado fundido (dois por forma, cantos inclusive).
- **Âncora:** cada forma tem o ponto que fica parado quando o tamanho muda (topo `(.5, 0)`, esquerda `(0, .5)`, canto `c-br` `(1, 1)`, solta pelo terço da tela). Por isso "abrir" sempre cresce pra dentro, e posição e tamanho usam a mesma mola.
- **`ctx.ancorar(el, ax, ay)`:** prende uma camada interna a um ponto da forma (o shell move só por `transform`). A Sonda usa isso pra cada vista (cápsula, ilha, coluna, canto, painel).
- **`estado()` / `restaurar()`:** o que viaja junto quando a peça troca de Board (a Sonda leva os resultados e o fim do log).
- **`ativar()` / `destruir()`:** a mesma peça nasce como **fantasma** no Board vizinho; só vira de verdade (e liga ouvintes, timers, peças de teste) na adoção.
- **`arrastoMantemDegrau`:** a peça aberta continua aberta no arrasto (a Sonda é arrastada como o painel inteiro, como na sonda original); o alvo de encaixe e a prévia usam esse tamanho.
- **`versaoEstado`:** subiu a versão, o estado salvo antigo é ignorado e a peça nasce do jeito novo (`inicial.pos`, `inicial.fixo`).
- **Tudo que muda de tamanho dentro da peça anima:** a Sonda usa "altura viva" (ResizeObserver congela a altura antiga antes do quadro pintar e uma mola leva à nova; o embrulho medido é `display:flow-root`, senão a margem dos filhos escapa da medida), crossfade nos textos que mudam (contadores vivos trocam no lugar, com dígitos tabulares) e rolagem do log com mola.

## Camadas (z), todas filhas do `body`

| z | Camada | Pega o mouse? |
|---|---|---|
| 1 | guias, prévia, marcas | não (`pointer-events:none`) |
| 2 | fantasmas (peças vindo do outro Board) | não |
| 3 | peças: a arrastada (z 100000) > a última clicada ou mostrada > o resto | só a forma da peça |
| 4 | balões e avisos (uma camada raiz única, posicionada pela caixa do alvo) | não |
| 5 | overlay de afinação | não |

Nenhum balão mora dentro de uma peça: `transform`, `filter` e `will-change` das peças nunca prendem um balão. Provado no simulador com a Afinação sobreposta à Sonda: o balão do botão fica por cima das duas.

## Clique-passa: só a peça existe

- **Desliga** só com o cursor **dentro da forma real** (retângulo com os 4 raios; o canto arredondado de fora não conta; os ombros de 16 px também não, o clique passa ali). Halo de até 8 px só chegando rápido (> 500 px/s, na direção da peça).
- **Hover macio:** a margem de saída cresce de 0 a 10 px em ~90 ms (histerese sem degrau) e o hover acende pelo motor (escala 1,006 e um fio de sombra), entrando e saindo.
- **Religa na hora** ao sair da forma (sem atraso; o hover visual tem a sua própria histerese de 160 ms). Um clique que caiu no Board fora de peça religa na hora.
- **Nunca preso:** vigia de 200 ms relê o cursor enquanto desligado; religa em `blur`, erro e `pointercancel`; botão "preso" sem evento por 600 ms é solto.
- **Foco:** o Board só pede foco com clique numa peça (nada de `show()` sozinho).

## Como pôr a Onda dentro (próximo passo)

1. Copie o `onda-src.html` pra um módulo `criarOnda(ctx)` no Board: o conteúdo vira `el`, **sem** `setBounds`, sem motor de janela e sem clique-passa próprio (o shell faz).
2. Traduza cada forma da Onda (solta, colunas, topo, cantos, degraus) em `tamanho(forma, degrau)` + uma vista ancorada por forma (`ctx.ancorar`), como a Sonda faz.
3. Hover e alça viram `onHover` e `clique`/`pega`; o degrau grande vira `aberto`. O ponto pego: `mapearPega` (em pixels).
4. `estado()` leva a música e o progresso; `persistir:true` guarda o lugar em `board-estado.json`.
5. `Board.registrar({ id:'onda', nome:'Onda', passavel:true, persistir:true, noMenu:true, criar:criarOnda })`. Menu, bandeja, guias, emenda e monitores vêm de graça.
6. Prove no `teste-board.html` (pasta de trabalho) com os cenários de encaixe, emenda e clique.
