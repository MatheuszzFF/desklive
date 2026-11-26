# Funções da montagem, usadas pelo build.ps1 de cada modelo (carregue com: . <caminho>\montagem.ps1).
# Montar = trocar os marcadores do *-src.html pelo motor, pelos helpers e pelos ícones, e gravar um HTML só.
# Sem caminhos fixos: tudo é relativo à pasta dos modelos.

$ErrorActionPreference = 'Stop'
$script:Compartilhado = $PSScriptRoot
$script:Utf8SemBom = New-Object Text.UTF8Encoding $false

function Read-Texto([string]$Caminho) { [IO.File]::ReadAllText((Resolve-Path $Caminho).Path) }

# o conteúdo de um arquivo como string JS entre aspas (pros helpers: /*HELPER*/'' vira "...código...")
function Get-JsString([string]$Caminho) { ((Read-Texto $Caminho) | ConvertTo-Json -Compress).Replace('</', '<\/') }

# troca um marcador e falha alto se ele não existir no fonte (evita montar um app pela metade sem perceber)
function Set-Marcador([string]$Html, [string]$Marcador, [string]$Valor) {
  if (-not $Html.Contains($Marcador)) { throw "marcador não encontrado no fonte: $Marcador" }
  $Html.Replace($Marcador, $Valor)
}

