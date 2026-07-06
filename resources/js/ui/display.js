const Swal = require('sweetalert2');
const $ = require("jquery");


function displayPlaylist(playlist) {
    const deg = playlist.name.length * Math.PI + 1;
    $('#main-container').append(`
    <div class="card" style="width: 18rem;">
        <div class="card-body" style="height: 400px">
            <figure>
                <figcaption calss="len${playlist.name.length}">
                    <div class="caption" style="transform: rotate(-${deg}deg)">${playlist.name}</div>
                </figcaption>
                <div class="img-container">
                    <img width="200" height="200" alt="${playlist.name}" src="${playlist.image}">
                    <button class="edit"><i class="fa fa-pencil"></i></button>
                    <button class="remove"><i class="fa fa-times"></i></button>
                    <button class="play"><i class="fa fa-play"></i></button>
                </div>
            </figure>
        </div>
    </div>
    `);
    $('.card:last-child .caption').lettering();
    $('.card:last-child .remove').on('click', () => {
        const index = $(this).parent().parent().parent().parent().index();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff4500",
            cancelButtonColor: "#6d6968",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success",
                confirmButtonColor: "#ff4500",
            });
        });

    });
    $('.card:last-child .edit').on('click', () => {
        var playListPos = findParentPos(this, $("#main-container").children(), 3);
        modal(3, "Edit Playlist", [playlist], playListPos);
    });
    $('.card:last-child .play').on('click', () => {
        var playListPos = findParentPos(this, $("#main-container").children(), 3);
        createPlayer([playlist], playListPos);
    });
}

function displayPlaylists(playlists) {
    $('#main-container').html("");
    $.each(playlists, (i, playlist) => {
        displayPlaylist(playlist);
    });
}

exports.displayPlaylists = displayPlaylists;
exports.displayPlaylist = displayPlaylist;
