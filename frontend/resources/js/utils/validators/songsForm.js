const $ = require("jquery");
const { validHttpUrl } = require("./url");


function validateSongsForm(popup, songsData,confirmBtn, isUrlVerified = () => true) {
    let isAllValid = true;
    songsData.songs = [];
    popup.find("#songs-form .row").each((index, element) => {
        const songName = $(element).find(".song-name");
        const songUrl = $(element).find(".song-url");
        const isNameValid = !!songName.val().trim();
        const isUrlValid = validHttpUrl(songUrl.val()) && isUrlVerified(songUrl.val());
        songName.toggleClass("is-invalid", !isNameValid && (songName.val() !== "" || !!songName.data("edited")));
        songUrl.toggleClass("is-invalid", !isUrlValid && (songUrl.val() !== "" || !!songUrl.data("edited")));
        const isValid = isNameValid && isUrlValid;
        if (isValid) {
            songsData.songs.push({
                name: songName.val(),
                url: songUrl.val()
            });
        } else {
            isAllValid = false;
        }
    });
    if (!isAllValid) songsData.songs = [];
    confirmBtn.prop("disabled", !isAllValid);
    return isAllValid;
}

exports.validateSongsForm = validateSongsForm;
