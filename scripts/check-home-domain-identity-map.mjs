import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const html = await read('index.html');
const css = await read('home-domain-map.css').catch(() => '');
const heroEnd = html.indexOf('</section>', html.indexOf('<section id="identity"')) + 10;
const currentStart = html.indexOf('<section class="profile-current"');
const opening = html.slice(heroEnd, currentStart);

const domains = [
    ['NETWORK OPERATIONS', '네트워크 운영'],
    ['SENSORS &amp; DEVICES', '센서·장치'],
    ['IDENTITY PLATFORM', '인증·출입 플랫폼'],
    ['PRODUCT &amp; DEVEX', '제품·개발자 경험'],
    ['AI-NATIVE VERIFICATION', 'AI-native 검증'],
    ['APPLIED RESEARCH', '응용 연구'],
];

const phases = [
    ['2018—2020', 'SK Telecom TANGO'],
    ['2020—2021', 'Road-Safety Device Software', '교통안전 장치 소프트웨어'],
    ['2021—2024', 'Biometric Access Platform', '생체인증 출입 플랫폼'],
    ['2025—PRESENT', 'AI Products &amp; Developer Platform', 'AI 제품·개발자 플랫폼'],
    ['2025—PRESENT', 'AI-native Transformation &amp; Verification', 'AI-native 전환·검증'],
    ['2026—PRESENT', 'Applied AI &amp; Quantum Research', '응용 AI·양자 연구'],
];

test('the first scroll replaces KPI tiles with one 16:9 engineering identity map', async () => {
    assert.match(opening, /class="profile-domain-map"[^>]*data-profile-domain-map/);
    assert.doesNotMatch(opening, /class="profile-evidence"/);
    assert.doesNotMatch(opening, /~200K LOC|40%\+|commit|push|KPI/i);
    assert.match(html, /home-domain-map\.css\?v=20260726-map3/);
    assert.match(opening, /images\/career\/identity\/sewon-park-domain-map\.webp/);
    assert.match(opening, /width="1536" height="864"/);

    const info = await stat(new URL('../images/career/identity/sewon-park-domain-map.webp', import.meta.url));
    assert.ok(info.size > 80_000, 'identity map must be a substantive generated visual');
});

test('the map names six accumulated domains in both languages without activity metrics', () => {
    assert.equal((opening.match(/data-domain-node/g) ?? []).length, 6);
    for (const [english, korean] of domains) {
        assert.ok(opening.includes(english), `missing English domain: ${english}`);
        assert.ok(opening.includes(korean), `missing Korean domain: ${korean}`);
    }
    assert.match(opening, /Not a stack list\. A connected engineering path\./);
    assert.match(opening, /기술 목록이 아닌, 연결되어 축적된 엔지니어링 경로입니다\./);
    assert.match(opening, /Concept visualization · not a product screenshot/);
});

test('the illustration is anchored by an eight-year title and six dated career chapters', () => {
    assert.match(opening, /Eight years across six connected engineering domains\./);
    assert.match(opening, /8년, 여섯 개의 연결된 엔지니어링 도메인\./);
    assert.equal((opening.match(/<time[^>]*>/g) ?? []).length, 6);
    for (const [years, english, korean] of phases) {
        assert.ok(opening.includes(years), `missing career years: ${years}`);
        assert.ok(opening.includes(english), `missing career title: ${english}`);
        if (korean) assert.ok(opening.includes(korean), `missing Korean career title: ${korean}`);
    }
});

test('the information design preserves a visual-first ratio and accessible fallbacks', () => {
    assert.match(css, /\.profile-domain-map-frame\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/);
    assert.match(css, /\.profile-domain-map-copy\s*\{[^}]*width:\s*min\(30%/);
    assert.match(css, /\.profile-domain-map-visual\s+img\s*\{[^}]*object-fit:\s*cover/);
    assert.match(css, /\.profile-domain-axis\s*\{[^}]*grid-template-columns:\s*repeat\(6,/);
    assert.match(css, /\.profile-domain-axis\s+time\s*\{/);
    assert.match(css, /\.profile-domain-axis\s+b\s*\{/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(css, /:focus-visible/);
    assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
});

test('the permanently dark visual frame keeps readable type in light mode', () => {
    assert.match(css, /body\.career-home\s+\.profile-domain-map-frame\s+h3\s*\{[^}]*color:\s*#f4f6f2\s*!important/);
    assert.match(css, /body\.career-home\s+\.profile-domain-map-frame\s+a\s*\{[^}]*color:\s*#9adbcf\s*!important/);
});
