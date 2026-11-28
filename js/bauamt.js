/* Joum 4D Build – Bauamt-Check: Brauche ich eine Genehmigung? Wer ist zuständig? Fertiges Anschreiben.
   Grundsatz: Errichtung, Änderung, Nutzungsänderung und Abbruch sind genehmigungspflichtig, außer die Landesbauordnung
   stellt sie frei – das regelt jedes Bundesland anders. Die App gibt eine Ersteinschätzung + Fragen ans Bauamt.
   Verbindlich ist nur die Auskunft der unteren Bauaufsichtsbehörde (bzw. ein Bauvorbescheid). */

const BUNDESLAENDER = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];
const LAND_ONLINE = {
  'Bayern': ['BayernPortal – Digitaler Bauantrag', 'https://www.bayernportal.de/dokumente/onlineservice/84109939252/J'],
  'Hamburg': ['Hamburg – Digitale Baugenehmigung', 'https://www.hamburg.de/politik-und-verwaltung/behoerden/behoerde-fuer-stadtentwicklung-und-wohnen/themen/wohnen/bauen/wege-zur-baugenehmigung/faqshbauo-190372'],
  'Bremen': ['Bremen – Bauvoranfrage online', 'https://www.service.bremen.de/dienstleistungen/bauvoranfrage-stellen-186272']
};
/* Ampel: rot = Genehmigung nötig, gelb = meist frei, aber prüfen/anzeigen, gruen = in der Regel verfahrensfrei */
const VORHABEN = [
  { id: 'dachausbau', t: 'Dachgeschoss zu Wohnraum ausbauen', anl: ['dach_daemmen_innen', 'oberste_decke'], pruef: (a) => (['Nordrhein-Westfalen', 'Sachsen'].includes(a.land)
      ? ['gelb', `${a.land} erlaubt den Dachausbau zu Wohnzwecken (auch mit Gauben) unter Bedingungen verfahrensfrei – Brandschutz, Statik und Rettungsweg müssen trotzdem stimmen.`]
      : ['rot', 'Aus einem unausgebauten Dach wird Wohnraum = Nutzungsänderung. Das ist in den meisten Ländern genehmigungspflichtig bzw. braucht ein Freistellungsverfahren mit Bauvorlagen.']),
    fragen: ['Ist der Ausbau des Dachgeschosses zu Wohnraum genehmigungspflichtig oder verfahrensfrei?', 'Welche Anforderungen gelten an den zweiten Rettungsweg (Fenstergröße, Brüstungshöhe)?', 'Müssen Statik- und Wärmeschutznachweis (GEG) eingereicht werden?'], pflicht: ['Statiker (Decke/Lasten)', 'Zweiter Rettungsweg (Fenster ≥ 0,90 × 1,20 m)', 'Wärmeschutz nach GEG', 'Raumhöhe für Aufenthaltsräume'] },
  { id: 'gaube', t: 'Dachgaube bauen', anl: ['dach'], pruef: (a) => (['Nordrhein-Westfalen', 'Sachsen'].includes(a.land) ? ['gelb', 'In ' + a.land + ' im Zuge des Dachausbaus oft verfahrensfrei – Bebauungsplan und Abstandsflächen prüfen.'] : ['rot', 'Gauben verändern die Gebäudehülle und Ansicht – meist genehmigungspflichtig.']),
    fragen: ['Ist die geplante Dachgaube genehmigungspflichtig?', 'Gibt es Vorgaben im Bebauungsplan (Gaubenbreite, Dachneigung)?'], pflicht: ['Statik (Wechsel in den Sparren)', 'Abstandsflächen', 'Bebauungsplan'] },
  { id: 'dachfenster', t: 'Dachfenster einbauen', anl: ['dachfenster'], pruef: () => ['gruen', 'Dachflächenfenster sind in der Regel verfahrensfrei (Ausnahme: Denkmalschutz, Gestaltungssatzung).'], fragen: ['Gibt es für das Gebäude eine Gestaltungssatzung, die Dachfenster einschränkt?'], pflicht: ['Wechsel im Sparren fachgerecht'] },
  { id: 'wand', t: 'Wand entfernen / Durchbruch', anl: ['trockenbau_wand', 'vorsatzschale'], frage: ['tragend', 'Ist die Wand tragend?'], pruef: (a) => (a.tragend ? ['gelb', 'Tragende Wand: oft verfahrensfrei, aber ein Statiker MUSS den Sturz/Träger berechnen – sonst Einsturzgefahr. Bei Gebäudeklasse 3+ oft Nachweis beim Bauamt.'] : ['gruen', 'Nicht tragende Innenwand: in der Regel verfahrensfrei.']),
    fragen: ['Ist der Durchbruch in der tragenden Wand genehmigungs- oder anzeigepflichtig?', 'Muss der Standsicherheitsnachweis eingereicht werden?'], pflicht: ['Statiker bei tragender Wand', 'Elektro-/Wasserleitungen in der Wand prüfen'] },
  { id: 'fenster_neu', t: 'Fenster/Tür in Außenwand neu oder größer', anl: ['fenster', 'haustuer'], pruef: () => ['gelb', 'Austausch in gleicher Größe: frei. Neue oder größere Öffnungen ändern Fassade und Statik – je nach Land verfahrensfrei oder anzeigepflichtig; an der Grundstücksgrenze oft nicht erlaubt.'],
    fragen: ['Ist eine neue Fensteröffnung in der Außenwand genehmigungspflichtig?', 'Gelten Abstands- oder Brandschutzvorgaben, weil die Wand nahe der Grundstücksgrenze liegt?'], pflicht: ['Statik (Sturz)', 'Abstand zur Grundstücksgrenze/Brandwand'] },
  { id: 'fassade', t: 'Fassade dämmen / erneuern', anl: ['fassade'], pruef: () => ['gelb', 'Meist verfahrensfrei. Prüfen: Dämmung an der Grundstücksgrenze (Abstandsflächen, Überbau beim Nachbarn), Brandschutz der Dämmung, Denkmalschutz.'],
    fragen: ['Ist die Außendämmung verfahrensfrei?', 'Wie wird die Dämmstärke bei den Abstandsflächen berücksichtigt?'], pflicht: ['Brandschutz der Dämmung', 'Abstandsflächen'] },
  { id: 'carport', t: 'Carport / Garage', anl: ['carport', 'garagentor'], frage: ['flaeche', 'Grundfläche in m²'], pruef: (a) => {
      const grenze = { 'Baden-Württemberg': 30, 'Bayern': 50, 'Rheinland-Pfalz': 50 }[a.land];
      if (!a.flaeche) return ['gelb', 'Je nach Land bis ca. 30–50 m² verfahrensfrei – Grundfläche eintragen.'];
      if (grenze) return a.flaeche < grenze ? ['gruen', `In ${a.land} unter ${grenze} m² in der Regel verfahrensfrei (Wandhöhe beachten).`] : ['rot', `Über ${grenze} m² braucht es in ${a.land} eine Genehmigung.`];
      return a.flaeche <= 30 ? ['gelb', 'Bis ca. 30 m² in vielen Ländern verfahrensfrei – Grenze für ' + (a.land || 'dein Land') + ' beim Bauamt bestätigen.'] : ['rot', 'Über 30 m² in vielen Ländern genehmigungspflichtig.'];
    }, fragen: ['Ist der geplante Carport/die Garage mit der Grundfläche verfahrensfrei?', 'Darf direkt an die Grundstücksgrenze gebaut werden (Grenzbebauung, Länge, Wandhöhe)?'], pflicht: ['Grenzbebauung', 'Stellplatz-/Zufahrtsregeln'] },
  { id: 'ueberdachung', t: 'Terrassenüberdachung / Wintergarten', anl: ['terrasse', 'vordach'], frage: ['flaeche', 'Fläche in m²'], pruef: (a) => (a.wintergarten ? ['rot', 'Ein beheizter Wintergarten ist ein Aufenthaltsraum = genehmigungspflichtig.'] : (a.land === 'Baden-Württemberg' ? (a.flaeche && a.flaeche > 30 ? ['rot', 'In Baden-Württemberg über 30 m² genehmigungspflichtig.'] : ['gruen', 'In Baden-Württemberg bis 30 m² verfahrensfrei.']) : ['gelb', 'Offene Überdachungen sind bis zu einer bestimmten Fläche oft verfahrensfrei – Grenze ist je Land verschieden.'])),
    fragen: ['Ist die geplante Terrassenüberdachung verfahrensfrei?', 'Welche maximale Fläche/Tiefe gilt?'], pflicht: ['Nachbarrecht (Abstand)', 'Schneelast/Statik'] },
  { id: 'gartenhaus', t: 'Gartenhaus', anl: ['gartenhaus'], pruef: (a) => (a.wohnen ? ['rot', 'Ein Gartenhaus zum Wohnen ist eine Nutzungsänderung = genehmigungspflichtig.'] : ['gelb', 'Kleine Gartenhäuser sind oft verfahrensfrei (Grenze nach Rauminhalt/Fläche je Land). Im Außenbereich nicht.']),
    fragen: ['Bis zu welcher Größe ist ein Gartenhaus auf meinem Grundstück verfahrensfrei?'], pflicht: ['Abstand zur Grenze', 'Bebauungsplan'] },
  { id: 'anbau', t: 'Anbau / Aufstockung', anl: [], pruef: () => ['rot', 'Anbau und Aufstockung sind genehmigungspflichtig. Den Bauantrag muss ein bauvorlageberechtigter Entwurfsverfasser (Architekt/Bauingenieur) unterschreiben.'],
    fragen: ['Ist ein Anbau in dieser Größe nach Bebauungsplan zulässig (GRZ/GFZ, Baugrenzen)?'], pflicht: ['Architekt/Entwurfsverfasser', 'Statik', 'GEG'] },
  { id: 'zaun', t: 'Zaun / Mauer', anl: ['zaun'], pruef: () => ['gruen', 'Zäune und Mauern bis ca. 1,8–2 m sind meist verfahrensfrei – Nachbarrecht und Bebauungsplan beachten.'], fragen: ['Welche Höhe ist für Einfriedungen zur Straße/zum Nachbarn erlaubt?'], pflicht: ['Nachbarrecht'] },
  { id: 'pool', t: 'Pool / Teich', anl: ['teich'], pruef: () => ['gruen', 'Schwimmbecken bis ca. 100 m³ sind in vielen Ländern verfahrensfrei.'], fragen: ['Ist ein Pool dieser Größe verfahrensfrei?'], pflicht: ['Abstand zur Grenze', 'Absturzsicherung für Kinder'] },
  { id: 'solar', t: 'Solaranlage auf dem Dach', anl: [], pruef: () => ['gruen', 'Solaranlagen auf Dächern sind in der Regel verfahrensfrei (Ausnahme Denkmalschutz).'], fragen: ['Gibt es Einschränkungen durch Denkmalschutz oder Gestaltungssatzung?'], pflicht: ['Statik Dach', 'Netzbetreiber anmelden'] },
  { id: 'abriss', t: 'Abriss (Gebäude/Gebäudeteil)', anl: [], pruef: () => ['rot', 'Abbruch muss je nach Land angezeigt oder genehmigt werden.'], fragen: ['Ist der Abbruch anzeige- oder genehmigungspflichtig?'], pflicht: ['Asbest/Schadstoffe prüfen', 'Nachbarn informieren'] },
  { id: 'treppe', t: 'Neue Treppe mit Deckenöffnung', anl: ['treppe_renovieren'], pruef: () => ['gelb', 'Innen in Wohngebäuden oft verfahrensfrei – die Deckenöffnung braucht aber einen Statiker. Die Treppe selbst nach DIN 18065 planen (Treppen-Planer).'], fragen: ['Ist der Einbau einer neuen Treppe mit Deckenöffnung verfahrensfrei?'], pflicht: ['Statik Deckenöffnung', 'DIN 18065'] }
];
function bauamtDaten() { S.bauamt = S.bauamt || { adr: {}, antw: {}, vorhaben: '' }; return S.bauamt; }
function zustaendig(adr) {
  if (!adr.kreis && !adr.gemeinde) return '';
  if (adr.kreisTyp && /kreisfreie stadt|stadtkreis/i.test(adr.kreisTyp)) return 'Bauaufsicht der Stadt ' + adr.kreis;
  if (['Berlin', 'Hamburg', 'Bremen'].includes(adr.land)) return 'Bauaufsicht ' + (adr.land === 'Berlin' ? 'des Bezirksamts (Bezirk des Grundstücks)' : adr.land);
  return 'Untere Bauaufsicht: ' + (adr.kreis ? 'Landratsamt / Kreisverwaltung ' + adr.kreis : '') + (adr.gemeinde ? ' – in größeren Städten ggf. die Stadt ' + adr.gemeinde + ' selbst' : '');
}
async function plzSuchen(plz) {
  try {
    const r = await fetch('https://openplzapi.org/de/Localities?postalCode=' + encodeURIComponent(plz));
    if (!r.ok) return null; const j = await r.json(); if (!j.length) return null;
    const x = j[0];
    return { ort: x.name, gemeinde: x.municipality && x.municipality.name, kreis: x.district && x.district.name, kreisTyp: x.district && x.district.type, land: x.federalState && x.federalState.name };
  } catch (e) { return null; }
}

