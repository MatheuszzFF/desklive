/* ---------- assistente (opcional) ----------
   Um cérebro pro Board: conversa com o Claude de quem abriu (capacidade "sample" do artefato, sem chave) e usa a API
   aberta do Board como ferramentas. Não tem cara: quem quiser um corpo (um mascote, uma barra, um campo) usa
   Board.assistente. Sem este opcional, o Board não pede o Claude.
     Board.assistente.configurar({ nome, persona, modelo })    quem ele é (o corpo define)
     Board.assistente.perguntar(texto, { onText, signal })   → { text, atos }
     Board.assistente.disponivel()                           → true quando há Claude nesta janela
   Cada peça com automacao ganha um mini agente: o assistente passa o objetivo e o agente da peça faz os passos. */
const A = { nome:'Assistente', persona:'', modelo:'claude-haiku-5-5', turnos:[], teto:16, comFerramentas:true, ctl:null };
const MEM = 'board-assistente-mem';
const lerMem = () => { try { return JSON.parse(localStorage.getItem(MEM)) || { notas:'', usos:[] }; } catch { return { notas:'', usos:[] }; } };
const gravaMem = m => { try { localStorage.setItem(MEM, JSON.stringify(m)); } catch {} };
let sampleFn, sampleProm = null;
const pegaSample = () => sampleProm || (sampleProm = Promise.race([window.claude?.use?.('sample') ?? Promise.resolve(null), new Promise(r => setTimeout(() => r(null), 10000))]).then(s => (sampleFn = s || null)).catch(() => (sampleFn = null)));
pegaSample();
const podePC = () => !!Board.desktop?.childProcess?.exec && Board.perms?.['full-access'] === 'granted';
const b64ps = s => { let bin = ''; for (let i = 0; i < s.length; i++){ const c = s.charCodeAt(i); bin += String.fromCharCode(c & 255, c >> 8); } return btoa(bin); };
async function ps(script, timeout = 40000){ const r = await Board.desktop.childProcess.exec('powershell -NoProfile -NonInteractive -EncodedCommand ' + b64ps(script), { timeout }); return String(r.stdout || '').trim(); }
const corta = (t, bytes) => { let r = String(t || ''); while (new TextEncoder().encode(r).length > bytes) r = r.slice(0, Math.floor(r.length * .92)); return r; };
function dentroDosLimites(l){ const nomes = new Set(); return l.filter(t => /^[A-Za-z0-9_-]{1,128}$/.test(t.name) && !nomes.has(t.name) && nomes.add(t.name)).slice(0, A.teto).map(t => ({ ...t, description:corta(t.description, 1000) })); }
// a página não tem rede: a busca sai pelo PowerShell do PC; o texto vai em base64 e nunca vira código
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

function regras(){
  const m = Board.mapa(), mem = lerMem();
  return [
    A.persona || ('Você é ' + A.nome + ', o assistente do Board, a área de trabalho de quem fala com você. Responda curto, em português do Brasil.'),
    'O Board é um quadro vazio em que vivem peças (apps). Você vê tudo pelo mapa (posição, tamanho, forma de cada peça e o espaço livre) e mexe em tudo pelas ferramentas: board_peca mostra, esconde, move e abre ou recolhe uma peça; peca_comando chama um comando de uma peça; agente passa um objetivo pro agente de uma peça, que conhece ela por dentro e faz os passos. Formas: livre (solta em x, y) ou fundida num lado ou canto: ' + Board.FORMAS.join(', ') + '. Degraus: compacto, espiar, aberto.',
    'Ao arrumar, use o espaço livre do mapa e não cubra uma peça com outra sem motivo. Depois de agir, confirme em uma frase. Não invente que fez algo que nenhuma ferramenta fez.',
    podePC() ? 'Você TEM internet: a ferramenta internet pesquisa na web, acha imagens e lê páginas. Use quando não souber ou quando a resposta muda com o tempo.' : '',
    'Quando contarem um gosto ou hábito que vale lembrar, guarde com lembrar.',
    'Agora: ' + new Date().toLocaleString('pt-BR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' }) + '.',
    'O Board agora: ' + JSON.stringify({ area:m.area, monitores:m.monitores, livre:m.livre, disponiveis:m.disponiveis, pecas:m.pecas.map(p => ({ id:p.id, nome:p.nome, visivel:p.visivel, forma:p.forma, degrau:p.degrau, x:p.x, y:p.y, w:p.w, h:p.h, ver:p.ver, comandos:p.comandos.map(c => c.nome) })) }).slice(0, 4000),
    mem.notas ? 'O que você já sabe de quem fala com você: ' + mem.notas : '',
  ].filter(Boolean).join('\n');
}

