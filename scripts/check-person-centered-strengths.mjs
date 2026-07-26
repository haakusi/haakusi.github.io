import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [home, css, domainCss] = await Promise.all([
    read('index.html'),
    read('hybrid-profile.css'),
    read('home-domain-map.css'),
]);
const decodedHome = home.replaceAll('&amp;', '&');

test('home leads with the verified device-to-product identity', () => {
    for (const phrase of [
        'From device packets',
        'to products teams',
        'can trust.',
        '장치 패킷부터',
        '팀이 신뢰할',
        '제품 시스템까지.',
        'physical-device state',
        '장치 상태',
    ]) {
        assert.ok(decodedHome.includes(phrase), `missing lead identity: ${phrase}`);
    }
    assert.ok(home.indexOf('From device packets') < home.indexOf('ACTIVE RESEARCH'));
});

test('home makes five career-grounded core strengths explicit', () => {
    const order = ['identity', 'work', 'method', 'research', 'career', 'notes', 'contact'];
    const positions = order.map((id) => {
        const position = home.indexOf(`id="${id}"`);
        assert.ok(position > -1, `missing #${id}`);
        return position;
    });
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.equal((home.match(/data-core-strength/g) ?? []).length, 5);
    assert.equal((home.match(/data-strength-evidence/g) ?? []).length, 5);
    for (const [en, kr] of [
        ['Connect device state to product behavior', '장치 상태를 제품 동작까지 연결'],
        ['Turn boundaries into executable platforms', '경계를 실행 가능한 플랫폼으로 전환'],
        ['Make AI-generated change verifiable', 'AI가 만든 변화를 검증 가능하게'],
        ['Own discovery through productization', '문제 정의부터 제품화까지 책임'],
        ['Scale the method across teams', '작업법을 팀으로 확장'],
    ]) {
        assert.ok(home.includes(en), `missing strength: ${en}`);
        assert.ok(home.includes(kr), `missing strength: ${kr}`);
    }
});

test('home maps strengths to public project evidence and careful leadership proof', () => {
    for (const phrase of [
        'HBrain → BioStar Core',
        'Gateway → BioStar Developer Portal',
        'Angular→React · Version-aware E2E',
        '1 PERSON / 8 WEEKS',
        'Codeit',
        'SK Networks Family AI Camp 27·28',
        '반복 가능한 워크플로와 리뷰 게이트',
    ]) {
        assert.ok(decodedHome.includes(phrase), `missing mapped evidence: ${phrase}`);
    }
    assert.doesNotMatch(home, /fit score|적합도 점수|special promotion|특별승진|RabbitMQ|\bSolis\b|no_read|source\/phd/i);
});

test('strength evidence map is editorial, responsive, focus-visible, and motion-safe', () => {
    assert.match(css, /\.profile-strength-map\s*\{/);
    assert.match(css, /\.profile-strength-row\s*\{/);
    assert.match(css, /\.profile-strength-evidence\s*\{/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-strength-row/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-strength-evidence/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-strength-row/);
});

test('device-to-cloud identity becomes five career domains plus one learning path', () => {
    for (const phrase of ['NETWORK OPERATIONS', 'SENSORS &amp; DEVICES', 'IDENTITY PLATFORM', 'PRODUCT &amp; DEVEX', 'AI-NATIVE VERIFICATION', 'RESEARCH + LEARNING']) {
        assert.ok(home.includes(phrase), `missing accumulated domain: ${phrase}`);
    }
    assert.equal((home.match(/data-domain-node(?:\s|>)/g) ?? []).length, 5);
    assert.equal((home.match(/data-domain-exploration(?:\s|>)/g) ?? []).length, 1);
    assert.match(domainCss, /\.profile-domain-axis\s*\{[^}]*grid-template-columns:\s*repeat\(6,/);
});
