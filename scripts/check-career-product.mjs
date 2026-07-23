import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const readOptional = (path) => read(path).catch(() => '');
const rootPages = [
    'index.html',
    'portfolio.html',
    'cv.html',
    'research.html',
    'blog.html',
    'lectures.html',
    'reading.html',
];
const pages = Object.fromEntries(await Promise.all(
    rootPages.map(async (path) => [path, await read(path)])
));
const common = await read('common.js');
const css = await readOptional('career-system.css');
const sitemap = await readOptional('sitemap.xml');
const robots = await readOptional('robots.txt');
const notFound = await readOptional('404.html');
const readme = await readOptional('README.md');

test('all seven root surfaces use the shared bilingual career shell', () => {
    for (const [name, html] of Object.entries(pages)) {
        assert.match(html, /<html\s+lang="en"\s+data-theme=/, `${name} needs an initial document language`);
        assert.match(html, /class="[^"]*\bcareer-skip\b[^"]*"/, `${name} needs a skip link`);
        assert.match(html, /<main\s+id="[^"]+"/, `${name} needs a named main landmark`);
        const sharedIndex = html.search(/href="career-system\.css(?:\?[^\"]*)?"/);
        assert.ok(sharedIndex > -1, `${name} must load career-system.css`);
        assert.ok(sharedIndex > html.lastIndexOf('rel="stylesheet"', sharedIndex - 1), `${name} must load shared styles last`);

        const localizedTags = html.match(/<[^>]*\bdata-en="[^"]*"[^>]*>/g) ?? [];
        assert.ok(localizedTags.length >= 4, `${name} needs meaningful bilingual content`);
        for (const tag of localizedTags) {
            assert.match(tag, /\bdata-kr="[^"]*"/, `${name} has an unpaired bilingual element`);
        }
    }
    for (const name of ['blog.html', 'lectures.html', 'reading.html']) {
        assert.match(pages[name], /<body class="[^"]*archive-page[^"]*"/, `${name} needs archive-page styling`);
    }
});

test('navigation prioritizes career evidence before the public archives', () => {
    const order = [
        "href: 'index.html'",
        "href: 'portfolio.html'",
        "href: 'cv.html'",
        "href: 'research.html'",
        "href: 'blog.html'",
        "href: 'lectures.html'",
        "href: 'reading.html'",
    ].map((needle) => common.indexOf(needle));
    assert.ok(order.every((position) => position > -1), 'all seven navigation items must exist');
    assert.deepEqual(order, [...order].sort((a, b) => a - b), 'career navigation order is incorrect');
    assert.match(common, /rel="me noreferrer"/, 'professional social links need identity and referrer semantics');
    assert.match(common, /updateToggleLabels/, 'theme and language controls need state-aware labels');
});

