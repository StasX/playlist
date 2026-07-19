
const { AppStore } = require("../../store/AppStore");

const { fail } = require("../../utils/messages/fail");
const { songsApi } = require("../../api/songsApi");
const { createModal } = require("./modal");

function createPlayer(element) {
    const index = element.closest(".card-container").index();
    const store = AppStore.getInstance();
    const playlists = store.getPlaylists();
    if (!(index >= 0 && index < playlists.length)) return fail();
    const playlist = playlists[index];
    playlist.songs ? createModal(playlist) : songsApi.get(playlist.id).done((data) => {
        playlist.songs = data.songs;
        createModal(playlist);
        store.setSongs({ ...playlist, songs: data.songs });
    }).fail(fail);
    
}

exports.createPlayer = createPlayer;
