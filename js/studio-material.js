/* Joum 4D Build – Boden, Wände, Decke & eigene Produkte per Foto (im Studio, in 3D sichtbar)
   Boden: Parkett-Muster (Schiffsboden, Landhausdiele, Fischgrät, Chevron, Tafel), Fliesen (30×60, 60×60, 120×60, Mosaik, Sechseck),
   Beton, Marmor – oder Foto der eigenen Fliese/des eigenen Parketts. Jede Wand eigene Farbe oder Fliesen (halbhoch/raumhoch).
   Decke: Farbe + Lampe (Pendel, Spots, LED-Rand, Deckenleuchte). Teile (Waschbecken, Spiegel …) per Foto festlegen.
   „Passt das zusammen?“ prüft Kontrast, Farbtöne, Muster, Raumgröße – Richtwerte, Muster vor dem Kauf ansehen. */

const MUSTER = [
  { id: 'dielen', name: 'Schiffsboden', art: 'holz', preis: [35, 70] },
  { id: 'landhaus', name: 'Landhausdiele', art: 'holz', preis: [45, 95] },
  { id: 'fischgraet', name: 'Fischgrät', art: 'holz', preis: [60, 130] },
  { id: 'chevron', name: 'Chevron', art: 'holz', preis: [70, 150] },
  { id: 'tafel', name: 'Tafel/Würfel', art: 'holz', preis: [60, 120] },
  { id: 'f3060', name: 'Fliese 30×60', art: 'fliese', preis: [25, 60] },
  { id: 'f6060', name: 'Fliese 60×60', art: 'fliese', preis: [30, 70] },
  { id: 'f12060', name: 'Großformat 120×60', art: 'fliese', preis: [40, 95] },
  { id: 'mosaik', name: 'Mosaik', art: 'fliese', preis: [50, 120] },
  { id: 'sechseck', name: 'Sechseck', art: 'fliese', preis: [40, 95] },
  { id: 'marmor', name: 'Marmor-Optik', art: 'fliese', preis: [40, 150] },
  { id: 'beton', name: 'Beton/Mikrozement', art: 'fugenlos', preis: [80, 160] }
];
const FARBEN_HOLZ = [['Eiche hell', '#d8bb8f'], ['Eiche natur', '#b8916a'], ['Eiche geräuchert', '#7a5638'], ['Nussbaum', '#5b3a26'], ['Weiß geölt', '#e9e0d2'], ['Grau', '#9a958d']];
const FARBEN_FLIESE = [['Weiß', '#f1efea'], ['Creme', '#e6dccb'], ['Hellgrau', '#c9c8c4'], ['Anthrazit', '#4a4a4a'], ['Terrakotta', '#b5643f'], ['Salbei', '#9aab93'], ['Blau', '#5b7fa6'], ['Schwarz', '#222222']];
const FARBEN_WAND = [['Weiß', '#f4f2ee'], ['Hellgrau', '#d9d7d2'], ['Greige', '#cbbfae'], ['Salbei', '#a9b9a2'], ['Hellblau', '#b7cde0'], ['Blau', '#4f78a8'], ['Navy', '#253850'], ['Terrakotta', '#c0714f'], ['Ocker', '#d3a24b'], ['Rosé', '#e3c1b9'], ['Waldgrün', '#2f4a3a'], ['Anthrazit', '#3b3d40']];
const LAMPEN = [['keine', 'Keine'], ['pendel', 'Pendelleuchte'], ['spots', 'Spots'], ['led', 'LED-Rand indirekt'], ['decke', 'Deckenleuchte']];
const WAND_NAMEN = ['hinten', 'rechts', 'vorne', 'links (Tür)'];

/* ---------- Flächen-Daten am Raum ---------- */
function flaechen(o) {
  const nass = ['bad', 'gaestewc', 'waschraum', 'kueche', 'keller'].includes(o.raum);
  o.flaechen = o.flaechen || {};
  const F = o.flaechen;
  F.boden = F.boden || (nass ? { muster: 'f6060', farbe: '#c9c8c4' } : { muster: 'dielen', farbe: '#b8916a' });
  F.waende = F.waende || [{}, {}, {}, {}];
  F.decke = F.decke || { farbe: '#f7f7f5', lampe: 'keine' };
  return F;
}

