# Changelog

Mudanças no repositório de docs, da mais nova pra mais antiga. Refino de app ganha uma linha aqui e a entrada completa em `apps/<app>/refinos.md` ([modelo](templates/registro-de-refino.md)).

## 2026-11-27

### Moldura, Janelas, Dengas
- **Moldura** (`Board.moldura` / `Board.molduraDefinir`, seção 14d do núcleo): o molde de todo widget. Âncora (interior, superior, inferior, esquerda, direita, 4 cantos), tamanho `xs`–`xl` por orientação (`h-md`, `v-lg`…), bordas que redimensionam conforme o lugar (nunca o lado fundido), tamanho guardado por âncora, lados que encostam em borda ou emenda com outro monitor, `vistas` por classe e `ancoras` pra limitar onde mora (o encaixe respeita). Ver [apps/board/moldura.md](apps/board/moldura.md).
- A ponte da Mesa usa a moldura: `Mesa.define` vira moldura (sai o redimensionar próprio da ponte). `Mesa.app` pra apps sem janela (as Chaves viram um). `Mesa.diagnostico` grava `~/.orbita/mesa-diag.json`.
- **Janelas** (`modelos/janelas/`): qualquer programa do Windows vira peça, sem título e moldura do Windows, com recorte da barra de rolagem; devolve ao fechar.
- **Dengas:** a bolinha é só nos cantos; na lateral ele fica inteiro (forma da lateral a definir).

### Board unificado com a Mesa (ramo `unifica`)
- **Novo:** API aberta e chaves centralizadas no núcleo do Board ([apps/board/](apps/board/README.md), [API aberta](apps/board/api-aberta.md), [chaves](apps/board/chaves.md)); a ponte da Mesa ([modelos/mesa/board.js](modelos/mesa/board.js)).
- **Cada app na sua pasta:** [Dengas](apps/dengas/README.md) e [Navegador](apps/navegador/README.md) saíram dos widgets da Mesa pra `modelos/dengas/` e `modelos/navegador/`; [Assistente](apps/assistente/README.md) em `modelos/assistente/`; a Onda e a Órbita ganham `board.js` na pasta delas. Montagem dos opcionais compartilhada (`Resolve-Marcadores`).

## 2026-11-26

### Modelos: o Board v2, do jeito publicado
- **Novo:** [modelos/board/](modelos/board/README.md): `board-src.html` (o Board v2 com a Sonda e a Afinação), `build.ps1` (grava `board.html` e `board-2.html`, que só mudam no título, com o mesmo conteúdo dos dois artefatos publicados), o simulador em [teste/](modelos/board/teste/) e as medições do PC em [scripts/](modelos/board/scripts/) (caminhos relativos à pasta). README com publicar e instalar os dois, atalhos, o que foi e o que não foi testado e os docs do Board.
- **Atualizado:** [modelos/](modelos/README.md) (linha do Board), mapa do [CLAUDE.md](CLAUDE.md) ("Usar o Board"), [diário](diario/2026-11.md).

### Merge: a Mesa (PR #1)
- **Trazido:** [modelos/mesa/](modelos/mesa/README.md) e [apps/mesa/](apps/mesa/README.md), Mesa 0.1 a 0.17, sem mudança.

### Board v2: Sonda original, motion fino, monitor 2, Telas e conexão
- **Novo:** [board-telas](referencias/ambiente/board-telas.md) (host + Windows + vsync medido, espaços de coordenada, leitura real do PC) e [board-conexao](referencias/ambiente/board-conexao.md) (canais medidos, relay de pipes, protocolo do passe, linha do tempo comum, provas). **Atualizado:** [board](referencias/ambiente/board.md), [board-pecas](referencias/ambiente/board-pecas.md), [board-motor](referencias/ambiente/board-motor.md) (molas finais, contatos, números), [bugs e lições](referencias/motor/bugs-e-licoes.md) (35–46), [índice do ambiente](referencias/ambiente/README.md), [glossário](visao/glossario.md), mapa do [CLAUDE.md](CLAUDE.md), [diário](diario/2026-11.md).

## 2026-11-25

