# Checklist pra um app novo

> **O que é:** o que conferir antes de dizer que um app (ou um refino grande) está pronto. **Quando usar:** no fim de toda criação de app e antes de publicar. Os itens de motion vieram do antigo `padroes/motion.md` (seção 14); os outros resumem os padrões L1.

## Forma e interação
- [ ] Forma e interação **próprias** em cada lado, canto e degrau (R20), fundida à borda com ombros côncavos e descolando como líquido ([fusão com a borda](../padroes/motion/fusao-com-a-borda.md)).
- [ ] O **tamanho mínimo** também é único em cada lado e canto, interativo e vivo, nunca uma versão encolhida (R20).
- [ ] Conteúdo sempre abre pra dentro da tela ([layout](../padroes/layout-posicao-e-tamanho.md)).

## Motion
- [ ] Molas reais no JS (subpassos, `dt` limitado) e curvas `linear()` geradas da mesma mola no CSS, com `cubic-bezier` de reserva ([motion](../padroes/motion/README.md), [curvas](../referencias/motion/curvas-e-duracoes.md)).
- [ ] Sensor de borda com histerese e emenda entre monitores ignorada; prévia do encaixe durante o arrasto ([sensor](../padroes/motion/sensor-de-borda-e-encaixe.md)).
- [ ] `feel` próprio: inclinar, esticar na direção do movimento, levantar ao pegar, amassar ao bater ([sentir o arrasto](../padroes/motion/sentir-o-arrasto.md)).
- [ ] Janela do tamanho do conteúdo, crescendo antes e encolhendo depois; CSS aplicado no `resize`; um `setBounds` por quadro ([janela sem tremer](../padroes/motion/janela-sem-tremer.md)).
- [ ] Brilhos e sombras dentro da janela, com folga medida ([brilho](../padroes/motion/brilho-dentro-da-janela.md)).
- [ ] Stagger nas entradas; nada aparece de uma vez nem some seco ([stagger](../padroes/motion/entradas-em-sequencia.md)).
- [ ] `prefers-reduced-motion` respeitado ([movimento reduzido](../padroes/motion/movimento-reduzido.md)).

## Entre apps e runtime
- [ ] Publica `<app>.json` no barramento e aceita comandos; interage sem embutir conteúdo de outro app ([interação](../padroes/interacao-entre-apps.md)).
- [ ] Lembra posição, tamanho e monitor; clique passa fora da parte visível ([arquitetura](../padroes/arquitetura.md)).
- [ ] Nada de binário sem assinatura; rede só pelos helpers.

## Teste e doc
- [ ] Prints de cada lado e canto, em repouso, com hover e aberto, antes de publicar (R10), no simulador e sem tocar no mouse do PC (R19).
- [ ] `apps/<app>/README.md` no formato do [modelo](novo-app.md), `refinos.md` com a primeira entrada, linha nova em [apps/README.md](../apps/README.md), no mapa do [CLAUDE.md](../CLAUDE.md) e no [CHANGELOG](../CHANGELOG.md) (R22).
- [ ] Nenhum segredo, token, client ID, e-mail ou caminho pessoal no que vai pro repo (ele é público).
