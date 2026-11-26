# Dengas (opcional)

Um ratinho de pixel que mora no Board como uma peça comum. **Arquivos:** `dengas.js`, `dengas-atlas.png` e `dengas-atlas.json` (a arte: quadros de 96 × 96, pé em (48, 88)).

- **Peça normal:** o Board cuida do arrasto, das guias, do encaixe em bordas, cantos e emendas e do passe entre monitores. Fundido num lado ou canto ele senta; solto, anda sozinho pros espaços livres do quadro (`Board.espacoLivre`) a cada 18–40 s, só quando está quieto.
- **Conversa:** um clique abre (degrau `aberto`, 460 × 620); outro clique, ou Esc, recolhe. Quem responde é o opcional [assistente](../assistente/); o Dengas só se configura nele (`nome` e `persona`). Sem o assistente, ele avisa que não tem cérebro.
- **Balão:** fala sozinho quando encaixa num canto ou quando uma peça aparece (no máximo uma vez a cada 25 s), e mostra a resposta quando a conversa está fechada.
- **Automação:** `ver()` (andando, sentado, pensando, últimos destinos), comandos `falar(texto)` e `ir(x, y)`.

Montar: `build.ps1 -Pecas assistente,dengas`.
