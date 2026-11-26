# Tempo: quadros e atrasos

> L3 · referência. Índice: [ambiente](README.md). **O que é:** quem dita o ritmo dos quadros e quanto demora cada ida ao host. **Quando ler:** antes de mudar `dt`, fila de `setBounds`, atrasos de hover, ou ao investigar um "trava frame". Como medir (sonda, modo de registro, vídeo): [como medir](como-medir.md). Os números: [medições](medicoes.md).

## rAF e vsync

- **O rAF segue o vsync do monitor principal (Chromium).** O Chromium no Windows espera o *vblank* do monitor principal (DXGI); o relógio do DWM por monitor está atrás de uma flag desligada. **Medido:** 60 fps estável (16,7 ms) com a sonda no **segundo** monitor, então lá também vale o ritmo do principal (60 Hz). Se um dia o segundo monitor for de 144 Hz, a janela nele continua a 60.
- **Os três apps rodam sem throttling** ([host](host.md#throttling-host)). O "rAF a ~1 por segundo" vinha do painel do navegador escondido no simulador, não do app.
- **A página é um iframe em outro processo**, mas segue o mesmo relógio de quadros.
- **O `dt` limitado a 1/30 s continua certo:** é o que segura um quadro perdido.

## Atrasos de cada caminho

| Caminho | Atraso | Confiança |
|---|---|---|
| `setBounds` (só mover) → a promessa volta | **1,2 ms** p50, 2,4 p95; em rajada de 1 por quadro, 3,8 p50. Os "~50–70 ms" de antes eram estimativa de gravação e **não existem** | (medido) |
| `setBounds` → a janela anda na tela | o `SetWindowPos` roda **antes** da resposta sair, mais uma composição do DWM | (host, inferido) |
| `setBounds` → `window.screenX` muda na página | já mudou quando a promessa volta | (medido) |
| redimensionar → evento `resize` na página | **~16 ms** p50 (p95 27): 1 quadro, às vezes 2 | (medido) |
| movimento com `forward` → `pointermove` | 1 tarefa no processo principal + roteamento; rajadas viram 1; ~60 Hz andando | (Electron, medido) |
| `setIgnoreMouseEvents` → valendo | 1 IPC + a checagem de permissão: ligar 1,4 ms, desligar 2,5–6 ms | (host, medido) |
| `getCursorScreenPoint`, `getAllDisplays`, `getBounds` | 1 IPC cada; o cursor custa 0,2 ms | (host, medido) |

**A fila do motor (até 5 `setBounds` em voo) é segura (host)**, mas na prática nunca passa de 1 em voo (medido): o host não tem fila nem limite, atende as mensagens na ordem e cada uma termina antes da próxima. O `MAXFLY = 5` é só teto de segurança. O IPC sozinho custa 0,2 ms, então o atraso só aparece com o processo principal ocupado.

**Os três apps dividem o mesmo processo principal** com o Claude inteiro: leitura do barramento, helpers, MCP, indexação. Ler o barramento a cada 1–2,5 s compete com os `setBounds` de quem está sendo arrastado.

## Movimento reduzido

- `prefers-reduced-motion` vem de **Configurações → Acessibilidade → Efeitos visuais → Efeitos de animação** (`SPI_GETCLIENTAREAANIMATION`).
- O Chromium reavalia a media query quando o Windows avisa da mudança, **sem recarregar** **(Chromium; inferido pro Electron)**.
- O motor lê o valor uma vez, na criação. Escute o `change` do `matchMedia` e repasse ao motor e ao CSS ([movimento reduzido](../../padroes/motion/movimento-reduzido.md)); o motor-piloto já faz (H5).

## Fontes

- Chromium: [vsync_thread_win.cc](https://chromium.googlesource.com/chromium/src/+/main/ui/gl/vsync_thread_win.cc) e [vsync_thread_win_dxgi.cc](https://chromium.googlesource.com/chromium/src/+/main/ui/gl/vsync_thread_win_dxgi.cc); [animation_win.cc](https://chromium.googlesource.com/chromium/src.git/+/HEAD/ui/gfx/animation/animation_win.cc).
- [Compositor clock (Microsoft)](https://learn.microsoft.com/en-us/windows/win32/directcomp/compositor-clock/compositor-clock); [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
