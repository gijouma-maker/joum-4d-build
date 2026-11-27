/* Joum 4D Build – Anmeldung (ein Konto für alle Joum-Apps)
   Ohne Passwort: Google, Facebook, Apple, Telefonnummer (SMS-Code) oder E-Mail (Anmelde-Link).
   Passwort nur, wenn der Nutzer es möchte. Echte Anmeldung braucht den Server (SERVER-CHECKLISTE, Abschnitt 4).
   Bis dahin: alles bleibt sicher auf dem Gerät, ohne Konto nutzbar. */

const ANBIETER = [
  ['google', 'Mit Google fortfahren', '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>'],
  ['facebook', 'Mit Facebook fortfahren', '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.5 19.5v-6h2l.3-2.4h-2.3V9.6c0-.7.2-1.2 1.2-1.2h1.2V6.3c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8H9v2.4h2.1v6h2.4z"/></svg>'],
  ['apple', 'Mit Apple fortfahren', '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>']
];

route('anmelden', () => {
  const k = S.konto || {};
  const google = ANBIETER[0];
  const kopfText = k.angemeldet ? 'Mein Konto' : 'Anmelden';
  if (k.angemeldet) {
    return kopf(kopfText, 'Ein Konto für Joum 4D Build, JoumHome & WN', '#/mehr') + `<div class="inhalt anmelden">
      <section class="karte konto-karte"><div class="zeile">${k.bild ? `<img class="konto-bild" src="${esc(k.bild)}" alt="" referrerpolicy="no-referrer">` : ''}<div style="flex:1"><b>${esc(k.name || '')}</b><div class="klein">${esc(k.email || '')}</div><div class="klein">Angemeldet mit ${esc(k.weg)}</div></div></div></section>
      <p class="klein">Deine Projekte liegen weiter sicher auf diesem Gerät. Die Sicherung in der Cloud und der Abgleich zwischen Geräten kommen mit dem Joum-Server.</p>
      <button class="btn voll" data-akt="abmelden">Abmelden</button></div>`;
  }
  return kopf(kopfText, 'Ein Konto für Joum 4D Build, JoumHome & WN', '#/mehr') + `<div class="inhalt anmelden">
    <p class="klein">Schnell und ohne Passwort anmelden – mit deinem Google-Konto.</p>
    <div class="anm-knoepfe">
      <div id="google-knopf-platz"></div>
      <button class="anm-knopf anm-google" id="google-ersatz" data-akt="anmeldenLos" data-weg="google">${google[2]}<span>${google[1]}</span></button>
    </div>
    <p class="klein grau">Weitere Anmeldewege (Facebook, Apple, Telefonnummer, E-Mail) sind noch nicht freigeschaltet.</p>
    <a class="btn voll" href="#/">Ohne Konto weiter (nur auf diesem Gerät)</a>
    <p class="klein grau">Wir bekommen von Google nur Name, E-Mail und Profilbild – nie dein Passwort.</p>
  </div>`;
});

/* Google-Anmeldung (Google Identity Services, kostenlos, kein eigener Server nötig) */
let gisLaedt = null;
function gisLaden() {
  if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
  if (gisLaedt) return gisLaedt;
  gisLaedt = new Promise((ok, fehler) => {
    const sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true;
    sc.onload = ok; sc.onerror = () => { gisLaedt = null; fehler(); }; document.head.appendChild(sc);
  });
  return gisLaedt;
}
function jwtInhalt(t) {
  const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b + '==='.slice((b.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}
function googleAntwort(r) {
  try {
    const d = jwtInhalt(r.credential);
    if (d.aud !== KONFIG.googleClientId || !/accounts\.google\.com$/.test(d.iss) || d.exp * 1000 < Date.now()) throw new Error('ungültig');
    aendern(() => { S.konto = { angemeldet: true, weg: 'Google', id: d.sub, name: d.name || '', email: d.email || '', bild: d.picture || '', seit: Date.now() }; }, 'Mit Google angemeldet');
    toast('Willkommen, ' + (d.given_name || d.name || '') + '!');
    sprich('Du bist mit Google angemeldet.', true);
    render();
  } catch (e) { info('Die Google-Anmeldung hat nicht geklappt. Bitte nochmal versuchen.'); }
}
function googleKnopfZeigen() {
  if (PFAD.indexOf('#/anmelden') !== 0 || (S.konto && S.konto.angemeldet) || !KONFIG.googleClientId) return;
  gisLaden().then(() => {
    const platz = document.getElementById('google-knopf-platz'); if (!platz) return;
    google.accounts.id.initialize({ client_id: KONFIG.googleClientId, callback: googleAntwort, ux_mode: 'popup', auto_select: false, itp_support: true });
    google.accounts.id.renderButton(platz, { theme: 'filled_white', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'center', width: Math.min(400, platz.offsetWidth || 340), locale: typeof spr === 'function' ? spr() : 'de' });
    const ersatz = document.getElementById('google-ersatz'); if (ersatz) ersatz.hidden = true;
  }).catch(() => {});
}
const vorAnmeldeRender = render;
render = function () { vorAnmeldeRender(); googleKnopfZeigen(); };

AKT.anmeldenLos = (d) => {
  if (!KONFIG.anmeldeWege.includes(d.weg)) { info('Diese Anmeldung ist noch nicht freigeschaltet. Bitte mit Google anmelden.'); return; }
  if (!KONFIG.googleClientId) { info('Die Google-Anmeldung wird gerade eingerichtet und ist bald da. Bis dahin bleiben alle Projekte sicher auf diesem Gerät – du kannst ohne Konto weitermachen.'); return; }
  if (/claude\.ai|claudeusercontent/.test(location.hostname)) { info('Die Google-Anmeldung funktioniert nur in der echten App-Adresse (joum-4d-build.pages.dev), nicht in dieser Vorschau.'); return; }
  info('Google-Anmeldung wird geladen … falls nichts erscheint: Internet prüfen und Seite neu öffnen.');
  googleKnopfZeigen();
};
AKT.abmelden = () => frage('Wirklich abmelden? Deine Projekte bleiben auf diesem Gerät.', () => {
  try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {}
  aendern(() => { S.konto = {}; }, 'Abgemeldet'); render();
});
HILFE.anmeldenLos = 'Mit Google anmelden – ohne Passwort.';
HILFE.abmelden = 'Abmelden. Deine Projekte bleiben auf dem Gerät.';
