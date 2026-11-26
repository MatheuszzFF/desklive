# Glossário

> **O que é:** os termos do projeto, um por linha, com onde ler mais. **Quando ler:** ao topar com uma palavra que não conhece, ou pra achar o arquivo certo de um assunto (busque o termo aqui).

| Termo | O que é | Onde |
|---|---|---|
| **acordar por proximidade** | no degrau mínimo, os ícones reagem à distância do mouse numa curva de sino (crescem, ganham cor ou nascem de um ponto) antes de ele chegar | [degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md) |
| **alça** | o controle discreto que, puxado, troca o degrau de tamanho | apps/*/README.md, "Degraus e alça" |
| **análise quadro a quadro** | gravar a tela a 60 fps e rastrear o app em cada quadro (mediana de fundo, caixa e centroide) pra achar piscada, pulo ou tremida; é a prova da R25 | [como medir](../referencias/ambiente/como-medir.md#3-vídeo-quadro-a-quadro) |
| **área útil** | a `workArea` de um monitor (a tela menos a barra do Windows fixa); é nela que o host prende a janela, um monitor de cada vez | [mover e redimensionar](../referencias/ambiente/mover-e-redimensionar.md) |
| **balão** | o nome, número ou aviso que aparece com o mouse em cima (tooltip); um só por app, numa camada por cima de tudo | [hover e balões](../padroes/hover-e-baloes.md) |
| **barramento** | a pasta `~/.orbita`, por onde os apps trocam estado e comandos em arquivos | [interação entre apps](../padroes/interacao-entre-apps.md), [arquitetura](../padroes/arquitetura.md) |
| **Board** | (v2) uma janela transparente, sempre no topo e do tamanho da área útil por monitor, com os apps dentro como peças movidas só por `transform`; um app instalado por monitor; API de peça e motor próprios; instalado como "Board" e "Board · monitor 2" | [board](../referencias/ambiente/board.md), [peças](../referencias/ambiente/board-pecas.md), [motor](../referencias/ambiente/board-motor.md) |
| **Telas (Board)** | o serviço do Board que junta host, Windows e o vsync medido de cada monitor; a fonte da verdade de geometria, pixel físico e Hz | [board-telas](../referencias/ambiente/board-telas.md) |
| **Passe (Board)** | a troca de dono de uma peça entre Boards: oferta, aceite, liberação ou cancelamento, com época | [board-conexao](../referencias/ambiente/board-conexao.md) |
| **"clique passa"** | fora da parte visível, o clique vai pra área de trabalho (`setIgnoreMouseEvents` com `forward`); liga com atraso e nunca com o botão pressionado | [hover e balões](../padroes/hover-e-baloes.md), [arquitetura](../padroes/arquitetura.md) |
| **commit atômico** | tamanho + deslocamento + CSS da janela aplicados juntos, só quando chega o `resize` | [janela sem tremer](../padroes/motion/janela-sem-tremer.md) |
| **degrau** | um tamanho do app (ex.: mínima, compacta, expandida, grande); cada um tem layout próprio em cada lado | [layout](../padroes/layout-posicao-e-tamanho.md) |
| **diário técnico** | o registro datado de toda mudança de movimento, tamanho ou hover: o que mudou, por quê, números e como foi provado (R26) | [diario/](../diario/README.md) |
| **dreamer** | tarefa automática diária que transforma feedback em regras e copia as regras e três padrões pra este repo | [CLAUDE.md](../CLAUDE.md) |
| **embalo** | ao soltar, a janela continua andando com a velocidade do arrasto e para com atrito, sem passar do ponto | [motor de movimento](../referencias/motor/motor-de-movimento.md) |
| **feel** | como cada app traduz velocidade, levantar e amassado do motor em inclinar e esticar | [sentir o arrasto](../padroes/motion/sentir-o-arrasto.md) |
| **FLIP** | medir, trocar, medir de novo e animar a diferença; a Órbita troca de forma assim | [troca de forma](../padroes/motion/troca-de-forma.md) |
| **forma por lado** | a forma única que o app assume em cada borda e canto (doca, coluna, ilha, quarto de disco…) | [layout](../padroes/layout-posicao-e-tamanho.md), R20, [guia, passo 3](../guia/03-forma-por-lado.md) |
| **forma-fantasma** | prévia do encaixe do Eco: uma forma que cresce do lado da borda durante o arrasto | [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **fusão / fundir** | o app encostado deixa de ser objeto solto e vira parte da borda da tela | [fusão com a borda](../padroes/motion/fusao-com-a-borda.md) |
| **gancho** | o objeto de teste `window.__<app>` no simulador: lê o estado e simula o mouse sem tocar no PC | [arquitetura](../padroes/arquitetura.md), [guia, passo 6](../guia/06-testar-sem-mexer-no-pc.md) |
| **gesto** | a máquina de estados do mouse no motor: parado → pressionado → arrastando → soltando → assentando | [motor de movimento](../referencias/motor/motor-de-movimento.md) |
| **guia** | o passo a passo pra fazer o seu próprio app no estilo do projeto | [guia/](../guia/README.md) |
| **halo de aproximação** | faixa estreita em volta da forma onde o "clique passa" já desliga, pra a janela aceitar o clique antes do mouse chegar | [hover e clique passa](../referencias/ambiente/hover-e-clique-passa.md) |
| **helper** | processo PowerShell longo que faz o que a página não pode (foco, mídia, Spotify, medidor) | [arquitetura](../padroes/arquitetura.md) |
| **histerese** | entrar ou trocar com um limite e sair ou voltar com outro mais folgado, pra não piscar na fronteira (hover, lado, degrau) | [hover e balões](../padroes/hover-e-baloes.md), [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **ilha** | a forma fundida à borda (a da Órbita é um `<svg>`; a do topo do Eco é o padrão mínimo de qualidade) | [apps/eco](../apps/eco/README.md), [apps/orbita](../apps/orbita/README.md) |
| **ilha dinâmica** | a Órbita fina em cima: só a hora e três pontinhos, que abre a partir do meio com o mouse em cima | [degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md) |
| **ímã** | o puxão que encaixa o app na borda, no canto ou no meio da borda; só age ao soltar | [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **marca** | a identidade viva de um app (a do Eco é a forma líquida em WebGL) | [marca WebGL](../apps/eco/marca-webgl.md) |
| **marcador** | comentário no `*-src.html` de um modelo (`/*MOTOR*/`, `/*HELPER*/''`…) que o `build.ps1` troca pelo motor, pelos helpers ou pelos ícones na **montagem** | [modelos](../modelos/README.md) |
| **matriz de formas** | a tabela lugar × degrau × estado (repouso, prévia, aberto) que todo app preenche, cada célula com forma e interação próprias | [modelo de app](../templates/novo-app.md), [guia, passo 3](../guia/03-forma-por-lado.md) |
| **modelo (código)** | o código-fonte limpo de um app em `modelos/<app>/`, pronto pra montar num HTML só e publicar; não confundir com os modelos de doc de `templates/` | [modelos](../modelos/README.md) |
| **modo de registro (trace)** | o app grava, por quadro, mouse, gesto, janela pedida e real, clique-passa e o erro do ponto de pega, e salva em `~/.orbita/<app>-trace.json` | [como medir](../referencias/ambiente/como-medir.md#2-modo-de-registro-trace-no-app) |
| **mola** | oscilador massa-mola (k, ζ) que move tudo; no CSS vira curva `linear()` | [motion](../padroes/motion/README.md), [molas](../referencias/motion/molas.md) |
| **motor** | `motor.js`, o mesmo nos três apps: física da janela, embalo, gesto, commit | [referencias/motor](../referencias/motor/README.md) |
| **motor-piloto** | a cópia do motor com as receitas do ambiente, só na Onda, antes de ir pros outros apps (R24) | [motor-piloto](../referencias/motor/motor-piloto.md) |
| **ombros côncavos** | as curvas invertidas que ligam a forma à borda nas pontas | [fusão com a borda](../padroes/motion/fusao-com-a-borda.md) |
| **palco** | janela aberta do tamanho da área útil durante o gesto, com o app andando só por CSS dentro dela (proposta, ainda não usada) | [mover e redimensionar](../referencias/ambiente/mover-e-redimensionar.md), [receitas](../referencias/ambiente/receitas-recomendadas.md) |
| **pega (área de pega)** | o lugar visível de onde se move o app, com textura e cursor de mão, separado dos gestos (girar, deslizar) | [hover e balões](../padroes/hover-e-baloes.md) |
| **pescoço líquido** | a faixa que estica e afina entre a borda e o app ao descolar (Onda); no Eco vira uma gota | [fusão com a borda](../padroes/motion/fusao-com-a-borda.md) |
| **ponto de pega** | o ponto exato da peça que o mouse pegou; tem de ficar embaixo do ponteiro (≤ 2 px) mesmo quando a forma muda no meio do arrasto | [ponto de pega](../padroes/motion/ponto-de-pega.md) |
| **portal da emenda** | como atravessar de monitor sem pulo: o conteúdo passa por trás da emenda, porque a janela nunca fica entre dois monitores (no motor-piloto da Onda desde a v20) | [mover e redimensionar](../referencias/ambiente/mover-e-redimensionar.md), [motor-piloto](../referencias/motor/motor-piloto.md) |
| **prévia** | o estado com o mouse em cima, entre o repouso e o aberto | [apps/eco](../apps/eco/README.md) |
| **prévia do encaixe** | durante o arrasto, o app acende onde pararia se soltasse agora (contorno na Órbita, forma-fantasma no Eco) | [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **quadro velho** | ao redimensionar, até o `resize` chegar (~16 ms) o Windows mostra o quadro anterior ancorado no canto de cima à esquerda; pela esquerda ou por cima, o conteúdo "anda" 1–2 quadros | [nada pisca](../padroes/motion/janela-sem-tremer.md#nada-pisca-r25), [medições](../referencias/ambiente/medicoes.md) |
| **refino** | qualquer mudança em forma, interação, motion, visual ou motor de um app; sempre documentado (R22) | [templates/registro-de-refino.md](../templates/registro-de-refino.md) |
| **repouso** | o app parado, sem o mouse em cima; no degrau mínimo ele continua vivo (respira, pisca, sente o mouse chegando) | [apps/eco](../apps/eco/README.md), [degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md) |
| **sensor de borda** | o app sente o lado antes de encostar e já se reorganiza no arrasto | [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **simulador** | `<app>-sim.html` em localhost, imitando o host, com ganchos `window.__orb/__onda/__eco` | [arquitetura](../padroes/arquitetura.md), [guia, passo 6](../guia/06-testar-sem-mexer-no-pc.md) |
| **solta** | o app longe de qualquer borda (pílula) | apps/*/README.md |
| **sonda** | página de diagnóstico, local e não publicada, que instalada como app mede no host os atrasos de `setBounds`, a trava, o rAF, o hover e a corrida do clique | [como medir](../referencias/ambiente/como-medir.md#1-a-sonda), [medições](../referencias/ambiente/medicoes.md) |
| **stagger** | entradas em sequência, uma peça depois da outra | [entradas em sequência](../padroes/motion/entradas-em-sequencia.md) |
| **teste de estresse** | teste do motor no simulador (dois monitores, `setBounds` com atraso) que repete um bug conhecido e confere que ele não volta | [bugs evitados](../referencias/motor/bugs-evitados.md), [guia, passo 6](../guia/06-testar-sem-mexer-no-pc.md) |
| **trava da tela** | o host não deixa a janela sair da **área útil do monitor que mais a cruza** (nunca fica entre dois); o motor imita isso só enquanto arrasta (hoje pela união das telas, ver [receita M1](../referencias/ambiente/receitas-recomendadas.md#movimento)) | [janela sem tremer](../padroes/motion/janela-sem-tremer.md), [mover e redimensionar](../referencias/ambiente/mover-e-redimensionar.md) |
