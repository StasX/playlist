const $ = require("jquery");
const {addPlaylist} = require("../features/playlist/add");


function setAddPlaylistHandler(playlists) {
    $(" nav a").click(function (event) {
        event.preventDefault();
        addPlaylist(playlists);
    });
}

exports.setAddPlaylistHandler = setAddPlaylistHandler;
