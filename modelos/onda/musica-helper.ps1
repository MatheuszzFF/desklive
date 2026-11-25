$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding $false
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.IRandomAccessStreamWithContentType, Windows.Storage.Streams, ContentType = WindowsRuntime]
$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
$asStream = [System.IO.WindowsRuntimeStreamExtensions].GetMethod('AsStreamForRead', [Type[]]@([Windows.Storage.Streams.IInputStream]))
function Wait-Op($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); [void]$task.Wait(5000); $task.Result }
$NS = 'Windows.Media.Control.GlobalSystemMediaTransportControlsSession'
$mgr = Wait-Op ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])

function Get-Session {
  $all = @($mgr.GetSessions())
  $s = $all | Where-Object { $_.SourceAppUserModelId -match 'Spotify' } | Select-Object -First 1
  if (-not $s) { $s = $mgr.GetCurrentSession() }
  $s
}
$script:artKey = ''; $script:art = ''
function Get-State {
  $s = Get-Session
  if (-not $s) { return @{ ok = $false } }
  $p = Wait-Op ($s.TryGetMediaPropertiesAsync()) ([Type]"$($NS)MediaProperties")
  $tl = $s.GetTimelineProperties(); $pb = $s.GetPlaybackInfo()
  $playing = ($pb.PlaybackStatus.ToString() -eq 'Playing')
  $pos = $tl.Position.TotalSeconds
  if ($playing) { $pos += ([DateTimeOffset]::Now - $tl.LastUpdatedTime).TotalSeconds }
  $dur = ($tl.EndTime - $tl.StartTime).TotalSeconds
  if ($dur -gt 0 -and $pos -gt $dur) { $pos = $dur }
  $key = "$($p.Artist)|$($p.Title)"
  if ($key -ne $script:artKey) {
    $script:artKey = $key; $script:art = ''
    if ($p.Thumbnail) {
      $rs = Wait-Op ($p.Thumbnail.OpenReadAsync()) ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
      if ($rs) {
        $st = $asStream.Invoke($null, @($rs))
        $ms = New-Object IO.MemoryStream; $st.CopyTo($ms); $st.Dispose()
        $script:art = [Convert]::ToBase64String($ms.ToArray())
      }
    }
  }
  @{
    ok = $true; app = $s.SourceAppUserModelId
    title = $p.Title; artist = $p.Artist; album = $p.AlbumTitle
    playing = $playing; status = $pb.PlaybackStatus.ToString()
    pos = [Math]::Round($pos, 1); dur = [Math]::Round($dur, 1)
    shuffle = $pb.IsShuffleActive; repeat = "$($pb.AutoRepeatMode)"
    canSeek = $pb.Controls.IsPlaybackPositionEnabled; canShuffle = $pb.Controls.IsShuffleEnabled; canRepeat = $pb.Controls.IsRepeatEnabled
    artKey = $key
  }
}
function Invoke-Cmd($cmd, $arg) {
  $s = Get-Session; if (-not $s) { return 'none' }
  $B = [bool]
  switch ($cmd) {
    'toggle' { $r = Wait-Op ($s.TryTogglePlayPauseAsync()) $B }
    'play'   { $r = Wait-Op ($s.TryPlayAsync()) $B }
    'pause'  { $r = Wait-Op ($s.TryPauseAsync()) $B }
    'next'   { $r = Wait-Op ($s.TrySkipNextAsync()) $B }
    'prev'   { $r = Wait-Op ($s.TrySkipPreviousAsync()) $B }
    'seek'   { $r = Wait-Op ($s.TryChangePlaybackPositionAsync([long]([double]$arg * 10000000))) $B }
    'shuffle'{ $r = Wait-Op ($s.TryChangeShuffleActiveAsync($arg -eq '1')) $B }
    'repeat' { $r = Wait-Op ($s.TryChangeAutoRepeatModeAsync([Windows.Media.MediaPlaybackAutoRepeatMode]$arg)) $B }
  }
  if ($r) { 'ok' } else { 'fail' }
}

# ---------- API do Spotify (token salvo pelo login da Onda em ~/.orbita) ----------
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$TOK = Join-Path $env:USERPROFILE '.orbita\spotify-token.json'
function Get-SpToken {
  if (-not (Test-Path $TOK)) { return $null }
  $t = [IO.File]::ReadAllText($TOK) | ConvertFrom-Json
  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  if ($t.expires_at -lt $now + 60) {
    $r = Invoke-RestMethod -Method Post -Uri 'https://accounts.spotify.com/api/token' -ContentType 'application/x-www-form-urlencoded' -Body @{ grant_type = 'refresh_token'; refresh_token = $t.refresh_token; client_id = $t.client_id }
    $t.access_token = $r.access_token; $t.expires_at = $now + [int]$r.expires_in
    if ($r.refresh_token) { $t.refresh_token = $r.refresh_token }
    [IO.File]::WriteAllText($TOK, ($t | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding $false))
  }
  $t.access_token
}
# api MÉTODO /caminho [corpo-json-em-base64]  ->  {"status":200,"body":"..."}
function Invoke-SpApi($method, $path, $bodyB64) {
  $tk = $null; try { $tk = Get-SpToken } catch { return (@{ status = 401; body = 'refresh_falhou' } | ConvertTo-Json -Compress) }
  if (-not $tk) { return '{"status":0,"body":"nao_conectado"}' }
  $body = $null; if ($bodyB64) { $body = [Text.Encoding]::UTF8.GetBytes([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($bodyB64))) }
  elseif ($method -ne 'GET') { $body = [byte[]]@() }
  try {
    $resp = Invoke-WebRequest -Method $method -Uri ('https://api.spotify.com/v1' + $path) -Headers @{ Authorization = "Bearer $tk" } -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 15
    $txt = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
    return (@{ status = [int]$resp.StatusCode; body = $txt } | ConvertTo-Json -Compress)
  } catch {
    $st = 0; $txt = "$($_.Exception.Message)"
    if ($_.Exception.Response) { $st = [int]$_.Exception.Response.StatusCode; try { $txt = (New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {} }
    return (@{ status = $st; body = $txt } | ConvertTo-Json -Compress)
  }
}

[Console]::Out.WriteLine('ready'); [Console]::Out.Flush()
while ($null -ne ($l = [Console]::In.ReadLine())) {
  $sp = $l.IndexOf(' '); if ($sp -lt 0) { continue }
  $id = $l.Substring(0, $sp); $rest = $l.Substring($sp + 1)
  $sp2 = $rest.IndexOf(' ')
  if ($sp2 -lt 0) { $cmd = $rest; $arg = '' } else { $cmd = $rest.Substring(0, $sp2); $arg = $rest.Substring($sp2 + 1) }
  $out = ''
  try {
    switch ($cmd) {
      'state' { $out = (Get-State | ConvertTo-Json -Compress) }
      'art'   { $out = $script:art }
      'api'   { $a = $arg.Split(' '); $out = Invoke-SpApi $a[0] $a[1] ($(if ($a.Count -gt 2) { $a[2] } else { '' })) }
      'conectado' { $out = $(if (Test-Path $TOK) { 'sim' } else { 'nao' }) }
      default { $out = Invoke-Cmd $cmd $arg }
    }
  } catch { $out = '' }
  [Console]::Out.WriteLine($id + ' ' + $out); [Console]::Out.Flush()
}
