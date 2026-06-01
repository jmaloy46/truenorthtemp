/* =====================================================================
   pets.js — Adoptable dogs grid (STUB) + Petfinder linkout
   ---------------------------------------------------------------------
   Renders sample dog cards into any element with id="dogs-grid".
   On the home page we limit to a few featured dogs via
   data-limit="N" on the mount element.

   >>> REAL PETFINDER INTEGRATION GOES HERE <<<
   To wire up the live Petfinder API later:
     1. Get an API key/secret at https://www.petfinder.com/developers/
        (org/shelter id: NY1520, UUID below).
     2. Fetch an OAuth token, then GET
        https://api.petfinder.com/v2/animals?organization=NY1520&type=dog&status=adoptable
     3. Map the response to the same card shape used by renderCard() and
        replace SAMPLE_DOGS below. Keep the markup/classes identical so
        styling + hover-lift continue to work.
     (Alternatively drop in Petfinder's official embeddable widget where
      the #dogs-grid mount lives on adopt.html / index.html.)
   ===================================================================== */
(function () {
  "use strict";

  var PETFINDER = "https://www.petfinder.com/search/pets-for-adoption/us/?shelterRescue=be7ec94f-f354-492a-a3b1-d8183e158b6b";

  // Sample dogs — replace with live Petfinder data later (see header note).
  var SAMPLE_DOGS = [
    { name: "Timtam", breed: "Lab Mix", age: "Young", size: "Medium", sex: "Female",
      blurb: "A sunny, tail-wagging girl who loves fetch and afternoon naps in the sun.", photo: "assets/img/dog-1.jpg", emoji: "🐶" },
    { name: "Wednesday", breed: "Hound Mix", age: "Adult", size: "Medium", sex: "Female",
      blurb: "Gentle, soulful, and ready to be your shadow. Great with other dogs.", photo: "assets/img/dog-2.webp", emoji: "🦴" },
    { name: "Biscuit", breed: "Terrier Mix", age: "Puppy", size: "Small", sex: "Male",
      blurb: "Pocket-sized goofball with a heart of gold. Crate-training in progress.", photo: "assets/img/dog-3.webp", emoji: "🐾" },
    { name: "Maple", breed: "Shepherd Mix", age: "Adult", size: "Large", sex: "Female",
      blurb: "Smart, loyal, and a quick learner. Would thrive with an active family.", photo: "assets/img/dog-4.webp", emoji: "🐕" },
    { name: "Cooper", breed: "Beagle Mix", age: "Young", size: "Medium", sex: "Male",
      blurb: "Curious nose, big ears, bigger personality. Loves sniffari walks.", photo: "assets/img/dog-5.webp", emoji: "🐶" },
    { name: "Luna", breed: "Husky Mix", age: "Adult", size: "Large", sex: "Female",
      blurb: "Striking eyes and a talkative spirit. Looking for an adventure buddy.", photo: "assets/img/dog-6.webp", emoji: "🐺" }
  ];

  function renderCard(d) {
    var media = d.photo
      ? '<img src="' + d.photo + '" alt="' + d.name + ', an adoptable ' + d.breed + '" loading="lazy">'
      : '<div class="dog-card__placeholder"><span aria-hidden="true">' + (d.emoji || "🐾") + "</span></div>";
    return '' +
      '<article class="card card--lift dog-card" data-reveal>' +
        '<div class="dog-card__media">' + media +
          '<span class="dog-card__badge">' + d.sex + " · " + d.age + "</span>" +
        "</div>" +
        '<div class="card__body">' +
          '<h3 class="card__title">' + d.name + "</h3>" +
          '<div class="dog-card__meta">' +
            '<span class="tag">' + d.breed + "</span>" +
            '<span class="tag">' + d.size + "</span>" +
          "</div>" +
          '<p class="card__text">' + d.blurb + "</p>" +
          '<a class="btn btn--ghost" href="#" data-open-modal="adopt" style="margin-top:1rem">Apply to adopt</a>' +
        "</div>" +
      "</article>";
  }

  function render() {
    var mount = document.getElementById("dogs-grid");
    if (!mount) return;
    var limit = parseInt(mount.getAttribute("data-limit"), 10);
    var list = isNaN(limit) ? SAMPLE_DOGS : SAMPLE_DOGS.slice(0, limit);
    mount.classList.add("dogs-grid");
    mount.innerHTML = list.map(renderCard).join("");
    // re-run reveal observer for the freshly-added cards
    if (window.TNRReveal && window.TNRReveal.observe) window.TNRReveal.observe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

  window.TNRPets = { render: render, dogs: SAMPLE_DOGS, petfinderUrl: PETFINDER };
})();
