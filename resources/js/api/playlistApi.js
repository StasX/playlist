const $ = require("jquery");


const playlistApi = {
    load: $.get(`${location.origin}/playlist`),
    add: (data) => $.post(`${location.origin}/playlist`, JSON.stringify(data)),
    remove: (id) => $.ajax({ url: `${location.origin}/playlist/${id}`, method: "DELETE", cache: false }),
    update: (data) => $.ajax({ url: `${location.origin}/playlist/${data.id}`, method: "PUT", data: JSON.stringify(data), cache: false }),
};

exports.playlistApi = playlistApi;
