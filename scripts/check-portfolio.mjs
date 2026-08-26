import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const historicalCss = await readFile(new URL('../style.css', import.meta.url), 'utf8');
const simpleCss = await readFile(new URL('../simple-site.css', import.meta.url), 'utf8');
const shippedCss = `${historicalCss}\n${simpleCss}`;
const html = await readFile(new URL('../portfolio.html', import.meta.url), 'utf8');
const cv = await readFile(new URL('../cv.html', import.meta.url), 'utf8');
const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8').catch(() => '');

test('mobile portfolio text keeps natural word boundaries', () => {
    assert.doesNotMatch(shippedCss, /overflow-wrap:\s*anywhere/);
    assert.match(simpleCss, /overflow-wrap:\s*break-word/);
});

test('portfolio uses the shipped historical serif foundation', () => {
    assert.match(historicalCss, /body\s*\{[^}]*font-family:\s*'Georgia',\s*serif/);
    assert.match(html, /href="style\.css"/);
    assert.match(html, /href="simple-site\.css\?v=2026082603"/);
    assert.doesNotMatch(html, /portfolio-style\.css/);
});

test('portfolio controls use the shipped shared fixed-position rules', () => {
    assert.match(html, /<body\s+class="portfolio-page">/);
    assert.match(historicalCss, /\.theme-toggle\s*\{[^}]*position:\s*fixed/);
    assert.match(historicalCss, /\.lang-toggle\s*\{[^}]*position:\s*fixed/);
});

test('public portfolio includes the current platform, modernization, core, and research evidence', () => {
    for (const phrase of [
        'scenario history',
        'About 200K LOC',
        '2026.07—NOW',
        '2026.07~현재',
        '40%+ performance gain',
        'SK Networks Family AI Camp',
        'hybrid quantum–classical',
        '시나리오 이력',
        '약 20만 LOC',
        '성능을 40%+ 개선',
        '양자–고전 하이브리드',
    ]) {
        assert.ok(html.includes(phrase), `missing public portfolio phrase: ${phrase}`);
    }
    assert.doesNotMatch(html, /Technical Support chatbot|Global Technical Support|\bSolis\b|RabbitMQ/i);
});

test('private no_read artifacts are excluded from Git', () => {
    assert.match(gitignore, /^no_read\/$/m);
});

test('bilingual inline content supplies both language variants', () => {
    const localizedTags = html.match(/<[^>]*\bdata-en="[^"]*"[^>]*>/g) ?? [];
    assert.ok(localizedTags.length > 20, 'expected substantial bilingual content');
    for (const tag of localizedTags) {
        assert.match(tag, /\bdata-kr="[^"]*"/, `missing data-kr pair: ${tag}`);
    }
});

test('portfolio local links resolve to repository files', async () => {
    const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
    const localFiles = hrefs.filter((href) => !/^(?:https?:|mailto:|#)/.test(href));
    for (const href of new Set(localFiles)) {
        await access(new URL(`../${href.split('#')[0]}`, import.meta.url));
    }
});

test('public CV reflects the verified database and messaging stack', () => {
    assert.match(cv, /MariaDB/);
    assert.match(cv, /Microsoft SQL Server/);
    assert.doesNotMatch(cv, /RabbitMQ|Redis/);
});
