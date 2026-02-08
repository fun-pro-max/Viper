const CACHE_NAME = 'viper-v4';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './icon.jpg',
    './manifest.json',
    './services/guardian.js',
    './services/networkTest.js',
    './services/optimizer.js',
    './services/dnsManager.js',
    './utils/helpers.js'
];

// Install Service Worker and cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('VIPER: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch assets from cache first, then network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});