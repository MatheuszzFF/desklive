# Empacota um app (modelos\<nome>\board.js, com os marcadores resolvidos) como peça ao vivo em ~\.orbita\pecas.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\vivo\empacota.ps1 -Nome explorer
param([Parameter(Mandatory)][ValidatePattern('^[a-z0-9-]+$')][string]$Nome, [string]$Saida = (Join-Path $env:USERPROFILE '.orbita\pecas'))
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '..\compartilhado\montagem.ps1')
$pasta = (Resolve-Path (Join-Path $PSScriptRoot "..\$Nome")).Path
$js = Resolve-Marcadores (Read-Texto (Join-Path $pasta 'board.js')) $pasta
New-Item -ItemType Directory -Force $Saida | Out-Null
$arq = Join-Path $Saida "$Nome.js"
[IO.File]::WriteAllText($arq, $js, [Text.UTF8Encoding]::new($false))
"$arq ($($js.Length) caracteres)"
