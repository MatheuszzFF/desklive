# Mover e redimensionar a janela

> L3 · referência. Índice: [ambiente](README.md). **O que é:** a regra exata com que o host prende a janela, o que custa mover e o que custa redimensionar, e as estratégias de movimento comparadas. **Quando ler:** antes de mexer no envio do [motor](../motor/README.md), no tamanho da janela ou em cruzar monitores.

## A trava real do host

A cada `setBounds`, em DIP **(host)**:

```
r = o pedido; campo ausente = o do getBounds()
d = screen.getDisplayMatching(r)   o monitor com maior interseção   (empate: o primeiro da lista)
A = d.workArea
w = clamp(round(w), min(40, A.w), A.w)      h = clamp(round(h), min(40, A.h), A.h)
x = clamp(round(x), A.x, A.x + A.w − w)     y = clamp(round(y), A.y, A.y + A.h − h)
```

(Desminificado do módulo de janelas de app do host; o motor-piloto copia isso em `hostRect`. Confirmado pela sonda: [medições](medicoes.md#trava-do-host-confirmada).)

O que isso implica:
1. **A janela nunca fica entre dois monitores.** Arrastando pela emenda uma janela de largura `L`:
   - ela fica encostada na emenda até metade dela passar;
   - aí **pula `L` px** de uma vez pro outro monitor (medido com `L` = 300: x 1800 → 1920; x 1770 e 1740 → 1620);
   - o motor prende pela união dos monitores, então nesse trecho ele acha que a janela está num lugar e ela está em outro. Só o `getBounds` do assentar corrige.
2. **Vale a área útil, não a tela.** Neste PC a barra do Windows é oculta automaticamente, então a área útil é a tela inteira. Com a barra fixa, a 100 %, seriam 48 px a menos embaixo, e o motor (que usa `bounds`) bateria numa parede invisível.
3. **O teto de tamanho é a área útil de UM monitor.** O `fitRect` do motor soma os monitores lado a lado, o que está errado. Hoje não faz mal, porque os apps respeitam o teto de 60 %.
4. **Grande demais é encolhido, não recusado.** A "recusa" suspeita em [tamanho e borda](../motor/tamanho-e-borda.md) era `EBUSY` (minimizada, diálogo do host) ou `EINVAL`.
5. **Mínimo 40 × 40, e tudo é arredondado.** Mande inteiros: assim o motor e o host nunca discordam por meio pixel.

## Mover × redimensionar

- **Mover (mesmo tamanho) é barato.** O `SetWindowPos` sem mudança de tamanho não gera `WM_SIZE`, e o Chromium não redimensiona nada: só o DWM reposiciona a camada **(doc, Chromium)**.
- **Redimensionar passa por 4 saltos:**
  1. a janela nativa muda de tamanho;
  2. o host recebe o evento `resize` e redimensiona a `WebContentsView` **(host)**;
  3. a página recebe o tamanho novo, refaz o layout e pinta;
  4. a cadeia de troca (swap chain) é redimensionada.
- **Medido:** o `setBounds` volta em ~4 ms e o `resize` chega na página em **~16 ms** (p95 27): o conteúdo novo leva **1 quadro, às vezes 2**.
- **Até o quadro novo chegar, o DWM mostra o quadro velho ancorado no canto de cima à esquerda** **(medido)**:
  - crescer pra direita ou pra baixo não aparece, porque a área nova é transparente. Desde o Electron 39.2.6, a sobra é pintada transparente **(Electron)**;
  - mexer a **borda esquerda ou de cima** faz o conteúdo velho andar junto com o canto por **1–2 quadros**, em ~**1 a cada 3** trocas. **É a tremida no meio da animação.** Como evitar sem esconder: [nada pisca](../../padroes/motion/janela-sem-tremer.md#nada-pisca-r25).

## Estratégias comparadas

| Estratégia | Fluidez | Custo e risco |
|---|---|---|
| **`setBounds` por quadro** (motor v2.2) | a janela anda ~1 quadro atrás do mouse (volta em 1–4 ms, parada em só 0,7 % dos quadros, medido); tranco só quando o processo principal engasga; espera e pulo na emenda | 1 IPC por quadro, dividindo o processo principal com o Claude inteiro |
| **Palco fixo grande + só CSS** | 60 fps reais, movimento no mesmo quadro do evento, sem IPC | janela do tamanho da área útil. Com o mouse em cima ela não tem "clique passa" e pode contar como opaca no rastreador de oclusão do Chromium, pausando a pintura do Chrome ou do VS Code embaixo **(inferido)**. ~8 MB de GPU por buffer 1920 × 1080. Trocar de monitor = 1 pulo |
| **Palco só no gesto** (abre no arrasto, fecha ao assentar) | arrasto e embalo perfeitos; parado, igual a hoje | 2 commits de tamanho por gesto; o quadro velho na abertura e no fechamento precisa ser resolvido sem esconder (R25) |
| **União antes, encolher depois** (já usado nas trocas de forma) | sem redimensionar no meio da animação | janela maior que o conteúdo por um tempo; o encolher pela esquerda ou por cima ainda dá 1+ quadro de quadro velho |

## Cruzar a emenda como "portal"

Já que a janela não pode ficar entre dois monitores, faça o conteúdo passar **por trás da emenda**:
1. Enquanto o retângulo pedido cruza a emenda, a janela fica rente à emenda no monitor que tem a maior parte.
2. O conteúdo anda dentro dela pelo que falta (um deslocamento CSS) e é cortado na borda da emenda, que é a moldura física dos monitores.
3. Quando a maioria troca de lado, mande a janela pro outro lado e, quando o pulo chegar, desenhe o conteúdo saindo do outro lado.
   - **Não esconda o conteúdo** nesse pulo: a Onda v20 escondia 2 quadros e no vídeo virou piscada (R25). Congele ou faça crossfade ([nada pisca](../../padroes/motion/janela-sem-tremer.md#nada-pisca-r25)). Como está no motor: [motor-piloto, M2](../motor/motor-piloto.md).

O corte em linha reta aqui é a moldura do monitor, então não fere a R4.

## Monitores e DPI

- **O PC de teste:** dois monitores 1920 × 1080 a 100 % (96 DPI), lado a lado (principal em 0,0, a 60 Hz; o outro em 1920,0). A barra do Windows é oculta automaticamente.
- **Tudo é em DIP.** A 100 %, DIP é igual a pixel.
- **Em 125 % ou 150 %** as posições caem em frações de pixel. O Electron tem bugs antigos de 1–3 px nesses casos (#9477, #10659). Mande sempre os quatro campos (o motor já manda) e aceite ±1 px no `resize`.
- **DPI misto** (não é o caso aqui): ao cruzar pra um monitor de outra escala, o Windows manda `WM_DPICHANGED` e a janela é redimensionada no meio do arrasto.
- **A API `desktop` não tem evento de troca de monitor.** Já o `window.screen` da página não usa IPC nem permissão: dá `availLeft`, `availTop`, `availWidth` e `availHeight` do monitor onde está a maior parte da janela, mais o evento `change`. É o espelho local da área que o host usa **(medido:** no segundo monitor deu `availLeft` 1920 e `availWidth` 1920, e o `change` disparou 4 vezes na rodada da sonda**)**. Use o `getAllDisplays()` pro mapa inteiro, no início do arrasto e quando o `change` disparar.

## Fontes

- Pacote do Claude (trava e `resize` da view); [native_window_views.cc](https://github.com/electron/electron/blob/main/shell/browser/native_window_views.cc).
- [SetWindowPos](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowpos); [hwnd_message_handler.cc](https://chromium.googlesource.com/chromium/src/+/main/ui/views/win/hwnd_message_handler.cc).
- [Electron: resize no Windows](https://www.electronjs.org/blog/tech-talk-window-resize-behavior); [oclusão nativa](https://chromium.googlesource.com/chromium/src/+/master/docs/windows_native_window_occlusion_tracking.md).
- Electron [#9477](https://github.com/electron/electron/issues/9477), [#10659](https://github.com/electron/electron/issues/10659), [#12938](https://github.com/electron/electron/issues/12938).
