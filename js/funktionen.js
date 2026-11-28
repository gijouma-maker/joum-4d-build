/* Joum 4D Build – Kopfleiste wie in JoumHome: [?] Hilfe-Hinweise · [🔊] Sprachhilfe · [Sprache ▾] · [⁘ Funktionen] · [👤]
   „Funktionen“ öffnet das Blatt wie in JoumHome: ANZEIGE (größere Schrift, Kontrast) · SPRACHE & HILFE
   (Sprache, Sprachhilfe/Vorlesen mit Stimme männlich/weiblich + Tempo, Hilfe-Hinweise) · Mikrofon-Knöpfe. */

const SVG_LAUT = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const SVG_FUNK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/></svg>';
const SVG_PROFIL = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
const FN_CHEV = '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';

/* Kopf-Knöpfe statt Sprachleiste (sprachen.js hängt sie nach dem Kopf ein) */
function sprachWahl() {
  const E = S.einstellungen;
  return `<div class="sprach-wahl kopf-knoepfe">
    <button class="icon-btn hilfe-btn ${E.blasenAus ? '' : 'an'}" data-akt="fnHinweise" aria-label="Hilfe-Hinweise an/aus">?</button>
    <button class="icon-btn" data-akt="fnStimme" aria-label="Sprachhilfe">${SVG_LAUT}</button>
    <select class="sprach-sel" data-ein="fnSprache" aria-label="Sprache" data-notr>${SPRACHEN.map(([c, n]) => `<option value="${c}" ${c === spr() ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <button class="func-btn" data-akt="funktionen" aria-label="Funktionen">${SVG_FUNK}<span>Funktionen</span></button>
    <a class="icon-btn" href="#/anmelden" aria-label="Mein Profil">${SVG_PROFIL}</a>
  </div>`;
}

/* Gerätesprache beim ersten Start übernehmen */
(function () {
  if (S.einstellungen.sprache) return;
  const nl = (navigator.language || 'de').slice(0, 2).toLowerCase();
  if (nl !== 'de' && SPRACHEN.some((s) => s[0] === nl)) { S.einstellungen.sprache = nl; try { speichern(); } catch (e) {} }
})();

/* Stimme: männlich / weiblich (Gerätestimmen; sonst über die Tonhöhe) */
const STIMME_M = /\bmale\b|mann|männlich|stefan|conrad|killian|markus|hans|yannick|ralf|christoph|daniel|thomas|david|guy|ryan|jorge|diego|ahmet|maxim|pavel/i;
const STIMME_W = /female|frau|weiblich|katja|amala|hedda|anna|petra|vicki|marlene|helena|elke|seraphina|sabine|zira|jenny|aria|samantha|karen|monica|paulina|yelda|milena/i;
function stimmeDE(lg) {
  const st = (window.speechSynthesis && speechSynthesis.getVoices()) || [], k = (lg || 'de-DE').slice(0, 2);
  const passend = st.filter((v) => new RegExp('^' + k, 'i').test(v.lang)), wahl = (S.einstellungen.stimmen || {})[k], art = S.einstellungen.stimmArt || 'w';
  return (wahl && passend.find((v) => v.name === wahl)) || passend.find((v) => (art === 'm' ? STIMME_M : STIMME_W).test(v.name)) || passend.find((v) => /google|natural|neural|premium|enhanced/i.test(v.name)) || passend[0] || null;
}
if ('speechSynthesis' in window) {
  const sprechen = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = (u) => { try { const art = S.einstellungen.stimmArt || 'w', v = u.voice; if (!v || !(art === 'm' ? STIMME_M : STIMME_W).test(v.name)) u.pitch = art === 'm' ? 0.8 : 1.1; } catch (e) {} sprechen(u); };
}
const PROBE = 'Guten Tag. Ich bin dein Assistent für Joum 4D Build. Ich lese dir Schritte und Hinweise vor.';

function blattZeigen(html) {
  let o = document.getElementById('fk-overlay');
  if (!o) { o = document.createElement('div'); o.id = 'fk-overlay'; o.className = 'fk-overlay'; o.addEventListener('click', (e) => { if (e.target === o) funktionenZu(); }); document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('an')); }
  o.innerHTML = `<div class="fk-blatt sheet" role="dialog">${html}</div>`;
  if (typeof oberflaecheUebersetzen === 'function') oberflaecheUebersetzen();
}
function funktionenZu() { const o = document.getElementById('fk-overlay'); if (o) { o.classList.remove('an'); setTimeout(() => o.remove(), 200); } }
function funktionenHTML() {
  const E = S.einstellungen, zeile = (akt, an, t, u) => `<button class="fn-row" data-akt="${akt}" aria-pressed="${!!an}"><span class="tx"><b>${t}</b><small>${u}</small></span><span class="sw" aria-hidden="true"></span></button>`;
  return `<div class="spread"><h2>Funktionen</h2><button class="btn sm ghost" data-akt="fkZu">Schließen</button></div>
    <div class="fn-lab">Anzeige</div>
    <div class="fn-group">${zeile('fnGross', E.gross, 'Größere Schrift', 'Alles etwas größer lesen')}${zeile('fnKontrast', E.kontrast, 'Hoher Kontrast', 'Stärkere Ränder und Farben')}</div>
    <div class="fn-lab">Sprache &amp; Hilfe</div>
    <div class="fn-group">
      <div class="fn-row" style="cursor:default"><span class="tx"><b>Sprache</b><small>Menüs, Ansagen, Sprachbefehle</small></span><select data-ein="fnSprache" aria-label="Sprache" data-notr>${SPRACHEN.map(([c, n]) => `<option value="${c}" ${c === spr() ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <button class="fn-row" data-akt="fnStimme"><span class="tx"><b>Sprachhilfe (Vorlesen)</b><small>${E.vorlesen ? 'An' : 'Aus'} · Stimme &amp; Tempo wählen</small></span>${FN_CHEV}</button>
      ${zeile('fnHinweise', !E.blasenAus, 'Hilfe-Hinweise', 'Funktion gedrückt halten zeigt die Erklärung')}
      ${zeile('fnSchwebe', !E.schwebeAus, 'Mikrofon- & Vorlese-Knopf', 'Sprachbefehle wie „Öffne Bad“, „Architekt fragen“')}
    </div>
    <div class="klein grau">Wird auf diesem Gerät gespeichert.</div>`;
}
function stimmeHTML() {
  const E = S.einstellungen, art = E.stimmArt || 'w', rate = E.sprechTempo || 1;
  const st = ((window.speechSynthesis && speechSynthesis.getVoices()) || []).filter((v) => new RegExp('^' + spr(), 'i').test(v.lang)), wahl = (stimmeDE(sprBcp()) || {}).name;
  return `<div class="spread"><h2>Sprachhilfe</h2><button class="btn sm ghost" data-akt="fkZu">Schließen</button></div>
    <div class="gsel"><button data-akt="fnVorlesen" data-v="1" aria-pressed="${!!E.vorlesen}"><b>An</b><small>Tippe auf eine Funktion – sie wird erklärt</small></button><button data-akt="fnVorlesen" data-v="0" aria-pressed="${!E.vorlesen}"><b>Aus</b><small>keine Ansagen</small></button></div>
    <h3>Stimme</h3><div class="klein grau">Gilt für Sprachhilfe und Assistent – in allen Sprachen.</div>
    <div class="gsel"><button data-akt="fnArt" data-v="m" aria-pressed="${art === 'm'}"><b>Männlich</b><small>ruhig &amp; tief</small></button><button data-akt="fnArt" data-v="w" aria-pressed="${art === 'w'}"><b>Weiblich</b><small>hell &amp; freundlich</small></button></div>
    ${st.length > 1 ? `<div class="klein grau">Weitere Stimmen auf diesem Gerät</div><div class="fn-group">${st.slice(0, 10).map((v) => `<button class="fn-row" data-akt="fnGeraeteStimme" data-n="${esc(v.name)}"><span class="tx"><b>${esc(v.name.replace(/Microsoft |Google /, ''))}</b><small>${esc(v.lang)}</small></span><span class="chev">${v.name === wahl ? '✓' : '▶'}</span></button>`).join('')}</div>` : ''}
    <h3>Geschwindigkeit</h3>
    <div class="gsel drei">${[[0.9, 'Langsam'], [1, 'Normal'], [1.15, 'Schnell']].map(([r, l]) => `<button data-akt="fnTempo" data-v="${r}" aria-pressed="${Math.abs(rate - r) < 0.03}"><b>${l}</b></button>`).join('')}</div>
    <label class="feld">Feineinstellung<input type="range" min="0.8" max="1.3" step="0.05" value="${rate}" data-ein="fnTempoFein"></label>
    <div class="zeile" style="justify-content:flex-end"><button class="btn hell" data-akt="fnProbe">Probe hören</button><button class="btn" data-akt="fkZu">Fertig</button></div>`;
}
const fnSetz = (k, v, neu) => { S.einstellungen[k] = v; speichern(); render(); if (neu) neu(); };
AKT.funktionen = () => blattZeigen(funktionenHTML());
AKT.fkZu = () => funktionenZu();
AKT.fnStimme = () => blattZeigen(stimmeHTML());
AKT.fnGross = () => fnSetz('gross', !S.einstellungen.gross, () => blattZeigen(funktionenHTML()));
AKT.fnKontrast = () => fnSetz('kontrast', !S.einstellungen.kontrast, () => blattZeigen(funktionenHTML()));
AKT.fnHinweise = () => { fnSetz('blasenAus', !S.einstellungen.blasenAus, () => { if (document.getElementById('fk-overlay')) blattZeigen(funktionenHTML()); }); toast(S.einstellungen.blasenAus ? 'Hilfe-Hinweise aus' : 'Hilfe-Hinweise an – Funktion gedrückt halten'); };
AKT.fnSchwebe = () => fnSetz('schwebeAus', !S.einstellungen.schwebeAus, () => blattZeigen(funktionenHTML()));
EIN.fnSprache = (v) => { S.einstellungen.sprache = v; speichern(); render(); if (document.getElementById('fk-overlay')) blattZeigen(funktionenHTML()); sprich(T('Sprache gewechselt: Deutsch'), true, sprBcp()); };
AKT.fnVorlesen = (d) => fnSetz('vorlesen', d.v === '1', () => { blattZeigen(stimmeHTML()); if (d.v === '1') sprich(T('Ansagen sind an.'), true); });
AKT.fnArt = (d) => { S.einstellungen.stimmArt = d.v; if (S.einstellungen.stimmen) delete S.einstellungen.stimmen[spr()]; speichern(); blattZeigen(stimmeHTML()); AKT.fnProbe(); };
AKT.fnGeraeteStimme = (d) => { S.einstellungen.stimmen = Object.assign(S.einstellungen.stimmen || {}, { [spr()]: d.n }); speichern(); blattZeigen(stimmeHTML()); AKT.fnProbe(); };
AKT.fnTempo = (d) => { S.einstellungen.sprechTempo = Number(d.v); speichern(); blattZeigen(stimmeHTML()); AKT.fnProbe(); };
EIN.fnTempoFein = (v) => { S.einstellungen.sprechTempo = Number(v); speichern(); blattZeigen(stimmeHTML()); AKT.fnProbe(); };
AKT.fnProbe = () => sprich(T(PROBE), false, sprBcp());
if ('speechSynthesis' in window && speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', () => { const o = document.getElementById('fk-overlay'); if (o && o.querySelector('[data-akt="fnArt"]')) blattZeigen(stimmeHTML()); });
const vorFkRender = render;
render = function () { vorFkRender(); document.body.classList.toggle('ohne-schwebe', !!S.einstellungen.schwebeAus); };
HILFE.funktionen = 'Funktionen: größere Schrift, Kontrast, Sprache, Sprachhilfe und Hilfe-Hinweise.';
HILFE.fnStimme = 'Sprachhilfe: Vorlesen an/aus, männliche oder weibliche Stimme und Geschwindigkeit wählen.';
HILFE.fnHinweise = 'Hilfe-Hinweise ein- oder ausschalten. Halte eine Funktion gedrückt, um ihre Erklärung zu sehen.';
