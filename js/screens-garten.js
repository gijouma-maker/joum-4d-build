/* Joum 4D Build – Gartenplaner 4D, Rechner, Einkauf, Finanzen */

/* ---------- Gartenplaner 4D ---------- */
const JAHRE = [0, 1, 3, 5];
const SAISON = ['Frühling', 'Sommer', 'Herbst', 'Winter'];
const G = { v: 0, j: 0, s: 1, schraeg: true, timer: null };

AKT.gV = (d) => { G.v = (G.v + (+d.r) + GARTEN_VORSCHLAEGE.length) % GARTEN_VORSCHLAEGE.length; render(); };
AKT.gJ = (d) => { G.j = +d.j; render(); };
AKT.gS = (d) => { G.s = +d.s; render(); };
AKT.gAnsicht = () => { G.schraeg = !G.schraeg; render(); };
AKT.gPlay = () => {
  if (G.timer) { clearInterval(G.timer); G.timer = null; render(); return; }
  G.j = 0; G.s = 0;
  G.timer = setInterval(() => {
    if (location.hash.indexOf('#/garten') !== 0) { clearInterval(G.timer); G.timer = null; return; }
    G.s++; if (G.s > 3) { G.s = 0; G.j++; }
    if (G.j > 3) { G.j = 3; G.s = 1; clearInterval(G.timer); G.timer = null; }
    render();
  }, 700);
  render();
};
AKT.gProjekt = () => {
  const v = GARTEN_VORSCHLAEGE[G.v];
  const summe = v.kosten.reduce((s, k) => s + k[1], 0);
  const p = projektAnlegen('garten', null, { name: 'Garten – ' + v.name, garten: v.id, notizen: v.kosten.map((k) => k[0] + ': ca. ' + euro(k[1])).join('\n') + '\nSumme ca. ' + euro(summe) });
  aendern((s) => v.kosten.forEach((k) => s.einkauf.push({ id: uid(), n: k[0], menge: 1, einheit: 'Pos.', hinweis: 'Richtwert ' + euro(k[1]), projekt: p.id, erledigt: false })), 'Garten übernommen');
  toast('Gartenprojekt angelegt'); location.hash = '#/projekt/' + p.id;
};

