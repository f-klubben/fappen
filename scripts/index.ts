
(async () => {
    if ("serviceWorker" in navigator) {
        let worker = new URL("service-worker.ts", import.meta.url)
        navigator.serviceWorker
            .register(worker, { scope: "/" })
            .then(function () {
                console.log("Service Worker Registered");
            });
    }
})()