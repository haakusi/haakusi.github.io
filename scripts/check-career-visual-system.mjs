import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const sharedCss = await read('career-system.css').catch(() => '');
const pages = Object.fromEntries(await Promise.all(
    ['index.html', 'portfolio.html', 'research.html', 'cv.html'].map(async (path) => [path, await read(path)])
));

test('career pages load the shared foundation, with the homepage composition applied last', () => {
    for (const [name, html] of Object.entries(pages)) {
        const sharedIndex = html.search(/href="career-system\.css(?:\?[^\"]*)?"/);
        assert.ok(sharedIndex > -1, `${name} must load career-system.css`);
        const pageStyleIndex = Math.max(
            html.search(/href="home-style\.css(?:\?[^\"]*)?"/),
            html.search(/href="portfolio-style\.css(?:\?[^\"]*)?"/),
            html.search(/href="research-style\.css(?:\?[^\"]*)?"/),
            html.search(/href="cv-style\.css(?:\?[^\"]*)?"/)
        );
        if (name === 'index.html') {
            assert.ok(pageStyleIndex > sharedIndex, `${name} must apply its measured composition after shared tokens`);
        } else {
            assert.ok(sharedIndex > pageStyleIndex, `${name} must load shared styles last`);
        }
    }
});

test('shared system defines a restrained palette, spacing, and one content axis', () => {
    for (const token of [
        '--career-bg:',
        '--career-surface:',
        '--career-text:',
        '--career-muted:',
        '--career-accent:',
        '--career-content:',
        '--career-space-section:',
    ]) {
        assert.ok(sharedCss.includes(token), `missing shared token ${token}`);
    }
    assert.match(sharedCss, /\.home-container,[\s\S]*?\.portfolio-container,[\s\S]*?\.research-container,[\s\S]*?\.cv-container[\s\S]*?max-width:\s*var\(--career-content\)/);
    assert.match(sharedCss, /background-image:\s*none\s*!important/);
    assert.match(sharedCss, /\.hero-system::after\s*\{[\s\S]*?display:\s*none\s*!important/);
});

test('Korean and English typography keep semantic units intact', () => {
    assert.match(sharedCss, /--career-sans:[^;]*"Noto Sans KR"[^;]*"Apple SD Gothic Neo"[^;]*"Segoe UI"/);
    assert.match(sharedCss, /text-wrap:\s*balance/);
    assert.match(sharedCss, /\[data-lang="kr"\][\s\S]*?word-break:\s*keep-all/);
    assert.match(sharedCss, /\[data-lang="kr"\][\s\S]*?line-break:\s*strict/);
    assert.doesNotMatch(sharedCss, /overflow-wrap:\s*anywhere/);
});

test('author display rules never override bilingual hidden state', () => {
    assert.match(sharedCss, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
});

test('hero statements use explicit phrase-level lines and the CV name is separable', () => {
    for (const name of ['index.html', 'portfolio.html', 'research.html']) {
        const lineCount = (pages[name].match(/class="career-line/g) ?? []).length;
        assert.ok(lineCount >= 4, `${name} needs explicit English and Korean hero lines`);
    }
    assert.match(pages['cv.html'], /class="cv-name-latin"[^>]*>Sewon Park</);
    assert.match(pages['cv.html'], /class="cv-name-korean lang-kr"/);
});

test('portfolio declares its initial document language and the system has three responsive tiers', () => {
    assert.match(pages['portfolio.html'], /<html\s+lang="en"\s+data-theme=/);
    for (const width of ['900px', '680px', '420px']) {
        assert.ok(sharedCss.includes(`max-width: ${width}`), `missing responsive tier ${width}`);
    }
});
