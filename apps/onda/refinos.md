# Onda — registro de refinos

> **O que é:** o histórico de cada refino do app Onda, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Tremida quadro a quadro, emenda como borda, dois passos (v21.1)
- **Pedido:** "uns frame que fica tremendo, mo doideira" (medir quadro a quadro); "essa divisão dos monitores tem que ser considerada canto"; R25 (nada pisca nem pula).
- **Onde:** motor-piloto (monitor, portal), tamanho da janela, zona (borda e metade), hover.
- **Antes → depois:**
  - **Canto** (42–45 s, saltos de 20–80 px por 1 quadro): portal no envio → junto do CSS no `resize`; hover pela janela pedida → pela real.
  - **Borda de cima/esquerda com tamanho:** 1 commit (quadro velho de até 157 px no vídeo, 682 no simulador) → dois passos. No simulador, 59 → 3 commits de risco.
  - **Emenda:** passagem → borda e canto, cada monitor com a sua área útil. Rápido (> 600 px/s) passa; grudado segura até 1000 px/s; empurrar o ponto pego pro outro lado atravessa. Monitor com histerese 55/45 (fantasma de 10,93 s).
  - **Zona:** borda pela âncora → pelo ponto pego (5 → 2 trocas chegando no canto da emenda).
- **Números da análise:** [diário](../../diario/2026-11.md) (tabela por trecho, com quadros, série e amplitude).
- **Docs atualizados:** [janela sem tremer](../../padroes/motion/janela-sem-tremer.md), [sensor de borda](../../padroes/motion/sensor-de-borda-e-encaixe.md), [motor-piloto](../../referencias/motor/motor-piloto.md), [como medir](../../referencias/ambiente/como-medir.md), [bugs e lições](../../referencias/motor/bugs-e-licoes.md), [README](README.md), [CHANGELOG](../../CHANGELOG.md).
- **Testado** (simulador, Chrome):
  - emenda: 5 casos no `#duplo`;
  - 16 cantos × hover: 0 tremidas;
  - 16/16 arrastos, zigue-zague com 2 trocas;
  - `grabtest` sem piora;
  - commits com quadro velho possível 59 → 3.
  - **Não testado:** no app instalado (canto e emenda só se provam lá, pelo registro ou por vídeo novo).
- **Regras:** R7, R9, R19, R22, R24, R25, R26.


