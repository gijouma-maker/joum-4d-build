/* Joum 4D Build – Deko & Wohnlichkeit: Räume wirken warm statt kalt
   Stufen: Schlicht · Dezent · Gemütlich · Viel Deko. Je Raum passende Deko (Teppich, Pflanzen, Bilder, Bodenvase,
   Korb, Lichterkette) + auf den Möbeln Kissen, Decken, Bücher, Vasen, Kerzen, Lampen. Warmes Licht, Vorhänge,
   Abendstimmung. Farben der Textilien passend zum Stil. Deko über ＋ Hinzufügen → „Deko“ auch einzeln. */

const DEKO_SPECS = [
  ['Wandbilder 3er-Set', 'Deko', 150, 3, 50, 'Unterkante ca. 20–25 cm über Sofa/Sideboard, Mitte auf ca. 1,50 m.', 60, 400],
  ['Bild groß', 'Deko', 100, 3, 70, 'Über Bett oder Sofa – etwa 2/3 der Möbelbreite.', 40, 400],
  ['Bilderwand (Galerie)', 'Deko', 180, 3, 90, 'Rahmen in einer Farbe wirken ruhig.', 80, 500],
  ['Pflanze groß', 'Deko', 50, 50, 150, 'Hell, aber nicht in die pralle Sonne (je nach Pflanze).', 30, 250],
  ['Pflanze klein', 'Deko', 35, 35, 60, '', 15, 80],
  ['Bodenvase mit Trockengras', 'Deko', 35, 35, 110, '', 40, 200],
  ['Korb (Decken / Wäsche)', 'Deko', 45, 45, 45, '', 20, 90],
  ['Lichterkette', 'Licht', 200, 2, 5, 'Warmweiß (2.700 K) wirkt gemütlich.', 15, 60],
  ['Teppich', 'Deko', 200, 140, 1, '', 80, 800],
  ['Teppich rund 200', 'Deko', 200, 200, 1, '', 80, 900],
  ['Wanduhr', 'Deko', 40, 5, 40, '', 25, 150],
  ['Makramee / Wandteppich', 'Deko', 80, 3, 100, '', 30, 150],
  ['Vorhänge (Paar)', 'Deko', 140, 10, 240, 'Gardinen vom Boden bis zur Decke lassen den Raum höher wirken.', 40, 300],
  ['Stehleuchte warm', 'Licht', 30, 30, 160, 'Warmweiß 2.700 K – macht abends den größten Unterschied.', 40, 400]
];
DEKO_SPECS.forEach((x) => { const sp = x.slice(0, 6); if (!EXTRA_SPECS[x[0]]) EXTRA_SPECS[x[0]] = sp; MK_ALLE.push({ kat: 'Deko', spec: sp, preis: [x[6], x[7]] }); PREISE.unshift([new RegExp('^' + x[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), x[6], x[7]]); });
MK['Deko'] = DEKO_SPECS;
Object.keys(MK_FUER).forEach((k) => { if (!MK_FUER[k].includes('Deko')) MK_FUER[k].splice(1, 0, 'Deko'); });
const EB_ALT = ebene;
ebene = function (n) { if (/Wandbilder|Bilderwand|Bild groß|Lichterkette|Wanduhr|Makramee|Vorhänge/.test(n)) return 'wand'; return EB_ALT(n); };

/* automatische Deko je Raum und Stufe */
const DEKO_AUTO = {
  wohn: [['Teppich'], ['Pflanze groß', 'Wandbilder 3er-Set', 'Stehleuchte warm'], ['Bodenvase mit Trockengras', 'Korb (Decken / Wäsche)', 'Lichterkette']],
  schlaf: [['Teppich'], ['Bild groß', 'Pflanze groß'], ['Korb (Decken / Wäsche)', 'Lichterkette', 'Stehleuchte warm']],
  kind: [['Teppich rund 200'], ['Wandbilder 3er-Set', 'Korb (Decken / Wäsche)'], ['Lichterkette', 'Pflanze klein']],
  ess: [[], ['Bild groß', 'Pflanze groß'], ['Bodenvase mit Trockengras', 'Teppich']],
  buero: [[], ['Pflanze groß', 'Bild groß'], ['Korb (Decken / Wäsche)', 'Pflanze klein']],
  kueche: [[], ['Pflanze klein'], ['Bild groß']],
  bad: [[], ['Pflanze klein'], ['Korb (Decken / Wäsche)', 'Bild groß']],
  wasch: [[], ['Korb (Decken / Wäsche)'], ['Pflanze klein']],
  fit: [[], ['Pflanze groß'], ['Bild groß']],
  sonst: [[], ['Bild groß', 'Pflanze groß'], ['Teppich', 'Korb (Decken / Wäsche)']]
};
const DEKO_NAMEN = new Set(DEKO_SPECS.map((x) => x[0]));
function dekoStufe(o) { const L = losStatus(o); return L.deko == null ? 2 : L.deko; }
const SL_DEKO_ALT = stilListe;
stilListe = function (o) {
  const l = SL_DEKO_ALT(o), stufe = dekoStufe(o), art = raumArt(o.raum), L = losStatus(o);
  if (!stufe) return l;
  const plan = DEKO_AUTO[art] || DEKO_AUTO.sonst, dazu = plan.slice(0, stufe).flat();
  dazu.forEach((n) => { if (!l.some((k) => k[0] === n || k[0].split(' ')[0] === n.split(' ')[0]) && !(L.weg || []).includes(n) && passt(o.raum, n).ok) l.push(EXTRA_SPECS[n].slice()); });
  return l;
};
/* Deko, die nicht passt, still weglassen (keine Warnung) */
const SV_DEKO_ALT = studioVarianten;
studioVarianten = function (o) {
  const r = SV_DEKO_ALT(o), L = losStatus(o), gewuenscht = new Set(L.wuensche || []);
  r.vs.forEach((v) => { v.ergebnis = v.ergebnis.filter((x) => x.ok || !DEKO_NAMEN.has(x.n) || gewuenscht.has(x.n)); v.fehlt = v.ergebnis.filter((x) => !x.ok).length; });
  return r;
};
/* Textilfarben je Stil – warm und passend */
const DEKO_FARBEN = { hell: ['#c9a27e', '#e9e0d2', '#9c6b4e', '#8f9b8a'], skandi: ['#9aa79a', '#efe6d6', '#c9a27e', '#6e7f8d'], industrial: ['#8a4b2a', '#cdbfa8', '#3d4a3e', '#b0703a'], japandi: ['#a07a55', '#e8dfcf', '#6b705c', '#3a3a3a'], landhaus: ['#b5643f', '#efe3cf', '#7d8f69', '#c9a27e'], luxus: ['#1f4a44', '#e6d3b3', '#8c2f39', '#c8a96a'], familie: ['#e0a458', '#f1e6d3', '#6fa3c0', '#c96b5b'], spar: ['#b9a58a', '#ece6dc', '#8a9a8a', '#c98b6b'] };
function dekoAnwenden(o, c) {
  const stufe = dekoStufe(o), L = losStatus(o), st = stilMix(o).stil || {}, F = (DEKO_FARBEN[o.stil] || [st.akzent || '#c9a27e', '#e9e0d2', '#b5643f', '#8aa39b']).slice();
  if (st.akzent && !DEKO_FARBEN[o.stil]) F[0] = st.akzent;
  c._deko = stufe; c._dekoFarben = F; c._abend = !!L.abend;
  c.plan = (c.plan || []).map((e) => Object.assign({}, e, stufe ? { deko: stufe, dekoFarben: F } : {}));
}
/* Bedienung im Studio */
function dekoLeiste(o, d) {
  const s = dekoStufe(o), L = losStatus(o);
  return `<div class="deko-leiste"><span class="klein grau">Wohnlichkeit</span>${[['0', 'Schlicht'], ['1', 'Dezent'], ['2', 'Gemütlich'], ['3', 'Viel Deko']].map(([k, t]) => `<button class="chip ${String(s) === k ? 'an' : ''}" data-akt="dekoStufe" ${d} data-s="${k}">${t}</button>`).join('')}<button class="chip ${L.abend ? 'an' : ''}" data-akt="dekoAbend" ${d}>🌙 Abendlicht</button></div>`;
}
AKT.dekoStufe = (d) => aendern(() => { losStatus(studioObj(d)).deko = Number(d.s); }, 'Wohnlichkeit');
AKT.dekoAbend = (d) => aendern(() => { const L = losStatus(studioObj(d)); L.abend = !L.abend; }, 'Abendlicht');
HILFE.dekoStufe = 'Wie wohnlich soll der Raum wirken? Gemütlich bringt Teppich, Pflanzen, Bilder, Kissen, Decken und warmes Licht.';
HILFE.dekoAbend = 'Zeigt den Raum abends mit warmem Lampenlicht.';