function gartenSVG(v) {
  const jahr = JAHRE[G.j], s = G.s, sy = G.schraeg ? 0.62 : 1;
  const fl = [], baeume = [];
  const farbe = (k) => (GARTEN_FARBEN[k] || [])[s];
  const reife = Math.min(1, 0.55 + jahr * 0.1);
  v.elemente.forEach((e) => {
    if (e.r != null) { baeume.push(e); return; }
    if (e.k === 'licht') { fl.push(`<circle cx="${e.x}" cy="${e.y}" r="0.25" fill="#ffd27a"/><circle cx="${e.x + 2}" cy="${e.y + 2.5}" r="0.25" fill="#ffd27a"/><circle cx="${e.x}" cy="${e.y + 5}" r="0.25" fill="#ffd27a"/>`); return; }
    const basis = { terrasse: '#c9b89c', weg: '#b3a58c', kies: '#d2cbbb', teich: s === 3 ? '#a8c4d8' : '#3a7ab8', spiel: '#d6be8c', sand: '#ead9a0', haus: '#8a6a4a' }[e.k];
    let f = basis || farbe(e.k) || '#777';
    const op = ['beet', 'hochbeet', 'insel', 'lavendel', 'hecke'].includes(e.k) ? reife : 1;
    const rx = ['beet', 'insel', 'teich'].includes(e.k) ? Math.min(e.w, e.h) / 2.2 : 0.15;
    fl.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${rx}" fill="${f}" opacity="${op}"/>`);
    if (e.k === 'terrasse') for (let x = e.x + 0.5; x < e.x + e.w; x += 0.5) fl.push(`<line x1="${x}" y1="${e.y}" x2="${x}" y2="${e.y + e.h}" stroke="#a8977c" stroke-width="0.04"/>`);
    if (e.k === 'hochbeet') fl.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="none" stroke="#7a5a3a" stroke-width="0.2"/>`);
    if (['beet', 'insel', 'lavendel', 'hochbeet'].includes(e.k) && s < 3) {
      const n = Math.round(e.w * e.h * (0.6 + jahr * 0.3));
      for (let i = 0; i < n; i++) { const px = e.x + 0.2 + ((i * 7.3) % (e.w - 0.4)), py = e.y + 0.2 + ((i * 3.7) % Math.max(0.1, e.h - 0.4)); fl.push(`<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${(0.12 + jahr * 0.03).toFixed(2)}" fill="${['#fff3b0', '#ff9ec2', '#c7a3ff', '#ffb36b'][(i + s) % 4]}" opacity="0.9"/>`); }
    }
    if (e.n && e.w * e.h > 3) fl.push(`<text x="${e.x + e.w / 2}" y="${e.y + e.h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="0.55" fill="#111" font-family="Jost" opacity="0.85" transform="${G.schraeg ? `translate(0 ${e.y + e.h / 2}) scale(1 ${1 / sy}) translate(0 ${-(e.y + e.h / 2)})` : ''}">${esc(e.n)}</text>`);
  });
  const radius = (b) => b.r + (b.rMax - b.r) * Math.min(1, jahr / b.jahre);
  const baumSvg = baeume.sort((a, b) => a.y - b.y).map((b) => {
    const r = radius(b), krone = farbe(b.k), kahl = s === 3 && b.k !== 'hecke';
    if (!G.schraeg) return `<circle cx="${b.x}" cy="${b.y}" r="${r}" fill="${krone}" opacity="${kahl ? 0.45 : 0.9}" stroke="#1d3a12" stroke-width="0.06"/><circle cx="${b.x}" cy="${b.y}" r="0.12" fill="#4a3424"/>`;
    const gx = b.x, gy = b.y * sy, hoehe = r * 1.5 + 0.4;
    return `<ellipse cx="${gx + r * 0.4}" cy="${gy + 0.1}" rx="${r}" ry="${r * 0.35}" fill="#000" opacity="0.22"/>
      <line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy - hoehe}" stroke="#5a3f2a" stroke-width="${0.12 + r * 0.05}"/>
      <circle cx="${gx}" cy="${gy - hoehe}" r="${r}" fill="${krone}" opacity="${kahl ? 0.35 : 0.95}" stroke="#1d3a12" stroke-width="0.05"/>
      ${s === 1 && b.k === 'obstbaum' && jahr >= 3 ? [0, 1, 2, 3, 4].map((i) => `<circle cx="${gx + Math.cos(i * 1.3) * r * 0.6}" cy="${gy - hoehe + Math.sin(i * 1.3) * r * 0.6}" r="0.13" fill="#d33"/>`).join('') : ''}
      ${s === 0 && b.k === 'obstbaum' ? [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${gx + Math.cos(i) * r * 0.7}" cy="${gy - hoehe + Math.sin(i) * r * 0.7}" r="0.12" fill="#fff"/>`).join('') : ''}`;
  }).join('');
  const hoeheVB = 12 * sy + 2.2 + (G.schraeg ? 3 : 0);
  return `<svg viewBox="-0.3 ${G.schraeg ? -5 : -2} 20.6 ${hoeheVB + 0.5}" width="100%" role="img" aria-label="Garten ${esc(v.name)} nach ${jahr} Jahren im ${SAISON[s]}">
    <rect x="-0.3" y="${-2 * sy}" width="20.6" height="${2 * sy}" fill="#2b2b2b"/><text x="10" y="${-0.9 * sy}" text-anchor="middle" dominant-baseline="middle" font-size="0.6" fill="#aaa" font-family="Jost">Haus</text>
    <g transform="scale(1 ${sy})"><rect x="0" y="0" width="20" height="12" fill="${s === 3 ? '#8a9a7a' : '#3d5a2e'}"/>${fl.join('')}</g>
    ${baumSvg}
    ${s === 3 ? '<rect x="-0.3" y="-5" width="20.6" height="20" fill="#fff" opacity="0.08"/>' : ''}
  </svg>`;
}

route('garten', () => {
  const v = GARTEN_VORSCHLAEGE[G.v];
  const summe = v.kosten.reduce((s, k) => s + k[1], 0);
  return kopf('Gartenplaner 4D', 'Garten · 20 × 12 m', '#/projekte?tab=garten') + `<div class="inhalt">
    <div class="zeile vorschlag-kopf"><button class="rund" aria-label="Vorheriger Vorschlag" data-akt="gV" data-r="-1">‹</button>
      <div style="flex:1;text-align:center"><div class="klein">Vorschlag ${G.v + 1} von ${GARTEN_VORSCHLAEGE.length} · Pflege ${v.pflege}</div><b class="gross-titel">${esc(v.name)}</b></div>
      <button class="rund" aria-label="Nächster Vorschlag" data-akt="gV" data-r="1">›</button></div>
    <div class="garten-buehne">${gartenSVG(v)}</div>
    <div class="segment">${JAHRE.map((j, i) => `<button class="${i === G.j ? 'an' : ''}" data-akt="gJ" data-j="${i}">${j === 0 ? 'Jetzt' : j + (j === 1 ? ' Jahr' : ' Jahre')}</button>`).join('')}</div>
    <div class="segment">${SAISON.map((n, i) => `<button class="${i === G.s ? 'an' : ''}" data-akt="gS" data-s="${i}">${n}</button>`).join('')}</div>
    <div class="zeile"><button class="btn" data-akt="gPlay">${G.timer ? 'Stopp' : '▶ Wachstum abspielen'}</button><button class="btn" data-akt="gAnsicht">${G.schraeg ? 'Draufsicht' : 'Schrägansicht 3D'}</button></div>
    <p class="klein">${esc(v.text)}</p>
    <h3>Kosten (Richtwerte)</h3>
    <div class="karte">${v.kosten.map((k) => `<div class="kat-zeile zeile"><span style="flex:1">${esc(k[0])}</span><b>${euro(k[1])}</b></div>`).join('')}
      <div class="kat-zeile zeile"><b style="flex:1">Summe ca.</b><b>${euro(summe)}</b></div></div>
    <h3>Tipps</h3>
    ${GARTEN_TIPPS.map(([t, x]) => `<div class="hinweis klein"><b>${esc(t)}:</b> ${esc(x)}</div>`).join('')}
    <div class="zeile"><button class="btn hell" data-akt="gProjekt">Diesen Vorschlag übernehmen</button><a class="btn" href="#/projekte?tab=garten">Einzelprojekte</a></div>
  </div>`;
});

/* ---------- Rechner ---------- */
const R = { tab: 'daemm', A: 60, d: 18, lam: 0.035, ualt: 1.0, preis: 0.12, flaeche: 40, anstriche: 2, ergiebig: 0.15, fl: 20, verschnitt: 10, fliese: 0.36, paket: 1.44, umf: 16, hoehe: 2.5, rolleL: 10.05, rolleB: 0.53, bl: 1, bb: 0.4, bt: 0.8 };
AKT.rTab = (d) => { R.tab = d.t; render(); };
EIN.r = (v, d) => { R[d.k] = parseZahl(v); render(); };
function rFeld(k, label, einheit) { return `<label class="feld">${esc(label)}${einheit ? ' (' + einheit + ')' : ''}<input inputmode="decimal" value="${zahl(R[k], 3)}" data-ein="r" data-k="${k}"></label>`; }

route('rechner', () => {
  const tabs = [['daemm', 'Dämmung'], ['farbe', 'Farbe'], ['boden', 'Fliesen/Boden'], ['tapete', 'Tapete'], ['beton', 'Beton']];
  let x = '';
  if (R.tab === 'daemm') {
    const Rsi = 0.1, Rse = 0.04, Rbest = 1 / Math.max(0.05, R.ualt) - Rsi - Rse;
    const unNeu = 1 / (Rsi + Rse + Math.max(0, Rbest) + (R.d / 100) / Math.max(0.01, R.lam));
    const uNeu = unNeu * 1.1; // vereinfachter Zuschlag für Sparrenanteil/Wärmebrücken
    const kwh = Math.max(0, (R.ualt - uNeu) * R.A * 75);
    const ok = uNeu <= 0.24;
    x = `${rFeld('A', 'Dachfläche', 'm²')}${rFeld('d', 'Dämmstärke', 'cm')}
      <label class="feld">Dämmstoff<select data-ein="r" data-k="lam">${[[0.032, 'PUR/PIR (λ 0,032)'], [0.035, 'Mineralwolle (λ 0,035)'], [0.04, 'Mineralwolle/Zellulose (λ 0,040)'], [0.045, 'Holzfaser (λ 0,045)']].map(([l, n]) => `<option value="${l}" ${R.lam === l ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      ${rFeld('ualt', 'U-Wert vorher', 'W/m²K')}${rFeld('preis', 'Energiepreis', '€/kWh')}
      <section class="karte summe"><div><span class="klein">U-Wert neu ca.</span><b>${zahl(uNeu, 3)}</b></div><div><span class="klein">Grenzwert</span><b>0,24</b></div><div><span class="klein">Ersparnis/Jahr</span><b>${zahl(kwh, 0)} kWh</b></div></section>
      <div class="hinweis ${ok ? 'gruen' : 'rot'}">${ok ? 'Grenzwert eingehalten.' : 'Grenzwert 0,24 W/m²K nicht erreicht – Dämmung dicker oder besserer Dämmstoff (oder Aufsparren-/Untersparrendämmung ergänzen).'} Ersparnis ca. ${euro(kwh * R.preis)} pro Jahr.</div>
      <p class="klein">Vereinfachte Schätzung (Heizgradstunden ca. 75 kKh/a, +10 % für Sparren). Für Förderung und Nachweis: Energieberater. Grenzwerte nach GEG/GModG aktuell prüfen.</p>`;
  } else if (R.tab === 'farbe') {
    const l = R.flaeche * R.anstriche * R.ergiebig;
    x = `${rFeld('flaeche', 'Fläche', 'm²')}${rFeld('anstriche', 'Anstriche', '')}${rFeld('ergiebig', 'Verbrauch je Anstrich', 'l/m²')}
      <section class="karte summe"><div><span class="klein">Farbe</span><b>${zahl(l, 1)} l</b></div><div><span class="klein">Eimer 10 l</span><b>${Math.ceil(l / 10)}</b></div><div><span class="klein">Eimer 5 l</span><b>${Math.ceil(l / 5)}</b></div></section>`;
  } else if (R.tab === 'boden') {
    const m2 = R.fl * (1 + R.verschnitt / 100);
    x = `${rFeld('fl', 'Fläche', 'm²')}${rFeld('verschnitt', 'Verschnitt', '%')}${rFeld('fliese', 'Fläche je Fliese/Diele', 'm²')}${rFeld('paket', 'Inhalt je Paket', 'm²')}
      <section class="karte summe"><div><span class="klein">Bedarf</span><b>${zahl(m2, 1)} m²</b></div><div><span class="klein">Stück</span><b>${Math.ceil(m2 / Math.max(0.01, R.fliese))}</b></div><div><span class="klein">Pakete</span><b>${Math.ceil(m2 / Math.max(0.01, R.paket))}</b></div></section>
      <p class="klein">Verschnitt: gerade 10 %, diagonal/Fischgrät 15 %, viele Ecken mehr.</p>`;
  } else if (R.tab === 'tapete') {
    const bpr = Math.max(1, Math.floor(R.rolleL / (R.hoehe + 0.1))), bahnen = Math.ceil(R.umf / R.rolleB);
    x = `${rFeld('umf', 'Wandumfang ohne Türen/Fenster', 'm')}${rFeld('hoehe', 'Raumhöhe', 'm')}${rFeld('rolleB', 'Rollenbreite', 'm')}${rFeld('rolleL', 'Rollenlänge', 'm')}
      <section class="karte summe"><div><span class="klein">Bahnen</span><b>${bahnen}</b></div><div><span class="klein">Bahnen/Rolle</span><b>${bpr}</b></div><div><span class="klein">Rollen</span><b>${Math.ceil(bahnen / bpr)}</b></div></section><p class="klein">Bei Muster mit Rapport 1 Rolle Reserve.</p>`;
  } else {
    const m3 = R.bl * R.bb * R.bt;
    x = `${rFeld('bl', 'Länge', 'm')}${rFeld('bb', 'Breite', 'm')}${rFeld('bt', 'Tiefe (frostfrei 0,8)', 'm')}
      <section class="karte summe"><div><span class="klein">Volumen</span><b>${zahl(m3, 3)} m³</b></div><div><span class="klein">Fertigbeton 25 kg</span><b>${Math.ceil(m3 * 1000 / 12)} Sack</b></div><div><span class="klein">Gewicht</span><b>${zahl(m3 * 2.3, 2)} t</b></div></section><p class="klein">Ab ca. 0,5 m³ lohnt Transportbeton.</p>`;
  }
  return kopf('Tipps & Rechner', 'Schätzen, bevor du kaufst', '#/') + `<div class="inhalt">
    <div class="chips">${tabs.map(([k, n]) => `<button class="chip ${R.tab === k ? 'an' : ''}" data-akt="rTab" data-t="${k}">${n}</button>`).join('')}</div>${x}
    <h3>Profi-Hinweise</h3>
    <div class="hinweis klein">Erst abdichten, dann fliesen. · Große Fliesen und helle Wände lassen Räume größer wirken. · Immer 10 % Verschnitt einplanen. · Vor dem Bohren Leitungssucher. · Strom, Gas, Statik: Fachbetrieb.</div>
  </div>`;
});