### Board v1: o app, com a Sonda como primeira peça
- **Novo:** [board-pecas](referencias/ambiente/board-pecas.md) (API de peça, camadas z, clique-passa, como pôr a Onda) e [board-motor](referencias/ambiente/board-motor.md) (canais, molas por estado, passo fixo, entrada, ganchos, afinação, números do simulador). **Atualizado:** [board](referencias/ambiente/board.md) (o que existe na v1, passe aquecido, canto da emenda), [índice do ambiente](referencias/ambiente/README.md), [glossário](visao/glossario.md), mapa do [CLAUDE.md](CLAUDE.md), [diário](diario/2026-11.md).

### Dreamer: regras R27–R31 e espelhos do dia
- **Atualizado:** [regras de trabalho](regras/regras-de-trabalho.md) (novas R27 não inflar o que ele só explicou, R28 pediu faz, R29 emenda entre monitores é borda e canto, R30 ponto de pega e precisão, R31 medir e ver vídeo quadro a quadro; R10, R13, R15 e R23 refinadas), espelhos [layout](padroes/layout-posicao-e-tamanho.md), [interação entre apps](padroes/interacao-entre-apps.md) (Board, piloto, fila) e [design](padroes/design.md), agora com título.

### Onda v21.1: tremida quadro a quadro, emenda como borda, dois passos
- **Atualizado:** [janela sem tremer](padroes/motion/janela-sem-tremer.md) (técnica 6: dois passos), [sensor de borda](padroes/motion/sensor-de-borda-e-encaixe.md) (a emenda é borda), [motor-piloto](referencias/motor/motor-piloto.md) (histerese do monitor, portal junto do commit), [como medir](referencias/ambiente/como-medir.md) (maior bloco, detector de vai e volta, fps real), [bugs e lições](referencias/motor/bugs-e-licoes.md) (26, 27, 33, 34), [diário](diario/2026-11.md), [refinos da Onda](apps/onda/refinos.md) e o Testado da [Onda](apps/onda/README.md).

### Mesa 0.1: o quadro dos widgets (piloto)
- **Novo:** [modelos/mesa/](modelos/mesa/README.md) (quadro, widgets Relógio, Notas e Música, o morador Dengas e a arte dele) e [apps/mesa/](apps/mesa/README.md) com a receita e os números. Linha nova em [apps/](apps/README.md), [modelos/](modelos/README.md) e no mapa do [CLAUDE.md](CLAUDE.md).

### Board: palco em tela cheia por monitor (proposta + sonda)
- **Novo:** [board](referencias/ambiente/board.md) (conceito, uma janela por app nas typings, N monitores com emendas, cantos e degraus, guias de encaixe, passe entre Boards, riscos, a sonda, fundo no Wallpaper Engine com fontes). **Atualizado:** [índice do ambiente](referencias/ambiente/README.md), mapa do [CLAUDE.md](CLAUDE.md), [glossário](visao/glossario.md), [diário](diario/2026-11.md).

### Onda v21: ponto de pega invariante, registro, progresso, nada pisca
- **Atualizado:** [ponto de pega](padroes/motion/ponto-de-pega.md) (zona pelo ponto pego, caixa só do alvo com a janela presa, números antes/depois), [motor-piloto](referencias/motor/motor-piloto.md) (`nudge`, esconder removido), [bugs e lições](referencias/motor/bugs-e-licoes.md) (25, 28–30 resolvidos; 31 e 32 novos), [diário](diario/2026-11.md), [refinos da Onda](apps/onda/refinos.md) e o Testado da [Onda](apps/onda/README.md).

### Base técnica de movimento, tamanho e hover trazida pro repo (R26) + diário
- **Novo:**
  - [diario/](diario/README.md): índice, modelo da entrada (data · app/versão · o que mudou · por quê · números · como foi provado) e [2026-11](diario/2026-11.md) com as entradas de 24 e 25/11;
  - [como medir](referencias/ambiente/como-medir.md): contadores do motor, a sonda (testes e como rodar), o modo de registro por quadro (saiu de `tempo-e-medicao.md`) e a análise de vídeo quadro a quadro;
  - [ponto de pega](padroes/motion/ponto-de-pega.md): o ponto pego fica embaixo do mouse nas trocas de forma (meta ≤ 2 px, `nudge`, `grabtest`);
  - [bugs e lições](referencias/motor/bugs-e-licoes.md): os 30 bugs em ordem, com a situação, e as lições.
