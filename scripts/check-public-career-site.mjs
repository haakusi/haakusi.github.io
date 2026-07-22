import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const index = await read('index.html');
const portfolio = await read('portfolio.html');
const cv = await read('cv.html');
const common = await read('common.js');
const research = await read('research.html').catch(() => '');
const careerPages = { 'index.html': index, 'portfolio.html': portfolio, 'cv.html': cv, 'research.html': research };

test('homepage is a focused career hub with direct paths to evidence and archives', () => {
    assert.match(index, /<body class="career-home">/);
    for (const phrase of ['Selected evidence', '선별된 근거']) {
        assert.ok(index.includes(phrase), `missing homepage phrase: ${phrase}`);
    }
    assert.match(index, /From device packets to\s*<em>AI evaluation gates\.<\/em>/);
    assert.match(index, /장치 패킷부터\s*<em>AI 검증 게이트까지\.<\/em>/);
    for (const href of ['portfolio.html', 'cv.html', 'research.html', 'blog.html', 'reading.html', 'lectures.html']) {
        assert.ok(index.includes(`href="${href}`), `missing homepage path: ${href}`);
    }
    assert.doesNotMatch(index, /Leaflet|visitor-count|initializeVisitorTracking|ipinfo\.io|script\.google\.com/);
});

test('shared navigation exposes Research and updates document language', () => {
    assert.match(common, /href:\s*'research\.html'/);
    assert.match(common, /document\.documentElement\.lang\s*=/);
    assert.match(common, /aria-current="page"/);
});

test('public CV is current, impact-led, bilingual, and fact constrained', () => {
    for (const phrase of [
        'AI-native Platform & Product Engineering Lead',
        'AI-native 플랫폼·제품 엔지니어링 리드',
        'Technical Support chatbot',
        'Developer platform',
        'Legacy modernization',
        'MariaDB',
        'Microsoft SQL Server',
    ]) {
        assert.ok(cv.includes(phrase), `missing CV phrase: ${phrase}`);
    }
    assert.doesNotMatch(cv, /RabbitMQ|Redis|Freshdesk|Jira|7M\+|80\+ API|WhatsApp|1,?300|7,000만원|010-\d|구미동|1991년|GI\b/);
});

test('research page separates active work, foundations, and research notes', () => {
    for (const phrase of [
        'Explainable Traditional-Dance Retrieval & Recommendation',
        '설명 가능한 전통무용 검색·추천',
        'Hybrid Quantum–Classical Model Selection',
        '양자–고전 하이브리드 모델 선택',
        'Research in progress',
        '진행 중인 연구',
    ]) {
        assert.ok(research.includes(phrase), `missing research phrase: ${phrase}`);
    }
    assert.match(research, /classical baselines/i);
    assert.match(research, /same data splits, budgets, and evaluation gates/i);
});

test('career pages contain no private source paths or direct personal details', () => {
    const combined = Object.values(careerPages).join('\n');
    assert.doesNotMatch(combined, /no_read|phd\/swpark|010-\d|구미동|1991년|희망연봉|주민등록|Freshdesk|Jira/);
});

test('bilingual inline content always supplies a Korean pair', () => {
    for (const [name, html] of Object.entries(careerPages)) {
        const localizedTags = html.match(/<[^>]*\bdata-en="[^"]*"[^>]*>/g) ?? [];
        assert.ok(localizedTags.length >= 8, `${name} should contain substantial bilingual content`);
        for (const tag of localizedTags) {
            assert.match(tag, /\bdata-kr="[^"]*"/, `${name} missing data-kr pair: ${tag}`);
        }
    }
});

test('career-page IDs are unique and local links resolve', async () => {
    for (const [name, html] of Object.entries(careerPages)) {
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${name} contains duplicate IDs`);

        const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
        const localFiles = hrefs.filter((href) => !/^(?:https?:|mailto:|#)/.test(href));
        for (const href of new Set(localFiles)) {
            const path = href.split(/[?#]/)[0];
            if (path) await access(new URL(path, root));
        }
    }
});