route('bauamt', (_, q) => {
  const B = bauamtDaten(), a = B.adr;
  if (q && q.v) B.vorhaben = q.v;
  const v = VORHABEN.find((x) => x.id === B.vorhaben);
  const ant = Object.assign({ land: a.land }, B.antw[B.vorhaben] || {});
  const erg = v ? v.pruef(ant) : null;
  const farbe = { rot: ['✗', 'Genehmigung nötig'], gelb: ['⚠', 'Meist frei – aber prüfen / anzeigen'], gruen: ['✓', 'In der Regel verfahrensfrei'] };
  const zust = zustaendig(a);
  return kopf('Bauamt-Check', 'Brauche ich eine Genehmigung?', '#/') + `<div class="inhalt bauamt">
    <section class="karte"><h3>1. Wo ist das Grundstück?</h3>
      <div class="raster2"><label class="feld">Straße & Nr.<input data-ein="baAdr" data-k="strasse" value="${esc(a.strasse || '')}" autocomplete="street-address"></label>
      <label class="feld">PLZ<input data-ein="baPlz" inputmode="numeric" maxlength="5" value="${esc(a.plz || '')}" autocomplete="postal-code"></label></div>
      <label class="feld">Ort<input data-ein="baAdr" data-k="ort" value="${esc(a.ort || '')}"></label>
      <div class="unter">Bundesland</div><div class="zeile wrap">${BUNDESLAENDER.map((l) => `<button class="chip ${a.land === l ? 'an' : ''}" data-akt="baLand" data-l="${l}">${l}</button>`).join('')}</div>
      ${zust ? `<div class="hinweis gruen"><b>Zuständig:</b> ${esc(zust)}</div>` : '<p class="klein grau">PLZ eintragen – ich suche Landkreis und zuständiges Bauamt automatisch.</p>'}
      <div class="zeile wrap"><button class="chip ${a.denkmal ? 'an' : ''}" data-akt="baFlag" data-k="denkmal">Denkmalschutz</button><button class="chip ${a.bplan ? 'an' : ''}" data-akt="baFlag" data-k="bplan">Bebauungsplan vorhanden</button><button class="chip ${a.weg ? 'an' : ''}" data-akt="baFlag" data-k="weg">Eigentumswohnung (WEG)</button><button class="chip ${a.miete ? 'an' : ''}" data-akt="baFlag" data-k="miete">Ich bin Mieter</button></div>
    </section>
    <section class="karte"><h3>2. Was hast du vor?</h3><div class="zeile wrap">${VORHABEN.map((x) => `<button class="chip ${B.vorhaben === x.id ? 'an' : ''}" data-akt="baVorhaben" data-v="${x.id}">${esc(x.t)}</button>`).join('')}</div>
      ${v && v.frage ? (v.frage[0] === 'tragend' ? `<div class="zeile wrap"><span class="klein">${v.frage[1]}</span><button class="chip ${ant.tragend ? 'an' : ''}" data-akt="baAntw" data-k="tragend" data-w="1">Ja</button><button class="chip ${ant.tragend === false ? 'an' : ''}" data-akt="baAntw" data-k="tragend" data-w="0">Nein</button></div>` : `<label class="feld">${v.frage[1]}<input inputmode="decimal" data-ein="baZahl" data-k="${v.frage[0]}" value="${ant[v.frage[0]] || ''}"></label>`) : ''}
      ${v && v.id === 'ueberdachung' ? `<button class="chip ${ant.wintergarten ? 'an' : ''}" data-akt="baAntw" data-k="wintergarten" data-w="${ant.wintergarten ? 0 : 1}">Beheizter Wintergarten</button>` : ''}
      ${v && v.id === 'gartenhaus' ? `<button class="chip ${ant.wohnen ? 'an' : ''}" data-akt="baAntw" data-k="wohnen" data-w="${ant.wohnen ? 0 : 1}">Soll bewohnt werden</button>` : ''}
    </section>
    ${v ? `<section class="karte ba-ergebnis ${erg[0]}"><div class="ba-ampel">${farbe[erg[0]][0]} ${farbe[erg[0]][1]}</div><p>${esc(erg[1])}</p>
      ${a.denkmal ? '<div class="hinweis rot">Denkmalschutz: Jede Änderung braucht zusätzlich die denkmalrechtliche Erlaubnis – vorher bei der Denkmalschutzbehörde fragen.</div>' : ''}
      ${a.weg ? '<div class="hinweis">Eigentumswohnung: Änderungen am Gemeinschaftseigentum (Fassade, Dach, tragende Wände, Fenster) brauchen einen Beschluss der Eigentümerversammlung.</div>' : ''}
      ${a.miete ? '<div class="hinweis">Als Mieter brauchst du für bauliche Änderungen die schriftliche Zustimmung des Vermieters.</div>' : ''}
      <div class="unter">Darauf musst du achten</div><ul>${v.pflicht.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="klein grau">Ersteinschätzung nach Landesbauordnungen – verbindlich ist nur die Auskunft deines Bauamts. Einen Bauantrag muss meist ein Architekt/Bauingenieur (Entwurfsverfasser) unterschreiben.</p>
    </section>
    <section class="karte"><h3>3. Anfrage ans Bauamt</h3><p class="klein">Fertiger Text mit deinen Angaben – kopieren, per E-Mail senden oder ausdrucken.</p>
      <label class="feld">Dein Name<input data-ein="baAdr" data-k="name" value="${esc(a.name || (S.konto && S.konto.name) || '')}"></label>
      <label class="feld">E-Mail des Bauamts (falls bekannt)<input type="email" data-ein="baAdr" data-k="amtMail" value="${esc(a.amtMail || '')}" placeholder="bauaufsicht@…"></label>
      <textarea class="ba-text" id="ba-text" rows="14">${esc(bauamtText(v, a, ant))}</textarea>
      <div class="zeile wrap"><button class="btn hell" data-akt="baMail">E-Mail öffnen</button><button class="btn" data-akt="baKopieren">Kopieren</button><button class="btn" data-akt="baDrucken">Drucken / PDF</button></div>
      ${LAND_ONLINE[a.land] ? `<a class="btn voll" href="${LAND_ONLINE[a.land][1]}" target="_blank" rel="noopener">${esc(LAND_ONLINE[a.land][0])}</a>` : ''}
      ${a.kreis || a.ort ? `<a class="btn voll" href="https://www.google.com/search?q=${encodeURIComponent('Bauaufsicht ' + (a.kreis || a.ort) + ' Kontakt E-Mail')}" target="_blank" rel="noopener">Kontakt deines Bauamts suchen</a>` : ''}
    </section>` : ''}
  </div>`;
});
function bauamtText(v, a, ant) {
  if (!v) return '';
  const p = aktivesProjekt(), heute = new Date().toLocaleDateString('de-DE');
  const details = [];
  if (p && v.anl.includes(p.anleitung)) details.push(`Raum/Bereich: ${p.name}, ca. ${zahl(p.breite / 100)} × ${zahl(p.tiefe / 100)} m`);
  if (ant.flaeche) details.push('Geplante Fläche: ca. ' + zahl(ant.flaeche) + ' m²');
  if (ant.tragend !== undefined) details.push('Die Wand ist ' + (ant.tragend ? 'tragend' : 'nicht tragend'));
  if (a.denkmal) details.push('Das Gebäude steht unter Denkmalschutz.');
  return `${a.name || '[Name]'}
${a.strasse || '[Straße, Nr.]'}
${a.plz || '[PLZ]'} ${a.ort || '[Ort]'}

An die untere Bauaufsichtsbehörde
${a.kreis ? ((a.kreisTyp && /kreisfreie stadt|stadtkreis/i.test(a.kreisTyp)) ? 'Stadt ' : 'Landratsamt / Kreisverwaltung ') + a.kreis : (a.ort || '')}

${a.ort || '[Ort]'}, ${heute}

Anfrage zur Genehmigungspflicht – ${v.t}
Grundstück: ${a.strasse || '[Straße, Nr.]'}, ${a.plz || ''} ${a.ort || ''}${a.flurstueck ? ', Flurstück ' + a.flurstueck : ''}

Sehr geehrte Damen und Herren,

ich plane folgendes Vorhaben: ${v.t}.
${details.map((d) => '– ' + d).join('\n')}

Ich bitte um Auskunft zu folgenden Fragen:
${v.fragen.map((f, i) => (i + 1) + '. ' + f).join('\n')}

Falls eine Genehmigung oder Anzeige erforderlich ist: Welche Unterlagen benötigen Sie, und kann ich sie über Ihren Online-Dienst einreichen?

Skizze und Fotos sende ich gern nach.

Mit freundlichen Grüßen
${a.name || '[Name]'}`;
}
EIN.baAdr = (v, d) => aendern(() => { bauamtDaten().adr[d.k] = v.trim(); }, 'Angabe gespeichert');
EIN.baPlz = async (v) => {
  const plz = v.trim(); aendern(() => { bauamtDaten().adr.plz = plz; }, 'PLZ gespeichert');
  if (!/^\d{5}$/.test(plz)) return;
  const r = await plzSuchen(plz);
  if (r) { aendern(() => { Object.assign(bauamtDaten().adr, { ort: bauamtDaten().adr.ort || r.ort, gemeinde: r.gemeinde, kreis: r.kreis, kreisTyp: r.kreisTyp, land: r.land || bauamtDaten().adr.land }); }, 'Bauamt ermittelt'); toast('Gefunden: ' + (r.kreis || r.ort) + ', ' + (r.land || '')); }
  else toast('PLZ-Suche gerade nicht möglich – bitte Bundesland antippen');
};
AKT.baLand = (d) => aendern(() => { bauamtDaten().adr.land = d.l; }, 'Bundesland gewählt');
AKT.baFlag = (d) => aendern(() => { const a = bauamtDaten().adr; a[d.k] = !a[d.k]; }, 'Angabe geändert');
AKT.baVorhaben = (d) => aendern(() => { bauamtDaten().vorhaben = d.v; }, 'Vorhaben gewählt');
AKT.baAntw = (d) => aendern(() => { const B = bauamtDaten(); B.antw[B.vorhaben] = B.antw[B.vorhaben] || {}; B.antw[B.vorhaben][d.k] = d.w === '1'; }, 'Antwort gespeichert');
EIN.baZahl = (v, d) => aendern(() => { const B = bauamtDaten(); B.antw[B.vorhaben] = B.antw[B.vorhaben] || {}; B.antw[B.vorhaben][d.k] = parseZahl(v); }, 'Angabe gespeichert');
function baText() { const t = document.getElementById('ba-text'); return t ? t.value : ''; }
AKT.baMail = () => { const B = bauamtDaten(), v = VORHABEN.find((x) => x.id === B.vorhaben); location.href = 'mailto:' + encodeURIComponent(B.adr.amtMail || '') + '?subject=' + encodeURIComponent('Anfrage zur Genehmigungspflicht – ' + (v ? v.t : 'Bauvorhaben')) + '&body=' + encodeURIComponent(baText()); };
AKT.baKopieren = () => { try { navigator.clipboard.writeText(baText()).then(() => toast('Text kopiert'), () => toast('Kopieren nicht erlaubt – Text markieren')); } catch (e) { toast('Kopieren nicht erlaubt'); } };
AKT.baDrucken = () => { const w = window.open('', '_blank'); if (!w) { info('Drucken wurde blockiert – Text kopieren und in ein Dokument einfügen.'); return; } w.document.write('<pre style="font:14px/1.5 Arial,sans-serif;white-space:pre-wrap;margin:2cm">' + esc(baText()) + '</pre>'); w.document.close(); w.focus(); w.print(); };
/* Für Projekte: passendes Vorhaben zur Anleitung */
function vorhabenFuer(anl) { return VORHABEN.find((x) => x.anl.includes(anl)); }
HILFE.baVorhaben = 'Vorhaben wählen – ich sage dir, ob du eine Genehmigung brauchst.';
HILFE.baMail = 'Anfrage als E-Mail öffnen – du musst nur noch auf Senden tippen.';
