# Navegador — sites e vídeo dentro do quadro

> **O que é:** o doc L2 do Navegador. **Quando ler:** antes de mexer em como o quadro abre sites e vídeos. Comum a todos: [padroes/](../../padroes/README.md). Histórico: [refinos](refinos.md). Código: [modelos/navegador/](../../modelos/navegador/README.md).

- **Conteúdo:** um widget com um furo: o site aparece pelo furo, numa janela própria do Edge que fica logo abaixo do quadro.
- **Uma função:** abrir sites e vídeos dentro do quadro (o app do Claude barra página de fora embutida) e deixar o assistente ler e navegar neles. Não digita em página nenhuma.
- **Atalho / teclado:** não tem.
- **Barramento:** comandos `tocar`, `abrir_site`, `ler_tela`, `clicar`, `rolar`, `voltar`, `fechar_janela`; evento `video:abriu`.
- **Helpers:** um PowerShell residente que abre, posiciona e fecha a janela do Edge (perfil próprio em `~/.mesa/edge`, que guarda os logins) e lê a página pela porta de depuração local.

## Como é feito

### Estrutura
- A janela do Edge é posta no retângulo físico do furo (pelo Board: zoom e monitor certos), sem moldura, fora da barra de tarefas e do Alt+Tab, logo abaixo da janela do quadro (que é "sempre por cima"). Reordena a cada 1,5 s.
- A barra de título que o Edge desenha é escondida subindo a janela e recortando.
- Ler, clicar, rolar e voltar: funções escritas no widget rodam na página pelo `Runtime.evaluate`; o que vem do assistente entra só como dado.

### Formas por lado e canto (incluindo o tamanho mínimo)
No Board é uma peça comum (640 × 420), com as formas do núcleo.

### Interação única de cada forma
Dentro do furo o clique vai pro site; fora dele, arrasta a peça.

### Degraus de tamanho e alça
Ainda não.

### Motion
O do núcleo; a janela do Edge acompanha o furo (60 ms).

### Visual
Fundo escuro com o campo de busca embaixo; o resto é o site.

## Testado
- Neste PC: abrir, ler, clicar num link, voltar, mover e fechar a janela; janela fora da barra de tarefas e fora da camada "sempre por cima".
- Não testado no app: o encaixe visual dentro do Board com o fundo de mesa.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [refinos.md](refinos.md) | o histórico |
