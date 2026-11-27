/* Joum 4D Build – Wasser, Abwasser & Elektro
   Richtwerte nach DIN EN 12056 / DIN 1986-100 (Abwasser), DIN 18015-3 (Elektro-Installationszonen).
   Allgemeine Hinweise – Planung und Ausführung im Zweifel durch Fachbetrieb. */

/* Sanitärobjekte: DN Anschluss, DU (Anschlusswert l/s), Höhen über fertigem Fußboden */
const SAN_OBJEKTE = [
  { id: 'waschtisch', n: 'Waschtisch', dn: 40, du: 0.5, ab: '55–60 cm', kw: 'Eckventile kalt/warm ca. 55 cm, 10 cm links/rechts der Mitte', siphon: 'Röhren- oder Flaschensiphon 1¼"' },
  { id: 'handwaschbecken', n: 'Handwaschbecken', dn: 40, du: 0.3, ab: '55 cm', kw: 'Eckventil ca. 50–55 cm', siphon: 'Siphon 1¼"' },
  { id: 'wc', n: 'WC wandhängend', dn: 100, du: 2.0, ab: 'Achse ca. 23 cm (Vorwandelement)', kw: 'Spülkasten im Vorwandelement (Eckventil im Element)', siphon: 'im WC (Geruchsverschluss integriert), Anschluss mit WC-Anschlussbogen 90°' },
  { id: 'dusche', n: 'Dusche bodengleich', dn: 50, du: 0.6, ab: 'im Boden (Bodenablauf/Rinne, Aufbauhöhe prüfen!)', kw: 'Armatur ca. 105–115 cm, Kopfbrause ca. 210 cm', siphon: 'im Ablauf/Rinne, Sperrwasserhöhe min. 50 mm' },
  { id: 'wanne', n: 'Badewanne', dn: 50, du: 0.8, ab: 'Ab- und Überlaufgarnitur, ca. 10 cm über Boden', kw: 'Armatur ca. 15–20 cm über Wannenrand (ca. 70–75 cm)', siphon: 'Ab-/Überlaufgarnitur mit Geruchsverschluss' },
  { id: 'spuele', n: 'Küchenspüle', dn: 50, du: 0.8, ab: '45–50 cm', kw: 'Eckventile ca. 50–55 cm', siphon: 'Spülensiphon mit Geräteanschluss' },
  { id: 'gs', n: 'Geschirrspüler', dn: 40, du: 0.8, ab: 'über Geräteanschluss am Spülensiphon', kw: 'Geräteventil ¾" (oft am Eckventil der Spüle)', siphon: 'Schlauch mit Schlaufe über Siphonhöhe (Rückfluss)' },
  { id: 'wm', n: 'Waschmaschine', dn: 50, du: 0.8, ab: 'Wand-Siphon ca. 60–90 cm', kw: 'Waschmaschinenhahn ¾" mit Rückflussverhinderer ca. 100–110 cm', siphon: 'Geräte-Siphon mit Rückschlagklappe' },
  { id: 'bodenablauf', n: 'Bodenablauf', dn: 50, du: 0.8, ab: 'im Boden', kw: '–', siphon: 'Geruchsverschluss im Ablauf, ggf. Rückstauverschluss im Keller' }
];

