# Monta os três modelos (Órbita, Onda, Eco) de uma vez.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\build-todos.ps1 [-Saida <pasta>]
param([string]$Saida = (Join-Path $PSScriptRoot 'saida'))
foreach ($app in 'orbita', 'onda', 'eco') { & (Join-Path $PSScriptRoot "$app\build.ps1") -Saida $Saida }
