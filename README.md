# era.food website

This is the static website for era. in Gibraltar. The current design came from the July 2026 Webflow export and has been adapted to match the live opening menu and location details.

## Main pages

- `index.html` — homepage
- `menu.html` — opening menu and prices
- `about.html` — brand story
- `visit.html` — address, hours and directions
- `corporate.html` — office catering and corporate lunch delivery (the landing page for "corporate catering", "office catering" and "office lunch delivery" searches)
- `healthy-office-lunch.html` — the healthy office lunch guide (the landing page for "healthy", "high-protein", "vegan" and "vegetarian" lunch searches); linked from the homepage teaser, the corporate page, the menu page and every footer
- `lunch-club.html` — ERA Lunch Club, the weekly lunch service for individuals (register, choose weekday lunches, pay per week; £2.95 delivery per lunch day or free collection). The indexable landing page for the `noindex` app at `lunch.era.food`; the register, log-in and office-member links point there. Linked from the "join lunch club" pill beside "order now" in every page header (on this page it goes straight to registration), the homepage Lunch Club band, the main nav, the mobile menu, every footer, the corporate teaser, the corporate page and the menu page. The homepage gives the hook and the four key facts; the full detail and the register button live on this page
- `loyalty.html` — unpublished future page (`noindex`)
- `css/site.css` — hand-written fixes and responsive styling layered over the Webflow export
- `js/site.js` — accessibility and safe external-link behaviour
- `control/` — public legal, service-status and disconnection pages for the
  owner-only Control accounting connection (live QuickBooks access remains disabled)

## Do not change the QR routes

The folders `menuqr/` and `t1/` through `t7/` contain the live QR redirects. They must stay byte-for-byte unchanged. The verification script stores their approved fingerprints and will fail if any protected file changes.

Run this after every site update:

```sh
node scripts/verify-site.mjs
```

The check also catches missing local links, invalid structured data, duplicate IDs, placeholder links, missing page landmarks and heading problems.

## Updating the template

Make ordinary visual overrides in `css/site.css`; avoid editing the generated Webflow styles unless a new export requires it. When the menu changes, update both the visible prices in `menu.html` and its Menu JSON-LD. Keep `robots.txt`, `sitemap.xml`, canonical URLs and social preview details aligned with any page changes.

## SEO conventions

- Every indexable page has one `<title>` of 70 characters or fewer and one meta description of 50–175 characters; `scripts/verify-site.mjs` enforces both, plus a matching canonical and `og:url`, and fails if an indexable page is missing from `sitemap.xml` or a `noindex` page appears in it.
- `index.html` holds the `Restaurant` and `WebSite` structured data (address, `GX11 1AA` postcode, geo coordinates, hours, social profiles). Other pages reference `https://era.food/#restaurant` by `@id` rather than repeating it.
- FAQ JSON-LD must mirror the visible `<details>` questions word for word; the verify script checks every question text appears on the page.
- Diet claims live in three places that must stay in step when the menu changes: the visible menu, the Menu JSON-LD `suitableForDiet` marks on `menu.html`, and the vegetarian / vegan / high-protein copy on `healthy-office-lunch.html` and `corporate.html`.
- Bump the `css/site.css?v=` query string on every page whenever `site.css` changes.

Visible ordering calls-to-action point directly to SumUp's `order-type` page. The protected `menuqr/` and table QR routes remain separate and must not be changed as part of ordinary site updates.