/* Werkzeug & Equipment: [Name, wofür, kaufen|leihen, Richtpreis] */
const WERKZEUG = {
  abwasser: [['HT-Rohrabschneider oder feine Säge', 'Rohre gerade ablängen', 'kaufen', 'ca. 10–25 €'], ['Entgrater / Feile', 'Schnittkante entgraten und 15° anfasen', 'kaufen', 'ca. 5–10 €'], ['Gleitmittel', 'Muffen montieren', 'kaufen', 'ca. 5 €'], ['Wasserwaage mit Gefälle-Libelle / Laser', 'Gefälle prüfen', 'kaufen', 'ca. 20–60 €'], ['Kernbohrgerät', 'Durchbrüche durch Wand/Decke (Statik!)', 'leihen', 'ca. 50–90 €/Tag'], ['Rohrkamera', 'Bestandsleitungen prüfen', 'leihen', 'ca. 40–80 €/Tag'], ['Bohrhammer / Stemmhammer', 'Schlitze, Durchbrüche', 'leihen', 'ca. 30–60 €/Tag']],
  wasser: [['Presszange für Mehrschichtverbund (passende Kontur)', 'Pressfittings verpressen', 'leihen', 'ca. 25–50 €/Tag'], ['Rohrschere / Kalibrierwerkzeug', 'Verbundrohr schneiden und kalibrieren', 'kaufen', 'ca. 20–40 €'], ['Biegefeder', 'Rohr ohne Knick biegen', 'kaufen', 'ca. 10 €'], ['Druckprüfpumpe', 'Dichtheitsprüfung', 'leihen', 'ca. 20–40 €/Tag'], ['Hanf + Dichtpaste oder Dichtfaden', 'Gewinde abdichten', 'kaufen', 'ca. 8 €']],
  elektro: [['Zweipoliger Spannungsprüfer', 'Spannungsfreiheit feststellen (Pflicht!)', 'kaufen', 'ca. 20–50 €'], ['Leitungssucher', 'vor dem Bohren/Schlitzen', 'kaufen', 'ca. 20–60 €'], ['Mauernutfräse mit Absaugung', 'Kabelschlitze', 'leihen', 'ca. 40–70 €/Tag'], ['Dosenbohrkrone 68 mm', 'Unterputzdosen setzen', 'kaufen', 'ca. 20–40 €'], ['Abisolierzange', 'Adern abisolieren', 'kaufen', 'ca. 15–30 €'], ['Bau-/Industriesauger Staubklasse M', 'Staub beim Fräsen', 'leihen', 'ca. 20–35 €/Tag']]
};

