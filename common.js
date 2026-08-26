// Shared header, navigation, footer, and theme/language controls.

(function () {
    'use strict';

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const pathFromRoot = window.location.pathname.replace(/^\//, '');
    const slashCount = (pathFromRoot.match(/\//g) || []).length;
    const prefix = slashCount > 0 ? '../'.repeat(slashCount) : '';

    function ensureSimpleSiteStyles() {
        if (document.querySelector('link[href*="simple-site.css"]')) return;

        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = `${prefix}simple-site.css?v=2026082603`;
        document.head.appendChild(stylesheet);
    }

    function renderHeader() {
        const header = document.getElementById('site-header');
        if (!header) return;

        header.innerHTML = `
        <header>
            <h1 data-en="Sewon Park" data-kr="박세원">Sewon Park</h1>
            <p class="subtitle" data-en="Platform &amp; Product Engineering Lead · Device-to-Cloud" data-kr="플랫폼·제품 엔지니어링 리드 · 장치–클라우드">Platform &amp; Product Engineering Lead · Device-to-Cloud</p>
            <div class="social-links">
                <a href="mailto:haakusi@gmail.com" aria-label="Email">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-10 5L2 7"/>
                    </svg>
                </a>
                <a href="https://github.com/haakusi" target="_blank" rel="me noreferrer" aria-label="GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.589 24 17.092 24 11.792 24 5.165 18.627 0 12 0z"/>
                    </svg>
                </a>
                <a href="https://www.linkedin.com/in/sewon-p-38009a1a7/" target="_blank" rel="me noreferrer" aria-label="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                </a>
                <a href="https://twitter.com/haakusi_" target="_blank" rel="me noreferrer" aria-label="X (Twitter)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
            </div>
        </header>`;
    }

    function renderNavigation() {
        const navigation = document.getElementById('site-nav');
        if (!navigation) return;

        const navItems = [
            { href: 'index.html', en: 'Home', kr: '홈' },
            { href: 'blog.html', en: 'Blog', kr: '블로그' },
            { href: 'lectures.html', en: 'Lectures', kr: '강의' },
            { href: 'reading.html', en: 'Reading', kr: '독서' },
            { href: 'cv.html', en: 'CV', kr: '이력서' },
        ];

        const activePage = page || 'index.html';
        const links = navItems.map((item) => {
            const isActive = activePage === item.href
                || (item.href === 'blog.html' && /^blog\d*\.html$/.test(activePage))
                || (item.href === 'lectures.html' && (
                    activePage === 'lectures.html'
                    || window.location.pathname.includes('/lectures/')
                ))
                || (item.href === 'reading.html' && (
                    activePage === 'reading.html'
                    || activePage.startsWith('reading-book-')
                    || window.location.pathname.includes('/reading/')
                ));
            const activeClass = isActive ? ' active' : '';
            const current = isActive ? ' aria-current="page"' : '';

            return `<a href="${prefix}${item.href}" class="nav-link${activeClass}"${current} data-en="${item.en}" data-kr="${item.kr}">${item.en}</a>`;
        }).join('\n            ');

        navigation.innerHTML = `<nav class="navigation" aria-label="Primary">
            ${links}
        </nav>`;
    }

    function renderFooter() {
        const footer = document.getElementById('site-footer');
        if (!footer) return;

        footer.innerHTML = `<footer>
            <p data-en="A public record of engineering work, research, and continuous learning." data-kr="엔지니어링 실무·연구·지속적인 학습을 기록하는 공개 아카이브입니다.">A public record of engineering work, research, and continuous learning.</p>
            <p data-en="Last updated: August 2026" data-kr="마지막 업데이트: 2026년 8월">Last updated: August 2026</p>
        </footer>`;
    }

    function updateContent(lang) {
        document.querySelectorAll('[data-en][data-kr]').forEach((element) => {
            const value = element.getAttribute(lang === 'kr' ? 'data-kr' : 'data-en');
            if (value !== null) element.textContent = value;
        });

        document.querySelectorAll('.lang-en, .lang-kr').forEach((element) => {
            element.hidden = element.classList.contains('lang-en') ? lang !== 'en' : lang !== 'kr';
        });
    }

    function updateToggleLabels(theme, lang) {
        const themeButton = document.querySelector('.theme-toggle');
        const languageButton = document.querySelector('.lang-toggle');

        if (themeButton) {
            const switchToLight = theme === 'dark';
            const label = lang === 'kr'
                ? (switchToLight ? '라이트 모드로 전환' : '다크 모드로 전환')
                : (switchToLight ? 'Switch to light mode' : 'Switch to dark mode');
            themeButton.setAttribute('aria-label', label);
            themeButton.setAttribute('title', label);
        }

        if (languageButton) {
            const label = lang === 'kr' ? '영어로 전환' : 'Switch to Korean';
            languageButton.setAttribute('aria-label', label);
            languageButton.setAttribute('title', label);
        }
    }

    window.toggleTheme = function () {
        const html = document.documentElement;
        const theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        const lang = html.getAttribute('data-lang') || 'en';

        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const button = document.querySelector('.theme-toggle');
        if (button) button.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
        updateToggleLabels(theme, lang);
    };

    window.toggleLanguage = function () {
        const html = document.documentElement;
        const lang = (html.getAttribute('data-lang') || 'en') === 'en' ? 'kr' : 'en';
        const theme = html.getAttribute('data-theme') || 'dark';

        html.setAttribute('data-lang', lang);
        document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';
        localStorage.setItem('language', lang);

        const button = document.querySelector('.lang-toggle');
        if (button) button.textContent = lang === 'en' ? 'EN' : '\uD55C';
        updateContent(lang);
        updateToggleLabels(theme, lang);
    };

    window.updateContent = updateContent;

    function init() {
        ensureSimpleSiteStyles();
        renderHeader();
        renderNavigation();
        renderFooter();

        const requestedLang = new URLSearchParams(window.location.search).get('lang');
        const lang = requestedLang === 'en' || requestedLang === 'kr'
            ? requestedLang
            : (localStorage.getItem('language') || 'en');
        const theme = localStorage.getItem('theme') || 'dark';

        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';

        const themeButton = document.querySelector('.theme-toggle');
        const languageButton = document.querySelector('.lang-toggle');
        if (themeButton) themeButton.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
        if (languageButton) languageButton.textContent = lang === 'en' ? 'EN' : '\uD55C';

        updateContent(lang);
        updateToggleLabels(theme, lang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
