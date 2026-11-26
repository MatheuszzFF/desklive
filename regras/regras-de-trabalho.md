
# Regras de trabalho

## Resumo em 5 linhas
0. **REGRA Nº 1 (ele já repetiu 4×, não deixe ele repetir de novo):** todo app se TRANSFORMA conforme o lado, o canto e o tamanho. Cada um tem a sua forma E a sua interação únicas, feitas com cuidado e motion caprichado, no nível mínimo da ilha do topo do Eco. Nunca só se esconder, nunca a mesma peça repetida (R20). Toda sessão delegada recebe isso no resumo.
0b. **NADA PISCA (R25):** nenhuma largura, altura, posição ou visibilidade muda sem transição suave. Se QUALQUER coisa piscar, sumir por um quadro, pular ou tremer, a experiência está arruinada. Esconder quadro, trocar layout de uma vez ou deixar a janela e o CSS se ajustarem em quadros diferentes é proibido; congele, faça crossfade ou anime.
1. Design "state of the art": transparente, minimalista, motion vivo e calibrado; nada genérico, nada cortado, nada exagerado.
2. Todo movimento (arrastar, posicionar, encaixar) é fluido, com física, e feito com esmero.
3. Teste no ambiente real e em resolução real antes de dizer "pronto"; confira por print.
4. Verifique antes de afirmar uma limitação; quando um caminho pesa ou trava, pare e simplifique.
5. Delegue tarefas paralelas (um agente por app); escreva em português informal e curto, dizendo o custo de cara.
5b. **Pediu, faz (R28):** quando ele pede algo concreto, construa; não empilhe propostas, sondas e perguntas antes. E não infle o que ele só explicou (R27).
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
- **Desde:** 2026-11-24 · **Reforçada:** 6× (última 2026-11-25, "state of art bem fluido e sem bug" · "controle ... extremamente fino") · **Força:** alta

### R8 — Layout por posição e por tamanho, com bordas e cantos próprios
- **Regra:** todo app de desktop novo muda de layout de verdade conforme o lado da tela (coluna nas laterais, abre pra dentro da tela, topo especial) e conforme o tamanho (degraus ao redimensionar). Cada combinação de posição × tamanho tem comportamento próprio nas bordas e nos cantos, movimento com física e muito polimento (detalhes em [layout por posição e tamanho](../padroes/layout-posicao-e-tamanho.md)).
- **Por quê:** pedido explícito pra todos os apps futuros; ele rejeitou a leitura de "só esconder numa aba na borda".
- **Exemplo:** "pra cada layout tem que ter um tipo de comportamento nos cantos, movimentos e etc. isso também é regra de desenvolvimento de qualquer app".
- **Desde:** 2026-11-24 · **Reforçada:** 3× · **Força:** alta

### R20 — A ilha do topo do Eco é o padrão MÍNIMO, em todos os lados
- **Regra:** em toda borda e todo canto, o app se FUNDE à borda da tela (ombros côncavos ligando a forma à borda), cresce a partir dela num layout próprio daquele lado e se descola como líquido ao ser puxado pra longe. Isso vale pra todos os apps, todos os lados, cantos e tamanhos, com o mesmo acabamento da ilha do topo do Eco (v12). "Só se esconder numa aba" é inaceitável. E cada lado tem uma FORMA DIFERENTE, não a mesma peça fundida em outro lugar nem só girada: por exemplo, a Onda na direita vira coluna vertical, no topo vira letreiro e no canto vira quarto de disco. Na troca de lado, uma forma se transforma na outra com motion ("não quero preguiça de fazer interatividade"). A INTERAÇÃO também é única por lado: como reage ao mouse, como abre, o gesto e o micro-movimento, nada genérico copiado ("a interatividade é pra ser unica"). Refinar o que ele aprovou em vez de refazer do zero; as sugestões são ponto de partida, não receita. O TAMANHO MÍNIMO de cada app também é trabalhado com o mesmo capricho: único em cada lado e canto, interativo e vivo, nunca uma versão encolhida e pobre ("os tamanhos minimos dos apps precisam ser trabalhados bem feito também"). Antes de publicar, mostrar prints de cada lado e canto (em repouso, com o mouse em cima e aberto).
- **Por quê:** ele aprovou a ilha do topo e rejeitou os outros lados, que só escondiam o app.
- **Exemplo:** "ISSO AQUI É O MINIMO DE QUALIDADE QUE TEM QUE TER ... em todos os lados ... do resto dos lados ele tipo só se esconde tlgd. mó lixo ... STATE OF ART. isso é regra".
- **Desde:** 2026-11-24 · **Reforçada:** 5× (última 2026-11-25, tamanhos mínimos únicos e interativos) · **Força:** máxima

