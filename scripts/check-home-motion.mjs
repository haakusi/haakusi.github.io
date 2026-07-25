import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const index = read('index.html');
const css = read('hybrid-profile.css');

test('home remains fully readable without a JavaScript motion driver', () => {
    assert.doesNotMatch(index, /home-motion\.js|data-scroll-stage|data-cinematic-scene|data-hero-depth/);
    assert.match(index, /<script src="common\.js\?v=[^"]+"><\/script>/);
    assert.doesNotMatch(css, /body\.home-motion-enhanced/);
});

test('progressive motion is CSS-only and honors reduced motion', () => {
    assert.match(css, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
    assert.match(css, /animation-timeline:\s*view\(\)/);
    assert.match(css, /animation-range:\s*entry 8% cover 28%/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none\s*!important/);
});

test('sections use bounded editorial spacing rather than pinned full-screen stages', () => {
    assert.match(css, /--profile-section:\s*clamp\(88px,\s*10vw,\s*148px\)/);
    assert.match(css, /\.profile-section\s*\{[^}]*padding:\s*var\(--profile-section\) 0/);
    assert.doesNotMatch(css, /position:\s*sticky|min-height:\s*220(?:s?vh)/);
});

test('dark theme uses quiet side focus rails without obscuring content', () => {
    assert.match(css, /body\.hybrid-home::before,[\s\S]*?body\.hybrid-home::after\s*\{[^}]*position:\s*fixed[^}]*pointer-events:\s*none/);
    assert.match(css, /body\.hybrid-home::before\s*\{[^}]*linear-gradient\(90deg/);
    assert.match(css, /body\.hybrid-home::after\s*\{[^}]*linear-gradient\(270deg/);
    assert.match(css, /\[data-theme="light"\] body\.hybrid-home::before/);
});

test('mobile layouts collapse hierarchy without horizontal content tracks', () => {
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-hero\s*\{[^}]*grid-template-columns:\s*1fr/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-evidence\s*\{[^}]*grid-template-columns:\s*1fr/);
    assert.doesNotMatch(css, /overflow-x:\s*(?:scroll|auto)/);
});
