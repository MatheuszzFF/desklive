# Eco — formas e degraus

> **O que é:** como o Eco é montado por dentro, a forma de cada lado em cada estado e degrau (com os tamanhos reais), o teto de tamanho e a alça. **Quando ler:** antes de mexer no tamanho, numa forma por lado ou num degrau do Eco. Índice: [Eco](README.md). O padrão de todos os apps está em [layout por posição e tamanho](../../padroes/layout-posicao-e-tamanho.md) e [fusão com a borda](../../padroes/motion/fusao-com-a-borda.md).

## Estrutura
- Classes no `<html>`: `m-float` (solta) ou `m-dock` (fundida); `d-vert` (lateral) e `d-corner` (canto); `k-top`, `k-side`, `k-bottom` e `k-corner` (a forma do lado); `i-hover` (prévia) e `i-open` (painel); `h-r` (marca à direita); `v-t` (a conversa desce); `z-g` (degrau grande).
- Tudo mora em `.rig`, que o JS desloca (`--ox/--oy`) quando a janela troca de tamanho e devolve a zero numa mola (k 260 / ζ 0,86). **A marca nunca pula.**
- Janela fechada: **112 × 112** (só a marca e o brilho dela). Pílula solta: **548** de largura no médio e **720** no grande.
- Presa a uma borda, o JS calcula em coordenadas de tela a geometria de cada lado e estado (forma, raios, ombros, campo, conversa, coluna, alça, sugestões) e escreve em variáveis CSS que animam todas na mesma mola `--sp` ([troca de forma](../../padroes/motion/troca-de-forma.md)). Crescendo, a janela cresce antes; encolhendo, o CSS anima antes e a janela encolhe depois.
- A altura acompanha o conteúdo (`ResizeObserver` na pilha de mensagens e na lista do histórico).

## Forma e tamanho por lado e estado (`dockDims`)
| Lado | Repouso (mínimo) | Prévia (mouse em cima) | Aberto (médio / grande) |
|---|---|---|---|
| **Topo: ilha** | cápsula 92 × 38, raio 19 | 360 × 50, raio 25 | 480 × (conversa) / 760 × (maior entre conversa e histórico, 340–548), raio 28 / 32 |
| **Laterais: espinha** | recorte em pé 32 × 124, raio 16 | 54 × 340 (a parte visível tem no mínimo 230 px e se desenrola atrás do mouse), raio 27 | folha de 392 / 520 × (conversa; no grande, também as abas), piso 300 / 360, raio 30 |
| **Embaixo: barra de comando** | traço 128 × 34, raio 17 | campo largo 540 × 52 | barra 640 / 880 × 58, com a conversa subindo **em cartões soltos** acima; no grande, o cartão do histórico tem a altura da lista (até 380) |
| **Cantos: quarto de órbita** | quarto de círculo 54 × 54 | 84 × 84 + o arco de sugestões | cartão no canto 400 × (conversa) / 640 × (maior entre conversa e histórico, 320–520) |
| **Solta** | marca 64 px na janela de 112 | (a marca cresce 6 %) | pílula 548 × (conversa) / painel 720 × (maior entre conversa e histórico) |

A marca muda de escala com o estado: 0,55 a 0,6 em repouso, 0,62 a 0,7 na prévia, 0,72 a 0,8 aberto e 0,86 na pílula solta aberta.

## Teto de tamanho (sem sobra de área vazia)
- **Nenhum degrau tem caixa fixa maior que o conteúdo.** A conversa e o histórico são medidos **na largura de destino** daquele lado e degrau (a janela fechada tem 112 px e quebraria o texto), e a lista só é redesenhada quando muda.
- **Teto:** a janela inteira, com a margem da sombra, fica em no máximo **70 % da altura útil**; as larguras do grande ficam em no máximo **60 % da largura útil**. A 1920 × 1080, o maior caso é a folha lateral, com **742 px de altura (69 %)**.
- Passou do teto, **a conversa rola dentro** da forma. O limite da rolagem é o teto menos o campo e as margens (na folha: teto − 2 × 36 − 96 px) e inclui o espaçamento interno da rolagem (`box-sizing: border-box`), senão as mensagens passam por baixo do campo.

## Degraus e alça
- Três degraus: **só a marca** (fechado), **médio** (pílula com a conversa) e **grande** (conversa maior com o histórico de conversas).
- A alça é um canto curvo de 15 px (solta, embaixo e nos cantos) ou uma barrinha de 32 × 4 px no lado de dentro (topo e laterais), e cresce pra 46 px com hover.
- A distância é medida "pra fora". Do médio: passa pro grande acima de 80 px (volta abaixo de 62) e **fecha** abaixo de −96 px (−76 pra desistir). Do grande: vai pro médio abaixo de −80 (−62) e fecha abaixo de −270 (−250).
- **Elástico:** `r = clamp((d − centro_do_degrau)/140, ±1,4)` e escala `1 + r/(1 + |r|·0,6) × 1,5 %`. Passando do ponto de fechar, o painel apaga pra 45 % antes de soltar.
- O degrau só muda pela alça (ou pelo menu); hover nunca troca de tamanho.
