/* Joum 4D Build – Vorlesen, Hilfe zu jedem Knopf, „Was jetzt?“ und Schritt-für-Schritt-Modus
   Sprachausgabe über die Sprachausgabe des Geräts (Web Speech API, Deutsch). */

/* ---------- Sprechen ---------- */
function stimmeDE(lg) {
  const st = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
  const k = (lg || 'de-DE').slice(0, 2), voll = (lg || 'de-DE').replace('-', '[-_]');
  return st.find((v) => new RegExp(voll, 'i').test(v.lang) && /google|natural|neural|premium|enhanced/i.test(v.name)) || st.find((v) => new RegExp('^' + k, 'i').test(v.lang)) || null;
}
/* lang: BCP-47 (z. B. 'en-US'); ohne Angabe: übersetzt, was das Wörterbuch kennt, sonst Deutsch */
function sprich(text, still, lang) {
  if (!text) return;
  if (!('speechSynthesis' in window)) { if (!still) toast('Vorlesen wird von diesem Gerät nicht unterstützt'); return; }
  try {
    speechSynthesis.cancel();
    const roh = String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const fremd = (lang && !/^de/.test(lang)) ? roh : null;   // fremde Sprache: keine deutschen Abkürzungs-Ersetzungen
    const sauber = fremd || roh.replace(/[·•|]/g, ', ').replace(/(\d),(\d)/g, '$1 Komma $2').replace(/m²/g, ' Quadratmeter').replace(/ cm\b/g, ' Zentimeter').replace(/ mm\b/g, ' Millimeter').replace(/ m\b/g, ' Meter').replace(/ Std\./g, ' Stunden').replace(/€/g, ' Euro').replace(/DN (\d+)/g, 'D N $1').replace(/ca\./g, 'circa').replace(/z\. B\./g, 'zum Beispiel').replace(/§/g, 'Paragraf');
    let lg = lang || 'de-DE', txt = sauber;
    if (!lang && typeof spr === 'function' && spr() !== 'de') { const [tr, trLg] = TTL(roh.trim()); if (tr !== roh.trim()) { txt = tr.replace(/[·•|]/g, ', '); lg = trLg; } }
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = lg; u.rate = S.einstellungen.sprechTempo || 0.95; const v = stimmeDE(lg); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { if (!still) toast('Vorlesen nicht möglich'); }
}
function stumm() { try { speechSynthesis.cancel(); } catch (e) {} }
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

/* ---------- Hilfe-Texte zu Knöpfen (wie in JoumHome) ---------- */
const HILFE = {
  neuesProjekt: 'Legt ein neues Projekt an. Danach kannst du messen, gestalten und die Anleitung Schritt für Schritt abarbeiten.',
  aktiv: 'Öffnet dieses Projekt.',
  materialInListe: 'Schreibt alles Material mit Menge in die Einkaufsliste – inklusive Verschnitt.',
  film: 'Spielt einen Film ab: So sieht der Raum vorher und nachher aus.',
  bau4D: 'Zeigt den Bauablauf in 4D: Leitungen, Trockenbau, Fliesen und Möbel – Schritt für Schritt als Video.',
  schichten4D: 'Zeigt den Aufbau Schicht für Schicht als Video.',
  planAdd: 'Stellt dieses Teil in den Raum. Die App sucht automatisch einen passenden Platz.',
  planDreh: 'Dreht das ausgewählte Teil um 90 Grad.',
  planWeg: 'Löscht das ausgewählte Teil.',
  planDoppel: 'Kopiert das ausgewählte Teil.',
  planInListe: 'Schreibt alle geplanten Teile in die Einkaufsliste.',
  kiLuefter: 'Plant den Lüfter an der richtigen Stelle ein: gegenüber der Tür, oben, nahe Dusche oder WC.',
  kiStuehle: 'Stellt passende Stühle rund um den Tisch.',
  kiEntfernen: 'Entfernt dieses Teil, weil es hier nicht hingehört.',
  inselOpt: 'Wählt aus, was in die Kücheninsel kommt. Die App zeigt dann, welche Leitungen durch den Boden müssen.',
  g4D: 'Zeigt den Garten in 4D: vom Abstecken bis zum Wachstum über fünf Jahre.',
  gProjekt: 'Übernimmt diesen Gartenvorschlag als Projekt mit Kostenliste.',
  gWunsch: 'Stellt einen Wunsch ein. Die Vorschläge passen sich sofort an.',
  ekWhatsapp: 'Schickt die Einkaufsliste per WhatsApp an einen Händler.',
  ekToggle: 'Hakt diese Position als gekauft ab.',
  fqSpeichern: 'Speichert die Quittung im Projekt.',
  ausschreiben: 'Schickt den Auftrag an Handwerker in deiner Nähe.',
  hwWaehlen: 'Beauftragt diesen Handwerker. Das Geld geht in Etappen auf das Treuhandkonto.',
  nachtragSpeichern: 'Unterschreibt den Nachtrag. Der Betrag kommt auf das Treuhandkonto.',
  etappeFrei: 'Gibt das Geld für diese Etappe frei, weil alles in Ordnung ist.',
  punkt: 'Prüfpunkt: OK oder Mangel.',
  exportJson: 'Speichert alle deine Daten als Sicherung.',
  diktatWand: 'Sag zum Beispiel: vier Komma zwei mal zwei Komma fünf. Die App legt die Wand an.',
  wandPlus: 'Fügt eine weitere Wand oder Öffnung hinzu.',
  flaecheUebernehmen: 'Übernimmt die gemessene Fläche ins Projekt.',
  fmUebernehmen: 'Übernimmt die gemessene Länge.',
  schritt: 'Hakt diesen Schritt als erledigt ab.',
  koennen: 'Stellt dein Können ein. Der Zeitplan passt sich an.',
  lidar: 'Der 3D-Scanner kommt mit der Store-App. Nutze bis dahin Foto und Zollstock.',
  teil3D: 'Zeigt das Teil in 3D zum Drehen – so erkennst du es im Baumarkt.',
  leitung3D: 'Zeigt die Leitung in 3D mit Gefälle und fließendem Wasser.',
  asMikro: 'Sprich deinen Wunsch, zum Beispiel: Garten zwölf Meter lang, acht Meter tief.',
  asSenden: 'Schickt deine Nachricht an den Assistenten.',
  stil: 'Wählt diesen Stil für Farben und Möbel.',
  vorlesen: 'Liest diese Seite vor.',
  wasJetzt: 'Sagt dir, was als Nächstes zu tun ist.',
  schrittModus: 'Startet die Anleitung Schritt für Schritt mit großer Schrift und Vorlesen.'
};
const SEITEN_HILFE = {
  start: 'Startseite. Oben siehst du dein aktives Projekt und den nächsten Schritt. Darunter die wichtigsten Bereiche.',
  projekte: 'Hier wählst du einen Raum, Haus außen oder Garten und legst ein Projekt an.',
  raum: 'Hier siehst du, was du in diesem Raum machen kannst, und den passenden Katalog.',
  projekt: 'Dein Projekt. Tippe auf „Was jetzt?“, dann sagt dir die App den nächsten Schritt.',
  messen: 'Hier misst du den Raum: Wände, Türen und Fenster. Du kannst auch diktieren oder mit Foto und Zollstock messen.',
  fotomessen: 'Messen per Foto: erst die Enden des Zollstocks antippen, dann die Strecke.',
  planer: 'Hier richtest du den Raum ein. Oben siehst du ihn in 3D, unten verschiebst du die Teile.',
  ideen: 'Hier wählst du einen Stil und übernimmst Ideen aus deiner Skizze.',
  anleitung: 'Die Anleitung. Mit „Schritt für Schritt“ liest die App jeden Schritt vor.',
  schritt: 'Schritt-für-Schritt-Modus.',
  garten: 'Gartenplaner. Gib die Maße ein und blättere durch die Vorschläge.',
  einkauf: 'Deine Einkaufsliste.',
  finanzen: 'Hier speicherst du Quittungen und siehst, was du steuerlich absetzen kannst.',
  markt: 'Hier findest du einen Handwerker und verwaltest den Auftrag.',
  installation: 'Hier planst du Wasser, Abwasser und Elektro.',
  assistent: 'Der Planungs-Assistent. Sprich oder schreibe, was du planen möchtest.',
  mehr: 'Alle Bereiche und die Einstellungen.'
};
function hilfeFuer(el) {
  if (el.dataset && el.dataset.hilfe) return el.dataset.hilfe;
  if (el.dataset && el.dataset.akt && HILFE[el.dataset.akt]) return HILFE[el.dataset.akt];
  if (el.dataset && el.dataset.ein && /Datei|Foto/.test(el.dataset.ein)) return 'Macht ein Foto oder wählt eines aus der Galerie.';
  const href = el.getAttribute && el.getAttribute('href');
  if (href && href.startsWith('#/')) { const r = href.replace(/^#\/?/, '').split(/[/?]/)[0] || 'start'; if (SEITEN_HILFE[r]) return (el.textContent.trim() ? el.textContent.trim() + '. ' : '') + SEITEN_HILFE[r]; }
  const t = (el.getAttribute && el.getAttribute('aria-label')) || el.textContent || '';
  return t.replace(/\s+/g, ' ').trim();
}

/* Lange drücken = Hinweis anzeigen und vorlesen (ohne die Aktion auszulösen) */
let druckTimer = null, langGedrueckt = false;
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('[data-akt], a, button, label.datei-knopf, .kachel');
  if (!el || el.closest('.plan-boden') || el.closest('.fm-buehne') || S.einstellungen.blasenAus) return;
  langGedrueckt = false;
  clearTimeout(druckTimer);
  druckTimer = setTimeout(() => { langGedrueckt = true; const h = hilfeFuer(el); if (h) { blase(el, h); sprich(h); } }, 550);
});
['pointerup', 'pointercancel', 'pointermove'].forEach((t) => document.addEventListener(t, (e) => { if (t !== 'pointermove' || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) clearTimeout(druckTimer); }));
document.addEventListener('click', (e) => { if (langGedrueckt) { e.preventDefault(); e.stopPropagation(); langGedrueckt = false; } }, true);
document.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-akt], a, button, .kachel')) e.preventDefault(); });
function blase(el, text) {
  let b = document.getElementById('hilfe-blase');
  if (!b) { b = document.createElement('div'); b.id = 'hilfe-blase'; b.className = 'hilfe-blase'; b.setAttribute('role', 'tooltip'); document.body.appendChild(b); }
  b.textContent = text; b.classList.add('an');
  const r = el.getBoundingClientRect(); b.style.left = Math.max(8, Math.min(window.innerWidth - 288, r.left + r.width / 2 - 140)) + 'px';
  b.style.top = (r.top > 140 ? r.top - 10 : r.bottom + 10) + 'px'; b.style.transform = r.top > 140 ? 'translateY(-100%)' : 'none';
  clearTimeout(blase.t); blase.t = setTimeout(() => b.classList.remove('an'), 4500);
}

