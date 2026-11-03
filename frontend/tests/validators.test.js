const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { validHttpUrl } = require('../resources/js/utils/validators/url');
const { validatePlaylistForm } = require('../resources/js/utils/validators/playlistForm');

const context = {
    exports: {},
    require(id) {
        if (id === 'jquery') return element => element;
        if (id === './url') return { validHttpUrl };
        throw new Error(`Unexpected import: ${id}`);
    },
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../resources/js/utils/validators/songsForm.js'), 'utf8'), context);
const { validateSongsForm } = context.exports;
const field = value => ({ val: () => value, data() {}, toggleClass(key, enabled) { this[key] = enabled; } });
const button = () => ({ prop(key, value) { this[key] = value; } });

const validUrls = [
    'https://cdn.example.com/song.mp3?signature=a%2Fb&expires=123',
    'https://example.com/stream/123',
    'https://example.com/image?width=200',
    'http://localhost:8000/media',
    'https://media.technology/audio',
    'https://127.0.0.1:8443/cover.webp',
];
const invalidUrls = ['', '/media/123', '//example.com/song', 'not a URL', 'https://',
    'https:/example.com/song', 'https://example.com/a b', 'https://example.com:99999/song',
    'javascript:alert(1)', 'data:audio/mpeg;base64,AAAA', 'file:///song.mp3', 'ftp://example.com/song.mp3'];

for (const [expected, urls] of [[true, validUrls], [false, invalidUrls]]) {
    for (const url of urls) {
        test(`song and playlist forms ${expected ? 'accept' : 'reject'} ${JSON.stringify(url)}`, () => {
            const playlist = {};
            const playlistButton = button();
            validatePlaylistForm(field('Playlist'), field(url), playlist, playlistButton);
            assert.equal(playlistButton.disabled, !expected);
            if (expected) assert.equal(playlist.image, url);

            const data = { songs: [] };
            const songButton = button();
            const row = { find: selector => field(selector === '.song-name' ? 'Song' : url) };
            const popup = { find: () => ({ each(callback) { callback(0, row); } }) };
            validateSongsForm(popup, data, songButton);
            assert.equal(songButton.disabled, !expected);
            assert.equal(data.songs.length, expected ? 1 : 0);
            if (expected) assert.equal(data.songs[0].url, url);
        });
    }
}
