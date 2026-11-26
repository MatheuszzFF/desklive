/* ---------- Dengas, o morador da Mesa ----------
   Um ratinho de pixel que mora no quadro: fica em pé em cima das coisas (a beira de baixo da tela ou o topo de um
   widget), anda de lado, senta, olha o ponteiro e conversa. Ele é o assistente: enxerga o estado de todos os widgets
   abertos e os comandos que cada um oferece, e usa isso como ferramentas do Claude. Clique nele pra conversar;
   arraste pra mudar de lugar (ele cai até a superfície de baixo). */
{
const AT = /*ATLAS*/{};
const atlas = new Image(); atlas.src = /*ATLAS_PNG*/'';
const CEL = AT.cel || 96, Z = 2;                       // cada pixel da arte vira 2 px na tela
const MODELO = 'claude-haiku-5-5';
const { bus, area } = Mesa;
const rnd = (a, b) => a + Math.random() * (b - a), sorteia = l => l[Math.floor(Math.random() * l.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

Mesa.estilo(`
#dg{position:absolute;left:0;top:0;width:0;height:0;z-index:5000;pointer-events:none}
#dg canvas{position:absolute;left:-96px;top:-176px;width:192px;height:192px;pointer-events:none;transition:filter .2s}
#dg.pego canvas{filter:drop-shadow(0 10px 8px rgba(0,0,0,.35))}
#dgHit{position:absolute;left:-40px;top:-122px;width:80px;height:122px;border:0;padding:0;background:transparent;border-radius:26px;cursor:grab;pointer-events:auto;touch-action:none}
#dg.pego #dgHit{cursor:grabbing}
#dgHit:focus-visible{outline:2px solid var(--pessego);outline-offset:2px}
/* o assento: um traço escuro fundido na beira de baixo, onde ele senta */
#dgBanco{position:absolute;left:-64px;top:-4px;width:128px;height:30px;border-radius:15px 15px 0 0;background:var(--vidro);box-shadow:0 -6px 22px -10px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.07);opacity:0;scale:.6 1;transform-origin:50% 100%;transition:opacity .3s,scale .45s var(--mola)}
#dg.no-chao #dgBanco{opacity:1;scale:.72 1}
#dg.no-chao.sentado #dgBanco{opacity:1;scale:1}
/* balão: o que ele fala sozinho, com o texto saindo no ritmo da boca */
#dgFala{position:absolute;z-index:5001;left:0;top:0;max-width:260px;padding:9px 14px;border-radius:16px;background:linear-gradient(135deg,#f08a5d,#e0694a);color:#fff;font:500 13.5px/1.4 var(--corpo);box-shadow:0 10px 26px -10px rgba(0,0,0,.6);opacity:0;scale:.8;transform-origin:50% 100%;transition:opacity .25s,scale .35s var(--mola);pointer-events:none}
#dgFala.viva{opacity:1;scale:1;pointer-events:auto}
#dgFala::after{content:"";position:absolute;left:calc(50% - 6px);bottom:-5px;width:12px;height:12px;background:#e0694a;rotate:45deg;border-radius:2px}
/* conversa: a pílula de vidro que nasce dele, com as sugestões e as mensagens */
#dgPainel{position:absolute;z-index:5002;left:0;top:0;width:min(520px,calc(100vw - 24px));display:flex;flex-direction:column;gap:8px;opacity:0;scale:.92;pointer-events:none;transition:opacity .22s,scale .4s var(--mola)}
#dgPainel.aberto{opacity:1;scale:1;pointer-events:auto}
#dgPainel.desce{flex-direction:column-reverse}
#dgMsgs{display:flex;flex-direction:column;gap:8px;max-height:min(46vh,420px);overflow-y:auto;scrollbar-width:none;padding:2px}
#dgMsgs::-webkit-scrollbar{display:none}
.dg-msg{max-width:88%;font:400 14.5px/1.5 var(--corpo);white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text}
.dg-msg.eu{align-self:flex-end;background:rgba(38,40,52,.92);padding:8px 13px;border-radius:17px 17px 5px 17px}
.dg-msg.ele{align-self:flex-start;background:var(--vidro);border:1px solid var(--line);padding:10px 14px;border-radius:17px 17px 17px 5px}
.dg-msg.erro{align-self:flex-start;color:#ffb4a2;font-size:13px}
.dg-msg.pensa{color:var(--muted);animation:dgpensa 1.2s ease-in-out infinite}
@keyframes dgpensa{50%{opacity:.45}}
.dg-atos{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.dg-ato{font:500 11.5px/1 var(--corpo);padding:5px 9px;border-radius:999px;background:rgba(217,119,87,.16);border:1px solid rgba(240,169,138,.3);color:#ffd9c9}
#dgChips{display:flex;flex-wrap:wrap;gap:7px}
.dg-chip{border:1px solid var(--line);background:var(--vidro);border-radius:999px;padding:7px 13px;font:500 13px/1.2 var(--corpo);cursor:pointer;transition:background .2s,scale .2s var(--mola),border-color .2s}
.dg-chip:hover{background:var(--vidro2);border-color:rgba(240,169,138,.38)} .dg-chip:active{scale:.96}
#dgPilula{display:flex;align-items:center;gap:6px;padding:6px 6px 6px 16px;border-radius:26px;border:1px solid rgba(255,255,255,.11);background:linear-gradient(rgba(255,255,255,.07),rgba(255,255,255,.02)),var(--vidro);box-shadow:0 18px 44px -16px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.08)}
#dgPilula:focus-within{border-color:rgba(240,169,138,.4)}
#dgPainel.pensando #dgPilula{animation:dgborda 1.8s linear infinite}
@keyframes dgborda{0%,100%{border-color:rgba(217,119,87,.7)}50%{border-color:rgba(190,150,255,.6)}}
#dgQ{flex:1;min-width:0;border:0;outline:0;background:transparent;resize:none;height:22px;max-height:110px;font:400 15px/1.45 var(--corpo);padding:8px 0;scrollbar-width:none;user-select:text;-webkit-user-select:text}
#dgQ::-webkit-scrollbar{display:none}
#dgQ::placeholder{color:var(--faint)}
#dgEnvia{flex:none;width:38px;height:38px;border-radius:50%;border:0;background:var(--coral);color:#fff;cursor:pointer;display:grid;place-items:center;transition:scale .2s var(--mola),opacity .2s}
#dgEnvia:active{scale:.92} #dgEnvia svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
`);

const raiz = document.createElement('div'); raiz.id = 'dg';
raiz.innerHTML = '<div id="dgBanco"></div><canvas width="384" height="384"></canvas><button id="dgHit" class="alvo" type="button" aria-label="Falar com o Dengas (arraste pra mover)"></button>';
const falaEl = document.createElement('div'); falaEl.id = 'dgFala'; falaEl.className = 'alvo'; falaEl.setAttribute('aria-live', 'polite');
const painel = document.createElement('div'); painel.id = 'dgPainel'; painel.className = 'alvo';
painel.innerHTML = '<div id="dgMsgs" aria-live="polite"></div><div id="dgChips"></div><div id="dgPilula"><textarea id="dgQ" rows="1" spellcheck="false" autocomplete="off" placeholder="Pede ou pergunta pro Dengas…" aria-label="Mensagem pro Dengas"></textarea><button id="dgEnvia" type="button" aria-label="Enviar"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div>';
Mesa.camada.parentNode.append(raiz, falaEl, painel);
const tela = raiz.querySelector('canvas'), g = tela.getContext('2d'), hit = raiz.querySelector('#dgHit');
const msgsEl = painel.querySelector('#dgMsgs'), chipsEl = painel.querySelector('#dgChips'), qEl = painel.querySelector('#dgQ');

/* ---------- onde ele está: (x, y) é o ponto dos pés ---------- */
const salvo = Mesa.le('mesa-dengas', {});
const D = { x:salvo.x ?? null, y:null, vy:0, modo:'caindo', em:null, lado:1, alvoX:null, pose:'pe', pego:null, aberto:false, pensando:false, falandoAte:0, mouse:{ x:0, y:0, at:0 }, passeioEm:performance.now() + rnd(9000, 16000) };
const chao = () => area().h - 24;   // ele pisa em cima do banquinho fundido na beira de baixo
// superfícies onde ele pode ficar: a beira de baixo e o topo de cada widget (com espaço pra ele em cima)
function superficies(){
  const l = [{ id:null, y:chao(), x0:44, x1:area().w - 44 }];
  for (const w of Mesa.abertos()) if (w.y > 128 && w.w > 110) l.push({ id:w.id, y:w.y, x0:w.x + 34, x1:w.x + w.w - 34 });
  return l;
}
function superficieAbaixo(x, y){ let m = null; for (const s of superficies()) if (x >= s.x0 - 20 && x <= s.x1 + 20 && s.y >= y - 6 && (!m || s.y < m.y)) m = s; return m || superficies()[0]; }
function guardaLugar(){ Mesa.grava('mesa-dengas', { x:Math.round(D.x) }); }

/* ---------- animação ---------- */
let clipes = [], atual = null, chave = '', extraEm = performance.now() + 6000;
const clip = (a, o = {}) => ({ a, t0:0, ...o });
function zonaOlhar(now){ if (now - D.mouse.at > 2600) return ''; const dx = D.mouse.x - D.x, dy = D.mouse.y - (D.y - 70); if (Math.hypot(dx, dy) < 130) return ''; if (dy < 0 && -dy > Math.abs(dx) * 1.2) return 'cima'; return dx < 0 ? 'esq' : 'dir'; }
function proximos(now){
  const fala = now < D.falandoAte;
  if (D.modo === 'andando') return [clip('correndo_lado')];
  if (D.pego || D.modo === 'caindo') return [clip('parado')];
  if (D.pose === 'sentado'){
    if (fala) return [clip('sentado_falando')];
    if (D.pensando) return [clip('sentado_pensando')];
    if (now > extraEm){ extraEm = now + rnd(7000, 15000); const a = sorteia(['balancando', 'bolinha', 'comendo', 'balancando']); return [clip(a), clip(a)]; }
    return [clip('observando')];
  }
  if (fala) return [clip('falando')];
  if (D.pensando) return [clip('pensando')];
  const z = zonaOlhar(now);
  if (z) return [clip('t_olha_' + z), clip('olhando_' + z, { laco:() => zonaOlhar(performance.now()) === z && !D.pego && D.modo === 'parado' }), clip('t_olha_' + z, { rev:true })];
  if (now > extraEm){ extraEm = now + rnd(8000, 16000); return [clip(sorteia(['espreguicando', 'cocando', 'curioso', 'gracinha', 'brincando', 'acenando']))]; }
  return [clip('parado')];
}
function toca(lista){ clipes = lista; atual = null; }
function senta(sim){
  if ((D.pose === 'sentado') === sim) return;
  D.pose = sim ? 'sentado' : 'pe'; raiz.classList.toggle('sentado', sim);
  toca([clip(sim ? 't_parado_sentado' : 't_sentado_parado')]); chave = '';
}
function desenha(now){
  const k = D.modo + D.pose + (D.pensando ? 't' : '') + (now < D.falandoAte ? 'f' : '') + (D.pego ? 'd' : '');
  if (k !== chave){ if (chave && ![atual, clipes[0]].some(q => q && /^t_(parado_sentado|sentado_parado|quatro_patas)$/.test(q.a))) { clipes = []; atual = null; } chave = k; }
  let m = atual && AT.anims[atual.a], c = m ? Math.floor((now - atual.t0) * m.fps / 1000) : 0;
  if (!m || c >= m.n){
    if (m && atual.laco && atual.laco()) atual.t0 = now;
    else { if (!clipes.length) clipes = proximos(now); atual = clipes.shift(); atual.t0 = now; m = AT.anims[atual.a] || AT.anims.parado; }
    c = 0;
  }
  if (atual.rev) c = m.n - 1 - c;
  g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 384, 384);
  if (!atlas.naturalWidth) return;
  if (/_lado$|^t_quatro_patas$/.test(atual.a) && D.lado < 0){ g.translate(384, 0); g.scale(-1, 1); }
  g.drawImage(atlas, c * CEL, m.l * CEL, CEL, CEL, 0, 0, 384, 384);
}

/* ---------- vida: cair, andar, sentar, passear ---------- */
let ultimo = 0;
function vai(x, depois){ D.alvoX = clamp(x, 44, area().w - 44); D.depois = depois || null; }
function passo(now){
  const dt = ultimo ? Math.min(.05, (now - ultimo) / 1000) : .016; ultimo = now;
  const A = area();
  if (D.x == null){ D.x = A.w - 150; D.y = -20; }
  if (!D.pego){
    // em cima de um widget: anda junto com ele; se o widget some ou sai de baixo, ele cai
    if (D.em){ const w = Mesa.caixa(D.em); if (!w || w.y < 100 || D.x < w.x + 10 || D.x > w.x + w.w - 10){ D.em = null; D.modo = 'caindo'; D.vy = 0; } else { if (D.emX != null) D.x += w.x - D.emX; D.emX = w.x; D.y = w.y; } }
    else if (D.modo !== 'caindo' && Math.abs(D.y - chao()) > 1){ D.modo = 'caindo'; D.vy = 0; }
    if (D.modo === 'caindo'){
      if (D.pose === 'sentado'){ D.pose = 'pe'; raiz.classList.remove('sentado'); }
      const s = superficieAbaixo(D.x, D.y);
      D.vy = Math.min(1500, D.vy + 2600 * dt); D.y += D.vy * dt;
      if (D.y >= s.y){ D.y = s.y; D.vy = 0; D.em = s.id; D.emX = s.id ? Mesa.caixa(s.id)?.x : null; D.modo = 'parado'; D.sentaEm = now + (s.id ? rnd(5000, 12000) : 900); guardaLugar(); if (!reduzido) toca([clip('comemorando')]); }
    } else if (D.alvoX != null && !D.aberto){
      if (D.pose === 'sentado'){ senta(false); D.levantaAte = now + 520; }
      if (now > (D.levantaAte || 0)){
        const s = D.em ? superficies().find(q => q.id === D.em) : superficies()[0], lim = s || { x0:44, x1:A.w - 44 };
        const alvo = clamp(D.alvoX, lim.x0, lim.x1), d = alvo - D.x;
        if (Math.abs(d) < 3){ D.alvoX = null; D.modo = 'parado'; toca([clip('t_quatro_patas', { rev:true })]); D.sentaEm = now + rnd(1200, 5000); guardaLugar(); const f = D.depois; D.depois = null; f?.(); }
        else if (D.modo !== 'andando' && !D.desceu){ D.desceu = true; D.lado = Math.sign(d); toca([clip('t_quatro_patas')]); D.levantaAte = now + 460; }
        else { D.desceu = false; D.modo = 'andando'; D.lado = Math.sign(d); D.x += D.lado * Math.min(Math.abs(d), 150 * dt); }
      }
    } else {
      if (D.modo === 'andando') D.modo = 'parado';
      if (D.pose === 'pe' && !D.aberto && !D.pensando && now > (D.sentaEm || Infinity) && now > D.falandoAte){ senta(true); D.sentaEm = null; }
      if (!D.aberto && !D.pensando && now > D.passeioEm && now - D.mouse.at > 4000){
        D.passeioEm = now + rnd(16000, 38000);
        const s = D.em ? superficies().find(q => q.id === D.em) : superficies()[0];
        if (s) vai(rnd(s.x0, s.x1));
      }
    }
  }
  D.x = clamp(D.x, 30, A.w - 30);
  raiz.style.transform = `translate3d(${D.x.toFixed(1)}px,${D.y.toFixed(1)}px,0)`;
  raiz.classList.toggle('no-chao', !D.em && Math.abs(D.y - chao()) < 1 && D.modo !== 'andando');
  desenha(now); if (D.aberto) poePainel(); if (falaEl.classList.contains('viva')) poeFala();
  Mesa.quadro(passo);
}
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
atlas.onload = () => Mesa.quadro(passo);
if (atlas.complete && atlas.naturalWidth) Mesa.quadro(passo);
bus.on('mesa:mouse', p => { if (Math.abs(p.x - D.mouse.x) + Math.abs(p.y - D.mouse.y) > 3){ D.mouse.x = p.x; D.mouse.y = p.y; D.mouse.at = performance.now(); } });

/* pegar e soltar: vira arrasto depois de 4 px; soltou, ele cai até a superfície de baixo */
let gesto = null;
hit.addEventListener('pointerdown', e => { if (e.button !== 0) return; gesto = { id:e.pointerId, x0:e.clientX, y0:e.clientY, on:false }; });
hit.addEventListener('pointermove', e => {
  if (!gesto || e.pointerId !== gesto.id) return;
  if (e.buttons === 0) return larga();
  if (!gesto.on){ if (Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0) < 4) return; gesto.on = true; try { hit.setPointerCapture(gesto.id); } catch {} D.pego = { dx:D.x - gesto.x0, dy:D.y - gesto.y0 }; D.em = null; D.alvoX = null; raiz.classList.add('pego'); fecha(); if (D.pose === 'sentado'){ D.pose = 'pe'; raiz.classList.remove('sentado'); } }
  D.x = e.clientX + D.pego.dx; D.y = Math.min(chao(), e.clientY + D.pego.dy);
});
function larga(){
  if (!gesto) return; const era = gesto.on; gesto = null;
  if (!era){ D.aberto ? fecha() : abre(); return; }
  D.pego = null; raiz.classList.remove('pego'); D.modo = 'caindo'; D.vy = 0; D.passeioEm = performance.now() + rnd(20000, 40000);
}
hit.addEventListener('pointerup', larga); hit.addEventListener('pointercancel', larga);
hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); D.aberto ? fecha() : abre(); } });

