/* Onda: o app ORIGINAL (modelos/onda), montado e embutido como hóspede. Nada dele é reescrito aqui: a Mesa só dá a
   "janela de mentira". Este arquivo declara o hóspede e os comandos do morador, que falam com a Onda pelo mesmo
   canal de arquivos que ela já tem pro Eco (~/.orbita: musica.json, musica-cmd/, musica-res/). */
{
const DIR = '~/.orbita';
let est = null;
const fs = () => Mesa.podePC() ? Mesa.host()?.fs : null;
setInterval(async () => { const f = fs(); if (!f || !Mesa.hospedes().some(h => h.id === 'onda' && h.aberto)) return; try { const j = JSON.parse(await f.readFile(DIR + '/musica.json', 'utf8')); est = j && Date.now() - j.updated < 8000 ? j : null; } catch { est = null; } }, 2500);
async function pede(acao, valor, extra){
  const f = fs(); if (!f) throw new Error('só no app instalado, com o acesso total liberado');
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  await f.mkdir(DIR + '/musica-cmd', { recursive:true });
  await f.writeFile(DIR + '/musica-cmd/' + id + '.tmp', JSON.stringify({ id, acao, valor, ...(extra || {}), de:'Mesa' }));
  await f.rename(DIR + '/musica-cmd/' + id + '.tmp', DIR + '/musica-cmd/' + id + '.json');
  for (let i = 0; i < 80; i++){
    await new Promise(r => setTimeout(r, 250));
    try { const r = JSON.parse(await f.readFile(DIR + '/musica-res/' + id + '.json', 'utf8')); f.rm(DIR + '/musica-res/' + id + '.json', { force:true }).catch(() => {}); return r.resultado; } catch {}
  }
  throw new Error('a Onda não respondeu');
}
Mesa.hospeda({
  id:'onda', nome:'Onda', w:476, h:160, html:/*APP:onda*/'',
  estado:() => est ? { tocando:est.tocando, status:est.status, posicao_s:est.posicao_s, duracao_s:est.duracao_s, aleatorio:est.aleatorio, repetir:est.repetir } : { status:'sem leitura' },
  comandos:[
    { nome:'controlar', descricao:'Controla a música pela Onda. acao: tocar_pausar, tocar, pausar, proxima, anterior, ir_para (valor = segundos), aleatorio (valor on/off), repetir (valor desligado/playlist/musica), abrir_spotify, tamanho (valor minima/compacta/expandida/grande), posicao (valor topo, base, esquerda, direita, centro ou um canto, dentro da Mesa).',
      esquema:{ type:'object', properties:{ acao:{ type:'string', enum:['tocar_pausar','tocar','pausar','proxima','anterior','ir_para','aleatorio','repetir','abrir_spotify','tamanho','posicao'] }, valor:{ type:['string','number'] } }, required:['acao'] },
      roda:({ acao, valor }) => pede(String(acao), valor) },
    { nome:'escolher', descricao:'Toca ou põe na fila algo específico no Spotify (precisa do Spotify conectado na Onda). acao: tocar_busca (tipo musica/album/artista/playlist), tocar_minha_playlist (pelo nome), adicionar_fila. busca: o que procurar, de preferência com filtros do Spotify, ex.: track:"No Heart To Speak Of" artist:blink-182. Ela toca o PRIMEIRO resultado: pra uma faixa exata, prefira tocar_uri.',
      esquema:{ type:'object', properties:{ acao:{ type:'string', enum:['tocar_busca','tocar_minha_playlist','adicionar_fila'] }, busca:{ type:'string' }, tipo:{ type:'string', enum:['musica','album','artista','playlist'] } }, required:['acao','busca'] },
      roda:({ acao, busca, tipo }) => pede(String(acao), String(busca || ''), { tipo:tipo || 'musica' }) },
    { nome:'listar', descricao:'Lê pela Onda a fila do Spotify (o_que "fila") ou os nomes das suas playlists (o_que "playlists").',
      esquema:{ type:'object', properties:{ o_que:{ type:'string', enum:['fila','playlists'] } }, required:['o_que'] },
      roda:({ o_que }) => pede(o_que === 'playlists' ? 'minhas_playlists' : 'ver_fila') },
  ],
});
}
Mesa.agente('onda', "Você cuida da música do dono pela Onda (o player dele). Veja o estado (o que toca, se está pausado) antes de agir; pra tocar algo, procure e escolha o resultado que mais bate com o pedido; devolva o nome da faixa e do artista que ficou tocando. Pra uma faixa, álbum ou playlist específicos, ache a uri com o conector do Spotify e use tocar_uri; a busca da Onda pega o primeiro resultado e erra quando o nome vem diferente.");
