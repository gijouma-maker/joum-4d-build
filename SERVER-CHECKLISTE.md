# Server-Checkliste – Joum 4D Build (und JoumHome, WN Entrümpelung)

> **Für Claude:** Diese Liste vor JEDEM Server-Schritt durchgehen, offene Punkte aktiv ansprechen, fehlende Entscheidungen erfragen und neue Ideen/Funktionen hier eintragen. Nach dem Start: neue Funktionen erneut auf Server-Bedarf prüfen.
>
> Stand: 27.11.2026 · Legende: ☐ offen · ◐ vorbereitet · ☑ erledigt

## 0. Entscheidungen, die noch von dir kommen müssen
- ☐ Server-Anbieter in der EU (z. B. deutscher Anbieter mit Rechenzentrum in DE) – Größe/Kosten
- ☐ Zahlungsdienstleister für Treuhand/Etappenzahlung (muss lizenziert sein – Treuhand nicht selbst „verwahren“)
- ☐ Preismodell: Abo für Kunden? Gebühr je Auftrag für Handwerker? „Eigene Kunden“-Abo?
- ☐ KI-Kosten: wie viele KI-Bilder/Videos/Erkennungen pro Nutzer frei, was im Abo?
- ☐ Sprachen: App hat jetzt 24 Sprachen (Entscheidung: alle). Offen: Welche Sprachen bekommen beim Start Rechtstexte (Impressum, Datenschutz, AGB) und Store-Einträge? Empfehlung: DE + EN sofort, weitere nach Nachfrage – Rechtstexte nur professionell übersetzen lassen.
- ☑ Ein Konto für alle Apps (JoumHome + Joum 4D Build + WN + später weitere) – Entscheidung 27.11.: ja, Anmeldung ohne Passwort (Google, Facebook, Apple, Telefon, E-Mail)
- ☑ Entscheidung 27.11.: **erst nur kostenlose Wege**. Anmeldung vorerst NUR mit Google (Google Identity Services, kostenlos, ohne eigenen Server). Facebook, Apple, Telefon (SMS kostet), E-Mail: gesperrt bis später
- ☐ Google-Client-ID anlegen und in `js/konfig.js` eintragen (siehe Abschnitt 4) – **nächster Schritt für dich**
- ☐ Domains: joumhome.(de/com), Domain für Joum 4D Build, WN – je 10 Jahre + Auto-Verlängerung

## 1. Konten, Domains, Marke
- ☐ Cloudflare-Konto mit Zwei-Faktor-Anmeldung
- ☐ GitHub-Konto mit Zwei-Faktor-Anmeldung
- ☐ Domains kaufen (10 Jahre, Auto-Verlängerung, Domain-Sperre/DNSSEC an)
- ☐ Marke prüfen/anmelden: DPMA/EUIPO, Namen in App Store / Google Play frei?
- ◐ Hosting der Web-Apps über Cloudflare Pages (kostenlos, DDoS-Schutz, HTTPS) – Anleitung in README
- ◐ Sicherheits-Header (`_headers`) in joum-4d-build und wn-entruempelung – ☐ auch in joumhome-test

## 2. Server-Grundlage
- ☐ Server in der EU, Betriebssystem-Updates automatisch, Firewall (nur 80/443 + SSH mit Schlüssel)
- ☐ Server hinter Cloudflare (Proxy an) – schützt vor Überlastungs-Angriffen; Ratenbegrenzung für Login/API
- ☐ Getrennte Umgebungen: Test (Staging) und Live
- ☐ Geheimnisse (API-Schlüssel, Passwörter) nur in `.env` auf dem Server, nie in GitHub
- ☐ Überwachung: Erreichbarkeit, Fehler-Protokolle, Speicherplatz, Warnung per E-Mail/Push
- ☐ Last-Test (viele gleichzeitige Nutzer) vor dem Start

## 3. Datensicherung (Entscheidung: Offline-first + Cloud-Sync)
- ◐ App speichert jede Eingabe sofort lokal, Versionen, Papierkorb 30 Tage, Export/Import (fertig in der App)
- ☐ Cloud-Sync auf EU-Server: Konflikte zwischen Geräten sauber lösen (zuletzt geändert + Versionsverlauf)
- ☐ Fotos/Grundrisse/Videos in Objektspeicher (verschlüsselt), Größenlimits
- ☐ Backups mehrmals täglich, Kopie an zweitem Standort, 30 Tage aufbewahren
- ☐ Wiederherstellung regelmäßig TESTEN (nicht nur sichern)
- ☐ Vor jeder Datenbank-Änderung bei Updates: Sicherung + Rückweg (Rollback)
- ☐ Wiederherstellung auf neuem Gerät über Konto

