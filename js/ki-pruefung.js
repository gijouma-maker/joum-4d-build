/* Joum 4D Build – KI-Raumprüfung (Regelwerk wie bei professionellen Planungs-KIs)
   1. Raum-Inventar: welche Objekte gehören in welchen Raum
   2. Platzierung mit Bedingungen: an der Wand, Rücken zur Wand, Tür frei, Bewegungsflächen
   3. Prüfung mit Empfehlungen: Lüftung (DIN 18017-3), Schutzbereiche, Rauchmelder …
   Die Tür liegt im Planer immer an der linken Wand, mittig (wird im 2D- und 3D-Plan angezeigt). */

/* ---------- 1. Was gehört in welchen Raum ---------- */
const NASS = ['bad', 'gaestewc'];
const VERBOTEN_ALLE_WOHN = /^WC|Dusche|Badewanne|Waschtisch|Handwaschbecken|Spiegelschrank|Handtuchheizkörper|Bodenablauf/;
const RAUM_VERBOTEN = {
  bad: /Sofa|Ecksofa|Sessel|Bett|Stehleuchte|Teppich|Esstisch|Couchtisch|TV-Board|Fernseher|Regal hoch|Kamin|Schreibtisch|Herd|Kühlschrank|Kücheninsel|Vorhang|Stuhl|Pendelleuchte|Kinosessel|Laufband/,
  gaestewc: /Sofa|Ecksofa|Sessel|Bett|Stehleuchte|Teppich|Esstisch|Couchtisch|TV|Fernseher|Regal|Kamin|Schreibtisch|Herd|Kühlschrank|Badewanne|Dusche|Waschmaschine|Vorhang|Stuhl/,
  kueche: /Sofa|Ecksofa|Bett|Badewanne|Dusche|^WC|Stehleuchte|Kamin|Laufband/,
  waschraum: /Sofa|Bett|Stehleuchte|Teppich|Couchtisch|Kamin|Fernseher/,
  keller: /Sofa|Bett|Stehleuchte|Teppich|Kamin/,
  heizungsraum: /Sofa|Bett|Stehleuchte|Teppich|Regal|Kamin|Couchtisch|Werkbank|Vorhang/,
  abstellraum: /Sofa|Bett|Stehleuchte|Teppich|Kamin/,
  garage: /Sofa|Bett|Stehleuchte|Teppich|Kamin|Couchtisch/,
  flur: /Bett|Badewanne|Dusche|^WC|Herd|Kamin|Sofa|Esstisch/,
  treppenhaus: /Bett|Sofa|Tisch|Teppich|Kamin/
};
const RAUM_ERLAUBT_NASS = ['bad', 'gaestewc', 'waschraum'];

function passt(raumId, name) {
  const r = raum(raumId) || {};
  const verb = RAUM_VERBOTEN[raumId];
  if (verb && verb.test(name)) return { ok: false, grund: `„${name}“ gehört nicht in ${r.name || 'diesen Raum'}.` };
  if (!RAUM_ERLAUBT_NASS.includes(raumId) && VERBOTEN_ALLE_WOHN.test(name) && raumId !== 'keller') return { ok: false, grund: `„${name}“ ist ein Sanitärobjekt und gehört ins Bad/WC.` };
  if (raumId !== 'kueche' && /Herd|Kochfeld|Dunstabzug|Spüle mit|Unterschrank 60|Hängeschrank 60/.test(name)) return { ok: false, grund: `„${name}“ gehört in die Küche.` };
  return { ok: true };
}

