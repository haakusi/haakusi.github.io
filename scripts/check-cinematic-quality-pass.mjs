import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const index = read('index.html');
const research = read('research.html');
const skin = read('career-skin.css');
const motion = read('home-motion.js');

test('the Home opening moves one visual statement and closes on a shared evidence ledger', () => {
    assert.match(index, /class="home-hero-statement"[^>]+data-hero-depth-content/);
    assert.doesNotMatch(index, /<h1[^>]+data-hero-depth-content/);
    assert.match(index, /class="home-hero-statement"[\s\S]*?class="identity-card"/);
    assert.doesNotMatch(index, /class="home-hero-meta"/);
    assert.match(skin, /body\.career-home \.home-hero-depth-frame\s*\{[^}]*grid-template-areas:\s*"brief statement"\s*"ledger ledger"/);
    assert.match(skin, /body\.career-home \.home-hero-statement\s*\{[^}]*align-items:\s*flex-end[^}]*text-align:\s*right/);
    assert.match(skin, /body\.career-home \.identity-card\s*\{[^}]*grid-area:\s*ledger[^}]*grid-template-columns:/);
});

test('the final motion stage is crisp at rest and exits as one grouped scene', () => {
    assert.match(motion, /briefOpacity:/);
    assert.match(motion, /--hero-depth-brief-opacity/);
    assert.match(skin, /body\.home-motion-enhanced \[data-hero-depth-brief\]\s*\{[^}]*opacity:\s*var\(--hero-depth-brief-opacity,\s*1\)/);
});

test('Research public notes never orphan the third item and the close is a flat editorial row', () => {
    assert.match(research, /class="research-note-grid"/);
    assert.match(skin, /body\.research-page \.research-note-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(skin, /body\.research-page \.research-cta\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*160px\s+minmax\(0,\s*1fr\)[^}]*border-radius:\s*0/);
    assert.match(skin, /body\.research-page \.research-cta > div\s*\{[^}]*grid-column:\s*2/);
    assert.match(skin, /#site-footer footer\s*\{[^}]*margin:\s*0\s*!important/);
});
