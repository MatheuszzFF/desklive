/* Peças ao vivo: carrega widgets de ~/.orbita/pecas/*.js com o Board aberto, sem montar nem publicar de novo.
   Código dessa pasta roda com o MESMO acesso do Board (o PC inteiro). Por isso:
   - vem DESLIGADO; liga no menu do Board;
   - cada arquivo novo ou alterado só roda depois de um clique de verdade no cartão (a trava é o conteúdo, não o nome);
   - o assistente vê a situação e manda procurar de novo, mas não tem como ligar nem aprovar. */
{
const PASTA = '~/.orbita/pecas', fs = () => Mesa.host()?.fs;
const cfg = Object.assign({ ligado:false, ok:{} }, Mesa.le('mesa-vivo', {})), salva = () => Mesa.grava('mesa-vivo', cfg);
const VISTAS = new Map();   // nome → { hash, situacao, ids }
const recusadas = new Set(); let ocupado = false, cartao = null;
const diz = texto => Mesa.bus.emit('mesa:aviso', { texto });
const dl = (n, m, d) => window.Board?.diario?.('vivo', n, m, d);
const resumo = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');

Mesa.estilo(`
.vv{position:absolute;left:50%;top:16px;transform:translateX(-50%);width:min(380px,calc(100% - 24px));box-sizing:border-box;padding:16px;border-radius:18px;background:var(--vidro2);box-shadow:0 14px 40px rgba(0,0,0,.45);z-index:6000;font-size:13px}
.vv b{display:block;font-size:15px;margin-bottom:4px}.vv p{margin:0 0 12px;color:var(--muted);line-height:1.4;overflow-wrap:anywhere}
.vv div{display:flex;gap:8px;justify-content:flex-end}.vv button{border:0;border-radius:10px;padding:8px 14px;cursor:pointer;background:rgba(255,255,255,.08);transition:transform .35s var(--mola),filter .16s}
.vv button:hover{filter:brightness(1.2)}.vv button:active{transform:scale(.94)}.vv button.pri{background:var(--coral);color:#fff}`);

function pergunta(nome, hash, tam, mudou){
  return new Promise(res => {
    const el = cartao = document.createElement('div'); el.className = 'vv alvo mesa-v';
    el.innerHTML = '<b></b><p></p><div><button type="button">Agora não</button><button type="button" class="pri">Ligar peça</button></div>';
    el.querySelector('b').textContent = (mudou ? 'Peça alterada: ' : 'Peça nova: ') + nome;
    el.querySelector('p').textContent = `${PASTA}/${nome}.js (${Math.ceil(tam / 1024)} KB, marca ${hash.slice(0, 8)}). Ela vai rodar com acesso total ao seu PC: ligue só se você pediu essa peça.`;
    const [nao, sim] = el.querySelectorAll('button');
    const fim = v => { el.remove(); cartao = null; res(v); };
    nao.addEventListener('click', e => { if (e.isTrusted) fim(false); }); sim.addEventListener('click', e => { if (e.isTrusted) fim(true); });
    el.fecha = () => fim(null);
    Mesa.camada.appendChild(el);
  });
}
// tenta como função; se a página não deixar (CSP), como um <script> comum
function executa(codigo, nome){
  const corpo = '{\n' + codigo + '\n}\n//# sourceURL=peca-' + nome + '.js';
  let faz; try { faz = new Function(corpo); } catch (e) { if (!(e instanceof EvalError)) throw e; }
  if (faz){ faz(); return; }
  const k = '__vivo_' + Date.now(), s = document.createElement('script'); let erro = null;
  const ouve = e => { erro = e.error || new Error(e.message); }; addEventListener('error', ouve);
  s.textContent = corpo + '\nwindow.' + k + ' = true;'; document.head.appendChild(s); s.remove(); removeEventListener('error', ouve);
  const rodou = window[k]; delete window[k]; if (!rodou) throw erro || new Error('o app não deixa carregar código com o Board aberto');
}
async function carrega(nome, codigo, hash){
  const antes = VISTAS.get(nome), abertos = [];
  for (const id of antes?.ids || []){ if (Mesa.aberto(id)) abertos.push(id); window.Board.remover(id); }
  if (antes?.ids?.length) await new Promise(r => setTimeout(r, 700));
  const tinha = new Set(Mesa.defs().map(d => d.id)), registra = window.Board.registrar, ids = [];
  window.Board.registrar = d => { if (d?.id) ids.push(d.id); return registra(d); };
  try { executa(codigo, nome); VISTAS.set(nome, { hash, situacao:'ligada', ids }); }
  catch (e) { VISTAS.set(nome, { hash, situacao:'erro: ' + String(e?.message || e).slice(0, 200), ids }); dl('erro', nome, { erro:String(e?.stack || e).slice(0, 400) }); diz('A peça ' + nome + ' deu erro: ' + String(e?.message || e).slice(0, 120)); return; }
  finally { window.Board.registrar = registra; }
  dl('info', 'ligou ' + nome, { ids });
  // abre o que é novo ou estava aberto; no boot, o Board repõe cada peça no lugar salvo
  const novos = ids.filter(id => !tinha.has(id));
  for (const id of new Set([...abertos, ...(antes ? [] : novos)])) try { Mesa.abre(id); } catch {}
}
async function procura(deNovo){
  if (deNovo) recusadas.clear();
  if (!cfg.ligado || ocupado || !Mesa.podePC() || !fs()) return;
  ocupado = true;
  try {
    if (!await fs().exists(PASTA)) await fs().mkdir(PASTA, { recursive:true });
    const arquivos = (await fs().readdir(PASTA)).map(x => String(x?.name ?? x)).filter(n => /^[a-z0-9-]+\.js$/.test(n)).sort();
    for (const a of arquivos){
      const nome = a.slice(0, -3), codigo = await fs().readFile(PASTA + '/' + a, 'utf8'), hash = await resumo(codigo);
      if (VISTAS.get(nome)?.hash === hash || recusadas.has(hash)) continue;
      if (cfg.ok[nome] !== hash){
        const sim = await pergunta(nome, hash, codigo.length, !!cfg.ok[nome]);
        if (!cfg.ligado) return;
        if (!sim){ recusadas.add(hash); continue; }
        cfg.ok[nome] = hash; salva();
      }
      await carrega(nome, codigo, hash);   // roda exatamente o texto que foi aprovado
    }
  } catch (e) { dl('erro', 'procurar', { erro:String(e?.message || e).slice(0, 200) }); }
  finally { ocupado = false; }
}
const situacao = () => ({ ligado:cfg.ligado, pasta:PASTA, pecas:[...VISTAS].map(([nome, v]) => ({ nome, situacao:v.situacao, widgets:v.ids })), esperando_o_clique:cartao?.querySelector('b')?.textContent || null });

if (Mesa.principal){
  setInterval(() => procura(), 3000);
  window.Board.menu(() => [{ label:'Peças ao vivo: ' + (cfg.ligado ? 'ligado ✓' : 'desligado'), click:() => { cfg.ligado = !cfg.ligado; salva(); recusadas.clear(); if (!cfg.ligado) cartao?.fecha(); else { diz('Peças ao vivo ligado. Cada peça nova pede o seu clique.'); procura(); } } }]);
  Mesa.app({ id:'vivo', nome:'Peças ao vivo', estado:situacao, comandos:[
    { nome:'procurar', descricao:'Procura peças novas ou alteradas em ~/.orbita/pecas agora (inclusive as que o dono recusou antes) e devolve a situação. Não aprova nada: quem liga é o dono, no menu do Board e no cartão.', roda:async () => { await procura(true); return situacao(); } },
  ] });
}
}
