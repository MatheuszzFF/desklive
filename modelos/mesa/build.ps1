# Monta a Mesa num HTML só (mesa.html), pronto pra publicar como artefato.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\mesa\build.ps1 [-Saida <pasta>]
# Padrão da saída: modelos\saida\ (ignorada pelo git).
# Os widgets são todos os .js de modelos\mesa\widgets, em ordem de nome (o número na frente decide a ordem).
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'), [switch]$SemToqueDeTecla)
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')

$html = Read-Texto (Join-Path $PSScriptRoot 'mesa-src.html')
$widgets = Get-ChildItem (Join-Path $PSScriptRoot 'widgets') -Filter *.js | Sort-Object Name | ForEach-Object { "/* ===== widgets/$($_.Name) ===== */`n" + (Read-Texto $_.FullName) }
$html = Set-Marcador $html '/*WIDGETS*/' ($widgets -join "`n")
# helpers em PowerShell dos outros modelos: o marcador PS:pasta/arquivo.ps1 seguido de '' vira o arquivo como string JS
foreach ($m in [regex]::Matches($html, "/\*PS:([^*]+)\*/''")) { $html = $html.Replace($m.Value, (Get-JsString (Join-Path (Join-Path $PSScriptRoot '..') $m.Groups[1].Value))) }
# apps originais embutidos como hospedes: o marcador APP:nome seguido de '' vira o HTML montado daquele app, como string JS.
# -SemToqueDeTecla tira do helper da Orbita o toque no Alt (keybd_event) que ele da antes de trazer uma janela pra frente.
foreach ($m in [regex]::Matches($html, "/\*APP:([a-z]+)\*/''")) {
  $n = $m.Groups[1].Value; $tmp = Join-Path $env:TEMP 'mesa-apps'
  & (Join-Path (Join-Path (Join-Path $PSScriptRoot '..') $n) 'build.ps1') -Saida $tmp | Out-Null
  $app = Read-Texto (Join-Path $tmp "$n.html")
  if ($SemToqueDeTecla) { $app = $app.Replace('keybd_event(0x12, 0, 0, UIntPtr.Zero); keybd_event(0x12, 0, 2, UIntPtr.Zero);', '') }
  $html = $html.Replace($m.Value, (($app | ConvertTo-Json -Compress).Replace('</', '<\/')))
}
$png = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'arte\dengas-atlas.png')))
$html = Set-Marcador $html "/*ATLAS_PNG*/''" ("'data:image/png;base64," + $png + "'")       # a arte do morador, embutida
$html = Set-Marcador $html '/*ATLAS*/{}' (Read-Texto (Join-Path $PSScriptRoot 'arte\dengas-atlas.json'))
Save-Montado $Saida 'mesa.html' $html
$sobra = [regex]::Matches($html, '/\*(WIDGETS|ATLAS|ATLAS_PNG)\*/') | ForEach-Object Value | Sort-Object -Unique
if ($sobra) { Write-Warning "mesa.html ainda tem marcadores: $($sobra -join ', ')" }
