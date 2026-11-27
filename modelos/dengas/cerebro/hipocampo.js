/* HIPOCAMPO — memória do agora: a sessão do Claude Code que continua (o córtex usa --resume) e as últimas trocas,
   curtinhas, em ~/.orbita/dengas/cerebro/agora.json. Serve ao cerebelo (o que consolidar) e, quando a sessão
   precisa começar do zero, dá ao Claude o fio do que estava rolando. */
const HIPO = { trocas:[], carregado:false, t:0 };
const ARQ_AGORA = '~/.orbita/dengas/cerebro/agora.json';
async function hipoCarregar(){ if (HIPO.carregado) return; HIPO.carregado = true; try { const d = JSON.parse(await FSd().readFile(ARQ_AGORA, 'utf8')); HIPO.trocas = Array.isArray(d.trocas) ? d.trocas : []; } catch {} }
function hipoRegistrar(pedido, resposta, amig){
  HIPO.trocas.push({ t:Date.now(), eu:String(pedido).slice(0, 600), ele:String(resposta).slice(0, 900), tom:amig?.tom, assuntos:amig?.assuntos, consolidada:false });
  while (HIPO.trocas.length > 40) HIPO.trocas.shift();
  hipoSalvar();
}
function hipoSalvar(){ clearTimeout(HIPO.t); HIPO.t = setTimeout(async () => { try { await FSd().mkdir('~/.orbita/dengas/cerebro', { recursive:true }); await FSd().writeFile(ARQ_AGORA, JSON.stringify({ trocas:HIPO.trocas }), 'utf8'); } catch {} }, 600); }
const hipoPendentes = () => HIPO.trocas.filter(x => !x.consolidada);
// o fio da meada pra quando a sessão do Claude começa do zero
const hipoFio = () => { const l = HIPO.trocas.slice(-4); return l.length ? '[o que rolou por último: ' + l.map(x => 'dono: ' + x.eu.slice(0, 140) + ' / você: ' + x.ele.slice(0, 140)).join(' || ') + ']' : ''; };
