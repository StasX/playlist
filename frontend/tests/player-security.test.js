const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(songs, confirmDelete = false) {
    const selections = new Map();
    const nodes = [];
    const dialogs = [];
    const requests = [];
    const storeUpdates = [];
    let editor;
    function $(selector) {
        if (typeof selector === 'string' && selector.startsWith('<')) {
            assert.ok(['<audio/>', '<li>', '<i>'].includes(selector), 'Only static markup may be parsed');
        }
        const node = {
            selector, children: [], attributes: {}, events: {},
            0: { currentTime: 0, duration: NaN, volume: 1, paused: true, ended: false,
                play() { this.paused = false; return Promise.resolve(); },
                pause() { this.paused = true; }, load() { this.currentTime = 0; } },
            find(key) { if (!selections.has(key)) selections.set(key, $(key)); return selections.get(key); },
            text(value) { if (value === undefined) return this.value || ''; this.value = value; this.children = []; return this; },
            html(value) { assert.ok(!value.includes('<img')); this.markup = value; return this; },
            append(child) { assert.equal(typeof child, 'object'); this.children.push(child); return this; },
            prepend(child) { this.children.unshift(child); return this; },
            attr(key, value) { this.attributes[key] = value; return this; },
            removeAttr(key) { delete this.attributes[key]; return this; },
            prop(key, value) { this[key] = value; return this; },
            val(value) { if (value === undefined) return this.input; this.input = value; return this; },
            get() { return this[0]; },
            on(event, callback) { this.events[event] = callback; return this; },
            addClass() { return this; }, toggleClass() { return this; },
        };
        nodes.push(node);
        return node;
    }
    $.each = (items, callback) => {
        for (let index = 0; index < items.length; index++) {
            if (callback(index, items[index]) === false) break;
        }
    };
    const playlist = { id: 7, image: 'https://example.com/cover.jpg', songs };
    const context = {
        exports: {}, URL,
        require(id) {
            if (id === 'jquery') return $;
            if (id === 'sweetalert2') return {
                fire(options) { dialogs.push(options); if (options.didOpen) options.didOpen(); return Promise.resolve({ isConfirmed: confirmDelete && options.title === 'Delete selected song?' }); },
                getPopup() { return {}; },
            };
            if (id.endsWith('player.html')) return '';
            if (id.endsWith('playlistApi')) return { playlistApi: { update(id, data) {
                const request = { id, data, done(cb) { this.success = cb; return this; }, fail(cb) { this.failure = cb; return this; } };
                requests.push(request); return request;
            } } };
            if (id.endsWith('AppStore')) return { AppStore: { getInstance: () => ({ setSongs: data => storeUpdates.push(data) }) } };
            if (id.endsWith('songs/add')) return { addSongs(initial) { editor = { initial, songsData: { songs: [] } }; return { ...editor, cb: { then(cb) { editor.finish = cb; } } }; } };
            throw new Error(`Unexpected import: ${id}`);
        },
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../resources/js/features/player/modal.js'), 'utf8'), context);
    context.exports.createModal(playlist);
    return { selections, nodes, dialogs, requests, storeUpdates, playlist, get editor() { return editor; }, audio: nodes.find(n => n.selector === '<audio/>') };
}
const song = name => ({ name, url: `https://example.com/${name}.mp3` });

test('selects individual tracks, advances on ended, and stops at the last song', () => {
    const h = harness([song('one'), song('two')]);
    assert.equal(h.audio.attributes.src, song('one').url);
    h.selections.get('ol').children[1].events.click();
    assert.equal(h.audio.attributes.src, song('two').url);
    h.selections.get('ol').children[0].events.keydown({ key: 'Enter', preventDefault() {} });
    h.audio.events.ended();
    assert.equal(h.audio.attributes.src, song('two').url);
    h.audio[0].ended = true;
    h.audio.events.ended();
    assert.equal(h.audio.attributes.src, song('two').url);
    h.dialogs[0].willClose();
    assert.equal(h.audio[0].paused, true);
    assert.equal(h.audio.attributes.src, undefined);
});

test('song payloads remain text and unsafe URLs are never played', () => {
    const name = '<img src=x onerror="alert(1)">';
    const h = harness([{ name, url: 'https://example.com/song.mp3' }, { name: 'unsafe', url: 'javascript:alert(1)' }]);
    const rows = h.selections.get('ol').children;
    for (const event of ['play', 'pause']) { h.audio.events[event](); assert.equal(rows[0].value, name); }
    rows[1].events.click();
    assert.equal(h.audio.attributes.src, 'https://example.com/song.mp3');
    assert.equal(rows[1].attributes['aria-disabled'], 'true');
});

test('empty playlists do not crash and disable playback', () => {
    const h = harness([]);
    assert.equal(h.audio.attributes.src, undefined);
    assert.equal(h.selections.get('#play-pause').disabled, true);
    assert.equal(h.selections.get('#remove-song').disabled, true);
});

test('edits persist before updating the store and closing stops audio', () => {
    const h = harness([song('one')]);
    h.selections.get('#update-songs').events.click();
    assert.equal(h.audio[0].paused, true);
    assert.deepEqual(h.editor.initial, [song('one')]);
    h.editor.songsData.songs = [song('edited')];
    h.editor.finish({ isConfirmed: true });
    assert.equal(h.requests[0].id, 7);
    assert.equal(h.playlist.songs[0].name, 'one');
    h.requests[0].success();
    assert.equal(h.playlist.songs[0].name, 'edited');
    assert.equal(h.storeUpdates[0].songs[0].name, 'edited');
});

test('deleting the last song saves an empty playlist and updates the store', async () => {
    const h = harness([song('one')], true);
    h.selections.get('#remove-song').events.click();
    await Promise.resolve();
    assert.equal(h.requests[0].data.songs.length, 0);
    assert.equal(h.playlist.songs.length, 1);
    h.requests[0].success();
    assert.equal(h.playlist.songs.length, 0);
    assert.equal(h.storeUpdates[0].songs.length, 0);
});

test('failed saves preserve playlist and store data', () => {
    const h = harness([song('one')]);
    h.selections.get('#update-songs').events.click();
    h.editor.songsData.songs = [song('edited')];
    h.editor.finish({ isConfirmed: true });
    h.requests[0].failure();
    assert.equal(h.playlist.songs[0].name, 'one');
    assert.equal(h.storeUpdates.length, 0);
    assert.equal(h.dialogs.at(-1).icon, 'error');
});
