const $ = require("jquery");
require("lettering.js");
require("../scss/main.scss");
const { load } = require("./ui/load");
const { setSearchHandler } = require("./ui/search");
const { setAddPlaylistHandler } = require("./ui/playlist");
const { AppStore } = require("./store/AppStore");

let allPlaylists;
$(function () {
    const store= AppStore.getInstance();
    store.setPlaylists(load())
    allPlaylists = load();
    setSearchHandler();
    setAddPlaylistHandler(allPlaylists);
});
