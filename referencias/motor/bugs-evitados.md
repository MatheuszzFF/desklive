# Bugs de movimento e como o motor os evita

> L3 · referência. Índice: [motor](README.md). Bugs achados na auditoria de 25/11/2026 (antes cada app tinha o próprio arrasto) e nos testes de estresse do motor novo. Serve de checklist pra qualquer app novo que mexa a janela.

| Bug | Onde aparecia | Causa | Como é evitado |
|---|---|---|---|
| Arrasto que não termina (a janela segue o mouse depois de soltar) | Onda, Eco (a Órbita já tinha remendo) | só o `pointerup` encerrava; se o soltar caía em outra janela, o gesto ficava aberto | o gesto termina também com `buttons === 0`, perda de foco, aba escondida, clique novo, `mouseup` de reserva e o *watchdog* de 12 s |
| O soltar cai na janela de baixo | Onda | o "clique passa" (`setIgnoreMouseEvents`) podia ligar com o botão pressionado | com o gesto ativo, o "clique passa" nunca liga nos três apps; ao pressionar, a janela segura o mouse |
| Pulo de 1–2 quadros ao mudar de tamanho | Onda (caixa da janela), Eco (pegar a forma presa, crescer e encolher a forma) | o CSS mudava na hora e o `setBounds` chegava depois | commit: tamanho e posição num envio só e o CSS no `resize` ([motor](motor-de-movimento.md)) |
| Tremida: 2 `setBounds` no mesmo quadro | os três | o envio que voltava disparava outro na hora, fora do quadro; `set`/`reshape` enviavam direto | só a bomba do quadro envia; nenhum outro caminho chama `setBounds` |
| Posição do motor ≠ posição real | os três | o host prende a janela na tela e o motor achava que ela tinha passado | arrastando, o motor prende a janela igual ao host; na volta do mouse ela anda na hora |
| Eco gruda na emenda entre monitores | Eco | as bordas internas contavam como borda | uma borda só conta se um ponto 30 px além dela não estiver em outra tela |
| Barra "corre" ao sair do canto pro topo | Órbita | o item segurado (o núcleo) some no layout do topo e a barra corria atrás dele | se o item segurado some, fica embaixo do mouse o mesmo ponto proporcional da barra |
| Janela dispara ~700 px no início do arrasto | motor novo (achado no teste) | clique e primeiro movimento no mesmo milissegundo davam velocidade absurda | velocidade só com ≥ 12 ms de amostras e teto de 6000 px/s |
| Onda não assentava perto da borda | motor novo (achado no teste) | a trava da tela brigava com a margem da Onda, que encolhe perto da borda | a trava só vale arrastando; o assentar vai até o destino do app |
| Onda não "sentia" a borda direita | motor novo (achado no teste) | o alvo era preso na tela, então a zona nunca via a borda | o alvo é livre; só a janela é presa |
| Passa do ponto ~45 px ao parar de repente | motor novo (achado no teste) | previsão do mouse longa demais (40 ms) | previsão de no máximo 1 quadro, que some em mais 1 |
| Clique que vira arrasto e vice-versa | os três | limiares diferentes e o clique engolido com `setTimeout 0` | limiar por app + 2,5 px se segurou > 220 ms; o arrasto engole o clique por 400 ms (por tempo, não por timer) |
| Ímã puxando sem arrasto | — | — | o encaixe só é calculado ao soltar ou por comando; parado, o motor não envia nada (teste: zero `setBounds` e zero deriva em 0,9 s parado) |

## Achados no app instalado (gravação da tela, v2 → v2.1)

| Bug | Onde aparecia | Causa | Como é evitado |
|---|---|---|---|
| Arrasto aos trancos ("trava frame"): janela parada em 43–63% dos quadros e saltos de 90–540 px | os três, no app instalado (o simulador com 4–12 ms de atraso não mostrava) | o `setBounds` real leva ~50–70 ms pra voltar e o motor só mandava o próximo depois da volta (mais 1 quadro de espera): ~15 movimentos por segundo | um `setBounds` por quadro sem esperar a volta, até 5 em voo; o simulador agora usa ~60 ms aplicados na ordem e mede a % de quadros com a janela parada (100% → 28–38%) |
| "Bate numa parede" perto da borda | Eco (gravação: perto da borda de baixo) | a janela de 112 px tem 24 px de folga em volta da marca e o Windows não deixa a janela sair da tela: a marca parava 24 px antes da borda | o motor informa quanto o mouse passou da tela e o Eco leva a marca até a beira dentro da janela (até 22 px, com resistência); ao soltar, isso vira a mola do `.rig` |
| Posição do motor ≠ real se a trava do Windows for diferente da do motor (ex.: na emenda) | — (prevenção) | o motor só imita a trava; não sabe se o host prende por monitor | ao assentar, o motor lê a posição real (`getBounds`) e corrige a lógica |
