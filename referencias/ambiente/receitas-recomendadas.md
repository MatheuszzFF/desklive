# Receitas recomendadas: controle fino de hover, tamanho e movimento

> L3 · referência. Índice: [ambiente](README.md). **O que é:** as mudanças no motor e nos apps que saem desta pesquisa, em ordem dentro de cada área, com o porquê, o ganho esperado e o risco. **Quando ler:** antes de planejar a próxima versão do [motor](../motor/README.md) ou uma rodada de hover. **Pela R24, cada receita entra primeiro num app piloto, é aprovada no app instalado e só depois vai pros outros.**

Antes de tudo, **rode a [sonda](tempo-e-medicao.md#sonda-de-diagnóstico) uma vez no app instalado** (passo 0). Ela troca as estimativas pelos números de verdade e decide se vale o M3. Sugestão de piloto: a **Onda**, que tem as janelas maiores, o hover mais sensível (a capa) e degraus.

## Movimento

| # | Receita | Por quê | Ganho esperado | Risco |
|---|---|---|---|---|
| M1 | **Trava do motor igual à do host.** Um monitor (o de maior interseção), a `workArea` dele, `Math.round`, mínimo de 40. O teto por eixo é a área útil desse monitor, nunca a soma | hoje o motor prende pela união dos monitores e pela `bounds`: na emenda, motor ≠ real ([trava](mover-e-redimensionar.md#a-trava-real-do-host)) | some a zona morta não modelada da emenda; o `over` e o escorregar na parede passam a bater com a realidade; menos `hostFix` | baixo: troca uma função |
| M2 | **Emenda como portal** | a janela não pode ficar entre dois monitores; hoje ela espera e pula a própria largura (Eco 112 px, Onda grande centenas) | atravessar de monitor sem pulo seco (R7) | médio: precisa de deslocamento e corte do conteúdo e de 1 quadro escondido na troca |
| M3 | **Palco no gesto.** Ao virar arrasto, a janela vira a área útil do monitor (1 commit); o arrasto e o embalo andam só por `transform` no rAF; ao assentar, a janela volta ao tamanho do conteúdo (1 commit) | tira o IPC e o atraso de 3–4 quadros do caminho do mouse: o movimento sai no mesmo quadro do evento, sem depender do processo principal | arrasto colado no mouse a 60 fps; fim dos 28–38 % de quadros com a janela parada | médio-alto: dois redimensionamentos por gesto (esconder o quadro velho), oclusão de outros apps Chromium enquanto o palco está aberto, uma janela mais por app no DWM. Decidir depois da sonda |
| M4 | **Pausar o IPC não essencial durante o arrasto** (barramento, releitura de telas, helpers que não são de mídia) | tudo divide a mesma fila do processo principal | menos trancos ocasionais | quase nenhum |
| M5 | **Releitura de telas pelo `change` do `window.screen`** em vez de a cada 3–5 s | sem IPC parado; reage na hora a monitor ligado ou desligado | pequeno, e menos trabalho parado | baixo (medir se o evento dispara no host) |

## Tamanho

| # | Receita | Por quê | Ganho | Risco |
|---|---|---|---|---|
| T1 | **Nunca redimensionar no meio de um movimento.** União antes e encolher depois em toda troca (já nas trocas de forma); no arrasto, só com o palco (M3) | cada redimensionamento custa 4 saltos e mostra o quadro velho | fim da tremida no meio das animações | baixo |
| T2 | **Manter o canto de cima à esquerda parado** quando der: crescer e encolher pela direita e por baixo. Quando a borda esquerda ou de cima precisa andar, fazer isso com a área que pula vazia, ou com o conteúdo escondido por 1 quadro | o quadro velho fica ancorado nesse canto até o novo chegar | o encolher depois deixa de dar o "tic" final | baixo-médio (medir os quadros na sonda) |
| T3 | **No máximo um commit de tamanho a cada ~100 ms**; posição pode ir todo quadro | mover é barato, redimensionar não | menos fila e menos `resize` encavalado | baixo |
| T4 | **Teto da união de uma troca = área útil de um monitor** (corrige o `fitRect`) | o host encolhe pra um monitor só | evita CSS maior que a janela | baixo |

## Hover

| # | Receita | Por quê | Ganho | Risco |
|---|---|---|---|---|
| H1 | **Halo de aproximação** de `clamp(12, v × 0,05 s, 32)` px: o "clique passa" desliga ao entrar na faixa | ganha a corrida do clique; o IPC termina antes do dedo descer | fim do clique que "atravessa" na primeira tentativa | baixo: uma faixa estreita em volta da forma deixa de passar o clique pra área de trabalho |
| H2 | **Ressincronizar pelo cursor real** (`getCursorScreenPoint`) após cada troca de forma, de degrau ou de lugar, mais um vigia de 4–5 Hz enquanto "dentro" | com o `forward`, mouse parado não gera evento; a forma muda embaixo e o estado fica velho | fim do hover que fica aceso ou apagado errado depois de uma animação | baixo: 1 IPC por troca |
| H3 | **Um controlador único do "clique passa"**: estado desejado, no máximo 1 pedido em voo, coalescer, nunca com botão pressionado, atraso de 140–160 ms pra ligar | hoje cada app tem o seu, com detalhes diferentes | menos piscadas e nenhuma ida e volta no mesmo quadro | baixo |
| H4 | **Menos mutações de DOM por quadro** (variáveis num elemento só) e nunca `app-region` | o preload do host observa toda mutação | menos lixo e trabalho por quadro | nenhum |
| H5 | **`matchMedia(...).onchange`** pro movimento reduzido | o Windows muda isso ao vivo | respeita a preferência sem reiniciar | nenhum |

## O que NÃO fazer

- Esperar a volta de cada `setBounds` antes de mandar o próximo. Isso foi o v2: ~15 movimentos por segundo.
- Mandar `setOptions` com valores diferentes a cada abertura: a janela é reconstruída e a página recarrega.
- Usar o `:hover` do CSS pra decidir o "clique passa" de uma forma que muda de tamanho.
- Capturar o ponteiro no pressionar (o `click` vai pro capturador).
- Contar com uma "recusa" de `setBounds` pra saber se cabe: ela não existe; o host encolhe calado.
