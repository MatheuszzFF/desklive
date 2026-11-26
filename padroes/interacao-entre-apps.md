# Interação entre apps

Todo app de desktop novo participa do barramento em ~/.orbita (cada app publica `<app>.json` com estado + posição/tamanho + heartbeat; comandos por pasta `<app>-cmd/`, escritos como tmp e depois rename) e interage com os outros:
- **Grudar:** arrastar um app até o outro encaixa como módulo (ex.: a Onda na Órbita) e os dois andam juntos; puxar pra fora separa.
- **Não sobrepor:** quando um app chega perto, o outro desliza pro lado com mola.
- **Arrastar entre apps:** como cada janela é separada, simula-se pelo barramento (a origem publica "arrastando X em tal ponto" e o destino acende quando passa por cima). Ex.: soltar a capa da música no Eco.
- **Reagir juntos:** o "pensando" do Eco, a cor da capa e a batida da música aparecem nos outros, de leve (só como reflexo de cor e luz).
- **Nunca embutir um app no outro:** a interface de cada app é só dele. O Eco não mostra cartão de música nem painel do PC no layout (ele rejeitou isso em 24/11/2026: "É só ele"). Os apps interagem por comandos e reações, não colando conteúdo um no outro (ver também a R16 "uma função, um app").
- **Comandos cruzados:** o Eco reorganiza, esconde e redimensiona os outros ("organiza tudo no topo").
- **Modos:** foco, jogo e música reorganizam tudo; a tela cheia esconde os apps.
- Limite: o barramento por arquivos leva ~100–300 ms. Serve pra estado e comandos, não pra animação sincronizada quadro a quadro.

**Why:** ele pediu em 24/11/2026: "simm!! faz tbm isso ... e isso é regra tbm em".

**How to apply:** incluir em todo app novo desde o início. **Pendente:** implementar isso nos três apps atuais *depois* que terminarem os três agentes de layout por posição e tamanho (sessões orbita-posicao, onda-posicao e eco-posicao) — ele aprovou fazer quando terminarem. Ver [layout por posição e tamanho](layout-posicao-e-tamanho.md), o setup do Windows (privado) e [regras de trabalho](../regras/regras-de-trabalho.md).

**Board (ideia dele, 25/11/2026):** em vez de uma janela por app, um "Board": uma janela transparente, sempre no topo, do tamanho do monitor (uma por monitor), com todos os apps como peças movidas só por CSS. Fundo animado à parte, como papel de parede HTML no Wallpaper Engine. A primeira etapa é uma sonda do Board pra medir clique-passa, tela cheia, oclusão e GPU; se passar, a Onda vira a primeira peça (R24). Doc: desklive `referencias/ambiente/board.md`. **Requisito:** funcionar com QUANTOS monitores a pessoa tiver, em qualquer arranjo, escala ou DPI, com monitores entrando e saindo em tempo real e peças passando entre eles sem piscar. As emendas contam como borda e canto. Tudo dentro do Board: um app só, com as peças independentes no código. **Clique e camadas (pedido dele):** só os mini apps (as peças) são interagíveis. Fora deles, todo clique, hover e scroll chega nos apps de baixo, como se o Board não existisse, e o clique-passa nunca fica preso. Guias, prévias e fundo são `pointer-events:none`. Zero bug de z-index: balões e menus numa camada raiz por cima de tudo, e a peça arrastada ou clicada por cima das outras.

**Piloto (25/11/2026, R24):** a ONDA é o app piloto. As receitas do pesquisador do ambiente (referencias/ambiente/ no desklive) entram primeiro nela, ele valida no app instalado e só depois vão pra Órbita e pro Eco.

**Fila de trabalho (25/11/2026):** a sessão do motor de movimento está mexendo nos três fontes. Quando ela terminar: (1) refinar os tamanhos mínimos dos três apps, únicos por lado e canto e interativos (EM ANDAMENTO nas sessões de layout); (1b) depois, a sessão do motor diagnostica o travamento no arrasto ("bate numa parede", "trava frame"; suspeitos: a trava da tela na emenda dos monitores ou perto da borda e a espera de até 160 ms pelo resize); (2) depois, a interação entre os apps (o cartão "Interação entre Órbita, Onda e Eco").
