export default {
    // This uses a cors-proxy (npm run cors-proxy) to add CORS headers
    // to stregsystem requests.
    base_api_url: process.env.FA_DEV_API_URL || "https://localhost:8080/http://localhost:8000/api",
    events_api_url: process.env.FA_DEV_EVENTS_API_URL || "https://www.googleapis.com/calendar/v3/calendars/",
    events_id: process.env.FA_DEV_EVENTS_ID || "fke9k8sbuqttoif5ff7ccbb0bc@group.calendar.google.com",
    events_api_key: process.env.FA_DEV_EVENTS_API_KEY || "AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs",
    events_base_url: process.env.FA_DEV_EVENTS_BASE_URL || "https://calendar.google.com/calendar/u/0/r?cid=",
    default_room: parseInt(process.env.FA_DEV_DEFAULT_ROOM) || 1,
    features: {
        cli_backend: true,
    }
};