/* ---------- 2. Platzierung ---------- */
function ebene(n) {
  if (/Deckenleuchte|Spots|Einbaustrahler|Rauchmelder|Pendelleuchte|Indirektes Licht|LED|Beamer/.test(n)) return 'decke';
  if (/Spiegel|Bild|Fernseher an Wand|Hängeschrank|Spiegelschrank|Wandleuchte|Lüfter|Akustikpaneel|Leinwand|Fliesenspiegel|Thermostat|WLAN|Steckdose|Netzwerkdose|Lochwand|Tafelwand|Vorhang/.test(n)) return 'wand';
  return 'boden';
}
const FREI_IM_RAUM = /Teppich|Couchtisch|Esstisch|Kücheninsel|Spielecke|Sportboden|Hantelbank|Auto|Esstheke/;
/* Bewegungsfläche vor dem Objekt (cm) */
function vorne(n) {
  if (/^WC|Handwaschbecken|Waschtisch/.test(n)) return 60;
  if (/Dusche|Badewanne/.test(n)) return 75;
  if (/bett/i.test(n)) return 60;
  if (/Schrank|Kommode|Unterschrank|Herd|Spüle|Geschirr|Waschmaschine|Trockner|Kühlschrank/.test(n)) return 80;
  if (/Sofa|Sessel/.test(n)) return 40;
  return 30;
}
/* bevorzugte Wände: 0 oben (Installationswand), 1 rechts (gegenüber Tür), 2 unten, 3 links (Türwand) */
function wandReihenfolge(n) {
  if (/^WC|Waschtisch|Handwaschbecken|Spüle|Unterschrank|Herd|Geschirr|Hängeschrank|Spiegelschrank|Fliesenspiegel/.test(n)) return [0, 1, 2, 3];
  if (/Dusche/.test(n)) return [1, 0, 2];
  if (/Badewanne|bett/i.test(n)) return [2, 1, 0];
  if (/Lüfter/.test(n)) return [1, 0, 2];
  if (/Fernseher|TV-Board/.test(n)) return [1, 0, 2, 3];
  if (/Sofa/.test(n)) return [3, 2, 0, 1];
  return [0, 1, 2, 3];
}
function tuerZone(p) { const w = Math.min(95, Math.max(60, p.breite - 45)); return { x: 0, y: p.tiefe / 2 - 50, w, h: 100 }; }
function schneidet(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function fussabdruck(e) {
  const g = (((e.rot || 0) % 360) + 360) % 360;
  if (g % 90 === 0) { const r = g % 180 !== 0; return { x: e.x, y: e.y, w: r ? e.d : e.w, h: r ? e.w : e.d }; }
  const a = g * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
  return { x: e.x, y: e.y, w: Math.round(e.w * c + e.d * s), h: Math.round(e.w * s + e.d * c) };
}
function vorneZone(e) { // Bereich vor dem Objekt (weg von der Wand)
  const f = fussabdruck(e), c = vorne(e.n), r = ((e.rot || 0) % 360 + 360) % 360;
  if (r % 90 !== 0) return { x: f.x, y: f.y, w: 0, h: 0 };
  if (r === 0) return { x: f.x, y: f.y + f.h, w: f.w, h: c };
  if (r === 90) return { x: f.x - c, y: f.y, w: c, h: f.h };
  if (r === 180) return { x: f.x, y: f.y - c, w: f.w, h: c };
  return { x: f.x + f.w, y: f.y, w: c, h: f.h };
}

function platzieren(p, k) {
  const n = k[0], w = k[2], d = Math.max(k[3], 4), eb = ebene(n);
  const andere = p.plan.filter((e) => ebene(e.n) === eb && !e.gruppe);
  const tz = tuerZone(p);
  const frei = (cand) => {
    const f = fussabdruck(cand);
    if (f.x < 0 || f.y < 0 || f.x + f.w > p.breite || f.y + f.h > p.tiefe) return false;
    if (andere.some((e) => schneidet(f, fussabdruck(e)))) return false;
    if (typeof fensterKonflikt === 'function' && fensterKonflikt(p, f, n, k[4], eb)) return false; // nichts Hohes/keine Dusche vors Fenster
    if (eb === 'decke') return true;
    if (eb === 'wand') return !(f.x < 15 && Math.abs(f.y + f.h / 2 - p.tiefe / 2) < 60); // nicht über/in der Tür
    if (schneidet(f, tz)) return false;
    if (andere.some((e) => !FREI_IM_RAUM.test(e.n) && schneidet(f, vorneZone(e)))) return false; // nicht in die Bewegungsfläche anderer
    if (!istTisch(n) && !/Teppich/.test(n) && andere.some((e) => istTisch(e.n) && schneidet(f, { x: fussabdruck(e).x - 100, y: fussabdruck(e).y - 100, w: fussabdruck(e).w + 200, h: fussabdruck(e).h + 200 }))) return false; // Essplatz frei halten
    if (!FREI_IM_RAUM.test(n)) {
      const v = vorneZone(Object.assign({ n }, cand));
      if (v.x < 0 || v.y < 0 || v.x + v.w > p.breite || v.y + v.h > p.tiefe) return false;
      if (andere.some((e) => schneidet(v, fussabdruck(e)))) return false;
    }
    return true;
  };
  // Stuhl: zuerst an einen Tisch
  if (/^Stuhl/.test(n)) { const t = p.plan.find((e) => istTisch(e.n)); if (t) { const belegt = p.plan.filter((e) => /^Stuhl/.test(e.n)); const frei2 = stuehleFuer(t).find((s) => !belegt.some((b) => Math.abs(b.x - s.x) < 20 && Math.abs(b.y - s.y) < 20)); if (frei2) return { x: frei2.x, y: frei2.y, rot: frei2.rot, gruppe: t.id }; } }
  // Nachttische links und rechts vom Bett
  if (/Nachttisch/.test(n)) { const bett = p.plan.find((e) => /bett/i.test(e.n)); if (bett) { const f = fussabdruck(bett), r = bett.rot || 0; const kand = r % 180 === 0 ? [{ x: f.x - w - 2, y: r === 0 ? f.y : f.y + f.h - d }, { x: f.x + f.w + 2, y: r === 0 ? f.y : f.y + f.h - d }] : [{ x: r === 90 ? f.x + f.w - d : f.x, y: f.y - w - 2 }, { x: r === 90 ? f.x + f.w - d : f.x, y: f.y + f.h + 2 }]; for (const c of kand) { const cc = Object.assign(c, { w, d, rot: r }); if (frei(cc)) return cc; } } }
  // Fernseher über das TV-Board
  if (/Fernseher an Wand/.test(n)) { const tb = p.plan.find((e) => /TV-Board/.test(e.n)); if (tb) { const f = fussabdruck(tb), r = tb.rot || 0; return r % 180 ? { x: f.x + (r === 90 ? f.w - d : 0), y: f.y + (f.h - w) / 2, rot: r } : { x: f.x + (f.w - w) / 2, y: f.y + (r === 180 ? f.h - d : 0), rot: r }; } }
  // Spiegel/Spiegelschrank über den Waschtisch
  if (/Spiegelschrank|^Spiegel$/.test(n)) { const wt = p.plan.find((e) => /Waschtisch|Handwaschbecken/.test(e.n)); if (wt) return { x: wt.x + ((wt.rot % 180 ? wt.d : wt.w) - (wt.rot % 180 ? d : w)) / 2, y: wt.y, rot: wt.rot || 0 }; }
  // Pendelleuchte über den Esstisch
  if (/Pendelleuchte/.test(n)) { const t = p.plan.find((e) => istTisch(e.n)) || p.plan.find((e) => /Kücheninsel/.test(e.n)); if (t) { const f = fussabdruck(t); return { x: f.x + (f.w - w) / 2, y: f.y + (f.h - d) / 2, rot: 0 }; } }
  // Esstisch: mittig mit 110 cm ringsum; Insel: 110 cm Abstand zur Küchenzeile
  if (istTisch(n) || /Kücheninsel/.test(n)) {
    const rand = istTisch(n) ? 110 : 100; // Stuhl 50 + Durchgang 60 bzw. Abstand Insel–Zeile
    const kandidaten = [];
    for (const rot of [0, 90]) {
      const ew = rot ? d : w, ed = rot ? w : d;
      for (let x = rand - 10; x + ew + rand - 10 <= p.breite; x += 5) for (let y = rand - 10; y + ed + rand - 10 <= p.tiefe; y += 5) {
        const zone = { x: x - rand + 10, y: y - rand + 10, w: ew + 2 * rand - 20, h: ed + 2 * rand - 20 };
        if (schneidet(zone, tz) || andere.some((e) => schneidet(zone, fussabdruck(e)))) continue;
        const mx = Math.abs(x + ew / 2 - p.breite / 2) + Math.abs(y + ed / 2 - p.tiefe / 2);
        kandidaten.push({ x, y, w, d, rot, m: mx });
      }
    }
    if (kandidaten.length) { kandidaten.sort((a, b) => a.m - b.m); const c = kandidaten[0]; delete c.m; return c; }
    if (istTisch(n)) return { x: Math.max(0, (p.breite - w) / 2), y: Math.max(0, (p.tiefe - d) / 2), rot: 0, eng: true };
  }
  if (eb === 'decke' || FREI_IM_RAUM.test(n)) {
    for (let r = 0; r < Math.max(p.breite, p.tiefe); r += 10) for (const [dx, dy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]]) {
      const c = { x: Math.round((p.breite - w) / 2 + dx), y: Math.round((p.tiefe - d) / 2 + dy), w, d, rot: 0 };
      if (frei(c)) return c;
    }
  }
  let reihen = wandReihenfolge(n);
  if (p._wandFolge) reihen = p._wandFolge.concat(reihen.filter((w) => !p._wandFolge.includes(w)));
  if (p._wandDreh) reihen = reihen.map((w) => (w + p._wandDreh) % 4).concat(reihen.filter((w) => !reihen.map((x) => (x + p._wandDreh) % 4).includes(w)));
  const sofa = p.plan.find((e) => /Sofa/.test(e.n));
  if (/TV-Board|Fernseher/.test(n) && sofa) { const ws = [0, 90, 180, 270].indexOf(((sofa.rot || 0) % 360 + 360) % 360); reihen = [(ws + 2) % 4].concat(reihen.filter((x) => x !== (ws + 2) % 4)); }
  for (const wand of reihen) {
    const rot = [0, 90, 180, 270][wand], ew = rot % 180 ? d : w, ed = rot % 180 ? w : d;
    const laenge = wand % 2 ? p.tiefe : p.breite, gr = wand % 2 ? ed : ew;
    const stellen = [];
    for (let s = 0; s <= laenge - gr; s += 10) stellen.push(s);
    if (/Dusche|Badewanne/.test(n)) stellen.sort((a, b) => Math.min(b, laenge - gr - b) - Math.min(a, laenge - gr - a)).reverse();
    for (const s of stellen) {
      const c = wand === 0 ? { x: s, y: 0 } : wand === 1 ? { x: p.breite - ew, y: s } : wand === 2 ? { x: s, y: p.tiefe - ed } : { x: 0, y: s };
      Object.assign(c, { w, d, rot });
      if (frei(c)) return c;
    }
  }
  return { x: Math.max(0, (p.breite - w) / 2), y: Math.max(0, (p.tiefe - d) / 2), rot: 0, eng: true };
}

