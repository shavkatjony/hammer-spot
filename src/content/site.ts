/**
 * Single source of truth for every personal fact, link and project on the site.
 *
 * Rules (see docs/CONTENT_INVENTORY.md for the evidence behind each value):
 *  - Never add a metric that isn't in a committed report, notebook output or README.
 *  - Self-reported facts (from the CV) are marked `source: 'cv'`.
 *  - Anything awaiting confirmation is marked `confirm: true`. It is still rendered,
 *    so check those entries before each deploy.
 *  - Text may contain `inline code` in backticks. It is rendered as <code>, never as raw HTML.
 */

export type Status = 'Complete' | 'Working' | 'In development' | 'Archived';

export interface Link {
  label: string;
  href: string;
  kind: 'repo' | 'demo' | 'doc' | 'profile' | 'email';
}

export const identity = {
  name: 'Shavkatjon Yuldashev',
  handle: 'SHAVKATJON',
  roles: ['Data Science', 'Machine Learning', 'Applied AI'],
  statement:
    'I turn raw data into models, evidence and small working systems. I measure them honestly and write down what held up and what didn’t.',
  location: {
    city: 'Busan',
    country: 'South Korea',
    coords: '35.18° N · 129.08° E',
  },
  availability: {
    open: true, // CONFIRM before each deploy
    short: 'Open to work',
    detail:
      'Open to junior, internship and research roles in Korea, and with international, English-speaking teams.',
  },
  // Set to { src, alt, width, height } once a real portrait is supplied (put it in /public/images).
  portrait: null as null | { src: string; alt: string; width: number; height: number },
} as const;

export const email = 'shavkatjon.yuldashev.0411@gmail.com';

/** Every outbound professional link lives here; components never hard-code URLs. */
export const social = {
  github: {
    label: 'GitHub',
    handle: 'shavkatjony',
    href: 'https://github.com/shavkatjony',
    confirm: false,
  },
  linkedin: {
    label: 'LinkedIn',
    handle: 'shavkatjon-yuldashev',
    // Derived from the slug in Shavkatjon's own LinkedIn post URL. CONFIRM.
    href: 'https://www.linkedin.com/in/shavkatjon-yuldashev-10a637277/',
    confirm: true,
  },
  email: {
    label: 'Email',
    handle: email,
    href: `mailto:${email}`,
    confirm: false,
  },
} as const;

export const primarySocial = [social.github, social.linkedin, social.email];

export const resume = {
  // Print-ready résumé page generated from this file (no phone number by design).
  page: 'resume/',
  // Optional static PDF in /public. Set to null to hide the download link.
  pdf: 'Shavkatjon-Yuldashev-CV.pdf' as string | null,
};

export const education = [
  {
    school: 'Dong-A University',
    place: 'Busan, South Korea',
    degree: 'Bachelor of Integrated Business Management (IBM)',
    year: '2026', // CONFIRM exact graduation month
    focus: 'Econometrics, business statistics and strategy, marketing research',
    source: 'cv',
    confirm: true,
  },
];

export const experience = [
  {
    org: 'KVENTS',
    place: 'Chust, Namangan, Uzbekistan · remote',
    role: 'Data & Business Analyst',
    period: 'Nov 2024 – Dec 2025',
    points: [
      'Digitised sales, inventory and expense records into structured datasets in Excel and Google Sheets.',
      'Business and financial analysis of sales, inventory and costs.',
      'Time-series forecasts of sales and expenses to plan resources.',
    ],
    source: 'cv',
    confirm: true,
  },
];

export const languages = [
  { name: 'Uzbek', level: 'native' },
  { name: 'English', level: 'fluent' },
  { name: 'Turkish', level: 'fluent' },
  { name: 'Korean', level: 'beginner, studying' },
];

