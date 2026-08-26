import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const shared = read('style.css');
const simple = read('simple-site.css');
const home = read('index.html');
const portfolio = read('portfolio.html');
const cv = read('cv-style.css');
const common = read('common.js');

test('shared shell does not inject retired career stylesheets', () => {
    assert.doesNotMatch(common, /career-system\.css|career-skin\.css/);
});

test('all public roots return to the centered 850px historical rail', () => {
    assert.match(shared, /\.container\s*\{[^}]*max-width:\s*850px/);
    assert.match(shared, /\.container\s*\{[^}]*padding:\s*80px 40px/);
    assert.doesNotMatch(simple, /min-width:\s*1[0-9]{3}px/);
});

test('Home uses plain semantic sections without cinematic stage hooks', () => {
    for (const id of ['about-title', 'work-title', 'research-title', 'notes-title']) {
        assert.match(home, new RegExp(`id="${id}"`));
    }
    assert.doesNotMatch(home, /data-profile-|profile-cinematic|profile-motion\.js/);
});

test('Portfolio keeps evidence while retiring cinematic presentation assets', () => {
    assert.match(portfolio, /id="case-developer-platform"/);
    assert.doesNotMatch(portfolio, /portfolio-style\.css|portfolio-showcase\.css|portfolio-interactions\.js/);
    assert.doesNotMatch(portfolio, /data-project-showcase|images\/career\/showcase\//);
});

test('CV screen follows the simple serif shell while keeping print rules separate', () => {
    assert.match(simple, /body\.cv-page[^{]*\{[^}]*font-family:\s*'Georgia'/);
    assert.match(simple, /body\.cv-page \.cv-profile,[\s\S]*?display:\s*block\s*!important/);
    assert.match(simple, /body\.cv-page \.cv-profile h1\s*\{[^}]*font-size:\s*2\.2em/);
});

test('CV print uses deliberate A4 margins, matching rails, and a reproducible renderer', () => {
    assert.match(cv, /@page\s*\{[^}]*size:\s*A4;[^}]*margin:\s*14mm 15mm/);
    assert.match(cv, /@media print[\s\S]*?body\.cv-page \.cv-section-heading\s*\{[^}]*grid-template-columns:\s*29mm\s+minmax\(0,\s*1fr\)[^}]*gap:\s*5mm/);
    assert.match(cv, /@media print[\s\S]*?body\.cv-page \.cv-closing\s*\{[^}]*display:\s*none\s*!important/);
    assert.match(cv, /@media print[\s\S]*?\.cv-entry-header,\s*\.cv-contribution header\s*\{[^}]*padding:\s*0\s*!important[^}]*text-align:\s*left\s*!important/);
    assert.doesNotThrow(() => read('scripts/render-career-pdfs.mjs'));
});
