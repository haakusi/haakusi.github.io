import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repoRoot, 'lectures.html');
const courseRoot = resolve(repoRoot, 'lectures/2026-fall/ai-programming');
const indexPath = resolve(courseRoot, 'index.html');
const weekPaths = [1, 2].map((week) => resolve(courseRoot, `week-0${week}.html`));
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/ai-programming.html');

assert.ok(existsSync(weekPaths[1]), 'AI Programming Week 2 page should exist');

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const weeks = weekPaths.map((path) => readFileSync(path, 'utf8'));
const weekTwo = weeks[1];
const legacy = readFileSync(legacyPath, 'utf8');

assert.match(catalog, /ai-programming\/week-02\.html" class="week-link">W2<\/a>/);
assert.match(index, /href="week-02\.html"/);
assert.match(index, /data-en="Functions, Operators, and Computational Trade-offs" data-kr="함수·연산자와 계산의 트레이드오프"/);
for (const [index, week] of weeks.entries()) {
  for (let target = 1; target <= 2; target += 1) {
    const current = target === index + 1 ? ' current' : '';
    assert.match(week, new RegExp(`href="week-0${target}\\.html" class="week-link${current}">W${target}<\\/a>`));
  }
}

assert.match(legacy, /'#week-02': 'ai-programming\/week-02\.html'/);
const redirectScript = legacy.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
for (const [hash, expected] of [
  ['#week-02', 'ai-programming/week-02.html'],
  ['#unknown', 'ai-programming/'],
]) {
  let redirectedTo = '';
  runInNewContext(redirectScript, { location: { hash, replace: (target) => { redirectedTo = target; } } });
  assert.equal(redirectedTo, expected, `legacy redirect should resolve ${hash}`);
}

assert.match(weekTwo, /<section class="week-section" id="week-02">/);
assert.match(weekTwo, /<div class="lang-kr" lang="ko" hidden>/);
assert.match(weekTwo, /<div class="lang-en" lang="en">/);
assert.doesNotMatch(weekTwo, /<pre><code>/, 'every Week 2 code block should use the horizontally contained lecture-code style');
assert.equal([...weekTwo.matchAll(/<pre class="lecture-code"><code>/g)].length, 10, 'both languages should expose five contained code examples');

const koreanBlock = weekTwo.match(/<div class="lang-kr" lang="ko" hidden>([\s\S]*?)<div class="lang-en" lang="en">/)?.[1] ?? '';
const englishBlock = weekTwo.match(/<div class="lang-en" lang="en">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? '';
assert.ok(koreanBlock, 'Korean Week 2 content block should be extractable');
assert.ok(englishBlock, 'English Week 2 content block should be extractable');

const mirroredTopics = [
  ['파이썬 실행 모델과 개발환경', 'Python Execution Model and Environment'],
  ['변수·자료형·주석', 'Variables, Data Types, and Comments'],
  ['연산자는 언어의 규칙이다', 'Operators Follow Language Rules'],
  ['미리 계산할 것인가, 실행 중 계산할 것인가', 'Precompute or Compute at Runtime'],
  ['사인함수와 테일러 급수', 'Sine and the Taylor Series'],
  ['정확도·시간·메모리의 균형', 'Balancing Accuracy, Time, and Memory'],
  ['비트 시프트와 순환 회전', 'Bit Shifts and Circular Rotation'],
  ['하드웨어와 소프트웨어의 경계', 'Hardware–Software Boundary'],
  ['함수로 현실을 모델링하기', 'Modeling Reality with Functions'],
  ['동료 코드 리뷰', 'Peer Code Review'],
];
for (const [koreanTopic, englishTopic] of mirroredTopics) {
  assert.ok(koreanBlock.includes(koreanTopic), `Korean block should cover: ${koreanTopic}`);
  assert.ok(englishBlock.includes(englishTopic), `English block should cover: ${englishTopic}`);
}

const mirroredCorrections = [
  ['math.sin은 라디안', 'math.sin accepts radians'],
  ['함수는 일대일 대응일 필요가 없다', 'A function need not be one-to-one'],
  ['^는 거듭제곱이 아니라 비트 XOR', '^ is bitwise XOR, not exponentiation'],
  ['200의 8비트 표현은 11001000', 'the 8-bit representation of 200 is 11001000'],
  ['시프트와 회전은 서로 다른 연산', 'A shift and a rotation are different operations'],
  ['파이썬 정수는 고정 비트폭에서 자동으로 순환하지 않는다', 'Python integers do not wrap automatically at a fixed width'],
  ['소스 코드는 보통 바이트코드로 컴파일된 뒤', 'source is normally compiled to bytecode before'],
  ['허용 오차를 먼저 정해야', 'define an error budget first'],
];
for (const [koreanCorrection, englishCorrection] of mirroredCorrections) {
  assert.ok(koreanBlock.includes(koreanCorrection), `Korean correction should be explicit: ${koreanCorrection}`);
  assert.ok(englishBlock.toLowerCase().includes(englishCorrection.toLowerCase()), `English correction should be explicit: ${englishCorrection}`);
}

for (const [language, block] of [['Korean', koreanBlock], ['English', englishBlock]]) {
  for (const snippet of [
    'math.sin(angle_rad)',
    'math.radians(angle_deg)',
    'def sin_taylor(x, terms=7):',
    'x = (x + math.pi) % (2 * math.pi) - math.pi',
    'error = abs(approx - exact)',
    '5 ** 2',
    '100 ^ 200',
    '10 // 4',
    'def rotate_right(value, shift, width=8):',
    'mask = (1 &lt;&lt; width) - 1',
  ]) {
    assert.ok(block.includes(snippet), `${language} block should include runnable example: ${snippet}`);
  }
}

assert.ok(koreanBlock.includes('|x| ≤ 2π인 학습용 범위'), 'Korean Taylor explanation should state its supported teaching range');
assert.ok(englishBlock.includes('teaching range |x| ≤ 2π'), 'English Taylor explanation should state its supported teaching range');
assert.ok(koreanBlock.includes('3e-5'), 'Korean Taylor explanation should state its demonstrated tolerance');
assert.ok(englishBlock.includes('3e-5'), 'English Taylor explanation should state its demonstrated tolerance');
assert.ok(koreanBlock.includes('출력과 같은 단위로 환산'), 'Korean error explanation should qualify how error sources combine');
assert.ok(englishBlock.includes('expressed in the output unit'), 'English error explanation should qualify how error sources combine');
assert.doesNotMatch(koreanBlock, /총 오차\s*=/, 'error sources should not be presented as an unconditional additive identity');
assert.doesNotMatch(englishBlock, /total error\s*=/i, 'error sources should not be presented as an unconditional additive identity');

const decodeHtmlCode = (source) => source
  .replaceAll('&gt;', '>')
  .replaceAll('&lt;', '<')
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'");

for (const [language, block] of [['Korean', koreanBlock], ['English', englishBlock]]) {
  const examples = [...block.matchAll(/<pre class="lecture-code"><code>([\s\S]*?)<\/code><\/pre>/g)]
    .map((match) => decodeHtmlCode(match[1]));
  assert.equal(examples.length, 5, `${language} block should expose five executable examples`);

  for (const [exampleIndex, code] of examples.entries()) {
    const execution = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
    assert.equal(execution.status, 0, `${language} example ${exampleIndex + 1} should execute: ${execution.stderr}`);
  }

  const operatorOutput = spawnSync('python3', ['-c', examples[1]], { encoding: 'utf8' });
  assert.deepEqual(operatorOutput.stdout.trim().split(/\r?\n/), ['2.5', '2', '25', '172'], `${language} operator outputs should match Python semantics`);

  const directSineOutput = spawnSync('python3', ['-c', examples[2]], { encoding: 'utf8' });
  assert.ok(Math.abs(Number(directSineOutput.stdout.trim()) - 0.5) < 1e-12, `${language} direct sine example should evaluate 30 degrees`);

  const taylorProbe = `${examples[3]}\nfor sample in [-2 * math.pi, -math.pi, -math.pi / 2, 0.0, math.pi / 6, math.pi / 2, math.pi, 2 * math.pi]:\n    assert abs(sin_taylor(sample) - math.sin(sample)) <= 3e-5`;
  const taylorExecution = spawnSync('python3', ['-c', taylorProbe], { encoding: 'utf8' });
  assert.equal(taylorExecution.status, 0, `${language} Taylor example should meet its stated tolerance: ${taylorExecution.stderr}`);

  const rotationProbe = `${examples[4]}\nassert rotate_right(bits, 0, 8) == bits\nassert rotate_right(bits, 8, 8) == bits\nassert rotate_right(bits, 1, 8) == 0b11101000\nassert rotate_right(-1, 1, 8) == 0xff`;
  const rotationExecution = spawnSync('python3', ['-c', rotationProbe], { encoding: 'utf8' });
  assert.equal(rotationExecution.status, 0, `${language} rotation example should handle zero, one-bit, and full-width rotations: ${rotationExecution.stderr}`);
}

for (const privateDetail of [
  '발표점수', '중간고사', '기말고사', '30분씩', '4-5명', '3~4주는 발표수업',
  '가성비는', 'Astra', '제미나이', '딥시크',
]) {
  for (const [surface, html] of [['catalog', catalog], ['course home', index], ['Week 2', weekTwo]]) {
    assert.ok(!html.includes(privateDetail), `${surface} should not expose operational or volatile detail: ${privateDetail}`);
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

console.log('PASS AI Programming Week 2 contract');
