/* Joum 4D Build – Geführter Projektstart
   1 Wie anfangen? (Raum-Foto + Zollstock · Skizze zeichnen/fotografieren · Vorbild-Bild „So eins will ich“ · Maße eintippen)
   2 Maße (Vorschläge, Fenster, Tür)  3 Wünsche & Stil  4 Vorschläge: Plan, machbar?, Kosten, Material, KI-Alternativen */

if (typeof ICON !== 'undefined') {
  ICON.stift = ICON.stift || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 6l3 3"/></svg>';
  ICON.bild = ICON.bild || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>';
}
const WICHTIG = /^WC|Waschtisch|Handwaschbecken|Spüle|Herd|Kochfeld|Kühlschrank|bett|Bett|Esstisch|Schreibtisch|Waschmaschine|Garderobe|Sofa/;
const WAND_NAME = ['obere Wand', 'rechte Wand', 'untere Wand', 'linke Wand (Tür)'];
const ALTERNATIVEN = {
  'Badewanne': [['Dusche bodengleich', 'Sanitär', 90, 120, 1, 'Statt Wanne: bodengleiche Dusche.'], ['Dusche 90×90', 'Sanitär', 90, 90, 1, 'Kompakte Dusche – passt in kleine Bäder.'], ['Dusche 80×80', 'Sanitär', 80, 80, 1, 'Sehr kompakte Dusche.']],
  'Dusche bodengleich': [['Dusche 90×90', 'Sanitär', 90, 90, 1, 'Kompakte Dusche.'], ['Dusche 80×80', 'Sanitär', 80, 80, 1, 'Sehr kompakte Dusche.']],
  'Waschtisch': [['Handwaschbecken', 'Sanitär', 45, 25, 85, 'Platzsparend.']],
  'Doppelbett 180': [['Bett 140', 'Möbel', 140, 200, 45, 'Schmaleres Bett.'], ['Bett 120', 'Möbel', 120, 200, 45, '']],
  'Kleiderschrank': [['Kleiderschrank 150', 'Möbel', 150, 60, 230, 'Schmalerer Schrank.'], ['Kommode', 'Möbel', 120, 50, 85, '']],
  'Sofa 3-Sitzer': [['Sofa 2-Sitzer', 'Möbel', 160, 90, 85, 'Kleineres Sofa.'], ['Sessel', 'Möbel', 80, 85, 90, '']],
  'Ecksofa': [['Sofa 3-Sitzer', 'Möbel', 220, 95, 85, ''], ['Sofa 2-Sitzer', 'Möbel', 160, 90, 85, '']],
  'Lounge-Sofa': [['Sofa 2-Sitzer', 'Möbel', 160, 90, 85, '']],
  'Esstisch 8 Pers.': [['Esstisch 6 Pers.', 'Möbel', 180, 90, 75, ''], ['Esstisch 4 Pers.', 'Möbel', 120, 80, 75, '']],
  'Esstisch 6 Pers.': [['Esstisch 4 Pers.', 'Möbel', 120, 80, 75, ''], ['Bistrotisch', 'Möbel', 60, 60, 75, '']],
  'Esstisch 4 Pers.': [['Bistrotisch', 'Möbel', 60, 60, 75, '']],
  'Kücheninsel': [['Halbinsel / Theke', 'Küche', 120, 60, 92, 'Theke an der Wand statt freistehender Insel.']],
  'Schreibtisch': [['Schreibtisch kompakt', 'Möbel', 110, 60, 75, '']],
  'Schreibtisch höhenverstellbar': [['Schreibtisch kompakt', 'Möbel', 110, 60, 75, '']],
  'Sideboard': [['Kommode', 'Möbel', 120, 50, 85, '']],
  'TV-Board': [['TV-Board klein', 'Möbel', 120, 40, 50, '']],
  'Regal hoch': [['Wandregal schmal', 'Möbel', 60, 30, 180, '']],
  'Schranksystem offen': [['Kleiderstange', 'Möbel', 100, 45, 160, '']]
};
function altFuer(n) {
  if (ALTERNATIVEN[n]) return ALTERNATIVEN[n];
  const k = Object.keys(ALTERNATIVEN).find((b) => { const w = b.split(/[ \d]/)[0]; return w.length > 3 && new RegExp(w, 'i').test(n); });
  return k ? ALTERNATIVEN[k].filter((a) => a[0] !== n) : [];
}
/* grobe Preise (Material/Möbel, ohne Montage) – Spanne günstig … hochwertig */
const PREISE = [
  [/Dusche bodengleich/, 600, 2500], [/Dusche/, 400, 1500], [/Badewanne/, 300, 1500], [/^WC/, 400, 1200], [/Waschtisch/, 150, 900], [/Handwaschbecken/, 80, 350],
  [/Spiegelschrank/, 100, 600], [/Spiegel/, 40, 300], [/Handtuchheizkörper/, 150, 600], [/Lüfter/, 80, 350], [/Waschmaschine|Trockner/, 400, 900], [/Ausgussbecken/, 80, 250],
  [/Kühlschrank/, 300, 1500], [/Spüle/, 200, 800], [/Geschirrspüler/, 350, 1000], [/Unterschrank|Hängeschrank/, 90, 350], [/Herd|Kochfeld/, 300, 1500], [/Dunstabzug/, 200, 1200],
  [/Kücheninsel/, 1500, 6000], [/Halbinsel|Theke/, 500, 2000], [/Backofen/, 300, 1200], [/Arbeitsplatte/, 150, 800],
  [/Ecksofa/, 700, 3500], [/Sofa/, 300, 2500], [/Sessel/, 150, 900], [/Couchtisch/, 60, 500], [/TV-Board/, 100, 700], [/Fernseher/, 300, 1500],
  [/Esstisch|Bistrotisch/, 150, 1200], [/Stuhl/, 40, 250], [/Sideboard|Vitrine/, 150, 900], [/Doppelbett/, 300, 2000], [/bett/i, 200, 1200], [/Nachttisch/, 40, 250],
  [/Kleiderschrank|Schranksystem/, 250, 2000], [/Kommode/, 100, 600], [/Schreibtisch/, 100, 700], [/Bürostuhl|Gaming/, 80, 600], [/Regal/, 40, 300],
  [/Garderobe/, 80, 500], [/Schuhschrank/, 60, 300], [/Teppich/, 50, 600], [/Pflanze/, 20, 150], [/LED|Indirekt/, 60, 300], [/Rauchmelder/, 20, 40], [/leuchte|Licht|Lampe/i, 30, 300]
];
const PREIS_GRUPPE = { 'Möbel': [100, 600], 'Sanitär': [150, 800], 'Küche': [200, 1200], 'Licht': [30, 250], 'Deko': [20, 150], 'Technik': [50, 400], 'Lager': [40, 300], 'Wand & Bau': [50, 400], 'Sicherheit': [20, 100] };
function preisFuer(n, g) { const t = PREISE.find(([re]) => re.test(n)); return t ? [t[1], t[2]] : (PREIS_GRUPPE[g] || [50, 300]); }