- **Atualizado:**
  - [medições](referencias/ambiente/medicoes.md): todos os n, redimensionar pela direita e pela esquerda, trava caso a caso, `forward` e corrida por halo, gravações e o vídeo da Onda v20;
  - [janela sem tremer](padroes/motion/janela-sem-tremer.md): seção "Nada pisca (R25)" (por que esconder é proibido, técnicas permitidas, prova), corte contra o destino, tetos;
  - [host](referencias/ambiente/host.md), [tempo](referencias/ambiente/tempo-e-medicao.md), [mover e redimensionar](referencias/ambiente/mover-e-redimensionar.md), [hover e clique passa](referencias/ambiente/hover-e-clique-passa.md), [receitas](referencias/ambiente/receitas-recomendadas.md) e o [índice do ambiente](referencias/ambiente/README.md): números medidos no lugar dos "(medir)"; o "~50–70 ms" corrigido também em [motor de movimento](referencias/motor/motor-de-movimento.md), [bugs evitados](referencias/motor/bugs-evitados.md) e [janela sem tremer](padroes/motion/janela-sem-tremer.md);
  - [motor-piloto](referencias/motor/motor-piloto.md): a bomba, o portal, paredes, `nudge` da v21, âncora e zonas da Onda, o esconder proibido e o que o vídeo mostrou; [tamanho e borda](referencias/motor/tamanho-e-borda.md);
  - [hover e balões](padroes/hover-e-baloes.md): ressincronizar pelo cursor, `lostpointercapture` como fim, área de toque maior que o traço, sem arrastar;
  - [regras](regras/regras-de-trabalho.md) (cópia da memória): R22 só commit local, sem push até ele dizer; R26 aponta pro `diario/` + arquivo do assunto;
  - [CLAUDE.md](CLAUDE.md) (nível Diário, mapa, convenção R26, repo local por enquanto), [README](README.md), índices de [motion](padroes/motion/README.md), [motor](referencias/motor/README.md), [padrões](padroes/README.md), [referências](referencias/README.md), [regras](regras/README.md) e o [glossário](visao/glossario.md) (análise quadro a quadro, diário técnico, modo de registro, motor-piloto, ponto de pega, quadro velho).

### Onda v20: app piloto (R24) com o motor-piloto
- **Novo:** [referencias/motor/motor-piloto.md](referencias/motor/motor-piloto.md) (trava igual à do host, emenda como portal, teto de um monitor, quadro velho escondido, telas e movimento reduzido ao vivo; simulador que imita o host).
- **Atualizado:** [refinos da Onda](apps/onda/refinos.md), [interação da Onda](apps/onda/interacao.md) (H1–H4), o Testado da [Onda](apps/onda/README.md) e os índices de [motor](referencias/motor/README.md) e [motion](padroes/motion/README.md).

### Ambiente: o host por baixo dos apps (pesquisa)
- **Novo:** [referencias/ambiente/](referencias/ambiente/README.md), lido do app Claude instalado (Electron 45.3.3, Chromium 156) e das fontes do Electron, do Chromium e da Microsoft:
  - [host](referencias/ambiente/host.md): como a janela é montada; uma ida e volta por chamada, sem fila; o que cada API faz por baixo; o nível `floating` atrás da barra; throttling desligado; o observador de DOM do preload.
  - [hover e clique passa](referencias/ambiente/hover-e-clique-passa.md): o gancho do `forward`, o `mouseleave` sintético, a corrida do clique, a captura no Chrome 136+, a receita.
  - [mover e redimensionar](referencias/ambiente/mover-e-redimensionar.md): a trava real é a área útil de um monitor só, com pulo na emenda; mover × redimensionar; estratégias comparadas; DPI.
  - [tempo e medição](referencias/ambiente/tempo-e-medicao.md): vsync do monitor principal, tabela de atrasos, a sonda de diagnóstico.
  - [receitas recomendadas](referencias/ambiente/receitas-recomendadas.md), em ordem, com ganho e risco.
