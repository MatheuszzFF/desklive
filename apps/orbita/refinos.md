# Órbita — registro de refinos

> **O que é:** o histórico de cada refino do app Órbita, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Motor de movimento único (v22)
- **Pedido:** refino state of the art do movimento: arrastar e soltar fluido e sem bugs, igual nos três apps.
- **Onde:** arrasto, soltar, encaixe, troca de lado e de tamanho, em todos os lados e cantos.
- **Antes → depois:** o motor próprio da Órbita (arrasto k 900 / ζ 0,95) virou o motor único (arrasto k 1500 / ζ 1 com *feed-forward*; encaixe firme k 240 / ζ 1 + micro-amassado contra a borda). As margens da janela agora entram junto com o tamanho, num commit só. Ao pegar, a ilha ganha uma sombra extra que acompanha o "levantar" (até 11 px de desfoque, 30% de opacidade). A prévia do encaixe usa o destino projetado, com o embalo. Ao sair do canto pro topo, se o item segurado some no layout novo, fica embaixo do mouse o mesmo ponto proporcional da barra (antes a barra corria ~700 px atrás do núcleo). Limiar de arrasto: continua 6 px.
- **Por quê:** "soltar" perdido, 2 `setBounds` no mesmo quadro e a barra correndo ao sair do canto.
- **Docs atualizados:** [motor de movimento](../../referencias/motor/motor-de-movimento.md), [bugs evitados](../../referencias/motor/bugs-evitados.md), [motor](../../referencias/motor/README.md), [janela sem tremer](../../padroes/motion/janela-sem-tremer.md).
- **Testado:** 15 testes de estresse no simulador de dois monitores, todos passando; prints da troca baixo → coluna e da coluna colada. **Não testado:** fps reais no app instalado, DPI misto, o visual do descolar do canto quadro a quadro.
- **Regras:** R7, R9, R19, R20.

## 2026-11-25 — Doc reorganizado (sem mudança no app)
- **O que mudou:** o doc foi movido de `apps/orbita.md` pra esta pasta e dividido em arquivos menores. Nenhum comportamento, número ou visual do app mudou.
- **Antes do registro:** os refinos anteriores (até a v12 do Eco, as formas por lado da Órbita e da Onda) estão consolidados no README e não têm entrada própria.
