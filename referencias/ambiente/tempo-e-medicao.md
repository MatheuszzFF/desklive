# Tempo: quadros, atrasos e como medir

> L3 · referência. Índice: [ambiente](README.md). **O que é:** quem dita o ritmo dos quadros, quanto demora cada ida ao host e como medir isso dentro do app instalado. **Quando ler:** antes de mudar `dt`, fila de `setBounds`, atrasos de hover, ou ao investigar um "trava frame".

## rAF e vsync

- **O rAF segue o vsync do monitor principal (Chromium).** O Chromium no Windows espera o *vblank* do monitor principal (DXGI); o relógio do DWM por monitor está atrás de uma flag desligada. Aqui os dois monitores são de 60 Hz, então o rAF dá ~16,7 ms em qualquer um. Se um dia o segundo monitor for de 144 Hz, a janela nele continua a 60.
- **Os três apps rodam sem throttling** ([host](host.md#throttling-host)). O "rAF a ~1 por segundo" vinha do painel do navegador escondido no simulador, não do app.
- **A página é um iframe em outro processo**, mas segue o mesmo relógio de quadros.
- **O `dt` limitado a 1/30 s continua certo:** é o que segura um quadro perdido.

## Atrasos de cada caminho

| Caminho | Atraso | Confiança |
|---|---|---|
| `setBounds` → a promessa volta | ~50–70 ms, estimado por gravação; nunca cronometrado | (medir) |
| `setBounds` → a janela anda na tela | o `SetWindowPos` roda **antes** da resposta sair, mais uma composição do DWM | (host, inferido) |
| `setBounds` → `window.screenX` muda na página | quando o processo principal avisa a página dos bounds novos | (medir) |
| redimensionar → evento `resize` na página | ida e volta + o `resize` da view + 1 quadro | (host, medir) |
| movimento com `forward` → `pointermove` | 1 tarefa no processo principal + roteamento; rajadas viram 1 | (Electron) |
| `setIgnoreMouseEvents` → valendo | 1 IPC + a checagem de permissão (microtarefas) | (host) |
| `getCursorScreenPoint`, `getAllDisplays`, `getBounds` | 1 IPC cada | (host) |

**A fila do motor (até 5 `setBounds` em voo) é segura** **(host)**. O host não tem fila nem limite: atende as mensagens na ordem, e cada uma termina antes da próxima. A fila só acelera se o atraso estiver no transporte (o processo principal ocupado com outras coisas), não no `SetWindowPos`. A sonda separa os dois.

**Os três apps dividem o mesmo processo principal** com o Claude inteiro: leitura do barramento, helpers, MCP, indexação. Ler o barramento a cada 1–2,5 s compete com os `setBounds` de quem está sendo arrastado.

## Como medir no app instalado

- **No motor:** `meter(true)` liga `stats.frameTimes`. Os outros contadores já existem:
  - `stats.lat`: média móvel da volta do `setBounds`;
  - `stats.rejects` e `stats.lastError`;
  - `stats.hostFix`: quantas vezes o assentar teve de adotar a posição real;
  - `stats.capped`, `stats.slips` e `stats.brakes`.
  - Num teste, publique isso no barramento (`<app>-diag.json`) a cada 2 s.
- **Separe transporte de janela:** cronometre junto uma chamada vazia (`os.platform()`). A diferença `setBounds − platform` é o custo do `SetWindowPos`.
- **Grave a tela a 60 fps**, não 30. A tremida de redimensionar dura 1–2 quadros e some numa gravação de 30.
- **Teste visual de redimensionar:** um traço parado na tela enquanto a janela cresce pela esquerda. Se ele piscar, é o quadro velho ancorado no canto.

## Sonda de diagnóstico

A sonda é uma página de teste local, sem publicar: um artefato `desktop` com permissão `overlay` (e `full-access` opcional, só pra salvar o resultado). Instalada como app, ela mede:

| Teste | O que responde |
|---|---|
| Ambiente | versões do Electron e do Chromium, `devicePixelRatio`, `window.screen.avail*`, `getAllDisplays` (bounds × workArea, escala), estado das permissões, `prefers-reduced-motion` |
| rAF | média, p95 e p99 do intervalo, e % de quadros acima de 20 ms, com a janela parada e andando |
| Ida e volta pura | latência de `os.platform()` (o IPC sozinho) |
| Mover | volta do `setBounds` de 1 em 1; tempo até `screenX` mudar; em rajada de 1 por quadro, quantos ficam em voo e se a ordem se mantém |
| Redimensionar | volta, tempo até o `resize` e até `innerWidth` bater; teste visual do canto |
| Trava | pede fora da tela, na emenda (40/50/60 %), maior que a área útil, 10 × 10, fracionário, chave extra e `NaN`, e confere com `getBounds` |
| Hover | com `forward`: eventos por segundo, intervalos, `mouseleave` sintético; latência do `setIgnoreMouseEvents(false)` |
| Corrida do clique | um alvo que aparece com o "clique passa" ligado: conta entradas, cliques recebidos e o tempo da entrada ao clique, com halo de 0 e de 16 px |

O resultado vai pra área de transferência (botão) e, se houver `full-access`, pra `~/.orbita/sonda-ambiente.json`.

## Movimento reduzido

- `prefers-reduced-motion` vem de **Configurações → Acessibilidade → Efeitos visuais → Efeitos de animação** (`SPI_GETCLIENTAREAANIMATION`).
- O Chromium reavalia a media query quando o Windows avisa da mudança, **sem recarregar** **(Chromium; inferido pro Electron)**.
- O motor lê o valor uma vez, na criação. Escute o `change` do `matchMedia` e repasse ao motor e ao CSS ([movimento reduzido](../../padroes/motion/movimento-reduzido.md)).

## Fontes

- Chromium: [vsync_thread_win.cc](https://chromium.googlesource.com/chromium/src/+/main/ui/gl/vsync_thread_win.cc) e [vsync_thread_win_dxgi.cc](https://chromium.googlesource.com/chromium/src/+/main/ui/gl/vsync_thread_win_dxgi.cc); [animation_win.cc](https://chromium.googlesource.com/chromium/src.git/+/HEAD/ui/gfx/animation/animation_win.cc).
- [Compositor clock (Microsoft)](https://learn.microsoft.com/en-us/windows/win32/directcomp/compositor-clock/compositor-clock); [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
