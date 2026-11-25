# Passo 7: documentar o seu app

> **O que é:** como deixar a receita do seu app escrita no formato do projeto, com o [modelo de app](../templates/novo-app.md) e o [registro de refino](../templates/registro-de-refino.md), pra outra pessoa (ou agente) conseguir refazer e refinar sem o código. **Quando ler:** quando o app funciona no simulador, e de novo a cada refino. As convenções completas estão no [CLAUDE.md](../CLAUDE.md). Índice: [guia](README.md).

## Por quê

No projeto, todo app criado ou refinado é documentado **na mesma tarefa**, com os números reais e sem código (R22). A doc diz como o app é hoje; o registro de refinos diz como ele chegou lá, e por que cada número é o que é.

**Onde:** se o app é do seu desktop, num repo de docs seu com a mesma estrutura (pode ser um fork deste). Os passos abaixo usam os caminhos daqui.

## Passo a passo

1. **Crie a pasta** `apps/<nome>/` (minúsculo, sem acento, sem espaço).
2. **Copie** [templates/novo-app.md](../templates/novo-app.md) como `apps/<nome>/README.md` e preencha **toda** seção. O que ainda não existe ganha "ainda não", em vez de sumir.
3. **A matriz do [passo 3](03-forma-por-lado.md)** vira a tabela "Formas por lado e canto", com medidas em px; a interação de cada forma vai com a fórmula.
4. **Motion:** só o que é do seu app. Mola nova entra também em [molas](../referencias/motion/molas.md); o comum fica nos [padrões de motion](../padroes/motion/README.md), com link.
5. **Passou de ~80 linhas?** Divida por assunto: `visual.md`, um arquivo do mínimo (como o [degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md)) ou um L3 do app (como a [marca WebGL do Eco](../apps/eco/marca-webgl.md)). O README da pasta aponta pra eles, e nenhum número se perde.
6. **"Testado":** o que foi conferido por print e por gancho no simulador, e o que ficou "não testado" ([passo 6](06-testar-sem-mexer-no-pc.md)).
7. **Crie `refinos.md`** com o cabeçalho e o comentário `<!-- Entradas novas logo abaixo desta linha. -->`, e a primeira entrada no formato do [registro de refino](../templates/registro-de-refino.md). Veja um pronto: [refinos do Eco](../apps/eco/refinos.md).
8. **Ligue nos índices:** uma linha em [apps/README.md](../apps/README.md), uma no mapa do [CLAUDE.md](../CLAUDE.md), uma no [CHANGELOG](../CHANGELOG.md) e, pra cada termo novo, uma no [glossário](../visao/glossario.md).

## A cada refino

Os três juntos, sempre:
- os números novos no doc certo (o README do app, ou o padrão L1 ou a referência L3 que mudou);
- uma entrada no topo de `refinos.md`, com o antes → depois;
- uma linha no [CHANGELOG](../CHANGELOG.md).

Achou algo que vale pra todos os apps (um bug do motor, uma regra de hover)? Vai pra `padroes/` ou `referencias/`, não só pro seu app.

## Como escrever

- Português claro e curto; um assunto por arquivo; nomes em `kebab-case`, sem acento.
- Todo arquivo começa com o título e uma linha de "o que é / quando ler".
- Links sempre relativos, e conferidos antes do commit.
- Só a receita: o que, quanto e por quê. Código não entra.
- **Repo público:** nada de tokens, chaves, client IDs, e-mails, nomes de usuário ou caminhos pessoais. Confira o diff antes de todo commit.
- Neste repo, quatro arquivos são cópias automáticas das regras (os **espelhos do dreamer**, listados no [CLAUDE.md](../CLAUDE.md)) e não se editam à mão. Num fork, decida se mantém esse esquema.

## Pronto quando

- [ ] O [checklist de app novo](../templates/checklist-novo-app.md) está todo marcado.
- [ ] Alguém que nunca viu o app consegue descrever cada forma e interação só lendo a pasta dele.

Fim do guia. Volte ao [índice](README.md) ou siga pro passo extra: [interação entre apps](../padroes/interacao-entre-apps.md).
