import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [home, css] = await Promise.all([
    read('index.html'),
    read('hybrid-profile.css'),
]);

test('research turns two public questions into animated five-node architecture flows', () => {
    assert.equal((home.match(/data-public-research-flow/g) ?? []).length, 2);
    assert.equal((home.match(/data-research-node/g) ?? []).length, 10);
    assert.equal((home.match(/data-research-question/g) ?? []).length, 2);
    assert.match(home, /Research question/);
    assert.match(home, /연구 질문/);
    assert.match(css, /\.profile-research-flow::before/);
    assert.match(css, /@keyframes\s+profile-research-signal/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-research-flow::before/);
});

test('career story combines the eight-year timeline with an original boundary visual', async () => {
    assert.match(home, /data-career-visual/);
    assert.equal((home.match(/data-career-marker/g) ?? []).length, 3);
    assert.match(home, /images\/career\/identity\/career-boundaries-journey-v1\.webp/);
    assert.match(css, /\.profile-career-story\s*\{/);
    assert.match(css, /\.profile-career-visual\s*\{/);
    const info = await stat(new URL('images/career/identity/career-boundaries-journey-v1.webp', root));
    assert.ok(info.size > 60_000, `career visual is unexpectedly small: ${info.size}`);
});

test('writing reading and coursework all carry visible image-led previews', async () => {
    for (const source of ['WRITING', 'READING', 'COURSEWORK']) {
        assert.match(home, new RegExp(`data-knowledge-image="${source.toLowerCase()}"`));
    }
    for (const asset of [
        'images/knowledge/writing-ai-lecture-notes-v1.webp',
        'images/knowledge/graduate-coursework-v1.webp',
        'images/lectures/data-visualization/week-08/a1-final-preview.png',
    ]) {
        assert.ok(home.includes(asset), `missing knowledge image: ${asset}`);
    }
    assert.match(css, /\.profile-knowledge-visual\s*\{/);
    assert.match(css, /\.profile-coursework-visual\s*\{/);
    assert.match(css, /\.profile-knowledge-card:hover[\s\S]*?\.profile-knowledge-visual img/);
    for (const asset of [
        'images/knowledge/writing-ai-lecture-notes-v1.webp',
        'images/knowledge/graduate-coursework-v1.webp',
    ]) {
        const info = await stat(new URL(asset, root));
        assert.ok(info.size > 60_000, `${asset} is unexpectedly small: ${info.size}`);
    }
});

test('visual stories preserve mobile and reduced-motion fallbacks', () => {
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-career-story/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-research-flow::before/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-career-visual img/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-knowledge-visual img/);
});