- **Atualizado:**
  - [CLAUDE.md](CLAUDE.md): linha no mapa;
  - [referências](referencias/README.md), [arquitetura](padroes/arquitetura.md) e [hover e balões](padroes/hover-e-baloes.md): ponteiros;
  - [tamanho e borda](referencias/motor/tamanho-e-borda.md): a "recusa" era `EBUSY`/`EINVAL`;
  - [motor de movimento](referencias/motor/motor-de-movimento.md): a trava na emenda foi lida no código;
  - [glossário](visao/glossario.md): área útil, halo de aproximação, palco, portal da emenda, sonda; a "trava da tela" foi corrigida.

### Modelos: o código dos três apps, limpo
- **Novo:** [modelos/](modelos/README.md), a única pasta com código: Órbita v28, Onda v19 e Eco v24 como `*-src.html` + helpers + `build.ps1` portátil (caminhos relativos, saída em `modelos/saida/`, ignorada), e em [compartilhado/](modelos/compartilhado/README.md) o motor v2.2, os helpers usados por mais de um app e as funções da montagem (os ícones são extraídos na máquina de quem monta). Sem dados pessoais: Client ID do Spotify como `SEU_CLIENT_ID` vindo de `onda/config.json` (ignorado), lista de apps só com apps do Windows, exemplos genéricos.
- **Atualizado:** [CLAUDE.md](CLAUDE.md) (código só em `modelos/`, linha nos níveis e no mapa, como atualizar um modelo, o que procurar antes de commitar), [README](README.md), [guia](guia/README.md) (o que não tem aqui) e [glossário](visao/glossario.md) (marcador, modelo).

### Onda v19: remontada com o motor v2.2
- **Atualizado:** [refinos da Onda](apps/onda/refinos.md) e o "Testado" da [Onda](apps/onda/README.md) (teto na troca de forma: 55 %; 16 arrastos em 57–1250 ms numa aba visível; zigue-zague com 2 trocas; freio sem batida na parede).

### Eco v24: motor v2.2, amassado no meio do arrasto, união das trocas
- **Atualizado:** [interação do Eco](apps/eco/interacao.md) (esticar e amassado somados numa matriz, direção suavizada), [formas e degraus do Eco](apps/eco/formas-e-degraus.md) (união antes + depois medida: 69 %) e [refinos do Eco](apps/eco/refinos.md).

### Órbita v28: motor v2.2 e teto da união na troca de forma
- **Atualizado:** [hover e toque da Órbita](apps/orbita/hover-e-toque.md) (a união antes + depois cabe em 90% da área útil) e [refinos](apps/orbita/refinos.md).

### Motor v2.2: app grande, parede e borda (só o motor; os apps montam com ele)
- **Novo:** [referencias/motor/tamanho-e-borda.md](referencias/motor/tamanho-e-borda.md): por que o app grande não arrastava pros lados (zona morta na parede, 6% do mouse), escorregar na parede (70–100%), nunca maior que a tela eixo por eixo, recusa do Windows registrada, freio de aproximação `√(2·90000·d)`, amassado na batida, teto de 70% × 60% pros apps, auditoria de colar e descolar nos três.
- **Atualizado:** [bugs evitados](referencias/motor/bugs-evitados.md) (rodada v2.2), [motor](referencias/motor/README.md), índice de [motion](padroes/motion/README.md).

### Eco v23: teto de tamanho, encaixe sem piscar, hover e toque; doc em índice
- **Novo:** [apps/eco/formas-e-degraus.md](apps/eco/formas-e-degraus.md) (estrutura, tabela forma × estado × degrau, teto de 70 % × 60 % com a conversa rolando dentro, alça) e [apps/eco/interacao.md](apps/eco/interacao.md) (prévia e repouso por lado, hover e toque, arrastar e fundir com histerese de 16 px).
- **Atualizado:** [README do Eco](apps/eco/README.md) (virou índice, como o da Onda; seção Testado) e [refinos do Eco](apps/eco/refinos.md).

### Órbita v27: hover e toque, teto de área, colar sem piscar
- **Novo:** [apps/orbita/hover-e-toque.md](apps/orbita/hover-e-toque.md) (molas e escalas do hover e do pressionar, balão, histerese de colar e descolar, teto de 70% × 60% da área útil).
- **Atualizado:** [README da Órbita](apps/orbita/README.md) (encaixe, degraus, zoom, arquivos) e [refinos](apps/orbita/refinos.md).

