# Voz da Órbita (plano B quando o ditado do app do Claude não está disponível):
# reconhecimento de fala do Windows em pt-BR. Comandos: "ouvir", "parar".
# Responde: pronto | ouvindo | parcial <texto> | texto <texto> | vazio | erro <motivo>
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
function Out-Line($s) { [Console]::Out.WriteLine($s); [Console]::Out.Flush() }
try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  $null = [Windows.Media.SpeechRecognition.SpeechRecognizer, Windows.Media.SpeechRecognition, ContentType = WindowsRuntime]
  $null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]
  $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
  function Start-Op($op, [Type]$t) { $asTask.MakeGenericMethod($t).Invoke($null, @($op)) }
  $R = [Windows.Media.SpeechRecognition.SpeechRecognitionResult]
  $rz = New-Object Windows.Media.SpeechRecognition.SpeechRecognizer([Windows.Globalization.Language]::new('pt-BR'))
  try { $rz.Timeouts.InitialSilenceTimeout = [TimeSpan]::FromSeconds(7); $rz.Timeouts.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(1100) } catch {}
  $c = Start-Op ($rz.CompileConstraintsAsync()) ([Windows.Media.SpeechRecognition.SpeechRecognitionCompilationResult]); [void]$c.Wait(15000)
  if ($c.Result.Status.ToString() -ne 'Success') { Out-Line "erro compilacao $($c.Result.Status)"; exit }
  $hyp = $false
  try { Register-ObjectEvent -InputObject $rz -EventName HypothesisGenerated -SourceIdentifier hyp | Out-Null; $hyp = $true } catch {}
} catch { Out-Line "erro $($_.Exception.Message)"; exit }

# lê a entrada numa thread separada (no .NET Framework, ReadLineAsync do console bloqueia)
Add-Type -TypeDefinition @"
using System; using System.Threading; using System.Collections.Concurrent;
public static class VozStdin {
  public static ConcurrentQueue<string> Q = new ConcurrentQueue<string>();
  public static void Start(){ var t = new Thread(() => { var r = new System.IO.StreamReader(Console.OpenStandardInput(), new System.Text.UTF8Encoding(false)); string l; while ((l = r.ReadLine()) != null) Q.Enqueue(l); Q.Enqueue("__fim__"); }); t.IsBackground = true; t.Start(); }
}
"@
[VozStdin]::Start()
Out-Line 'pronto'
$op = $null; $rec = $null
while ($true) {
  $cmd = $null
  if ([VozStdin]::Q.TryDequeue([ref]$cmd)) {
    if ($cmd -eq '__fim__') { break }
    $cmd = $cmd.Trim()
    if ($cmd -eq 'ouvir' -and -not $rec) {
      try { $op = $rz.RecognizeAsync(); $rec = Start-Op $op $R; Out-Line 'ouvindo' }
      catch {
        $ex = $_.Exception; while ($ex.InnerException) { $ex = $ex.InnerException }
        $hr = '{0:X8}' -f $ex.HResult
        if ($hr -eq '80045509') { Out-Line 'erro privacidade' } else { Out-Line "erro 0x$hr" }
      }
    } elseif ($cmd -eq 'parar' -and $rec) {
      try { [void]$rz.StopRecognitionAsync() } catch { try { $op.Cancel() } catch {} }
    }
  }
  if ($hyp) { foreach ($e in @(Get-Event -SourceIdentifier hyp -ErrorAction SilentlyContinue)) { try { Out-Line ("parcial " + $e.SourceEventArgs.Hypothesis.Text) } catch {}; Remove-Event -EventIdentifier $e.EventIdentifier } }
  if ($rec -and $rec.IsCompleted) {
    if ($rec.IsCanceled) { Out-Line 'vazio' }
    elseif ($rec.IsFaulted) {
      $ex = $rec.Exception.InnerException; while ($ex.InnerException) { $ex = $ex.InnerException }
      $hr = '{0:X8}' -f $ex.HResult
      if ($hr -eq '80045509') { Out-Line 'erro privacidade' } else { Out-Line ("erro " + $ex.Message.Split("`n")[0]) }
    } else {
      $res = $rec.Result
      if ($res.Text) { Out-Line ("texto " + $res.Text) }
      elseif ($res.Status.ToString() -ne 'Success') { Out-Line ("erro " + $res.Status) }
      else { Out-Line 'vazio' }
    }
    $rec = $null; $op = $null
  }
  Start-Sleep -Milliseconds 40
}
