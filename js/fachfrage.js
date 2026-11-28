/* Joum 4D Build – „Frage an Profi“: bezahlte Fachfrage an Architekten & Handwerker.
   DEMO-MODUS: Oberfläche und Ablauf sind fertig, es fließt noch KEIN echtes Geld.
   Später (Server): Bezahlung über lizenzierten Marktplatz-Zahlungsdienst (z. B. Stripe Connect / Mangopay):
   Geld wird beim Absenden vorgemerkt, erst bei Antwort an den Profi ausgezahlt, Provision automatisch abgezogen,
   keine Antwort in 48 h → Geld zurück. Siehe SERVER-CHECKLISTE.md. */

const FF = { provision: 0.2, antwortStunden: 48, demo: true };
const FACH = [
  { id: 'architekt', name: 'Architekt/in', icon: '📐', bsp: 'Darf die Wand raus? Wie teile ich den Raum am besten auf?' },
  { id: 'statik', name: 'Statiker/in', icon: '🏗️', bsp: 'Ist das eine tragende Wand? Hält die Decke den Durchbruch?' },
  { id: 'elektro', name: 'Elektriker/in', icon: '⚡', bsp: 'Reicht meine Sicherung für Herd und Backofen?' },
  { id: 'sanitaer', name: 'Sanitär/Heizung', icon: '🚿', bsp: 'Reicht das Gefälle für die bodengleiche Dusche?' },
  { id: 'trockenbau', name: 'Trockenbau/Ausbau', icon: '🧱', bsp: 'Welches Profil für die Zwischenwand mit Tür?' },
  { id: 'fliesen', name: 'Fliesenleger/in', icon: '🔲', bsp: 'Kann ich auf die alten Fliesen drauf fliesen?' },
  { id: 'dach', name: 'Dachdecker/in', icon: '🏠', bsp: 'Kann ich das Dach von innen dämmen?' },
  { id: 'energie', name: 'Energieberater/in', icon: '🌱', bsp: 'Welche Dämmung bringt Förderung?' }
];
const PROFIS = [
  { id: 'pa1', name: 'Architektin Beispiel M.', fach: 'architekt', preis: 39, std: 24, sterne: 4.9, antworten: 212, siegel: ['Architektenkammer'] },
  { id: 'pa2', name: 'Architekturbüro Beispiel K.', fach: 'architekt', preis: 29, std: 48, sterne: 4.6, antworten: 87, siegel: ['Architektenkammer'] },
  { id: 'ps1', name: 'Ing.-Büro Statik Beispiel', fach: 'statik', preis: 49, std: 24, sterne: 4.8, antworten: 140, siegel: ['Ingenieurkammer'] },
  { id: 'pe1', name: 'Elektromeister Beispiel R.', fach: 'elektro', preis: 19, std: 12, sterne: 4.7, antworten: 330, siegel: ['Meister', 'Handwerksrolle'] },
  { id: 'pe2', name: 'Elektro Beispiel GmbH', fach: 'elektro', preis: 15, std: 24, sterne: 4.4, antworten: 95, siegel: ['Handwerksrolle'] },
  { id: 'pw1', name: 'SHK-Meister Beispiel T.', fach: 'sanitaer', preis: 19, std: 24, sterne: 4.8, antworten: 260, siegel: ['Meister', 'Handwerksrolle'] },
  { id: 'pt1', name: 'Ausbau Beispiel S.', fach: 'trockenbau', preis: 12, std: 12, sterne: 4.6, antworten: 180, siegel: ['Handwerksrolle'] },
  { id: 'pf1', name: 'Fliesen Beispiel D.', fach: 'fliesen', preis: 12, std: 24, sterne: 4.7, antworten: 150, siegel: ['Meister'] },
  { id: 'pd1', name: 'Dachdeckerei Beispiel H.', fach: 'dach', preis: 19, std: 48, sterne: 4.8, antworten: 75, siegel: ['Meister', 'Handwerksrolle'] },
  { id: 'pn1', name: 'Energieberatung Beispiel L.', fach: 'energie', preis: 25, std: 24, sterne: 4.9, antworten: 120, siegel: ['dena-Liste'] }
];
const profiVon = (id) => PROFIS.find((x) => x.id === id) || (S.profi && S.profi.id === id ? S.profi : null);
const fachVon = (id) => FACH.find((x) => x.id === id) || { name: id, icon: '❓' };
function fragen() { return (S.fragen = S.fragen || []); }
const FN = { fach: '', profi: '', text: '', fotos: [], masse: true, skizze: true, plan: true };

