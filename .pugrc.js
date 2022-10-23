readFileSync = require("fs").readFileSync

module.exports = {
    locals: {
        app_name: "F-Appen",
        manifest: JSON.parse(readFileSync("./manifest.json", "utf-8")),
    }
};