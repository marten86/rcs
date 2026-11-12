// Service worker RCS: menyimpan cangkang (bukan data) supaya aplikasi cepat terbuka.
// Naikkan VERSI setiap kali file cangkang diubah.
var VERSI = 'rcs-v2';
var CANGKANG = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(CANGKANG); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Hanya file cangkang (domain sendiri). Permintaan ke Google tidak disentuh.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var salin = r.clone();
      caches.open(VERSI).then(function (c) { c.put(e.request, salin); });
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
