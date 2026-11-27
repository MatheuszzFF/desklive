$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'; [Console]::OutputEncoding = [Text.Encoding]::UTF8
$a = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('B64ARG')) | ConvertFrom-Json
function Sai($o) { ConvertTo-Json -InputObject $o -Compress -Depth 4 }
function Item1($f, [switch]$Cheio) {
  $o = @{ n = $f.Name; d = [bool]$f.PSIsContainer; t = $(if ($f.PSIsContainer) { 0 } else { $f.Length }); m = ([DateTimeOffset]$f.LastWriteTime).ToUnixTimeMilliseconds() }
  if ($Cheio) { $o.c = $f.FullName }
  $o
}
function Livre($dir, $nome) {
  $p = Join-Path $dir $nome; if (-not (Test-Path -LiteralPath $p)) { return $p }
  $ext = [IO.Path]::GetExtension($nome); if (Test-Path -LiteralPath $p -PathType Container) { $ext = '' }
  $base = $nome.Substring(0, $nome.Length - $ext.Length); $i = 2
  do { $p = Join-Path $dir "$base ($i)$ext"; $i++ } while (Test-Path -LiteralPath $p)
  $p
}
# pastas que nunca se mexem: raiz de disco, a pasta do usuario, as do sistema e as pastas conhecidas
function Protegida($p) {
  $c = [IO.Path]::GetFullPath($p).TrimEnd('\')
  if ($c.Length -le 2) { return $true }
  $fixas = @($env:USERPROFILE, $env:windir, $env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:ProgramData, (Split-Path $env:USERPROFILE), $env:APPDATA, $env:LOCALAPPDATA, $env:OneDrive)
  $fixas += 'Desktop', 'MyDocuments', 'MyPictures', 'MyMusic', 'MyVideos' | ForEach-Object { [Environment]::GetFolderPath($_) }
  $fixas += Join-Path $env:USERPROFILE 'Downloads'
  if ($c.StartsWith($env:windir + '\', 'OrdinalIgnoreCase')) { return $true }
  [bool]($fixas | Where-Object { $_ -and $_.TrimEnd('\') -ieq $c })
}
try {
  switch ($a.op) {
    'lugares' {
      $l = @(); foreach ($par in @(@('desktop', 'Área de Trabalho', 'Desktop'), @('downloads', 'Downloads', ''), @('documentos', 'Documentos', 'MyDocuments'), @('imagens', 'Imagens', 'MyPictures'), @('musicas', 'Músicas', 'MyMusic'), @('videos', 'Vídeos', 'MyVideos'))) {
        $c = if ($par[2]) { [Environment]::GetFolderPath($par[2]) } else { Join-Path $env:USERPROFILE 'Downloads' }
        if ($c -and (Test-Path -LiteralPath $c)) { $l += @{ id = $par[0]; nome = $par[1]; caminho = $c } } }
      $d = @([IO.DriveInfo]::GetDrives() | Where-Object IsReady | ForEach-Object { @{ nome = $(if ($_.VolumeLabel) { $_.VolumeLabel } else { 'Disco' }) + ' (' + $_.Name.TrimEnd('\') + ')'; caminho = $_.Name; livre = $_.AvailableFreeSpace; total = $_.TotalSize } })
      Sai @{ pastas = @($l); discos = $d }
    }
    'lista' {
      $f = @(Get-ChildItem -LiteralPath $a.pasta | Sort-Object @{ e = { -not $_.PSIsContainer } }, Name)
      Sai @{ pasta = (Get-Item -LiteralPath $a.pasta -Force).FullName; total = $f.Count; itens = @($f | Select-Object -First 500 | ForEach-Object { Item1 $_ }) }
    }
    'busca' {
      $fim = (Get-Date).AddSeconds(12); $achados = New-Object System.Collections.ArrayList; $fila = New-Object System.Collections.Queue; $fila.Enqueue($a.pasta); $cortado = $false
      while ($fila.Count) {
        if ($achados.Count -ge 200 -or (Get-Date) -gt $fim) { $cortado = $true; break }
        foreach ($f in @(Get-ChildItem -LiteralPath $fila.Dequeue() -ErrorAction SilentlyContinue)) {
          if ($f.Name.IndexOf([string]$a.texto, [StringComparison]::CurrentCultureIgnoreCase) -ge 0 -and $achados.Count -lt 200) { [void]$achados.Add((Item1 $f -Cheio)) }
          if ($f.PSIsContainer -and -not ($f.Attributes -band [IO.FileAttributes]::ReparsePoint)) { $fila.Enqueue($f.FullName) } } }
      Sai @{ itens = @($achados); cortado = $cortado }
    }
    'mini' {
      Add-Type -AssemblyName System.Drawing; $r = @()
      foreach ($p in @($a.itens)) { $b = ''
        try { if ((Get-Item -LiteralPath $p).Length -lt 30MB) {
            $img = [Drawing.Image]::FromFile($p); try { $k = [Math]::Min(1, 120 / [Math]::Max($img.Width, $img.Height)); $w = [Math]::Max(1, [int]($img.Width * $k)); $h = [Math]::Max(1, [int]($img.Height * $k))
              $bm = New-Object Drawing.Bitmap($w, $h); $g = [Drawing.Graphics]::FromImage($bm); $g.DrawImage($img, 0, 0, $w, $h); $ms = New-Object IO.MemoryStream; $bm.Save($ms, [Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bm.Dispose(); $b = [Convert]::ToBase64String($ms.ToArray()) } finally { $img.Dispose() } } } catch {}
        $r += $b }
      Sai @{ minis = @($r) }
    }
    'nova' { $p = Livre $a.pasta 'Nova pasta'; [void](New-Item -ItemType Directory -Path $p); Sai @{ ok = $true; nome = Split-Path $p -Leaf } }
    'renomeia' {
      $n = ([string]$a.nome).Trim()
      if (-not $n -or $n -eq '.' -or $n -eq '..' -or $n.IndexOfAny([IO.Path]::GetInvalidFileNameChars()) -ge 0) { throw 'nome inválido' }
      if (Protegida $a.item) { throw 'essa pasta é do sistema, não dá pra renomear' }
      Rename-Item -LiteralPath $a.item -NewName $n; Sai @{ ok = $true }
    }
    'cola' {
      $feitos = 0; $dest = (Get-Item -LiteralPath $a.pasta -Force).FullName
      foreach ($p in @($a.itens)) {
        $f = Get-Item -LiteralPath $p -Force
        if ($f.PSIsContainer -and ($dest.TrimEnd('\') + '\').StartsWith($f.FullName.TrimEnd('\') + '\', 'OrdinalIgnoreCase')) { throw "não dá pra pôr a pasta $($f.Name) dentro dela mesma" }
        if ($a.mover) { if (Protegida $f.FullName) { throw "$($f.Name) é do sistema, não dá pra mover" }
          if ((Split-Path $f.FullName).TrimEnd('\') -ieq $dest.TrimEnd('\')) { continue } }
        $para = Livre $dest $f.Name
        if ($a.mover) { Move-Item -LiteralPath $f.FullName -Destination $para } else { Copy-Item -LiteralPath $f.FullName -Destination $para -Recurse }
        $feitos++ }
      Sai @{ ok = $true; feitos = $feitos }
    }
    'lixeira' {
      Add-Type -AssemblyName Microsoft.VisualBasic; $feitos = 0
      foreach ($p in @($a.itens)) {
        $f = Get-Item -LiteralPath $p -Force
        if (Protegida $f.FullName) { throw "$($f.Name) é do sistema, não vai pra lixeira" }
        # sem lixeira (rede, pendrive) apagaria de vez: nesse caso não apaga
        if ($f.FullName.StartsWith('\\') -or ([IO.DriveInfo]$f.FullName.Substring(0, 3)).DriveType -ne 'Fixed') { throw 'esse disco não tem lixeira; apague pelo Windows se for isso mesmo' }
        if ($f.PSIsContainer) { [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($f.FullName, 'OnlyErrorDialogs', 'SendToRecycleBin') } else { [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($f.FullName, 'OnlyErrorDialogs', 'SendToRecycleBin') }
        $feitos++ }
      Sai @{ ok = $true; feitos = $feitos }
    }
    'abre' { Invoke-Item -LiteralPath $a.item; Sai @{ ok = $true } }
    default { throw 'operação desconhecida' }
  }
} catch { Sai @{ erro = $_.Exception.Message } }
