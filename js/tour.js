/* Joum 4D Build – Kino-Tour: aus Fotos (und 3D-Räumen) ein 15-Sekunden-Video im Hochformat
   Kamerafahrten (Heranfahren, Schwenken), Übergänge in Fahrtrichtung, Beschriftung, Abschlusskarte.
   Läuft komplett im Browser – keine Kosten, keine Uploads. */

const TOUR = { bilder: [], titel: 'Unser Projekt', format: '9:16', dauer: 15, laeuft: null, rec: null };
const TOUR_NAMEN = ['Außen', 'Eingang', 'Wohnzimmer', 'Küche', 'Bad', 'Schlafzimmer', 'Flur', 'Garten', 'Kinderzimmer', 'Büro'];

AKT.tourFotos = () => document.getElementById('tourDatei').click();
EIN.tourDatei = (v, d, el) => {
  const dateien = [...el.files].slice(0, 20 - TOUR.bilder.length);
  let offen = dateien.length;
  dateien.forEach((f, i) => bildVerkleinern(f, 1600, (url) => {
    const img = new Image(); img.onload = () => { TOUR.bilder.push({ id: uid(), img, url, name: TOUR_NAMEN[(TOUR.bilder.length) % TOUR_NAMEN.length] }); if (--offen === 0) render(); }; img.src = url;
  }));
};
EIN.tourName = (v, d) => { const b = TOUR.bilder.find((x) => x.id === d.id); if (b) b.name = v; };
EIN.tourTitel = (v) => { TOUR.titel = v; };
EIN.tourFormat = (v) => { TOUR.format = v; render(); };
EIN.tourDauer = (v) => { TOUR.dauer = Math.min(60, Math.max(6, parseZahl(v))); };
AKT.tourHoch = (d) => { const i = TOUR.bilder.findIndex((x) => x.id === d.id); if (i > 0) { const [b] = TOUR.bilder.splice(i, 1); TOUR.bilder.splice(i - 1, 0, b); render(); } };
AKT.tourWeg = (d) => { TOUR.bilder = TOUR.bilder.filter((x) => x.id !== d.id); render(); };
AKT.tour3D = (d) => {
  const p = projekt(d.id); if (!p || !window.raumBild) return;
  window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE;
  try {
    const url = raumBild(p, STILE.find((s) => s.id === p.stil));
    const img = new Image(); img.onload = () => { TOUR.bilder.push({ id: uid(), img, url, name: (raum(p.raum) || {}).name || 'Raum' }); render(); toast('3D-Bild hinzugefügt'); }; img.src = url;
  } catch (e) { info('3D-Bild nicht möglich (WebGL fehlt).'); }
};
AKT.tourBeispiel = () => {
  // Beispielbilder aus 3D-Räumen erzeugen (falls noch keine Fotos da sind)
  const mitPlan = S.projekte.filter((p) => p.plan && p.plan.length);
  if (!mitPlan.length) { info('Lege zuerst im Raumplaner einen Raum mit Möbeln an – oder füge eigene Fotos hinzu.'); return; }
  mitPlan.slice(0, 6).forEach((p) => AKT.tour3D({ id: p.id }));
};

function tourMasse() { return { '9:16': [540, 960], '1:1': [720, 720], '16:9': [960, 540], '4:5': [640, 800] }[TOUR.format] || [540, 960]; }

/* Kamerafahrten: Start/Ende von Zoom und Position */
const FAHRTEN = [
  { n: 'Heranfahren', z: [1.0, 1.22], x: [0, 0], y: [0, -0.02] },
  { n: 'Schwenk rechts', z: [1.12, 1.18], x: [-0.08, 0.08], y: [0, 0] },
  { n: 'Schwenk links', z: [1.12, 1.18], x: [0.08, -0.08], y: [0, 0] },
  { n: 'Aufsteigen', z: [1.15, 1.08], x: [0, 0], y: [0.05, -0.05] },
  { n: 'Durchfahren', z: [1.05, 1.35], x: [0.02, -0.02], y: [0.01, 0] }
];
const sanft = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));

