const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('song payloads remain text in the list and during play/pause', () => {
    const name = '<img src=x onerror="alert(1)">';
    const url = 'https://example.com/song.mp3\"><img src=x onerror="alert(2)">';
    const nodes = [];
    const selections = new Map();
    const events = {};
    function $(selector) {
        if (typeof selector === 'string' && selector.startsWith('<')) {
            assert.ok(['<audio/>', '<li>', '<source>', '<i>'].includes(selector), 'Only static markup may be parsed');
        }
        const node = {
            selector, children: [], attributes: {},
            0: { currentTime: 0 },
            find(key) {
                if (!selections.has(key)) selections.set(key, $(key));
                return selections.get(key);
            },
            text(value) { this.value = value; this.children = []; return this; },
            html(value) { assert.ok(!value.includes(name) && !value.includes(url)); return this; },
            append(child) { assert.equal(typeof child, 'object'); this.children.push(child); return this; },
            prepend(child) { this.children.unshift(child); return this; },
            attr(key, value) { this.attributes[key] = value; return this; },
            get() { return this[0]; },
            on(event, callback) { if (selector === '<audio/>') events[event] = callback; return this; },
        };
        for (const method of ['ready', 'click', 'css', 'val', 'addClass', 'removeClass']) {
            node[method] = () => node;
        }
        nodes.push(node);
        return node;
    }
    $.each = (items, callback) => items.forEach((item, index) => callback(index, item));
    const context = {
        exports: {}, URL, setInterval() {}, clearInterval() {},
        require(id) {
            if (id === 'jquery') return $;
            if (id === 'sweetalert2') return { fire(options) { options.didOpen(); }, getPopup() { return {}; } };
            if (id.endsWith('player.html')) return '';
            throw new Error(`Unexpected import: ${id}`);
        },
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../resources/js/features/player/modal.js'), 'utf8'), context);
    context.exports.createModal({ image: 'https://example.com/cover.jpg', songs: [
        { name, url },
        { name: 'Unsafe', url: 'javascript:alert(3)' },
        { name: 'Invalid', url: 'not a URL' },
        { name: 'Data', url: 'data:text/html,<script>alert(4)</script>' },
    ] });
    assert.equal(selections.get('ol').children[0].value, name);
    const sources = nodes.filter(node => node.selector === '<source>');
    assert.equal(sources.length, 1);
    assert.equal(sources[0].attributes.src, new URL(url).href);
    for (const event of ['play', 'pause']) {
        events[event]();
        const row = selections.get('li:nth-child(1)');
        assert.equal(row.value, name);
        assert.equal(row.children.length, 1);
        assert.equal(row.children[0].selector, '<i>');
    }
});
