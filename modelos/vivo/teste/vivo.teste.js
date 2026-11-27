// node modelos/vivo/teste/vivo.teste.js : as travas e a recarga, com um Board de mentira
const assert = require('assert'), fs = require('fs'), path = require('path');
const fonte = fs.readFileSync(path.join(__dirname, '..', 'vivo.js'), 'utf8');
const espera = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const arquivos = new Map(), defs = new Map(), abertos = new Set(), menus = [], apps = [], cartoes = [], disco = {};
  const botao = () => { const o = {}; return { o, addEventListener:(t, f) => { o[t] = f; } }; };
  global.document = { createElement:() => { const bs = [botao(), botao()], txt = {}; const el = { bs, txt, remove:() => { el.fora = true; }, querySelector:s => txt[s] ||= {}, querySelectorAll:() => bs }; return el; }, head:{ appendChild(){} } };
  const Board = { registrar:d => d, remover:id => { defs.delete(id); abertos.delete(id); }, menu:f => menus.push(f) };
  global.window = { Board }; global.addEventListener = () => {};
  const Mesa = { principal:true, podePC:() => true, le:(k, d) => disco[k] ?? d, grava:(k, v) => { disco[k] = v; }, bus:{ emit(){} }, estilo(){}, camada:{ appendChild:e => cartoes.push(e) }, app:a => apps.push(a),
    define:d => { defs.set(d.id, d); window.Board.registrar(d); }, defs:() => [...defs.values()], aberto:id => abertos.has(id), abre:id => abertos.add(id),
    host:() => ({ fs:{ exists:async () => true, mkdir:async () => {}, readdir:async () => [...arquivos.keys()], readFile:async p => arquivos.get(p.split('/').pop()) } }) };
  global.Mesa = Mesa; window.Mesa = Mesa;
  let tique; global.setInterval = f => { tique = f; };
  new Function(fonte)();
  const clica = async (i, confiavel = true) => { cartoes.at(-1).bs[i].o.click({ isTrusted:confiavel }); await espera(20); };

  arquivos.set('teste.js', "Mesa.define({ id:'teste', versao:1 });"); arquivos.set('..ruim.txt', 'x');
  tique(); await espera(20); assert.strictEqual(cartoes.length, 0, 'desligado não pergunta nem roda'); assert(!defs.size);
  menus[0]()[0].click(); await espera(20); assert.strictEqual(cartoes.length, 1);
  await clica(1, false); assert(!defs.size, 'clique falso não aprova');
  await clica(1); assert.strictEqual(defs.get('teste').versao, 1); assert(abertos.has('teste'));
  tique(); await espera(20); assert.strictEqual(cartoes.length, 1, 'a mesma peça não pergunta de novo');
  arquivos.set('teste.js', "Mesa.define({ id:'teste', versao:2 });"); tique(); await espera(20);
  assert.strictEqual(cartoes.length, 2, 'mudou o conteúdo, pergunta'); assert.strictEqual(defs.get('teste').versao, 1);
  await clica(0); assert.strictEqual(defs.get('teste').versao, 1); tique(); await espera(20); assert.strictEqual(cartoes.length, 2, 'recusada fica quieta');
  const volta = apps[0].comandos[0].roda(); await espera(20); assert.strictEqual(cartoes.length, 3); await clica(1); await espera(900); await volta;
  assert.strictEqual(defs.get('teste').versao, 2); assert(abertos.has('teste'));
  arquivos.set('quebrada.js', 'isto não é js ('); tique(); await espera(20); await clica(1);
  assert(apps[0].estado().pecas.find(p => p.nome === 'quebrada').situacao.startsWith('erro'));
  assert.deepStrictEqual(apps[0].comandos.map(c => c.nome), ['procurar']);
  console.log('vivo: tudo certo');
})().catch(e => { console.error(e); process.exit(1); });