/* ---------- Einkauf ---------- */
AKT.ekToggle = (d) => aendern((s) => { const e = s.einkauf.find((x) => x.id === d.id); e.erledigt = !e.erledigt; });
AKT.ekWeg = (d) => aendern((s) => { inPapierkorb('einkauf', s.einkauf.find((x) => x.id === d.id)); s.einkauf = s.einkauf.filter((x) => x.id !== d.id); });
AKT.ekErledigteWeg = () => aendern((s) => { s.einkauf.filter((x) => x.erledigt).forEach((x) => inPapierkorb('einkauf', x)); s.einkauf = s.einkauf.filter((x) => !x.erledigt); }, 'Erledigte entfernt');
EIN.ekMenge = (v, d) => aendern((s) => { s.einkauf.find((x) => x.id === d.id).menge = parseZahl(v); });
EIN.ekNeu = (v) => { if (!v.trim()) return; aendern((s) => s.einkauf.push({ id: uid(), n: v.trim(), menge: 1, einheit: 'Stück', erledigt: false })); };
function ekText() {
  return 'Materialanfrage (Joum 4D Build):\n' + S.einkauf.filter((e) => !e.erledigt).map((e) => `- ${e.n}: ${zahl(e.menge, 1)} ${e.einheit}`).join('\n');
}
AKT.ekWhatsapp = () => window.open('https://wa.me/?text=' + encodeURIComponent(ekText()), '_blank');
AKT.ekKopieren = () => { navigator.clipboard && navigator.clipboard.writeText(ekText()); toast('Liste kopiert'); };

