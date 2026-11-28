/* Joum 4D Build – Studio-Erweiterung
   1) Waschraum/Hauswirtschaftsraum: eigene, wirklich unterschiedliche Ideen (Turm, Arbeitsplatte, Sockel mit Schubladen,
      Geräte unsichtbar im Schrank, Wäsche-Station).
   2) Teile richtig ändern: mehr Alternativen, „übereinander stapeln“, eigener Wunsch in Worten.
   3) Stift auf dem Plan: Fläche einzeichnen → sagen/tippen, was hin soll („Regal mit Schubladen“, „unsichtbare Tür“ …)
      → wird genau dort eingebaut und von den Raumregeln geprüft. (Handschrift-Erkennung kommt mit dem KI-Server.) */

/* ---------- 1) Waschraum-Ideen ---------- */
const W_SPEC = {
  turm: ['Wasch-Trocken-Turm', 'Technik', 60, 65, 175, 'Trockner auf der Waschmaschine – nur mit Original-Zwischenbausatz (mit Auszugsablage für den Wäschekorb).'],
  hoch: ['Hochschrank (Putzmittel, Bügelbrett)', 'Lager', 60, 60, 200, ''],
  zeile: ['Waschmaschine + Trockner unter Arbeitsplatte', 'Technik', 130, 65, 90, 'Arbeitsplatte zum Wäschelegen. Geräte unterbaufähig (ohne Deckel), 2 cm Luft nach oben.'],
  haengeschrank: ['Hängeschrank über den Geräten', 'Lager', 130, 35, 70, ''],
  sockel: ['Waschmaschine + Trockner auf Sockel mit Schubladen', 'Technik', 130, 65, 125, 'Ca. 40 cm hoch: rückenschonend, Schubladen für Körbe. Geräte mit Rutschsicherung befestigen.'],
  schrank: ['Hauswirtschaftsschrank (Geräte hinter Türen)', 'Lager', 180, 65, 220, 'Waschturm, Besenschrank und Fächer hinter grifflosen Fronten – sieht aus wie ein Einbauschrank. Lüftungsschlitze oben/unten.'],
  platte: ['Arbeitsplatte mit Ausgussbecken', 'Sanitär', 160, 60, 90, 'Zum Vorbehandeln, Sortieren und Falten.'],
  buegel: ['Bügelstation (Wandklappe)', 'Lager', 60, 15, 120, '']
};
const WASCH_K = ['turm', 'zeile', 'sockel', 'schrank', 'station', 'wand'];
Object.assign(KONZEPT_TEXT, {
  turm: ['Turm – Trockner auf die Waschmaschine', 'Spart einen ganzen Stellplatz, daneben Hochschrank für Putzmittel und Bügelbrett.'],
  zeile: ['Nebeneinander unter Arbeitsplatte', 'Beide Geräte unter einer durchgehenden Platte – oben Wäsche legen, darüber Hängeschrank.'],
  sockel: ['Erhöht auf Schubladen-Sockel', 'Geräte auf ca. 40 cm Höhe: kein Bücken mehr, Schubladen für Wäschekörbe.'],
  schrank: ['Unsichtbar im Schrank', 'Alles hinter grifflosen Fronten – der Raum wirkt ruhig wie ein Ankleidezimmer.'],
  station: ['Wäsche-Station', 'Turm + lange Arbeitsplatte mit Ausgussbecken: waschen, vorbehandeln, falten an einem Platz.']
});
const W_GERAETE = /^Waschmaschine$|^Trockner$|^Wasch-Trocken-Turm$|Waschtrockner/;
function waschVorplan(o, k, liste) {
  if (k === 'wand') return { vor: [], rest: liste };
  let rest = liste.filter((x) => !W_GERAETE.test(x[0]));
  const dazu = { turm: [W_SPEC.turm, W_SPEC.hoch], zeile: [W_SPEC.zeile, W_SPEC.haengeschrank], sockel: [W_SPEC.sockel], schrank: [W_SPEC.schrank], station: [W_SPEC.turm, W_SPEC.platte] }[k];
  if (k === 'schrank') rest = rest.filter((x) => !/^Regal$/.test(x[0]));
  if (k === 'station') rest = rest.filter((x) => !/Ausgussbecken/.test(x[0]));
  const breit = dazu.reduce((s, x) => s + (ebene(x[0]) === 'boden' ? x[2] : 0), 0);
  if (breit > Math.max(o.breite, o.tiefe) - 20) return { fehler: 'braucht ca. ' + zahl((breit + 20) / 100) + ' m Wandlänge' };
  return { vor: [], rest: dazu.map((x) => x.slice()).concat(rest), folge: k === 'station' ? [0] : null };
}
PREISE.unshift([/Wasch-Trocken-Turm/, 800, 2000], [/unter Arbeitsplatte/, 1000, 2600], [/auf Sockel mit Schubladen/, 1100, 2900], [/Hauswirtschaftsschrank/, 2000, 6500],
  [/Arbeitsplatte mit Ausguss/, 300, 1200], [/Hochschrank/, 150, 800], [/Hängeschrank über/, 100, 500], [/Regal mit Schubladen/, 120, 600], [/Bügelstation/, 150, 600],
  [/Unsichtbare Tür/, 1200, 3500], [/Schiebetür/, 400, 1500], [/Waschtrockner/, 600, 1300], [/^Arbeitsplatte/, 100, 500], [/Wandregal/, 40, 200]);
