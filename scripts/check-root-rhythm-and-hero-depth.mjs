import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const shared = read('career-system.css');
const home = read('home-style.css');
const index = read('index.html');
const motion = read('home-motion.js');
const common = read('common.js');

test('all seven roots use one shared header and equal-width navigation slots', () => {
    assert.match(index, /<div id="site-header"><\/div>[\s\S]*?<div id="site-nav"><\/div>/);
    assert.doesNotMatch(index, /home-local-nav|home-motion-ticker|home-brand|home-local-links/);
    assert.equal((common.match(/\{ href: '[^']+', en: '[^']+', kr: '[^']+' \}/g) ?? []).length, 7);
    assert.match(shared, /--career-tab-count:\s*7/);
    assert.match(shared, /\.navigation\s*\{[^}]*display:\s*grid\s*!important[^}]*grid-template-columns:\s*repeat\(var\(--career-tab-count\),\s*minmax\(0,\s*1fr\)\)/);
    assert.match(shared, /\.navigation \.nav-link\s*\{[^}]*display:\s*inline-flex[^}]*width:\s*100%[^}]*justify-content:\s*center/);
    assert.match(shared, /\.navigation \.nav-link\.active\s*\{[^}]*border-color:[^}]*background:[^}]*color:/);
});

test('secondary roots share one compact shell and readable type tokens', () => {
    assert.match(shared, /--career-content:\s*1320px/);
    assert.match(shared, /--career-shell-primary:\s*70px/);
    assert.match(shared, /--career-shell-primary-mobile:\s*85px/);
    assert.match(shared, /--career-shell-secondary:\s*54px/);
    assert.match(shared, /--career-type-body:\s*17px/);
    assert.match(shared, /--career-type-label:\s*13px/);
    assert.match(shared, /--career-space-section:\s*72px/);
    assert.match(shared, /body\.research-page\s+#site-header,[\s\S]*?\{[^}]*padding-top:\s*0\s*!important/);
    assert.match(shared, /body\.research-page\s+\.research-hero\s*\{[^}]*min-height:\s*min\(560px,\s*calc\(100svh - 124px\)\)\s*!important/);
    assert.match(shared, /@media\s*\(max-width:\s*680px\)[\s\S]*?#site-header header[^}]*height:\s*var\(--career-shell-primary-mobile\)\s*!important/);
});

test('home uses the same readable floor and a tighter editorial rhythm', () => {
    const desktopLayer = home.split('@media (max-width: 1180px)')[0];
    assert.match(home, /--home-section-space:\s*clamp\(76px,\s*8vw,\s*112px\)/);
    assert.match(home, /--home-type-label:\s*13px/);
    assert.match(home, /--home-type-small:\s*14px/);
    assert.match(shared, /\.navigation \.nav-link\s*\{[^}]*font-size:\s*14px\s*!important/);
    assert.match(home, /\.identity-card\s+:where\(dt,\s*dd\)\s*\{[^}]*font-size:\s*var\(--home-type-small\)/);
    assert.doesNotMatch(desktopLayer, /font-size:\s*(?:8|9|10|11)px/);
    assert.match(home, /\.home-section-heading\s*\{[^}]*margin:\s*0 0 48px\s*!important/);
    assert.match(home, /\.journey-list li\s*\{[^}]*padding:\s*30px 0/);
    assert.match(home, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.home-hero-meta\s*\{[^}]*padding-top:\s*28px/);
    assert.match(home, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.home-hero-brief\s*\{[^}]*margin-top:\s*32px/);
});

test('home hero declares a sticky depth stage with motion-safe fallbacks', () => {
    assert.match(index, /class="home-hero"[^>]+data-hero-depth-stage/);
    assert.match(index, /class="home-hero-depth-frame"[^>]+data-hero-depth-frame/);
    assert.match(index, /<h1[^>]+id="home-title"[^>]+data-hero-depth-content/);
    assert.doesNotMatch(index, /class="home-hero-statement"[^>]+data-hero-depth-content/);
    assert.match(home, /\.home-hero-depth-frame\s*\{[^}]*position:\s*sticky/);
    assert.match(home, /body\.home-motion-enhanced\s+\[data-hero-depth-content\]\s*\{[^}]*transform:/);
    assert.match(home, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.home-hero-depth-frame\s*\{[^}]*position:\s*static/);
    assert.match(home, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\[data-hero-depth-content\],[\s\S]*?\{[^}]*transform:\s*none\s*!important/);
});

test('hero depth values are deterministic, bounded, and exported for verification', () => {
    const listeners = {};
    const context = {
        console,
        document: {
            readyState: 'loading',
            addEventListener(type, handler) { listeners[type] = handler; },
        },
        addEventListener() {},
        matchMedia() { return { matches: false, addEventListener() {} }; },
        requestAnimationFrame() {},
    };
    context.window = context;
    context.globalThis = context;
    vm.runInNewContext(motion, context, { filename: 'home-motion.js' });

    const depth = context.HomeMotion?.heroDepthForProgress;
    assert.equal(typeof depth, 'function');
    assert.deepEqual({ ...depth(0) }, { scale: 0.76, translateY: 64, opacity: 0.58, briefY: 28, shade: 0.58 });
    assert.deepEqual({ ...depth(0.65) }, { scale: 1, translateY: 0, opacity: 1, briefY: 0, shade: 0.12 });
    assert.deepEqual({ ...depth(1) }, { scale: 1.14, translateY: -36, opacity: 0.44, briefY: -18, shade: 0.62 });
    assert.deepEqual({ ...depth(-1) }, { ...depth(0) });
    assert.deepEqual({ ...depth(2) }, { ...depth(1) });
});
