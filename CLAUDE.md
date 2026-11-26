# CLAUDE.md — entrada pra agentes

**desklive:** um desktop vivo pro Windows 11 feito de artefatos do Claude instalados como apps de desktop transparentes (Órbita = barra de tarefas, Onda = player do Spotify, Eco = assistente).
Este repo guarda **as regras e a receita** de como os apps são feitos (forma e interação por lado, números de motion, visual). **Código-fonte só em [modelos/](modelos/README.md)**, como modelos limpos (sem nenhum dado pessoal); o resto da doc continua só receita, nunca código.
Tudo em português do Brasil, informal mas claro. Leia só o nível que a tarefa pede (mapa abaixo).

## Regras inegociáveis (resumo; fonte: [regras-de-trabalho.md](regras/regras-de-trabalho.md))

1. **Regra nº 1 / R20:** todo app se **transforma** conforme o lado, o canto e o tamanho. Cada lugar tem **forma e interação únicas** (nunca a mesma peça girada, nunca só se esconder), fundido à borda com ombros côncavos e descolando como líquido, no nível mínimo da **ilha do topo do Eco**. O **tamanho mínimo** também é único e vivo. Prints de cada lado e canto (repouso, hover, aberto) antes de publicar.
2. **R19:** nunca controlar o mouse ou o teclado do PC dele (sem computer use). Teste no Chrome via localhost, com os simuladores e ganchos; o resto fica marcado "não testado".
3. **R9:** a janela tem **só o tamanho do app** (senão não encosta nas bordas e cantos) → [janela sem tremer](padroes/motion/janela-sem-tremer.md).
4. **R22:** todo app criado ou refinado é **documentado aqui na mesma tarefa**, com os números reais → convenções abaixo.
5. Também: design transparente e nada genérico (R1–R5), física em tudo (R7), uma função por app (R16), apps conversam pelo barramento (R18), salvar regra nova na hora (R21), nada pisca (R25), todo trabalho técnico no [diário](diario/README.md) (R26). Repasse as regras críticas a toda sessão delegada.

## Níveis (por que esta estrutura)

A informação desce do geral pro específico, e cada nível só existe se o de cima não bastar. Assim um agente carrega pouco e aprofunda só onde precisa, e um app novo é só uma pasta a mais.

| Nível | Pasta | O que tem | Por quê |
|---|---|---|---|
| **L0** | [visao/](visao/README.md), [regras/](regras/README.md) | visão, princípios, [glossário](visao/glossario.md), regras de trabalho | o que nunca muda de app pra app; curto, lido sempre |
| **L1** | [padroes/](padroes/README.md) | design, layout por posição e tamanho, interação entre apps, [motion](padroes/motion/README.md) (um arquivo por assunto), [arquitetura e runtime](padroes/arquitetura.md) | o "como" que vale pra todos os apps |
| **L2** | [apps/](apps/README.md) | uma pasta por app: `README.md` (visão geral), arquivos de detalhe, `refinos.md` | escala: app novo = pasta nova, sem mexer nas outras |
| **L3** | [referencias/](referencias/README.md) (transversal) e arquivos de detalhe dentro de `apps/<app>/` | constantes de mola, curvas, [motor](referencias/motor/README.md), shaders, fórmulas | números exatos; só abre quem vai mexer neles |
| — | [templates/](templates/README.md), [CHANGELOG.md](CHANGELOG.md) | modelos de app e de refino, checklist; histórico do repo | ferramentas pra escrever |
| **Diário** | [diario/](diario/README.md) | uma entrada datada por mudança técnica de movimento, tamanho ou hover (data · app/versão · o que mudou · por quê · números · como foi provado), um arquivo por mês | a história técnica do jeito que foi feita; o arquivo do assunto guarda só o estado atual (R26) |
| **Guia** | [guia/](guia/README.md) | passo a passo em 7 arquivos pra outras pessoas fazerem o próprio app: janela, motor, forma por lado, hover, visual e motion, teste, doc | um caminho prático pelos níveis acima; aponta pros docs, não copia números |
| **Código** | [modelos/](modelos/README.md) | o código dos três apps como modelos limpos (`*-src.html` + helpers + `build.ps1`), o motor e os helpers compartilhados | a única pasta com código; quem quer o app rodando monta daqui, a receita continua nos níveis acima |

## Mapa: o que ler pra cada tarefa

