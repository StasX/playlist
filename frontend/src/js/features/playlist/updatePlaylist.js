const $ = require("jquery");
const Swal = require('sweetalert2');
const { fail } = require("../../utils/messages/fail");
const { playlistApi } = require("../../api/playlistApi");
const { AppStore } = require("../../store/AppStore");
const html = require("../../../views/modals/playlist.html");
const { setupImagePreview } = require("./playlistImagePreview");




function updatePlaylist(element) {
    const cardContainer = element.closest(".card-container");
    const index = cardContainer.index();
    const store = AppStore.getInstance();
    const playlists = store.getPlaylists();
    const playlist = { ...playlists[index] };
    Swal.fire({
        title: "Update playlist",
        html: html,
        showCancelButton: true,
        confirmButtonColor: "#ff4500",
        cancelButtonColor: "#6d6968",
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
        didOpen: () => {
            const popup = $(Swal.getPopup());
            const confirmBtn = $(Swal.getConfirmButton());
            const name = popup.find("#playlist-name");
            const imgUrl = popup.find("#playlist-image");
            name.val(playlist.name);
            imgUrl.val(playlist.image);
            setupImagePreview(popup, imgUrl, name, playlist, confirmBtn);
        },
        preConfirm: () => {
            const popup = $(Swal.getPopup());
            return {
                ...playlist,
                name: popup.find("#playlist-name").val().trim(),
                image: popup.find("#playlist-image").val().trim()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const updatedPlaylist = result.value;
            const id = updatedPlaylist.id;
            const data = {
                name: updatedPlaylist.name,
                image: updatedPlaylist.image
            }
            playlistApi.update(id, data).done(() => {
                store.updatePlaylist(updatedPlaylist);
                const { displayPlaylists } = require("../../ui/display");
                displayPlaylists();
            }).fail(fail);
        }
    });


}

exports.updatePlaylist = updatePlaylist;
