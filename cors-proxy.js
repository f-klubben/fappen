// Listen on a specific host via the HOST environment variable
const host = process.env.CORS_PROXY_HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
const port = process.env.CORS_PROXY_PORT || 8080;

const cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    removeHeaders: ['cookie', 'cookie2'],
    httpProxyOptions: {
        // We need this when proxying to stregsystem.fklub.dk
        secure: false
    }
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});