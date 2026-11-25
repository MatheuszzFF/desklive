# O host: como o app Claude monta e mexe a janela

> L3 · referência. Índice: [ambiente](README.md). **O que é:** o que o app Claude faz por baixo de cada chamada `desktop.window.*` e `desktop.screen.*`, lido no pacote instalado. **Quando ler:** antes de mudar o motor, as opções da janela ou o "clique passa". As marcas de confiança estão no [índice](README.md#legenda-de-confiança).

**Versão lida:** app Claude 6.28899.2 (MSIX, Windows), **Electron 45.3.3**, **Chromium 156.0.8078.100**, contrato de runtime 0.2.99. Ao atualizar o Claude, confira `Electron/…` em `navigator.userAgent`: os detalhes abaixo podem mudar.

## Como a janela é montada (host)

- **Uma `BrowserWindow` por app**, criada a partir das opções salvas pelo `setOptions`:
  - `width` é presa entre 200 e a largura útil, e `height` entre 120 e a altura útil;
  - `minWidth = min(360, width)` e `minHeight = min(300, height)`;
  - `transparent` vira `transparent: true` + fundo `#00000000` + `fullscreenable: false` + `maximizable: false`;
  - `alwaysOnTop` não entra na criação: é aplicado logo depois com `setAlwaysOnTop(true, "floating")`.
- **Dentro dela fica uma `WebContentsView`** (fundo `#00000000` quando transparente), com a "casca" do Claude. O **nosso HTML roda num iframe** dessa casca, em outro processo.
  - O host injeta CSS que deixa a casca transparente e põe `color-scheme: normal` no iframe.
  - Por isso a página precisa de `color-scheme: light`. Um esquema diferente do esquema do iframe faz o Chromium pintar o fundo opaco: é o motivo real do truque em [brilho dentro da janela](../../padroes/motion/brilho-dentro-da-janela.md).
- **`dragHeight: 0` é obrigatório.** Sem ele, numa janela transparente ou sempre no topo, o host põe por cima uma faixa de arrasto de 28 px, cinza translúcida.
- **`resizable: false` ajuda (Electron).** No Windows, a cada `setBounds` numa janela não redimensionável, o Electron iguala mínimo = máximo = tamanho novo. Assim o `minWidth` da criação não impede encolher.
- **`transparent` tira a moldura grossa (Electron).** Sem `WS_THICKFRAME`, a janela não tem sombra nem encaixe do Windows.
- **Sem `skipTaskbar`, `focusable` nem `type`** (não estão na lista aceita). A janela aparece na barra do Windows e pega o foco quando é clicada.

## Cada chamada = uma ida e volta ao processo principal (host)

- `claude.use("desktop")` devolve o objeto que o preload do host expõe **na própria página**, sem `postMessage` no meio.
- Cada método vira um `ipcRenderer.invoke` pro **processo principal do Claude**, que é o mesmo dos três apps e do app inteiro. Lá a chamada é validada (zod) e a permissão conferida (`overlay`: a cada chamada, rápido depois de concedida); então o método roda e a resposta volta.
- **Sem fila, sem limite de taxa, sem throttle** no host. As mensagens são atendidas na ordem, e `setBounds` roda inteiro (síncrono) dentro do atendimento.
- O atraso real é o processo principal ocupado mais o `SetWindowPos` do Windows. Os ~50–70 ms do motor saíram de uma gravação da tela, não de um cronômetro **(medir)**.

## O que cada API faz por baixo

| Chamada | Por baixo | Pegadinhas |
|---|---|---|
| `setBounds(r)` | campos ausentes vêm do `getBounds()`; acha o monitor de maior interseção com `r`; arredonda e prende tudo na **área útil desse monitor** ([fórmula](mover-e-redimensionar.md#a-trava-real-do-host)); chama `BrowserWindow.setBounds` | resolve `undefined` (não diz onde a janela ficou). Nunca recusa por tamanho. `EBUSY` se estiver minimizada, em tela cheia, instalando ou com diálogo do host. `EINVAL` com chave extra, `NaN` ou fora de ±100 000 |
| `getBounds()` | `BrowserWindow.getBounds()`, em DIP | é a posição real (1 IPC) |
| `setIgnoreMouseEvents(i, {forward})` | guarda o pedido e aplica com `BrowserWindow.setIgnoreMouseEvents` | só no app instalado. Com diálogo do host aberto, fica forçado em `false` e o último pedido é reaplicado quando o diálogo fecha ([hover](hover-e-clique-passa.md)) |
| `screen.getAllDisplays()` | o mesmo do Electron: `id`, `label`, `bounds`, `workArea`, `size`, `workAreaSize`, `scaleFactor`, `rotation`, `internal` | em DIP; **sem evento de mudança** na API |
| `screen.getCursorScreenPoint()` | o mesmo do Electron | 1 IPC; é a posição real do cursor |
| `place({anchor} ou {pin})` | calcula no host e chama o mesmo `setBounds` | `ECANCELED` se estiver escondida |
| `setOptions(o)` | salva; se mudou algo, **reconstrói a janela e recarrega** a página | mande sempre as mesmas opções |

## Sempre no topo = nível `floating` (host, Electron)

- O host usa o nível `floating`. No Windows, o Electron põe os níveis `floating`, `torn-off-menu`, `modal-panel`, `main-menu` e `status` **logo abaixo da barra de tarefas** e repete isso toda vez que a janela é ativada.
- Neste PC a barra do Windows fica oculta automaticamente. Com o mouse na borda de baixo, ela sobe **por cima** do que estiver encostado lá (Órbita, Onda) **(inferido)**.
- Entre os três apps, todos estão no topo: fica na frente o último ativado (clicado).
- Com um diálogo do host aberto (permissões etc.), os apps deixam de ser "sempre no topo" até ele fechar.

## Throttling (host)

- O host liga e desliga sozinho o `backgroundThrottling` do conteúdo. Ele **desliga** enquanto o app "segura" algo: ícone na bandeja, atalho global registrado ou processo filho rodando.
- Os três apps seguram (bandeja, helpers, atalho), então rodam **sem throttling**. O patch `disable_hidden` do Electron mantém o rAF vivo mesmo encoberto ou minimizado.
- Um app sem nada disso fica com o rAF parado quando escondido ou minimizado.

## O observador de DOM do preload (host)

O preload procura `app-region` na página com um `MutationObserver` em **tudo**: atributos, filhos e texto, na árvore inteira.
- Cada mutação agenda uma varredura 50 ms depois, e há mais uma a cada 2 s.
- Sem `app-region` no CSS, a varredura é barata. Mesmo assim, cada `style` ou classe trocado por quadro gera um registro de mutação.
- **Regras:** nunca use `app-region`, e anime por variáveis CSS num elemento só (ou por `transform` em poucos elementos), não por dezenas de atributos por quadro.

## Fontes

- Pacote instalado do app Claude (só leitura): o preload da janela de app e o módulo de apps de artefato do processo principal.
- Electron, [native_window_views.cc](https://github.com/electron/electron/blob/main/shell/browser/native_window_views.cc): `SetBounds`, `SetAlwaysOnTop`, `thickFrame`.
- [Electron `disable_hidden.patch`](https://github.com/electron/electron/blob/main/patches/chromium/disable_hidden.patch) e [Rectangle](https://www.electronjs.org/docs/latest/api/structures/rectangle).
