# Padrões transversais (L1)

O que vale pra **todos** os apps. Leia o que tocar a sua tarefa antes de abrir a pasta do app.

| Arquivo | O que tem | Quando ler |
|---|---|---|
| [layout-posicao-e-tamanho.md](layout-posicao-e-tamanho.md) | o que todo app tem: layout por lado, canto e degrau, física, janela do tamanho do conteúdo | sempre que criar ou mudar forma, tamanho ou posição |
| [interacao-entre-apps.md](interacao-entre-apps.md) | o barramento `~/.orbita`, grudar, não sobrepor, arrastar entre apps, reagir juntos, modos | quando um app fala com outro |
| [hover-e-baloes.md](hover-e-baloes.md) | balão único por cima de tudo, hover estável (histerese, "clique passa" com atraso), clique em botão dentro de arrasto, nada selecionável, janela que cabe na tela | qualquer balão, hover, botão ou clique |
| [design.md](design.md) | transparente, minimalista, motion vivo, nada genérico | qualquer mudança visual |
| [motion/](motion/README.md) | a linguagem de motion: princípios, fusão com a borda, sentir o arrasto, sensor, troca de forma, janela sem tremer e nada pisca (R25), ponto de pega | qualquer coisa que se mexe |
| [arquitetura.md](arquitetura.md) | runtime: janela do host, helpers PowerShell, barramento, rede, testes | janela, helper, rede, simulador |

**Espelhos do dreamer:** `layout-posicao-e-tamanho.md`, `interacao-entre-apps.md` e `design.md` são copiados todo dia da memória do Claude pela tarefa automática "dreamer" (por isso começam sem título e usam links `[[...]]` da memória). **Não edite esses três à mão**: a próxima cópia apaga a edição. Conhecimento novo vai pros outros arquivos (motion, arquitetura, apps) ou pra regra na memória.

`motion.md` solto nesta pasta é só um ponteiro pra [motion/](motion/README.md).
