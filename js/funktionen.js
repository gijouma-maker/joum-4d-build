/* Joum 4D Build – EIN Knopf „Funktionen“ statt Sprachleiste (wie JoumHome/WN, modernes Schnell-Menü von unten)
   Sprache (mit Suche, Gerätesprache automatisch), KI-Stimme wählen + Probehören + Tempo, Hilfe & Vorlesen,
   Ansicht (Großschrift, Kontrast), Sprachsteuerung, Konto. */

/* ersetzt die lange Sprach-Leiste auf Start/Mehr durch einen Knopf */
function sprachWahl() {
  const n = (SPRACHEN.find((s) => s[0] === spr()) || SPRACHEN[0])[1];
  return `<div class="sprach-wahl funktionen-leiste"><button class="funktionen-knopf" data-akt="funktionen" aria-label="Funktionen: Sprache, Stimme, Hilfe">
    <span class="fk-globus">🌐</span><span>${esc(n)}</span><span class="fk-trenner"></span><span>🔊</span><span>❓</span><span class="fk-zahn">⚙ Funktionen</span></button></div>`;
}

/* Gerätesprache beim ersten Start übernehmen (so machen es heute die meisten Apps) */
(function () {
  if (S.einstellungen.sprache) return;
  const nl = (navigator.language || 'de').slice(0, 2).toLowerCase();
  if (nl !== 'de' && SPRACHEN.some((s) => s[0] === nl)) { S.einstellungen.sprache = nl; S.einstellungen.spracheAuto = true; try { speichern(); } catch (e) {} }
})();

/* gewählte Stimme bevorzugen */
function stimmeDE(lg) {
  const st = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
  const k = (lg || 'de-DE').slice(0, 2), voll = (lg || 'de-DE').replace('-', '[-_]'), wahl = (S.einstellungen.stimmen || {})[k];
  return (wahl && st.find((v) => v.name === wahl)) || st.find((v) => new RegExp(voll, 'i').test(v.lang) && /google|natural|neural|premium|enhanced/i.test(v.name)) || st.find((v) => new RegExp('^' + k, 'i').test(v.lang)) || null;
}

