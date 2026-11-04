const $ = require("jquery");
const Swal = require('sweetalert2');
const html = require("../../../views/modals/songs.html");
const row = require("../../../views/modals/songsRow.html");
const { validateSongsForm } = require("../../utils/validators/songsForm");
const { createUrlChecks } = require("../../utils/validators/songUrlChecks");
const { createEditorDialog } = require("../../utils/dialogs/songEditorDialog");

function updateForm(popup, songsData, confirmBtn, checks) {
    const isValid = validateSongsForm(popup, songsData, confirmBtn, url => checks.isVerified(url));
    popup.find("#add-song").prop("disabled", !isValid);
    return isValid;
}

function appendRow(popup, songsData, confirmBtn, checks) {
    popup.find("#songs-form").append(row);
    updateForm(popup, songsData, confirmBtn, checks);
}

function addSongs(initialSongs = [], { overlay = false } = {}) {
    const modal = overlay ? createEditorDialog() : Swal;
    const songsData = { songs: [] };
    let checks;
    return {
        songsData,
        cb: modal.fire({
            title: initialSongs.length ? "Edit playlist songs" : "Add songs to playlist",
            html: html,
            showCancelButton: true,
            confirmButtonColor: "#ff4500",
            cancelButtonColor: "#6d6968",
            confirmButtonText: "Save",
            cancelButtonText: "Cancel",
            didOpen: () => {
                const popup = $(modal.getPopup());
                const confirmBtn = $(modal.getConfirmButton());
                checks = createUrlChecks(() => updateForm(popup, songsData, confirmBtn, checks));

                $.each(initialSongs, (index, song) => {
                    if (index > 0) appendRow(popup, songsData, confirmBtn, checks);
                    const songRow = popup.find("#songs-form .row").eq(index);
                    songRow.find(".song-name").val(song.name);
                    songRow.find(".song-url").val(song.url);
                });

                popup.find("#add-song").click(() => {
                    if (updateForm(popup, songsData, confirmBtn, checks)) {
                        appendRow(popup, songsData, confirmBtn, checks);
                    }
                });

                confirmBtn.prop("disabled", true);
                popup.on("input", "#songs-form .song-name, #songs-form .song-url", event => {
                    $(event.currentTarget).data("edited", true);
                    updateForm(popup, songsData, confirmBtn, checks);
                });
                updateForm(popup, songsData, confirmBtn, checks);

            },
            willClose: () => checks?.dispose()
        })
    };
}
exports.addSongs = addSongs;
