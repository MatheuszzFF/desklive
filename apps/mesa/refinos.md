# Mesa — refinos

> Registro de cada refino da Mesa, do mais novo pro mais antigo ([modelo](../../templates/registro-de-refino.md)). Índice: [Mesa](README.md).

## 2026-11-26 · Mesa 0.16: mini agente em cada app
- **Direção do dono:** cada app com o próprio harness e um mini agente que conversa com o Dengas; o Dengas vê e manipula tudo sem carregar o conhecimento de cada app.
- **O que:** a casca ganha `Mesa.agente(id, regras)`. O Dengas ganha a ferramenta `agente(app, pedido)`: outra chamada ao Claude, com as regras do app, o estado dele, o espaço da tela (caixa dele e dos vizinhos) e, como ferramentas, os comandos do app mais `caixa` (mover e redimensionar a si mesmo). Os comandos de cada app deixam de ser ferramentas do Dengas (ficava acima do teto); `widget_comando` continua pro comando direto. Regras escritas pros seis apps (navegador, relógio, notas, Onda, Órbita, Estante); widget sem regras ganha agente só pelas descrições.
- **Navegador:** o ajudante troca `le` por `js` (roda uma função do widget na página) e entram `clicar` (pelo texto visível), `rolar` e `voltar`. Sem comando de digitar, de propósito.
- **Documentação:** `modelos/mesa/ARQUITETURA.md`.
- **Testado:** no navegador, a Mesa sobe sem erro, os seis agentes ficam registrados e os comandos aparecem; a janela do Edge de verdade neste PC abriu, leu, rolou, clicou num link (mudou de página) e voltou (`janela_teste.js`, página pública). **Não testado:** nenhuma conversa com o Claude (o agente chamando ferramentas), nem o WhatsApp Web.

## 2026-11-26 · Mesa 0.15: o Dengas lê a página do navegador (WhatsApp Web)
- **Pedido do dono:** ler as mensagens do WhatsApp. Não há conector oficial; o dono aceitou ler pelo WhatsApp Web no navegador da Mesa, sabendo da porta local.
- **O que:** o Edge da Mesa abre com `--remote-debugging-port` (porta sorteada a cada abertura, só em 127.0.0.1) e o ajudante ganha `le`: pega o texto da página por `Runtime.evaluate` e devolve título, endereço e até 7 mil letras. Comando `video_ler_tela` (com `espera`). Só leitura: não clica, não abre conversa, não envia.
- **Testado:** leitura de uma página simples neste PC (`janela_teste.js`). **Não testado:** WhatsApp Web de verdade e o fluxo no app.

## 2026-11-26 · Mesa 0.14: o Dengas envia e-mail
- **Pedido do dono:** "Dengas pode" enviar e responder. Entram `send_message`, `reply` e `forward` do Gmail na publicação; a regra manda enviar só quando ele pedir pra enviar, senão rascunho, e dizer pra quem foi.
- **Não testado:** nenhuma chamada real.

## 2026-11-26 · Mesa 0.13: Gmail, Agenda e Drive
- **O que:** a publicação passa a declarar Gmail (buscar, ler, rascunhos), Google Agenda (listar, buscar, sugerir horário, criar, alterar, responder convite) e Google Drive (buscar, recentes, ler, criar arquivo). De propósito ficaram de fora: enviar, responder e encaminhar e-mail, e tudo que apaga ou compartilha. O Dengas usa pela mesma ferramenta `conector`.
- **Não testado:** nenhuma chamada real (só no app).

## 2026-11-26 · Mesa 0.12: o Dengas cria documentos (Claude Docs)
- **O que:** ferramenta `documento` (título + Markdown). O Dengas só prepara o rascunho; aparece um botão na conversa e o documento nasce no clique do dono (regra do conector: criar só em gesto de quem vê, uma vez por clique). Confere antes os limites (título de 200, texto abaixo de 32 KB, sem imagem, nota de rodapé ou fórmula). O Claude Docs fica fora da ferramenta `conector` genérica: de uma página ele só aceita a criação.
- **Não testado:** a criação de verdade (só no app).

## 2026-11-26 · Mesa 0.11: conectores do Claude
- **O que:** o Dengas ganha a ferramenta `conector` (descrever / chamar), que usa os conectores da conta do dono pela capacidade `mcp` do artefato. A lista vem de `listTools()` e entra nas instruções; os erros viram frase pelo código. A página só alcança o que está declarado na publicação (`capabilities.mcp.servers`); hoje só o Spotify, o único ligado na conta.
- **Não testado:** nenhuma chamada real foi feita (só dá no app). Gmail, Agenda e Drive dependem do dono ligar os conectores em claude.ai.

