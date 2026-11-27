/* ---------- cérebro: o Claude Code do dono, com a persona do Dengas ----------
   Mora no bloco do dengas.js (entra por marcador, enxerga msg, ferramentas, regras, pedePermissao, ctl...).
   Quando o PC tem o Claude Code (claude) e o node, a conversa do Dengas vai pra ele em vez do Claude do artefato:
   - um processo só, aberto na primeira pergunta, falando JSON por linha (stream-json); a sessão continua entre
     perguntas e depois de reabrir o Board (--resume com o id guardado);
   - roda na pasta do usuário, então carrega a memória e o CLAUDE.md dele; tem as ferramentas do Claude Code
     (artefato, arquivos, web, agendar...) e, pela ponte (ponte-mcp.mjs), as ferramentas do Dengas no Board;
   - ler, pesquisar e criar artefato vão direto; o resto pede permissão no chat (Pode / Agora não) pela ponte.
   Sem o Claude Code, sem login ou com erro antes de responder, a pergunta segue pelo caminho de antes (sample). */
const PONTE_SRC = /*ARQ:ponte-mcp.mjs*/'';
const CC = { proc:null, buf:'', err:'', sessao:Mesa.le('dengas-cc-sessao', null), claude:null, node:null, casa:null, preparado:null, turno:null, atos:[], servindo:0, desligado:false, motivo:'' };
const FSd = () => window.Board?.FS || Mesa.host()?.fs;
const ccLog = (n, m, d) => window.Board?.diario?.('dengas:cerebro', n, m, d);
// o que o Claude Code pode usar sem perguntar (o resto passa pela permissão no chat)
/*JS:dengas/cerebro/dna.js*/
/*JS:dengas/cerebro/amigdala.js*/
/*JS:dengas/cerebro/rede.js*/
/*JS:dengas/cerebro/hipocampo.js*/
/*JS:dengas/cerebro/cerebelo.js*/
const CC_LIVRES = ['mcp__dengas', 'Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Artifact', 'ArtifactData', 'ArtifactComments', 'Skill', 'ToolSearch', 'TodoWrite'];

async function ccPreparar(){
  if (CC.desligado) return false;
  if (CC.preparado) return CC.preparado;
  return CC.preparado = (async () => {
    try {
      if (!Mesa.podePC() || !Mesa.host()?.childProcess?.spawn || !FSd()?.writeFile) throw new Error('sem acesso total');
      const r = String(await Mesa.ps("$c = (Get-Command claude -ErrorAction SilentlyContinue).Source; $n = (Get-Command node -ErrorAction SilentlyContinue).Source; \"$c|$n|$env:USERPROFILE\"", 15000) || '');
      const [c, n, casa] = r.split('|').map(s => s.trim());
      if (!c || !n || !casa) throw new Error(!c ? 'o Claude Code (claude) não está instalado' : !n ? 'o node não está instalado' : 'sem pasta do usuário');
      Object.assign(CC, { claude:c, node:n, casa });
      const fs = FSd(); await fs.mkdir('~/.orbita/dengas/ponte', { recursive:true });
      await fs.writeFile('~/.orbita/dengas/ponte-mcp.mjs', PONTE_SRC, 'utf8');
      await fs.writeFile('~/.orbita/dengas/mcp.json', JSON.stringify({ mcpServers:{ dengas:{ command:n, args:[casa + '\\.orbita\\dengas\\ponte-mcp.mjs'] } } }), 'utf8');
      ccLog('info', 'pronto', { claude:c, node:n });
      return true;
    } catch (e) { CC.desligado = true; CC.motivo = String(e?.message || e); ccLog('aviso', 'sem Claude Code: ' + CC.motivo); return false; }
  })();
}

const ccPersona = () => dna();   // cerebro/dna.js