/* „Alles vorlesen“: bei jedem Antippen ansagen, was passiert; bei jedem Seitenwechsel die Seite ansagen */
document.addEventListener('click', (e) => {
  if (!S.einstellungen.vorlesen) return;
  const el = e.target.closest('[data-akt], a, button, label.datei-knopf');
  if (!el || ['vorlesen', 'wasJetzt', 'sprachbefehl'].includes(el.dataset.akt) || el.closest('.schritt-modus')) return;
  const h = hilfeFuer(el); if (h) sprich(h, true);
}, true);
let letzteSeite = '';
const altRender = render;
render = function () {
  altRender();
  if (S.einstellungen.vorlesen && PFAD !== letzteSeite) {
    letzteSeite = PFAD;
    const h1 = document.querySelector('#main h1'), r = aktuelleRoute().name;
    if (r !== 'schritt') setTimeout(() => sprich((h1 ? h1.textContent + '. ' : '') + (SEITEN_HILFE[r] || ''), true), 250);
  }
  zeigeSprechKnopf();
};
function zeigeSprechKnopf() {
  let k = document.getElementById('sprech-knopf');
  if (!k) { k = document.createElement('button'); k.id = 'sprech-knopf'; k.className = 'sprech-knopf'; k.setAttribute('aria-label', 'Seite vorlesen'); k.dataset.akt = 'vorlesen'; k.innerHTML = ICON.lautsprecher; document.body.appendChild(k); }
}
AKT.vorlesen = () => {
  if (window.speechSynthesis && speechSynthesis.speaking) { stumm(); return; }
  const r = aktuelleRoute(), h1 = document.querySelector('#main h1');
  let text = (h1 ? h1.textContent + '. ' : '') + (SEITEN_HILFE[r.name] || '');
  if (r.name === 'projekt' || r.name === 'start') { const p = r.name === 'projekt' ? projekt(r.arg) : aktivesProjekt(); if (p) text += ' ' + wasJetzt(p).text; }
  if (r.name === 'anleitung') { const a = ANLEITUNGEN[r.arg]; if (a) text += ' ' + a.schritte.length + ' Schritte. ' + (a.warn.length ? 'Achtung: ' + a.warn.join(' ') : ''); }
  sprich(text);
};

