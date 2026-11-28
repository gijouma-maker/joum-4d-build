/* Joum 4D Build – Möbel im 2D-Plan frei verschieben und in jedem Winkel drehen (wie Planner 5D / RoomSketcher)
   – im Studio-Plan direkt oder groß im Vollbild-Editor („✋ Verschieben & drehen“)
   – Ziehen: 5-cm-Raster, rastet an Wänden ein · Antippen: auswählen → Drehen in 15°-Schritten, Regler 0–359°, 90°,
     Ändern, Zurücksetzen · Danach prüft die App sofort Tür, Überschneidung, Fenster. Gespeichert je Idee. */

function planKey(k, n, i) { return k + '|' + n + '|' + i; }
function planZiehenAnwenden(o, konzept, r) {
  const Z = losStatus(o).zieh; if (!Z) return;
  const zaehl = {};
  r.plan.forEach((e) => {
    if (e.gruppe) return;
    const i = zaehl[e.n] = (zaehl[e.n] || 0) + 1, z = Z[planKey(konzept, e.n, i)];
    if (!z) return;
    const ax = e.x, ay = e.y, f0 = fussabdruck(e);
    if (z.rot != null) e.rot = z.rot;
    const f = fussabdruck(e);
    const cx = z.cx != null ? z.cx : (z.x != null ? z.x + f0.w / 2 : ax + f0.w / 2), cy = z.cy != null ? z.cy : (z.y != null ? z.y + f0.h / 2 : ay + f0.h / 2);
    e.x = Math.round(Math.max(0, Math.min(o.breite - f.w, cx - f.w / 2))); e.y = Math.round(Math.max(0, Math.min(o.tiefe - f.h, cy - f.h / 2))); e.vonHand = true;
    r.plan.filter((c) => c.gruppe === e.id).forEach((c) => { c.x += e.x - ax; c.y += e.y - ay; });
    const fe = fussabdruck(e), tz = tuerZone(o), frei = /Teppich|Spielecke|Yoga|Matten/;
    let grund = '';
    if (ebene(e.n) === 'boden' && !frei.test(e.n) && schneidet(fe, tz)) grund = 'blockiert jetzt die Tür';
    else { const k = r.plan.find((x) => x !== e && x.gruppe !== e.id && ebene(x.n) === ebene(e.n) && !frei.test(x.n + e.n) && schneidet(fussabdruck(x), fe)); if (k) grund = 'überschneidet sich mit „' + k.n + '“'; }
    if (!grund && typeof fensterKonflikt === 'function' && fensterKonflikt(o, fe, e.n, e.h, ebene(e.n))) grund = 'steht jetzt vor dem Fenster';
    if (grund) r.ergebnis.push({ n: e.n, ok: false, grund: 'Von Hand verschoben – ' + grund, tipp: 'Weiter ziehen/drehen, bis die Warnung weg ist, oder „Zurücksetzen“.' });
  });
}

