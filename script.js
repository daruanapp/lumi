(function () {
    'use strict';

    // Marca JS como ativo — habilita as animações de "reveal" definidas no CSS.
    // Sem isso, o conteúdo permanece 100% visível mesmo se o script falhar.
    document.documentElement.classList.add('js');

    // Rodapé: ano atual
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---------- Reveal on scroll ----------
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
})();
