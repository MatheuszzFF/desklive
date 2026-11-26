/* ---------- Mesa (opcional): os widgets e o Dengas da Mesa, rodando em cima do Board ----------
   O Dengas, a Onda, a Órbita e o navegador vêm com o MESMO código da Mesa (modelos/mesa/widgets), sem reescrever.
   Este arquivo é só a ponte: ele dá a esses arquivos o objeto `Mesa` que eles conhecem, feito com o Board.
   - widget da Mesa (Mesa.define)  → uma peça do Board (arrasto, guias, bordas, cantos, passe entre monitores)
   - app hospedado (Mesa.hospeda)  → o app original num iframe, com a "janela de mentira" da Mesa
   - o Dengas (livre, por cima)    → uma camada própria; o que tem a classe .alvo pega o mouse (Board.alvo)
   Ainda não vieram da Mesa: aparência e papel de parede, visões e widgets criados na hora (respondem "ainda não"). */
const MB = Board;
const VERSAO_MESA = 'mesa no board 1';
// com dois Boards (um por monitor), o Dengas e os apps hospedados moram só no principal; os widgets-peça passam entre os dois
const PRINCIPAL = !/monitor 2/.test(document.title);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const le = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch { return d; } };
const grava = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const quadro = fn => { let feito = false; const roda = t => { if (feito) return; feito = true; fn(t || performance.now()); }; requestAnimationFrame(roda); setTimeout(roda, 40); };
const area = () => ({ w:MB.area.w, h:MB.area.h });
const desktop = MB.desktop;
const podePCm = () => !!desktop?.childProcess?.exec && (MB.simulado || MB.perms?.['full-access'] === 'granted');
let sampleFn = null;
Promise.resolve(window.claude?.use?.('sample')).then(s => { sampleFn = s || null; bus.emit('mesa:claude', !!s); }).catch(() => {});

/* barramento da Mesa (dentro da página) */
const ouvintesM = new Map();
const bus = {
  on(tipo, fn){ if (!ouvintesM.has(tipo)) ouvintesM.set(tipo, new Set()); ouvintesM.get(tipo).add(fn); return () => ouvintesM.get(tipo)?.delete(fn); },
  emit(tipo, dado){ for (const fn of [...(ouvintesM.get(tipo) || []), ...(ouvintesM.get('*') || [])]){ try { fn(dado, tipo); } catch (e) { console.warn('mesa: ouvinte de', tipo, e); } } },
};

/* PowerShell: comando solto e ajudante residente (o mesmo protocolo dos helpers: "id comando arg" → "id resultado") */
function encodePs(s){ let bin = ''; for (let i = 0; i < s.length; i++){ const c = s.charCodeAt(i); bin += String.fromCharCode(c & 255, c >> 8); } return btoa(bin); }
async function ps(script, tempo){
  if (!podePCm()) throw new Error('sem permissão pra mexer no PC (abra o Board pelo app instalado e libere o acesso total)');
  const r = await desktop.childProcess.exec('powershell.exe -NoProfile -NonInteractive -EncodedCommand ' + encodePs(script), { timeout:tempo || 15000 });
  return ((r.stdout || '').trim() || (r.stderr || '').trim()).slice(0, 800);
}
function ajudante(codigo){
  let proc = null, n = 0, buf = ''; const pend = new Map();
  function liga(){
    proc = desktop.childProcess.spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodePs(codigo)]); buf = '';
    proc.stdout.on('data', c => { buf += c; let i; while ((i = buf.indexOf('\n')) >= 0){ const l = buf.slice(0, i).replace(/^﻿/, '').trim(); buf = buf.slice(i + 1); const sp = l.indexOf(' '), id = sp < 0 ? l : l.slice(0, sp), r = pend.get(id); if (r){ pend.delete(id); r(sp < 0 ? '' : l.slice(sp + 1)); } } });
    const morreu = () => { proc = null; for (const r of pend.values()) r(null); pend.clear(); };
    proc.on('exit', morreu); proc.on('error', morreu);
  }
  return (cmd, tempo = 8000) => {
    if (!podePCm() || !desktop?.childProcess) return Promise.resolve(null);
    try { if (!proc) liga(); } catch { return Promise.resolve(null); }
    const id = 'r' + (++n);
    return new Promise(res => { pend.set(id, res); Promise.resolve(proc.stdin.write(id + ' ' + cmd + '\n')).catch(() => { pend.delete(id); res(null); }); setTimeout(() => { if (pend.has(id)){ pend.delete(id); res(null); } }, tempo); });
  };
}

