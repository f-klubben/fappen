const readFileSync = require("fs").readFileSync;

module.exports = {
    locals: {
        app_name: "F-Appen",
        manifest: JSON.parse(readFileSync("./manifest.json", "utf-8")),
        songs: JSON.parse(readFileSync("./pages/songbook/songs.json", "utf-8")),
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