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

test('home makes the recurring four-step operating model explicit', () => {
    const order = ['identity', 'work', 'method', 'research', 'career', 'notes', 'contact'];
    const positions = order.map((id) => {
        const position = home.indexOf(`id="${id}"`);
        assert.ok(position > -1, `missing #${id}`);
        return position;
    });
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.equal((home.match(/data-method-step/g) ?? []).length, 4);
    for (const [en, kr] of [
        ['Read the real boundary', '현실의 경계를 읽기'],
        ['Form an executable contract', '실행 가능한 계약으로 추상화'],
        ['Verify before trust', '신뢰 전에 검증'],
        ['Leave a reusable method', '반복 가능한 작업법 남기기'],
    ]) {
        assert.ok(home.includes(en), `missing method step: ${en}`);
        assert.ok(home.includes(kr), `missing method step: ${kr}`);
    }
});

test('home names three evidence-aligned mission areas and careful leadership proof', () => {
    assert.equal((home.match(/data-fit-mission/g) ?? []).length, 3);
    for (const phrase of [
        'AI & Developer Platform',
        'Device-to-Cloud Platform',
        'Engineering Productivity',
        'Codeit',
        'SK Networks Family AI Camp 27 and 28',
        '문제 정의·기술 선택·구현·검증',
    ]) {
        assert.ok(decodedHome.includes(phrase), `missing mission or leadership proof: ${phrase}`);
    }
    assert.doesNotMatch(home, /fit score|적합도 점수|special promotion|특별승진|RabbitMQ|\bSolis\b|no_read|source\/phd/i);
});

test('operating model is editorial, responsive, focus-visible, and motion-safe', () => {
    assert.match(css, /\.profile-method-loop\s*\{/);
    assert.match(css, /\.profile-method-step\s*\{/);
    assert.match(css, /\.profile-mission-list\s*\{/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-method-layout/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-method-step/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-method-step/);
});

test('device-to-cloud identity becomes one connected domain path', () => {
    for (const phrase of ['NETWORK OPERATIONS', 'SENSORS &amp; DEVICES', 'IDENTITY PLATFORM', 'PRODUCT &amp; DEVEX', 'AI-NATIVE VERIFICATION', 'APPLIED RESEARCH']) {
        assert.ok(home.includes(phrase), `missing accumulated domain: ${phrase}`);
    }
    assert.equal((home.match(/data-domain-node/g) ?? []).length, 6);
    assert.match(domainCss, /\.profile-domain-axis\s*\{[^}]*grid-template-columns:\s*repeat\(6,/);
});
