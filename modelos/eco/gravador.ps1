# Gravador do Eco: grava o microfone padrão em WAV 16 kHz mono pela API de áudio do Windows (MCI).
# A transcrição é feita pelo Whisper dentro do Eco (WebGPU), não aqui.
# Comandos: "gravar" | "parar" | "cancelar"     Respostas: pronto | gravando | salvo <caminho> | cancelado | erro <motivo>
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
function Out-Line($s) { [Console]::Out.WriteLine($s); [Console]::Out.Flush() }
Add-Type -TypeDefinition @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Threading; using System.Collections.Concurrent;
public static class EcoRec {
  [DllImport("winmm.dll", CharSet = CharSet.Unicode)] static extern int mciSendString(string cmd, StringBuilder ret, int len, IntPtr cb);
  [DllImport("winmm.dll", CharSet = CharSet.Unicode)] static extern bool mciGetErrorString(int err, StringBuilder buf, int len);
  public static string Mci(string cmd){ var sb = new StringBuilder(256); int r = mciSendString(cmd, sb, 256, IntPtr.Zero); if (r != 0){ var e = new StringBuilder(256); mciGetErrorString(r, e, 256); return "ERR " + e.ToString(); } return sb.ToString(); }
  public static ConcurrentQueue<string> Q = new ConcurrentQueue<string>();
  public static void Pump(){ var t = new Thread(() => { var r = new System.IO.StreamReader(Console.OpenStandardInput(), new UTF8Encoding(false)); string l; while ((l = r.ReadLine()) != null) Q.Enqueue(l.Trim()); Q.Enqueue("__fim__"); }); t.IsBackground = true; t.Start(); }
}
"@
$wav = Join-Path $env:USERPROFILE '.orbita\eco-voz.wav'
[EcoRec]::Pump()
Out-Line 'pronto'
$recording = $false
while ($true) {
  $c = $null
  if (-not [EcoRec]::Q.TryDequeue([ref]$c)) { Start-Sleep -Milliseconds 20; continue }
  if ($c -eq '__fim__') { break }
  if ($c -eq 'gravar' -and -not $recording) {
    [void][EcoRec]::Mci('close eco')
    $r = [EcoRec]::Mci('open new type waveaudio alias eco')
    if ($r.StartsWith('ERR')) { Out-Line "erro microfone $r"; continue }
    [void][EcoRec]::Mci('set eco time format ms bitspersample 16 channels 1 samplespersec 16000 bytespersec 32000 alignment 2')
    $r = [EcoRec]::Mci('record eco')
    if ($r.StartsWith('ERR')) { [void][EcoRec]::Mci('close eco'); Out-Line "erro microfone $r"; continue }
    $recording = $true; Out-Line 'gravando'
  }
  elseif ($c -eq 'cancelar' -and $recording) { [void][EcoRec]::Mci('stop eco'); [void][EcoRec]::Mci('close eco'); $recording = $false; Out-Line 'cancelado' }
  elseif ($c -eq 'parar' -and $recording) {
    [void][EcoRec]::Mci('stop eco')
    if (Test-Path $wav) { Remove-Item $wav -Force }
    $r = [EcoRec]::Mci("save eco `"$wav`"")
    [void][EcoRec]::Mci('close eco'); $recording = $false
    if ($r.StartsWith('ERR') -or -not (Test-Path $wav)) { Out-Line "erro gravacao $r" } else { Out-Line "salvo $wav" }
  }
}
