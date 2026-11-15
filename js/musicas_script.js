(function () {
  'use strict';
  var root = document.documentElement;

  /* Tema claro/escuro (lembra a escolha quando possível) */
  var themeBtn = document.querySelector('.theme-toggle');
  try {
    var saved = localStorage.getItem('tema');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}

  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('tema', next); } catch (e) {}
  });

  /* Menu mobile */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* Filtro de notícias (só existe na página de notícias) */
  var chips = document.querySelectorAll('.chip');
  if (chips.length) {
    var cards = document.querySelectorAll('[data-category]');
    var empty = document.querySelector('.empty');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        var shown = 0;
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        cards.forEach(function (card) {
          var ok = f === 'todas' || card.getAttribute('data-category') === f;
          card.hidden = !ok;
          if (ok) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* Toca só uma faixa por vez */
  var players = document.querySelectorAll('audio');
  players.forEach(function (a) {
    a.addEventListener('play', function () {
      players.forEach(function (o) { if (o !== a) o.pause(); });
    });
  });

  /* Ano no rodapé */
  document.getElementById('ano').textContent = new Date().getFullYear();
})();
