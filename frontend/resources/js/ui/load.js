const $ = require("jquery");
const { displayPlaylists } = require("./display");
const { playlistApi } = require("../api/playlistApi");
const { AppStore } = require("../store/AppStore");


function load() {
    let allPlaylists;
    $.when(playlistApi.load.then(function (data, textStatus, jqXHR) {
        if (jqXHR.status === 200) {
            const store = AppStore.getInstance();
            store.setPlaylists(data);
            displayPlaylists();
        }
    }));
}

exports.load = load;
