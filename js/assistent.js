/* Joum 4D Build – Planungs-Assistent (sprechen oder schreiben)
   Versteht Maße, Räume/Bereiche und Wünsche, stellt Rückfragen, macht mehrere Vorschläge und passt sie an.
   Heute: Regeln im Gerät. Später: KI-Sprachmodell auf dem Server mit demselben Ergebnis-Format (siehe Server-Checkliste). */

const AS = { verlauf: [], ctx: { wunsch: {} } };
const THEMEN = [
  [/garten|terrasse|rasen|hochbeet|teich|beet/i, 'garten'], [/badezimmer|\bbad\b|dusche|wanne/i, 'bad'], [/gäste-?wc|\bwc\b|toilette/i, 'gaestewc'], [/küche/i, 'kueche'],
  [/wohnzimmer|wohnraum/i, 'wohnzimmer'], [/schlafzimmer/i, 'schlafzimmer'], [/kinderzimmer/i, 'kinderzimmer'], [/büro|arbeitszimmer/i, 'buero'], [/flur|diele/i, 'flur'],
  [/fassade|außenwand|aussenwand|hauswand/i, 'fassade'], [/keller/i, 'keller'], [/dach/i, 'dach'], [/waschraum|hauswirtschaft/i, 'waschraum']
];

function zahlenAus(t) {
  const z = []; const re = /(\d+(?:[.,]\d+)?)\s*(cm|zentimeter|m\b|meter)?/gi; let m;
  while ((m = re.exec(t))) { let v = parseZahl(m[1]); if (/cm|zenti/i.test(m[2] || '')) v /= 100; if (v > 0 && v < 200) z.push({ v, i: m.index }); }
  return z;
}
function verstehen(text) {
  const t = text.toLowerCase(), c = AS.ctx, w = c.wunsch, neu = [];
  const th = THEMEN.find(([re]) => re.test(t)); if (th && th[1] !== c.thema) { c.thema = th[1]; neu.push('thema'); }
  // Maße: „12 m lang, 8 m breit“, „12 mal 8“, „12 x 8“
  const z = zahlenAus(t.replace(/budget[^0-9]*\d+[\d.,]*|\d+[\d.,]*\s*(€|euro)/g, ''));
  const lang = t.match(/(\d+(?:[.,]\d+)?)\s*(?:m|meter)?\s*(?:lang|länge)/), breit = t.match(/(\d+(?:[.,]\d+)?)\s*(?:m|meter)?\s*(?:breit|tief|breite|tiefe)/);
  if (lang) { c.L = parseZahl(lang[1]); neu.push('mass'); }
  if (breit) { c.T = parseZahl(breit[1]); neu.push('mass'); }
  if (!lang && !breit && z.length >= 2 && /mal|x|×|auf|und/.test(t)) { c.L = z[0].v; c.T = z[1].v; neu.push('mass'); }
  const fl = t.match(/(\d+(?:[.,]\d+)?)\s*(?:qm|m²|m2|quadratmeter)/); if (fl) { c.flaeche = parseZahl(fl[1]); neu.push('mass'); }
  // Wünsche
  if (/holz/.test(t) && !/kein holz|ohne holz/.test(t)) w.belag = 'holz';
  if (/wpc/.test(t)) w.belag = 'wpc';
  if (/stein|pflaster/.test(t) && !/kein stein/.test(t)) w.belag = 'stein';
  if (/beton/.test(t)) w.belag = 'beton';
  if (/ohne teich|kein teich|keinen teich/.test(t)) w.teich = false; else if (/teich/.test(t)) w.teich = true;
  if (/kinder|kind|familie/.test(t) && !/keine kinder|ohne kinder/.test(t)) w.kinder = true;
  if (/keine kinder|ohne kinder/.test(t)) w.kinder = false;
  if (/ohne rasen|kein rasen|keinen rasen/.test(t)) w.rasen = false; else if (/mit rasen|viel rasen/.test(t)) w.rasen = true;
  if (/pflegeleicht|wenig arbeit|wenig pflege/.test(t)) w.pflege = 'gering';
  if (/licht|beleuchtung/.test(t) && c.thema === 'garten') w.licht = true;
  if (/terrasse (größer|grösser|groß)|größere terrasse/.test(t)) w.terrasse = 'groesser';
  if (/terrasse kleiner|kleinere terrasse/.test(t)) w.terrasse = 'kleiner';
  const hb = t.match(/(\d+)\s*hochbeet/); if (hb) w.hochbeete = +hb[1]; else if (/hochbeet/.test(t) && w.hochbeete == null) w.hochbeete = 2;
  if (/ohne hochbeet|keine hochbeet/.test(t)) w.hochbeete = 0;
  const bu = t.match(/(?:budget|maximal|max\.?|höchstens|bis)\s*(\d+[\d.]*)\s*(?:€|euro|tausend|k)?/) || t.match(/(\d+[\d.]*)\s*(?:€|euro)/);
  if (bu) { let b = parseZahl(bu[1].replace(/\./g, '')); if (/tausend|\dk\b/.test(t) && b < 1000) b *= 1000; if (b >= 100) w.budget = b; }
  const stil = STILE.find((s) => t.includes(s.name.toLowerCase().split(' ')[0].toLowerCase())); if (stil) w.stil = stil.id;
  if (/kein fenster|ohne fenster|innenliegend/.test(t)) w.fenster = false; else if (/mit fenster|hat ein fenster/.test(t)) w.fenster = true;
  if (/neu|nochmal|von vorn|zurücksetzen/.test(t) && t.length < 25) { AS.ctx = { wunsch: {} }; return ['reset']; }
  return neu;
}

