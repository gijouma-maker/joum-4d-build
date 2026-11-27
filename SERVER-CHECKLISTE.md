# Server-Checkliste – Joum 4D Build (und JoumHome, WN Entrümpelung)

> **Für Claude:** Diese Liste vor JEDEM Server-Schritt durchgehen, offene Punkte aktiv ansprechen, fehlende Entscheidungen erfragen und neue Ideen/Funktionen hier eintragen. Nach dem Start: neue Funktionen erneut auf Server-Bedarf prüfen.
>
> Stand: 27.11.2026 · Legende: ☐ offen · ◐ vorbereitet · ☑ erledigt

## 0. Entscheidungen, die noch von dir kommen müssen
- ☐ Server-Anbieter in der EU (z. B. deutscher Anbieter mit Rechenzentrum in DE) – Größe/Kosten
- ☐ Zahlungsdienstleister für Treuhand/Etappenzahlung (muss lizenziert sein – Treuhand nicht selbst „verwahren“)
- ☐ Preismodell: Abo für Kunden? Gebühr je Auftrag für Handwerker? „Eigene Kunden“-Abo?
- ☐ KI-Kosten: wie viele KI-Bilder/Videos/Erkennungen pro Nutzer frei, was im Abo?
- ☐ Sprachen beim Start: App hat jetzt DE, EN, TR, AR, PL, RU, UK, RO – fehlt Niederländisch (NL)? Welche Sprachen sollen Rechtstexte und Store-Einträge bekommen?
- ☐ Ein Konto für alle Apps (JoumHome + Joum 4D Build + später weitere)? → empfohlen: ja, gemeinsamer Login
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
- ☐ Passwörter nur gehasht (z. B. Argon2/scrypt), Mindestlänge, Sperre nach Fehlversuchen
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
- ☐ Oberfläche mehrsprachig (EN/NL), Großschrift/Kontrast (fertig)

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
- ☐ **Volle Übersetzung** aller Anleitungen, Hinweise und Assistent-Antworten in die 8 Sprachen (KI-Übersetzung über Server, einmal erzeugt und gespeichert; danach von Muttersprachlern prüfen lassen – besonders Sicherheitshinweise Elektro/Gas)
- ☐ **Bessere Spracherkennung & Sprachbefehle** über Server (funktioniert dann in jeder App/jedem Browser, versteht freie Sätze in allen Sprachen statt Schlüsselwörtern)
- ☐ Natürliche Stimmen für alle 8 Sprachen (Türkisch, Arabisch, Ukrainisch usw. klingen auf manchen Handys sonst roboterhaft)
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
- ☑ Sprachsteuerung: sprechen → App öffnet die Seite, Ziel-Knopf blinkt schwarz-weiß; Eintipp-Weg ohne Mikrofon
- ☑ 8 Sprachen (DE, EN, TR, AR, PL, RU, UK, RO): Menüs, Startseite, Räume, Ansagen, Sprachbefehle; Arabisch von rechts nach links
