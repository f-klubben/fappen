import {FaModule} from "./module";
import config, {is_production} from "../config";
import {init as init_stregsystem} from "./stregsystem";
import {registerNavEvents} from "./navbar";

(async () => {
    if ("serviceWorker" in navigator) {
        let worker = new URL("service-worker.ts", import.meta.url)
        navigator.serviceWorker
            .register(worker, { scope: "/" })
            .then(function () {
                console.log("Service Worker Registered");
            });
    }
    console.log(`Running in ${is_production ? "production" : "development"} mode.`);
    if (!is_production) {
        console.dir(config);
    }

    await init_stregsystem();
    registerNavEvents();
    customElements.define("fa-module", FaModule);
})()