function antwort() {
  const c = AS.ctx, w = c.wunsch, teile = [], fragen = [];
  if (!c.thema) return { text: 'Was möchtest du planen? Zum Beispiel: „Garten 12 m lang, 8 m breit, schlag was vor“ oder „Bad 3 mal 2,5 ohne Fenster“.', fragen: [['Garten', 'Garten'], ['Badezimmer', 'Bad'], ['Küche', 'Küche'], ['Wohnzimmer', 'Wohnzimmer'], ['Fassade', 'Fassade'], ['Keller', 'Keller']] };
  if (c.thema === 'garten') {
    if (!c.L || !c.T) { if (c.flaeche) { c.L = Math.round(Math.sqrt(c.flaeche * 1.5)); c.T = Math.round(c.flaeche / c.L); } else return { text: 'Wie groß ist der Garten? Sag mir Länge (am Haus entlang) und Tiefe, z. B. „12 m lang und 8 m tief“.', fragen: [['10 × 8 m', '10 m lang 8 m tief'], ['15 × 10 m', '15 m lang 10 m tief'], ['20 × 12 m', '20 m lang 12 m tief']] }; }
    G.L = c.L; G.T = c.T; G.wunsch = Object.assign({}, w); delete G.wunsch.stil; gartenNeu();
    const liste = gartenListe();
    if (w.stil) { const i = liste.findIndex((x) => x.stil === w.stil); if (i >= 0) G.v = i; }
    teile.push(`Garten ${zahl(c.L)} × ${zahl(c.T)} m (${zahl(c.L * c.T, 0)} m²) – hier sind <b>${liste.length} Vorschläge</b>${w.budget ? ' bis ca. ' + euro(w.budget) : ''}.`);
    if (!w.belag) fragen.push(['Terrasse aus Holz', 'Terrasse aus Holz'], ['… aus Stein', 'Terrasse aus Stein'], ['… aus Beton', 'Terrasse aus Beton'], ['… aus WPC', 'Terrasse aus WPC']);
    if (w.kinder == null) fragen.push(['Mit Kindern', 'wir haben Kinder'], ['Ohne Kinder', 'ohne Kinder']);
    if (w.teich == null) fragen.push(['Mit Teich', 'mit Teich'], ['Ohne Teich', 'ohne Teich']);
    if (!w.pflege) fragen.push(['Pflegeleicht', 'pflegeleicht']);
    if (!w.budget) fragen.push(['Budget 5.000 €', 'Budget 5000 Euro'], ['Budget 15.000 €', 'Budget 15000 Euro']);
    return { text: teile.join(' '), garten: liste.slice(0, 10), fragen, hinweis: 'Sag z. B. „Terrasse größer“, „ohne Rasen“, „3 Hochbeete“ oder „Holz statt Stein“ – ich passe die Vorschläge an.' };
  }
  if (['fassade', 'keller', 'dach'].includes(c.thema)) {
    const anl = { fassade: 'fassade', keller: 'keller_abdichten', dach: 'dach' }[c.thema], a = ANLEITUNGEN[anl];
    const menge = c.thema === 'keller' ? (c.L || (c.flaeche ? c.flaeche / 2 : 0)) : (c.flaeche || (c.L && c.T ? c.L * c.T : 0));
    if (!menge) return { text: c.thema === 'keller' ? 'Wie lang ist die Kellerwand, die abgedichtet werden soll (in Metern)?' : `Wie groß ist die ${c.thema === 'dach' ? 'Dachfläche' : 'Fassadenfläche'}? z. B. „80 qm“ oder „12 m lang, 6 m hoch“.`, fragen: c.thema === 'keller' ? [['8 m', '8 m lang'], ['15 m', '15 m lang']] : [['60 m²', '60 qm'], ['120 m²', '120 qm']] };
    const z = zeitSchaetzung(anl, menge);
    return { text: `${a.t}: ${zahl(menge)} ${a.einheit}. Richtwert selbst ${euro(a.kosten[0] * menge)} · mit Fachbetrieb ${euro(a.kosten[1] * menge)}. Profi-Aufwand ca. ${zahl(z[2].h, 0)} Std. (${z[2].tage} Arbeitstage).`, aktion: { anl, menge, raum: c.thema === 'keller' ? 'keller' : c.thema === 'dach' ? 'dach' : 'fassade' }, fragen: c.thema === 'fassade' ? [['Nur streichen', 'nur streichen'], ['Dämmen (WDVS)', 'dämmen']] : [] };
  }
  // Innenräume
  const r = raum(c.thema);
  if (!c.L || !c.T) { if (c.flaeche) { c.L = Math.round(Math.sqrt(c.flaeche) * 10) / 10; c.T = Math.round(c.flaeche / c.L * 10) / 10; } else return { text: `Wie groß ist ${r.name === 'Badezimmer' ? 'das Bad' : 'der Raum'}? z. B. „3 mal 2,5 m“.`, fragen: [['2 × 2 m', '2 mal 2 m'], ['3 × 2,5 m', '3 mal 2,5 m'], ['4 × 3 m', '4 mal 3 m']] }; }
  const fr = [];
  if (['bad', 'gaestewc'].includes(c.thema) && w.fenster == null) fr.push(['Hat ein Fenster', 'mit Fenster'], ['Ohne Fenster', 'ohne Fenster']);
  fr.push(...STILE.slice(0, 4).map((s) => [s.name, s.name]));
  return { text: `${r.name} ${zahl(c.L)} × ${zahl(c.T)} m. Ich lege dir 3 Varianten an – fertig eingerichtet nach den Raumregeln (Tür frei, Bewegungsflächen${['bad', 'gaestewc'].includes(c.thema) ? ', Lüftung' : ''}).`, raum: true, fragen: fr };
}

