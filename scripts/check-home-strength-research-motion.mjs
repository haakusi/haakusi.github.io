import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [home, css] = await Promise.all([
    read('index.html'),
    read('hybrid-profile.css'),
]);

test('section 02 maps five core strengths one-to-one to career evidence', () => {
    assert.match(home, /02 \/ CORE STRENGTHS/);
    assert.equal((home.match(/data-core-strength/g) ?? []).length, 5);
    assert.equal((home.match(/data-strength-evidence/g) ?? []).length, 5);

    for (const phrase of [
        'Connect device state to product behavior',
        'Turn boundaries into executable platforms',
        'Make AI-generated change verifiable',
        'Own discovery through productization',
        'Scale the method across teams',
        '장치 상태를 제품 동작까지 연결',
        '문제 정의부터 제품화까지 책임',
        '작업법을 팀으로 확장',
        'BioStar Core',
        'BioStar Developer Portal',
        'Angular→React',
        'SK Networks Family AI Camp 27·28',
    ]) {
        assert.ok(home.includes(phrase), `missing strength evidence: ${phrase}`);
    }
});

test('active research exposes architecture boundaries without paper internals', () => {
    assert.equal((home.match(/data-public-research-flow/g) ?? []).length, 2);
    assert.equal((home.match(/data-research-node/g) ?? []).length, 10);
    for (const phrase of [
        'Domain knowledge',
        'Research question',
        'Candidate retrieval',
        'Multimodal evidence',
        'Explanation &amp; evaluation',
        'Classical baseline',
        'Candidate family',
        'Shared evaluation gate',
        'Select or reject',
        'Public architecture boundary',
        '세부 방법과 구현은 논문 공개 전까지 비공개',
    ]) {
        assert.ok(home.includes(phrase), `missing safe research boundary: ${phrase}`);
    }
    assert.doesNotMatch(home, /hyperparameter|dataset split|loss function|novel algorithm|핵심 알고리즘|하이퍼파라미터/i);
});

test('sections 01 through 05 use bounded progressive scenes', () => {
    for (const id of ['work', 'method', 'research', 'career', 'notes']) {
        assert.match(home, new RegExp(`id="${id}" class="[^"]*profile-cinematic[^"]*" data-profile-scene`));
    }
    assert.equal((home.match(/data-profile-scene-frame/g) ?? []).length, 5);
    assert.equal((home.match(/data-profile-scene-content/g) ?? []).length, 5);
    assert.match(css, /body\.profile-motion-enhanced\s+\.profile-cinematic-secondary/);
});

test('strength map and research flows retain readable responsive and reduced-motion fallbacks', () => {
    assert.match(css, /\.profile-strength-row\s*\{[^}]*grid-template-columns:/);
    assert.match(css, /\.profile-strength-link::after/);
    assert.match(css, /\.profile-strength-evidence\s*\{[^}]*background:/);
    assert.match(css, /\.profile-research-flow\s*\{[^}]*grid-template-columns:\s*repeat\(5,/);
    assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.profile-strength-row[\s\S]*?grid-template-columns:\s*1fr/);
    assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.profile-research-flow[\s\S]*?grid-template-columns:\s*1fr/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.profile-strength-row/);
});
