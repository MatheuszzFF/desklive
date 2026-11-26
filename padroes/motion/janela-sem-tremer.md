# Redimensionar a janela sem tremer

> L1 · motion. Índice: [motion](README.md). As regras por trás: R9 (janela do tamanho do conteúdo) e R25 (nada pisca) em [regras-de-trabalho.md](../../regras/regras-de-trabalho.md). O commit atômico é implementado pelo [motor](../../referencias/motor/README.md).

O problema: o host prende a janela dentro da tela e cada `setBounds` é assíncrono. Se a janela muda de tamanho e o CSS muda em quadros diferentes, o conteúdo pisca fora do lugar. As regras:

1. **A janela tem só o tamanho do conteúdo**, com a margem do brilho do lado de dentro e só a folga `G` do lado da borda (Órbita: `PADS` de 50 a 62 px por dentro, 196 px no lado de dentro da coluna pros balões; Onda: `MARGIN = 48`; Eco: `MARGIN = 36`).
2. **Crescer antes, encolher depois.**
   - Órbita: durante o morph, a janela é a **união** do layout antigo com o novo, e só volta ao tamanho do conteúdo quando nada voa nem é arrastado, `MORPH.duration + 40 ms` depois.
   - Onda: cada lado da caixa cresce na hora. Encolher espera 250 ms de calma. Perto de uma borda, o lado é sempre exato.
   - Eco: a janela vira a união atual ∪ nova antes da animação e encolhe `--spd × 1000 + 420 ms` depois.
3. **Commit atômico (motor):** tamanho novo + quanto a janela anda + o CSS que muda viram um "commit". O CSS só é aplicado quando chega o evento `resize` com `innerWidth/innerHeight` iguais ao tamanho pedido (±1 px). Se o evento não vier, aplica depois de 100 ms. Commits seguidos se juntam: os deslocamentos somam e vale o tamanho mais novo.
4. **No máximo um `setBounds` por quadro, sem esperar o anterior voltar** (até 5 em voo; o Windows aplica na ordem). Esperar a volta (+1 quadro) fazia a janela andar só ~15 vezes por segundo, aos saltos; supunha-se ~50–70 ms por chamada, mas a sonda mediu **1–4 ms** e nunca mais de 1 em voo ([medições](../../referencias/ambiente/medicoes.md)). Um commit com CSS espera o CSS do anterior entrar.
5. **Posição lógica em ponto flutuante.** Só é arredondada na hora de enviar, então nunca acumula erro de meio pixel. A Órbita arredonda as margens e passa o resto pro deslocamento.
6. **O conteúdo andou dentro da janela? A janela anda o contrário**, no mesmo commit (`shift`). No Eco, o `.rig` recebe o deslocamento e volta a zero numa mola (k 260): a marca nunca pula.
7. **Arrastando, a janela nunca passa da área das telas** (`screenClamp`), do mesmo jeito que o Windows faz. Assim não existe "zona morta" quando o mouse volta. O **alvo** pode passar da borda, porque é por ele que o app sente o lado. **Assentando, não há trava:** o destino é do app e já cabe na tela (com trava, a Onda nunca chegava perto da borda).
8. **A caixa é cortada na área útil contra o destino**, nunca contra a posição atual (senão ela muda a cada quadro e o motor nunca assenta), e inclui o **arranjo final inteiro desde o primeiro quadro** (senão a janela cresce em degraus, um commit por peça que aparece).
9. **Tetos:** janela inteira ≤ 70 % da altura útil (756 px a 1080) e ≤ 60 % da largura (1152 px), menos a barra deitada da Órbita; a união de uma troca ≤ ~90 % ([tamanho e borda](../../referencias/motor/tamanho-e-borda.md#teto-de-tamanho-o-que-os-apps-seguem)).

## Nada pisca (R25)

**O que o Windows faz:** num redimensionamento o `resize` chega em ~16 ms (1 quadro, às vezes 2) e, até lá, o DWM mostra o **quadro velho ancorado no canto de cima à esquerda**. Crescer pra direita ou pra baixo não aparece; mexer a **borda esquerda ou de cima** faz o conteúdo velho andar junto com o canto por 1–2 quadros, em ~1 a cada 3 trocas ([medições](../../referencias/ambiente/medicoes.md#redimensionar-pela-borda-esquerda-ou-de-cima)).

**Esconder é proibido.** O motor-piloto da Onda v20 escondia o conteúdo (`visibility:hidden`) até 2 quadros depois da volta em dois casos: commit que muda o tamanho **e** move o canto de cima à esquerda, e pulo de monitor na emenda. No simulador parecia invisível; **no vídeo do app instalado virou piscada de 1–2 quadros** (em 16,5 / 21,633 / 57,133 / 60,233 s). Um quadro sem o app arruína a experiência. Logo: nunca `visibility:hidden`, `opacity:0` de um quadro, nem trocar o layout de uma vez.

**Técnicas permitidas, por ordem de preferência:**
1. **Não mexer a borda esquerda nem a de cima com conteúdo visível perto delas.** Reserve folga em cima e à esquerda e cresça e encolha pela direita e por baixo (Onda: folga de 40 px, só encolhe se sobrar mais de 120). A folga é transparente e o "clique passa" cuida dela; só não vale rente a uma borda da tela (R9).
2. **Mexer a esquerda ou a de cima só quando a faixa que vai "andar" no quadro velho estiver vazia** (transparente). Ex.: encolher a esquerda depois que as peças já saíram dali.
3. **Congelar:** durante a troca, as peças ficam paradas na tela (compensadas no CSS) e a animação só solta quando o `resize` chegou; o pior caso vira "1 quadro sem movimento", não um salto.
4. **Crossfade ou morph:** quando o salto é inevitável (emenda, trava do host), cruzar opacidades em ≥ 120 ms com as duas versões visíveis, nunca um corte.
5. **Palco no gesto** (M3, não implementado): a janela vira a área útil do monitor ao começar o arrasto e volta ao tamanho do conteúdo ao assentar; arrasto só por `transform`. Custa 2 redimensionamentos por gesto, que caem nas técnicas 1–4.

6. **Dois passos** (Onda v21.1, implementado): mudar o tamanho mexendo a borda de cima ou a da esquerda vira (A) **só mover** a janela pro canto novo com o tamanho velho, com o CSS compensando quando o movimento volta (1–4 ms; mover não tem quadro velho), e no quadro seguinte (B) **só o tamanho**, com o canto de cima à esquerda parado. Se o tamanho velho não cabe na tela no canto novo, a ordem inverte: primeiro o tamanho com o canto parado, depois só mover. No simulador, os commits com quadro velho possível caíram de **59 (o maior de 682 px) pra 3** numa bateria de arrastos e trocas de degrau; os 3 que sobram são quando nenhuma das duas ordens cabe na tela.

**Também proibido:** aplicar a posição da janela e a compensação do CSS em quadros diferentes (o portal `--px/--py` agora entra junto com o CSS do commit de tamanho, no `resize`); duas fontes brigando pela posição (mola × trava, motor × commit); pedir uma posição fora da tela que o host vai corrigir ([bugs e lições](../../referencias/motor/bugs-e-licoes.md) 25–27).

**Prova obrigatória:** gravação a 60 fps ou o modo de registro, quadro a quadro: zero quadro com a área do app caindo a ~0 e zero salto do centroide com o cursor parado ([como medir](../../referencias/ambiente/como-medir.md)).
