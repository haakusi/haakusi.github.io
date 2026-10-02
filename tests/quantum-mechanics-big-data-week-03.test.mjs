import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data');
const indexPath = resolve(courseRoot, 'index.html');
const weekPaths = [1, 2, 3].map((week) => resolve(courseRoot, `week-0${week}.html`));
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data.html');
const commonPath = resolve(repoRoot, 'common.js');
const localMemoPath = process.env.QUANTUM_WEEK_03_MEMO;

assert.ok(existsSync(weekPaths[2]), 'Week 3 page should exist');

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const weeks = weekPaths.map((path) => readFileSync(path, 'utf8'));
const weekThree = weeks[2];
const legacy = readFileSync(legacyPath, 'utf8');
const common = readFileSync(commonPath, 'utf8');

assert.match(catalog, /quantum-mechanics-big-data\/week-03\.html" class="week-link">W3<\/a>/);
assert.match(index, /href="week-03\.html"/);
assert.match(index, /data-en="Week 3" data-kr="3주차"/);
for (const [index, week] of weeks.entries()) {
  for (let target = 1; target <= 3; target += 1) {
    const current = target === index + 1 ? ' current' : '';
    assert.match(week, new RegExp(`href="week-0${target}\\.html" class="week-link${current}">W${target}<\\/a>`));
  }
}
assert.match(legacy, /'#week-03': 'quantum-mechanics-big-data\/week-03\.html'/);
const redirectScript = legacy.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
for (const [hash, expected] of [
  ['#week-03', 'quantum-mechanics-big-data/week-03.html'],
  ['#unknown', 'quantum-mechanics-big-data/'],
]) {
  let redirectedTo = '';
  runInNewContext(redirectScript, { location: { hash, replace: (target) => { redirectedTo = target; } } });
  assert.equal(redirectedTo, expected, `legacy redirect should resolve ${hash}`);
}
for (const target of ['index.html', 'week-01.html', 'week-02.html', 'week-03.html']) {
  assert.ok(existsSync(resolve(courseRoot, target)), `course route should resolve: ${target}`);
}

assert.match(weekThree, /<section class="week-section" id="week-03">/);
assert.match(weekThree, /<script src="\.\.\/\.\.\/\.\.\/common\.js\?v=20261002-w3"><\/script>/);
assert.match(weekThree, /<div class="lang-kr" lang="ko" hidden>/);
assert.match(weekThree, /<div class="lang-en" lang="en">/);

const htmlAttributes = new Map([['data-lang', 'en']]);
const languageButton = { textContent: 'EN' };
const documentElement = {
  lang: 'en',
  getAttribute: (name) => htmlAttributes.get(name) ?? null,
  setAttribute: (name, value) => htmlAttributes.set(name, value),
};
const fakeDocument = {
  documentElement,
  readyState: 'loading',
  getElementById: () => null,
  querySelector: (selector) => selector === '.lang-toggle' ? languageButton : null,
  querySelectorAll: () => [],
  addEventListener: () => {},
};
const fakeStorage = { getItem: () => null, setItem: () => {} };
const browserContext = {
  document: fakeDocument,
  localStorage: fakeStorage,
  location: { pathname: '/lectures/2026-fall/quantum-mechanics-big-data/week-03.html', hostname: '127.0.0.1' },
};
browserContext.window = browserContext;
runInNewContext(common, browserContext);
browserContext.toggleLanguage();
assert.equal(documentElement.lang, 'ko', 'Korean toggle should expose the document language to assistive technology');
browserContext.toggleLanguage();
assert.equal(documentElement.lang, 'en', 'English toggle should restore the document language');

const koreanBlock = weekThree.match(/<div class="lang-kr" lang="ko" hidden>([\s\S]*?)<div class="lang-en" lang="en">/)?.[1] ?? '';
const englishBlock = weekThree.match(/<div class="lang-en" lang="en">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? '';
assert.ok(koreanBlock, 'Korean Week 3 content block should be extractable');
assert.ok(englishBlock, 'English Week 3 content block should be extractable');

const mirroredTopics = [
  ['고윳값과 고유벡터', 'Eigenvalues and Eigenvectors'],
  ['2×2 행렬의 빠른 계산', '2×2 Matrix Shortcut'],
  ['기하학적 의미', 'Geometric Meaning'],
  ['라그랑주 승수법으로 보는 PCA', 'PCA through Lagrange Multipliers'],
  ['채권시장의 PCA', 'PCA in Bond Markets'],
  ['자연지수와 극한', 'Natural Exponential and Limits'],
  ['시간 의존 슈뢰딩거 방정식', 'Time-Dependent Schrödinger Equation'],
  ['변수분리와 시간 독립 방정식', 'Separation of Variables and the TISE'],
  ['정상상태와 중첩상태', 'Stationary States and Superpositions'],
  ['직교성과 완전성', 'Orthogonality and Completeness'],
  ['자유입자와 상자 속 입자', 'Free Particle and Particle in a Box'],
  ['원하는 상태의 계수 뽑기', 'Extracting One State Coefficient'],
];

for (const [koreanTopic, englishTopic] of mirroredTopics) {
  assert.ok(koreanBlock.includes(koreanTopic), `Korean block should cover: ${koreanTopic}`);
  assert.ok(englishBlock.toLowerCase().includes(englishTopic.toLowerCase()), `English block should cover: ${englishTopic}`);
}

const mirroredFormulas = [
  'A v = λv',
  'λ<sub>±</sub> = [tr(A) ± √(tr(A)<sup>2</sup> − 4det(A))]/2',
  'S w = λw',
  'e<sup>x</sup> = lim<sub>N→∞</sub>(1 + x/N)<sup>N</sup>',
  'iℏ∂Ψ(x,t)/∂t = ĤΨ(x,t)',
  'Ψ(x,t) = ψ(x)T(t)',
  'Ĥ = −(ℏ<sup>2</sup>/2m)∂<sup>2</sup>/∂x<sup>2</sup> + V(x)',
  'p̂ = −iℏ∂/∂x',
  'Ĥψ<sub>n</sub>(x) = E<sub>n</sub>ψ<sub>n</sub>(x)',
  'T<sub>n</sub>(t) = e<sup>−iE<sub>n</sub>t/ℏ</sup>',
  '|Ψ<sub>n</sub>(x,t)|<sup>2</sup> = |ψ<sub>n</sub>(x)|<sup>2</sup>',
  'E<sub>n</sub> = n<sup>2</sup>π<sup>2</sup>ℏ<sup>2</sup>/(2mL<sup>2</sup>)',
  'c<sub>k</sub> = ⟨ψ<sub>k</sub>|Ψ⟩ = ∫ψ<sub>k</sub><sup>*</sup>(x)Ψ(x,0)dx',
];

for (const [language, block] of [['Korean', koreanBlock], ['English', englishBlock]]) {
  for (const formula of mirroredFormulas) {
    assert.ok(block.includes(formula), `${language} block should include formula: ${formula}`);
  }
}

const mirroredCorrections = [
  ['좌표 성분 자체가 고정되는 것이 아니라 방향이 유지', 'coordinates need not stay fixed; the direction is preserved'],
  ['고유함수는 고유상태를 좌표 기저로 나타낸 표현', 'eigenfunction is the coordinate representation of an eigenstate'],
  ['이산·연속·혼합 스펙트럼', 'discrete, continuous, or mixed spectrum'],
  ['확률밀도가 시간에 따라 변하지 않는다는 뜻', 'probability density is independent of time'],
  ['에너지가 다른 상태의 중첩은 일반적으로 간섭항', 'different energies generally produces interference terms'],
  ['V가 시간에 명시적으로 의존하지 않을 때', 'when V has no explicit time dependence'],
  ['평면파는 상수 진폭이지만 전체 실선에서 제곱적분 가능하지 않다', 'plane wave has constant amplitude but is not square-integrable over the whole line'],
  ['상자 정규화와 델타 정규화는 비국소화 고유상태를 다루는 규약', 'box and delta normalization are conventions for delocalized eigenstates'],
  ['에너지 간격은 일정하지 않고 n이 커질수록 증가', 'spacing is not uniform and grows with n'],
  ['부호는 임의적이며 데이터와 기간에 따라 해석이 달라질 수 있다', 'sign is arbitrary and the interpretation can vary with the dataset and window'],
  ['비축퇴 이산 에너지라면 |c', 'For a nondegenerate discrete energy'],
  ['축퇴 준위의 확률은 같은 에너지 고유공간에 속한 성분들을 합산', 'sum the probabilities across the whole energy eigenspace'],
];

for (const [koreanCorrection, englishCorrection] of mirroredCorrections) {
  assert.ok(koreanBlock.includes(koreanCorrection), `Korean correction should be explicit: ${koreanCorrection}`);
  assert.ok(englishBlock.toLowerCase().includes(englishCorrection.toLowerCase()), `English correction should be explicit: ${englishCorrection}`);
}

if (localMemoPath) {
  assert.ok(existsSync(localMemoPath), `local Week 3 study note should exist: ${localMemoPath}`);
  const memo = readFileSync(localMemoPath, 'utf8');
  for (const content of [
    '# 양자역학의세계와빅데이터 — 3주차 강의 정리',
    '\\lambda_{\\pm}=\\frac{\\operatorname{tr}(A)',
    'S\\mathbf w=\\lambda\\mathbf w',
    '채권 수익률곡선',
    'i\\hbar\\frac{\\partial\\Psi}{\\partial t}=\\hat H\\Psi',
    '\\hat p=-i\\hbar\\frac{\\partial}{\\partial x}',
    '정상상태라고 해서 파동함수 자체가 시간에 따라 완전히 같다는 뜻은 아니다',
    '초기벡터가 그 고유방향에 0이 아닌 성분을 가질 때',
    '축퇴된 에너지라면 같은 에너지 고유공간에 대한 확률을 합산',
    'E_n=\\frac{n^2\\pi^2\\hbar^2}{2mL^2}',
    'c_k=\\langle\\psi_k|\\Psi(0)\\rangle',
  ]) {
    assert.ok(memo.includes(content), `local memo should include substantive content: ${content}`);
  }
}

for (const [htmlPath, html] of [[catalogPath, catalog], [indexPath, index], ...weekPaths.map((path, index) => [path, weeks[index]]), [legacyPath, legacy]]) {
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

console.log('PASS quantum mechanics and big data Week 3 contract');