/* a camada da Mesa: por cima das peças; só o que tem .alvo (e está visível) pega o mouse */
const estilo = css => { const e = document.createElement('style'); e.textContent = css; document.head.appendChild(e); };
estilo(`
.mesa-v{--fg:#f4f5f8;--muted:rgba(244,245,248,.62);--faint:rgba(244,245,248,.38);--line:rgba(255,255,255,.09);--vidro:rgba(10,11,16,.9);--vidro2:rgba(22,24,33,.92);--coral:#d97757;--pessego:#f0a98a;
  --corpo:"Segoe UI Variable Text","Segoe UI",Inter,system-ui,sans-serif;--titulo:"Segoe UI Variable Display","Segoe UI",system-ui,sans-serif;--mola:cubic-bezier(.2,.9,.25,1.12);font-family:var(--corpo);color:var(--fg)}
#camada-mesa{position:absolute;left:0;top:0;width:100%;height:100%;z-index:6;pointer-events:none}
#camada-mesa .alvo{pointer-events:auto}
.mesa-v textarea,.mesa-v input{user-select:text;-webkit-user-select:text}
.mesa-v button{font:inherit;color:inherit}
.m-bot{border:1px solid var(--line);background:rgba(255,255,255,.05);border-radius:999px;padding:7px 13px;cursor:pointer;font:500 13px/1.2 var(--corpo);color:var(--fg);transition:background .2s,scale .2s var(--mola)}
.m-bot:hover{background:rgba(255,255,255,.11)} .m-bot:active{scale:.96}
.mw{position:relative;overflow:hidden}
.mw>.w-corpo{position:absolute;left:0;top:0;container-type:size;container-name:w;overflow:hidden;box-sizing:border-box;padding-top:12px}
.hosp{position:absolute;border:0;background:transparent;color-scheme:light;z-index:4000;pointer-events:none}
`);
const camadaMesa = document.createElement('div'); camadaMesa.id = 'camada-mesa'; camadaMesa.className = 'mesa-v'; document.body.appendChild(camadaMesa);
const camada = document.createElement('div'); camada.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'; camadaMesa.appendChild(camada);
MB.alvo((x, y) => { const el = document.elementFromPoint(x, y); return !!el && (!!el.closest('#camada-mesa .alvo') || (el.tagName === 'IFRAME' && el.classList.contains('hosp'))); });
const mouseEm = { x:0, y:0 };
addEventListener('pointermove', e => { mouseEm.x = e.clientX; mouseEm.y = e.clientY; bus.emit('mesa:mouse', { x:e.clientX, y:e.clientY }); repassa(e); }, true);

/* segurar o clique enquanto uma janelinha do app do Claude está aberta (permissão, liberar o Claude) */
let trava = 0;
function seguraCliques(ms){ trava = performance.now() + ms; MB.forcarAcordado = true; MB.querAcordar(); setTimeout(() => { if (performance.now() >= trava){ MB.forcarAcordado = false; MB.socorro('leve'); } }, ms + 60); }
async function dialogo(fn){ MB.forcarAcordado = true; MB.querAcordar(); try { return await fn(); } finally { MB.forcarAcordado = false; MB.socorro('leve'); } }