### R18 — Os apps conversam e interagem entre si
- **Regra:** todo app novo entra no barramento ~/.orbita (publica o próprio estado e lê o dos outros) e interage com os outros: grudar um no outro, desviar em vez de sobrepor, arrastar coisas de um pro outro, reagir juntos (cor, batida, "pensando"), aceitar comandos do Eco e respeitar modos (foco, jogo, tela cheia) (detalhes em [interação entre apps](../padroes/interacao-entre-apps.md)).
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
- **Regra:** confira o visual em resolução real (Chrome dele via localhost, ou print da tela) e, quando possível, o comportamento no app instalado. Diga claramente o que não foi testado. Vale também pra mudanças no Windows (ícones, barra de tarefas): depois do comando, confira o resultado (estado do sistema ou um print) antes de dizer que funcionou; se o primeiro jeito não pegar, tente outro em vez de devolver o passo a passo manual.
- **Por quê:** vários bugs só apareceram no app instalado (a transparência, o corte da janela, a voz); e os ícones da área de trabalho foram dados como escondidos duas vezes sem conferir, e ele teve que dizer "ainda estao".
- **Exemplo:** "ta todo bugado o layout do voice" · "ainda estao".
- **Desde:** 2026-11-24 · **Reforçada:** 5× (última 2026-11-25, ícones da área de trabalho) · **Força:** alta

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
- **Exemplo:** "faz tudo aipra mim po agora" · "faz ai fi" (depois de receber instruções manuais pra esconder os ícones).
- **Desde:** 2026-11-24 · **Reforçada:** 3× (última 2026-11-25) · **Força:** alta

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

### R27 — Não inflar o que ele só explicou; confirmar o entendimento em poucas linhas
- **Regra:** quando ele dá contexto ("vai ser open source", "o foco é informação"), absorva e ajuste o que já está sendo feito, sem abrir frentes novas (licença, reescrita, mais etapas). Quando ele lança uma visão nova e grande, devolva em 3–5 linhas o que entendeu antes de começar, e só isso.
- **Por quê:** o Claude transformou uma explicação sobre o repo em mudanças de escopo e ele cortou; antes disso ele pediu pra ouvir o entendimento primeiro.
- **Exemplo:** "não não, n exagera, só to explicando" · "primeiro me explica oq eu quero pra eu ver se vc entendeu".
- **Desde:** 2026-11-25 · **Reforçada:** 1× · **Força:** média

### R28 — Pediu, faz: menos etapas e perguntas, mais construção
- **Regra:** quando ele pede algo concreto, construa a coisa (mesmo numa primeira versão simples) em vez de propor uma sequência de sondas, fases e perguntas de confirmação. Pergunte só o que bloqueia de verdade. Quando uma ação mexer no PC dele (esconder a barra, fechar apps), diga em uma linha o que mudou e como desfazer, sem misturar com a próxima proposta.
- **Por quê:** depois de várias rodadas explicando o Board, a sonda e a ordem das etapas, ele se irritou; e ficou confuso sobre o que tinha sido feito na barra de tarefas.
- **Exemplo:** "mano faz logo a porra do board com só a sonda dentro" · "calma, oq ce fez".
- **Desde:** 2026-11-25 · **Reforçada:** 1× · **Força:** alta

