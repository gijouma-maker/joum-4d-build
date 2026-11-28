/* Joum 4D Build – Raum-Studio (für alle Innenräume)
   Ein Bildschirm: oben 3D, darunter Stil wählen und durch Vorschläge wischen. Jeder Stil bringt eigene Möbel, Maße,
   Farben, Preise UND eigene Grundriss-Ideen (Trennwand/Zonen, WC abgetrennt, Hauptstück frei im Raum, alles an einer Wand, klassisch).
   Vorschläge direkt ändern: Teil antippen → entfernen / kleiner / anderes; Maße, Fenster, Foto, Skizze, Vorbild im selben Bildschirm. */

function raumArt(id) {
  if (['bad', 'gaestewc'].includes(id)) return 'bad';
  if (id === 'kueche') return 'kueche';
  if (id === 'wohnzimmer' || id === 'heimkino' || id === 'wintergarten') return 'wohn';
  if (['schlafzimmer', 'gaestezimmer', 'ankleide'].includes(id)) return 'schlaf';
  if (['kinderzimmer', 'babyzimmer', 'jugendzimmer'].includes(id)) return 'kind';
  if (['buero', 'hobbyraum'].includes(id)) return 'buero';
  if (id === 'esszimmer') return 'ess';
  if (id === 'waschraum') return 'wasch';
  return 'sonst';
}
const STIL_FARBE = { hell: '#f2f2f2', skandi: '#d9c7a6', industrial: '#2f2f2f', japandi: '#a07a55', landhaus: '#b98d5f', luxus: '#244b45', familie: '#7fa7c9', spar: '#dcdcdc' };
const STIL_FAKTOR = { hell: 1, skandi: 1, industrial: 1.1, japandi: 1.2, landhaus: 1.15, luxus: 1.9, familie: 0.95, spar: 0.6 };
const EXTRA_SPECS = {
  'Hocker Holz': ['Hocker Holz', 'Möbel', 35, 35, 45, ''], 'Hocker / Tritt': ['Hocker / Tritt', 'Möbel', 40, 30, 30, 'Für Kinder am Waschtisch.'],
  'Sessel': ['Sessel', 'Möbel', 80, 85, 90, ''], 'Pflanze groß': ['Pflanze groß', 'Deko', 50, 50, 150, ''], 'Teppich': ['Teppich', 'Deko', 200, 140, 1, ''],
  'Kommode': ['Kommode', 'Möbel', 120, 50, 85, ''], 'Sitzbank': ['Sitzbank', 'Möbel', 120, 40, 45, ''], 'Spielecke / Teppich': ['Spielecke / Teppich', 'Deko', 150, 150, 1, ''],
  'Badewanne': ['Badewanne', 'Sanitär', 170, 75, 60, ''], 'Regal': ['Regal', 'Möbel', 80, 35, 200, ''], 'Indirektes Licht (LED-Profil)': ['Indirektes Licht (LED-Profil)', 'Licht', 200, 5, 5, '']
};
/* Stil-Regeln: Tausch (gleiche Funktion, anderes Möbel), Weg, Extra je Raumart, bevorzugte Grundriss-Ideen */
const STIL_REGELN = {
  hell: { konzepte: ['zonen', 'wand', 'linear', 'getrennt', 'mitte'],
    tausch: [[/^Waschtisch$/, ['Waschtisch wandhängend', 'Sanitär', 100, 48, 85, 'Schwebend, darunter LED.']], [/^Dusche bodengleich$/, ['Walk-in Dusche Glas', 'Sanitär', 120, 90, 1, 'Eine feste Glaswand, keine Tür.']], [/^Sofa 3-Sitzer$/, ['Sofa grau, gerade Linien', 'Möbel', 230, 95, 80, '']]],
    extra: { wohn: ['Indirektes Licht (LED-Profil)'], schlaf: ['Indirektes Licht (LED-Profil)'] } },
  skandi: { konzepte: ['wand', 'zonen', 'mitte', 'linear', 'getrennt'],
    tausch: [[/^Sofa 3-Sitzer$/, ['Sofa hell mit Holzfüßen', 'Möbel', 210, 90, 80, '']], [/^Couchtisch$/, ['Couchtisch Holz rund', 'Möbel', 80, 80, 42, '']], [/^Waschtisch$/, ['Waschtisch Eiche hell', 'Sanitär', 80, 46, 85, '']], [/^Doppelbett 180$/, ['Bett Eiche 160', 'Möbel', 160, 205, 40, '']]],
    extra: { wohn: ['Sessel', 'Pflanze groß', 'Teppich'], schlaf: ['Teppich'], bad: ['Hocker Holz'], kind: ['Teppich'] } },
  industrial: { konzepte: ['linear', 'zonen', 'wand', 'mitte', 'getrennt'],
    tausch: [[/^Waschtisch$/, ['Waschtisch auf Metallgestell', 'Sanitär', 120, 50, 85, 'Schwarzes Stahlgestell, Betonoptik.']], [/^Dusche bodengleich$/, ['Dusche mit Sprossen-Glaswand', 'Sanitär', 120, 90, 1, 'Schwarze Profile.']], [/^Sofa 3-Sitzer$/, ['Sofa Leder cognac', 'Möbel', 220, 95, 82, '']], [/^Regal hoch$/, ['Metallregal offen', 'Möbel', 100, 40, 200, '']], [/^Doppelbett 180$/, ['Doppelbett Metallrahmen', 'Möbel', 180, 210, 40, '']], [/^Esstisch 6 Pers\.$/, ['Esstisch Massivholz & Stahl', 'Möbel', 200, 95, 75, 'Stühle kommen automatisch dazu.']], [/^Schreibtisch/, ['Schreibtisch Stahl & Holz', 'Möbel', 150, 70, 75, '']]],
    weg: /Teppich|Pflanze/, extra: { wohn: ['Regal'], buero: ['Regal'] } },
  japandi: { konzepte: ['mitte', 'zonen', 'linear', 'wand', 'getrennt'],
    tausch: [[/^Badewanne$/, ['Freistehende Badewanne', 'Sanitär', 170, 80, 60, 'Blickfang, Armatur aus dem Boden.']], [/^Waschtisch$/, ['Waschtisch Holz mit Aufsatzbecken', 'Sanitär', 90, 46, 85, '']], [/^Doppelbett 180$/, ['Bett niedrig Holz', 'Möbel', 180, 210, 28, 'Bodennah wie ein Futon.']], [/^Sofa 3-Sitzer$/, ['Sofa niedrig Leinen', 'Möbel', 210, 90, 68, '']], [/^Couchtisch$/, ['Couchtisch niedrig', 'Möbel', 100, 60, 32, '']], [/^Deckenleuchte$/, ['Reispapier-Leuchte', 'Licht', 50, 50, 40, '']], [/^Kleiderschrank$/, ['Kleiderschrank Holzlamellen', 'Möbel', 200, 60, 220, '']]],
    weg: /Stehleuchte|Bild|Spielzeug|Vitrine|Teppich/, extra: { wohn: ['Pflanze groß'], bad: ['Hocker Holz'], schlaf: ['Pflanze groß'] } },
  landhaus: { konzepte: ['wand', 'mitte', 'getrennt', 'zonen', 'linear'],
    tausch: [[/^Waschtisch$/, ['Waschtisch Kommode Massivholz', 'Sanitär', 100, 50, 85, '']], [/^Badewanne$/, ['Badewanne mit Füßen', 'Sanitär', 170, 78, 62, '']], [/^Sofa 3-Sitzer$/, ['Sofa Leinen mit Hussen', 'Möbel', 220, 95, 85, '']], [/^Kleiderschrank$/, ['Kleiderschrank Kassettentüren', 'Möbel', 200, 62, 220, '']], [/^Esstisch 6 Pers\.$/, ['Esstisch Massivholz', 'Möbel', 200, 95, 76, 'Stühle kommen automatisch dazu.']], [/^Doppelbett 180$/, ['Doppelbett Holz mit Kopfteil', 'Möbel', 180, 215, 45, '']]],
    extra: { wohn: ['Kommode'], schlaf: ['Kommode'], ess: ['Sitzbank'] } },
  luxus: { konzepte: ['mitte', 'getrennt', 'zonen', 'wand', 'linear'],
    tausch: [[/^Waschtisch$/, ['Doppelwaschtisch Marmor', 'Sanitär', 160, 52, 85, '']], [/^Dusche bodengleich$/, ['Walk-in Dusche 160×90', 'Sanitär', 160, 90, 1, '']], [/^Badewanne$/, ['Freistehende Badewanne', 'Sanitär', 180, 85, 60, '']], [/^Doppelbett 180$/, ['Polsterbett 200', 'Möbel', 200, 220, 50, '']], [/^Sofa 3-Sitzer$/, ['Sofa Samt', 'Möbel', 240, 100, 80, '']], [/^Esstisch 6 Pers\.$/, ['Esstisch Marmor', 'Möbel', 220, 100, 75, 'Stühle kommen automatisch dazu.']]],
    extra: { bad: ['Badewanne'], wohn: ['Sessel'], schlaf: ['Sessel'] } },
  familie: { konzepte: ['wand', 'getrennt', 'zonen', 'linear', 'mitte'],
    tausch: [[/^Couchtisch$/, ['Couchtisch abgerundet', 'Möbel', 100, 60, 40, 'Keine scharfen Kanten.']], [/^Sofa 3-Sitzer$/, ['Sofa mit abwaschbarem Bezug', 'Möbel', 230, 95, 85, '']]],
    extra: { bad: ['Badewanne', 'Hocker / Tritt'], kind: ['Spielecke / Teppich', 'Regal'], wohn: ['Spielecke / Teppich'] } },
  spar: { konzepte: ['wand', 'linear', 'zonen', 'mitte', 'getrennt'], tausch: [], weg: /Pflanze|Bild|Deko|Sessel/, extra: {} }
};
const KONZEPT_TEXT = {
  wand: ['Klassisch', 'Alles an den Wänden – viel freie Fläche in der Mitte.'],
  linear: ['Alles an einer Wand', 'Eine durchgehende Linie – die Laufzone bleibt komplett frei.'],
  mitte: { bad: ['Wanne frei im Raum', 'Freistehende Wanne als Blickfang, Rest an den Wänden.'], schlaf: ['Bett als Mittelpunkt', 'Bett mittig an der Wand gegenüber der Tür, Nachttische links und rechts.'], wohn: ['Sofa frei im Raum', 'Sofa steht frei, Blick zum TV – dahinter Platz für Weg oder Sideboard.'], kueche: ['Kücheninsel', 'Insel in der Mitte, Zeile an der Wand.'], buero: ['Schreibtisch frei', 'Schreibtisch frei im Raum, Blick zur Tür.'], _: ['Hauptstück frei im Raum', 'Das größte Möbel steht frei, der Rest an den Wänden.'] },
  zonen: { bad: ['Trennwand + Walk-in', 'Gemauerte Trennwand: dahinter Walk-in-Dusche, von beiden Seiten begehbar – davor der Waschtisch.'], schlaf: ['Bett vor Raumteiler', 'Bett vor halbhoher Wand, dahinter begehbarer Kleiderschrank.'], wohn: ['Zwei Zonen', 'Raumteiler-Regal trennt Sofa-Ecke und Lese-/Arbeitsplatz.'], kind: ['Schlaf- & Spielzone', 'Niedriges Regal trennt Schlafen und Spielen.'], kueche: ['Halbinsel mit Theke', 'Halbinsel trennt Kochen und Essen, mit Barhockern.'], buero: ['Arbeitsinsel', 'Schreibtisch vor Raumteiler-Regal, dahinter Ablage.'], _: ['Zwei Zonen', 'Raumteiler-Regal teilt den Raum in zwei Bereiche.'] },
  getrennt: ['WC abgetrennt', 'WC hinter eigener Wand – man stört sich nicht, wenn einer duscht und einer zur Toilette geht.']
};
function konzeptText(k, art) { const t = KONZEPT_TEXT[k]; return Array.isArray(t) ? t : (t[art] || t._); }
PREISE.unshift([/Walk-in/, 900, 3500], [/Freistehende Badewanne|Badewanne mit Füßen/, 900, 4000], [/Doppelwaschtisch/, 600, 3000], [/Trennwand|Halbhohe Wand|Vorwand/, 400, 1600], [/Raumteiler/, 150, 900], [/Hocker/, 30, 200], [/Polsterbett/, 600, 3000], [/Reispapier/, 30, 150], [/Halbinsel/, 600, 2500]);

