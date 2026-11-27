/* Barra: com o Board aberto, a barra de tarefas do Windows não aparece (nas duas telas). O app do Claude não tem opção
   pra isso, então o Board manda a janela da barra se esconder (ShowWindow, mensagem direta à janela, nenhuma tecla) a
   cada segundo, porque o Windows às vezes traz ela de volta (auto-ocultar, mouse embaixo, foco). Ao fechar o Board o
   ajudante perde a entrada e mostra a barra de novo; se o PC cair, o Windows recria a barra ao reiniciar.
   A tecla Windows continua abrindo o menu Iniciar. No menu do Board: "Mostrar a barra de tarefas" liga e desliga. */
if (Mesa.principal){
  const PS_BARRA = String.raw`
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -Namespace KB -Name W -MemberDefinition '[DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern System.IntPtr FindWindow(string c, string t); [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern System.IntPtr FindWindowEx(System.IntPtr p, System.IntPtr a, string c, string t); [DllImport("user32.dll")] public static extern bool ShowWindow(System.IntPtr h, int c); [DllImport("user32.dll")] public static extern bool IsWindowVisible(System.IntPtr h);'
function Barras { $l = @([KB.W]::FindWindow('Shell_TrayWnd', $null)); $h = [IntPtr]::Zero; do { $h = [KB.W]::FindWindowEx([IntPtr]::Zero, $h, 'Shell_SecondaryTrayWnd', $null); if ($h -ne [IntPtr]::Zero) { $l += $h } } while ($h -ne [IntPtr]::Zero); return $l | Where-Object { $_ -ne [IntPtr]::Zero } }
function Mostra { foreach ($b in Barras) { [void][KB.W]::ShowWindow($b, 5) } }
[Console]::Out.WriteLine('ready'); [Console]::Out.Flush()
while ($null -ne ($l = [Console]::In.ReadLine())) {
  $p = $l.Split(' '); $id = $p[0]; $r = 'ok'
  try { switch ($p[1]) {
    'esconde' { $n = 0; foreach ($b in Barras) { if ([KB.W]::IsWindowVisible($b)) { [void][KB.W]::ShowWindow($b, 0); $n++ } }; $r = "ok $n" }
    'mostra' { Mostra }
  } } catch { $r = 'erro ' + $_.Exception.Message }
  [Console]::Out.WriteLine($id + ' ' + $r); [Console]::Out.Flush()
}
Mostra
`;
  const pede = Mesa.ajudante(PS_BARRA, 'barra');
  let esconder = Mesa.le('board-barra-escondida', true), t = 0;
  const aplica = () => { clearInterval(t); if (!Mesa.podePC()) return; if (esconder){ pede('esconde'); t = setInterval(() => pede('esconde'), 1000); } else pede('mostra'); };
  window.Board?.menu?.(() => [{ label:esconder ? 'Mostrar a barra de tarefas' : 'Esconder a barra de tarefas', click:() => { esconder = !esconder; Mesa.grava('board-barra-escondida', esconder); aplica(); } }]);
  setTimeout(aplica, 1500);
}