## Delegar e sessões

### R15 — Delegar tarefas paralelas
- **Regra:** pedidos independentes (como achar um wallpaper ou um recurso novo grande) vão pra outra sessão, com um bom resumo; ajustes posteriores vão pra sessão que já tem o contexto. Trabalho que mexe em vários apps vira um agente por app (Órbita, Onda, Eco), e a sessão principal revisa os prints de cada um antes de mostrar pra ele.
- **Por quê:** ele pediu explicitamente, e depois pediu um agente por app pra trabalhar com cuidado.
- **Exemplo:** "delega essas tarefas bixo" · "um agent por app" · "Coloca um opus 5.5 extra high" (pro pesquisador do ambiente).
- **Nota:** pesquisa técnica funda (o ambiente do host, medições) vai pra um agente dedicado, com o modelo mais forte e esforço alto quando ele pedir.
- **Desde:** 2026-11-24 · **Reforçada:** 4× (última 2026-11-25) · **Força:** alta

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
- **Regra:** sempre que um app for criado ou refinado (forma, interação, motion, visual, motor), atualize na mesma tarefa o repo desklive, seguindo o `CLAUDE.md` dele: `apps/<app>/` (README, visual e uma entrada em `refinos.md`), `padroes/motion/` e `referencias/` (molas, motor), mais uma linha no `CHANGELOG.md`, sempre com os números reais. Faça **só o commit local; NÃO faça push** (nem o dreamer) até ele dizer: ele pediu pra deixar o repo local por enquanto ("por enquanto deixa local", 25/11/2026). Só a receita, nunca o código. Mesmo local, confira antes de cada commit que não há segredos nem dados pessoais (o repo vai ser público). Toda sessão delegada que mexe em app recebe essa regra no resumo.
- **Por quê:** ele quer o repo como o livro de receitas vivo do projeto ([o CLAUDE.md do repo](../CLAUDE.md)).
- **Exemplo:** "sempre que refinarmos apps, documentamos lá" · "só vamos subir regras de tempos em tempos" · "faz no desklive sim ... mas por enquanto deixa local".
- **Desde:** 2026-11-25 · **Reforçada:** 3× (última 2026-11-25) · **Força:** alta

### R23 — Interação limpa: hover estável, balão por cima, sem sobra de espaço
- **Regra:** em todo app:
  - **Seleção de texto:** desligada em toda a UI (menos nos campos de digitar e no texto de conversa).
  - **Balões, nomes e avisos:** numa camada própria, sempre por cima de tudo, nunca cobertos por outro ícone nem cortados.
  - **Hover:** com histerese de entrada e saída. Não pisca quando a forma muda embaixo do mouse, não liga e desliga o "ignorar mouse" no meio do gesto, e nada foge do ponteiro.
  - **Troca de degrau:** só por ação clara (a alça), nunca ao encostar o mouse e nunca no mesmo alvo de outro gesto (girar, deslizar).
  - **Degraus grandes e cantos:** o corpo fica proporcional ao conteúdo, sem área vazia exagerada, com uma área de pega clara pra mover, separada dos gestos.
  - **Camadas e clique (zero bug de z-index):** só as partes visíveis dos apps recebem clique, hover e scroll; fora delas tudo chega no que está embaixo, e o clique-passa nunca fica preso. Guias, prévias e fundos são `pointer-events:none`; a peça arrastada ou clicada fica por cima das outras.
  - Antes de publicar, testar hover e clique reais no simulador.
