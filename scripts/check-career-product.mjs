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
    'notes.html',
    'blog.html',
    'lectures.html',
    'reading.html',
];
const pages = Object.fromEntries(await Promise.all(
    rootPages.map(async (path) => [path, await read(path)])
));
const common = await read('common.js');
const css = await readOptional('simple-site.css');
const sitemap = await readOptional('sitemap.xml');
const robots = await readOptional('robots.txt');
const notFound = await readOptional('404.html');
const readme = await readOptional('README.md');

test('all eight root surfaces use the shared bilingual simple shell', () => {
    for (const [name, html] of Object.entries(pages)) {
        assert.match(html, /<html\s+lang="en"\s+data-theme=/, `${name} needs an initial document language`);
        assert.match(html, /class="[^"]*\b(?:career-skip|skip-link)\b[^"]*"/, `${name} needs a skip link`);
        assert.match(html, /<main\s+id="[^"]+"/, `${name} needs a named main landmark`);
        const sharedIndex = html.search(/href="simple-site\.css(?:\?[^\"]*)?"/);
        assert.ok(sharedIndex > -1, `${name} must load simple-site.css`);
        assert.ok(sharedIndex > html.lastIndexOf('rel="stylesheet"', sharedIndex - 1), `${name} must load shared styles last`);

        const localizedTags = html.match(/<[^>]*\bdata-en="[^"]*"[^>]*>/g) ?? [];
        assert.ok(localizedTags.length >= 4, `${name} needs meaningful bilingual content`);
        for (const tag of localizedTags) {
            assert.match(tag, /\bdata-kr="[^"]*"/, `${name} has an unpaired bilingual element`);
        }
    }
    for (const name of ['notes.html', 'blog.html', 'lectures.html', 'reading.html']) {
        assert.match(pages[name], /<body class="[^"]*archive-page[^"]*"/, `${name} needs archive-page styling`);
    }
});

test('navigation restores the compact five-route archive information architecture', () => {
    const order = [
        "href: 'index.html'",
        "href: 'blog.html'",
        "href: 'lectures.html'",
        "href: 'reading.html'",
        "href: 'cv.html'",
    ].map((needle) => common.indexOf(needle));
    assert.ok(order.every((position) => position > -1), 'all five navigation items must exist');
    assert.deepEqual(order, [...order].sort((a, b) => a - b), 'career navigation order is incorrect');
    assert.match(common, /rel="me noreferrer"/, 'professional social links need identity and referrer semantics');
    assert.match(common, /updateToggleLabels/, 'theme and language controls need state-aware labels');
});

test('home communicates identity, evidence, and conservative profile structured data', () => {
    const home = pages['index.html'];
    const decodedHome = home.replaceAll('&amp;', '&');
    for (const id of ['about-title', 'work-title', 'research-title', 'notes-title']) {
        assert.match(home, new RegExp(`id="${id}"`));
    }
    for (const phrase of [
        'eight years of experience',
        'BioStar Developer Portal',
        'AI-native Angular-to-React modernization',
        'Explainable Traditional-Dance Retrieval',
        '대표 프로젝트',
        '2026.07—PRESENT',
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

test('frontend modernization is described as team collaboration rather than team leadership', () => {
    const modernizationPages = {
        home: pages['index.html'],
        portfolio: pages['portfolio.html'],
        cv: pages['cv.html'],
    };
    for (const [name, html] of Object.entries(modernizationPages)) {
        assert.match(html, /Frontend team collaboration/i, `${name} needs the English collaboration framing`);
        assert.match(html, /프론트팀 협업/, `${name} needs the Korean collaboration framing`);
    }

    const combined = Object.values(modernizationPages).join('\n');
    assert.doesNotMatch(
        combined,
        /Frontend team lead|Lead the frontend team|I lead the frontend team|프론트팀(?:을)?\s*리딩/i,
        'frontend modernization must not claim frontend-team leadership'
    );

    assert.match(pages['cv.html'], /Integration Development Team Lead/);
    assert.match(pages['cv.html'], /Integration개발팀 팀장/);
    assert.match(pages['cv.html'], /led three interns/i);
});

test('award narrative frames AI-native productization as a challenge rather than a completed product', () => {
    for (const [name, html] of Object.entries({
        portfolio: pages['portfolio.html'],
        cv: pages['cv.html'],
    })) {
        assert.match(html, /pursued AI-native productization/i, `${name} needs the English challenge framing`);
        assert.match(html, /AI-native 기반 제품화에 도전/, `${name} needs the Korean challenge framing`);
        assert.match(html, /KRW 3 million/);
        assert.match(html, /KRW 10 million/);
        assert.match(html, /개발비 300만원/);
        assert.match(html, /상금 1,000만원/);
    }

    const combined = pages['portfolio.html'] + '\n' + pages['cv.html'];
    assert.doesNotMatch(
        combined,
        /completed AI-native product|AI-native 제품을 완성|AI-native workflow로 1인 8주 동안 구축해/i
    );
});

test('root pages provide canonical and sharing metadata', () => {
    const canonicalByPage = {
        'index.html': 'https://haakusi.github.io/',
        'portfolio.html': 'https://haakusi.github.io/portfolio.html',
        'cv.html': 'https://haakusi.github.io/cv.html',
        'research.html': 'https://haakusi.github.io/research.html',
        'notes.html': 'https://haakusi.github.io/notes.html',
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

test('archive roots use the restrained simple compatibility layer', () => {
    for (const selector of [
        '.archive-hero',
        '.case-study',
        '.notes-route',
        'body.cv-page',
    ]) {
        assert.ok(css.includes(selector), `missing archive selector ${selector}`);
    }
    assert.doesNotMatch(pages['portfolio.html'], /data-project-showcase|images\/career\/showcase\//);
    assert.match(css, /@media\s*\(max-width:\s*680px\)/);
    assert.match(css, /\.skip-link:focus/);
});

test('crawl, recovery, and repository documentation are present', () => {
    for (const url of [
        'https://haakusi.github.io/',
        'https://haakusi.github.io/portfolio.html',
        'https://haakusi.github.io/cv.html',
        'https://haakusi.github.io/research.html',
        'https://haakusi.github.io/notes.html',
        'https://haakusi.github.io/blog.html',
        'https://haakusi.github.io/lectures.html',
        'https://haakusi.github.io/reading.html',
    ]) {
        assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${url}`);
    }
    assert.match(robots, /Sitemap:\s*https:\/\/haakusi\.github\.io\/sitemap\.xml/);
    assert.match(notFound, /<main\s+id="not-found-main"/);
    assert.match(notFound, /href="simple-site\.css(?:\?[^\"]*)?"/);
    assert.match(readme, /Developer career site/i);
    assert.match(readme, /Privacy and evidence boundary/i);
    assert.match(readme, /simple-site\.css/);
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
