# Motor de movimento (v2.1, 25/11/2026)

> L3 · referência. Índice: [motor](README.md). Como a janela dos três apps anda, arrasta, solta e muda de tamanho. Os bugs que ele evita estão em [bugs-evitados.md](bugs-evitados.md). O que cada app desenha com o que o motor entrega: [sentir o arrasto](../../padroes/motion/sentir-o-arrasto.md).

Um motor só, igual na Órbita, na Onda e no Eco (montado no lugar de `/*MOTOR*/`). São duas peças: o **motor** (física + envio pro Windows) e o **gesto** (o mouse). Cada app só pluga três coisas: `frame` (posição lógica → janela real), `feel` (o que desenhar com velocidade, levantar e batida) e a regra de onde assentar.

## Máquina de estados

| Estado | Entra quando | Sai quando |
|---|---|---|
| **parado** | nada acontecendo | `pointerdown` aceito pelo app |
| **pressionado** | botão desceu num ponto que arrasta | passou do limiar → arrastando; soltou antes → **clique** (não move nada) |
| **arrastando** | passou do limiar | qualquer fim (abaixo) |
| **soltando** | fim do gesto | no mesmo quadro: calcula embalo e destino |
| **assentando** | `glide` até o destino | chegou: < 0,35 px do alvo e < 6 px/s → parado |

**Fins garantidos:** `pointerup`, `pointercancel`, movimento com `buttons === 0` (o soltar caiu em outra janela), a janela perdeu o foco, a aba ficou escondida, um `pointerdown` novo sem o up anterior, `mouseup` de reserva e um *watchdog* de **12 s** sem evento. Só o `pointerup` dá embalo. Os outros assentam onde a janela está, sem embalo. Se a captura do ponteiro se perde, ela é refeita pela raiz.

## Limiares

| O quê | Valor |
|---|---|
| Vira arrasto | **6 px** Órbita · **5 px** Onda · **4 px** Eco |
| Botão segurado > 220 ms | basta **2,5 px** |
| Clique engolido depois de um arrasto | **400 ms** |
| Ímã e encaixe | por app, em [sensor de borda](../../padroes/motion/sensor-de-borda-e-encaixe.md) (Eco: borda < 44 px, canto < 76 px; Onda: sente a 90 px e mantém até 130; Órbita: canto 160, lateral 230, topo 250 px) |
| Ímã só age soltando | nenhum puxão parado ou durante o arrasto; durante o arrasto só a **prévia** acende |

## Molas (massa 1, 4 subpassos, `c = 2·√k·ζ`)

| Mola | k | ζ | Uso |
|---|---|---|---|
| Arrasto | 1500 | 1,0 | persegue o mouse, com *feed-forward* |
| Assentar | 210 (Eco 230) | 0,86 (Eco 0,80) | soltou no meio da tela |
| Encaixe firme | 240 | 1,0 | soltou numa borda ou canto: não passa do ponto |
| Suave | 130 | 1,0 | menu, "centralizar", troca de tela |
| Levantar | 520 | 0,9 | 0 → 1 ao pegar, volta ao soltar (sombra e escala) |
| Batida | 900 | 0,45 | micro-amassado ao assentar numa borda |

**Feed-forward do arrasto:** a velocidade do mouse entra no amortecimento, `a = k·(alvo − x) + c·(v_mouse − v)`. Em velocidade constante, o atraso é zero. Entre dois eventos, o alvo é previsto por no máximo **1 quadro (17 ms)**. Depois disso a previsão some em mais 17 ms, então com o mouse parado a janela assenta no ponto exato, sem passar.

**Batida:** só entra se a velocidade de chegada passa de ~8% de 1800 px/s. O impulso é `9 × min(1, v/1800)`. Os apps transformam isso em 3 a 12% de amassado na direção da borda.

## Velocidade e embalo

- Regressão linear nas amostras dos últimos **80 ms**, usando os eventos agrupados (`getCoalescedEvents`).
- A leitura só vale com pelo menos **12 ms** de janela de amostras e é limitada a **6000 px/s**.
- Última amostra com mais de **60 ms**: velocidade 0 (parou antes de soltar).
- Ao soltar, o máximo é **3200 px/s**; abaixo de **120 px/s** vira 0.
- Destino = alvo + `v · τ`, com **τ = 0,14 s**. O embalo só vale na direção do destino e nunca passa de `distância / 0,13`.
- A **prévia do encaixe** usa a mesma projeção, então o que acende é onde vai parar.

