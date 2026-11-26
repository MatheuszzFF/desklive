# Modelo: Board

> **O que é:** o código do Board, o palco transparente em tela cheia (um por monitor) onde os mini apps vivem como peças, no estado do **Board v2**, do jeito que está publicado. A única peça por enquanto é a Sonda. **Quando ler:** você vai montar, instalar ou testar o Board, ou escrever uma peça pra ele. Como ele é feito e por quê: [board](../../referencias/ambiente/board.md). Índice: [modelos](../README.md).

## O que é

- **Um palco por monitor:** uma janela transparente, sempre no topo, do tamanho da área útil do monitor, com o clique passando. Ela nunca anda nem muda de tamanho (só quando o monitor muda). Os apps vivem dentro como **peças**, movidas só por `transform`, então não há quadro velho, briga com a trava do host nem tremida de janela.
- **Dois apps, um por monitor:** o host dá uma janela só por app e não instala o mesmo artefato duas vezes. Por isso o mesmo HTML vira **dois artefatos**: **Board** e **Board · monitor 2**. Cada um pega um monitor sozinho, e os dois conversam por `~/.orbita` (relay de named pipes, com arquivo atômico de reserva). Arrastando uma peça pela emenda, ela passa de um Board pro outro sem sumir.
- **A Sonda (primeira peça):** o painel de testes do Board (400 × até 760), com resumo ao vivo, as seções 1 a 8, log e Copiar/Salvar (`~/.orbita/sonda-board.json`). Recolhida, ela vira a forma do lado ou do canto em que está.
- **Afinação:** peça escondida de dev (molas ao vivo, câmera lenta, overlay e registro).
- **Estado:** posição, forma e "aberto" de cada peça, mais as molas afinadas, ficam em `~/.orbita/board-estado.json`.

## Arquivos

| Arquivo | O que é |
|---|---|
| [board-src.html](board-src.html) | o Board inteiro (shell, motor de motion, Telas, conexão, API aberta, Sonda e Afinação), com o manifesto de permissões no topo. Um marcador só, `/*PECAS*/`, onde entram os opcionais |
| [pecas/](pecas/) | os opcionais (assistente, Dengas…), um por pasta |
| [build.ps1](build.ps1) | grava `board.html` e `board-2.html` (só muda o `<title>`, que é o que diz qual Board é qual) e copia o simulador junto |
| [teste/](teste/) | o simulador: `teste-board.html` (dois Boards em iframes sobre um desktop falso, mouse virtual que imita o host), os cenários `testes.js`, `testes2.js` e `testes3.js`, e `servir.ps1` (servidor local na porta 8765) |
| [scripts/](scripts/) | as medições feitas no PC, fora do app: `telas.ps1` (monitores pelo Windows: posição física, DPI, Hz), `relay.ps1` (o relay de named pipes, igual ao embutido), `testa-relay.ps1`, `embutidos.ps1` (roda os trechos embutidos no HTML e mede), `pipe.ps1` e `canal.ps1` (latência de pipe e de arquivo com e sem rename) |

## Montar

```powershell
powershell -ExecutionPolicy Bypass -File modelos\board\build.ps1 [-Saida <pasta>] [-SemTeste]
```

Saída: `board.html` e `board-2.html` (padrão em `modelos/saida/`, fora do git), mais o simulador, se não passar `-SemTeste`.

## Publicar e instalar os dois

1. Peça ao Claude pra publicar **cada** HTML como um artefato separado, com `capabilities: { desktop: {} }`: `board.html` vira o "Board" e `board-2.html` vira o "Board · monitor 2". Com um monitor só, basta o primeiro.
2. Abra cada artefato no app Claude e escolha **Instalar como app** no menu com o nome dele.
3. Abra os dois pelo menu Iniciar e libere as permissões do manifesto: `overlay` (janela por cima), `full-access` (PowerShell, `~/.orbita`), `notifications`, `menu-bar` (bandeja) e `shortcuts` (atalhos globais).
4. Cada Board pega um monitor. Se os dois caírem no mesmo, o mais novo vai pro próximo monitor livre. A seção "Como usar" da Sonda e a linha "este app" dizem qual monitor é de qual.

Pra atualizar: monte de novo e republique **nos mesmos dois artefatos**.

## Atalhos e controles

