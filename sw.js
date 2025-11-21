
const CACHE_NAME = 'pipeliner-v1';
const urlsToCache = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. Bypass Cache for Google Auth & APIs to avoid CORS/Auth issues
  if (url.hostname.includes('google') || 
      url.hostname.includes('googleapis') || 
      url.hostname.includes('gstatic')) {
    return;
  }

  // 2. Bypass Cache for InstantDB
  if (url.hostname.includes('instantdb')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
