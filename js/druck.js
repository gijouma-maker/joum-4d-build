/* Joum 4D Build – Plan als PDF für Handwerker, Vermieter, Bauamt (wie magicplan-Berichte)
   Je Raum: Grundriss mit Maßen, 3D-Bild, Einrichtungsliste mit Maßen/Preisen, Boden/Wände/Decke mit m²,
   eigene Wände, Hinweise/Warnungen, Kosten. Speichern: „Drucken → Als PDF speichern“ (kostenlos, ohne Server). */

function druckRaum(o, d) {
  const { v } = studioAktuell(d); if (!v) return '';
  const r = raum(o.raum) || {}, F = typeof flaechen === 'function' ? flaechen(o) : null, FK = typeof flaechenKosten === 'function' ? flaechenKosten(o) : null;
  const teile = [...v.plan.filter((e) => !e.gruppe).reduce((m, e) => { const k = e.n; m.set(k, Object.assign(m.get(k) || { e, anz: 0 }, { anz: (m.get(k) || { anz: 0 }).anz + 1 })); return m; }, new Map()).values()];
  const preis = (n) => { const p = PREISE.find(([re]) => re.test(n)); return p ? euro(p[1]) + ' – ' + euro(p[2]) : '–'; };
  const H = (o.hoehe || 250) / 100, umfang = 2 * (o.breite + o.tiefe) / 100;
  const W = F ? F.waende.map((w, i) => `<tr><td>Wand ${WAND_NAMEN[i]}</td><td>${zahl((i % 2 ? o.tiefe : o.breite) / 100)} × ${zahl(H)} m</td><td>${w.fliesen ? 'Fliesen ' + ((MUSTER.find((m) => m.id === w.fliesen.muster) || {}).name || 'eigenes Foto') + ', ' + (w.fliesen.hoehe === 'voll' ? 'raumhoch' : '1,20 m hoch') : 'Farbe'}</td><td><i class="dr-farbe" style="background:${w.fliesen ? w.fliesen.farbe : (w.farbe || stilMix(o).stil.wand)}"></i>${esc(w.fliesen ? w.fliesen.farbe : (w.farbe || stilMix(o).stil.wand))}</td></tr>`).join('') : '';
  const warn = v.ergebnis.filter((x) => !x.ok);
  const eigeneW = (losStatus(o).waendeEigen || []);
  return `<section class="druck-raum">
    <h2>${esc(r.name || o.name)} <small>${zahl(o.breite / 100)} × ${zahl(o.tiefe / 100)} m · ${zahl(o.breite * o.tiefe / 10000, 1)} m² · Höhe ${zahl(H)} m</small></h2>
    <p class="klein">Idee: <b>${esc(v.titel)}</b> – ${esc(v.unter)} · Stil: ${esc(stilMix(o).name)}</p>
    <div class="dr-bilder"><div class="dr-plan">${raumSVG(o, v.plan)}<div class="dr-mass"><span>Breite ${zahl(o.breite / 100)} m</span><span>Tiefe ${zahl(o.tiefe / 100)} m</span><span>Tür: linke Wand, Mitte${o.fensterPos ? ' · Fenster: ' + ['hinten', 'rechts', 'vorne'][o.fensterPos.wand] + ', ' + zahl(o.fensterPos.b / 100) + ' m' : ''}</span></div></div>
      <img class="dr-3d" data-druck3d="${esc(JSON.stringify(d))}" alt="3D-Ansicht"></div>
    <h3>Einrichtung</h3>
    <table><tr><th>Teil</th><th>Anz.</th><th>B × T × H (cm)</th><th>Hinweis</th><th>Preis ca.</th></tr>${teile.map(({ e, anz }) => `<tr><td>${esc(e.n)}</td><td>${anz}</td><td>${e.w} × ${e.d} × ${e.h}</td><td>${esc(e.hint || '')}</td><td>${preis(e.n)}</td></tr>`).join('')}</table>
    ${F ? `<h3>Boden, Wände, Decke</h3><table><tr><th>Fläche</th><th>Maß</th><th>Material</th><th>Farbe</th></tr>
      <tr><td>Boden</td><td>${zahl(o.breite * o.tiefe / 10000, 1)} m² (+10 % Verschnitt = ${zahl(o.breite * o.tiefe / 10000 * 1.1, 1)} m²)</td><td>${esc((MUSTER.find((m) => m.id === F.boden.muster) || {}).name || 'eigenes Material (Foto)')}${F.boden.cm ? ', ' + F.boden.cm.join(' × ') + ' cm' : ''}</td><td><i class="dr-farbe" style="background:${F.boden.farbe}"></i>${esc(F.boden.farbe)}</td></tr>
      ${W}<tr><td>Decke</td><td>${zahl(o.breite * o.tiefe / 10000, 1)} m²</td><td>Farbe · Licht: ${esc((LAMPEN.find((l) => l[0] === F.decke.lampe) || [, 'keine'])[1])}</td><td><i class="dr-farbe" style="background:${F.decke.farbe}"></i>${esc(F.decke.farbe)}</td></tr>
      <tr><td>Sockelleiste</td><td>ca. ${zahl(umfang - 0.9, 1)} m</td><td colspan="2"></td></tr></table>` : ''}
    ${eigeneW.length ? `<h3>Neue Wände</h3><ul>${eigeneW.map((w) => `<li>${esc((WAND_TYPEN[w.typ] || {}).n || w.typ)}, ${w.achse === 'laengs' ? 'längs' : 'quer'} bei ${w.pos} %, Durchgang: ${esc((DURCHGANG.find((x) => x[0] === w.durchgang) || [, ''])[1])}</li>`).join('')}</ul>` : ''}
    ${warn.length ? `<h3>Hinweise</h3><ul>${warn.map((x) => `<li>${esc(x.n)}: ${esc(x.grund)}</li>`).join('')}</ul>` : ''}
    <table class="dr-summe"><tr><td>Einrichtung (${esc(stilMix(o).name)})</td><td>ca. ${euro(Math.round(v.kosten.wert / 10) * 10)}</td></tr>${v.kosten.arbeit ? `<tr><td>${esc(v.kosten.arbeit.t)}</td><td>ca. ${euro(Math.round(v.kosten.arbeit.selbst / 10) * 10)}</td></tr>` : ''}${FK ? `<tr><td>Boden & Wände (Material)</td><td>${euro(FK.min)} – ${euro(FK.max)}</td></tr>` : ''}<tr><td>Montage durch Handwerker</td><td>ca. ${euro(v.kosten.montage)}</td></tr></table>
  </section>`;
}
route('druck', (_, q) => {
  let teile = [];
  if (q.w) teile = wohnung().raeume.map((w) => [wRaumObj(w), w.p ? { p: w.p } : { r: w.r }]).filter(([o]) => o);
  else { const d = q.p ? { p: q.p } : { r: q.r }; const o = studioObj(d); if (o) teile = [[o, d]]; }
  const name = q.w ? 'Ganze Wohnung' : (teile[0] ? (raum(teile[0][0].raum) || {}).name : '');
  nachRender(() => lade3D().then(() => document.querySelectorAll('img[data-druck3d]').forEach((img) => {
    try { const d = JSON.parse(img.dataset.druck3d), o = studioObj(d), { v } = studioAktuell(d), c = JSON.parse(JSON.stringify(o)); c.plan = v.plan; c.flaechen = typeof flaechen === 'function' ? flaechen(o) : null; if (typeof dekoAnwenden === 'function') dekoAnwenden(o, c); window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE; img.src = raumBild(c, stilMix(o).stil); } catch (e) { img.remove(); }
  })).catch(() => {}));
  return `<div class="druck">
    <div class="druck-leiste nicht-drucken"><button class="btn hell" data-akt="druckZurueck">← Zurück</button><button class="btn" data-akt="druckenJetzt">📄 Als PDF speichern / Drucken</button></div>
    <p class="klein nicht-drucken grau">Im Druckfenster „Als PDF speichern“ wählen – dann kannst du die Datei per WhatsApp oder E-Mail an Handwerker schicken.</p>
    <header class="dr-kopf"><b>Joum 4D Build</b> · Plan. Bau. Fertig.<h1>${esc(name)}</h1><span>${new Date().toLocaleDateString('de-DE')} · ${teile.length} Raum/Räume${q.w ? ' · ' + zahl(wohnung().raeume.reduce((s, w) => s + wMasse(w).B * wMasse(w).T / 10000, 0), 1) + ' m² Wohnfläche' : ''}</span></header>
    ${q.w ? `<section class="druck-raum"><h2>Grundriss Wohnung</h2><div class="dr-plan">${(WCACHE = {}, wohnungSVG())}</div></section>` : ''}
    ${teile.map(([o, d]) => druckRaum(o, d)).join('')}
    <label class="feld">Notizen für den Handwerker<textarea rows="3" placeholder="z. B. Zugang über Hof, Termin ab März, Altmaterial entsorgen"></textarea></label>
    <p class="klein grau">Alle Maße und Preise sind Richtwerte aus der Planung – bitte vor Ort prüfen. Erstellt mit Joum 4D Build.</p>
  </div>`;
});
AKT.druckenJetzt = () => window.print();
AKT.druckZurueck = () => history.back();
AKT.studioDruck = (d) => geh('#/druck?' + (d.p ? 'p=' + d.p : 'r=' + d.r));
