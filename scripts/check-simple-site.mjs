import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const pages = [
    'index.html',
    'portfolio.html',
    'research.html',
    'notes.html',
    'blog.html',
    'lectures.html',
    'reading.html',
    'cv.html',
    '404.html',
];

const htmlByPage = Object.fromEntries(await Promise.all(
    pages.map(async (page) => [page, await read(page)]),
));
const common = await read('common.js');
const home = htmlByPage['index.html'];
const simpleCss = await read('simple-site.css').catch(() => '');

const collectPublicHtml = async (directory = '') => {
    const entries = await readdir(new URL(directory, root), { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (entry.name === 'no_read' || entry.name.startsWith('.')) continue;
        const relative = `${directory}${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...await collectPublicHtml(`${relative}/`));
        } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'basic_statistics_homework_solution.html') {
            files.push(relative);
        }
    }

    return files;
};

const publicHtmlFiles = await collectPublicHtml();

const retiredStyles = /(?:career-system|career-skin|hybrid-profile|home-style|home-work-media|home-domain-map|portfolio-showcase|portfolio-case-details)\.css/;
const retiredScripts = /(?:profile-motion|home-motion|portfolio-interactions|knowledge-randomizer)\.js/;

test('shared shell uses the five-link simple-era navigation without career skin injection', () => {
    for (const href of ['index.html', 'blog.html', 'lectures.html', 'reading.html', 'cv.html']) {
        assert.match(common, new RegExp(`href:\\s*'${href.replace('.', '\\.')}'`));
    }

    assert.doesNotMatch(common, /ensureSharedCareerSystem|renderTicker|career-ticker|career-system\.css|career-skin\.css/);
    assert.match(common, /aria-current="page"/);
    assert.match(common, /document\.documentElement\.lang\s*=/);
});

test('homepage is a simple current profile rather than a cinematic experience', () => {
    for (const heading of ['About', 'Selected Work', 'Active Research', 'Recent Notes']) {
        assert.ok(home.includes(heading), `missing simple homepage heading: ${heading}`);
    }

    for (const currentPhrase of [
        'Platform &amp; Product Engineering Lead',
        'BioStar Developer Portal',
        'AI-native Angular-to-React modernization',
        'Explainable Traditional-Dance Retrieval',
    ]) {
        assert.ok(home.includes(currentPhrase), `missing current homepage content: ${currentPhrase}`);
    }

    assert.doesNotMatch(home, /data-profile-|profile-cinematic|profile-domain-map|profile-motion\.js/);
    assert.doesNotMatch(home, /Leaflet|visitor-count|initializeVisitorTracking|ipinfo\.io|script\.google\.com/);
});

test('public roots no longer load retired visual layers or cinematic scripts', () => {
    for (const [page, html] of Object.entries(htmlByPage)) {
        assert.doesNotMatch(html, retiredStyles, `${page} still loads a retired visual layer`);
        assert.doesNotMatch(html, retiredScripts, `${page} still loads a retired motion script`);
        assert.match(
            html,
            /<script\s+src="common\.js\?v=2026082603"><\/script>/,
            `${page} must request the restored shared runtime with a fresh cache key`,
        );
    }
});

test('one small compatibility stylesheet keeps current content readable in the old shell', () => {
    for (const [page, html] of Object.entries(htmlByPage)) {
        assert.match(html, /simple-site\.css/, `${page} does not load the simple compatibility layer`);
        assert.ok(
            html.lastIndexOf('simple-site.css') > html.lastIndexOf('style.css'),
            `${page} must load simple-site.css after the historical base`,
        );
    }

    assert.match(simpleCss, /main\s+(?:img|:is\([^)]*img)[^{]*\{[^}]*max-width:\s*100%/);
    assert.match(simpleCss, /\[data-theme="dark"\]\s+main h1\s*\{[^}]*color:\s*#e0e0e0/i);
    assert.match(simpleCss, /\[data-theme="dark"\]\s+main\s*\{[^}]*color:\s*#b0b0b0/i);
    assert.match(simpleCss, /\.project-meta,[\s\S]*?\.case-status\s*\{[^}]*color:\s*#666/i);
    assert.match(simpleCss, /\[data-theme="dark"\][\s\S]*?\.case-status\s*\{[^}]*color:\s*#aaa/i);
    assert.match(simpleCss, /body\.cv-page[^{]*\{[^}]*font-family:\s*['"]Georgia['"]/);
    assert.match(simpleCss, /@media\s*\(max-width:\s*680px\)/);
    assert.match(simpleCss, /\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/);
});

test('small navigation and metadata text remains readable in both themes', () => {
    assert.match(simpleCss, /\.nav-link:not\(\.active\),[\s\S]*?\.bookshelf-year-label\s*\{[^}]*color:\s*#666/i);
    assert.match(simpleCss, /\[data-theme="dark"\]\s+\.nav-link:not\(\.active\),[\s\S]*?\[data-theme="dark"\]\s+\.bookshelf-year-label\s*\{[^}]*color:\s*#aaa/i);
    assert.match(simpleCss, /\.lecture-meta,/i);
    assert.match(simpleCss, /\[data-theme="dark"\]\s+\.skip-link,[\s\S]*?\[data-theme="dark"\]\s+\.cv-skip\s*\{[^}]*color:\s*#222/i);
    assert.match(simpleCss, /--cv-faint:\s*#666/i);
    assert.match(simpleCss, /\[data-theme="dark"\]\s+body\.cv-page\s*\{[^}]*--cv-faint:\s*#aaa/i);
});

test('detail pages receive the compatibility layer and narrow tables scroll inside the content rail', async () => {
    const detailPagesWithoutStaticLayer = [];

    for (const page of publicHtmlFiles) {
        const html = await read(page);
        if (/common\.js/.test(html) && !/simple-site\.css/.test(html)) {
            detailPagesWithoutStaticLayer.push(page);
        }
    }

    assert.ok(detailPagesWithoutStaticLayer.length > 0, 'expected detail pages that rely on the shared runtime');
    assert.match(common, /function\s+ensureSimpleSiteStyles\s*\(/);
    assert.match(common, /simple-site\.css\?v=2026082603/);
    assert.match(common, /ensureSimpleSiteStyles\(\);[\s\S]*?renderHeader\(\);/);
    assert.match(simpleCss, /@media\s*\(max-width:\s*680px\)[\s\S]*?\.container\s+table\s*\{[^}]*display:\s*block[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/i);
});

test('every public page requests the restored shared runtime with the current cache key', async () => {
    for (const page of publicHtmlFiles) {
        const html = await read(page);
        if (!/common\.js/.test(html)) continue;
        assert.doesNotMatch(
            html,
            /common\.js(?!\?v=2026082603)/,
            `${page} can still receive a cached pre-restoration shared runtime`,
        );
    }
});

test('portfolio removes the retired cinematic showcase instead of hiding its payload', () => {
    const portfolio = htmlByPage['portfolio.html'];
    assert.doesNotMatch(portfolio, /data-project-showcase|class="project-showcase"|class="showcase-dialog"/);
    assert.doesNotMatch(portfolio, /images\/career\/showcase\//);
});

test('latest career, research, portfolio, and archive content remains public', () => {
    const expected = {
        'portfolio.html': ['Developer Portal productization', 'About 200K LOC', 'product/version-aware E2E'],
        'research.html': ['Explainable Traditional-Dance Retrieval &amp; Recommendation', 'Hybrid Quantum–Classical Model Selection'],
        'cv.html': ['Device boundary to AI platform', 'BioStar Developer Portal', '2026.07—PRESENT'],
        'notes.html': ['blog.html', 'lectures.html', 'reading.html'],
    };

    for (const [page, phrases] of Object.entries(expected)) {
        for (const phrase of phrases) {
            assert.ok(htmlByPage[page].includes(phrase), `${page} lost current content: ${phrase}`);
        }
    }
});

test('root-page IDs are unique and local links still resolve', async () => {
    for (const [page, html] of Object.entries(htmlByPage)) {
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${page} contains duplicate IDs`);

        const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
        const localFiles = hrefs.filter((href) => !/^(?:https?:|mailto:|#)/.test(href));
        for (const href of new Set(localFiles)) {
            const [targetWithQuery, fragment] = href.split('#');
            const path = targetWithQuery.split('?')[0];
            if (!path) continue;
            await access(new URL(path, root));

            if (fragment && path.endsWith('.html')) {
                const target = await read(path);
                assert.match(
                    target,
                    new RegExp(`\\bid="${fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
                    `${page} links to missing fragment: ${href}`,
                );
            }
        }

        for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
            assert.match(image[1], /\balt="[^"]*"/i, `${page} contains an image without alt text`);
        }
    }
});