/* ---------- balão ---------- */
let tFala = 0, tLetra = 0;
function poeFala(){ const A = area(), w = falaEl.offsetWidth, h = falaEl.offsetHeight, topo = D.y - (D.pose === 'sentado' ? 104 : 124); falaEl.style.transform = `translate3d(${clamp(D.x - w / 2, 8, A.w - w - 8)}px,${Math.max(8, topo - h - 12)}px,0)`; }
function fala(texto){
  texto = String(texto || '').trim().slice(0, 220); if (!texto) return;
  clearTimeout(tFala); clearInterval(tLetra); let n = 0; falaEl.textContent = ''; falaEl.classList.add('viva'); poeFala();
  tLetra = setInterval(() => { n = Math.min(texto.length, n + 1); falaEl.textContent = texto.slice(0, n); D.falandoAte = performance.now() + 250; if (n >= texto.length){ clearInterval(tLetra); tFala = setTimeout(() => falaEl.classList.remove('viva'), clamp(texto.length * 70, 3200, 12000)); } }, 30);
}
falaEl.addEventListener('click', () => { falaEl.classList.remove('viva'); abre(); });
bus.on('mesa:aviso', a => fala(a.texto));
// reações dele ao que acontece na mesa (sem gastar o Claude)
let ultimaReacao = 0;
const reage = t => { const n = performance.now(); if (D.aberto || n - ultimaReacao < 25000) return; ultimaReacao = n; fala(t); };
bus.on('musica:mudou', m => reage('♪ ' + (m.musica || 'música nova') + (m.artista ? ', ' + m.artista : '') + '. Boa!'));
bus.on('mesa:abriu', e => { if (performance.now() > 6000) { const d = Mesa.defs().find(q => q.id === e.id); if (d && !D.em) vai((Mesa.caixa(e.id)?.x || 0) + 60); } });

