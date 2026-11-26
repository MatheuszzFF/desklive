# Dengas — refinos

> Antes de ganhar pasta própria, o Dengas morava na Mesa: o histórico daquele tempo está em [apps/mesa/refinos.md](../mesa/refinos.md).

## 2026-11-27 · Pasta própria e Board
- **O que:** o código saiu de `modelos/mesa/widgets/00-dengas.js` pra `modelos/dengas/dengas.js`, com a arte em `modelos/dengas/arte/`. Entra no Board pelo `board.js` dele, igual ao da Mesa (o chat da Mesa ficou, a pedido).

## 2026-11-27 · Bolinha nos cantos e nas laterais
- **Pedido:** batendo ele num canto de baixo, ele não virava a bolinha.
- **O que:** solto ou arremessado perto de uma lateral (110 px, a posição projetada pelo embalo de 0,15 s), vira o disco de 64 px só com o rostinho (piscando, olhando, feliz, falando; recorte 52 × 52 do atlas a partir de 22, 24, como no Dengas do molde do Eco), com o anel coral, e gruda: canto se também estiver perto de cima ou de baixo, senão na lateral, na altura em que soltou. Puxou, volta a ser o ratinho inteiro. Na bolinha ele não passeia; balão e conversa saem dela.
- **Testado:** simulador (canto de baixo à direita, canto de baixo à esquerda, lateral direita, puxar de volta, clique abre a conversa). **Não testado:** no app instalado.

## 2026-11-27 · Mais calmo, baixo na mão, rabinho marrom e rosto preto
- **Pedido:** "ta mto agitado, as animacoes estao mto rapidas e repetitivas"; gracinhas só de vez em quando; idle paradinho; tocar baixo sem sacar e guardar toda hora; rabinho marrom como orelhas e patas; rosto todo preto, sem branco no queixo.
- **O que:** laço parado e sentado em 60 % da velocidade, com pausas de 1,8 a 5,2 s num quadro; gracinhas a cada 45 a 120 s, sem repetir a última; passeio a cada 50 a 120 s; sentado e quieto há 3 min, cochila (acorda com o mouse a menos de 220 px, clique ou fala). Baixo: estado `D.baixo` (salvo), saca uma vez (`t_baixo`), alterna tocar e segurar parado, guarda ao contrário; ferramenta `baixo` (pegar/guardar) pro Claude e chip "Bora tocar" / "Guardar o baixo".
- **Arte (sem geração):** o atlas foi repintado por script: rabo inteiro na rampa marrom das orelhas (todas as linhas), e o branco e o cinza do queixo, dos dentes e da garganta (olhando pra cima) viraram pelo preto. Bigodes e brilho dos olhos ficaram.
- **Testado:** simulador (sequência de quadros: parado com pausas, saca o baixo uma vez e fica tocando/segurando). **Não testado:** no app instalado, cochilo de 3 min.
