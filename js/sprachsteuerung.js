/* Joum 4D Build – Sprachsteuerung: sprechen → App öffnet die Seite und lässt den richtigen Knopf blinken
   Erkennung über die Spracherkennung des Geräts (Web Speech API, Deutsch). Ohne Spracherkennung: Befehl eintippen. */

const SP = { hoert: false, rec: null };
const TAETIGKEIT = [
  [/fliese|kachel/, 'fliesen'], [/streich|farbe|malern/, 'streichen'], [/tapez/, 'tapezieren'], [/laminat|vinyl|boden verleg/, 'laminat'], [/parkett/, 'parkett'],
  [/silikon|fuge/, 'silikon'], [/abdicht/, 'bad_abdichten'], [/vorsatzschale|trockenbau|rigips|gipskarton/, 'vorsatzschale'], [/lüfter|lüftung|entlüft/, 'bad_luefter'],
  [/fenster/, 'fenster'], [/haustür/, 'haustuer'], [/dachfenster/, 'dachfenster'], [/dach/, 'dach'], [/fassade|außenwand/, 'fassade'], [/regenrinne|dachrinne/, 'regenrinne'],
  [/terrasse/, 'terrasse'], [/zaun|sichtschutz/, 'zaun'], [/hochbeet/, 'hochbeet'], [/teich/, 'teich'], [/gartenhaus/, 'gartenhaus'], [/kellerdecke/, 'kellerdecke_daemmen'],
  [/feucht|schimmel im keller|nasser keller/, 'keller_feuchte'], [/küche aufbauen|küche montieren/, 'kueche_montage']
];
const RAUM_WORT = [[/badezimmer|\bbad\b/, 'bad'], [/gäste-?wc|\bwc\b|toilette/, 'gaestewc'], [/küche/, 'kueche'], [/wohnzimmer/, 'wohnzimmer'], [/esszimmer/, 'esszimmer'], [/schlafzimmer/, 'schlafzimmer'],
  [/kinderzimmer/, 'kinderzimmer'], [/babyzimmer/, 'babyzimmer'], [/büro|arbeitszimmer/, 'buero'], [/flur|diele/, 'flur'], [/keller/, 'keller'], [/waschraum|waschküche/, 'waschraum'],
  [/heizungsraum/, 'heizungsraum'], [/dachboden|dachgeschoss/, 'dachboden'], [/garage/, 'garage'], [/balkon/, 'balkon'], [/gästezimmer/, 'gaestezimmer'], [/treppe/, 'treppenhaus']];

