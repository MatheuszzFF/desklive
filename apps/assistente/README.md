# Assistente — um cérebro genérico pro Board

> **O que é:** o doc L2 do opcional Assistente. **Quando ler:** antes de pôr um assistente no Board sem o Dengas. Código: [modelos/assistente/](../../modelos/assistente/README.md). Histórico: [refinos](refinos.md).

- **Conteúdo:** nenhum (não tem cara). Conversa com o Claude de quem abriu e usa a [API aberta](../board/api-aberta.md) como ferramentas.
- **Uma função:** dar um cérebro a qualquer corpo (`Board.assistente.perguntar`). Não desenha nada.
- **Atalho / teclado:** não tem.
- **Barramento:** `assistente:respondeu`, `assistente:pronto`.
- **Helpers:** PowerShell por chamada (internet).

## Como é feito

### Estrutura
Ferramentas: `board_mapa`, `board_peca`, `peca_comando`, `agente` (mini agente por peça), `lembrar`, `internet`.

### Formas por lado e canto (incluindo o tamanho mínimo)
Não tem.

### Interação única de cada forma
Não tem.

### Degraus de tamanho e alça
Não tem.

### Motion
Não tem.

### Visual
Não tem.

## Testado
Simulador: ferramentas montadas e mini agente. Não testado no app instalado (o Dengas da Mesa é quem roda hoje).

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [refinos.md](refinos.md) | o histórico |
