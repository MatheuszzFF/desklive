# Hover e "clique passa" no Windows

> L3 · referência. Índice: [ambiente](README.md). **O que é:** como `setIgnoreMouseEvents` e o `forward` funcionam no Windows (Electron 45), onde o hover quebra e a receita que não quebra. **Quando ler:** antes de mexer em hover, balão, botão ou no liga/desliga do "clique passa". As regras de uso estão em [hover e balões](../../padroes/hover-e-baloes.md).

## Como funciona (Electron 45, Windows)

- **`setIgnoreMouseEvents(true)`** põe `WS_EX_TRANSPARENT | WS_EX_LAYERED` na janela. O Windows passa a entregar movimento e clique pra janela de baixo. `false` tira os dois. **(Electron)**
- **`forward: true`** instala **um gancho global de mouse** (`WH_MOUSE_LL`) no processo principal do Claude **(Electron)**:
  - a cada movimento físico, se o ponto cai dentro do **retângulo** da janela, o gancho guarda o ponto e agenda **uma** tarefa no processo principal;
  - essa tarefa injeta um `WM_MOUSEMOVE` sintético. Quando o ponto sai do retângulo, injeta **um** `WM_MOUSELEAVE`;
  - uma rajada de movimentos vira um evento só por tarefa.
- O que isso implica:
  - **Só movimento.** Clique, roda e botão nunca são repassados.
  - **"Dentro" é só geometria do retângulo.** Não sabe se outra janela cobre a nossa: onde os apps se sobrepõem, todos recebem o movimento.
  - **Mouse parado = nenhum evento**, mesmo que a forma ou a janela mude embaixo dele.
  - **O gancho é um só pro processo inteiro** (os três apps e o Claude) e fica instalado enquanto alguma janela estiver com `forward`.
