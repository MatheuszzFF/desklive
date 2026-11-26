/* Onda: o player da Onda em forma de widget. Capa, música, e uma onda que é a barra de tempo (clique ou arraste pra
   pular). Usa o mesmo helper da Onda (modelos/onda/musica-helper.ps1): sessão de mídia do Windows e, se o Spotify já
   estiver conectado pela Onda, a Web API (buscar e tocar, fila). Nunca manda tecla. */
{
const HELPER = /*PS:onda/musica-helper.ps1*/'';
Mesa.estilo(`
.on{height:100%;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr auto;gap:8px 12px;padding:0 14px 12px;box-sizing:border-box;--c1:#a9b8ff;--c2:#9fffc4}
.on-capa{grid-row:1/3;width:clamp(48px,34cqh,150px);aspect-ratio:1;border-radius:14px;overflow:hidden;background:rgba(255,255,255,.06);box-shadow:0 12px 26px -10px rgba(0,0,0,.7),0 0 26px -6px var(--c1);display:grid;place-items:center;cursor:pointer;border:0;padding:0;transition:scale .35s var(--mola)}
.on-capa:active{scale:.96}
.on-capa img{width:100%;height:100%;object-fit:cover;display:block}
.on-capa svg{width:44%;opacity:.5;fill:none;stroke:#f4f5f8;stroke-width:3.2;stroke-linecap:round}
.on-t{min-width:0;align-self:end}
.on-t b{display:block;font:600 clamp(14px,5.4cqw,22px)/1.2 var(--titulo);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.on-t span{display:block;color:var(--muted);font-size:12.5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.on-c{display:flex;align-items:center;gap:6px;align-self:start}
.on-c button{width:34px;height:34px;border-radius:50%;border:0;background:transparent;cursor:pointer;display:grid;place-items:center;transition:background .15s,scale .3s var(--mola)}
.on-c button:hover{background:rgba(255,255,255,.12)} .on-c button:active{scale:.9}
.on-c button.pp{width:42px;height:42px;background:var(--fg);color:#0b0d12}
.on-c svg{width:16px;height:16px;fill:currentColor}
.on-c .tm{margin-left:auto;font:500 11px var(--corpo);color:var(--faint);font-variant-numeric:tabular-nums}
.on-w{grid-column:1/3;height:34px;position:relative;cursor:pointer;touch-action:none}
.on-w canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
@container w (max-height:118px){.on{grid-template-rows:1fr auto}.on-c{display:none}.on-capa{grid-row:1}}
`);
Mesa.define({
  id:'musica', nome:'Onda', descricao:'o que está tocando no PC: capa, tempo, tocar, pausar, pular, buscar no Spotify', deSaida:true, lugar:{ x:28, y:28 }, w:360, h:220, minW:230, minH:112,
  icone:'<path d="M3 13c3 0 3-5 6-5s3 9 6 9 3-12 6-12"/>',
  monta(corpo, api){
    corpo.innerHTML = '<div class="on"><button class="on-capa" type="button" aria-label="Tocar ou pausar"><svg viewBox="0 0 48 48"><path d="M4 26c5 0 5-8 10-8s5 14 10 14 5-20 10-20 5 14 10 14"/></svg></button>'
      + '<div class="on-t"><b>Nada tocando</b><span></span></div>'
      + '<div class="on-c"><button type="button" data-a="prev" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM9.5 12 19 5v14z"/></svg></button><button type="button" class="pp" data-a="toggle" aria-label="Tocar ou pausar"><svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg></button><button type="button" data-a="next" aria-label="Próxima"><svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM5 5l9.5 7L5 19z"/></svg></button><span class="tm"></span></div>'
      + '<div class="on-w" role="slider" aria-label="Posição da música" tabindex="0"><canvas></canvas></div></div>';
    const raiz = corpo.querySelector('.on'), capa = corpo.querySelector('.on-capa'), tit = corpo.querySelector('.on-t b'), art = corpo.querySelector('.on-t span'), pp = corpo.querySelector('.pp'), tm = corpo.querySelector('.tm'), onda = corpo.querySelector('.on-w'), cv = onda.querySelector('canvas'), g = cv.getContext('2d');
    const pede = api.ajudante(HELPER);
    let st = null, stEm = 0, chaveArte = '', cores = ['#a9b8ff', '#9fffc4'], previa = null, fase = 0, amp = 0, vivo = true, conectado = false;
    const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    const ok = () => !!(st?.ok && st.title);
    const pos = () => !ok() ? 0 : Math.min(st.dur || 1e9, st.pos + (st.playing ? (performance.now() - stEm) / 1000 : 0));
    function coresDa(img){   // duas cores vivas da capa pintam a onda
      const c = document.createElement('canvas'); c.width = c.height = 24; const q = c.getContext('2d'); q.drawImage(img, 0, 0, 24, 24);
      const d = q.getImageData(0, 0, 24, 24).data, px = [];
      for (let i = 0; i < d.length; i += 4){ const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); px.push({ r:d[i], g:d[i + 1], b:d[i + 2], s:(mx ? (mx - mn) / mx : 0) * (.35 + mx / 255) }); }
      px.sort((a, b) => b.s - a.s);
      const viva = p => { const mx = Math.max(p.r, p.g, p.b) || 1, k = 235 / mx; return p.s < .12 ? '#c9d2ff' : `rgb(${[p.r, p.g, p.b].map(v => Math.round(Math.min(255, v * k) * .8 + 51)).join(',')})`; };
      cores = [viva(px[0]), viva(px[Math.floor(px.length * .12)])]; raiz.style.setProperty('--c1', cores[0]); raiz.style.setProperty('--c2', cores[1]);
    }
    function pinta(){
      if (!api.podePC()){ tit.textContent = 'Só no app instalado'; art.textContent = 'com o acesso total liberado'; return; }
      tit.textContent = ok() ? st.title : 'Nada tocando'; art.textContent = ok() ? [st.artist, st.album].filter(Boolean).join(' · ') : 'abra o Spotify ou um player';
      pp.innerHTML = ok() && st.playing ? '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>';
    }
    async function atualiza(){
      const bruto = await pede('state'); if (bruto == null || !vivo) return;
      let s; try { s = JSON.parse(bruto); } catch { return; }
      const antes = st?.artKey; st = s; stEm = performance.now();
      if (s.ok && s.artKey && s.artKey !== chaveArte){
        chaveArte = s.artKey; const b64 = await pede('art', 8000);
        capa.querySelector('img')?.remove();
        if (b64){ const img = new Image(); img.alt = ''; img.onload = () => { capa.querySelector('svg').style.display = 'none'; capa.appendChild(img); coresDa(img); }; img.src = 'data:image/png;base64,' + b64; } else capa.querySelector('svg').style.display = '';
        if (antes !== undefined && s.title) api.emitir('mudou', { musica:s.title, artista:s.artist });
      }
      pinta();
    }
    async function manda(cmd, arg){ const r = await pede(arg != null ? cmd + ' ' + arg : cmd); setTimeout(atualiza, 350); setTimeout(atualiza, 1100); return r; }
    corpo.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => manda(b.dataset.a)));
    capa.addEventListener('click', () => manda('toggle'));
    // a onda é a barra de tempo
    const frac = e => { const r = onda.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
    onda.addEventListener('pointerdown', e => { if (!ok() || !st.canSeek) return; e.stopPropagation(); try { onda.setPointerCapture(e.pointerId); } catch {} previa = frac(e) * st.dur; });
    onda.addEventListener('pointermove', e => { if (previa != null) previa = frac(e) * st.dur; });
    onda.addEventListener('pointerup', () => { if (previa == null) return; const p = previa; previa = null; st.pos = p; stEm = performance.now(); manda('seek', p.toFixed(1)); });
    function desenha(t){
      if (!vivo) return;
      const w = onda.clientWidth, h = onda.clientHeight, dpr = devicePixelRatio || 1;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const toca = ok() && st.playing; amp += ((toca ? .55 + .25 * Math.sin(t / 420) : .12) - amp) * .08; fase += toca ? .05 : .012;
      const dur = ok() ? st.dur : 0, p = previa ?? pos(), px = dur > 0 ? Math.min(1, p / dur) * w : 0, meio = h / 2, A = (h / 2 - 3) * amp;
      const y = (x, f, s, a) => meio + A * a * Math.pow(Math.sin(Math.PI * x / w), 1.5) * Math.sin(x / w * Math.PI * 2 * f + fase * s + f);
      const traco = (f, s, a) => { g.beginPath(); for (let x = 0; x <= w; x += 2){ const q = y(x, f, s, a); x ? g.lineTo(x, q) : g.moveTo(x, q); } };
      const CAM = [[2.2, 1, 1, 2], [3.4, -1.35, .62, 1.4], [1.5, .7, .42, 1.1]];
      g.save(); g.beginPath(); g.rect(px, 0, w - px, h); g.clip(); CAM.forEach(([f, s, a, l], i) => { traco(f, s, a); g.strokeStyle = `rgba(244,245,248,${i ? .14 : .3})`; g.lineWidth = l; g.stroke(); }); g.restore();
      const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, cores[0]); gr.addColorStop(1, cores[1]);
      g.save(); g.beginPath(); g.rect(0, 0, px, h); g.clip(); g.shadowColor = cores[0]; g.shadowBlur = 8; CAM.forEach(([f, s, a, l], i) => { traco(f, s, a); g.strokeStyle = gr; g.globalAlpha = i ? .55 : 1; g.lineWidth = l + (i ? 0 : .4); g.stroke(); }); g.restore();
      if (dur > 0){ g.beginPath(); g.arc(px, y(px, 2.2, 1, 1), 3.4, 0, 7); g.fillStyle = '#fff'; g.fill(); }
      tm.textContent = ok() ? fmt(p) + ' / ' + fmt(dur) : '';
      Mesa.quadro(desenha);
    }
    Mesa.quadro(desenha); pinta();
    const tic = setInterval(() => { if (api.podePC()) atualiza(); }, 1000);
    if (api.podePC()){ atualiza(); pede('conectado').then(r => { conectado = r === 'sim'; }); }
    // Web API do Spotify (só se a Onda já conectou: o token mora em ~/.orbita)
    async function spotify(metodo, caminho, corpoJson){
      const b64 = corpoJson ? btoa(unescape(encodeURIComponent(JSON.stringify(corpoJson)))) : '';
      const bruto = await pede(`api ${metodo} ${caminho}${b64 ? ' ' + b64 : ''}`, 20000); if (!bruto) return { status:0 };
      try { const j = JSON.parse(bruto); let d = null; try { d = j.body ? JSON.parse(j.body) : null; } catch {} return { status:j.status, d }; } catch { return { status:0 }; }
    }
    const ACAO = { tocar:'play', pausar:'pause', alternar:'toggle', proxima:'next', anterior:'prev' };
    return {
      estado:() => ok() ? { musica:st.title, artista:st.artist, album:st.album, tocando:st.playing, posicao_s:Math.round(pos()), duracao_s:Math.round(st.dur), aleatorio:!!st.shuffle, programa:st.app, spotify_conectado:conectado } : { tocando:false, spotify_conectado:conectado },
      comandos:[
        { nome:'controlar', descricao:'Controla o que toca no PC: tocar, pausar, alternar, proxima, anterior. Devolve o estado depois.',
          esquema:{ type:'object', properties:{ acao:{ type:'string', enum:Object.keys(ACAO) } }, required:['acao'] },
          async roda({ acao }){ if (!ACAO[acao]) throw new Error('ação desconhecida'); const r = await manda(ACAO[acao]); if (r == null) throw new Error('sem acesso ao PC'); await new Promise(q => setTimeout(q, 900)); await atualiza(); return ok() ? { musica:st.title, artista:st.artist, tocando:st.playing } : 'nada tocando'; } },
        { nome:'ir_para', descricao:'Pula pra um ponto da música, em segundos.',
          esquema:{ type:'object', properties:{ segundos:{ type:'number' } }, required:['segundos'] },
          async roda({ segundos }){ if (!ok()) throw new Error('nada tocando'); await manda('seek', Math.max(0, Number(segundos) || 0).toFixed(1)); return 'feito'; } },
        { nome:'tocar_busca', descricao:'Acha e toca uma música, álbum, artista ou playlist no Spotify (tipo: musica, album, artista, playlist). Se o Spotify não estiver conectado pela Onda, só abre a busca no app.',
          esquema:{ type:'object', properties:{ busca:{ type:'string' }, tipo:{ type:'string', enum:['musica','album','artista','playlist'] } }, required:['busca'] },
          async roda({ busca, tipo }){
            const q = String(busca || '').slice(0, 200); if (!q) throw new Error('busca vazia');
            if (!conectado){ await api.ps("Start-Process -FilePath 'spotify:search:" + encodeURIComponent(q) + "'"); return 'Spotify não conectado: abri a busca no app, é só escolher lá'; }
            const T = { musica:'track', album:'album', artista:'artist', playlist:'playlist' }[tipo] || 'track';
            const r = await spotify('GET', `/search?q=${encodeURIComponent(q)}&type=${T}&limit=5`), it = r.d?.[T + 's']?.items?.filter(Boolean)?.[0];
            if (!it) throw new Error(r.status === 200 ? 'nada encontrado' : 'o Spotify respondeu ' + r.status);
            const p = await spotify('PUT', '/me/player/play', T === 'track' ? { uris:[it.uri] } : { context_uri:it.uri });
            if (p.status >= 300) throw new Error('o Spotify não tocou (' + p.status + '): abra o Spotify no PC e tente de novo');
            setTimeout(atualiza, 900); return 'tocando ' + it.name;
          } },
        { nome:'fila', descricao:'Lê as próximas músicas da fila do Spotify (só com o Spotify conectado pela Onda).',
          async roda(){ if (!conectado) throw new Error('Spotify não conectado'); const r = await spotify('GET', '/me/player/queue'); if (r.status !== 200) throw new Error('o Spotify respondeu ' + r.status); return (r.d.queue || []).slice(0, 10).map(i => i.name + ' — ' + (i.artists || []).map(a => a.name).join(', ')); } },
      ],
      aoFechar(){ vivo = false; clearInterval(tic); },
    };
  },
});
}
