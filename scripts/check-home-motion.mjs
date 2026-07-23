import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const index = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('home-style.css', root), 'utf8');
const motionUrl = new URL('home-motion.js', root);

test('home loads one deterministic motion driver and exposes explicit motion hooks', () => {
    assert.match(index, /<script\s+src="home-motion\.js"\s+defer><\/script>/);
    assert.match(index, /class="home-motion-ticker"[^>]+data-motion-ticker/);
    assert.match(index, /class="home-motion-ticker-track"[^>]+data-motion-track="ticker"/);
    assert.match(index, /class="visual-scroll-stage"[^>]+data-scroll-stage="media"/);
    assert.match(index, /class="software-ribbon-track"[^>]+data-scroll-track="media"/);
    assert.match(index, /class="capability-section"[^>]+data-scroll-stage="capability"/);
    assert.match(index, /class="capability-scroll-inner"/);
    assert.match(index, /class="capability-orbit"[^>]+data-scroll-track="capability"/);
});

test('desktop CSS pins both scroll stages and lets JavaScript own the transforms', () => {
    assert.match(css, /body\.home-motion-enhanced\s+\.software-ribbon-track\s*\{[^}]*animation:\s*none/);
    assert.match(css, /\.capability-section\s*\{[^}]*min-height:\s*220vh/);
    assert.match(css, /\.capability-scroll-inner\s*\{[^}]*position:\s*sticky/);
    assert.match(css, /body\.home-motion-enhanced\s+\.capability-orbit\s*\{[^}]*overflow:\s*visible/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.capability-section\s*\{[^}]*min-height:\s*auto/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.capability-scroll-inner\s*\{[^}]*position:\s*static/);
});

test('motion progress is clamped and deterministic without DOM geometry guesses', () => {
    assert.ok(existsSync(motionUrl), 'home-motion.js must exist');

    const source = readFileSync(motionUrl, 'utf8');
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
    vm.runInNewContext(source, context, { filename: 'home-motion.js' });

    const api = context.HomeMotion;
    assert.equal(typeof api?.init, 'function');
    assert.equal(typeof api?.refresh, 'function');
    assert.equal(api.progressForStage(124, 1584, 720, 124), 0);
    assert.equal(api.progressForStage(-740, 1584, 720, 124), 1);
    assert.equal(api.progressForStage(1000, 1584, 720, 124), 0);
    assert.equal(api.progressForStage(-2000, 1584, 720, 124), 1);
    assert.equal(api.trackTravel(2400, 1280, 34), 1188);
    assert.equal(api.trackTravel(1000, 1280, 34), 0);
    assert.equal(typeof listeners.DOMContentLoaded, 'function');
});
