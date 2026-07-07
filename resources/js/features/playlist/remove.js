const $ = require("jquery");
const Swal = require('sweetalert2');
const { success } = require("../../utils/messages/success");
const { fail } = require("../../utils/messages/fail");
const { playlistApi } = require("../../api/playlistApi");


function removePlaylist(playlists, element) {
    const index = element.parent().parent().parent().parent().index();
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
            playlists.splice(index, 1);
            $("#main-container>div").eq(index).remove();
            success("Playlist has been successfully deleted.");
        }).fail(fail);

    });
}

exports.removePlaylist = removePlaylist;
