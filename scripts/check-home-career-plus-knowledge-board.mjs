import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [home, domainCss, profileCss] = await Promise.all([
    read('index.html'),
    read('home-domain-map.css'),
    read('hybrid-profile.css'),
]);

test('career map distinguishes five career domains from one doctoral exploration path', () => {
    assert.equal((home.match(/data-domain-node(?:\s|>)/g) ?? []).length, 5);
    assert.equal((home.match(/data-domain-exploration(?:\s|>)/g) ?? []).length, 1);
    assert.match(home, /Five career domains—and one growing research path\./);
    assert.match(home, /다섯 개의 경력 도메인, 그리고 하나의 확장 중인 연구 경로\./);
    assert.match(home, /5 CAREER DOMAINS \+ DOCTORAL EXPLORATION/);
    assert.match(home, /<span aria-hidden="true">\+<\/span>/);
    assert.match(home, /Doctoral research &amp; exploration/);
    assert.match(home, /박사과정 연구·탐구/);
    assert.doesNotMatch(home, /SIX CAREER CHAPTERS|여섯 개의 경력 챕터|Applied AI &amp; Quantum Research|응용 AI·양자 연구/);
    assert.match(domainCss, /\.profile-domain-node-plus\s*\{/);
});

test('public notes use concrete accumulation language and preview multiple knowledge sources', () => {
    assert.match(home, /Knowledge, accumulated one note at a time\./);
    assert.match(home, /읽고 배우며, 지식을 차곡차곡 쌓습니다\./);
    assert.equal((home.match(/data-knowledge-preview(?:\s|>)/g) ?? []).length, 4);
    for (const route of ['blog5.html', 'blog4.html', 'reading.html', 'lectures.html']) {
        assert.ok(home.includes(`href="${route}"`), `missing knowledge route: ${route}`);
    }
    assert.equal((home.match(/images\/books\//g) ?? []).length, 3);
    assert.match(profileCss, /\.profile-knowledge-board\s*\{/);
    assert.match(profileCss, /\.profile-reading-stack\s*\{/);
});

test('knowledge previews remain accessible and responsive', () => {
    assert.match(profileCss, /\.profile-knowledge-card:focus-visible/);
    assert.match(profileCss, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-knowledge-board/);
    assert.match(profileCss, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-reading-stack/);
    assert.match(profileCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-knowledge-card/);
});
