import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/ai-strategic-decision-making');
const indexPath = resolve(courseRoot, 'index.html');
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/ai-strategic-decision-making.html');
const weekPaths = Array.from({ length: 6 }, (_, i) =>
  resolve(courseRoot, `week-${String(i + 1).padStart(2, '0')}.html`),
);

for (const path of [indexPath, legacyPath, ...weekPaths]) {
  assert.ok(existsSync(path), `expected AI strategic decision-making surface to exist: ${path}`);
}

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const legacy = readFileSync(legacyPath, 'utf8');
const weeks = weekPaths.map((path) => readFileSync(path, 'utf8'));

const fallBlock = catalog.match(/<section class="semester-section" id="2026-fall">([\s\S]*?)<\/section>/)?.[1] ?? '';
assert.ok(fallBlock, '2026 Fall catalog block should be extractable');
const aiCardPosition = fallBlock.indexOf('lectures/2026-fall/ai-strategic-decision-making/');
const quantumCardPosition = fallBlock.indexOf('lectures/2026-fall/quantum-mechanics-big-data/');
assert.ok(aiCardPosition >= 0, '2026 Fall should link the AI strategic decision-making course');
assert.ok(quantumCardPosition >= 0, '2026 Fall should keep the quantum mechanics course');
assert.ok(aiCardPosition < quantumCardPosition, 'AI strategic decision-making should be the first 2026 Fall course');

assert.match(index, /data-en="AI-Based Strategic Decision-Making" data-kr="AI기반전략적의사결정"/);
assert.ok(
  !index.includes('이 페이지는 14개 교안과 주차별 실습을 대조하여 다시 쓴 개인 학습 노트입니다.'),
  'course home should not show the Korean personal-notes disclaimer',
);
assert.ok(
  !index.includes('These pages are personal study notes synthesized from fourteen course chapters'),
  'course home should not show the English personal-notes disclaimer',
);
for (let week = 1; week <= 6; week += 1) {
  const padded = String(week).padStart(2, '0');
  assert.match(index, new RegExp(`href="week-${padded}\\.html"`));
  assert.match(catalog, new RegExp(`href="lectures/2026-fall/ai-strategic-decision-making/week-${padded}\\.html"[^>]*>W${week}<\\/a>`));
}

assert.match(legacy, /<meta http-equiv="refresh" content="0; url=ai-strategic-decision-making\/">/);
for (let week = 1; week <= 6; week += 1) {
  const padded = String(week).padStart(2, '0');
  assert.match(legacy, new RegExp(`'#week-${padded}': 'ai-strategic-decision-making/week-${padded}\\.html'`));
}

const expectedByWeek = [
  ['1장', '2장', '3장', '전략적 의사결정', 'SWOT', 'PEST', '데이터 기반 의사결정', '양자 머신러닝'],
  ['4장', '5장', '할루시네이션', '신뢰성 검토', 'AI 개입 지점', '위험 기반 단계 전환', '88'],
  ['6장', '7장', '8장', '예측·분류·최적화·설명', '인간 주도 파트너', 'Zero-shot', 'One-shot', 'Few-shot', '단계형 프롬프트'],
  ['9장', '10장', '표면적 의미', '맥락적 의미', '전략적 의미', '메타사고', 'Core', 'Auxiliary', 'kill test'],
  ['11장', '12장', '문제와 증상', '5 Whys', 'Fishbone', 'Rule-based', 'Decision Tree', 'Neural Network', 'Transformer', 'Reinforcement Learning'],
  ['13장', '14장', '공정성', '투명성', '책임성', '프라이버시', '신뢰성', '미래 전략가', '전략 선언'],
];

for (const [i, html] of weeks.entries()) {
  const week = i + 1;
  assert.match(html, /<div class="lang-kr" hidden>/, `W${week} should have a Korean block`);
  assert.match(html, /<div class="lang-en">/, `W${week} should have an English block`);
  assert.ok(html.includes('핵심 인사이트'), `W${week} should include a Korean strategic insight`);
  assert.ok(html.includes('실습 연결'), `W${week} should connect the weekly practice`);
  assert.ok(html.includes('Strategic Insight'), `W${week} should include an English strategic insight`);
  assert.ok(html.includes('Practice Connection'), `W${week} should include an English practice connection`);
  for (const topic of expectedByWeek[i]) {
    assert.ok(html.includes(topic), `W${week} should cover source topic: ${topic}`);
  }
  for (let targetWeek = 1; targetWeek <= 6; targetWeek += 1) {
    const padded = String(targetWeek).padStart(2, '0');
    assert.match(html, new RegExp(`href="week-${padded}\\.html"`), `W${week} should navigate to W${targetWeek}`);
  }
}

for (const [htmlPath, html] of [[catalogPath, catalog], [indexPath, index], [legacyPath, legacy], ...weekPaths.map((path, i) => [path, weeks[i]])]) {
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

console.log('PASS AI-based strategic decision-making course contract');
