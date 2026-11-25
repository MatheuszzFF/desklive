# Eco — a marca líquida (WebGL)

> **O que é:** a referência L3 do shader da marca do Eco. **Quando ler:** pra mexer no visual ou no comportamento da marca (corpo, gotas, brilho, estados). Visão geral do app: [README.md](README.md).

Uma forma 3D desenhada por **raymarching de um campo de distância (SDF)** num único *fragment shader*, sobre um quadrado que cobre o canvas.
- **Canvas:** 100 × 100 px CSS, transbordando 18 px de cada lado do botão de 64 px (é a margem do brilho). `devicePixelRatio` limitado a 2. WebGL com `alpha` e `premultipliedAlpha`, então o fundo é transparente de verdade.
- **Câmera:** origem em z = 3,2, raio `normalize(uv, −2,7)`, `uv` escalado × 2,45. São **56 passos** com passo de 0,82 × distância, parando com d < 0,0015 ou t > 6,5. A normal é a diferença central com ε = 0,0025.
- **Corpo:** esfera de raio `0,48 + 0,02·sen(1,1t)` (mais `0,07 × nível` ouvindo), deformada por **ruído simplex 3D** em duas oitavas: `snoise(p·1,05 + t·(0,16; 0,12; 0,22)) + 0,22·snoise(p·2,3 − …)`.
  ```
  amplitude = 0,05 + 0,035·hover + 0,2·nível·ouvindo + 0,03·pensando
  ```
- **Três gotas orbitando**, fundidas no corpo com **mínimo suave** (`smin`, k = 0,24), como mercúrio. Raios de 0,105 a 0,069; órbita `0,74 + 0,16·sen(…)` (+0,06 com hover); velocidade angular `0,42 + 0,17·i` (× 3 pensando).
- **Pensando:** um redemoinho torce o espaço no plano xz, mais forte perto do centro (`1,2 − |p.xy|`).
- **Material: vidro escuro iridescente laranja.**
  - Base que mistura `deep (.16,.035,.03)` com `body (.72,.26,.15)` pela luz difusa^1,4.
  - **Núcleo quente** `core (1,.5,.28) × facing³` que acende por dentro (mais forte ouvindo ou pensando).
  - **Borda** de Fresnel (`(1 − n·v)^2,6`) com uma paleta de cosseno iridescente (laranja → rosa → violeta) que gira devagar com o tempo.
  - Reflexo nítido `^90 × 1,6`, reflexo largo `^14 × 0,18` e um **segundo reflexo frio** violeta `^24 × 0,35`, vindo de outra luz.
- **Brilho fora do corpo:** `exp(−7 × distância mínima do raio)`, na cor de laranja a violeta, mais forte com hover, voz ou pensando. Sai como alfa (`max(a, glow × 0,95)`), então o halo é parte da própria marca e não é cortado.
- **Estados** (cada um suavizado por quadro): hover 0,1, pensando 0,06, ouvindo 0,08. O relógio do shader acelera com eles: `1 + 0,9·hover + 1,4·pensando + 1,5·nível`. Com movimento reduzido, roda a 0,15.
- **Sem WebGL:** uma reserva em canvas 2D com núcleo em degradê radial (#fff3ec → #d97757 → #a3482a, brilho de 14 px) e três ondas de eco que saem dele.
- **Nascer:** a marca entra de `scale(.01)` na mola. Em repouso solta, flutua 4 px em 6 s. Pressionada, fica com 93 %.
