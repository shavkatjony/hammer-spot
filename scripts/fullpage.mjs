// Full-page screenshots for visual review: node scripts/fullpage.mjs <outdir> [path] [theme]
import { chromium } from 'playwright';
const [out, path = '', theme = 'light'] = process.argv.slice(2);
const base = process.env.BASE_URL || 'http://127.0.0.1:4321/';
const browser = await chromium.launch();
for (const [name, vw, vh, mobile] of [['desk', 1440, 900, false], ['mob', 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', colorScheme: theme });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + path + (path.includes('?') ? '&' : '?') + 'static', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const slug = (path || 'home').replace(/[^a-z0-9]+/gi, '-');
  await page.screenshot({ path: `${out}/${name}-${slug}-${theme}-full.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(name, slug, theme, 'h=', await page.evaluate(() => document.documentElement.scrollHeight), 'x-overflow=', overflow, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no console errors');
  await ctx.close();
}
await browser.close();