export const seeking = [
  'Junior data scientist or data analyst roles',
  'Machine-learning and analytics internships',
  'Research-assistant positions in applied statistics or ML',
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type FigureId =
  | 'telco-app'
  | 'telco-models'
  | 'telco-thresholds'
  | 'telco-confusion'
  | 'olist-reviews'
  | 'olist-states'
  | 'olist-cohorts'
  | 'retail-pipeline'
  | 'retail-tower'
  | 'retail-scale'
  | 'dpec-pipeline'
  | 'dpec-rules';

export interface CaseSection {
  id: string;
  title: string;
  body: string[];
  list?: string[];
  figure?: FigureId;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  year: string;
  status: Status;
  statusNote?: string;
  problem: string;
  contribution: string;
  methods: string[];
  stack: string[];
  result: string;
  metrics: { value: string; label: string }[];
  links: Link[];
  plate: FigureId;
  theme?: 'dark';
  caseStudy: {
    summary: string;
    sections: CaseSection[];
  };
}

const GH = 'https://github.com/shavkatjony';

export const projects: Project[] = [
  {
    slug: 'telco-churn',
    index: '01',
    title: 'Telco Customer Churn',
    kicker: 'Classification · retention',
    year: '2026',
    status: 'Complete',
    problem:
      'Which customers are about to cancel, and how can a probability become a retention worklist instead of a bare number?',
    contribution:
      'Built the whole pipeline myself: cleaning, feature engineering, stratified cross-validation of three classifiers, threshold analysis, one persisted scikit-learn Pipeline, and a Streamlit app that turns a score into a risk band and an action.',
    methods: ['Logistic regression', 'Random forest', 'Gradient boosting', 'Stratified 5-fold CV', 'Threshold analysis'],
    stack: ['Python', 'pandas', 'scikit-learn', 'joblib', 'Streamlit'],
    result:
      'Held-out test ROC-AUC 0.842 and recall 0.791: 296 of 374 churners caught. Chosen over a random forest with higher accuracy that missed more than half of them.',
    metrics: [
      { value: '0.842', label: 'Test ROC-AUC' },
      { value: '296 / 374', label: 'Churners caught (recall 0.791)' },
      { value: '7,043', label: 'Customers in the dataset' },
    ],
    links: [
      { label: 'Source code', href: `${GH}/telco-c-classifier-alias`, kind: 'repo' },
      { label: 'Live app (Streamlit)', href: 'https://shavkh.streamlit.app/', kind: 'demo' },
      { label: 'Findings report', href: `${GH}/telco-c-classifier-alias/blob/main/reports/findings.md`, kind: 'doc' },
    ],
    plate: 'telco-app',
    caseStudy: {
      summary:
        'An end-to-end churn classifier where the deciding question was not “which model is most accurate?” but “which model misses the fewest customers who are about to leave?”',
      sections: [
        {
          id: 'problem',
          title: 'Problem and motivation',
          body: [
            'A telecom carrier loses recurring revenue with every cancellation, and winning a customer back costs more than keeping one. The retention team needs a ranked list of who to call, early enough to act.',
            'A missed churner is lost revenue. A false alarm costs one unnecessary retention call. That asymmetry set the selection criteria before any model was trained: ROC-AUC and churn recall first, accuracy last.',
          ],
        },
        {
          id: 'data',
          title: 'Data sources and data quality',
          body: [
            'IBM Telco Customer Churn dataset: 7,043 customers with demographics, services, contract and billing. 26.5% churned, so the classes are imbalanced. A model that predicts “nobody leaves” scores 73.5% accuracy and catches no one.',
            'One real data-quality bug: `TotalCharges` was stored as text, with 11 blank values. Every blank belonged to a customer with `tenure = 0`. They are legitimately $0, not missing, so they were set to zero instead of being dropped or imputed.',
          ],
        },
        {
          id: 'architecture',
          title: 'Architecture and pipeline',
          body: [
            'Every transformation lives inside one scikit-learn `Pipeline` (clean and engineer → scale and one-hot encode → classifier). The object saved to disk is the same object that serves predictions, so training and inference cannot drift apart.',
          ],
          list: [
            '`src/preprocess.py`: loading, row-local cleaning, feature engineering, `ColumnTransformer`',
            '`src/train.py`: stratified 80/20 split, 5-fold CV, model comparison, final fit, artifact saving',
            '`src/predict.py`: input validation, probability, risk band, suggested action',
            '`app/streamlit_app.py`: a form that calls `predict.py` on the saved pipeline',
          ],
          figure: 'telco-app',
        },
        {
          id: 'method',
          title: 'Feature engineering and methodology',
          body: [
            'Two engineered features: `num_addon_services` (how many optional services a customer has) and `tenure_group` (tenure bands). Cleaning is deterministic and row-local, so it learns nothing from the data and cannot leak test information. Scaling and encoding are fitted inside each CV fold.',
            'All three models use `class_weight="balanced"` to counter the 26.5% minority class, rather than oversampling.',
          ],
        },
        {
          id: 'models',
          title: 'Models',
          body: [
            'Three candidates, compared with 5-fold stratified cross-validation on the training split: logistic regression as an interpretable linear baseline, a random forest, and histogram gradient boosting.',
            'The random forest had the highest accuracy and the lowest recall, catching fewer than half of the churners. Logistic regression won on both ROC-AUC and recall, and it is also the easiest to explain.',
          ],
          figure: 'telco-models',
        },
        {
          id: 'evaluation',
          title: 'Evaluation and validation',
          body: [
            'The 20% test split was used once, after model selection. On it, logistic regression scored ROC-AUC 0.842, recall 0.791, precision 0.498, F1 0.612 and accuracy 0.733. It recovered 296 of 374 churners at the cost of 298 false alarms.',
            'The app predicts churn at a probability of 0.50 and adds business risk bands at 0.35 (medium) and 0.60 (high), so the retention team gets a ranked worklist rather than a yes/no.',
          ],
          figure: 'telco-confusion',
        },
        {
          id: 'results',
          title: 'Results and limitations',
          body: [
            'The strongest churn associations are month-to-month contracts, short tenure, high-priced fibre-optic plans, electronic-check payment, and having no tech-support or online-security add-ons. These are associations, not causes. They are hypotheses for a retention test, not guarantees.',
          ],
          list: [
            'Snapshot data: the model predicts whether a customer churns, not when.',
            'The risk-band thresholds are business choices and should follow retention capacity and customer value.',
            'A production system would need monitoring for data drift and performance decay.',
          ],
        },
        {
          id: 'next',
          title: 'What I would improve next',
          body: [],
          list: [
            'Check probability calibration (a reliability curve) before presenting risk bands as percentages.',
            'Pick the threshold from an explicit cost matrix (retention cost against customer value) instead of 0.50.',
            'Regenerate the threshold sweep for the shipped class-weighted pipeline. The committed `threshold_analysis.csv` comes from the earlier notebook model (below).',
            'Add tests for `predict.py` input validation, and correct the README label that calls the gradient-boosting model “XGBoost”.',
          ],
          figure: 'telco-thresholds',
        },
      ],
    },
  },
  {
    slug: 'olist-delivery',
    index: '02',
    title: 'Olist Marketplace: Delivery & Loyalty',
    kicker: 'SQL-first analytics',
    year: '2026',
    status: 'Complete',
    problem:
      'Across ~99,000 orders on a Brazilian marketplace, do customers come back, what drives bad reviews, and where does delivery break down?',
    contribution:
      'Loaded the 9 raw tables into SQLite, wrote the analysis in SQL (CTEs, window functions, cohort logic), and turned five business questions into charts, findings and recommendations.',
    methods: ['Recency segmentation', 'Cohort retention', 'Delivery-band analysis', 'Seller concentration'],
    stack: ['SQL (SQLite)', 'Python', 'pandas', 'matplotlib'],
    result:
      'Only 3.12% of customers ever order again. On-time orders average 4.29 stars; orders 8+ days late average 1.73. The slowest state waits 29.4 days against a 12.6-day national average.',
    metrics: [
      { value: '3.12%', label: 'Customers who reorder' },
      { value: '4.29 → 1.73', label: 'Avg. stars, on time → 8+ days late' },
      { value: '99,441', label: 'Orders analysed' },
    ],
    links: [
      { label: 'Source code', href: `${GH}/brazilian-e-market`, kind: 'repo' },
      { label: 'Findings report', href: `${GH}/brazilian-e-market/blob/main/reports/findings.md`, kind: 'doc' },
      { label: 'Analysis notebook', href: `${GH}/brazilian-e-market/blob/main/notebooks/analysis.ipynb`, kind: 'doc' },
    ],
    plate: 'olist-reviews',
    caseStudy: {
      summary:
        'A deliberately model-free analysis: SQL does the heavy lifting, and the output is a short list of decisions, not a dashboard.',
      sections: [
        {
          id: 'problem',
          title: 'Problem and motivation',
          body: ['Five operational questions about the Olist marketplace:'],
          list: [
            'Retention: how loyal is the customer base, and how many have gone quiet?',
            'Delivery vs. satisfaction: do late deliveries lower review scores?',
            'Seller performance: is revenue concentrated in a few sellers?',
            'Cohorts: do customers acquired in different months return at different rates?',
            'Logistics: which regions wait the longest?',
          ],
        },
        {
          id: 'data',
          title: 'Data sources and data quality',
          body: [
            'The public Olist Brazilian E-Commerce dataset: 9 tables, Sept 2016 – Oct 2018, 99,441 orders and 96,096 customers. Several definitions had to be fixed before any number meant anything:',
          ],
          list: [
            'Delivery metrics use only orders with `order_status = \'delivered\'` and a non-null delivery date. Otherwise NULLs corrupt every average.',
            'Customers are counted by `customer_unique_id` (the person), not the per-order `customer_id`.',
            'Seller revenue is item price, not payment totals, so shared orders aren’t double-counted.',
            'Reviews are averaged per order first, because a few orders have more than one.',
            'Recency is measured against the last date in the data (Oct 2018), not today.',
          ],
        },
        {
          id: 'architecture',
          title: 'Architecture and pipeline',
          body: [
            '`src/create_db.py` builds a SQLite database from the raw CSVs. Both the CSVs and the database are gitignored and can be rebuilt. Six numbered SQL files hold the exploration and the five questions. Single-query files in `sql/notebook/` feed each chart, and the notebook adds the narrative: question → SQL → chart → insight → recommendation.',
          ],
        },
        {
          id: 'method',
          title: 'Methodology',
          body: [
            'Customers are segmented by recency (Active within 90 days, At Risk, Churned). Delivered orders are banded by days late with `CASE`. Monthly acquisition cohorts are tracked for repeat purchases, seller GMV shares are ranked, and states are compared on average delivery time.',
          ],
        },
        {
          id: 'models',
          title: 'Analytical methods',
          body: [
            'Descriptive SQL, segmentation and cohort analysis, with no machine learning, on purpose. The questions are about what happened and where, and a model would have added complexity without changing the decisions.',
          ],
          figure: 'olist-reviews',
        },
        {
          id: 'evaluation',
          title: 'Validation',
          body: [
            'Counts are reconciled, not assumed. For example, the segments cover 94,989 customers rather than 96,096 because customers with only cancelled or unavailable orders are excluded. The 100% retention spike in one 2016 cohort comes from a single customer and is disregarded.',
          ],
          figure: 'olist-cohorts',
        },
        {
          id: 'results',
          title: 'Results and limitations',
          body: [
            'The marketplace is structurally one-time-purchase: 3.12% of customers return, and 70.7% are already At Risk or Churned. Review scores fall step by step with lateness. Delivery collapses in remote northern states: Roraima 29.4 days, Amapá 27.2, Amazonas 26.4.',
            'So the first order is the retention strategy, and northern logistics is a last-mile problem, not a nationwide one.',
          ],
          list: [
            'No acquisition-cost data, so “retention is low” is a strong signal but not a full ROI case.',
            'Lateness and region are tangled together. The drop in review scores is an association, not a measured causal effect.',
            'Review scores are voluntary, which brings selection bias.',
          ],
          figure: 'olist-states',
        },
        {
          id: 'next',
          title: 'What I would improve next',
          body: [],
          list: [
            'Estimate the lateness effect within state and product category to separate it from region.',
            'Put a revenue figure on late first orders, to turn the finding into a business case.',
            'Add data tests (row counts, unique keys, null checks) that run with the SQL.',
          ],
        },
      ],
    },
  },
  {
    slug: 'retail-intelligence',
    index: '03',
    title: 'Retail Commercial Intelligence',
    kicker: 'Data modelling · BI',
    year: '2026',
    status: 'Working',
    statusNote: 'Pipeline complete · findings from synthetic sample',
    problem:
      'Turn years of item × store × day retail data into a governed model that answers three questions: what changed, why, and where should management look first?',
    contribution:
      'Designed a star schema with an explicit grain, staged DuckDB SQL, a data-quality build gate, a metrics engine with a transparent priority score, and a self-contained three-page HTML dashboard.',
    methods: ['Star schema', 'Like-for-like YoY', 'Contribution analysis', 'Exception scoring', 'HHI concentration'],
    stack: ['Python', 'DuckDB SQL', 'Parquet', 'Make', 'Tableau (guide)'],
    result:
      'At full M5 shape the build processed 59.1M rows end to end in 84 s, with peak memory cut from 8.8 GB to 2.6 GB. The business findings shown are illustrative: the repo runs on a synthetic, M5-shaped sample.',
    metrics: [
      { value: '59.1M', label: 'Rows in the full-shape stress test' },
      { value: '8.8 → 2.6 GB', label: 'Peak memory, first → final build' },
      { value: '8', label: 'Data-quality checks gating the build' },
    ],
    links: [
      { label: 'Source code', href: `${GH}/retail-commercial-intelligence`, kind: 'repo' },
      { label: 'Live HTML dashboard', href: 'https://shavkatjony.github.io/retail-commercial-intelligence/dashboard/', kind: 'demo' },
      { label: 'Architecture notes', href: `${GH}/retail-commercial-intelligence/blob/main/docs/architecture.md`, kind: 'doc' },
    ],
    plate: 'retail-pipeline',
    caseStudy: {
      summary:
        'A data-modelling project where the hard part was honesty and scale: stating the grain, gating the build on data quality, and fitting the real data size on an 8 GB laptop.',
      sections: [
        {
          id: 'problem',
          title: 'Problem and motivation',
          body: [
            'Commercial and category leadership asks one question: what changed in the business, why, and what should we do about it? The goal was a triage list ranked by impact, not a wall of charts. Scope is descriptive and diagnostic by design, with no forecasting.',
          ],
        },
        {
          id: 'data',
          title: 'Data sources and data quality',
          body: [
            'The model is built for the shape of the M5 (Walmart) dataset: daily unit sales, weekly prices and an event/SNAP calendar across 3 states and 10 stores (30,490 item-store series in the real data). The repo ships a synthetic, M5-shaped generator so the pipeline runs in seconds without downloads. Switching to real data is one config change.',
            'Data quality gates the build. Eight checks run on every build: unique grain, referential integrity, impossible values and null keys fail the build; price coverage and calendar continuity only warn, because a missing weekly price in M5 can mean the item was legitimately off sale.',
          ],
        },
        {
          id: 'architecture',
          title: 'Architecture and pipeline',
          body: [
            'Raw CSVs are reshaped from wide to long in Python, staged as Parquet, and modelled in DuckDB SQL (staging → dimensions → facts → marts). Python then computes metrics and writes the extracts that both dashboards read.',
          ],
          figure: 'retail-pipeline',
        },
        {
          id: 'method',
          title: 'Modelling decisions',
          body: [
            'Every table states its grain. `fact_daily_sales` is one row per item × store × date, and `fact_weekly_price` one row per item × store × week. Units × price is labelled Estimated Sales Value, not revenue, because M5 has no refunds, tax or cost of goods.',
          ],
        },
        {
          id: 'models',
          title: 'Analytical methods',
          body: [
            'Growth is like-for-like against the same window a year earlier. Contribution analysis splits the top-line change by category and store. The exception engine gives every store × category at most one signal (growth, deterioration or price risk) and ranks it with a transparent score: Impact × Magnitude × Confidence. Concentration is measured with an adaptive top-k share and the HHI. Price–demand links are reported as association only: “units fell alongside a price rise”.',
          ],
        },
        {
          id: 'evaluation',
          title: 'Evaluation: measured at real size',
          body: [
            'The pipeline was stress-tested at full M5 shape: 30,450 series × 1,941 days = 59.1M rows. The first version peaked at 8.8 GB. Four changes, each measured on its own, brought it to 2.6 GB:',
          ],
          list: [
            'Stream the wide-to-long reshape store by store instead of materialising 59M rows.',
            'Categorical encoding for every text column. Ingestion alone dropped from 4.9 GB to 1.8 GB.',
            'Run ingestion in its own process, so its memory is returned before DuckDB starts.',
            'Cap DuckDB at 1.5 GB and let it spill to disk. This cost no wall time.',
          ],
          figure: 'retail-scale',
        },
        {
          id: 'results',
          title: 'Results and limitations',
          body: [
            'The mechanics are real; the numbers in the repo are not business findings. On the synthetic sample, the engine flags one category as driving about 86% of the value change and surfaces a price-risk watch list. Both are illustrations of what the system produces.',
          ],
          list: [
            'Findings must be regenerated from the real Kaggle M5 files before they can be presented as insight.',
            'The Tableau Public edition is specified in a build guide but not published yet. The HTML edition is live.',
          ],
          figure: 'retail-tower',
        },
        {
          id: 'next',
          title: 'What I would improve next',
          body: [],
          list: [
            'Run the pipeline on the real M5 files and rewrite the findings from that run.',
            'Publish the Tableau Public version and link it.',
            'Add unit tests for the metric functions (growth windows, contribution, priority score).',
          ],
        },
      ],
    },
  },
  {
    slug: 'f1-pace-intelligence',
    index: '04',
    title: 'DPEC: Formula One Pace Intelligence',
    kicker: 'Forecasting under uncertainty · Formula 1',
    year: '2026',
    status: 'In development',
    statusNote: 'Ingestion layer built and tested · forecasting not started',
    problem:
      'After each practice session, what can we reliably infer about Sunday’s race pace, how sure can we be, and how do we prove it afterwards?',
    contribution:
      'Wrote the plan, rules and architecture decisions, then built the first layer: a FastF1 ingestion CLI. It saves each session’s raw tables as Parquet with a SHA-256 manifest, skips sessions already saved, and never requests one that hasn’t happened yet.',
    methods: ['Walk-forward validation (planned)', 'Calibrated intervals (planned)', 'Append-only forecast ledger (planned)'],
    stack: ['Python 3.12', 'FastF1', 'pandas', 'PyArrow / Parquet', 'DuckDB', 'Typer', 'pytest', 'GitHub Actions'],
    result:
      'Working today: idempotent ingestion of seven raw tables per session, covered by 17 tests that run in CI on every push. Not built yet: the forecasting models, their calibration and the public ledger.',
    metrics: [
      { value: '7', label: 'Raw tables saved per session' },
      { value: '17', label: 'Tests in CI on every push' },
      { value: '0', label: 'Forecast models so far (honestly)' },
    ],
    links: [
      { label: 'Source code', href: `${GH}/F1-pace-intelligence`, kind: 'repo' },
      { label: 'Rules & purpose', href: `${GH}/F1-pace-intelligence/blob/main/docs/rules/00-rules-and-purpose.md`, kind: 'doc' },
      { label: 'Decision records', href: `${GH}/F1-pace-intelligence/tree/main/docs/decisions`, kind: 'doc' },
    ],
    plate: 'dpec-pipeline',
    theme: 'dark',
    caseStudy: {
      summary:
        'A long-running forecasting project built in the open. It publishes forecasts before each session and scores them afterwards. This page describes what exists today and what is still only a plan.',
      sections: [
        {
          id: 'problem',
          title: 'Problem and motivation',
          body: [
            'A team’s performance department needs to know, after every session of a race weekend, how fast each car will really be on Sunday, how sure that estimate is, and why. DPEC is my attempt at that question with public data only, under one constraint: every forecast is frozen before the session it predicts and scored afterwards.',
          ],
        },
        {
          id: 'data',
          title: 'Data sources and data quality',
          body: [
            'FastF1 provides laps, results, car telemetry, positions, weather, race-control messages and track status for 2022–2026. The project rules govern how that data may be used:',
          ],
          list: [
            'Hidden values such as fuel load, setup, tyre temperatures and ERS state are never presented as observed. Where they are estimated, they are labelled as estimated.',
            'Every column is tagged `observed`, `derived`, `estimated` or `unknown`.',
            'Raw data is never edited. Cleaning happens in later layers, so everything can be rebuilt from zero.',
          ],
          figure: 'dpec-rules',
        },
        {
          id: 'architecture',
          title: 'Architecture and pipeline',
          body: [
            'A reusable Telemetry Core that imports nothing F1-specific, with plug-in modules for forecasting, attribution and future scenarios. Storage is partitioned Parquet with DuckDB as an embedded warehouse, an architecture decision recorded in ADR 0002. All settings, including seasons, the adopted team and the 5 m distance grid, live in one YAML file.',
          ],
          figure: 'dpec-pipeline',
        },
        {
          id: 'method',
          title: 'Methodology (planned)',
          body: [
            'Laps will be aligned on a common distance axis at 5 m spacing, with quality flags attached before any analysis. A naive baseline comes first, and no model is reported without one beside it.',
          ],
        },
        {
          id: 'models',
          title: 'Models (planned)',
          body: [
            'The simplest method that answers each question correctly. Validation is walk-forward by race weekend, never random lap splits, which would leak the future. Every forecast carries an uncertainty interval that is checked for calibration.',
          ],
        },
        {
          id: 'evaluation',
          title: 'Evaluation and validation',
          body: [
            'For forecasts: an append-only ledger, written before each session and scored after the race. A model that loses to the baseline is reported as losing.',
            'For the code that exists now: 17 pytest tests cover configuration, paths, the Parquet writer and the ingest CLI. `ruff` and the tests run in GitHub Actions on every push.',
          ],
        },
        {
          id: 'results',
          title: 'Results and limitations',
          body: [
            'There are no forecast results yet. The ingestion layer handles the real-world failures it was built for: on a FastF1 rate limit it stops cleanly and keeps everything already saved; one bad session doesn’t stop the rest; reruns skip finished work.',
            'Public data has limits. Per a FastF1 maintainer note cited in the project rules, F1 removed active-aero and ERS state from the public feed in 2026, so those effects can only be estimated.',
          ],
        },
        {
          id: 'next',
          title: 'What I’m building next',
          body: [],
          list: [
            'The data-quality and alignment layer: checks, flags, and laps on a common distance axis.',
            'A first baseline race-pace forecast with walk-forward evaluation.',
            'The public, append-only forecast ledger.',
          ],
        },
      ],
    },
  },
];

/** Smaller pieces of evidence: listed, not featured. */
export const archive = [
  {
    title: 'Lotte World Busan: visitor review mining',
    meta: 'Dong-A University · team project · 2023',
    text: '887 multilingual Google Maps reviews, analysed with KH Coder keyword frequency, a co-occurrence network and descriptive statistics by experience dimension. Pricing & discounts scored lowest (mean 1.80 / 5).',
    href: `${GH}/lotte-world-busan-santiment-analyses`,
    confirm: true, // CONFIRM individual role within the team
  },
  {
    title: 'Statistical modelling notebooks',
    meta: 'Foundations · 2026',
    text: 'OLS with dummy variables, a log-linear used-car price model (test R² 0.773; 5-fold CV mean 0.749 ± 0.024) and a logistic classifier for bank marketing (test accuracy 86.0%), each with diagnostics.',
    href: `${GH}/data-science-portfolio`,
    confirm: false,
  },
];

/* ------------------------------------------------------------------ */
/* Field notes: condensed from project documentation, each linked     */
/* ------------------------------------------------------------------ */

export const notes = [
  {
    id: 'accuracy-headline',
    category: 'Machine learning',
    title: 'Accuracy is the wrong headline for churn',
    text: 'With 26.5% churners, predicting “nobody leaves” scores 73.5% accuracy and catches no one. My random forest had the best accuracy (0.788) and the worst recall (0.465). Pick the metric that prices a miss correctly.',
    source: { label: 'telco · reports/findings.md', href: `${GH}/telco-c-classifier-alias/blob/main/reports/findings.md` },
  },
  {
    id: 'blank-is-not-missing',
    category: 'Data quality',
    title: 'Blank is not always missing',
    text: 'Eleven blank `TotalCharges` values all belonged to customers with zero tenure. They are $0, not unknown. Dropping or imputing them would have invented a problem.',
    source: { label: 'telco · src/preprocess.py', href: `${GH}/telco-c-classifier-alias/blob/main/src/preprocess.py` },
  },
  {
    id: 'sixty-million-rows',
    category: 'Engineering & reproducibility',
    title: 'Fitting 59 million rows on an 8 GB laptop',
    text: 'Peak memory fell from 8.8 GB to 2.6 GB by streaming the reshape, using categoricals, isolating ingestion in its own process and capping DuckDB. Each change was measured on its own before keeping it.',
    source: { label: 'retail · docs/architecture.md', href: `${GH}/retail-commercial-intelligence/blob/main/docs/architecture.md` },
  },
  {
    id: 'split-by-weekend',
    category: 'Formula 1 analytics',
    title: 'Split by race weekend, never by lap',
    text: 'Random lap-level splits leak the future into training. DPEC validates forward in time by race weekend, puts a naive baseline beside every model, and reports a model that loses to it as losing.',
    source: { label: 'dpec · docs/rules/00-rules-and-purpose.md', href: `${GH}/F1-pace-intelligence/blob/main/docs/rules/00-rules-and-purpose.md` },
  },
  {
    id: 'parquet-duckdb',
    category: 'Open-source tools',
    title: 'Parquet + DuckDB as a laptop warehouse',
    text: 'Columnar files plus an embedded SQL engine replace a database server for analytical work. I made this choice in two projects and wrote it down as a decision record, rejected options included.',
    source: { label: 'dpec · docs/decisions/0002-storage.md', href: `${GH}/F1-pace-intelligence/blob/main/docs/decisions/0002-storage.md` },
  },
  {
    id: 'association',
    category: 'Statistics',
    title: '“Alongside”, not “because of”',
    text: 'Observational retail data can show that demand fell while price rose. It can’t show that the price caused it. The metrics engine’s reporting rule is written into the code: report association, never proven causation.',
    source: { label: 'retail · src/metrics.py', href: `${GH}/retail-commercial-intelligence/blob/main/src/metrics.py` },
  },
  {
    id: 'ai-plumbing',
    category: 'Practical AI',
    title: 'AI builds the plumbing; I build the thinking',
    text: 'In DPEC, AI tools write adapters, infrastructure and scaffolding. Schema decisions, quality rules, every model and every evaluation are mine. The split is written into the project rules so it can’t drift.',
    source: { label: 'dpec · rules §3, effort rules', href: `${GH}/F1-pace-intelligence/blob/main/docs/rules/00-rules-and-purpose.md` },
  },
];

/* ------------------------------------------------------------------ */
/* Toolkit                                                            */
/* ------------------------------------------------------------------ */

export const toolkit = {
  use: [
    { name: 'Python · pandas · NumPy', why: 'The working language of every project here.', href: 'https://pandas.pydata.org/docs/', evidence: ['telco-churn', 'olist-delivery', 'retail-intelligence', 'f1-pace-intelligence'] },
    { name: 'SQL: SQLite & DuckDB', why: 'CTEs, window functions, cohorts, and a star schema with stated grain.', href: 'https://duckdb.org/docs/', evidence: ['olist-delivery', 'retail-intelligence'] },
    { name: 'scikit-learn', why: 'Pipelines that bundle preprocessing with the model, plus stratified CV.', href: 'https://scikit-learn.org/stable/', evidence: ['telco-churn'] },
    { name: 'statsmodels', why: 'OLS and logit with readable diagnostics, for inference rather than leaderboard scores.', href: 'https://www.statsmodels.org/stable/', evidence: [], repo: { label: 'Modelling notebooks', href: `${GH}/data-science-portfolio` } },
    { name: 'Parquet / PyArrow', why: 'Columnar storage so raw data is saved once and re-read fast.', href: 'https://arrow.apache.org/docs/python/', evidence: ['retail-intelligence', 'f1-pace-intelligence'] },
    { name: 'pytest · ruff · uv · GitHub Actions', why: 'Tests, linting, locked environments and CI on every push.', href: 'https://docs.pytest.org/', evidence: ['f1-pace-intelligence'] },
    { name: 'Streamlit', why: 'The quickest honest way to put a model in someone’s hands.', href: 'https://docs.streamlit.io/', evidence: ['telco-churn'] },
    { name: 'FastF1', why: 'Python access to F1 timing, telemetry and session data.', href: 'https://docs.fastf1.dev/', evidence: ['f1-pace-intelligence'] },
    { name: 'KH Coder', why: 'Keyword frequency and co-occurrence networks for text mining.', href: 'https://khcoder.net/en/', evidence: [], repo: { label: 'Lotte World review mining', href: `${GH}/lotte-world-busan-santiment-analyses` } },
  ],
  learning: [
    { name: 'Tableau', why: 'The retail dashboard has a written build spec; publishing it is next.', href: 'https://help.tableau.com/' },
    { name: 'FastAPI', why: 'For serving models behind a typed API. Not yet in a public repo.', href: 'https://fastapi.tiangolo.com/' },
    { name: 'dbt & MLflow', why: 'On the DPEC plan for tested SQL models and experiment tracking.', href: 'https://docs.getdbt.com/' },
    { name: 'R', why: 'From university statistics coursework.', href: 'https://www.r-project.org/' },
  ],
  studied: [
    { name: 'f1-race-replay by Tom Shaw', why: 'Forked to study how a Python app replays FastF1 telemetry. The project is his; my own F1 work is DPEC.', href: 'https://github.com/IAmTomShaw/f1-race-replay' },
    { name: 'DuckDB', why: 'Profiled its memory cap and disk spilling while fitting the 59M-row retail build.', href: 'https://github.com/duckdb/duckdb' },
    { name: 'FastF1', why: 'Follow its maintainer notes; one (removed ERS and active-aero fields) is written into DPEC’s data rules.', href: 'https://github.com/theOehrly/Fast-F1' },
  ],
  datasets: [
    { name: 'IBM Telco Customer Churn', href: 'https://www.kaggle.com/datasets/blastchar/telco-customer-churn' },
    { name: 'Olist Brazilian E-Commerce', href: 'https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce' },
    { name: 'M5 Forecasting (Walmart)', href: 'https://www.kaggle.com/c/m5-forecasting-accuracy/data' },
    { name: 'F1 timing data via FastF1', href: 'https://docs.fastf1.dev/' },
  ],
};

export const meta = {
  title: 'SHAVKATJON | Shavkatjon Yuldashev, Data Science & Machine Learning',
  description:
    'Shavkatjon Yuldashev: early-career data scientist in Busan, South Korea. Python, SQL, statistics and machine learning, with honest evaluations. Selected work, case studies and field notes.',
  updated: '2026-10-12',
};
