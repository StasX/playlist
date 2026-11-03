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
    const overlays = [];
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
            empty() { this.children = []; return this; },
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
            if (id.endsWith('songs/add')) return { addSongs(initial, options) { editor = { initial, options, songsData: { songs: [] } }; return { ...editor, cb: { then(cb) { editor.finish = cb; } } }; } };
            if (id.endsWith('songs/editorDialog')) return { createEditorDialog: () => ({ fire(options) {
                overlays.push(options);
                return Promise.resolve({ isConfirmed: confirmDelete });
            } }) };
            throw new Error(`Unexpected import: ${id}`);
        },
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../resources/js/features/player/modal.js'), 'utf8'), context);
    context.exports.createModal(playlist);
    return { selections, nodes, dialogs, overlays, requests, storeUpdates, playlist, get editor() { return editor; }, audio: nodes.find(n => n.selector === '<audio/>') };
}
const song = name => ({ name, url: `https://example.com/${name}.mp3` });

test('current row icon toggles playback without resetting the track', () => {
    const h = harness([song('one'), song('two')]);
    const row = h.selections.get('ol').children[0];
    h.audio[0].currentTime = 42;
    let stopped = false;
    row.children[0].events.click({ stopPropagation() { stopped = true; } });
    assert.equal(stopped, true);
    assert.equal(h.audio[0].paused, true);
    assert.equal(h.audio[0].currentTime, 42);
    h.audio.events.pause();
    assert.equal(row.children[0].attributes['aria-label'], 'Play song');
    row.children[0].events.keydown({ key: 'Enter', preventDefault() {}, stopPropagation() {} });
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.audio[0].currentTime, 42);
    assert.equal(h.audio.attributes.src, song('one').url);
    h.audio.events.play();
    assert.equal(row.children[0].attributes['aria-label'], 'Pause song');
});

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
    assert.equal(h.audio.attributes.src, undefined);
    assert.equal(h.audio[0].paused, true);
    assert.equal(rows[1].attributes['aria-current'], 'true');
    assert.equal(rows[1].attributes.tabindex, '0');
    assert.equal(h.selections.get('#remove-song').disabled, false);
    assert.equal(h.selections.get('#play-pause').disabled, true);
    h.selections.get('#audio-play-pause').events.click();
    assert.equal(h.audio[0].paused, true);
    rows[0].events.click();
    assert.equal(h.audio.attributes.src, 'https://example.com/song.mp3');
    assert.equal(h.selections.get('#play-pause').disabled, false);
});

test('empty playlists do not crash and disable playback', () => {
    const h = harness([]);
    assert.equal(h.audio.attributes.src, undefined);
    assert.equal(h.selections.get('#play-pause').disabled, true);
    assert.equal(h.selections.get('#remove-song').disabled, true);
});

test('editing opens an overlay while audio continues and saves update the existing player', () => {
    const h = harness([song('one')]);
    h.selections.get('#update-songs').events.click();
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.editor.options.overlay, true);
    assert.deepEqual(h.editor.initial, [song('one')]);
    h.editor.songsData.songs = [song('edited')];
    h.editor.finish({ isConfirmed: true });
    assert.equal(h.requests[0].id, 7);
    assert.equal(h.playlist.songs[0].name, 'one');
    h.requests[0].success();
    assert.equal(h.playlist.songs[0].name, 'edited');
    assert.equal(h.storeUpdates[0].songs[0].name, 'edited');
    assert.equal(h.dialogs.length, 1);
    assert.equal(h.audio[0].paused, false);
});

test('removing the last song shows a message and preserves playback', async () => {
    const h = harness([song('one')], true);
    h.selections.get('#remove-song').events.click();
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.dialogs.length, 1);
    await Promise.resolve();
    assert.equal(h.requests.length, 0);
    assert.equal(h.playlist.songs.length, 1);
    assert.equal(h.storeUpdates.length, 0);
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.overlays.length, 0);
    assert.match(h.selections.get('#player-message').value, /At least one song/);
    assert.equal(h.selections.get('#player-message').hidden, false);
    assert.equal(h.dialogs.length, 1);
});

test('canceling song deletion keeps the player and playback position', async () => {
    const h = harness([song('one'), song('two')]);
    h.audio[0].currentTime = 42;
    h.selections.get('#remove-song').events.click();
    await Promise.resolve();
    assert.equal(h.requests.length, 0);
    assert.equal(h.dialogs.length, 1);
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.audio[0].currentTime, 42);
});

test('deleting the current song selects a remaining track in the same player', async () => {
    const h = harness([song('one'), song('two')], true);
    h.selections.get('#remove-song').events.click();
    await Promise.resolve();
    assert.equal(h.audio.attributes.src, song('one').url);
    h.requests[0].success();
    assert.equal(h.audio.attributes.src, song('two').url);
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.dialogs.length, 1);
});

test('failed saves preserve playlist and store data', () => {
    const h = harness([song('one')]);
    h.selections.get('#update-songs').events.click();
    h.editor.songsData.songs = [song('edited')];
    h.editor.finish({ isConfirmed: true });
    h.requests[0].failure();
    assert.equal(h.playlist.songs[0].name, 'one');
    assert.equal(h.storeUpdates.length, 0);
    assert.match(h.selections.get('h5').value, /could not be saved/);
    assert.equal(h.dialogs.length, 1);
    assert.equal(h.audio[0].paused, false);
});

test('canceling edits preserves the playing track and position', () => {
    const h = harness([song('one')]);
    h.audio[0].currentTime = 42;
    h.selections.get('#update-songs').events.click();
    h.editor.finish({ isConfirmed: false });
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.audio[0].currentTime, 42);
    assert.equal(h.dialogs.length, 1);
    assert.equal(h.requests.length, 0);
});

test('saving a renamed current track preserves playback position', () => {
    const h = harness([song('one')]);
    h.audio[0].currentTime = 42;
    h.selections.get('#update-songs').events.click();
    h.editor.songsData.songs = [{ ...song('one'), name: 'Renamed' }];
    h.editor.finish({ isConfirmed: true });
    h.requests[0].success();
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.audio[0].currentTime, 42);
    assert.equal(h.selections.get('ol').children[0].value, 'Renamed');
    assert.equal(h.dialogs.length, 1);
});

test('an invalid stored song can be selected with the keyboard and deleted when another remains', async () => {
    const h = harness([{ name: 'Broken', url: 'not a URL' }, song('valid')], true);
    h.selections.get('ol').children[0].events.keydown({ key: 'Enter', preventDefault() {} });
    assert.equal(h.selections.get('#remove-song').disabled, false);
    assert.equal(h.audio.attributes.src, undefined);
    assert.equal(h.audio[0].paused, true);
    h.selections.get('#remove-song').events.click();
    await Promise.resolve();
    assert.equal(h.requests[0].data.songs.length, 1);
    h.requests[0].success();
    assert.equal(h.playlist.songs.length, 1);
    assert.equal(h.storeUpdates[0].songs.length, 1);
});
