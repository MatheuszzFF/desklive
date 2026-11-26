$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add('http://localhost:8765/')
$l.Start()
Write-Output "servindo $raiz em http://localhost:8765/"
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
  if ($p -eq '') { $p = 'teste-board.html' }
  $f = Join-Path $raiz $p
  if ((Test-Path $f -PathType Leaf) -and ([IO.Path]::GetFullPath($f).StartsWith($raiz))) {
    $b = [IO.File]::ReadAllBytes($f)
    $c.Response.ContentType = if ($f -like '*.html') { 'text/html; charset=utf-8' } elseif ($f -like '*.js') { 'text/javascript' } else { 'application/octet-stream' }
    $c.Response.Headers.Add('Cache-Control', 'no-store')
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
