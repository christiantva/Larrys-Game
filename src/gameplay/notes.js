/* =====================================================================
   NOTAS — la historia se cuenta en papeles encontrados por la estación
   ===================================================================== */
const NOTES = {
  n1: { title: 'Nota en el móvil', place: 'Salida 2', body: [
    '<i>0:41</i> — Me he vuelto a quedar dormido en el tren. Me ha despertado el revisor en Sanjo, o eso creo: cuando abrí los ojos el vagón estaba vacío.',
    'El último tren ya se ha ido. Todo está cerrado, pero la entrada del metro sigue abierta y abajo hay luz.',
    'La batería del móvil está muerta. Solo tengo la linterna de la oficina. Tengo que ahorrarla.',
  ] },
  n2: { title: 'Aviso interno', place: 'Escalera, rellano inferior', body: [
    '<b>係員各位</b> — A todo el personal:',
    'Se ruega devolver la llave de la <b>puerta de mantenimiento del andén (lado oeste)</b> a su gancho después de cada turno. Ya ha desaparecido dos veces.',
    'Recordamos también que, tras el último servicio, <u>nadie</u> debe quedarse en el andén. Si oyen pasos en el túnel, no respondan. — El jefe de estación',
  ] },
  n3: { title: 'Horario arrancado', place: 'Vestíbulo', body: [
    '<b>最終電車 — Último tren: 0:42</b>',
    'Los billetes se compran en las máquinas con monedas (no aceptan billetes de banco a esta hora). Los torniquetes no se abren sin billete.',
    'Alguien ha escrito encima, con bolígrafo, muchas veces: <i>0:42 0:42 0:42 0:42 0:42</i>',
  ] },
  n4: { title: 'Diario de alguien', place: 'Andén, banco', body: [
    'No sé cuántas veces he bajado estas escaleras. El panel siempre dice que el próximo tren llega pronto. Nunca llega.',
    'Si te quedas quieto a oscuras, se oyen pasos que no son los tuyos. Siguen andando cuando tú te paras.',
    '<b>No apagues la luz.</b> Y si ves a alguien al fondo del andén, no lo mires mucho tiempo.',
  ] },
  n5: { title: 'Parte de obra', place: 'Túnel', body: [
    'Obra n.º 7 — Prolongación del túnel oeste.',
    'La puerta del tabique es eléctrica. Se ha cortado la corriente del cuadro (<b>falta el fusible</b>). El de repuesto se dejó en una caja <b>dentro del andamio</b>, junto a los conos.',
    'Desde que empezamos a excavar, los obreros del turno de noche dicen que oyen un tren. Aquí no pasa ningún tren.',
  ] },
  n6: { title: 'Papel en el quiosco', place: 'Galería', body: [
    'Todos los relojes de la estación se pararon a la misma hora. Los de la galería también. El de la entrada también. El mío también.',
    'La puerta de cristal de arriba tiene un teclado. El guarda decía que la clave era <b>"la hora en que se paró todo"</b>, con cuatro cifras.',
    'Ya no recuerdo cuándo llegué. Solo recuerdo esa hora.',
  ] },
  n7: { title: 'Diario del revisor', place: 'Atrio', body: [
    'Esa noche perforé su billete como a todos. Se había dormido con la cabeza contra la ventana. Le desperté en Sanjo y me dijo que solo quería llegar a casa.',
    'El tren de las 0:42 no llegó a la terminal. Desde entonces, cada noche, alguien baja estas escaleras buscando el último tren.',
    'Dejo la tenaza aquí. Si llevas un billete, perfóralo. <b>Vuelve al andén.</b> Él te estará esperando.',
  ] },
  n8: { title: 'Mi propia letra', place: 'Salida 2', body: [
    'Esta letra es la mía. No recuerdo haberlo escrito.',
    '<i>«Ya has estado aquí antes. El tren solo para si llevas el billete marcado. No mires atrás en la escalera.»</i>',
  ] },
};
const NOTE_IDS = Object.keys(NOTES);
const Notes = {
  found: [], cur: null,
  load(list) { this.found = Array.isArray(list) ? list.filter((id) => NOTES[id]) : []; },
  read(id, fromInv) {
    const n = NOTES[id]; if (!n) return;
    if (!Game.openUI('note')) return;
    if (!this.found.includes(id)) { this.found.push(id); if (!fromInv) Hud.msg('Nota añadida al inventario', 2.5); }
    if (!Flags['note_' + id]) setFlag('note_' + id);
    this.cur = id; AudioSys.paper();
    $('noteTitle').textContent = n.title;
    $('noteBody').innerHTML = n.body.map((p) => `<p>${p}</p>`).join('');
    $('noteView').classList.remove('hidden');
    Save.write();
  },
  hide() { $('noteView').classList.add('hidden'); this.cur = null; },
};
