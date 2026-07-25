import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [home, common, research, notes, sitemap, css] = await Promise.all([
    read('index.html'),
    read('common.js'),
    read('research.html'),
    read('notes.html').catch(() => ''),
    read('sitemap.xml'),
    read('hybrid-profile.css').catch(() => ''),
]);

test('primary navigation is a five-route industry and research profile', () => {
    const expected = [
        ["href: 'index.html'", "en: 'Home'"],
        ["href: 'portfolio.html'", "en: 'Work'"],
        ["href: 'research.html'", "en: 'Research'"],
        ["href: 'cv.html'", "en: 'CV'"],
        ["href: 'notes.html'", "en: 'Notes'"],
    ];
    const positions = expected.map(([href, label]) => {
        const hrefAt = common.indexOf(href);
        assert.ok(hrefAt > -1, `missing ${href}`);
        assert.ok(common.indexOf(label, hrefAt) > hrefAt, `missing ${label}`);
        return hrefAt;
    });
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.equal((common.match(/href: '[^']+\.html'/g) ?? []).length, 5);
    assert.match(common, /item\.href === 'notes\.html'[\s\S]*?(?:blog|lectures|reading)/);
});

test('home presents eight years of engineering before active research', () => {
    const order = ['identity', 'work', 'research', 'career', 'notes', 'contact'];
    const positions = order.map((id) => {
        const at = home.indexOf(`id="${id}"`);
        assert.ok(at > -1, `missing #${id}`);
        return at;
    });
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.ok(home.indexOf('8 YEARS') < home.indexOf('ACTIVE RESEARCH'));
    for (const phrase of [
        'Eight years building from device to platform.',
        '장치에서 플랫폼까지 쌓은 8년.',
        'ACTIVE RESEARCH',
        '진행 중인 연구',
        '2026.07—PRESENT',
    ]) assert.ok(home.includes(phrase), `missing home statement: ${phrase}`);
    assert.doesNotMatch(home, /id="(?:media|capability|mentoring|archive)"/);
    assert.match(home, /href="hybrid-profile\.css\?v=[^"]+"/);
    assert.doesNotMatch(home, /home-motion\.js|home-style\.css/);
});

test('notes is a bilingual hub for writing, reading, and coursework', () => {
    assert.match(notes, /<body class="[^\"]*notes-page/);
    assert.match(notes, /<main id="notes-main"/);
    for (const [href, label] of [
        ['blog.html', 'Writing'],
        ['reading.html', 'Reading'],
        ['lectures.html', 'Coursework'],
    ]) {
        assert.match(notes, new RegExp(`href="${href}"[\\s\\S]*?${label}`));
    }
    assert.match(notes, /data-en="[^"]+"\s+data-kr="[^"]+"/);
    assert.ok(sitemap.includes('<loc>https://haakusi.github.io/notes.html</loc>'));
});

test('research exposes honest maturity states that can grow into publications', () => {
    assert.equal((research.match(/data-research-status="active"/g) ?? []).length, 2);
    for (const stage of ['Active question', 'Experiment', 'Manuscript', 'Preprint', 'Published']) {
        assert.ok(research.includes(stage), `missing research maturity stage: ${stage}`);
    }
    assert.match(research, /Only completed artifacts are linked/);
    assert.match(research, /완료된 결과물만 링크/);
});

test('hybrid profile remains readable and motion-safe across themes and widths', () => {
    for (const token of ['--profile-max', '--profile-rail', '--profile-accent']) {
        assert.ok(css.includes(token), `missing ${token}`);
    }
    assert.match(css, /@media\s*\(max-width:\s*900px\)/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /word-break:\s*keep-all/);
});
