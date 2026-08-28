import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const common = readFileSync(new URL('../common.js', import.meta.url), 'utf8');

function section(name) {
  const match = html.match(new RegExp(`<section class="${name}[^"]*">([\\s\\S]*?)<\\/section>`));
  assert.ok(match, `${name} section should exist`);
  return match[1];
}

const about = section('about');
const interests = section('interests');

assert.match(about, /2026년 기준 8년차/);
assert.match(about, /Forward Deployed Engineer\(FDE/);
assert.match(about, /문제 정의 → 대안 탐색 → 아키텍처 설계 → 개발 → 검증 → 운영/);
assert.match(about, /공식 문서·원문·실행 결과로 교차검증/);
assert.match(about, /복수의 유료 프론티어 모델/);

assert.match(interests, /AI-native 엔터프라이즈 엔지니어링/);
assert.match(interests, /고전–양자 하이브리드 연구/);
assert.match(interests, /강한 고전 기준선/);
assert.match(interests, /인코딩·측정·노이즈·QPU 대기·비용/);
assert.match(interests, /고전 방식을 유지/);
assert.match(interests, /커피챗·연구 협업·관련 포지션/);

for (const block of [about, interests]) {
  const bilingualNodes = block.match(/<(?:p|h3)[^>]*data-en="[^"]+"[^>]*data-kr="[^"]+"[^>]*>/g) ?? [];
  assert.ok(bilingualNodes.length >= 3, 'profile copy should be structured into bilingual reading units');
}

for (const unsafePhrase of ['$200', '계정 3-4개', '현장배치엔지니어', '지수함수적인 멀티포넨셜']) {
  assert.ok(!html.includes(unsafePhrase), `public profile should not contain: ${unsafePhrase}`);
}

assert.match(common, /AI Engineer & Full-Stack Developer/);
assert.match(html, /AI-native enterprise systems, frontier AI agents, and evidence-first classical–quantum hybrid research\./);

console.log('PASS home profile copy contract');
