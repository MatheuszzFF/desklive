# Glossário

> **O que é:** os termos do projeto, um por linha, com onde ler mais. **Quando ler:** ao topar com uma palavra que não conhece, ou pra achar o arquivo certo de um assunto (busque o termo aqui).

| Termo | O que é | Onde |
|---|---|---|
| **acordar por proximidade** | no degrau mínimo, os ícones reagem à distância do mouse numa curva de sino (crescem, ganham cor ou nascem de um ponto) antes de ele chegar | [degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md) |
| **alça** | o controle discreto que, puxado, troca o degrau de tamanho | apps/*/README.md, "Degraus e alça" |
| **barramento** | a pasta `~/.orbita`, por onde os apps trocam estado e comandos em arquivos | [interação entre apps](../padroes/interacao-entre-apps.md), [arquitetura](../padroes/arquitetura.md) |
| **commit atômico** | tamanho + deslocamento + CSS da janela aplicados juntos, só quando chega o `resize` | [janela sem tremer](../padroes/motion/janela-sem-tremer.md) |
| **degrau** | um tamanho do app (ex.: mínima, compacta, expandida, grande); cada um tem layout próprio em cada lado | [layout](../padroes/layout-posicao-e-tamanho.md) |
| **dreamer** | tarefa automática diária que transforma feedback em regras e copia as regras e três padrões pra este repo | [CLAUDE.md](../CLAUDE.md) |
| **feel** | como cada app traduz velocidade, levantar e amassado do motor em inclinar e esticar | [sentir o arrasto](../padroes/motion/sentir-o-arrasto.md) |
| **FLIP** | medir, trocar, medir de novo e animar a diferença; a Órbita troca de forma assim | [troca de forma](../padroes/motion/troca-de-forma.md) |
| **forma por lado** | a forma única que o app assume em cada borda e canto (doca, coluna, ilha, quarto de disco…) | [layout](../padroes/layout-posicao-e-tamanho.md), R20 |
| **forma-fantasma** | prévia do encaixe do Eco: uma forma que cresce do lado da borda durante o arrasto | [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **fusão / fundir** | o app encostado deixa de ser objeto solto e vira parte da borda da tela | [fusão com a borda](../padroes/motion/fusao-com-a-borda.md) |
| **helper** | processo PowerShell longo que faz o que a página não pode (foco, mídia, Spotify, medidor) | [arquitetura](../padroes/arquitetura.md) |
| **ilha** | a forma fundida à borda (a da Órbita é um `<svg>`; a do topo do Eco é o padrão mínimo de qualidade) | [apps/eco](../apps/eco/README.md), [apps/orbita](../apps/orbita/README.md) |
| **ilha dinâmica** | a Órbita fina em cima: só a hora e três pontinhos, que abre a partir do meio com o mouse em cima | [degrau mínimo da Órbita](../apps/orbita/degrau-minimo.md) |
| **marca** | a identidade viva de um app (a do Eco é a forma líquida em WebGL) | [marca WebGL](../apps/eco/marca-webgl.md) |
| **mola** | oscilador massa-mola (k, ζ) que move tudo; no CSS vira curva `linear()` | [motion](../padroes/motion/README.md), [molas](../referencias/motion/molas.md) |
| **motor** | `motor.js`, o mesmo nos três apps: física da janela, embalo, gesto, commit | [referencias/motor](../referencias/motor/README.md) |
| **ombros côncavos** | as curvas invertidas que ligam a forma à borda nas pontas | [fusão com a borda](../padroes/motion/fusao-com-a-borda.md) |
| **pescoço líquido** | a faixa que estica e afina entre a borda e o app ao descolar (Onda); no Eco vira uma gota | [fusão com a borda](../padroes/motion/fusao-com-a-borda.md) |
| **prévia** | o estado com o mouse em cima, entre o repouso e o aberto | [apps/eco](../apps/eco/README.md) |
| **refino** | qualquer mudança em forma, interação, motion, visual ou motor de um app; sempre documentado (R22) | [templates/registro-de-refino.md](../templates/registro-de-refino.md) |
| **sensor de borda** | o app sente o lado antes de encostar e já se reorganiza no arrasto | [sensor de borda](../padroes/motion/sensor-de-borda-e-encaixe.md) |
| **simulador** | `<app>-sim.html` em localhost, imitando o host, com ganchos `window.__orb/__onda/__eco` | [arquitetura](../padroes/arquitetura.md) |
| **solta** | o app longe de qualquer borda (pílula) | apps/*/README.md |
| **stagger** | entradas em sequência, uma peça depois da outra | [entradas em sequência](../padroes/motion/entradas-em-sequencia.md) |
