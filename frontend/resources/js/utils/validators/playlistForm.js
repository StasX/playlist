const { validHttpUrl } = require("./url");

function validatePlaylistForm(name, imgUrl, playlist, confirmBtn, imageVerified = true) {
    const isNameValid = !!name.val().trim();
    const isImageValid = imageVerified && validHttpUrl(imgUrl.val());
    name.toggleClass("is-invalid", !isNameValid && (name.val() !== "" || !!name.data("edited")));
    imgUrl.toggleClass("is-invalid", !isImageValid && (imgUrl.val() !== "" || !!imgUrl.data("edited")));
    const isValid = isNameValid && isImageValid;
    if (isValid) {
        playlist.name = name.val();
        playlist.image = imgUrl.val();
    }
    confirmBtn.prop("disabled", !isValid);
}

exports.validatePlaylistForm = validatePlaylistForm;
