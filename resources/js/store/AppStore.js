class AppStore {
    constructor() {
        if (AppStore.instance) {
            return AppStore.instance;
        }
        this._state = {
            playlists: [],
            searchTerm: "",
        };
        AppStore.instance = this;
    }

    getPlaylists() {
        const regex = new RegExp(this._state.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        const filtered = this._state.playlists.filter((element) => regex.test(element.name));
        return filtered;
    }
    getPlaylist(id) {
        if (isNaN(id) || id < 0) return null;
        return this.getPlaylists().find((element) => element.id == id);
    }

    setPlaylists(data) {
        if (
            !Array.isArray(data) ||
            !data.length ||
            data.some((element) => typeof element !== "object" || element === null)
        ) {
            return false;
        }
        this._state.playlists = [...data];
        return true;
    }

    updatePlaylist(data) {
        if (typeof data !== "object" || data === null || isNaN(data.id)) {
            return false;
        }
        const index = this._state.playlists.findIndex((element) => element.id == data.id);
        if (index == -1 || !data.name || !data.image) return false;
        this._state.playlists[index].name = data.name;
        this._state.playlists[index].image = data.image;
        return true;
    }

    getSongs(id) {
        const playlist = this.getPlaylist(id);
        return (!playlist || !Array.isArray(playlist.songs)) ? [] : [...playlist.songs];
    }


    setSongs(data) {
        if (typeof data !== "object" || data === null || isNaN(data.id) || !Array.isArray(data.songs)) {
            return false;
        }
        const index = this._state.playlists.findIndex((element) => element.id == data.id);
        if (index == -1 || !data.name || !data.image) return false;
        this._state.playlists[index].songs = [...data.songs];
        return true;
    }
    setSearchTerm(term) {
        this._state.searchTerm = String(term ?? "").trim();
    }
    static getInstance() {
        return AppStore.instance || new AppStore();
    }
}

exports.AppStore = AppStore;
