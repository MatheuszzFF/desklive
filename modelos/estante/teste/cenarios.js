// Cenários do simulador isolado: abra estante.html?testes. Resultado em window.__res e no console da página.
if (location.search.includes('testes')) (async () => {
  localStorage.clear();
  const espera = ms => new Promise(r => setTimeout(r, ms)), cmd = (n, a = {}) => Mesa.comandos().find(c => c.nome === n).roda(a);
  const est = () => W.estante.inst.estado(), R = document.querySelector('.es'), res = []; let falhas = 0;
  const ok = (nome, cond, extra = '') => { res.push((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra ? ' · ' + extra : '')); if (!cond) falhas++; };
  const vis = s => !R.querySelector(`[data-s="${s}"]`).hidden;
  await espera(300);
  ok('abre no blues', est().id === 'blues' && R.querySelectorAll('.es-sheet .sys').length > 0);
  ok('cabeça mostra acorde', /A/.test(R.querySelector('.es-agora b').textContent));
  await cmd('foco', { modo:'partitura' }); await espera(700);
  ok('foco partitura mostra camadas', vis('cams') && vis('pauta') && !vis('est'), mold.style.width + '×' + mold.style.height);
  await cmd('camadas', { so:['cifra', 'partitura', 'tab'] }); await espera(200);
  ok('camadas exatas', JSON.stringify(est().camadas) === JSON.stringify(['cifra', 'partitura', 'tab']) && !!R.querySelector('.es-sheet .nh'));
  await cmd('tom', { para:'C' }); await espera(150);
  ok('transpõe para Dó', est().tom === 'C' && est().transposto === 3);
  const r = await cmd('carregar_cifra', { titulo:'Teste Cifra', artista:'Sim', tom:'Am', bpm:100, secoes:[{ nome:'Verso', compassos:['Am', 'F G', 'C', 'E7'] }, { nome:'Refrão', compassos:['Dm7 G7', 'Cmaj7', 'Bm7b5 E7', 'Am'] }] });
  await espera(200);
  ok('carrega cifra de fora', est().id.startsWith('c-') && r.compassos === 8 && !!R.querySelector('.es-sheet .sec'), JSON.stringify(r));
  let erro = ''; try { await cmd('carregar_cifra', { titulo:'x', tom:'Am', secoes:[{ compassos:['Xyz'] }] }); } catch (e) { erro = e.message; }
  ok('recusa acorde inválido', /não entendi/.test(erro));
  await cmd('foco', { modo:'tocar' }); await cmd('tocar'); await espera(2600);
  ok('toca e anda o cursor', est().tocando && est().compasso_agora >= 1 && document.querySelector('.es-ph.vivo') != null, `tocando ${est().tocando} compasso ${est().compasso_agora} cursor ${!!document.querySelector('.es-ph.vivo')}`);
  ok('balões soltos abertos', document.querySelectorAll('.es-bal.vivo').length >= 2, est().baloes.join(','));
  await espera(1500); const b = document.querySelector('.es-bal[data-id="compasso"]'), rc = document.getElementById('mold').getBoundingClientRect(), rb = b.getBoundingClientRect();
  ok('balão fora do corpo, ao lado', rb.left >= rc.right - 10 || rb.right <= rc.left + 2 || rb.top >= rc.bottom - 2, `corpo ${Math.round(rc.left)}-${Math.round(rc.right)} balão ${Math.round(rb.left)}-${Math.round(rb.right)}`);
  await cmd('pausar'); await espera(100); ok('pausa', !est().tocando);
  await cmd('ir_compasso', { n:3 }); await espera(2000); ok('vai pro compasso 3', est().compasso_agora === 3, String(est().compasso_agora));
  const l = await cmd('estudo', { tema:'pentatonica', raiz:'A', desenho:2 }); await espera(700);
  ok('estudo penta desenho 2', vis('est') && !vis('pauta') && R.querySelectorAll('.es-braco .pt').length >= 8 && R.querySelectorAll('.es-passo').length === 4, l.licao);
  await cmd('tocar_passo', { n:1 }); await espera(600); ok('passo acende nota no braço', !!R.querySelector('.es-braco .pt.on') && !!R.querySelector('.es-passo.on'));
  await cmd('estudo_livre', { titulo:'Slap: polegar e puxada', raiz:'E', texto:'Polegar na corda grave, puxada na oitava.', passos:[{ titulo:'Oitavas', texto:'T na raiz, P na oitava', graus:[0, 12, 0, 12, 0, 12, 7, 10], bpm:80 }] }); await espera(200);
  ok('estudo livre', /Slap/.test(est().estudo));
  await cmd('foco', { modo:'compacto' }); await espera(700); ok('compacto encolhe', parseInt(mold.style.height) <= 110 && !vis('pauta'), mold.style.height);
  await cmd('baloes', { ligados:false }); await espera(400); ok('desliga balões', document.querySelectorAll('.es-bal.vivo').length === 0);
  await cmd('abrir_musica', { musica:'grace' }); ok('abre do repertório', est().id === 'grace' && est().compasso === '3/4');
  let e2 = ''; try { await cmd('tocar_com_onda', { busca:'x' }); } catch (e) { e2 = e.message; } ok('sem Onda avisa', /Onda/.test(e2));
  res.push(falhas ? falhas + ' falha(s)' : 'tudo ok'); window.__res = res; console.log(res.join('\n'));
})();
