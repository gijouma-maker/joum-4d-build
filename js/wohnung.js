/* Joum 4D Build – Ganze Wohnung: alle Räume zu einem Grundriss zusammensetzen (wie Planner 5D / RoomSketcher)
   Räume hinzufügen, mit dem Finger verschieben (rastet an anderen Räumen ein), drehen, öffnen im Studio.
   Möbel aus dem gewählten Studio-Vorschlag erscheinen im Grundriss. Wohnfläche, Kosten, 3D der ganzen Wohnung, PDF. */

function wohnung() { S.wohnung = S.wohnung || { raeume: [] }; return S.wohnung; }
function wRaumObj(w) { return w.p ? projekt(w.p) : entwurf(w.r); }
function wMasse(w) { const o = wRaumObj(w); if (!o) return { B: 300, T: 300 }; return w.dreh ? { B: o.tiefe, T: o.breite } : { B: o.breite, T: o.tiefe }; }
let WCACHE = {};
function wVar(w) { if (!(w.id in WCACHE)) { try { WCACHE[w.id] = wRaumObj(w) ? studioAktuell(w.p ? { p: w.p } : { r: w.r }).v : null; } catch (e) { WCACHE[w.id] = null; } } return WCACHE[w.id]; }
function wPlan(w) { const v = wVar(w); return v ? v.plan : []; }
/* Möbel-Fußabdruck im Wohnungs-Koordinatensystem (gedreht um 90° im Uhrzeigersinn, wenn w.dreh) */
function wTeile(w) {
  const o = wRaumObj(w); if (!o) return [];
  return wPlan(w).filter((e) => !e.gruppe && ebene(e.n) === 'boden').map((e) => {
    const f = fussabdruck(e);
    return w.dreh ? { n: e.n, g: e.g, x: o.tiefe - (f.y + f.h), y: f.x, w: f.h, h: f.w } : { n: e.n, g: e.g, x: f.x, y: f.y, w: f.w, h: f.h };
  });
}
let WSEL = null;
route('wohnung', () => {
  WCACHE = {};
  const W = wohnung(), R = W.raeume;
  const flaeche = R.reduce((s, w) => { const m = wMasse(w); return s + m.B * m.T / 10000; }, 0);
  const kosten = R.reduce((s, w) => { const v = wVar(w); return v ? [s[0] + v.kosten.min, s[1] + v.kosten.max] : s; }, [0, 0]);
  const sel = R.find((w) => w.id === WSEL);
  nachRender(() => wohnungZiehen());
  const innen = RAEUME.filter((r) => r.bereich === 'innen' || r.id === 'garage');
  return kopf('Ganze Wohnung', 'Alle Räume in einem Grundriss', '#/projekte') + `<div class="inhalt wohnung">
    ${R.length ? `<div class="w-plan" id="w-plan">${wohnungSVG()}</div>
      <p class="klein grau" style="text-align:center">Räume mit dem Finger verschieben – sie rasten an anderen Räumen ein. Antippen für mehr.</p>
      ${sel ? `<div class="pz-leiste"><b>${esc(wRaumObj(sel)?.name?.replace('Gestaltung – ', '') || raum(sel.r)?.name || 'Raum')} · ${zahl(wMasse(sel).B / 100)} × ${zahl(wMasse(sel).T / 100)} m</b>
        <a class="chip" href="#/studio/${esc(wRaumObj(sel)?.raum || sel.r)}${sel.p ? '?p=' + sel.p : ''}">Im Studio öffnen</a><button class="chip" data-akt="wDreh" data-id="${sel.id}">↻ Drehen</button><button class="chip" data-akt="wWeg" data-id="${sel.id}">Entfernen</button><button class="chip" data-akt="wSel" data-id="">✕</button></div>` : ''}
      <div class="w-zahlen"><div><span class="klein">Wohnfläche</span><b>${zahl(flaeche, 1)} m²</b></div><div><span class="klein">Räume</span><b>${R.length}</b></div><div><span class="klein">Einrichtung ca.</span><b>${euro(Math.round(kosten[0] / 100) * 100)} – ${euro(Math.round(kosten[1] / 100) * 100)}</b></div></div>
      ${wUeberlappung() ? `<div class="hinweis klein">⚠ ${esc(wUeberlappung())} überlappen sich – etwas auseinanderziehen.</div>` : ''}
      <div class="zeile wrap"><button class="btn" data-akt="w3D">🧊 Wohnung in 3D</button><a class="btn hell" href="#/druck?w=1">📄 PDF für Handwerker</a><button class="btn hell" data-akt="wTeilen">🔗 Teilen</button></div>
      <div class="studio-3d w-3d" id="w3d" hidden></div>` : `<div class="hinweis">Setze deine Räume zu einer Wohnung zusammen: Räume unten antippen – danach mit dem Finger anordnen.</div>`}
    <section class="karte"><h3>＋ Raum hinzufügen</h3>
      ${S.projekte.filter((p) => p.bereich === 'innen' && !R.some((w) => w.p === p.id)).length ? `<div class="unter">Aus meinen Projekten</div><div class="zeile wrap">${S.projekte.filter((p) => p.bereich === 'innen' && !R.some((w) => w.p === p.id)).map((p) => `<button class="chip" data-akt="wNeu" data-p="${p.id}">${esc(p.name)}</button>`).join('')}</div>` : ''}
      <div class="unter">Neuer Raum</div><div class="zeile wrap">${innen.map((r) => `<button class="chip" data-akt="wNeu" data-r="${r.id}">${esc(r.name)}</button>`).join('')}</div>
      <p class="klein grau">Größe änderst du im Studio unter „Dein Raum“ – der Grundriss passt sich an.</p>
    </section>
  </div>`;
});
function wGrenzen() {
  const R = wohnung().raeume; let x1 = 0, y1 = 0, x2 = 400, y2 = 300;
  R.forEach((w, i) => { const m = wMasse(w); if (i === 0) { x1 = w.x; y1 = w.y; x2 = w.x + m.B; y2 = w.y + m.T; } x1 = Math.min(x1, w.x); y1 = Math.min(y1, w.y); x2 = Math.max(x2, w.x + m.B); y2 = Math.max(y2, w.y + m.T); });
  return { x1: x1 - 60, y1: y1 - 60, x2: x2 + 60, y2: y2 + 60 };
}
function wohnungSVG() {
  const R = wohnung().raeume, G = wGrenzen(), VW = 340, sk = VW / (G.x2 - G.x1), VH = (G.y2 - G.y1) * sk;
  let s = `<svg viewBox="0 0 ${VW} ${VH}" class="w-svg" data-sk="${sk}" data-x1="${G.x1}" data-y1="${G.y1}"><rect width="${VW}" height="${VH}" fill="#101010"/>`;
  R.forEach((w) => {
    const m = wMasse(w), o = wRaumObj(w), X = (w.x - G.x1) * sk, Y = (w.y - G.y1) * sk, an = w.id === WSEL;
    const boden = o && o.flaechen && o.flaechen.boden ? o.flaechen.boden.farbe : '#3a3530';
    s += `<g class="w-raum" data-id="${w.id}"><rect x="${X}" y="${Y}" width="${m.B * sk}" height="${m.T * sk}" fill="${boden}" fill-opacity=".35" stroke="${an ? '#f28c28' : '#fff'}" stroke-width="${an ? 3 : 2}"/>`;
    wTeile(w).forEach((t) => { s += `<rect x="${X + t.x * sk}" y="${Y + t.y * sk}" width="${Math.max(1, t.w * sk)}" height="${Math.max(1, t.h * sk)}" fill="${GRUPPEN_FARBE[t.g] || '#999'}" fill-opacity=".8" rx="1"/>`; });
    const name = (raum(o ? o.raum : w.r) || {}).name || 'Raum';
    s += `<text x="${X + m.B * sk / 2}" y="${Y + m.T * sk / 2}" text-anchor="middle" font-size="${Math.max(7, Math.min(12, m.B * sk / name.length * 1.5))}" fill="#fff" font-weight="700">${esc(name)}</text><text x="${X + m.B * sk / 2}" y="${Y + m.T * sk / 2 + 12}" text-anchor="middle" font-size="8" fill="#ddd">${zahl(m.B * m.T / 10000, 1)} m²</text></g>`;
  });
  return s + '</svg>';
}
function wUeberlappung() {
  const R = wohnung().raeume;
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = wMasse(R[i]), b = wMasse(R[j]); if (R[i].x < R[j].x + b.B - 5 && R[j].x < R[i].x + a.B - 5 && R[i].y < R[j].y + b.T - 5 && R[j].y < R[i].y + a.T - 5) return (raum(wRaumObj(R[i])?.raum)?.name || 'Räume') + ' und ' + (raum(wRaumObj(R[j])?.raum)?.name || ''); }
  return '';
}
function wohnungZiehen() {
  const box = document.getElementById('w-plan'); if (!box) return; const svg = box.querySelector('svg');
  const sk = +svg.dataset.sk; let d = null;
  const pos = (e) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(e.clientX - r.left) / r.width * vb.width, (e.clientY - r.top) / r.height * vb.height]; };
  svg.addEventListener('pointerdown', (e) => { const g = e.target.closest('.w-raum'); if (!g) return; e.preventDefault(); svg.setPointerCapture(e.pointerId); const w = wohnung().raeume.find((x) => x.id === g.dataset.id); d = { g, w, s: pos(e), nx: w.x, ny: w.y, mv: 0 }; });
  svg.addEventListener('pointermove', (e) => {
    if (!d) return; const [px, py] = pos(e), dx = (px - d.s[0]) / sk, dy = (py - d.s[1]) / sk; d.mv = Math.hypot(dx, dy);
    let nx = Math.round((d.w.x + dx) / 10) * 10, ny = Math.round((d.w.y + dy) / 10) * 10; const m = wMasse(d.w);
    wohnung().raeume.forEach((o) => { if (o === d.w) return; const b = wMasse(o); // an Kanten anderer Räume einrasten
      [[o.x + b.B, nx], [o.x - m.B, nx], [o.x, nx], [o.x + b.B - m.B, nx]].forEach(([z]) => { if (Math.abs(nx - z) < 25) nx = z; });
      [[o.y + b.T], [o.y - m.T], [o.y], [o.y + b.T - m.T]].forEach(([z]) => { if (Math.abs(ny - z) < 25) ny = z; }); });
    d.nx = nx; d.ny = ny; d.g.setAttribute('transform', `translate(${(nx - d.w.x) * sk} ${(ny - d.w.y) * sk})`);
  });
  const ende = () => { if (!d) return; const dd = d; d = null; if (dd.mv < 8) { WSEL = dd.w.id; render(); return; } aendern(() => { dd.w.x = dd.nx; dd.w.y = dd.ny; }, 'Raum verschoben'); WSEL = dd.w.id; };
  svg.addEventListener('pointerup', ende); svg.addEventListener('pointercancel', ende);
}
AKT.wNeu = (d) => aendern(() => {
  const W = wohnung(); if (d.r && W.raeume.some((w) => w.r === d.r && !w.p)) { toast('Diesen Raum gibt es schon – im Studio als Projekt speichern, um ihn zweimal zu haben'); return; }
  const neu = { id: 'w' + uid(), r: d.r || '', p: d.p || '', x: 0, y: 0, dreh: false };
  const G = W.raeume.length ? wGrenzen() : null; if (G) { neu.x = G.x2 - 60 + 10; neu.y = G.y1 + 60; }
  W.raeume.push(neu); WSEL = neu.id;
}, 'Raum zur Wohnung');
AKT.wDreh = (d) => aendern(() => { const w = wohnung().raeume.find((x) => x.id === d.id); w.dreh = !w.dreh; }, 'Raum gedreht');
AKT.wWeg = (d) => aendern(() => { const W = wohnung(); W.raeume = W.raeume.filter((x) => x.id !== d.id); WSEL = null; }, 'Raum entfernt');
AKT.wSel = (d) => { WSEL = d.id || null; render(); };
AKT.w3D = () => { WCACHE = {}; const b = document.getElementById('w3d'); if (!b) return; b.hidden = false; b.scrollIntoView({ behavior: 'smooth', block: 'center' }); lade3D().then(() => wohnung3D(b)); };
function wohnung3D(box) {
  const T = window.THREE, W = box.clientWidth || 360, H = box.clientHeight || 320, R = wohnung().raeume, G = wGrenzen();
  const r = new T.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(W, H); r.outputEncoding = T.sRGBEncoding; r.shadowMap.enabled = true;
  box.innerHTML = ''; box.appendChild(r.domElement);
  const sc = new T.Scene(); sc.background = new T.Color('#111'); const cx = (G.x1 + G.x2) / 200, cz = (G.y1 + G.y2) / 200, gr = Math.max(G.x2 - G.x1, G.y2 - G.y1) / 100;
  sc.add(new T.HemisphereLight(0xffffff, 0x444444, 0.85)); const so = new T.DirectionalLight(0xffffff, 0.7); so.position.set(cx + 5, 12, cz + 8); so.castShadow = true; Object.assign(so.shadow.camera, { left: -gr, right: gr, top: gr, bottom: -gr }); so.shadow.mapSize.set(2048, 2048); sc.add(so);
  const M = (c) => new T.MeshStandardMaterial({ color: new T.Color(c), roughness: 0.8 });
  const kiste = (w, h, d, c, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; sc.add(m); };
  R.forEach((w) => {
    const o = wRaumObj(w), m = wMasse(w), B = m.B / 100, D = m.T / 100, x0 = w.x / 100, z0 = w.y / 100, F = o && o.flaechen;
    let mat = M(F && F.boden ? F.boden.farbe : '#b8916a');
    if (F && F.boden && window.musterBild) { const mb = musterBild(F.boden); const t = new T.CanvasTexture(mb.c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(B / mb.mx, D / mb.my); t.encoding = T.sRGBEncoding; mat = new T.MeshStandardMaterial({ map: t, roughness: 0.7 }); }
    const b = new T.Mesh(new T.PlaneGeometry(B, D), mat); b.rotation.x = -Math.PI / 2; b.position.set(x0 + B / 2, 0.01, z0 + D / 2); b.receiveShadow = true; sc.add(b);
    const wf = (F && F.waende && F.waende[0] && F.waende[0].farbe) || (stilMix(o).stil || {}).wand || '#ece8e1', h = 1.1;
    kiste(B, h, 0.1, wf, x0 + B / 2, h / 2, z0); kiste(B, h, 0.1, wf, x0 + B / 2, h / 2, z0 + D); kiste(0.1, h, D, wf, x0, h / 2, z0 + D / 2); kiste(0.1, h, D, wf, x0 + B, h / 2, z0 + D / 2);
    wTeile(w).forEach((t) => { const e = wPlan(w).find((x) => x.n === t.n) || {}; const hh = Math.min(2.2, (e.h || 60) / 100); kiste(t.w / 100 * 0.96, hh, t.h / 100 * 0.96, t.g === 'Möbel' ? (stilMix(o).moebel || '#9db8d9') : (GRUPPEN_FARBE[t.g] || '#aaa'), x0 + (t.x + t.w / 2) / 100, hh / 2, z0 + (t.y + t.h / 2) / 100); });
  });
  const cam = new T.PerspectiveCamera(45, W / H, 0.1, 200); cam.position.set(cx + gr * 0.4, gr * 1.1, cz + gr * 1.0);
  const ctl = new T.OrbitControls(cam, r.domElement); ctl.target.set(cx, 0, cz); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.48;
  const loop = () => { if (!r.domElement.isConnected) { r.dispose(); return; } ctl.update(); r.render(sc, cam); requestAnimationFrame(loop); }; loop();
}
HILFE.w3D = 'Die ganze Wohnung als 3D-Puppenhaus ansehen.';