## Envio pro Windows (`setBounds`)

- Uma bomba no laço do quadro: no máximo **1 `setBounds` por quadro**, **sem esperar o anterior voltar**, com até **5 em voo** (o Windows aplica na ordem). Fila cheia: o quadro pula e o próximo manda a posição mais nova.
- **Por quê:** no app instalado cada `setBounds` leva **~50–70 ms** pra voltar (medido numa gravação da tela: 30 quadros/s, a janela parada em 43–63% dos quadros do arrasto, com saltos de 90–540 px). Com "um de cada vez" (v2), a janela andava só ~15 vezes por segundo, aos saltos. Com a fila, ela anda todo quadro, com 3–4 quadros de atraso, que a mola esconde.
- Um commit com CSS (mudança de tamanho) só sai depois que o CSS do commit anterior entrou: a ordem janela ↔ CSS nunca cruza.
- A posição lógica é em ponto flutuante e só é arredondada no envio. Uma janela idêntica à última pedida não é reenviada.
- **Arrastando**, a janela não passa da área das telas (as telas que cruzam a faixa da janela, pra dar pra atravessar de monitor). O alvo pode passar: o app "sente" a borda por ele, e na volta do mouse não existe zona morta.
- **Empurrando além da borda:** o motor entrega ao app quanto o mouse passou da tela (`over`). O Eco usa isso pra levar a marca até a beira dentro da janela, com resistência `22·(1 − e^(−passou/22))` px. Antes, ela parava 24 px antes da borda, a folga da janela: a "parede". Ao soltar, o deslocamento vira o da mola do `.rig`, sem pulo.
- **Assentando**, não há trava: quem decide o destino é o app, e o destino já cabe na tela. Ao terminar, o motor pergunta ao Windows onde a janela ficou (`getBounds`, 200 ms depois). Se a trava dele segurou a janela noutro lugar (ex.: emenda dos monitores), a posição lógica vira a real.
- A espera pelo `resize` de um commit agora desiste em **100 ms** (era 160).
- As telas são relidas a cada 3 s parado e no início de todo arrasto. Mudou a tela? O app reposiciona (monitor desligado, resolução nova).

## Mudar de tamanho sem tremer (commit)

Tamanho novo + quanto a janela anda + o CSS que muda viram um **commit**:
1. O estado lógico (posição, tamanho, a caixa da Onda, a marca do Eco) muda na hora.
2. Tamanho e posição saem **juntos, num envio só**, no próximo quadro.
3. O CSS do commit só roda quando chega o `resize` com o tamanho pedido (±1 px), antes do próximo desenho. Sem `resize`, ele roda depois de 160 ms. Se só a posição muda, roda quando o `setBounds` volta.
4. Commits seguidos se juntam: os deslocamentos somam, vale o tamanho mais novo e os CSS rodam em ordem.
5. Enquanto um CSS espera, nada mais é enviado.

O "crescer antes, encolher depois" de cada app continua em [janela sem tremer](../../padroes/motion/janela-sem-tremer.md).

## Testado e não testado

- **Testado** no simulador (dois monitores 1920×1080, janela presa na tela, `setBounds` com **~60 ms** de atraso, aplicados na ordem, como no app): 15 testes de estresse por app, todos passando; no máximo 1 `setBounds` por quadro e no máximo 5 em voo. No mesmo teste de arrasto lento, a janela ficava **100% parada** durante o arrasto com o motor v2 e passou a ficar **28–38%** com o v2.1. Esse resto é o atraso inicial de ~60 ms e o relógio irregular do painel do navegador escondido. Com o Eco empurrado contra a borda de baixo, a marca chega em 1080 px, a beira da tela.
- **Não testado** (só no app instalado): se o Windows aceita vários `setBounds` em voo sem enfileirar (se ele fizer um de cada vez, a fila não acelera nada), 60 fps reais, DPI misto e a regra exata da trava do host na emenda dos monitores (agora corrigida pelo `getBounds` ao assentar, mas não observada).
