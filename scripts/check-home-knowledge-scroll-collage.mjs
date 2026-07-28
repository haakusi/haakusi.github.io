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

test('section 05 owns two long counter-moving knowledge rails', async () => {
    assert.equal((home.match(/data-knowledge-motion-stage(?:\s|>)/g) ?? []).length, 1);
    const rails = [...home.matchAll(/<div class="profile-knowledge-rail[^"]*" data-knowledge-rail="(forward|reverse)">([\s\S]*?)\n\s*<\/div>/g)];
    assert.equal(rails.length, 2);
    assert.deepEqual(rails.map((rail) => (rail[2].match(/data-knowledge-motion-item/g) ?? []).length), [11, 10]);
    assert.equal((home.match(/data-knowledge-motion-item/g) ?? []).length, 21);
    assert.doesNotMatch(home, /data-knowledge-rail="drift"|profile-knowledge-rail-drift/);
    assert.equal((home.match(/data-knowledge-board(?:\s|>)/g) ?? []).length, 1);
    assert.match(home, /class="profile-knowledge-motion"[^>]*aria-hidden="true"/);
    assert.ok((home.match(/profile-knowledge-motion-item-wide/g) ?? []).length >= 4);
    assert.ok((home.match(/profile-knowledge-motion-item-portrait/g) ?? []).length >= 6);

    const sources = [...home.matchAll(/data-knowledge-motion-item[^>]*>[\s\S]*?<img src="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(sources.length, 21);
    assert.equal(new Set(sources).size, 21, 'motion preview should not repeat imagery');
    for (const source of sources) await access(new URL(source, root));
});

test('knowledge motion travels far, holds, and hands off slowly', () => {
    const require = createRequire(import.meta.url);
    const { knowledgeSceneState, knowledgeState } = require('../profile-motion.js');

    const entry = knowledgeState(0);
    const middle = knowledgeState(0.4);
    const focus = knowledgeState(0.7);
    const hold = knowledgeState(0.76);
    const transition = knowledgeState(0.87);
    const archive = knowledgeState(0.95);
    assert.ok(entry.railA < -2000 && entry.railB >= 0 && entry.scale < 0.9);
    assert.ok(middle.railA < -500 && middle.railA > entry.railA + 800, 'upper rail should still be travelling at the middle of the scene');
    assert.ok(middle.railB > -1700 && middle.railB < -600, 'lower rail should still be travelling at the middle of the scene');
    assert.ok(focus.railA > entry.railA + 1900, 'upper rail should travel right across more than one viewport');
    assert.ok(focus.railB < entry.railB - 1900, 'lower rail should travel left across more than one viewport');
    assert.equal(focus.railOpacity, 1);
    assert.deepEqual(hold, focus, 'the two-row composition should remain readable before the handoff');
    assert.ok(transition.railOpacity > 0 && transition.railOpacity < 1);
    assert.ok(transition.boardOpacity > 0 && transition.boardOpacity < 1);
    assert.equal(transition.phase, 'archive');
    assert.equal(archive.railOpacity, 0);
    assert.equal(archive.boardOpacity, 1);
    assert.equal(archive.phase, 'archive');
    assert.equal('railC' in entry, false);

    assert.equal(knowledgeSceneState(0.5).opacity, 1);
    assert.equal(knowledgeSceneState(0.94).opacity, 1);
    assert.ok(knowledgeSceneState(1).opacity < 0.3);
});

test('desktop motion is bounded and all other modes keep the archive static', () => {
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-notes\s*\{[^}]*min-height:\s*clamp\([^}]*330svh/);
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-knowledge-motion\s*\{[^}]*opacity:\s*var\(--knowledge-rail-opacity/);
    assert.match(css, /\.profile-knowledge-rail-forward\s*\{[^}]*translate3d\(var\(--knowledge-rail-a-x/);
    assert.match(css, /\.profile-knowledge-rail-reverse\s*\{[^}]*translate3d\(var\(--knowledge-rail-b-x/);
    assert.doesNotMatch(css, /profile-knowledge-rail-drift|--knowledge-rail-c-x/);
    assert.match(css, /\[data-knowledge-phase="motion"\]\s+\.profile-knowledge-board\s*\{[^}]*visibility:\s*hidden/);
    assert.match(css, /@media\s*\(max-width:\s*1100px\)[\s\S]*?\.profile-knowledge-motion\s*\{[^}]*display:\s*none/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-knowledge-motion\s*\{[^}]*display:\s*none\s*!important/);
});
