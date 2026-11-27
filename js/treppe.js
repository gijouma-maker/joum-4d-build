/* Joum 4D Build – Treppen-Planer nach DIN 18065 (Ausgabe 2020-08) und Bauordnung (MBO § 34, LBO BW § 28)
   Quellen der Grenzwerte: DIN 18065 Tab. 2 (Wohngebäude ≤ 2 Wohnungen) bzw. Tab. 1 (Gebäude allgemein), Schrittmaßregel 2s + a = 59…65 cm,
   lichte Durchgangshöhe ≥ 200 cm, Podest ≥ nutzbare Laufbreite, Podest nach spätestens 18 Steigungen (notwendige Treppen außer EFH/ZFH),
   „Treppe darf nicht unmittelbar hinter einer Tür beginnen, die zur Treppe aufschlägt – Absatz mind. so tief wie die Tür breit“ (MBO § 34, LBO BW § 28 Abs. 6),
   Geländer 90 cm bis 12 m Absturzhöhe, darüber 110 cm; Öffnungen ≤ 12 cm; Handlauf ab 3 Stufen.
   Die App prüft und warnt – ersetzt keine Statik und keine Abnahme durch Fachleute. */

const TREPPE_GRENZ = {
  efh: { notw: { b: 80, smin: 14, smax: 20, amin: 23, amax: 37 }, nicht: { b: 50, smin: 14, smax: 21, amin: 21, amax: 37 } },
  mfh: { notw: { b: 100, smin: 14, smax: 19, amin: 26, amax: 37 }, nicht: { b: 50, smin: 14, smax: 21, amin: 21, amax: 37 } }
};
const TREPPE_FORMEN = [['gerade', 'Gerade'], ['L', 'L mit Podest (90°)'], ['U', 'U mit Podest (180°)'], ['viertel', 'Viertelgewendelt']];
const TUER_POS = [['keine', 'Keine Tür'], ['gegenueber', 'Gegenüber'], ['seitlich', 'Seitlich davor'], ['neben', 'Neben den Stufen']];

function treppeStart() {
  S.treppe = S.treppe || { geb: 'efh', art: 'notw', form: 'gerade', H: 275, d: 25, n: 0, a: 0, b: 90, raumL: 560, raumB: 220, oeffL: 380, oeffB: 100, vorAntritt: 100, vorAustritt: 100,
    tu: { pos: 'gegenueber', abstand: 120, breite: 90, auf: 'zur' }, to: { pos: 'seitlich', abstand: 100, breite: 90, auf: 'zur' } };
  return S.treppe;
}
const r1 = (x) => Math.round(x * 10) / 10;

