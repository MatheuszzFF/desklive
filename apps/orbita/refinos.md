# Órbita — registro de refinos

> **O que é:** o histórico de cada refino do app Órbita, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Balão por cima, hover estável, leque justo (v26)
- **Pedido:** "o badge [fica] embaixo dos outros icones ... o comportamento de hover [ta] bem bugado ... quando aumento tamanho, o espaço ao redor dele fica tao grande exagerado q mal consigo mover ele".
- **Onde:** todos os lados, cantos e degraus; o leque do canto; o assentar.
- **Antes → depois:**
  - **Balão:** um balão por ícone → **um balão só**, numa camada por cima de tudo, posicionado pela imagem do ícone, pro lado de dentro, sem sair da janela (entra em 140 ms, desliza entre ícones em .22 s, sai em 160 ms).
  - **Seleção:** só as imagens eram não selecionáveis → nada é selecionável.
  - **Leque:** caixa 224/236/282 → **196/208/250**, arcos 96/102/128 → **84/90/112** e 152/162/198 → **136/142/172**; o canto de dentro da ilha agora arredonda até a largura toda quando os dois lados estão colados (quarto de disco abraçando o leque), em vez de no máximo a metade. Zona do leque: 196 → (arco de fora + 36) × escala.
  - **Hover:** o "clique passa" liga só depois de 140 ms fora do que se vê.
  - **Assentar:** antes de assentar, a margem que sobraria fora da tela é cortada. A barra parava 78 px longe da borda depois de uma troca; agora fica a 12 px em todos os lugares.
- **Por quê:** o balão do Chrome ficava por baixo do Steam; o relógio aparecia selecionado; o quarto escuro era bem maior que os ícones; a barra ficava longe da borda com uma sobra de janela em volta.
- **Docs atualizados:** [hover e balões](../../padroes/hover-e-baloes.md) (novo, regra geral), [bugs evitados](../../referencias/motor/bugs-evitados.md), [README](README.md) (medidas do leque).
- **Testado:** no simulador de mesa, com hover e cliques reais dentro do navegador embutido (não o mouse do PC): balão por cima no leque (o "Google Chrome" sobre o Steam), na doca (com a lupa), na coluna e na barra de cima; clique num ícone chega no app; nada selecionado. As 7 posições (canto de baixo à direita, embaixo, esquerda, em cima, direita, canto de cima à esquerda, embaixo de novo) assentam a 12 px da borda, com a janela do tamanho do conteúdo. **Não testado:** o app instalado e dois monitores.
- **Regras:** R9, R19, R20, R22.

## 2026-11-25 — Barra recolhida não abria (v25)
- **Pedido:** "man n to conseguindo abrir a orbita n ta aparecendo" (só aparecia uma corcova escura embaixo, com um "‹" dentro).
- **Onde:** o estado recolhido (setinha), em qualquer lado deitado ou de coluna; também protege o clique nos apps.
- **Antes → depois:** o gesto do motor v2.1 segurava o ponteiro já no pressionar, e o clique no "‹" ia pra caixa da barra; agora a Órbita só segura o ponteiro quando o gesto vira arrasto (limiar continua 6 px). Caminhos pra abrir a barra recolhida: clique no "‹", **toque em qualquer ponto da barra recolhida** e **clique duplo** nela. Um toque já tratado não alterna de novo no clique que chega até 500 ms depois.
- **Por quê:** a barra ficava presa recolhida, sem saída; o estado recolhido fica salvo, então ela reabria assim.
- **Docs atualizados:** [bugs evitados](../../referencias/motor/bugs-evitados.md) (o bug e a regra pra todo app).
- **Testado:** no simulador de mesa, com cliques reais dentro do navegador embutido (não o mouse do PC): na v24, clicar no "‹" (confirmado por `elementFromPoint` que o clique caía no botão) não abria; na v25, o mesmo clique abre. O arrasto continua funcionando e termina limpo. **Não testado:** o app instalado e o clique nos apps nele.
- **Regras:** R19, R22.

