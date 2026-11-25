# Onda — registro de refinos

> **O que é:** o histórico de cada refino do app Onda, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Mínimo único em cada borda e canto (v14)
- **Pedido:** "os tamanhos minimos dos apps precisam ser trabalhados bem feito também, e também tem que ser único e interativo".
- **Onde:** degrau mínimo na coluna (laterais), na faixa (topo), na prateleira (base) e no quarto de disco (cantos). A solta não mudou.
- **Antes → depois:**
  - coluna: capa de 64 + barras de 52 × 80 → tira de barras de 26 × 176 sem capa; a capa mora atrás da borda e desliza pra fora com o mouse (a tira desce pra 26 × 150 embaixo dela);
  - topo: capa de 40 + onda de 150 → pílula com capa-bolinha de 30 + horizonte de 170 × 20; com o mouse, o nome desce (200 × 40);
  - base: equalizador de 200 × 26 + capa de 44 → fio de 240 × 18 + capa-bolha redonda de 40 boiando acima e subindo até 7 px no ritmo; com o mouse, o nome do lado (196 × 40);
  - canto: capa redonda de 60 + anel (R 140, anel 114) → quarto de vinil de 152 com centro no canto da tela, com sulcos e reflexo fixo (R 110, anel 92); girar anda na música.
  - Peças atrás da borda contam pro tamanho da janela só até a beira da tela.
- **Por quê:** o mínimo era uma versão encolhida e igual em todo lado; agora cada lugar tem forma e gesto próprios (R20).
- **Docs atualizados:** [README](README.md) (tabela de arranjos, interação do mínimo, raios do disco, "Testado").
- **Testado:** prints no simulador do mínimo em repouso e com o mouse na direita, no topo e na base, e do quarto de vinil em dois cantos. **Não testado:** no app instalado.
- **Regras:** R9, R19, R20, R22.

## 2026-11-25 — Motor de movimento único (v13)
- **Pedido:** refino state of the art do movimento: arrastar e soltar fluido e sem bugs, igual nos três apps.
- **Onde:** arrasto, soltar, encaixe nas bordas e cantos, a caixa da janela (`LR`) mudando de tamanho.
- **Antes → depois:** o motor próprio (arrasto k 900 / ζ 0,95, assentar k 200 / ζ 0,84) virou o motor único (arrasto k 1500 / ζ 1 com *feed-forward*, assentar k 210 / ζ 0,86; colando numa borda, encaixe firme k 240 / ζ 1 + micro-amassado de até 5%). A caixa `LR` agora tem duas versões: a lógica, que vale na hora pro motor, e a do CSS, que só entra quando a janela chega. O desenho do corpo fundido usa a do CSS. Ao pegar: sombra que levanta (até 5 px de deslocamento, 10 px de desfoque, 38% de opacidade). O arrasto termina também por perda de foco ou botão já solto, e o "clique passa" nunca liga com o botão pressionado. O giro do vinil também termina com a perda de foco. Limiar de arrasto: continua 5 px.
- **Por quê:** arrasto que não terminava, o soltar caindo na janela de baixo, e o conteúdo pulando 1 ou 2 quadros quando a caixa mudava.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md), [janela sem tremer](../../padroes/motion/janela-sem-tremer.md).
- **Testado:** 15 testes de estresse no simulador de dois monitores, todos passando; prints arrastando perto da direita (já em coluna) e encaixada. **Não testado:** fps reais no app instalado, DPI misto.
- **Regras:** R7, R9, R19, R20.

## 2026-11-25 — Doc reorganizado (sem mudança no app)
- **O que mudou:** o doc foi movido de `apps/onda.md` pra esta pasta e dividido em arquivos menores. Nenhum comportamento, número ou visual do app mudou.
- **Antes do registro:** os refinos anteriores (até a v12 do Eco, as formas por lado da Órbita e da Onda) estão consolidados no README e não têm entrada própria.