/* ---------- 3. Prüfung & Empfehlungen ---------- */
function pruefen(p) {
  const r = raum(p.raum) || {}, plan = p.plan || [], out = [];
  const add = (stufe, text, akt) => out.push({ stufe, text, akt });
  plan.forEach((e) => { const t = passt(p.raum, e.n); if (!t.ok) add('fehler', t.grund, { akt: 'kiEntfernen', id: e.id, label: 'Entfernen' }); });
  const boden = plan.filter((e) => ebene(e.n) === 'boden' && !e.gruppe);
  for (let i = 0; i < boden.length; i++) for (let j = i + 1; j < boden.length; j++) if (schneidet(fussabdruck(boden[i]), fussabdruck(boden[j]))) add('fehler', `„${boden[i].n}“ und „${boden[j].n}“ stehen übereinander.`);
  boden.forEach((e) => { if (schneidet(fussabdruck(e), tuerZone(p))) add('fehler', `„${e.n}“ blockiert die Tür (Tür links in der Mitte).`); });
  if (p.fensterPos && typeof fensterKonflikt === 'function') plan.forEach((e) => { if (!e.gruppe && fensterKonflikt(p, fussabdruck(e), e.n, e.h, ebene(e.n))) add('warnung', `„${e.n}“ steht vor dem Fenster – ${fensterGrund(e.n, e.h, ebene(e.n))}. Besser an eine andere Wand stellen.`); });
  boden.forEach((e) => { const v = vorneZone(e); const im = v.x >= -1 && v.y >= -1 && v.x + v.w <= p.breite + 1 && v.y + v.h <= p.tiefe + 1; const zu = boden.find((o) => o !== e && schneidet(v, fussabdruck(o)) && !FREI_IM_RAUM.test(o.n)); if (!im || zu) add('warnung', `Vor „${e.n}“ fehlen ${vorne(e.n)} cm Bewegungsfläche${zu ? ' (' + zu.n + ' im Weg)' : ' (zu nah an der Wand gegenüber)'}.`); });
  if (NASS.includes(p.raum) || p.raum === 'waschraum') {
    const luefter = plan.find((e) => /Lüfter/.test(e.n));
    if (p.fenster === undefined) add('frage', 'Hat der Raum ein Fenster nach draußen?', { frage: 'fenster' });
    if (p.fenster === false && !luefter) add('fehler', 'Kein Fenster und kein Lüfter: Ein innenliegendes Bad/WC braucht eine Entlüftung nach DIN 18017-3 – sonst Schimmel.', { akt: 'kiLuefter', id: p.id, label: 'Lüfter fachgerecht einplanen' });
    if (luefter) {
      const f = fussabdruck(luefter), cx = f.x + f.w / 2, cy = f.y + f.h / 2, dT = Math.hypot(cx - 0, cy - p.tiefe / 2);
      if (dT < Math.min(120, p.breite * 0.6)) add('fehler', 'Der Lüfter sitzt zu nah an der Tür – die Luft würde direkt wieder abgesaugt. Richtig: gegenüber der Tür, oben an Wand oder Decke, nahe Dusche/WC.', { akt: 'kiLuefter', id: p.id, label: 'Lüfter richtig setzen' });
      else add('ok', 'Lüfter gegenüber der Tür – die Luft strömt quer durch den Raum.');
      add('info', 'Abluftleitung (meist DN 100) nach draußen führen – über Dach oder Außenwand mit Rückstauklappe, nicht in den Dachboden, Schacht oder Kamin. Im kalten Bereich gedämmt (Kondenswasser). Lüfter mit Nachlauf/Feuchtesensor; Anschluss durch Elektrofachkraft.');
    }
    if (p.fenster === false || luefter) {
      if (p.tuer === undefined) add('frage', 'Hat die Badtür unten einen Spalt oder ein Lüftungsgitter?', { frage: 'tuer' });
      if (p.tuer === 'keine') add('fehler', 'Die Tür hat keine Nachströmöffnung. Nötig sind mindestens 150 cm² frei – z. B. Lüftungsgitter im Türblatt, Tür unten kürzen oder Zargenlüftung.', { akt: 'kiTuerAnleitung', label: 'Anleitung: Tür nachrüsten' });
      if (p.tuer === 'spalt') add('warnung', 'Ein schmaler Türspalt reicht oft nicht für 150 cm². Prüfen: Türbreite × Spalthöhe (z. B. 80 cm × 1 cm = 80 cm² → zu wenig). Besser Lüftungsgitter oder Zargenlüftung.', { akt: 'kiTuerAnleitung', label: 'Anleitung ansehen' });
      if (p.tuer === 'gitter') add('ok', 'Tür hat ein Lüftungsgitter – die Luft kann nachströmen.');
    }
    const nassObj = plan.filter((e) => /Dusche|Badewanne/.test(e.n));
    plan.filter((e) => /Steckdose/.test(e.n)).forEach((s) => { const fs = fussabdruck(s); nassObj.forEach((n) => { const fn = fussabdruck(n), dx = Math.max(0, fn.x - (fs.x + fs.w), fs.x - (fn.x + fn.w)), dy = Math.max(0, fn.y - (fs.y + fs.h), fs.y - (fn.y + fn.h)); if (Math.hypot(dx, dy) < 60) add('fehler', `Steckdose zu nah an ${n.n} (Schutzbereich 1/2, mind. 60 cm Abstand).`); }); });
  }
  if (['schlafzimmer', 'kinderzimmer', 'babyzimmer', 'jugendzimmer', 'gaestezimmer', 'flur'].includes(p.raum) && !plan.some((e) => /Rauchmelder/.test(e.n))) add('warnung', 'Rauchmelder fehlt – Pflicht in Schlaf-, Kinderzimmern und Fluren.', { akt: 'kiAdd', id: p.id, name: 'Rauchmelder', label: 'Rauchmelder hinzufügen' });
  if (['kinderzimmer', 'babyzimmer'].includes(p.raum) && plan.some((e) => /Regal|Schrank|Kommode/.test(e.n))) add('info', 'Regale, Schränke und Kommoden im Kinderzimmer immer kippsicher an der Wand befestigen.');
  if (p.raum === 'kueche') { const herd = plan.find((e) => /Herd|Kochfeld/.test(e.n)), kue = plan.find((e) => /Kühlschrank/.test(e.n)); if (herd && kue && Math.abs(herd.x - kue.x) + Math.abs(herd.y - kue.y) < 70) add('warnung', 'Herd direkt neben dem Kühlschrank – Wärmeschutz oder Abstand einplanen.'); }
  if (p.raum === 'kueche') kuechenPruefung(p, add);
  essPruefung(p, add);
  if (!out.some((x) => x.stufe === 'fehler' || x.stufe === 'warnung')) add('ok', plan.length ? 'Alles passt: Objekte gehören in den Raum, Tür frei, Bewegungsflächen eingehalten.' : 'Noch keine Objekte – füge welche aus dem Katalog hinzu.');
  return out;
}

