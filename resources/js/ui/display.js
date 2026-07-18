const $ = require("jquery");
const { removePlaylist } = require("../features/playlist/remove");
const { updatePlaylist } = require("../features/playlist/update");
const { AppStore } = require("../store/AppStore");
const {createPlayer} =require("../features/player");

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function displayPlaylist(playlist, element) {
    const escapedName = escapeHTML(playlist.name);
    const escapedImage = escapeHTML(playlist.image);
    const card= $(`
            <div class="card quadratic-card">
                <div class="card-body">
                    <figure class="disk">
                        <figcaption class="arc-text">${escapedName}</figcaption>
                        <img class="disk-image" src="${escapedImage}" alt="${escapedName}">
                        <div class="container btn-row">
                            <div class="row">
                                <div class="col">
                                    <button class="edit">
                                        <i class="fa-solid fa-pencil"></i>
                                    </button>
                                </div>
                                <div class="col">
                                    <button class="remove">
                                        <i class="fa-solid fa-x"></i>
                                    </button>
                                </div>
                                <div class="col">
                                    <button class="play">
                                        <i class="fa-solid fa-play"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </figure>
                </div>
            </div>
    `);
    const cardContainer = element || $('<div class="col-lg-3 col-md-4 col-sm-6 col-12 card-container"></div>');
    cardContainer.html(card);
    if (!element) $('#main-container>div').append(cardContainer);
    const arcText = cardContainer.find(".arc-text");
    arcText.lettering();
    const letters = arcText.find("span");
    const total = letters.length;
    const startAngle = -65;
    const endAngle = 65;
    letters.each(function (index) {
        const angle =
            total === 1
                ? 0
                : startAngle +
                (endAngle - startAngle) * (index / (total - 1));

        $(this).css("transform", `rotate(${angle}deg)`);
    });
    cardContainer.find('.remove').on('click', function () { removePlaylist($(this)); });
    cardContainer.find('.edit').on('click', function () { updatePlaylist($(this)); });
    cardContainer.find('.play').on('click', function () { createPlayer($(this)); });
}

function displayPlaylists() {
    const store = AppStore.getInstance();
    $('#main-container>div').empty();
    $.each(store.getPlaylists(), (i, playlist) => {
        displayPlaylist(playlist);
    });
}

exports.displayPlaylists = displayPlaylists;
exports.displayPlaylist = displayPlaylist;