## 2026-11-26 · Mesa 0.10: navegador da Mesa
- **Achado no app:** a janela do Edge abriu no lugar, mas com a barra de título dela e com o "Erro 153" do YouTube (o player reduzido `watch_popup` recusa sem saber de onde é chamado).
- **O que:** abre a página normal do vídeo; a janela sobe a altura da barra (33 px na escala 100%, pelo DPI da janela) e é recortada com `SetWindowRgn`; antes de abrir, fecha todo Edge do perfil `~/.mesa/edge` (janela órfã fazia o Edge novo entregar o endereço pro velho e sumir). O perfil guarda o login do dono. O Dengas passa a mostrar a pesquisa no navegador.
- **Testado:** abrir, mover e fechar neste PC (`janela_teste.js`). **Não testado:** o recorte e o vídeo no app instalado.

## 2026-11-26 · Mesa 0.9: o Dengas ganha internet
- **Queixa:** o Dengas respondeu que não conseguia pesquisar na internet e pediu um link de imagem pro dono.
- **O que:** ferramenta `internet` (uma só, pra não gastar o teto de ferramentas), só com o acesso ao PC liberado, pelo PowerShell: `pesquisar` (DuckDuckGo em HTML, até 6 resultados), `imagens` (API aberta do Wikimedia Commons, fotos largas de 1600 px pra cima) e `ler` (título e texto de uma página https, até 5 mil letras). O texto do Claude vai em base64, nunca vira código. O download do papel de parede passou a mandar um User-Agent. As regras mandam ele buscar sozinho e só dizer que fez depois da ferramenta confirmar.
- **Testado:** as três ações rodadas de verdade no PowerShell deste PC. **Não testado:** a conversa inteira no app instalado (buscar a imagem e aplicar de fundo).

## 2026-11-26 · Mesa 0.8: vídeo e sites por "furo"
- **Achado no app instalado:** o app barra qualquer página de fora embutida (`frame-src`), então o player do YouTube em iframe fica preto.
- **O que:** o widget Vídeo vira um **furo**: abre o site numa janela própria do Edge (`--app`, perfil separado em `~/.mesa/edge`, `--autoplay-policy=no-user-gesture-required`), tira a moldura dela (`SetWindowLong`), põe por cima de tudo e mantém a janela exatamente embaixo do furo (confere a posição a cada 60 ms e manda `SetWindowPos` só quando muda; coordenadas em pixels físicos, `devicePixelRatio`). A casca ganha a classe `.furo`: dentro dela o clique passa direto. Comandos: `video_tocar` (busca no YouTube e abre `watch_popup` com autoplay), `video_abrir_site` (qualquer https) e `video_fechar_janela`. Nada de tecla; fechar é encerrar o processo que o widget abriu.
- **Testado:** o ajudante abriu, moveu e fechou uma janela do Edge neste PC; a busca do YouTube devolveu id e título. **Não testado:** dentro do app instalado (alinhamento com o furo, se a moldura some de vez, o som do vídeo).

## 2026-11-26 · Mesa 0.7: sem cara de Windows
- **O que:** os widgets perdem a barra de título (faixa de 34 px com ícone e nome) e toda barra de rolagem (`scrollbar-width: none` na casca e no kit dos soltos). **Fechar:** um X flutuante de 26 px no canto de cima à direita, que só aparece com o mouse em cima do widget. **Redimensionar:** pelas quatro bordas (zona de 9 px) e pelas quatro quinas (18 px); o lado oposto fica parado; some a alça antiga. **Arrastar:** por qualquer parte do corpo que não seja um controle (botão, campo, iframe, canvas) ou pela mãozinha de cima (zona de 16 px com um traço de 38 × 4 px que aparece com o mouse); continua virando arrasto só depois de 4 px.
- **Por quê:** a Mesa existe pra tirar a cara do Windows; nada de barra superior nem de rolagem.
- **Testado:** no navegador: sem barra, X escondido em repouso, arrasto pelo corpo do relógio, redimensionar pela borda direita e pela quina de cima à esquerda, console sem erro. **Não testado:** no app instalado; widgets que são um iframe inteiro (vídeo, criados pelo morador) só arrastam pela mãozinha.

