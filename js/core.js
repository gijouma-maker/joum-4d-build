/* Joum 4D Build – Kern: Speicher (Offline-first), Versionen, Router, Hilfsfunktionen */

const SPEICHER_KEY = 'j4d_daten_v1';
const VERSIONEN_KEY = 'j4d_versionen_v1';
const MAX_VERSIONEN = 25;

function leererStand() {
  return {
    schema: 1,
    projekte: [], aktivId: null,
    einkauf: [], quittungen: [], auftraege: [], ideen: [], preiswecker: [],
    papierkorb: [],
    einstellungen: { gross: false, kontrast: false, rolle: 'kunde' },
    gesichert: null
  };
}

let S = laden();

function laden() {
  try {
    const roh = localStorage.getItem(SPEICHER_KEY);
    if (!roh) return leererStand();
    return migrieren(JSON.parse(roh));
  } catch (e) {
    console.error(e);
    return leererStand();
  }
}

/* Vor jeder Datenmigration wird eine Sicherung angelegt (Rollback möglich) */
function migrieren(d) {
  const basis = leererStand();
  if (!d.schema || d.schema < basis.schema) {
    versionAnlegen('Vor Update-Migration', d);
  }
  return Object.assign(basis, d, { schema: basis.schema, einstellungen: Object.assign(basis.einstellungen, d.einstellungen || {}) });
}

let speicherTimer = null, letzteVersion = 0;
function speichern(grund) {
  S.gesichert = new Date().toISOString();
  try {
    localStorage.setItem(SPEICHER_KEY, JSON.stringify(S));
  } catch (e) {
    toast('Speicher voll – bitte unter „Datensicherung“ exportieren und alte Fotos löschen.');
  }
  if (grund || Date.now() - letzteVersion > 120000) versionAnlegen(grund || 'Automatisch');
  statusZeigen();
}

function aendern(fn, grund) { fn(S); speichern(grund); render(); }

function versionenLesen() { try { return JSON.parse(localStorage.getItem(VERSIONEN_KEY) || '[]'); } catch (e) { return []; } }
function versionAnlegen(grund, daten) {
  letzteVersion = Date.now();
  const v = versionenLesen();
  const kopie = JSON.parse(JSON.stringify(daten || S));
  // Fotos nicht in jede Version kopieren (Platz sparen)
  (kopie.quittungen || []).forEach((q) => { if (q.foto) q.foto = '[Foto]'; });
  v.unshift({ zeit: new Date().toISOString(), grund, daten: kopie });
  while (v.length > MAX_VERSIONEN) v.pop();
  try { localStorage.setItem(VERSIONEN_KEY, JSON.stringify(v)); } catch (e) { v.length = Math.max(3, v.length - 10); try { localStorage.setItem(VERSIONEN_KEY, JSON.stringify(v)); } catch (e2) {} }
}

function inPapierkorb(typ, obj) {
  S.papierkorb.unshift({ id: uid(), typ, obj, geloescht: Date.now() });
  const grenze = Date.now() - 30 * 864e5;
  S.papierkorb = S.papierkorb.filter((p) => p.geloescht > grenze);
}

/* ---------- Hilfsfunktionen ---------- */
function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function euro(n) { return (Math.round((n || 0) * 100) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }); }
function zahl(n, d = 2) { return (Number(n) || 0).toLocaleString('de-DE', { maximumFractionDigits: d }); }
function parseZahl(s) { return parseFloat(String(s).replace(/\s/g, '').replace(',', '.')) || 0; }
function datum(iso) { return iso ? new Date(iso).toLocaleDateString('de-DE') : ''; }
function zeit(iso) { return iso ? new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '–'; }
function raum(id) { return RAEUME.find((r) => r.id === id); }
function projekt(id) { return S.projekte.find((p) => p.id === id); }
function aktivesProjekt() { return projekt(S.aktivId) || S.projekte[0] || null; }

function toast(text) {
  const t = document.getElementById('toast');
  t.textContent = text; t.classList.add('an');
  clearTimeout(toast.tm); toast.tm = setTimeout(() => t.classList.remove('an'), 2600);
}

