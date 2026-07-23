(function (root) {
    'use strict';

    const state = {
        cinematicScenes: [],
        frame: 0,
        initialized: false,
        heroDepth: null,
        reducedMotion: null,
        stages: [],
    };

    const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

    function progressForStage(rectTop, stageHeight, viewportHeight, headerHeight) {
        const scrollRange = Math.max(1, stageHeight - viewportHeight);
        return clamp((headerHeight - rectTop) / scrollRange, 0, 1);
    }

    function sceneProgressForRect(rectTop, sceneHeight, viewportHeight, headerHeight) {
        const scrollRange = Math.max(1, viewportHeight + sceneHeight - headerHeight);
        return clamp((viewportHeight - rectTop) / scrollRange, 0, 1);
    }

    function trackTravel(trackWidth, viewportWidth, gutter) {
        return Math.max(0, trackWidth - viewportWidth + (gutter * 2));
    }

    function smoothstep(value) {
        const progress = clamp(value, 0, 1);
        return progress * progress * (3 - (2 * progress));
    }

    function heroDepthForProgress(value) {
        const progress = clamp(value, 0, 1);
        const enter = smoothstep(progress / 0.65);
        const exit = smoothstep((progress - 0.65) / 0.35);
        const precise = (number) => Number(number.toFixed(4));

        return {
            scale: precise(0.88 + (0.12 * enter) + (0.08 * exit)),
            translateY: precise((40 * (1 - enter)) - (28 * exit)),
            opacity: precise(0.84 + (0.16 * enter) - (0.38 * exit)),
            briefY: precise((18 * (1 - enter)) - (14 * exit)),
            shade: precise(0.36 - (0.24 * enter) + (0.34 * exit)),
        };
    }

    function sceneFrameForProgress(value) {
        const progress = clamp(value, 0, 1);
        const enter = smoothstep(progress / 0.5);
        const exit = smoothstep((progress - 0.5) / 0.5);
        const precise = (number) => Number(number.toFixed(4));

        return {
            scale: precise(1.06 - (0.06 * enter) - (0.04 * exit)),
            translateY: precise((28 * (1 - enter)) - (28 * exit)),
            opacity: precise(0.58 + (0.42 * enter) - (0.5 * exit)),
            blur: precise((4 * (1 - enter)) + (4 * exit)),
            shade: precise(0.5 - (0.38 * enter) + (0.48 * exit)),
        };
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

    function readSceneTop() {
        const style = root.getComputedStyle(root.document.documentElement);
        const primary = Number.parseFloat(style.getPropertyValue('--career-shell-primary')) || 70;
        const secondary = Number.parseFloat(style.getPropertyValue('--career-shell-secondary')) || 54;
        return primary + secondary;
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

    function collectCinematicScenes() {
        return [...root.document.querySelectorAll('[data-cinematic-scene]')]
            .map((stage) => {
                const content = [...stage.querySelectorAll('[data-cinematic-content]')];
                return content.length ? { stage, content } : null;
            })
            .filter(Boolean);
    }

    function collectHeroDepth() {
        const stage = root.document.querySelector('[data-hero-depth-stage]');
        if (!stage) return null;

        const frame = stage.querySelector('[data-hero-depth-frame]');
        const content = stage.querySelector('[data-hero-depth-content]');
        const brief = stage.querySelector('[data-hero-depth-brief]');
        return frame && content && brief ? { stage, frame, content, brief } : null;
    }

    function clearHeroDepth() {
        const stage = state.heroDepth?.stage;
        if (!stage) return;
        for (const property of [
            '--hero-depth-scale',
            '--hero-depth-y',
            '--hero-depth-opacity',
            '--hero-depth-brief-y',
        ]) {
            stage.style.removeProperty(property);
        }
        stage.removeAttribute('data-motion-progress');
    }

    function clearCinematicScenes() {
        for (const { stage } of state.cinematicScenes) {
            for (const property of [
                '--scene-scale',
                '--scene-y',
                '--scene-opacity',
                '--scene-blur',
            ]) {
                stage.style.removeProperty(property);
            }
            stage.removeAttribute('data-scene-progress');
        }
        root.document.body.style.removeProperty('--home-vignette-opacity');
    }

    function clearMotion() {
        root.document.body.classList.remove('home-motion-enhanced');
        clearHeroDepth();
        clearCinematicScenes();
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
        const sceneTop = readSceneTop();
        const shadeCandidates = [];

        if (state.heroDepth) {
            const { stage } = state.heroDepth;
            const rect = stage.getBoundingClientRect();
            const progress = progressForStage(rect.top, rect.height, root.innerHeight, 0);
            const depth = heroDepthForProgress(progress);
            stage.style.setProperty('--hero-depth-scale', String(depth.scale));
            stage.style.setProperty('--hero-depth-y', `${depth.translateY}px`);
            stage.style.setProperty('--hero-depth-opacity', String(depth.opacity));
            stage.style.setProperty('--hero-depth-brief-y', `${depth.briefY}px`);
            stage.dataset.motionProgress = progress.toFixed(3);
            if (rect.bottom > sceneTop && rect.top < root.innerHeight) {
                shadeCandidates.push({ distance: Math.abs(progress - 0.65), shade: depth.shade });
            }
        }

        state.cinematicScenes.forEach(({ stage }) => {
            const rect = stage.getBoundingClientRect();
            const progress = sceneProgressForRect(rect.top, rect.height, root.innerHeight, sceneTop);
            const scene = sceneFrameForProgress(progress);
            stage.style.setProperty('--scene-scale', String(scene.scale));
            stage.style.setProperty('--scene-y', `${scene.translateY}px`);
            stage.style.setProperty('--scene-opacity', String(scene.opacity));
            stage.style.setProperty('--scene-blur', `${scene.blur}px`);
            stage.dataset.sceneProgress = progress.toFixed(3);
            if (rect.bottom > sceneTop && rect.top < root.innerHeight) {
                shadeCandidates.push({ distance: Math.abs(progress - 0.5), shade: scene.shade });
            }
        });

        shadeCandidates.sort((left, right) => left.distance - right.distance);
        root.document.body.style.setProperty(
            '--home-vignette-opacity',
            String(shadeCandidates[0]?.shade || 0)
        );

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
        state.heroDepth = collectHeroDepth();
        state.cinematicScenes = collectCinematicScenes();
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
        heroDepthForProgress,
        progressForStage,
        refresh,
        sceneFrameForProgress,
        sceneProgressForRect,
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
