(function (root, factory) {
    const api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (!root || !root.document) return;

    const boot = () => api.enhanceCaseDetails(root.document);
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

    return {
        closeSiblingDetails,
        enhanceCaseDetails,
    };
}));
