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
const D = { x:salvo.x ?? null, y:salvo.y ?? null, vy:0, dir:'e', alvo:null, modo:'parado', em:null, lado:1, alvoX:null, pose:'pe', pego:null, aberto:false, pensando:false, falandoAte:0, mouse:{ x:0, y:0, at:0 }, passeioEm:performance.now() + rnd(9000, 16000) };
const chao = () => area().h - 24;   // ele pisa em cima do banquinho fundido na beira de baixo
// superfícies onde ele pode ficar: a beira de baixo e o topo de cada widget (com espaço pra ele em cima)
function superficies(){
  const l = [{ id:null, y:chao(), x0:44, x1:area().w - 44 }];
  for (const w of Mesa.abertos()) if (w.y > 128 && w.w > 110) l.push({ id:w.id, y:w.y, x0:w.x + 34, x1:w.x + w.w - 34 });
  return l;
}
function superficieAbaixo(x, y){ let m = null; for (const s of superficies()) if (x >= s.x0 - 20 && x <= s.x1 + 20 && s.y >= y - 6 && (!m || s.y < m.y)) m = s; return m || superficies()[0]; }
function guardaLugar(){ Mesa.grava('mesa-dengas', { x:Math.round(D.x), y:Math.round(D.y) }); }

/* ---------- animação ---------- */
let clipes = [], atual = null, chave = '', extraEm = performance.now() + 6000;
const clip = (a, o = {}) => ({ a, t0:0, ...o });
function zonaOlhar(now){ if (now - D.mouse.at > 2600) return ''; const dx = D.mouse.x - D.x, dy = D.mouse.y - (D.y - 70); if (Math.hypot(dx, dy) < 130) return ''; if (dy < 0 && -dy > Math.abs(dx) * 1.2) return 'cima'; return dx < 0 ? 'esq' : 'dir'; }
function proximos(now){
  const fala = now < D.falandoAte;
  if (D.modo === 'andando') return [clip(nomeCorre())];
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
  if (k !== chave){ if (chave && ![atual, clipes[0]].some(q => q && /^t_(parado_sentado|sentado_parado|quatro_\w+)$/.test(q.a))) { clipes = []; atual = null; } chave = k; }
  let m = atual && AT.anims[atual.a], c = m ? Math.floor((now - atual.t0) * m.fps / 1000) : 0;
  if (!m || c >= m.n){
    if (m && atual.laco && atual.laco()) atual.t0 = now;
    else { if (!clipes.length) clipes = proximos(now); atual = clipes.shift(); atual.t0 = now; m = AT.anims[atual.a] || AT.anims.parado; }
    c = 0;
  }
  if (atual.rev) c = m.n - 1 - c;
  g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 384, 384);
  if (!atlas.naturalWidth) return;
  if (/^correndo_|_lado$|^t_quatro_/.test(atual.a) && D.lado < 0){ g.translate(384, 0); g.scale(-1, 1); }
  g.drawImage(atlas, c * CEL, m.l * CEL, CEL, CEL, 0, 0, 384, 384);
}

