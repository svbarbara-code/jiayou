/* 加油 Jiāyóu — offline-first service worker. jy-design/hub bump CACHE on release.
   Cache-first for same-origin GETs so the app opens with no network. */
const CACHE = 'jiayou-v2';
const CORE = ['.', 'index.html', 'manifest.webmanifest', 'favicon.svg',
              'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Audio is large and the Audio tab manages its own offline cache — don't double-cache it here.
  if (new URL(req.url).pathname.includes('/audio/')) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit))
  );
});
