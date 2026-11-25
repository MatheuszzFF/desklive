# Onda — visual

> **O que é:** halo, capa, texto, botões e ritmo de leitura da Onda. **Quando ler:** pra mexer na aparência (não no movimento). Visão geral: [README.md](README.md); fórmulas: [onda-e-cor.md](onda-e-cor.md).

- **Halo** atrás da capa: dois `radial-gradient` com as cores da capa, 80 % do tamanho dela e caído 15 % pra baixo, `blur(14px) saturate(1.4)` com opacidade .55 (`blur(18px)` e .6 nos degraus grandes).
- **Capa:** raio de 16 px no compacto (22 a 26 nos grandes), sombra `0 14px 28px -10px rgba(0,0,0,.7)` e anel de 1 px a 7 %. A capa nova entra com fade de .6 s e escala 1,06 → 1 em .9 s.
- **Texto solto** com sombra dupla (`0 1px 2px rgba(0,0,0,.7), 0 0 16px rgba(0,0,0,.4)`). Título em Space Grotesk 600, 15 px (20 px no expandido, 25 px no grande); artista em Inter 12,5 px (14 e 15). Trocar de música faz o texto subir 7 px com blur.
- **Nome em pé** (coluna): `writing-mode: vertical-rl`, lendo de baixo pra cima na esquerda e de cima pra baixo na direita, sempre começando perto da capa.
- Botão principal branco de 44 px com sombra `0 6px 18px rgba(0,0,0,.45)`; os outros são transparentes e ganham fundo de 12 % com hover. O play vira pausa girando 90°.
- Ícone do app: uma onda em degradê verde → lilás, desenhada em canvas.
- O estado do Spotify é lido a cada 1 s; o barramento, a cada 400 ms. A janela nasce invisível (`booting`) e entra com fade, sem animar a chegada.
