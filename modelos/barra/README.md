# Modelo: Barra

> **O que é:** com o Board aberto, a barra de tarefas do Windows não aparece (em todas as telas). Índice: [modelos](../README.md).

| Arquivo | O que é |
|---|---|
| [barra.js](barra.js) | o ajudante PowerShell que esconde a barra (ShowWindow na janela dela, a cada segundo) e a mostra ao fechar; item no menu do Board |
| [board.js](board.js) | a entrada no Board (depois da ponte `mesa`) |

- O app do Claude não tem opção pra isso: é uma mensagem direta à janela da barra (`Shell_TrayWnd` e `Shell_SecondaryTrayWnd`), nenhuma tecla.
- Fechou o Board, a barra volta (o ajudante perde a entrada e mostra). Se o PC cair, o Windows recria a barra ao reiniciar.
- A tecla Windows continua abrindo o menu Iniciar.
- Menu do Board: "Mostrar a barra de tarefas" / "Esconder a barra de tarefas" (lembra a escolha).
- Precisa do acesso total. Entra na montagem com `-Pecas …,barra`.
