# Monta a Mesa num HTML só (mesa.html), pronto pra publicar como artefato.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\mesa\build.ps1 [-Saida <pasta>]
# Padrão da saída: modelos\saida\ (ignorada pelo git).
# Os widgets são todos os .js de modelos\mesa\widgets, em ordem de nome (o número na frente decide a ordem).
param([string]$Saida = (Join-Path $PSScriptRoot '..\saida'), [switch]$SemToqueDeTecla)
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')

$html = Read-Texto (Join-Path $PSScriptRoot 'mesa-src.html')
# os widgets da pasta e os que moram na pasta de cada app (em ordem: o Dengas primeiro)
$apps = @('..\dengas\dengas.js', '..\onda\board.js', '..\navegador\navegador.js', '..\orbita\board.js') | ForEach-Object { Get-Item (Join-Path $PSScriptRoot $_) }
$widgets = @($apps[0]) + (Get-ChildItem (Join-Path $PSScriptRoot 'widgets') -Filter *.js | Sort-Object Name) + @($apps[1..3]) | ForEach-Object { "/* ===== $($_.Directory.Name)/$($_.Name) ===== */`n" + (Resolve-Marcadores (Read-Texto $_.FullName) $_.DirectoryName) }
$html = Set-Marcador $html '/*WIDGETS*/' ($widgets -join "`n")
# os marcadores dos widgets (helpers, apps hospedados, arte do Dengas) ja vieram resolvidos pela Resolve-Marcadores
Save-Montado $Saida 'mesa.html' $html
$sobra = [regex]::Matches($html, '/\*(WIDGETS|ATLAS|ATLAS_PNG|APP:\w+|JS:[^*]+)\*/') | ForEach-Object Value | Sort-Object -Unique
if ($sobra) { Write-Warning "mesa.html ainda tem marcadores: $($sobra -join ', ')" }