let PZ = { sel: null, voll: false };
function pzSpeichern(o, konzept, n, i, teil, grund) {
  const L = losStatus(o), key = planKey(konzept, n, i);
  aendern(() => { L.zieh = L.zieh || {}; L.zieh[key] = Object.assign({}, L.zieh[key] || {}, teil); delete L.zieh[key].x; delete L.zieh[key].y; }, grund);
}
function pzBinden(box, d, o, konzept) {
  const svg = box.querySelector('svg'); if (!svg) return;
  const W = 320, sk = (W - 20) / Math.max(o.breite, o.tiefe);
  const zuSvg = (ev) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(ev.clientX - r.left) / r.width * vb.width, (ev.clientY - r.top) / r.height * vb.height]; };
  if (PZ.sel && PZ.sel.k === konzept) { const el = svg.querySelector(`rect[data-n="${CSS.escape(PZ.sel.n)}"][data-i="${PZ.sel.i}"]`); if (el) { el.setAttribute('stroke', '#f28c28'); el.setAttribute('stroke-width', '3'); } }
  let drag = null;
  svg.addEventListener('pointerdown', (ev) => {
    if (box.classList.contains('stift-an')) return;
    const rect = ev.target.closest('rect[data-n]'); if (!rect) return;
    ev.preventDefault(); svg.setPointerCapture(ev.pointerId);
    const txt = rect.nextElementSibling && rect.nextElementSibling.tagName === 'text' ? rect.nextElementSibling : null;
    drag = { rect, txt, t0: rect.getAttribute('transform') || '', start: zuSvg(ev), dx: 0, dy: 0, n: rect.dataset.n, i: +rect.dataset.i, x: +rect.dataset.x, y: +rect.dataset.y, w: +rect.dataset.w, h: +rect.dataset.h };
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const [px, py] = zuSvg(ev); drag.dx = px - drag.start[0]; drag.dy = py - drag.start[1];
    let nx = Math.round((drag.x + drag.dx / sk) / 5) * 5, ny = Math.round((drag.y + drag.dy / sk) / 5) * 5;
    if (nx < 12) nx = 0; if (ny < 12) ny = 0; if (o.breite - (nx + drag.w) < 12) nx = o.breite - drag.w; if (o.tiefe - (ny + drag.h) < 12) ny = o.tiefe - drag.h;
    nx = Math.max(0, Math.min(o.breite - drag.w, nx)); ny = Math.max(0, Math.min(o.tiefe - drag.h, ny)); drag.nx = nx; drag.ny = ny;
    const tr = `translate(${(nx - drag.x) * sk} ${(ny - drag.y) * sk})`;
    drag.rect.setAttribute('transform', tr + ' ' + drag.t0); if (drag.txt) drag.txt.setAttribute('transform', tr);
    drag.rect.setAttribute('stroke', '#f28c28'); drag.rect.setAttribute('stroke-width', '3');
  });
  const ende = () => {
    if (!drag) return; const dr = drag; drag = null;
    PZ.sel = { k: konzept, n: dr.n, i: dr.i, rot: +dr.rect.dataset.rot || 0 };
    if (Math.hypot(dr.dx, dr.dy) < 3 || dr.nx == null) { render(); return; }
    pzSpeichern(o, konzept, dr.n, dr.i, { cx: dr.nx + dr.w / 2, cy: dr.ny + dr.h / 2 }, dr.n + ' verschoben');
  };
  svg.addEventListener('pointerup', ende); svg.addEventListener('pointercancel', ende);
}
function pzLeiste(d) {
  const s = PZ.sel; if (!s) return '';
  const dd = d.p ? `data-p="${d.p}"` : `data-r="${d.r}"`, rot = Math.round(s.rot || 0);
  return `<div class="pz-leiste"><b>${esc(s.n)} · ${rot}°</b>
    <button class="chip" data-akt="pzDreh" ${dd} data-w="-15">↺ 15°</button><button class="chip" data-akt="pzDreh" ${dd} data-w="15">↻ 15°</button><button class="chip" data-akt="pzDreh" ${dd} data-w="90">↻ 90°</button>
    <label class="pz-winkel">Winkel<input type="range" min="0" max="355" step="5" value="${((rot % 360) + 360) % 360}" data-ein="pzWinkel" data-sofort="1" ${dd}></label>
    <button class="chip" data-akt="pzAendern" ${dd}>Ändern …</button><button class="chip" data-akt="pzZurueck" ${dd}>Zurücksetzen</button><button class="chip" data-akt="pzZu">✕</button></div>`;
}
const vorPZRender = render;
render = function () {
  vorPZRender();
  const q = document.querySelector('[data-akt="studioStift"]');
  const alt = document.getElementById('pz-voll'); if (alt && (!q || !PZ.voll)) alt.remove();
  if (!q) return;
  const box = document.querySelector('.studio-plan'); if (!box) return;
  const d = Object.assign({}, q.dataset), o = studioObj(d), konzept = box.dataset.k || '';
  if (PZ.sel && PZ.sel.k === konzept) { const el = box.querySelector(`rect[data-n="${CSS.escape(PZ.sel.n)}"][data-i="${PZ.sel.i}"]`); if (el) PZ.sel.rot = +el.dataset.rot || 0; else PZ.sel = null; }
  if (!box.querySelector('.pz-hinweis')) box.insertAdjacentHTML('afterend', `<div class="pz-hinweis"><button class="btn hell voll" data-akt="pzVoll">✋ Möbel verschieben & drehen (groß)</button><span class="klein grau">oder direkt hier im Plan ziehen / antippen</span></div>${PZ.voll ? '' : pzLeiste(d)}`);
  pzBinden(box, d, o, konzept);
  if (PZ.voll) {
    let ov = document.getElementById('pz-voll');
    if (!ov) { ov = document.createElement('div'); ov.id = 'pz-voll'; ov.className = 'pz-voll'; document.body.appendChild(ov); }
    const { v } = studioAktuell(d);
    ov.innerHTML = `<div class="zeile pz-kopf"><b style="flex:1">Verschieben & drehen</b><button class="btn" data-akt="pzVollZu">Fertig</button></div>
      <p class="klein grau">Möbel ziehen · antippen zum Drehen. Warnungen erscheinen sofort.</p>
      <div class="studio-plan pz-gross" data-k="${esc(konzept)}">${raumSVG(o, v.plan)}</div>
      ${pzLeiste(d)}
      <ul class="los-pruef">${v.ergebnis.filter((x) => !x.ok).map((x) => `<li class="nein">✗ <b>${esc(x.n)}</b>: ${esc(x.grund)}</li>`).join('') || '<li class="ok">✓ Alles passt – Tür frei, keine Überschneidung.</li>'}</ul>`;
    pzBinden(ov.querySelector('.pz-gross'), d, o, konzept);
    const el = PZ.sel && ov.querySelector(`rect[data-n="${CSS.escape(PZ.sel.n)}"][data-i="${PZ.sel.i}"]`); if (el) PZ.sel.rot = +el.dataset.rot || 0;
  }
};
function pzRect() { const s = PZ.sel; if (!s) return null; const root = document.getElementById('pz-voll') || document; return root.querySelector(`rect[data-n="${CSS.escape(s.n)}"][data-i="${s.i}"]`); }
function pzDrehenAuf(d, grad) {
  const o = studioObj(d), s = PZ.sel, r = pzRect(); if (!s || !r) return;
  const cx = +r.dataset.x + +r.dataset.w / 2, cy = +r.dataset.y + +r.dataset.h / 2, g = ((Math.round(grad) % 360) + 360) % 360;
  s.rot = g; pzSpeichern(o, s.k, s.n, s.i, { rot: g, cx, cy }, s.n + ' gedreht');
}
AKT.pzVoll = () => { PZ.voll = true; render(); };
AKT.pzVollZu = () => { PZ.voll = false; render(); };
AKT.pzZu = () => { PZ.sel = null; render(); };
AKT.pzDreh = (d) => pzDrehenAuf(d, (PZ.sel.rot || 0) + Number(d.w));
let PZ_T = null;
EIN.pzWinkel = (v, d) => {
  const r = pzRect(); if (r) { const t = (r.getAttribute('transform') || '').replace(/rotate\([^)]*\)/, ''); const b = r.getBBox(); r.setAttribute('transform', `${t} rotate(${v} ${b.x + b.width / 2} ${b.y + b.height / 2})`.trim()); }
  const lb = document.querySelector('.pz-leiste b'); if (lb && PZ.sel) lb.textContent = PZ.sel.n + ' · ' + v + '°';
  clearTimeout(PZ_T); PZ_T = setTimeout(() => pzDrehenAuf(d, +v), 350);
};
AKT.pzZurueck = (d) => { const o = studioObj(d), L = losStatus(o), s = PZ.sel; aendern(() => { if (L.zieh) delete L.zieh[planKey(s.k, s.n, s.i)]; }, s.n + ' zurückgesetzt'); };
AKT.pzAendern = (d) => AKT.studioTeil(Object.assign({}, d, { n: PZ.sel.n }));
