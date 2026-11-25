/**
 * Facts shared by both PDFs: numbers, dates and links. Text in either language interpolates these,
 * so the English and Korean documents can never disagree on a metric.
 *
 * Sources (every value is traceable):
 *  - the website content (src/content/site.ts, ko.ts): experience bullets word for word from the owner's CVs,
 *    project facts audited against each repository;
 *  - each project's README / reports (numbers checks, model cards, findings);
 *  - git history of each repository (project periods, commit counts).
 * Employment outcomes are owner-reported (CV) and are always labelled as such in the documents.
 */
import * as site from '../../src/content/site.ts';
import * as ko from '../../src/content/ko.ts';

const GH = 'https://github.com/shavkatjony';
const DPEC = `${GH}/F1-pace-intelligence`;
const TELCO = `${GH}/telco-churn-prediction`;
const RETAIL = `${GH}/retail-commercial-intelligence`;
const OLIST = `${GH}/brazilian-e-market`;

export const links = {
  site: 'https://portfolio.yuldashevv.workers.dev/',
  siteKo: 'https://portfolio.yuldashevv.workers.dev/ko/',
  github: site.social.github.href,
  linkedin: site.social.linkedin.href,
  email: site.email,
  telegram: site.social.telegram.href,
  dpec: {
    repo: DPEC,
    app: 'https://f1-pace-intelligence.onrender.com',
    modelCard: `${DPEC}/blob/main/docs/model-card.md`,
    numbers: `${DPEC}/blob/main/reports/numbers-check.md`,
    architecture: `${DPEC}/blob/main/docs/engineering/architecture.md`,
    decisions: `${DPEC}/tree/main/docs/decisions`,
    research: `${DPEC}/blob/main/docs/research/README.md`,
    exam: `${DPEC}/blob/main/reports/ai/README.md`,
    koGuide: `${DPEC}/blob/main/docs/ko/README.md`,
  },
  telco: {
    repo: TELCO,
    app: 'https://shavkh.streamlit.app/',
    findings: `${TELCO}/blob/main/reports/findings.md`,
    modelCard: `${TELCO}#model-card`,
  },
  retail: {
    repo: RETAIL,
    dashboard: 'https://shavkatjony.github.io/retail-commercial-intelligence/dashboard/',
    architecture: `${RETAIL}/blob/main/docs/architecture.md`,
  },
  olist: {
    repo: OLIST,
    dashboard: 'https://shavkatjony.github.io/brazilian-e-market/',
    findings: `${OLIST}/blob/main/reports/findings.md`,
  },
  mnist: `${GH}/mnist-classifier-fullstack`,
  notebooks: `${GH}/data-science-portfolio`,
  lotte: `${GH}/lotte-world-busan-santiment-analyses`,
};

/** Display form of a URL: no scheme, no trailing slash. */
export const short = (u) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

export const person = {
  name: site.identity.name,
  nameKo: ko.identityKo.nameLocal,
  email: site.email,
  experienceTotal: { en: site.identity.experienceTotal, ko: ko.identityKo.experienceTotal },
  visa: { en: site.identity.visaDetail, ko: ko.identityKo.visaDetail },
  scope: { en: site.identity.availability.scope, ko: ko.identityKo.scope },
  languages: { en: site.languages, ko: ko.languagesKo },
  education: { en: site.education[0], ko: ko.educationKo[0] },
};

/** Jobs: bullets word for word from the owner's CVs (English: site.ts, Korean: ko.ts). */
export const jobs = site.experience.map((x) => ({ en: x, ko: { ...x, ...ko.experienceKo[x.org] } }));

/** The capabilities DPEC demonstrates (website card, both languages). */
export const dpecDemonstrates = { en: site.projects[0].demonstrates, ko: ko.projectsKo['f1-pace-intelligence'].demonstrates };

/** Project periods from each repository's git history. */
export const periods = {
  dpec: '2026.08 – 2026.11',
  telco: '2026.07 – 2026.11',
  retail: '2026.10',
  olist: '2026.06 – 2026.11',
};

