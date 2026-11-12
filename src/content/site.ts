/**
 * Single source of truth for every personal fact, link and project on the site.
 *
 * Rules (evidence behind each value: docs/CONTENT_INVENTORY.md):
 *  - Never add a metric that isn't in a committed report, README, notebook output or test file.
 *  - `confirm: true` marks a value still awaiting the owner's confirmation; it is rendered,
 *    so check those entries before each deploy.
 *  - Text may contain `inline code` in backticks. It renders as <code>, never as raw HTML.
 */

export type Status = 'Complete' | 'Working' | 'In development' | 'Archived';
export type Tone = 'steel' | 'willow' | 'brick' | 'coffee' | 'yale' | 'gold';

export interface Link {
  label: string;
  href: string;
  kind: 'repo' | 'demo' | 'doc' | 'data' | 'profile' | 'email';
}

export const identity = {
  name: 'Shavkatjon Yuldashev',
  firstName: 'Shavkatjon',
  lastName: 'Yuldashev',
  handle: 'SHAVKATJON',
  title: 'Data Scientist',
  positioning: 'Data Scientist building production-grade ML systems.',
  roles: ['Data Science', 'Machine Learning', 'Applied AI'],
  statement:
    'I take raw, messy data through tested pipelines to evaluated models and tools people can use, and I publish the numbers, including where a model loses.',
  location: {
    city: 'Busan',
    country: 'South Korea',
    coords: '35.18° N · 129.08° E',
  },
  availability: {
    open: true, // CONFIRM before each deploy
    short: 'Open to work',
    detail: 'Junior data science and ML roles, in Korea or with international English-speaking teams.',
  },
} as const;

/* The portrait is picked up automatically from src/assets/portrait.{jpg,jpeg,png,webp,avif}. */

export const email = 'shavkatjon.yuldashev.0411@gmail.com';

/** Every outbound professional link lives here; components never hard-code URLs. */
export const social = {
  github: { label: 'GitHub', handle: 'shavkatjony', href: 'https://github.com/shavkatjony', confirm: false },
  linkedin: {
    label: 'LinkedIn',
    handle: 'shavkatjon-yuldashev-10a637277', // the real profile slug: never print a shortened one
    // Derived from the slug in Shavkatjon's own LinkedIn post URL. CONFIRM.
    href: 'https://www.linkedin.com/in/shavkatjon-yuldashev-10a637277/',
    confirm: true,
  },
  email: { label: 'Email', handle: email, href: `mailto:${email}`, confirm: false },
} as const;

export const resume = {
  page: 'resume/', // print-ready page generated from this file (no phone number by design)
  pdf: 'Shavkatjon-Yuldashev-CV.pdf' as string | null,
};

export const education = [
  {
    school: 'Dong-A University',
    place: 'Busan, South Korea',
    degree: 'Bachelor of Integrated Business Management (IBM)',
    year: '2026',
    focus: 'Econometrics, business statistics and strategy, marketing research',
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
  },
];

export const languages = [
  { name: 'Uzbek', level: 'native' },
  { name: 'English', level: 'fluent' },
  { name: 'Turkish', level: 'fluent' },
  { name: 'Korean', level: 'beginner' },
];

export const targetRoles = [
  'Junior data scientist',
  'Junior machine-learning engineer',
  'Data analyst with modelling scope',
  'ML and analytics internships',
  'Research assistant in applied statistics or ML',
];

export const interests = [
  'Forecasting under uncertainty, with ranges that are checked',
  'Model evaluation: baselines, leakage, calibration',
  'Data quality and reproducible pipelines',
  'Applied AI that is grounded in tools and graded like software',
  'Classical computer vision',
  'Sports analytics, especially Formula 1',
];

/**
 * The hero's "My stack" panel: only what the projects below actually use, grouped so a recruiter
 * can scan it in seconds. Evidence for each item: the toolkit's "Shown in" links and the case studies.
 * `flow: true` renders the items as ordered steps (→) instead of a list (·).
 */