/* Absicht erkennen → { route, ziel (CSS-Auswahl), sag, aktion } */
function absicht(text) {
  const t = text.toLowerCase(), p = aktivesProjekt();
  const proj = (r, ziel, sag) => p ? { route: r.replace('{id}', p.id), ziel, sag } : { route: '#/projekte', ziel: '.raum-kachel', sag: 'Du hast noch kein Projekt. Wähle zuerst einen Raum – tippe auf den blinkenden Raum.' };
  if (/hilfe|was kann ich sagen|befehle/.test(t)) return { sag: 'Du kannst zum Beispiel sagen: Ich will mein Bad fliesen. Quittung speichern. Wie geht es weiter? Raum messen. Garten planen. Einkaufsliste. Handwerker finden. Bauablauf zeigen.' };
  if (/wie geht es weiter|was jetzt|nächste[rn]? schritt|was muss ich (jetzt )?machen|weiter machen/.test(t)) { if (!p) return absicht('projekt anlegen'); const w = wasJetzt(p); return { route: '#/projekt/' + p.id, ziel: '.was-jetzt .btn', sag: w.text + ' Tippe auf den blinkenden Knopf.' }; }
  if (/vorlesen|lies vor/.test(t)) return { aktion: () => AKT.vorlesen() };
  if (/anmeld|einlogg|login|konto|registrier/.test(t)) return { route: '#/anmelden', ziel: '#google-ersatz:not([hidden]), #google-knopf-platz', sag: 'Hier meldest du dich mit deinem Google-Konto an – ohne Passwort.' };
  if (/startseite|anfang|home|hauptseite/.test(t)) return { route: '#/', sag: 'Hier ist die Startseite.' };
  if (/quittung|beleg|kassenbon|rechnung (speichern|fotograf)/.test(t)) return { route: '#/finanzen', ziel: 'label.datei-knopf', sag: 'Tippe auf den blinkenden Knopf und fotografiere die Quittung.' };
  if (/steuer|finanz|ausgaben/.test(t)) return { route: '#/finanzen', sag: 'Hier siehst du deine Ausgaben und was du absetzen kannst.' };
  if (/einkauf|einkaufsliste|was muss ich kaufen|material/.test(t)) return p && /material/.test(t) && ANLEITUNGEN[p.anleitung] ? { route: '#/projekt/' + p.id, ziel: '[data-akt="materialInListe"]', sag: 'Tippe auf den blinkenden Knopf – dann kommt das Material mit Menge in die Einkaufsliste.' } : { route: '#/einkauf', sag: 'Das ist deine Einkaufsliste.' };
  if (/zollstock|foto messen|per foto/.test(t)) return proj('#/fotomessen/{id}', 'label.datei-knopf', 'Halte den Zollstock an die Wand und mach ein Foto. Tippe auf den blinkenden Knopf.');
  if (/messen|ausmessen|maße|wie groß/.test(t)) return proj('#/messen/{id}', 'input[data-feld="breite"]', 'Trag hier Breite und Tiefe ein – oder sag die Maße mit dem Mikrofon.');
  if (/bauteil|ständer|staender|dachstuhl|holzrahmen|holzständer|sparren|rähm/.test(t)) return { route: '#/bauteile', ziel: '#bt-play', sag: 'Hier siehst du ein Holzständerhaus mit Dachstuhl in echtem 3D – Teil für Teil erklärt.' };
  if (/bauamt|genehmigung|bauantrag|baugenehmigung|darf ich/.test(t)) return { route: '#/bauamt', ziel: '[data-ein="baPlz"]', sag: 'Hier prüfst du, ob du eine Genehmigung brauchst. Trag die Postleitzahl ein – ich finde dein Bauamt und schreibe die Anfrage.' };
  if (/treppe|stufen|steigung/.test(t)) return { route: '#/treppe', ziel: '.treppe-ergebnis', sag: 'Hier planst du deine Treppe nach Norm. Trag Geschosshöhe, Raum und Deckenöffnung ein – ich prüfe Stufen, Kopfhöhe und Türen.' };
  if (/grundriss/.test(t)) return proj('#/messen/{id}', 'label.datei-knopf', 'Tippe auf den blinkenden Knopf und lade deinen Grundriss hoch.');
  if (/skizze|zeichn/.test(t)) return proj('#/loslegen/{id}', '[data-akt="studioZu"][data-z="skizze"]', 'Tippe auf den blinkenden Knopf und zeichne deinen Raum mit dem Finger – oder fotografiere eine Skizze auf Papier.');
  if (/vorbild|so eins|inspiration|pinterest|bild aus dem internet/.test(t)) return proj('#/loslegen/{id}', 'label.datei-knopf:has(input[data-ein="studioVorbild"])', 'Tippe auf „Vorbild-Bild hochladen“ und wähle das Bild, das dir gefällt.');
  if (/vorschl|kosten|was kostet|passt das|machbar/.test(t)) return proj('#/loslegen/{id}?s=4', '[data-akt="studioNehmen"]', 'Hier sind meine Vorschläge mit Kosten und Material. Die Empfehlung ist markiert.');
  if (/stil|farbe aussuchen|ideen/.test(t)) return proj('#/ideen/{id}', '.stil', 'Wähle einen Stil – tippe auf eine Karte.');
  if (/vorher|nachher|film/.test(t)) return proj('#/projekt/{id}', '[data-akt="film"]', 'Tippe auf den blinkenden Knopf – dann siehst du vorher und nachher.');
  if (/4d|bauablauf|wie wird gebaut|leitungen zeigen/.test(t)) return proj('#/projekt/{id}', '[data-akt="bau4D"], [data-akt="schichten4D"], [data-akt="garten4DProjekt"]', 'Tippe auf den blinkenden Knopf – dann siehst du den Bauablauf in 4D.');
  if (/kino|tour|video aus fotos/.test(t)) return { route: '#/tour', ziel: 'label.datei-knopf', sag: 'Wähle deine Fotos – tippe auf den blinkenden Knopf.' };
  if (/handwerker|profi|auftrag|angebot/.test(t)) return p ? { route: '#/markt?p=' + p.id, ziel: '[data-akt="ausschreiben"], .hw .btn', sag: 'Hier vergibst du den Auftrag an einen Handwerker. Tippe auf den blinkenden Knopf.' } : { route: '#/markt', sag: 'Hier findest du Handwerker.' };
  if (/garten/.test(t) && !TAETIGKEIT.some(([re, a]) => re.test(t) && ['terrasse', 'zaun', 'hochbeet', 'teich', 'gartenhaus'].includes(a))) return { route: '#/garten', ziel: 'input[data-k="L"]', sag: 'Gib Länge und Tiefe deines Gartens ein. Dann blätterst du durch die Vorschläge.' };
  if (/wasser|abwasser|rohr|elektr|steckdose|kabel/.test(t)) return { route: '#/installation?tab=' + (/elektr|steckdose|kabel/.test(t) ? 'elektro' : /abwasser|rohr/.test(t) ? 'abwasser' : 'wasser'), sag: 'Hier planst du ' + (/elektr|steckdose|kabel/.test(t) ? 'Elektro' : 'Wasser und Abwasser') + '.' };
  if (/werkzeug|leihen/.test(t)) return { route: '#/installation?tab=werkzeug', sag: 'Hier siehst du Werkzeug zum Kaufen und Leihen.' };
  if (/rechner|dämm|wie viel farbe|wie viele fliesen/.test(t)) return { route: '#/rechner', sag: 'Hier sind die Rechner.' };
  if (/sicherung|backup|daten/.test(t)) return { route: '#/sicherung', ziel: '[data-akt="exportJson"]', sag: 'Tippe auf den blinkenden Knopf, um eine Sicherung zu speichern.' };
  if (/einstellung|große schrift|grösser/.test(t)) return { route: '#/mehr', ziel: 'input[data-k="gross"]', sag: 'Hier schaltest du Großschrift und Vorlesen ein.' };
  if (/assistent|planen|schlag .*vor/.test(t) && !TAETIGKEIT.some(([re]) => re.test(t))) return { aktion: () => { geh('#/assistent'); setTimeout(() => asNachricht(text), 200); }, sag: 'Ich gebe das an den Planungs-Assistenten weiter.' };
  // Tätigkeit + Raum („Bad fliesen“, „Wohnzimmer streichen“)
  const ta = TAETIGKEIT.find(([re]) => re.test(t)), ra = RAUM_WORT.find(([re]) => re.test(t));
  if (ta) {
    const anl = ta[1], a = ANLEITUNGEN[anl];
    const raumId = (ra && ra[1]) || (p && raum(p.raum) && raum(p.raum).projekte.includes(anl) ? p.raum : (RAEUME.find((r) => r.projekte.includes(anl)) || {}).id);
    if (raumId && raum(raumId).projekte.includes(anl)) return { route: '#/raum/' + raumId, ziel: `[data-akt="neuesProjekt"][data-anl="${anl}"]`, sag: a.t + ' im Raum ' + raum(raumId).name + '. Tippe auf den blinkenden Knopf „Projekt“ – dann führe ich dich Schritt für Schritt.' };
    return { route: '#/anleitung/' + anl, ziel: 'a[href^="#/schritt/"]', sag: 'Hier ist die Anleitung ' + a.t + '. Tippe auf den blinkenden Knopf – dann lese ich dir jeden Schritt vor.' };
  }
  if (ra) return { route: '#/raum/' + ra[1], ziel: '[data-akt="neuesProjekt"][data-anl=""]', sag: raum(ra[1]).name + '. Tippe auf den blinkenden Knopf, um den Raum zu gestalten – oder wähle oben eine Arbeit.' };
  if (/projekt anlegen|neues projekt|renovieren|anfangen/.test(t)) return { route: '#/projekte', ziel: '.raum-kachel', sag: 'Wähle den Raum, den du renovieren willst.' };
  if (/projekt/.test(t) && p) return { route: '#/projekt/' + p.id, sag: 'Das ist dein Projekt ' + p.name + '.' };
  return { aktion: () => { geh('#/assistent'); setTimeout(() => asNachricht(text), 200); }, sag: 'Ich frage den Planungs-Assistenten.' };
}

