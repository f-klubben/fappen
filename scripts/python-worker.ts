/// <reference lib="WebWorker" />
/// <reference types="../node_modules/pyodide/pyodide" />

import {PyodideInterface} from "pyodide";

export type {};
declare const self: ServiceWorkerGlobalScope;

declare function loadPyodide(): Promise<PyodideInterface>;

importScripts("https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js");

const dont_respond = Symbol();

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

    const {id, type} = event.data;

    try {
        const response = {id, type: 'response'};
        const result = await message_handlers[type](py, event.data, response);

        if (result != dont_respond)
            postMessage(response);
    } catch (error) {
        console.error(`[python-worker] <${type}> error encountered:`);
        console.error(error);
        postMessage({error: error.message, id});
    }

};

let call_id = 0;

const proxy_call_resolvers = {};

/**
 * Requests the main thread to call a function from a python module.
 * @param module
 * @param method
 * @param args
 */
const proxy_call = (module, method, ...args) => {
    let id = (call_id = (call_id + 1) % 1000000)
    return new Promise(((resolve, reject) => {
        proxy_call_resolvers[id] = [resolve, reject];
        postMessage({
            type: 'call',
            id,
            module,
            method,
            args,
        });
    }))
};

const message_handlers: { [key: string]: (py: PyodideInterface, data: any, output: any) => Promise<void|Symbol> } =
    {
        'run': async (py, {payload}, out) => {
            await py.loadPackagesFromImports(payload);
            out.results = await py.runPythonAsync(payload);
        },

        'install': async (py, {payload}, out) => {
            console.info(`[python-worker] Installing ${payload}`);
            const micropip = py.pyimport('micropip');
            await micropip.install(payload);
            out.results = 'ok';
        },

        'load': async (py, {name, url}, out) => {
            console.info(`[python-worker] Loading ${url} at /${name}`);
            const file = await fetch(url);
            const buffer = await file.arrayBuffer();

            py.FS.writeFile(`/${name}`, new DataView(buffer));
            out.results = 'ok';
        },

        'installJsMod': async (py, i, out) => {
            const {name, methods} = i;
            const module = {};
            for (const method of methods) {
                module[method] = proxy_call.bind(null, name, method);
            }

            py.registerJsModule(name, module);
            out.success = true;
        },

        'return': async (py, {id, success, value}, _) => {
            if (proxy_call_resolvers[id] == null) {
                console.error(`[python-worker] invalid return id ${id}`);
                return;
            }

            const [resolve, reject] = proxy_call_resolvers[id];
            delete proxy_call_resolvers[id];

            if (success) {
                resolve(value);
            } else {
                reject(value);
            }

            return dont_respond;
        }

    };


