# Estante — música no Board

> **O que é:** o doc L2 da Estante. Código: [modelos/estante/](../../modelos/estante/README.md).

- **Conteúdo:** a música aberta em camadas (cifra, partitura, tablatura, graus, papel no acorde, saltos, notas, letra), o acorde do momento, a escala da música e o modo estudo (escalas, pentatônica, modos, arpejos, tema livre).
- **Uma função:** estudar e tocar junto: o que cada nota faz, o que tocar em cima de cada acorde e como chegar no próximo.
- **Corpo:** camadas empilhadas; o foco (compacto, tocar, partitura, escala, estudo, musicas) escolhe as camadas e o corpo estica ou encolhe com a mola da moldura até o tamanho do conteúdo. O Dengas escolhe o foco pelo que o dono está fazendo.
- **Balões soltos:** compasso (o que toca e a ideia de frase, com ▶), acorde agora (notas, escala, frases) e nota (no hover). Ficam do lado do corpo com mais tela, seguindo com mola; arrastou, ficam soltos.
- **Música:** repertório + cifras carregadas (do agente ou do botão de busca, que pede ao Claude). Toca pelo sintetizador ou segue a Onda (relógio = posição da música no Spotify; o dono marca o 1º tempo).
- **Agente:** `Mesa.agente('estante', …)`; o Dengas delega pelo `agente`. Comandos: foco, abrir_musica, carregar_cifra, buscar_cifra, tocar_com_onda, relogio_interno, sincronizar, tocar, pausar, ir_compasso, tom, andamento, instrumento, camadas, estudo, estudo_livre, tocar_passo, baloes.

## Testado
- Node: 11 testes da parte sem tela. Simulador isolado: 19 cenários. Simulador do Board: abre, toca, balões ao lado, agente registrado, sem erro.
- **Não testado:** app instalado, Onda de verdade como relógio, buscar_cifra com o Claude de verdade.