/* Eigene Dialoge (statt alert/confirm – funktionieren auch in eingebetteten Vorschauen) */
function dialog(text, knoepfe) {
  const d = document.getElementById('dialog');
  d.querySelector('.d-text').textContent = text;
  const leiste = d.querySelector('.d-knoepfe'); leiste.innerHTML = '';
  knoepfe.forEach(([name, fn, hell]) => {
    const b = document.createElement('button');
    b.className = 'btn' + (hell ? ' hell' : ''); b.textContent = name;
    b.onclick = () => { d.classList.remove('an'); if (fn) fn(); };
    leiste.appendChild(b);
  });
  d.classList.add('an');
  leiste.lastChild.focus();
}
function info(text) { dialog(text, [['OK', null, true]]); }
function frage(text, beiJa) { dialog(text, [['Abbrechen', null], ['Ja', beiJa, true]]); }

/* Datei herunterladen; falls der Browser das blockiert, zum Kopieren anbieten */
function ausgeben(dateiname, inhalt, typ) {
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([inhalt], { type: typ })); a.download = dateiname;
    document.body.appendChild(a); a.click(); a.remove();
  } catch (e) {}
  dialog('Falls kein Download startet: Inhalt kopieren und in eine Datei „' + dateiname + '“ einfügen.', [
    ['Schließen', null],
    ['Kopieren', () => { try { navigator.clipboard.writeText(inhalt).then(() => toast('Kopiert'), () => toast('Kopieren nicht erlaubt')); } catch (e) { toast('Kopieren nicht erlaubt'); } }, true]
  ]);
}

function statusZeigen() {
  const el = document.getElementById('status');
  if (!el) return;
  el.innerHTML = '<span class="punkt"></span>Lokal gesichert ' + (S.gesichert ? new Date(S.gesichert).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '');
  el.title = 'Jede Eingabe wird sofort auf diesem Gerät gespeichert. Cloud-Sync (EU-Server) folgt mit dem Server-Modul.';
}

/* Fortschritt eines Projekts in % (erledigte Anleitungsschritte) */
function fortschritt(p) {
  const a = ANLEITUNGEN[p.anleitung];
  if (!a || !a.schritte.length) return 0;
  const n = Object.values(p.schritte || {}).filter(Boolean).length;
  return Math.round(100 * n / a.schritte.length);
}

function ring(pct, gr = 96, txt) {
  const r = gr / 2 - 7, u = 2 * Math.PI * r;
  return `<svg class="ring" width="${gr}" height="${gr}" viewBox="0 0 ${gr} ${gr}" role="img" aria-label="Fortschritt ${pct} Prozent">
    <circle cx="${gr / 2}" cy="${gr / 2}" r="${r}" stroke="#2a2a2a" stroke-width="7" fill="none"/>
    <circle cx="${gr / 2}" cy="${gr / 2}" r="${r}" stroke="#e9e9e9" stroke-width="7" fill="none" stroke-linecap="round"
      stroke-dasharray="${u}" stroke-dashoffset="${u * (1 - pct / 100)}" transform="rotate(-90 ${gr / 2} ${gr / 2})"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="${gr / 4.5}" font-family="Jost">${txt != null ? txt : pct + '%'}</text></svg>`;
}

function werBadge(w) {
  const k = w === 'Selbst' ? 'gruen' : w === 'Teils Profi' ? 'gelb' : 'rot';
  return `<span class="badge ${k}">${esc(w)}</span>`;
}

function kopf(titel, unter, zurueck) {
  return `<header class="kopf">${zurueck ? `<a class="zurueck" href="${zurueck}" aria-label="Zurück"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></a>` : ''}
    <div><div class="unter">${esc(unter || '')}</div><h1>${esc(titel)}</h1></div></header>`;
}

/* Foto-/Datei-Knopf: echtes Auswahlfeld im Knopf (funktioniert auch in eingebetteten Vorschauen und Handy-Browsern).
   Ohne capture → das Handy bietet „Kamera oder Galerie“ an. */
