# Board: a conexão entre Boards

> L3 · referência. Índice: [ambiente](README.md) · telas em [board-telas](board-telas.md) · peças em [board-pecas](board-pecas.md). **O que é:** a análise dos canais entre dois apps do host (medidos), o escolhido, o protocolo do passe à prova de falhas e a linha do tempo comum (pixels e Hz). **Quando ler:** antes de mexer no barramento, no passe pela emenda ou no fantasma.

## Canais medidos (PC dele, 26/11/2026; PowerShell imitando o que o Node do host faz)

| Canal | Latência ida | Problema | Custo |
|---|---|---|---|
| arquivo, escrita direta, polling 12 ms | p50 7,9 · p95 13,9 · máx 42 ms | **32 de 487 leituras pela metade (6,6 %)** | ~1 % da CPU (PowerShell lendo) |
| arquivo, **tmp + rename** (`MoveFileEx` com troca, o que o `fs.rename` do Node faz), polling 12 ms | p50 7,1 · p95 13,5 · máx 40 ms | 0 leituras quebradas; **2 de 400 renames falharam** com o arquivo aberto pelo leitor → precisa repetir | ~1 % |
| arquivo, tmp + rename, polling 4 ms | p50 3,6 · p95 6,7 · máx 27 ms | idem | ~1,6 % |
| **named pipe** entre dois processos | p50 **0,03** · p95 0,07 ms | — | ~0 parado (bloqueia esperando) |
| relay de pipes **embutido no Board** (dois PowerShell residentes, `-EncodedCommand`) | p50 **0,056** · p95 0,099 · máx 118 ms (só a 1ª conexão) | partida ~1,2 s | 2 processos residentes |
| BroadcastChannel / localStorage | < 1 ms | só na **mesma origem**: cada artefato tem a sua, então não cruza Board ↔ Board 2 no host | — |

**Escolha (por par, automática):** BroadcastChannel quando os dois estão na mesma origem (no simulador) → **relay de named pipes** (push, sem polling; o host dá `childProcess.spawn` com stdout em fluxo e `stdin.write`) → arquivo com tmp + rename, 3 tentativas e escrita direta de último recurso (12 ms quente, 120 ms parado, uma caixa por par `board-caixa-<para>-<de>.json`). O relay que não acha o par avisa (`semPar`) e aquele par vai 10 s pelo arquivo. Texto não-ASCII viaja escapado (`\uXXXX`).

## Protocolo do passe

- **Oferta:** o dono solta a peça no monitor do outro (ou encaixa numa borda de lá) → a peça fica "passando" e cada mensagem leva `oid`, a **época** (+1), a pose, o alvo e os dados.
- **Aceite:** o outro adota (mesmo elemento do fantasma, mesma pose) e repete o `oid` nos acks.
- **Liberação:** o dono apaga a sua cópia e repete o `oid` nos libs; não renasce do próprio estado salvo por 6 s (`cedidas`).
- **Cancelamento:** sem aceite em 1,5 s (ou o par sumiu) → cancela, a peça volta com época **maior**; quem tinha adotado sem liberação devolve.
- **Estado inteiro em toda mensagem** (com `seq`; a mais velha é descartada): perder ou sobrescrever uma mensagem não quebra o passe. Com oferta ou sinal pendente, a mensagem sai de novo a cada 200 ms.
- **Duplicata** (dois Boards abrindo juntos, corrida): fica a época maior; empate, o Board mais antigo.
- **Par sumiu** (fechou ou travou): os fantasmas dele somem, o que eu adotei dele é meu, e as peças que eu tinha passado pra ele podem ser reivindicadas do meu estado salvo.

## Linha do tempo comum (pixels e Hz)

- Toda pose viaja em **pixel físico**, com o instante em que **aparece** na tela de quem manda (`tq` = tempo do rAF + 1 quadro, em `performance.timeOrigin + now`, fração de ms e comparável entre processos).
- O fantasma desenha a pose **no instante em que o MEU quadro aparece**: extrapola pela velocidade da peça (já freada pela parede e zerada se a entrada parou) até o meu próximo vsync, com teto de 1,5 × a latência p95 (30–120 ms).
- O fantasma usa a **mesma matriz** do dono (levantar, inclinar, esticar) e o mesmo tamanho físico (k = escala dele ÷ minha). Na adoção, a peça continua dessa pose e assenta no tamanho daqui com mola.
- Física em passo fixo de 240 Hz, render interpolado no vsync de cada monitor: a mesma velocidade dos dois lados a 60, 120 ou 144 Hz.

## Provas (simulador, 26/11/2026)

| Teste | Resultado |
|---|---|
| 8 passes seguidos, BroadcastChannel | 9 ofertas = 9 aceites = 9 liberações, 0 cancelados, 1 cópia; latência p50 0,3 · p95 0,9 ms |
| 8 passes seguidos, só arquivo | 8 = 8 = 8; **no máximo 1 dono em 1604 amostras, nunca 0**; p50 11,5 · p95 17,9 · máx 22,4 ms; 0 lidas quebradas, 0 fora de ordem |
| fechar o Board 2 15 ms depois de soltar (antes do aceite) | a oferta cancela quando o batimento dele some; a Sonda volta pro Board 1 em 1,0 s; 1 cópia |
| fechar o Board 2 400 ms depois (depois do aceite) | o Board 1 reivindica do estado salvo em 0,3 s; 1 cópia |
| os dois abrindo juntos | cada um num monitor; nunca mais de 1 Sonda |
| metades na emenda, monitor 2 a 1,5 e 144 Hz, BroadcastChannel | erro entre as duas metades p50 0,30 · p95 0,97 · máx 3,8 px físicos; tremida parado **0** dos dois lados |
| idem, só arquivo | p50 0,35 · p95 2,9 · máx 15 px (na largada, quando a velocidade muda); parado 0 |

**Falta no app instalado:** a latência real do relay pelo IPC do host (`spawn` → stdout), o arquivo pelo `fs` do host e o comportamento com o PC ocupado. A leitura do Windows e o relay foram provados no PC dele, fora do host.
