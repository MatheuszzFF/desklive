# Board — o quadro vazio e interativo

> **O que é:** o doc L2 do Board. **Quando ler:** antes de criar, refinar ou depurar o Board, ou de plugar um app nele. Comum a todos: [padroes/](../../padroes/README.md). Histórico: [refinos](refinos.md). Código: [modelos/board/](../../modelos/board/README.md). Como é feito por dentro (motor, telas, conexão, peças): [board](../../referencias/ambiente/board.md), [board-pecas](../../referencias/ambiente/board-pecas.md), [board-motor](../../referencias/ambiente/board-motor.md), [board-telas](../../referencias/ambiente/board-telas.md), [board-conexao](../../referencias/ambiente/board-conexao.md).

- **Conteúdo:** um palco transparente do tamanho de cada monitor (um app instalado por monitor), onde os apps vivem como **peças**. Vem vazio: só a Sonda (o painel de testes). O resto são **opcionais** que cada pessoa escolhe na montagem.
- **Uma função:** ser a base limpa e dinâmica. O Board não conhece nenhum app; ele dá movimento, encaixe em bordas, cantos e emendas, clique-passa, passe entre monitores, uma **API aberta** (ver, mexer, dados, criar, ouvir) e as **chaves** das integrações. Não tem assistente, nem música, nem navegador: isso é de quem pluga.
- **Atalho / teclado:** `Ctrl+Alt+B` mostra e esconde as peças; `Ctrl+Alt+Shift+B` abre a Afinação.
- **Barramento:** `~/.orbita` (estado das peças, batimento entre Boards, telas) e `~/.orbita/chaves.json` (credenciais). Dentro da página: `Board.ouvir` / `Board.anunciar`.
- **Helpers:** PowerShell embutido (telas do Windows, relay de named pipes entre os dois Boards).

## Como é feito

### Estrutura
- Núcleo em [modelos/board/board-src.html](../../modelos/board/board-src.html); um marcador só, `/*PECAS*/`, onde entram os opcionais. Cada opcional é um app do desklive com um `board.js` na pasta dele (`modelos/<app>/board.js`), escolhido na montagem com `-Pecas`.
- **API aberta:** [api-aberta.md](api-aberta.md). **Chaves:** [chaves.md](chaves.md).
- Serviços do núcleo pra quem pluga, todos genéricos: `automacao` e `furos` por peça, peça que anda sozinha (`ctx.P.controlado`), alvos fora das peças (`Board.alvo`), itens no menu e na bandeja (`Board.menu`), chaves (`Board.chaves`).
- O app do Claude pode rodar com zoom: o Board converte as coordenadas do host pro pixel da página na entrada e na saída.

### Formas por lado e canto (incluindo o tamanho mínimo)
São das peças, não do Board: cada peça diz o tamanho por forma e degrau. Guias, ímã e fusão com a borda são do núcleo ([board](../../referencias/ambiente/board.md)).

### Interação única de cada forma
Das peças. O núcleo cuida do arrasto, do clique-passa pela forma real e do hover.

### Degraus de tamanho e alça
Das peças (`compacto`, `espiar`, `aberto`).

### Motion
No núcleo: [board-motor](../../referencias/ambiente/board-motor.md).

### Visual
Transparente; o fundo é opcional (o da ponte da Mesa cobre a área de trabalho com papel de parede e abre furo onde há navegador).

## Testado
- Simulador (`modelos/board/teste/`): a API aberta inteira (`await T4.api()`: ver, mover, canto, comando, furo, eventos, remover), os cenários de encaixe e clique do Board, as chaves (o que falta, valor lido, app aberto com a chave).
- App instalado (PC com dois monitores, zoom 1,58): sobe nos dois monitores, permissões (inclusive o "negado" guardado), Dengas, Onda com Spotify, fundo de mesa.
- Não testado no app: o Bloco de Notas das chaves aberto pelo Board, o furo do fundo de mesa com o navegador.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [api-aberta.md](api-aberta.md) | as chamadas que qualquer cliente usa e o que uma peça declara |
| [chaves.md](chaves.md) | as credenciais das integrações: declarar, usar, pedir, onboarding |
| [refinos.md](refinos.md) | o histórico do Board unificado |
