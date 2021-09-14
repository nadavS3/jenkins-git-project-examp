//*name of the storage in the cacheStorage
const CACHE_NAME = "dgo";
//* data that will be saved on install
const STATIC_DATA = [
    '/logos/phone_logo.png',
    '/logos/digital-orientation-logo.png',
    '/images/animations/OrganizationBubble2.svg',
    '/images/mobile/plant.svg',
    '/images/mobile/woman.svg',
    '/images/mobile/twoPeople.svg',
    '/images/mobile/standingWoman.svg',
    '/images/mobile/sittignWindowWoman.svg',
    '/images/backgrounds/IntroductionNoBubbles.svg'
];

//* event will fire only when we install the service worker!happens only after the first time its installed successfully on the page and wont fire anymore until unregistered
self.addEventListener('install', e => {
    //todo: when  offline, check in mobile worker if dgo-browser cache exists and if so do not proceed(if browser storage exists thats mean that when we had internet it was on browser and vice versa)
    //will wait until open a cache storage and then add all the STATIC_DATA arr to that cache and skip the waiting
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_DATA);
            })
            .then(() =>self.skipWaiting())
            .catch(() => self.skipWaiting())
    );
});

//if service worker activated, check if we have different cache then the string in CACHE_NAME and deletes it
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(name => {
                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }
                    })
                )
            })
            .then((a) => { return self.clients.claim(); })
    );

});

function fetchAndSave(request) {
    return fetch(request)
        .then(res => {
            const resClone = res.clone();
            caches.open(CACHE_NAME)
                .then(cache => cache.put(request.url, resClone));
            return res;
        });
}
self.addEventListener('fetch', e => {
    //if not a get request or not starts with http we dont touch the request
    if (e.request.method !== "GET" || e.request.url.indexOf("http") !== 0 ||e.request.url.includes("audio")||e.request.url.includes("/ads/ga-audiences")||e.request.url.includes("hot-update")||e.request.url.includes("gtag")) {
        return;
    }

    const inStaticData = STATIC_DATA.some(data => e.request.url.includes(data)) || /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|mp3|mp4|webm)$/i.test(e.request.url);

    if (inStaticData) {
        e.respondWith(
            caches.match(e.request.url)
                .then(res => res ? res : fetchAndSave(e.request))
        );
        // console.log("static", e.request.url)
    } else {
        e.respondWith(
            fetchAndSave(e.request)
                .catch(err => caches.match(e.request.url))
        );
        // console.log("not static", e.request.url)
    }
});

//https://youtu.be/ksXwaWHCW6k