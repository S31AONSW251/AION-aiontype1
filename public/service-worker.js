// Minimal app shell + offline API fallback for AION
const CACHE_NAME = 'aion-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  // Add build output entrypoints if known (CRA produces static/js/...), but keep lightweight
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => evt.waitUntil(self.clients.claim()));

self.addEventListener('fetch', evt => {
  try {
    const url = new URL(evt.request.url);
    // Offline fallback for API calls
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ollama/') || url.pathname.startsWith('/api/ollama/')) {
      evt.respondWith(
        fetch(evt.request).catch(() => new Response(JSON.stringify({ offline: true }), { headers: { 'Content-Type': 'application/json' } }))
      );
      return;
    }
  } catch (e) {
    // ignore URL parse errors
  }

  // Network-first for everything else, fallback to cache
  evt.respondWith(
    fetch(evt.request).then(resp => {
      if (evt.request.method === 'GET') {
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(evt.request, resp.clone()); } catch (e) { /* some requests are opaque and can't be cached */ }
        });
      }
      return resp;
    }).catch(() => caches.match(evt.request).then(r => r || caches.match('/')))
  );
});
