# Board: API aberta

> L3 · referência do [Board](README.md). **Quando ler:** antes de escrever um app que vive no Board ou um assistente que mexe nele.

O Board é um quadro vazio, mas qualquer cliente (uma peça, um assistente, o console) vê e mexe em tudo. Nada aqui conhece app nenhum: só o que as peças declaram.

## Chamadas

| | Chamada | O que faz |
|---|---|---|
| Ver | `Board.mapa()` | quadro, monitores, cada peça (posição, tamanho, forma, degrau, `ver`, comandos, regras), peças disponíveis e os maiores espaços livres |
| | `Board.peca(id)` · `Board.espacoLivre(n)` | uma peça; os `n` maiores retângulos vazios |
| Mexer | `Board.mostrar(id, sim)` · `Board.mover(id, {x, y, forma})` · `Board.degrau(id, nome)` | abre ou esconde (cria se estiver só registrada); solta em x, y ou funde num lado/canto; compacto, espiar, aberto |
| Dados | `Board.comando(id, nome, args)` | chama um comando que a peça declarou |
| Criar | `Board.definir(def)` · `Board.remover(id)` | registra e mostra uma peça em tempo real; tira |
| Ouvir | `Board.ouvir(tipo, fn)` · `Board.anunciar(tipo, dado)` | eventos (`peca:pegou`, `peca:soltou`, `peca:encaixou`, `peca:assentou`, `peca:trocouForma`, `peca:moveu`, `peca:mostrou`, `peca:comando`…; `'*'` ouve todos) |

Uma peça entra nisso devolvendo em `criar(ctx)` os campos opcionais:

- `automacao:{ ver() → dados simples, comandos:[{ nome, descricao, esquema, roda(args) }], regras:'como usar esta peça' }`
- `furos(P) → [{x, y, w, h}]`: buracos dentro da forma por onde o clique passa (vídeo, navegador por baixo)

E pode andar sozinha pondo uma função em `ctx.P.controlado` (o motor a chama a cada quadro até ela devolver `false`).

## Plugar um app

1. Crie `modelos/<app>/board.js` (e o contexto em `apps/<app>/`). Ele roda depois do núcleo, com `Board` pronto.
2. Registre a peça com `Board.registrar({...})` ([board-pecas](../../referencias/ambiente/board-pecas.md)) e, se quiser ser visto e comandado, devolva `automacao`.
3. Credencial? Declare nas [chaves](chaves.md).
4. Monte com `build.ps1 -Pecas ...,<app>`. Marcadores da montagem: `/*JS:app/arq.js*/`, `/*PS:app/arq.ps1*/''`, `/*APP:nome*/''` (app do desklive hospedado, montado sem chave), `/*JSON:arq*/{}`, `/*DATAURL:arq*/''`, `/*ARQ:arq*/''`, `/*B64:arq*/''` (estes quatro a partir da pasta do app).
