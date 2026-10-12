# Security & privacy review: 2026-10-12

Scope: this repository and its static build (`dist/`). The site has no backend, no forms, no accounts, no database, no analytics and no third-party scripts.

## What was checked, and the result

| Area | Result | How it was verified |
|---|---|---|
| Secrets in the repo | **None found** | Pattern scan for API keys, tokens, private keys, `.env` files and passwords. `.gitignore` excludes `.env*`. Nothing is read from environment variables at runtime; the only build-time env vars are the public `SITE_URL` and `SITE_BASE`. |
| Private personal data | **Excluded** | The phone number in the CV drafts is not in source, build or PDF (grep of `src/`, `public/`, `dist/`). The personal Instagram found in `archive2025` is not linked. Private Notion/Drive notes were not published. |
| Dependencies | **0 known vulnerabilities** | `npm audit`, all and production-only. Five runtime packages (astro, three, three @fontsource fonts). Exact versions pinned in `package.json` and locked in `package-lock.json`. New versions were chosen at least ~2 weeks old. CI runs `npm audit --audit-level=high`. |
| Content Security Policy | **Enforced via `<meta>`** | Astro's built-in CSP hashes every script and style. The policy has `default-src 'self'`, `script-src 'self'` plus SHA-256 hashes (no `unsafe-inline`, no `unsafe-eval`), `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-src 'none'`, `upgrade-insecure-requests`. Verified in a browser: an injected inline style was **refused** by the policy, and the site's own scripts ran without violations (`scripts/verify.mjs`). |
| Inline styles / script injection | **None** | No `style=""` attributes in any page (checked by `verify.mjs`). No `set:html` with content data. Content strings render as text, and `` `code` `` becomes `<code>` via a splitter, never HTML. The only `set:html` is the JSON-LD block built from static constants. |
| External links | **Safe** | All content URLs go through `safeHref()`, which allows only `https:`, `http:` and `mailto:` and fails the build otherwise. Every `target="_blank"` link has `rel="noopener noreferrer"` (checked by `verify.mjs`). `<meta name="referrer" content="strict-origin-when-cross-origin">`. |
| Third parties / tracking | **None** | Fonts, images and textures are self-hosted. No CDN, analytics, embeds or cookies. `localStorage` (theme choice) and `sessionStorage` (intro shown once) store no personal data and are wrapped in try/catch. |
| SVG assets | **Trusted** | All SVGs are generated or written in this repo (no third-party SVGs). |
| CI supply chain | **Hardened** | GitHub Actions pinned to full commit SHAs. `permissions: contents: read` by default; `pages: write` and `id-token: write` only on the deploy job. `persist-credentials: false` on checkout. |

## Limits of GitHub Pages (stated plainly)

GitHub Pages does **not** let a site set HTTP response headers. So, on GitHub Pages:

- **Clickjacking:** `frame-ancestors` and `X-Frame-Options` cannot be applied, and the spec ignores `frame-ancestors` inside a `<meta>` CSP. The site could be framed by another origin. Risk is low (there are no forms or authenticated actions), but it is not prevented.
- **`X-Content-Type-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`** can't be set either.
- **HSTS** is managed by GitHub for `*.github.io` (served over HTTPS with HSTS). On a custom domain, enable *Enforce HTTPS* in Pages settings.
- **CSP via `<meta>`** works for scripts, styles, images, fonts and connections, but it isn't applied to the response before the HTML is parsed. That is acceptable for a static site with no user input.

**Not verified here:** the live response headers. This environment's network policy blocks `*.github.io`, and the site isn't deployed yet. After the first deploy, run:

```bash
curl -sI https://shavkatjony.github.io/ | sed -n '1,30p'
```

Expect `HTTP/2 200`, `strict-transport-security`, and no `x-frame-options`, which is the limitation above.

**If you want full headers:** deploy `dist/` to Cloudflare Pages or Netlify and copy `deploy/_headers` into `public/`. That adds `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Permissions-Policy`, COOP and HSTS. Then verify with `curl -sI`.

## Privacy notes

- No contact form. Email is a plain `mailto:` link, so nothing is collected or stored by the site.
- The email address shown was already public on GitHub (your `data-science-portfolio` README and commit metadata).
- Your public footprint has an item that is a reputational risk rather than a security one: `command-center/pages/portfolio-professional.html` is publicly served and contains fabricated template metrics. See `docs/CONTENT_INVENTORY.md` §7.

## Re-running the checks

```bash
npm audit
npm run build && npm run preview     # preview runs in the background; then:
npm run verify
grep -rInE "api[_-]?key|secret|BEGIN .*PRIVATE|ghp_|github_pat_|AKIA" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist .
```
