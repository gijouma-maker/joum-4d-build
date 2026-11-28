/* Joum 4D Build – Marktplatz (Kunde ↔ Handwerker), Preisvergleich, Community, Datensicherung, JoumHome, Mehr */

/* Beispiel-Handwerker (bis der Server mit geprüften Betrieben läuft) */
const DEMO_HW = [
  { id: 'hw1', name: 'Meisterbetrieb Beispiel A', gewerk: 'Ausbau & Fliesen', km: 12, termin: 96, maengel: 94, sterne: 4.8, nachtr: 1, siegel: ['Handwerksrolle', 'Haftpflicht'], tel: '+49 000 000001' },
  { id: 'hw2', name: 'Bau-Service Beispiel B', gewerk: 'Allround', km: 31, termin: 88, maengel: 90, sterne: 4.5, nachtr: 3, siegel: ['Gewerbe', 'Haftpflicht'], tel: '+49 000 000002' },
  { id: 'hw3', name: 'Dach & Fassade Beispiel C', gewerk: 'Dach, Fassade, Fenster', km: 48, termin: 92, maengel: 97, sterne: 4.9, nachtr: 0, siegel: ['Handwerksrolle', 'Haftpflicht', 'Meister'], tel: '+49 000 000003' }
];
function score(h) { return Math.round(h.termin * 0.3 + h.maengel * 0.35 + h.sterne * 20 * 0.25 + Math.max(0, 100 - h.nachtr * 15) * 0.1); }

function preisrahmen(p) {
  const a = p && ANLEITUNGEN[p.anleitung];
  if (a) { const m = a.kosten[1] * (p.menge || 1); return [Math.round(m * 0.85 / 10) * 10, Math.round(m * 1.15 / 10) * 10]; }
  if (p && p.garten) { const v = GARTEN_VORSCHLAEGE.find((x) => x.id === p.garten); const s = v.kosten.reduce((t, k) => t + k[1], 0) * 1.6; return [Math.round(s * 0.85 / 10) * 10, Math.round(s * 1.15 / 10) * 10]; }
  return [500, 1500];
}

const MV = { beschr: '', preis: '', radius: '50', termin: '' };
EIN.mv = (v, d) => { MV[d.k] = v; };
AKT.ausschreiben = (d) => {
  const p = projekt(d.p), rahmen = preisrahmen(p);
  const preis = parseZahl(MV.preis) || Math.round((rahmen[0] + rahmen[1]) / 2);
  const a = ANLEITUNGEN[p.anleitung];
  const schr = a && a.schritte.length ? a.schritte.map((s) => s[0]) : ['Vorbereitung', 'Ausführung', 'Fertigstellung'];
  const drittel = Math.ceil(schr.length / 3);
  const etappen = [0, 1, 2].map((i) => ({ name: ['Etappe 1 – Vorbereitung', 'Etappe 2 – Ausführung', 'Etappe 3 – Fertigstellung'][i], anteil: [0.3, 0.4, 0.3][i], punkte: schr.slice(i * drittel, (i + 1) * drittel).map((t) => ({ t, st: null })), frei: false }));
  aendern((s) => s.auftraege.unshift({ id: uid(), projekt: p.id, titel: p.name, beschr: MV.beschr, preis, rahmen, radius: MV.radius, termin: MV.termin, status: 'ausgeschrieben', erstellt: new Date().toISOString(), handwerker: null, nachtraege: [], etappen, maengel: [], gegen: [{ hw: 'hw2', preis: Math.round(preis * 1.08 / 10) * 10 }] }), 'Auftrag ausgeschrieben');
  toast('Auftrag an Handwerker im Umkreis ' + MV.radius + ' km gesendet');
};
AKT.hwWaehlen = (d) => {
  frage('Diesen Handwerker beauftragen? Die Vermittlungsgebühr fällt jetzt an, danach werden die Kontaktdaten freigegeben. Der Betrag geht in Etappen auf das Treuhandkonto.', () =>
    aendern((s) => { const a = s.auftraege.find((x) => x.id === d.a); a.handwerker = d.hw; a.status = 'beauftragt'; if (d.preis) a.preis = +d.preis; }, 'Handwerker beauftragt'));
};
const NT = { text: '', betrag: '' };
EIN.nt = (v, d) => { NT[d.k] = v; };
AKT.nachtragSpeichern = (d) => {
  const c = document.getElementById('unterschrift');
  if (!NT.text || !parseZahl(NT.betrag)) { toast('Beschreibung und Mehrkosten eintragen'); return; }
  if (!c || !c.dataset.signiert) { toast('Bitte mit dem Finger unterschreiben'); return; }
  aendern((s) => { const a = s.auftraege.find((x) => x.id === d.a); a.nachtraege.push({ id: uid(), text: NT.text, betrag: parseZahl(NT.betrag), sig: c.toDataURL(), zeit: new Date().toISOString() }); }, 'Nachtrag unterschrieben');
  NT.text = ''; NT.betrag = '';
  toast('Nachtrag unterschrieben – Betrag in Treuhand');
};
AKT.punkt = (d) => aendern((s) => {
  const a = s.auftraege.find((x) => x.id === d.a), e = a.etappen[+d.e], pk = e.punkte[+d.i];
  pk.st = d.st;
  if (d.st === 'mangel') a.maengel.push({ id: uid(), t: pk.t, etappe: e.name, zeit: new Date().toISOString(), offen: true });
});
AKT.mangelBehoben = (d) => aendern((s) => { const a = s.auftraege.find((x) => x.id === d.a); const m = a.maengel.find((x) => x.id === d.m); m.offen = false; a.etappen.forEach((e) => e.punkte.forEach((p) => { if (p.t === m.t && p.st === 'mangel') p.st = 'ok'; })); });
AKT.etappeFrei = (d) => aendern((s) => {
  const a = s.auftraege.find((x) => x.id === d.a); a.etappen[+d.e].frei = true;
  if (a.etappen.every((e) => e.frei)) a.status = 'abgeschlossen';
}, 'Etappe freigegeben');
AKT.bewerten = (d) => aendern((s) => { s.auftraege.find((x) => x.id === d.a).sterne = +d.n; });
AKT.auftragWeg = (d) => { frage('Auftrag zurückziehen?', () => aendern((s) => { inPapierkorb('auftrag', s.auftraege.find((x) => x.id === d.a)); s.auftraege = s.auftraege.filter((x) => x.id !== d.a); })); };