/* ---------- Entwurf je Raum (ohne gleich ein Projekt anzulegen) ---------- */
function entwurf(rid) {
  S.entwuerfe = S.entwuerfe || {};
  const e = S.entwuerfe[rid];
  if (e && e.pid && projekt(e.pid)) return projekt(e.pid);
  if (e && !e.pid) return e;
  const r = raum(rid) || RAEUME[0];
  const neu = { id: 'e_' + rid, entwurf: true, name: 'Gestaltung – ' + r.name, raum: r.id, bereich: r.bereich, anleitung: '', breite: r.w, tiefe: r.d, hoehe: 250, plan: [], stil: 'hell', schritte: {}, notizen: '',
    waende: [{ n: 'Wand A', l: r.w / 100, h: 2.5 }, { n: 'Wand B', l: r.d / 100, h: 2.5 }, { n: 'Wand C', l: r.w / 100, h: 2.5 }, { n: 'Wand D', l: r.d / 100, h: 2.5 }], aussparungen: [{ n: 'Tür', b: 0.9, h: 2.1, anz: 1 }, { n: 'Fenster', b: 1.2, h: 1.3 }], los: {} };
  S.entwuerfe[rid] = neu;
  return neu;
}
function studioObj(d) { return d.p ? projekt(d.p) : entwurf(d.r); }
function studioAlsProjekt(o) {
  if (!o.entwurf) return o;
  const extra = JSON.parse(JSON.stringify(o)); delete extra.id; delete extra.entwurf; delete extra.name;
  const p = projektAnlegen(o.raum, '', extra);
  S.entwuerfe[o.raum] = { pid: p.id }; speichern();
  return p;
}
function studioLink(o) { return '#/studio/' + o.raum + (o.entwurf ? '' : '?p=' + o.id); }

