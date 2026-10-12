/**
 * Site verification. Run against a production build:
 *   npm run build && npm run preview   (background daemon in Astro 7)   then   npm run verify
 *
 * 1. Static checks on every page in dist/ (CSP, metadata, headings, images, links, inline styles).
 * 2. Browser checks via Playwright: console errors, axe-core WCAG 2.2 AA scan (light + dark),
 *    theme toggle persistence, mobile menu + Escape, reduced-motion and no-JS rendering.
 * Exits non-zero on any failure.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { chromium } from 'playwright';

const DIST = 'dist';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321/';
const BASE_PATH = new URL(BASE).pathname; // e.g. "/" or "/personalweb/"
const failures = [];
const warn = [];
const fail = (m) => failures.push(m);

/* ---------------- static checks ---------------- */
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(DIST);

const ids = new Map();
const htmlOf = new Map();
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  htmlOf.set(p, html);
  ids.set(p, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const external = new Set();
for (const p of pages) {
  const html = htmlOf.get(p);
  const rel = relative(DIST, p);
  const csp = html.match(/<meta http-equiv="content-security-policy" content="([^"]+)"/);
  if (!csp) fail(`${rel}: no CSP meta`);
  else {
    if (/unsafe-inline|unsafe-eval/.test(csp[1])) fail(`${rel}: CSP allows unsafe-inline/eval`);
    if (!/script-src 'self'/.test(csp[1])) fail(`${rel}: CSP script-src not restricted`);
  }
  if (!/<html lang="en"/.test(html)) fail(`${rel}: missing lang`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(`${rel}: missing title`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html) && !rel.startsWith('404')) fail(`${rel}: missing description`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(`${rel}: expected 1 <h1>, found ${h1}`);
  if (/\sstyle="/.test(html)) fail(`${rel}: inline style attribute (blocked by CSP)`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\salt="[^"]*"/.test(tag)) fail(`${rel}: <img> without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) fail(`${rel}: <img> without width/height (CLS)`);
  }
  for (const m of html.matchAll(/<a\b[^>]*>/g)) {
    const tag = m[0];
    const href = (tag.match(/href="([^"]*)"/) || [])[1];
    if (href === undefined) continue;
    if (/target="_blank"/.test(tag) && !/rel="noopener noreferrer"/.test(tag)) fail(`${rel}: target=_blank without rel: ${href}`);
    if (/^javascript:/i.test(href)) fail(`${rel}: javascript: URL`);
    if (/^https?:\/\//.test(href)) {
      external.add(href);
      continue;
    }
    if (href.startsWith('mailto:')) continue;
    // internal
    let [path, hash] = href.split('#');
    let target = p;
    if (path) {
      if (!path.startsWith(BASE_PATH)) {
        fail(`${rel}: internal link outside base path: ${href}`);
        continue;
      }
      const local = join(DIST, decodeURIComponent(path.slice(BASE_PATH.length)));
      target = existsSync(local) && statSync(local).isDirectory() ? join(local, 'index.html') : local;
      if (!existsSync(target)) {
        fail(`${rel}: broken internal link ${href}`);
        continue;
      }
    }
    if (hash && target.endsWith('.html') && !ids.get(target)?.has(hash)) fail(`${rel}: missing anchor #${hash} in ${relative(DIST, target)}`);
  }
}
console.log(`static: ${pages.length} pages checked, ${external.size} unique external links`);

/* ---------------- browser checks ---------------- */
const axeSource = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const routes = ['', 'work/telco-churn/', 'work/olist-delivery/', 'work/retail-intelligence/', 'work/f1-pace-intelligence/', 'resume/', 'does-not-exist/'];
const browser = await chromium.launch();

async function axe(page, label) {
  await page.evaluate(axeSource); // tooling-only injection; context uses bypassCSP
  const res = await page.evaluate(async () =>
    // @ts-ignore
    await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }),
  );
  for (const v of res.violations) {
    const msg = `${label}: axe ${v.impact} ${v.id} (${v.nodes.length}) ${v.help} :: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`;
    if (v.impact === 'serious' || v.impact === 'critical') fail(msg);
    else warn.push(msg);
  }
  return res.violations.length;
}

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce', bypassCSP: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  for (const r of routes) {
    const before = errors.length;
    const resp = await page.goto(BASE + r + '?static', { waitUntil: 'networkidle' });
    if (r === 'does-not-exist/') {
      // astro preview serves 404.html with status 404, like GitHub Pages; that 404 is expected
      if (resp.status() !== 404) warn.push(`404 route returned ${resp.status()}`);
      errors.splice(before, errors.length - before, ...errors.slice(before).filter((e) => !/status of 404/.test(e)));
    }
    await axe(page, `${theme} /${r}`);
  }
  if (errors.length) fail(`${theme}: console errors: ${errors.join(' | ')}`);
  await ctx.close();
}