/* ---------- conversa ---------- */
function poePainel(){
  const A = area(), w = painel.offsetWidth, h = painel.offsetHeight, alto = D.pose === 'sentado' ? 100 : 122;
  const dir = D.x < A.w / 2, cima = D.y - alto - h - 10 >= 8 || D.y > A.h / 2;
  painel.classList.toggle('desce', !cima);
  const x = clamp(dir ? D.x + 52 : D.x - 52 - w, 12, A.w - w - 12);
  const y = cima ? clamp(D.y - h - 6, 8, A.h - h - 6) : clamp(D.y - alto + 24, 8, A.h - h - 8);
  painel.style.transformOrigin = `${dir ? 0 : 100}% ${cima ? 100 : 0}%`;
  painel.style.transform = `translate3d(${x}px,${y}px,0)`;
}
function pintaChips(){
  chipsEl.replaceChildren();
  const l = [];
  for (const d of Mesa.defs()) if (!Mesa.aberto(d.id) && l.length < 3) l.push(['Abrir ' + d.nome, () => { Mesa.abre(d.id); pintaChips(); }]);
  l.push(['Organiza a mesa', () => pergunta('Organiza os widgets abertos de um jeito bom pra esta tela, sem sobrepor.')]);
  if (Mesa.aberto('musica')) l.push(['O que tá tocando?', () => pergunta('O que tá tocando?')]);
  for (const [t, fn] of l.slice(0, 5)){ const b = document.createElement('button'); b.type = 'button'; b.className = 'dg-chip'; b.textContent = t; b.addEventListener('click', fn); chipsEl.appendChild(b); }
}
function abre(){ if (D.aberto) return; D.aberto = true; D.alvoX = null; falaEl.classList.remove('viva'); pintaChips(); painel.classList.add('aberto'); poePainel(); setTimeout(() => qEl.focus(), 60); }
function fecha(){ if (!D.aberto) return; D.aberto = false; painel.classList.remove('aberto'); qEl.blur(); D.sentaEm = performance.now() + 2500; }
document.addEventListener('pointerdown', e => { if (D.aberto && !e.target.closest('#dgPainel,#dgHit') && !ctl) fecha(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && D.aberto){ if (ctl) ctl.abort(); else fecha(); } });
bus.on('mesa:atalho', () => { abre(); });
qEl.addEventListener('input', () => { qEl.style.height = '22px'; qEl.style.height = Math.min(110, qEl.scrollHeight - 16) + 'px'; });
qEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); pergunta(qEl.value); } });
painel.querySelector('#dgEnvia').addEventListener('click', () => { if (ctl) ctl.abort(); else pergunta(qEl.value); });
function msg(cls, texto){ const el = document.createElement('div'); el.className = 'dg-msg ' + cls; el.textContent = texto; msgsEl.appendChild(el); while (msgsEl.children.length > 24) msgsEl.firstChild.remove(); msgsEl.scrollTop = msgsEl.scrollHeight; return el; }

