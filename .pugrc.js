const readFileSync = require("fs").readFileSync;

module.exports = {
    locals: {
        app_name: "F-Appen",
        manifest: JSON.parse(readFileSync("./manifest.json", "utf-8")),
        navigation: {
            Frontpage: "./index.pug",
            Stregsystem: "./stregsystem.pug",
            Links: "./links.pug"
        },
        links: {
            Slack: "https://fklubben.slack.com",
            Discord: "https://discord.gg/6DBvANjs3g",
            Facebook: "https://www.facebook.com/fklub",
            Github: "https://github.com/f-klubben",
            Fiki: "https://fklub.dk",
            Stregsystem: "https://stregsystem.fklub.dk"

        }
    }
};