/** Numbers, as published in the project READMEs / reports (see each project's numbers check or findings). */
export const F = {
  dpec: {
    sessions: '545',
    laps: '297,724',
    weather: '54,295',
    rawGb: '4.1 GB',
    whMb: '28 MB',
    tables: '15',
    checks: '21',
    rules: '13',
    weekendsAll: '109',
    clean: { all: 55, race: 78, quali: 27 },
    spearmanQ: '0.80',
    spearmanP: '0.39',
    dryWeekends: '86',
    ciLo: '−0.48',
    ciHi: '−0.34',
    wearPractice: '0.1395',
    wearRace: '0.0995',
    evoSessions: '87',
    evoRate: '0.15 s',
    heldOut: '37',
    driverRaces: '726',
    errQ: '0.548%',
    errQs: '0.49 s',
    errP: '0.648%',
    bestBaseQ: '0.589%',
    bestBaseP: '0.674%',
    leaky: '0.51%',
    covP: 78.5,
    covQ: 79.9,
    brier: '0.070',
    brierBase: '0.129',
    dryRuns: '16',
    dryErr: '0.573%',
    perYearRho: '0.843',
    sharedRho: '0.821',
    newRulesCov: '68%',
    // model card, "Which inputs matter": error after qualifying with one input removed, all forecast years (2023–26, 78 weekends)
    ablation: { weekends: '78', full: 0.498, team: 0.593, quali: 0.557, recency: 0.513, dvt: 0.503 },
    teammateBrier: '0.219',
    coinBrier: '0.25',
    stop: { model: 58, base: 46, clearModel: 67, clearBase: 57, races: '78', draws: '4,000', threshold: '65%' },
    exam: { total: 50, lookup: 18, compare: 12, forecast: 8, decision: 7, trap: 5, calls: '118', median: '6.7 s', cost: 'US$1.50', date: { en: '8 November 2026', ko: '2026년 11월 8일' } },
    tools: '8',
    endpoints: '18',
    windows: '15',
    layouts: '4',
    tests: '129',
    commits: '247',
    adrs: '18',
    cases: '9',
    deadline: '30',
    fuel: '0.06 s',
    debrief: { q: '0.320 s', r: '0.148 s', laps: '47', sg: '1.49 s', sgPace: '0.9 s', sgTraffic: '0.5 s', within: '76%' },
    // forecaster comparison, mean absolute race-pace error (% of a lap), 2025–26 held-out weekends
    table: [
      { key: 'shared', p: 0.648, q: 0.548, ours: true },
      { key: 'team', p: 0.674, q: 0.674 },
      { key: 'last', p: 0.744, q: 0.744 },
      { key: 'peryear', p: 0.883, q: 0.589 },
      { key: 'signal', p: 1.071, q: 0.594 },
      { key: 'none', p: 1.047, q: 1.047 },
    ],
  },
  telco: {
    customers: '7,043',
    churnRate: '26.5%',
    nobody: '73.5%',
    train: '5,634',
    test: '1,409',
    auc: '0.842',
    recall: '0.791',
    precision: '0.498',
    f1: '0.612',
    acc: '0.733',
    caught: '296',
    churners: '374',
    falseAlarms: '298',
    tests: '33',
    blanks: '11',
    bands: { high: 56, medium: 26, low: 5 },
    meanPred: '0.42',
    actual: '0.27',
    // 5-fold stratified CV on the training split (reports/model_comparison.csv)
    cv: [
      { key: 'lr', acc: 0.749, rec: 0.797, auc: 0.846, chosen: true },
      { key: 'gb', acc: 0.771, rec: 0.7, auc: 0.829 },
      { key: 'rf', acc: 0.788, rec: 0.465, auc: 0.824 },
    ],
    cm: { tp: 296, fn: 78, fp: 298, tn: 737 },
  },
  retail: {
    rows: '59.1M',
    series: '30,450',
    days: '1,941',
    realSeries: '30,490',
    peakBefore: 8.8,
    peakAfter: 2.6,
    timeBefore: 105,
    timeAfter: 84,
    checks: '8',
    cap: '1.5 GB',
    states: '3',
    stores: '10',
  },
  olist: {
    orders: '99,441',
    customers: '96,096',
    tables: '9',
    reorder: '3.12%',
    atRisk: '70.7%',
    stars: [
      { key: 'ontime', v: 4.29, n: 88163 },
      { key: 'late13', v: 3.77, n: 2636 },
      { key: 'late47', v: 2.32, n: 1773 },
      { key: 'late8', v: 1.73, n: 3252 },
    ],
    rOnTime: 0.78,
    rDays: -0.53,
    states: '27',
    avgDays: '12.6',
    sellers: { all: '3,053', top: '540', share: '17.7%', largest: '1.7%', top15: '17.6%', wrong: '14.6%' },
    rio: { orders: '12,698', onTime: '86.5%', stars: '3.90' },
  },
};
