const $ = require("jquery");
const Swal = require('sweetalert2');
const html = require("../../../views/modals/playlist.html");
const { addSongs } = require("../songs/add");
const { playlistApi } = require("../../api/playlistApi");
const { displayPlaylist } = require("../../ui/display");
const { validatePlaylistForm } = require("../../utils/validators/playlistForm");

function addPlaylist(playlists) {
    const playlist = {};
    Swal.fire({
        title: "Add new playlist",
        html: html,
        showCancelButton: true,
        confirmButtonColor: "#ff4500",
        cancelButtonColor: "#6d6968",
        confirmButtonText: "Next",
        cancelButtonText: "Cancel",
        didOpen: () => {
            const popup = $(Swal.getPopup());
            const confirmBtn = $(Swal.getConfirmButton());
            const name = popup.find("#playlist-name");
            const imgUrl = popup.find("#playlist-image");
            confirmBtn.prop("disabled", true);
            name.on("input", () => validatePlaylistForm(name, imgUrl, playlist, confirmBtn));
            imgUrl.on("input", () => validatePlaylistForm(name, imgUrl, playlist, confirmBtn));
            validatePlaylistForm(name, imgUrl, playlist, confirmBtn);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { songsData, cb } = addSongs();
            cb.then((result) => {
                if (result.isConfirmed) {
                    playlist.songs = songsData.songs;
                    (playlistApi.add(playlist)).done(() => {
                        displayPlaylist(playlist, playlists);
                        Swal.fire({
                            title: "Playlist saved successfully!",
                            icon: "success",
                            draggable: true
                        });
                    }).fail(() => Swal.fire({
                        title: "Faild!",
                        icon: "error",
                        text: "Something went wrong...",
                        draggable: true
                    }));
                }
            });
        }
    });
}
exports.addPlaylist = addPlaylist;
