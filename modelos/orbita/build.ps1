# Monta a Órbita num HTML só (orbita.html), pronto pra publicar como artefato.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\orbita\build.ps1 [-Saida <pasta>]
# Padrão da saída: modelos\saida\ (ignorada pelo git).
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'))
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')
$C = $script:Compartilhado

$fonte = Read-Texto (Join-Path $PSScriptRoot 'orbita-src.html')
$html = $fonte
$html = Set-Marcador $html '/*MOTOR*/'    (Read-Texto "$C\motor.js")              # motor de movimento (igual nos três apps)
$html = Set-Marcador $html '/*ICONS*/{}'  (Get-IconesJson $fonte)                 # ícones dos apps da lista APPS
$html = Set-Marcador $html "/*HELPER*/''" (Get-JsString "$C\orbita-helper.ps1")   # foco, CPU/RAM/placa, ícones, teclas
Save-Montado $Saida 'orbita.html' $html
