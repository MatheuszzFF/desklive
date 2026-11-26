# Monta a Mesa num HTML só (mesa.html), pronto pra publicar como artefato.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\mesa\build.ps1 [-Saida <pasta>]
# Padrão da saída: modelos\saida\ (ignorada pelo git).
# Os widgets são todos os .js de modelos\mesa\widgets, em ordem de nome (o número na frente decide a ordem).
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'))
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')

$html = Read-Texto (Join-Path $PSScriptRoot 'mesa-src.html')
$widgets = Get-ChildItem (Join-Path $PSScriptRoot 'widgets') -Filter *.js | Sort-Object Name | ForEach-Object { "/* ===== widgets/$($_.Name) ===== */`n" + (Read-Texto $_.FullName) }
$html = Set-Marcador $html '/*WIDGETS*/' ($widgets -join "`n")
$png = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'arte\dengas-atlas.png')))
$html = Set-Marcador $html "/*ATLAS_PNG*/''" ("'data:image/png;base64," + $png + "'")       # a arte do morador, embutida
$html = Set-Marcador $html '/*ATLAS*/{}' (Read-Texto (Join-Path $PSScriptRoot 'arte\dengas-atlas.json'))
Save-Montado $Saida 'mesa.html' $html
$sobra = [regex]::Matches($html, '/\*(WIDGETS|ATLAS|ATLAS_PNG)\*/') | ForEach-Object Value | Sort-Object -Unique
if ($sobra) { Write-Warning "mesa.html ainda tem marcadores: $($sobra -join ', ')" }
