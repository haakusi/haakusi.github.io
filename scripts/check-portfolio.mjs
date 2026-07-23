import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../portfolio-style.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../portfolio.html', import.meta.url), 'utf8');
const cv = await readFile(new URL('../cv.html', import.meta.url), 'utf8');
const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8').catch(() => '');

test('mobile portfolio text keeps natural word boundaries', () => {
    assert.doesNotMatch(
        css,
        /\.portfolio-container \.subtitle,[\s\S]*?\.hero-copy,[\s\S]*?overflow-wrap:\s*anywhere/,
        'overflow-wrap:anywhere must not be inherited by the full hero copy'
    );
});

test('portfolio uses a cross-platform Korean-capable system font stack', () => {
    assert.match(css, /font-family:[^;]*-apple-system[^;]*"Segoe UI"[^;]*"Noto Sans KR"[^;]*"Malgun Gothic"/);
    assert.match(css, /\[data-lang="kr"\][\s\S]*font-family:\s*var\(--pf-sans\)/);
});

test('portfolio controls stay at the document top instead of covering anchored work', () => {
    assert.match(html, /<body\s+class="portfolio-page">/);
    assert.match(css, /\.portfolio-page\s+\.theme-toggle[\s\S]*?position:\s*absolute\s*!important/);
    assert.match(css, /\.portfolio-page\s+\.lang-toggle[\s\S]*?position:\s*absolute\s*!important/);
});

test('public portfolio includes the current platform, modernization, core, and research evidence', () => {
    for (const phrase of [
        'scenario history',
        'About 200K LOC',
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
