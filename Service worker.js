const CACHE_NAME = 'Savesavvy-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/About.html',
  '/Tips.html',
  '/Task.html',
  '/Home.html',
  '/Home.css',
  '/Task.css',
  '/Home.js',
  '/Task.js',
  '/Service worker.js',
  '/manifest.json',
  '/Background.jpg',
  '/pealpx.jpg',
  '/brand1.png',
  '/logo1.png',
  'https://cdn.jsdelivr.net/npm/chart.js' 
];


// Install the service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(cacheName)
        .then((cache) => {
          // Cache the files
          return cache.addAll(filesToCache);
        })
    );
});

// Activate the service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => {
            return name !== cacheName;
          }).map((name) => {
            return caches.delete(name);
          })
        );
      })
    );
});

// Fetch event listener
self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // Clone the request
          const fetchRequest = event.request.clone();

          // Make the network request
          return fetch(fetchRequest).then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
    );
});