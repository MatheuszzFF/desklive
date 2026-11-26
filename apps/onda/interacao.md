# Onda — interação, hover e toque

> **O que é:** o gesto próprio de cada forma, o hover e o feedback de toque da Onda, com os tempos e tamanhos reais. **Quando ler:** antes de mexer em hover, clique, girar, deslizar ou "clique passa" na Onda. Índice: [Onda](README.md). A regra geral (todos os apps) está em [hover e balões](../../padroes/hover-e-baloes.md).

## Gesto de cada forma
- **Quarto de disco, vinil:** a capa fica redonda (raio = metade), com um furinho de 14 % no meio, e **gira em 9 s por volta** enquanto toca. Arrastar a capa **gira o disco** (o gesto aqui é girar, não mover a janela): o ângulo do mouse em volta do centro vira tempo, **1 volta = 30 s** (horário avança, anti-horário volta). Só conta depois de 0,12 rad, pra não confundir com clique. **Girar × mover:** no vinil o cursor é uma seta circular; a mão só aparece no corpo (recortado num círculo do raio R, o resto do retângulo deixa o clique passar). Clique sem girar toca ou pausa.
- **Coluna, agulha:** passar o mouse mostra uma agulha branca de 2 px atravessando as barras, com brilho de 10 px na cor da capa e o tempo escrito ao lado. Deslizar ajusta o progresso.
- **Prateleira, equalizador que sobe com o toque:** as barras sobem como uma onda embaixo do mouse, com acréscimo gaussiano `profundidade × 0,75 × e^(−((u − u_mouse)/0,07)²)`. Clicar ou arrastar pula na música.
- **Faixa, horizonte:** a rodinha anda ±5 s (com um aviso no lugar do artista e o comando real só depois de 280 ms parado). Com o mouse na onda, o horizonte se agita: a amplitude ganha +0,35.
- **Mínimo, cada borda do seu jeito** (o mouse em cima troca o arranjo pela versão "-h"):
  - **coluna:** em repouso, só a tira de barras respirando com o som, colada na borda; a capa mora **atrás da borda** (fora da tela, sem opacidade). Com o mouse, ela desliza de trás da borda pra dentro e a tira desce 76 px. Deslizar na tira ajusta o progresso.
  - **topo:** pílula com a capa-bolinha e o horizonte; com o mouse, o nome e o artista descem de dentro dela. A rodinha anda ±5 s.
  - **base:** a capa-bolha boia em cima do fio de equalizador, subindo `nível × 7 px` no ritmo; o fio sobe embaixo do mouse e clicar nele pula na música. Com o mouse, o nome aparece ao lado da bolha.
  - **canto:** quarto de vinil com o centro no canto da tela; girar anda na música (1 volta = 30 s).
  - **Peça atrás da borda:** a capa escondida da coluna e o vinil do canto contam pro tamanho da janela **só até a beira da tela**.
- **Capa (qualquer forma):** clique **toca ou pausa**; nunca troca de degrau. No compacto, o play/pausa aparece sobre a capa (30 px, vidro com `blur(8px)`).

## Hover e "clique passa"
- Hover entra depois de **80 ms** e sai **420 ms** depois de sair. O "clique passa" desliga na hora e só liga depois de **160 ms** fora do que se vê. Enquanto gira o vinil, puxa a alça ou arrasta, nada disso muda.
- **Medido (v17/v18):** mouse parado na tira mínima enquanto ela cresce embaixo dele: exatamente 2 trocas (entrar e sair), sem piscar.
- **Desde a v20 (piloto, receitas do [ambiente](../../referencias/ambiente/hover-e-clique-passa.md)):**
  - **H1, aproximação:** o "clique passa" desliga numa faixa de `clamp(12, v × 0,05 s, 32)` px em volta das peças (v = velocidade do mouse), antes de o mouse tocar nelas; o corpo do canto conta como círculo, não pelo retângulo.
  - **H2, cursor real:** quando o arranjo ou o degrau muda e quando o motor para, o estado é refeito 60 ms depois por `getCursorScreenPoint` menos a posição real da janela (o mouse pode estar parado e o `forward` não manda nada); enquanto "dentro", um vigia faz isso a cada **220 ms** (~4,5 Hz).
  - **H3, um controlador só:** o "clique passa" guarda o estado desejado e manda no máximo **1 pedido em voo**; nunca liga com o botão pressionado e reavalia quando o gesto termina.
  - **H4:** os estilos das peças só são escritos quando o valor muda (cada escrita é uma mutação que o host observa); posições com 1 casa decimal, opacidade com 2.
- Nada é selecionável (`user-select: none` no app inteiro) e o texto fica por cima da capa (camada 4 sobre a capa, que é 3).

## Efeitos de hover e toque (v18)
Pequenos, com mola, sem exagero; nada foge do ponteiro (só a escala muda, a caixa de clique fica parada).
| Onde | Hover | Pressionar |
|---|---|---|
| Capa (não vinil) | cresce **3,5 %** (`scale`, mola `--spring` em .4 s) | encolhe pra **96,5 %** em .12 s |
| Vinil | cresce **5 %** | — (o gesto é girar) |
| Botões (`.c`) | fundo branco 12 % + cresce **7 %** (mola em .3 s) | **90 %** em .08 s |
| Barras (coluna e prateleira) | brilho × 1,18 e saturação × 1,1 (.25 s) | — |
| Bolinha da onda | cresce **1,4 ×** numa mola curta (taxa 14/s) | — |
| Corpo fundido à borda | o contorno passa de 7,5 % pra **14,5 %** de branco (mola, taxa 9/s), também enquanto arrasta | — |
| Aro do quarto de disco | faixa 4,5 % → **8,5 %**, pontinhos 20 % → **40 %** | — |
