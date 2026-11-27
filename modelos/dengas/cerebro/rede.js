/* REDE NEURAL — a memória de longo prazo do Dengas, como no cérebro do Jarvis (6 setores, neurônios, sinapses),
   num arquivo só (~/.orbita/dengas/cerebro/rede.json), sem banco e sem vetor:
   - neurônio: uma memória curta num setor (decisoes, sessoes, padroes, incidentes, planos, conhecimento), com as
     entidades dela (palavras-chave: pessoas, apps, assuntos), força e último uso;
   - sinapse: liga neurônios que falam das mesmas entidades; quando dois acendem juntos, a ligação reforça (Hebb);
   - lembrar: as palavras do pedido acendem neurônios, a ativação se espalha um passo pelas sinapses e só os mais
     fortes entram no contexto, dentro de um orçamento (é a ideia da memória sob demanda do Kainzão);
   - esquecer: o que não é usado vai perdendo força com o tempo (meia-vida ~45 dias) e some quando fica fraco. */
const SETORES = ['decisoes', 'sessoes', 'padroes', 'incidentes', 'planos', 'conhecimento'];
const PARE_PT = new Set('para pelo pela pelos pelas como mais muito muita esse essa isso este esta isto aquele aquela aquilo quando onde porque entao então tambem também ainda agora depois antes sobre entre cada todo toda todos todas outro outra outros outras mesmo mesma tudo nada algo alguma algum fazer feito faz pode podem quer queria tenho temos estou está estava ficou fica vamos vai vou foram seria sendo sido tinha dele dela deles delas nosso nossa meus minhas seus suas qual quais quem você voce vocês voces dengas pedido'.split(' '));
const palavrasDe = s => [...new Set(String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !PARE_PT.has(w)))];
const REDE = { n:[], carregada:false, mudou:false, t:0, prox:1 };
const ARQ_REDE = '~/.orbita/dengas/cerebro/rede.json';
const agoraDias = () => Date.now() / 864e5;
const forcaAgora = n => n.f * Math.pow(.5, Math.max(0, agoraDias() - n.u) / 45);
async function redeCarregar(){
  if (REDE.carregada) return; REDE.carregada = true;
  try { const d = JSON.parse(await FSd().readFile(ARQ_REDE, 'utf8')); REDE.n = Array.isArray(d.n) ? d.n : []; REDE.prox = d.prox || (REDE.n.reduce((m, q) => Math.max(m, q.id), 0) + 1); } catch {}
  // esquecer: some o que ficou fraco demais e não está ligado a nada forte
  const antes = REDE.n.length; REDE.n = REDE.n.filter(q => forcaAgora(q) > .08); if (REDE.n.length !== antes){ const vivos = new Set(REDE.n.map(q => q.id)); for (const q of REDE.n) for (const k of Object.keys(q.s)) if (!vivos.has(+k)) delete q.s[k]; redeSalvar(); }
}
function redeSalvar(){ REDE.mudou = true; clearTimeout(REDE.t); REDE.t = setTimeout(async () => { if (!REDE.mudou) return; REDE.mudou = false; try { await FSd().mkdir('~/.orbita/dengas/cerebro', { recursive:true }); await FSd().writeFile(ARQ_REDE, JSON.stringify({ versao:1, prox:REDE.prox, n:REDE.n }), 'utf8'); } catch {} }, 800); }
const porId = id => REDE.n.find(q => q.id === id);
function ligar(a, b, w){ if (a === b) return; a.s[b.id] = Math.min(1, (a.s[b.id] || 0) + w); b.s[a.id] = Math.min(1, (b.s[a.id] || 0) + w); }
// guarda um neurônio (ou reforça um quase igual) e liga aos que dividem entidades
function redeGuardar({ setor, texto, entidades }){
  setor = SETORES.includes(setor) ? setor : 'conhecimento'; texto = String(texto || '').trim().slice(0, 280); if (texto.length < 8) return null;
  const ent = [...new Set([...(entidades || []).map(e => String(e).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()).filter(Boolean), ...palavrasDe(texto)])].slice(0, 24);
  const igual = REDE.n.find(q => { const a = new Set(q.e), comum = ent.filter(x => a.has(x)).length; return comum / Math.max(1, Math.min(a.size, ent.length)) > .75 && q.setor === setor; });
  if (igual){ igual.f = Math.min(3, forcaAgora(igual) + .4); igual.u = agoraDias(); if (texto.length > igual.texto.length * .8) igual.texto = texto; redeSalvar(); return igual.id; }
  const n = { id:REDE.prox++, setor, texto, e:ent, f:1, u:agoraDias(), c:agoraDias(), s:{} };
  const minhas = new Set(ent);
  for (const q of REDE.n){ const comum = q.e.filter(x => minhas.has(x)).length; if (comum >= 2) ligar(n, q, Math.min(.6, .15 * comum)); }
  REDE.n.push(n); if (REDE.n.length > 1500){ REDE.n.sort((a, b) => forcaAgora(b) - forcaAgora(a)); REDE.n.length = 1500; }
  redeSalvar(); return n.id;
}
// acende, espalha, escolhe; reforça o que veio junto
function redeLembrar(texto, setoresFortes, { max = 6, orcamento = 1400, reforcar = true } = {}){
  const ws = palavrasDe(texto); if (!ws.length || !REDE.n.length) return [];
  const fortes = new Set(setoresFortes || []), ativ = new Map();
  for (const q of REDE.n){
    const a = new Set(q.e); let hit = 0; for (const w of ws) if (a.has(w)) hit++;
    if (!hit) continue;
    ativ.set(q.id, hit / Math.sqrt(q.e.length + 2) * (1 + forcaAgora(q)) * (fortes.has(q.setor) ? 1.4 : 1));
  }
  // espalha um passo pelas sinapses (metade da ativação vezes o peso)
  for (const [id, v] of [...ativ]){ const q = porId(id); if (!q) continue; for (const [k, w] of Object.entries(q.s)){ const viz = +k; ativ.set(viz, (ativ.get(viz) || 0) + v * w * .5); } }
  const esc = [...ativ].sort((a, b) => b[1] - a[1]).filter(([, v]) => v > .25);
  const out = []; let usado = 0;
  for (const [id] of esc){ const q = porId(id); if (!q) continue; if (out.length >= max || usado + q.texto.length > orcamento) break; out.push(q); usado += q.texto.length; }
  if (reforcar && out.length){ const d = agoraDias(); for (const q of out){ q.u = d; q.f = Math.min(3, forcaAgora(q) + .08); } for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) ligar(out[i], out[j], .05); redeSalvar(); }
  return out.map(q => ({ id:q.id, setor:q.setor, texto:q.texto }));
}
const linhaLembrancas = l => l.length ? '[lembranças: ' + l.map(q => q.setor + ': ' + q.texto).join(' | ') + ']' : '';
function redeResumo(){ const por = {}; for (const s of SETORES) por[s] = 0; let sin = 0; for (const q of REDE.n){ por[q.setor]++; sin += Object.keys(q.s).length; } return { neuronios:REDE.n.length, sinapses:sin / 2, setores:por }; }
