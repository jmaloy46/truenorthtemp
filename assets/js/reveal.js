/* =====================================================================
   reveal.js — Scroll-reveal + animated stat counters
   ---------------------------------------------------------------------
   - Adds .is-revealed to [data-reveal] elements as they enter the
     viewport (IntersectionObserver). CSS handles the fade/slide.
   - Counts up [data-count] numbers when their stat scrolls into view.
   - Respects prefers-reduced-motion (reveals everything instantly,
     sets final numbers without animating).
   Exposes TNRReveal.observe() so dynamically-added nodes (e.g. dog
   cards from pets.js) can be picked up after injection.
   ===================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal ---------- */
  var revealObserver;
  if ("IntersectionObserver" in window && !reduce) {
    revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  }

  function observeReveals() {
    var nodes = document.querySelectorAll("[data-reveal]:not(.is-revealed)");
    if (!revealObserver) { nodes.forEach(function (n) { n.classList.add("is-revealed"); }); return; }
    nodes.forEach(function (n) { revealObserver.observe(n); });
  }

  /* ---------- counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600;
    if (reduce || isNaN(target)) { el.textContent = (target || 0).toLocaleString() + suffix; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) { counters.forEach(animateCount); return; }
    var co = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  function init() { observeReveals(); initCounters(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.TNRReveal = { observe: observeReveals };
})();