function tourZeichnen(ctx, W, H, t, bilder, titel, gesamt) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const intro = 1.2, outro = 1.6, n = bilder.length;
  const je = (gesamt - intro - outro) / n, ueber = Math.min(0.55, je * 0.35);
  const malen = (b, k, fahrt, alpha, versatz) => {
    if (!b) return;
    const img = b.img, f = FAHRTEN[fahrt % FAHRTEN.length];
    const z = f.z[0] + (f.z[1] - f.z[0]) * k, ox = f.x[0] + (f.x[1] - f.x[0]) * k, oy = f.y[0] + (f.y[1] - f.y[0]) * k;
    // Hintergrund: unscharf und langsamer (Tiefenwirkung)
    ctx.save(); ctx.globalAlpha = alpha; ctx.filter = 'blur(18px) brightness(0.6)';
    const sh = Math.max(W / img.width, H / img.height) * 1.25;
    ctx.drawImage(img, (W - img.width * sh) / 2 + ox * W * 0.3 + versatz * 0.4, (H - img.height * sh) / 2, img.width * sh, img.height * sh);
    ctx.restore();
    // Vordergrund: füllend mit Kamerafahrt
    ctx.save(); ctx.globalAlpha = alpha; ctx.filter = 'contrast(1.07) saturate(1.12)';
    const s = Math.max(W / img.width, H / img.height) * z;
    const w = img.width * s, h = img.height * s;
    const spielX = Math.max(0, w - W) / 2, spielY = Math.max(0, h - H) / 2;
    ctx.drawImage(img, (W - w) / 2 - ox / 0.1 * spielX * 0.9 + versatz, (H - h) / 2 - oy / 0.05 * spielY * 0.5, w, h);
    ctx.restore();
  };
  const schrift = (text, y, gr, farbe, fett, alpha) => {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.font = (fett ? '600 ' : '500 ') + gr + 'px Jost, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.fillStyle = farbe || '#fff'; ctx.fillText(text, W / 2, y);
    ctx.restore();
  };
  if (t < intro) {
    malen(bilder[0], 0, 0, sanft(t / intro) * 0.9, 0);
    schrift(titel, H * 0.45, Math.round(W * 0.085), '#fff', true, sanft(t / 0.6));
    schrift('Joum 4D Build', H * 0.45 + W * 0.09, Math.round(W * 0.038), '#ffd27a', false, sanft((t - 0.3) / 0.6));
  } else if (t < gesamt - outro) {
    const tt = t - intro, i = Math.min(n - 1, Math.floor(tt / je)), k = (tt - i * je) / je;
    const rest = je - (tt - i * je);
    const richtung = (FAHRTEN[i % FAHRTEN.length].x[1] - FAHRTEN[i % FAHRTEN.length].x[0]) >= 0 ? -1 : 1;
    if (rest < ueber && i < n - 1) {
      // Übergang in Fahrtrichtung: altes Bild schiebt weg, neues kommt nach
      const u = sanft(1 - rest / ueber);
      malen(bilder[i], k, i, 1 - u * 0.4, u * W * 0.35 * richtung);
      malen(bilder[i + 1], 0, i + 1, u, (1 - u) * -W * 0.35 * richtung);
    } else malen(bilder[i], k, i, 1, 0);
    const name = bilder[i].name || '';
    const ein = sanft((tt - i * je) / 0.35), aus = sanft(rest / 0.3);
    if (name) {
      ctx.save(); ctx.globalAlpha = Math.min(ein, aus) * 0.55; ctx.fillStyle = '#000';
      const g = ctx.createLinearGradient(0, H * 0.7, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.7, W, H * 0.3); ctx.restore();
      schrift(name, H * 0.86, Math.round(W * 0.07), '#fff', true, Math.min(ein, aus));
    }
  } else {
    const k = (t - (gesamt - outro)) / outro;
    malen(bilder[n - 1], 1, n - 1, 1 - sanft(k) * 0.65, 0);
    schrift('Fertig.', H * 0.44, Math.round(W * 0.1), '#9fd69f', true, sanft(k / 0.5));
    schrift(titel, H * 0.44 + W * 0.1, Math.round(W * 0.045), '#fff', false, sanft((k - 0.2) / 0.5));
    schrift('Plan. Bau. Fertig. · Joum 4D Build', H * 0.9, Math.round(W * 0.032), '#ffd27a', false, sanft((k - 0.3) / 0.5));
  }
  // Vignette + Fortschritt
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(W * 0.05, H * 0.03, W * 0.9, 3);
  ctx.fillStyle = '#fff'; ctx.fillRect(W * 0.05, H * 0.03, W * 0.9 * Math.min(1, t / gesamt), 3);
}

