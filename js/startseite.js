/* Joum 4D Build – einfache Startseite: eine große Frage, drei große Wege, alles andere unter „Mehr Werkzeuge“ */

route('start', () => {
  const p = aktivesProjekt();
  const offen = S.einkauf.filter((e) => !e.erledigt).length;
  const auftr = S.auftraege.filter((a) => a.status !== 'abgeschlossen').length;
  let projektKarte = '';
  if (p) {
    const a = ANLEITUNGEN[p.anleitung];
    const naechster = a ? a.schritte.findIndex((_, i) => !p.schritte[i]) : -1;
    projektKarte = `<section class="karte start-projekt">
      <div class="zeile">${ring(fortschritt(p), 64)}<div style="flex:1"><div class="unter">Weitermachen</div><b>${esc(p.name)}</b>
      ${naechster >= 0 ? `<div class="klein">Nächster Schritt: ${esc(a.schritte[naechster][0])}</div>` : ''}</div></div>
      <div class="zeile wrap">${naechster >= 0 ? `<a class="btn hell" href="#/schritt/${p.anleitung}?p=${p.id}&i=${naechster}">Weiter</a>` : ''}<a class="btn" href="${p.bereich === 'innen' ? '#/studio/' + p.raum + '?p=' + p.id : '#/projekt/' + p.id}">Öffnen</a></div>
    </section>`;
  }
  return kopf('Joum 4D Build', 'Plan. Bau. Fertig.') + `<div class="inhalt start-neu">
    <section class="frage-karte">
      <h2>Was willst du machen?</h2>
      <div class="frage-zeile"><input id="start-frage" class="frage-eingabe" data-ein="startFrage" placeholder="z. B. Bad fliesen, Wand streichen …" enterkeyhint="go" autocomplete="off">
        <button class="frage-mikro" data-akt="sprachbefehl" aria-label="Sprechen">${ICON.mikro}</button></div>
      <div class="zeile wrap">${['Bad renovieren', 'Wand streichen', 'Boden verlegen', 'Garten planen'].map((t) => `<button class="chip" data-akt="startBeispiel" data-t="${t}">${t}</button>`).join('')}</div>
    </section>
    <div class="drei-wege">
      <a class="weg-karte" href="#/projekte">${ICON.wuerfel}<b>Raum planen</b><span>Foto, Skizze oder Maße → Vorschläge in 3D mit Kosten</span></a>
      <a class="weg-karte" href="#/arbeiten">${ICON.werkzeug || ICON.hand}<b>Reparieren & Renovieren</b><span>Schritt-für-Schritt-Anleitungen mit Material und Zeit</span></a>
      <a class="weg-karte" href="#/markt">${ICON.hand}<b>Profi holen${auftr ? ' · ' + auftr : ''}</b><span>Handwerker in der Nähe – Festpreis, sicher bezahlt</span></a>
    </div>
    ${projektKarte}
    <details class="karte mehr-werkzeuge"><summary>Mehr Werkzeuge</summary>
      <div class="raster4">
        <a class="kachel" href="#/assistent">${ICON.mikro}<span>Assistent</span></a>
        <a class="kachel" href="#/garten">${ICON.baum}<span>Garten 4D</span></a>
        <a class="kachel" href="#/einkauf">${ICON.korb}<span>Einkauf${offen ? ' · ' + offen : ''}</span></a>
        <a class="kachel" href="#/rechner">${ICON.rechner}<span>Rechner</span></a>
        <a class="kachel" href="#/finanzen">${ICON.beleg}<span>Finanzen</span></a>
        <a class="kachel" href="#/bauamt">${ICON.beleg}<span>Bauamt-Check</span></a>
        <a class="kachel" href="#/treppe">${ICON.wuerfel}<span>Treppe</span></a>
        <a class="kachel" href="#/bauteile">${ICON.wuerfel}<span>Bauteile 3D</span></a>
        <a class="kachel" href="#/tour">${ICON.film}<span>Kino-Tour</span></a>
        <a class="kachel" href="#/installation">${ICON.tropfen}<span>Wasser & Strom</span></a>
      </div>
    </details>
    ${S.projekte.length > 1 ? `<h3>Deine Projekte</h3>${S.projekte.filter((x) => x !== p).slice(0, 5).map(projektZeile).join('')}` : ''}
  </div>`;
});
EIN.startFrage = (v) => { if (v && v.trim()) befehlAusfuehren(v.trim()); };
AKT.startBeispiel = (d) => befehlAusfuehren(d.t);
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.id === 'start-frage') { e.preventDefault(); e.target.blur(); } });

/* Alle Arbeiten an einem Ort – mit Suche, sortiert nach Bereich */
route('arbeiten', (_, q) => {
  const such = (q && q.q || '').toLowerCase();
  const raumFuer = {}; RAEUME.forEach((r) => r.projekte.forEach((a) => { if (!raumFuer[a]) raumFuer[a] = r; }));
  const gruppen = {};
  Object.entries(ANLEITUNGEN).forEach(([id, a]) => {
    const r = raumFuer[id]; if (!r) return;
    if (such && !(a.t + ' ' + r.name).toLowerCase().includes(such)) return;
    const g = r.bereich === 'innen' ? (['bad', 'gaestewc', 'kueche', 'waschraum'].includes(r.id) ? 'Bad, Küche & Wasser' : 'Wände, Böden & Räume') : (r.bereich === 'garten' ? 'Garten' : 'Haus außen & Dach');
    (gruppen[g] = gruppen[g] || []).push([id, a, r]);
  });
  return kopf('Reparieren & Renovieren', 'Antippen – die Anleitung startet', '#/') + `<div class="inhalt">
    <input class="frage-eingabe" data-ein="arbeitSuche" data-sofort="1" value="${esc(such)}" placeholder="Suchen, z. B. Silikon, Laminat, Dach …">
    ${Object.entries(gruppen).map(([g, l]) => `<h3>${esc(g)}</h3>${l.map(([id, a, r]) => `<button class="liste-zeile arbeit-zeile" data-akt="neuesProjekt" data-raum="${r.id}" data-anl="${id}"><span style="flex:1"><b>${esc(a.t)}</b><span class="klein block">${esc(r.name)} · ${esc(a.dauer || '')}</span></span>${werBadge(a.wer)}</button>`).join('')}`).join('') || '<p class="klein">Nichts gefunden – versuch ein anderes Wort oder frag den Assistenten.</p>'}
  </div>`;
});
let ARBEIT_TIMER = null;
EIN.arbeitSuche = (v) => { clearTimeout(ARBEIT_TIMER); ARBEIT_TIMER = setTimeout(() => { geh('#/arbeiten?q=' + encodeURIComponent(v)); setTimeout(() => { const i = document.querySelector('[data-ein="arbeitSuche"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 30); }, 350); };
HILFE.startBeispiel = 'Beispiel antippen – ich bringe dich direkt hin.';
