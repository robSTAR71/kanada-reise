const CACHE = 'kanada-trip-v1';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './js/data.js',
  './js/ui.js',
  './js/countdown.js',
  './js/pdfviewer.js',
  './docs/flug-wien-montreal.pdf',
  './docs/mietwagen-adac.pdf',
  './docs/hotel-montreal.pdf',
  './docs/hotel-quebec.pdf',
  './docs/hotel-woodstock.pdf',
  './docs/hotel-pinecone.pdf',
  './docs/hotel-cornwall.pdf',
  './docs/hotel-baddeck.pdf',
  './docs/hotel-halifax.pdf',
  './docs/eta-robert.pdf',
  './docs/eta-edith.pdf',
  './docs/eta-pia.pdf',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
