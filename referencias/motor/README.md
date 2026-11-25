# Motor de movimento da janela (`motor.js`)

> L3 · referência. **Toda doc do motor e do motor de arrasto mora nesta pasta.** Uma seção ou versão nova do motor (ex.: "Motor de movimento", v3) entra aqui como arquivo novo (`motor-v3.md`, `arrasto.md`…) e ganha uma linha na tabela no fim. As molas que ele usa estão em [referencias/motion/molas.md](../motion/molas.md); o que cada app faz com o que ele entrega está em [sentir-o-arrasto.md](../../padroes/motion/sentir-o-arrasto.md).

Descreve o motor v2 final (25/11/2026), publicado na Órbita v22, na Onda v13 e no Eco v18. A seção completa (estados, molas, limiares, envio por quadro, commit de tamanho) está em [motor-de-movimento.md](motor-de-movimento.md); os bugs que ele evita, em [bugs-evitados.md](bugs-evitados.md).

Um motor só, igual nos três apps, injetado no lugar do marcador `/*MOTOR*/` na hora de montar cada app. Ele cuida de três coisas:
- **Física:** as [molas](../motion/molas.md). Arrastando, a janela persegue o mouse numa mola crítica (k 1500) com *feed-forward*: a velocidade do mouse entra no termo de amortecimento (`c·(v_mouse − v)`), então em velocidade constante não há atraso. O *feed-forward* é suavizado (fator 0,5). Entre dois eventos, o alvo é previsto por no máximo 1 quadro (17 ms), e a previsão some em mais 17 ms: com o mouse parado, a janela assenta no ponto exato, sem passar.
- **Velocidade ao soltar:** regressão linear nos últimos 80 ms de amostras, usando `getCoalescedEvents()`. Se a última amostra tem mais de 60 ms, não há embalo; se a janela de amostras é menor que 12 ms, a leitura é descartada; o máximo é 6000 px/s. Ao soltar, a velocidade é limitada a 3200 px/s, e abaixo de 120 px/s vira 0 ("só assenta"). O destino é onde a janela pararia com atrito exponencial: `x + v·τ`, com τ = 0,14 s. O embalo só vale na direção do destino e nunca passa de `distância / 0,13`, pra mola não passar do ponto e voltar.
- **Gesto:** uma máquina de estados (parado → pressionado → arrastando → soltando → assentando). O fim é garantido por `pointerup`, `pointercancel`, `buttons === 0`, perda de foco, aba escondida, novo `pointerdown`, `mouseup` de reserva e o *watchdog*. Se a captura do ponteiro se perde, ela é recapturada pela raiz.

Cada app pluga no motor o seu `frame`/`unframe` (como a posição lógica vira a janela real; a Onda usa a âncora da capa + caixa `LR`) e o seu `feel` ([sentir o arrasto](../../padroes/motion/sentir-o-arrasto.md)).

O commit atômico de tamanho e posição da janela está em [janela-sem-tremer.md](../../padroes/motion/janela-sem-tremer.md); os limiares do gesto, em [sensor-de-borda-e-encaixe.md](../../padroes/motion/sensor-de-borda-e-encaixe.md).

## Versão anterior

`mover.js`, v1, referência histórica: arrasto k 900 / ζ 0,95, assentar k 210 / ζ 0,86, suave k 150 / ζ 1, ímã de 40 px, velocidade pelas pontas dos últimos 90 ms, sem embalo abaixo de 140 px/s e τ de atrito 0,13 s.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| README.md | o motor v2 (este arquivo) e o v1 histórico |
| [motor-de-movimento.md](motor-de-movimento.md) | seção "Motor de movimento": máquina de estados, molas e números, limiares, 1 `setBounds` por quadro, commit de tamanho sem tremer, testado e não testado |
| [bugs-evitados.md](bugs-evitados.md) | os bugs de movimento achados (auditoria e testes de estresse) e como cada um é evitado |
