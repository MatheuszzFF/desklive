/* Órbita: a barra da Órbita em forma de widget. Seus apps favoritos com o ícone de verdade e o pontinho de "aberto",
   busca em tudo que está instalado, e os anéis de CPU, RAM e placa de vídeo. Usa o helper da Órbita
   (modelos/compartilhado/orbita-helper.ps1) só pra ler: tick, apps e icon. Abrir é pelo Explorer. Nunca manda tecla
   (os comandos focus, key e combo do helper não são usados aqui). */
{
const HELPER = /*PS:compartilhado/orbita-helper.ps1*/'';
Mesa.estilo(`
.ob{height:100%;display:flex;align-items:center;gap:12px;padding:0 14px 10px;box-sizing:border-box}
.ob-apps{flex:1;min-width:0;display:flex;align-items:center;gap:6px;overflow-x:auto;scrollbar-width:none}
.ob-apps::-webkit-scrollbar{display:none}
.ob-a{position:relative;flex:none;width:46px;height:46px;border:0;border-radius:14px;background:transparent;cursor:pointer;display:grid;place-items:center;transition:background .15s,scale .35s var(--mola)}
.ob-a:hover{background:rgba(255,255,255,.08)} .ob-a:active{scale:.9}
.ob-a img{width:32px;height:32px;object-fit:contain;filter:drop-shadow(0 3px 6px rgba(0,0,0,.45));transition:transform .28s var(--mola);pointer-events:none}
.ob-a:hover img{transform:translateY(-4px) scale(1.12)}
.ob-a b{width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.1);display:grid;place-items:center;font:600 14px var(--titulo)}
.ob-a::after{content:"";position:absolute;left:50%;bottom:1px;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:var(--fg);opacity:0;scale:.4;transition:opacity .3s,scale .4s var(--mola)}
.ob-a.aberto::after{opacity:.85;scale:1}
.ob-b{flex:none;width:150px;height:30px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.05);padding:0 12px;font:400 13px var(--corpo);outline:0;user-select:text;-webkit-user-select:text}
.ob-b:focus{border-color:rgba(240,169,138,.45)}
.ob-r{flex:none;display:flex;gap:8px}
.ob-anel{position:relative;width:34px;height:34px}
.ob-anel svg{width:100%;height:100%;transform:rotate(-90deg)}
.ob-anel circle{fill:none;stroke-width:3}
.ob-anel .f{stroke:rgba(255,255,255,.14)} .ob-anel .v{stroke:var(--pessego);stroke-linecap:round;stroke-dasharray:88;stroke-dashoffset:88;transition:stroke-dashoffset .7s var(--suave),stroke .4s}
.ob-anel span{position:absolute;inset:0;display:grid;place-items:center;font:600 9px var(--titulo);font-variant-numeric:tabular-nums}
.ob-anel i{position:absolute;left:0;right:0;top:100%;text-align:center;font:600 8px/1.3 var(--corpo);font-style:normal;letter-spacing:.08em;color:var(--faint)}
.ob-ach{position:absolute;left:10px;right:10px;bottom:calc(100% - 26px);display:flex;flex-wrap:wrap;gap:6px;padding:8px;border-radius:14px;background:var(--vidro2);border:1px solid var(--line);z-index:3}
.ob-ach:empty{display:none}
.ob-ach button{border:1px solid var(--line);background:rgba(255,255,255,.05);border-radius:10px;padding:6px 10px;font:500 12.5px var(--corpo);cursor:pointer}
.ob-ach button:hover{background:rgba(255,255,255,.12)}
@container w (max-width:420px){.ob-b{display:none}}
@container w (max-width:300px){.ob-r{display:none}}
`);
Mesa.define({
  id:'apps', nome:'Órbita', descricao:'barra de apps (abre programas, mostra quais estão abertos) e o pulso do PC: CPU, RAM, placa', deSaida:true, lugar:{ borda:'b', x:360 }, w:600, h:104, minW:220, minH:92,
  icone:'<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-28 12 12)"/>',
  monta(corpo, api){
    corpo.innerHTML = '<div class="ob"><nav class="ob-apps" aria-label="Apps"></nav><input class="ob-b" placeholder="Procurar um app…" spellcheck="false" aria-label="Procurar um app"><div class="ob-r"></div></div><div class="ob-ach"></div>';
    corpo.style.overflow = 'visible';
    const barra = corpo.querySelector('.ob-apps'), busca = corpo.querySelector('.ob-b'), aneis = corpo.querySelector('.ob-r'), achados = corpo.querySelector('.ob-ach');
    const pede = api.ajudante(HELPER), g = api.ler({ favoritos:[], icones:{} });
    let todos = null, lendo = null, pulso = null, vivo = true;
    const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    function anel(id, rotulo){ const d = document.createElement('div'); d.className = 'ob-anel'; d.id = 'ob-' + id; d.innerHTML = '<svg viewBox="0 0 34 34"><circle class="f" cx="17" cy="17" r="14"/><circle class="v" cx="17" cy="17" r="14"/></svg><span>–</span><i>' + rotulo + '</i>'; aneis.appendChild(d); return d; }
    const A = { c:anel('cpu', 'CPU'), r:anel('ram', 'RAM'), g:anel('gpu', 'PLACA') }; A.g.hidden = true;
    function poe(el, v, sufixo, quente, morno){ el.querySelector('.v').style.strokeDashoffset = String(88 * (1 - Math.max(.02, Math.min(1, v / 100)))); el.querySelector('.v').style.stroke = v >= quente ? '#ff7d6e' : v >= morno ? '#f2c14e' : 'var(--pessego)'; el.querySelector('span').textContent = Math.round(v) + sufixo; }
    async function carrega(){
      if (todos) return todos;
      lendo ||= pede('apps', 20000).then(r => { const j = JSON.parse(r || '[]'); todos = (Array.isArray(j) ? j : [j]).map(a => ({ nome:a.Name, id:a.AppID, n:norm(a.Name) })); return todos; }).catch(() => { lendo = null; return []; });
      return lendo;
    }
    const acha = nome => { const q = norm(nome); return (todos || []).filter(a => a.n.includes(q)).sort((a, b) => (a.n.startsWith(q) ? 0 : 1) - (b.n.startsWith(q) ? 0 : 1) || a.n.length - b.n.length)[0]; };
    async function abre(a){ await api.ps("Start-Process explorer.exe -ArgumentList 'shell:AppsFolder\\" + String(a.id).replace(/'/g, "''") + "'"); api.emitir('abriu', { nome:a.nome }); return a.nome; }
    async function icone(a){ if (g.icones[a.id] !== undefined) return; g.icones[a.id] = ''; const b64 = await pede('icon ' + a.id, 8000); g.icones[a.id] = b64 ? 'data:image/png;base64,' + b64 : ''; api.salvar(g); pinta(); }
    function favorita(a, sim){ g.favoritos = g.favoritos.filter(f => f.id !== a.id); if (sim){ g.favoritos.push({ nome:a.nome, id:a.id }); icone(a); } else delete g.icones[a.id]; api.salvar(g); pinta(); }
    function pinta(){
      barra.replaceChildren();
      if (!api.podePC()){ const p = document.createElement('p'); p.className = 'm-fraco'; p.textContent = 'Abrir programas e ler o PC só funciona no app instalado, com o acesso total liberado.'; barra.appendChild(p); return; }
      if (!g.favoritos.length){ const p = document.createElement('p'); p.className = 'm-fraco'; p.textContent = 'Procure um app e clique nele pra pôr aqui (ou peça pro Dengas).'; barra.appendChild(p); }
      for (const a of g.favoritos){
        const b = document.createElement('button'); b.type = 'button'; b.className = 'ob-a'; b.title = a.nome + ' (botão direito tira daqui)'; b.setAttribute('aria-label', a.nome); b.dataset.id = a.id;
        if (g.icones[a.id]){ const img = document.createElement('img'); img.src = g.icones[a.id]; img.alt = ''; b.appendChild(img); } else { const l = document.createElement('b'); l.textContent = a.nome[0] || '?'; b.appendChild(l); icone(a); }
        b.addEventListener('click', () => abre(a).catch(() => {}));
        b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); favorita(a, false); });
        barra.appendChild(b);
      }
      marcaAbertos();
    }
    // quais favoritos estão abertos: compara o nome do processo com o nome do app (sem espaços); é uma boa aproximação
    function marcaAbertos(){ if (!pulso) return; const ps = String(pulso.p || '').split(','); for (const b of barra.querySelectorAll('.ob-a')){ const n = norm(b.getAttribute('aria-label')).replace(/[^a-z0-9]/g, ''); b.classList.toggle('aberto', ps.some(p => { const q = p.replace(/\.exe$/, '').replace(/[^a-z0-9]/g, ''); return q.length > 2 && (n.includes(q) || q.includes(n)); })); } }
    async function bate(){
      if (!api.podePC() || !vivo) return; const bruto = await pede('tick', 10000); if (!bruto) return;
      try { pulso = JSON.parse(bruto); } catch { return; }
      poe(A.c, pulso.c || 0, '', 85, 60); poe(A.r, pulso.r || 0, '', 85, 60);
      A.g.hidden = !(pulso.g > 0); if (pulso.g > 0) poe(A.g, pulso.g, '°', 80, 70);
      marcaAbertos();
    }
    busca.addEventListener('input', async () => {
      await carrega(); achados.replaceChildren(); const q = norm(busca.value); if (!q) return;
      for (const a of (todos || []).filter(x => x.n.includes(q)).slice(0, 8)){ const b = document.createElement('button'); b.type = 'button'; b.textContent = a.nome; b.title = 'Clique abre e põe na barra'; b.addEventListener('click', () => { favorita(a, true); abre(a).catch(() => {}); busca.value = ''; achados.replaceChildren(); }); achados.appendChild(b); }
    });
    pinta(); const tic = setInterval(bate, 2500);
    if (api.podePC()){ bate(); carrega(); }
    return {
      estado:() => ({ favoritos:g.favoritos.map(f => f.nome), cpu:pulso?.c, ram:pulso?.r, placa_graus:pulso?.g || undefined }),
      comandos:[
        { nome:'abrir', descricao:'Abre um programa instalado no PC pelo nome (ou parte dele), ex.: "Spotify", "Bloco de Notas". Devolve o nome do app aberto.',
          esquema:{ type:'object', properties:{ nome:{ type:'string' } }, required:['nome'] },
          async roda({ nome }){ await carrega(); const a = acha(nome); if (!a) throw new Error('não achei nenhum app instalado com "' + nome + '"'); return 'abri ' + await abre(a); } },
        { nome:'favoritar', descricao:'Põe (ou tira, com tirar=true) um app instalado na barra, pelo nome.',
          esquema:{ type:'object', properties:{ nome:{ type:'string' }, tirar:{ type:'boolean' } }, required:['nome'] },
          async roda({ nome, tirar }){ await carrega(); const a = acha(nome) || g.favoritos.find(f => norm(f.nome).includes(norm(nome))); if (!a) throw new Error('não achei "' + nome + '"'); favorita(a, !tirar); return g.favoritos.map(f => f.nome); } },
        { nome:'procurar', descricao:'Lista até 15 apps instalados cujo nome contém o texto.',
          esquema:{ type:'object', properties:{ texto:{ type:'string' } }, required:['texto'] },
          async roda({ texto }){ await carrega(); const q = norm(texto); return (todos || []).filter(a => a.n.includes(q)).slice(0, 15).map(a => a.nome); } },
        { nome:'pulso', descricao:'Lê agora CPU e RAM (em %), a temperatura da placa de vídeo se houver, e os processos abertos.',
          async roda(){ await bate(); if (!pulso) throw new Error('sem acesso ao PC'); return { cpu:pulso.c, ram:pulso.r, placa_graus:pulso.g || null, processos:String(pulso.p || '').split(',').slice(0, 80) }; } },
      ],
      aoFechar(){ vivo = false; clearInterval(tic); },
    };
  },
});
}
