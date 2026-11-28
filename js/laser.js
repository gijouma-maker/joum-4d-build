/* Joum 4D Build – Laser-Entfernungsmesser per Bluetooth (Web Bluetooth, Chrome/Android, kostenlos)
   Unterstützt: Leica DISTO (Bluetooth Smart) und Bosch GLM … C (z. B. GLM 50 C, 50-27 C/CG, 100 C).
   Messwert landet automatisch: in der Skizze an der gewählten Wand, im gerade angetippten Eingabefeld – oder als „letzter Messwert“.
   Geräte mit Tastatur-Modus (HID) tippen den Wert ohnehin direkt ins aktive Feld. */

const LASER_DIENSTE = {
  leica: '3ab10100-f831-4395-b29d-570977d5bf94',
  bosch: '02a6c0d0-0451-4000-b000-fb3210111989'
};
const LASER = { geraet: null, typ: '', name: '', ziel: null, letzte: null, zuletztZeit: 0 };

function laserMoeglich() { return !!(navigator.bluetooth && navigator.bluetooth.requestDevice); }
/* Leica: 4 Byte float32, little endian, Meter */
function leicaWert(dv) { if (!dv || dv.byteLength < 4) return null; const m = dv.getFloat32(0, true); return m > 0.02 && m < 400 ? m : null; }
/* Bosch: Rahmen beginnt mit C0 55 10 06, float32 little endian ab Byte 7, Meter */
function boschWert(dv) {
  if (!dv || dv.byteLength < 11) return null;
  if (dv.getUint8(0) !== 0xC0 || dv.getUint8(1) !== 0x55 || dv.getUint8(2) !== 0x10 || dv.getUint8(3) !== 0x06) return null;
  const m = dv.getFloat32(7, true); return m > 0.02 && m < 400 ? m : null;
}

async function laserVerbinden() {
  if (!laserMoeglich()) {
    info(/iPhone|iPad/.test(navigator.userAgent)
      ? 'Bluetooth-Laser geht auf dem iPhone im Browser leider nicht (Apple erlaubt Web-Bluetooth nicht). Tipp: Viele Laser haben einen „Tastatur-Modus“ – dann tippt der Laser den Wert direkt ins angetippte Feld.'
      : 'Bluetooth geht hier nicht. Bitte die App in Chrome öffnen (joum-4d-build.pages.dev), Bluetooth und Standort am Handy einschalten.');
    return;
  }
  try {
    const geraet = await navigator.bluetooth.requestDevice({
      filters: [{ services: [LASER_DIENSTE.leica] }, { services: [LASER_DIENSTE.bosch] }, { namePrefix: 'DISTO' }, { namePrefix: 'GLM' }, { namePrefix: 'Bosch' }, { namePrefix: 'PLR' }],
      optionalServices: [LASER_DIENSTE.leica, LASER_DIENSTE.bosch, 'battery_service']
    });
    toast('Verbinde mit ' + (geraet.name || 'Laser') + ' …');
    const server = await geraet.gatt.connect();
    geraet.addEventListener('gattserverdisconnected', () => { LASER.geraet = null; laserStatus(); toast('Laser getrennt'); });
    let typ = '';
    try {
      const dienst = await server.getPrimaryService(LASER_DIENSTE.leica);
      const merkmale = await dienst.getCharacteristics();
      for (const m of merkmale) {
        if (!(m.properties.notify || m.properties.indicate)) continue;
        try { await m.startNotifications(); m.addEventListener('characteristicvaluechanged', (e) => { if (/3ab10101/i.test(e.target.uuid) || /3ab1010d/i.test(e.target.uuid)) laserWert(leicaWert(e.target.value)); }); } catch (e) {}
      }
      typ = 'leica';
    } catch (e) {}
    if (!typ) {
      const dienst = await server.getPrimaryService(LASER_DIENSTE.bosch);
      const m = await dienst.getCharacteristic('02a6c0d1-0451-4000-b000-fb3210111989');
      await m.startNotifications();
      m.addEventListener('characteristicvaluechanged', (e) => laserWert(boschWert(e.target.value)));
      const befehl = new Uint8Array([0xC0, 0x55, 0x02, 0x01, 0x00, 0x1A]); // Messwerte automatisch senden
      try { await (m.writeValueWithoutResponse ? m.writeValueWithoutResponse(befehl) : m.writeValue(befehl)); } catch (e) { try { await m.writeValue(befehl); } catch (e2) {} }
      typ = 'bosch';
    }
    Object.assign(LASER, { geraet, typ, name: geraet.name || (typ === 'leica' ? 'Leica DISTO' : 'Bosch GLM') });
    laserStatus(); sprich('Laser verbunden. Miss einfach – der Wert kommt automatisch in die App.', true);
    toast('📏 ' + LASER.name + ' verbunden – einfach messen');
  } catch (e) {
    if (e && e.name === 'NotFoundError') return; // Auswahl abgebrochen
    info('Der Laser konnte nicht verbunden werden. Bluetooth am Laser einschalten (Bluetooth-Taste), nah ans Handy halten und nochmal versuchen. Unterstützt: Leica DISTO und Bosch GLM … C.');
  }
}