/* ---------- „Was jetzt?“ – der nächste sinnvolle Schritt im Projekt ---------- */
const NACHFOLGER = {
  bad_abdichten: 'fliesen', fliesen: 'silikon', vorsatzschale: 'streichen', trockenbau_wand: 'streichen', installation: 'vorsatzschale', keller_feuchte: 'streichen',
  dach_daemmen_innen: 'trockenbau_wand', fenster: 'streichen', haustuer: 'streichen', tapezieren: 'laminat', streichen: 'laminat', bad_luefter: 'tuer_lueftung',
  keller_abdichten: 'kellerdecke_daemmen', terrasse: 'gartenlicht', hochbeet: 'bewaesserung', teich: 'gartenlicht', gartenweg: 'gartenlicht', kueche_montage: 'silikon'
};
function wasJetzt(p) {
  const a = ANLEITUNGEN[p.anleitung], r = raum(p.raum) || {};
  const nAus = (p.aussparungen || []).length, fertig = a && a.schritte.length && a.schritte.every((_, i) => p.schritte[i]);
  const imEinkauf = S.einkauf.some((e) => e.projekt === p.id);
  const fehler = typeof pruefen === 'function' ? pruefen(p).filter((x) => x.stufe === 'fehler') : [];
  if (p.bereich === 'innen' && !p.gemessen) return { text: 'Als Erstes den Raum messen: Wände, Türen und Fenster.', link: '#/messen/' + p.id, knopf: 'Jetzt messen' };
  if (fehler.length) return { text: 'Die Raumprüfung hat ' + fehler.length + ' Problem(e) gefunden: ' + fehler[0].text + ' Bitte zuerst beheben.', link: '#/planer/' + p.id, knopf: 'Zur Raumprüfung' };
  if (!a && !p.plan.length && p.bereich === 'innen') return { text: 'Raum gestalten: Möbel und Objekte aus dem Katalog in den Raum stellen.', link: '#/planer/' + p.id, knopf: 'Jetzt gestalten' };
  if (a && a.material.length && !imEinkauf && !fertig) return { text: 'Material besorgen: Die App schreibt dir alles mit Menge in die Einkaufsliste.', akt: 'materialInListe', knopf: 'Material in die Liste' };
  if (a && a.wer === 'Fachbetrieb' && !S.auftraege.some((x) => x.projekt === p.id)) return { text: 'Diese Arbeit gehört zum Fachbetrieb. Nächster Schritt: Handwerker anfragen.', link: '#/markt?p=' + p.id, knopf: 'Profi anfragen' };
  if (a && !fertig) { const i = a.schritte.findIndex((_, k) => !p.schritte[k]); return { text: 'Schritt ' + (i + 1) + ' von ' + a.schritte.length + ': ' + a.schritte[i][0] + '. ' + (a.schritte[i][1] || ''), link: '#/schritt/' + p.anleitung + '?p=' + p.id + '&i=' + i, knopf: 'Schritt für Schritt (mit Vorlesen)' }; }
  if (fertig) { const n = NACHFOLGER[p.anleitung]; const t = 'Alle Schritte erledigt! Mach Fotos vom Ergebnis und speichere die Quittungen.' + (n && ANLEITUNGEN[n] ? ' Danach kommt meistens: ' + ANLEITUNGEN[n].t + '.' : ''); return { text: t, link: n ? '#/anleitung/' + n : '#/finanzen?p=' + p.id, knopf: n ? ANLEITUNGEN[n].t : 'Quittung speichern', naechstesProjekt: n }; }
  return { text: 'Schau dir den Bauablauf in 4D an oder lass dir von einem Profi ein Angebot machen.', akt: 'bau4D', knopf: '4D-Bauablauf' };
}
function wasJetztKarte(p) {
  const w = wasJetzt(p);
  return `<section class="karte was-jetzt"><div class="zeile"><b style="flex:1">Was jetzt?</b><button class="rund klein-rund" data-akt="wasJetzt" data-id="${p.id}" aria-label="Vorlesen">${ICON.lautsprecher}</button></div>
    <p>${esc(w.text)}</p>
    ${w.link ? `<a class="btn hell voll" href="${w.link}">${esc(w.knopf)}</a>` : `<button class="btn hell voll" data-akt="${w.akt}" data-id="${p.id}">${esc(w.knopf)}</button>`}</section>`;
}
AKT.wasJetzt = (d) => { const p = projekt(d.id) || aktivesProjekt(); if (p) sprich('Was jetzt? ' + wasJetzt(p).text); };