function unterschriftBinden() {
  const c = document.getElementById('unterschrift'); if (!c) return;
  const ctx = c.getContext('2d'); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  let an = false;
  const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  c.onpointerdown = (e) => { an = true; ctx.beginPath(); ctx.moveTo(...pos(e)); c.setPointerCapture(e.pointerId); };
  c.onpointermove = (e) => { if (!an) return; ctx.lineTo(...pos(e)); ctx.stroke(); c.dataset.signiert = '1'; };
  c.onpointerup = () => { an = false; };
}
AKT.sigLeeren = () => { const c = document.getElementById('unterschrift'); c.getContext('2d').clearRect(0, 0, c.width, c.height); delete c.dataset.signiert; };

function auftragAnsicht(a) {
  const hw = DEMO_HW.find((h) => h.id === a.handwerker);
  const treuhand = a.preis + a.nachtraege.reduce((s, n) => s + n.betrag, 0);
  const frei = a.etappen.reduce((s, e) => s + (e.frei ? e.anteil * a.preis : 0), 0) + (a.status === 'abgeschlossen' ? a.nachtraege.reduce((s, n) => s + n.betrag, 0) : 0);
  let x = `<section class="karte"><div class="zeile"><b style="flex:1">${esc(a.titel)}</b><span class="badge ${a.status === 'abgeschlossen' ? 'gruen' : 'gelb'}">${esc(a.status)}</span></div>
    <div class="klein">Festpreis ${euro(a.preis)} · KI-Rahmen ${euro(a.rahmen[0])}–${euro(a.rahmen[1])} · Umkreis ${esc(a.radius)} km</div></section>`;
  if (a.status === 'ausgeschrieben') {
    x += `<h3>Handwerker wählen</h3><p class="klein">Sortiert nach Score (Termintreue, Abnahmen ohne Mangel, Bewertungen, Nachträge). Kontaktdaten erst nach Beauftragung.</p>` +
      DEMO_HW.map((h) => ({ h, s: score(h) })).sort((p, q) => q.s - p.s).map(({ h, s }) => {
        const g = a.gegen.find((y) => y.hw === h.id);
        return `<div class="karte hw"><div class="zeile">${ring(s, 58, s)}<div style="flex:1"><b>${esc(h.name)}</b><div class="klein">${esc(h.gewerk)} · ${h.km} km · ★ ${zahl(h.sterne, 1)}</div><div class="klein">Termintreue ${h.termin} % · ohne Mangel ${h.maengel} % · Nachträge ${h.nachtr}</div><div>${h.siegel.map((z) => `<span class="badge gruen">${esc(z)} geprüft</span>`).join(' ')}</div></div></div>
          <div class="klein" style="margin:6px 0">${g ? 'Verdecktes Gegenangebot: <b>' + euro(g.preis) + '</b>' : 'Nimmt Festpreis <b>' + euro(a.preis) + '</b> an'}</div>
          <button class="btn hell voll" data-akt="hwWaehlen" data-a="${a.id}" data-hw="${h.id}" data-preis="${g ? g.preis : a.preis}">Beauftragen</button></div>`;
      }).join('') + `<p class="klein">Beispieldaten – echte, geprüfte Betriebe nach Start des Server-Moduls.</p><button class="btn voll rot-text" data-akt="auftragWeg" data-a="${a.id}">Auftrag zurückziehen</button>`;
    return x;
  }
  x += `<section class="karte"><b>${esc(hw.name)}</b><div class="klein">Tel. über App-Nummer: ${esc(hw.tel)} · Chat blendet Nummern/E-Mails aus</div></section>
    <section class="karte summe"><div><span class="klein">Treuhand</span><b>${euro(treuhand)}</b></div><div><span class="klein">Freigegeben</span><b>${euro(frei)}</b></div><div><span class="klein">Offen</span><b>${euro(treuhand - frei)}</b></div></section>`;
  x += `<h3>Abnahme je Etappe</h3>` + a.etappen.map((e, ei) => {
    const alleOk = e.punkte.every((p) => p.st === 'ok');
    return `<div class="karte"><div class="zeile"><b style="flex:1">${esc(e.name)}</b><span class="klein">${euro(e.anteil * a.preis)}</span>${e.frei ? '<span class="badge gruen">frei</span>' : ''}</div>
      ${e.punkte.map((p, i) => `<div class="kat-zeile zeile"><span style="flex:1">${esc(p.t)}</span>${e.frei ? (p.st === 'ok' ? '✓' : '') : `<button class="chip ${p.st === 'ok' ? 'an' : ''}" data-akt="punkt" data-a="${a.id}" data-e="${ei}" data-i="${i}" data-st="ok">OK</button><button class="chip ${p.st === 'mangel' ? 'rot' : ''}" data-akt="punkt" data-a="${a.id}" data-e="${ei}" data-i="${i}" data-st="mangel">Mangel</button>`}</div>`).join('')}
      ${!e.frei ? `<button class="btn ${alleOk ? 'hell' : ''} voll" ${alleOk ? '' : 'disabled'} data-akt="etappeFrei" data-a="${a.id}" data-e="${ei}">${alleOk ? 'Alles OK – Etappenbetrag freigeben' : 'Erst alle Punkte prüfen'}</button>` : ''}</div>`;
  }).join('');
  const offen = a.maengel.filter((m) => m.offen);
  if (offen.length) x += `<div class="hinweis rot"><b>Offene Mängel (Geld bleibt in Treuhand)</b>${offen.map((m) => `<div class="zeile"><span style="flex:1">${esc(m.t)} <span class="klein">· Ticket ${m.id.slice(0, 5).toUpperCase()}</span></span><button class="chip" data-akt="mangelBehoben" data-a="${a.id}" data-m="${m.id}">behoben</button></div>`).join('')}</div>`;
  if (a.status !== 'abgeschlossen') {
    x += `<h3>Nachtrag (falls nötig)</h3>
      <label class="feld">Problem vor Ort<textarea rows="2" data-ein="nt" data-k="text">${esc(NT.text)}</textarea></label>
      <label class="feld">Mehrkosten (€)<input inputmode="decimal" value="${esc(NT.betrag)}" data-ein="nt" data-k="betrag"></label>
      <div class="klein">Unterschrift Kunde (mit dem Finger)</div>
      <canvas id="unterschrift" width="680" height="200" aria-label="Unterschriftsfeld"></canvas>
      <div class="zeile"><button class="btn" data-akt="sigLeeren">Leeren</button><button class="btn hell" data-akt="nachtragSpeichern" data-a="${a.id}">Unterschreiben & in Treuhand</button></div>`;
    nachRender(unterschriftBinden);
  }
  if (a.nachtraege.length) x += `<h3>Nachträge</h3>` + a.nachtraege.map((n) => `<div class="liste-zeile"><span style="flex:1">${esc(n.text)}<span class="klein block">${zeit(n.zeit)}</span></span><b>${euro(n.betrag)}</b><img class="mini sig" src="${n.sig}" alt="Unterschrift"></div>`).join('');
  if (a.status === 'abgeschlossen') x += `<div class="hinweis gruen">Fertig! Garantie und Steuerrechnung liegen im Projekt (Zahlung über App).</div><div class="sterne">${[1, 2, 3, 4, 5].map((n) => `<button data-akt="bewerten" data-a="${a.id}" data-n="${n}" aria-label="${n} Sterne">${n <= (a.sterne || 0) ? '★' : '☆'}</button>`).join('')}</div>`;
  return x;
}

