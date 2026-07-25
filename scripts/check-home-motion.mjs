import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const index = read('index.html');
const css = read('hybrid-profile.css');

test('home keeps complete semantic content before progressive motion initializes', () => {
    assert.doesNotMatch(index, /home-motion\.js|data-scroll-stage|data-cinematic-scene|data-hero-depth/);
    assert.match(index, /<script src="common\.js\?v=[^"]+"><\/script>/);
    assert.match(index, /<script src="profile-motion\.js\?v=[^"]+"><\/script>/);
    assert.match(index, /data-profile-stage="hero"/);
    assert.match(index, /data-profile-scene-content/);
    assert.doesNotMatch(css, /body:not\(\.profile-motion-enhanced\)[^{]*\{[^}]*(?:opacity:\s*0|visibility:\s*hidden)/);
});

test('progressive motion combines view reveals with a bounded driver and honors reduced motion', () => {
    assert.match(css, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
    assert.match(css, /animation-timeline:\s*view\(\)/);
    assert.match(css, /animation-range:\s*entry 8% cover 28%/);
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-cinematic/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none\s*!important/);
});

test('only selected chapters use bounded focal stages while the remaining document stays editorial', () => {
    assert.match(css, /--profile-section:\s*clamp\(88px,\s*10vw,\s*148px\)/);
    assert.match(css, /\.profile-section\s*\{[^}]*padding:\s*var\(--profile-section\) 0/);
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-cinematic\s*\{[^}]*min-height:\s*clamp\(1040px,\s*165svh,\s*1580px\)/);
    assert.doesNotMatch(css, /min-height:\s*220(?:s?vh)/);
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
