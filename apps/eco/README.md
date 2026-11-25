# Eco — assistente

> **O que é:** o doc L2 do Eco, o assistente com uma marca líquida em WebGL. **Quando ler:** antes de criar, refinar ou depurar qualquer coisa do Eco. O comum a todos os apps está em [padroes/](../../padroes/README.md); aqui fica a visão geral e os links pros detalhes (tabela no fim). Pra fazer um app parecido, leia nessa ordem: este arquivo → [formas e degraus](formas-e-degraus.md) → [interação](interacao.md) → [marca WebGL](marca-webgl.md).

- **Conteúdo:** forma líquida em WebGL (com alternativa em 2D), campo de pergunta, sugestões, conversa. No degrau grande aparece o histórico de conversas. A interface é **só do Eco**: sem cartão de música e sem painel do PC.
- **Ferramentas:** abrir apps e pastas, controlar a música (pela Onda), ver o status do PC e os discos, pesquisar na web. O modelo é Claude Haiku 5.5, pela capability `sample`.
- **Formas por lado** ([padrão](../../padroes/layout-posicao-e-tamanho.md)), cada uma com a sua interação:
  - **Topo:** a ilha, fundida à borda e inclinando pro lado do mouse. É o padrão mínimo de qualidade dos apps.
  - **Laterais:** uma espinha que se desenrola atrás do mouse e vira uma folha alta.
  - **Embaixo:** uma barra de comando, com uma luz correndo atrás do mouse e a conversa em cartões.
  - **Cantos:** um quarto de órbita com um arco de sugestões que gira até o mouse.
  - **Solta:** a pílula flutuante (a marca olha pro mouse).
- **Voz:** desligada (`VOICE=false`). O ditado não funciona em janelas de app, e o whisper.cpp é bloqueado pelo Smart App Control.
- **Atalho:** `Alt + Shift + Espaço` abre e fecha; ele também é o que a Órbita aciona ao clicar no orbe.
- **Barramento:** publica `eco.json`.

## Como é feito (resumo)

A linguagem de movimento comum está em [padroes/motion](../../padroes/motion/README.md); o motor da janela, em [referencias/motor](../../referencias/motor/README.md) (o Eco só pluga o "sentir" e onde assentar).
- **Geometria calculada:** presa a uma borda, o JS calcula a forma de cada lado, estado e degrau em coordenadas de tela e escreve em variáveis CSS que andam na mesma mola. Trocar de lado ou de degrau só muda os alvos → [formas e degraus](formas-e-degraus.md).
- **Janela do tamanho do app:** 112 × 112 fechado; aberto, do tamanho do conteúdo, com teto de 70 % da altura útil e 60 % da largura útil; a conversa rola dentro → [teto de tamanho](formas-e-degraus.md#teto-de-tamanho-sem-sobra-de-área-vazia).
- **Colar e descolar:** a forma vira gota ao descolar e nasce de uma gota ao fundir; o limiar tem histerese de 16 px e soltar usa a mesma decisão da prévia → [interação](interacao.md#arrastar-descolar-e-fundir).
- **Hover e toque:** prévia por geometria (4 px pra entrar, 18 px pra sair), efeitos pequenos com mola, repouso vivo em cada lado → [interação](interacao.md).

## Testado

O teste é no simulador `sim.html?app=eco` (localhost, gancho `window.__eco`, relógio de 60 Hz, eventos de ponteiro em coordenadas de tela), nunca no mouse do PC (R19).
- **v24:** montado com o motor v2.2; a maior união durante as trocas de forma ficou em 742 px (69 %); o amassado no meio do arrasto chega a 9 % sem pular; os 21 testes de estresse do motor passam (2 pulados com um monitor só).
- **v23, a 1920 × 1080:** os dois degraus abertos em 8 lugares (laterais, topo, embaixo, dois cantos, solta em cima e embaixo): toda janela dentro do teto (a maior: folha lateral 742 px, 69 %); arrastar a partir de cada um desses 16 casos anda a janela (158 a 703 px), solta e reabre; com 10 mensagens a conversa rola dentro da forma e não invade o campo (0 px em 8 casos); oscilando em volta do limiar de encaixe, a prévia acende uma vez só e a forma para na borda acesa. Testes de estresse do motor: todos passam, menos `janelaGigante` (teste novo do motor, que força a janela a 1300 px pelo próprio motor).
- **v22:** prévia estável nos 5 lados (abre em ~40 ms com o mouse andando, nunca fecha sozinha, "clique passa" sem trocar). **v21:** cliques na marca, na forma em repouso e nas sugestões. **v19:** o repouso de cada lado e canto. **v15 a v17:** prévia e aberto de cada lado, as transições quadro a quadro.
- **Não testado:** tudo no app instalado (janela transparente de verdade, mouse real, 60 fps, dois monitores e DPI misto) e o ponto de resposta nova com uma resposta real do Claude.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [formas-e-degraus.md](formas-e-degraus.md) | estrutura, tabela forma × estado × degrau com os tamanhos, teto de tamanho, degraus e alça |
| [interacao.md](interacao.md) | prévia e repouso de cada lado, hover estável e efeitos de toque, arrastar, descolar e fundir (com a histerese) |
| [marca-webgl.md](marca-webgl.md) | L3: a marca líquida (raymarching SDF, ruído, gotas, material, estados) |
| [visual.md](visual.md) | vidro, forma presa, "pensando", conversa, penumbra, cores e fontes |
| [refinos.md](refinos.md) | registro de cada refino, com data e números |
