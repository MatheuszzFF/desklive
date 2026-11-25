$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding $false
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.IO; using System.Text; using System.Diagnostics; using System.Collections.Generic;
using System.Runtime.InteropServices; using System.Drawing; using System.Drawing.Imaging;
public static class Orb {
  delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr h, uint c);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern int GetWindowTextLength(IntPtr h);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr h, int i);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] static extern void keybd_event(byte k, byte s, uint f, UIntPtr e);
  [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr h, int a, out int v, int s);
  [DllImport("kernel32.dll")] static extern bool GetSystemTimes(out long idle, out long kernel, out long user);
  [StructLayout(LayoutKind.Sequential)] class MEMSTAT { public uint dwLength = 64; public uint dwMemoryLoad; public ulong a, b, c, d, e, f, g; }
  [DllImport("kernel32.dll")] static extern bool GlobalMemoryStatusEx([In, Out] MEMSTAT m);

  static string Cls(IntPtr h) { var sb = new StringBuilder(256); GetClassName(h, sb, 256); return sb.ToString(); }
  static string Txt(IntPtr h) { var sb = new StringBuilder(512); GetWindowText(h, sb, 512); return sb.ToString(); }
  static string Proc(IntPtr h) { uint pid; GetWindowThreadProcessId(h, out pid); try { return Process.GetProcessById((int)pid).ProcessName.ToLower() + ".exe"; } catch { return ""; } }

  public static string Focus(string procs, string cls) {
    var names = new HashSet<string>(procs.ToLower().Split(','));
    IntPtr found = IntPtr.Zero;
    EnumWindows((h, l) => {
      if (!IsWindowVisible(h) || GetWindow(h, 4) != IntPtr.Zero || GetWindowTextLength(h) == 0) return true;
      if ((GetWindowLong(h, -20) & 0x88) != 0) return true; // ferramenta ou sempre-no-topo (a própria barra)
      var tt = Txt(h); if (tt == "Órbita" || tt == "Doca Noturna") return true;
      int cloaked; if (DwmGetWindowAttribute(h, 14, out cloaked, 4) == 0 && cloaked != 0) return true;
      if (cls.Length > 0 && Cls(h) != cls) return true;
      if (names.Contains(Proc(h))) { found = h; return false; }
      return true;
    }, IntPtr.Zero);
    if (found == IntPtr.Zero) return "none";
    if (IsIconic(found)) ShowWindow(found, 9);
    keybd_event(0x12, 0, 0, UIntPtr.Zero); keybd_event(0x12, 0, 2, UIntPtr.Zero);
    SetForegroundWindow(found);
    return "ok";
  }

  // Título da janela principal do Spotify ("Artista - Música" quando toca)
  public static string Song() {
    string best = "";
    EnumWindows((h, l) => {
      if (GetWindowTextLength(h) == 0) return true;
      if (!Cls(h).StartsWith("Chrome_WidgetWin")) return true;
      if (Proc(h) != "spotify.exe") return true;
      var t = Txt(h);
      if (t.Contains(" - ")) { best = t; return false; }
      if (best.Length == 0) best = t;
      return true;
    }, IntPtr.Zero);
    return best;
  }

  static long pi, pk, pu;
  public static int Cpu() {
    long i, k, u; GetSystemTimes(out i, out k, out u);
    long di = i - pi, tot = (k - pk) + (u - pu); pi = i; pk = k; pu = u;
    if (tot <= 0) return 0; return (int)Math.Round(100.0 * (tot - di) / tot);
  }
  public static int Ram() { var m = new MEMSTAT(); GlobalMemoryStatusEx(m); return (int)m.dwMemoryLoad; }
  public static void Key(byte vk) { keybd_event(vk, 0, 0, UIntPtr.Zero); keybd_event(vk, 0, 2, UIntPtr.Zero); }
  // aperta uma combinação (ex. Alt+Shift+Espaço = 12,10,20 em hexa) e solta na ordem inversa
  public static void Combo(string hex) {
    var ks = hex.Split(','); var vk = new byte[ks.Length];
    for (int i = 0; i < ks.Length; i++) vk[i] = Convert.ToByte(ks[i], 16);
    foreach (var k in vk) keybd_event(k, 0, 0, UIntPtr.Zero);
    System.Threading.Thread.Sleep(30);
    for (int i = vk.Length - 1; i >= 0; i--) keybd_event(vk[i], 0, 2, UIntPtr.Zero);
  }

  [StructLayout(LayoutKind.Sequential)] public struct SIZE { public int cx, cy; }
  [ComImport, Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IShellItemImageFactory { [PreserveSig] int GetImage(SIZE size, int flags, out IntPtr phbm); }
  [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
  static extern void SHCreateItemFromParsingName(string path, IntPtr pbc, [MarshalAs(UnmanagedType.LPStruct)] Guid riid, [MarshalAs(UnmanagedType.Interface)] out IShellItemImageFactory ppv);
  [StructLayout(LayoutKind.Sequential)] struct BITMAP { public int bmType, bmWidth, bmHeight, bmWidthBytes; public ushort bmPlanes, bmBitsPixel; public IntPtr bmBits; }
  [DllImport("gdi32.dll")] static extern int GetObject(IntPtr h, int c, out BITMAP bm);
  [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr h);
  public static string Icon(string aumid, int size) {
    IShellItemImageFactory f;
    SHCreateItemFromParsingName("shell:AppsFolder\\" + aumid, IntPtr.Zero, typeof(IShellItemImageFactory).GUID, out f);
    IntPtr h; if (f.GetImage(new SIZE { cx = size, cy = size }, 0x4, out h) != 0) return "";
    BITMAP bm; GetObject(h, Marshal.SizeOf(typeof(BITMAP)), out bm);
    var bmp = new Bitmap(bm.bmWidth, bm.bmHeight, PixelFormat.Format32bppArgb);
    var data = bmp.LockBits(new Rectangle(0, 0, bm.bmWidth, bm.bmHeight), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    var row = new byte[bm.bmWidthBytes];
    for (int y = 0; y < bm.bmHeight; y++) {
      Marshal.Copy(bm.bmBits + y * bm.bmWidthBytes, row, 0, bm.bmWidthBytes);
      for (int x = 0; x < bm.bmWidth; x++) { int i = x * 4; int a = row[i + 3];
        if (a > 0 && a < 255) for (int c = 0; c < 3; c++) row[i + c] = (byte)Math.Min(255, row[i + c] * 255 / a); }
      Marshal.Copy(row, 0, data.Scan0 + (bm.bmHeight - 1 - y) * data.Stride, bm.bmWidthBytes);
    }
    bmp.UnlockBits(data); DeleteObject(h);
    using (var ms = new MemoryStream()) { bmp.Save(ms, ImageFormat.Png); bmp.Dispose(); return Convert.ToBase64String(ms.ToArray()); }
  }
}
"@
[Orb]::Cpu() | Out-Null
# temperatura da placa de vídeo (NVIDIA): o nvidia-smi demora ~150 ms, então guarda por 5 s; sem ele, fica vazio
$smi = Get-Command nvidia-smi.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source
$gpuT = $null; $gpuAt = [DateTime]::MinValue
function Get-GpuTemp {
  if (-not $smi) { return $null }
  if (((Get-Date) - $script:gpuAt).TotalSeconds -lt 5) { return $script:gpuT }
  $script:gpuAt = Get-Date
  try {
    $o = (& $smi --query-gpu=temperature.gpu --format=csv,noheader 2>$null | Select-Object -First 1)
    $v = 0; if ([int]::TryParse(("$o").Trim(), [ref]$v) -and $v -gt 0 -and $v -lt 130) { $script:gpuT = $v } else { $script:gpuT = $null }
  } catch { $script:gpuT = $null }
  return $script:gpuT
}
[Console]::Out.WriteLine('ready'); [Console]::Out.Flush()
while ($null -ne ($l = [Console]::In.ReadLine())) {
  $sp = $l.IndexOf(' '); if ($sp -lt 0) { continue }
  $id = $l.Substring(0, $sp); $rest = $l.Substring($sp + 1)
  $sp2 = $rest.IndexOf(' ')
  if ($sp2 -lt 0) { $cmd = $rest; $arg = '' } else { $cmd = $rest.Substring(0, $sp2); $arg = $rest.Substring($sp2 + 1) }
  $r = ''
  try {
    switch ($cmd) {
      'focus' { $a = $arg.Split(' '); $c = ''; if ($a.Count -gt 1) { $c = $a[1] }; $r = [Orb]::Focus($a[0], $c) }
      'tick'  {
        $procs = (Get-Process | ForEach-Object { $_.ProcessName.ToLower() + '.exe' } | Sort-Object -Unique) -join ','
        $r = (@{ p = $procs; c = [Orb]::Cpu(); r = [Orb]::Ram(); s = [Orb]::Song(); g = (Get-GpuTemp) } | ConvertTo-Json -Compress)
      }
      'apps'  { $r = (Get-StartApps | Where-Object { $_.AppID -notmatch '^https?:' } | Select-Object Name, AppID | ConvertTo-Json -Compress) }
      'icon'  { $r = [Orb]::Icon($arg, 64) }
      'key'   { [Orb]::Key([Convert]::ToByte($arg, 16)); $r = 'ok' }
      'combo' { [Orb]::Combo($arg); $r = 'ok' }
      'disk'  {
        $disks = Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | ForEach-Object { @{ unidade = $_.DeviceID; nome = $_.VolumeName; livre_gb = [Math]::Round($_.FreeSpace / 1GB, 1); total_gb = [Math]::Round($_.Size / 1GB, 1) } }
        $up = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
        $r = (@{ discos = @($disks); ligado_ha = ('{0}d {1}h {2}min' -f $up.Days, $up.Hours, $up.Minutes) } | ConvertTo-Json -Compress -Depth 4)
      }
      'findapp' { $a = Get-StartApps | Where-Object { $_.Name -eq $arg } | Select-Object -First 1; $r = $(if ($a) { $a.AppID } else { '' }) }
    }
  } catch { $r = '' }
  [Console]::Out.WriteLine($id + ' ' + $r); [Console]::Out.Flush()
}
