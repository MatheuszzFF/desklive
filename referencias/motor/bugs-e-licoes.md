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

25. **Piscadas de 1–2 quadros** em 16,5 / 21,633 / 57,133 / 60,233 s do vídeo. O "esconder quadro velho" (`html.hold .preview{visibility:hidden}`) nos commits que movem o canto de cima à esquerda e no pulo da emenda; no simulador parecia invisível. → Proibido (R25); trocar por canto fixo, área vazia, congelar ou crossfade ([janela sem tremer](../../padroes/motion/janela-sem-tremer.md#nada-pisca-r25)). **Aberto.**
26. **Fantasma da emenda:** em 10,967 s a janela volta 1 quadro pro monitor antigo depois de já ter aparecido no novo. Hipóteses, nenhuma provada: (a) sem histerese no limiar de 50 %, a mola de arrasto (previsão + *feed-forward*) faz `cur` oscilar em volta do empate e o host escolhe o monitor de novo a cada pedido; (b) o `--px` do portal entra no CSS na hora do envio, mas a janela chega 1–4 ms depois e pode cair no quadro seguinte. O registro (`pedido`, `real`, `portal` por quadro) decide. **Aberto.**
27. **Tremedeira de ±70–170 px** no canto de cima à esquerda, vinil, 42,2–45,0 s, **cursor parado**. Hipótese: a caixa `LR` é cortada contra o destino (`clampLR` com `mover.target`), mas a janela é pedida pela posição atual (`cur`); com o vinil meio atrás da borda o pedido sai fora da tela, o host corrige, o portal e o `checkHost` reagem e a caixa muda de novo: duas fontes brigando. Correção a fazer: nunca pedir o que o host vai mudar (pedir já o `hostRect` e compensar no CSS no mesmo quadro) e garantir que adotar a posição real não dispara outra troca de caixa. **Aberto.**
28. **Ponto de pega escorrega** ±10–60 px no arrasto e nas trocas de forma. → `startGrab`/`holdGrab` + `nudge` no mesmo quadro ([ponto de pega](../../padroes/motion/ponto-de-pega.md)). **Em implementação (v21).**
29. **Progresso "preso" depois de deslizar** (onda, barras, tira em pé). Se o soltar se perde (`lostpointercapture` sem `pointerup`), `seekPreview` fica com valor e o hover e a ressincronização ficam desligados (todos saem cedo com `seekPreview != null`). → `lostpointercapture` aplica o `seek` onde estava e zera; `btnDown` segura o clique-passa até soltar. **Em implementação (v21).** (Causa lida no código; o sintoma exato no app não foi registrado.)
30. **Clique perto da linha da onda caía na área de trabalho** e o arrasto virava o retângulo azul de seleção do Windows (linha de ~4 px). → Área de toque maior (`::before` com `inset:-10px -8px`). **Em implementação (v21).**

## Lições que valem pra tudo

- Medir no app instalado antes de "corrigir" uma causa suposta (12, 24).
- Uma fonte só pra posição da janela por quadro; nunca pedir o que o host vai mudar (25–27).
- Tudo que é "1 quadro" só aparece em vídeo a 60 fps ou no registro; o simulador mente pra cima.
- Quem captura o ponteiro trata o `lostpointercapture` como fim (14, 29).
