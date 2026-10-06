// 4ayka Studio — offline-first service worker.
// Scope: the site root (registered from /.js), covering /, /blog/ and /games/.
// Strategy: network-first for page navigations (GitHub Pages deploys stay
// fresh), stale-while-revalidate for every other same-origin GET. Cross-origin
// requests (fonts, GitHub API, raw VERSION files) are never touched.
var CACHE = '4ayka-v2';
var PRECACHE = [
    'index.html',
    'style.css',
    'site.js',
    'script.js',
    'manifest.webmanifest',
    'img/og.png',
    'img/icon-192.png',
    'img/icon-512.png'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (cache) {
            return cache.addAll(PRECACHE.map(function (path) {
                return new Request(path, { cache: 'reload' });
            }));
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE; })
                    .map(function (k) { return caches.delete(k); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== location.origin) return;

    if (req.mode === 'navigate') {
        e.respondWith(
            fetch(req).then(function (res) {
                if (res.ok) {
                    var copy = res.clone();
                    caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
                }
                return res;
            }).catch(function () {
                return caches.match(req).then(function (hit) {
                    return hit || caches.match('index.html');
                });
            })
        );
        return;
    }

    e.respondWith(
        caches.match(req).then(function (cached) {
            var network = fetch(req).then(function (res) {
                if (res.ok) {
                    var copy = res.clone();
                    caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
                }
                return res;
            }).catch(function (reason) {
                if (cached) return cached;
                throw reason;
            });
            return cached || network;
        })
    );
});