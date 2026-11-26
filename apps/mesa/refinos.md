# Mesa — refinos

> Registro de cada refino da Mesa, do mais novo pro mais antigo ([modelo](../../templates/registro-de-refino.md)). Índice: [Mesa](README.md).

## 2026-11-25 · Mesa 0.5: a Mesa é uma casca
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
