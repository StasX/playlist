class AppStore {
    constructor() {
        if (AppStore.instance) {
            return AppStore.instance;
        }
        this._state = {
            playlists: [],
        };
        AppStore.instance = this;
    }

    getPlaylists(index) {
        if (index === undefined) return [...this._state.playlists];
        return this._state.playlists ? this._state.playlists[index] : null;
    }

    setPlaylists(data, index) {
        if (index === undefined) {
            this._state.playlists = Array.isArray(data) ? data : [];;
        } else if (data?.songs) {
            this._state.playlists[index] = data;
        } else {
            this._state.playlists[index].name = data?.name;
            this._state.playlists[index].image = data?.image;
        }
    }

    getSongs(playlistIndex, songIndex) {
        const playlist = this._state.playlists[playlistIndex];
        if (!playlist) return null;

        const songs = playlist.songs || [];

        if (songIndex === undefined) {
            return [...songs];
        }

        return songs[songIndex] ?? null;
    }

    setSongs(playlistIndex, data) {
        if (
            playlistIndex === undefined ||
            playlistIndex < 0 ||
            playlistIndex >= this._state.playlists.length
        ) {
            throw new Error("Can't set songs with these parameters");
        }

        this._state.playlists[playlistIndex].songs = Array.isArray(data) ? data : [];
    }
}