/* ---------- vida: cair, andar, sentar, passear ---------- */
let ultimo = 0;
// anda livre pela mesa, em 8 direções: desce pra quatro patas, corre até o ponto e levanta
const CLIPE_DIR = { e:['lado', 1], w:['lado', -1], se:['se', 1], sw:['se', -1], s:['s', 1], n:['n', 1], ne:['ne', 1], nw:['ne', -1] };
const dirDe = (dx, dy) => ['w', 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'][Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 4];
const nomeCorre = () => 'correndo_' + CLIPE_DIR[D.dir][0];
const nomeDesce = () => CLIPE_DIR[D.dir][0] === 'lado' ? 't_quatro_patas' : 't_quatro_' + CLIPE_DIR[D.dir][0];
function vai(x, y, depois){ const A = area(); if (typeof y === 'function'){ depois = y; y = null; } D.alvo = { x:clamp(x, 44, A.w - 44), y:clamp(y ?? D.y ?? chao(), 130, chao()) }; D.depois = depois || null; }
function passo(now){
  const dt = ultimo ? Math.min(.05, (now - ultimo) / 1000) : .016; ultimo = now;
  const A = area();
  if (D.x == null){ D.x = A.w - 150; D.y = chao(); }
  if (D.y == null) D.y = chao();
  if (!D.pego){
    if (D.alvo && !D.aberto){
      if (D.pose === 'sentado'){ senta(false); D.levantaAte = now + 520; }
      if (now > (D.levantaAte || 0)){
        const dx = D.alvo.x - D.x, dy = D.alvo.y - D.y, d = Math.hypot(dx, dy);
        if (d < 4){ D.alvo = null; D.modo = 'parado'; D.desceu = false; toca([clip(nomeDesce(), { rev:true })]); D.sentaEm = now + rnd(2500, 7000); guardaLugar(); const f = D.depois; D.depois = null; f?.(); }
        else if (D.modo !== 'andando' && !D.desceu){ D.desceu = true; D.dir = dirDe(dx, dy); D.lado = CLIPE_DIR[D.dir][1]; toca([clip(nomeDesce())]); D.levantaAte = now + 460; }
        else {
          D.modo = 'andando';
          const nd = dirDe(dx, dy); if (nd !== D.dir && d > 24){ D.dir = nd; D.lado = CLIPE_DIR[nd][1]; clipes = []; atual = null; }   // perto do fim não troca mais de direção
          const p = Math.min(d, 150 * dt); D.x += dx / d * p; D.y += dy / d * p;
        }
      }
    } else {
      if (D.modo === 'andando') D.modo = 'parado';
      if (D.pose === 'pe' && !D.aberto && !D.pensando && now > (D.sentaEm || Infinity) && now > D.falandoAte){ senta(true); D.sentaEm = null; }
      if (!D.aberto && !D.pensando && now > D.passeioEm && now - D.mouse.at > 4000){ D.passeioEm = now + rnd(16000, 38000); vai(rnd(60, A.w - 60), rnd(170, chao())); }
    }
  }
  D.x = clamp(D.x, 30, A.w - 30); D.y = clamp(D.y, 110, chao());
  raiz.style.transform = `translate3d(${D.x.toFixed(1)}px,${D.y.toFixed(1)}px,0)`;
  raiz.classList.toggle('no-chao', Math.abs(D.y - chao()) < 1 && D.modo !== 'andando');
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
  D.x = e.clientX + D.pego.dx; D.y = clamp(e.clientY + D.pego.dy, 110, chao());
});
function larga(){
  if (!gesto) return; const era = gesto.on; gesto = null;
  if (!era){ D.aberto ? fecha() : abre(); return; }
  D.pego = null; raiz.classList.remove('pego'); D.modo = 'parado'; D.alvo = null; guardaLugar(); D.sentaEm = performance.now() + 2500; D.passeioEm = performance.now() + rnd(20000, 40000);
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
bus.on('mesa:abriu', e => { if (performance.now() > 6000) { const d = Mesa.defs().find(q => q.id === e.id); const c = Mesa.caixa(e.id); if (d && c) vai(c.x + 60, c.y); } });

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
    'Como escrever o html de um widget (widget_criar): fundo transparente, texto claro, sem rede e sem bibliotecas externas. Dentro dele existe o objeto mesa: mesa.registrar({ estado:()=>({...}), comandos:[{ nome, descricao, esquema, roda(args){...} }] }) expõe o widget pra você; mesa.estado() devolve a Mesa inteira (Promise); mesa.pedir("<id>_<comando>", args) chama o comando de outro widget ou app (ex.: "notas_escrever", "onda_controlar"), e é assim que se fazem misturas; mesa.ouvir(tipo, fn) ouve eventos (ex.: "relogio:fim"); mesa.avisar(texto) faz você falar; mesa.salvar(v) e mesa.ler() guardam dados. Cores prontas em CSS: --coral, --pessego, --muted, --line.',
    'A Mesa não tem cara de Windows: nenhum widget tem barra de título, barra de rolagem, nem botões de janela. Nunca desenhe cabeçalho com o nome do widget, botão de fechar ou barra dentro do seu html: o X flutuante e o redimensionar pelas bordas são da casca.',
    'Design de widget (siga sempre): comece pelo que o widget mostra de mais importante e dê a ele o maior peso (uma coisa grande, o resto pequeno); uma cor de destaque só (--coral / --pessego), o resto em branco e cinzas (--muted, --faint); nada de caixas dentro de caixas, bordas grossas, sombras fortes, emojis como ícone, nem texto centralizado em tudo; espaçamentos de 8, 12 e 16 px; números com font-variant-numeric: tabular-nums; ícones em SVG de traço (classe ic, viewBox 0 0 24 24); estados de hover e de pressionar em todo botão, com a curva var(--mola); o widget tem de funcionar pequeno e grande (use flex e a classe cresce, e @container quando precisar). Use o kit que já vem pronto, em vez de inventar estilo: .pad (miolo com respiro), .titulo, .num (número grande), .sub, .rotulo, .linha, .cresce, .rola, .bot, .bot.pri, .bot.redondo, .campo, .chip, .chapa, .barra > i, .entra. Estrutura típica: <div class="pad"><div class="rotulo">…</div><div class="num">…</div><div class="sub">…</div><div class="linha">botões</div></div>. Todo widget registra estado e pelo menos um comando com mesa.registrar.',
    'Você TEM internet: a ferramenta internet pesquisa na web, acha imagens e lê páginas. Use sempre que o dono perguntar algo que você não sabe ou que muda com o tempo, e pra achar imagem sozinho (nunca peça link pro dono: busque com internet imagens e aplique com mesa_aparencia; se a primeira falhar, tente a seguinte). Só diga que fez depois que a ferramenta devolver que deu certo.',
    'O que um widget solto NÃO consegue: acessar a internet, tocar vídeo de site, ler arquivos ou mexer no PC. Pra isso existem as suas ferramentas, widgets de fábrica e apps: vídeo do YouTube e qualquer site dentro da Mesa é o widget video (comandos tocar, abrir_site e fechar_janela); música é a Onda; abrir programas é a Órbita; imagem de fundo é mesa_aparencia com imagem. Nunca diga que não dá sem antes conferir esses.',
    'Se o widget que você precisa está fechado, abra com mesa_widget (a resposta traz os comandos dele) e, no MESMO pedido, use widget_comando pra fazer o que foi pedido. Nunca peça pro dono clicar ou digitar algo que um comando faz.',
    'Quando o dono contar um gosto ou hábito que vale lembrar, guarde com a ferramenta lembrar.',
    `Agora: ${agora.toLocaleString('pt-BR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}.`,
    'A Mesa agora (posições em px, origem no canto de cima à esquerda): ' + JSON.stringify(e).slice(0, 3500),
    mem.notas ? 'O que você já sabe do seu dono: ' + mem.notas : '',
    mem.usos.length ? 'Pedidos recentes dele: ' + mem.usos.slice(-8).join(' | ') : '',
  ].filter(Boolean).join('\n');
}
// internet do Dengas: a página não tem rede, então a busca sai pelo PowerShell do PC. O texto vai em base64 (nada
// do que o Claude escreve vira código) e só entra endereço https.
function psInternet(acao, texto){
  const b = btoa(unescape(encodeURIComponent(String(texto))));
  const base = String.raw`$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; [Console]::OutputEncoding=[Text.Encoding]::UTF8
$q=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('B64')); $ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
function Pega($u){ $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -UserAgent $ua -Uri $u -Headers @{'Accept-Language'='pt-BR,pt;q=0.9'}; [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) }
function Limpa($t){ ([Net.WebUtility]::HtmlDecode(($t -replace '<[^>]+>',' ')) -replace '\s+',' ').Trim() }
`.replace('B64', b);
  if (acao === 'imagens') return base + String.raw`$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -UserAgent 'MesaWidget/0.8' -Uri ('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=2560&gsrsearch=' + [uri]::EscapeDataString($q + ' filetype:bitmap'))
$j=[Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json; if($j.query){ $j.query.pages.PSObject.Properties | % { $_.Value } | Sort-Object index | ? { $_.imageinfo[0].width -ge 1600 -and $_.imageinfo[0].width -ge $_.imageinfo[0].height } | Select-Object -First 6 | % { ([string]$_.imageinfo[0].width) + 'x' + $_.imageinfo[0].height + ' | ' + (($_.imageinfo[0].thumburl) -replace '\?.*$','') + ' | ' + ($_.title -replace '^File:','') } }`;
  if (acao === 'ler') return base + String.raw`$h=Pega $q; $t=[regex]::Match($h,'(?is)<title[^>]*>(.*?)</title>').Groups[1].Value
$h=$h -replace '(?is)<(script|style|noscript|svg|head)\b.*?</\1>',' '; $x=Limpa $h; (Limpa $t); $x.Substring(0,[Math]::Min(5000,$x.Length))`;
  return base + String.raw`$h=Pega ('https://html.duckduckgo.com/html/?kl=br-pt&q=' + [uri]::EscapeDataString($q)); $n=0
foreach($m in [regex]::Matches($h,'(?s)class="result__a" href="([^"]+)"[^>]*>(.*?)</a>.*?class="result__snippet"[^>]*>(.*?)</a>')){ $u=[Net.WebUtility]::HtmlDecode($m.Groups[1].Value); $d=[regex]::Match($u,'uddg=([^&]+)'); if($d.Success){ $u=[uri]::UnescapeDataString($d.Groups[1].Value) }; if($u -notmatch '^https://'){ continue }; (Limpa $m.Groups[2].Value) + ' | ' + $u + ' | ' + (Limpa $m.Groups[3].Value); $n++; if($n -ge 6){ break } }`;
}
function ferramentas(atos){
  const nota = t => atos.push(t);
  const ids = Mesa.defs().map(d => d.id);
  const l = [
    { name:'mesa_estado', description:'Lê a Mesa inteira agora: tamanho da tela, widgets abertos (posição, tamanho, borda encostada e o estado de cada um) e os widgets disponíveis que estão fechados.',
      execute:() => Mesa.estado() },
    { name:'mesa_widget', description:'Mexe num widget da Mesa. acao: abrir, fechar, mover (x, y em px e/ou borda), redimensionar (w, h em px), frente. borda encosta o widget: l, r, t, b, tl, tr, bl, br ou centro.',
      inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['abrir','fechar','mover','redimensionar','frente'] }, id:{ type:'string' }, x:{ type:'number' }, y:{ type:'number' }, w:{ type:'number' }, h:{ type:'number' }, borda:{ type:'string', enum:['l','r','t','b','tl','tr','bl','br','centro'] } }, required:['acao','id'] },
      async execute({ acao, id, x, y, w, h, borda }){
        if (acao === 'fechar'){ if (!Mesa.fecha(id)) throw new Error('já estava fechado'); nota('× ' + id); return 'fechado'; }
        if (acao === 'abrir'){ Mesa.abre(id); if (x != null || y != null || w != null || h != null || borda) Mesa.move(id, { x, y, w, h, borda }); nota('↗ ' + id); visita(id); await new Promise(r => setTimeout(r, 700));   // dá tempo do widget registrar os comandos
          return { ...Mesa.abertos().find(q => q.id === id), comandos:Mesa.comandos().filter(q => q.widget === id).map(q => ({ nome:q.nome, o_que_faz:q.descricao, args:q.esquema?.properties ? Object.keys(q.esquema.properties) : [] })), como_usar:'chame widget_comando com widget "' + id + '"' }; }
        if (acao === 'frente'){ Mesa.frente(id); return 'na frente'; }
        const r = Mesa.move(id, { x, y, w, h, borda }); Mesa.toca(id); nota((acao === 'mover' ? '⇄ ' : '⤢ ') + id); return r;
      } },
    { name:'widget_comando', description:'Chama um comando de qualquer widget ou app aberto, inclusive um que você abriu agora há pouco neste mesmo pedido. widget: o id; comando: o nome do comando; args: o objeto de argumentos. Os comandos de cada um estão em mesa_estado (campo comandos) e na resposta de mesa_widget abrir. Ex.: { widget:"video", comando:"tocar", args:{ busca:"show do Linkin Park" } }.',
      inputSchema:{ type:'object', properties:{ widget:{ type:'string' }, comando:{ type:'string' }, args:{ type:'object' } }, required:['widget','comando'] },
      async execute({ widget, comando, args }, ctx){
        const todos = Mesa.comandos(), c = todos.find(q => q.widget === widget && q.nome === comando);
        if (!c) throw new Error('não achei "' + comando + '" em "' + widget + '". Disponíveis: ' + (todos.filter(q => q.widget === widget).map(q => q.nome).join(', ') || 'nenhum (o widget está aberto?)'));
        visita(c.widget); Mesa.toca(c.widget); const r = await c.roda(args && typeof args === 'object' ? args : {}, ctx); nota('• ' + c.nomeWidget + ': ' + c.nome); return r === undefined ? 'feito' : r;
      } },
    { name:'mesa_aparencia', description:'Muda a cara da Mesa. destaque: cor de destaque em #rrggbb; vidro: opacidade dos widgets de 0.35 a 1; raio: arredondamento dos widgets em px (0 a 34); papel: 2 ou 3 cores #rrggbb do papel de parede (de dentro pra fora); imagem: caminho de um arquivo de imagem do PC ou endereço https de uma imagem, que vira o plano de fundo (vazio tira a imagem); fundo: "mesa" cobre a área de trabalho com o papel de parede, "transparente" deixa ver o Windows.',
      inputSchema:{ type:'object', properties:{ destaque:{ type:'string' }, vidro:{ type:'number' }, raio:{ type:'number' }, papel:{ type:'array', items:{ type:'string' } }, imagem:{ type:'string' }, fundo:{ type:'string', enum:['mesa','transparente'] } } },
      async execute({ fundo:f, imagem, ...resto }){ const a = Mesa.aparencia(resto); if (imagem !== undefined) await Mesa.papel(imagem); if (f) Mesa.fundo(f); nota('✦ aparência'); return { ...a, fundo:Mesa.estado().fundo }; } },
    ...(Mesa.podePC() ? [{ name:'internet', description:'Sua internet. acao "pesquisar": busca na web e devolve até 6 resultados (título | endereço | resumo). acao "imagens": acha fotos grandes e livres no Wikimedia Commons e devolve até 6 linhas (tamanho | endereço https | nome); busca curta e em inglês acha mais (ex.: "spiral galaxy", "tokyo night skyline"); pra plano de fundo, passe um dos endereços pra mesa_aparencia em imagem. acao "ler": abre uma página https e devolve o título e o texto dela (até 5 mil letras), pra você responder com informação de verdade. texto: a busca, ou o endereço https no caso de ler.',
      inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['pesquisar','imagens','ler'] }, texto:{ type:'string' } }, required:['acao','texto'] },
      async execute({ acao, texto }){
        const t = String(texto || '').trim().slice(0, 400); if (!t) throw new Error('diga o que buscar');
        if (acao === 'ler' && !/^https:\/\/[^\s'"<>]+$/i.test(t)) throw new Error('pra ler preciso de um endereço https completo');
        const r = String(await Mesa.ps(psInternet(acao, t), 40000) || '').trim(); nota('⌕ ' + t.slice(0, 30));
        if (!r) throw new Error(acao === 'ler' ? 'a página veio vazia' : 'não achei nada pra "' + t + '"');
        return acao === 'ler' ? r.slice(0, 5200) : r.split(/\r?\n/).filter(Boolean).slice(0, 6);
      } }] : []),
    { name:'widget_criar', description:'Cria na hora um widget novo na Mesa, ou troca um que você criou (mesmo id). html: o miolo do widget, um documento pequeno com <style> e <script> se precisar. Devolve o id e o nome. As regras de como escrever o html estão nas instruções.',
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
function visita(id){ const w = Mesa.caixa(id); if (w && !D.pego && !D.aberto) vai(w.x + w.w / 2, w.y); }
const ERRO = { not_granted:'Você não liberou o Claude pra mim. Dá pra liberar em Permissões.', sampling_disabled:'O Claude não está disponível nessa conta.', rate_limited:'Cansei um pouquinho… tenta de novo daqui a pouco.', session_expired:'Sua sessão do Claude caiu. Entra de novo e me chama.', refused:'Disso eu prefiro não falar.', empty_completion:'Me deu um branco. Pergunta de outro jeito?' };
let ctl = null, turnos = [], comFerramentas = true, tetoFerramentas = 16;
const corta = (t, bytes) => { let r = String(t || ''); while (new TextEncoder().encode(r).length > bytes) r = r.slice(0, Math.floor(r.length * .92)); return r; };
// as ferramentas da casca vêm primeiro; se passar do teto da view, os comandos de widget do fim ficam de fora
const DEPOIS = ['widget_fonte', 'widget_remover', 'mesa_visao', 'mesa_app', 'lembrar', 'abrir_site', 'notas_limpar', 'orbita_procurar_app', 'onda_listar'];
function dentroDosLimites(l){ l = [...l.filter(t => !DEPOIS.includes(t.name)), ...l.filter(t => DEPOIS.includes(t.name))]; const nomes = new Set(); return l.filter(t => /^[A-Za-z0-9_-]{1,128}$/.test(t.name) && !nomes.has(t.name) && nomes.add(t.name)).slice(0, tetoFerramentas).map(t => ({ ...t, description:corta(t.description, 1000) })); }
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
  if (comFerramentas){
    const lim = await sample.limits?.().catch(() => null);
    if (lim && !lim.tools) comFerramentas = false; else { if (lim?.tools?.maxCount) tetoFerramentas = lim.tools.maxCount; opts.tools = dentroDosLimites(ferramentas(atos)); }
  }
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
    if (e?.code !== 'cancelled') msg('erro', (ERRO[e?.code] || 'Deu um problema falando com o Claude.') + ' [' + (e?.code || 'sem código') + (e?.message ? ': ' + String(e.message).slice(0, 220) : '') + ']');
    console.warn('mesa: erro do Claude', e);
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
