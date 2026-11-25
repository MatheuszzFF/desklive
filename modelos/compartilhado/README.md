# Compartilhado

> **O que é:** o código que mais de um modelo usa: o motor de movimento, dois helpers em PowerShell e as funções da montagem. **Quando ler:** antes de mexer no arrasto (vale pros três apps) ou num helper. Índice: [modelos](../README.md).

| Arquivo | Usado por | O que faz | Doc |
|---|---|---|---|
| [motor.js](motor.js) | Órbita, Onda, Eco (no lugar de `/*MOTOR*/`) | motor de movimento v2.2: mola, envio da janela no máximo uma vez por quadro, commit de tamanho, gesto de arrastar | [motor](../../referencias/motor/README.md) |
| [orbita-helper.ps1](orbita-helper.ps1) | Órbita, Eco (`/*HELPER*/''`) | foco de janela, CPU, RAM, temperatura da placa (`nvidia-smi`, opcional), título da música, ícones, teclas, discos, apps instalados | [arquitetura](../../padroes/arquitetura.md) |
| [meter.ps1](meter.ps1) | Onda (som que sai), Eco (microfone) (`/*METER*/''`) | pico do áudio ~30 vezes por segundo pela API de medição do Windows | [onda e cor](../../apps/onda/onda-e-cor.md) |
| [montagem.ps1](montagem.ps1) | os `build.ps1` | lê os arquivos, troca os marcadores (falha se faltar um), extrai os ícones da lista `APPS` e confere que não sobrou marcador | — |

Os helpers conversam com a página por linhas no formato `id comando argumento` → `id resultado` e rodam com `-EncodedCommand`; por isso entram no HTML como string. Mexeu num helper: monte de novo os apps que usam ele.
