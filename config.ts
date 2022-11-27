import dev_config from "./config.dev";

export const is_production = process.env.NODE_ENV === 'production';

let config = !is_production ?
    dev_config
    : {
        base_api_url: "https://stregsystem.fklub.dk/api",
        default_room: 10,
        events_api_url: "https://www.googleapis.com/calendar/v3/calendars/",
        events_id: "fke9k8sbuqttoif5ff7ccbb0bc@group.calendar.google.com",
        events_api_key: "AIzaSyCR3-ptjHE-_douJsn8o20oRwkxt-zHStY",
        events_base_url: "https://calendar.google.com/calendar/u/0/r?cid=",
    };

export default config;
