/* Joum 4D Build – Foto-Werkzeuge im Studio
   1) Vorher/Nachher-Schieberegler: dein Raumfoto ↔ dein Entwurf (3D-Bild mit Boden, Wänden, Möbeln).
   2) Möbel auf dem Foto wegradieren (wie IKEA Kreativ): mit dem Finger übermalen → App füllt mit der Umgebung
      (im Gerät, kostenlos; für fotorealistisches Ergebnis später KI-Server).
   3) Ähnliches finden: Foto an Google Lens teilen oder Suche in Shops mit Name + Maßen. */

/* ---------- 1) Vorher / Nachher ---------- */
let VN = { bild: null, key: '', pos: 50 };
function vnKarte(o, d) {
  const vorher = o.raumFotoLeer || o.raumFoto;
  return `<section class="karte" id="vn-karte"><h3>↔ Vorher / Nachher</h3>
    ${vorher ? `<div class="vn" id="vn"><img class="vn-vorher" src="${vorher}" alt="Vorher"><div class="vn-nachher" style="clip-path:inset(0 0 0 ${VN.pos}%)"><img id="vn-nachher" alt="Nachher" src="${VN.bild && VN.key === o.id + (losStatus(o).sel || 0) + o.stil ? VN.bild : ''}"></div><div class="vn-linie" style="left:${VN.pos}%"></div><span class="vn-l">Vorher</span><span class="vn-r">Nachher</span>
        <input type="range" min="0" max="100" value="${VN.pos}" data-ein="vnPos" data-sofort="1" aria-label="Vorher Nachher"></div>
      <div class="zeile wrap">${o.raumFotoLeer ? `<button class="chip" data-akt="vnLeerWeg" ${d}>Original-Foto nehmen</button>` : ''}<button class="chip" data-akt="radStart" ${d}>🧽 Möbel auf dem Foto wegradieren</button>${dateiKnopf('Anderes Foto', 'vnFoto', d.includes('data-p') ? { p: d.match(/data-p="([^"]*)"/)[1] } : { r: d.match(/data-r="([^"]*)"/)[1] }, { klasse: 'chip-knopf' })}<button class="chip" data-akt="vnSpeichern">⬇ Nachher-Bild speichern</button></div>`
    : `<p class="klein">Mach ein Foto von deinem Raum, wie er jetzt ist – dann siehst du mit dem Schieberegler Vorher und Nachher.</p>${dateiKnopf('Foto vom Raum', 'vnFoto', d.includes('data-p') ? { p: d.match(/data-p="([^"]*)"/)[1] } : { r: d.match(/data-r="([^"]*)"/)[1] }, { icon: ICON.kamera || '', klasse: 'voll' })}`}
  </section>`;
}
function vnNachherRendern(o, d) {
  const img = document.getElementById('vn-nachher'); if (!img || img.getAttribute('src')) return;
  lade3D().then(() => { try { const { v } = studioAktuell(d); const c = JSON.parse(JSON.stringify(o)); c.plan = v.plan; c.flaechen = flaechen(o); if (typeof dekoAnwenden === 'function') dekoAnwenden(o, c); window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE; VN.bild = raumBild(c, stilMix(o).stil); VN.key = o.id + (losStatus(o).sel || 0) + o.stil; img.src = VN.bild; } catch (e) {} });
}
EIN.vnPos = (v) => { VN.pos = +v; const n = document.querySelector('.vn-nachher'), l = document.querySelector('.vn-linie'); if (n) n.style.clipPath = `inset(0 0 0 ${v}%)`; if (l) l.style.left = v + '%'; };
EIN.vnFoto = (v, d, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 1200, (url) => aendern(() => { const o = studioObj(d); o.raumFoto = url; delete o.raumFotoLeer; }, 'Raumfoto')); };
AKT.vnLeerWeg = (d) => aendern(() => { delete studioObj(d).raumFotoLeer; }, 'Original-Foto');
AKT.vnSpeichern = () => { if (!VN.bild) { toast('Bild wird noch erstellt …'); return; } const a = document.createElement('a'); a.href = VN.bild; a.download = 'joum-nachher.jpg'; document.body.appendChild(a); a.click(); a.remove(); };

