# Sewon Park — Developer career site

[haakusi.github.io](https://haakusi.github.io/) is a bilingual public career site for a platform and product engineer working across device boundaries, developer experience, industrial software, applied AI, and verification-first delivery. The visual direction intentionally returns to the site's original quiet, single-column format.

## Information architecture

- `index.html` — concise profile, selected work, active research, and recent notes
- `portfolio.html` — three judgment-led case studies with explicit project status
- `cv.html` — reverse-chronological public CV with Korean and English PDFs
- `research.html` — active questions, baselines, methods, and public notes
- `blog.html`, `lectures.html`, `reading.html` — long-term evidence of writing, graduate study, and learning

The root pages use `common.js` for the original five-route bilingual navigation and controls. `style.css` is the historical 850px single-column foundation; `simple-site.css` is a small compatibility layer that keeps the newer Portfolio, Research, Notes, and CV content readable without the retired cinematic skins or motion runtime.

## Privacy and evidence boundary

Public work is described through the problem, engineering judgment, implementation boundary, outcome, and current status. The site intentionally excludes private source paths, customer information, internal code, sensitive personal details, and confidential metrics. Work in progress is labeled separately from completed or published work.

## Local verification

```bash
node scripts/check-career-product.mjs
node scripts/check-public-career-site.mjs
node scripts/check-simple-site.mjs
node scripts/check-career-pdfs.mjs
node --check common.js
git diff --check
```

Serve the repository root over HTTP for browser checks; opening the pages directly from disk can hide path and browser-policy issues.
