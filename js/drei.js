/* Joum 4D Build – 3D: Raum, Leitungen, Teile (Three.js r128, lokal eingebunden) */
(function () {
  const T = window.THREE;
  const aktiv = [];

  /* ---------- Grund-Viewer ---------- */
  function viewer(box, opt) {
    opt = opt || {};
    const W = box.clientWidth || 360, H = box.clientHeight || 320;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(opt.hg || 0x111111);
    box.innerHTML = ''; box.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(opt.fov || 45, W / H, 0.01, 200);
    scene.add(new T.HemisphereLight(0xffffff, 0x3a3a3a, 0.75));
    const sonne = new T.DirectionalLight(0xffffff, 0.85);
    sonne.position.set(4, 8, 5); sonne.castShadow = true;
    sonne.shadow.mapSize.set(1024, 1024);
    const s = opt.schattenGroesse || 6;
    Object.assign(sonne.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 40 });
    scene.add(sonne);
    const controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.autoRotate = opt.drehen !== false; controls.autoRotateSpeed = 1.2;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    const tick = [];
    let laeuft = true;
    const uhr = new T.Clock();
    function loop() {
      if (!laeuft || !renderer.domElement.isConnected) { laeuft = false; return; }
      const dt = uhr.getDelta();
      tick.forEach((f) => f(dt));
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    const v = { renderer, scene, camera, controls, tick, sonne,
      start() { requestAnimationFrame(loop); },
      stopp() { laeuft = false; renderer.dispose(); },
      groesse() { const w = box.clientWidth, h = box.clientHeight; if (w && h) { renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); } } };
    aktiv.push(v);
    return v;
  }
  window.drei3DAufraeumen = () => { while (aktiv.length) aktiv.pop().stopp(); };
  window.addEventListener('resize', () => aktiv.forEach((v) => v.groesse()));

  /* ---------- Hilfen ---------- */
  const matCache = {};
  function mat(farbe, o) {
    const k = farbe + JSON.stringify(o || {});
    if (!matCache[k]) matCache[k] = new T.MeshStandardMaterial(Object.assign({ color: new T.Color(farbe), roughness: 0.65, metalness: 0.05 }, o || {}));
    return matCache[k];
  }
  function mesh(geo, m, x, y, z) { const me = new T.Mesh(geo, m); me.position.set(x || 0, y || 0, z || 0); me.castShadow = true; me.receiveShadow = true; return me; }
  function kiste(w, h, d, farbe, x, y, z, o) { return mesh(new T.BoxGeometry(w, h, d), mat(farbe, o), x, y, z); }
  function zyl(r, h, farbe, x, y, z, o, seg) { return mesh(new T.CylinderGeometry(r, r, h, seg || 24), mat(farbe, o), x, y, z); }
  function schild(text, farbe, groesse) {
    const c = document.createElement('canvas'), ctx = c.getContext('2d');
    const fs = 44; ctx.font = '600 ' + fs + 'px Jost, Arial, sans-serif';
    const w = Math.ceil(ctx.measureText(text).width) + 40;
    c.width = w; c.height = fs + 30;
    ctx.font = '600 ' + fs + 'px Jost, Arial, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    const r = 18; ctx.beginPath(); ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, c.height, r); ctx.arcTo(w, c.height, 0, c.height, r); ctx.arcTo(0, c.height, 0, 0, r); ctx.arcTo(0, 0, w, 0, r); ctx.fill();
    ctx.fillStyle = farbe || '#ffd27a'; ctx.textBaseline = 'middle'; ctx.fillText(text, 20, c.height / 2 + 2);
    const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    const g = groesse || 0.12; sp.scale.set(g * c.width / c.height, g, 1); sp.renderOrder = 10;
    return sp;
  }
  function holzTextur(farbe, kachel) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d');
    ctx.fillStyle = farbe; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2;
    if (kachel) { for (let i = 0; i <= 256; i += 64) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke(); } }
    else { for (let y = 0; y <= 256; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke(); const o = (y / 32) % 2 ? 128 : 40; ctx.beginPath(); ctx.moveTo(o, y); ctx.lineTo(o, y + 32); ctx.stroke(); } }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t;
  }
  /* Rohrstück zwischen zwei Punkten (mit Innenwand) */
  function rohr(a, b, r, farbe) {
    const g = new T.Group();
    const dir = new T.Vector3().subVectors(b, a), len = dir.length();
    const aussen = mesh(new T.CylinderGeometry(r, r, len, 28, 1, true), mat(farbe, { side: T.FrontSide, roughness: 0.45 }));
    const innen = mesh(new T.CylinderGeometry(r * 0.9, r * 0.9, len, 28, 1, true), mat('#3a3a3a', { side: T.BackSide }));
    g.add(aussen, innen);
    g.position.copy(a).add(dir.clone().multiplyScalar(0.5));
    g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
    return g;
  }
  function muffe(pos, richtung, r, farbe) {
    const g = new T.Group();
    g.add(mesh(new T.CylinderGeometry(r * 1.2, r * 1.2, r * 1.5, 28, 1, true), mat(farbe, { side: T.DoubleSide, roughness: 0.45 })));
    const ring = mesh(new T.TorusGeometry(r * 1.02, r * 0.09, 8, 28), mat('#1a1a1a')); ring.rotation.x = Math.PI / 2; ring.position.y = r * 0.55; g.add(ring);
    g.position.copy(pos); g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), richtung.clone().normalize());
    return g;
  }
  function bogen(r, winkelGrad, farbe) {
    const R = r * 2.4, arc = winkelGrad * Math.PI / 180;
    const g = new T.Group();
    g.add(mesh(new T.TorusGeometry(R, r, 20, 40, arc), mat(farbe, { side: T.DoubleSide, roughness: 0.45 })));
    // Muffe am Anfang (Tangente am Torus-Start zeigt in +Y)
    g.add(muffe(new T.Vector3(R, -r * 0.6, 0), new T.Vector3(0, -1, 0), r, farbe));
    const ende = new T.Vector3(R * Math.cos(arc), R * Math.sin(arc), 0);
    const tang = new T.Vector3(-Math.sin(arc), Math.cos(arc), 0);
    g.add(rohr(ende, ende.clone().add(tang.clone().multiplyScalar(r * 1.2)), r, farbe));
    g.position.set(-R * 0.6, -R * 0.4, 0);
    return g;
  }
  function v3(x, y, z) { return new T.Vector3(x, y, z); }

  /* ---------- Teile ---------- */
  const HT = '#9ea3a8', KG = '#d9661f', WEISS = '#f2f2f2', CHROM = '#d9dde2', MESS = '#c9a64a';
  const TEILE = {
    ht_rohr: { n: 'HT-Rohr (mit Muffe)', markt: 'HT-Rohr DN 40/50/75/110, grau, Längen 15 cm bis 2 m. Muffe mit Lippendichtung an einem Ende.', bau(g, dn) { const r = (dn || 100) / 200; g.add(rohr(v3(0, -1.4, 0), v3(0, 1.2, 0), r, HT)); g.add(muffe(v3(0, 1.2 + r * 0.55, 0), v3(0, 1, 0), r, HT)); g.add(schild('DN ' + (dn || 100), '#ffd27a', 0.22).translateY(1.9)); } },
    kg_rohr: { n: 'KG-Rohr (Erdreich, orange)', markt: 'KG-Rohr DN 110/125/160 für Grundleitungen im Erdreich, orange-braun.', bau(g) { const r = 0.55; g.add(rohr(v3(0, -1.4, 0), v3(0, 1.2, 0), r, KG)); g.add(muffe(v3(0, 1.2 + r * 0.55, 0), v3(0, 1, 0), r, KG)); } },
    bogen45: { n: 'HT-Bogen 45°', markt: 'HT-Bogen 45°. Für Richtungsänderung immer zwei davon (2 × 45°) statt eines 90°-Bogens.', bau(g) { g.add(bogen(0.4, 45, HT)); g.add(schild('45°', '#9fd69f', 0.25).translateY(1.4)); } },
    bogen15: { n: 'HT-Bogen 15° / 30°', markt: 'Flache Bögen für kleine Versätze.', bau(g) { g.add(bogen(0.4, 15, HT)); } },
    bogen87: { n: 'HT-Bogen 87°', markt: 'Nur senkrecht → waagerecht am Objektanschluss. In liegenden Leitungen 2 × 45° verwenden.', bau(g) { g.add(bogen(0.4, 87, HT)); g.add(schild('87° – sparsam!', '#ff8a7a', 0.22).translateY(1.5)); } },
    abzweig45: { n: 'HT-Abzweig 45°', markt: 'Für Zuläufe in liegende Leitungen – mündet schräg in Fließrichtung ein.', bau(g) { const r = 0.4; g.add(rohr(v3(0, -1.3, 0), v3(0, 1.1, 0), r, HT)); g.add(muffe(v3(0, 1.3, 0), v3(0, 1, 0), r, HT)); const a = v3(0, -0.2, 0), b = v3(0.85, 0.65, 0); g.add(rohr(a, b, r * 0.98, HT)); g.add(muffe(b.clone().add(v3(0.12, 0.12, 0)), v3(1, 1, 0), r, HT)); g.add(schild('45°', '#9fd69f', 0.22).translateX(0.9).translateY(1.2)); } },
    abzweig87: { n: 'HT-Abzweig 87° (T-Stück)', markt: 'Nur zum Einmünden in die senkrechte Fallleitung – nicht in liegenden Leitungen.', bau(g) { const r = 0.45; g.add(rohr(v3(0, -1.3, 0), v3(0, 1.1, 0), r, HT)); g.add(muffe(v3(0, 1.3, 0), v3(0, 1, 0), r, HT)); g.add(rohr(v3(0, 0, 0), v3(1.0, 0.05, 0), r * 0.98, HT)); g.add(muffe(v3(1.15, 0.05, 0), v3(1, 0, 0), r, HT)); } },
    reduzierung: { n: 'HT-Reduzierung (z. B. DN 100 auf 50)', markt: 'Übergang auf kleinere Nennweite – nur gegen die Fließrichtung erlaubt (in Fließrichtung nie kleiner werden).', bau(g) { g.add(mesh(new T.CylinderGeometry(0.25, 0.5, 0.8, 28, 1, true), mat(HT, { side: T.DoubleSide }))); g.add(muffe(v3(0, -0.6, 0), v3(0, -1, 0), 0.5, HT)); g.add(rohr(v3(0, 0.4, 0), v3(0, 1.0, 0), 0.25, HT)); } },
    wc_bogen: { n: 'WC-Anschlussbogen 90° / Anschlussgarnitur', markt: 'Verbindet WC-Abgang mit dem Abflussrohr DN 90/100, weiß, mit großer Lippendichtung.', bau(g) { const gb = bogen(0.5, 90, WEISS); g.add(gb); const lip = mesh(new T.TorusGeometry(0.62, 0.1, 12, 32), mat('#222')); lip.position.set(-0.6 * 1.2 + 1.2 - 1.2, 0, 0); g.add(schild('DN 90/100', '#ffd27a', 0.22).translateY(1.6)); } },
    siphon: { n: 'Röhrensiphon (Geruchsverschluss)', markt: 'Unter Waschtisch/Spüle. Das stehende Wasser im U hält Kanalgeruch zurück.', bau(g) {
      const kurve = new T.CatmullRomCurve3([v3(0, 1.3, 0), v3(0, 0.2, 0), v3(0.05, -0.35, 0), v3(0.45, -0.5, 0), v3(0.85, -0.3, 0), v3(0.9, 0.2, 0), v3(1.0, 0.45, 0), v3(1.6, 0.5, 0)]);
      g.add(mesh(new T.TubeGeometry(kurve, 80, 0.16, 20, false), mat(CHROM, { metalness: 0.85, roughness: 0.2 })));
      [v3(0, 1.0, 0), v3(0.9, 0.2, 0)].forEach((p) => { const m = mesh(new T.CylinderGeometry(0.22, 0.22, 0.18, 6), mat(CHROM, { metalness: 0.9, roughness: 0.25 })); m.position.copy(p); g.add(m); });
      const wasser = mesh(new T.SphereGeometry(0.15, 12, 8), mat('#7ab8ff', { transparent: true, opacity: 0.8 })); wasser.position.set(0.45, -0.48, 0); g.add(wasser);
      g.add(schild('Sperrwasser', '#7ab8ff', 0.18).translateX(0.45).translateY(-0.85)); g.position.x = -0.6; } },
    flaschensiphon: { n: 'Flaschensiphon', markt: 'Platzsparend unter Waschtischen, unten aufschraubbar zum Reinigen.', bau(g) { g.add(zyl(0.12, 1.1, CHROM, 0, 0.7, 0, { metalness: 0.85, roughness: 0.2 })); g.add(zyl(0.32, 0.8, CHROM, 0, -0.1, 0, { metalness: 0.85, roughness: 0.2 })); g.add(rohr(v3(0, 0.05, 0), v3(1.2, 0.05, 0), 0.14, CHROM)); g.add(zyl(0.3, 0.06, '#ddd', 1.3, 0.05, 0).rotateZ(Math.PI / 2)); } },
    rohrschelle: { n: 'Rohrschelle mit Gummieinlage', markt: 'Befestigt Rohre schallgedämmt an der Wand. Abstand ca. 10 × Rohrdurchmesser.', bau(g) { const ring = mesh(new T.TorusGeometry(0.6, 0.05, 10, 40), mat(CHROM, { metalness: 0.8, roughness: 0.3 })); g.add(ring); const gummi = mesh(new T.TorusGeometry(0.55, 0.05, 10, 40), mat('#222')); g.add(gummi); g.add(kiste(0.3, 0.12, 0.1, CHROM, 0, 0.68, 0, { metalness: 0.8 })); g.add(zyl(0.06, 1.0, '#888', 0, 1.2, 0, { metalness: 0.7 })); g.add(rohr(v3(0, 0, -0.8), v3(0, 0, 0.8), 0.5, HT)); } },
    belueft: { n: 'Rohrbelüfter', markt: 'Lässt Luft in die Leitung, damit der Siphon nicht leergesaugt wird – bei langen Leitungen.', bau(g) { g.add(rohr(v3(0, -1.0, 0), v3(0, 0.4, 0), 0.4, HT)); g.add(mesh(new T.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e6e6e6')).translateY(0.5)); g.add(zyl(0.5, 0.15, '#e6e6e6', 0, 0.45, 0)); } },
    eckventil: { n: 'Eckventil', markt: 'Absperrventil an der Wand für Waschtisch, Spüle, WC. Mit Rosette, ½" Wandanschluss, ⅜" Abgang.', bau(g) { const c = { metalness: 0.9, roughness: 0.15 }; g.add(zyl(0.18, 0.8, CHROM, 0, 0, 0, c).rotateX(Math.PI / 2)); g.add(zyl(0.45, 0.05, CHROM, 0, 0, -0.42, c).rotateX(Math.PI / 2)); g.add(zyl(0.12, 0.6, CHROM, 0, 0.32, 0.2, c)); g.add(zyl(0.28, 0.16, '#e5e5e5', 0, 0, 0.45).rotateX(Math.PI / 2)); } },
    flexschlauch: { n: 'Flexschlauch / Anschlussschlauch', markt: 'Verbindet Armatur und Eckventil. Länge passend wählen, nicht knicken.', bau(g) { const k = new T.CatmullRomCurve3([v3(-0.8, 1, 0), v3(-0.6, 0.2, 0.2), v3(0, -0.3, 0), v3(0.6, 0.1, -0.2), v3(0.8, 1, 0)]); g.add(mesh(new T.TubeGeometry(k, 60, 0.07, 10), mat('#bfc4c9', { metalness: 0.9, roughness: 0.35 }))); [v3(-0.8, 1.05, 0), v3(0.8, 1.05, 0)].forEach((p) => g.add(mesh(new T.CylinderGeometry(0.13, 0.13, 0.15, 6), mat(MESS, { metalness: 0.9, roughness: 0.3 }), p.x, p.y, p.z))); } },
    mv_rohr: { n: 'Mehrschichtverbundrohr 16×2', markt: 'Trinkwasserrohr (Kunststoff-Alu-Kunststoff), biegbar, mit Pressfittings.', bau(g) { g.add(rohr(v3(0, -1.2, 0), v3(0, 1.2, 0), 0.32, WEISS)); g.add(mesh(new T.RingGeometry(0.22, 0.26, 32), mat('#b0b0b0', { side: T.DoubleSide, metalness: 0.8 })).translateY(1.21).rotateX(-Math.PI / 2)); } },
    pressfitting: { n: 'Press-T-Stück (Trinkwasser)', markt: 'Wird mit Presszange (passende Kontur!) verpresst. Ausleihen statt kaufen.', bau(g) { const m = { metalness: 0.85, roughness: 0.3 }; g.add(zyl(0.3, 1.8, '#b5b9be', 0, 0, 0, m)); g.add(zyl(0.3, 0.9, '#b5b9be', 0.5, 0, 0, m).rotateZ(Math.PI / 2)); [[0, 0.75, 0, 0], [0, -0.75, 0, 0], [0.85, 0, 0, 1]].forEach(([x, y, z, q]) => { const h = zyl(0.36, 0.35, '#8a8f95', x, y, z, m); if (q) h.rotateZ(Math.PI / 2); g.add(h); }); } },
    up_dose: { n: 'Unterputzdose 68 mm', markt: 'Für Steckdosen/Schalter, Bohrkrone 68 mm. Hohlwanddose für Trockenbau.', bau(g) { g.add(mesh(new T.CylinderGeometry(0.68, 0.64, 0.9, 32, 1, true), mat('#6b8a5a', { side: T.DoubleSide }))); const b = mesh(new T.CircleGeometry(0.64, 32), mat('#6b8a5a', { side: T.DoubleSide })); b.rotation.x = Math.PI / 2; b.position.y = -0.45; g.add(b); [-0.45, 0.45].forEach((x) => g.add(zyl(0.06, 0.8, '#ddd', x, 0, 0))); g.rotation.x = 0.5; } },
    nym: { n: 'Kabel NYM-J 3×1,5 mm²', markt: 'Grau ummantelt; Adern braun (Phase), blau (Neutralleiter), grün-gelb (Schutzleiter). 5×… mit schwarz und grau.', bau(g) { g.add(rohr(v3(0, -1.4, 0), v3(0, 0.6, 0), 0.22, '#d4d4d4')); [['#7a4a2a', -0.09], ['#2f6fd0', 0.09], ['#9ac93a', 0]].forEach(([c, x], i) => { g.add(zyl(0.07, 0.8, c, x, 1.0, i === 2 ? 0.08 : -0.04)); g.add(zyl(0.025, 0.18, '#c9783a', x, 1.48, i === 2 ? 0.08 : -0.04, { metalness: 0.9 })); }); } },
    leerrohr: { n: 'Leerrohr M20/M25 (Wellrohr)', markt: 'Flexibles Rohr für Kabel, später austauschbar.', bau(g) { for (let i = 0; i < 26; i++) g.add(zyl(i % 2 ? 0.26 : 0.3, 0.1, '#7a7f86', 0, -1.3 + i * 0.1, 0)); } }
  };
  window.J4D_TEILE = TEILE;

  /* ---------- Modal ---------- */
  function modal(titel, text, links) {
    let m = document.getElementById('drei-modal');
    if (!m) { m = document.createElement('div'); m.id = 'drei-modal'; m.className = 'drei-modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="dm-box"><div class="zeile"><b style="flex:1;font-size:1.1em">${esc(titel)}</b><button class="x" aria-label="Schließen" id="dm-zu">×</button></div>
      <div class="dm-buehne" id="dm-buehne"></div><div class="klein">Mit dem Finger drehen, mit zwei Fingern zoomen.</div>
      <div class="dm-text">${text}</div><div class="zeile klein-links">${links || ''}</div></div>`;
    m.classList.add('an');
    document.getElementById('dm-zu').onclick = () => { m.classList.remove('an'); const v = m._v; if (v) v.stopp(); };
    return document.getElementById('dm-buehne');
  }

  window.zeigeTeil = function (id, dn) {
    const t = TEILE[id]; if (!t) return;
    const q = encodeURIComponent(t.n.replace(/\(.*\)/, ''));
    const box = modal(t.n, `<p>${esc(t.markt)}</p>`, `<a target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${q}">Echte Fotos ›</a><a target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q=${q}">Kaufen ›</a><a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}+montieren">Video ›</a>`);
    const v = viewer(box, { hg: 0x161616, schattenGroesse: 3 });
    document.getElementById('drei-modal')._v = v;
    v.camera.position.set(2.6, 1.6, 3.4); v.controls.target.set(0, 0, 0);
    const g = new T.Group(); t.bau(g, dn); v.scene.add(g);
    const boden = mesh(new T.CircleGeometry(3, 48), mat('#222')); boden.rotation.x = -Math.PI / 2; boden.position.y = -1.6; v.scene.add(boden);
    v.start();
  };

  /* ---------- Leitung in 3D (Objekt → Fallleitung) ---------- */
  const OBJ_HOEHE = { waschtisch: 0.55, handwaschbecken: 0.55, wc: 0.23, dusche: 0.06, wanne: 0.12, spuele: 0.47, gs: 0.47, wm: 0.75, bodenablauf: 0.03 };
  window.zeigeLeitung = function (o, obj) {
    const L = Math.max(0.3, o.l), boegen = Math.min(6, Math.max(0, Math.round(o.boegen))), r = obj.dn / 2000 * 1.6;
    const gefaelle = L * 0.02;
    const text = `<p><b>${esc(obj.n)}</b> → Fallleitung: ${zahl(L)} m Rohr DN ${obj.dn}, Gefälle 2 % = <b>${zahl(gefaelle * 100, 1)} cm</b> tiefer am Fallrohr${boegen ? `, ${boegen} Richtungsänderung(en) mit je 2 × 45°` : ''}. Am Fallrohr mit Abzweig 87° in die senkrechte DN 100. Blau = fließendes Wasser.</p>`;
    const box = modal('Leitung in 3D', text, '<a href="#" id="dm-teile">Teile ansehen ›</a>');
    const v = viewer(box, { hg: 0x141414, schattenGroesse: Math.max(3, L + 1) });
    document.getElementById('drei-modal')._v = v;
    const sc = v.scene;
    // Raum: Boden + Wand
    const bw = L + 1.6;
    const boden = mesh(new T.PlaneGeometry(bw, 1.6), new T.MeshStandardMaterial({ map: (() => { const t = holzTextur('#bdb6aa', true); t.repeat.set(bw * 2, 3); return t; })(), roughness: 0.8 }));
    boden.rotation.x = -Math.PI / 2; boden.position.set(L / 2, 0, 0.6); sc.add(boden);
    const wand = mesh(new T.PlaneGeometry(bw, 2.4), mat('#e8e4dc', { roughness: 0.9 })); wand.position.set(L / 2, 1.2, -0.2); sc.add(wand);
    // Objekt
    const h0 = OBJ_HOEHE[o.typ] != null ? OBJ_HOEHE[o.typ] : 0.5;
    const og = new T.Group();
    if (o.typ === 'wc') { og.add(kiste(0.5, 1.12, 0.2, '#d8d8d8', 0, 0.56, -0.1)); og.add(kiste(0.24, 0.16, 0.02, WEISS, 0, 1.0, 0.005)); const sch = mesh(new T.CylinderGeometry(0.19, 0.15, 0.36, 28), mat(WEISS, { roughness: 0.25 })); sch.scale.z = 1.45; sch.position.set(0, 0.24 + h0, 0.3); og.add(sch); og.add(kiste(0.34, 0.03, 0.5, WEISS, 0, 0.43 + h0, 0.3)); }
    else if (o.typ === 'waschtisch' || o.typ === 'handwaschbecken' || o.typ === 'spuele' || o.typ === 'gs') { og.add(kiste(0.7, 0.14, 0.48, WEISS, 0, 0.85, 0.05)); og.add(kiste(0.5, 0.06, 0.32, '#9aa', 0, 0.9, 0.05)); og.add(zyl(0.02, 0.2, CHROM, 0, 1.0, -0.12, { metalness: 0.9 })); const s = new T.CatmullRomCurve3([v3(0, 0.78, 0.05), v3(0, 0.6, 0.05), v3(0, h0 - 0.06, 0.12), v3(0, h0, 0.02)]); og.add(mesh(new T.TubeGeometry(s, 30, 0.02, 10), mat(CHROM, { metalness: 0.85, roughness: 0.2 }))); }
    else if (o.typ === 'wm') { og.add(kiste(0.6, 0.85, 0.6, WEISS, 0, 0.425, 0.35)); const tr = zyl(0.17, 0.03, '#555', 0, 0.5, 0.66); tr.rotation.x = Math.PI / 2; og.add(tr); }
    else if (o.typ === 'wanne') { og.add(kiste(0.75, 0.55, 1.4, WEISS, 0, 0.275, 0.55)); }
    else { og.add(kiste(0.9, 0.04, 0.9, '#cfd6da', 0, 0.02, 0.45)); og.add(zyl(0.06, 0.02, CHROM, 0, 0.045, 0.45, { metalness: 0.9 })); }
    sc.add(og);
    // Leitungsverlauf: Austritt → in Wand → mit Gefälle zum Fallrohr, Bögen als Versatz
    const pts = [v3(0, h0, 0.02), v3(0.18, h0 - 0.004, -0.06)];
    const n = boegen, schritt = (L - 0.25) / (n + 1);
    let x = 0.18, z = -0.06, y = h0 - 0.004;
    for (let i = 0; i < n; i++) { x += schritt; y = h0 - (x / L) * gefaelle; pts.push(v3(x, y, z)); const dz = (i % 2 ? 1 : -1) * 0.1; x += 0.1; z += dz; y = h0 - (x / L) * gefaelle; pts.push(v3(x, y, z)); }
    const fx = L + 0.08; pts.push(v3(fx - 0.12, h0 - gefaelle, z)); pts.push(v3(fx, h0 - gefaelle, -0.06));
    for (let i = 0; i < pts.length - 1; i++) { sc.add(rohr(pts[i], pts[i + 1], r, HT)); if (i > 0) { const k = mesh(new T.SphereGeometry(r * 1.22, 18, 12), mat('#868b90')); k.position.copy(pts[i]); sc.add(k); } }
    // Fallrohr
    const fr = 0.055 * 1.6; sc.add(rohr(v3(fx + fr * 0.4, -0.2, -0.06), v3(fx + fr * 0.4, 2.4, -0.06), fr, HT));
    const abz = mesh(new T.SphereGeometry(fr * 1.3, 18, 12), mat('#868b90')); abz.position.set(fx + fr * 0.4, h0 - gefaelle, -0.06); sc.add(abz);
    // Beschriftungen
    sc.add(schild('DN ' + obj.dn + ' · ' + zahl(L) + ' m', '#ffd27a', 0.09).translateX(L / 2).translateY(h0 + 0.22).translateZ(0.1));
    sc.add(schild('Gefälle 2 % = ' + zahl(gefaelle * 100, 1) + ' cm', '#7ab8ff', 0.08).translateX(L / 2).translateY(h0 - 0.2).translateZ(0.15));
    sc.add(schild('Fallrohr DN 100', '#e9e9e9', 0.08).translateX(fx).translateY(2.0).translateZ(0.1));
    sc.add(schild('Abzweig 87°', '#9fd69f', 0.07).translateX(fx + 0.1).translateY(h0 - gefaelle - 0.16).translateZ(0.12));
    if (n) sc.add(schild(n + ' × (2 × 45°)', '#9fd69f', 0.07).translateX(Math.min(L * 0.5, 0.18 + schritt)).translateY(h0 + 0.05).translateZ(0.25));
    // Wasserteilchen entlang des Pfads
    const pfad = new T.CurvePath(); for (let i = 0; i < pts.length - 1; i++) pfad.add(new T.LineCurve3(pts[i], pts[i + 1]));
    pfad.add(new T.LineCurve3(v3(fx + fr * 0.4, h0 - gefaelle, -0.06), v3(fx + fr * 0.4, -0.2, -0.06)));
    const tropfen = []; const tm = mat('#4aa3ff', { emissive: new T.Color('#1a4a8a'), roughness: 0.2 });
    for (let i = 0; i < 14; i++) { const t = mesh(new T.SphereGeometry(r * 0.45, 10, 8), tm); t.castShadow = false; t.userData.u = i / 14; sc.add(t); tropfen.push(t); }
    v.tick.push((dt) => tropfen.forEach((t) => { t.userData.u = (t.userData.u + dt * 0.12) % 1; t.position.copy(pfad.getPointAt(t.userData.u)); }));
    // Rohre leicht durchsichtig machen? Nein – Tropfen sitzen sichtbar darüber
    tropfen.forEach((t) => { t.renderOrder = 5; t.material.depthTest = false; });
    v.camera.position.set(L / 2 + 0.4, 1.4, 2.4 + L * 0.35); v.controls.target.set(L / 2, h0 * 0.7, 0); v.controls.autoRotate = false;
    v.start();
    const tl = document.getElementById('dm-teile');
    if (tl) tl.onclick = (e) => { e.preventDefault(); e.stopPropagation(); zeigeTeil(o.typ === 'wc' ? 'wc_bogen' : 'bogen45'); };
  };

  /* ---------- Raum in 3D ---------- */
  const WAND_HOEHE = { 'Bild': 140, 'Spiegel': 115, 'Spiegel groß': 30, 'Fernseher an Wand': 100, 'Hängeschrank': 145, 'Spiegelschrank': 120, 'Wandleuchte': 180, 'Rauchmelder': 245, 'Deckenleuchte': 235, 'Spots': 245, 'Indirektes Licht': 240, 'Pendelleuchte': 150, 'Lüfter': 215, 'Handtuchheizkörper': 40, 'Heizkörper': 15, 'Steckdose': 30, 'Thermostat': 150, 'WLAN': 200, 'Akustikpaneel': 140, 'Leinwand': 70, 'Beamer': 230, 'Lochwand': 100, 'Fliesenspiegel': 90, 'Monitorarm': 75, 'Leselampe': 50, 'Netzwerkdose': 30, 'Lichtschacht': 0, 'Wandregal': 60, 'Vorhang': 0, 'Garagentor': 210 };
  function hoehe(n) { const k = Object.keys(WAND_HOEHE).find((x) => n.indexOf(x) === 0); return k ? WAND_HOEHE[k] / 100 : 0; }

  function modell(e, farbe, akzent) {
    const g = new T.Group(), n = e.n, w = e.w / 100, d = Math.max(0.03, e.d / 100), h = Math.max(0.02, e.h / 100);
    const holz = '#a27b55', WEI = '#f4f4f4';
    const is = (re) => re.test(n);
    if (is(/Sofa|Ecksofa|Schlafsofa|Sessel|Kinosessel|Lounge/)) {
      g.add(kiste(w, h * 0.45, d, farbe, 0, h * 0.225, 0)); g.add(kiste(w, h, d * 0.25, farbe, 0, h / 2, -d * 0.375));
      g.add(kiste(w * 0.1, h * 0.65, d, farbe, -w * 0.45, h * 0.325, 0)); g.add(kiste(w * 0.1, h * 0.65, d, farbe, w * 0.45, h * 0.325, 0));
      const k = new T.Color(farbe).offsetHSL(0, 0, 0.08).getStyle(); g.add(kiste(w * 0.78, 0.1, d * 0.68, k, 0, h * 0.5, d * 0.1));
    } else if (is(/[Bb]ett|Hochbett/) && !is(/Babybett/)) {
      const hb = is(/Hochbett/) ? 1.2 : 0; g.add(kiste(w, 0.28, d, holz, 0, 0.14 + hb, 0)); g.add(kiste(w * 0.95, 0.2, d * 0.94, WEI, 0, 0.38 + hb, 0.01));
      g.add(kiste(w, 0.9, 0.06, holz, 0, 0.45 + hb, -d / 2)); [-1, 1].forEach((s) => g.add(kiste(w * 0.36, 0.1, 0.35, '#e8e2d6', s * w * 0.22, 0.53 + hb, -d / 2 + 0.25))); g.add(kiste(w * 0.95, 0.05, d * 0.55, akzent, 0, 0.5 + hb, d * 0.18));
      if (hb) [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(kiste(0.07, 1.8, 0.07, holz, a * w / 2, 0.9, b * d / 2)));
    } else if (is(/Babybett/)) { g.add(kiste(w, 0.1, d, WEI, 0, 0.35, 0)); for (let i = 0; i < 9; i++) { g.add(kiste(0.03, 0.55, 0.03, WEI, -w / 2 + i * w / 8, 0.62, d / 2)); g.add(kiste(0.03, 0.55, 0.03, WEI, -w / 2 + i * w / 8, 0.62, -d / 2)); } [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(kiste(0.05, 0.9, 0.05, WEI, a * w / 2, 0.45, b * d / 2)));
    } else if (is(/[Tt]isch|Werkbank|Kücheninsel/) && !is(/Nachttisch|Schreibtischleuchte/)) {
      const th = h; g.add(kiste(w, 0.04, d, is(/Werkbank/) ? holz : farbe, 0, th - 0.02, 0));
      if (is(/Kücheninsel/)) g.add(kiste(w * 0.98, th - 0.04, d * 0.96, WEI, 0, (th - 0.04) / 2, 0));
      else [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(kiste(0.05, th - 0.04, 0.05, '#333', a * (w / 2 - 0.05), (th - 0.04) / 2, b * (d / 2 - 0.05))));
    } else if (is(/Stuhl|Hantelbank|Sitzbank|Bank/)) {
      g.add(kiste(w, 0.05, d, farbe, 0, 0.46, 0)); if (is(/Stuhl/)) g.add(kiste(w, h - 0.46, 0.04, farbe, 0, (h + 0.46) / 2, -d / 2));
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(kiste(0.035, 0.44, 0.035, '#333', a * (w / 2 - 0.03), 0.22, b * (d / 2 - 0.03))));
    } else if (is(/WC/)) {
      g.add(kiste(w + 0.12, 1.1, 0.15, '#d9d9d9', 0, 0.55, -d / 2 + 0.07)); g.add(kiste(0.24, 0.16, 0.02, WEI, 0, 1.0, -d / 2 + 0.16));
      const s = mesh(new T.CylinderGeometry(0.18, 0.14, 0.34, 28), mat(WEI, { roughness: 0.25 })); s.scale.z = 1.4; s.position.set(0, 0.25 + 0.17, 0.05); g.add(s); g.add(kiste(0.35, 0.03, 0.5, WEI, 0, 0.42, 0.05));
    } else if (is(/Waschtisch|Handwaschbecken|Spüle|Waschbecken|Ausgussbecken/)) {
      g.add(kiste(w, 0.55, d * 0.95, is(/Spüle/) ? farbe : holz, 0, 0.3, 0)); g.add(kiste(w, 0.06, d, WEI, 0, h - 0.03, 0)); g.add(kiste(w * 0.6, 0.02, d * 0.6, '#9aa4a8', 0, h + 0.001, 0.02));
      g.add(zyl(0.02, 0.22, CHROM, 0, h + 0.11, -d / 2 + 0.06, { metalness: 0.9, roughness: 0.2 })); g.add(kiste(0.03, 0.02, 0.14, CHROM, 0, h + 0.21, -d / 2 + 0.12, { metalness: 0.9 }));
    } else if (is(/Dusche/)) {
      g.add(kiste(w, 0.03, d, '#d6dadd', 0, 0.015, 0)); g.add(kiste(0.01, 2.0, d, '#bfe3f0', w / 2, 1.0, 0, { transparent: true, opacity: 0.28, roughness: 0.05 }));
      g.add(zyl(0.012, 1.1, CHROM, -w / 2 + 0.05, 1.5, -d / 2 + 0.05, { metalness: 0.9 })); g.add(zyl(0.12, 0.02, CHROM, -w / 2 + 0.2, 2.05, -d / 2 + 0.15, { metalness: 0.9 }));
    } else if (is(/Badewanne/)) { g.add(kiste(w, h, d, WEI, 0, h / 2, 0)); g.add(kiste(w * 0.86, 0.02, d * 0.78, '#bfe3f0', 0, h - 0.05, 0, { roughness: 0.1 }));
    } else if (is(/Waschmaschine|Trockner|Geschirrspüler|Wasch-Trocken/)) {
      g.add(kiste(w, h, d, WEI, 0, h / 2, 0)); const tr = zyl(w * 0.28, 0.02, '#4a5258', 0, h * 0.5, d / 2 + 0.005, { metalness: 0.5, roughness: 0.2 }); tr.rotation.x = Math.PI / 2; if (!is(/Geschirr/)) g.add(tr);
      if (is(/Wasch-Trocken/)) { const t2 = tr.clone(); t2.position.y = h * 0.78; g.add(t2); tr.position.y = h * 0.25; }
    } else if (is(/Herd|Kochfeld|Backofen/)) { g.add(kiste(w, h, d, WEI, 0, h / 2, 0)); g.add(kiste(w * 0.95, 0.01, d * 0.9, '#111', 0, h + 0.005, 0, { roughness: 0.1 })); g.add(kiste(w * 0.8, h * 0.45, 0.01, '#222', 0, h * 0.45, d / 2 + 0.005, { roughness: 0.1 }));
    } else if (is(/Kühlschrank/)) { g.add(kiste(w, h, d, '#dfe3e6', 0, h / 2, 0, { metalness: 0.3, roughness: 0.3 })); g.add(kiste(0.02, 0.4, 0.03, '#888', w / 2 - 0.06, h * 0.7, d / 2 + 0.02));
    } else if (is(/Regal|Lochwand|Wandregal|Vorratsregal|Schwerlast|Kellerregal|Spielzeugregal|Schranksystem/)) {
      const n2 = Math.max(2, Math.round(h / 0.38)); [-1, 1].forEach((s) => g.add(kiste(0.025, h, d, farbe, s * (w / 2 - 0.012), h / 2, 0)));
      for (let i = 0; i <= n2; i++) g.add(kiste(w, 0.025, d, farbe, 0, i * (h - 0.025) / n2 + 0.012, 0));
      for (let i = 0; i < n2; i++) for (let j = 0; j < 3; j++) g.add(kiste(w * 0.12, 0.18, d * 0.7, ['#c96a4a', '#5a7a9a', '#d9c27a'][(i + j) % 3], -w / 2 + w * (0.2 + j * 0.25), i * (h - 0.025) / n2 + 0.11, 0));
    } else if (is(/[Ss]chrank|Kommode|Sideboard|Board|Vitrine|Garderobe|Unterschrank|Hängeschrank|Hochschrank|Aktenschrank|Schuhschrank|Nachttisch|Wickelkommode|Kniestock/)) {
      const ye = hoehe(n); g.add(kiste(w, h, d, farbe, 0, ye + h / 2, 0));
      const tueren = Math.max(1, Math.round(w / 0.5)); for (let i = 1; i < tueren; i++) g.add(kiste(0.006, h * 0.94, 0.005, '#000', -w / 2 + i * w / tueren, ye + h / 2, d / 2 + 0.003, { transparent: true, opacity: 0.35 }));
      for (let i = 0; i < tueren; i++) g.add(kiste(0.015, 0.12, 0.02, '#777', -w / 2 + (i + 0.5) * w / tueren + (i % 2 ? -0.05 : 0.05) * (w / tueren), ye + h * 0.55, d / 2 + 0.012, { metalness: 0.8 }));
    } else if (is(/Stehleuchte/)) { g.add(zyl(0.14, 0.03, '#222', 0, 0.015, 0)); g.add(zyl(0.012, h - 0.25, '#222', 0, (h - 0.25) / 2, 0)); const sh = mesh(new T.CylinderGeometry(0.12, 0.2, 0.28, 24, 1, true), mat('#f3e7c9', { side: T.DoubleSide, emissive: new T.Color('#6b5a2a') })); sh.position.y = h - 0.12; g.add(sh); const l = new T.PointLight(0xffe2b0, 0.5, 4); l.position.y = h - 0.2; g.add(l);
    } else if (is(/Pendelleuchte/)) { g.add(zyl(0.004, 0.9, '#222', 0, 1.95, 0)); const sh = mesh(new T.ConeGeometry(0.22, 0.25, 24, 1, true), mat('#222', { side: T.DoubleSide })); sh.position.y = 1.5; g.add(sh); const b = mesh(new T.SphereGeometry(0.05, 12, 8), mat('#fff', { emissive: new T.Color('#ffd27a') })); b.position.y = 1.45; g.add(b); const l = new T.PointLight(0xffe2b0, 0.6, 4); l.position.y = 1.4; g.add(l);
    } else if (is(/Deckenleuchte|Spots|Einbaustrahler|Rauchmelder|Lüfter|Beamer/)) { const m = zyl(Math.min(w, d) / 2, 0.05, is(/Beamer/) ? '#333' : '#fff', 0, 2.45, 0, { emissive: new T.Color(is(/Leuchte|Spots/) ? '#ffd27a' : '#000') }); g.add(m);
    } else if (is(/Indirektes Licht|LED/)) { g.add(kiste(w, 0.03, 0.04, '#fff', 0, 2.4, 0, { emissive: new T.Color('#ffd27a'), emissiveIntensity: 1 }));
    } else if (is(/Pflanze|Kübelpflanze/)) { g.add(mesh(new T.CylinderGeometry(w * 0.32, w * 0.24, 0.35, 20), mat('#7a6a5a'), 0, 0.175, 0)); [[0, 0.75, 0, 0.3], [0.12, 1.0, 0.05, 0.22], [-0.1, 1.1, -0.06, 0.2]].forEach(([x, y, z, r]) => g.add(mesh(new T.SphereGeometry(r * w / 0.5, 16, 12), mat('#4d7a3a'), x, y * h / 1.4, z)));
    } else if (is(/Teppich|Spielecke|Sportboden/)) { g.add(kiste(w, 0.012, d, akzent, 0, 0.006, 0, { roughness: 1 }));
    } else if (is(/Fernseher|Leinwand/)) { const ye = hoehe(n); g.add(kiste(w, h, 0.04, is(/Leinwand/) ? '#f2f2f2' : '#0b0b0b', 0, ye + h / 2, 0, { roughness: 0.2 }));
    } else if (is(/Bild|Akustikpaneel|Tafelwand/)) { const ye = hoehe(n) || 1.2; g.add(kiste(w, h > 1.2 ? 1.2 : h, 0.03, '#2a2a2a', 0, ye + Math.min(h, 1.2) / 2, 0)); g.add(kiste(w * 0.88, Math.min(h, 1.2) * 0.85, 0.035, akzent, 0, ye + Math.min(h, 1.2) / 2, 0));
    } else if (is(/Spiegel/)) { const ye = hoehe(n); g.add(kiste(w, h, 0.02, '#cfd8dc', 0, ye + h / 2, 0, { metalness: 0.95, roughness: 0.05 }));
    } else if (is(/Kamin/)) { g.add(kiste(w, h, d, '#2b2b2b', 0, h / 2, 0, { metalness: 0.4 })); g.add(kiste(w * 0.6, h * 0.4, 0.01, '#ff7a2a', 0, h * 0.45, d / 2 + 0.005, { emissive: new T.Color('#ff5a1a'), emissiveIntensity: 0.8 })); g.add(zyl(0.08, 2.5 - h, '#2b2b2b', 0, h + (2.5 - h) / 2, -d * 0.2));
    } else if (is(/Vorhang|Gardine/)) { for (let i = 0; i < 10; i++) g.add(kiste(w / 10, 2.4, 0.05, i % 2 ? farbe : new T.Color(farbe).offsetHSL(0, 0, -0.05).getStyle(), -w / 2 + (i + 0.5) * w / 10, 1.2, (i % 2) * 0.03));
    } else if (is(/Heizkörper/)) { const ye = hoehe(n); for (let i = 0; i < Math.round(w / 0.05); i++) g.add(kiste(0.03, h, 0.08, WEI, -w / 2 + i * 0.05 + 0.025, ye + h / 2, 0));
    } else if (is(/Auto/)) { g.add(kiste(w, h * 0.5, d, akzent, 0, h * 0.35, 0, { metalness: 0.6, roughness: 0.3 })); g.add(kiste(w * 0.9, h * 0.4, d * 0.5, '#223', 0, h * 0.8, -d * 0.05, { metalness: 0.5, roughness: 0.1 })); [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => { const r = zyl(0.33, 0.22, '#111', a * w / 2, 0.33, b * d * 0.33); r.rotation.z = Math.PI / 2; g.add(r); });
    } else if (is(/Tür$/)) { g.add(kiste(w, h, 0.04, '#f0ece4', 0, h / 2, 0)); g.add(kiste(0.12, 0.02, 0.05, '#888', w * 0.38, 1.05, 0.04, { metalness: 0.8 }));
    } else if (is(/Fenster|Dachfenster/)) { g.add(kiste(w, h, 0.08, '#f4f4f4', 0, 0.9 + h / 2, 0)); g.add(kiste(w * 0.9, h * 0.9, 0.09, '#9fd3ef', 0, 0.9 + h / 2, 0, { transparent: true, opacity: 0.5, roughness: 0.05 }));
    } else if (is(/Laufband/)) { g.add(kiste(w, 0.2, d, '#333', 0, 0.1, 0)); g.add(kiste(w * 0.8, 0.02, d * 0.85, '#111', 0, 0.21, 0)); g.add(kiste(w, 0.06, 0.15, '#333', 0, h, -d / 2 + 0.1)); [-1, 1].forEach((s) => g.add(kiste(0.05, h, 0.05, '#555', s * w / 2, h / 2, -d / 2 + 0.1)));
    } else {
      const ye = hoehe(n);
      g.add(mesh(new T.BoxGeometry(w, h, d), mat(farbe, { roughness: 0.6 }), 0, ye + h / 2, 0));
    }
    return g;
  }

  let raumKamera = null;
  window.zeigeRaum3D = function (box, p, stil, auswahlId, beiAuswahl) {
    const B = p.breite / 100, D = p.tiefe / 100, H = 2.5;
    const v = viewer(box, { hg: 0x0d0d0d, schattenGroesse: Math.max(B, D) });
    const sc = v.scene;
    const nass = ['bad', 'gaestewc', 'kueche', 'waschraum', 'keller', 'heizungsraum', 'garage'].includes(p.raum);
    const bt = holzTextur(stil ? stil.boden : (nass ? '#cfcac2' : '#b8916a'), nass); bt.repeat.set(B * (nass ? 1.6 : 1.2), D * (nass ? 1.6 : 1.2));
    const boden = mesh(new T.PlaneGeometry(B, D), new T.MeshStandardMaterial({ map: bt, roughness: 0.75 })); boden.rotation.x = -Math.PI / 2; sc.add(boden);
    // Wände nach innen gerichtet – von außen unsichtbar (Puppenhaus-Ansicht)
    const wf = stil ? stil.wand : '#ece8e1';
    const wand = (w, x, z, ry) => { const m = mesh(new T.PlaneGeometry(w, H), mat(wf, { roughness: 0.95, side: T.FrontSide })); m.position.set(x, H / 2, z); m.rotation.y = ry; sc.add(m); const sockel = mesh(new T.PlaneGeometry(w, 0.07), mat('#fafafa')); sockel.position.set(x, 0.035, z); sockel.rotation.y = ry; sockel.translateZ(0.003); sc.add(sockel); };
    wand(B, 0, -D / 2, 0); wand(B, 0, D / 2, Math.PI); wand(D, -B / 2, 0, Math.PI / 2); wand(D, B / 2, 0, -Math.PI / 2);
    // Fenster an der Rückwand (Lichtschein)
    const fen = mesh(new T.PlaneGeometry(Math.min(1.2, B * 0.4), 1.3), mat('#bfe6ff', { emissive: new T.Color('#9fd3ef'), emissiveIntensity: 0.6 })); fen.position.set(B * 0.2, 1.55, -D / 2 + 0.004); sc.add(fen);
    const raumLicht = new T.PointLight(0xfff1dd, 0.35, 10); raumLicht.position.set(0, 2.3, 0); sc.add(raumLicht);
    const objekte = [];
    (p.plan || []).forEach((e) => {
      const farbe = stil && e.g === 'Möbel' ? stil.moebel : (window.GRUPPEN_FARBE_3D[e.g] || '#aaa');
      const g = modell(e, farbe, stil ? stil.akzent : '#7a9ab8');
      const rot = (e.rot || 0) % 180 !== 0, ew = (rot ? e.d : e.w) / 100, ed = (rot ? e.w : e.d) / 100;
      g.position.set(e.x / 100 + ew / 2 - B / 2, 0, e.y / 100 + ed / 2 - D / 2);
      g.rotation.y = -(e.rot || 0) * Math.PI / 180;
      g.userData.id = e.id;
      g.traverse((c) => { c.userData.id = e.id; });
      if (e.id === auswahlId) { const bb = new T.Box3().setFromObject(g); const hl = new T.Box3Helper(bb, 0xffffff); sc.add(hl); }
      sc.add(g); objekte.push(g);
    });
    if (raumKamera && raumKamera.raum === p.id) { v.camera.position.copy(raumKamera.pos); v.controls.target.copy(raumKamera.ziel); v.controls.autoRotate = false; }
    else { const m = Math.max(B, D); v.camera.position.set(B * 0.75, m * 0.95 + 1.2, D * 0.95 + m * 0.55); v.controls.target.set(0, 0.6, 0); }
    v.controls.maxPolarAngle = Math.PI * 0.49; v.controls.minDistance = 1; v.controls.maxDistance = 25;
    v.controls.addEventListener('change', () => { raumKamera = { raum: p.id, pos: v.camera.position.clone(), ziel: v.controls.target.clone() }; });
    // Antippen = auswählen
    const ray = new T.Raycaster(), maus = new T.Vector2(); let down = null;
    v.renderer.domElement.addEventListener('pointerdown', (ev) => { down = [ev.clientX, ev.clientY]; });
    v.renderer.domElement.addEventListener('pointerup', (ev) => {
      if (!down || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 6) return;
      const r = v.renderer.domElement.getBoundingClientRect();
      maus.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(maus, v.camera);
      const hit = ray.intersectObjects(objekte, true)[0];
      if (beiAuswahl) beiAuswahl(hit ? hit.object.userData.id : null);
    });
    v.raum = { objekte, B, D };
    v.bewegen = (e) => { const g = objekte.find((o) => o.userData.id === e.id); if (!g) return; const rot = (e.rot || 0) % 180 !== 0, ew = (rot ? e.d : e.w) / 100, ed = (rot ? e.w : e.d) / 100; g.position.x = e.x / 100 + ew / 2 - B / 2; g.position.z = e.y / 100 + ed / 2 - D / 2; };
    window.raum3DViewer = v;
    v.start();
    return v;
  };

  /* ---------- Vorher/Nachher-Film (Hochformat wie Shorts/Reels) ---------- */
  const leicht = (t) => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  const huepfen = (t) => { if (t <= 0) return 0; if (t >= 1) return 1; const n = 7.5625, d = 2.75; let x = t; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
  let film = null;
  window.zeigeFilm = function (p, stil, extra) {
    if (film) film.stopp();
    let m = document.getElementById('film-modal');
    if (!m) { m = document.createElement('div'); m.id = 'film-modal'; m.className = 'film-modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="film-box"><div class="zeile"><b style="flex:1">Vorher / Nachher</b><button class="x" id="film-zu" aria-label="Schließen">×</button></div>
      <div class="film-buehne" id="film-buehne"></div>
      <div class="zeile"><button class="btn" id="film-neu">Nochmal abspielen</button><button class="btn hell" id="film-rec">Als Video speichern</button></div>
      <div class="klein" id="film-info">Vorschau deines Raums – Farben, Boden und Möbel aus deinem Planer.</div></div>`;
    m.classList.add('an');
    const buehne = document.getElementById('film-buehne');
    const W = Math.min(360, Math.floor(window.innerWidth * 0.9)), H = Math.min(Math.floor(W * 16 / 9), Math.floor(window.innerHeight * 0.66));
    const W2 = Math.floor(H * 9 / 16);
    const pr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(pr); renderer.setSize(W2, H); renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.setClearColor(0x0a0a0a);
    const ausgabe = document.createElement('canvas'); ausgabe.width = W2 * pr; ausgabe.height = H * pr; ausgabe.style.width = W2 + 'px'; ausgabe.style.height = H + 'px';
    const ctx = ausgabe.getContext('2d');
    buehne.appendChild(ausgabe);
    const sc = new T.Scene();
    const camera = new T.PerspectiveCamera(50, W2 / H, 0.05, 100);
    const hemi = new T.HemisphereLight(0xffffff, 0x333333, 0.35); sc.add(hemi);
    const sonne = new T.DirectionalLight(0xffffff, 0.5); sonne.position.set(3, 7, 4); sonne.castShadow = true; sonne.shadow.mapSize.set(1024, 1024);
    const B = p.breite / 100, D = p.tiefe / 100, Hh = 2.5, gr = Math.max(B, D);
    Object.assign(sonne.shadow.camera, { left: -gr, right: gr, top: gr, bottom: -gr }); sc.add(sonne);
    // Rohbau
    const beton = mat('#8d8a86', { roughness: 1 });
    const rohBoden = mesh(new T.PlaneGeometry(B, D), beton); rohBoden.rotation.x = -Math.PI / 2; sc.add(rohBoden);
    const nass = ['bad', 'gaestewc', 'kueche', 'waschraum', 'keller', 'heizungsraum', 'garage'].includes(p.raum);
    const bt = holzTextur(stil ? stil.boden : (nass ? '#cfcac2' : '#b8916a'), nass); bt.repeat.set(B * (nass ? 1.6 : 1.2), D * (nass ? 1.6 : 1.2));
    const neuBoden = mesh(new T.PlaneGeometry(B, D), new T.MeshStandardMaterial({ map: bt, roughness: 0.75 }));
    neuBoden.rotation.x = -Math.PI / 2; neuBoden.position.y = 0.005; neuBoden.scale.set(0.0001, 1, 1); sc.add(neuBoden);
    const zielWand = new T.Color(stil ? stil.wand : '#ece8e1'), rohWand = new T.Color('#9a9692');
    const wandMat = new T.MeshStandardMaterial({ color: rohWand.clone(), roughness: 0.95 });
    const wand = (w, x, z, ry) => { const me = mesh(new T.PlaneGeometry(w, Hh), wandMat); me.position.set(x, Hh / 2, z); me.rotation.y = ry; sc.add(me); };
    wand(B, 0, -D / 2, 0); wand(B, 0, D / 2, Math.PI); wand(D, -B / 2, 0, Math.PI / 2); wand(D, B / 2, 0, -Math.PI / 2);
    const fen = mesh(new T.PlaneGeometry(Math.min(1.2, B * 0.4), 1.3), mat('#bfe6ff', { emissive: new T.Color('#9fd3ef'), emissiveIntensity: 0.7 })); fen.position.set(B * 0.2, 1.55, -D / 2 + 0.004); sc.add(fen);
    const lampe = new T.PointLight(0xffe2b8, 0, 12); lampe.position.set(0, 2.3, 0); sc.add(lampe);
    // Möbel
    const teile = (p.plan || []).map((e) => {
      const farbe = stil && e.g === 'Möbel' ? stil.moebel : ((window.GRUPPEN_FARBE_3D || {})[e.g] || '#aaa');
      const g = modell(e, farbe, stil ? stil.akzent : '#7a9ab8');
      const rot = (e.rot || 0) % 180 !== 0, ew = (rot ? e.d : e.w) / 100, ed = (rot ? e.w : e.d) / 100;
      g.position.set(e.x / 100 + ew / 2 - B / 2, 3, e.y / 100 + ed / 2 - D / 2); g.rotation.y = -(e.rot || 0) * Math.PI / 180; g.visible = false;
      sc.add(g); return { g, n: e.n };
    });
    const T_ROH = 2.2, T_WAND = 2.4, T_BODEN = 2.4, T_JE = 0.55, T_LICHT = 1.6, T_ENDE = 5.5;
    const tWand = T_ROH, tBoden = tWand + T_WAND, tMoebel = tBoden + T_BODEN, tLicht = tMoebel + Math.max(1, teile.length) * T_JE + 0.6, tEnde = tLicht + T_LICHT, tAus = tEnde + T_ENDE;
    let start = performance.now(), laeuft = true, rec = null;
    const titel = (extra && extra.titel) || p.name;
    function schrift(text, y, groesse, farbe, fett) {
      ctx.font = (fett ? '600 ' : '500 ') + groesse * pr + 'px Jost, Arial, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(text).width + 28 * pr, h = groesse * pr * 1.7;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; const x = ausgabe.width / 2 - w / 2, yy = y * pr - h / 2, r = h / 2;
      ctx.beginPath(); ctx.moveTo(x + r, yy); ctx.arcTo(x + w, yy, x + w, yy + h, r); ctx.arcTo(x + w, yy + h, x, yy + h, r); ctx.arcTo(x, yy + h, x, yy, r); ctx.arcTo(x, yy, x + w, yy, r); ctx.fill();
      ctx.fillStyle = farbe || '#fff'; ctx.fillText(text, ausgabe.width / 2, y * pr + 1);
    }
    function frame() {
      if (!laeuft || !ausgabe.isConnected) { laeuft = false; return; }
      const t = (performance.now() - start) / 1000;
      // Wände streichen
      const kw = leicht((t - tWand) / T_WAND); wandMat.color.copy(rohWand).lerp(zielWand, kw);
      // Boden verlegen (wächst von links nach rechts)
      const kb = leicht((t - tBoden) / T_BODEN); neuBoden.scale.x = Math.max(0.0001, kb); neuBoden.position.x = -B / 2 + B * kb / 2;
      // Möbel fallen nacheinander hinein
      let aktuell = null;
      teile.forEach((o, i) => { const k = (t - tMoebel - i * T_JE) / 0.7; o.g.visible = k > 0; o.g.position.y = 3 * (1 - huepfen(k)); if (k > 0 && k < 1.2) aktuell = o.n; });
      // Licht an
      const kl = leicht((t - tLicht) / T_LICHT);
      hemi.intensity = 0.35 + 0.4 * kl; sonne.intensity = 0.5 + 0.45 * kl; lampe.intensity = 0.55 * kl;
      // Kamera: langsame Fahrt um den Raum, am Ende näher
      const a = 0.6 + t * 0.22, rad = gr * (2.15 - 0.25 * leicht((t - tLicht) / 4)), hoch = gr * 1.15 + 0.9 - 0.3 * leicht((t - tLicht) / 4);
      camera.position.set(Math.sin(a) * rad, hoch, Math.cos(a) * rad); camera.lookAt(0, 0.7, 0);
      renderer.render(sc, camera);
      ctx.drawImage(renderer.domElement, 0, 0, ausgabe.width, ausgabe.height);
      // Texte
      let cap = 'Vorher: Rohbau', farbe = '#ffd27a';
      if (t >= tWand) cap = 'Wände streichen'; if (t >= tBoden) cap = nass ? 'Fliesen legen' : 'Boden verlegen';
      if (t >= tMoebel) cap = aktuell || 'Einrichten'; if (t >= tLicht) { cap = 'Licht an'; } if (t >= tEnde) { cap = 'Nachher – so sieht es aus'; farbe = '#9fd69f'; }
      schrift(titel.length > 34 ? titel.slice(0, 33) + '…' : titel, 26, 13, '#fff', false);
      schrift(cap, H - 60, 18, farbe, true);
      if (t >= tEnde) schrift((stil ? 'Stil ' + stil.name + ' · ' : '') + teile.length + ' Elemente · ' + (Math.round(B * D * 10) / 10).toString().replace('.', ',') + ' m²', H - 28, 12, '#ddd', false);
      // Fortschrittsbalken
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(16 * pr, 48 * pr, ausgabe.width - 32 * pr, 3 * pr);
      ctx.fillStyle = '#fff'; ctx.fillRect(16 * pr, 48 * pr, (ausgabe.width - 32 * pr) * Math.min(1, t / tAus), 3 * pr);
      if (t > tAus + 1.5) { if (rec && rec.state === 'recording') rec.stop(); start = performance.now(); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    film = { stopp() { laeuft = false; renderer.dispose(); } };
    document.getElementById('film-zu').onclick = () => { m.classList.remove('an'); film.stopp(); film = null; };
    document.getElementById('film-neu').onclick = () => { start = performance.now(); };
    document.getElementById('film-rec').onclick = () => {
      const info = document.getElementById('film-info');
      if (!ausgabe.captureStream || !window.MediaRecorder) { info.textContent = 'Video speichern kann dieser Browser nicht. Tipp: Bildschirmaufnahme am Handy nutzen.'; return; }
      try {
        const typ = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((x) => MediaRecorder.isTypeSupported(x)) || '';
        const stueck = []; rec = new MediaRecorder(ausgabe.captureStream(30), typ ? { mimeType: typ } : undefined);
        rec.ondataavailable = (ev) => ev.data.size && stueck.push(ev.data);
        rec.onstop = () => {
          const blob = new Blob(stueck, { type: rec.mimeType || 'video/webm' }); rec = null;
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'joum4d-vorher-nachher.' + (/mp4/.test(blob.type) ? 'mp4' : 'webm');
          document.body.appendChild(a); a.click(); a.remove();
          info.textContent = 'Video fertig. Falls kein Download startet: Bildschirmaufnahme am Handy nutzen (in der Vorschau-Seite sind Downloads gesperrt).';
        };
        start = performance.now(); rec.start(); info.textContent = 'Aufnahme läuft … (' + Math.round(tAus) + ' Sekunden)';
      } catch (e) { info.textContent = 'Aufnahme nicht möglich: ' + e.message; }
    };
  };
})();
