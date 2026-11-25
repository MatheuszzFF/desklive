# Entradas em sequência (stagger)

> L1 · motion. Índice: [motion](README.md).

Nada aparece tudo de uma vez. Primeiro vem a forma, depois o campo, depois a conversa e, por fim, os detalhes.

- **Órbita, troca de lado (FLIP):** os itens partem um depois do outro, com atraso `min(160 ms, i × 14 ms)`. Um item novo entra crescendo de `scale(.6)` com 60 ms de atraso.
- **Órbita, leque do canto:** ao abrir, cada app atrasa `i × 24 ms`. Ao fechar, a ordem inverte: `(n−1−i) × 14 ms`, e o último que saiu é o primeiro a voltar.
- **Onda, abrindo um degrau:** ordem `cover → arc → meta → bars → mctrls → ctrls → wave → list → vt → vwave → prog`, com uma peça a cada 55 ms, dentro de uma janela de 600 ms. Enquanto não chega a vez dela, a peça fica com opacidade-alvo 0.
- **Onda, lista da fila:** cada linha entra com `--i × 35 ms`.
- **Eco, painel preso a uma borda:** campo com .2 s (opacidade) e .1 s (escala); conversa com .28 s e .12 s; coluna lateral com .34 s e .2 s; itens do histórico com `.38 s + i × .045 s`; ombros com .07 s depois da forma; sugestões do canto com `i × .05 s`; cartões da barra de baixo com 0, .05 e .1 s. Os chips de sugestão na pílula solta entram com 0, .06 e .12 s.
