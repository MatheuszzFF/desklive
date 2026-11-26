# Bugs e lições (em ordem)

> L3 · referência. Índice: [motor](README.md). **O que é:** todo bug de movimento, tamanho e hover visto no projeto, na ordem em que apareceu: **sintoma → causa → correção → situação**. O detalhe de cada bug já resolvido (onde, números do teste) está em [bugs evitados](bugs-evitados.md). **Quando ler:** antes de mexer em qualquer app, como checklist; e ao ver algo estranho, pra checar se já aconteceu. Bug novo entra no fim, com data, e ganha entrada no [diário](../../diario/README.md).

Situação: **resolvido** (provado no app ou no simulador), **em implementação**, **aberto**, **falso** (suspeita derrubada).

## 24/11/2026

1. **Não encosta no topo** (Onda, depois Eco). Janela fixa alta com área transparente em volta; o host prende a janela na tela, então a parte visível parava longe da borda. → Janela do tamanho do conteúdo, margem do brilho só do lado de dentro (R9). **Resolvido.**
2. **Brilho cortado em linha reta** (capa da Onda, penumbra do Eco). O Windows corta tudo fora da janela. → Todo brilho cabe e some antes da borda (R4). Mais: `color-scheme: light` no modo app, senão o Chromium pinta o fundo opaco. **Resolvido.**

## 25/11/2026 — motor v2 (Órbita v22, Onda v13, Eco v18)

3. **Arrasto que não termina.** Só o `pointerup` encerrava. → Fins garantidos (`buttons===0`, `blur`, aba escondida, `pointerdown` novo, `mouseup` de reserva, *watchdog* 12 s). **Resolvido.**
4. **Soltar cai na janela de baixo.** Clique-passa ligava com o botão pressionado. → Nunca liga com botão pressionado. **Resolvido** (v21 estende pra qualquer botão: `btnDown`).
5. **Pulo de 1–2 quadros ao mudar de tamanho.** CSS mudava na hora e o `setBounds` chegava depois. → Commit atômico (CSS no `resize`). **Resolvido** pela direita e por baixo; pela esquerda e por cima continua o quadro velho (veja o 25).
6. **Tremida com 2 `setBounds` no mesmo quadro.** → Só a bomba do rAF envia. **Resolvido.**
7. **Eco gruda na emenda.** → Borda só conta se 30 px além dela não há outra tela. **Resolvido.**
8. **Barra da Órbita "corre" ~700 px ao sair do canto pro topo.** O item segurado sumia no layout novo. → Fica embaixo do mouse o mesmo ponto proporcional da barra. **Resolvido.**
9. **Janela dispara ~700 px no início do arrasto.** Clique e primeiro movimento no mesmo ms. → Velocidade só com ≥ 12 ms de amostras, teto 6000 px/s. **Resolvido.**
10. **Passa do ponto ~45 px ao parar de repente.** Previsão do mouse de 40 ms. → Previsão de ≤ 1 quadro que some em mais 1. **Resolvido.**
11. **Onda não assentava perto da borda / não sentia a borda direita.** → Trava só arrastando; alvo livre, só a janela presa. **Resolvido.**

## 25/11/2026 — v2.1 a v2.2