function treppeRechnen(T0) {
  const T = Object.assign({}, T0), G = TREPPE_GRENZ[T.geb][T.art];
  const nAuto = () => { let best = null; for (let n = Math.ceil(T.H / G.smax); n <= Math.floor(T.H / G.smin); n++) { const s = T.H / n, d = Math.abs(s - 17.5); if (!best || d < best.d) best = { n, d }; } return best ? best.n : Math.round(T.H / 17.5); };
  const n = T.n > 1 ? T.n : nAuto(), s = T.H / n;
  const a = T.a > 0 ? T.a : Math.min(G.amax, Math.max(G.amin, 63 - 2 * s));
  const sm = 2 * s + a, b = T.b;
  // Grundfläche je Form (cm): Länge in Laufrichtung des ersten Laufs, Breite quer dazu
  const k1 = Math.ceil(n / 2);
  let len, wid, obererLauf, podest = 0;
  if (T.form === 'gerade') { len = (n - 1) * a; wid = b; obererLauf = len; }
  else if (T.form === 'L') { podest = b; len = (k1 - 1) * a + podest; wid = podest + (n - k1 - 1) * a; obererLauf = (n - k1 - 1) * a; }
  else if (T.form === 'U') { podest = b; len = Math.max(k1 - 1, n - k1 - 1) * a + podest; wid = 2 * b + 10; obererLauf = (n - k1 - 1) * a; }
  else { len = (k1 - 2) * a + b; wid = b + (n - k1 - 2) * a; obererLauf = (n - k1 - 2) * a; }
  // Kopfhöhe: nötige Länge der Deckenöffnung (vom Austritt gemessen) für 200 cm lichte Höhe
  const ohMin = a * (Math.ceil((200 + T.d) / s) - 1);
  const khKante = s * (Math.floor(T.oeffL / a) + 1) - T.d;
  const P = [], add = (stufe, regel, text, norm) => P.push({ stufe, regel, text, norm });
  // 1 Steigung / Auftritt / Schrittmaß
  if (s > G.smax + 0.001) add('fehler', 'steigung', `Stufe ${r1(s)} cm zu hoch (max. ${G.smax} cm). Mehr Stufen nehmen: mind. ${Math.ceil(T.H / G.smax)}.`, 'DIN 18065 Grenzmaße');
  else if (s < G.smin) add('fehler', 'steigung', `Stufe ${r1(s)} cm zu niedrig (min. ${G.smin} cm). Weniger Stufen nehmen: max. ${Math.floor(T.H / G.smin)}.`, 'DIN 18065 Grenzmaße');
  else add('ok', 'steigung', `Steigung ${r1(s)} cm (erlaubt ${G.smin}–${G.smax} cm).`, 'DIN 18065');
  if (a < G.amin - 0.001) add('fehler', 'auftritt', `Auftritt ${r1(a)} cm zu kurz (min. ${G.amin} cm).`, 'DIN 18065 Grenzmaße');
  else if (a > G.amax) add('fehler', 'auftritt', `Auftritt ${r1(a)} cm zu lang (max. ${G.amax} cm).`, 'DIN 18065 Grenzmaße');
  else add('ok', 'auftritt', `Auftritt ${r1(a)} cm (erlaubt ${G.amin}–${G.amax} cm).`, 'DIN 18065');
  if (sm < 59 || sm > 65) add('fehler', 'schrittmass', `Schrittmaß 2s + a = ${r1(sm)} cm – muss zwischen 59 und 65 cm liegen (ideal 63). Sonst stolpert man.`, 'DIN 18065, Schrittmaßregel');
  else add('ok', 'schrittmass', `Schrittmaß ${r1(sm)} cm (59–65, ideal 63).`, 'DIN 18065');
  // 2 Laufbreite
  if (b < G.b) add('fehler', 'laufbreite', `Laufbreite ${b} cm zu schmal (min. ${G.b} cm nutzbar, zwischen Wand/Handlauf gemessen).`, 'DIN 18065 Grenzmaße');
  else add('ok', 'laufbreite', `Laufbreite ${b} cm (min. ${G.b} cm).`, 'DIN 18065');
  // 3 Platz im Raum – läuft die Treppe gegen eine Wand?
  const brauchtL = len + T.vorAntritt;
  if (len > T.raumL) add('fehler', 'wand', `Die Treppe ist ${zahl(len / 100)} m lang – der Raum nur ${zahl(T.raumL / 100)} m: sie läuft ${Math.round(len - T.raumL)} cm gegen die Wand.`, 'Planung');
  else if (brauchtL > T.raumL) add('fehler', 'antritt', `Vor der ersten Stufe bleiben nur ${Math.round(T.raumL - len)} cm bis zur Wand – mind. ${b} cm (Laufbreite) frei lassen.`, 'DIN 18065 Podest/Treppenabsatz');
  else add('ok', 'wand', `Treppe ${zahl(len / 100)} m + ${T.vorAntritt} cm Antrittsfläche passen in ${zahl(T.raumL / 100)} m.`, 'Planung');
  if (wid > T.raumB) add('fehler', 'breite', `Die Treppe braucht ${zahl(wid / 100)} m Breite – vorhanden ${zahl(T.raumB / 100)} m.`, 'Planung');
  if (T.vorAntritt < b) add('fehler', 'antritt', `Vor dem Antritt nur ${T.vorAntritt} cm frei – mind. so tief wie die Laufbreite (${b} cm).`, 'DIN 18065 Treppenabsatz');
  if (T.vorAustritt < b) add('fehler', 'austritt', `Oben am Austritt nur ${T.vorAustritt} cm bis zur Wand/Tür – mind. ${b} cm frei.`, 'DIN 18065 Treppenabsatz');
  // 4 Kopfhöhe
  if (T.oeffL < ohMin) add('fehler', 'kopfhoehe', `Kopfhöhe an der Kante der Deckenöffnung nur ca. ${Math.round(khKante)} cm (mind. 200). Öffnung mind. ${Math.ceil(ohMin)} cm lang machen – oder steilere/andere Treppe.`, 'DIN 18065 lichte Durchgangshöhe');
  else add('ok', 'kopfhoehe', `Kopfhöhe ca. ${Math.round(khKante)} cm an der Öffnungskante (mind. 200 cm).`, 'DIN 18065');
  if (T.form !== 'gerade' && ohMin > obererLauf) add('warnung', 'kopfhoehe', `Die Deckenöffnung muss bis über das Podest/die Wendelung reichen (oberer Lauf nur ${Math.round(obererLauf)} cm, nötig ${Math.ceil(ohMin)} cm).`, 'DIN 18065');
  if (T.oeffB < b) add('fehler', 'oeffnung', `Deckenöffnung ${T.oeffB} cm schmaler als die Laufbreite (${b} cm) – Kopf stößt seitlich an.`, 'DIN 18065');
  // 5 Podest
  if (n > 18 && T.form === 'gerade') add(T.geb === 'mfh' && T.art === 'notw' ? 'fehler' : 'warnung', 'podest', `${n} Steigungen in einem Lauf – ${T.geb === 'mfh' && T.art === 'notw' ? 'nach spätestens 18 Steigungen ist ein Podest Pflicht' : 'im Einfamilienhaus nicht Pflicht, aber ab 18 Steigungen ist ein Podest sicherer'}.`, 'DIN 18065 Podest');
  if (podest && podest < b) add('fehler', 'podest', `Podest ${podest} cm kleiner als die Laufbreite.`, 'DIN 18065 Podest');
  if (T.form === 'viertel') add('info', 'wendel', `Wendelstufen: innen mind. ${T.geb === 'efh' ? 5 : 10} cm Auftritt; Auftritt auf der Lauflinie wie gerade Stufen. Genaue Verziehung vom Treppenbauer rechnen lassen.`, 'DIN 18065 Wendelstufen');
  // 6 Türen
  [['tu', 'unten', 'ersten Stufe'], ['to', 'oben', 'obersten Stufe']].forEach(([k, wo, stufe]) => {
    const t = T[k]; if (!t || t.pos === 'keine') return;
    if (t.pos === 'neben') add('fehler', 'tuer_' + wo, `Tür ${wo} liegt neben den Stufen – man tritt beim Öffnen direkt auf/neben eine Stufe (Sturzgefahr). Tür auf den Absatz verlegen oder Treppe drehen.`, 'MBO § 34 / LBO');
    else if (t.auf === 'zur' && t.abstand < t.breite) add('fehler', 'tuer_' + wo, `Tür ${wo} schlägt zur Treppe auf: zwischen Tür und ${stufe} nur ${t.abstand} cm – Absatz muss mind. so tief sein wie die Tür breit (${t.breite} cm).`, 'MBO § 34 (7), LBO BW § 28 (6)');
    else if (t.abstand < b) add('warnung', 'tuer_' + wo, `Tür ${wo}: nur ${t.abstand} cm bis zur ${stufe} – empfohlen mind. ${b} cm (Laufbreite), damit niemand beim Rauskommen direkt auf die Treppe tritt.`, 'DIN 18065 Treppenabsatz');
    else add('ok', 'tuer_' + wo, `Tür ${wo}: ${t.abstand} cm Abstand – ausreichend.`, 'MBO § 34');
  });
  // 7 Geländer & Handlauf (Hinweise)
  add('info', 'gelaender', `Geländer an freien Seiten: mind. 90 cm hoch (über 12 m Absturzhöhe 110 cm), Abstand zwischen Stäben max. 12 cm – bei Kindern im Haus auch im Einfamilienhaus so bauen.`, 'Landesbauordnungen, DIN 18065');
  add('info', 'handlauf', `Handlauf: ab 3 Stufen fest und griffsicher, Griffbreite 2,5–6 cm.`, 'MBO § 34, DIN 18065');
  add('info', 'toleranz', `Alle Stufen gleich hoch bauen – Abweichung max. 5 mm (Antrittsstufe Ausgleich nur nach Norm).`, 'DIN 18065 Toleranzen');
  const fehler = P.filter((x) => x.stufe === 'fehler').length, warn = P.filter((x) => x.stufe === 'warnung').length;
  return { n, s, a, sm, b, len, wid, ohMin, khKante, k1, podest, obererLauf, P, fehler, warn, G };
}

