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

test('homepage exposes the site IA and follows a newest-first editorial journey', () => {
    const anchors = ['identity', 'media', 'work', 'capability', 'journey', 'mentoring', 'research', 'archive', 'contact'];
    for (const id of anchors) {
        assert.equal((index.match(new RegExp(`id="${id}"`, 'g')) ?? []).length, 1, `#${id} must be unique`);
    }
    assert.match(index, /<div id="site-header"><\/div>/);
    assert.match(index, /<div id="site-nav"><\/div>/);
    assert.doesNotMatch(index, /home-local-nav|home-motion-ticker/);
    for (const path of ['index.html', 'portfolio.html', 'cv.html', 'research.html', 'blog.html', 'lectures.html', 'reading.html']) {
        assert.match(common, new RegExp(`href: '${path}'`), `missing shared site link ${path}`);
    }
    assert.ok(index.indexOf('id="work"') < index.indexOf('id="journey"'), 'current work must precede older chronology');
    assert.ok(index.indexOf('id="work"') < index.indexOf('id="mentoring"'), 'current work must precede mentoring');
});

test('homepage uses the shared shell while preserving its media and hero composition', () => {
    for (const className of ['home-hero-brief', 'home-hero-statement', 'home-hero-meta', 'visual-scroll-stage', 'software-ribbon']) {
        assert.match(index, new RegExp(`class="[^"]*${className}`), `missing structural class ${className}`);
    }
    for (const contract of [
        /--home-container:\s*1320px/,
        /--home-header-height:\s*54px/,
        /@keyframes\s+media-drift/,
        /\.visual-scroll-stage\s*\{[\s\S]*?min-height:\s*1[45]0vh/,
        /\.visual-scroll-stage-inner\s*\{[\s\S]*?position:\s*sticky/,
        /animation-timeline:\s*view\(\)/,
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

test('homepage leads with current, public-safe evidence and removes the incorrect promotion framing', () => {
    for (const evidence of ['1인 8주', '약 20만 LOC', '40%+', 'DEVICE→CLOUD']) {
        assert.ok(index.includes(evidence), `missing public evidence: ${evidence}`);
    }
    assert.match(index, /AI-native/);
    assert.match(index, /device packet|장치 패킷/i);
    assert.doesNotMatch(publicCareerCopy, /특별승진|입사\s*19개월|special promotion|promotion\s*19 months|19 months after joining/i);
});

test('award evidence stays in the detailed CV and portfolio while Home hides the temporary award gallery', () => {
    for (const page of [cv, portfolio]) {
        assert.match(page, /5(?:개 )?팀/);
        assert.match(page, /300만원/);
        assert.match(page, /1,000만원/);
    }
    assert.match(cv, /data-kr="우수상"/);
    assert.match(cv, /상금 1,000만원/);
    assert.doesNotMatch(index, /recognition-section|award-oldboy|award-innovation|혁신상|Innovation award|전사 우수상|company-wide excellence award/i);
    assert.doesNotMatch(publicCareerCopy, /혁신상[^<]{0,80}50만원|Innovation[^<]{0,80}(?:KRW )?500,000/i);
});

test('temporary software ribbon uses exactly ten replaceable original SVG assets', async () => {
    const images = [...index.matchAll(/src="(images\/career\/samples\/sw-\d{2}\.svg)"/g)].map((match) => match[1]);
    assert.equal(new Set(images).size, 10, 'ribbon must reference ten unique software visuals');
    assert.equal((index.match(/class="software-ribbon-item"/g) ?? []).length, 20, 'ribbon duplicates one ten-item set for a seamless loop');
    for (const path of new Set(images)) {
        await access(new URL(path, root));
        const metadata = await stat(new URL(path, root));
        assert.ok(metadata.size < 100_000, `${path} should stay lightweight`);
        const svg = await read(path);
        const stack = [];
        for (const match of svg.matchAll(/<\/?([a-z][\w:-]*)(?:\s[^<>]*?)?\s*\/?>/gi)) {
            const token = match[0];
            const tag = match[1];
            if (token.startsWith('</')) {
                assert.equal(stack.pop(), tag, `${path} has an unbalanced </${tag}> tag`);
            } else if (!token.endsWith('/>')) {
                stack.push(tag);
            }
        }
        assert.deepEqual(stack, [], `${path} has unclosed SVG tags`);
        const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        assert.match(index, new RegExp(`<img[^>]+src="${escaped}"[^>]+alt="[^"]{8,}"[^>]+loading="lazy"`, 'i'));
    }
});

test('capabilities and current projects use geometric visual anchors instead of text-only cards', () => {
    assert.equal((index.match(/class="capability-orbit-item"/g) ?? []).length, 6);
    for (const label of ['AI', 'JVM', 'C++', 'TSX', 'MCP', 'AWS']) {
        assert.match(index, new RegExp(`class="capability-mark"[^>]*>${label.replace('+', '\\+')}`));
    }
    assert.equal((index.match(/class="project-geometry"/g) ?? []).length, 3);
});

test('latest public surfaces keep the strongest ownership story and remove the weak chatbot claim', () => {
    assert.doesNotMatch(publicCareerCopy, /Technical Support chatbot|Global Technical Support|\bSolis\b|RabbitMQ/i);
    for (const phrase of ['Developer Portal', '20만 LOC', '40%']) {
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
    assert.match(homeCss, /--home-accent:\s*#[0-9a-f]{6}/i);
    assert.match(homeCss, /prefers-reduced-motion:\s*reduce/);
    assert.match(homeCss, /\.software-ribbon-track[\s\S]*?animation:\s*none/);
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
