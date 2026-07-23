(function (root) {
    'use strict';

    const state = {
        frame: 0,
        initialized: false,
        reducedMotion: null,
        stages: [],
    };

    const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

    function progressForStage(rectTop, stageHeight, viewportHeight, headerHeight) {
        const scrollRange = Math.max(1, stageHeight - viewportHeight);
        return clamp((headerHeight - rectTop) / scrollRange, 0, 1);
    }

    function trackTravel(trackWidth, viewportWidth, gutter) {
        return Math.max(0, trackWidth - viewportWidth + (gutter * 2));
    }

    function readHeaderHeight() {
        const raw = root.getComputedStyle(root.document.documentElement)
            .getPropertyValue('--home-header-height');
        return Number.parseFloat(raw) || 0;
    }

    function readGutter() {
        const raw = root.getComputedStyle(root.document.documentElement)
            .getPropertyValue('--home-gutter');
        return Number.parseFloat(raw) || 0;
    }

    function collectStages() {
        return [...root.document.querySelectorAll('[data-scroll-stage]')]
            .map((stage) => {
                const name = stage.dataset.scrollStage;
                const track = stage.querySelector(`[data-scroll-track="${name}"]`);
                return track ? { name, stage, track } : null;
            })
            .filter(Boolean);
    }

    function clearMotion() {
        root.document.body.classList.remove('home-motion-enhanced');
        state.stages.forEach(({ stage, track }) => {
            track.style.removeProperty('transform');
            stage.removeAttribute('data-motion-progress');
        });
    }

    function applyMotion() {
        state.frame = 0;

        const shouldReduce = state.reducedMotion?.matches || root.innerWidth <= 900;
        if (shouldReduce) {
            clearMotion();
            return;
        }

        root.document.body.classList.add('home-motion-enhanced');
        const headerHeight = readHeaderHeight();
        const gutter = readGutter();

        state.stages.forEach(({ name, stage, track }) => {
            const rect = stage.getBoundingClientRect();
            const progress = progressForStage(rect.top, rect.height, root.innerHeight, headerHeight);
            const viewportWidth = track.parentElement?.clientWidth || root.innerWidth;
            const travel = name === 'media'
                ? Math.max(0, track.scrollWidth / 2)
                : trackTravel(track.scrollWidth, viewportWidth, gutter);

            track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
            stage.dataset.motionProgress = progress.toFixed(3);
        });
    }

    function schedule() {
        if (state.frame) return;
        state.frame = root.requestAnimationFrame(applyMotion);
    }

    function refresh() {
        if (!root.document?.body) return;
        state.stages = collectStages();
        applyMotion();
    }

    function init() {
        if (state.initialized || !root.document?.body) return;
        state.initialized = true;
        state.reducedMotion = root.matchMedia('(prefers-reduced-motion: reduce)');
        state.reducedMotion.addEventListener?.('change', refresh);
        root.addEventListener('scroll', schedule, { passive: true });
        root.addEventListener('resize', schedule, { passive: true });
        root.addEventListener('load', refresh, { once: true });
        root.document.fonts?.ready.then(refresh);
        refresh();
    }

    root.HomeMotion = Object.freeze({
        init,
        progressForStage,
        refresh,
        trackTravel,
    });

    if (root.document) {
        if (root.document.readyState === 'loading') {
            root.document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