/* Lüfter fachgerecht: gegenüber der Tür (rechte Wand), oben, nahe Dusche/WC */
AKT.kiLuefter = (d) => {
  const p = projekt(d.id || S.aktivId); if (!p) return;
  aendern(() => {
    p.plan = p.plan.filter((e) => !/Lüfter/.test(e.n));
    const ziel = p.plan.find((e) => /Dusche/.test(e.n)) || p.plan.find((e) => /^WC/.test(e.n));
    let y = p.tiefe / 2; if (ziel) { const f = fussabdruck(ziel); y = f.y + f.h / 2; }
    y = Math.min(p.tiefe - 20, Math.max(5, y - 7));
    p.plan.push({ id: uid(), n: 'Lüfter', g: 'Technik', w: 15, d: 10, h: 15, hint: 'Gegenüber der Tür, oben (ca. 2,10–2,20 m) oder Decke, nahe Dusche/WC. Abluft DN 100 nach draußen über Dach/Außenwand mit Rückstauklappe. Nachlauf/Feuchtesensor. Anschluss: Elektrofachkraft.', x: p.breite - 10, y, rot: 90 });
    if (p.fenster === undefined) p.fenster = false;
  }, 'Lüfter eingeplant');
  toast('Lüfter gegenüber der Tür eingeplant');
};
AKT.kiEntfernen = (d) => aendern(() => { const p = aktivesProjekt(); p.plan = p.plan.filter((e) => e.id !== d.id); });
AKT.kiAdd = (d) => { const p = projekt(d.id), k = katalogFuer(p).find((x) => x[0] === d.name) || BASIS.technik.find((x) => x[0] === d.name); if (!k) return; const pl = platzieren(p, k); aendern(() => p.plan.push({ id: uid(), n: k[0], g: k[1], w: k[2], d: Math.max(k[3], 4), h: k[4], hint: k[5], x: pl.x, y: pl.y, rot: pl.rot })); };
AKT.kiAntwort = (d) => aendern(() => { const p = projekt(d.id); p[d.f] = d.v === 'ja' ? true : d.v === 'nein' ? false : d.v; });
AKT.kiTuerAnleitung = () => geh('#/anleitung/tuer_lueftung?p=' + (S.aktivId || ''));

