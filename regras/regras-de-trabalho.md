
# Regras de trabalho

## Resumo em 5 linhas
0. **REGRA Nº 1 (ele já repetiu 4×, não deixe ele repetir de novo):** todo app se TRANSFORMA conforme o lado, o canto e o tamanho. Cada um tem a sua forma E a sua interação únicas, feitas com cuidado e motion caprichado, no nível mínimo da ilha do topo do Eco. Nunca só se esconder, nunca a mesma peça repetida (R20). Toda sessão delegada recebe isso no resumo.
1. Design "state of the art": transparente, minimalista, motion vivo e calibrado; nada genérico, nada cortado, nada exagerado.
2. Todo movimento (arrastar, posicionar, encaixar) é fluido, com física, e feito com esmero.
3. Teste no ambiente real e em resolução real antes de dizer "pronto"; confira por print.
4. Verifique antes de afirmar uma limitação; quando um caminho pesa ou trava, pare e simplifique.
5. Delegue tarefas paralelas (um agente por app); escreva em português informal e curto, dizendo o custo de cara.
6. "Isso é regra" → grave aqui na hora e consulte este documento antes de toda tarefa (R21).

## Design e visual

### R1 — Transparente, sem caixas
- **Regra:** os apps flutuam soltos na tela (estilo da Onda); nada de painéis opacos. Use vidro leve só onde o texto precisa de leitura.
- **Por quê:** ele quer interfaces que parecem parte da área de trabalho, não janelas.
- **Exemplo:** "eu quero que ele seja full transparente tlgd, tipo um bglh flutuante".
- **Desde:** 2026-11-24 · **Reforçada:** 3× (última 2026-11-24) · **Força:** alta

### R2 — Refinar, não inflar
- **Regra:** ao melhorar um visual, mantenha a base que ele aprovou e refine os detalhes; não aumente animação, espaçamento ou caixas por conta própria.
- **Por quê:** uma "melhoria" que exagerou foi rejeitada e ele pediu a versão anterior de volta.
- **Exemplo:** "forçou muito a animação, espaçamento tbm, a box, era só refinar".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** alta

### R3 — Nada genérico: marcas próprias e vivas
- **Regra:** ícones e identidades são criados com cuidado e têm vida (motion, reação a estado). Sem bolinhas simples, sem ícones de biblioteca e sem reaproveitar logo de terceiros como "solução".
- **Por quê:** ele rejeitou o orbe genérico, o ícone do Claude parado e a "bolinha".
- **Exemplo:** "e isso ser uma bolinha ta ruim demais".
- **Desde:** 2026-11-24 · **Reforçada:** 3× · **Força:** alta

### R4 — Brilhos e sombras nunca cortados
- **Regra:** em janelas transparentes, todo brilho, sombra e penumbra precisa caber dentro da janela e sumir antes da borda; o Windows corta o resto em linha reta.
- **Por quê:** os cortes retos apareceram duas vezes (o brilho da capa da Onda e a penumbra do Eco).
- **Exemplo:** "ta vazando a iluminação ali e parecendo que ta cortado".
- **Desde:** 2026-11-24 · **Reforçada:** 2× · **Força:** alta

### R5 — Alinhamento perfeito
- **Regra:** alinhe ícones, textos e botões em grade exata e meça (getBoundingClientRect) antes de publicar.
- **Por quê:** ele nota desalinhamentos pequenos, como o ícone de pause fora do centro.
- **Exemplo:** "tem que ficar perfeito ali a UI".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** média

### R6 — Pesquisar referências quando o pedido é "state of the art"
- **Regra:** antes de redesenhar algo pedido como "state of the art", pesquise as tendências atuais e cite de onde tirou as ideias.
- **Por quê:** ele pediu pesquisa explicitamente e gostou do resultado baseado nela.
- **Exemplo:** "vai pesquisar motion 2026 vai, e quero algo mais vivo".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** média

## Motion e interação

