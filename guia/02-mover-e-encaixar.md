# Passo 2: mover e encaixar (o motor)

> **O que é:** como o app se arrasta, continua no embalo, encaixa na borda e nunca sai da tela, usando o mesmo **motor** dos três apps. **Quando ler:** depois do [passo 1](01-primeiro-app.md), antes de desenhar as formas. A receita completa do motor está em [referencias/motor/](../referencias/motor/README.md). Índice: [guia](README.md).

## A ideia

Você não escreve um arrasto por app. O projeto tem **um motor só** (física da janela + envio pro Windows) e **um gesto só** (o mouse), iguais na Órbita, na Onda e no Eco. O código não está neste repo: monte o seu seguindo [motor de movimento](../referencias/motor/motor-de-movimento.md) e confira contra [bugs evitados](../referencias/motor/bugs-evitados.md). Depois, cada app só pluga três coisas:

```
motor = criarMotor({
  frame:    posição lógica → caixa real da janela   (ex.: âncora + margem)
  feel:     velocidade, levantar, batida → variáveis CSS do seu app
  assentar: destino projetado → borda, canto ou solta
})
```

## O gesto: uma máquina de estados

**parado → pressionado → arrastando → soltando → assentando → parado.** Duas garantias valem mais que qualquer número:
- **O arrasto sempre termina:** não só no `pointerup`, mas também com o botão solto em outra janela, perda de foco, aba escondida, clique novo e um *watchdog*. Sem isso, a janela segue o mouse depois de soltar.
- **Clique é clique, arrasto é arrasto:** vira arrasto só depois de alguns px (limiar por app), e um arrasto engole o clique seguinte por um tempo. **Só segure o ponteiro quando virar arrasto**, senão os botões dentro da área de arrastar param de receber clique.

Os limiares e os fins estão na tabela de [motor de movimento](../referencias/motor/motor-de-movimento.md).

## A física

- **Arrasto:** a janela persegue o mouse numa mola crítica, com a velocidade do mouse somada ao amortecimento (*feed-forward*): em velocidade constante, sem atraso.
- **Embalo ao soltar:** a velocidade vem de uma regressão nas últimas amostras, com teto e piso. O destino é onde a janela pararia com atrito. O embalo nunca faz a mola passar do ponto e voltar.
- **Assentar:** solta no meio da tela, uma mola quase sem quique; numa borda ou canto, um encaixe firme que não passa do ponto, com um micro-amassado na chegada.
- **Levantar ao pegar:** uma mola de 0 a 1 que vira escala e sombra (o **feel**, no [passo 5](05-visual-e-motion.md) e em [sentir o arrasto](../padroes/motion/sentir-o-arrasto.md)).

As constantes de cada mola: [molas](../referencias/motion/molas.md).

## Sentir a borda e encaixar

- **Sensor de borda:** o app sente o lado **antes** de encostar e já muda de forma no arrasto. Escolha o ponto de referência (o mouse, uma peça, o centro da marca) e os limiares de canto, lateral e topo, com **histerese** pra não ficar trocando na fronteira ([sensor de borda e encaixe](../padroes/motion/sensor-de-borda-e-encaixe.md), com a tabela dos três apps).
- **A emenda entre monitores não é borda:** teste um ponto um pouco além dela; se cair em outra tela, ignore.
- **O ímã só age ao soltar.** Durante o arrasto, só a **prévia do encaixe** acende (onde a janela pararia se soltasse agora, pela mesma projeção do embalo). Parado, o motor não envia nada.

## Ficar na tela

- **Arrastando,** a janela nunca passa da área das telas (a **trava da tela**, igual à do host), mas o **alvo** pode passar: é por ele que o app sente a borda, e na volta do mouse não há zona morta.
- **Assentando,** sem trava: o destino é do app e já cabe na tela. No fim, confira com `getBounds` onde o Windows deixou a janela.
- **No meio de uma troca de forma,** corte a caixa pedida na tela a cada quadro ([hover e balões](../padroes/hover-e-baloes.md), seção "Janela").
- **Envio:** no máximo um `setBounds` por quadro, **sem esperar o anterior voltar** (alguns em voo), posição em ponto flutuante arredondada só no envio ([janela sem tremer](../padroes/motion/janela-sem-tremer.md)).

## Pronto quando

- [ ] Arrastar segue o mouse sem atraso visível; soltar com força dá embalo e assenta sem quicar à toa.
- [ ] Encaixa em cada borda e canto; atravessa de monitor sem grudar na emenda.
- [ ] Soltar o botão fora da janela encerra o arrasto; parado, zero `setBounds`.
- [ ] Botões dentro da área de arrastar recebem o clique.
- [ ] Os testes de estresse do [passo 6](06-testar-sem-mexer-no-pc.md) passam.

Próximo: [forma por lado](03-forma-por-lado.md).
