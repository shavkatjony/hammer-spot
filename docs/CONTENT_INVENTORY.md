# Content inventory — audit of 2026-10-12

This is the evidence base for every claim on the site. Each line is tagged:

- **VERIFIED**: seen in public code, commit history, or a committed report file.
- **SELF-REPORTED**: from Shavkatjon's own CV (Google Drive, `SHAVK_resume`, edited 2026-09-17). Not publicly verifiable.
- **EDITORIAL**: wording written for the site, describing verified facts.
- **CONFIRM**: conflicting or missing information. Shavkatjon needs to check it.

## 1. Biography and positioning

| Item | Value | Status |
|---|---|---|
| Name | Shavkatjon Yuldashev, public handle SHAVKATJON | VERIFIED (GitHub, commits) |
| GitHub | https://github.com/shavkatjony | VERIFIED |
| Location | Busan, South Korea | VERIFIED (data-science-portfolio README) + SELF-REPORTED (CV) |
| Education | Dong-A University, Bachelor of Integrated Business Management (IBM), 2026. Coursework focus: econometrics, business statistics and strategy, marketing research | SELF-REPORTED (CV); "Dong-A University IBM" also appears in `archive2025`. **CONFIRM** graduation month |
| Positioning | Early-career data scientist / analyst. Python, SQL, statistics, applied ML | EDITORIAL |
| Open to work | Yes: junior, internship, research and English-friendly roles | Stated in the brief. **CONFIRM** it is still accurate before each deploy |

**Conflicts to resolve (CONFIRM):**

- Graduation date. The brief says graduated; the latest CV says 2026; a Drive draft says "Aug 2026"; `command-center/pages/index.html` has `graduation: '2027-02-26'`. **The site shows "2026" only.**
- Degree title. One Drive CV draft (`cv _cloude`) says "degree in Data Science and AI". That conflicts with the latest CV and the brief. **The site uses Integrated Business Management.** Delete the draft so it isn't sent by mistake.
- LinkedIn URL. The post URL contains the slug `shavkatjon-yuldashev-10a637277`, so the site uses `https://www.linkedin.com/in/shavkatjon-yuldashev-10a637277/`. Older CV drafts say `linkedin.com/in/shavkatjon`. LinkedIn blocks automated access from this environment, so neither could be opened.

## 2. Projects ranked by evidence and relevance

| Rank | Repo | Verdict | Evidence |
|---|---|---|---|
| 1 | `telco-c-classifier-alias` | **Feature + case study** (see §7.3b on the stale threshold CSV) | 43 commits. `src/` pipeline (preprocess/train/predict), 4 notebooks, `reports/*.csv`, Streamlit app, real screenshot. Test ROC-AUC **0.842**, recall **0.791** (296/374) from `reports/final_model_metrics.csv`. 5-fold CV table from `reports/model_comparison.csv` |
| 2 | `brazilian-e-market` | **Feature + case study** | 15 commits. 5 SQL files plus 5 notebook queries, SQLite build script, findings report, 5 real figures. Numbers: 99,441 orders; 3.12% repeat rate; review score 4.29 on time vs 1.73 at 8+ days late |
| 3 | `retail-commercial-intelligence` | **Feature + case study** | Python + DuckDB SQL star schema, data-quality gate, exception engine, self-contained HTML dashboard. **Findings use synthetic data** (README says so). Scale test: 59.1M rows, 84 s, 2.6 GB peak, documented in `docs/architecture.md` |
| 4 | `F1-pace-intelligence` (DPEC) | **Feature, labelled "in development"** | Plan v4, two ADRs, an idempotent FastF1 → Parquet ingest CLI with SHA-256 manifest, pytest suite, ruff, and GitHub Actions CI. **No forecasting model exists yet**; the README says "Planning" |
| 5 | `lotte-world-busan-santiment-analyses` | Secondary (academic) | Dong-A **team** project, 887 Google Maps reviews, KH Coder co-occurrence network, descriptive statistics. **CONFIRM** your individual role |
| 6 | `data-science-portfolio` | Secondary (foundations) | Three course-style notebooks (OLS GPA, used-car price, logit bank marketing). Notebook outputs: car price **test R² 0.773**, 5-fold CV mean 0.749; bank test accuracy 86.0% |
| — | `f1-race-replay` | **Not your project.** Fork of Tom Shaw's `IAmTomShaw/f1-race-replay` | Your only commit is `starting_plan.md`. Listed under "Open source I've studied" |
| — | `google-data-analytics` | **Not your work.** Fork of elmoallistair's course notes | 0 commits by you. Not used. The certificate is **not claimed** (CONFIRM whether you hold it) |
| — | `api_s_python` | Practice | Flask + Flask-SQLAlchemy REST practice, public-API consumers. Supports "Flask (practice)" in the toolkit only |
| — | `command-center`, `learning-platform`, `archive2025` | Personal learning hubs | Not featured |

