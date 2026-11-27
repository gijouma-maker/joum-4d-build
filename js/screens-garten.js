/* Joum 4D Build – Gartenplaner 4D, Rechner, Einkauf, Finanzen */

/* ---------- Gartenplaner 4D ---------- */
const JAHRE = [0, 1, 3, 5];
const SAISON = ['Frühling', 'Sommer', 'Herbst', 'Winter'];
const G = { v: 0, j: 0, s: 1, schraeg: true, timer: null, L: 20, T: 12, wunsch: {}, liste: null };
function gartenListe() { if (!G.liste) G.liste = gartenVorschlaege(G.L, G.T, G.wunsch); return G.liste; }
function gartenNeu() { G.liste = null; G.v = 0; }

AKT.gV = (d) => { const n = gartenListe().length; G.v = (G.v + (+d.r) + n) % n; render(); };
AKT.gWahl = (d) => { G.v = +d.i; render(); window.scrollTo(0, 0); };
AKT.gJ = (d) => { G.j = +d.j; render(); };
AKT.gS = (d) => { G.s = +d.s; render(); };
AKT.gAnsicht = () => { G.schraeg = !G.schraeg; render(); };
EIN.gMass = (v, d) => { G[d.k] = Math.max(3, Math.min(60, parseZahl(v) || G[d.k])); gartenNeu(); render(); };
AKT.gWunsch = (d) => { const w = G.wunsch; const v = d.v === 'true' ? true : d.v === 'false' ? false : d.v === '' ? undefined : (isNaN(+d.v) ? d.v : +d.v); if (w[d.k] === v) delete w[d.k]; else w[d.k] = v; gartenNeu(); render(); };
AKT.gPlay = () => {
  if (G.timer) { clearInterval(G.timer); G.timer = null; render(); return; }
  G.j = 0; G.s = 0;
  G.timer = setInterval(() => {
    if (PFAD.indexOf('#/garten') !== 0) { clearInterval(G.timer); G.timer = null; return; }
    G.s++; if (G.s > 3) { G.s = 0; G.j++; }
    if (G.j > 3) { G.j = 3; G.s = 1; clearInterval(G.timer); G.timer = null; }
    render();
  }, 700);
  render();
};
AKT.g4D = () => { try { zeigeGarten4D(gartenListe()[G.v]); } catch (e) { console.error(e); info('Der 4D-Garten braucht WebGL – auf diesem Gerät nicht verfügbar.'); } };
AKT.gProjekt = () => {
  const v = gartenListe()[G.v];
  const p = projektAnlegen('garten', null, { name: 'Garten – ' + v.name + ' (' + BELAEGE[v.belag].n + ')', garten: v.id, gartenPlan: v, breite: v.L * 100, tiefe: v.T * 100, notizen: v.kosten.map((k) => k[0] + ': ca. ' + euro(k[1])).join('\n') + '\nSumme ca. ' + euro(v.summe) });
  aendern((s) => v.kosten.forEach((k) => s.einkauf.push({ id: uid(), n: k[0], menge: 1, einheit: 'Pos.', hinweis: 'Richtwert ' + euro(k[1]), projekt: p.id, erledigt: false })), 'Garten übernommen');
  toast('Gartenprojekt angelegt'); geh('#/projekt/' + p.id);
};