| Tarefa | Leia (nessa ordem) |
|---|---|
| **Primeira vez no projeto** | [visao/](visao/README.md) → [glossário](visao/glossario.md) → [apps/](apps/README.md) |
| **Criar um app novo** | [visao/](visao/README.md) → [regras](regras/regras-de-trabalho.md) → [padroes/](padroes/README.md) (todos) → [motion/](padroes/motion/README.md) → a [ilha do Eco](apps/eco/README.md) (o padrão mínimo) → [modelo](templates/novo-app.md) → [checklist](templates/checklist-novo-app.md) |
| **Fazer o seu próprio app** (quem chega de fora) | [guia/](guia/README.md), nos passos 1 a 7, abrindo os links de cada passo |
| **Começar um app a partir de um modelo** | [modelos/](modelos/README.md) → o README da pasta do app → a doc dele em [apps/](apps/README.md) |
| **Refinar a Órbita** | [apps/orbita/](apps/orbita/README.md) → [refinos](apps/orbita/refinos.md) → o arquivo de [motion/](padroes/motion/README.md) do assunto |
| **Refinar a Onda** | [apps/onda/](apps/onda/README.md) → [refinos](apps/onda/refinos.md) → [onda-e-cor](apps/onda/onda-e-cor.md) se for a onda ou a cor → motion do assunto |
| **Refinar o Eco** | [apps/eco/](apps/eco/README.md) → [refinos](apps/eco/refinos.md) → [marca-webgl](apps/eco/marca-webgl.md) se for a marca → motion do assunto |
| **Mexer na Mesa ou escrever um widget** | [apps/mesa/](apps/mesa/README.md) → [modelos/mesa/](modelos/mesa/README.md) (como escrever um widget) → [refinos](apps/mesa/refinos.md) |
| **Mexer numa forma por lado ou num degrau** | [layout-posicao-e-tamanho](padroes/layout-posicao-e-tamanho.md) → [fusão com a borda](padroes/motion/fusao-com-a-borda.md) → [troca de forma](padroes/motion/troca-de-forma.md) → doc do app |
| **Arrasto, encaixe, embalo** | [sensor de borda](padroes/motion/sensor-de-borda-e-encaixe.md) → [sentir o arrasto](padroes/motion/sentir-o-arrasto.md) → [ponto de pega](padroes/motion/ponto-de-pega.md) → [motor](referencias/motor/README.md) |
| **Mudar uma mola ou curva** | [molas](referencias/motion/molas.md) / [curvas e durações](referencias/motion/curvas-e-duracoes.md) |
| **Janela pisca, corta ou não encosta** | [janela sem tremer e nada pisca](padroes/motion/janela-sem-tremer.md) → [brilho dentro da janela](padroes/motion/brilho-dentro-da-janela.md) → [arquitetura](padroes/arquitetura.md) |
| **Entender o ambiente / hover, tamanho, movimento no nível do host** | [referencias/ambiente/](referencias/ambiente/README.md) → [receitas recomendadas](referencias/ambiente/receitas-recomendadas.md) → o arquivo do assunto (host, hover e clique passa, mover e redimensionar, tempo, medições) |
| **Board (palco em tela cheia)** | [referencias/ambiente/board.md](referencias/ambiente/board.md) → [peças](referencias/ambiente/board-pecas.md) → [motor](referencias/ambiente/board-motor.md) → [telas](referencias/ambiente/board-telas.md) → [conexão](referencias/ambiente/board-conexao.md) → [hover e clique passa](referencias/ambiente/hover-e-clique-passa.md) → [mover e redimensionar](referencias/ambiente/mover-e-redimensionar.md) |
| **Medir ou provar no app instalado** (sonda, registro, vídeo quadro a quadro) | [como medir](referencias/ambiente/como-medir.md) → [medições](referencias/ambiente/medicoes.md) |
| **Bug estranho de movimento, tamanho ou hover** | [bugs e lições](referencias/motor/bugs-e-licoes.md) → [bugs evitados](referencias/motor/bugs-evitados.md) → [diário](diario/README.md) |
| **Registrar uma mudança técnica** (movimento, tamanho, hover) | [diario/](diario/README.md) (modelo da entrada) → o arquivo do assunto → [CHANGELOG](CHANGELOG.md) |
| **Apps falando entre si** | [interação entre apps](padroes/interacao-entre-apps.md) → [arquitetura](padroes/arquitetura.md) (barramento) |
| **Visual de um app** | [design](padroes/design.md) → `apps/<app>/visual.md` |
| **Achar um termo ou assunto** | [glossário](visao/glossario.md) (cada termo aponta o arquivo), ou busque no repo |

