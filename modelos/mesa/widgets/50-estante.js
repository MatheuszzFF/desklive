/* Estante: a ponte da Mesa com a Estante Musical (app de estudo de música, ainda um app à parte).
   Conversa com ela pelo barramento de arquivos ~/.dengas (estado em estante.json; comandos em estante-cmd/, gravados
   como .tmp e renomeados; respostas em estante-res/). O morador troca de música, tom, andamento e camadas por aqui.
   Quando a Estante virar um widget de verdade, este arquivo dá lugar a ela. */
Mesa.estilo(`
.es{height:100%;display:flex;flex-direction:column;gap:9px;padding:0 14px 12px;box-sizing:border-box}
.es-t{font:600 clamp(15px,5.5cqw,20px)/1.2 var(--titulo);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.es-m{color:var(--muted);font-size:12.5px;margin-top:3px}
.es-b{display:flex;flex-wrap:wrap;gap:6px}
.es-s{flex:1;min-height:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:3px}
.es-s::-webkit-scrollbar{display:none}
.es-s button{border:0;background:transparent;text-align:left;padding:5px 8px;border-radius:9px;font:500 12.5px var(--corpo);cursor:pointer;color:var(--muted)}
.es-s button:hover{background:rgba(255,255,255,.08);color:var(--fg)} .es-s button.on{color:var(--pessego)}
@container w (max-height:150px){.es-s{display:none}}
`);
Mesa.define({
  id:'estante', nome:'Estante Musical', descricao:'controla a Estante Musical: música, tom, andamento, camadas, tocar', w:300, h:260, minW:220, minH:120,
  icone:'<path d="M4 5h16M4 10h16M4 15h16M4 20h16"/><circle cx="8" cy="12.5" r="2"/><circle cx="15" cy="7.5" r="2"/>',
  monta(corpo, api){
    const DIR = '~/.dengas';
    corpo.innerHTML = '<div class="es"><div><div class="es-t"></div><div class="es-m"></div></div><div class="es-b"><button class="m-bot" data-c="toca" type="button">Tocar</button><button class="m-bot" data-c="tom-" type="button">Tom −</button><button class="m-bot" data-c="tom+" type="button">Tom +</button><button class="m-bot" data-c="bpm-" type="button">− bpm</button><button class="m-bot" data-c="bpm+" type="button">+ bpm</button></div><div class="es-s"></div></div>';
    const tit = corpo.querySelector('.es-t'), meta = corpo.querySelector('.es-m'), lista = corpo.querySelector('.es-s'), bToca = corpo.querySelector('[data-c=toca]');
    let est = null;
    const viva = () => !!est && Date.now() - est.ts < 6000, fs = () => api.host()?.fs;
    async function le(){
      if (!api.podePC() || !fs()) return pinta();
      try { const j = JSON.parse(await fs().readFile(DIR + '/estante.json', 'utf8')); if (j && typeof j.ts === 'number'){ const tocava = viva() && est.playing; est = j; if (viva() && j.playing && !tocava) api.emitir('tocando', { musica:j.song?.title }); } } catch {}
      pinta();
    }
    function pinta(){
      if (!api.podePC()){ tit.textContent = 'Só no app instalado'; meta.textContent = 'com o acesso total liberado'; lista.replaceChildren(); return; }
      if (!viva()){ tit.textContent = 'Estante fechada'; meta.textContent = 'abra o app Estante Musical pra eu conversar com ela'; lista.replaceChildren(); return; }
      tit.textContent = est.song?.title || 'Estante'; meta.textContent = `tom ${est.tone} · ${est.bpm} bpm · ${est.ins === 'gtr' ? 'guitarra' : 'baixo'} · compasso ${(est.bar ?? 0) + 1}`;
      bToca.textContent = est.playing ? 'Pausar' : 'Tocar';
      const chave = (est.songs || []).map(s => s.id).join() + '|' + est.song?.id;
      if (lista.dataset.k !== chave){ lista.dataset.k = chave; lista.replaceChildren(); for (const s of est.songs || []){ const b = document.createElement('button'); b.type = 'button'; b.textContent = s.title; b.className = s.id === est.song?.id ? 'on' : ''; b.addEventListener('click', () => manda('song', { id:s.id }).catch(() => {})); lista.appendChild(b); } }
    }
    async function manda(cmd, args, sinal){
      if (!api.podePC() || !fs()) throw new Error('só no app instalado, com o acesso total liberado');
      if (!viva()) throw new Error('a Estante Musical não está aberta');
      const id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await fs().mkdir(DIR + '/estante-cmd', { recursive:true });
      await fs().writeFile(DIR + '/estante-cmd/' + id + '.tmp', JSON.stringify({ id, cmd, args:args || {} }), 'utf8');
      await fs().rename(DIR + '/estante-cmd/' + id + '.tmp', DIR + '/estante-cmd/' + id + '.json');
      const res = DIR + '/estante-res/' + id + '.json';
      for (let i = 0; i < 20; i++){
        await new Promise(ok => setTimeout(ok, 250)); if (sinal?.aborted) throw new Error('cancelado');
        if (await fs().exists(res).catch(() => false)){ const r = JSON.parse(await fs().readFile(res, 'utf8')); fs().rm(res, { force:true }).catch(() => {}); if (!r.ok) throw new Error(String(r.error || 'a Estante recusou')); le(); return r.result === undefined ? 'feito' : r.result; }
      }
      throw new Error('a Estante não respondeu em 5 segundos');
    }
    const BOT = { toca:() => manda(est?.playing ? 'pause' : 'play'), 'tom-':() => manda('tone', { delta:-1 }), 'tom+':() => manda('tone', { delta:1 }), 'bpm-':() => manda('bpm', { delta:-4 }), 'bpm+':() => manda('bpm', { delta:4 }) };
    corpo.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => BOT[b.dataset.c]().catch(e => api.avisar(String(e.message || e)))));
    le(); const t = setInterval(le, 2000);
    return {
      estado:() => viva() ? { aberta:true, musica:est.song, musicas:est.songs, tom:est.tone, transposicao:est.transpose, bpm:est.bpm, instrumento:est.ins, forma:est.mode, camadas:est.layers, camadas_disponiveis:est.allLayers, tocando:est.playing, compasso:est.bar, acorde:est.chord } : { aberta:false },
      comandos:[
        { nome:'comando', descricao:'Manda um comando pra Estante Musical e devolve o resultado. cmd e args: song {id} ou {title} (parte do título); layers {on:[ids], off:[ids]} ou {set:[ids]}; tone {delta} ou {transpose} em semitons; bpm {value} ou {delta}; instrument {value:"bass"|"gtr"}; form {value: free|score|study|mini|ribbon|disc}; play; pause; bar {index}; practice (abre escalas e frases); disc (disco de acordes); state.',
          esquema:{ type:'object', properties:{ cmd:{ type:'string', enum:['song','layers','tone','bpm','instrument','form','play','pause','bar','practice','disc','state'] }, args:{ type:'object' } }, required:['cmd'] },
          roda:({ cmd, args }, ctx) => manda(String(cmd), args && typeof args === 'object' ? args : {}, ctx?.signal) },
      ],
      aoFechar:() => clearInterval(t),
    };
  },
});