/* ---------- Wunschliste im Stil ---------- */
function specFuer(o, n) {
  return katalogFuer(o).find((k) => k[0] === n) || EXTRA_SPECS[n] || Object.values(ALTERNATIVEN).flat().find((k) => k[0] === n) || Object.values(STIL_REGELN).flatMap((s) => s.tausch.map((t) => t[1])).find((k) => k[0] === n) || null;
}
function stilListe(o) {
  const L = losStatus(o), st = stilMix(o).regeln, art = raumArt(o.raum);
  let namen = (L.wuensche || standardWuensche(o)).slice();
  if (st.weg) namen = namen.filter((n) => !st.weg.test(n));
  (st.extra[art] || []).forEach((n) => { if (!namen.includes(n) && passt(o.raum, n).ok && !(n === 'Badewanne' && o.breite * o.tiefe < 60000)) namen.push(n); });
  let specs = namen.map((n) => { const t = st.tausch.find(([re]) => re.test(n)); return t ? t[1].slice() : specFuer(o, n); }).filter(Boolean);
  specs = specs.filter((k) => passt(o.raum, k[0]).ok && !(L.weg || []).includes(k[0]));
  specs = specs.map((k) => { const t = (L.tausch || {})[k[0]]; return t ? (specFuer(o, t) || k) : k; });
  return specs;
}

/* ---------- Grundriss-Ideen ---------- */
function elAus(k, x, y, rot, extra) { return Object.assign({ id: uid(), n: k[0], g: k[1], w: k[2], d: Math.max(k[3], 4), h: k[4], hint: k[5] || '', x: Math.round(x), y: Math.round(y), rot: rot || 0 }, extra || {}); }
function vorplanOk(o, els) {
  const tz = tuerZone(o);
  for (const e of els) {
    const f = fussabdruck(e);
    if (f.x < 0 || f.y < 0 || f.x + f.w > o.breite + 0.5 || f.y + f.h > o.tiefe + 0.5) return 'passt nicht in den Raum';
    if (ebene(e.n) === 'boden' && !/Teppich|Spielecke/.test(e.n) && schneidet(f, tz)) return 'würde die Tür blockieren';
    if (fensterKonflikt(o, f, e.n, e.h, ebene(e.n))) return 'würde vor dem Fenster stehen';
  }
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) if (!/Teppich|Spielecke/.test(els[i].n + els[j].n) && schneidet(fussabdruck(els[i]), fussabdruck(els[j]))) return 'Teile überschneiden sich';
  return '';
}
/* spiegelt einen Vorplan oben↔unten (Zone an der unteren Wand statt oben) */
function spiegelY(o, els) { return els.map((e) => { const f = fussabdruck(e); return Object.assign({}, e, { y: o.tiefe - f.y - f.h, rot: ((e.rot || 0) + 180) % 360 }); }); }
function nimm(liste, re) { const i = liste.findIndex((k) => re.test(k[0])); return i >= 0 ? liste.splice(i, 1)[0] : null; }

