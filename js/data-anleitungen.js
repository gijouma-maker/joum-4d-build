/* Joum 4D Build – Fach-Anleitungen
   wer: Selbst | Teils Profi | Fachbetrieb
   einheit: Bezugsgröße für Material und Kosten (m², m, Stück)
   material: [Name, Menge je Einheit, Einheit Material, Hinweis]
   kosten: [Selbst €/Einheit, Profi €/Einheit] – grobe Richtwerte inkl. Material, regional sehr unterschiedlich
   schichten: Aufbau von innen nach außen bzw. unten nach oben [Name, Farbe, Info] */

const ANLEITUNGEN = {
  streichen: { t: 'Wand & Decke streichen', b: 'innen', wer: 'Selbst', dauer: '1–2 Tage je Raum', einheit: 'm²', kosten: [4, 18],
    schritte: [['Raum vorbereiten', 'Möbel in die Mitte, abdecken, Boden mit Malervlies schützen.'], ['Untergrund prüfen', 'Kreidet die Wand (Wischtest), mit Tiefgrund grundieren. Löcher spachteln, schleifen.'], ['Abkleben', 'Fenster, Türrahmen, Steckdosen (Strom aus!) und Sockelleisten abkleben.'], ['Ecken vorstreichen', 'Mit Pinsel Ecken und Kanten streichen.'], ['Decke zuerst', 'Bahnen zum Fenster hin, nass in nass.'], ['Wände rollen', 'Kreuzweise auftragen, in einer Richtung abrollen.'], ['Zweiter Anstrich', 'Nach Trocknungszeit laut Eimer.'], ['Abklebeband ziehen', 'Solange die Farbe noch leicht feucht ist.']],
    material: [['Wandfarbe (Deckkraft Klasse 1–2)', 0.3, 'l', '2 Anstriche'], ['Tiefgrund', 0.1, 'l', 'nur bei saugendem Untergrund'], ['Malerkrepp', 0.4, 'm', ''], ['Abdeckvlies', 0.3, 'm²', ''], ['Spachtelmasse', 0.02, 'kg', '']],
    tipps: ['Helle, matte Farben lassen Räume größer wirken.', 'Deckkraftklasse 1 spart einen Anstrich.'], warn: ['Bei Schimmel: Ursache klären, nicht überstreichen.'] },

  tapezieren: { t: 'Tapezieren (Vlies)', b: 'innen', wer: 'Selbst', dauer: '1 Tag je Raum', einheit: 'm²', kosten: [8, 25],
    schritte: [['Alte Tapete entfernen', 'Einweichen, mit Spachtel lösen.'], ['Untergrund glätten', 'Spachteln, schleifen, grundieren.'], ['Lot anzeichnen', 'Erste Bahn am Fenster mit Wasserwaage/Laser.'], ['Kleister auf die Wand', 'Bei Vliestapete Wand einkleistern, nicht die Tapete.'], ['Bahnen Stoß an Stoß', 'Mit Andrückrolle, Luft herausstreichen.'], ['Überstände schneiden', 'Mit Cuttermesser und Spachtel.']],
    material: [['Vliestapete (Rolle 0,53×10 m)', 0.22, 'Rollen', '+ Rapport beachten'], ['Vlieskleister', 0.03, 'kg', ''], ['Tiefgrund', 0.1, 'l', '']],
    tipps: ['Steckdosen: Strom aus, Abdeckung ab, darüber tapezieren, kreuzweise einschneiden.'], warn: [] },

  laminat: { t: 'Laminat / Vinyl verlegen', b: 'innen', wer: 'Selbst', dauer: '1 Tag je 20 m²', einheit: 'm²', kosten: [18, 45],
    schritte: [['Untergrund prüfen', 'Eben (max. 3 mm auf 1 m), trocken. Estrich: CM-Messung.'], ['Akklimatisieren', 'Pakete 48 h im Raum lagern.'], ['Dampfbremse / Trittschall', 'PE-Folie auf mineralischem Boden, Ränder 20 cm überlappen; Trittschalldämmung.'], ['Erste Reihe', 'Nut zur Wand, Abstandskeile 8–10 mm.'], ['Verlegen', 'Stoßfugen mind. 30 cm versetzt, Reststück der Reihe als Anfang der nächsten.'], ['Türzargen', 'Zarge unten absägen, Diele darunterschieben.'], ['Leisten', 'Sockelleisten an der Wand befestigen, nicht am Boden.'], ['Übergänge', 'Profile an Türen ab ca. 8–10 m Länge (Dehnungsfuge).']],
    material: [['Laminat/Vinyl', 1.1, 'm²', '+10 % Verschnitt'], ['Trittschalldämmung', 1.05, 'm²', 'Vinyl: nur wenn freigegeben'], ['PE-Folie', 1.1, 'm²', 'auf Estrich'], ['Sockelleiste', 0.45, 'm', 'Umfang'], ['Abstandskeile', 0.5, 'Stück', '']],
    tipps: ['Dielen in Richtung des Lichteinfalls verlegen.', 'Längsrichtung im schmalen Flur lässt ihn länger wirken.'], warn: ['Bei Fußbodenheizung nur freigegebene Böden.'] },

  parkett: { t: 'Parkett verlegen / abschleifen', b: 'innen', wer: 'Teils Profi', dauer: '2–4 Tage', einheit: 'm²', kosten: [35, 80],
    schritte: [['Untergrund und Feuchte prüfen', 'CM-Messung bei Estrich.'], ['Schwimmend oder verklebt wählen', 'Verkleben = besserer Gehschall, aufwendiger.'], ['Verlegen', 'Wie Laminat, Randabstand 10–15 mm.'], ['Abschleifen (Bestand)', 'Walzenschleifer leihen, 3 Körnungen, immer in Holzrichtung.'], ['Versiegeln oder ölen', 'Nach Herstellerangabe, gut lüften.']],
    material: [['Fertigparkett', 1.08, 'm²', ''], ['Parkettkleber', 1.0, 'kg', 'bei Verklebung'], ['Öl / Lack', 0.1, 'l', '']], tipps: [], warn: ['Schleifstaub: Atemschutz FFP2.'] },

  fliesen: { t: 'Fliesen legen (Wand/Boden)', b: 'innen', wer: 'Teils Profi', dauer: '2–4 Tage', einheit: 'm²', kosten: [35, 90],
    schritte: [['Untergrund', 'Tragfähig, eben, grundiert. Im Nassbereich zuerst abdichten.'], ['Fliesenplan', 'Von der Mitte bzw. Blickachse aus, Randstücke mind. halbe Fliese.'], ['Kleber auftragen', 'Zahnkelle passend zum Format; große Formate Buttering-Floating.'], ['Fliesen setzen', 'Fugenkreuze/Nivelliersystem, Wasserwaage.'], ['Schneiden', 'Fliesenschneider, Löcher mit Diamantbohrkrone.'], ['Verfugen', 'Nach 24 h, diagonal einschlämmen, abwaschen.'], ['Anschlussfugen', 'Ecken und Übergänge elastisch mit Silikon.']],
    material: [['Fliesen', 1.1, 'm²', '+10 % Verschnitt, bei Diagonal +15 %'], ['Fliesenkleber flex', 4, 'kg', 'je nach Zahnung'], ['Fugenmörtel', 0.5, 'kg', ''], ['Grundierung', 0.15, 'l', ''], ['Silikon', 0.1, 'Kartusche', '']],
    tipps: ['Große Fliesen, schmale Fugen und gleiche Fliese an Wand und Boden lassen kleine Räume größer wirken.', 'Fliesen aus mehreren Paketen mischen (Farbschwankung).'], warn: ['Im Bad: Abdichtung nach DIN 18534 vorher.'] },

  bad_abdichten: { t: 'Bad abdichten (Verbundabdichtung)', b: 'innen', wer: 'Teils Profi', dauer: '1–2 Tage + Trocknung', einheit: 'm²', kosten: [15, 45],
    schichten: [['Untergrund', '#555', 'tragfähig, grundiert'], ['Dichtband in Ecken', '#7ab8ff', 'Innen- und Außenecken, Übergänge'], ['Dichtmanschetten', '#9fd69f', 'Rohrdurchführungen, Ablauf'], ['Flüssigabdichtung 2×', '#ffd27a', 'Gesamt mind. 0,5 mm trocken'], ['Fliesenkleber + Fliese', '#ccc', '']],
    schritte: [['Bereiche festlegen', 'Dusche, Wanne, bodengleiche Bereiche: Boden + Wand mind. 20 cm über Wasserentnahme.'], ['Grundieren', 'Nach Herstellersystem.'], ['Dichtband einbetten', 'Alle Ecken und Fugen in die erste Schicht legen.'], ['Manschetten setzen', 'Um Rohre und Bodenablauf.'], ['Zwei Schichten Abdichtung', 'Kontrastfarben helfen, Lücken zu sehen.'], ['Trocknen lassen', 'Dann erst fliesen.']],
    material: [['Flüssigabdichtung', 1.2, 'kg', '2 Schichten'], ['Dichtband', 0.8, 'm', ''], ['Dichtmanschetten', 0.3, 'Stück', ''], ['Grundierung', 0.15, 'l', '']],
    tipps: ['Alle Produkte aus EINEM System verwenden.'], warn: ['Fehlende Abdichtung ist die häufigste Ursache für Wasserschäden.'] },

  silikon: { t: 'Silikonfugen erneuern', b: 'innen', wer: 'Selbst', dauer: '2 Stunden', einheit: 'm', kosten: [3, 15],
    schritte: [['Altes Silikon entfernen', 'Cutter, Fugenhai, Reste mit Silikonentferner.'], ['Reinigen und trocknen', 'Mit Spiritus entfetten.'], ['Abkleben', 'Beidseitig mit Malerkrepp.'], ['Silikon einspritzen', 'Gleichmäßig, Sanitärsilikon mit Fungizid.'], ['Glätten', 'Mit Fugenglätter und Glättmittel.'], ['Band abziehen', 'Sofort.']],
    material: [['Sanitärsilikon', 0.1, 'Kartusche', ''], ['Silikonentferner', 0.02, 'Flasche', '']], tipps: [], warn: [] },

  vorsatzschale: { t: 'Vorsatzschale (Trockenbau)', b: 'innen', wer: 'Selbst', dauer: '2 Tage', einheit: 'm²', kosten: [25, 60],
    schritte: [['Anzeichnen', 'Laser, UW-Profil-Lage an Boden und Decke.'], ['UW-Profile', 'Mit Dichtband unterlegen, dübeln (ca. 60 cm Abstand).'], ['CW-Profile stellen', 'Achsabstand 62,5 cm, 1 cm kürzer als Raumhöhe.'], ['Installationen', 'Leitungen/Leerrohre jetzt (Elektro durch Fachkraft).'], ['Dämmung', 'Mineralwolle zwischen die Profile.'], ['Beplanken', 'Gipskarton quer oder längs, Schrauben alle 25 cm.'], ['Spachteln', 'Fugen mit Bewehrungsstreifen, Q2 für Anstrich.']],
    material: [['Gipskartonplatte 12,5 mm', 1.05, 'm²', ''], ['CW-Profil', 1.8, 'm', ''], ['UW-Profil', 0.8, 'm', ''], ['Mineralwolle', 1.0, 'm²', ''], ['Schnellbauschrauben', 15, 'Stück', ''], ['Fugenspachtel', 0.4, 'kg', ''], ['Dichtband', 0.8, 'm', '']],
    tipps: ['Dichtband am Rand entkoppelt den Schall.'], warn: ['Außenwand innen dämmen nur mit Dampfbremse/Feuchteberechnung.'] },

  trockenbau_wand: { t: 'Trennwand (Trockenbau)', b: 'innen', wer: 'Selbst', dauer: '2–3 Tage', einheit: 'm²', kosten: [35, 75],
    schritte: [['Planen', 'Tür einplanen (UA-Profil), Statik bei schweren Lasten.'], ['Profile', 'UW an Boden/Decke, CW alle 62,5 cm.'], ['Erste Seite beplanken', ''], ['Installation + Dämmung', ''], ['Zweite Seite beplanken', 'Fugen versetzt zur ersten Seite.'], ['Spachteln', 'Q2/Q3.']],
    material: [['Gipskartonplatte 12,5 mm', 2.1, 'm²', 'beidseitig'], ['CW-Profil', 1.8, 'm', ''], ['UW-Profil', 0.8, 'm', ''], ['Mineralwolle', 1.0, 'm²', ''], ['Schrauben', 30, 'Stück', '']], tipps: [], warn: ['Neue Räume ohne Fenster: Belüftung und Rettungsweg beachten.'] },

  kueche_montage: { t: 'Küche aufbauen', b: 'innen', wer: 'Teils Profi', dauer: '2–3 Tage', einheit: 'Stück', kosten: [800, 2500],
    schritte: [['Aufmaß', 'Wände auf Winkel prüfen, Anschlüsse markieren.'], ['Unterschränke ausrichten', 'Von der höchsten Bodenstelle aus nivellieren.'], ['Hängeschränke', 'Aufhängeschiene, tragfähige Dübel.'], ['Arbeitsplatte', 'Ausschnitte, Kanten versiegeln.'], ['Spüle anschließen', 'Eckventile, Siphon, Dichtheit prüfen.'], ['Elektrogeräte', 'Herd/Kochfeld (Drehstrom) nur Elektrofachkraft.'], ['Fronten justieren', '']],
    material: [['Montageset Aufhängeschiene', 1, 'Set', ''], ['Silikon', 2, 'Kartuschen', ''], ['Arbeitsplatten-Verbinder', 2, 'Stück', '']], tipps: [], warn: ['Gas: nur eingetragener Installateur.'] },

  treppe_renovieren: { t: 'Treppe renovieren', b: 'innen', wer: 'Teils Profi', dauer: '3–5 Tage', einheit: 'Stück', kosten: [40, 150],
    schritte: [['Stufen prüfen', 'Fest, nicht knarrend.'], ['Alten Belag entfernen', ''], ['Renoviersystem oder Schleifen', 'Renovierstufen aufkleben oder Holz schleifen.'], ['Stufenkanten', 'Rutschhemmend, kontrastreich.'], ['Handlauf prüfen', '']],
    material: [['Renovierstufe', 1, 'Stück', 'je Stufe'], ['Montagekleber', 0.3, 'Kartusche', '']], tipps: [], warn: ['Während der Arbeit zweiten Fluchtweg sichern.'] },

  keller_feuchte: { t: 'Feuchter Keller – prüfen & sanieren', b: 'innen', wer: 'Teils Profi', dauer: 'variabel', einheit: 'm²', kosten: [30, 250],
    schritte: [['Ursache finden', 'Kondensat im Sommer? Aufsteigende Feuchte? Seitlich drückendes Wasser? Hygrometer und Folientest (Folie 24 h auf Wand kleben).'], ['Außen prüfen', 'Regenrinne, Fallrohr, Gefälle vom Haus weg, Lichtschächte.'], ['Lüften richtig', 'Im Sommer nur nachts/früh morgens.'], ['Innen: Sanierputz', 'Bei leichten Salzschäden: Putz abschlagen, Sanierputz-System.'], ['Horizontalsperre / Außenabdichtung', 'Bei aufsteigender oder drückender Feuchte: Fachbetrieb.']],
    material: [['Sanierputz-System', 25, 'kg', ''], ['Hygrometer', 0.05, 'Stück', '']], tipps: ['Oft ist es Kondenswasser – das lässt sich durch richtiges Lüften lösen.'], warn: ['Kein dichter Dispersionsanstrich auf feuchte Kellerwände.'] },

  kellerdecke_daemmen: { t: 'Kellerdecke dämmen', b: 'innen', wer: 'Selbst', dauer: '1–2 Tage', einheit: 'm²', kosten: [25, 55],
    schritte: [['Decke prüfen', 'Trocken, fest, Leitungen erfassen.'], ['Dämmplatten wählen', 'Mineralwolle oder EPS, nicht brennbar bevorzugt (Fluchtwege A1/A2).'], ['Kleben und dübeln', 'Plattenkleber + Tellerdübel.'], ['Leitungen aussparen', 'Ausschnitte passgenau.'], ['Lichthöhe', 'Türen und Kopfhöhe beachten.']],
    material: [['Dämmplatte 10 cm', 1.05, 'm²', ''], ['Kleber', 4, 'kg', ''], ['Tellerdübel', 4, 'Stück', '']], tipps: ['Spart oft 5–10 % Heizenergie.'], warn: [] },

  heizung_tausch: { t: 'Heizung tauschen', b: 'innen', wer: 'Fachbetrieb', dauer: '2–5 Tage', einheit: 'Stück', kosten: [12000, 35000],
    schritte: [['Energieberatung', 'Heizlast berechnen, Förderung (BEG/KfW) vor Auftrag beantragen.'], ['Angebote vergleichen', 'Wärmepumpe, Hybrid, Fernwärme, Biomasse.'], ['Einbau durch Fachbetrieb', ''], ['Hydraulischer Abgleich', ''], ['Abnahme Schornsteinfeger', 'bei Feuerstätten.']],
    material: [], tipps: ['Förderanträge immer VOR Auftragsvergabe.'], warn: ['Nur Fachbetrieb. Gesetzliche Vorgaben (GEG/GModG) aktuell prüfen.'] },

  dach_daemmen_innen: { t: 'Dach von innen dämmen (Zwischensparren)', b: 'innen', wer: 'Teils Profi', dauer: '3–5 Tage', einheit: 'm²', kosten: [45, 110],
    schichten: [['Innenverkleidung', '#ccc', 'Gipskarton'], ['Lattung / Installationsebene', '#8b6b4a', 'Leitungen ohne Folienverletzung'], ['Dampfbremse', '#7ab8ff', 'lückenlos, verklebt'], ['Zwischensparrendämmung', '#ffd27a', 'Klemmfilz, sparrenhoch'], ['Unterspannbahn', '#9fd69f', 'diffusionsoffen']],
    schritte: [['Bestand prüfen', 'Unterspannbahn vorhanden und intakt?'], ['Dämmstoff zuschneiden', '1–2 cm breiter als Sparrenabstand (Klemmwirkung).'], ['Einklemmen', 'Ohne Lücken, nicht stauchen.'], ['Dampfbremse', 'Überlappen, verkleben, an Wände mit Dichtkleber anschließen.'], ['Installationsebene', 'Lattung 3 cm für Leitungen.'], ['Verkleiden', 'Gipskarton.']],
    material: [['Klemmfilz', 1.05, 'm²', ''], ['Dampfbremse', 1.15, 'm²', ''], ['Klebeband', 1.5, 'm', ''], ['Anschlusskleber', 0.1, 'Kartusche', ''], ['Gipskarton', 1.05, 'm²', '']],
    tipps: ['Dämmrechner unter „Rechner“ nutzen.'], warn: ['Undichte Dampfbremse = Feuchteschäden/Schimmel.'] },

  oberste_decke: { t: 'Oberste Geschossdecke dämmen', b: 'innen', wer: 'Selbst', dauer: '1 Tag', einheit: 'm²', kosten: [20, 50],
    schritte: [['Prüfen', 'Pflicht bei ungedämmter Decke (GEG/GModG).'], ['Dampfbremse', 'Bei Holzbalkendecke unten luftdicht.'], ['Dämmung verlegen', 'Fugenlos, zweilagig versetzt.'], ['Begehbar?', 'Laufbohlen oder druckfeste Platten.']],
    material: [['Dämmung 20 cm', 1.05, 'm²', ''], ['Laufbohlen/OSB', 0.3, 'm²', 'Wege']], tipps: [], warn: [] },

  dachfenster: { t: 'Dachfenster einbauen', b: 'aussen', wer: 'Teils Profi', dauer: '1 Tag', einheit: 'Stück', kosten: [900, 2500],
    schritte: [['Position', 'Zwischen Sparren, Brüstung ca. 90 cm, Sturz ca. 200 cm.'], ['Ausschnitt', 'Ziegel abnehmen, Lattung schneiden, ggf. Wechsel bei Sparrenschnitt (Statik!).'], ['Montagewinkel', 'Rahmen ausrichten.'], ['Dämmrahmen + Unterdeckschürze', ''], ['Eindeckrahmen', 'passend zur Ziegelhöhe.'], ['Innen', 'Dampfbremsschürze luftdicht anschließen, Innenfutter.']],
    material: [['Dachfenster mit Eindeckrahmen', 1, 'Stück', ''], ['Dämm- und Anschlussset', 1, 'Set', ''], ['Innenfutter', 1, 'Stück', '']], tipps: [], warn: ['Sparren schneiden nur nach Statik.', 'Absturzsicherung.'] },

  dach: { t: 'Dach erneuern / erweitern', b: 'aussen', wer: 'Fachbetrieb', dauer: '1–3 Wochen', einheit: 'm²', kosten: [120, 300],
    schichten: [['Sparren', '#8b6b4a', 'Tragwerk – Zustand prüfen'], ['Dampfbremse (innen)', '#7ab8ff', 'luftdicht, raumseitig'], ['Dämmung', '#ffd27a', 'zwischen/auf Sparren'], ['Unterspannbahn', '#9fd69f', 'diffusionsoffen, 2. wasserführende Ebene'], ['Konterlattung', '#a0784e', 'Hinterlüftung, Wasser abführen'], ['Lattung', '#b88a5c', 'Abstand nach Ziegel'], ['Eindeckung', '#c0503a', 'Ziegel / Dachstein']],
    schritte: [['Bestand & Statik', 'Tragwerksplaner bei Erweiterung, Gaube, schwererer Eindeckung, PV.'], ['Genehmigung', 'Erweiterung/Gaube meist genehmigungspflichtig; Erneuerung oft verfahrensfrei.'], ['Gerüst + Absturzsicherung', 'Fanggerüst/Dachschutzwand Pflicht.'], ['Abdecken', 'Alte Eindeckung, Lattung entfernen. Asbest? (Faserzement vor 1993) → Fachfirma TRGS 519.'], ['Sparren prüfen/aufdoppeln', ''], ['Dämmen + Dampfbremse', 'Zwischen-/Aufsparren.'], ['Unterspannbahn', 'Von der Traufe nach oben, überlappend.'], ['Konterlattung', 'Auf den Sparren, über der Bahn.'], ['Lattung', 'Lattabstand nach Ziegeltyp aus Herstellerangabe, von der Traufe einteilen.'], ['Anschluss bei Erweiterung', 'Neue Lattung exakt in Flucht der alten (Schnur), Höhenversatz mit Konterlattung ausgleichen.'], ['Eindecken', 'Ortgang, First, Grat; Sturmklammern nach Windzone.'], ['Klempner', 'Rinne, Kehle, Anschlüsse an Kamin/Wand.']],
    material: [['Dachziegel', 11, 'Stück', 'je nach Modell 10–15/m²'], ['Lattung 30×50', 3.2, 'm', ''], ['Konterlattung', 1.3, 'm', ''], ['Unterspannbahn', 1.15, 'm²', ''], ['Dämmung', 1.05, 'm²', ''], ['Dampfbremse', 1.15, 'm²', ''], ['Sturmklammern', 3, 'Stück', 'nach Windzone']],
    tipps: ['Lattabstand immer nach Herstellerangabe des Ziegels und Dachneigung.', 'Mit Dachsanierung gleich PV-Vorbereitung planen.'], warn: ['Absturzgefahr – Fachbetrieb empfohlen.', 'Statik und Genehmigung vor Beginn klären.'] },

  fenster: { t: 'Fenster/Tür tauschen nach RAL', b: 'aussen', wer: 'Teils Profi', dauer: '½ Tag je Fenster', einheit: 'Stück', kosten: [450, 1200],
    schichten: [['① innen: luftdicht', '#9fd69f', 'Dichtband oder Folie'], ['② Mitte: dämmend', '#ffd27a', 'Fensterschaum'], ['③ außen: schlagregendicht, diffusionsoffen', '#7ab8ff', 'Kompriband, unten Anschlussfolie']],
    schritte: [['Maße nehmen', 'Laibung an 3 Stellen.'], ['Altes Fenster ausbauen', 'Flügel zuerst, dann Rahmen.'], ['Laibung säubern', 'tragfähig, staubfrei'], ['Dichtbänder auf Rahmen kleben', 'vor dem Einsetzen'], ['Einsetzen auf Tragklötze', 'lot- und waagerecht'], ['Befestigen', 'Montageschrauben, Abstände lt. Hersteller'], ['Fuge mit Fensterschaum', 'nicht überfüllen'], ['Innen- und Außenband anschließen', 'lückenlos, auch unten'], ['Fensterbank innen und außen', 'Gefälle nach außen']],
    material: [['Kompriband (außen)', 4.5, 'm', 'nach Fugenbreite'], ['Fensterschaum flexibel', 0.6, 'Dose', ''], ['Dichtband innen', 4.5, 'm', ''], ['Anschlussfolie unten', 1.3, 'm', ''], ['Montageschrauben', 8, 'Stück', ''], ['Tragklötze', 1, 'Set', '']],
    tipps: ['Grundregel: innen dichter als außen.'], warn: ['Nur Schaum oder nur Kompriband ist keine RAL-Montage.'] },

  haustuer: { t: 'Haustür tauschen', b: 'aussen', wer: 'Teils Profi', dauer: '1 Tag', einheit: 'Stück', kosten: [1500, 5000],
    schichten: [['① innen: luftdicht', '#9fd69f', 'Folie/Dichtband'], ['② Mitte: dämmend', '#ffd27a', 'Schaum'], ['③ außen: regendicht', '#7ab8ff', 'Kompriband'], ['Schwelle/Boden', '#c0503a', 'Abdichtung + Wärmebrücke vermeiden']],
    schritte: [['Aufmaß', 'Rohbauöffnung, Fußbodenaufbau innen/außen.'], ['Alte Tür ausbauen', ''], ['Bodenanschluss vorbereiten', 'Dämmprofil unter Schwelle, Abdichtung unten.'], ['Einsetzen + ausrichten', 'Türe lot, Schwelle waagerecht.'], ['Befestigen', 'mehr Befestigungspunkte an Schloss- und Bandseite.'], ['Fugen RAL-gerecht', 'wie Fenster.'], ['Schloss/Einbruchschutz', 'RC2 empfohlen.']],
    material: [['Haustür', 1, 'Stück', ''], ['Kompriband', 6, 'm', ''], ['Schaum', 1, 'Dose', ''], ['Dichtfolie innen', 6, 'm', ''], ['Schwellen-Dämmprofil', 1, 'Stück', '']], tipps: ['Barrierefreie Schwelle max. 2 cm.'], warn: [] },

  fassade: { t: 'Fassade dämmen / streichen', b: 'aussen', wer: 'Fachbetrieb', dauer: '1–4 Wochen', einheit: 'm²', kosten: [20, 220],
    schichten: [['Mauerwerk', '#3a3530', 'Bestand'], ['Kleber', '#999', ''], ['Dämmplatte (WDVS)', '#ffd27a', 'Mineralwolle/EPS/Holzfaser'], ['Armierung + Gewebe', '#7ab8ff', ''], ['Oberputz + Anstrich', '#e9e9e9', '']],
    schritte: [['Untergrund prüfen', 'Risse, Feuchte, Tragfähigkeit.'], ['Streichen: reinigen', 'Algen entfernen, Grundierung.'], ['Streichen: 2× Fassadenfarbe', 'Silikonharz/Silikat, nicht bei Regen/Frost/praller Sonne.'], ['Dämmen: Gerüst + Sockel', 'Sockelprofil, Perimeterdämmung unten.'], ['Dämmen: Platten kleben + dübeln', 'Verband, keine Kreuzfugen.'], ['Armieren + Putz', 'Laibungen und Anschlüsse mitdämmen.']],
    material: [['Fassadenfarbe', 0.35, 'l', '2 Anstriche'], ['Dämmplatte', 1.05, 'm²', 'nur bei WDVS'], ['Armierungsmörtel + Gewebe', 1.1, 'm²', '']], tipps: ['Streichen = ca. 20–40 €/m², WDVS = ca. 120–220 €/m² (Richtwerte).'], warn: ['Dämmen ab 10 % Fassadenfläche: Vorgaben GEG/GModG beachten.', 'Gerüst nur durch Fachbetrieb.'] },

  regenrinne: { t: 'Regenrinne erneuern', b: 'aussen', wer: 'Teils Profi', dauer: '1 Tag', einheit: 'm', kosten: [25, 80],
    schritte: [['Gefälle planen', 'ca. 2–3 mm je Meter zum Fallrohr.'], ['Rinnenhaken setzen', 'Abstand max. 70–90 cm, Schnur spannen.'], ['Rinne einlegen', 'Stöße/Ecken nach System verbinden.'], ['Fallrohr + Laubfang', ''], ['Anschluss Kanal/Versickerung', 'Rückstau beachten.']],
    material: [['Rinne', 1.0, 'm', ''], ['Rinnenhaken', 1.3, 'Stück', ''], ['Fallrohr', 0.2, 'm', '']], tipps: [], warn: ['Arbeiten an der Traufe: Gerüst/Absturzsicherung.'] },

  vordach: { t: 'Vordach montieren', b: 'aussen', wer: 'Selbst', dauer: '½ Tag', einheit: 'Stück', kosten: [300, 1200],
    schritte: [['Untergrund', 'Wandart bestimmen; WDVS: spezielle Abstandsmontage.'], ['Bohren', 'Leitungssucher, Schwerlastanker.'], ['Montieren', 'Gefälle nach vorne.'], ['Abdichten', 'Wandanschluss.']],
    material: [['Vordach-Set', 1, 'Stück', ''], ['Schwerlastanker', 4, 'Stück', '']], tipps: [], warn: [] },

  balkon_abdichten: { t: 'Balkon abdichten', b: 'aussen', wer: 'Teils Profi', dauer: '2–3 Tage', einheit: 'm²', kosten: [60, 200],
    schritte: [['Zustand prüfen', 'Risse, Gefälle, Abfluss.'], ['Belag entfernen', ''], ['Gefälle', 'ca. 1,5–2 % vom Haus weg.'], ['Abdichtung', 'Flüssigkunststoff oder Bahnen, an Wand hochziehen.'], ['Belag', 'Stelzlager oder Drainage.']], material: [['Flüssigabdichtung', 2.5, 'kg', '']], tipps: [], warn: ['Eigentümergemeinschaft vorher fragen.'] },

  garagentor: { t: 'Garagentor tauschen', b: 'aussen', wer: 'Teils Profi', dauer: '1 Tag', einheit: 'Stück', kosten: [1200, 3500],
    schritte: [['Aufmaß', 'Öffnung, Sturzhöhe, Seitenteile.'], ['Altes Tor ausbauen', 'Federspannung! Torsionsfedern nur Fachbetrieb.'], ['Zarge setzen', ''], ['Laufschienen + Tor', ''], ['Antrieb', 'Kraftbegrenzung einstellen.']], material: [['Sektionaltor-Set', 1, 'Stück', '']], tipps: [], warn: ['Gespannte Federn sind lebensgefährlich.'] },

  carport: { t: 'Carport bauen', b: 'aussen', wer: 'Teils Profi', dauer: '2–3 Tage', einheit: 'Stück', kosten: [2000, 8000],
    schritte: [['Genehmigung', 'Je Bundesland verfahrensfrei bis bestimmte Größe – Bauamt fragen, Abstand zum Nachbarn.'], ['Fundamente', 'Frostfrei 80 cm, H-Anker.'], ['Pfosten + Pfetten', ''], ['Dach', 'Gefälle, Rinne.']], material: [['Bausatz', 1, 'Stück', ''], ['Beton', 0.3, 'm³', '']], tipps: [], warn: [] },

  bodenbeschichtung: { t: 'Bodenbeschichtung (Garage/Keller)', b: 'innen', wer: 'Selbst', dauer: '2 Tage', einheit: 'm²', kosten: [12, 40],
    schritte: [['Reinigen, entfetten', ''], ['Anschleifen', ''], ['Grundierung', ''], ['Epoxid 2×', 'Topfzeit beachten.']], material: [['2K-Epoxid', 0.3, 'kg', ''], ['Grundierung', 0.15, 'kg', '']], tipps: [], warn: ['Lösemittel: lüften, Atemschutz.'] },

  installation: { t: 'Wasser, Abwasser & Elektro planen', b: 'innen', wer: 'Teils Profi', dauer: 'Rohre, Gefälle, Kabel, Werkzeug', einheit: 'Stück', kosten: [0, 0], schritte: [], material: [], tipps: [], warn: [], route: '#/installation' },

  keller_abdichten: { t: 'Kellerwand von außen abdichten', b: 'aussen', wer: 'Fachbetrieb', dauer: '1–2 Wochen', einheit: 'm', kosten: [250, 700],
    schichten: [['Kellerwand (Bestand)', '#8f8a83', 'gereinigt, trocken, tragfähig'], ['Grundierung', '#5a5a5a', 'Bitumen-Voranstrich'], ['Kehle am Fundament', '#3a3a3a', 'Hohlkehle aus Dichtmörtel'], ['Abdichtung KMB 2 Lagen', '#1f1f1f', 'kunststoffmod. Bitumendickbeschichtung, mit Gewebe'], ['Perimeterdämmung', '#ffd27a', 'XPS-Platten, druckfest'], ['Noppenbahn / Schutzschicht', '#6a6a6a', 'schützt die Abdichtung beim Verfüllen'], ['Drainage', '#9a948c', 'Kies + Drainrohr mit Gefälle, nur wenn nötig'], ['Verfüllen', '#5b4636', 'lagenweise verdichten, Gefälle vom Haus weg']],
    schritte: [['Ursache und Lastfall klären', 'Bodenfeuchte, nichtdrückendes oder drückendes Wasser? Gutachter/Fachbetrieb.'], ['Freilegen', 'Abschnittsweise bis Fundament ausheben (Standsicherheit! Verbau ab 1,25 m Tiefe).'], ['Reinigen und trocknen', 'Altanstriche, Schmutz entfernen, Fehlstellen schließen.'], ['Grundieren und Kehle', 'Voranstrich, Hohlkehle am Wand-Fundament-Übergang.'], ['Abdichtung 2 Lagen', 'KMB mit Verstärkungsgewebe, Schichtdicke prüfen.'], ['Dämmung und Schutz', 'Perimeterdämmung kleben, Noppenbahn davor.'], ['Drainage (falls nötig)', 'Drainrohr mit Gefälle, Kies, Vlies, Spülschacht.'], ['Verfüllen', 'Lagenweise verdichten, Gefälle vom Haus weg, Regenwasser ableiten.']],
    material: [['KMB-Abdichtung', 12, 'kg', 'je m Wandlänge bei ca. 2 m Tiefe'], ['Perimeterdämmung', 2.1, 'm²', ''], ['Noppenbahn', 2.2, 'm²', ''], ['Drainrohr DN 100', 1.05, 'm', 'falls nötig']],
    tipps: ['Oft reicht es, Regenrinne, Fallrohr und Gefälle am Haus zu reparieren – erst prüfen!'], warn: ['Baugrube nie ungesichert betreten – Einsturzgefahr.', 'Leitungen im Erdreich vorher orten (Gas, Strom, Wasser).'] },

  bad_luefter: { t: 'Badlüfter einbauen (Bad ohne Fenster)', b: 'innen', wer: 'Teils Profi', dauer: '1 Tag', einheit: 'Stück', kosten: [150, 650],
    schichten: [['Lüfter oben, gegenüber der Tür', '#9fd69f', 'nahe Dusche/WC, ca. 2,10–2,20 m oder Decke'], ['Abluftrohr DN 100 (75–125)', '#e9e9e9', 'kurz, wenig Bögen, Gefälle nach außen'], ['Rückstauklappe', '#ffd27a', 'kein Kaltluft-/Geruchsrückstrom'], ['Ausblas über Dach / Außenwand', '#7ab8ff', 'nie in Dachboden, Schacht oder Kamin'], ['Nachströmung in der Tür', '#ff8a7a', 'mind. 150 cm² frei (Gitter, Kürzung, Zarge)']],
    schritte: [['Bedarf klären', 'Bad/WC ohne Fenster braucht eine Entlüftung (DIN 18017-3). Mehrfamilienhaus: Hausverwaltung/Bestand fragen (zentrale Anlage?).'], ['Platz wählen', 'Gegenüber der Tür, möglichst hoch (Wand oben oder Decke) und nahe Dusche/WC – so strömt die Luft quer durch den Raum. Nie direkt neben der Tür.'], ['Weg nach draußen planen', 'Kürzester Weg über Dach oder Außenwand. Nicht in Dachboden, Zwischendecke, Schacht oder Kamin (Schornsteinfeger fragen).'], ['Durchbruch', 'Kernbohrung ca. 110–130 mm; bei tragenden Wänden/Decken vorher Statik klären.'], ['Rohr verlegen', 'Glattes Rohr DN 100, wenig Bögen, leichtes Gefälle nach außen. In kalten Bereichen dämmen (Kondenswasser).'], ['Außen abschließen', 'Mauerkasten/Dachdurchführung mit Rückstauklappe und Insektengitter, regendicht anschließen.'], ['Lüfter montieren', 'Gerät mit Nachlauf oder Feuchtesensor (Richtwert: Bad ca. 60 m³/h bei Bedarf).'], ['Strom', 'Anschluss über Lichtschalter/Sensor durch Elektrofachkraft (Schutzbereiche beachten).'], ['Nachströmung prüfen', 'Tür braucht mind. 150 cm² freie Öffnung – sonst Anleitung „Badtür für Lüftung nachrüsten“.']],
    material: [['Badlüfter mit Nachlauf/Feuchtesensor', 1, 'Stück', ''], ['Lüftungsrohr DN 100', 3, 'm', ''], ['Rückstauklappe DN 100', 1, 'Stück', ''], ['Mauerkasten / Dachdurchführung', 1, 'Stück', ''], ['Rohrdämmung', 2, 'm', 'in kalten Bereichen'], ['Rohrschellen', 4, 'Stück', '']],
    tipps: ['Je kürzer und gerader die Abluftleitung, desto leiser und wirksamer.', 'Feuchtesensor schaltet automatisch – gut gegen Schimmel.'], warn: ['Abluft nie in den Dachboden oder in einen Kamin leiten.', 'Elektroanschluss nur durch Elektrofachkraft.'] },

  tuer_lueftung: { t: 'Badtür für Lüftung nachrüsten', b: 'innen', wer: 'Selbst', dauer: '1–2 Stunden', einheit: 'Stück', kosten: [20, 120],
    schichten: [['Lüftungsgitter im Türblatt', '#9fd69f', 'unten, mind. 150 cm² frei'], ['oder: Tür unten kürzen', '#ffd27a', 'Spalt so hoch, dass 150 cm² erreicht werden'], ['oder: Zargenlüftung', '#7ab8ff', 'unsichtbar, im Türrahmen']],
    schritte: [['Bedarf prüfen', 'Mit Lüfter oder zentraler Abluft muss Luft nachströmen können: mind. 150 cm² freier Querschnitt (DIN 18017-3).'], ['Bestand messen', 'Türbreite × vorhandener Spalt unten = freie Fläche. Beispiel: 80 cm × 1 cm = 80 cm² → reicht nicht.'], ['Lösung wählen', 'Lüftungsgitter (z. B. 2 × Gitter im unteren Türdrittel), Tür kürzen oder Zargenlüftung. Röhrenspantür/Wabentür: Innenaufbau beachten.'], ['Gitter einsetzen', 'Ausschnitt anzeichnen, vorbohren, mit Stichsäge aussägen, Kanten versiegeln, Gitter beidseitig einsetzen.'], ['Oder kürzen', 'Tür aushängen, Schnittlinie mit Klebeband, Kreissäge mit Führungsschiene, Kante versiegeln (Feuchte).'], ['Prüfen', 'Lüfter an: Tür muss leicht aufgehen und es darf nicht pfeifen.']],
    material: [['Türlüftungsgitter (Paar)', 2, 'Stück', 'freier Querschnitt laut Hersteller'], ['Kantenversiegelung / Lack', 1, 'Dose', '']],
    tipps: ['Zargenlüftung ist die unsichtbare Profi-Lösung – Tischler/Schreiner fragen.'], warn: ['Brandschutz- oder Wohnungseingangstüren nicht verändern.'] },

  /* ---- Garten ---- */
  gartenplaner: { t: 'Gartenplaner 4D', b: 'garten', wer: 'Selbst', dauer: '', einheit: 'm²', kosten: [20, 120], schritte: [], material: [], tipps: [], warn: [], route: '#/garten' },

  terrasse: { t: 'Terrasse bauen (Holz/WPC oder Platten)', b: 'garten', wer: 'Teils Profi', dauer: '3–5 Tage', einheit: 'm²', kosten: [60, 200],
    schichten: [['Boden verdichtet', '#5b4636', ''], ['Unkrautvlies', '#777', ''], ['Schotter 0/32', '#999', '15–20 cm'], ['Splitt 2/5', '#bbb', '3–5 cm'], ['Platten / Unterkonstruktion', '#e0c9a6', 'Gefälle 2 % vom Haus weg']],
    schritte: [['Planen', 'Größe, Gefälle 2 % vom Haus weg, Höhe Türschwelle.'], ['Ausheben', '25–35 cm tief.'], ['Unterbau', 'Schotter lagenweise verdichten.'], ['Splittbett abziehen', 'Mit Abziehlatte und Schnur.'], ['Platten legen / Unterkonstruktion', 'Holz: konstruktiver Holzschutz, Abstand zum Boden.'], ['Fugen', '']],
    material: [['Terrassenplatten/-dielen', 1.08, 'm²', ''], ['Schotter', 0.2, 'm³', ''], ['Splitt', 0.05, 'm³', ''], ['Randsteine', 0.5, 'm', '']], tipps: [], warn: [] },

  zaun: { t: 'Zaun & Sichtschutz', b: 'garten', wer: 'Selbst', dauer: '1–2 Tage', einheit: 'm', kosten: [40, 180],
    schritte: [['Rechtliches', 'Höhe und Grenzabstand nach Nachbarrecht des Bundeslands; Bebauungsplan.'], ['Pfostenabstand anzeichnen', 'Schnur.'], ['Fundamente', 'Frostfrei ca. 80 cm oder Einschlaghülsen.'], ['Pfosten setzen', 'Lot, Beton.'], ['Elemente montieren', '']],
    material: [['Zaunelement 1,8 m', 0.55, 'Stück', ''], ['Pfosten', 0.6, 'Stück', ''], ['Beton', 0.04, 'm³', '']], tipps: ['Mit dem Nachbarn vorher reden.'], warn: ['Vor dem Graben Leitungsplan prüfen.'] },

  hochbeet: { t: 'Hochbeet bauen', b: 'garten', wer: 'Selbst', dauer: '1 Tag', einheit: 'Stück', kosten: [120, 400],
    schichten: [['Wühlmausgitter', '#999', 'ganz unten, verzinkt'], ['Äste/Zweige', '#6b4f2a', '25 cm'], ['Grasschnitt/Laub', '#7a9a4a', '20 cm'], ['Kompost grob', '#5b4636', '20 cm'], ['Pflanzerde', '#3e2f22', '20 cm']],
    schritte: [['Standort', 'Sonnig, Nord-Süd-Ausrichtung, ca. 80–90 cm hoch, max. 120 cm breit.'], ['Wühlmausgitter', 'Boden auslegen, an Seiten hochziehen.'], ['Rahmen bauen', 'Innen Noppenfolie gegen Fäulnis.'], ['Schichten füllen', 'Grob unten, fein oben.'], ['Bepflanzen', 'Starkzehrer im 1. Jahr.']],
    material: [['Hochbeet-Bausatz', 1, 'Stück', ''], ['Wühlmausgitter', 2, 'm²', ''], ['Noppenfolie', 4, 'm²', ''], ['Pflanzerde', 300, 'l', '']], tipps: [], warn: [] },

  teich: { t: 'Gartenteich anlegen', b: 'garten', wer: 'Selbst', dauer: '2–4 Tage', einheit: 'm²', kosten: [40, 150],
    schritte: [['Standort', 'Halbschattig, nicht unter Bäumen.'], ['Kindersicherheit', 'Mit kleinen Kindern: Teichgitter unter Wasser, flache Ufer, Zaun – oder Teich verschieben.'], ['Ausheben', 'Stufen: Sumpf 10–20, Flach 40, Tief 80+ cm.'], ['Sand + Vlies', 'Steine entfernen.'], ['Folie', 'Faltenarm, Rand mit Kapillarsperre.'], ['Bepflanzen + füllen', '']],
    material: [['Teichfolie', 1.8, 'm²', '(L+2T+1)×(B+2T+1)'], ['Teichvlies', 1.8, 'm²', ''], ['Sand', 0.05, 'm³', '']], tipps: [], warn: ['Ertrinkungsgefahr für Kleinkinder schon bei 10 cm Wassertiefe.'] },

  gartenhaus: { t: 'Gartenhaus aufstellen', b: 'garten', wer: 'Selbst', dauer: '2–3 Tage', einheit: 'Stück', kosten: [1500, 6000],
    schritte: [['Genehmigung', 'Verfahrensfreie Größe je Bundesland unterschiedlich (z. B. bis ca. 10–75 m³ umbauter Raum); Abstand zur Grenze.'], ['Fundament', 'Punktfundamente oder Platte, waagerecht.'], ['Bodenrahmen', 'Abstand zum Boden, Sperrschicht.'], ['Wände, Dach', 'Nach Anleitung.'], ['Dachpappe/Schindeln', ''], ['Holzschutz', '']],
    material: [['Bausatz', 1, 'Stück', ''], ['Beton/Punktfundamente', 1, 'Set', '']], tipps: [], warn: ['Bauamt vorher fragen.'] },

  bewaesserung: { t: 'Bewässerung (Tropf/Sprinkler)', b: 'garten', wer: 'Selbst', dauer: '1 Tag', einheit: 'm²', kosten: [3, 15],
    schritte: [['Zonen planen', 'Rasen, Beete, Hecken getrennt.'], ['Wasserquelle', 'Zisterne oder Hahn mit Rückflussverhinderer.'], ['Leitungen verlegen', 'Frostsicher entleerbar.'], ['Tropfer/Regner', ''], ['Steuerung', 'Bodenfeuchtesensor spart Wasser.']], material: [['Tropfschlauch', 1.2, 'm', ''], ['Verteiler', 0.05, 'Stück', '']], tipps: ['Morgens gießen.'], warn: [] },

  gartenlicht: { t: 'Gartenbeleuchtung', b: 'garten', wer: 'Teils Profi', dauer: '1 Tag', einheit: 'Stück', kosten: [40, 250],
    schritte: [['Planen', 'Wege, Stufen, Akzente.'], ['Schutzart', 'Außen mind. IP44, im Boden IP67.'], ['Erdkabel', 'NYY in 60 cm Tiefe mit Warnband – nur Elektrofachkraft. Alternative: Niedervolt 12/24 V oder Solar.'], ['Montieren', ''], ['Insektenfreundlich', 'Warmweiß unter 3000 K, nach unten strahlend.']], material: [['Leuchte IP44+', 1, 'Stück', ''], ['Kabel', 5, 'm', '']], tipps: [], warn: ['230-V-Anschluss im Garten nur durch Elektrofachkraft, FI-Schutz.'] },

  gartenweg: { t: 'Gartenweg anlegen', b: 'garten', wer: 'Selbst', dauer: '1–2 Tage', einheit: 'm²', kosten: [25, 90],
    schritte: [['Verlauf', 'Mit Schnur/Sand markieren, Breite 60–120 cm.'], ['Ausheben', '20–30 cm.'], ['Randsteine', 'In Beton setzen.'], ['Schotter + Splitt', 'Verdichten, abziehen.'], ['Belag', 'Pflaster, Platten oder Kies mit Wabengitter.']], material: [['Pflaster/Platten', 1.05, 'm²', ''], ['Schotter', 0.2, 'm³', ''], ['Randstein', 1.5, 'm', '']], tipps: [], warn: [] }
};

