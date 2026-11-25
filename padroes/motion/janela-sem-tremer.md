# Redimensionar a janela sem tremer

> L1 · motion. Índice: [motion](README.md). A regra por trás: R9 (janela do tamanho do conteúdo) em [regras-de-trabalho.md](../../regras/regras-de-trabalho.md). O commit atômico é implementado pelo [motor](../../referencias/motor/README.md).

O problema: o host prende a janela dentro da tela e cada `setBounds` é assíncrono. Se a janela muda de tamanho e o CSS muda em quadros diferentes, o conteúdo pisca fora do lugar. As regras:

1. **A janela tem só o tamanho do conteúdo**, com a margem do brilho do lado de dentro e só a folga `G` do lado da borda (Órbita: `PADS` de 50 a 62 px por dentro, 196 px no lado de dentro da coluna pros balões; Onda: `MARGIN = 48`; Eco: `MARGIN = 36`).
2. **Crescer antes, encolher depois.**
   - Órbita: durante o morph, a janela é a **união** do layout antigo com o novo, e só volta ao tamanho do conteúdo quando nada voa nem é arrastado, `MORPH.duration + 40 ms` depois.
   - Onda: cada lado da caixa cresce na hora. Encolher espera 250 ms de calma. Perto de uma borda, o lado é sempre exato.
   - Eco: a janela vira a união atual ∪ nova antes da animação e encolhe `--spd × 1000 + 420 ms` depois.
3. **Commit atômico (motor):** tamanho novo + quanto a janela anda + o CSS que muda viram um "commit". O CSS só é aplicado quando chega o evento `resize` com `innerWidth/innerHeight` iguais ao tamanho pedido (±1 px). Se o evento não vier, aplica depois de 100 ms. Commits seguidos se juntam: os deslocamentos somam e vale o tamanho mais novo.
4. **No máximo um `setBounds` por quadro, sem esperar o anterior voltar** (até 5 em voo; o Windows aplica na ordem). No app instalado cada um leva ~50–70 ms: esperar a volta fazia a janela andar só ~15 vezes por segundo, aos saltos. Um commit com CSS espera o CSS do anterior entrar.
5. **Posição lógica em ponto flutuante.** Só é arredondada na hora de enviar, então nunca acumula erro de meio pixel. A Órbita arredonda as margens e passa o resto pro deslocamento.
6. **O conteúdo andou dentro da janela? A janela anda o contrário**, no mesmo commit (`shift`). No Eco, o `.rig` recebe o deslocamento e volta a zero numa mola (k 260): a marca nunca pula.
7. **Arrastando, a janela nunca passa da área das telas** (`screenClamp`), do mesmo jeito que o Windows faz. Assim não existe "zona morta" quando o mouse volta. O **alvo** pode passar da borda, porque é por ele que o app sente o lado. **Assentando, não há trava:** o destino é do app e já cabe na tela (com trava, a Onda nunca chegava perto da borda).
