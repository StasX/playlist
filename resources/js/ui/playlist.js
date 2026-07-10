const $ = require("jquery");
const {addPlaylist} = require("../features/playlist/add");


function setAddPlaylistHandler() {
    $(" nav a").click(function (event) {
        event.preventDefault();
        addPlaylist();
    });
}

exports.setAddPlaylistHandler = setAddPlaylistHandler;
