# Board — refinos

> Histórico do Board unificado (Board do Matheus como base + Mesa por cima), no ramo `unifica`. O Board v1 e v2 estão no [diário](../../diario/2026-11.md).

## 2026-11-27 · Unificação Board + Mesa
- **Pedido:** uma arquitetura só. O Board é a base: um quadro vazio e completamente interativo que qualquer pessoa customiza; nada fixo em volta de um assistente.
- **O que:** API aberta no núcleo (ver, mexer, dados, criar, ouvir), `automacao` e `furos` por peça, opcionais na montagem (`-Pecas`), alvos fora das peças, menu extensível, chaves centralizadas. A Mesa entrou por uma ponte (`modelos/mesa/board.js`): o Dengas, a Onda, a Órbita e o navegador rodam com o mesmo código.
- **Achados no app instalado:** zoom da página (1,58) diferente da escala do host, objetos do host congelados (um `Proxy` quebra), cada versão publicada volta as permissões pra pendente, e um "não permitir" do acesso total fica guardado entre versões.
- **Testado:** simulador (API, encaixe, chaves) e o app instalado (permissões, Dengas, Onda tocando a faixa exata).

## 2026-11-27 · Cada app na sua pasta
- **O que:** o código de cada app que vive no Board foi pra pasta dele (`modelos/dengas`, `modelos/navegador`, `modelos/assistente`, `modelos/onda/board.js`, `modelos/orbita/board.js`, `modelos/mesa/board.js`), com o contexto em `apps/<app>/`. A montagem dos opcionais virou uma só (`Resolve-Marcadores` em `modelos/compartilhado/montagem.ps1`), usada pelo Board e pela Mesa.
