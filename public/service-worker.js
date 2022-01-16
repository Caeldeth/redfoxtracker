const APP_PREFIX = 'redfoxTracker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION
const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icon-512x512.png',
    './icon-384x384.png',
    './icon-192x192.png',
    './icon-152x152.png',
    './icon-144x144.png',
    './icon-128x128.png',
    './icon-96x96.png',
    './icon-72x72.png'
]

// cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log(`installing cache : ${CACHE_NAME}`);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

// delete outdated cache
self.addEventListener('activate', function(e) {
    e.waitUntil(
        cache.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter (function (key) {
                return key.indexOf(APP_PREFIX);
            })
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1 ) {
                    console.log('deleting cache:' + keyList[i] );
                    return caches.delete(keyList[i]);
                }
            }));
        })
    );
});

// respond with cache resources
self.addEventListener('fetch', function (e) {
    console.log(`fetch request: ${e.request.url}`);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log(`responding with cache: ${e.request.url}`);
                return request
            } else {
                console.log(`file is not cached, fetching:  ${e.request.url}`);
                return fetch(e.request)
            }
        })
    )
});