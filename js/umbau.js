/* Joum 4D Build – Umbauen im Studio
   1) Wände einziehen/verschieben in JEDEM Raum (auch Garage): Trennwand bis Decke, halbhoch, Glas, Raumteiler-Regal, Vorwand;
      quer/längs, Position per Regler, Durchgang links/rechts/beide Seiten („von beiden Seiten begehbar“) oder Mitte.
   2) Waschraum: Geräte-Nische hinter Trennwand, von beiden Seiten begehbar (wie die Dusche im Bad).
   3) Kinderzimmer: Hochbett mit Schreibtisch, Hochbett mit Spielhöhle, Etagenbett + Spielwiese, Hochebene (oben Spielwiese,
      unten Betten), Hausbett – Ideen wie in Kinderzimmer-Ratgebern/Selbstbau-Communitys; Sicherheitsregeln (ab 6 J. oben, Absturzsicherung). */

/* ---------- 1) Eigene Wände ---------- */
const WAND_TYPEN = {
  voll: { n: 'Trennwand bis Decke', d: 10, h: null, g: 'Wand & Bau', hint: 'Trockenbau (CW 50 + 2× Gipskarton je Seite), Dämmung für Schallschutz.', preis: [45, 90] },
  halb: { n: 'Halbhohe Wand', d: 10, h: 120, g: 'Wand & Bau', hint: 'Trockenbau, oben Abschlussbrett – trennt, ohne Licht zu nehmen.', preis: [40, 80] },
  glas: { n: 'Glaswand', d: 4, h: null, g: 'Wand & Bau', hint: 'Festverglasung (ESG/VSG) mit Profilen – Licht geht durch.', preis: [250, 600] },
  regal: { n: 'Raumteiler-Regal', d: 35, h: 180, g: 'Möbel', hint: 'Offenes Regal, oben an Decke/Wand gegen Kippen sichern.', preis: [80, 250] },
  vorwand: { n: 'Vorwand', d: 20, h: 120, g: 'Wand & Bau', hint: 'Vorwand für Leitungen/Ablage (z. B. hinter WC oder Waschmaschine).', preis: [60, 140] }
};
const DURCHGANG = [['keiner', 'geschlossen'], ['links', 'Durchgang links'], ['rechts', 'Durchgang rechts'], ['beide', 'von beiden Seiten begehbar'], ['mitte', 'Tür in der Mitte']];
function wandTeile(o, w) {
  const T = WAND_TYPEN[w.typ] || WAND_TYPEN.voll, quer = w.achse !== 'laengs';
  const L = quer ? o.breite : o.tiefe, Q = quer ? o.tiefe : o.breite, pos = Math.round(Math.max(30, Math.min(Q - 30, Q * w.pos / 100)));
  const gap = 85, h = T.h || (o.hoehe || 250);
  let stuecke = [[0, L]];
  const cut = (a, b) => { stuecke = stuecke.flatMap(([s, e]) => (b <= s || a >= e) ? [[s, e]] : [[s, a], [b, e]].filter(([x, y]) => y - x > 15)); };
  if (w.durchgang === 'links' || w.durchgang === 'beide') cut(0, gap);
  if (w.durchgang === 'rechts' || w.durchgang === 'beide') cut(L - gap, L);
  if (w.durchgang === 'mitte') cut(L / 2 - gap / 2, L / 2 + gap / 2);
  // Tür des Raums (links, Mitte) immer frei lassen
  const tz = tuerZone(o);
  if (quer && pos > tz.y - 10 && pos < tz.y + tz.h + 10) cut(0, tz.w + 10);
  if (!quer && pos < tz.w + 10) cut(tz.y - 10, tz.y + tz.h + 10);
  return stuecke.map(([s, e], i) => {
    const el = { id: w.id + '_' + i, n: T.n, g: T.g, w: Math.round(e - s), d: T.d, h, hint: T.hint, rot: quer ? 0 : 90, eigen: true, konzept: true, eigeneWand: w.id };
    if (quer) { el.x = Math.round(s); el.y = Math.round(pos - T.d / 2); } else { el.x = Math.round(pos - T.d / 2); el.y = Math.round(s); }
    if (w.typ === 'glas') el.farbe = '#cfe8f5';
    return el;
  });
}
function wandElemente(o) { return (losStatus(o).waendeEigen || []).flatMap((w) => wandTeile(o, w)); }
function waendeKarte(o, d) {
  const L = losStatus(o), W = L.waendeEigen || [];
  return `<section class="karte" id="waende-karte"><h3>🧱 Wände einziehen & verschieben</h3>
    <p class="klein grau">Raum teilen, Nische bauen, Zone abtrennen – die App lässt die Tür frei und plant die Möbel neu um die Wand herum.</p>
    ${W.map((w, i) => `<div class="wand-box">
      <div class="zeile wrap">${Object.entries(WAND_TYPEN).map(([k, t]) => `<button class="chip ${w.typ === k ? 'an' : ''}" data-akt="uwSetz" ${d} data-i="${i}" data-k="typ" data-v="${k}">${t.n}</button>`).join('')}</div>
      <div class="zeile wrap"><button class="chip ${w.achse !== 'laengs' ? 'an' : ''}" data-akt="uwSetz" ${d} data-i="${i}" data-k="achse" data-v="quer">↔ quer</button><button class="chip ${w.achse === 'laengs' ? 'an' : ''}" data-akt="uwSetz" ${d} data-i="${i}" data-k="achse" data-v="laengs">↕ längs</button></div>
      <label class="feld">Position: ${w.pos} % ${w.achse === 'laengs' ? 'von links' : 'von hinten'}<input type="range" min="10" max="90" step="1" value="${w.pos}" data-ein="uwPos" data-sofort="1" ${d} data-i="${i}"></label>
      <div class="zeile wrap">${DURCHGANG.map(([k, t]) => `<button class="chip ${w.durchgang === k ? 'an' : ''}" data-akt="uwSetz" ${d} data-i="${i}" data-k="durchgang" data-v="${k}">${t}</button>`).join('')}</div>
      <button class="chip" data-akt="uwWeg" ${d} data-i="${i}">Wand entfernen</button></div>`).join('')}
    <button class="btn hell voll" data-akt="uwNeu" ${d}>＋ Wand hinzufügen</button>
    ${W.length ? `<p class="klein">Bestehende Wand entfernen oder durchbrechen? Erst prüfen, ob sie tragend ist – <a href="#/bauamt?v=wand">Bauamt-Check</a> · <a href="#/frage-neu?fach=statik">Statiker fragen</a></p>` : ''}
  </section>`;
}
const uwListe = (dd) => { const L = losStatus(studioObj(dd)); return (L.waendeEigen = L.waendeEigen || []); };
AKT.uwNeu = (dd) => aendern(() => uwListe(dd).push({ id: 'w' + uid(), typ: 'voll', achse: 'quer', pos: 50, durchgang: 'beide' }), 'Wand hinzugefügt');
AKT.uwSetz = (dd) => aendern(() => { uwListe(dd)[+dd.i][dd.k] = dd.v; }, 'Wand geändert');
AKT.uwWeg = (dd) => aendern(() => { uwListe(dd).splice(+dd.i, 1); }, 'Wand entfernt');
let UW_TIMER = null;
EIN.uwPos = (v, dd) => { clearTimeout(UW_TIMER); UW_TIMER = setTimeout(() => aendern(() => { uwListe(dd)[+dd.i].pos = Math.round(+v); }, 'Wand verschoben'), 120); };
PREISE.unshift([/^Trennwand bis Decke$/, 500, 1400], [/^Halbhohe Wand$/, 300, 900], [/^Glaswand$/, 1200, 3500], [/^Raumteiler-Regal$/, 150, 600], [/^Vorwand$/, 200, 600]);
WUNSCH.unshift([/glaswand|glas ?wand/, ['Glaswand', 'Wand & Bau', 120, 4, 250, WAND_TYPEN.glas.hint]], [/halbhohe|halbe wand/, ['Halbhohe Wand', 'Wand & Bau', 120, 10, 120, WAND_TYPEN.halb.hint]], [/trennwand|zwischenwand|wand einziehen|neue wand/, ['Trennwand bis Decke', 'Wand & Bau', 120, 10, 250, WAND_TYPEN.voll.hint]], [/raumteiler/, ['Raumteiler-Regal', 'Möbel', 120, 35, 180, '']]);