- **Por quê:** no app instalado, o balão da Órbita ficou por baixo dos ícones, o relógio aparecia selecionado, a Onda no canto tinha um quarto de disco enorme e vazio (mal dava pra mover) e trocava de tamanho ao encostar na capa.
- **Exemplo:** "o comportamento de hover [ta] bem bugado, isso é geral ... o espaço ao redor dele fica tao grande exagerado q mal consigo mover ele. Isso pra todos" · "não pode ter bug de z-index".
- **Desde:** 2026-11-25 · **Reforçada:** 3× (última 2026-11-25, Board: só os mini apps interagíveis) · **Força:** alta

### R24 — Um app piloto primeiro, depois replicar
- **Regra:** mudanças grandes de base (motor, hover, tamanhos, movimento, ambiente) são feitas primeiro num app só, até ficar redondo e ele aprovar no app instalado. Só depois a receita vai pros outros apps, adaptada a cada um. Não abrir os três apps em paralelo pra mesma mudança de base.
- **Por quê:** rodadas em paralelo nos três espalharam bugs parecidos e ele precisou testar tudo três vezes.
- **Exemplo:** "o ideal é construir num app só extramamente bem feito antes e dps mandar pros outros quando 1 tiver redondo" · "e eu tiver validado". Piloto atual: a Onda.
- **Desde:** 2026-11-25 · **Reforçada:** 2× (última 2026-11-25) · **Força:** alta

### R25 — Nada pisca: toda mudança de tamanho, posição ou visibilidade é suave
- **Regra:** nenhuma largura, altura, posição, recorte ou visibilidade muda de um quadro pro outro sem transição suave. Valem pra isso:
  - **Mudança de tamanho:** a janela cresce antes e o CSS anima dentro dela; o encolher é aplicado depois que a animação termina, no mesmo quadro que a compensação.
  - **Troca de layout:** usa FLIP, crossfade ou morph.
  - **Pulos inevitáveis de janela** (emenda dos monitores, trava do host): ficam escondidos por congelamento ou crossfade, nunca por "sumir".

  É proibido:
  - esconder o conteúdo por 1–2 quadros;
  - aplicar a posição da janela e a compensação do CSS em quadros diferentes;
  - duas fontes brigando pela posição (mola contra trava, motor contra commit);
  - pedir uma posição fora da tela que o host vai corrigir.

  Antes de publicar, rodar a análise quadro a quadro (vídeo ou registro) e provar zero piscada, zero tremida e zero pulo.
- **Por quê:** a análise do vídeo da Onda v20 mostrou piscadas de 1–2 quadros (o "esconder quadro velho"), a janela voltando 1 quadro pro monitor antigo na emenda e tremedeira de ±170 px no canto. Ele disse que basta um piscar pra arruinar tudo.
- **Exemplo:** "não podem ter widths ou heights que mudam sem alguma transição suave. se QUALQUER coisa piscar, a experiencia é arruinada".
- **Desde:** 2026-11-25 · **Reforçada:** 1× · **Força:** máxima

### R26 — Todo trabalho técnico de movimento, tamanho e hover vai pro diário do desklive
- **Regra:** todo trabalho técnico de movimento, tamanho ou hover é registrado no repo desklive, na mesma tarefa: uma entrada em `diario/AAAA-MM.md` (data · app/versão · o que mudou · por quê · números · como foi provado), o arquivo do assunto (`referencias/ambiente/`, `referencias/motor/`, `padroes/motion/`, `padroes/hover-e-baloes.md`) e uma linha no `CHANGELOG.md`; fato-chave novo também na memória. Sem caminhos pessoais nem dados da conta (o repo vai ser público). A antiga base privada `desktop-tecnico` foi mesclada no repo em 25/11/2026 e não recebe mais nada. Toda sessão delegada recebe isso no resumo.
- **Por quê:** ele quer dominar por completo como os apps se movem e mudam de tamanho no desktop, com o registro técnico de tudo que for feito, do jeito que foi feito.
- **Exemplo:** "tudo que for sendo feito, seja documentado na sua memoria e docs ... sobre como esta sendo feito tecnicamente para a gente dominar completamente a movimentação e resizing de apps no ... desktop".
- **Desde:** 2026-11-25 · **Reforçada:** 1× · **Força:** alta

