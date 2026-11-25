# Órbita — barra de tarefas

> **O que é:** o doc L2 da Órbita, a barra de tarefas (apps, anéis de CPU/RAM/placa, relógio). **Quando ler:** antes de criar, refinar ou depurar qualquer coisa da Órbita. O comum a todos os apps está em [padroes/](../../padroes/README.md); anéis, medidores e visual em [visual.md](visual.md); o histórico em [refinos.md](refinos.md).

- **Conteúdo:** apps fixados (o brilho mostra o que está rodando), anéis de CPU, RAM e placa de vídeo (cores ≤70 / 70–80 / >80 °C), relógio. Recolhe e expande.
- **Formas por lado** ([padrão](../../padroes/layout-posicao-e-tamanho.md)):
  - embaixo, uma doca;
  - em cima, uma barra de menu fina;
  - nas laterais, uma coluna com medidores verticais;
  - nos cantos, um leque radial;
  - solta, uma pílula.
  Encostada, ela se funde à borda com ombros côncavos, e cada forma tem a sua interação.
- **Ajudante:** `orbita-helper.ps1` ([arquitetura](../../padroes/arquitetura.md)).
- **Barramento:** escreve `eco-ancora.json`.
- **Não faz:** música nem Claude. Cada função grande é um app próprio (R16).

## Como é feito

A linguagem de movimento comum (molas, ombros, motor, janela sem tremer) está em [padroes/motion](../../padroes/motion/README.md). Aqui fica o que é só da Órbita.

### Estrutura
- O lado fica em `html[data-o]` (`bottom`, `top`, `left`, `right`, `bl`, `br`, `tl`, `tr`), com as classes `ohz` (deitada), `ovt` (coluna) e `ocn` (canto). `ofloat` marca a barra **solta**, longe da borda. O degrau fica em `html[data-t]` (`slim`, `normal`, `wide`).
- **Uma barra só, rearranjada.** O mesmo DOM (apps, separador, anéis, relógio, botão de recolher, alça) muda de forma só com CSS por lado. A troca é animada por FLIP ([troca de forma](../../padroes/motion/troca-de-forma.md)).
- **A ilha** é um `<svg>` atrás da barra, com o path recalculado a cada quadro. É ela que se funde à borda ([fusão com a borda](../../padroes/motion/fusao-com-a-borda.md)).
- A janela começa em 1100 × 132 e depois passa a ter o tamanho do conteúdo. As margens (`PADS`) ficam por dentro: 50 px nas laterais e 62 px do lado de dentro pros balões (196 px no lado de dentro da coluna), com só `G = 12` do lado da borda.

### Forma e interação por lado
| Lado | Forma | Interação própria |
|---|---|---|
| **Embaixo (doca)** | Ícones de 38 px em botões de 52 px, gap de 8 px, pontinho de "aberto" de 4 px embaixo | **Lupa estilo doca:** pra cada ícone, `d = (x_mouse − centro) / (78 × escala)` e `k = e^(−d²)`; a escala vira `1 + 0,5·k` e o ícone sobe `15·k` px. Enquanto o mouse anda, a transição é linear de .09 s; ao sair, volta em .34 s `--spring`. |
| **Em cima (barra de menu)** | Ícones de 19 px, apps à esquerda, relógio no meio, CPU/RAM/placa como **pílulas** de texto com uma linha de 2 px embaixo que enche com o valor | A pílula sob o mouse se abre e mostra o **mini gráfico** (largura 0 → 46 px em .4 s `--spring`). As pílulas nascem de `scale(.55)` em .55 s `--springy`. |
| **Laterais (coluna)** | Relógio empilhado (horas sobre minutos, minutos apagados), **medidores verticais** de 8 × 44 px que enchem de baixo pra cima com degradê da cor do estado | Com o mouse nos medidores, eles alargam pra 12 px, **enchem de novo** do zero (.7 s `--springy`) e mostram o número em cima. |
| **Cantos (leque radial)** | Um núcleo no canto com relógio e **três anéis concêntricos** (r 46 / 39,5 / 33 num `viewBox` 100, traço 3,4); os apps fechados viram pontinhos de 6 px na cor do app em volta do núcleo | Com o mouse a menos de `raio do núcleo + 70 × escala` px, os pontinhos **se afastam 14 px e acendem** (escala 1,45), antecipando o leque. Em cima do núcleo, o leque **abre em 70 ms**: 3 apps num arco de dentro e o resto num de fora. Ele fecha 380 ms depois que o mouse sai de uma zona de 196 × escala px. |
| **Solta (pílula)** | Barra deitada compacta | O contorno da ilha acende de leve com o mouse em cima (`rgba(255,255,255,.17)`). |

**Medidas do leque por degrau** (`CORNER`):

| Degrau | Caixa | Centro do núcleo | Raio do núcleo | Arco de dentro | Arco de fora |
|---|---|---|---|---|---|
| fina | 224 | 32 | 22 | 96 | 152 |
| normal | 236 | 38 | 34 | 102 | 162 |
| larga | 282 | 50 | 46 | 128 | 198 |

Cada arco ocupa os 90° do quarto, com os apps em `90° × (j + 0,5) / n`. Fechados, os pontinhos ficam em `raio do núcleo + 14`, distribuídos de 8° a 82°.

### Sentir lado e encaixar
- O layout segue **o mouse** durante o arrasto. A troca de lado tem histerese: canto a < 160 px (fica até 230), lateral a < 230 px (fica até 300) e mais perto que o vertical + 60, topo a < 250 px (fica até 330). Senão, vira barra deitada embaixo.
- Ao soltar, encosta se estiver a < 60 px da posição encostada (130 px nas laterais). Também centraliza sozinha quando o meio dela fica a < 30 px do meio da borda.
- Ao assentar numa borda, usa a mola firme com micro-amassado contra ela. O "sentir" da Órbita: inclina até ±3° (× 0,35), estica até 5 % por eixo e levanta 2 % ao pegar ([sentir o arrasto](../../padroes/motion/sentir-o-arrasto.md)).

### Degraus de tamanho
- **fina** (só os ícones; é o tamanho mínimo), **normal** e **larga** (anéis com número, rótulo e **mini gráfico**; a música tocando; a data completa; na coluna, a lista com o **nome** dos apps em botões de 184 px).
- **Alça:** um traço de 3 × 18 px na ponta da barra (embaixo na coluna, na diagonal do núcleo no canto, apontando pra dentro). Puxando, a barra **estica elástica** na direção da alça: `1 + sinal × (1 − e^(−1,4·p)) × 4,5 %`. A cada **52 px** troca de degrau, com o mesmo morph da troca de lado e o lado da borda parado. Nas pontas (já no maior ou no menor), cede só 35 %. Clique duplo volta pra normal. Três pontinhos mostram o degrau atual.
- **Zoom** (separado dos degraus): 0,85 / 1 / 1,15 / 1,3, entre 0,7 e 1,5. `Ctrl` + rodinha muda 5 % por clique.
- **Recolher** (setinha): esconde apps, separador e status, com o FLIP ancorado no próprio botão.

## Testado

Ainda não registrado neste doc. O teste é no simulador `orbita-sim.html` (localhost, gancho `window.__orb`), nunca no mouse do PC (R19). O próximo refino preenche esta seção: o que foi conferido por print (cada lado, canto e degrau) e o que ficou "não testado" no app instalado.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [visual.md](visual.md) | anéis e medidores (raios, cores, mini gráfico) e o visual (tokens, fontes, halos, ícones) |
| [refinos.md](refinos.md) | registro de cada refino, com data e números |
