// starLog Service Worker
const CACHE_NAME = 'starlog-v1'
const urlsToCache = [
  '/',
  '/static/favicons/apple-touch-icon.png',
  '/static/favicons/favicon-32x32.png',
  '/static/favicons/favicon-16x16.png',
]

// 安装
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// 激活
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 请求拦截
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})