function raumVarianten() {
  const c = AS.ctx, w = c.wunsch, stile = w.stil ? [w.stil, 'hell', 'skandi'].filter((x, i, a) => a.indexOf(x) === i).slice(0, 3) : ['hell', 'skandi', 'japandi'];
  return stile.map((sid) => {
    const p = { id: 'tmp', raum: c.thema, bereich: 'innen', breite: Math.round(c.L * 100), tiefe: Math.round(c.T * 100), plan: [], stil: sid, fenster: w.fenster };
    const v = beispielEinrichtung(p); v.stil = sid; return v;
  });
}

AKT.asSenden = () => { const i = document.getElementById('asEingabe'); if (!i || !i.value.trim()) return; asNachricht(i.value.trim()); };
AKT.asChip = (d) => asNachricht(d.t);
AKT.asMikro = () => diktieren((t) => asNachricht(t));
AKT.asNeu = () => { AS.verlauf = []; AS.ctx = { wunsch: {} }; render(); };
function asNachricht(text) {
  AS.verlauf.push({ wer: 'ich', text });
  verstehen(text);
  AS.verlauf.push(Object.assign({ wer: 'app' }, antwort()));
  render(); setTimeout(() => { const l = document.getElementById('asEnde'); if (l) l.scrollIntoView({ behavior: 'smooth' }); }, 50);
}
AKT.asGarten = (d) => { const liste = gartenListe(); G.v = liste.findIndex((x) => x.id === d.id); if (G.v < 0) G.v = 0; geh('#/garten'); };
AKT.asGarten4D = (d) => { const v = gartenListe().find((x) => x.id === d.id); if (v) zeigeGarten4D(v); };
AKT.asRaumAnlegen = (d) => {
  const vs = raumVarianten(), v = vs[+d.i], c = AS.ctx;
  const p = projektAnlegen(c.thema, null, { breite: v.breite, tiefe: v.tiefe, plan: v.plan, stil: v.stil, fenster: c.wunsch.fenster, waende: [{ n: 'Wand A', l: c.L, h: 2.5 }, { n: 'Wand B', l: c.T, h: 2.5 }, { n: 'Wand C', l: c.L, h: 2.5 }, { n: 'Wand D', l: c.T, h: 2.5 }] });
  toast('Projekt angelegt'); geh('#/planer/' + p.id);
};
AKT.asRaum4D = (d) => { const v = raumVarianten()[+d.i]; window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE; zeigeBau4D(v, STILE.find((s) => s.id === v.stil)); };
AKT.asAnlAnlegen = (d) => { const p = projektAnlegen(d.raum, d.anl, { menge: parseZahl(d.menge) }); p.menge = parseZahl(d.menge); speichern(); geh('#/projekt/' + p.id); };

