const $ = require("jquery");
const Swal = require('sweetalert2');
const { fail } = require("../../utils/messages/fail");
const { playlistApi } = require("../../api/playlistApi");
const { AppStore } = require("../../store/AppStore");
const html = require("../../../views/modals/playlist.html");
const { validatePlaylistForm } = require("../../utils/validators/playlistForm");




function updatePlaylist(element) {
    const cardContainer = element.closest(".card-container");
    const index = cardContainer.index();
    const store = AppStore.getInstance();
    const playlists = store.getPlaylists();
    const playlist = playlists[index];
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
            confirmBtn.prop("disabled", true);
            name.on("input", () => validatePlaylistForm(name, imgUrl, playlist, confirmBtn));
            imgUrl.on("input", () => validatePlaylistForm(name, imgUrl, playlist, confirmBtn));
            validatePlaylistForm(name, imgUrl, playlist, confirmBtn);
            name.val(playlist.name);
            imgUrl.val(playlist.image);
            const imgContainer = popup.find(".image-container");
            const img = imgContainer.find("img");
            imgContainer.css("display", "block");
            img.attr("src", playlist.image);
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
                name: updatePlaylist.name,
                image: updatePlaylist.image
            }
            playlistApi.update(id, data).done(() => {
                store.updatePlaylist(updatedPlaylist);
                const { displayPlaylist } = require("../../ui/display");
                displayPlaylist(updatedPlaylist, cardContainer);
            }).fail(fail);
        }
    });


}

exports.updatePlaylist = updatePlaylist;