### Guia pra fazer o seu próprio app
- **Novo:** [guia/](guia/README.md) (passo a passo pra outras pessoas: janela mínima, motor, forma por lado, hover, visual e motion, testar sem mexer no PC, documentar), 14 termos no [glossário](visao/glossario.md), linha "Guia" nos níveis e no mapa do [CLAUDE.md](CLAUDE.md) e uma seção no [README](README.md).

### Onda v18: teto de tamanho, hover refinado e assentar estável
- **Novo:** [apps/onda/formas-e-degraus.md](apps/onda/formas-e-degraus.md) e [apps/onda/interacao.md](apps/onda/interacao.md) (o README da Onda virou índice + resumo, com ordem de leitura pra quem quer reproduzir).
- **Atualizado:** [refinos da Onda](apps/onda/refinos.md) (coluna e faixa grandes dentro do teto, efeitos de hover e toque, corte da janela contra o destino) e [bugs evitados](referencias/motor/bugs-evitados.md).

### Eco v22: seleção só no conteúdo, camadas, sem sobra de espaço e hover estável
- **Atualizado:** [Eco](apps/eco/README.md) (tamanhos do grande pelo conteúdo, prévia da espinha de 230 px, hover pela geometria), [refinos do Eco](apps/eco/refinos.md), [hover e balões](padroes/hover-e-baloes.md) (dentro/fora pela geometria, relógio da prévia que conta da chegada, exceção de seleção pro conteúdo, sem sobra de área vazia medindo na largura de destino) e [bugs evitados](referencias/motor/bugs-evitados.md) (prévia que não abria com o mouse andando, "clique passa" piscando, grande com área vazia).

### Onda v17: quarto de disco proporcional, pega clara e hover estável
- **Atualizado:** [Onda](apps/onda/README.md) (raios do disco, aro de pega, rótulo, hover e clique), [refinos da Onda](apps/onda/refinos.md), [hover e balões](padroes/hover-e-baloes.md) (gesto e pega separados; janela cortada na tela também no meio da troca) e [bugs evitados](referencias/motor/bugs-evitados.md).

### Órbita v26: balão por cima, hover estável, leque justo
- **Novo:** [padroes/hover-e-baloes.md](padroes/hover-e-baloes.md) (regra geral: balão único por cima de tudo, histerese de hover, "clique passa" com atraso, nada selecionável, botão dentro de arrasto, janela que cabe na tela).
- **Atualizado:** [refinos da Órbita](apps/orbita/refinos.md), [README da Órbita](apps/orbita/README.md) (medidas do leque), [bugs evitados](referencias/motor/bugs-evitados.md) (balão por baixo, barra longe da borda, "clique passa" piscando), índice de [padroes](padroes/README.md).

### Eco v21: captura do ponteiro só ao virar arrasto
- **Atualizado:** [refinos do Eco](apps/eco/refinos.md) (a mesma regra da Órbita e da Onda, preventiva: no Eco a marca e a forma não têm botões dentro, e todos os cliques foram conferidos).

### Onda v16: cliques dentro da área de arrasto
- **Atualizado:** [refinos da Onda](apps/onda/refinos.md) e [bugs evitados](referencias/motor/bugs-evitados.md) (a mesma correção da Órbita: captura só ao virar arrasto; capa, nome em pé e play da capa voltam a responder).

### Órbita v25: barra recolhida que não abria
- **Atualizado:** [refinos da Órbita](apps/orbita/refinos.md) e [bugs evitados](referencias/motor/bugs-evitados.md) (capturar o ponteiro no pressionar engolia o clique dos botões; agora só ao virar arrasto).

### Motor v2.1: arrasto sem trancos (Órbita v24, Onda v15, Eco v20)
- **Atualizado:** [motor de movimento](referencias/motor/motor-de-movimento.md) (envio com até 5 `setBounds` em voo, o porquê medido numa gravação da tela, o "passou da tela", a conferência com o Windows ao assentar, a espera do `resize` em 100 ms, o testado com ~60 ms de atraso), [bugs evitados](referencias/motor/bugs-evitados.md) (seção "achados no app instalado"), [motor](referencias/motor/README.md) e o `refinos.md` dos três apps.

