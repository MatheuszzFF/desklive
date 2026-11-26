$rel = Join-Path $PSScriptRoot 'relay.ps1'
function Abrir($me){ $pi = New-Object Diagnostics.ProcessStartInfo('powershell', ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $rel + '" ' + $me)); $pi.UseShellExecute = $false; $pi.RedirectStandardInput = $true; $pi.RedirectStandardOutput = $true; $pi.CreateNoWindow = $true; [Diagnostics.Process]::Start($pi) }
$A = Abrir 'aaaaaa'; $B = Abrir 'bbbbbb'
$t0 = Get-Date; $prontoA = $A.StandardOutput.ReadLine(); $prontoB = $B.StandardOutput.ReadLine(); $partida = ((Get-Date) - $t0).TotalMilliseconds
$f = [Diagnostics.Stopwatch]::Frequency; $lat = New-Object Collections.Generic.List[double]; $n = 300; $perdidas = 0; $ord = 0; $ult = -1
for ($i = 0; $i -lt $n; $i++){
  $A.StandardInput.WriteLine('bbbbbb' + [char]9 + '{"seq":' + $i + ',"t":' + [Diagnostics.Stopwatch]::GetTimestamp() + ',"pad":"' + ('x' * 1500) + ' ç"}'); $A.StandardInput.Flush()
  $l = $B.StandardOutput.ReadLine(); $agora = [Diagnostics.Stopwatch]::GetTimestamp()
  $seq = [int]($l.Substring(7, $l.IndexOf(',') - 7)); if ($seq -ne $ult + 1){ $ord++ }; $ult = $seq
  $tt = [long]($l.Substring($l.IndexOf('"t":') + 4, $l.IndexOf(',"pad"') - $l.IndexOf('"t":') - 4)); $lat.Add(($agora - $tt) * 1000.0 / $f)
}
$A.StandardInput.WriteLine('zzzzzz' + [char]9 + '{}'); $A.StandardInput.Flush(); $semPar = $A.StandardOutput.ReadLine()
$A.Kill(); $B.Kill()
$s = $lat | Sort-Object
[pscustomobject]@{ partidaMs = [Math]::Round($partida); prontos = ($prontoA + ' ' + $prontoB); n = $lat.Count; foraDeOrdem = $ord; p50 = [Math]::Round($s[[int]($s.Count*.5)],3); p95 = [Math]::Round($s[[int]($s.Count*.95)],3); max = [Math]::Round($s[-1],3); paraQuemNaoExiste = $semPar } | ConvertTo-Json -Compress
