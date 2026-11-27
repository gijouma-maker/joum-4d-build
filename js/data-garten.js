/* Joum 4D Build – Gartenplaner 4D
   Garten 20 × 12 m (Haus oben). Koordinaten in Metern.
   Pflanzen: r = Radius jetzt, rMax = Radius ausgewachsen, jahre = Jahre bis ausgewachsen */

const GARTEN_FARBEN = {
  // [Frühling, Sommer, Herbst, Winter]
  rasen: ['#5f9e3e', '#4d8a32', '#6f8a3a', '#8a9a7a'],
  baum: ['#8fcf6a', '#3f7a2a', '#c9772e', '#6b5a4a'],
  obstbaum: ['#f2c4d6', '#4a8a30', '#d1902f', '#6b5a4a'],
  strauch: ['#7fbf5a', '#3d6e2a', '#b5552e', '#5a5040'],
  hecke: ['#5a9a40', '#2f5f22', '#5a6a2a', '#3f4f30'],
  beet: ['#e58fb5', '#c9a0e0', '#e0a040', '#6b5a48'],
  hochbeet: ['#7aa850', '#5c9a3a', '#c08a3a', '#5a4a3a'],
  insel: ['#e8d36a', '#b8a0e8', '#d9783a', '#7a6a58'],
  lavendel: ['#7a9a6a', '#9d7ed6', '#8a8a6a', '#7a7a6a']
};

