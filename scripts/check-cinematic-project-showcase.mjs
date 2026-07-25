import assert from 'node:assert/strict';
import { stat, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const html = await read('portfolio.html');
const css = await read('portfolio-showcase.css').catch(() => '');
const script = await read('portfolio-interactions.js').catch(() => '');

const scenes = [
    ['developer-portal', 'developer-portal-console.webp'],
    ['access-modernization', 'access-ui-modernization.webp'],
    ['version-e2e', 'version-aware-e2e.webp'],
    ['device-event-core', 'device-event-core.webp'],
    ['road-safety', 'road-safety-radar.webp'],
    ['network-ops', 'telecom-network-ops.webp'],
];

test('six career scenes form one semantic project showcase', () => {
    assert.match(html, /class="project-showcase"[^>]*data-project-showcase/);
    assert.equal((html.match(/class="showcase-tab"/g) ?? []).length, 6);
    assert.equal((html.match(/class="showcase-scene"/g) ?? []).length, 6);
    assert.match(html, /role="tablist"/);

    for (const [key] of scenes) {
        assert.match(html, new RegExp(`data-showcase-key="${key}"`));
        assert.match(html, new RegExp(`id="showcase-scene-${key}"`));
        assert.match(html, new RegExp(`aria-controls="showcase-scene-${key}"`));
    }
});

test('every scene uses an original persisted visual asset', async () => {
    for (const [, filename] of scenes) {
        const path = `images/career/showcase/${filename}`;
        assert.ok(html.includes(path), `missing visual reference: ${path}`);
        const info = await stat(new URL(`../${path}`, import.meta.url));
        assert.ok(info.size > 50_000, `${filename} is too small to be a production visual`);
    }
});

test('visuals open into one accessible bilingual project dialog', () => {
    assert.equal((html.match(/class="showcase-open"/g) ?? []).length, 6);
    assert.match(html, /<dialog[^>]*class="showcase-dialog"[^>]*data-showcase-dialog/);
    assert.match(html, /data-showcase-close/);
    assert.match(html, /aria-haspopup="dialog"/);
    assert.match(html, /Concept visualization · not a product screenshot/);
    assert.match(html, /콘셉트 시각화 · 실제 제품 스크린샷이 아닙니다/);
});

test('showcase enhancement owns selection, keyboard, scroll, and dialog behavior', async () => {
    assert.match(html, /portfolio-showcase\.css\?v=20260726-cinema2/);
    assert.match(html, /portfolio-interactions\.js\?v=20260726-cinema1/);
    assert.match(script, /portfolio-showcase-enhanced/);
    assert.match(script, /aria-selected/);
    assert.match(script, /requestAnimationFrame/);
    assert.match(script, /showModal\(\)/);
    assert.match(script, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    assert.match(script, /ArrowRight|ArrowDown/);

    const imported = await import('../portfolio-interactions.js');
    const { sceneIndexFromProgress } = imported.default ?? imported;
    assert.equal(sceneIndexFromProgress(-1, 6), 0);
    assert.equal(sceneIndexFromProgress(0, 6), 0);
    assert.equal(sceneIndexFromProgress(0.18, 6), 1);
    assert.equal(sceneIndexFromProgress(0.99, 6), 5);
    assert.equal(sceneIndexFromProgress(2, 6), 5);
});

test('cinematic styling has a bounded desktop stage and static safe fallbacks', () => {
    assert.match(css, /body\.portfolio-page #portfolio-main > \.project-showcase\s*\{[^}]*min-height:\s*560svh/);
    const stageRule = css.match(/body\.portfolio-page #portfolio-main > \.project-showcase\s*\{([^}]*)\}/)?.[1] ?? '';
    assert.match(stageRule, /min-height:\s*560svh\s*!important/);
    assert.match(stageRule, /padding:\s*0\s*!important/);
    assert.match(stageRule, /margin:[^;]*!important/);
    assert.match(css, /\.showcase-sticky\s*\{[^}]*position:\s*sticky[^}]*height:\s*calc\(100svh - 40px\)/);
    assert.match(css, /\.showcase-tab:focus-visible/);
    assert.match(css, /\.showcase-dialog::backdrop/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
});

test('the showcase is explicit about evidence boundaries', () => {
    for (const phrase of [
        'Concept visualization', '콘셉트 시각화',
        'public system boundaries', '공개 가능한 시스템 경계',
        'BioStar 2', 'React', 'Version-aware E2E', 'HBrain', 'SK Telecom TANGO',
    ]) {
        assert.ok(html.includes(phrase), `missing public-safe showcase phrase: ${phrase}`);
    }
    assert.doesNotMatch(html, /customer name|internal URL|private endpoint|password|API key/i);
});

test('the final call to action is a compact high-contrast editorial close', () => {
    assert.match(html, /class="portfolio-cta editorial-close"/);
    assert.match(html, /class="portfolio-cta-copy"/);
    const closeRule = css.match(/body\.portfolio-page \.portfolio-cta\s*\{([^}]*)\}/)?.[1] ?? '';
    assert.match(closeRule, /display:\s*grid\s*!important/);
    assert.match(closeRule, /grid-template-columns:[^;]*minmax\(0,\s*1fr\)/);
    assert.match(closeRule, /background:\s*transparent\s*!important/);
    assert.match(closeRule, /border-radius:\s*0\s*!important/);
    assert.match(closeRule, /min-height:\s*0\s*!important/);
    assert.match(css, /body\.portfolio-page \.portfolio-cta-copy\s*>\s*p\s*\{[^}]*color:\s*var\(--skin-muted\)\s*!important/);
    assert.match(css, /body\.portfolio-page \.portfolio-cta \.cta-links a:first-child\s*\{[^}]*background:\s*var\(--skin-accent\)/);
});
