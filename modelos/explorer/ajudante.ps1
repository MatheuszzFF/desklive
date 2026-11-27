$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'; $u = [Text.UTF8Encoding]::new($false); [Console]::OutputEncoding = $u
$entrada = [IO.StreamReader]::new([Console]::OpenStandardInput(), $u)
Add-Type -AssemblyName Microsoft.VisualBasic, System.Drawing
function Item($f, [switch]$Caminho) {
  $d = $f -is [IO.DirectoryInfo]
  $o = [ordered]@{ n = $f.Name; d = $d; t = $(if ($d) { 0 } else { $f.Length }); m = [DateTimeOffset]::new($f.LastWriteTimeUtc).ToUnixTimeMilliseconds() }
  if ($Caminho) { $o.p = $f.FullName }; $o
}
function Some($f) { ($f.Attributes -band ([IO.FileAttributes]::Hidden -bor [IO.FileAttributes]::System)) -ne 0 }
function Cheio($p) { if (-not $p -or $p -notmatch '^([A-Za-z]:\\|\\\\)') { throw 'caminho invalido' }; [IO.Path]::GetFullPath($p) }
function Existe($p) { (Test-Path -LiteralPath $p) }
function Pastas {
  $l = [ordered]@{ area = [Environment]::GetFolderPath('Desktop') }
  try { $l.downloads = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path } catch { $l.downloads = Join-Path $env:USERPROFILE 'Downloads' }
  $l.documentos = [Environment]::GetFolderPath('MyDocuments'); $l.imagens = [Environment]::GetFolderPath('MyPictures'); $l.musicas = [Environment]::GetFolderPath('MyMusic'); $l.videos = [Environment]::GetFolderPath('MyVideos'); $l
}
# nome que nao existe no destino: "foto (2).png"
function Vago($pasta, $nome, $ehPasta) {
  $alvo = Join-Path $pasta $nome; if (-not (Existe $alvo)) { return $alvo }
  $base = $nome; $ext = ''; if (-not $ehPasta) { $base = [IO.Path]::GetFileNameWithoutExtension($nome); $ext = [IO.Path]::GetExtension($nome) }
  for ($i = 2; $i -lt 1000; $i++) { $alvo = Join-Path $pasta "$base ($i)$ext"; if (-not (Existe $alvo)) { return $alvo } }; throw 'nomes demais iguais'
}
function Valida($n) { $n = ([string]$n).Trim(); if (-not $n -or $n -eq '.' -or $n -eq '..' -or $n.IndexOfAny([IO.Path]::GetInvalidFileNameChars()) -ge 0 -or $n.EndsWith('.')) { throw 'esse nome nao vale no Windows' }; $n }
# o que nunca se mexe: raiz de disco, Windows, Programas, a pasta do usuario e as pastas conhecidas
function Protegido($p) {
  $x = $p.TrimEnd('\'); if ($x.Length -le 2) { return $true }
  foreach ($r in @($env:windir, $env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:ProgramData)) { if ($r -and ($x -eq $r -or $x.StartsWith($r + '\', 'OrdinalIgnoreCase'))) { return $true } }
  foreach ($r in @($env:USERPROFILE, (Split-Path $env:USERPROFILE -Parent), (Join-Path $env:USERPROFILE 'AppData')) + @((Pastas).Values)) { if ($r -and $x -eq $r.TrimEnd('\')) { return $true } }
  $false
}
function Faz($a) {
  switch ($a.acao) {
    'lugares' {
      $discos = @([IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady } | ForEach-Object { [ordered]@{ p = $_.Name; rotulo = $_.VolumeLabel; livre = $_.AvailableFreeSpace; total = $_.TotalSize } })
      return @{ pastas = (Pastas); discos = $discos }
    }
    'lista' {
      $p = Cheio $a.caminho; $dir = [IO.DirectoryInfo]::new($p); if (-not $dir.Exists) { throw 'essa pasta nao existe' }
      $todos = @($dir.GetFileSystemInfos() | Where-Object { $a.ocultos -or -not (Some $_) })
      $ord = @($todos | Sort-Object @{ e = { $_ -isnot [IO.DirectoryInfo] } }, Name | Select-Object -First 800)
      return @{ caminho = $dir.FullName; total = $todos.Count; itens = @($ord | ForEach-Object { Item $_ }) }
    }
    'busca' {
      $p = Cheio $a.caminho; $q = [string]$a.texto; $achou = [Collections.ArrayList]::new(); $fila = [Collections.Queue]::new(); $fila.Enqueue(@($p, 0)); $t = [Diagnostics.Stopwatch]::StartNew(); $cortou = $false
      while ($fila.Count) {
        if ($achou.Count -ge 200 -or $t.Elapsed.TotalSeconds -gt 10) { $cortou = $true; break }
        $x = $fila.Dequeue(); try { $fs = [IO.DirectoryInfo]::new($x[0]).GetFileSystemInfos() } catch { continue }
        foreach ($f in $fs) { if (Some $f) { continue }; if ($f.Name.IndexOf($q, [StringComparison]::OrdinalIgnoreCase) -ge 0 -and $achou.Count -lt 200) { [void]$achou.Add((Item $f -Caminho)) }
          if ($f -is [IO.DirectoryInfo] -and $x[1] -lt 6 -and -not ($f.Attributes -band [IO.FileAttributes]::ReparsePoint)) { $fila.Enqueue(@($f.FullName, ($x[1] + 1))) } }
      }
      return @{ itens = @($achou); cortou = $cortou }
    }
    'mini' {
      $r = @{}; foreach ($c in @($a.caminhos) | Select-Object -First 12) {
        try { $p = Cheio $c; if ((Get-Item -LiteralPath $p).Length -gt 25MB) { continue }
          $fl = [IO.File]::OpenRead($p); try { $img = [Drawing.Image]::FromStream($fl, $false, $false)
            $k = [Math]::Min(1, 128 / [Math]::Max($img.Width, $img.Height)); $b = [Drawing.Bitmap]::new([Math]::Max(1, [int]($img.Width * $k)), [Math]::Max(1, [int]($img.Height * $k)))
            $g = [Drawing.Graphics]::FromImage($b); $g.InterpolationMode = 'HighQualityBicubic'; $g.Clear([Drawing.Color]::FromArgb(22, 24, 33)); $g.DrawImage($img, 0, 0, $b.Width, $b.Height)
            $m = [IO.MemoryStream]::new(); $b.Save($m, [Drawing.Imaging.ImageFormat]::Jpeg); $r[$c] = [Convert]::ToBase64String($m.ToArray()); $g.Dispose(); $b.Dispose(); $img.Dispose(); $m.Dispose()
          } finally { $fl.Dispose() } } catch {}
      }
      return @{ minis = $r }
    }
    'nova' { $p = Cheio $a.caminho; $alvo = Vago $p (Valida $a.nome) $true; [void][IO.Directory]::CreateDirectory($alvo); return @{ feito = $alvo } }
    'renomear' {
      $p = Cheio $a.origem; if (Protegido $p) { throw 'essa o Explorer nao mexe: e do sistema' }; $n = Valida $a.nome; $i = Get-Item -LiteralPath $p -Force
      $alvo = Join-Path (Split-Path $p -Parent) $n; if ($alvo -ceq $p) { return @{ feito = $p } }
      if ((Existe $alvo) -and $alvo -ne $p) { throw 'ja existe um com esse nome' }
      if ($alvo -eq $p) { $meio = $p + '.~renomeando'; $i.MoveTo($meio); (Get-Item -LiteralPath $meio -Force).MoveTo($alvo) } else { $i.MoveTo($alvo) }; return @{ feito = $alvo }
    }
    { $_ -in 'copiar', 'mover' } {
      $dest = Cheio $a.destino; if (-not (Test-Path -LiteralPath $dest -PathType Container)) { throw 'o destino nao e uma pasta' }; $n = 0
      foreach ($c in @($a.origens)) {
        $p = Cheio $c; $i = Get-Item -LiteralPath $p -Force; $pasta = $i.PSIsContainer
        if ($pasta -and ($dest.TrimEnd('\') + '\').StartsWith($p.TrimEnd('\') + '\', 'OrdinalIgnoreCase')) { throw 'nao da pra por uma pasta dentro dela mesma' }
        if ($a.acao -eq 'mover') { if (Protegido $p) { throw 'essa o Explorer nao move: e do sistema' }; if ((Split-Path $p -Parent).TrimEnd('\') -eq $dest.TrimEnd('\')) { continue } }
        $alvo = Vago $dest $i.Name $pasta
        if ($a.acao -eq 'copiar') { Copy-Item -LiteralPath $p -Destination $alvo -Recurse } elseif ($pasta) { [Microsoft.VisualBasic.FileIO.FileSystem]::MoveDirectory($p, $alvo) } else { [Microsoft.VisualBasic.FileIO.FileSystem]::MoveFile($p, $alvo) }; $n++
      }
      return @{ feito = $n }
    }
    'lixeira' {
      # primeiro confere tudo, depois apaga: so vai o que cabe na Lixeira (disco fixo e menos de 2 GB), nunca apaga de vez
      $l = @(foreach ($c in @($a.origens)) {
        $p = Cheio $c; if (Protegido $p) { throw 'essa o Explorer nao apaga: e do sistema' }
        if ($p.StartsWith('\\') -or [IO.DriveInfo]::new([IO.Path]::GetPathRoot($p)).DriveType -ne 'Fixed') { throw 'esse disco nao tem Lixeira; apague pelo Windows' }
        $i = Get-Item -LiteralPath $p -Force; $soma = 0L
        if ($i.PSIsContainer) { foreach ($f in Get-ChildItem -LiteralPath $p -Recurse -Force -File -ErrorAction SilentlyContinue) { $soma += $f.Length; if ($soma -gt 2GB) { break } } } else { $soma = $i.Length }
        if ($soma -gt 2GB) { throw "$($i.Name) passa de 2 GB e podia ser apagado de vez; apague pelo Windows" }; $i })
      foreach ($i in $l) { if ($i.PSIsContainer) { [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($i.FullName, 'OnlyErrorDialogs', 'SendToRecycleBin') } else { [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($i.FullName, 'OnlyErrorDialogs', 'SendToRecycleBin') } }
      return @{ feito = $l.Count }
    }
    'abrir' { Invoke-Item -LiteralPath (Cheio $a.caminho); return @{ feito = 1 } }
    default { throw 'acao desconhecida' }
  }
}
while ($null -ne ($linha = $entrada.ReadLine())) {
  $id, $cmd, $arg = $linha.Split(' ', 3); if (-not $id) { continue }
  try { $r = Faz ($u.GetString([Convert]::FromBase64String($arg)) | ConvertFrom-Json) } catch { $e = $_.Exception; if ($e.InnerException) { $e = $e.InnerException }; $r = @{ erro = $e.Message } }
  [Console]::Out.WriteLine($id + ' b64:' + [Convert]::ToBase64String($u.GetBytes((ConvertTo-Json -InputObject $r -Depth 5 -Compress)))); [Console]::Out.Flush()
}
