# Janelas — programas do Windows dentro do quadro

> **O que é:** o doc L2 das Janelas. **Quando ler:** antes de mexer em como o quadro traz programas do Windows. Código: [modelos/janelas/](../../modelos/janelas/README.md). Molde de widget: [moldura](../board/moldura.md).

- **Conteúdo:** cada janela trazida vira uma peça do Board (uma [moldura](../board/moldura.md): âncora, tamanhos, bordas, motion), com o programa de verdade aparecendo pelo furo, sem a barra de título e sem a moldura do Windows.
- **Uma função:** tirar a cara do Windows: abrir ou puxar qualquer programa pra dentro do quadro e devolver quando quiser.
- **Barramento:** app sem janela `janelas` com `listar_janelas`, `trazer_janela`, `abrir_programa`, `devolver_janela`, `fechar_programa`; cada widget de janela tem `recortar` e `devolver`.
- **Helpers:** um PowerShell residente que só usa mensagens do Windows direto na janela (SetWindowLong, SetWindowPos, SetWindowRgn, WM_CLOSE). Nenhuma tecla, nenhum clique simulado.

## Como é feito
- A janela perde título e moldura, sai da barra de tarefas e do Alt+Tab e fica logo abaixo do Board (HWND_NOTOPMOST), no retângulo físico do furo. Reordena a cada 1,5 s e acompanha o furo a cada 60 ms.
- **Recorte:** o que o programa desenha por dentro (barra de rolagem, título próprio, menu) some recortando a região da janela: px por lado, lembrado por programa. O botão ⇥ corta a barra de rolagem da direita (17 px).
- **Devolver:** a janela volta com o estilo, a posição e o tamanho de antes. Fechar o widget devolve; fechar o Board devolve todas; se o Board cair, a próxima abertura devolve as órfãs (`~/.orbita/janelas-adotadas.json`).
- **Cuidado:** Bloco de Notas e Explorer reaproveitam a mesma janela pra tudo. `abrir_programa` pode trazer uma janela que já existia, e `fechar_programa` fecha as abas e pastas dela. Pra tirar do quadro sem fechar, `devolver_janela`.
- Só no Board principal; a peça não passa pro Board 2 (`passavel:false`).

## Testado
- O ajudante, de verdade, com o Bloco de Notas (26/11): abriu, tirou a moldura (estilo 0x14CF0000 → 0x14000000), recortou, moveu, gravou a órfã, devolveu igualzinho e fechou.
- O widget no Board: só no simulador (lista de apps e comandos). A janela de verdade presa ao widget no app instalado ainda não.