function ccLigar(){
  const args = ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
    '--append-system-prompt', ccPersona(), '--mcp-config', CC.casa + '\\.orbita\\dengas\\mcp.json', '--strict-mcp-config',
    '--permission-prompt-tool', 'mcp__dengas__permissao', '--allowedTools', CC_LIVRES.join(',')];
  if (CC.sessao) args.push('--resume', CC.sessao); CC.novaSessao = !CC.sessao;
  const p = Mesa.host().childProcess.spawn(CC.claude, args, { cwd:CC.casa });
  CC.proc = p; CC.buf = ''; CC.err = '';
  ccLog('info', 'ligou', { continua:!!CC.sessao });
  p.stdout.on('data', c => { CC.buf += c; let i; while ((i = CC.buf.indexOf('\n')) >= 0){ const l = CC.buf.slice(0, i).trim(); CC.buf = CC.buf.slice(i + 1); if (l) ccLinha(l); } });
  p.stderr?.on?.('data', c => { CC.err = (CC.err + c).slice(-800); });
  const morreu = c => { if (CC.proc === p) CC.proc = null; ccLog('aviso', 'o Claude Code saiu', { codigo:typeof c === 'number' ? c : String(c?.message || c || ''), erro:CC.err.slice(-300) }); const t = CC.turno; if (t){ CC.turno = null; t.fim({ erro:CC.err.trim().slice(-300) || 'o Claude Code fechou' }); } };
  p.on('exit', morreu); p.on('error', morreu);
  if (!CC.servindo) CC.servindo = setInterval(ccServir, 250);
}

const NOME_ATO = { Artifact:'artefato', WebSearch:'pesquisa', WebFetch:'leu página', Read:'leu arquivo', Glob:'procurou arquivos', Grep:'procurou nos arquivos', Bash:'comando', PowerShell:'PowerShell', Write:'escreveu arquivo', Edit:'mudou arquivo', Skill:'habilidade', Task:'ajudante' };
function ccLinha(l){
  let d; try { d = JSON.parse(l); } catch { return; }
  const t = CC.turno;
  if (d.session_id && d.session_id !== CC.sessao){ CC.sessao = d.session_id; Mesa.grava('dengas-cc-sessao', CC.sessao); }
  if (!t) return;
  if (d.type === 'stream_event'){
    const e = d.event || {};
    if (e.type === 'content_block_start' && e.content_block?.type === 'text' && t.texto && !/\n$/.test(t.texto)) t.texto += '\n\n';
    if (e.type === 'content_block_delta' && e.delta?.type === 'text_delta'){ t.texto += e.delta.text; t.mostra(); }
  } else if (d.type === 'assistant'){
    for (const b of d.message?.content || []) if (b.type === 'tool_use' && !String(b.name).startsWith('mcp__dengas__')){ t.atos.push(NOME_ATO[b.name] || String(b.name).replace(/^mcp__([^_]+)__/, '$1: ')); t.mostra(); }
  } else if (d.type === 'result'){
    CC.turno = null;
    t.fim(d.is_error ? { erro:String(d.result || d.subtype || 'erro') } : { texto:t.texto.trim() || String(d.result || '').trim() });
  }
}

