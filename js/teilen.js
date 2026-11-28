/* Joum 4D Build – Entwurf teilen ohne Server: der ganze Entwurf steckt komprimiert im Link.
   Empfänger öffnet den Link → sieht den Raum in 3D, kann 👍/👎 und Kommentar zurückschicken (WhatsApp/SMS/E-Mail).
   Fotos reisen nicht mit (zu groß) – mit Server später: echte Live-Kommentare und Abstimmung im Entwurf. */

async function packen(obj) {
  const json = JSON.stringify(obj);
  if (window.CompressionStream) {
    const s = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const buf = new Uint8Array(await new Response(s).arrayBuffer());
    let bin = ''; buf.forEach((b) => { bin += String.fromCharCode(b); });
    return 'z' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return 'r' + btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function auspacken(t) {
  const b64 = t.slice(1).replace(/-/g, '+').replace(/_/g, '/'), bin = atob(b64);
  if (t[0] === 'r') return JSON.parse(decodeURIComponent(escape(bin)));
  const buf = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const s = new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return JSON.parse(await new Response(s).text());
}
const ohneFotos = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'string' && v.startsWith('data:') ? undefined : v)));
function entwurfPaket(o) {
  const L = losStatus(o);
  return ohneFotos({ v: 1, von: (S.konto && S.konto.name) || '', raum: o.raum, name: o.name, breite: o.breite, tiefe: o.tiefe, hoehe: o.hoehe, stil: o.stil, stil2: o.stil2, mix: o.mix, fenster: o.fenster, fensterPos: o.fensterPos, flaechen: o.flaechen,
    L: { wuensche: L.wuensche, weg: L.weg, tausch: L.tausch, eigene: L.eigene, waendeEigen: L.waendeEigen, zieh: L.zieh, sel: L.sel, eigeneSpecs: L.eigeneSpecs } });
}
async function teilenLink(paket, pfad) {
  const d = await packen(paket);
  return location.origin + location.pathname + '#/' + pfad + '?d=' + d;
}
async function linkTeilen(url, titel, text) {
  const daten = url ? { title: titel, text, url } : { title: titel, text };
  try { if (navigator.share) { await navigator.share(daten); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const alles = (text + (url ? '\n' + url : '')).trim();
  try { await navigator.clipboard.writeText(alles); toast(url ? 'Link kopiert – in WhatsApp oder E-Mail einfügen' : 'Text kopiert – in WhatsApp einfügen'); } catch (e) { info(alles); }
}
AKT.studioTeilen = async (d) => {
  const o = studioObj(d), url = await teilenLink(entwurfPaket(o), 'ansehen');
  linkTeilen(url, 'Mein Entwurf – Joum 4D Build', 'Schau dir meinen Entwurf für ' + ((raum(o.raum) || {}).name || 'den Raum') + ' an und sag mir, was du denkst:');
};
AKT.wTeilen = async () => {
  const W = wohnung(), pakete = W.raeume.map((w) => { const o = wRaumObj(w); return o ? Object.assign(entwurfPaket(o), { lage: { x: w.x, y: w.y, dreh: w.dreh } }) : null; }).filter(Boolean);
  const url = await teilenLink({ v: 1, wohnung: pakete }, 'ansehen');
  linkTeilen(url, 'Meine Wohnung – Joum 4D Build', 'Schau dir meine Wohnungsplanung an:');
};
/* Empfänger: Link öffnen → als Projekt(e) „Geteilt“ übernehmen */
route('ansehen', (_, q) => {
  if (!q.d) return kopf('Geteilter Entwurf', '', '#/') + '<div class="inhalt"><p>Der Link ist unvollständig.</p></div>';
  auspacken(q.d).then((P) => {
    const neu = (x) => { const p = { id: uid(), name: 'Geteilt: ' + ((raum(x.raum) || {}).name || 'Raum') + (x.von ? ' von ' + x.von : ''), raum: x.raum, bereich: (raum(x.raum) || {}).bereich || 'innen', anleitung: '', breite: x.breite, tiefe: x.tiefe, hoehe: x.hoehe || 250, plan: [], stil: x.stil || 'hell', stil2: x.stil2, mix: x.mix, fenster: x.fenster, fensterPos: x.fensterPos, flaechen: x.flaechen, schritte: {}, notizen: '', waende: [], aussparungen: [], geteilt: { von: x.von || '', am: new Date().toISOString() }, erstellt: new Date().toISOString() };
      p.los = Object.assign({}, x.L || {}); Object.assign(EXTRA_SPECS, (x.L || {}).eigeneSpecs || {}); return p; };
    aendern(() => {
      if (P.wohnung) { const W = wohnung(); P.wohnung.forEach((x) => { const p = neu(x); S.projekte.push(p); W.raeume.push({ id: 'w' + uid(), p: p.id, r: '', x: x.lage.x, y: x.lage.y, dreh: x.lage.dreh }); }); }
      else { const p = neu(P); S.projekte.push(p); P._id = p.id; }
    }, 'Geteilten Entwurf geöffnet');
    if (P.wohnung) geh('#/wohnung'); else geh('#/studio/' + P.raum + '?p=' + P._id);
  }).catch(() => { document.getElementById('main').innerHTML = '<div class="inhalt"><p>Der Link konnte nicht geöffnet werden – bitte ganz kopieren.</p></div>'; });
  return kopf('Geteilter Entwurf', 'wird geöffnet …', '#/') + '<div class="inhalt"><p>Einen Moment …</p></div>';
});
/* Rückmeldung für geteilte Entwürfe */
let RM = { stimme: '', text: '' };
const vorTeilenRender = render;
render = function () {
  vorTeilenRender();
  const q = document.querySelector('[data-akt="studioStift"]'); if (!q || !q.dataset.p) return;
  const o = projekt(q.dataset.p); if (!o || !o.geteilt || document.querySelector('.rm-box')) return;
  const ziel = document.querySelector('.studio .stil-leiste'); if (!ziel) return;
  ziel.insertAdjacentHTML('beforebegin', `<div class="rm-box"><b>${o.geteilt.von ? esc(o.geteilt.von) + ' hat' : 'Jemand hat'} dir diesen Entwurf geschickt.</b><span class="klein">Wie findest du ihn? Du kannst auch selbst etwas ändern und zurückschicken.</span>
    <div class="zeile"><button class="chip ${RM.stimme === '👍' ? 'an' : ''}" data-akt="rmStimme" data-s="👍">👍 Gefällt mir</button><button class="chip ${RM.stimme === '👎' ? 'an' : ''}" data-akt="rmStimme" data-s="👎">👎 Eher nicht</button></div>
    <input class="fk-suche" id="rm-text" placeholder="Kommentar, z. B. Sofa lieber an die Fensterwand" value="${esc(RM.text)}">
    <div class="zeile wrap"><button class="btn" data-akt="rmSenden" data-p="${o.id}">Antwort senden</button><button class="btn hell" data-akt="rmMitAenderung" data-p="${o.id}">Mit meinen Änderungen zurück</button></div></div>`);
};
AKT.rmStimme = (d) => { RM.text = (document.getElementById('rm-text') || {}).value || RM.text; RM.stimme = d.s; render(); };
AKT.rmSenden = (d) => { RM.text = (document.getElementById('rm-text') || {}).value || ''; const o = projekt(d.p); linkTeilen('', 'Antwort zu deinem Entwurf', `${RM.stimme || ''} Zu deinem Entwurf (${(raum(o.raum) || {}).name}, ${stilMix(o).name}): ${RM.text || (RM.stimme === '👍' ? 'Gefällt mir!' : 'Lass uns nochmal reden.')}`.trim()); };
AKT.rmMitAenderung = async (d) => { RM.text = (document.getElementById('rm-text') || {}).value || ''; const o = projekt(d.p), url = await teilenLink(entwurfPaket(o), 'ansehen'); linkTeilen(url, 'Mein Vorschlag zurück', `${RM.stimme || ''} ${RM.text || 'Ich habe etwas geändert – schau mal:'}`.trim()); };
