# Onda — registro de refinos

> **O que é:** o histórico de cada refino do app Onda, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Quarto de disco proporcional, pega clara e hover estável (v17)
- **Pedido:** "o comportamento de hover [ta] bem bugado ... quando aumento tamanho, o espaço ao redor dele fica tao grande exagerado q mal consigo mover ele" (vídeo da Onda no canto de cima à direita).
- **Onde:** quarto de disco em todos os degraus; clique na capa; hover e "clique passa" em todas as formas; a janela no meio das trocas.
- **Antes → depois:**
  - disco: vinil de 92 / 130 / 170 longe do canto, corpo R 226 / 362 / 448 e controles a 198 / 338 / 422 (quase tudo vazio) → vinil com centro no canto (raio 104 / 150 / 196), onda a 120 / 172 / 220, controles a 150 / 210 / 262, corpo R 180 / 248 / 302;
  - pega: área de mover = retângulo inteiro com mão → círculo do raio R, com aro de 12 px e pontinhos; seta circular no vinil;
  - clique na capa: trocava de degrau (e um giro curto também) → toca ou pausa; degrau só pela alça ou menu;
  - hover: entrava na hora e o "clique passa" ligava a cada fresta → entra em 80 ms, sai em 420 ms, "clique passa" só depois de 160 ms fora;
  - janela: podia pedir mais que a tela quando o vinil saía do canto (1412 × 608 presa "andando") → caixa cortada na tela a cada quadro;
  - nome sobre o vinil num rótulo de vidro; nada selecionável.
- **Por quê:** sobra de espaço, mão em área vazia, pulo de forma ao encostar na capa e hover piscando.
- **Docs atualizados:** [README](README.md), [hover e balões](../../padroes/hover-e-baloes.md), [bugs evitados](../../referencias/motor/bugs-evitados.md).
- **Testado** (simulador, navegador do app, tela de 1600 × 900, cliques e hover reais): prints do quarto de disco compacto, expandido e grande; clique no vinil pausa sem trocar de degrau; girar 27° sem mover; aro é área de pegar e o canto vazio do retângulo deixa o clique passar; arrastar pelo aro solta a Onda e ela assenta (786 × 384, motor parado); hover na tira mínima: exatamente 2 trocas (entrar e sair), sem piscar. **Não testado:** no app instalado.
- **Regras:** R9, R19, R20, R22, R23.

## 2026-11-25 — Cliques dentro da área de arrasto (v16)
- **Pedido:** conferir na Onda o bug achado na Órbita (captura do ponteiro no pressionar engolindo o clique dos botões).
- **Onde:** tudo que fica dentro da área de arrasto: a capa (clique troca de degrau), o play sobre a capa, o nome em pé (clique abre a expandida).
- **Antes → depois:** o gesto do motor segurava o ponteiro já no pressionar (no player), então o clique ia pro player e a capa, o nome em pé e o play da capa não respondiam (confirmado no simulador: clique na capa não trocava de degrau). Agora o gesto é criado **sem captura** e só segura o ponteiro quando vira arrasto (passou de 5 px). Os botões normais, a onda, as barras, a alça e a lista nunca entram no gesto, como antes.
- **Por quê:** a mesma armadilha que prendeu a Órbita recolhida ([bugs evitados](../../referencias/motor/bugs-evitados.md)).
- **Docs atualizados:** este registro e o [CHANGELOG](../../CHANGELOG.md).
- **Testado:** 11 cliques reais no simulador (navegador do app, tela emulada de 1600 × 900), todos certos: play da capa, clique na capa (compacta → expandida), próxima e play nos controles, arrastar pela capa move a janela sem trocar de degrau, alça (compacta → grande), deslizar na coluna (progresso 18% → 73%, janela parada), próxima nos controles da coluna, clique no nome em pé, girar o vinil 90° (sem mover nem trocar de degrau), play nos controles do arco e clique no fio da base (pula pra 75%). **Não testado:** no app instalado.
- **Regras:** R19, R22.