test('home communicates identity, evidence, and conservative profile structured data', () => {
    const home = pages['index.html'];
    const decodedHome = home.replaceAll('&amp;', '&');
    for (const id of ['identity', 'media', 'work', 'capability', 'journey', 'mentoring', 'research', 'archive', 'contact']) {
        assert.match(home, new RegExp(`id="${id}"`));
    }
    for (const phrase of [
        'AI-native platform and product engineering',
        'Platform engineer who understands the device beneath the API.',
        'One engineer, eight weeks',
        '장치 패킷부터',
        'API 아래의 장치까지 이해하는 플랫폼 엔지니어.',
        '1인 8주',
    ]) {
        assert.ok(decodedHome.includes(phrase), `missing identity/evidence phrase: ${phrase}`);
    }
    assert.match(home, /type="application\/ld\+json"/);
    assert.match(home, /"@type"\s*:\s*"ProfilePage"/);
    assert.match(home, /"mainEntity"\s*:\s*\{/);
    assert.match(home, /"@type"\s*:\s*"Person"/);
    assert.match(home, /github\.com\/haakusi/);
    assert.match(home, /linkedin\.com\/in\/sewon-p-38009a1a7/);
});

test('portfolio cases are scan-ready and declare their public evidence boundary', () => {
    const portfolio = pages['portfolio.html'];
    for (const id of ['case-developer-platform', 'case-modernization', 'case-device-cloud']) {
        assert.match(portfolio, new RegExp(`id="${id}"`), `missing case anchor ${id}`);
        assert.match(portfolio, new RegExp(`href="#${id}"`), `missing case-index link ${id}`);
    }
    assert.match(portfolio, /class="portfolio-disclosure"/);
    assert.match(portfolio, /Proprietary work is described through problem boundaries, engineering decisions, outcomes, and current status/);
    assert.match(portfolio, /내부 코드·고객 정보·기밀 수치 없이/);
});

test('root pages provide canonical and sharing metadata', () => {
    const canonicalByPage = {
        'index.html': 'https://haakusi.github.io/',
        'portfolio.html': 'https://haakusi.github.io/portfolio.html',
        'cv.html': 'https://haakusi.github.io/cv.html',
        'research.html': 'https://haakusi.github.io/research.html',
        'blog.html': 'https://haakusi.github.io/blog.html',
        'lectures.html': 'https://haakusi.github.io/lectures.html',
        'reading.html': 'https://haakusi.github.io/reading.html',
    };
    for (const [name, canonical] of Object.entries(canonicalByPage)) {
        const html = pages[name];
        assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/);
        assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${name} canonical is missing`);
        for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
            assert.ok(html.includes(`property="${property}"`), `${name} missing ${property}`);
        }
    }
});

test('HTML-facing copy escapes ambiguous ampersands', () => {
    for (const [name, html] of Object.entries(pages)) {
        const markupWithoutScripts = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
        const rawAmpersands = markupWithoutScripts.match(/&(?![a-z][a-z0-9]+;|#\d+;|#x[0-9a-f]+;)/gi) ?? [];
        assert.equal(rawAmpersands.length, 0, `${name} contains raw HTML ampersands`);
    }
});

test('archive roots use a neutral, responsive product system', () => {
    for (const selector of [
        'body.archive-page',
        '.archive-container',
        '.archive-hero',
        '.blog-index',
        '.lectures-page .lecture-card',
        '.reading-page .book-card',
    ]) {
        assert.ok(css.includes(selector), `missing archive selector ${selector}`);
    }
    assert.match(css, /\.reading-page\s+\.bookshelf-year::after\s*\{[\s\S]*?display:\s*none\s*!important/);
    assert.match(css, /@media\s*\(max-width:\s*680px\)[\s\S]*?\.archive-container/);
    assert.match(css, /:focus-visible/);
});

test('crawl, recovery, and repository documentation are present', () => {
    for (const url of [
        'https://haakusi.github.io/',
        'https://haakusi.github.io/portfolio.html',
        'https://haakusi.github.io/cv.html',
        'https://haakusi.github.io/research.html',
        'https://haakusi.github.io/blog.html',
        'https://haakusi.github.io/lectures.html',
        'https://haakusi.github.io/reading.html',
    ]) {
        assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${url}`);
    }
    assert.match(robots, /Sitemap:\s*https:\/\/haakusi\.github\.io\/sitemap\.xml/);
    assert.match(notFound, /<main\s+id="not-found-main"/);
    assert.match(notFound, /href="career-system\.css(?:\?[^\"]*)?"/);
    assert.match(readme, /Developer career site/i);
    assert.match(readme, /Privacy and evidence boundary/i);
});

test('new public surfaces contain no private paths or sensitive profile data', () => {
    const combined = [...Object.values(pages), common, sitemap, robots, notFound, readme].join('\n');
    assert.doesNotMatch(combined, /no_read|phd\/swpark|file:\/\/|\/Users\/sewonpark|010-\d|구미동|1991년|희망연봉|주민등록|RabbitMQ|Freshdesk|Jira/);
});

test('root-page local links resolve and IDs remain unique', async () => {
    for (const [name, html] of Object.entries(pages)) {
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${name} contains duplicate IDs`);

        const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
        const localFiles = hrefs.filter((href) => !/^(?:https?:|mailto:|#)/.test(href));
        for (const href of new Set(localFiles)) {
            const path = href.split(/[?#]/)[0];
            if (path) await access(new URL(path, root));
        }
    }
});
