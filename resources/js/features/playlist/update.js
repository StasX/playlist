const $ = require("jquery");
const Swal = require('sweetalert2');
const { fail } = require("../../utils/messages/fail");
const { playlistApi } = require("../../api/playlistApi");
const { AppStore } = require("../../store/AppStore");
const { getParent } = require("../../utils/other/getParent");
const html = require("../../../views/modals/playlist.html");
const { validatePlaylistForm } = require("../../utils/validators/playlistForm");
const { displayPlaylists } = require("../../ui/display");


function updatePlaylist(element) {
    const index = getParent(element, 9).index();
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
            playlist.name = name.val();
            playlist.image = imgUrl.val();
        }
    }).then((result) => {
        if (result.isConfirmed) {
            playlistApi.update(playlist).done(() => {
                store.updatePlaylist(playlist);
                $(`#main-container>div:nth-child(${index+1})`).find(".caption").html(playlist.name);
                $(`#main-container>div:nth-child(${index+1})`).find("img").attr("src",playlist.image);
                $(`#main-container>div:nth-child(${index+1}) .caption`).lettering();
            }).fail(fail);
        }
    });


}

exports.updatePlaylist = updatePlaylist;
