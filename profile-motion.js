(function (root, factory) {
    const api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ProfileMotion = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
    'use strict';

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const lerp = (from, to, progress) => from + ((to - from) * progress);
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
    const easeInOutCubic = (value) => value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;

    function sceneState(value) {
        const progress = clamp(value);
        if (progress < 0.28) {
            const eased = easeOutCubic(progress / 0.28);
            return {
                scale: lerp(1.05, 1, eased),
                y: lerp(44, 0, eased),
                opacity: lerp(0.18, 1, eased),
            };
        }
        if (progress <= 0.68) return { scale: 1, y: 0, opacity: 1 };

        const eased = easeInOutCubic((progress - 0.68) / 0.32);
        return {
            scale: lerp(1, 0.94, eased),
            y: lerp(0, -52, eased),
            opacity: lerp(1, 0.18, eased),
        };
    }

    function knowledgeSceneState(value) {
        const progress = clamp(value);
        if (progress < 0.18) {
            const eased = easeOutCubic(progress / 0.18);
            return {
                scale: lerp(1.03, 1, eased),
                y: lerp(28, 0, eased),
                opacity: lerp(0.2, 1, eased),
            };
        }
        if (progress <= 0.9) return { scale: 1, y: 0, opacity: 1 };

        const eased = easeInOutCubic((progress - 0.9) / 0.1);
        return {
            scale: lerp(1, 0.96, eased),
            y: lerp(0, -36, eased),
            opacity: lerp(1, 0.2, eased),
        };
    }

    function knowledgeState(value) {
        const progress = clamp(value);
        if (progress <= 0.4) {
            const eased = easeOutCubic(progress / 0.4);
            const opacityProgress = easeOutCubic(clamp(progress / 0.2));
            return {
                railA: lerp(-1040, -60, eased),
                railB: lerp(980, 40, eased),
                railC: lerp(-780, -120, eased),
                scale: lerp(0.82, 1, eased),
                railOpacity: lerp(0.2, 1, opacityProgress),
                boardOpacity: 0,
                boardY: 48,
                phase: 'motion',
            };
        }
        if (progress <= 0.52) {
            return { railA: -60, railB: 40, railC: -120, scale: 1, railOpacity: 1, boardOpacity: 0, boardY: 48, phase: 'motion' };
        }
        if (progress <= 0.7) {
            const eased = easeInOutCubic((progress - 0.52) / 0.18);
            return {
                railA: lerp(-60, 180, eased),
                railB: lerp(40, -180, eased),
                railC: lerp(-120, 140, eased),
                scale: lerp(1, 1.05, eased),
                railOpacity: lerp(1, 0, eased),
                boardOpacity: lerp(0, 1, eased),
                boardY: lerp(48, 0, eased),
                phase: progress < 0.59 ? 'motion' : 'archive',
            };
        }
        return { railA: 180, railB: -180, railC: 140, scale: 1.05, railOpacity: 0, boardOpacity: 1, boardY: 0, phase: 'archive' };
    }

    function heroState(value) {
        const progress = clamp(value);
        if (progress <= 0.48) {
            return { scale: 1, y: 0, opacity: 1, supportX: 0, supportOpacity: 1 };
        }

        const eased = easeInOutCubic((progress - 0.48) / 0.52);
        return {
            scale: lerp(1, 0.9, eased),
            y: lerp(0, -80, eased),
            opacity: lerp(1, 0.08, eased),
            supportX: lerp(0, 60, eased),
            supportOpacity: lerp(1, 0, eased),
        };
    }

    function stageProgress(stage, viewportHeight) {
        const rect = stage.getBoundingClientRect();
        const range = Math.max(1, stage.offsetHeight - viewportHeight);
        return clamp(-rect.top / range);
    }

    function setNumber(element, name, value) {
        element.style.setProperty(name, String(Number(value.toFixed(4))));
    }

    function setLength(element, name, value) {
        element.style.setProperty(name, `${Number(value.toFixed(2))}px`);
    }

    function createRuntime() {
        const state = {
            frame: 0,
            hero: null,
            scenes: [],
            knowledge: null,
            knowledgeScene: null,
            desktop: root.matchMedia('(min-width: 1101px)'),
            reduced: root.matchMedia('(prefers-reduced-motion: reduce)'),
        };

        function collect() {
            state.hero = root.document.querySelector('[data-profile-stage="hero"]');
            state.scenes = [...root.document.querySelectorAll('[data-profile-scene]')];
            state.knowledge = root.document.querySelector('[data-knowledge-motion-stage]');
            state.knowledgeScene = state.knowledge?.closest('[data-profile-scene]') ?? null;
        }

        function reset() {
            root.document.body.classList.remove('profile-motion-enhanced');
            if (state.hero) {
                for (const name of ['--hero-scale', '--hero-y', '--hero-opacity', '--hero-support-x', '--hero-support-opacity']) {
                    state.hero.style.removeProperty(name);
                }
                state.hero.removeAttribute('data-motion-progress');
            }
            for (const scene of state.scenes) {
                for (const name of ['--scene-scale', '--scene-y', '--scene-opacity']) scene.style.removeProperty(name);
                scene.removeAttribute('data-motion-progress');
            }
            if (state.knowledge) {
                for (const name of ['--knowledge-rail-a-x', '--knowledge-rail-b-x', '--knowledge-rail-c-x', '--knowledge-scale', '--knowledge-rail-opacity', '--knowledge-board-opacity', '--knowledge-board-y']) {
                    state.knowledge.style.removeProperty(name);
                }
                state.knowledge.removeAttribute('data-knowledge-phase');
                state.knowledge.removeAttribute('data-knowledge-progress');
            }
        }

        function enabled() {
            return state.desktop.matches && !state.reduced.matches;
        }

        function render() {
            state.frame = 0;
            if (!enabled()) {
                reset();
                return;
            }

            root.document.body.classList.add('profile-motion-enhanced');
            const viewportHeight = root.innerHeight;

            if (state.hero) {
                const progress = stageProgress(state.hero, viewportHeight);
                const visual = heroState(progress);
                setNumber(state.hero, '--hero-scale', visual.scale);
                setLength(state.hero, '--hero-y', visual.y);
                setNumber(state.hero, '--hero-opacity', visual.opacity);
                setLength(state.hero, '--hero-support-x', visual.supportX);
                setNumber(state.hero, '--hero-support-opacity', visual.supportOpacity);
                state.hero.dataset.motionProgress = progress.toFixed(3);
            }

            for (const scene of state.scenes) {
                const progress = stageProgress(scene, viewportHeight);
                const visual = scene === state.knowledgeScene ? knowledgeSceneState(progress) : sceneState(progress);
                setNumber(scene, '--scene-scale', visual.scale);
                setLength(scene, '--scene-y', visual.y);
                setNumber(scene, '--scene-opacity', visual.opacity);
                scene.dataset.motionProgress = progress.toFixed(3);
            }

            if (state.knowledge && state.knowledgeScene) {
                const progress = stageProgress(state.knowledgeScene, viewportHeight);
                const visual = knowledgeState(progress);
                setLength(state.knowledge, '--knowledge-rail-a-x', visual.railA);
                setLength(state.knowledge, '--knowledge-rail-b-x', visual.railB);
                setLength(state.knowledge, '--knowledge-rail-c-x', visual.railC);
                setNumber(state.knowledge, '--knowledge-scale', visual.scale);
                setNumber(state.knowledge, '--knowledge-rail-opacity', visual.railOpacity);
                setNumber(state.knowledge, '--knowledge-board-opacity', visual.boardOpacity);
                setLength(state.knowledge, '--knowledge-board-y', visual.boardY);
                state.knowledge.dataset.knowledgePhase = visual.phase;
                state.knowledge.dataset.knowledgeProgress = progress.toFixed(3);
            }
        }

        function schedule() {
            if (state.frame) return;
            state.frame = root.requestAnimationFrame(render);
        }

        function start() {
            collect();
            render();
            root.addEventListener('scroll', schedule, { passive: true });
            root.addEventListener('resize', schedule, { passive: true });
            state.desktop.addEventListener('change', schedule);
            state.reduced.addEventListener('change', schedule);
        }

        return { start, render, reset };
    }

    if (root.document) {
        const runtime = createRuntime();
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', runtime.start, { once: true });
        else runtime.start();
    }

    return { clamp, heroState, knowledgeSceneState, knowledgeState, sceneState, stageProgress };
});