/* Zeitaufwand (Richtwerte) für FORTGESCHRITTENE Heimwerker: [feste Stunden, Stunden je Einheit]
   Anfänger ≈ ×1,7 · Profi ≈ ×0,55 (eine Fachkraft, mit Profi-Werkzeug). Wartezeiten zusätzlich. */
const ZEITEN = {
  streichen: [3, 0.15], tapezieren: [2, 0.3], laminat: [2, 0.35], parkett: [3, 0.6], fliesen: [3, 1.2], bad_abdichten: [2, 0.3],
  silikon: [0.5, 0.15], vorsatzschale: [2, 0.8], trockenbau_wand: [2, 1.0], kueche_montage: [16, 0], treppe_renovieren: [3, 1.2],
  keller_feuchte: [4, 0.8], kellerdecke_daemmen: [2, 0.3], heizung_tausch: [24, 0], dach_daemmen_innen: [3, 0.8], oberste_decke: [2, 0.15],
  dachfenster: [0, 8], dach: [16, 1.2], fenster: [0, 4], haustuer: [0, 8], fassade: [8, 0.6], regenrinne: [3, 0.4], vordach: [0, 4],
  balkon_abdichten: [4, 1.0], garagentor: [0, 8], carport: [0, 20], bodenbeschichtung: [3, 0.2], terrasse: [6, 1.5], zaun: [3, 0.8],
  hochbeet: [0, 6], teich: [6, 1.5], gartenhaus: [0, 20], bewaesserung: [3, 0.05], gartenlicht: [3, 2], gartenweg: [4, 1.2],
  bad_luefter: [0, 6], tuer_lueftung: [0, 1.5], keller_abdichten: [8, 4]
};
/* Wartezeiten, die die Arbeit unterbrechen: [Text, Stunden] */
const WARTEN = {
  streichen: ['Trocknen zwischen den Anstrichen', 6], tapezieren: ['Kleister/Untergrund trocknen', 12], fliesen: ['Fliesenkleber aushärten vor dem Verfugen', 24],
  bad_abdichten: ['Abdichtung 2× trocknen lassen', 24], vorsatzschale: ['Spachtel trocknen, zweiter Gang', 12], trockenbau_wand: ['Spachtel trocknen, zweiter Gang', 12],
  keller_feuchte: ['Sanierputz trocknen (je cm Dicke ca. 1 Tag)', 72], bodenbeschichtung: ['Epoxid aushärten', 24], balkon_abdichten: ['Abdichtung aushärten', 24],
  terrasse: ['Fundamente/Splittbett setzen', 24], zaun: ['Beton der Pfosten aushärten', 48], carport: ['Fundamente aushärten', 72], gartenhaus: ['Fundament aushärten', 72],
  parkett: ['Kleber/Öl trocknen', 24], fassade: ['Putz/Anstrich trocknen', 24], laminat: ['Dielen akklimatisieren (vorher)', 48]
};
const NUR_PROFI = ['heizung_tausch', 'dach'];
