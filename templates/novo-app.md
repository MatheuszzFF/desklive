# <Nome> — <o que é, em 2 a 4 palavras>

> **Modelo:** copie este arquivo pra `apps/<nome>/README.md` (nome minúsculo, sem acento) e preencha. Apague as linhas em itálico. Toda seção é obrigatória; se algo ainda não existe, escreva "ainda não" em vez de apagar a seção. Números reais do código, nunca o código (R22). Os caminhos entre crases são a partir da raiz do repo: no doc final, troque por links relativos (`../../padroes/...`). Antes, leia [visão](../visao/README.md), [padrões](../padroes/README.md) e o [checklist](checklist-novo-app.md).

> **O que é:** o doc L2 do <Nome>. **Quando ler:** antes de criar, refinar ou depurar qualquer coisa do <Nome>. Comum a todos: `padroes/README.md`. Histórico: `refinos.md`.

- **Conteúdo:** _o que ele mostra e faz._
- **Uma função:** _qual é a função dele e o que ele NÃO faz (R16)._
- **Atalho / teclado:** _atalho global, se tiver._
- **Barramento:** _o que publica (`<app>.json`), que comandos aceita (`<app>-cmd/`), o que lê dos outros._
- **Helpers:** _quais helpers usa e pra quê (`padroes/arquitetura.md`)._

## Como é feito

### Estrutura
_Como o DOM ou o canvas é organizado, as classes/atributos de estado, o que o JS calcula, o tamanho da janela em cada estado._

### Formas por lado e canto (incluindo o tamanho mínimo)
_Uma forma diferente por lugar, nunca a mesma peça girada (R20). Medidas em px. O tamanho mínimo é tão trabalhado quanto o grande._

| Lugar | Forma | Mínimo / repouso | Prévia (mouse em cima) | Aberto (cada degrau) |
|---|---|---|---|---|
| **Topo** | | | | |
| **Embaixo** | | | | |
| **Laterais** | | | | |
| **Cantos** | | | | |
| **Solta** | | | | |

### Interação única de cada forma
_Pra cada forma: como reage ao mouse, como abre, o gesto próprio e o micro-movimento, com as fórmulas._
- **<forma do topo>:**
- **<forma de baixo>:**
- **<forma das laterais>:**
- **<forma dos cantos>:**
- **Solta:**

### Degraus de tamanho e alça
_Quais degraus existem, o que entra em cada um, como a alça é e quando troca (limiares, histerese, elástico)._

### Motion
_Só o que é deste app; o comum fica em `padroes/motion/README.md`. Link pra cada padrão usado._
- **Molas próprias:** _k, ζ, subpassos (e acrescente em `referencias/motion/molas.md`)._
- **Fusão com a borda:** _como desenha os ombros e como descola._
- **Sensor de borda e encaixe:** _referência, limiares de canto/lateral/topo, histerese, ímã._
- **Feel:** _inclinar, esticar, levantar, amassar._
- **Troca de forma:** _FLIP, molas por peça ou variáveis CSS._
- **Stagger:** _ordem e atrasos das entradas._
- **Janela sem tremer:** _margens, crescer antes / encolher depois._
- **Movimento reduzido:** _o que muda._

### Visual
_Materiais, cores, fontes, sombras (todas dentro da janela, R4), ícone. Se crescer, vira `visual.md` nesta pasta._

## Testado
_O que foi conferido no simulador (`<app>-sim.html`, gancho `window.__<app>`) e por print: cada lado e canto, em repouso, com hover e aberto, em cada degrau (R10, R20). O que ficou "não testado" no app instalado. Nunca usar o mouse ou o teclado do PC (R19)._

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| `refinos.md` | registro de cada refino, com data e números |
