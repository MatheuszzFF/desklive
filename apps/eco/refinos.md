# Eco — registro de refinos

> **O que é:** o histórico de cada refino do app Eco, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Repouso vivo e único em cada lado (v19)
- **Pedido:** "os tamanhos mínimos dos apps precisam ser trabalhados bem feito também, e também tem que ser único e interativo".
- **Onde:** o repouso (fechado) de cada forma: ilha, espinha, barra, quarto de órbita e a pílula solta.
- **Antes → depois:** o repouso era a forma parada (só a marca viva). Agora cada lado sente o mouse na folga de 36 px da janela (`--near` 0 a 1) e tem vida própria parado. Ilha: respira (1 → 1,05 em 5,6 s) e incha até 18 % pra baixo. Espinha: feixe de luz de 48 px a cada 4,6 s, a marca desliza até a altura do mouse e a espinha estufa até 30 %. Barra: cursor de 2 × 13 px piscando a 1,1 s no fim do traço, barra estica até 14 % no ponto do mouse. Quarto: anel de 70 px com satélite de 6 px varrendo ±40° (6 s), que vai até o ângulo do mouse em .35 s; anel +8 %, quarto +15 %. Solta: a marca olha pro mouse até 6 px. Novo em todos: ponto quente de 7 px pulsando (1,8 s) quando chega resposta com o Eco fechado.
- **Por quê:** o mínimo não pode ser a versão encolhida e pobre (R20): ele também é único e interativo, no nível da ilha.
- **Docs atualizados:** [README.md](README.md) (seção "Repouso" e "Testado").
- **Testado:** prints no simulador de todos os lados e cantos em repouso, e do mouse chegando no topo, na lateral, embaixo, no canto e na solta; sem erros. **Não testado:** app instalado, mouse real, resposta real do Claude acendendo o ponto. O motor de arrasto não foi tocado.
- **Regras:** R20, R19, R9, R22.

## 2026-11-25 — Motor de movimento único (v18)
- **Pedido:** refino state of the art do movimento: arrastar e soltar fluido e sem bugs, igual nos três apps.
- **Onde:** arrasto, soltar, fundir e descolar de bordas e cantos, a janela crescendo e encolhendo com a forma presa.
- **Antes → depois:** o motor próprio (arrasto k 1100 / ζ 0,9) virou o motor único (arrasto k 1500 / ζ 1 com *feed-forward*; assentar continua k 230 / ζ 0,8; o voo até a borda usa encaixe firme k 240 / ζ 1). Trocar a janela (pegar a forma presa, crescer e encolher na ilha) agora escreve o CSS só quando a janela chega, e a "foto" dos valores animados é tirada nesse quadro. A emenda entre os dois monitores não gruda mais. A prévia (forma-fantasma) usa o destino projetado. Ao pegar, a marca sobe pra 1,04 (antes ficava em 0,93, o tamanho de pressionada) e ganha sombra (até 3 px de deslocamento, 5 px de desfoque). O micro-amassado ao bater chega a 12%. O arrasto termina também por perda de foco, botão já solto e tempo-limite. Limiar de arrasto: continua 4 px.
- **Por quê:** pulo ao pegar a forma presa, arrasto que não terminava (sem `lostpointercapture`, sem fim garantido) e a marca grudando na emenda dos monitores.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md), [janela sem tremer](../../padroes/motion/janela-sem-tremer.md).
- **Testado:** 15 testes de estresse no simulador de dois monitores, todos passando; prints da prévia do canto e da marca fundida no canto. **Não testado:** fps reais no app instalado, DPI misto.
- **Regras:** R7, R9, R19, R20.

## 2026-11-25 — Doc reorganizado (sem mudança no app)
- **O que mudou:** o doc foi movido de `apps/eco.md` pra esta pasta e dividido em arquivos menores. Nenhum comportamento, número ou visual do app mudou.
- **Antes do registro:** os refinos anteriores (até a v12 do Eco, as formas por lado da Órbita e da Onda) estão consolidados no README e não têm entrada própria.
