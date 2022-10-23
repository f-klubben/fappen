let config = process.env.NODE_ENV !== 'production' ?
    (await import("config.dev")).default
    : {
        base_api_url: "https://stregsystem.fklub.dk/api",
        default_room: 10,
    };

export default config;