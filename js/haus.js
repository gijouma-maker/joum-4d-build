/* Joum 4D Build – Haus außen planen (3D): Dachform, Neigung, Dachüberstand, Dach abnehmen/erneuern, Dachausbau, Gauben,
   Dachfenster, Solar, Aufstockung – Carport, Garage, Vordach, Terrassendach, Wintergarten, Balkon, Anbau, Gartenhaus, Zaun.
   Jede Änderung: sofort im 3D, Richtkosten, Hinweise und direkter Bauamt-Check. Ohne Server, kostenlos. */

const HAUS_STANDARD = { B: 10, T: 9, geschosse: 2, gh: 2.8, fassade: '#ece6dc', dach: 'sattel', neigung: 38, uT: 50, uG: 30, dachfarbe: '#3b3d40',
  ohneDach: false, ausbau: false, gauben: 0, gaubeTyp: 'schlepp', dachfenster: 0, pv: false,
  carport: { an: false, seite: 'rechts', plaetze: 1, tiefe: 5.5, dach: 'flach' }, garage: { an: false, seite: 'links', plaetze: 1 },
  vordach: { an: false, breite: 2, tiefe: 1.2, art: 'glas' }, terrasse: { an: false, breite: 4, tiefe: 3, art: 'glas' },
  wintergarten: { an: false, breite: 3.5, tiefe: 3 }, balkon: { an: false, breite: 3 }, anbau: { an: false, seite: 'links', breite: 4, tiefe: 5 },
  gartenhaus: { an: false }, zaun: { an: false, art: 'sichtschutz' } };
function haus() { S.haus = Object.assign(JSON.parse(JSON.stringify(HAUS_STANDARD)), S.haus || {}); return S.haus; }
const DACHFORMEN = [['sattel', 'Satteldach'], ['walm', 'Walmdach'], ['zelt', 'Zeltdach'], ['pult', 'Pultdach'], ['flach', 'Flachdach']];
const FASSADEN = [['Weiß', '#f2efe9'], ['Sand', '#e3d6bf'], ['Grau', '#b9b8b3'], ['Anthrazit', '#4a4c4f'], ['Klinker rot', '#9c4a36'], ['Holz', '#a8774f'], ['Salbei', '#a9b9a2']];
const DACHFARBEN = [['Anthrazit', '#3b3d40'], ['Ziegelrot', '#9e4632'], ['Braun', '#5c3e2e'], ['Grau', '#7d7f82'], ['Schwarz', '#1f1f21'], ['Gründach', '#5d7a45']];
const SEITEN = [['links', 'links'], ['rechts', 'rechts']];

