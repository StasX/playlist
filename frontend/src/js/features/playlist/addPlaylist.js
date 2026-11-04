const $ = require("jquery");
const Swal = require('sweetalert2');
const html = require("../../../views/modals/playlist.html");
const { addSongs } = require("../songs/addSongs");
const { playlistApi } = require("../../api/playlistApi");
const { displayPlaylists } = require("../../ui/display");
const { success} = require("../../utils/messages/success");
const {fail} = require("../../utils/messages/fail");
const {AppStore} = require("../../store/AppStore");
const { setupImagePreview } = require("./playlistImagePreview");

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
            setupImagePreview(popup, imgUrl, name, playlist, confirmBtn);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { songsData, cb } = addSongs();
            cb.then((result) => {
                if (result.isConfirmed) {
                    playlist.songs = songsData.songs;
                    (playlistApi.add(playlist)).done((data) => {
                        playlist.id=data.id;
                        const store = AppStore.getInstance();
                        store.addPlaylist(playlist)
                        displayPlaylists();
                        success("Playlist saved successfully!");
                    }).fail(fail);
                }
            });
        }
    });
}
exports.addPlaylist = addPlaylist;
