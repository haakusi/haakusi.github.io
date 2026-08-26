import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const html = await read('portfolio.html');
const css = await read('simple-site.css').catch(() => '');

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

test('case details stay native and require no cinematic interaction runtime', () => {
    assert.doesNotMatch(html, /portfolio-interactions\.js|portfolio-case-details\.css/);
    assert.equal((html.match(/<details\s+class="case-detail"/g) ?? []).length, 9);
});

test('detail styling is a simple readable disclosure with a mobile fallback', () => {
    assert.match(css, /\.case-accordion\s*\{/);
    assert.match(css, /\.case-accordion summary\s*\{/);
    assert.match(css, /\.case-detail-body/);
    assert.match(css, /@media\s*\(max-width:\s*680px\)/);
    assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
});
