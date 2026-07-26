import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [home, css] = await Promise.all([
    read('index.html'),
    read('hybrid-profile.css'),
]);

test('research flows use one dotted rail with a visible node ball per step', () => {
    assert.match(css, /\.profile-research-flow::before\s*\{[^}]*repeating-linear-gradient\(/s);
    assert.match(css, /\.profile-research-flow li::before\s*\{/);
    assert.match(css, /\.profile-research-flow li::before\s*\{[^}]*border-radius:\s*50%/s);
    assert.doesNotMatch(css, /\.profile-research-flow li:not\(:last-child\)::after/);
    assert.doesNotMatch(css, /\.profile-research-flow[^}]*content:\s*[“”"']→[“”"']/s);
    assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-research-flow::before\s*\{[^}]*repeating-linear-gradient\(180deg/s);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-research-flow li::before/);
});

test('knowledge archive declares random image slots and a progressive enhancement script', () => {
    assert.match(home, /hybrid-profile\.css\?v=20260726-visual3/);
    assert.equal((home.match(/data-random-knowledge="writing"/g) ?? []).length, 2);
    assert.equal((home.match(/data-random-knowledge="reading"/g) ?? []).length, 3);
    assert.equal((home.match(/data-random-knowledge="coursework"/g) ?? []).length, 2);
    assert.match(home, /<script src="knowledge-randomizer\.js\?v=[^"]+"><\/script>/);
    assert.equal((home.match(/data-random-knowledge-card="writing"/g) ?? []).length, 2);
    assert.equal((home.match(/data-random-knowledge-title/g) ?? []).length, 2);
});

test('random image pools are local, extensible, and select without replacement', async () => {
    const require = createRequire(import.meta.url);
    const { KNOWLEDGE_IMAGE_POOLS, shuffleUnique, selectForSlots } = require('../knowledge-randomizer.js');

    assert.ok(KNOWLEDGE_IMAGE_POOLS.writing.length >= 3);
    assert.ok(KNOWLEDGE_IMAGE_POOLS.reading.length >= 7);
    assert.ok(KNOWLEDGE_IMAGE_POOLS.coursework.length >= 3);

    for (const [category, items] of Object.entries(KNOWLEDGE_IMAGE_POOLS)) {
        const paths = items.map((item) => item.src);
        assert.equal(new Set(paths).size, paths.length, `${category} contains duplicate paths`);
        for (const path of paths) {
            assert.match(path, /^(?:images\/|platform_architectures\.png$|og-banner\.png$)/, `${category} must use a local public asset`);
            await access(new URL(path, root));
        }
    }

    const ordered = ['a', 'b', 'c', 'd'];
    assert.deepEqual(shuffleUnique(ordered, () => 0), ['b', 'c', 'd', 'a']);
    const selected = selectForSlots(ordered, 4, () => 0.25);
    assert.equal(selected.length, 4);
    assert.equal(new Set(selected).size, 4);
    assert.deepEqual(ordered, ['a', 'b', 'c', 'd'], 'selection must not mutate the source pool');
});

test('a randomized writing visual keeps its destination and bilingual copy in sync', () => {
    const require = createRequire(import.meta.url);
    const { KNOWLEDGE_IMAGE_POOLS, applyKnowledgeEntry } = require('../knowledge-randomizer.js');
    const title = fakeElement();
    const summary = fakeElement();
    const date = fakeElement();
    const label = fakeElement();
    const card = fakeElement({
        '[data-random-knowledge-title]': title,
        '[data-random-knowledge-summary]': summary,
        '[data-random-knowledge-date]': date,
        '[data-random-knowledge-label]': label,
    });
    const item = KNOWLEDGE_IMAGE_POOLS.writing[1];

    applyKnowledgeEntry(card, item, 'kr');

    assert.equal(card.attributes.href, item.href);
    assert.equal(title.attributes['data-en'], item.title.en);
    assert.equal(title.attributes['data-kr'], item.title.kr);
    assert.equal(title.textContent, item.title.kr);
    assert.equal(summary.textContent, item.summary.kr);
    assert.equal(date.attributes.datetime, item.date);
    assert.equal(label.textContent, item.label);
});

function fakeElement(children = {}) {
    return {
        attributes: {},
        textContent: '',
        querySelector(selector) { return children[selector] ?? null; },
        setAttribute(name, value) { this.attributes[name] = String(value); },
    };
}
