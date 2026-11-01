const $ = require("jquery");


const playlistApi = {
    load: $.get(`${location.origin}/api/playlist`),
    add: (data) => $.post(`${location.origin}/api/playlist`, JSON.stringify(data)),
    remove: (id) => $.ajax({ url: `${location.origin}/api/playlist/${id}`, method: "DELETE", cache: false }),
    update: (id, data) => $.ajax({ url: `${location.origin}/api/playlist/${id}`, method: "PUT", data: JSON.stringify(data), cache: false }),
};

exports.playlistApi = playlistApi;
