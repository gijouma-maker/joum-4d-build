/* Joum 4D Build – Service Worker: App läuft auch offline */
const CACHE = 'j4d-v1';
const DATEIEN = ['./', './index.html', './css/app.css', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png',
  './js/data-raeume.js', './js/data-anleitungen.js', './js/data-garten.js', './js/core.js',
  './js/screens-projekte.js', './js/screens-garten.js', './js/screens-markt.js'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Netzwerk zuerst (aktuelle Version), bei Offline aus dem Speicher
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok && new URL(e.request.url).origin === location.origin) { const k = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, k)); }
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
