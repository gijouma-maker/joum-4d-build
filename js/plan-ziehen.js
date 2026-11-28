/* Joum 4D Build – Möbel im 2D-Plan mit dem Finger verschieben (wie Planner 5D / RoomSketcher: Drag & Drop)
   Antippen = auswählen → Drehen / Ändern / Zurücksetzen. Ziehen = verschieben, einrasten an Wänden (5 cm Raster).
   Danach prüft die App sofort: Tür frei? Überschneidung? Vor dem Fenster? – und zeigt es als Warnung. Gespeichert je Idee. */

function planKey(k, n, i) { return k + '|' + n + '|' + i; }
/* nach losBauen: verschobene/gedrehte Teile übernehmen und prüfen */
function planZiehenAnwenden(o, konzept, r) {
  const Z = losStatus(o).zieh; if (!Z) return;
  const zaehl = {};
  r.plan.forEach((e) => {
    if (e.gruppe) return;
    const i = zaehl[e.n] = (zaehl[e.n] || 0) + 1, z = Z[planKey(konzept, e.n, i)];
    if (!z) return;
    const ax = e.x, ay = e.y;
    if (z.rot != null) e.rot = z.rot;
    const f = fussabdruck(e);
    e.x = Math.max(0, Math.min(o.breite - f.w, z.x)); e.y = Math.max(0, Math.min(o.tiefe - f.h, z.y)); e.vonHand = true;
    r.plan.filter((c) => c.gruppe === e.id).forEach((c) => { c.x += e.x - ax; c.y += e.y - ay; });
    // prüfen
    const fe = fussabdruck(e), tz = tuerZone(o);
    let grund = '';
    if (ebene(e.n) === 'boden' && !/Teppich|Spielecke|Yoga|Matten/.test(e.n) && schneidet(fe, tz)) grund = 'blockiert jetzt die Tür';
    else { const k = r.plan.find((x) => x !== e && x.gruppe !== e.id && ebene(x.n) === ebene(e.n) && !/Teppich|Spielecke|Yoga|Matten/.test(x.n + e.n) && schneidet(fussabdruck(x), fe)); if (k) grund = 'überschneidet sich mit „' + k.n + '“'; }
    if (!grund && typeof fensterKonflikt === 'function' && fensterKonflikt(o, fe, e.n, e.h, ebene(e.n))) grund = 'steht jetzt vor dem Fenster';
    if (grund) r.ergebnis.push({ n: e.n, ok: false, grund: 'Von Hand verschoben – ' + grund, tipp: 'Ziehen, bis die Warnung weg ist, oder „Zurücksetzen“.' });
  });
}

