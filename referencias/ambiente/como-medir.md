# Como medir e provar no app instalado

> L3 · referência. Índice: [ambiente](README.md). **O que é:** as três ferramentas que medem movimento, tamanho e hover no host de verdade (a sonda, o modo de registro e o vídeo quadro a quadro), mais os contadores do motor. **Quando ler:** antes de "corrigir" uma causa suposta, e pra provar a R25 (nada pisca) antes de publicar. Os números já medidos estão em [medicoes.md](medicoes.md).

**Regra:** número medido no app instalado vale mais que qualquer estimativa. Tudo que dura 1 quadro só aparece em vídeo a 60 fps ou no registro; o simulador não prova ausência de piscada. Nunca use o mouse ou o teclado do PC (R19): o que precisa do mouse, peça pra ele fazer.

## No motor

- `meter(true)` liga `stats.frameTimes`. Os outros contadores já existem: `stats.lat` (média móvel da volta do `setBounds`), `stats.rejects` e `stats.lastError`, `stats.hostFix` (quantas vezes o assentar adotou a posição real), `stats.capped`, `stats.slips`, `stats.brakes`; no motor-piloto também `stats.hides` e `stats.nudges`.
- Num teste, publique isso no barramento (`<app>-diag.json`) a cada 2 s.
- **Separe transporte de janela:** cronometre junto uma chamada vazia (`os.platform()`). A diferença `setBounds − platform` é o custo do `SetWindowPos`.

## 1. A sonda

Uma página de teste local, sem publicar: um artefato `desktop` com permissão `overlay` e `full-access` (este só pra salvar o resultado), instalado como app. Pra saber quando a janela andou, ela espera `window.screenX` mudar a cada rAF.

| Teste | O que responde |
|---|---|
| Ambiente | versões do Electron e do Chromium, `devicePixelRatio`, `window.screen.avail*`, `getAllDisplays` (bounds × workArea, escala), permissões, `prefers-reduced-motion` |
| rAF | média, p95 e p99 do intervalo e % de quadros acima de 20 ms, com a janela parada e andando |
| Ida e volta pura | latência de `os.platform()` (o IPC sozinho) |
| Mover | volta do `setBounds` de 1 em 1; tempo até `screenX` mudar; em rajada de 1 por quadro, quantos ficam em voo e se a ordem se mantém |
| Redimensionar | volta, tempo até o `resize` e até `innerWidth` bater, pela direita e pela esquerda; teste visual do canto |
| Trava | fora da tela, na emenda (40/50/60 %), maior que a área útil, 10 × 10, fracionário, chave extra e `NaN`, conferido com `getBounds` |
| Hover | com `forward`: eventos por segundo, intervalos, `mouseleave` sintético; latência do `setIgnoreMouseEvents` |
| Corrida do clique | um alvo que aparece com o "clique passa" ligado: entradas, cliques recebidos e o tempo da entrada ao clique, com halo de 0 e de 16 px |

**Como rodar:** "Rodar tudo (automático)" faz ambiente, rAF, IPC, mover, rajada, redimensionar e trava (não mexer na sonda enquanto roda). Depois "Hover com forward (8 s)", "Corrida do clique (halo 0 / 16)" e "Teste visual do canto (6 s)": esses precisam do mouse **dele**. Por fim "Copiar resultado" ou "Salvar em ~/.orbita" (`~/.orbita/sonda-ambiente.json`).

## 2. Modo de registro (trace) no app

Pra um bug que só aparece no app instalado (arrasto, troca de forma, deslizar o progresso), o app guarda um registro por quadro. A Onda é a primeira a ter (v21); o formato vale pra todos.