- **Ctrl+Alt+B:** mostra e esconde as peças (avisa o outro Board).
- **Ctrl+Alt+Shift+B:** abre a Afinação (molas ao vivo e registro).
- **Clique direito numa peça:** menu (Sonda, Afinação, peças, Sair). O mesmo menu está na bandeja.
- **Sair:** pelo menu ou pela bandeja. Salva, solta o atalho e fecha. Fechar pela barra de tarefas também encerra.

## Testar sem instalar

Monte, rode o `servir.ps1` que foi copiado pra pasta de saída e abra `http://localhost:8765/`. O simulador põe os dois Boards sobre um desktop falso (dois 1920 × 1080 lado a lado, ou uma configuração mista com o monitor 2 a 1,5 e mais alto), imita o host, o disco e o clique-passa, e roda os cenários sem tocar no mouse do PC ([R19](../../regras/regras-de-trabalho.md)). Com `?b2` na URL, o segundo Board carrega o `board-2.html`.

## O que funciona e o que não foi testado

- **No app instalado:** a v1 rodou nos dois monitores. A v2 foi publicada nos dois artefatos, mas só foi provada no simulador em pixels físicos (configuração 1032/1080 e mista 1,5/144 Hz) e com leituras reais do PC (Telas e relay embutidos, canais).
- **Não testado no app instalado (v2):** relay pelo IPC do host, `fs` do host, CPU e GPU, rAF real, `pointerrawupdate`, vídeo quadro a quadro, Wallpaper Engine e o "tela cheia" do Windows.
- **Ainda não tem:** nenhum app de verdade como peça (a Onda é o próximo passo, em [board-pecas](../../referencias/ambiente/board-pecas.md#como-pôr-a-onda-dentro-próximo-passo)).
- **Riscos conhecidos:** diálogo do host travando o clique no monitor inteiro, foco que sai do app de baixo, custo por monitor. Lista completa em [board](../../referencias/ambiente/board.md#riscos).

## Quadro vazio, API aberta e opcionais

O Board não traz app nenhum: é um quadro vazio e completamente interativo. Qualquer um (uma peça, um assistente, o console) vê e mexe em tudo pela **API aberta**: `Board.mapa()`, `peca`, `mostrar`, `mover`, `degrau`, `comando`, `definir`, `remover`, `ouvir`, `anunciar`, `espacoLivre`. Peças declaram o que mostram e o que aceitam em `automacao`, e podem ter `furos`. O que cada pessoa põe no seu Board são **opcionais** (`pecas/<nome>/`), escolhidos na montagem com `-Pecas`; sem lista, sai o Board de sempre. Tudo em [pecas/README](pecas/README.md).

## Docs do Board

| Doc | O que tem |
|---|---|
| [board](../../referencias/ambiente/board.md) | o conceito, o que existe na v2, as typings, N monitores, guias de encaixe, passe entre Boards, riscos, a sonda e o fundo no Wallpaper Engine |
| [board-pecas](../../referencias/ambiente/board-pecas.md) | a API de peça (`Board.registrar`), camadas z, clique-passa e como pôr a Onda dentro |
| [board-motor](../../referencias/ambiente/board-motor.md) | o motor de motion: canais, molas por estado, passo fixo, entrada, ganchos, afinação e números |
| [board-telas](../../referencias/ambiente/board-telas.md) | o serviço Telas: host, Windows e vsync medido, e os espaços de coordenada |
| [board-conexao](../../referencias/ambiente/board-conexao.md) | a conexão entre Boards: canais medidos, relay, protocolo do passe e provas |
| [hover e clique passa](../../referencias/ambiente/hover-e-clique-passa.md) · [mover e redimensionar](../../referencias/ambiente/mover-e-redimensionar.md) | o host por baixo |
| [diário](../../diario/2026-11.md) | a história do Board, v1 e v2, com os números |

## Bom saber

- Nada pessoal no código: o Board lê os monitores de quem abre. O simulador usa monitores genéricos (1920 × 1080).
- Os dois HTMLs montados têm o mesmo conteúdo dos dois artefatos publicados da v2 (hash igual com o fonte em fim de linha LF; um clone com `core.autocrlf` troca só o fim de linha).
- Peça nova = um `Board.registrar({...})` a mais em `board-src.html`. O contrato está no comentário do topo do arquivo e em [board-pecas](../../referencias/ambiente/board-pecas.md).
