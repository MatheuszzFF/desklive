# Modelo: entrada de registro de refino

> **O que é:** o formato de uma entrada em `apps/<app>/refinos.md`. **Quando usar:** em todo refino de forma, interação, motion, visual ou motor (R22). A entrada mais nova vai no topo, logo abaixo do comentário `<!-- Entradas novas ... -->`.

Junto com a entrada, atualize os números no `README.md` do app (ou no padrão L1/L3 que mudou) e acrescente uma linha no [CHANGELOG](../CHANGELOG.md).

```markdown
## AAAA-MM-DD — <título curto do refino>
- **Pedido:** <o que foi pedido, nas palavras dele quando der, curto>
- **Onde:** <lado / canto / degrau / estado afetado>
- **Antes → depois:** <o que mudou, com os números reais: k 210 → 240, raio 19 → 22 px, 60 → 40 ms…>
- **Por quê:** <o problema que resolveu ou o feedback>
- **Docs atualizados:** <links pros arquivos que mudaram>
- **Testado:** <o que foi conferido por print no simulador; o que ficou "não testado">
- **Regras:** <regras que pesaram, ex.: R20, R2>
```