route('einkauf', () => {
  const offen = S.einkauf.filter((e) => !e.erledigt);
  const gruppen = {};
  S.einkauf.forEach((e) => { const k = e.projekt && projekt(e.projekt) ? projekt(e.projekt).name : 'Allgemein'; (gruppen[k] = gruppen[k] || []).push(e); });
  return kopf('Einkauf', offen.length + ' offen · inkl. Verschnitt', '#/') + `<div class="inhalt">
    <label class="feld">Neue Position<input placeholder="z. B. Dübel 8 mm" data-ein="ekNeu"></label>
    ${Object.keys(gruppen).length ? Object.entries(gruppen).map(([g, l]) => `<h3>${esc(g)}</h3><div class="karte">${l.map((e) => `<div class="ek-zeile ${e.erledigt ? 'erledigt' : ''}">
      <button class="haken" aria-label="Erledigt" data-akt="ekToggle" data-id="${e.id}">${e.erledigt ? '✓' : ''}</button>
      <span style="flex:1">${esc(e.n)}${e.hinweis ? `<span class="klein block">${esc(e.hinweis)}</span>` : ''}</span>
      <input class="anz" inputmode="decimal" aria-label="Menge" value="${zahl(e.menge, 1)}" data-ein="ekMenge" data-id="${e.id}"><span class="klein">${esc(e.einheit)}</span>
      <a class="klein" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(e.n)}">Preise</a>
      <button class="x" aria-label="Löschen" data-akt="ekWeg" data-id="${e.id}">×</button></div>`).join('')}</div>`).join('') : '<p class="klein">Noch leer. Material kommt aus Anleitungen, Planer oder Gartenplaner.</p>'}
    <h3>Händler anfragen</h3>
    <div class="zeile"><button class="btn hell" data-akt="ekWhatsapp">Per WhatsApp anfragen</button><button class="btn" data-akt="ekKopieren">Liste kopieren</button></div>
    <div class="zeile"><a class="btn" href="#/preise">Produkt-Preisvergleich</a><button class="btn" data-akt="ekErledigteWeg">Erledigte entfernen</button></div>
    <p class="klein">Händlerpreise direkt in der App folgen über Partner-/Affiliate-Feeds. Partner-Links werden gekennzeichnet.</p>
  </div>`;
});

