import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const index = read('index.html');
const research = read('research.html');
const skin = read('career-skin.css');
const hybrid = read('hybrid-profile.css');

test('the Home opening gives one statement the focal axis and moves current work into its own band', () => {
    assert.match(index, /class="profile-hero-statement"[^>]*data-profile-primary[\s\S]*?class="profile-hero-brief"[^>]*data-profile-support/);
    assert.match(hybrid, /\.profile-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.75fr\)\s+minmax\(260px,\s*0\.65fr\)/);
    assert.match(hybrid, /\.profile-hero-statement h1\s*\{[^}]*font-size:\s*clamp\(50px,\s*6\.3vw,\s*94px\)/);
    assert.match(index, /class="profile-current"[\s\S]*?<li data-current-item>[\s\S]*?<li data-current-item>[\s\S]*?<li data-current-item>/);
    assert.equal((index.match(/class="profile-action(?:\s|\")/g) ?? []).length, 2);
    assert.match(index, /class="profile-evidence"/);
});

test('the hybrid profile uses progressive CSS motion without hiding baseline content', () => {
    assert.doesNotMatch(index, /home-motion\.js|data-cinematic-scene|data-hero-depth/);
    assert.match(hybrid, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
    assert.match(hybrid, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(hybrid, /opacity:\s*1\s*!important/);
});

test('Research public notes never orphan the third item and the close is a flat editorial row', () => {
    assert.match(research, /class="research-note-grid"/);
    assert.match(skin, /body\.research-page \.research-note-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(skin, /body\.research-page \.research-cta\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*160px\s+minmax\(0,\s*1fr\)[^}]*border-radius:\s*0/);
    assert.match(skin, /body\.research-page \.research-cta > div\s*\{[^}]*grid-column:\s*2/);
    assert.match(skin, /#site-footer footer\s*\{[^}]*margin:\s*0\s*!important/);
});
