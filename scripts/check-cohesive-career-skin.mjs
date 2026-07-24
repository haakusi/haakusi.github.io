import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const roots = ['index.html', 'portfolio.html', 'cv.html', 'research.html', 'blog.html', 'lectures.html', 'reading.html', '404.html'];
const common = read('common.js');
const home = read('home-style.css');
const skinExists = existsSync(new URL('career-skin.css', root));
const skin = skinExists ? read('career-skin.css') : '';

test('one final career skin is loaded last on every public root', () => {
    assert.equal(skinExists, true, 'career-skin.css must exist');
    for (const page of roots) {
        const html = read(page);
        assert.match(html, /career-skin\.css\?v=20260724-skin3/);
        assert.ok(
            html.lastIndexOf('career-skin.css') > html.lastIndexOf('career-system.css'),
            `${page} must load the final skin after the compatibility system`,
        );
    }
});

test('shared runtime renders the editorial ticker for every public surface', () => {
    assert.match(common, /function renderTicker\(\)/);
    assert.match(common, /class="career-ticker"/);
    assert.match(common, /data-career-ticker-track/);
    assert.match(common, /renderTicker\(\);/);
    assert.match(common, /link\[href\*="career-skin\.css"\]/);
});

test('the final skin owns one content rail, one type scale, and one section rhythm', () => {
    assert.match(skin, /--skin-content:\s*1180px/);
    assert.match(skin, /--skin-gutter:\s*clamp\(20px,\s*4vw,\s*56px\)/);
    assert.match(skin, /--skin-section:\s*clamp\(72px,\s*8vw,\s*112px\)/);
    assert.match(skin, /--skin-copy:\s*720px/);
    assert.match(skin, /--skin-accent:\s*#9adbcf/);
});

test('ticker motion is continuous, clipped, and motion-safe', () => {
    assert.match(skin, /@keyframes career-ticker-flow/);
    assert.match(skin, /\.career-ticker-track\s*\{[^}]*animation:\s*career-ticker-flow/);
    assert.match(skin, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.career-ticker-track\s*\{[^}]*animation:\s*none/);
});

test('home keeps cinematic depth without making content depend on giant stages', () => {
    assert.match(skin, /body\.career-home \.home-hero\s*\{[^}]*min-height:\s*min\(108svh,\s*920px\)/);
    assert.match(skin, /body\.career-home \.visual-scroll-stage\s*\{[^}]*min-height:\s*clamp\(620px,\s*88svh,\s*820px\)/);
    assert.match(skin, /body\.career-home \[data-cinematic-scene\]\s*\{[^}]*min-height:\s*0/);
    assert.doesNotMatch(home, /min-height:\s*[2-9][0-9]{3}px/);
});

test('portfolio, CV, research, and archive roots share the same readable page frame', () => {
    assert.match(skin, /:is\(#portfolio-main,\s*#cv-main,\s*#research-main,\s*#blog-main,\s*#lectures-main,\s*#reading-main,\s*#not-found-main\)/);
    assert.match(skin, /\.skin-page-hero/);
    assert.match(skin, /body\.cv-page \.cv-entry\s*\{[^}]*grid-template-columns:\s*150px\s+minmax\(0,\s*1fr\)/);
});

test('utility rows stay compact and the mobile identity bar follows the skin token', () => {
    assert.match(skin, /#reading-main > section:is\(\.reading-stats,\s*\.reading-filter\)\s*\{[^}]*padding:\s*26px 0\s*!important/);
    assert.match(skin, /@media screen and \(max-width:\s*900px\)[\s\S]*?body[^}]*#site-header header\s*\{[^}]*height:\s*var\(--skin-header\)\s*!important/);
});
