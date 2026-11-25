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

## Clique
- **Nada é selecionável:** `user-select: none` na raiz do app inteiro (relógio, números, nomes). É um app, não uma página.
- **Botão dentro de área de arrasto:** nunca segurar o ponteiro (`setPointerCapture`) já no pressionar. Com a captura, o Chromium entrega o clique pro elemento que capturou, e o botão não recebe nada. Segurar só quando o gesto vira arrasto; o toque sem arrastar também é tratado pelo próprio gesto.
- **Sempre uma saída óbvia** de qualquer estado recolhido ou mínimo: clique no botão, clique em qualquer ponto da forma recolhida e clique duplo.

## Janela
- A janela **no destino nunca passa da tela**. O Windows empurra pra dentro uma janela que passa da tela, e o motor adota essa posição. Se a margem extra de uma troca de forma sobrar pra fora numa borda, a barra fica longe dela. Antes de assentar, corte a margem que sobraria fora da tela ([janela sem tremer](motion/janela-sem-tremer.md)).
