# Dengas — refinos

> Antes de ganhar pasta própria, o Dengas morava na Mesa: o histórico daquele tempo está em [apps/mesa/refinos.md](../mesa/refinos.md).

## 2026-11-27 · Pasta própria e Board
- **O que:** o código saiu de `modelos/mesa/widgets/00-dengas.js` pra `modelos/dengas/dengas.js`, com a arte em `modelos/dengas/arte/`. Entra no Board pelo `board.js` dele, igual ao da Mesa (o chat da Mesa ficou, a pedido).

## 2026-11-27 · Bolinha nos cantos e nas laterais
- **Pedido:** batendo ele num canto de baixo, ele não virava a bolinha.
- **O que:** solto ou arremessado perto de uma lateral (110 px, a posição projetada pelo embalo de 0,15 s), vira o disco de 64 px só com o rostinho (piscando, olhando, feliz, falando; recorte 52 × 52 do atlas a partir de 22, 24, como no Dengas do molde do Eco), com o anel coral, e gruda: canto se também estiver perto de cima ou de baixo, senão na lateral, na altura em que soltou. Puxou, volta a ser o ratinho inteiro. Na bolinha ele não passeia; balão e conversa saem dela.
- **Testado:** simulador (canto de baixo à direita, canto de baixo à esquerda, lateral direita, puxar de volta, clique abre a conversa). **Não testado:** no app instalado.