Object.assign(ALTERNATIVEN, {
  'Trockner': [W_SPEC.turm, ['Waschtrockner (2 in 1)', 'Technik', 60, 60, 85, 'Ein Gerät statt zwei – spart Platz, trocknet aber weniger auf einmal.']],
  'Waschmaschine': [W_SPEC.turm, ['Waschtrockner (2 in 1)', 'Technik', 60, 60, 85, ''], ['Waschmaschine schmal (45 cm)', 'Technik', 60, 45, 85, 'Für enge Räume.']],
  'Regal': [['Regal mit Schubladen', 'Lager', 90, 45, 180, ''], W_SPEC.hoch, ['Wandregal über den Geräten', 'Lager', 120, 30, 40, '']],
  'Ausgussbecken': [W_SPEC.platte],
  'Wäscheleine / Trockengestell': [['Deckenwäschetrockner (Seilzug)', 'Lager', 120, 50, 1, 'Hängt unter der Decke – Boden bleibt frei.'], W_SPEC.buegel]
});

/* ---------- 2) Teil antippen → richtig ändern ---------- */
AKT.studioTeil = (d) => {
  const o = studioObj(d), n = d.n, L = losStatus(o);
  const eigen = (L.eigene || []).find((e) => e.n === n);
  const knoepfe = [];
  if (eigen) knoepfe.push(['Entfernen', () => aendern(() => { L.eigene = L.eigene.filter((e) => e !== eigen); }, 'Eigenes Teil entfernt')]);
  else knoepfe.push(['Entfernen', () => aendern(() => { L.weg = (L.weg || []).concat([n]); if (L.wuensche) L.wuensche = L.wuensche.filter((x) => x !== n); }, 'Teil entfernt')]);
  altFuer(n).slice(0, 3).forEach((a) => knoepfe.push(['→ ' + a[0], () => aendern(() => {
    L.tausch = L.tausch || {}; L.tausch[n] = a[0];
    if (/Turm|Waschtrockner/.test(a[0])) { const anderes = /Trockner/.test(n) ? 'Waschmaschine' : 'Trockner'; L.weg = (L.weg || []).concat([anderes]); }
  }, 'Teil getauscht')]));
  knoepfe.push(['Eigener Wunsch …', () => setTimeout(() => wunschFragen(o, d, null, n), 50)]);
  knoepfe.push(['Abbrechen', null]);
  dialog('„' + n + '“ ändern', knoepfe);
};