route('markt', (_, q) => {
  const p = q.p ? projekt(q.p) : null;
  if (p) {
    const a = S.auftraege.find((x) => x.projekt === p.id);
    if (a) return kopf('Auftrag', p.name, '#/projekt/' + p.id) + `<div class="inhalt">${auftragAnsicht(a)}</div>`;
    const r = preisrahmen(p);
    return kopf('Auftrag vergeben', p.name, '#/projekt/' + p.id) + `<div class="inhalt">
      <section class="karte"><div class="unter">KI-Preisrahmen</div><b class="gross-titel">${euro(r[0])} – ${euro(r[1])}</b><div class="klein">aus Menge ${zahl(p.menge || 1)} ${(ANLEITUNGEN[p.anleitung] || {}).einheit || ''} und regionalen Richtwerten</div>${(() => { const z = zeitSchaetzung(p.anleitung, p.menge || 1); return z ? `<div class="klein">Geschätzter Profi-Aufwand: <b>${zahl(z[2].h, 1)} Std.</b> (ca. ${z[2].tage} Arbeitstag${z[2].tage > 1 ? 'e' : ''})</div>` : ''; })()}</section>
      <label class="feld">Was soll gemacht werden?<textarea rows="3" data-ein="mv" data-k="beschr">${esc(MV.beschr)}</textarea></label>
      <label class="feld">Dein Festpreis (€)<input inputmode="decimal" placeholder="${Math.round((r[0] + r[1]) / 2)}" value="${esc(MV.preis)}" data-ein="mv" data-k="preis"></label>
      <div class="raster2"><label class="feld">Umkreis<select data-ein="mv" data-k="radius"><option ${MV.radius === '50' ? 'selected' : ''}>50</option><option ${MV.radius === '70' ? 'selected' : ''}>70</option></select></label>
      <label class="feld">Wunschtermin<input type="date" value="${esc(MV.termin)}" data-ein="mv" data-k="termin"></label></div>
      <div class="hinweis klein">Handwerker können sofort annehmen oder EIN verdecktes Gegenangebot abgeben – keine offene Auktion. Adresse und Kontakt erst nach Annahme. Zahlung in Etappen über Treuhand; Garantie und Steuerrechnung nur bei Zahlung über die App.</div>
      <button class="btn hell voll" data-akt="ausschreiben" data-p="${p.id}">An Handwerker senden</button>
    </div>`;
  }
  return kopf('Profi & Marktplatz', 'Aufträge, Abnahme, Treuhand', '#/') + `<div class="inhalt">
    ${S.auftraege.length ? S.auftraege.map((a) => `<a class="liste-zeile" href="#/markt?p=${a.projekt}"><span style="flex:1">${esc(a.titel)}<span class="klein block">${euro(a.preis)} · ${esc(a.status)}</span></span><span class="badge ${a.status === 'abgeschlossen' ? 'gruen' : 'gelb'}">${esc(a.status)}</span></a>`).join('') : '<p class="klein">Noch keine Aufträge.</p>'}
    <h3>Projekt vergeben</h3>
    ${S.projekte.filter((p) => !S.auftraege.find((a) => a.projekt === p.id)).map((p) => `<a class="liste-zeile" href="#/markt?p=${p.id}"><span style="flex:1">${esc(p.name)}</span><span class="klein">vergeben ›</span></a>`).join('') || '<p class="klein">Lege zuerst ein Projekt an.</p>'}
    <a class="btn voll" href="#/handwerker">Ich bin Handwerker</a>
    <a class="karte los-einstieg" href="#/fragen" style="margin-top:12px"><b>💬 Frage an Profi</b><span class="klein">Nur eine Frage? Architekt, Statiker oder Handwerker antworten zum Festpreis – Antwort in 48 h oder Geld zurück.</span></a>
    <a class="liste-zeile" href="#/profi"><span style="flex:1">Profi-Bereich: Fragen beantworten & verdienen</span>›</a>
  </div>`;
});

