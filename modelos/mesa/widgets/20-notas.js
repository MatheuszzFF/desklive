/* Notas: um bloco de texto que fica guardado. O morador lê e escreve nele por comando. */
Mesa.estilo(`
.nt{position:absolute;inset:0 0 0 0;width:100%;height:100%;box-sizing:border-box;border:0;outline:0;resize:none;background:transparent;padding:20px 16px 16px;font:400 14.5px/1.55 var(--corpo);user-select:text;-webkit-user-select:text;scrollbar-width:none}
.nt::placeholder{color:var(--faint)}
`);
Mesa.define({
  id:'notas', nome:'Notas', descricao:'bloco de anotações que fica guardado', deSaida:true, lugar:{ borda:'r', meio:true }, w:300, h:240, minW:180, minH:120,
  icone:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  monta(corpo, api){
    const t = document.createElement('textarea'); t.className = 'nt'; t.spellcheck = false; t.placeholder = 'Escreva aqui, ou peça pro Dengas anotar…'; t.setAttribute('aria-label', 'Notas');
    t.value = api.ler({ texto:'' }).texto || ''; corpo.appendChild(t);
    const salva = () => api.salvar({ texto:t.value });
    t.addEventListener('input', salva);
    return {
      estado:() => ({ texto:t.value.slice(0, 1500), caracteres:t.value.length }),
      comandos:[
        { nome:'escrever', descricao:'Escreve nas notas. modo "acrescentar" (padrão) põe uma linha nova no fim; "substituir" troca tudo.',
          esquema:{ type:'object', properties:{ texto:{ type:'string' }, modo:{ type:'string', enum:['acrescentar','substituir'] } }, required:['texto'] },
          roda({ texto, modo }){ const x = String(texto || ''); t.value = modo === 'substituir' ? x : (t.value ? t.value.replace(/\s+$/, '') + '\n' : '') + x; salva(); t.scrollTop = t.scrollHeight; return 'anotado'; } },
        { nome:'limpar', descricao:'Apaga todas as notas.', roda(){ t.value = ''; salva(); return 'limpo'; } },
      ],
    };
  },
});
