# Eco — visual

> **O que é:** materiais, cores, fontes e tratamento de texto do Eco. **Quando ler:** pra mexer na aparência (não no movimento). Visão geral: [README.md](README.md); a marca: [marca-webgl.md](marca-webgl.md).

- **Pílula solta (vidro):** `linear-gradient(rgba(255,255,255,.07), rgba(255,255,255,.02))` sobre `rgba(11,13,19,.62)`, borda de 1 px a 11 %, sombra `0 18px 44px -16px rgba(0,0,0,.7)` + brilho interno no topo a 8 %, raio 28. Ela **abre a partir da marca** com `clip-path: inset(0 calc(100% − 52px) 0 0 round 28px)` → `inset(0)`. Com foco, a borda fica laranja a 38 %.
- **Forma presa:** `rgba(8,9,13,.88)`. **Painel grande solto:** `rgba(9,10,15,.87)` com reflexo de 5 % no topo e raio 30.
- **Pensando:** um brilho laranja → pêssego → lilás percorre a borda da pílula ou da ilha (`conic-gradient` girando em 1,8 s, recortado com máscara `xor` num anel de 1,3 px), com uma cópia desfocada a 7 px por baixo. O texto da resposta faz shimmer.
- **Conversa:** a resposta é texto solto com sombra forte (`0 1px 2px rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.55)`), sem balão. Só a fala do usuário tem balão (`rgba(38,40,52,.82)`, raio 17/17/5/17, a ponta do lado da marca). A rolagem some nas pontas com uma máscara de 56 px. Na barra de baixo, cada mensagem vira um **cartão** (`rgba(9,10,15,.88)`, raio 18).
- **Penumbra de leitura** (solta): `radial-gradient(closest-side, rgba(4,5,9,.58), rgba(4,5,9,.38) 55%, transparente)`, que chega a zero antes das bordas da janela.
- Cor de marca: Claude `#d97757` e `#f0a98a`; fontes Space Grotesk e Inter. Ícones das sugestões com traço de 1,9 px em `#f0a98a`.
- O atalho global (`Alt + Shift + Espaço`) está no [README.md](README.md).
