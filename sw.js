const CACHE = 'dca-pea-v27';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // s'active immédiatement sans attendre
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // prend le contrôle de tous les onglets immédiatement
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // index.html : toujours réseau en priorité (jamais en cache)
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Autres assets : cache en priorité
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