/* ---------- Handwerker-Pro ---------- */
const HK = { tab: 'radar', mat: 800, std: 16, satz: 55, km: 30, kmSatz: 0.5, angebote: {} };
AKT.hkTab = (d) => { HK.tab = d.t; render(); };
EIN.hk = (v, d) => { HK[d.k] = parseZahl(v); render(); };
EIN.hkGegen = (v, d) => { HK.angebote[d.a] = parseZahl(v); };
AKT.hkAnnehmen = () => toast('Angenommen – Gebühr wird fällig, danach Adresse und Kontakt sichtbar (Server-Modul).');
AKT.hkGegen = (d) => { if (!HK.angebote[d.a]) { toast('Preis eintragen'); return; } toast('Verdecktes Gegenangebot ' + euro(HK.angebote[d.a]) + ' gesendet (nur eins möglich)'); };
route('handwerker', () => {
  let x;
  if (HK.tab === 'radar') {
    const jobs = S.auftraege.filter((a) => a.status === 'ausgeschrieben').map((a) => ({ id: a.id, t: a.titel, preis: a.preis, km: 18, ort: 'Kunde (Adresse nach Annahme)' }))
      .concat([{ id: 'd1', t: 'Bad: Silikonfugen + 6 m² Fliesen', preis: 950, km: 22, ort: 'Beispiel' }, { id: 'd2', t: 'Haustür tauschen nach RAL', preis: 3400, km: 41, ort: 'Beispiel' }, { id: 'd3', t: 'Hochbeet + Gartenweg 12 m²', preis: 1600, km: 9, ort: 'Beispiel' }]);
    x = jobs.map((j) => `<div class="karte"><div class="zeile"><b style="flex:1">${esc(j.t)}</b><b>${euro(j.preis)}</b></div><div class="klein">${j.km} km · ${esc(j.ort)}</div>
      <div class="zeile"><button class="btn hell" data-akt="hkAnnehmen">Sofort annehmen</button><input class="anz" style="width:90px" inputmode="decimal" placeholder="€" aria-label="Gegenangebot" data-ein="hkGegen" data-a="${j.id}"><button class="btn" data-akt="hkGegen" data-a="${j.id}">1× Gegenangebot</button></div></div>`).join('');
  } else {
    const lohn = HK.std * HK.satz, fahrt = HK.km * 2 * HK.kmSatz, netto = HK.mat + lohn + fahrt;
    x = `<div class="raster2"><label class="feld">Material (€)<input inputmode="decimal" value="${zahl(HK.mat)}" data-ein="hk" data-k="mat"></label><label class="feld">Stunden<input inputmode="decimal" value="${zahl(HK.std)}" data-ein="hk" data-k="std"></label>
      <label class="feld">Stundensatz (€)<input inputmode="decimal" value="${zahl(HK.satz)}" data-ein="hk" data-k="satz"></label><label class="feld">Entfernung (km)<input inputmode="decimal" value="${zahl(HK.km)}" data-ein="hk" data-k="km"></label></div>
      <div class="karte">${[['Material', HK.mat], ['Lohn', lohn], ['Anfahrt (hin + zurück)', fahrt], ['Netto', netto], ['MwSt. 19 %', netto * 0.19]].map(([n, v]) => `<div class="kat-zeile zeile"><span style="flex:1">${n}</span><b>${euro(v)}</b></div>`).join('')}<div class="kat-zeile zeile"><b style="flex:1">Angebot brutto</b><b>${euro(netto * 1.19)}</b></div></div>
      <div class="hinweis klein">Lohnanteil getrennt ausweisen – Kunden brauchen ihn für § 35a.</div>
      <button class="btn hell voll" data-akt="drucken">Angebot als PDF</button>`;
  }
  return kopf('Handwerker-Pro', 'Auftrags-Radar & Kalkulation', '#/markt') + `<div class="inhalt">
    <div class="segment"><button class="${HK.tab === 'radar' ? 'an' : ''}" data-akt="hkTab" data-t="radar">Auftrags-Radar</button><button class="${HK.tab === 'kalk' ? 'an' : ''}" data-akt="hkTab" data-t="kalk">Kalkulation</button></div>${x}
    <p class="klein">Teilnahme nach Prüfung: Handwerksrolle (Meisterpflicht z. B. Fliesenleger), Gewerbe, Haftpflicht. „Eigene Kunden“ gegen Gebühr/Abo.</p></div>`;
});