/* Ein Messwert kommt an → dorthin, wo er gebraucht wird */
function laserWert(m) {
  if (!m) return;
  const jetzt = Date.now(); if (LASER.letzte && Math.abs(LASER.letzte - m) < 0.0005 && jetzt - LASER.zuletztZeit < 800) return; // doppelte Meldung
  LASER.letzte = m; LASER.zuletztZeit = jetzt; laserStatus();
  try { navigator.vibrate && navigator.vibrate(25); } catch (e) {}
  const text = zahl(Math.round(m * 1000) / 1000) + ' m';
  if (LASER.ziel) { LASER.ziel(m); sprich(text.replace('.', ','), true); return; }
  const el = document.activeElement;
  if (el && el.tagName === 'INPUT' && (el.inputMode === 'decimal' || el.inputMode === 'numeric' || el.type === 'number')) {
    const inCm = /\(cm\)|cm/i.test((el.closest('label') || {}).textContent || '') || el.inputMode === 'numeric';
    el.value = inCm ? String(Math.round(m * 100)) : zahl(Math.round(m * 1000) / 1000);
    el.dispatchEvent(new Event('change', { bubbles: true }));
    toast('📏 ' + text + ' eingetragen'); sprich(text, true); return;
  }
  toast('📏 Messwert ' + text + ' – Feld antippen und „Einfügen“'); laserStatus();
}
function laserStatus() {
  let c = document.getElementById('laser-chip');
  if (!LASER.geraet) { if (c) c.remove(); return; }
  if (!c) { c = document.createElement('button'); c.id = 'laser-chip'; c.className = 'laser-chip'; c.dataset.akt = 'laserEinfuegen'; document.body.appendChild(c); }
  c.textContent = '📏 ' + LASER.name + (LASER.letzte ? ' · ' + zahl(Math.round(LASER.letzte * 1000) / 1000) + ' m' : ' · bereit');
}
AKT.laserVerbinden = () => laserVerbinden();
AKT.laserEinfuegen = () => {
  if (!LASER.letzte) { toast('Noch kein Messwert – am Laser messen'); return; }
  const felder = [...document.querySelectorAll('input[inputmode="decimal"], input[inputmode="numeric"]')];
  const leer = felder.find((f) => !f.value) || felder[0];
  if (!leer) { toast('Kein Eingabefeld auf dieser Seite'); return; }
  leer.focus(); laserWert(LASER.letzte + 0.0000001);
};
HILFE.laserVerbinden = 'Laser-Messgerät per Bluetooth verbinden. Danach kommt jeder Messwert automatisch in die App.';

/* ---------- Skizze mit Maßen: Wand antippen → messen → Maß steht an der Wand ---------- */
function skLinien() { return SK.striche.map((s, i) => ({ i, s })).filter((x) => x.s.length === 2 && (x.s[0][0] !== x.s[1][0] || x.s[0][1] !== x.s[1][1])); }
function skNaechste(x, y) {
  let best = null;
  skLinien().forEach(({ i, s }) => {
    const [[ax, ay], [bx, by]] = s, dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(ax + t * dx - x, ay + t * dy - y); if (d < 45 && (!best || d < best.d)) best = { i, d };
  });
  return best ? best.i : null;
}
function skMassSetzen(i, cm) {
  SK.masse = SK.masse || {}; SK.masse[i] = Math.round(cm);
  const offen = skLinien().find(({ i: j }) => !SK.masse[j]);
  SK.sel = offen ? offen.i : null;
  const cv = document.getElementById('skizze-flaeche'); if (cv) skizzeMalen(cv);
  const f = document.getElementById('sk-mass'); if (f) f.value = SK.sel != null && SK.masse[SK.sel] ? SK.masse[SK.sel] : '';
  const z = document.getElementById('sk-info'); if (z) z.textContent = skInfoText();
}
function skInfoText() {
  const l = skLinien(), fertig = l.filter(({ i }) => SK.masse && SK.masse[i]).length;
  if (!l.length) return 'Erst Wände als gerade Linien zeichnen.';
  return SK.sel != null ? `Wand ${l.findIndex((x) => x.i === SK.sel) + 1} von ${l.length} gewählt (orange) – jetzt messen oder Maß eintippen. ${fertig}/${l.length} gemessen.` : `${fertig}/${l.length} Wände gemessen.${fertig === l.length ? ' Fertig – Maße übernehmen.' : ' Wand antippen.'}`;
}
EIN.skMass = (v) => { if (SK.sel == null) { toast('Erst eine Wand antippen'); return; } const cm = parseZahl(v); if (cm > 5) skMassSetzen(SK.sel, cm); };
AKT.skMessen = () => { SK.modus = 'messen'; const l = skLinien(); SK.sel = l.length ? (l.find(({ i }) => !(SK.masse || {})[i]) || l[0]).i : null; render(); };
AKT.skMasseUebernehmen = (d) => {
  const l = skLinien(), M = SK.masse || {};
  const waag = l.filter(({ s }) => Math.abs(s[1][1] - s[0][1]) < Math.abs(s[1][0] - s[0][0])).map(({ i }) => M[i]).filter(Boolean);
  const senk = l.filter(({ s }) => Math.abs(s[1][1] - s[0][1]) >= Math.abs(s[1][0] - s[0][0])).map(({ i }) => M[i]).filter(Boolean);
  if (!waag.length || !senk.length) { info('Bitte mindestens eine waagerechte und eine senkrechte Wand messen.'); return; }
  const breite = Math.max(...waag), tiefe = Math.max(...senk);
  aendern(() => { const p = projekt(d.id); p.breite = breite; p.tiefe = tiefe; p.gemessen = true; p.skizzeMasse = l.map(({ i, s }) => ({ s, cm: M[i] || null })); if (typeof losMasseAnpassen === 'function') losMasseAnpassen(p); }, 'Maße aus Skizze übernommen');
  toast('Übernommen: ' + zahl(breite / 100) + ' × ' + zahl(tiefe / 100) + ' m');
};
window.addEventListener('hashchange', () => { if (!/^#\/skizze\//.test(location.hash)) LASER.ziel = null; setTimeout(laserStatus, 50); });