// Real CSP (no bypass): the page must run its own scripts without violations
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  for (const r of routes.slice(0, 6)) await page.goto(BASE + r + '?static', { waitUntil: 'networkidle' });
  const ready = await page.evaluate(() => document.documentElement.classList.contains('reveal-ready'));
  if (!ready) fail('site script did not initialise under the real CSP');
  if (errors.length) fail(`CSP run: console errors: ${errors.join(' | ')}`);
  await ctx.close();
}

// Theme toggle persists across navigation
{
  const ctx = await browser.newContext({ colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(BASE + '?static');
  await page.click('[data-theme-toggle]');
  const pressed = await page.getAttribute('[data-theme-toggle]', 'aria-pressed');
  await page.goto(BASE + 'resume/');
  const theme = await page.getAttribute('html', 'data-theme');
  if (pressed !== 'true' || theme !== 'dark') fail(`theme toggle: aria-pressed=${pressed}, after navigation theme=${theme}`);
  await ctx.close();
}

// Mobile menu: opens, moves focus, closes on Escape and returns focus
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + '?static');
  await page.click('[data-menu-toggle]');
  const open = await page.getAttribute('[data-menu-toggle]', 'aria-expanded');
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  const visible = await page.isVisible('[data-menu] a');
  await page.keyboard.press('Escape');
  const closed = await page.getAttribute('[data-menu-toggle]', 'aria-expanded');
  const back = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle'));
  if (open !== 'true' || !visible || focused !== 'Work' || closed !== 'false' || !back)
    fail(`mobile menu: open=${open} visible=${visible} focus=${focused} closed=${closed} focusBack=${back}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) fail(`mobile: horizontal overflow ${overflow}px`);
  await ctx.close();
}

// Reduced motion: nothing hidden waiting for an animation
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE);
  const hasMotion = await page.evaluate(() => document.documentElement.classList.contains('motion'));
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0' || getComputedStyle(el).clipPath.includes('100%')).length,
  );
  if (hasMotion || hidden) fail(`reduced motion: motion class=${hasMotion}, hidden reveal elements=${hidden}`);
  await ctx.close();
}

// JavaScript disabled: content readable, no hidden reveal states, static desert present
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length,
  );
  const fallback = await page.isVisible('[data-hero-fallback] svg');
  const h1 = await page.isVisible('h1');
  if (hidden || !fallback || !h1) fail(`no-JS: hidden=${hidden} fallback=${fallback} h1=${h1}`);
  await ctx.close();
}

// Keyboard: first Tab reaches the skip link, and focus is visibly outlined
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + '?static');
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => ({
    cls: document.activeElement?.className,
    top: document.activeElement?.getBoundingClientRect().top,
  }));
  if (!String(skip.cls).includes('skip-link') || skip.top < 0) fail(`keyboard: first Tab focus ${JSON.stringify(skip)}`);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  if (outline === 'none') fail('keyboard: focused element has no visible outline');
  await ctx.close();
}

await browser.close();

console.log(`\nexternal links (not fetched here; see docs/TESTING.md):`);
for (const l of [...external].sort()) console.log('  ' + l);
if (warn.length) console.log(`\nwarnings (${warn.length}):\n  ` + warn.join('\n  '));
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):\n  ` + failures.join('\n  '));
  process.exit(1);
}
console.log('\nall checks passed');
