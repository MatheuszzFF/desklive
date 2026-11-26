# Layout por posição e tamanho

Todo app novo (artefato instalado como app de desktop) já nasce com estes comportamentos, sem ele precisar pedir:
- **Layout por posição:** o design se reorganiza de verdade conforme o lado da tela (a barra vira coluna nas laterais, o conteúdo abre sempre pra dentro da tela, o topo pode ter um layout especial). Não é só a mesma UI empurrada até a borda nem só esconder numa aba.
- **Layout por tamanho:** ao redimensionar (alça discreta), troca de layout em degraus (mínimo/compacto/grande), com transição animada.
- **Posição × tamanho combinam:** cada degrau de tamanho tem a sua versão em cada posição, com comportamento próprio nas bordas e nos cantos (como encosta, como se abre, como reage ao mouse e ao arrasto).
- **Movimento com física:** arrasto que segue o mouse com mola, continua no embalo ao soltar, encaixa com mola e se transforma enquanto você arrasta (sente o lado antes de encostar). Nenhuma mudança dá pulo seco.
- Lembra posição, tamanho e monitor entre aberturas; a janela tem o tamanho do conteúdo (pra chegar em qualquer borda); transparente, deixando o clique passar fora da parte visível; brilhos sempre dentro da janela (o Windows corta o resto).

Fato técnico (verificado em 24/11/2026): o app de desktop prende a janela dentro da tela, então uma área transparente fixa maior que o app impede de encostar nos cantos. A janela tem o tamanho do conteúdo, com a margem do brilho só do lado de dentro e rente do lado da borda. Pra não tremer na transição, ela cresce até cobrir o tamanho de antes e o de depois e encolhe no fim.

**Emenda entre monitores = borda e canto (pedido dele, 25/11/2026):** a divisão entre dois monitores conta como borda de cada monitor, e as pontas dela, em cima e embaixo, contam como cantos. O app gruda, funde e muda de forma ali como numa borda externa. Atravessar continua possível, empurrando além do limiar ou passando com velocidade. Cada monitor tem as suas 4 bordas e 4 cantos, cada um com a sua área útil (a trava do host também é por monitor).

**Why:** pedidos explícitos dele em 24/11/2026: "todos os apps que fizermos daqui pra frente vão ter esses comportamentos de interatividade com a posição"; "quando ele for para alguma posição, o design dele realmente deve se adaptar ao lado"; e "pra cada layout tem que ter um tipo de comportamento nos cantos, movimentos e etc. isso também é regra de desenvolvimento de qualquer app, precisa ser mt bem polido". Ele já rejeitou a leitura errada de que isso era só esconder o app numa aba na borda.

**How to apply:** incluir tudo isso desde a primeira versão de qualquer app de desktop novo e testar cada combinação de posição × tamanho com prints antes de publicar. Ver o setup do Windows (privado) e [design](design.md).