### R29 — Emenda entre monitores é borda e canto; funciona com qualquer número de monitores
- **Regra:** a divisão entre dois monitores conta como borda de cada um, e as pontas dela como cantos: o app reconhece, gruda, funde e muda de forma ali como numa borda externa, e continua dando pra atravessar pro outro monitor (empurrando além do limiar ou passando rápido), sem travar nem piscar. A lógica vale pra quantos monitores a pessoa tiver, em qualquer arranjo, escala ou degrau desalinhado. Os limites dos cantos têm que ficar bonitos e claros.
- **Por quê:** os apps não reconheciam o canto na emenda dos dois monitores dele.
- **Exemplo:** "Essa divisão dos monitores tem que ser considerada canto" · "tem que conectar perfeitamente com quantos monitores a pessoa tiver".
- **Desde:** 2026-11-25 · **Reforçada:** 2× (última 2026-11-25) · **Força:** alta

### R30 — O ponto de pega fica embaixo do mouse; precisão máxima no arrasto
- **Regra:** durante o arrasto, o ponto onde ele clicou fica sob o ponteiro mesmo quando o app muda de tamanho, de forma ou inverte a ordem (row-reverse) no meio do gesto; gestos internos (arrastar o tempo da música) nunca deixam o clique preso. Mire no máximo de precisão: erro de pega ≤ 0,5 px, atraso mínimo em relação ao mouse e zero tremida com o mouse parado, medidos e anotados.
- **Por quê:** testando a Onda, o app escorregava em relação ao mouse nas trocas de forma e o clique ficou preso no arrastar do tempo; e ele vai "botar o motion pra foder" em cima desse controle.
- **Exemplo:** "a posição do app em relação ao meu mouse ... ta mudando muito" · "o mais preciso que puder deixar, deixa".
- **Desde:** 2026-11-25 · **Reforçada:** 2× (última 2026-11-25) · **Força:** alta

### R31 — Medir com cuidado em vez de adivinhar; vídeo é analisado quadro a quadro
- **Regra:** quando ele mandar vídeo de um bug, analise quadro a quadro (tremidas de 1 quadro contam) e diga os tempos exatos. Pra bugs de movimento, prefira instrumentar (modo de registro, sonda) e ler os números a supor a causa.
- **Por quê:** os bugs da Onda só ficaram claros com a análise fina do vídeo e com o registro de eventos.
- **Exemplo:** "olha os videos com muito cuidado em pq tem uns frame que fica tremendo".
- **Desde:** 2026-11-25 · **Reforçada:** 2× (última 2026-11-25, "seria legal medirmos com mais cuidado") · **Força:** alta

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
- **2026-11-25:** R22 alterada (commit local só, sem push até ele dizer: "por enquanto deixa local"); R26 alterada (a base técnica privada foi mesclada no desklive: registro no `diario/` + arquivo do assunto + CHANGELOG).
- **2026-11-25 (dreamer, 2ª execução):** lidas 5 conversas com mensagens novas (a principal "Artefatos como apps", os agentes da Onda e do Eco, e duas curtas sobre fone e ícones/barra do Windows), 73 mensagens. Novas: R27 (não inflar o que ele só explicou), R28 (pediu, faz), R29 (emenda entre monitores é borda e canto, qualquer número de monitores), R30 (ponto de pega sob o mouse, precisão máxima), R31 (medir e ver vídeo quadro a quadro). Refinadas: R10 (conferir mudanças no Windows antes de afirmar), R13 (força subiu pra alta), R15 (pesquisa funda num agente dedicado e forte), R23 (zero bug de z-index, só as peças recebem clique). Reforçadas: R7 (6×), R20 (5×), R22 (3×), R24 (2×). Nenhuma removida.