**Motor e motor de arrasto:** toda doc mora em [referencias/motor/](referencias/motor/README.md). Uma seção nova "Motor de movimento" (ou v3, ou o motor de arrasto separado) entra lá como arquivo novo + uma linha na tabela daquela pasta, e um link no índice de [motion](padroes/motion/README.md). Não recrie o `padroes/motion.md` grande.

## Convenções pra escrever e atualizar

- **Onde vai cada coisa:**
  - vale só pra um app → `apps/<app>/README.md` (ou um arquivo de detalhe dele);
  - vale pra todos → um arquivo de `padroes/` (motion: `padroes/motion/<assunto>.md`);
  - é número exato transversal (mola, curva, motor) → `referencias/`;
  - shader ou fórmula de um app só → arquivo L3 na pasta do app (ex.: `marca-webgl.md`); se dois apps passarem a usar, sobe pra `referencias/<tema>/`;
  - regra nova ("isso é regra") → na memória do Claude; o dreamer traz pra `regras/`.
- **Todo refino (R22):** atualize os números no doc certo **e** adicione uma entrada em `apps/<app>/refinos.md` ([modelo](templates/registro-de-refino.md)) **e** uma linha no [CHANGELOG.md](CHANGELOG.md). Nos docs, só a receita, nunca código.
- **Toda mudança técnica de movimento, tamanho ou hover (R26):** uma entrada no `diario/AAAA-MM.md` ([modelo](diario/README.md#modelo)) **e** o arquivo do assunto atualizado (ambiente, motor, motion, hover; medição nova em [medições](referencias/ambiente/medicoes.md), bug em [bugs e lições](referencias/motor/bugs-e-licoes.md)) **e** uma linha no [CHANGELOG.md](CHANGELOG.md). Trechos só curtos, como pseudocódigo ou fórmula.
- **Por enquanto o repo fica local:** commit sim, push não, até ele dizer.
- **Modelos de código (`modelos/`):** pra atualizar um modelo, copie o fonte novo pra `modelos/<app>/`, **limpe de novo** (veja Segurança), confira que o `build.ps1` monta sem sobrar marcador, anote a versão no README da pasta e adicione uma linha no CHANGELOG. O HTML montado nunca entra no repo (`modelos/saida/` está no `.gitignore`).
- **App novo:** `apps/<nome>/` (minúsculo, sem acento, sem espaço) com `README.md` do [modelo](templates/novo-app.md) e `refinos.md`; linha em [apps/README.md](apps/README.md) e neste mapa.
- **Nomes:** arquivos em minúsculo, `kebab-case`, sem acento, nome do assunto (`sensor-de-borda-e-encaixe.md`). Pasta = `README.md` como índice.
- **Arquivos pequenos:** um assunto por arquivo, alvo de até ~80 linhas. Passou disso, divida por assunto, deixe o índice da pasta apontando, e **não perca nenhum número**.
- **Cabeçalho de todo doc:** título + 1 linha de "o que é / quando ler" (ou o nível e o índice). Todo arquivo novo ganha uma linha no `README.md` da pasta.
- **Links:** sempre relativos e conferidos. Termo novo → acrescente no [glossário](visao/glossario.md).
- **Espelhos do dreamer (não edite à mão):** `regras/regras-de-trabalho.md`, `padroes/layout-posicao-e-tamanho.md`, `padroes/interacao-entre-apps.md` e `padroes/design.md` são copiados todo dia da memória. Caminhos fixos; edição manual some na próxima cópia.
- **Ponteiros:** `apps/orbita.md`, `apps/onda.md`, `apps/eco.md` e `padroes/motion.md` só apontam pro lugar novo (a R22 ainda cita os caminhos antigos).

## Segurança

O repo é **público** no GitHub. Nunca entram: tokens, chaves, client IDs, segredos do Spotify ou de qualquer API, e-mails, nomes de usuário, caminhos pessoais (`C:\Users\...`), links e IDs de artefato, AppIDs de apps instalados como artefato, nem código-fonte dos apps **fora de `modelos/`**. Em `modelos/`, o código entra só limpo: Client ID como `SEU_CLIENT_ID` (vem de um `config.json` ignorado), lista de apps só com apps do Windows, nada de músicas, preferências ou histórico de ninguém, exemplos genéricos. Antes de commitar em `modelos/`, procure (sem diferenciar maiúsculas) por nome de usuário, `C:\Users`, `@`, `claude.ai/artifact`, `ArtifactApp`, `token`, `refresh` e sequências de 32 caracteres hexadecimais, e explique cada resultado. Confira o diff antes de todo commit.
