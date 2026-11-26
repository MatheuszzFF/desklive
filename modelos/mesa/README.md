# Modelo: Mesa (a ponte no Board)

> **O que é:** a ponte que dá aos apps escritos pra Mesa (o Dengas, o Navegador, a Onda e a Órbita hospedadas) o objeto `Mesa` que eles conhecem, feito com o [Board](../board/README.md). A Mesa como app próprio (uma janela com widgets) foi aposentada em 27/11/2026: o Board é a base. Contexto e histórico: [apps/mesa/](../../apps/mesa/README.md). Índice: [modelos](../README.md).

| Arquivo | O que é |
|---|---|
| [board.js](board.js) | a ponte: widget da Mesa vira peça do Board, app hospedado vira iframe com a "janela de mentira", camada do Dengas com alvos que pegam o mouse, papel de parede e fundo de mesa, chaves do Spotify, atalhos no menu |

Entra primeiro na montagem: `build.ps1 -Pecas mesa,dengas,onda,navegador,orbita`.
