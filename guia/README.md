# Guia: faça o seu próprio app

> **O que é:** um caminho prático, em 7 passos, pra fazer um app de desktop no mesmo estilo da Órbita, da Onda e do Eco. **Quando ler:** você quer fazer o seu do zero e ainda não conhece o projeto. Cada passo explica a ideia e aponta pros docs detalhados. Os números ficam lá, não aqui, então nada desatualiza.

## Pra quem é e o que você vai fazer

- **Pra quem:** quem sabe HTML, CSS e JS e quer um app que vive na área de trabalho do Windows, não numa janela comum. Serve também pra agentes que vão começar um app novo.
- **O que você vai fazer:** um app transparente, sem moldura, sempre no topo e do tamanho do que se vê, que:
  - se arrasta com física (mola, embalo, ímã) e nunca sai da tela;
  - tem **forma e interação próprias** em cada lado, canto e tamanho, fundido à borda com ombros côncavos (a **regra nº 1**);
  - reage ao mouse sem piscar, com o balão por cima de tudo;
  - é testado sem mexer no mouse do PC e fica documentado como os outros.
- **Uma função só** (R16): antes de começar, escreva em uma linha o que o seu app faz e o que ele **não** faz. Música é a Onda, Claude é o Eco, a barra só aciona.
- **Exemplos prontos:** [Órbita](../apps/orbita/README.md) (barra de tarefas), [Onda](../apps/onda/README.md) (player) e [Eco](../apps/eco/README.md) (assistente). A **ilha do topo do Eco** é o nível mínimo de acabamento.

## Antes de começar

- **Windows 11** e o **app Claude** instalando artefatos como apps de desktop: cada app é um artefato HTML publicado no claude.ai com a capability `desktop` e instalado pelo app Claude ([arquitetura](../padroes/arquitetura.md)).
- **Chrome** e qualquer servidor local (`localhost`) pra rodar o **simulador** do seu app ([passo 6](06-testar-sem-mexer-no-pc.md)).
- **Nada de binário sem assinatura:** o Smart App Control fica ligado. O que a página não faz sozinha (foco de janela, mídia, rede externa) vai num **helper** em PowerShell ([arquitetura](../padroes/arquitetura.md)). Se o seu app não precisa disso, pule.
- Leia a [visão](../visao/README.md) (os 9 princípios, 5 minutos) e deixe o [glossário](../visao/glossario.md) aberto: as palavras em negrito do guia estão lá.

## Os passos

| Passo | Arquivo | Você sai com | Pronto quando |
|---|---|---|---|
| 1 | [Primeiro app](01-primeiro-app.md) | a janela mínima: transparente, sem moldura, no topo, do tamanho do conteúdo, com o clique passando fora | encosta em todas as bordas e cantos, sem sobra |
| 2 | [Mover e encaixar](02-mover-e-encaixar.md) | arrasto com o **motor**: mola, embalo, ímã, sempre dentro da tela | arrasta, solta e encaixa sem tremer |
| 3 | [Forma por lado](03-forma-por-lado.md) | uma forma e uma interação únicas por lado, canto e **degrau**, incluindo o mínimo | a matriz de formas está cheia e nenhuma é a mesma peça girada |
| 4 | [Hover e interação](04-hover-e-interacao.md) | hover estável, balão por cima, nada selecionável, pega separada dos gestos, sem sobra de área | nada pisca e nenhum clique se perde |
| 5 | [Visual e motion](05-visual-e-motion.md) | a linguagem visual e as constantes de motion pra começar | parece da família sem ser cópia |
| 6 | [Testar sem mexer no PC](06-testar-sem-mexer-no-pc.md) | simulador, ganchos, testes de estresse e prints | prints de tudo e o "não testado" escrito |
| 7 | [Documentar](07-documentar.md) | a pasta do app no formato do projeto e o registro de refinos | outra pessoa refaz o app só lendo |
| extra | [Interação entre apps](../padroes/interacao-entre-apps.md) | o app no **barramento** `~/.orbita`, conversando com os outros | publica o estado e aceita comandos |

Faça na ordem, porque cada passo usa o anterior. O passo 3 é o coração do estilo e o que mais leva tempo. O passo 6 vale o tempo todo: teste a cada passo, não só no fim.

## O que não tem aqui

- **Código-fonte:** o repo guarda a receita, não o código. Os trechos do guia são pseudocódigo ilustrativo, nunca código dos apps.
- **Números:** ficam nos docs de origem ([padrões](../padroes/README.md), [referências](../referencias/README.md) e a pasta de cada app). O guia diz qual abrir.
- **Segredos:** chaves, tokens, client IDs e dados pessoais nunca entram na doc (o repo é público).

Se você é um agente: as regras inegociáveis estão no [CLAUDE.md](../CLAUDE.md) e valem durante todo o guia.
