# Moldura — o molde de todo widget do Board

> **O que é:** o contrato comum de widget (seção 14d do núcleo). **Quando ler:** antes de fazer qualquer widget novo ou de mudar como um widget se adapta ao lugar e ao tamanho. Volta: [Board](README.md).

Um widget feito com `Board.moldura(def)` nasce sabendo **onde está**, **em que tamanho**, **quais bordas redimensionam** ali e **guarda um tamanho por lugar**. O motion (molas, encaixe, emendas, passe entre monitores) é o do núcleo, igual pra todos.

## Âncoras (onde o widget mora)

| Âncora | Forma do núcleo | Bordas que redimensionam |
|---|---|---|
| `interior` | livre | as 4 bordas e as 4 quinas |
| `superior` | top | baixo, laterais e as quinas de baixo |
| `inferior` | bottom | cima, laterais e as quinas de cima |
| `esquerda` | left | direita, cima, baixo e as quinas da direita |
| `direita` | right | esquerda, cima, baixo e as quinas da esquerda |
| `canto-sup-esq` / `canto-sup-dir` | c-tl / c-tr | as duas de dentro e a quina entre elas |
| `canto-inf-esq` / `canto-inf-dir` | c-bl / c-br | as duas de dentro e a quina entre elas |

O lado fundido na tela nunca redimensiona. `ancoras` na definição limita onde o widget pode morar (`canto-sup` e `canto-inf` valem pros dois lados); o encaixe e o `Board.mover` respeitam.

**Monitor vizinho:** o estado diz, pra cada lado da peça, se ela encosta numa `borda` ou numa `emenda` (o outro monitor), e qual monitor (`vizinho`). No Board 1 de quem tem a segunda tela à direita, a peça na lateral direita sabe que do outro lado tem o Board 2.

## Tamanhos

`xs · s · md · lg · xl`, pelo lado maior (faixas padrão: s ≥ 220, md ≥ 340, lg ≥ 520, xl ≥ 760 px, ajustáveis em `faixas`), combinados com a orientação: `h` (mais largo) ou `v` (mais alto). A classe é `h-md`, `v-lg` etc.

Cada âncora tem o seu tamanho: o de partida vem de `tamanhos` (padrão: interior 360×240, superior/inferior 560×150, laterais 300×480, cantos 300×260) e o que a pessoa ajusta fica guardado por âncora (no navegador do app e no `board-estado.json`, então vale nos dois Boards).

## Como um widget usa

```js
Board.molduraDefinir({ id:'meu', nome:'Meu widget', ancoras:['interior','direita','superior'],
  tamanhos:{ direita:{ w:320, h:600 } }, min:{ w:160, h:100 },
  monta(corpo, m){
    return {
      vistas:{ 'v-md':(c, e) => { /* coluna */ }, 'h-lg':(c, e) => { /* faixa larga */ }, xs:(c) => { /* só o ícone */ }, padrao:(c, e) => {} },
      aoMudar:e => { /* trocou âncora, classe ou o que encosta */ },
      automacao:{ comandos:[…] },
    };
  } });
```

- **CSS:** o corpo ganha `data-ancora`, `data-orient`, `data-tam`, `data-classe` e as variáveis `--mw`/`--mh`. Dá pra fazer tudo só com CSS (`[data-classe=v-md] .lista{…}`) ou com container queries (`container-name:mold`).
- **vistas:** vale a da classe exata; senão a mais perto na mesma orientação; senão a do tamanho; senão a da outra orientação; senão `padrao`. A vista só é redesenhada quando a escolhida muda.
- **m:** `estado()`, `redimensionar(w, h)`, `ancora(nome)`, `ler/salvar`, `atualizar()`.
- **Assistente:** `Board.mapa()` mostra `ver.moldura` (âncora, classe, tamanho, lados) de cada peça; `Board.anunciar` solta `moldura:mudou` e `moldura:redimensionou`.

Os widgets da ponte da Mesa (`Mesa.define`) já nascem numa moldura; `ancoras`, `tamanhos`, `faixas` e `vistas` passam direto.
