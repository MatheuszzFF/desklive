# Modelo: Mesa

> **O que é:** o código da Mesa, o quadro único que cobre a área de trabalho e hospeda widgets, no estado da **Mesa 0.7** (piloto). **Quando ler:** você vai montar a Mesa ou escrever um widget pra ela. Como ela é feita e por quê: [apps/mesa/](../../apps/mesa/README.md). Índice: [modelos](../README.md).

## Arquivos

| Arquivo | O que é |
|---|---|
| [mesa-src.html](mesa-src.html) | o quadro: moldura dos widgets, física, barramento, clique-passa e a janela do app, com os marcadores `/*WIDGETS*/`, `/*ATLAS*/{}` e `/*ATLAS_PNG*/''` |
| [widgets/](widgets/) | um `.js` por widget, montados em ordem de nome: `00-dengas.js` (o morador e assistente), `10-relogio.js`, `20-notas.js`, `35-video.js` (YouTube dentro da Mesa), `30-onda.js` e `40-orbita.js` (declaram a Onda e a Órbita **originais** como hóspedes, com o marcador `APP:`), `50-estante.js` (ponte com a Estante Musical) |
| [arte/](arte/) | o atlas do Dengas (`dengas-atlas.png`, células de 96 px, e o `.json` com as linhas) |
| [build.ps1](build.ps1) | monta `mesa.html`: junta os widgets e embute a arte |

## Montar e testar

```powershell
powershell -ExecutionPolicy Bypass -File modelos\mesa\build.ps1 [-Saida <pasta>] [-SemToqueDeTecla]
```

Saída: `mesa.html` (padrão em `modelos/saida/`). **No navegador ela já funciona inteira** (por `localhost` ou `file://`): a aba vira o quadro, com um fundo pra enxergar os widgets, e os ganchos `window.Mesa` e `window.__mesa` ficam à mão. Só o que depende do PC (PowerShell) e do Claude fica desligado.

Publique com as capabilities `desktop` e `sample` e instale como no [README dos modelos](../README.md#publicar-e-instalar-como-app). Permissões: `overlay`, `full-access`, `menu-bar`, `shortcuts` (`Alt+Shift+M` chama o morador).

## Escrever um widget

Crie `widgets/NN-nome.js`. O arquivo roda dentro do módulo da Mesa e chama `Mesa.define`:

```js
Mesa.estilo(`.meu{padding:12px}`);            // CSS do widget (use @container w pra mudar de forma pelo tamanho)
Mesa.define({
  id:'meu', nome:'Meu widget', descricao:'o que ele faz, em uma linha',
  icone:'<circle cx="12" cy="12" r="9"/>',    // miolo de um SVG 24 × 24, só traço
  w:300, h:200, minW:180, minH:110, deSaida:true, lugar:{ borda:'tr' },
  monta(corpo, api){
    corpo.innerHTML = '<div class="meu">…</div>';
    return {
      estado:() => ({ /* o que o morador enxerga */ }),
      comandos:[{ nome:'fazer', descricao:'o que faz e o que devolve', esquema:{ type:'object', properties:{}, required:[] }, roda(entrada){ return 'feito'; } }],
      aoLugar(l){}, aoTamanho(l){}, aoFechar(){},
    };
  },
});
```

- **`estado` e `comandos` são o contrato com o morador:** todo comando de widget aberto vira uma ferramenta do Claude com o nome `<id>_<nome>`, sem código a mais.
- **`api`:** `ler()`/`salvar()` (guardado por widget), `emitir(tipo, dado)` e `ouvir(tipo, fn)` (barramento), `avisar(texto)` (o morador fala), `podePC()` e `ps(script)` (PowerShell, só no app com acesso total), `lugar()`.
- **Moldura, arrasto, encaixe e alça são da Mesa:** o widget só cuida do miolo.

## Widget solto (criado em tempo real)

Além dos widgets de fábrica, a casca aceita widgets criados com ela rodando: `Mesa.criaSolto({ id, nome, descricao, html, w, h })`. O `html` é o miolo do widget; dentro dele existe o objeto `mesa`:

```html
<button id="b">Anotar a hora</button>
<script>
  document.getElementById('b').onclick = () => mesa.pedir('notas_escrever', { texto: new Date().toLocaleTimeString() });
  mesa.registrar({ estado: () => ({ pronto: true }), comandos: [{ nome: 'anotar', descricao: 'anota a hora nas Notas', roda: () => mesa.pedir('notas_escrever', { texto: 'agora' }) }] });
</script>
```

O widget solto roda isolado (iframe com sandbox): não enxerga a página, nem o PC, nem a rede da casca; só fala pelo `mesa`. É o caminho que o morador usa pra inventar widgets e misturas.

## Bom saber

- Nada pessoal no código: a persona do morador fala do "dono", sem nome. A memória dele (`mesa-dengas-mem`) e o arranjo dos widgets (`mesa`) ficam no `localStorage` do app, na máquina de cada um.
- A música usa a sessão de mídia do Windows (tocar, pausar, pular) e **nunca manda tecla**.