// a ponte pede coisas ao Board por arquivo: a lista de ferramentas, rodar uma, ou a permissão no chat
let servindoAgora = false;
async function ccServir(){
  if (servindoAgora) return; servindoAgora = true;
  try {
    const fs = FSd(), pasta = '~/.orbita/dengas/ponte';
    for (const e of await fs.readdir(pasta).catch(() => [])){
      const nome = typeof e === 'string' ? e : e.name; if (!/^req-.+\.json$/.test(nome)) continue;
      let q; try { q = JSON.parse(await fs.readFile(pasta + '/' + nome, 'utf8')); } catch { continue; }
      try { await fs.rm(pasta + '/' + nome); } catch {}
      ccAtende(q).then(r => fs.writeFile(pasta + '/' + nome.replace(/^req-/, 'res-'), JSON.stringify(r), 'utf8')).catch(() => {});
    }
  } catch {} finally { servindoAgora = false; }
}
function ccPedidoDe(nome, ent){
  const s = v => String(v ?? '').slice(0, 140);
  if (nome === 'Bash' || nome === 'PowerShell') return 'rodar no PC: ' + s(ent.command);
  if (nome === 'Write') return 'escrever o arquivo ' + s(ent.file_path);
  if (nome === 'Edit' || nome === 'NotebookEdit') return 'mudar o arquivo ' + s(ent.file_path || ent.notebook_path);
  const m = /^mcp__([^_]+)__(.+)$/.exec(nome); if (m) return 'usar ' + m[2] + ' (' + m[1] + ')';
  return 'usar ' + nome;
}
async function ccAtende(q){
  try {
    if (q.tipo === 'lista') return { ferramentas:[...ferramentas(CC.turno?.atosM || []), ...FERR_MEMORIA].filter(t => /^[A-Za-z0-9_-]{1,60}$/.test(t.name)).map(t => ({ name:t.name, description:t.description, inputSchema:t.inputSchema })) };
    if (q.tipo === 'permissao'){ const ok = await pedePermissao(ccPedidoDe(String(q.ferramenta || ''), q.entrada || {})); ccLog(ok ? 'info' : 'aviso', (ok ? 'liberou ' : 'negou ') + q.ferramenta); return { ok }; }
    if (q.tipo === 'ferramenta'){
      const t = [...ferramentas(CC.turno?.atosM || []), ...FERR_MEMORIA].find(f => f.name === q.nome); if (!t) return { erro:'não existe a ferramenta ' + q.nome };
      const r = await t.execute(q.args || {}, { signal:ctl?.signal }); CC.turno?.mostra?.();
      return { resultado:typeof r === 'string' ? r.slice(0, 20000) : JSON.stringify(r ?? 'feito').slice(0, 20000) };
    }
    return { erro:'pedido desconhecido' };
  } catch (e) { return { erro:String(e?.message || e).slice(0, 600) }; }
}