/* ---------- Finanzen ---------- */
const FQ = { betrag: '', haendler: '', datum: new Date().toISOString().slice(0, 10), kategorie: 'Material', lohn: '', zahlung: 'Überweisung', nutzung: 'selbst', projekt: '', foto: null };
EIN.fq = (v, d) => { FQ[d.k] = v; if (d.k === 'kategorie' || d.k === 'nutzung') render(); };
AKT.fqFoto = () => document.getElementById('fqFoto').click();
EIN.fqFotoDatei = (v, d, el) => { const f = el.files[0]; if (f) bildVerkleinern(f, 900, (u) => { FQ.foto = u; render(); toast('Beleg fotografiert – Betrag und Händler bitte prüfen/eintragen.'); }); };
AKT.fqSpeichern = () => {
  if (!parseZahl(FQ.betrag)) { toast('Bitte Betrag eintragen'); return; }
  aendern((s) => s.quittungen.unshift(Object.assign({ id: uid() }, FQ)), 'Quittung gespeichert');
  Object.assign(FQ, { betrag: '', haendler: '', lohn: '', foto: null });
  toast('Quittung gespeichert');
};
AKT.fqWeg = (d) => aendern((s) => { inPapierkorb('quittung', s.quittungen.find((x) => x.id === d.id)); s.quittungen = s.quittungen.filter((x) => x.id !== d.id); });
AKT.fqCsv = () => {
  const zeilen = [['Datum', 'Händler', 'Projekt', 'Kategorie', 'Betrag', 'Lohnanteil', 'Zahlung', 'Nutzung']].concat(S.quittungen.map((q) => [q.datum, q.haendler, (projekt(q.projekt) || {}).name || '', q.kategorie, zahl(q.betrag), zahl(q.lohn), q.zahlung, q.nutzung]));
  const csv = zeilen.map((z) => z.map((x) => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'joum4d-ausgaben.csv'; a.click();
};

route('finanzen', (_, q) => {
  if (q.p && !FQ.projekt) FQ.projekt = q.p;
  const jahr = new Date().getFullYear();
  const dieses = S.quittungen.filter((x) => (x.datum || '').startsWith(String(jahr)));
  const summe = dieses.reduce((s, x) => s + parseZahl(x.betrag), 0);
  const lohn35a = dieses.filter((x) => x.nutzung === 'selbst' && x.zahlung !== 'Bar').reduce((s, x) => s + parseZahl(x.lohn), 0);
  const erm = Math.min(1200, lohn35a * 0.2);
  const wk = dieses.filter((x) => x.nutzung === 'vermietet').reduce((s, x) => s + parseZahl(x.betrag), 0);
  const sel = (k, opts) => `<select data-ein="fq" data-k="${k}">${opts.map((o) => `<option ${FQ[k] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  return kopf('Finanzen', 'Quittungen & Steuer ' + jahr, '#/') + `<div class="inhalt">
    <section class="karte summe"><div><span class="klein">Ausgaben ${jahr}</span><b>${euro(summe)}</b></div><div><span class="klein">§ 35a ca.</span><b>${euro(erm)}</b></div><div><span class="klein">Werbungskosten</span><b>${euro(wk)}</b></div></section>
    <h3>Quittung erfassen</h3>
    <input type="file" accept="image/*" capture="environment" id="fqFoto" hidden data-ein="fqFotoDatei">
    ${FQ.foto ? `<img class="skizze" src="${FQ.foto}" alt="Beleg">` : ''}
    <button class="btn voll" data-akt="fqFoto">${ICON.kamera} Beleg fotografieren</button>
    <div class="raster2">
      <label class="feld">Betrag (€)<input inputmode="decimal" value="${esc(FQ.betrag)}" data-ein="fq" data-k="betrag"></label>
      <label class="feld">Datum<input type="date" value="${esc(FQ.datum)}" data-ein="fq" data-k="datum"></label>
    </div>
    <label class="feld">Händler / Handwerker<input value="${esc(FQ.haendler)}" data-ein="fq" data-k="haendler"></label>
    <label class="feld">Projekt / Objekt<select data-ein="fq" data-k="projekt"><option value="">– ohne –</option>${S.projekte.map((p) => `<option value="${p.id}" ${FQ.projekt === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
    <div class="raster2"><label class="feld">Art${sel('kategorie', ['Material', 'Handwerker', 'Gemischt'])}</label><label class="feld">Bezahlt per${sel('zahlung', ['Überweisung', 'Karte', 'App-Treuhand', 'Bar'])}</label></div>
    <label class="feld">Nutzung${sel('nutzung', ['selbst', 'vermietet'])}</label>
    ${FQ.kategorie !== 'Material' ? `<label class="feld">Davon Arbeitslohn (€, lt. Rechnung)<input inputmode="decimal" value="${esc(FQ.lohn)}" data-ein="fq" data-k="lohn"></label>` : ''}
    ${FQ.zahlung === 'Bar' && FQ.kategorie !== 'Material' ? '<div class="hinweis rot klein">Barzahlung ist für § 35a nicht absetzbar – nur Überweisung auf das Konto des Handwerkers.</div>' : ''}
    <button class="btn hell voll" data-akt="fqSpeichern">Speichern</button>
    <div class="hinweis klein"><b>Steuer:</b> Selbst genutzt: § 35a EStG – 20 % vom Arbeitslohn (nicht Material), max. 1.200 € pro Jahr, nur unbare Zahlung mit Rechnung. Vermietet: Werbungskosten (Anlage V), Erhaltungsaufwand. Änderungen ab 2027 mit Steuerberater prüfen.</div>
    <h3>Belege (${S.quittungen.length})</h3>
    ${S.quittungen.map((x) => `<div class="liste-zeile">${x.foto && x.foto !== '[Foto]' ? `<img class="mini" src="${x.foto}" alt="">` : ''}<span style="flex:1">${esc(x.haendler || x.kategorie)}<span class="klein block">${datum(x.datum)} · ${esc((projekt(x.projekt) || {}).name || 'ohne Projekt')} · ${esc(x.zahlung)}</span></span><b>${euro(parseZahl(x.betrag))}</b><button class="x" aria-label="Löschen" data-akt="fqWeg" data-id="${x.id}">×</button></div>`).join('')}
    ${S.quittungen.length ? '<button class="btn voll" data-akt="fqCsv">Export für Steuerberater (CSV)</button>' : ''}
  </div>`;
});
