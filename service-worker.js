const CACHE_NAME = 'sg-telecom-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js'
];

// Install — সব ফাইল cache এ রাখো
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — পুরনো cache মুছো
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — আগে network থেকে নাও, না পেলে cache থেকে দাও
self.addEventListener('fetch', event => {
  // Firebase requests cache করব না
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebaseapp.com') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Network থেকে পেলে cache আপডেট করো
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network না থাকলে cache থেকে দাও
        return caches.match(event.request);
      })
  );
});
