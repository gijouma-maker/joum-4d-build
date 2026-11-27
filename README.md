# Joum 4D Build – Plan. Bau. Fertig.

Heimwerker- und Renovierungs-App für **Innen, Haus außen und Garten**. „4D“ = 3D + Zeit (Bauablauf Schritt für Schritt, im Garten Wachstum über Jahre und Jahreszeiten).

Untertitel je Sprache: DE „Plan. Bau. Fertig.“ · EN „Plan. Build. Done.“ · NL „Plan. Bouw. Klaar.“

## Starten

Die App ist eine **installierbare Web-App (PWA)** ohne Build-Schritt.

- **Lokal:** Ordner öffnen und einen kleinen Webserver starten, z. B. `python3 -m http.server 8000`, dann `http://localhost:8000` im Browser öffnen.
- **Aufs Handy:** Seite im Browser öffnen → „Zum Startbildschirm hinzufügen“. Danach läuft sie wie eine App, auch offline.
- **Online stellen (kostenlos):** z. B. Netlify Drop (Ordner hineinziehen) oder Cloudflare Pages. GitHub Pages geht bei privaten Repositorys nur mit bezahltem Tarif.

## Inhalt

| Bereich | Was die App kann |
|---|---|
| Start | Aktives Projekt mit Fortschritts-Ring, nächster Schritt, Schnellzugriffe |
| Projekte | Reiter Innen / Haus außen / Garten, Kennzeichnung „Selbst“, „Teils Profi“, „Fachbetrieb“ |
| Räume (26) | Wohnzimmer, Esszimmer, Küche, Bad, Gäste-WC, Schlafzimmer, Kinderzimmer, Babyzimmer, Jugendzimmer, Gästezimmer, Büro, Flur/Diele, Treppe, Ankleide, Abstellraum/Speisekammer, Waschraum/HWR, Keller, Heizungsraum, Dachgeschoss/Dachboden, Hobbyraum/Werkstatt, Fitnessraum, Heimkino, Wintergarten, Balkon/Loggia, Garage/Carport, Fassade, Dach, Garten – je mit Katalog, Montage- und Sicherheitshinweisen, Tipps |
| Messen | Wände, Aussparungen, Netto-Fläche, Grundfläche, Diktieren per Mikrofon |
| Gestalten | 2D-Grundriss: Elemente aus dem Raumkatalog hinzufügen, verschieben, drehen, kopieren, löschen; 3D-Ansicht |
| KI-Ideen | Notizen aus Skizze („Licht, TV, Bild?“) → Elemente mit Bestätigung für Unsicheres; 8 Stile (Modern Hell, Skandinavisch, Industrial, Japandi, Landhaus, Luxus/Art déco, Familienfreundlich, Spar-Variante) |
| Anleitungen (36) | Streichen, Tapezieren, Laminat/Vinyl, Parkett, Fliesen, Bad abdichten, Silikon, Vorsatzschale, Trennwand, Küche, Treppe, feuchter Keller, Kellerdecke, Heizung, Dach innen dämmen, oberste Geschossdecke, Dachfenster, **Dach erneuern/erweitern** (Schichtaufbau, Lattung, Anschluss alt/neu, Statik/Genehmigung), **Fenster/Tür nach RAL**, Haustür, Fassade, Regenrinne, Vordach, Balkon, Garagentor, Carport, Bodenbeschichtung, Terrasse, Zaun, Hochbeet, Teich, Gartenhaus, Bewässerung, Gartenlicht, Gartenweg – mit Schichtaufbau, abhakbaren Schritten, Material und Richtpreisen |
| Gartenplaner 4D | 5 Vorschläge (Naturgarten, Modern pflegeleicht, Bauerngarten mit Hochbeeten, Mediterran, Familien-/Spielgarten), Zeit-Regler Jetzt/1/3/5 Jahre, Jahreszeiten, Wachstum abspielen, Draufsicht/Schrägansicht, Kosten, Tipps |
| Rechner | Dämmung Dach (U-Wert, Grenzwert 0,24, Ersparnis), Farbe, Fliesen/Boden, Tapete, Beton |
| Einkauf | Materialliste mit Verschnitt, Preise-Link je Position, WhatsApp-Anfrage |
| Produkt-Preisvergleich | Suche, günstigere Alternativen, Preiswecker |
| Finanzen | Beleg fotografieren, Projekt zuordnen, § 35a (nur Lohn, keine Barzahlung), Vermietung/Werbungskosten, CSV-Export |
| Marktplatz | KI-Preisrahmen → Festpreis → Handwerker nach Score wählen (verdecktes Gegenangebot) → Nachtrag mit Finger-Unterschrift → Abnahme je Etappe mit Mängel-Tickets → Treuhand-Freigabe → Bewertung |
| Handwerker-Pro | Auftrags-Radar, Kalkulation (Material + Lohn + Anfahrt, Lohnanteil ausgewiesen), Angebot als PDF |
| Community | Tipps teilen, KI-Bewertung Nutzen/Aufwand/Risiko, Admin-Warnung bei Sicherheitsrisiken |
| Datensicherung | Jede Eingabe sofort lokal gespeichert, Sicherungsstatus, Versionsverlauf mit Wiederherstellung, Papierkorb 30 Tage, Sicherung vor Daten-Migration, Export/Import für neues Gerät, PDF über Drucken |
| JoumHome | Ticket → Renovierungsprojekt, auch per Direktlink `#/ticket?nr=…&objekt=…&raum=bad&text=…` |
| Einstellungen | Großschrift, hoher Kontrast |

## Was noch einen Server braucht (nächster Ausbau)

Diese Teile sind in der App sichtbar, brauchen aber ein Backend und sind klar gekennzeichnet:

- Cloud-Sync auf EU-Server, verschlüsselt, Backups am zweiten Standort
- Echte Handwerker-Konten, Prüfung (Handwerksrolle, Gewerbe, Haftpflicht), Treuhand-Zahlungen, App-Telefonnummer, Chat-Filter (im Moment Beispieldaten)
- KI: Handschrift-/Raum-/Produkterkennung aus Fotos, fotorealistische Bilder (Kosten pro Bild)
- LiDAR-Scan (nur in einer nativen iOS/Android-App)
- Händlerpreise über Affiliate-Feeds/Partnerschaften (kein Scraping), Preiswecker-Benachrichtigung
- Mehrsprachigkeit der Oberfläche (EN/NL)

## Offene Punkte

- Fachinhalte (RAL, Dach, Bad, Garten, Steuer) fachlich prüfen lassen; GEG/GModG-Grenzwerte aktuell halten
- Score-Regeln fair mit Einspruch; digitale Unterschrift rechtlich prüfen
- Treuhand, AGB, Verbraucherrecht, § 35a-Änderungen ab 2027 mit Anwalt/Steuerberater
- Name prüfen: DPMA/EUIPO, App Store, Google Play, Domain

## Aufbau

```
index.html            App-Hülle, Navigation
css/app.css           Design (schwarz, Jost, Pill-Buttons)
js/data-raeume.js     Räume + Kataloge + Sicherheitshinweise
js/data-anleitungen.js Fach-Anleitungen
js/data-garten.js     Gartenvorschläge + Tipps
js/core.js            Speicher (offline-first), Versionen, Router
js/screens-*.js       Bildschirme
sw.js                 Offline-Betrieb
```

Alle Fachinhalte sind allgemeine Hinweise ohne Gewähr. Arbeiten an Strom, Gas, Statik und Dach: Fachbetrieb.
