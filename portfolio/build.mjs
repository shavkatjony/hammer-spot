/**
 * Build the portfolio PDFs (English and Korean) from the page templates in src/.
 *
 *   node portfolio/build.mjs            # both languages
 *   node portfolio/build.mjs en         # one language
 *   PREVIEW=1 node portfolio/build.mjs  # also write a PNG of every page to portfolio/build/pages-<lang>/
 *
 * Steps: assemble HTML → open it in Chromium → check every page for overflow → print to PDF →
 * add metadata and a bookmark outline (tools/set-metadata.py, needs `pip install pypdf`).
 * Needs Playwright's Chromium (set PW_CHROMIUM to use an installed binary).
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { ctx, L, esc } from './src/ui.mjs';
import { introPages } from './src/pages-intro.mjs';
import { f1Pages } from './src/pages-f1.mjs';
import { morePages } from './src/pages-more.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const NM = resolve(HERE, '..', 'node_modules');
const BUILD = join(HERE, 'build');
const OUT = join(HERE, 'output');
const FILES = { en: 'Shavkatjon_Yuldashev_Portfolio_EN.pdf', ko: 'Shavkatjon_Yuldashev_Portfolio_KR.pdf' };
const langs = process.argv.slice(2).filter((a) => a === 'en' || a === 'ko');
const LANGS = langs.length ? langs : ['en', 'ko'];

const PAGES = [...introPages, ...f1Pages, ...morePages];
const TONE = (id) =>
  id.startsWith('f1') ? 'gold' : id.startsWith('telco') ? 'steel' : id.startsWith('retail') ? 'brick' : id.startsWith('olist') ? 'willow' : '';

/* ------------------------------------------------------------------ fonts */
const url = (p) => 'file://' + p;
const face = (family, file, weight, style = 'normal') =>
  `@font-face{font-family:'${family}';src:url('${url(file)}');font-weight:${weight};font-style:${style};font-display:block}`;
const FONTS_CSS = [
  face('PF Newsreader Display', join(HERE, 'assets/fonts/PFNewsreaderDisplay-Regular.ttf'), 400),
  face('PF Newsreader Display', join(HERE, 'assets/fonts/PFNewsreaderDisplay-Medium.ttf'), 500),
  face('PF Newsreader Display', join(HERE, 'assets/fonts/PFNewsreaderDisplay-Italic.ttf'), 400, 'italic'),
  face('PF Newsreader Text', join(HERE, 'assets/fonts/PFNewsreaderText-Regular.ttf'), 400),
  face('PF Newsreader Text', join(HERE, 'assets/fonts/PFNewsreaderText-Italic.ttf'), 400, 'italic'),
  ...[
    ['Regular', 400],
    ['Medium', 500],
    ['SemiBold', 600],
    ['Bold', 700],
  ].map(([n, w]) => face('Pretendard', join(NM, `pretendard/dist/web/static/woff2/Pretendard-${n}.woff2`), w)),
].join('\n');
const FONT_LINKS = ['ibm-plex-sans/400', 'ibm-plex-sans/400-italic', 'ibm-plex-sans/500', 'ibm-plex-sans/600', 'ibm-plex-mono/400', 'ibm-plex-mono/500']
  .map((f) => `<link rel="stylesheet" href="${url(join(NM, '@fontsource', f + '.css'))}">`)
  .join('\n');

