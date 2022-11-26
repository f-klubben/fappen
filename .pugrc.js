const readFileSync = require("fs").readFileSync;

module.exports = {
    locals: {
        app_name: "F-Appen",
        manifest: require('./manifest.json'),
        songs: require("./pages/songbook/songs.json"),
        navigation: {
            Frontpage: "/pages/index.pug",
            Stregsystem: "/pages/stregsystem.pug",
            Songbook: "/pages/songbook/index.pug",
            Links: "/pages/links.pug",
            Offline: "/pages/offline.pug"
        },
        links: {
            Slack: "https://fklubben.slack.com",
            Discord: "https://discord.gg/6DBvANjs3g",
            Facebook: "https://www.facebook.com/fklub",
            Github: "https://github.com/f-klubben",
            Fiki: "https://fklub.dk",
            Stregsystem: "https://stregsystem.fklub.dk"

        },
        disable_worker: process.env.disable_worker === "true" || true,
    }
};