/* Umgehungsschutz: Telefonnummern / E-Mails im Text erkennen */
function kontaktDrin(t) { return /(\+?\d[\d\s/()-]{7,}\d)|([\w.+-]+@[\w-]+\.[\w.]+)|(whats ?app|telegram)/i.test(t || ''); }

route('fragen', (_, q) => {
  const pid = q.p || '';
  const liste = fragen().slice().reverse();
  return kopf('Frage an Profi', 'Architekten & Handwerker', pid ? '#/projekt/' + pid : '#/mehr') + `<div class="inhalt">
    ${FF.demo ? '<div class="hinweis klein"><b>Testphase:</b> Alles funktioniert schon – nur die Bezahlung ist noch nicht echt. Es wird kein Geld abgebucht, die Profis sind Beispiele.</div>' : ''}
    <a class="btn voll" href="#/frage-neu${pid ? '?p=' + pid : ''}">＋ Neue Frage stellen</a>
    <div class="ff-wie">
      <div><b>1</b><span>Frage + Fotos – Maße und Skizze hängen automatisch dran</span></div>
      <div><b>2</b><span>Profi wählen – Festpreis siehst du vorher</span></div>
      <div><b>3</b><span>Antwort in ${FF.antwortStunden} h – sonst Geld zurück</span></div>
    </div>
    <h3>Meine Fragen</h3>
    ${liste.length ? liste.map((f) => { const pr = profiVon(f.profi) || {}; return `<a class="liste-zeile" href="#/frage/${f.id}"><span style="flex:1"><b>${esc(f.text.slice(0, 60))}${f.text.length > 60 ? '…' : ''}</b><br><span class="klein">${fachVon(f.fach).icon} ${esc(pr.name || '')} · ${euro(f.preis)} · ${datum(f.zeit)}</span></span><span class="ff-status ${f.status}">${ffStatusText(f)}</span></a>`; }).join('') : '<p class="klein">Noch keine Fragen.</p>'}
    <h3>Du bist Architekt/in oder Handwerker/in?</h3>
    <a class="liste-zeile" href="#/profi"><span style="flex:1">Profi-Bereich: Fragen beantworten & Geld verdienen</span>›</a>
  </div>`;
});
function ffStatusText(f) { return { offen: 'Wartet auf Antwort', beantwortet: 'Beantwortet', erstattet: 'Geld zurück' }[f.status] || f.status; }