let PZ = { sel: null };
const vorPZRender = render;
render = function () {
  vorPZRender();
  const box = document.querySelector('.studio-plan'), q = document.querySelector('[data-akt="studioStift"]');
  if (!box || !q) return;
  const svg = box.querySelector('svg'); if (!svg) return;
  const d = Object.assign({}, q.dataset), o = studioObj(d), konzept = box.dataset.k || '';
  const W = 320, sk = (W - 20) / Math.max(o.breite, o.tiefe);
  const zuSvg = (ev) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(ev.clientX - r.left) / r.width * vb.width, (ev.clientY - r.top) / r.height * vb.height]; };
  if (!box.querySelector('.pz-hinweis')) box.insertAdjacentHTML('beforeend', '<div class="pz-hinweis klein grau">Tipp: Möbel antippen oder mit dem Finger verschieben</div>');
  if (PZ.sel && PZ.sel.k === konzept) { const el = svg.querySelector(`rect[data-n="${CSS.escape(PZ.sel.n)}"][data-i="${PZ.sel.i}"]`); if (el) { el.setAttribute('stroke', '#f28c28'); el.setAttribute('stroke-width', '3'); pzLeiste(box, d, konzept); } }
  let drag = null;
  svg.addEventListener('pointerdown', (ev) => {
    if (box.classList.contains('stift-an')) return;
    const rect = ev.target.closest('rect[data-n]'); if (!rect) return;
    ev.preventDefault(); svg.setPointerCapture(ev.pointerId);
    const txt = rect.nextElementSibling && rect.nextElementSibling.tagName === 'text' ? rect.nextElementSibling : null;
    drag = { rect, txt, start: zuSvg(ev), dx: 0, dy: 0, n: rect.dataset.n, i: +rect.dataset.i, x: +rect.dataset.x, y: +rect.dataset.y, w: +rect.dataset.w, h: +rect.dataset.h };
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const [px, py] = zuSvg(ev); drag.dx = px - drag.start[0]; drag.dy = py - drag.start[1];
    // in cm, 5-cm-Raster, an Wände einrasten, im Raum halten
    let nx = Math.round((drag.x + drag.dx / sk) / 5) * 5, ny = Math.round((drag.y + drag.dy / sk) / 5) * 5;
    if (nx < 12) nx = 0; if (ny < 12) ny = 0; if (o.breite - (nx + drag.w) < 12) nx = o.breite - drag.w; if (o.tiefe - (ny + drag.h) < 12) ny = o.tiefe - drag.h;
    nx = Math.max(0, Math.min(o.breite - drag.w, nx)); ny = Math.max(0, Math.min(o.tiefe - drag.h, ny)); drag.nx = nx; drag.ny = ny;
    const tx = (nx - drag.x) * sk, ty = (ny - drag.y) * sk;
    drag.rect.setAttribute('transform', `translate(${tx} ${ty})`); if (drag.txt) drag.txt.setAttribute('transform', `translate(${tx} ${ty})`);
    drag.rect.setAttribute('stroke', '#f28c28'); drag.rect.setAttribute('stroke-width', '3');
  });
  const ende = () => {
    if (!drag) return; const dr = drag; drag = null;
    const L = losStatus(o), key = planKey(konzept, dr.n, dr.i);
    PZ.sel = { k: konzept, n: dr.n, i: dr.i };
    if (Math.hypot(dr.dx, dr.dy) < 3 || dr.nx == null) { render(); return; } // nur antippen
    // e.x/e.y = linke obere Ecke des Fußabdrucks
    aendern(() => { L.zieh = L.zieh || {}; L.zieh[key] = Object.assign({}, L.zieh[key] || {}, { x: dr.nx, y: dr.ny }); }, dr.n + ' verschoben');
  };
  svg.addEventListener('pointerup', ende); svg.addEventListener('pointercancel', ende);
};
function pzLeiste(box, d, konzept) {
  const s = PZ.sel; if (!s) return;
  const dd = d.p ? `data-p="${d.p}"` : `data-r="${d.r}"`;
  box.insertAdjacentHTML('beforeend', `<div class="pz-leiste"><b>${esc(s.n)}</b><button class="chip" data-akt="pzDrehen" ${dd}>↻ Drehen</button><button class="chip" data-akt="pzAendern" ${dd}>Ändern …</button><button class="chip" data-akt="pzZurueck" ${dd}>Zurücksetzen</button><button class="chip" data-akt="pzZu">✕</button></div>`);
}
AKT.pzZu = () => { PZ.sel = null; render(); };
AKT.pzDrehen = (d) => {
  const o = studioObj(d), L = losStatus(o), s = PZ.sel, key = planKey(s.k, s.n, s.i);
  const r = document.querySelector(`.studio-plan rect[data-n="${CSS.escape(s.n)}"][data-i="${s.i}"]`); if (!r) return;
  aendern(() => { L.zieh = L.zieh || {}; const alt = L.zieh[key] || { x: +r.dataset.x, y: +r.dataset.y }; L.zieh[key] = Object.assign({}, alt, { rot: ((alt.rot != null ? alt.rot : +r.dataset.rot) + 90) % 360 }); }, s.n + ' gedreht');
};
AKT.pzZurueck = (d) => { const o = studioObj(d), L = losStatus(o), s = PZ.sel; aendern(() => { if (L.zieh) delete L.zieh[planKey(s.k, s.n, s.i)]; }, s.n + ' zurückgesetzt'); };
AKT.pzAendern = (d) => AKT.studioTeil(Object.assign({}, d, { n: PZ.sel.n }));
