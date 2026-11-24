/* ==========================================================
   Ondas de Cuidados — script.js
   1. Modo escuro/claro
   2. Scrollytelling da linha do tempo dos Pioneiros
   ========================================================== */
(function () {
  "use strict";

  /* 1. MODO ESCURO / CLARO ---------------------------------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme");
  var themeIcon = document.getElementById("theme-icon");
  var MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  var SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeIcon.innerHTML = theme === "dark" ? SUN : MOON;
    themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
  }

  var saved = null;
  try { saved = localStorage.getItem("tema"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("tema", next); } catch (e) {}
  });

  /* 2. SCROLLYTELLING: PIONEIROS ---------------------------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var panelBody = document.getElementById("panel-body");
  var elYear = document.getElementById("panel-year");
  var elName = document.getElementById("panel-name");
  var elPath = document.getElementById("panel-path");
  var elContrib = document.getElementById("panel-contrib");
  var elNow = document.getElementById("counter-now");
  var elTotal = document.getElementById("counter-total");
  var bar = document.getElementById("progress-bar");
  var dotsBox = document.getElementById("dots");
  var current = -1;
  var swapTimer = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  elTotal.textContent = pad(steps.length);

  // Pontos de navegação (clicáveis)
  var dots = steps.map(function (step, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Ir para o marco de " + step.dataset.year);
    b.addEventListener("click", function () {
      var reduzir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      step.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "center" });
    });
    li.appendChild(b);
    dotsBox.appendChild(li);
    return b;
  });

  function activate(index) {
    if (index === current) return;
    current = index;
    var d = steps[index].dataset;

    steps.forEach(function (s, i) { s.classList.toggle("active", i === index); });
    dots.forEach(function (b, i) {
      b.classList.toggle("on", i === index);
      b.setAttribute("aria-current", i === index ? "true" : "false");
    });
    elNow.textContent = pad(index + 1);
    bar.style.width = ((index + 1) / steps.length * 100) + "%";

    // Transição suave: esmaece, troca o texto e reaparece
    clearTimeout(swapTimer);
    panelBody.classList.add("swap");
    swapTimer = setTimeout(function () {
      elYear.textContent = d.year;
      elName.textContent = d.name;
      elPath.textContent = d.path;
      elContrib.textContent = d.contrib;
      panelBody.classList.remove("swap");
    }, 180);
  }

  if (steps.length) {
    // Estado inicial sem animação
    var first = steps[0].dataset;
    elYear.textContent = first.year;
    elName.textContent = first.name;
    elPath.textContent = first.path;
    elContrib.textContent = first.contrib;
    steps[0].classList.add("active");
    dots[0].classList.add("on");
    dots[0].setAttribute("aria-current", "true");
    bar.style.width = (1 / steps.length * 100) + "%";
    current = 0;

    if ("IntersectionObserver" in window) {
      // Faixa estreita no centro da tela: o passo que a cruza fica ativo
      var storyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activate(steps.indexOf(entry.target));
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      steps.forEach(function (s) { storyObserver.observe(s); });
    }

    // Acessibilidade: foco via teclado também ativa o marco
    steps.forEach(function (s, i) {
      s.addEventListener("focus", function () { activate(i); });
    });
  }
})();
