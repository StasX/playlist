const $ = require("jquery");
const Swal = require("sweetalert2");
const html = require("../../../views/player/player.html");

function createModal(playlist) {
    let currentSong;
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
            currentSong=playlist.songs[0]?.name || "";
            const audio = popup.find("audio");
            
            $.each(playlist.songs, (i, song) => {
                songsList.append(`<li>${song.name}</li>`)
                audio.append(`<source src="${song.url}" type="audio/mpeg">`)
            });
            const playing = audio.get(0);
            $("title").text(`Playing: ${song.name}`)
            playing.play();

        },
    });
}

exports.createModal = createModal;