/* Knopf blinken lassen wie ein Autoblinker (schwarz/weiß) */
function zeigeAuf(auswahl) {
  document.querySelectorAll('.zeig-blink').forEach((x) => x.classList.remove('zeig-blink'));
  const el = auswahl && [...document.querySelectorAll(auswahl)].find((x) => x.offsetParent !== null);
  if (!el) return false;
  const ziel = el.closest('label.datei-knopf') || el;
  ziel.classList.add('zeig-blink');
  ziel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  hinweisLeiste(T('Tippe auf den blinkenden Knopf'));
  const weg = () => { ziel.classList.remove('zeig-blink'); hinweisLeiste(''); document.removeEventListener('click', weg, true); };
  setTimeout(() => document.addEventListener('click', weg, true), 400);
  setTimeout(weg, 15000);
  return true;
}
function hinweisLeiste(text) {
  let l = document.getElementById('zeig-leiste');
  if (!l) { l = document.createElement('div'); l.id = 'zeig-leiste'; l.className = 'zeig-leiste'; document.body.appendChild(l); }
  l.textContent = text; l.classList.toggle('an', !!text);
}

function befehlAusfuehren(text) {
  if (!text) return;
  toast('„' + text + '“');
  const fremd = typeof spr === 'function' && spr() !== 'de';
  const deText = fremd ? nachDeutsch(text) : text;
  const a = absicht(deText);
  if (a.aktion) { if (a.sag) sprich(fremd ? T('Assistent') : a.sag, true, fremd ? sprBcp() : 'de-DE'); a.aktion(); return; }
  if (a.route && a.route !== PFAD) geh(a.route);
  setTimeout(() => {
    const ok = a.ziel ? zeigeAuf(a.ziel) : false;
    if (!fremd) { sprich(a.sag || (ok ? 'Tippe auf den blinkenden Knopf.' : ''), true); return; }
    // Ansage in der gewählten Sprache: Seite + Hinweis auf den blinkenden Knopf
    let sag;
    if (deText === 'hilfe') sag = T('Du kannst zum Beispiel sagen:') + ' ' + BEISPIELE[spr()];
    else { const h1 = document.querySelector('header.kopf h1'); sag = (h1 ? T('Hier ist') + ': ' + h1.textContent + '. ' : '') + (ok ? T('Tippe auf den blinkenden Knopf') + '.' : ''); }
    sprich(sag, true, sprBcp());
  }, 350);
}

