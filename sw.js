const CACHE_NAME = 'acupuncture-tool-v3';
const ASSETS = [
  './',
  './index.html',
  './lib/notes.js',
  './manifest.json',
  './icon.png',
  './hand1.jpg',
  './hand2.jpg',
  './hand3.jpg',
  './foot1.jpg',
  './foot2.jpg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.6/babel.min.js'
];

// 核心程式檔案採 Network-First，避免上線後使用者卡在舊版快取介面
// 注意：使用者私人筆記僅存於 localStorage，Service Worker 不快取任何使用者筆記資料
function isAppShellRequest(request, url) {
  if (request.mode === 'navigate') return true;
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/lib/notes.js') ||
    url.pathname.endsWith('/manifest.json')
  );
}

// 安裝時快取核心檔案並立即接管
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map(asset => cache.add(asset))
      );
    }).then(() => self.skipWaiting())
  );
});

// 啟動時清除舊版快取（如 acupuncture-tool-v2）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截請求：App Shell 採 Network-First（離線回退快取），靜態圖檔與 CDN 採 Cache-First
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) return;

  if (isAppShellRequest(e.request, url)) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});