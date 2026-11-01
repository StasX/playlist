const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AppStore } = require('../resources/js/store/AppStore');

const playlist = (id, name = 'Rock') => ({
    id, name, image: 'https://example.com/cover.jpg', songs: [],
});

test('new playlists retain their fields and support edit and deletion', () => {
    const store = new AppStore();
    store.setSearchTerm('');
    store.setPlaylists([]);
    const data = playlist(1);
    assert.equal(store.addPlaylist(data), true);
    assert.deepEqual(store.getPlaylists(), [data]);
    assert.notEqual(store.getPlaylist(1), data);
    assert.notEqual(store.getSongs(1), data.songs);
    assert.equal(store.addPlaylist(playlist('1')), false);
    assert.equal(store.getPlaylists().length, 1);
    assert.equal(store.updatePlaylist(playlist(1, 'Jazz')), true);
    assert.equal(store.getPlaylist(1).name, 'Jazz');
    assert.equal(store.removePlaylist('1'), true);
    assert.deepEqual(store.getPlaylists(), []);
});

test('search affects the displayed list without hiding records from ID lookup', () => {
    const store = new AppStore();
    const songs = [{ name: 'Song', url: 'https://example.com/song.mp3' }];
    store.setPlaylists([{ ...playlist(1), songs }, playlist(2, 'Jazz')]);
    store.setSearchTerm('Jazz');
    assert.deepEqual(store.getPlaylists().map(item => item.id), [2]);
    assert.equal(store.getPlaylist('1').name, 'Rock');
    assert.deepEqual(store.getSongs(1), songs);
    assert.equal(store.setSongs({ id: 1, songs: [] }), true);
    assert.deepEqual(store.getSongs(1), []);
    assert.equal(store.addPlaylist(playlist(3, 'Pop')), true);
    assert.deepEqual(store.getPlaylists().map(item => item.id), [2]);
    assert.equal(store.updatePlaylist(playlist(2, 'Blues')), true);
    assert.deepEqual(store.getPlaylists(), []);
    store.setSearchTerm('');
    assert.equal(store.getPlaylists().length, 3);
});

test('an empty server response clears existing state', () => {
    const store = new AppStore();
    store.setPlaylists([playlist(1)]);
    assert.equal(store.setPlaylists([]), true);
    assert.deepEqual(store.getPlaylists(), []);
    assert.equal(store.getPlaylist(1), undefined);
    assert.equal(store.setSongs({ id: 1, songs: [] }), false);
});
