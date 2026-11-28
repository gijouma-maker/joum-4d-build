/* Joum 4D Build – Fitnessraum: echte Fitnessgeräte statt Tisch, großer Spiegel immer dabei, eigene Ideen
   (Cardio vor dem Spiegel, Kraft-Ecke mit Rack, Freifläche für Yoga/HIIT, Kompakt-Gym), Abstandsregeln
   (hinter dem Laufband 2 m frei, rund ums Rack Platz), Bodenschutz. */

const FIT = [
  ['Laufband', 'Möbel', 80, 180, 140, 'Hinter dem Laufband 2 m frei lassen, eigene Steckdose (16 A).', 600, 3500],
  ['Laufband klappbar', 'Möbel', 75, 160, 130, 'Hochgeklappt nur ca. 75 × 90 cm.', 400, 1500],
  ['Crosstrainer', 'Möbel', 70, 170, 160, 'Gelenkschonend.', 400, 2500],
  ['Ergometer / Heimtrainer', 'Möbel', 55, 110, 140, '', 250, 1500],
  ['Spinning-Bike', 'Möbel', 55, 120, 110, '', 300, 2500],
  ['Rudergerät', 'Möbel', 55, 220, 55, 'Aufrecht lagerbar.', 300, 1500],
  ['Power Rack', 'Möbel', 130, 140, 220, 'Raumhöhe mind. 2,30 m, im OG Deckentragfähigkeit prüfen, Gummiboden.', 500, 2500],
  ['Kraftstation / Multigym', 'Möbel', 200, 120, 210, '', 600, 3500],
  ['Kabelzug-Turm', 'Möbel', 100, 120, 210, '', 600, 3000],
  ['Hantelbank verstellbar', 'Möbel', 60, 140, 50, '', 100, 600],
  ['Kurzhantel-Ständer', 'Möbel', 120, 50, 80, '', 80, 400],
  ['Langhantel + Scheibenständer', 'Möbel', 80, 60, 120, '', 150, 700],
  ['Kettlebell-Regal', 'Möbel', 100, 35, 60, '', 60, 250],
  ['Boxsack (Decke/Ständer)', 'Möbel', 60, 60, 180, 'Deckenhaken nur in Massivdecke, sonst Standgerät.', 80, 400],
  ['Klimmzugstange an der Wand', 'Möbel', 120, 60, 230, 'In Massivwand dübeln.', 50, 250],
  ['Sprossenwand', 'Möbel', 90, 15, 220, '', 150, 600],
  ['Yoga- / Stretchfläche', 'Deko', 200, 150, 1, 'Freifläche mit Matte.', 40, 150],
  ['Gummi-Bodenmatten', 'Wand & Bau', 200, 200, 2, 'Schützt Boden und dämpft Lärm.', 80, 400],
  ['Spiegelwand groß (Sicherheitsspiegel)', 'Deko', 300, 1, 200, 'Splitterschutzfolie, Unterkante ca. 20–30 cm über Boden – Technik kontrollieren.', 300, 1200],
  ['Wandregal Kleingeräte', 'Möbel', 120, 30, 120, 'Bänder, Matten, Faszienrolle.', 60, 300],
  ['Ventilator / Klima', 'Technik', 40, 40, 110, 'Gute Lüftung: Fenster oder Lüfter.', 50, 800],
  ['Fernseher an Wand 55"', 'Technik', 124, 6, 72, 'Für Kurse/Training.', 400, 1200],
  ['Getränke-Kühlschrank klein', 'Technik', 50, 55, 85, '', 150, 500],
  ['Handtuch- & Flaschenregal', 'Möbel', 60, 30, 100, '', 40, 200],
  ['Sauna-Kabine klein', 'Möbel', 120, 120, 200, 'Eigener Stromkreis (400 V), Elektriker.', 2500, 8000]
];
MK['Fitness'] = FIT;
FIT.forEach((x) => { const sp = x.slice(0, 6); EXTRA_SPECS[x[0]] = sp; MK_ALLE.push({ kat: 'Fitness', spec: sp, preis: [x[6], x[7]] }); PREISE.unshift([new RegExp('^' + x[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), x[6], x[7]]); });
MK_FUER.fit = ['Fitness', 'Regale', 'Licht & Deko'];
const RA_ALT = raumArt;
raumArt = function (id) { return id === 'fitness' ? 'fit' : RA_ALT(id); };
RAUM_VERBOTEN.fitness = /Tisch|Stuhl|Sofa|Couch|Bett|Kommode|Sideboard|Kleiderschrank|Nachttisch|Vitrine|Esstisch|TV-Board/;
const FR = (n) => FIT.find((x) => x[0] === n).slice(0, 6);
const FIT_K = {
  f_cardio: ['Cardio vor dem Spiegel', 'Laufband, Crosstrainer und Rad in einer Reihe mit Blick in den großen Spiegel – Matte für Dehnen daneben.', ['Laufband', 'Crosstrainer', 'Ergometer / Heimtrainer', 'Yoga- / Stretchfläche', 'Handtuch- & Flaschenregal', 'Ventilator / Klima']],
  f_kraft: ['Kraft-Ecke mit Rack', 'Power Rack auf Gummiboden, Hantelbank, Kurzhanteln, Scheiben – Spiegel zur Technik-Kontrolle.', ['Power Rack', 'Hantelbank verstellbar', 'Kurzhantel-Ständer', 'Langhantel + Scheibenständer', 'Gummi-Bodenmatten', 'Kettlebell-Regal']],
  f_frei: ['Freifläche für Yoga & HIIT', 'Mitte bleibt frei für Kurse vor dem TV, Geräte schmal an der Wand.', ['Yoga- / Stretchfläche', 'Sprossenwand', 'Wandregal Kleingeräte', 'Kettlebell-Regal', 'Fernseher an Wand 55"', 'Rudergerät']],
  f_kompakt: ['Kompakt-Gym', 'Alles in einem kleinen Raum: Kraftstation, klappbares Laufband, Matte.', ['Kraftstation / Multigym', 'Laufband klappbar', 'Yoga- / Stretchfläche', 'Kurzhantel-Ständer']],
  f_box: ['Boxen & Funktional', 'Boxsack, Klimmzugstange, Rudergerät und Kettlebells – Zirkeltraining.', ['Boxsack (Decke/Ständer)', 'Klimmzugstange an der Wand', 'Rudergerät', 'Kettlebell-Regal', 'Gummi-Bodenmatten', 'Spinning-Bike']]
};
const FIT_KEYS = Object.keys(FIT_K);
Object.entries(FIT_K).forEach(([k, [t, u, teile]]) => {
  KONZEPT_TEXT[k] = [t, u];
  SONDER_KONZEPT[k] = (o, liste) => {
    // eigene Wünsche (über ＋ hinzugefügt) bleiben, Raum-Standards ersetzt die Idee
    const eigen = liste.filter((x) => !FIT.some((f) => f[0] === x[0]) && !/Sportboden|Spiegelwand|Hantelbank$|^Laufband$/.test(x[0]) && ebene(x[0]) === 'boden' && x[1] !== 'Licht');
    const licht = liste.filter((x) => ebene(x[0]) !== 'boden');
    const neu = [FR('Spiegelwand groß (Sicherheitsspiegel)')].concat(teile.map(FR));
    return { vor: [], rest: neu.concat(eigen, licht.filter((x) => !/Spiegel/.test(x[0]))) };
  };
});
// Boden im Fitnessraum: dunkle Gummi-/Sportboden-Optik
const FL_FIT_ALT = flaechen;
flaechen = function (o) { if (o.raum === 'fitness' && !(o.flaechen && o.flaechen.boden)) { o.flaechen = o.flaechen || {}; o.flaechen.boden = { muster: 'f6060', farbe: '#2f2f2f' }; } return FL_FIT_ALT(o); };
