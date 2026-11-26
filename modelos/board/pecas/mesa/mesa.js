/* ---------- Mesa (opcional): os widgets e o Dengas da Mesa, rodando em cima do Board ----------
   O Dengas, a Onda, a Órbita e o navegador vêm com o MESMO código da Mesa (modelos/mesa/widgets), sem reescrever.
   Este arquivo é só a ponte: ele dá a esses arquivos o objeto `Mesa` que eles conhecem, feito com o Board.
   - widget da Mesa (Mesa.define)  → uma peça do Board (arrasto, guias, bordas, cantos, passe entre monitores)
   - app hospedado (Mesa.hospeda)  → o app original num iframe, com a "janela de mentira" da Mesa
   - o Dengas (livre, por cima)    → uma camada própria; o que tem a classe .alvo pega o mouse (Board.alvo)
   Ainda não vieram da Mesa: visões e widgets criados na hora (respondem "ainda não"). */
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
// acesso total: o estado lido na abertura fica velho (numa versão nova ele vem "prompt" e o host pergunta na chamada); só um "não" tira
const podePCm = () => !!desktop?.childProcess?.exec && MB.perms?.['full-access'] !== 'denied';
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
.mesa-v button,.mesa-v textarea,.mesa-v input{font:inherit;color:inherit}
#fundo-mesa{position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;opacity:0;transition:opacity .5s cubic-bezier(.2,.8,.2,1);pointer-events:none;
  background:radial-gradient(120% 90% at 15% 110%,#3a2a4f,#141a30 46%,#07080d 82%);background-size:cover;background-position:center}
html.fundo-mesa #fundo-mesa{opacity:1;pointer-events:auto}
html.fundo-mesa.fundo-suspenso #fundo-mesa{opacity:0;pointer-events:none}
.m-bot{border:1px solid var(--line);background:rgba(255,255,255,.05);border-radius:999px;padding:7px 13px;cursor:pointer;font:500 13px/1.2 var(--corpo);color:var(--fg);transition:background .2s,scale .2s var(--mola)}
.m-bot:hover{background:rgba(255,255,255,.11)} .m-bot:active{scale:.96}
.mw{position:relative;overflow:hidden}
.mw>.w-corpo{position:absolute;left:0;top:0;container-type:size;container-name:w;overflow:hidden;box-sizing:border-box;padding-top:12px}
.hosp{position:absolute;border:0;background:transparent;color-scheme:light;z-index:4000;pointer-events:none}
`);
/* fundo de mesa: cobre a área de trabalho com o papel de parede (atrás de todas as peças); ligado, ele pega o clique */
const fundoEl = document.createElement('div'); fundoEl.id = 'fundo-mesa'; fundoEl.className = 'alvo-fundo'; document.body.prepend(fundoEl);
const prefs = Object.assign({ fundo:'transparente' }, le('mesa-fundo', {}));
const salvaPrefs = () => grava('mesa-fundo', prefs);
const camadaMesa = document.createElement('div'); camadaMesa.id = 'camada-mesa'; camadaMesa.className = 'mesa-v'; document.body.appendChild(camadaMesa);
const camada = document.createElement('div'); camada.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'; camadaMesa.appendChild(camada);
MB.alvo((x, y) => { const el = document.elementFromPoint(x, y); return !!el && (!!el.closest('#camada-mesa .alvo') || (el === fundoEl && prefs.fundo === 'mesa' && !R.classList.contains('fundo-suspenso')) || (el.tagName === 'IFRAME' && el.classList.contains('hosp'))); });
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
  if (MB.chaves) for (const c of CHAVES_APP.comandos) l.push({ widget:CHAVES_APP.id, nomeWidget:CHAVES_APP.nome, ...c });
  return l;
}
function estado(){
  return { tela:area(), fundo:prefs.fundo,
    abertos:[...MB.pecas.values()].filter(P => P.visivel && !P.removendo && !P.efemera).map(P => { let e; try { e = P.inst.automacao?.ver?.(); } catch {} return { id:P.id, nome:P.def.nome, ...lugarDe(P.id), estado:e, comandos:(P.inst.automacao?.comandos || []).map(c => c.nome) }; }),
    apps:[...HOSP.values()].map(H => { let e; try { e = H.def.estado?.(); } catch {} return { id:H.id, nome:H.def.nome, x:Math.round(H.r.x - H.o.x), y:Math.round(H.r.y - H.o.y), w:H.r.width, h:H.r.height, estado:e, comandos:(H.def.comandos || []).map(c => c.nome) }; })
      .concat(MB.chaves ? [{ id:CHAVES_APP.id, nome:CHAVES_APP.nome, estado:MB.chaves.situacao(), comandos:CHAVES_APP.comandos.map(c => c.nome) }] : []),
    fechados:[...DEFS.values()].filter(d => !pecaVisivel(d.id)).map(d => ({ id:d.id, nome:d.nome, o_que_faz:d.descricao || '' })).concat([...HDEFS.values()].filter(d => !HOSP.has(d.id)).map(d => ({ id:d.id, nome:d.nome, o_que_faz:'app' }))),
    criados_pelo_morador:[], visoes:[] };
}

/* ---------- hóspedes: apps do desklive ORIGINAIS num iframe, com a "janela de mentira" (igual à Mesa) ---------- */
const HDEFS = new Map(), HOSP = new Map(), hprefs = le('mesa-hospedes', []);
window.__mesaHosp = {};
const origem = () => ({ x:window.screenX || 0, y:window.screenY || 0 });
function hospeda(def){ if (!PRINCIPAL) return; HDEFS.set(def.id, def);
  if (def.id === 'onda' && !def.comandos.some(c => c.nome === 'tocar_uri')) def.comandos.push({ nome:'tocar_uri', descricao:'Toca EXATAMENTE uma faixa, álbum, playlist ou artista do Spotify pela uri (spotify:track:…, spotify:album:…). Prefira isto: ache a uri certa com o conector do Spotify (search) e mande tocar aqui, em vez de deixar a Onda adivinhar pela busca.', esquema:{ type:'object', properties:{ uri:{ type:'string' } }, required:['uri'] }, roda:({ uri }) => tocarUri(uri) });
  if (def.id === 'onda' && !def.comandos.some(c => c.nome === 'conectar_spotify')) def.comandos.push({ nome:'conectar_spotify', descricao:'Conecta a Onda ao Spotify da pessoa: abre o login do Spotify no navegador (ela só autoriza, uma vez; depois fica salvo no PC). Use quando a Onda disser que não está conectada, e avise que é só autorizar na página que abriu.', roda:async () => (await spotifyConectado()) ? 'o Spotify já está conectado na Onda' : conectarSpotify() }); if (hprefs.includes(def.id)) setTimeout(async () => { try { await MB.chaves?.ler(); } catch {} abreHospede(def.id); }, 300); }
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
  let html = def.html;
  if (id === 'onda'){ H.cid = clientIdSpotify(); if (H.cid) html = html.replace("const CLIENT_ID = 'SEU_CLIENT_ID';", "const CLIENT_ID = '" + H.cid + "';"); }   // a chave vem das chaves, não do build
  f.srcdoc = '<script>window.claude={use:function(n){return Promise.resolve(n==="desktop"?parent.__mesaHosp[' + JSON.stringify(id) + ']:null)}};<' + '/script>' + html;
  HOSP.set(id, H); poeHospede(H); camada.appendChild(f); salvaHosp(); bus.emit('mesa:abriu', { id });
  return H;
}
/* Spotify da Onda: o login é uma vez só (o token fica em ~/.orbita/spotify-token.json e vale pra qualquer versão).
   Aqui é só o atalho: abre a Onda se precisar e aperta o "Conectar Spotify" dela, que abre o login no navegador. */
const spotifyConectado = async () => { try { return !!(podePCm() && await desktop.fs.exists('~/.orbita/spotify-token.json')); } catch { return false; } };
async function conectarSpotify(){
  if (!HDEFS.has('onda')) throw new Error('a Onda não está neste Board');
  if (!clientIdSpotify()){ await MB.chaves?.abrir(); return 'falta o Client ID do Spotify: abri o arquivo de chaves, com o passo a passo; depois de salvar, peça pra conectar de novo'; }
  const H = abreHospede('onda');
  for (let i = 0; i < 40; i++){ const b = H.f.contentDocument?.getElementById('connect'); if (b){ b.click(); return 'abri o login do Spotify no navegador: é só autorizar lá (uma vez só; depois fica salvo no PC)'; } await new Promise(r => setTimeout(r, 250)); }
  throw new Error('a Onda não abriu a tempo; tente de novo');
}
if (PRINCIPAL) MB.menu(() => HDEFS.has('onda') ? [{ label:'Conectar o Spotify (Onda)…', click:() => conectarSpotify().then(t => bus.emit('mesa:aviso', { texto:'Abri o login do Spotify no navegador. Autoriza lá que eu já consigo tocar.' })).catch(e => bus.emit('mesa:aviso', { texto:String(e.message || e) })) }] : []);

/* tocar uma coisa EXATA do Spotify (faixa, álbum, playlist ou artista) pela uri, no aparelho do PC, com o login da Onda.
   A página não tem rede: vai pelo PowerShell, com o token que a Onda guarda em ~/.orbita/spotify-token.json. */
const PS_TOCAR = String.raw`$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = 'Tls12'; $ProgressPreference = 'SilentlyContinue'
$uri = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('B64'))
try { $t = Get-Content (Join-Path $env:USERPROFILE '.orbita\spotify-token.json') -Raw | ConvertFrom-Json } catch { 'sem_login'; exit }
$h = @{ Authorization = 'Bearer ' + $t.access_token }
$corpo = if ($uri -like 'spotify:track:*') { @{ uris = @($uri) } } else { @{ context_uri = $uri } }
function Toca($q) { Invoke-WebRequest -UseBasicParsing -Method Put -Uri ('https://api.spotify.com/v1/me/player/play' + $q) -Headers $h -ContentType 'application/json' -Body ($corpo | ConvertTo-Json -Compress) -TimeoutSec 20 | Out-Null }
try { Toca ''; 'ok' } catch {
  $st = [int]$_.Exception.Response.StatusCode
  if ($st -eq 401) { '401'; exit }
  if ($st -eq 404) { $d = (Invoke-RestMethod -Uri 'https://api.spotify.com/v1/me/player/devices' -Headers $h -TimeoutSec 20).devices; $dv = @($d | Where-Object { $_.type -eq 'Computer' }) + @($d) | Select-Object -First 1
    if ($dv) { Toca ('?device_id=' + [uri]::EscapeDataString($dv.id)); 'ok' } else { 'sem_aparelho' } }
  else { 'erro ' + $st }
}`;
async function tocarUri(uri){
  uri = String(uri || '').trim();
  if (!/^spotify:(track|album|playlist|artist):[A-Za-z0-9]{10,40}$/.test(uri)) throw new Error('preciso de uma uri do Spotify, ex.: spotify:track:6gc4LhCNFbbs6wQDgafu7b (ache com o conector do Spotify)');
  const roda = () => ps(PS_TOCAR.replace('B64', btoa(uri)), 40000);
  let r = await roda();
  if (r === '401'){ try { await comandos().find(c => c.widget === 'onda' && c.nome === 'listar')?.roda({ o_que:'fila' }); } catch {} r = await roda(); }   // a Onda renova o login quando usa a API
  if (r === 'ok') return 'tocando ' + uri + ' no Spotify do PC';
  if (r === 'sem_login') throw new Error('a Onda não está conectada ao Spotify: use conectar_spotify');
  if (r === 'sem_aparelho') throw new Error('nenhum Spotify aberto no PC: abra o app do Spotify e tente de novo');
  throw new Error('o Spotify recusou (' + r + ')');
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

/* aparência, papel de parede e fundo: os mesmos da Mesa */
const R = document.documentElement, BUS_DIR = '~/.mesa';
function aparencia(o = {}){
  const a = prefs.aparencia = Object.assign({}, prefs.aparencia, o), st = R.style, cor = v => /^#[0-9a-f]{6}$/i.test(String(v || ''));
  if (cor(a.destaque)){ st.setProperty('--coral', a.destaque); st.setProperty('--pessego', `color-mix(in srgb, ${a.destaque} 62%, white)`); }
  if (a.vidro != null){ const v = clamp(+a.vidro || 0, .35, 1); st.setProperty('--vidro', `rgba(10,11,16,${v})`); st.setProperty('--vidro2', `rgba(22,24,33,${Math.min(1, v + .04)})`); }
  if (Array.isArray(a.papel) && a.papel.length >= 2 && a.papel.every(cor)) fundoEl.style.backgroundImage = prefs.papelArquivo ? fundoEl.style.backgroundImage : `radial-gradient(120% 90% at 15% 110%, ${a.papel[0]}, ${a.papel[1]} 46%, ${a.papel[2] || '#07080d'} 82%)`;
  if (a.raio != null) st.setProperty('--raio', clamp(+a.raio || 0, 0, 34) + 'px');
  salvaPrefs(); bus.emit('mesa:aparencia', a); return a;
}
async function papel(origem){
  origem = String(origem || '').trim();
  if (!origem){ delete prefs.papelArquivo; fundoEl.style.backgroundImage = ''; aparencia({}); salvaPrefs(); return 'sem imagem'; }
  if (!podePCm() || !desktop?.fs) throw new Error('imagem de fundo só no app instalado, com o acesso total liberado');
  let caminho = origem;
  if (/^https:\/\//i.test(origem)){
    const ext = (origem.split('?')[0].match(/\.(png|jpe?g|webp|gif)$/i) || [0, 'jpg'])[1].toLowerCase();
    caminho = BUS_DIR + '/papel.' + ext;
    await ps("$d = Join-Path $env:USERPROFILE '.mesa'; New-Item -ItemType Directory -Force $d | Out-Null; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -UserAgent 'MesaWidget/0.8' -Uri '" + origem.replace(/'/g, "''") + "' -OutFile (Join-Path $d 'papel." + ext + "') -TimeoutSec 30; 'ok'", 45000);
  }
  const b64 = await desktop.fs.readFile(caminho, 'base64');
  if (!b64 || b64.length < 200) throw new Error('não consegui ler a imagem');
  const ext = (caminho.match(/\.(png|jpe?g|webp|gif)$/i) || [0, 'jpg'])[1].toLowerCase().replace('jpg', 'jpeg');
  fundoEl.style.backgroundImage = `url(data:image/${ext};base64,${b64})`;
  prefs.papelArquivo = caminho; salvaPrefs(); fundo('mesa'); return 'imagem de fundo aplicada';
}
function fundo(tipo){ prefs.fundo = tipo === 'mesa' ? 'mesa' : 'transparente'; R.classList.toggle('fundo-mesa', prefs.fundo === 'mesa'); salvaPrefs(); if (prefs.fundo === 'mesa') MB.querAcordar(); else MB.socorro('leve'); bus.emit('mesa:fundo', prefs.fundo); }
let furoChave = '';
setInterval(() => {
  const rs = prefs.fundo !== 'mesa' ? [] : [...document.querySelectorAll('#camada-pecas .furo')].map(f => f.getBoundingClientRect()).filter(r => r.width > 4 && r.height > 4);
  const ch = rs.map(r => [r.left, r.top, r.width, r.height].map(Math.round).join(',')).join(';'); if (ch === furoChave) return; furoChave = ch;
  const W = innerWidth, H = innerHeight;
  fundoEl.style.clipPath = rs.length ? `path(evenodd, 'M0 0 H${W} V${H} H0 Z ${rs.map(r => `M${Math.round(r.left)} ${Math.round(r.top)} h${Math.round(r.width)} v${Math.round(r.height)} h${-Math.round(r.width)} Z`).join(' ')}')` : '';
}, 120);
R.classList.toggle('fundo-mesa', prefs.fundo === 'mesa'); if (prefs.aparencia) aparencia({}); if (prefs.papelArquivo && podePCm()) papel(prefs.papelArquivo).catch(() => {});

/* ---------- chaves (Board.chaves): as integrações da Mesa declaram o que precisam ---------- */
MB.chaves?.declarar({ id:'spotify', nome:'Spotify', para:'a Onda escolher e tocar as suas músicas no Spotify',
  como:'1) Entre em https://developer.spotify.com/dashboard e crie um app (Create app). 2) Em Redirect URIs ponha http://127.0.0.1:8977/callback e marque Web API. 3) Copie o Client ID (32 letras e números) e cole em clientId. Não precisa de segredo.',
  campos:[{ chave:'clientId', rotulo:'Client ID', formato:'^[A-Za-z0-9]{32}$' }] });
const clientIdSpotify = () => MB.chaves?.valor('spotify', 'clientId') || null;
// as chaves aparecem pro Dengas como um app: ele vê o que está pronto e o que falta (nunca os valores) e abre o arquivo
const CHAVES_APP = { id:'chaves', nome:'Chaves (credenciais)', comandos:[
  { nome:'situacao', descricao:'Diz quais integrações estão prontas e o que falta em cada uma (sem mostrar valores).', roda:async () => { await MB.chaves.ler(); return MB.chaves.situacao(); } },
  { nome:'abrir', descricao:'Abre o arquivo de chaves no Bloco de Notas pra pessoa preencher (com o passo a passo de cada integração dentro). Use quando faltar uma chave; nunca peça pra colar uma chave na conversa.', roda:() => MB.chaves.abrir() },
] };
AGENTES.set('chaves', 'Você cuida das chaves das integrações. Veja a situação; se faltar algo, abra o arquivo e diga em uma frase o que preencher e onde conseguir. Nunca peça, repita ou mostre o valor de uma chave.');
if (PRINCIPAL){
  MB.ouvir('chaves:faltando', l => { const x = l[0]; bus.emit('mesa:aviso', { texto:'Pra ' + x.para + ' falta ' + (x.faltam.join(' e ') || 'uma chave') + '. Me pede "abre as chaves" que eu abro o arquivo e te mostro o que pôr.' }); });
  MB.ouvir('chaves:editando', on => R.classList.toggle('fundo-suspenso', !!on));
  MB.ouvir('chaves:mudou', () => { const H = HOSP.get('onda'); if (H && H.cid !== clientIdSpotify()){ fechaHospede('onda'); abreHospede('onda'); } });   // a Onda pega o Client ID novo
  MB.menu(() => [{ label:'Chaves das integrações…', click:() => MB.chaves.abrir().catch(e => bus.emit('mesa:aviso', { texto:String(e.message || e) })) }]);
}


const ainda = o => () => { throw new Error('ainda não veio pro Board: ' + o); };
const Mesa = { versao:VERSAO_MESA, define, abre, fecha, move, toca:() => {}, frente:id => { const P = pecaVisivel(id); if (P) MB.mostrarPeca(P, true); },
  aparencia, papel, fundo, dialogo, seguraCliques, criaSolto:ainda('widget criado na hora'), removeSolto:ainda('widget criado na hora'), fonteSolto:() => null, visao:ainda('visões'),
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
