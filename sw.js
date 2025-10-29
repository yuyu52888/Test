const CACHE_NAME = 'japanese-vocab-v1.0.0'; // 記得更新版本號！
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
  console.log('🔄 安裝新版本 Service Worker...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 快取新資源...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ 新資源快取完成');
        return self.skipWaiting(); // 跳過等待，立即啟用
      })
  );
});

// 啟用 Service Worker
self.addEventListener('activate', event => {
  console.log('🎯 啟用新版本 Service Worker...', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 刪除舊版本快取
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ 新版本已啟用');
      return self.clients.claim(); // 立即控制所有頁面
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
        // 當離線且沒有快取時，返回首頁
        return caches.match('./index.html');
      })
  );
});

// 監聽來自頁面的消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🎯 收到跳過等待指令');
    self.skipWaiting();
  }
});