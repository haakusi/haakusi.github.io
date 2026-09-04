import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/ai-programming');
const indexPath = resolve(courseRoot, 'index.html');
const weekPath = resolve(courseRoot, 'week-01.html');
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/ai-programming.html');

for (const path of [indexPath, weekPath, legacyPath]) {
  assert.ok(existsSync(path), `expected AI programming surface to exist: ${path}`);
}

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const week = readFileSync(weekPath, 'utf8');
const legacy = readFileSync(legacyPath, 'utf8');

const fallBlock = catalog.match(/<section class="semester-section" id="2026-fall">([\s\S]*?)<\/section>/)?.[1] ?? '';
const strategicPosition = fallBlock.indexOf('lectures/2026-fall/ai-strategic-decision-making/');
const programmingPosition = fallBlock.indexOf('lectures/2026-fall/ai-programming/');
const quantumPosition = fallBlock.indexOf('lectures/2026-fall/quantum-mechanics-big-data/');
assert.ok(strategicPosition >= 0 && programmingPosition >= 0 && quantumPosition >= 0, 'all 2026 Fall course cards should exist');
assert.ok(strategicPosition < programmingPosition, 'the challenge-semester course should remain first');
assert.ok(programmingPosition < quantumPosition, 'AI programming should appear before the quantum mechanics course');
assert.match(catalog, /href="lectures\/2026-fall\/ai-programming\/"[^>]*data-en="AI Programming"[^>]*data-kr="인공지능프로그래밍"/);
assert.match(catalog, /href="lectures\/2026-fall\/ai-programming\/week-01\.html"[^>]*>W1<\/a>/);

assert.match(index, /data-en="AI Programming" data-kr="인공지능프로그래밍"/);
assert.match(index, /href="week-01\.html"/);
assert.match(legacy, /<meta http-equiv="refresh" content="0; url=ai-programming\/">/);
assert.match(legacy, /'#week-01': 'ai-programming\/week-01\.html'/);

assert.match(week, /<div class="lang-kr" hidden>/);
assert.match(week, /<div class="lang-en">/);
for (const topic of [
  '컴퓨팅 사고',
  '문제 분해',
  '패턴 인식',
  '추상화',
  '알고리즘',
  'NumPy',
  'np.sqrt',
  'np.exp',
  '퍼셉트론',
  '가중합',
  '활성화 함수',
  'AI 결과를 그대로 복사',
  '설명 가능한 이해',
  '수학적 구조',
]) {
  assert.ok(week.includes(topic), `Week 1 should cover: ${topic}`);
}
for (const topic of ['Computational Thinking', 'decomposition', 'pattern recognition', 'abstraction', 'Perceptron', 'weighted sum', 'activation function']) {
  assert.ok(week.toLowerCase().includes(topic.toLowerCase()), `English Week 1 should cover: ${topic}`);
}

for (const privateDetail of ['권윤기', 'DAI5002', '9B312', '18:00', '19:15', '19:30', '20:45', '21:00', 'Office Hour', '결석', '1점감점']) {
  assert.ok(!catalog.includes(privateDetail), `catalog should not expose operational detail: ${privateDetail}`);
  assert.ok(!index.includes(privateDetail), `course home should not expose operational detail: ${privateDetail}`);
  assert.ok(!week.includes(privateDetail), `Week 1 should not expose operational detail: ${privateDetail}`);
}

for (const [htmlPath, html] of [[catalogPath, catalog], [indexPath, index], [weekPath, week], [legacyPath, legacy]]) {
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

console.log('PASS AI programming Week 1 contract');
