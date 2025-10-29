const CACHE_NAME = 'japanese-vocab-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // 移除圖標路徑，使用線上圖標
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});