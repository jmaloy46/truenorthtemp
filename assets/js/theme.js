/* =====================================================================
   theme.js — Theme load / save / switch
   ---------------------------------------------------------------------
   Three themes ("warm" default, "clean", "bold") driven by a single
   token system in styles.css scoped by [data-theme] on <html>.
   Persists choice to localStorage key "tnr-theme".
   The applyTheme() runs immediately (before paint) to avoid a flash;
   the theme pill itself is injected by components.js, which calls
   TNRTheme.initPill() after injection.
   ===================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "tnr-theme";
  var THEMES = ["warm", "clean", "bold"];
  var DEFAULT = "warm";

  function getSaved() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return THEMES.indexOf(v) !== -1 ? v : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) theme = DEFAULT;
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    // reflect active state on any pill buttons currently in the DOM
    var btns = document.querySelectorAll(".theme-btn");
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.theme === theme));
    });
  }

  // Apply ASAP so there is no flash of the wrong theme.
  applyTheme(getSaved());

  // Wire up the pill buttons (called by components.js once pill is injected).
  function initPill() {
    var pill = document.querySelector(".theme-pill");
    if (!pill) return;
    pill.addEventListener("click", function (e) {
      var btn = e.target.closest(".theme-btn");
      if (!btn) return;
      applyTheme(btn.dataset.theme);
    });
    applyTheme(getSaved()); // sync aria-pressed after injection
  }

  window.TNRTheme = {
    apply: applyTheme,
    get: getSaved,
    initPill: initPill,
    THEMES: THEMES
  };
})();
