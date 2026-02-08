const CACHE_NAME = 'viper-jio-v9';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json', './services/guardian.js', './services/networkTest.js', './services/dnsManager.js', './utils/helpers.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.map(i => i !== CACHE_NAME ? caches.delete(i) : null)))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });