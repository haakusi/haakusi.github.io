import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const shared = read('career-system.css');
const home = read('home-style.css');
const portfolio = read('portfolio-style.css');
const cv = read('cv-style.css');
const common = read('common.js');

test('shared shell loader recognizes cache-versioned career stylesheets', () => {
    assert.match(common, /link\[href\*="career-system\.css"\]/);
});

test('all public roots use one centered 1320px rail with responsive equal gutters', () => {
    assert.match(shared, /--career-content:\s*1320px/);
    assert.match(shared, /--career-gutter:\s*clamp\(24px,\s*4\.1667vw,\s*60px\)/);
    assert.match(shared, /width:\s*min\(calc\(100% - \(2 \* var\(--career-gutter\)\)\),\s*var\(--career-content\)\)\s*!important/);
    assert.match(home, /--home-gutter:\s*var\(--career-gutter\)/);
    assert.match(shared, /:where\(body\.portfolio-page,[^}]+:is\(#site-header,\s*#site-nav\)\s*\{[^}]*width:\s*100%\s*!important/);
});

test('Home uses one editorial grid and bounded type instead of drifting oversized rows', () => {
    assert.match(home, /--home-rail-column:\s*300px/);
    assert.match(home, /--home-grid-gap:\s*56px/);
    assert.match(home, /body\.career-home \.home-hero\s*\{[^}]*min-height:\s*135svh\s*!important/);
    assert.match(home, /\.home-hero-depth-frame\s*\{[^}]*grid-template-columns:\s*var\(--home-rail-column\)\s+minmax\(0,\s*1fr\)[^}]*column-gap:\s*var\(--home-grid-gap\)/);
    assert.match(home, /\.home-section-heading\s*\{[^}]*grid-template-columns:\s*var\(--home-rail-column\)\s+minmax\(0,\s*1fr\)[^}]*gap:\s*var\(--home-grid-gap\)/);
    assert.match(home, /\.journey-list li\s*\{[^}]*grid-template-columns:\s*var\(--home-rail-column\)\s+minmax\(0,\s*1fr\)\s+96px[^}]*gap:\s*var\(--home-grid-gap\)/);
    assert.match(home, /\.journey-list h3\s*\{[^}]*font-size:\s*clamp\(24px,\s*2\.2vw,\s*32px\)\s*!important/);
});

test('Portfolio turns the hero system and proof metrics into readable editorial structures', () => {
    assert.match(portfolio, /\.hero-system\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*min-height:\s*0[^}]*border-radius:\s*0/);
    assert.match(portfolio, /\.system-line\s*\{[^}]*display:\s*none/);
    assert.match(portfolio, /\.proof-item\s*\{[^}]*min-height:\s*168px[^}]*padding:\s*30px 28px/);
    assert.match(portfolio, /\.proof-item strong\s*\{[^}]*font-size:\s*clamp\(42px,\s*4\.2vw,\s*56px\)/);
    assert.match(portfolio, /\.proof-item span\s*\{[^}]*font-size:\s*15px/);
});

test('CV screen uses one date rail and neutralizes global header alignment', () => {
    assert.match(cv, /\.cv-profile,\s*\.cv-entry-header,\s*\.cv-contribution header\s*\{[^}]*text-align:\s*left/);
    assert.match(cv, /\.cv-entry-header,\s*\.cv-contribution header\s*\{[^}]*padding:\s*0/);
    assert.match(cv, /body\.cv-page \.cv-section-heading\s*\{[^}]*grid-template-columns:\s*160px\s+minmax\(0,\s*1fr\)[^}]*gap:\s*40px/);
});

test('CV print uses deliberate A4 margins, matching rails, and a reproducible renderer', () => {
    assert.match(cv, /@page\s*\{[^}]*size:\s*A4;[^}]*margin:\s*14mm 15mm/);
    assert.match(cv, /@media print[\s\S]*?body\.cv-page \.cv-section-heading\s*\{[^}]*grid-template-columns:\s*29mm\s+minmax\(0,\s*1fr\)[^}]*gap:\s*5mm/);
    assert.match(cv, /@media print[\s\S]*?body\.cv-page \.cv-closing\s*\{[^}]*display:\s*none\s*!important/);
    assert.match(cv, /@media print[\s\S]*?\.cv-entry-header,\s*\.cv-contribution header\s*\{[^}]*padding:\s*0\s*!important[^}]*text-align:\s*left\s*!important/);
    assert.doesNotThrow(() => read('scripts/render-career-pdfs.mjs'));
});
