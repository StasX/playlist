const $ = require("jquery");
const { removePlaylist } = require("../features/playlist/remove");
const { updatePlaylist } = require("../features/playlist/update");
const { AppStore } = require("../store/AppStore");

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function displayPlaylist(playlist) {
    const escapedName = escapeHTML(playlist.name);
    const escapedImage = escapeHTML(playlist.image);
    const card = $(`
        <div class="col-lg-3 col-md-4 col-sm-6 col-12 card-container">
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
        </div>
    `);

    $('#main-container>div').append(card);
    const arcText = card.find(".arc-text");
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

    card.find('.remove').on('click', function () { removePlaylist($(this)); });
    card.find('.edit').on('click', function () { updatePlaylist($(this)); });
    card.find('.play').on('click', () => {        
    });
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
