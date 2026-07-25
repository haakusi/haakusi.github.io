import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const html = await read('portfolio.html');
const css = await read('portfolio-case-details.css').catch(() => '');
const script = await read('portfolio-interactions.js').catch(() => '');

test('all three flagship cases expose implementation evidence as native details', () => {
    assert.equal((html.match(/class="case-implementation"/g) ?? []).length, 3);
    assert.equal((html.match(/data-case-accordion/g) ?? []).length, 3);
    assert.equal((html.match(/<details\s+class="case-detail"/g) ?? []).length, 9);
    assert.equal((html.match(/<summary>/g) ?? []).length, 9);
    for (const group of ['portal-implementation', 'modernization-implementation', 'device-cloud-implementation']) {
        assert.equal((html.match(new RegExp(`name="${group}"`, 'g')) ?? []).length, 3);
    }
});

test('stack labels are connected to each case instead of presented as a generic skill cloud', () => {
    for (const phrase of [
        'OpenAPI', 'MCP', 'Linux/AWS', 'Device SDK',
        'TypeScript', 'React', 'Angular', 'Playwright',
        'C++', 'Java/Kotlin', 'Spring Cloud Gateway', 'Apache Ignite', 'MariaDB', 'Microsoft SQL Server',
    ]) {
        assert.ok(html.includes(phrase), `missing implementation technology: ${phrase}`);
    }
    assert.equal((html.match(/class="case-stack"/g) ?? []).length, 3);
});

test('implementation evidence covers architecture, verification, and troubleshooting in both languages', () => {
    for (const phrase of [
        'Architecture &amp; implementation', '아키텍처 · 구현',
        'Verification &amp; troubleshooting', '검증 · 트러블슈팅',
        'routing, back navigation, and state ownership', '라우팅·뒤로가기·상태 소유권',
        '40%+', '30-second range', '30초대',
    ]) {
        assert.ok(html.includes(phrase), `missing case-study evidence: ${phrase}`);
    }
    const localizedTags = html.match(/<[^>]*\bdata-en="[^"]*"[^>]*>/g) ?? [];
    for (const tag of localizedTags) assert.match(tag, /\bdata-kr="[^"]*"/);
});

test('case interaction is progressively enhanced and scoped to one project', async () => {
    assert.match(html, /portfolio-case-details\.css\?v=20260726-case1/);
    assert.match(html, /portfolio-interactions\.js\?v=20260726-case1/);
    assert.match(script, /closest\('\[data-case-accordion\]'\)/);
    assert.match(script, /if\s*\(!current\.open\)\s*return/);
    assert.match(script, /detail\.open\s*=\s*false/);
    assert.match(script, /portfolio-details-enhanced/);
    assert.doesNotMatch(script, /preventDefault\(\)/);
});

test('detail styling uses the career tokens and keeps focus, open state, mobile, and reduced motion explicit', () => {
    assert.match(css, /var\(--skin-/);
    assert.match(css, /body\.portfolio-page \.case-pair\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important[^}]*gap:\s*0\s*!important/);
    assert.match(css, /\.case-detail\s*>\s*summary:focus-visible/);
    assert.match(css, /\.case-detail\[open\]/);
    assert.match(css, /@media\s*\(max-width:\s*680px\)/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
});
