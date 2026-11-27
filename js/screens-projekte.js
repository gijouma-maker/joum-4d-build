/* Joum 4D Build – Start, Projekte, Räume, Projekt, Messen, Raumplaner 2D/3D, KI-Ideen, Anleitungen */

const WAND_ANL = ['streichen', 'tapezieren', 'vorsatzschale', 'fassade', 'keller_feuchte', 'trockenbau_wand'];
const BODEN_ANL = ['laminat', 'parkett', 'bodenbeschichtung', 'kellerdecke_daemmen', 'oberste_decke', 'bad_abdichten', 'fliesen', 'dach_daemmen_innen', 'balkon_abdichten'];

function wandFlaeche(p) {
  const brutto = (p.waende || []).reduce((s, w) => s + parseZahl(w.l) * parseZahl(w.h), 0);
  const aus = (p.aussparungen || []).reduce((s, a) => s + parseZahl(a.b) * parseZahl(a.h) * (parseZahl(a.n) || 1), 0);
  return { brutto, aus, netto: Math.max(0, brutto - aus) };
}
function bodenFlaeche(p) { return (p.breite / 100) * (p.tiefe / 100); }
function umfang(p) { return 2 * (p.breite + p.tiefe) / 100; }

function standardMenge(p) {
  const a = ANLEITUNGEN[p.anleitung];
  if (!a) return 1;
  if (a.einheit === 'm²') return Math.round((WAND_ANL.includes(p.anleitung) ? wandFlaeche(p).netto : bodenFlaeche(p)) * 10) / 10;
  if (a.einheit === 'm') return Math.round(umfang(p) * 10) / 10;
  return 1;
}

function projektAnlegen(raumId, anlId, extra) {
  const r = raum(raumId) || RAEUME[0];
  const a = ANLEITUNGEN[anlId];
  const h = r.bereich === 'innen' ? 2.5 : 3;
  const p = Object.assign({
    id: uid(), name: (a ? a.t : 'Gestaltung') + ' – ' + r.name, raum: r.id, bereich: r.bereich, anleitung: anlId,
    breite: r.w, tiefe: r.d, schritte: {}, plan: [], stil: null, notizen: '', erstellt: new Date().toISOString(),
    waende: [{ n: 'Wand A', l: r.w / 100, h }, { n: 'Wand B', l: r.d / 100, h }, { n: 'Wand C', l: r.w / 100, h }, { n: 'Wand D', l: r.d / 100, h }],
    aussparungen: r.bereich === 'innen' ? [{ n: 'Tür', b: 0.9, h: 2.1, n2: 1 }, { n: 'Fenster', b: 1.2, h: 1.3 }] : []
  }, extra || {});
  p.aussparungen.forEach((x) => { x.n = x.n || ''; if (x.n2) { x.anz = x.n2; delete x.n2; } });
  p.menge = standardMenge(p);
  S.projekte.unshift(p); S.aktivId = p.id;
  speichern('Projekt angelegt');
  return p;
}

AKT.neuesProjekt = (d) => {
  const a = ANLEITUNGEN[d.anl];
  if (a && a.route) { geh(a.route); return; }
  const p = projektAnlegen(d.raum, d.anl);
  // Innenräume: geführter Start (Foto / Skizze / Vorbild → Maße → Wünsche → Vorschläge)
  geh(p.bereich === 'innen' ? '#/studio/' + p.raum + '?p=' + p.id : '#/projekt/' + p.id);
};
AKT.aktiv = (d) => { S.aktivId = d.id; speichern(); geh('#/projekt/' + d.id); };
AKT.projektLoeschen = (d) => {
  frage('Projekt in den Papierkorb legen? (30 Tage wiederherstellbar)', () => {
    aendern((s) => { const p = projekt(d.id); inPapierkorb('projekt', p); s.projekte = s.projekte.filter((x) => x.id !== d.id); if (s.aktivId === d.id) s.aktivId = null; }, 'Projekt gelöscht');
    geh('#/projekte');
  });
};

/* ---------- Start ---------- */
route('start', () => {
  const p = aktivesProjekt();
  const offen = S.einkauf.filter((e) => !e.erledigt).length;
  const auftr = S.auftraege.filter((a) => a.status !== 'abgeschlossen').length;
  let haupt;
  if (p) {
    const a = ANLEITUNGEN[p.anleitung];
    const naechster = a ? a.schritte.findIndex((_, i) => !p.schritte[i]) : -1;
    haupt = `<section class="karte gross-karte">
      <div class="zeile">${ring(fortschritt(p))}<div style="flex:1"><div class="unter">Aktives Projekt</div><h2>${esc(p.name)}</h2>${a ? werBadge(a.wer) : ''}</div></div>
      ${naechster >= 0 ? `<a class="naechster" href="#/schritt/${p.anleitung}?p=${p.id}&i=${naechster}"><div class="unter">Nächster Schritt</div><b>${esc(a.schritte[naechster][0])}</b><div class="klein">${esc(a.schritte[naechster][1])}</div></a>` : (a && a.schritte.length ? '<div class="hinweis gruen">Alle Schritte erledigt – jetzt Abnahme/Fotos.</div>' : '')}
      <div class="zeile"><a class="btn hell" href="#/projekt/${p.id}">Projekt öffnen</a><button class="btn" data-akt="bau4D" data-id="${p.id}">▶ 4D-Bauablauf</button></div></section>`;
  } else {
    haupt = `<section class="karte gross-karte"><h2>Willkommen bei Joum 4D Build</h2><p class="klein">Plan. Bau. Fertig. – Wähle einen Raum, Haus außen oder Garten und leg dein erstes Projekt an.</p><a class="btn hell voll" href="#/projekte">Projekt starten</a></section>`;
  }
  return kopf('Joum 4D Build', 'Plan. Bau. Fertig.') + `<div class="inhalt">${haupt}
    <div class="raster4">
      <a class="kachel" href="#/assistent">${ICON.mikro}<span>Assistent</span></a>
      <a class="kachel" href="${p ? (p.bereich === 'innen' && !(p.plan || []).length ? '#/studio/' + p.raum + '?p=' : '#/planer/') + p.id : '#/projekte'}">${ICON.wuerfel}<span>Gestalten 3D</span></a>
      <a class="kachel" href="#/garten">${ICON.baum}<span>Garten 4D</span></a>
      <a class="kachel" href="#/einkauf">${ICON.korb}<span>Einkauf${offen ? ' · ' + offen : ''}</span></a>
      <a class="kachel" href="#/rechner">${ICON.rechner}<span>Rechner</span></a>
      <a class="kachel" href="#/finanzen">${ICON.beleg}<span>Finanzen</span></a>
      <a class="kachel" href="#/markt">${ICON.hand}<span>Profi${auftr ? ' · ' + auftr : ''}</span></a>
      <a class="kachel" href="#/tour">${ICON.film}<span>Kino-Tour</span></a>
    </div>
    ${S.projekte.length > 1 ? `<h3>Weitere Projekte</h3>${S.projekte.filter((x) => x !== p).slice(0, 5).map(projektZeile).join('')}` : ''}
  </div>`;
});

function projektZeile(p) {
  return `<button class="liste-zeile" data-akt="aktiv" data-id="${p.id}"><span>${esc(p.name)}<span class="klein block">${esc((raum(p.raum) || {}).name || '')} · ${datum(p.erstellt)}</span></span><span class="klein">${fortschritt(p)} %</span></button>`;
}

/* ---------- Projekte wählen ---------- */
route('projekte', (_, q) => {
  const tab = q.tab || 'innen';
  const tabs = [['innen', 'Innen'], ['aussen', 'Haus außen'], ['garten', 'Garten']];
  let inhalt = '';
  if (tab === 'innen') {
    inhalt = `<p class="klein">Alle Räume mit Katalog, Sicherheitshinweisen und passenden Anleitungen.</p><div class="raster2">${RAEUME.filter((r) => r.bereich === 'innen').map((r) => `<a class="raum-kachel" href="#/raum/${r.id}"><b>${esc(r.name)}</b><span class="klein">${r.katalog.length} Elemente · ${r.projekte.length} Projekte</span></a>`).join('')}</div>`;
  } else {
    const ids = tab === 'aussen' ? ['fenster', 'haustuer', 'dach', 'dachfenster', 'fassade', 'regenrinne', 'vordach', 'carport', 'garagentor', 'balkon_abdichten'] : ['gartenplaner', 'hochbeet', 'terrasse', 'gartenweg', 'teich', 'zaun', 'gartenhaus', 'bewaesserung', 'gartenlicht'];
    const raumFuer = (id) => tab === 'garten' ? 'garten' : (['dach', 'dachfenster'].includes(id) ? 'dach' : ['carport', 'garagentor'].includes(id) ? 'garage' : id === 'balkon_abdichten' ? 'balkon' : 'fassade');
    inhalt = (tab === 'aussen' ? `<div class="raster2" style="margin-bottom:12px">${['balkon', 'garage'].map((id) => `<a class="raum-kachel" href="#/raum/${id}"><b>${raum(id).name}</b><span class="klein">Planer & Katalog</span></a>`).join('')}</div>` : '') +
      ids.map((id) => { const a = ANLEITUNGEN[id]; return `<div class="liste-zeile"><a href="${a.route || '#/anleitung/' + id}" style="flex:1"><b>${esc(a.t)}</b><span class="klein block">${a.dauer ? esc(a.dauer) + ' · ' : ''}${a.route ? '5 Vorschläge, Zeit-Regler' : 'Richtwert ' + euro(a.kosten[0]) + '–' + euro(a.kosten[1]) + ' je ' + a.einheit}</span></a>${werBadge(a.wer)}<button class="btn klein-btn" data-akt="neuesProjekt" data-raum="${raumFuer(id)}" data-anl="${id}">+ Projekt</button></div>`; }).join('');
  }
  return kopf('Projekte', 'Innen · Haus außen · Garten') + `<div class="inhalt">
    <div class="segment">${tabs.map(([k, n]) => `<a href="#/projekte?tab=${k}" class="${k === tab ? 'an' : ''}">${n}</a>`).join('')}</div>
    <div class="legende">${werBadge('Selbst')} ${werBadge('Teils Profi')} ${werBadge('Fachbetrieb')}</div>
    ${inhalt}
    ${S.projekte.length ? `<h3>Meine Projekte</h3>${S.projekte.map(projektZeile).join('')}` : ''}
  </div>`;
});