## 4. Benutzerkonten & Sicherheit
- ☐ Rollen: Kunde, Handwerker, Mitarbeiter, Admin
- ◐ **Anmeldung mit Google** (in der App fertig, Konto-Seite, Abmelden; prüft Empfänger/Aussteller/Ablauf des Google-Ausweises). Gilt später für ALLE Apps (Joum 4D Build, JoumHome, WN)
  - ☐ Google Cloud Console (kostenlos): Projekt „Joum“ → OAuth-Zustimmungsbildschirm (App-Name, Support-E-Mail, Logo, Datenschutz-Link) → Anmeldedaten → OAuth-Client-ID „Webanwendung“ → Autorisierte JavaScript-Quellen: `https://joum-4d-build.pages.dev` (+ später eigene Domain) → ID in `js/konfig.js` eintragen
  - ☐ Mit Server: Google-Ausweis zusätzlich auf dem Server prüfen (Signatur), dann Cloud-Sync je Konto
  - ☐ Später (wenn gewünscht): Firebase/Supabase für weitere Wege
  - ☐ Meta for Developers: Facebook-App anlegen, Prüfung durch Meta bestehen
  - ☐ Apple Developer (99 €/Jahr): „Mit Apple anmelden“ ist im App Store Pflicht, sobald Google/Facebook angeboten werden
  - ☐ SMS-Codes kosten Geld je SMS (ca. 5–10 Cent) → Limit + Schutz vor SMS-Missbrauch (Captcha/App-Check)
  - ☐ Konten verknüpfen: gleiche E-Mail bei Google und E-Mail-Link = ein Konto; später weitere Anmeldewege hinzufügen
- ☐ Freiwillige Passwörter nur gehasht (z. B. Argon2/scrypt), Mindestlänge 10, Sperre nach Fehlversuchen
- ☐ Zwei-Faktor-Anmeldung optional für Kunden, Pflicht für Admin/Handwerker
- ☐ E-Mail-Bestätigung, „Passwort vergessen“, Sitzungen mit Ablauf, Abmelden auf allen Geräten
- ☐ Gemeinsamer Login JoumHome ↔ Joum 4D Build (Kunden brauchen KEIN zusätzliches Konto bei Drittanbietern)
- ☐ Sicherheitstest vor Start (OWASP Top 10: Einschleusung, Rechte, Uploads, Sitzungen)

## 5. Datenschutz & Recht (mit Anwalt/Steuerberater)
- ☐ Impressum, Datenschutzerklärung (DE/EN/NL), AGB, Widerrufsbelehrung
- ☐ Auftragsverarbeitungs-Verträge (AVV) mit Server-, Speicher-, KI-, Zahlungs- und E-Mail-Anbietern
- ☐ Kein Tracking ohne Einwilligung; falls Analyse: datensparsam, EU
- ☐ Löschkonzept: Konto löschen = Daten löschen (außer Aufbewahrungspflichten, z. B. Rechnungen 10 Jahre)
- ☐ Treuhand, Gebühren, Umgehungsverbot in AGB, Verbraucherrecht
- ☐ Digitale Unterschrift (Nachtrag, Abnahme) rechtlich prüfen
- ☐ Steuer: § 35a-Hinweise, Änderungen ab 2027 prüfen; GoBD für Rechnungen/Belege
- ☐ Haftungsausschluss für Anleitungen/KI-Empfehlungen; Fachinhalte prüfen lassen (RAL, Dach, Bad-Abdichtung, Wasser § 12 AVBWasserV, Elektro VDE, Lüftung DIN 18017-3, Gas)
- ☐ GEG/„GModG“-Grenzwerte aktuell halten (Dämmrechner)

