# era.food website

This is the static website for era. in Gibraltar. The current design came from the July 2026 Webflow export and has been adapted to match the live opening menu and location details.

## Main pages

- `index.html` — homepage
- `menu.html` — opening menu and prices
- `about.html` — brand story
- `visit.html` — address, hours and directions
- `loyalty.html` — unpublished future page (`noindex`)
- `css/site.css` — hand-written fixes and responsive styling layered over the Webflow export
- `js/site.js` — accessibility and safe external-link behaviour

## Do not change the QR routes

The folders `menuqr/` and `t1/` through `t7/` contain the live QR redirects. They must stay byte-for-byte unchanged. The verification script stores their approved fingerprints and will fail if any protected file changes.

Run this after every site update:

```sh
node scripts/verify-site.mjs
```

The check also catches missing local links, invalid structured data, duplicate IDs, placeholder links, missing page landmarks and heading problems.

## Updating the template

Make ordinary visual overrides in `css/site.css`; avoid editing the generated Webflow styles unless a new export requires it. When the menu changes, update both the visible prices in `menu.html` and its Menu JSON-LD. Keep `robots.txt`, `sitemap.xml`, canonical URLs and social preview details aligned with any page changes.

The public menu should always point to `menuqr/` for current availability and allergen information.