/* Kosten & Hinweise je Baustein */
function hausBausteine(h) {
  const out = [], dachFl = (h.B + 2 * h.uG / 100) * (h.T + 2 * h.uT / 100) / (h.dach === 'flach' ? 1 : Math.cos(h.neigung * Math.PI / 180));
  const add = (t, min, max, bauamt, hint) => out.push({ t, min: Math.round(min / 100) * 100, max: Math.round(max / 100) * 100, bauamt, hint });
  if (h.ohneDach) add('Dach abnehmen & neu eindecken (' + zahl(dachFl, 0) + ' m²)', dachFl * 180, dachFl * 350, 'abriss', 'Gerüst, Entsorgung, Dämmung nach GEG. Dachform/Höhe ändern = genehmigungspflichtig.');
  if (h.uT > 60 || h.uG > 50) add('Dachüberstand vergrößern', h.B * 2 * 80, h.B * 2 * 180, null, 'Sparren verlängern (Aufschiebling/Anlaschen) – Statik prüfen. Abstandsfläche zum Nachbarn kann sich ändern.');
  if (h.ausbau) add('Dachgeschoss zu Wohnraum ausbauen', h.B * h.T * 0.6 * 800, h.B * h.T * 0.6 * 1800, 'dachausbau', 'Dämmung, Treppe, Rettungsweg (2. Fluchtweg/Fenster), Raumhöhe.');
  if (h.gauben) add(h.gauben + '× ' + (h.gaubeTyp === 'schlepp' ? 'Schleppgaube' : 'Giebelgaube'), h.gauben * (h.gaubeTyp === 'schlepp' ? 12000 : 18000), h.gauben * (h.gaubeTyp === 'schlepp' ? 28000 : 40000), 'gaube', 'Mehr Kopfhöhe und Licht im Dach. Meist genehmigungspflichtig.');
  if (h.dachfenster) add(h.dachfenster + '× Dachfenster', h.dachfenster * 1500, h.dachfenster * 4000, 'dachfenster', '');
  if (h.pv) { const kwp = Math.max(3, Math.round(dachFl / 2 * 0.6 * 0.2)); add('Solaranlage ca. ' + kwp + ' kWp', kwp * 1300, kwp * 1800, 'solar', 'Anmeldung beim Netzbetreiber und im Marktstammdatenregister.'); }
  if (h.geschosse > 2 || h.aufstock) {}
  const c = h.carport; if (c.an) add((c.plaetze > 1 ? 'Doppel' : 'Einzel') + '-Carport ' + (c.dach === 'pult' ? 'Pultdach' : 'Flachdach'), c.plaetze > 1 ? 4500 : 2500, c.plaetze > 1 ? 14000 : 8000, 'carport', 'An der Grenze meist nur bis ca. 9 m Länge und 3 m mittlere Wandhöhe – sonst Abstand halten. Fundamente frostfrei (80 cm).');
  const g = h.garage; if (g.an) add((g.plaetze > 1 ? 'Doppel' : 'Einzel') + '-Garage', 9000 * g.plaetze, 20000 * g.plaetze, 'carport', 'Fertiggarage oder gemauert; Stellplatzsatzung der Gemeinde beachten.');
  const v = h.vordach; if (v.an) add('Vordach über der Haustür (' + (v.art === 'glas' ? 'Glas' : 'Holz') + ')', 400, 3000, 'ueberdachung', 'An tragendem Mauerwerk befestigen; Glas nur VSG.');
  const te = h.terrasse; if (te.an) add('Terrassendach ' + zahl(te.breite) + ' × ' + zahl(te.tiefe) + ' m', te.breite * te.tiefe * 250, te.breite * te.tiefe * 600, 'ueberdachung', 'Schneelast der Region beachten (Statik). Glas: VSG.');
  const w = h.wintergarten; if (w.an) add('Wintergarten ' + zahl(w.breite * w.tiefe, 1) + ' m²', w.breite * w.tiefe * 1500, w.breite * w.tiefe * 3500, 'ueberdachung', 'Beheizt = Wohnraum (GEG, Genehmigung). Unbeheizt = Kaltwintergarten.');
  const b = h.balkon; if (b.an) add('Balkon (vorgestellt)', 8000, 25000, 'anbau', 'Vorgestellt auf Stützen – keine Wärmebrücke. Geländer mind. 90–110 cm (je nach Höhe).');
  const a = h.anbau; if (a.an) add('Anbau ' + zahl(a.breite * a.tiefe, 1) + ' m²', a.breite * a.tiefe * 2200, a.breite * a.tiefe * 3800, 'anbau', 'Genehmigungspflichtig, Architekt/Entwurfsverfasser nötig.');
  if (h.geschosse >= 3) add('Aufstockung (weiteres Geschoss)', h.B * h.T * 2000, h.B * h.T * 3500, 'anbau', 'Statik von Wänden und Fundament prüfen; Holzbau ist leicht.');
  if (h.gartenhaus.an) add('Gartenhaus', 1500, 8000, 'gartenhaus', '');
  if (h.zaun.an) add(h.zaun.art === 'mauer' ? 'Gartenmauer' : h.zaun.art === 'sichtschutz' ? 'Sichtschutzzaun' : 'Zaun', 40 * 60, 40 * 250, 'zaun', 'Höhe nach Landesrecht/Nachbarrecht (oft bis ca. 1,8–2 m frei).');
  return out;
}
function hausWarnungen(h) {
  const w = [];
  if (h.gauben && h.neigung < 30) w.push('Gauben brauchen meist mind. ca. 30–35° Dachneigung, sonst reicht die Höhe nicht.');
  if (h.gauben && ['flach', 'pult'].includes(h.dach)) w.push('Gauben gibt es nur bei geneigten Dächern (Sattel-, Walmdach).');
  if (h.dach === 'pult' && h.neigung > 25) w.push('Pultdach über ca. 25° wirkt sehr hoch – üblich sind 5–20°.');
  if (h.dach === 'flach' && h.dachfarbe !== '#5d7a45') w.push('Flachdach: Gründach hält Regen zurück und schützt die Abdichtung – oft gefördert.');
  if (h.uT > 100) w.push('Dachüberstand über 1 m braucht meist eine Abstützung oder Statik-Nachweis.');
  if (h.carport.an && h.carport.tiefe > 9) w.push('Carport über 9 m Länge an der Grenze ist in den meisten Ländern nicht erlaubt.');
  if (h.ausbau && h.dach === 'flach') w.push('Flachdach: Ausbau nur als Aufstockung möglich.');
  if (h.ausbau && h.neigung < 35 && h.dach !== 'flach' && !h.gauben) w.push('Flaches Dach + Ausbau: wenig Stehhöhe – Gauben oder Kniestock einplanen.');
  return w;
}

