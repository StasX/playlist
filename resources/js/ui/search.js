const $ = require("jquery");
const { AppStore } = require("../store/AppStore");
const { displayPlaylists } = require("./display");

function setSearchHandler() {
    const store = AppStore.getInstance();
    $("#search-form").on("submit", function (event) {
        event.preventDefault();
        store.setSearchTerm($("#search-input").val());
        displayPlaylists();

    });
}

exports.setSearchHandler = setSearchHandler;
