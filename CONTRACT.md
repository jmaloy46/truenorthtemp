# True North Rescue Mission — Build Contract

This document is **prescriptive**. Every additional page MUST follow it so the
site stays consistent with `index.html` (the canonical reference). No build
step, no frameworks, no npm. Plain HTML/CSS/vanilla JS for GitHub Pages.

---

## 1. Page skeleton (copy this exactly)

Copy the `<head>`, the two mount points, and the `<script>` block from
`index.html` verbatim. Only `<title>`, `<meta name="description">`,
`data-page`, and the contents of `<main>` change.

```html
<!DOCTYPE html>
<html lang="en" data-theme="warm">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAGE TITLE — True North Rescue Mission</title>
  <meta name="description" content="UNIQUE PER-PAGE DESCRIPTION">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/styles.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="PAGE_KEY">
  <header id="site-header"></header>
  <main id="main">
    <!-- PAGE CONTENT -->
  </main>
  <footer id="site-footer"></footer>
  <script src="assets/js/forms.js"></script>
  <script src="assets/js/components.js"></script>
  <script src="assets/js/pets.js"></script>
  <script src="assets/js/reveal.js"></script>
</body>
</html>
```

- `data-theme="warm"` is hardcoded but `theme.js` immediately overrides it from
  `localStorage` before paint — never change it per page.
- **Script order matters:** `theme.js` in `<head>`; then at end of body
  `forms.js` → `components.js` → `pets.js` → `reveal.js`. `components.js`
  injects the chrome and calls `TNRForms.mount()`.
- `pets.js` is harmless on pages without `#dogs-grid` (it no-ops). Include it
  on every page anyway for uniformity.

### `data-page` values (drive the active nav link)
`home` · `adopt` (Adopt group) · `foster` (Foster group) · `involved`
(Get Involved group) · `about` · `resources` · `contact`.

### Page filenames the nav links to
`index.html`, `adoptable-dogs.html`, `adopt.html`, `foster.html`,
`foster-agreement.html`, `volunteer.html`, `events.html`, `donate.html`,
`about.html`, `resources.html`, `contact.html`. Create these names exactly.

---

## 2. Design tokens (CSS custom properties)

Defined in `styles.css` on `:root` (shared) and overridden per
`[data-theme="warm|clean|bold"]`. **Never hardcode a color, radius, shadow,
font, or spacing value — always use a token.**

| Token | Meaning |
|---|---|
| `--bg`, `--bg-alt`, `--surface` | page bg, alt-section bg, card/raised surface |
| `--text`, `--text-muted` | body text, secondary text |
| `--primary`, `--primary-600`, `--primary-contrast` | brand action color + hover + text-on-primary |
| `--accent`, `--accent-contrast` | secondary accent + text-on-accent |
| `--border` | hairline borders |
| `--focus` | focus ring color |
| `--hero-grad` | brand gradient (hero/stat/grad bands) |
| `--hero-overlay` | dark overlay over hero images |
| `--paw-color` | faint paw-print motif color |
| `--radius-sm`, `--radius`, `--radius-lg`, `--radius-pill` | corner radii |
| `--shadow-sm`, `--shadow`, `--shadow-lg` | elevation |
| `--font-head`, `--font-body`, `--head-weight` | type stacks |
| `--space-1 … --space-9` | spacing scale (0.25rem → 6rem) |
| `--fs-xs … --fs-3xl`, `--fs-hero` | font-size scale |
| `--container` (1200px), `--content` (760px) | widths |
| `--header-h` | sticky header height |
| `--transition` | standard easing/duration |
| `--motion-scale` | 1 normally, 0.4 clean, 0 under reduced-motion (multiply motion offsets by this) |

Switching `[data-theme]` restyles the entire site with no layout change.

---

## 3. Reusable CSS classes

**Layout:** `.container`, `.section`, `.section--alt`, `.section__head`,
`.grid` + `.grid--3` / `.grid--4`, `.split`, `.stack`, `.text-center`,
`.visually-hidden`.

**Type:** `.eyebrow` (uppercase kicker), `.lead` (large intro paragraph).

**Buttons:** `.btn` plus a variant — `.btn--primary`, `.btn--accent`,
`.btn--ghost`, `.btn--grad`; sizes `.btn--lg`, `.btn--block`.

**Cards:** `.card`, `.card--lift` (hover-lift), `.card__body`, `.card__title`,
`.card__text`. Step cards add `.step` + `.step__num`. Dog cards (rendered by
`pets.js`): `.dog-card`, `.dog-card__media`, `.dog-card__badge`,
`.dog-card__meta`, `.dog-card__placeholder`, `.tag`.

**Bands (full-width color blocks):** `.band`, `.band--accent`, `.band--grad`,
`.band__inner` (+ `.band__inner--split`), `.band__cta`.

**Hero:** `.hero`, `.hero__bg`, `.hero__inner`, `.hero__ctas`. Interior pages
use `.page-hero` (centered title block on `--bg-alt`).

