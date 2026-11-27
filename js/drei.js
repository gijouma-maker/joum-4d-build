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
    if (opt.realistisch) { renderer.toneMapping = T.ACESFilmicToneMapping; try { const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture; } catch (e) {} }
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
      if (is(/Kücheninsel/)) {
        g.add(kiste(w * 0.98, th - 0.04, d * 0.96, WEI, 0, (th - 0.04) / 2, 0));
        const a = e.aus || {};
        if (a.kochfeld || a.mulde) { g.add(kiste(0.6, 0.006, 0.52, '#0b0b0b', -w / 2 + 0.45, th + 0.003, 0, { roughness: 0.08, metalness: 0.3 })); [[-0.13, -0.12], [0.13, -0.12], [-0.13, 0.12], [0.13, 0.12]].forEach(([x, z]) => { const r = mesh(new T.RingGeometry(0.07, 0.085, 24), mat('#555', { side: T.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(-w / 2 + 0.45 + x, th + 0.008, z); g.add(r); }); }
        if (a.mulde) g.add(kiste(0.08, 0.008, 0.48, '#2a2a2a', -w / 2 + 0.45, th + 0.007, 0, { metalness: 0.6 }));
        if (a.spuele) { g.add(kiste(0.5, 0.012, 0.4, '#9aa4a8', w / 2 - 0.4, th + 0.002, 0, { metalness: 0.7, roughness: 0.25 })); g.add(zyl(0.015, 0.3, CHROM, w / 2 - 0.4, th + 0.15, -0.25, { metalness: 0.9 })); g.add(kiste(0.03, 0.02, 0.18, CHROM, w / 2 - 0.4, th + 0.3, -0.17, { metalness: 0.9 })); }
        if (a.gs) g.add(kiste(0.58, 0.7, 0.01, '#dcdcdc', w / 2 - 0.4, 0.45, d / 2 + 0.002, { metalness: 0.3 }));
        if (a.haube) { g.add(kiste(0.9, 0.12, 0.6, '#2a2a2a', -w / 2 + 0.45, 1.75, 0, { metalness: 0.5 })); g.add(kiste(0.3, 2.5 - 1.81, 0.3, '#2a2a2a', -w / 2 + 0.45, 1.81 + (2.5 - 1.81) / 2, 0, { metalness: 0.5 })); }
      }
      else [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(kiste(0.05, th - 0.04, 0.05, '#333', a * (w / 2 - 0.05), (th - 0.04) / 2, b * (d / 2 - 0.05))));
    } else if (is(/Barhocker/)) { g.add(zyl(0.18, 0.05, farbe, 0, 0.75, 0)); g.add(zyl(0.025, 0.72, '#333', 0, 0.37, 0, { metalness: 0.7 })); g.add(zyl(0.2, 0.02, '#333', 0, 0.01, 0, { metalness: 0.7 }));
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

  /* Tür an der linken Wand (Mitte); im Bad mit Lüftungsgitter */
  function tuerGruppe(p, B) {
    const g = new T.Group();
    g.add(kiste(0.9, 2.05, 0.04, '#f0ece4', 0, 1.025, 0)); g.add(kiste(0.12, 0.02, 0.05, '#888', 0.32, 1.05, 0.04, { metalness: 0.8 }));
    g.add(kiste(1.0, 0.06, 0.08, '#e6e1d8', 0, 2.08, 0));
    const nass = ['bad', 'gaestewc', 'waschraum'].includes(p.raum);
    if (nass && p.tuer !== 'keine') { [-0.2, 0.2].forEach((x) => { g.add(kiste(0.3, 0.1, 0.046, '#555', x, 0.18, 0)); for (let i = 0; i < 4; i++) g.add(kiste(0.28, 0.008, 0.05, '#222', x, 0.145 + i * 0.022, 0)); }); }
    g.position.set(-B / 2 + 0.03, 0, 0); g.rotation.y = Math.PI / 2;
    g.traverse((c) => { c.userData.tuer = true; });
    return g;
  }
  window.J4D_TUER = tuerGruppe;

  let raumKamera = null;
  window.zeigeRaum3D = function (box, p, stil, auswahlId, beiAuswahl) {
    const B = p.breite / 100, D = p.tiefe / 100, H = 2.5;
    const v = viewer(box, { hg: 0x0d0d0d, schattenGroesse: Math.max(B, D), realistisch: true });
    const sc = v.scene;
    const nass = ['bad', 'gaestewc', 'kueche', 'waschraum', 'keller', 'heizungsraum', 'garage'].includes(p.raum);
    const bt = holzTextur(stil ? stil.boden : (nass ? '#cfcac2' : '#b8916a'), nass); bt.repeat.set(B * (nass ? 1.6 : 1.2), D * (nass ? 1.6 : 1.2));
    const boden = mesh(new T.PlaneGeometry(B, D), new T.MeshStandardMaterial({ map: bt, roughness: 0.75 })); boden.rotation.x = -Math.PI / 2; sc.add(boden);
    // Wände nach innen gerichtet – von außen unsichtbar (Puppenhaus-Ansicht)
    const wf = stil ? stil.wand : '#ece8e1';
    const wand = (w, x, z, ry) => { const m = mesh(new T.PlaneGeometry(w, H), mat(wf, { roughness: 0.95, side: T.FrontSide })); m.position.set(x, H / 2, z); m.rotation.y = ry; sc.add(m); const sockel = mesh(new T.PlaneGeometry(w, 0.07), mat('#fafafa')); sockel.position.set(x, 0.035, z); sockel.rotation.y = ry; sockel.translateZ(0.003); sc.add(sockel); };
    wand(B, 0, -D / 2, 0); wand(B, 0, D / 2, Math.PI); wand(D, -B / 2, 0, Math.PI / 2); wand(D, B / 2, 0, -Math.PI / 2);
    // Fenster an der Rückwand (Lichtschein)
    if (p.fenster !== false) { const fen = mesh(new T.PlaneGeometry(Math.min(1.2, B * 0.4), 1.3), mat('#bfe6ff', { emissive: new T.Color('#9fd3ef'), emissiveIntensity: 0.6 })); fen.position.set(B * 0.2, 1.55, -D / 2 + 0.004); sc.add(fen); }
    sc.add(tuerGruppe(p, B));
    const raumLicht = new T.PointLight(0xfff1dd, 0.35, 10); raumLicht.position.set(0, 2.3, 0); sc.add(raumLicht);
    const objekte = [];
    (p.plan || []).forEach((e) => {
      const farbe = e.farbe || (stil && e.g === 'Möbel' ? stil.moebel : (window.GRUPPEN_FARBE_3D[e.g] || '#aaa'));
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
    if (p.fenster !== false) { const fen = mesh(new T.PlaneGeometry(Math.min(1.2, B * 0.4), 1.3), mat('#bfe6ff', { emissive: new T.Color('#9fd3ef'), emissiveIntensity: 0.7 })); fen.position.set(B * 0.2, 1.55, -D / 2 + 0.004); sc.add(fen); }
    sc.add(tuerGruppe(p, B));
    const lampe = new T.PointLight(0xffe2b8, 0, 12); lampe.position.set(0, 2.3, 0); sc.add(lampe);
    // Möbel
    const teile = (p.plan || []).map((e) => {
      const farbe = e.farbe || (stil && e.g === 'Möbel' ? stil.moebel : ((window.GRUPPEN_FARBE_3D || {})[e.g] || '#aaa'));
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

  /* ---------- 3D-Raum als Bild (für Kino-Tour) ---------- */
  window.raumBild = function (p, stil) {
    const Wb = 900, Hb = 1200;
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(Wb, Hb); renderer.setPixelRatio(1); renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.setClearColor(0x15130f);
    const sc = new T.Scene(), B = p.breite / 100, D = p.tiefe / 100, gr = Math.max(B, D);
    sc.add(new T.HemisphereLight(0xffffff, 0x3a3a3a, 0.8));
    const so = new T.DirectionalLight(0xfff4e0, 0.9); so.position.set(3, 7, 4); so.castShadow = true; so.shadow.mapSize.set(2048, 2048);
    Object.assign(so.shadow.camera, { left: -gr, right: gr, top: gr, bottom: -gr }); sc.add(so);
    const lampe = new T.PointLight(0xffe2b8, 0.45, 12); lampe.position.set(0, 2.3, 0); sc.add(lampe);
    const nass = ['bad', 'gaestewc', 'kueche', 'waschraum', 'keller', 'heizungsraum', 'garage'].includes(p.raum);
    const bt = holzTextur(stil ? stil.boden : (nass ? '#cfcac2' : '#b8916a'), nass); bt.repeat.set(B * (nass ? 1.6 : 1.2), D * (nass ? 1.6 : 1.2));
    const boden = mesh(new T.PlaneGeometry(B, D), new T.MeshStandardMaterial({ map: bt, roughness: 0.75 })); boden.rotation.x = -Math.PI / 2; sc.add(boden);
    const wf = stil ? stil.wand : '#ece8e1';
    [[B, 0, -D / 2, 0], [B, 0, D / 2, Math.PI], [D, -B / 2, 0, Math.PI / 2], [D, B / 2, 0, -Math.PI / 2]].forEach(([w, x, z, ry]) => { const m = mesh(new T.PlaneGeometry(w, 2.5), mat(wf, { roughness: 0.95 })); m.position.set(x, 1.25, z); m.rotation.y = ry; sc.add(m); });
    if (p.fenster !== false) { const fen = mesh(new T.PlaneGeometry(Math.min(1.2, B * 0.4), 1.3), mat('#bfe6ff', { emissive: new T.Color('#9fd3ef'), emissiveIntensity: 0.7 })); fen.position.set(B * 0.2, 1.55, -D / 2 + 0.004); sc.add(fen); }
    sc.add(tuerGruppe(p, B));
    (p.plan || []).forEach((e) => {
      const farbe = e.farbe || (stil && e.g === 'Möbel' ? stil.moebel : ((window.GRUPPEN_FARBE_3D || {})[e.g] || '#aaa'));
      const g = modell(e, farbe, stil ? stil.akzent : '#7a9ab8');
      const rot = (e.rot || 0) % 180 !== 0, ew = (rot ? e.d : e.w) / 100, ed = (rot ? e.w : e.d) / 100;
      g.position.set(e.x / 100 + ew / 2 - B / 2, 0, e.y / 100 + ed / 2 - D / 2); g.rotation.y = -(e.rot || 0) * Math.PI / 180; sc.add(g);
    });
    const cam = new T.PerspectiveCamera(50, Wb / Hb, 0.05, 100);
    cam.position.set(B * 0.55, gr * 1.15 + 0.9, D * 0.5 + gr * 1.3); cam.lookAt(0, 0.6, 0);
    renderer.render(sc, cam);
    const url = renderer.domElement.toDataURL('image/jpeg', 0.88);
    renderer.dispose();
    return url;
  };

  /* ---------- 4D-Bauablauf: Grundriss → Durchbruch → Leitungen → Trockenbau → Montage ---------- */
  window.zeigeBau4D = function (p, stil, grundrissUrl) {
    if (film) film.stopp();
    let m = document.getElementById('film-modal');
    if (!m) { m = document.createElement('div'); m.id = 'film-modal'; m.className = 'film-modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="film-box"><div class="zeile"><b style="flex:1">4D-Bauablauf</b><button class="x" id="film-zu" aria-label="Schließen">×</button></div>
      <div class="film-buehne" id="film-buehne"></div>
      <div class="zeile"><button class="btn" id="film-pause">Pause</button><button class="btn" id="film-neu">Von vorn</button><button class="btn hell" id="film-rec">Als Video</button></div>
      <div class="bau-phasen" id="bau-phasen"></div>
      <div class="klein" id="film-info">Automatisch geplant aus deinem Raum und deiner Einrichtung. Antippen eines Schritts springt dorthin.</div></div>`;
    m.classList.add('an');
    const buehne = document.getElementById('film-buehne');
    const H = Math.min(Math.floor(window.innerHeight * 0.58), 640), W2 = Math.floor(H * 9 / 16);
    const pr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(pr); renderer.setSize(W2, H); renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.setClearColor(0x0a0a0a);
    const aus = document.createElement('canvas'); aus.width = W2 * pr; aus.height = H * pr; aus.style.width = W2 + 'px'; aus.style.height = H + 'px';
    const ctx = aus.getContext('2d'); buehne.appendChild(aus);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, W2 / H, 0.05, 100);
    const hemi = new T.HemisphereLight(0xffffff, 0x333333, 0.55); sc.add(hemi);
    const B = p.breite / 100, D = p.tiefe / 100, HW = 2.5, gr = Math.max(B, D), P = 2 * (B + D);
    const so = new T.DirectionalLight(0xffffff, 0.75); so.position.set(3, 8, 5); so.castShadow = true; so.shadow.mapSize.set(1024, 1024);
    Object.assign(so.shadow.camera, { left: -gr, right: gr, top: gr, bottom: -gr }); sc.add(so);
    const raumLicht = new T.PointLight(0xffe2b8, 0, 10); raumLicht.position.set(0, 2.2, 0); sc.add(raumLicht);

    /* Umfang-Koordinaten: s läuft im Uhrzeigersinn ab hinterer linker Ecke */
    function umfang(s, ab) {
      s = ((s % P) + P) % P; ab = ab || 0;
      if (s <= B) return v3(-B / 2 + s, 0, -D / 2 + ab);
      if (s <= B + D) return v3(B / 2 - ab, 0, -D / 2 + (s - B));
      if (s <= 2 * B + D) return v3(B / 2 - (s - B - D), 0, D / 2 - ab);
      return v3(-B / 2 + ab, 0, D / 2 - (s - 2 * B - D));
    }
    function sVon(cx, cz) {
      const d = [cz + D / 2, B / 2 - cx, D / 2 - cz, cx + B / 2], w = d.indexOf(Math.min(...d));
      return [cx + B / 2, B + cz + D / 2, B + D + B / 2 - cx, 2 * B + D + D / 2 - cz][w];
    }
    const ecken = [0, B, B + D, 2 * B + D];
    function weg(s1, s2, y1, y2, ab) { // Punkte entlang der Wand von s1 nach s2 (kürzester Weg), Höhe linear
      let ds = ((s2 - s1) % P + P) % P; let rich = 1; if (ds > P / 2) { ds = P - ds; rich = -1; }
      const pts = [[0]]; ecken.concat(ecken.map((e) => e + P)).forEach((e) => { const t = rich > 0 ? ((e - s1) % P + P) % P : ((s1 - e) % P + P) % P; if (t > 0.001 && t < ds - 0.001) pts.push([t]); });
      pts.push([ds]); pts.sort((a, b) => a[0] - b[0]);
      return pts.map(([t]) => { const q = umfang(s1 + rich * t, ab); q.y = y1 + (y2 - y1) * (ds ? t / ds : 0); return q; });
    }
    /* wachsende Leitung aus Segmenten */
    const leitungen = [];
    function leitung(pts, r, farbe, phase, label) {
      const segs = []; let gesamt = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], len = a.distanceTo(b); if (len < 0.001) continue;
        const geo = new T.CylinderGeometry(r, r, len, 14); geo.translate(0, len / 2, 0);
        const me = mesh(geo, mat(farbe, { roughness: 0.4 })); me.position.copy(a);
        me.quaternion.setFromUnitVectors(v3(0, 1, 0), b.clone().sub(a).normalize()); me.scale.y = 0.0001; me.visible = false;
        sc.add(me); segs.push({ me, von: gesamt, len }); gesamt += len;
        if (i > 0) { const k = mesh(new T.SphereGeometry(r * 1.25, 10, 8), mat(farbe)); k.position.copy(a); k.visible = false; sc.add(k); segs.push({ me: k, von: gesamt - len, len: 0.0001, knoten: true }); }
      }
      leitungen.push({ segs, gesamt, phase, label }); return gesamt;
    }

    /* Boden mit Grundriss */
    const boden = mesh(new T.PlaneGeometry(B, D), new T.MeshStandardMaterial({ color: 0xd8d4cc, roughness: 1 })); boden.rotation.x = -Math.PI / 2; sc.add(boden);
    if (grundrissUrl) { const img = new Image(); img.onload = () => { const tx = new T.Texture(img); tx.encoding = T.sRGBEncoding; tx.needsUpdate = true; boden.material.map = tx; boden.material.color.set(0xffffff); boden.material.needsUpdate = true; }; img.src = grundrissUrl; }
    else { const g = new T.GridHelper(Math.max(B, D), Math.round(Math.max(B, D) * 2), 0x888888, 0xbbbbbb); g.position.y = 0.002; sc.add(g); }
    const nass = ['bad', 'gaestewc', 'kueche', 'waschraum', 'keller', 'heizungsraum', 'garage'].includes(p.raum);
    const bt = holzTextur(stil ? stil.boden : (nass ? '#cfcac2' : '#b8916a'), nass); bt.repeat.set(B * (nass ? 1.6 : 1.2), D * (nass ? 1.6 : 1.2));
    const belag = mesh(new T.PlaneGeometry(B, D), new T.MeshStandardMaterial({ map: bt, roughness: 0.75 })); belag.rotation.x = -Math.PI / 2; belag.position.y = 0.01; belag.scale.set(0.0001, 1, 1); sc.add(belag);

    /* Wände (wachsen hoch); linke Wand mit Durchbruch */
    const wandMat = new T.MeshStandardMaterial({ color: new T.Color('#a39e97'), roughness: 0.95 });
    const zielWand = new T.Color(stil ? stil.wand : (nass ? '#f2f2f0' : '#ece8e1'));
    const waende = [];
    const wb = (w, h, d, x, y, z) => { const me = mesh(new T.BoxGeometry(w, h, d), wandMat); me.position.set(x, y, z); me.userData.n = Math.abs(x) > Math.abs(z) * (B / D) ? v3(Math.sign(x), 0, 0) : v3(0, 0, Math.sign(z)); sc.add(me); waende.push(me); return me; };
    const dk = 0.12;
    wb(B + 2 * dk, HW, dk, 0, HW / 2, -D / 2 - dk / 2); wb(dk, HW, D, B / 2 + dk / 2, HW / 2, 0); wb(B + 2 * dk, HW, dk, 0, HW / 2, D / 2 + dk / 2);
    const tz = 0, tb = Math.min(0.9, D * 0.35), th = 2.05;
    wb(dk, HW, D / 2 - tb / 2, -B / 2 - dk / 2, HW / 2, -D / 4 - tb / 4); wb(dk, HW, D / 2 - tb / 2, -B / 2 - dk / 2, HW / 2, D / 4 + tb / 4); wb(dk, HW - th, tb, -B / 2 - dk / 2, th + (HW - th) / 2, tz);
    const stopfen = mesh(new T.BoxGeometry(dk, th, tb), mat('#8f8a83')); stopfen.position.set(-B / 2 - dk / 2, th / 2, tz); sc.add(stopfen);
    const staub = []; for (let i = 0; i < 40; i++) { const st = mesh(new T.BoxGeometry(0.05, 0.05, 0.05), mat('#9a948c')); st.visible = false; st.userData.v = v3(Math.random() * 0.8 + 0.2, Math.random() * 1.5, (Math.random() - 0.5) * 1.2); st.userData.p0 = v3(-B / 2, Math.random() * th, tz + (Math.random() - 0.5) * tb); sc.add(st); staub.push(st); }

    /* Einrichtung analysieren */
    const plan = p.plan || [];
    const mitte = (e) => { const rot = (e.rot || 0) % 180 !== 0, ew = (rot ? e.d : e.w) / 100, ed = (rot ? e.w : e.d) / 100; return [e.x / 100 + ew / 2 - B / 2, e.y / 100 + ed / 2 - D / 2]; };
    const SAN = /WC|Waschtisch|Handwaschbecken|Dusche|Badewanne|Spüle|Waschmaschine|Geschirrspüler|Ausgussbecken|Bodenablauf|Wasch-Trocken/;
    const AB_H = (n) => /WC/.test(n) ? 0.23 : /Dusche|Bodenablauf/.test(n) ? 0.06 : /Badewanne/.test(n) ? 0.12 : /Spüle|Geschirr/.test(n) ? 0.47 : /Waschmaschine|Wasch-Trocken/.test(n) ? 0.75 : 0.55;
    const DN = (n) => /WC/.test(n) ? 100 : /Waschtisch|Handwasch|Geschirr/.test(n) ? 40 : 50;
    const STROM = /Steckdose|Waschmaschine|Trockner|Geschirrspüler|Herd|Kochfeld|Backofen|Kühlschrank|Fernseher|TV-Board|Spiegelschrank|Lüfter|Handtuchheizkörper|Stehleuchte|Wallbox|Dunstabzug|Beamer|WLAN|Schreibtisch|Wasch-Trocken|Indirektes Licht|Deckenleuchte|Pendelleuchte|Wandleuchte/;
    const E_H = (n) => /Spiegelschrank/.test(n) ? 1.9 : /Fernseher/.test(n) ? 1.05 : /Lüfter|Deckenleuchte|Pendelleuchte|Indirektes/.test(n) ? 2.3 : /Herd|Kochfeld|Backofen/.test(n) ? 0.6 : /Wandleuchte/.test(n) ? 1.8 : /Handtuch/.test(n) ? 0.4 : /Dunstabzug/.test(n) ? 2.1 : 0.3;
    const san = plan.filter((e) => SAN.test(e.n)), strom = plan.filter((e) => STROM.test(e.n));
    // Fallrohr in der Ecke nächst dem WC / ersten Sanitärobjekt
    let sFall = 0;
    if (san.length) { const ref = san.find((e) => /WC/.test(e.n)) || san[0]; const sr = sVon(...mitte(ref)); sFall = ecken.reduce((b, e) => { const d = Math.min(Math.abs(e - sr), P - Math.abs(e - sr)); return d < b[0] ? [d, e] : b; }, [1e9, 0])[1]; }
    const fallPos = umfang(sFall + 0.12, 0.12);
    const infoAb = [];
    if (san.length) {
      leitung([v3(fallPos.x, -0.3, fallPos.z), v3(fallPos.x, HW, fallPos.z)], 0.055, '#9ea3a8', 'abwasser');
      san.forEach((e) => {
        const [cx, cz] = mitte(e), s = sVon(cx, cz), h0 = AB_H(e.n), r = DN(e.n) / 2000 * 1.2;
        const wegP = weg(s, sFall + 0.12, h0, h0, 0.07); const lenW = wegP.reduce((a, q, i) => i ? a + q.distanceTo(wegP[i - 1]) : 0, 0);
        wegP.forEach((q, i) => { q.y = h0 - 0.02 * lenW * (i / Math.max(1, wegP.length - 1)); });
        const start = umfang(s, 0.25); start.y = h0;
        leitung([start].concat(wegP), r, '#9ea3a8', 'abwasser');
        infoAb.push(e.n.split(' ')[0] + ' DN ' + DN(e.n));
        if (!/Bodenablauf/.test(e.n)) {
          const hv = /WC/.test(e.n) ? 0.9 : /Dusche/.test(e.n) ? 1.1 : /Badewanne/.test(e.n) ? 0.7 : /Waschmaschine|Wasch-Trocken/.test(e.n) ? 1.05 : 0.55;
          const kw = weg(sFall + 0.35, s - 0.08, 0.3, 0.3, 0.05); kw.push(v3(kw[kw.length - 1].x, hv, kw[kw.length - 1].z));
          leitung(kw, 0.012, '#2f7fe0', 'wasser');
          if (!/WC|Waschmaschine|Geschirr/.test(e.n)) { const ww = weg(sFall + 0.42, s + 0.08, 0.38, 0.38, 0.05); ww.push(v3(ww[ww.length - 1].x, hv, ww[ww.length - 1].z)); leitung(ww, 0.012, '#e0452f', 'wasser'); }
        }
      });
    }
    // Elektro: Verteiler/Schalter neben der Tür, Kabel in der oberen Installationszone
    const sTuer = 2 * B + D + D / 2 - tz, sSchalter = sTuer + tb / 2 + 0.2;
    const dosen = [];
    const dose = (q, h) => { const d = mesh(new T.CylinderGeometry(0.034, 0.034, 0.02, 16), mat('#6b8a5a')); d.position.set(q.x, h, q.z); d.visible = false; sc.add(d); dosen.push(d); };
    const ks = weg(sSchalter, sSchalter, 2.2, 1.05, 0.02); ks.unshift(umfang(sSchalter, 0.02).setY(2.2)); leitung([umfang(sSchalter, 0.02).setY(2.2), umfang(sSchalter, 0.02).setY(1.05)], 0.008, '#d9d9d9', 'elektro'); dose(umfang(sSchalter, 0.025), 1.05);
    strom.forEach((e, i) => {
      const [cx, cz] = mitte(e), s = sVon(cx, cz) + (i % 2 ? 0.15 : -0.15), h = E_H(e.n);
      const w = weg(sSchalter, s, 2.2, 2.2, 0.02); w.push(umfang(s, 0.02).setY(h));
      leitung(w, 0.008, '#d9d9d9', 'elektro'); dose(umfang(s, 0.025), h);
    });

    /* Kücheninsel: alle Leitungen durch den Boden (vor dem Estrich) */
    const insel = plan.find((e) => /Kücheninsel/.test(e.n)), ia = (insel && insel.aus) || {};
    let inselWasser = false, inselMulde = false;
    if (insel) {
      const vorher = leitungen.length;
      const [ix, iz] = mitte(insel), s = sVon(ix, iz), wp = umfang(s, 0.06), y = 0.035;
      const zu = (dx, dz) => [v3(wp.x + dx, y, wp.z + dz), v3(ix + dx, y, iz + dz), v3(ix + dx, 0.5, iz + dz)];
      if (ia.spuele || ia.gs) { inselWasser = true; leitung(zu(0.12, 0.12).map((q, i) => i === 1 ? q : q), 0.028, '#9ea3a8', 'abwasser'); leitung(zu(-0.05, 0.05), 0.012, '#2f7fe0', 'wasser'); if (ia.spuele) leitung(zu(0.02, -0.02), 0.012, '#e0452f', 'wasser'); }
      if (ia.kochfeld || ia.mulde || ia.gs || ia.steckdosen) leitung(zu(-0.15, -0.12), 0.014, '#e0a030', 'elektro');
      if (ia.mulde) { inselMulde = true; const ss = sVon(ix, iz); const aw = umfang(ss, -0.2); leitung([v3(ix - 0.3, 0.06, iz), v3(aw.x, 0.06, aw.z)], 0.045, '#d9d9d9', 'lueftung'); }
      leitungen.slice(vorher).forEach((l) => { l.boden = true; });
    }

    /* Lüftung: Lüfter gegenüber der Tür, Abluft DN 100 nach draußen */
    const luefter = plan.find((e) => /Lüfter/.test(e.n));
    let lPos = null;
    if (luefter) {
      const [lx, lz] = mitte(luefter); lPos = v3(lx, 2.15, lz);
      const aussen = lx > 0 ? 1 : -1, xw = aussen * (B / 2 + dk + 0.45);
      leitung([v3(lx - aussen * 0.02, 2.15, lz), v3(aussen * (B / 2 + dk + 0.05), 2.13, lz), v3(xw, 2.1, lz)], 0.05, '#eeeeee', 'lueftung');
      const mk = mesh(new T.BoxGeometry(0.06, 0.2, 0.2), mat('#cfcfcf')); mk.position.set(xw + aussen * 0.03, 2.1, lz); mk.visible = false; sc.add(mk); leitungen.push({ segs: [{ me: mk, von: 0.99, len: 0.0001, knoten: true }], gesamt: 1, phase: 'lueftung' });
      const lg = mesh(new T.BoxGeometry(0.04, 0.2, 0.2), mat('#f4f4f4')); lg.position.copy(lPos); lg.position.x -= aussen * 0.03; lg.visible = false; sc.add(lg); leitungen.push({ segs: [{ me: lg, von: 0, len: 0.0001, knoten: true }], gesamt: 1, phase: 'lueftung' });
    }

    /* Trockenbau: Vorwand vor Sanitär-Wänden, TV-Kasten, Decken-Voute bei indirektem Licht */
    const trocken = [];
    const gk = mat('#e4e2dc', { roughness: 0.9 }), cw = mat('#b9bec4', { metalness: 0.7, roughness: 0.35 });
    function vorwand(s1, s2, h, tiefe) {
      const a = Math.min(s1, s2), b = Math.max(s1, s2);
      for (let s = a; s <= b + 0.001; s += 0.625) { const q = umfang(s, tiefe / 2); const st = mesh(new T.BoxGeometry(0.05, h, 0.05), cw); st.position.set(q.x, h / 2, q.z); st.visible = false; sc.add(st); trocken.push({ me: st, art: 'profil' }); }
      // Platten je Wandabschnitt
      const teile = weg(a, b, 0, 0, tiefe);
      for (let i = 0; i < teile.length - 1; i++) {
        const q1 = teile[i], q2 = teile[i + 1], len = q1.distanceTo(q2); if (len < 0.05) continue;
        const pl = mesh(new T.BoxGeometry(len, h, 0.0125), gk); pl.position.set((q1.x + q2.x) / 2, h / 2, (q1.z + q2.z) / 2);
        pl.rotation.y = Math.abs(q1.x - q2.x) > Math.abs(q1.z - q2.z) ? 0 : Math.PI / 2; pl.visible = false; sc.add(pl); trocken.push({ me: pl, art: 'platte' });
      }
    }
    if (san.length) {
      const ss = san.map((e) => sVon(...mitte(e))).concat([sFall + 0.12]);
      const hoch = san.some((e) => /WC/.test(e.n)) ? 1.15 : 1.0;
      let a = Math.min(...ss) - 0.3, b = Math.max(...ss) + 0.3; if (b - a > P / 2) { a = Math.max(...ss) - 0.3; b = Math.min(...ss) + P + 0.3; }
      vorwand(a, b, hoch, 0.16);
    }
    const leds = [];
    const tv = plan.find((e) => /Fernseher/.test(e.n));
    if (tv) { // TV-Kasten aus Trockenbau mit LED-Rahmen
      const [cx, cz] = mitte(tv), s = sVon(cx, cz), q = umfang(s, 0.07), w = tv.w / 100 + 0.6, h = tv.h / 100 + 0.55, y0 = 0.95;
      const dreh = (s > B && s < B + D) || s > 2 * B + D ? Math.PI / 2 : 0;
      [[w, 0.08, 0, y0 + h], [w, 0.08, 0, y0 - 0.04], [0.08, h, -w / 2, y0 + h / 2], [0.08, h, w / 2, y0 + h / 2]].forEach(([bw, bh, ox, oy]) => {
        const g = mesh(new T.BoxGeometry(bw, bh, 0.12), gk); g.position.set(q.x + (dreh ? 0 : ox), oy, q.z + (dreh ? ox : 0)); g.rotation.y = dreh; g.visible = false; sc.add(g); trocken.push({ me: g, art: 'platte' });
      });
      const led = mesh(new T.BoxGeometry(w - 0.2, h - 0.2, 0.01), mat('#ffd27a', { emissive: new T.Color('#ffb84a'), emissiveIntensity: 0 })); led.position.set(q.x, y0 + h / 2 - 0.02, q.z); led.rotation.y = dreh; led.translateZ(-0.03); sc.add(led); leds.push(led);
    }
    if (plan.some((e) => /Indirektes Licht|LED-Profil/.test(e.n))) { // umlaufende Voute
      const vs = mat('#efede8', { roughness: 0.9 });
      [[B, 0.3, 0, -D / 2 + 0.15, 0], [B, 0.3, 0, D / 2 - 0.15, 0], [D, 0.3, -B / 2 + 0.15, 0, 1], [D, 0.3, B / 2 - 0.15, 0, 1]].forEach(([l, b, x, z, r]) => {
        const v = mesh(new T.BoxGeometry(r ? b : l, 0.12, r ? l : b), vs); v.position.set(x, HW - 0.2, z); v.visible = false; sc.add(v); trocken.push({ me: v, art: 'platte' });
        const led = mesh(new T.BoxGeometry(r ? 0.02 : l * 0.95, 0.02, r ? l * 0.95 : 0.02), mat('#ffd27a', { emissive: new T.Color('#ffb84a'), emissiveIntensity: 0 }));
        led.position.set(x + (r ? (x < 0 ? 0.16 : -0.16) : 0), HW - 0.13, z + (r ? 0 : (z < 0 ? 0.16 : -0.16))); sc.add(led); leds.push(led);
      });
    }

    /* Möbel/Objekte für die Montage */
    const objekte = plan.map((e) => {
      const farbe = e.farbe || (stil && e.g === 'Möbel' ? stil.moebel : ((window.GRUPPEN_FARBE_3D || {})[e.g] || '#aaa'));
      const g = modell(e, farbe, stil ? stil.akzent : '#7a9ab8'); const [cx, cz] = mitte(e);
      g.position.set(cx, 3, cz); g.rotation.y = -(e.rot || 0) * Math.PI / 180; g.visible = false; sc.add(g); return { g, n: e.n };
    });

    { const tg = tuerGruppe(p, B); tg.position.y = 3; tg.visible = false; sc.add(tg); objekte.unshift({ g: tg, n: ['bad', 'gaestewc', 'waschraum'].includes(p.raum) && p.tuer !== 'keine' ? 'Tür mit Lüftungsgitter' : 'Tür', tuer: true }); }
    /* Zeitplan */
    const PH = [
      { id: 'grundriss', n: 'Grundriss', d: 3.5, txt: grundrissUrl ? 'Dein Grundriss' : 'Grundriss ' + zahl(B) + ' × ' + zahl(D) + ' m' },
      { id: 'durchbruch', n: 'Durchbruch', d: 3, txt: 'Durchbruch ' + Math.round(tb * 100) + ' × ' + Math.round(th * 100) + ' cm – Statik prüfen!' },
      { id: 'abwasser', n: 'Abwasser', d: san.length || inselWasser ? 4.5 : 0, txt: 'Abwasser: ' + infoAb.slice(0, 3).join(', ') + ' · 2 % Gefälle' },
      { id: 'wasser', n: 'Wasser', d: san.length || inselWasser ? 3.2 : 0, txt: 'Kalt- und Warmwasser bis zu den Eckventilen' },
      { id: 'elektro', n: 'Elektro', d: 3.8, txt: insel && (ia.kochfeld || ia.mulde) ? 'Starkstrom 400 V zur Insel durch den Boden · Kabel in den Zonen' : 'Kabel in der Zone oben, senkrecht zu ' + (dosen.length) + ' Dosen' },
      { id: 'lueftung', n: 'Lüftung', d: luefter || inselMulde ? 3.2 : 0, txt: inselMulde ? 'Muldenlüfter: Abluftkanal im Bodenaufbau zur Außenwand (oder geführte Umluft im Sockel)' : 'Lüfter gegenüber der Tür · Abluft DN 100 nach draußen' + (['bad', 'gaestewc', 'waschraum'].includes(p.raum) ? ' · Tür mit Lüftungsgitter' : '') },
      { id: 'trocken', n: 'Trockenbau', d: trocken.length ? 4.5 : 0, txt: (san.length ? 'Vorwand' : '') + (tv ? (san.length ? ', ' : '') + 'TV-Kasten' : '') + (leds.length > 1 ? ', Decken-Voute' : '') + ': erst Profile, dann Platten' },
      { id: 'putz', n: nass ? 'Fliesen' : 'Wände & Boden', d: 3.5, txt: nass ? 'Abdichten, fliesen, Boden verlegen' : 'Verputzen, streichen, Boden verlegen' },
      { id: 'montage', n: 'Montage', d: Math.max(2, objekte.length * 0.55 + 0.8), txt: 'Einbauen' },
      { id: 'fertig', n: 'Fertig', d: 5, txt: 'Fertig – so sieht es aus' }
    ].filter((x) => x.d > 0);
    let t0 = 0; PH.forEach((x) => { x.a = t0; t0 += x.d; x.e = t0; }); const GES = t0;
    const ph = (id) => PH.find((x) => x.id === id) || { a: -1, e: -1, d: 1 };
    const k = (id, t) => { const x = ph(id); return x.a < 0 ? 1 : Math.max(0, Math.min(1, (t - x.a) / x.d)); };
    document.getElementById('bau-phasen').innerHTML = PH.map((x, i) => `<button class="chip" data-i="${i}">${i + 1}. ${x.n}</button>`).join('');

    /* Kamera je Phase */
    const ziel = { grundriss: [v3(0.01, gr * 1.9, 0.6), v3(0, 0, 0)], durchbruch: [v3(B * 0.35, 1.6, D * 0.35), v3(-B / 2, 1.0, tz)],
      abwasser: [v3(-fallPos.x * 0.35, 1.5, -fallPos.z * 0.35), v3(fallPos.x * 0.85, 0.4, fallPos.z * 0.85)], wasser: [v3(-fallPos.x * 0.3, 1.3, -fallPos.z * 0.3), v3(fallPos.x * 0.8, 0.5, fallPos.z * 0.8)],
      elektro: [v3(B * 0.3, 1.8, D * 0.4), v3(-B / 2, 1.6, -0.3)], lueftung: lPos ? [v3(-B * 0.25, 1.75, lPos.z * 0.5), v3(B / 2, 2.0, lPos.z)] : [v3(B * 0.5, 2.6, D * 0.6), v3(0, 0, 0)], trocken: [v3(-fallPos.x * 0.3 + 0.2, 1.6, -fallPos.z * 0.3 + 0.2), tv ? umfang(sVon(...mitte(tv)), 0).setY(1.3) : v3(fallPos.x * 0.7, 0.8, fallPos.z * 0.7)],
      putz: [v3(B * 0.9, gr * 1.2, D * 1.1), v3(0, 0.6, 0)], montage: [v3(B * 0.8, gr * 1.15, D * 1.2), v3(0, 0.7, 0)], fertig: [v3(B * 0.9, gr * 1.1, D * 1.25), v3(0, 0.8, 0)] };
    const camPos = v3(B, gr * 2, D * 1.5), camZiel = v3(0, 0, 0);

    let start = performance.now(), pause = false, pauseT = 0, laeuft = true, rec = null;
    function zeit() { return pause ? pauseT : (performance.now() - start) / 1000; }
    function schrift(text, y, groesse, farbe, fett) {
      ctx.font = (fett ? '600 ' : '500 ') + groesse * pr + 'px Jost, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = Math.min(aus.width - 16 * pr, ctx.measureText(text).width + 26 * pr), hh = groesse * pr * 1.75, x = aus.width / 2 - w / 2, yy = y * pr - hh / 2, r = hh / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.beginPath(); ctx.moveTo(x + r, yy); ctx.arcTo(x + w, yy, x + w, yy + hh, r); ctx.arcTo(x + w, yy + hh, x, yy + hh, r); ctx.arcTo(x, yy + hh, x, yy, r); ctx.arcTo(x, yy, x + w, yy, r); ctx.fill();
      ctx.fillStyle = farbe || '#fff'; ctx.fillText(text, aus.width / 2, y * pr + 1, aus.width - 30 * pr);
    }
    let aktIdx = -1;
    function frame() {
      if (!laeuft || !aus.isConnected) { laeuft = false; return; }
      let t = zeit(); if (t > GES + 1.5) { if (rec && rec.state === 'recording') rec.stop(); start = performance.now(); t = 0; }
      const akt = PH.find((x) => t >= x.a && t < x.e) || PH[PH.length - 1];
      const ai = PH.indexOf(akt);
      if (ai !== aktIdx) { aktIdx = ai; document.querySelectorAll('#bau-phasen .chip').forEach((c, i) => c.classList.toggle('an', i === ai)); }
      // Wände wachsen hoch
      const kw = leicht((t - 1.2) / 2.2); waende.forEach((w) => { w.scale.y = Math.max(0.001, kw); w.position.y = HW * kw / 2; }); stopfen.scale.y = Math.max(0.001, kw); stopfen.position.y = th * kw / 2;
      // Durchbruch
      const kd = k('durchbruch', t);
      if (t >= ph('durchbruch').a) { stopfen.visible = kd < 0.55; stopfen.position.x = -B / 2 - dk / 2 + leicht(kd / 0.5) * 0.25; stopfen.material.opacity = 1;
        staub.forEach((st) => { const tt = (t - ph('durchbruch').a) - 0.6; st.visible = tt > 0 && tt < 1.8; if (st.visible) { st.position.copy(st.userData.p0).add(st.userData.v.clone().multiplyScalar(tt)); st.position.y -= 2.5 * tt * tt; st.position.y = Math.max(0.03, st.position.y); } }); }
      else stopfen.visible = true;
      // Leitungen wachsen
      leitungen.forEach((l) => { const kk = k(l.phase, t), lauf = kk * l.gesamt; l.segs.forEach((sg) => { if (sg.knoten) { sg.me.visible = lauf >= sg.von; return; } const f = Math.max(0, Math.min(1, (lauf - sg.von) / sg.len)); sg.me.visible = f > 0; sg.me.scale.y = Math.max(0.0001, f); }); });
      dosen.forEach((d, i) => { d.visible = k('elektro', t) > (i + 1) / (dosen.length + 1); });
      // Trockenbau: Profile, dann Platten
      const kt = k('trocken', t), profile = trocken.filter((x) => x.art === 'profil'), platten = trocken.filter((x) => x.art === 'platte');
      profile.forEach((x, i) => { x.me.visible = kt > (i / Math.max(1, profile.length)) * 0.45; });
      platten.forEach((x, i) => { x.me.visible = kt > 0.5 + (i / Math.max(1, platten.length)) * 0.45; });
      // Putz/Fliesen/Boden
      const kp = k('putz', t); wandMat.color.set('#a39e97').lerp(zielWand, leicht(kp)); belag.scale.x = Math.max(0.0001, leicht(kp)); belag.position.x = -B / 2 + B * leicht(kp) / 2;
      leitungen.forEach((l) => { if ((l.phase === 'elektro' || l.boden) && kp > 0.4) l.segs.forEach((sg) => { sg.me.visible = false; }); });
      // Montage
      const pm = ph('montage');
      objekte.forEach((o, i) => { const kk = (t - pm.a - i * 0.55) / 0.7; o.g.visible = kk > 0; o.g.position.y = 3 * (1 - huepfen(kk)); });
      // Licht
      const kl = k('fertig', t); leds.forEach((l) => { l.visible = kl > 0; l.material.emissiveIntensity = 1.3 * leicht(kl / 0.4); }); raumLicht.intensity = 0.5 * leicht(kl / 0.5); hemi.intensity = 0.55 + 0.2 * kl;
      // Kamera
      const zz = ziel[akt.id] || ziel.fertig; let zp = zz[0].clone();
      if (akt.id === 'fertig' || akt.id === 'montage') { const a = (t - akt.a) * 0.25 + 0.7, rr = Math.hypot(zp.x, zp.z); zp = v3(Math.sin(a) * rr, zp.y, Math.cos(a) * rr); }
      camPos.lerp(zp, 0.035); camZiel.lerp(zz[1], 0.05); cam.position.copy(camPos); cam.lookAt(camZiel);
      // Puppenhaus-Schnitt: Wände zwischen Kamera und Raum ausblenden
      waende.forEach((w) => { const nn = w.userData.n, rand = nn.x ? B / 2 : D / 2; w.visible = (nn.x ? camPos.x * nn.x : camPos.z * nn.z) < rand + 0.05; });
      stopfen.visible = stopfen.visible && camPos.x > -B / 2 - 0.05;
      trocken.forEach((x) => { const q = x.me.position; if (x.me.visible && ((camPos.x > B / 2 && q.x > B / 2 - 0.3) || (camPos.x < -B / 2 && q.x < -B / 2 + 0.3) || (camPos.z > D / 2 && q.z > D / 2 - 0.3) || (camPos.z < -D / 2 && q.z < -D / 2 + 0.3))) x.me.visible = false; });
      renderer.render(sc, cam);
      ctx.drawImage(renderer.domElement, 0, 0, aus.width, aus.height);
      schrift((ai + 1) + '/' + PH.length + ' · ' + akt.n, 26, 12, '#ffd27a', true);
      let txt = akt.txt; if (akt.id === 'montage') { const o = objekte.filter((o, i) => t - pm.a - i * 0.55 > 0).pop(); if (o) txt = 'Einbauen: ' + o.n; }
      schrift(txt, H - 34, 13.5, akt.id === 'fertig' ? '#9fd69f' : '#fff', true);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(14 * pr, 46 * pr, aus.width - 28 * pr, 3 * pr);
      ctx.fillStyle = '#fff'; ctx.fillRect(14 * pr, 46 * pr, (aus.width - 28 * pr) * Math.min(1, t / GES), 3 * pr);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    film = { stopp() { laeuft = false; renderer.dispose(); } };
    document.getElementById('film-zu').onclick = () => { m.classList.remove('an'); film.stopp(); film = null; };
    document.getElementById('film-neu').onclick = () => { start = performance.now(); pause = false; document.getElementById('film-pause').textContent = 'Pause'; };
    document.getElementById('film-pause').onclick = (e) => { if (pause) { start = performance.now() - pauseT * 1000; pause = false; e.target.textContent = 'Pause'; } else { pauseT = zeit(); pause = true; e.target.textContent = 'Weiter'; } };
    document.getElementById('bau-phasen').onclick = (e) => { const c = e.target.closest('[data-i]'); if (!c) return; const x = PH[+c.dataset.i]; start = performance.now() - (x.a + 0.01) * 1000; if (pause) pauseT = x.a + x.d * 0.9; };
    document.getElementById('film-rec').onclick = () => {
      const info = document.getElementById('film-info');
      if (!aus.captureStream || !window.MediaRecorder) { info.textContent = 'Video speichern kann dieser Browser nicht. Tipp: Bildschirmaufnahme.'; return; }
      const typ = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((x) => MediaRecorder.isTypeSupported(x)) || '';
      const st = []; rec = new MediaRecorder(aus.captureStream(30), typ ? { mimeType: typ, videoBitsPerSecond: 6e6 } : undefined);
      rec.ondataavailable = (ev) => ev.data.size && st.push(ev.data);
      rec.onstop = () => { const blob = new Blob(st, { type: rec.mimeType || 'video/webm' }); rec = null; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'joum4d-bauablauf.' + (/mp4/.test(blob.type) ? 'mp4' : 'webm'); document.body.appendChild(a); a.click(); a.remove(); info.textContent = 'Video fertig. Falls kein Download startet: Bildschirmaufnahme nutzen.'; };
      start = performance.now(); pause = false; rec.start(); info.textContent = 'Aufnahme läuft … ' + Math.round(GES) + ' Sekunden';
    };
  };

  /* ---------- Realistischere Darstellung: Filmlook, Umgebungslicht, Himmel ---------- */
  function filmLook(renderer, sc, aussen) {
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = aussen ? 0.85 : 1.0;
    try {
      const pm = new T.PMREMGenerator(renderer);
      if (aussen && T.Sky) {
        const sky = new T.Sky(); sky.scale.setScalar(450);
        const u = sky.material.uniforms; u.turbidity.value = 6; u.rayleigh.value = 1.6; u.mieCoefficient.value = 0.005; u.mieDirectionalG.value = 0.8;
        const sonne = new T.Vector3().setFromSphericalCoords(1, T.MathUtils.degToRad(58), T.MathUtils.degToRad(200)); u.sunPosition.value.copy(sonne);
        sc.add(sky); sc.environment = pm.fromScene(sky).texture; return { sky, sonne };
      }
      if (T.RoomEnvironment) sc.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture;
    } catch (e) { console.warn(e); }
    return {};
  }
  function textur(zeichnen, wieder) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d'); zeichnen(ctx, 256);
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; if (wieder) t.repeat.set(wieder[0], wieder[1]); t.anisotropy = 4; return t;
  }
  const rausch = (ctx, n, f, a, b) => { for (let i = 0; i < n; i++) { ctx.fillStyle = f[(Math.random() * f.length) | 0]; ctx.globalAlpha = a + Math.random() * b; ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 2 + Math.random() * 3); } ctx.globalAlpha = 1; };
  const TX = {
    rasen: (L, Tt) => textur((c, n) => { c.fillStyle = '#4f8a35'; c.fillRect(0, 0, n, n); rausch(c, 2600, ['#3f7a2a', '#5f9e3e', '#6fae4a', '#2f6a22'], 0.5, 0.5); }, [L / 2, Tt / 2]),
    erde: (L, Tt) => textur((c, n) => { c.fillStyle = '#5b4636'; c.fillRect(0, 0, n, n); rausch(c, 1800, ['#4a382a', '#6b5442', '#3e2f22'], 0.6, 0.4); }, [L / 2, Tt / 2]),
    kies: (L, Tt) => textur((c, n) => { c.fillStyle = '#c9c2b4'; c.fillRect(0, 0, n, n); rausch(c, 3000, ['#e2dccf', '#a9a294', '#bdb5a6', '#8f887b'], 0.7, 0.3); }, [L, Tt]),
    schotter: (L, Tt) => textur((c, n) => { c.fillStyle = '#8f8f8a'; c.fillRect(0, 0, n, n); rausch(c, 2500, ['#6f6f6a', '#a7a7a1', '#7f7f7a'], 0.7, 0.3); }, [L, Tt]),
    holz: (L, Tt, f) => textur((c, n) => { for (let y = 0; y < n; y += 32) { c.fillStyle = new T.Color(f || '#b08a5e').offsetHSL(0, 0, (Math.random() - 0.5) * 0.08).getStyle(); c.fillRect(0, y, n, 30); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, y + 30, n, 2); for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(0, y + 4 + k * 4, n, 1); } } }, [L / 1.2, Tt / 1.2]),
    platten: (L, Tt, f, gross) => textur((c, n) => { c.fillStyle = 'rgba(40,40,40,1)'; c.fillRect(0, 0, n, n); const g = gross ? 128 : 64; for (let y = 0; y < n; y += g) for (let x = 0; x < n; x += g) { c.fillStyle = new T.Color(f || '#b9b2a6').offsetHSL(0, 0, (Math.random() - 0.5) * 0.1).getStyle(); c.fillRect(x + 2, y + 2, g - 4, g - 4); } rausch(c, 1500, ['#000', '#fff'], 0.03, 0.05); }, [L / (gross ? 1.2 : 0.6) / 2, Tt / (gross ? 1.2 : 0.6) / 2]),
    putz: (f) => textur((c, n) => { c.fillStyle = f || '#ece8e1'; c.fillRect(0, 0, n, n); rausch(c, 3000, ['#000', '#fff'], 0.02, 0.04); }, [3, 3]),
    ziegel: () => textur((c, n) => { for (let y = 0; y < n; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < n; x += 64) { c.fillStyle = new T.Color('#b5523a').offsetHSL(0, 0, (Math.random() - 0.5) * 0.1).getStyle(); c.fillRect(x + 2, y + 2, 60, 28); } }, [4, 4]),
    wasser: () => textur((c, n) => { const g = c.createLinearGradient(0, 0, n, n); g.addColorStop(0, '#2f6fa0'); g.addColorStop(1, '#4f9fd0'); c.fillStyle = g; c.fillRect(0, 0, n, n); rausch(c, 600, ['#9fd3ef'], 0.15, 0.2); }, [2, 2])
  };

  /* ---------- Gemeinsamer 4D-Film-Rahmen (Kapitel, Kamera, Untertitel, Aufnahme) ---------- */
  function filmRahmen(titel, opt) {
    if (film) film.stopp();
    let m = document.getElementById('film-modal');
    if (!m) { m = document.createElement('div'); m.id = 'film-modal'; m.className = 'film-modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="film-box"><div class="zeile"><b style="flex:1">${esc(titel)}</b><button class="x" id="film-zu" aria-label="Schließen">×</button></div>
      <div class="film-buehne" id="film-buehne"></div>
      <div class="zeile"><button class="btn" id="film-pause">Pause</button><button class="btn" id="film-neu">Von vorn</button><button class="btn hell" id="film-rec">Als Video</button></div>
      <div class="bau-phasen" id="bau-phasen"></div><div class="klein" id="film-info">${esc(opt.info || 'Kapitel antippen springt dorthin.')}</div></div>`;
    m.classList.add('an');
    const H = Math.min(Math.floor(window.innerHeight * 0.58), 640), W2 = Math.floor(H * 9 / 16), pr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new T.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(pr); renderer.setSize(W2, H); renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.setClearColor(0x0a0a0a);
    const aus = document.createElement('canvas'); aus.width = W2 * pr; aus.height = H * pr; aus.style.width = W2 + 'px'; aus.style.height = H + 'px';
    const ctx = aus.getContext('2d'); document.getElementById('film-buehne').appendChild(aus);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(48, W2 / H, 0.05, 900);
    const look = filmLook(renderer, sc, opt.aussen);
    const f = { renderer, sc, cam, look, H, W2, pr, PH: [], update: null, camPos: new T.Vector3(10, 10, 10), camZiel: new T.Vector3(0, 0, 0) };
    let start = performance.now(), pause = false, pauseT = 0, laeuft = true, rec = null, aktIdx = -1;
    const zeit = () => pause ? pauseT : (performance.now() - start) / 1000;
    function schrift(text, y, g, farbe, fett) {
      ctx.font = (fett ? '600 ' : '500 ') + g * pr + 'px Jost, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = Math.min(aus.width - 16 * pr, ctx.measureText(text).width + 26 * pr), hh = g * pr * 1.75, x = aus.width / 2 - w / 2, yy = y * pr - hh / 2, r = hh / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.moveTo(x + r, yy); ctx.arcTo(x + w, yy, x + w, yy + hh, r); ctx.arcTo(x + w, yy + hh, x, yy + hh, r); ctx.arcTo(x, yy + hh, x, yy, r); ctx.arcTo(x, yy, x + w, yy, r); ctx.fill();
      ctx.fillStyle = farbe || '#fff'; ctx.fillText(text, aus.width / 2, y * pr + 1, aus.width - 30 * pr);
    }
    f.start = () => {
      let t0 = 0; f.PH.forEach((x) => { x.a = t0; t0 += x.d; x.e = t0; }); f.GES = t0;
      document.getElementById('bau-phasen').innerHTML = f.PH.map((x, i) => `<button class="chip" data-i="${i}">${i + 1}. ${esc(x.n)}</button>`).join('');
      f.camPos.copy(f.PH[0].kam[0]); f.camZiel.copy(f.PH[0].kam[1]);
      requestAnimationFrame(frame);
    };
    f.k = (id, t) => { const x = f.PH.find((y) => y.id === id); return !x ? 1 : Math.max(0, Math.min(1, (t - x.a) / x.d)); };
    f.ph = (id) => f.PH.find((y) => y.id === id) || { a: -1, e: -1, d: 1 };
    function frame() {
      if (!laeuft || !aus.isConnected) { laeuft = false; return; }
      let t = zeit(); if (t > f.GES + 1.5) { if (rec && rec.state === 'recording') rec.stop(); start = performance.now(); t = 0; }
      const akt = f.PH.find((x) => t >= x.a && t < x.e) || f.PH[f.PH.length - 1], ai = f.PH.indexOf(akt);
      if (ai !== aktIdx) { aktIdx = ai; document.querySelectorAll('#bau-phasen .chip').forEach((c, i) => c.classList.toggle('an', i === ai)); }
      const kt = Math.max(0, Math.min(1, (t - akt.a) / akt.d));
      // Kamerafahrt wie bei Immobilien-Reels: Start → Ziel innerhalb des Kapitels, sanft
      const [p0, z0, p1] = akt.kam; const ziel = p1 ? p0.clone().lerp(p1, leicht(kt)) : p0;
      f.camPos.lerp(ziel, 0.045); f.camZiel.lerp(z0, 0.06); cam.position.copy(f.camPos); cam.lookAt(f.camZiel);
      if (f.update) f.update(t, akt, kt);
      renderer.render(sc, cam); ctx.drawImage(renderer.domElement, 0, 0, aus.width, aus.height);
      schrift((ai + 1) + '/' + f.PH.length + ' · ' + akt.n, 26, 12, '#ffd27a', true);
      schrift(typeof akt.txt === 'function' ? akt.txt(t, kt) : akt.txt, H - 34, 13.5, ai === f.PH.length - 1 ? '#9fd69f' : '#fff', true);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(14 * pr, 46 * pr, aus.width - 28 * pr, 3 * pr);
      ctx.fillStyle = '#fff'; ctx.fillRect(14 * pr, 46 * pr, (aus.width - 28 * pr) * Math.min(1, t / f.GES), 3 * pr);
      requestAnimationFrame(frame);
    }
    film = { stopp() { laeuft = false; renderer.dispose(); } };
    document.getElementById('film-zu').onclick = () => { m.classList.remove('an'); film.stopp(); film = null; };
    document.getElementById('film-neu').onclick = () => { start = performance.now(); pause = false; document.getElementById('film-pause').textContent = 'Pause'; };
    document.getElementById('film-pause').onclick = (e) => { if (pause) { start = performance.now() - pauseT * 1000; pause = false; e.target.textContent = 'Pause'; } else { pauseT = zeit(); pause = true; e.target.textContent = 'Weiter'; } };
    document.getElementById('bau-phasen').onclick = (e) => { const c = e.target.closest('[data-i]'); if (!c) return; const x = f.PH[+c.dataset.i]; start = performance.now() - (x.a + 0.01) * 1000; if (pause) pauseT = x.a + x.d * 0.9; };
    document.getElementById('film-rec').onclick = () => {
      const info = document.getElementById('film-info');
      if (!aus.captureStream || !window.MediaRecorder) { info.textContent = 'Video speichern kann dieser Browser nicht. Tipp: Bildschirmaufnahme.'; return; }
      const typ = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((x) => MediaRecorder.isTypeSupported(x)) || '';
      const st = []; rec = new MediaRecorder(aus.captureStream(30), typ ? { mimeType: typ, videoBitsPerSecond: 6e6 } : undefined);
      rec.ondataavailable = (ev) => ev.data.size && st.push(ev.data);
      rec.onstop = () => { const blob = new Blob(st, { type: rec.mimeType || 'video/webm' }); rec = null; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'joum4d-' + titel.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.' + (/mp4/.test(blob.type) ? 'mp4' : 'webm'); document.body.appendChild(a); a.click(); a.remove(); info.textContent = 'Video fertig. Falls kein Download startet: Bildschirmaufnahme nutzen.'; };
      start = performance.now(); pause = false; rec.start(); info.textContent = 'Aufnahme läuft … ' + Math.round(f.GES) + ' Sekunden';
    };
    return f;
  }

  /* ---------- Garten in 4D: Abstecken → Aushub → Unterbau → Beläge → Beete → Rasen → Pflanzen → Wachstum → Abend ---------- */
  window.zeigeGarten4D = function (v) {
    const L = v.L || 20, Tt = v.T || 12;
    const f = filmRahmen('Garten 4D – ' + v.name, { aussen: true, info: 'Bauablauf und Wachstum über 5 Jahre. Kapitel antippen springt dorthin.' });
    const sc = f.sc, gr = Math.max(L, Tt);
    sc.add(new T.HemisphereLight(0xdfefff, 0x4a3a2a, 0.55));
    const so = new T.DirectionalLight(0xfff1dd, 1.1); so.position.set(L * 0.3 - 8, 14, -6); so.castShadow = true; so.shadow.mapSize.set(2048, 2048);
    Object.assign(so.shadow.camera, { left: -gr, right: gr, top: gr, bottom: -gr, far: 80 }); so.target.position.set(0, 0, 0); sc.add(so, so.target);
    const ox = -L / 2, oz = -Tt / 2; // Garten zentriert; Haus bei z < oz
    const P = (x, y) => new T.Vector3(ox + x, 0, oz + y);
    // Umgebung: Wiese außen, Haus, Nachbarzaun
    const umg = mesh(new T.PlaneGeometry(gr * 4, gr * 4), new T.MeshStandardMaterial({ map: TX.rasen(gr * 4, gr * 4), roughness: 1 })); umg.rotation.x = -Math.PI / 2; umg.position.y = -0.02; sc.add(umg);
    const haus = new T.Group();
    haus.add(mesh(new T.BoxGeometry(L + 2, 3.2, 4), new T.MeshStandardMaterial({ map: TX.putz('#efe9df'), roughness: 0.9 })).translateY(1.6));
    const dach = mesh(new T.CylinderGeometry(0.01, 2.9, L + 2.6, 3, 1), new T.MeshStandardMaterial({ map: TX.ziegel(), roughness: 0.8 })); dach.rotation.z = Math.PI / 2; dach.rotation.y = 0; dach.position.y = 4.1; dach.scale.set(1, 1, 0.75); haus.add(dach);
    const glas = mat('#9fc3d8', { metalness: 0.6, roughness: 0.05 });
    for (let x = -L / 2 + 1; x < L / 2; x += 3) { const fe = mesh(new T.BoxGeometry(1.6, 2.1, 0.05), glas); fe.position.set(x + 0.5, 1.15, 2.01); haus.add(fe); }
    haus.position.set(0, 0, oz - 2.1); sc.add(haus);
    // Boden des Gartens: Erde (wird später überdeckt)
    const erde = mesh(new T.PlaneGeometry(L, Tt), new T.MeshStandardMaterial({ map: TX.erde(L, Tt), roughness: 1 })); erde.rotation.x = -Math.PI / 2; erde.position.y = 0.005; sc.add(erde);
    // Abstecken: Pflöcke + Schnüre
    const abst = new T.Group(); sc.add(abst);
    const schnurMat = new T.LineBasicMaterial({ color: 0xff5533 });
    const flaechen = v.elemente.filter((e) => e.w != null && e.k !== 'licht');
    flaechen.forEach((e) => {
      const pts = [P(e.x, e.y), P(e.x + e.w, e.y), P(e.x + e.w, e.y + e.h), P(e.x, e.y + e.h), P(e.x, e.y)].map((q) => q.setY(0.25));
      abst.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), schnurMat));
      pts.slice(0, 4).forEach((q) => abst.add(kiste(0.04, 0.4, 0.04, '#c9a64a', q.x, 0.2, q.z)));
    });
    abst.visible = false;
    // Elemente
    const schichten = { aushub: [], unterbau: [], belag: [], beet: [], rasen: [], wasser: [], bau: [], pflanzen: [], licht: [] };
    flaechen.forEach((e) => {
      const c = P(e.x + e.w / 2, e.y + e.h / 2);
      const platte = (tex, h, y, liste, farbeOpt) => { const me = mesh(new T.BoxGeometry(e.w, h, e.h), tex ? new T.MeshStandardMaterial({ map: tex, roughness: 0.8 }) : mat(farbeOpt)); me.position.set(c.x, y, c.z); me.visible = false; sc.add(me); liste.push(me); return me; };
      if (['terrasse', 'weg'].includes(e.k)) {
        platte(null, 0.02, 0.01, schichten.aushub, '#3e2f22');
        platte(TX.schotter(e.w, e.h), 0.08, 0.04, schichten.unterbau);
        const m = e.mat || (e.k === 'weg' ? 'stein' : 'holz');
        const tex = m === 'holz' || m === 'wpc' ? TX.holz(e.w, e.h, BELAEGE[m].farbe) : TX.platten(e.w, e.h, BELAEGE[m].farbe, m === 'beton');
        const b = platte(tex, 0.06, 0.1, schichten.belag); b.userData.wachsen = true;
      } else if (e.k === 'kies' || e.k === 'spiel' || e.k === 'sand') {
        platte(TX.schotter(e.w, e.h), 0.04, 0.02, schichten.unterbau);
        platte(e.k === 'kies' ? TX.kies(e.w, e.h) : null, 0.05, 0.05, schichten.belag, e.k === 'sand' ? '#e6d4a0' : '#c9a57a');
        if (e.k === 'spiel') { const g = new T.Group(); [-1, 1].forEach((s) => { const st = zyl(0.05, 2.2, '#8a6a4a', s * Math.min(1.2, e.w / 3), 1.1, 0); st.rotation.z = s * 0.15; g.add(st); }); g.add(zyl(0.05, Math.min(2.6, e.w / 1.4), '#8a6a4a', 0, 2.15, 0).rotateZ(Math.PI / 2)); g.add(kiste(0.5, 0.04, 0.2, '#d9433a', 0, 0.5, 0)); g.position.set(c.x, 0, c.z); g.visible = false; sc.add(g); schichten.bau.push(g); }
      } else if (e.k === 'rasen') {
        const r = platte(TX.rasen(e.w, e.h), 0.03, 0.02, schichten.rasen); r.userData.wachsen = true;
      } else if (['beet', 'insel', 'lavendel'].includes(e.k)) {
        platte(TX.erde(e.w, e.h), 0.06, 0.03, schichten.beet);
        const n = Math.min(60, Math.round(e.w * e.h * 3));
        for (let i = 0; i < n; i++) { const pf = mesh(new T.SphereGeometry(0.16 + Math.random() * 0.08, 8, 6), mat(e.k === 'lavendel' ? '#7a6fb8' : ['#6b9a3a', '#e58fb5', '#e8d36a', '#b8a0e8', '#ffb36b'][i % 5], { roughness: 0.9 })); pf.position.set(c.x - e.w / 2 + 0.2 + Math.random() * (e.w - 0.4), 0.15, c.z - e.h / 2 + 0.2 + Math.random() * (e.h - 0.4)); pf.scale.setScalar(0.01); pf.visible = false; pf.userData.pflanze = { max: 0.7 + Math.random() * 0.6, jahre: 2 }; sc.add(pf); schichten.pflanzen.push(pf); }
      } else if (e.k === 'hochbeet') {
        const g = new T.Group(); const rah = TX.holz(e.w, 1, '#8a6a4a');
        [[e.w, 0.8, 0.05, 0, -e.h / 2], [e.w, 0.8, 0.05, 0, e.h / 2], [0.05, 0.8, e.h, -e.w / 2, 0], [0.05, 0.8, e.h, e.w / 2, 0]].forEach(([w, h, d, x, z]) => { const me = mesh(new T.BoxGeometry(w, h, d), new T.MeshStandardMaterial({ map: rah })); me.position.set(x, 0.4, z); g.add(me); });
        g.add(mesh(new T.BoxGeometry(e.w - 0.1, 0.05, e.h - 0.1), new T.MeshStandardMaterial({ map: TX.erde(e.w, e.h) })).translateY(0.76));
        for (let i = 0; i < 8; i++) { const pf = mesh(new T.SphereGeometry(0.14, 8, 6), mat(i % 2 ? '#5c9a3a' : '#8fcf6a')); pf.position.set(-e.w / 2 + 0.25 + (i % 4) * (e.w - 0.5) / 3, 0.85, i < 4 ? -0.2 : 0.2); g.add(pf); }
        g.position.set(c.x, 0, c.z); g.visible = false; sc.add(g); schichten.beet.push(g);
      } else if (e.k === 'teich') {
        platte(null, 0.02, 0.01, schichten.aushub, '#2a2018');
        const w = mesh(new T.CircleGeometry(1, 40), new T.MeshStandardMaterial({ map: TX.wasser(), roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.92 })); w.rotation.x = -Math.PI / 2; w.scale.set(e.w / 2, e.h / 2, 1); w.position.set(c.x, 0.03, c.z); w.visible = false; sc.add(w); schichten.wasser.push(w);
        for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, st = mesh(new T.DodecahedronGeometry(0.18 + Math.random() * 0.1), mat('#9a948c', { roughness: 1 })); st.position.set(c.x + Math.cos(a) * e.w / 2, 0.08, c.z + Math.sin(a) * e.h / 2); st.visible = false; sc.add(st); schichten.wasser.push(st); }
      } else if (e.k === 'hecke') {
        const he = mesh(new T.BoxGeometry(e.w, 1.6, Math.max(0.5, e.h)), mat(v.stil === 'lounge' ? '#6e5a4a' : '#2f5f22', { roughness: 1 })); he.position.set(c.x, 0.8, c.z); he.scale.y = 0.01; he.visible = false; he.userData.pflanze = { max: 1, jahre: 4, hecke: true }; sc.add(he); schichten.pflanzen.push(he);
      } else if (e.k === 'haus') {
        const g = new T.Group(); g.add(mesh(new T.BoxGeometry(e.w, 2.2, e.h), new T.MeshStandardMaterial({ map: TX.holz(e.w, 2, '#7a5a3a') })).translateY(1.1));
        const d2 = mesh(new T.CylinderGeometry(0.01, e.h * 0.62, e.w + 0.3, 3), mat('#3a3a3a')); d2.rotation.z = Math.PI / 2; d2.position.y = 2.5; d2.scale.set(1, 1, 0.5); g.add(d2);
        g.position.set(c.x, 0, c.z); g.visible = false; sc.add(g); schichten.bau.push(g);
      }
    });
    // Bäume & Sträucher (wachsen)
    v.elemente.filter((e) => e.r != null).forEach((e) => {
      const c = P(e.x, e.y), g = new T.Group();
      const stamm = zyl(0.08, 1, '#5a3f2a', 0, 0.5, 0); g.add(stamm);
      const krone = new T.Group(); [[0, 0, 0, 1], [0.35, -0.15, 0.2, 0.7], [-0.3, -0.1, -0.25, 0.75], [0, 0.35, 0, 0.6]].forEach(([x, y, z, r]) => { const k = mesh(new T.IcosahedronGeometry(r, 1), mat(e.k === 'obstbaum' ? '#4a8a30' : e.k === 'strauch' ? '#3d6e2a' : '#3f7a2a', { roughness: 0.95, flatShading: true })); k.position.set(x, y, z); krone.add(k); }); g.add(krone);
      g.userData.baum = { r0: e.r, r1: e.rMax, jahre: e.jahre, krone, stamm, art: e.k };
      g.position.copy(c); g.visible = false; sc.add(g); schichten.pflanzen.push(g);
    });
    // Licht am Abend
    v.elemente.filter((e) => e.k === 'licht').forEach((e) => { [0, 2.5, 5].forEach((dy) => { if (e.y + dy > Tt) return; const q = P(e.x, e.y + dy); const pf = zyl(0.05, 0.5, '#333', q.x, 0.25, q.z); sc.add(pf); const l = new T.PointLight(0xffc982, 0, 4); l.position.set(q.x, 0.55, q.z); sc.add(l); schichten.licht.push(l); const kopf = mesh(new T.SphereGeometry(0.06, 8, 6), mat('#fff', { emissive: new T.Color('#ffc982'), emissiveIntensity: 0 })); kopf.position.set(q.x, 0.52, q.z); sc.add(kopf); schichten.licht.push(kopf); }); });
    const terr = v.elemente.find((e) => e.k === 'terrasse');
    const tc = terr ? P(terr.x + terr.w / 2, terr.y + terr.h / 2) : P(L / 2, 2);
    const V = (x, y, z) => new T.Vector3(x, y, z);
    f.PH = [
      { id: 'leer', n: 'Vorher', d: 2.5, txt: `Garten ${zahl(L)} × ${zahl(Tt)} m – Ausgangslage`, kam: [V(L * 0.7, gr * 0.75, Tt * 1.1), V(0, 0, 0), V(L * 0.55, gr * 0.6, Tt * 0.9)] },
      { id: 'abstecken', n: 'Abstecken', d: 3, txt: 'Flächen mit Pflöcken und Schnur abstecken', kam: [V(0.01, gr * 1.15, 0.6), V(0, 0, 0)] },
      { id: 'aushub', n: 'Aushub', d: 2.8, txt: 'Aushub für Terrasse, Weg und Teich (25–35 cm)', kam: [V(tc.x + 4, 3.2, tc.z + 6), tc] },
      { id: 'unterbau', n: 'Unterbau', d: 2.8, txt: 'Schotter einbauen und verdichten, Gefälle 2 % vom Haus weg', kam: [V(tc.x + 3, 2.2, tc.z + 4.5), tc, V(tc.x - 2, 2, tc.z + 4)] },
      { id: 'belag', n: 'Terrasse & Wege', d: 3.6, txt: (terr ? 'Terrasse: ' + BELAEGE[terr.mat || 'holz'].n + ' verlegen' : 'Beläge verlegen'), kam: [V(tc.x - 3, 1.4, tc.z + 3.2), tc, V(tc.x + 3, 1.6, tc.z + 3.5)] },
      { id: 'beete', n: 'Beete & Bauten', d: 3, txt: 'Beete, Hochbeete (Wühlmausgitter!), Teich und Gartenhaus', kam: [V(L * 0.2, 3.5, Tt * 0.7), V(0, 0, Tt * 0.15)] },
      { id: 'rasen', n: 'Rasen', d: 2.5, txt: 'Rollrasen auslegen und wässern', kam: [V(-L * 0.3, 2.6, Tt * 0.6), V(0, 0, 0)] },
      { id: 'pflanzen', n: 'Pflanzen', d: 2.6, txt: 'Bäume, Sträucher und Stauden pflanzen – Abstand nach Endgröße', kam: [V(L * 0.4, 3, Tt * 0.2), V(0, 1, Tt * 0.3)] },
      { id: 'wachsen', n: '5 Jahre', d: 7, txt: (t, k) => ['Frühling', 'Sommer', 'Herbst', 'Winter'][Math.floor(k * 20) % 4] + ' · Jahr ' + Math.min(5, 1 + Math.floor(k * 5)), kam: [V(L * 0.75, gr * 0.55, Tt * 1.05), V(0, 0.5, 0), V(-L * 0.6, gr * 0.5, Tt * 1.0)] },
      { id: 'abend', n: 'Abends', d: 5, txt: 'Fertig – abends mit Licht', kam: [V(tc.x + 2, 1.5, tc.z + 5), V(0, 0.8, Tt * 0.1), V(L * 0.5, 2.2, Tt * 0.8)] }
    ];
    const saisonFarbe = ['#7fbf5a', '#3f7a2a', '#c9772e', '#6b5a4a'];
    f.update = (t) => {
      abst.visible = t >= f.ph('abstecken').a && t < f.ph('belag').e;
      const sicht = (liste, id, wachsen) => { const k = f.k(id, t), pa = f.ph(id).a; liste.forEach((me, i) => { const ki = Math.max(0, Math.min(1, (k * liste.length - i * 0.6))); me.visible = t >= pa && ki > 0; if (wachsen && me.userData && me.userData.wachsen) { me.scale.x = Math.max(0.001, leicht(ki)); } }); };
      sicht(schichten.aushub, 'aushub'); sicht(schichten.unterbau, 'unterbau'); sicht(schichten.belag, 'belag', true); sicht(schichten.beet, 'beete'); sicht(schichten.bau, 'beete'); sicht(schichten.wasser, 'beete'); sicht(schichten.rasen, 'rasen', true);
      schichten.aushub.forEach((me) => { if (t >= f.ph('unterbau').e) me.visible = false; });
      erde.visible = true;
      // Pflanzen und Wachstum
      const kp = f.k('pflanzen', t), kw = f.k('wachsen', t), jahr = kw * 5, saison = Math.floor(kw * 20) % 4;
      schichten.pflanzen.forEach((g, i) => {
        g.visible = t >= f.ph('pflanzen').a && kp * schichten.pflanzen.length >= i * 0.3;
        if (g.userData.baum) { const b = g.userData.baum, r = b.r0 + (b.r1 - b.r0) * Math.min(1, jahr / b.jahre), h = r * 1.6 + 0.6; b.krone.scale.setScalar(r); b.krone.position.y = h; b.stamm.scale.y = h; b.stamm.position.y = h / 2; const kahl = kw > 0 && saison === 3 && b.art !== 'strauch'; b.krone.visible = !kahl; b.krone.children.forEach((c) => c.material.color.set(kw > 0 ? (b.art === 'obstbaum' && saison === 0 ? '#f2c4d6' : saisonFarbe[saison]) : '#4a8a30')); }
        else if (g.userData.pflanze) { const pp = g.userData.pflanze, gk = Math.min(1, 0.35 + jahr / pp.jahre * 0.65) * (kp > 0 ? 1 : 0); if (pp.hecke) { g.scale.y = Math.max(0.01, 0.3 + 0.7 * Math.min(1, jahr / pp.jahre)); g.position.y = 0.8 * g.scale.y; } else g.scale.setScalar(Math.max(0.01, pp.max * gk * (kw > 0 && saison === 3 ? 0.4 : 1))); }
      });
      schichten.rasen.forEach((r) => r.material.color.set(kw > 0 && saison === 3 ? '#c8d0c0' : kw > 0 && saison === 2 ? '#b7c48a' : '#ffffff'));
      // Abend: Sonne runter, Lichter an
      const ka = f.k('abend', t); so.intensity = 1.1 - 0.9 * leicht(ka); f.renderer.toneMappingExposure = 0.85 - 0.45 * leicht(ka);
      schichten.licht.forEach((l) => { if (l.isLight) l.intensity = 1.6 * leicht(ka); else l.material.emissiveIntensity = 2 * leicht(ka); });
    };
    f.start();
  };

  /* ---------- Schichtaufbau in 4D (Fassade, Keller, Dach, Terrasse, Bad, Fenster …) ---------- */
  window.zeigeSchichten4D = function (anlId) {
    const a = ANLEITUNGEN[anlId]; if (!a || !a.schichten) return;
    const lage = /dach/.test(anlId) && anlId !== 'oberste_decke' ? 'schraeg' : /terrasse|hochbeet|gartenweg|bad_abdichten|balkon|laminat|bodenbeschichtung/.test(anlId) ? 'boden' : 'wand';
    const aussen = /fassade|dach$|keller_abdichten|terrasse|hochbeet|regenrinne|carport|zaun|teich|gartenweg/.test(anlId) || a.b === 'garten' || anlId === 'dach';
    const f = filmRahmen(a.t + ' – 4D', { aussen, info: 'Schicht für Schicht – Kapitel antippen springt dorthin.' });
    const sc = f.sc;
    sc.add(new T.HemisphereLight(0xffffff, 0x555555, 0.6));
    const so = new T.DirectionalLight(0xffffff, 1); so.position.set(4, 7, 5); so.castShadow = true; so.shadow.mapSize.set(1024, 1024); sc.add(so);
    const boden = mesh(new T.PlaneGeometry(12, 12), aussen ? new T.MeshStandardMaterial({ map: TX.rasen(12, 12) }) : mat('#cfcac2')); boden.rotation.x = -Math.PI / 2; boden.position.y = -0.01; sc.add(boden);
    const sch = a.schichten, n = sch.length, B2 = 2.4, H2 = 2.0;
    const dicke = sch.map((s, i) => /dämm|wdvs|schotter|äste|grasschnitt|kompost|pflanzerde|perimeter/i.test(s[0] + s[2]) ? 0.18 : /folie|bahn|band|dampf|abdichtung|grundier|manschett|anstrich|kleber|gitter|vlies/i.test(s[0] + s[2]) ? 0.025 : i === 0 ? 0.24 : 0.07);
    const gruppe = new T.Group(); sc.add(gruppe);
    const teile = []; let off = 0;
    sch.forEach((s, i) => {
      const d = dicke[i], farbe = s[1];
      let me, tex = null;
      if (/ziegel|eindeckung/i.test(s[0])) tex = TX.ziegel(); else if (/putz|anstrich|innenverkleidung|gipskarton/i.test(s[0])) tex = TX.putz(farbe); else if (/holz|lattung|sparren|dielen|platten \/ unterkonstruktion/i.test(s[0])) tex = TX.holz(2, 2, farbe); else if (/schotter|splitt|kies/i.test(s[0])) tex = TX.schotter(2, 2); else if (/erde|kompost/i.test(s[0])) tex = TX.erde(2, 2);
      const m2 = tex ? new T.MeshStandardMaterial({ map: tex, roughness: 0.85 }) : mat(farbe, { roughness: 0.8 });
      // jede Schicht etwas kleiner → Treppenschnitt, damit alle Schichten sichtbar bleiben
      const st = i * 0.18;
      if (lage === 'boden') { me = mesh(new T.BoxGeometry(B2 - st, d, B2 - st), m2); me.position.set(st / 2, off + d / 2, st / 2); }
      else { me = mesh(new T.BoxGeometry(B2 - st, H2 - st * 0.6, d), m2); me.position.set(st / 2, (H2 - st * 0.6) / 2 + st * 0.6, off + d / 2); }
      off += d; me.visible = false; me.userData.ziel = me.position.clone(); gruppe.add(me);
      const sp = schild((i + 1) + ' ' + s[0], s[1].length === 7 ? s[1] : '#ffd27a', 0.09);
      sp.position.copy(me.position).add(lage === 'boden' ? new T.Vector3(-(B2 - st) / 2 - 0.1, 0.05, (B2 - st) / 2) : new T.Vector3(-(B2 - st) / 2 - 0.2, (H2 - st * 0.6) / 2 - 0.1, d / 2)); sp.visible = false; gruppe.add(sp);
      teile.push({ me, sp });
    });
    if (lage === 'schraeg') { gruppe.rotation.x = -0.6; gruppe.position.set(0, 0.6, 0.4); }
    if (lage === 'wand') gruppe.position.set(0, 0, -0.4);
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const mitte = lage === 'boden' ? V(0, 0.3, 0) : V(0, 1.1, 0.2);
    f.PH_SKAL = 1.35;
    f.PH = sch.map((s, i) => ({ id: 's' + i, n: s[0].replace(/^[①②③]\s*/, '').split(':')[0].slice(0, 22), d: 2.6, txt: s[0] + (s[2] ? ' – ' + s[2] : ''), kam: [lage === 'boden' ? V(3.2 - i * 0.1, 2.1, 3.4) : V(3.4 - (i % 2) * 1.5, 1.8 + (i % 3) * 0.2, 3.7), mitte, lage === 'boden' ? V(2.4, 1.7, 3.8) : V(2.1, 1.6, 4.2)] }));
    f.PH.push({ id: 'fertig', n: 'Fertig', d: 4.5, txt: a.t + ' – alle Schichten', kam: [V(3.2, 2.2, 3.4), mitte, V(-2.6, 2, 3.4)] });
    f.update = (t) => {
      teile.forEach((x, i) => {
        const k = f.k('s' + i, t), pa = f.ph('s' + i).a; x.me.visible = t >= pa; x.sp.visible = t >= pa;
        const ein = leicht(k / 0.6); const z = x.me.userData.ziel;
        if (lage === 'boden') x.me.position.set(z.x, z.y + (1 - ein) * 1.2, z.z); else x.me.position.set(z.x, z.y, z.z + (1 - ein) * 1.2);
      });
    };
    f.start();
  };
})();
