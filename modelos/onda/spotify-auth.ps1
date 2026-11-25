# Login do Spotify (PKCE): espera o retorno em 127.0.0.1:8977, troca o código pelo token e salva em ~/.orbita
# __CLIENT__, __VERIFIER__ e __STATE__ são trocados pela Onda antes de rodar
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Web
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$clientId = '__CLIENT__'; $verifier = '__VERIFIER__'; $state = '__STATE__'
$redirect = 'http://127.0.0.1:8977/callback'
$dir = Join-Path $env:USERPROFILE '.orbita'; New-Item -ItemType Directory -Force $dir | Out-Null
$tokFile = Join-Path $dir 'spotify-token.json'

function Send-Page($stream, $title, $msg) {
  $html = "<!doctype html><meta charset=utf-8><title>Onda</title><body style='margin:0;height:100vh;display:grid;place-items:center;background:#0b0d14;color:#f4f5f8;font:16px Segoe UI,system-ui'><div style='text-align:center'><div style='font:600 26px Segoe UI;margin-bottom:8px'>$title</div><div style='color:#9aa0b0'>$msg</div></div>"
  $b = [Text.Encoding]::UTF8.GetBytes($html)
  $h = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 200 OK`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($b.Length)`r`nConnection: close`r`n`r`n")
  $stream.Write($h, 0, $h.Length); $stream.Write($b, 0, $b.Length); $stream.Flush()
}

$l = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, 8977)
try { $l.Start() } catch { 'err porta 8977 ocupada'; exit }
$deadline = (Get-Date).AddMinutes(5)
try {
  while ((Get-Date) -lt $deadline) {
    if (-not $l.Pending()) { Start-Sleep -Milliseconds 200; continue }
    $c = $l.AcceptTcpClient(); $s = $c.GetStream(); $s.ReadTimeout = 5000
    $rd = New-Object IO.StreamReader($s); $line = $rd.ReadLine()
    if ($line -notmatch '^GET (/callback\?[^ ]*) HTTP') { $c.Close(); continue }   # ignora favicon etc.
    $qs = [Web.HttpUtility]::ParseQueryString(([uri]('http://x' + $Matches[1])).Query)
    if ($qs['state'] -ne $state) { Send-Page $s 'Algo não bateu' 'Tente conectar de novo pela Onda.'; $c.Close(); 'err state'; break }
    if ($qs['error']) { Send-Page $s 'Conexão cancelada' 'Você pode tentar de novo pela Onda quando quiser.'; $c.Close(); "err $($qs['error'])"; break }
    $r = Invoke-RestMethod -Method Post -Uri 'https://accounts.spotify.com/api/token' -ContentType 'application/x-www-form-urlencoded' -Body @{
      grant_type = 'authorization_code'; code = $qs['code']; redirect_uri = $redirect; client_id = $clientId; code_verifier = $verifier }
    $tok = @{ client_id = $clientId; access_token = $r.access_token; refresh_token = $r.refresh_token; scope = $r.scope
              expires_at = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() + [int]$r.expires_in }
    [IO.File]::WriteAllText($tokFile, ($tok | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding $false))
    Send-Page $s 'Spotify conectado ✓' 'Pode fechar esta aba. A Onda já consegue escolher suas músicas.'
    $c.Close(); 'ok'; break
  }
  if ((Get-Date) -ge $deadline) { 'err tempo esgotado' }
} catch { "err $($_.Exception.Message)" } finally { $l.Stop() }
