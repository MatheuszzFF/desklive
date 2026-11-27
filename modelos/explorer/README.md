# Explorador (widget do Board)

Opcional `explorer`, depois da ponte: `modelos/board/build.ps1 -Pecas mesa,dengas,...,explorer`.

- `explorer.js`: o widget (`Mesa.define`, moldura do Board). `ajudante.ps1`: PowerShell residente que lê e mexe nos arquivos.
- Faz: pastas conhecidas e discos, grade ou lista, miniaturas, busca (até 6 níveis, 200 achados), abrir (traz a janela pro Board quando o opcional `janelas` está junto), nova pasta, renomear, copiar, recortar, colar e Lixeira.
- Segurança: nunca passa por cima de arquivo; não mexe em raiz de disco, pastas do sistema nem nas pastas conhecidas; Lixeira só em disco fixo e até 2 GB (nada é apagado de vez).
- Privacidade: o assistente não enxerga arquivo nenhum; o único comando (`ir`) só muda a pasta mostrada.
- Testes: `node modelos/explorer/teste/ajudante.teste.js` e `node modelos/explorer/teste/tela.js`.