const mem = Object.assign({ notas:'', usos:[] }, Mesa.le('mesa-dengas-mem', {}));
const guardaMem = () => Mesa.grava('mesa-dengas-mem', mem);
function regras(){
  const e = Mesa.estado(), agora = new Date();
  return [
    'Você é o Dengas, um rato de estimação gordinho, preto em cima, branco no meio e preto embaixo, de cachecol coral. Você mora na Mesa: o quadro que cobre a área de trabalho do seu dono, onde ficam os widgets dele. Você é carinhoso e é o assistente esperto da casa.',
    'Fale sempre em português do Brasil, informal, curto e com graça de bichinho inteligente e guloso (no máximo umas 4 linhas), em texto simples: sem títulos, sem tabelas, sem negrito. Nunca diga que é uma IA; você é o Dengas.',
    'Você enxerga e mexe em tudo que está na Mesa. Pra agir, use as ferramentas: mesa_widget abre, fecha, move e redimensiona; cada widget aberto oferece os próprios comandos (o nome começa com o id do widget). Depois confirme em uma frase curta. Não invente que fez algo que nenhuma ferramenta fez.',
    'A Mesa é uma casca e cada widget é uma peça solta: você pode tirar, pôr, mover, criar um widget novo na hora (widget_criar), misturar widgets (um widget seu que chama os comandos dos outros com mesa.pedir), guardar e abrir visões (mesa_visao) e abrir ou fechar os apps hospedados (mesa_app). Quando o dono pedir algo que nenhum widget faz, crie um. Ids de widget disponíveis: ' + Mesa.defs().map(d => d.id).join(', ') + '.',
    'Quando o dono contar um gosto ou hábito que vale lembrar, guarde com a ferramenta lembrar.',
    `Agora: ${agora.toLocaleString('pt-BR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}.`,
    'A Mesa agora (posições em px, origem no canto de cima à esquerda): ' + JSON.stringify(e).slice(0, 3500),
    mem.notas ? 'O que você já sabe do seu dono: ' + mem.notas : '',
    mem.usos.length ? 'Pedidos recentes dele: ' + mem.usos.slice(-8).join(' | ') : '',
  ].filter(Boolean).join('\n');
}
function ferramentas(atos){
  const nota = t => atos.push(t);
  const ids = Mesa.defs().map(d => d.id);
  const l = [
    { name:'mesa_estado', description:'Lê a Mesa inteira agora: tamanho da tela, widgets abertos (posição, tamanho, borda encostada e o estado de cada um) e os widgets disponíveis que estão fechados.',
      execute:() => Mesa.estado() },
    { name:'mesa_widget', description:'Mexe num widget da Mesa. acao: abrir, fechar, mover (x, y em px e/ou borda), redimensionar (w, h em px), frente. borda encosta o widget: l, r, t, b, tl, tr, bl, br ou centro.',
      inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['abrir','fechar','mover','redimensionar','frente'] }, id:{ type:'string' }, x:{ type:'number' }, y:{ type:'number' }, w:{ type:'number' }, h:{ type:'number' }, borda:{ type:'string', enum:['l','r','t','b','tl','tr','bl','br','centro'] } }, required:['acao','id'] },
      execute({ acao, id, x, y, w, h, borda }){
        if (acao === 'fechar'){ if (!Mesa.fecha(id)) throw new Error('já estava fechado'); nota('× ' + id); return 'fechado'; }
        if (acao === 'abrir'){ Mesa.abre(id); if (x != null || y != null || w != null || h != null || borda) Mesa.move(id, { x, y, w, h, borda }); nota('↗ ' + id); visita(id); return Mesa.abertos().find(q => q.id === id); }
        if (acao === 'frente'){ Mesa.frente(id); return 'na frente'; }
        const r = Mesa.move(id, { x, y, w, h, borda }); Mesa.toca(id); nota((acao === 'mover' ? '⇄ ' : '⤢ ') + id); return r;
      } },
    { name:'mesa_aparencia', description:'Muda a cara da Mesa. destaque: cor de destaque em #rrggbb; vidro: opacidade dos widgets de 0.35 a 1; raio: arredondamento dos widgets em px (0 a 34); papel: 2 ou 3 cores #rrggbb do papel de parede (de dentro pra fora); fundo: "mesa" cobre a área de trabalho com o papel de parede, "transparente" deixa ver o Windows.',
      inputSchema:{ type:'object', properties:{ destaque:{ type:'string' }, vidro:{ type:'number' }, raio:{ type:'number' }, papel:{ type:'array', items:{ type:'string' } }, fundo:{ type:'string', enum:['mesa','transparente'] } } },
      execute({ fundo:f, ...resto }){ const a = Mesa.aparencia(resto); if (f) Mesa.fundo(f); nota('✦ aparência'); return { ...a, fundo:Mesa.estado().fundo }; } },
    { name:'widget_criar', description:'Cria na hora um widget novo na Mesa (ou troca um que você criou, usando o mesmo id). html: um documento pequeno e completo do miolo do widget (pode ter <style> e <script>), fundo transparente, texto claro, sem rede e sem bibliotecas externas. Dentro dele existe o objeto mesa: mesa.registrar({ estado:()=>({...}), comandos:[{ nome, descricao, esquema, roda(args){...} }] }) expõe o widget pra você; mesa.estado() devolve a Mesa inteira (Promise); mesa.pedir("<id>_<comando>", args) chama o comando de outro widget ou app (ex.: "notas_escrever", "onda_controlar") e é assim que se fazem misturas; mesa.ouvir(tipo, fn) ouve eventos (ex.: "relogio:fim", "mesa:abriu"); mesa.avisar(texto) faz você falar; mesa.salvar(v) e mesa.ler() guardam dados. Variáveis de cor prontas: --coral, --pessego, --muted, --line.',
      inputSchema:{ type:'object', properties:{ id:{ type:'string' }, nome:{ type:'string' }, descricao:{ type:'string' }, html:{ type:'string' }, w:{ type:'number' }, h:{ type:'number' } }, required:['id','nome','html'] },
      execute(e){ const r = Mesa.criaSolto(e); nota('✦ criei ' + r.nome); return r; } },
    { name:'widget_fonte', description:'Devolve o html de um widget que você criou, pra você mexer nele e recriar com widget_criar.',
      inputSchema:{ type:'object', properties:{ id:{ type:'string' } }, required:['id'] },
      execute({ id }){ const f = Mesa.fonteSolto(String(id)); if (!f) throw new Error('não existe widget criado com esse id'); return f; } },
    { name:'widget_remover', description:'Apaga de vez um widget que você criou (pra só fechar, use mesa_widget com acao fechar).',
      inputSchema:{ type:'object', properties:{ id:{ type:'string' } }, required:['id'] },
      execute({ id }){ Mesa.removeSolto(String(id)); nota('× apaguei ' + id); return 'apagado'; } },
    { name:'mesa_visao', description:'Visões são arranjos da Mesa com nome (quais widgets e apps estão abertos, onde, e a aparência). acao: salvar (guarda a mesa de agora), abrir, apagar, listar.',
      inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['salvar','abrir','apagar','listar'] }, nome:{ type:'string' } }, required:['acao'] },
      execute({ acao, nome }){ const r = Mesa.visao(String(acao), nome); if (acao !== 'listar') nota('▣ ' + acao + ' ' + (nome || '')); return r; } },
    { name:'mesa_app', description:'Abre ou fecha um app original hospedado na Mesa (os ids estão em "apps" e nos disponíveis do estado; ex.: onda, orbita).',
      inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['abrir','fechar'] }, id:{ type:'string' } }, required:['acao','id'] },
      execute({ acao, id }){ if (!Mesa.hospedes().some(h => h.id === id)) throw new Error('apps disponíveis: ' + Mesa.hospedes().map(h => h.id).join(', ')); acao === 'fechar' ? Mesa.fechaHospede(id) : Mesa.abreHospede(id); nota((acao === 'fechar' ? '× ' : '↗ ') + id); return 'feito'; } },
    { name:'lembrar', description:'Guarda uma frase curta sobre o dono (gosto, hábito, preferência) pra lembrar nas próximas conversas.',
      inputSchema:{ type:'object', properties:{ nota:{ type:'string' } }, required:['nota'] },
      execute({ nota:n }){ n = String(n || '').trim().slice(0, 160); if (!n) throw new Error('nota vazia'); mem.notas = ((mem.notas ? mem.notas + ' ' : '') + n).slice(-900); guardaMem(); nota('✎ anotado'); return 'guardado'; } },
  ];
  // os comandos de cada widget aberto viram ferramentas, sem código a mais
  for (const c of Mesa.comandos()) l.push({ name:(c.widget + '_' + c.nome).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 60), description:`[${c.nomeWidget}] ${c.descricao}`, inputSchema:c.esquema,
    async execute(entrada, ctx){ visita(c.widget); Mesa.toca(c.widget); const r = await c.roda(entrada || {}, ctx); nota('• ' + c.nomeWidget + ': ' + c.nome); return r === undefined ? 'feito' : r; } });
  if (Mesa.podePC()) l.push(
    { name:'abrir_site', description:'Abre no navegador do PC um endereço https completo, ou um atalho de app (spotify:, steam:, discord:, ms-settings:).',
      inputSchema:{ type:'object', properties:{ alvo:{ type:'string' } }, required:['alvo'] },
      async execute({ alvo }){ const t = String(alvo || '').trim(); if (!/^https:\/\/[^\s'"<>]+$/i.test(t) && !/^(spotify|steam|discord|ms-settings):[^\s'"<>]*$/i.test(t)) throw new Error('só abro endereços https e os atalhos spotify:, steam:, discord: e ms-settings:'); await Mesa.ps("Start-Process -FilePath '" + t.replace(/'/g, "''") + "'"); nota('↗ ' + t.slice(0, 40)); return 'aberto'; } });
  return l;
}
// vai até o widget em que está mexendo (se estiver no chão, para embaixo dele)
function visita(id){ const w = Mesa.caixa(id); if (w && !D.em && !D.pego) { D.aberto ? null : vai(w.x + w.w / 2); } }
const ERRO = { not_granted:'Você não liberou o Claude pra mim. Dá pra liberar em Permissões.', sampling_disabled:'O Claude não está disponível nessa conta.', rate_limited:'Cansei um pouquinho… tenta de novo daqui a pouco.', session_expired:'Sua sessão do Claude caiu. Entra de novo e me chama.', refused:'Disso eu prefiro não falar.', empty_completion:'Me deu um branco. Pergunta de outro jeito?' };
let ctl = null, turnos = [], comFerramentas = true;
async function pergunta(texto){
  texto = String(texto || '').trim(); if (!texto || ctl) return;
  abre(); qEl.value = ''; qEl.style.height = '22px';
  const sample = Mesa.sample();
  msg('eu', texto);
  if (!sample){ msg('erro', 'Aqui eu ainda não tenho o Claude: abra a Mesa pelo app do Claude.'); return; }
  turnos.push({ role:'user', content:texto }); while (turnos.length > 14) turnos.splice(0, 2);
  const ele = msg('ele pensa', 'Pensando…'), atos = [];
  const c = ctl = new AbortController(); D.pensando = true; painel.classList.add('pensando');
  const mostra = t => { D.pensando = false; D.falandoAte = performance.now() + 500; ele.classList.remove('pensa'); ele.textContent = t.replace(/\*\*(.+?)\*\*/g, '$1');
    if (atos.length){ const box = document.createElement('div'); box.className = 'dg-atos'; for (const a of atos){ const s = document.createElement('span'); s.className = 'dg-ato'; s.textContent = a; box.appendChild(s); } ele.appendChild(box); } msgsEl.scrollTop = msgsEl.scrollHeight; };
  const opts = { model:MODELO, modelTier:'quick', cache:false, signal:c.signal, onText:({ text }) => mostra(text) };
  if (comFerramentas) opts.tools = ferramentas(atos);
  try {
    // a primeira pergunta abre a janelinha de liberar o Claude: a Mesa segura os cliques até você responder
    const perms = await window.claude?.use?.('permissions')?.catch?.(() => null);
    if (perms && await perms.state('sample').catch(() => 'granted') === 'prompt'){
      ele.textContent = 'Aprova o Claude na janelinha que abriu…';
      const p = await Mesa.dialogo(() => perms.request(['sample']));
      if (p?.sample !== 'granted') throw { code:'not_granted' };
      ele.textContent = 'Pensando…';
    }
    const r = await Mesa.dialogo(() => sample([{ role:'user', content:regras() }, ...turnos], opts));
    mostra(r.text); turnos.push({ role:'assistant', content:r.text });
    mem.usos.push(texto.slice(0, 80)); while (mem.usos.length > 24) mem.usos.shift(); guardaMem();
  } catch (e) {
    if (e?.code === 'tools_unavailable' && comFerramentas){ comFerramentas = false; ctl = null; turnos.pop(); ele.remove(); msgsEl.lastChild?.remove(); D.pensando = false; painel.classList.remove('pensando'); return pergunta(texto); }
    if (e?.text) { mostra(e.text); turnos.push({ role:'assistant', content:e.text }); } else { ele.remove(); turnos.pop(); }
    if (e?.code !== 'cancelled') msg('erro', ERRO[e?.code] || 'Deu um problema na conexão com o Claude. Tenta de novo.');
  } finally { if (ctl === c){ ctl = null; D.pensando = false; painel.classList.remove('pensando'); } }
}

Mesa.icone = tam => {
  const c = document.createElement('canvas'); c.width = c.height = tam; const q = c.getContext('2d'), k = tam / 256; q.imageSmoothingEnabled = false;
  q.fillStyle = '#1f232b'; q.beginPath(); q.arc(128 * k, 128 * k, 124 * k, 0, Math.PI * 2); q.fill();
  q.strokeStyle = '#d97757'; q.lineWidth = 10 * k; q.beginPath(); q.arc(128 * k, 128 * k, 118 * k, 0, Math.PI * 2); q.stroke();
  if (atlas.naturalWidth) q.drawImage(atlas, 24, 18, 48, 48, 20 * k, 22 * k, 216 * k, 216 * k);
  return c.toDataURL('image/png');
};
Mesa.dengas = { fala, pergunta, abre, fecha, vai, estado:() => ({ x:Math.round(D.x), y:Math.round(D.y), modo:D.modo, pose:D.pose, em:D.em, aberto:D.aberto }) };
bus.on('mesa:pronta', () => setTimeout(() => fala(sorteia(['Cheguei! Clica em mim pra gente conversar.', 'Oi! Tô por aqui, é só chamar.', 'Mesa pronta. O que vamos fazer?'])), 1400));
}
