/* Apps: a barra de apps dentro da Mesa (a ideia da Órbita em forma de widget). Lista os apps instalados do menu
   Iniciar, guarda os seus favoritos e abre com um clique. O morador abre qualquer app pelo nome. Não manda tecla. */
Mesa.estilo(`
.ap{height:100%;display:flex;flex-direction:column;gap:8px;padding:0 12px 12px;box-sizing:border-box}
.ap-b{flex:none;height:30px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.05);padding:0 12px;font:400 13px var(--corpo);outline:0;user-select:text;-webkit-user-select:text}
.ap-b:focus{border-color:rgba(240,169,138,.45)}
.ap-l{flex:1;min-height:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px}
.ap-l::-webkit-scrollbar{display:none}
.ap-i{border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:12px;padding:7px 11px;font:500 12.5px/1.2 var(--corpo);cursor:pointer;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background .2s,scale .2s var(--mola),border-color .2s}
.ap-i:hover{background:rgba(255,255,255,.11)} .ap-i:active{scale:.95}
.ap-i.fav{border-color:rgba(240,169,138,.4)}
@container w (max-height:110px){.ap-b{display:none}.ap-l{flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden}}
`);
Mesa.define({
  id:'apps', nome:'Apps', descricao:'abre os programas instalados no PC', deSaida:true, lugar:{ borda:'b', x:380 }, w:460, h:120, minW:220, minH:84,
  icone:'<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  monta(corpo, api){
    corpo.innerHTML = '<div class="ap"><input class="ap-b" placeholder="Procurar um app…" spellcheck="false" aria-label="Procurar um app"><div class="ap-l"></div></div>';
    const busca = corpo.querySelector('.ap-b'), lista = corpo.querySelector('.ap-l');
    const g = api.ler({ favoritos:[] }); let todos = null, carregando = null;
    const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    async function carrega(){
      if (todos) return todos;
      carregando ||= api.ps("[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-StartApps | Where-Object { $_.AppID -notmatch '^https?:' } | Select-Object Name, AppID | ConvertTo-Json -Compress", 20000)
        .then(r => { const j = JSON.parse(r || '[]'); todos = (Array.isArray(j) ? j : [j]).map(a => ({ nome:a.Name, id:a.AppID, n:norm(a.Name) })); pinta(); return todos; })
        .catch(() => { carregando = null; return []; });
      return carregando;
    }
    function acha(nome){ const q = norm(nome); return (todos || []).filter(a => a.n.includes(q)).sort((a, b) => (a.n.startsWith(q) ? 0 : 1) - (b.n.startsWith(q) ? 0 : 1) || a.n.length - b.n.length)[0]; }
    async function abre(a){ await api.ps("Start-Process explorer.exe -ArgumentList 'shell:AppsFolder\\" + String(a.id).replace(/'/g, "''") + "'"); api.emitir('abriu', { nome:a.nome }); return a.nome; }
    function favorita(a, sim){ g.favoritos = g.favoritos.filter(f => f.id !== a.id); if (sim) g.favoritos.push({ nome:a.nome, id:a.id }); api.salvar(g); pinta(); }
    function pinta(){
      lista.replaceChildren();
      if (!api.podePC()){ const p = document.createElement('p'); p.className = 'm-fraco'; p.textContent = 'Abrir programas só funciona no app instalado, com o acesso total liberado.'; lista.appendChild(p); return; }
      const q = norm(busca.value), itens = q ? (todos || []).filter(a => a.n.includes(q)).slice(0, 24) : g.favoritos;
      if (!itens.length){ const p = document.createElement('p'); p.className = 'm-fraco'; p.textContent = q ? 'Nada com esse nome.' : 'Procure um app e clique com o botão direito pra deixar aqui como favorito (ou peça pro Dengas).'; lista.appendChild(p); return; }
      for (const a of itens){
        const fav = g.favoritos.some(f => f.id === a.id), b = document.createElement('button'); b.type = 'button'; b.className = 'ap-i' + (fav ? ' fav' : ''); b.textContent = a.nome; b.title = fav ? 'Botão direito tira dos favoritos' : 'Botão direito põe nos favoritos';
        b.addEventListener('click', () => abre(a).catch(() => {}));
        b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); favorita(a, !fav); });
        lista.appendChild(b);
      }
    }
    busca.addEventListener('input', () => { carrega(); pinta(); });
    pinta(); if (api.podePC()) carrega();
    return {
      estado:() => ({ favoritos:g.favoritos.map(f => f.nome), instalados:todos ? todos.length : 'ainda não li' }),
      comandos:[
        { nome:'abrir', descricao:'Abre um programa instalado no PC pelo nome (ou parte dele), ex.: "Spotify", "Bloco de Notas". Devolve o nome do app aberto.',
          esquema:{ type:'object', properties:{ nome:{ type:'string' } }, required:['nome'] },
          async roda({ nome }){ await carrega(); const a = acha(nome); if (!a) throw new Error('não achei nenhum app instalado com "' + nome + '"'); return 'abri ' + await abre(a); } },
        { nome:'favoritar', descricao:'Põe (ou tira, com tirar=true) um app instalado na lista de favoritos da barra, pelo nome.',
          esquema:{ type:'object', properties:{ nome:{ type:'string' }, tirar:{ type:'boolean' } }, required:['nome'] },
          async roda({ nome, tirar }){ await carrega(); const a = acha(nome) || g.favoritos.find(f => norm(f.nome).includes(norm(nome))); if (!a) throw new Error('não achei "' + nome + '"'); favorita(a, !tirar); return g.favoritos.map(f => f.nome); } },
        { nome:'procurar', descricao:'Lista até 15 apps instalados cujo nome contém o texto.',
          esquema:{ type:'object', properties:{ texto:{ type:'string' } }, required:['texto'] },
          async roda({ texto }){ await carrega(); const q = norm(texto); return (todos || []).filter(a => a.n.includes(q)).slice(0, 15).map(a => a.nome); } },
      ],
    };
  },
});
