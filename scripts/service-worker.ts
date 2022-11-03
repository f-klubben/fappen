// / <reference lib="WebWorker" />
// export empty type because of tsc --isolatedModules flag
// TODO: add a /offline page in case we need it
export type {};
declare const self: ServiceWorkerGlobalScope;

const cacheName = "::F-App-ServiceWorker";
const version = "v0.0.2";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(version + cacheName).then((cache) => {
            return cache.addAll(["/", "/offline", ""]);
        }),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            // Remove caches whose name is no longer valid
            // @ts-ignore
            return Promise.all(
                keys
                    .filter((key) => {
                        return key.indexOf(version) !== 0;
                    })
                    .map((key) => {
                        return caches.delete(key);
                    }),
            );
        }),
    );
});

self.addEventListener("fetch", function (event) {
    const {request} = event;

    // Always fetch non-GET requests from the network
    if (request.method !== "GET") {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match("/offline");
            }) as Promise<Response>,
        );
        return;
    }

    // For HTML requests, try the network first, fall back to the cache,
    // finally the offline page
    if (
        request.headers.get("Accept")?.indexOf("text/html") !== -1
        && request.url.startsWith(this.origin)
    ) {
        // The request is text/html, so respond by caching the
        // item or showing the /offline page
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Stash a copy of this page in the cache
                    const copy = response.clone();
                    void caches.open(version + cacheName).then((cache) => {
                        void cache.put(request, copy);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((response) => {
                        // return the cache response or the /offline page.
                        return response || caches.match("/offline");
                    });
                }) as Promise<Response>,
        );
        return;
    }

    // For non-HTML requests, look in the cache first, fall back to the network
    if (
        request.headers.get("Accept")?.indexOf("text/plain") === -1
        && request.url.startsWith(this.origin)
    ) {
        event.respondWith(
            caches.match(request).then((response) => {
                return (
                    response
                    || fetch(request)
                        .then((response) => {
                            const copy = response.clone();

                            if (
                                copy.headers.get("Content-Type")?.indexOf("text/plain") === -1
                            ) {
                                void caches.open(version + cacheName).then((cache) => {
                                    void cache.put(request, copy);
                                });
                            }

                            return response;
                        })
                        .catch(() => {
                            // you can return an image placeholder here with
                            if (request.headers.get("Accept")?.indexOf("image") !== -1) {
                            }
                        })
                );
            }) as Promise<Response>,
        );
        return;
    }
});
