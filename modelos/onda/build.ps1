# Monta a Onda num HTML só (onda.html), pronto pra publicar como artefato.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\onda\build.ps1 [-Saida <pasta>] [-ClientId <id>]
# O Client ID do Spotify vem de -ClientId ou de modelos\onda\config.json (copie o config.exemplo.json).
# Padrão da saída: modelos\saida\ (ignorada pelo git).
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'), [string]$ClientId = '')
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')
$C = $script:Compartilhado

if (-not $ClientId) {
  $cfg = Join-Path $PSScriptRoot 'config.json'
  if (Test-Path $cfg) { $ClientId = "$((Read-Texto $cfg | ConvertFrom-Json).spotifyClientId)".Trim() }
}
if (-not $ClientId -or $ClientId -eq 'SEU_CLIENT_ID') {
  Write-Warning 'sem Client ID do Spotify: a Onda monta e toca pela mídia do Windows, mas "Conectar" fica desligado (veja o README)'
  $ClientId = 'SEU_CLIENT_ID'
} elseif ($ClientId -notmatch '^[A-Za-z0-9]+$') { throw "Client ID estranho: '$ClientId' (só letras e números)" }

$html = Read-Texto (Join-Path $PSScriptRoot 'onda-src.html')
$html = Set-Marcador $html '/*MOTOR*/'                  (Read-Texto "$C\motor.js")                         # motor de movimento
$html = Set-Marcador $html "/*HELPER*/''"               (Get-JsString "$PSScriptRoot\musica-helper.ps1")   # mídia do Windows + API do Spotify
$html = Set-Marcador $html "/*METER*/''"                (Get-JsString "$C\meter.ps1")                      # pico do som que sai
$html = Set-Marcador $html "/*AUTH*/''"                 (Get-JsString "$PSScriptRoot\spotify-auth.ps1")    # login PKCE
$html = Set-Marcador $html "/*CLIENT_ID*/'SEU_CLIENT_ID'" ("'" + $ClientId + "'")
Save-Montado $Saida 'onda.html' $html
