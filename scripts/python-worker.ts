/// <reference lib="WebWorker" />
/// <reference types="../node_modules/pyodide/pyodide" />

import {PyodideInterface} from "pyodide";

export type {};
declare const self: ServiceWorkerGlobalScope;

declare function loadPyodide(): Promise<PyodideInterface>;

importScripts("https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js");

let pyodide = loadPyodide()
    .then(async pyodide => {
        await pyodide.loadPackage('micropip');
        await pyodide.runPython('import micropip')
        // Signal that the worker is ready
        postMessage('ready');
        return pyodide;
    });

self.onmessage = async (event) => {
    const py = await pyodide;

    const { id, type} = event.data;

    try {
        if (type === 'run') {
            const {payload} = event.data;
            await py.loadPackagesFromImports(payload);
            let results = await py.runPythonAsync(payload);
            postMessage({ results, id });
        } else if (type === 'install') {
            const {payload} = event.data;
            console.info(`[python-worker] Installing ${payload}`);
            const micropip = py.pyimport('micropip');
            await micropip.install(payload);
            postMessage({results: 'ok', id})
        } else if (type === 'load') {
            const {name, url} = event.data;
            console.info(`[python-worker] Loading ${url} at /${name}`);
            const file = await fetch(url);
            const buffer = await file.arrayBuffer();

            py.FS.writeFile(`/${name}`, new DataView(buffer));
            postMessage({results: 'ok', id})
        }
    }catch (error) {
        console.error(`[python-worker] <${type}> error encountered:`);
        console.error(error);
        postMessage({ error: error.message, id });
    }

};


