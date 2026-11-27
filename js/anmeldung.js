/* Joum 4D Build – Anmeldung (ein Konto für alle Joum-Apps)
   Ohne Passwort: Google, Facebook, Apple, Telefonnummer (SMS-Code) oder E-Mail (Anmelde-Link).
   Passwort nur, wenn der Nutzer es möchte. Echte Anmeldung braucht den Server (SERVER-CHECKLISTE, Abschnitt 4).
   Bis dahin: alles bleibt sicher auf dem Gerät, ohne Konto nutzbar. */

const ANBIETER = [
  ['google', 'Mit Google fortfahren', '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>'],
  ['facebook', 'Mit Facebook fortfahren', '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.5 19.5v-6h2l.3-2.4h-2.3V9.6c0-.7.2-1.2 1.2-1.2h1.2V6.3c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8H9v2.4h2.1v6h2.4z"/></svg>'],
  ['apple', 'Mit Apple fortfahren', '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>']
];

route('anmelden', (_, q) => {
  const k = S.konto || {};
  const weg = q.weg || '';
  let mitte = '';
  if (weg === 'telefon') {
    mitte = `<section class="karte"><h3>Mit Telefonnummer</h3><p class="klein">Du bekommst einen 6-stelligen Code per SMS. Kein Passwort nötig.</p>
      <label class="feld">Telefonnummer<input type="tel" inputmode="tel" autocomplete="tel" placeholder="+49 170 1234567" id="anm-tel" value="${esc(k.telefon || '')}"></label>
      <button class="btn hell voll" data-akt="anmeldenLos" data-weg="telefon">Code per SMS senden</button></section>`;
  } else if (weg === 'email') {
    mitte = `<section class="karte"><h3>Mit E-Mail</h3><p class="klein">Jede E-Mail-Adresse geht (auch eine andere als bei Google/Facebook). Du bekommst einen Anmelde-Link – ohne Passwort. Wer möchte, legt zusätzlich ein Passwort fest.</p>
      <label class="feld">E-Mail-Adresse<input type="email" inputmode="email" autocomplete="email" placeholder="name@beispiel.de" id="anm-mail" value="${esc(k.email || '')}"></label>
      <label class="schalter"><input type="checkbox" id="anm-pw-an"> Ich möchte zusätzlich ein Passwort</label>
      <label class="feld anm-pw" hidden>Passwort (mind. 10 Zeichen)<input type="password" autocomplete="new-password" id="anm-pw" minlength="10"></label>
      <button class="btn hell voll" data-akt="anmeldenLos" data-weg="email">Anmelde-Link senden</button></section>`;
  }
  return kopf(k.angemeldet ? 'Mein Konto' : 'Anmelden', 'Ein Konto für Joum 4D Build, JoumHome & WN', '#/mehr') + `<div class="inhalt anmelden">
    ${k.angemeldet ? `<div class="hinweis gruen">Angemeldet über ${esc(k.weg)}${k.email ? ' · ' + esc(k.email) : ''}</div>` : ''}
    <p class="klein">Schnell und ohne Passwort anmelden. Deine Projekte werden dann sicher gesichert und sind auf allen Geräten da.</p>
    <div class="anm-knoepfe">
      ${ANBIETER.map(([id, text, logo]) => `<button class="anm-knopf anm-${id}" data-akt="anmeldenLos" data-weg="${id}">${logo}<span>${text}</span></button>`).join('')}
      <a class="anm-knopf" href="#/anmelden?weg=telefon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg><span>Mit Telefonnummer</span></a>
      <a class="anm-knopf" href="#/anmelden?weg=email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>Mit E-Mail-Adresse</span></a>
    </div>
    ${mitte}
    <a class="btn voll" href="#/">Ohne Konto weiter (nur auf diesem Gerät)</a>
    <p class="klein grau">Wir bekommen von Google/Facebook/Apple nur Name und E-Mail – nie dein Passwort. Mit der Anmeldung akzeptierst du Datenschutz & AGB.</p>
  </div>`;
});

document.addEventListener('change', (e) => { if (e.target.id === 'anm-pw-an') { const f = document.querySelector('.anm-pw'); if (f) f.hidden = !e.target.checked; } });

AKT.anmeldenLos = (d) => {
  const namen = { google: 'Google', facebook: 'Facebook', apple: 'Apple', telefon: 'Telefonnummer', email: 'E-Mail' };
  if (d.weg === 'telefon') {
    const t = (document.getElementById('anm-tel') || {}).value || '';
    if (!/^\+?[0-9 ()-]{7,}$/.test(t.trim())) { info('Bitte eine gültige Telefonnummer eingeben, z. B. +49 170 1234567.'); return; }
    aendern(() => { S.konto = Object.assign(S.konto || {}, { telefon: t.trim() }); }, 'Telefonnummer gemerkt');
  }
  if (d.weg === 'email') {
    const m = (document.getElementById('anm-mail') || {}).value || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.trim())) { info('Bitte eine gültige E-Mail-Adresse eingeben.'); return; }
    const pwAn = (document.getElementById('anm-pw-an') || {}).checked, pw = (document.getElementById('anm-pw') || {}).value || '';
    if (pwAn && pw.length < 10) { info('Das Passwort braucht mindestens 10 Zeichen.'); return; }
    aendern(() => { S.konto = Object.assign(S.konto || {}, { email: m.trim() }); }, 'E-Mail gemerkt');   // Passwort wird NIE lokal gespeichert
  }
  info('Anmeldung über ' + namen[d.weg] + ' wird freigeschaltet, sobald der Joum-Server läuft. Bis dahin bleiben alle Projekte sicher auf diesem Gerät – du kannst ohne Konto weitermachen.');
};
HILFE.anmeldenLos = 'Anmelden. Ohne Passwort mit Google, Facebook, Apple, Telefonnummer oder E-Mail.';
