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

test('section 05 owns one semantic counter-moving knowledge preview', async () => {
    assert.equal((home.match(/data-knowledge-motion-stage(?:\s|>)/g) ?? []).length, 1);
    assert.equal((home.match(/data-knowledge-rail="(?:forward|reverse|drift)"/g) ?? []).length, 3);
    assert.equal((home.match(/data-knowledge-motion-item/g) ?? []).length, 21);
    assert.equal((home.match(/data-knowledge-board(?:\s|>)/g) ?? []).length, 1);
    assert.match(home, /class="profile-knowledge-motion"[^>]*aria-hidden="true"/);
    assert.ok((home.match(/profile-knowledge-motion-item-wide/g) ?? []).length >= 4);
    assert.ok((home.match(/profile-knowledge-motion-item-portrait/g) ?? []).length >= 6);

    const sources = [...home.matchAll(/data-knowledge-motion-item[^>]*>[\s\S]*?<img src="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(sources.length, 21);
    assert.equal(new Set(sources).size, 21, 'motion preview should not repeat imagery');
    for (const source of sources) await access(new URL(source, root));
});

test('knowledge motion has entry, convergence, and archive phases', () => {
    const require = createRequire(import.meta.url);
    const { knowledgeSceneState, knowledgeState } = require('../profile-motion.js');

    const entry = knowledgeState(0);
    const focus = knowledgeState(0.34);
    const archive = knowledgeState(0.72);
    assert.ok(entry.railA < -800 && entry.railB > 800 && entry.railC < -500 && entry.scale < 0.9);
    assert.ok(Math.abs(focus.railA) < Math.abs(entry.railA) && Math.abs(focus.railB) < Math.abs(entry.railB) && Math.abs(focus.railC) < Math.abs(entry.railC));
    assert.equal(focus.railOpacity, 1);
    assert.equal(archive.railOpacity, 0);
    assert.equal(archive.boardOpacity, 1);
    assert.equal(archive.phase, 'archive');

    assert.equal(knowledgeSceneState(0.5).opacity, 1);
    assert.equal(knowledgeSceneState(0.82).opacity, 1);
    assert.ok(knowledgeSceneState(1).opacity < 0.3);
});

test('desktop motion is bounded and all other modes keep the archive static', () => {
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-notes\s*\{[^}]*min-height:\s*clamp\([^}]*245svh/);
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-knowledge-motion\s*\{[^}]*opacity:\s*var\(--knowledge-rail-opacity/);
    assert.match(css, /\.profile-knowledge-rail-forward\s*\{[^}]*translate3d\(var\(--knowledge-rail-a-x/);
    assert.match(css, /\.profile-knowledge-rail-reverse\s*\{[^}]*translate3d\(var\(--knowledge-rail-b-x/);
    assert.match(css, /\.profile-knowledge-rail-drift\s*\{[^}]*translate3d\(var\(--knowledge-rail-c-x/);
    assert.match(css, /\[data-knowledge-phase="motion"\]\s+\.profile-knowledge-board\s*\{[^}]*visibility:\s*hidden/);
    assert.match(css, /@media\s*\(max-width:\s*1100px\)[\s\S]*?\.profile-knowledge-motion\s*\{[^}]*display:\s*none/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-knowledge-motion\s*\{[^}]*display:\s*none\s*!important/);
});