async function agente(id, pedido, atos){
  const p = Board.peca(id); if (!p.comandos.length) throw new Error('a peça "' + id + '" não tem comandos; use board_peca pra mexer nela');
  const s = sampleFn; if (!s) throw new Error('sem Claude aqui');
  const m = Board.mapa(), vizinhos = m.pecas.filter(q => q.id !== id && q.visivel).map(q => ({ id:q.id, x:q.x, y:q.y, w:q.w, h:q.h }));
  const sys = [
    'Você é o agente da peça "' + p.nome + '" dentro de um Board (uma área de trabalho). Quem te pede é o ' + A.nome + ', o assistente principal. Cumpra o pedido com as suas ferramentas, quantas vezes precisar, e no fim responda em até três frases com o resultado de verdade. Se não der, diga o motivo. Não peça nada a ninguém.',
    p.regras || 'Use as ferramentas pelo que a descrição de cada uma diz.',
    'Espaço: o quadro tem ' + m.area.w + ' x ' + m.area.h + ' px; você está em ' + JSON.stringify({ x:p.x, y:p.y, w:p.w, h:p.h, forma:p.forma }) + '; vizinhos: ' + JSON.stringify(vizinhos).slice(0, 900) + '. Pra mudar de lugar use caixa.',
    'Seu estado: ' + JSON.stringify(p.ver ?? null).slice(0, 1500),
  ].join('\n');
  const tools = p.comandos.map(c => ({ name:String(c.nome).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60), description:c.descricao || c.nome, inputSchema:c.esquema || { type:'object', properties:{} }, execute:a => Board.comando(id, c.nome, a) }));
  tools.push({ name:'caixa', description:'Move a sua peça: x e y em px pra soltar ali, ou forma pra fundir num lado ou canto (' + Board.FORMAS.join(', ') + ').', inputSchema:{ type:'object', properties:{ x:{ type:'number' }, y:{ type:'number' }, forma:{ type:'string', enum:Board.FORMAS } } }, execute:a => Board.mover(id, a || {}) });
  try { const r = await s([{ role:'user', content:sys + '\n\nPedido: ' + String(pedido).slice(0, 1500) }], { model:A.modelo, modelTier:'quick', cache:false, signal:A.ctl?.signal, tools:dentroDosLimites(tools) }); atos.push('⚙ ' + p.nome); return String(r.text || 'feito').slice(0, 3000); }
  catch (e) { if (e?.text) return String(e.text).slice(0, 3000); throw new Error('o agente de ' + id + ' não conseguiu (' + (e?.code || 'erro') + ')'); }
}

