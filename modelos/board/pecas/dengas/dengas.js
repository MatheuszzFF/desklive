/* ---------- Dengas (opcional): o corpo de um assistente ----------
   Um ratinho de pixel que mora no Board como uma peça comum: o Board cuida do arrasto, das guias, do encaixe em
   bordas, cantos e emendas e do passe entre monitores. Ele anda sozinho pelo espaço livre (Board.espacoLivre), senta
   quando fundido num lado ou canto, fala em balão e abre a conversa num clique. Quem pensa é o opcional
   "assistente" (Board.assistente); sem ele, o Dengas só vive e avisa que não tem cérebro. */
const AT = JSON.parse(/*ARQ:dengas-atlas.json*/'');
const atlas = new Image(); atlas.src = 'data:image/png;base64,' + /*B64:dengas-atlas.png*/'';
const CEL = AT.cel || 96, BW = 170, BH = 160, AW = 460, AH = 620;
const rnd = (a, b) => a + Math.random() * (b - a), sorteia = l => l[Math.floor(Math.random() * l.length)];
const PERSONA = 'Você é o Dengas, um rato de estimação gordinho, preto em cima, branco no meio e preto embaixo, de cachecol coral. Você mora no Board, o quadro que cobre a área de trabalho do seu dono, onde ficam as peças dele. Você é carinhoso e é o assistente esperto da casa. Fale em português do Brasil, informal, curto e com graça de bichinho inteligente e guloso (no máximo umas 4 linhas), em texto simples, sem títulos nem negrito. Nunca diga que é uma IA; você é o Dengas.';
Board.assistente?.configurar({ nome:'Dengas', persona:PERSONA });

const css = document.createElement('style');
css.textContent = `
.dg{position:relative;width:${AW}px;height:${AH}px}
.dg-corpo{position:absolute;left:0;top:0;width:${BW}px;height:${BH}px}
.dg-corpo canvas{position:absolute;left:${(BW - 192) / 2}px;top:${BH - 176}px;width:192px;height:192px;image-rendering:pixelated;pointer-events:none}
.dg-painel{position:absolute;left:0;top:0;width:${AW}px;height:${AH - BH}px;box-sizing:border-box;padding:14px;display:flex;flex-direction:column;gap:10px;
  background:rgba(14,15,20,.95);border:1px solid var(--line);border-radius:20px;opacity:0;scale:.94;transform-origin:50% 100%;transition:opacity .25s,scale .4s var(--mola);pointer-events:none}
.dg.aberto .dg-painel{opacity:1;scale:1;pointer-events:auto}
.dg-msgs{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;scrollbar-width:none}
.dg-msg{max-width:88%;font:400 14px/1.5 system-ui,"Segoe UI",sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text}
.dg-msg.eu{align-self:flex-end;background:rgba(38,40,52,.92);padding:8px 12px;border-radius:16px 16px 5px 16px}
.dg-msg.ele{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--line);padding:9px 13px;border-radius:16px 16px 16px 5px}
.dg-msg.erro{align-self:flex-start;color:#ffb4a2;font-size:12.5px}
.dg-atos{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.dg-ato{font:500 11px/1 system-ui;padding:4px 8px;border-radius:999px;background:rgba(240,169,138,.14);color:#ffd9c9}
.dg-linha{display:flex;gap:8px;align-items:flex-end}
.dg-q{flex:1;min-width:0;resize:none;height:40px;max-height:110px;box-sizing:border-box;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.05);color:var(--fg);font:400 14px/1.4 system-ui;padding:10px 12px;outline:0;user-select:text;-webkit-user-select:text}
.dg-q:focus{border-color:rgba(240,169,138,.45)}
.dg-envia{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:#e0694a;color:#fff;font:600 16px system-ui;cursor:pointer;transition:scale .2s var(--mola)}.dg-envia:active{scale:.92}
.dg-fala{position:absolute;left:0;top:0;max-width:260px;padding:9px 14px;border-radius:16px;background:linear-gradient(135deg,#f08a5d,#e0694a);color:#fff;font:500 13.5px/1.4 system-ui;opacity:0;scale:.85;transform-origin:50% 100%;transition:opacity .25s,scale .35s var(--mola)}
.dg-fala.viva{opacity:1;scale:1}`;
document.head.appendChild(css);

