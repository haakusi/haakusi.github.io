// common.js — Shared header, nav, footer, and theme/lang toggle for haakusi.github.io

(function () {
    'use strict';

    // Detect base path based on current page depth
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    // For GitHub Pages: haakusi.github.io/lectures/2026-spring/file.html -> depth from site root
    const siteRoot = window.location.hostname.includes('github.io') ? '' : '';
    let prefix = '';

    // Calculate relative prefix based on directory depth from root
    // Root files: index.html, blog.html -> prefix = ''
    // lectures/2026-spring/file.html -> prefix = '../../'
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const pathFromRoot = window.location.pathname.replace(/^\//, '');
    const slashCount = (pathFromRoot.match(/\//g) || []).length;
    if (slashCount > 0) {
        prefix = '../'.repeat(slashCount);
    }

    // ===== HEADER =====
    function renderHeader() {
        const headerEl = document.getElementById('site-header');
        if (!headerEl) return;

        headerEl.innerHTML = `
        <header>
            <h1 data-en="Sewon Park" data-kr="박세원">Sewon Park</h1>
            <p class="subtitle" data-en="Research Engineer | AI & Full-Stack Development" data-kr="선임 연구원 | AI 및 풀스택 개발">Research Engineer | AI & Full-Stack Development</p>
            <div class="social-links">
                <a href="mailto:haakusi@gmail.com" aria-label="Email">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-10 5L2 7"/>
                    </svg>
                </a>
                <a href="https://github.com/haakusi" target="_blank" aria-label="GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
                <a href="https://www.linkedin.com/in/sewon-p-38009a1a7/" target="_blank" aria-label="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                </a>
                <a href="https://twitter.com/haakusi_" target="_blank" aria-label="X (Twitter)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
            </div>
        </header>`;
    }

    // ===== NAVIGATION =====
    function renderNav() {
        const navEl = document.getElementById('site-nav');
        if (!navEl) return;

        const navItems = [
            { href: 'index.html', en: 'Home', kr: '홈' },
            { href: 'blog.html', en: 'Blog', kr: '블로그' },
            { href: 'lectures.html', en: 'Lectures', kr: '강의' },
            { href: 'reading.html', en: 'Reading', kr: '독서' },
            { href: 'cv.html', en: 'CV', kr: '이력서' }
        ];

        // Determine active page
        const currentPage = page || 'index.html';

        const links = navItems.map(item => {
            const isActive = currentPage === item.href
                || (item.href === 'blog.html' && currentPage.startsWith('blog'))
                || (item.href === 'lectures.html' && (currentPage === 'lectures.html' || window.location.pathname.includes('/lectures/')))
                || (item.href === 'reading.html' && (currentPage === 'reading.html' || window.location.pathname.includes('/reading/')));

            const activeClass = isActive ? ' active' : '';
            const fullHref = prefix + item.href;

            return `<a href="${fullHref}" class="nav-link${activeClass}" data-en="${item.en}" data-kr="${item.kr}">${item.en}</a>`;
        }).join('\n            ');

        navEl.innerHTML = `<nav class="navigation">
            ${links}
        </nav>`;
    }

    // ===== FOOTER =====
    function renderFooter() {
        const footerEl = document.getElementById('site-footer');
        if (!footerEl) return;

        footerEl.innerHTML = `<footer>
            <p>Last updated: March 2026</p>
        </footer>`;
    }

    // ===== THEME TOGGLE =====
    window.toggleTheme = function () {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const button = document.querySelector('.theme-toggle');
        if (button) button.textContent = newTheme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    };

    // ===== LANGUAGE TOGGLE =====
    window.toggleLanguage = function () {
        const html = document.documentElement;
        const currentLang = html.getAttribute('data-lang') || 'en';
        const newLang = currentLang === 'en' ? 'kr' : 'en';

        html.setAttribute('data-lang', newLang);
        localStorage.setItem('language', newLang);

        const button = document.querySelector('.lang-toggle');
        if (button) button.textContent = newLang === 'en' ? 'EN' : '\uD55C';

        updateContent(newLang);
    };

    // ===== UPDATE BILINGUAL CONTENT =====
    window.updateContent = function (lang) {
        document.querySelectorAll('[data-en][data-kr]').forEach(function (el) {
            if (lang === 'kr' && el.getAttribute('data-kr')) {
                el.textContent = el.getAttribute('data-kr');
            } else if (lang === 'en' && el.getAttribute('data-en')) {
                el.textContent = el.getAttribute('data-en');
            }
        });
    };

    // ===== INIT ON DOM READY =====
    function init() {
        // Render shared components
        renderHeader();
        renderNav();
        renderFooter();

        // Apply saved theme
        var savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        var themeButton = document.querySelector('.theme-toggle');
        if (themeButton) themeButton.textContent = savedTheme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';

        // Apply saved language
        var savedLang = localStorage.getItem('language') || 'en';
        document.documentElement.setAttribute('data-lang', savedLang);
        var langButton = document.querySelector('.lang-toggle');
        if (langButton) langButton.textContent = savedLang === 'en' ? 'EN' : '\uD55C';

        updateContent(savedLang);
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