export const heroStack: { title: string; items: string[]; flow?: boolean }[] = [
  { title: 'Languages & data', items: ['Python', 'SQL', 'pandas', 'NumPy', 'DuckDB', 'SQLite', 'Parquet'] },
  { title: 'ML libraries', items: ['scikit-learn', 'statsmodels', 'PyTorch'] },
  {
    title: 'ML models',
    items: ['Logistic regression', 'Random forest', 'Gradient boosting', 'Linear regression (WLS)', 'Neural network (MLP)'],
  },
  {
    title: 'ML process',
    flow: true,
    items: ['Data cleaning', 'Feature engineering', 'Cross-validation', 'Baselines', 'Evaluation', 'Backtesting', 'Deployment'],
  },
  { title: 'Deploy & MLOps', items: ['FastAPI', 'Docker', 'Streamlit', 'pytest', 'GitHub Actions CI', 'Git'] },
  { title: 'Analytics, vision & AI', items: ['matplotlib', 'd3.js', 'OpenCV', 'Tesseract OCR', 'LLM tool use (Claude API, Ollama)'] },
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type FigureId =
  | 'telco-app'
  | 'telco-models'
  | 'telco-confusion'
  | 'telco-thresholds'
  | 'olist-dashboard'
  | 'olist-reviews'
  | 'olist-states'
  | 'olist-cohorts'
  | 'retail-pipeline'
  | 'retail-tower'
  | 'retail-scale'
  | 'dpec-pitwall'
  | 'dpec-pipeline'
  | 'dpec-practice'
  | 'dpec-results'
  | 'dpec-debrief'
  | 'scanner-scan'
  | 'scanner-match'
  | 'scanner-results';

export interface CaseSection {
  id: 'problem' | 'objectives' | 'data' | 'implementation' | 'findings' | 'limitations';
  title: string;
  body: string[];
  list?: string[];
  figures?: FigureId[];
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  short: string;
  kicker: string;
  year: string;
  status: Status;
  statusNote?: string;
  tier: 'primary' | 'secondary';
  tone: Tone;
  problem: string;
  contribution: string;
  result: string;
  metrics: { value: string; label: string }[];
  methods: string[];
  stack: string[];
  links: Link[];
  /** false = private repository: no code link is shown, only `privateNote` */
  repoPublic: boolean;
  privateNote?: string;
  plate: FigureId;
  caseStudy: { summary: string; sections: CaseSection[] };
}

const GH = 'https://github.com/shavkatjony';
const TELCO = `${GH}/telco-churn-prediction`;
const OLIST = `${GH}/brazilian-e-market`;
const RETAIL = `${GH}/retail-commercial-intelligence`;
const DPEC = `${GH}/F1-pace-intelligence`;

export const projects: Project[] = [
  {
    slug: 'telco-churn',
    index: '01',
    title: 'Telco Customer Churn',
    short: 'Telco churn',
    kicker: 'Classification · retention',
    year: '2026',
    status: 'Complete',
    tier: 'primary',
    tone: 'steel',
    problem:
      'Which customers are about to cancel, and how can a probability become a retention worklist instead of a bare number?',
    contribution:
      'Built it end to end: cleaning and feature engineering, stratified cross-validation of three classifiers, one persisted scikit-learn Pipeline, a Streamlit app, a FastAPI service and a pytest suite in CI.',
    result:
      'Held-out test ROC-AUC 0.842 with recall 0.791: 296 of 374 churners caught. Chosen over a random forest with higher accuracy that missed more than half of them.',
    metrics: [
      { value: '0.842', label: 'Test ROC-AUC' },
      { value: '296 / 374', label: 'Churners caught (recall 0.791)' },
      { value: '33', label: 'Test functions, run in CI' },
    ],
    methods: ['Logistic regression', 'Random forest', 'Gradient boosting', 'Stratified 5-fold CV', 'Model card'],
    stack: ['Python', 'pandas', 'scikit-learn', 'FastAPI', 'Streamlit', 'pytest', 'GitHub Actions'],
    links: [
      { label: 'Source code', href: TELCO, kind: 'repo' },
      { label: 'Live app (Streamlit)', href: 'https://shavkh.streamlit.app/', kind: 'demo' },
      { label: 'Findings report', href: `${TELCO}/blob/main/reports/findings.md`, kind: 'doc' },
      { label: 'Dataset (Kaggle)', href: 'https://www.kaggle.com/datasets/blastchar/telco-customer-churn', kind: 'data' },
    ],
    repoPublic: true,
    plate: 'telco-app',
    caseStudy: {
      summary:
        'An end-to-end churn classifier where the deciding question was not “which model is most accurate?” but “which model misses the fewest customers who are about to leave?”',
      sections: [
        {
          id: 'problem',
          title: 'Problem',
          body: [
            'A telecom carrier loses recurring revenue with every cancellation, and winning a customer back costs more than keeping one. The retention team needs a ranked list of who to call, early enough to act.',
            'A missed churner is lost revenue; a false alarm costs one unnecessary call. That asymmetry set the selection criteria before any model was trained: ROC-AUC and churn recall first, accuracy last.',
          ],
        },
        {
          id: 'objectives',
          title: 'Objectives and questions',
          body: [],
          list: [
            'Which customers are most likely to churn?',
            'Which characteristics go with higher churn risk?',
            'How can a score become a practical worklist: a probability, a risk band and a suggested action?',
            'Which model should be chosen, given that missing a churner costs more than a wasted call?',
          ],
        },
        {
          id: 'data',
          title: 'Data and methodology',
          body: [
            'The IBM Telco Customer Churn sample: 7,043 customers of a fictional telecom company, 26.5% of whom churned. A model that predicts “nobody leaves” scores 73.5% accuracy and catches no one.',
            'One real data-quality bug: `TotalCharges` was stored as text with 11 blanks, all for customers with `tenure = 0`. They are legitimately $0, not missing, so they were set to zero instead of being dropped or imputed.',
            'A stratified 80/20 split (5,634 training, 1,409 test customers). Three classifiers, all with `class_weight="balanced"`, were compared with 5-fold stratified cross-validation on the training split. Two engineered features: `num_addon_services` and `tenure_group`. Selection used ROC-AUC, with churn recall as the deciding business metric.',
          ],
          figures: ['telco-models'],
        },
        {
          id: 'implementation',
          title: 'Technical implementation',
          body: [
            'Every transformation lives inside one scikit-learn `Pipeline` (clean → scale and one-hot → model). The object saved to disk is the object that serves predictions, so training and inference cannot drift apart.',
          ],
          list: [
            '`src/train.py` (`python -m src.train`): split, cross-validation, comparison, final fit and the saved pipeline.',
            '`src/predict.py`: input validation, probability, risk band and suggested action, shared by both front ends.',
            '`app/streamlit_app.py`: the interactive predictor.',
            '`api/main.py`: a FastAPI service with `GET /health` and `POST /predict`. Its request schema is generated from the same `RAW_INPUT_SCHEMA` that validates the app, so the two cannot drift; invalid input returns 422.',
            'Tests: 33 test functions covering preprocessing, prediction and the API, run by GitHub Actions on every push to `main` and every pull request.',
          ],
          figures: ['telco-app'],
        },
        {
          id: 'findings',
          title: 'Findings and verified results',
          body: [
            'The 1,409-customer test split was used once, after model selection. Logistic regression scored ROC-AUC 0.842, recall 0.791, precision 0.498, F1 0.612 and accuracy 0.733: 296 of 374 churners caught, at the cost of 298 false alarms.',
            'The risk bands order risk: on the test split the observed churn rate was about 56% in High, 26% in Medium and 5% in Low.',
            'The strongest associations with churn are month-to-month contracts, short tenure, high-priced fibre-optic plans, electronic-check payment and having no tech-support or online-security add-ons. These are associations, not causes.',
          ],
          figures: ['telco-confusion'],
        },
        {
          id: 'limitations',
          title: 'Limitations and lessons',
          body: [
            'Lesson: at a 26.5% base rate, accuracy is the wrong headline. The random forest looked best on accuracy and was the worst model for the job.',
          ],
          list: [
            'Scores are not calibrated rates: balanced class weights push them up (mean predicted 0.42 against an actual churn rate of 0.27). Use them to rank, and calibrate before any expected-revenue maths.',
            'At the 0.50 threshold about half of flagged customers would have stayed. That suits a cheap call, not an expensive discount; the threshold should follow retention cost and capacity.',
            'A small, fictional, single-snapshot sample: no time-to-churn and no drift monitoring.',
            '`gender` and `SeniorCitizen` are model inputs and the model has not been audited for group fairness.',
            'The committed threshold sweep below comes from the earlier, unweighted notebook model; regenerating it for the shipped pipeline is the next step.',
          ],
          figures: ['telco-thresholds'],
        },
      ],
    },
  },
  {
    slug: 'olist-delivery',
    index: '02',
    title: 'Olist Marketplace: Delivery & Loyalty',
    short: 'Olist SQL analysis',
    kicker: 'SQL-first analytics · live dashboard',
    year: '2026',
    status: 'Complete',
    tier: 'primary',
    tone: 'willow',
    problem:
      'Across ~99,000 orders on a Brazilian marketplace: do customers come back, what drives bad reviews, and where does delivery break down?',
    contribution:
      'Loaded 9 raw tables into SQLite, wrote the analysis in SQL (CTEs, window functions, cohorts) and published an interactive d3 dashboard whose numbers are rebuilt from the raw Kaggle files.',
    result:
      'Only 3.12% of customers reorder. Reviews fall from 4.29 stars on time to 1.73 at 8+ days late, and across states the on-time rate tracks reviews (r = 0.78) more closely than delivery days do (r = −0.53).',
    metrics: [
      { value: '3.12%', label: 'Customers who ever reorder' },
      { value: '4.29 → 1.73', label: 'Avg. stars, on time → 8+ days late' },
      { value: 'r = 0.78', label: 'On-time rate vs. review, across states' },
    ],
    methods: ['Recency segmentation', 'Cohort retention', 'Delivery-band analysis', 'Seller concentration'],
    stack: ['SQL (SQLite)', 'Python', 'pandas', 'matplotlib', 'd3.js', 'GitHub Pages'],
    links: [
      { label: 'Source code', href: OLIST, kind: 'repo' },
      { label: 'Live dashboard', href: 'https://shavkatjony.github.io/brazilian-e-market/', kind: 'demo' },
      { label: 'Findings report', href: `${OLIST}/blob/main/reports/findings.md`, kind: 'doc' },
      { label: 'Dataset (Kaggle)', href: 'https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce', kind: 'data' },
    ],
    repoPublic: true,
    plate: 'olist-dashboard',
    caseStudy: {
      summary:
        'A deliberately model-free analysis. SQL does the heavy lifting, the output is a short list of decisions, and the published findings include a correction I made to my own earlier number.',
      sections: [
        {
          id: 'problem',
          title: 'Problem',
          body: [
            'A marketplace lives on repeat customers and good reviews. The question was whether Olist has either, and what operational lever moves satisfaction most.',
          ],
        },
        {
          id: 'objectives',
          title: 'Objectives and questions',
          body: [],
          list: [
            'Retention: how loyal is the customer base, and how many customers have gone quiet?',
            'Delivery vs. satisfaction: do late deliveries lower review scores?',
            'Sellers: is revenue concentrated in a few sellers?',
            'Cohorts: do customers acquired in different months return at different rates?',
            'Logistics: which regions wait longest, and does waiting longest mean reviewing worst?',
          ],
        },
        {
          id: 'data',
          title: 'Data and methodology',
          body: [
            'The public Olist Brazilian E-Commerce dataset: 9 tables, Sept 2016 – Oct 2018, 99,441 orders and 96,096 customers. Definitions were fixed before any number was trusted:',
          ],
          list: [
            'Delivery metrics use only delivered orders with a non-null delivery date; otherwise NULLs corrupt every average.',
            'Customers are counted by `customer_unique_id` (the person), not the per-order `customer_id`.',
            'Revenue is item price, not payment totals, so freight and shared orders aren’t double-counted.',
            'Reviews are averaged per order first, because a few orders have more than one.',
            'Recency is measured against the last date in the data (Oct 2018), not today.',
          ],
        },
        {
          id: 'implementation',
          title: 'Technical implementation',
          body: [
            '`src/create_db.py` builds a SQLite database from the raw CSVs, and six numbered SQL files hold the exploration and the five questions. A notebook adds the narrative: question → SQL → chart → insight → recommendation.',
            '`src/build_web_data.py` rebuilds every number of the live dashboard from the raw Kaggle files. The dashboard is plain HTML and d3 on GitHub Pages: filter by year, state and category, click a state on the map, and share the filtered view by its link.',
          ],
          figures: ['olist-dashboard'],
        },
        {
          id: 'findings',
          title: 'Findings and verified results',
          body: [
            'The marketplace is structurally one-time-purchase: 3.12% of customers ever order again, and 70.7% are already At Risk or Churned. Retention is flat at 3–5% in every acquisition cohort from early 2017.',
            'Late delivery is the clearest driver of poor reviews: every band of lateness costs roughly a star.',
            'Customers punish broken promises, not distance. The slowest states are in the north: Roraima 29.4 days, Amapá 27.2, Amazonas 26.4, against a 12.6-day average. But slow is not late. Amapá and Amazonas arrive on time about 96% of the time, because their delivery estimates are long, and both average above 4.1 stars (small samples: 68 and 147 orders).',
            'Across the 27 states, the average review tracks the on-time rate (r = 0.78) more closely than delivery days (r = −0.53). The broken promises sit where the volume is: Rio de Janeiro (12,698 orders, 86.5% on time, 3.90 stars) and the Northeast (Alagoas 76.1%, Maranhão 80.3% on time).',
            'Sellers: no one dominates (the largest makes 1.7% of item revenue, the top 15 make 17.6%), but 540 of 3,053 sellers (17.7%) make 80% of it, so seller support should start with that group.',
          ],
          figures: ['olist-reviews', 'olist-states', 'olist-cohorts'],
        },
        {
          id: 'limitations',
          title: 'Limitations and lessons',
          body: [
            'Lesson: check the denominator. My first seller-concentration figure divided item revenue by total payments, which include freight, and reported 14.6% for the top 15. On a like-for-like basis it is 17.6%, and it overturned my “long tail carries the business” conclusion. The correction is published in the findings.',
          ],
          list: [
            'No acquisition-cost data, so “retention is low” is a strong signal but not a full ROI case.',
            'Lateness, region and carrier are tangled together: the drop in reviews is an association, not a measured causal effect.',
            'Review scores are voluntary, which brings selection bias; the northern states are small samples.',
            'Next: segment by product category and region to separate “late because far” from “late because of seller or handling”.',
          ],
        },
      ],
    },
  },
  {
    slug: 'retail-intelligence',
    index: '03',
    title: 'Retail Commercial Intelligence',
    short: 'Retail BI model',
    kicker: 'Data modelling · BI',
    year: '2026',
    status: 'Working',
    statusNote: 'Pipeline complete · findings from a synthetic sample',
    tier: 'primary',
    tone: 'brick',
    problem:
      'Turn years of item × store × day retail data into a governed model that answers three questions: what changed, why, and where should management look first?',
    contribution:
      'Designed a star schema with an explicit grain, staged DuckDB SQL, a data-quality build gate, a metrics engine with a transparent priority score, and a self-contained three-page HTML dashboard.',
    result:
      'At full M5 shape the build processed 59.1M rows end to end in 84 s, with peak memory cut from 8.8 GB to 2.6 GB. The business findings shown are illustrative: the repo runs on a synthetic, M5-shaped sample.',
    metrics: [
      { value: '59.1M', label: 'Rows in the full-shape stress test' },
      { value: '2.6 GB', label: 'Peak memory at full shape, down from 8.8 GB' },
      { value: '8', label: 'Data-quality checks gating the build' },
    ],
    methods: ['Star schema', 'Like-for-like YoY', 'Contribution analysis', 'Exception scoring', 'HHI concentration'],
    stack: ['Python', 'DuckDB SQL', 'Parquet', 'Make', 'Tableau (guide)'],
    links: [
      { label: 'Source code', href: RETAIL, kind: 'repo' },
      { label: 'Live HTML dashboard', href: 'https://shavkatjony.github.io/retail-commercial-intelligence/dashboard/', kind: 'demo' },
      { label: 'Architecture notes', href: `${RETAIL}/blob/main/docs/architecture.md`, kind: 'doc' },
      { label: 'M5 dataset (Kaggle)', href: 'https://www.kaggle.com/c/m5-forecasting-accuracy/data', kind: 'data' },
    ],
    repoPublic: true,
    plate: 'retail-tower',
    caseStudy: {
      summary:
        'A data-modelling project where the hard parts were honesty and scale: stating the grain, gating the build on data quality, and fitting the real data size on an 8 GB laptop.',
      sections: [
        {
          id: 'problem',
          title: 'Problem',
          body: [
            'Commercial and category leadership asks one question: what changed in the business, why, and what should we do about it? The goal was a triage list ranked by impact, not a wall of charts. Scope is descriptive and diagnostic by design; there is no forecasting.',
          ],
        },
        {
          id: 'objectives',
          title: 'Objectives and questions',
          body: [],
          list: [
            'Where is demand growing or deteriorating, and which products and stores drive the change?',
            'How do price moves relate to demand?',
            'How exposed is the business to a few products or stores?',
            'Can the real data size be processed on an ordinary laptop?',
          ],
        },
        {
          id: 'data',
          title: 'Data and methodology',
          body: [
            'The model is built for the shape of the M5 (Walmart) data: daily unit sales, weekly prices and an event/SNAP calendar across 3 states and 10 stores (30,490 item-store series in the real data). The repo ships a synthetic, M5-shaped generator so it runs in seconds without downloads; switching to the real files is one config change.',
            'Every table states its grain: `fact_daily_sales` is one row per item × store × date. Units × price is labelled Estimated Sales Value, not revenue, because M5 has no refunds, tax or cost of goods. Growth is like-for-like against the same window a year earlier, contribution analysis splits the change by category and store, and concentration is measured with an adaptive top-k share and the HHI.',
            'The exception engine gives every store × category at most one signal (growth, deterioration or price risk) and ranks it by a transparent score: Impact × Magnitude × Confidence. Price–demand links are reported as association only.',
          ],
        },
        {
          id: 'implementation',
          title: 'Technical implementation',
          body: [
            'Raw CSVs are reshaped from wide to long in Python, staged as Parquet and modelled in DuckDB SQL (staging → dimensions → facts → marts). Eight data-quality checks run on every build: unique grain, referential integrity, impossible values and null keys fail it; price coverage and calendar continuity only warn.',
          ],
          figures: ['retail-pipeline'],
        },
        {
          id: 'findings',
          title: 'Findings and verified results',
          body: [
            'The pipeline was stress-tested at full M5 shape: 30,450 series × 1,941 days = 59.1M rows. The first version peaked at 8.8 GB. Four changes, each measured on its own, brought it to 2.6 GB: streaming the reshape store by store, categorical encoding for every text column, running ingestion in its own process, and capping DuckDB at 1.5 GB so it spills to disk.',
          ],
          figures: ['retail-scale', 'retail-tower'],
        },
        {
          id: 'limitations',
          title: 'Limitations and lessons',
          body: [
            'Lesson: profile before optimising, and measure each change on its own. Inside DuckDB the memory peak came from the full-key duplicate-grain check (a 59M-group aggregate), and capping DuckDB at 1.5 GB cost no wall time at all.',
          ],
          list: [
            'The mechanics are real; the numbers in the repo are not business findings. They must be regenerated from the real Kaggle M5 files before being presented as insight.',
            'The Tableau Public edition is specified in a build guide but not published yet; the HTML edition is live.',
            'Next: unit tests for the metric functions (growth windows, contribution, priority score).',
          ],
        },
      ],
    },
  },
  {
    slug: 'f1-pace-intelligence',
    index: '04',
    title: 'DPEC: Formula 1 Pace Intelligence',
    short: 'F1 pace forecasting',
    kicker: 'Forecasting · uncertainty · applied AI',
    year: '2026',
    status: 'In development',
    statusNote: 'Backtested on held-out races · live record not started',
    tier: 'primary',
    tone: 'coffee',
    problem:
      'Before each race, how fast will each car really be over a race distance, how sure can we be, and how many pit stops make sense, using public data only?',
    contribution:
      'Built it solo from first download to deployed app: a 545-session pipeline and DuckDB warehouse, a walk-forward forecaster with calibrated 80% ranges, a strategy model, a read-only FastAPI service and web app, and an AI assistant graded by an automatic exam.',
    result:
      'On 37 race weekends held out from every modelling choice, race-pace error after qualifying was 0.548% of a lap (about 0.49 s), against 0.589% for the best of five baselines, and 79.9% of real results fell inside the 80% ranges.',
    metrics: [
      { value: '0.548%', label: 'Race-pace error after qualifying (best baseline 0.589%)' },
      { value: '79.9%', label: 'Real results inside the 80% ranges' },
      { value: '129', label: 'Tests run in CI on every push' },
    ],
    methods: ['Walk-forward backtest', 'Split-conformal ranges', 'Monte Carlo strategy', 'LLM tool use'],
    stack: ['Python', 'DuckDB SQL', 'statsmodels', 'FastAPI', 'Docker', 'Claude API · Ollama', 'pytest'],
    links: [
      { label: 'Source code', href: DPEC, kind: 'repo' },
      { label: 'Live app (Render, wakes in ~1 min)', href: 'https://f1-pace-intelligence.onrender.com', kind: 'demo' },
      { label: 'Model card', href: `${DPEC}/blob/main/docs/model-card.md`, kind: 'doc' },
      { label: 'Numbers check', href: `${DPEC}/blob/main/reports/numbers-check.md`, kind: 'doc' },
    ],
    repoPublic: true,
    plate: 'dpec-pitwall',
    caseStudy: {
      summary:
        'A complete forecasting product on public Formula 1 timing data, proved on races the model never saw. Formula 1 is the setting, not the point: the same problem appears in demand, energy and logistics forecasting.',
      sections: [
        {
          id: 'problem',
          title: 'Problem',
          body: [
            'Before every race a team has to work out how fast each car will really be over a full race distance, and how many times to stop for new tyres. It has a few practice sessions and one qualifying session to go on, and that data is noisy: only 55% of laps show a car’s real pace (78% in races, 27% in qualifying), and the facts that matter most, such as fuel loads, are never published.',
            'The question was how well public data alone can answer this, proved on races the model had never seen.',
          ],
        },
        {
          id: 'objectives',
          title: 'Objectives and questions',
          body: [],
          list: [
            'How fast will each car be on Sunday, over a whole race (median clean race lap, as % behind the fastest car)?',
            'How sure can we be? Every forecast carries an 80% range and three chances: best race pace, top-3 race pace, beating the teammate.',
            'What should the team do: how many pit stops, roughly when?',
            'After the race: was the forecast right, and where did the time go?',
          ],
        },
        {
          id: 'data',
          title: 'Data and methodology',
          body: [
            '545 sessions and 297,724 laps, from the 2022 Bahrain Grand Prix to the 2026 Singapore Grand Prix, downloaded once through FastF1 and stored untouched as Parquet with a SHA-256 for every file. A DuckDB warehouse of 15 tables is rebuilt from plain SQL; every lap gets one reason code, `clean` or the first of 13 rules it breaks, and 21 data checks run after every build.',
            'Research came before modelling. Qualifying predicted race pace far better than practice long runs (median Spearman 0.80 against 0.39 over 86 dry weekends; the bootstrap 95% interval for the difference runs from −0.48 to −0.34), so the forecaster is built on qualifying and recent form.',
            'Evaluation is walk-forward: before each weekend the model is refitted on earlier races only. Every setting was chosen on 2023–24, and results are reported on 2025–26 (37 weekends, 726 driver-races) that played no part in any choice. The 80% ranges are split-conformal, built from the model’s own recent errors; the chances come from 4,000 simulated race orders.',
          ],
          figures: ['dpec-practice'],
        },
        {
          id: 'implementation',
          title: 'Technical implementation',
          body: [
            'One codebase serves a local app and a read-only public copy. Data flows one way, models only see the past, and serving only reads.',
          ],
          list: [
            'A read-only FastAPI service with 18 endpoints, and a framework-free web app with 15 linked windows.',
            'An AI race engineer: an LLM agent with 8 read-only tools and a SQL guard, on the Claude API or a local Ollama model. Every number must name the tool it came from; anything public data can’t show gets “not public”.',
            '129 tests on fake data with no internet, plus Ruff, in GitHub Actions on every push. A second CI job protects the public record: it rejects a forecast that arrives after its deadline or a frozen file that changes.',
            'A release workflow builds a Docker image with the data snapshot inside, checks it behaves like the public copy, and pushes it to GitHub’s container registry; Render hosts the public copy.',
          ],
          figures: ['dpec-pipeline', 'dpec-pitwall'],
        },
        {
          id: 'findings',
          title: 'Findings and verified results',
          body: [
            'Every number in the project README is traced to its source in a published numbers check. On the 37 held-out weekends:',
          ],
          list: [
            'Race-pace error after qualifying 0.548% (about 0.49 s a lap) against 0.589% for the best of five baselines; after practice 0.648% against 0.674%.',
            'Ranges that mean what they say: 78.5% (after practice) and 79.9% (after qualifying) of real results fell inside the 80% ranges. Top-3 chance Brier score 0.070 against 0.129 for no information.',
            'Strategy, replayed on 78 dry races with only earlier data: the stop count matched what most of the top 10 did in 58% of races, against 46% for “always one stop” (67% against 57% when the call was clear).',
            'The live code path, replayed on 16 races of 2026, gave exactly the backtest’s error (0.573%).',
            'The AI assistant passed a 50-question exam, including 5 trap questions it had to turn down, graded against the warehouse on 8 November 2026.',
          ],
          figures: ['dpec-results'],
        },
        {
          id: 'limitations',
          title: 'Limitations and lessons',
          body: [
            'Lesson: a leaky baseline beat every honest model. Copying a teammate’s pace from the same race, under a random row split, scored 0.51%, better than any real forecaster and useless before a race. Walk-forward evaluation by race date, with future columns hidden in code, made leakage a test failure.',
          ],
          list: [
            'Still in development: the public forecast record has 0 live weekends. Since October 2026 F1’s timing data needs a paid login, so no forecast could be frozen before a race.',
            'It doesn’t win everywhere: the per-year model orders drivers slightly better after qualifying (median Spearman 0.843 against 0.821), and in the first five races of the 2026 rules simpler methods did as well or better.',
            'The chances are a little too flat: favourites make the top 3 more often than the model says.',
            'Public data only and simple models on purpose: no weather, upgrades or penalties as inputs; fuel effects are an assumed 0.06 s per lap.',
          ],
          figures: ['dpec-debrief'],
        },
      ],
    },
  },
  {
    slug: 'document-scanner',
    index: '05',
    title: 'Paper → Data: Korean Invoice Scanner',
    short: 'Invoice scanner',
    kicker: 'Computer vision · OCR',
    year: '2026',
    status: 'Working',
    statusNote: 'Prototype · tuned on one synthetic sample',
    tier: 'secondary',
    tone: 'yale',
    problem:
      'Turn a crooked phone photo of a Korean paper invoice into a clean scan and structured, checkable data, without training a model.',
    contribution:
      'Wrote a three-stage classical pipeline: OpenCV page detection and perspective correction, ORB/SIFT matching with RANSAC to register the photo onto a blank template, and per-field Korean OCR with Tesseract into a CSV.',
    result:
      'On a rendered invoice photographed in perspective with shadow and uneven light: 12 of 12 fields read exactly and a 0.3–0.8 px corner error after RANSAC. Not a held-out score: the pipeline was tuned on this same sample.',
    metrics: [
      { value: '12 / 12', label: 'Fields read exactly (tuning sample)' },
      { value: '0.3 px', label: 'Corner error, SIFT + RANSAC' },
      { value: '+2.94°', label: 'Skew recovered of a true +3.00°' },
    ],
    methods: ['Canny + contours', 'Homography', 'ORB / SIFT + RANSAC', 'Tesseract OCR'],
    stack: ['Python', 'OpenCV', 'NumPy', 'Tesseract (kor/eng)', 'matplotlib'],
    links: [],
    repoPublic: false,
    privateNote: 'Repository is private: code available on request.',
    plate: 'scanner-match',
    caseStudy: {
      summary:
        'Classical computer vision end to end: from a skewed photo to a registered page to OCR’d fields in a CSV, with each step measured against known geometry.',
      sections: [
        {
          id: 'problem',
          title: 'Problem',
          body: [
            'Paper forms still arrive as phone photos: crooked, in perspective, with shadows and uneven light. Before any model is trained, how far can a careful classical pipeline go in turning one into data?',
          ],
        },
        {
          id: 'objectives',
          title: 'Objectives and questions',
          body: [],
          list: [
            'Flatten a photo of a page into a clean black-and-white scan.',
            'Register the photo onto a blank form template, so every field has a known position.',
            'Read each field with Korean OCR into a CSV that opens correctly in Excel.',
            'Check the result without ground truth.',
          ],
        },
        {
          id: 'data',
          title: 'Data and methodology',
          body: [
            'A synthetic Korean invoice, rendered by `make_sample.py`: a filled form, 3° crooked, photographed in perspective with shadow and uneven light, saved with its true geometry and printed values, so every stage can be scored.',
            'Stage 1, scan: gray → blur (a hand-written convolution, checked against OpenCV) → Canny → morphological closing → largest 4-point contour → homography warp → adaptive threshold → Hough deskew. Stage 2, match: ORB or SIFT keypoints → ratio test → RANSAC homography → warp. Stage 3, OCR: one crop per field at template coordinates → Tesseract (Korean and English) → parse → sum check → CSV.',
          ],
          figures: ['scanner-scan'],
        },
        {
          id: 'implementation',
          title: 'Technical implementation',
          body: [
            'Three modules (`scanner.py`, `match.py`, `ocr.py`) and one runner per stage, each writing its intermediate images. Tesseract runs with Korean and English models, one line per crop (`--psm 7`), with digits-and-commas whitelists for numeric fields.',
          ],
          figures: ['scanner-match'],
        },
        {
          id: 'findings',
          title: 'Findings and verified results',
          body: [
            'RANSAC is the point: many surviving matches are still wrong, and a single wrong match drags a least-squares fit hundreds of pixels off. All 12 fields (date, name, total, and item, quantity and amount for three rows) were read exactly, the line amounts sum to the printed total (23,500 = 23,500), and the deskew recovered +2.94° of a rendered +3.00°.',
          ],
          figures: ['scanner-results'],
        },
        {
          id: 'limitations',
          title: 'Limitations and lessons',
          body: [
            'Lesson: preprocessing that helps people can hurt OCR. Binarising before OCR merged the thin vowel stroke of 플 into 풀; feeding Tesseract grayscale read it correctly at every scale tried.',
          ],
          list: [
            'Tested on one synthetic, clean-font sample, and tuned on that same sample, so 12/12 is not a held-out number. Expect lower accuracy on real photos and handwriting.',
            'Stage 1 needs the whole page outline visible; adaptive thresholding hollows large dark fills; field boxes are fixed for this template.',
            'One unexplained segfault on a first OCR run did not recur in the next nine runs and is unresolved.',
            'Next stage of the plan: a small CNN built from scratch, compared with Tesseract on the numeric fields.',
          ],
        },
      ],
    },
  },
];

export const primaryProjects = projects.filter((p) => p.tier === 'primary');
export const secondaryProjects = projects.filter((p) => p.tier === 'secondary');

/** Smaller pieces of evidence: listed, not featured. */
export const archive = [
  {
    title: 'Seam carving from scratch',
    meta: 'Computer vision · algorithms · 2026',
    text: 'Content-aware image resizing in about 170 lines of NumPy, no OpenCV: Sobel energy, a dynamic-programming seam checked against brute force on small inputs (8 tests in all), and masks to protect or remove objects. The write-up shows where it breaks, and the fix.',
    image: { src: 'seam-comparison', width: 1400, height: 306, alt: 'A rocket on a launch pad shown four ways: original, plain resize (rocket gets thin), centre crop (loses both towers), and seam carving (rocket keeps its shape).' },
    href: null as string | null,
    privateNote: 'Private repository',
  },
  {
    title: 'MNIST neural network explorer',
    meta: 'PyTorch · FastAPI · 2026',
    text: 'A small PyTorch network (784 → 256 → 128 → 64 → 10, with dropout) trained on MNIST and served by a FastAPI backend that streams training progress over WebSockets to a browser drawing pad.',
    image: null,
    href: `${GH}/mnist-classifier-fullstack` as string | null,
    privateNote: null,
  },
  {
    title: 'Lotte World Busan: visitor review mining',
    meta: 'Dong-A University · team project · 2023',
    text: '887 multilingual Google Maps reviews analysed with KH Coder keyword frequency, a co-occurrence network and descriptive statistics by experience dimension. Pricing & discounts scored lowest (mean 1.80 / 5).',
    image: null,
    href: `${GH}/lotte-world-busan-santiment-analyses` as string | null,
    privateNote: null,
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
    source: { label: 'telco · reports/findings.md', href: `${TELCO}/blob/main/reports/findings.md` },
  },
  {
    id: 'blank-is-not-missing',
    category: 'Data quality',
    title: 'Blank is not always missing',
    text: 'Eleven blank `TotalCharges` values all belonged to customers with zero tenure. They are $0, not unknown. Dropping or imputing them would have invented a problem.',
    source: { label: 'telco · src/preprocess.py', href: `${TELCO}/blob/main/src/preprocess.py` },
  },
  {
    id: 'slow-is-not-late',
    category: 'Statistics',
    title: 'Slow is not late',
    text: 'Across 27 Brazilian states, the average review tracks the on-time rate (r = 0.78) more closely than delivery days (r = −0.53). The slowest northern states keep about 96% of their promises; the reviews suffer where promises break.',
    source: { label: 'olist · reports/findings.md', href: `${OLIST}/blob/main/reports/findings.md` },
  },
  {
    id: 'check-the-denominator',
    category: 'Analysis practice',
    title: 'Check the denominator',
    text: 'My first seller-concentration number divided item revenue by total payments, which include freight. Like for like, the top 15 sellers make 17.6%, not 14.6%, and my “long tail” conclusion had to go. I published the correction.',
    source: { label: 'olist · findings, finding 3', href: `${OLIST}/blob/main/reports/findings.md` },
  },
  {
    id: 'sixty-million-rows',
    category: 'Engineering',
    title: 'Fitting 59 million rows on an 8 GB laptop',
    text: 'Peak memory fell from 8.8 GB to 2.6 GB by streaming the reshape, using categoricals, isolating ingestion in its own process and capping DuckDB. Each change was measured on its own before keeping it.',
    source: { label: 'retail · docs/architecture.md', href: `${RETAIL}/blob/main/docs/architecture.md` },
  },
  {
    id: 'leaky-baseline',
    category: 'Validation',
    title: 'A leaky baseline beat every honest model',
    text: 'Copying a teammate’s race pace from the same race, under a random split, scored 0.51%, better than any real forecaster and useless on a Saturday. Walk-forward by race date, with future columns hidden in code, turned leakage into a test failure.',
    source: { label: 'dpec · research case 07', href: `${DPEC}/blob/main/docs/research/cases/07-temporal-validation-and-ranges.md` },
  },
  {
    id: 'grade-the-assistant',
    category: 'Applied AI',
    title: 'Grade the AI assistant like software',
    text: 'DPEC’s race engineer must name the tool behind every number. Its 50-question exam recomputes each right answer from the warehouse on every run, including 5 trap questions about things that aren’t public, and it passed 50 of 50.',
    source: { label: 'dpec · reports/ai', href: `${DPEC}/blob/main/reports/ai/README.md` },
  },
];

/* ------------------------------------------------------------------ */
/* Toolkit                                                            */
/* ------------------------------------------------------------------ */

export interface Tool {
  name: string;
  why: string;
  href: string;
  evidence: string[]; // project slugs (case studies)
  repo?: { label: string; href: string };
}

export const toolkit: { demonstrated: Tool[]; learning: Omit<Tool, 'evidence'>[]; studied: Omit<Tool, 'evidence'>[] } = {
  demonstrated: [
    { name: 'Python · pandas · NumPy', why: 'The working language of every project here.', href: 'https://pandas.pydata.org/docs/', evidence: ['f1-pace-intelligence', 'telco-churn', 'olist-delivery', 'retail-intelligence', 'document-scanner'] },
    { name: 'SQL: DuckDB & SQLite', why: 'A 15-table warehouse from plain SQL, a star schema with stated grain, cohort and window queries.', href: 'https://duckdb.org/docs/', evidence: ['f1-pace-intelligence', 'retail-intelligence', 'olist-delivery'] },
    { name: 'scikit-learn', why: 'Pipelines that bundle preprocessing with the model; stratified CV.', href: 'https://scikit-learn.org/stable/', evidence: ['telco-churn'] },
    { name: 'statsmodels', why: 'Weighted least squares for the race-pace forecaster; OLS and logit with diagnostics.', href: 'https://www.statsmodels.org/stable/', evidence: ['f1-pace-intelligence'], repo: { label: 'Modelling notebooks', href: `${GH}/data-science-portfolio` } },
    { name: 'FastAPI · Pydantic', why: 'Typed, validated model and data APIs: 18 read-only endpoints in DPEC, a /predict service for churn.', href: 'https://fastapi.tiangolo.com/', evidence: ['f1-pace-intelligence', 'telco-churn'], repo: { label: 'MNIST explorer', href: `${GH}/mnist-classifier-fullstack` } },
    { name: 'pytest · Ruff · GitHub Actions', why: '129 tests in DPEC and 33 test functions in the churn project, run on every push.', href: 'https://docs.pytest.org/', evidence: ['f1-pace-intelligence', 'telco-churn'] },
    { name: 'Docker', why: 'A release image with the data snapshot inside, checked before it is pushed.', href: 'https://docs.docker.com/', evidence: ['f1-pace-intelligence'] },
    { name: 'LLM tool use (Claude API, Ollama)', why: 'A grounded agent with read-only tools, graded by an automatic exam.', href: 'https://docs.anthropic.com/', evidence: ['f1-pace-intelligence'] },
    { name: 'OpenCV · Tesseract', why: 'Contours, homographies, feature matching with RANSAC, per-field Korean OCR.', href: 'https://docs.opencv.org/', evidence: ['document-scanner'] },
    { name: 'Parquet / PyArrow', why: 'Columnar raw storage, saved once with checksums and re-read fast.', href: 'https://arrow.apache.org/docs/python/', evidence: ['f1-pace-intelligence', 'retail-intelligence'] },
    { name: 'd3.js', why: 'A filterable dashboard with a clickable map and shareable views.', href: 'https://d3js.org/', evidence: ['olist-delivery'] },
    { name: 'Streamlit', why: 'The quickest honest way to put a model in someone’s hands.', href: 'https://docs.streamlit.io/', evidence: ['telco-churn'] },
    { name: 'PyTorch', why: 'A small network trained on MNIST and served through FastAPI.', href: 'https://pytorch.org/docs/stable/', evidence: [], repo: { label: 'MNIST explorer', href: `${GH}/mnist-classifier-fullstack` } },
    { name: 'FastF1', why: 'Python access to F1 timing, telemetry and session data.', href: 'https://docs.fastf1.dev/', evidence: ['f1-pace-intelligence'] },
  ],
  learning: [
    { name: 'Convolutional networks from scratch', why: 'The next stage of the computer-vision plan: a small CNN compared with Tesseract on numeric fields.', href: 'https://pytorch.org/tutorials/' },
    { name: 'Probability calibration', why: 'The churn model ranks well but its scores run high; calibrating them is the next step.', href: 'https://scikit-learn.org/stable/modules/calibration.html' },
    { name: 'Tableau', why: 'The retail dashboard has a written build spec; publishing it is next.', href: 'https://help.tableau.com/' },
    { name: 'R', why: 'From university statistics coursework.', href: 'https://www.r-project.org/' },
  ],
  studied: [
    { name: 'f1-race-replay by Tom Shaw', why: 'Forked to study how a Python app replays FastF1 telemetry. The project is his; my own F1 work is DPEC.', href: 'https://github.com/IAmTomShaw/f1-race-replay' },
    { name: 'FastF1', why: 'Follow its maintainer notes; the loss of public ERS and active-aero data shaped DPEC’s rules.', href: 'https://github.com/theOehrly/Fast-F1' },
    { name: 'DuckDB', why: 'Profiled its memory cap and disk spilling while fitting the 59M-row retail build.', href: 'https://github.com/duckdb/duckdb' },
    { name: 'Tesseract OCR', why: 'Page-segmentation modes and character whitelists for one-line, per-field Korean OCR.', href: 'https://github.com/tesseract-ocr/tesseract' },
  ],
};

export const meta = {
  title: 'Shavkatjon Yuldashev · Data Scientist | Machine Learning & Applied AI',
  description:
    'Shavkatjon Yuldashev, data scientist in Busan, South Korea, building production-grade ML systems: forecasting with calibrated uncertainty, tested pipelines and honest evaluation. Case studies, code and CV.',
  updated: '2026-11-12',
};
