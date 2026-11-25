# desklive

Um desktop vivo pro Windows 11, feito de artefatos do Claude instalados como apps de desktop. Os apps são transparentes, flutuam sobre a área de trabalho, se transformam conforme o lugar da tela e conversam entre si.

## Apps

| App | O que é | Doc |
|---|---|---|
| **Órbita** | Barra de tarefas: apps, anéis de CPU, RAM e placa de vídeo, relógio | [apps/orbita.md](apps/orbita.md) |
| **Onda** | Player do Spotify, com capa, onda que reage ao som e controle pela Web API | [apps/onda.md](apps/onda.md) |
| **Eco** | Assistente (Claude Haiku 5.5) com uma forma líquida em WebGL | [apps/eco.md](apps/eco.md) |

## Regras e padrões (ler antes de mexer em qualquer coisa)

- [regras/regras-de-trabalho.md](regras/regras-de-trabalho.md): como trabalhar neste projeto. A **regra nº 1** fica no topo do arquivo.
- [padroes/layout-posicao-e-tamanho.md](padroes/layout-posicao-e-tamanho.md): todo app se transforma conforme o lado, o canto e o tamanho, com forma e interação únicas.
- [padroes/interacao-entre-apps.md](padroes/interacao-entre-apps.md): os apps conversam pelo barramento `~/.orbita`.
- [padroes/design.md](padroes/design.md): transparente, minimalista, motion vivo, nada genérico.
- [arquitetura.md](arquitetura.md): como os apps funcionam por dentro.

As regras são mantidas pelo **dreamer**, uma tarefa diária que lê as conversas e transforma o feedback em regras. A fonte de verdade fica na memória do Claude; este repositório recebe uma cópia.
