# Opcionais do Board

> **O que é:** peças e módulos que **não** fazem parte do Board. Cada pessoa monta o seu Board com a lista que quiser; sem lista, o Board sai vazio (só a Sonda), igual ao de sempre. **Quando ler:** antes de criar uma peça nova ou de montar um Board com opcionais. Índice: [Board](../README.md).

## Regra

O Board é um quadro vazio e completamente interativo. Nada no núcleo (`board-src.html`) cita peça nenhuma: o que uma peça ou um assistente precisa entra como capacidade geral da **API aberta** (abaixo), que serve igual pra qualquer um. Um opcional nunca mexe no núcleo, e um opcional não depende de outro, a não ser que diga isso no README dele.

## Montar com opcionais

```powershell
powershell -ExecutionPolicy Bypass -File modelos\board\build.ps1 -Pecas assistente,dengas
```

Cada opcional é uma pasta `pecas/<nome>/` com um `<nome>.js`. Na montagem, `/*ARQ:arquivo*/''` vira o texto do arquivo (string JS) e `/*B64:arquivo*/''` vira o arquivo em base64. O código roda depois do núcleo, com `Board` pronto.

## A API aberta (no núcleo)

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

## Chaves (credenciais das integrações)

Todas as credenciais ficam num arquivo só, no PC de quem usa: `~/.orbita/chaves.json`. Nada de chave no código, no build ou no artefato publicado: o mesmo Board serve pra qualquer pessoa.

- **Declarar o que a sua peça precisa** (uma vez, quando o opcional carrega):
  ```js
  Board.chaves.declarar({ id:'spotify', nome:'Spotify', para:'tocar as suas músicas', como:'passo a passo pra conseguir a chave',
    campos:[{ chave:'clientId', rotulo:'Client ID', formato:'^[A-Za-z0-9]{32}$' }] });
  ```
- **Usar:** `Board.chaves.valor('spotify', 'clientId')` → o valor, ou `null` se falta ou está fora do formato.
- **Ver o que falta:** `Board.chaves.situacao()` → `[{ id, nome, para, pronto, faltam }]`. Sem valores: é isto que um assistente pode ver.
- **Pedir pra pessoa:** `Board.chaves.abrir()` escreve o modelo (com o `_para` e o `_como` de cada integração, sem apagar nada do que já está lá) e abre no Bloco de Notas. Salvou, o Board lê sozinho.
- **Eventos:** `chaves:faltando` (na abertura, com o que falta), `chaves:editando` (true/false), `chaves:mudou`.
- **Onboarding:** na abertura, se falta alguma chave declarada, o Board anuncia `chaves:faltando`. Com o opcional `mesa`, o Dengas fala o que falta e abre o arquivo quando a pessoa pede; ele nunca pede, repete ou mostra o valor de uma chave. Também há "Chaves das integrações…" no menu e na bandeja.

## Os opcionais que existem

| Opcional | O que é | Depende de |
|---|---|---|
| [assistente](assistente/) | o cérebro: conversa com o Claude de quem abriu e usa a API aberta como ferramentas; mini agente por peça; internet pelo PowerShell | nada (sem corpo; quem quiser um usa `Board.assistente`) |
| [mesa](mesa/) | a ponte da Mesa: o Dengas, a Onda, a Órbita e o navegador da Mesa com o mesmo código, rodando em cima do Board; declara a chave do Spotify | nada (monta com `-Pecas mesa`) |
| [dengas](dengas/) | o corpo: um ratinho de pixel que anda pelo espaço livre, senta nos lados e cantos, fala em balão e abre a conversa | `assistente` pra pensar (sem ele, só faz companhia) |

## Provar

O simulador do Board roda com os opcionais montados. `await T4.api()` prova a API aberta (ver, mexer, comando, furo, eventos) e não depende de opcional nenhum.