/* ---------- Raum ---------- */
route('raum', (id) => {
  const r = raum(id);
  if (!r) return kopf('Nicht gefunden', '', '#/projekte');
  if (r.bereich === 'innen' && typeof studioSeite === 'function') return studioSeite(id, {});
  const gruppen = [...new Set(r.katalog.map((k) => k[1]))];
  return kopf(r.name, 'Raum · Katalog & Projekte', '#/projekte') + `<div class="inhalt">
    <h3>Was möchtest du machen?</h3>
    ${r.projekte.map((aid) => { const a = ANLEITUNGEN[aid]; return a ? `<div class="liste-zeile"><a href="${a.route || '#/anleitung/' + aid}" style="flex:1"><b>${esc(a.t)}</b><span class="klein block">${esc(a.dauer)}</span></a>${werBadge(a.wer)}<button class="btn klein-btn" data-akt="neuesProjekt" data-raum="${r.id}" data-anl="${aid}">+ Projekt</button></div>` : ''; }).join('')}
    <button class="btn voll" data-akt="neuesProjekt" data-raum="${r.id}" data-anl="">Nur Raum gestalten (Planer 2D/3D)</button>
    ${r.bereich === 'innen' || r.id === 'garage' ? `<a class="btn voll" href="#/installation?raum=${r.id}&tab=${['bad', 'gaestewc', 'kueche', 'waschraum', 'keller', 'heizungsraum'].includes(r.id) ? 'abwasser' : 'elektro'}">${ICON.tropfen} Wasser, Abwasser & Elektro planen</a>` : ''}
    ${r.sicherheit.length ? `<div class="hinweis rot"><b>Sicherheit</b><ul>${r.sicherheit.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
    ${r.tipps.length ? `<div class="hinweis"><b>Tipps</b><ul>${r.tipps.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
    ${r.katalog.length ? `<h3>Katalog · ${r.katalog.length} Elemente</h3>${gruppen.map((g) => `<details class="karte"><summary>${esc(g)} (${r.katalog.filter((k) => k[1] === g).length})</summary>${r.katalog.filter((k) => k[1] === g).map((k) => `<div class="kat-zeile"><b>${esc(k[0])}</b> <span class="klein">${k[2]}×${k[3]}×${k[4]} cm</span>${k[5] ? `<div class="klein">${esc(k[5])}</div>` : ''}</div>`).join('')}</details>`).join('')}` : ''}
  </div>`;
});

/* ---------- Projekt-Übersicht ---------- */
EIN.projektFeld = (v, d) => aendern(() => { const p = projekt(d.id); p[d.feld] = d.zahl ? parseZahl(v) : v; });

route('projekt', (id) => {
  const p = projekt(id);
  if (!p) return kopf('Projekt nicht gefunden', '', '#/projekte');
  if (S.aktivId !== p.id) { S.aktivId = p.id; speichern(); }
  const a = ANLEITUNGEN[p.anleitung], r = raum(p.raum) || {};
  const auftrag = S.auftraege.find((x) => x.projekt === p.id);
  const ausgaben = S.quittungen.filter((q) => q.projekt === p.id).reduce((s, q) => s + parseZahl(q.betrag), 0);
  return kopf(p.name, r.name || '', '#/projekte') + `<div class="inhalt">
    <section class="karte zeile">${ring(fortschritt(p))}<div style="flex:1">
      ${a ? werBadge(a.wer) + `<div class="klein" style="margin-top:6px">${esc(a.dauer)}</div>` : '<div class="klein">Raumgestaltung</div>'}
      ${a ? `<div class="klein">Richtwert selbst ${euro(a.kosten[0] * (p.menge || 1))} · Profi ${euro(a.kosten[1] * (p.menge || 1))}</div>` : ''}
      <div class="klein">Ausgaben bisher: ${euro(ausgaben)}</div></div></section>
    ${p.bereich === 'innen' && !(p.plan || []).length ? `<a class="karte los-einstieg" href="#/studio/${p.raum}?p=${p.id}"><b>Raum-Studio: Vorschläge in 8 Stilen</b><span class="klein">Grundriss-Ideen, Kosten, Material – direkt ändern, Foto/Skizze/Vorbild.</span></a>` : ''}
    ${wasJetztKarte(p)}
    <label class="feld">Projektname<input value="${esc(p.name)}" data-ein="projektFeld" data-id="${p.id}" data-feld="name"></label>
    ${a ? `<label class="feld">Menge (${a.einheit})<input inputmode="decimal" value="${zahl(p.menge)}" data-ein="projektFeld" data-id="${p.id}" data-feld="menge" data-zahl="1"></label>` : ''}
    <div class="raster3">
      <a class="kachel" href="#/messen/${p.id}">${ICON.messen}<span>Messen</span></a>
      <a class="kachel" href="#/planer/${p.id}">${ICON.wuerfel}<span>Gestalten</span></a>
      <a class="kachel" href="#/ideen/${p.id}">${ICON.funke}<span>KI-Ideen</span></a>
      ${p.gartenPlan ? `<button class="kachel" data-akt="garten4DProjekt" data-id="${p.id}">${ICON.baum}<span>Garten 4D</span></button>` : a && a.schichten && p.bereich !== 'innen' ? `<button class="kachel" data-akt="schichten4D" data-anl="${p.anleitung}">${ICON.wuerfel}<span>4D-Ablauf</span></button>` : `<button class="kachel" data-akt="bau4D" data-id="${p.id}">${ICON.wuerfel}<span>4D-Bauablauf</span></button>`}
      <button class="kachel" data-akt="film" data-id="${p.id}">${ICON.film}<span>Vorher/Nachher</span></button>
      <a class="kachel" href="#/tour">${ICON.kamera}<span>Kino-Tour</span></a>
      ${a ? `<a class="kachel" href="#/anleitung/${p.anleitung}?p=${p.id}">${ICON.liste}<span>Anleitung</span></a>` : ''}
      ${a ? `<button class="kachel" data-akt="materialInListe" data-id="${p.id}">${ICON.korb}<span>Material</span></button>` : ''}
      <a class="kachel" href="#/markt?p=${p.id}">${ICON.hand}<span>${auftrag ? 'Auftrag' : 'Profi anfragen'}</span></a>
      <a class="kachel" href="#/installation?raum=${p.raum}">${ICON.tropfen}<span>Wasser & Elektro</span></a>
      <a class="kachel" href="#/finanzen?p=${p.id}">${ICON.beleg}<span>Quittung</span></a>
    </div>
    ${a ? zeitKarte(p.anleitung, p.menge || 1, false) : ''}
    ${kiKarte(p)}
    ${r.sicherheit && r.sicherheit.length ? `<div class="hinweis rot"><b>Sicherheit</b><ul>${r.sicherheit.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
    ${a && a.warn.length ? `<div class="hinweis gelb">${a.warn.map(esc).join('<br>')}</div>` : ''}
    ${p.ticket ? `<div class="hinweis">Verknüpft mit JoumHome-Ticket <b>${esc(p.ticket.nr)}</b> · ${esc(p.ticket.objekt)}</div>` : ''}
    <label class="feld">Notizen<textarea rows="3" data-ein="projektFeld" data-id="${p.id}" data-feld="notizen">${esc(p.notizen)}</textarea></label>
    <button class="btn voll" data-akt="drucken">Als PDF speichern / drucken</button>
    <button class="btn voll rot-text" data-akt="projektLoeschen" data-id="${p.id}">Projekt löschen</button>
  </div>`;
});
AKT.drucken = () => window.print();
AKT.garten4DProjekt = (d) => { const p = projekt(d.id); try { zeigeGarten4D(p.gartenPlan); } catch (e) { info('Der 4D-Garten braucht WebGL.'); } };
AKT.schichten4D = (d) => { try { zeigeSchichten4D(d.anl); } catch (e) { console.error(e); info('Die 4D-Ansicht braucht WebGL – auf diesem Gerät nicht verfügbar.'); } };

AKT.materialInListe = (d) => {
  const p = projekt(d.id), a = ANLEITUNGEN[p.anleitung];
  if (!a) return;
  aendern((s) => {
    a.material.forEach(([n, je, einheit, hinweis]) => {
      const menge = Math.ceil(je * (p.menge || 1) * 10) / 10;
      s.einkauf.push({ id: uid(), n, menge, einheit, hinweis, projekt: p.id, erledigt: false });
    });
  }, 'Material in Liste');
  toast(a.material.length + ' Positionen in der Einkaufsliste');
  geh('#/einkauf');
};

/* ---------- Messen ---------- */
EIN.wand = (v, d) => aendern(() => { const p = projekt(d.id); p.gemessen = true; p[d.liste][+d.i][d.feld] = d.feld === 'n' ? v : parseZahl(v); });
EIN.raumMass = (v, d) => aendern(() => { const p = projekt(d.id); p.gemessen = true; p[d.feld] = Math.round(parseZahl(v) * 100); });
AKT.wandPlus = (d) => aendern(() => { const p = projekt(d.id); p[d.liste].push(d.liste === 'waende' ? { n: 'Wand ' + String.fromCharCode(65 + p.waende.length), l: 3, h: 2.5 } : { n: 'Öffnung', b: 1, h: 1, anz: 1 }); });
AKT.wandMinus = (d) => aendern(() => { const p = projekt(d.id); p[d.liste].splice(+d.i, 1); });
AKT.flaecheUebernehmen = (d) => { aendern(() => { const p = projekt(d.id); p.gemessen = true; p.menge = standardMenge(p); }, 'Fläche übernommen'); toast('Menge übernommen'); };
AKT.diktatWand = (d) => diktieren((t) => {
  const z = (t.match(/\d+([,.]\d+)?/g) || []).map(parseZahl);
  if (z.length < 2) { toast('Bitte z. B. „4,20 mal 2,50“ sagen. Erkannt: ' + t); return; }
  aendern(() => { const p = projekt(d.id); p.gemessen = true; p.waende.push({ n: 'Wand ' + String.fromCharCode(65 + p.waende.length), l: z[0], h: z[1] }); }, 'Wand diktiert');
  toast('Wand ' + zahl(z[0]) + ' × ' + zahl(z[1]) + ' m hinzugefügt');
});
AKT.lidar = () => info('Der LiDAR-Scan (3D-Scanner im iPhone Pro/iPad Pro) kommt mit der Store-App. Bis dahin: „Foto + Zollstock“ nutzen, Maße eintippen oder diktieren.');

/* ---------- Messen per Foto + Zollstock ----------
   1. Foto mit Zollstock (oder bekanntem Maß) auf derselben Wand/Ebene
   2. Enden des Zollstocks antippen + dessen Länge angeben → Maßstab
   3. Anfang und Ende der Strecke antippen → Länge */
const FM = { url: null, w: 0, h: 0, ref: [], refLen: 1, strecke: [], ergebnisse: [] };
EIN.fmFoto = (v, d, el) => { const f = el.files[0]; if (!f) return; bildVerkleinern(f, 1400, (url) => { const img = new Image(); img.onload = () => { Object.assign(FM, { url, w: img.width, h: img.height, ref: [], strecke: [], ergebnisse: [] }); render(); }; img.src = url; }); };
EIN.fmRefLen = (v) => { FM.refLen = parseZahl(v) || 1; render(); };
AKT.fmTipp = (d, el, e) => {
  const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * FM.w, y = (e.clientY - r.top) / r.height * FM.h;
  if (FM.ref.length < 2) FM.ref.push([x, y]); else { if (FM.strecke.length >= 2) FM.strecke = []; FM.strecke.push([x, y]); }
  render();
};
AKT.fmNeu = (d) => { if (d.was === 'ref') { FM.ref = []; FM.strecke = []; } else FM.strecke = []; render(); };
function fmLaenge() { if (FM.ref.length < 2 || FM.strecke.length < 2) return null; const pxRef = Math.hypot(FM.ref[1][0] - FM.ref[0][0], FM.ref[1][1] - FM.ref[0][1]); if (pxRef < 5) return null; return Math.hypot(FM.strecke[1][0] - FM.strecke[0][0], FM.strecke[1][1] - FM.strecke[0][1]) / pxRef * FM.refLen; }
AKT.fmUebernehmen = (d) => {
  const l = fmLaenge(); if (!l) return; const p = projekt(d.id); p.gemessen = true;
  aendern(() => {
    if (d.als === 'wand') p.waende.push({ n: 'Wand ' + String.fromCharCode(65 + p.waende.length), l: Math.round(l * 100) / 100, h: p.waende[0] ? p.waende[0].h : 2.5 });
    else if (d.als === 'hoehe') p.waende.forEach((w) => { w.h = Math.round(l * 100) / 100; });
    else if (d.als === 'breite') p.breite = Math.round(l * 100);
    if (FM.url && !p.raumFoto && FM.url.length < 400000) p.raumFoto = FM.url;
    else if (d.als === 'tiefe') p.tiefe = Math.round(l * 100);
    else p.aussparungen.push({ n: 'Öffnung', b: Math.round(l * 100) / 100, h: 1, anz: 1 });
  }, 'Foto-Messung übernommen');
  FM.ergebnisse.push(zahl(l) + ' m → ' + { wand: 'neue Wand', hoehe: 'Raumhöhe', breite: 'Raumbreite', tiefe: 'Raumtiefe', oeffnung: 'Öffnung' }[d.als]);
  FM.strecke = []; toast('Übernommen: ' + zahl(l) + ' m'); render();
};
route('fotomessen', (id, q) => {
  const p = projekt(id);
  if (!p) return kopf('Kein Projekt', '', '#/projekte');
  const l = fmLaenge(), schritt = !FM.url ? 0 : FM.ref.length < 2 ? 1 : FM.strecke.length < 2 ? 2 : 3;
  const punkt = ([x, y], f) => `<circle cx="${x}" cy="${y}" r="${FM.w / 70}" fill="${f}" stroke="#000" stroke-width="${FM.w / 400}"/>`;
  const linie = (a, f) => a.length === 2 ? `<line x1="${a[0][0]}" y1="${a[0][1]}" x2="${a[1][0]}" y2="${a[1][1]}" stroke="${f}" stroke-width="${FM.w / 180}" stroke-linecap="round"/>` : '';
  const text = ['Foto mit Zollstock aufnehmen oder auswählen', 'Tippe auf Anfang und Ende des Zollstocks (gelb)', 'Tippe auf Anfang und Ende der Strecke, die du messen willst (blau)', 'Fertig – übernehmen oder neue Strecke antippen'][schritt];
  const losZurueck = (q && (q.z === 'los' || q.z === 'studio')) || (p.los && !p.los.fertig);
  const zurueckZiel = p.bereich === 'innen' ? '#/studio/' + p.raum + '?p=' + p.id : '#/loslegen/' + p.id + '?s=2';
  return kopf('Foto + Zollstock', p.name, losZurueck ? zurueckZiel : '#/messen/' + p.id) + `<div class="inhalt">
    ${losZurueck && FM.ergebnisse.length ? `<a class="btn hell voll" href="${zurueckZiel}">Fertig gemessen – zurück zu den Vorschlägen</a>` : ''}
    <div class="hinweis klein"><b>So geht’s:</b> Zollstock (oder ein bekanntes Maß, z. B. Türbreite) flach an dieselbe Wand halten, die du messen willst, und gerade von vorn fotografieren. Je gerader das Foto, desto genauer.</div>
    ${dateiKnopf(FM.url ? 'Anderes Foto' : 'Foto aufnehmen oder auswählen', 'fmFoto', {}, { icon: ICON.kamera, klasse: FM.url ? '' : 'hell voll' })}
    ${FM.url ? `<div class="karte"><b>Schritt ${schritt}/3:</b> ${text}</div>
      <div class="fm-buehne" data-akt="fmTipp"><img src="${FM.url}" alt="Foto zum Messen" draggable="false">
        <svg viewBox="0 0 ${FM.w} ${FM.h}" aria-hidden="true">${linie(FM.ref, '#ffd27a')}${FM.ref.map((q) => punkt(q, '#ffd27a')).join('')}${linie(FM.strecke, '#7ab8ff')}${FM.strecke.map((q) => punkt(q, '#7ab8ff')).join('')}</svg></div>
      <label class="feld">Länge des Zollstock-Stücks / bekannten Maßes (m)<input inputmode="decimal" value="${zahl(FM.refLen)}" data-ein="fmRefLen"></label>
      ${l ? `<section class="karte summe"><div><span class="klein">Gemessen</span><b>${zahl(l)} m</b></div><div><span class="klein">in cm</span><b>${Math.round(l * 100)}</b></div><div><span class="klein">Genauigkeit</span><b>± ca. 3 %</b></div></section>
        <div class="klein">Übernehmen als …</div>
        <div class="chips" style="flex-wrap:wrap">${[['wand', 'Neue Wand'], ['hoehe', 'Raumhöhe'], ['breite', 'Raumbreite'], ['tiefe', 'Raumtiefe'], ['oeffnung', 'Tür/Fenster-Breite']].map(([a, n]) => `<button class="chip" data-akt="fmUebernehmen" data-id="${p.id}" data-als="${a}">${n}</button>`).join('')}</div>` : ''}
      <div class="zeile"><button class="btn klein-btn" data-akt="fmNeu" data-was="strecke">Strecke neu</button><button class="btn klein-btn" data-akt="fmNeu" data-was="ref">Zollstock neu</button></div>
      ${FM.ergebnisse.length ? `<div class="karte klein">${FM.ergebnisse.map(esc).join('<br>')}</div>` : ''}` : ''}
    <a class="btn voll" href="#/messen/${p.id}">Zurück zu den Maßen</a>
    <p class="klein">Genauigkeit hängt vom Foto ab: Zollstock und Strecke müssen auf derselben Ebene liegen, das Foto möglichst gerade. Für Bestellmaße (Fenster, Küche) immer zusätzlich mit dem Zollstock nachmessen.</p>
  </div>`;
});

route('messen', (id) => {
  const p = projekt(id);
  if (!p) return kopf('Kein Projekt', '', '#/projekte');
  const f = wandFlaeche(p);
  const zeile = (liste, w, i) => `<div class="mess-zeile">
      <input aria-label="Bezeichnung" value="${esc(w.n)}" data-ein="wand" data-id="${p.id}" data-liste="${liste}" data-i="${i}" data-feld="n">
      <input aria-label="${liste === 'waende' ? 'Länge' : 'Breite'} in m" inputmode="decimal" value="${zahl(liste === 'waende' ? w.l : w.b)}" data-ein="wand" data-id="${p.id}" data-liste="${liste}" data-i="${i}" data-feld="${liste === 'waende' ? 'l' : 'b'}">
      <span>×</span>
      <input aria-label="Höhe in m" inputmode="decimal" value="${zahl(w.h)}" data-ein="wand" data-id="${p.id}" data-liste="${liste}" data-i="${i}" data-feld="h">
      ${liste === 'aussparungen' ? `<input aria-label="Anzahl" class="anz" inputmode="numeric" value="${w.anz || 1}" data-ein="wand" data-id="${p.id}" data-liste="${liste}" data-i="${i}" data-feld="anz">` : ''}
      <button class="x" aria-label="Entfernen" data-akt="wandMinus" data-id="${p.id}" data-liste="${liste}" data-i="${i}">×</button></div>`;
  return kopf('Messen', p.name, '#/projekt/' + p.id) + `<div class="inhalt">
    <div class="raster3">
      <button class="kachel" data-akt="lidar">${ICON.scan}<span>LiDAR-Scan</span></button>
      <a class="kachel" href="#/fotomessen/${p.id}">${ICON.kamera}<span>Foto + Zollstock</span></a>
      <button class="kachel" data-akt="diktatWand" data-id="${p.id}">${ICON.mikro}<span>Diktieren</span></button>
    </div>
    ${grundrissKnoepfe(p)}
    ${p.grundriss ? `<img class="skizze" src="${p.grundriss}" alt="Grundriss">` : ''}
    <h3>Grundfläche</h3>
    <div class="mess-zeile"><span style="flex:1">Breite × Tiefe (m)</span>
      <input inputmode="decimal" aria-label="Breite in m" value="${zahl(p.breite / 100)}" data-ein="raumMass" data-id="${p.id}" data-feld="breite"><span>×</span>
      <input inputmode="decimal" aria-label="Tiefe in m" value="${zahl(p.tiefe / 100)}" data-ein="raumMass" data-id="${p.id}" data-feld="tiefe"></div>
    <div class="klein">Boden ${zahl(bodenFlaeche(p))} m² · Umfang ${zahl(umfang(p))} m</div>
    <h3>Wände (Länge × Höhe in m)</h3>
    ${p.waende.map((w, i) => zeile('waende', w, i)).join('')}
    <button class="btn klein-btn" data-akt="wandPlus" data-id="${p.id}" data-liste="waende">+ Wand</button>
    <h3>Aussparungen (Breite × Höhe, Anzahl)</h3>
    ${p.aussparungen.map((w, i) => zeile('aussparungen', w, i)).join('')}
    <button class="btn klein-btn" data-akt="wandPlus" data-id="${p.id}" data-liste="aussparungen">+ Tür/Fenster</button>
    <section class="karte summe"><div><span class="klein">Wand brutto</span><b>${zahl(f.brutto)} m²</b></div><div><span class="klein">Aussparungen</span><b>− ${zahl(f.aus)} m²</b></div><div><span class="klein">Wand netto</span><b>${zahl(f.netto)} m²</b></div></section>
    <button class="btn hell voll" data-akt="flaecheUebernehmen" data-id="${p.id}">Maße stimmen – ins Projekt übernehmen</button>
    <p class="klein">Maße werden an Einkauf, Planer und Anleitung weitergegeben.</p>
  </div>`;
});

/* ---------- Raumplaner 2D/3D ---------- */
const GRUPPEN_FARBE = { 'Licht': '#ffd27a', 'Möbel': '#9db8d9', 'Wand & Bau': '#b0a090', 'Deko': '#d9a0c0', 'Technik': '#9fd69f', 'Sanitär': '#a0d8e8', 'Küche': '#e0c090', 'Lager': '#c0c0c0', 'Garten': '#8fcf6a', 'Sicherheit': '#ff9a8a' };
let planAuswahl = null, plan3D = false, planGruppe = null;

function katalogFuer(p) {
  const r = raum(p.raum);
  return (r && r.katalog.length ? r.katalog : kat(BASIS.licht, BASIS.deko, BASIS.technik, BASIS.bau)).filter((k) => passt(p.raum, k[0]).ok);
}
AKT.planGruppe = (d) => { planGruppe = d.g; render(); };
AKT.planAdd = (d) => {
  const p = projekt(d.id), k = katalogFuer(p)[+d.i];
  const platz = platzieren(p, k);
  const el = { id: uid(), n: k[0], g: k[1], w: k[2], d: Math.max(k[3], 4), h: k[4], hint: k[5], x: platz.x, y: platz.y, rot: platz.rot };
  if (platz.eng && istTisch(k[0])) { const kl = tischFuerRaum(p, katalogFuer(p)); toast(kl && kl[0] !== k[0] ? `Zu wenig Platz für ${k[0]} mit Stühlen – passend wäre ${kl[0]}` : 'Zu wenig Platz für einen Esstisch mit Stühlen und Durchgang'); }
  else if (platz.eng) toast('Kein passender Platz frei – bitte im Grundriss verschieben');
  if (platz.gruppe) el.gruppe = platz.gruppe;
  planAuswahl = el.id;
  aendern(() => { p.plan.push(el); if (istTisch(el.n)) essgruppeHinzufuegen(p, el); }, istTisch(el.n) ? 'Essgruppe hinzugefügt' : 'Element hinzugefügt');
  if (istTisch(el.n)) toast(p.plan.filter((e) => e.gruppe === el.id).length + ' Stühle automatisch dazugestellt');
};
AKT.planDreh = (d) => aendern(() => { const p = projekt(d.id), e = p.plan.find((x) => x.id === planAuswahl); if (!e) return; e.rot = (e.rot + 90) % 360; if (istTisch(e.n)) essgruppeHinzufuegen(p, e); });
AKT.planDoppel = (d) => aendern(() => { const p = projekt(d.id), e = p.plan.find((x) => x.id === planAuswahl); if (e) { const n = Object.assign({}, e, { id: uid(), x: e.x + 20, y: e.y + 20 }); p.plan.push(n); planAuswahl = n.id; if (istTisch(n.n)) essgruppeHinzufuegen(p, n); } });
AKT.planWeg = (d) => aendern(() => { const p = projekt(d.id); p.plan = p.plan.filter((x) => x.id !== planAuswahl && x.gruppe !== planAuswahl); planAuswahl = null; }, 'Element gelöscht');
AKT.plan3D = () => { plan3D = !plan3D; render(); };
AKT.planInListe = (d) => {
  const p = projekt(d.id);
  aendern((s) => p.plan.forEach((e) => s.einkauf.push({ id: uid(), n: e.n, menge: 1, einheit: 'Stück', hinweis: e.hint || '', projekt: p.id, erledigt: false })), 'Planer → Einkauf');
  toast(p.plan.length + ' Elemente in die Einkaufsliste');
};

function box3D(e, sk, farbe) {
  const w = e.w * sk, d = e.d * sk, h = Math.max(2, e.h * sk);
  const f = (stil, hell) => `<div class="f" style="${stil};background:${farbe};filter:brightness(${hell})"></div>`;
  return f(`width:${w}px;height:${d}px;transform:translateZ(${h}px)`, 1.08) +
    f(`width:${w}px;height:${h}px;top:${d}px;transform-origin:top;transform:rotateX(-90deg)`, 0.8) +
    f(`width:${w}px;height:${h}px;top:0;transform-origin:top;transform:rotateX(-90deg)`, 0.7) +
    f(`width:${h}px;height:${d}px;left:${w}px;transform-origin:left;transform:rotateY(-90deg)`, 0.62) +
    f(`width:${h}px;height:${d}px;left:0;transform-origin:left;transform:rotateY(-90deg)`, 0.75);
}

/* Freien Platz suchen: zuerst an den Wänden, sonst Mitte */
function freierPlatz(p, w, d) {
  const frei = (x, y) => x >= 0 && y >= 0 && x + w <= p.breite && y + d <= p.tiefe && !p.plan.some((e) => { const r = e.rot % 180 !== 0, ew = r ? e.d : e.w, ed = r ? e.w : e.d; return x < e.x + ew && x + w > e.x && y < e.y + ed && y + d > e.y; });
  for (let y = 0; y <= p.tiefe - d; y += 10) for (let x = 0; x <= p.breite - w; x += 10) { if ((y === 0 || x === 0 || x + w >= p.breite - 10 || y + d >= p.tiefe - 10) && frei(x, y)) return [x, y]; }
  for (let y = 0; y <= p.tiefe - d; y += 10) for (let x = 0; x <= p.breite - w; x += 10) if (frei(x, y)) return [x, y];
  return [Math.max(0, (p.breite - w) / 2), Math.max(0, (p.tiefe - d) / 2)];
}
window.GRUPPEN_FARBE_3D = null;
/* Vorher/Nachher-Film: leerer Plan → Beispiel-Einrichtung aus dem Raumkatalog (nur für die Vorschau) */
AKT.film = (d) => {
  const p = projekt(d.id); if (!p) return;
  window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE;
  const vorschau = beispielEinrichtung(p);
  if (!p.plan.length) toast('Beispiel-Einrichtung – im Planer kannst du deine eigene zusammenstellen');
  try { zeigeFilm(vorschau, STILE.find((s) => s.id === p.stil)); } catch (e) { info('Der Film braucht WebGL – auf diesem Gerät nicht verfügbar.'); }
};

/* 4D-Bauablauf: automatisch aus Raum + Einrichtung (leer → typische Einrichtung des Raums) */
function beispielEinrichtung(p) {
  const v = JSON.parse(JSON.stringify(p));
  if (v.plan.length) return v;
  const klein = p.breite * p.tiefe < 70000; // unter 7 m²
  const muster = { bad: ['WC wandhängend', 'Waschtisch', 'Spiegelschrank', 'Dusche bodengleich'].concat(klein ? [] : ['Badewanne']).concat(['Handtuchheizkörper', 'Deckenleuchte']), gaestewc: ['WC wandhängend', 'Handwaschbecken', 'Spiegel', 'Deckenleuchte'], kueche: ['Kühlschrank', 'Spüle mit Unterschrank', 'Geschirrspüler', 'Unterschrank 60', 'Herd / Kochfeld', 'Hängeschrank 60', 'Deckenleuchte'], waschraum: ['Waschmaschine', 'Trockner', 'Ausgussbecken', 'Regal', 'Deckenleuchte'], wohnzimmer: ['Sofa 3-Sitzer', 'TV-Board', 'Couchtisch', 'Fernseher an Wand', 'Indirektes Licht (LED-Profil)', 'Stehleuchte', 'Pflanze groß', 'Teppich', 'Rauchmelder'], schlafzimmer: ['Doppelbett 180', 'Nachttisch', 'Nachttisch', 'Kleiderschrank', 'Deckenleuchte', 'Rauchmelder'], kinderzimmer: ['Kinderbett', 'Schreibtisch höhenverstellbar', 'Spielzeugregal', 'Kleiderschrank Kind', 'Spielecke / Teppich', 'Rauchmelder'], buero: ['Schreibtisch höhenverstellbar', 'Bürostuhl', 'Aktenschrank', 'Deckenleuchte'], flur: ['Garderobe', 'Schuhschrank', 'Spiegel groß', 'Rauchmelder'], esszimmer: ['Pendelleuchte über Tisch', 'Sideboard', 'Vitrine'] }[p.raum];
  const kat = katalogFuer(p);
  if (p.raum === 'esszimmer' || (p.raum === 'wohnzimmer' && p.breite * p.tiefe > 250000)) { const t = tischFuerRaum(p, kat); if (t) { const pl = platzieren(v, t); if (!pl.eng) { const el = { id: uid(), n: t[0], g: t[1], w: t[2], d: t[3], h: t[4], hint: t[5], x: pl.x, y: pl.y, rot: pl.rot }; v.plan.push(el); essgruppeHinzufuegen(v, el); } } }
  const liste = muster ? muster.map((n) => kat.find((k) => k[0] === n)).filter(Boolean) : kat.filter((k) => ['Möbel', 'Sanitär', 'Küche', 'Lager'].includes(k[1])).slice(0, 5);
  liste.forEach((k) => { if (k[2] > v.breite && k[3] > v.breite) return; const pl = platzieren(v, k); if (pl.eng) return; const el = { id: uid(), n: k[0], g: k[1], w: k[2], d: Math.max(k[3], 4), h: k[4], hint: k[5], x: pl.x, y: pl.y, rot: pl.rot }; v.plan.push(el); if (istTisch(el.n)) essgruppeHinzufuegen(v, el); });
  if (p.raum === 'kueche' && p.breite >= 400 && p.tiefe >= 380 && !v.plan.some((e) => /Kücheninsel/.test(e.n))) { const k = kat.find((x) => /Kücheninsel/.test(x[0])); if (k) { const pl = platzieren(v, k); if (!pl.eng) v.plan.push({ id: uid(), n: k[0], g: k[1], w: k[2], d: k[3], h: k[4], hint: k[5], x: pl.x, y: pl.y, rot: pl.rot, aus: { kochfeld: true, mulde: true, steckdosen: true } }); } }
  if (NASS.includes(p.raum) && p.fenster !== true) { const ziel = v.plan.find((e) => /Dusche/.test(e.n)) || v.plan.find((e) => /^WC/.test(e.n)); let y = v.tiefe * 0.25; if (ziel) { const f = fussabdruck(ziel); y = f.y + f.h / 2; } v.plan.push({ id: uid(), n: 'Lüfter', g: 'Technik', w: 15, d: 10, h: 15, x: v.breite - 10, y: Math.min(v.tiefe - 20, Math.max(5, Math.min(y, v.tiefe / 2 - 70 > 5 ? y : 5))), rot: 90 }); }
  return v;
}
AKT.bau4D = (d) => {
  const p = projekt(d.id); if (!p) return;
  if (p.gartenPlan) { AKT.garten4DProjekt(d); return; }
  if (p.bereich !== 'innen' && ANLEITUNGEN[p.anleitung] && ANLEITUNGEN[p.anleitung].schichten) { AKT.schichten4D({ anl: p.anleitung }); return; }
  window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE;
  const v = beispielEinrichtung(p);
  if (!p.plan.length) toast('Beispiel-Einrichtung – im Planer kannst du deine eigene festlegen');
  try { zeigeBau4D(v, STILE.find((s) => s.id === p.stil), p.grundriss); } catch (e) { console.error(e); info('Der 4D-Bauablauf braucht WebGL – auf diesem Gerät nicht verfügbar.'); }
};
EIN.grundrissDatei = (v, d, el) => { const f = el.files[0]; if (!f) return; bildVerkleinern(f, 1200, (url) => { aendern(() => { projekt(d.id).grundriss = url; }, 'Grundriss hochgeladen'); toast('Grundriss gespeichert – erscheint im Planer und im 4D-Bauablauf'); }); };
AKT.grundrissWeg = (d) => aendern(() => { delete projekt(d.id).grundriss; });
function grundrissKnoepfe(p) {
  return `<div class="zeile">${dateiKnopf(p.grundriss ? 'Grundriss ändern' : 'Grundriss hochladen', 'grundrissDatei', { id: p.id }, { icon: ICON.kamera })}${p.grundriss ? `<button class="btn klein-btn rot-text" data-akt="grundrissWeg" data-id="${p.id}">Entfernen</button>` : ''}</div>`;
}

/* Raster im 2D-Grundriss: ein Kästchen = 50 cm */
const RASTER = 'linear-gradient(rgba(255,255,255,.13) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px)';
function planer3D(p) {
  const box = document.getElementById('raum3d');
  if (!box || !window.zeigeRaum3D) return;
  window.GRUPPEN_FARBE_3D = GRUPPEN_FARBE;
  try { zeigeRaum3D(box, p, STILE.find((s) => s.id === p.stil), planAuswahl, (id) => { planAuswahl = id; render(); }); }
  catch (e) { box.innerHTML = '<p class="klein" style="padding:12px">3D-Ansicht wird von diesem Gerät nicht unterstützt (WebGL).</p>'; console.error(e); }
}

route('planer', (id) => {
  const p = projekt(id);
  if (!p) return kopf('Kein Projekt', '', '#/projekte');
  nachRender(() => planer3D(p));
  const kat = katalogFuer(p);
  const gruppen = [...new Set(kat.map((k) => k[1]))];
  if (!planGruppe || !gruppen.includes(planGruppe)) planGruppe = gruppen[0];
  const breitePx = 340, sk = breitePx / p.breite, hoehePx = p.tiefe * sk;
  const stil = STILE.find((s) => s.id === p.stil);
  const sel = p.plan.find((x) => x.id === planAuswahl);
  const elemente = p.plan.map((e) => {
    const rot = e.rot % 180 !== 0;
    const w = (rot ? e.d : e.w) * sk, d = (rot ? e.w : e.d) * sk;
    const farbe = stil && e.g === 'Möbel' ? stil.moebel : (GRUPPEN_FARBE[e.g] || '#aaa');
    const eff = Object.assign({}, e, { w: rot ? e.d : e.w, d: rot ? e.w : e.d });
    return `<div class="pl-el ${e.id === planAuswahl ? 'gewaehlt' : ''}" data-pid="${e.id}" style="left:${e.x * sk}px;top:${e.y * sk}px;width:${w}px;height:${d}px;${plan3D ? '' : 'background:' + farbe}">
      ${plan3D ? box3D(eff, sk, farbe) : `<span>${esc(e.n)}</span>`}</div>`;
  }).join('');
  return kopf('Gestalten', p.name, '#/projekt/' + p.id) + `<div class="inhalt">
    <div class="raum3d" id="raum3d" data-pid="${p.id}" aria-label="3D-Ansicht des Raums"></div>
    <div class="klein mitte">3D: mit dem Finger drehen, zwei Finger zoomen, Möbel antippen zum Auswählen</div>
    <div class="zeile"><button class="btn hell" data-akt="bau4D" data-id="${p.id}">▶ 4D-Bauablauf</button><button class="btn" data-akt="film" data-id="${p.id}">▶ Vorher/Nachher</button></div>
    ${grundrissKnoepfe(p)}
    <h3>Grundriss – hier verschieben</h3>
    <div class="plan-buehne" style="height:${hoehePx + 4}px">
      <div class="plan-boden" id="planBoden" data-pid="${p.id}" data-sk="${sk}" style="width:${breitePx}px;height:${hoehePx}px;background-color:${stil ? stil.boden : '#1a1a1a'};background-image:${RASTER}${p.grundriss ? `,url(${p.grundriss})` : ''};background-size:${50 * sk}px ${50 * sk}px,${50 * sk}px ${50 * sk}px${p.grundriss ? ',100% 100%' : ''};background-repeat:repeat,repeat${p.grundriss ? ',no-repeat' : ''};border-color:${stil ? stil.wand : '#555'}"><div class="pl-tuer" style="top:${(p.tiefe / 2 - 45) * sk}px;height:${90 * sk}px;width:${90 * sk}px" aria-hidden="true"></div>${elemente}</div>
    </div>
    ${kiKarte(p)}
    <div class="klein mitte">${zahl(p.breite / 100)} × ${zahl(p.tiefe / 100)} m · ${p.plan.length} Elemente ${stil ? '· Stil ' + esc(stil.name) : ''} · Element antippen und ziehen · 1 Kästchen = 50 cm</div>
    ${sel ? `<div class="karte werkzeug"><b>${esc(sel.n)}</b> <span class="klein">${sel.w}×${sel.d}×${sel.h} cm</span>
      <div class="zeile"><button class="btn klein-btn" data-akt="planDreh" data-id="${p.id}">Drehen 90°</button><button class="btn klein-btn" data-akt="planDoppel" data-id="${p.id}">Kopieren</button><button class="btn klein-btn rot-text" data-akt="planWeg" data-id="${p.id}">Löschen</button></div>
      ${/Kücheninsel/.test(sel.n) ? `<div class="klein" style="margin-top:8px">Was kommt in die Insel?</div><div class="chips" style="flex-wrap:wrap">${INSEL_OPT.map(([o, n]) => `<button class="chip ${(sel.aus || {})[o] ? 'an' : ''}" data-akt="inselOpt" data-id="${p.id}" data-e="${sel.id}" data-o="${o}">${n}</button>`).join('')}</div>${inselLeitungen(sel).map(([a, t]) => `<div class="hinweis ${a === 'strom' ? 'gelb' : a === 'wasser' ? '' : 'gruen'} klein">${esc(t)}</div>`).join('')}` : ''}
      ${sel.gruppe ? '<div class="klein">Gehört zur Essgruppe – Tisch verschieben bewegt alle Stühle mit.</div>' : ''}
      ${sel.hint ? `<div class="hinweis gelb klein">${esc(sel.hint)}</div>` : ''}</div>` : ''}
    <h3>Katalog</h3>
    <div class="chips">${gruppen.map((g) => `<button class="chip ${g === planGruppe ? 'an' : ''}" data-akt="planGruppe" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div>
    <div class="raster2">${kat.map((k, i) => k[1] === planGruppe ? `<button class="kat-btn" data-akt="planAdd" data-id="${p.id}" data-i="${i}"><span class="farbpunkt" style="background:${GRUPPEN_FARBE[k[1]] || '#aaa'}"></span>${esc(k[0])}</button>` : '').join('')}</div>
    <div class="zeile" style="margin-top:12px"><a class="btn" href="#/ideen/${p.id}">KI-Ideen & Stile</a><button class="btn hell" data-akt="planInListe" data-id="${p.id}">In Einkaufsliste</button></div>
  </div>`;
});

/* Ziehen der Elemente im Grundriss (Zeiger-Ereignisse) */
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.pl-el');
  const boden = document.getElementById('planBoden');
  if (!boden) return;
  if (!el) { if (e.target === boden) { planAuswahl = null; render(); } return; }
  const p = projekt(boden.dataset.pid), sk = parseFloat(boden.dataset.sk);
  const obj = p.plan.find((x) => x.id === el.dataset.pid);
  if (!obj) return;
  if (planAuswahl !== obj.id) { planAuswahl = obj.id; render(); }
  const neu = document.querySelector(`.pl-el[data-pid="${obj.id}"]`);
  const sx = e.clientX, sy = e.clientY, ox = obj.x, oy = obj.y;
  const mit = p.plan.filter((x) => x.gruppe === obj.id).map((x) => ({ x, ox: x.x, oy: x.y, el: document.querySelector(`.pl-el[data-pid="${x.id}"]`) }));
  const rot = obj.rot % 180 !== 0, w = rot ? obj.d : obj.w, d = rot ? obj.w : obj.d;
  let bewegt = false;
  const move = (ev) => {
    bewegt = true;
    obj.x = Math.min(Math.max(0, ox + (ev.clientX - sx) / sk), Math.max(0, p.breite - w));
    obj.y = Math.min(Math.max(0, oy + (ev.clientY - sy) / sk), Math.max(0, p.tiefe - d));
    neu.style.left = obj.x * sk + 'px'; neu.style.top = obj.y * sk + 'px';
    mit.forEach((m) => { m.x.x = m.ox + (obj.x - ox); m.x.y = m.oy + (obj.y - oy); if (m.el) { m.el.style.left = m.x.x * sk + 'px'; m.el.style.top = m.x.y * sk + 'px'; } if (window.raum3DViewer && window.raum3DViewer.bewegen) window.raum3DViewer.bewegen(m.x); });
    if (window.raum3DViewer && window.raum3DViewer.bewegen) window.raum3DViewer.bewegen(obj);
  };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); if (bewegt) speichern(); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  e.preventDefault();
});

/* ---------- KI-Ideen ---------- */
const STILE = [
  { id: 'hell', name: 'Modern Hell', wand: '#e8e6e1', boden: '#cdbfa8', moebel: '#f2f2f2', akzent: '#2f6f8f', text: 'Weiß/Greige, helles Eichenholz, schwarze Akzente, indirektes Licht.' },
  { id: 'skandi', name: 'Skandinavisch', wand: '#f1efe9', boden: '#d8c7a6', moebel: '#c9c3b8', akzent: '#8aa39b', text: 'Helles Holz, Textilien, Salbeigrün, viel Tageslicht.' },
  { id: 'industrial', name: 'Industrial', wand: '#6e6a66', boden: '#4a4440', moebel: '#3b3b3b', akzent: '#b5652f', text: 'Sichtbeton-Optik, Metall, Leder, Edison-Leuchten.' },
  { id: 'japandi', name: 'Japandi', wand: '#e4ddd1', boden: '#a68b6a', moebel: '#5c4a3a', akzent: '#3f3f3a', text: 'Ruhig, niedrig, natürliche Materialien, wenig Deko.' },
  { id: 'landhaus', name: 'Landhaus', wand: '#f3ece0', boden: '#9a7650', moebel: '#e7dcc8', akzent: '#6b8a5a', text: 'Massivholz, Kassettentüren, Leinen, warme Töne.' },
  { id: 'luxus', name: 'Luxus / Art déco', wand: '#1f2a2e', boden: '#3a2e26', moebel: '#244b45', akzent: '#c9a64a', text: 'Samt, Messing, dunkle Wände, Spiegel und Marmor.' },
  { id: 'familie', name: 'Familienfreundlich', wand: '#f4f1ea', boden: '#b79c7a', moebel: '#7fa7c9', akzent: '#e0a040', text: 'Abwaschbare Farben, robuster Boden, abgerundete Kanten, viel Stauraum.' },
  { id: 'spar', name: 'Spar-Variante', wand: '#ececec', boden: '#b8a58a', moebel: '#dcdcdc', akzent: '#5a7a9a', text: 'Streichen statt umbauen, Möbel umstellen, Licht ergänzen – geringe Kosten.' }
];
const STICHWORTE = [[/licht|led|indirekt/i, 'Indirektes Licht (LED-Profil)'], [/lampe|leuchte/i, 'Stehleuchte'], [/\btv\b|fernseh/i, 'Fernseher an Wand'], [/bild/i, 'Bild / Rahmen'], [/spiegel/i, 'Spiegel'], [/sofa|couch/i, 'Sofa 3-Sitzer'], [/sessel/i, 'Sessel'], [/bett/i, 'Doppelbett 180'], [/schreibtisch/i, 'Schreibtisch höhenverstellbar'], [/esstisch|tisch/i, 'Esstisch 6 Pers.'], [/regal/i, 'Regal hoch'], [/schrank/i, 'Kleiderschrank'], [/pflanze/i, 'Pflanze groß'], [/teppich/i, 'Teppich'], [/kamin|ofen/i, 'Kamin / Kaminofen'], [/vorhang|gardine/i, 'Vorhang / Gardine'], [/steckdose/i, 'Steckdose (zusätzlich)'], [/rauchmelder/i, 'Rauchmelder']];
let ideenErkannt = [];

EIN.ideenNotiz = (v, d) => { projekt(d.id).skizzeNotiz = v; speichern(); ideenErkennen(projekt(d.id)); render(); };
function ideenErkennen(p) {
  const alle = kat(katalogFuer(p), BASIS.licht, BASIS.deko, BASIS.technik, RAEUME[0].katalog, RAEUME.find((r) => r.id === 'schlafzimmer').katalog);
  ideenErkannt = (p.skizzeNotiz || '').split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean).map((wort) => {
    const m = STICHWORTE.find(([re]) => re.test(wort));
    const k = m && alle.find((x) => x[0] === m[1]);
    const pa = k ? passt(p.raum, k[0]) : { ok: true };
    return { wort, k: pa.ok ? k : null, falsch: pa.ok ? '' : pa.grund, unsicher: /\?/.test(wort), ok: !/\?/.test(wort) && !!k && pa.ok };
  });
}
AKT.ideeOk = (d) => { ideenErkannt[+d.i].ok = !ideenErkannt[+d.i].ok; render(); };
AKT.ideenDiktat = (d) => diktieren((t) => { const p = projekt(d.id); p.skizzeNotiz = ((p.skizzeNotiz || '') + ', ' + t).replace(/^, /, ''); speichern(); ideenErkennen(p); render(); });
AKT.ideenUebernehmen = (d) => {
  const p = projekt(d.id);
  const neu = ideenErkannt.filter((x) => x.ok && x.k);
  aendern(() => neu.forEach((x) => { const k = x.k, pl = platzieren(p, k); const el = { id: uid(), n: k[0], g: k[1], w: k[2], d: Math.max(k[3], 4), h: k[4], hint: k[5], x: pl.x, y: pl.y, rot: pl.rot }; if (pl.gruppe) el.gruppe = pl.gruppe; p.plan.push(el); if (istTisch(el.n)) essgruppeHinzufuegen(p, el); }), 'Ideen übernommen');
  toast(neu.length + ' Elemente in den Planer übernommen');
  geh('#/planer/' + p.id);
};
AKT.stil = (d) => aendern(() => { projekt(d.id).stil = d.s; }, 'Stil gewählt');
AKT.fotoreal = () => info('Fotorealistische Bilder brauchen ein KI-Bildmodell auf dem Server (Kosten pro Bild). Das wird mit dem Server-Modul freigeschaltet – z. B. begrenzt im Abo.');
EIN.skizzeFoto = (v, d, el) => {
  const f = el.files[0]; if (!f) return;
  bildVerkleinern(f, 900, (url) => { projekt(d.id).skizze = url; speichern(); render(); toast('Skizze gespeichert. Notizen bitte unten eintippen oder diktieren.'); });
};

route('ideen', (id) => {
  const p = projekt(id);
  if (!p) return kopf('Kein Projekt', '', '#/projekte');
  if (!ideenErkannt.length && p.skizzeNotiz) ideenErkennen(p);
  return kopf('KI-Ideen', p.name, '#/projekt/' + p.id) + `<div class="inhalt">
    <h3>Aus Skizze oder Notizen</h3>
    ${p.skizze ? `<img class="skizze" src="${p.skizze}" alt="Skizze">` : ''}
    <div class="zeile">${dateiKnopf(p.skizze ? 'Neue Skizze' : 'Skizze/Foto aufnehmen', 'skizzeFoto', { id: p.id }, { icon: ICON.kamera })}<button class="btn" data-akt="ideenDiktat" data-id="${p.id}">${ICON.mikro} Diktieren</button></div>
    <label class="feld">Notizen aus der Skizze (mit Komma trennen, „?“ = unsicher)<textarea rows="2" placeholder="z. B. Licht Decke, TV, Bild?, Sofa" data-ein="ideenNotiz" data-id="${p.id}">${esc(p.skizzeNotiz || '')}</textarea></label>
    ${ideenErkannt.length ? `<div class="karte">${ideenErkannt.map((x, i) => `<div class="kat-zeile zeile"><span style="flex:1">„${esc(x.wort)}“ → ${x.k ? '<b>' + esc(x.k[0]) + '</b>' : x.falsch ? '<span class="rot-text klein">' + esc(x.falsch) + '</span>' : '<span class="klein">nicht erkannt</span>'}${x.unsicher ? ' <span class="badge gelb">bestätigen?</span>' : ''}</span>${x.k ? `<button class="chip ${x.ok ? 'an' : ''}" data-akt="ideeOk" data-i="${i}">${x.ok ? '✓ übernehmen' : 'übernehmen?'}</button>` : ''}</div>`).join('')}
      <button class="btn hell voll" data-akt="ideenUebernehmen" data-id="${p.id}">Im Planer anpassen</button></div>` : ''}
    <p class="klein">Echte Handschrift-Erkennung aus dem Foto folgt mit dem KI-Server-Modul; bis dahin Notizen eintippen oder diktieren.</p>
    <h3>8 Stil-Vorschläge</h3>
    <div class="stile">${STILE.map((s) => `<button class="stil ${p.stil === s.id ? 'an' : ''}" data-akt="stil" data-id="${p.id}" data-s="${s.id}">
      <div class="paletten">${[s.wand, s.boden, s.moebel, s.akzent].map((c) => `<span style="background:${c}"></span>`).join('')}</div>
      <b>${esc(s.name)}</b><span class="klein">${esc(s.text)}</span></button>`).join('')}</div>
    <button class="btn hell voll" data-akt="film" data-id="${p.id}">▶ Vorher/Nachher-Film im gewählten Stil</button>
    <div class="zeile"><button class="btn" data-akt="fotoreal">Fotorealistisch</button><a class="btn" href="#/planer/${p.id}">Im Planer anpassen</a></div>
  </div>`;
});

function bildVerkleinern(datei, max, fertig) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const f = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * f; c.height = img.height * f;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      fertig(c.toDataURL('image/jpeg', 0.7));
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(datei);
}