/* ---------- widgets da Mesa como peças do Board ---------- */
const DEFS = new Map(), AGENTES = new Map(), VIVOS = new Map();   // VIVOS: id → { def, inst, W, ctx, el, corpo }
const FORMA_DA_BORDA = { l:'left', r:'right', t:'top', b:'bottom', tl:'c-tl', tr:'c-tr', bl:'c-bl', br:'c-br' };
const CONTROLE = 'button,input,textarea,select,a,iframe,canvas,[contenteditable],[data-fixo]';
function criarWidget(def, ctx){
  const W = Object.assign({ w:def.w || 320, h:def.h || 220 }, le('mesa-w-tam-' + def.id, {}));
  const el = document.createElement('div'); el.className = 'mw mesa-v'; el.dataset.id = def.id;
  const corpo = document.createElement('div'); corpo.className = 'w-corpo'; el.appendChild(corpo);
  const mede = () => { el.style.width = W.w + 'px'; el.style.height = W.h + 'px'; corpo.style.width = W.w + 'px'; corpo.style.height = W.h + 'px'; };
  mede();
  const api = {
    id:def.id, corpo,
    ler:(d = {}) => le('mesa-w-' + def.id, d), salvar:v => grava('mesa-w-' + def.id, v),
    emitir:(tipo, dado) => { bus.emit(def.id + ':' + tipo, dado); MB.anunciar(def.id + ':' + tipo, dado); }, ouvir:(tipo, fn) => bus.on(tipo, fn),
    lugar:() => lugarDe(def.id), podePC:podePCm, ps, ajudante, host:() => desktop,
    avisar:texto => bus.emit('mesa:aviso', { id:def.id, texto }),
  };
  const V = { def, W, ctx, el, corpo, inst:{} };
  try { V.inst = def.monta(corpo, api) || {}; } catch (e) { console.warn('mesa: o widget', def.id, 'falhou ao montar', e); corpo.textContent = 'Este widget não abriu: ' + (e.message || e); }
  V.mede = () => { mede(); try { V.inst.aoTamanho?.(lugarDe(def.id)); } catch {} };
  return {
    el, fundo:def.id === 'video' ? 'transparent' : 'rgba(10,11,16,.92)',
    caixa:() => ({ w:W.w, h:W.h }), tamanho:() => ({ w:W.w, h:W.h }),
    pega:t => !t.closest(CONTROLE),
    furos:P => { const fs = el.querySelectorAll('.furo'); if (!fs.length) return null; const b = P.fo.getBoundingClientRect(), k = P.rv[2] / Math.max(1, b.width) || 1; return [...fs].map(f => { const r = f.getBoundingClientRect(); return { x:(r.left - b.left) * k, y:(r.top - b.top) * k, w:r.width * k, h:r.height * k }; }); },
    automacao:{ ver:() => { try { return V.inst.estado?.(); } catch { return undefined; } }, get comandos(){ return V.inst.comandos || []; }, get regras(){ return AGENTES.get(def.id) || ''; } },
    ativar:() => { VIVOS.set(def.id, V); bus.emit('mesa:abriu', { id:def.id }); },
    destruir:() => { if (VIVOS.get(def.id) === V) VIVOS.delete(def.id); try { V.inst.aoFechar?.(); } catch {} bus.emit('mesa:fechou', { id:def.id }); },
  };
}
function define(def){
  if (!def?.id || typeof def.monta !== 'function') throw new Error('widget sem id ou sem monta()');
  DEFS.set(def.id, def);
  MB.registrar({ id:def.id, nome:def.nome, passavel:true, persistir:true, noMenu:true, oculta:!def.deSaida,
    inicial:{ forma:'livre', pos:a => ({ ax:.5, ay:.5, px:a.w / 2, py:a.h / 2 }) }, criar:ctx => criarWidget(def, ctx) });
}
const pecaVisivel = id => { const P = MB.pecas.get(id); return P && P.visivel && !P.removendo ? P : null; };
function lugarDe(id){ const P = MB.pecas.get(id); if (!P) return null; return { borda:P.forma === 'livre' ? '' : P.forma, x:Math.round(P.alvo[0]), y:Math.round(P.alvo[1]), w:Math.round(P.alvo[2]), h:Math.round(P.alvo[3]) }; }
function abre(id, onde){ if (HDEFS.has(id)) return abreHospede(id); if (!DEFS.has(id)) throw new Error('não existe widget "' + id + '"'); MB.mostrar(id, true); if (onde) move(id, onde); return lugarDe(id); }
function fecha(id){ if (HOSP.has(id)) return fechaHospede(id); const P = pecaVisivel(id); if (!P) return false; MB.removerPeca(P); return true; }
function move(id, o = {}){
  if (HOSP.has(id)){ const H = HOSP.get(id); for (const k of ['x', 'y']) if (o[k] != null) H.r[k] = H.o[k] + +o[k]; if (o.w != null) H.r.width = +o.w; if (o.h != null) H.r.height = +o.h; poeHospede(H); return { x:H.r.x - H.o.x, y:H.r.y - H.o.y, w:H.r.width, h:H.r.height }; }
  const P = pecaVisivel(id); if (!P) throw new Error('o widget "' + id + '" não está aberto');
  const V = VIVOS.get(id);
  if (V && (o.w != null || o.h != null)){ const A = area(); if (o.w != null) V.W.w = clamp(Math.round(+o.w), V.def.minW || 160, A.w); if (o.h != null) V.W.h = clamp(Math.round(+o.h), V.def.minH || 110, A.h); grava('mesa-w-tam-' + id, { w:V.W.w, h:V.W.h }); V.mede(); V.ctx.retamanho(); }
  const b = String(o.borda || '');
  if (b === 'centro'){ const A = area(); MB.mover(id, { x:(A.w - P.alvo[2]) / 2, y:(A.h - P.alvo[3]) / 2 }); }
  else if (FORMA_DA_BORDA[b]) MB.mover(id, { forma:FORMA_DA_BORDA[b], x:o.x, y:o.y });
  else if (o.x != null || o.y != null) MB.mover(id, { x:o.x, y:o.y });
  return lugarDe(id);
}
function abertos(){ const l = []; for (const P of MB.pecas.values()) if (P.visivel && !P.removendo && !P.efemera) l.push({ id:P.id, nome:P.def.nome, ...lugarDe(P.id) }); return l; }
function comandos(){
  const l = [];
  for (const P of MB.pecas.values()){ if (!P.visivel || P.removendo) continue; for (const c of P.inst.automacao?.comandos || []) l.push({ widget:P.id, nomeWidget:P.def.nome, ...c }); }
  for (const H of HOSP.values()) for (const c of H.def.comandos || []) l.push({ widget:H.id, nomeWidget:H.def.nome, ...c });
  return l;
}
function estado(){
  return { tela:area(), fundo:'transparente',
    abertos:[...MB.pecas.values()].filter(P => P.visivel && !P.removendo && !P.efemera).map(P => { let e; try { e = P.inst.automacao?.ver?.(); } catch {} return { id:P.id, nome:P.def.nome, ...lugarDe(P.id), estado:e, comandos:(P.inst.automacao?.comandos || []).map(c => c.nome) }; }),
    apps:[...HOSP.values()].map(H => { let e; try { e = H.def.estado?.(); } catch {} return { id:H.id, nome:H.def.nome, x:Math.round(H.r.x - H.o.x), y:Math.round(H.r.y - H.o.y), w:H.r.width, h:H.r.height, estado:e, comandos:(H.def.comandos || []).map(c => c.nome) }; }),
    fechados:[...DEFS.values()].filter(d => !pecaVisivel(d.id)).map(d => ({ id:d.id, nome:d.nome, o_que_faz:d.descricao || '' })).concat([...HDEFS.values()].filter(d => !HOSP.has(d.id)).map(d => ({ id:d.id, nome:d.nome, o_que_faz:'app' }))),
    criados_pelo_morador:[], visoes:[] };
}