route('frage-neu', (_, q) => {
  const pid = q.p || S.aktivId || '';
  const p = pid && projekt(pid);
  if (q.fach && !FN.fach) FN.fach = q.fach;
  const auswahl = PROFIS.filter((x) => x.fach === FN.fach).sort((a, b) => a.preis - b.preis);
  const pr = profiVon(FN.profi);
  const anh = [];
  if (p && p.breite) anh.push(['masse', `Maße ${zahl(p.breite / 100)} × ${zahl(p.tiefe / 100)} m`]);
  if (p && p.skizze) anh.push(['skizze', 'Skizze']);
  if (p && p.plan && p.plan.length) anh.push(['plan', 'Plan/Grundriss aus dem Studio']);
  return kopf('Neue Frage', p ? p.name : 'Frage an Profi', '#/fragen' + (pid ? '?p=' + pid : '')) + `<div class="inhalt">
    <h3>1. Wen willst du fragen?</h3>
    <div class="ff-fach">${FACH.map((f) => `<button class="chip ${FN.fach === f.id ? 'an' : ''}" data-akt="ffFach" data-f="${f.id}">${f.icon} ${f.name}</button>`).join('')}</div>
    ${FN.fach ? `<h3>2. Profi wählen</h3>${auswahl.map((x) => `<button class="karte ff-profi ${FN.profi === x.id ? 'an' : ''}" data-akt="ffProfi" data-id="${x.id}">
        <div class="zeile"><b style="flex:1">${esc(x.name)}</b><b class="ff-preis">${euro(x.preis)}</b></div>
        <span class="klein">★ ${zahl(x.sterne, 1)} · ${x.antworten} Antworten · antwortet meist in ${x.std} h</span>
        <span class="klein">${x.siegel.map((s) => '✓ ' + s).join('  ')}</span></button>`).join('')}` : ''}
    ${pr ? `<h3>3. Deine Frage</h3>
      <label class="feld">Was möchtest du wissen?<textarea rows="5" data-ein="ffText" placeholder="${esc(fachVon(FN.fach).bsp)}">${esc(FN.text)}</textarea></label>
      <div class="hinweis klein" id="ff-warn" ${kontaktDrin(FN.text) ? '' : 'hidden'}>Bitte keine Telefonnummer oder E-Mail – Kontakt läuft über die App, damit du geschützt bist (Geld-zurück-Garantie).</div>
      <div class="zeile wrap">${dateiKnopf('Foto hinzufügen', 'ffFoto', {}, { icon: ICON.kamera || '', klasse: 'chip-knopf', mehrere: true })}</div>
      ${FN.fotos.length ? `<div class="ff-fotos">${FN.fotos.map((u, i) => `<span><img src="${u}" alt=""><button data-akt="ffFotoWeg" data-i="${i}" aria-label="Foto entfernen">×</button></span>`).join('')}</div>` : ''}
      ${anh.length ? `<p class="klein"><b>Hängt automatisch dran:</b></p>${anh.map(([k, n]) => `<label class="schalter"><input type="checkbox" data-ein="ffAnh" data-k="${k}" ${FN[k] ? 'checked' : ''}> ${n}</label>`).join('')}` : ''}
      <div class="karte ff-summe">
        <div class="zeile"><span style="flex:1">Festpreis ${esc(pr.name)}</span><b>${euro(pr.preis)}</b></div>
        <span class="klein">Inkl. 1 kostenloser Rückfrage. Keine Antwort in ${FF.antwortStunden} h → Geld automatisch zurück.</span>
      </div>
      <button class="btn voll" data-akt="ffSenden" data-p="${esc(pid)}">${FF.demo ? 'Frage senden (Test – kostenlos)' : 'Kostenpflichtig senden · ' + euro(pr.preis)}</button>` : ''}
  </div>`;
});
AKT.ffFach = (d) => { FN.fach = d.f; FN.profi = ''; render(); };
AKT.ffProfi = (d) => { FN.profi = d.id; render(); setTimeout(() => { const t = document.querySelector('[data-ein="ffText"]'); if (t) t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60); };
EIN.ffText = (v) => { FN.text = v; const w = document.getElementById('ff-warn'); if (w) w.hidden = !kontaktDrin(v); };
EIN.ffAnh = (v, d, el) => { FN[d.k] = el.checked; };
EIN.ffFoto = (v, d, el) => { [...(el.files || [])].slice(0, 6 - FN.fotos.length).forEach((f) => bildVerkleinern(f, 1000, (url) => { FN.fotos.push(url); render(); })); };
AKT.ffFotoWeg = (d) => { FN.fotos.splice(+d.i, 1); render(); };
AKT.ffSenden = (d) => {
  const pr = profiVon(FN.profi); if (!pr) return;
  if (FN.text.trim().length < 15) { info('Beschreib deine Frage bitte etwas genauer (mindestens ein Satz).'); return; }
  if (kontaktDrin(FN.text)) { info('Bitte Telefonnummer/E-Mail aus dem Text nehmen – der Kontakt läuft über die App.'); return; }
  const p = d.p && projekt(d.p);
  const f = { id: uid(), projekt: d.p || '', fach: FN.fach, profi: pr.id, preis: pr.preis, text: FN.text.trim(), fotos: FN.fotos.slice(), zeit: new Date().toISOString(), status: 'offen', demo: FF.demo,
    anhang: p ? { masse: FN.masse && p.breite ? { breite: p.breite, tiefe: p.tiefe } : null, skizze: FN.skizze ? p.skizze || null : null, plan: FN.plan && p.plan ? p.plan.length + ' Teile' : null, raum: p.raum, name: p.name } : null, verlauf: [] };
  aendern(() => fragen().push(f), 'Frage an Profi gesendet');
  Object.assign(FN, { profi: '', text: '', fotos: [] });
  toast('Frage gesendet'); sprich('Deine Frage ist unterwegs. Du bekommst Bescheid, sobald der Profi antwortet.', true);
  geh('#/frage/' + f.id);
};

route('frage', (id) => {
  const f = fragen().find((x) => x.id === id);
  if (!f) return kopf('Frage nicht gefunden', '', '#/fragen');
  const pr = profiVon(f.profi) || { name: 'Profi' };
  const frist = new Date(new Date(f.zeit).getTime() + FF.antwortStunden * 3600e3);
  const rueck = (f.verlauf || []).filter((v) => v.von === 'kunde').length;
  const a = f.anhang || {};
  return kopf('Deine Frage', fachVon(f.fach).icon + ' ' + pr.name, '#/fragen' + (f.projekt ? '?p=' + f.projekt : '')) + `<div class="inhalt">
    <ol class="ff-schritte">
      <li class="ok">Frage gesendet · ${euro(f.preis)} ${f.demo ? '(Test, nicht abgebucht)' : 'vorgemerkt'}</li>
      <li class="${f.status === 'beantwortet' ? 'ok' : f.status === 'erstattet' ? 'nein' : 'jetzt'}">${f.status === 'erstattet' ? 'Keine Antwort – Geld zurück' : f.status === 'beantwortet' ? 'Profi hat geantwortet' : 'Profi antwortet bis ' + frist.toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</li>
      <li class="${f.status === 'beantwortet' ? 'ok' : ''}">Geld geht an den Profi – erst nach Antwort</li>
    </ol>
    <div class="ff-blase kunde"><b>Du</b><p>${esc(f.text)}</p>${(f.fotos || []).map((u) => `<img src="${u}" alt="Foto">`).join('')}
      ${a.masse || a.skizze || a.plan ? `<span class="klein">Angehängt: ${[a.masse && `Maße ${zahl(a.masse.breite / 100)} × ${zahl(a.masse.tiefe / 100)} m`, a.skizze && 'Skizze', a.plan && 'Plan (' + a.plan + ')'].filter(Boolean).join(' · ')}</span>${a.skizze ? `<img src="${a.skizze}" alt="Skizze">` : ''}` : ''}</div>
    ${(f.verlauf || []).map((v) => `<div class="ff-blase ${v.von}"><b>${v.von === 'profi' ? esc(pr.name) : 'Du'}</b><p>${esc(v.text)}</p><span class="klein">${new Date(v.zeit).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>`).join('')}
    ${f.status === 'offen' && f.demo ? `<button class="btn hell voll" data-akt="ffDemoAntwort" data-id="${f.id}">Test: Beispiel-Antwort vom Profi ansehen</button>` : ''}
    ${f.status === 'beantwortet' && rueck < 1 ? `<label class="feld">Eine kostenlose Rückfrage<textarea rows="3" data-ein="ffRueck" placeholder="z. B. Und wenn ich die Tür 20 cm verschiebe?"></textarea></label><button class="btn hell voll" data-akt="ffRueckSenden" data-id="${f.id}">Rückfrage senden</button>` : ''}
    ${f.status === 'beantwortet' ? `<h3>Wie hilfreich war die Antwort?</h3><div class="zeile">${[1, 2, 3, 4, 5].map((n) => `<button class="chip ${f.bewertung >= n ? 'an' : ''}" data-akt="ffBewerten" data-id="${f.id}" data-n="${n}">★</button>`).join('')}</div>
      <button class="btn voll" data-akt="ffAuftrag" data-id="${f.id}" style="margin-top:12px">Diesen Profi für den Auftrag anfragen</button>` : ''}
  </div>`;
});
let FF_RUECK = '';
EIN.ffRueck = (v) => { FF_RUECK = v; };
AKT.ffRueckSenden = (d) => {
  if (FF_RUECK.trim().length < 5) return; if (kontaktDrin(FF_RUECK)) { info('Bitte keine Telefonnummer/E-Mail.'); return; }
  aendern(() => { const f = fragen().find((x) => x.id === d.id); f.verlauf.push({ von: 'kunde', text: FF_RUECK.trim(), zeit: new Date().toISOString() }); f.status = 'offen'; f.rueckfrage = true; }, 'Rückfrage');
  FF_RUECK = ''; toast('Rückfrage gesendet');
};
AKT.ffBewerten = (d) => aendern(() => { fragen().find((x) => x.id === d.id).bewertung = +d.n; }, 'Bewertung');
AKT.ffAuftrag = (d) => { const f = fragen().find((x) => x.id === d.id); geh(f.projekt ? '#/markt?p=' + f.projekt : '#/markt'); toast('Beschreib den Auftrag – der Profi sieht deine Frage schon'); };
AKT.ffDemoAntwort = (d) => {
  const f = fragen().find((x) => x.id === d.id); if (!f) return;
  const txt = {
    architekt: 'Danke für die Fotos und die Skizze. Kurz gesagt: Ja, das geht – aber prüfen Sie vorher, ob die Wand tragend ist (Statiker). Mein Vorschlag: Tür 60 cm von der Ecke, dann bleibt genug Stellfläche. Bei Wohnungseigentum braucht es die Zustimmung der Eigentümer.',
    statik: 'Nach den Fotos ist die Wand wahrscheinlich tragend (sie liegt in Achse mit der Wand darunter). Ein Durchbruch ist möglich, braucht aber einen Sturz/Träger nach Berechnung. Bitte nichts vorher öffnen.',
    elektro: 'Für Herd und Backofen brauchen Sie in der Regel einen eigenen Drehstrom-Anschluss (3 × 16 A). Schauen Sie in den Sicherungskasten: Gibt es drei gekoppelte Sicherungen für „Herd“? Anschluss bitte vom Elektriker.',
    sanitaer: 'Für eine bodengleiche Dusche brauchen Sie etwa 2 % Gefälle und je nach Ablauf 7–10 cm Aufbauhöhe. Bei Ihrer Raumgröße passt eine Duschrinne an der Wand am besten.'
  }[f.fach] || 'Danke für die Frage und die Fotos. Das ist machbar – wichtig ist die richtige Reihenfolge: erst Untergrund prüfen, dann Material wählen. Details siehe Anleitung in der App; bei Unsicherheit lieber einen Termin vor Ort.';
  aendern(() => { f.verlauf.push({ von: 'profi', text: txt + ' (Beispiel-Antwort, Testphase)', zeit: new Date().toISOString() }); f.status = 'beantwortet'; }, 'Antwort erhalten');
  try { navigator.vibrate && navigator.vibrate([40, 60, 40]); } catch (e) {}
  sprich('Der Profi hat geantwortet.', true);
};

/* ---------- Profi-Bereich: Fragen beantworten & verdienen ---------- */
let PF_TEXT = {};
route('profi', () => {
  const me = S.profi;
  if (!me) return kopf('Profi-Bereich', 'Architekten & Handwerker', '#/fragen') + `<div class="inhalt">
    <p>Beantworte Fragen aus deiner Nähe und verdiene pro Antwort – ohne Anfahrt. Gute Antworten bringen dir oft den Auftrag.</p>
    <label class="feld">Name / Betrieb<input data-ein="pfNeu" data-k="name" placeholder="z. B. Elektro Muster"></label>
    <label class="feld">Fachgebiet<select data-ein="pfNeu" data-k="fach">${FACH.map((f) => `<option value="${f.id}">${f.icon} ${f.name}</option>`).join('')}</select></label>
    <label class="feld">Dein Preis pro Frage (€)<input data-ein="pfNeu" data-k="preis" inputmode="numeric" placeholder="z. B. 19"></label>
    <div class="hinweis klein">Vor dem echten Start prüfen wir: Kammer-Eintrag (Architekten/Ingenieure) bzw. Handwerksrolle/Gewerbe und Haftpflicht. Von jeder bezahlten Antwort gehen ${Math.round(FF.provision * 100)} % Vermittlung an Joum, der Rest an dich.</div>
    <button class="btn voll" data-akt="pfAnlegen">Profi-Profil anlegen (Test)</button>
  </div>`;
  const offen = fragen().filter((f) => f.status === 'offen' && (f.fach === me.fach || f.profi === me.id));
  const verdient = fragen().filter((f) => f.status === 'beantwortet' && f.beantwortetVon === me.id).reduce((s, f) => s + f.preis * (1 - FF.provision), 0);
  return kopf('Profi-Bereich', me.name, '#/fragen') + `<div class="inhalt">
    <div class="ff-konto"><div><span class="klein">Verdient (Test)</span><b>${euro(verdient)}</b></div><div><span class="klein">Dein Preis</span><b>${euro(me.preis)}</b></div><div><span class="klein">Du bekommst</span><b>${euro(me.preis * (1 - FF.provision))}</b></div></div>
    <h3>Offene Fragen (${offen.length})</h3>
    ${offen.length ? offen.map((f) => { const a = f.anhang || {}; return `<div class="karte">
      <span class="klein">${fachVon(f.fach).icon} ${esc(a.name || 'Projekt')} · ${datum(f.zeit)} · ${euro(f.preis)} → du bekommst ${euro(f.preis * (1 - FF.provision))}</span>
      <p><b>${esc(f.text)}</b></p>
      ${(f.verlauf || []).filter((v) => v.von === 'kunde').map((v) => `<p class="klein">Rückfrage: ${esc(v.text)}</p>`).join('')}
      <div class="ff-fotos">${(f.fotos || []).concat(a.skizze ? [a.skizze] : []).map((u) => `<span><img src="${u}" alt=""></span>`).join('')}</div>
      ${a.masse ? `<span class="klein">Maße ${zahl(a.masse.breite / 100)} × ${zahl(a.masse.tiefe / 100)} m${a.plan ? ' · Plan ' + a.plan : ''}</span>` : ''}
      <label class="feld">Deine Antwort<textarea rows="4" data-ein="pfText" data-id="${f.id}">${esc(PF_TEXT[f.id] || '')}</textarea></label>
      <button class="btn voll" data-akt="pfAntworten" data-id="${f.id}">Antwort senden</button></div>`; }).join('') : '<p class="klein">Gerade keine offenen Fragen in deinem Fach.</p>'}
    <button class="btn hell voll" data-akt="pfAbmelden" style="margin-top:16px">Profi-Profil löschen (Test)</button>
  </div>`;
});
const PF_NEU = { name: '', fach: 'architekt', preis: '' };
EIN.pfNeu = (v, d) => { PF_NEU[d.k] = v; };
EIN.pfText = (v, d) => { PF_TEXT[d.id] = v; };
AKT.pfAnlegen = () => {
  const preis = Math.round(parseZahl(PF_NEU.preis));
  if (PF_NEU.name.trim().length < 3 || preis < 5 || preis > 500) { info('Bitte Name und einen Preis zwischen 5 und 500 € eintragen.'); return; }
  aendern(() => { S.profi = { id: 'me-' + uid(), name: PF_NEU.name.trim(), fach: PF_NEU.fach, preis, std: 24, sterne: 5, antworten: 0, siegel: ['in Prüfung'] }; }, 'Profi-Profil angelegt');
  toast('Profi-Profil angelegt');
};
AKT.pfAntworten = (d) => {
  const t = (PF_TEXT[d.id] || '').trim();
  if (t.length < 20) { info('Bitte etwas ausführlicher antworten (mindestens 20 Zeichen).'); return; }
  if (kontaktDrin(t)) { info('Bitte keine Telefonnummer/E-Mail – Kontakt und Auftrag laufen über die App.'); return; }
  aendern(() => { const f = fragen().find((x) => x.id === d.id); f.verlauf.push({ von: 'profi', text: t, zeit: new Date().toISOString() }); f.status = 'beantwortet'; f.beantwortetVon = S.profi.id; if (!f.rueckfrage) f.profi = S.profi.id; }, 'Frage beantwortet');
  delete PF_TEXT[d.id]; toast('Antwort gesendet – ' + euro(S.profi.preis * (1 - FF.provision)) + ' gutgeschrieben (Test)');
};
AKT.pfAbmelden = () => frage('Profi-Profil löschen? Deine Test-Daten als Profi werden entfernt.', () => aendern(() => { delete S.profi; }, 'Profi-Profil gelöscht'));
HILFE.ffSenden = 'Schickt deine Frage an den gewählten Profi. Geld geht erst an ihn, wenn er antwortet.';