/* Wunsch in Worten → Bauteil */
const WUNSCH = [
  [/unsichtbar|tapetent|verdeckt|geheim|wandbündig|bündig/, ['Unsichtbare Tür (wandbündig)', 'Wand & Bau', 90, 10, 210, 'Grifflos, in Wandfarbe gestrichen – führt in den hinteren Raum. Neuer Durchbruch: erst prüfen, ob die Wand tragend ist.']],
  [/schiebet/, ['Schiebetür', 'Wand & Bau', 100, 10, 210, 'Läuft vor oder in der Wand – spart den Schwenkbereich.']],
  [/tür/, ['Tür', 'Wand & Bau', 90, 10, 210, '']],
  [/fenster/, ['Fenster', 'Wand & Bau', 100, 10, 120, '']],
  [/turm|übereinander|auf (den|die) (trockner|waschmaschine)|über (den|die) (trockner|waschmaschine)|stapel/, W_SPEC.turm],
  [/schublade/, ['Regal mit Schubladen', 'Lager', 90, 45, 180, '']],
  [/hochschrank|besenschrank|putzschrank/, W_SPEC.hoch],
  [/hängeschrank|oberschrank/, ['Hängeschrank', 'Lager', 100, 35, 70, '']],
  [/schrank/, ['Schrank', 'Lager', 100, 60, 200, '']],
  [/wandregal|brett/, ['Wandregal', 'Lager', 100, 25, 40, '']],
  [/regal/, ['Regal', 'Lager', 90, 40, 180, '']],
  [/ausguss|waschbecken|becken/, ['Ausgussbecken', 'Sanitär', 60, 45, 85, '']],
  [/arbeitsplatte|ablage|falt|tisch/, ['Arbeitsplatte', 'Möbel', 120, 60, 90, '']],
  [/bügel/, W_SPEC.buegel],
  [/leine|trockengestell|wäscheständer/, ['Wäscheleine / Trockengestell', 'Lager', 150, 60, 100, '']],
  [/trockner/, ['Trockner', 'Technik', 60, 65, 85, '']],
  [/waschmaschine/, ['Waschmaschine', 'Technik', 60, 60, 85, '']],
  [/licht|lampe|leuchte/, ['Deckenleuchte', 'Licht', 30, 30, 5, '']],
  [/steckdose/, ['Steckdose', 'Elektro', 10, 5, 10, '']],
  [/pflanze/, ['Pflanze groß', 'Deko', 50, 50, 150, '']],
  [/sitz|bank|hocker/, ['Sitzbank', 'Möbel', 120, 40, 45, '']]
];
function wunschSpec(text, box) {
  const t = (text || '').toLowerCase().trim(); if (!t) return null;
  const treffer = WUNSCH.find(([re]) => re.test(t));
  const k = treffer ? treffer[1].slice() : [text.trim().slice(0, 40).replace(/^./, (c) => c.toUpperCase()), 'Möbel', 80, 40, 90, 'Eigener Wunsch.'];
  if (box) { // Maße aus der Zeichnung übernehmen (lange Seite = Breite)
    const lang = Math.max(box.w, box.h), kurz = Math.min(box.w, box.h);
    if (/Wand & Bau/.test(k[1])) k[2] = Math.round(Math.max(/Tür/.test(k[0]) ? 80 : 60, Math.min(lang, 200)) / 5) * 5;
    else { k[2] = Math.round(Math.max(20, lang) / 5) * 5; if (kurz > 15) k[3] = Math.round(Math.min(kurz, 120) / 5) * 5; }
  }
  return k;
}
const ZEICHEN_VORSCHLAG = ['Regal mit Schubladen', 'Hochschrank', 'Unsichtbare Tür', 'Tür', 'Arbeitsplatte', 'Wandregal', 'Waschmaschine auf Trockner'];

/* Eingabe-Panel für Wünsche (Tippen, Vorschlag antippen oder Mikrofon der Tastatur) */
function wunschFragen(o, d, box, ersetze) {
  document.getElementById('wunsch-panel')?.remove();
  const p = document.createElement('div'); p.id = 'wunsch-panel'; p.className = 'wunsch-panel';
  p.innerHTML = `<div class="wunsch-box"><b>${box ? 'Was soll hier hin?' : ersetze ? 'Was statt „' + esc(ersetze) + '“?' : 'Was möchtest du dazu?'}</b>
    <div class="zeile wrap">${ZEICHEN_VORSCHLAG.map((v) => `<button class="chip" data-w="${esc(v)}">${esc(v)}</button>`).join('')}</div>
    <input id="wunsch-text" placeholder="z. B. Regal mit Schubladen, unsichtbare Tür …" autocomplete="off">
    <p class="klein grau">Tipp: Mikrofon auf der Tastatur benutzen – einfach sagen, was du willst.</p>
    <div class="zeile"><button class="btn hell" data-x="1">Abbrechen</button><button class="btn" data-ok="1" style="flex:1">Einbauen</button></div></div>`;
  document.body.appendChild(p);
  const inp = p.querySelector('#wunsch-text'); setTimeout(() => inp.focus(), 50);
  const fertig = (txt) => {
    const k = wunschSpec(txt, box); if (!k) { toast('Bitte kurz sagen oder tippen, was hin soll'); return; }
    p.remove();
    const L = losStatus(o);
    aendern(() => {
      if (box) {
        const quer = box.w >= box.h, el = elAus(k, 0, 0, quer ? 0 : 90, { eigen: true, konzept: true });
        const f = fussabdruck(el); let x = box.x + box.w / 2 - f.w / 2, y = box.y + box.h / 2 - f.h / 2;
        // an die nächste Wand andocken, wenn nah dran (Türen, Schränke, Regale)
        const abst = [y, o.breite - (x + f.w), o.tiefe - (y + f.h), x], w = abst.indexOf(Math.min(...abst));
        if (Math.min(...abst) < 40 || /Wand & Bau/.test(k[1])) {
          const rot = [0, 90, 180, 270][w]; const el2 = elAus(k, 0, 0, rot, { eigen: true, konzept: true }); const f2 = fussabdruck(el2);
          x = w === 1 ? o.breite - f2.w : w === 3 ? 0 : Math.max(0, Math.min(o.breite - f2.w, box.x + box.w / 2 - f2.w / 2));
          y = w === 0 ? 0 : w === 2 ? o.tiefe - f2.h : Math.max(0, Math.min(o.tiefe - f2.h, box.y + box.h / 2 - f2.h / 2));
          el2.x = Math.round(x); el2.y = Math.round(y); L.eigene = (L.eigene || []).concat([el2]);
        } else { el.x = Math.round(Math.max(0, x)); el.y = Math.round(Math.max(0, y)); L.eigene = (L.eigene || []).concat([el]); }
      } else if (ersetze) {
        L.tausch = L.tausch || {}; EXTRA_SPECS[k[0]] = k; L.tausch[ersetze] = k[0];
        if (/Turm/.test(k[0])) L.weg = (L.weg || []).concat([/Trockner/.test(ersetze) ? 'Waschmaschine' : 'Trockner']);
        L.eigeneSpecs = Object.assign(L.eigeneSpecs || {}, { [k[0]]: k });
      } else {
        EXTRA_SPECS[k[0]] = k; L.eigeneSpecs = Object.assign(L.eigeneSpecs || {}, { [k[0]]: k });
        L.wuensche = (L.wuensche || standardWuensche(o)).concat([k[0]]); L.weg = (L.weg || []).filter((x) => x !== k[0]);
      }
    }, 'Eigener Wunsch: ' + k[0]);
    toast('Eingebaut: ' + k[0] + ' – die App prüft Tür, Fenster und Abstände');
    sprich(k[0] + ' eingebaut.', true);
  };
  p.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) { if (e.target === p) p.remove(); return; }
    if (b.dataset.x) p.remove(); else if (b.dataset.ok) fertig(inp.value); else if (b.dataset.w) fertig(b.dataset.w);
  });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') fertig(inp.value); });
}
/* eigene Specs nach Neuladen wieder kennen */
function eigeneSpecsLaden(o) { const L = losStatus(o); Object.assign(EXTRA_SPECS, L.eigeneSpecs || {}); }

