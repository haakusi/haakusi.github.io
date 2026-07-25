import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [index, common, css, portfolio, cv, research, notes, sharedCss] = await Promise.all([
    read('index.html'),
    read('common.js'),
    read('hybrid-profile.css'),
    read('portfolio.html'),
    read('cv.html'),
    read('research.html'),
    read('notes.html'),
    read('career-system.css'),
]);
const publicCareerCopy = [index, portfolio, cv, research, notes].join('\n').replaceAll('&amp;', '&');

test('homepage follows an industry-first editorial journey', () => {
    const anchors = ['identity', 'work', 'method', 'research', 'career', 'notes', 'contact'];
    const positions = anchors.map((id) => index.indexOf(`id="${id}"`));
    assert.ok(positions.every((position) => position > -1));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.ok(index.indexOf('8 YEARS') < index.indexOf('ACTIVE RESEARCH'));
    assert.doesNotMatch(index, /id="(?:media|capability|mentoring|archive)"/);
});

test('homepage opening pairs a readable statement with a concise current ledger', () => {
    for (const className of ['profile-hero-intro', 'profile-hero-statement', 'profile-now', 'profile-evidence']) {
        assert.match(index, new RegExp(`class="[^"]*${className}`));
    }
    assert.equal((index.match(/class="profile-now"/g) ?? []).length, 1);
    assert.equal((index.match(/<article><strong(?:\s+class="profile-evidence-wide")?>/g) ?? []).length, 4);
    assert.match(css, /\.profile-hero\s*\{[^}]*grid-template-areas:/);
    assert.match(css, /word-break:\s*keep-all/);
});

test('home leads with current public-safe evidence and exact project status', () => {
    for (const phrase of ['1 / 8', '~200K LOC', '40%+', '2026.07—PRESENT', 'Developer Portal']) {
        assert.ok(index.includes(phrase), `missing public evidence: ${phrase}`);
    }
    assert.match(index, /ACTIVE RESEARCH · TRACK 01/);
    assert.match(index, /ACTIVE RESEARCH · TRACK 02/);
    assert.doesNotMatch(index, /특별승진|special promotion|19 months after joining|입사\s*19개월/i);
});

test('home avoids temporary award galleries and decorative system atlases', () => {
    assert.doesNotMatch(index, /award|수상|우수상|혁신상|전사|software-ribbon|SYSTEM ATLAS/i);
    assert.doesNotMatch(index, /images\/career\/samples/);
});

test('notes hub routes every public learning format without calling it publication', () => {
    for (const href of ['blog.html', 'reading.html', 'lectures.html']) {
        assert.match(notes, new RegExp(`href="${href}"`));
    }
    assert.match(notes, /knowledge layer behind the CV/);
    assert.match(notes, /논문과 구분해/);
});

test('latest public surfaces keep the strongest ownership story and omit weak claims', () => {
    assert.doesNotMatch(publicCareerCopy, /Technical Support chatbot|Global Technical Support|\bSolis\b|RabbitMQ/i);
    for (const phrase of ['Developer Portal', '20만 LOC', '40%']) {
        assert.ok(publicCareerCopy.includes(phrase), `missing career evidence: ${phrase}`);
    }
});

test('shared runtime extends the visual system to knowledge detail pages', () => {
    assert.match(common, /career-system\.css/);
    assert.match(common, /knowledge-page/);
    assert.match(sharedCss, /body\.knowledge-page/);
});

test('hybrid style is monochrome, token-driven, responsive, and motion-safe', () => {
    assert.match(css, /var\(--skin-/);
    assert.doesNotMatch(css, /Georgia|Times New Roman|--home-warm/i);
    assert.match(css, /--profile-accent:/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /animation-timeline:\s*view\(\)/);
});

test('all public knowledge detail pages load the common runtime', async () => {
    const rootFiles = await readdir(root);
    const detailPages = rootFiles.filter((name) => /^blog\d+\.html$|^reading-book-.*\.html$/.test(name));

    async function walkLectureHtml(directory) {
        const entries = await readdir(directory, { withFileTypes: true });
        const nested = await Promise.all(entries.map(async (entry) => {
            const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
            if (entry.isDirectory()) return walkLectureHtml(url);
            return entry.name.endsWith('.html') ? [url] : [];
        }));
        return nested.flat();
    }

    const lecturePages = await walkLectureHtml(new URL('lectures/', root));
    assert.ok(detailPages.length >= 10);
    assert.ok(lecturePages.length >= 20);
    for (const path of detailPages) assert.match(await read(path), /<script\s+src="common\.js"><\/script>/);
    for (const url of lecturePages) {
        const html = await readFile(url, 'utf8');
        if (/<meta\s+http-equiv="refresh"/i.test(html)) continue;
        assert.match(html, /<script\s+src="(?:\.\.\/)+common\.js"><\/script>/);
    }
});
