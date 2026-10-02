import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data');
const indexPath = resolve(courseRoot, 'index.html');
const weekOnePath = resolve(courseRoot, 'week-01.html');
const weekTwoPath = resolve(courseRoot, 'week-02.html');
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data.html');
const localMemoPath = process.env.QUANTUM_WEEK_02_MEMO;

assert.ok(existsSync(weekTwoPath), 'Week 2 page should exist');

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const weekOne = readFileSync(weekOnePath, 'utf8');
const weekTwo = readFileSync(weekTwoPath, 'utf8');
const legacy = readFileSync(legacyPath, 'utf8');

assert.match(catalog, /quantum-mechanics-big-data\/week-02\.html" class="week-link">W2<\/a>/);
assert.match(index, /href="week-02\.html"/);
assert.match(index, /data-en="Week 2" data-kr="2주차"/);
assert.match(weekOne, /href="week-02\.html" class="week-link">W2<\/a>/);
assert.match(legacy, /'#week-02': 'quantum-mechanics-big-data\/week-02\.html'/);
assert.ok(existsSync(resolve(dirname(legacyPath), 'quantum-mechanics-big-data/index.html')), 'legacy default route should resolve');
assert.ok(existsSync(resolve(dirname(legacyPath), 'quantum-mechanics-big-data/week-01.html')), 'legacy Week 1 route should resolve');
assert.ok(existsSync(resolve(dirname(legacyPath), 'quantum-mechanics-big-data/week-02.html')), 'legacy Week 2 route should resolve');

assert.match(weekTwo, /<section class="week-section" id="week-02">/);
assert.match(weekTwo, /<div class="lang-kr" hidden>/);
assert.match(weekTwo, /<div class="lang-en">/);
assert.match(weekTwo, /href="week-01\.html" class="week-link">W1<\/a>/);
assert.match(weekTwo, /href="week-02\.html" class="week-link current">W2<\/a>/);

const koreanBlock = weekTwo.match(/<div class="lang-kr" hidden>([\s\S]*?)<div class="lang-en">/)?.[1] ?? '';
const englishBlock = weekTwo.match(/<div class="lang-en">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? '';
assert.ok(koreanBlock, 'Korean Week 2 content block should be extractable');
assert.ok(englishBlock, 'English Week 2 content block should be extractable');

const mirroredTopics = [
  ['고윳값 문제', 'Eigenvalue Problem'],
  ['중첩과 선형결합', 'Superposition and Linear Combinations'],
  ['힐베르트 공간', 'Hilbert Space'],
  ['내적', 'inner product'],
  ['코시 수열', 'Cauchy sequence'],
  ['두 종류의 완비성', 'Two Meanings of Completeness'],
  ['직교정규 기저', 'Orthonormal Basis'],
  ['브라·켓과 외적', 'Bras, Kets, and Outer Products'],
  ['확률 진폭', 'probability amplitude'],
  ['회전 연산자', 'Rotation Operators'],
  ['테일러 전개', 'Taylor Expansion'],
  ['페르미온과 보손', 'Fermions and Bosons'],
  ['연산자와 양자 게이트', 'Operators and Quantum Gates'],
];

for (const [koreanTopic, englishTopic] of mirroredTopics) {
  assert.ok(koreanBlock.includes(koreanTopic), `Korean block should cover: ${koreanTopic}`);
  assert.ok(englishBlock.toLowerCase().includes(englishTopic.toLowerCase()), `English block should cover: ${englishTopic}`);
}

const mirroredFormulas = [
  'Â|a⟩ = a|a⟩',
  '⟨E<sub>m</sub>|E<sub>n</sub>⟩ = δ<sub>mn</sub>',
  '∑<sub>n</sub>|E<sub>n</sub>⟩⟨E<sub>n</sub>| = I',
  '|ψ⟩ = ∑<sub>n</sub> c<sub>n</sub>|E<sub>n</sub>⟩',
  'c<sub>n</sub> = ⟨E<sub>n</sub>|ψ⟩',
  'P(E<sub>n</sub>) = |c<sub>n</sub>|<sup>2</sup>',
  '∑<sub>n</sub>|c<sub>n</sub>|<sup>2</sup> = 1',
  'R<sub>y</sub>(θ)',
  'cos(θ/2)I − i sin(θ/2)σ<sub>y</sub>',
  'R<sub>x</sub>(θ)',
  'R<sub>z</sub>(θ)',
  '[[cos(θ/2), −i sin(θ/2)], [−i sin(θ/2), cos(θ/2)]]',
  '[[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]',
  '[[e<sup>−iθ/2</sup>, 0], [0, e<sup>iθ/2</sup>]]',
];

for (const [language, block] of [['Korean', koreanBlock], ['English', englishBlock]]) {
  for (const formula of mirroredFormulas) {
    assert.ok(block.includes(formula), `${language} block should include formula: ${formula}`);
  }
}

const mirroredCorrections = [
  ['유리수 공간은 완비가 아니지만 실수 공간은 완비', 'rational numbers are not complete, whereas the real numbers are complete'],
  ['기저의 완전성 관계와는 연결되어 있지만 같은 정의는 아니다', 'they are not the same definition'],
  ['불확정성 원리와 같은 뜻이 아니다', 'This is not the uncertainty principle'],
  ['스핀 성분의 측정 고윳값', 'measured electron spin component has eigenvalues ±ℏ/2'],
  ['양자 게이트는 유니터리 연산자', 'quantum gate is a unitary operator'],
];

for (const [koreanCorrection, englishCorrection] of mirroredCorrections) {
  assert.ok(koreanBlock.includes(koreanCorrection), `Korean correction should be explicit: ${koreanCorrection}`);
  assert.ok(englishBlock.toLowerCase().includes(englishCorrection.toLowerCase()), `English correction should be explicit: ${englishCorrection}`);
}

if (localMemoPath) {
  assert.ok(existsSync(localMemoPath), `local Week 2 study note should exist: ${localMemoPath}`);
  const localMemo = readFileSync(localMemoPath, 'utf8');
  for (const memoContent of [
    '# 양자역학의세계와빅데이터 — 2주차 강의 정리',
    '\\hat A|a\\rangle = a|a\\rangle',
    '유리수 공간 $\\mathbb Q$에서는 극한이 공간 밖에 있으므로 완비가 아니다',
    '$\\sum_n |E_n\\rangle\\langle E_n|=I$',
    '직교성과 불확정성 원리를 같은 뜻으로 보면 안 된다',
    'P(E_n)=|c_n|^2',
    'R_y(\\theta)=',
    '\\cos\\frac\\theta2&-\\sin\\frac\\theta2',
    '모든 보손의 고윳값은 $\\hbar$”라고 일반화해서는 안 된다',
    '모든 연산자가 gate는 아니며',
  ]) {
    assert.ok(localMemo.includes(memoContent), `local memo should include substantive content: ${memoContent}`);
  }
}

for (const [htmlPath, html] of [[catalogPath, catalog], [indexPath, index], [weekOnePath, weekOne], [weekTwoPath, weekTwo], [legacyPath, legacy]]) {
  for (const href of html.matchAll(/href="([^"]+)"/g)) {
    const target = href[1];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const cleanTarget = target.split('#')[0].split('?')[0];
    if (!cleanTarget) continue;
    const resolved = resolve(dirname(htmlPath), cleanTarget);
    const candidate = cleanTarget.endsWith('/') ? resolve(resolved, 'index.html') : resolved;
    assert.ok(existsSync(candidate), `${htmlPath} has a missing local link target: ${target}`);
  }
}

console.log('PASS quantum mechanics and big data Week 2 contract');