function konzeptVorplan(o, konzept, liste) {
  if (typeof SONDER_KONZEPT !== 'undefined' && SONDER_KONZEPT[konzept]) return SONDER_KONZEPT[konzept](o, liste.slice());
  if (raumArt(o.raum) === 'wasch' && typeof waschVorplan === 'function') return waschVorplan(o, konzept, liste.slice());
  const art = raumArt(o.raum), B = o.breite, T = o.tiefe, tz = tuerZone(o), rest = liste.slice();
  const links = tz.w + 10;   // Durchgang neben der Tür freihalten
  if (konzept === 'wand' || konzept === 'linear') return { vor: [], rest, folge: konzept === 'linear' ? [B >= T ? 0 : 1] : null };
  if (konzept === 'getrennt') {
    if (art !== 'bad') return { fehler: 'nur im Bad' };
    const wc = nimm(rest, /^WC/); if (!wc) return { fehler: 'kein WC in der Auswahl' };
    if (B < 250) return { fehler: 'braucht mind. 2,5 m Raumbreite' };
    const kab = 95, tw = ['Trennwand WC (Vorwand)', 'Wand & Bau', 10, 130, 200, 'Trockenbau, gefliest; WC braucht eigene Lüftung, sonst Schimmel an der Trennwand.'];
    const vor = [elAus(wc, B - kab / 2 - wc[2] / 2, 0, 0, { konzept: true }), elAus(tw, B - kab - 10, 0, 0, { konzept: true })];
    if (!vorplanOk(o, vor)) return { vor, rest };
    const sp = spiegelY(o, vor); const f2 = vorplanOk(o, sp); return f2 ? { fehler: 'WC-Ecke ' + f2 } : { vor: sp, rest };
  }
  if (konzept === 'mitte') {
    const re = { bad: /Badewanne/, schlaf: /bett/i, wohn: /Sofa/, kueche: /Kücheninsel/, buero: /Schreibtisch/, kind: /bett/i, ess: /Esstisch/ }[art];
    let anker = re ? nimm(rest, re) : null;
    if (!anker && art === 'bad') return { fehler: 'keine Badewanne ausgewählt' };
    if (!anker && art === 'kueche' && B >= 380 && T >= 380) anker = specFuer(o, 'Kücheninsel');
    if (!anker) { const g = rest.filter((k) => k[1] === 'Möbel' && ebene(k[0]) === 'boden').sort((a, b) => b[2] * b[3] - a[2] * a[3])[0]; if (g) anker = rest.splice(rest.indexOf(g), 1)[0]; }
    if (!anker) return { fehler: 'kein großes Möbel ausgewählt' };
    if (art === 'ess' || art === 'kueche') { return { vor: [], rest: [anker].concat(rest) }; } // Tisch/Insel setzt platzieren() mittig
    let el;
    if (/bett/i.test(anker[0])) el = elAus(anker, B - anker[3], (T - anker[2]) / 2, 90, { konzept: true });
    else if (/Sofa/.test(anker[0])) el = elAus(anker, (B - anker[2]) / 2 + 20, T * 0.55, 180, { konzept: true });
    else { const quer = B >= T; el = elAus(anker, (B - (quer ? anker[2] : anker[3])) / 2 + 20, (T - (quer ? anker[3] : anker[2])) / 2, quer ? 0 : 90, { konzept: true }); }
    const f = vorplanOk(o, [el]); if (f) return { fehler: anker[0] + ' ' + f };
    // Bewegungsfläche rundum (frei stehend)
    if (!/bett/i.test(anker[0])) { const fa = fussabdruck(el), r = /Badewanne/.test(anker[0]) ? 60 : 50; if (fa.x < r || fa.y < r || fa.x + fa.w > B - r || fa.y + fa.h > T - r) return { fehler: anker[0] + ' braucht rundum ca. ' + r + ' cm Platz' }; }
    return { vor: [el], rest };
  }
  if (konzept === 'zonen') {
    if (art === 'ess') return { fehler: 'Esszimmer: Tisch braucht Platz rundum' };
    const tiefeT = (art === 'buero' || art === 'wohn' || art === 'sonst') ? 35 : (art === 'kind' ? 35 : 12);
    if (art === 'kueche') {
      const L = Math.min(200, B - links - 60); if (L < 120 || T < 320) return { fehler: 'Halbinsel braucht mind. 3,2 m Tiefe' };
      const hi = ['Halbinsel / Theke', 'Küche', L, 60, 92, 'Mit Barhockern auf der Essseite.'];
      const vor = [elAus(hi, B - L, 60 + 110, 0, { konzept: true })];
      const f = vorplanOk(o, vor); return f ? { fehler: 'Halbinsel ' + f } : { vor, rest: rest.filter((k) => !/Kücheninsel/.test(k[0])) };
    }
    let hinten, vorne, gang, teilerName, teilerH;
    if (art === 'bad') {
      const du = nimm(rest, /Dusche/) || specFuer(o, 'Dusche bodengleich');
      hinten = ['Walk-in Dusche (2 Zugänge)', 'Sanitär', B, Math.max(90, Math.min(120, du ? du[3] : 100)), 1, 'Hinter der Trennwand, von beiden Seiten begehbar; Gefälle zur Rinne.'];
      vorne = nimm(rest, /Waschtisch|Handwaschbecken/); gang = 0; teilerName = 'Trennwand gemauert (Dusche/Waschtisch)'; teilerH = 200;
    } else if (art === 'schlaf') {
      hinten = nimm(rest, /Kleiderschrank|Schranksystem/) || ['Kleiderschrank', 'Möbel', 200, 60, 230, '']; vorne = nimm(rest, /bett/i); gang = 70; teilerName = 'Halbhohe Wand (Bett-Rückwand)'; teilerH = 150;
    } else if (art === 'kind') {
      hinten = nimm(rest, /bett/i); vorne = nimm(rest, /Spielecke|Teppich/) || EXTRA_SPECS['Spielecke / Teppich']; gang = 20; teilerName = 'Raumteiler-Regal niedrig'; teilerH = 110;
    } else {
      const reV = { wohn: /Sofa/, buero: /Schreibtisch/, ess: /Sideboard|Vitrine/ }[art];
      vorne = reV ? nimm(rest, reV) : null;
      if (!vorne) { const g = rest.filter((k) => k[1] === 'Möbel' && ebene(k[0]) === 'boden').sort((a, b) => b[2] - a[2])[0]; if (g) vorne = rest.splice(rest.indexOf(g), 1)[0]; }
      hinten = null; gang = 120; teilerName = 'Raumteiler-Regal offen'; teilerH = 180;
    }
    if (!vorne) return { fehler: 'kein passendes Hauptmöbel ausgewählt' };
    const hT = hinten ? (art === 'kind' ? Math.min(hinten[2], hinten[3]) : hinten[3]) + gang : gang;
    const start = links, ende = B - (art === 'bad' ? 70 : 75), lang = ende - start;
    if (lang < vorne[2]) return { fehler: 'Raum zu schmal: braucht ca. ' + zahl((vorne[2] + links + 75) / 100) + ' m Breite' };
    const teiler = [teilerName, art === 'bad' ? 'Wand & Bau' : 'Möbel', lang, tiefeT, teilerH, art === 'bad' ? 'Trockenbau/Porenbeton, beidseitig abgedichtet und gefliest.' : 'Offenes Regal – Licht geht durch.'];
    const ty = hT, vy = ty + tiefeT;
    if (vy + Math.max(vorne[3], 4) + vorne_(vorne[0]) > T) return { fehler: 'Raum zu kurz: braucht ca. ' + zahl((vy + vorne[3] + vorne_(vorne[0])) / 100) + ' m Tiefe' };
    const vor = [];
    if (hinten) { if (art === 'kind') vor.push(elAus(hinten, start, 0, 90, { konzept: true })); else vor.push(elAus(hinten, art === 'bad' ? 0 : start + (lang - hinten[2]) / 2, 0, 0, { konzept: true })); }
    vor.push(elAus(teiler, start, ty, 0, { konzept: true }));
    vor.push(elAus(vorne, start + (lang - vorne[2]) / 2, vy, 0, { konzept: true }));
    let f = vorplanOk(o, vor);
    if (f && art === 'bad' && /Tür/.test(f) === false) { /* Dusche oben über volle Breite darf an die Tür-Wand (Zone liegt oberhalb) */ }
    if (!f) return { vor, rest };
    const sp = spiegelY(o, vor); const f2 = vorplanOk(o, sp);
    return f2 ? { fehler: (f || f2) } : { vor: sp, rest };
  }
  return { fehler: 'unbekannt' };
}
function vorne_(n) { return vorne(n); }

