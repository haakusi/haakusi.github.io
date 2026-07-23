import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('cv.html', root), 'utf8');
const css = await readFile(new URL('cv-style.css', root), 'utf8');
const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('CV reads as one semantic resume instead of a collection of cards', () => {
    const ordered = [
        'class="cv-profile"',
        'id="experience-title"',
        'id="education-title"',
        'id="leadership-title"',
        'id="skills-title"',
    ].map((token) => html.indexOf(token));

    assert.ok(ordered.every((index) => index > -1), 'all editorial CV chapters must exist');
    assert.deepEqual([...ordered].sort((a, b) => a - b), ordered, 'CV chapters must follow recruiter scan order');
    assert.doesNotMatch(html, /cv-snapshot|cv-project-grid|cv-project-featured|cv-research-grid|cv-final-grid/);
});

test('experience is reverse chronological with a stable date rail and nested evidence', () => {
    assert.match(html, /class="cv-experience-ledger"/);
    assert.match(html, /class="cv-entry cv-entry-current"/);
    assert.equal((html.match(/class="cv-contribution"/g) ?? []).length, 5);

    const employers = ['Suprema', 'HBrain', 'AtData'].map((name) => plain.indexOf(name));
    assert.ok(employers.every((index) => index > -1));
    assert.deepEqual([...employers].sort((a, b) => a - b), employers);

    for (const phrase of [
        '1 person · 8 weeks',
        '1인 · 8주',
        '~200K LOC',
        'Version-aware E2E',
        '40%+',
        '30 sec → 3 sec',
        '30초대 → 3초대',
    ]) {
        assert.ok(html.includes(phrase), `missing CV evidence: ${phrase}`);
    }
});

test('supporting evidence uses compact rows rather than visual containers', () => {
    assert.ok((html.match(/class="cv-compact-row/g) ?? []).length >= 8);
    assert.ok((html.match(/class="cv-skill-row/g) ?? []).length >= 4);
    assert.match(css, /\.cv-entry\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*160px\s+minmax\(0,\s*1fr\)/);
    assert.match(css, /\.cv-contribution\s*\{[\s\S]*?border-top:\s*1px solid/);
    assert.match(css, /\.cv-compact-row\s*\{[\s\S]*?border-top:\s*1px solid/);
    assert.doesNotMatch(css, /border-radius:\s*22px/);
});

test('profile and project writing are outcome-first and status-aware', () => {
    for (const phrase of [
        'Device boundary to AI platform',
        '장치 경계부터 AI 플랫폼까지',
        'PRODUCTIZING',
        'IN PROGRESS',
        '제품화 진행 중',
        '진행 중',
        'Problem',
        '문제',
        'Outcome',
        '결과',
    ]) {
        assert.ok(html.includes(phrase), `missing narrative marker: ${phrase}`);
    }
});

test('public CV remains private-safe and print ready', () => {
    assert.doesNotMatch(html, /010-\d|구미동|1991년|희망연봉|Solis|RabbitMQ|Freshdesk|Jira|특별승진|입사\s*19개월/i);
    assert.match(css, /@media print/);
    assert.match(css, /@page\s*\{[\s\S]*?size:\s*A4/);
    assert.match(css, /@media print[\s\S]*?body\.cv-page\s*\{[\s\S]*?--cv-ink:\s*#101817/);
    assert.match(css, /@media print[\s\S]*?\.cv-container\s*\{[\s\S]*?background:\s*#fff\s*!important/);
    assert.match(css, /break-inside:\s*avoid/);
    assert.match(css, /@media\s*\(max-width:\s*680px\)/);
});
