const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/db.js',
  '/manifest.webmanifest',
  '/style.css',
];

self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Your files were pre-cached');
        cache.addAll(FILES_TO_CACHE);
      })
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
  
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log('Removing old cache data', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  ); 
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return cache.match(event.request);
          });
      })
      .catch(err => console.log(err)) 
    );
    return;
  } 
  
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
    
  );  /*
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  } */
});
