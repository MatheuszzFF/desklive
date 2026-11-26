$nome = 'board-' + [guid]::NewGuid().ToString('N').Substring(0,8); $n = 300
$srv = Start-Job -ArgumentList $nome, $n -ScriptBlock { param($nome, $n)
  $s = New-Object IO.Pipes.NamedPipeServerStream($nome, [IO.Pipes.PipeDirection]::InOut); $s.WaitForConnection()
  $r = New-Object IO.StreamReader($s); $w = New-Object IO.StreamWriter($s); $w.AutoFlush = $true
  for ($i = 0; $i -lt $n; $i++){ $l = $r.ReadLine(); $w.WriteLine($l) } $s.Dispose() }
$c = New-Object IO.Pipes.NamedPipeClientStream('.', $nome, [IO.Pipes.PipeDirection]::InOut); $c.Connect(15000)
$r = New-Object IO.StreamReader($c); $w = New-Object IO.StreamWriter($c); $w.AutoFlush = $true
$f = [Diagnostics.Stopwatch]::Frequency; $lat = New-Object Collections.Generic.List[double]
for ($i = 0; $i -lt $n; $i++){ $t = [Diagnostics.Stopwatch]::GetTimestamp(); $w.WriteLine('{"seq":' + $i + ',"pad":"' + ('x' * 1500) + '"}'); [void]$r.ReadLine(); $lat.Add(([Diagnostics.Stopwatch]::GetTimestamp() - $t) * 500.0 / $f) }
$c.Dispose(); Receive-Job $srv -Wait | Out-Null; Remove-Job $srv -Force
$s = $lat | Sort-Object; [pscustomobject]@{ canal = 'named pipe (ida = metade da volta)'; n = $lat.Count; p50 = [Math]::Round($s[[int]($s.Count*.5)],3); p95 = [Math]::Round($s[[int]($s.Count*.95)],3); max = [Math]::Round($s[-1],3) } | ConvertTo-Json -Compress
