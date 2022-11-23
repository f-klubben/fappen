export default {
    // This uses a cors-proxy (npm run cors-proxy) to add CORS headers
    // to stregsystem requests.
    base_api_url: process.env.FA_DEV_API_URL || "http://localhost:8080/http://localhost:8000/api",
    default_room: parseInt(process.env.FA_DEV_DEFAULT_ROOM) || 1,
    features: {
        cli_backend: true,
    }
};