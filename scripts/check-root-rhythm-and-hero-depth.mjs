import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const shared = read('career-system.css');
const skin = read('career-skin.css');
const hybrid = read('hybrid-profile.css');
const index = read('index.html');
const common = read('common.js');

test('all roots use one shared header and five equal-width navigation slots', () => {
    assert.match(index, /<div id="site-header"><\/div>[\s\S]*?<div id="site-nav"><\/div>/);
    assert.equal((common.match(/\{ href: '[^']+', en: '[^']+', kr: '[^']+' \}/g) ?? []).length, 5);
    assert.match(shared, /--career-tab-count:\s*5/);
    assert.match(shared, /\.navigation\s*\{[^}]*display:\s*grid\s*!important[^}]*grid-template-columns:\s*repeat\(var\(--career-tab-count\),\s*minmax\(0,\s*1fr\)\)/);
    assert.match(skin, /#site-nav \.navigation\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
});

test('secondary roots share one compact shell and readable type tokens', () => {
    for (const token of [
        '--career-content: 1320px',
        '--career-shell-primary: 70px',
        '--career-shell-primary-mobile: 85px',
        '--career-shell-secondary: 54px',
        '--career-type-body: 17px',
    ]) assert.ok(shared.includes(token), `missing ${token}`);
    assert.match(shared, /@media\s*\(max-width:\s*680px\)[\s\S]*?#site-header header[^}]*height:\s*var\(--career-shell-primary-mobile\)\s*!important/);
});

test('home uses bounded type, one content axis, and consistent editorial rhythm', () => {
    assert.match(hybrid, /--profile-max:\s*1180px/);
    assert.match(hybrid, /--profile-section:\s*clamp\(88px,\s*10vw,\s*148px\)/);
    assert.match(hybrid, /\.profile-hero-statement h1\s*\{[^}]*font-size:\s*clamp\(50px,\s*6\.3vw,\s*94px\)/);
    assert.match(hybrid, /#home-main,[\s\S]*?#notes-main\s*\{[^}]*width:\s*min\(calc\(100% - \(2 \* var\(--profile-gutter\)\)\),\s*var\(--profile-max\)\)/);
    assert.doesNotMatch(hybrid, /font-size:\s*(?:8|9|10)px/);
});

test('hero falls back to a single readable column at tablet width', () => {
    assert.match(index, /class="profile-hero"[^>]*data-profile-stage-frame/);
    assert.match(hybrid, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-hero\s*\{[^}]*grid-template-columns:\s*1fr/);
    assert.match(hybrid, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-hero-brief\s*\{[^}]*border-top:\s*1px solid var\(--profile-line\)[^}]*border-left:\s*0/);
    assert.match(hybrid, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-hero-statement h1\s*\{[^}]*font-size:\s*clamp\(42px,\s*13\.2vw,\s*62px\)/);
});

test('enhancement never blocks content or overrides reduced-motion preferences', () => {
    assert.doesNotMatch(index, /home-motion\.js/);
    assert.match(index, /profile-motion\.js/);
    assert.match(hybrid, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
    assert.match(hybrid, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?opacity:\s*1\s*!important/);
});
