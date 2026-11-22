const readFileSync = require("fs").readFileSync;

module.exports = {
    locals: {
        app_name: "Fappen",
        manifest: require('./manifest.json'),
        navigation: {
            Frontpage: ["/pages/index.pug", "🏠", "Go to the front page"],
            Stregsystem: ["/pages/stregsystem.pug", "💵", "Browse our collection of wares"],
            Songbook: ["/pages/songbook/index.pug", "🎼", "Browse our collection of songs"],
            Events: ["/pages/events.pug", "📅", "List upcoming events"],
            Links: ["/pages/links.pug", "🌐", "Look at nice links"],
            Offline: ["/pages/offline.pug", "✈", "Enter offline-mode"],
            TenFoot: ["/pages/tenfoot/toggle.pug", "➜", "Toggle 10-foot display"],
        },
        links: {
            Slack: ["https://fklubben.slack.com"],
            Discord: ["https://discord.gg/6DBvANjs3g"],
            Facebook: ["https://www.facebook.com/fklub"],
            Github: ["https://github.com/f-klubben"],
            Fiki: ["https://fklub.dk"],
            Stregsystem: ["https://stregsystem.fklub.dk"]
        },
        disable_worker: process.env.disable_worker === "true" || true,
    }
};