const $ = require("jquery");


function validateSongsForm(popup, songsData,confirmBtn) {
    const regex = new RegExp("^https?://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:mp3|wav)$", "i");
    let isAllValid = true;
    songsData.songs = [];
    popup.find("#songs-form .row").each((index, element) => {
        const songName = $(element).find(".song-name");
        const songUrl = $(element).find(".song-url");
        const isValid = songName.val().trim() !== "" && !!songUrl.val().length && regex.test(songUrl.val());
        if (isValid) {
            songsData.songs.push({
                name: songName.val(),
                url: songUrl.val()
            });
        } else {
            isAllValid = false;
            console.log(songsData)
            console.log(songsData.songs)
            songsData.songs = [];
            return false;
        }
    });
    confirmBtn.prop("disabled", !isAllValid);
}

exports.validateSongsForm = validateSongsForm;
