const $ = require("jquery");
const Swal = require("sweetalert2");
const html = require("../../../views/player/player.html");
const { playlistApi } = require("../../api/playlistApi");
const { AppStore } = require("../../store/AppStore");
const { addSongs } = require("../songs/add");
const { createEditorDialog } = require("../songs/editorDialog");

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
        allowOutsideClick: false,
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
            const remove = popup.find("#remove-song").attr("title", "Delete playing song");
            popup.find("#update-songs").attr("title", "Edit playlist songs");
            let songs = Array.isArray(playlist.songs) ? playlist.songs : [];
            let current = -1;
            const rows = [];
            const urls = [];
            function updateUrls() {
                urls.length = 0;
                $.each(songs, (index, song) => {
                    try {
                        const url = new URL(song.url);
                        urls[index] = ["http:", "https:"].includes(url.protocol) ? url.href : null;
                    } catch { urls[index] = null; }
                });
            }
            updateUrls();
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
                    if (index === current) {
                        const control = $("<i>").addClass(`${icon} list-playing`)
                            .attr("role", "button").attr("tabindex", "0")
                            .attr("aria-label", playing ? "Pause song" : "Play song")
                            .on("click", event => {
                                event.stopPropagation();
                                toggle();
                            })
                            .on("keydown", event => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    toggle();
                                }
                            });
                        row.prepend(control);
                    }
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
            function updateRows() {
                list.empty();
                rows.length = 0;
                $.each(songs, (index, song) => {
                    const row = $("<li>").text(song.name).attr("tabindex", "0")
                        .on("click", () => select(index))
                        .on("keydown", event => {
                            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); }
                        });
                    rows.push(row);
                    list.append(row);
                });
            }
            updateRows();
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
            function save(updatedSongs, keepPlayer = false) {
                return playlistApi.update(playlist.id, { songs: updatedSongs }).done(() => {
                    playlist.songs = updatedSongs;
                    AppStore.getInstance().setSongs({ id: playlist.id, songs: updatedSongs });
                    if (keepPlayer && !closed) {
                        const previousUrl = urls[current];
                        songs = updatedSongs;
                        popup.find("#player-message").text("").prop("hidden", true);
                        updateUrls();
                        updateRows();
                        current = previousUrl ? urls.indexOf(previousUrl) : -1;
                        if (current >= 0) {
                            heading.text(`Now playing: ${songs[current].name}`);
                            $("title").text(`Playing: ${songs[current].name}`);
                            render();
                        } else {
                            const first = urls.findIndex(Boolean);
                            if (first >= 0) select(first);
                            else {
                                media.pause();
                                audio.removeAttr("src");
                                media.load();
                                remove.prop("disabled", true);
                                popup.find("#play-pause").prop("disabled", true);
                                heading.text("This playlist has no playable songs.");
                                $("title").text(originalTitle);
                                render(); progress();
                            }
                        }
                    } else if (!keepPlayer) createModal(playlist);
                }).fail(() => {
                    if (keepPlayer) {
                        if (!closed) heading.text("Songs could not be saved. Your playlist has not changed.");
                        return;
                    }
                    Swal.fire({ icon: "error", title: "Songs could not be saved", text: "Your playlist has not changed." })
                        .then(() => createModal(playlist));
                });
            }
            remove.prop("disabled", true).on("click", () => {
                if (current < 0) return;
                if (songs.length <= 1) {
                    popup.find("#player-message")
                        .text("At least one song must remain in the playlist.")
                        .prop("hidden", false);
                    return;
                }
                const selected = current;
                createEditorDialog().fire({
                    title: "Delete current song?",
                    text: `Do you really want to remove song ${songs[selected].name}?`,
                    confirmButtonText: "Delete",
                    cancelButtonText: "Cancel",
                })
                    .then(result => {
                        if (result.isConfirmed && !closed) {
                            save(songs.filter((song, index) => index !== selected), true);
                        }
                    });
            });
            popup.find("#update-songs").on("click", () => {
                const editor = addSongs(songs, { overlay: true });
                editor.cb.then(result => {
                    if (result.isConfirmed) save(editor.songsData.songs, true);
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
