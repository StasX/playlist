const $ = require("jquery");
const Swal = require("sweetalert2");
const html = require("../../../views/player/player.html");
const { playlistApi } = require("../../api/playlistApi");
const { AppStore } = require("../../store/AppStore");
const { addSongs } = require("../songs/add");

function createModal(playlist) {
    const audio = $("<audio/>");
    const media = audio.get(0);
    const originalTitle = $("title").text();
    let closed = false;
    function cleanup() {
        if (closed) return;
        closed = true;
        media.pause();
        audio.removeAttr("src");
        media.load();
        $("title").text(originalTitle);
    }
    return Swal.fire({
        html, showConfirmButton: false, showCloseButton: true, width: 740,
        customClass: { popup: "player-popup", htmlContainer: "player-html-container" },
        willClose: cleanup,
        didDestroy: cleanup,
        didOpen: () => {
            const popup = $(Swal.getPopup());
            const image = popup.find("img").attr("src", playlist.image);
            const heading = popup.find("h5");
            const list = popup.find("ol");
            const tracker = popup.find("#tracker");
            const volume = popup.find("#vol").val(media.volume);
            const remove = popup.find("#remove-song").attr("title", "Delete selected song");
            popup.find("#update-songs").attr("title", "Edit playlist songs");
            const songs = Array.isArray(playlist.songs) ? playlist.songs : [];
            let current = -1;
            const rows = [];
            const urls = [];
            $.each(songs, (index, song) => {
                try {
                    const url = new URL(song.url);
                    urls[index] = ["http:", "https:"].includes(url.protocol) ? url.href : null;
                } catch { urls[index] = null; }
            });
            function time(value) {
                if (!Number.isFinite(value)) return "00:00";
                return `${Math.floor(value / 60).toString().padStart(2, "0")}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
            }
            function progress() {
                tracker.attr("max", Number.isFinite(media.duration) ? media.duration : 0).val(media.currentTime);
                popup.find("#duration").text(`${time(media.currentTime)} / ${time(media.duration)}`);
            }
            function render() {
                const playing = current >= 0 && !media.paused && !media.ended;
                const icon = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
                popup.find("#audio-play-pause").attr("class", icon);
                popup.find("#play-pause").html(`<i class="${icon}"></i>`);
                image.toggleClass("rotation", playing);
                $.each(rows, (index, row) => {
                    row.text(songs[index].name).attr("aria-current", index === current ? "true" : "false");
                    if (index === current) row.prepend($("<i>").addClass(`${icon} list-playing`));
                });
            }
            function play() {
                if (closed || !urls[current]) return;
                const pending = media.play();
                if (pending) pending.catch(() => {
                    if (!closed) { heading.text("Playback could not start. Press play to retry."); render(); }
                });
            }
            function select(index) {
                if (closed || index < 0 || index >= songs.length) return;
                media.pause();
                current = index;
                remove.prop("disabled", false);
                popup.find("#play-pause").prop("disabled", !urls[index]);
                if (!urls[index]) {
                    audio.removeAttr("src");
                    media.load();
                    heading.text(`Cannot play: ${songs[index].name}. You can delete this song or edit its URL.`);
                    $("title").text(originalTitle);
                    render(); progress();
                    return;
                }
                audio.attr("src", urls[index]);
                media.load();
                heading.text(`Now playing: ${songs[index].name}`);
                $("title").text(`Playing: ${songs[index].name}`);
                render(); progress(); play();
            }
            $.each(songs, (index, song) => {
                const row = $("<li>").text(song.name).attr("tabindex", "0")
                    .on("click", () => select(index))
                    .on("keydown", event => {
                        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); }
                    });
                rows.push(row);
                list.append(row);
            });
            audio.on("play", render).on("pause", render)
                .on("timeupdate", progress).on("loadedmetadata", progress)
                .on("error", () => { if (!closed) heading.text("Unable to play this song. Choose another song or retry."); })
                .on("ended", () => {
                    const next = urls.findIndex((url, index) => index > current && url);
                    if (next >= 0) select(next);
                    else render();
                });
            const toggle = () => { if (current >= 0) media.paused ? play() : media.pause(); };
            popup.find("#play-pause").on("click", toggle);
            popup.find("#audio-play-pause").on("click", toggle);
            tracker.on("input", () => { if (Number.isFinite(media.duration)) media.currentTime = Number(tracker.val()); });
            function muteIcon() {
                popup.find("#mute").attr("class", media.muted || media.volume === 0 ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high");
            }
            popup.find("#mute").on("click", () => { media.muted = !media.muted; muteIcon(); });
            volume.on("input", () => { media.volume = Number(volume.val()); muteIcon(); });
            function save(updatedSongs) {
                return playlistApi.update(playlist.id, { songs: updatedSongs }).done(() => {
                    playlist.songs = updatedSongs;
                    AppStore.getInstance().setSongs({ id: playlist.id, songs: updatedSongs });
                    createModal(playlist);
                }).fail(() => {
                    Swal.fire({ icon: "error", title: "Songs could not be saved", text: "Your playlist has not changed." })
                        .then(() => createModal(playlist));
                });
            }
            remove.prop("disabled", true).on("click", () => {
                if (current < 0) return;
                const selected = current;
                cleanup();
                Swal.fire({ title: "Delete selected song?", text: songs[selected].name, icon: "warning", showCancelButton: true })
                    .then(result => {
                        if (result.isConfirmed) save(songs.filter((song, index) => index !== selected));
                        else createModal(playlist);
                    });
            });
            popup.find("#update-songs").on("click", () => {
                cleanup();
                const editor = addSongs(songs);
                editor.cb.then(result => {
                    if (result.isConfirmed) save(editor.songsData.songs);
                    else createModal(playlist);
                });
            });
            const first = urls.findIndex(Boolean);
            popup.find("#play-pause").prop("disabled", first < 0);
            if (first >= 0) select(first);
            else { heading.text(songs.length ? "No playable songs. Edit the playlist to add a valid URL." : "This playlist is empty. Add songs to start listening."); render(); progress(); }
        },
    });
}

exports.createModal = createModal;
