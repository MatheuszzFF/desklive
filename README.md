# desklive

Um desktop vivo pro Windows 11, feito de artefatos do Claude instalados como apps de desktop. Os apps são transparentes, flutuam sobre a área de trabalho, se transformam conforme o lugar da tela e conversam entre si.

Este repositório é o livro de receitas: as regras e **como** cada app é feito (forma e interação por lado, motion com os números reais, visual). O código dos apps não fica aqui.

## Apps

| App | O que é | Doc |
|---|---|---|
| **Órbita** | Barra de tarefas: apps, anéis de CPU, RAM e placa de vídeo, relógio | [apps/orbita/](apps/orbita/README.md) |
| **Onda** | Player do Spotify, com capa, onda que reage ao som e controle pela Web API | [apps/onda/](apps/onda/README.md) |
| **Eco** | Assistente (Claude Haiku 5.5) com uma forma líquida em WebGL | [apps/eco/](apps/eco/README.md) |

## Fazer o seu próprio app

Quer um app assim no seu desktop? O [guia](guia/README.md) é o passo a passo em 7 arquivos curtos: a janela transparente, o arrasto com física, uma forma e uma interação por lado, hover estável, visual e motion, testar sem mexer no PC e documentar. Cada passo aponta pros docs detalhados daqui.

## Como a doc é organizada

Em níveis, do geral pro específico:

- **L0, visão e regras:** [visao/](visao/README.md) (por que existe, princípios, [glossário](visao/glossario.md)) e [regras/](regras/README.md) (as regras de trabalho; a **regra nº 1** fica no topo).
- **L1, padrões de todos os apps:** [padroes/](padroes/README.md): [layout por posição e tamanho](padroes/layout-posicao-e-tamanho.md), [interação entre apps](padroes/interacao-entre-apps.md), [design](padroes/design.md), [motion](padroes/motion/README.md) (molas, ombros côncavos, descolar líquido, sensor de borda, troca de forma, janela sem tremer) e [arquitetura](padroes/arquitetura.md).
- **L2, cada app:** [apps/](apps/README.md), uma pasta por app, com o histórico de refinos.
- **L3, referências profundas:** [referencias/](referencias/README.md) (constantes de mola, curvas, o motor da janela) e os arquivos de detalhe de cada app (como o shader do Eco).
- **Modelos:** [templates/](templates/README.md) (app novo, registro de refino, checklist). Mudanças no repo: [CHANGELOG.md](CHANGELOG.md).

Agentes começam pelo [CLAUDE.md](CLAUDE.md), que tem o mapa de o que ler pra cada tarefa.

As regras são mantidas pelo **dreamer**, uma tarefa diária que lê as conversas e transforma o feedback em regras. A fonte de verdade fica na memória do Claude; este repositório recebe uma cópia.
