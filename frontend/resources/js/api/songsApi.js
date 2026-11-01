const $ = require("jquery");


const songsApi = {
    get: (id)=> $.get(`${location.origin}/api/playlist/${id}/songs`),
    update: (id, data) => $.ajax({ url: `${location.origin}/api/playlist/${id}/songs`, method: "POST", data: JSON.stringify(data), cache: false }),
};

exports.songsApi = songsApi;
