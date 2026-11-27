/* Joum 4D Build – Räume, Kataloge, Sicherheitshinweise
   Katalog-Element: [Name, Gruppe, Breite cm, Tiefe cm, Höhe cm, Montage-/Sicherheitshinweis]
   Gruppen: Licht, Möbel, Wand & Bau, Deko, Technik, Sanitär, Küche, Lager, Garten, Sicherheit */

const BASIS = {
  licht: [
    ['Deckenleuchte', 'Licht', 50, 50, 15, 'Anschluss an vorhandenen Auslass; Strom vorher abschalten und prüfen. Neue Leitungen nur durch Elektrofachkraft.'],
    ['Indirektes Licht (LED-Profil)', 'Licht', 300, 5, 5, 'LED-Netzteil belüftet und erreichbar einbauen.'],
    ['Stehleuchte', 'Licht', 40, 40, 170, 'Kabel nicht quer durch Laufwege führen (Stolpergefahr).'],
    ['Spots / Einbaustrahler', 'Licht', 10, 10, 8, 'In Dämmung nur Leuchten mit Kennzeichnung für Abdeckung; Abstand zu Holz beachten.'],
    ['Wandleuchte', 'Licht', 20, 12, 25, 'Auslass in Wand nötig – sonst Elektrofachkraft.']
  ],
  technik: [
    ['Steckdose (zusätzlich)', 'Technik', 8, 2, 8, 'Neue Steckdosen und Leitungen nur durch Elektrofachkraft (DIN VDE 0100).'],
    ['Rauchmelder', 'Sicherheit', 10, 10, 5, 'Deckenmitte, mind. 50 cm von Wand und Lampen. Pflicht in Schlaf-, Kinderzimmern und Fluren als Rettungsweg.'],
    ['WLAN-Repeater', 'Technik', 10, 5, 10, 'Frei und mittig platzieren, nicht hinter Metall.'],
    ['Heizkörper', 'Technik', 100, 10, 60, 'Heizkörper versetzen = Fachbetrieb (Heizung entleeren, Druck prüfen).'],
    ['Thermostat smart', 'Technik', 6, 6, 8, 'Passenden Adapter für das Ventil wählen.']
  ],
  deko: [
    ['Bild / Rahmen', 'Deko', 60, 3, 40, 'Vor dem Bohren Leitungssucher nutzen: senkrecht/waagerecht über Steckdosen und Schaltern liegen oft Kabel.'],
    ['Spiegel', 'Deko', 60, 3, 90, 'Schwere Spiegel mit passenden Dübeln (Trockenbau: Hohlraumdübel).'],
    ['Pflanze groß', 'Deko', 50, 50, 140, 'Untersetzer gegen Wasserschäden am Boden.'],
    ['Teppich', 'Deko', 200, 140, 1, 'Rutschstopp-Unterlage verwenden.'],
    ['Vorhang / Gardine', 'Deko', 250, 10, 250, 'Schiene in Beton mit Spreizdübeln, in Trockenbau mit Hohlraumdübeln.']
  ],
  bau: [
    ['Tür', 'Wand & Bau', 90, 10, 210, 'Zarge lot- und waagerecht setzen; Montageschaum sparsam.'],
    ['Fenster', 'Wand & Bau', 120, 15, 130, 'Einbau nach RAL-Grundsatz: innen dichter als außen.'],
    ['Vorsatzschale (Trockenbau)', 'Wand & Bau', 300, 10, 250, 'Schallentkopplung mit Dichtband am Rand; Installationen vorher planen.'],
    ['Wandfarbe Akzent', 'Wand & Bau', 300, 1, 250, 'Untergrund prüfen, ggf. grundieren.']
  ]
};

function kat(...listen) { return [].concat(...listen); }

