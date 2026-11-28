/* Joum 4D Build – Ganze Wohnung / Objekt als Grundriss (wie Planner 5D / RoomSketcher / magicplan)
   • Grundriss-Foto hinterlegen, Maßstab setzen (zwei Punkte + echte Länge), Räume darüberlegen
   • Räume verschieben (rasten aneinander ein), drehen, Größe ändern, Möbel aus dem Studio erscheinen
   • Türen zwischen Räumen automatisch, wo Räume aneinanderstoßen (an/aus), Haustür festlegen
   • 3D: Puppenhaus · Von außen (Fassade, Dach ab/auf) · Durchlaufen (Ich-Perspektive, nur durch Türen)
   • Haus außen aus diesem Grundriss · PDF · Teilen */

function wohnung() { S.wohnung = S.wohnung || { raeume: [] }; return S.wohnung; }
function wRaumObj(w) { return w.p ? projekt(w.p) : entwurf(w.r); }
function wMasse(w) { const o = wRaumObj(w); if (!o) return { B: 300, T: 300 }; return w.dreh ? { B: o.tiefe, T: o.breite } : { B: o.breite, T: o.tiefe }; }
function wName(w) { const o = wRaumObj(w); return (raum(o ? o.raum : w.r) || {}).name || 'Raum'; }
let WCACHE = {};
function wVar(w) { if (!(w.id in WCACHE)) { try { WCACHE[w.id] = wRaumObj(w) ? studioAktuell(w.p ? { p: w.p } : { r: w.r }).v : null; } catch (e) { WCACHE[w.id] = null; } } return WCACHE[w.id]; }
function wPlan(w) { const v = wVar(w); return v ? v.plan : []; }
function wTeile(w) {
  const o = wRaumObj(w); if (!o) return [];
  return wPlan(w).filter((e) => !e.gruppe && ebene(e.n) === 'boden').map((e) => { const f = fussabdruck(e); return Object.assign({ n: e.n, g: e.g, h3: e.h }, w.dreh ? { x: o.tiefe - (f.y + f.h), y: f.x, w: f.h, h: f.w } : { x: f.x, y: f.y, w: f.w, h: f.h }); });
}
function wFenster(w) {
  const o = wRaumObj(w); if (!o || o.fenster === false || !(o.fensterPos || o.fenster === true)) return null;
  const F = o.fensterPos || { wand: 0, b: Math.min(120, o.breite * 0.4), s: o.breite * 0.2 }, wand = w.dreh ? (F.wand + 1) % 4 : F.wand;
  return { wand, s: F.s, b: F.b, tuer: F.typ === 'tuer' };
}
function wKanten(w) { const m = wMasse(w), x = w.x, y = w.y; return [[x, y, x + m.B, y, 0], [x + m.B, y, x + m.B, y + m.T, 1], [x, y + m.T, x + m.B, y + m.T, 2], [x, y, x, y + m.T, 3]]; }
function wTueren() {
  const W = wohnung(), R = W.raeume, aus = new Set(W.tuerAus || []), t = [];
  const ueber = (a1, a2, b1, b2) => [Math.max(a1, b1), Math.min(a2, b2)];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j], A = wMasse(a), Bm = wMasse(b), key = [a.id, b.id].sort().join('|');
    let tuer = null;
    if (Math.abs(a.x + A.B - b.x) < 8 || Math.abs(b.x + Bm.B - a.x) < 8) { const [u1, u2] = ueber(a.y, a.y + A.T, b.y, b.y + Bm.T); if (u2 - u1 >= 90) tuer = { senk: true, x: Math.abs(a.x + A.B - b.x) < 8 ? a.x + A.B : a.x, y: (u1 + u2) / 2 }; }
    else if (Math.abs(a.y + A.T - b.y) < 8 || Math.abs(b.y + Bm.T - a.y) < 8) { const [u1, u2] = ueber(a.x, a.x + A.B, b.x, b.x + Bm.B); if (u2 - u1 >= 90) tuer = { senk: false, y: Math.abs(a.y + A.T - b.y) < 8 ? a.y + A.T : a.y, x: (u1 + u2) / 2 }; }
    if (tuer) t.push(Object.assign(tuer, { key, a: a.id, b: b.id, an: !aus.has(key), breite: 85 }));
  }
  const E = R.find((w) => w.id === W.eingang);
  if (E) { const m = wMasse(E); t.push({ key: 'eingang', a: E.id, b: null, an: true, haus: true, senk: false, x: E.x + m.B / 2, y: E.y + m.T, breite: 100 }); }
  return t;
}
let WSEL = null, WMODUS = 'puppe', WKAL = null;
route('wohnung', () => {
  WCACHE = {};
  const W = wohnung(), R = W.raeume, T = wTueren();
  const flaeche = R.reduce((s, w) => { const m = wMasse(w); return s + m.B * m.T / 10000; }, 0);
  const kosten = R.reduce((s, w) => { const v = wVar(w); return v ? [s[0] + v.kosten.min, s[1] + v.kosten.max] : s; }, [0, 0]);
  const sel = R.find((w) => w.id === WSEL), sm = sel && wMasse(sel);
  nachRender(() => { wohnungZiehen(); const b = document.getElementById('w3d'); if (b && !b.hidden) lade3D().then(() => wohnung3D(b)); });
  const innen = RAEUME.filter((r) => r.bereich === 'innen' || r.id === 'garage');
  return kopf('Ganze Wohnung', 'Grundriss · Türen · 3D · Durchlaufen', '#/projekte') + `<div class="inhalt wohnung">
    ${R.length || W.bild ? `<div class="w-plan ${WKAL ? 'kalib' : ''}" id="w-plan">${wohnungSVG()}</div>
      <p class="klein grau" style="text-align:center">${WKAL ? `<b>Maßstab:</b> ${WKAL.p.length === 0 ? 'Tippe auf den Anfang einer bekannten Strecke im Grundriss' : 'Jetzt auf das Ende der Strecke tippen'}` : 'Räume mit dem Finger verschieben – sie rasten ein. Antippen für mehr. Türen entstehen, wo Räume sich berühren.'}</p>
      ${sel ? `<div class="pz-leiste"><b>${esc(wName(sel))} · ${zahl(sm.B / 100)} × ${zahl(sm.T / 100)} m</b>
        <label class="feld mini">Breite m<input inputmode="decimal" data-ein="wMass" data-id="${sel.id}" data-k="B" value="${zahl(sm.B / 100)}"></label><label class="feld mini">Tiefe m<input inputmode="decimal" data-ein="wMass" data-id="${sel.id}" data-k="T" value="${zahl(sm.T / 100)}"></label>
        <a class="chip" href="#/studio/${esc((wRaumObj(sel) || {}).raum || sel.r)}${sel.p ? '?p=' + sel.p : ''}">Im Studio öffnen</a><button class="chip" data-akt="wDreh" data-id="${sel.id}">↻ Drehen</button><button class="chip ${W.eingang === sel.id ? 'an' : ''}" data-akt="wEingang" data-id="${sel.id}">Haustür hier</button><button class="chip" data-akt="wWeg" data-id="${sel.id}">Entfernen</button><button class="chip" data-akt="wSel" data-id="">✕</button></div>` : ''}
      <div class="w-zahlen"><div><span class="klein">Wohnfläche</span><b>${zahl(flaeche, 1)} m²</b></div><div><span class="klein">Räume / Türen</span><b>${R.length} / ${T.filter((t) => t.an).length}</b></div><div><span class="klein">Einrichtung ca.</span><b>${euro(Math.round(kosten[0] / 100) * 100)} – ${euro(Math.round(kosten[1] / 100) * 100)}</b></div></div>
      ${wUeberlappung() ? `<div class="hinweis klein">⚠ ${esc(wUeberlappung())} überlappen sich – etwas auseinanderziehen.</div>` : ''}
      ${T.filter((t) => !t.haus).length ? `<details class="karte"><summary>Türen (${T.filter((t) => t.an).length})</summary><div class="zeile wrap">${T.filter((t) => !t.haus).map((t) => `<button class="chip ${t.an ? 'an' : ''}" data-akt="wTuer" data-k="${t.key}">${t.an ? 'Tür' : 'Wand'}: ${esc(wName(R.find((w) => w.id === t.a)))} ↔ ${esc(wName(R.find((w) => w.id === t.b)))}</button>`).join('')}</div><p class="klein grau">Antippen: Tür an/aus. Haustür: Raum antippen → „Haustür hier“.</p></details>` : ''}
      <div class="w-modi">${[['puppe', 'Puppenhaus'], ['aussen', 'Von außen'], ['laufen', 'Durchlaufen']].map(([k, t]) => `<button class="chip ${WMODUS === k ? 'an' : ''}" data-akt="wModus" data-m="${k}">${t}</button>`).join('')}</div>
      <div class="studio-3d w-3d" id="w3d" ${W.zeig3d ? '' : 'hidden'}></div>
      <div class="zeile wrap"><button class="btn" data-akt="w3D">In 3D ansehen</button><button class="btn hell" data-akt="wHaus">Haus außen aus diesem Grundriss</button><a class="btn hell" href="#/druck?w=1">PDF</a><button class="btn hell" data-akt="wTeilen">Teilen</button></div>`
      : `<div class="hinweis">Setze deine Wohnung zusammen: Grundriss-Foto hinterlegen oder Räume unten antippen und mit dem Finger anordnen.</div>`}
    <section class="karte"><h3>Grundriss-Vorlage</h3>
      <p class="klein">Foto oder Screenshot vom Grundriss (Exposé, Bauplan, Skizze) hinterlegen – dann die Räume genau darüberlegen.</p>
      <div class="zeile wrap">${dateiKnopf(W.bild ? 'Anderes Bild' : 'Grundriss-Bild hinterlegen', 'wBild', {}, { icon: ICON.kamera || '', klasse: 'chip-knopf' })}
      ${W.bild ? `<button class="chip ${WKAL ? 'an' : ''}" data-akt="wKalib">Maßstab setzen</button><label class="feld mini">Deckkraft<input type="range" min="10" max="100" value="${W.bildDeck || 60}" data-ein="wDeck" data-sofort="1"></label><button class="chip" data-akt="wBildWeg">Bild entfernen</button>` : ''}</div>
      ${W.bild ? '<p class="klein grau">Maßstab: zwei Punkte einer bekannten Strecke antippen und die echte Länge eingeben. Automatisch erkennen lässt sich der Grundriss später mit dem KI-Server.</p>' : ''}
    </section>
    <section class="karte"><h3>＋ Raum hinzufügen</h3>
      ${S.projekte.filter((p) => p.bereich === 'innen' && !R.some((w) => w.p === p.id)).length ? `<div class="unter">Aus meinen Projekten</div><div class="zeile wrap">${S.projekte.filter((p) => p.bereich === 'innen' && !R.some((w) => w.p === p.id)).map((p) => `<button class="chip" data-akt="wNeu" data-p="${p.id}">${esc(p.name)}</button>`).join('')}</div>` : ''}
      <div class="unter">Neuer Raum</div><div class="zeile wrap">${innen.map((r) => `<button class="chip" data-akt="wNeu" data-r="${r.id}">${esc(r.name)}</button>`).join('')}</div>
    </section>
  </div>`;
});
function wGrenzen() {
  const W = wohnung(), R = W.raeume; let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
  R.forEach((w) => { const m = wMasse(w); x1 = Math.min(x1, w.x); y1 = Math.min(y1, w.y); x2 = Math.max(x2, w.x + m.B); y2 = Math.max(y2, w.y + m.T); });
  if (W.bild) { const bb = W.bildBreite || 1200; x1 = Math.min(x1, 0); y1 = Math.min(y1, 0); x2 = Math.max(x2, bb); y2 = Math.max(y2, bb * (W.bildVerh || 0.75)); }
  if (x1 > x2) { x1 = 0; y1 = 0; x2 = 400; y2 = 300; }
  return { x1: x1 - 60, y1: y1 - 60, x2: x2 + 60, y2: y2 + 60 };
}
function wohnungSVG() {
  const W = wohnung(), R = W.raeume, G = wGrenzen(), VW = 340, sk = VW / (G.x2 - G.x1), VH = (G.y2 - G.y1) * sk, X = (x) => (x - G.x1) * sk, Y = (y) => (y - G.y1) * sk;
  let s = `<svg viewBox="0 0 ${VW} ${VH}" class="w-svg" data-sk="${sk}" data-x1="${G.x1}" data-y1="${G.y1}"><rect width="${VW}" height="${VH}" fill="#101010"/>`;
  if (W.bild) s += `<image href="${W.bild}" x="${X(0)}" y="${Y(0)}" width="${(W.bildBreite || 1200) * sk}" height="${(W.bildBreite || 1200) * (W.bildVerh || 0.75) * sk}" opacity="${(W.bildDeck || 60) / 100}" preserveAspectRatio="none"/>`;
  R.forEach((w) => {
    const m = wMasse(w), o = wRaumObj(w), an = w.id === WSEL, boden = o && o.flaechen && o.flaechen.boden ? o.flaechen.boden.farbe : '#3a3530';
    s += `<g class="w-raum" data-id="${w.id}"><rect x="${X(w.x)}" y="${Y(w.y)}" width="${m.B * sk}" height="${m.T * sk}" fill="${boden}" fill-opacity="${W.bild ? 0.25 : 0.35}" stroke="${an ? '#f28c28' : '#fff'}" stroke-width="${an ? 3 : 2}"/>`;
    wTeile(w).forEach((t) => { s += `<rect x="${X(w.x + t.x)}" y="${Y(w.y + t.y)}" width="${Math.max(1, t.w * sk)}" height="${Math.max(1, t.h * sk)}" fill="${GRUPPEN_FARBE[t.g] || '#999'}" fill-opacity=".75" rx="1"/>`; });
    const F = wFenster(w); if (F) { const k = wKanten(w)[F.wand], L = F.wand % 2 ? m.T : m.B, a = F.s / L, b = (F.s + F.b) / L; s += `<line x1="${X(k[0] + (k[2] - k[0]) * a)}" y1="${Y(k[1] + (k[3] - k[1]) * a)}" x2="${X(k[0] + (k[2] - k[0]) * b)}" y2="${Y(k[1] + (k[3] - k[1]) * b)}" stroke="#7fd0ff" stroke-width="${F.tuer ? 5 : 4}"/>`; }
    const name = wName(w);
    s += `<text x="${X(w.x + m.B / 2)}" y="${Y(w.y + m.T / 2)}" text-anchor="middle" font-size="${Math.max(7, Math.min(12, m.B * sk / name.length * 1.5))}" fill="#fff" font-weight="700">${esc(name)}</text><text x="${X(w.x + m.B / 2)}" y="${Y(w.y + m.T / 2) + 12}" text-anchor="middle" font-size="8" fill="#ddd">${zahl(m.B * m.T / 10000, 1)} m²</text></g>`;
  });
  wTueren().filter((t) => t.an).forEach((t) => { const b = t.breite * sk / 2, c = t.haus ? '#f28c28' : '#ffd27a';
    s += t.senk ? `<line x1="${X(t.x)}" y1="${Y(t.y) - b}" x2="${X(t.x)}" y2="${Y(t.y) + b}" stroke="#101010" stroke-width="5"/><path d="M${X(t.x)} ${Y(t.y) - b} Q${X(t.x) + 2 * b} ${Y(t.y) - b} ${X(t.x) + 2 * b} ${Y(t.y) + b}" fill="none" stroke="${c}" stroke-width="1.2"/>`
      : `<line x1="${X(t.x) - b}" y1="${Y(t.y)}" x2="${X(t.x) + b}" y2="${Y(t.y)}" stroke="#101010" stroke-width="5"/><path d="M${X(t.x) - b} ${Y(t.y)} Q${X(t.x) - b} ${Y(t.y) + (t.haus ? 2 : -2) * b} ${X(t.x) + b} ${Y(t.y) + (t.haus ? 2 : -2) * b}" fill="none" stroke="${c}" stroke-width="1.2"/>`; });
  if (WKAL) WKAL.p.forEach(([x, y]) => { s += `<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="#f28c28"/>`; });
  return s + '</svg>';
}
function wUeberlappung() {
  const R = wohnung().raeume;
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = wMasse(R[i]), b = wMasse(R[j]); if (R[i].x < R[j].x + b.B - 5 && R[j].x < R[i].x + a.B - 5 && R[i].y < R[j].y + b.T - 5 && R[j].y < R[i].y + a.T - 5) return wName(R[i]) + ' und ' + wName(R[j]); }
  return '';
}
function wohnungZiehen() {
  const box = document.getElementById('w-plan'); if (!box) return; const svg = box.querySelector('svg');
  const sk = +svg.dataset.sk, x1 = +svg.dataset.x1, y1 = +svg.dataset.y1; let d = null;
  const pos = (e) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(e.clientX - r.left) / r.width * vb.width, (e.clientY - r.top) / r.height * vb.height]; };
  svg.addEventListener('pointerdown', (e) => {
    if (WKAL) { const [px, py] = pos(e); WKAL.p.push([px / sk + x1, py / sk + y1]); if (WKAL.p.length < 2) { render(); return; }
      const [[ax, ay], [bx, by]] = WKAL.p, dist = Math.hypot(bx - ax, by - ay); WKAL = null;
      setTimeout(() => { const ein = prompt('Wie lang ist diese Strecke in Wirklichkeit (in Metern)?', '4,00'); const m = parseZahl(ein || ''); if (m > 0.3 && dist > 5) aendern(() => { const W = wohnung(); W.bildBreite = Math.round((W.bildBreite || 1200) * (m * 100 / dist)); }, 'Maßstab gesetzt'); else render(); }, 30); return; }
    const g = e.target.closest('.w-raum'); if (!g) return; e.preventDefault(); svg.setPointerCapture(e.pointerId); const w = wohnung().raeume.find((x) => x.id === g.dataset.id); d = { g, w, s: pos(e), nx: w.x, ny: w.y, mv: 0 };
  });
  svg.addEventListener('pointermove', (e) => {
    if (!d) return; const [px, py] = pos(e), dx = (px - d.s[0]) / sk, dy = (py - d.s[1]) / sk; d.mv = Math.hypot(dx, dy);
    let nx = Math.round((d.w.x + dx) / 5) * 5, ny = Math.round((d.w.y + dy) / 5) * 5; const m = wMasse(d.w);
    wohnung().raeume.forEach((o) => { if (o === d.w) return; const b = wMasse(o);
      [o.x + b.B, o.x - m.B, o.x, o.x + b.B - m.B].forEach((z) => { if (Math.abs(nx - z) < 25) nx = z; });
      [o.y + b.T, o.y - m.T, o.y, o.y + b.T - m.T].forEach((z) => { if (Math.abs(ny - z) < 25) ny = z; }); });
    d.nx = nx; d.ny = ny; d.g.setAttribute('transform', `translate(${(nx - d.w.x) * sk} ${(ny - d.w.y) * sk})`);
  });
  const ende = () => { if (!d) return; const dd = d; d = null; if (dd.mv < 8) { WSEL = dd.w.id; render(); return; } aendern(() => { dd.w.x = dd.nx; dd.w.y = dd.ny; }, 'Raum verschoben'); WSEL = dd.w.id; };
  svg.addEventListener('pointerup', ende); svg.addEventListener('pointercancel', ende);
}
AKT.wNeu = (d) => aendern(() => {
  const W = wohnung(); if (d.r && W.raeume.some((w) => w.r === d.r && !w.p)) { toast('Diesen Raum gibt es schon – im Studio als Projekt speichern, um ihn zweimal zu haben'); return; }
  const neu = { id: 'w' + uid(), r: d.r || '', p: d.p || '', x: 0, y: 0, dreh: false };
  if (W.raeume.length) { let mx = -1e9, my = 0; W.raeume.forEach((w) => { const m = wMasse(w); if (w.x + m.B > mx) { mx = w.x + m.B; my = w.y; } }); neu.x = mx; neu.y = my; }
  W.raeume.push(neu); WSEL = neu.id;
}, 'Raum zur Wohnung');
AKT.wDreh = (d) => aendern(() => { const w = wohnung().raeume.find((x) => x.id === d.id); w.dreh = !w.dreh; }, 'Raum gedreht');
AKT.wWeg = (d) => aendern(() => { const W = wohnung(); W.raeume = W.raeume.filter((x) => x.id !== d.id); if (W.eingang === d.id) delete W.eingang; WSEL = null; }, 'Raum entfernt');
AKT.wSel = (d) => { WSEL = d.id || null; render(); };
AKT.wTuer = (d) => aendern(() => { const W = wohnung(); W.tuerAus = W.tuerAus || []; W.tuerAus = W.tuerAus.includes(d.k) ? W.tuerAus.filter((x) => x !== d.k) : W.tuerAus.concat([d.k]); }, 'Tür geändert');
AKT.wEingang = (d) => aendern(() => { const W = wohnung(); W.eingang = W.eingang === d.id ? null : d.id; }, 'Haustür');
EIN.wMass = (v, d) => { const n = parseZahl(v); if (!(n > 0.8 && n < 30)) { toast('Bitte in Metern, z. B. 3,40'); return; } aendern(() => { const w = wohnung().raeume.find((x) => x.id === d.id), o = wRaumObj(w); const k = (d.k === 'B') !== !!w.dreh ? 'breite' : 'tiefe'; o[k] = Math.round(n * 100); if (typeof losMasseAnpassen === 'function') losMasseAnpassen(o); }, 'Raumgröße'); };
EIN.wBild = (v, d, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 1600, (url) => { const i = new Image(); i.onload = () => { aendern(() => { const W = wohnung(); W.bild = url; W.bildVerh = i.height / i.width; W.bildBreite = W.bildBreite || 1200; W.bildDeck = 60; }, 'Grundriss hinterlegt'); toast('Jetzt „Maßstab setzen“: zwei Punkte einer bekannten Länge antippen'); }; i.src = url; }); };
AKT.wKalib = () => { WKAL = WKAL ? null : { p: [] }; render(); };
EIN.wDeck = (v) => { wohnung().bildDeck = +v; const im = document.querySelector('.w-svg image'); if (im) im.setAttribute('opacity', v / 100); clearTimeout(WKAL_T); WKAL_T = setTimeout(() => speichern(), 400); };
let WKAL_T = null;
AKT.wBildWeg = () => aendern(() => { const W = wohnung(); delete W.bild; delete W.bildVerh; }, 'Grundriss-Bild entfernt');
AKT.wModus = (d) => { WMODUS = d.m; wohnung().zeig3d = true; render(); };
AKT.w3D = () => { wohnung().zeig3d = true; render(); setTimeout(() => { const b = document.getElementById('w3d'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); };
AKT.wHaus = () => { const R = wohnung().raeume; if (!R.length) return; let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9; R.forEach((w) => { const m = wMasse(w); x1 = Math.min(x1, w.x); y1 = Math.min(y1, w.y); x2 = Math.max(x2, w.x + m.B); y2 = Math.max(y2, w.y + m.T); });
  aendern(() => { const h = haus(); h.B = Math.round((x2 - x1 + 50) / 50) / 2; h.T = Math.round((y2 - y1 + 50) / 50) / 2; }, 'Haus aus Grundriss'); geh('#/haus'); toast('Haus-Maße aus dem Grundriss übernommen (+ Außenwände)'); };

/* ---------- 3D: Puppenhaus · Von außen · Durchlaufen ---------- */
let WKAM = null;
function wohnung3D(box) {
  const T = window.THREE, Wd = box.clientWidth || 360, Hd = box.clientHeight || 320, W = wohnung(), R = W.raeume, G = wGrenzen(), modus = WMODUS;
  WCACHE = {};
  const r = new T.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(Wd, Hd); r.outputEncoding = T.sRGBEncoding; r.shadowMap.enabled = true; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.95;
  box.innerHTML = ''; box.appendChild(r.domElement);
  const sc = new T.Scene(); sc.background = new T.Color(modus === 'aussen' ? '#bcd7ea' : '#111'); const cx = (G.x1 + G.x2) / 200, cz = (G.y1 + G.y2) / 200, gr = Math.max(G.x2 - G.x1, G.y2 - G.y1) / 100;
  sc.add(new T.HemisphereLight(0xfff2e0, 0x5a4a3a, 0.8)); const so = new T.DirectionalLight(0xffe9cc, 0.75); so.position.set(cx + 6, 14, cz + 9); so.castShadow = true; Object.assign(so.shadow.camera, { left: -gr, right: gr, top: gr, bottom: -gr }); so.shadow.mapSize.set(2048, 2048); sc.add(so);
  const M = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: new T.Color(c), roughness: 0.85 }, o || {}));
  const glas = M('#9fd3ef', { transparent: true, opacity: 0.32, roughness: 0.05 });
  const kiste = (w, h, d, m, x, y, z) => { const me = new T.Mesh(new T.BoxGeometry(w, h, d), m && m.isMaterial ? m : M(m)); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; sc.add(me); return me; };
  if (modus === 'aussen') { const gras = new T.Mesh(new T.PlaneGeometry(200, 200), M('#7da35a')); gras.rotation.x = -Math.PI / 2; gras.position.set(cx, -0.01, cz); gras.receiveShadow = true; sc.add(gras); }
  const H = modus === 'puppe' ? 1.1 : 2.5, fassade = (S.haus && S.haus.fassade) || '#ece6dc';
  const tueren = wTueren().filter((t) => t.an), mauern = [];
  R.forEach((w) => {
    const o = wRaumObj(w), m = wMasse(w), B = m.B / 100, D = m.T / 100, x0 = w.x / 100, z0 = w.y / 100, F = o && o.flaechen, wg = o && o.raum === 'wintergarten';
    let bm = M(F && F.boden ? F.boden.farbe : '#b8916a');
    if (F && F.boden && window.musterBild) { const mb = musterBild(F.boden); const t = new T.CanvasTexture(mb.c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(B / mb.mx, D / mb.my); t.encoding = T.sRGBEncoding; bm = new T.MeshStandardMaterial({ map: t, roughness: 0.7 }); }
    const b = new T.Mesh(new T.PlaneGeometry(B, D), bm); b.rotation.x = -Math.PI / 2; b.position.set(x0 + B / 2, 0.01, z0 + D / 2); b.receiveShadow = true; b.userData.boden = true; sc.add(b);
    const wf = modus === 'aussen' ? fassade : ((F && F.waende && F.waende[0] && F.waende[0].farbe) || (stilMix(o).stil || {}).wand || '#ece8e1');
    const fen = wFenster(w);
    wKanten(w).forEach(([ax, ay, bx, by, seite]) => {
      const senk = ax === bx, L = senk ? by - ay : bx - ax, luecken = [];
      tueren.forEach((t) => { if (t.senk === senk && Math.abs((senk ? t.x : t.y) - (senk ? ax : ay)) < 8) { const c = (senk ? t.y : t.x) - (senk ? ay : ax); if (c > 0 && c < L) luecken.push([c - t.breite / 2, c + t.breite / 2, 'tuer']); } });
      if (fen && fen.wand === seite) luecken.push([fen.s, fen.s + fen.b, fen.tuer ? 'glastuer' : 'fenster']);
      luecken.sort((a, b2) => a[0] - b2[0]);
      let pos = 0; const teile = [];
      luecken.forEach(([a, e2, art]) => { if (a > pos) teile.push([pos, a]); pos = Math.max(pos, e2);
        const mitte = (a + e2) / 2 / 100, lb = (e2 - a) / 100, px = senk ? ax / 100 : ax / 100 + mitte, pz = senk ? ay / 100 + mitte : ay / 100;
        if (H > 2.1) kiste(senk ? 0.1 : lb, H - 2.1, senk ? lb : 0.1, wf, px, 2.1 + (H - 2.1) / 2, pz);
        if (art === 'fenster') { kiste(senk ? 0.1 : lb, Math.min(0.9, H), senk ? lb : 0.1, wf, px, Math.min(0.9, H) / 2, pz); if (H > 0.9) kiste(senk ? 0.04 : lb, Math.min(1.2, H - 0.9), senk ? lb : 0.04, glas, px, 0.9 + Math.min(1.2, H - 0.9) / 2, pz); }
        if (art === 'glastuer') kiste(senk ? 0.04 : lb, Math.min(2.1, H), senk ? lb : 0.04, glas, px, Math.min(2.1, H) / 2, pz);
        if (art !== 'tuer') mauern.push(senk ? [ax, ay + a, ax, ay + e2] : [ax + a, ay, ax + e2, ay]); });
      if (pos < L) teile.push([pos, L]);
      teile.forEach(([a, e2]) => { const lb = (e2 - a) / 100, mitte = (a + e2) / 2 / 100; kiste(senk ? 0.1 : lb + 0.1, H, senk ? lb + 0.1 : 0.1, wg ? glas : wf, senk ? ax / 100 : ax / 100 + mitte, H / 2, senk ? ay / 100 + mitte : ay / 100); mauern.push(senk ? [ax, ay + a, ax, ay + e2] : [ax + a, ay, ax + e2, ay]); });
    });
    if (wg && modus !== 'puppe') kiste(B, 0.04, D, glas, x0 + B / 2, H + 0.02, z0 + D / 2);
    if (modus !== 'aussen') wTeile(w).forEach((t) => { const hh = Math.min(2.2, (t.h3 || 60) / 100); kiste(t.w / 100 * 0.96, hh, t.h / 100 * 0.96, t.g === 'Möbel' ? (stilMix(o).moebel || '#9db8d9') : (GRUPPEN_FARBE[t.g] || '#aaa'), x0 + (t.x + t.w / 2) / 100, hh / 2, z0 + (t.y + t.h / 2) / 100); });
  });
  tueren.filter((t) => t.haus).forEach((t) => { kiste(1.0, 2.1, 0.06, '#5a3d2b', t.x / 100, 1.05, t.y / 100 + 0.05); if (modus === 'aussen') kiste(1.6, 0.06, 1.0, '#cfcac0', t.x / 100, 2.6, t.y / 100 + 0.5); });
  if (modus === 'aussen' && !W.dachAb) R.forEach((w) => { const m = wMasse(w), o = wRaumObj(w); if (o && o.raum === 'wintergarten') return; kiste(m.B / 100 + 0.2, 0.3, m.T / 100 + 0.2, '#4a4c4f', (w.x + m.B / 2) / 100, H + 0.15, (w.y + m.T / 2) / 100); });
  const cam = new T.PerspectiveCamera(modus === 'laufen' ? 70 : 45, Wd / Hd, 0.05, 300);
  if (modus === 'laufen') { wLaufen(box, r, sc, cam, mauern, T); return; }
  cam.position.set(cx + gr * 0.5, gr * (modus === 'aussen' ? 0.6 : 1.1), cz + gr * 1.1);
  const ctl = new T.OrbitControls(cam, r.domElement); ctl.target.set(cx, modus === 'aussen' ? 1.2 : 0, cz); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.48;
  if (modus === 'aussen') box.insertAdjacentHTML('beforeend', `<button class="studio-innen" data-akt="wDachAb">${W.dachAb ? 'Dach drauf' : 'Dach ab'}</button>`);
  const loop = () => { if (!r.domElement.isConnected) { r.dispose(); return; } ctl.update(); r.render(sc, cam); requestAnimationFrame(loop); }; loop();
}
AKT.wDachAb = () => { const W = wohnung(); W.dachAb = !W.dachAb; render(); };
/* Ich-Perspektive: nur durch Türen gehen, Wischen = umsehen, Pfeile = gehen, Boden antippen = hingehen */
function wLaufen(box, r, sc, cam, mauern, T) {
  const W = wohnung(), R = W.raeume, start = R.find((w) => w.id === W.eingang) || R[0]; if (!start) return;
  const m = wMasse(start); let px = (start.x + m.B / 2) / 100, pz = (start.y + m.T / 2) / 100, yaw = 0, pitch = 0;
  if (WKAM) ({ px, pz, yaw } = WKAM);
  const kreuzt = (ax, az, bx, bz) => mauern.some(([x1, y1, x2, y2]) => { x1 /= 100; y1 /= 100; x2 /= 100; y2 /= 100; const d = (bx - ax) * (y2 - y1) - (bz - az) * (x2 - x1); if (Math.abs(d) < 1e-9) return false; const u = ((x1 - ax) * (y2 - y1) - (y1 - az) * (x2 - x1)) / d, v = ((x1 - ax) * (bz - az) - (y1 - az) * (bx - ax)) / d; return u >= 0 && u <= 1 && v >= -0.02 && v <= 1.02; });
  const geh = (dist) => { const sx = -Math.sin(yaw), sz = -Math.cos(yaw), nx = px + sx * dist, nz = pz + sz * dist, ex = px + sx * (dist + Math.sign(dist) * 0.25), ez = pz + sz * (dist + Math.sign(dist) * 0.25);
    if (kreuzt(px, pz, ex, ez)) { toast('Wand – geh durch eine Tür'); try { navigator.vibrate && navigator.vibrate(20); } catch (e) {} return; } px = nx; pz = nz; WKAM = { px, pz, yaw }; };
  const raumHier = () => { const w = R.find((x) => { const mm = wMasse(x); return px * 100 >= x.x && px * 100 <= x.x + mm.B && pz * 100 >= x.y && pz * 100 <= x.y + mm.T; }); return w ? wName(w) : 'Draußen'; };
  box.insertAdjacentHTML('beforeend', '<div class="lauf-ort" id="lauf-ort"></div><div class="lauf-pad"><button data-l="v" aria-label="vor">▲</button><div><button data-l="l" aria-label="links drehen">◀</button><button data-l="z" aria-label="zurück">▼</button><button data-l="r" aria-label="rechts drehen">▶</button></div></div><p class="lauf-tipp">Wischen = umsehen · Boden antippen = hingehen</p>');
  const pad = box.querySelector('.lauf-pad'); let halt = null;
  const tu = (k) => { if (k === 'v') geh(0.35); if (k === 'z') geh(-0.35); if (k === 'l') yaw += 0.18; if (k === 'r') yaw -= 0.18; WKAM = { px, pz, yaw }; };
  pad.addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); e.stopPropagation(); tu(b.dataset.l); clearInterval(halt); halt = setInterval(() => tu(b.dataset.l), 140); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => pad.addEventListener(t, () => clearInterval(halt)));
  let zieh = null; const ray = new T.Raycaster();
  r.domElement.style.touchAction = 'none';
  r.domElement.addEventListener('pointerdown', (e) => { zieh = { x: e.clientX, y: e.clientY, yaw, pitch, mv: 0 }; r.domElement.setPointerCapture(e.pointerId); });
  r.domElement.addEventListener('pointermove', (e) => { if (!zieh) return; const dx = e.clientX - zieh.x, dy = e.clientY - zieh.y; zieh.mv = Math.hypot(dx, dy); yaw = zieh.yaw + dx * 0.006; pitch = Math.max(-0.6, Math.min(0.5, zieh.pitch + dy * 0.004)); });
  r.domElement.addEventListener('pointerup', (e) => {
    const z = zieh; zieh = null; if (!z || z.mv > 6) { WKAM = { px, pz, yaw }; return; }
    const rc = r.domElement.getBoundingClientRect(); ray.setFromCamera({ x: (e.clientX - rc.left) / rc.width * 2 - 1, y: -(e.clientY - rc.top) / rc.height * 2 + 1 }, cam);
    const hit = ray.intersectObjects(sc.children.filter((c) => c.userData.boden))[0]; if (!hit) return;
    const zx = hit.point.x, zz = hit.point.z; if (kreuzt(px, pz, zx, zz)) { toast('Da ist eine Wand dazwischen – geh durch die Tür'); return; }
    const sx = px, sz = pz, t0 = performance.now(); const anim = () => { const k = Math.min(1, (performance.now() - t0) / 600); px = sx + (zx - sx) * k; pz = sz + (zz - sz) * k; if (k < 1) requestAnimationFrame(anim); else WKAM = { px, pz, yaw }; }; anim();
  });
  const ort = box.querySelector('#lauf-ort'); let letzt = '';
  const loop = () => { if (!r.domElement.isConnected) { r.dispose(); return; } cam.position.set(px, 1.6, pz); cam.rotation.order = 'YXZ'; cam.rotation.y = yaw; cam.rotation.x = pitch; const n = raumHier(); if (n !== letzt) { letzt = n; ort.textContent = n; } r.render(sc, cam); requestAnimationFrame(loop); }; loop();
}
HILFE.w3D = 'Die Wohnung in 3D: Puppenhaus, von außen oder durchlaufen.';
HILFE.wModus = 'Puppenhaus = von oben hineinschauen · Von außen = Fassade und Dach · Durchlaufen = durch die Türen von Raum zu Raum gehen.';