## 6. KI-Server (ersetzt Shorty & Co. – Kunden bleiben in DEINER App)
- ☐ KI-Schlüssel nur auf dem Server; App ruft eigenen Server auf, nie direkt den KI-Anbieter
- ☐ Grundriss-Erkennung aus Foto/PDF: Wände, Maße, Tür, Fenster, Fallrohr, Schächte → automatisch in Planer
- ☐ Handschrift in Skizzen erkennen („Licht“, „TV“, „Bild?“)
- ☐ Raum aus Foto erkennen (Maße, vorhandene Objekte), Produkt aus Foto erkennen
- ☐ Fotorealistische Bilder im gewählten Stil
- ☐ KI-Videos (Kamerafahrten durch Fotos, neue Blickwinkel) – Kosten je Video, Warteschlange
- ☐ KI muss die **Raumregeln** der App einhalten (Raum-Inventar, Tür frei, Bewegungsflächen, Lüftung, Schutzbereiche) – Ergebnis immer durch `pruefen()` prüfen lassen, bevor es angezeigt wird
- ☐ Kostenbremse: Limits je Nutzer/Tag, Abo-Stufen, Missbrauchsschutz
- ☐ Inhaltsprüfung von Uploads (keine fremden geschützten Inhalte, keine personenbezogenen Daten Dritter in Bildern veröffentlichen)

## 7. Marktplatz (Kunde ↔ Handwerker)
- ☐ Echte Handwerker-Konten (statt Beispieldaten), Prüfung: Handwerksrolle (Meisterpflicht), Gewerbe, Haftpflicht – mit Ablaufdatum/Erinnerung
- ☐ Score-Regeln fair, Einspruch möglich, Bewertungen nur nach echtem Auftrag
- ☐ Umkreis 50–70 km (Geodaten), sofort annehmen oder EIN verdecktes Gegenangebot
- ☐ Zahlung über lizenzierten Dienstleister in Etappen, Freigabe nach Abnahme, Mängel halten Geld zurück
- ☐ Umgehungsschutz: Gebühr bei Annahme, Kontakt erst danach, Chat filtert Nummern/E-Mails, App-Telefonnummer, Auffälligkeiten erkennen
- ☐ Rechnungen, Garantie, PDF-Protokolle (Nachtrag, Abnahme) im Projekt
- ☐ Benachrichtigungen: Push, E-Mail, ggf. WhatsApp Business API

## 8. Preise & Produkte
- ☐ Händlerpreise über Affiliate-Feeds/Partnerschaften (kein Scraping), Partner-Links kennzeichnen
- ☐ Preiswecker mit Benachrichtigung
- ☐ Werkzeug leihen: Verleih-Partner in der Nähe

## 9. Apps & Stores
- ☐ Native App (iOS/Android) für LiDAR-Messung, Kamera, Push – oder PWA zuerst
- ☐ Store-Einträge DE/EN/NL (Untertitel: Plan. Bau. Fertig. / Plan. Build. Done. / Plan. Bouw. Klaar.)
- ◐ Oberfläche in 24 Sprachen (Kern fertig), Großschrift/Kontrast (fertig)

## 10. Verknüpfungen
- ☐ JoumHome-Ticket → Renovierungsprojekt per Schnittstelle (heute: Direktlink `#/ticket?...`)
- ☐ Abnahme/Rechnung zurück an das Objekt in JoumHome (Anlage V, Wartungsplan, Garantien)
- ☐ WN Entrümpelung: Team-Server (`server/`) hinter Cloudflare, `.env` sicher, KI-Schlüssel nur dort

## 11. Vor dem Start (Go-Live)
- ☐ Alle Punkte oben „☑“ oder bewusst verschoben
- ☐ Backup-Wiederherstellung getestet, Last-Test bestanden, Sicherheitstest bestanden
- ☐ Rechtstexte online, AVVs unterschrieben
- ☐ Test mit echten Nutzern (Kunden + 2–3 Handwerker)
- ☐ Notfallplan: Wer macht was, wenn der Server ausfällt / Daten verloren gehen

