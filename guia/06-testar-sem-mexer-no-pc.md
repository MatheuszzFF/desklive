# Passo 6: testar sem mexer no PC

> **O que é:** como testar o app inteiro num **simulador** em `localhost`, com **ganchos** e **testes de estresse**, sem nunca controlar o mouse e o teclado de verdade, e o que só dá pra conferir no app instalado. **Quando ler:** desde o [passo 1](01-primeiro-app.md); teste a cada passo, não só no fim. Base: [arquitetura](../padroes/arquitetura.md), seção "Testes". Índice: [guia](README.md).

## Por que sem mexer no PC

No projeto, nenhum agente controla o mouse ou o teclado do PC (R19): uma automação mexendo no mouse enquanto a pessoa usa o computador bagunça tudo. E o teste no simulador é repetível: o mesmo gesto, o mesmo resultado, com números. O que só dá pra ver no app instalado fica escrito como **"não testado"**.

## O simulador

Uma página `<app>-sim.html` servida por qualquer servidor local, que carrega o seu app e **imita o host**. Pra valer, ela precisa imitar o que já causou bug:
- **as telas:** dois monitores lado a lado, com a emenda entre eles;
- **a trava da tela:** a janela não sai da área das telas, como no Windows;
- **o atraso do `setBounds`:** cada envio volta depois de um tempo, aplicado na ordem, perto do medido no app instalado ([motor de movimento](../referencias/motor/motor-de-movimento.md), "Testado"). Com atraso pequeno demais, o arrasto aos trancos não aparece;
- **o `resize`** chegando depois do `setBounds`, pra testar o commit atômico;
- **um relógio fixo** (ex.: 60 Hz), pra animação quadro a quadro dar o mesmo resultado sempre.

Exemplos do projeto: `onda-sim.html` e `eco-sim.html`, e o simulador de mesa da Órbita (`sim.html?app=orbita`). Detalhes na seção "Testado" de cada app ([Órbita](../apps/orbita/README.md), [Onda](../apps/onda/README.md), [Eco](../apps/eco/README.md)).

## Os ganchos

Exponha um objeto global de teste (`window.__<app>`; no projeto, `__orb`, `__onda` e `__eco`) pra fazer pelo código o que o mouse faria:
- mover um mouse simulado e disparar eventos de ponteiro **dentro da página**, em coordenadas de tela (o Eco tem `pointer(x, y)`);
- pôr o app num lado, canto e degrau, e abrir a prévia ou o aberto;
- ler o estado: lado, degrau, prévia, tamanho da janela, "clique passa", envios de `setBounds` por quadro.

## Testes de estresse

No projeto, cada app passa por 15 testes do motor. Use [bugs evitados](../referencias/motor/bugs-evitados.md) como lista: cada linha vira um teste. Os que mais pegam:
- soltar o botão fora da janela encerra o arrasto;
- nunca dois `setBounds` no mesmo quadro, e o limite de envios em voo respeitado;
- clique e primeiro movimento no mesmo milissegundo não disparam a janela;
- parar de repente não passa do ponto; parado, zero envios e zero deriva;
- a emenda entre monitores não gruda; o app assenta perto de cada borda;
- no arrasto lento, a % de quadros com a janela parada fica baixa;
- botão dentro da área de arrastar recebe o clique; a prévia abre com o mouse andando e o "clique passa" não troca no meio do hover.

## Prints

- **A matriz inteira:** cada lado e canto, em repouso, com a prévia e aberto, em cada degrau (R20). Também a solta e as transições no meio do caminho.
- Console sem erro. Alinhamento e tamanhos medidos com `getBoundingClientRect` (R5), não no olho.
- Confira em resolução real, no Chrome (R10).

## Só no app instalado

Transparência de verdade, mouse físico, 60 fps reais, a latência real do `setBounds` (e se o Windows aceita vários em voo), DPI misto entre monitores, a trava exata do host na emenda, o atalho global e o teclado, e os helpers e serviços reais (Spotify, Claude). **Dica:** grave a tela do app instalado e conte os quadros. Foi assim que o projeto achou o arrasto aos trancos que o simulador não mostrava ([bugs evitados](../referencias/motor/bugs-evitados.md), "Achados no app instalado").

## Pronto quando

- [ ] Todos os testes de estresse passam e os prints da matriz estão salvos.
- [ ] A seção "Testado" do seu app diz o que foi conferido e o que ficou "não testado" ([passo 7](07-documentar.md)).

Próximo: [documentar](07-documentar.md).
