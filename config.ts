import dev_config from "./config.dev"

export const is_production = process.env.NODE_ENV === 'production';

let config = !is_production ?
    dev_config
    : {
        base_api_url: "https://stregsystem.fklub.dk/api",
        default_room: 10,
    };

export default config;
