const { validHttpUrl } = require("./url");

function validatePlaylistForm(name, imgUrl, playlist, confirmBtn, imageVerified = true) {
    const isValid = imageVerified && !!name.val().trim() && validHttpUrl(imgUrl.val());
    if (isValid) {
        playlist.name = name.val();
        playlist.image = imgUrl.val();
    }
    confirmBtn.prop("disabled", !isValid);
}

exports.validatePlaylistForm = validatePlaylistForm;