/* ---------- hóspedes: apps do desklive ORIGINAIS num iframe, com a "janela de mentira" (igual à Mesa) ---------- */
const HDEFS = new Map(), HOSP = new Map(), hprefs = le('mesa-hospedes', []);
window.__mesaHosp = {};
const origem = () => ({ x:window.screenX || 0, y:window.screenY || 0 });
function hospeda(def){ if (!PRINCIPAL) return; HDEFS.set(def.id, def); if (hprefs.includes(def.id)) setTimeout(() => abreHospede(def.id), 300); }
function poeHospede(H){
  const A = area(), o = H.o, r = H.r;
  if (r.width <= A.w) r.x = clamp(r.x, o.x, o.x + A.w - r.width); if (r.height <= A.h) r.y = clamp(r.y, o.y, o.y + A.h - r.height);
  Object.assign(H.f.style, { left:(r.x - o.x) + 'px', top:(r.y - o.y) + 'px', width:r.width + 'px', height:r.height + 'px' });
}
const salvaHosp = () => grava('mesa-hospedes', [...HOSP.keys()]);
function abreHospede(id){
  const def = HDEFS.get(id); if (!def || HOSP.has(id)) return HOSP.get(id);
  const f = document.createElement('iframe'); f.className = 'hosp'; f.title = def.nome; f.setAttribute('allowtransparency', 'true');
  const H = { id, def, f, o:origem(), r:{ x:0, y:0, width:def.w || 400, height:def.h || 200 }, ignora:false };
  H.r.x = H.o.x + 40; H.r.y = H.o.y + 40;
  const ok = v => Promise.resolve(v), real = desktop, pc = podePCm() && real;
  const proc = () => ({ stdout:{ on(){} }, stderr:{ on(){} }, stdin:{ write:() => ok() }, on(){}, kill:() => ok() });
  const perms = () => ({ overlay:'granted', 'menu-bar':'granted', shortcuts:'denied', notifications:'denied', 'full-access':pc ? 'granted' : 'denied' });
  window.__mesaHosp[id] = {
    window:{
      setOptions:o => ok({ applied:'now', reloading:false, options:o }), getOptions:() => ok({ options:{}, applied:{} }),
      setBounds:b => { for (const k of ['x', 'y', 'width', 'height']) if (b[k] != null) H.r[k] = b[k]; poeHospede(H); return ok(); },
      getBounds:() => ok({ ...H.r }), show:() => { f.hidden = false; return ok(); }, hide:() => { f.hidden = true; return ok(); }, focus:() => ok(),
      setIgnoreMouseEvents:on => { H.ignora = !!on; f.style.pointerEvents = on ? 'none' : 'auto'; if (!on) MB.querAcordar(); return ok(); },
      setVisibleOnAllWorkspaces:() => ok(),
    },
    screen:{
      getAllDisplays:() => { const A = area(), b = { x:H.o.x, y:H.o.y, width:A.w, height:A.h }; return ok([{ id:1, label:'Board', bounds:b, workArea:{ ...b }, size:{ width:A.w, height:A.h }, scaleFactor:1 }]); },
      getCursorScreenPoint:() => ok({ x:H.o.x + mouseEm.x, y:H.o.y + mouseEm.y }),
    },
    permissions:{ state:() => ok(perms()), request:() => ok(perms()), manage:() => real?.permissions ? dialogo(() => real.permissions.manage()) : ok() },
    Menu:{ popup:m => real?.Menu ? real.Menu.popup(m) : ok(), setApplicationMenu:() => ok() },
    tray:{ set:() => ok(true), remove:() => ok() }, app:{ dock:{ setIcon:() => ok({ written:false }), setBadge:() => ok(true) } },
    globalShortcut:{ register:() => ok(false), unregister:() => ok() },
    fs:pc ? real.fs : { mkdir:() => ok(), readFile:() => Promise.reject(new Error('ENOENT')), writeFile:() => ok(), appendFile:() => ok(), rename:() => ok(), exists:() => ok(false), rm:() => ok(), readdir:() => ok([]) },
    childProcess:pc ? real.childProcess : { spawn:proc, exec:() => ok({ stdout:'', stderr:'' }) },
    os:real?.os || { platform:() => ok('win32'), arch:() => ok('x64') },
  };
  f.srcdoc = '<script>window.claude={use:function(n){return Promise.resolve(n==="desktop"?parent.__mesaHosp[' + JSON.stringify(id) + ']:null)}};<' + '/script>' + def.html;
  HOSP.set(id, H); poeHospede(H); camada.appendChild(f); salvaHosp(); bus.emit('mesa:abriu', { id });
  return H;
}
function fechaHospede(id){ const H = HOSP.get(id); if (!H) return false; H.f.remove(); HOSP.delete(id); delete window.__mesaHosp[id]; salvaHosp(); bus.emit('mesa:fechou', { id }); return true; }
// com o app em "clique passa", o mouse em cima dele chega no Board: a ponte repassa o movimento pra ele decidir se acorda
function repassa(e){
  for (const H of HOSP.values()){
    if (!H.ignora || H.f.hidden) continue;
    const r = H.f.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (x < 0 || y < 0 || x > r.width || y > r.height) continue;
    try { const w = H.f.contentWindow, d = w.document, el = d.elementFromPoint(x, y) || d.documentElement;
      el.dispatchEvent(new w.PointerEvent('pointermove', { bubbles:true, cancelable:true, composed:true, pointerId:1, pointerType:'mouse', isPrimary:true, button:-1, buttons:0, clientX:x, clientY:y, screenX:e.screenX, screenY:e.screenY })); } catch {}
  }
}
addEventListener('resize', () => { for (const H of HOSP.values()){ H.o = origem(); poeHospede(H); H.f.contentWindow?.dispatchEvent(new Event('resize')); } bus.emit('mesa:tela', area()); });

