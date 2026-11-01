function validatePlaylistForm(name, imgUrl, playlist, confirmBtn) {
    const regex = new RegExp("^https?://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png)$", "i");
    const isValid = name.val().trim() !== "" && (imgUrl.val().length > 0) && regex.test(imgUrl.val());
    if (isValid) {
        playlist.name = name.val();
        playlist.image = imgUrl.val();
    }
    confirmBtn.prop("disabled", !isValid);
}

exports.validatePlaylistForm = validatePlaylistForm;
