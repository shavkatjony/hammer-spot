# Testing record

## Redesign run: 2026-11-12

Run against the production build (`npm run build` + `astro preview`) in a headless Linux container, with Playwright 1.56.1 driving the installed Chromium (`PW_CHROMIUM=/opt/pw-browsers/chromium`). The numbers are what the tools reported.

| Check | Result |
|---|---|
| Type check (`astro check`, 44 files) | 0 errors · 0 warnings · 0 hints |
| Build | Clean, 8 pages (home, 5 case studies, CV, 404) |
| `npm audit` (all / production) | 0 vulnerabilities / 0 vulnerabilities |
| `scripts/verify.mjs` at base `/` | **All checks passed** |
| `scripts/verify.mjs` at base `/personalweb/` | **All checks passed** |
| axe-core 4.13 (WCAG 2.0/2.1/2.2 A+AA + best practice), 8 routes × light + dark | **0 serious or critical violations** (after the fixes below) |
| Lighthouse 13.4.1, home, mobile preset | Performance **91** · Accessibility **100** · Best practices **100** · SEO **100** (FCP 2.3 s, LCP 3.2 s, TBT 0 ms, CLS 0) |
| Lighthouse 13.4.1, home, desktop preset | Performance **100** · Accessibility **100** · Best practices **100** · SEO **100** (FCP 0.5 s, LCP 0.7 s, CLS 0) |
| Lighthouse 13.4.1, DPEC case study, mobile | 96 · 100 · 100 · 100 |
| CV PDF | **1 A4 page**; text extracts cleanly (`pdftotext`); no phone number |
| Console errors (all routes, real CSP) | None |
| Horizontal overflow at 390 px | None |

Mobile LCP is the hero statement. Most of its delay is the first-visit intro choreography (shown once per session, never with reduced motion) and the 129 KB optical-size Newsreader font. Both were kept on purpose.

### Defects found in review and fixed

1. **The name rendered as "ShavkatjonYuldashev"**: Astro's HTML compression removed the space between the two name spans, for screen readers too. Explicit spaces were added there and between other adjacent labels.
2. The "in development" tag on the at-a-glance strip overlapped the DPEC title. It is now an outlined tag under the metric, also on mobile (it was hidden there).
3. The 3D horizon ran behind the buttons and social icons; on mobile the sun sat on the icons. The horizon is now measured from the call-to-action row, and the sun is placed by a ray through the screen: in the gap between the text and portrait on wide screens, on the right on tall ones.
4. The static (no-WebGL) desert had the same collision. It now follows the same measured horizon through `--horizon-y`.
5. A 1 px light seam at the bottom of the static dunes (anti-aliased fill edges). The fills now run past the drawing's edge.
6. The portrait caption sat on the dunes. It moved inside the portrait mat.
7. On mobile the role line floated far above the name. It now sits directly above it, beside the portrait.
8. **The printed CV showed `linkedin.com/in/shavkatjon-yuldashev`**, which is not the real profile. It now prints the full slug.
9. The CV crashed on a project with no public link (the private scanner), and later ran to 2 pages. Print sizes are now fixed in points, the contact block takes two lines, and Experience and Education sit side by side: 1 page.
10. Contrast: where a contour line of the band texture crossed small text, contrast fell to 3.0–4.4:1 on the Yale and Coffee bands and the Dust Grey notes. Small text on those surfaces now uses lighter (or, on Dust Grey, deeper) inks and the texture is fainter.
11. CV header links were below the 24 px target size (WCAG 2.5.8).
12. Texture URLs were absolute (`/textures/…`), so they would 404 under a sub-folder deploy. They are now fingerprinted Vite assets.
13. A retail metric wrapped mid-value ("8.8 → 2.6 / GB"). It now reads "2.6 GB, down from 8.8 GB".
14. The forced-3D test mode (`?3d=force`) was killed by the 250 ms first-frame budget on software GL, so the 3D hero couldn't be inspected. The budget still applies to real visitors; it is skipped only in that test mode.