## 3. Verified technical skills (with code evidence)

- **Python**: pandas, NumPy, scikit-learn (Pipeline, StratifiedKFold, cross_validate), statsmodels (OLS/Logit), matplotlib (all repos)
- **SQL**: SQLite with CTEs, window functions and cohort logic (Olist); DuckDB star schema with staged SQL (Retail)
- **ML evaluation**: baselines, stratified CV, threshold analysis, ROC-AUC/recall trade-offs (Telco)
- **Data engineering basics**: Parquet, DuckDB, manifests and hashes, idempotent ingestion, Makefile, YAML config (Retail, DPEC)
- **Engineering hygiene**: pytest, ruff, uv, GitHub Actions CI, Typer CLI, pydantic config (DPEC)
- **Apps**: Streamlit (Telco). Flask (practice only)
- **Text mining**: KH Coder (Lotte World, team project)
- SELF-REPORTED only (not shown as evidence on the site): R / RStudio, PostgreSQL, MySQL, FastAPI, PSPP, Power BI

## 4. Experience

- **KVENTS** (Chust, Namangan, Uzbekistan). Data & Business Analyst, remote, Nov 2024 – Dec 2025. SELF-REPORTED (CV). Shown on the site as stated in the CV. **CONFIRM** before publishing.

## 5. Languages (SELF-REPORTED)

Uzbek (native), English (fluent), Turkish (fluent), Korean (beginner; TOPIK study plan in `command-center`). An older CV draft said "Korean (Professional)". **The site uses "beginner".**

## 6. Links and contacts

| Link | Status |
|---|---|
| GitHub `shavkatjony` | VERIFIED |
| Email `shavkatjon.yuldashev.0411@gmail.com` | VERIFIED: already published in your `data-science-portfolio` README and commits |
| LinkedIn | Derived from your post URL (see §1). **CONFIRM** |
| Streamlit demo `https://shavkh.streamlit.app/` | Linked from the Telco README. **Could not be reached** from this environment (network policy). CONFIRM it is awake |
| Retail dashboard `https://shavkatjony.github.io/retail-commercial-intelligence/dashboard/` | Repo has Pages enabled. Could not be reached from this environment |
| Instagram `@shavkatjon_l` | Found in `archive2025`. Personal, so **not shown** |
| Phone | Found in the CV. **Never published** |
| Kaggle, Hugging Face, Medium, ORCID, Scholar | No evidence found. Not linked |
| Portrait | GitHub avatar is an illustration, not a photo. **Missing**: supply one |
| Résumé | No public CV file. The site generates `/resume/` (print-ready) from verified content. No phone number |

## 7. Risks found in your public footprint (fix soon)

1. **`command-center/pages/portfolio-professional.html` is public on GitHub Pages and contains fabricated template claims**: "12+ models deployed", "94.3% avg accuracy", "$2.3M saved", "5K+ daily users", "PyTorch 4 years", "AWS SageMaker production". A recruiter who finds it will doubt everything else. **Delete it or make the repo private.**
2. `data-science-portfolio/README.md` claims car-price **R² = 0.82**, but the notebook shows test R² **0.773**. Its project links point to folders that don't exist (`./used-car-price/`, `./bank-marketing/`).
3. `telco-c-classifier-alias/README.md`: the model-comparison table says "XGBoost", but the CSV numbers come from `HistGradientBoostingClassifier` in `src/train.py`. Two image paths are broken (`predictor_main.jpg.png`, `streamlit-prediction.png`). It also still has the placeholder "Source Code: Add your GitHub repository URL here".
3b. `telco-c-classifier-alias/reports/threshold_analysis.csv` is **stale**. It was written on 2026-08-31 by `notebooks/04_evaluation.ipynb` from the earlier, unweighted notebook model (`churn_model.pkl`). `final_model_metrics.csv` and `model_comparison.csv` were regenerated on 2026-09-04 by `src/train.py` for the shipped, class-weighted pipeline. At threshold 0.50 they disagree (recall 0.559 vs 0.791). The site uses the final metrics for every claim, shows the sweep only with an explicit "earlier notebook model" label, and lists regenerating it as a next step. The test-set confusion matrix on the site (TP 296, FN 78, FP 298, TN 737) is derived from `final_model_metrics.csv` and reproduces its accuracy exactly.
4. CV says Olist used **PostgreSQL**; the repo uses **SQLite**.
5. `lotte-world-busan-santiment-analyses` commits a raw review spreadsheet (`data/ raw/reviews_raw_1000+.xlsx`). Check that it contains no reviewer names, and that the Google Maps terms allow redistribution.
6. The `F1-pace-intelligence` repo description is unclear ("this is the system that all about how formula 1 is be in the systems…"). Rewrite it to match the README tagline.
