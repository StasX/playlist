const $ = require("jquery");
const Swal = require('sweetalert2');
const { success } = require("../../utils/messages/success");
const { fail } = require("../../utils/messages/fail");
const { playlistApi } = require("../../api/playlistApi");
const { AppStore } = require("../../store/AppStore");
const {getParent} = require("../../utils/other/getParent");

function removePlaylist(element) {
    const index = getParent(element,9).index();
    const store = AppStore.getInstance();
    const playlists = store.getPlaylists();
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4500",
        cancelButtonColor: "#6d6968",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        const id = playlists[index].id;
        if (result.isConfirmed) (playlistApi.remove(id)).done(() => {
            store.removePlaylist(id);
            $("#main-container>div").eq(index).remove();
            success("Playlist has been successfully deleted.");
        }).fail(fail);

    });
}

exports.removePlaylist = removePlaylist;
