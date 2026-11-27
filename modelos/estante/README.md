# Modelo: Estante

> **O que é:** o código da Estante, o widget de música (baixo) do Board. Contexto e histórico: [apps/estante/](../../apps/estante/README.md). Índice: [modelos](../README.md).

| Arquivo | O que é |
|---|---|
| [teoria.js](teoria.js) | notas, graus, armaduras, acordes (m, 7, maj7, m7b5, dim, sus, 6, 9, /baixo), escalas, modos, braço do instrumento. Sem DOM |
| [musica.js](musica.js) | repertório em ABC, leitor de ABC, leitor de cifra (acordes por compasso → linha de baixo de estudo), `contexto(música, tom)`, `daCifra` (valida o que vem do agente). Sem DOM |
| [frases.js](frases.js) | o retrato do compasso (o que toca, em que tempos), a ideia de frase (ritmo + graus + aproximação), o retrato da nota. Sem DOM |
| [estudo.js](estudo.js) | lições: escala, pentatônica (5 desenhos), modos, arpejos e lição livre do agente; passos tocáveis. Sem DOM |
| [partitura.js](partitura.js) | a pauta em camadas (SVG), a faixa da escala e o desenho do braço |
| [som.js](som.js) | sintetizador e relógio (interno ou o da Onda) |
| [baloes.js](baloes.js) | balões soltos na tela (compasso, acorde, nota) com mola; arrastou, fica solto |
| [estante.js](estante.js) | o widget (`Mesa.define`): corpo de camadas por foco, comandos e o agente da Estante |
| [board.js](board.js) | a entrada no Board (depois da ponte `mesa`) |
| [teste/](teste/) | `nucleo.teste.js` (node, a parte sem tela), `estante.html` (simulador isolado: moldura de mentira, console de comandos) e `cenarios.js` (`estante.html?testes`) |

Montar no Board: `modelos/board/build.ps1 -Pecas mesa,dengas,estante,...`. Testar isolada: sirva esta pasta (`python -m http.server`) e abra `teste/estante.html?testes`; a parte sem tela: `node modelos/estante/teste/nucleo.teste.js`.
