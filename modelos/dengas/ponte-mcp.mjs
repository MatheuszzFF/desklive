// Ponte do Dengas: um servidor MCP (stdio) que o Claude Code do dono carrega quando roda como o Dengas.
// Ele dá ao Claude Code as mãos no Board: as mesmas ferramentas do Dengas da página (abrir widget, comandos dos apps,
// criar widget, aparência, internet, lembrar...) e a pergunta de permissão no chat ("Pode" / "Agora não").
// Não fala com rede nenhuma: conversa com o Board por arquivos em ~/.orbita/dengas/ponte (pedido req-<id>.json,
// resposta res-<id>.json). O Board é quem executa, com as travas dele (o que é fora do Board pergunta antes).
import { mkdirSync, writeFileSync, readFileSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const PASTA = join(homedir(), '.orbita', 'dengas', 'ponte');
mkdirSync(PASTA, { recursive: true });
let n = 0;
const dorme = ms => new Promise(r => setTimeout(r, ms));
// manda um pedido pro Board e espera a resposta
async function pede(corpo, tempo) {
  const id = process.pid + '-' + Date.now() + '-' + (++n), tmp = join(PASTA, 'tmp-' + id), req = join(PASTA, 'req-' + id + '.json'), res = join(PASTA, 'res-' + id + '.json');
  writeFileSync(tmp, JSON.stringify(corpo), 'utf8'); renameSync(tmp, req);
  const fim = Date.now() + tempo;
  while (Date.now() < fim) {
    await dorme(150);
    if (existsSync(res)) { try { const r = JSON.parse(readFileSync(res, 'utf8')); try { unlinkSync(res); } catch {} return r; } catch {} }
  }
  try { unlinkSync(req); } catch {}
  return { erro: 'o Board não respondeu (ele está aberto?)' };
}
const PERMISSAO = { name: 'permissao', description: 'Usada pelo Claude Code pra perguntar ao dono no chat do Dengas se pode usar uma ferramenta.',
  inputSchema: { type: 'object', properties: { tool_name: { type: 'string' }, input: { type: 'object' }, tool_use_id: { type: 'string' } }, required: ['tool_name'] } };
const responde = (id, result) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
const falha = (id, code, message) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
const texto = (t, erro) => ({ content: [{ type: 'text', text: typeof t === 'string' ? t : JSON.stringify(t) }], ...(erro ? { isError: true } : {}) });

createInterface({ input: process.stdin }).on('line', async linha => {
  let m; try { m = JSON.parse(linha); } catch { return; }
  const { id, method, params } = m;
  if (id === undefined) return;   // notificações (initialized etc.)
  try {
    if (method === 'initialize') return responde(id, { protocolVersion: params?.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'dengas', version: '1' } });
    if (method === 'ping') return responde(id, {});
    if (method === 'tools/list') {
      const r = await pede({ tipo: 'lista' }, 15000);
      const l = (Array.isArray(r.ferramentas) ? r.ferramentas : []).map(t => ({ name: t.name, description: String(t.description || '').slice(0, 1800), inputSchema: t.inputSchema || { type: 'object', properties: {} } }));
      return responde(id, { tools: [...l, PERMISSAO] });
    }
    if (method === 'tools/call') {
      const nome = params?.name, args = params?.arguments || {};
      if (nome === 'permissao') {
        const r = await pede({ tipo: 'permissao', ferramenta: args.tool_name, entrada: args.input || {} }, 130000);
        const v = r.ok ? { behavior: 'allow', updatedInput: args.input || {} } : { behavior: 'deny', message: r.motivo || 'O dono disse que agora não. Não insista; pergunte o que ele prefere.' };
        return responde(id, texto(JSON.stringify(v)));
      }
      const r = await pede({ tipo: 'ferramenta', nome, args }, 120000);
      return responde(id, r.erro ? texto(r.erro, true) : texto(r.resultado ?? 'feito'));
    }
    falha(id, -32601, 'método desconhecido: ' + method);
  } catch (e) { falha(id, -32000, String(e?.message || e)); }
});
