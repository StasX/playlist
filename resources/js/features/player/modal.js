const $ = require("jquery");
const Swal = require("sweetalert2");
const html = require("../../../views/player/player.html");

function createModal(playlist) {
    let songName;
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
            popup.css({ "width": "800px", "border-radius": "300px" });
            const image = popup.find("img");
            image.attr("src", playlist.image);
            const nowPlaying = popup.find("h5");
            const songsList = popup.find("ol");
            songName = playlist.songs[0]?.name || "";
            const audio = popup.find("audio");

            $.each(playlist.songs, (i, song) => {
                songsList.append(`<li>${song.name}</li>`)
                audio.append(`<source src="${song.url}" type="audio/mpeg">`)
            });

            let currentSong = 0;
            const song = audio.get(currentSong);
            const currentSongName = playlist.songs[currentSong].name
            nowPlaying.text(`Now playing: ${currentSongName}`);
            $("title").text(`Playing: ${currentSongName}`);
            song.play();
            const playPauseButton = popup.find("#play-pause");
            audio.on("play", () => {
                console.log("playing")
                playPauseButton.html('<i class="fa-solid fa-pause"></i>');
                image.addClass("rotation");
            });
            audio.on("pause", () => {
                console.log("paused")
                playPauseButton.html('<i class="fa-solid fa-play"></i>');
                image.removeClass("rotation");
            });
            playPauseButton.click(() => {
                song.paused ? song.play() : song.pause();
            });
        },
    });
}

exports.createModal = createModal;