- **Liga e desliga pelo menu** (botão direito → **Gravar diagnóstico**, item com marca). Desligado por padrão, não custa nada.
- **Buffer circular de 60 s** (3600 quadros) e até 4000 eventos. Ligar zera os dois e liga o `meter(true)` do motor.
- **Cada quadro guarda:**
  - `t` (ms) e o mouse: tela X/Y, página X/Y e botões (do último `pointermove`);
  - o gesto (`g`), a fase do motor (`mo`), a posição lógica (`cur`) e o destino (`alvo`);
  - a forma, o degrau e a zona (`z` = tipo + lado h + lado v); a caixa `LR`;
  - a janela pedida (`pedido`, o último `setBounds`) e a real (`real`: `screenX/Y` + `innerWidth/Height`);
  - os commits de tamanho, se o conteúdo está escondido (`esconde`) e o portal da emenda;
  - o "clique passa" (`cp`: quer, está), o hover, o botão pressionado e a prévia do deslizar;
  - durante o arrasto, o **ponto de pega**: a peça, a fração dentro dela e o **erro** (onde o ponto pego está na página − onde o mouse está, em px).
- **Eventos com alvo:** `pointerdown`, `pointerup`, `pointercancel`, `gotpointercapture` e `lostpointercapture`, com tempo, tela, página, botões e a classe do alvo.
- **Desligando, salva** em `~/.orbita/<app>-trace.json` (`fs.writeFile`, permissão `full-access`) com `inicio`, `fim`, `legenda`, `quadros`, `eventos` e os `stats` do motor.
- **Como ler:**
  - `pedido` ≠ `real` num quadro: o app brigou com a trava do host.
  - Um quadro com `|erro|` > 2 px no arrasto: o ponto de pega escorregou; veja o que mudou no mesmo quadro (`forma`, `z`, `LR`, `pedido`).
  - Um `lostpointercapture` ou `pointercancel` no meio de um deslizar explica um "ficou segurando".
  - `cp` com "quer" ligado e botão pressionado é o "clique passa" ligando no meio do gesto.
- **Privacidade:** só posições, estados e nomes de classe; nada de música, conta ou token.

## 3. Vídeo quadro a quadro

- **Grave a tela a 60 fps** (30 esconde piscadas de 1 quadro) e salve na pasta Vídeos.
- **Servidor:** `serve.ps1 <arquivo.mp4>` sobe um `HttpListener` em `http://localhost:8769/` (fecha sozinho em 30 min): serve os `.html` da pasta, o vídeo como `hover.mp4` com `Range` (pro `<video>` poder pular) e aceita `POST q*.jpg`, gravando em `quadros/`.
- **`ver.html`** no navegador embutido: `scan(passo, de, até)` pula o `<video>` com `currentTime` + `onseeked`, desenha num canvas de 192 px de largura e soma a diferença de pixels pro quadro anterior (0 = quadro repetido = janela parada). `sheet(tempos, recorte)` monta a folha de quadros com o tempo embaixo.
- **Rastrear a janela:** fundo = **mediana por pixel** de vários quadros espalhados (o app some da mediana porque anda). Em cada quadro, a máscara `|quadro − fundo| > limiar` dá a **caixa (bbox) e o centroide** do app.
  - **Piscada:** a área da máscara cai a ~0 por 1–2 quadros.
  - **Pulo ou tremida:** o centroide anda mais de N px entre quadros com o cursor parado.
  - **Vai e volta:** o sinal do deslocamento troca com o mouse indo reto.
- O código da mediana e da bbox rodou no console na sessão de 25/11/2026 e **não foi salvo**: ao refazer, salve-o no `ver.html`.
- **Teste visual de redimensionar** (sem vídeo longo): um traço parado na tela enquanto a janela cresce pela esquerda. Se ele piscar, é o quadro velho ancorado no canto.

## Outras ferramentas

- **Simulador** (`<app>-sim.html`): imita o host como medido ([motor-piloto](../motor/motor-piloto.md#simulador)). Bom pra lógica, não pra provar "1 quadro".
- **`grabtest.html`**: mede o erro do ponto de pega no simulador ([ponto de pega](../../padroes/motion/ponto-de-pega.md#como-medir)).
- A sonda, o `serve.ps1`, o `ver.html` e o `grabtest.html` ficam na pasta de trabalho, fora do repo (ainda não estão em [modelos/](../../modelos/README.md)).
