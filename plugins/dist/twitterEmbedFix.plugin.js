/**
 * @name twitterEmbedFix
 * @description Renames twitter.com URLs to vxtwitter.com for friendly embed
 * @version 1.0.0
 * @author Feroci
 * @authorId 693308496011067423
 * @website https://github.com/ferecece/BDPlugins
 * @source https://raw.githubusercontent.com/ferecece/BDPlugins/main/plugins/dist/twitterEmbedFix.plugin.js
 */

const config = {
    info: {
        name: "twitterEmbedFix",
        authors: [
            {
                name: "Feroci",
                discord_id: "693308496011067423",
                github_username: "ferecece",
                authorLink: "https://github.com/ferecece"
            }
        ],
        version: "1.0.0",
        description: "Renames twitter.com URLs to vxtwitter.com for friendly embed",
        website: "https://github.com/ferecece/BDPlugins",
        github: "https://github.com/ferecece/BDPlugins",
        github_raw: "https://raw.githubusercontent.com/ferecece/BDPlugins/main/plugins/dist/twitterEmbedFix.plugin.js"
    },
    defaultConfig: [],
    main: "index.js"
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
    const plugin = (Plugin, Library) => {

    const { DiscordModules, Patcher, Toasts } = Library;
    const { Dispatcher } = DiscordModules;

    const twitterRegex = /http(?:s)?:\/\/(?:www\.)?twitter\.com/g;
    const vxTwitterUrl = "https://vxtwitter.com";

    return class extends Plugin {
        constructor() {
            super();
        }

        updateUrl(event, isFromSomeoneElse = false) {
            if (isFromSomeoneElse) {
                var msgcontent = event
            } else {
                var msgcontent = event[1].content
            }
            if (msgcontent.match(twitterRegex)) {
                msgcontent = msgcontent.replaceAll(twitterRegex, vxTwitterUrl);
                if (isFromSomeoneElse) {
                    Toasts.success("Someone who doesn't have the plugin sent a Twitter URL, but I updated it for you!");
                }
            }
            return msgcontent;
        }

        onStart() {
            // For messages sent
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t, a) => {
                a[1].content = this.updateUrl(a);
            });

            // For incoming messages
            Patcher.before(Dispatcher, "dispatch", (_, args) => {
                var event = args[0]
                if (event.type === "MESSAGE_CREATE") {
                    if (event.message.author.id == DiscordModules.UserStore.getCurrentUser().id) return;
                    event.message.content = this.updateUrl(event.message.content, true);
                }
            });
        }

        onStop() {
            Patcher.unpatchAll();
        }
    };

};
    return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/