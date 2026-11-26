# Monta os dois Boards (board.html e board-2.html), prontos pra publicar como dois artefatos.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\board\build.ps1 [-Saida <pasta>] [-SemTeste] [-Pecas a,b,c]
# Padrao da saida: modelos\saida\ (ignorada pelo git).
# Os dois so mudam no titulo, e e o titulo que diz qual e qual ("Board" e "Board <ponto> monitor 2").
# Junto vai o simulador (teste-board.html, testes*.js, servir.ps1), que carrega board.html e board-2.html da mesma pasta.
#
# -Pecas: os opcionais que entram neste Board, na ordem dada. Cada um e um app do desklive com um board.js na pasta
# dele (modelos\<nome>\board.js); os marcadores sao os da montagem compartilhada (Resolve-Marcadores).
# Sem -Pecas o Board sai vazio, so com a Sonda: o quadro limpo.
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'), [switch]$SemTeste, [string[]]$Pecas = @())
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')

$html = Read-Texto (Join-Path $PSScriptRoot 'board-src.html')
$t1 = '<title>Board</title>'
if (-not $html.Contains($t1)) { throw "board-src.html sem '$t1'" }
$marca = '/*PECAS*/'
if (-not $html.Contains($marca)) { throw "board-src.html sem o marcador $marca" }

$junto = New-Object System.Text.StringBuilder
foreach ($nome in ($Pecas | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })) {
  $pasta = Join-Path $PSScriptRoot "..\$nome"
  $arq = Join-Path $pasta 'board.js'
  if (-not (Test-Path $arq)) { throw "opcional '$nome': nao achei $arq" }
  $js = Read-Texto $arq
  $js = Resolve-Marcadores $js (Resolve-Path $pasta).Path
  [void]$junto.Append("`n/* ---- opcional: $nome ---- */`n{`n").Append($js).Append("`n}`n")
  "opcional: $nome"
}
$html = $html.Replace($marca, $junto.ToString())

$t2 = '<title>Board ' + [char]0x00B7 + ' monitor 2</title>'
Save-Montado $Saida 'board.html' $html
Save-Montado $Saida 'board-2.html' ($html.Replace($t1, $t2))

if (-not $SemTeste) {
  $dest = (Resolve-Path $Saida).Path
  Get-ChildItem (Join-Path $PSScriptRoot 'teste') -File | ForEach-Object { Copy-Item $_.FullName (Join-Path $dest $_.Name) -Force }
  "simulador copiado: rode  powershell -ExecutionPolicy Bypass -File `"$dest\servir.ps1`"  e abra http://localhost:8765/"
}
