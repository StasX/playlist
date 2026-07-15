const $ = require("jquery");
const {addPlaylist} = require("../features/playlist/add");


function setAddPlaylistHandler() {
    $("#add-playlist").click(addPlaylist);
}

exports.setAddPlaylistHandler = setAddPlaylistHandler;