## Ideen-Eingang (neue Ideen → hier eintragen, dann einsortieren)
- ☐ **Bauamt automatisch anschreiben** (Bauamt-Check ist fertig, heute: E-Mail öffnen/Kopieren/PDF): Server versendet die Anfrage im Namen des Nutzers (Antwort geht an seine E-Mail), Datenbank der Bauämter mit E-Mail je Landkreis/Stadt pflegen, Eingangsbestätigung im Projekt speichern. Bauantrag selbst nur über den Online-Dienst „Digitaler Bauantrag“ (EfA, 13 Länder) bzw. mit Entwurfsverfasser – später Schnittstelle (XBau) prüfen. Rechtlich klären: Haftung für Ersteinschätzung, Landesregeln jährlich aktualisieren
- ☐ **„Andere KIs fragen“** (Knopf im Studio ist fertig, wartet auf Server): Endpunkt `POST /raum-ideen` auf dem Joum-Server; Server fragt Sprach-KI (Grundriss-Ideen als JSON) und Bild-KI (Foto im Stil). Antwortformat siehe `js/stile-mehr.js`. App prüft jede Idee mit den Raumregeln, nur Bestandenes wird gezeigt. Adresse in `js/konfig.js` → `kiServer` und in `_headers` bei `connect-src` freigeben. Interior AI/RoomGPT & Co. haben meist keine offene Schnittstelle – deshalb eigene KI-Anbindung mit Lizenz (Kosten je Anfrage, Limits im Abo)
- ☐ **Treppen-Rückmeldungen lernen**: 👍/👎 und übernommene Treppen liegen in `S.lernen` → anonym an den Server, auswerten, Regeln/Vorschläge verbessern. Norm-Warnungen werden NIE automatisch abgeschaltet – nur von Fachleuten geprüft angepasst. Landesbauordnungen je Bundesland (Abweichungen z. B. Geländerhöhe) als Datenbank pflegen
- ☐ Studio: KI-Server erzeugt zusätzliche, freie Grundriss-Ideen (z. B. nach Vorbild-Video/-Bild) – Ergebnis immer durch die App-Regeln prüfen; Möbel-Modelle je Stil realistischer (Hersteller-3D-Modelle)
- ☐ **Vorbild-Bild & Skizze per KI auswerten** (geführter Start, Schritt 1): Möbel/Stil aus dem Vorbild erkennen und als Wünsche vorauswählen; Maße und Fenster/Tür aus Skizze/Foto ablesen – Ergebnis immer durch `platzieren()`/`pruefen()` (Fenster-, Tür-, Abstandsregeln) laufen lassen; danach fotorealistisches Bild der gewählten Variante
- ☐ **Bezahlte Fachfrage an Profis** (Idee 28.11.): Architekten/Handwerker haben eigene Konten, Kunde stellt Frage mit Fotos/Plan, sieht Festpreis vorher, zahlt beim Absenden; Geld wird über lizenzierten Zahlungsdienst (z. B. Stripe Connect / Mangopay, Marktplatz-Modus) vorgemerkt und erst bei Antwort ausgezahlt – Provision für Joum automatisch abgezogen, keine Antwort in X Tagen = Geld zurück. Braucht: Server, Profi-Prüfung (Kammer/Handwerksrolle), AGB, Rechnungen/Gutschriften, Steuer (USt auf Provision). Oberfläche kann vorher ohne echtes Geld gebaut werden
- ☐ Preise der Vorschläge aus Händler-Feeds statt Richtwerten
- ☐ **Volle Übersetzung** aller Anleitungen, Hinweise und Assistent-Antworten in alle 24 Sprachen (KI-Übersetzung über Server, einmal erzeugt und gespeichert; danach von Muttersprachlern prüfen lassen – besonders Sicherheitshinweise Elektro/Gas)
- ☐ **Bessere Spracherkennung & Sprachbefehle** über Server (funktioniert dann in jeder App/jedem Browser, versteht freie Sätze in allen Sprachen statt Schlüsselwörtern)
- ☐ Natürliche Stimmen für alle 24 Sprachen (Türkisch, Arabisch, Ukrainisch usw. klingen auf manchen Handys sonst roboterhaft)
- ☐ Vorlesen: heute Stimme des Geräts (kostenlos, offline). Später optional natürliche KI-Stimmen über den Server, mehrsprachig (DE/EN/NL/TR/AR …) für Menschen, die nicht lesen können; Hilfe-Texte zentral pflegen und übersetzen.
- ☐ Planungs-Assistent: freies Gespräch per KI-Sprachmodell auf dem Server (heute Regeln im Gerät). Ergebnis-Format beibehalten: Thema, Maße, Wünsche → Vorschläge; KI-Vorschläge immer durch `pruefen()` und die Raumregeln laufen lassen.
- ☐ Fotorealistische Bilder und KI-Videos aus dem 3D-Raum/Garten (3D-Bild + Stil als Vorlage an ein KI-Bild-/Videomodell). Kosten je Bild/Video, Limits im Abo; Kunden bleiben in der App (kein Konto bei Drittanbietern).
- ☐ Installationsplan als PDF für Elektriker und Sanitär (Leitungen zur Kücheninsel, Bad, Lüftung) – aus den Regeln der App erzeugt.
- ☐ Hersteller-Daten für Küchengeräte (Muldenlüfter-Maße, Abluft/Umluft-Sets, Kochfeld-Anschlusswerte) über Händler-/Hersteller-Feeds.
- ☐ Zeitaufwand (Anfänger/Fortgeschritten/Profi): Richtwerte später mit echten Zeiten aus abgeschlossenen Aufträgen verbessern (Server sammelt anonymisiert: Arbeit, Menge, Stunden). Handwerker-Angebote können den Profi-Aufwand übernehmen.

