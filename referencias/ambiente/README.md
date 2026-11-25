# Ambiente: o que roda por baixo dos apps

> L3 · referência. **O que é:** como o app Claude (o "host") cria a janela dos nossos apps e o que cada chamada de janela faz de verdade no Windows, com custos, atrasos e armadilhas. **Quando ler:** antes de mexer em hover, "clique passa", tamanho da janela, movimento ou no envio do [motor](../motor/README.md); e quando algo "só acontece no app instalado".

Pesquisa de 25/11/2026, feita **só lendo**: o pacote instalado do app Claude (6.28899.2, Windows), as typings do `desktop` (contrato 0.2.99), o código do Electron e do Chromium e a documentação da Microsoft. Depois a sonda rodou no app instalado: os números estão em [medicoes.md](medicoes.md) e corrigem alguns itens daqui (o atraso de 50–70 ms não existe). O que falta medir está marcado **(medir)** e é respondido pela [sonda](tempo-e-medicao.md#sonda-de-diagnóstico).

## Legenda de confiança

| Marca | Quer dizer |
|---|---|
| **(host)** | confirmado lendo o código do app Claude instalado |
| **(Electron)** / **(Chromium)** | confirmado no código-fonte ou na doc oficial deles |
| **(doc)** | documentado (Microsoft, MDN, spec, notas de versão) |
| **(inferido)** | dedução a partir dos itens acima, sem medida |
| **(medir)** | não dá pra saber sem rodar a sonda no app instalado |

## Arquivos

| Arquivo | O que tem |
|---|---|
| [host.md](host.md) | versões (Electron 45.3.3, Chromium 156), como a janela é montada, uma ida e volta por chamada, o que cada API faz por baixo, "sempre no topo", throttling, o observador de DOM do preload |
| [hover-e-clique-passa.md](hover-e-clique-passa.md) | como o "clique passa" e o `forward` funcionam no Windows, a corrida do clique, captura do ponteiro, diálogos do host, receita robusta |
| [mover-e-redimensionar.md](mover-e-redimensionar.md) | a trava real do host (um monitor, área útil, arredonda), a emenda dos monitores, mover × redimensionar, estratégias comparadas, DPI |
| [tempo-e-medicao.md](tempo-e-medicao.md) | rAF e vsync, throttling, tabela de atrasos, como medir no app instalado, a sonda, movimento reduzido |
| [medicoes.md](medicoes.md) | **números medidos no app instalado** pela sonda (vale mais que o inferido): tempo, redimensionar pela esquerda, trava, hover |
| [receitas-recomendadas.md](receitas-recomendadas.md) | o que mudar no motor e nos apps, em ordem, com por quê, ganho e risco |

## Os achados que mais mudam o trabalho

1. **A trava do host é por monitor, não pela tela inteira (host).** Cada `setBounds` vai pra área útil (`workArea`) do monitor que mais cruza o retângulo pedido. A janela **nunca** fica entre dois monitores: ao atravessar a emenda ela espera e depois pula a própria largura. O motor hoje prende pela união dos monitores, então na emenda motor ≠ real.
2. **O host nunca recusa por tamanho (host).** Grande demais é encolhido até a área útil. As recusas são `EBUSY` (minimizada, tela cheia, instalando, diálogo do host) ou `EINVAL` (chave extra, `NaN`, fora de ±100 000). Ele também arredonda tudo e impõe o mínimo de 40 × 40.
3. **Cada chamada é uma ida e volta ao processo principal do Claude, sem fila nem limite de taxa (host).** O atraso vem do processo principal ocupado (o mesmo dos três apps e do app inteiro), não de uma trava proposital.
4. **O `forward` no Windows é um gancho global de mouse (Electron).** Só repassa movimento, um evento por tarefa, nada de clique. Com o mouse parado não chega nada, mesmo que a forma ou a janela mudem embaixo dele. O Electron 45 já tem a reescrita que manda um `mouseleave` sintético; o `:hover` não fica mais preso.
5. **A corrida do clique existe (host, Electron).** Entre o mouse chegar na forma e a janela aceitar clique há 1 IPC. Um clique rápido atravessa pro app de baixo. O próprio Claude documenta isso no código dele.
6. **"Sempre no topo" é o nível `floating`, que no Windows fica atrás da barra de tarefas (host, Electron).** Com a barra do Windows oculta automaticamente (é o caso deste PC), ela sobe por cima dos apps encostados embaixo.
7. **Sem throttling nos três apps (host).** O host desliga o throttling enquanto o app segura um ícone na bandeja, um atalho global ou um processo. O rAF segue o vsync do **monitor principal** (Chromium).
8. **Redimensionar custa muito mais que mover (Chromium, inferido).** Mover não redimensiona nada no Chromium. Redimensionar passa por 4 saltos e mostra o quadro velho ancorado no canto de cima à esquerda até o novo chegar.
9. **`click` vai pro elemento que capturou o ponteiro (doc, desde o Chrome 136).** É a causa confirmada do botão que não respondia.

As mudanças em ordem estão em [receitas-recomendadas.md](receitas-recomendadas.md). Pela R24, cada uma entra primeiro num app piloto.
