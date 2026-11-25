# Modelo: Órbita

> **O que é:** o código da Órbita (barra de tarefas) como modelo, no estado da **Órbita v28** (motor v2.2). **Quando ler:** você vai montar a Órbita ou trocar os apps dela. Como ela é feita e por quê: [apps/orbita/](../../apps/orbita/README.md). Índice: [modelos](../README.md).

## Arquivos

| Arquivo | O que é |
|---|---|
| [orbita-src.html](orbita-src.html) | o app, com os marcadores `/*MOTOR*/`, `/*ICONS*/{}` e `/*HELPER*/''` |
| [build.ps1](build.ps1) | monta `orbita.html` com [motor.js](../compartilhado/motor.js), [orbita-helper.ps1](../compartilhado/orbita-helper.ps1) e os ícones |

## Configurar: os apps da barra

O modelo vem só com apps que todo Windows 11 tem: **Explorador de Arquivos, Microsoft Edge, Terminal, Bloco de Notas e Configurações**. Pra trocar, edite a lista `APPS` no começo do `<script type="module">` do [orbita-src.html](orbita-src.html):

```js
{ key:'notepad', name:'Bloco de Notas', color:'#7fc4a8', aumid:'Microsoft.WindowsNotepad_8wekyb3d8bbwe!App',
  procs:['notepad.exe'], win:['notepad.exe'], extra:[ { label:'Nova janela', run:a => spawnApp(a.aumid) } ] },
```

| Campo | O que é | Como achar |
|---|---|---|
| `key` | nome curto e único; o ícone é guardado com ele | invente (minúsculo) |
| `name` | o nome no balão | — |
| `color` | a cor do brilho do app | qualquer cor CSS |
| `aumid` | o AppID do Windows | no PowerShell: `Get-StartApps` (coluna AppID) |
| `procs` | processos que acendem o pontinho de "aberto" | Gerenciador de Tarefas → Detalhes, em minúsculo |
| `win` | `[processos, classe da janela]` pra trazer pra frente a janela que já existe (a classe é opcional) | sem `win`, o clique sempre abre de novo |
| `extra` | itens do botão direito; o primeiro também é o Shift + clique | `spawnApp(aumid)`, `spawnRaw('explorer.exe', ['shell:Downloads'])` etc. |

- **Mantenha o `key` e o `aumid` na mesma linha:** o build acha os apps (e extrai os ícones) lendo essas duas chaves.
- **Quantos apps:** qualquer número. Nos cantos, até 4 ficam num arco só; com mais, 3 vão no arco de dentro e o resto no de fora.
- Use a mesma lista no [Eco](../eco/README.md) se quiser que os atalhos dele tenham os mesmos ícones.

## Montar

```powershell
powershell -ExecutionPolicy Bypass -File modelos\orbita\build.ps1 [-Saida <pasta>]
```

Saída: `orbita.html` (padrão em `modelos/saida/`). Depois, publique e instale como no [README dos modelos](../README.md#publicar-e-instalar-como-app). Permissões: `overlay`, `full-access`, `menu-bar`, `shortcuts`.

## Bom saber

- A temperatura da placa só aparece com `nvidia-smi` no PATH; o título da música vem da janela do Spotify, se ele estiver aberto.
- A Órbita grava `~/.orbita/eco-ancora.json` pra o [Eco](../eco/README.md) saber em que tela aparecer.
- Ganchos de teste (`window.__orb`) só existem abrindo o HTML por `file://`, `data:` ou `localhost`.
