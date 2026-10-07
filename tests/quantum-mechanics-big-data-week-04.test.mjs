import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data');
const indexPath = resolve(courseRoot, 'index.html');
const weekPaths = [1, 2, 3, 4].map((week) => resolve(courseRoot, `week-0${week}.html`));
const supplementPath = resolve(courseRoot, 'supplement-01.html');
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/quantum-mechanics-big-data.html');
const lectureCssPath = resolve(repoRoot, 'assets/css/lectures.css');

assert.ok(existsSync(supplementPath), 'the post-Week-3 supplementary lesson should exist');
assert.ok(existsSync(weekPaths[3]), 'Week 4 page should exist');

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const weeks = weekPaths.map((path) => readFileSync(path, 'utf8'));
const supplement = readFileSync(supplementPath, 'utf8');
const weekFour = weeks[3];
const legacy = readFileSync(legacyPath, 'utf8');
const lectureCss = readFileSync(lectureCssPath, 'utf8');

const expectedNav = [
  ['week-01.html', 'W1'],
  ['week-02.html', 'W2'],
  ['week-03.html', 'W3'],
  ['supplement-01.html', 'SUPP'],
  ['week-04.html', 'W4'],
];

for (const [href, label] of expectedNav) {
  const catalogHref = `lectures/2026-fall/quantum-mechanics-big-data/${href}`;
  assert.ok(catalog.includes(`href="${catalogHref}"`), `catalog should expose ${label}`);
  assert.ok(index.includes(`href="${href}"`), `course home should expose ${label}`);
}

for (const [pageIndex, page] of [...weeks.slice(0, 3), supplement, weekFour].entries()) {
  for (const [targetIndex, [href, label]] of expectedNav.entries()) {
    const current = targetIndex === pageIndex ? ' current' : '';
    const extraClass = label === 'SUPP' ? ' supplement-link' : '';
    const attributes = label === 'SUPP'
      ? ` data-en="SUPP" data-kr="보강">SUPP`
      : `>${label}`;
    assert.ok(
      page.includes(`href="${href}" class="week-link${extraClass}${current}"${attributes}</a>`),
      `${label} should appear in sequence on page ${pageIndex + 1}`,
    );
  }
}

assert.ok(
  index.indexOf('href="week-03.html"') < index.indexOf('href="supplement-01.html"')
    && index.indexOf('href="supplement-01.html"') < index.indexOf('href="week-04.html"'),
  'course-home order should place the supplementary lesson exactly between Week 3 and Week 4',
);
const quantumCatalogLinks = expectedNav.map(([href]) => `lectures/2026-fall/quantum-mechanics-big-data/${href}`);
assert.ok(
  catalog.indexOf(quantumCatalogLinks[2]) < catalog.indexOf(quantumCatalogLinks[3])
    && catalog.indexOf(quantumCatalogLinks[3]) < catalog.indexOf(quantumCatalogLinks[4]),
  'catalog order should place the supplementary lesson exactly between Week 3 and Week 4',
);

assert.match(legacy, /'#supplement-01': 'quantum-mechanics-big-data\/supplement-01\.html'/);
assert.match(legacy, /'#week-04': 'quantum-mechanics-big-data\/week-04\.html'/);
const redirectScript = legacy.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
for (const [hash, expected] of [
  ['#supplement-01', 'quantum-mechanics-big-data/supplement-01.html'],
  ['#week-04', 'quantum-mechanics-big-data/week-04.html'],
  ['#unknown', 'quantum-mechanics-big-data/'],
]) {
  let redirectedTo = '';
  runInNewContext(redirectScript, { location: { hash, replace: (target) => { redirectedTo = target; } } });
  assert.equal(redirectedTo, expected, `legacy redirect should resolve ${hash}`);
}