/* ---------- 3) Stift auf dem Plan ---------- */
let STIFT = null;
AKT.studioStift = (d) => {
  const o = studioObj(d), box = document.querySelector('.studio-plan');
  if (!box) return;
  if (STIFT) { STIFT = null; render(); return; }
  STIFT = { d };
  stiftStarten(o, d);
};
function stiftStarten(o, d) {
  const box = document.querySelector('.studio-plan'); if (!box) return;
  box.classList.add('stift-an');
  const svg = box.querySelector('svg'); if (!svg) return;
  const cv = document.createElement('canvas'); cv.className = 'stift-flaeche';
  const R = svg.getBoundingClientRect(); cv.width = R.width * 2; cv.height = R.height * 2; box.appendChild(cv);
  const vb = svg.viewBox.baseVal, W = 320, sk = (W - 20) / Math.max(o.breite, o.tiefe), ox = 10 + ((W - 20) - o.breite * sk) / 2, oy = 10;
  const c = cv.getContext('2d'); c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#f28c28';
  let pts = null;
  const zuCm = (e) => { const r = cv.getBoundingClientRect(); const sx = (e.clientX - r.left) / r.width * vb.width, sy = (e.clientY - r.top) / r.height * vb.height; return [Math.max(0, Math.min(o.breite, (sx - ox) / sk)), Math.max(0, Math.min(o.tiefe, (sy - oy) / sk)), (e.clientX - r.left) * 2, (e.clientY - r.top) * 2]; };
  cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); pts = [zuCm(e)]; c.clearRect(0, 0, cv.width, cv.height); c.beginPath(); c.moveTo(pts[0][2], pts[0][3]); });
  cv.addEventListener('pointermove', (e) => { if (!pts) return; const p = zuCm(e); pts.push(p); c.lineTo(p[2], p[3]); c.stroke(); });
  cv.addEventListener('pointerup', () => {
    if (!pts || pts.length < 3) { pts = null; return; }
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    let bx = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    if (bx.w < 15 && bx.h < 15) { pts = null; toast('Etwas größer zeichnen – einen Kasten oder Strich'); return; }
    if (bx.w < 20) { bx.x -= 10; bx.w = 20; } if (bx.h < 20) { bx.y -= 10; bx.h = 20; }
    c.strokeStyle = '#f28c28'; c.setLineDash([10, 8]); c.strokeRect((ox + bx.x * sk) / vb.width * cv.width, (oy + bx.y * sk) / vb.height * cv.height, bx.w * sk / vb.width * cv.width, bx.h * sk / vb.height * cv.height); c.setLineDash([]);
    pts = null; STIFT = null; wunschFragen(o, d, bx);
  });
  toast('Zeichne mit dem Finger, wo etwas hin soll – Kasten oder Strich');
}
AKT.studioWunsch = (d) => wunschFragen(studioObj(d), d, null, null);
HILFE.studioStift = 'Mit dem Finger auf den Plan zeichnen, wo etwas hin soll – dann sagen oder tippen, was es ist.';