route('haus', () => {
  const h = haus(), bs = hausBausteine(h), warn = hausWarnungen(h);
  const sum = bs.reduce((a, x) => [a[0] + x.min, a[1] + x.max], [0, 0]);
  const chip = (k, v, t, an) => `<button class="chip ${an ? 'an' : ''}" data-akt="hausSetz" data-k="${k}" data-v="${v}">${t}</button>`;
  const regler = (k, t, min, max, st, einheit, wert) => `<label class="feld">${t}: <b>${zahl(wert)}${einheit}</b><input type="range" min="${min}" max="${max}" step="${st}" value="${wert}" data-ein="hausZahl" data-sofort="1" data-k="${k}"></label>`;
  const farben = (k, liste, akt) => `<div class="farb-reihe">${liste.map(([n, f]) => `<button class="farb-punkt ${akt === f ? 'an' : ''}" style="background:${f}" title="${n}" aria-label="${n}" data-akt="hausSetz" data-k="${k}" data-v="${f}"></button>`).join('')}</div>`;
  const baustein = (k, t, inhalt) => `<div class="haus-baustein ${h[k].an ? 'an' : ''}"><button class="haus-schalter" data-akt="hausAn" data-k="${k}"><span>${t}</span><i>${h[k].an ? 'an' : 'aus'}</i></button>${h[k].an ? `<div class="haus-opt">${inhalt}</div>` : ''}</div>`;
  nachRender(() => lade3D().then(() => hausZeigen(document.getElementById('haus3d'), h)).catch(() => {}));
  return kopf('Haus außen planen', 'Dach, Carport, Anbau & mehr – sofort in 3D', '#/projekte?tab=aussen') + `<div class="inhalt haus">
    <div class="studio-3d" id="haus3d"></div>
    <p class="klein grau">Wischen zum Drehen, zwei Finger zum Zoomen. Richtwerte – vor dem Bauen Bauamt & Fachleute fragen.</p>
    ${warn.length ? `<div class="hinweis klein">${warn.map((x) => '⚠ ' + esc(x)).join('<br>')}</div>` : ''}
    <section class="karte"><h3>🏠 Haus</h3>
      ${regler('B', 'Breite', 5, 20, 0.5, ' m', h.B)}${regler('T', 'Tiefe', 5, 16, 0.5, ' m', h.T)}
      <div class="zeile wrap">${[1, 2, 3].map((n) => chip('geschosse', n, n + ' Geschoss' + (n > 1 ? 'e' : '') + (n === 3 ? ' (Aufstockung)' : ''), h.geschosse === n)).join('')}</div>
      <div class="unter">Fassade</div>${farben('fassade', FASSADEN, h.fassade)}</section>
    <section class="karte"><h3>🔺 Dach</h3>
      <div class="zeile wrap">${DACHFORMEN.map(([k, t]) => chip('dach', k, t, h.dach === k)).join('')}</div>
      ${h.dach !== 'flach' ? regler('neigung', 'Dachneigung', 5, 55, 1, '°', h.neigung) : ''}
      ${regler('uT', 'Dachüberstand Traufe (vorne/hinten)', 0, 150, 5, ' cm', h.uT)}${regler('uG', 'Dachüberstand Giebel (Seiten)', 0, 120, 5, ' cm', h.uG)}
      <div class="unter">Dachfarbe</div>${farben('dachfarbe', DACHFARBEN, h.dachfarbe)}
      <div class="zeile wrap">${chip('ohneDach', h.ohneDach ? 0 : 1, h.ohneDach ? '✓ Dach abgenommen (Neubau Dach)' : 'Dach abnehmen / erneuern', h.ohneDach)}${chip('ausbau', h.ausbau ? 0 : 1, h.ausbau ? '✓ Dachgeschoss ausbauen' : 'Dachgeschoss ausbauen', h.ausbau)}${chip('pv', h.pv ? 0 : 1, h.pv ? '✓ Solaranlage' : 'Solaranlage', h.pv)}</div>
      ${['sattel', 'walm'].includes(h.dach) ? `<div class="unter">Gauben</div><div class="zeile wrap">${[0, 1, 2, 3].map((n) => chip('gauben', n, n ? n + '×' : 'keine', h.gauben === n)).join('')}${h.gauben ? chip('gaubeTyp', 'schlepp', 'Schleppgaube', h.gaubeTyp === 'schlepp') + chip('gaubeTyp', 'giebel', 'Giebelgaube', h.gaubeTyp === 'giebel') : ''}</div>` : ''}
      ${h.dach !== 'flach' ? `<div class="unter">Dachfenster</div><div class="zeile wrap">${[0, 1, 2, 3, 4].map((n) => chip('dachfenster', n, n ? n + '×' : 'keine', h.dachfenster === n)).join('')}</div>` : ''}
    </section>
    <section class="karte"><h3>🚗 Anbauten & außen</h3>
      ${baustein('carport', 'Carport', `<div class="zeile wrap">${SEITEN.map(([k, t]) => chip('carport.seite', k, t, h.carport.seite === k)).join('')}${chip('carport.plaetze', 1, 'Einzel', h.carport.plaetze === 1)}${chip('carport.plaetze', 2, 'Doppel', h.carport.plaetze === 2)}${chip('carport.dach', 'flach', 'Flachdach', h.carport.dach === 'flach')}${chip('carport.dach', 'pult', 'Pultdach', h.carport.dach === 'pult')}</div>${regler('carport.tiefe', 'Länge', 5, 10, 0.5, ' m', h.carport.tiefe)}`)}
      ${baustein('garage', 'Garage', `<div class="zeile wrap">${SEITEN.map(([k, t]) => chip('garage.seite', k, t, h.garage.seite === k)).join('')}${chip('garage.plaetze', 1, 'Einzel', h.garage.plaetze === 1)}${chip('garage.plaetze', 2, 'Doppel', h.garage.plaetze === 2)}</div>`)}
      ${baustein('vordach', 'Vordach über der Haustür', `<div class="zeile wrap">${chip('vordach.art', 'glas', 'Glas', h.vordach.art === 'glas')}${chip('vordach.art', 'holz', 'Holz/Ziegel', h.vordach.art === 'holz')}</div>${regler('vordach.breite', 'Breite', 1.2, 4, 0.1, ' m', h.vordach.breite)}${regler('vordach.tiefe', 'Tiefe', 0.8, 2.5, 0.1, ' m', h.vordach.tiefe)}`)}
      ${baustein('terrasse', 'Terrassenüberdachung (hinten)', `<div class="zeile wrap">${chip('terrasse.art', 'glas', 'Glas', h.terrasse.art === 'glas')}${chip('terrasse.art', 'lamellen', 'Lamellendach', h.terrasse.art === 'lamellen')}</div>${regler('terrasse.breite', 'Breite', 2, 8, 0.5, ' m', h.terrasse.breite)}${regler('terrasse.tiefe', 'Tiefe', 2, 5, 0.5, ' m', h.terrasse.tiefe)}`)}
      ${baustein('wintergarten', 'Wintergarten', `${regler('wintergarten.breite', 'Breite', 2, 6, 0.5, ' m', h.wintergarten.breite)}${regler('wintergarten.tiefe', 'Tiefe', 2, 5, 0.5, ' m', h.wintergarten.tiefe)}`)}
      ${baustein('balkon', 'Balkon (hinten, oben)', regler('balkon.breite', 'Breite', 1.5, 6, 0.5, ' m', h.balkon.breite))}
      ${baustein('anbau', 'Anbau', `<div class="zeile wrap">${SEITEN.map(([k, t]) => chip('anbau.seite', k, t, h.anbau.seite === k)).join('')}</div>${regler('anbau.breite', 'Breite', 2, 8, 0.5, ' m', h.anbau.breite)}${regler('anbau.tiefe', 'Tiefe', 2, 10, 0.5, ' m', h.anbau.tiefe)}`)}
      ${baustein('gartenhaus', 'Gartenhaus', '<p class="klein">Hinten im Garten.</p>')}
      ${baustein('zaun', 'Zaun / Mauer ums Grundstück', `<div class="zeile wrap">${chip('zaun.art', 'sichtschutz', 'Sichtschutz', h.zaun.art === 'sichtschutz')}${chip('zaun.art', 'zaun', 'Stabmatten', h.zaun.art === 'zaun')}${chip('zaun.art', 'mauer', 'Mauer', h.zaun.art === 'mauer')}</div>`)}
    </section>
    <section class="karte"><h3>💶 Kosten & Bauamt</h3>
      ${bs.length ? bs.map((x) => `<div class="haus-posten"><div class="zeile"><span style="flex:1">${esc(x.t)}</span><b>${euro(x.min)} – ${euro(x.max)}</b></div>${x.hint ? `<span class="klein grau">${esc(x.hint)}</span>` : ''}${x.bauamt ? `<a class="klein" href="#/bauamt?v=${x.bauamt}">Brauche ich eine Genehmigung? →</a>` : ''}</div>`).join('')
        + `<div class="zeile haus-summe"><span style="flex:1">Zusammen ca.</span><b>${euro(sum[0])} – ${euro(sum[1])}</b></div>` : '<p class="klein">Schalte oben ein, was du ändern willst – Kosten und Bauamt-Hinweise erscheinen hier.</p>'}
      <div class="zeile wrap" style="margin-top:10px"><a class="btn hell" href="#/frage-neu?fach=architekt">💬 Architekt fragen</a><a class="btn hell" href="#/bauamt">Bauamt-Check</a><button class="btn hell" data-akt="hausZurueck">Neu anfangen</button></div>
    </section>
  </div>`;
});
const hausPfad = (k, v) => { const h = haus(); const t = k.split('.'); if (t.length === 2) h[t[0]][t[1]] = v; else h[k] = v; };
AKT.hausSetz = (d) => aendern(() => { const v = /^-?\d+(\.\d+)?$/.test(d.v) ? Number(d.v) : d.v; hausPfad(d.k, ['ohneDach', 'ausbau', 'pv'].includes(d.k) ? !!Number(d.v) : v); }, 'Haus geändert');
AKT.hausAn = (d) => aendern(() => { const h = haus(); h[d.k].an = !h[d.k].an; }, 'Haus geändert');
AKT.hausZurueck = () => frage('Alles am Haus zurücksetzen?', () => aendern(() => { delete S.haus; }, 'Haus zurückgesetzt'));
let HAUS_T = null;
EIN.hausZahl = (v, d) => { clearTimeout(HAUS_T); HAUS_T = setTimeout(() => aendern(() => hausPfad(d.k, Number(v)), 'Haus geändert'), 150); };
HILFE.hausAn = 'Baustein ein- oder ausschalten – erscheint sofort im 3D mit Kosten und Bauamt-Hinweis.';

