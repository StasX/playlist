const { displayPlaylists } = require("./display");
const { playlistApi } = require("../api/playlistApi");
const { AppStore } = require("../store/AppStore");
const { fail } = require("../utils/messages/fail");


function load() {
    return playlistApi.load.done(function (data) {
        const store = AppStore.getInstance();
        store.setPlaylists(data);
        displayPlaylists();
    }).fail(fail);
}

exports.load = load;
