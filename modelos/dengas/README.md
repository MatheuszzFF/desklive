# Modelo: Dengas

> **O que é:** o código do Dengas. Contexto e histórico: [apps/dengas/](../../apps/dengas/README.md). Índice: [modelos](../README.md).

| Arquivo | O que é |
|---|---|
| [dengas.js](dengas.js) | o Dengas inteiro: corpo, conversa e cérebro; usa o objeto `Mesa` |
| [board.js](board.js) | a entrada no Board (depois da ponte `mesa`, só no Board principal) |
| [arte/](arte/) | o atlas do sprite (`dengas-atlas.png` + `.json`, quadros de 96 × 96, pé em 48, 88) |

Marcadores: `/*JSON:arte/dengas-atlas.json*/{}` e `/*DATAURL:arte/dengas-atlas.png*/''`. Entra na Mesa (`modelos/mesa/build.ps1`) e no Board (`modelos/board/build.ps1 -Pecas mesa,dengas,...`).
