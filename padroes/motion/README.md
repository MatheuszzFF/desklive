# Linguagem de motion (L1)

Como a Órbita, a Onda e o Eco se mexem: as molas, as curvas, os tempos, a fusão com a borda, o descolar líquido, o esticar no arrasto, o sensor de borda e a troca de forma sem a janela tremer. Os números saem do código atual. Serve pra recriar o mesmo nível em qualquer app novo. Não é pra copiar a interface de um app no outro: cada app tem forma e interação próprias (R20).

> Leia junto: [layout-posicao-e-tamanho.md](../layout-posicao-e-tamanho.md) (o que cada app precisa ter) e [design.md](../design.md) (o visual). Aqui fica o **como**. As tabelas de números ficam no L3: [referencias/motion](../../referencias/motion/README.md). O motor da janela fica em [referencias/motor](../../referencias/motor/README.md).

## Princípios

1. **Mola de verdade, não duração fixa.** Tudo que anda no JS é um oscilador massa-mola (massa 1) integrado a cada quadro. No CSS, a curva `linear()` é a resposta dessa mesma mola, amostrada ([curvas e durações](../../referencias/motion/curvas-e-duracoes.md)).
2. **Um laço por quadro (`requestAnimationFrame`)**, com `dt` limitado a 1/30 s (a Onda usa 1/20 s). Com isso, um quadro atrasado não gera um salto. A integração é Euler semi-implícito, com 3 ou 4 subpassos por quadro.
3. **O alvo muda e a mola só persegue.** Trocar de lado, de degrau ou de estado mexe só nos alvos. Nada é "cancelado e reiniciado", e uma animação no meio do caminho continua de onde estava.
4. **Parou, desliga.** Cada laço se desliga quando posição e velocidade ficam abaixo de um limiar. Nada fica rodando em repouso, a não ser o que é vivo de propósito: a onda e a marca do Eco.
5. **Crescer na hora, encolher depois.** Isso vale pra janela, pra ilha da Órbita e pra caixa da Onda ([janela sem tremer](janela-sem-tremer.md)).

Fórmula comum (todos os apps):

```
a = k·(alvo − x) − c·v      c = 2·√k·ζ      (ζ = razão de amortecimento)
v += a·h ;  x += v·h        h = dt / n_subpassos
```

## Arquivos

| Arquivo | O que tem | Antiga seção do `motion.md` |
|---|---|---|
| [entradas-em-sequencia.md](entradas-em-sequencia.md) | stagger: a ordem e os atrasos de cada app | 4 |
| [fusao-com-a-borda.md](fusao-com-a-borda.md) | ombros côncavos e o descolar líquido (pescoço, gota) | 5 e 6 |
| [sentir-o-arrasto.md](sentir-o-arrasto.md) | inclinar, esticar, levantar e amassar (o `feel` de cada app) | 7 |
| [sensor-de-borda-e-encaixe.md](sensor-de-borda-e-encaixe.md) | sentir o lado antes de encostar, ímã, prévia, limiares do gesto | 8 |
| [troca-de-forma.md](troca-de-forma.md) | como uma forma vira a outra ao trocar de lado (FLIP, molas, variáveis CSS) | 9 |
| [janela-sem-tremer.md](janela-sem-tremer.md) | redimensionar a janela sem tremer (commit atômico) | 10 |
| [brilho-dentro-da-janela.md](brilho-dentro-da-janela.md) | brilho e sombra nunca cortados (R4) | 11 |
| [movimento-reduzido.md](movimento-reduzido.md) | `prefers-reduced-motion` | 12 |

No L3:

| Arquivo | O que tem | Antiga seção |
|---|---|---|
| [referencias/motion/molas.md](../../referencias/motion/molas.md) | as constantes reais de cada mola (k, ζ, subpassos) e os critérios de parada | 2 |
| [referencias/motion/curvas-e-duracoes.md](../../referencias/motion/curvas-e-duracoes.md) | molas como `linear()`, curvas fixas, durações de referência | 3 |
| [referencias/motor/README.md](../../referencias/motor/README.md) | o motor de movimento da janela (`motor.js`) e o motor de arrasto | 13 |
| [referencias/motor/motor-de-movimento.md](../../referencias/motor/motor-de-movimento.md) | seção "Motor de movimento": estados, molas, limiares, `setBounds` por quadro, commit de tamanho | — |
| [referencias/motor/bugs-evitados.md](../../referencias/motor/bugs-evitados.md) | bugs de movimento e como o motor evita cada um | — |
| [templates/checklist-novo-app.md](../../templates/checklist-novo-app.md) | o checklist pra um app novo | 14 |

Assunto novo de motion que vale pra todos os apps entra aqui como um arquivo novo (e uma linha nesta tabela). Número novo de mola ou curva entra no L3.
