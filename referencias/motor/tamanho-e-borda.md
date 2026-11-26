# Motor v2.2: tamanho grande, parede e borda

> L3 · referência. Índice: [motor](README.md). O que mudou no motor na rodada "colar e descolar da borda" e "janela alta não arrasta pros lados" (25/11/2026). O motor base (estados, molas, envio por quadro, commit) está em [motor-de-movimento.md](motor-de-movimento.md); os bugs, em [bugs-evitados.md](bugs-evitados.md).

## Por que o app grande "não arrastava pros lados"

Medido no simulador (1920 × 1080 × 2, `setBounds` com 60 ms de atraso, motor v2.1):
- A Órbita larga colada na esquerda, com zoom, tem a janela de 734 px de altura, e o item embaixo do mouse fica a ~900 px da ponta da barra.
- Arrastando pra direita, ela troca de forma (coluna → barra). A mola põe o item segurado de volta embaixo do mouse, e o **alvo cai centenas de px fora da tela, à esquerda**. A trava da tela segura a janela na parede: com 600 px de mouse, o conteúdo andava **36 px (6%)**, e a janela ficava parada em **74%** dos quadros.
- **Quanto maior o app, maior essa zona morta.** Por isso só os degraus grandes "travavam".
- Suspeita a mais, só no app instalado: uma janela maior que a tela pode ter o `setBounds` **recusado inteiro** pelo host, e aí ela para nos dois eixos. O motor v2.1 engolia o erro calado. **Respondida depois (lendo o código do host):** o host nunca recusa por tamanho, ele encolhe até a área útil de um monitor; as recusas são `EBUSY` ou `EINVAL` ([mover e redimensionar](../ambiente/mover-e-redimensionar.md#a-trava-real-do-host)).

## O que mudou

| Mudança | Como | Número |
|---|---|---|
| **Escorregar na parede** | Arrastando, se o alvo está além de uma parede e o mouse anda **pra longe** dela, o ponto seguro escorrega até a parede (a referência do arrasto anda junto, `d.wx += c.dx`, sem zona morta): a janela acompanha na hora. Empurrando **contra** a parede, o alvo continua passando (é por ele que o app sente a borda). | Órbita grande: acompanha **70%** do mouse (antes 6%); janela parada 74% → 35% |
| **Nunca maior que a tela, eixo por eixo** | O que vai pro Windows é cortado no tamanho da maior tela que a janela cruza (largura: telas lado a lado somam) e preso dentro das telas por eixo; um eixo nunca trava o outro. | corte contado em `stats.capped` |
| **Recusa não trava** | Se o Windows recusar um `setBounds`, o motor registra (`stats.rejects`, `stats.lastError`) e manda os próximos **10** envios encaixados na área útil do monitor do centro da janela. | antes: erro engolido, janela parada |
| **Freio de aproximação** | Arrastando, a velocidade rumo a uma parede da tela fica limitada a `√(2·A·distância)`, com **A = 90 000 px/s²** (a 20 px: no máx. ~1900 px/s; a 100 px: ~4200 px/s). A janela chega encostada do mesmo jeito, mas desacelera em ~3 quadros. | antes: chegava a ~6200 px/s e parava em 1 quadro |
| **Batida vira amassado** | Se mesmo assim bater na parede a mais de **500 px/s**, dispara o micro-amassado contra a borda (o mesmo do encaixe): impulso `6 · min(1, v/3000)`, um de cada vez. | batidas secas no colar-descolar rápido: 36 → 1 |
| **"Passou da tela"** | O motor entrega ao `feel` quanto o mouse passou da tela (`over.x`, `over.y`). O Eco usa pra levar a marca até a beira; os outros podem usar. | — |

## Teto de tamanho (o que os apps seguem)

- Janela inteira, com a margem do brilho: **no máximo 70% da altura útil** do monitor (756 px a 1080) e **60% da largura útil** (1152 px a 1920). A barra deitada da Órbita é a exceção na largura: ela é larga de propósito, mas baixa.
- Conteúdo que cresce (conversa, listas) **rola dentro** da forma, e a janela não cresce além do teto.
- Durante uma troca de forma, a janela é a união do antes com o depois: essa união também precisa caber em **até ~90% da altura útil**, senão o motor corta e o CSS fica maior que a janela (a Órbita corta primeiro de baixo e da direita).
- O host encolhe pra área útil de **um** monitor sem avisar ([trava real](../ambiente/mover-e-redimensionar.md#a-trava-real-do-host)): se o app pedir mais, o CSS fica maior que a janela e sai cortado.
- O motor corta qualquer pedido maior que a tela (100%) como garantia, mas aí o app sai cortado: o teto é responsabilidade do app.

## Colar e descolar (auditoria, 60 ms de atraso)

| Cenário | Órbita | Onda | Eco |
|---|---|---|---|
| Soltar em cima do limiar (4 a 156 px da borda, de 8 em 8) | gruda até 132, solta a partir de 140; **troca 1 vez** | gruda até 84, solta a partir de 92; 1 vez | gruda até 60, solta a partir de 68; 1 vez |
| Toda soltura assenta (nada de mola sem fim) | sim | sim | sim |
| Quatro cantos (tl, bl, tr, br) | cada um no seu | cada um no seu | cada um no seu |
| Colar e descolar 8× rápido (~3000 px/s) | assenta, CSS no lugar (*) | tranco 92–113 px/quadro² | tranco 126 |
| Descolar devagar da borda | janela parada 26% (*) | tranco 13, parada 37% | tranco 36, parada 37% |
| Arrastar pros lados no maior degrau | acompanha 71% | 100% | 100% |

(*) Na Órbita, a régua de tranco não vale nesses dois testes: com o painel do navegador escondido, o relógio de animações do Chrome não anda e o FLIP dela fica preso no tempo 0. O motor e as margens foram conferidos quadro a quadro (sem salto); o visual precisa ser conferido com o painel visível ou no app.

**Não testado:** no app instalado. Ficam em aberto: se o host realmente recusa janela maior que a tela, a regra exata da trava dele e o fps real.
