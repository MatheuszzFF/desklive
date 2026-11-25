
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

**How to apply:** incluir em todo app novo desde o início. **Pendente:** implementar isso nos três apps atuais *depois* que terminarem os três agentes de layout por posição e tamanho (sessões orbita-posicao, onda-posicao e eco-posicao) — ele aprovou fazer quando terminarem. Ver [[apps-desktop-encaixe-nas-bordas]], [[setup-windows-apps-artefato]] e [[regras-de-trabalho]].
