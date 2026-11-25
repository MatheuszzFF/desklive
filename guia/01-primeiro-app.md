# Passo 1: o primeiro app (a janela mínima)

> **O que é:** a janela base de todo app do projeto: transparente, sem moldura, sempre no topo, do tamanho do que se vê e deixando o clique passar fora disso. **Quando ler:** antes de desenhar qualquer coisa. A lista de chamadas do host e dos helpers está em [arquitetura](../padroes/arquitetura.md). Índice: [guia](README.md).

## A ideia

O app não é uma janela com conteúdo dentro: **a janela é o app**. Ela some (transparente, sem moldura), fica sempre por cima e tem exatamente o tamanho do que você vê, mais a folga do brilho. Assim:
- o app encosta em qualquer borda e canto. O host prende a janela dentro da tela, então uma sobra transparente o deixaria longe da beirada (R9);
- fora do desenho, o clique vai pra área de trabalho (**"clique passa"**).

## Os parâmetros

| O quê | Como | Onde ler |
|---|---|---|
| Sem moldura, transparente, sempre no topo | opções da janela do host (`setOptions`) | [arquitetura](../padroes/arquitetura.md) |
| Posição e tamanho | `setBounds` / `getBounds`; quem envia é o **motor**, no máximo uma vez por quadro ([passo 2](02-mover-e-encaixar.md)) | [janela sem tremer](../padroes/motion/janela-sem-tremer.md) |
| Clique passa fora do visível | `setIgnoreMouseEvents(true, {forward:true})`, ligado com atraso | [hover e balões](../padroes/hover-e-baloes.md) |
| Telas e monitores | `screen.getAllDisplays()`, relidas de tempos em tempos | [motor de movimento](../referencias/motor/motor-de-movimento.md) |
| Fundo transparente de verdade | `color-scheme: light` no modo app (outro esquema faz o Chromium pintar um fundo opaco) | [brilho dentro da janela](../padroes/motion/brilho-dentro-da-janela.md) |
| Teclado | a janela só recebe o teclado depois do atalho global do app ou de um menu | [arquitetura](../padroes/arquitetura.md) |
| Rede | a página não faz `fetch` pra fora: bibliotecas por CDN, chamadas externas por helper | [arquitetura](../padroes/arquitetura.md) |

Em pseudocódigo (os nomes reais das chamadas estão na [arquitetura](../padroes/arquitetura.md)):

```
ao abrir:   janela.opções(sem moldura, transparente, sempre no topo)
            janela.lugar = o último salvo (posição, tamanho, degrau, monitor)
mudou o que se vê:
            janela.tamanho = caixa do conteúdo + folga do brilho (só do lado de dentro)
mouse fora do desenho por um instante:  clique passa = ligado
```

## Do tamanho do conteúdo, de verdade

- **Meça o que se vê**, nunca uma caixa fixa. A folga do brilho e da sombra fica do lado de dentro da tela; do lado da borda encostada, só uma folga pequena (`G`). Os valores de cada app estão na regra 1 de [janela sem tremer](../padroes/motion/janela-sem-tremer.md).
- **Brilho e sombra cabem na folga** e chegam a zero antes da beirada, senão o Windows corta em linha reta (R4, [brilho dentro da janela](../padroes/motion/brilho-dentro-da-janela.md)).
- **Mudou de tamanho? Cresça antes e encolha depois**, e aplique o CSS só quando a janela já tiver o tamanho novo (**commit atômico**). No passo 2 o motor faz isso por você.
- **Nasça invisível** e entre com fade quando o primeiro tamanho estiver certo, sem animar a chegada (como a Onda: [visual da Onda](../apps/onda/visual.md)).
- **Lembre** posição, tamanho, degrau e monitor entre aberturas ([layout](../padroes/layout-posicao-e-tamanho.md)). Se a tela mudou (monitor desligado, resolução nova), reposicione dentro dela.
- **Se precisar de um helper** (foco de janela, mídia, uma API externa), ele é um processo PowerShell longo que conversa com a página por linhas de texto ([arquitetura](../padroes/arquitetura.md)). Sem binário sem assinatura.

## Pronto quando

- [ ] Posto pelo simulador ([passo 6](06-testar-sem-mexer-no-pc.md)) em cada uma das 4 bordas e dos 4 cantos, o app fica rente, sem sobra transparente entre ele e a beirada.
- [ ] Fora do desenho, o clique chega na área de trabalho; dentro, chega no app.
- [ ] Nenhum brilho ou sombra cortado em linha reta, e nenhum fundo opaco atrás do app.
- [ ] Fechar e abrir de novo volta pro mesmo lugar, tamanho e monitor.

Próximo: [mover e encaixar](02-mover-e-encaixar.md).
