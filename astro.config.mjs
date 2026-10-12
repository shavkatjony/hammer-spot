// @ts-check
import { defineConfig } from 'astro/config';

// Deployment target is configurable so the same source works for:
//   - a user site  (repo "shavkatjony.github.io")   -> SITE_BASE=/
//   - a project site (repo "personalweb")           -> SITE_BASE=/personalweb/
// The GitHub Pages workflow sets both from actions/configure-pages.
const site = process.env.SITE_URL || 'https://shavkatjony.github.io';
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    syntaxHighlight: false, // no code highlighting needed; Shiki's inline styles would conflict with the CSP
  },
  build: {
    format: 'directory',
    // Keep CSS in external files; small inline <style> blocks are hashed by the CSP below.
    inlineStylesheets: 'never',
  },
  security: {
    // Astro hashes every script and style it emits and writes a CSP <meta> per page.
    // GitHub Pages cannot set response headers, so this meta policy is the enforceable layer.
    // Note: frame-ancestors, report-uri and sandbox are ignored in <meta> by spec.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "worker-src 'none'",
        "manifest-src 'self'",
        "base-uri 'self'",
        "form-action 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
  vite: {
    build: {
      // Never inline JS/CSS assets as data: URIs; everything stays a hashed, same-origin file.
      assetsInlineLimit: 0,
      // three.js lives in one lazy chunk (~133 KB gzipped) loaded only after idle; that's expected.
      chunkSizeWarningLimit: 600,
    },
  },
});
