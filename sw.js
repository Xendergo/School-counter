self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('video-store').then(function (cache) {
      return cache.addAll([
        './',
        './Icon.png',
        './index.html',
        './p5.dom.js',
        './p5.js',
        './sketch.js',
        './updater.js',
      ]);
    })
  );
});

self.addEventListener('fetch', function (e) {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});

// Borrowed from MDN's example