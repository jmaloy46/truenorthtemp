/* =====================================================================
   forms.js — Multi-step modal form engine
   ---------------------------------------------------------------------
   Builds three modals from declarative specs: Adoption, Foster, Contact.
   Features:
     - multi-step with progress bar + step indicator, Next/Back
     - inline validation; cannot advance past required-but-empty fields
     - AUTOSAVE every field to localStorage (key per form) as user types;
       restores draft on reopen; clears on successful submit
     - "Draft saved" indicator
     - SUBMIT via fetch JSON to FormSubmit.co -> jack.maloy46@gmail.com,
       with a friendly thank-you step + error/retry handling
     - accessible: role="dialog", focus trap, ESC closes, returns focus

   <!-- NOTE: FormSubmit.co requires a ONE-TIME ACTIVATION. The first real
        submission to https://formsubmit.co/ajax/jack.maloy46@gmail.com
        triggers a confirmation email to that address; click the link once
        and all future submissions go through automatically. -->

   Triggers: any element with [data-open-modal="adopt|foster|contact"].
   ===================================================================== */
(function () {
  "use strict";

  var ENDPOINT = "https://formsubmit.co/ajax/jack.maloy46@gmail.com";

  /* ---------- field factory helpers (spec -> field def) ---------- */
  function t(label, opts) { return Object.assign({ label: label, type: "text" }, opts); }
  function ta(label, opts) { return Object.assign({ label: label, type: "textarea" }, opts); }
  function em(label, opts) { return Object.assign({ label: label, type: "email" }, opts); }
  function tel(label, opts) { return Object.assign({ label: label, type: "tel" }, opts); }
  function sel(label, options, opts) { return Object.assign({ label: label, type: "select", options: options }, opts); }
  function radio(label, options, opts) { return Object.assign({ label: label, type: "radio", options: options }, opts); }
  function check(label, options, opts) { return Object.assign({ label: label, type: "checkbox", options: options }, opts); }
  var R = ["Yes", "No"];

  /* ---------- FORM SPECS ---------- */
  var FORMS = {
    adopt: {
      key: "tnr-adopt-draft",
      title: "Adoption Application",
      subtitle: "Tell us about you and your ideal dog. Detailed answers help us make the right match.",
      subject: "New Adoption Application - TNR",
      steps: [
        { title: "About You", fields: [
          t("Name", { required: true }),
          em("Email", { required: true }),
          t("Address", { required: true }),
          tel("Phone", { required: true }),
          t("Dog(s) of Interest", { help: "Leave blank if you don't have one in mind yet." }),
          t("Occupation / Work Schedule"),
          t("Employer Name & Address")
        ]},
        { title: "Your Home", fields: [
          ta("Household Members (including yourself)"),
          sel("Household Type", ["House", "Apartment", "Condo", "Other"]),
          radio("Does your home have an outdoor space?", R),
          radio("Does your home have a pool?", R),
          radio("Do you rent or own?", ["Rent", "Own"]),
          ta("If you rent, what is the pet policy?"),
          ta("If you listed restrictions, please elaborate"),
          t("Renters: Landlord Name & Contact"),
          ta("Do you currently own pets?"),
          radio("Have you ever intentionally bred a dog?", R),
          radio("Does anyone in your household have animal allergies?", R),
          radio("Have you ever trained a dog?", R),
          t("Veterinarian Name and Phone Number")
        ]},
        { title: "Your New Dog", fields: [
          sel("Ideal Energy Level", ["Low", "Medium", "High"]),
          sel("Ideal Adult Weight", ["<25 lb", "25-50 lb", "50-75 lb", "75 lb+"]),
          t("My Ideal Dog is"),
          check("It's important my dog gets along with", ["Children", "Cats", "Other dogs", "Strangers", "None"]),
          t("Who will be responsible for the care of the dog?"),
          ta("Primary reason for adopting"),
          t("Where will the dog sleep?"),
          t("How many hours a day will the dog be alone?"),
          check("Will you utilize any of the following?", ["Dog walker", "Daycare", "Crate", "Trainer", "None"]),
          t("Where will the dog be when left unsupervised?"),
          radio("Do you plan to allow your dog outside unsupervised?", R),
          ta("How do you plan to handle exercise needs?"),
          t("How often do you travel?"),
          ta("If your dog has accidents, what would you do?"),
          ta("If your dog shows separation anxiety, what would you do?")
        ]},
        { title: "References", fields: [
          t("Reference #1 (name / relationship / phone)"),
          t("Reference #2 (name / relationship / phone)"),
          t("Reference #3 (name / relationship / phone)")
        ]}
      ]
    },

    foster: {
      key: "tnr-foster-draft",
      title: "Foster Application",
      subtitle: "Fosters are the heart of True North. Tell us about you and your home.",
      subject: "New Foster Application - TNR",
      steps: [
        { title: "Your Info", fields: [
          t("Full Name", { required: true }),
          em("Email", { required: true }),
          tel("Phone", { required: true }),
          ta("Address", { required: true }),
          t("Age", { required: true }),
          ta("Occupation & Work Schedule", { required: true })
        ]},
        { title: "Household & Home", fields: [
          ta("Household Members (Name, Age, and Occupation)"),
          radio("Will anyone else be responsible for the care of your foster dog?", R, { required: true }),
          radio("Do you currently have pets?", R, { required: true }),
          ta("Pet Name, Age, Species, Gender, Are they Spay/Neutered?"),
          check("My home has:", ["A fenced yard", "An unfenced yard", "No yard", "A balcony/patio", "Stairs", "Other pets", "Young children"])
        ]},
        { title: "Your New Foster", fields: [
          check("I am comfortable with a foster who is:", ["A puppy", "An adult dog", "A senior dog", "A large breed", "A small breed", "Shy or fearful", "High energy", "Medically needy"]),
          check("I feel equipped to support a foster who:", ["Needs house training", "Needs behavioral work", "Needs medical care", "Needs socialization", "Is recovering from surgery"]),
          sel("How long will your foster dog be alone per day?", ["Less than 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "More than 8 hours"], { required: true }),
          ta("What is your daily care plan for your foster dog?", { required: true }),
          sel("How long will you be able to provide a foster home for a dog?", ["1-2 weeks", "2-4 weeks", "1-2 months", "Until adopted", "Open to long-term"], { required: true })
        ]},
        { title: "Experience & More", fields: [
          radio("Have you fostered before?", R, { required: true }),
          t("How did you hear about True North?"),
          ta("Is there any additional information you would like us to know?")
        ]}
      ]
    },

    contact: {
      key: "tnr-contact-draft",
      title: "Contact Us",
      subtitle: "Have a question? Send us a message and we'll be in touch.",
      subject: "New Contact Message - TNR",
      steps: [
        { title: "Your Message", fields: [
          t("Name", { required: true }),
          em("Email", { required: true }),
          t("Subject", { required: true }),
          ta("Message", { required: true })
        ]}
      ]
    }
  };

  /* ---------- utilities ---------- */
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function fieldHtml(f, formId, stepIdx) {
    var name = slug(f.label);
    var reqMark = f.required ? ' <span class="req" aria-hidden="true">*</span>' : "";
    var id = formId + "_" + stepIdx + "_" + name;
    var req = f.required ? ' data-required="true"' : "";
    var help = f.help ? '<p class="field__error" style="display:block;color:var(--text-muted)">' + esc(f.help) + "</p>" : "";
    var inner;

    if (f.type === "textarea") {
      inner = '<textarea class="textarea" id="' + id + '" name="' + esc(f.label) + '"' + req + '></textarea>';
    } else if (f.type === "select") {
      var opts = '<option value="">Select…</option>' + f.options.map(function (o) {
        return '<option value="' + esc(o) + '">' + esc(o) + "</option>";
      }).join("");
      inner = '<select class="select" id="' + id + '" name="' + esc(f.label) + '"' + req + ">" + opts + "</select>";
    } else if (f.type === "radio" || f.type === "checkbox") {
      var choices = f.options.map(function (o, i) {
        var cid = id + "_" + i;
        var inputName = f.type === "radio" ? esc(f.label) : esc(f.label) + "[]";
        return '<label class="choice"><input type="' + f.type + '" id="' + cid + '" name="' + inputName + '" value="' + esc(o) + '"' + (i === 0 ? req : "") + ">" + esc(o) + "</label>";
      }).join("");
      return '<fieldset class="field" data-field role="group">' +
        '<legend class="field__legend">' + esc(f.label) + reqMark + "</legend>" +
        '<div class="choices">' + choices + "</div>" + help +
        '<p class="field__error">Please make a selection.</p></fieldset>';
    } else {
      inner = '<input class="input" type="' + f.type + '" id="' + id + '" name="' + esc(f.label) + '"' + req +
        (f.type === "email" ? ' autocomplete="email"' : "") + ">";
    }
    return '<div class="field" data-field>' +
      '<label for="' + id + '">' + esc(f.label) + reqMark + "</label>" +
      inner + help +
      '<p class="field__error">This field is required.</p></div>';
  }

  function buildModalHtml(formId, spec) {
    var nSteps = spec.steps.length;
    var multi = nSteps > 1;
    var stepsHtml = spec.steps.map(function (st, i) {
      var fields = st.fields.map(function (f) { return fieldHtml(f, formId, i); }).join("");
      // group plain text/email/tel/select fields into a responsive 2-col grid where short
      return '<div class="form-step' + (i === 0 ? " is-active" : "") + '" data-step="' + i + '">' +
        "<h3>" + esc(st.title) + "</h3>" + fields + "</div>";
    }).join("");

    var indicators = spec.steps.map(function (st, i) {
      return '<span class="progress__step' + (i === 0 ? " is-active" : "") + '" data-ind="' + i + '">' +
        (i + 1) + ". " + esc(st.title) + "</span>";
    }).join("");

    var progress = multi ?
      '<div class="progress">' +
        '<div class="progress__bar"><div class="progress__fill"></div></div>' +
        '<div class="progress__steps">' + indicators + "</div>" +
      "</div>" : "";

    return '<div class="modal-overlay" data-modal="' + formId + '" role="presentation">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + formId + '_title" tabindex="-1">' +
        '<div class="modal__header">' +
          '<div><h2 class="modal__title" id="' + formId + '_title">' + esc(spec.title) + "</h2>" +
          '<p class="modal__subtitle">' + esc(spec.subtitle) + "</p></div>" +
          '<button class="modal__close" data-modal-close aria-label="Close dialog">&times;</button>' +
        "</div>" +
        progress +
        '<form class="modal__body" novalidate data-form="' + formId + '">' + stepsHtml +
          // result step (hidden until submit)
          '<div class="form-step" data-step="result">' +
            '<div class="form-result" data-result></div>' +
          "</div>" +
        "</form>" +
        '<div class="modal__footer">' +
          '<span class="draft-indicator" data-draft>Draft saved</span>' +
          '<div style="display:flex;gap:.75rem">' +
            '<button class="btn btn--ghost" type="button" data-back hidden>Back</button>' +
            '<button class="btn btn--primary" type="button" data-next>' + (multi ? "Next" : "Submit") + "</button>" +
          "</div>" +
        "</div>" +
      "</div></div>";
  }

  /* ---------- modal controller ---------- */
  function initModal(formId, spec) {
    var overlay = document.querySelector('[data-modal="' + formId + '"]');
    var dialog = overlay.querySelector(".modal");
    var form = overlay.querySelector("form");
    var fill = overlay.querySelector(".progress__fill");
    var inds = overlay.querySelectorAll("[data-ind]");
    var backBtn = overlay.querySelector("[data-back]");
    var nextBtn = overlay.querySelector("[data-next]");
    var draftEl = overlay.querySelector("[data-draft]");
    var steps = form.querySelectorAll(".form-step:not([data-step='result'])");
    var resultStep = form.querySelector('[data-step="result"]');
    var resultBox = form.querySelector("[data-result]");
    var nSteps = steps.length;
    var cur = 0;
    var lastFocus = null;
    var draftTimer = null;

    function showStep(i) {
      cur = i;
      steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
      resultStep.classList.remove("is-active");
      if (fill) fill.style.width = ((i) / (nSteps - 1 || 1) * 100) + "%";
      inds.forEach(function (el, idx) { el.classList.toggle("is-active", idx <= i); });
      backBtn.hidden = i === 0;
      nextBtn.textContent = i === nSteps - 1 ? "Submit" : "Next";
      nextBtn.hidden = false;
      // focus first field of step
      var f = steps[i].querySelector("input,select,textarea");
      if (f) f.focus();
    }

    function validateStep(i) {
      var ok = true;
      steps[i].querySelectorAll("[data-field]").forEach(function (field) {
        var req = field.querySelectorAll("[data-required]");
        if (!req.length) return;
        var control = req[0];
        var valid;
        if (control.type === "radio" || control.type === "checkbox") {
          var grp = field.querySelectorAll('input[type="' + control.type + '"]');
          valid = Array.prototype.some.call(grp, function (g) { return g.checked; });
        } else {
          valid = control.value.trim() !== "" &&
            (control.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value));
        }
        field.classList.toggle("field--invalid", !valid);
        if (!valid) ok = false;
      });
      return ok;
    }

    /* ----- autosave / restore ----- */
    function saveDraft() {
      var data = {};
      form.querySelectorAll("input,select,textarea").forEach(function (el) {
        if (el.type === "checkbox" || el.type === "radio") {
          if (el.checked) { (data[el.name] = data[el.name] || []).push(el.value); }
        } else if (el.value) {
          data[el.name] = el.value;
        }
      });
      try { localStorage.setItem(spec.key, JSON.stringify(data)); } catch (e) {}
      draftEl.classList.add("is-visible");
      clearTimeout(draftTimer);
      draftTimer = setTimeout(function () { draftEl.classList.remove("is-visible"); }, 1800);
    }
    function restoreDraft() {
      var raw;
      try { raw = localStorage.getItem(spec.key); } catch (e) {}
      if (!raw) return;
      var data;
      try { data = JSON.parse(raw); } catch (e) { return; }
      Object.keys(data).forEach(function (name) {
        var els = form.querySelectorAll('[name="' + CSS.escape(name) + '"]');
        var val = data[name];
        els.forEach(function (el) {
          if (el.type === "checkbox" || el.type === "radio") {
            el.checked = Array.isArray(val) ? val.indexOf(el.value) !== -1 : val === el.value;
          } else {
            el.value = Array.isArray(val) ? val[0] : val;
          }
        });
      });
    }
    function clearDraft() { try { localStorage.removeItem(spec.key); } catch (e) {} }

    form.addEventListener("input", saveDraft);
    form.addEventListener("change", saveDraft);

    /* ----- submit ----- */
    function buildPayload() {
      var payload = { _subject: spec.subject, _template: "table" };
      var fd = new FormData(form);
      // collate multi-value checkbox fields
      var multiVals = {};
      fd.forEach(function (v, k) {
        if (/\[\]$/.test(k)) {
          var key = k.replace(/\[\]$/, "");
          (multiVals[key] = multiVals[key] || []).push(v);
        } else if (v) {
          payload[k] = v;
        }
      });
      Object.keys(multiVals).forEach(function (k) { payload[k] = multiVals[k].join(", "); });
      return payload;
    }

    function showResult(type) {
      steps.forEach(function (s) { s.classList.remove("is-active"); });
      resultStep.classList.add("is-active");
      backBtn.hidden = true;
      if (fill) fill.style.width = "100%";
      if (type === "success") {
        nextBtn.hidden = true;
        resultBox.innerHTML =
          '<div class="form-result__icon">🐾</div>' +
          "<h3>Thank you!</h3>" +
          "<p>Your " + esc(spec.title.toLowerCase()) + " is on its way. Our volunteer team will be in touch soon. Keep an eye on your inbox!</p>" +
          '<button class="btn btn--primary" type="button" data-modal-close style="margin-top:1.25rem">Close</button>';
        overlay.querySelector("[data-result] [data-modal-close]").addEventListener("click", close);
      } else {
        nextBtn.hidden = false;
        nextBtn.textContent = "Try again";
        resultBox.innerHTML =
          '<div class="form-result__icon">⚠️</div>' +
          "<h3>Something went wrong</h3>" +
          "<p>We couldn't send your application just now. Please check your connection and try again, or email us directly at " +
          '<a href="mailto:TrueNorthRescue@gmail.com">TrueNorthRescue@gmail.com</a>.</p>';
      }
    }

    function submit() {
      nextBtn.disabled = true;
      nextBtn.textContent = "Sending…";
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(buildPayload())
      })
        .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
        .then(function () { clearDraft(); showResult("success"); })
        .catch(function () { showResult("error"); })
        .finally(function () { nextBtn.disabled = false; });
    }

    nextBtn.addEventListener("click", function () {
      if (resultStep.classList.contains("is-active")) { // retry
        resultStep.classList.remove("is-active");
        showStep(nSteps - 1);
        return;
      }
      if (!validateStep(cur)) {
        var firstBad = steps[cur].querySelector(".field--invalid input,.field--invalid select,.field--invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      if (cur < nSteps - 1) showStep(cur + 1);
      else submit();
    });
    backBtn.addEventListener("click", function () { if (cur > 0) showStep(cur - 1); });

    /* ----- open / close + focus trap ----- */
    function open() {
      lastFocus = document.activeElement;
      restoreDraft();
      // reset to step 0 unless result is showing
      resultStep.classList.remove("is-active");
      showStep(0);
      nextBtn.disabled = false;
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { dialog.focus(); }, 30);
      document.addEventListener("keydown", onKey);
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var focusables = dialog.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
      var visible = Array.prototype.filter.call(focusables, function (el) { return el.offsetParent !== null && !el.disabled && !el.hidden; });
      if (!visible.length) return;
      var first = visible[0], last = visible[visible.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
    overlay.querySelectorAll("[data-modal-close]").forEach(function (b) { b.addEventListener("click", close); });

    return { open: open, close: close };
  }

  /* ---------- mount all modals + wire triggers ---------- */
  var controllers = {};

  function mount() {
    if (document.querySelector("[data-modal]")) return; // already mounted
    var container = document.createElement("div");
    container.id = "tnr-modals";
    Object.keys(FORMS).forEach(function (id) {
      container.insertAdjacentHTML("beforeend", buildModalHtml(id, FORMS[id]));
    });
    document.body.appendChild(container);
    Object.keys(FORMS).forEach(function (id) { controllers[id] = initModal(id, FORMS[id]); });

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-open-modal]");
      if (!trigger) return;
      e.preventDefault();
      var id = trigger.getAttribute("data-open-modal");
      if (controllers[id]) controllers[id].open();
    });
  }

  window.TNRForms = { mount: mount, open: function (id) { if (controllers[id]) controllers[id].open(); } };
})();