function linkKaufen(n) { return 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(n); }
function linkLeihen(n) { return 'https://www.google.com/maps/search/' + encodeURIComponent('Werkzeugverleih ' + n.split(' ')[0]); }
function linkVideo(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

/* ---------- Zustand (im Speicher S.inst) ---------- */
function inst() {
  if (!S.inst) S.inst = { objekte: [{ typ: 'waschtisch', l: 1.5, boegen: 1 }, { typ: 'wc', l: 1.0, boegen: 0 }], punkte: [{ typ: 'steckdose', anz: 2, weg: 4 }, { typ: 'schalter', anz: 1, weg: 3 }, { typ: 'licht', anz: 1, weg: 3 }], raumhoehe: 2.5, tab: 'abwasser' };
  return S.inst;
}
AKT.iTab = (d) => { inst().tab = d.t; speichern(); render(); };
AKT.iObjPlus = (d) => aendern(() => inst().objekte.push({ typ: d.typ, l: 1.5, boegen: 1 }));
AKT.iObjWeg = (d) => aendern(() => inst().objekte.splice(+d.i, 1));
EIN.iObj = (v, d) => aendern(() => { inst().objekte[+d.i][d.k] = parseZahl(v); });
AKT.iPktPlus = (d) => aendern(() => inst().punkte.push({ typ: d.typ, anz: 1, weg: 4 }));
AKT.iPktWeg = (d) => aendern(() => inst().punkte.splice(+d.i, 1));
EIN.iPkt = (v, d) => aendern(() => { inst().punkte[+d.i][d.k] = parseZahl(v); });
EIN.iRh = (v) => aendern(() => { inst().raumhoehe = parseZahl(v); });

/* ---------- Berechnung Abwasser ---------- */
function abwasserPlan() {
  const I = inst();
  const zeilen = I.objekte.map((o) => {
    const obj = SAN_OBJEKTE.find((x) => x.id === o.typ);
    const hoehe = o.l * 0.02;
    const warn = [];
    if (o.l > 4) warn.push('Länge über 4 m: Leitung belüften (Rohrbelüfter) oder eine Nennweite größer – Fachbetrieb fragen.');
    if (o.boegen > 3) warn.push('Mehr als 3 Richtungsänderungen: zu viel – Leitung neu führen oder belüften.');
    if (hoehe > 1) warn.push('Höhenunterschied über 1 m – Leitung muss belüftet werden.');
    return { o, obj, hoehe, warn };
  });
  const sumDu = zeilen.reduce((s, z) => s + z.obj.du, 0);
  const mitWc = I.objekte.some((o) => o.typ === 'wc');
  const sammelDn = mitWc ? 100 : sumDu <= 1.5 ? 50 : 70;
  // Material
  const mat = {};
  const add = (n, m, e) => { if (!m) return; mat[n] = mat[n] || { m: 0, e }; mat[n].m += m; };
  zeilen.forEach(({ o, obj }) => {
    add(`HT-Rohr DN ${obj.dn}`, Math.ceil(o.l * 1.1 * 2) / 2, 'm');
    add(`HT-Bogen DN ${obj.dn} 45°`, o.boegen * 2, 'Stück');
    add(`Rohrschelle mit Gummieinlage DN ${obj.dn}`, Math.ceil(o.l / 0.75) + 1, 'Stück');
    if (o.typ === 'wc') add('WC-Anschlussgarnitur DN 90/100', 1, 'Stück');
    else if (o.typ !== 'gs') add(`Siphon für ${obj.n}`, 1, 'Stück');
  });
  if (I.objekte.length > 1) add(`HT-Abzweig 45° DN ${sammelDn}`, I.objekte.length - 1, 'Stück');
  add('Gleitmittel', 1, 'Dose');
  return { zeilen, sumDu, sammelDn, mitWc, mat };
}

/* ---------- Berechnung Elektro ---------- */
const E_PUNKTE = {
  steckdose: { n: 'Steckdose', h: 0.3, kabel: 'NYM-J 3×1,5 mm² (B16, FI 30 mA)' },
  steckdose_ap: { n: 'Steckdose über Arbeitsplatte', h: 1.15, kabel: 'NYM-J 3×2,5 mm² (Küche)' },
  schalter: { n: 'Lichtschalter', h: 1.05, kabel: 'NYM-J 3×1,5 mm² (Wechselschaltung 5×1,5)' },
  licht: { n: 'Deckenauslass Licht', h: null, kabel: 'NYM-J 3×1,5 mm²' },
  herd: { n: 'Herdanschluss', h: 0.6, kabel: 'NYM-J 5×2,5 mm² (3-polig B16, eigener Stromkreis)' },
  geraet: { n: 'Geräteanschluss (WM, Trockner, GS)', h: 0.3, kabel: 'NYM-J 3×2,5 mm² (eigener Stromkreis)' },
  lan: { n: 'Netzwerkdose', h: 0.3, kabel: 'Cat.7-Verlegekabel im Leerrohr M25' }
};
function elektroPlan() {
  const I = inst(), rh = I.raumhoehe || 2.5, zoneOben = 0.3;
  const zeilen = I.punkte.map((p) => {
    const e = E_PUNKTE[p.typ];
    const senkrecht = e.h == null ? 0.1 : rh - zoneOben - e.h;
    const je = p.weg + Math.max(0, senkrecht) + 0.3; // + Anschlussreserve in der Dose
    return { p, e, je, gesamt: je * p.anz };
  });
  const kabel = {};
  zeilen.forEach((z) => { const k = z.e.kabel.split(' (')[0]; kabel[k] = (kabel[k] || 0) + z.gesamt; });
  const dosen = I.punkte.reduce((s, p) => s + (p.typ === 'licht' ? 0 : p.anz), 0);
  return { zeilen, kabel, dosen, rh };
}

AKT.iInListe = (d) => {
  const plan = d.was === 'abwasser' ? abwasserPlan().mat : null;
  aendern((s) => {
    if (plan) Object.entries(plan).forEach(([n, x]) => s.einkauf.push({ id: uid(), n, menge: x.m, einheit: x.e, hinweis: 'Abwasser-Planer', erledigt: false }));
    else {
      const e = elektroPlan();
      Object.entries(e.kabel).forEach(([n, m]) => s.einkauf.push({ id: uid(), n, menge: Math.ceil(m * 1.15), einheit: 'm', hinweis: 'inkl. 15 % Reserve', erledigt: false }));
      s.einkauf.push({ id: uid(), n: 'Unterputz-/Hohlwanddose 68 mm', menge: e.dosen, einheit: 'Stück', hinweis: '', erledigt: false });
      s.einkauf.push({ id: uid(), n: 'Gips / Nagelschellen zur Kabelbefestigung', menge: 1, einheit: 'Pack', hinweis: 'alle ca. 30 cm fixieren', erledigt: false });
    }
  }, 'Installation → Einkauf');
  toast('In die Einkaufsliste übernommen');
};

/* ---------- Animationen (SVG) ---------- */
function svgGefaelle() {
  return `<svg viewBox="0 0 360 150" width="100%" role="img" aria-label="Abwasserrohr mit 2 Prozent Gefälle, Wasser fließt zur Fallleitung">
    <line x1="20" y1="40" x2="300" y2="80" stroke="#7a7a7a" stroke-width="22" stroke-linecap="round"/>
    <line x1="20" y1="40" x2="300" y2="80" stroke="#7ab8ff" stroke-width="8" stroke-dasharray="10 14" class="fluss"/>
    <rect x="300" y="20" width="26" height="125" fill="#7a7a7a"/><text x="313" y="14" text-anchor="middle" font-size="11" fill="#a8a8a8">Fallrohr DN 100</text>
    <line x1="20" y1="110" x2="300" y2="110" stroke="#555" stroke-dasharray="4 4"/><line x1="300" y1="80" x2="300" y2="110" stroke="#ffd27a" stroke-width="2"/>
    <text x="150" y="130" text-anchor="middle" font-size="12" fill="#ffd27a">2 % Gefälle = 2 cm Höhe je 1 m Rohr</text>
    <text x="22" y="22" font-size="11" fill="#a8a8a8">Objekt</text></svg>`;
}
function svgBoegen() {
  return `<svg viewBox="0 0 360 170" width="100%" role="img" aria-label="Richtungsänderung: falsch ein 90-Grad-Bogen, richtig zwei 45-Grad-Bögen">
    <g><text x="90" y="16" text-anchor="middle" font-size="12" fill="#ff8a7a">Falsch: 90° in liegender Leitung</text>
      <path d="M20 50 H110 V140" fill="none" stroke="#7a7a7a" stroke-width="18"/>
      <path d="M20 50 H110 V140" fill="none" stroke="#7ab8ff" stroke-width="6" stroke-dasharray="8 10" class="fluss langsam"/>
      <circle cx="110" cy="50" r="16" fill="none" stroke="#ff8a7a" stroke-width="3"/><text x="140" y="70" font-size="11" fill="#ff8a7a">Stau, Ablagerung</text></g>
    <g transform="translate(185 0)"><text x="85" y="16" text-anchor="middle" font-size="12" fill="#9fd69f">Richtig: 2 × 45° Bogen</text>
      <path d="M10 50 H70 L110 90 V140" fill="none" stroke="#7a7a7a" stroke-width="18" stroke-linejoin="round"/>
      <path d="M10 50 H70 L110 90 V140" fill="none" stroke="#7ab8ff" stroke-width="6" stroke-dasharray="8 10" stroke-linejoin="round" class="fluss"/>
      <text x="76" y="44" font-size="10" fill="#9fd69f">45°</text><text x="118" y="92" font-size="10" fill="#9fd69f">45°</text>
      <text x="40" y="160" font-size="10" fill="#a8a8a8">mit kurzem Zwischenstück</text></g></svg>`;
}
function svgAbzweig() {
  return `<svg viewBox="0 0 360 130" width="100%" role="img" aria-label="Abzweig: falsch T-Stück 87 Grad liegend, richtig Abzweig 45 Grad">
    <g><text x="85" y="16" text-anchor="middle" font-size="12" fill="#ff8a7a">Falsch: T-Stück 87° liegend</text>
      <path d="M10 90 H170 M90 30 V90" fill="none" stroke="#7a7a7a" stroke-width="16"/>
      <path d="M90 30 V90" stroke="#7ab8ff" stroke-width="5" stroke-dasharray="7 9" class="fluss"/><path d="M10 90 H170" stroke="#7ab8ff" stroke-width="5" stroke-dasharray="7 9" class="fluss"/>
      <text x="100" y="118" font-size="10" fill="#ff8a7a">Rückstau in Zulauf</text></g>
    <g transform="translate(185 0)"><text x="85" y="16" text-anchor="middle" font-size="12" fill="#9fd69f">Richtig: Abzweig 45°</text>
      <path d="M10 90 H170 M40 40 L90 90" fill="none" stroke="#7a7a7a" stroke-width="16"/>
      <path d="M40 40 L90 90 H170" fill="none" stroke="#7ab8ff" stroke-width="5" stroke-dasharray="7 9" class="fluss"/>
      <text x="60" y="118" font-size="10" fill="#9fd69f">in Fließrichtung einmünden</text></g></svg>`;
}
function svgBadWand() {
  return `<svg viewBox="0 0 360 230" width="100%" role="img" aria-label="Bad-Wand mit Anschlusshöhen für Waschtisch, WC und Dusche">
    <rect x="0" y="0" width="360" height="200" fill="#151515"/><rect x="0" y="200" width="360" height="30" fill="#2a2a2a"/><text x="350" y="220" text-anchor="end" font-size="10" fill="#a8a8a8">fertiger Fußboden (FFB)</text>
    <rect x="20" y="105" width="90" height="16" rx="4" fill="#e9e9e9"/><text x="65" y="98" text-anchor="middle" font-size="11" fill="#fff">Waschtisch</text>
    <circle cx="55" cy="146" r="5" fill="#7ab8ff"/><circle cx="75" cy="146" r="5" fill="#ff8a7a"/><circle cx="65" cy="140" r="7" fill="#999"/>
    <line x1="115" y1="140" x2="115" y2="200" stroke="#ffd27a"/><text x="119" y="175" font-size="10" fill="#ffd27a">55 cm</text>
    <rect x="160" y="40" width="70" height="80" rx="4" fill="#232323" stroke="#444"/><text x="195" y="35" text-anchor="middle" font-size="10" fill="#a8a8a8">Vorwand</text>
    <path d="M170 140 h50 v18 a22 22 0 0 1 -22 22 h-6 a22 22 0 0 1 -22 -22z" fill="#e9e9e9"/><text x="195" y="133" text-anchor="middle" font-size="11" fill="#fff">WC</text>
    <circle cx="195" cy="177" r="6" fill="#999"/><line x1="235" y1="177" x2="235" y2="200" stroke="#ffd27a"/><text x="239" y="193" font-size="10" fill="#ffd27a">Achse 23 cm</text>
    <rect x="280" y="40" width="10" height="10" fill="#9fd69f"/><text x="300" y="30" font-size="10" fill="#a8a8a8">Brause 210</text>
    <rect x="290" y="80" width="40" height="14" rx="3" fill="#e9e9e9"/><text x="310" y="74" text-anchor="middle" font-size="10" fill="#fff">Dusch-Armatur</text>
    <line x1="340" y1="87" x2="340" y2="200" stroke="#ffd27a"/><text x="336" y="150" text-anchor="end" font-size="10" fill="#ffd27a">105–115</text>
    <circle cx="55" cy="146" r="5" fill="#7ab8ff"/></svg>`;
}
function svgZonen(rh) {
  return `<svg viewBox="0 0 360 250" width="100%" role="img" aria-label="Elektro-Installationszonen an der Wand">
    <rect x="0" y="0" width="360" height="230" fill="#151515"/>
    <rect x="0" y="12" width="360" height="27" fill="#ffd27a" opacity=".22"/><text x="6" y="30" font-size="10" fill="#ffd27a">Zone oben: 15–45 cm unter Decke</text>
    <rect x="0" y="176" width="360" height="27" fill="#ffd27a" opacity=".22"/><text x="6" y="194" font-size="10" fill="#ffd27a">Zone unten: 15–45 cm über FFB</text>
    <rect x="0" y="113" width="360" height="27" fill="#7ab8ff" opacity=".18"/><text x="6" y="130" font-size="10" fill="#7ab8ff">Zone Mitte 90–120 cm (nur über Arbeitsflächen)</text>
    <rect x="150" y="60" width="60" height="170" fill="#2a2a2a" stroke="#555"/><text x="180" y="150" text-anchor="middle" font-size="10" fill="#a8a8a8">Tür</text>
    <rect x="215" y="0" width="18" height="230" fill="#9fd69f" opacity=".18"/><rect x="127" y="0" width="18" height="230" fill="#9fd69f" opacity=".18"/><text x="236" y="80" font-size="10" fill="#9fd69f">10–30 cm neben Tür/Ecke</text>
    <path d="M224 25 V120" stroke="#fff" stroke-width="2" class="kabel"/><rect x="218" y="118" width="12" height="12" rx="2" fill="#e9e9e9"/><text x="234" y="128" font-size="10" fill="#fff">Schalter 105 cm</text>
    <path d="M233 25 H320 V185" stroke="#fff" stroke-width="2" class="kabel"/><rect x="314" y="183" width="12" height="12" rx="2" fill="#e9e9e9"/><text x="300" y="215" text-anchor="end" font-size="10" fill="#fff">Steckdose 30 cm</text>
    <text x="355" y="246" text-anchor="end" font-size="10" fill="#a8a8a8">Kabel nur senkrecht/waagerecht in den Zonen – nie schräg</text></svg>`;
}

/* ---------- Bildschirm ---------- */
route('installation', (_, q) => {
  const I = inst();
  if (q.tab && render.letzte !== location.hash) I.tab = q.tab;
  const tabs = [['abwasser', 'Abwasser'], ['wasser', 'Trinkwasser'], ['elektro', 'Elektro'], ['werkzeug', 'Werkzeug']];
  const zurueck = q.raum ? '#/raum/' + q.raum : '#/mehr';
  let x = '';
  if (I.tab === 'abwasser') {
    const p = abwasserPlan();
    x = `<div class="anim">${svgGefaelle()}</div>
      <h3>Deine Objekte → Fallleitung</h3>
      <p class="klein">Je Objekt: Leitungslänge bis zur Fallleitung bzw. Sammelleitung und Anzahl Richtungsänderungen.</p>
      ${p.zeilen.map(({ o, obj, hoehe, warn }, i) => `<div class="karte"><div class="zeile"><b style="flex:1">${esc(obj.n)}</b><span class="badge gelb">DN ${obj.dn}</span><button class="x" aria-label="Entfernen" data-akt="iObjWeg" data-i="${i}">×</button></div>
        <div class="raster2"><label class="feld">Länge (m)<input inputmode="decimal" value="${zahl(o.l)}" data-ein="iObj" data-i="${i}" data-k="l"></label><label class="feld">Richtungsänderungen<input inputmode="numeric" value="${o.boegen}" data-ein="iObj" data-i="${i}" data-k="boegen"></label></div>
        <div class="klein">Gefälle 2 % → Höhenunterschied <b>${zahl(hoehe * 100, 1)} cm</b> · Bögen: ${o.boegen ? o.boegen + ' × 2 Stück 45°' : 'keine'} · Abfluss-Höhe ${esc(obj.ab)}</div>
        <div class="klein">Siphon: ${esc(obj.siphon)}</div>
        ${warn.map((w) => `<div class="hinweis rot klein">${esc(w)}</div>`).join('')}</div>`).join('')}
      <div class="chips">${SAN_OBJEKTE.map((o) => `<button class="chip" data-akt="iObjPlus" data-typ="${o.id}">+ ${esc(o.n)}</button>`).join('')}</div>
      <section class="karte summe"><div><span class="klein">Summe DU</span><b>${zahl(p.sumDu, 1)} l/s</b></div><div><span class="klein">Sammelleitung</span><b>DN ${p.sammelDn}</b></div><div><span class="klein">Fallleitung</span><b>DN 100</b></div></section>
      ${p.mitWc ? '<div class="hinweis klein">Mit WC: Sammelleitung mindestens DN 90/100 – das WC möglichst nah an die Fallleitung und als letztes (unterstes) anschließen.</div>' : ''}
      <h3>So wird verbunden</h3>
      <div class="anim">${svgBoegen()}</div>
      <div class="anim">${svgAbzweig()}</div>
      <div class="hinweis klein"><b>Regeln (Richtwerte):</b><ul>
        <li>Gefälle mind. 1 %, besser 2 % (2 cm je Meter). Nicht über 5 % – sonst reißt der Wasserstrom ab.</li>
        <li>Richtungsänderung in liegenden Leitungen immer mit 2 × 45° (oder 15°/30°), nie mit einem 87°/90°-Bogen. Ausnahme: der WC-Anschlussbogen.</li>
        <li>Zuläufe mit 45°-Abzweig in Fließrichtung einmünden, kein T-Stück 87° in liegenden Leitungen. 87°-Abzweige nur zum Einmünden in die senkrechte Fallleitung.</li>
        <li>Übergang Fallleitung → liegende Leitung: 2 × 45° mit ca. 25 cm Zwischenstück.</li>
        <li>Unbelüftete Anschlussleitung: max. 4 m lang, max. 3 Richtungsänderungen, max. 1 m Höhenunterschied – sonst Belüftung.</li>
        <li>Nennweite in Fließrichtung nie verkleinern. Muffen zeigen gegen die Fließrichtung.</li>
        <li>Innen HT-Rohr (grau) bzw. Schallschutzrohr (weiß) in Wohnräumen, im Erdreich KG-Rohr (orange). Rohrschellen mit Gummieinlage, Abstand ca. 10 × Durchmesser.</li>
        <li>Rohr sauber ablängen, entgraten, 15° anfasen, Gleitmittel, bis Anschlag stecken und ca. 1 cm zurückziehen (Längenausdehnung).</li></ul></div>
      <div class="zeile"><button class="btn hell" data-akt="iInListe" data-was="abwasser">Material in Liste</button><a class="btn" target="_blank" rel="noopener" href="${linkVideo('HT Rohr verlegen Gefälle Abwasser anschließen Anleitung')}">Videos ansehen</a></div>
      <h3>Anschlusshöhen im Bad</h3><div class="anim">${svgBadWand()}</div>
      <div class="karte">${SAN_OBJEKTE.map((o) => `<div class="kat-zeile"><b>${esc(o.n)}</b> <span class="badge gelb">DN ${o.dn}</span><div class="klein">Abfluss: ${esc(o.ab)} · Wasser: ${esc(o.kw)}</div></div>`).join('')}</div>
      <p class="klein">Höhen sind übliche Richtwerte – maßgeblich sind Herstellerangaben von Waschtisch, WC-Element und Armatur.</p>`;
  } else if (I.tab === 'wasser') {
    x = `<div class="hinweis rot"><b>Wichtig:</b> Neue Trinkwasserleitungen oder Änderungen an der Trinkwasser-Installation dürfen nur eingetragene Installationsunternehmen ausführen (§ 12 AVBWasserV). Selbst erlaubt ist z. B. Armatur oder Eckventil-Anschluss tauschen. Planen und Material vorbereiten kannst du hier.</div>
      <div class="karte">${[['Material', 'Mehrschichtverbundrohr mit Pressfittings (häufig), Kupfer (löten/pressen) oder Edelstahl. Nicht mischen ohne geeignete Übergänge.'], ['Rohrgrößen (Richtwert)', 'Einzelzuleitung zum Objekt 16×2 mm, Verteilleitung 20×2 oder 26×3 mm – genaue Bemessung nach DIN 1988-300 durch Fachbetrieb.'], ['Anschluss', 'Jede Zapfstelle mit Absperrung (Eckventil). Waschmaschine/Geschirrspüler mit Rückflussverhinderer.'], ['Dämmung', 'Kaltwasser gegen Erwärmung und Tauwasser, Warmwasser gegen Wärmeverlust (GEG/GModG).'], ['Hygiene', 'Keine toten Leitungsenden (Stagnation, Legionellen). Leitungen nach dem Einbau spülen.'], ['Prüfung', 'Druckprüfung vor dem Schließen von Schlitzen und Vorwand, Protokoll aufheben.'], ['Leitungsführung', 'Kalt unter warm verlegen, Abstand halten. Waagerecht/senkrecht wie Elektro, Lage fotografieren und im Projekt speichern.']].map(([t, d]) => `<div class="kat-zeile"><b>${t}</b><div class="klein">${d}</div></div>`).join('')}</div>
      <h3>Armatur am Waschtisch selbst tauschen</h3>
      ${['Wasser am Eckventil schließen, Druck ablassen.', 'Alte Anschlussschläuche lösen, alte Armatur ab.', 'Neue Armatur mit Dichtung und Befestigungsset montieren.', 'Flexschläuche handfest + ¼ Umdrehung an Eckventile (keine Dichtpaste an Flachdichtungen).', 'Langsam öffnen, alle Verbindungen auf Dichtheit prüfen, Perlator spülen.'].map((t, i) => `<div class="schritt"><span class="nr">${i + 1}</span><span>${t}</span></div>`).join('')}
      <div class="zeile"><a class="btn" target="_blank" rel="noopener" href="${linkVideo('Waschtischarmatur wechseln Anleitung')}">Videos ansehen</a><a class="btn hell" href="#/markt">Installateur anfragen</a></div>`;
  } else if (I.tab === 'elektro') {
    const e = elektroPlan();
    x = `<div class="hinweis rot"><b>Wichtig:</b> Neue Leitungen, Steckdosen und Anschlüsse am Netz dürfen nur Elektrofachkräfte ausführen (DIN VDE 0100, Anschluss beim Netzbetreiber über eingetragenen Betrieb). Du kannst planen, Schlitze nach Absprache vorbereiten und Material besorgen.</div>
      <div class="anim">${svgZonen(e.rh)}</div>
      <label class="feld">Raumhöhe (m)<input inputmode="decimal" value="${zahl(e.rh)}" data-ein="iRh"></label>
      <h3>Punkte planen</h3>
      ${e.zeilen.map(({ p, e: ep, je, gesamt }, i) => `<div class="karte"><div class="zeile"><b style="flex:1">${esc(ep.n)}</b><button class="x" aria-label="Entfernen" data-akt="iPktWeg" data-i="${i}">×</button></div>
        <div class="raster2"><label class="feld">Anzahl<input inputmode="numeric" value="${p.anz}" data-ein="iPkt" data-i="${i}" data-k="anz"></label><label class="feld">Weg waagerecht bis Verteiler/Abzweig (m)<input inputmode="decimal" value="${zahl(p.weg)}" data-ein="iPkt" data-i="${i}" data-k="weg"></label></div>
        <div class="klein">Höhe: ${ep.h == null ? 'Decke' : zahl(ep.h * 100, 0) + ' cm über FFB'} · Kabel: ${esc(ep.kabel)} · ca. ${zahl(je, 1)} m je Punkt, gesamt ${zahl(gesamt, 1)} m</div></div>`).join('')}
      <div class="chips">${Object.entries(E_PUNKTE).map(([k, v]) => `<button class="chip" data-akt="iPktPlus" data-typ="${k}">+ ${esc(v.n)}</button>`).join('')}</div>
      <div class="karte">${Object.entries(e.kabel).map(([k, m]) => `<div class="kat-zeile zeile"><span style="flex:1">${esc(k)}</span><b>${zahl(Math.ceil(m * 1.15), 0)} m</b></div>`).join('')}<div class="kat-zeile zeile"><span style="flex:1">Dosen 68 mm</span><b>${e.dosen}</b></div><div class="klein">inkl. 15 % Reserve</div></div>
      <div class="hinweis klein"><b>Wo die Kabel hin müssen (DIN 18015-3):</b><ul>
        <li>Nur waagerecht und senkrecht, in den Installationszonen: oben 15–45 cm unter der Decke, unten 15–45 cm über dem Fußboden, senkrecht 10–30 cm neben Türen, Fenstern und Ecken.</li>
        <li>Steckdosen ca. 30 cm, Schalter ca. 105 cm, über der Arbeitsplatte ca. 115 cm. Mehrfach-Kombinationen: Dosenabstand 71 mm.</li>
        <li>Befestigung: im Schlitz mit Gips oder Nagelschellen ca. alle 30 cm; auf Putz Schellen ca. alle 25 cm; in Trockenbau im Leerrohr oder frei im Hohlraum mit Hohlwanddosen.</li>
        <li>Schlitze in tragenden Wänden nur in zulässiger Tiefe, waagerechte Schlitze besonders begrenzt – vorher prüfen (Statik).</li>
        <li>Bad: Schutzbereiche 0/1/2 beachten, alle Stromkreise mit FI/RCD 30 mA.</li>
        <li>Küche, Waschmaschine, Trockner, Geschirrspüler, Herd: je eigener Stromkreis.</li>
        <li>Lage aller Leitungen vor dem Verputzen fotografieren und im Projekt speichern.</li></ul></div>
      <div class="zeile"><button class="btn hell" data-akt="iInListe" data-was="elektro">Material in Liste</button><a class="btn" target="_blank" rel="noopener" href="${linkVideo('Installationszonen Elektro DIN 18015-3 erklärt')}">Videos ansehen</a></div>
      <a class="btn voll" href="#/markt">Elektrofachkraft anfragen</a>`;
  } else {
    x = Object.entries(WERKZEUG).map(([k, liste]) => `<h3>${{ abwasser: 'Abwasser', wasser: 'Trinkwasser', elektro: 'Elektro' }[k]}</h3><div class="karte">${liste.map(([n, wofuer, art, preis]) => `<div class="kat-zeile"><div class="zeile"><b style="flex:1">${esc(n)}</b><span class="badge ${art === 'leihen' ? 'gelb' : 'gruen'}">${art}</span></div>
      <div class="klein">${esc(wofuer)} · ${esc(preis)}</div>
      <div class="zeile klein-links"><a target="_blank" rel="noopener" href="${linkKaufen(n)}">Kaufen ›</a><a target="_blank" rel="noopener" href="${linkLeihen(n)}">Leihen in der Nähe ›</a><a target="_blank" rel="noopener" href="${linkVideo(n + ' Anleitung')}">Video ›</a></div></div>`).join('')}</div>`).join('') +
      `<p class="klein">Leihen: Baumarkt-Mietservice oder Baumaschinenvermietung in deiner Nähe. Preise sind grobe Richtwerte. Videos öffnen die YouTube-Suche; geprüfte Video-Empfehlungen und eingebettete Videos folgen in der Store-App.</p>`;
  }
  return kopf('Wasser, Abwasser & Elektro', 'Planen, Rohre, Gefälle, Kabel', zurueck) + `<div class="inhalt">
    <div class="segment">${tabs.map(([k, n]) => `<button class="${I.tab === k ? 'an' : ''}" data-akt="iTab" data-t="${k}">${n}</button>`).join('')}</div>${x}
    <p class="klein">Richtwerte nach DIN EN 12056 / DIN 1986-100 und DIN 18015-3, ohne Gewähr. Planung und Abnahme im Zweifel durch Fachbetrieb.</p></div>`;
});
