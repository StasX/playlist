const $ = require("jquery");
const { displayPlaylists } = require("./display");
const {playlistApi} = require("../api/playlistApi")


function load() {
    let allPlaylists;
    $.when(playlistApi.load.then(function (data, textStatus, jqXHR) {
        if (jqXHR.status === 200) {
            allPlaylists = data;
            displayPlaylists(allPlaylists);
        }
    }));
    return allPlaylists;
}

exports.load = load;
