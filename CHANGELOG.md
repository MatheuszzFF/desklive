# Changelog

Mudanças no repositório de docs, da mais nova pra mais antiga. Refino de app ganha uma linha aqui e a entrada completa em `apps/<app>/refinos.md` ([modelo](templates/registro-de-refino.md)).

## 2026-11-25

### Mesa 0.1: o quadro dos widgets (piloto)
- **Novo:** [modelos/mesa/](modelos/mesa/README.md) (quadro, widgets Relógio, Notas e Música, o morador Dengas e a arte dele) e [apps/mesa/](apps/mesa/README.md) com a receita e os números. Linha nova em [apps/](apps/README.md), [modelos/](modelos/README.md) e no mapa do [CLAUDE.md](CLAUDE.md).

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
