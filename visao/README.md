# Visão e princípios (L0)

> **O que é:** por que o desklive existe e as ideias que guiam tudo. **Quando ler:** primeira vez no projeto, ou antes de criar um app novo. Os termos estão no [glossário](glossario.md).

## Visão

Um desktop vivo pro Windows 11, feito de artefatos do Claude instalados como apps de desktop. Os apps são transparentes, flutuam sobre a área de trabalho, se transformam conforme o lugar da tela e conversam entre si. Hoje são três: **Órbita** (barra de tarefas), **Onda** (player do Spotify) e **Eco** (assistente). Este repositório guarda as regras e a receita de como cada um é feito, nunca o código.

## Princípios

Resumo; o detalhe e a fonte estão nos links.

1. **Cada lugar da tela é uma forma.** O app se transforma de verdade conforme o lado, o canto e o tamanho, com forma e interação únicas em cada um (incluindo o tamanho mínimo), no nível da ilha do topo do Eco. Nunca só se esconder, nunca a mesma peça repetida. ([R20](../regras/regras-de-trabalho.md), [layout](../padroes/layout-posicao-e-tamanho.md))
2. **Faz parte da tela.** Encostado, o app se funde à borda com ombros côncavos e se descola como líquido. ([fusão com a borda](../padroes/motion/fusao-com-a-borda.md))
3. **Transparente e minimalista.** Sem caixas opacas, nada genérico, nada cortado, nada exagerado; refinar em vez de inflar. ([design](../padroes/design.md), R1–R5)
4. **Tudo com física.** Molas de verdade, embalo, encaixe; nenhum pulo seco. ([motion](../padroes/motion/README.md), R7)
5. **A janela é só do tamanho do app**, pra chegar em qualquer borda e canto. (R9, [janela sem tremer](../padroes/motion/janela-sem-tremer.md))
6. **Uma função, um app.** A barra só aciona; música é a Onda, Claude é o Eco. (R16)
7. **Os apps conversam**, pelo barramento `~/.orbita`, sem embutir um no outro. ([interação entre apps](../padroes/interacao-entre-apps.md), R18)
8. **Seguro e sem binários estranhos.** O Smart App Control fica ligado: só APIs do Windows e código na página. ([arquitetura](../padroes/arquitetura.md), R17)
9. **A receita vive aqui.** Todo refino é documentado com os números reais, sem código e sem segredos. (R22)