## 2026-11-25 — Arrasto sem trancos (motor v2.1, v15)
- **Pedido:** "muito travado e sem liberdade… fica batendo numa parede e às vezes fica travando frame" (com uma gravação da tela).
- **Onde:** o arrasto e o assentar, em todos os lados.
- **Antes → depois:** um `setBounds` por quadro, até 5 em voo, em vez de esperar a volta do anterior (~50–70 ms no app). Ao assentar, a posição real é conferida com o Windows. A caixa `LR` continua indo junto com o CSS (um commit com CSS espera o anterior entrar). Nada das formas ou do degrau mínimo mudou.
- **Por quê:** na gravação, a janela ficava parada em 43–63% dos quadros do arrasto, com saltos de 90–540 px.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md).
- **Testado:** 15 testes no simulador com ~60 ms de atraso, todos passando, sem nenhum quadro com o conteúdo fora do lugar; janela parada no arrasto lento: 38%. **Não testado:** no app instalado.
- **Regras:** R7, R10, R19.

## 2026-11-25 — Mínimo único em cada borda e canto (v14)
- **Pedido:** "os tamanhos minimos dos apps precisam ser trabalhados bem feito também, e também tem que ser único e interativo".
- **Onde:** degrau mínimo na coluna (laterais), na faixa (topo), na prateleira (base) e no quarto de disco (cantos). A solta não mudou.
- **Antes → depois:**
  - coluna: capa de 64 + barras de 52 × 80 → tira de barras de 26 × 176 sem capa; a capa mora atrás da borda e desliza pra fora com o mouse (a tira desce pra 26 × 150 embaixo dela);
  - topo: capa de 40 + onda de 150 → pílula com capa-bolinha de 30 + horizonte de 170 × 20; com o mouse, o nome desce (200 × 40);
  - base: equalizador de 200 × 26 + capa de 44 → fio de 240 × 18 + capa-bolha redonda de 40 boiando acima e subindo até 7 px no ritmo; com o mouse, o nome do lado (196 × 40);
  - canto: capa redonda de 60 + anel (R 140, anel 114) → quarto de vinil de 152 com centro no canto da tela, com sulcos e reflexo fixo (R 110, anel 92); girar anda na música.
  - Peças atrás da borda contam pro tamanho da janela só até a beira da tela.
- **Por quê:** o mínimo era uma versão encolhida e igual em todo lado; agora cada lugar tem forma e gesto próprios (R20).
- **Docs atualizados:** [README](README.md) (tabela de arranjos, interação do mínimo, raios do disco, "Testado").
- **Testado:** prints no simulador do mínimo em repouso e com o mouse na direita, no topo e na base, e do quarto de vinil em dois cantos. **Não testado:** no app instalado.
- **Regras:** R9, R19, R20, R22.

## 2026-11-25 — Motor de movimento único (v13)
- **Pedido:** refino state of the art do movimento: arrastar e soltar fluido e sem bugs, igual nos três apps.
- **Onde:** arrasto, soltar, encaixe nas bordas e cantos, a caixa da janela (`LR`) mudando de tamanho.
- **Antes → depois:** o motor próprio (arrasto k 900 / ζ 0,95, assentar k 200 / ζ 0,84) virou o motor único (arrasto k 1500 / ζ 1 com *feed-forward*, assentar k 210 / ζ 0,86; colando numa borda, encaixe firme k 240 / ζ 1 + micro-amassado de até 5%). A caixa `LR` agora tem duas versões: a lógica, que vale na hora pro motor, e a do CSS, que só entra quando a janela chega. O desenho do corpo fundido usa a do CSS. Ao pegar: sombra que levanta (até 5 px de deslocamento, 10 px de desfoque, 38% de opacidade). O arrasto termina também por perda de foco ou botão já solto, e o "clique passa" nunca liga com o botão pressionado. O giro do vinil também termina com a perda de foco. Limiar de arrasto: continua 5 px.
- **Por quê:** arrasto que não terminava, o soltar caindo na janela de baixo, e o conteúdo pulando 1 ou 2 quadros quando a caixa mudava.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md), [janela sem tremer](../../padroes/motion/janela-sem-tremer.md).
- **Testado:** 15 testes de estresse no simulador de dois monitores, todos passando; prints arrastando perto da direita (já em coluna) e encaixada. **Não testado:** fps reais no app instalado, DPI misto.
- **Regras:** R7, R9, R19, R20.

## 2026-11-25 — Doc reorganizado (sem mudança no app)
- **O que mudou:** o doc foi movido de `apps/onda.md` pra esta pasta e dividido em arquivos menores. Nenhum comportamento, número ou visual do app mudou.
- **Antes do registro:** os refinos anteriores (até a v12 do Eco, as formas por lado da Órbita e da Onda) estão consolidados no README e não têm entrada própria.
