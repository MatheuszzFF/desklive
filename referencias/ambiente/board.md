# Board: um palco em tela cheia por monitor

> L3 · referência. Índice: [ambiente](README.md). **O que é:** a arquitetura proposta em que os apps viram peças dentro de uma janela transparente do tamanho do monitor, os riscos, o que as typings permitem, como ligar N monitores, as guias de encaixe e a ideia do fundo no Wallpaper Engine. **Quando ler:** antes de decidir migrar um app pro Board ou de rodar a sonda dele. **Situação (26/11/2026):** **Board v2** publicado (os dois artefatos, agora "Board" e "Board · monitor 2"); a v1 rodou no app instalado (ele aprovou e achou o bug das extremidades do monitor 2), a v2 só no simulador e com leituras reais do PC. Peças: [board-pecas](board-pecas.md); motor: [board-motor](board-motor.md); monitores: [board-telas](board-telas.md); conexão: [board-conexao](board-conexao.md).

## O que existe (v2)

- **Shell:** a janela cobre a área útil do monitor (respeita a barra de tarefas), transparente, sempre no topo, clique passando; só se reposiciona quando o monitor muda (relê no `change` e a cada 3 s). Menu no clique direito de qualquer peça (`Menu.popup`), bandeja (Sonda, Afinação, peças, mostrar/esconder o Board, Sair) e atalhos **Ctrl+Alt+B** (mostra/esconde as peças, avisa o outro Board) e **Ctrl+Alt+Shift+B** (Afinação).
- **Peças:** cada uma é um módulo registrado; o shell cuida do arrasto, do motor, do encaixe, das guias, da emenda, do clique-passa e do hover ([board-pecas](board-pecas.md)). Posição, forma e "aberto" ficam em `~/.orbita/board-estado.json` (relativo ao monitor) junto com as molas afinadas.
- **Sonda (primeira peça):** do jeito da sonda original, a pedido dele: o painel 400 × até 760 (título arrastável, resumo ao vivo com "este app", telas e conexão, seções 1–8 abrindo com mola, listas, log, Copiar/Salvar, `~/.orbita/sonda-board.json`), aberto no canto de cima à direita na primeira vez. Cartão e pílula são peças de verdade do Board (nascem e somem com mola); onda e bolha WebGL só enquanto animam. Recolhida (botão –), vira a forma do lado: cápsula, ilha, horizonte, coluna de contas, medidor, sonar.
- **Dois apps, um por monitor:** o host dá uma janela por app, então o mesmo HTML é instalado duas vezes: **Board** e **Board · monitor 2** (nome no menu Iniciar). Cada um pega um monitor sozinho; a seção "Como usar" e a linha "este app" explicam.
- **Extremidades do monitor 2 (bug da v1):** o limite do arrasto trocava de monitor pelo **centro** da peça e prendia num monitor por vez; com 1032 (barra) ao lado de 1080, a peça pulava até 48 px e os alvos de borda curtos (a borda de 48 px embaixo da emenda) mandavam a peça pra fora da tela. Agora: limite pela união de regiões (ver [board-telas](board-telas.md)), alvos que não cabem no segmento são ignorados, alvos em todos os monitores com Board, guias e prévia do outro lado desenhadas pelo Board de lá, aviso quando não tem Board do outro lado da emenda.
- **Afinação:** peça escondida de dev (molas ao vivo, câmera lenta, overlay, registro).
- **Quem é dono:** a peça salva no meu monitor nasce comigo; órfã (monitor sem Board ou primeira vez) só o Board mais antigo pega, depois de 2 batidas; duas cópias → a do Board mais novo some.
- **Sair:** clique direito → Sair (ou bandeja): salva, solta o atalho, tenta fechar a janela e, se o host não deixar, minimiza. Fechar pela barra de tarefas também encerra.

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
- **Ímã:** a peça é puxada `k = 0,5 · smoothstep(1 − d/zona)`, suavizado a 14/s. Zonas: borda 72 px, canto 120, degrau 100, **emenda 44 px e só abaixo de 260 px/s**. Passando rápido, a peça atravessa; desacelerando perto, ela gruda. **v1:** a ponta da emenda também é canto ("canto da emenda", 60 px, só devagar) e o canto ganha da borda perto dele (pontuação `d · 0,35 − 30`; antes `d · 0,6` perdia pra borda colada).
- **Ao soltar:** mola k 320 ζ 0,78 até o alvo. A peça funde: raio 0 do lado da borda e ombros côncavos de 16 px; no canto, raio 0 nos dois lados e 30 px no de dentro. Sem alvo, embalo de 0,16 s da velocidade. (Na sonda isso é um rascunho; o padrão final segue a [fusão com a borda](../../padroes/motion/fusao-com-a-borda.md) e a R20.)

## Passar uma peça entre Boards (sem piscar)

- Arrastando, o ponteiro fica capturado pelo Board de origem, que continua recebendo o mouse sobre o outro monitor; o Board de lá desenha um **fantasma** na mesma posição física e adota a peça ao soltar (mesmo elemento, nada some). Rasgo na emenda ≈ velocidade × latência.
- Canais medidos, escolha (relay de named pipes → arquivo atômico), protocolo oferta → aceite → liberação → cancelamento, linha do tempo comum e provas: **[board-conexao](board-conexao.md)**.

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
