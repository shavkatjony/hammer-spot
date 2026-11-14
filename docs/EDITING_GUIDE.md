# Editing guide

Almost everything on the site comes from **one file: `src/content/site.ts`**. Change it, save, and the
home page, the case studies, the CV page and the CV PDF all follow. You never need to touch the design files
to change words, skills, projects or links.

---

## 1. See your changes while you edit

```bash
npm run dev
```

Open <http://localhost:4321>. The page updates every time you save.

---

## 2. Add, remove or move a skill

In `src/content/site.ts`, find `export const skillGroups`. It has six groups, in the order they appear in the
skill boxes at the bottom of the hero:

| Group | id |
|---|---|
| Programming & Data | `programming` |
| Statistics & Modelling | `statistics` |
| Machine Learning | `ml` |
| Model Development & Validation | `validation` (shown with → arrows, as steps) |
| APIs & Deployment | `deployment` |
| Visualization & Applied AI | `visualization` |

**Add a skill:** copy any line inside a group and change the name.

```ts
{ name: 'Power BI' },
```

**Ready-made examples** are already in the file as comments (lines starting with `//`). Delete the `//` to switch
one on:

- Programming & Data: `Polars`, `Excel / Google Sheets`
- Statistics & Modelling: `Time-series analysis`, `A/B testing`
- Machine Learning: `Hyperparameter tuning (GridSearchCV, Optuna)`, `XGBoost`, `LightGBM`, `TensorFlow / Keras`,
  `Clustering (k-means)`
- APIs & Deployment: `MLflow`, `AWS`
- Visualization & Applied AI: `Power BI`, `Computer vision: image classification (CNN)`, `Object detection (YOLO)`
- OpenCV and Tesseract are already in the list but only in the Toolkit. To show them in the hero boxes and the CV
  as well, delete `hero: false` on their lines.

**Optional settings on a skill:**

| Setting | What it does |
|---|---|
| `evidence: ['telco-churn']` | Shows project-number links next to the skill in the Toolkit. Use only for projects that really use it. |
| `extra: NOTEBOOKS` | Links the skill to your statistical modelling notebooks (or `MNIST` for the MNIST explorer). |
| `note: 'short text'` | A small line of detail under the skill in the Toolkit. |
| `learning: true` | Shows the skill as "(learning)". |
| `hero: false` | Keeps the skill out of the hero boxes and the CV; it appears only in the Toolkit. |

Project ids for `evidence`: `'f1-pace-intelligence'`, `'telco-churn'`, `'retail-intelligence'`,
`'olist-delivery'`, `'document-scanner'`.

A skill with no `evidence` and no `extra` is listed in the Toolkit under "Also used at work or in coursework".

> Rule of thumb: add a skill only if you can talk through a real example of using it in an interview.

---

## 3. Change your headline, introduction, availability, years and project count

All in `export const identity`:

| Field | Where it shows |
|---|---|
| `positioning` | Above your name in the hero; the CV profile; search and share text |
| `headline` and `headlineEmphasis` | The large line in the hero; the emphasis part is set in blue |
| `statement` | The introduction paragraph in the hero |
| `support` | The smaller sentence under it |
| `roles` | The CV's title line and the page title |
| `credentials` | "3+ years’ experience · 20+ projects delivered" in the hero, About and CV |
| `availability.open` | `true` shows "Open to work"; `false` hides it |
| `availability.scope` | "remote, full-time and project-based roles" |

---

## 4. Experience, education, languages, target roles

- `experience`: company, role, place, period and bullet points (CHUST KVENTS today).
- `education`: degree, school, year and focus.
- `languages`, `targetRoles` ("Looking for" in About) and `interests`.

---

## 5. Projects

Projects live in `export const projects`. **Their order in the file is their order everywhere** (cards, case-study
switcher, CV). Keep `index` (`'01'`, `'02'`, …) in the same order.

Useful fields: `title`, `status` (`'Complete' | 'Working' | 'In development' | 'Archived'`), `statusNote`,
`problem`, `contribution` (my part), `result`, `metrics` (three numbers on the card), `methods` (tags on the card),
`stack` (the "Stack" line), `links` (repo, demo, docs), and `caseStudy.sections` (the six case-study parts).

- `flagship: true` gives a project the largest card and the "Flagship project" badge (DPEC today).
- A private repository: `repoPublic: false` and `privateNote: 'Code available on request (private repository).'`
- Smaller work is in `archive`; the "20+ projects" sentence is `moreWork.note`.

---

## 6. Links: GitHub, LinkedIn, email

`export const social` and `export const email`. Components never hard-code links, so this is the only place.

---

## 7. Add your photo

Save it as `src/assets/portrait.jpg` (4:5 portrait, at least 1200 px tall, good light) and rebuild. It replaces
the "SY" tile automatically.

---

## 8. After editing: refresh the CV PDF and the share image

The PDF and the share image are made from the built site, so regenerate them after content changes:

```bash
npm run build
npm run preview          # runs in the background
npm run assets           # writes public/Shavkatjon-Yuldashev-CV.pdf and public/og.jpg
npm run build            # so the new files ship
npx astro preview stop
```

Check that the PDF is still one page (open it, or run `pdfinfo public/Shavkatjon-Yuldashev-CV.pdf`).

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
