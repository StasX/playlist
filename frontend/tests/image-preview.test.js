const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
    const requests = [];
    const field = value => ({ value, events: {}, val() { return this.value; }, on(event, callback) { this.events[event] = callback; return this; } });
    const name = field('Playlist');
    const url = field('https://example.com/cover.png');
    const button = { prop(key, value) { this[key] = value; } };
    const image = Object.assign(field(''), {
        off() { this.events = {}; return this; },
        removeAttr() { delete this.src; return this; },
        attr(key, value) { this[key] = value; return this; },
    });
    const container = { visible: false, find: () => image, show() { this.visible = true; }, hide() { this.visible = false; } };
    const context = { exports: {}, require(id) {
        if (id === 'jquery') return { get(options) {
            const request = { options, done(callback) { this.success = callback; return this; }, abort() { this.aborted = true; } };
            requests.push(request);
            return request;
        } };
        return require(path.join(__dirname, '../resources/js/features/playlist', id));
    } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../resources/js/features/playlist/imagePreview.js'), 'utf8'), context);
    context.exports.setupImagePreview({ find: () => container }, url, name, {}, button);
    return { requests, name, url, button, image, container };
}

test('preview and confirmation wait for GET success and image load', () => {
    const h = harness();
    assert.equal(h.button.disabled, true);
    assert.equal(h.container.visible, false);
    h.name.events.input();
    assert.equal(h.button.disabled, true);
    h.requests[0].success();
    assert.equal(h.button.disabled, true);
    h.image.events.load();
    assert.equal(h.container.visible, true);
    assert.equal(h.button.disabled, false);
    h.image.events.error();
    assert.equal(h.container.visible, false);
    assert.equal(h.button.disabled, true);
});

test('changing the URL cancels requests and ignores stale success responses', () => {
    const h = harness();
    h.url.value = 'https://example.com/new.png';
    h.url.events.input();
    assert.equal(h.requests[0].aborted, true);
    h.requests[0].success();
    assert.equal(h.image.src, undefined);
    assert.equal(h.button.disabled, true);
    h.requests[1].success();
    h.image.events.load();
    assert.equal(h.button.disabled, false);
    h.url.value = '';
    h.url.events.input();
    assert.equal(h.button.disabled, true);
    assert.equal(h.container.visible, false);
    assert.equal(h.image.src, undefined);
    assert.equal(h.requests.length, 2);
});