/* ---------- Produkt-Preisvergleich ---------- */
const PV = { name: '', ziel: '' };
EIN.pv = (v, d) => { PV[d.k] = v; render(); };
EIN.pvFotoDatei = (v, d, el) => { const f = el.files[0]; if (!f) return; bildVerkleinern(f, 900, (url) => { PV.foto = url; render(); toast('Foto gespeichert – bitte Name oder Modellnummer vom Etikett eintippen'); }); };
AKT.wecker = () => { if (!PV.name || !parseZahl(PV.ziel)) { toast('Produkt und Zielpreis eintragen'); return; } aendern((s) => s.preiswecker.push({ id: uid(), n: PV.name, ziel: parseZahl(PV.ziel), zeit: new Date().toISOString() })); toast('Preiswecker gespeichert'); };
AKT.weckerWeg = (d) => aendern((s) => { s.preiswecker = s.preiswecker.filter((x) => x.id !== d.id); });
route('preise', () => {
  const q = encodeURIComponent(PV.name);
  return kopf('Produkt-Preisvergleich', 'Gesamtpreis inkl. Versand', '#/einkauf') + `<div class="inhalt">
    ${dateiKnopf(PV.foto ? 'Anderes Foto' : 'Produkt fotografieren', 'pvFotoDatei', {}, { icon: ICON.kamera, klasse: 'voll' })}
    ${PV.foto ? `<img class="skizze" src="${PV.foto}" alt="Produktfoto"><p class="klein">Automatische Erkennung aus dem Foto kommt mit dem KI-Server – bis dahin Name oder Modellnummer vom Etikett eintippen.</p>` : ''}
    <label class="feld">Produkt / Modell<input value="${esc(PV.name)}" placeholder="z. B. Bosch Akkuschrauber GSR 18V" data-ein="pv" data-k="name"></label>
    ${PV.name ? `<div class="karte"><a class="liste-zeile" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q=${q}">Preise vergleichen (Google Shopping) ›</a>
      <a class="liste-zeile" target="_blank" rel="noopener" href="https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${q}">Preise vergleichen (idealo) ›</a>
      <a class="liste-zeile" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q=${q}+alternative+günstig">Ähnliche günstigere Modelle ›</a></div>
      <label class="feld">Preiswecker: Zielpreis (€)<input inputmode="decimal" value="${esc(PV.ziel)}" data-ein="pv" data-k="ziel"></label><button class="btn hell voll" data-akt="wecker">Preiswecker stellen</button>` : ''}
    ${S.preiswecker.length ? `<h3>Preiswecker</h3>${S.preiswecker.map((w) => `<div class="liste-zeile"><span style="flex:1">${esc(w.n)}</span><b>≤ ${euro(w.ziel)}</b><button class="x" data-akt="weckerWeg" data-id="${w.id}" aria-label="Löschen">×</button></div>`).join('')}<p class="klein">Automatische Benachrichtigung folgt mit dem Server-Modul.</p>` : ''}
    <p class="klein">Links sind keine Partner-Links. Händlerpreise direkt in der App kommen über Affiliate-Feeds/Händlerpartnerschaften (kein Scraping); Partner-Links werden gekennzeichnet.</p>
  </div>`;
});

