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
const weekPaths = [1, 2, 3].map((week) => resolve(courseRoot, `week-0${week}.html`));
const legacyPath = resolve(repoRoot, 'lectures/2026-fall/ai-programming.html');

assert.ok(existsSync(weekPaths[2]), 'AI Programming Week 3 page should exist');

const catalog = readFileSync(catalogPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const weeks = weekPaths.map((path) => readFileSync(path, 'utf8'));
const weekThree = weeks[2];
const legacy = readFileSync(legacyPath, 'utf8');

assert.match(catalog, /ai-programming\/week-03\.html" class="week-link">W3<\/a>/);
assert.match(index, /href="week-03\.html"/);
assert.match(index, /data-en="Data Representation, Numerical Error, and Complex Values" data-kr="데이터 표현·수치 오차와 복소수"/);
for (const [index, week] of weeks.entries()) {
  for (let target = 1; target <= 3; target += 1) {
    const current = target === index + 1 ? ' current' : '';
    assert.match(week, new RegExp(`href="week-0${target}\\.html" class="week-link${current}">W${target}<\\/a>`));
  }
}

assert.match(legacy, /'#week-03': 'ai-programming\/week-03\.html'/);
const redirectScript = legacy.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
for (const [hash, expected] of [
  ['#week-03', 'ai-programming/week-03.html'],
  ['#unknown', 'ai-programming/'],
]) {
  let redirectedTo = '';
  runInNewContext(redirectScript, { location: { hash, replace: (target) => { redirectedTo = target; } } });
  assert.equal(redirectedTo, expected, `legacy redirect should resolve ${hash}`);
}

assert.match(weekThree, /<section class="week-section" id="week-03">/);
assert.match(weekThree, /<div class="lang-kr" lang="ko" hidden>/);
assert.match(weekThree, /<div class="lang-en" lang="en">/);
assert.doesNotMatch(weekThree, /<pre><code>/, 'every Week 3 code block should use the horizontally contained lecture-code style');
assert.equal([...weekThree.matchAll(/<pre class="lecture-code"><code>/g)].length, 14, 'both languages should expose seven contained code examples');

const koreanBlock = weekThree.match(/<div class="lang-kr" lang="ko" hidden>([\s\S]*?)<div class="lang-en" lang="en">/)?.[1] ?? '';
const englishBlock = weekThree.match(/<div class="lang-en" lang="en">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? '';
assert.ok(koreanBlock, 'Korean Week 3 content block should be extractable');
assert.ok(englishBlock, 'English Week 3 content block should be extractable');

const mirroredTopics = [
  ['변수·객체·메모리 주소', 'Variables, Objects, and Memory'],
  ['식별자와 고유 식별자', 'Identifiers and Unique IDs'],
  ['10진 정수를 2진수로', 'Converting Decimal Integers to Binary'],
  ['10진 소수를 2진수로', 'Converting Decimal Fractions to Binary'],
  ['부동소수점 오차와 허용 오차', 'Floating-Point Error and Tolerance'],
  ['나눗셈 연산의 의미', 'Division Semantics'],
  ['복소수와 복소평면', 'Complex Numbers and the Complex Plane'],
  ['시프트와 2의 보수', "Shifts and Two's Complement"],
  ['문맥을 사용하는 AI', 'Context-Aware AI'],
  ['CT·MRI와 계산적 재구성', 'CT, MRI, and Computational Reconstruction'],
  ['융합 시스템과 협업', 'Interdisciplinary Systems and Collaboration'],
  ['근거 기반 동료 코드 리뷰', 'Evidence-Based Peer Code Review'],
];
for (const [koreanTopic, englishTopic] of mirroredTopics) {
  assert.ok(koreanBlock.includes(koreanTopic), `Korean block should cover: ${koreanTopic}`);
  assert.ok(englishBlock.includes(englishTopic), `English block should cover: ${englishTopic}`);
}

const mirroredCorrections = [
  ['변수 이름은 메모리 주소 그 자체가 아니다', 'A variable name is not the memory address itself'],
  ['대입은 객체를 복사하지 않고 같은 객체에 이름을 하나 더 연결', 'Assignment does not copy an object; it binds another name to the same object'],
  ['0.2₁₀ = 0.00110011…₂', '0.2₁₀ = 0.00110011…₂'],
  ['유한한 비트로 정확히 표현할 수 없다', 'cannot represent it exactly with a finite number of bits'],
  ['//는 0 방향 절삭이 아니라 음의 무한대 방향으로 내림', '// floors toward negative infinity rather than truncating toward zero'],
  ['파이썬은 허수 단위에 j를 사용', 'Python uses j for the imaginary unit'],
  ['파이썬 정수는 임의 정밀도', 'Python integers have arbitrary precision'],
  ['명시적인 비트폭', 'explicit bit width'],
  ['문맥에 맞는 후보를 확률적으로 순위화', 'probabilistically ranks candidates that fit the context'],
  ['예방을 보장하지 않는다', 'does not guarantee prevention'],
  ['CT는 X선 감쇠', 'CT measures X-ray attenuation'],
  ['MRI는 강한 자기장과 고주파 신호', 'MRI uses a strong magnetic field and radio-frequency signals'],
];
for (const [koreanCorrection, englishCorrection] of mirroredCorrections) {
  assert.ok(koreanBlock.includes(koreanCorrection), `Korean correction should be explicit: ${koreanCorrection}`);
  assert.ok(englishBlock.toLowerCase().includes(englishCorrection.toLowerCase()), `English correction should be explicit: ${englishCorrection}`);
}

assert.ok(koreanBlock.includes('기약분수로 줄였을 때 분모'), 'Korean float explanation should qualify the finite-binary rule using lowest terms');
assert.ok(englishBlock.includes('denominator in lowest terms'), 'English float explanation should qualify the finite-binary rule using lowest terms');

for (const [language, block] of [['Korean', koreanBlock], ['English', englishBlock]]) {
  for (const snippet of [
    'alias = original',
    'deep = copy.deepcopy(original)',
    'def to_binary(n):',
    'value = Fraction(1, 5)',
    'math.isclose(0.1 + 0.2, 0.3',
    'Decimal("0.1")',
    'q, r = divmod(a, 5)',
    'cmath.sqrt(-1)',
    'z.conjugate()',
    'def encode_twos(value, width=8):',
    'def decode_twos(bits, width=8):',
  ]) {
    assert.ok(block.includes(snippet), `${language} block should include runnable example: ${snippet}`);
  }
}

const decodeHtmlCode = (source) => source
  .replaceAll('&gt;', '>')
  .replaceAll('&lt;', '<')
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'");

const expectedOutputs = [
  ['99 99 1'],
  ['1011'],
  ['0.001100110011'],
  ['False', 'True', '0.3'],
  ['14 2 4 14', '-14 -3 1 -14'],
  ['1j', '(3-4j)', '5.0'],
  ['11111011', '-5', '-3'],
];

for (const [language, block] of [['Korean', koreanBlock], ['English', englishBlock]]) {
  const examples = [...block.matchAll(/<pre class="lecture-code"><code>([\s\S]*?)<\/code><\/pre>/g)]
    .map((match) => decodeHtmlCode(match[1]));
  assert.equal(examples.length, expectedOutputs.length, `${language} block should expose seven executable examples`);

  for (const [exampleIndex, code] of examples.entries()) {
    const execution = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
    assert.equal(execution.status, 0, `${language} example ${exampleIndex + 1} should execute: ${execution.stderr}`);
    assert.deepEqual(
      execution.stdout.trim().split(/\r?\n/),
      expectedOutputs[exampleIndex],
      `${language} example ${exampleIndex + 1} should produce the documented result`,
    );
  }

  const copyProbe = `${examples[0]}\nassert alias is original\nassert shallow is not original\nassert shallow[0] is original[0]\nassert deep[0] is not original[0]`;
  assert.equal(spawnSync('python3', ['-c', copyProbe]).status, 0, `${language} copy example should distinguish aliasing, shallow copying, and deep copying`);

  const binaryProbe = `${examples[1]}\nassert to_binary(0) == "0"\nassert to_binary(255) == "11111111"\ntry:\n    to_binary(-1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("negative input should be rejected")`;
  assert.equal(spawnSync('python3', ['-c', binaryProbe]).status, 0, `${language} binary converter should handle zero, 255, and reject negatives`);

  const twosProbe = `${examples[6]}\nfor value, encoded_value in [(-128, 128), (-5, 251), (-1, 255), (0, 0), (1, 1), (127, 127)]:\n    assert encode_twos(value, 8) == encoded_value\nfor bits, decoded_value in [(0, 0), (1, 1), (127, 127), (128, -128), (251, -5), (255, -1)]:\n    assert decode_twos(bits, 8) == decoded_value\nfor invalid in (-129, 128):\n    try:\n        encode_twos(invalid, 8)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError("out-of-range value should be rejected")`;
  assert.equal(spawnSync('python3', ['-c', twosProbe]).status, 0, `${language} two's-complement helpers should round-trip the 8-bit signed range boundaries`);
}

for (const privateDetail of [
  '10월16', '10월 16', '10월23', '10월 23', '10월 7일', '중간고사', '기말고사',
  '각자 메일', '연세대', '우리나라에서', '무선키보드', '30-40초',
]) {
  for (const [surface, html] of [['catalog', catalog], ['course home', index], ['Week 3', weekThree]]) {
    assert.ok(!html.includes(privateDetail), `${surface} should not expose operational, personal, or unsupported detail: ${privateDetail}`);
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

console.log('PASS AI Programming Week 3 contract');
