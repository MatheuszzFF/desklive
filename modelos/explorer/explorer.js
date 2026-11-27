/* Explorer: os arquivos do PC dentro do Board, como widget de fábrica (moldura: âncoras, tamanhos e CSS por tamanho).
   Tudo passa pelo ajudante.ps1 (um PowerShell residente); o caminho vai em base64, nunca vira código.
   Privacidade (regra "nada fora do Board sem o sim do dono"): o assistente NÃO enxerga pasta nem arquivo. estado() só
   diz que o widget está em uso, e o único comando navega a tela, sem devolver nada do que está lá. */
{
const ajuda = Mesa.ajudante(/*PS:explorer/ajudante.ps1*/'', 'explorer');
const b64 = t => btoa(unescape(encodeURIComponent(t)));
const de64 = t => decodeURIComponent(escape(atob(t)));
async function fs(pedido, tempo){
  const r = await ajuda('fs ' + b64(JSON.stringify(pedido)), tempo || 20000);
  if (!r?.startsWith('b64:')) throw new Error(Mesa.podePC() ? 'o PowerShell não respondeu' : 'abra o Board instalado e libere o acesso total');
  const o = JSON.parse(de64(r.slice(4))); if (o.erro) throw new Error(o.erro); return o;
}
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const ic = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  volta:ic('<path d="M19 12H5m6-6-6 6 6 6"/>'), sobe:ic('<path d="M12 19V5m-6 6 6-6 6 6"/>'), atualiza:ic('<path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6"/>'),
  nova:ic('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 10v6m-3-3h6"/>'),
  grade:ic('<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/>'), lista:ic('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
  pasta:ic('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'), arq:ic('<path d="M6 3h8l5 5v13H6zM14 3v5h5"/>'),
  imagem:ic('<path d="M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01"/>'), audio:ic('<path d="M9 18V5l10-2v13M9 18a3 2.5 0 1 1-6 0 3 2.5 0 0 1 6 0m10-2a3 2.5 0 1 1-6 0 3 2.5 0 0 1 6 0"/>'),
  video:ic('<path d="M3 6h13v12H3zM16 10l5-3v10l-5-3"/>'), zip:ic('<path d="M6 3h8l5 5v13H6zM11 5v2m0 2v2m0 2v2m-1 2h2v3h-2z"/>'),
  disco:ic('<path d="M3 13h18v6H3zM3 13l3-8h12l3 8M7 16h.01"/>'),
};
const TIPOS = [['imagem', /\.(png|jpe?g|gif|bmp|webp|tiff?|ico)$/i], ['audio', /\.(mp3|wav|flac|m4a|ogg|aac|mid)$/i], ['video', /\.(mp4|mkv|avi|mov|webm|wmv)$/i], ['zip', /\.(zip|rar|7z|tar|gz)$/i]];
const tipo = it => it.d ? 'pasta' : TIPOS.find(([, r]) => r.test(it.n))?.[0] || 'arq';
const COM_MINI = /\.(png|jpe?g|gif|bmp|tiff?)$/i;
const tam = n => n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : n < 1073741824 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : (n / 1073741824).toFixed(1).replace('.', ',') + ' GB';
const data = m => new Date(m).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' });
const NOMES = { area:'Área de Trabalho', downloads:'Downloads', documentos:'Documentos', imagens:'Imagens', musicas:'Músicas', videos:'Vídeos' };
const junta = (p, n) => p.replace(/\\$/, '') + '\\' + n;
const pai = p => { const s = p.replace(/\\$/, ''); const i = s.lastIndexOf('\\'); if (i < 0 || (s.startsWith('\\\\') && s.split('\\').length <= 4)) return ''; const q = s.slice(0, i); return /^[A-Za-z]:$/.test(q) ? q + '\\' : q; };

Mesa.estilo(`
.ex{position:absolute;inset:0;display:flex;font-size:12.5px;outline:0;--r:9px}
.ex svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex:none}
.ex ::-webkit-scrollbar{width:0;height:0}
.ex button{border:0;background:transparent;cursor:pointer;display:flex;align-items:center;gap:8px;border-radius:var(--r);transition:background .16s,transform .35s var(--mola),color .16s}
.ex button:hover{background:rgba(255,255,255,.08)}.ex button:active{transform:scale(.94)}.ex button:disabled{opacity:.3;pointer-events:none}
.ex-lado{width:168px;flex:none;overflow:auto;padding:12px 8px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:2px}
.ex-lado button{padding:7px 10px;color:var(--muted);text-align:left;white-space:nowrap}.ex-lado button.on{color:var(--fg);background:rgba(217,119,87,.18)}.ex-lado button.on svg{color:var(--coral)}
.ex-lado hr{border:0;border-top:1px solid var(--line);margin:8px 4px}.ex-lado small{display:block;color:var(--faint);font-size:10.5px}
.ex-lado span{overflow:hidden;text-overflow:ellipsis}
.ex-meio{flex:1;min-width:0;display:flex;flex-direction:column}
.ex-topo{display:flex;align-items:center;gap:4px;padding:10px 40px 6px 10px}.ex-topo>button{padding:7px;color:var(--muted)}
.ex-trilha{flex:1;min-width:0;display:flex;overflow:auto;white-space:nowrap}.ex-trilha button{padding:5px 6px;color:var(--faint);flex:none}.ex-trilha button:last-child{color:var(--fg);font-weight:600;font-size:14px}
.ex-busca{margin:0 12px 6px;padding:7px 12px;border-radius:var(--r);border:1px solid var(--line);background:rgba(255,255,255,.04);outline:0}.ex-busca:focus{border-color:var(--coral)}
.ex-corpo{flex:1;overflow:auto;padding:4px 10px 10px;align-content:start;display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));grid-auto-rows:max-content;gap:4px}
.ex-it{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border-radius:var(--r);cursor:default;min-width:0;transition:background .16s,transform .35s var(--mola)}
.ex-it:hover{background:rgba(255,255,255,.06)}.ex-it:active{transform:scale(.97)}.ex-it.on{background:rgba(217,119,87,.22)}.ex-it.corte{opacity:.45}
.ex-ic{height:52px;display:grid;place-items:center;color:var(--muted)}.ex-ic svg{width:40px;height:40px;stroke-width:1.2}.ex-it.d .ex-ic{color:var(--pessego)}.ex-ic img{max-width:76px;max-height:52px;border-radius:5px}
.ex-n{max-width:100%;text-align:center;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere;line-height:1.25}.ex-i{display:none;color:var(--faint);font-variant-numeric:tabular-nums;white-space:nowrap}
.ex-corpo.lista{grid-template-columns:1fr;gap:1px}.ex-corpo.lista .ex-it{flex-direction:row;padding:5px 8px;gap:10px}.ex-corpo.lista .ex-ic{height:22px;width:28px}.ex-corpo.lista .ex-ic svg{width:18px;height:18px;stroke-width:1.5}.ex-corpo.lista .ex-ic img{max-width:28px;max-height:22px}
.ex-corpo.lista .ex-n{flex:1;text-align:left;-webkit-line-clamp:1}.ex-corpo.lista .ex-i{display:block}
.ex-it input{width:100%;min-width:0;background:rgba(0,0,0,.4);border:1px solid var(--coral);border-radius:5px;padding:2px 5px;outline:0}
.ex-vazio{grid-column:1/-1;color:var(--faint);padding:24px 8px}
.ex-pe{display:flex;align-items:center;gap:8px;min-height:34px;padding:2px 12px 6px;color:var(--faint);font-variant-numeric:tabular-nums}.ex-pe span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ex-pe span.erro{color:var(--pessego)}
.ex-pe button{padding:5px 10px;color:var(--muted)}.ex-pe button.pri{background:var(--coral);color:#fff}
.ex-menu{position:absolute;z-index:9;min-width:180px;padding:5px;border-radius:12px;background:rgba(28,30,40,.98);box-shadow:0 10px 30px rgba(0,0,0,.45)}.ex-menu button{width:100%;padding:7px 10px}.ex-menu hr{border:0;border-top:1px solid var(--line);margin:4px}
@container mold (max-width:520px){.ex-lado{width:44px;padding:10px 5px}.ex-lado span,.ex-lado hr{display:none}.ex-lado button{justify-content:center;padding:8px 0}.ex-corpo.lista .ex-i.dt{display:none}}
@container mold (max-width:340px){.ex-lado,.ex-busca,.ex-corpo.lista .ex-i,.ex-topo .opc{display:none}}
@container mold (max-height:240px){.ex-busca,.ex-pe{display:none}}
`);

Mesa.define({
  id:'explorer', nome:'Explorador', descricao:'os arquivos do PC dentro da Mesa: pastas, miniaturas, busca, abrir, copiar, mover, renomear e Lixeira',
  w:720, h:460, minW:260, minH:180, passavel:true, persistir:true,
  tamanhos:{ esquerda:{ w:420, h:640 }, direita:{ w:420, h:640 }, superior:{ w:900, h:340 }, inferior:{ w:900, h:340 }, 'canto-sup':{ w:480, h:380 }, 'canto-inf':{ w:480, h:380 } },
  monta(corpo, api){
    const S = Object.assign({ caminho:'', lista:false }, api.ler({}));
    let lugares = null, itens = [], sel = new Set(), ancora = -1, historia = [], area = null, pedido = 0, buscando = '', minis = new Map(), nota = '';
    corpo.innerHTML = `<div class="ex" tabindex="0"><nav class="ex-lado" data-fixo></nav><div class="ex-meio">
      <div class="ex-topo"><button type="button" data-a="volta" title="Voltar">${I.volta}</button><button type="button" data-a="sobe" title="Pasta de cima">${I.sobe}</button><div class="ex-trilha"></div>
      <button type="button" class="opc" data-a="nova" title="Nova pasta">${I.nova}</button><button type="button" class="opc" data-a="vista" title="Grade ou lista"></button><button type="button" class="opc" data-a="atualiza" title="Atualizar">${I.atualiza}</button></div>
      <input class="ex-busca" placeholder="Buscar nesta pasta (Enter procura nas de dentro)" spellcheck="false"><div class="ex-corpo" data-fixo></div><div class="ex-pe"></div></div></div>`;
    const R = corpo.querySelector('.ex'), q = s => R.querySelector(s), C = q('.ex-corpo'), busca = q('.ex-busca');
    const caminhoDe = it => it.p || junta(S.caminho, it.n);
    const escolhidos = () => [...sel].map(i => itens[i]).filter(Boolean);
    const guarda = () => api.salvar({ caminho:S.caminho, lista:S.lista });

    function pe(texto, erro, botoes){
      const e = q('.ex-pe'), s = escolhidos();
      const padrao = s.length ? (s.length === 1 ? s[0].n + (s[0].d ? '' : ' · ' + tam(s[0].t)) : s.length + ' selecionados') : (nota || itens.length + (itens.length === 1 ? ' item' : ' itens'));
      e.innerHTML = `<span class="${erro ? 'erro' : ''}">${esc(texto || padrao)}</span>`;
      for (const [rotulo, fn, pri] of botoes || (area && !texto ? [['Colar ' + area.origens.length, colar, true]] : [])){ const b = document.createElement('button'); b.type = 'button'; b.textContent = rotulo; if (pri) b.className = 'pri'; b.onclick = fn; e.appendChild(b); }
    }
    const falhou = e => pe(String(e.message || e), true);
    function lado(){
      if (!lugares) return;
      q('.ex-lado').innerHTML = `<button type="button" data-ir="" title="Este computador" class="${S.caminho ? '' : 'on'}">${I.disco}<span>Este computador</span></button><hr>` +
        Object.entries(lugares.pastas).filter(([, p]) => p).map(([k, p]) => `<button type="button" data-ir="${esc(p)}" title="${NOMES[k]}" class="${S.caminho === p ? 'on' : ''}">${I.pasta}<span>${NOMES[k]}</span></button>`).join('') + '<hr>' +
        lugares.discos.map(d => `<button type="button" data-ir="${esc(d.p)}" title="${esc(d.p)}" class="${S.caminho === d.p ? 'on' : ''}">${I.disco}<span>${esc((d.rotulo || 'Disco') + ' ' + d.p.slice(0, 2))}<small>${tam(d.livre)} livres</small></span></button>`).join('');
    }
    function trilha(){
      const partes = []; let p = S.caminho; while (p){ partes.unshift([p.replace(/\\$/, '').split('\\').pop(), p]); p = pai(p); }
      q('.ex-trilha').innerHTML = (partes.length ? partes : [['Este computador', '']]).map(([n, c]) => `<button type="button" data-ir="${esc(c)}">${esc(n)}</button>`).join('<button type="button" disabled>›</button>');
      const t = q('.ex-trilha'); t.scrollLeft = t.scrollWidth;
      q('[data-a=volta]').disabled = !historia.length; q('[data-a=sobe]').disabled = !S.caminho; q('[data-a=nova]').disabled = !S.caminho;
    }
    function desenha(){
      q('[data-a=vista]').innerHTML = S.lista ? I.grade : I.lista; C.classList.toggle('lista', S.lista);
      const filtro = buscando ? '' : busca.value.trim().toLowerCase();
      const html = itens.map((it, i) => filtro && !it.n.toLowerCase().includes(filtro) ? '' :
        `<div class="ex-it${it.d ? ' d' : ''}${sel.has(i) ? ' on' : ''}${area?.mover && area.origens.includes(caminhoDe(it)) ? ' corte' : ''}" data-i="${i}" title="${esc(it.p || it.n)}"><div class="ex-ic">${it.disco ? I.disco : minis.has(caminhoDe(it)) ? `<img src="data:image/jpeg;base64,${minis.get(caminhoDe(it))}" alt="">` : I[tipo(it)]}</div><div class="ex-n">${esc(it.n)}</div><div class="ex-i">${it.d ? '' : tam(it.t)}</div><div class="ex-i dt">${it.m ? data(it.m) : ''}</div></div>`).join('');
      C.innerHTML = html || `<div class="ex-vazio">${filtro || buscando ? 'Nada com esse nome.' : 'Pasta vazia.'}</div>`;
    }
    async function miniaturas(meu){
      const l = itens.filter(it => !it.d && COM_MINI.test(it.n) && !minis.has(caminhoDe(it))).slice(0, 96).map(caminhoDe);
      for (let i = 0; i < l.length && meu === pedido; i += 8){
        try { const r = await fs({ acao:'mini', caminhos:l.slice(i, i + 8) }); for (const [c, d] of Object.entries(r.minis || {})) minis.set(c, d); } catch { return; }
        if (meu === pedido && !C.querySelector('input')) desenha();
      }
      while (minis.size > 400) minis.delete(minis.keys().next().value);
    }
    async function ir(destino, { volta, mantem } = {}){
      const meu = ++pedido, antes = S.caminho; fechaMenu(); if (!mantem){ C.innerHTML = '<div class="ex-vazio">Abrindo…</div>'; }
      try {
        lugares = lugares && destino && !mantem ? lugares : await fs({ acao:'lugares' });
        let lista, total = 0, caminho = destino;
        if (destino){ const r = await fs({ acao:'lista', caminho:destino }); lista = [].concat(r.itens || []); total = r.total; caminho = r.caminho; }
        else lista = lugares.discos.map(d => ({ n:(d.rotulo || 'Disco') + ' (' + d.p.slice(0, 2) + ')', p:d.p, d:true, disco:true, t:0 }));
        if (meu !== pedido) return;
        if (!volta && !mantem && caminho !== antes) historia.push(antes);
        S.caminho = caminho; itens = lista; sel.clear(); ancora = -1; buscando = ''; if (!mantem) busca.value = '';
        nota = total > lista.length ? 'mostrando ' + lista.length + ' de ' + total : '';
        guarda(); lado(); desenha(); trilha(); pe(); if (!mantem) C.scrollTop = 0; miniaturas(meu);
      } catch (e) { if (meu !== pedido) return; if (destino && !antes && !itens.length){ S.caminho = ''; return ir(''); } desenha(); falhou(e); }
    }
    const recarrega = () => ir(S.caminho, { mantem:true });
    async function procura(){
      const t = busca.value.trim(); if (!t || !S.caminho) return;
      const meu = ++pedido; pe('Procurando…');
      try { const r = await fs({ acao:'busca', caminho:S.caminho, texto:t }, 25000); if (meu !== pedido) return; buscando = t; itens = [].concat(r.itens || []); sel.clear(); nota = itens.length + ' achados' + (r.cortou ? ' (parei no limite)' : ''); desenha(); pe(); miniaturas(meu); }
      catch (e) { falhou(e); }
    }
    async function muda(pedidoFs, andando){
      pe(andando);
      try { await fs(pedidoFs, 600000); await recarrega(); return true; } catch (e) { await recarrega(); falhou(e); return false; }
    }
    async function abre(it){
      if (!it) return; if (it.d) return ir(caminhoDe(it));
      pe('Abrindo ' + it.n + '…');
      // o Board fica por cima de tudo: quando dá, a janela que abrir vem pra dentro dele
      const traz = Mesa.comandos().find(c => c.widget === 'janelas' && c.nome === 'abrir_programa');
      try { if (traz) await traz.roda({ programa:caminhoDe(it) }); else await fs({ acao:'abrir', caminho:caminhoDe(it) }); pe(); } catch (e) { falhou(e); }
    }
    const copia = mover => { const l = escolhidos().filter(i => !i.disco); if (!l.length) return; area = { origens:l.map(caminhoDe), mover }; desenha(); pe(); };
    async function colar(destino){
      const d = typeof destino === 'string' ? destino : S.caminho; if (!area || !d) return;
      const a = area; if (await muda({ acao:a.mover ? 'mover' : 'copiar', origens:a.origens, destino:d }, a.mover ? 'Movendo…' : 'Copiando…') && a.mover){ area = null; desenha(); pe(); }
    }
    function apaga(){
      const l = escolhidos().filter(i => !i.disco); if (!l.length) return; const origens = l.map(caminhoDe);
      pe('Mandar ' + (l.length === 1 ? '"' + l[0].n + '"' : l.length + ' itens') + ' pra Lixeira?', false, [['Cancelar', () => pe()], ['Lixeira', () => muda({ acao:'lixeira', origens }, 'Mandando pra Lixeira…'), true]]);
    }
    function nomeia(i){
      const it = itens[i], el = C.querySelector(`[data-i="${i}"] .ex-n`); if (!it || !el || it.disco) return;
      const inp = document.createElement('input'); inp.value = it.n; inp.spellcheck = false; el.replaceWith(inp); inp.focus(); inp.setSelectionRange(0, it.d || it.n.lastIndexOf('.') < 1 ? it.n.length : it.n.lastIndexOf('.'));
      let feito = false; const fim = ok => { if (feito) return; feito = true; const n = inp.value.trim(); R.focus(); if (ok && n && n !== it.n) muda({ acao:'renomear', origem:caminhoDe(it), nome:n }, 'Renomeando…'); else desenha(); };
      inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') fim(true); if (e.key === 'Escape') fim(false); }); inp.addEventListener('blur', () => fim(true));
    }
    async function novaPasta(){
      if (!S.caminho) return;
      try { const r = await fs({ acao:'nova', caminho:S.caminho, nome:'Nova pasta' }); await recarrega(); const i = itens.findIndex(it => caminhoDe(it) === r.feito); if (i >= 0){ sel = new Set([i]); desenha(); nomeia(i); } } catch (e) { falhou(e); }
    }
    function fechaMenu(){ R.querySelector('.ex-menu')?.remove(); }
    function menu(e){
      fechaMenu(); const s = escolhidos(), um = s.length === 1 ? s[0] : null, l = [];
      if (um) l.push(['Abrir', () => abre(um)]);
      if (s.length && !s[0].disco) l.push(['Copiar', () => copia(false)], ['Recortar', () => copia(true)]);
      if (area) l.push(um?.d ? ['Colar dentro', () => colar(caminhoDe(um))] : ['Colar aqui', () => colar()]);
      if (um && !um.disco) l.push(['Renomear', () => nomeia([...sel][0])]);
      if (um) l.push(['Copiar o caminho', () => navigator.clipboard?.writeText(caminhoDe(um)).then(() => pe('Caminho copiado'), falhou)]);
      if (um && buscando) l.push(['Mostrar na pasta', () => ir(pai(caminhoDe(um)))]);
      if (s.length && !s[0].disco) l.push(null, ['Mandar pra Lixeira', apaga]);
      if (!s.length && S.caminho) l.push(['Nova pasta', novaPasta], ['Atualizar', recarrega]);
      if (!l.length) return;
      const m = document.createElement('div'); m.className = 'ex-menu'; m.dataset.fixo = '';
      for (const x of l){ if (!x){ m.appendChild(document.createElement('hr')); continue; } const b = document.createElement('button'); b.type = 'button'; b.textContent = x[0]; b.onclick = () => { fechaMenu(); x[1](); }; m.appendChild(b); }
      R.appendChild(m); const r = R.getBoundingClientRect(), k = r.width / Math.max(1, R.offsetWidth);
      m.style.left = Math.max(4, Math.min((e.clientX - r.left) / k, R.offsetWidth - m.offsetWidth - 4)) + 'px'; m.style.top = Math.max(4, Math.min((e.clientY - r.top) / k, R.offsetHeight - m.offsetHeight - 4)) + 'px';
    }
    R.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation(); if (!e.target.closest('.ex-corpo')) return fechaMenu();
      const i = e.target.closest('.ex-it')?.dataset.i; if (i == null) sel.clear(); else if (!sel.has(+i)) sel = new Set([+i]);
      desenha(); pe(); menu(e);
    });
    R.addEventListener('pointerdown', e => { if (!e.target.closest('.ex-menu')) fechaMenu(); });
    R.addEventListener('click', e => {
      const d = e.target.closest('[data-ir]'); if (d) return ir(d.dataset.ir);
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'volta' && historia.length) return ir(historia.pop(), { volta:true });
      if (a === 'sobe') return ir(pai(S.caminho));
      if (a === 'nova') return novaPasta();
      if (a === 'vista'){ S.lista = !S.lista; guarda(); return desenha(); }
      if (a === 'atualiza') return recarrega();
      if (!e.target.closest('.ex-corpo') || e.target.closest('input')) return;
      const el = e.target.closest('.ex-it'); R.focus();
      if (!el){ sel.clear(); }
      else { const i = +el.dataset.i;
        if (e.shiftKey && ancora >= 0){ sel = new Set(); for (let j = Math.min(i, ancora); j <= Math.max(i, ancora); j++) if (C.querySelector(`[data-i="${j}"]`)) sel.add(j); }
        else { if (e.ctrlKey){ sel.has(i) ? sel.delete(i) : sel.add(i); } else sel = new Set([i]); ancora = i; } }
      // só troca a marca: redesenhar aqui mataria o duplo clique
      C.querySelectorAll('.ex-it').forEach(x => x.classList.toggle('on', sel.has(+x.dataset.i))); pe();
    });
    C.addEventListener('dblclick', e => { const el = e.target.closest('.ex-it'); if (el && !e.target.closest('input')) abre(itens[+el.dataset.i]); });
    busca.addEventListener('input', () => { if (buscando){ buscando = ''; recarrega(); } else desenha(); });
    busca.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') procura(); if (e.key === 'Escape'){ busca.value = ''; if (buscando) recarrega(); else desenha(); } });
    R.addEventListener('keydown', e => {
      if (e.target.closest('input')) return; const c = e.ctrlKey, k = e.key.toLowerCase(); let usou = true;
      if (k === 'enter') abre(escolhidos()[0]); else if (k === 'backspace') ir(pai(S.caminho)); else if (k === 'delete') apaga(); else if (k === 'f2') nomeia([...sel][0]); else if (k === 'f5') recarrega();
      else if (c && k === 'c') copia(false); else if (c && k === 'x') copia(true); else if (c && k === 'v') colar(); else if (c && k === 'a'){ sel = new Set([...C.querySelectorAll('.ex-it')].map(x => +x.dataset.i)); desenha(); pe(); } else if (k === 'escape'){ fechaMenu(); sel.clear(); desenha(); pe(); } else usou = false;
      if (usou){ e.preventDefault(); e.stopPropagation(); }
    });
    ir(S.caminho);

    return {
      estado:() => ({ em_uso:true, o_que:'o dono navegando nos arquivos (o conteúdo não aparece pro assistente)' }),
      comandos:[
        { nome:'ir', descricao:'Mostra uma pasta conhecida na tela do Explorador: computador, area, downloads, documentos, imagens, musicas ou videos. Só muda o que o dono vê; não devolve nome de arquivo nenhum.',
          esquema:{ type:'object', properties:{ lugar:{ type:'string', enum:['computador', ...Object.keys(NOMES)] } }, required:['lugar'] },
          async roda({ lugar }){ if (lugar !== 'computador' && !NOMES[lugar]) throw new Error('lugares: computador, ' + Object.keys(NOMES).join(', ')); lugares = lugares || await fs({ acao:'lugares' }); await ir(lugar === 'computador' ? '' : lugares.pastas[lugar]); return 'mostrando ' + (NOMES[lugar] || 'Este computador'); } },
      ],
    };
  },
});
}
Mesa.agente('explorer', 'Você cuida do Explorador de arquivos. Você não enxerga as pastas do dono: só pode mostrar uma pasta conhecida na tela com ir. Pra qualquer outra coisa, diga que o dono faz pela própria janela.');
