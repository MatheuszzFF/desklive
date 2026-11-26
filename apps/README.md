# Apps (L2)

Uma pasta por app. Cada pasta tem o mesmo formato (o do [modelo](../templates/novo-app.md)): `README.md` com a visão geral (formas por lado e canto, interação, degraus, alça, arrasto, testado), arquivos de detalhe (`visual.md`, L3 do app) e `refinos.md` com o histórico.

| App | O que é | Pasta | Detalhes |
|---|---|---|---|
| **Órbita** | barra de tarefas: apps, anéis de CPU/RAM/placa, relógio | [orbita/](orbita/README.md) | [visual](orbita/visual.md) · [refinos](orbita/refinos.md) |
| **Onda** | player do Spotify: capa, onda que reage ao som, Web API | [onda/](onda/README.md) | [formas e degraus](onda/formas-e-degraus.md) · [interação](onda/interacao.md) · [onda e cor](onda/onda-e-cor.md) · [visual](onda/visual.md) · [refinos](onda/refinos.md) |
| **Eco** | assistente (Claude Haiku 5.5) com marca líquida em WebGL | [eco/](eco/README.md) | [marca WebGL](eco/marca-webgl.md) · [visual](eco/visual.md) · [refinos](eco/refinos.md) |
| **Board** | o quadro vazio e interativo (um por monitor) onde os apps viram peças; API aberta e chaves | [board/](board/README.md) | [API aberta](board/api-aberta.md) · [chaves](board/chaves.md) · [refinos](board/refinos.md) |
| **Dengas** | o ratinho assistente: conversa com o Claude e comanda os apps | [dengas/](dengas/README.md) | [refinos](dengas/refinos.md) |
| **Navegador** | sites e vídeo dentro do quadro, numa janela do Edge sob um furo | [navegador/](navegador/README.md) | [refinos](navegador/refinos.md) |
| **Assistente** | cérebro genérico pro Board, sem corpo | [assistente/](assistente/README.md) | [refinos](assistente/refinos.md) |
| **Mesa** | aposentada em 27/11: virou a ponte que leva o Dengas e os apps dela pro Board | [mesa/](mesa/README.md) | [refinos](mesa/refinos.md) |

**App novo:** crie `apps/<nome>/` (minúsculo, sem acento) copiando [templates/novo-app.md](../templates/novo-app.md) como `README.md`, crie `refinos.md`, e acrescente uma linha nesta tabela e no mapa do [CLAUDE.md](../CLAUDE.md).

Os arquivos `orbita.md`, `onda.md` e `eco.md` soltos nesta pasta são só ponteiros pro lugar novo.
