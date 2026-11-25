# Passo 4: hover e interação limpa

> **O que é:** como o app reage ao mouse sem piscar, mostra o **balão** por cima de tudo e nunca perde um clique: hover estável, nada selecionável, pega separada dos gestos, sem área vazia sobrando e com tetos de tamanho (R23). **Quando ler:** depois do [passo 3](03-forma-por-lado.md), antes de pôr qualquer balão ou botão. Os números de cada app: [hover e balões](../padroes/hover-e-baloes.md). Índice: [guia](README.md).

## Balão: um só, por cima de tudo

- **Um balão por app**, numa camada própria no topo do documento, fora da forma. Balão dentro de cada ícone acaba coberto pelo ícone seguinte assim que os ícones viram camadas (lupa, leque).
- Posicione pela caixa do **ícone visível**, sempre pro lado de dentro da tela, e nunca pra fora da janela.
- Não mostre balão onde a informação já aparece (nomes numa coluna larga, números numa versão larga).

## Hover estável

- **Histerese:** entre rápido e saia devagar. Voltar antes do fim da saída cancela a saída.
- **O relógio da prévia conta da chegada** e não reinicia a cada movimento, senão com o mouse andando ela nunca abre.
- **Dentro/fora pela geometria, não pelo elemento:** numa forma que muda de tamanho embaixo do mouse, decida pelo retângulo (ou zona) da forma, com folga. Quando a janela troca de lugar, desloque essa geometria **no mesmo quadro**.
- **"Clique passa" com atraso:** desliga na hora quando o mouse volta pro desenho e só liga depois de um tempinho fora. Com o botão pressionado, nunca liga.
- **Nada foge do ponteiro:** a lupa e o leque mexem só na imagem; a caixa de clique fica parada.

```
dentro  = retângulo da forma + folga (pequena pra entrar, maior pra sair)
prévia  abre se dentro há ≥ T_entra, contado da chegada
prévia  fecha se fora há ≥ T_sai   (T_sai > T_entra)
clique passa liga se fora há ≥ T_cp e nenhum botão pressionado
```

## Clique

- **Nada selecionável:** `user-select: none` na raiz do app. É um app, não uma página. Exceção: texto que é conteúdo pra copiar (um campo de digitar, uma conversa).
- **Botão dentro da área de arrastar:** só segure o ponteiro quando o gesto virar arrasto ([passo 2](02-mover-e-encaixar.md)).
- **Degrau só pela alça** (ou por um menu). Hover nunca troca de tamanho, e um toque curto numa peça nunca troca de forma por acidente.
- **Sempre uma saída óbvia** de qualquer estado mínimo ou recolhido.

## Pega separada dos gestos

Quando arrastar uma peça faz outra coisa (girar o vinil da Onda anda na música), a área de **mover** precisa ser outra, visível e com textura de pegar. O cursor diz o que cada lugar faz: seta circular onde gira, mão **só** onde pega. A área de pegar tem o formato da forma (num quarto de disco, um círculo), nunca o retângulo em volta, e o vazio deixa o clique passar. Exemplo: o aro de pega do quarto de disco em [formas e degraus da Onda](../apps/onda/formas-e-degraus.md).

## Sem sobra, com teto

- **Nenhuma caixa fixa maior que o conteúdo**, nem no degrau grande: ele tem o tamanho do que mostra, com **piso e teto**. O teto é uma fração da área útil da tela; passou dele, **reorganize** (peça menor, lista mais curta, peças lado a lado) em vez de crescer (exemplo: o [teto de tamanho da Onda](../apps/onda/formas-e-degraus.md#teto-de-tamanho)).
- **Meça o conteúdo na largura que ele vai ter** naquele lado e degrau, não na largura atual da janela (fechada, ela é estreita e o texto quebra em muitas linhas).
- **A janela no destino nunca passa da tela**, e no meio de uma troca a caixa pedida é cortada na tela a cada quadro. Senão o Windows empurra a janela pra dentro e o app fica longe da borda.
- Exemplos com antes → depois: os tamanhos do grande no [registro do Eco](../apps/eco/refinos.md) (v22).

## Pronto quando

- [ ] No simulador, com o mouse andando, a prévia abre e não fecha sozinha em nenhum lado; o "clique passa" não troca no meio do hover.
- [ ] O balão nunca fica por baixo de nada nem cortado; nenhum texto aparece selecionado.
- [ ] Todo botão responde; a mão só aparece onde dá pra mover.
- [ ] Nenhum degrau tem área vazia; o grande cabe na tela em todo lado e canto.
- [ ] Cada item acima conferido contra [bugs evitados](../referencias/motor/bugs-evitados.md).

Próximo: [visual e motion](05-visual-e-motion.md).