function kiKarte(p) {
  const liste = pruefen(p);
  const symbol = { fehler: '✕', warnung: '!', ok: '✓', info: 'i', frage: '?' };
  return `<section class="karte ki-karte"><div class="zeile"><b style="flex:1">KI-Raumprüfung</b><span class="klein">${liste.filter((x) => x.stufe === 'fehler').length} Fehler · ${liste.filter((x) => x.stufe === 'warnung').length} Hinweise</span></div>
    ${liste.map((x) => `<div class="ki-zeile ${x.stufe}"><span class="ki-sym">${symbol[x.stufe]}</span><div style="flex:1">${esc(x.text)}
      ${x.akt && x.akt.frage === 'fenster' ? `<div class="zeile"><button class="chip" data-akt="kiAntwort" data-id="${p.id}" data-f="fenster" data-v="ja">Ja, Fenster</button><button class="chip" data-akt="kiAntwort" data-id="${p.id}" data-f="fenster" data-v="nein">Nein, innenliegend</button></div>` : ''}
      ${x.akt && x.akt.frage === 'tuer' ? `<div class="zeile"><button class="chip" data-akt="kiAntwort" data-id="${p.id}" data-f="tuer" data-v="gitter">Lüftungsgitter</button><button class="chip" data-akt="kiAntwort" data-id="${p.id}" data-f="tuer" data-v="spalt">Nur Spalt</button><button class="chip" data-akt="kiAntwort" data-id="${p.id}" data-f="tuer" data-v="keine">Nichts</button></div>` : ''}
      ${x.akt && x.akt.akt ? `<button class="chip" data-akt="${x.akt.akt}" data-id="${x.akt.id || p.id}" ${x.akt.name ? `data-name="${esc(x.akt.name)}"` : ''}>${esc(x.akt.label)}</button>` : ''}</div></div>`).join('')}
    <div class="klein">Regelbasierte Prüfung (Raum-Inventar, Tür, Bewegungsflächen, Lüftung DIN 18017-3, Schutzbereiche). Erkennung aus Fotos/Grundriss-Bildern folgt mit dem KI-Server.</div></section>`;
}

