import assert from 'node:assert/strict';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [index, cv, portfolio, common, homeCss, sharedCss] = await Promise.all([
    read('index.html'),
    read('cv.html'),
    read('portfolio.html'),
    read('common.js'),
    read('home-style.css'),
    read('career-system.css'),
]);

const publicCareerCopy = [index, cv, portfolio].join('\n');

test('homepage follows a concise identity-to-contact editorial journey', () => {
    const anchors = ['identity', 'proof', 'journey', 'mentoring', 'research', 'archive', 'contact'];
    for (const id of anchors) {
        assert.equal((index.match(new RegExp(`id="${id}"`, 'g')) ?? []).length, 1, `#${id} must be unique`);
    }
    assert.match(index, /class="home-local-nav"/);
    for (const id of ['identity', 'journey', 'mentoring', 'contact']) {
        assert.match(index, new RegExp(`href="#${id}"`), `missing primary in-page link #${id}`);
    }
    assert.match(index, /class="home-brand"/);
    assert.match(index, /class="home-local-links"/);
});

test('homepage recreates the measured reference composition with original markup and CSS', () => {
    for (const className of ['home-hero-brief', 'home-hero-statement', 'home-hero-meta']) {
        assert.match(index, new RegExp(`class="[^"]*${className}`), `missing structural class ${className}`);
    }
    for (const contract of [
        /--home-container:\s*1320px/,
        /--home-header-height:\s*96px/,
        /\.home-local-nav\s*\{[\s\S]*?position:\s*fixed/,
        /\.home-hero\s*\{[\s\S]*?min-height:\s*100svh/,
        /\.home-hero\s*\{[\s\S]*?grid-template-columns:\s*320px minmax\(0,\s*1fr\)/,
        /\.home-hero\s*\{[\s\S]*?column-gap:\s*64px/,
        /\.home-hero h1\s*\{[\s\S]*?font-size:\s*clamp\(62px,\s*6\.2vw,\s*88px\)/,
        /\.home-hero h1\s*\{[^}]*width:\s*100%/,
        /\.home-hero h1\s*\{[\s\S]*?line-height:\s*0?\.92/,
    ]) {
        assert.match(homeCss, contract);
    }
    for (const width of ['1180px', '900px', '640px', '430px']) {
        assert.ok(homeCss.includes(`max-width: ${width}`), `missing reference responsive tier ${width}`);
    }
    for (const selector of ['home-kicker', 'home-hero-role', 'identity-links']) {
        assert.match(homeCss, new RegExp(`\\.${selector}\\s*\\{[^}]*width:\\s*100%`), `${selector} must stay within the hero column`);
    }
    assert.match(index, /lang-kr" hidden><span class="career-line">장치 패킷부터<\/span><em class="career-line">신뢰 가능한<\/em><em class="career-line">AI 제품까지\.<\/em>/);
});

test('homepage leads with quantified, public-safe career evidence', () => {
    for (const evidence of ['1인 8주', '약 20만 LOC', '40%+', '입사 19개월', '300만원', '1,000만원']) {
        assert.ok(index.includes(evidence), `missing public evidence: ${evidence}`);
    }
    assert.match(index, /AI-native/);
    assert.match(index, /device packet|장치 패킷/i);
});

test('award evidence separates the selected-team development fund from the final prize', () => {
    for (const page of [index, cv, portfolio]) {
        assert.match(page, /5개 팀/);
        assert.match(page, /300만원/);
        assert.match(page, /1,000만원/);
    }
    assert.match(cv, /cv-metric-nowrap[^>]*>1,000만원</);
    assert.doesNotMatch(publicCareerCopy, /혁신상[^<]{0,80}50만원|Innovation[^<]{0,80}(?:KRW )?500,000/i);
});

test('recognition uses optimized public images with accessible loading behavior', async () => {
    const images = [
        'images/career/award-oldboy.jpg',
        'images/career/award-innovation.jpg',
    ];
    for (const path of images) {
        await access(new URL(path, root));
        const metadata = await stat(new URL(path, root));
        assert.ok(metadata.size < 900_000, `${path} should be web optimized`);
        const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        assert.match(index, new RegExp(`<img[^>]+src="${escaped}"[^>]+alt="[^"]{8,}"[^>]+loading="lazy"`, 'i'));
    }
});

test('latest public surfaces keep the strongest ownership story and remove the weak chatbot claim', () => {
    assert.doesNotMatch(publicCareerCopy, /Technical Support chatbot|Global Technical Support|\bSolis\b|RabbitMQ/i);
    for (const phrase of ['Developer Portal', '20만 LOC', '40%', '특별승진']) {
        assert.ok(publicCareerCopy.includes(phrase), `missing career evidence: ${phrase}`);
    }
    for (const mentoring of ['Codeit', 'SK Networks', '27', '28']) {
        assert.ok(publicCareerCopy.includes(mentoring), `missing mentoring evidence: ${mentoring}`);
    }
});

test('shared runtime extends the visual system to knowledge detail pages', () => {
    assert.match(common, /career-system\.css/);
    assert.match(common, /knowledge-page/);
    assert.match(sharedCss, /body\.knowledge-page/);
});

test('homepage style is monochrome, token-driven, and motion-safe', () => {
    assert.match(homeCss, /var\(--career-/);
    assert.doesNotMatch(homeCss, /Georgia|Times New Roman|radial-gradient|--home-warm/i);
    assert.match(homeCss, /prefers-reduced-motion:\s*reduce/);
});

test('all public knowledge detail pages load the common runtime', async () => {
    const rootFiles = await readdir(root);
    const detailPages = rootFiles.filter((name) => /^blog\d+\.html$|^reading-book-.*\.html$/.test(name));

    async function walkLectureHtml(directory) {
        const entries = await readdir(directory, { withFileTypes: true });
        const nested = await Promise.all(entries.map(async (entry) => {
            const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
            if (entry.isDirectory()) return walkLectureHtml(url);
            return entry.name.endsWith('.html') ? [url] : [];
        }));
        return nested.flat();
    }

    const lecturePages = await walkLectureHtml(new URL('lectures/', root));
    assert.ok(detailPages.length >= 10, 'expected blog and reading detail pages');
    assert.ok(lecturePages.length >= 20, 'expected lecture detail pages');

    for (const path of detailPages) {
        assert.match(await read(path), /<script\s+src="common\.js"><\/script>/, `${path} must load common.js`);
    }
    for (const url of lecturePages) {
        const html = await readFile(url, 'utf8');
        if (/<meta\s+http-equiv="refresh"/i.test(html)) continue;
        assert.match(html, /<script\s+src="(?:\.\.\/)+common\.js"><\/script>/, `${url.pathname} must load common.js`);
    }
});
