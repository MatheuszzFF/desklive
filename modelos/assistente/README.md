# Assistente (opcional)

O cérebro de um Board: conversa com o Claude de quem abriu (capacidade `sample` do artefato, sem chave de API) e usa a API aberta do Board como ferramentas. Não tem cara; um corpo (como o [Dengas](../dengas/)) usa `Board.assistente`.

- `Board.assistente.configurar({ nome, persona, modelo })`, `perguntar(texto, { onText })` → `{ text, atos }`, `parar()`, `disponivel()`.
- **Ferramentas:** `board_mapa`, `board_peca` (mostrar, esconder, mover, degrau), `peca_comando`, `agente`, `lembrar` e, com `full-access`, `internet` (pesquisar, imagens do Wikimedia Commons, ler página, tudo pelo PowerShell).
- **Mini agentes:** `agente(id, pedido)` faz outra chamada ao Claude com as `regras` e os `comandos` da peça (mais `caixa`, pra ela se mover) e devolve o resultado. Qualquer peça com `automacao` ganha agente sem código a mais.
- **Publicar:** declarar `capabilities: { desktop:{}, sample:{} }` (e `mcp` com os conectores de quem publica, quando houver ferramenta pra eles). Sem este opcional, o Board não pede o Claude.
- Memória curta (gostos anotados com `lembrar`) fica no `localStorage` do artefato.

Contexto: [apps/assistente/](../../apps/assistente/README.md). Ainda não veio da Mesa: conectores (`mcp`), criar documento e criar peça em tempo real pelo assistente.
