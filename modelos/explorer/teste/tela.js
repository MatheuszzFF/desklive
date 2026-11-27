// node modelos/explorer/teste/tela.js  → tira prints do widget (Edge sem janela, arquivos de mentira) e confere erros
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const js = fs.readFileSync(path.join(__dirname, '..', 'explorer.js'), 'utf8').replace("/*PS:explorer/ajudante.ps1*/''", "''");
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'explorer-tela-'));
const mock = `
const enc = o => 'b64:' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const falso = { pastas:{ area:'C:\\\\u\\\\Desktop', downloads:'C:\\\\u\\\\Downloads', documentos:'C:\\\\u\\\\Documents', imagens:'C:\\\\u\\\\Pictures', musicas:'C:\\\\u\\\\Music', videos:'C:\\\\u\\\\Videos' }, discos:[{ p:'C:\\\\', rotulo:'Sistema', livre:2e11, total:1e12 }] };
const nomes = ['Aulas de baixo','Projetos','AULA 1.pdf','Um nome de arquivo bem comprido que precisa quebrar direito.docx','foto.png','groove.mp3','video.mp4','pacote.zip','notas.txt'];
window.Mesa = {
  ajudante:() => async cmd => { const p = JSON.parse(decodeURIComponent(escape(atob(cmd.split(' ')[1])))); if (p.acao === 'lugares') return enc(falso); if (p.acao === 'lista') return enc({ caminho:p.caminho, total:nomes.length, itens:nomes.map((n, i) => ({ n, d:i < 2, t:i * 123456, m:Date.now() })) }); return enc({ minis:{} }); },
  podePC:() => true, comandos:() => [], agente(){}, estilo:c => { const e = document.createElement('style'); e.textContent = c; document.head.appendChild(e); },
  define:d => { for (const [x, y, w, h, lista] of [[0, 0, 720, 460, false], [730, 0, 420, 460, true], [0, 470, 300, 230, false]]) { const m = document.createElement('div'); m.style.cssText = 'position:absolute;container-type:size;container-name:mold;background:#0a0b10;border-radius:18px;overflow:hidden;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px'; const c = document.createElement('div'); c.style.cssText = 'position:absolute;inset:0'; m.appendChild(c); document.body.appendChild(m); d.monta(c, { ler:p => ({ ...p, caminho:'C:\\\\u\\\\Downloads', lista }), salvar(){} }); } },
};
addEventListener('error', e => document.title = 'ERRO ' + e.message); addEventListener('unhandledrejection', e => document.title = 'ERRO ' + e.reason);`;
const html = `<!doctype html><meta charset="utf-8"><title>ok</title><style>body{margin:0;background:#334;color:#f4f5f8;font-family:"Segoe UI";--muted:rgba(244,245,248,.62);--faint:rgba(244,245,248,.38);--line:rgba(255,255,255,.09);--coral:#d97757;--pessego:#f0a98a;--mola:cubic-bezier(.2,.9,.25,1.12)}button,input{font:inherit;color:inherit}</style><body><script>${mock}</script><script>${js}</script><script>setTimeout(() => { const it = document.querySelectorAll('.ex-it')[2]; it?.click(); it?.dispatchEvent(new MouseEvent('contextmenu', { bubbles:true, clientX:260, clientY:150 })); document.body.dataset.itens = document.querySelectorAll('.ex-it').length; }, 500)</script>`;
const arq = path.join(saida, 'tela.html'); fs.writeFileSync(arq, html);
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(f => fs.existsSync(f));
const base = ['--headless=new', '--disable-gpu', '--user-data-dir=' + path.join(saida, 'perfil'), '--window-size=1160,710', '--virtual-time-budget=3000'];
execFileSync(edge, [...base, '--screenshot=' + path.join(saida, 'tela.png'), 'file:///' + arq.replace(/\\/g, '/')], { stdio:'ignore', timeout:60000 });
const dom = execFileSync(edge, [...base, '--dump-dom', 'file:///' + arq.replace(/\\/g, '/')], { timeout:60000 }).toString();
console.log(dom.match(/<title>(.*?)<\/title>/)?.[1], 'itens:', dom.match(/data-itens="(\d+)"/)?.[1]); console.log(path.join(saida, 'tela.png'));
