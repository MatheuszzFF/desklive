/* Som: o sintetizador (timbre de baixo) e o relógio da música. O relógio é o interno (toca a linha) ou um de fora
   (a Onda tocando a música de verdade: segundos desde o começo + compensação). Frases curtas (ideia, passo do estudo)
   tocam por cima, com aviso de cada nota pra acender o desenho. */
const Som = (() => {
let A = null;
function audio(){
  if (!A){ const ac = new (window.AudioContext || window.webkitAudioContext)(), f = ac.createBiquadFilter(), m = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 1100; f.Q.value = .8; m.gain.value = .5; f.connect(m).connect(ac.destination); A = { ac, out:f }; }
  A.ac.resume?.(); return A;
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function nota(midi, quando, dur, vol = .5){
  const { ac, out } = audio(), a = ac.currentTime + Math.max(0, quando) + .01, z = a + dur * .92, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sawtooth'; o.frequency.value = hz(midi);
  g.gain.setValueAtTime(.0001, a); g.gain.exponentialRampToValueAtTime(vol, a + .012); g.gain.exponentialRampToValueAtTime(vol * .3, Math.max(a + .03, z - .03)); g.gain.linearRampToValueAtTime(.0001, z);
  o.connect(g).connect(out); o.start(a); o.stop(z + .02); return o;
}
// frase: [{ midi, t, d }] em batidas; aoNota(k) acende; devolve um cancelar
function frase(lista, bpm, aoNota, aoFim){
  const spb = 60 / bpm, nos = [], tm = [];
  lista.forEach((o, k) => { nos.push(nota(o.midi, o.t * spb, o.d * spb)); tm.push(setTimeout(() => aoNota?.(k), o.t * spb * 1000)); });
  const fim = lista.length ? (lista[lista.length - 1].t + lista[lista.length - 1].d) * spb * 1000 : 0; tm.push(setTimeout(() => { aoNota?.(-1); aoFim?.(); }, fim));
  return () => { tm.forEach(clearTimeout); nos.forEach(n => { try { n.stop(); } catch {} }); aoNota?.(-1); };
}
// tocador da música: ctx() dá o contexto atual, bpm() o andamento, midiSoando(ev) a nota que soa
function tocador({ ctx, bpm, midiSoando }){
  let nos = [], t0 = 0, t0p = 0, pos = 0, tocando = false, fora = null;   // fora: { tempo:() => s|null, tocando:() => bool, offset:() => s }
  const spb = () => 60 / bpm();
  function batida(){
    const c = ctx(); if (!c) return 0;
    if (fora){ const s = fora.tempo(); if (s == null) return pos; const b = (s - fora.offset()) / spb(); return b < 0 ? b : b % c.total; }
    return tocando ? pos + Math.max(0, (performance.now() - t0p) / 1000 - .06) / spb() : pos;   // relógio da tela pelo performance.now (o do áudio para se o navegador segurar o som)
  }
  const silencia = () => { nos.forEach(n => { try { n.stop(); } catch {} }); nos = []; };
  function agenda(){
    silencia(); const c = ctx(), ac = audio().ac, s = spb(); t0 = ac.currentTime + .06; t0p = performance.now();
    for (const ev of c.eventos){ if (ev.pausa || ev.beat + ev.dur <= pos + 1e-6) continue;
      const a = Math.max(0, ev.beat - pos) * s + .06; nos.push(nota(midiSoando(ev), a - .01, (ev.beat + ev.dur - Math.max(pos, ev.beat)) * s)); }
  }
  return {
    batida, ativo:() => fora ? !!fora.tocando() : tocando,
    tocar(){ if (fora) return; if (pos >= (ctx()?.total || 0) - 1e-6) pos = 0; tocando = true; agenda(); },
    pausar(){ if (fora || !tocando) return; pos = Math.min(batida(), ctx().total); tocando = false; silencia(); },
    alternar(){ this.ativo() ? this.pausar() : this.tocar(); },
    ir(b){ pos = Math.max(0, b); if (tocando) agenda(); },
    mudou(){ if (tocando){ pos = Math.min(batida(), ctx().total); agenda(); } },   // tom, andamento ou instrumento
    reinicia(){ if (tocando){ tocando = false; silencia(); } pos = 0; },
    laco(){ if (!fora && tocando && batida() >= ctx().total){ pos = 0; agenda(); } },
    externo(f){ if (f){ if (tocando){ tocando = false; silencia(); } } fora = f || null; },
    get externoLigado(){ return !!fora; },
  };
}
return { nota, frase, tocador, audio };
})();
