# Mesa — o quadro dos widgets

> **O que é:** o doc L2 da Mesa. **Quando ler:** antes de criar, refinar ou depurar a Mesa ou um widget dela. Comum a todos: [padroes/](../../padroes/README.md). Histórico: [refinos](refinos.md). Código: [modelos/mesa/](../../modelos/mesa/README.md).

- **Conteúdo:** uma janela só, transparente, do tamanho da área de trabalho de um monitor, onde os **widgets** moram como peças da mesma página. Um **morador** (o Dengas, um ratinho de pixel) anda por cima das coisas e é o assistente: enxerga o estado de todo widget aberto e usa os comandos deles como ferramentas do Claude.
- **Uma função:** ser a base. Cada widget tem a sua função; a Mesa só dá moldura, movimento, encaixe, tamanho, barramento e o morador.
- **Por que existe (e no que difere dos outros apps):** nos três apps, cada um é uma janela do tamanho do app e o motor move a janela de verdade. Na Mesa a janela **não se mexe**: mover, encostar e redimensionar são contas de CSS dentro do quadro. O que funciona no navegador por `localhost` funciona igual no app, a escala do Windows deixa de importar, e um assistente consegue ver e comandar tudo sem barramento por arquivo. O preço: uma janela grande sempre por cima (o clique passa fora dos widgets) e os widgets dividem a mesma página.
- **Atalho:** `Alt + Shift + M` abre a conversa com o morador.
- **Barramento:** dentro da página, na hora (`bus.on` / `bus.emit`); eventos `mesa:abriu`, `mesa:fechou`, `mesa:lugar`, `mesa:redimensionou`, `mesa:mouse`, `mesa:aviso`, `mesa:tela`, e `<id>:<tipo>` de cada widget. Pasta `~/.mesa` reservada pra conversar com apps de fora (ainda não usada).
- **Helpers:** nenhum processo longo; PowerShell por chamada (`childProcess.exec`), só com acesso total.

## Como é feito

### Estrutura
- `#mesa` cobre a tela; `#fundo` é o papel de parede opcional; `#camada` guarda os widgets; o morador, o balão e a conversa ficam por cima.
- Widget = `<section class="w">` com a faixa de pegar (34 px), o miolo (`container-type: size`, pra cada widget mudar de forma pelo tamanho) e a alça. Posição por `translate3d`, tamanho por `width`/`height`.
- Tudo o que recebe clique tem a classe `alvo`. Fora de um `alvo`, o clique passa pra área de trabalho de verdade: desliga na hora ao voltar, liga 140 ms depois de sair, nunca com o botão pressionado.
- A janela do app pega a área útil do monitor com **um** `setBounds` (nas unidades do host, sem conversão) e não se mexe mais. Antes de crescer, confirma que o clique atravessa.

### Formas por lado e canto
| Lugar | O que muda no widget |
|---|---|
| **Solto** | cartão de vidro, raio 20 |
| **Encostado numa borda** | as duas quinas do lado da borda ficam retas e a borda daquele lado some |
| **Canto** | três quinas retas; sobra a quina de dentro |
| **Tamanho** | o miolo usa `@container w` (ex.: o relógio esconde a data abaixo de 120 px de altura) |

Ainda não tem ombros côncavos nem o descolar líquido da [fusão com a borda](../../padroes/motion/fusao-com-a-borda.md): é o próximo refino.

### Interação
- **Arrastar:** pela faixa de cima, depois de 4 px (o × continua recebendo o clique). O widget persegue o mouse numa mola k 1500 / ζ 1, preso dentro da tela.
- **Soltar:** embalo `v × 0,14 s` (teto 3200 px/s, sem embalo abaixo de 120 px/s); a menos de **26 px** de uma borda, encosta nela. Assenta em k 230 / ζ 0,82, 4 subpassos, `dt` ≤ 1/30.
- **Redimensionar:** alça de 22 px na quina **de dentro** (oposta às bordas encostadas); puxa a partir do lado oposto, com mínimo do widget e teto da tela.
- **Trazer pra frente:** qualquer clique no widget.
- **Morador:** fica em pé em **superfícies** (o banquinho da beira de baixo, 24 px acima do fim da tela, ou o topo de um widget com pelo menos 128 px livres em cima). Cai com gravidade 2600 px/s² (teto 1500), corre em quatro patas a 150 px/s (desce em ~460 ms antes de sair e levanta ao chegar; pra esquerda é o mesmo clipe espelhado), senta depois de alguns segundos, passeia a cada 16 a 38 s, anda junto com o widget em que está e cai se o widget some. Clique abre a conversa; arrastar (4 px) pega ele.
- **Conversa:** pílula de vidro que nasce do lado com mais tela, com sugestões (abrir widget fechado, organizar a mesa) e as mensagens; o balão coral é pra o que ele fala sozinho, com o texto saindo no ritmo da boca.

### Degraus de tamanho e alça
Tamanho livre pela alça; cada widget declara `minW`/`minH`. Sem degraus fixos ainda.

### Motion
- **Molas próprias:** arrasto k 1500 / ζ 1; assentar k 230 / ζ 0,82; 4 subpassos.
- **Entrada e saída do widget:** opacidade + escala 0,9 → 1 em .35 s com a curva de mola.
- **Movimento reduzido:** os widgets vão direto pro lugar; o morador não comemora ao pousar.

### Visual
Vidro escuro `rgba(10,11,16,.9)` com um degradê claro de 5,5 % a 1,2 %, borda de 1 px a 9 %, sombra `0 18px 44px -16px rgba(0,0,0,.72)`; destaque coral `#d97757` e pêssego `#f0a98a`; fontes do sistema (Segoe UI Variable). O widget em que o morador mexe pisca um anel coral (.9 s).

## Testado
No navegador por `localhost` (sem o mouse do PC, com eventos de ponteiro disparados na página): arrasto com embalo até encostar embaixo, redimensionar pela alça, encaixe no canto por comando (`borda` vira `lb` e a alça vai pra quina de cima à direita), o morador caindo em cima de um widget, acompanhando o widget que se move, andando de perfil e abrindo a conversa; console sem erro.
**Não testado:** tudo no app instalado (janela cobrindo a tela, clique-passa de verdade, escala do Windows), o Claude respondendo e chamando as ferramentas, os comandos de música no PC.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| [refinos.md](refinos.md) | registro de cada refino |
