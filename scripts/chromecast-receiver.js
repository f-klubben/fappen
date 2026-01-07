// http://127.0.0.1:1234/10foot.html?cast=true

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('cast') === 'true') {
    // Load Cast receiver library
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js';
    document.head.appendChild(script);

    script.onload = () => {
        // Load Cast receiver code
        const context = cast.framework.CastReceiverContext.getInstance();
        context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
        const playerManager = context.getPlayerManager();

        context.start();
    }
}