12. **"Trava frame" a ~15 Hz.** Gravação: janela parada em 43–63 % dos quadros, saltos de 90–540 px. O v2 esperava a volta de cada `setBounds` (+1 quadro). → 1 por quadro sem esperar, até 5 em voo (v2.1: Órbita v24, Onda v15, Eco v20). **Resolvido.** Lição: a causa suposta (host lento, 50–70 ms) era **falsa**; a sonda mediu 1–4 ms.
13. **Eco "bate numa parede" 24 px antes da borda.** → `over` + a marca vai até a beira com resistência `22·(1 − e^(−passou/22))`. **Resolvido.**
14. **Órbita presa recolhida / botões que não respondem.** `setPointerCapture` no pressionar: desde o Chrome 136 o `click` vai pro elemento que capturou. → `capture:false`, captura só no início do arrasto (Órbita v25, Onda v16, Eco v21). **Resolvido.**
15. **Balão por baixo de outros ícones** (leque da Órbita). → Um balão numa camada por cima de tudo (v26). **Resolvido.**
16. **Barra longe da borda com sobra de margem** (Órbita). → Cortar a margem que sobraria fora da tela antes de assentar. **Resolvido.**
17. **Clique-passa piscando no hover.** → Desliga na hora, liga 140–160 ms fora. **Resolvido** (Onda v17).
18. **Prévia do Eco que nunca abre com o mouse andando / fecha quando a forma muda.** → Relógio da chegada; geometria com folga 4/18 px deslocada no mesmo quadro (Eco v22). **Resolvido.**
19. **Janela "andando" e enorme, 1412 × 608** (Onda v16, saindo do canto). → Caixa cortada na tela a cada quadro (v17). **Resolvido.**
20. **Assentar infinito na coluna da direita** (Onda v17). Corte contra a posição atual. → Contra o **destino** (v18; 20 casos em 0,8–1,9 s). **Resolvido.**
21. **Mão em área vazia e degrau trocando ao encostar na capa** (Onda v16). → Pega no círculo com aro; clique na capa toca/pausa; degrau só pela alça (v17). **Resolvido.**
22. **Zona morta na parede em tamanhos grandes** (6 % do mouse). → Escorregar na parede (v2.2: 70–100 %). **Resolvido.**
23. **Bate seco na borda arrastando rápido** (~6000 px/s, para em 1 quadro). → Freio `√(2·90000·d)` + amassado acima de 500 px/s (36 → 1). **Resolvido.**
24. **"O host recusa janela maior que a tela".** → **Falso:** o host encolhe pra área útil de um monitor; recusas são só `EINVAL`/`EBUSY` (código e sonda).

## 25/11/2026 — Onda v20 (motor-piloto) no app instalado