/* ---------- 2) + 3) Sonder-Ideen je Raum ---------- */
const SONDER_KONZEPT = {};
// Waschraum: Geräte-Nische hinter Trennwand, von beiden Seiten begehbar
KONZEPT_TEXT.trenn = ['Geräte-Nische hinter Trennwand', 'Wie die Dusche im Bad: Waschmaschine & Trockner hinter einer Wand, links und rechts begehbar – vorne bleibt ein aufgeräumter Raum.'];
WASCH_K.splice(1, 0, 'trenn');
SONDER_KONZEPT.trenn = (o, liste) => {
  const B = o.breite, T = o.tiefe, tz = tuerZone(o);
  const rest = liste.filter((x) => !W_GERAETE.test(x[0]));
  const tiefeNische = 65 + 75, start = Math.max(85, tz.w + 10), ende = B - 85;
  if (T < tiefeNische + 10 + 70) return { fehler: 'braucht ca. ' + zahl((tiefeNische + 80) / 100) + ' m Raumtiefe' };
  if (ende - start < 100) return { fehler: 'Raum zu schmal für zwei Durchgänge' };
  const vor = [elAus(W_SPEC.turm, start + (ende - start) / 2 - 65, 0, 0, { konzept: true }), elAus(W_SPEC.hoch, start + (ende - start) / 2 + 5, 0, 0, { konzept: true }),
    elAus(['Trennwand (Geräte-Nische)', 'Wand & Bau', Math.round(ende - start), 10, 200, 'Trockenbau, Feuchtraumplatten; Nische lüften (Trockner!).'], start, tiefeNische, 0, { konzept: true })];
  const f = vorplanOk(o, vor); if (f) return { fehler: f };
  return { vor, rest };
};
// Kinderzimmer
const K_SPEC = {
  schreib: ['Hochbett mit Schreibtisch darunter', 'Möbel', 210, 100, 195, 'Liegefläche 90×200 in ca. 1,40 m, darunter Schreibtisch + Regal. Oben erst ab ca. 6 Jahren, Absturzsicherung ≥ 16 cm über Matratze (DIN EN 747).'],
  hoehle: ['Hochbett mit Spielhöhle darunter', 'Möbel', 210, 100, 195, 'Unten Höhle mit Vorhang, Kissen, Licht. Oben erst ab ca. 6 Jahren.'],
  etage: ['Etagenbett (2 Kinder)', 'Möbel', 210, 100, 165, 'Zwei Schlafplätze übereinander; unteres Bett auf Rollen spart Platz. Oben ab ca. 6 Jahren.'],
  ebene: ['Hochebene: oben Spielwiese, unten 2 Betten', 'Möbel', 200, 210, 200, 'Spielebene mit Geländer (Holz + OSB), darunter zwei Betten 90×200. Fest an tragender Wand verschrauben, Raumhöhe mind. 2,50 m, Geländer mind. 60 cm.'],
  haus: ['Hausbett (Bodenbett mit Dach)', 'Möbel', 210, 100, 170, 'Montessori-Idee: Kind steigt allein ein und aus – kein Absturzrisiko.'],
  spiel: ['Spielecke / Teppich', 'Deko', 150, 150, 1, ''],
  schreibtisch: ['Schreibtisch höhenverstellbar', 'Möbel', 110, 65, 75, '']
};
Object.assign(KONZEPT_TEXT, {
  k_schreib: ['Hochbett + Schreibtisch', 'Oben schlafen, unten lernen – der Boden bleibt frei zum Spielen.'],
  k_hoehle: ['Hochbett + Spielhöhle', 'Oben schlafen, unten eine Höhle mit Vorhang zum Kuscheln und Spielen.'],
  k_etage: ['Etagenbett + Spielwiese', 'Zwei Kinder übereinander, daneben Spielwiese und Schreibtisch.'],
  k_ebene: ['Hochebene: Spielwiese oben', 'Oben eine große Spielebene, unten die Betten – zwei Räume in einem.'],
  k_haus: ['Hausbett am Boden', 'Bett mit Hausdach – sicher für Kleine, gemütlich und Spielplatz zugleich.']
});
const KIND_K = ['k_schreib', 'k_ebene', 'k_etage', 'k_hoehle', 'k_haus'];
const BETT = /^Kinderbett|^Hochbett$|^Bett 140|^Bett 90/;
KIND_K.forEach((k) => {
  SONDER_KONZEPT[k] = (o, liste) => {
    let rest = liste.filter((x) => !BETT.test(x[0]));
    const was = k.slice(2), dazu = [K_SPEC[was]];
    if (was === 'schreib') rest = rest.filter((x) => !/Schreibtisch/.test(x[0]));
    if (was === 'hoehle') rest = rest.filter((x) => !/Spielecke/.test(x[0]));
    if (was === 'etage' && !rest.some((x) => /Spielecke/.test(x[0]))) dazu.push(K_SPEC.spiel);
    if (was === 'etage' && !rest.some((x) => /Schreibtisch/.test(x[0]))) dazu.push(K_SPEC.schreibtisch);
    if (was === 'ebene') { if ((o.hoehe || 250) < 250) return { fehler: 'braucht mind. 2,50 m Raumhöhe' }; if (!rest.some((x) => /Spielecke/.test(x[0]))) rest = rest.concat([K_SPEC.spiel]); }
    if (was === 'haus' && o.raum === 'jugendzimmer') return { fehler: 'eher für kleinere Kinder' };
    if (['schreib', 'hoehle', 'etage', 'ebene'].includes(was) && o.raum === 'babyzimmer') return { fehler: 'erst ab ca. 6 Jahren' };
    if (was === 'ebene') { // fest in die Ecke gegenüber der Tür, an zwei Wänden verschraubt
      const k2 = dazu[0].slice(); for (const [x, y, r] of [[o.breite - k2[2], 0, 0], [o.breite - k2[2], o.tiefe - k2[3], 180]]) { const el = elAus(k2, x, y, r, { konzept: true }); if (!vorplanOk(o, [el])) return { vor: [el], rest: rest }; }
      return { fehler: 'Raum zu klein für die Hochebene (ca. 2,0 × 2,1 m)' };
    }
    return { vor: [], rest: dazu.map((x) => x.slice()).concat(rest) };
  };
});
WUNSCH.unshift([/hochebene|spielebene|spielwiese/, K_SPEC.ebene], [/etagenbett|stockbett|übereinander.*bett|betten übereinander/, K_SPEC.etage], [/hochbett.*(schreib|lern)/, K_SPEC.schreib], [/hochbett.*(spiel|höhle)/, K_SPEC.hoehle], [/hausbett/, K_SPEC.haus]);
PREISE.unshift([/Hochbett mit/, 350, 1400], [/Etagenbett/, 300, 1200], [/Hochebene/, 600, 2500], [/Hausbett/, 150, 600]);
Object.assign(ALTERNATIVEN, {
  'Kinderbett': [K_SPEC.schreib, K_SPEC.etage, K_SPEC.haus],
  'Hochbett': [K_SPEC.schreib, K_SPEC.hoehle, K_SPEC.ebene]
});

/* Schwebende Werkzeuge im Studio: Stift über Mikrofon und Vorlesen – immer griffbereit rechts */
const vorUmbauRender = render;
render = function () {
  vorUmbauRender();
  let k = document.getElementById('stift-knopf');
  const quelle = document.querySelector('[data-akt="studioStift"]');
  if (!quelle) { if (k) k.remove(); return; }
  if (!k) { k = document.createElement('button'); k.id = 'stift-knopf'; k.className = 'sprech-knopf stift-knopf'; k.setAttribute('aria-label', 'Auf dem Plan zeichnen'); k.innerHTML = '✏️'; document.body.appendChild(k); }
  k.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    const q = document.querySelector('[data-akt="studioStift"]'), plan = document.querySelector('.studio-plan'); if (!q || !plan) return;
    plan.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { if (!plan.classList.contains('stift-an')) AKT.studioStift(q.dataset); }, 350);
  };
};
HILFE.stiftKnopf = 'Stift: direkt auf den Plan zeichnen, wo etwas hin soll – dann sagen oder tippen, was es ist.';
