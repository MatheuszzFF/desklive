# Board: chaves

> L3 · referência do [Board](README.md). **Quando ler:** antes de plugar uma integração que precisa de credencial.

Todas as credenciais ficam num arquivo só, no PC de quem usa: `~/.orbita/chaves.json`. Nada de chave no código, no build ou no artefato publicado: o mesmo Board serve pra qualquer pessoa.

- **Declarar o que a sua peça precisa** (uma vez, quando o opcional carrega):
  ```js
  Board.chaves.declarar({ id:'spotify', nome:'Spotify', para:'tocar as suas músicas', como:'passo a passo pra conseguir a chave',
    campos:[{ chave:'clientId', rotulo:'Client ID', formato:'^[A-Za-z0-9]{32}$' }] });
  ```
- **Usar:** `Board.chaves.valor('spotify', 'clientId')` → o valor, ou `null` se falta ou está fora do formato.
- **Ver o que falta:** `Board.chaves.situacao()` → `[{ id, nome, para, pronto, faltam }]`. Sem valores: é isto que um assistente pode ver.
- **Pedir pra pessoa:** `Board.chaves.abrir()` escreve o modelo (com o `_para` e o `_como` de cada integração, sem apagar nada do que já está lá) e abre no Bloco de Notas. Salvou, o Board lê sozinho.
- **Eventos:** `chaves:faltando` (na abertura, com o que falta), `chaves:editando` (true/false), `chaves:mudou`.
- **Onboarding:** na abertura, se falta alguma chave declarada, o Board anuncia `chaves:faltando`. Com o opcional `mesa`, o Dengas fala o que falta e abre o arquivo quando a pessoa pede; ele nunca pede, repete ou mostra o valor de uma chave. Também há "Chaves das integrações…" no menu e na bandeja.
