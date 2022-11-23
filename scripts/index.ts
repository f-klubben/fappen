import config, {is_production} from "../config";
import * as stregsystem from "./stregsystem";
import {AccessStatus} from "./stregsystem";
import * as py_inter from "./util/python_interop";

declare global {
    interface Document {
        disable_worker?: boolean
    }
}

function update_status_indicator(status: AccessStatus) {
    const elements = document.querySelectorAll('.access-status-indicator');

    if (status === AccessStatus.StregsystemUnavailable) {
        elements?.forEach(node => {
            node.classList.add("offline");
            node.classList.remove("online", "partial");
        });
    } else {
        elements?.forEach(node => {
            node.classList.remove("offline", "online", "partial");
            node.classList.add(status === AccessStatus.ApiAvailable ? "online" : "partial");
        });
    }
}

async function event_online() {
    const access_status = await stregsystem.check_access();
    stregsystem.events.access_update.dispatch(access_status);
}

function event_offline() {
    stregsystem.events.access_update.dispatch(AccessStatus.StregsystemUnavailable);
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

/*
    Main function
 */
void (() => {
    if ("serviceWorker" in navigator && !document.disable_worker) {
        const worker = new URL("service-worker.ts", import.meta.url);
        void navigator.serviceWorker
            .register(worker, {scope: "/"})
            .then(() => {
                console.log("Service Worker Registered");
            });
    }
    console.log(`Running in ${is_production ? "production" : "development"} mode.`);
    if (!is_production) {
        console.dir(config);
    }

    // If the cli backend is enabled we initialise the
    // pyodide python runtime.
    if (config.features.cli_backend) {
        void py_inter.init();
    }

    /*
        Navigation sidebar
     */

    document.querySelectorAll('.nav-trigger')
        ?.forEach(node => {
            node.addEventListener('click', toggle_sidebar);
        });

    /*
        Connectivity checks
     */

    window.addEventListener('online', () => void event_online());
    window.addEventListener('offline', event_offline);

    stregsystem.events.access_update.register_handle(update_status_indicator);

    if (navigator.onLine)
        void event_online();
    else
        event_offline();

    /*
        Init modules
     */

    stregsystem.init();
})();
