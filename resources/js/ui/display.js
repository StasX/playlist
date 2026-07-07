const $ = require("jquery");
const {removePlaylist} =require("../features/playlist/remove");


function displayPlaylist(playlist, playlists) {
    const deg = playlist.name.length * Math.PI + 1;
    $('#main-container').append(`
    <div class="col-ls-3 col-md-4  col-sm-6 col-xs-12">
        <div class="card" style="width: 18rem;">
            <div class="card-body" style="height: 400px">
                <figure>
                    <figcaption calss="len${playlist.name.length}">
                        <div class="caption" style="transform: rotate(-${deg}deg)">${playlist.name}</div>
                    </figcaption>
                    <div class="container img-container">
                        <div class="row">
                            <div class=""col">
                                <img width="200" height="200" alt="${playlist.name}" src="${playlist.image}">
                            </div>
                        <div>
                        <div class="row btn-row">
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
                        <div>
                    </div>
                </figure>
            </div>
        </div>
    </div>
    `);
    $('.card:last-child .caption').lettering();
    $('.card:last-child .remove').on('click', function(){ removePlaylist(playlists,$(this))});
    $('.card:last-child .edit').on('click', () => {
        
    });
    $('.card:last-child .play').on('click', () => {

    });
}

function displayPlaylists(playlists) {
    $('#main-container').html("");
    $.each(playlists, (i, playlist) => {
        displayPlaylist(playlist, playlists);
    });
}

exports.displayPlaylists = displayPlaylists;
exports.displayPlaylist = displayPlaylist;