### R7 — Movimento fluido e com física, feito com esmero
- **Regra:** arrastar e reposicionar apps tem mola, embalo e assentamento suave, sem pulo seco nem tremida, inclusive entre monitores. Isso vale também para encaixar, desencaixar, expandir, recolher e trocar de tela.
- **Por quê:** ele pediu fluidez no arrasto e no posicionamento, com cuidado.
- **Exemplo:** "é pra ser feito com esmero".
- **Desde:** 2026-11-24 · **Reforçada:** 4× (última 2026-11-24, "com motion extra cuidadoso") · **Força:** alta

### R8 — Layout por posição e por tamanho, com bordas e cantos próprios
- **Regra:** todo app de desktop novo muda de layout de verdade conforme o lado da tela (coluna nas laterais, abre pra dentro da tela, topo especial) e conforme o tamanho (degraus ao redimensionar). Cada combinação de posição × tamanho tem comportamento próprio nas bordas e nos cantos, movimento com física e muito polimento (detalhes em [[apps-desktop-encaixe-nas-bordas]]).
- **Por quê:** pedido explícito pra todos os apps futuros; ele rejeitou a leitura de "só esconder numa aba na borda".
- **Exemplo:** "pra cada layout tem que ter um tipo de comportamento nos cantos, movimentos e etc. isso também é regra de desenvolvimento de qualquer app".
- **Desde:** 2026-11-24 · **Reforçada:** 3× · **Força:** alta

### R20 — A ilha do topo do Eco é o padrão MÍNIMO, em todos os lados
- **Regra:** em toda borda e todo canto, o app se FUNDE à borda da tela (ombros côncavos ligando a forma à borda), cresce a partir dela num layout próprio daquele lado e se descola como líquido ao ser puxado pra longe. Isso vale pra todos os apps, todos os lados, cantos e tamanhos, com o mesmo acabamento da ilha do topo do Eco (v12). "Só se esconder numa aba" é inaceitável. E cada lado tem uma FORMA DIFERENTE, não a mesma peça fundida em outro lugar nem só girada: por exemplo, a Onda na direita vira coluna vertical, no topo vira letreiro e no canto vira quarto de disco. Na troca de lado, uma forma se transforma na outra com motion ("não quero preguiça de fazer interatividade"). A INTERAÇÃO também é única por lado: como reage ao mouse, como abre, o gesto e o micro-movimento, nada genérico copiado ("a interatividade é pra ser unica"). Refinar o que ele aprovou em vez de refazer do zero; as sugestões são ponto de partida, não receita. Antes de publicar, mostrar prints de cada lado e canto (em repouso, com o mouse em cima e aberto).
- **Por quê:** ele aprovou a ilha do topo e rejeitou os outros lados, que só escondiam o app.
- **Exemplo:** "ISSO AQUI É O MINIMO DE QUALIDADE QUE TEM QUE TER ... em todos os lados ... do resto dos lados ele tipo só se esconde tlgd. mó lixo ... STATE OF ART. isso é regra".
- **Desde:** 2026-11-24 · **Reforçada:** 4× · **Força:** máxima

### R18 — Os apps conversam e interagem entre si
- **Regra:** todo app novo entra no barramento ~/.orbita (publica o próprio estado e lê o dos outros) e interage com os outros: grudar um no outro, desviar em vez de sobrepor, arrastar coisas de um pro outro, reagir juntos (cor, batida, "pensando"), aceitar comandos do Eco e respeitar modos (foco, jogo, tela cheia) (detalhes em [[apps-interagem-entre-si]]).
- **Por quê:** pedido explícito, valendo como regra de desenvolvimento.
- **Exemplo:** "simm!! faz tbm isso ... e isso é regra tbm em".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** alta

### R9 — Janela do tamanho do conteúdo
- **Regra:** a janela de um app flutuante acompanha o que está visível e cresce pro lado com espaço; nunca deixe área invisível impedindo de encostar no topo ou nos cantos.
- **Por quê:** a Onda e depois o Eco não chegavam ao topo da tela por causa da janela alta.
- **Exemplo:** "não consigo colar lá encima o player".
- **Desde:** 2026-11-24 · **Reforçada:** 2× · **Força:** alta