### Follow-up: hero stack panel (2026-11-12)

The five-metric "At a glance" strip mixed unrelated numbers without context, so it was replaced with a "My stack" panel: six labelled groups of tools, models and the ML process, all taken from the projects. It fits inside the first 1440×900 screen (hero height 900 px), stacks to one column on mobile, and `verify.mjs` passes again (axe WCAG 2.2 AA, light and dark). The share image hides the panel, which the 630 px frame would cut.

### Not tested / gaps (this run)

- External links were not fetched (network policy). In particular the DPEC Render app, the Streamlit demo and LinkedIn could not be opened from here.
- 3D frame rate on a real GPU, Safari and Firefox, and screen readers were not tested here (same as below).
- No portrait was available, so the photo path (`src/assets/portrait.jpg` → AVIF/WebP) was checked by build only, not with a real photo.

## Earlier record: 2026-10-12


Everything below was run against the production build (`npm run build` + `astro preview`) in a headless Linux container with Playwright Chromium 1194. The numbers are what the tools reported. Gaps are listed at the end.

## Summary

| Check | Result |
|---|---|
| Type check (`astro check`, 42 files) | 0 errors · 0 warnings · 0 hints |
| Build | Clean, 7 pages, no warnings |
| `npm audit` (all / production) | 0 vulnerabilities / 0 vulnerabilities |
| `scripts/verify.mjs` at base `/` | **All checks passed** |
| `scripts/verify.mjs` at base `/personalweb/` | **All checks passed** |
| axe-core 4.13 (WCAG 2.0/2.1/2.2 A+AA + best practice), 7 routes × light + dark | **0 violations** (after fixes below) |
| Lighthouse 13.4.1, home, mobile preset | Performance **98** · Accessibility **100** · Best practices **100** · SEO **100** |
| Lighthouse 13.4.1, home, desktop preset | Performance **100** · Accessibility **100** · Best practices **100** · SEO **100** |
| Console errors (all routes, real CSP) | None |
| Horizontal overflow at 390 px | None (every route) |

Lighthouse metrics: mobile FCP 1.8 s, LCP 1.9 s, TBT 0 ms, CLS 0.007, Speed Index 1.8 s, 145 KiB transferred. Desktop FCP 0.4 s, LCP 0.4 s, TBT 0 ms, CLS 0.007, 174 KiB.

> **Caveat:** Lighthouse's headless Chrome renders WebGL in software (SwiftShader). The site deliberately skips the 3D scene on software renderers, so **these scores measure the static-hero path**. The 3D scene's frame rate on real GPUs was **not** measured here (no GPU in this environment). It loads lazily after `load` + idle, as a separate 133 KB gzipped chunk, so it can't affect FCP or LCP.

## What `scripts/verify.mjs` checks

Static, on every built page:

- CSP `<meta>` present, `script-src 'self'` + hashes, no `unsafe-inline` or `unsafe-eval`.
- `lang`, `<title>`, meta description, exactly one `<h1>`.
- No inline `style=""` attributes (they would be blocked by the CSP).
- Every `<img>` has `alt`, `width` and `height` (no layout shift).
- Every internal link and `#anchor` resolves to a real file and id, inside the base path.
- Every `target="_blank"` has `rel="noopener noreferrer"`. No `javascript:` URLs.

In the browser:

- axe-core WCAG 2.2 AA scan, light and dark, all routes including the 404.
- Real-CSP run: the site's scripts initialise with zero console errors.
- Theme toggle: `aria-pressed` updates and the choice persists across navigation.
- Mobile menu: opens, moves focus to the first link, closes on Escape, returns focus to the toggle.
- Reduced motion: no `motion` class and no element left hidden by a reveal.
- JavaScript disabled: content visible, static desert scene present, nothing hidden.
- Keyboard: the first Tab reaches the visible skip link, and later focus stops show an outline.