/* Fenster: Zone vor dem Fenster (60 cm tief) – dort nichts Hohes, keine Dusche, kein Spiegel */
function fensterZone(p) {
  const F = p.fensterPos; if (!F) return null;
  const t = 60;
  return [{ x: F.s, y: 0, w: F.b, h: t }, { x: p.breite - t, y: F.s, w: t, h: F.b }, { x: F.s, y: p.tiefe - t, w: F.b, h: t }, { x: 0, y: F.s, w: t, h: F.b }][F.wand];
}
function fensterGrund(n, h, eb) {
  if (/Dusche/.test(n)) return 'Fenster im Spritzwasserbereich – Holz/Dichtung leidet, Sichtschutz fehlt';
  if (/Spiegel/.test(n)) return 'Spiegel kann nicht vor das Fenster';
  if (eb === 'wand' && !/Lüfter|Vorhang/.test(n)) return 'an der Wand ist dort das Fenster';
  if ((h || 0) > 95) return 'zu hoch – würde das Fenster verdecken (Licht, Öffnen, Fluchtweg)';
  return '';
}
function fensterKonflikt(p, f, n, h, eb) {
  const z = fensterZone(p); if (!z || eb === 'decke') return false;
  if (!schneidet(f, z)) return false;
  if (/Heizkörper|Heizung|Badewanne|Sitzbank|Teppich|Nachttisch|Couchtisch|Stuhl|Pflanze|Vorhang|Lüfter/.test(n)) return false;
  return !!fensterGrund(n, h, eb);
}

/* ---------- Start ---------- */
function losStatus(p) { p.los = p.los || {}; return p.los; }
function typischeMasse(p) {
  const r = raum(p.raum) || { w: 300, d: 300 };
  const rund = (x) => Math.round(x / 5) * 5;
  return [['klein', rund(r.w * 0.75), rund(r.d * 0.75)], ['mittel', r.w, r.d], ['groß', rund(r.w * 1.35), rund(r.d * 1.3)]];
}

route('loslegen', (id, q) => {
  const p = projekt(id);
  if (!p) return kopf('Kein Projekt', '', '#/projekte');
  if (p.bereich === 'innen' && typeof studioSeite === 'function' && !(q && q.alt)) return studioSeite(p.raum, { p: p.id });
  const L = losStatus(p), s = Number(q.s || 1);
  const stufen = ['Start', 'Maße', 'Wünsche', 'Vorschläge'];
  const leiste = `<div class="los-leiste">${stufen.map((t, i) => `<a class="los-stufe ${i + 1 === s ? 'an' : i + 1 < s ? 'fertig' : ''}" href="#/loslegen/${p.id}?s=${i + 1}"><b>${i + 1}</b><span>${t}</span></a>`).join('')}</div>`;
  const zurueck = s > 1 ? '#/loslegen/' + p.id + '?s=' + (s - 1) : '#/raum/' + p.raum;
  return kopf(['Wie willst du anfangen?', 'Maße deines Raums', 'Was soll rein?', 'Vorschläge für dich'][s - 1] || 'Planen', p.name, zurueck) + `<div class="inhalt los">${leiste}${[losSchritt1, losSchritt2, losSchritt3, losSchritt4][s - 1](p, L)}</div>`;
});

function bilderLeiste(p) {
  const b = [[p.raumFoto, 'Raum-Foto'], [p.skizze, 'Skizze'], [p.vorbild, 'Vorbild']].filter((x) => x[0]);
  return b.length ? `<div class="los-bilder">${b.map(([u, t]) => `<figure><img src="${u}" alt="${t}"><figcaption>${t}</figcaption></figure>`).join('')}</div>` : '';
}

function losSchritt1(p) {
  return `<p class="klein">Wähle, womit du startest – du kannst auch mehreres machen. Danach schlage ich dir Maße, Einrichtung, Kosten und Material vor.</p>
  ${bilderLeiste(p)}
  <div class="los-karten">
    <a class="los-karte" href="#/fotomessen/${p.id}?z=los">${ICON.kamera}<b>Raum fotografieren</b><span>Foto mit Zollstock an der Wand – die App misst daraus Breite, Tiefe und Höhe.</span></a>
    <a class="los-karte" href="#/skizze/${p.id}">${ICON.stift || ICON.wuerfel}<b>Skizze zeichnen</b><span>Mit dem Finger auf Kästchenpapier zeichnen – direkt in der App.</span></a>
    ${dateiKnopf('Skizze auf Papier fotografieren', 'losSkizzeFoto', { id: p.id }, { icon: ICON.kamera, klasse: 'los-karte-knopf' })}
    ${dateiKnopf('Vorbild-Bild hochladen („So eins will ich“)', 'losVorbild', { id: p.id }, { icon: ICON.bild || ICON.kamera, klasse: 'los-karte-knopf' })}
    <a class="los-karte" href="#/loslegen/${p.id}?s=2">${ICON.rechner}<b>Maße eintippen</b><span>Du kennst die Maße schon? Dann direkt weiter.</span></a>
  </div>
  <a class="btn hell voll" href="#/loslegen/${p.id}?s=2">Weiter zu den Maßen</a>
  ${ANLEITUNGEN[p.anleitung] ? `<a class="btn voll" href="#/projekt/${p.id}">Überspringen – direkt zur Anleitung</a>` : ''}`;
}
EIN.losVorbild = (v, d, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 1000, (url) => { aendern(() => { projekt(d.id).vorbild = url; }, 'Vorbild gespeichert'); toast('Vorbild gespeichert'); geh('#/loslegen/' + d.id + '?s=2'); }); };
EIN.losSkizzeFoto = (v, d, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 1200, (url) => { aendern(() => { projekt(d.id).skizze = url; }, 'Skizze gespeichert'); toast('Skizze gespeichert'); geh('#/loslegen/' + d.id + '?s=2'); }); };