/* ---------- Community ---------- */
const RISIKO = /strom|elektr|gas|statik|tragend|asbest|dach|gerüst|leiter|schornstein|heizung|kabel|230/i;
const CI = { text: '' };
EIN.ci = (v) => { CI.text = v; };
AKT.ideePosten = () => {
  const t = CI.text.trim(); if (t.length < 8) { toast('Bitte etwas ausführlicher'); return; }
  const risiko = RISIKO.test(t) ? 'hoch' : 'gering';
  const nutzen = Math.min(5, 2 + Math.floor(t.length / 60) + (/(spart|günstig|schnell|einfach)/i.test(t) ? 1 : 0));
  const aufwand = /(tag|wochen|stemmen|fliesen|abriss)/i.test(t) ? 'hoch' : 'gering';
  aendern((s) => s.ideen.unshift({ id: uid(), t, stimmen: 0, nutzen, aufwand, risiko, zeit: new Date().toISOString() }));
  CI.text = '';
};
AKT.stimme = (d) => aendern((s) => { s.ideen.find((x) => x.id === d.id).stimmen++; });
route('community', () => kopf('Community', 'Tipps & Vorschläge', '#/mehr') + `<div class="inhalt">
  <label class="feld">Dein Tipp oder Vorschlag<textarea rows="3" data-ein="ci">${esc(CI.text)}</textarea></label>
  <button class="btn hell voll" data-akt="ideePosten">Teilen</button>
  ${S.ideen.map((i) => `<div class="karte"><div>${esc(i.t)}</div><div class="klein">KI-Bewertung: Nutzen ${'★'.repeat(i.nutzen)}${'☆'.repeat(5 - i.nutzen)} · Aufwand ${i.aufwand} · Risiko ${i.risiko}</div>
    ${i.risiko === 'hoch' ? '<div class="hinweis rot klein">Admin-Warnung: Sicherheitsrisiko – Arbeiten an Strom, Gas, Statik, Dach nur durch Fachbetrieb.</div>' : ''}
    <button class="chip" data-akt="stimme" data-id="${i.id}">▲ ${i.stimmen}</button></div>`).join('')}
  <p class="klein">Beiträge sind vorerst nur auf diesem Gerät; gemeinsamer Austausch folgt mit dem Server-Modul.</p></div>`);

/* ---------- Datensicherung & Versionen ---------- */
AKT.versionHerstellen = (d) => {
  const v = versionenLesen()[+d.i];
  if (!v) return;
  frage('Stand vom ' + zeit(v.zeit) + ' wiederherstellen? Der aktuelle Stand wird vorher als Version gesichert.', () => {
    versionAnlegen('Vor Wiederherstellung');
    S = migrieren(JSON.parse(JSON.stringify(v.daten))); speichern(); render(); toast('Wiederhergestellt');
  });
};
AKT.pkHerstellen = (d) => aendern((s) => {
  const e = s.papierkorb.find((x) => x.id === d.id); if (!e) return;
  ({ projekt: s.projekte, einkauf: s.einkauf, quittung: s.quittungen, auftrag: s.auftraege })[e.typ].unshift(e.obj);
  s.papierkorb = s.papierkorb.filter((x) => x.id !== d.id);
}, 'Aus Papierkorb wiederhergestellt');
AKT.exportJson = () => ausgeben('joum4d-sicherung-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({ app: 'Joum 4D Build', export: new Date().toISOString(), daten: S }, null, 1), 'application/json');
EIN.importDatei = (v, d, el) => {
  const f = el.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const j = JSON.parse(fr.result); const daten = j.daten || j;
      if (!daten.projekte) throw new Error('keine Joum-Daten');
      frage('Sicherung einspielen? Der aktuelle Stand wird vorher als Version gesichert.', () => { versionAnlegen('Vor Import'); S = migrieren(daten); speichern('Import'); render(); toast('Sicherung eingespielt'); });
    } catch (e) { info('Datei konnte nicht gelesen werden: ' + e.message); }
  };
  fr.readAsText(f);
};
route('sicherung', () => {
  const v = versionenLesen();
  let groesse = 0; try { groesse = (localStorage.getItem(SPEICHER_KEY) || '').length + (localStorage.getItem(VERSIONEN_KEY) || '').length; } catch (e) {}
  return kopf('Datensicherung & Versionen', 'Offline-first', '#/mehr') + `<div class="inhalt">
    <section class="karte"><div class="zeile"><span class="punkt gross-punkt"></span><div style="flex:1"><b>Auf diesem Gerät gesichert</b><div class="klein">Zuletzt: ${zeit(S.gesichert)} · belegt ca. ${zahl(groesse / 1024, 0)} KB</div></div></div>
      <div class="zeile" style="margin-top:8px"><span class="punkt grau"></span><div class="klein" style="flex:1">Cloud-Sync (EU-Server, verschlüsselt, Backups am zweiten Standort) – wird mit dem Server-Modul aktiviert.</div></div></section>
    <div class="zeile"><button class="btn hell" data-akt="exportJson">Sicherung exportieren</button>${dateiKnopf('Sicherung einspielen', 'importDatei', {}, { accept: 'application/json,.json' })}</div>
    <p class="klein">Neues Handy? Hier exportieren, Datei aufs neue Gerät, dort „Sicherung einspielen“. Projekte zusätzlich als PDF über „Drucken“.</p>
    <h3>Versionsverlauf (${v.length})</h3>
    ${v.map((x, i) => `<div class="liste-zeile"><span style="flex:1">${zeit(x.zeit)}<span class="klein block">${esc(x.grund)} · ${(x.daten.projekte || []).length} Projekte</span></span><button class="chip" data-akt="versionHerstellen" data-i="${i}">Wiederherstellen</button></div>`).join('') || '<p class="klein">Noch keine Versionen.</p>'}
    <h3>Papierkorb (30 Tage)</h3>
    ${S.papierkorb.map((p) => `<div class="liste-zeile"><span style="flex:1">${esc(p.obj.name || p.obj.n || p.obj.titel || p.obj.haendler || p.typ)}<span class="klein block">${esc(p.typ)} · gelöscht ${zeit(new Date(p.geloescht).toISOString())}</span></span><button class="chip" data-akt="pkHerstellen" data-id="${p.id}">Zurückholen</button></div>`).join('') || '<p class="klein">Leer.</p>'}
  </div>`;
});

