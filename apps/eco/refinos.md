# Eco — registro de refinos

> **O que é:** o histórico de cada refino do app Eco, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

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