/* Kataloge bereinigen: nur Objekte, die in den Raum gehören */
RAEUME.forEach((r) => { r.katalog = r.katalog.filter((k) => passt(r.id, k[0]).ok); });

/* ---------- Essgruppe: Tisch + passende Stühle ringsum (wie Profi-Planer) ---------- */
function istTisch(n) { return /^Esstisch/.test(n); }
function stuehleFuer(tisch) {
  const f = fussabdruck(tisch), lang = f.w >= f.h, L = lang ? f.w : f.h, B = lang ? f.h : f.w;
  const proSeite = Math.max(1, Math.floor(L / 60)), enden = B >= 80 && L >= 160 ? 2 : 0;
  const st = [], sw = 45, sd = 50, rein = 12; // Stühle 12 cm unter den Tisch geschoben
  for (let i = 0; i < proSeite; i++) {
    const a = (L / proSeite) * (i + 0.5) - sw / 2;
    if (lang) { st.push({ x: f.x + a, y: f.y - sd + rein, rot: 0 }); st.push({ x: f.x + a, y: f.y + f.h - rein, rot: 180 }); }
    else { st.push({ x: f.x - sd + rein, y: f.y + a, rot: 270, quer: true }); st.push({ x: f.x + f.w - rein, y: f.y + a, rot: 90, quer: true }); }
  }
  if (enden) { if (lang) { st.push({ x: f.x - sd + rein, y: f.y + B / 2 - sw / 2, rot: 270, quer: true }); st.push({ x: f.x + f.w - rein, y: f.y + B / 2 - sw / 2, rot: 90, quer: true }); } else { st.push({ x: f.x + B / 2 - sw / 2, y: f.y - sd + rein, rot: 0 }); st.push({ x: f.x + B / 2 - sw / 2, y: f.y + f.h - rein, rot: 180 }); } }
  // rot 90/270: Fußabdruck ist d×w → Position korrigieren
  return st.map((s) => ({ id: uid(), n: 'Stuhl', g: 'Möbel', w: sw, d: sd, h: 90, hint: '', x: Math.round(s.x), y: Math.round(s.y), rot: s.rot, gruppe: tisch.id }));
}
/* Passende Tischgröße für den Raum wählen: um den Tisch 110 cm (Stuhl + Durchgang) */
function tischFuerRaum(p, kat) {
  const tische = kat.filter((k) => istTisch(k[0])).sort((a, b) => b[2] * b[3] - a[2] * a[3]);
  return tische.find((k) => !platzieren(p, k).eng) || null; // größter Tisch, der mit Stühlen + Durchgang passt
}
function essgruppeHinzufuegen(p, tisch) { p.plan = p.plan.filter((e) => e.gruppe !== tisch.id); stuehleFuer(tisch).forEach((s) => p.plan.push(s)); }

