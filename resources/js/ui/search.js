const $ = require("jquery");


function search(name) {
    searchName = name.toLowerCase();
    const filteredPlaylists = allPlaylists.filter(playlist => playlist.name.toLowerCase().includes(searchName));
    displayPlaylists(filteredPlaylists);
}

function setSearchHandler() {
    $("#search-form").on("submit", function (event) {
        event.preventDefault();
        search($("#search-form input").val());
    });
    $("#search-form input").on("input", () => search($(this).val()));
    $(".glyphicon-search").on("click", () => search($("#search-form input").val()));
}

exports.search = search;
exports.setSearchHandler = setSearchHandler;
