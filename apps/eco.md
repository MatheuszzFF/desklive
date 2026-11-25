# Eco — assistente

- **Conteúdo:** forma líquida em WebGL (com alternativa em 2D), campo de pergunta, atalhos, conversa. No degrau grande aparece o histórico de conversas. A interface é **só do Eco**: sem cartão de música e sem painel do PC.
- **Ferramentas:** abrir apps e pastas, controlar a música (pela Onda), ver o status do PC e os discos, pesquisar na web. O modelo é Claude Haiku 5.5, pela capability `sample`.
- **Formas por lado** ([padrão](../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Topo:** a ilha, fundida à borda e inclinando pro lado do mouse. É o padrão mínimo de qualidade dos apps.
  - **Laterais:** uma espinha que se desenrola atrás do mouse e vira uma folha alta.
  - **Embaixo:** uma barra de comando, com uma luz correndo atrás do mouse.
  - **Cantos:** um arco de sugestões que gira até o mouse.
- **Voz:** desligada (`VOICE=false`). O ditado não funciona em janelas de app, e o whisper.cpp é bloqueado pelo Smart App Control.
- **Barramento:** publica `eco.json`.