const FERR_MEMORIA = [
  { name:'memoria_guardar', description:'Guarda uma memória de longo prazo (um neurônio) num setor: decisoes, sessoes, padroes, incidentes, planos ou conhecimento. texto: uma frase curta em terceira pessoa ("O dono prefere..."). entidades: 2 a 6 palavras-chave (pessoas, apps, projetos, assuntos).',
    inputSchema:{ type:'object', properties:{ setor:{ type:'string', enum:SETORES }, texto:{ type:'string' }, entidades:{ type:'array', items:{ type:'string' } } }, required:['setor', 'texto'] },
    async execute(a){ await redeCarregar(); const id = redeGuardar(a); if (!id) throw new Error('memória curta demais'); CC.turno?.atos.push('guardou na memória'); return { guardado:id, rede:redeResumo() }; } },
  { name:'memoria_buscar', description:'Procura nas memórias de longo prazo do Dengas (todos os setores) as que combinam com a busca.',
    inputSchema:{ type:'object', properties:{ busca:{ type:'string' } }, required:['busca'] },
    async execute({ busca }){ await redeCarregar(); return redeLembrar(busca, [], { max:10, orcamento:3000, reforcar:false }); } },
];
// devolve true se respondeu pelo Claude Code; false pra seguir pelo caminho de antes
async function perguntaCC(texto){
  if (!(await ccPreparar())) return false;
  await Promise.all([redeCarregar(), hipoCarregar()]);
  const amig = amigdala(texto), lemb = redeLembrar(texto, amig.setores);   // amígdala e rede neural antes do Claude
  const ele = msg('ele pensa', 'Pensando…'), c = ctl = new AbortController(); D.pensando = true; painel.classList.add('pensando');
  const t = { texto:'', atos:lemb.length ? ['lembrou ' + lemb.length] : [], atosM:[], mostra(){
    const tudo = [...t.atos, ...t.atosM]; if (!t.texto && !tudo.length) return;
    D.pensando = false; D.falandoAte = performance.now() + 500; ele.classList.remove('pensa'); ele.textContent = t.texto.replace(/\*\*(.+?)\*\*/g, '$1') || '…';
    if (tudo.length){ const box = document.createElement('div'); box.className = 'dg-atos'; for (const a of tudo){ const s = document.createElement('span'); s.className = 'dg-ato'; s.textContent = a; box.appendChild(s); } ele.appendChild(box); }
    msgsEl.scrollTop = msgsEl.scrollHeight; } };
  const r = await new Promise(fim => {
    t.fim = fim; CC.turno = t;
    try { if (!CC.proc) ccLigar(); const ctx = ['[agora: ' + new Date().toLocaleString('pt-BR', { weekday:'long', hour:'2-digit', minute:'2-digit' }) + ']', linhaAmigdala(amig), linhaLembrancas(lemb), CC.novaSessao ? hipoFio() : ''].filter(Boolean).join('\n'); CC.novaSessao = false;
    CC.proc.stdin.write(JSON.stringify({ type:'user', message:{ role:'user', content:ctx + '\n' + texto } }) + '\n'); }
    catch (e) { CC.turno = null; fim({ erro:String(e?.message || e) }); }
    c.signal.addEventListener('abort', () => { if (CC.turno === t){ CC.turno = null; try { CC.proc?.kill(); } catch {} CC.proc = null; fim({ cancelado:true }); } });
    setTimeout(() => { if (CC.turno === t){ CC.turno = null; try { CC.proc?.kill(); } catch {} CC.proc = null; fim({ erro:'demorou demais (5 min)' }); } }, 300000);
  });
  if (ctl === c){ ctl = null; D.pensando = false; painel.classList.remove('pensando'); }
  if (r.cancelado){ if (!t.texto) ele.remove(); return true; }
  if (r.erro){
    ccLog('aviso', 'erro', { erro:r.erro.slice(0, 300) });
    // nada respondido ainda: sem login, sessão velha... cai pro caminho de antes nesta pergunta
    if (!t.texto){
      ele.remove();
      if (/authenticat|login|auth/i.test(r.erro)){ CC.desligado = true; CC.motivo = 'login do Claude Code expirado'; msg('erro', 'Meu Claude Code está sem login. Rode "claude auth login" no PowerShell e me reabra; por enquanto vou do jeito de antes.'); }
      else if (CC.sessao && /session|resume|conversation/i.test(r.erro)){ CC.sessao = null; Mesa.grava('dengas-cc-sessao', null); }
      return false;
    }
    msg('erro', 'Parei no meio: ' + r.erro.slice(0, 200));
    return true;
  }
  t.texto = r.texto || t.texto; t.mostra();
  hipoRegistrar(texto, t.texto, amig); cerebeloAgendar();   // hipocampo agora; o cerebelo consolida quando a conversa parar
  ccLog('info', 'turno', { amigdala:amig, lembrancas:lemb.map(q => q.id) });
  turnos.push({ role:'user', content:texto }, { role:'assistant', content:t.texto }); while (turnos.length > 14) turnos.splice(0, 2);
  mem.usos.push(texto.slice(0, 80)); while (mem.usos.length > 24) mem.usos.shift(); guardaMem();
  return true;
}
Mesa.dengasCerebro = () => ({ claudeCode:!CC.desligado && !!CC.claude, motivo:CC.motivo || undefined, sessao:CC.sessao, ligado:!!CC.proc, rede:redeResumo(), hipocampo:{ trocas:HIPO.trocas.length, pendentes:hipoPendentes().length }, cerebelo:{ rodando:CEREB.rodando, ultimo:CEREB.ultimo || null } });
Mesa.dengasCerebro.amigdala = amigdala; Mesa.dengasCerebro.consolidar = () => cerebeloConsolidar();
