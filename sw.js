const CACHE_NAME = 'famille-app-v20';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Les données (/api) ne sont JAMAIS mises en cache : elles viennent toujours du serveur.
// Les fichiers de l'application : réseau d'abord, cache en secours hors-ligne.
self.addEventListener('fetch', (event) => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api')) return;
  event.respondWith(
    fetch(req)
      .then((res) => { const copie = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copie)); return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
