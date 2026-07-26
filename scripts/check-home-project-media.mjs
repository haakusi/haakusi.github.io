import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const html = await read('index.html');
const css = await read('home-work-media.css').catch(() => '');
const workStart = html.indexOf('<section id="work"');
const workEnd = html.indexOf('<section id="method"');
const work = html.slice(workStart, workEnd);

const visuals = [
    'developer-portal-console.webp',
    'version-aware-e2e.webp',
    'access-ui-modernization.webp',
    'device-event-core.webp',
    'road-safety-radar.webp',
    'telecom-network-ops.webp',
];

test('the home selected-work rows contain six persisted project visuals', async () => {
    assert.match(html, /home-work-media\.css\?v=20260726-media1/);
    assert.equal((html.match(/class="profile-work-media"/g) ?? []).length, 3);
    assert.equal((html.match(/class="profile-work-frame/g) ?? []).length, 6);

    for (const filename of visuals) {
        const path = `images/career/showcase/${filename}`;
        assert.equal((html.match(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length, 1);
        const info = await stat(new URL(`../${path}`, import.meta.url));
        assert.ok(info.size > 50_000, `${filename} must remain a substantive visual asset`);
    }
});

test('every work row keeps one destination and two accessible media cells', () => {
    assert.equal((work.match(/class="profile-work-row"/g) ?? []).length, 3);
    assert.equal((work.match(/<figure class="profile-work-media"/g) ?? []).length, 3);
    assert.equal((work.match(/<img[^>]+loading="lazy"[^>]+decoding="async"/g) ?? []).length, 6);
    assert.equal((work.match(/<figcaption[^>]*data-en=/g) ?? []).length, 6);
    assert.match(html, /Original concept visualizations · not product screenshots/);
    assert.match(html, /직접 제작한 콘셉트 시각화 · 실제 제품 스크린샷이 아닙니다/);
});

test('the home media cells are editorial, responsive, and motion-safe', () => {
    assert.match(css, /\.profile-work-row\s*\{[^}]*grid-template-columns:[^;]*minmax\(250px,/);
    assert.match(css, /\.profile-work-media\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:/);
    assert.match(css, /\.profile-work-frame\s+img\s*\{[^}]*object-fit:\s*cover/);
    assert.match(css, /\.profile-work-row:is\(:hover,\s*:focus-visible\)[\s\S]*?\.profile-work-frame img/);
    assert.match(css, /@media\s*\(max-width:\s*1100px\)/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
});
