/* CEREBELO — memória de longo prazo, assíncrona (como o pipeline do Jarvis): depois que a conversa para (3 min sem
   pedido) ou quando junta 6 trocas, um Claude rápido (Haiku, sem ferramentas, sem guardar sessão) lê as trocas novas do
   hipocampo e devolve o que vale lembrar, já com setor e entidades; vira neurônio na rede. Nunca bloqueia a conversa. */
const CEREB = { t:0, rodando:false, ultimo:'' };
const PROMPT_CEREBELO = 'Você é o cerebelo de um assistente pessoal (o Dengas, um rato que mora na área de trabalho do dono). Leia as trocas abaixo entre o dono e o Dengas e extraia SÓ o que vale lembrar por meses: gostos e hábitos do dono, decisões que ele tomou, planos, problemas que aconteceram e como foram resolvidos, jeitos de fazer que deram certo, fatos sobre a vida, os projetos e as pessoas dele. Ignore conversa fiada, pedidos pontuais já resolvidos (tocar uma música, abrir algo) e o que o próprio Dengas disse sem o dono confirmar. Cada memória: uma frase curta em português, em terceira pessoa ("O dono prefere..."), com setor (decisoes, sessoes, padroes, incidentes, planos, conhecimento) e de 2 a 6 entidades (nomes de pessoas, apps, projetos, assuntos, em minúsculas). Responda só um JSON: {"memorias":[{"setor":"...","texto":"...","entidades":["..."]}]} com no máximo 6 itens; se nada vale lembrar, {"memorias":[]}.';
function cerebeloAgendar(){ clearTimeout(CEREB.t); if (hipoPendentes().length >= 6) return void cerebeloConsolidar(); CEREB.t = setTimeout(cerebeloConsolidar, 180000); }
async function cerebeloConsolidar(){
  const pend = hipoPendentes(); if (!pend.length || CEREB.rodando || !CC.claude) return;
  CEREB.rodando = true;
  const texto = pend.map(x => 'DONO: ' + x.eu + '\nDENGAS: ' + x.ele).join('\n\n').slice(-9000);
  try {
    const saida = await new Promise((ok, falha) => {
      const p = Mesa.host().childProcess.spawn(CC.claude, ['-p', '--model', 'claude-haiku-5-5', '--output-format', 'json', '--tools', '', '--strict-mcp-config', '--no-session-persistence', '--max-turns', '1', '--system-prompt', PROMPT_CEREBELO], { cwd:CC.casa });
      let o = '', e = ''; p.stdout.on('data', c => { o += c; }); p.stderr?.on?.('data', c => { e = (e + c).slice(-400); });
      p.on('exit', () => ok(o)); p.on('error', er => falha(er));
      Promise.resolve(p.stdin.write(texto)).then(() => p.stdin.end?.()).catch(() => {});
      setTimeout(() => { try { p.kill(); } catch {} falha(new Error('cerebelo demorou')); }, 120000);
    });
    const r = JSON.parse(saida); if (r.is_error) throw new Error(String(r.result).slice(0, 200));
    const m = String(r.result || '').match(/\{[\s\S]*\}/); const memorias = m ? (JSON.parse(m[0]).memorias || []) : [];
    let novas = 0; for (const q of memorias.slice(0, 6)) if (redeGuardar(q)) novas++;
    for (const x of pend) x.consolidada = true; hipoSalvar();
    CEREB.ultimo = new Date().toISOString(); ccLog('info', 'cerebelo consolidou', { trocas:pend.length, memorias:novas, rede:redeResumo() });
  } catch (e) { ccLog('aviso', 'cerebelo falhou', { erro:String(e?.message || e).slice(0, 200) }); }
  finally { CEREB.rodando = false; }
}
