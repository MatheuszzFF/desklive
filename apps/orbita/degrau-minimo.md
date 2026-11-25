# Órbita — o degrau mínimo (fina) por lado

> **O que é:** a forma e a interação da Órbita no menor tamanho, em cada lado e canto (L3, só da Órbita). **Quando ler:** antes de mexer no degrau `slim` ou na proximidade dos ícones. O comum dos degraus está no [README](README.md#degraus-de-tamanho); o histórico em [refinos.md](refinos.md).

A fina nunca é a barra normal encolhida (R20). Cada lugar tem uma forma própria e uma reação viva ao mouse, sempre fundida à borda com os ombros da ilha.

## Forma e interação

| Lugar | Forma em repouso | Interação própria |
|---|---|---|
| **Embaixo — doca dormindo** | Ícones de 22 px em botões de 30 px, gap de 10 px, **sem cor** (saturação 0,3, brilho 0,74); o pontinho de "aberto" fica com 3 px | O mouse chegando **acorda** os ícones do caminho: crescem até **1,72×**, sobem **9 px** e ganham cor, cada um conforme a proximidade `k`. Sem a lupa da doca normal. |
| **Laterais — coluna de pontos** | Só os **pontos de cor** dos apps (7 px, com brilho da cor); app fechado fica num ponto apagado (40 % da cor misturada com cinza) | Conforme o mouse se aproxima, o ponto apaga e o **ícone nasce** dele: de 0,25× a 1× (26 px), andando **5 px pra dentro** da tela. O halo de "rodando" acompanha (até 0,75). |
| **Em cima — ilha dinâmica** | Só a **hora** (13,5 px) e **três pontinhos** de 5 px (CPU, RAM, placa) na cor do nível | Com o mouse em cima (60 ms), a ilha **abre a partir do meio** e os apps entram **em sequência**: cada um 28 ms depois do outro (+60 ms), de `scale(.35)` e desfocado 3 px, em .5 s `--springy`. Fecha 420 ms depois que o mouse sai. A abertura e o fechamento usam o mesmo morph da troca de forma, com o meio de cima parado. |
| **Cantos — só o núcleo** | O núcleo com a hora (13 px) e os três **anéis concêntricos respirando**; os pontinhos dos apps somem | Os anéis respiram (escala 1 → 1,08, opacidade 0,82 → 1) num ciclo que **acelera com a CPU**: `4,2 − CPU × 0,028` s, arredondado a cada 0,4 s (≈ 4,2 s parada, ≈ 1,4 s a 100 %). Em cima do núcleo, o leque abre como nos outros degraus, e os pontinhos voltam. |
| **Solta — pílula** | Barra deitada compacta | Quando o mouse entra, os ícones **pulam em onda**, um 40 ms depois do outro (o mesmo pulo do clique). |

## A proximidade (`k`)

- Vale na doca dormindo e na coluna de pontos. Começa a **110 × escala** px da barra (distância do mouse até a caixa da barra).
- Por app: `d = (posição do mouse ao longo da barra − centro do app) / (62 × escala)` e `k = e^(−d²) × portão`. O portão sai da distância até a barra, com curva suave: `p = 1 − dist / 110`, `portão = p² (3 − 2p)`.
- Enquanto o mouse anda, a transição dos ícones é linear de .12 s (segue o mouse). Ao sair, voltam em .55 s `--spring`.
- Na ilha do canto, a superfície não conta mais os pontinhos dos apps (só o núcleo).
