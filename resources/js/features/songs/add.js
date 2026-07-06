const $ = require("jquery");
const Swal = require('sweetalert2');
const html = require("../../../views/modals/songs.html");
const row = require("../../../views/modals/songsRow.html");
const { validateSongsForm } = require("../../utils/validators/songsForm");


function appendRow(popup, songsData, confirmBtn) {
    $("#songs-form").append(row);
    const songName = popup.find("#songs-form .row:last-child .song-name");
    const songUrl = popup.find("#songs-form .row:last-child .song-url");
    songName.on("input", () => validateSongsForm(popup, songsData, confirmBtn));
    songUrl.on("input", () => validateSongsForm(popup, songsData, confirmBtn));
}

function addSongs() {
    const songsData = { songs: [] };
    return {
        songsData,
        cb: Swal.fire({
            title: "Add songs to playlist",
            html: html,
            showCancelButton: true,
            confirmButtonColor: "#ff4500",
            cancelButtonColor: "#6d6968",
            confirmButtonText: "Save",
            cancelButtonText: "Cancel",
            didOpen: () => {
                const popup = $(Swal.getPopup());
                const confirmBtn = $(Swal.getConfirmButton());

                const songName = popup.find(".song-name");
                const songUrl = popup.find(".song-url");
                popup.find("#add-song").click(() => appendRow(popup, songsData, confirmBtn));

                confirmBtn.prop("disabled", true);
                songName.on("input", () => validateSongsForm(popup, songsData, confirmBtn));
                songUrl.on("input", () => validateSongsForm(popup, songsData, confirmBtn));
                validateSongsForm(popup, songsData,confirmBtn);

            }
        })
    };
}
exports.addSongs = addSongs;
