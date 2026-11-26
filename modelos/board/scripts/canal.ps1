param([string]$modo = 'rename', [int]$n = 400, [int]$poll = 12)
$def = @'
using System;using System.IO;using System.Runtime.InteropServices;using System.Text;
public static class Canal{
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] public static extern bool MoveFileEx(string a,string b,int f);
 [DllImport("winmm.dll")] public static extern int timeBeginPeriod(int p);
 public static void Escrever(string arq,string txt,bool atomico){
  if(atomico){ string tmp=arq+".tmp"; File.WriteAllText(tmp,txt); if(!MoveFileEx(tmp,arq,1)) throw new IOException("rename "+Marshal.GetLastWin32Error()); }
  else { using(var f=new FileStream(arq,FileMode.Create,FileAccess.Write,FileShare.ReadWrite|FileShare.Delete)){ var b=Encoding.UTF8.GetBytes(txt); f.Write(b,0,b.Length/2); f.Flush(); System.Threading.Thread.Sleep(0); f.Write(b,b.Length/2,b.Length-b.Length/2);} }
 }
 public static string Ler(string arq){ using(var f=new FileStream(arq,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete)) using(var r=new StreamReader(f)) return r.ReadToEnd(); }
}
'@
Add-Type -TypeDefinition $def; [Canal]::timeBeginPeriod(1) | Out-Null
$dir = Join-Path $env:TEMP ('board-canal-' + [guid]::NewGuid().ToString('N').Substring(0,8)); New-Item -ItemType Directory $dir | Out-Null
$arq = Join-Path $dir 'caixa.json'
$freq = [Diagnostics.Stopwatch]::Frequency
$escritor = Start-Job -ArgumentList $arq, $modo, $n, $def -ScriptBlock { param($arq, $modo, $n, $def)
  Add-Type -TypeDefinition $def; [Canal]::timeBeginPeriod(1) | Out-Null; $falhas = 0
  Start-Sleep -Milliseconds 1500
  for ($i = 1; $i -le $n; $i++){
    $txt = '{"seq":' + $i + ',"t":' + [Diagnostics.Stopwatch]::GetTimestamp() + ',"pad":"' + ('x' * 1500) + '"}'
    try { [Canal]::Escrever($arq, $txt, $modo -eq 'rename') } catch { $falhas++ }
    [Threading.Thread]::Sleep(16)
  }
  $falhas }
$p = [Diagnostics.Process]::GetCurrentProcess(); $cpu0 = $p.TotalProcessorTime; $t0 = Get-Date
$lat = New-Object Collections.Generic.List[double]; $quebradas = 0; $ult = 0; $fora = 0; $leituras = 0; $erros = 0; $dup = 0
$fim = (Get-Date).AddSeconds(1.6 + [double]$n * 0.0175 + 1.5)
while ((Get-Date) -lt $fim){
  try { $s = [Canal]::Ler($arq); $leituras++
    $ok = $s.EndsWith('"}'); if (-not $ok){ $quebradas++ } else {
      $seq = [int]($s.Substring(7, $s.IndexOf(',') - 7)); $tt = [long]($s.Substring($s.IndexOf('"t":') + 4, $s.IndexOf(',"pad"') - $s.IndexOf('"t":') - 4))
      if ($seq -gt $ult){ if ($ult -and $seq -ne $ult + 1){ $fora += $seq - $ult - 1 }; $ult = $seq; $lat.Add(([Diagnostics.Stopwatch]::GetTimestamp() - $tt) * 1000.0 / $freq) } elseif ($seq -lt $ult) { $dup++ } }
  } catch { $erros++ }
  [Threading.Thread]::Sleep($poll)
}
$cpu = ($p.TotalProcessorTime - $cpu0).TotalMilliseconds; $dur = ((Get-Date) - $t0).TotalMilliseconds
$falhasEsc = Receive-Job $escritor -Wait; Remove-Job $escritor -Force; Remove-Item -Recurse -Force $dir
$s = $lat | Sort-Object; $q = { param($pp) $s[[Math]::Min($s.Count - 1, [Math]::Floor($pp * $s.Count))] }
[pscustomobject]@{ modo = $modo; poll = $poll; recebidas = $lat.Count; de = $n; puladas = $fora; voltouAtras = $dup; leiturasQuebradas = $quebradas; errosDeLeitura = $erros; falhasEscrita = $falhasEsc; leituras = $leituras; latP50 = [Math]::Round((& $q 0.5), 2); latP95 = [Math]::Round((& $q 0.95), 2); latMax = [Math]::Round($s[-1], 2); cpuLeitorPctMaquina = [Math]::Round(100 * $cpu / $dur / [Environment]::ProcessorCount, 2) } | ConvertTo-Json -Compress
