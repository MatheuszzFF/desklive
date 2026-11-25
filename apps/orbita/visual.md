# Órbita — anéis, medidores e visual

> **O que é:** como os anéis e medidores são desenhados e o visual da Órbita. **Quando ler:** pra mexer na aparência ou nos indicadores de CPU/RAM/placa. Visão geral: [README.md](README.md).

## Anéis e medidores
- Anel pequeno: `r = 9` num `viewBox` 22, perímetro 56,5 (`stroke-dasharray`), traço 2,6 com ponta redonda, girado −90°. Valor mínimo desenhado: 2 %.
- Cores: CPU/RAM em `--accent` (#a9b8ff) abaixo de 60 %, `--warm` (#f2c14e) de 60 a 85 % e `--hot` (#ff7d6e) acima. Na placa de vídeo, o anel enche até 100 °C, é âmbar de 70 a 80 °C e vermelho acima.
- O mesmo valor alimenta todas as formas: anel, pílula (linha embaixo), medidor vertical e anel concêntrico (o comprimento é calculado do raio real).
- Mini gráfico: histórico de 36 amostras (≈ 1,5 min com a leitura a cada 2,5 s), uma `polyline` de 1,4 px com `drop-shadow` de 3 px na cor do estado. Ele começa na direita e cresce pra esquerda.

## Visual
- Tokens: `--fg #f4f5f8`, `--muted` 62 %, `--faint` 38 %, `--line rgba(255,255,255,.09)`, `--glass rgba(14,16,24,.86)` (só nos balões e no aviso).
- Fontes: **Space Grotesk** (relógio, números) e **Inter** (texto), com Segoe UI Variable de reserva. Números com `tabular-nums`.
- **Sem caixas:** os apps não têm fundo, só um halo radial da cor do app (38 × 30 px, `blur(9px)`, opacidade .72 rodando e .95 com hover). O texto solto sobre o papel de parede usa sombra dupla (`0 1px 2px rgba(0,0,0,.7), 0 0 14px rgba(0,0,0,.35)`).
- Os balões abrem sempre **pra dentro da tela** e mudam de lado conforme a forma.
- Os ícones da Órbita (do app e da bandeja) são desenhados em canvas: uma órbita elíptica inclinada −28° em volta de um núcleo, com um satélite laranja.
- Leitura do PC a cada 2,5 s; relógio a cada 15 s.