/* ------------------------------------------------------------------ assemble */
function render(lang) {
  ctx.lang = lang;
  const P = Object.fromEntries(PAGES.map((p, i) => [p.id, i + 1]));
  const total = PAGES.length;
  const runLeft = L({ en: 'Shavkatjon Yuldashev · Portfolio 2026', ko: '샤브카트존 율다셰프 · 포트폴리오 2026' });
  const sections = PAGES.map((p, i) => {
    const n = i + 1;
    const theme = p.theme === 'cover' ? 'page cover' : `page${p.theme ? ` page--${p.theme}` : ''}`;
    const tone = TONE(p.id);
    const topo = p.theme === 'dark' || p.theme === 'night' ? `<img class="topo" src="${url(resolve(HERE, '../src/assets/textures/topo.svg'))}" alt="">` : '';
    const chrome =
      p.theme === 'cover'
        ? ''
        : `<div class="run-head"><span>${runLeft}</span><span>${L(p.sec)}</span></div>
           <div class="run-foot"><span>${L(p.chapter ?? '')}</span><span class="horizon"><span class="horizon__sun" style="left:${(((n - 1) / (total - 1)) * 100).toFixed(2)}%"></span></span><span class="run-foot__no"><b>${String(n).padStart(2, '0')}</b> / ${total}</span></div>`;
    const bar = tone && p.theme !== 'dark' ? `<span class="tonebar tone-${tone}"></span>` : '';
    return `<section class="${theme}${tone ? ` tone-${tone}` : ''}" id="p-${p.id}" data-page="${n}">${topo}${bar}${chrome}<div class="page__body">${p.body(P)}</div></section>`;
  });
  const title = L({ en: 'Shavkatjon Yuldashev · Portfolio · Data Scientist & Applied ML Engineer', ko: '샤브카트존 율다셰프 · 포트폴리오 · 데이터 사이언티스트 · 응용 ML 엔지니어' });
  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
${FONT_LINKS}
<style>${FONTS_CSS}</style>
<link rel="stylesheet" href="${url(join(HERE, 'src/style.css'))}">
<style>.tonebar{position:absolute;top:0;left:0;right:0;height:2.2mm;background:var(--tint)}</style>
</head>
<body>
${sections.join('\n')}
</body>
</html>`;
  return { html, title, P, total };
}

/* ------------------------------------------------------------------ checks run inside the page */
function checkLayout() {
  const mm = 96 / 25.4;
  const issues = [];
  const describe = (el) => {
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    return `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]} "${t}"`;
  };
  for (const pg of document.querySelectorAll('.page')) {
    if (pg.classList.contains('cover')) continue;
    const r = pg.getBoundingClientRect();
    const limit = { top: r.top + 13 * mm, bottom: r.bottom - 12.6 * mm, left: r.left + 16.5 * mm, right: r.right - 16.5 * mm };
    const seen = new Set();
    for (const el of pg.querySelectorAll('.page__body *')) {
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      if (el.closest('.plate__frame') && el.tagName === 'IMG') continue;
      const out = b.bottom > limit.bottom + 0.6 || b.right > limit.right + 0.6 || b.left < limit.left - 0.6;
      if (out && !seen.has(el.parentElement)) {
        seen.add(el);
        issues.push(`p${pg.dataset.page}: outside the content area by ${Math.max(b.bottom - limit.bottom, b.right - limit.right, limit.left - b.left).toFixed(1)}px: ${describe(el)}`);
      }
    }
    for (const el of pg.querySelectorAll('.stat__v, .chip, .bars__v, .node, .matrix__cap, .cm__c, .seg > span, .toc__row, .badge')) {
      if (el.scrollWidth > el.clientWidth + 1) issues.push(`p${pg.dataset.page}: text wider than its box: ${describe(el)}`);
    }
    for (const img of pg.querySelectorAll('img')) if (!img.complete || img.naturalWidth === 0) issues.push(`p${pg.dataset.page}: image failed to load: ${img.src}`);
  }
  // every glyph should come from our fonts (no silent fallback to a system font)
  return issues;
}

/* ------------------------------------------------------------------ build */
mkdirSync(BUILD, { recursive: true });
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
let failed = false;
for (const lang of LANGS) {
  const { html, title, P, total } = render(lang);
  const htmlPath = join(BUILD, `portfolio-${lang}.html`);
  writeFileSync(htmlPath, html);
  const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });
  await page.emulateMedia({ media: 'print' });
  await page.goto(url(htmlPath), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // Korean sets body and headings in Pretendard, so IBM Plex Sans is expected only in English.
  const fontsOk = await page.evaluate(async (lang) => {
    const want = ['16px "IBM Plex Mono"', '16px "PF Newsreader Display"', '16px "Pretendard"'];
    if (lang === 'en') want.unshift('16px "IBM Plex Sans"');
    return want.filter((f) => !document.fonts.check(f));
  }, lang);
  if (fontsOk.length) console.log(`[${lang}] fonts not loaded: ${fontsOk.join(', ')}`);
  const issues = await page.evaluate(checkLayout);
  console.log(`[${lang}] ${total} pages, layout issues: ${issues.length}`);
  for (const i of issues) console.log('   ' + i);
  if (issues.length) failed = true;

  if (process.env.PREVIEW) {
    const dir = join(BUILD, `pages-${lang}`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const shot = await browser.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: Number(process.env.PREVIEW_SCALE || 1) });
    await shot.emulateMedia({ media: 'print' });
    await shot.goto(url(htmlPath), { waitUntil: 'load' });
    await shot.evaluate(() => document.fonts.ready);
    const els = await shot.$$('.page');
    for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: join(dir, `${String(i + 1).padStart(2, '0')}.png`) });
    await shot.close();
  }

  const pdfPath = join(OUT, FILES[lang]);
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
  await page.close();

  // bookmarks: one entry per page, grouped by chapter, with short names
  const outline = [];
  for (const p of PAGES) {
    const chapter = p.chapter ? L(p.chapter) : L({ en: 'Overview', ko: '개요' });
    outline.push({ chapter, title: L(p.sec), page: P[p.id] - 1 });
  }
  const meta = {
    title,
    author: 'Shavkatjon Yuldashev',
    subject: L({
      en: 'Portfolio: forecasting, data engineering and applied ML. Flagship: F1 Pace Intelligence.',
      ko: '포트폴리오: 수요 예측, 데이터 엔지니어링, 응용 ML. 대표 프로젝트: F1 Pace Intelligence.',
    }),
    keywords: L({
      en: 'data scientist, machine learning engineer, forecasting, statistics, data engineering, applied AI, Python, SQL, Busan',
      ko: '데이터 사이언티스트, 머신러닝 엔지니어, 수요 예측, 통계, 데이터 엔지니어링, 응용 AI, Python, SQL, 부산',
    }),
    lang,
    outline,
  };
  const metaPath = join(BUILD, `meta-${lang}.json`);
  writeFileSync(metaPath, JSON.stringify(meta));
  execFileSync('python3', [join(HERE, 'tools/set-metadata.py'), pdfPath, metaPath], { stdio: 'inherit' });
  console.log(`[${lang}] wrote ${pdfPath}`);
}
await browser.close();
if (failed) {
  console.log('\nLayout issues found: fix them before sending the PDFs.');
  process.exitCode = 1;
}