/* ---------- 2 Maße ---------- */
function raumSVG(p, plan, opt) {
  opt = opt || {};
  const W = 320, sk = (W - 20) / Math.max(p.breite, p.tiefe), bw = p.breite * sk, bt = p.tiefe * sk, ox = 10 + ((W - 20) - bw) / 2, oy = 10;
  const H = bt + 20;
  let s = `<svg class="los-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grundriss ${zahl(p.breite / 100)} × ${zahl(p.tiefe / 100)} m"><rect x="${ox}" y="${oy}" width="${bw}" height="${bt}" fill="#151515" stroke="#fff" stroke-width="2"/>`;
  // Raster 50 cm
  for (let x = 50; x < p.breite; x += 50) s += `<line x1="${ox + x * sk}" y1="${oy}" x2="${ox + x * sk}" y2="${oy + bt}" stroke="#2a2a2a" stroke-width="0.6"/>`;
  for (let y = 50; y < p.tiefe; y += 50) s += `<line x1="${ox}" y1="${oy + y * sk}" x2="${ox + bw}" y2="${oy + y * sk}" stroke="#2a2a2a" stroke-width="0.6"/>`;
  // Tür links Mitte
  const tz = tuerZone(p), ty = oy + (p.tiefe / 2 - 45) * sk, tl = 90 * sk;
  s += `<line x1="${ox}" y1="${ty}" x2="${ox}" y2="${ty + tl}" stroke="#151515" stroke-width="4"/><line x1="${ox}" y1="${ty}" x2="${ox + tl}" y2="${ty}" stroke="#ffd27a" stroke-width="1.5"/><path d="M${ox + tl} ${ty} A${tl} ${tl} 0 0 1 ${ox} ${ty + tl}" fill="none" stroke="#ffd27a" stroke-width="1" stroke-dasharray="3 2"/>`;
  if (opt.zone) s += `<rect x="${ox}" y="${oy + tz.y * sk}" width="${tz.w * sk}" height="${tz.h * sk}" fill="#ffd27a" opacity=".08"/>`;
  // Fenster
  const F = p.fensterPos;
  if (F) {
    const a = F.s * sk, l = F.b * sk;
    const [x1, y1, x2, y2] = [[ox + a, oy, ox + a + l, oy], [ox + bw, oy + a, ox + bw, oy + a + l], [ox + a, oy + bt, ox + a + l, oy + bt], [ox, oy + a, ox, oy + a + l]][F.wand];
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6ec6ff" stroke-width="6"/>`;
    if (opt.zone) { const z = fensterZone(p); s += `<rect x="${ox + z.x * sk}" y="${oy + z.y * sk}" width="${z.w * sk}" height="${z.h * sk}" fill="#6ec6ff" opacity=".12"/>`; }
  }
  (plan || []).forEach((e) => {
    const f = fussabdruck(e), fa = (typeof GRUPPEN_FARBE !== 'undefined' && GRUPPEN_FARBE[e.g]) || '#999', dk = ebene(e.n) === 'decke';
    if (dk) return;
    s += `<rect x="${ox + f.x * sk}" y="${oy + f.y * sk}" width="${Math.max(2, f.w * sk)}" height="${Math.max(2, f.h * sk)}" rx="2" fill="${fa}" fill-opacity=".85" stroke="${e.neu ? '#ffd27a' : '#000'}" stroke-width="${e.neu ? 2 : 0.6}"/>`;
    const kurz = e.n.split(/[ /(]/)[0];
    if (f.w * sk > 26 && f.h * sk > 11) s += `<text x="${ox + (f.x + f.w / 2) * sk}" y="${oy + (f.y + f.h / 2) * sk + 3}" font-size="${Math.min(10, f.w * sk / kurz.length * 1.6)}" text-anchor="middle" fill="#000">${esc(kurz)}</text>`;
  });
  s += `<text x="${ox + bw / 2}" y="${H - 1}" font-size="9" text-anchor="middle" fill="#888">${zahl(p.breite / 100)} m</text></svg>`;
  return s;
}

function losSchritt2(p) {
  const F = p.fensterPos, hoehe = p.hoehe || 250;
  const wandL = (w) => (w % 2 ? p.tiefe : p.breite);
  return `${bilderLeiste(p)}
  <section class="karte"><h3>Raumgröße</h3>
    <div class="zeile wrap">${typischeMasse(p).map(([t, b, d]) => `<button class="chip ${p.breite === b && p.tiefe === d ? 'an' : ''}" data-akt="losMassVorschlag" data-id="${p.id}" data-b="${b}" data-d="${d}">${t}: ${zahl(b / 100)} × ${zahl(d / 100)} m</button>`).join('')}</div>
    <p class="klein">${p.gemessen ? '✓ Aus deinem Foto gemessen – bitte prüfen.' : 'Vorschläge für diesen Raumtyp – oder trag deine echten Maße ein.'}</p>
    <div class="raster3">
      <label class="feld">Breite (m)<input inputmode="decimal" data-ein="losMass" data-id="${p.id}" data-k="breite" value="${zahl(p.breite / 100)}"></label>
      <label class="feld">Tiefe (m)<input inputmode="decimal" data-ein="losMass" data-id="${p.id}" data-k="tiefe" value="${zahl(p.tiefe / 100)}"></label>
      <label class="feld">Höhe (m)<input inputmode="decimal" data-ein="losMass" data-id="${p.id}" data-k="hoehe" value="${zahl(hoehe / 100)}"></label>
    </div>
  </section>
  <section class="karte"><h3>Fenster</h3>
    <div class="zeile wrap"><button class="chip ${!F && p.fenster === false ? 'an' : ''}" data-akt="losFenster" data-id="${p.id}" data-w="-1">Kein Fenster</button>${[0, 1, 2].map((w) => `<button class="chip ${F && F.wand === w ? 'an' : ''}" data-akt="losFenster" data-id="${p.id}" data-w="${w}">${WAND_NAME[w]}</button>`).join('')}</div>
    ${F ? `<div class="raster2">
      <label class="feld">Abstand von der Ecke (cm)<input inputmode="numeric" data-ein="losFensterMass" data-id="${p.id}" data-k="s" value="${Math.round(F.s)}"></label>
      <label class="feld">Fensterbreite (cm)<input inputmode="numeric" data-ein="losFensterMass" data-id="${p.id}" data-k="b" value="${Math.round(F.b)}"></label></div>
      <p class="klein">Wand ist ${zahl(wandL(F.wand) / 100)} m lang. Vor dem Fenster plane ich nichts Hohes, keine Dusche und keinen Spiegel.</p>` : '<p class="klein">Die Tür ist links in der Mitte (gelb). Fenster antippen, damit ich drumherum plane.</p>'}
  </section>
  ${raumSVG(p, [], { zone: true })}
  <a class="btn hell voll" href="#/loslegen/${p.id}?s=3">Weiter: Was soll rein?</a>`;
}
AKT.losMassVorschlag = (d) => aendern(() => { const p = projekt(d.id); p.breite = Number(d.b); p.tiefe = Number(d.d); losMasseAnpassen(p); }, 'Maße gewählt');
EIN.losMass = (v, d) => {
  const n = parseZahl(v); if (!(n > 0.5 && n < 30)) { toast('Bitte Maß in Metern, z. B. 3,20'); return; }
  aendern(() => { const p = projekt(d.id); if (d.k === 'hoehe') p.hoehe = Math.round(n * 100); else p[d.k] = Math.round(n * 100); losMasseAnpassen(p); }, 'Maß geändert');
};
function losMasseAnpassen(p) {
  const h = (p.hoehe || 250) / 100;
  p.waende = [{ n: 'Wand A', l: p.breite / 100, h }, { n: 'Wand B', l: p.tiefe / 100, h }, { n: 'Wand C', l: p.breite / 100, h }, { n: 'Wand D', l: p.tiefe / 100, h }];
  if (p.fensterPos) { const L = p.fensterPos.wand % 2 ? p.tiefe : p.breite; p.fensterPos.b = Math.min(p.fensterPos.b, L - 20); p.fensterPos.s = Math.max(10, Math.min(p.fensterPos.s, L - p.fensterPos.b - 10)); }
  if (typeof standardMenge === 'function') p.menge = standardMenge(p);
}
AKT.losFenster = (d) => aendern(() => {
  const p = projekt(d.id), w = Number(d.w);
  if (w < 0) { delete p.fensterPos; p.fenster = false; return; }
  const L = w % 2 ? p.tiefe : p.breite, b = Math.min(120, L - 40);
  p.fensterPos = { wand: w, b, s: Math.round((L - b) / 2) }; p.fenster = true;
  const fa = (p.aussparungen || []).find((x) => /Fenster/.test(x.n)); if (fa) fa.b = b / 100;
}, 'Fenster gesetzt');
EIN.losFensterMass = (v, d) => aendern(() => { const p = projekt(d.id); if (!p.fensterPos) return; p.fensterPos[d.k] = Math.max(0, parseZahl(v)); losMasseAnpassen(p); }, 'Fenster geändert');

/* ---------- 3 Wünsche ---------- */
function standardWuensche(p) {
  const leer = JSON.parse(JSON.stringify(p)); leer.plan = []; delete leer.fensterPos;
  const v = beispielEinrichtung(leer);
  return [...new Set(v.plan.filter((e) => !e.gruppe && !/^Stuhl$|Lüfter/.test(e.n)).map((e) => e.n))];
}
function losSchritt3(p, L) {
  if (!L.wuensche) L.wuensche = standardWuensche(p);
  const kat = katalogFuer(p).filter((k) => !/^Stuhl$/.test(k[0]));
  const gruppen = {}; kat.forEach((k) => { (gruppen[k[1]] = gruppen[k[1]] || []).push(k); });
  const reihenfolge = ['Sanitär', 'Küche', 'Möbel', 'Lager', 'Technik', 'Licht', 'Deko', 'Wand & Bau', 'Sicherheit'];
  return `${p.vorbild ? `<section class="karte"><div class="zeile"><img class="los-vorbild" src="${p.vorbild}" alt="Vorbild"><p class="klein" style="flex:1">Dein Vorbild. Tippe unten an, was aus dem Bild in deinen Raum soll. (Automatisches Erkennen aus dem Bild kommt mit dem KI-Server.)</p></div></section>` : ''}
  <section class="karte"><h3>Was soll in den Raum?</h3><p class="klein">Vorausgewählt ist eine typische Einrichtung. Antippen zum Hinzufügen/Entfernen.</p>
    ${reihenfolge.filter((g) => gruppen[g]).map((g) => `<div class="unter">${g}</div><div class="zeile wrap">${[...new Map(gruppen[g].map((k) => [k[0], k])).values()].map((k) => `<button class="chip ${L.wuensche.includes(k[0]) ? 'an' : ''}" data-akt="losWunsch" data-id="${p.id}" data-n="${esc(k[0])}">${esc(k[0])}</button>`).join('')}</div>`).join('')}
  </section>
  <section class="karte"><h3>Stil</h3><div class="zeile wrap">${STILE.map((st) => `<button class="chip ${p.stil === st.id ? 'an' : ''}" data-akt="losStil" data-id="${p.id}" data-s="${st.id}">${esc(st.name)}</button>`).join('')}</div></section>
  <section class="karte"><h3>Budget</h3><div class="zeile wrap">${[['spar', 'Günstig'], ['mittel', 'Mittel'], ['hoch', 'Hochwertig']].map(([k, t]) => `<button class="chip ${(L.budget || 'mittel') === k ? 'an' : ''}" data-akt="losBudget" data-id="${p.id}" data-b="${k}">${t}</button>`).join('')}</div></section>
  <a class="btn hell voll" href="#/loslegen/${p.id}?s=4">Vorschläge berechnen</a>`;
}
AKT.losWunsch = (d) => aendern(() => { const L = losStatus(projekt(d.id)); L.wuensche = L.wuensche || []; const i = L.wuensche.indexOf(d.n); if (i >= 0) L.wuensche.splice(i, 1); else L.wuensche.push(d.n); }, 'Wunsch geändert');
AKT.losStil = (d) => aendern(() => { projekt(d.id).stil = d.s; }, 'Stil gewählt');
AKT.losBudget = (d) => aendern(() => { losStatus(projekt(d.id)).budget = d.b; }, 'Budget gewählt');

/* ---------- 4 Vorschläge ---------- */
function warumNicht(v, k) {
  const [n, , w, d0] = k, d = Math.max(d0, 4);
  if (Math.min(w, d) > Math.min(v.breite, v.tiefe) || Math.max(w, d) > Math.max(v.breite, v.tiefe)) return `zu groß für den Raum (${w}×${d} cm bei ${v.breite}×${v.tiefe} cm)`;
  if (v.fensterPos) { const o = JSON.parse(JSON.stringify(v)); delete o.fensterPos; if (!platzieren(o, k).eng) return `Platz wäre nur vor dem Fenster – ${fensterGrund(n, k[4], ebene(n)) || 'dort nicht sinnvoll'}`; }
  return `kein Platz mehr frei: braucht ${w}×${d} cm plus ${vorne(n)} cm Bewegungsfläche davor (Tür muss frei bleiben)`;
}
function wandVon(e) { return (((e.rot || 0) % 360 + 360) % 360) / 90; }
function losBauen(p, liste, opt) {
  opt = opt || {};
  const v = JSON.parse(JSON.stringify(p)); v.plan = []; if (opt.dreh) v._wandDreh = opt.dreh; if (opt.folge) v._wandFolge = opt.folge;
  const ergebnis = [];
  (opt.vorplan || []).forEach((e) => { const el = JSON.parse(JSON.stringify(e)); v.plan.push(el); if (!/Trennwand|Halbhohe Wand|Raumteiler|Walk-in Dusche \(2/.test(el.n)) ergebnis.push({ n: el.n, ok: true, el }); });
  liste.forEach((k0) => {
    const versuche = [k0].concat(opt.alternativen ? altFuer(k0[0]) : []);
    let gesetzt = null, grund = '';
    for (const k of versuche) {
      if (k[2] > v.breite && k[3] > v.breite) { if (!grund) grund = warumNicht(v, k); continue; }
      const pl = platzieren(v, k);
      if (pl.eng) { if (!grund) grund = warumNicht(v, k); continue; }
      const el = { id: uid(), n: k[0], g: k[1], w: k[2], d: Math.max(k[3], 4), h: k[4], hint: k[5], x: pl.x, y: pl.y, rot: pl.rot || 0 };
      if (pl.gruppe) el.gruppe = pl.gruppe;
      v.plan.push(el); if (istTisch(el.n)) essgruppeHinzufuegen(v, el);
      gesetzt = { el, ersatz: k !== k0 ? k0[0] : null };
      break;
    }
    if (!gesetzt) {
      let tipp = '';
      if (v.fensterPos) { const o = JSON.parse(JSON.stringify(v)); delete o.fensterPos; const k = versuche.find((kk) => !platzieren(o, kk).eng); if (k) { grund = `${k[0]} würde nur vor dem Fenster passen (${fensterGrund(k[0], k[4], ebene(k[0])) || 'dort ungünstig'})`; tipp = /Dusche|Badewanne/.test(k[0]) ? 'Machbar, wenn das Fenster im Spritzbereich wasserfest ist (Kunststoff, Milchglas) – mit dem Fensterbauer klären.' : 'Prüfe, ob das Fenster kleiner/höher sein kann oder ein anderes Teil wegfällt.'; } }
      if (!tipp && versuche.length > 1) grund += ' – auch kleinere Varianten (' + versuche.slice(1).map((k) => k[0]).join(', ') + ') passen nicht';
      ergebnis.push({ n: k0[0], ok: false, grund, tipp }); return;
    }
    const r = { n: k0[0], ok: true, el: gesetzt.el, ersatz: gesetzt.ersatz, grundErsatz: gesetzt.ersatz ? grund : '' };
    // wäre es ohne Fenster-Regel vor dem Fenster gelandet? → Hinweis „woanders aufgestellt“
    if (v.fensterPos && ebene(gesetzt.el.n) !== 'decke') {
      const o = JSON.parse(JSON.stringify(v)); delete o.fensterPos; o.plan = o.plan.filter((e) => e.id !== gesetzt.el.id);
      const kk = [gesetzt.el.n, gesetzt.el.g, gesetzt.el.w, gesetzt.el.d, gesetzt.el.h];
      const ohne = platzieren(o, kk);
      if (!ohne.eng && fensterKonflikt(v, fussabdruck(Object.assign({}, gesetzt.el, ohne)), gesetzt.el.n, gesetzt.el.h, ebene(gesetzt.el.n))) r.verschoben = fensterGrund(gesetzt.el.n, gesetzt.el.h, ebene(gesetzt.el.n));
    }
    ergebnis.push(r);
  });
  if (NASS.includes(v.raum) && !v.fensterPos && !v.plan.some((e) => /Lüfter/.test(e.n))) {
    v.plan.push({ id: uid(), n: 'Lüfter', g: 'Technik', w: 15, d: 10, h: 15, x: v.breite - 10, y: Math.max(5, v.tiefe * 0.25), rot: 90 });
    ergebnis.push({ n: 'Lüfter', ok: true, neu: true, grundNeu: 'Bad ohne Fenster braucht eine Entlüftung nach draußen (DIN 18017-3) – gegenüber der Tür eingeplant.' });
  }
  delete v._wandDreh; delete v._wandFolge;
  return { plan: v.plan, ergebnis };
}
function losKosten(p, plan) {
  const L = losStatus(p), b = L.budget || 'mittel', anteil = { spar: 0.15, mittel: 0.45, hoch: 0.8 }[b], fk = typeof stilMix === 'function' ? stilMix(p).faktor : 1;
  const zeilen = {}; plan.forEach((e) => { const k = e.n; zeilen[k] = zeilen[k] || { n: k, g: e.g, anz: 0 }; zeilen[k].anz++; });
  let min = 0, max = 0, wert = 0;
  const liste = Object.values(zeilen).map((z) => { let [a, c] = preisFuer(z.n, z.g); a = Math.round(a * fk); c = Math.round(c * fk); const x = a + (c - a) * anteil; min += a * z.anz; max += c * z.anz; wert += x * z.anz; return Object.assign(z, { preis: x, a, c }); });
  const anl = ANLEITUNGEN[p.anleitung];
  let arbeit = null;
  if (anl && anl.kosten && p.menge) arbeit = { t: anl.t, menge: p.menge, einheit: anl.einheit, selbst: anl.kosten[0] * p.menge, profi: anl.kosten[1] * p.menge };
  const montage = Math.round(wert * 0.35);
  return { liste, min, max, wert, arbeit, montage };
}
function losVarianten(p) {
  const L = losStatus(p); if (!L.wuensche) L.wuensche = standardWuensche(p);
  const kat = katalogFuer(p);
  const specs = L.wuensche.map((n) => kat.find((k) => k[0] === n) || Object.values(ALTERNATIVEN).flat().find((k) => k[0] === n)).filter(Boolean);
  const flaeche = (k) => k[2] * Math.max(k[3], 4);
  const grossZuerst = specs.slice().sort((a, b) => flaeche(b) - flaeche(a));
  // Wichtiges zuerst (WC, Waschtisch, Küche, Bett …), dann Großes – Wand-/Deckenteile zuletzt
  const prio = (k) => (ebene(k[0]) !== 'boden' ? 2 : WICHTIG.test(k[0]) ? 0 : 1);
  const wichtigZuerst = specs.slice().sort((a, b) => (prio(a) - prio(b)) || (flaeche(b) - flaeche(a)));
  const kandidaten = [
    ['Dein Wunsch', 'Genau deine Auswahl.', losBauen(p, specs)],
    ['KI-Vorschlag: passend gemacht', 'Das Wichtigste zuerst; was nicht passt, ersetze ich durch eine kleinere Variante.', losBauen(p, wichtigZuerst, { alternativen: true })],
    ['KI-Vorschlag: Großes Wunschteil behalten', 'Das größte Teil bleibt, dafür wird Anderes kleiner.', losBauen(p, grossZuerst, { alternativen: true })],
    ['KI-Vorschlag: andere Anordnung', 'Gleiche Wünsche, an anderen Wänden aufgestellt.', losBauen(p, wichtigZuerst, { alternativen: true, dreh: 2 })]
  ];
  const gesehen = new Set(), out = [];
  kandidaten.forEach(([t, u, r]) => { const sig = JSON.stringify(r.plan.map((e) => [e.n, Math.round(e.x), Math.round(e.y), e.rot])); if (gesehen.has(sig)) return; gesehen.add(sig); out.push({ titel: t, unter: u, plan: r.plan, ergebnis: r.ergebnis, kosten: losKosten(p, r.plan) }); });
  out.splice(3);
  out.forEach((v) => { v.ok = v.ergebnis.filter((x) => x.ok && !x.neu).length; v.fehlt = v.ergebnis.filter((x) => !x.ok).length; v.ersetzt = v.ergebnis.filter((x) => x.ersatz).length; });
  const beste = out.slice().sort((a, b) => (a.fehlt - b.fehlt) || (a.ersetzt - b.ersetzt))[0];
  if (beste) beste.empfohlen = true;
  return out;
}
let LOS_CACHE = null;
function losSchritt4(p, L) {
  const vs = losVarianten(p); LOS_CACHE = { id: p.id, vs };
  const st = STILE.find((x) => x.id === p.stil);
  const alleOk = vs[0] && vs[0].fehlt === 0;
  const kopfzeile = alleOk ? `<div class="hinweis gruen">✓ Dein Wunsch ist machbar in ${zahl(p.breite / 100)} × ${zahl(p.tiefe / 100)} m.</div>`
    : `<div class="hinweis">⚠ Nicht alles passt in ${zahl(p.breite / 100)} × ${zahl(p.tiefe / 100)} m${p.fensterPos ? ' mit dem Fenster an der ' + WAND_NAME[p.fensterPos.wand] : ''}. Ich habe dir passende Alternativen gemacht.</div>`;
  return `${kopfzeile}${st ? `<p class="klein">Stil: <b>${esc(st.name)}</b> – ${esc(st.text)}</p>` : ''}
  ${vs.map((v, i) => `<section class="karte los-variante ${v.empfohlen ? 'empfohlen' : ''}">
    <div class="zeile"><h3 style="flex:1">${esc(v.titel)}</h3>${v.empfohlen ? '<span class="badge gruen">Empfehlung</span>' : ''}</div>
    <p class="klein">${esc(v.unter)}</p>
    ${raumSVG(p, v.plan)}
    <ul class="los-pruef">${v.ergebnis.map((x) => x.ok
      ? `<li class="${x.ersatz || x.verschoben || x.neu ? 'gelb' : 'ok'}">${x.neu ? '＋' : x.ersatz ? '↺' : '✓'} <b>${esc(x.el ? x.el.n : x.n)}</b>${x.ersatz ? ` statt ${esc(x.ersatz)} – ${esc(x.grundErsatz)}` : ''}${x.verschoben ? ` – nicht vors Fenster (${esc(x.verschoben)}), sondern ${p.fensterPos && wandVon(x.el) === p.fensterPos.wand ? 'daneben' : 'an die ' + (WAND_NAME[wandVon(x.el)] || 'Raummitte')}` : ''}${x.neu ? ' – ' + esc(x.grundNeu) : ''}</li>`
      : `<li class="nein">✗ <b>${esc(x.n)}</b> passt nicht: ${esc(x.grund)}${x.tipp ? `<div class="klein gelb">💡 ${esc(x.tipp)}</div>` : ''}</li>`).join('')}</ul>
    <div class="los-kosten">
      <div class="zeile"><span style="flex:1">Möbel & Ausstattung</span><b>ca. ${euro(Math.round(v.kosten.wert / 10) * 10)}</b></div>
      <div class="klein grau">Spanne ${euro(v.kosten.min)} – ${euro(v.kosten.max)}</div>
      ${v.kosten.arbeit ? `<div class="zeile"><span style="flex:1">${esc(v.kosten.arbeit.t)} (${zahl(v.kosten.arbeit.menge)} ${esc(v.kosten.arbeit.einheit)})</span><b>selbst ca. ${euro(Math.round(v.kosten.arbeit.selbst / 10) * 10)}</b></div><div class="klein grau">mit Handwerker ca. ${euro(Math.round(v.kosten.arbeit.profi / 10) * 10)}</div>` : ''}
      <div class="zeile"><span style="flex:1">+ Montage durch Handwerker (optional)</span><b>ca. ${euro(v.kosten.montage)}</b></div>
    </div>
    <details><summary>Materialliste (${v.kosten.liste.length} Positionen)</summary><ul class="los-material">${v.kosten.liste.map((z) => `<li><span>${z.anz > 1 ? z.anz + ' × ' : ''}${esc(z.n)}</span><span class="klein">${euro(z.a)}–${euro(z.c)}</span></li>`).join('')}${ANLEITUNGEN[p.anleitung] ? ANLEITUNGEN[p.anleitung].material.map(([n, je, e]) => `<li><span>${esc(n)}</span><span class="klein">${zahl(Math.ceil(je * (p.menge || 1) * 10) / 10)} ${esc(e)}</span></li>`).join('') : ''}</ul></details>
    <div class="zeile wrap"><button class="btn hell" data-akt="losUebernehmen" data-id="${p.id}" data-v="${i}">Diese Variante übernehmen</button><button class="btn" data-akt="losEinkauf" data-id="${p.id}" data-v="${i}">In Einkaufsliste</button></div>
  </section>`).join('')}
  <p class="klein grau">Preise sind grobe Richtwerte (Baumarkt/Online, ohne Angebot). Fotorealistische Bilder deiner Variante kommen mit dem KI-Server.</p>
  <a class="btn voll" href="#/loslegen/${p.id}?s=3">Wünsche ändern</a>`;
}
function losVariante(d) { if (!LOS_CACHE || LOS_CACHE.id !== d.id) LOS_CACHE = { id: d.id, vs: losVarianten(projekt(d.id)) }; return LOS_CACHE.vs[Number(d.v)]; }
AKT.losUebernehmen = (d) => {
  const v = losVariante(d); if (!v) return;
  aendern(() => { const p = projekt(d.id); p.plan = JSON.parse(JSON.stringify(v.plan)); losStatus(p).fertig = true; }, 'Variante übernommen');
  toast('Übernommen – jetzt in 3D ansehen oder anpassen');
  sprich('Variante übernommen. Du siehst sie jetzt im Planer.', true);
  geh('#/planer/' + d.id);
};
AKT.losEinkauf = (d) => {
  const v = losVariante(d); if (!v) return;
  const p = projekt(d.id), anl = ANLEITUNGEN[p.anleitung];
  aendern((s) => {
    v.kosten.liste.forEach((z) => s.einkauf.push({ id: uid(), n: z.n, menge: z.anz, einheit: 'Stk', hinweis: 'ca. ' + euro(z.a) + '–' + euro(z.c) + ' je Stück', projekt: p.id, erledigt: false }));
    if (anl) anl.material.forEach(([n, je, einheit, hinweis]) => s.einkauf.push({ id: uid(), n, menge: Math.ceil(je * (p.menge || 1) * 10) / 10, einheit, hinweis, projekt: p.id, erledigt: false }));
  }, 'Variante in Einkaufsliste');
  toast('In der Einkaufsliste'); geh('#/einkauf');
};

/* ---------- Skizze zeichnen (in der App, mit Finger) ---------- */
const SK = { striche: [], modus: 'linie' };
route('skizze', (id) => {
  const p = projekt(id);
  if (!p) return kopf('Kein Projekt', '', '#/projekte');
  nachRender(() => skizzeStarten(p));
  return kopf('Skizze zeichnen', p.name, '#/studio/' + p.raum + '?p=' + p.id) + `<div class="inhalt">
    <p class="klein">Zeichne den Grundriss mit dem Finger. „Gerade Linie“ zieht saubere Wände (rastet an den Kästchen ein). Danach „📏 Messen“: Wand antippen, mit dem Bluetooth-Laser messen – das Maß steht sofort an der Wand.</p>
    <div class="zeile wrap"><button class="chip ${SK.modus === 'linie' ? 'an' : ''}" data-akt="skModus" data-m="linie">Gerade Linie</button><button class="chip ${SK.modus === 'frei' ? 'an' : ''}" data-akt="skModus" data-m="frei">Freihand</button><button class="chip ${SK.modus === 'messen' ? 'an' : ''}" data-akt="skMessen">📏 Messen</button><button class="chip" data-akt="skZurueck">↶ Rückgängig</button><button class="chip" data-akt="skLeeren">Alles löschen</button></div>
    <canvas id="skizze-flaeche" class="skizze-flaeche" width="900" height="900"></canvas>
    <div class="sk-mess ${SK.modus === 'messen' ? '' : 'aus'}">
      <p class="klein" id="sk-info">${skInfoText()}</p>
      <div class="zeile"><label class="feld" style="flex:1">Länge der gewählten Wand (cm)<input id="sk-mass" inputmode="numeric" data-ein="skMass" placeholder="z. B. 342"></label>
      <button class="btn hell" data-akt="laserVerbinden">📏 ${LASER.geraet ? 'Laser verbunden' : 'Laser verbinden'}</button></div>
      <button class="btn voll" data-akt="skMasseUebernehmen" data-id="${p.id}">Maße übernehmen</button>
    </div>
    <button class="btn hell voll" data-akt="skSpeichern" data-id="${p.id}">Skizze speichern & weiter</button>
  </div>`;
});
function skizzeMalen(cv) {
  const c = cv.getContext('2d'), W = cv.width, R = W / 18;
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, cv.height);
  c.strokeStyle = '#dfe6ee'; c.lineWidth = 1;
  for (let i = 0; i <= 18; i++) { c.beginPath(); c.moveTo(i * R, 0); c.lineTo(i * R, cv.height); c.stroke(); c.beginPath(); c.moveTo(0, i * R); c.lineTo(W, i * R); c.stroke(); }
  c.strokeStyle = '#111'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
  SK.striche.forEach((s, i) => { c.strokeStyle = SK.modus === 'messen' && SK.sel === i ? '#f28c28' : '#111'; c.beginPath(); s.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); });
  const M = SK.masse || {};
  if (typeof skLinien === 'function') skLinien().forEach(({ i, s }) => {
    if (!M[i] && SK.modus !== 'messen') return;
    const mx = (s[0][0] + s[1][0]) / 2, my = (s[0][1] + s[1][1]) / 2, waag = Math.abs(s[1][1] - s[0][1]) < Math.abs(s[1][0] - s[0][0]);
    const t = M[i] ? zahl(M[i] / 100) + ' m' : '?';
    c.font = 'bold 30px system-ui,sans-serif'; const w = c.measureText(t).width + 18, x = mx + (waag ? 0 : 34), y = my + (waag ? -30 : 0);
    c.fillStyle = M[i] ? '#0f5132' : (SK.sel === i ? '#f28c28' : '#8a96a3'); c.fillRect(x - w / 2, y - 20, w, 40);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y + 1);
  });
}
function skizzeStarten() {
  const cv = document.getElementById('skizze-flaeche'); if (!cv) return;
  const R = cv.width / 18, einrasten = (v) => Math.round(v / R) * R;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  let aktiv = null;
  skizzeMalen(cv);
  LASER.ziel = (m) => { if (SK.modus !== 'messen') AKT.skMessen(); if (SK.sel == null) { toast('Erst eine Wand antippen'); return; } skMassSetzen(SK.sel, m * 100); toast('📏 ' + zahl(m) + ' m an die Wand geschrieben'); };
  cv.addEventListener('pointerdown', (e) => { e.preventDefault();
    if (SK.modus === 'messen') { const [x, y] = pos(e), i = skNaechste(x, y); if (i != null) { SK.sel = i; skizzeMalen(cv); const f = document.getElementById('sk-mass'); if (f) f.value = (SK.masse || {})[i] || ''; const z = document.getElementById('sk-info'); if (z) z.textContent = skInfoText(); } return; }
    cv.setPointerCapture(e.pointerId); let pt = pos(e); if (SK.modus === 'linie') pt = pt.map(einrasten); aktiv = [pt]; if (SK.modus === 'linie') aktiv.push(pt.slice()); SK.striche.push(aktiv); skizzeMalen(cv); });
  cv.addEventListener('pointermove', (e) => {
    if (!aktiv) return; let pt = pos(e);
    if (SK.modus === 'linie') { pt = pt.map(einrasten); const a = aktiv[0]; if (Math.abs(pt[0] - a[0]) > Math.abs(pt[1] - a[1]) * 2) pt[1] = a[1]; else if (Math.abs(pt[1] - a[1]) > Math.abs(pt[0] - a[0]) * 2) pt[0] = a[0]; aktiv[1] = pt; } else aktiv.push(pt);
    skizzeMalen(cv);
  });
  const ende = () => { aktiv = null; };
  cv.addEventListener('pointerup', ende); cv.addEventListener('pointercancel', ende);
}
AKT.skModus = (d) => { SK.modus = d.m; render(); };
AKT.skZurueck = () => { if (SK.masse) delete SK.masse[SK.striche.length - 1]; SK.striche.pop(); const cv = document.getElementById('skizze-flaeche'); if (cv) skizzeMalen(cv); };
AKT.skLeeren = () => { SK.striche = []; SK.masse = {}; SK.sel = null; const cv = document.getElementById('skizze-flaeche'); if (cv) skizzeMalen(cv); };
AKT.skSpeichern = (d) => {
  const cv = document.getElementById('skizze-flaeche'); if (!cv) return;
  if (!SK.striche.length) { info('Zeichne zuerst etwas – oder geh zurück und tippe die Maße ein.'); return; }
  const url = cv.toDataURL('image/jpeg', 0.8);
  aendern(() => { projekt(d.id).skizze = url; }, 'Skizze gezeichnet');
  SK.striche = []; SK.masse = {}; SK.sel = null; toast('Skizze gespeichert'); const pp = projekt(d.id); geh('#/studio/' + pp.raum + '?p=' + d.id);
};

HILFE.losUebernehmen = 'Diese Variante übernehmen. Sie kommt in den Planer, dort kannst du sie in 3D ansehen und anpassen.';
HILFE.losEinkauf = 'Alle Teile dieser Variante in die Einkaufsliste.';
HILFE.losFenster = 'Wo ist das Fenster? Dann stelle ich nichts Hohes davor.';
HILFE.losWunsch = 'Antippen: soll in den Raum oder nicht.';
