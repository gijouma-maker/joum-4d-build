/* Joum 4D Build – großer Möbel-Katalog (über 100 Möbel mit echten Standardmaßen und Preisrahmen)
   + „Möbel per Foto“: Foto machen, Möbel mit dem Finger umranden, Notizen draufzeichnen, Maße eintragen →
   genau dieses Möbel steht im Raum (Foto als Oberfläche, Farbe aus dem Foto), Regeln prüfen Tür/Fenster/Abstände.
   Nachbauen lassen: direkt „Schreiner fragen“. Erkennung/Ähnliches kaufen per KI-Server später. */

const MK = { // Kategorie: [Name, Gruppe, B, T, H, Hinweis, Preis min, Preis max]
  'Sofas': [['Sofa 2-Sitzer', 'Möbel', 170, 90, 82, '', 400, 1800], ['Sofa 3-Sitzer', 'Möbel', 220, 95, 82, '', 500, 2500], ['Ecksofa L-Form', 'Möbel', 270, 200, 82, 'Ecke links oder rechts wählbar.', 800, 3500], ['Wohnlandschaft U-Form', 'Möbel', 320, 220, 82, '', 1500, 5000], ['Schlafsofa', 'Möbel', 200, 95, 85, 'Ausgezogen ca. 140×200 – davor Platz lassen.', 400, 1800], ['Récamiere', 'Möbel', 180, 75, 80, '', 300, 1200], ['Modulsofa (3 Module)', 'Möbel', 270, 100, 75, 'Module frei umstellbar.', 1200, 4500]],
  'Sessel & Sitzen': [['Ohrensessel', 'Möbel', 80, 85, 105, '', 250, 1200], ['Lounge-Sessel mit Hocker', 'Möbel', 85, 140, 90, '', 400, 2500], ['Schaukelstuhl', 'Möbel', 65, 90, 95, '', 150, 600], ['Sitzsack', 'Möbel', 90, 90, 70, '', 60, 300], ['Pouf / Hocker', 'Möbel', 50, 50, 42, '', 40, 200], ['Sitzbank', 'Möbel', 140, 40, 45, '', 120, 600], ['Fensterbank-Sitz', 'Möbel', 120, 50, 45, 'Mit Stauraum darunter.', 200, 900]],
  'Tische': [['Couchtisch rechteckig', 'Möbel', 110, 60, 42, '', 80, 700], ['Couchtisch rund', 'Möbel', 80, 80, 40, '', 80, 600], ['Satztische (2er)', 'Möbel', 60, 60, 45, '', 80, 400], ['Beistelltisch', 'Möbel', 45, 45, 55, '', 30, 250], ['Esstisch 4 Pers.', 'Möbel', 120, 80, 75, 'Rundum 80–100 cm Platz für Stühle.', 150, 900], ['Esstisch 6 Pers.', 'Möbel', 180, 90, 75, 'Stühle kommen automatisch dazu.', 250, 1800], ['Esstisch 8 Pers.', 'Möbel', 240, 100, 75, '', 500, 3000], ['Esstisch rund 4 Pers.', 'Möbel', 110, 110, 75, '', 200, 1200], ['Ausziehtisch 6–10 Pers.', 'Möbel', 180, 90, 75, 'Ausgezogen bis ca. 280 cm.', 400, 2200], ['Konsolentisch', 'Möbel', 120, 35, 80, '', 80, 500], ['Schreibtisch', 'Möbel', 140, 70, 75, '', 120, 800], ['Schreibtisch höhenverstellbar', 'Möbel', 160, 80, 75, 'Elektrisch 65–125 cm.', 300, 1200], ['Sekretär / Wandschreibtisch', 'Möbel', 80, 40, 110, 'Klappe als Tisch – ideal für kleine Räume.', 150, 800]],
  'Stühle': [['Esszimmerstuhl', 'Möbel', 50, 55, 85, '', 50, 400], ['Freischwinger', 'Möbel', 50, 60, 85, '', 80, 450], ['Barhocker', 'Möbel', 45, 45, 105, '', 60, 350], ['Bürostuhl ergonomisch', 'Möbel', 65, 65, 120, '', 150, 900]],
  'Schränke': [['Kleiderschrank 2-türig', 'Möbel', 100, 60, 200, 'Kippschutz.', 150, 800], ['Kleiderschrank 3-türig', 'Möbel', 150, 60, 220, 'Kippschutz.', 250, 1200], ['Kleiderschrank Schiebetüren', 'Möbel', 200, 65, 225, 'Kein Schwenkbereich nötig.', 400, 2000], ['Schranksystem deckenhoch', 'Möbel', 250, 60, 250, 'Nach Maß, bis zur Decke.', 1200, 5000], ['Kommode', 'Möbel', 120, 50, 85, 'Kippschutz.', 120, 900], ['Sideboard', 'Möbel', 180, 45, 75, '', 200, 1500], ['Highboard', 'Möbel', 120, 45, 140, '', 250, 1500], ['Vitrine', 'Möbel', 80, 40, 190, '', 200, 1200], ['Apothekerschrank', 'Möbel', 30, 60, 200, 'Auszug für schmale Nischen.', 150, 700], ['Schuhschrank', 'Möbel', 90, 25, 110, '', 80, 400], ['Garderobe mit Bank', 'Möbel', 120, 40, 190, '', 150, 900], ['Schrankbett (Klappbett)', 'Möbel', 160, 45, 220, 'Bett klappt aus der Wand – Gästezimmer/Büro in einem.', 1200, 4000]],
  'Regale': [['Bücherregal', 'Möbel', 80, 30, 200, 'Kippsicher an der Wand befestigen.', 80, 600], ['Würfelregal 4×4', 'Möbel', 147, 39, 147, 'Mit Boxen als Stauraum.', 100, 400], ['Leiterregal', 'Möbel', 60, 35, 180, '', 60, 250], ['Wandregal schwebend', 'Möbel', 100, 25, 4, '', 30, 200], ['Regalwand deckenhoch', 'Möbel', 250, 35, 250, '', 500, 3000], ['Raumteiler-Regal', 'Möbel', 150, 35, 180, 'Von beiden Seiten nutzbar.', 150, 700]],
  'TV & Medien': [['Lowboard', 'Möbel', 180, 45, 50, '', 120, 900], ['TV-Wand / Medienwand', 'Möbel', 280, 45, 200, '', 500, 3000], ['Fernseher an Wand 65"', 'Technik', 146, 6, 84, 'Mitte ca. 110–120 cm hoch, Abstand ca. 2,5–3 m.', 600, 2500], ['Soundbar', 'Technik', 90, 10, 7, '', 150, 900]],
  'Betten': [['Einzelbett 90×200', 'Möbel', 100, 210, 45, '', 120, 700], ['Einzelbett 100×200', 'Möbel', 110, 210, 45, '', 150, 800], ['Bett 140×200', 'Möbel', 150, 210, 45, '', 200, 1200], ['Doppelbett 160×200', 'Möbel', 170, 210, 45, '', 250, 1500], ['Doppelbett 180×200', 'Möbel', 190, 210, 45, '', 300, 2000], ['Boxspringbett 180×200', 'Möbel', 190, 215, 60, '', 800, 3500], ['Polsterbett 200×200', 'Möbel', 210, 220, 50, '', 700, 3000], ['Futonbett niedrig', 'Möbel', 170, 210, 30, '', 300, 1200], ['Tagesbett', 'Möbel', 210, 100, 70, '', 300, 1200], ['Nachttisch', 'Möbel', 45, 40, 50, '', 40, 300], ['Schminktisch', 'Möbel', 100, 45, 76, '', 150, 700]],
  'Kinder': [['Kinderbett mitwachsend', 'Möbel', 100, 210, 60, '', 200, 900], ['Hochbett mit Schreibtisch darunter', 'Möbel', 210, 100, 195, 'Oben ab ca. 6 Jahren.', 350, 1400], ['Etagenbett (2 Kinder)', 'Möbel', 210, 100, 165, 'Oben ab ca. 6 Jahren.', 300, 1200], ['Hausbett (Bodenbett mit Dach)', 'Möbel', 210, 100, 170, '', 150, 600], ['Spielzeugregal', 'Möbel', 100, 35, 110, 'Kippsicher.', 60, 300], ['Kinderschreibtisch', 'Möbel', 100, 60, 64, 'Höhenverstellbar.', 100, 500], ['Wickelkommode', 'Möbel', 100, 75, 95, '', 150, 600], ['Kletterwand / Sprossenwand', 'Möbel', 90, 15, 220, 'Fest in Massivwand dübeln, Fallschutzmatte.', 150, 600]],
  'Küche & Essen': [['Kücheninsel', 'Küche', 180, 90, 92, '', 1500, 6000], ['Servierwagen / Barwagen', 'Möbel', 70, 40, 80, '', 80, 300], ['Speiseschrank (Hochschrank)', 'Küche', 60, 60, 210, '', 300, 1200], ['Weinregal', 'Möbel', 60, 30, 120, '', 60, 400]],
  'Büro': [['Rollcontainer', 'Möbel', 42, 55, 60, '', 60, 300], ['Aktenschrank', 'Möbel', 80, 40, 190, '', 150, 700], ['Bücherwand mit Leiter', 'Möbel', 300, 40, 250, '', 1500, 5000]],
  'Bad': [['Waschtisch mit Unterschrank', 'Sanitär', 80, 48, 85, '', 300, 1500], ['Hochschrank Bad', 'Möbel', 40, 35, 170, '', 100, 500], ['Spiegelschrank', 'Sanitär', 80, 15, 70, '', 100, 600], ['Wäschesammler', 'Möbel', 40, 35, 60, '', 30, 150], ['Badregal Leiter', 'Möbel', 45, 30, 150, '', 40, 200]],
  'Licht & Deko': [['Stehleuchte', 'Licht', 30, 30, 160, '', 40, 500], ['Bogenleuchte', 'Licht', 40, 160, 200, '', 100, 800], ['Pendelleuchte', 'Licht', 40, 40, 30, '', 50, 600], ['Teppich 200×300', 'Deko', 300, 200, 1, '', 100, 1200], ['Teppich rund 200', 'Deko', 200, 200, 1, '', 80, 900], ['Pflanze groß', 'Deko', 50, 50, 150, '', 30, 250], ['Standspiegel', 'Deko', 50, 5, 170, 'An der Wand sichern.', 50, 400], ['Elektrokamin', 'Technik', 120, 35, 90, '', 300, 1500], ['Raumteiler Paravent', 'Deko', 150, 4, 170, '', 60, 400]]
};
const MK_FUER = { wohn: ['Sofas', 'Sessel & Sitzen', 'Tische', 'Regale', 'TV & Medien', 'Licht & Deko', 'Schränke'], schlaf: ['Betten', 'Schränke', 'Sessel & Sitzen', 'Licht & Deko', 'Regale'], kind: ['Kinder', 'Betten', 'Regale', 'Schränke', 'Licht & Deko'], buero: ['Tische', 'Büro', 'Regale', 'Stühle', 'Schränke', 'Licht & Deko'], ess: ['Tische', 'Stühle', 'Schränke', 'Licht & Deko'], kueche: ['Küche & Essen', 'Stühle', 'Tische', 'Licht & Deko'], bad: ['Bad', 'Licht & Deko'], wasch: ['Regale', 'Schränke', 'Bad'], sonst: ['Schränke', 'Regale', 'Sessel & Sitzen', 'Licht & Deko'] };
const MK_ALLE = Object.entries(MK).flatMap(([k, l]) => l.map((x) => ({ kat: k, spec: x.slice(0, 6), preis: [x[6], x[7]] })));
MK_ALLE.forEach((m) => { if (!EXTRA_SPECS[m.spec[0]]) EXTRA_SPECS[m.spec[0]] = m.spec; PREISE.unshift([new RegExp('^' + m.spec[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), m.preis[0], m.preis[1]]); });

/* ---------- Auswahl-Blatt „Möbel hinzufügen“ ---------- */
let MKS = { kat: '', suche: '', d: null };
function moebelBlatt() {
  const o = studioObj(MKS.d), art = raumArt(o.raum), passend = MK_FUER[art] || MK_FUER.sonst;
  const kats = passend.concat(Object.keys(MK).filter((k) => !passend.includes(k)));
  const kat = MKS.kat || kats[0];
  const raumEigen = katalogFuer(o).map((k) => ({ kat: 'Für diesen Raum', spec: k, preis: null }));
  let liste = MKS.suche ? MK_ALLE.concat(raumEigen).filter((m) => m.spec[0].toLowerCase().includes(MKS.suche.toLowerCase())) : kat === 'Für diesen Raum' ? raumEigen : MK_ALLE.filter((m) => m.kat === kat);
  liste = liste.filter((m) => passt(o.raum, m.spec[0]).ok);
  const d = MKS.d.p ? `data-p="${MKS.d.p}"` : `data-r="${MKS.d.r}"`;
  return `<div class="fk-blatt mk-blatt"><div class="fk-griff"></div>
    <div class="zeile"><h2 style="flex:1;margin:0">Möbel hinzufügen</h2><button class="fk-zu" data-akt="mkZu" aria-label="Schließen">✕</button></div>
    <button class="mk-foto-knopf" data-akt="mkFotoStart" ${d}><span>📷</span><span><b>Eigenes Möbel per Foto</b><small>Foto machen, Möbel umranden, Maße eintragen – genau dieses Möbel kommt in den Raum</small></span></button>
    <input class="fk-suche" placeholder="Suchen: Sofa, Kommode, Hochbett …" value="${esc(MKS.suche)}" data-ein="mkSuche" data-sofort="1">
    ${MKS.suche ? '' : `<div class="mk-kats">${['Für diesen Raum'].concat(kats).map((k) => `<button class="chip ${k === kat ? 'an' : ''}" data-akt="mkKat" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>`}
    <div class="mk-liste">${liste.map((m) => `<button class="mk-item" data-akt="mkNehmen" data-n="${esc(m.spec[0])}"><i class="mk-form" style="aspect-ratio:${Math.max(0.4, Math.min(2.5, m.spec[2] / Math.max(m.spec[3], 8)))}"></i><span style="flex:1"><b>${esc(m.spec[0])}</b><small>${m.spec[2]} × ${m.spec[3]} × ${m.spec[4]} cm${m.preis ? ' · ' + euro(m.preis[0]) + '–' + euro(m.preis[1]) : ''}</small></span><span class="mk-plus">＋</span></button>`).join('') || '<p class="klein">Nichts gefunden – oder per Foto dein eigenes Möbel anlegen.</p>'}</div>
  </div>`;
}
function moebelBlattZeigen() {
  let o = document.getElementById('mk-overlay');
  if (!o) { o = document.createElement('div'); o.id = 'mk-overlay'; o.className = 'fk-overlay'; o.addEventListener('click', (e) => { if (e.target === o) AKT.mkZu(); }); document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('an')); }
  const y = o.querySelector('.mk-liste') ? o.querySelector('.fk-blatt').scrollTop : 0; o.innerHTML = moebelBlatt(); o.querySelector('.fk-blatt').scrollTop = y;
}
AKT.studioPlus = (d) => { MKS = { kat: '', suche: '', d: { p: d.p, r: d.r } }; moebelBlattZeigen(); };
AKT.mkZu = () => { const o = document.getElementById('mk-overlay'); if (o) { o.classList.remove('an'); setTimeout(() => o.remove(), 200); } };
AKT.mkKat = (d) => { MKS.kat = d.k; moebelBlattZeigen(); };
EIN.mkSuche = (v) => { MKS.suche = v; moebelBlattZeigen(); const i = document.querySelector('#mk-overlay .fk-suche'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } };
AKT.mkNehmen = (d) => {
  const o = studioObj(MKS.d), L = losStatus(o);
  if (/Vorhänge|Gardine|Vorhang/.test(d.n) && (o.fenster === false || ['bad', 'gaestewc', 'waschraum', 'keller', 'heizungsraum'].includes(o.raum))) { info(o.fenster === false ? 'Dieser Raum hat kein Fenster und keine Glastür – Vorhänge ergeben hier keinen Sinn.' : 'Im Nassraum besser ein feuchtraumgeeignetes Rollo statt Vorhängen.'); return; }
  aendern(() => { L.wuensche = (L.wuensche || standardWuensche(o)).concat([d.n]); L.weg = (L.weg || []).filter((x) => x !== d.n); }, 'Möbel hinzugefügt');
  toast('＋ ' + d.n + ' – die App sucht den besten Platz'); moebelBlattZeigen();
};

/* ---------- Möbel per Foto: umranden + skizzieren + Maße ---------- */
const MF_TYPEN = [['Schrank', 'Möbel', 100, 60, 200], ['Regal', 'Möbel', 80, 35, 180], ['Sofa', 'Möbel', 220, 95, 82], ['Sessel', 'Möbel', 80, 85, 90], ['Tisch', 'Möbel', 160, 90, 75], ['Kommode / Sideboard', 'Möbel', 160, 45, 80], ['Bett', 'Möbel', 180, 210, 45], ['Stuhl', 'Möbel', 50, 55, 85], ['Lampe', 'Licht', 40, 40, 160], ['Waschtisch', 'Sanitär', 80, 48, 85], ['Sonstiges', 'Möbel', 80, 50, 80]];
let MF = null;
AKT.mkFotoStart = (d) => { AKT.mkZu(); MF = { d: { p: d.p, r: d.r }, bild: null, striche: [], modus: 'umranden', typ: 0, name: '', mass: null, notiz: '' }; mfZeigen(); };
function mfZeigen() {
  let o = document.getElementById('mf-overlay');
  if (!o) { o = document.createElement('div'); o.id = 'mf-overlay'; o.className = 'fk-overlay an'; document.body.appendChild(o); }
  const t = MF_TYPEN[MF.typ], m = MF.mass || [t[2], t[3], t[4]];
  o.innerHTML = `<div class="fk-blatt mf-blatt" style="transform:none"><div class="zeile"><h2 style="flex:1;margin:0">Möbel per Foto</h2><button class="fk-zu" data-akt="mfZu" aria-label="Schließen">✕</button></div>
    ${!MF.bild ? `<p>1. Foto vom Möbel machen – im Laden, bei Freunden, aus dem Internet (Screenshot).</p>${dateiKnopf('Foto machen / wählen', 'mfFoto', {}, { icon: ICON.kamera || '', klasse: 'voll' })}` : `
      <p class="klein"><b>2.</b> ${MF.modus === 'umranden' ? 'Mit dem Finger <b>um das Möbel herum</b> fahren – nur das Umrandete kommt in den Raum.' : 'Draufzeichnen, was anders sein soll (z. B. Griffe weg, Fach mehr) – kommt als Notiz für den Schreiner mit.'}</p>
      <div class="zeile wrap"><button class="chip ${MF.modus === 'umranden' ? 'an' : ''}" data-akt="mfModus" data-m="umranden">✂️ Umranden</button><button class="chip ${MF.modus === 'skizze' ? 'an' : ''}" data-akt="mfModus" data-m="skizze">✏️ Skizzieren</button><button class="chip" data-akt="mfZurueck">↶ Rückgängig</button></div>
      <div class="mf-buehne"><canvas id="mf-flaeche"></canvas></div>
      <p class="klein"><b>3.</b> Was ist es?</p>
      <div class="zeile wrap">${MF_TYPEN.map((x, i) => `<button class="chip ${MF.typ === i ? 'an' : ''}" data-akt="mfTyp" data-i="${i}">${x[0]}</button>`).join('')}</div>
      <label class="feld">Name<input id="mf-name" value="${esc(MF.name)}" placeholder="z. B. Sideboard Nussbaum wie bei Anna"></label>
      <div class="raster3">${['Breite', 'Tiefe', 'Höhe'].map((n, i) => `<label class="feld">${n} (cm)<input inputmode="numeric" class="mf-mass" data-i="${i}" value="${m[i]}"></label>`).join('')}</div>
      <label class="feld">Wünsche (optional)<input id="mf-notiz" value="${esc(MF.notiz)}" placeholder="z. B. 20 cm schmaler, ohne Griffe"></label>
      <button class="btn voll" data-akt="mfFertig">In den Raum stellen</button>`}
  </div>`;
  if (MF.bild) mfCanvas();
}
function mfCanvas() {
  const cv = document.getElementById('mf-flaeche'); if (!cv) return;
  const img = MF.img, W = Math.min(cv.parentElement.clientWidth || 340, 600), s = W / img.width; cv.width = W * 2; cv.height = img.height * s * 2; cv.style.width = W + 'px'; cv.style.height = img.height * s + 'px';
  const c = cv.getContext('2d'), mal = () => {
    c.drawImage(img, 0, 0, cv.width, cv.height);
    const um = MF.striche.filter((x) => x.typ === 'umranden').slice(-1)[0];
    if (um && um.p.length > 2) { c.save(); c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.rect(0, 0, cv.width, cv.height); um.p.forEach(([x, y], i) => (i ? c.lineTo(x * cv.width, y * cv.height) : c.moveTo(x * cv.width, y * cv.height))); c.closePath(); c.fill('evenodd'); c.restore(); }
    MF.striche.forEach((st) => { c.strokeStyle = st.typ === 'umranden' ? '#2e9e5b' : '#f28c28'; c.lineWidth = 6; c.lineJoin = c.lineCap = 'round'; c.beginPath(); st.p.forEach(([x, y], i) => (i ? c.lineTo(x * cv.width, y * cv.height) : c.moveTo(x * cv.width, y * cv.height))); if (st.typ === 'umranden') c.closePath(); c.stroke(); });
  };
  mal();
  let akt = null; const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); if (MF.modus === 'umranden') MF.striche = MF.striche.filter((x) => x.typ !== 'umranden'); akt = { typ: MF.modus, p: [pos(e)] }; MF.striche.push(akt); };
  cv.onpointermove = (e) => { if (!akt) return; akt.p.push(pos(e)); mal(); };
  cv.onpointerup = () => { akt = null; mal(); };
}
function mfFormLesen() { const n = document.getElementById('mf-name'), z = document.getElementById('mf-notiz'); if (n) MF.name = n.value; if (z) MF.notiz = z.value; const ms = [...document.querySelectorAll('.mf-mass')].map((i) => Math.round(parseZahl(i.value))); if (ms.length === 3) MF.mass = ms; }
EIN.mfFoto = (v, d, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 1200, (url) => { const i = new Image(); i.onload = () => { MF.bild = url; MF.img = i; mfZeigen(); }; i.src = url; }); };
AKT.mfModus = (d) => { mfFormLesen(); MF.modus = d.m; mfZeigen(); };
AKT.mfZurueck = () => { mfFormLesen(); MF.striche.pop(); mfZeigen(); };
AKT.mfTyp = (d) => { mfFormLesen(); MF.typ = +d.i; const t = MF_TYPEN[MF.typ]; MF.mass = [t[2], t[3], t[4]]; mfZeigen(); };
AKT.mfZu = () => { const o = document.getElementById('mf-overlay'); if (o) o.remove(); MF = null; };
AKT.mfFertig = () => {
  mfFormLesen();
  const [b, t, h] = MF.mass || [80, 50, 80];
  if (!(b >= 10 && t >= 3 && h >= 1 && b <= 600 && t <= 400 && h <= 300)) { info('Bitte Maße in Zentimetern eintragen (Breite, Tiefe, Höhe).'); return; }
  const um = MF.striche.filter((x) => x.typ === 'umranden').slice(-1)[0], img = MF.img;
  // Ausschnitt: nur das Umrandete
  let bx = [0, 0, 1, 1];
  if (um && um.p.length > 4) { const xs = um.p.map((p) => p[0]), ys = um.p.map((p) => p[1]); bx = [Math.max(0, Math.min(...xs)), Math.max(0, Math.min(...ys)), Math.min(1, Math.max(...xs)), Math.min(1, Math.max(...ys))]; }
  const cw = Math.max(20, (bx[2] - bx[0]) * img.width), ch = Math.max(20, (bx[3] - bx[1]) * img.height), k = Math.min(1, 700 / Math.max(cw, ch));
  const c = document.createElement('canvas'); c.width = Math.round(cw * k); c.height = Math.round(ch * k); const x = c.getContext('2d');
  x.drawImage(img, bx[0] * img.width, bx[1] * img.height, cw, ch, 0, 0, c.width, c.height);
  const ausschnitt = c.toDataURL('image/jpeg', 0.85);
  // Skizze (Foto + Linien) für den Schreiner
  const sk = document.getElementById('mf-flaeche'), skizze = sk ? sk.toDataURL('image/jpeg', 0.7) : MF.bild;
  const typ = MF_TYPEN[MF.typ], name = (MF.name || 'Mein ' + typ[0]).trim().slice(0, 50) + (MF.name ? '' : ' (Foto)');
  const spec = [name, typ[1], b, t, h, (MF.notiz ? 'Wunsch: ' + MF.notiz + '. ' : '') + 'Nach deinem Foto. Typ: ' + typ[0] + '.'];
  const o = studioObj(MF.d), L = losStatus(o);
  fotoFarbe(ausschnitt, (farbe) => {
    aendern(() => {
      EXTRA_SPECS[name] = spec; L.eigeneSpecs = Object.assign(L.eigeneSpecs || {}, { [name]: spec });
      L.fotoTeile = Object.assign(L.fotoTeile || {}, { [name]: { foto: ausschnitt, farbe, skizze, typ: typ[0], notiz: MF.notiz } });
      L.wuensche = (L.wuensche || standardWuensche(o)).concat([name]); L.weg = (L.weg || []).filter((x2) => x2 !== name);
    }, 'Eigenes Möbel per Foto');
    AKT.mfZu();
    toast(name + ' steht im Raum – Tür, Fenster und Abstände geprüft');
    sprich(name + ' ist im Raum.', true);
  });
};
/* im Teil-Dialog: Schreiner fragen für Foto-Möbel */
const mkAltTeil = AKT.studioTeil;
AKT.studioTeil = (d) => {
  const o = studioObj(d), t = (losStatus(o).fotoTeile || {})[d.n];
  if (t && t.skizze) {
    dialog('„' + d.n + '“', [['Nachbauen lassen – Schreiner fragen', () => { const sp = EXTRA_SPECS[d.n] || []; Object.assign(FN, { fach: 'schreiner', profi: 'pz1', text: 'Kannst du mir dieses Möbel bauen? Maße ca. ' + sp[2] + ' × ' + sp[3] + ' × ' + sp[4] + ' cm (B × T × H).' + (t.notiz ? ' Wünsche: ' + t.notiz + '.' : '') + ' Foto und Skizze hängen dran. Was kostet das ungefähr?', fotos: [t.foto, t.skizze] }); geh('#/frage-neu?fach=schreiner' + (o.entwurf ? '' : '&p=' + o.id)); }], ['Ändern / entfernen …', () => setTimeout(() => mkAltTeil(d), 50)], ['Abbrechen', null]]);
    return;
  }
  mkAltTeil(d);
};
if (typeof FACH !== 'undefined' && !FACH.some((f) => f.id === 'schreiner')) {
  FACH.push({ id: 'schreiner', name: 'Schreiner/Tischler', icon: '🪚', bsp: 'Kannst du mir dieses Möbel nach Foto in 160 × 45 cm bauen? Was kostet das ungefähr?' });
  PROFIS.push({ id: 'pz1', name: 'Schreinerei Beispiel W.', fach: 'schreiner', preis: 15, std: 24, sterne: 4.8, antworten: 140, siegel: ['Meister', 'Handwerksrolle'] });
}