/* KI-Vorschläge: alle sinnvollen Kombinationen durchrechnen und die besten zeigen */
function treppeVorschlaege(T) {
  const G = TREPPE_GRENZ[T.geb][T.art], gelernt = treppeGelernt(), ziel = gelernt ? gelernt.s : 17.5, out = [];
  for (const [form] of TREPPE_FORMEN) for (let n = Math.ceil(T.H / G.smax); n <= Math.floor(T.H / G.smin); n++) {
    const s = T.H / n;
    [Math.min(G.amax, Math.max(G.amin, 63 - 2 * s)), Math.max(G.amin, 59 - 2 * s)].forEach((a) => {
      const r = treppeRechnen(Object.assign({}, T, { form, n, a: r1(a) }));
      const tuerFehler = r.P.filter((x) => x.stufe === 'fehler' && /^tuer/.test(x.regel)).length;
      out.push({ form, n, a: r1(a), r, wert: (r.fehler - tuerFehler) * 100 + tuerFehler * 30 + r.warn * 5 + Math.abs(r.sm - 63) + Math.abs(s - ziel) * 2 + Math.max(0, s - 19) * 4 + Math.max(0, 26 - a) * 1.5 + (form === 'gerade' ? 0 : 1.5) });
    });
  }
  out.sort((x, y) => x.wert - y.wert);
  const gesehen = new Set();
  return out.filter((v) => { const k = v.form + v.n; if (gesehen.has(k)) return false; gesehen.add(k); return true; }).slice(0, 3);
}

