/* Book'd service worker — offline app shell */
const CACHE = 'bookd-v39';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* cache-first for the app shell; live-data hosts (Firestore sync, maps, places) always hit the network untouched */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('googleapis.com') || url.includes('firestore') || url.includes('nominatim')
      || url.includes('overpass') || url.includes('photon.komoot') || url.includes('openstreetmap.org')) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit ||
      fetch(e.request).then(res => {
        if (res.ok && (url.startsWith(self.location.origin) || url.includes('fonts.g') || url.includes('gstatic.com/firebasejs'))) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});

/* push notifications — display what the cloud sends, open the app on tap */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (err) {}
  const n = d.notification || (d.data || {});
  e.waitUntil(self.registration.showNotification(n.title || "Book'd ♥", {
    body: n.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: (d.fcmOptions && d.fcmOptions.link) || './'
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data || './'));
});