let FK = { suche: '', teil: '' };
function funktionenHTML() {
  const E = S.einstellungen, k = spr(), st = ((window.speechSynthesis && speechSynthesis.getVoices()) || []).filter((v) => new RegExp('^' + k, 'i').test(v.lang));
  const wahl = (E.stimmen || {})[k] || (stimmeDE(sprBcp()) || {}).name;
  const sprachen = SPRACHEN.filter(([c, n]) => !FK.suche || (n + ' ' + c).toLowerCase().includes(FK.suche.toLowerCase()));
  const schalter = (key, t, unter, inv) => `<button class="fk-schalter ${(inv ? !E[key] : E[key]) ? 'an' : ''}" data-akt="fkSchalter" data-k="${key}"><span><b>${t}</b>${unter ? `<small>${unter}</small>` : ''}</span><i></i></button>`;
  const teil = (id, icon, titel, wert, inhalt) => `<div class="fk-teil ${FK.teil === id ? 'offen' : ''}"><button class="fk-kopf" data-akt="fkTeil" data-t="${id}"><span class="fk-icon">${icon}</span><span style="flex:1"><b>${titel}</b><small>${wert}</small></span><span class="fk-pfeil">›</span></button>${FK.teil === id ? `<div class="fk-inhalt">${inhalt}</div>` : ''}</div>`;
  return `<div class="fk-blatt" role="dialog" aria-label="Funktionen"><div class="fk-griff"></div>
    <div class="zeile"><h2 style="flex:1;margin:0">Funktionen</h2><button class="fk-zu" data-akt="fkZu" aria-label="Schließen">✕</button></div>
    ${teil('sprache', '🌐', 'Sprache', esc((SPRACHEN.find((s) => s[0] === k) || [])[1] || 'Deutsch') + (E.spracheAuto ? ' · vom Handy übernommen' : ''),
      `<input class="fk-suche" placeholder="Sprache suchen …" value="${esc(FK.suche)}" data-ein="fkSuche" data-sofort="1">
       <div class="fk-sprachen">${sprachen.map(([c, n]) => `<button class="fk-sprache ${c === k ? 'an' : ''}" data-akt="fkSprache" data-l="${c}" lang="${c}">${n}${c === k ? ' ✓' : ''}</button>`).join('')}</div>
       <p class="klein grau">Menüs, Ansagen und Sprachbefehle wechseln mit.</p>`)}
    ${teil('stimme', '🗣️', 'KI-Stimme', esc(wahl || 'Gerätestimme') + ' · Tempo ' + zahl(E.sprechTempo || 0.95),
      `${st.length ? `<div class="fk-stimmen">${st.slice(0, 12).map((v) => `<button class="fk-stimme ${v.name === wahl ? 'an' : ''}" data-akt="fkStimme" data-n="${esc(v.name)}"><span style="flex:1">${esc(v.name.replace(/Microsoft |Google /, ''))}<small>${esc(v.lang)}${/natural|neural|premium|enhanced|google/i.test(v.name) ? ' · natürlich' : ''}</small></span><span class="fk-play" aria-hidden="true">▶</span></button>`).join('')}</div>` : '<p class="klein">Dieses Gerät hat keine Stimme für diese Sprache. Android: Einstellungen → Sprache → Sprachausgabe → Sprachpaket laden.</p>'}
       <label class="feld">Tempo: <b>${zahl(E.sprechTempo || 0.95)}×</b><input type="range" min="0.7" max="1.4" step="0.05" value="${E.sprechTempo || 0.95}" data-ein="fkTempo" data-sofort="1"></label>
       <button class="btn hell voll" data-akt="fkProbe">▶ Probehören</button>
       <p class="klein grau">Natürlichere KI-Stimmen in allen Sprachen kommen später über den Joum-Server.</p>`)}
    ${teil('hilfe', '❓', 'Hilfe & Vorlesen', (E.vorlesen ? 'Ansagen an' : 'Ansagen aus') + ' · Hilfe-Blasen ' + (E.blasenAus ? 'aus' : 'an'),
      `${schalter('vorlesen', 'Knöpfe beim Antippen ansagen', 'Jeder Knopf sagt, was er macht – auch jede neue Seite.')}
       ${schalter('blasenAus', 'Hilfe beim langen Drücken', 'Finger auf einen Knopf halten → Hinweis + Vorlesen.', true)}
       ${schalter('schwebeAus', 'Mikrofon- & Vorlese-Knopf anzeigen', 'Sprachbefehle wie „Öffne Bad“, „Laser verbinden“, „Architekt fragen“.', true)}`)}
    ${teil('ansicht', '👁', 'Ansicht', (E.gross ? 'Großschrift' : 'Normale Schrift') + (E.kontrast ? ' · Kontrast' : ''),
      `${schalter('gross', 'Großschrift')}${schalter('kontrast', 'Hoher Kontrast')}`)}
    <a class="fk-kopf" href="#/anmelden" data-akt="fkZuLink"><span class="fk-icon">👤</span><span style="flex:1"><b>${S.konto && S.konto.angemeldet ? 'Mein Konto' : 'Anmelden'}</b><small>${S.konto && S.konto.angemeldet ? esc(S.konto.email || '') : 'Mit Google – ohne Passwort'}</small></span><span class="fk-pfeil">›</span></a>
    <a class="fk-kopf" href="#/mehr" data-akt="fkZuLink"><span class="fk-icon">⚙</span><span style="flex:1"><b>Alle Einstellungen</b><small>Können, Datensicherung, Über</small></span><span class="fk-pfeil">›</span></a>
  </div>`;
}
function funktionenZeigen() {
  let o = document.getElementById('fk-overlay');
  if (!o) { o = document.createElement('div'); o.id = 'fk-overlay'; o.className = 'fk-overlay'; o.addEventListener('click', (e) => { if (e.target === o) funktionenZu(); }); document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('an')); }
  const y = o.querySelector('.fk-blatt') ? o.querySelector('.fk-blatt').scrollTop : 0;
  o.innerHTML = funktionenHTML(); const b = o.querySelector('.fk-blatt'); if (b) b.scrollTop = y;
  if (typeof oberflaecheUebersetzen === 'function') oberflaecheUebersetzen();
}
function funktionenZu() { const o = document.getElementById('fk-overlay'); if (o) { o.classList.remove('an'); setTimeout(() => o.remove(), 200); } }
AKT.funktionen = () => { FK.teil = FK.teil || 'sprache'; funktionenZeigen(); };
AKT.fkZu = () => funktionenZu();
AKT.fkZuLink = (d, el) => { funktionenZu(); geh(el.getAttribute('href')); };
AKT.fkTeil = (d) => { FK.teil = FK.teil === d.t ? '' : d.t; funktionenZeigen(); };
EIN.fkSuche = (v) => { FK.suche = v; const o = document.getElementById('fk-overlay'); funktionenZeigen(); const i = o && o.querySelector('.fk-suche'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } };
AKT.fkSprache = (d) => { S.einstellungen.sprache = d.l; delete S.einstellungen.spracheAuto; speichern(); render(); funktionenZeigen(); sprich(T('Sprache gewechselt: Deutsch'), true, sprBcp()); };
AKT.fkStimme = (d) => { S.einstellungen.stimmen = Object.assign(S.einstellungen.stimmen || {}, { [spr()]: d.n }); speichern(); funktionenZeigen(); AKT.fkProbe(); };
EIN.fkTempo = (v) => { S.einstellungen.sprechTempo = Number(v); speichern(); const b = document.querySelector('.fk-teil.offen small'); if (b) b.textContent = b.textContent.replace(/Tempo [\d,.]+/, 'Tempo ' + zahl(Number(v))); };
AKT.fkProbe = () => sprich(T('Hallo! So klinge ich. Ich lese dir Schritte und Hinweise vor.'), false, sprBcp());
AKT.fkSchalter = (d) => {
  const E = S.einstellungen;
  E[d.k] = !E[d.k];
  speichern(); render(); funktionenZeigen();
  if (d.k === 'vorlesen' && E.vorlesen) sprich(T('Ansagen sind an.'), true);
};
if ('speechSynthesis' in window) speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => { if (document.getElementById('fk-overlay')) funktionenZeigen(); });
HILFE.funktionen = 'Funktionen: Sprache wählen, KI-Stimme ändern, Hilfe und Vorlesen einschalten, Schrift größer machen.';
const vorFkRender = render;
render = function () { vorFkRender(); document.body.classList.toggle('ohne-schwebe', !!S.einstellungen.schwebeAus); };