function gartenSVG(v, mini) {
  const L = v.L || 20, T = v.T || 12;
  const jahr = mini ? 3 : JAHRE[G.j], s = mini ? 1 : G.s, schraeg = mini ? false : G.schraeg, sy = schraeg ? 0.62 : 1;
  const fl = [], baeume = [];
  const farbe = (k) => (GARTEN_FARBEN[k] || [])[s];
  const reife = Math.min(1, 0.55 + jahr * 0.1);
  const fs = Math.max(0.35, Math.min(L, T) / 22);
  v.elemente.forEach((e) => {
    if (e.r != null) { baeume.push(e); return; }
    if (e.k === 'licht') { [0, 2.5, 5].forEach((dy) => { if (e.y + dy < T) fl.push(`<circle cx="${e.x}" cy="${e.y + dy}" r="${fs * 0.4}" fill="#ffd27a"/>`); }); return; }
    const basis = { terrasse: e.mat ? BELAEGE[e.mat].farbe : '#c9b89c', weg: '#b3a58c', kies: '#d2cbbb', teich: s === 3 ? '#a8c4d8' : '#3a7ab8', spiel: '#d6be8c', sand: '#ead9a0', haus: '#8a6a4a' }[e.k];
    const f = basis || farbe(e.k) || '#777';
    const op = ['beet', 'hochbeet', 'insel', 'lavendel', 'hecke'].includes(e.k) ? reife : 1;
    const rx = ['beet', 'insel', 'teich'].includes(e.k) ? Math.min(e.w, e.h) / 2.2 : 0.15;
    fl.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${rx}" fill="${f}" opacity="${op}"/>`);
    if (e.k === 'terrasse') for (let x = e.x + 0.5; x < e.x + e.w; x += (e.mat === 'stein' || e.mat === 'beton' ? 0.6 : 0.2)) fl.push(`<line x1="${x}" y1="${e.y}" x2="${x}" y2="${e.y + e.h}" stroke="rgba(0,0,0,.15)" stroke-width="0.03"/>`);
    if (e.k === 'hochbeet') fl.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="none" stroke="#7a5a3a" stroke-width="0.2"/>`);
    if (['beet', 'insel', 'lavendel', 'hochbeet'].includes(e.k) && s < 3 && !mini) {
      const n = Math.min(80, Math.round(e.w * e.h * (0.6 + jahr * 0.3)));
      for (let i = 0; i < n; i++) { const px = e.x + 0.2 + ((i * 7.3) % Math.max(0.1, e.w - 0.4)), py = e.y + 0.2 + ((i * 3.7) % Math.max(0.1, e.h - 0.4)); fl.push(`<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${(0.12 + jahr * 0.03).toFixed(2)}" fill="${['#fff3b0', '#ff9ec2', '#c7a3ff', '#ffb36b'][(i + s) % 4]}" opacity="0.9"/>`); }
    }
    if (e.n && e.w * e.h > fs * fs * 8 && !mini) fl.push(`<text x="${e.x + e.w / 2}" y="${e.y + e.h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="${fs * 1.4}" fill="#111" font-family="Jost" opacity="0.85" transform="${schraeg ? `translate(0 ${e.y + e.h / 2}) scale(1 ${1 / sy}) translate(0 ${-(e.y + e.h / 2)})` : ''}">${esc(e.n)}</text>`);
  });
  const radius = (b) => b.r + (b.rMax - b.r) * Math.min(1, jahr / b.jahre);
  const baumSvg = baeume.sort((a, b) => a.y - b.y).map((b) => {
    const r = radius(b), krone = farbe(b.k), kahl = s === 3;
    if (!schraeg) return `<circle cx="${b.x}" cy="${b.y}" r="${r}" fill="${krone}" opacity="${kahl ? 0.45 : 0.9}" stroke="#1d3a12" stroke-width="0.06"/>`;
    const gx = b.x, gy = b.y * sy, hoehe = r * 1.5 + 0.4;
    return `<ellipse cx="${gx + r * 0.4}" cy="${gy + 0.1}" rx="${r}" ry="${r * 0.35}" fill="#000" opacity="0.22"/>
      <line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy - hoehe}" stroke="#5a3f2a" stroke-width="${0.12 + r * 0.05}"/>
      <circle cx="${gx}" cy="${gy - hoehe}" r="${r}" fill="${krone}" opacity="${kahl ? 0.35 : 0.95}" stroke="#1d3a12" stroke-width="0.05"/>
      ${s === 1 && b.k === 'obstbaum' && jahr >= 3 ? [0, 1, 2, 3, 4].map((i) => `<circle cx="${gx + Math.cos(i * 1.3) * r * 0.6}" cy="${gy - hoehe + Math.sin(i * 1.3) * r * 0.6}" r="0.13" fill="#d33"/>`).join('') : ''}`;
  }).join('');
  const oben = schraeg ? 5 : 2;
  return `<svg viewBox="-0.3 ${-oben} ${L + 0.6} ${T * sy + oben + 0.5}" width="100%" role="img" aria-label="Garten ${esc(v.name)}">
    <rect x="-0.3" y="${-2 * sy}" width="${L + 0.6}" height="${2 * sy}" fill="#2b2b2b"/>${mini ? '' : `<text x="${L / 2}" y="${-0.9 * sy}" text-anchor="middle" dominant-baseline="middle" font-size="${fs * 1.4}" fill="#aaa" font-family="Jost">Haus</text>`}
    <g transform="scale(1 ${sy})"><rect x="0" y="0" width="${L}" height="${T}" fill="${s === 3 ? '#8a9a7a' : '#3d5a2e'}"/>${fl.join('')}</g>
    ${baumSvg}</svg>`;
}