## 2026-11-26 · Mesa 0.6
- **Vídeo** (`35-video.js`, de fábrica): toca YouTube dentro da Mesa. A busca por assunto é feita pelo PC (PowerShell lê a página de resultados e pega o primeiro `videoId`, que vem escrito com `\x22` no lugar das aspas); o player é o embutido do YouTube, com `pausar`, `continuar`, `parar`, `mudo`, `som`. Comandos `video_tocar` e `video_controlar`.
- **Imagem de fundo:** `Mesa.papel(caminho ou https)`: arquivo do PC lido em base64, ou endereço baixado pra `~/.mesa/papel.<ext>`; a Mesa guarda só o caminho. Entrou em `mesa_aparencia` (campo `imagem`).
- **Kit de design dos widgets soltos** (`BASE_SOLTO`): `.pad`, `.titulo`, `.num`, `.sub`, `.rotulo`, `.linha`, `.cresce`, `.rola`, `.bot` (`.pri`, `.redondo`), `.campo`, `.chip`, `.chapa`, `.barra`, `.entra`, `svg.ic`; e um guia de design nas instruções do morador (hierarquia, uma cor de destaque, espaçamentos de 8, 12 e 16, estados de hover e toque, o que um widget solto não consegue e quem faz no lugar).
- **Conversa com o Claude:** descrições de ferramenta cortadas em 1.000 bytes, teto de ferramentas lido de `sample.limits()`, ordem por importância (lista `DEPOIS`), erro com o código entre colchetes. Causa do erro anterior: a descrição de `widget_criar` passava de 1 KB.
- **Testado:** no navegador: o vídeo tocou dentro da Mesa pelo link; a busca por assunto devolveu id e título rodando o script no PC; um widget feito só com o kit ficou no estilo dos de fábrica. **Não testado:** o vídeo e a imagem de fundo no app instalado (o app pode barrar o player embutido), e o Claude criando widgets com o guia novo.

## 2026-11-25 · Mesa 0.5: a Mesa é uma casca
- **Morador livre em 8 direções:** ele não fica mais preso a superfícies. Anda pra qualquer ponto da mesa: desce pra quatro patas (5 quadros, ~460 ms), corre a 150 px/s no clipe da direção (lado, cima, baixo e duas diagonais; as do lado esquerdo são espelhadas) e levanta ao chegar. Perto do fim (menos de 24 px) não troca mais de direção. Soltou com o mouse, fica onde soltou. Passeia sozinho a cada 16 a 38 s.
- **O que:** **widgets soltos**. Um widget solto é só dado (`nome`, `descricao`, `html`, `w`, `h`), guardado no aparelho (`mesa-soltos`), que roda isolado num iframe com `sandbox="allow-scripts"` (sem acesso à página nem ao PC) e fala com a casca por mensagens, pelo objeto `mesa` que a ponte põe dentro dele: `registrar({ estado, comandos })`, `estado()`, `pedir("<id>_<comando>", args)`, `ouvir`, `emitir`, `avisar`, `salvar`, `ler`. Criar, trocar e apagar acontecem na hora, sem remontar (`Mesa.criaSolto`, `Mesa.removeSolto`). Limites: id de 2 a 25 caracteres, html de 20 a 60.000, até 12 comandos por widget, estado relido a cada 2,5 s.
- **Visões:** arranjos com nome (widgets abertos e onde, apps hospedados, aparência e fundo): `Mesa.visao('salvar' | 'abrir' | 'apagar' | 'listar', nome)`.
- **Morador:** ferramentas `widget_criar`, `widget_fonte`, `widget_remover`, `mesa_visao`, `mesa_app`. Uma **mistura** é um widget criado por ele que chama os comandos dos outros com `mesa.pedir`.
- **Por quê:** cada app tem de ser uma peça solta e independente que o morador tira, põe, cria e combina em tempo real.
- **Testado:** no navegador: um widget criado em tempo real (contador) registrou o comando, respondeu ao comando, publicou o estado e escreveu nas Notas por `mesa.pedir`; salvar e abrir uma visão reabriu um widget fechado; console sem erro. **Não testado:** o Claude escrevendo um widget de verdade, e tudo no app instalado.
- **Ainda não:** os widgets de fábrica (Relógio, Notas, Estante) continuam montados junto com a casca; o passo seguinte é virarem soltos também.

