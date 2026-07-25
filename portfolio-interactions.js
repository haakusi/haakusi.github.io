(function (root, factory) {
    const api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (!root || !root.document) return;

    const boot = () => {
        api.enhanceCaseDetails(root.document);
        api.enhanceProjectShowcase(root.document);
    };

    if (root.document.readyState === 'loading') {
        root.document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function closeSiblingDetails(current) {
        if (!current.open) return;

        const accordion = current.closest('[data-case-accordion]');
        if (!accordion) return;

        accordion.querySelectorAll('.case-detail').forEach((detail) => {
            if (detail !== current && detail.open) detail.open = false;
        });
    }

    function enhanceCaseDetails(documentNode) {
        const accordions = documentNode.querySelectorAll('[data-case-accordion]');
        if (!accordions.length) return;

        documentNode.documentElement.classList.add('portfolio-details-enhanced');

        accordions.forEach((accordion) => {
            if (accordion.dataset.caseAccordionBound === 'true') return;
            accordion.dataset.caseAccordionBound = 'true';

            accordion.querySelectorAll('.case-detail').forEach((detail) => {
                detail.addEventListener('toggle', () => closeSiblingDetails(detail));
            });
        });
    }

    function sceneIndexFromProgress(progress, count) {
        if (!Number.isFinite(count) || count <= 1) return 0;
        const normalized = Math.min(1, Math.max(0, Number(progress) || 0));
        return Math.min(count - 1, Math.round(normalized * (count - 1)));
    }

    function currentLanguage(documentNode) {
        return documentNode.documentElement.dataset.lang === 'kr' ? 'kr' : 'en';
    }

    function setScene(showcase, index, options = {}) {
        const tabs = Array.from(showcase.querySelectorAll('.showcase-tab'));
        const scenes = Array.from(showcase.querySelectorAll('.showcase-scene'));
        const safeIndex = Math.min(tabs.length - 1, Math.max(0, index));
        const activeTab = tabs[safeIndex];
        if (!activeTab) return;

        tabs.forEach((tab, tabIndex) => {
            const selected = tabIndex === safeIndex;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });

        scenes.forEach((scene, sceneIndex) => {
            const selected = sceneIndex === safeIndex;
            scene.classList.toggle('is-active', selected);
            scene.setAttribute('aria-hidden', String(!selected));
        });

        showcase.dataset.showcaseActive = activeTab.dataset.showcaseKey;
        showcase.style.setProperty('--showcase-progress', tabs.length > 1 ? String(safeIndex / (tabs.length - 1)) : '1');

        const current = showcase.querySelector('[data-showcase-current]');
        if (current) current.textContent = String(safeIndex + 1).padStart(2, '0');

        if (options.focus) activeTab.focus({ preventScroll: true });
    }

    function updateDialogFromTrigger(documentNode, dialog, trigger) {
        if (!trigger) return;

        const lang = currentLanguage(documentNode);
        const image = trigger.querySelector('img');
        const scene = trigger.closest('.showcase-scene');
        const scenes = Array.from(documentNode.querySelectorAll('.showcase-scene'));
        const sceneIndex = Math.max(0, scenes.indexOf(scene));

        const dialogImage = dialog.querySelector('[data-showcase-dialog-image]');
        const dialogTitle = dialog.querySelector('[data-showcase-dialog-title]');
        const dialogCopy = dialog.querySelector('[data-showcase-dialog-copy]');
        const dialogMeta = dialog.querySelector('[data-showcase-dialog-meta]');
        const dialogIndex = dialog.querySelector('[data-showcase-dialog-index]');

        if (dialogImage && image) {
            dialogImage.src = image.currentSrc || image.src;
            dialogImage.alt = image.alt;
        }
        if (dialogTitle) dialogTitle.textContent = trigger.dataset[`showcaseTitle${lang === 'kr' ? 'Kr' : 'En'}`] || '';
        if (dialogCopy) dialogCopy.textContent = trigger.dataset[`showcaseCopy${lang === 'kr' ? 'Kr' : 'En'}`] || '';
        if (dialogMeta) dialogMeta.textContent = trigger.dataset.showcaseMeta || '';
        if (dialogIndex) dialogIndex.textContent = `${String(sceneIndex + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;

        dialog.dataset.showcaseSource = trigger.dataset.showcaseOpen || '';
    }

    function enhanceProjectShowcase(documentNode) {
        const showcases = Array.from(documentNode.querySelectorAll('[data-project-showcase]'));
        if (!showcases.length) return;

        const win = documentNode.defaultView;
        const dialog = documentNode.querySelector('[data-showcase-dialog]');
        const reducedMotion = win && win.matchMedia('(prefers-reduced-motion: reduce)');
        const desktop = win && win.matchMedia('(min-width: 901px)');
        let activeDialogTrigger = null;

        documentNode.documentElement.classList.add('portfolio-showcase-enhanced');

        showcases.forEach((showcase) => {
            if (showcase.dataset.showcaseBound === 'true') return;
            showcase.dataset.showcaseBound = 'true';

            const tabs = Array.from(showcase.querySelectorAll('.showcase-tab'));
            let scrollFrame = 0;

            const selectFromScroll = () => {
                scrollFrame = 0;
                if (!win || !desktop.matches || reducedMotion.matches) return;

                const rect = showcase.getBoundingClientRect();
                const travel = Math.max(1, showcase.offsetHeight - win.innerHeight);
                const progress = Math.min(1, Math.max(0, -rect.top / travel));
                setScene(showcase, sceneIndexFromProgress(progress, tabs.length));
            };

            const requestScrollUpdate = () => {
                if (!win || scrollFrame) return;
                scrollFrame = win.requestAnimationFrame(selectFromScroll);
            };

            const scrollToScene = (index) => {
                setScene(showcase, index, { focus: true });
                if (!win || !desktop.matches || reducedMotion.matches) return;

                const sectionTop = showcase.getBoundingClientRect().top + win.scrollY;
                const travel = Math.max(0, showcase.offsetHeight - win.innerHeight);
                const ratio = tabs.length > 1 ? index / (tabs.length - 1) : 0;
                win.scrollTo({ top: sectionTop + (travel * ratio), behavior: 'smooth' });
            };

            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => scrollToScene(index));
                tab.addEventListener('keydown', (event) => {
                    let nextIndex = index;
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
                    if (event.key === 'Home') nextIndex = 0;
                    if (event.key === 'End') nextIndex = tabs.length - 1;
                    if (nextIndex === index) return;
                    event.preventDefault();
                    scrollToScene(nextIndex);
                });
            });

            showcase.querySelectorAll('[data-showcase-open]').forEach((trigger) => {
                trigger.addEventListener('click', () => {
                    if (!dialog) return;
                    activeDialogTrigger = trigger;
                    updateDialogFromTrigger(documentNode, dialog, trigger);
                    if (typeof dialog.showModal === 'function') dialog.showModal();
                    else dialog.setAttribute('open', '');
                });
            });

            setScene(showcase, 0);
            if (win) {
                win.addEventListener('scroll', requestScrollUpdate, { passive: true });
                win.addEventListener('resize', requestScrollUpdate, { passive: true });
                requestScrollUpdate();
            }
        });

        if (dialog && dialog.dataset.showcaseDialogBound !== 'true') {
            dialog.dataset.showcaseDialogBound = 'true';
            const closeButton = dialog.querySelector('[data-showcase-close]');
            const closeDialog = () => {
                if (typeof dialog.close === 'function') dialog.close();
                else dialog.removeAttribute('open');
                if (activeDialogTrigger) activeDialogTrigger.focus({ preventScroll: true });
            };

            if (closeButton) closeButton.addEventListener('click', closeDialog);
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) closeDialog();
            });
            dialog.addEventListener('cancel', (event) => {
                event.preventDefault();
                closeDialog();
            });

            if (typeof MutationObserver !== 'undefined') {
                const languageObserver = new MutationObserver(() => {
                    if (dialog.open && activeDialogTrigger) updateDialogFromTrigger(documentNode, dialog, activeDialogTrigger);
                });
                languageObserver.observe(documentNode.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
            }
        }
    }

    return {
        closeSiblingDetails,
        enhanceCaseDetails,
        enhanceProjectShowcase,
        sceneIndexFromProgress,
        setScene,
    };
}));