route('garten', () => {
  const liste = gartenListe(); if (G.v >= liste.length) G.v = 0;
  const v = liste[G.v], w = G.wunsch;
  const chip = (k, val, txt) => `<button class="chip ${w[k] === val ? 'an' : ''}" data-akt="gWunsch" data-k="${k}" data-v="${val}">${txt}</button>`;
  return kopf('Gartenplaner 4D', `Garten ${zahl(G.L)} × ${zahl(G.T)} m · ${liste.length} Vorschläge`, '#/projekte?tab=garten') + `<div class="inhalt">
    <div class="raster2"><label class="feld">Länge am Haus (m)<input inputmode="decimal" value="${zahl(G.L)}" data-ein="gMass" data-k="L"></label><label class="feld">Tiefe (m)<input inputmode="decimal" value="${zahl(G.T)}" data-ein="gMass" data-k="T"></label></div>
    <div class="klein">Terrasse aus …</div><div class="chips">${Object.entries(BELAEGE).map(([k, b]) => chip('belag', k, b.n)).join('')}</div>
    <div class="chips">${chip('kinder', true, 'Kinder')}${chip('teich', true, 'Mit Teich')}${chip('teich', false, 'Ohne Teich')}${chip('rasen', false, 'Ohne Rasen')}${chip('pflege', 'gering', 'Pflegeleicht')}${chip('licht', true, 'Gartenlicht')}${chip('terrasse', 'groesser', 'Terrasse größer')}</div>
    <a class="btn voll" href="#/assistent">${ICON.mikro} Mit dem Assistenten planen (sprechen oder schreiben)</a>
    <div class="zeile vorschlag-kopf"><button class="rund" aria-label="Vorheriger Vorschlag" data-akt="gV" data-r="-1">‹</button>
      <div style="flex:1;text-align:center"><div class="klein">Vorschlag ${G.v + 1} von ${liste.length} · Pflege ${v.pflege} · ca. ${euro(v.summe)}</div><b class="gross-titel">${esc(v.name)}</b><div class="klein">Terrasse: ${esc(BELAEGE[v.belag].n)}</div></div>
      <button class="rund" aria-label="Nächster Vorschlag" data-akt="gV" data-r="1">›</button></div>
    <div class="garten-buehne">${gartenSVG(v)}</div>
    <button class="btn hell voll" data-akt="g4D">▶ 4D-Bauablauf & Wachstum (Video)</button>
    <div class="segment">${JAHRE.map((j, i) => `<button class="${i === G.j ? 'an' : ''}" data-akt="gJ" data-j="${i}">${j === 0 ? 'Jetzt' : j + (j === 1 ? ' Jahr' : ' Jahre')}</button>`).join('')}</div>
    <div class="segment">${SAISON.map((n, i) => `<button class="${i === G.s ? 'an' : ''}" data-akt="gS" data-s="${i}">${n}</button>`).join('')}</div>
    <div class="zeile"><button class="btn" data-akt="gPlay">${G.timer ? 'Stopp' : '▶ Wachstum (2D)'}</button><button class="btn" data-akt="gAnsicht">${G.schraeg ? 'Draufsicht' : 'Schrägansicht'}</button></div>
    <p class="klein">${esc(v.text)}</p>
    <h3>Kosten (Richtwerte)</h3>
    <div class="karte">${v.kosten.map((k) => `<div class="kat-zeile zeile"><span style="flex:1">${esc(k[0])}</span><b>${euro(k[1])}</b></div>`).join('')}
      <div class="kat-zeile zeile"><b style="flex:1">Summe ca.</b><b>${euro(v.summe)}</b></div></div>
    <div class="zeile"><button class="btn hell" data-akt="gProjekt">Diesen Vorschlag übernehmen</button></div>
    <h3>Alle Vorschläge</h3>
    <div class="garten-liste">${liste.map((x, i) => `<button class="garten-karte ${i === G.v ? 'an' : ''}" data-akt="gWahl" data-i="${i}">${gartenSVG(x, true)}<b>${esc(x.name)}</b><span class="klein">${esc(BELAEGE[x.belag].n)} · ${euro(x.summe)}</span></button>`).join('')}</div>
    <h3>Tipps</h3>
    ${GARTEN_TIPPS.map(([t, x]) => `<div class="hinweis klein"><b>${esc(t)}:</b> ${esc(x)}</div>`).join('')}
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
      ${teilFuerName(e.n) ? `<button class="chip" data-akt="teil3D" data-t="${teilFuerName(e.n)}" data-dn="${(e.n.match(/DN (\d+)/) || [])[1] || ''}">3D</button>` : ''}
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
  ausgeben('joum4d-ausgaben.csv', '\ufeff' + csv, 'text/csv');
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
    ${FQ.foto ? `<img class="skizze" src="${FQ.foto}" alt="Beleg">` : ''}
    ${dateiKnopf('Beleg fotografieren oder auswählen', 'fqFotoDatei', {}, { icon: ICON.kamera, klasse: 'voll' })}
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
