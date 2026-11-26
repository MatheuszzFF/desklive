/* Janelas: qualquer programa do Windows dentro do Board, sem a barra de título e sem a moldura do Windows.
   Cada janela trazida vira uma peça (moldura do Board: âncora, tamanhos, bordas, motion). A janela de verdade fica
   EMBAIXO do Board (HWND_NOTOPMOST), exatamente sob o furo da peça, recortada por uma região (SetWindowRgn): o
   que fica fora do recorte (barra de título que o programa desenha por dentro, barra de rolagem) não aparece.
   Tudo é feito com mensagens do Windows direto na janela (SetWindowPos, SetWindowLong, SetWindowRgn, WM_CLOSE):
   nenhuma tecla, nenhum clique simulado. Quando o Board fecha (o ajudante perde a entrada), cada janela volta a ser
   como era; se o Board cair de vez, a próxima abertura devolve as órfãs (~/.orbita/janelas-adotadas.json). */
{
const PS_JANELAS = String.raw`
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Collections.Generic;
public static class KJ {
  public delegate bool EW(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EW f, IntPtr l);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
  [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr h, uint c);
  [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h, int i);
  [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr h, int i, int v);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int w, int t, uint f);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern int SetWindowRgn(IntPtr h, IntPtr r, bool d);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateRectRgn(int a, int b, int c, int d);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [StructLayout(LayoutKind.Sequential)] public struct R { public int L, T, D, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out int v, int s);
  public static string Titulo(IntPtr h){ var s = new StringBuilder(512); GetWindowText(h, s, 512); return s.ToString(); }
  public static List<IntPtr> Todas(){
    var l = new List<IntPtr>();
    EnumWindows((h, p) => {
      if (!IsWindowVisible(h) || GetWindowTextLength(h) == 0 || GetWindow(h, 4) != IntPtr.Zero) return true;
      if ((GetWindowLong(h, -20) & 0x80) != 0) return true;
      int c = 0; DwmGetWindowAttribute(h, 14, out c, 4); if (c != 0) return true;
      l.Add(h); return true; }, IntPtr.Zero);
    return l;
  }
}
"@
[void][KJ]::SetProcessDPIAware()
$A = @{}
$arq = Join-Path $env:USERPROFILE '.orbita\janelas-adotadas.json'
function Hw($k) { return [IntPtr][int64]$k }
function Grava { $o = @(); foreach ($k in $A.Keys) { $v = $A[$k]; $o += [pscustomobject]@{ h = [string]$k; s = $v.s; e = $v.e; r = $v.r } }; try { ConvertTo-Json -InputObject @($o) -Compress -Depth 4 | Set-Content -Encoding UTF8 -Path $arq } catch {} }
function Devolve($k, $v) { $h = Hw $k; if ([KJ]::IsWindow($h)) { [void][KJ]::SetWindowRgn($h, [IntPtr]::Zero, $true); [void][KJ]::SetWindowLong($h, -16, [int]$v.s); [void][KJ]::SetWindowLong($h, -20, [int]$v.e); [void][KJ]::SetWindowPos($h, [IntPtr](-2), [int]$v.r[0], [int]$v.r[1], [int]$v.r[2], [int]$v.r[3], 0x0060); [void][KJ]::ShowWindow($h, 5) } }
function Solta($k) { $v = $A[$k]; if ($v) { Devolve $k $v; $A.Remove($k) } }
# o recorte vem em px lógicos (96 dpi): cima direita baixo esquerda
function Poe($k) {
  $v = $A[$k]; if (-not $v -or -not $v.q) { return }; $h = Hw $k; $d = [KJ]::GetDpiForWindow($h); if ($d -lt 96) { $d = 96 }
  $c = @($v.c | ForEach-Object { [int][Math]::Round([double]$_ * $d / 96) })
  $x = [int]$v.q[0] - $c[3]; $y = [int]$v.q[1] - $c[0]; $w = [int]$v.q[2] + $c[1] + $c[3]; $t = [int]$v.q[3] + $c[0] + $c[2]
  [void][KJ]::SetWindowPos($h, [IntPtr](-2), $x, $y, $w, $t, 0x0050)
  $g = "$w $t " + ($c -join ' '); if ($v.g -ne $g) { $v.g = $g; [void][KJ]::SetWindowRgn($h, [KJ]::CreateRectRgn($c[3], $c[0], $w - $c[1], $t - $c[2]), $true) }
}
function Lista { $o = @(); foreach ($h in [KJ]::Todas()) { $p = 0; [void][KJ]::GetWindowThreadProcessId($h, [ref]$p); $n = ''; try { $n = (Get-Process -Id $p).ProcessName } catch {}; if ($n -match '^(claude|Claude)$' -or $A.ContainsKey([string][int64]$h)) { continue }; $o += [pscustomobject]@{ id = [string][int64]$h; titulo = [KJ]::Titulo($h); programa = $n } }; return $o }
function B64($s) { return [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([string]$s)) }
# órfãs de um Board que caiu: voltam a ser janelas normais
try { if (Test-Path $arq) { foreach ($v in @(Get-Content -Raw -Path $arq | ConvertFrom-Json)) { if ($v.h) { Devolve $v.h $v } }; Set-Content -Path $arq -Value '[]' } } catch {}
[Console]::Out.WriteLine('ready'); [Console]::Out.Flush()
while ($null -ne ($l = [Console]::In.ReadLine())) {
  $p = $l.Split(' '); $id = $p[0]; $r = 'ok'
  try { switch ($p[1]) {
    'oi' { $r = 'ok' }
    'lista' { $r = 'b64:' + (B64 (ConvertTo-Json -InputObject @(Lista) -Compress -Depth 3)) }
    'adota' {
      $k = $p[2]; $h = Hw $k
      if (-not [KJ]::IsWindow($h)) { $r = 'sem_janela' } else {
        if (-not $A.ContainsKey($k)) { $rc = New-Object KJ+R; [void][KJ]::GetWindowRect($h, [ref]$rc); $A[$k] = @{ s = [KJ]::GetWindowLong($h, -16); e = [KJ]::GetWindowLong($h, -20); r = @($rc.L, $rc.T, ($rc.D - $rc.L), ($rc.B - $rc.T)); c = @(0, 0, 0, 0); q = $null; g = '' } }
        $v = $A[$k]; if ([KJ]::IsIconic($h)) { [void][KJ]::ShowWindow($h, 9) }
        [void][KJ]::SetWindowLong($h, -16, ([int]$v.s -band (-bnot 0x00CF0000)))
        [void][KJ]::SetWindowLong($h, -20, ((([int]$v.e -bor 0x80) -band (-bnot 0x40000)) -band (-bnot 0x301)))
        [void][KJ]::SetWindowPos($h, [IntPtr](-2), 0, 0, 0, 0, 0x0037)
        $v.q = @($p[3], $p[4], $p[5], $p[6]); if ($p.Length -ge 11) { $v.c = @($p[7], $p[8], $p[9], $p[10]) }; $v.g = ''; Poe $k; Grava
        $r = 'b64:' + (B64 ([KJ]::Titulo($h)))
      }
    }
    'move' { $v = $A[$p[2]]; if ($v) { $v.q = @($p[3], $p[4], $p[5], $p[6]); Poe $p[2] } else { $r = 'nao_adotada' } }
    'corte' { $v = $A[$p[2]]; if ($v) { $v.c = @($p[3], $p[4], $p[5], $p[6]); $v.g = ''; Poe $p[2] } else { $r = 'nao_adotada' } }
    'solta' { Solta $p[2]; Grava }
    'fecha' { $h = Hw $p[2]; $v = $A[$p[2]]; if ($v) { Devolve $p[2] $v; $A.Remove($p[2]); Grava }; [void][KJ]::PostMessage($h, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) }
    'viva' { if ([KJ]::IsWindow((Hw $p[2]))) { $r = 'sim' } else { $r = 'nao'; $A.Remove($p[2]); Grava } }
    'titulo' { $r = 'b64:' + (B64 ([KJ]::Titulo((Hw $p[2])))) }
    'abre' {
      $alvo = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p[2])); $antes = @{}; foreach ($h in [KJ]::Todas()) { $antes[[string][int64]$h] = 1 }
      Start-Process -FilePath $alvo; $r = 'sem_janela'
      for ($i = 0; $i -lt 48; $i++) { Start-Sleep -Milliseconds 250; $nova = [KJ]::Todas() | Where-Object { -not $antes.ContainsKey([string][int64]$_) } | Select-Object -First 1; if ($nova) { Start-Sleep -Milliseconds 300; $r = 'id:' + [string][int64]$nova; break } }
    }
  } } catch { $r = 'erro ' + $_.Exception.Message }
  [Console]::Out.WriteLine($id + ' ' + $r); [Console]::Out.Flush()
}
foreach ($k in @($A.Keys)) { Solta $k }; Grava
`;

if (Mesa.principal){
  Mesa.estilo(`
.jn{position:absolute;inset:0;display:flex;flex-direction:column}
.jn-b{flex:none;height:30px;display:flex;align-items:center;gap:6px;padding:0 8px 0 14px;font:500 12px/1 var(--corpo);color:var(--muted)}
.jn-t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jn-b button{flex:none;width:24px;height:24px;border:0;border-radius:50%;background:rgba(255,255,255,.06);color:var(--fg);cursor:pointer;font:500 13px/1 var(--corpo)}
.jn-b button:hover{background:rgba(255,255,255,.14)}
.jn-furo{flex:1;min-height:0;display:grid;place-items:center;color:var(--faint);font-size:12px;text-align:center;padding:10px}
[data-tam=xs] .jn-b button[data-a=corta],[data-orient=v][data-tam=s] .jn-b button[data-a=corta]{display:none}
`);
  const pede = Mesa.ajudante(PS_JANELAS);
  const b64 = t => btoa(unescape(encodeURIComponent(String(t))));
  const de64 = r => { try { return decodeURIComponent(escape(atob(String(r).slice(4)))); } catch { return ''; } };
  const JAN = new Map();   // id da janela (hwnd) → { titulo, programa, corte, wid }
  const salvaCortes = () => { const c = Mesa.le('janelas-cortes', {}); for (const j of JAN.values()) if (j.programa) c[j.programa] = j.corte; Mesa.grava('janelas-cortes', c); };
  // onde o furo está na tela, em pixels físicos
  const ret = el => { const r = el.getBoundingClientRect(), B = window.Board;
    if (B?.Telas && B.minha){ const s = B.minha.scaleFactor || 1, [fx, fy] = B.Telas.dipParaFis(r.left + B.area.x, r.top + B.area.y, B.minha); return [Math.round(fx), Math.round(fy), Math.round(r.width * s), Math.round(r.height * s)].join(' '); }
    const k = devicePixelRatio || 1; return [Math.round(((window.screenX || 0) + r.left) * k), Math.round(((window.screenY || 0) + r.top) * k), Math.round(r.width * k), Math.round(r.height * k)].join(' '); };
  async function lista(){ const r = await pede('lista', 10000); if (!String(r || '').startsWith('b64:')) throw new Error('não consegui listar as janelas (' + (r || 'sem resposta') + ')'); try { return JSON.parse(de64(r)) || []; } catch { return []; } }
  // acha a janela pelo id ou por um pedaço do título / nome do programa
  async function acha(q){
    q = String(q || '').trim(); if (!q) throw new Error('diga qual janela (o título, o programa ou o id)');
    if (JAN.has(q)) return { id:q, ...JAN.get(q) };
    const n = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const l = await lista(), alvo = n(q);
    const j = l.find(x => x.id === q) || l.find(x => n(x.titulo).includes(alvo)) || l.find(x => n(x.programa).includes(alvo));
    if (!j) throw new Error('não achei janela com "' + q + '". Abertas: ' + (l.map(x => x.titulo).slice(0, 12).join(' · ') || 'nenhuma'));
    return j;
  }
  const FORMA = { interior:'livre', superior:'top', inferior:'bottom', esquerda:'left', direita:'right', 'canto-sup-esq':'c-tl', 'canto-sup-dir':'c-tr', 'canto-inf-esq':'c-bl', 'canto-inf-dir':'c-br' };
  function traz(j, onde){
    const wid = 'janela-' + j.id, corte = Mesa.le('janelas-cortes', {})[j.programa] || [0, 0, 0, 0];
    JAN.set(j.id, { titulo:j.titulo, programa:j.programa, corte, wid });
    if (!Mesa.defs().some(d => d.id === wid)) Mesa.define({ id:wid, nome:j.titulo || j.programa || 'Janela', descricao:'janela do Windows (' + (j.programa || '?') + ') dentro do Board', passavel:false,
      w:760, h:500, minW:220, minH:150, tamanhos:{ esquerda:{ w:460, h:820 }, direita:{ w:460, h:820 }, superior:{ w:980, h:340 }, inferior:{ w:980, h:340 }, 'canto-sup':{ w:520, h:420 }, 'canto-inf':{ w:520, h:420 } },
      monta(corpo, api){
        corpo.style.paddingTop = '0';
        corpo.innerHTML = '<div class="jn"><div class="jn-b"><span class="jn-t"></span><button type="button" data-a="corta" title="Recortar a barra de rolagem da direita">⇥</button><button type="button" data-a="solta" title="Devolver pro Windows">↗</button><button type="button" data-a="fecha" title="Fechar o programa">×</button></div><div class="jn-furo">Trazendo a janela…</div></div>';
        const furo = corpo.querySelector('.jn-furo'), tit = corpo.querySelector('.jn-t'), J = JAN.get(j.id);
        tit.textContent = J.titulo || J.programa;
        let viva = false, ultimo = '';
        const sai = () => { viva = false; clearInterval(tic); clearInterval(reord); clearInterval(vig); JAN.delete(j.id); };
        const adota = async () => { const r = String(await pede('adota ' + j.id + ' ' + ret(furo) + ' ' + J.corte.join(' '), 8000) || '');
          if (!r.startsWith('b64:')){ furo.textContent = r === 'sem_janela' ? 'Essa janela não existe mais.' : 'Não consegui trazer a janela (' + (r || 'sem resposta') + ').'; return; }
          viva = true; ultimo = ret(furo); furo.textContent = ''; furo.classList.add('furo'); const t = de64(r); if (t){ J.titulo = t; tit.textContent = t; } api.emitir('trouxe', { id:j.id, titulo:J.titulo }); };
        setTimeout(adota, 120);
        const tic = setInterval(() => { if (!viva) return; const r = ret(furo); if (r !== ultimo){ ultimo = r; pede('move ' + j.id + ' ' + r); } }, 60);
        const reord = setInterval(() => { if (viva) pede('move ' + j.id + ' ' + ret(furo)); }, 1500);
        const vig = setInterval(async () => { if (!viva) return; if (await pede('viva ' + j.id) === 'nao'){ sai(); Mesa.fecha(wid); } else { const t = await pede('titulo ' + j.id); const s = String(t || '').startsWith('b64:') ? de64(t) : ''; if (s && s !== J.titulo){ J.titulo = s; tit.textContent = s; } } }, 3000);
        const corta = c => { J.corte = c.map(v => Math.max(0, Math.min(200, Math.round(+v || 0)))); salvaCortes(); return pede('corte ' + j.id + ' ' + J.corte.join(' ')); };
        corpo.querySelector('.jn-b').addEventListener('click', e => { const a = e.target.closest('button')?.dataset.a; if (!a) return;
          if (a === 'corta') corta([J.corte[0], J.corte[1] ? 0 : 17, J.corte[2], J.corte[3]]);
          if (a === 'solta'){ sai(); pede('solta ' + j.id); Mesa.fecha(wid); }
          if (a === 'fecha'){ sai(); pede('fecha ' + j.id); Mesa.fecha(wid); } });
        return {
          estado:() => ({ janela:j.id, titulo:J.titulo, programa:J.programa, recorte:{ cima:J.corte[0], direita:J.corte[1], baixo:J.corte[2], esquerda:J.corte[3] }, viva }),
          comandos:[
            { nome:'recortar', descricao:'Esconde as bordas que o programa desenha por dentro (barra de título própria, barra de rolagem, menu): px a cortar de cada lado. Ex.: direita 17 tira a barra de rolagem. O recorte fica lembrado para esse programa.',
              esquema:{ type:'object', properties:{ cima:{ type:'number' }, direita:{ type:'number' }, baixo:{ type:'number' }, esquerda:{ type:'number' } } },
              roda:async a => { await corta([a.cima ?? J.corte[0], a.direita ?? J.corte[1], a.baixo ?? J.corte[2], a.esquerda ?? J.corte[3]]); return 'recortado'; } },
            { nome:'devolver', descricao:'Devolve a janela pro Windows como era (com a moldura normal).', roda:async () => { sai(); await pede('solta ' + j.id); Mesa.fecha(wid); return 'devolvida'; } },
          ],
          aoFechar(){ if (viva){ sai(); pede('solta ' + j.id); } },
        };
      } });
    Mesa.abre(wid);
    if (onde && FORMA[onde]) try { window.Board.mover(wid, { forma:FORMA[onde] }); } catch {}
    return { trouxe:j.titulo || j.programa, widget:wid };
  }
  Mesa.app({ id:'janelas', nome:'Janelas do Windows', ativo:() => Mesa.podePC(),
    estado:() => ({ no_board:[...JAN.entries()].map(([id, j]) => ({ id, titulo:j.titulo, programa:j.programa, widget:j.wid })) }),
    comandos:[
      { nome:'listar_janelas', descricao:'Lista as janelas abertas no Windows (título, programa e id) que dá pra trazer pro Board.', roda:async () => (await lista()).slice(0, 40) },
      { nome:'trazer_janela', descricao:'Traz uma janela aberta do Windows pra dentro do Board, sem a barra de título e a moldura do Windows; ela vira um widget (arrasta, encaixa nas bordas, redimensiona). janela: o título, o programa ou o id. onde (opcional): interior, superior, inferior, esquerda, direita, canto-sup-esq, canto-sup-dir, canto-inf-esq, canto-inf-dir.',
        esquema:{ type:'object', properties:{ janela:{ type:'string' }, onde:{ type:'string' } }, required:['janela'] }, roda:async ({ janela, onde }) => traz(await acha(janela), onde) },
      { nome:'abrir_programa', descricao:'Abre um programa, pasta ou arquivo do PC (ex.: "notepad", "explorer", "C:\\\\pasta", "calc") e já traz a janela dele pro Board. onde: como em trazer_janela.',
        esquema:{ type:'object', properties:{ programa:{ type:'string' }, onde:{ type:'string' } }, required:['programa'] },
        roda:async ({ programa, onde }) => { const p = String(programa || '').trim(); if (!p) throw new Error('diga o programa'); const r = String(await pede('abre ' + b64(p), 20000) || '');
          if (!r.startsWith('id:')) throw new Error('abri, mas a janela não apareceu (' + r + ')'); const l = await lista(); const j = l.find(x => x.id === r.slice(3)) || { id:r.slice(3), titulo:p, programa:p }; return traz(j, onde); } },
      { nome:'devolver_janela', descricao:'Devolve uma janela que está no Board pro Windows, com a moldura normal.', esquema:{ type:'object', properties:{ janela:{ type:'string' } }, required:['janela'] },
        roda:async ({ janela }) => { const j = await acha(janela); const J = JAN.get(j.id); await pede('solta ' + j.id); if (J) Mesa.fecha(J.wid); JAN.delete(j.id); return 'devolvida'; } },
      { nome:'fechar_programa', descricao:'Pede pro programa fechar (como clicar no X dele; se tiver coisa sem salvar, ele mesmo pergunta).', esquema:{ type:'object', properties:{ janela:{ type:'string' } }, required:['janela'] },
        roda:async ({ janela }) => { const j = await acha(janela); const J = JAN.get(j.id); await pede('fecha ' + j.id); if (J) Mesa.fecha(J.wid); JAN.delete(j.id); return 'pedi pra fechar'; } },
    ] });
  Mesa.agente('janelas', 'Você traz programas do Windows pra dentro do Board, sem a moldura do Windows: listar_janelas pra ver o que está aberto, trazer_janela pra puxar uma, abrir_programa pra abrir e já trazer. Escolha o lugar (onde) pelo jeito do programa: lista ou chat fino na lateral, coisa larga em cima ou embaixo, o resto no interior. Se aparecer barra de rolagem ou barra de título própria do programa, use recortar no widget dela. Você não digita nem clica dentro dos programas. fechar_programa só quando a pessoa pedir pra fechar: alguns programas (Bloco de Notas, Explorer) reaproveitam a mesma janela pra tudo, e fechar fecha as abas e pastas que já estavam abertas; pra só tirar do Board, use devolver_janela.');
  // liga o ajudante logo: ele devolve janelas órfãs de um Board que caiu
  if (Mesa.podePC()) setTimeout(() => pede('oi', 15000), 2500);
}
}