function studioVarianten(o) {
  if (typeof eigeneSpecsLaden === 'function') eigeneSpecsLaden(o);
  const st = stilMix(o).regeln, art = raumArt(o.raum), liste = stilListe(o);
  const eigene = (losStatus(o).eigene || []).map((e) => JSON.parse(JSON.stringify(e))).concat(typeof wandElemente === 'function' ? wandElemente(o) : []);
  let konzepte = st.konzepte;
  if (art === 'kind' && typeof KIND_K !== 'undefined' && o.raum !== 'babyzimmer') { const i = Math.max(0, STILE.findIndex((x) => x.id === o.stil)) % KIND_K.length; konzepte = KIND_K.slice(i).concat(KIND_K.slice(0, i), st.konzepte); }
  if (art === 'fit' && typeof FIT_KEYS !== 'undefined') { const i = Math.max(0, STILE.findIndex((x) => x.id === o.stil)) % FIT_KEYS.length; konzepte = FIT_KEYS.slice(i).concat(FIT_KEYS.slice(0, i)); }
  if (art === 'wasch') { const i = Math.max(0, STILE.findIndex((x) => x.id === o.stil)) % WASCH_K.length; konzepte = WASCH_K.slice(i).concat(WASCH_K.slice(0, i)); }
  const flaeche = (k) => k[2] * Math.max(k[3], 4), prio = (k) => (ebene(k[0]) !== 'boden' ? 2 : WICHTIG.test(k[0]) ? 0 : 1);
  const sortiert = (l) => l.slice().sort((a, b) => (prio(a) - prio(b)) || (flaeche(b) - flaeche(a)));
  const out = [], gesehen = new Set(), nicht = [];
  konzepte.forEach((k) => {
    const vp = konzeptVorplan(o, k, liste);
    const [titel, text] = konzeptText(k, art);
    if (vp.fehler) { nicht.push(titel + ': ' + vp.fehler); return; }
    if (eigene.length) { const f = vorplanOk(o, eigene.concat(vp.vor || [])); if (f) { nicht.push(titel + ': mit deiner Zeichnung – ' + f); return; } vp.vor = eigene.concat(vp.vor || []); }
    const r = losBauen(o, sortiert(vp.rest), { alternativen: true, vorplan: vp.vor, folge: vp.folge });
    if (typeof planZiehenAnwenden === 'function') planZiehenAnwenden(o, k, r);
    const sig = JSON.stringify(r.plan.map((e) => [e.n, Math.round(e.x / 10), Math.round(e.y / 10), e.rot]));
    if (gesehen.has(sig)) return; gesehen.add(sig);
    out.push({ konzept: k, titel, unter: text, plan: r.plan, ergebnis: r.ergebnis, kosten: losKosten(o, r.plan) });
  });
  (KI_IDEEN[o.id + '|' + o.stil + '|' + (o.stil2 || '')] || []).forEach((v) => out.push(v));
  out.forEach((v) => { v.fehlt = v.ergebnis.filter((x) => !x.ok).length; v.ersetzt = v.ergebnis.filter((x) => x.ersatz).length; });
  return { vs: out, nicht };
}