const ainda = o => () => { throw new Error('ainda não veio pro Board: ' + o); };
const Mesa = { versao:VERSAO_MESA, define, abre, fecha, move, toca:() => {}, frente:id => { const P = pecaVisivel(id); if (P) MB.mostrarPeca(P, true); },
  aparencia:() => ({}), papel:ainda('imagem de fundo'), fundo:() => {}, dialogo, seguraCliques, criaSolto:ainda('widget criado na hora'), removeSolto:ainda('widget criado na hora'), fonteSolto:() => null, visao:ainda('visões'),
  hospeda, abreHospede, fechaHospede, hospedes:() => [...HDEFS.values()].map(d => ({ id:d.id, nome:d.nome, aberto:HOSP.has(d.id) })),
  estado, comandos, agente:(id, regras) => { if (regras !== undefined) AGENTES.set(String(id), String(regras)); return AGENTES.get(String(id)) || ''; },
  bus, area, ps, diagnostico:() => {}, diagFonte:() => {},
  defs:() => [...DEFS.values()], abertos, aberto:id => !!pecaVisivel(id) || HOSP.has(id),
  caixa:id => { const P = MB.pecas.get(id); return P && P.visivel ? { x:P.rv[0], y:P.rv[1], w:P.rv[2], h:P.rv[3], pegando:!!P.drag } : null; },
  podePC:podePCm, sample:() => sampleFn, host:() => desktop, camada, le, grava, quadro, menu:() => [], estilo };
window.Mesa = Mesa;

if (PRINCIPAL){
/*JS:mesa/widgets/00-dengas.js*/
}
/*JS:mesa/widgets/30-onda.js*/
/*JS:mesa/widgets/35-video.js*/
/*JS:mesa/widgets/40-orbita.js*/

setTimeout(() => bus.emit('mesa:pronta', { app:!MB.simulado }), 800);
