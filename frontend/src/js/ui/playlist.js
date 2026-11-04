const $ = require("jquery");
const {addPlaylist} = require("../features/playlist/addPlaylist");


function setAddPlaylistHandler() {
    $("#add-playlist").click(addPlaylist);
}

exports.setAddPlaylistHandler = setAddPlaylistHandler;
