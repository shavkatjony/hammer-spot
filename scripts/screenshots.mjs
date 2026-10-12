// Hero screenshots at desktop/mobile, 3D (forced software GL) and static: node scripts/screenshots.mjs <outdir>
import { chromium } from 'playwright';
const out = process.argv[2];
const base = process.env.BASE_URL || 'http://127.0.0.1:4321/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const shots = [
  { name: 'desk-hero-3d', url: '?3d=force', vw: 1440, vh: 900, wait: 4500 },
  { name: 'desk-hero-static', url: '?static', vw: 1440, vh: 900, wait: 2500 },
  { name: 'mob-hero-3d', url: '?3d=force', vw: 390, vh: 844, wait: 4500, mobile: true },
  { name: 'mob-hero-static', url: '?static', vw: 390, vh: 844, wait: 2500, mobile: true },
];
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.vw, height: s.vh }, deviceScaleFactor: s.mobile ? 2 : 1, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto(base + s.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(s.wait);
  await page.screenshot({ path: `${out}/${s.name}.png` });
  const canvas = await page.$('canvas');
  console.log(s.name, 'canvas:', !!canvas, canvas ? await canvas.evaluate((c) => c.className) : '', logs.join(' | '));
  await ctx.close();
}
await browser.close();
