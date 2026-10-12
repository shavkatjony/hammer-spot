# SHAVKATJON: personal site of Shavkatjon Yuldashev

A static portfolio for an early-career data scientist. It has an editorial, tactile "desert archive" design, a progressive-enhancement three.js hero, and case studies built only from verifiable project evidence.

- **Stack:** Astro 7 (static output), three.js (lazy, hero only), self-hosted fonts (Instrument Serif, IBM Plex Sans, IBM Plex Mono). No backend, no analytics, no cookies.
- **Content source of truth:** [`src/content/site.ts`](src/content/site.ts). Every claim on the site comes from there and is traceable in [`docs/CONTENT_INVENTORY.md`](docs/CONTENT_INVENTORY.md).
- **Reports:** [Security review](docs/SECURITY.md) · [Testing record](docs/TESTING.md) · [Content inventory](docs/CONTENT_INVENTORY.md)

## Local development

Requires Node ≥ 22.12.

```bash
npm ci                 # install exact locked versions
npm run dev            # http://localhost:4321 (hot reload; the CSP is not applied in dev)
npm run build          # production build into dist/
npm run preview        # serve dist/ at http://127.0.0.1:4321 (CSP active)
npm run check          # TypeScript + Astro diagnostics
```

Useful query flags on any page:

| Flag | Effect |
|---|---|
| `?static` | Skip the 3D scene and show the static SVG desert |
| `?3d=force` | Allow the 3D scene on software GL (used for headless screenshots) |

### Verification scripts

These run against `npm run preview`, so keep it running in another terminal. Browser checks use Playwright's Chromium (`npx playwright install chromium` if it isn't installed).

```bash
npm run verify         # static checks + axe WCAG 2.2 AA + console + theme/menu/reduced-motion/no-JS/keyboard
npm run screenshots -- ./shots   # hero at desktop/mobile, 3D and static
node scripts/fullpage.mjs ./shots "" dark   # full-page captures (path, theme)
npm run assets         # regenerate public/Shavkatjon-Yuldashev-CV.pdf and public/og.jpg from the built pages
```

Run `npm run assets` and rebuild after changing content, so the PDF résumé and share image stay in sync.

## Editing content

Everything personal lives in `src/content/site.ts`:

- `identity`: name, statement, location, availability (`availability.open`), and `portrait` (null until you add one).
- `social`: the only place external profile URLs are defined.
- `projects`: the four featured projects and their case studies (8 sections each). Text can contain `` `code` `` in backticks; it's rendered as `<code>`, never as HTML.
- `archive`, `notes`, `toolkit`, `education`, `experience`, `languages`.

Rules the content follows:

1. No metric goes in unless it appears in a committed report, notebook output or README.
2. Entries with `confirm: true` are self-reported or unresolved. Check them before each deploy.
3. External URLs go through `safeHref()`; only `https:`, `http:` and `mailto:` are accepted, and the build fails otherwise.

**Adding a portrait:** put an optimised image (e.g. `public/images/portrait.webp`, about 600×750, under 80 KB) in place and set `identity.portrait = { src: 'images/portrait.webp', alt: 'Portrait of Shavkatjon Yuldashev', width: 600, height: 750 }`. It appears in the hero field card.

## Project structure

```
src/
  content/site.ts        all personal facts, links, projects, notes, toolkit
  layouts/Base.astro     <head>, theme bootstrap, JSON-LD, nav, footer
  components/            Hero, DuneFallback (static SVG scene), ProjectFeature, sections, Nav, Footer…
  components/figures/    charts and diagrams drawn from verified project data
  pages/                 index, work/[slug] (case studies), resume, 404, sitemap.xml, robots.txt
  scripts/site.ts        theme toggle, nav, reveals, sun rail, guarded lazy-load of the 3D scene
  scripts/hero-scene.ts  the three.js desert diorama
  styles/                design tokens + global styles and the motion system
public/                  images (WebP), textures (SVG), favicon, CV PDF, og.jpg
scripts/                 verification, screenshots, asset generation, contour generator
deploy/_headers          optional HTTP headers for Cloudflare Pages / Netlify
```

## Design system (summary)

- **Colour:** warm mineral neutrals defined as tokens in `src/styles/tokens.css`. Every text token passes WCAG AA (≥ 4.5:1) on every surface it's used on. Dark mode is a separate, deliberately chosen palette. There are no gradients, no glass effects and no blue identity.
- **Type:** Instrument Serif for display, IBM Plex Sans for body, IBM Plex Mono for metadata. Email addresses use mono, because the display serif's "1" reads as "l".
- **Motion tokens:** 160 ms feedback, 560 ms reveals, 1100 ms cinematic. Clip-path and mask reveals, drawn rules, staggered metadata only. `prefers-reduced-motion` disables all of it, and the 3D scene renders a single still frame.
- **3D:** procedural wind-shaped dunes, a weathered monolith, low raking light with shadows, and sparse dust (capable desktops only). The scene renders on demand, pauses off-screen or when the tab is hidden, adapts quality to the device, skips software GPUs, and falls back to the static SVG scene on any failure.
- **Charts:** colour-blind-safe palettes validated in both themes, with direct labels, a data-table alternative and keyboard-readable values.

## Deployment (GitHub Pages)

The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) type-checks, builds and audits every push and PR, and deploys pushes to `main`. Actions are pinned to commit SHAs.

**Important:** this repository (`shavkatjony/personalweb`) is currently **private**. GitHub Pages only publishes private repos on paid plans. Choose one of these:

1. **Recommended: a user site at `https://shavkatjony.github.io/`.** Create a **public** repo named `shavkatjony.github.io` and push this code to it (or rename this repo to that name and make it public). Your CV drafts already list `shavkatjony.github.io` as your portfolio URL, so this keeps them correct.
2. **Project site at `https://shavkatjony.github.io/personalweb/`.** Make this repo public. The workflow picks up the `/personalweb/` base path automatically.
3. Keep the repo private and use a paid GitHub plan.

Then, in the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions** and push to `main`. HTTPS is automatic for `*.github.io` (tick **Enforce HTTPS** if it's shown).

If the final URL isn't `https://shavkatjony.github.io/`, rebuild the résumé PDF with the right URL: `SITE_URL=https://… SITE_BASE=/… npm run build && npm run preview` (with the same env vars), then `npm run assets`, rebuild and commit.

**Other hosts:** `dist/` is plain static files. On Cloudflare Pages or Netlify, copy `deploy/_headers` into `public/` to add real HTTP security headers that GitHub Pages can't set (see [docs/SECURITY.md](docs/SECURITY.md)).