function tourStarten(aufnehmen) {
  const c = document.getElementById('tourLeinwand'); if (!c || !TOUR.bilder.length) return;
  const [W, H] = tourMasse(); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const gesamt = Math.max(TOUR.dauer, TOUR.bilder.length * 1.4 + 2.8);
  const start = performance.now(), mein = {}; TOUR.laeuft = mein;
  const info2 = document.getElementById('tourInfo');
  let rec = null, teile = [];
  if (aufnehmen) {
    if (!c.captureStream || !window.MediaRecorder) { info2.textContent = 'Video speichern kann dieser Browser nicht – bitte Bildschirmaufnahme nutzen.'; }
    else {
      const typ = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((x) => MediaRecorder.isTypeSupported(x)) || '';
      rec = new MediaRecorder(c.captureStream(30), typ ? { mimeType: typ, videoBitsPerSecond: 6e6 } : undefined);
      rec.ondataavailable = (e) => e.data.size && teile.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(teile, { type: rec.mimeType || 'video/webm' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'joum4d-kino-tour.' + (/mp4/.test(blob.type) ? 'mp4' : 'webm');
        document.body.appendChild(a); a.click(); a.remove();
        info2.textContent = 'Video fertig (' + Math.round(blob.size / 1024) + ' KB). Falls kein Download startet: Bildschirmaufnahme nutzen.';
      };
      rec.start(); info2.textContent = 'Aufnahme läuft … ' + Math.round(gesamt) + ' Sekunden';
    }
  }
  function frame() {
    if (TOUR.laeuft !== mein || !c.isConnected) { if (rec && rec.state === 'recording') rec.stop(); return; }
    const t = (performance.now() - start) / 1000;
    tourZeichnen(ctx, W, H, Math.min(t, gesamt), TOUR.bilder, TOUR.titel, gesamt);
    if (t > gesamt + 0.3) { if (rec && rec.state === 'recording') rec.stop(); TOUR.laeuft = null; return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
AKT.tourAbspielen = () => tourStarten(false);
AKT.tourVideo = () => tourStarten(true);

route('tour', () => {
  const [W, H] = tourMasse();
  const mitPlan = S.projekte.filter((p) => p.plan && p.plan.length);
  nachRender(() => { const c = document.getElementById('tourLeinwand'); if (c && TOUR.bilder.length) { c.width = W; c.height = H; tourZeichnen(c.getContext('2d'), W, H, 1.3, TOUR.bilder, TOUR.titel, Math.max(TOUR.dauer, TOUR.bilder.length * 1.4 + 2.8)); } });
  return kopf('Kino-Tour', 'Aus Fotos ein 15-Sekunden-Video', '#/mehr') + `<div class="inhalt">
    <p class="klein">Fotos vom Haus und den Räumen auswählen (z. B. außen → Eingang → innen → Schlafzimmer → Flur → Küche). Die App macht daraus Kamerafahrten mit Übergängen in Fahrtrichtung, Beschriftung und Abschlusskarte – wie bei Immobilien-Reels.</p>
    <input type="file" accept="image/*" multiple hidden id="tourDatei" data-ein="tourDatei">
    <div class="zeile"><button class="btn hell" data-akt="tourFotos">${ICON.kamera} Fotos auswählen</button>${mitPlan.length ? '<button class="btn" data-akt="tourBeispiel">3D-Räume als Bilder</button>' : ''}</div>
    ${mitPlan.length ? `<div class="chips">${mitPlan.map((p) => `<button class="chip" data-akt="tour3D" data-id="${p.id}">+ 3D ${esc((raum(p.raum) || {}).name || p.name)}</button>`).join('')}</div>` : ''}
    <div class="tour-vorschau" style="aspect-ratio:${W}/${H}">${TOUR.bilder.length ? `<canvas id="tourLeinwand" aria-label="Vorschau der Kino-Tour"></canvas>` : '<div class="klein mitte" style="padding:40px 16px">Noch keine Bilder. Füge Fotos hinzu – oder Bilder aus deinen 3D-Räumen.</div>'}</div>
    ${TOUR.bilder.length ? `<div class="zeile"><button class="btn hell" data-akt="tourAbspielen">▶ Abspielen</button><button class="btn" data-akt="tourVideo">Als Video speichern</button></div>` : ''}
    <div class="klein" id="tourInfo"></div>
    <label class="feld">Titel<input value="${esc(TOUR.titel)}" data-ein="tourTitel"></label>
    <div class="raster2"><label class="feld">Format<select data-ein="tourFormat">${['9:16', '4:5', '1:1', '16:9'].map((f) => `<option ${TOUR.format === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
    <label class="feld">Länge (Sekunden)<input inputmode="numeric" value="${TOUR.dauer}" data-ein="tourDauer"></label></div>
    ${TOUR.bilder.length ? `<h3>Reihenfolge (${TOUR.bilder.length})</h3>${TOUR.bilder.map((b, i) => `<div class="liste-zeile"><img class="mini" src="${b.url}" alt=""><input class="tour-name" aria-label="Beschriftung" value="${esc(b.name)}" data-ein="tourName" data-id="${b.id}"><span class="klein">${FAHRTEN[i % FAHRTEN.length].n}</span>${i ? `<button class="x" aria-label="Nach oben" data-akt="tourHoch" data-id="${b.id}">↑</button>` : ''}<button class="x" aria-label="Entfernen" data-akt="tourWeg" data-id="${b.id}">×</button></div>`).join('')}` : ''}
    <div class="hinweis klein">Die Fotos bleiben auf deinem Gerät (kein Upload). Echte KI-Kamerafahrten <i>durch</i> ein Foto hindurch (neue Blickwinkel, Tiefe) brauchen ein KI-Videomodell auf einem Server – das ist der nächste Ausbau.</div>
  </div>`;
});
