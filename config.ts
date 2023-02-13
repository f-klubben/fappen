export const is_production = process.env.NODE_ENV === 'production';

function read_feature_list() {
    const states = {
        cli_backend: false,
    };

    process.env.FA_FEATURES
        .split(';')
        .map(value => {
            const mode = value.charAt(0);
            if (mode !== '-' && mode !== '+')
                return null;
            states[value.slice(1)] = mode === '+';
        });

    return states;
}

let config =  {
    // This uses a cors-proxy (npm run cors-proxy) to add CORS headers
    // to stregsystem requests.
    base_api_url: process.env.FA_API_URL || "https://localhost:8080/http://localhost:8000/api",
    events_api_url: process.env.FA_EVENTS_API_URL || "https://www.googleapis.com/calendar/v3/calendars/",
    events_id: process.env.FA_EVENTS_ID || "fke9k8sbuqttoif5ff7ccbb0bc@group.calendar.google.com",
    events_api_key: process.env.FA_EVENTS_API_KEY || "AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs",
    events_base_url: process.env.FA_EVENTS_BASE_URL || "https://calendar.google.com/calendar/u/0/r?cid=",
    default_room: parseInt(process.env.FA_DEFAULT_ROOM) || 1,
    features: read_feature_list(),
};

export default config;
