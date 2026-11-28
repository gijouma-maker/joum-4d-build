/* Joum 4D Build – Möbel per Kamera in den echten Raum stellen (Augmented Reality, WebXR)
   Läuft kostenlos im Handy: Android + Chrome mit „Google Play-Dienste für AR“. iPhone-Safari kann WebXR (noch) nicht.
   Der ganze Vorschlag (oder ein Teil) wird in echter Größe auf den Boden gestellt: Boden anvisieren → tippen → steht. */

let AR_LAEUFT = null;
async function arVerfuegbar() {
  try { return !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')); } catch (e) { return false; }
}
function arHinweisOhne() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  info(ios
    ? 'Möbel per Kamera geht auf dem iPhone in Safari leider noch nicht (Apple unterstützt die Technik WebXR nicht). Auf Android-Handys mit Chrome funktioniert es. Bis dahin: Vorschlag in 3D ansehen.'
    : 'Dein Handy oder Browser kann AR hier nicht starten. So klappt es: App in Chrome öffnen (joum-4d-build.pages.dev) und im Play Store „Google Play-Dienste für AR“ installieren bzw. aktualisieren.');
}

async function arStarten(plan, raumMasse, titel) {
  if (!(await arVerfuegbar())) { arHinweisOhne(); return; }
  await lade3D();
  const T = window.THREE;
  // Overlay mit Knöpfen (bleibt in AR sichtbar)
  const ov = document.createElement('div'); ov.className = 'ar-overlay';
  ov.innerHTML = `<div class="ar-text" id="ar-text">Handy langsam über den Boden bewegen …</div>
    <div class="ar-knoepfe"><button id="ar-drehen">↻ Drehen</button><button id="ar-raum">Raum-Umriss an/aus</button><button id="ar-ende">Beenden</button></div>`;
  document.body.appendChild(ov);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1); renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = T.sRGBEncoding; renderer.xr.enabled = true;
  renderer.domElement.style.display = 'none'; document.body.appendChild(renderer.domElement);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
  scene.add(new T.HemisphereLight(0xffffff, 0x777777, 1.1));
  const dl = new T.DirectionalLight(0xffffff, 0.6); dl.position.set(1, 3, 2); scene.add(dl);
  // Ziel-Ring auf dem Boden
  const ring = new T.Mesh(new T.RingGeometry(0.12, 0.16, 40).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffd27a }));
  ring.matrixAutoUpdate = false; ring.visible = false; scene.add(ring);
  // Möbel in echter Größe (Meter), Ursprung = Raummitte
  const gruppe = new T.Group(); gruppe.visible = false;
  const farbe = (g) => ((window.GRUPPEN_FARBE_3D || GRUPPEN_FARBE || {})[g] || '#c9c3b8');
  plan.filter((e) => !e.gruppe || true).forEach((e) => {
    if (ebene(e.n) === 'decke') return;
    const f = fussabdruck(e), h = Math.max(0.02, (e.h || 50) / 100);
    const m = new T.Mesh(new T.BoxGeometry(f.w / 100, h, f.h / 100), new T.MeshStandardMaterial({ color: new T.Color(e.farbe || farbe(e.g)), roughness: 0.6, transparent: true, opacity: 0.88 }));
    const y0 = ebene(e.n) === 'wand' ? 1.2 : 0;
    m.position.set((f.x + f.w / 2 - raumMasse.breite / 2) / 100, y0 + h / 2, (f.y + f.h / 2 - raumMasse.tiefe / 2) / 100);
    const kanten = new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })); m.add(kanten);
    gruppe.add(m);
  });
  const B = raumMasse.breite / 100, D = raumMasse.tiefe / 100;
  const umriss = new T.LineLoop(new T.BufferGeometry().setFromPoints([[-B / 2, -D / 2], [B / 2, -D / 2], [B / 2, D / 2], [-B / 2, D / 2]].map(([x, z]) => new T.Vector3(x, 0.005, z))), new T.LineBasicMaterial({ color: 0xffd27a }));
  gruppe.add(umriss); scene.add(gruppe);

  let session;
  try { session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: ov } }); }
  catch (e) { ov.remove(); renderer.domElement.remove(); info('AR konnte nicht gestartet werden (Kamera-Erlaubnis?). Bitte erlauben und nochmal versuchen.'); return; }
  renderer.xr.setReferenceSpaceType('local'); await renderer.xr.setSession(session);
  const viewer = await session.requestReferenceSpace('viewer'), quelle = await session.requestHitTestSource({ space: viewer });
  const text = (t) => { const el = document.getElementById('ar-text'); if (el) el.textContent = t; };
  session.addEventListener('select', () => {
    if (!ring.visible) return;
    gruppe.position.setFromMatrixPosition(ring.matrix); gruppe.visible = true;
    text((titel ? titel + ': ' : '') + 'steht in echter Größe. Nochmal tippen = verschieben.');
    try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
  });
  ov.querySelector('#ar-drehen').onclick = (ev) => { ev.stopPropagation(); gruppe.rotation.y += Math.PI / 2; };
  ov.querySelector('#ar-raum').onclick = (ev) => { ev.stopPropagation(); umriss.visible = !umriss.visible; };
  ov.querySelector('#ar-ende').onclick = (ev) => { ev.stopPropagation(); session.end(); };
  session.addEventListener('end', () => { renderer.setAnimationLoop(null); ov.remove(); renderer.domElement.remove(); try { renderer.dispose(); } catch (e) {} AR_LAEUFT = null; });
  renderer.setAnimationLoop((zeit, frame) => {
    if (!frame) return;
    const ref = renderer.xr.getReferenceSpace(), treffer = frame.getHitTestResults(quelle);
    if (treffer.length) { const pose = treffer[0].getPose(ref); ring.visible = true; ring.matrix.fromArray(pose.transform.matrix); if (!gruppe.visible) text('Boden erkannt – tippen, um den Vorschlag hinzustellen.'); }
    else ring.visible = false;
    renderer.render(scene, camera);
  });
  AR_LAEUFT = session;
}
HILFE.studioAR = 'Den Vorschlag mit der Kamera in echter Größe in deinen Raum stellen.';
