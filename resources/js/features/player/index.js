const $ = require("jquery");
const Swal = require("sweetalert2");
const { AppStore } = require("../../store/AppStore");
const html = require("../../../views/player/player.html");
const { fail } = require("../../utils/messages/fail")

function createPlayer(element) {
    const index = element.closest(".card-container").index();
    const store = AppStore.getInstance();
    const playlists = store.getPlaylists();
    if (!(index >= 0 && index < playlists.length)) return fail();
    const playlist = playlists[index];
    Swal.fire({
        html: html,
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: true,
        didOpen: () => {
            const popup = $(Swal.getPopup());
            const image = popup.find("img");
            image.attr("src", playlist.image);
            const songsList = popup.find("ol");
            const audio = popup.find("audio");
            $.each(playlist.songs, (i, song) => {
                console.log(song)
                songsList.append(`<li>${song.name}</li>`)
                audio.append(`<source src="${song.url}" type="audio/mpeg">`)
            });
            const playing = audio.get(0);
            $("title").text(`Playing: ${songs.name}`)
            playing.play();

        },
    });
}

exports.createPlayer = createPlayer;