## Erledigt in der App (ohne Server)
- ☑ Offline-App mit allen Räumen, Anleitungen, 3D, 4D-Bauablauf, Kino-Tour, Vorher/Nachher-Film
- ☑ KI-Raumprüfung (Regelwerk), Wasser/Abwasser/Elektro-Planer, Teile in 3D
- ☑ Datensicherung lokal: Versionen, Papierkorb, Export/Import
- ☑ Sicherheits-Header, Router-/Scroll-Fehler behoben
- ☑ Bauamt-Check: Adresse → zuständiges Bauamt (PLZ-Suche OpenPLZ, kostenlos), 15 Vorhaben mit Ampel je Bundesland, Denkmal/WEG/Mieter-Hinweise, fertige Anfrage (E-Mail/Kopieren/PDF), Online-Dienste BY/HH/HB
- ☑ Schneller Start (1 Datei, 3D lädt bei Bedarf), neue Startseite, Möbel per Kamera (AR, Android/Chrome)
- ☑ „Bauteile erklärt“ in echtem 3D (ohne Server): Holzständerhaus + Dachstuhl, Holz mit Maserung, Schatten, Beschriftung mit Linie/Punkt, Montage, Vorlesen, Reel-Export – als Nächstes Mauerwerk, Trockenbau, Bad-Installation
- ☐ KI-Video im Stil der Reels (Start-/Endbild → Video-KI über fal.ai o. ä., ca. 0,03–0,75 $/Sek.) – Konto beim Anbieter nötig, Entscheidung offen
- ☑ Treppen-Planer nach DIN 18065/MBO: Steigung, Auftritt, Schrittmaß, Laufbreite, Kopfhöhe aus Deckenöffnung, passt in den Raum, Podest, Türen (Absatz ≥ Türbreite, keine Tür neben Stufen), KI-Vorschläge, Rückmeldungen
- ☑ 24 Einrichtungsstile + Stil-Mix (80/20, 70/30, 50/50) im Studio
- ☑ Raum-Studio für alle Innenräume: Raum antippen → 3D + 8 Stile mit eigenen Möbeln/Farben/Preisen + Grundriss-Ideen (Trennwand/Zonen, WC abgetrennt, Hauptstück frei, an einer Wand, klassisch) → direkt ändern, übernehmen, 4D-Film, Einkaufsliste
- ☑ Geführter Projektstart (jetzt im Studio aufgegangen): Foto+Zollstock / Skizze zeichnen / Skizze fotografieren / Vorbild-Bild / Maße → Maße mit Fenster → Wünsche, Stil, Budget → 3 Varianten mit Plan, Machbarkeit (Fenster/Tür/Platz), Kosten, Material, KI-Alternativen
- ☑ Sprachsteuerung: sprechen → App öffnet die Seite, Ziel-Knopf blinkt schwarz-weiß; Eintipp-Weg ohne Mikrofon
- ☑ 24 Sprachen (DE, EN, TR, AR, PL, RU, UK, RO, NL, FR, IT, ES, PT, SV, DA, NO, FI, CS, SK, HU, EL, HR, SQ, FA): Menüs, Startseite, Räume, Ansagen, Sprachbefehle; Arabisch/Persisch von rechts nach links. Neue Sprachen mit Kern-Wortschatz, Rest auf Englisch
- ☑ Bluetooth-Laser (ohne Server, kostenlos, Web Bluetooth): Leica DISTO (Bluetooth Smart) und Bosch GLM … C. Skizze → „📏 Messen“ → Wand antippen → messen → Maß steht an der Wand → „Maße übernehmen“. Auch in jedes angetippte Zahlenfeld. Nur Android/Chrome (iPhone: Apple sperrt Web Bluetooth; Ausweg Tastatur-Modus des Lasers). Header: `bluetooth=(self)`. Mit echtem Gerät noch zu testen