## 2026-11-25 · Mesa 0.4
- **O que:** a Onda e a Órbita entram **originais**, como **hóspedes**: o HTML montado de cada app roda num iframe e recebe uma "janela de mentira" no lugar do host (`setBounds` move e redimensiona o iframe; as telas são a própria Mesa, em coordenadas de tela; arquivos, processos e menu passam direto pro host real; bandeja, ícone e atalho global são ignorados). O "clique passa" do app vira `pointer-events` no iframe, e a Mesa repassa o movimento do mouse pra ele acordar. Saem os widgets reescritos da 0.3. Montagem: marcador `APP:nome` (monta o app e embute) e a opção `-SemToqueDeTecla`.
- **Comandos do morador:** Onda pelo canal de arquivos dela (`~/.orbita`: `controlar`, `escolher`, `listar`); Órbita não tem canal, então `abrir_app` e `procurar_app` por fora.
- **Por quê:** trazer os apps sem mudar uma linha e continuar atualizando pelo repo.
- **Testado:** no navegador: os dois apps sobem dentro da Mesa (a Órbita encosta embaixo como doca, a Onda aparece solta), sem erro no console; com o mouse em cima, o iframe passa de `pointer-events: none` pra `auto`. **Não testado:** tudo no app instalado (arrastar os hóspedes, música e apps de verdade, mais de um hóspede com o clique-passa da Mesa).

## 2026-11-25 · Mesa 0.3
- **O que:** a **Onda** e a **Órbita** entram como widgets. Onda (`30-onda.js`): capa, cores da onda tiradas da capa, a onda de 3 camadas como barra de tempo (clique ou arraste pula), controles, e pela Web API do Spotify (se já conectado pela Onda) buscar e tocar e ler a fila; usa `onda/musica-helper.ps1`. Órbita (`40-orbita.js`): favoritos com o ícone de verdade (64 px, guardado), pontinho de aberto, busca nos apps instalados e anéis de CPU, RAM e placa a cada 2,5 s; usa `compartilhado/orbita-helper.ps1` só pra ler (`tick`, `apps`, `icon`), nunca `focus`, `key` ou `combo`. Núcleo: `ajudante(codigo)` (PowerShell persistente, protocolo de linhas) e o marcador `PS:` na montagem.
- **Cliques nos avisos do app:** as janelinhas do próprio app do Claude (liberar o Claude, permissões, "nova versão") ficavam sem clique, porque o mouse em cima delas não chega na página e a janela deixava o clique passar. Agora a Mesa segura os cliques enquanto pede uma permissão ou espera o Claude, por 12 s depois do atalho, e por 20 s pelo menu; o menu ganhou "Recarregar a Mesa".
- **Testado:** no navegador: os cinco widgets abrem e os doze comandos aparecem, sem erro no console. **Não testado:** tudo que depende do PC (capa, tempo, ícones, anéis) e o clique nos avisos, que só existem no app instalado.

## 2026-11-25 · Mesa 0.2
- **Morador em quatro patas:** pra se deslocar ele desce pra quatro patas (5 quadros, 11 fps, ~460 ms), corre de lado a 150 px/s (8 quadros, 13 fps) e levanta ao chegar (a mesma descida ao contrário); parado e conversando continua de pé. Pra esquerda, os clipes são espelhados.
- **O que:** widget **Apps** (lista os apps do menu Iniciar, favoritos, abre com um clique; comandos `abrir`, `favoritar`, `procurar`; sem tecla); widget **Estante** (ponte com a Estante Musical pelo barramento `~/.dengas`: estado, tocar, tom, andamento, trocar de música; comando `comando`); **aparência** comandável (`Mesa.aparencia`: cor de destaque, opacidade do vidro de 0,35 a 1, raio de 0 a 34 px, papel de parede em 2 ou 3 cores; ferramenta `mesa_aparencia` do morador); o morador reage sozinho quando a música muda (no máximo uma fala a cada 25 s) e anda até o widget que abre.
- **Por quê:** tudo na Mesa tem de ser personalizável e comandável pelo morador.
- **Testado:** no navegador por `localhost`: os cinco widgets abrem, os nove comandos aparecem, o comando de notas escreve, a aparência troca. **Não testado:** app instalado, abrir apps de verdade, a Estante respondendo, o Claude chamando as ferramentas.

## 2026-11-25 · Mesa 0.1 (piloto)
- **O que:** primeira versão. Quadro único do tamanho da área de trabalho; widgets com moldura, arrasto, embalo, encaixe na borda (26 px), alça na quina de dentro e forma por tamanho; barramento dentro da página; clique-passa com atraso de 140 ms; morador (Dengas) que anda, cai, senta, conversa e usa os comandos dos widgets como ferramentas do Claude. Widgets: Relógio (com cronômetro), Notas e Música (sessão de mídia do Windows).
- **Por quê:** ter uma base em que mover e encaixar funcionam igual no navegador e no app, e em que um assistente enxerga e comanda tudo.
- **Testado:** no navegador por `localhost`, com eventos de ponteiro na página. **Não testado:** app instalado, Claude e comandos do PC.
