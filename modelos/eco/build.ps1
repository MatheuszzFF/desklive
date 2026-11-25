# Monta o Eco num HTML só (eco.html), pronto pra publicar como artefato.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\eco\build.ps1 [-Saida <pasta>]
# Padrão da saída: modelos\saida\ (ignorada pelo git).
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'))
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')
$C = $script:Compartilhado

$fonte = Read-Texto (Join-Path $PSScriptRoot 'eco-src.html')
$html = $fonte
$html = Set-Marcador $html '/*MOTOR*/'      (Read-Texto "$C\motor.js")                   # motor de movimento (igual nos três apps)
$html = Set-Marcador $html '/*ICONS*/{}'    (Get-IconesJson $fonte)                      # ícones dos apps da lista APPS
$html = Set-Marcador $html "/*HELPER*/''"   (Get-JsString "$C\orbita-helper.ps1")        # o mesmo helper da Órbita
$html = Set-Marcador $html "/*VOZ*/''"      (Get-JsString "$PSScriptRoot\voz.ps1")       # voz do Windows (plano B, VOICE = true)
$html = Set-Marcador $html "/*METER*/''"    (Get-JsString "$C\meter.ps1")                # nível do microfone
$html = Set-Marcador $html "/*GRAVADOR*/''" (Get-JsString "$PSScriptRoot\gravador.ps1")  # grava o microfone pro Whisper local
Save-Montado $Saida 'eco.html' $html
