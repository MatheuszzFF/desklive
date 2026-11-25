# Hover, balões e clique

> **O que é:** como todo app reage ao mouse por cima (hover), mostra balões e recebe cliques, sem piscar nem perder o clique (L1, vale pros três apps). **Quando ler:** antes de criar ou mexer em balão, hover, botão dentro de área de arrasto ou "clique passa". Os bugs que levaram a estas regras estão em [bugs evitados](../referencias/motor/bugs-evitados.md).

## Balão único, por cima de tudo
- **Um balão só por app**, numa camada própria no topo do documento, fora da barra e da forma. Nunca um balão dentro de cada ícone: quando cada ícone é uma camada (leque, lupa, transformações), o ícone seguinte é pintado por cima do balão do anterior.
- Posicionado pela caixa do **ícone visível** (a imagem, que anda com a lupa e o leque), **pro lado de dentro da tela**: acima embaixo, abaixo em cima, à direita na lateral esquerda e vice-versa. Fica a 10 px do ícone e nunca sai da janela (6 px de folga).
- **Tempos (Órbita):** entra depois de **140 ms** parado em cima; de um ícone pro outro, **desliza** (.22 s) sem sumir; sai **160 ms** depois de sair do ícone. Some na hora ao arrastar ou trocar de forma.
- **Não mostra balão onde a informação já aparece:** nomes na coluna larga, números na versão larga, nas pílulas da barra de menu, nos medidores da coluna e no núcleo do canto.

## Hover estável
- **Histerese:** entrar rápido (60–140 ms) e sair devagar (160–420 ms). O leque do canto abre em 70 ms e fecha 380 ms depois de sair da zona dele.
- **"Clique passa" (`setIgnoreMouseEvents`) com atraso:** desliga **na hora** quando o mouse volta pro que se vê, e só liga depois de **140 ms** fora. Assim não fica ligando e desligando nas frestas entre ícones, nem quando a forma muda de tamanho embaixo do mouse. Com o botão pressionado, nunca liga.
- **O ícone não foge do ponteiro:** a lupa e o leque mexem só na imagem; a caixa de clique do botão fica parada, então o hover continua no mesmo ícone.
- **Degrau só pela alça** (ou menu); hover nunca troca de tamanho.
- **Dentro/fora pela geometria, não pelo elemento:** numa forma que muda de tamanho embaixo do mouse, "o mouse está na forma?" se decide pelo retângulo (ou zona) da forma com folga, e não pelo elemento que está embaixo do ponteiro. Folga pequena pra entrar e maior pra sair (Eco: 4 px e 18 px). Quando a janela troca de lugar, essa geometria é deslocada **no mesmo quadro**, senão o mouse parado "sai" da forma por um instante.
- **O relógio da prévia conta da chegada:** o atraso de entrada começa quando o mouse chega e **não reinicia** a cada movimento; senão, com o mouse andando, a prévia nunca abre. Voltar antes do fim da saída cancela a saída.

## Clique
- **Nada é selecionável:** `user-select: none` na raiz do app inteiro (relógio, números, nomes). É um app, não uma página. **Exceção:** texto que é conteúdo pra copiar, como o campo de digitar e o texto das mensagens do Eco (as etiquetas de ação dentro delas continuam fora).
- **Sem sobra de área vazia:** nenhuma forma tem uma caixa fixa maior que o conteúdo. O degrau grande também é do tamanho do que mostra (a conversa ou a lista, o que for maior), com piso e teto. **Meça o conteúdo na largura que ele vai ter** naquele lado e degrau, não na largura atual da janela (fechada, ela é pequena e o texto quebra em várias linhas).
- **Botão dentro de área de arrasto:** nunca segurar o ponteiro (`setPointerCapture`) já no pressionar. Com a captura, o Chromium entrega o clique pro elemento que capturou, e o botão não recebe nada. Segurar só quando o gesto vira arrasto; o toque sem arrastar também é tratado pelo próprio gesto.
- **Sempre uma saída óbvia** de qualquer estado recolhido ou mínimo: clique no botão, clique em qualquer ponto da forma recolhida e clique duplo.
- **Gesto e pega separados:** quando arrastar uma peça faz outra coisa (ex.: girar o vinil da Onda anda na música), a área de **mover** fica visível e com textura de pegar (o aro do quarto de disco, com pontinhos) e o cursor diz o que cada lugar faz: seta circular onde gira, mão **só** onde pega. A área de pegar tem o formato da forma (no quarto de disco, um círculo), nunca o retângulo em volta, e o vazio deixa o clique passar.
- **Nenhum toque troca de forma por acidente:** clique ou giro curto na capa nunca troca de degrau (na Onda, clicar na capa toca ou pausa).

## Janela
- A janela **no destino nunca passa da tela**. O Windows empurra pra dentro uma janela que passa da tela, e o motor adota essa posição. Se a margem extra de uma troca de forma sobrar pra fora numa borda, a barra fica longe dela. Antes de assentar, corte a margem que sobraria fora da tela ([janela sem tremer](motion/janela-sem-tremer.md)).
- **Também no meio de uma troca de forma:** a caixa que o app pede pra janela é cortada na tela **a cada quadro**. Senão uma peça que ainda está saindo de trás da borda (a mola dela ainda está lá fora) faz a janela pedir mais que a tela: o Windows prende, a janela anda sozinha e o motor não assenta (Onda: vinil saindo do canto, janela de 1412 × 608 presa "andando").