/* ---------- Küche: Insel-Ausstattung → nötige Leitungen ---------- */
const INSEL_OPT = [['kochfeld', 'Kochfeld'], ['mulde', 'Kochfeld mit Muldenlüfter'], ['haube', 'Inselhaube (Decke)'], ['spuele', 'Spüle'], ['gs', 'Geschirrspüler'], ['steckdosen', 'Steckdosen']];
AKT.inselOpt = (d) => aendern(() => { const p = projekt(d.id), e = p.plan.find((x) => x.id === d.e); e.aus = e.aus || {}; e.aus[d.o] = !e.aus[d.o]; if (d.o === 'mulde' && e.aus.mulde) { e.aus.kochfeld = true; e.aus.haube = false; } if (d.o === 'haube' && e.aus.haube) { e.aus.kochfeld = true; e.aus.mulde = false; } }, 'Insel-Ausstattung');
function inselLeitungen(e) {
  const a = e.aus || {}, l = [];
  if (a.kochfeld || a.mulde) l.push(['strom', 'Kochfeld: Starkstrom 400 V (NYM-J 5×2,5 mm², eigener Stromkreis) aus dem Boden in die Insel – vor dem Estrich im Leerrohr verlegen. Nur Elektrofachkraft.']);
  if (a.mulde) l.push(['luft', 'Muldenlüfter: entweder Abluft (Flachkanal im Bodenaufbau bis zur Außenwand, Mauerkasten mit Rückstauklappe, Zuluft nötig) oder geführte Umluft (Umluftbox mit Aktivkohlefilter, Ausblas über Sockelgitter). Ungeführte Umluft vermeiden – Feuchte und Fett im Sockel.']);
  if (a.haube) l.push(['luft', 'Inselhaube: tragfähige Deckenbefestigung, Strom an der Decke, Abluftrohr in der Decke nach außen – oder Umluft mit Filter.']);
  if (a.spuele || a.gs) l.push(['wasser', `${a.spuele ? 'Spüle' : ''}${a.spuele && a.gs ? ' und ' : ''}${a.gs ? 'Geschirrspüler' : ''}: Kalt-/Warmwasser und Abwasser DN 50 durch den Boden. Gefälle mind. 1 %, besser 2 % im Estrich bis zur Fallleitung – Aufbauhöhe prüfen, sonst Kleinhebeanlage.`]);
  if (a.gs) l.push(['strom', 'Geschirrspüler: eigener Stromkreis 230 V (3×2,5 mm²), Aquastop-Schlauch.']);
  if (a.steckdosen || a.kochfeld || a.mulde) l.push(['strom', 'Steckdosen an der Insel: Zuleitung ebenfalls aus dem Boden (Bodendose/Leerrohr).']);
  return l;
}
function kuechenPruefung(p, add) {
  const plan = p.plan || [];
  const insel = plan.find((e) => /Kücheninsel/.test(e.n));
  if (insel) {
    const ls = inselLeitungen(insel);
    if (!ls.length) add('frage', 'Was kommt in die Kücheninsel? Insel antippen und Ausstattung wählen – die App zeigt dann die nötigen Leitungen.');
    ls.forEach(([art, t]) => add('info', '⟂ Leitung in den Boden: ' + t));
    if (ls.length) add('warnung', 'Insel-Leitungen müssen VOR dem Estrich bzw. Bodenbelag liegen – erst Installationsplan, dann Boden.');
    const zeile = plan.filter((e) => /Unterschrank|Spüle|Herd|Kühlschrank|Geschirr/.test(e.n));
    const fi = fussabdruck(insel);
    zeile.forEach((z) => { const fz = fussabdruck(z), dx = Math.max(0, fz.x - (fi.x + fi.w), fi.x - (fz.x + fz.w)), dy = Math.max(0, fz.y - (fi.y + fi.h), fi.y - (fz.y + fz.h)); const d = Math.max(dx, dy); if (d > 0 && d < 100) add('warnung', `Zwischen Insel und „${z.n}“ nur ${Math.round(d)} cm – empfohlen 100–120 cm.`); });
  }
  const herd = plan.find((e) => /Herd|Kochfeld/.test(e.n));
  if (herd && !plan.some((e) => /Dunstabzug|Inselhaube/.test(e.n)) && !(insel && insel.aus && (insel.aus.mulde || insel.aus.haube))) add('warnung', 'Kochfeld ohne Dunstabzug – Abzugshaube, Muldenlüfter oder Inselhaube einplanen (Abluft braucht Zuluft; mit Kaminofen nur mit Fensterkontakt/Unterdruckwächter).', { akt: 'kiAdd', id: p.id, name: 'Dunstabzug', label: 'Dunstabzug ergänzen' });
  if (herd) add('info', 'Neben dem Kochfeld links und rechts ca. 40 cm Ablage, nicht direkt an die Wand oder neben einen Hochschrank.');
  const spuele = plan.find((e) => /Spüle/.test(e.n)), gs = plan.find((e) => /Geschirrspüler/.test(e.n));
  if (spuele && gs) { const a = fussabdruck(spuele), b = fussabdruck(gs); if (Math.hypot(a.x - b.x, a.y - b.y) > 120) add('warnung', 'Geschirrspüler direkt neben die Spüle stellen – kurze Wasser- und Abwasserwege.'); }
  if (spuele) add('info', 'Wasseranschluss: Kalt/Warm mit Eckventilen, Abfluss DN 50 mit 2 % Gefälle; Geschirrspüler-Ablauf hoch genug anschließen.');
}
function essPruefung(p, add) {
  const plan = p.plan || [];
  plan.filter((e) => istTisch(e.n)).forEach((t) => {
    const st = plan.filter((e) => e.gruppe === t.id || (/^Stuhl/.test(e.n) && schneidet(fussabdruck(e), { x: fussabdruck(t).x - 60, y: fussabdruck(t).y - 60, w: fussabdruck(t).w + 120, h: fussabdruck(t).h + 120 })));
    const soll = stuehleFuer(t).length;
    if (!st.length) add('fehler', `„${t.n}“ hat keine Stühle.`, { akt: 'kiStuehle', id: t.id, label: soll + ' Stühle ergänzen' });
    const f = fussabdruck(t), um = { x: f.x - 100, y: f.y - 100, w: f.w + 200, h: f.h + 200 };
    if (um.x < -20 || um.y < -20 || um.x + um.w > p.breite + 20 || um.y + um.h > p.tiefe + 20) add('warnung', `Um „${t.n}“ ist zu wenig Platz (Stuhl + 60–80 cm Durchgang). Kleineren Tisch wählen oder Tisch mittiger stellen.`);
    if (schneidet(um, tuerZone(p))) add('warnung', 'Der Essplatz liegt im Bereich der Tür – Stühle könnten die Tür blockieren.');
  });
  plan.filter((e) => /^Stuhl/.test(e.n) && !e.gruppe && !plan.some((t) => istTisch(t.n) && schneidet(fussabdruck(e), { x: fussabdruck(t).x - 60, y: fussabdruck(t).y - 60, w: fussabdruck(t).w + 120, h: fussabdruck(t).h + 120 }))).forEach((e) => add('warnung', 'Ein Stuhl steht einzeln ohne Tisch.', { akt: 'kiEntfernen', id: e.id, label: 'Entfernen' }));
}
AKT.kiStuehle = (d) => aendern(() => { const p = aktivesProjekt(), t = p.plan.find((e) => e.id === d.id); if (t) essgruppeHinzufuegen(p, t); }, 'Stühle ergänzt');
