# Onda — player do Spotify

- **Conteúdo:** capa (o brilho usa as cores dela), título e artista, uma onda que reage ao áudio real, controles. Quatro degraus de tamanho: mínima, compacta, expandida e grande, que mostra a fila e as últimas tocadas.
- **Formas por lado** ([padrão](../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Laterais:** coluna vertical, com o nome em pé e a onda em barras. Deslizar ao longo dela ajusta o progresso.
  - **Topo:** faixa com a onda como horizonte. A rodinha do mouse avança ou volta 5 s.
  - **Embaixo:** prateleira com o equalizador subindo da borda. Clicar ou arrastar pula na música.
  - **Cantos:** quarto de disco. Girar a capa como um vinil anda na música.
- **Spotify:** Web API com PKCE (app no Spotify for Developers, em modo de desenvolvimento). Busca, tocar, fila e playlists.
- **Barramento:** publica `musica.json` e aceita comandos em `musica-cmd/` (inclusive `posicao`).
- **Ajudantes:** `musica-helper.ps1`, `meter.ps1`, `spotify-auth.ps1`.
