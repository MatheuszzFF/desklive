# Board: Telas, a fonte da verdade dos monitores

> L3 · referência. Índice: [ambiente](README.md) · conceito em [board](board.md) · conexão em [board-conexao](board-conexao.md). **O que é:** o serviço do Board que junta o que o host, o Windows e a medição ao vivo dizem de cada monitor (geometria, pixel físico, escala, Hz) e como todo cálculo usa isso. **Quando ler:** antes de mexer em coordenadas, emenda, degrau, DPI ou Hz.

## De onde vem cada valor

| Valor | Fonte | Quando é lido |
|---|---|---|
| id, `bounds`, `workArea`, `scaleFactor`, `rotation` | host (`screen.getAllDisplays`) | ao abrir, no `change` do `window.screen` e a cada 3 s (IPC de ~0,2 ms) |
| retângulo **físico** do monitor e da área útil, DPI real, **taxa** (`dmDisplayFrequency`), resolução, orientação, principal | Windows, por PowerShell com `Add-Type` (`EnumDisplayMonitors`, `GetMonitorInfo`, `EnumDisplaySettingsEx`, `GetDpiForMonitor`); sem binário, passa no Smart App Control | **só** ao abrir e quando a leitura do host mudou (debounce de 600 ms); nunca em laço |
| vsync real deste Board | medido: mediana do intervalo do rAF num surto de 40 quadros | ao abrir e ao trocar de monitor |

O resultado vai pro cache `~/.orbita/telas.json` (host, Windows casado, divergências). O painel **Afinação → Telas e conexão** mostra cada monitor, de onde veio cada valor e o que diverge.

## Casamento host ↔ Windows

Pelo **tamanho físico** (`bounds × escala`, ±2 px) e pela **escala** (`dpi / 96`, ±0,02); a ordem (x, depois y) só desempata entre monitores idênticos. **Nunca por id nem por ordem pura:** o id do host já mudou uma vez entre a sonda e o Board. Sem Windows (sem `full-access` ou se o PowerShell falhar), o físico é estimado: origem do host, tamanho `× escala`.

O estado salvo das peças guarda também o retângulo do monitor (`mon`): se o id mudou, a peça acha o monitor pela geometria.

## Espaços de coordenada

- **DIP do host** (global): o que `getAllDisplays` dá.
- **Físico** (global): pixels reais do Windows. É a moeda entre Boards: toda posição que viaja no barramento vai em físico.
- **Espaço do Board** (`telasM`): o DIP do meu monitor estendido linearmente (`físico ÷ minha escala`). É o espaço da minha janela e do ponteiro capturado fora dela. A geometria (bordas, emendas, cantos, degraus) e o limite do arrasto são montados nele; com escalas iguais é o próprio DIP do host.
- `dipParaFis` / `fisParaLocal` convertem; o render arredonda a translação no **pixel físico** do meu monitor (`round(v·escala)/escala`).

## Os Boards concordam

Cada Board calcula uma **assinatura** (hash da geometria do host, sem ids) e publica no batimento e em toda mensagem do passe. Se divergir: relê host e Windows (no máximo uma vez a cada 30 s) e **não aceita uma oferta de passe** até as assinaturas baterem (a oferta cancela em 1,5 s e a peça volta, sem perda).

## Lido no PC dele (26/11/2026, PowerShell, sem tocar no mouse)

| Monitor | Físico | Área útil | DPI | Hz | Host (batimento) |
|---|---|---|---|---|---|
| DISPLAY1 (principal) | 0,0 1920×1080 | 1920×**1032** | 96 | 60 | 0,0 1920×1032 ✓ |
| DISPLAY2 | 1920,0 1920×1080 | 1920×1080 | 96 | 60 | 1920,0 1920×1080 ✓ |

O script embutido rodou como o host vai rodar (`-EncodedCommand`, 7,7 mil caracteres) em 1,5 s. Sem divergências.

## Simulador

- `cfg=real`: o caso acima. A geometria sai: emenda 0–1032 dos dois lados, borda de 48 px (1032–1080) no lado esquerdo do monitor 2, degrau em (1920, 1032), canto da emenda em (1920, 0) e (1920, 1032) do monitor 1, canto comum em (1920, 1080) do monitor 2.
- `cfg=misto`: monitor 2 a 1,5 (2560×1440 físicos, 1707×960 DIP, 300 px físicos mais alto) e 144 Hz. O monitor 2 visto do Board 1 vira 2561×1368 a partir de y −300; emenda 0–1032. Vsync medido: 59,9 e 142,9 Hz.
