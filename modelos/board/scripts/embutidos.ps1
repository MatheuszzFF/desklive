# Roda os trechos de PowerShell embutidos no Board (PS_TELAS e RELAY_PS) fora do app e mede.
# Uso:  powershell -ExecutionPolicy Bypass -File modelos\board\scripts\embutidos.ps1 [-Html <board.html>]
param([string]$Html = (Join-Path $PSScriptRoot '..\board-src.html'))
$h = [IO.File]::ReadAllText((Resolve-Path $Html).Path)
function Trecho($ini){ $i = $h.IndexOf($ini) + $ini.Length; $j = $h.IndexOf('`;', $i); $h.Substring($i, $j - $i) }
$telas = Trecho 'const PS_TELAS = `'
$b64 = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($telas))
$t0 = Get-Date; $saida = & powershell -NoProfile -NonInteractive -EncodedCommand $b64; $ms = ((Get-Date) - $t0).TotalMilliseconds
'TELAS (' + [Math]::Round($ms) + ' ms, comando de ' + $b64.Length + ' chars): ' + ($saida | Select-Object -Last 1)
$relay = Trecho 'const RELAY_PS = `'
function Abrir($me){ $s = '& {' + $relay + '} ' + $me; $e = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($s)); $pi = New-Object Diagnostics.ProcessStartInfo('powershell', ('-NoProfile -NonInteractive -EncodedCommand ' + $e)); $pi.UseShellExecute = $false; $pi.RedirectStandardInput = $true; $pi.RedirectStandardOutput = $true; $pi.CreateNoWindow = $true; [Diagnostics.Process]::Start($pi) }
$A = Abrir 'tstaaa'; $B = Abrir 'tstbbb'; $pa = $A.StandardOutput.ReadLine(); $pb = $B.StandardOutput.ReadLine()
$f = [Diagnostics.Stopwatch]::Frequency; $lat = @()
for ($i = 0; $i -lt 200; $i++){ $A.StandardInput.WriteLine('tstbbb' + [char]9 + '{"seq":' + $i + ',"t":' + [Diagnostics.Stopwatch]::GetTimestamp() + ',"txt":"ção"}'); $A.StandardInput.Flush(); $l = $B.StandardOutput.ReadLine(); $agora = [Diagnostics.Stopwatch]::GetTimestamp(); $tt = [long]($l.Substring($l.IndexOf('"t":') + 4, $l.IndexOf(',"txt"') - $l.IndexOf('"t":') - 4)); $lat += ($agora - $tt) * 1000.0 / $f }
$A.Kill(); $B.Kill(); $s = $lat | Sort-Object
'RELAY embutido: prontos=' + $pa + ' ' + $pb + ' · n=' + $lat.Count + ' p50=' + [Math]::Round($s[100], 3) + ' p95=' + [Math]::Round($s[190], 3) + ' máx=' + [Math]::Round($s[-1], 3) + ' ms'
