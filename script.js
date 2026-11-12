(function () {
    'use strict';

    // Marca JS como ativo — habilita as animações de "reveal" e o contador
    // definidos no CSS. Sem isso, o conteúdo permanece 100% visível mesmo se o
    // script falhar.
    var raiz = document.documentElement;
    raiz.classList.add('js');

    // Rodapé: ano atual
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---------- Lançamento ----------
    // 1º de dezembro de 2026, 00h de Brasília (UTC−3; o Brasil não tem mais
    // horário de verão). A partir daí a página troca sozinha: some o contador
    // e o Instagram, entra o link da Play Store (classe .lancado no <html>).
    // Para adiar, mude só esta data.
    var LANCAMENTO = Date.parse('2026-12-01T00:00:00-03:00');

    var campos = {
        dias: document.querySelector('[data-dias]'),
        horas: document.querySelector('[data-horas]'),
        minutos: document.querySelector('[data-minutos]'),
        rotDias: document.querySelector('[data-rot-dias]'),
        rotHoras: document.querySelector('[data-rot-horas]'),
        rotMinutos: document.querySelector('[data-rot-minutos]'),
        faltam: document.querySelector('[data-faltam]')
    };

    function doisDigitos(n) { return n < 10 ? '0' + n : String(n); }
    function escrever(el, texto) { if (el) el.textContent = texto; }

    var relogio = null;

    function atualizar() {
        var falta = LANCAMENTO - Date.now();
        if (falta <= 0) {
            raiz.classList.add('lancado');
            if (relogio) clearInterval(relogio);
            return;
        }

        // Arredonda para cima: com 30 s faltando ainda se lê "1 minuto",
        // e não "0" — o zero só aparece quando chegou.
        var minutos = Math.ceil(falta / 60000);
        var d = Math.floor(minutos / 1440);
        var h = Math.floor((minutos % 1440) / 60);
        var m = minutos % 60;

        escrever(campos.dias, String(d));
        escrever(campos.horas, doisDigitos(h));
        escrever(campos.minutos, doisDigitos(m));
        escrever(campos.rotDias, d === 1 ? 'dia' : 'dias');
        escrever(campos.rotHoras, h === 1 ? 'hora' : 'horas');
        escrever(campos.rotMinutos, m === 1 ? 'minuto' : 'minutos');

        if (campos.faltam) {
            campos.faltam.textContent = d >= 2
                ? 'Faltam ' + d + ' dias para o Lumi chegar ao Google Play.'
                : d === 1
                    ? 'Falta 1 dia para o Lumi chegar ao Google Play.'
                    : 'É hoje à meia-noite: o Lumi chega ao Google Play.';
        }
    }

    atualizar();
    if (!raiz.classList.contains('lancado')) relogio = setInterval(atualizar, 15000);

    // ---------- Vitrine: setas no computador ----------
    // No celular se desliza com o dedo; com mouse, rolar de lado é ruim, então
    // as setas aparecem quando há o que rolar.
    var trilho = document.querySelector('.vitrine__trilho');
    var ant = document.querySelector('.vitrine__seta--ant');
    var prox = document.querySelector('.vitrine__seta--prox');

    if (trilho && ant && prox) {
        var passo = function () {
            var item = trilho.querySelector('li');
            return item ? item.getBoundingClientRect().width + 16 : 280;
        };
        var setas = function () {
            var max = trilho.scrollWidth - trilho.clientWidth;
            var temRolagem = max > 4;
            ant.hidden = !temRolagem;
            prox.hidden = !temRolagem;
            ant.disabled = trilho.scrollLeft <= 4;
            prox.disabled = trilho.scrollLeft >= max - 4;
        };
        ant.addEventListener('click', function () { trilho.scrollBy({ left: -passo() * 2, behavior: 'smooth' }); });
        prox.addEventListener('click', function () { trilho.scrollBy({ left: passo() * 2, behavior: 'smooth' }); });
        trilho.addEventListener('scroll', setas, { passive: true });
        window.addEventListener('resize', setas);
        setas();
    }

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
