/* AMÍGDALA — lê cada pedido antes do Claude: intenção, tom, urgência e assuntos, e escolhe quais setores da memória
   acender. Sem custo (só JavaScript). O córtex manda o resultado numa linha [amígdala: ...] junto do pedido. */
const AMIG = {
  assuntos:{
    musica:/\b(m[uú]sica|toca|tocar|spotify|onda|banda|baixo|playlist|[aá]lbum|cantor|som)\b/i,
    trabalho:/\b(allye|jarvis|c[oó]digo|repo|pr\b|deploy|matheus|desklive|bug|api|commit|branch|cliente|reuni[aã]o)\b/i,
    jogo:/\b(skyrim|kainz[aã]o|lorefall|jogo|jogatina|mod|npc|serana|sofia|toccata|yae|mantella)\b/i,
    board:/\b(widget|board|mesa|tela|janela|dengas|bolinha|balão|balao|barra)\b/i,
    agenda:/\b(agenda|amanh[aã]|hoje|semana|reuni[aã]o|lembra|lembrete|hor[aá]rio|dia \d)\b/i,
    pessoal:/\b(eu sou|gosto|odeio|prefiro|minha|meu|fam[ií]lia|namorad|amig|sa[uú]de|comida|casa)\b/i,
  },
  tons:{
    frustrado:/(porra|caralho|merda|bugad|n[aã]o funciona|de novo|ta feio|tá feio|trollando|ainda n[aã]o|cad[eê]|p[ée]ssimo|horr[ií]vel)/i,
    animado:/(\btop\b|\bmassa\b|\bshow\b|kkk|haha|(^|\s)m[oó]\s|bonitinh|perfeito|\bamei\b|demais|boa!|isso a[ií])/i,
  },
  intencoes:[
    ['pedido', /^(abre|abra|toca|toque|faz|faça|cria|crie|mostra|mostre|manda|mande|liga|desliga|fecha|feche|coloca|bota|tira|muda|troca|procura|pesquisa|busca|traz|deixa)\b/i],
    ['pergunta', /\?\s*$|^(como|qual|quais|quando|onde|por que|porque|o que|quem|tem como|d[aá] pra|sabe)\b/i],
    ['decisao', /\b(vamos usar|decidi|a partir de agora|daqui pra frente|nunca mais|sempre que|n[aã]o quero mais|quero que)\b/i],
    ['plano', /\b(vamos|depois|planej|roadmap|pr[oó]ximo passo|ideia|e se)\b/i],
  ],
  urgente:/(?<!partir de |de )\bagora\b|\b(r[aá]pido|urgente|correndo|socorro)\b|\bj[aá] j[aá]\b/i,   // "a partir de agora" não é pressa
};
function amigdala(texto){
  const t = String(texto || '');
  const assuntos = Object.keys(AMIG.assuntos).filter(k => AMIG.assuntos[k].test(t));
  const tom = AMIG.tons.frustrado.test(t) ? 'frustrado' : AMIG.tons.animado.test(t) ? 'animado' : 'neutro';
  const intencao = (AMIG.intencoes.find(([, re]) => re.test(t.trim())) || ['conversa'])[0];
  const urgencia = AMIG.urgente.test(t);
  // setores que este pedido acende primeiro (o resto ainda pode vir, com peso menor)
  const setores = new Set(['sessoes', 'conhecimento']);
  if (tom === 'frustrado' || /\b(bug|erro|quebr|falh|trav)/i.test(t)) setores.add('incidentes');
  if (intencao === 'decisao') setores.add('decisoes');
  if (intencao === 'plano') setores.add('planos');
  if (intencao === 'pergunta' && /\b(como|jeito)\b/i.test(t)) setores.add('padroes');
  if (assuntos.includes('pessoal')) setores.add('conhecimento');
  return { intencao, tom, urgencia, assuntos, setores:[...setores] };
}
const linhaAmigdala = a => '[amígdala: ' + [a.intencao, 'tom ' + a.tom, a.urgencia ? 'urgente' : '', a.assuntos.length ? 'assuntos: ' + a.assuntos.join(', ') : ''].filter(Boolean).join(' · ') + ']';