const extractBlocks = (html, label) => {
  const korean = html.match(/<div class="lang-kr" lang="ko" hidden>([\s\S]*?)<div class="lang-en" lang="en">/)?.[1] ?? '';
  const english = html.match(/<div class="lang-en" lang="en">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? '';
  assert.ok(korean, `${label} Korean block should be extractable`);
  assert.ok(english, `${label} English block should be extractable`);
  return { korean, english };
};

const supplementBlocks = extractBlocks(supplement, 'supplement');
const weekFourBlocks = extractBlocks(weekFour, 'Week 4');

const supplementTopics = [
  ['유한 회전과 무한소 회전', 'Finite and Infinitesimal Rotations'],
  ['생성자에서 지수형 회전으로', 'From the Generator to the Exponential'],
  ['유니터리 연산자', 'Unitary Operators'],
  ['선운동량과 궤도 각운동량', 'Linear and Orbital Angular Momentum'],
  ['운동량과 각운동량 연산자', 'Momentum and Angular-Momentum Operators'],
  ['방위각 회전의 생성자', 'Generator of Azimuthal Rotations'],
  ['교환관계', 'Commutation Relations'],
  ['불확정성 관계', 'Uncertainty Relation'],
];
for (const [kr, en] of supplementTopics) {
  assert.ok(supplementBlocks.korean.includes(kr), `supplement Korean should explain ${kr}`);
  assert.ok(supplementBlocks.english.toLowerCase().includes(en.toLowerCase()), `supplement English should explain ${en}`);
}

const supplementFormulas = [
  'R(dα) = I + dαJ + O(dα<sup>2</sup>)',
  'J = [[0, −1], [1, 0]] = −iσ<sub>y</sub>',
  'R(α) = e<sup>αJ</sup> = e<sup>−iασ<sub>y</sub></sup>',
  'U<sup>†</sup>U = I',
  'p = mv',
  'L = r × p',
  'p̂ = −iℏ∇',
  'L̂ = r × p̂',
  'L̂<sub>z</sub> = −iℏ∂/∂φ',
  '[L̂<sub>i</sub>, L̂<sub>j</sub>] = iℏε<sub>ijk</sub>L̂<sub>k</sub>',
  '∆L<sub>x</sub>∆L<sub>y</sub> ≥ (ℏ/2)|⟨L̂<sub>z</sub>⟩|',
];
for (const [language, block] of Object.entries(supplementBlocks)) {
  for (const formula of supplementFormulas) {
    assert.ok(block.includes(formula), `${language} supplement should contain ${formula}`);
  }
}
for (const correction of [
  '스핀 1/2 상태의 회전에는 반각 θ/2가 나타난다',
  '반시계 방향이 양수라는 말은 관찰 방향과 축을 먼저 고정했을 때만',
  '위치와 그 위치 방향의 운동량 성분은 서로 교환하지 않는다',
  'l=0 상태에서는 L̂<sub>x</sub>=L̂<sub>y</sub>=L̂<sub>z</sub>=0',
  '교환자의 기댓값이 0이면 이 하한도 0',
]) {
  assert.ok(supplementBlocks.korean.includes(correction), `supplement should correct notation: ${correction}`);
}
for (const correction of [
  'spin-1/2 state uses the half-angle θ/2',
  'counterclockwise is positive only after fixing an axis and viewing direction',
  'position and momentum along the same direction do not commute',
  'For l=0 states, L̂<sub>x</sub>=L̂<sub>y</sub>=L̂<sub>z</sub>=0',
  'if the commutator expectation is zero, this particular lower bound is zero',
]) {
  assert.ok(supplementBlocks.english.includes(correction), `English supplement should correct notation: ${correction}`);
}

const weekFourTopics = [
  ['수소 원자에 구면좌표가 맞는 이유', 'Why Spherical Coordinates Fit Hydrogen'],
  ['구면좌표에서 점 r 읽기', 'Reading a Point r in Spherical Coordinates'],
  ['변수분리', 'Separation of Variables'],
  ['특수함수가 나타나는 자리', 'Where the Special Functions Appear'],
  ['주양자수 n', 'Principal Quantum Number n'],
  ['궤도 각운동량 양자수 l', 'Orbital Angular-Momentum Quantum Number l'],
  ['자기양자수 m', 'Magnetic Quantum Number m'],
  ['n = 1 상태', 'The n = 1 State'],
  ['n = 2 상태', 'The n = 2 States'],
  ['오비탈은 궤도가 아니다', 'An Orbital Is Not an Orbit'],
  ['스펙트럼과 Zeeman 효과', 'Spectra and the Zeeman Effect'],
];
for (const [kr, en] of weekFourTopics) {
  assert.ok(weekFourBlocks.korean.includes(kr), `Week 4 Korean should explain ${kr}`);
  assert.ok(weekFourBlocks.english.toLowerCase().includes(en.toLowerCase()), `Week 4 English should explain ${en}`);
}

const weekFourFormulas = [
  'x = r sinθ cosφ',
  'y = r sinθ sinφ',
  'z = r cosθ',
  'ψ<sub>nlm</sub>(r,θ,φ) = R<sub>nl</sub>(r)Y<sub>l</sub><sup>m</sup>(θ,φ)',
  'Y<sub>l</sub><sup>m</sup>(θ,φ) = N<sub>lm</sub>P<sub>l</sub><sup>m</sup>(cosθ)e<sup>imφ</sup>',
  'n = 1, 2, 3, …',
  'l = 0, 1, …, n − 1',
  'm = −l, …, 0, …, +l',
  'L̂<sup>2</sup>Y<sub>l</sub><sup>m</sup> = ℏ<sup>2</sup>l(l + 1)Y<sub>l</sub><sup>m</sup>',
  'L̂<sub>z</sub>Y<sub>l</sub><sup>m</sup> = ℏmY<sub>l</sub><sup>m</sup>',
  'E<sub>n</sub> = −13.6 eV/n<sup>2</sup>',
  '∫|ψ|<sup>2</sup>d<sup>3</sup>r = 1',
  '∆E = hν',
];
for (const [language, block] of Object.entries(weekFourBlocks)) {
  for (const formula of weekFourFormulas) {
    assert.ok(block.includes(formula), `${language} Week 4 should contain ${formula}`);
  }
}

for (const correction of [
  '방사방정식은 결합 Laguerre 방정식',
  'θ 방향은 결합 Legendre 방정식',
  '구면조화함수는 θ와 φ의 각도 부분을 합친 함수',
  'n만으로 정확한 공간 분포가 정해지는 것은 아니다',
  '전자가 정해진 원이나 타원을 따라 돈다는 뜻이 아니다',
  '실수 p<sub>x</sub>, p<sub>y</sub>, p<sub>z</sub> 오비탈은 각각 마디면 하나',
  '복소 m=±1 상태의 확률밀도는 z축에서 0',
  'ψ<sub>nlm</sub> 기저는 Ĥ, L̂<sup>2</sup>, L̂<sub>z</sub>의 공통 고유함수',
  '실수 p 오비탈은 L̂<sub>z</sub> 고유함수일 필요가 없다',
]) {
  assert.ok(weekFourBlocks.korean.includes(correction), `Week 4 should correct the source shorthand: ${correction}`);
}
for (const correction of [
  'real p<sub>x</sub>, p<sub>y</sub>, and p<sub>z</sub> orbitals each have one nodal plane',
  'probability density of a complex m=±1 state vanishes along the z axis',
  'ψ<sub>nlm</sub> basis can be chosen as simultaneous eigenfunctions',
  'real p-orbital combinations need not be L̂<sub>z</sub> eigenfunctions',
]) {
  assert.ok(weekFourBlocks.english.includes(correction), `English Week 4 should preserve the correction: ${correction}`);
}

const spatialDiagrams = weekFour.match(/<svg class="quantum-spatial-diagram"[\s\S]*?<\/svg>/g) ?? [];
assert.equal(spatialDiagrams.length, 4, 'each language should include spherical-coordinate and orbital diagrams');
for (const diagram of spatialDiagrams) {
  assert.match(diagram, /role="img"/);
  const labelledBy = diagram.match(/aria-labelledby="([^"]+)"/)?.[1].split(/\s+/) ?? [];
  assert.equal(labelledBy.length, 2, 'each diagram should reference one title and one description');
  assert.match(diagram, /<title id="[^"]+">/);
  assert.match(diagram, /<desc id="[^"]+">/);
  for (const id of labelledBy) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(diagram, new RegExp(`<(?:title|desc) id="${escaped}">[^<]+<\\/(?:title|desc)>`), `SVG label reference should resolve: ${id}`);
  }
}
assert.ok(weekFour.includes('data-diagram="spherical-coordinates"'), 'Week 4 should visualize r, θ, and φ in 3D');
assert.ok(weekFour.includes('data-diagram="hydrogen-orbitals"'), 'Week 4 should visualize the n=1 and n=2 orbital families');
assert.match(lectureCss, /\.quantum-spatial\s*{[\s\S]*?100vw/);
assert.match(lectureCss, /\.quantum-spatial-diagram\s*{[\s\S]*?height:\s*auto/);
assert.match(lectureCss, /\.stat-chart \.quantum-spatial-diagram text\s*{[\s\S]*?font-size:\s*14px/);
assert.match(lectureCss, /@media \(max-width: 600px\)[\s\S]*?\.quantum-spatial\s*{[\s\S]*?overflow-x:\s*auto/);
assert.match(lectureCss, /@media \(max-width: 600px\)[\s\S]*?\.quantum-spatial-diagram\s*{[\s\S]*?width:\s*640px/);

for (const text of ['중간발표', '결과만 써라', 'n=3은 필요없다']) {
  assert.ok(!supplement.includes(text) && !weekFour.includes(text), `public notes should omit private class logistics: ${text}`);
}

for (const [htmlPath, html] of [
  [catalogPath, catalog],
  [indexPath, index],
  ...weekPaths.map((path, i) => [path, weeks[i]]),
  [supplementPath, supplement],
  [legacyPath, legacy],
]) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${htmlPath} should not contain duplicate IDs`);
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

console.log('PASS quantum mechanics and big data supplementary lesson and Week 4 contract');
