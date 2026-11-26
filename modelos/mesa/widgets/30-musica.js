/* Música: o que está tocando no PC (Spotify, navegador, qualquer player) pela sessão de mídia do Windows, com
   tocar, pausar e pular. Nunca manda tecla: fala direto com a sessão de mídia. É a semente do orquestrador de música. */
{
const MIDIA = [
  'Add-Type -AssemblyName System.Runtime.WindowsRuntime',
  "$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]",
  'function Espera($op, $tipo) { $t = $asTask.MakeGenericMethod($tipo).Invoke($null, @($op)); [void]$t.Wait(8000); $t.Result }',
  '[void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]',
  '$m = Espera ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])',
  "$x = $m.GetCurrentSession(); if (-not $x) { '{\"nada\":true}'; exit }",
  "switch ($acao) { 'tocar' { [void](Espera ($x.TryPlayAsync()) ([bool])) } 'pausar' { [void](Espera ($x.TryPauseAsync()) ([bool])) } 'alternar' { [void](Espera ($x.TryTogglePlayPauseAsync()) ([bool])) } 'proxima' { [void](Espera ($x.TrySkipNextAsync()) ([bool])) } 'anterior' { [void](Espera ($x.TrySkipPreviousAsync()) ([bool])) } }",
  "if ($acao -ne 'info') { Start-Sleep -Milliseconds 700 }",
  '$p = Espera ($x.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])',
  "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; @{ programa = $x.SourceAppUserModelId; artista = $p.Artist; musica = $p.Title; tocando = ($x.GetPlaybackInfo().PlaybackStatus.ToString() -eq 'Playing') } | ConvertTo-Json -Compress",
].join('\n');
Mesa.estilo(`
.mu{height:100%;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:0 16px 14px;box-sizing:border-box}
.mu-t{font:600 clamp(15px,6cqw,22px)/1.2 var(--titulo);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mu-a{color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
.mu-b{display:flex;gap:8px;align-items:center}
.mu-b button{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:rgba(255,255,255,.05);cursor:pointer;display:grid;place-items:center;transition:background .2s,scale .2s var(--mola)}
.mu-b button:hover{background:rgba(255,255,255,.12)} .mu-b button:active{scale:.93}
.mu-b button.pp{width:46px;height:46px;background:var(--coral);border-color:transparent}
.mu-b svg{width:17px;height:17px;fill:currentColor}
.mu-bar{height:3px;border-radius:2px;background:linear-gradient(90deg,var(--coral),var(--pessego));opacity:.25;transition:opacity .4s}
.mu.toca .mu-bar{opacity:1;animation:mupulsa 1.6s ease-in-out infinite}
@keyframes mupulsa{50%{opacity:.45}}
@container w (max-height:120px){.mu-bar{display:none}}
`);
Mesa.define({
  id:'musica', nome:'Música', descricao:'mostra e controla o que está tocando no PC', deSaida:true, lugar:{ x:28, y:28 }, w:320, h:180, minW:220, minH:110,
  icone:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  monta(corpo, api){
    corpo.innerHTML = '<div class="mu"><div><div class="mu-t">Nada tocando</div><div class="mu-a"></div></div><div class="mu-bar"></div><div class="mu-b">'
      + '<button type="button" data-a="anterior" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg></button>'
      + '<button type="button" class="pp" data-a="alternar" aria-label="Tocar ou pausar"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></button>'
      + '<button type="button" data-a="proxima" aria-label="Próxima"><svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg></button></div></div>';
    const raiz = corpo.querySelector('.mu'), tit = corpo.querySelector('.mu-t'), art = corpo.querySelector('.mu-a'), pp = corpo.querySelector('.pp');
    let agora = null, ocupado = false;
    function pinta(){
      if (!api.podePC()){ tit.textContent = 'Só no app instalado'; art.textContent = 'com o acesso total liberado'; return; }
      const t = agora && !agora.nada;
      tit.textContent = t ? (agora.musica || 'Sem título') : 'Nada tocando'; art.textContent = t ? (agora.artista || String(agora.programa || '').replace(/\.exe$/i, '')) : '';
      raiz.classList.toggle('toca', !!(t && agora.tocando));
      pp.innerHTML = t && agora.tocando ? '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>';
    }
    async function faz(acao){
      if (ocupado && acao === 'info') return agora; ocupado = true;
      try { const r = await api.ps("$acao = '" + acao + "'\n" + MIDIA, 20000); const antes = agora?.musica; agora = JSON.parse(r); pinta(); if (agora.musica && agora.musica !== antes) api.emitir('mudou', agora); return agora; }
      finally { ocupado = false; }
    }
    corpo.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => faz(b.dataset.a).catch(() => {})));
    pinta(); const t = setInterval(() => { if (api.podePC()) faz('info').catch(() => {}); }, 5000);
    if (api.podePC()) faz('info').catch(() => {});
    return {
      estado:() => agora && !agora.nada ? { musica:agora.musica, artista:agora.artista, programa:agora.programa, tocando:agora.tocando } : { tocando:false },
      comandos:[
        { nome:'controlar', descricao:'Controla o que toca no PC: info (lê de novo o que está tocando), tocar, pausar, alternar, proxima, anterior. Devolve programa, artista, música e se está tocando.',
          esquema:{ type:'object', properties:{ acao:{ type:'string', enum:['info','tocar','pausar','alternar','proxima','anterior'] } }, required:['acao'] },
          roda:({ acao }) => faz(['info','tocar','pausar','alternar','proxima','anterior'].includes(acao) ? acao : 'info') },
        { nome:'buscar_no_spotify', descricao:'Abre a busca do Spotify (no app) com um texto, pra achar e tocar uma música, artista ou playlist.',
          esquema:{ type:'object', properties:{ consulta:{ type:'string' } }, required:['consulta'] },
          async roda({ consulta }){ const q = encodeURIComponent(String(consulta || '').slice(0, 200)); if (!q) throw new Error('consulta vazia'); await api.ps("Start-Process -FilePath 'spotify:search:" + q + "'"); return 'busca aberta no Spotify'; } },
      ],
      aoFechar:() => clearInterval(t),
    };
  },
});
}
