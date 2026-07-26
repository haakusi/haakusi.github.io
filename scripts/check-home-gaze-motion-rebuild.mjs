import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const index = read('index.html');
const css = read('hybrid-profile.css');
const require = createRequire(import.meta.url);

test('hero owns one dominant gaze axis and only two primary actions', () => {
    const hero = index.slice(index.indexOf('<section id="identity"'), index.indexOf('</section>', index.indexOf('<section id="identity"')) + 10);
    assert.match(hero, /class="profile-hero-stage"[^>]*data-profile-stage="hero"/);
    assert.match(hero, /class="profile-hero"[^>]*data-profile-stage-frame/);
    assert.match(hero, /class="profile-hero-statement"[^>]*data-profile-primary/);
    assert.match(hero, /class="profile-hero-brief"[^>]*data-profile-support/);
    assert.doesNotMatch(hero, /class="profile-now"|Research in progress/);
    assert.equal((hero.match(/class="profile-action(?:\s|\")/g) ?? []).length, 2);
});

test('current work follows the focal hero as a separate compact band', () => {
    const heroEnd = index.indexOf('</section>', index.indexOf('<section id="identity"'));
    const domainMapStart = index.indexOf('<section class="profile-domain-map"');
    const currentStart = index.indexOf('<section class="profile-current"');
    const workStart = index.indexOf('<section id="work"');
    assert.ok(heroEnd < domainMapStart && domainMapStart < currentStart && currentStart < workStart);
    assert.equal((index.match(/data-domain-node/g) ?? []).length, 6);
    assert.equal((index.match(/data-current-item/g) ?? []).length, 3);
});

test('five narrative chapters expose bounded sticky-scene hooks', () => {
    assert.match(index, /id="work" class="profile-section profile-cinematic" data-profile-scene/);
    assert.match(index, /id="method" class="profile-section profile-method profile-cinematic" data-profile-scene/);
    for (const id of ['research', 'career', 'notes']) {
        assert.match(index, new RegExp(`id="${id}" class="[^"]*profile-cinematic-secondary[^"]*" data-profile-scene`));
    }
    assert.equal((index.match(/data-profile-scene-frame/g) ?? []).length, 5);
    assert.match(index, /<script src="profile-motion\.js\?v=[^"]+"><\/script>/);
});

test('motion CSS creates focal stages but restores a static responsive layout', () => {
    assert.match(css, /\.profile-hero-stage\s*\{[^}]*min-height:\s*clamp\(980px,\s*155svh,\s*1480px\)/);
    assert.match(css, /\.profile-hero\s*\{[^}]*position:\s*sticky[^}]*grid-template-columns:\s*minmax\(0,\s*1\.75fr\)\s+minmax\(260px,\s*0\.65fr\)/);
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-cinematic\s*\{[^}]*min-height:\s*clamp\(1040px,\s*165svh,\s*1580px\)/);
    assert.match(css, /body\.profile-motion-enhanced\s+\[data-profile-scene-content\]\s*\{[^}]*transform:/);
    assert.match(css, /@media\s*\(max-width:\s*1100px\)[\s\S]*?\.profile-hero-stage[\s\S]*?min-height:\s*auto/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\[data-profile-scene-content\][^}]*transform:\s*none\s*!important/);
});

test('motion curves separate entry, focal hold, and release states', () => {
    const { heroState, sceneState } = require('../profile-motion.js');
    const sceneEntry = sceneState(0);
    const sceneHoldA = sceneState(0.36);
    const sceneHoldB = sceneState(0.62);
    const sceneExit = sceneState(1);
    assert.ok(sceneEntry.scale > 1.03 && sceneEntry.scale <= 1.05 && sceneEntry.opacity < 0.4);
    assert.deepEqual(sceneHoldA, { scale: 1, y: 0, opacity: 1 });
    assert.deepEqual(sceneHoldB, { scale: 1, y: 0, opacity: 1 });
    assert.ok(sceneExit.scale < 1 && sceneExit.y < 0 && sceneExit.opacity < 0.4);

    const heroStart = heroState(0);
    const heroHold = heroState(0.42);
    const heroExit = heroState(1);
    assert.deepEqual(heroStart, { scale: 1, y: 0, opacity: 1, supportX: 0, supportOpacity: 1 });
    assert.deepEqual(heroHold, heroStart);
    assert.ok(heroExit.scale < 1 && heroExit.y < 0 && heroExit.opacity < 0.2 && heroExit.supportX > 0);
});