const GARTEN_VORSCHLAEGE = [
  { id: 'natur', name: 'Naturgarten', pflege: 'mittel', text: 'Wildblumen, heimische Sträucher, Teich mit flachem Ufer – viel Leben für Bienen und Vögel.',
    elemente: [
      { k: 'terrasse', x: 0.5, y: 0.5, w: 6, h: 4, n: 'Terrasse Holz' },
      { k: 'rasen', x: 7, y: 0.5, w: 12.5, h: 6, n: 'Blumenwiese/Rasen' },
      { k: 'weg', x: 3, y: 4.5, w: 1, h: 7, n: 'Rindenmulch-Weg' },
      { k: 'teich', x: 9, y: 7, w: 5, h: 3.5, n: 'Naturteich (Gitter!)' },
      { k: 'beet', x: 0.5, y: 5, w: 2.3, h: 6.5, n: 'Wildstaudenbeet' },
      { k: 'insel', x: 14.5, y: 7.5, w: 4.5, h: 3.5, n: 'Pflanzinsel Wildblumen' },
      { k: 'hecke', x: 0, y: 11.5, w: 20, h: 0.5, n: 'Wildhecke' },
      { k: 'baum', x: 17.5, y: 2.5, r: 1, rMax: 4, jahre: 10, n: 'Feldahorn' },
      { k: 'obstbaum', x: 5.5, y: 9, r: 0.7, rMax: 2.5, jahre: 6, n: 'Apfel (Halbstamm)' },
      { k: 'strauch', x: 13, y: 2, r: 0.4, rMax: 1.3, jahre: 4, n: 'Kornelkirsche' },
      { k: 'strauch', x: 19, y: 10, r: 0.4, rMax: 1.2, jahre: 4, n: 'Wildrose' }
    ],
    kosten: [['Terrasse Holz 24 m²', 2900], ['Naturteich inkl. Folie, Gitter', 1600], ['Wildstauden & Blumenwiese', 700], ['Wildhecke 20 m', 600], ['Bäume & Sträucher', 650], ['Rindenmulch-Weg', 250]] },

  { id: 'modern', name: 'Modern pflegeleicht', pflege: 'gering', text: 'Klare Linien, große Platten, Gräser und Kies mit Unkrautvlies, Rollrasen, warmes Licht.',
    elemente: [
      { k: 'terrasse', x: 0.5, y: 0.5, w: 9, h: 4.5, n: 'Feinsteinzeug-Terrasse' },
      { k: 'rasen', x: 0.5, y: 5.5, w: 12, h: 6, n: 'Rollrasen' },
      { k: 'kies', x: 10, y: 0.5, w: 9.5, h: 4.5, n: 'Kiesfläche mit Gräsern' },
      { k: 'weg', x: 12.5, y: 5, w: 1.2, h: 6.5, n: 'Plattenweg' },
      { k: 'insel', x: 14.5, y: 6, w: 5, h: 2.5, n: 'Gräserinsel' },
      { k: 'hecke', x: 0, y: 11.5, w: 20, h: 0.5, n: 'Hainbuchenhecke' },
      { k: 'baum', x: 17, y: 10, r: 0.8, rMax: 2.2, jahre: 8, n: 'Kugel-Ahorn' },
      { k: 'lavendel', x: 2, y: 4.8, w: 7, h: 0.6, n: 'Lavendelband' },
      { k: 'licht', x: 13.1, y: 6, n: 'Wegeleuchten IP44' }
    ],
    kosten: [['Feinsteinzeug-Terrasse 40 m²', 5600], ['Rollrasen 72 m²', 650], ['Kies + Vlies + Gräser', 1400], ['Plattenweg', 700], ['Hecke 20 m', 900], ['Gartenlicht (Elektriker)', 900]] },

  { id: 'bauern', name: 'Bauerngarten mit Hochbeeten', pflege: 'hoch', text: 'Gemüse, Kräuter und Blumen gemischt, Hochbeete mit Wühlmausgitter, Wegekreuz, Obstbäume.',
    elemente: [
      { k: 'terrasse', x: 0.5, y: 0.5, w: 5, h: 4, n: 'Pflasterterrasse' },
      { k: 'rasen', x: 6, y: 0.5, w: 13.5, h: 3.5, n: 'Rasen' },
      { k: 'weg', x: 6, y: 7, w: 13.5, h: 1, n: 'Wegekreuz Kies' },
      { k: 'weg', x: 12.2, y: 4, w: 1, h: 7.5, n: '' },
      { k: 'hochbeet', x: 7, y: 4.5, w: 4, h: 1.2, n: 'Hochbeet Gemüse' },
      { k: 'hochbeet', x: 14, y: 4.5, w: 4, h: 1.2, n: 'Hochbeet Salat' },
      { k: 'beet', x: 7, y: 8.5, w: 4.5, h: 2.5, n: 'Kräuter & Ringelblumen' },
      { k: 'beet', x: 14, y: 8.5, w: 5, h: 2.5, n: 'Stauden & Beeren' },
      { k: 'haus', x: 0.5, y: 8, w: 3, h: 3, n: 'Gartenhaus' },
      { k: 'obstbaum', x: 4.5, y: 6.5, r: 0.6, rMax: 2.5, jahre: 6, n: 'Birne' },
      { k: 'obstbaum', x: 18.5, y: 2, r: 0.6, rMax: 2.3, jahre: 6, n: 'Zwetschge' },
      { k: 'hecke', x: 0, y: 11.5, w: 20, h: 0.5, n: 'Johannisbeer-Hecke' }
    ],
    kosten: [['Pflasterterrasse 20 m²', 2200], ['2 Hochbeete inkl. Gitter, Füllung', 900], ['Kieswege', 800], ['Gartenhaus (Genehmigung prüfen)', 2500], ['Obstbäume, Beeren, Stauden', 700], ['Bewässerung Tropf', 350]] },

  { id: 'medi', name: 'Mediterran', pflege: 'gering', text: 'Natursteinplatten, Lavendel, Olive im Kübel (frostempfindlich), Kies, Kräuterspirale, Pergola.',
    elemente: [
      { k: 'terrasse', x: 0.5, y: 0.5, w: 8, h: 5, n: 'Naturstein + Pergola' },
      { k: 'kies', x: 9, y: 0.5, w: 10.5, h: 11, n: 'Kiesgarten' },
      { k: 'rasen', x: 0.5, y: 6, w: 8, h: 5.5, n: 'Rasen' },
      { k: 'lavendel', x: 9.5, y: 3, w: 9, h: 0.8, n: 'Lavendel' },
      { k: 'insel', x: 11, y: 6, w: 3.5, h: 3.5, n: 'Kräuterspirale' },
      { k: 'baum', x: 16.5, y: 8.5, r: 0.6, rMax: 1.6, jahre: 10, n: 'Olive (Kübel)' },
      { k: 'strauch', x: 18.5, y: 5.5, r: 0.4, rMax: 1, jahre: 3, n: 'Rosmarin' },
      { k: 'weg', x: 8.5, y: 0.5, w: 0.5, h: 11, n: 'Trittsteine' }
    ],
    kosten: [['Naturstein-Terrasse 40 m²', 6000], ['Pergola Holz', 1800], ['Kiesgarten 115 m²', 2300], ['Lavendel, Kräuter, Olive', 900], ['Kräuterspirale', 300]] },

  { id: 'familie', name: 'Familien- & Spielgarten', pflege: 'mittel', text: 'Viel Rasen zum Toben, Sandkasten mit Abdeckung, Schaukel mit Fallschutz, Naschbeet, kein offenes Wasser.',
    elemente: [
      { k: 'terrasse', x: 0.5, y: 0.5, w: 7, h: 4.5, n: 'Terrasse' },
      { k: 'rasen', x: 0.5, y: 5.5, w: 19, h: 6, n: 'Spielrasen (strapazierfähig)' },
      { k: 'spiel', x: 13, y: 0.5, w: 6.5, h: 4.5, n: 'Schaukel + Fallschutz' },
      { k: 'sand', x: 8.5, y: 1, w: 3, h: 3, n: 'Sandkasten mit Deckel' },
      { k: 'hochbeet', x: 1, y: 9.5, w: 3, h: 1.2, n: 'Naschbeet' },
      { k: 'weg', x: 7.5, y: 4.5, w: 5.5, h: 1, n: 'Weg' },
      { k: 'hecke', x: 0, y: 11.5, w: 20, h: 0.5, n: 'Hecke (ungiftig)' },
      { k: 'baum', x: 17, y: 9, r: 1, rMax: 3.5, jahre: 10, n: 'Schattenbaum' },
      { k: 'strauch', x: 6, y: 10.5, r: 0.4, rMax: 1, jahre: 3, n: 'Himbeere' }
    ],
    kosten: [['Terrasse 30 m²', 3300], ['Spielturm/Schaukel + Fallschutz', 1500], ['Sandkasten mit Deckel', 250], ['Spielrasen 115 m²', 900], ['Naschbeet', 300], ['Hecke ungiftig', 700]] }
];

