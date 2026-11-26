/* Vídeo: toca vídeo do YouTube DENTRO da Mesa. O morador pede por assunto ("show do Linkin Park") e o widget
   acha o primeiro resultado e dá play. A busca é feita pelo PC (PowerShell), porque a página não acessa a rede;
   o player é o do próprio YouTube, embutido. Também aceita um link ou o id direto. */
{
Mesa.estilo(`
.vd{position:absolute;inset:0;display:flex;flex-direction:column;background:#000;border-radius:0 0 19px 19px;overflow:hidden}
.vd iframe{flex:1;width:100%;border:0;display:block;background:#000}
.vd-vazio{flex:1;display:grid;place-items:center;text-align:center;padding:16px;color:var(--muted);font-size:13px;line-height:1.5;background:radial-gradient(120% 120% at 50% 0,#1c1622,#07080d)}
.vd-b{flex:none;display:flex;gap:8px;padding:8px 10px;background:var(--vidro)}
.vd-b input{flex:1;min-width:0;height:30px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.05);padding:0 12px;font:400 13px var(--corpo);outline:0;user-select:text;-webkit-user-select:text}
.vd-b input:focus{border-color:rgba(240,169,138,.45)}
@container w (max-height:170px){.vd-b{display:none}}
`);
const Q = '(?:"|\\\\x22)';   // aspas normais ou escritas como \x22, pro regex do PowerShell
const idDe = t => { const m = String(t || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(t || '').match(/^([\w-]{11})$/); return m ? m[1] : null; };
Mesa.define({
  id:'video', nome:'Vídeo', descricao:'toca vídeo do YouTube dentro da Mesa (busca por assunto, link ou id)', w:560, h:372, minW:260, minH:150,
  icone:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
  monta(corpo, api){
    corpo.innerHTML = '<div class="vd"><div class="vd-vazio">Peça um vídeo pro Dengas<br>ou digite aqui embaixo.</div><div class="vd-b"><input placeholder="Buscar e tocar: show do Linkin Park…" spellcheck="false" aria-label="Buscar vídeo"><button class="m-bot" type="button">Tocar</button></div></div>';
    const caixa = corpo.querySelector('.vd'), campo = corpo.querySelector('input'), bot = corpo.querySelector('.m-bot');
    let atual = api.ler({}).atual || null, quadro = null, tocando = false;
    function poe(id, titulo, busca){
      atual = { id, titulo:titulo || '', busca:busca || '' }; api.salvar({ atual });
      caixa.querySelector('.vd-vazio')?.remove(); quadro?.remove();
      quadro = document.createElement('iframe'); quadro.title = titulo || 'Vídeo';
      quadro.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; quadro.setAttribute('allowfullscreen', '');
      quadro.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&enablejsapi=1&playsinline=1';
      caixa.insertBefore(quadro, caixa.firstChild); tocando = true; api.emitir('tocando', atual);
    }
    const manda = func => quadro?.contentWindow?.postMessage(JSON.stringify({ event:'command', func, args:'' }), '*');
    async function busca(q){
      q = String(q || '').trim().slice(0, 160); if (!q) throw new Error('diga o que procurar');
      const direto = idDe(q); if (direto){ poe(direto, '', q); return { id:direto }; }
      const s = "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $h = (Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -Uri ('https://www.youtube.com/results?search_query=' + [uri]::EscapeDataString('" + q.replace(/'/g, "''") + "')) -Headers @{ 'Accept-Language' = 'pt-BR' }).Content; "
        // a resposta vem com as aspas e chaves escritas como \x22, \x7b… (ou normais, conforme a versão da página)
        + "$q = '" + Q + "'; $m = [regex]::Match($h, $q + 'videoId' + $q + ':' + $q + '([\\w-]{11})'); "
        + "if ($m.Success) { $t = [regex]::Match($h.Substring($m.Index), $q + 'title' + $q + ':(?:\\{|\\\\x7b)' + $q + 'runs' + $q + ':(?:\\[|\\\\x5b)(?:\\{|\\\\x7b)' + $q + 'text' + $q + ':' + $q + '(.*?)' + $q + '(?:\\}|\\\\x7d)'); [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $m.Groups[1].Value + '|' + $t.Groups[1].Value } else { 'nada' }";
      const r = await api.ps(s, 30000); if (!r || r === 'nada' || !/^[\w-]{11}\|/.test(r)) throw new Error('não achei vídeo pra "' + q + '"');
      const id = r.slice(0, 11), titulo = r.slice(12).replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\u0026/g, '&').replace(/\\(["'\\\/])/g, '$1').slice(0, 120);
      poe(id, titulo, q); return { id, titulo };
    }
    const vai = () => busca(campo.value).then(() => { campo.value = ''; }).catch(e => api.avisar(String(e.message || e)));
    bot.addEventListener('click', vai); campo.addEventListener('keydown', e => { if (e.key === 'Enter') vai(); });
    if (atual?.id){ caixa.querySelector('.vd-vazio').innerHTML = 'Último vídeo: ' + (atual.titulo || atual.busca || atual.id).replace(/[<>&]/g, '') + '<br>Peça outro ou clique em Tocar.'; campo.value = atual.busca || ''; }
    return {
      estado:() => atual ? { video:atual.titulo || atual.busca || atual.id, id:atual.id, tocando } : { video:null },
      comandos:[
        { nome:'tocar', descricao:'Acha e toca um vídeo do YouTube dentro da Mesa. busca: o assunto (ex.: "Linkin Park show ao vivo completo"), um link do YouTube ou o id do vídeo. Devolve o título que começou a tocar.',
          esquema:{ type:'object', properties:{ busca:{ type:'string' } }, required:['busca'] },
          roda:({ busca:q }) => busca(q) },
        { nome:'controlar', descricao:'Controla o vídeo que está no widget: pausar, continuar, parar, mudo, som.',
          esquema:{ type:'object', properties:{ acao:{ type:'string', enum:['pausar','continuar','parar','mudo','som'] } }, required:['acao'] },
          roda({ acao }){ if (!quadro) throw new Error('não tem vídeo aberto'); manda({ pausar:'pauseVideo', continuar:'playVideo', parar:'stopVideo', mudo:'mute', som:'unMute' }[acao] || 'pauseVideo'); tocando = acao === 'continuar' || (tocando && (acao === 'mudo' || acao === 'som')); return 'feito'; } },
      ],
      aoFechar(){ quadro?.remove(); },
    };
  },
});
}
