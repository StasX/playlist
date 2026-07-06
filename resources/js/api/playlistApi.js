const  $ = require("jquery");


const playlistApi = {
    load:$.get(`${location.origin}/playlist`),
    add:(data)=>$.post(`${location.origin}/playlist`, JSON.stringify(data)),
};

exports.playlistApi = playlistApi;
