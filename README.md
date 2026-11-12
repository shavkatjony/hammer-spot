# Shavkatjon Yuldashev: professional portfolio

The recruiter-facing portfolio of a data scientist building production-grade ML systems. It has an editorial "desert archive" design in light and dark, a progressive-enhancement three.js hero, and five case studies built only from verifiable project evidence.

- **Stack:** Astro 7 (static output), three.js (lazy, hero only), self-hosted fonts (Newsreader, IBM Plex Sans, IBM Plex Mono). No backend, no analytics, no cookies.
- **Scope:** professional work only. Personal notes, study material (Korean/TOPIK, general Python/SQL learning), productivity notes, hobby collections and the command-center / learning-platform repositories stay out of this site.
- **Content source of truth:** [`src/content/site.ts`](src/content/site.ts). Every claim on the site comes from there and is traceable in [`docs/CONTENT_INVENTORY.md`](docs/CONTENT_INVENTORY.md).
- **Reports:** [Security review](docs/SECURITY.md) · [Testing record](docs/TESTING.md) · [Content inventory](docs/CONTENT_INVENTORY.md)

## Local development

Requires Node ≥ 22.12.

```bash
npm ci                 # install exact locked versions
npm run dev            # http://localhost:4321 (hot reload; the CSP is not applied in dev)
npm run build          # production build into dist/
npm run preview        # background preview of dist/ at http://127.0.0.1:4321 (CSP active); stop: npx astro preview stop
npm run check          # TypeScript + Astro diagnostics
```

Useful query flags on any page:

| Flag | Effect |
|---|---|
| `?static` | Skip the 3D scene and show the static SVG desert |
| `?3d=force` | Allow the 3D scene on software GL (used for headless screenshots) |

### Verification scripts

These run against the preview server (`npm run preview`, which runs in the background in Astro 7). Browser checks use Playwright's Chromium (`npx playwright install chromium` if it isn't installed). To use a Chromium that is already installed instead, point `PW_CHROMIUM` at its binary, e.g. `PW_CHROMIUM=/opt/pw-browsers/chromium npm run verify`.

```bash
npm run verify         # static checks + axe WCAG 2.2 AA + console + theme/menu/reduced-motion/no-JS/keyboard
npm run screenshots -- ./shots   # hero at desktop/mobile, 3D and static
node scripts/fullpage.mjs ./shots "" dark   # full-page captures (path, theme)
npm run assets         # regenerate public/Shavkatjon-Yuldashev-CV.pdf and public/og.jpg from the built pages
```

Run `npm run assets` and rebuild after changing content, so the PDF résumé and share image stay in sync.

## Editing content

Everything personal lives in `src/content/site.ts`:

- `identity`: name, positioning line, statement, location and availability (`availability.open`).
- `social`: the only place external profile URLs are defined.
- `projects`: four primary projects (Telco churn, Olist SQL, Retail BI, DPEC Formula 1, marked *In development*) and one secondary computer-vision project. Each case study has six sections (problem; objectives and questions; data and methodology; technical implementation; findings and verified results; limitations and lessons) plus the repository and demo links. Text can contain `` `code` `` in backticks; it's rendered as `<code>`, never as HTML.
- `archive` (smaller work, including Lotte World), `notes` (seven field notes), `toolkit` (demonstrated / learning / open source studied, each demonstrated tool linked to the projects that show it), `education`, `experience`, `languages`, `targetRoles`, `interests`.
- A private repository is shown with `repoPublic: false` and a `privateNote`; no code link is rendered for it.

Rules the content follows:

1. No metric goes in unless it appears in a committed report, notebook output or README.
2. Entries with `confirm: true` are self-reported or unresolved. Check them before each deploy.
3. External URLs go through `safeHref()`; only `https:`, `http:` and `mailto:` are accepted, and the build fails otherwise.

**Adding your portrait (one step):** save a photo as `src/assets/portrait.jpg` (`.jpeg`, `.png`, `.webp` and `.avif` also work) and rebuild. The hero picks it up automatically, generates AVIF and WebP at 320–960 px, and replaces the "SY" monogram. For a strong first impression use a 4:5 portrait, at least 1200 px tall, evenly lit, head and shoulders, looking at the camera or slightly towards the text (to the left). Then run `npm run assets` and rebuild so the share image shows it too.

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
src/assets/              portrait slot, contour and grain textures (fingerprinted by Vite, so any base path works)
public/                  images (WebP), favicon, CV PDF, og.jpg
scripts/                 verification, screenshots, asset generation, contour generator
deploy/_headers          optional HTTP headers for Cloudflare Pages / Netlify
```

## Design system (summary)

- **Colour:** every colour is a token in `src/styles/tokens.css`, each with a job. Pumice and Dust Grey are the paper; Hickory and Dark Coffee the ink and the deep band; Yale Blue the accent, links and buttons; Goldenrod the sun, the open-to-work chip and accents on dark; Vintage Brick Dust, Dusty Willow, Cool Steel and Chalk Blue tint the project sections (brick, willow, steel) and the secondary text; Violet Haze (`#6b5e78`, chosen here because no hex was given) gives the dark theme its depth. Light mode is warm archival paper in desert sunlight; dark mode is deep desert shadow with earth tones, violet and a controlled blue. Every text token passes WCAG AA (≥ 4.5:1) on every surface it's used on, including where a contour line of the band texture crosses small text.
- **Type:** Newsreader (optical-size variable, preloaded) for headlines, IBM Plex Sans for body, IBM Plex Mono for labels and metadata. No thin weights and no oversized decorative lettering; the name is set at a readable display size. Email addresses use mono, so "0411" can't be misread.
- **Motion tokens:** 160 ms feedback, 560 ms reveals, 1100 ms cinematic. Clip-path and mask reveals, drawn rules, staggered metadata only. `prefers-reduced-motion` disables all of it, and the 3D scene renders a single still frame.
- **3D:** procedural wind-shaped dunes, a low Goldenrod sun, raking light with shadows, and sparse dust (capable desktops only). The horizon is measured from the page, so the dunes always sit just under the call-to-action row and the sun in the gap between the text and the portrait; the static SVG desert uses the same measurement (`--horizon-y`). The scene renders on demand, pauses off-screen or when the tab is hidden, adapts quality to the device, skips software GPUs, and falls back to the static scene on any failure.
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
