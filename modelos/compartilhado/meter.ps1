param([int]$Frames = 0, [int]$Flow = 0)   # Flow 0 = som que sai (alto-falante), 1 = microfone
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices; using System.Threading; using System.Globalization;
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] public class OndaMMDE {}
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IOndaEnum { [PreserveSig] int EnumAudioEndpoints(int a, int b, out IntPtr c); [PreserveSig] int GetDefaultAudioEndpoint(int flow, int role, out IntPtr dev); }
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IOndaDevice { [PreserveSig] int Activate(ref Guid iid, int ctx, IntPtr p, out IntPtr o); }
[Guid("C02216F6-8C67-4B5B-9D00-D008E73E0064"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IOndaMeter { [PreserveSig] int GetPeakValue(out float p); [PreserveSig] int GetMeteringChannelCount(out int n); [PreserveSig] int GetChannelsPeakValues(int n, [In, Out] float[] v); }
public static class OndaMeter {
  public static int Flow = 0;
  static IOndaMeter Open(){
    var e = (IOndaEnum)new OndaMMDE(); IntPtr dp;
    if (e.GetDefaultAudioEndpoint(Flow, 1, out dp) != 0) return null;
    var d = (IOndaDevice)Marshal.GetObjectForIUnknown(dp);
    Guid g = typeof(IOndaMeter).GUID; IntPtr mp;
    if (d.Activate(ref g, 23, IntPtr.Zero, out mp) != 0) return null;
    var m = (IOndaMeter)Marshal.GetObjectForIUnknown(mp); return m;
  }
  // escreve "M esquerda direita" ~30 vezes por segundo: o pico do som que sai na saída de áudio padrão
  public static void Run(int frames){
    IOndaMeter m = null; int age = 0; var ci = CultureInfo.InvariantCulture; var o = Console.Out; var v = new float[8];
    for (int f = 0; frames == 0 || f < frames; f++){
      try {
        if (m == null || age++ > 150){ m = Open(); age = 0; }                  // refaz a cada ~5 s: segue troca de fone/caixa
        if (m == null){ Thread.Sleep(1000); continue; }
        float l; m.GetPeakValue(out l); float r = l;
        o.WriteLine("M " + l.ToString("0.000", ci) + " " + r.ToString("0.000", ci)); o.Flush();
      } catch { m = null; Thread.Sleep(1000); }
      Thread.Sleep(33);
    }
  }
}
"@
[OndaMeter]::Flow = $Flow
[OndaMeter]::Run($Frames)


