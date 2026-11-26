/* Relógio: hora, data e um cronômetro regressivo. Exemplo mínimo de widget: estado, comandos e forma por tamanho. */
Mesa.estilo(`
.rl{height:100%;display:grid;place-items:center;text-align:center;padding:0 12px 10px;box-sizing:border-box}
.rl-h{font:600 clamp(28px,22cqw,84px)/1 var(--titulo);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.rl-d{margin-top:6px;color:var(--muted);font-size:13px;text-transform:capitalize}
.rl-c{margin-top:8px;font:600 15px/1 var(--titulo);color:var(--pessego);font-variant-numeric:tabular-nums;min-height:15px}
@container w (max-height:120px){.rl-d{display:none}}
`);
Mesa.define({
  id:'relogio', nome:'Relógio', descricao:'hora, data e cronômetro regressivo', deSaida:true, lugar:{ borda:'tr' }, w:260, h:170, minW:150, minH:90,
  icone:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  monta(corpo, api){
    corpo.innerHTML = '<div class="rl"><div><div class="rl-h"></div><div class="rl-d"></div><div class="rl-c" aria-live="polite"></div></div></div>';
    const h = corpo.querySelector('.rl-h'), d = corpo.querySelector('.rl-d'), c = corpo.querySelector('.rl-c');
    let fim = 0, rotulo = '';
    const mm = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    function bate(){
      const a = new Date();
      h.textContent = a.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
      d.textContent = a.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
      if (fim){
        const falta = Math.ceil((fim - Date.now()) / 1000);
        if (falta <= 0){ fim = 0; c.textContent = ''; api.avisar('Acabou o tempo' + (rotulo ? ' de ' + rotulo : '') + '!'); api.emitir('fim', { rotulo }); }
        else c.textContent = (rotulo ? rotulo + ' · ' : '') + mm(falta);
      }
    }
    bate(); const t = setInterval(bate, 1000);
    return {
      estado:() => ({ hora:h.textContent, cronometro:fim ? { falta_s:Math.ceil((fim - Date.now()) / 1000), rotulo } : null }),
      comandos:[
        { nome:'cronometro', descricao:'Começa uma contagem regressiva (minutos, pode ser fração) com um rótulo opcional; ao acabar, o Dengas avisa. minutos 0 cancela.',
          esquema:{ type:'object', properties:{ minutos:{ type:'number' }, rotulo:{ type:'string' } }, required:['minutos'] },
          roda({ minutos, rotulo:r }){ const m = Number(minutos) || 0; rotulo = String(r || '').slice(0, 40); fim = m > 0 ? Date.now() + m * 60000 : 0; bate(); return fim ? 'contando ' + m + ' min' : 'cancelado'; } },
      ],
      aoFechar:() => clearInterval(t),
    };
  },
});
Mesa.agente('relogio', "Você cuida do relógio e dos cronômetros/temporizadores da Mesa. Confira o estado antes de mexer e devolva sempre o horário ou o tempo que ficou valendo.");