/* ---------- Schritt-für-Schritt-Modus ---------- */
AKT.schrittGeh = (d) => geh(d.ziel);
AKT.schrittErledigt = (d) => {
  const p = projekt(d.p); if (p) { p.schritte[d.i] = true; speichern('Schritt erledigt'); }
  geh(d.ziel);
};
AKT.schrittSprich = (d) => { const a = ANLEITUNGEN[d.anl], s = a.schritte[+d.i]; sprich('Schritt ' + (+d.i + 1) + ' von ' + a.schritte.length + '. ' + s[0] + '. ' + (s[1] || '')); };
route('schritt', (id, q) => {
  const a = ANLEITUNGEN[id]; if (!a) return kopf('Anleitung nicht gefunden', '', '#/projekte');
  const p = q.p ? projekt(q.p) : null, n = a.schritte.length, i = Math.min(n, Math.max(0, +(q.i || 0)));
  const basis = '#/schritt/' + id + '?' + (p ? 'p=' + p.id + '&' : '') + 'i=';
  const zurueck = p ? '#/projekt/' + p.id : '#/anleitung/' + id;
  if (i >= n) {
    const nf = NACHFOLGER[id] && ANLEITUNGEN[NACHFOLGER[id]];
    const txt = 'Geschafft! Alle ' + n + ' Schritte sind erledigt. ' + (nf ? 'Als Nächstes kommt meistens: ' + nf.t + '. ' : '') + 'Mach Fotos vom Ergebnis und speichere deine Quittungen.';
    if (S.einstellungen.vorlesen !== false) setTimeout(() => sprich(txt, true), 300);
    return kopf('Geschafft!', a.t, zurueck) + `<div class="inhalt schritt-modus">
      <div class="sm-nr gruen-rand">✓</div><p class="sm-titel">${esc(txt)}</p>
      <button class="btn voll" data-akt="schrittSprich2" data-t="${esc(txt)}">${ICON.lautsprecher} Nochmal vorlesen</button>
      ${nf ? `<a class="btn hell voll" href="#/anleitung/${NACHFOLGER[id]}${p ? '?p=' + p.id : ''}">Weiter mit: ${esc(nf.t)}</a>` : ''}
      ${p ? `<a class="btn voll" href="#/finanzen?p=${p.id}">Quittung speichern</a><a class="btn voll" href="#/projekt/${p.id}">Zum Projekt</a>` : `<a class="btn voll" href="#/anleitung/${id}">Zur Anleitung</a>`}</div>`;
  }
  const s = a.schritte[i];
  const txt = 'Schritt ' + (i + 1) + ' von ' + n + '. ' + s[0] + '. ' + (s[1] || '');
  if (S.einstellungen.vorlesen !== false && render.letzte !== PFAD) setTimeout(() => sprich(txt, true), 300);
  const warn = i === 0 && a.warn.length ? `<div class="hinweis rot">${a.warn.map(esc).join('<br>')}</div>` : '';
  return kopf('Schritt ' + (i + 1) + ' von ' + n, a.t, zurueck) + `<div class="inhalt schritt-modus">
    <div class="sm-fortschritt"><span style="width:${Math.round(i / n * 100)}%"></span></div>
    ${warn}
    <div class="sm-nr">${i + 1}</div>
    <h2 class="sm-titel">${esc(s[0])}</h2>
    <p class="sm-text">${esc(s[1] || '')}</p>
    <button class="btn voll" data-akt="schrittSprich" data-anl="${id}" data-i="${i}">${ICON.lautsprecher} Vorlesen</button>
    <button class="btn hell voll sm-gross" data-akt="schrittErledigt" data-p="${p ? p.id : ''}" data-i="${i}" data-ziel="${basis}${i + 1}">✓ Erledigt – nächster Schritt</button>
    <div class="zeile">${i > 0 ? `<button class="btn" data-akt="schrittGeh" data-ziel="${basis}${i - 1}">◀ Zurück</button>` : ''}<button class="btn" data-akt="schrittGeh" data-ziel="${basis}${i + 1}">Überspringen ▶</button></div>
    <p class="klein">Nach diesem Schritt: ${i + 1 < n ? esc(a.schritte[i + 1][0]) : 'fertig – die App sagt dir, was danach kommt.'}</p>
  </div>`;
});
AKT.schrittSprich2 = (d) => sprich(d.t);

/* Einstellungen */
EIN.vorlesenEinst = (v, d) => aendern((s) => { s.einstellungen[d.k] = d.k === 'sprechTempo' ? parseZahl(v) : v; });