## Como executar e testar

### R10 — Testar de verdade antes de dizer "pronto"
- **Regra:** confira o visual em resolução real (Chrome dele via localhost, ou print da tela) e, quando possível, o comportamento no app instalado. Diga claramente o que não foi testado.
- **Por quê:** vários bugs só apareceram no app instalado (a transparência, o corte da janela, a voz).
- **Exemplo:** "ta todo bugado o layout do voice".
- **Desde:** 2026-11-24 · **Reforçada:** 4× (última 2026-11-24, "o botão de parar não para") · **Força:** alta

### R11 — Verificar antes de afirmar uma limitação
- **Regra:** antes de dizer "não dá" ou "você não tem permissão", confira a documentação ou o sistema. Quando ele mandar um link ou um print, leia de verdade e responda sobre aquilo, sem puxar um assunto vizinho.
- **Por quê:** o Claude errou ao dizer que artefatos não viravam apps e que a conta dele não era administradora; e ele mandou o aviso do Spotify pedindo pra conferir certinho.
- **Exemplo:** "confere certinho se vc n ta caçando assunto errado".
- **Desde:** 2026-11-24 · **Reforçada:** 3× (última 2026-11-24) · **Força:** alta

### R12 — Se pesar ou complicar, parar e simplificar
- **Regra:** quando uma solução trava o PC ou vira uma cadeia longa de contornos, pare, explique e ofereça o caminho mais simples; aceite quando ele cortar o escopo.
- **Por quê:** o Whisper local travou o PC e ele preferiu deixar a voz de lado.
- **Exemplo:** "deixa sem a parte de audio por enquanto".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** média

### R13 — Fazer por ele quando ele pede
- **Regra:** quando ele diz "faz tudo" ou "confere no meu PC", execute você mesmo, usando o navegador dele, prints e comandos, dentro dos limites de segurança, em vez de passar instruções.
- **Por quê:** ele prefere resultado a tutorial.
- **Exemplo:** "faz tudo aipra mim po agora".
- **Desde:** 2026-11-24 · **Reforçada:** 2× · **Força:** média

## Comunicação

### R14 — Português informal, curto e com as escolhas claras
- **Regra:** responda em português informal; quando houver escolha (custo, segurança, opções), mostre as opções com o impacto prático e uma recomendação. Ao propor qualquer API, modelo ou serviço, diga logo de cara se tem custo e de onde sai (plano do Claude, grátis, pago por uso), sem esperar ele perguntar.
- **Por quê:** ele decide rápido quando entende a troca, e perguntou do custo em quase toda proposta (Claude nos apps, API do Spotify, Whisper).
- **Exemplo:** "tem custo?" · "mas esse é de graça?" · "oq muda se tirar essa trava ai".
- **Desde:** 2026-11-24 · **Reforçada:** 4× (última 2026-11-24) · **Força:** alta

### R21 — Salvar as regras na hora e consultá-las sempre
- **Regra:** quando ele disser "isso é regra" ou pedir algo pra "todos os apps daqui pra frente", grave na memória (este documento) na mesma hora e confirme em uma linha. No começo de toda tarefa, leia este documento; ao delegar, copie as regras que valem pra tarefa no resumo da sessão nova. Ele não deve precisar repetir uma regra.
- **Por quê:** ele cobrou se as memórias estavam sendo salvas e consultadas, e se irritou por ter repetido a mesma regra 3 ou 4 vezes.
- **Exemplo:** "isso é regra e eu ja falei 3 ou 4 vezes".
- **Desde:** 2026-11-24 · **Reforçada:** 2× (última 2026-11-24) · **Força:** máxima

## Delegar e sessões

