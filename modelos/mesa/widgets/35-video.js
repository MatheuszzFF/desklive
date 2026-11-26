/* Vídeo (e qualquer site): o app do Claude barra páginas de fora embutidas (frame-src), então este widget é um
   "furo". Ele abre o site numa janela própria do Edge (modo app, perfil separado em ~/.mesa/edge), tira a moldura
   dela, e mantém essa janela exatamente embaixo do furo, acompanhando o widget quando ele anda ou muda de tamanho.
   Dentro do furo o mouse vai direto pra janela. Nada de tecla: a janela é mexida por mensagens do Windows
   (SetWindowPos) e fechada encerrando o processo que o próprio widget abriu. */
{
const JANELA_PS = [
  "$ErrorActionPreference = 'SilentlyContinue'",
  "Add-Type -Namespace M -Name W -MemberDefinition '[DllImport(\"user32.dll\")] public static extern bool SetProcessDPIAware(); [DllImport(\"user32.dll\")] public static extern int GetWindowLong(System.IntPtr h, int i); [DllImport(\"user32.dll\")] public static extern int SetWindowLong(System.IntPtr h, int i, int v); [DllImport(\"user32.dll\")] public static extern bool SetWindowPos(System.IntPtr h, System.IntPtr a, int x, int y, int w, int t, uint f); [DllImport(\"user32.dll\")] public static extern uint GetDpiForWindow(System.IntPtr h); [DllImport(\"user32.dll\")] public static extern int SetWindowRgn(System.IntPtr h, System.IntPtr r, bool d); [DllImport(\"gdi32.dll\")] public static extern System.IntPtr CreateRectRgn(int a, int b, int c, int d); [DllImport(\"user32.dll\", CharSet=System.Runtime.InteropServices.CharSet.Unicode)] public static extern System.IntPtr FindWindow(string c, string t);'",
  "[void][M.W]::SetProcessDPIAware(); $proc = $null; $h = [IntPtr]::Zero; $dono = ''",
  // o Edge fica no topo das janelas normais (HWND_NOTOPMOST), sempre ABAIXO do Board/Mesa, que são "sempre por cima": o Board desenha por cima dele e o furo mostra o site
  "function Acima { return [IntPtr](-2) }",
  // o Edge desenha a própria barra de título por dentro da janela: a janela sobe a altura da barra e é recortada (SetWindowRgn), então só o site aparece no furo
  "function Poe($x, $y, $w, $t) { if ($script:h -ne [IntPtr]::Zero) { $d = [M.W]::GetDpiForWindow($script:h); if ($d -lt 96) { $d = 96 }; $b = [int][Math]::Round(33 * $d / 96); $q = [int]$w; $a = [int]$t; [void][M.W]::SetWindowPos($script:h, (Acima), [int]$x, ([int]$y - $b), $q, ($a + $b), 0x0010); if ($script:tam -ne \"$q $a\") { $script:tam = \"$q $a\"; [void][M.W]::SetWindowRgn($script:h, [M.W]::CreateRectRgn(1, $b, $q - 1, $a + $b - 1), $true) } } }",
  // fecha tudo que for do perfil da Mesa (inclusive janela órfã de uma Mesa anterior); sem isso o Edge novo só "entrega" o endereço pro velho e some
  "function Fecha { try { Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*.mesa\\edge*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force } } catch {}; $script:proc = $null; $script:h = [IntPtr]::Zero }",
  "[Console]::Out.WriteLine('ready'); [Console]::Out.Flush()",
  "while ($null -ne ($l = [Console]::In.ReadLine())) {",
  "  $p = $l.Split(' '); $id = $p[0]; $r = 'ok'",
  "  try { switch ($p[1]) {",
  "    'abre' {",
  "      Fecha; Start-Sleep -Milliseconds 400; $script:porta = Get-Random -Minimum 49200 -Maximum 65000; $url = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p[2])); if ($p[7]) { $script:dono = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p[7])) }; $dir = Join-Path $env:USERPROFILE '.mesa\\edge'",
  "      $script:proc = Start-Process -FilePath 'msedge.exe' -PassThru -ArgumentList @(('--app=' + $url), ('--user-data-dir=\"' + $dir + '\"'), '--no-first-run', '--no-default-browser-check', '--hide-crash-restore-bubble', ('--remote-debugging-port=' + $script:porta),'--autoplay-policy=no-user-gesture-required', ('--window-position=' + $p[3] + ',' + $p[4]), ('--window-size=' + $p[5] + ',' + $p[6]))",
  "      for ($i = 0; $i -lt 60 -and $script:h -eq [IntPtr]::Zero; $i++) { Start-Sleep -Milliseconds 200; $script:proc.Refresh(); if ($script:proc.HasExited) { break }; $script:h = $script:proc.MainWindowHandle }",
  "      if ($script:h -eq [IntPtr]::Zero) { $r = 'sem_janela' } else { $s = [M.W]::GetWindowLong($script:h, -16); [void][M.W]::SetWindowLong($script:h, -16, ($s -band (-bnot 0x00CF0000))); $e = [M.W]::GetWindowLong($script:h, -20); [void][M.W]::SetWindowLong($script:h, -20, (($e -bor 0x80) -band (-bnot 0x40000))); $script:tam = ''; Poe $p[3] $p[4] $p[5] $p[6] }",
  "    }",
  "    'move' { Poe $p[2] $p[3] $p[4] $p[5] }",
  // lê o texto da página aberta: fala com o próprio Edge da Mesa pela porta de depuração (só neste PC, porta sorteada a cada abertura)
  "    'js' {",
  "      $alvo = @(Invoke-RestMethod -Uri ('http://127.0.0.1:' + $script:porta + '/json') -TimeoutSec 5) | ForEach-Object { $_ } | Where-Object { $_.type -eq 'page' -and $_.url -notlike 'devtools*' } | Select-Object -First 1",
  "      if (-not $alvo) { $r = 'sem_pagina' } else {",
  "        $ws = New-Object Net.WebSockets.ClientWebSocket; $ct = [Threading.CancellationToken]::None; [void]$ws.ConnectAsync([uri]$alvo.webSocketDebuggerUrl, $ct).Wait(5000)",
  "        $js = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p[2]))",
  "        $m = [Text.Encoding]::UTF8.GetBytes((@{ id = 1; method = 'Runtime.evaluate'; params = @{ expression = $js; returnByValue = $true } } | ConvertTo-Json -Compress -Depth 5))",
  "        [void]$ws.SendAsync((New-Object 'ArraySegment[byte]' (,$m)), 'Text', $true, $ct).Wait(5000)",
  "        $buf = New-Object byte[] 65536; $ms = New-Object IO.MemoryStream; do { $t = $ws.ReceiveAsync((New-Object 'ArraySegment[byte]' (,$buf)), $ct); [void]$t.Wait(8000); $ms.Write($buf, 0, $t.Result.Count) } while (-not $t.Result.EndOfMessage)",
  "        $ws.Dispose(); $v = ([Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json).result.result.value",
  "        $r = 'b64:' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([string]$v))",
  "      }",
  "    }",
  "    'fecha' { Fecha }",
  "    'viva' { if (-not $script:proc -or $script:proc.HasExited) { $r = 'nao' } else { $r = 'sim' } }",
  "  } } catch { $r = 'erro ' + $_.Exception.Message }",
  "  [Console]::Out.WriteLine($id + ' ' + $r); [Console]::Out.Flush()",
  "}",
  "Fecha",
].join('\n');
Mesa.estilo(`
.w[data-id=video]{background:transparent;box-shadow:0 0 0 1px var(--line)}
.vd{position:absolute;inset:0;display:flex;flex-direction:column;border-radius:inherit;overflow:hidden}
.vd-furo{flex:1;min-height:0;display:grid;place-items:center;text-align:center;padding:16px;color:var(--muted);font-size:13px;line-height:1.5}
.vd-furo.vazio{background:radial-gradient(120% 120% at 50% 0,#1c1622,#07080d)}
.vd-b{flex:none;display:flex;gap:8px;padding:8px 10px;background:var(--vidro)}
.vd-b input{flex:1;min-width:0;height:30px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.05);padding:0 12px;font:400 13px var(--corpo);outline:0;user-select:text;-webkit-user-select:text}
.vd-b input:focus{border-color:rgba(240,169,138,.45)}
`);
const Q = '(?:"|\\\\x22)';   // aspas normais ou escritas como \x22, pro regex do PowerShell
const idDe = t => { const m = String(t || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(t || '').match(/^([\w-]{11})$/); return m ? m[1] : null; };
const b64 = t => btoa(unescape(encodeURIComponent(t)));
Mesa.define({
  id:'video', nome:'Vídeo', descricao:'toca vídeo do YouTube e abre qualquer site dentro da Mesa (numa janela presa ao widget)', w:640, h:420, minW:320, minH:220,
  icone:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
  monta(corpo, api){
    corpo.style.paddingTop = '0'; corpo.style.background = 'transparent';
    corpo.innerHTML = '<div class="vd"><div class="vd-furo vazio">Peça um vídeo ou um site pro Dengas<br>ou digite aqui embaixo.</div><div class="vd-b"><input placeholder="Buscar e tocar: show do Linkin Park… (ou cole um endereço https)" spellcheck="false" aria-label="Buscar vídeo ou abrir site"><button class="m-bot" type="button">Abrir</button></div></div>';
    const furo = corpo.querySelector('.vd-furo'), campo = corpo.querySelector('input'), bot = corpo.querySelector('.m-bot');
    const pede = api.ajudante(JANELA_PS);
    let atual = api.ler({}).atual || null, aberta = false, ultimo = '', problema = '';
    // a janela fica embaixo da do Board: reordena de vez em quando (outra janela pode ter vindo pra frente)
    const reordena = setInterval(() => { if (aberta) pede('move ' + ret()); }, 1500);
    // onde o furo está na tela, em pixels físicos (a janela do Edge é posta nessas coordenadas)
    const ret = () => { const r = furo.getBoundingClientRect(), B = window.Board;
      if (B?.Telas && B.minha){ const s = B.minha.scaleFactor || 1, [fx, fy] = B.Telas.dipParaFis(r.left + B.area.x, r.top + B.area.y, B.minha); return [Math.round(fx), Math.round(fy), Math.round(r.width * s), Math.round(r.height * s)].join(' '); }
      const k = devicePixelRatio || 1; return [Math.round(((window.screenX || 0) + r.left) * k), Math.round(((window.screenY || 0) + r.top) * k), Math.round(r.width * k), Math.round(r.height * k)].join(' '); };
    const diz = t => { problema = t; furo.classList.add('vazio'); furo.classList.remove('furo'); furo.textContent = t; };
    async function abreUrl(url, titulo, busca){
      if (!api.podePC()) throw new Error('só no app instalado, com o acesso total liberado');
      atual = { url, titulo:titulo || '', busca:busca || '' }; api.salvar({ atual }); problema = '';
      furo.textContent = 'Abrindo…';
      const r = await pede('abre ' + b64(url) + ' ' + ret() + ' ' + b64(document.title || 'Mesa'), 20000);
      if (r !== 'ok'){ aberta = false; diz(r === 'sem_janela' ? 'A janela do Edge não apareceu. O Microsoft Edge está instalado?' : 'Não consegui abrir a janela (' + (r || 'sem resposta') + ').'); throw new Error(problema); }
      aberta = true; ultimo = ret(); furo.textContent = ''; furo.classList.remove('vazio'); furo.classList.add('furo'); api.emitir('abriu', atual);
      return { aberto:titulo || url };
    }
    async function busca(q){
      q = String(q || '').trim().slice(0, 300); if (!q) throw new Error('diga o que procurar ou o endereço');
      if (/^https:\/\/[^\s'"<>]+$/i.test(q) && !idDe(q)) return abreUrl(q, '', q);
      let id = idDe(q), titulo = '';
      if (!id){
        const s = "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $h = (Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -Uri ('https://www.youtube.com/results?search_query=' + [uri]::EscapeDataString('" + q.replace(/'/g, "''") + "')) -Headers @{ 'Accept-Language' = 'pt-BR' }).Content; "
          + "$q = '" + Q + "'; $m = [regex]::Match($h, $q + 'videoId' + $q + ':' + $q + '([\\w-]{11})'); "
          + "if ($m.Success) { $t = [regex]::Match($h.Substring($m.Index), $q + 'title' + $q + ':(?:\\{|\\\\x7b)' + $q + 'runs' + $q + ':(?:\\[|\\\\x5b)(?:\\{|\\\\x7b)' + $q + 'text' + $q + ':' + $q + '(.*?)' + $q + '(?:\\}|\\\\x7d)'); [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $m.Groups[1].Value + '|' + $t.Groups[1].Value } else { 'nada' }";
        const r = await api.ps(s, 30000); if (!r || r === 'nada' || !/^[\w-]{11}\|/.test(r)) throw new Error('não achei vídeo pra "' + q + '"');
        id = r.slice(0, 11); titulo = r.slice(12).replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\u0026/g, '&').replace(/\\(["'\\\/])/g, '$1').slice(0, 120);
      }
      await abreUrl('https://www.youtube.com/watch?v=' + id, titulo, q);
      return { tocando:titulo || id };
    }
    // conversa com a página aberta: as expressões são escritas aqui no widget (o texto do Claude entra só como dado, em JSON)
    const naPagina = async (fn, arg) => {
      if (!aberta) throw new Error('não tem página aberta no navegador da Mesa: abra com abrir_site antes');
      const r = String(await pede('js ' + b64('(' + fn.toString() + ')(' + JSON.stringify(arg ?? null) + ')'), 20000) || '');
      if (!r.startsWith('b64:')) throw new Error('não consegui falar com a página (' + (r || 'sem resposta') + ')');
      try { return JSON.parse(decodeURIComponent(escape(atob(r.slice(4))))); } catch { throw new Error('a página devolveu algo que não deu pra ler'); }
    };
    const LE = function(){ var t = document.body ? document.body.innerText : ''; return JSON.stringify({ titulo:document.title, endereco:location.href, rolagem:Math.round(scrollY) + ' de ' + Math.max(0, document.documentElement.scrollHeight - innerHeight), texto:t.slice(0, 7000) }); };
    const CLICA = function(alvo){
      var n = function(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); }, q = n(alvo), melhor = null, tam = 1e9;
      if (!q) return JSON.stringify({ erro:'diga o texto do que clicar' });
      document.querySelectorAll('a,button,[role=button],[role=link],[role=listitem],[role=row],[role=tab],[role=option],[role=menuitem],[tabindex],summary,input[type=submit],input[type=button]').forEach(function(el){
        var r = el.getBoundingClientRect(); if (r.width < 3 || r.height < 3 || r.bottom < 0 || r.top > innerHeight) return;
        var t = n(el.innerText || el.value), a = n(el.getAttribute('aria-label') || el.title); if (t.indexOf(q) < 0 && a.indexOf(q) < 0) return;
        var L = t.indexOf(q) >= 0 ? t.length : a.length; if (L < tam){ tam = L; melhor = el; } });
      if (!melhor) return JSON.stringify({ erro:'não achei na parte visível da página nada clicável com esse texto (role a página ou leia a tela de novo)' });
      var r = melhor.getBoundingClientRect(), o = { bubbles:true, cancelable:true, view:window, clientX:r.left + r.width / 2, clientY:r.top + r.height / 2, button:0 };
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function(tp){ melhor.dispatchEvent(new (tp.indexOf('pointer') === 0 ? PointerEvent : MouseEvent)(tp, o)); });
      return JSON.stringify({ clicou:(melhor.innerText || melhor.getAttribute('aria-label') || melhor.title || '').trim().slice(0, 80) });
    };
    const ROLA = function(d){ var antes = scrollY; scrollBy(0, (d === 'cima' ? -1 : 1) * innerHeight * .85); return JSON.stringify({ rolou:Math.round(scrollY - antes), rolagem:Math.round(scrollY) + ' de ' + Math.max(0, document.documentElement.scrollHeight - innerHeight) }); };
    const VOLTA = function(){ history.back(); return JSON.stringify({ voltou:true }); };
    const depois = async ms => { await new Promise(r => setTimeout(r, ms)); const p = await naPagina(LE); return { titulo:p.titulo, endereco:p.endereco }; };
    async function leTela(espera){
      const e = Math.max(0, Math.min(15, Number(espera) || 0)); if (e) await new Promise(r => setTimeout(r, e * 1000));
      return naPagina(LE);
    }
    async function fechaJanela(){ aberta = false; await pede('fecha'); furo.classList.add('vazio'); furo.classList.remove('furo'); furo.textContent = 'Fechado. Peça outro vídeo ou site.'; }
    // a janela acompanha o furo: confere a posição várias vezes por segundo e só manda quando mudou
    const tic = setInterval(() => { if (!aberta) return; const r = ret(); if (r !== ultimo){ ultimo = r; pede('move ' + r); } }, 60);
    const vigia = setInterval(async () => { if (aberta && await pede('viva') === 'nao'){ aberta = false; diz('A janela foi fechada.'); } }, 4000);
    const vai = () => busca(campo.value).then(() => { campo.value = ''; }).catch(e => api.avisar(String(e.message || e)));
    bot.addEventListener('click', vai); campo.addEventListener('keydown', e => { if (e.key === 'Enter') vai(); });
    return {
      estado:() => ({ aberto:aberta ? (atual?.titulo || atual?.busca || atual?.url) : null, endereco:aberta ? atual?.url : null, problema:problema || undefined }),
      comandos:[
        { nome:'tocar', descricao:'Acha e toca um vídeo do YouTube dentro da Mesa. busca: o assunto (ex.: "Linkin Park show ao vivo completo"), um link do YouTube ou o id. O vídeo já começa tocando. Devolve o título.',
          esquema:{ type:'object', properties:{ busca:{ type:'string' } }, required:['busca'] }, roda:({ busca:q }) => busca(q) },
        { nome:'abrir_site', descricao:'Abre qualquer site (endereço https completo) dentro do widget, como um navegador preso à Mesa.',
          esquema:{ type:'object', properties:{ endereco:{ type:'string' } }, required:['endereco'] },
          roda({ endereco }){ const u = String(endereco || '').trim(); if (!/^https:\/\/[^\s'"<>]+$/i.test(u)) throw new Error('precisa ser um endereço https completo'); return abreUrl(u, '', u); } },
        { nome:'ler_tela', descricao:'Lê o texto da página que está aberta no navegador da Mesa (título, endereço e até 7 mil letras do que aparece nela), com as contas do dono logadas. espera: segundos pra aguardar a página carregar antes de ler (0 a 15). Leia de novo depois de clicar ou rolar.',
          esquema:{ type:'object', properties:{ espera:{ type:'number' } } }, roda:({ espera } = {}) => leTela(espera) },
        { nome:'clicar', descricao:'Clica, na página aberta, no link, botão ou item cujo texto visível contém o texto dado (ex.: o título de um resultado, o nome de uma conversa). Só acha o que está na parte visível: se não achar, role e tente de novo. Devolve no que clicou e a página em que ficou.',
          esquema:{ type:'object', properties:{ texto:{ type:'string' } }, required:['texto'] }, async roda({ texto }){ const r = await naPagina(CLICA, String(texto || '').slice(0, 120)); if (r.erro) throw new Error(r.erro); return { ...r, ...(await depois(1300)) }; } },
        { nome:'rolar', descricao:'Rola a página aberta uma tela pra baixo ou pra cima. direcao: "baixo" (padrão) ou "cima". Devolve onde a rolagem ficou.',
          esquema:{ type:'object', properties:{ direcao:{ type:'string', enum:['baixo','cima'] } } }, roda:({ direcao } = {}) => naPagina(ROLA, direcao === 'cima' ? 'cima' : 'baixo') },
        { nome:'voltar', descricao:'Volta pra página anterior do navegador da Mesa.', async roda(){ await naPagina(VOLTA); return depois(1300); } },
        { nome:'fechar_janela', descricao:'Fecha o vídeo ou site que está aberto no widget (o widget continua na Mesa).', roda:() => fechaJanela().then(() => 'fechado') },
      ],
      aoFechar(){ clearInterval(tic); clearInterval(vigia); clearInterval(reordena); pede('fecha'); },
    };
  },
});
}
Mesa.agente('video', "Você é o navegador da Mesa: uma janela do Edge presa ao widget, com as contas do dono logadas. Fluxo de trabalho: abrir_site (ou tocar, pra vídeo do YouTube), ler_tela pra ver o que apareceu (use espera de 2 a 8 s em página pesada), clicar no que interessa pelo texto visível, ler_tela de novo, rolar quando o que procura não está na parte visível, voltar se entrou no lugar errado. Pra pesquisar, abra https://www.google.com/search?q=<busca codificada>. Você não digita em página nenhuma: nada de formulário, login, compra ou envio de mensagem; se a página pedir login, avise que o dono precisa entrar. No WhatsApp Web (https://web.whatsapp.com): só abra uma conversa quando o pedido nomear essa conversa (abrir marca como lida), e nunca envie nada. Se o widget estiver pequeno pro conteúdo (vídeo, página larga), aumente com caixa sem cobrir os outros.");
