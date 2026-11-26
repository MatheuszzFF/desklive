# Monta os dois Boards (board.html e board-2.html), prontos pra publicar como dois artefatos.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\board\build.ps1 [-Saida <pasta>] [-SemTeste]
# Padrao da saida: modelos\saida\ (ignorada pelo git).
# O Board nao tem marcadores: o fonte ja e o HTML inteiro. Os dois so mudam no titulo, e e o titulo que diz
# qual e qual ("Board" e "Board <ponto> monitor 2"). Junto vai o simulador (teste-board.html, testes*.js, servir.ps1),
# que carrega board.html e board-2.html da mesma pasta.
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'), [switch]$SemTeste)
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')

$html = Read-Texto (Join-Path $PSScriptRoot 'board-src.html')
$t1 = '<title>Board</title>'
if (-not $html.Contains($t1)) { throw "board-src.html sem '$t1'" }
$t2 = '<title>Board ' + [char]0x00B7 + ' monitor 2</title>'
Save-Montado $Saida 'board.html' $html
Save-Montado $Saida 'board-2.html' ($html.Replace($t1, $t2))

if (-not $SemTeste) {
  $dest = (Resolve-Path $Saida).Path
  Get-ChildItem (Join-Path $PSScriptRoot 'teste') -File | ForEach-Object { Copy-Item $_.FullName (Join-Path $dest $_.Name) -Force }
  "simulador copiado: rode  powershell -ExecutionPolicy Bypass -File `"$dest\servir.ps1`"  e abra http://localhost:8765/"
}
