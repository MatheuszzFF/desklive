# Dengas — refinos

> Antes de ganhar pasta própria, o Dengas morava na Mesa: o histórico daquele tempo está em [apps/mesa/refinos.md](../mesa/refinos.md).

## 2026-11-27 · Pasta própria e Board
- **O que:** o código saiu de `modelos/mesa/widgets/00-dengas.js` pra `modelos/dengas/dengas.js`, com a arte em `modelos/dengas/arte/`. Entra no Board pelo `board.js` dele, igual ao da Mesa (o chat da Mesa ficou, a pedido).

## 2026-11-27 · Bolinha nos cantos e nas laterais
- **Pedido:** batendo ele num canto de baixo, ele não virava a bolinha.
- **O que:** solto ou arremessado perto de uma lateral (110 px, a posição projetada pelo embalo de 0,15 s), vira o disco de 64 px só com o rostinho (piscando, olhando, feliz, falando; recorte 52 × 52 do atlas a partir de 22, 24, como no Dengas do molde do Eco), com o anel coral, e gruda: canto se também estiver perto de cima ou de baixo, senão na lateral, na altura em que soltou. Puxou, volta a ser o ratinho inteiro. Na bolinha ele não passeia; balão e conversa saem dela.
- **Testado:** simulador (canto de baixo à direita, canto de baixo à esquerda, lateral direita, puxar de volta, clique abre a conversa). **Não testado:** no app instalado.

## 2026-11-27 · Mais calmo, baixo na mão, rabinho marrom e rosto preto
- **Pedido:** "ta mto agitado, as animacoes estao mto rapidas e repetitivas"; gracinhas só de vez em quando; idle paradinho; tocar baixo sem sacar e guardar toda hora; rabinho marrom como orelhas e patas; rosto todo preto, sem branco no queixo.
- **O que:** laço parado e sentado em 60 % da velocidade, com pausas de 1,8 a 5,2 s num quadro; gracinhas a cada 45 a 120 s, sem repetir a última; passeio a cada 50 a 120 s; sentado e quieto há 3 min, cochila (acorda com o mouse a menos de 220 px, clique ou fala). Baixo: estado `D.baixo` (salvo), saca uma vez (`t_baixo`), alterna tocar e segurar parado, guarda ao contrário; ferramenta `baixo` (pegar/guardar) pro Claude e chip "Bora tocar" / "Guardar o baixo".
- **Arte (sem geração):** o atlas foi repintado por script: rabo inteiro na rampa marrom das orelhas (todas as linhas), e o branco e o cinza do queixo, dos dentes e da garganta (olhando pra cima) viraram pelo preto. Bigodes e brilho dos olhos ficaram.
- **Testado:** simulador (sequência de quadros: parado com pausas, saca o baixo uma vez e fica tocando/segurando). **Não testado:** no app instalado, cochilo de 3 min.

## 2026-11-27 · Só lê o Board; Windows só com o sim do dono; diário em disco
- **Pedido:** "O dengas ta mexendo em coisa de fora do board, nao podemos permitir, ele tem q ler os widgets dele (mas nao impossibilite ele de executar coisas do windows)"; "tem q ter logs para troubleshouting do board". Contexto: o PC travou em 26/11 ~20h12 (driver AMD: LiveKernelEvent 117 e 1b0, IOMMU da GPU às 20h14).
- **O que:** `listar_janelas` barrado pro Dengas e pro agente das Janelas (não lê o que está fora do quadro). `trazer_janela`, `abrir_programa`, `fechar_programa` e `abrir_site` perguntam no chat ("Posso …?" Pode / Agora não, 60 s e cancelar = não). Regra nova no prompt.
- **Diário:** `~/.orbita/logs/board-AAAA-MM-DD.log` (JSON por linha, 7 dias): tudo do log() do Board, erros, pulso de 30 s (fps, quadros longos, memória, peças), "página parada N s", cada PowerShell da ponte (comando, ms, saída) e, do Dengas, o pedido, cada ferramenta (args, ms, resultado ou erro) e o que foi barrado, liberado ou negado. `Board.diario(fonte, nivel, texto, dados)` pra qualquer peça.
- **Testado:** simulador (barrado, negado, ferramenta normal e as linhas do diário). **Não testado:** gravação no disco (o simulador não grava) e o app instalado.

## 2026-11-27 · Ideias boiando em volta e iniciativa pelo Claude
- **Pedido (25/11):** "baloes de sugestões ao passar o mouse. Essas sugestoes flutuam em torno do dengas, e tem q ser sugestoes inteligentes sugeridas pelo claude"; "fazendo comentarios com base no que eu estou fazendo agora"; "Ele tem q me fazer perguntas".
- **O que:** passando o mouse nele (380 ms), três ideias boiam num leque em volta da cabeça, do lado com mais tela; na hora saem as do momento, e as do Claude (bolinha coral) chegam por cima, no máximo a cada 3 min. Clicou, vira pedido ("Bora tocar um baixo" saca o baixo). Iniciativa: quando abre widget, muda a música ou a cada 5 min, se o dono mexeu no mouse nos últimos 2 min, o Claude escreve um comentário ou pergunta curta (no máximo 1 a cada 12 min, ou "nada"); pergunta tem balão mais claro e, clicada, abre a conversa com ela. Só roda com o Claude já liberado (não abre o pedido de permissão sozinho). Tudo no diário.
- **Testado:** simulador (ideias locais, do Claude falso, leque na tela). **Não testado:** Claude de verdade, iniciativa no app instalado.