const RAEUME = [
  { id: 'wohnzimmer', name: 'Wohnzimmer', bereich: 'innen', w: 500, d: 420,
    katalog: kat(BASIS.licht, [
      ['Sofa 3-Sitzer', 'Möbel', 220, 95, 85, 'Zu Heizkörpern ca. 30 cm Abstand halten.'],
      ['Ecksofa', 'Möbel', 280, 200, 85, ''],
      ['Sessel', 'Möbel', 80, 85, 90, ''],
      ['Couchtisch', 'Möbel', 110, 60, 40, ''],
      ['TV-Board', 'Möbel', 180, 45, 50, 'Hohe Kombinationen an der Wand gegen Kippen sichern.'],
      ['Regal hoch', 'Möbel', 80, 35, 200, 'Immer an der Wand kippsicher befestigen.'],
      ['Esstisch', 'Möbel', 180, 90, 75, 'Um den Tisch ca. 80–100 cm Bewegungsfläche einplanen.'],
      ['Stuhl', 'Möbel', 45, 50, 90, ''],
      ['Kamin / Kaminofen', 'Wand & Bau', 60, 50, 110, 'Nur mit Abnahme durch Bezirksschornsteinfeger; Funkenschutzplatte vor dem Ofen; Abstände zu Brennbarem.'],
      ['Fernseher an Wand', 'Wand & Bau', 145, 8, 85, 'Halterung für Gewicht und Wandart; Leitungssucher vor dem Bohren.']
    ], BASIS.deko, BASIS.technik, BASIS.bau),
    projekte: ['streichen', 'laminat', 'vorsatzschale', 'tapezieren', 'fenster'],
    sicherheit: ['Hohe Möbel kippsicher befestigen.', 'Kaminofen nur mit Schornsteinfeger-Abnahme.'],
    tipps: ['Helle Wände und große Bodenformate lassen den Raum größer wirken.', 'Licht in 3 Ebenen planen: Grundlicht, Zonenlicht, Akzent.'] },

  { id: 'esszimmer', name: 'Esszimmer', bereich: 'innen', w: 400, d: 350,
    katalog: kat([['Esstisch 6 Pers.', 'Möbel', 200, 100, 75, '80–100 cm Abstand zur Wand für Stühle.'], ['Stuhl', 'Möbel', 45, 50, 90, ''], ['Sideboard', 'Möbel', 180, 45, 80, ''], ['Vitrine', 'Möbel', 90, 40, 190, 'Kippsicher befestigen.'], ['Pendelleuchte über Tisch', 'Licht', 100, 30, 40, 'Unterkante ca. 60–70 cm über Tischplatte.']], BASIS.licht, BASIS.deko, BASIS.technik, BASIS.bau),
    projekte: ['streichen', 'laminat', 'parkett'], sicherheit: [], tipps: ['Pendelleuchte mittig über dem Tisch, nicht über der Raummitte.'] },

  { id: 'kueche', name: 'Küche', bereich: 'innen', w: 400, d: 300,
    katalog: kat([
      ['Unterschrank 60', 'Küche', 60, 60, 85, 'Arbeitshöhe ca. Körpergröße/2 + 5–10 cm.'],
      ['Hängeschrank 60', 'Küche', 60, 35, 70, 'Nur an tragfähiger Wand mit Aufhängeschiene.'],
      ['Spüle mit Unterschrank', 'Küche', 80, 60, 85, 'Wasseranschluss: Eckventile, Aquastop empfohlen.'],
      ['Herd / Kochfeld', 'Küche', 60, 60, 85, 'Elektroherd (Starkstrom/Drehstrom) nur durch Elektrofachkraft anschließen. Gasherd nur durch eingetragenen Installateur.'],
      ['Backofen hoch', 'Küche', 60, 60, 60, ''],
      ['Kühlschrank', 'Küche', 60, 65, 180, 'Lüftungsschlitze frei lassen.'],
      ['Geschirrspüler', 'Küche', 60, 60, 85, 'Aquastop-Schlauch; nicht neben Kühlschrank ohne Wärmeschutz.'],
      ['Dunstabzug', 'Küche', 90, 50, 60, 'Abluft bei Kaminofen nur mit Fensterkontakt/Unterdruckwächter (Schornsteinfeger fragen).'],
      ['Kücheninsel', 'Küche', 180, 90, 92, 'Mind. 100–120 cm Abstand zur Küchenzeile.'],
      ['Fliesenspiegel', 'Wand & Bau', 240, 1, 60, ''],
      ['Arbeitsplatte', 'Küche', 240, 60, 4, 'Schnittkanten versiegeln (Feuchte).']
    ], BASIS.licht, BASIS.technik),
    projekte: ['fliesen', 'streichen', 'kueche_montage'],
    sicherheit: ['Herdanschluss und neue Stromkreise nur durch Elektrofachkraft.', 'Gasgeräte nur durch eingetragenen Fachbetrieb.', 'Bei Kaminofen + Ablufthaube Unterdruck vermeiden.'],
    tipps: ['Arbeitsdreieck Spüle – Herd – Kühlschrank kurz halten.', 'Steckdosen über der Arbeitsplatte reichlich einplanen.'] },

  { id: 'bad', name: 'Badezimmer', bereich: 'innen', w: 300, d: 250,
    katalog: kat([
      ['Dusche bodengleich', 'Sanitär', 90, 120, 1, 'Abdichtung nach DIN 18534 (Verbundabdichtung, Dichtband in Ecken), Gefälle zum Ablauf.'],
      ['Badewanne', 'Sanitär', 170, 75, 60, 'Wannenträger, Schallschutz-Dämmstreifen, Wartungsöffnung.'],
      ['WC wandhängend', 'Sanitär', 38, 55, 40, 'Vorwandelement fest verankern.'],
      ['Waschtisch', 'Sanitär', 80, 48, 85, ''],
      ['Spiegelschrank', 'Sanitär', 80, 15, 70, 'Elektro im Bad nur nach Schutzbereichen (IP-Schutz) – Elektrofachkraft.'],
      ['Handtuchheizkörper', 'Technik', 60, 10, 120, 'Elektrisch: Schutzbereiche beachten.'],
      ['Lüfter', 'Technik', 15, 10, 15, 'Innenbad ohne Fenster braucht Lüftung.'],
      ['Waschmaschine', 'Technik', 60, 60, 85, 'Aquastop, FI-Schutz.']
    ], BASIS.licht, [BASIS.deko[1]], BASIS.bau),
    projekte: ['bad_abdichten', 'fliesen', 'silikon'],
    sicherheit: ['Abdichtung vor dem Fliesen ist Pflicht (DIN 18534).', 'Elektrik im Bad: Schutzbereiche 0–2, nur Elektrofachkraft.', 'Wasser vor Arbeiten abstellen.'],
    tipps: ['Erst abdichten, dann fliesen.', 'Große Fliesen und durchgehender Boden lassen kleine Bäder größer wirken.'] },

  { id: 'gaestewc', name: 'Gäste-WC', bereich: 'innen', w: 120, d: 180,
    katalog: kat([['WC wandhängend', 'Sanitär', 38, 55, 40, ''], ['Handwaschbecken', 'Sanitär', 45, 25, 85, ''], ['Spiegel', 'Deko', 40, 3, 60, ''], ['Lüfter', 'Technik', 15, 10, 15, 'Ohne Fenster Lüftung einplanen.']], BASIS.licht),
    projekte: ['fliesen', 'streichen', 'silikon'], sicherheit: ['Elektrik nach Schutzbereichen.'], tipps: ['Wandhängendes WC spart optisch Platz.'] },

  { id: 'schlafzimmer', name: 'Schlafzimmer', bereich: 'innen', w: 420, d: 380,
    katalog: kat([['Doppelbett 180', 'Möbel', 180, 210, 45, 'Rund ums Bett ca. 60–70 cm Platz.'], ['Nachttisch', 'Möbel', 45, 40, 50, ''], ['Kleiderschrank', 'Möbel', 250, 60, 230, 'Hohe Schränke kippsicher an Wand befestigen.'], ['Kommode', 'Möbel', 120, 50, 85, 'Kippschutz.'], ['Leselampe', 'Licht', 15, 15, 30, '']], BASIS.licht, BASIS.deko, BASIS.technik, BASIS.bau),
    projekte: ['streichen', 'laminat', 'tapezieren', 'trockenbau_wand'],
    sicherheit: ['Rauchmelder ist Pflicht.', 'Schränke kippsicher befestigen.'], tipps: ['Gedeckte Farben und Verdunkelung fördern Schlaf.'] },

  { id: 'kinderzimmer', name: 'Kinderzimmer', bereich: 'innen', w: 380, d: 320,
    katalog: kat([
      ['Kinderbett', 'Möbel', 90, 200, 45, ''],
      ['Hochbett', 'Möbel', 100, 210, 180, 'Absturzsicherung mind. 16 cm über Matratze; nicht für Kinder unter 6 Jahren oben.'],
      ['Spielecke / Teppich', 'Deko', 150, 150, 1, ''],
      ['Schreibtisch höhenverstellbar', 'Möbel', 110, 65, 75, ''],
      ['Spielzeugregal', 'Möbel', 100, 35, 110, 'Unbedingt kippsicher an der Wand befestigen.'],
      ['Kleiderschrank Kind', 'Möbel', 100, 55, 180, 'Kippschutz.'],
      ['Nachtlicht', 'Licht', 10, 10, 10, ''],
      ['Steckdosen-Kinderschutz', 'Sicherheit', 8, 1, 8, 'Steckdosen mit erhöhtem Berührungsschutz.'],
      ['Fenstersicherung abschließbar', 'Sicherheit', 5, 3, 10, 'Gegen Herausfallen; kein Möbel als Kletterhilfe unters Fenster.'],
      ['Tafelwand / Magnetfarbe', 'Wand & Bau', 200, 1, 120, 'Lösemittelfreie, speichelfeste Farben (DIN EN 71-3).']
    ], BASIS.licht, BASIS.deko, BASIS.technik),
    projekte: ['streichen', 'laminat', 'tapezieren'],
    sicherheit: ['Rauchmelder Pflicht.', 'Alle Möbel kippsicher befestigen.', 'Fenstersicherungen, Steckdosenschutz, keine Kabel/Schnüre in Bettnähe.', 'Emissionsarme Farben und Böden (Blauer Engel).'],
    tipps: ['Zonen: Schlafen, Spielen, Lernen.', 'Mitwachsende Möbel planen.'] },

  { id: 'babyzimmer', name: 'Babyzimmer', bereich: 'innen', w: 330, d: 300,
    katalog: kat([['Babybett 70×140', 'Möbel', 77, 147, 90, 'Nicht unter Fenster, Regale oder Bilder; keine Kordeln in Reichweite.'], ['Wickelkommode', 'Möbel', 100, 80, 95, 'Kippsicher befestigen; Wärmestrahler mit Abstand.'], ['Stillsessel', 'Möbel', 75, 85, 100, ''], ['Nachtlicht', 'Licht', 10, 10, 10, '']], BASIS.licht, BASIS.technik),
    projekte: ['streichen', 'laminat'], sicherheit: ['Rauchmelder Pflicht.', 'Renovieren mind. 4 Wochen vor Einzug und gut lüften.'], tipps: ['Dimmbares Licht für die Nacht.'] },

  { id: 'jugendzimmer', name: 'Jugendzimmer', bereich: 'innen', w: 380, d: 320,
    katalog: kat([['Bett 140', 'Möbel', 140, 200, 45, ''], ['Schreibtisch', 'Möbel', 140, 70, 75, ''], ['Gaming-/Bürostuhl', 'Möbel', 65, 65, 120, ''], ['Regal', 'Möbel', 80, 35, 200, 'Kippsicher.']], BASIS.licht, BASIS.deko, BASIS.technik),
    projekte: ['streichen', 'laminat'], sicherheit: ['Rauchmelder Pflicht.', 'Mehrfachsteckdosen nicht hintereinander stecken.'], tipps: [] },

  { id: 'gaestezimmer', name: 'Gästezimmer', bereich: 'innen', w: 350, d: 300,
    katalog: kat([['Schlafsofa', 'Möbel', 200, 95, 85, ''], ['Gästebett', 'Möbel', 140, 200, 45, ''], ['Kleiderstange', 'Möbel', 100, 45, 160, '']], BASIS.licht, BASIS.deko, BASIS.technik),
    projekte: ['streichen', 'laminat'], sicherheit: ['Rauchmelder Pflicht.'], tipps: ['Schlafsofa macht den Raum auch als Büro nutzbar.'] },

  { id: 'buero', name: 'Büro / Arbeitszimmer', bereich: 'innen', w: 350, d: 300,
    katalog: kat([['Schreibtisch höhenverstellbar', 'Möbel', 160, 80, 75, 'Seitlich zum Fenster stellen (Blendung).'], ['Bürostuhl', 'Möbel', 65, 65, 120, ''], ['Aktenschrank', 'Möbel', 80, 40, 200, 'Kippsicher.'], ['Monitorarm', 'Technik', 10, 10, 50, ''], ['Netzwerkdose LAN', 'Technik', 8, 2, 8, 'Neue Datenleitungen: Fachbetrieb oder Leerrohr nutzen.'], ['Schreibtischleuchte', 'Licht', 20, 20, 50, ''], ['Akustikpaneel', 'Wand & Bau', 60, 5, 60, 'Verbessert Videocalls.']], BASIS.licht, BASIS.deko, BASIS.technik),
    projekte: ['streichen', 'laminat', 'vorsatzschale'], sicherheit: ['Kabel in Kabelkanälen führen.'], tipps: ['Häusliches Arbeitszimmer kann steuerlich absetzbar sein – Steuerberater fragen.'] },

  { id: 'flur', name: 'Flur / Diele', bereich: 'innen', w: 500, d: 160,
    katalog: kat([['Garderobe', 'Möbel', 100, 35, 190, 'Kippsicher befestigen.'], ['Schuhschrank', 'Möbel', 90, 30, 100, ''], ['Sitzbank', 'Möbel', 100, 35, 45, ''], ['Spiegel groß', 'Deko', 60, 3, 170, ''], ['Bewegungsmelder-Licht', 'Licht', 10, 10, 5, ''], ['Rauchmelder', 'Sicherheit', 10, 10, 5, 'Pflicht in Fluren, die als Rettungsweg dienen.']], BASIS.licht, BASIS.deko, BASIS.bau),
    projekte: ['streichen', 'fliesen', 'laminat'], sicherheit: ['Rettungsweg freihalten.', 'Rauchmelder Pflicht.'], tipps: ['Spiegel und helle Decke lassen schmale Flure breiter wirken.', 'Robuster Boden im Eingang (Fliese, Vinyl).'] },

  { id: 'treppenhaus', name: 'Treppe / Treppenhaus', bereich: 'innen', w: 300, d: 250,
    katalog: kat([['Treppenstufen-Belag', 'Wand & Bau', 100, 28, 4, 'Rutschhemmend; Stufenkanten sichtbar.'], ['Handlauf', 'Wand & Bau', 300, 8, 90, 'Höhe nach Landesbauordnung (meist 90 cm).'], ['Treppenschutzgitter', 'Sicherheit', 100, 5, 80, 'Oben nur festgeschraubte Gitter verwenden.'], ['Stufenlicht LED', 'Licht', 20, 5, 5, '']], BASIS.licht),
    projekte: ['treppe_renovieren', 'streichen'], sicherheit: ['Geländer/Handlauf nicht entfernen.', 'Arbeiten an der Treppe: Bereich absperren.'], tipps: [] },

  { id: 'ankleide', name: 'Ankleide', bereich: 'innen', w: 250, d: 200,
    katalog: kat([['Schranksystem offen', 'Möbel', 200, 50, 220, 'An Wand befestigen.'], ['Schubladenelement', 'Möbel', 60, 50, 80, ''], ['Ganzkörperspiegel', 'Deko', 60, 3, 180, '']], BASIS.licht),
    projekte: ['streichen', 'trockenbau_wand'], sicherheit: [], tipps: ['Lüftung gegen Mief/Schimmel einplanen.'] },

  { id: 'abstellraum', name: 'Abstellraum / Speisekammer', bereich: 'innen', w: 180, d: 150,
    katalog: kat([['Schwerlastregal', 'Lager', 90, 45, 180, 'Kippsicher; schwere Dinge unten.'], ['Vorratsregal', 'Lager', 60, 30, 200, '']], [BASIS.licht[0]]),
    projekte: ['streichen'], sicherheit: [], tipps: ['Speisekammer kühl und belüftet halten.'] },

  { id: 'waschraum', name: 'Waschraum / Hauswirtschaftsraum', bereich: 'innen', w: 300, d: 250,
    katalog: kat([['Waschmaschine', 'Technik', 60, 60, 85, 'Aquastop; auf Sockel nur mit Rutschsicherung.'], ['Trockner', 'Technik', 60, 65, 85, 'Kondens-/Wärmepumpentrockner oder Abluft nach draußen.'], ['Wasch-Trocken-Turm', 'Technik', 60, 65, 175, 'Original-Zwischenbausatz verwenden.'], ['Ausgussbecken', 'Sanitär', 60, 45, 85, ''], ['Wäscheleine / Trockengestell', 'Lager', 150, 60, 100, ''], ['Bodenablauf', 'Sanitär', 15, 15, 1, 'Mit Rückstauverschluss.'], ['Regal', 'Lager', 90, 40, 180, '']], [BASIS.licht[0]], BASIS.technik),
    projekte: ['fliesen', 'streichen', 'keller_feuchte'], sicherheit: ['FI-Schutzschalter für Waschgeräte.', 'Wassermelder am Boden empfohlen.'], tipps: ['Gut lüften, Wäsche trocknen erhöht Feuchte.'] },

  { id: 'keller', name: 'Keller', bereich: 'innen', w: 600, d: 400,
    katalog: kat([['Kellerregal', 'Lager', 100, 40, 180, 'Nicht direkt an feuchte Außenwand – 5 cm Abstand.'], ['Werkbank', 'Möbel', 150, 70, 90, ''], ['Luftentfeuchter', 'Technik', 35, 25, 50, ''], ['Lichtschacht-Abdeckung', 'Wand & Bau', 100, 50, 2, 'Gegen Laub und Tiere.'], ['Rückstauklappe', 'Sanitär', 20, 20, 20, 'Einbau durch Fachbetrieb; schützt bei Starkregen.']], [BASIS.licht[0]], BASIS.technik),
    projekte: ['keller_feuchte', 'streichen', 'kellerdecke_daemmen'],
    sicherheit: ['Feuchte: erst Ursache klären (außen, innen, Kondensat), dann sanieren.', 'Kellerräume zu Wohnraum umnutzen ist genehmigungspflichtig (Belichtung, Rettungsweg, Raumhöhe).', 'Radon: in einigen Regionen messen lassen.'],
    tipps: ['Kellerdecke dämmen spart spürbar Heizenergie und ist gut selbst machbar.', 'Im Sommer kühle Keller nicht tagsüber lüften (Kondensat).'] },

  { id: 'heizungsraum', name: 'Heizungsraum', bereich: 'innen', w: 300, d: 250,
    katalog: kat([['Heizkessel / Therme', 'Technik', 60, 60, 90, 'Nur Fachbetrieb (SHK); Gasgeräte: eingetragener Installateur.'], ['Wärmepumpe Innenteil', 'Technik', 60, 60, 180, 'Fachbetrieb; Förderung prüfen.'], ['Warmwasserspeicher', 'Technik', 65, 65, 160, ''], ['Pufferspeicher', 'Technik', 80, 80, 180, 'Tragfähigkeit Boden prüfen.'], ['Feuerlöscher', 'Sicherheit', 20, 20, 60, 'Gut erreichbar an der Tür.'], ['CO-Melder', 'Sicherheit', 10, 10, 5, 'Bei Brennstoff-Heizung empfohlen.']], [BASIS.licht[0]]),
    projekte: ['streichen', 'heizung_tausch'],
    sicherheit: ['Arbeiten an Heizung, Gas, Öl, Abgas: nur Fachbetrieb.', 'Zuluftöffnungen nie verschließen.', 'Keine brennbaren Stoffe lagern.', 'Bezirksschornsteinfeger prüft Feuerstätten.'],
    tipps: ['Heizungsrohre im unbeheizten Raum dämmen ist Pflicht und einfach selbst machbar.', 'Hydraulischen Abgleich machen lassen.'] },

  { id: 'dachboden', name: 'Dachgeschoss / Dachboden', bereich: 'innen', w: 600, d: 500,
    katalog: kat([['Bodentreppe gedämmt', 'Wand & Bau', 70, 120, 280, 'Luftdichter Anschluss an Decke.'], ['Dachfenster', 'Wand & Bau', 78, 118, 10, 'Einbau mit Eindeckrahmen; innen luftdicht anschließen.'], ['Kniestockschrank', 'Möbel', 120, 60, 100, ''], ['Gaubenbank', 'Möbel', 150, 45, 45, '']], BASIS.licht, BASIS.deko),
    projekte: ['dach_daemmen_innen', 'oberste_decke', 'dachfenster', 'trockenbau_wand'],
    sicherheit: ['Ausbau zu Wohnraum oft genehmigungspflichtig (Rettungsweg, Raumhöhe).', 'Nur auf tragfähigen Balken laufen.', 'Dampfbremse innen lückenlos.'],
    tipps: ['Oberste Geschossdecke dämmen ist oft Pflicht und günstig.'] },

  { id: 'hobbyraum', name: 'Hobbyraum / Werkstatt', bereich: 'innen', w: 400, d: 300,
    katalog: kat([['Werkbank', 'Möbel', 200, 80, 90, ''], ['Lochwand', 'Lager', 120, 3, 80, ''], ['Absaugung', 'Technik', 50, 50, 100, ''], ['Feuerlöscher', 'Sicherheit', 20, 20, 60, '']], BASIS.licht, BASIS.technik),
    projekte: ['streichen', 'bodenbeschichtung'], sicherheit: ['Staub: Atemschutz FFP2/FFP3.', 'Lösungsmittel nur mit Lüftung.'], tipps: ['Tageslichtweiße LED (4000–5000 K) für genaues Arbeiten.'] },

  { id: 'fitness', name: 'Fitnessraum', bereich: 'innen', w: 400, d: 300,
    katalog: kat([['Laufband', 'Möbel', 80, 180, 140, 'Hinter dem Laufband 2 m frei lassen.'], ['Hantelbank', 'Möbel', 60, 140, 50, ''], ['Sportboden-Matten', 'Wand & Bau', 200, 200, 2, ''], ['Spiegelwand', 'Deko', 200, 1, 180, 'Sicherheitsspiegel mit Splitterschutz.']], BASIS.licht, BASIS.technik),
    projekte: ['streichen'], sicherheit: ['Tragfähigkeit der Decke bei schweren Geräten im OG prüfen.'], tipps: [] },

  { id: 'heimkino', name: 'Heimkino / Medienraum', bereich: 'innen', w: 500, d: 400,
    katalog: kat([['Leinwand', 'Technik', 250, 5, 150, ''], ['Beamer', 'Technik', 35, 30, 15, 'Deckenhalterung in Massivdecke mit Schwerlastdübeln.'], ['Kinosessel', 'Möbel', 85, 95, 100, ''], ['Lautsprecher', 'Technik', 25, 30, 100, ''], ['Akustikpaneel', 'Wand & Bau', 60, 5, 60, '']], BASIS.licht, BASIS.technik),
    projekte: ['streichen', 'vorsatzschale'], sicherheit: [], tipps: ['Dunkle, matte Wände verbessern das Bild.'] },

  { id: 'wintergarten', name: 'Wintergarten', bereich: 'innen', w: 400, d: 300,
    katalog: kat([['Lounge-Sofa', 'Möbel', 200, 90, 80, ''], ['Kübelpflanze', 'Deko', 60, 60, 150, ''], ['Beschattung', 'Wand & Bau', 300, 5, 10, ''], ['Lüftungsklappe', 'Wand & Bau', 60, 10, 40, '']], BASIS.licht),
    projekte: ['streichen'], sicherheit: ['Neubau genehmigungspflichtig.'], tipps: ['Sonnenschutz außen ist wirksamer als innen.'] },

  { id: 'balkon', name: 'Balkon / Loggia', bereich: 'aussen', w: 400, d: 150,
    katalog: kat([['Bistrotisch', 'Möbel', 60, 60, 75, ''], ['Stuhl', 'Möbel', 45, 50, 85, ''], ['Pflanzkasten', 'Garten', 80, 20, 20, 'Innen an der Brüstung befestigen.'], ['Sichtschutz', 'Wand & Bau', 200, 3, 100, 'Mietrecht/Eigentümergemeinschaft vorher fragen.'], ['Balkonkraftwerk', 'Technik', 170, 115, 4, 'Anmeldung im Marktstammdatenregister; sturmsicher befestigen.'], ['Bodenbelag Holz/WPC-Fliesen', 'Wand & Bau', 30, 30, 2, 'Abfluss nicht verstopfen.']]),
    projekte: ['balkon_abdichten'], sicherheit: ['Nichts an Brüstung außen hängen ohne Befestigung.', 'Traglast beachten.'], tipps: [] },

  { id: 'garage', name: 'Garage / Carport', bereich: 'aussen', w: 600, d: 300,
    katalog: kat([['Auto (Platzhalter)', 'Lager', 180, 450, 150, ''], ['Wandregal', 'Lager', 120, 45, 200, ''], ['Fahrradhalter', 'Lager', 60, 180, 100, ''], ['Garagentor-Antrieb', 'Technik', 30, 300, 30, 'Mit Hinderniserkennung; Notentriegelung.'], ['Wallbox', 'Technik', 30, 15, 40, 'Nur Elektrofachkraft; Anmeldung beim Netzbetreiber (über 11 kW genehmigungspflichtig).'], ['Werkbank', 'Möbel', 150, 60, 90, ''], ['Bodenbeschichtung', 'Wand & Bau', 300, 500, 1, '']], [BASIS.licht[0]]),
    projekte: ['bodenbeschichtung', 'garagentor', 'streichen', 'carport'],
    sicherheit: ['Garagenverordnung: Lagerung brennbarer Stoffe begrenzt.', 'Motor nie in geschlossener Garage laufen lassen (CO).', 'Neubau Garage/Carport meist genehmigungs- oder anzeigepflichtig.'],
    tipps: ['Wallbox jetzt vorbereiten (Leerrohr).'] },

  { id: 'fassade', name: 'Fassade & Haus außen', bereich: 'aussen', w: 1000, d: 800, katalog: [], projekte: ['fassade', 'fenster', 'haustuer', 'regenrinne', 'vordach'],
    sicherheit: ['Gerüst ab 2 m Absturzhöhe; Gerüst nur vom Fachbetrieb aufstellen lassen.'], tipps: [] },

  { id: 'dach', name: 'Dach', bereich: 'aussen', w: 1000, d: 800, katalog: [], projekte: ['dach', 'dachfenster', 'dach_daemmen_innen', 'regenrinne'],
    sicherheit: ['Absturzsicherung ist Pflicht.', 'Arbeiten am Dach: Fachbetrieb empfohlen.'], tipps: [] },

  { id: 'garten', name: 'Garten', bereich: 'garten', w: 2000, d: 1200, katalog: [], projekte: ['gartenplaner', 'terrasse', 'zaun', 'hochbeet', 'teich', 'gartenhaus', 'bewaesserung', 'gartenlicht', 'gartenweg'],
    sicherheit: ['Teich kindersicher (Gitter, flache Ufer).', 'Erdkabel nur durch Elektrofachkraft.'], tipps: [] }
];
