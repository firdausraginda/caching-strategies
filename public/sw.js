var CACHE_STATIC_NAME = 'static-v7'
var CACHE_DYNAMIC_NAME = 'dynamic-v2'

self.addEventListener('install', function (event) {
    console.log('[Service Worker] installing service worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME) //if cache already exist it will open it, if cache doesn't exist yet then it will create it.
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ])
            })
    )
})

function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
        .then(function (cache) {
            return cache.keys()
                .then(function (keys) {
                    if (keys.length >= maxItems) {
                        cache.delete(keys[0])
                            .then(trimCache(cacheName, maxItems))
                    }
                })
        })

}

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] activating service worker ...', event);
    event.waitUntil(
        caches.keys() //key are the name of caches
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) { //Promise.all takes an array of promises and waits for all of them to finish, so that we only return from this
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key)
                    }
                }))
            })
    )
    return self.clients.claim()
    // self.clients.claim() to ensure that service workers are loaded or are activated correctly. Moreover it make SW more robust.
})

// cache then network + dynamic caching
self.addEventListener('fetch', function (event) {
    // cache then network section
    var url = 'https://pwagram-877dc.firebaseio.com/posts'

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                    return fetch(event.request)
                        .then(function (res) {
                            // trimCache(CACHE_DYNAMIC_NAME, 4)
                            cache.put(event.request, res.clone())
                            return res
                        })
                })
        )
    } else {
        // cache with network fallback section
        event.respondWith(
            caches.match(event.request) //match based on the request, because request is the key
                .then(function (response) {
                    if (response) {
                        return response
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC_NAME) // ngereturn di sini biar dalam sekali request, datanya tidak hanya di store ke cache aja, tapi jga di return
                                    .then(function (cache) {
                                        // trimCache(CACHE_DYNAMIC_NAME, 4)
                                        cache.put(event.request.url, res.clone())
                                        //res hanya satu, kalau res di store ke cache maka tidak bisa di return, jadi di clone dulu biar ada 2 biar bisa di return
                                        return res
                                    })
                            })
                            .catch(function (err) {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        if (event.request.headers.get('accept').includes('text/html')) { //cek apakah data yg diterima bentuknya html, kalau iya, return offline.html
                                            return cache.match('/offline.html')
                                        }
                                    })
                            })
                    }
                })
        )
    }
})

// cache with network fallback + dynamic chacing
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request) //match based on the request, because request is the key
//             .then(function (response) {
//                 if (response) {
//                     return response
//                 } else {
//                     return fetch(event.request)
//                         .then(function (res) {
//                             return caches.open(CACHE_DYNAMIC_NAME) // ngereturn di sini biar dalam sekali request, datanya tidak hanya di store ke cache aja, tapi jga di return
//                                 .then(function (cache) {
//                                     cache.put(event.request.url, res.clone())
//                                     //res hanya satu, kalau res di store ke cache maka tidak bisa di return, jadi di clone dulu biar ada 2 biar bisa di return
//                                     return res
//                                 })
//                         })
//                         .catch(function (err) {
//                             return caches.open(CACHE_STATIC_NAME)
//                                 .then(function (cache) {
//                                     return cache.match('/offline.html')
//                                 })
//                         })
//                 }
//             })
//     )
// })

// network with cache fallback + dynamic caching
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//             .then(function (res) {
//                 return caches.open(CACHE_DYNAMIC_NAME) // ngereturn di sini biar dalam sekali request, datanya tidak hanya di store ke cache aja, tapi jga di return
//                     .then(function (cache) {
//                         cache.put(event.request.url, res.clone()) //res hanya satu, kalau res di store ke cache maka tidak bisa di return, jadi di clone dulu biar ada 2 biar bisa di return
//                         return res
//                     })
//             })
//             .catch(function (err) {
//                 return caches.match(event.request)
//             })
//     )
// })

// cache only strategy
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request)
//     )
// })

// network only strategy
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//     )
// })

// self.addEventListener('sync', function (event) {
//     console.log('[Service Worker] Background Sync', event);
//     if (event.tag === 'sync-new-posts') {
//         console.log('[Service Worker] Syncing new posts');
//         event.waitUntil(
//             getData()
//                 .then(function (data) {
//                     for (var dt of data) {
//                         fetch('https://pwagram-877dc.firebaseio.com/posts.json', {
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'Accept': 'application/json'
//                             },
//                             body: JSON.stringify({
//                                 id: dt.id,
//                                 title: dt.title,
//                                 location: dt.location,
//                                 image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-877dc.appspot.com/o/8b26e399-61ea-49f2-8cc3-b5ba96572037_43.jpeg?alt=media&token=7e711692-c4e7-48e5-8594-2a63fe89e620'
//                             })
//                         })
//                             .then(function (res) {
//                                 console.log('send data', res);
//                                 if (res.ok) {
//                                     localStorage.removeItem('sync-post')
//                                 }
//                             })
//                             .catch(function (err) {
//                                 console.log('error', err);
//                             })
//                     }
//                 })
//         )
//     }
// })