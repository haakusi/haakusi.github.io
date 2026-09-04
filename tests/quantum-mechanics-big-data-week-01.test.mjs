import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data');
const indexPath = resolve(courseRoot, 'index.html');
const weekPath = resolve(courseRoot, 'week-01.html');
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data.html');

for (const path of [indexPath, weekPath, legacyPath]) {
  assert.ok(existsSync(path), `expected course surface to exist: ${path}`);
}

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const week = readFileSync(weekPath, 'utf8');
const legacy = readFileSync(legacyPath, 'utf8');

assert.match(catalog, /<section class="semester-section" id="2026-fall">/);
assert.match(catalog, /data-en="2026 Fall" data-kr="2026년 가을학기"/);
assert.match(catalog, /href="lectures\/2026-fall\/quantum-mechanics-big-data\/"[^>]*data-en="The World of Quantum Mechanics and Big Data"[^>]*data-kr="양자역학의세계와빅데이터"/);
assert.match(catalog, /href="lectures\/2026-fall\/quantum-mechanics-big-data\/week-01\.html"[^>]*>W1<\/a>/);

assert.match(index, /data-en="The World of Quantum Mechanics and Big Data" data-kr="양자역학의세계와빅데이터"/);
assert.match(index, /href="week-01\.html"/);
assert.match(index, /data-en="Week 1" data-kr="1주차"/);
assert.match(legacy, /<meta http-equiv="refresh" content="0; url=quantum-mechanics-big-data\/">/);
assert.match(legacy, /'#week-01': 'quantum-mechanics-big-data\/week-01\.html'/);
assert.match(legacy, /location\.replace\(routes\[location\.hash\] \|\| 'quantum-mechanics-big-data\/'\)/);

const legacyDefault = resolve(dirname(legacyPath), 'quantum-mechanics-big-data/index.html');
const legacyWeek = resolve(dirname(legacyPath), 'quantum-mechanics-big-data/week-01.html');
assert.ok(existsSync(legacyDefault), 'legacy default redirect should resolve to the course home');
assert.ok(existsSync(legacyWeek), 'legacy Week 1 hash redirect should resolve to Week 1');

assert.match(week, /<div class="lang-kr" hidden>/);
assert.match(week, /<div class="lang-en">/);
assert.match(week, /6\.62607015 × 10<sup>−34<\/sup> J·s/);
assert.match(week, /1\.054571817 × 10<sup>−34<\/sup> J·s/);

const requiredTopics = [
  '고전역학에서 양자역학으로',
  '전자기파',
  'Stark effect',
  '양자 얽힘',
  'E = hf',
  '테일러 전개',
  '0! = 1',
  '고유 스핀',
  '브라-켓',
  '복소켤레',
  '직교정규성',
  '완전성 관계',
  '내적과 외적',
  '불확정성 원리',
  'Born 규칙',
  'Bloch 구면',
  'Pauli 행렬',
  '페르미온',
  '보손',
  '연산자',
  'z축 스핀 측정',
  'Normalization check',
];

for (const topic of requiredTopics) {
  assert.ok(week.includes(topic), `Week 1 should cover source topic: ${topic}`);
}

const koreanBlock = week.match(/<div class="lang-kr" hidden>([\s\S]*?)<div class="lang-en">/)?.[1] ?? '';
const englishBlock = week.match(/<div class="lang-en">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? '';
assert.ok(koreanBlock, 'Korean Week 1 content block should be extractable');
assert.ok(englishBlock, 'English Week 1 content block should be extractable');

const mirroredTopics = [
  ['고전역학에서 양자역학으로', 'From Classical Mechanics to Quantum Mechanics'],
  ['전자기파', 'electromagnetic wave'],
  ['Stark effect', 'Stark effect'],
  ['양자 얽힘', 'Quantum entanglement'],
  ['E = hf', 'E = hf'],
  ['테일러 전개', 'Taylor Expansion'],
  ['0! = 1', '0! = 1'],
  ['고유 스핀', 'Intrinsic Spin'],
  ['브라-켓', 'Bra-ket'],
  ['복소켤레', 'complex conjugate'],
  ['직교정규성', 'Orthonormality'],
  ['완전성 관계', 'Completeness relation'],
  ['내적과 외적', 'Dot and Cross Products'],
  ['불확정성 원리', 'uncertainty principle'],
  ['Born 규칙', 'Born rule'],
  ['Bloch 구면', 'Bloch sphere'],
  ['Pauli 행렬', 'Pauli matrices'],
  ['페르미온', 'Fermions'],
  ['보손', 'bosons'],
  ['연산자', 'Operators'],
  ['z축 스핀 측정', 'Measuring Spin along z'],
  ['정규화 보정', 'Normalization check'],
];

for (const [koreanTopic, englishTopic] of mirroredTopics) {
  assert.ok(koreanBlock.includes(koreanTopic), `Korean block should cover: ${koreanTopic}`);
  assert.ok(englishBlock.toLowerCase().includes(englishTopic.toLowerCase()), `English block should cover: ${englishTopic}`);
}

assert.match(koreanBlock, /해석함수|잔여항/);
assert.match(englishBlock, /analytic|remainder/i);

assert.match(week, /∆x∆p ≥ ℏ\/2/);
assert.match(week, /e<sup>iφ<\/sup>/);
assert.match(week, /S<sub>z<\/sub>\|\+z⟩ = \+ℏ\/2 \|\+z⟩/);
assert.match(week, /S<sub>z<\/sub>\|−z⟩ = −ℏ\/2 \|−z⟩/);
assert.match(week, /1\/√2 \(1, 0\)<sup>T<\/sup>.*norm.*1\/2/s);
assert.match(week, /1\/√2 \(1, 1\)<sup>T<\/sup>.*norm.*1/s);

const pairedNodes = week.match(/data-en="[^"]+"\s+data-kr="[^"]+"/g) ?? [];
assert.ok(pairedNodes.length >= 7, 'Week 1 should expose bilingual structural labels');

for (const [htmlPath, html] of [[catalogPath, catalog], [indexPath, index], [weekPath, week]]) {
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

console.log('PASS quantum mechanics and big data Week 1 contract');
