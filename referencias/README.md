# Referências profundas (L3)

Constantes, fórmulas e internals que valem pra mais de um app. Ninguém precisa ler isso pra entender o projeto; abra quando for mexer num número.

| Pasta | O que tem |
|---|---|
| [motion/](motion/README.md) | constantes de mola, curvas `linear()` e durações |
| [motor/](motor/README.md) | o motor de movimento da janela (`motor.js`) e o motor de arrasto: física, embalo, gesto, versões |

O L3 de **um app só** (shader, fórmula da onda, tabela de medidas) fica na pasta do app, em arquivo separado do `README.md` dele. Exemplos: [apps/eco/marca-webgl.md](../apps/eco/marca-webgl.md) e [apps/onda/onda-e-cor.md](../apps/onda/onda-e-cor.md). Se um shader ou fórmula passar a ser usado por dois apps, ele sobe pra cá numa pasta nova (`shaders/`, `formulas/`).