/* Zuhören */
AKT.sprachbefehl = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SP.hoert && SP.rec) { try { SP.rec.stop(); } catch (e) {} return; }
  if (!SR) { befehlTippen(); return; }
  try {
    stumm();
    const r = new SR(); r.lang = typeof sprBcp === 'function' ? sprBcp() : 'de-DE'; r.interimResults = false; r.maxAlternatives = 1;
    SP.rec = r; SP.hoert = true; mikroZustand();
    r.onresult = (e) => befehlAusfuehren(e.results[0][0].transcript);
    r.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') befehlTippen(T('Mikrofon ist hier nicht erlaubt – bitte Befehl eintippen.')); else toast(T('Nicht verstanden – bitte nochmal')); };
    r.onend = () => { SP.hoert = false; mikroZustand(); };
    r.start(); hinweisLeiste(spr() === 'de' ? 'Ich höre zu … sag z. B. „Ich will mein Bad fliesen“' : T('Ich höre zu …') + ' ' + BEISPIELE[spr()].split('. ')[0]);
    setTimeout(() => { if (!SP.hoert) hinweisLeiste(''); }, 9000);
  } catch (e) { befehlTippen(); }
};
function befehlTippen(grund) {
  const beisp = spr() === 'de' ? ' (z. B. „Bad fliesen“, „Quittung speichern“, „Wie geht es weiter?“)' : ' (' + BEISPIELE[spr()] + ')';
  dialog((grund ? grund + ' ' : '') + T('Was möchtest du tun?') + beisp, [[T('Abbrechen'), null], [T('Los'), () => { const i = document.getElementById('befehl-eingabe'); befehlAusfuehren(i && i.value.trim()); }, true]]);
  const box = document.querySelector('#dialog .d-text');
  if (box && !document.getElementById('befehl-eingabe')) { const i = document.createElement('input'); i.id = 'befehl-eingabe'; i.className = 'befehl-eingabe'; i.placeholder = T('Befehl eintippen'); box.after(i); setTimeout(() => i.focus(), 50); i.onkeydown = (e) => { if (e.key === 'Enter') { document.getElementById('dialog').classList.remove('an'); befehlAusfuehren(i.value.trim()); } }; }
}
function mikroZustand() { const k = document.getElementById('mikro-knopf'); if (k) k.classList.toggle('hoert', SP.hoert); if (!SP.hoert) setTimeout(() => { const l = document.getElementById('zeig-leiste'); if (l && /höre zu|…/.test(l.textContent)) hinweisLeiste(''); }, 300); }

/* fester Mikrofon-Knopf über dem Lautsprecher */
(function () {
  const k = document.createElement('button'); k.id = 'mikro-knopf'; k.className = 'sprech-knopf mikro-knopf'; k.dataset.akt = 'sprachbefehl'; k.setAttribute('aria-label', 'Sprachbefehl'); k.innerHTML = ICON.mikro;
  document.body.appendChild(k);
  HILFE.sprachbefehl = 'Sprachsteuerung. Sag, was du machen willst – ich öffne die Seite und lasse den richtigen Knopf blinken.';
})();