route('assistent', () => {
  if (!AS.verlauf.length) AS.verlauf.push(Object.assign({ wer: 'app' }, antwort()));
  const blase = (m) => {
    if (m.wer === 'ich') return `<div class="as-ich">${esc(m.text)}</div>`;
    let x = `<div class="as-app"><div>${m.text}</div>`;
    if (m.garten) x += `<div class="as-scroll">${m.garten.map((v) => `<div class="as-karte">${gartenSVG(v, true)}<b>${esc(v.name)}</b><span class="klein">${esc(BELAEGE[v.belag].n)} · ca. ${euro(v.summe)}</span><div class="zeile"><button class="chip" data-akt="asGarten4D" data-id="${v.id}">▶ 4D</button><button class="chip" data-akt="asGarten" data-id="${v.id}">Ansehen</button></div></div>`).join('')}</div>`;
    if (m.raum) x += `<div class="as-scroll">${raumVarianten().map((v, i) => `<div class="as-karte"><div class="as-farben">${(() => { const s = STILE.find((y) => y.id === v.stil); return [s.wand, s.boden, s.moebel, s.akzent].map((c) => `<span style="background:${c}"></span>`).join(''); })()}</div><b>${esc(STILE.find((y) => y.id === v.stil).name)}</b><span class="klein">${v.plan.length} Objekte: ${esc(v.plan.slice(0, 4).map((e) => e.n.split(' ')[0]).join(', '))} …</span><div class="zeile"><button class="chip" data-akt="asRaum4D" data-i="${i}">▶ 4D</button><button class="chip" data-akt="asRaumAnlegen" data-i="${i}">Übernehmen</button></div></div>`).join('')}</div>`;
    if (m.aktion) x += `<div class="zeile"><button class="chip" data-akt="schichten4D" data-anl="${m.aktion.anl}">▶ 4D Schicht für Schicht</button><button class="chip" data-akt="asAnlAnlegen" data-anl="${m.aktion.anl}" data-raum="${m.aktion.raum}" data-menge="${m.aktion.menge}">Als Projekt anlegen</button><a class="chip" href="#/anleitung/${m.aktion.anl}">Anleitung</a></div>`;
    if (m.fragen && m.fragen.length) x += `<div class="chips">${m.fragen.map(([n, t]) => `<button class="chip" data-akt="asChip" data-t="${esc(t)}">${esc(n)}</button>`).join('')}</div>`;
    if (m.hinweis) x += `<div class="klein">${esc(m.hinweis)}</div>`;
    return x + '</div>';
  };
  return kopf('Planungs-Assistent', 'Sprechen oder schreiben', '#/') + `<div class="inhalt as-inhalt">
    ${AS.verlauf.map(blase).join('')}<div id="asEnde"></div>
    <div class="as-leiste"><button class="rund" aria-label="Spracheingabe" data-akt="asMikro">${ICON.mikro}</button><input id="asEingabe" placeholder="z. B. Garten 12 m lang, 8 m tief, mit Kindern"><button class="rund hell-rund" aria-label="Senden" data-akt="asSenden">›</button></div>
    <div class="zeile"><button class="btn klein-btn" data-akt="asNeu">Neu beginnen</button></div>
    <p class="klein">Der Assistent versteht Maße, Räume und Wünsche und arbeitet mit den Fachregeln der App. Ein freies Gespräch wie mit einem KI-Chat kommt mit dem KI-Server.</p>
  </div>`;
});

document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.id === 'asEingabe') { e.preventDefault(); AKT.asSenden(); } });
