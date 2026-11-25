# Modelo: Onda

> **O que é:** o código da Onda (player do Spotify) como modelo, no estado da **Onda v19** (motor v2.2). **Quando ler:** você vai montar a Onda ou ligar o seu Spotify nela. Como ela é feita e por quê: [apps/onda/](../../apps/onda/README.md). Índice: [modelos](../README.md).

## Arquivos

| Arquivo | O que é |
|---|---|
| [onda-src.html](onda-src.html) | o app, com os marcadores `/*MOTOR*/`, `/*HELPER*/''`, `/*METER*/''`, `/*AUTH*/''` e `/*CLIENT_ID*/'SEU_CLIENT_ID'` |
| [musica-helper.ps1](musica-helper.ps1) | controle de mídia do Windows (estado, capa, tocar, pular, avançar) e chamadas à Web API do Spotify, renovando o token sozinho |
| [spotify-auth.ps1](spotify-auth.ps1) | login PKCE (sem segredo): espera o retorno em `127.0.0.1:8977` e salva o token em `~/.orbita/spotify-token.json` |
| [config.exemplo.json](config.exemplo.json) | modelo do `config.json` com o seu Client ID |
| [build.ps1](build.ps1) | monta `onda.html` com o [motor](../compartilhado/motor.js), os helpers, o [medidor](../compartilhado/meter.ps1) e o Client ID |

## Configurar: o seu app no Spotify

Sem isso a Onda já funciona pelo controle de mídia do Windows (música, capa, tocar e pular). O Client ID liga o resto (botão **Conectar Spotify**): escolher música, fila, playlists e os comandos do Eco.

1. Entre em developer.spotify.com → **Dashboard** → **Create app**.
2. Em **Redirect URIs**, coloque exatamente `http://127.0.0.1:8977/callback`. Em APIs, marque **Web API**.
3. Copie o **Client ID** (não precisa do Client Secret: o login é PKCE).
4. Copie `config.exemplo.json` pra `config.json` (nesta pasta) e troque `SEU_CLIENT_ID` pelo seu. O `config.json` está no `.gitignore` e nunca sobe pro repo.
5. Em modo de desenvolvimento, o Spotify só deixa entrar quem está na lista de usuários do app (**User Management**): adicione a sua conta lá. Controlar o que toca pela Web API exige Spotify Premium.

Também dá pra passar direto no build: `-ClientId <id>`. Sem Client ID, a montagem avisa e o botão de conectar mostra "Falta o Client ID do Spotify".

## Montar

```powershell
powershell -ExecutionPolicy Bypass -File modelos\onda\build.ps1 [-Saida <pasta>] [-ClientId <id>]
```

Saída: `onda.html` (padrão em `modelos/saida/`). Publique e instale como no [README dos modelos](../README.md#publicar-e-instalar-como-app). Permissões: `overlay`, `full-access`, `menu-bar`. Depois de instalar, use **Conectar Spotify** na Onda: o navegador abre o login do Spotify e volta pra `127.0.0.1:8977`.

## Bom saber

- O HTML montado **contém o seu Client ID**. Ele não é segredo no PKCE, mas é seu: não suba o HTML montado pra nenhum repo público.
- O token fica só na sua máquina, em `~/.orbita/spotify-token.json`; o histórico do que tocou, em `~/.orbita/musica-historico.json`.
- A Onda publica o estado em `~/.orbita/musica.json` e aceita comandos em `~/.orbita/musica-cmd/` ([interação entre apps](../../padroes/interacao-entre-apps.md)).
- Ganchos de teste (`window.__onda`) só existem abrindo o HTML por `file://`, `data:` ou `localhost`.
