# Onda — player do Spotify

> **O que é:** o doc L2 da Onda, o player do Spotify com a onda que reage ao som. **Quando ler:** antes de criar, refinar ou depurar qualquer coisa da Onda. O comum a todos os apps está em [padroes/](../../padroes/README.md); aqui fica a visão geral e os links pros detalhes (tabela no fim). Pra fazer um app parecido, leia nessa ordem: este arquivo → [formas e degraus](formas-e-degraus.md) → [interação](interacao.md) → [onda e cor](onda-e-cor.md).

- **Conteúdo:** capa (o brilho usa as cores dela), título e artista, uma onda que reage ao áudio real, controles. Quatro degraus de tamanho: mínima, compacta, expandida e grande, que mostra a fila e as últimas tocadas.
- **Formas por lado** ([padrão](../../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Laterais:** coluna vertical, com o nome em pé e a onda em barras. Deslizar ao longo dela ajusta o progresso.
  - **Topo:** faixa com a onda como horizonte. A rodinha do mouse avança ou volta 5 s.
  - **Embaixo:** prateleira com o equalizador subindo da borda. Clicar ou arrastar pula na música.
  - **Cantos:** quarto de disco. Girar a capa como um vinil anda na música.
  - **Solta:** o player flutuante (linha, expandida, grande).
- **Spotify:** Web API com PKCE (app no Spotify for Developers, em modo de desenvolvimento). Busca, tocar, fila e playlists.
- **Barramento:** publica `musica.json` e aceita comandos em `musica-cmd/` (inclusive `posicao` e `tamanho`).
- **Ajudantes:** `musica-helper.ps1`, `meter.ps1`, `spotify-auth.ps1` ([arquitetura](../../padroes/arquitetura.md)).

## Como é feito (resumo)

A linguagem de movimento comum está em [padroes/motion](../../padroes/motion/README.md); o motor da janela, em [referencias/motor](../../referencias/motor/README.md).
- **Peças em molas:** onze peças absolutas medidas a partir da capa compacta (a âncora), cada uma com posição, tamanho, opacidade e raio em molas. Um arranjo é uma tabela de retângulos; trocar de lado ou de degrau só muda os alvos → [formas e degraus](formas-e-degraus.md).
- **Janela do tamanho do app:** âncora + caixa `LR` (o que se vê + 48 px de brilho, 16 px do lado encostado), cortada na tela contra o destino, com teto de ~60 % × ~70 % da área útil → [formas e degraus](formas-e-degraus.md#teto-de-tamanho).
- **Colar e descolar:** a zona sente a borda a 90 px e só solta a 130 px (histerese de 40 px); o corpo fundido (ombros côncavos, pescoço líquido de até 60 px) é desenhado num canvas atrás do player → [fusão com a borda](../../padroes/motion/fusao-com-a-borda.md). **Medido (v18):** chegando e saindo da borda em zigue-zague em volta do limiar (300 → 85 → 128 → 88 → 140 → 300 px), a forma troca **exatamente 2 vezes** (linha → coluna → linha), sem piscar.
- **Interação e hover:** gesto próprio por forma, hover com histerese, efeitos de toque pequenos e com mola → [interação](interacao.md).

## Testado

O teste é no simulador `onda-sim.html` (localhost, gancho `window.__onda`, janela presa dentro da tela como no app real), nunca no mouse do PC (R19).
- **v19 (motor v2.2), a 1920 × 1080:** troca de degrau com a janela no máx. 597 px (55 %), já com a união de antes + depois; 16 arrastos numa aba visível chegam a ≤ 1 px e assentam em 57–1250 ms; zigue-zague no limiar com 2 trocas. **Meça numa aba visível:** com o painel escondido, o relógio de animação quase para e tudo parece lento.
- **v18, a 1920 × 1080:** os 4 degraus soltos e em cada borda (20 casos) assentam em 0,8–1,9 s, todos dentro do teto; arrastar a partir do centro pra esquerda, direita, cima e baixo em todos os degraus (16 casos) chega exatamente no ponto pedido, com a janela dentro da tela; colar e descolar perto do limiar troca a forma só 2 vezes.
- **v17:** quarto de disco proporcional, aro de pega, clique no vinil pausa sem trocar de degrau, giro sem mover, hover da tira mínima sem piscar. **v16:** 11 cliques reais (capa, play, alça, coluna, vinil, fio). **v14 e antes:** o mínimo de cada borda, as formas grandes e as 32 combinações de degrau × borda/canto encostando a 4–16 px da borda.
- **Não testado:** tudo no app instalado (60 fps reais, se a capa escondida atrás da borda aparece certinha deslizando, Spotify de verdade na fila), monitores com DPI misto.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [formas-e-degraus.md](formas-e-degraus.md) | estrutura em molas, tabela forma × degrau com os tamanhos, quarto de disco, teto de tamanho, alça |
| [interacao.md](interacao.md) | gesto de cada forma, hover e "clique passa", tabela de efeitos de hover e toque |
| [onda-e-cor.md](onda-e-cor.md) | L3: a onda que reage ao som (nível, camadas, envelope, barras, arco) e a cor tirada da capa |
| [visual.md](visual.md) | halo, capa, texto, nome em pé, botões, ícone, ritmo de leitura |
| [refinos.md](refinos.md) | registro de cada refino, com data e números |