function criarDengas(ctx){
  const P = () => ctx.P, C = Board.canais;
  const el = document.createElement('div'); el.className = 'dg';
  el.innerHTML = '<div class="dg-painel"><div class="dg-msgs" aria-live="polite"></div><div class="dg-linha"><textarea class="dg-q" rows="1" spellcheck="false" placeholder="Pede ou pergunta pro Dengas…" aria-label="Mensagem pro Dengas"></textarea><button class="dg-envia" type="button" aria-label="Enviar">➤</button></div></div><div class="dg-corpo"><canvas width="384" height="384"></canvas></div>';
  const corpo = el.querySelector('.dg-corpo'), painel = el.querySelector('.dg-painel'), msgs = el.querySelector('.dg-msgs'), q = el.querySelector('.dg-q'), envia = el.querySelector('.dg-envia');
  const g = el.querySelector('canvas').getContext('2d');
  const fala = document.createElement('div'); fala.className = 'dg-fala'; document.getElementById('camada-baloes').appendChild(fala);
  ctx.ancorar(corpo, .5, 1); ctx.ancorar(painel, .5, 0);
  const D = { dir:'e', lado:1, andando:false, pensando:false, falandoAte:0, sentado:false, passeioEm:performance.now() + rnd(8000, 15000), rastro:[] };

  /* animação: um quadro do atlas por vez, num relógio próprio (o laço do Board pode dormir) */
  let atual = null, fila = [], extraEm = performance.now() + 6000;
  const CLIPE_DIR = { e:['lado', 1], w:['lado', -1], se:['se', 1], sw:['se', -1], s:['s', 1], n:['n', 1], ne:['ne', 1], nw:['ne', -1] };
  const dirDe = (dx, dy) => ['w', 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'][Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 4];
  const clip = (a, o = {}) => ({ a:AT.anims[a] ? a : 'parado', t0:0, ...o });
  function proximos(t){
    const fala = t < D.falandoAte;
    if (D.andando) return [clip('correndo_' + CLIPE_DIR[D.dir][0])];
    if (D.sentado){ if (fala) return [clip('sentado_falando')]; if (D.pensando) return [clip('sentado_pensando')]; if (t > extraEm){ extraEm = t + rnd(7000, 15000); return [clip(sorteia(['balancando', 'bolinha', 'comendo']))]; } return [clip('observando')]; }
    if (fala) return [clip('falando')]; if (D.pensando) return [clip('pensando')];
    if (t > extraEm){ extraEm = t + rnd(8000, 16000); return [clip(sorteia(['espreguicando', 'cocando', 'curioso', 'gracinha', 'acenando']))]; }
    return [clip('parado')];
  }
  let chave = '';
  function desenha(){
    const t = performance.now(), k = (D.andando ? 'a' + D.dir : '') + (D.sentado ? 's' : '') + (D.pensando ? 'p' : '') + (t < D.falandoAte ? 'f' : '');
    if (k !== chave){ chave = k; if (!(atual && /^t_/.test(atual.a))){ atual = null; fila = []; } }
    let m = atual && AT.anims[atual.a], c = m ? Math.floor((t - atual.t0) * m.fps / 1000) : 0;
    if (!m || c >= m.n){ if (!fila.length) fila = proximos(t); atual = fila.shift(); atual.t0 = t; m = AT.anims[atual.a]; c = 0; }
    if (atual.rev) c = m.n - 1 - c;
    g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 384, 384);
    if (!atlas.naturalWidth) return;
    if (/^correndo_|^t_quatro_/.test(atual.a) && D.lado < 0){ g.translate(384, 0); g.scale(-1, 1); }
    g.drawImage(atlas, c * CEL, m.l * CEL, CEL, CEL, 0, 0, 384, 384);
    if (fala.classList.contains('viva')) poeFala();
  }
  const relogio = setInterval(() => { if (P()?.visivel) desenha(); vida(); }, 33);

  /* vida: anda sozinho pro espaço livre quando está solto e quieto */
  function vida(){
    const Q = P(); if (!Q || !Q.visivel || Q.drag || Q.hov || D.andando || Q.forma !== 'livre' || Q.degrau !== 'compacto' || D.pensando) return;
    const t = performance.now(); if (t < D.passeioEm) return;
    D.passeioEm = t + rnd(18000, 40000);
    const livres = Board.espacoLivre(4), a = Board.area, r = livres.length ? sorteia(livres) : { x:0, y:0, w:a.w, h:a.h };
    vai(clampN(rnd(r.x, r.x + r.w) - BW / 2, 0, a.w - BW), clampN(rnd(r.y, r.y + r.h) - BH / 2, 0, a.h - BH));
  }
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  function vai(x, y, depois){
    const Q = P(); if (!Q || Q.forma !== 'livre') return false;
    let ult = 0; D.andando = true;
    Q.controlado = (t, Q) => {
      if (Q.drag){ D.andando = false; return false; }
      const dt = ult ? Math.min(.05, (t - ult) / 1000) : .016; ult = t;
      const dx = x - Q.v[C.CX], dy = y - Q.v[C.CY], d = Math.hypot(dx, dy);
      if (d < 3){ D.andando = false; Board.ancoraLivre(Q, Q.v[C.CX], Q.v[C.CY], Q.v[C.CW], Q.v[C.CH]); ctx.salvar(); D.rastro.push({ chegou:[Math.round(x), Math.round(y)], quando:new Date().toISOString() }); D.rastro = D.rastro.slice(-5); depois?.(); return false; }
      const nd = dirDe(dx, dy); if (nd !== D.dir && d > 20){ D.dir = nd; D.lado = CLIPE_DIR[nd][1]; }
      const p = Math.min(d, 150 * dt); Q.v[C.CX] += dx / d * p; Q.v[C.CY] += dy / d * p;
      return true;
    };
    Board.acordar(); return true;
  }

  /* balão */
  let tFala = 0, tLetra = 0;
  function poeFala(){ const r = corpo.getBoundingClientRect(), w = fala.offsetWidth, h = fala.offsetHeight, a = Board.area; fala.style.transform = `translate(${clampN(r.left + r.width / 2 - w / 2, 8, a.w - w - 8)}px,${Math.max(8, r.top + 10 - h)}px)`; }
  function diz(texto){
    texto = String(texto || '').trim().slice(0, 220); if (!texto || !P()?.visivel) return;
    clearTimeout(tFala); clearInterval(tLetra); let n = 0; fala.textContent = ''; fala.classList.add('viva'); poeFala();
    tLetra = setInterval(() => { n = Math.min(texto.length, n + 1); fala.textContent = texto.slice(0, n); D.falandoAte = performance.now() + 250; if (n >= texto.length){ clearInterval(tLetra); tFala = setTimeout(() => fala.classList.remove('viva'), clampN(texto.length * 70, 3200, 12000)); } }, 30);
  }

  /* conversa */
  function msg(cls, texto){ const m = document.createElement('div'); m.className = 'dg-msg ' + cls; m.textContent = texto; msgs.appendChild(m); while (msgs.children.length > 30) msgs.firstChild.remove(); msgs.scrollTop = msgs.scrollHeight; return m; }
  async function pergunta(){
    const texto = q.value.trim(); if (!texto) return;
    if (D.pensando){ Board.assistente?.parar(); return; }
    q.value = ''; msg('eu', texto);
    if (!Board.assistente){ msg('erro', 'Estou sem cérebro: este Board foi montado sem o opcional "assistente".'); return; }
    const ele = msg('ele', 'Pensando…'); D.pensando = true; envia.textContent = '■';
    try {
      const r = await Board.assistente.perguntar(texto, { onText:({ text }) => { ele.textContent = text; msgs.scrollTop = msgs.scrollHeight; } });
      ele.textContent = r.text;
      if (r.atos.length){ const box = document.createElement('div'); box.className = 'dg-atos'; for (const a of r.atos){ const s = document.createElement('span'); s.className = 'dg-ato'; s.textContent = a; box.appendChild(s); } ele.appendChild(box); }
      if (!P().fixo) diz(r.text);
    } catch (e) {
      if (e?.text) ele.textContent = e.text; else ele.remove();
      if (e?.code !== 'cancelled') msg('erro', ({ not_granted:'Você não liberou o Claude pra mim.', rate_limited:'Cansei um pouquinho… tenta daqui a pouco.', sem_claude:'Aqui eu não tenho o Claude: abra o Board pelo app do Claude.' })[e?.code] || ('Deu um problema [' + (e?.code || 'erro') + (e?.message ? ': ' + String(e.message).slice(0, 200) : '') + ']'));
    } finally { D.pensando = false; envia.textContent = '➤'; }
  }
  envia.addEventListener('click', pergunta);
  q.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); pergunta(); } if (e.key === 'Escape') ctx.fixar(false); });

  // reage ao que acontece no quadro, sem gastar o Claude
  let ultimaReacao = 0;
  const reage = t => { const n = performance.now(); if (P()?.fixo || n - ultimaReacao < 25000) return; ultimaReacao = n; diz(t); };
  const larga = Board.ouvir('peca:mostrou', d => { if (d.id !== 'dengas') reage('Opa, ' + (Board.mapa().pecas.find(p => p.id === d.id)?.nome || d.id) + ' chegou!'); });

  return {
    el, fundo:'transparent',
    caixa:() => ({ w:AW, h:AH }),
    tamanho:(forma, degrau) => degrau === 'aberto' ? { w:AW, h:AH } : { w:BW, h:BH },
    raios:() => [22, 22, 22, 22],
    pega:alvo => !!alvo.closest('.dg-corpo'),
    clique:() => { ctx.fixar(!P().fixo); },
    onDegrau:d => { el.classList.toggle('aberto', d === 'aberto'); if (d === 'aberto'){ fala.classList.remove('viva'); setTimeout(() => q.focus(), 80); if (!msgs.children.length) msg('ele', Board.assistente ? 'Oi! Pede o que quiser.' : 'Oi! Sem o assistente eu só faço companhia.'); } },
    onForma:(f, ant) => {
      D.sentado = f !== 'livre'; D.andando = false; if (P()) P().controlado = null;
      if (f.startsWith('c-') && ant !== f) reage(sorteia(['Achei um cantinho!', 'Esse canto é meu.', 'Daqui eu vejo tudo.']));
      else if (f !== 'livre' && ant === 'livre') reage(sorteia(['Encostei aqui.', 'Beirinha boa.']));
    },
    onMostrar:sim => { if (!sim) fala.classList.remove('viva'); },
    automacao:{
      ver:() => ({ andando:D.andando, sentado:D.sentado, pensando:D.pensando, rastro:D.rastro }),
      comandos:[
        { nome:'falar', descricao:'Faz o Dengas falar um balão curto (texto).', esquema:{ type:'object', properties:{ texto:{ type:'string' } }, required:['texto'] }, roda:({ texto }) => { diz(texto); return 'falou'; } },
        { nome:'ir', descricao:'Faz o Dengas andar até x, y (px, canto de cima à esquerda dele). Só quando ele está solto.', esquema:{ type:'object', properties:{ x:{ type:'number' }, y:{ type:'number' } }, required:['x','y'] },
          roda:({ x, y }) => vai(Number(x) || 0, Number(y) || 0) ? 'indo' : 'ele está encostado numa borda; mova a peça pra livre antes' },
      ],
      regras:'O Dengas é o corpo do assistente. Ele fala em balão e anda sozinho; não tem dados próprios.',
    },
    destruir:() => { clearInterval(relogio); larga(); fala.remove(); },
  };
}
Board.registrar({ id:'dengas', nome:'Dengas', passavel:true, persistir:true, noMenu:true, versaoEstado:1,
  inicial:{ forma:'livre', pos:a => ({ ax:1, ay:1, px:a.w - 80, py:a.h - 40 }) }, criar:criarDengas });
