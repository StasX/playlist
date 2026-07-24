const $ = require("jquery");
require("lettering.js");
require("@fortawesome/fontawesome-free/css/all.css");
require("bootstrap/dist/css/bootstrap.min.css");
require("glyphicons-only-bootstrap/css/bootstrap.css");
require("../scss/main.scss");
const { load } = require("./ui/load");
const { setSearchHandler } = require("./ui/search");
const { setAddPlaylistHandler } = require("./ui/playlist");


$(function () {
    load();
    setSearchHandler();
    setAddPlaylistHandler();
});