- **O Electron 45 já tem a reescrita do encaminhamento** (PR #52633, desde a 45.0.0-beta.2): o `mouseleave` sintético funciona e o `:hover` não fica mais preso ao sair. Até o 44.7 ele podia ficar (issue #51521). **(Electron)**
- **Risco de gancho removido.** Se o gancho passar do `LowLevelHooksTimeout` (no máximo 1000 ms desde o Windows 10 1709), o Windows o **remove em silêncio** **(doc)**. O Electron 45 só posta uma tarefa de dentro do gancho, então o risco é baixo. Mesmo assim, um travamento longo do Claude pode desligar o hover em modo forward até nenhum app estar mais com `forward` **(inferido)**.
- **Medido** ([medições](medicoes.md#hover-e-clique-passa)): ~60 Hz com o mouse andando (p50 17 ms), 0 eventos com botão, 1 `mouseleave` em 8 s; ligar o clique-passa 1,4 ms, desligar 6 ms.

## A corrida do clique (host, Electron)

Do mouse chegar na forma até a janela aceitar o clique, a cadeia é:
1. o movimento vira uma tarefa no processo principal;
2. o evento chega na página e roda o nosso `pointermove`;
3. a página manda `setIgnoreMouseEvents(false)` (IPC);
4. o processo principal tira o estilo da janela.

Um clique rápido nesse intervalo **atravessa** pro app de baixo. **Medido:** 20/20 cliques recebidos (halo 0 e 16 px), o mais rápido 89 ms depois de entrar, desligar ~3 ms. Na prática não acontece no PC de teste (com o Claude ocupado pode acontecer); o halo continua por segurança. O próprio Claude descreve essa corrida no código da janela de "ensinar" do computer use ("Click-through race"); lá eles rearmam o botão por tempo.

## Clique e captura do ponteiro (doc)

- Desde o Chrome 136 (spec Pointer Events): se o ponteiro ainda está capturado no `pointerup`, o `click` vai pro **elemento que capturou**, não pro botão embaixo.
- É a causa confirmada do botão que não respondia ([bugs evitados](../motor/bugs-evitados.md)). Regra: capturar só quando o gesto vira arrasto (o gesto do motor nasce com `capture:false`; a Onda captura no `onStart`, depois de 5 px, com `setPointerCapture(g.id)`; se a captura se perde, o gesto recaptura pela raiz).
- Quem captura no pressionar de propósito (deslizar o progresso, girar o vinil, puxar a alça) **precisa** tratar `lostpointercapture` como fim: senão o estado do deslizar fica preso e trava o hover e o clique-passa (bug 29 em [bugs e lições](../motor/bugs-e-licoes.md); a Onda v21 aplica o `seek` onde estava).
- Toque (tap) não segue essa regra.

## Diálogos do host (host)

- Enquanto um diálogo do host está na tela, **todas** as janelas de app ficam sem "clique passa": as áreas transparentes bloqueiam o clique no que estiver embaixo.
- Elas também deixam de ser "sempre no topo".
- Quando o diálogo fecha, o host reaplica o último pedido de cada app, então o app **não precisa reenviar** nada.

## Receita robusta

Ordem de prioridade em [receitas recomendadas](receitas-recomendadas.md#hover).

1. **Dentro ou fora pela geometria** da forma, com folga (pequena pra entrar, maior pra sair), nunca pelo elemento embaixo do mouse. Já é regra. (Onda: dentro = `elementFromPoint` numa peça visível ou no aviso, **ou** dentro dos retângulos das peças com a margem; o corpo do canto é um círculo, via `clip-path`, e o retângulo em volta não conta.)
2. **Halo de aproximação.** Desligue o "clique passa" quando o mouse entra numa faixa em volta da forma, não quando ele toca a forma.
   - Largura da faixa: `clamp(12, v × 0,05 s, 32)` px, onde `v` é a velocidade do mouse em px/s.
   - Assim o IPC termina antes do clique.
   - Na faixa, a janela pega o clique: um clique ali não faz nada no app e também não chega na área de trabalho. A faixa é estreita de propósito.
3. **Ligar o "clique passa" com atraso** (140–160 ms fora) e **nunca com o botão pressionado**, de qualquer botão em qualquer lugar do app (arrasto, progresso, vinil, alça) até o `pointerup`/`pointercancel`; depois, ressincronizar. Já é regra. (Onda: entrar desliga na hora e acende o hover em 80 ms; sair liga só depois de 160 ms fora e apaga o hover em 420 ms.)
4. **Um estado desejado, um pedido em voo.**
   - Guarde o estado que você quer (`ignorar` sim ou não).
   - Se ele mudar enquanto um pedido está em voo, mande só o último, quando o anterior voltar.
   - Nada de ida e volta no mesmo quadro.
   ```
   CP = { quer, está, ocupado }
   bomba(): se ocupado, ou quer = está, ou (quer = ligar e algum botão pressionado) → sai
            ocupado = sim; setIgnoreMouseEvents(quer, {forward:true})
            ao voltar (mesmo com erro): está = quer; ocupado = não; bomba()
   ```
5. **Ressincronizar com o cursor real** depois de toda troca de forma, de degrau ou de lugar da janela (o mouse pode estar parado):
   - leia `screen.getCursorScreenPoint()` (1 IPC);
   - tire a posição **real** da janela pra ter a coordenada na página (a última pedida serve: o host aplica antes de responder);
   - aplique o teste de geometria (com a margem de 12 px).
   - Enquanto o estado for "dentro", rode também um vigia lento (4–5 por segundo; Onda: 220 ms) pra pegar o caso em que nada chega. Também 60 ms depois de o motor parar.
   - Não rode durante arrasto, alça, giro, botão pressionado ou deslizando o progresso.
6. **`:hover` do CSS só em elemento parado.** Numa forma que muda embaixo do mouse, use uma classe controlada pelo estado acima.
7. **`pointerleave`/`mouseleave` do documento** é um sinal confiável de "saiu da janela" no Electron 45.

## Fontes

- Electron: [native_window_views_win.cc (45-x-y)](https://github.com/electron/electron/blob/45-x-y/shell/browser/native_window_views_win.cc), [PR #52633](https://github.com/electron/electron/pull/52633), [releases da #52633](https://releases.electronjs.org/pr/52633), [issue #51521](https://github.com/electron/electron/issues/51521).
- Microsoft: [LowLevelMouseProc](https://learn.microsoft.com/en-us/windows/win32/winmsg/lowlevelmouseproc).
- Spec e Chrome: [Pointer Events](https://w3c.github.io/pointerevents/), [Chrome 136](https://developer.chrome.com/release-notes/136).