## 2026-11-25 — Ponto de pega invariante, registro, progresso, nada pisca (v21)
- **Pedido:** "a posição do app em relação ao meu mouse, onde eu estava clicando inicialmente ta mudando muito" (troca de forma, espelho, tamanho no meio do arrasto); "bugar com o click segurando ali na parada de arrastar o tempo da musica"; medir com cuidado o vídeo de 1 min.
- **Onde:** arrasto, deslizar do progresso, menu (registro), motor-piloto.
- **Antes → depois:**
  - **Ponto de pega:** a âncora ficava embaixo do mouse e o ponto pego escorregava → peça pega + fração, `nudge` no mesmo quadro, estica e inclina em volta do ponto pego. Erro parado 1–200 px → ≤ 0,4 px; salto na troca 2–108 → 0–4 px ([ponto de pega](../../padroes/motion/ponto-de-pega.md#situação-25112026)).
  - **Zona:** decidida pela âncora → pelo ponto pego (na emenda, 14 → 2 trocas).
  - **Caixa da janela:** presa na tela no arrasto → só a forma nova, encolhendo na hora.
  - **Progresso:**
    - o soltar perdido deixava a prévia "segurando" → perder a captura aplica e fecha (onda, barras, tira, vinil);
    - só o botão esquerdo;
    - mover sem botão também fecha;
    - o "clique passa" não liga com botão pressionado, e um pressionar o desliga.
  - **Área de toque:** a linha da onda (~4 px) → pega a 9 px acima e abaixo e a 6 px antes (onda, barras, tira).
  - **Piscadas:** esconder 2 quadros → nunca esconde (R25).
  - **Registro:** novo, no menu **Gravar diagnóstico** ([como medir](../../referencias/ambiente/como-medir.md#2-modo-de-registro-trace-no-app)); salva `~/.orbita/onda-trace.json`.
- **Vídeos analisados:**
  - curto: em 1,3 / 3,1 / 3,7 s, pressionar logo acima ou antes da onda fina caía na área de trabalho e desenhava o retângulo azul de seleção;
  - de 1 min: em ~14 s, o expandido cruzando o meio da tela vira de cima pra baixo e a capa anda ~80 px em relação ao mouse (o mesmo em cada troca de lado); as piscadas, a emenda e a tremedeira estão nos [bugs 25–27](../../referencias/motor/bugs-e-licoes.md).
- **Docs atualizados:** [ponto de pega](../../padroes/motion/ponto-de-pega.md), [motor-piloto](../../referencias/motor/motor-piloto.md), [bugs e lições](../../referencias/motor/bugs-e-licoes.md), [diário](../../diario/2026-11.md), [README](README.md) (Testado), [CHANGELOG](../../CHANGELOG.md).
- **Testado** (Chrome, simulador imitando o host, sem mouse real):
  - `grabtest` em 12 casos (números acima);
  - emenda com 2 monitores;
  - 16/16 arrastos com a janela dentro da tela;
  - zigue-zague com 2 trocas;
  - deslizar com perda de captura, botão direito e mover sem botão;
  - o registro gera o arquivo com quadros e eventos.
  - **Não testado:** no app instalado. Os bugs 26 (fantasma da emenda) e 27 (tremedeira no canto) não reproduzem no simulador e ficam pro registro.
- **Regras:** R7, R9, R19, R22, R24, R25, R26.


## 2026-11-25 — App piloto: motor-piloto, emenda como portal, hover pelo cursor real (v20)
- **Pedido:** a Onda vira o app piloto (R24): aplicar as receitas do [ambiente](../../referencias/ambiente/receitas-recomendadas.md) (M1, M2, T1–T4, H1–H5, M5) a partir das [medições no app instalado](../../referencias/ambiente/medicoes.md).
- **Onde:** motor da janela (só na Onda), tamanho da janela, hover e "clique passa".
- **Antes → depois:**
  - motor: `motor.js` v2.2 → [`motor-piloto.js`](../../referencias/motor/motor-piloto.md) (trava igual à do host por monitor, emenda como portal, teto de um monitor, conteúdo escondido 2 quadros quando o canto de cima à esquerda anda junto com o tamanho, telas pelo `change`, movimento reduzido ao vivo);
  - tamanho: crescia e encolhia a qualquer momento → no máximo 1 mudança a cada 100 ms; esquerda/cima crescem com 40 px de folga e só encolhem com sobra > 120 px; a caixa inclui o arranjo final desde o primeiro quadro;
  - hover: elemento embaixo do mouse → mais faixa de aproximação de 12–32 px; ressincroniza pelo cursor real depois de trocas e a 4,5 Hz enquanto dentro; "clique passa" com 1 pedido em voo; estilos só quando mudam.
- **Por quê:** o atraso de 50–70 ms não existe (mover é barato); redimensionar mostra o quadro velho pela esquerda e por cima; na emenda o motor e o host discordavam; mouse parado não gera evento.
- **Docs atualizados:** [motor-piloto](../../referencias/motor/motor-piloto.md) (novo), [interação](interacao.md), [README](README.md) (Testado), índices de [motor](../../referencias/motor/README.md) e [motion](../../padroes/motion/README.md).
- **Testado** (Chrome, aba visível, simulador imitando o host): emenda nos 4 degraus pros dois lados com a âncora certa em todos os quadros visíveis e 2 quadros escondidos no pulo; trocas de degrau que crescem pra esquerda/cima com a âncora certa e 2 quadros escondidos; 16/16 arrastos; zigue-zague com 2 trocas; hover refeito pelo cursor quando a forma muda embaixo do mouse parado. **Não testado:** no app instalado — vai pro roteiro de validação do usuário.
- **Regras:** R7, R9, R19, R22, R23, R24.

## 2026-11-25 — Remontada com o motor v2.2 (v19)
- **Pedido:** remontar com o motor v2.2 ([tamanho e borda](../../referencias/motor/tamanho-e-borda.md)) e conferir o teto na troca de forma, o amassado ao bater na parede, os 16 arrastos e o zigue-zague.
- **Onde:** só a montagem; nenhum número da Onda mudou.
- **Antes → depois:** motor v2.1 → v2.2 (escorregar na parede, trava por eixo, freio de aproximação, amassado ao bater). O `f.over` (levar a capa até a beira) não foi usado: a Onda já encosta a 16 px da borda pelo `G`.
- **Por quê:** o motor novo resolve o "não arrasta pros lados" no grande e as batidas secas.
- **Docs atualizados:** este registro, o "Testado" do [README](README.md) e o [CHANGELOG](../../CHANGELOG.md).
- **Testado:**
  - **troca de degrau** (mínima ↔ grande, solta e nas quatro bordas, 1920 × 1080): a janela mais alta, já com a união de antes + depois, ficou em **597 px (55 %)**, dentro dos 90 %;
  - **16 arrastos** (4 degraus × esquerda, direita, cima e baixo), numa aba **visível** (1920 × 991): todos chegam a ≤ 1 px do pedido e assentam em **57–1250 ms**, com a janela dentro da tela;
  - **zigue-zague** no limiar da borda direita: **2 trocas** (linha → coluna → linha);
  - **parede:** arrastando a 8577 px/s contra a borda direita, o freio agiu (764 vezes) e a Onda chegou mansa, sem batida (`bump` 0) — é o esperado; quando houver batida forte, o `feel` da Onda já desenha o amassado (`--sx = 1 − bump × 0,05` na direção da borda).
  - **Atenção pra quem testar:** com o painel do navegador escondido, o relógio de animação anda ~1 vez por segundo e o motor parece "assentando" por 10 s. Meça sempre numa aba visível.
  - **Não testado:** no app instalado.
- **Regras:** R7, R9, R19, R22.

## 2026-11-25 — Teto de tamanho, hover refinado e assentar estável (v18)
- **Pedido:** "Refinar as interações e os efeitos de hover"; "quando aumenta o tamanho, a área que ele cobre da tela fica alta demais, e por isso não dá pra arrastar ele pros lados"; movimentos "muito bem feitos, sem bugar", principalmente ao colar e descolar da borda; documentação que outros possam usar.
- **Onde:** coluna grande e faixa grande (tamanho); hover e toque em todas as formas; o assentar perto das bordas.
- **Antes → depois:**
  - coluna grande: capa de 210 e fila de 200 (614 de altura, janela ~66 % da tela) → capa de 150 e fila de 156 (498; janela 274 × 594, 55 %);
  - faixa grande: 1160 de largura (janela ~65 %) → capa de 130, onda de 440, fila de 220 × 140 (1044; janela 1108 × 212, 58 %);
  - hover: capa cresce 3,5 %, botões 7 %, barras com brilho × 1,18, bolinha da onda 1,4 ×, contorno do corpo fundido 7,5 % → 14,5 %; pressionar: capa 96,5 %, botões 90 %;
  - corte da janela na tela: contra a posição atual (mudava a cada quadro e o motor ficava "assentando" pra sempre na coluna da direita) → contra o destino.
- **Por quê:** janela alta demais nos degraus grandes; o assentar travado era um bug real achado no teste.
- **Docs atualizados:** README reorganizado em índice + [formas e degraus](formas-e-degraus.md) + [interação](interacao.md); [bugs evitados](../../referencias/motor/bugs-evitados.md).
- **Testado** (simulador a 1920 × 1080): 20 casos de degrau × lugar assentando em 0,8–1,9 s dentro do teto; 16 arrastos (4 degraus × 4 direções) chegando exatos; zigue-zague no limiar da borda direita com 2 trocas de forma; prints da coluna grande e da faixa grande. **Não testado:** no app instalado; montado com o `motor.js` atual (o motor novo ainda não).
- **Regras:** R7, R9, R19, R20, R22, R23.

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
