/* =====================================================================
   components.js — Shared chrome injected on every page
   ---------------------------------------------------------------------
   Injects: sticky HEADER + desktop NAV (with dropdowns), MOBILE menu,
   FOOTER, THEME PILL, and the empty MODAL MOUNT (forms.js fills it).
   Each page only needs:
       <header id="site-header"></header>
       <footer id="site-footer"></footer>
   plus the script includes (theme.js, components.js, forms.js, pets.js,
   reveal.js). Defining the chrome ONCE here guarantees consistency.

   Active nav link is marked from <body data-page="..."> (or filename).
   Modal triggers: any element with [data-open-modal="adopt|foster|contact"].
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Single source of truth for nav structure ---- */
  var NAV = [
    { label: "Home", href: "index.html", page: "home" },
    { label: "Adopt", page: "adopt", children: [
      { label: "Adoptable Dogs", href: "adopt.html#adoptable" },
      { label: "How to Adopt",   href: "adopt.html#how-to-adopt" },
      { label: "Adoption Application", action: "adopt" }
    ]},
    { label: "Foster", page: "foster", children: [
      { label: "Why Foster",        href: "foster.html" },
      { label: "Foster Application", action: "foster" },
      { label: "Foster Agreement",  href: "foster.html#foster-agreement" }
    ]},
    { label: "Get Involved", page: "involved", children: [
      { label: "Ways to Help", href: "get-involved.html" },
      { label: "Events",       href: "get-involved.html#events" },
      { label: "Donate",       href: "https://venmo.com/TNRNYC", external: true }
    ]},
    { label: "About",     href: "about.html",     page: "about" },
    { label: "Resources", href: "resources.html", page: "resources" },
    { label: "Contact",   href: "contact.html",   page: "contact" }
  ];

  var VENMO = "https://venmo.com/TNRNYC";
  var FB    = "https://www.facebook.com/TrueNorthRescue/";
  var IG     = "https://www.instagram.com/truenorthrescuemission/";
  var PETFINDER = "https://www.petfinder.com/search/pets-for-adoption/us/?shelterRescue=be7ec94f-f354-492a-a3b1-d8183e158b6b";

  var currentPage = document.body.getAttribute("data-page") || "home";

  /* ---- helpers ---- */
  function navItemHtml(item) {
    var active = item.page === currentPage;
    if (!item.children) {
      return '<li class="nav__item">' +
        '<a class="nav__link" href="' + item.href + '"' +
        (active ? ' aria-current="page"' : '') + '>' + item.label + '</a></li>';
    }
    var sub = item.children.map(function (c) {
      if (c.action) return '<li><a href="#" data-open-modal="' + c.action + '">' + c.label + '</a></li>';
      return '<li><a href="' + c.href + '">' + c.label + '</a></li>';
    }).join("");
    return '<li class="nav__item nav__item--has-menu">' +
      '<a class="nav__link" href="#" aria-haspopup="true" aria-expanded="false"' +
      (active ? ' aria-current="page"' : '') + '>' + item.label +
      ' <span class="nav__caret" aria-hidden="true">▾</span></a>' +
      '<ul class="nav__menu" role="menu">' + sub + '</ul></li>';
  }

  function mobileItemHtml(item) {
    if (!item.children) {
      return '<div class="m-group"><a class="m-link" href="' + item.href + '">' + item.label + '</a></div>';
    }
    var sub = item.children.map(function (c) {
      if (c.action) return '<a href="#" data-open-modal="' + c.action + '">' + c.label + '</a>';
      return '<a href="' + c.href + '">' + c.label + '</a>';
    }).join("");
    return '<div class="m-group">' +
      '<button class="m-group__btn" aria-expanded="false">' + item.label +
      ' <span class="nav__caret" aria-hidden="true">▾</span></button>' +
      '<div class="m-group__panel">' + sub + '</div></div>';
  }

  /* ---- HEADER + NAV ---- */
  function buildHeader() {
    var mount = document.getElementById("site-header");
    if (!mount) return;
    mount.className = "site-header";
    mount.innerHTML =
      '<div class="container site-header__inner">' +
        '<a class="brand" href="index.html">' +
          '<img src="assets/img/logo.webp" alt="True North Rescue Mission logo" width="44" height="44">' +
          '<span>True North Rescue</span>' +
        '</a>' +
        '<nav class="nav" aria-label="Primary">' +
          '<ul class="nav__list">' + NAV.map(navItemHtml).join("") + '</ul>' +
        '</nav>' +
        '<div style="display:flex;align-items:center;gap:.75rem">' +
          '<a class="btn btn--primary header-cta" href="' + VENMO + '" target="_blank" rel="noopener">Donate</a>' +
          '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>';

    // Mobile menu (appended to body so it overlays everything)
    var mm = document.createElement("div");
    mm.innerHTML =
      '<div class="mobile-menu__overlay" data-mm-close></div>' +
      '<aside class="mobile-menu" id="mobile-menu" aria-label="Mobile" aria-hidden="true">' +
        '<button class="mobile-menu__close" data-mm-close aria-label="Close menu">&times;</button>' +
        NAV.map(mobileItemHtml).join("") +
        '<a class="btn btn--primary btn--block" href="' + VENMO + '" target="_blank" rel="noopener">Donate via Venmo</a>' +
      '</aside>';
    document.body.appendChild(mm);

    wireNav();
  }

  function wireNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("mobile-menu");
    var overlay = document.querySelector(".mobile-menu__overlay");

    function openMenu() {
      menu.classList.add("is-open"); overlay.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true"); menu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      menu.classList.remove("is-open"); overlay.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false"); menu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    toggle.addEventListener("click", function () {
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    document.querySelectorAll("[data-mm-close]").forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
    });
    // close after navigating
    menu.querySelectorAll("a[href]").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    // collapsible groups in mobile menu
    menu.querySelectorAll(".m-group__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        btn.nextElementSibling.classList.toggle("is-open", !open);
      });
    });

    // desktop dropdowns: keyboard support (hover handled by CSS)
    document.querySelectorAll(".nav__item--has-menu > .nav__link").forEach(function (link) {
      link.addEventListener("click", function (e) { e.preventDefault(); });
      link.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          var first = link.parentElement.querySelector(".nav__menu a");
          if (first) first.focus();
        }
      });
    });
  }

  /* ---- FOOTER ---- */
  function buildFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.className = "site-footer";
    var year = new Date().getFullYear();
    mount.innerHTML =
      '<div class="container">' +
        '<div class="footer__grid footer">' +
          '<div>' +
            '<div class="footer__brand"><img src="assets/img/logo.webp" alt="" width="40" height="40"><span>True North Rescue</span></div>' +
            '<p style="margin-top:.75rem;max-width:34ch">A fully volunteer-run, 100% foster-based dog rescue based in New York City. For the love of rescue.</p>' +
            '<div class="footer__socials">' +
              '<a href="' + FB + '" target="_blank" rel="noopener" aria-label="Facebook">f</a>' +
              '<a href="' + IG + '" target="_blank" rel="noopener" aria-label="Instagram">◎</a>' +
            '</div>' +
          '</div>' +
          '<div><h4>Adopt</h4><ul>' +
            '<li><a href="adopt.html#adoptable">Adoptable Dogs</a></li>' +
            '<li><a href="adopt.html#how-to-adopt">How to Adopt</a></li>' +
            '<li><a href="#" data-open-modal="adopt">Adoption Application</a></li>' +
            '<li><a href="' + PETFINDER + '" target="_blank" rel="noopener">Petfinder ↗</a></li>' +
          '</ul></div>' +
          '<div><h4>Foster</h4><ul>' +
            '<li><a href="foster.html">Why Foster</a></li>' +
            '<li><a href="#" data-open-modal="foster">Foster Application</a></li>' +
            '<li><a href="foster.html#foster-agreement">Foster Agreement</a></li>' +
            '<li><a href="get-involved.html">Volunteer</a></li>' +
          '</ul></div>' +
          '<div><h4>Connect</h4><ul>' +
            '<li><a href="about.html">About Us</a></li>' +
            '<li><a href="get-involved.html#events">Events</a></li>' +
            '<li><a href="#" data-open-modal="contact">Contact</a></li>' +
            '<li><a href="' + VENMO + '" target="_blank" rel="noopener">Donate ↗</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<p>&copy; ' + year + ' True North Rescue Mission · 501(c)(3) pending · New York, NY · ' +
          '<a href="mailto:TrueNorthRescue@gmail.com">TrueNorthRescue@gmail.com</a></p>' +
        '</div>' +
      '</div>';
  }

  /* ---- THEME PILL ---- */
  function buildThemePill() {
    var pill = document.createElement("div");
    pill.className = "theme-pill";
    pill.setAttribute("role", "group");
    pill.setAttribute("aria-label", "Choose a color theme");
    pill.innerHTML =
      '<span class="theme-pill__label" aria-hidden="true">🎨 Theme</span>' +
      '<div class="theme-pill__btns">' +
        '<button type="button" class="theme-btn" data-theme="warm"  aria-pressed="false">Warm</button>' +
        '<button type="button" class="theme-btn" data-theme="clean" aria-pressed="false">Clean</button>' +
        '<button type="button" class="theme-btn" data-theme="bold"  aria-pressed="false">Bold</button>' +
      '</div>';
    document.body.appendChild(pill);
    if (window.TNRTheme) window.TNRTheme.initPill();
  }

  /* ---- smooth anchor scrolling for in-page links ---- */
  function wireSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---- init ---- */
  function init() {
    buildHeader();
    buildFooter();
    buildThemePill();
    wireSmoothAnchors();
    // forms.js exposes TNRForms.mount() to inject modals; pets/reveal self-init.
    if (window.TNRForms && window.TNRForms.mount) window.TNRForms.mount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // expose constants for other modules / pages
  window.TNR = { NAV: NAV, VENMO: VENMO, FB: FB, IG: IG, PETFINDER: PETFINDER };
})();