const GARTEN_TIPPS = [
  ['Hochbeet', 'Ganz unten verzinktes Wühlmausgitter, an den Seiten hochziehen.'],
  ['Teich', 'Mit Kleinkindern kindersicher: Teichgitter knapp unter der Wasseroberfläche, flache Ufer, Zaun – oder Teich erst später.'],
  ['Gartenhaus', 'Verfahrensfreie Größe und Grenzabstand je Bundesland unterschiedlich – vorher beim Bauamt fragen.'],
  ['Außenlicht', 'Leuchten mind. IP44, im Boden IP67. Warmweiß unter 3000 K schont Insekten.'],
  ['Erdkabel', '230-V-Leitungen im Garten (NYY, 60 cm tief, Warnband) nur durch Elektrofachkraft.'],
  ['Pflanzabstand', 'Immer nach der ausgewachsenen Größe pflanzen – siehe Zeit-Regler. Grenzabstände für Bäume/Hecken im Nachbarrecht.'],
  ['Giftpflanzen', 'Mit Kindern/Haustieren meiden: Eibe, Goldregen, Kirschlorbeer, Fingerhut, Engelstrompete.'],
  ['Wasser', 'Regentonne/Zisterne und Tropfbewässerung sparen Trinkwasser.']
];

/* ---------- Garten-Generator: viele Vorschläge für beliebige Maße und Wünsche ----------
   L = Länge entlang des Hauses (m), T = Tiefe vom Haus weg (m)
   wunsch: { belag: 'holz'|'stein'|'beton'|'wpc', kinder, teich, rasen, hochbeete, pflege: 'gering'|'mittel'|'hoch', budget } */
