Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Collections.Generic;
public static class TelasW{
 [StructLayout(LayoutKind.Sequential)] public struct RECT{public int L,T,R,B;}
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] public struct MONITORINFOEX{public int cbSize;public RECT rcMonitor;public RECT rcWork;public uint dwFlags;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)]public string szDevice;}
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] public struct DEVMODE{[MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)]public string dmDeviceName;public short dmSpecVersion,dmDriverVersion,dmSize,dmDriverExtra;public int dmFields;public int dmPositionX,dmPositionY,dmDisplayOrientation,dmDisplayFixedOutput;public short dmColor,dmDuplex,dmYResolution,dmTTOption,dmCollate;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)]public string dmFormName;public short dmLogPixels;public int dmBitsPerPel,dmPelsWidth,dmPelsHeight,dmDisplayFlags,dmDisplayFrequency,dmICMMethod,dmICMIntent,dmMediaType,dmDitherType,dmReserved1,dmReserved2,dmPanningWidth,dmPanningHeight;}
 public delegate bool MonEnum(IntPtr h,IntPtr dc,ref RECT r,IntPtr d);
 [DllImport("user32.dll")] public static extern bool EnumDisplayMonitors(IntPtr dc,IntPtr clip,MonEnum f,IntPtr d);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern bool GetMonitorInfo(IntPtr h,ref MONITORINFOEX i);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern bool EnumDisplaySettingsEx(string dev,int mode,ref DEVMODE dm,int flags);
 [DllImport("shcore.dll")] public static extern int GetDpiForMonitor(IntPtr h,int t,out uint x,out uint y);
 [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr v);
 public static List<string> Ler(){
  try{SetProcessDpiAwarenessContext(new IntPtr(-4));}catch{}
  var o=new List<string>();
  EnumDisplayMonitors(IntPtr.Zero,IntPtr.Zero,(IntPtr h,IntPtr dc,ref RECT r,IntPtr d)=>{
   var mi=new MONITORINFOEX();mi.cbSize=Marshal.SizeOf(typeof(MONITORINFOEX));GetMonitorInfo(h,ref mi);
   var dm=new DEVMODE();dm.dmSize=(short)Marshal.SizeOf(typeof(DEVMODE));EnumDisplaySettingsEx(mi.szDevice,-1,ref dm,0);
   uint dx=0,dy=0;try{GetDpiForMonitor(h,0,out dx,out dy);}catch{}
   o.Add(String.Format("{{\"dev\":\"{0}\",\"mon\":[{1},{2},{3},{4}],\"work\":[{5},{6},{7},{8}],\"prim\":{9},\"hz\":{10},\"res\":[{11},{12}],\"pos\":[{13},{14}],\"ori\":{15},\"dpi\":{16}}}",
    mi.szDevice.Replace("\\","\\\\"),mi.rcMonitor.L,mi.rcMonitor.T,mi.rcMonitor.R-mi.rcMonitor.L,mi.rcMonitor.B-mi.rcMonitor.T,mi.rcWork.L,mi.rcWork.T,mi.rcWork.R-mi.rcWork.L,mi.rcWork.B-mi.rcWork.T,(mi.dwFlags&1)==1?"true":"false",dm.dmDisplayFrequency,dm.dmPelsWidth,dm.dmPelsHeight,dm.dmPositionX,dm.dmPositionY,dm.dmDisplayOrientation,dx));
   return true;},IntPtr.Zero);
  return o;}
}
'@
'[' + ([TelasW]::Ler() -join ',') + ']'
