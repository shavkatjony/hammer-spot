# Editing guide

Almost everything on the site comes from **one file: `src/content/site.ts`**. Change it, save, and the
home page and the case studies follow. (The CV is your own file: see section 8.) You never need to touch the design files
to change words, skills, projects or links.

---

## 1. See your changes while you edit

```bash
npm run dev
```

Open <http://localhost:4321>. The page updates every time you save.

---

## 2. Add, remove or move a skill

In `src/content/site.ts`, find `export const skillGroups`. It has seven groups, worded as in your CV and in the order
they appear in the skill boxes at the bottom of the hero:

| Group | id |
|---|---|
| Programming & Data | `programming` |
| Statistics & Modelling | `statistics` (the widest box) |
| Machine Learning | `ml` |
| ML Development & Validation | `validation` (shown with → arrows, as steps) |
| Applied AI & LLMs | `ai` |
| APIs, Cloud & Deployment | `deployment` |
| Visualization & Apps | `visualization` |

**Add a skill:** copy any line inside a group and change the name.

```ts
{ name: 'Power BI' },
```

**Ready-made examples** are in the file as comments (lines starting with `//`): `Polars`, `TensorFlow / Keras` and
`Power BI`. Delete the `//` to switch one on.

Some skills are in the Toolkit but kept out of the hero boxes so they stay readable (`hero: false`): Parquet, PyTorch,
Git & GitHub, D3.js, OpenCV and Tesseract. Delete `hero: false` on a line to show it in the boxes too.

**Optional settings on a skill:**

| Setting | What it does |
|---|---|
| `evidence: ['telco-churn']` | Shows project-number links next to the skill in the Toolkit. Use only for projects that really use it. |
| `extra: NOTEBOOKS` | Links the skill to your statistical modelling notebooks (or `MNIST` for the MNIST explorer). |
| `work: ['KVENTS']` | Shows a job chip (`KVENTS`, `TEXTILE` or `ASL`) linking to the Experience section. |
| `wide: true` (on a group) | The group takes two columns in the hero boxes; use it for the longest list. |
| `note: 'short text'` | A small line of detail under the skill in the Toolkit. |
| `hero: false` | Keeps the skill out of the hero boxes; it appears only in the Toolkit. |

Project ids for `evidence`: `'f1-pace-intelligence'`, `'telco-churn'`, `'retail-intelligence'`,
`'olist-delivery'`, `'document-scanner'`.

A skill with no `evidence`, `work` or `extra` is listed in the Toolkit under "Also in my toolkit".

> Rule of thumb: add a skill only if you can talk through a real example of using it in an interview.

---

## 3. Change your headline, introduction and availability

All in `export const identity`. Under your name the hero shows three lines: your title, the headline, then one
paragraph. Keep each short.

| Field | Where it shows |
|---|---|
| `title` | "Data Scientist & Applied ML Engineer": under your name, next to it in the nav, in the footer and in search results |
| `headline` and `headlineEmphasis` | "From raw data to reliable decisions."; the emphasis part is set in blue |
| `statement` | The paragraph under the headline |
| `positioning` | Search and share description only |
| `availability.open` | `true` shows "Open to work"; `false` hides it |
| `availability.scope` | "full-time, part-time, project-based and remote roles" |

---

## 4. Experience, education, languages, target roles

- `experience`: one entry per job, most recent and strongest first. Each has `org`, `place`, `role`, `period`,
  a one-line `summary`, `points` (bullets) and `skills` (small tags). They appear in full in the Experience section,
  straight after the hero. To add a job, copy an entry and change it.
- `education`: degree, school, year and focus.
- `languages`, `targetRoles` ("Looking for" in About) and `interests`.

---

## 5. Projects

Projects live in `export const projects`. **Their order in the file is their order everywhere** (cards, case-study
switcher). Keep `index` (`'01'`, `'02'`, …) in the same order.

Useful fields: `title`, `status` (`'Complete' | 'Working' | 'In development' | 'Archived'`), `statusNote`,
`problem`, `contribution` (my part), `result`, `metrics` (three numbers on the card), `methods` (tags on the card),
`stack` (the "Stack" line), `links` (repo, demo, docs), and `caseStudy.sections` (the six case-study parts).

- `flagship: true` gives a project the largest card and the "Flagship project" badge (DPEC today).
- A private repository: `repoPublic: false` and `privateNote: 'Code available on request (private repository).'`
- Smaller work is in `archive`; the sentence above it is `moreWork.note`.

---

## 6. Links: GitHub, LinkedIn, email

`export const social` and `export const email`. Components never hard-code links, so this is the only place.

- **Telegram:** `social.telegram` (shown as a "Telegram" button in Contact and in the footer; the handle is not printed).
- **Personal website:** `export const personalSite`. While `href` is empty, Contact shows "Personal website · coming soon".
  Put the full address in `href` (for example `'https://yourname.com'`) and it becomes a live button, also listed in the
  footer.

---

## 7. Add your photo

Save it as `src/assets/portrait.jpg` (4:5 portrait, at least 1200 px tall, good light) and rebuild. It replaces
the "SY" tile automatically.

---

## 8. Your CV (download only, English and Korean)

There is no CV web page. Every "CV" button opens a small menu with **English** and **한국어**, and each option downloads a file
from `public/`:

| Language | File |
|---|---|
| English | `public/Shavkatjon-Yuldashev-CV.pdf` |
| 한국어 | `public/Shavkatjon-Yuldashev-CV-KR.pdf` |

Both are your own final CVs, published unchanged. **To update one:** export a new PDF from Word or Google Docs, give it
the same file name, replace the file in `public/`, and rebuild. The file names and labels live in `resume` in
`src/content/site.ts`.

**Share image** (the preview shown when the link is posted): regenerate it after changing the hero or adding your photo.

```bash
npm run build
npm run preview          # runs in the background
npm run assets           # writes public/og.jpg only
npm run build            # so the new image ships
npx astro preview stop
```

---

## 9. Check before publishing

```bash
npm run check            # TypeScript and Astro: must say 0 errors
npm run verify           # accessibility, security policy, links (needs the preview running)
```

---

## 10. Publish

```bash
git add -A
git commit -m "Update skills"
git push
```