**Stats:** `.stats`, `.stats__grid`, `.stat__num`, `.stat__label`.

**Give grid:** `.give-grid`, `.give__icon`. **Instagram:** `.ig-strip`,
`.ig-tile`. **Split media:** `.split__media`.

Do not invent one-off color classes. For tiny tweaks inline `style=""` using a
token (e.g. `style="margin-top:1rem"`) is acceptable, matching `index.html`.

---

## 4. JavaScript hooks (do NOT hand-write chrome, modals, or dog cards)

- **Header / nav / footer / theme pill** are injected by `components.js`. Pages
  provide only `<header id="site-header"></header>` and
  `<footer id="site-footer"></footer>`. To change nav, edit the `NAV` array in
  `components.js` — never duplicate markup in a page.
- **Open a form modal:** add `data-open-modal="adopt|foster|contact"` to any
  button or link. Three modals exist site-wide; do not write `<form>` markup.
  Example: `<button class="btn btn--primary" data-open-modal="foster">Apply to Foster</button>`.
- **Adoptable dogs grid:** add `<div id="dogs-grid" data-limit="N"></div>`
  (omit `data-limit` to show all). `pets.js` renders the cards.
- **Petfinder link** (use this exact URL):
  `https://www.petfinder.com/search/pets-for-adoption/us/?shelterRescue=be7ec94f-f354-492a-a3b1-d8183e158b6b`
- **Scroll reveal:** add `data-reveal` (or `data-reveal="left"` / `"right"`) to
  any element to fade/slide it in. `reveal.js` handles it.
- **Animated counters:** `<span data-count="2000" data-suffix="+">0</span>`
  inside a `.stat__num`. Counts up when scrolled into view.
- **Smooth anchors:** any `<a href="#id">` scrolls smoothly automatically.

### Constants exposed at runtime
`window.TNR = { NAV, VENMO, FB, IG, PETFINDER }`.
`window.TNRForms.open("adopt"|"foster"|"contact")`,
`window.TNRTheme`, `window.TNRReveal.observe()`, `window.TNRPets`.

---

## 5. `<main>` content template

```html
<main id="main">
  <!-- Interior pages: page hero -->
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Section kicker</p>
      <h1>Page Title</h1>
      <p>Optional one-line subhead.</p>
    </div>
  </section>

  <!-- Repeatable content section -->
  <section class="section">           <!-- add .section--alt to alternate bg -->
    <div class="container">
      <div class="section__head" data-reveal>
        <p class="eyebrow">Kicker</p>
        <h2>Section heading</h2>
        <p>Supporting sentence.</p>
      </div>
      <div class="grid grid--3">
        <article class="card card--lift" data-reveal>
          <div class="card__body">
            <h3 class="card__title">Card title</h3>
            <p class="card__text">Card body.</p>
          </div>
        </article>
        <!-- … -->
      </div>
    </div>
  </section>

  <!-- Color CTA band -->
  <section class="band band--accent">
    <div class="container">
      <div class="band__inner">
        <h2>Call to action</h2>
        <p>Why.</p>
        <div class="band__cta">
          <button class="btn btn--primary" data-open-modal="adopt">Apply to Adopt</button>
        </div>
      </div>
    </div>
  </section>
</main>
```

**Rules of thumb**
- Alternate `.section` / `.section--alt` for visual rhythm.
- Wrap every section's body in `.container`.
- Add `data-reveal` to headings, cards, media, and CTAs (not to `.container`).
- One `<h1>` per page (in the hero). Sections use `<h2>`, cards `<h3>`.
- Always provide meaningful `alt` text (empty `alt=""` only for decorative images).
- Mobile-first; rely on existing responsive breakpoints (600 / 900 / 1100px).

---

## 6. Organization facts & links (use for real copy)

- **Name:** True North Rescue Mission (TNR). NYC, volunteer-run, 100%
  foster-based, **no physical shelter**. 501(c)(3) pending.
- **Mission:** "to save dogs in need by bringing them to New York where they can be placed into loving homes."
- **History:** rescuing since 2017; incorporated as TNR in 2021.
- **Partners:** Texas, North Carolina, Puerto Rico, and Slaughterhouse
  Survivors (Harbin, China) — the only East Coast partner, from the meat trade.
- **Emails:** general `TrueNorthRescue@gmail.com` · fosters
  `Fosters.TrueNorthRescue@gmail.com` · adoptions
  `Adopt.TrueNorthRescue@gmail.com` · partnerships/events
  `Anthony.truenorthrescue@gmail.com`.
- **Social:** Facebook `https://www.facebook.com/TrueNorthRescue/` · Instagram
  `https://www.instagram.com/truenorthrescuemission/` (@truenorthrescuemission).
- **Donate (Venmo):** `https://venmo.com/TNRNYC` (@TNRNYC).
- **Forms** submit via FormSubmit.co → `jack.maloy46@gmail.com` (one-time
  activation needed on first real submit — see comment in `forms.js`).
