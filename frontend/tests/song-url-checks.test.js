const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('song URL checks require audio metadata, cache results, and stop on close', () => {
    let changes = 0;
    const audio = [];
    const context = { exports: {}, setTimeout: () => 1, clearTimeout() {}, Audio: class {
        constructor() { audio.push(this); }
        removeAttribute(key) { delete this[key]; }
        load() {}
    } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../resources/js/features/songs/urlChecks.js'), 'utf8'), context);
    const checks = context.exports.createUrlChecks(() => changes++);
    const oldUrl = 'https://example.com/old.mp3';
    const newUrl = 'https://example.com/new.mp3';
    assert.equal(checks.isVerified(oldUrl), false);
    assert.equal(checks.isVerified(oldUrl), false);
    assert.equal(audio.length, 1);
    assert.equal(audio[0].preload, 'metadata');
    assert.equal(checks.isVerified(newUrl), false);
    audio[0].onloadedmetadata();
    assert.equal(checks.isVerified(oldUrl), true);
    assert.equal(checks.isVerified(newUrl), false);
    assert.equal(checks.isVerified(newUrl), false);
    audio[1].onerror();
    assert.equal(changes, 2);
    const mediaUrl = 'http://example.com/cross-origin.mp3';
    assert.equal(checks.isVerified(mediaUrl), false);
    audio[2].onloadedmetadata();
    assert.equal(checks.isVerified(mediaUrl), true);
    assert.equal(changes, 3);
    checks.isVerified('https://example.com/pending.mp3');
    const lateSuccess = audio[3].onloadedmetadata;
    checks.dispose();
    lateSuccess();
    assert.equal(changes, 3);
    assert.ok(audio.every(element => element.src === undefined));
    assert.equal(checks.isVerified(oldUrl), false);
});
