# Movimento reduzido

> L1 · motion. Índice: [motion](README.md).

`prefers-reduced-motion: reduce` é respeitado nos três apps:
- **Motor:** `glide` vira `set` (vai direto), o arrasto segue o mouse sem mola e não há levantar, amassado nem inclinação.
- **CSS:** transições com `0s` e `animation: none` no conteúdo de cada app.
- **Onda:** as molas das peças pulam direto pro alvo, a fase da onda congela, a capa não pulsa e a fusão com a borda é imediata.
- **Eco:** o deslocamento do `.rig` é zerado na hora, e a marca WebGL continua viva, mas a 15 % da velocidade.
