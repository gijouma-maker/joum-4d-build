/* Joum 4D Build – „Bauteile erklärt“: echtes 3D statt Kisten
   Holzständerhaus mit Dachstuhl in Originalmaßen (KVH 6/12, Sparren 8/18), Holz mit Maserung und Ästen,
   weiche Schatten, Studio-Licht, Beschriftung mit Linie + Punkt (in der 3D-Szene → auch im Video),
   Montage Teil für Teil, Vorlesen, Zeitleiste, Export als Reel (Hochformat). Läuft komplett im Handy, ohne Server. */
(function () {
  const T = window.THREE;
  if (!T) return;

  /* ---------- Oberflächen (prozedural, keine Downloads nötig) ---------- */
  function zufall(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function holzCanvas(grund, seed) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d'), r = zufall(seed || 7);
    x.fillStyle = grund; x.fillRect(0, 0, 1024, 256);
    // Jahresringe/Maserung: lange, leicht wellige Linien
    for (let i = 0; i < 140; i++) {
      const y0 = r() * 256, amp = 2 + r() * 6, f = 0.004 + r() * 0.01, ph = r() * 6;
      x.strokeStyle = `rgba(${90 + r() * 40},${55 + r() * 30},${25 + r() * 20},${0.05 + r() * 0.12})`; x.lineWidth = 0.6 + r() * 1.8;
      x.beginPath(); for (let px = 0; px <= 1024; px += 8) { const py = y0 + Math.sin(px * f + ph) * amp; px ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    }
    // Äste
    for (let k = 0; k < 3; k++) {
      const kx = 80 + r() * 860, ky = 30 + r() * 196, rw = 8 + r() * 14;
      for (let j = 6; j > 0; j--) { x.fillStyle = `rgba(${70 - j * 4},${40 - j * 2},${18},${0.12 + (6 - j) * 0.08})`; x.beginPath(); x.ellipse(kx, ky, rw * j / 3.2, rw * j / 5.5, 0, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = 'rgba(50,28,12,0.75)'; x.beginPath(); x.ellipse(kx, ky, rw * 0.45, rw * 0.32, 0, 0, Math.PI * 2); x.fill();
    }
    // feine Poren
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(60,35,15,${r() * 0.08})`; x.fillRect(r() * 1024, r() * 256, 1 + r() * 3, 1); }
    return c;
  }
  function osbCanvas() {
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'), r = zufall(31);
    x.fillStyle = '#c9a46a'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1400; i++) { x.save(); x.translate(r() * 512, r() * 512); x.rotate(r() * Math.PI); const h = 0.6 + r() * 0.5; x.fillStyle = `rgb(${Math.round(150 * h + 40)},${Math.round(115 * h + 25)},${Math.round(60 * h + 15)})`; x.fillRect(-18, -5, 36 + r() * 20, 8 + r() * 6); x.restore(); }
    return c;
  }
  function betonCanvas() {
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'), r = zufall(11);
    x.fillStyle = '#a9a7a2'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { const g = 120 + r() * 70; x.fillStyle = `rgba(${g},${g},${g - 4},${r() * 0.25})`; x.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2); }
    return c;
  }
  function textur(canvas, wiederholen) { const t = new T.CanvasTexture(canvas); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 8; if (wiederholen) t.repeat.set(wiederholen, wiederholen); return t; }
  let MAT = null;
  function materialien() {
    if (MAT) return MAT;
    const holz = [0, 1, 2].map((i) => { const c = holzCanvas(['#d2a466', '#cc9c5e', '#d6ab70'][i], 7 + i * 13); const t = textur(c); const b = textur(c); b.encoding = T.LinearEncoding; return new T.MeshStandardMaterial({ map: t, bumpMap: b, bumpScale: 0.004, roughness: 0.78, metalness: 0 }); });
    const sparren = (() => { const c = holzCanvas('#c89658', 99); const t = textur(c); return new T.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.004, roughness: 0.8 }); })();
    const osb = new T.MeshStandardMaterial({ map: textur(osbCanvas()), roughness: 0.85 });
    const beton = new T.MeshStandardMaterial({ map: textur(betonCanvas(), 3), roughness: 0.95 });
    MAT = { holz, sparren, osb, beton };
    return MAT;
  }
  /* Balken: UVs so setzen, dass die Maserung entlang der Längsachse läuft */
  function balkenGeo(lx, ly, lz, versatz) {
    const g = new T.BoxGeometry(lx, ly, lz), p = g.attributes.position, uv = g.attributes.uv;
    const dims = [lx, ly, lz], lang = dims.indexOf(Math.max(lx, ly, lz)), a = [0, 1, 2].filter((i) => i !== lang);
    for (let i = 0; i < p.count; i++) {
      const v = [p.getX(i), p.getY(i), p.getZ(i)];
      uv.setXY(i, (v[lang] + (versatz || 0)) / 1.6, (v[a[0]] + v[a[1]]) / 0.5 + (versatz || 0) * 0.37);
    }
    uv.needsUpdate = true; return g;
  }

  /* ---------- Modell: Holzständerhaus 4,0 × 3,0 m, Wand 2,5 m, Satteldach 40° ---------- */
  const PHASEN = [
    ['Bodenplatte', 'Bodenplatte aus Beton – trägt das ganze Haus. Darauf kommt eine Sperrbahn gegen aufsteigende Feuchte.'],
    ['Schwelle', 'Schwelle: das unterste Holz der Wand, 6 × 12 cm, mit Ankern auf der Bodenplatte verschraubt.'],
    ['Ständer', 'Ständer: senkrechte Hölzer im Abstand von 62,5 Zentimetern – passend zur Plattenbreite von 1,25 Metern.'],
    ['Sturz & Riegel', 'Über Fenster und Tür trägt ein Sturz die Last. Unter dem Fenster sitzt der Brüstungsriegel.'],
    ['Rähm', 'Rähm: das oberste Holz der Wand, doppelt gelegt. Es verbindet alle Ständer und trägt das Dach.'],
    ['Sparren', 'Sparren: die schrägen Dachbalken, 8 × 18 Zentimeter, alle 80 Zentimeter, mit Kerve auf dem Rähm aufgelegt.'],
    ['First', 'Firstbrett: oben treffen sich die Sparren – hier werden sie verbunden.'],
    ['Kehlbalken', 'Kehlbalken: waagerechte Hölzer zwischen den Sparren. Sie halten das Dach gegen Auseinanderdrücken.'],
    ['Beplankung', 'Beplankung mit OSB-Platten: macht die Wand steif und ist Untergrund für Dämmung und Fassade.']
  ];
  function hausBauen() {
    const M = materialien(), teile = [], labels = [];
    const B = 4.0, D = 3.0, b = 0.06, t = 0.12, Hw = 2.5, rh = 0.06; // Ständer 6 × 12
    const ständerH = Hw - b - 2 * rh, y0 = 0;
    let nr = 0;
    const balken = (phase, lx, ly, lz, x, y, z, mat, rot) => {
      const m = new T.Mesh(balkenGeo(lx, ly, lz, (nr++ * 0.73) % 3), mat || M.holz[nr % 3]);
      m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = m.receiveShadow = true; teile.push({ m, phase, ziel: m.position.clone() }); return m;
    };
    // 0 Bodenplatte
    const platte = new T.Mesh(new T.BoxGeometry(B + 0.4, 0.2, D + 0.4), M.beton); platte.position.set(0, -0.1, 0); platte.receiveShadow = platte.castShadow = true; teile.push({ m: platte, phase: 0, ziel: platte.position.clone() });
    labels.push({ phase: 0, text: 'Bodenplatte', an: new T.Vector3(-B / 2 - 0.1, 0, D / 2 + 0.1), weg: new T.Vector3(-0.6, 0.5, 0.6) });
    // Wände: [Achse, fest, von, bis, Öffnungen]
    const waende = [
      { achse: 'x', z: D / 2 - t / 2, von: -B / 2, bis: B / 2, tuer: [-0.5, 0.5] },
      { achse: 'x', z: -D / 2 + t / 2, von: -B / 2, bis: B / 2 },
      { achse: 'z', x: -B / 2 + t / 2, von: -D / 2 + t, bis: D / 2 - t },
      { achse: 'z', x: B / 2 - t / 2, von: -D / 2 + t, bis: D / 2 - t, fenster: [-0.6, 0.6, 0.9, 2.1] }
    ];
    const setze = (w, phase, s, laenge, y, hoehe, dicke) => { // s = Mitte entlang der Wand
      const lx = w.achse === 'x' ? laenge : (dicke || t), lz = w.achse === 'x' ? (dicke || t) : laenge;
      return balken(phase, lx, hoehe, lz, w.achse === 'x' ? s : w.x, y, w.achse === 'x' ? w.z : s);
    };
    waende.forEach((w, wi) => {
      const L = w.bis - w.von;
      // 1 Schwelle (bei Tür unterbrochen)
      if (w.tuer) { setze(w, 1, (w.von + w.tuer[0]) / 2, w.tuer[0] - w.von, y0 + b / 2, b); setze(w, 1, (w.tuer[1] + w.bis) / 2, w.bis - w.tuer[1], y0 + b / 2, b); }
      else setze(w, 1, (w.von + w.bis) / 2, L, y0 + b / 2, b);
      // 2 Ständer
      const pos = []; for (let s = w.von + b / 2; s < w.bis - b / 2 + 0.001; s += 0.625) pos.push(s); pos.push(w.bis - b / 2);
      const yS = y0 + b + ständerH / 2;
      pos.forEach((s) => {
        if (w.tuer && s > w.tuer[0] - 0.01 && s < w.tuer[1] + 0.01) return;
        if (w.fenster && s > w.fenster[0] - 0.01 && s < w.fenster[1] + 0.01) {
          // kurze Ständer unter der Brüstung und über dem Sturz
          const u = w.fenster[2] - b - 0.06; setze(w, 3, s, b, y0 + b + u / 2, u);
          const o0 = w.fenster[3] + 0.2, o = Hw - 2 * rh - o0; if (o > 0.02) setze(w, 3, s, b, o0 + o / 2, o);
          return;
        }
        setze(w, 2, s, b, yS, ständerH);
      });
      if (w.tuer) { [w.tuer[0] - b / 2, w.tuer[1] + b / 2].forEach((s) => setze(w, 2, s, b, yS, ständerH)); setze(w, 3, 0, w.tuer[1] - w.tuer[0] + 2 * b, 2.1 + 0.1, 0.2); const ob = Hw - 2 * rh - 2.3; setze(w, 3, 0, b, 2.3 + ob / 2, ob); }
      if (w.fenster) { [w.fenster[0] - b / 2, w.fenster[1] + b / 2].forEach((s) => setze(w, 2, s, b, yS, ständerH)); setze(w, 3, 0, w.fenster[1] - w.fenster[0], w.fenster[2] - 0.03, 0.06); setze(w, 3, 0, w.fenster[1] - w.fenster[0] + 2 * b, w.fenster[3] + 0.1, 0.2); }
      // 4 Rähm doppelt
      [0, 1].forEach((k) => setze(w, 4, (w.von + w.bis) / 2 + (w.achse === 'z' ? 0 : 0), w.achse === 'z' && k === 1 ? L + 2 * t : L, Hw - rh * (1.5 - k) - rh / 2 + rh / 2, rh));
    });
    labels.push({ phase: 1, text: 'Schwelle', an: new T.Vector3(-1.4, b, D / 2 - t / 2), weg: new T.Vector3(-0.5, 0.45, 0.55) });
    labels.push({ phase: 2, text: 'Ständer 6/12', an: new T.Vector3(-B / 2 + 0.66, 1.2, D / 2), weg: new T.Vector3(-0.7, 0.3, 0.6) });
    labels.push({ phase: 3, text: 'Sturz', an: new T.Vector3(0, 2.2, D / 2), weg: new T.Vector3(0.55, 0.35, 0.6) });
    labels.push({ phase: 3, text: 'Brüstungsriegel', an: new T.Vector3(B / 2, 0.87, 0), weg: new T.Vector3(0.7, -0.25, 0.4) });
    labels.push({ phase: 4, text: 'Rähm', an: new T.Vector3(1.2, Hw - rh, D / 2 - t / 2), weg: new T.Vector3(0.5, 0.45, 0.5) });
    // Dach: Sparren quer zur First (First entlang x), Neigung 40°, Überstand 40 cm
    const neig = 40 * Math.PI / 180, tan = Math.tan(neig), sb = 0.08, sh = 0.18, ueber = 0.4;
    const halb = D / 2 + ueber, firstY = Hw + (D / 2) * tan + 0.05, laenge = halb / Math.cos(neig);
    const xs = []; for (let x = -B / 2 + sb / 2; x <= B / 2 - sb / 2 + 0.001; x += 0.8) xs.push(x); if (Math.abs(xs[xs.length - 1] - (B / 2 - sb / 2)) > 0.05) xs.push(B / 2 - sb / 2);
    xs.forEach((x) => [1, -1].forEach((seite) => {
      const zm = seite * halb / 2, ym = firstY - (halb / 2) * tan - 0.02;
      balken(5, sb, sh, laenge, x, ym, zm, M.sparren, [seite * neig, 0, 0]);
    }));
    labels.push({ phase: 5, text: 'Sparren 8/18', an: new T.Vector3(-B / 2 + 0.04, Hw + 0.6, D / 4), weg: new T.Vector3(0.5, 0.45, 0.6) });
    balken(6, B + 0.1, 0.2, 0.03, 0, firstY + 0.02, 0, M.sparren);
    labels.push({ phase: 6, text: 'Firstbrett', an: new T.Vector3(0.6, firstY + 0.1, 0), weg: new T.Vector3(0.4, 0.5, 0.3) });
    const kY = Hw + (D / 2) * tan * 0.55, kL = 2 * ((firstY - kY) / tan) + 0.1;
    xs.forEach((x) => balken(7, 0.04, 0.16, kL, x + sb / 2 + 0.02, kY, 0, M.holz[1]));
    labels.push({ phase: 7, text: 'Kehlbalken', an: new T.Vector3(B / 2 - 0.4, kY, 0.3), weg: new T.Vector3(0.6, 0.3, 0.5) });
    // OSB auf Rückwand (außen) und linker Wand – in Plattenbreite 1,25 m
    for (let x = -B / 2; x < B / 2 - 0.01; x += 1.25) { const w = Math.min(1.25, B / 2 - x); const m = new T.Mesh(new T.BoxGeometry(w - 0.004, Hw, 0.015), M.osb); m.position.set(x + w / 2, Hw / 2, -D / 2 - 0.008); m.castShadow = m.receiveShadow = true; teile.push({ m, phase: 8, ziel: m.position.clone() }); }
    for (let z = -D / 2; z < D / 2 - 0.01; z += 1.25) { const w = Math.min(1.25, D / 2 - z); const m = new T.Mesh(new T.BoxGeometry(0.015, Hw, w - 0.004), M.osb); m.position.set(-B / 2 - 0.008, Hw / 2, z + w / 2); m.castShadow = m.receiveShadow = true; teile.push({ m, phase: 8, ziel: m.position.clone() }); }
    labels.push({ phase: 8, text: 'OSB-Platte', an: new T.Vector3(-B / 2 - 0.02, 1.4, -0.4), weg: new T.Vector3(-0.7, 0.2, 0.3) });
    return { teile, labels, hoehe: firstY };
  }

  /* ---------- Beschriftung: Punkt + Linie + Schild (Teil der Szene → im Video sichtbar) ---------- */
  function schildTextur(text) {
    const c = document.createElement('canvas'), x = c.getContext('2d'), fs = 54;
    x.font = '600 ' + fs + 'px Jost, Arial, sans-serif'; const w = Math.ceil(x.measureText(text).width) + 56;
    c.width = w; c.height = fs + 34; x.font = '600 ' + fs + 'px Jost, Arial, sans-serif';
    x.fillStyle = 'rgba(31,94,150,0.92)'; x.fillRect(0, 0, w, c.height);
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(0, 0, 6, c.height);
    x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(text, 28, c.height / 2 + 2);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return { t, v: w / c.height };
  }
  function beschriftung(l) {
    const g = new T.Group(), ziel = l.an.clone().add(l.weg);
    const { t, v } = schildTextur(l.text);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(0.26 * v, 0.26, 1); sp.position.copy(ziel); sp.renderOrder = 20;
    const linie = new T.Line(new T.BufferGeometry().setFromPoints([l.an, ziel]), new T.LineBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.9 })); linie.renderOrder = 19;
    const punkt = new T.Mesh(new T.SphereGeometry(0.035, 16, 12), new T.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); punkt.position.copy(l.an); punkt.renderOrder = 21;
    const ring = new T.Mesh(new T.RingGeometry(0.045, 0.06, 24), new T.MeshBasicMaterial({ color: 0x1f5e96, depthTest: false, side: T.DoubleSide })); ring.position.copy(l.an); ring.renderOrder = 21;
    g.add(linie, punkt, ring, sp); g.userData = { ring, l }; g.visible = false; return g;
  }

  /* ---------- Bühne ---------- */
  let AKTIV = null;
  function stoppen() { if (AKTIV) { AKTIV.laeuft = false; try { AKTIV.renderer.dispose(); } catch (e) {} AKTIV = null; } }
  function starten(box, opt) {
    stoppen();
    const W = box.clientWidth || 360, H = box.clientHeight || 640;
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H);
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.physicallyCorrectLights = false;
    box.innerHTML = ''; box.appendChild(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color(0xe9e8e4); scene.fog = new T.Fog(0xe9e8e4, 12, 26);
    try { const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture; } catch (e) {}
    scene.add(new T.HemisphereLight(0xffffff, 0xb8b2a6, 0.55));
    const sonne = new T.DirectionalLight(0xfff1dc, 1.15); sonne.position.set(5, 9, 6); sonne.castShadow = true; sonne.shadow.mapSize.set(2048, 2048); sonne.shadow.radius = 4; sonne.shadow.bias = -0.0004;
    Object.assign(sonne.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 }); scene.add(sonne);
    const boden = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ color: 0xdedbd4, roughness: 1 })); boden.rotation.x = -Math.PI / 2; boden.position.y = -0.2; boden.receiveShadow = true; scene.add(boden);
    const camera = new T.PerspectiveCamera(38, W / H, 0.05, 80);
    const controls = new T.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.target.set(0, 1.5, 0); controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 2; controls.maxDistance = 16;
    const haus = hausBauen(); haus.teile.forEach((p) => scene.add(p.m));
    const labelObj = haus.labels.map((l) => { const g = beschriftung(l); scene.add(g); return g; });
    const st = { renderer, scene, camera, controls, haus, labelObj, zeit: 0, spielt: true, laeuft: true, kamera: true, labels: true, phaseVorher: -1, opt, box };
    const DAUER = 2.4, N = PHASEN.length, ENDE = N * DAUER + 1.5;
    const proPhase = {}; haus.teile.forEach((p) => { (proPhase[p.phase] = proPhase[p.phase] || []).push(p); });
    Object.values(proPhase).forEach((liste) => liste.forEach((p, i) => { p.start = p.phase * DAUER + (i / Math.max(1, liste.length)) * DAUER * 0.65; }));
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    function anwenden() {
      const z = st.zeit;
      haus.teile.forEach((p) => {
        const k = Math.max(0, Math.min(1, (z - p.start) / 0.55));
        p.m.visible = k > 0; p.m.position.set(p.ziel.x, p.ziel.y + (1 - easeOut(k)) * 0.9, p.ziel.z);
        p.m.scale.setScalar(0.85 + 0.15 * easeOut(k));
      });
      const ph = Math.min(N - 1, Math.floor(z / DAUER));
      labelObj.forEach((g) => { g.visible = st.labels && g.userData.l.phase === ph && z > ph * DAUER + DAUER * 0.55; });
      if (ph !== st.phaseVorher) { st.phaseVorher = ph; if (opt.phase) opt.phase(ph); }
    }
    const uhr = new T.Clock();
    function kameraFahrt(z) {
      const hoch = (box.clientHeight || 640) / (box.clientWidth || 360), w = -0.9 + z * 0.11, r = (hoch > 1.3 ? 12.5 : 8.5) - Math.min(2.5, z * 0.12), h = 2.2 + Math.sin(z * 0.25) * 0.6 + (z > DAUER * 5 ? 1.2 : 0);
      camera.position.set(Math.sin(w) * r, h + 1.2, Math.cos(w) * r); controls.target.set(0, 1.3 + Math.min(0.8, z * 0.04), 0);
    }
    kameraFahrt(0);
    function loop() {
      if (!st.laeuft || !renderer.domElement.isConnected) { st.laeuft = false; return; }
      const dt = Math.min(0.05, uhr.getDelta());
      if (st.spielt) { st.zeit = Math.min(ENDE, st.zeit + dt); if (st.kamera) kameraFahrt(st.zeit); if (st.zeit >= ENDE) { st.spielt = false; if (opt.ende) opt.ende(); } if (opt.zeit) opt.zeit(st.zeit / ENDE); }
      anwenden(); labelObj.forEach((g) => g.userData.ring.lookAt(camera.position));
      controls.update(); renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    controls.addEventListener('start', () => { st.kamera = false; });
    st.setzeZeit = (anteil) => { st.zeit = anteil * ENDE; anwenden(); };
    st.zuPhase = (i) => { st.zeit = i * DAUER + DAUER * 0.9; st.spielt = false; anwenden(); };
    st.ENDE = ENDE; st.DAUER = DAUER;
    st.groesse = () => { const w = box.clientWidth, h = box.clientHeight; if (w && h) { renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); } };
    AKTIV = st; requestAnimationFrame(loop);
    return st;
  }
  window.addEventListener('resize', () => AKTIV && AKTIV.groesse());

  /* ---------- Bildschirm ---------- */
  route('bauteile', () => {
    nachRender(() => {
      const box = document.getElementById('bt-buehne'); if (!box) return;
      const st = starten(box, {
        phase: (i) => { const u = document.getElementById('bt-text'); if (u) u.innerHTML = `<b>${i + 1}. ${PHASEN[i][0]}</b> – ${esc(PHASEN[i][1])}`; document.querySelectorAll('.bt-phase').forEach((b, j) => b.classList.toggle('an', j === i)); if (st && st.spielt && S.einstellungen.vorlesen !== false) sprich(PHASEN[i][1], true); },
        zeit: (a) => { const r = document.getElementById('bt-zeit'); if (r && document.activeElement !== r) r.value = Math.round(a * 1000); },
        ende: () => { const k = document.getElementById('bt-play'); if (k) k.textContent = '▶ Nochmal'; if (BT_AUFNAHME) BT_AUFNAHME.stop(); }
      });
    });
    return kopf('Bauteile erklärt', 'Holzständerhaus mit Dachstuhl · echtes 3D', '#/') + `<div class="inhalt bauteile">
      <div class="zeile wrap"><button class="chip an">Holzständerhaus + Dach</button><button class="chip" data-akt="btBald" data-n="Mauerwerk">Mauerwerk</button><button class="chip" data-akt="btBald" data-n="Trockenbau">Trockenbau</button><button class="chip" data-akt="btBald" data-n="Bad-Installation">Bad-Installation</button></div>
      <div class="bt-buehne" id="bt-buehne"></div>
      <p class="bt-text" id="bt-text"></p>
      <input type="range" id="bt-zeit" min="0" max="1000" value="0" data-ein="btZeit" data-sofort="1" aria-label="Zeitleiste">
      <div class="zeile wrap"><button class="btn hell" id="bt-play" data-akt="btPlay">⏸ Pause</button><button class="btn" data-akt="btLabels">Beschriftung an/aus</button><button class="btn" data-akt="btReel">${ICON.film || '●'} Als Reel speichern</button></div>
      <div class="unter">Bauteil antippen</div>
      <div class="zeile wrap">${PHASEN.map((p, i) => `<button class="chip bt-phase" data-akt="btPhase" data-i="${i}">${i + 1}. ${esc(p[0])}</button>`).join('')}</div>
      <p class="klein grau">Maße wie im echten Holzrahmenbau: Ständer 6 × 12 cm im Raster 62,5 cm, Sparren 8 × 18 cm alle 80 cm, Dachneigung 40°. Mit dem Finger drehen und zoomen.</p>
    </div>`;
  });
  let BT_AUFNAHME = null;
  AKT.btPlay = () => { const st = AKTIV; if (!st) return; if (st.zeit >= st.ENDE) { st.zeit = 0; st.kamera = true; } st.spielt = !st.spielt; const k = document.getElementById('bt-play'); if (k) k.textContent = st.spielt ? '⏸ Pause' : '▶ Weiter'; };
  AKT.btLabels = () => { if (AKTIV) AKTIV.labels = !AKTIV.labels; };
  AKT.btPhase = (d) => { if (!AKTIV) return; AKTIV.zuPhase(Number(d.i)); sprich(PHASEN[Number(d.i)][1], true); const k = document.getElementById('bt-play'); if (k) k.textContent = '▶ Weiter'; };
  AKT.btBald = (d) => info(d.n + ' in echtem 3D kommt als Nächstes – in derselben Qualität wie das Holzständerhaus.');
  EIN.btZeit = (v) => { if (!AKTIV) return; AKTIV.spielt = false; AKTIV.setzeZeit(Number(v) / 1000); const k = document.getElementById('bt-play'); if (k) k.textContent = '▶ Weiter'; };
  AKT.btReel = () => {
    const st = AKTIV; if (!st) return;
    const cv = st.renderer.domElement;
    if (!cv.captureStream || !window.MediaRecorder) { info('Video-Aufnahme geht in diesem Browser nicht. In Chrome öffnen.'); return; }
    const typ = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
    const rec = new MediaRecorder(cv.captureStream(30), typ ? { mimeType: typ, videoBitsPerSecond: 8000000 } : undefined), teile = [];
    rec.ondataavailable = (e) => { if (e.data.size) teile.push(e.data); };
    rec.onstop = () => {
      BT_AUFNAHME = null;
      const blob = new Blob(teile, { type: typ || 'video/webm' }), endung = /mp4/.test(typ) ? 'mp4' : 'webm';
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'joum-bauteile.' + endung; document.body.appendChild(a); a.click(); a.remove();
      toast('Reel gespeichert (' + endung.toUpperCase() + ')');
    };
    st.zeit = 0; st.kamera = true; st.spielt = true; BT_AUFNAHME = rec; rec.start(500);
    toast('Aufnahme läuft – bis zum Ende abspielen');
  };
  HILFE.btPlay = 'Montage abspielen oder anhalten.';
  HILFE.btReel = 'Die Montage als Hochformat-Video speichern – für Reels und Shorts.';
  HILFE.btPhase = 'Zu diesem Bauteil springen und erklären lassen.';
})();
