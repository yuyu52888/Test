// sw.js - 改進版本
const CACHE_NAME = 'japanese-vocab-v1.1.0'; // ← 更新版本號
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

self.addEventListener('install', event => {
  console.log('🔄 安裝新版本 Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 快取新資源...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ 新資源快取完成');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🎯 啟用新版本 Service Worker...');
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
      return self.clients.claim();
    })
  );
});

// 新增：檢查更新功能
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});