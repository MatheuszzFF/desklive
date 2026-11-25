# Modelo: Eco

> **O que é:** o código do Eco (assistente com o Claude e marca líquida em WebGL) como modelo, no estado do **Eco v24** (motor v2.2). **Quando ler:** você vai montar o Eco ou mudar o jeito do assistente. Como ele é feito e por quê: [apps/eco/](../../apps/eco/README.md). Índice: [modelos](../README.md).

## Arquivos

| Arquivo | O que é |
|---|---|
| [eco-src.html](eco-src.html) | o app, com os marcadores `/*MOTOR*/`, `/*ICONS*/{}`, `/*HELPER*/''`, `/*VOZ*/''`, `/*METER*/''` e `/*GRAVADOR*/''` |
| [voz.ps1](voz.ps1) | reconhecimento de fala do Windows em pt-BR por PowerShell (alternativa que continua no código; o build exige o arquivo) |
| [gravador.ps1](gravador.ps1) | grava o microfone em WAV 16 kHz (`~/.orbita/eco-voz.wav`) pro Whisper local |
| [build.ps1](build.ps1) | monta `eco.html` com o [motor](../compartilhado/motor.js), o [helper da Órbita](../compartilhado/orbita-helper.ps1), o [medidor](../compartilhado/meter.ps1), a voz, o gravador e os ícones |

## Configurar

Funciona sem configurar nada. O que dá pra mudar, tudo no `<script type="module">` do [eco-src.html](eco-src.html):

| O quê | Onde |
|---|---|
| Apps "principais" (estado do PC pro Claude, trazer janela pra frente, ícones dos atalhos) | lista `APPS`, no mesmo formato da [Órbita](../orbita/README.md#configurar-os-apps-da-barra). Qualquer app instalado continua abrível pelo nome |
| Jeito do assistente (idioma, tamanho das respostas) | `rules()` |
| O que ele sabe fazer (abrir app ou pasta, música pela Onda, CPU e RAM, discos, pesquisa na web) | `claudeTools()` |
| Modelo do Claude | `MODEL` |
| Sugestões da tela inicial | `SUGGEST` |
| Atalhos globais | `SHORTCUT` (Alt+Shift+Espaço) e `SHORTCUT_VOICE` (Alt+Shift+V) |
| Voz | `VOICE` (vem `false`, só texto) |

**Voz (opcional):** com `VOICE = true`, o Eco tenta nesta ordem: o Whisper local na placa de vídeo (WebGPU), o ditado do próprio Claude (capability `dictation`) e o ditado do Windows (Win+H). O Whisper só liga se os arquivos estiverem em `~/.orbita/whisper-web/`: `ort-wasm-simd-threaded.jsep.wasm` e `.mjs` (do onnxruntime-web) e o modelo `onnx-community/whisper-base` em `base/` (com `onnx/encoder_model.onnx` e `onnx/decoder_model_merged_q4.onnx`). A página não baixa o modelo sozinha. Cada etapa da voz é registrada em `~/.orbita/eco.log`, só na sua máquina.

## Montar

```powershell
powershell -ExecutionPolicy Bypass -File modelos\eco\build.ps1 [-Saida <pasta>]
```

Saída: `eco.html` (padrão em `modelos/saida/`). Publique com a capability `desktop` e também `sample` (sem ela o Claude não responde); `tts` e `dictation` são opcionais. Instale como no [README dos modelos](../README.md#publicar-e-instalar-como-app). Permissões: `overlay`, `full-access`, `menu-bar`, `shortcuts`; na primeira pergunta, o app pede pra liberar o Claude.

## Bom saber

- Com a [Órbita](../orbita/README.md) aberta, o Eco nasce na tela dela (`~/.orbita/eco-ancora.json`) e publica o estado em `~/.orbita/eco.json` pro orbe.
- Com a [Onda](../onda/README.md) aberta, as ferramentas de música escolhem e controlam pelo Spotify; sem ela, só tocar/pausar e pular pelas teclas de mídia.
- O histórico das conversas fica no `localStorage` do app, na sua máquina.
- Ganchos de teste (`window.__eco`) só existem abrindo o HTML por `file://`, `data:` ou `localhost`.
