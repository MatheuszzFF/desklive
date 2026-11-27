// node modelos/explorer/teste/ajudante.teste.js  (Windows; mexe só numa pasta temporária própria)
const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const codigo = fs.readFileSync(path.join(__dirname, '..', 'ajudante.ps1'), 'utf8');
const enc = Buffer.from(codigo, 'utf16le').toString('base64');
assert(enc.length < 32000, 'o ajudante passou do limite da linha de comando: ' + enc.length);
const p = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc]);
let buf = '', n = 0; const pend = new Map();
p.stdout.on('data', c => { buf += c; let i; while ((i = buf.indexOf('\n')) >= 0){ const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); const [id, r] = l.split(' '); pend.get(id)?.(JSON.parse(Buffer.from(r.slice(4), 'base64').toString('utf8'))); } });
p.stderr.on('data', c => process.stderr.write(c));
const pede = o => new Promise((res, rej) => { const id = 'r' + (++n); const t = setTimeout(() => rej(new Error('sem resposta: ' + o.acao)), 30000); pend.set(id, r => { clearTimeout(t); res(r); }); p.stdin.write(id + ' fs ' + Buffer.from(JSON.stringify(o)).toString('base64') + '\n'); });

(async () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'explorer-teste-'));
  const nomes = async c => [].concat((await pede({ acao:'lista', caminho:c })).itens).map(i => i.n);
  const L = await pede({ acao:'lugares' }); assert(L.pastas.downloads && [].concat(L.discos).length, JSON.stringify(L.erro));
  assert.deepStrictEqual(await nomes(raiz), []);
  const nova = await pede({ acao:'nova', caminho:raiz, nome:'canções [1]' }); assert(nova.feito, nova.erro);
  fs.writeFileSync(path.join(raiz, "it's.txt"), 'oi');
  assert.deepStrictEqual(await nomes(raiz), ['canções [1]', "it's.txt"]);
  const txt = path.join(raiz, "it's.txt");
  assert.strictEqual((await pede({ acao:'copiar', origens:[txt], destino:nova.feito })).feito, 1);
  assert.strictEqual((await pede({ acao:'copiar', origens:[txt], destino:nova.feito })).feito, 1);
  assert.deepStrictEqual(await nomes(nova.feito), ["it's (2).txt", "it's.txt"]);                 // nunca passa por cima
  assert((await pede({ acao:'renomear', origem:txt, nome:'a\\b' })).erro);
  assert((await pede({ acao:'renomear', origem:txt, nome:"IT'S.txt" })).feito);                  // só troca maiúscula
  assert((await pede({ acao:'copiar', origens:[nova.feito], destino:nova.feito })).erro);        // pasta dentro dela mesma
  assert.strictEqual((await pede({ acao:'mover', origens:[path.join(raiz, "IT'S.txt")], destino:nova.feito })).feito, 1);
  assert.strictEqual((await nomes(nova.feito)).length, 3);
  const b = [].concat((await pede({ acao:'busca', caminho:raiz, texto:'(2)' })).itens); assert.strictEqual(b.length, 1); assert(b[0].p.endsWith('.txt'));
  const bmp = path.join(raiz, 'p.png'); fs.writeFileSync(bmp, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhWMLsQAAAABJRU5ErkJggg==', 'base64'));
  assert((await pede({ acao:'mini', caminhos:[bmp] })).minis[bmp]?.length > 100);
  assert((await pede({ acao:'lixeira', origens:['C:\\Windows'] })).erro);
  assert((await pede({ acao:'lixeira', origens:[os.homedir()] })).erro);
  assert((await pede({ acao:'lixeira', origens:['C:\\'] })).erro);
  assert((await pede({ acao:'lista', caminho:'relativo' })).erro);
  assert.strictEqual((await pede({ acao:'lixeira', origens:[bmp] })).feito, 1); assert(!fs.existsSync(bmp));   // vai um pixel pra Lixeira
  p.stdin.end(); fs.rmSync(raiz, { recursive:true, force:true });
  console.log('explorer: ajudante ok (' + enc.length + ' de 32000)');
})().catch(e => { console.error(e); p.kill(); process.exit(1); });
