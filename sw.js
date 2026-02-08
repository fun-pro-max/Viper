const CACHE_NAME = 'viper-v6';
const ASSETS = [
    './', './index.html', './style.css', './app.js', './icon.jpg', './manifest.json',
    './services/guardian.js', './services/networkTest.js', './services/optimizer.js',
    './services/dnsManager.js', './utils/helpers.js'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    )));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});