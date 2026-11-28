/* Joum 4D Build – 3D erst laden, wenn es gebraucht wird (schnellerer Start, besonders auf älteren Handys).
   Three.js + Zusatzmodule + drei.js (~750 KB) kommen nur, wenn eine 3D-Ansicht geöffnet wird. */
const DREI_DATEIEN = ['js/vendor/three.min.js', 'js/vendor/OrbitControls.js', 'js/vendor/RoomEnvironment.js', 'js/vendor/Sky.js', 'js/drei.js'];
let DREI_LADEN = null;
function lade3D() {
  if (window.THREE && window.zeigeRaum3D && !window.zeigeRaum3D.platzhalter) return Promise.resolve();
  if (DREI_LADEN) return DREI_LADEN;
  DREI_LADEN = DREI_DATEIEN.reduce((kette, src) => kette.then(() => new Promise((ok, fehler) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fehler; document.head.appendChild(s);
  })), Promise.resolve()).catch((e) => { DREI_LADEN = null; throw e; });
  return DREI_LADEN;
}
['zeigeTeil', 'zeigeLeitung', 'zeigeRaum3D', 'zeigeFilm', 'zeigeBau4D', 'zeigeGarten4D', 'zeigeSchichten4D'].forEach((name) => {
  const platzhalter = function (...args) {
    const box = args[0] && args[0].nodeType === 1 ? args[0] : null;
    if (box) box.innerHTML = '<p class="klein grau" style="padding:16px">3D wird geladen …</p>';
    return lade3D().then(() => window[name](...args)).catch(() => info('Die 3D-Ansicht konnte nicht geladen werden. Bitte Internet prüfen und nochmal versuchen.'));
  };
  platzhalter.platzhalter = true;
  window[name] = platzhalter;
});
/* Wenn die App ruhig ist, 3D im Hintergrund schon vorbereiten – dann geht es später sofort auf */
setTimeout(() => { const los = () => lade3D().catch(() => {}); if ('requestIdleCallback' in window) requestIdleCallback(los, { timeout: 8000 }); else los(); }, 6000);
