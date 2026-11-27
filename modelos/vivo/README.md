# Peças ao vivo

Opcional `vivo`, depois da ponte. Carrega `~/.orbita/pecas/*.js` com o Board aberto.

1. No menu do Board: **Peças ao vivo: ligado** (vem desligado).
2. Ponha a peça na pasta: `powershell -ExecutionPolicy Bypass -File modelos\vivo\empacota.ps1 -Nome explorer`.
3. Clique em **Ligar peça** no cartão. Cada conteúdo novo pede um clique novo.

A peça roda com o mesmo acesso do Board (o PC inteiro). O assistente só vê a situação e manda procurar.
Serve pra widget `Mesa.define`; mudança na casca, na ponte ou no assistente ainda pede montar e publicar.
Teste: `node modelos/vivo/teste/vivo.teste.js`. Não testado no app instalado (pode ser que ele não deixe rodar código carregado).
