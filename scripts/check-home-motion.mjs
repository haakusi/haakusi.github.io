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
    assert.match(index, /class="visual-scroll-stage"[^>]+data-scroll-stage="media"/);
    assert.match(index, /class="software-ribbon-track"[^>]+data-scroll-track="media"/);
    assert.match(index, /class="capability-section"[^>]+data-scroll-stage="capability"/);
    assert.match(index, /class="capability-scroll-inner"/);
    assert.match(index, /class="capability-orbit"[^>]+data-scroll-track="capability"/);
});

test('home declares a cinematic scene system across narrative chapters', () => {
    assert.match(index, /class="home-scene-vignette"[^>]+data-scene-vignette[^>]+aria-hidden="true"/);
    assert.ok((index.match(/data-cinematic-scene="[^"]+"/g) ?? []).length >= 8, 'at least eight major Home chapters should expose a scene stage');
    assert.ok((index.match(/data-cinematic-content/g) ?? []).length >= 16, 'scene stages should animate existing semantic content groups');
    assert.match(css, /\.home-scene-vignette\s*\{[^}]*position:\s*fixed[^}]*pointer-events:\s*none[^}]*opacity:\s*var\(--home-vignette-opacity,\s*0\)/);
    assert.match(css, /\.home-scene-vignette::before,[\s\S]*?\.home-scene-vignette::after\s*\{[^}]*background:\s*linear-gradient/);
    assert.match(css, /\[data-cinematic-scene\]\s*\{[^}]*overflow:\s*clip/);
    assert.match(css, /body\.home-motion-enhanced\s+\[data-cinematic-content\]\s*\{[^}]*opacity:\s*var\(--scene-opacity,\s*1\)[^}]*transform:[^}]*var\(--scene-scale,\s*1\)[^}]*filter:\s*blur\(var\(--scene-blur,\s*0px\)\)/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.home-scene-vignette\s*\{[^}]*display:\s*none/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\[data-cinematic-content\][\s\S]*?\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important[^}]*filter:\s*none\s*!important/);
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
    assert.equal(api.sceneProgressForRect(720, 720, 720, 124), 0);
    assert.equal(api.sceneProgressForRect(62, 720, 720, 124), 0.5);
    assert.equal(api.sceneProgressForRect(-596, 720, 720, 124), 1);
    assert.deepEqual({ ...api.sceneFrameForProgress(0) }, {
        scale: 1.16,
        translateY: 48,
        opacity: 0.42,
        blur: 8,
        shade: 0.66,
    });
    assert.deepEqual({ ...api.sceneFrameForProgress(0.5) }, {
        scale: 1,
        translateY: 0,
        opacity: 1,
        blur: 0,
        shade: 0.14,
    });
    assert.deepEqual({ ...api.sceneFrameForProgress(1) }, {
        scale: 0.92,
        translateY: -42,
        opacity: 0.46,
        blur: 6,
        shade: 0.68,
    });
    assert.deepEqual({ ...api.sceneFrameForProgress(-1) }, { ...api.sceneFrameForProgress(0) });
    assert.deepEqual({ ...api.sceneFrameForProgress(2) }, { ...api.sceneFrameForProgress(1) });
    assert.equal(typeof listeners.DOMContentLoaded, 'function');
});
