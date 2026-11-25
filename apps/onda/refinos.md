# Onda — registro de refinos

> **O que é:** o histórico de cada refino do app Onda, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

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
