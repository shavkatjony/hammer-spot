// Generates public/Shavkatjon-Yuldashev-CV.pdf (from /resume/) and public/og.jpg (from the hero).
// Usage: npm run build && npm run preview   then   npm run assets   (rebuild afterwards so the files ship)
// Re-run whenever src/content/site.ts changes, then rebuild so the files ship.
import { chromium } from 'playwright';
const base = process.env.BASE_URL || 'http://127.0.0.1:4321/';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });

// Résumé PDF: print stylesheet, A4, light theme
{
  const ctx = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + 'resume/', { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: 'public/Shavkatjon-Yuldashev-CV.pdf',
    format: 'A4',
    printBackground: false,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    tagged: true,
    outline: false,
  });
  await ctx.close();
  console.log('wrote public/Shavkatjon-Yuldashev-CV.pdf');
}

// Open Graph image: the static hero at 1200×630
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, colorScheme: 'light', reducedMotion: 'reduce', bypassCSP: true }); // tooling only
  const page = await ctx.newPage();
  await page.goto(base + '?static', { waitUntil: 'networkidle' });
  // tooling-only style: hide the nav, rail and stack panel (it would be cut by the 630 px frame), and size the portrait plate to fit
  await page.addStyleTag({ content: '.site-nav,.sun-rail{display:none!important} body::after{opacity:.25} .hero__plate{width:min(100%,19.5rem)!important} .hero__stack{visibility:hidden}' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await ctx.close();
  console.log('wrote public/og.jpg');
}
await browser.close();