/* „Lernen“: Rückmeldungen und übernommene Treppen werden gespeichert (später anonym an den Server) */
function treppeGelernt() {
  const l = (S.lernen || []).filter((x) => x.art === 'treppe_nehmen');
  if (l.length < 2) return null;
  return { s: l.reduce((t, x) => t + x.s, 0) / l.length, anz: l.length };
}
function lernZaehler(regel) { return (S.lernen || []).filter((x) => x.art === 'treppe_urteil' && x.regel === regel && x.urteil === 'falsch').length; }

/* ---------- Zeichnungen ---------- */
function treppeSchnitt(T, r) {
  const W = 340, H0 = 200, sk = Math.min((W - 30) / Math.max(r.len + 60, 300), (H0 - 20) / (T.H + 40));
  const ox = 15, oy = H0 - 10, X = (x) => ox + x * sk, Y = (y) => oy - y * sk;
  let s = `<svg class="treppe-svg" viewBox="0 0 ${W} ${H0}" role="img" aria-label="Seitenansicht der Treppe">`;
  // Boden unten, Decke oben mit Öffnung (Öffnung beginnt am Austritt = Ende der Lauflänge, reicht oeffL zurück)
  const lauf = T.form === 'gerade' ? r.len : (r.n - 1) * r.a;
  s += `<line x1="${X(-20)}" y1="${Y(0)}" x2="${X(lauf + 60)}" y2="${Y(0)}" stroke="#777" stroke-width="2"/>`;
  const oeffStart = Math.max(0, lauf - T.oeffL);
  s += `<rect x="${X(-20)}" y="${Y(T.H)}" width="${(oeffStart + 20) * sk}" height="${T.d * sk}" fill="#555"/>`;
  s += `<rect x="${X(lauf)}" y="${Y(T.H)}" width="${60 * sk}" height="${T.d * sk}" fill="#555"/>`;
  // Stufen
  let p = `M${X(0)} ${Y(0)}`;
  for (let i = 1; i <= r.n; i++) { const x = (i - 1) * r.a; p += ` L${X(x)} ${Y(i * r.s)}`; if (i < r.n) p += ` L${X(x + r.a)} ${Y(i * r.s)}`; }
  p += ` L${X(lauf + 60)} ${Y(T.H)}`;
  s += `<path d="${p}" fill="none" stroke="#ffd27a" stroke-width="2"/>`;
  // Kopfhöhe an der Öffnungskante
  const kx = oeffStart, stufeUnter = Math.min(r.n, Math.max(0, Math.floor(kx / r.a) + 1)), ok = r.khKante >= 200;
  s += `<line x1="${X(kx)}" y1="${Y(T.H - T.d)}" x2="${X(kx)}" y2="${Y(stufeUnter * r.s)}" stroke="${ok ? '#7bd88f' : '#ff7a6a'}" stroke-width="2" stroke-dasharray="4 3"/>`;
  s += `<text x="${X(kx) + 4}" y="${(Y(T.H - T.d) + Y(stufeUnter * r.s)) / 2}" font-size="11" fill="${ok ? '#7bd88f' : '#ff7a6a'}">${Math.round(r.khKante)} cm</text>`;
  s += `<text x="${X(-18)}" y="${Y(T.H) - 4}" font-size="10" fill="#aaa">Decke ${T.d} cm</text><text x="${X(lauf / 2)}" y="${H0 - 1}" font-size="10" fill="#aaa" text-anchor="middle">${r.n} × ${r1(r.s)} cm · Auftritt ${r1(r.a)} cm</text></svg>`;
  return s;
}
function treppeGrundriss(T, r) {
  const W = 340, sk = (W - 30) / Math.max(T.raumL, r.len + T.vorAntritt, 200), Hh = Math.max(T.raumB, r.wid) * sk + 40;
  const ox = 15, oy = 15, X = (x) => ox + x * sk, Y = (y) => oy + y * sk;
  let s = `<svg class="treppe-svg" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Grundriss der Treppe"><rect x="${X(0)}" y="${Y(0)}" width="${T.raumL * sk}" height="${T.raumB * sk}" fill="#151515" stroke="#fff" stroke-width="2"/>`;
  const x0 = T.vorAntritt, rot = r.len + T.vorAntritt > T.raumL || r.wid > T.raumB;
  const farbe = rot ? '#ff7a6a' : '#ffd27a', stufe = (x, y, w, h) => `<rect x="${X(x)}" y="${Y(y)}" width="${w * sk}" height="${h * sk}" fill="none" stroke="${farbe}" stroke-width="1"/>`;
  if (T.form === 'gerade') for (let i = 0; i < r.n - 1; i++) s += stufe(x0 + i * r.a, 0, r.a, r.b);
  else {
    const l1 = T.form === 'viertel' ? r.k1 - 2 : r.k1 - 1;
    for (let i = 0; i < l1; i++) s += stufe(x0 + i * r.a, 0, r.a, r.b);
    const px = x0 + l1 * r.a;
    s += `<rect x="${X(px)}" y="${Y(0)}" width="${r.b * sk}" height="${r.b * sk}" fill="${farbe}" fill-opacity=".15" stroke="${farbe}"/>`;
    const l2 = T.form === 'viertel' ? r.n - r.k1 - 2 : r.n - r.k1 - 1;
    if (T.form === 'U') for (let i = 0; i < l2; i++) s += stufe(px - (i + 1) * r.a, r.b + 10, r.a, r.b);
    else for (let i = 0; i < l2; i++) s += stufe(px, r.b + i * r.a, r.b, r.a);
  }
  // Pfeil Laufrichtung + Türen
  s += `<text x="${X(x0) + 3}" y="${Y(r.b / 2) + 4}" font-size="11" fill="${farbe}">▲ hoch</text>`;
  const tu = T.tu;
  if (tu && tu.pos !== 'keine') {
    const tf = tu.pos === 'neben' || (tu.auf === 'zur' && tu.abstand < tu.breite) ? '#ff7a6a' : '#6ec6ff';
    const tx = tu.pos === 'gegenueber' ? X(0) : X(Math.max(0, x0 - tu.abstand)), ty = tu.pos === 'gegenueber' ? Y(r.b / 2 - tu.breite / 2) : Y(T.raumB);
    s += tu.pos === 'gegenueber' ? `<line x1="${tx}" y1="${ty}" x2="${tx}" y2="${ty + tu.breite * sk}" stroke="${tf}" stroke-width="5"/>` : `<line x1="${tu.pos === 'neben' ? X(x0 + r.a) : tx}" y1="${ty}" x2="${(tu.pos === 'neben' ? X(x0 + r.a) : tx) + tu.breite * sk}" y2="${ty}" stroke="${tf}" stroke-width="5"/>`;
  }
  s += `<text x="${X(T.raumL / 2)}" y="${Hh - 4}" font-size="10" fill="#aaa" text-anchor="middle">Raum ${zahl(T.raumL / 100)} × ${zahl(T.raumB / 100)} m · Tür unten blau (rot = Problem)</text></svg>`;
  return s;
}

