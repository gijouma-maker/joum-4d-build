/* Joum 4D Build – weitere Einrichtungsstile + Stil-Mix (wie Style-Fusion bei Interior-AI-Apps)
   Jeder Stil: Farben (Wand/Boden/Möbel/Akzent), eigene Möbel-Varianten (Tausch), Extras je Raumart, Weg-Regel, bevorzugte Grundriss-Ideen, Preisfaktor.
   Stil-Mix: Hauptstil + Zweitstil im Verhältnis 80/20, 70/30 oder 50/50 (Regel der Innenarchitekten: ein Stil führt, einer setzt Akzente). */

const STILE_MEHR = [
  ['minimal', 'Minimalistisch', '#f3f3f1', '#d9d4cb', '#e9e7e3', '#222222', 'Wenige Möbel, klare Linien, versteckter Stauraum, viel Leere.', 1.05,
    { konzepte: ['linear', 'wand', 'zonen', 'mitte', 'getrennt'], weg: /Pflanze|Bild|Deko|Sessel|Teppich|Stehleuchte|Kommode|Vitrine/, tausch: [[/^Waschtisch$/, ['Waschtisch wandhängend grifflos', 'Sanitär', 100, 46, 85, '']], [/^Sofa 3-Sitzer$/, ['Sofa kubisch', 'Möbel', 220, 92, 76, '']], [/^Kleiderschrank$/, ['Einbauschrank grifflos', 'Möbel', 220, 62, 240, 'Bis zur Decke, Push-to-open.']]], extra: {} }],
  ['wabisabi', 'Wabi-Sabi', '#e7e0d6', '#9b8a74', '#8a7560', '#5b5246', 'Unperfekt und echt: Lehmputz, rohes Holz, Keramik, Leinen.', 1.15,
    { konzepte: ['mitte', 'wand', 'zonen', 'linear', 'getrennt'], weg: /Fernseher|Vitrine|Spiegelschrank/, tausch: [[/^Waschtisch$/, ['Waschtisch Naturstein-Becken', 'Sanitär', 90, 48, 85, 'Steinbecken auf Holzplatte.']], [/^Couchtisch$/, ['Couchtisch Baumscheibe', 'Möbel', 90, 70, 35, '']], [/^Sofa 3-Sitzer$/, ['Sofa Leinen tief', 'Möbel', 220, 100, 68, '']]], extra: { wohn: ['Pflanze groß', 'Sitzbank'], bad: ['Hocker Holz'] } }],
  ['boho', 'Boho', '#efe4d2', '#b08a62', '#c9a27a', '#b5652f', 'Rattan, Makramee, Muster, viele Pflanzen und Textilien.', 0.9,
    { konzepte: ['wand', 'mitte', 'zonen', 'linear', 'getrennt'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa Bouclé mit Kissen', 'Möbel', 220, 95, 78, '']], [/^Sessel$/, ['Rattan-Sessel', 'Möbel', 80, 80, 90, '']], [/^Couchtisch$/, ['Couchtisch Rattan rund', 'Möbel', 80, 80, 40, '']], [/^Doppelbett 180$/, ['Bett Rattan-Kopfteil', 'Möbel', 180, 210, 40, '']], [/^Deckenleuchte$/, ['Rattan-Pendelleuchte', 'Licht', 50, 50, 40, '']]], extra: { wohn: ['Pflanze groß', 'Teppich', 'Sessel'], schlaf: ['Pflanze groß', 'Teppich'], bad: ['Pflanze groß'], kind: ['Teppich'] } }],
  ['midcentury', 'Mid-Century', '#efe8da', '#8a5a3a', '#7a4b2a', '#d98b2b', 'Nussbaum/Teak, schlanke Beine, Senfgelb und Petrol, 50er–60er.', 1.1,
    { konzepte: ['wand', 'zonen', 'mitte', 'linear', 'getrennt'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa Mid-Century Holzbeine', 'Möbel', 210, 85, 80, '']], [/^Sideboard$/, ['Sideboard Nussbaum', 'Möbel', 180, 45, 70, '']], [/^Sessel$/, ['Lounge-Sessel mit Hocker', 'Möbel', 85, 85, 85, '']], [/^Esstisch/, ['Esstisch oval Teak', 'Möbel', 180, 95, 75, 'Stühle kommen automatisch dazu.']]], extra: { wohn: ['Sessel'], ess: ['Sideboard'] } }],
  ['mediterran', 'Mediterran', '#f6f1e7', '#c7835a', '#e9dcc4', '#2f6f9f', 'Kalkputz, Terrakotta, Blau-Weiß, Holzbalken, Bögen.', 1.05,
    { konzepte: ['mitte', 'wand', 'zonen', 'getrennt', 'linear'], tausch: [[/^Waschtisch$/, ['Waschtisch gemauert mit Fliesen', 'Sanitär', 100, 50, 85, 'Mit Zementfliesen.']], [/^Dusche bodengleich$/, ['Walk-in Dusche gemauert', 'Sanitär', 120, 90, 1, 'Mit Bogen-Nische.']], [/^Esstisch/, ['Esstisch Holz rustikal', 'Möbel', 200, 95, 76, 'Stühle kommen automatisch dazu.']]], extra: { wohn: ['Pflanze groß'], ess: ['Sitzbank'] } }],
  ['maritim', 'Maritim / Coastal', '#f4f6f6', '#d6c7a8', '#f0ede6', '#3b6e8f', 'Weiß, Sand und Blau, Leinen, helles Treibholz.', 1,
    { konzepte: ['wand', 'linear', 'zonen', 'mitte', 'getrennt'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa Leinen weiß', 'Möbel', 220, 95, 82, '']], [/^Waschtisch$/, ['Waschtisch Holz hell', 'Sanitär', 90, 48, 85, '']]], extra: { wohn: ['Sessel', 'Teppich'], schlaf: ['Teppich'] } }],
  ['bauhaus', 'Bauhaus', '#efefec', '#7f7f7a', '#2b2b2b', '#c8102e', 'Form folgt Funktion: Stahlrohr, Grundfarben, geometrisch.', 1.15,
    { konzepte: ['linear', 'wand', 'zonen', 'mitte', 'getrennt'], weg: /Pflanze|Deko/, tausch: [[/^Sessel$/, ['Stahlrohr-Sessel', 'Möbel', 75, 70, 75, '']], [/^Esstisch/, ['Esstisch Glas & Stahlrohr', 'Möbel', 180, 90, 75, 'Freischwinger-Stühle.']], [/^Schreibtisch/, ['Schreibtisch Stahlrohr', 'Möbel', 140, 70, 75, '']]], extra: { wohn: ['Sessel'] } }],
  ['rustikal', 'Rustikal / Chalet', '#e9dfcf', '#6b4a30', '#7a5636', '#8f2f2f', 'Altholz, Naturstein, Fell, Kamin-Gefühl, warm.', 1.1,
    { konzepte: ['wand', 'mitte', 'zonen', 'linear', 'getrennt'], tausch: [[/^Esstisch/, ['Esstisch Altholz massiv', 'Möbel', 220, 100, 76, 'Stühle kommen automatisch dazu.']], [/^Doppelbett 180$/, ['Bett Altholz', 'Möbel', 180, 215, 45, '']], [/^Waschtisch$/, ['Waschtisch Altholz mit Steinbecken', 'Sanitär', 100, 50, 85, '']]], extra: { wohn: ['Teppich', 'Sessel'], ess: ['Sitzbank'] } }],
  ['glam', 'Glam / Hollywood', '#f1ebe6', '#e8e1dc', '#d8c1c8', '#b8963e', 'Samt, Gold, Spiegel, Kristall, Rosé und Creme.', 1.6,
    { konzepte: ['mitte', 'zonen', 'wand', 'getrennt', 'linear'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa Samt rosé', 'Möbel', 220, 95, 80, '']], [/^Doppelbett 180$/, ['Polsterbett Samt', 'Möbel', 180, 220, 50, '']], [/^Waschtisch$/, ['Waschtisch Marmor & Gold', 'Sanitär', 120, 50, 85, '']], [/^Deckenleuchte$/, ['Kronleuchter', 'Licht', 70, 70, 60, '']]], extra: { wohn: ['Sessel'], schlaf: ['Sessel'] } }],
  ['cottage', 'Cottagecore', '#f5efe3', '#a07a52', '#efe3cc', '#7a9a6a', 'Blümchen, Vintage-Holz, Kräuter, gemütlich wie ein Landhaus in England.', 0.95,
    { konzepte: ['wand', 'mitte', 'zonen', 'getrennt', 'linear'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa geblümt', 'Möbel', 210, 92, 85, '']], [/^Waschtisch$/, ['Waschtisch Vintage-Kommode', 'Sanitär', 90, 50, 85, '']]], extra: { wohn: ['Pflanze groß', 'Sessel'], ess: ['Sitzbank'], schlaf: ['Kommode'] } }],
  ['retro', 'Retro 70er', '#efe0c0', '#8a5a2a', '#c4782a', '#2f6f5f', 'Orange, Braun, Senf, runde Formen, Flokati.', 1,
    { konzepte: ['mitte', 'wand', 'zonen', 'linear', 'getrennt'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa Cord rund', 'Möbel', 220, 95, 75, '']], [/^Couchtisch$/, ['Couchtisch oval Glas', 'Möbel', 110, 60, 38, '']], [/^Deckenleuchte$/, ['Kugel-Pendelleuchte', 'Licht', 45, 45, 45, '']]], extra: { wohn: ['Teppich', 'Sessel'] } }],
  ['urbanjungle', 'Urban Jungle', '#eef0ea', '#a88b66', '#d8cfbf', '#2f7a4a', 'Viele Pflanzen, Grüntöne, Holz, Rattan – Natur in der Wohnung.', 1,
    { konzepte: ['wand', 'zonen', 'mitte', 'linear', 'getrennt'], tausch: [[/^Regal hoch$/, ['Pflanzenregal', 'Möbel', 100, 35, 180, '']]], extra: { wohn: ['Pflanze groß', 'Pflanze groß', 'Sessel'], schlaf: ['Pflanze groß'], bad: ['Pflanze groß'], buero: ['Pflanze groß'], kueche: ['Pflanze groß'] } }],
  ['orient', 'Orientalisch', '#efe1cc', '#8a4a2a', '#7a2f2f', '#c9a64a', 'Muster, Messing-Laternen, Bodenkissen, Fliesen in Blau und Terrakotta.', 1.1,
    { konzepte: ['mitte', 'wand', 'zonen', 'getrennt', 'linear'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa niedrig mit Kissen', 'Möbel', 240, 95, 60, '']], [/^Couchtisch$/, ['Tablett-Tisch Messing', 'Möbel', 70, 70, 40, '']], [/^Deckenleuchte$/, ['Laterne Messing', 'Licht', 40, 40, 60, '']]], extra: { wohn: ['Teppich'], schlaf: ['Teppich'] } }],
  ['french', 'Französisch / Shabby', '#f4f0ea', '#c7b8a0', '#ece6dc', '#8a9ab0', 'Weiß gekalkt, Stuck, Vintage-Möbel, Pastell, Patina.', 1.1,
    { konzepte: ['wand', 'mitte', 'getrennt', 'zonen', 'linear'], tausch: [[/^Waschtisch$/, ['Waschtisch Kommode weiß', 'Sanitär', 100, 50, 85, '']], [/^Badewanne$/, ['Badewanne mit Füßen', 'Sanitär', 170, 78, 62, '']], [/^Doppelbett 180$/, ['Bett Metall verschnörkelt', 'Möbel', 180, 210, 45, '']]], extra: { schlaf: ['Kommode'], wohn: ['Sessel'] } }],
  ['klassisch', 'Klassisch / Neoklassik', '#f0ece4', '#7a5a3a', '#e2d6c2', '#2f3f5f', 'Symmetrie, Stuck, Fischgrät-Parkett, edle Stoffe.', 1.4,
    { konzepte: ['mitte', 'wand', 'zonen', 'getrennt', 'linear'], tausch: [[/^Sofa 3-Sitzer$/, ['Chesterfield-Sofa', 'Möbel', 220, 95, 78, '']], [/^Esstisch/, ['Esstisch mit Säulenfuß', 'Möbel', 200, 100, 76, 'Stühle kommen automatisch dazu.']]], extra: { wohn: ['Sessel', 'Teppich'], schlaf: ['Kommode'] } }],
  ['eklektisch', 'Eklektisch / Maximal', '#2f4f4f', '#7a4a3a', '#b5652f', '#e0a040', 'Mutig gemischt: Farben, Muster, Kunst, Fundstücke – aber mit rotem Faden.', 1.1,
    { konzepte: ['mitte', 'zonen', 'wand', 'getrennt', 'linear'], tausch: [[/^Sofa 3-Sitzer$/, ['Sofa Samt farbig', 'Möbel', 220, 95, 80, '']]], extra: { wohn: ['Sessel', 'Teppich', 'Pflanze groß'], schlaf: ['Sessel'] } }]
];
STILE_MEHR.forEach(([id, name, wand, boden, moebel, akzent, text, faktor, regeln]) => {
  if (!STILE.find((s) => s.id === id)) STILE.push({ id, name, wand, boden, moebel, akzent, text });
  STIL_FARBE[id] = moebel; STIL_FAKTOR[id] = faktor; STIL_REGELN[id] = Object.assign({ tausch: [], extra: {} }, regeln);
});

/* ---------- Stil-Mix ---------- */
function mischFarbe(a, b, t) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const x = h(a), y = h(b); return '#' + x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, '0')).join('');
}
const MIX_ANTEIL = { '80': 0.2, '70': 0.3, '50': 0.5 };
/* Liefert für o (mit o.stil, optional o.stil2 + o.mix) Regeln, Farben, Faktor und Namen – Hauptstil führt, Zweitstil setzt Akzente */
function stilMix(o) {
  const A = STILE.find((s) => s.id === o.stil) || STILE[0], RA = STIL_REGELN[A.id] || STIL_REGELN.hell;
  if (!o.stil2 || o.stil2 === o.stil) return { stil: A, regeln: RA, name: A.name, faktor: STIL_FAKTOR[A.id] || 1, moebel: STIL_FARBE[A.id] };
  const B = STILE.find((s) => s.id === o.stil2), RB = STIL_REGELN[B.id], t = MIX_ANTEIL[o.mix || '70'];
  const jedes = Math.max(1, Math.round(1 / t)); // jedes n-te Teil im Zweitstil
  const tausch = []; let i = 0;
  // Tausch-Regeln abwechselnd: Hauptstil überall, Zweitstil bei jedem n-ten Teil, das der Hauptstil nicht ändert
  RA.tausch.forEach((r) => tausch.push(r));
  RB.tausch.forEach((r) => { if (!RA.tausch.some(([re]) => String(re) === String(r[0])) && (i++ % jedes === 0 || t >= 0.5)) tausch.push(r); });
  const extra = {};
  Object.keys(Object.assign({}, RA.extra, RB.extra)).forEach((k) => { extra[k] = (RA.extra[k] || []).concat((RB.extra[k] || []).slice(0, t >= 0.5 ? 2 : 1)).filter((v, j, arr) => arr.indexOf(v) === j); });
  const konzepte = [...new Set([RA.konzepte[0], RB.konzepte[0]].concat(RA.konzepte))];
  const stil = { id: A.id, name: A.name + ' × ' + B.name, wand: mischFarbe(A.wand, B.wand, t * 0.6), boden: t >= 0.5 ? mischFarbe(A.boden, B.boden, 0.5) : A.boden, moebel: mischFarbe(A.moebel, B.moebel, t), akzent: B.akzent, text: A.text.replace(/\.$/, '') + ' – dazu ' + B.name + ': ' + B.text.charAt(0).toLowerCase() + B.text.slice(1) };
  return { stil, regeln: { konzepte, tausch, extra, weg: RA.weg }, name: stil.name + ' (' + Math.round((1 - t) * 100) + '/' + Math.round(t * 100) + ')', faktor: (STIL_FAKTOR[A.id] || 1) * (1 - t) + (STIL_FAKTOR[B.id] || 1) * t, moebel: mischFarbe(STIL_FARBE[A.id], STIL_FARBE[B.id], t) };
}

/* ---------- Andere KIs fragen (über den eigenen Joum-Server) ---------- */
/* Der Server fragt Sprach-/Bild-KIs (z. B. für weitere Grundriss-Ideen oder ein Foto im Stil) und liefert JSON zurück:
   { ideen: [{ titel, text, plan: [{ n, g, w, d, h, x, y, rot }] }] } – jede Idee wird in der App mit den Raumregeln geprüft. */
async function kiIdeenHolen(o) {
  if (!KONFIG.kiServer) throw new Error('kein-server');
  const antwort = await fetch(KONFIG.kiServer + '/raum-ideen', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raum: o.raum, breite: o.breite, tiefe: o.tiefe, hoehe: o.hoehe, fenster: o.fensterPos || null, stil: o.stil, stil2: o.stil2 || null, mix: o.mix || null, wuensche: (o.los && o.los.wuensche) || null }) });
  if (!antwort.ok) throw new Error('server');
  const j = await antwort.json();
  return (j.ideen || []).map((idee) => {
    const plan = (idee.plan || []).map((e) => Object.assign({ id: uid() }, e)).filter((e) => passt(o.raum, e.n).ok);
    const probe = Object.assign({}, o, { plan }), fehler = pruefen(probe).filter((x) => x.stufe === 'fehler');
    return { konzept: 'ki', titel: 'KI: ' + (idee.titel || 'Idee'), unter: idee.text || '', plan, ergebnis: fehler.map((f) => ({ n: 'Regel', ok: false, grund: f.text })), kosten: losKosten(o, plan), extern: true };
  }).filter((v) => !v.ergebnis.length);   // nur Ideen anzeigen, die die Raumregeln bestehen
}