/* ---------- Muster zeichnen (für 3D und Vorschau) ---------- */
function zufall(s) { let x = s || 7; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }
function farbVar(hex, d) { const c = hexRgb(hex); return `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v * (1 + d))))).join(',')})`; }
function hexRgb(h) { h = (h || '#888').replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) || 0); }
function helligkeit(hex) { const [r, g, b] = hexRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function hsl(hex) { const [r, g, b] = hexRgb(hex).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }

const FOTO_BILDER = {};
function fotoBild(url, fertig) {
  if (!url) return null;
  let i = FOTO_BILDER[url];
  if (!i) { i = new Image(); i._warte = []; i.onload = () => { i._ok = true; i._warte.forEach((f) => f()); i._warte = []; }; i.src = url; FOTO_BILDER[url] = i; }
  if (!i._ok && fertig) i._warte.push(fertig);
  return i._ok ? i : null;
}
/* liefert { c: canvas, mx, my } – Canvas steht für mx × my Meter (kachelbar) */
function musterBild(spec, fertig, px) {
  px = px || 512;
  const m = spec.muster, f = spec.farbe || '#b8916a', R = zufall(hexRgb(f).reduce((a, b) => a + b, 13));
  const fuge = helligkeit(f) > 0.35 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.18)';
  let mx = 1, my = 1;
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const brett = (X, Y, W, H, horiz) => {
    x.fillStyle = farbVar(f, (R() - 0.5) * 0.16); x.fillRect(X, Y, W, H);
    x.strokeStyle = 'rgba(0,0,0,.07)'; x.lineWidth = 1;
    for (let k = 0; k < 4; k++) { x.beginPath(); if (horiz) { const yy = Y + H * (0.2 + 0.6 * R()); x.moveTo(X, yy); x.bezierCurveTo(X + W * 0.3, yy + 2, X + W * 0.6, yy - 2, X + W, yy); } else { const xx = X + W * (0.2 + 0.6 * R()); x.moveTo(xx, Y); x.bezierCurveTo(xx + 2, Y + H * 0.3, xx - 2, Y + H * 0.6, xx, Y + H); } x.stroke(); }
    x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 1.5; x.strokeRect(X, Y, W, H);
  };
  if (spec.foto) {
    const img = fotoBild(spec.foto, fertig), cm = spec.cm || [30, 30];
    mx = cm[0] / 100; my = cm[1] / 100; c.width = px; c.height = Math.round(px * my / mx);
    x.fillStyle = spec.fotoFarbe || f; x.fillRect(0, 0, c.width, c.height);
    if (img) { const s = Math.max(c.width / img.width, c.height / img.height); x.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s); }
    if (spec.fugen !== false) { x.strokeStyle = fuge; x.lineWidth = 3; x.strokeRect(0, 0, c.width, c.height); }
    return { c, mx, my };
  }
  if (m === 'dielen' || m === 'landhaus') {
    const bw = m === 'dielen' ? 0.15 : 0.24, L = m === 'dielen' ? 0.75 : 2.4; mx = m === 'dielen' ? 1.5 : 2.4; my = bw * 8;
    c.width = px; c.height = Math.round(px * my / mx); const k = c.width / mx;
    for (let r = 0; r < 8; r++) { const off = R() * L; for (let s = -L + off; s < mx; s += L) brett(s * k, r * bw * k, L * k, bw * k, true); }
  } else if (m === 'fischgraet' || m === 'chevron') {
    const L = 0.6, w = 0.1, cw = L / Math.SQRT2, st = w * Math.SQRT2; mx = cw * 2; my = st * 6;
    c.width = px; c.height = Math.round(px * my / mx); const k = c.width / mx;
    x.fillStyle = farbVar(f, -0.1); x.fillRect(0, 0, c.width, c.height);
    for (let col = -1; col < 3; col++) for (let r = -3; r < 9; r++) {
      const links = col % 2 === 0, cx = col * cw, cy = r * st + (links ? 0 : (m === 'chevron' ? 0 : st / 2));
      x.save();
      if (m === 'chevron') { x.beginPath(); x.rect(cx * k, 0, cw * k, c.height); x.clip(); }
      x.translate((cx + cw / 2) * k, (cy + (links ? cw / 2 : cw / 2)) * k); x.rotate(links ? -Math.PI / 4 : Math.PI / 4);
      const LL = m === 'chevron' ? L * 1.5 : L; brett(-LL / 2 * k, -w / 2 * k, LL * k, w * k, true); x.restore();
    }
  } else if (m === 'tafel') {
    mx = my = 1; c.width = c.height = px; const k = px, q = 0.5, n = 5;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let s = 0; s < n; s++) { const h = (i + j) % 2 === 0; if (h) brett(i * q * k, (j * q + s * q / n) * k, q * k, q / n * k, true); else brett((i * q + s * q / n) * k, j * q * k, q / n * k, q * k, false); }
  } else if (m === 'beton') {
    mx = my = 2; c.width = c.height = px; x.fillStyle = f; x.fillRect(0, 0, px, px);
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${R() > 0.5 ? '0,0,0' : '255,255,255'},${0.03 + R() * 0.05})`; const r = 2 + R() * 14; x.beginPath(); x.arc(R() * px, R() * px, r, 0, 7); x.fill(); }
  } else if (m === 'sechseck') {
    const r = 0.1; mx = Math.sqrt(3) * r; my = 3 * r; c.width = px; c.height = Math.round(px * my / mx); const k = c.width / mx;
    x.fillStyle = fuge; x.fillRect(0, 0, c.width, c.height);
    const hex = (cx, cy) => { x.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; x.lineTo((cx + Math.cos(a) * r * 0.96) * k, (cy + Math.sin(a) * r * 0.96) * k); } x.closePath(); x.fillStyle = farbVar(f, (R() - 0.5) * 0.08); x.fill(); };
    for (let i = -1; i < 3; i++) for (let j = -1; j < 3; j++) { hex(i * mx, j * my); hex(i * mx + mx / 2, j * my + 1.5 * r); }
  } else {
    const t = { f3060: [0.6, 0.3, true], f6060: [0.6, 0.6, false], f12060: [1.2, 0.6, true], mosaik: [0.05, 0.05, false], marmor: [0.6, 0.6, false] }[m] || [0.3, 0.3, false];
    const [tw, th, halb] = t; mx = m === 'mosaik' ? 0.3 : tw * (halb ? 1 : 2); my = m === 'mosaik' ? 0.3 : th * 2;
    c.width = px; c.height = Math.round(px * my / mx); const k = c.width / mx;
    x.fillStyle = fuge; x.fillRect(0, 0, c.width, c.height);
    for (let r = 0; r * th < my - 0.001; r++) { const off = halb && r % 2 ? tw / 2 : 0; for (let s = -tw + off; s < mx; s += tw) { x.fillStyle = farbVar(f, (R() - 0.5) * (m === 'mosaik' ? 0.18 : 0.05)); x.fillRect(s * k + 1.5, r * th * k + 1.5, tw * k - 3, th * k - 3); } }
    if (m === 'marmor') { x.strokeStyle = helligkeit(f) > 0.3 ? 'rgba(90,90,90,.28)' : 'rgba(255,255,255,.3)'; x.lineWidth = 1.5; for (let i = 0; i < 9; i++) { x.beginPath(); let px0 = R() * c.width, py0 = R() * c.height; x.moveTo(px0, py0); for (let s = 0; s < 6; s++) { px0 += (R() - 0.3) * 120; py0 += (R() - 0.5) * 90; x.lineTo(px0, py0); } x.stroke(); } }
  }
  return { c, mx, my };
}
window.musterBild = musterBild;
function musterVorschau(spec) { try { return musterBild(spec, null, 96).c.toDataURL('image/png'); } catch (e) { return ''; } }

/* Durchschnittsfarbe eines Fotos (für Farb-Check und 3D) */
function fotoFarbe(url, fertig) { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0; for (let k = 0; k < d.length; k += 4) { r += d[k]; g += d[k + 1]; b += d[k + 2]; } const n = d.length / 4; fertig('#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('')); }; i.src = url; }

/* ---------- Passt das zusammen? ---------- */
function farbCheck(o) {
  const F = flaechen(o), L = losStatus(o), M = stilMix(o).stil;
  const boden = F.boden.fotoFarbe || F.boden.farbe;
  const waende = F.waende.map((w) => (w.fliesen ? (w.fliesen.fotoFarbe || w.fliesen.farbe) : w.farbe) || M.wand);
  const moebel = M.moebel || '#888';
  const fotos = Object.values(L.fotoTeile || {}).map((t) => t.farbe).filter(Boolean);
  const alle = [boden, ...waende, F.decke.farbe, moebel, ...fotos];
  const out = [];
  const kontrast = Math.min(...waende.map((w) => Math.abs(helligkeit(w) - helligkeit(boden))));
  if (kontrast < 0.04) out.push(['gelb', 'Boden und Wand sind fast gleich hell – der Raum wirkt flach. Boden dunkler oder Wand heller wählen, oder eine Akzentwand.']);
  else out.push(['ok', 'Guter Kontrast zwischen Boden und Wänden.']);
  const bunt = [...new Set(alle.map((h) => { const [hh, s, l] = hsl(h); return s > 0.32 && l > 0.15 && l < 0.85 ? Math.round(hh / 30) % 12 : null; }).filter((x) => x !== null))];
  if (bunt.length >= 4) out.push(['nein', bunt.length + ' kräftige Farbtöne gleichzeitig – wirkt unruhig. Regel 60-30-10: eine Hauptfarbe, eine Nebenfarbe, ein Akzent.']);
  else if (bunt.length === 3) out.push(['gelb', 'Drei kräftige Farben – geht, wenn eine davon nur als kleiner Akzent vorkommt.']);
  else out.push(['ok', bunt.length ? 'Ruhige Farbwahl mit ' + bunt.length + ' Akzentfarbe(n).' : 'Ruhige, neutrale Farbwahl – zeitlos.']);
  const warm = (h) => { const [hh, s] = hsl(h); return s > 0.15 && (hh < 60 || hh > 330); }, kalt = (h) => { const [hh, s] = hsl(h); return s > 0.15 && hh > 170 && hh < 260; };
  if (alle.some(warm) && alle.some(kalt) && !alle.some((h) => hsl(h)[1] < 0.12)) out.push(['gelb', 'Warme und kalte Töne ohne neutrale Brücke – Weiß, Grau oder Holz natur verbindet beides.']);
  const holz = MUSTER.find((m) => m.id === F.boden.muster)?.art === 'holz' && !F.boden.foto;
  const musterWand = F.waende.filter((w) => w.fliesen && ['mosaik', 'sechseck', 'marmor'].includes(w.fliesen.muster)).length;
  if ((['fischgraet', 'chevron', 'sechseck', 'mosaik', 'tafel'].includes(F.boden.muster)) && musterWand) out.push(['gelb', 'Gemustert am Boden UND an der Wand – zwei Muster konkurrieren. Eins davon ruhig halten.']);
  const fl = o.breite * o.tiefe / 10000, dunkel = waende.filter((w) => helligkeit(w) < 0.12).length;
  if (fl < 9 && dunkel >= 2) out.push(['gelb', 'Kleiner Raum (' + zahl(fl, 1) + ' m²) mit mehreren dunklen Wänden – wirkt enger. Besser nur eine dunkle Akzentwand.']);
  if (helligkeit(F.decke.farbe) < 0.25 && (o.hoehe || 250) < 260) out.push(['gelb', 'Dunkle Decke bei normaler Raumhöhe drückt optisch – hell lassen oder nur bei hohen Räumen.']);
  if (holz && hsl(moebel)[2] > 0.25 && Math.abs(helligkeit(moebel) - helligkeit(boden)) < 0.03 && hsl(moebel)[0] < 60) out.push(['gelb', 'Holz-Möbel im fast gleichen Ton wie der Holzboden – wirkt wie „fast getroffen“. Deutlich heller/dunkler oder andere Holzart.']);
  if (['bad', 'gaestewc', 'waschraum'].includes(o.raum) && holz) out.push(['gelb', 'Echtholz im Nassraum nur mit Feuchtraum-Eignung (z. B. Teak, versiegelt) – sonst Fliese in Holzoptik.']);
  const ampel = out.some((x) => x[0] === 'nein') ? 'nein' : out.some((x) => x[0] === 'gelb') ? 'gelb' : 'ok';
  return { ampel, punkte: out, farben: [...new Set(alle)] };
}

/* ---------- Kosten Boden/Wände ---------- */
function flaechenKosten(o) {
  const F = flaechen(o), m2 = o.breite * o.tiefe / 10000, H = (o.hoehe || 250) / 100;
  const mu = MUSTER.find((m) => m.id === F.boden.muster) || MUSTER[0];
  let min = mu.preis[0] * m2 * 1.1, max = mu.preis[1] * m2 * 1.1; // +10 % Verschnitt
  F.waende.forEach((w, i) => {
    const l = (i % 2 ? o.tiefe : o.breite) / 100;
    if (w.fliesen) { const h = w.fliesen.hoehe === 'voll' ? H : 1.2; min += 30 * l * h; max += 80 * l * h; }
    if (w.farbe) { min += 3 * l * H; max += 8 * l * H; }
  });
  return { min: Math.round(min / 10) * 10, max: Math.round(max / 10) * 10, m2 };
}

/* ---------- Oberfläche im Studio ---------- */
let MAT = { sel: 'boden', innen: false };
function materialKarte(o, d) {
  const F = flaechen(o), L = losStatus(o), s = MAT.sel;
  const wi = /^wand:/.test(s) ? Number(s.split(':')[1]) : -1;
  const sw = (farbe, akt, data, titel) => `<button class="farb-punkt ${akt ? 'an' : ''}" style="background:${farbe}" title="${esc(titel)}" aria-label="${esc(titel)}" ${data}></button>`;
  const tabs = [['boden', 'Boden'], ...[0, 1, 2, 3].map((i) => ['wand:' + i, 'Wand ' + WAND_NAMEN[i]]), ['decke', 'Decke & Licht'], ['teile', 'Meine Produkte']];
  let inhalt = '';
  if (s === 'boden' || (wi >= 0 && F.waende[wi].fliesen)) {
    const B = s === 'boden' ? F.boden : F.waende[wi].fliesen, wo = s === 'boden' ? 'boden' : 'fliese';
    const liste = s === 'boden' ? MUSTER : MUSTER.filter((m) => m.art !== 'holz');
    const holz = MUSTER.find((m) => m.id === B.muster)?.art === 'holz';
    inhalt += `${wi >= 0 ? `<div class="zeile wrap"><button class="chip" data-akt="matWandFarbe" ${d} data-w="${wi}">Nur Farbe statt Fliesen</button><button class="chip ${B.hoehe !== 'voll' ? 'an' : ''}" data-akt="matFliesHoehe" ${d} data-w="${wi}" data-h="halb">Halbhoch 1,20 m</button><button class="chip ${B.hoehe === 'voll' ? 'an' : ''}" data-akt="matFliesHoehe" ${d} data-w="${wi}" data-h="voll">Raumhoch</button></div>` : ''}
      <div class="muster-leiste">${liste.map((m) => `<button class="muster-chip ${B.muster === m.id && !B.foto ? 'an' : ''}" data-akt="matMuster" ${d} data-wo="${wo}" data-w="${wi}" data-m="${m.id}"><img src="${musterVorschau({ muster: m.id, farbe: B.farbe })}" alt="">${esc(m.name)}</button>`).join('')}</div>
      <div class="unter">Farbe</div><div class="farb-reihe">${(holz ? FARBEN_HOLZ : FARBEN_FLIESE).map(([n, h]) => sw(h, B.farbe === h && !B.foto, `data-akt="matFarbe" ${d} data-wo="${wo}" data-w="${wi}" data-f="${h}"`, n)).join('')}<label class="farb-punkt eigen" title="Eigene Farbe">＋<input type="color" data-ein="matFarbeEigen" ${d} data-wo="${wo}" data-w="${wi}" value="${B.farbe}"></label></div>
      <div class="unter">Eigene ${s === 'boden' ? 'Fliese / eigenes Parkett' : 'Fliese'} per Foto</div>
      <div class="zeile wrap">${dateiKnopf('Foto davon machen', 'matFoto', { wo, w: wi, r: d.match(/data-r="([^"]*)"/)?.[1] || '', p: d.match(/data-p="([^"]*)"/)?.[1] || '' }, { icon: ICON.kamera || '', klasse: 'chip-knopf' })}
      ${B.foto ? `<img class="mat-foto" src="${B.foto}" alt="Dein Foto"><label class="feld klein" style="width:90px">Breite cm<input inputmode="numeric" data-ein="matFotoCm" ${d} data-wo="${wo}" data-w="${wi}" data-i="0" value="${(B.cm || [30, 30])[0]}"></label><label class="feld klein" style="width:90px">Höhe cm<input inputmode="numeric" data-ein="matFotoCm" ${d} data-wo="${wo}" data-w="${wi}" data-i="1" value="${(B.cm || [30, 30])[1]}"></label><button class="chip" data-akt="matFotoWeg" ${d} data-wo="${wo}" data-w="${wi}">Foto entfernen</button>` : ''}</div>
      <p class="klein grau">Foto möglichst gerade von oben, eine Fliese/ein Stück füllt das Bild. Maße eintragen – dann stimmt die Größe im Raum.</p>`;
  } else if (wi >= 0) {
    const W = F.waende[wi], akt = W.farbe || stilMix(o).stil.wand;
    inhalt += `<div class="unter">Wandfarbe</div><div class="farb-reihe">${FARBEN_WAND.map(([n, h]) => sw(h, akt === h && !W.tapete, `data-akt="matWand" ${d} data-w="${wi}" data-f="${h}"`, n)).join('')}<label class="farb-punkt eigen" title="Eigene Farbe">＋<input type="color" data-ein="matWandEigen" ${d} data-w="${wi}" value="${akt}"></label></div>
      <div class="zeile wrap"><button class="chip" data-akt="matAlleWaende" ${d} data-f="${akt}">Diese Farbe für alle Wände</button><button class="chip" data-akt="matFliesen" ${d} data-w="${wi}">Fliesen an diese Wand</button></div>
      <div class="unter">Paneele & Vertäfelung</div>
      <div class="muster-leiste">${PANEELE.map(([k, n]) => `<button class="muster-chip ${W.paneel && W.paneel.typ === k ? 'an' : ''}" data-akt="matPaneel" ${d} data-w="${wi}" data-t="${k}"><img src="${paneelVorschau(k, (W.paneel || {}).farbe)}" alt="">${esc(n)}</button>`).join('')}</div>
      ${W.paneel ? `<div class="farb-reihe">${(W.paneel.typ === 'lamellen' || W.paneel.typ === 'hexagon' ? FARBEN_HOLZ.concat([['Schwarz', '#222222'], ['Salbei', '#9aab93']]) : FARBEN_WAND).map(([n, h]) => sw(h, W.paneel.farbe === h, `data-akt="matPaneelFarbe" ${d} data-w="${wi}" data-f="${h}"`, n)).join('')}</div>
        <div class="zeile wrap">${W.paneel.typ === 'lamellen' ? `<button class="chip ${W.paneel.breite !== 'streifen' ? 'an' : ''}" data-akt="matPaneelOpt" ${d} data-w="${wi}" data-k="breite" data-v="voll">Ganze Wand</button><button class="chip ${W.paneel.breite === 'streifen' ? 'an' : ''}" data-akt="matPaneelOpt" ${d} data-w="${wi}" data-k="breite" data-v="streifen">Streifen 1,2 m</button>` : ''}${['kassetten', 'nutfeder'].includes(W.paneel.typ) ? `<button class="chip ${W.paneel.hoehe !== 'hoch' ? 'an' : ''}" data-akt="matPaneelOpt" ${d} data-w="${wi}" data-k="hoehe" data-v="90">bis 90 cm</button><button class="chip ${W.paneel.hoehe === 'hoch' ? 'an' : ''}" data-akt="matPaneelOpt" ${d} data-w="${wi}" data-k="hoehe" data-v="hoch">bis 1,20 m</button>` : ''}${W.paneel.typ === 'hexagon' ? `<button class="chip ${W.paneel.hoehe === 'halb' ? 'an' : ''}" data-akt="matPaneelOpt" ${d} data-w="${wi}" data-k="hoehe" data-v="halb">halbe Höhe</button><button class="chip ${W.paneel.hoehe !== 'halb' ? 'an' : ''}" data-akt="matPaneelOpt" ${d} data-w="${wi}" data-k="hoehe" data-v="voll">ganze Höhe</button>` : ''}<button class="chip" data-akt="matPaneelWeg" ${d} data-w="${wi}">Paneele entfernen</button></div>
        <p class="klein grau">${esc((PANEELE.find((x) => x[0] === W.paneel.typ) || [])[2] || '')}</p>` : ''}
      <div class="unter">Tapete / Muster</div>
      <div class="muster-leiste">${TAPETEN.map(([k, n]) => `<button class="muster-chip ${W.tapete && W.tapete.muster === k ? 'an' : ''}" data-akt="matTapete" ${d} data-w="${wi}" data-t="${k}"><img src="${tapeteVorschau(k, (W.tapete || {}).farbe)}" alt="">${esc(n)}</button>`).join('')}${W.tapete ? `<button class="muster-chip" data-akt="matTapeteWeg" ${d} data-w="${wi}"><span class="mk-plus">✕</span>ohne Tapete</button>` : ''}</div>
      ${W.tapete ? `<div class="farb-reihe">${FARBEN_WAND.map(([n, h]) => sw(h, W.tapete.farbe === h, `data-akt="matTapeteFarbe" ${d} data-w="${wi}" data-f="${h}"`, n)).join('')}</div>` : ''}`;
  } else if (s === 'decke') {
    inhalt += `<div class="farb-reihe">${FARBEN_WAND.map(([n, h]) => sw(h, F.decke.farbe === h, `data-akt="matDecke" ${d} data-f="${h}"`, n)).join('')}</div>
      <div class="unter">Licht an der Decke</div><div class="zeile wrap">${LAMPEN.map(([k, n]) => `<button class="chip ${F.decke.lampe === k ? 'an' : ''}" data-akt="matLampe" ${d} data-l="${k}">${n}</button>`).join('')}</div>
      <p class="klein grau">Die Decke siehst du in der Innenansicht (👁 im 3D).</p>`;
  } else {
    const teile = [...new Set((studioAktuell(d.includes('data-r') ? { r: o.raum } : { p: o.id }).v?.plan || []).filter((e) => !e.gruppe).map((e) => e.n))];
    inhalt += `<p class="klein">Du hast das Waschbecken, den Spiegel oder die Lampe schon im Laden gesehen? Foto machen – die App setzt es in den Raum und prüft, ob es farblich passt.</p>
      ${teile.map((n) => { const t = (L.fotoTeile || {})[n]; return `<div class="zeile foto-teil"><span style="flex:1">${esc(n)}</span>${t ? `<img class="mat-foto" src="${t.foto}" alt=""><button class="chip" data-akt="matTeilWeg" ${d} data-n="${esc(n)}">×</button>` : dateiKnopf('Foto', 'matTeilFoto', { n, r: d.match(/data-r="([^"]*)"/)?.[1] || '', p: d.match(/data-p="([^"]*)"/)?.[1] || '' }, { icon: ICON.kamera || '', klasse: 'chip-knopf' })}</div>`; }).join('')}`;
  }
  const K = farbCheck(o), FK = flaechenKosten(o);
  return `<section class="karte material" id="material"><h3>Boden, Wände, Decke</h3>
    <p class="klein grau">Tipp: Im 3D einfach auf eine Wand, den Boden oder ein Möbel tippen.</p>
    <div class="mat-tabs">${tabs.map(([k, n]) => `<button class="chip ${s === k ? 'an' : ''}" data-akt="matTab" ${d} data-t="${k}">${k.startsWith('wand:') ? `<i class="mini-farbe" style="background:${F.waende[+k[5]].fliesen ? F.waende[+k[5]].fliesen.farbe : (F.waende[+k[5]].farbe || stilMix(o).stil.wand)}"></i>` : ''}${esc(n)}</button>`).join('')}</div>
    ${inhalt}
    ${wgKarte(o, d)}
    <div class="mat-check ${K.ampel}"><b>${{ ok: '✓ Passt zusammen', gelb: '◐ Passt – mit Hinweisen', nein: '✗ Passt so eher nicht' }[K.ampel]}</b>
      <div class="farb-reihe klein-reihe">${K.farben.map((h) => `<i style="background:${h}"></i>`).join('')}</div>
      <ul>${K.punkte.map(([a, t]) => `<li class="${a}">${esc(t)}</li>`).join('')}</ul>
      <p class="klein grau">Richtwert: Bildschirmfarben weichen ab – vor dem Kauf Muster/Farbkarte im echten Licht ansehen.</p></div>
    <div class="zeile"><span style="flex:1">Boden ${esc((MUSTER.find((m) => m.id === F.boden.muster) || {}).name || 'eigenes Foto')} (${zahl(FK.m2, 1)} m²) + Wände, Material</span><b>ca. ${euro(FK.min)} – ${euro(FK.max)}</b></div>
  </section>`;
}

const matObj = (dd) => studioObj(dd);
const matZiel = (o, dd) => { const F = flaechen(o); return dd.wo === 'boden' ? F.boden : F.waende[+dd.w].fliesen; };
AKT.matTab = (dd) => { MAT.sel = dd.t; render(); };
AKT.matMuster = (dd) => aendern(() => { const z = matZiel(matObj(dd), dd); z.muster = dd.m; delete z.foto; const holz = MUSTER.find((m) => m.id === dd.m).art === 'holz'; if (holz !== FARBEN_HOLZ.some(([, h]) => h === z.farbe)) z.farbe = holz ? '#b8916a' : '#c9c8c4'; }, 'Muster gewählt');
AKT.matFarbe = (dd) => aendern(() => { const z = matZiel(matObj(dd), dd); z.farbe = dd.f; delete z.foto; }, 'Farbe gewählt');
EIN.matFarbeEigen = (v, dd) => aendern(() => { const z = matZiel(matObj(dd), dd); z.farbe = v; delete z.foto; }, 'Farbe gewählt');
AKT.matWand = (dd) => aendern(() => { flaechen(matObj(dd)).waende[+dd.w].farbe = dd.f; }, 'Wandfarbe');
EIN.matWandEigen = (v, dd) => aendern(() => { flaechen(matObj(dd)).waende[+dd.w].farbe = v; }, 'Wandfarbe');
AKT.matAlleWaende = (dd) => aendern(() => { flaechen(matObj(dd)).waende.forEach((w) => { if (!w.fliesen) w.farbe = dd.f; }); }, 'Alle Wände');
AKT.matFliesen = (dd) => aendern(() => { const W = flaechen(matObj(dd)).waende[+dd.w]; delete W.paneel; delete W.tapete; W.fliesen = { muster: 'f3060', farbe: '#f1efea', hoehe: ['bad', 'gaestewc'].includes(matObj(dd).raum) ? 'voll' : 'halb' }; }, 'Wandfliesen');
AKT.matWandFarbe = (dd) => aendern(() => { delete flaechen(matObj(dd)).waende[+dd.w].fliesen; }, 'Wand ohne Fliesen');
AKT.matFliesHoehe = (dd) => aendern(() => { flaechen(matObj(dd)).waende[+dd.w].fliesen.hoehe = dd.h; }, 'Fliesenhöhe');
AKT.matDecke = (dd) => aendern(() => { flaechen(matObj(dd)).decke.farbe = dd.f; }, 'Deckenfarbe');
AKT.matLampe = (dd) => aendern(() => { flaechen(matObj(dd)).decke.lampe = dd.l; }, 'Lampe');
EIN.matFoto = (v, dd, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 900, (url) => fotoFarbe(url, (farbe) => { aendern(() => { const z = matZiel(matObj(dd), dd); z.foto = url; z.fotoFarbe = farbe; z.cm = z.cm || (dd.wo === 'boden' && MUSTER.find((m) => m.id === z.muster)?.art === 'holz' ? [100, 100] : [30, 30]); if (MUSTER.find((m) => m.id === z.muster)?.art === 'holz') z.fugen = false; }, 'Eigenes Material per Foto'); toast('Dein Material ist im Raum – Maße der Fliese prüfen'); })); };
EIN.matFotoCm = (v, dd) => { const n = Math.round(parseZahl(v)); if (!(n >= 2 && n <= 300)) return; aendern(() => { const z = matZiel(matObj(dd), dd); z.cm = z.cm || [30, 30]; z.cm[+dd.i] = n; }, 'Fliesengröße'); };
AKT.matFotoWeg = (dd) => aendern(() => { const z = matZiel(matObj(dd), dd); delete z.foto; delete z.fotoFarbe; }, 'Foto entfernt');
EIN.matTeilFoto = (v, dd, el) => { const f = el.files && el.files[0]; if (!f) return; bildVerkleinern(f, 700, (url) => fotoFarbe(url, (farbe) => { aendern(() => { const L = losStatus(matObj(dd)); L.fotoTeile = L.fotoTeile || {}; L.fotoTeile[dd.n] = { foto: url, farbe }; }, 'Produkt per Foto'); toast(dd.n + ': dein Produkt ist im Raum'); })); };
AKT.matTeilWeg = (dd) => aendern(() => { delete losStatus(matObj(dd)).fotoTeile[dd.n]; }, 'Produktfoto entfernt');
AKT.studioInnen = () => { MAT.innen = !MAT.innen; render(); };
HILFE.matTab = 'Boden-Muster, Wandfarben, Fliesen, Decke und Lampen wählen – auch per Foto vom eigenen Material.';

/* Antippen im 3D: Fläche → Material-Karte, Möbel → ändern */
function studio3DAntippen(o, d, was) {
  if (!was) return;
  if (/^flaeche:/.test(was)) { const t = was.slice(8); MAT.sel = t === 'decke' || t === 'boden' ? t : 'wand:' + t; render(); setTimeout(() => document.getElementById('material')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); return; }
  const { v } = studioAktuell(d); const e = v && v.plan.find((x) => x.id === was);
  if (e) AKT.studioTeil(Object.assign({}, d, { n: e.n }));
}

/* ---------- Paneele & Tapeten ---------- */
const PANEELE = [
  ['lamellen', 'Akustik-Lamellen', 'Holzlamellen auf schwarzem Filz – schluckt Hall, wirkt warm. Geklebt oder geschraubt, ca. 60–120 €/m².'],
  ['hexagon', 'Hexagon-Paneele', 'Sechseckige Filz- oder Holzpaneele – Akzent und Akustik. Einzeln geklebt, ca. 80–160 €/m².'],
  ['kassetten', 'Englische Kassetten', 'Wandvertäfelung bis 90/120 cm mit Rahmenleisten, Abschlussleiste und hohem Sockel – wie im englischen Landhaus. MDF-Leisten geklebt + lackiert, ca. 80–200 €/m².'],
  ['boiserie', 'Boiserie / Stuckrahmen', 'Französisch-barocke Wandrahmen aus Stuckleisten über die ganze Höhe, mit Kranzleiste – Ton in Ton gestrichen wirkt edel. Ca. 60–150 €/m².'],
  ['nutfeder', 'Nut & Feder (Beadboard)', 'Senkrechte Profilbretter bis 90/120 cm – Landhaus- und Badstil. Ca. 40–90 €/m².']
];
const TAPETEN = [['streifen', 'Streifen'], ['damast', 'Barock / Damast'], ['geometrisch', 'Art déco'], ['botanisch', 'Botanisch'], ['karo', 'Karo / Tartan'], ['punkte', 'Terrazzo-Punkte']];
function tapeteBild(spec, px) {
  px = px || 256; const f = spec.farbe || '#d9c8b0', c = document.createElement('canvas'), x = c.getContext('2d'), hell = helligkeit(f) > 0.35, f2 = spec.farbe2 || farbVar(f, hell ? -0.22 : 0.3), R = zufall(7);
  let mx = 0.53, my = 0.53; c.width = c.height = px; x.fillStyle = f; x.fillRect(0, 0, px, px); x.fillStyle = f2; x.strokeStyle = f2;
  const m = spec.muster;
  if (m === 'streifen') { mx = 0.3; for (let i = 0; i < 4; i++) x.fillRect(i * px / 4, 0, px / 10, px); }
  else if (m === 'damast') { x.lineWidth = Math.max(2, px / 85); for (const [cx, cy] of [[px / 2, px / 2], [0, 0], [px, 0], [0, px], [px, px]]) { x.save(); x.translate(cx, cy); for (let k = 0; k < 2; k++) { x.scale(k ? -1 : 1, 1); x.beginPath(); x.moveTo(0, -px * 0.32); x.bezierCurveTo(px * 0.18, -px * 0.25, px * 0.2, -px * 0.05, px * 0.06, 0); x.bezierCurveTo(px * 0.2, px * 0.05, px * 0.18, px * 0.25, 0, px * 0.32); x.stroke(); x.beginPath(); x.arc(px * 0.1, -px * 0.12, px * 0.03, 0, 7); x.fill(); x.beginPath(); x.arc(px * 0.1, px * 0.12, px * 0.03, 0, 7); x.fill(); } x.beginPath(); x.arc(0, 0, px * 0.035, 0, 7); x.fill(); x.restore(); } }
  else if (m === 'geometrisch') { x.lineWidth = Math.max(1.5, px / 100); for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { const cx = k * px / 2, cy = r * px / 2 - (k % 2 ? px / 4 : 0); for (let q = 1; q <= 4; q++) { x.beginPath(); x.arc(cx, cy, q * px / 9, Math.PI, 2 * Math.PI); x.stroke(); } } }
  else if (m === 'botanisch') { for (let i = 0; i < 16; i++) { const a = R() * 6.3, cx = R() * px, cy = R() * px; x.save(); x.translate(cx, cy); x.rotate(a); x.beginPath(); x.ellipse(0, 0, px * 0.07, px * 0.025, 0, 0, 7); x.fill(); x.fillRect(-px * 0.09, -1, px * 0.06, 2); x.restore(); } }
  else if (m === 'karo') { x.globalAlpha = 0.45; for (let i = 0; i < 4; i++) { x.fillRect(i * px / 4, 0, px / 12, px); x.fillRect(0, i * px / 4, px, px / 12); } x.globalAlpha = 1; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(i * px / 4 + px / 6, 0); x.lineTo(i * px / 4 + px / 6, px); x.stroke(); } }
  else { for (let i = 0; i < 60; i++) { x.fillStyle = [f2, farbVar(f, -0.12), farbVar(f2, 0.2)][i % 3]; x.beginPath(); x.arc(R() * px, R() * px, px / 128 + R() * px / 40, 0, 7); x.fill(); } }
  return { c, mx, my };
}
window.tapeteBild = tapeteBild;
function tapeteVorschau(m, f) { try { return tapeteBild({ muster: m, farbe: f }, 96).c.toDataURL(); } catch (e) { return ''; } }
function paneelVorschau(t, f) {
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'), col = f || (t === 'lamellen' || t === 'hexagon' ? '#b8916a' : '#ece6dc'), dk = farbVar(col, -0.18);
  x.fillStyle = t === 'lamellen' ? '#1c1c1c' : '#ddd'; x.fillRect(0, 0, 96, 96); x.fillStyle = col;
  if (t === 'lamellen') for (let i = 0; i < 12; i++) x.fillRect(4 + i * 8, 4, 5, 88);
  else if (t === 'hexagon') { try { const mb = musterBild({ muster: 'sechseck', farbe: col }, null, 96); x.drawImage(mb.c, 0, 0, 96, 96); } catch (e) {} }
  else { x.fillRect(0, t === 'boiserie' ? 0 : 40, 96, t === 'boiserie' ? 96 : 56); x.strokeStyle = dk; x.lineWidth = 2; if (t === 'kassetten') { [10, 56].forEach((a) => x.strokeRect(a, 52, 30, 30)); x.fillStyle = dk; x.fillRect(0, 40, 96, 3); x.fillRect(0, 88, 96, 8); } else if (t === 'boiserie') { [10, 56].forEach((a) => { x.strokeRect(a, 8, 30, 46); x.strokeRect(a, 62, 30, 24); }); } else { for (let i = 6; i < 96; i += 8) { x.beginPath(); x.moveTo(i, 44); x.lineTo(i, 92); x.stroke(); } } }
  return c.toDataURL();
}
const matWand = (dd) => flaechen(matObj(dd)).waende[+dd.w];
AKT.matPaneel = (dd) => aendern(() => { const W = matWand(dd); delete W.fliesen; const holz = ['lamellen', 'hexagon'].includes(dd.t); W.paneel = { typ: dd.t, farbe: W.paneel && W.paneel.typ === dd.t ? W.paneel.farbe : (holz ? '#b8916a' : (W.farbe || '#ece6dc')), hoehe: W.paneel ? W.paneel.hoehe : '' }; }, 'Paneele');
AKT.matPaneelFarbe = (dd) => aendern(() => { matWand(dd).paneel.farbe = dd.f; }, 'Paneelfarbe');
AKT.matPaneelOpt = (dd) => aendern(() => { matWand(dd).paneel[dd.k] = dd.v; }, 'Paneele');
AKT.matPaneelWeg = (dd) => aendern(() => { delete matWand(dd).paneel; }, 'Paneele entfernt');
AKT.matTapete = (dd) => aendern(() => { const W = matWand(dd); delete W.fliesen; W.tapete = { muster: dd.t, farbe: (W.tapete && W.tapete.farbe) || W.farbe || '#d9c8b0' }; }, 'Tapete');
AKT.matTapeteFarbe = (dd) => aendern(() => { matWand(dd).tapete.farbe = dd.f; }, 'Tapetenfarbe');
AKT.matTapeteWeg = (dd) => aendern(() => { delete matWand(dd).tapete; }, 'Tapete entfernt');
const FK_ALT = flaechenKosten;
flaechenKosten = function (o) { const k = FK_ALT(o), F = flaechen(o), H = (o.hoehe || 250) / 100, P = { lamellen: [60, 120], hexagon: [80, 160], kassetten: [80, 200], boiserie: [60, 150], nutfeder: [40, 90] };
  F.waende.forEach((w, i) => { const l = (i % 2 ? o.tiefe : o.breite) / 100; if (w.paneel) { const h = ['kassetten', 'nutfeder'].includes(w.paneel.typ) ? (w.paneel.hoehe === 'hoch' ? 1.2 : 0.9) : (w.paneel.typ === 'hexagon' && w.paneel.hoehe === 'halb' ? 1.2 : H), b = w.paneel.typ === 'lamellen' && w.paneel.breite === 'streifen' ? Math.min(1.2, l) : l, pr = P[w.paneel.typ] || [50, 120]; k.min += Math.round(pr[0] * b * h / 10) * 10; k.max += Math.round(pr[1] * b * h / 10) * 10; } if (w.tapete) { k.min += Math.round(10 * l * H); k.max += Math.round(40 * l * H); } });
  return k; };
const FC_ALT = farbCheck;
farbCheck = function (o) { const r = FC_ALT(o), F = flaechen(o), tap = F.waende.filter((w) => w.tapete && w.tapete.muster !== 'streifen').length, pan = F.waende.filter((w) => w.paneel).length;
  if (tap > 1) r.punkte.push(['gelb', 'Gemusterte Tapete an mehreren Wänden – meist wirkt eine Akzentwand edler.']);
  if (tap && ['fischgraet', 'chevron', 'sechseck', 'mosaik'].includes(F.boden.muster)) r.punkte.push(['gelb', 'Muster-Tapete und gemusterter Boden zusammen – eins davon ruhiger wählen.']);
  if (pan > 2) r.punkte.push(['gelb', 'Paneele an mehr als zwei Wänden können schwer wirken – Kassetten rundum passen gut im Altbau/Landhaus.']);
  if (r.punkte.some((x) => x[0] === 'gelb') && r.ampel === 'ok') r.ampel = 'gelb';
  return r; };
function wgKarte(o, d) { if (o.raum !== 'wintergarten') return ''; return `<div class="unter">Wintergarten</div><div class="zeile wrap">${[['keine', 'Rundum Glas'], ['eine', 'Eine Seite offen'], ['alle', 'Alle Seiten offen']].map(([k, t]) => `<button class="chip ${(o.wgOffen || 'keine') === k ? 'an' : ''}" data-akt="matWgOffen" ${d} data-v="${k}">${t}</button>`).join('')}</div><p class="klein grau">Wände und Dach sind im Wintergarten aus Glas.</p>`; }
AKT.matWgOffen = (dd) => aendern(() => { matObj(dd).wgOffen = dd.v; }, 'Wintergarten');
/* Antippen im 3D: Auswahl-Blatt direkt öffnen (Wand, Boden, Decke/Lampe); Möbel → Ändern-Dialog */
MAT.blatt = false;
studio3DAntippen = function (o, d, was) {
  if (!was) return;
  if (/^flaeche:/.test(was)) { const t = was.slice(8); MAT.sel = t === 'decke' || t === 'boden' ? t : 'wand:' + t; MAT.blatt = true; render(); return; }
  const { v } = studioAktuell(d); const e = v && v.plan.find((x) => x.id === was);
  if (e) AKT.studioTeil(Object.assign({}, d, { n: e.n }));
};
const vorMatRender = render;
render = function () {
  vorMatRender();
  const ov = document.getElementById('mat-blatt'), q = document.querySelector('[data-akt="studioStift"]');
  if (!MAT.blatt || !q) { if (ov) ov.remove(); if (!q) MAT.blatt = false; return; }
  const dd = Object.assign({}, q.dataset), o = studioObj(dd), d = dd.p ? `data-p="${dd.p}"` : `data-r="${dd.r}"`;
  let el = ov; if (!el) { el = document.createElement('div'); el.id = 'mat-blatt'; el.className = 'fk-overlay an mat-blatt'; el.addEventListener('click', (e) => { if (e.target === el) { MAT.blatt = false; el.remove(); } }); document.body.appendChild(el); }
  const y = el.querySelector('.fk-blatt') ? el.querySelector('.fk-blatt').scrollTop : 0;
  const titel = MAT.sel === 'boden' ? 'Boden' : MAT.sel === 'decke' ? 'Decke & Licht' : 'Wand ' + WAND_NAMEN[+MAT.sel.split(':')[1]];
  el.innerHTML = `<div class="fk-blatt sheet" style="transform:none;max-height:55vh"><div class="spread"><h2>${titel}</h2><button class="btn sm ghost" data-akt="matBlattZu">Fertig</button></div>${materialKarte(o, d).replace('<section class="karte material" id="material">', '<section class="material">')}</div>`;
  el.querySelector('.fk-blatt').scrollTop = y;
};
AKT.matBlattZu = () => { MAT.blatt = false; render(); };