const BELAEGE = { holz: { n: 'Holz', preis: 120, farbe: '#b08a5e' }, stein: { n: 'Naturstein/Pflaster', preis: 140, farbe: '#b9b2a6' }, beton: { n: 'Betonplatten', preis: 90, farbe: '#a9a9a6' }, wpc: { n: 'WPC-Dielen', preis: 150, farbe: '#6e5a4a' } };
const GARTEN_STILE = [
  { id: 'natur', n: 'Naturgarten', pflege: 'mittel', belag: 'holz', text: 'Wildstauden, heimische Sträucher, Blumenwiese – viel Leben für Bienen und Vögel.' },
  { id: 'modern', n: 'Modern pflegeleicht', pflege: 'gering', belag: 'beton', text: 'Klare Linien, große Platten, Gräser und Kies, Rollrasen, warmes Licht.' },
  { id: 'bauern', n: 'Bauerngarten mit Hochbeeten', pflege: 'hoch', belag: 'stein', text: 'Gemüse, Kräuter und Blumen, Hochbeete mit Wühlmausgitter, Wegekreuz.' },
  { id: 'medi', n: 'Mediterran', pflege: 'gering', belag: 'stein', text: 'Natursteinplatten, Lavendel, Kies, Kräuterspirale, Olive im Kübel.' },
  { id: 'familie', n: 'Familien- & Spielgarten', pflege: 'mittel', belag: 'wpc', text: 'Viel Rasen, Spielbereich mit Fallschutz, Naschbeet, kein offenes Wasser.' },
  { id: 'japan', n: 'Japanisch inspiriert', pflege: 'mittel', belag: 'holz', text: 'Ruhige Kiesflächen, Trittsteine, Ahorn, Moos und Bambus in Rhizomsperre.' },
  { id: 'nutz', n: 'Selbstversorger', pflege: 'hoch', belag: 'beton', text: 'Viele Hochbeete, Beerensträucher, Obstbäume, Kompost, Regentonne.' },
  { id: 'lounge', n: 'Lounge & Abend', pflege: 'gering', belag: 'wpc', text: 'Große Terrasse, Sitzecke, Sichtschutz, indirektes Licht, wenig Rasen.' }
];

