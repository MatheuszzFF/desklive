# Navegador — refinos

> Antes da pasta própria ele era o widget Vídeo da Mesa: o histórico daquele tempo (furo, Erro 153, leitura da tela, WhatsApp) está em [apps/mesa/refinos.md](../mesa/refinos.md).

## 2026-11-27 · Dentro do quadro e pasta própria
- **O que:** a janela do Edge passou a ficar logo abaixo do quadro (antes ficava por cima de tudo) e fora da barra de tarefas; o furo é medido pelo Board. O código saiu de `modelos/mesa/widgets/35-video.js` pra `modelos/navegador/navegador.js`.

## 2026-11-27 · Redimensionar e pegar
- **O que:** as peças que vêm dos widgets da Mesa (o navegador) redimensionam pelas 4 bordas e 4 quinas, com o lado oposto parado. O furo deixa uma moldura de pega (18 px em cima, 8 px nos lados e embaixo) com a mãozinha no hover: dá pra arrastar e redimensionar com um site aberto.
- **Testado:** simulador (quinas, borda, arrastar pela moldura, clique no furo indo pro site).
