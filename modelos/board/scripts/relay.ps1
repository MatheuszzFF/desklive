param([string]$me)
$ErrorActionPreference = 'Stop'
$out = [IO.TextWriter]::Synchronized([Console]::Out)
$pool = [RunspaceFactory]::CreateRunspacePool(1, 10); $pool.Open()
$aceitar = [PowerShell]::Create(); $aceitar.RunspacePool = $pool
[void]$aceitar.AddScript({ param($me, $out, $pool)
  while ($true){
    $s = New-Object IO.Pipes.NamedPipeServerStream(('board-orbita-' + $me), [IO.Pipes.PipeDirection]::In, 8, [IO.Pipes.PipeTransmissionMode]::Byte, [IO.Pipes.PipeOptions]::Asynchronous)
    $s.WaitForConnection()
    $ler = [PowerShell]::Create(); $ler.RunspacePool = $pool
    [void]$ler.AddScript({ param($s, $out) $r = New-Object IO.StreamReader($s); while ($true){ $l = $r.ReadLine(); if ($l -eq $null){ break }; $out.WriteLine($l); $out.Flush() }; $s.Dispose() }).AddArgument($s).AddArgument($out)
    [void]$ler.BeginInvoke()
  } }).AddArgument($me).AddArgument($out).AddArgument($pool)
[void]$aceitar.BeginInvoke()
$out.WriteLine('{"tipo":"relay","estado":"pronto"}'); $out.Flush()
$cli = @{}; $tab = [char]9
while ($true){
  $l = [Console]::In.ReadLine(); if ($l -eq $null){ break }
  $i = $l.IndexOf($tab); if ($i -lt 1){ continue }
  $para = $l.Substring(0, $i); $txt = $l.Substring($i + 1)
  for ($k = 0; $k -lt 2; $k++){
    try {
      $w = $cli[$para]
      if ($w -eq $null){ $p = New-Object IO.Pipes.NamedPipeClientStream('.', ('board-orbita-' + $para), [IO.Pipes.PipeDirection]::Out); $p.Connect(200); $w = New-Object IO.StreamWriter($p); $w.AutoFlush = $true; $cli[$para] = $w }
      $w.WriteLine($txt); break
    } catch { $cli.Remove($para); if ($k -eq 1){ $out.WriteLine('{"tipo":"relay","semPar":"' + $para + '"}'); $out.Flush() } }
  }
}
