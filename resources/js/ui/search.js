const $ = require("jquery");
const { AppStore } = require("../store/AppStore");
const { displayPlaylists } = require("./display");

function setSearchHandler() {
    const store = AppStore.getInstance();
    $("#search-form").on("submit", function (event) {
        event.preventDefault();
        store.setSearchTerm($("#find-input").val());
        displayPlaylists();

    });
}

exports.setSearchHandler = setSearchHandler;
