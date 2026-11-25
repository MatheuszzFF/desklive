# Passo 5: visual e motion

> **O que é:** a linguagem visual da família e as constantes de motion pra começar. **Quando ler:** quando as formas do [passo 3](03-forma-por-lado.md) já existem e você vai dar acabamento. Os números ficam só em [molas](../referencias/motion/molas.md) e [curvas e durações](../referencias/motion/curvas-e-duracoes.md), pra não desatualizar. Índice: [guia](README.md).

## A linguagem visual

- **Transparente, sem caixas** (R1): o app flutua sobre o papel de parede. Vidro leve só onde o texto precisa de leitura; texto solto ganha sombra dupla (uma curta e uma larga).
- **Refinar, não inflar** (R2): nada de animação exagerada, espaçamento inflado ou caixa a mais.
- **Nada genérico** (R3): uma **marca** própria e viva, que reage ao estado. Nada de bolinha, ícone de biblioteca ou logo de terceiros como solução. Exemplos: a forma líquida do Eco ([marca WebGL](../apps/eco/marca-webgl.md)), a onda da Onda, a órbita da Órbita.
- **Brilho e sombra dentro da janela** (R4), **alinhamento medido** (R5) e, pra um pedido "state of the art", pesquisa de referências antes (R6).
- **Família:** os três apps usam Space Grotesk nos números e títulos e Inter no texto (a Órbita ainda alinha os números com `tabular-nums`), e cada um tem a sua cor. Veja como cada um fecha o visual: [Órbita](../apps/orbita/visual.md), [Onda](../apps/onda/visual.md), [Eco](../apps/eco/visual.md). Fonte do estilo: [design](../padroes/design.md).

## Os princípios de motion

1. **Mola de verdade, não duração fixa.** No JS, um oscilador massa-mola integrado a cada quadro; no CSS, a mesma mola amostrada numa curva `linear()`.
2. **Um laço por quadro**, com `dt` limitado e alguns subpassos, pra um quadro atrasado não virar salto.
3. **O alvo muda e a mola persegue.** Nada é cancelado e reiniciado no meio.
4. **Parou, desliga.** Em repouso nada roda, a não ser o que é vivo de propósito.
5. **Crescer na hora, encolher depois.**

```
a = k·(alvo − x) − c·v      c = 2·√k·ζ
v += a·h ;  x += v·h        h = dt / subpassos
```

Fonte e detalhes: [linguagem de motion](../padroes/motion/README.md).

## Kit de partida: comece com estas

| Pra quê | Comece com | Número em |
|---|---|---|
| Janela seguindo o mouse | a mola de arrasto do motor (crítica, com *feed-forward*) | [molas](../referencias/motion/molas.md) |
| Soltou no meio da tela | assentar do motor | [molas](../referencias/motion/molas.md) |
| Soltou numa borda ou canto | encaixe firme (não passa do ponto) | [molas](../referencias/motion/molas.md) |
| Menu, "centralizar", troca de tela | deslize suave | [molas](../referencias/motion/molas.md) |
| Pegar e bater na borda | levantar e batida (micro-amassado) | [molas](../referencias/motion/molas.md) |
| Fusão com a borda | uma mola mole, com um tiquinho de balanço | [molas](../referencias/motion/molas.md) (Órbita "colado", Onda "fuse") |
| A forma inteira mudando, no CSS | Eco `--sp` / `--spd` como `linear()` | [curvas e durações](../referencias/motion/curvas-e-duracoes.md) |
| O que chega depois da forma (ombros, prévia) | Eco `--sp2` / `--spd2` | [curvas e durações](../referencias/motion/curvas-e-duracoes.md) |
| Fades, balões, texto | `--ease` | [curvas e durações](../referencias/motion/curvas-e-duracoes.md) |
| Micro-interação (hover de ícone, botão, alça) | `--spring` | [curvas e durações](../referencias/motion/curvas-e-duracoes.md) |
| Inclinar, esticar, levantar, amassar | a coluna do app mais parecido com o seu | [sentir o arrasto](../padroes/motion/sentir-o-arrasto.md) |
| Peças entrando | uma depois da outra (**stagger**) | [entradas em sequência](../padroes/motion/entradas-em-sequencia.md) |

## Como usar o kit

- **Gere a curva `linear()` da mola no boot** e guarde numa variável CSS, com um `cubic-bezier` de reserva quando o navegador não suportar ([curvas e durações](../referencias/motion/curvas-e-duracoes.md)).
- **Comece igual e ajuste com prints.** Mudou uma constante? Anote o antes → depois no registro do app ([passo 7](07-documentar.md)).
- **Respeite `prefers-reduced-motion`:** o motor vai direto, sem levantar nem amassar, e as transições zeram ([movimento reduzido](../padroes/motion/movimento-reduzido.md)).
- **Nada aparece de uma vez nem some seco:** primeiro a forma, depois o campo, depois os detalhes.

## Pronto quando

- [ ] Nenhuma caixa opaca, nenhum brilho cortado, nada genérico; o app tem uma marca viva.
- [ ] Toda mudança anda numa mola ou numa curva da mesma mola; nenhum pulo seco.
- [ ] Com movimento reduzido ligado, o app continua usável e calmo.

Próximo: [testar sem mexer no PC](06-testar-sem-mexer-no-pc.md).
