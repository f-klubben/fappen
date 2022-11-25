import worker_url from 'url:/scripts/python-worker';
import {identity, Send} from "./common";

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
 * Throws an error if the python worker has not been initialised.
 * @param call_site
 */
const ensure_init = (call_site: Function) => {
    if (init_promise == null)
        throw new Error(`[python_interop] a call to init is required before calling ${call_site.name}`);
}

/**
 * Loads the python worker and waits for it to be ready.
 */
export const init = (): Promise<void> => {
    if (init_promise != null)
        return init_promise;

    worker = new Worker(worker_url);

    init_promise = new Promise(resolve => {
        const _resolve = resolve;

        worker.addEventListener('message', () => {
            worker.addEventListener('message', msg_handler);
            _resolve();
        }, {once: true})
    })
    return init_promise;
}

/**
 * Counter used to assign id for a correspondence.
 */
let run_id_counter = 0;

type CommandType = "run" | "install" | "load" | "installJsMod" | "return";

/**
 * Handles incoming messages from the python worker thread.
 * @param event
 */
const msg_handler = async (event) => {
    const {id, type, ...data} = event.data;

    // Handles python -> js calls
    if (type === 'call') {
        const {module, method, args} = event.data
        const response = {type: 'return', id, success: false, value: null};

        const mod = py_module_list[module];
        if (mod == null || mod[__py_mod_methods] == null) {
            console.error(`[python_interop] invalid call for non-existent module '${module}'`);
            response.value = new Error(`module ${module} not found`);
        } else if (!mod[__py_mod_methods][method]) {
            console.error(`[python_interop] invalid call to non-existent method '${method}' in module '${module}'`);
            response.value = new Error(`method ${method} not found in ${module}`);
        } else {
            try {
                response.value = await mod[__py_mod_methods][method](args);
                response.success = true;
            } catch (e) {
                response.value = e;
            }
        }

        postMessage(response);
        return;
    }

    const [resolve, reject] = msg_resolvers[id];
    delete msg_resolvers[id];

    if (data.error) {
        reject(data.error);
    } else {
        resolve(data);
    }
}

/**
 * Sends a command to the python worker thread. Returns a promise that will
 * be resolved when a response is received.
 * @param type The command that is to run
 * @param params Any parameters that should be sent along
 */
const send_command = (type: CommandType, params: any): Promise<any> => {
    ensure_init(send_command);
    const id = (run_id_counter = (run_id_counter + 1) % 1000000);
    return new Promise((resolve, reject) => {
        msg_resolvers[id] = [resolve, reject];

        params.id = id;
        params.type = type;

        worker.postMessage(params);

        delete params.id;
        delete params.type;
    })
}

/**
 * Sends code to the python webworker and returns
 * a promise for the result from the python code.
 * @param code
 */
export const run = (code: string): Promise<any> =>
    send_command('run', {payload: code});

/**
 * Install a python package into the runtime.
 * See pyodide docs for more info on supported package reference formats.
 * |> Note: installing packages from anything that isn't PyPi seems to broken as of 0.21.3.
 * @param package_name
 */
export const install = (package_name: string): Promise<void> =>
    send_command('install', {payload: package_name});

/**
 * Load a file located at the given url into the in memory file system
 * of the python runtime. Files are placed relative to `/`.
 * @param filename The filename where the file will be saved.
 * @param url The url that the file should be fetched from.
 */
export const load_file = (filename: string, url: string): Promise<void> =>
    send_command('run', {name: filename, url});


export const install_js_module = async (module: PyModule) => {
    // We don't allow duplicate registration.
    if (module[__py_mod_reg_status])
        return;

    module[__py_mod_reg_status] = true;
    const res = await send_command('installJsMod', {
        name: module.py_module_name,
        methods: Object.keys(module[__py_mod_methods]),
    })

    module[__py_mod_reg_status] = res.status;
};


/**
 * Patches http related libraries using pyodide-http.
 * This allows for use of the urllib and request packages.
 */
export const patch_http = async () => {
    ensure_init(patch_http);
    if (flags['http'] != null)
        return;
    flags['http'] = true;

    await install('requests')
    await install('pyodide-http')

    await run(`
    import pyodide_http
    pyodide_http.patch_all()
    `);
}

/*
    Symbols used to store python module metadata
 */

const __py_mod_methods = Symbol();
const __py_mod_reg_status = Symbol();

const py_module_list: {[module: string]: PyModule} = {};

/**
 * Represents a type that can be registered as a python module.
 * Types that can be registered as python modules can be created by using
 * the [[pyModule]] and [[pyMethod]] decorators.
 */
export interface PyModule {
    get py_module_name(): string;
}

const module_decorator =
    (module_name: string) => <T extends { new(...args: any[]): {} }>(constructor: T): typeof constructor & PyModule => {
        if (py_module_list[module_name] != null)
            throw new Error(`Python module with name ${module_name} already exists.`)

        class Module extends constructor {
            static [__py_mod_methods] = constructor[__py_mod_methods];
            static [__py_mod_reg_status] = false;

            static get py_module_name(): string {
                return module_name;
            }
        }

        py_module_list[module_name] = Module;

        return Module;
    };

interface PyMethodOptions {
    /**
     * An alternative name that will be exposed in python
     * instead of the name used in Javascript.
     */
    alias?: string,

    /**
     * A function that is used to convert the methods return value
     * into something that can be sent to the python worker.
     * @param v The value returned by the method.
     */
    serializer?: (v: any) => Send,
}

const method_decorator =
    (options: PyMethodOptions = {}) => (target: Function, propertyKey: string, _: PropertyDescriptor) => {
        // If the target is not a function that means the target method
        // is not static. Since only support modules all python functions
        // must be static.
        if (!(target instanceof Function))
            throw new Error("Cannot use @pyFn on non static class methods");

        if (target[__py_mod_methods] == null)
            target[__py_mod_methods] = [];


        const method = target[propertyKey];
        if (!(method instanceof Function))
            throw new Error("Application of pyMethod decorator on non function member property.");

        const py_name = options.alias || propertyKey;
        if (target[__py_mod_methods][py_name] != null)
            throw new Error(`Attempt to register duplicate python method ${py_name} in module ${target.name}`);
        target[__py_mod_methods][py_name] = [method, options.serializer || identity];
    };

/**
 * Marks a class as a python module, allowing for functions marked
 */
export const pyModule = module_decorator;

/**
 * Marks a method for use from python.
 * This can only be used on class methods,
 * if the class is decorated with [[pyModule]].
 */
export const pyFn = method_decorator;
