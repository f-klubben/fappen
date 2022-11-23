import worker_url from 'url:/scripts/python-worker';

let worker: Worker;

let init_promise: Promise<void>;

/**
 * Flags for ensuring that one time operations, such as
 * patching various libraries, can't be run multiple times.
 */
const flags = {};

/**
 * Object that maps a symbol to a promise resolve function.
 */
const msg_resolvers = {};

/**
 * Throws an error if pyodide has not been initialised.
 * @param call_site
 */
const ensure_init = (call_site: Function) => {
    if (init_promise == null)
        throw new Error(`[python_interop] a call to init is required before calling ${call_site.name}`);
}

/**
 * Loads the pyodide runtime and imports the micropip package.
 */
export const init = (): Promise<void> => {
    if (init_promise != null)
        return init_promise;

    worker = new Worker(worker_url);

    init_promise = new Promise(resolve => {
        const _resolve = resolve;

        worker.addEventListener('message', () => {
            worker.addEventListener('message', (event) => {
                const { id, ...data } = event.data;
                const {resolve, reject} = msg_resolvers[id];
                delete msg_resolvers[id];
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data);
                }
            });

            _resolve();
        }, {once: true})
    })
    return init_promise;
}

let run_id_counter = 0;

const send_command = (type: "run"|"install"|"load", fields: Object): Promise<any> => {
    ensure_init(send_command);
    const id = run_id_counter++ % 1000000;
    return new Promise((resolve, reject) => {
        msg_resolvers[id] = {resolve, reject};
        const msg = {
            id,
            type,
        };

        for (let key in fields) {
            if (key === 'id' || key === 'type') {
                console.warn('[python_interop] skipping invalid msg key');
                continue;
            }

            msg[key] = fields[key];
        }

        worker.postMessage(msg)
    })
}

/**
 * Sends code to the python webworker and returns
 * a promise for the result from the python code.
 * @param code
 */
export const run = (code: string): Promise<any> =>
    send_command('run', {payload: code});

export const install = (package_name: string): Promise<void> =>
    send_command('install', {payload: package_name});

export const load_file = (filename: string, url: string): Promise<void> =>
    send_command('run', {name: filename, url});

/**
 * Patches http related libraries using pyodide-http.
 * This allows for use of the urllib and request packages.
 */
export const patch_http = async () => {
    ensure_init(patch_http);
    if (flags['http'] != null)
        return;
    flags['http'] = true;

    await install('pyodide-http')
    await run(`
    await micropip.install('pyodide-http')
    
    import pyodide_http
    pyodide_http.patch_all()
    `);
}

