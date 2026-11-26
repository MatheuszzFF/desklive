# Modelos: o código dos três apps, pronto pra montar

> **O que é:** o código-fonte da Órbita, da Onda e do Eco como **modelos** limpos (sem dados de ninguém), pra você montar, publicar como artefato e instalar no seu Windows, ou usar de ponto de partida pro seu app. **Quando ler:** você quer os apps rodando agora, ou quer começar um app a partir de um que já funciona. Pra entender **por que** cada coisa é como é, vá pro [guia](../guia/README.md) e pros docs de cada app em [apps/](../apps/README.md).

Esta é a **única** pasta do repo com código. O resto continua sendo receita (regras, números, como fazer).

## O que tem aqui

| Pasta | O que é | Versão | Doc do app |
|---|---|---|---|
| [orbita/](orbita/README.md) | barra de tarefas: apps, anéis de CPU/RAM/placa, relógio, música | Órbita v28 | [apps/orbita/](../apps/orbita/README.md) |
| [onda/](onda/README.md) | player do Spotify: capa, onda que reage ao som, Web API | Onda v19 | [apps/onda/](../apps/onda/README.md) |
| [eco/](eco/README.md) | assistente (Claude) com marca líquida em WebGL | Eco v24 | [apps/eco/](../apps/eco/README.md) |
| [mesa/](mesa/README.md) | o quadro dos widgets: uma janela só, com um morador que comanda tudo (piloto) | Mesa 0.1 | [apps/mesa/](../apps/mesa/README.md) |
| [board/](board/README.md) | palco transparente em tela cheia, um por monitor ("Board" e "Board · monitor 2"), com a Sonda como peça; os apps entram pelo `board.js` da pasta deles | Board v2 | [apps/board/](../apps/board/README.md) · [board](../referencias/ambiente/board.md) |
| [dengas/](dengas/README.md) | o ratinho assistente (corpo, conversa e cérebro) | — | [apps/dengas/](../apps/dengas/README.md) |
| [navegador/](navegador/README.md) | sites e vídeo dentro do quadro | — | [apps/navegador/](../apps/navegador/README.md) |
| [assistente/](assistente/README.md) | cérebro genérico pro Board, sem corpo | — | [apps/assistente/](../apps/assistente/README.md) |
| [compartilhado/](compartilhado/README.md) | o motor de movimento (v2.2), os helpers usados por mais de um app e as funções da montagem | — | [motor](../referencias/motor/README.md) · [arquitetura](../padroes/arquitetura.md) |

Cada app é escrito como um `*-src.html` com **marcadores** (`/*MOTOR*/`, `/*HELPER*/''`, `/*ICONS*/{}`…). O `build.ps1` de cada pasta troca os marcadores pelo motor, pelos helpers em PowerShell (como string JS) e pelos ícones, e grava **um HTML só**, que é o que vira artefato.

## Do que você precisa

- **Windows 11** e o **app Claude** pra desktop, com a instalação de artefatos como app (é ela que dá a janela transparente, o `childProcess`, o barramento em arquivos etc.).
- **Windows PowerShell 5.1** (já vem no Windows): roda os builds e os helpers. Nada de binário: o Smart App Control pode ficar ligado.
- **Onda:** uma conta no Spotify e um **app seu** no Spotify for Developers (o Client ID dele). Passo a passo em [onda/](onda/README.md).
- **Eco:** uma conta do Claude (as respostas vêm do próprio Claude do artefato). A voz é opcional e vem desligada.
- **Opcional:** `nvidia-smi` no PATH (placa NVIDIA) pra Órbita mostrar a temperatura da placa; sem ele o anel some.

## Montar

No PowerShell, na raiz do repo:

```powershell
powershell -ExecutionPolicy Bypass -File modelos\build-todos.ps1          # os três
powershell -ExecutionPolicy Bypass -File modelos\orbita\build.ps1         # só um
powershell -ExecutionPolicy Bypass -File modelos\eco\build.ps1 -Saida C:\algum\lugar
```

A saída padrão é `modelos/saida/` (no `.gitignore`: o HTML montado nunca entra no repo). Cada build diz o tamanho e se sobrou algum marcador ("nenhum" = pronto). Os ícones da Órbita e do Eco são extraídos **da sua máquina** na hora da montagem, a partir da lista `APPS` do fonte; app que não está instalado só gera um aviso.

## Publicar e instalar como app

1. Peça ao Claude (no app Claude ou no Claude Code) pra **publicar o HTML montado como artefato com a capability `desktop`**. O Eco usa também a capability `sample` (o Claude que responde) e, se existirem na sua conta, `tts` e `dictation`; sem elas ele continua funcionando, só sem voz.
2. Abra o artefato no **app Claude**. No menu com o nome do app no topo do artefato, escolha **Instalar como app**. A própria página também mostra um botão de instalar quando dá.
3. Abra o app pelo menu Iniciar e libere as **permissões** que ele pede (estão no manifesto do topo de cada `*-src.html`): `overlay` (janela por cima), `full-access` (helpers e `~/.orbita`), `menu-bar` (ícone na bandeja) e, na Órbita e no Eco, `shortcuts` (atalhos globais).
4. Os apps conversam pelo barramento `~/.orbita` (pasta criada sozinha): Órbita ↔ Eco (posição da barra, estado do orbe), Eco ↔ Onda (música). Funcionam soltos também ([interação entre apps](../padroes/interacao-entre-apps.md)).

Pra atualizar: monte de novo e republique **no mesmo artefato** (o app instalado pega a versão nova).

## Onde personalizar

| O quê | Onde |
|---|---|
| Apps da barra e dos atalhos do Eco | lista `APPS` em [orbita-src.html](orbita/orbita-src.html) e [eco-src.html](eco/eco-src.html) (formato em [orbita/](orbita/README.md)) |
| Client ID do Spotify | `onda/config.json` (copie [config.exemplo.json](onda/config.exemplo.json)) |
| Comportamento do assistente, ferramentas, sugestões, atalho | `rules()`, `claudeTools()`, `SUGGEST` e `SHORTCUT` em [eco-src.html](eco/eco-src.html) |
| Molas, arrasto, encaixe | [motor.js](compartilhado/motor.js) (vale pros três) e os números em [referencias/motor/](../referencias/motor/README.md) |
| Forma por lado, degraus, visual | o CSS e o JS de cada `*-src.html`, seguindo o [guia](../guia/README.md) e a [regra nº 1](../regras/regras-de-trabalho.md) |

## Testar sem instalar

Abra o HTML montado direto no navegador (`file://` ou `localhost`): sem o host, cada app mostra uma **prévia** e liga os ganchos de teste (`window.__orb`, `window.__onda`, `window.__eco`), que só existem fora do app instalado. Como testar de verdade sem mexer no mouse: [passo 6 do guia](../guia/06-testar-sem-mexer-no-pc.md).

## Regras desta pasta

- **Nada pessoal entra aqui:** nem Client ID, token, e-mail, nome de usuário, caminho `C:\Users\...`, link ou ID de artefato, nem a lista de apps ou as músicas de alguém. Os modelos usam só apps que já vêm no Windows e exemplos genéricos.
- **Sem licença definida ainda:** o dono do repo vai escolher. Até lá, pergunte antes de redistribuir.
- Mudou um app? A receita continua nos docs de [apps/](../apps/README.md) ([R22](../regras/regras-de-trabalho.md)); aqui só o código, limpo, com a versão anotada no README da pasta.
