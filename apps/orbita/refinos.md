# Órbita — registro de refinos

> **O que é:** o histórico de cada refino do app Órbita, do mais novo pro mais antigo. **Quando ler:** pra saber por que um número é o que é, ou antes de refinar (pra não desfazer algo aprovado, R2). Modelo de entrada: [templates/registro-de-refino.md](../../templates/registro-de-refino.md).

Cada refino ganha uma entrada aqui **e** atualiza o doc do app ([README.md](README.md)) com os números novos. O README diz como o app é hoje; este arquivo diz como ele chegou lá.

<!-- Entradas novas logo abaixo desta linha. -->

## 2026-11-25 — Degrau mínimo vivo por lado (v23)
- **Pedido:** "os tamanhos minimos dos apps precisam ser trabalhados bem feito também, e também tem que ser único e interativo".
- **Onde:** o degrau fina, em cada lado e canto.
- **Antes → depois:** a fina era a barra normal só com os ícones (igual em todo lado; no canto, sem os anéis). Agora:
  - embaixo, **doca dormindo**: ícones de 22 px sem cor que acordam com o mouse (até 1,72×, sobem 9 px);
  - laterais, **coluna de pontos** de 7 px que viram ícone (26 px, 5 px pra dentro);
  - em cima, **ilha dinâmica**: só a hora e três pontinhos; abre com os apps em sequência (28 ms) e fecha 420 ms depois;
  - cantos, **só o núcleo**, com os anéis respirando (1 → 1,08) num ciclo de ≈ 4,2 s a ≈ 1,4 s conforme a CPU;
  - solta, pílula que **pula em onda** ao entrar o mouse (40 ms entre ícones).
  A proximidade começa a 110 px e a curva tem largura de 62 px. Detalhes em [degrau mínimo](degrau-minimo.md). O motor de arrasto não foi mexido.
- **Por quê:** a fina era uma versão encolhida e pobre; a R20 pede o mínimo também único e vivo.
- **Docs atualizados:** [degrau mínimo](degrau-minimo.md) (novo), [README](README.md) (degraus, Testado, arquivos), [glossário](../../visao/glossario.md).
- **Testado:** prints no simulador de mesa de cada lado e canto na fina (repouso e com o mouse perto ou em cima); a ilha dinâmica abrindo e fechando; a onda de pulos conferida por código. **Não testado:** o app instalado e dois monitores.
- **Regras:** R20, R19, R9, R22.

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