function gartenErzeugen(L, T, stil, wunsch) {
  wunsch = wunsch || {};
  L = Math.max(4, Math.min(60, L || 20)); T = Math.max(3, Math.min(60, T || 12));
  const belag = wunsch.belag || stil.belag, B = BELAEGE[belag];
  const el = [], kosten = [], add = (n, k) => kosten.push([n, Math.round(k / 10) * 10]);
  const kl = Math.min(L, T) < 6;
  // Terrasse am Haus
  let tw = Math.min(L - 0.5, Math.max(3, L * (stil.id === 'lounge' ? 0.6 : 0.42))), tt = Math.min(T * 0.4, Math.max(2.5, T * (stil.id === 'lounge' ? 0.38 : 0.3)));
  if (wunsch.terrasse === 'groesser') { tw = Math.min(L - 0.5, tw * 1.3); tt = Math.min(T * 0.5, tt * 1.3); }
  if (wunsch.terrasse === 'kleiner') { tw *= 0.75; tt *= 0.8; }
  el.push({ k: 'terrasse', x: 0.3, y: 0.3, w: tw, h: tt, n: 'Terrasse ' + B.n, mat: belag }); add(`Terrasse ${B.n} ${(tw * tt).toFixed(0)} m²`, tw * tt * B.preis);
  const rest = { x: 0.3, y: tt + 0.6, w: L - 0.6, h: T - tt - 1.2 };
  const rasen = wunsch.rasen !== false && !['medi', 'japan'].includes(stil.id);
  // Fläche hinter der Terrasse
  if (rasen) { el.push({ k: 'rasen', x: rest.x, y: rest.y, w: rest.w, h: rest.h, n: stil.id === 'familie' ? 'Spielrasen' : stil.id === 'natur' ? 'Blumenwiese/Rasen' : 'Rollrasen' }); add(`Rasen ${(rest.w * rest.h).toFixed(0)} m²`, rest.w * rest.h * 10); }
  else { el.push({ k: 'kies', x: rest.x, y: rest.y, w: rest.w, h: rest.h, n: stil.id === 'japan' ? 'Kiesgarten (geharkt)' : 'Kiesgarten' }); add(`Kiesfläche ${(rest.w * rest.h).toFixed(0)} m²`, rest.w * rest.h * 25); }
  // Fläche neben der Terrasse
  if (L - tw > 2) {
    const nx = tw + 0.8, nw = L - tw - 1.1;
    if (stil.id === 'modern' || stil.id === 'medi' || stil.id === 'japan') { el.push({ k: 'kies', x: nx, y: 0.3, w: nw, h: tt, n: 'Kies mit Gräsern' }); add('Kies + Gräser', nw * tt * 30); }
    else if (stil.id === 'familie') { el.push({ k: 'spiel', x: nx, y: 0.3, w: nw, h: tt, n: 'Schaukel + Fallschutz' }); add('Spielbereich mit Fallschutz', 1500); }
    else { el.push({ k: 'beet', x: nx, y: 0.3, w: nw, h: tt, n: 'Staudenbeet' }); add('Stauden', nw * tt * 35); }
  }
  // Weg
  const wx = Math.min(L - 1.5, tw * 0.5);
  el.push({ k: 'weg', x: wx, y: tt + 0.3, w: 1, h: T - tt - 0.6, n: stil.id === 'japan' ? 'Trittsteine' : 'Gartenweg' }); add(`Gartenweg ${(T - tt).toFixed(0)} m`, (T - tt) * 1 * 60);
  // Beete am Rand
  if (!kl) { el.push({ k: stil.id === 'medi' ? 'lavendel' : 'beet', x: 0.3, y: T - 1.6, w: Math.max(1, wx - 0.6), h: 1.2, n: stil.id === 'medi' ? 'Lavendel' : 'Randbeet' }); add('Randbeet', (wx - 0.6) * 1.2 * 35); }
  // Hochbeete
  const hb = wunsch.hochbeete != null ? wunsch.hochbeete : (stil.id === 'nutz' ? 4 : stil.id === 'bauern' ? 2 : stil.id === 'familie' ? 1 : 0);
  for (let i = 0; i < hb && i < 6; i++) { const x = wx + 1.6 + i * 2.4, y = tt + 1.2; if (x + 2 > L - 0.3) break; el.push({ k: 'hochbeet', x, y, w: 2, h: 1, n: i ? '' : 'Hochbeete' }); }
  if (hb) add(`${Math.min(hb, 6)} Hochbeet(e) inkl. Wühlmausgitter`, Math.min(hb, 6) * 450);
  // Teich – nie bei kleinen Kindern ohne Sicherung
  const teich = wunsch.teich === true || (wunsch.teich !== false && ['natur', 'japan'].includes(stil.id) && !wunsch.kinder);
  if (teich && rest.w > 5 && rest.h > 4) { const tx = L * 0.55, ty = tt + rest.h * 0.45 + 0.6; el.push({ k: 'teich', x: tx, y: ty, w: Math.min(4.5, L * 0.3), h: Math.min(3, rest.h * 0.4), n: wunsch.kinder ? 'Teich (Gitter!)' : 'Teich' }); add('Teich inkl. Folie' + (wunsch.kinder ? ' + Kinderschutzgitter' : ''), Math.min(4.5, L * 0.3) * Math.min(3, rest.h * 0.4) * 120 + (wunsch.kinder ? 300 : 0)); }
  // Sandkasten
  if (wunsch.kinder || stil.id === 'familie') { if (rest.w > 6) { el.push({ k: 'sand', x: L - 3.2, y: tt + 1, w: 2.5, h: 2.5, n: 'Sandkasten mit Deckel' }); add('Sandkasten mit Deckel', 250); } }
  // Gartenhaus
  if (['bauern', 'nutz'].includes(stil.id) && T > 9 && L > 8) { el.push({ k: 'haus', x: L - 3.5, y: T - 3.5, w: 3, h: 3, n: 'Gartenhaus' }); add('Gartenhaus (Genehmigung prüfen)', 2500); }
  // Hecke / Sichtschutz hinten
  el.push({ k: 'hecke', x: 0, y: T - 0.4, w: L, h: 0.4, n: stil.id === 'lounge' ? 'Sichtschutz' : (wunsch.kinder ? 'Hecke (ungiftig)' : 'Hecke') }); add(`${stil.id === 'lounge' ? 'Sichtschutz' : 'Hecke'} ${L.toFixed(0)} m`, L * (stil.id === 'lounge' ? 90 : 30));
  // Bäume / Sträucher
  const baumArt = stil.id === 'nutz' || stil.id === 'bauern' ? 'obstbaum' : 'baum';
  const baeume = [[L - 1.8, T - 2.2, 1, 3.2, 8], [1.8, T - 3, 0.7, 2.4, 6]];
  if (!kl) baeume.forEach(([x, y, r, rm, j], i) => { if (i === 1 && L < 10) return; el.push({ k: baumArt, x, y, r, rMax: rm, jahre: j, n: baumArt === 'obstbaum' ? (i ? 'Birne' : 'Apfel') : stil.id === 'japan' ? 'Fächerahorn' : stil.id === 'medi' ? 'Olive (Kübel)' : 'Hausbaum' }); });
  el.push({ k: 'strauch', x: L - 0.9, y: tt + 1.2, r: 0.35, rMax: 1.1, jahre: 3, n: stil.id === 'nutz' ? 'Johannisbeere' : 'Strauch' });
  add('Bäume & Sträucher', 450 + (kl ? 0 : 300));
  // Licht
  if (['modern', 'lounge', 'medi'].includes(stil.id) || wunsch.licht) { el.push({ k: 'licht', x: wx + 0.5, y: tt + 1, n: 'Wegeleuchten IP44' }); add('Gartenlicht (Elektrofachkraft)', 900); }
  const summe = kosten.reduce((s, k) => s + k[1], 0);
  return { id: stil.id + '-' + belag, name: stil.n, stil: stil.id, belag, pflege: stil.pflege, text: stil.text, L, T, elemente: el, kosten, summe };
}

/* Viele Vorschläge: jeder Stil, dazu Varianten mit anderem Belag; Filter nach Budget/Pflege */
function gartenVorschlaege(L, T, wunsch) {
  wunsch = wunsch || {};
  let liste = [];
  GARTEN_STILE.forEach((st) => {
    liste.push(gartenErzeugen(L, T, st, wunsch));
    if (!wunsch.belag) Object.keys(BELAEGE).filter((b) => b !== st.belag).slice(0, 1).forEach((b) => liste.push(gartenErzeugen(L, T, st, Object.assign({}, wunsch, { belag: b }))));
  });
  if (wunsch.pflege) liste.sort((a, b) => (a.pflege === wunsch.pflege ? -1 : 0) - (b.pflege === wunsch.pflege ? -1 : 0));
  if (wunsch.budget) { const ok = liste.filter((v) => v.summe <= wunsch.budget * 1.1); liste = ok.length >= 3 ? ok : liste.sort((a, b) => a.summe - b.summe); }
  if (wunsch.kinder) liste.sort((a, b) => (b.stil === 'familie') - (a.stil === 'familie'));
  return liste;
}