25. **Piscadas de 1–2 quadros** em 16,5 / 21,633 / 57,133 / 60,233 s do vídeo. O "esconder quadro velho" (`html.hold .preview{visibility:hidden}`) nos commits que movem o canto de cima à esquerda e no pulo da emenda; no simulador parecia invisível. → Proibido (R25); trocar por canto fixo, área vazia, congelar ou crossfade ([janela sem tremer](../../padroes/motion/janela-sem-tremer.md#nada-pisca-r25)). **Resolvido na v21:** o motor-piloto não esconde mais nada; só conta (`stats.tlMoves`, `stats.jumps`) onde o canto de cima à esquerda andou com o tamanho e onde a janela pulou de monitor. O quadro velho nesses casos (~1 a cada 3 trocas pela esquerda/cima) continua possível e fica pra técnica 1 ou 2 da R25; o registro mostra onde.
26. **Fantasma da emenda:** em 10,967 s a janela volta 1 quadro pro monitor antigo depois de já ter aparecido no novo. Hipóteses, nenhuma provada: (a) sem histerese no limiar de 50 %, a mola de arrasto (previsão + *feed-forward*) faz `cur` oscilar em volta do empate e o host escolhe o monitor de novo a cada pedido; (b) o `--px` do portal entra no CSS na hora do envio, mas a janela chega 1–4 ms depois e pode cair no quadro seguinte. O registro (`pedido`, `real`, `portal` por quadro) decide. Quadro a quadro: a Onda some da esquerda em 10,233 s e reaparece 2 quadros (328–329, x ≈ 1488) antes de sumir de novo em 11,0. → Histerese 55/45 na escolha do monitor (motor-piloto v21.1). **Corrigido no código, não provado no host** (o simulador não reproduzia).
27. **Tremedeira de ±70–170 px** no canto de cima à esquerda, vinil, 42,2–45,0 s, **cursor parado**. Hipótese: a caixa `LR` é cortada contra o destino (`clampLR` com `mover.target`), mas a janela é pedida pela posição atual (`cur`); com o vinil meio atrás da borda o pedido sai fora da tela, o host corrige, o portal e o `checkHost` reagem e a caixa muda de novo: duas fontes brigando. Correção a fazer: nunca pedir o que o host vai mudar (pedir já o `hostRect` e compensar no CSS no mesmo quadro) e garantir que adotar a posição real não dispara outra troca de caixa. Quadro a quadro (42,2–45,0 s): a janela inteira salta 20–80 px pra direita e pra baixo **por 1 quadro** e volta (quadros 1273–1276, 1285, 1303–1304, 1318, 1321), e a capa alterna clara/escura (hover do aro ligando e desligando com o cursor parado). Duas causas no código: (a) o portal `--px/--py` entrava no envio e o `--ax/--ay` só no `resize`, 1 quadro de discordância; (b) a ressincronização do hover calculava o mouse pela janela **pedida**, não pela real; no canto as duas diferem, o hover caía e voltava, e cada volta mudava o tamanho de novo. → Portal junto do commit; hover pela posição real (`screenX/Y`). **Corrigido no código, não provado no host** (o simulador não reproduz: 0 tremidas nos 16 cantos, antes e depois).
28. **Ponto de pega escorrega** ±10–60 px no arrasto e nas trocas de forma. → `startGrab`/`holdGrab` + `nudge` no mesmo quadro ([ponto de pega](../../padroes/motion/ponto-de-pega.md)). **Resolvido na v21 (simulador):** erro parado 1–200 px → ≤ 0,4 px; salto na troca 2–108 px → 0–4 px (com ~3 px do atraso normal de seguir o mouse). App instalado: pelo registro.
29. **Progresso "preso" depois de deslizar** (onda, barras, tira em pé). Se o soltar se perde (`lostpointercapture` sem `pointerup`), `seekPreview` fica com valor e o hover e a ressincronização ficam desligados (todos saem cedo com `seekPreview != null`). → `lostpointercapture` aplica o `seek` onde estava e zera; `btnDown` segura o clique-passa até soltar. Mais duas portas achadas: o deslizar da onda aceitava o **botão direito** (o menu abre e o soltar se perde) e qualquer `setPointerCapture` que falhasse abortava o deslizar. → só botão esquerdo, captura tolerante a falha, `lostpointercapture` também no vinil, e uma rede: `pointermove` sem botão com deslizar aberto aplica e fecha. Um pressionar que chega desliga o clique-passa na hora. **Resolvido na v21** (simulador, eventos sintéticos: perder a captura, botão direito e mover sem botão fecham o deslizar). App instalado: pelo registro.
30. **Clique perto da linha da onda caía na área de trabalho** e o arrasto virava o retângulo azul de seleção do Windows (linha de ~4 px). → Área de toque maior (`::before` com `inset:-10px -8px`). **Resolvido na v21:** 9 px acima e abaixo da onda e 6 px antes dela já pegam a onda.
31. **Forma piscando na emenda com o ponto de pega** (achado no teste da v21): a zona (metade e monitor) era decidida pela **âncora**; o espelho mexe o ponto pego, o `nudge` move a âncora, a âncora cruza o meio de volta → 14 trocas cruzando a emenda no degrau expandido. → Arrastando (e depois, até o próximo arrasto), a zona é decidida pelo **ponto pego**, que fica parado embaixo do mouse; o assentar usa o mesmo ponto. Resultado: 2 trocas. **Resolvido (v21).**
32. **Ponto pego até 85 px longe no degrau grande ao trocar de cima pra baixo** (achado no teste da v21): a caixa carregava a forma de antes **e** a de depois (769 px de altura), a janela encostava no rodapé, o host não deixa sair da tela e o `nudge` não tinha pra onde andar até o encolher, 100 ms depois. → Com a janela presa na tela durante o arrasto, a caixa conta só onde as peças vão ficar e encolhe já, sem esperar a vez. Salto 78 → 3,6 px. **Resolvido (v21).** Limite: contra a borda de verdade, se o ponto pego exigiria o conteúdo fora da tela, ele escorrega (uma rodada isolada deu 56 px no grande na borda de baixo, não repetiu em 4).

33. **Quadro velho no arrasto** (13,77 s, quadro 414): o conteúdo sobe 157 px por 1 quadro e volta, na troca de cima pra baixo do expandido: a janela cresceu pra cima e o Windows mostrou o conteúdo velho preso no canto novo. O v20 nem contava esse caso no arrasto. → Dois passos (mover, depois redimensionar com o canto parado; ou o inverso se não couber). Commits com quadro velho possível 59 → 3 no simulador. **Resolvido (v21.1)** no que cabe na tela.
34. **Borda e meio pela âncora** (achado no teste): chegando devagar no canto da emenda, a forma alternou topo → disco → coluna → disco → coluna. → Distância até a borda pelo ponto pego. 5 → 2 trocas. **Resolvido (v21.1).**

## 26/11/2026 — Board v1 → v2

35. **Board: nada era desenhado** (simulador). O cache do render começava em `NaN` e `|a − NaN| > ε` é sempre falso. → Sentinela numérica. **Resolvido.**
36. **Ponto pego empurrava a peça pra fora do topo** (10–40 px) ao encolher o painel no arrasto: o ponto pego interpolava a **fração**. → Interpola o deslocamento em pixels. **Resolvido** (erro 0 px).
37. **Clique comido logo depois de sair da peça:** o clique-passa religava 60 ms depois de sair. → Religa na hora; o hover visual tem a própria histerese. **Resolvido.**
38. **Peça sumindo por quadros na emenda:** o Board vizinho lia a caixa a cada 250 ms e o fantasma nascia tarde. → Aviso 600 px antes, leitura parada a 120 ms, fantasma desenhado no mesmo tick. **Resolvido** (área visível nunca abaixo de 100 %).
39. **"Buga nas extremidades do segundo monitor"** (app instalado, área útil 1032 ao lado de 1080). O limite do arrasto escolhia o monitor pelo **centro** da peça e prendia num monitor por vez (salto de até 48 px ao cruzar o centro ou y 1032); os alvos de borda não olhavam o comprimento do segmento (a borda de 48 px embaixo da emenda mandava a peça pra fora); o monitor 2 não tinha alvos enquanto o Board 1 segurava o arrasto. → União de regiões + projeção + deslize de no máximo 10 px por quadro, segmentos curtos ignorados, alvos em todos os monitores com Board, geometria no espaço físico de cada Board. **Resolvido no simulador** (0 saltos); falta o app instalado.
40. **Todo arrasto daria erro** (achado pela revisão antes de publicar): os cantos não guardavam os lados (`sh`, `sv`) e `avisoEmenda` não existia; e um erro dentro do quadro congelava o laço pra sempre. → Corrigido, e o laço agora registra o erro e continua. **Resolvido.**
41. **Leitura pela metade no barramento por arquivo:** medido no PC dele, 32 de 487 leituras (6,6 %) com escrita direta. → tmp + rename (0 em 400), com 3 tentativas porque o rename falha às vezes com o arquivo aberto (2 em 400). **Resolvido.**
42. **Duas Sondas depois de um passe:** quem passou a peça a recriava do próprio estado salvo antes do batimento do outro listar a peça. → Peça cedida não renasce por 6 s nem enquanto o outro estiver vivo. **Resolvido** (no máximo 1 dono em 1604 amostras).
43. **Oferta de passe parada:** o laço dormia com a oferta pendente (nada reenviava). → Fica acordado enquanto há oferta ou sinal. **Resolvido.**
44. **Painel subindo 122 px por quadro ao abrir na borda de baixo:** a parede macia usava o tamanho **alvo**, então a peça ancorada embaixo parecia "dentro da parede". → Tamanho atual. **Resolvido.**
45. **Seção pulando 6 px ao terminar de abrir:** a margem do primeiro parágrafo colapsava pra fora do embrulho medido, a mola mirava 6 px a menos e o `auto` pulava. → Embrulho `display:flow-root`. **Resolvido** (observador: 0).
46. **Simulador lento sem motivo:** com a janela do Claude atrás de outras, o navegador estrangula `setTimeout` (~4 por segundo) mesmo com a aba "visível". → Relógio do simulador por MessageChannel. **Resolvido** (só simulador).

## Lições que valem pra tudo

- Medir no app instalado antes de "corrigir" uma causa suposta (12, 24).
- Uma fonte só pra posição da janela por quadro; nunca pedir o que o host vai mudar (25–27).
- Tudo que é "1 quadro" só aparece em vídeo a 60 fps ou no registro; o simulador mente pra cima.
- Quem captura o ponteiro trata o `lostpointercapture` como fim (14, 29).
- Toda decisão que depende de onde o app está (zona, lado, monitor) usa um ponto que **não** se mexe com a própria decisão; senão ela vira laço (31).
- Limite ou zona decidido por um ponto (centro) que troca de região vira salto: projete na união das regiões e limite o deslize (39).
- Entre processos, posição vai em pixel físico e tempo vai absoluto (`timeOrigin + now`); escrita vai por tmp + rename (39, 41).
- Quem entrega uma coisa não pode recriá-la do próprio cache até o outro confirmar que a tem (42).
