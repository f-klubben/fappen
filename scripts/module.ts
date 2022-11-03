/**
 * Modules describe page sections that need to loaded dynamically at runtime.
 * They are registered by calling the `FaModule.registerModule` function.
 * The module is then available for use with the `<fa-module>` component.
 */

/**
 * Class describing the `<fa-module>` element.
 * This element is used to load a module dynamically at runtime.
 * 
 * Modules are registered by calling the `FaModule.registerModule` function,
 * in the index.ts file before the FaModule element is registered.
 */
export class FaModule extends HTMLElement {
    static module_registry = {};
    static register_module(name: string, init: (module: FaModule) => void) {
        if (typeof this.module_registry[name] !== "undefined") {
            throw new Error(`Module by name ${name} has already been registered.`);
        }

        this.module_registry[name] = init;
    }

    constructor() {
        super();

        const module_name = this.getAttribute("name");
        if (module_name == null) {
            throw new Error("Missing required attribute 'name' on <fa-module> element.");
        }

        const module_init = FaModule.module_registry[module_name];
        if (module_init == null) {
            throw new Error(`Module '${module_name}' is not registered.`);
        }
        
        module_init(this);

    }
}
