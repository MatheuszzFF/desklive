/* Órbita: o app ORIGINAL (modelos/orbita), montado e embutido como hóspede. A Órbita não tem canal de comandos,
   então o que o morador faz por ela é o que dá pra fazer por fora: abrir um app instalado pelo nome. Sem tecla. */
{
let apps = null;
const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
async function instalados(){
  if (apps) return apps;
  const r = await Mesa.ps("[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-StartApps | Where-Object { $_.AppID -notmatch '^https?:' } | Select-Object Name, AppID | ConvertTo-Json -Compress", 20000);
  const j = JSON.parse(r || '[]'); apps = (Array.isArray(j) ? j : [j]).map(a => ({ nome:a.Name, id:a.AppID, n:norm(a.Name) })); return apps;
}
Mesa.hospeda({
  id:'orbita', nome:'Órbita', w:700, h:132, html:/*APP:orbita*/'',
  comandos:[
    { nome:'abrir_app', descricao:'Abre um programa instalado no PC pelo nome (ou parte dele), ex.: "Spotify", "Bloco de Notas". Devolve o nome do app aberto.',
      esquema:{ type:'object', properties:{ nome:{ type:'string' } }, required:['nome'] },
      async roda({ nome }){ const l = await instalados(), q = norm(nome), a = l.filter(x => x.n.includes(q)).sort((x, y) => (x.n.startsWith(q) ? 0 : 1) - (y.n.startsWith(q) ? 0 : 1) || x.n.length - y.n.length)[0]; if (!a) throw new Error('não achei nenhum app instalado com "' + nome + '"'); await Mesa.ps("Start-Process explorer.exe -ArgumentList 'shell:AppsFolder\\" + a.id.replace(/'/g, "''") + "'"); return 'abri ' + a.nome; } },
    { nome:'procurar_app', descricao:'Lista até 15 apps instalados cujo nome contém o texto.',
      esquema:{ type:'object', properties:{ texto:{ type:'string' } }, required:['texto'] },
      async roda({ texto }){ const l = await instalados(), q = norm(texto); return l.filter(x => x.n.includes(q)).slice(0, 15).map(x => x.nome); } },
  ],
});
}
