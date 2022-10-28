import config, {is_production} from "../config";
import * as stregsystem from "./stregsystem";

async function event_online() {
    let has_access = await stregsystem.check_access();
    document.querySelectorAll('.access-status-indicator')
        ?.forEach(node => {
            node.classList.remove("offline");
            node.classList.add(has_access ? "online" : "partial");
        })
}

function event_offline() {
    document.querySelectorAll('.access-status-indicator')
        ?.forEach(node => {
            node.classList.remove("online", "partial");
            node.classList.add("offline");
        });
}

function toggle_sidebar() {
    const sidebar = document.getElementById("sidebar-nav");
    if (sidebar == null) {
        console.error('Sidebar not found. Unable to toggle.');
        return;
    }

    if (sidebar.classList.contains('active'))
        sidebar.classList.remove('active');
    else
        sidebar.classList.add('active');
}


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

    /*
        Navigation sidebar
     */

    document.querySelectorAll('.nav-trigger')
        ?.forEach(node => {
            node.addEventListener('click', toggle_sidebar);
        })

    /*
        Connectivity checks
     */

    window.addEventListener('online', event_online);
    window.addEventListener('offline', event_offline);

    if (navigator.onLine)
        event_online();
    else
        event_offline();

    /*
        Init modules
     */

    await stregsystem.init();
})()