/* ---------- 3D ---------- */
let HAUS_KAMERA = null;
function hausZeigen(box, h) {
  if (!box || !window.THREE) return;
  const T = window.THREE, W = box.clientWidth || 360, Hh = box.clientHeight || 320;
  const r = new T.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(W, Hh); r.outputEncoding = T.sRGBEncoding; r.shadowMap.enabled = true; r.toneMapping = T.ACESFilmicToneMapping;
  box.innerHTML = ''; box.appendChild(r.domElement);
  const sc = new T.Scene(); sc.background = new T.Color('#bcd7ea'); sc.fog = new T.Fog('#bcd7ea', 40, 90);
  const cam = new T.PerspectiveCamera(45, W / Hh, 0.1, 300);
  sc.add(new T.HemisphereLight(0xffffff, 0x6b7d5a, 0.75)); const sun = new T.DirectionalLight(0xffffff, 0.9); sun.position.set(12, 20, 14); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); sc.add(sun);
  const M = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: new T.Color(c), roughness: 0.8 }, o || {}));
  const glas = M('#bfe3f5', { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1, side: T.DoubleSide });
  const box3 = (w, hh, d, m, x, y, z) => { const me = new T.Mesh(new T.BoxGeometry(w, hh, d), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; sc.add(me); return me; };
  const H = h.geschosse * h.gh, B = h.B, D = h.T, tan = Math.tan(h.neigung * Math.PI / 180), oT = h.uT / 100, oG = h.uG / 100;
  // Boden, Einfahrt
  const gras = new T.Mesh(new T.PlaneGeometry(80, 80), M('#7da35a')); gras.rotation.x = -Math.PI / 2; gras.receiveShadow = true; sc.add(gras);
  box3(B + 8, 0.02, 1.6, M('#cfc9bd'), 0, 0.01, D / 2 + 5);
  // Haus
  const fas = M(h.fassade);
  box3(B, H, D, fas, 0, H / 2, 0);
  for (let gsch = 0; gsch < h.geschosse; gsch++) {
    const y = gsch * h.gh + 1.5, n = Math.max(2, Math.floor(B / 2.4));
    for (let i = 0; i < n; i++) { const x = -B / 2 + (i + 0.5) * B / n; if (gsch === 0 && Math.abs(x) < 0.9) continue; [D / 2 + 0.01, -D / 2 - 0.01].forEach((z) => { box3(1.2, 1.3, 0.04, M('#ffffff'), x, y, z); box3(1.05, 1.15, 0.05, M('#2c3e50', { roughness: 0.15, metalness: 0.3 }), x, y, z); }); }
    [B / 2 + 0.01, -B / 2 - 0.01].forEach((x) => { box3(0.04, 1.3, 1.2, M('#ffffff'), x, y, 0); box3(0.05, 1.15, 1.05, M('#2c3e50', { roughness: 0.15 }), x, y, 0); });
  }
  box3(1.1, 2.2, 0.08, M('#5a3d2b'), 0, 1.1, D / 2 + 0.02);
  // Dach
  const dm = M(h.dachfarbe, { roughness: 0.7, side: T.DoubleSide }), rhI = (D / 2) * tan;
  let firstH = H;
  const dachGeo = (pts, tris) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(tris.flatMap((i) => pts[i]), 3)); g.computeVertexNormals(); const me = new T.Mesh(g, dm); me.castShadow = true; sc.add(me); return me; };
  const giebel = (pts) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts.flat(), 3)); g.computeVertexNormals(); const me = new T.Mesh(g, M(h.fassade, { side: T.DoubleSide })); sc.add(me); };
  if (h.ohneDach) {
    // Dach abgenommen: offene Balkenlage + Gerüst
    for (let x = -B / 2 + 0.3; x <= B / 2; x += 0.8) box3(0.08, 0.2, D, M('#b48a5a'), x, H + 0.1, 0);
    const gm = M('#9aa0a6', { metalness: 0.6, roughness: 0.4 });
    [-1, 1].forEach((s) => { for (let x = -B / 2 - 0.8; x <= B / 2 + 0.8; x += 2.5) box3(0.05, H + 1.5, 0.05, gm, x, (H + 1.5) / 2, s * (D / 2 + 0.9)); for (let y = 2; y < H + 1.5; y += 2) box3(B + 1.6, 0.05, 0.05, gm, 0, y, s * (D / 2 + 0.9)); for (let y = 2; y < H + 1.5; y += 2) box3(B + 1.6, 0.03, 0.7, M('#c8a36a'), 0, y, s * (D / 2 + 0.6)); });
  } else if (h.dach === 'flach') {
    box3(B + 2 * oG, 0.3, D + 2 * oT, M('#d9d6cf'), 0, H + 0.15, 0); box3(B + 2 * oG - 0.1, 0.06, D + 2 * oT - 0.1, dm, 0, H + 0.33, 0); firstH = H + 0.4;
  } else if (h.dach === 'pult') {
    const ht = (D + 2 * oT) * tan, x1 = -B / 2 - oG, x2 = B / 2 + oG, zf = D / 2 + oT, zb = -D / 2 - oT, d = 0.25;
    const p = [[x1, H, zf], [x2, H, zf], [x2, H + ht, zb], [x1, H + ht, zb], [x1, H + d, zf], [x2, H + d, zf], [x2, H + ht + d, zb], [x1, H + ht + d, zb]];
    dachGeo(p, [4, 5, 6, 4, 6, 7, 0, 2, 1, 0, 3, 2, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5]);
    const hInD = (D + oT) * tan; giebel([[-B / 2, H, D / 2], [-B / 2, H, -D / 2], [-B / 2, H + hInD, -D / 2], [B / 2, H, D / 2], [B / 2, H + hInD, -D / 2], [B / 2, H, -D / 2]]);
    box3(B, hInD, 0.02, fas, 0, H + hInD / 2, -D / 2 + 0.01); firstH = H + ht;
  } else {
    const rh = (D / 2 + oT) * tan, zf = D / 2 + oT, ex = B / 2 + oG;
    const r0 = h.dach === 'sattel' ? ex : h.dach === 'walm' ? Math.max(0, B / 2 - D / 2) : 0;
    const p = [[-ex, H - oT * tan, zf], [ex, H - oT * tan, zf], [ex, H - oT * tan, -zf], [-ex, H - oT * tan, -zf], [-r0, H + rhI, 0], [r0, H + rhI, 0]];
    dachGeo(p, [0, 1, 5, 0, 5, 4, 2, 3, 4, 2, 4, 5, 1, 2, 5, 3, 0, 4]);
    if (h.dach === 'sattel') giebel([[-B / 2, H, D / 2], [-B / 2, H, -D / 2], [-B / 2, H + rhI, 0], [B / 2, H, -D / 2], [B / 2, H, D / 2], [B / 2, H + rhI, 0]]);
    firstH = H + rhI;
    // Gauben auf der Vorderseite
    for (let i = 0; i < h.gauben; i++) {
      const gx = -B / 2 + (i + 0.5) * B / Math.max(h.gauben, 1) * (h.pv ? 0.5 : 1) + (h.pv ? 0 : 0), zv = D / 2 - 1.3, yb = H + 1.3 * tan, gw = 1.8, gh2 = 1.5, tief = Math.min(2.6, zv);
      box3(gw, gh2, tief, fas, gx, yb + gh2 / 2, zv - tief / 2);
      box3(1.2, 1.0, 0.05, M('#2c3e50', { roughness: 0.15 }), gx, yb + gh2 / 2, zv + 0.01);
      if (h.gaubeTyp === 'schlepp') { const s = box3(gw + 0.3, 0.12, tief + 0.4, dm, gx, yb + gh2 + 0.12, zv - tief / 2 + 0.1); s.rotation.x = 0.12; }
      else { const sh = new T.Shape(); sh.moveTo(-gw / 2 - 0.15, 0); sh.lineTo(0, 0.75); sh.lineTo(gw / 2 + 0.15, 0); const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: tief + 0.3, bevelEnabled: false }), dm); m.position.set(gx, yb + gh2, zv - tief); sc.add(m); }
    }
    // Dachfenster + Solar auf der Vorderseite
    const neig = Math.atan(tan), aufDach = (x, s, w, l, m) => { const me = new T.Mesh(new T.BoxGeometry(w, 0.05, l), m); me.position.set(x, H + (D / 2 - s) * tan + 0.08, s); me.rotation.x = neig; sc.add(me); };
    for (let i = 0; i < h.dachfenster; i++) aufDach(B / 2 - 1 - i * 1.4, D / 4, 0.8, 1.2, M('#2c3e50', { roughness: 0.1, metalness: 0.4 }));
    if (h.pv) { const n = Math.max(2, Math.floor(B * 0.45 / 1.1)); for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) aufDach(h.gauben ? B / 2 - 0.8 - i * 1.1 : -B / 2 + 0.9 + i * 1.1 * (B / (B * 0.45)) * 0.45, D / 2 - 1.2 - k * 1.8, 1.0, 1.7, M('#1b2a4a', { roughness: 0.2, metalness: 0.5 })); }
  }
  // Carport
  const seiteX = (seite, breite) => (seite === 'rechts' ? 1 : -1) * (B / 2 + 0.4 + breite / 2);
  const pfosten = M('#4a4c4f', { metalness: 0.5, roughness: 0.4 });
  if (h.carport.an) {
    const cw = 3.1 * h.carport.plaetze, cl = h.carport.tiefe, x = seiteX(h.carport.seite, cw), z = D / 2 + 1 - cl / 2;
    [-1, 1].forEach((sx) => [-cl / 2 + 0.2, 0, cl / 2 - 0.2].forEach((dz) => box3(0.12, 2.4, 0.12, pfosten, x + sx * (cw / 2 - 0.1), 1.2, z + dz)));
    const dach = box3(cw + 0.3, 0.16, cl + 0.3, M(h.carport.dach === 'pult' ? h.dachfarbe : '#5b5e62'), x, 2.48, z); if (h.carport.dach === 'pult') { dach.rotation.z = (h.carport.seite === 'rechts' ? -1 : 1) * 0.09; dach.position.y = 2.6; }
    for (let i = 0; i < h.carport.plaetze; i++) { const ax = x - cw / 2 + 1.55 + i * 3.1; box3(1.8, 0.8, 4.3, M(i ? '#8b1e1e' : '#2f4f6f', { metalness: 0.5, roughness: 0.3 }), ax, 0.6, z + 0.2); box3(1.6, 0.55, 2.2, M('#1d2833', { roughness: 0.1 }), ax, 1.25, z); }
    box3(cw, 0.02, cl + 2, M('#bdb6aa'), x, 0.015, z + 1);
  }
  if (h.garage.an) { const gw = 3.2 * h.garage.plaetze, x = seiteX(h.garage.seite, gw) + (h.carport.an && h.carport.seite === h.garage.seite ? (h.garage.seite === 'rechts' ? 1 : -1) * (3.1 * h.carport.plaetze + 0.5) : 0); box3(gw, 2.7, 6, M(h.fassade), x, 1.35, D / 2 - 3); box3(gw + 0.3, 0.2, 6.3, M('#5b5e62'), x, 2.8, D / 2 - 3); for (let i = 0; i < h.garage.plaetze; i++) box3(2.5, 2.1, 0.05, M('#d9d9d9', { metalness: 0.3 }), x - gw / 2 + 1.6 + i * 3.2, 1.05, D / 2 + 0.01); }
  if (h.vordach.an) { const v = h.vordach, z = D / 2 + v.tiefe / 2; box3(v.breite, 0.06, v.tiefe, v.art === 'glas' ? glas : M(h.dachfarbe), 0, 2.55, z); [-1, 1].forEach((s) => { const k = box3(0.05, 0.05, v.tiefe * 1.05, pfosten, s * v.breite * 0.42, 2.4, z - 0.02); k.rotation.x = -0.45; }); }
  if (h.terrasse.an) { const t = h.terrasse, x = -B / 2 + t.breite / 2 + 0.3, z = -D / 2 - t.tiefe / 2; box3(t.breite, 0.12, t.tiefe, M('#a8774f'), x, 0.06, z); [-1, 1].forEach((s) => box3(0.12, 2.3, 0.12, M('#f2f2f2'), x + s * (t.breite / 2 - 0.1), 1.15, -D / 2 - t.tiefe + 0.1)); const dd = box3(t.breite + 0.2, 0.08, t.tiefe + 0.2, t.art === 'glas' ? glas : M('#e6e6e6'), x, 2.55, z); dd.rotation.x = -0.08; box3(t.breite + 0.2, 0.15, 0.12, M('#f2f2f2'), x, 2.32, -D / 2 - t.tiefe + 0.1); }
  if (h.wintergarten.an) { const w = h.wintergarten, x = B / 2 - w.breite / 2 - 0.3, z = -D / 2 - w.tiefe / 2; box3(w.breite, 2.5, w.tiefe, glas, x, 1.25, z); box3(w.breite + 0.1, 0.1, w.tiefe + 0.1, M('#f2f2f2'), x, 2.55, z); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box3(0.08, 2.5, 0.08, M('#f2f2f2'), x + a * w.breite / 2, 1.25, z + b * w.tiefe / 2)); }
  if (h.balkon.an && h.geschosse > 1) { const b = h.balkon, y = h.gh; box3(b.breite, 0.15, 1.5, M('#d9d6cf'), 0, y, -D / 2 - 0.75); box3(b.breite, 1.0, 0.03, glas, 0, y + 0.55, -D / 2 - 1.5); [-1, 1].forEach((s) => box3(0.03, 1.0, 1.5, glas, s * b.breite / 2, y + 0.55, -D / 2 - 0.75)); [-1, 1].forEach((s) => box3(0.12, y, 0.12, pfosten, s * (b.breite / 2 - 0.1), y / 2, -D / 2 - 1.4)); }
  if (h.anbau.an) { const a = h.anbau, x = seiteX(a.seite, a.breite) + (h.carport.an && h.carport.seite === a.seite ? (a.seite === 'rechts' ? 1 : -1) * (3.1 * h.carport.plaetze + 0.5) : 0) + (h.garage.an && h.garage.seite === a.seite ? (a.seite === 'rechts' ? 1 : -1) * (3.2 * h.garage.plaetze + 0.5) : 0), z = D / 2 - a.tiefe / 2; box3(a.breite + 0.4, 3.0, a.tiefe, fas, x - (a.seite === 'rechts' ? 0.2 : -0.2), 1.5, z); box3(a.breite + 0.7, 0.25, a.tiefe + 0.3, M('#d9d6cf'), x, 3.1, z); box3(Math.min(2.4, a.breite - 0.6), 1.3, 0.05, M('#2c3e50', { roughness: 0.15 }), x, 1.6, D / 2 + 0.01); }
  if (h.gartenhaus.an) { const x = -B / 2 - 3, z = -D / 2 - 7; box3(2.5, 2.1, 2.2, M('#8a6a4a'), x, 1.05, z); const sh = new T.Shape(); sh.moveTo(-1.45, 0); sh.lineTo(0, 0.8); sh.lineTo(1.45, 0); const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 2.6, bevelEnabled: false }), dm); m.rotation.y = Math.PI / 2; m.position.set(x - 1.3, 2.1, z); sc.add(m); }
  if (h.zaun.an) { const zm = h.zaun.art === 'mauer' ? M('#cfc6b8') : h.zaun.art === 'sichtschutz' ? M('#7a5a3c') : M('#3d4a3e', { metalness: 0.4 }); const hz = h.zaun.art === 'zaun' ? 1.2 : 1.8, PX = B / 2 + 9, PZ1 = D / 2 + 7, PZ2 = -D / 2 - 10; [[0, PZ2, PX * 2, 0.12], [PX, (PZ1 + PZ2) / 2, 0.12, PZ1 - PZ2], [-PX, (PZ1 + PZ2) / 2, 0.12, PZ1 - PZ2]].forEach(([x, z, w, d]) => { const me = box3(w, hz, d, zm, x, hz / 2, z); if (h.zaun.art === 'zaun') { me.material = zm.clone(); me.material.transparent = true; me.material.opacity = 0.55; } }); }
  // Kamera
  const ziel = new T.Vector3(0, H / 2, 0), m = Math.max(B, D, firstH);
  if (HAUS_KAMERA) { cam.position.copy(HAUS_KAMERA); } else cam.position.set(m * 1.3, m * 0.9, m * 1.6);
  const ctl = new T.OrbitControls(cam, r.domElement); ctl.target.copy(ziel); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.48; ctl.minDistance = 6; ctl.maxDistance = 70;
  ctl.addEventListener('change', () => { HAUS_KAMERA = cam.position.clone(); });
  const loop = () => { if (!r.domElement.isConnected) { r.dispose(); return; } ctl.update(); r.render(sc, cam); requestAnimationFrame(loop); };
  loop();
}