/* ---------- Zeitaufwand & Zeitplan ---------- */
const STUFEN = [['anfaenger', 'Anfänger', 1.7, 5], ['fortgeschritten', 'Fortgeschritten', 1, 6], ['profi', 'Profi', 0.55, 8]]; // Faktor, Std./Arbeitstag
function zeitSchaetzung(anlId, menge) {
  const z = ZEITEN[anlId]; if (!z) return null;
  const basis = z[0] + z[1] * (menge || 1);
  return STUFEN.map(([id, n, f, tag]) => { const h = Math.max(0.5, Math.round(basis * f * 2) / 2); return { id, n, h, tage: Math.max(1, Math.ceil(h / tag - 0.15)), tag }; });
}
EIN.koennen = (v) => aendern((s) => { s.einstellungen.koennen = v; });
AKT.koennen = (d) => aendern((s) => { s.einstellungen.koennen = d.v; });
function zeitKarte(anlId, menge, mitPlan) {
  const a = ANLEITUNGEN[anlId], z = zeitSchaetzung(anlId, menge); if (!a || !z) return '';
  const ich = S.einstellungen.koennen || 'fortgeschritten', w = WARTEN[anlId], profiPflicht = NUR_PROFI.includes(anlId) || a.wer === 'Fachbetrieb';
  const meine = z.find((x) => x.id === ich);
  let plan = '';
  if (mitPlan && a.schritte.length) {
    // Schritte gleichmäßig auf die Arbeitstage verteilen, Wartezeit nach dem passenden Schritt
    const tage = meine.tage, je = a.schritte.length / tage, zeilen = [];
    let wIdx = -1; if (w) { wIdx = a.schritte.findIndex((s) => /verfug|zweite[rn]? |zweiter anstrich|q2|versiegeln|elemente montieren|wände, dach|trocknen lassen|platten legen|belag|eindecken|bepflanzen \+ füllen|wanne/i.test(s[0])); }
    let tag = 1;
    for (let t = 0; t < tage; t++) {
      const von = Math.round(t * je), bis = Math.max(von + 1, Math.round((t + 1) * je));
      const s = a.schritte.slice(von, Math.min(bis, a.schritte.length)); if (!s.length) continue;
      // Wartezeit mitten im Tag: Tag teilen (vorher – warten – nachher)
      if (w && w[1] >= 12 && wIdx > von && wIdx < Math.min(bis, a.schritte.length)) {
        const wt = Math.ceil(w[1] / 24);
        zeilen.push(`<div class="plan-tag"><b>Tag ${tag++}</b><span>${a.schritte.slice(von, wIdx).map((x) => esc(x[0])).join(' · ')}</span></div>`);
        zeilen.push(`<div class="plan-tag warte"><b>${wt > 1 ? wt + ' Tage' : 'über Nacht'}</b><span>Warten: ${esc(w[0])}</span></div>`);
        if (w[1] >= 24) tag += wt - 1 > 0 ? wt - 1 : 0;
        zeilen.push(`<div class="plan-tag"><b>Tag ${tag++}</b><span>${a.schritte.slice(wIdx, Math.min(bis, a.schritte.length)).map((x) => esc(x[0])).join(' · ')}</span></div>`);
        continue;
      }
      // Wartezeit kommt VOR dem Schritt, der darauf wartet (z. B. Verfugen nach dem Aushärten)
      if (w && w[1] >= 12 && wIdx > 0 && wIdx >= von && wIdx < bis) {
        const wt = Math.ceil(w[1] / 24);
        zeilen.push(`<div class="plan-tag warte"><b>${wt > 1 ? wt + ' Tage' : 'über Nacht'}</b><span>Warten: ${esc(w[0])}</span></div>`);
        if (w[1] >= 24) tag += wt - 1 > 0 ? wt - 1 : 0;
      }
      const txt = s.map((x, i) => esc(x[0]) + (i === 0 && von > 0 && Math.round((t - 1) * je) <= von - 1 && Math.max(Math.round((t - 1) * je) + 1, Math.round(t * je)) > von ? '' : '')).join(' · ');
      const weiter = zeilen.length && zeilen[zeilen.length - 1].includes('>' + esc(s[0][0]));
      zeilen.push(`<div class="plan-tag"><b>Tag ${tag++}</b><span>${txt}${weiter ? ' (weiter)' : ''}</span></div>`);
    }
    if (w && w[1] >= 12 && wIdx < 0) { const wt = Math.ceil(w[1] / 24); zeilen.push(`<div class="plan-tag warte"><b>${wt > 1 ? wt + ' Tage' : 'über Nacht'}</b><span>Danach warten: ${esc(w[0])}</span></div>`); }
    plan = `<h3>Zeitplan für dich (${esc(meine.n)})</h3>${zeilen.join('')}`;
  }
  return `<section class="karte"><div class="zeile"><b style="flex:1">Zeitaufwand${menge ? ' für ' + zahl(menge) + ' ' + a.einheit : ''}</b><span class="klein">Richtwerte</span></div>
    <div class="zeit-raster">${z.map((x) => `<button class="zeit-stufe ${x.id === ich ? 'an' : ''}" data-akt="koennen" data-v="${x.id}"><span class="klein">${x.n}</span><b>${zahl(x.h, 1)} Std.</b><span class="klein">${x.tage} ${x.tage === 1 ? 'Arbeitstag' : 'Arbeitstage'} à ${x.tag} Std.</span></button>`).join('')}</div>
    ${w ? `<div class="klein">+ Wartezeit: ${esc(w[0])} (ca. ${w[1] >= 24 ? Math.round(w[1] / 24) + ' Tag(e)' : w[1] + ' Std.'})</div>` : ''}
    ${profiPflicht ? '<div class="hinweis rot klein">Diese Arbeit gehört zum Fachbetrieb – die Anfänger-/Fortgeschrittenen-Zeit gilt nur für Vorarbeiten und Mithilfe.</div>' : ''}
    <div class="klein">Tippe auf deine Stufe – der Zeitplan passt sich an. Profi = eine Fachkraft mit Profi-Werkzeug; Einkauf, Anfahrt und Aufräumen nicht eingerechnet.</div>
    ${plan}</section>`;
}

