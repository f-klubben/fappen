import {FaModule} from "./module";
import config, {is_production} from "../config";
import {init as init_stregsystem} from "./stregsystem";

(async () => {
    console.log(`Running in ${is_production ? "production" : "development"} mode.`);
    if (!is_production) {
        console.dir(config);
    }

    await init_stregsystem();

    customElements.define("fa-module", FaModule);
})()
