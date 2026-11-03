const $ = require("jquery");
const { validHttpUrl } = require("./url");


function validateSongsForm(popup, songsData,confirmBtn) {
    let isAllValid = true;
    songsData.songs = [];
    popup.find("#songs-form .row").each((index, element) => {
        const songName = $(element).find(".song-name");
        const songUrl = $(element).find(".song-url");
        const isValid = songName.val().trim() !== "" && validHttpUrl(songUrl.val());
        if (isValid) {
            songsData.songs.push({
                name: songName.val(),
                url: songUrl.val()
            });
        } else {
            isAllValid = false;
            songsData.songs = [];
            return false;
        }
    });
    confirmBtn.prop("disabled", !isAllValid);
}

exports.validateSongsForm = validateSongsForm;
