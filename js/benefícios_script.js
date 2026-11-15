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

  /* Ano no rodapé */
  document.getElementById('ano').textContent = new Date().getFullYear();
})();
