# Sewon Park — Developer career site

[haakusi.github.io](https://haakusi.github.io/) is a bilingual public career site for an AI-native platform and product engineer working across device boundaries, developer experience, industrial software, and verification-first delivery.

## Information architecture

- `index.html` — 30-second positioning, best-fit roles, selected evidence, and direct contact paths
- `portfolio.html` — three judgment-led case studies with explicit project status
- `cv.html` — reverse-chronological public CV with Korean and English PDFs
- `research.html` — active questions, baselines, methods, and public notes
- `blog.html`, `lectures.html`, `reading.html` — long-term evidence of writing, graduate study, and learning

The root pages use `common.js` for bilingual navigation and controls, and `career-system.css` for a shared responsive visual system. Page-specific styles remain as structural fallbacks for older archive content.

## Privacy and evidence boundary

Public work is described through the problem, engineering judgment, implementation boundary, outcome, and current status. The site intentionally excludes private source paths, customer information, internal code, sensitive personal details, and confidential metrics. Work in progress is labeled separately from completed or published work.

## Local verification

```bash
node scripts/check-career-product.mjs
node scripts/check-public-career-site.mjs
node scripts/check-career-visual-system.mjs
node scripts/check-career-pdfs.mjs
node --check common.js
git diff --check
```

Serve the repository root over HTTP for browser checks; opening the pages directly from disk can hide path and browser-policy issues.
