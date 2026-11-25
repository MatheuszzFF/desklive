# Eco — interação, hover e toque

> **O que é:** a interação própria de cada lado do Eco (repouso, prévia, toque), o hover, o arrasto e o colar/descolar, com os tempos e tamanhos reais. **Quando ler:** antes de mexer em hover, clique, arrasto ou encaixe do Eco. Índice: [Eco](README.md). A regra geral (todos os apps) está em [hover e balões](../../padroes/hover-e-baloes.md) e no [sensor de borda](../../padroes/motion/sensor-de-borda-e-encaixe.md).

## Prévia (mouse em cima), por lado
- **Ilha (topo), ímã:** `--mx = clamp((x_mouse − centro) / (largura/2 + 60), −1, 1)`. A forma e os ombros andam `--mx × 7 px` e a marca `--mx × 11 px`, em .5 s `--sp2`, como se o mouse puxasse.
- **Espinha (laterais), desenrolar:** a parte visível começa com **230 px**, centrada (cabe a marca e o convite em pé inteiro), e **se desenrola acompanhando a altura do mouse** (±60 px em volta dele). Os ombros e a marca vão junto. No grande, o histórico vira **abas redondas de 38 px** com as iniciais, presas na espinha.
- **Barra de comando (embaixo), luz que corre:** uma luz laranja corre atrás do mouse: um `radial-gradient` de 170 × 54 px mais uma linha de 1 px que acende ±90 px em volta do ponteiro. A dica do atalho aparece à direita.
- **Quarto de órbita (cantos), arco que gira:** as três sugestões saem do canto num arco de raio `ORBIT = 124` (levemente oval, × 1,4 na vertical), nos ângulos 46° ± 28°. O arco **gira até o ângulo do mouse**, limitado a 40–52°, e a sugestão mais perto (a menos de 120 px) cresce 8 % e esquenta a borda. As sugestões ficam na camada 6, acima de tudo.
- **Solta:** clique na marca abre a pílula, que cresce pro lado de dentro da tela. Na metade de cima, a conversa **desce**, com a mais nova perto do campo.

## Repouso (o mínimo): vivo e único em cada lado
A janela em repouso tem **36 px de folga** em volta da forma; nela o Eco sente o mouse chegando antes da prévia abrir: `--near = clamp(1 − distância até a forma / 36, 0, 1)`.
- **Ilha:** respira na largura (1 → **1,05** a cada **5,6 s**); com o mouse chegando, **incha pra baixo até 18 %** e se inclina pra ele.
- **Espinha:** um **feixe de luz** de 48 px (laranja a 20 %) desce a cada **4,6 s**; com o mouse chegando, a **marca desliza até a altura dele** (a 22 px das pontas) e a espinha **estufa até 30 %**.
- **Barra:** um **cursor de 2 × 13 px pisca** (1,1 s) no fim do traço; o traço se estica até o mouse (`--fl` 0,2 a 1) e a barra **estica até 14 %** no ponto dele.
- **Quarto de órbita:** **anel de 70 px** em volta da quina, com um **satélite de 6 px** varrendo **±40°** (6 s, vai e volta); com o mouse chegando, o satélite vai até o ângulo dele (.35 s), o anel cresce 8 % e o quarto 15 %.
- **Solta, fechada:** a marca **olha pro mouse** (até **6 px** na direção dele).
- **Resposta nova com o Eco fechado:** um **ponto quente de 7 px** pulsa (1,8 s) na forma de qualquer lado; some ao abrir.

## Hover estável e toque
- **Tempos:** a prévia entra **60 ms** depois do mouse **chegar** (o relógio não reinicia com o movimento) e sai **340 ms** depois dele sair; voltar antes cancela a saída.
- **Dentro/fora pela geometria** da forma (não pelo elemento embaixo do mouse), com **4 px** de folga pra entrar e **18 px** pra sair; no canto em prévia conta também o leque do arco. Quando a janela troca de lugar, essa geometria anda junto no mesmo quadro. O "clique passa" segue a mesma conta: não liga e desliga nos vãos.
- **Efeitos (pequenos, com mola):** com a prévia aberta, a forma ganha uma **borda quente de 1 px** e a sombra fica um pouco mais funda; **pressionar** clareia a forma 14 % e encolhe a marca pra **0,92**; a marca solta **cresce 6 %** com o mouse em cima; sugestões do arco afundam pra 0,95, chips 3 % e as abas e botões do histórico 4 %.
- **Seleção:** só o campo e o texto das mensagens são selecionáveis; a marca tem cursor de pegar (mão fechada arrastando). Abrir e fechar só com clique (ou atalho e menu).

## Arrastar, descolar e fundir
- Vira arrasto depois de 4 px (o ponteiro só é capturado aí, nunca no pressionar). A marca **descola**: a janela encolhe pra 112 × 112 em volta dela, e a forma presa vira uma gota de 48 px que some atrás da marca, com os ombros recolhendo. Se estava aberta, a conversa recolhe na marca.
- Durante o arrasto, uma **forma-fantasma** se forma do lado da borda mais perto (até 160 px) e a marca se inclina e achata na direção dela. A borda ou o canto onde ela vai parar acende (contando o embalo).
- **Limiar com histerese:** borda < 44 px, canto < 76 px nos dois eixos; o que já acendeu só apaga **16 px** depois do limiar. **Soltar usa a mesma decisão da prévia:** o que acende é onde ela para. **Medido:** oscilando ±8 px em volta do limiar por 2,4 s, a prévia acendeu uma vez só e a forma parou na borda acesa.
- Ao fundir, a marca voa até ficar a 22 px do lugar final e só então a forma nasce dela como uma gota de 44 px, com os ombros se formando 70 ms depois. Longe das bordas, assenta solta, a pelo menos 44 px delas. Se estava aberta antes de arrastar, reabre (300 ms depois numa borda, na hora solta).
- O "sentir" do Eco: a marca estica até 17 % na direção do movimento e amassa 12 % contra a borda ao bater ([sentir o arrasto](../../padroes/motion/sentir-o-arrasto.md)).