### Eco v19: repouso vivo e único em cada lado
- **Atualizado:** [apps/eco/README.md](apps/eco/README.md) (seção "Repouso": ilha que respira e incha, espinha com feixe de luz e marca que desliza, barra com cursor piscando, quarto de órbita com anel e satélite, solta que olha pro mouse, ponto de resposta nova; seção "Testado") e [apps/eco/refinos.md](apps/eco/refinos.md).

### Órbita v23: degrau mínimo vivo por lado
- **Novo:** [apps/orbita/degrau-minimo.md](apps/orbita/degrau-minimo.md) (doca dormindo, coluna de pontos, ilha dinâmica, núcleo respirando, pílula em onda; fórmula da proximidade).
- **Atualizado:** [README da Órbita](apps/orbita/README.md) (degraus, Testado, arquivos), [refinos](apps/orbita/refinos.md), [glossário](visao/glossario.md) (acordar por proximidade, ilha dinâmica).

### Onda v14: mínimo único em cada borda e canto
- **Atualizado:** [apps/onda/README.md](apps/onda/README.md) (tira que esconde a capa atrás da borda, pílula do topo, capa-bolha da base, quarto de vinil; seção "Testado") e [apps/onda/refinos.md](apps/onda/refinos.md).

### Motor de movimento único (Órbita v22, Onda v13, Eco v18)
- **Novo:** [referencias/motor/motor-de-movimento.md](referencias/motor/motor-de-movimento.md) (máquina de estados, molas, limiares, 1 `setBounds` por quadro, commit de tamanho) e [referencias/motor/bugs-evitados.md](referencias/motor/bugs-evitados.md).
- **Atualizado:** [motor](referencias/motor/README.md) (sem o "em revisão"; *feed-forward* com previsão de 1 quadro em vez do decaimento de 50 ms), [janela sem tremer](padroes/motion/janela-sem-tremer.md) (trava da tela só arrastando), índice de [motion](padroes/motion/README.md), e o `refinos.md` dos três apps.

### Reestruturação em níveis (só organização; nenhum número ou comportamento mudou)
- **Novo:** [CLAUDE.md](CLAUDE.md) (entrada pra agentes: regras críticas, níveis, mapa de leitura por tarefa, convenções, segurança), este CHANGELOG, [visao/](visao/README.md) (L0: visão, princípios, [glossário](visao/glossario.md)), [referencias/](referencias/README.md) (L3) e [templates/](templates/README.md) (modelo de app, registro de refino, checklist).
- **Índices:** um `README.md` em cada pasta, listando os filhos com uma linha cada.
- **`padroes/motion.md` dividido:** os princípios e o índice em [padroes/motion/README.md](padroes/motion/README.md); um arquivo por assunto em `padroes/motion/` (seções 4 a 12); molas e curvas em [referencias/motion/](referencias/motion/README.md) (seções 2 e 3); o motor em [referencias/motor/](referencias/motor/README.md) (seção 13); o checklist em [templates/checklist-novo-app.md](templates/checklist-novo-app.md) (seção 14, ampliado). `padroes/motion.md` virou ponteiro.
- **Apps em pastas:** `apps/<app>.md` → `apps/<app>/README.md`, com o detalhe separado ([Eco: marca WebGL e visual](apps/eco/README.md), [Onda: onda e cor, visual](apps/onda/README.md), [Órbita: anéis e visual](apps/orbita/README.md)), uma seção "Testado" e um `refinos.md`. Os arquivos antigos viraram ponteiros.
- **`arquitetura.md` → [padroes/arquitetura.md](padroes/arquitetura.md)** (é L1: runtime de todos os apps).
- **Links:** as referências "motion, seção N" viraram links pros arquivos novos; todos os links relativos conferidos.
- **Sem mudança:** `regras/regras-de-trabalho.md`, `padroes/design.md`, `padroes/layout-posicao-e-tamanho.md` e `padroes/interacao-entre-apps.md` (espelhos do dreamer) ficaram no mesmo caminho e com o mesmo conteúdo.

### Antes da reestruturação (resumo do histórico do git)
- R20 ampliada: o tamanho mínimo também é único e interativo.
- R22 criada: todo refino de app é documentado aqui.
- "Como é feito" de cada app e o `motion.md`: motion, interação por lado e visual.
- Primeira versão: docs, regras e padrões.