# ícones dos apps da lista APPS do fonte: lê cada { key:'...', ... aumid:'...' } e extrai o ícone do Windows
# (shell:AppsFolder\<aumid>, 128 px, PNG em base64). App que não está instalado fica sem ícone e só avisa.
function Get-IconesJson([string]$Fonte) {
  if (-not ('DeskliveIcone' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing @"
using System; using System.IO; using System.Runtime.InteropServices; using System.Drawing; using System.Drawing.Imaging;
public static class DeskliveIcone {
  [StructLayout(LayoutKind.Sequential)] public struct SIZE { public int cx, cy; }
  [ComImport, Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IShellItemImageFactory { [PreserveSig] int GetImage(SIZE size, int flags, out IntPtr phbm); }
  [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
  static extern void SHCreateItemFromParsingName(string path, IntPtr pbc, [MarshalAs(UnmanagedType.LPStruct)] Guid riid, [MarshalAs(UnmanagedType.Interface)] out IShellItemImageFactory ppv);
  [StructLayout(LayoutKind.Sequential)] struct BITMAP { public int bmType, bmWidth, bmHeight, bmWidthBytes; public ushort bmPlanes, bmBitsPixel; public IntPtr bmBits; }
  [DllImport("gdi32.dll")] static extern int GetObject(IntPtr h, int c, out BITMAP bm);
  [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr h);
  public static string Png(string aumid, int size) {
    IShellItemImageFactory f;
    SHCreateItemFromParsingName("shell:AppsFolder\\" + aumid, IntPtr.Zero, typeof(IShellItemImageFactory).GUID, out f);
    IntPtr h; if (f.GetImage(new SIZE { cx = size, cy = size }, 0x4 /*só o ícone*/, out h) != 0) return "";
    BITMAP bm; GetObject(h, Marshal.SizeOf(typeof(BITMAP)), out bm);
    var bmp = new Bitmap(bm.bmWidth, bm.bmHeight, PixelFormat.Format32bppArgb);
    var data = bmp.LockBits(new Rectangle(0, 0, bm.bmWidth, bm.bmHeight), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    var row = new byte[bm.bmWidthBytes];
    for (int y = 0; y < bm.bmHeight; y++) {
      Marshal.Copy(bm.bmBits + y * bm.bmWidthBytes, row, 0, bm.bmWidthBytes);
      for (int x = 0; x < bm.bmWidth; x++) { int i = x * 4; int a = row[i + 3];          // desfaz o alfa pré-multiplicado
        if (a > 0 && a < 255) for (int c = 0; c < 3; c++) row[i + c] = (byte)Math.Min(255, row[i + c] * 255 / a); }
      Marshal.Copy(row, 0, data.Scan0 + (bm.bmHeight - 1 - y) * data.Stride, bm.bmWidthBytes); // o DIB vem de baixo pra cima
    }
    bmp.UnlockBits(data); DeleteObject(h);
    using (var ms = new MemoryStream()) { bmp.Save(ms, ImageFormat.Png); bmp.Dispose(); return Convert.ToBase64String(ms.ToArray()); }
  }
}
"@
  }
  $icones = [ordered]@{}
  $achados = [regex]::Matches($Fonte, "\{\s*key:'([^']+)'[^\r\n]*?aumid:'((?:[^'\\]|\\.)*)'")
  if ($achados.Count -eq 0) { Write-Warning 'nenhum app na lista APPS do fonte: a montagem segue sem ícones' }
  foreach ($m in $achados) {
    $key = $m.Groups[1].Value; $aumid = $m.Groups[2].Value.Replace('\\', '\')
    try { $b64 = [DeskliveIcone]::Png($aumid, 128) } catch { $b64 = '' }
    if ($b64) { $icones[$key] = 'data:image/png;base64,' + $b64 } else { Write-Warning "sem ícone pra '$key' ($aumid): o app não está instalado nesta máquina?" }
  }
  if ($icones.Count -eq 0) { return '{}' }
  $icones | ConvertTo-Json -Compress
}

# grava o HTML montado e confere que nenhum marcador sobrou
# Os marcadores de um arquivo de app que entra noutro (um opcional do Board, um widget da Mesa). Caminhos de JS, PS e
# APP partem de modelos\; os de JSON, DATAURL, ARQ e B64 partem da pasta do próprio arquivo.
#   /*JS:app/arq.js*/            o arquivo inteiro (com os marcadores dele resolvidos a partir da pasta dele)
#   /*PS:app/arq.ps1*/''         um helper PowerShell como string JS
#   /*APP:nome*/''               o HTML montado de modelos\<nome> (sem chave embutida e sem toque de tecla)
#   /*JSON:arq.json*/{}          o JSON como objeto      /*DATAURL:arq.png*/''   o arquivo como data: URL
#   /*ARQ:arq*/''                o texto como string JS   /*B64:arq*/''          o arquivo em base64
function Resolve-Marcadores([string]$Js, [string]$Pasta) {
  $modelos = (Resolve-Path (Join-Path $script:Compartilhado '..')).Path
  $Js = [regex]::Replace($Js, "/\*JS:([\w./\-]+)\*/", { param($m) $f = Join-Path $modelos $m.Groups[1].Value; "/* ==== $($m.Groups[1].Value) ==== */`n" + (Resolve-Marcadores (Read-Texto $f) (Split-Path $f -Parent)) })
  $Js = [regex]::Replace($Js, "/\*PS:([^*]+)\*/''", { param($m) Get-JsString (Join-Path $modelos $m.Groups[1].Value) })
  $Js = [regex]::Replace($Js, "/\*JSON:([\w./\-]+)\*/\{\}", { param($m) Read-Texto (Join-Path $Pasta $m.Groups[1].Value) })
  $Js = [regex]::Replace($Js, "/\*DATAURL:([\w./\-]+)\*/''", { param($m) $f = Join-Path $Pasta $m.Groups[1].Value; $tipo = @{ '.png'='image/png'; '.jpg'='image/jpeg'; '.webp'='image/webp'; '.svg'='image/svg+xml' }[[IO.Path]::GetExtension($f).ToLower()]; "'data:$tipo;base64," + [Convert]::ToBase64String([IO.File]::ReadAllBytes($f)) + "'" })
  $Js = [regex]::Replace($Js, "/\*ARQ:([\w./\-]+)\*/''", { param($m) Get-JsString (Join-Path $Pasta $m.Groups[1].Value) })
  $Js = [regex]::Replace($Js, "/\*B64:([\w./\-]+)\*/''", { param($m) "'" + [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $Pasta $m.Groups[1].Value))) + "'" })
  foreach ($m in [regex]::Matches($Js, "/\*APP:([a-z]+)\*/''")) {
    $n = $m.Groups[1].Value; $tmp = Join-Path $env:TEMP 'board-apps'; $build = Join-Path (Join-Path $modelos $n) 'build.ps1'
    # app hospedado sai sem chave de ninguém: quem usa põe a dele nas chaves do Board (a Onda aceita -ClientId)
    if ((Get-Command $build).Parameters.ContainsKey('ClientId')) { & $build -Saida $tmp -ClientId 'SEU_CLIENT_ID' 3>$null | Out-Null } else { & $build -Saida $tmp | Out-Null }
    $app = (Read-Texto (Join-Path $tmp "$n.html")).Replace('keybd_event(0x12, 0, 0, UIntPtr.Zero); keybd_event(0x12, 0, 2, UIntPtr.Zero);', '')   # nunca tecla
    $Js = $Js.Replace($m.Value, (($app | ConvertTo-Json -Compress).Replace('</', '<\/')))
  }
  $Js
}

function Save-Montado([string]$Saida, [string]$Nome, [string]$Html) {
  New-Item -ItemType Directory -Force $Saida | Out-Null
  $destino = Join-Path (Resolve-Path $Saida).Path $Nome
  [IO.File]::WriteAllText($destino, $Html, $script:Utf8SemBom)
  $sobras = [regex]::Matches($Html, '/\*(MOTOR|ICONS|HELPER|VOZ|METER|GRAVADOR|AUTH|CLIENT_ID)\*/') | ForEach-Object Value | Sort-Object -Unique
  if ($sobras) { Write-Warning "$Nome ainda tem marcadores: $($sobras -join ', ')" }
  "{0}: {1:N0} caracteres, marcadores sobrando: {2}" -f $Nome, $Html.Length, $(if ($sobras) { $sobras -join ', ' } else { 'nenhum' })
}
