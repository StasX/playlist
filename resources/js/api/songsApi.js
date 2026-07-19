const $ = require("jquery");


const songsApi = {
    get: (id)=> $.get(`${location.origin}/playlist/${id}/songs`),
    update: (id, data) => $.ajax({ url: `${location.origin}/playlist/${id}/songs`, method: "PUT", data: JSON.stringify(data), cache: false }),
};

exports.songsApi = songsApi;
