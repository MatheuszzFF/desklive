# Mesa — refinos

> Registro de cada refino da Mesa, do mais novo pro mais antigo ([modelo](../../templates/registro-de-refino.md)). Índice: [Mesa](README.md).

## 2026-11-25 · Mesa 0.2
- **O que:** widget **Apps** (lista os apps do menu Iniciar, favoritos, abre com um clique; comandos `abrir`, `favoritar`, `procurar`; sem tecla); widget **Estante** (ponte com a Estante Musical pelo barramento `~/.dengas`: estado, tocar, tom, andamento, trocar de música; comando `comando`); **aparência** comandável (`Mesa.aparencia`: cor de destaque, opacidade do vidro de 0,35 a 1, raio de 0 a 34 px, papel de parede em 2 ou 3 cores; ferramenta `mesa_aparencia` do morador); o morador reage sozinho quando a música muda (no máximo uma fala a cada 25 s) e anda até o widget que abre.
- **Por quê:** tudo na Mesa tem de ser personalizável e comandável pelo morador.
- **Testado:** no navegador por `localhost`: os cinco widgets abrem, os nove comandos aparecem, o comando de notas escreve, a aparência troca. **Não testado:** app instalado, abrir apps de verdade, a Estante respondendo, o Claude chamando as ferramentas.

## 2026-11-25 · Mesa 0.1 (piloto)
- **O que:** primeira versão. Quadro único do tamanho da área de trabalho; widgets com moldura, arrasto, embalo, encaixe na borda (26 px), alça na quina de dentro e forma por tamanho; barramento dentro da página; clique-passa com atraso de 140 ms; morador (Dengas) que anda, cai, senta, conversa e usa os comandos dos widgets como ferramentas do Claude. Widgets: Relógio (com cronômetro), Notas e Música (sessão de mídia do Windows).
- **Por quê:** ter uma base em que mover e encaixar funcionam igual no navegador e no app, e em que um assistente enxerga e comanda tudo.
- **Testado:** no navegador por `localhost`, com eventos de ponteiro na página. **Não testado:** app instalado, Claude e comandos do PC.
