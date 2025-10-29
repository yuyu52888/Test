const CACHE_NAME = 'japanese-vocab-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './data/nouns.js',
  './data/verbs.js',
  './data/i_adjectives.js',
  './data/na_adjectives.js',
  './data/adverbs.js',
  './data/onomatopoeia.js',
  './data/keigo.js',
  './data/grammar.js'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker 安裝中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('快取已開啟');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('所有資源已快取');
        return self.skipWaiting();
      })
  );
});

// 啟用 Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker 啟用中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 已啟用');
      return self.clients.claim();
    })
  );
});

// 攔截請求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果有快取版本，返回快取版本
        if (response) {
          return response;
        }

        // 否則從網路請求
        return fetch(event.request).then(response => {
          // 檢查是否為有效回應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 複製回應
          const responseToCache = response.clone();

          // 將新資源加入快取
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // 當離線且沒有快取時，可以返回自定義離線頁面
        return caches.match('./index.html');
      })
  );
});