function dateiKnopf(text, ein, daten, opt) {
  opt = opt || {};
  const attr = Object.entries(daten || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  return `<label class="btn datei-knopf ${opt.klasse || ''}">${opt.icon || ''}<span>${esc(text)}</span><input type="file" class="datei-versteckt" accept="${opt.accept || 'image/*'}" ${opt.mehrere ? 'multiple' : ''} data-ein="${ein}" ${attr}></label>`;
}

/* Spracheingabe (Web Speech API, wo verfügbar) */
function diktieren(ziel) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Spracheingabe wird von diesem Browser nicht unterstützt (Chrome/Safari nutzen).'); return; }
  const r = new SR(); r.lang = 'de-DE'; r.interimResults = false;
  r.onresult = (e) => ziel(e.results[0][0].transcript);
  r.onerror = () => toast('Spracheingabe abgebrochen.');
  r.start(); toast('Sprich jetzt …');
}

/* ---------- Router ---------- */
const ROUTEN = {};
const NACH_RENDER = [];
function route(name, fn) { ROUTEN[name] = fn; }
function nachRender(fn) { NACH_RENDER.push(fn); }

/* Eigener Router: funktioniert als Web-App UND eingebettet (Vorschau-Seiten blockieren #/pfad-Adressen) */
const EINGEBETTET = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
let PFAD = /^#\//.test(location.hash) ? location.hash : '#/';
function geh(ziel) {
  PFAD = ziel || '#/';
  if (!EINGEBETTET) { try { if (location.hash !== PFAD) { history.pushState(null, '', PFAD); } } catch (e) {} }
  render();
}
function aktuelleRoute() {
  const h = PFAD.replace(/^#\/?/, '');
  const [pfad, query] = h.split('?');
  const teile = pfad.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(query || ''));
  return { name: teile[0] || 'start', arg: teile[1] ? decodeURIComponent(teile[1]) : null, q };
}

function render() {
  const r = aktuelleRoute();
  const fn = ROUTEN[r.name] || ROUTEN.start;
  NACH_RENDER.length = 0;
  const main = document.getElementById('main');
  const gleich = render.letzte === PFAD, scroll = window.scrollY;
  if (window.drei3DAufraeumen) window.drei3DAufraeumen();
  main.innerHTML = fn(r.arg, r.q);
  window.scrollTo(0, gleich ? scroll : 0);
  render.letzte = PFAD;
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('aktiv', a.dataset.nav === navGruppe(r.name)));
  document.body.classList.toggle('gross', !!S.einstellungen.gross);
  document.body.classList.toggle('kontrast', !!S.einstellungen.kontrast);
  NACH_RENDER.forEach((f) => f());
  statusZeigen();
}

function navGruppe(n) {
  if (['start'].includes(n)) return 'start';
  if (n === 'fotomessen') return 'projekte';
  if (['projekte', 'raum', 'projekt', 'messen', 'planer', 'ideen', 'anleitung', 'einkauf'].includes(n)) return 'projekte';
  if (['garten'].includes(n)) return 'garten';
  if (['markt', 'handwerker'].includes(n)) return 'markt';
  return 'mehr';
}

/* ---------- Ereignisse (Delegation) ---------- */
const AKT = {};   // Klick-Aktionen:  data-akt="name"
const EIN = {};   // Eingaben:        data-ein="name"
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-akt]');
  if (!el) return;
  const f = AKT[el.dataset.akt];
  if (f) { e.preventDefault(); f(el.dataset, el, e); }
});
['input', 'change'].forEach((typ) => document.addEventListener(typ, (e) => {
  const el = e.target.closest('[data-ein]');
  if (!el) return;
  const f = EIN[el.dataset.ein];
  if (!f) return;
  // data-sofort="1": bei jeder Eingabe (z. B. Regler), sonst beim Verlassen/Bestätigen
  const sofort = el.dataset.sofort === '1';
  if ((typ === 'input') !== sofort) return;
  f(el.type === 'checkbox' ? el.checked : el.value, el.dataset, el);
}));

/* Links innerhalb der App abfangen */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented) return;
  e.preventDefault(); geh(a.getAttribute('href'));
});
window.addEventListener('popstate', () => { PFAD = /^#\//.test(location.hash) ? location.hash : '#/'; render(); });
window.addEventListener('hashchange', () => { if (location.hash !== PFAD && /^#\//.test(location.hash)) { PFAD = location.hash; render(); } });
window.addEventListener('DOMContentLoaded', () => {
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
});
