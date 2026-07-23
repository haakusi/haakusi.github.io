import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const root = new URL('../', import.meta.url);
const files = {
    en: new URL('swpark_cv.pdf', root).pathname,
    ko: new URL('swpark_cv_ko.pdf', root).pathname,
};

const inspect = async (path) => {
    const [{ stdout: info }, { stdout: text }, { stdout: layout }] = await Promise.all([
        exec('pdfinfo', [path], { maxBuffer: 1024 * 1024 }),
        exec('pdftotext', [path, '-'], { maxBuffer: 4 * 1024 * 1024 }),
        exec('pdftotext', ['-layout', path, '-'], { maxBuffer: 4 * 1024 * 1024 }),
    ]);
    const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0);
    return { info, text, layout, pages };
};

const documents = Object.fromEntries(await Promise.all(
    Object.entries(files).map(async ([lang, path]) => [lang, await inspect(path)])
));
const compactText = (value) => value.replace(/\s+/g, '').replaceAll('·', '');
const hasEvidence = (document, phrase) => [document.text, document.layout]
    .some((value) => compactText(value).includes(compactText(phrase)));

test('both public CVs are compact, tagged A4 documents', () => {
    for (const [lang, document] of Object.entries(documents)) {
        assert.ok(document.pages > 0 && document.pages <= 3, `${lang} CV should fit within three pages`);
        assert.match(document.info, /^Tagged:\s+yes$/m, `${lang} CV should remain tagged`);
        assert.match(document.info, /^Page size:\s+594\.\d+ x 841\.\d+ pts \(A4\)$/m, `${lang} CV should be A4`);
        assert.match(document.info, /^Encrypted:\s+no$/m);
    }
});

test('PDF content carries the same career evidence as the web CV', () => {
    for (const phrase of [
        'AI-native Platform & Product Engineering Lead',
        'BioStar Developer Portal with natural-language',
        '~200K LOC modernization',
        'Gateway, device',
        'Spring Cloud Gateway MSA',
        'SK Networks Family AI Camp',
        'Device & domain',
        'MariaDB',
        'Microsoft SQL Server',
        'Leadership & public evidence',
        'KRW 3 million',
        'KRW 10 million',
    ]) {
        assert.ok(hasEvidence(documents.en, phrase), `English PDF missing ${phrase}`);
    }
    for (const phrase of [
        'AI-native 플랫폼·제품 엔지니어링 리드',
        '자연어 검증을 갖춘 BioStar Developer Portal',
        '약 20만 LOC 의미 보존형 현대화',
        '게이트웨이·장치·분산 이벤트 플랫폼',
        'SK Networks Family AI',
        '27기·28기',
        '리더십·공개 근거',
        '개발비 300만원',
        '상금 1,000만원',
    ]) {
        assert.ok(hasEvidence(documents.ko, phrase), `Korean PDF missing ${phrase}`);
    }
});

test('PDFs omit private and unsupported profile details', () => {
    const combined = documents.en.text + '\n' + documents.ko.text;
    assert.doesNotMatch(combined, /Technical Support chatbot|Global Technical Support|\bSolis\b|010-\d|구미동|1991년|희망연봉|주민등록|RabbitMQ|Freshdesk|Jira|\/Users\/|file:\/\/|특별승진|입사\s*19개월|special promotion|19 months after joining/i);
});

test('Korean technical foundation heading stays with its content on page three', () => {
    const pages = documents.ko.text.split('\f');
    assert.ok(!pages[1]?.includes('기술 기반'), 'technical foundation heading should not be orphaned on page two');
    assert.ok(pages[2]?.includes('기술 기반'), 'technical foundation heading should begin page three');
});
