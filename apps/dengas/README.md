# Dengas — o ratinho assistente

> **O que é:** o doc L2 do Dengas. **Quando ler:** antes de mexer no Dengas (corpo, conversa, ferramentas). Comum a todos: [padroes/](../../padroes/README.md). Histórico: [refinos](refinos.md). Código: [modelos/dengas/](../../modelos/dengas/README.md).

- **Conteúdo:** um ratinho de pixel que mora por cima do quadro, anda em 8 direções, senta, olha o ponteiro, fala em balão e abre a conversa num clique.
- **Uma função:** ser o assistente da casa: conversa com o Claude de quem abriu (sem chave de API) e usa como ferramentas tudo o que os apps mostram e aceitam. Ele não tem dados próprios nem guarda credencial.
- **Atalho / teclado:** a conversa abre no clique; Esc fecha.
- **Barramento:** usa o objeto `Mesa` (no Board, a ponte [mesa](../mesa/README.md)); fala o que chega em `mesa:aviso`.
- **Helpers:** PowerShell por chamada (internet: pesquisar, imagens, ler página).

## Como é feito

### Estrutura
- Um `dengas.js` com o sprite (atlas 96 × 96 em `arte/`), a conversa (balão, painel com mensagens, chips e pílula) e o cérebro (regras, ferramentas, mini agente por app).
- Ferramentas: estado e mexer nos widgets, comando de qualquer app, agente por app, aparência e papel de parede, internet, conectores do Claude (e-mail, agenda, arquivos, música), documento, lembrar, abrir site.
- No Board, entra pelo `board.js` da pasta dele, depois da ponte, e só no Board principal.

### Formas por lado e canto (incluindo o tamanho mínimo)
Ainda não: no Board ele é uma camada livre por cima das peças, não uma peça. Encaixe em lado e canto do Board fica pra depois.

### Interação única de cada forma
- **Solto:** anda sozinho, olha o ponteiro, coça a orelha, senta depois de parar; arrastar pega ele e solta onde for.

### Degraus de tamanho e alça
Ainda não.

### Motion
Clipes do atlas (correr em 8 direções, descer pra quatro patas, sentar, falar, pensar), passos de 150 px/s.

### Visual
Pelo preto, focinho preto, nariz rosa, orelhas e patas marrons, cachecol coral. A conversa é a pílula de vidro da Mesa.

## Testado
- Simulador do Board: um Dengas só (no principal), clique e campo da conversa pegando o mouse.
- App instalado: conversa, papel de parede, Onda tocando a faixa exata.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [refinos.md](refinos.md) | o histórico |
