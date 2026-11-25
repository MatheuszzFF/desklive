# Changelog

Mudanças no repositório de docs, da mais nova pra mais antiga. Refino de app ganha uma linha aqui e a entrada completa em `apps/<app>/refinos.md` ([modelo](templates/registro-de-refino.md)).

## 2026-11-25

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