/* ---------- Bildschirm ---------- */
let STUDIO_CACHE = null;
const KI_IDEEN = {};
function studioSeite(rid, q) {
  const r = raum(rid);
  if (!r) return kopf('Nicht gefunden', '', '#/projekte');
  const o = q && q.p ? projekt(q.p) : entwurf(rid);
  if (!o) return kopf('Nicht gefunden', '', '#/projekte');
  const L = losStatus(o), d = o.entwurf ? `data-r="${o.raum}"` : `data-p="${o.id}"`;
  const { vs, nicht } = studioVarianten(o);
  const sel = Math.min(L.sel || 0, Math.max(0, vs.length - 1)), v = vs[sel];
  STUDIO_CACHE = { key: o.id + o.stil, vs };
  const M = stilMix(o), st = M.stil;
  nachRender(() => { if (typeof vnNachherRendern === 'function') vnNachherRendern(o, o.entwurf ? { r: o.raum } : { p: o.id }); studio3D(o, v); ['.stil-chip.an', '.variante-karte.an'].forEach((q) => { const e = document.querySelector(q); if (e && e.parentElement) e.parentElement.scrollLeft = e.offsetLeft - 12; }); });
  const F = o.fensterPos;
  return kopf(r.name, 'Studio · wische durch die Vorschläge', '#/projekte') + `<div class="inhalt studio">
    <div class="studio-3d" id="studio3d"><div class="studio-3d-titel">${v ? esc(v.titel) + ' · ' + esc(M.name) : ''}</div></div>
    <div class="stil-leiste">${STILE.map((s) => `<button class="stil-chip ${o.stil === s.id ? 'an' : ''}" data-akt="studioStil" ${d} data-s="${s.id}"><i style="background:${s.wand};border-color:${s.akzent}"></i><i style="background:${STIL_FARBE[s.id]}"></i>${esc(s.name)}</button>`).join('')}</div>
    ${typeof dekoLeiste === 'function' ? dekoLeiste(o, d) : ''}
    <details class="stil-mix" ${o.stil2 ? 'open' : ''}><summary>Stile mischen ${o.stil2 ? '· ' + esc(M.name) : ''}</summary>
      <div class="stil-leiste"><button class="stil-chip ${!o.stil2 ? 'an' : ''}" data-akt="studioStil2" ${d} data-s="">Kein Mix</button>${STILE.filter((s) => s.id !== o.stil).map((s) => `<button class="stil-chip ${o.stil2 === s.id ? 'an' : ''}" data-akt="studioStil2" ${d} data-s="${s.id}"><i style="background:${s.wand};border-color:${s.akzent}"></i>${esc(s.name)}</button>`).join('')}</div>
      ${o.stil2 ? `<div class="zeile wrap">${[['80', '80/20 – Akzente'], ['70', '70/30'], ['50', '50/50']].map(([k, t]) => `<button class="chip ${(o.mix || '70') === k ? 'an' : ''}" data-akt="studioMix" ${d} data-m="${k}">${t}</button>`).join('')}</div>` : ''}
    </details>
    <p class="klein grau">${esc(st.text)}</p>
    <div class="varianten">${vs.map((x, i) => `<button class="variante-karte ${i === sel ? 'an' : ''}" data-akt="studioWahl" ${d} data-i="${i}">
      ${raumSVG(o, x.plan)}<b>${esc(x.titel)}</b><span class="klein">${x.fehlt ? '⚠ ' + x.fehlt + ' passt nicht' : x.ersetzt ? '↺ angepasst' : '✓ passt'} · ca. ${euro(Math.round((x.kosten.wert + (x.kosten.arbeit ? x.kosten.arbeit.selbst : 0)) / 50) * 50)}</span></button>`).join('')}</div>
    <button class="btn voll ki-knopf" data-akt="studioKI" ${d}>✨ Mehr Ideen von anderen KIs holen</button>
    ${nicht.length ? `<details class="klein grau"><summary>${nicht.length} Idee(n) passen hier nicht</summary><ul>${nicht.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>` : ''}
    ${v ? `<section class="karte"><h3>${esc(v.titel)}</h3><p class="klein">${esc(v.unter)}</p>
      <div class="studio-plan" data-k="${esc(v.konzept || '')}">${raumSVG(o, v.plan)}</div>
      <div class="zeile wrap"><button class="btn hell" data-akt="studioStift" ${d}>✏️ Auf dem Plan einzeichnen</button><button class="btn hell" data-akt="studioWunsch" ${d}>💬 Wunsch sagen</button></div>
      <div class="unter">Antippen zum Ändern</div>
      <div class="zeile wrap">${[...new Map(v.plan.filter((e) => !e.gruppe).map((e) => [e.n, e])).values()].map((e) => `<button class="chip teil-chip ${e.konzept ? 'konzept' : ''}" data-akt="studioTeil" ${d} data-n="${esc(e.n)}">${esc(e.n)}${v.plan.filter((x) => x.n === e.n).length > 1 ? ' ×' + v.plan.filter((x) => x.n === e.n).length : ''}</button>`).join('')}<button class="chip plus" data-akt="studioPlus" ${d}>＋ Hinzufügen</button></div>
      <ul class="los-pruef">${v.ergebnis.filter((x) => !x.ok || x.ersatz || x.verschoben || x.neu).map((x) => x.ok
        ? `<li class="gelb">${x.neu ? '＋' : x.ersatz ? '↺' : '→'} <b>${esc(x.el ? x.el.n : x.n)}</b>${x.ersatz ? ` statt ${esc(x.ersatz)}` : ''}${x.verschoben ? ` – nicht vors Fenster, sondern ${o.fensterPos && wandVon(x.el) === o.fensterPos.wand ? 'daneben' : 'an die ' + (WAND_NAME[wandVon(x.el)] || 'Raummitte')}` : ''}${x.neu ? ' – ' + esc(x.grundNeu) : ''}</li>`
        : `<li class="nein">✗ <b>${esc(x.n)}</b>: ${esc(x.grund)}${x.tipp ? `<div class="klein gelb">💡 ${esc(x.tipp)}</div>` : ''}</li>`).join('') || '<li class="ok">✓ Alles passt – Tür frei, Abstände und Fenster geprüft.</li>'}</ul>
      <div class="los-kosten">
        <div class="zeile"><span style="flex:1">Möbel & Ausstattung (${esc(M.name)})</span><b>ca. ${euro(Math.round(v.kosten.wert / 10) * 10)}</b></div>
        ${v.kosten.arbeit ? `<div class="zeile"><span style="flex:1">${esc(v.kosten.arbeit.t)}</span><b>selbst ca. ${euro(Math.round(v.kosten.arbeit.selbst / 10) * 10)}</b></div>` : ''}
        <div class="zeile"><span style="flex:1">+ Montage durch Handwerker</span><b>ca. ${euro(v.kosten.montage)}</b></div>
        <div class="klein grau">Spanne ${euro(v.kosten.min)} – ${euro(v.kosten.max)} · Richtwerte</div>
      </div>
      <div class="zeile wrap"><button class="btn hell" data-akt="studioNehmen" ${d}>Gefällt mir – übernehmen</button><button class="btn" data-akt="studioDruck" ${d}>📄 PDF für Handwerker</button><button class="btn" data-akt="studioTeilen" ${d}>🔗 Teilen</button><button class="btn" data-akt="studio4D" ${d}>${ICON.film || '▶'} 4D-Film</button><button class="btn" data-akt="studioEinkauf" ${d}>Einkaufsliste</button><button class="btn ar-knopf" data-akt="studioAR" ${d}>${ICON.kamera} In echt ansehen (AR)</button></div>
    </section>` : '<div class="hinweis">Keine Idee passt mit dieser Auswahl – Maße prüfen oder Teile entfernen.</div>'}
    ${typeof vnKarte === 'function' ? vnKarte(o, d) : ''}
    ${typeof waendeKarte === 'function' ? waendeKarte(o, d) : ''}
    ${typeof materialKarte === 'function' ? materialKarte(o, d) : ''}
    <section class="karte studio-raum"><h3>Dein Raum</h3>
      <div class="raster3">
        <label class="feld">Breite (m)<input inputmode="decimal" data-ein="studioMass" ${d} data-k="breite" value="${zahl(o.breite / 100)}"></label>
        <label class="feld">Tiefe (m)<input inputmode="decimal" data-ein="studioMass" ${d} data-k="tiefe" value="${zahl(o.tiefe / 100)}"></label>
        <label class="feld">Höhe (m)<input inputmode="decimal" data-ein="studioMass" ${d} data-k="hoehe" value="${zahl((o.hoehe || 250) / 100)}"></label>
      </div>
      <div class="unter">Fenster</div>
      <div class="zeile wrap"><button class="chip ${!F && o.fenster === false ? 'an' : ''}" data-akt="studioFenster" ${d} data-w="-1">Kein Fenster</button>${[0, 1, 2].map((w) => `<button class="chip ${F && F.wand === w ? 'an' : ''}" data-akt="studioFenster" ${d} data-w="${w}">${['oben', 'rechts', 'unten'][w]}</button>`).join('')}${F ? `<label class="feld mini">Breite cm<input inputmode="numeric" data-ein="studioFensterB" ${d} value="${Math.round(F.b)}"></label>` : ''}</div>
      <div class="unter">Foto, Skizze, Vorbild</div>
      <div class="zeile wrap"><button class="chip" data-akt="studioZu" ${d} data-z="fotomessen">${ICON.kamera} Raum messen per Foto</button><button class="chip" data-akt="studioZu" ${d} data-z="skizze">${ICON.stift} Skizze zeichnen</button><button class="chip" data-akt="laserVerbinden">📏 Laser verbinden</button>${dateiKnopf(o.vorbild ? 'Anderes Vorbild' : 'Vorbild-Bild', 'studioVorbild', o.entwurf ? { r: o.raum } : { p: o.id }, { icon: ICON.bild, klasse: 'chip-knopf' })}</div>
      ${bilderLeiste(o)}
    </section>
    <a class="btn voll" href="#/bauteile">Bauteile erklärt in echtem 3D (Holzständer, Dachstuhl)</a>
    ${['treppenhaus', 'flur', 'dachgeschoss', 'keller'].includes(r.id) ? `<a class="btn hell voll" href="#/treppe">Treppe planen (DIN 18065 – Stufen, Kopfhöhe, Türen)</a>` : ''}
    <section class="karte"><h3>Arbeiten in diesem Raum</h3><div class="zeile wrap">${r.projekte.map((aid) => { const a = ANLEITUNGEN[aid]; return a ? `<button class="chip" data-akt="neuesProjekt" data-raum="${r.id}" data-anl="${aid}">${esc(a.t)}</button>` : ''; }).join('')}<button class="chip" data-akt="neuesProjekt" data-raum="${r.id}" data-anl="">Nur gestalten</button></div>
      ${!o.entwurf && ANLEITUNGEN[o.anleitung] ? `<a class="btn voll" href="#/projekt/${o.id}">Anleitung & Schritte: ${esc(ANLEITUNGEN[o.anleitung].t)}</a>` : ''}</section>
    ${r.sicherheit.length || r.tipps.length ? `<details class="karte"><summary>Sicherheit & Tipps</summary><ul>${r.sicherheit.concat(r.tipps).map((s) => `<li>${esc(s)}</li>`).join('')}</ul></details>` : ''}
  </div>`;
}
route('studio', (rid, q) => studioSeite(rid, q || {}));
function studio3D(o, v) {
  const box = document.getElementById('studio3d'); if (!box || !window.zeigeRaum3D || !v) return;
  const M = stilMix(o), c = JSON.parse(JSON.stringify(o)), FT = losStatus(o).fotoTeile || {};
  if (typeof flaechen === 'function') c.flaechen = JSON.parse(JSON.stringify(flaechen(o)));
  c.plan = v.plan.map((e) => Object.assign({}, e, e.g === 'Möbel' && !e.farbe ? { farbe: M.moebel } : {}, /^Trennwand|^Halbhohe Wand|^Vorwand/.test(e.n) && !e.farbe ? { farbe: M.stil.wand } : {}, FT[e.n] ? { foto: FT[e.n].foto, fotoFarbe: FT[e.n].farbe } : {}));
  c._innen = typeof MAT !== 'undefined' && MAT.innen;
  if (typeof dekoAnwenden === 'function') dekoAnwenden(o, c);
  window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE;
  const dd = o.entwurf ? { r: o.raum } : { p: o.id };
  box.insertAdjacentHTML('beforeend', '');
  try { zeigeRaum3D(box, c, M.stil, null, (was) => { if (typeof studio3DAntippen === 'function') studio3DAntippen(o, dd, was); }); box.insertAdjacentHTML('beforeend', `<button class="studio-innen" data-akt="studioInnen">${c._innen ? '⤴ Von oben' : '👁 Von innen'}</button>`); } catch (e) { box.insertAdjacentHTML('beforeend', '<p class="klein" style="padding:12px">3D braucht WebGL.</p>'); }
}
function studioAktuell(d) { const o = studioObj(d); const { vs } = studioVarianten(o); return { o, v: vs[Math.min(losStatus(o).sel || 0, vs.length - 1)] }; }

AKT.studioStil = (d) => aendern(() => { const o = studioObj(d); o.stil = d.s; if (o.stil2 === d.s) delete o.stil2; losStatus(o).sel = 0; }, 'Stil gewählt');
AKT.studioStil2 = (d) => aendern(() => { const o = studioObj(d); if (d.s) { o.stil2 = d.s; o.mix = o.mix || '70'; } else delete o.stil2; losStatus(o).sel = 0; }, 'Stil-Mix gewählt');
AKT.studioMix = (d) => aendern(() => { studioObj(d).mix = d.m; }, 'Mischverhältnis gewählt');
AKT.studioKI = async (d) => {
  const o = studioObj(d);
  if (!KONFIG.kiServer) { info('Diese Funktion fragt über den Joum-Server andere KIs (Sprach- und Bild-KIs) nach weiteren Ideen für genau deinen Raum. Jede Idee wird danach mit den Raumregeln der App geprüft (Tür, Fenster, Abstände, Normen) – nur was besteht, wird angezeigt. Sie wird freigeschaltet, sobald der Server läuft.'); return; }
  toast('Frage andere KIs …');
  try { const ideen = await kiIdeenHolen(o); KI_IDEEN[o.id + '|' + o.stil + '|' + (o.stil2 || '')] = ideen; render(); toast(ideen.length ? ideen.length + ' neue Idee(n), alle geprüft' : 'Keine weitere Idee hat die Raumregeln bestanden'); }
  catch (e) { info('Der KI-Server ist gerade nicht erreichbar. Bitte später nochmal.'); }
};
AKT.studioWahl = (d) => aendern(() => { losStatus(studioObj(d)).sel = Number(d.i); }, 'Vorschlag gewählt');
AKT.studioTeil = (d) => {
  const o = studioObj(d), n = d.n, L = losStatus(o), alts = altFuer(n).map((k) => k[0]);
  const knoepfe = [['Entfernen', () => aendern(() => { L.weg = L.weg || []; L.weg.push(n); if (L.wuensche) L.wuensche = L.wuensche.filter((x) => x !== n); }, 'Teil entfernt')]];
  alts.slice(0, 2).forEach((a) => knoepfe.push(['→ ' + a, () => aendern(() => { L.tausch = L.tausch || {}; L.tausch[n] = a; }, 'Teil getauscht')]));
  knoepfe.push(['Abbrechen', null]);
  dialog('„' + n + '“ ändern', knoepfe);
};
AKT.studioPlus = (d) => {
  const o = studioObj(d), L = losStatus(o), schon = new Set((L.wuensche || standardWuensche(o)));
  const kat = [...new Map(katalogFuer(o).filter((k) => !schon.has(k[0]) && !/^Stuhl$/.test(k[0])).map((k) => [k[0], k])).values()].slice(0, 24);
  dialog('Was soll dazu?', kat.slice(0, 10).map((k) => [k[0], () => aendern(() => { L.wuensche = (L.wuensche || standardWuensche(o)).concat([k[0]]); L.weg = (L.weg || []).filter((x) => x !== k[0]); }, 'Teil hinzugefügt')]).concat([['Abbrechen', null]]));
};
EIN.studioMass = (v, d) => {
  const n = parseZahl(v); if (!(n > 0.5 && n < 30)) { toast('Bitte Maß in Metern, z. B. 3,20'); return; }
  aendern(() => { const o = studioObj(d); if (d.k === 'hoehe') o.hoehe = Math.round(n * 100); else o[d.k] = Math.round(n * 100); losMasseAnpassen(o); }, 'Maß geändert');
};
AKT.studioFenster = (d) => aendern(() => {
  const o = studioObj(d), w = Number(d.w);
  if (w < 0) { delete o.fensterPos; o.fenster = false; return; }
  const L = w % 2 ? o.tiefe : o.breite, b = Math.min(120, L - 40);
  o.fensterPos = { wand: w, b, s: Math.round((L - b) / 2) }; o.fenster = true;
}, 'Fenster gesetzt');
EIN.studioFensterB = (v, d) => aendern(() => { const o = studioObj(d); if (!o.fensterPos) return; const L = o.fensterPos.wand % 2 ? o.tiefe : o.breite; o.fensterPos.b = Math.max(40, Math.min(L - 20, parseZahl(v))); o.fensterPos.s = Math.round((L - o.fensterPos.b) / 2); }, 'Fenster geändert');
EIN.studioVorbild = (v, d, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 1000, (url) => { aendern(() => { studioObj(d).vorbild = url; }, 'Vorbild gespeichert'); toast('Vorbild gespeichert – tippe an, was davon rein soll (＋ Hinzufügen)'); }); };
AKT.studioZu = (d) => { const p = studioAlsProjekt(studioObj(d)); geh('#/' + d.z + '/' + p.id + '?z=studio'); };
AKT.studioNehmen = (d) => {
  const { o, v } = studioAktuell(d); if (!v) return;
  const p = studioAlsProjekt(o);
  aendern(() => { p.plan = JSON.parse(JSON.stringify(v.plan)); p.stil = o.stil; if (o.stil2) { p.stil2 = o.stil2; p.mix = o.mix; } else delete p.stil2; losStatus(p).fertig = true; }, 'Vorschlag übernommen');
  toast('Übernommen – im Planer kannst du alles verschieben'); sprich('Vorschlag übernommen.', true);
  geh('#/planer/' + p.id);
};
AKT.studio4D = (d) => {
  const { o, v } = studioAktuell(d); if (!v) return;
  const c = JSON.parse(JSON.stringify(o)); c.plan = v.plan;
  window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE;
  try { zeigeBau4D(c, stilMix(o).stil, o.grundriss); } catch (e) { info('Der 4D-Film braucht WebGL – auf diesem Gerät nicht verfügbar.'); }
};
AKT.studioEinkauf = (d) => {
  const { o, v } = studioAktuell(d); if (!v) return;
  const p = studioAlsProjekt(o);
  aendern((s) => v.kosten.liste.forEach((z) => s.einkauf.push({ id: uid(), n: z.n, menge: z.anz, einheit: 'Stk', hinweis: 'ca. ' + euro(z.a) + '–' + euro(z.c) + ' je Stück', projekt: p.id, erledigt: false })), 'Vorschlag in Einkaufsliste');
  toast('In der Einkaufsliste'); geh('#/einkauf');
};
AKT.studioAR = (d) => { const { o, v } = studioAktuell(d); if (!v) return; arStarten(v.plan, { breite: o.breite, tiefe: o.tiefe }, v.titel); };
HILFE.studioStil = 'Stil wählen – jeder Stil hat eigene Möbel, Farben und Grundriss-Ideen.';
HILFE.studioWahl = 'Diesen Vorschlag ansehen.';
HILFE.studioTeil = 'Teil ändern: entfernen oder gegen ein anderes tauschen.';
HILFE.studioNehmen = 'Vorschlag übernehmen. Danach kannst du im Planer alles verschieben.';
HILFE.studio4D = 'Bauablauf als 4D-Film ansehen.';
