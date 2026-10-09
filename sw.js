// VoltPilot service worker: app disponibile offline, mappe/meteo/percorsi sempre dalla rete
const CACHE = 'voltpilot-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), own = u.origin === location.origin, lib = /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host);
  if (!own && !lib) return;
  const keep = res => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); } return res; };
  if (own) e.respondWith(fetch(r).then(keep).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
  else e.respondWith(caches.match(r).then(m => m || fetch(r).then(keep)));
});