### R15 — Delegar tarefas paralelas
- **Regra:** pedidos independentes (como achar um wallpaper ou um recurso novo grande) vão pra outra sessão, com um bom resumo; ajustes posteriores vão pra sessão que já tem o contexto. Trabalho que mexe em vários apps vira um agente por app (Órbita, Onda, Eco), e a sessão principal revisa os prints de cada um antes de mostrar pra ele.
- **Por quê:** ele pediu explicitamente, e depois pediu um agente por app pra trabalhar com cuidado.
- **Exemplo:** "delega essas tarefas bixo" · "um agent por app".
- **Desde:** 2026-11-24 · **Reforçada:** 3× (última 2026-11-24) · **Força:** alta

## Apps de desktop

### R16 — Uma função, um app
- **Regra:** cada função grande vira um app separado que a barra só aciona (música → Onda, Claude → Eco); a Órbita não acumula funções.
- **Por quê:** ele pediu a música fora da Órbita e depois o Claude fora dela também.
- **Exemplo:** "Melhor, n faz dentro da orbita, ele so acessa. Que nem o Spotify".
- **Desde:** 2026-11-24 · **Reforçada:** 4× (última 2026-11-24: "o eco não é pra ta com os outros apps dentro dele") · **Força:** alta

### R19 — Nunca controlar o mouse e o teclado do PC dele
- **Regra:** não usar computer use nem mexer no mouse e no teclado da área de trabalho real; testar só no Chrome via localhost, com ganchos de teste e prints. O que só dá pra testar no app instalado fica marcado como "não testado". Toda sessão delegada recebe essa regra no resumo.
- **Por quê:** um agente mexeu no mouse enquanto ele usava o PC e bugou tudo.
- **Exemplo:** "o cara ta tentando mexer aqui no meu pc e bugando tudo kkk com o mouse, não é pra mexer no pc".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** alta

### R22 — Todo refino de app é documentado no desklive
- **Regra:** sempre que um app for criado ou refinado (forma, interação, motion, visual, motor), atualize na mesma tarefa `C:\Users\mathe\desklive` (`apps/<app>.md`, `padroes/motion.md` e os outros padrões), com os números reais. Depois faça commit e push. Só a receita, nunca o código. Antes do push, confira que não há segredos nem dados pessoais (o repo é público). Toda sessão delegada que mexe em app recebe essa regra no resumo.
- **Por quê:** ele quer o repo como o livro de receitas vivo do projeto ([[desklive-repo-documentacao]]).
- **Exemplo:** "sempre que refinarmos apps, documentamos lá".
- **Desde:** 2026-11-25 · **Reforçada:** 1× · **Força:** alta

## Segurança e permissões

### R17 — Não desligar proteções por ele
- **Regra:** quando algo esbarra numa proteção do Windows (Controle Inteligente de Aplicativos, privacidade de fala), explique o que muda e deixe ele decidir; prefira um caminho que não enfraqueça a segurança.
- **Por quê:** ele escolheu manter a proteção quando entendeu a troca.
- **Exemplo:** "vamos tentar o caminho 2".
- **Desde:** 2026-11-24 · **Reforçada:** 1× · **Força:** média

## Histórico de mudanças
- **2026-11-24:** documento criado a partir da conversa de montagem da Órbita, da Onda e do Eco (R1–R17).
- **2026-11-24:** R8 ampliada (layout por posição e por tamanho, bordas e cantos por layout); R18 criada (apps interagem entre si).
- **2026-11-24:** R19 criada (não mexer no mouse e no teclado do PC); R20 criada e ampliada (ilha do topo do Eco como padrão mínimo, forma e interação únicas por lado).
- **2026-11-25 (dreamer, 1ª execução):** lidas 7 conversas de 22 a 24/11 (a principal da Órbita, Onda e Eco, as três sessões de agente por app que copiam o mesmo histórico, a do wallpaper e duas curtas). Nova: R21 (salvar as regras na hora e consultá-las sempre). Refinadas: R11 (ler o link ou print que ele manda, sem desviar do assunto), R14 (dizer o custo logo de cara, força subiu pra alta), R15 (um agente por app, com revisão dos prints). Reforçadas: R7, R10 e R16 (4× cada). Nenhuma removida.
