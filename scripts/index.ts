import config, {is_production} from "../config";
import * as stregsystem from "./stregsystem";

(async () => {
    console.log(`Running in ${is_production ? "production" : "development"} mode.`);
    if (!is_production) {
        console.dir(config);
    }

    await stregsystem.init();
})()