/* ---------- Bildschirm ---------- */
route('treppe', () => {
  const T = treppeStart(), r = treppeRechnen(T), vs = treppeVorschlaege(T), gel = treppeGelernt();
  const chips = (k, liste, wert) => liste.map(([v, t]) => `<button class="chip ${wert === v ? 'an' : ''}" data-akt="trpWahl" data-k="${k}" data-v="${v}">${t}</button>`).join('');
  const feld = (k, t, v, hint) => `<label class="feld">${t}<input inputmode="decimal" data-ein="trpZahl" data-k="${k}" value="${v || ''}" placeholder="${hint || ''}"></label>`;
  const tuer = (k, t, wo) => `<div class="unter">${t}</div><div class="zeile wrap">${TUER_POS.map(([v, tt]) => `<button class="chip ${T[k].pos === v ? 'an' : ''}" data-akt="trpTuer" data-t="${k}" data-f="pos" data-v="${v}">${tt}</button>`).join('')}</div>
    ${T[k].pos !== 'keine' ? `<div class="raster3">${feld(k + '.abstand', 'Abstand zur ' + wo + ' (cm)', T[k].abstand)}${feld(k + '.breite', 'Türbreite (cm)', T[k].breite)}<div class="feld">Tür geht auf<div class="zeile wrap"><button class="chip ${T[k].auf === 'zur' ? 'an' : ''}" data-akt="trpTuer" data-t="${k}" data-f="auf" data-v="zur">zur Treppe</button><button class="chip ${T[k].auf === 'weg' ? 'an' : ''}" data-akt="trpTuer" data-t="${k}" data-f="auf" data-v="weg">weg</button></div></div></div>` : ''}`;
  const sym = { fehler: '✗', warnung: '⚠', ok: '✓', info: 'ℹ' };
  return kopf('Treppe planen', 'DIN 18065 · Bauordnung', '#/raum/treppenhaus') + `<div class="inhalt treppe">
    <section class="karte treppe-ergebnis ${r.fehler ? 'rot' : 'gruen'}">
      <div class="gross">${r.n} Steigungen à ${zahl(r1(r.s))} cm</div>
      <div>Auftritt ${zahl(r1(r.a))} cm · Schrittmaß ${zahl(r1(r.sm))} cm · Lauflänge ${zahl(r.len / 100)} m</div>
      <div class="status">${r.fehler ? `✗ ${r.fehler} Norm-Problem${r.fehler > 1 ? 'e' : ''}` : '✓ normgerecht nach DIN 18065'}${r.warn ? ` · ⚠ ${r.warn} Hinweis${r.warn > 1 ? 'e' : ''}` : ''}</div>
    </section>
    <div class="unter">Seitenansicht</div>${treppeSchnitt(T, r)}
    <div class="unter">Von oben</div>${treppeGrundriss(T, r)}
    <section class="karte"><h3>Prüfung</h3><ul class="trp-pruef">${r.P.filter((x) => x.stufe !== 'info').map((x) => `<li class="${x.stufe}"><span>${sym[x.stufe]} ${esc(x.text)}<small>${esc(x.norm)}${lernZaehler(x.regel) ? ` · von dir ${lernZaehler(x.regel)}× angezweifelt – bitte Fachmann fragen` : ''}</small></span>${x.stufe !== 'ok' ? `<span class="urteil"><button class="mini" data-akt="trpUrteil" data-r="${x.regel}" data-u="richtig" aria-label="Hinweis stimmt">👍</button><button class="mini" data-akt="trpUrteil" data-r="${x.regel}" data-u="falsch" aria-label="Hinweis passt nicht">👎</button></span>` : ''}</li>`).join('')}</ul></section>
    <section class="karte"><h3>KI-Vorschläge</h3><p class="klein">Ich habe alle Stufenzahlen und Treppenformen für deine Maße durchgerechnet${gel ? ` – und berücksichtige, dass du bisher Stufen um ${zahl(r1(gel.s))} cm gewählt hast` : ''}:</p>
      ${vs.map((v) => `<div class="trp-vorschlag ${v.r.fehler ? '' : 'ok'}"><div style="flex:1"><b>${esc(TREPPE_FORMEN.find((f) => f[0] === v.form)[1])}: ${v.n} × ${zahl(r1(v.r.s))} cm, Auftritt ${zahl(v.a)} cm</b><div class="klein">${v.r.fehler ? '✗ ' + v.r.fehler + ' Problem(e): ' + esc(v.r.P.find((x) => x.stufe === 'fehler').text) : '✓ normgerecht'} · ${zahl(v.r.len / 100)} × ${zahl(v.r.wid / 100)} m · Öffnung mind. ${Math.ceil(v.r.ohMin)} cm</div></div><button class="btn hell" data-akt="trpNehmen" data-f="${v.form}" data-n="${v.n}" data-a="${v.a}">Nehmen</button></div>`).join('')}
    </section>
    <section class="karte"><h3>Gebäude & Treppe</h3>
      <div class="zeile wrap">${chips('geb', [['efh', 'Haus mit 1–2 Wohnungen'], ['mfh', 'Mehrfamilienhaus / sonstige']], T.geb)}</div>
      <div class="zeile wrap">${chips('art', [['notw', 'Notwendige Treppe (Hauptweg)'], ['nicht', 'Zusatztreppe (z. B. Keller, Galerie)']], T.art)}</div>
      <div class="zeile wrap">${chips('form', TREPPE_FORMEN, T.form)}</div>
      <div class="raster3">${feld('H', 'Geschosshöhe FF–FF (cm)', T.H)}${feld('d', 'Decke inkl. Boden (cm)', T.d)}${feld('b', 'Laufbreite (cm)', T.b)}</div>
      <div class="raster2">${feld('n', 'Anzahl Steigungen', T.n, 'auto (' + r.n + ')')}${feld('a', 'Auftritt (cm)', T.a, 'auto (' + zahl(r1(r.a)) + ')')}</div>
    </section>
    <section class="karte"><h3>Platz & Deckenöffnung</h3>
      <div class="raster2">${feld('raumL', 'Raum Länge (cm)', T.raumL)}${feld('raumB', 'Raum Breite (cm)', T.raumB)}${feld('oeffL', 'Öffnung Länge (cm)', T.oeffL)}${feld('oeffB', 'Öffnung Breite (cm)', T.oeffB)}${feld('vorAntritt', 'Frei vor 1. Stufe (cm)', T.vorAntritt)}${feld('vorAustritt', 'Frei oben am Austritt (cm)', T.vorAustritt)}</div>
    </section>
    <section class="karte"><h3>Türen</h3>${tuer('tu', 'Tür unten (am Antritt)', 'ersten Stufe')}${tuer('to', 'Tür oben (am Austritt)', 'obersten Stufe')}</section>
    <details class="karte"><summary>Geländer, Handlauf & Regeln</summary><ul>${r.P.filter((x) => x.stufe === 'info').map((x) => `<li>${esc(x.text)} <small class="grau">(${esc(x.norm)})</small></li>`).join('')}</ul>
      <p class="klein grau">Die App rechnet nach DIN 18065 und der Musterbauordnung. In einzelnen Bundesländern gibt es Abweichungen (z. B. Geländerhöhe). Statik, Brandschutz und Abnahme macht der Fachbetrieb.</p></details>
    <button class="btn voll" data-akt="trpSpeichern">Als Projekt speichern</button>
  </div>`;
});
EIN.trpZahl = (v, d) => aendern(() => {
  const T = treppeStart(), n = v === '' ? 0 : parseZahl(v);
  if (d.k.includes('.')) { const [a, b] = d.k.split('.'); T[a][b] = n; } else T[d.k] = n;
}, 'Treppe geändert');
AKT.trpWahl = (d) => aendern(() => { treppeStart()[d.k] = d.v; }, 'Treppe geändert');
AKT.trpTuer = (d) => aendern(() => { treppeStart()[d.t][d.f] = d.v; }, 'Tür geändert');
AKT.trpNehmen = (d) => {
  aendern(() => { const T = treppeStart(); T.form = d.f; T.n = Number(d.n); T.a = Number(d.a); S.lernen = S.lernen || []; S.lernen.push({ art: 'treppe_nehmen', s: T.H / T.n, a: T.a, form: T.form, zeit: Date.now() }); }, 'Treppen-Vorschlag übernommen');
  toast('Vorschlag übernommen'); window.scrollTo(0, 0);
};
AKT.trpUrteil = (d) => {
  aendern(() => { S.lernen = S.lernen || []; S.lernen.push({ art: 'treppe_urteil', regel: d.r, urteil: d.u, zeit: Date.now(), treppe: JSON.parse(JSON.stringify(treppeStart())) }); }, 'Rückmeldung gespeichert');
  toast(d.u === 'falsch' ? 'Danke – gemerkt. Die Norm-Warnung bleibt aus Sicherheitsgründen, wird aber zur Prüfung vorgemerkt.' : 'Danke – gemerkt.');
};
AKT.trpSpeichern = () => {
  const T = treppeStart(), r = treppeRechnen(T);
  const p = projektAnlegen('treppenhaus', '', { treppe: JSON.parse(JSON.stringify(T)), notizen: `Treppe: ${r.n} × ${r1(r.s)} cm, Auftritt ${r1(r.a)} cm, ${TREPPE_FORMEN.find((f) => f[0] === T.form)[1]}, Laufbreite ${T.b} cm. ${r.fehler ? r.fehler + ' Norm-Probleme offen!' : 'Normgerecht nach DIN 18065.'}` });
  toast('Als Projekt gespeichert'); geh('#/projekt/' + p.id);
};
HILFE.trpNehmen = 'Diesen Treppen-Vorschlag übernehmen.';
HILFE.trpUrteil = 'Sag mir, ob der Hinweis stimmt. Daraus lernt die App.';
HILFE.trpSpeichern = 'Treppe als Projekt speichern.';
