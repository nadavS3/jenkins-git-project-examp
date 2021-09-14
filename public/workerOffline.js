const CACHE_NAME = "dgo";

const STATIC_DATA = [
    '/logos/new_logo.png',
    '/images/png_phone.png',
    '/images/animations/OvalsIntroduction.svg',
    '/images/backgrounds/IntroductionNoBubbles.svg',
    '/logos/digital-orientation-logo.png',
    '/images/animations/OrganizationBubble1.svg',
    '/images/backgrounds/organizationFormNoBubbles.svg',
    '/images/animations/OrganizationBubble2.png',
    '/images/animations/PersonalDataOval1.png',
    '/images/backgrounds/PersonalDataNoBubbles.svg',
    '/images/backgrounds/SectorForm.svg',
    '/images/backgrounds/Instructions_no_leafs.svg',

    '/logos/phone_logo.png',
    '/images/animations/OrganizationBubble2.svg',
    '/images/mobile/plant.svg',
    '/images/mobile/woman.svg',
    '/images/mobile/twoPeople.svg',
    '/images/mobile/standingWoman.svg',
    '/images/mobile/sittignWindowWoman.svg',
];
self.addEventListener('install', e => {
    //todo: when  offline, check in mobile worker if dgo-browser cache exists and if so do not proceed(if browser storage exists thats mean that when we had internet it was on browser and vice versa)
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_DATA);
            })
            .then(() =>self.skipWaiting())
            .catch(() => self.skipWaiting())
    );
});

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