## 2026-11-25 — Arrasto sem trancos (motor v2.1, v24)
- **Pedido:** "muito travado e sem liberdade… fica batendo numa parede e às vezes fica travando frame" (com uma gravação da tela).
- **Onde:** o arrasto e o assentar, em todos os lados.
- **Antes → depois:** o motor mandava um `setBounds` só depois que o anterior voltava (~50–70 ms no app), e a janela andava ~15 vezes por segundo, aos saltos. Agora manda um por quadro, até 5 em voo. Ao assentar, confere a posição real com o Windows. Nada da forma, do degrau mínimo ou da interação da Órbita mudou.
- **Por quê:** na gravação, a janela ficava parada em 43–63% dos quadros do arrasto, com saltos de 90–540 px.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md), [motor](../../referencias/motor/README.md).
- **Testado:** 15 testes no simulador com ~60 ms de atraso, todos passando; janela parada durante o arrasto lento: 36% (v2 no mesmo teste: 100%). **Não testado:** no app instalado.
- **Regras:** R7, R10, R19.

## 2026-11-25 — Degrau mínimo vivo por lado (v23)
- **Pedido:** "os tamanhos minimos dos apps precisam ser trabalhados bem feito também, e também tem que ser único e interativo".
- **Onde:** o degrau fina, em cada lado e canto.
- **Antes → depois:** a fina era a barra normal só com os ícones (igual em todo lado; no canto, sem os anéis). Agora:
  - embaixo, **doca dormindo**: ícones de 22 px sem cor que acordam com o mouse (até 1,72×, sobem 9 px);
  - laterais, **coluna de pontos** de 7 px que viram ícone (26 px, 5 px pra dentro);
  - em cima, **ilha dinâmica**: só a hora e três pontinhos; abre com os apps em sequência (28 ms) e fecha 420 ms depois;
  - cantos, **só o núcleo**, com os anéis respirando (1 → 1,08) num ciclo de ≈ 4,2 s a ≈ 1,4 s conforme a CPU;
  - solta, pílula que **pula em onda** ao entrar o mouse (40 ms entre ícones).
  A proximidade começa a 110 px e a curva tem largura de 62 px. Detalhes em [degrau mínimo](degrau-minimo.md). O motor de arrasto não foi mexido.
- **Por quê:** a fina era uma versão encolhida e pobre; a R20 pede o mínimo também único e vivo.
- **Docs atualizados:** [degrau mínimo](degrau-minimo.md) (novo), [README](README.md) (degraus, Testado, arquivos), [glossário](../../visao/glossario.md).
- **Testado:** prints no simulador de mesa de cada lado e canto na fina (repouso e com o mouse perto ou em cima); a ilha dinâmica abrindo e fechando; a onda de pulos conferida por código. **Não testado:** o app instalado e dois monitores.
- **Regras:** R20, R19, R9, R22.

## 2026-11-25 — Motor de movimento único (v22)
- **Pedido:** refino state of the art do movimento: arrastar e soltar fluido e sem bugs, igual nos três apps.
- **Onde:** arrasto, soltar, encaixe, troca de lado e de tamanho, em todos os lados e cantos.
- **Antes → depois:** o motor próprio da Órbita (arrasto k 900 / ζ 0,95) virou o motor único (arrasto k 1500 / ζ 1 com *feed-forward*; encaixe firme k 240 / ζ 1 + micro-amassado contra a borda). As margens da janela agora entram junto com o tamanho, num commit só. Ao pegar, a ilha ganha uma sombra extra que acompanha o "levantar" (até 11 px de desfoque, 30% de opacidade). A prévia do encaixe usa o destino projetado, com o embalo. Ao sair do canto pro topo, se o item segurado some no layout novo, fica embaixo do mouse o mesmo ponto proporcional da barra (antes a barra corria ~700 px atrás do núcleo). Limiar de arrasto: continua 6 px.
- **Por quê:** "soltar" perdido, 2 `setBounds` no mesmo quadro e a barra correndo ao sair do canto.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md), [motor](../../referencias/motor/README.md), [janela sem tremer](../../padroes/motion/janela-sem-tremer.md).
- **Testado:** 15 testes de estresse no simulador de dois monitores, todos passando; prints da troca baixo → coluna e da coluna colada. **Não testado:** fps reais no app instalado, DPI misto, o visual do descolar do canto quadro a quadro.
- **Regras:** R7, R9, R19, R20.

## 2026-11-25 — Doc reorganizado (sem mudança no app)
- **O que mudou:** o doc foi movido de `apps/orbita.md` pra esta pasta e dividido em arquivos menores. Nenhum comportamento, número ou visual do app mudou.
- **Antes do registro:** os refinos anteriores (até a v12 do Eco, as formas por lado da Órbita e da Onda) estão consolidados no README e não têm entrada própria.
