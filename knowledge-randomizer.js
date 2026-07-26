(function (root, factory) {
    const api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.KnowledgeRandomizer = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
    'use strict';

    // Add future public entries here; the layout reads this manifest automatically.
    const KNOWLEDGE_IMAGE_POOLS = Object.freeze({
        writing: Object.freeze([
            Object.freeze({
                src: 'images/knowledge/writing-ai-lecture-notes-v1.webp',
                href: 'blog5.html',
                label: 'WRITING / 01',
                date: '2026-05-09',
                title: Object.freeze({ en: "Notes on Geoffrey Hinton's AI lecture", kr: 'Geoffrey Hinton AI 연설 노트' }),
                summary: Object.freeze({
                    en: 'A long-form note connecting intelligence, learning, safety, and the questions engineers should keep asking.',
                    kr: '지능·학습·안전과 엔지니어가 계속 물어야 할 질문을 연결한 긴 글입니다.',
                }),
            }),
            Object.freeze({
                src: 'platform_architectures.png',
                href: 'blog3.html',
                label: 'WRITING / 02',
                date: '2025-12-11',
                title: Object.freeze({ en: 'Expanding as an AI Engineer', kr: 'AI Engineer 개발자로의 확장' }),
                summary: Object.freeze({
                    en: 'A note on domain-driven architecture, AI context, retrieval, implementation, and deployment as one engineering lifecycle.',
                    kr: '도메인 아키텍처·AI 컨텍스트·검색·구현·배포를 하나의 엔지니어링 생명주기로 연결한 글입니다.',
                }),
            }),
            Object.freeze({
                src: 'og-banner.png',
                href: 'blog4.html',
                label: 'WRITING / 03',
                date: '2025-12-11',
                title: Object.freeze({ en: 'About data-driven intelligent systems', kr: '데이터 기반 지능형 시스템에 대하여' }),
                summary: Object.freeze({
                    en: 'A note on connecting data collection, analysis, insight, and tool execution into proactive AI automation.',
                    kr: '데이터 수집·분석·인사이트·도구 실행을 선제적 AI 자동화로 연결한 글입니다.',
                }),
            }),
        ]),
        reading: Object.freeze([
            Object.freeze({ src: 'images/books/하루5분뇌력낭비없애는루틴.jpg' }),
            Object.freeze({ src: 'images/books/실리콘밸리 프로세스의 힘.jpg' }),
            Object.freeze({ src: 'images/books/software-object-lifecycle.jpg' }),
            Object.freeze({ src: 'images/books/bitcoin-no-future.jpg' }),
            Object.freeze({ src: 'images/books/호의에대하여.jpg' }),
            Object.freeze({ src: 'images/books/THE_ART_OF_SPENDING_MONEY.jpg' }),
            Object.freeze({ src: 'images/books/90-seconds-to-a-life-you-love.jpeg' }),
        ]),
        coursework: Object.freeze([
            Object.freeze({ src: 'images/knowledge/graduate-coursework-v1.webp' }),
            Object.freeze({ src: 'images/lectures/data-visualization/week-08/a1-final-preview.png' }),
            Object.freeze({ src: 'images/lectures/data-visualization/week-08/a1-process-sketch.png' }),
        ]),
    });

    function secureRandom() {
        if (root.crypto && typeof root.crypto.getRandomValues === 'function') {
            const buffer = new Uint32Array(1);
            root.crypto.getRandomValues(buffer);
            return buffer[0] / 4294967296;
        }
        return Math.random();
    }

    function shuffleUnique(items, random = secureRandom) {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const target = Math.floor(random() * (index + 1));
            [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
        }
        return shuffled;
    }

    function selectForSlots(pool, slotCount, random = secureRandom) {
        if (!Array.isArray(pool) || pool.length === 0 || slotCount <= 0) return [];
        const selected = [];
        while (selected.length < slotCount) {
            const batch = shuffleUnique(pool, random);
            for (const path of batch) {
                if (selected.length >= slotCount) break;
                selected.push(path);
            }
        }
        return selected;
    }

    function applyKnowledgeEntry(card, item, lang = 'en') {
        if (!card || !item) return;
        if (item.href) card.setAttribute('href', item.href);

        const title = card.querySelector('[data-random-knowledge-title]');
        if (title && item.title) {
            title.setAttribute('data-en', item.title.en);
            title.setAttribute('data-kr', item.title.kr);
            title.textContent = lang === 'kr' ? item.title.kr : item.title.en;
        }

        const summary = card.querySelector('[data-random-knowledge-summary]');
        if (summary && item.summary) {
            summary.setAttribute('data-en', item.summary.en);
            summary.setAttribute('data-kr', item.summary.kr);
            summary.textContent = lang === 'kr' ? item.summary.kr : item.summary.en;
        }

        const date = card.querySelector('[data-random-knowledge-date]');
        if (date && item.date) {
            date.setAttribute('datetime', item.date);
            date.textContent = item.date.replaceAll('-', '.');
        }

        const label = card.querySelector('[data-random-knowledge-label]');
        if (label && item.label) label.textContent = item.label;
    }

    function randomizeKnowledgeImages(document = root.document, random = secureRandom) {
        if (!document || typeof document.querySelectorAll !== 'function') return {};
        const result = {};

        for (const [category, pool] of Object.entries(KNOWLEDGE_IMAGE_POOLS)) {
            const slots = [...document.querySelectorAll(`img[data-random-knowledge="${category}"]`)];
            const selections = selectForSlots(pool, slots.length, random);
            slots.forEach((image, index) => {
                const item = selections[index];
                if (!item) return;
                image.setAttribute('src', item.src);
                image.dataset.randomizedSrc = item.src;
                if (category === 'writing') {
                    const card = image.closest('[data-random-knowledge-card="writing"]');
                    applyKnowledgeEntry(card, item, document.documentElement.dataset.lang || 'en');
                }
            });
            result[category] = selections.map((item) => item.src);
        }

        document.documentElement.dataset.knowledgeRandomized = 'true';
        return result;
    }

    if (root.document) {
        const start = () => randomizeKnowledgeImages(root.document);
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
        else start();
    }

    return { KNOWLEDGE_IMAGE_POOLS, applyKnowledgeEntry, randomizeKnowledgeImages, secureRandom, selectForSlots, shuffleUnique };
});