/* ---------- Anleitung ---------- */
AKT.schritt = (d) => aendern(() => { const p = projekt(d.p); p.schritte[d.i] = !p.schritte[d.i]; }, null);
AKT.anlMaterial = (d) => {
  if (d.p) { AKT.materialInListe({ id: d.p }); return; }
  const a = ANLEITUNGEN[d.anl];
  aendern((s) => a.material.forEach(([n, je, e, h]) => s.einkauf.push({ id: uid(), n, menge: je, einheit: e + ' je ' + a.einheit, hinweis: h, erledigt: false })));
  toast('Material (je ' + a.einheit + ') in der Liste'); geh('#/einkauf');
};

route('anleitung', (id, q) => {
  const a = ANLEITUNGEN[id];
  if (!a) return kopf('Anleitung nicht gefunden', '', '#/projekte');
  const p = q.p ? projekt(q.p) : null;
  const menge = p ? p.menge || 1 : 1;
  const schichten = a.schichten ? `<div class="schichten" role="img" aria-label="Schichtaufbau">${a.schichten.map((s, i) => `<div class="schicht" style="--c:${s[2] ? s[1] : s[1]};animation-delay:${i * 0.35}s"><span class="farbe" style="background:${s[1]}"></span><b>${esc(s[0])}</b><span class="klein">${esc(s[2])}</span></div>`).join('')}</div>` : '';
  return kopf(a.t, p ? p.name : 'Fach-Anleitung', p ? '#/projekt/' + p.id : '#/projekte') + `<div class="inhalt">
    <div class="zeile">${werBadge(a.wer)}<span class="klein">${esc(a.dauer)}</span><span class="klein">Richtwert ${euro(a.kosten[0])}–${euro(a.kosten[1])} je ${a.einheit}</span></div>
    ${a.warn.length ? `<div class="hinweis rot">${a.warn.map(esc).join('<br>')}</div>` : ''}
    ${zeitKarte(id, p ? menge : (a.einheit === 'm²' ? 10 : a.einheit === 'm' ? 10 : 1), true)}
    ${a.schichten ? `<button class="btn hell voll" data-akt="schichten4D" data-anl="${id}">▶ 4D: Schicht für Schicht (Video)</button>` : ''}
    ${schichten}
    ${a.schritte.length ? `<a class="btn hell voll" href="#/schritt/${id}?${p ? 'p=' + p.id + '&' : ''}i=${p ? Math.max(0, a.schritte.findIndex((_, i) => !p.schritte[i])) : 0}">${ICON.lautsprecher} Schritt für Schritt (mit Vorlesen)</a>` : ''}
    <h3>Schritte${p ? ' · ' + fortschritt(p) + ' %' : ''}</h3>
    ${a.schritte.map((s, i) => `<${p ? 'button data-akt="schritt" data-p="' + p.id + '" data-i="' + i + '"' : 'div'} class="schritt ${p && p.schritte[i] ? 'fertig' : ''}">
      <span class="nr">${p && p.schritte[i] ? '✓' : i + 1}</span><span><b>${esc(s[0])}</b>${s[1] ? `<span class="klein block">${esc(s[1])}</span>` : ''}</span></${p ? 'button' : 'div'}>`).join('')}
    ${a.material.length ? `<h3>Material${p ? ' für ' + zahl(menge) + ' ' + a.einheit : ' je ' + a.einheit}</h3><div class="karte">${a.material.map(([n, je, e, h]) => `<div class="kat-zeile zeile"><span style="flex:1">${esc(n)}${h ? `<span class="klein block">${esc(h)}</span>` : ''}</span><b>${zahl(Math.ceil(je * menge * 10) / 10, 1)} ${esc(e)}</b></div>`).join('')}</div>` : ''}
    ${a.tipps.length ? `<div class="hinweis"><b>Profi-Tipps</b><ul>${a.tipps.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    <div class="zeile">
      ${a.material.length ? `<button class="btn hell" data-akt="anlMaterial" data-anl="${id}" data-p="${p ? p.id : ''}">Material in Liste</button>` : ''}
      ${p ? `<a class="btn" href="#/markt?p=${p.id}">Profi anfragen</a>` : `<button class="btn" data-akt="neuesProjekt" data-raum="${RAEUME.find((r) => r.projekte.includes(id)) ? RAEUME.find((r) => r.projekte.includes(id)).id : 'fassade'}" data-anl="${id}">Als Projekt starten</button>`}
    </div>
    <p class="klein">Fachinhalte sind allgemeine Hinweise und ersetzen keine Fachplanung. Herstellerangaben und aktuelle Vorschriften haben Vorrang.</p>
  </div>`;
});
