# Content inventory

Audit of 2026-10-12, updated 2026-11-12 for the redesign (section 0) and 2026-11-14 (section 0a). Where the sections disagree, the newest one (0d, then 0c, 0b, 0a, 0) is current.

## 0e. Update of 2026-11-25 (new CV design; Korean version of the site)

- CVs: the owner's redesigned English and Korean CVs (`Shavkatjon_Yuldashev_Resume.pdf`, `샤브카트존 율다셰프 이력서`) are published byte for byte. At the owner's explicit request nothing is removed from the public copies: they include phone, date of birth, gender, nationality, military status and visa. The portrait on the site is unchanged.
- Experience: KVENTS and CHUST TEXTILE bullets now follow the new CVs word for word (owner's wording, not edited). New KVENTS forecasting claim: WAPE 31% → 25% against a seasonal-naive baseline, stockouts ~20% lower; "$7M in combined assets". CHUST TEXTILE role is now "Backend Developer". The ASL internship stays on the site (it is no longer on the CVs). **Self-reported; no public evidence.**
- "4 years 6 months of experience" (CV header) counts KVENTS and CHUST TEXTILE only; the site says so ("plus a backend internship").
- Visa line: "D-10 Job Seeker (valid until 2027.09.16) · E-7 sponsorship required upon hiring". Korean: intermediate. Education: Mar 2022 – Aug 2026.
- New skills from the CVs (no public project evidence, listed under "Also in my toolkit"): Apache Spark, TensorFlow, LangChain, Model Context Protocol (MCP). PyTorch now shows in the skill boxes (evidence: MNIST explorer). Generative AI and RAG link to DPEC and KVENTS.
- Korean version of every page under `/ko/`; Korean job bullets, skills, education and visa copied from the Korean CV.

## 0d. Update of 2026-11-19 (owner's new English and Korean CVs)

| Item | Now | Status |
|---|---|---|
| Source | Owner's English CV (`hammertime.docx.pdf`) and Korean CV (`shavkh-KR.pdf`), published unchanged as the two CV downloads (only the PDF title metadata was set) | Owner's documents |
| KVENTS | Title "Data Scientist & Applied ML Engineer"; four new bullets copied word for word, including PostgreSQL warehouse ($7M inventory), SKU-level XGBoost/LightGBM forecasting (WAPE −20%, stockouts −15–25%), Text-to-SQL RAG assistant, RFM/K-Means and price elasticity (gross margin +4–8%, 15–20+ hours/week) | SELF-REPORTED (owner). No public evidence; be ready to explain each figure |
| CHUST TEXTILE | Three new bullets word for word: Django/DRF APIs and PostgreSQL schemas (query speed +40–60%), atomic transactions and RBAC (mismatches −25%), automated aggregation (10–15+ hours/week), pytest | SELF-REPORTED (owner) |
| CHUST ASL CHARM SHOES | One bullet word for word (sales/stock reconciliation) | SELF-REPORTED (owner) |
| Skills | Seven groups word for word from the CV. Skills without a public project link to the job that used them (chips) or sit under "Also in my toolkit": R, A/B Testing, Hyperparameter Tuning, LLM Fine-Tuning, Autonomous Workflows, AWS, Plotly, Tableau | SELF-REPORTED where no project link |
| Visa | D-10, shown in About and Contact as on the CV | Owner's CV |
| Education | Graduation Aug 2026 | Owner's CV |
| Korean | "Beginner, currently studying" | Owner's CV |

## 0c. Update of 2026-11-16 (experience history, hero copy)

| Item | Now | Status |
|---|---|---|
| CHUST TEXTILE | Junior Backend Developer, Chust, Uzbekistan, **May 2021 – Jul 2022** (owner's correction of 2026-11-16); summary and four bullets as supplied | SELF-REPORTED (owner) |
| CHUST ASL CHARM SHOES | Backend Developer Intern, Chust, Uzbekistan, **Sep 2020 – Mar 2021** (6 months; owner's correction); summary and four bullets as supplied | SELF-REPORTED (owner) |
| KVENTS summary line | "Data analysis, forecasting and reporting automation for a business with a head office and three retail locations", a summary of the owner's own four bullets | EDITORIAL |
| Hero copy | Owner's own text: title "Data Scientist & Applied ML Engineer", headline "From raw data to reliable decisions.", paragraph "I build data products through statistical modelling, machine learning and data engineering — …". No years are claimed in the hero | Owner's copy |
| Experience section | New section 01, straight after the hero; all three roles in full | Owner's decision |

## 0b. Update of 2026-11-15 (review fixes)

| Item | Now | Status |
|---|---|---|
| KVENTS period | **Jan 2023 – Mar 2026** (owner's correction), which gives the "3+ years" credential | SELF-REPORTED |
| "20+ projects delivered" | Removed from the hero, About, CV and More work | Owner's decision |
| Skills | Basic and overlapping items removed (JSON, CSV, Correlation analysis, separate "APIs", separate Git/GitHub, "Descriptive & inferential statistics" → "Statistical inference"). Regression listed once, under Statistics & Modelling, as OLS and weighted least squares. Added the evidenced Monte Carlo simulation and conformal prediction intervals. "LLM tool use" replaced by the actual capabilities: LLM agents & tool calling (Claude API, Ollama), grounded answers with SQL guardrails, LLM evaluation | VERIFIED against DPEC README for the AI items |
| Olist wording | Findings stated as correlations ("association, not causation"), not as causes | VERIFIED |
| Retail | Synthetic, M5-shaped data stated up front; the 59.1M-row stress test ran on a generated dataset at full M5 size (`docs/architecture.md`) | VERIFIED |
| DPEC AI evaluation | Called an internal 50-question evaluation, not an independent benchmark | VERIFIED |

## 0a. Update of 2026-11-14 (positioning, order, skills)

| Item | Now | Status |
|---|---|---|
| Positioning | "Data Scientist building end-to-end data products." Headline, introduction and supporting sentence as supplied by the owner. "Production-grade ML systems" removed everywhere | Owner's copy (EDITORIAL) |
| Project order | 01 DPEC (flagship), 02 Telco, 03 Retail, 04 Olist; 05 invoice scanner secondary | Owner's decision |
| DPEC status | **Complete**, with "public forecast ledger: 0 live weekends" kept visible on the card and the owner's limitation sentence in the case study. 58% vs 46% stop-count agreement over 78 dry races; 15 linked windows and 4 layouts; per-year model better ordering after qualifying (Spearman 0.843 vs 0.821); first five 2026 races 68% coverage | VERIFIED against the current README (commit 917c477) |
| Telco | Threshold sweep from the earlier notebook model removed from the site (stale). Case study now names the three classifiers and explains why the most accurate model (random forest, accuracy 0.788, recall 0.465) was not selected | VERIFIED |
| Retail | Positioned as data engineering, modelling and decision support; Tableau shown as not yet published; findings labelled synthetic | VERIFIED |
| Olist | Limitation added: data ends October 2018 | VERIFIED |
| Statistical modelling notebooks | Added to More work: used-car price test R² 0.7727 (shown 0.773), 5-fold CV mean 0.749; repo first commit 2026-04-20 | VERIFIED (notebook outputs) |
| KVENTS | "CHUST KVENTS", Data & Business Analyst, remote. Period shown as **Nov 2023 – Mar 2026** from the owner's text "November 2023 january – 2026 march" | SELF-REPORTED. **CONFIRM** the start month |
| KVENTS responsibilities | Four bullets as supplied (Python and SQL workflows; demand forecasting, segmentation; profitability and pricing; automation) | SELF-REPORTED |
| Credentials | "3+ years’ experience", "20+ projects delivered" (the featured ones are named; the rest are not) | SELF-REPORTED |
| Education focus | Statistics, econometrics, business statistics and strategy, marketing and marketing research | SELF-REPORTED |
| Availability | Open to remote, full-time and project-based roles; "junior" removed everywhere | Owner's decision |
| Skills | The six groups exactly as supplied. Evidence links: SciPy, Seaborn, OLS and hypothesis testing → `data-science-portfolio`; PyTorch → MNIST explorer. **No public project evidence** for R, MySQL, PostgreSQL, Postman and Plotly: shown in the skill boxes and CV as supplied, and in the Toolkit under "Also used at work or in coursework". Tableau shown as "(learning)" | Mixed: see `skillGroups` in `src/content/site.ts` |

## 0. Update of 2026-11-12 (redesign)

| Item | Now | Status |
|---|---|---|
| Positioning | "Data Scientist building production-grade ML systems." Roles: Data Science · Machine Learning · Applied AI | Owner's brief (EDITORIAL). The evidence behind "production-grade" is the practice shown in the case studies: tests and CI, data-quality gates, Docker release image, read-only APIs. No production deployment at an employer is claimed |
| Telco repo | Renamed to `telco-churn-prediction`; every link uses the new name | VERIFIED |
| Olist | Findings corrected to match `reports/findings.md`: the on-time rate tracks reviews across states (r = 0.78) more than delivery days (r = −0.53); top-15 seller share 17.6% like for like. Live dashboard `https://shavkatjony.github.io/brazilian-e-market/` linked. The dashboard's own headline counts (98,207 orders, 4.12 average review) use different filters from the report, so the site quotes the report's numbers only | VERIFIED |
| DPEC (F1) | Status **In development**: backtested on 37 held-out race weekends, live forecast record not started. Race-pace error after qualifying 0.548% vs 0.589% for the best of five baselines; 79.9% of results inside the 80% ranges; 129 tests in CI; 18 read-only API endpoints; AI assistant exam 50/50. All from `reports/numbers-check.md`, `reports/ai/README.md` and repo greps | VERIFIED. The Render app could not be reached from this environment: **CONFIRM** it is awake |
| Korean invoice scanner | Secondary computer-vision project (`korean-document-scanner`). 12/12 fields on one synthetic, tuning sample; 0.3–0.8 px corner error; labelled as not a held-out score | VERIFIED in the repo. The repo is **private**, so the site shows "code available on request" and no link |
| Seam carving | Archive entry (`seam-carving`), 8 tests | VERIFIED. Repo **private**: no link shown |
| MNIST explorer | Archive entry: PyTorch network served by FastAPI over WebSockets | VERIFIED (`backend/model.py` imports torch) |
| Lotte World | Smaller, academic team project (2023) | VERIFIED; individual role still **CONFIRM** |
| Portrait | Not found. Drive holds only personal phone/Telegram exports, and a photo can't be confirmed as you from its contents, so none was used. The hero shows a designed "SY" monogram until `src/assets/portrait.jpg` is added | **Missing**: supply one (see README) |
| LinkedIn | Still derived from the slug in your post URL; the printed CV now shows the full slug `linkedin.com/in/shavkatjon-yuldashev-10a637277` | **CONFIRM** |
| Violet Haze | No hex was supplied; `#6b5e78` was chosen for dark-mode depth | EDITORIAL |
| Open to work | Shown as open | **CONFIRM** before each deploy |

Still open from section 7: the fabricated metrics page in `command-center/pages/portfolio-professional.html` is public. Remove it before sharing this site.


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
| 1 | `telco-churn-prediction` (was `telco-c-classifier-alias`) | **Feature + case study** (see §7.3b on the stale threshold CSV) | 43 commits. `src/` pipeline (preprocess/train/predict), 4 notebooks, `reports/*.csv`, Streamlit app, real screenshot. Test ROC-AUC **0.842**, recall **0.791** (296/374) from `reports/final_model_metrics.csv`. 5-fold CV table from `reports/model_comparison.csv` |
| 2 | `brazilian-e-market` | **Feature + case study** | 15 commits. 5 SQL files plus 5 notebook queries, SQLite build script, findings report, 5 real figures. Numbers: 99,441 orders; 3.12% repeat rate; review score 4.29 on time vs 1.73 at 8+ days late |
| 3 | `retail-commercial-intelligence` | **Feature + case study** | Python + DuckDB SQL star schema, data-quality gate, exception engine, self-contained HTML dashboard. **Findings use synthetic data** (README says so). Scale test: 59.1M rows, 84 s, 2.6 GB peak, documented in `docs/architecture.md` |
| 4 | `F1-pace-intelligence` (DPEC) | **Feature, labelled "In development"** | Superseded: see section 0 (backtested forecaster, strategy model, API, AI assistant; live record not started) |
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
