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