/* ---------- 2) Wegradieren ---------- */
let RAD = null;
AKT.radStart = (d) => {
  const o = studioObj(d), url = o.raumFoto; if (!url) return;
  const img = new Image(); img.onload = () => { RAD = { d, img, maske: null }; radZeigen(); }; img.src = url;
};
function radZeigen() {
  let ov = document.getElementById('rad-overlay');
  if (!ov) { ov = document.createElement('div'); ov.id = 'rad-overlay'; ov.className = 'fk-overlay an'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="fk-blatt" style="transform:none"><div class="zeile"><h2 style="flex:1;margin:0">Wegradieren</h2><button class="fk-zu" data-akt="radZu" aria-label="Schließen">✕</button></div>
    <p class="klein">Mit dem Finger über die Möbel malen, die weg sollen (rot). Dann „Radieren“.</p>
    <div class="mf-buehne"><canvas id="rad-flaeche"></canvas></div>
    <label class="feld">Pinselgröße<input type="range" id="rad-pinsel" min="10" max="80" value="34"></label>
    <div class="zeile wrap"><button class="btn" data-akt="radLos">🧽 Radieren</button><button class="btn hell" data-akt="radNeu">Maske löschen</button><button class="btn hell" data-akt="radKI">✨ Mit KI (besser)</button></div>
    <p class="klein grau">Im Gerät: gut für Wände und Böden mit ruhigem Muster. Fotorealistisch (Holzmaserung, Licht, Schatten) mit dem KI-Server.</p></div>`;
  const cv = document.getElementById('rad-flaeche'), img = RAD.img, Wd = Math.min(ov.querySelector('.fk-blatt').clientWidth - 32, 700), k = Math.min(1, 900 / Math.max(img.width, img.height));
  cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.style.width = Wd + 'px'; cv.style.height = Wd * cv.height / cv.width + 'px';
  const c = cv.getContext('2d'); c.drawImage(img, 0, 0, cv.width, cv.height);
  RAD.maske = document.createElement('canvas'); RAD.maske.width = cv.width; RAD.maske.height = cv.height; RAD.cv = cv;
  const mk = RAD.maske.getContext('2d');
  const zeichnen = () => { c.drawImage(RAD.quelle || img, 0, 0, cv.width, cv.height); c.globalAlpha = 0.45; c.drawImage(RAD.maske, 0, 0); c.globalAlpha = 1; };
  let an = false, last = null;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height]; };
  const malen = (p) => { const s = +document.getElementById('rad-pinsel').value * cv.width / Wd; mk.strokeStyle = mk.fillStyle = '#ff2a2a'; mk.lineWidth = s; mk.lineCap = 'round'; mk.beginPath(); mk.moveTo(...(last || p)); mk.lineTo(...p); mk.stroke(); last = p; zeichnen(); };
  cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); an = true; last = null; malen(pos(e)); };
  cv.onpointermove = (e) => { if (an) malen(pos(e)); };
  cv.onpointerup = () => { an = false; last = null; };
  RAD.zeichnen = zeichnen;
}
/* Füllen von außen nach innen (Zwiebelschalen) – jeder Pixel nimmt den Mittelwert seiner bekannten Nachbarn */
function inpaint(cv, maske) {
  const W = cv.width, H = cv.height, c = cv.getContext('2d'), im = c.getImageData(0, 0, W, H), d = im.data, m = maske.getContext('2d').getImageData(0, 0, W, H).data;
  const loch = new Uint8Array(W * H); let offen = 0;
  for (let i = 0; i < W * H; i++) if (m[i * 4 + 3] > 20) { loch[i] = 1; offen++; }
  const nb = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1], [-2, 0], [2, 0], [0, -2], [0, 2]];
  let runde = 0;
  while (offen > 0 && runde < 2000) {
    runde++; const neu = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (!loch[i]) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of nb) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (loch[j]) continue; r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; n++; }
      if (n >= 2) neu.push([i, r / n, g / n, b / n]);
    }
    if (!neu.length) break;
    neu.forEach(([i, r, g, b]) => { const z = (Math.random() - 0.5) * 6; d[i * 4] = r + z; d[i * 4 + 1] = g + z; d[i * 4 + 2] = b + z; loch[i] = 0; offen--; });
  }
  c.putImageData(im, 0, 0);
}
AKT.radLos = () => {
  if (!RAD) return; const cv = RAD.cv, q = document.createElement('canvas'); q.width = cv.width; q.height = cv.height; q.getContext('2d').drawImage(RAD.quelle || RAD.img, 0, 0, cv.width, cv.height);
  toast('Radiere …'); setTimeout(() => { inpaint(q, RAD.maske); RAD.quelle = q; RAD.maske.getContext('2d').clearRect(0, 0, cv.width, cv.height); RAD.zeichnen();
    const url = q.toDataURL('image/jpeg', 0.85); aendern(() => { studioObj(RAD.d).raumFotoLeer = url; }, 'Möbel wegradiert'); VN.bild = null; toast('Fertig – weitere Stellen übermalen oder schließen'); }, 30);
};
AKT.radNeu = () => { if (!RAD) return; RAD.maske.getContext('2d').clearRect(0, 0, RAD.cv.width, RAD.cv.height); RAD.zeichnen(); };
AKT.radZu = () => { const o = document.getElementById('rad-overlay'); if (o) o.remove(); RAD = null; render(); };
AKT.radKI = () => info(KONFIG.kiServer ? 'Wird an den Joum-KI-Server geschickt …' : 'Fotorealistisches Wegradieren (Holzmaserung, Licht, Schatten) übernimmt der Joum-KI-Server – kommt, sobald der Server läuft. Bis dahin radiert die App direkt im Handy.');

/* ---------- 3) Ähnliches finden ---------- */
const SHOPS = [['IKEA', (q) => 'https://www.ikea.com/de/de/search/?q=' + q], ['OTTO', (q) => 'https://www.otto.de/suche/' + q + '/'], ['home24', (q) => 'https://www.home24.de/suche/?query=' + q], ['XXXLutz', (q) => 'https://www.xxxlutz.de/s/?s=' + q], ['Amazon', (q) => 'https://www.amazon.de/s?k=' + q], ['Google Shopping', (q) => 'https://www.google.com/search?tbm=shop&q=' + q], ['Kleinanzeigen (gebraucht)', (q) => 'https://www.kleinanzeigen.de/s-' + q.replace(/%20/g, '-') + '/k0']];
function aehnlichZeigen(name, spec, foto) {
  const q = encodeURIComponent((name.replace(/\(Foto\)|Mein /g, '') + (spec ? ' ' + spec[2] + ' cm' : '')).trim());
  let ov = document.getElementById('ae-overlay'); if (!ov) { ov = document.createElement('div'); ov.id = 'ae-overlay'; ov.className = 'fk-overlay an'; ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); }
  ov.innerHTML = `<div class="fk-blatt" style="transform:none"><div class="zeile"><h2 style="flex:1;margin:0">Ähnliches finden</h2><button class="fk-zu" data-akt="aeZu" aria-label="Schließen">✕</button></div>
    <p class="klein"><b>${esc(name)}</b>${spec ? ` · ${spec[2]} × ${spec[3]} × ${spec[4]} cm` : ''}</p>
    ${foto ? `<button class="mk-foto-knopf" data-akt="aeLens"><span>🔍</span><span><b>Per Foto suchen (Google Lens)</b><small>Foto teilen → „Google Lens“ wählen – findet genau dieses Möbel und ähnliche in Shops</small></span></button>` : ''}
    <div class="unter">In Shops suchen</div><div class="mk-liste">${SHOPS.map(([n, f]) => `<a class="mk-item" href="${f(q)}" target="_blank" rel="noopener noreferrer"><span style="flex:1"><b>${n}</b><small>„${esc(decodeURIComponent(q))}“</small></span><span class="mk-plus">↗</span></a>`).join('')}</div>
    <p class="klein grau">Tipp: Maße im Shop vergleichen – die App prüft danach, ob es in deinen Raum passt. Preisvergleich direkt in der App kommt mit dem Server.</p></div>`;
  ov._foto = foto; ov._name = name;
}
AKT.aeZu = () => { const o = document.getElementById('ae-overlay'); if (o) o.remove(); };
AKT.aeLens = async () => {
  const ov = document.getElementById('ae-overlay'); if (!ov || !ov._foto) return;
  try { const blob = await (await fetch(ov._foto)).blob(); const file = new File([blob], 'moebel.jpg', { type: blob.type || 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: ov._name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  info('Teilen von Fotos geht hier nicht. Öffne die Google-App → Kamera-Symbol (Lens) → Foto aus der Galerie wählen.');
};
/* „Ähnliches finden / Kaufen“ in jedem Teil-Dialog */
const aeAltTeil = AKT.studioTeil;
AKT.studioTeil = (d) => {
  const o = studioObj(d), t = (losStatus(o).fotoTeile || {})[d.n], spec = EXTRA_SPECS[d.n] || (typeof specFuer === 'function' ? specFuer(o, d.n) : null);
  dialog('„' + d.n + '“', [['🛒 Ähnliches finden / kaufen', () => aehnlichZeigen(d.n, spec, t ? t.foto : null)], ['Ändern …', () => setTimeout(() => aeAltTeil(d), 50)], ['Abbrechen', null]]);
};
