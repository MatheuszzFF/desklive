# Board: um palco em tela cheia por monitor

> L3 · referência. Índice: [ambiente](README.md). **O que é:** a arquitetura proposta em que os apps viram peças dentro de uma janela transparente do tamanho do monitor, os riscos, o que as typings permitem, como ligar N monitores, as guias de encaixe e a ideia do fundo no Wallpaper Engine. **Quando ler:** antes de decidir migrar um app pro Board ou de rodar a sonda dele. **Situação (25/11/2026):** proposta; a sonda está escrita e **ainda não rodou**: nada aqui é medido.

## A ideia

- **Hoje:** cada app (Órbita, Onda, Eco) é uma janela pequena que anda por `setBounds`. Daí vêm o quadro velho ao redimensionar, a briga com a trava do host nas bordas e cantos, a emenda dos monitores e o ponto de pega escorregando ([mover e redimensionar](mover-e-redimensionar.md), [bugs e lições](../motor/bugs-e-licoes.md)).
- **Board:** **uma janela por monitor**, transparente e sempre no topo, do tamanho da área útil. Os apps vivem dentro como **peças movidas só por `transform`**: a janela nunca anda e nunca muda de tamanho.
- **Clique passa** (`setIgnoreMouseEvents(true, {forward:true})`) em tudo, menos em cima de uma peça (dentro ou fora pela geometria, com halo).
- **Por que resolve:** sem redimensionar não há quadro velho; o mouse e a peça andam no mesmo quadro, sem IPC; nada briga com a trava, porque a janela já é a área útil inteira. É a linha "palco fixo grande + só CSS" de [estratégias comparadas](mover-e-redimensionar.md#estratégias-comparadas).

## O que as typings permitem (contrato 0.2.99)

- **Uma janela por app.** `desktop.window` é uma só; **não existe API pra abrir outra janela**. As "floating windows" da doc são a própria janela do app com `overlay`.
- **O mesmo artefato não instala duas vezes** (`install.state()` = `installed`). Logo, **um Board por monitor = um artefato instalado por monitor**: o mesmo HTML publicado N vezes ("Board 1", "Board 2"…), cada um pedindo as permissões.
- **`setOptions`:** `frame`, `transparent`, `alwaysOnTop`, `dragHeight`, `movable`, `resizable`, `minimizable`, `maximizable`, `fullscreenable`, `hasShadow`, `roundedCorners`, `backgroundColor`, `width/height`, `min*/max*` (e os de macOS). **Não há `focusable`, `skipTaskbar` nem `type`**: o Board aparece na barra de tarefas e pega o foco quando uma peça é clicada.
- **`screen`** (permissão `overlay`): `getCursorScreenPoint()` e `getAllDisplays()` (`id`, `label`, `bounds`, `workArea`, `size`, `workAreaSize`, `scaleFactor`, `rotation`, `internal`). Não tem evento de mudança: use o `change` do `window.screen` e releia a cada poucos segundos. `setVisibleOnAllWorkspaces` não faz nada no Windows.
- **A janela não cruza monitores:** o host prende cada `setBounds` na área útil de um monitor ([trava](mover-e-redimensionar.md#a-trava-real-do-host)). Um Board que cobrisse dois monitores é impossível.

## N monitores: bordas, cantos, emendas e degraus

- **Quem fica onde:** cada Board escreve `~/.orbita/board-vivo-<id>.json` (na sonda, `sonda-board-vivo-<id>.json`) com o monitor, o início e a hora, a cada 1 s. Dois no mesmo monitor: o mais antigo fica e o outro vai pro próximo monitor livre. Monitor sem Board: sem peças até um Board abrir.
- **Geometria genérica:** pra cada monitor, cada lado da área útil é cortado em **borda** (fora da união) e **emenda** (encostada noutro monitor, com tolerância de ±2 DIP). **Cantos** são pontas de duas bordas em ângulo reto: **convexo** (o canto de verdade) ou **côncavo** (**degrau**, onde monitores desalinhados criam uma quina). Ex.: dois 1920 × 1080, o da direita 200 px mais alto → 1 emenda de 880 px, 6 cantos e 2 degraus.
- **Barra do Windows fixa na emenda:** as áreas úteis não se tocam, então ali é borda (parede), não emenda.
- **DPI diferente:** tudo em DIP. A peça muda de tamanho físico ao cruzar (inevitável); o dono é o monitor onde está o **centro**. O layout em DIP de monitores com escalas diferentes pode ter buracos ou sobreposições de poucos px **(hipótese)**: daí a tolerância.
- **Monitor desligado:** o Windows move a janela pro monitor que sobrou. O Board relê (`change` + a cada 3 s), vê que o monitor dele sumiu, se reposiciona no novo e prende as peças lá com mola (nada some). **Proposta:** se já há um Board no destino, ele passa as peças pro dono e se minimiza.

## Guias de encaixe (motion)

- **Só durante o arrasto.** As guias de bordas, cantos, degraus e emendas aparecem em 0,22 s e somem em 0,45 s ao soltar. Cada guia acende pela distância da peça: opacidade 0,14 → 0,76 dentro de 320 px.
- **O alvo mais perto acende:** traço branco de 3 px com brilho que "respira" (1,1 s); emenda tracejada que corre. Uma **prévia** mostra a forma que a peça vai ganhar ali.
- **Ímã:** a peça é puxada `k = 0,5 · smoothstep(1 − d/zona)`, suavizado a 14/s. Zonas: borda 72 px, canto 120, degrau 100, **emenda 44 px e só abaixo de 260 px/s**. Passando rápido, a peça atravessa; desacelerando perto, ela gruda.
- **Ao soltar:** mola k 320 ζ 0,78 até o alvo. A peça funde: raio 0 do lado da borda e ombros côncavos de 16 px; no canto, raio 0 nos dois lados e 30 px no de dentro. Sem alvo, embalo de 0,16 s da velocidade. (Na sonda isso é um rascunho; o padrão final segue a [fusão com a borda](../../padroes/motion/fusao-com-a-borda.md) e a R20.)

## Passar uma peça entre Boards (sem piscar)

- Arrastando, o ponteiro fica capturado pelo Board A, que continua recebendo o mouse sobre o outro monitor. A escreve a posição global e a velocidade em `~/.orbita/board-caixa-<B>.json` (uma escrita em voo, vale a última).
- B lê a cada ~12 ms e desenha um **fantasma** extrapolado pela velocidade (até 60 ms). Cada Board é cortado pela moldura do próprio monitor, então a emenda vira um portal.
- **Ao soltar:** o dono é o monitor do centro do destino. B **adota no mesmo quadro**, com o mesmo elemento do fantasma, e confirma. A só remove a sua cópia quando chega a confirmação; se nada chegar em 1,5 s, a peça volta. Nunca esconde (R25).
- **Rasgo na emenda ≈ velocidade × latência** (30 ms a 1000 px/s = 30 px). A sonda mede a latência do barramento; se não der, a alternativa é um servidor local num processo filho **(a testar)**.

## Riscos

1. **Diálogo do host:** enquanto um está aberto, todas as janelas perdem o clique passa ([hover](hover-e-clique-passa.md#diálogos-do-host)). Com o Board, **o monitor inteiro bloqueia o clique** até ele fechar.
2. **"Tela cheia" do Windows:** uma janela do tamanho do monitor pode virar `QUNS_BUSY`, o que cala notificações, aciona o "não incomodar" e mexe na barra de tarefas. Mitigação a medir: 1 px de folga.
3. **Wallpaper Engine pausa** com "outro app em tela cheia ou maximizado" (padrão), inclusive em janela sem borda. Também há relato de janelas transparentes de tela inteira confundindo a detecção.
4. **Oclusão:** o Chromium e o Electron embaixo podem achar que estão cobertos e pausar a pintura ou o vídeo **(hipótese)**, sobretudo com o clique passa desligado.
5. **Foco:** sem `focusable`, clicar numa peça tira o teclado do app de baixo, e ele não volta sozinho.
6. **Clique passa no monitor inteiro:** enquanto acordado (em cima de uma peça + 160 ms), o clique em volta é comido; o hover com o mouse parado precisa do vigia de 4–5 Hz.
7. **Custo:** um buffer de 1920 × 1080 é ~8 MB, vezes 2–3 na cadeia de troca, por monitor; cada movimento do mouse no monitor vira um evento na página.
8. **N apps instalados:** N pedidos de permissão, N processos, versões que podem ficar diferentes.

## A sonda

A `sonda-board.html` (pasta de trabalho, fora do repo, como a [sonda do ambiente](como-medir.md#1-a-sonda)) pede `overlay`, `full-access` e `notifications`. Cobre a área útil do monitor (opção "1 px a menos"), deixa o clique passar e tem um painel arrastável. Mede:
1. **Clique passa:** a cadência do `forward`, a latência de acordar e dormir, 20 cliques rápidos (com e sem halo) e o hover com o mouse parado, com e sem vigia.
2. **Fluidez:** rAF, quadros perdidos, JS por quadro e LoAF, parado, arrastando, com três peças animando (onda em canvas, bolha em WebGL, mola).
3. **Tela cheia:** `SHQueryUserNotificationState` e o app em primeiro plano, via PowerShell, mais uma notificação de teste e uma lista do que ele observou (exato × −1 px).
4. **Oclusão:** `visibilityState`, pausas do rAF, um relógio pra comparar com o vídeo e o clique passa segurado desligado.
5. **Custo:** GPU e CPU do Claude, parado × animando (contador `\GPU Engine(*)\Utilization Percentage`), e a memória.
6. **Teclado e foco:** o primeiro plano em 0, 6 e 12 s e a digitação no campo do cartão.
7. **Monitores:** a lista com `bounds`, `workArea` e escala, as emendas, cantos e degraus, as trocas ao vivo e o passe entre dois Boards.
8. **Wallpaper Engine:** se está instalado.

Salva em `~/.orbita/sonda-board.json`. **Rodar:** instale, abra e rode as seções de cima pra baixo. Pro passe, instale uma segunda cópia publicada à parte.

## Fundo: papel de parede HTML no Wallpaper Engine

- **O que é:** HTML, CSS e JS rodando no CEF (Chromium embutido).
  - O `window.wallpaperPropertyListener` recebe `applyUserProperties` (só o que mudou), `applyGeneralProperties` (limite de FPS), `setPaused` e os arquivos de pastas.
  - Tipos de propriedade: cor, slider, bool, combo, `textinput`, `file` e `directory`. Há também áudio e integração de mídia.
- **Arquivos locais:** só os escolhidos pelo usuário numa propriedade `file` ou `directory` (o caminho vem pronto; prefixe `file:///`). Fora disso, o desenvolvedor respondeu "não" à leitura livre do disco.
- **localhost:** nada documentado. Um `fetch` ou WebSocket pra um servidor local é **(a testar)**.
- **Board → fundo (documentado):** `wallpaper64.exe -control applyProperties -properties RAW~({"chave":valor})~END [-monitor N]` muda propriedades do papel de parede aberto. O Board roda isso com `full-access` via `childProcess.exec` (~100 ms por chamada **(inferido)**): serve pra cor, modo, foco, nunca por quadro.
- **Fundo → Board:** sem canal documentado.
- **Pausa:** em Desempenho, "outro app em tela cheia" e "maximizado" vêm em pausar. Pra conviver com o Board: "Continuar rodando" ou uma regra por app; a sonda diz se o Board dispara isso.

## Fontes

Typings `desktop.d.ts` do contrato 0.2.99. Wallpaper Engine: [property listener](https://docs.wallpaperengine.io/en/web/api/propertylistener.html), [propriedades](https://docs.wallpaperengine.io/en/web/customization/properties.html), [web wallpapers](https://docs.wallpaperengine.io/en/web/overview.html), [depuração (CEF)](https://docs.wallpaperengine.io/en/web/debug/debug.html), [linha de comando](https://help.wallpaperengine.io/en/functionality/cli.html), [loja (pausa em janela sem borda)](https://store.steampowered.com/app/431960/Wallpaper_Engine/). Comunidade: [arquivos locais ("No.")](https://steamcommunity.com/app/431960/discussions/2/1738886607259685124), [detecção e janelas transparentes](https://steamcommunity.com/app/431960/discussions/2/2579854400733419277), [pausa por monitor](https://steamcommunity.com/app/431960/discussions/0/312265327163035278). Windows: [SHQueryUserNotificationState](https://learn.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-shqueryusernotificationstate).
