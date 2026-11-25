# Portfolio PDFs

Two recruiter-facing portfolio documents, built from code:

| File | Language |
| --- | --- |
| `output/Shavkatjon_Yuldashev_Portfolio_EN.pdf` | English |
| `output/Shavkatjon_Yuldashev_Portfolio_KR.pdf` | Korean |

They are two separate documents, not one bilingual file. Both have the same 30 pages,
facts and numbers. The website is not touched: nothing here is imported by the Astro site.
The CV PDFs in `public/` are not touched either.

## Build

From the repository root:

```bash
npm install                        # once: Playwright, Pretendard and IBM Plex fonts
npx playwright install chromium    # once, unless you point PW_CHROMIUM at a Chromium you have
pip install pypdf                  # once: metadata and bookmarks

node portfolio/build.mjs           # both PDFs
node portfolio/build.mjs ko        # one language (en | ko)
PREVIEW=1 node portfolio/build.mjs # also save a PNG of every page to portfolio/build/pages-<lang>/
```

You need Node 22.18 or newer, because the build imports the site's `.ts` content files
directly. `PW_CHROMIUM=/path/to/chromium` uses a Chromium you already have installed.

Each build does four things:

1. Builds one HTML document per language from the page templates.
2. Opens it in Chromium and checks every page. It flags anything that crosses the margins,
   any text wider than its box, any image that fails to load and any font that fails to
   load. A build with layout problems exits with code 1.
3. Prints to A4 landscape with a selectable, tagged text layer and clickable links. Every
   font is embedded as a real outline font, with no Type 3 fonts.
4. Runs `tools/set-metadata.py`, which sets the title, author, subject, keywords, document
   language and a bookmark outline grouped by chapter.

## Where to edit

| What | File |
| --- | --- |
| Every number, date and link (one place, so EN and KR never disagree) | `src/facts.mjs` |
| Cover, at a glance, contents, profile, specializations, experience, project overview | `src/pages-intro.mjs` |
| F1 Pace Intelligence, the flagship (11 pages) | `src/pages-f1.mjs` |
| Telco, Retail, Olist, additional work, contact | `src/pages-more.mjs` |
| Shared parts: headings, stats, plates, charts, diagrams | `src/ui.mjs` |
| Design tokens, typography, layout | `src/style.css` |

All copy is written as `{ en: '…', ko: '…' }` pairs, so a change is made in both
languages at the same place. Experience bullets come word for word from the CVs
(through `src/content/site.ts` and `ko.ts`) and are not rewritten here.

## Page budget

| Pages | Section |
| --- | --- |
| 1–8 | Cover, at a glance, contents, profile, specializations matrix, CHUST KVENTS, earlier roles and education, project overview |
| 9–19 | F1 Pace Intelligence (11 pages): opener, problem, architecture, data, research, validation, results, strategy, product, applied AI, engineering and limits |
| 20–22 | Telco Customer Churn |
| 23–25 | Retail Commercial Intelligence |
| 26–28 | Olist Marketplace |
| 29 | Additional work |
| 30 | Contact |

For a 60-second review, the cover, the at-a-glance page (2) and the F1 opener (9) carry
the headline evidence. The contents page links to every section.

## Evidence rules

- Project numbers come from each repository's README, reports, model card or numbers
  check. `src/facts.mjs` notes the source of each group.
- Employment outcomes are owner-reported (CV) and carry a "Reported outcome" label.
- Stated limits stay in: F1 results are backtests and dry runs (no live weekends),
  Retail runs on synthetic M5-shaped data, Telco is a fictional IBM sample, and private
  projects are marked private.

## Regenerating assets

Only needed when a source image or font changes. The results are already in `assets/`.

```bash
pip install fonttools brotli segno pillow
python3 portfolio/tools/make-fonts.py                                     # static Newsreader instances (OFL)
REPOS=/path/to/project/clones python3 portfolio/tools/prepare-images.py   # screenshots and figures from the repos
python3 portfolio/tools/make-qr.py                                        # QR codes for the EN and KO site
```

Fonts: Newsreader (OFL, `assets/fonts/OFL-Newsreader.txt`), IBM Plex Sans and Mono (OFL,
via `@fontsource`) and Pretendard (OFL, via `pretendard`).
