# Montagem do opcional "mesa": junta os arquivos da Mesa (o Dengas, a Onda, a Órbita, o navegador) sem mudar nada
# neles, e resolve os marcadores que eles usam, do mesmo jeito que modelos\mesa\build.ps1:
#   /*JS:caminho*/            o arquivo inteiro (caminho a partir de modelos\)
#   /*PS:caminho*/''          um helper PowerShell como string JS
#   /*APP:nome*/''            o HTML montado do app (modelos\<nome>\build.ps1), sem o toque no Alt da Órbita
#   /*ATLAS*/{} e /*ATLAS_PNG*/''   a arte do Dengas
param([string]$Js, [string]$Pasta)
$modelos = (Resolve-Path (Join-Path $Pasta '..\..\..')).Path
$Js = [regex]::Replace($Js, "/\*JS:([\w./\-]+)\*/", { param($m) "/* ==== $($m.Groups[1].Value) ==== */`n" + (Read-Texto (Join-Path $modelos $m.Groups[1].Value)) })
foreach ($m in [regex]::Matches($Js, "/\*PS:([^*]+)\*/''")) { $Js = $Js.Replace($m.Value, (Get-JsString (Join-Path $modelos $m.Groups[1].Value))) }
foreach ($m in [regex]::Matches($Js, "/\*APP:([a-z]+)\*/''")) {
  $n = $m.Groups[1].Value; $tmp = Join-Path $env:TEMP 'board-apps'
  # o app sai sem chave nenhuma embutida (a Onda pega o Client ID das chaves do Board, no PC de quem usa)
  if ($n -eq 'onda') { & (Join-Path (Join-Path $modelos $n) 'build.ps1') -Saida $tmp -ClientId 'SEU_CLIENT_ID' 3>$null | Out-Null }
  else { & (Join-Path (Join-Path $modelos $n) 'build.ps1') -Saida $tmp | Out-Null }
  $app = (Read-Texto (Join-Path $tmp "$n.html")).Replace('keybd_event(0x12, 0, 0, UIntPtr.Zero); keybd_event(0x12, 0, 2, UIntPtr.Zero);', '')   # nunca tecla
  $Js = $Js.Replace($m.Value, (($app | ConvertTo-Json -Compress).Replace('</', '<\/')))
}
$arte = Join-Path $modelos 'mesa\arte'
if ($Js.Contains("/*ATLAS_PNG*/''")) { $Js = $Js.Replace("/*ATLAS_PNG*/''", "'data:image/png;base64," + [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $arte 'dengas-atlas.png'))) + "'") }
if ($Js.Contains('/*ATLAS*/{}')) { $Js = $Js.Replace('/*ATLAS*/{}', (Read-Texto (Join-Path $arte 'dengas-atlas.json'))) }
$Js
