# Passo 3: uma forma e uma interação por lado

> **O que é:** como desenhar uma forma **e** uma interação únicas em cada lado, canto e degrau (inclusive o mínimo), fundidas à borda com ombros côncavos e descolando como líquido. É a **regra nº 1** (R20). **Quando ler:** depois do [passo 2](02-mover-e-encaixar.md); é o passo mais longo. Exemplo trabalhado: o [Eco](../apps/eco/README.md). Índice: [guia](README.md).

## A regra em uma linha

Cada lugar da tela é uma forma: nunca a mesma peça girada ou empurrada até a borda, nunca só se esconder numa aba. E o tamanho mínimo é tão trabalhado quanto o grande.

## 1. Liste os lugares e os degraus

São cinco lugares: **topo**, **embaixo**, **laterais** (esquerda e direita espelhadas), **cantos** (os quatro espelhados) e **solta**. Multiplique pelos **degraus** (do mínimo ao grande) e pelos estados (**repouso**, **prévia** com o mouse em cima, **aberto**). Essa é a sua matriz: a tabela "Formas por lado e canto" do [modelo](../templates/novo-app.md).

## 2. Uma metáfora por lugar

Tire a forma da função do app e da borda em que ela encosta:

| Lugar | Órbita (barra) | Onda (player) | Eco (assistente) |
|---|---|---|---|
| Topo | barra de menu fina | faixa com a onda como horizonte | **ilha** |
| Embaixo | doca | prateleira com equalizador | barra de comando |
| Laterais | coluna com medidores | coluna com o nome em pé | espinha |
| Cantos | leque radial | quarto de disco (vinil) | quarto de órbita |
| Solta | pílula | capa e onda | marca e pílula |

## 3. O exemplo: o Eco, lugar por lugar

| Lugar | Repouso vivo (mínimo) | Interação própria |
|---|---|---|
| **Topo: ilha** | respira na largura e incha na direção do mouse que chega | ímã: forma e marca andam pro lado do mouse, como se ele puxasse |
| **Laterais: espinha** | um feixe de luz desce por ela; a marca desliza até a altura do mouse | desenrola acompanhando a altura do mouse; no grande, o histórico vira abas na espinha |
| **Embaixo: barra de comando** | um cursor pisca no fim do traço, como um campo esperando | o traço se estica até o mouse e uma luz corre atrás dele |
| **Cantos: quarto de órbita** | um anel com um satélite varrendo a diagonal | o arco de sugestões gira até o ângulo do mouse |
| **Solta** | a marca olha pro mouse | clique abre a pílula pro lado de dentro da tela |

Os tamanhos de cada estado estão na tabela do [README do Eco](../apps/eco/README.md) (seção "Forma e tamanho por lado e estado"), e o repouso na seção "Repouso".

**Um jeito de achar a interação:** o mouse mexe na dimensão que aquela forma tem. Ao longo da borda no topo e embaixo, na altura nas laterais, no ângulo nos cantos. Na Onda: a rodinha no topo, clicar no equalizador embaixo, deslizar na coluna, girar o vinil no canto. É um ponto de partida, não receita.

## 4. O mínimo também é vivo

- Deixe uma folga em volta da forma em repouso e use-a pra **sentir o mouse chegando**, antes da prévia abrir (no Eco, uma proximidade de 0 a 1 que incha, estica ou move peças).
- Cada lugar reage de um jeito: o Eco respira, pisca, varre; a Órbita **acorda por proximidade** ([degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md)); a Onda esconde a capa **atrás da borda** e a faz deslizar pra dentro ([interação da Onda](../apps/onda/interacao.md), "Mínimo, cada borda do seu jeito").
- Sempre uma saída óbvia de todo estado mínimo ou recolhido: clique na forma ou clique duplo ([hover e balões](../padroes/hover-e-baloes.md)).

## 5. Fundir à borda e descolar

- **Ombros côncavos:** encostado, a forma vai até a beirada, as quinas daquele lado ficam retas e uma curva invertida liga a forma à borda nas pontas. Três jeitos testados: path SVG refeito a cada quadro (Órbita), canvas 2D (Onda) ou `border-radius` com dois quadradinhos de máscara radial (Eco). Escolha um ([fusão com a borda](../padroes/motion/fusao-com-a-borda.md)).
- **A fusão é gradual:** acontece nos últimos px antes de encostar, numa mola mole, com um pequeno balanço.
- **Descolar como líquido:** puxando pra longe, a forma estica, afina e solta. Na Onda é um **pescoço líquido**; no Eco, a forma vira uma gota atrás da marca e, ao encaixar, nasce de novo da marca como um círculo.

## 6. Uma forma vira a outra

Trocar de lado ou de degrau só muda os **alvos**; a mola persegue. Três técnicas: **FLIP** (Órbita), uma mola por peça com uma tabela de arranjos espelhada (Onda) ou a geometria inteira em variáveis CSS na mesma mola (Eco). Detalhes em [troca de forma](../padroes/motion/troca-de-forma.md). Como o **sensor de borda** já reorganiza no arrasto, a troca acontece enquanto você arrasta.

## Pronto quando

- [ ] A matriz está cheia: cada lugar × degrau × estado tem forma e interação descritas, com medidas.
- [ ] Nenhuma forma é outra girada; o mínimo de cada lugar reage ao mouse.
- [ ] Encostado em qualquer lado e canto, aparecem os ombros; puxando, descola como líquido.
- [ ] Prints de cada lado e canto em repouso, prévia e aberto ([passo 6](06-testar-sem-mexer-no-pc.md)).

Próximo: [hover e interação](04-hover-e-interacao.md).
