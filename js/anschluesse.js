/* Joum 4D Build – Anschlüsse & Leitungen automatisch aus der Planung
   Jedes Möbel/Gerät im Entwurf bringt seine Anschlüsse mit: Strom (230 V / 400 V), Wasser warm/kalt, Abwasser (DN),
   Lüftung, Netzwerk/TV im Leerrohr. Kücheninsel: Kochinsel / Spülinsel / ohne Anschlüsse → Leitungen im Boden.
   Raum ohne Fenster → Lüftung Pflicht (Bad/WC nach DIN 18017-3, Küche Umluft). Später füllt der KI-Server
   dieselbe Liste aus einem Foto – die Regeln hier bleiben die Prüfung. Hinweise ohne Gewähr, Ausführung Fachbetrieb. */

const ANSCHLUSS_REGELN = [
  [/Fernseher|TV-Wand|Medienwand|Beamer|Leinwand/, [['strom', 'Steckdose 2-fach hinter dem TV (ca. 1,10–1,20 m) + 2-fach unten am Lowboard'], ['tv', 'Leerrohr M25 von TV zu Lowboard für HDMI/Antenne – keine Kabel sichtbar'], ['lan', 'Netzwerkdose (LAN) am Lowboard']]],
  [/Lowboard|TV-Board/, [['strom', '2–3 Steckdosen hinter dem Board (Receiver, Konsole, Router)']]],
  [/Soundbar/, [['strom', 'Steckdose in Reichweite – Kabel im Leerrohr zum TV']]],
  [/Kochfeld|Herd/, [['400v', 'Herdanschlussdose 400 V Drehstrom (3 × 16 A), eigener Stromkreis']]],
  [/Backofen/, [['strom', 'eigener Stromkreis 16 A']]],
  [/Spüle/, [['wasser', 'Kalt- und Warmwasser (Eckventile)'], ['abwasser', 'Abwasser DN 50 mit Gefälle']]],
  [/Geschirrspüler/, [['wasser', 'Kaltwasser (Aquastop)'], ['abwasser', 'Abwasser über Siphon der Spüle'], ['strom', 'eigener Stromkreis 16 A']]],
  [/Kühlschrank|Kühl-Gefrier|Weinkühl|Getränke-Kühlschrank/, [['strom', 'Steckdose hinter dem Gerät, nicht auf Mehrfachsteckdose']]],
  [/Dunstabzug|Inselhaube|Muldenlüfter/, [['luft', 'Abluft nach draußen (Mauerkasten) ODER Umluft mit Aktivkohle – bei Abluft + Kamin/Ofen Fensterkontakt nötig'], ['strom', 'Steckdose/Anschluss über dem Kochfeld bzw. im Unterschrank']]],
  [/Mikrowelle|Kaffee/, [['strom', 'Steckdose über der Arbeitsplatte']]],
  [/Dusch-WC/, [['abwasser', 'Abwasser DN 100 (Vorwand), Spülkasten-Zulauf'], ['wasser', 'Kaltwasser'], ['strom', 'Steckdose hinter der Vorwand für das Dusch-WC']]],
  [/^WC/, [['abwasser', 'Abwasser DN 100 (Vorwand), Spülkasten-Zulauf'], ['wasser', 'Kaltwasser'], ['strom', 'Tipp: Leerrohr + Steckdose in die Vorwand – für ein späteres Dusch-WC']]],
  [/Waschtisch|Handwaschbecken|Ausgussbecken/, [['wasser', 'Kalt- und Warmwasser (Eckventile)'], ['abwasser', 'Abwasser DN 40/50']]],
  [/Dusche|Walk-in/, [['wasser', 'Kalt- und Warmwasser (Unterputz-Armatur)'], ['abwasser', 'Bodenablauf/Rinne DN 50, Gefälle ca. 2 %, Abdichtung']]],
  [/Badewanne/, [['wasser', 'Kalt- und Warmwasser'], ['abwasser', 'Ab- und Überlauf DN 50']]],
  [/Waschmaschine|Wasch-Trocken-Turm|Waschtrockner|Waschmaschine \+ Trockner/, [['wasser', 'Kaltwasser mit Geräteventil, Aquastop'], ['abwasser', 'Abwasser DN 50 (Siphon/HT-Rohr)'], ['strom', 'eigener Stromkreis 16 A, FI-Schutz']]],
  [/Trockner/, [['strom', 'Steckdose, eigener Stromkreis empfohlen'], ['luft', 'Ablufttrockner: Abluft nach draußen – sonst Kondens-/Wärmepumpentrockner']]],
  [/Handtuchheizkörper/, [['strom', 'Anschlussdose (Elektro) oder Heizungsanschluss']]],
  [/Spiegelschrank|Spiegel mit Licht/, [['strom', 'Anschluss für Licht/Steckdose (Schutzbereiche beachten)']]],
  [/Schreibtisch/, [['strom', '2–3 Steckdosen auf Tischhöhe oder Bodentank'], ['lan', 'Netzwerkdose (LAN)']]],
  [/Doppelbett|Bett|Boxspring|Polsterbett/, [['strom', 'Steckdose + USB je Bettseite, Lichtschalter am Bett (Wechselschaltung)']]],
  [/Nachttisch/, [['strom', 'Steckdose neben dem Nachttisch']]],
  [/Laufband|Sauna|Kraftstation|Ergometer|Spinning|Crosstrainer/, [['strom', 'eigene Steckdose; Sauna: 400 V durch Elektriker']]],
  [/Wallbox/, [['400v', '400 V Zuleitung, Anmeldung beim Netzbetreiber (über 11 kW genehmigungspflichtig)']]],
  [/Elektrokamin|Stehleuchte|Bogenleuchte|Lichterkette/, [['strom', 'Steckdose in der Nähe – oder schaltbare Steckdose für Stimmungslicht']]],
  [/Pendelleuchte/, [['licht', 'Deckenauslass genau über Tisch/Insel planen']]],
  [/Spots|Einbaustrahler/, [['licht', 'Einbaudosen in der Decke (abgehängt oder Betondose)']]],
  [/Indirektes Licht|LED-Profil/, [['licht', 'Trafo-Platz + Zuleitung in der Decke/Wand']]]
];
const ANSCHLUSS_ART = { strom: ['⚡', 'Strom 230 V'], '400v': ['⚡', 'Starkstrom 400 V'], wasser: ['💧', 'Wasser'], abwasser: ['⤓', 'Abwasser'], luft: ['🌬', 'Lüftung'], tv: ['📺', 'TV / Leerrohr'], lan: ['🔌', 'Netzwerk'], licht: ['💡', 'Licht'] };
const INSEL_TYPEN = [['ohne', 'Insel ohne Geräte', 'Nur Arbeitsfläche/Theke'], ['koch', 'Kochinsel', 'Kochfeld in der Insel'], ['spuel', 'Spülinsel', 'Spüle + Geschirrspüler in der Insel']];
function anschluesse(o, plan) {
  const L = losStatus(o), liste = [], nass = ['bad', 'gaestewc'].includes(o.raum), fenster = o.fenster !== false && (o.fensterPos || o.fenster === true);
  const add = (n, art, t, boden) => liste.push({ n, art, t, boden });
  const namen = [...new Set(plan.filter((e) => !e.gruppe).map((e) => e.n))];
  namen.forEach((n) => { const r = ANSCHLUSS_REGELN.find(([re]) => re.test(n)); if (r) r[1].forEach(([a, t]) => add(n, a, t)); });
  // Kücheninsel / Halbinsel
  const insel = namen.find((n) => /Kücheninsel|Halbinsel|Insel/.test(n));
  if (insel) {
    const typ = L.inselTyp || 'ohne';
    if (typ === 'koch') { add(insel, '400v', 'Herdanschluss 400 V im Boden zur Insel (Leerrohr im Estrich oder Bodenkanal)', true); add(insel, 'luft', 'Muldenlüfter (Abzug nach unten) oder Inselhaube – Abluftkanal im Sockel/Boden bzw. in der Decke, sonst Umluft', true); add(insel, 'strom', 'Steckdosen an der Insel (Pflicht für Arbeitsfläche)', true); }
    else if (typ === 'spuel') { add(insel, 'wasser', 'Kalt- und Warmwasser im Boden zur Insel', true); add(insel, 'abwasser', 'Abwasser DN 50 im Estrich mit Gefälle (mind. 1 %) – oft Hebeanlage nötig, wenn zu weit vom Fallrohr', true); add(insel, 'strom', 'Geschirrspüler 16 A + Steckdosen an der Insel', true); }
    else add(insel, 'strom', 'Bodentank/Steckdose an der Insel empfohlen (Mixer, Laptop)', true);
  }
  // Lüftung ohne Fenster
  if (!fenster && nass && !namen.some((n) => /Lüfter/.test(n))) add('Raum', 'luft', 'Kein Fenster: Badlüfter nach DIN 18017-3 Pflicht (Abluft über Dach/Schacht, Nachlauf, Feuchtesensor) – sonst Schimmel', false);
  if (!fenster && o.raum === 'kueche') add('Raum', 'luft', 'Küche ohne Fenster: Umluft-Dunstabzug + Wohnungslüftung/Abluftanlage einplanen', false);
  if (!fenster && ['waschraum', 'keller'].includes(o.raum) && namen.some((n) => /Trockner|Waschmaschine/.test(n))) add('Raum', 'luft', 'Wäsche ohne Fenster: Lüfter oder Wärmepumpentrockner, sonst zu feucht', false);
  if (['schlafzimmer', 'kinderzimmer', 'babyzimmer', 'jugendzimmer', 'gaestezimmer', 'flur'].includes(o.raum)) add('Raum', 'strom', 'Rauchmelder Pflicht (in allen Bundesländern)', false);
  return liste;
}
function anschlussKarte(o, d, v) {
  if (!v) return '';
  const A = anschluesse(o, v.plan), L = losStatus(o), insel = v.plan.some((e) => /Kücheninsel|Halbinsel|Insel/.test(e.n));
  const arten = [...new Set(A.map((a) => a.art))];
  return `<section class="karte" id="anschluss-karte"><h3>Anschlüsse & Leitungen</h3>
    <p class="klein grau">Automatisch aus deiner Planung – damit vor dem Einrichten die Leitungen in die Wand kommen und keine Kabel herumhängen.</p>
    ${insel ? `<div class="unter">Was für eine Insel?</div><div class="gsel drei">${INSEL_TYPEN.map(([k, t, u]) => `<button data-akt="inselTyp" ${d} data-t="${k}" aria-pressed="${(L.inselTyp || 'ohne') === k}"><b>${t}</b><small>${u}</small></button>`).join('')}</div>` : ''}
    <div class="ans-zusammen">${arten.map((a) => `<span class="ans-chip ans-${a}">${ANSCHLUSS_ART[a][0]} ${ANSCHLUSS_ART[a][1]} · ${A.filter((x) => x.art === a).length}</span>`).join('')}</div>
    <ul class="ans-liste">${A.map((a) => `<li class="ans-${a.art}"><span>${ANSCHLUSS_ART[a.art][0]}</span><div><b>${esc(a.n)}</b>${a.boden ? ' <em>im Boden</em>' : ''}<br><span class="klein">${esc(a.t)}</span></div></li>`).join('') || '<li class="klein">Keine besonderen Anschlüsse nötig.</li>'}</ul>
    <a class="btn hell voll" href="#/installation?raum=${esc(o.raum)}">Leitungen im Detail planen (Rohre, Gefälle, Kabel)</a>
    <p class="klein grau">Elektro, Gas und Wasser nur durch Fachbetrieb anschließen lassen. Später erkennt der KI-Server Anschlüsse auch direkt auf einem Foto – die App prüft sie mit denselben Regeln.</p>
  </section>`;
}
AKT.inselTyp = (d) => aendern(() => { losStatus(studioObj(d)).inselTyp = d.t; }, 'Inseltyp');
HILFE.inselTyp = 'Kochinsel oder Spülinsel brauchen Leitungen im Boden – das muss vor dem Estrich geplant werden.';