function ferramentas(atos){
  const l = [
    { name:'board_mapa', description:'Lê o Board inteiro agora: tamanho do quadro, cada peça (posição, tamanho, forma, degrau, o que ela mostra e os comandos), as peças disponíveis que estão fechadas e os maiores espaços livres.', execute:() => Board.mapa() },
    { name:'board_peca', description:'Mexe numa peça. acao: mostrar (abre, inclusive uma disponível fechada), esconder, mover (x e y em px pra soltar ali, ou forma pra fundir num lado ou canto), degrau (compacto, espiar ou aberto). Devolve a peça como ficou.',
      inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['mostrar','esconder','mover','degrau'] }, id:{ type:'string' }, x:{ type:'number' }, y:{ type:'number' }, forma:{ type:'string', enum:Board.FORMAS }, degrau:{ type:'string', enum:['compacto','espiar','aberto'] } }, required:['acao','id'] },
      execute({ acao, id, x, y, forma, degrau }){ atos.push(({ mostrar:'↗ ', esconder:'× ', mover:'⇄ ', degrau:'⤢ ' })[acao] + id);
        if (acao === 'mostrar') return Board.mostrar(id, true); if (acao === 'esconder') return Board.mostrar(id, false) || 'escondida';
        if (acao === 'degrau') return Board.degrau(id, degrau || 'aberto'); return Board.mover(id, { x, y, forma }); } },
    { name:'peca_comando', description:'Chama um comando de uma peça (os comandos de cada uma estão no mapa). id, comando, args.',
      inputSchema:{ type:'object', properties:{ id:{ type:'string' }, comando:{ type:'string' }, args:{ type:'object' } }, required:['id','comando'] },
      async execute({ id, comando, args }){ const r = await Board.comando(id, comando, args); atos.push('• ' + id + ': ' + comando); return r; } },
    { name:'agente', description:'Passa um objetivo pro agente de uma peça, que conhece ela por dentro e faz quantos passos precisar (ex.: navegar num site e ler, montar algo dentro da peça, se ajustar ao espaço). id da peça e pedido (o objetivo, com os dados necessários, não os passos). Devolve o resultado em texto. Pra um comando só, peca_comando é mais rápido.',
      inputSchema:{ type:'object', properties:{ id:{ type:'string' }, pedido:{ type:'string' } }, required:['id','pedido'] }, execute:({ id, pedido }) => agente(String(id), pedido, atos) },
    { name:'lembrar', description:'Guarda uma frase curta sobre quem fala com você (gosto, hábito) pra lembrar nas próximas conversas.',
      inputSchema:{ type:'object', properties:{ nota:{ type:'string' } }, required:['nota'] },
      execute({ nota }){ const n = String(nota || '').trim().slice(0, 160); if (!n) throw new Error('nota vazia'); const m = lerMem(); m.notas = ((m.notas ? m.notas + ' ' : '') + n).slice(-900); gravaMem(m); atos.push('✎ anotado'); return 'guardado'; } },
  ];
  if (podePC()) l.push({ name:'internet', description:'Sua internet. acao "pesquisar": até 6 resultados (título | endereço | resumo). acao "imagens": fotos grandes e livres do Wikimedia Commons (tamanho | endereço | nome); busca curta em inglês acha mais. acao "ler": título e texto de uma página https (até 5 mil letras). texto: a busca, ou o endereço em ler.',
    inputSchema:{ type:'object', properties:{ acao:{ type:'string', enum:['pesquisar','imagens','ler'] }, texto:{ type:'string' } }, required:['acao','texto'] },
    async execute({ acao, texto }){ const t = String(texto || '').trim().slice(0, 400); if (!t) throw new Error('diga o que buscar');
      if (acao === 'ler' && !/^https:\/\/[^\s'"<>]+$/i.test(t)) throw new Error('pra ler preciso de um endereço https completo');
      const r = await ps(psInternet(acao, t)); atos.push('⌕ ' + t.slice(0, 30)); if (!r) throw new Error('não achei nada pra "' + t + '"');
      return acao === 'ler' ? r.slice(0, 5200) : r.split(/\r?\n/).filter(Boolean).slice(0, 6); } });
  return l;
}

async function perguntar(texto, op = {}){
  texto = String(texto || '').trim(); if (!texto) throw new Error('pergunta vazia');
  const s = sampleFn ?? await pegaSample(); if (!s) throw { code:'sem_claude', message:'aqui não tem o Claude: abra o Board pelo app do Claude' };
  A.ctl?.abort(); const ctl = A.ctl = op.signal ? { signal:op.signal } : new AbortController();
  A.turnos.push({ role:'user', content:texto }); while (A.turnos.length > 14) A.turnos.splice(0, 2);
  const atos = [], o = { model:A.modelo, modelTier:'quick', cache:false, signal:ctl.signal, onText:op.onText };
  if (A.comFerramentas){ const lim = await s.limits?.().catch(() => null); if (lim && !lim.tools) A.comFerramentas = false; else { if (lim?.tools?.maxCount) A.teto = lim.tools.maxCount; o.tools = dentroDosLimites(ferramentas(atos)); } }
  try {
    const r = await s([{ role:'user', content:regras() }, ...A.turnos], o);
    A.turnos.push({ role:'assistant', content:r.text }); const m = lerMem(); m.usos.push(texto.slice(0, 80)); while (m.usos.length > 24) m.usos.shift(); gravaMem(m);
    Board.anunciar('assistente:respondeu', { atos:atos.slice() }); return { text:r.text, atos };
  } catch (e) {
    if (e?.code === 'tools_unavailable' && A.comFerramentas){ A.comFerramentas = false; A.turnos.pop(); return perguntar(texto, op); }
    if (e?.text){ A.turnos.push({ role:'assistant', content:e.text }); } else A.turnos.pop();
    throw e;
  } finally { if (A.ctl === ctl) A.ctl = null; }
}
Board.assistente = {
  configurar:o => { if (o?.nome) A.nome = String(o.nome); if (o?.persona != null) A.persona = String(o.persona); if (o?.modelo) A.modelo = String(o.modelo); },
  perguntar, parar:() => A.ctl?.abort?.(), disponivel:() => !!sampleFn, pronto:pegaSample, regras, ferramentas:() => ferramentas([]).map(t => t.name),
};
Board.anunciar('assistente:pronto', {});
