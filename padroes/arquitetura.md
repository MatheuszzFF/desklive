# Arquitetura

> **O que é:** como os apps funcionam por dentro: janela do host, helpers em PowerShell, barramento `~/.orbita` e testes. **Quando ler:** antes de mexer em janela, helper, rede, barramento ou simulador. É L1 (vale pra todos os apps).

## Base: artefato como app de desktop
Cada app é um artefato HTML publicado no claude.ai, com a capability `desktop`, e instalado pelo app Claude como um app de desktop.
- **Janela:** sem moldura, transparente, sempre no topo (`window.setOptions`). Posição e tamanho por `setBounds`/`getBounds`. Fora da parte visível, o clique passa pra área de trabalho (`setIgnoreMouseEvents(true, {forward:true})`).
- **Monitores:** `screen.getAllDisplays()`.
- **A janela tem só o tamanho do app.** O host prende a janela dentro da **área útil de um monitor só** (o que mais cruza a janela), então uma área transparente sobrando impediria de encostar nas bordas e nos cantos. A regra exata, o que cada chamada faz por baixo e os custos estão em [referencias/ambiente](../referencias/ambiente/README.md).
- **Teclado:** a janela só recebe o teclado depois do próprio atalho global ou de um menu.
- **Rede:** a página não faz `fetch` pra rede. Bibliotecas vêm por CDN, e chamadas externas (como a API do Spotify) passam pelos helpers.

## Helpers (PowerShell)
Processos longos abertos por `childProcess.spawn`, com `-EncodedCommand`. Conversam por linhas no formato `id comando argumento` → `id resultado`.
- **orbita-helper:**
  - foco de janelas e atalhos de teclado;
  - CPU, RAM e temperatura da placa de vídeo (`nvidia-smi`, com cache);
  - ícones, discos.
- **musica-helper:**
  - controle de mídia do Windows (estado, capa, tocar, pular, avançar);
  - API do Spotify (PKCE, renovação de token).
- **meter:** pico do áudio que sai do PC (pela API de medição de áudio do Windows).

O Smart App Control fica **ligado**, então nada de binários sem assinatura: só APIs do Windows e código dentro da página.

## Barramento entre apps: `~/.orbita`
- `<app>.json`: o estado publicado por cada app (o `musica.json` tem renovação a cada ~2,5 s).
- `<app>-cmd/` e `<app>-res/`: comandos e respostas. Escreve num arquivo tmp e depois renomeia.
- `eco-ancora.json`: a posição da barra.
- Latência de 100 a 300 ms: serve pra estado e comandos, não pra animação quadro a quadro.
- **Tokens nunca entram neste repositório.**

## Testes
Simuladores (`*-sim.html`) servidos por localhost, que imitam o host e a trava da janela dentro da tela, com os ganchos `window.__orb`, `window.__onda` e `window.__eco`. Nunca controlar o mouse ou o teclado do PC (regra R19).