## Visual review

Screenshots were inspected at 1440×900 and 390×844 (2× DPR), light and dark, for the hero (3D via software GL, and static), the full home page, all four case studies, the résumé page and PDF, and the share image.

Defects found and fixed during review:

1. The monolith sat behind the hero statement. It was moved into the empty sky on the left, made smaller and more distant, and repositioned for portrait screens.
2. The static fallback's lee-face shadows read as ocean waves. They were replaced with layered dune silhouettes and hairline ridge lines.
3. An invisible, fully fogged "mesa" occluded the sun disc. The mesas were removed and the fog range extended.
4. The sun disc overlapped the roles line (in dark mode especially). It was lowered to a setting position on the horizon.
5. The field card covered the email icon at 1440×900. It now only shows on large, tall screens (≥ 80 rem wide, ≥ 50 rem high), anchored low.
6. **The email rendered as "04ll"** in Instrument Serif. All emails now use IBM Plex Mono.
7. "F1" and "Formula 1" read as "Fl" in the display serif. The display title is now "Formula One".
8. Literal backticks showed in diagram captions. Captions now go through the safe code renderer.
9. The 7th field note was orphaned in the grid. It now spans the row with a horizontal layout.
10. The nav was unreadable over the dark F1 case-study header (axe `color-contrast`). It now inverts until the bar turns solid.
11. Toolkit evidence links were too small to tap (axe `target-size`, WCAG 2.5.8). They now have a 28 px minimum height.
12. Lighthouse mobile performance was 57 (TBT 8.1 s) because 3D ran on software GL. Fixed by software-renderer detection, a still-frame mode for low-tier devices, a 250 ms first-frame budget with static fallback, and async shader compilation.
13. The résumé PDF ran to 2 pages. Print typography was tightened to 1 A4 page.
14. A duplicated `markdown` block had been injected into the Vite config by an over-broad edit. Removed (caught by `astro check`).

## Data accuracy checks

- Telco metrics match `reports/final_model_metrics.csv` and `reports/model_comparison.csv`. The confusion matrix is derived from them and reproduces accuracy 0.73314 exactly.
- `reports/threshold_analysis.csv` comes from a different (earlier) model. It's labelled as such on the site. See `CONTENT_INVENTORY.md` §7.3b.
- The Olist chart values (4.29 / 3.77 / 2.32 / 1.73 with order counts) are copied from the executed notebook output.
- Retail scale numbers come from `docs/architecture.md`. Findings are labelled synthetic.
- DPEC: 17 test functions counted in `tests/`. Only the ingestion layer is claimed.
- Car-price R² uses the notebook's 0.773 (test) and 0.749 (CV), **not** the README's 0.82.

## Not tested / remaining gaps

- **External links were not fetched.** This environment's network policy blocks `github.io`, `streamlit.app` and LinkedIn. All 38 external URLs are listed by `npm run verify`. GitHub repo URLs were verified via the GitHub API and git. **Open these yourself before launch:** the Streamlit demo (`shavkh.streamlit.app`, which may be asleep), the retail dashboard on GitHub Pages, and your LinkedIn URL.
- **Live HTTPS and response headers:** the site isn't deployed yet. See `SECURITY.md` for the `curl -sI` check to run after the first deploy.
- **Real-GPU 3D performance and memory:** not measurable here. Recommended: open the site on your 2019 MacBook Pro and a phone, and check DevTools → Performance (look for long tasks) and the FPS meter while moving the mouse over the hero.
- **Safari and Firefox:** only Chromium was automated. The code avoids Chromium-only features or gates them behind feature detection: view transitions are progressive, and `requestIdleCallback` has a fallback.
- **Screen readers:** structure was validated (landmarks, headings, labels, live region on the chart). No manual VoiceOver/NVDA pass was done.
- **Windows High Contrast:** a `forced-colors` stylesheet exists but wasn't visually tested.
