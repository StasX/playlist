const $ = require("jquery");
require("lettering.js");
require("../scss/main.scss");
const { load} = require("./ui/load");
const  { setSearchHandler} = require("./ui/search");
const  {setAddPlaylistHandler} = require("./ui/playlist");

let allPlaylists;
$(function () {
    allPlaylists = load();
    setSearchHandler();
    setAddPlaylistHandler();
});
