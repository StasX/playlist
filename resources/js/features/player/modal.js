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
        width: 740,
        customClass: {
            popup: "player-popup",
            htmlContainer: "player-html-container"
        },
        didOpen: () => {
            function calcTime(totalSeconds) {
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = Math.floor(totalSeconds % 60);
                const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                return `${formattedMinutes}:${formattedSeconds}`;
            }
            let interval;
            let muted = false;
            let songDuration = "00:00 / 00:00";
            const popup = $(Swal.getPopup());
            //popup.css({ "width": "800px", "border-radius": "300px" });
            const image = popup.find("img");
            image.attr("src", playlist.image);
            const nowPlaying = popup.find("h5");
            const songsList = popup.find("ol");
            const playPauseBtn = popup.find("#play-pause");
            const audioPlayPause = popup.find("#audio-play-pause");
            const duration = popup.find("#duration");
            const tracker = popup.find("#tracker");
            const muteButton = popup.find("#mute");
            const vol = popup.find("#vol");
            const removeSongBtn = popup.find("#remove-song");
            const updateSongsBtn = popup.find("#update-songs");

            songName = playlist.songs[0]?.name || "";
            const audio = $('<audio/>');

            $.each(playlist.songs, (i, song) => {
                songsList.append(`<li>${song.name}</li>`)
                audio.append(`<source src="${song.url}" type="audio/mpeg">`)
            });

            let currentSong = 0;
            const song = audio.get(currentSong);
            let currentSongName = playlist.songs[currentSong].name
            nowPlaying.text(`Now playing: ${currentSongName}`);
            $("title").text(`Playing: ${currentSongName}`);
            audio.ready(() => {
                song.play();
            });

            audio.on("play", () => {
                const pauseClass = "fa-solid fa-pause";
                audioPlayPause.attr('class', pauseClass);
                playPauseBtn.html(`<i class="${pauseClass}"></i>`);
                image.addClass("rotation");
                const songContainer = songsList.find(`li:nth-child(${currentSong + 1})`);
                songContainer.html(`<i class="fa-solid fa-play list-playing" style="top:${currentSong * 24}"></i>${currentSongName}`);
                const time = calcTime(audio[0].currentTime);
                tracker.val(audio[0].currentTime);
                duration.text(`${time} / ${songDuration}`);
                interval = setInterval(() => {
                    const time = calcTime(audio[0].currentTime);
                    tracker.val(audio[0].currentTime);
                    duration.text(`${time} / ${songDuration}`);
                }, 1000);
            });
            audio.on("pause", () => {
                const playClass = "fa-solid fa-play";
                audioPlayPause.attr('class', playClass);
                playPauseBtn.html(`<i class="${playClass}"></i>`);
                const songContainer = songsList.find(`li:nth-child(${currentSong + 1})`);
                songContainer.html(`<i class="fa-solid fa-pause list-playing" style="top:${currentSong * 24}"></i>${currentSongName}`);
                image.removeClass("rotation");
                clearInterval(interval);
            });

            audio.on('loadedmetadata', () => {
                songDuration = calcTime(audio[0].duration);
                tracker.attr("max", Math.floor(audio[0].duration));
                duration.text(`00:00 / ${songDuration}`);
                vol.val(audio[0].volume);
            });

            playPauseBtn.click(() => {
                song.paused ? song.play() : song.pause();
            });

            audioPlayPause.click(() => {
                song.paused ? song.play() : song.pause();
            });
            tracker.on("change", () => {
                audio[0].currentTime = tracker.val();
            });
            muteButton.click(() => {
                muted = !muted;
                if (muted) {
                    audio.attr("muted", "muted");
                    muteButton.removeClass("fa-volume-high");
                    muteButton.addClass("fa-volume-xmark");
                    return;
                }
                audio.removeAttr("muted");
                muteButton.removeClass("fa-volume-xmark");
                muteButton.addClass("fa-volume-high");
            });
            vol.on("change", () => {

                const volume = vol.val();
                audio[0].volume = volume;
                if (volume == 0) {
                    muteButton.removeClass("fa-volume-high");
                    muteButton.addClass("fa-volume-xmark");
                    return;
                }
                muteButton.removeClass("fa-volume-xmark");
                muteButton.addClass("fa-volume-high");
            });
            removeSongBtn.click(()=>{
                
            });
            updateSongsBtn.click(()=>{

            });
        },
    });
}

exports.createModal = createModal;