/* ---------- JoumHome-Ticket → Renovierungsprojekt ---------- */
const TK = { nr: '', objekt: '', einheit: '', raum: 'bad', anl: 'silikon', text: '' };
EIN.tk = (v, d) => { TK[d.k] = v; if (d.k === 'raum') { const r = raum(v); TK.anl = r.projekte[0] || ''; render(); } };
AKT.ticketAnlegen = () => {
  if (!TK.nr || !TK.objekt) { toast('Ticket-Nr. und Objekt eintragen'); return; }
  const p = projektAnlegen(TK.raum, TK.anl, { ticket: { nr: TK.nr, objekt: TK.objekt, einheit: TK.einheit }, notizen: TK.text });
  p.name = (ANLEITUNGEN[TK.anl] ? ANLEITUNGEN[TK.anl].t : 'Renovierung') + ' – ' + TK.objekt + (TK.einheit ? ' ' + TK.einheit : '');
  speichern('Aus JoumHome-Ticket'); geh('#/projekt/' + p.id);
};
route('ticket', (_, q) => {
  ['nr', 'objekt', 'einheit', 'raum', 'text'].forEach((k) => { if (q[k]) TK[k] = q[k]; });
  if (q.raum && raum(q.raum) && !raum(q.raum).projekte.includes(TK.anl)) TK.anl = raum(q.raum).projekte[0] || '';
  const r = raum(TK.raum) || RAEUME[0];
  return kopf('JoumHome-Ticket übernehmen', 'Ticket → Renovierungsprojekt', '#/mehr') + `<div class="inhalt">
    <ol class="ablauf"><li>Mieter meldet Schaden in JoumHome</li><li>Ticket hier übernehmen → Projekt mit Raum, Maßen, Anleitung</li><li>Selbst erledigen oder an Handwerker vergeben</li><li>Abnahme + Rechnung zurück an Objekt (Anlage V)</li></ol>
    <div class="raster2"><label class="feld">Ticket-Nr.<input value="${esc(TK.nr)}" data-ein="tk" data-k="nr"></label><label class="feld">Wohnung/Einheit<input value="${esc(TK.einheit)}" data-ein="tk" data-k="einheit"></label></div>
    <label class="feld">Objekt (Adresse/Name)<input value="${esc(TK.objekt)}" data-ein="tk" data-k="objekt"></label>
    <label class="feld">Raum<select data-ein="tk" data-k="raum">${RAEUME.map((x) => `<option value="${x.id}" ${x.id === TK.raum ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
    <label class="feld">Arbeit<select data-ein="tk" data-k="anl">${r.projekte.map((a) => `<option value="${a}" ${a === TK.anl ? 'selected' : ''}>${esc(ANLEITUNGEN[a].t)}</option>`).join('')}</select></label>
    <label class="feld">Beschreibung aus dem Ticket<textarea rows="3" data-ein="tk" data-k="text">${esc(TK.text)}</textarea></label>
    <button class="btn hell voll" data-akt="ticketAnlegen">Renovierungsprojekt anlegen</button>
    <p class="klein">Direktlink aus JoumHome: <code>#/ticket?nr=…&objekt=…&einheit=…&raum=bad&text=…</code></p>
  </div>`;
});

/* ---------- Mehr & Einstellungen ---------- */
EIN.einst = (v, d) => aendern((s) => { s.einstellungen[d.k] = v; });
route('mehr', () => kopf('Mehr', 'Joum 4D Build') + `<div class="inhalt">
  <a class="btn hell voll" href="#/anmelden" style="margin-bottom:12px">${S.konto && S.konto.angemeldet ? 'Mein Konto' : 'Anmelden mit Google – ohne Passwort'}</a>
  ${[['#/assistent', 'Planungs-Assistent (sprechen/schreiben)'], ['#/projekte', 'Alle Räume & Projekte'], ['#/garten', 'Gartenplaner 4D'], ['#/tour', 'Kino-Tour (Video aus Fotos)'], ['#/installation', 'Wasser, Abwasser & Elektro'], ['#/installation?tab=werkzeug', 'Werkzeug kaufen & leihen'], ['#/rechner', 'Tipps & Rechner'], ['#/einkauf', 'Einkauf'], ['#/preise', 'Produkt-Preisvergleich'], ['#/finanzen', 'Finanzen & Steuer'], ['#/fragen', 'Frage an Profi (Architekt, Handwerker)'], ['#/markt', 'Profi & Marktplatz'], ['#/handwerker', 'Handwerker-Pro'], ['#/community', 'Community'], ['#/ticket', 'JoumHome-Ticket übernehmen'], ['#/sicherung', 'Datensicherung & Versionen']].map(([h, n]) => `<a class="liste-zeile" href="${h}"><span style="flex:1">${n}</span>›</a>`).join('')}
  <h3>Einstellungen</h3>
  <label class="feld">Mein Können (für Zeitpläne)<select data-ein="koennen">${[['anfaenger', 'Anfänger'], ['fortgeschritten', 'Fortgeschritten'], ['profi', 'Profi / Handwerker']].map(([v, n]) => `<option value="${v}" ${(S.einstellungen.koennen || 'fortgeschritten') === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
  <label class="schalter"><input type="checkbox" ${S.einstellungen.vorlesen ? 'checked' : ''} data-ein="einst" data-k="vorlesen"> Alles vorlesen (bei jedem Antippen und Seitenwechsel)</label>
  <label class="feld">Sprechtempo<select data-ein="vorlesenEinst" data-k="sprechTempo">${[[0.8, 'Langsam'], [0.95, 'Normal'], [1.15, 'Schnell']].map(([v, n]) => `<option value="${v}" ${(S.einstellungen.sprechTempo || 0.95) == v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
  <div class="hinweis klein">Tipp: Auf jeden Knopf <b>lange drücken</b> – die App zeigt einen Hinweis und liest ihn vor. Der Lautsprecher-Knopf unten rechts liest jede Seite vor.</div>
  <label class="schalter"><input type="checkbox" ${S.einstellungen.gross ? 'checked' : ''} data-ein="einst" data-k="gross"> Großschrift</label>
  <label class="schalter"><input type="checkbox" ${S.einstellungen.kontrast ? 'checked' : ''} data-ein="einst" data-k="kontrast"> Hoher Kontrast</label>
  <h3>Über</h3>
  <p class="klein">Joum 4D Build · Version 1.0 · Plan. Bau. Fertig. / Plan. Build. Done. / Plan. Bouw. Klaar.<br>Alle Fachinhalte sind allgemeine Hinweise ohne Gewähr; Herstellerangaben, Bauordnung des Bundeslands und aktuelle Gesetze haben Vorrang. Arbeiten an Strom, Gas, Statik und Dach: Fachbetrieb.</p>
</div>`);

/* ---------- Symbole (Linien-SVG) ---------- */
const ic = (d) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  messen: ic('<path d="M3 17l14-14 4 4-14 14H3z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>'),
  wuerfel: ic('<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M21 7l-9 5-9-5"/>'),
  baum: ic('<circle cx="12" cy="9" r="6"/><path d="M12 15v7"/>'),
  korb: ic('<path d="M3 6h18l-2 12H5z"/><path d="M8 6l4-4 4 4"/>'),
  rechner: ic('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>'),
  beleg: ic('<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>'),
  hand: ic('<path d="M14 7l3-3 3 3-3 3M17 4v0M3 21l8-8M8 10l6 6"/>'),
  link: ic('<path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/>'),
  funke: ic('<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>'),
  liste: ic('<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
  scan: ic('<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/><path d="M7 12h10"/>'),
  kamera: ic('<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>'),
  mikro: ic('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4"/>'),
  start: ic('<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>'),
  tropfen: ic('<path d="M12 2s7 8 7 13a7 7 0 01-14 0c0-5 7-13 7-13z"/>'),
  film: ic('<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 9l5 3-5 3z"/>'),
  lautsprecher: ic('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>'),
  mehr: ic('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')
};
