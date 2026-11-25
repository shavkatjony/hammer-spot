/**
 * Pages 1–8: cover, 60-second overview, contents, profile, specializations, experience, projects overview.
 * Copy is written side by side ({ en, ko }); numbers come from facts.mjs.
 */
import { L, ctx, head, stat, chips, meta, badge, PUBLIC, REPORTED, list, node, flow, arrow, dunes, label } from './ui.mjs';
import { F, links as LK, person, jobs, short } from './facts.mjs';

const IMG = (n) => `../assets/img/${n}`;
const D = F.dpec;

export const CH = {
  overview: { en: 'Overview', ko: '개요' },
  profile: { en: '01 Profile', ko: '01 프로필' },
  experience: { en: '02 Experience', ko: '02 경력' },
  projects: { en: '03 Projects', ko: '03 프로젝트' },
  more: { en: '04 Additional work', ko: '04 기타 작업' },
  contact: { en: '05 Contact', ko: '05 연락처' },
};

/* ------------------------------------------------------------------ 1 · cover */
export const cover = {
  id: 'cover',
  theme: 'cover',
  sec: { en: 'Cover', ko: '표지' },
  body: () => `
  <div class="cover__dunes">${dunes({ sunAt: [1180, 128], sunR: 34 })}</div>
  <div class="cover__inner">
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <p class="label" style="color:var(--ink-2)">${L({ en: 'Portfolio · 2026', ko: '포트폴리오 · 2026' })}</p>
      <p class="label" style="color:var(--ink-2);text-align:right">${L({ en: 'Selected work and professional experience', ko: '주요 프로젝트와 경력' })}</p>
    </div>
    <div style="margin-top:21mm">
      ${ctx.lang === 'ko' ? `<p class="cover__local">${person.nameKo}</p>` : ''}
      <h1 class="cover__name" style="${ctx.lang === 'ko' ? 'margin-top:2mm' : ''}">Shavkatjon<br>Yuldashev</h1>
      <p class="cover__role" style="margin-top:6mm">${L({ en: 'Data Scientist & Applied ML Engineer', ko: '데이터 사이언티스트 · 응용 ML 엔지니어' })}</p>
      <p class="cover__line" style="margin-top:3.2mm">${L({
        en: 'From raw data to <em>reliable decisions.</em>',
        ko: '원천 데이터에서 <em>신뢰할 수 있는 의사결정</em>까지.',
      })}</p>
      <p class="dek" style="max-width:128mm;margin-top:4mm;font-size:${ctx.lang === 'ko' ? '9.6pt' : '10.4pt'}">${L({
        en: 'Statistical modelling, machine learning and data engineering, built end to end and proved on data the models never saw.',
        ko: '통계 모델링, 머신러닝, 데이터 엔지니어링을 처음부터 끝까지 구현하고, 모델이 보지 못한 데이터로 검증합니다.',
      })}</p>
    </div>
    <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:8mm">
      <p class="links" style="font-size:8.2pt;gap:1.4mm 6mm">
        <a href="mailto:${LK.email}">${LK.email}</a>
        <a href="${ctx.lang === 'ko' ? LK.siteKo : LK.site}">${short(ctx.lang === 'ko' ? LK.siteKo : LK.site)}</a>
        <a href="${LK.github}">${short(LK.github)}</a>
      </p>
      <p class="label" style="color:var(--ink);text-align:right">${L({ en: 'Busan, South Korea', ko: '대한민국 부산' })}</p>
    </div>
  </div>`,
};

/* ------------------------------------------------------------------ 2 · 60-second overview */
const SPECIAL = [
  {
    t: { en: 'Forecasting & statistical modelling', ko: '예측 · 통계 모델링' },
    d: {
      en: 'Models chosen against baselines, validated walk-forward, with uncertainty that is measured rather than asserted.',
      ko: '베이스라인과 비교해 모델을 고르고, 워크포워드로 검증하며, 불확실성은 주장하지 않고 측정합니다.',
    },
    p: {
      en: `F1: ${D.errQ} race-pace error vs ${D.bestBaseQ} for the best baseline · KVENTS: SKU forecasting, WAPE 31% → 25%`,
      ko: `F1: 레이스 페이스 오차 ${D.errQ} (최고 베이스라인 ${D.bestBaseQ}) · KVENTS: SKU 수요 예측, WAPE 31% → 25%`,
    },
  },
  {
    t: { en: 'Data engineering & analytics', ko: '데이터 엔지니어링 · 분석' },
    d: {
      en: 'Pipelines and warehouses with a stated grain, data-quality gates and data that flows one way.',
      ko: '그레인을 명시하고 데이터 품질 게이트를 둔, 한 방향으로 흐르는 파이프라인과 웨어하우스.',
    },
    p: {
      en: `F1: ${D.laps} laps, ${D.checks} checks · Retail: 59.1M rows in 2.6 GB · KVENTS: PostgreSQL warehouse`,
      ko: `F1: ${D.laps}개 랩, 검사 ${D.checks}개 · 리테일: 5,910만 행을 2.6 GB로 · KVENTS: PostgreSQL 웨어하우스`,
    },
  },
  {
    t: { en: 'Applied ML & AI products', ko: '응용 ML · AI 제품' },
    d: {
      en: 'Models shipped behind APIs and apps; LLM assistants grounded in tools and graded like software.',
      ko: 'API와 앱으로 제공하는 모델, 도구에 근거하고 소프트웨어처럼 채점하는 LLM 어시스턴트.',
    },
    p: {
      en: `F1: FastAPI + Docker, AI exam 50/50 · Telco: recall 0.791 · KVENTS: Text-to-SQL RAG assistant`,
      ko: `F1: FastAPI + Docker, AI 시험 50/50 · 통신사: 재현율 0.791 · KVENTS: Text-to-SQL RAG 어시스턴트`,
    },
  },
];

export const glance = {
  id: 'glance',
  sec: { en: 'At a glance', ko: '한눈에 보기' },
  chapter: CH.overview,
  body: (P) => `
  ${head({
    eyebrow: { en: 'The 60-second version', ko: '60초 요약' },
    title: {
      en: 'Data science built end to end, and proved on data the models never saw.',
      ko: '처음부터 끝까지 구현하고, 모델이 보지 못한 데이터로 검증하는 데이터 사이언스.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:56mm 1fr 62mm;gap:9mm">
    <div class="stack">
      <div class="portrait" style="height:50mm;width:39mm"><img src="${IMG('portrait.jpg')}" alt="${L({ en: 'Portrait of Shavkatjon Yuldashev', ko: '샤브카트존 율다셰프 사진' })}"></div>
      ${meta([
        [{ en: 'Experience', ko: '경력' }, { en: `${person.experienceTotal.en} (+ backend internship)`, ko: `${person.experienceTotal.ko} (백엔드 인턴십 별도)` }],
        [{ en: 'Based in', ko: '거주' }, { en: 'Busan, South Korea', ko: '대한민국 부산' }],
        [{ en: 'Visa', ko: '체류자격' }, { en: 'D-10 Job Seeker (valid until 2027.09.16) · E-7 sponsorship required upon hiring', ko: person.visa.ko }],
        [{ en: 'Languages', ko: '어학' }, { en: 'Uzbek (native) · English, Turkish (fluent) · Korean (intermediate)', ko: '우즈베크어(모국어) · 영어, 튀르키예어(유창) · 한국어(중급)' }],
        [{ en: 'Education', ko: '학력' }, { en: 'Dong-A University, Integrated Business Management, 2022–2026', ko: '동아대학교 융합경영학과, 2022–2026' }],
      ])}
    </div>
    <div class="stack-l">
      ${label({ en: 'What I specialise in', ko: '전문 분야' })}
      ${SPECIAL.map(
        (s, i) => `<div class="rule-top--ink" style="display:grid;grid-template-columns:8mm 1fr;gap:2mm">
          <span class="mono" style="font-size:7pt;color:var(--warm-ink);padding-top:0.6mm">0${i + 1}</span>
          <div><p class="h3">${L(s.t)}</p><p class="mt-s">${L(s.d)}</p><p class="small muted mt-s">${L(s.p)}</p></div>
        </div>`,
      ).join('')}
      <p class="small muted">${L({
        en: 'Employment outcomes are as stated in my CV. Numbers from the four main projects link to public code, reports or tests.',
        ko: '재직 중 성과는 이력서 기재 내용이며, 네 가지 주요 프로젝트의 수치는 공개된 코드·보고서·테스트로 확인할 수 있습니다.',
      })}</p>
    </div>
    <div class="stack-l">
      ${label({ en: 'Proof in numbers', ko: '숫자로 보는 근거' })}
      <div class="stats stats--rule" style="grid-template-columns:1fr;gap:4.2mm">
        ${stat(D.errQ, { en: `F1 race-pace error after qualifying, ${D.heldOut} held-out weekends (best of five baselines: ${D.bestBaseQ})`, ko: `F1 예선 후 레이스 페이스 오차, 홀드아웃 ${D.heldOut}개 주말 (베이스라인 5개 중 최고 ${D.bestBaseQ})` }, { size: 'l' })}
        ${stat(`${D.covQ}%`, { en: 'of real results inside the 80% forecast ranges', ko: '80% 예측 구간 안에 든 실제 결과' })}
        ${stat('50 / 50', { en: 'AI race-engineer exam questions passed, including 5 traps', ko: 'AI 레이스 엔지니어 시험 통과 (함정 문항 5개 포함)' })}
        ${stat('0.791', { en: `Telco churn recall: ${F.telco.caught} of ${F.telco.churners} leaving customers caught`, ko: `통신사 이탈 재현율: 이탈 고객 ${F.telco.churners}명 중 ${F.telco.caught}명 탐지` })}
      </div>
    </div>
  </div>
  <div class="starts mt-l">
    ${[
      ['f1', { en: 'Flagship project', ko: '대표 프로젝트' }, { en: 'F1 Pace Intelligence', ko: 'F1 페이스 인텔리전스' }],
      ['kvents', { en: 'Experience', ko: '경력' }, { en: 'CHUST KVENTS, 2023–2026', ko: 'CHUST KVENTS, 2023–2026' }],
      ['special', { en: 'Evidence', ko: '근거' }, { en: 'Specializations matrix', ko: '전문 분야 매트릭스' }],
      ['contact', { en: 'Contact', ko: '연락처' }, { en: 'Email, website, profiles', ko: '이메일, 웹사이트, 프로필' }],
    ]
      .map(([id, k, t]) => `<a class="start" href="#p-${id}"><span><span class="start__k" style="display:block">${L(k)}</span><span class="start__t" style="display:block">${L(t)}</span></span><span class="start__p">p. ${String(P[id]).padStart(2, '0')}</span></a>`)
      .join('')}
  </div>`,
};

/* ------------------------------------------------------------------ 3 · contents */
export const contents = {
  id: 'contents',
  sec: { en: 'Contents', ko: '목차' },
  chapter: CH.overview,
  body: (P) => {
    const row = (no, t, id, sub) =>
      `<a class="toc__row${sub ? ' toc__row--sub' : ''}" href="#p-${id}">${sub ? '' : `<span class="toc__no">${no}</span>`}<span class="toc__t">${L(t)}</span><span class="toc__p">${String(P[id]).padStart(2, '0')}</span></a>`;
    return `
  <div class="grid fill" style="grid-template-columns:86mm 1fr;gap:16mm">
    <div style="display:flex;flex-direction:column">
      ${head({ eyebrow: { en: 'Contents', ko: '목차' }, title: { en: 'How this portfolio is organised', ko: '포트폴리오 구성' } })}
      <p class="mt-m">${L({
        en: 'Every project is told in the same order: the problem, the decisions that mattered, the evidence, and the limits. Flagship first, with the most space.',
        ko: '모든 프로젝트는 같은 순서로 정리했습니다. 문제, 핵심 의사결정, 근거, 그리고 한계입니다. 대표 프로젝트를 가장 먼저, 가장 자세히 다룹니다.',
      })}</p>
      <div class="mt-xl stack">
        ${label({ en: 'If you have', ko: '읽는 시간에 따라' })}
        ${[
          [{ en: '1 minute', ko: '1분' }, { en: `pages ${P.glance} and ${P.f1}: the overview and the flagship`, ko: `${P.glance}쪽, ${P.f1}쪽: 요약과 대표 프로젝트` }],
          [{ en: '5 minutes', ko: '5분' }, { en: `add pages ${P.special}–${P.kvents} (evidence, experience) and ${P['f1-results']} (F1 results)`, ko: `${P.special}–${P.kvents}쪽(근거, 경력)과 ${P['f1-results']}쪽(F1 결과) 추가` }],
          [{ en: '15 minutes', ko: '15분' }, { en: `the whole flagship, pages ${P.f1}–${P['f1-eng']}`, ko: `대표 프로젝트 전체, ${P.f1}–${P['f1-eng']}쪽` }],
        ]
          .map(([t, d]) => `<div class="rule-top" style="display:grid;grid-template-columns:22mm 1fr;gap:3mm"><p class="h4">${L(t)}</p><p class="small">${L(d)}</p></div>`)
          .join('')}
      </div>
      <div class="mt-auto stack">
        ${label({ en: 'Two kinds of evidence', ko: '두 가지 근거' })}
        <div style="display:grid;grid-template-columns:auto 1fr;gap:2.4mm 3mm;align-items:start">
          ${badge('public', PUBLIC)}<p class="small">${L({ en: 'The number can be checked in public code, a report or a test. Links are in each project.', ko: '공개된 코드, 보고서, 테스트로 확인할 수 있는 수치입니다. 링크는 각 프로젝트에 있습니다.' })}</p>
          ${badge('reported', REPORTED)}<p class="small">${L({ en: 'An employment result as stated in my CV. The work itself is not public.', ko: '이력서에 기재한 재직 중 성과입니다. 업무 자체는 공개되어 있지 않습니다.' })}</p>
        </div>
      </div>
    </div>
    <nav class="toc" aria-label="${L({ en: 'Contents', ko: '목차' })}">
      ${row('00', { en: 'At a glance', ko: '한눈에 보기' }, 'glance')}
      ${row('01', { en: 'Profile and specializations', ko: '프로필과 전문 분야' }, 'profile')}
      ${row('02', { en: 'Professional experience', ko: '경력' }, 'kvents')}
      ${row('', { en: 'CHUST KVENTS · Data Scientist & Applied ML Engineer', ko: 'CHUST KVENTS · 데이터 사이언티스트 · 응용 ML 엔지니어' }, 'kvents', true)}
      ${row('', { en: 'CHUST TEXTILE · Backend Developer, and earlier', ko: 'CHUST TEXTILE · 백엔드 개발자 외' }, 'textile', true)}
      ${row('03', { en: 'Selected projects', ko: '주요 프로젝트' }, 'projects')}
      ${row('', { en: 'F1 Pace Intelligence <small>Flagship · 11 pages</small>', ko: 'F1 페이스 인텔리전스 <small>대표 프로젝트 · 11쪽</small>' }, 'f1', true)}
      ${row('', { en: 'Telco Customer Churn', ko: '통신사 고객 이탈 예측' }, 'telco', true)}
      ${row('', { en: 'Retail Commercial Intelligence', ko: '리테일 커머셜 인텔리전스' }, 'retail', true)}
      ${row('', { en: 'Olist Marketplace', ko: 'Olist 마켓플레이스' }, 'olist', true)}
      ${row('04', { en: 'Additional work', ko: '기타 작업' }, 'more')}
      ${row('05', { en: 'Contact', ko: '연락처' }, 'contact')}
    </nav>
  </div>`;
  },
};

/* ------------------------------------------------------------------ 4 · profile */
const PRINCIPLES = [
  {
    t: { en: 'Evidence before models', ko: '모델보다 근거 먼저' },
    d: { en: 'Test which signal predicts the outcome before choosing inputs.', ko: '입력을 정하기 전에 어떤 신호가 결과를 예측하는지 먼저 검정합니다.' },
    p: { en: 'F1: a qualifying-vs-practice study set the forecaster’s inputs.', ko: 'F1: 예선 대 연습 주행 연구로 예측 모델의 입력을 정했습니다.' },
  },
  {
    t: { en: 'Validate as if it were live', ko: '실전처럼 검증' },
    d: { en: 'Held-out periods, refits on past data only, and leakage turned into a failing test.', ko: '홀드아웃 기간, 과거 데이터만으로의 재학습, 그리고 데이터 누수를 테스트 실패로 만드는 장치.' },
    p: { en: 'F1: two seasons kept out of every modelling choice.', ko: 'F1: 두 시즌을 모든 모델링 결정에서 제외했습니다.' },
  },
  {
    t: { en: 'Engineer for reproducibility', ko: '재현 가능한 엔지니어링' },
    d: { en: 'One-way pipelines, one settings file, tests and CI, packaged releases.', ko: '단방향 파이프라인, 하나의 설정 파일, 테스트와 CI, 패키징된 릴리스.' },
    p: { en: `F1: ${D.tests} tests and a Docker release · Telco: one pipeline from training to serving.`, ko: `F1: 테스트 ${D.tests}개와 Docker 릴리스 · 통신사: 학습부터 서비스까지 하나의 파이프라인.` },
  },
  {
    t: { en: 'State the limits', ko: '한계를 분명히' },
    d: { en: 'Label synthetic data, disclose what was not live, publish corrections.', ko: '합성 데이터임을 표시하고, 실시간이 아니었던 부분을 밝히고, 수정 사항을 공개합니다.' },
    p: { en: 'Retail: synthetic data labelled · F1: 0 live weekends disclosed · Olist: 14.6% corrected to 17.6%.', ko: '리테일: 합성 데이터 표시 · F1: 실시간 주말 0회 공개 · Olist: 14.6%를 17.6%로 수정.' },
  },
];

const PATH = [
  { y: '2020.09', t: { en: 'Backend Developer Intern', ko: '백엔드 개발 인턴' }, o: 'CHUST ASL CHARM SHOES' },
  { y: '2021.05', t: { en: 'Backend Developer', ko: '백엔드 개발자' }, o: 'CHUST TEXTILE' },
  { y: '2022.03', t: { en: 'Bachelor’s studies begin', ko: '학부 입학' }, o: { en: 'Dong-A University, Busan', ko: '동아대학교, 부산' } },
  { y: '2023.01', t: { en: 'Data Scientist & Applied ML Engineer', ko: '데이터 사이언티스트 · 응용 ML 엔지니어' }, o: 'CHUST KVENTS', hi: true },
  { y: '2026', t: { en: 'Four public projects', ko: '공개 프로젝트 4개' }, o: { en: 'F1 · Telco · Retail · Olist', ko: 'F1 · 통신사 · 리테일 · Olist' }, hi: true },
  { y: '2026.08', t: { en: 'Graduation', ko: '졸업' }, o: { en: 'Integrated Business Management', ko: '융합경영학과' } },
];

export const profile = {
  id: 'profile',
  sec: { en: 'Profile', ko: '프로필' },
  chapter: CH.profile,
  body: () => `
  ${head({
    no: '01',
    eyebrow: { en: 'Profile', ko: '프로필' },
    title: {
      en: 'I build data products end to end, and I say plainly where they stop working.',
      ko: '데이터 제품을 처음부터 끝까지 만들고, 어디서 한계가 오는지도 분명히 밝힙니다.',
    },
  })}
  <div class="grid mt-l" style="grid-template-columns:1fr 1fr;gap:12mm">
    <div class="stack">
      <p class="serif-lead">${L({
        en: 'I take a problem from raw data through modelling, evaluation and delivery: reproducible pipelines, models chosen against baselines, evaluation on data the model never saw, and software that people can use.',
        ko: '원천 데이터에서 모델링, 평가, 배포까지 문제 전체를 다룹니다. 재현 가능한 파이프라인, 베이스라인과 비교해 고른 모델, 모델이 보지 못한 데이터에서의 평가, 그리고 실제로 쓸 수 있는 소프트웨어가 제 방식입니다.',
      })}</p>
      <p>${L({
        en: 'I started in backend development, building Python tooling and then Django APIs and PostgreSQL schemas for two companies in Chust. I then spent three years as a data scientist and applied ML engineer at CHUST KVENTS, building a PostgreSQL warehouse, SKU-level demand forecasting, customer segmentation and a Text-to-SQL assistant.',
        ko: '백엔드 개발로 시작해 추스트의 두 회사에서 Python 도구, Django API, PostgreSQL 스키마를 만들었습니다. 이후 CHUST KVENTS에서 3년간 데이터 사이언티스트 · 응용 ML 엔지니어로 일하며 PostgreSQL 웨어하우스, SKU 단위 수요 예측, 고객 세그먼테이션, Text-to-SQL 어시스턴트를 구축했습니다.',
      })}</p>
      <p>${L({
        en: 'In 2026 I built four public projects, led by F1 Pace Intelligence, a forecasting product whose README traces every number to its source. I studied Integrated Business Management at Dong-A University in Busan, where statistics and econometrics pulled me toward data.',
        ko: '2026년에는 공개 프로젝트 4개를 만들었습니다. 대표 프로젝트인 F1 Pace Intelligence는 README의 모든 수치를 출처까지 추적할 수 있는 예측 제품입니다. 부산 동아대학교에서 융합경영학을 전공하며 통계학과 계량경제학을 통해 데이터 분야로 들어섰습니다.',
      })}</p>
    </div>
    <div>
      ${label({ en: 'How I work', ko: '일하는 방식' })}
      <div class="mt-m" style="display:grid;grid-template-columns:1fr 1fr;gap:5mm 6mm">
        ${PRINCIPLES.map(
          (p, i) => `<div class="rule-top--ink"><p class="mono" style="font-size:6.4pt;color:var(--warm-ink)">0${i + 1}</p><p class="h4 mt-s">${L(p.t)}</p><p class="small mt-s">${L(p.d)}</p><p class="small muted mt-s">${L(p.p)}</p></div>`,
        ).join('')}
      </div>
    </div>
  </div>
  <div class="mt-auto">
    ${label({ en: 'Career path', ko: '커리어 경로' })}
    <div class="mt-m" style="display:grid;grid-template-columns:repeat(${PATH.length},1fr);border-top:0.4mm solid var(--ink)">
      ${PATH.map(
        (s) => `<div style="position:relative;padding:3.4mm 3mm 0 0">
          <span style="position:absolute;top:-1.7mm;left:0;width:3mm;height:3mm;border-radius:50%;background:${s.hi ? 'var(--series)' : 'var(--paper)'};border:0.4mm solid ${s.hi ? 'var(--series)' : 'var(--ink)'}"></span>
          <p class="mono" style="font-size:6.4pt;color:var(--warm-ink)">${s.y}</p>
          <p class="h4" style="margin-top:1.2mm;font-size:8.4pt">${L(s.t)}</p>
          <p class="small muted" style="margin-top:0.6mm">${L(s.o)}</p>
        </div>`,
      ).join('')}
    </div>
  </div>`,
};

/* ------------------------------------------------------------------ 5 · specializations */
const COLS = [
  { k: 'KVENTS', s: { en: 'Job', ko: '직무' } },
  { k: 'TEXTILE', s: { en: 'Job', ko: '직무' } },
  { k: 'F1', s: { en: 'Project', ko: '프로젝트' } },
  { k: 'Telco', s: { en: 'Project', ko: '프로젝트' } },
  { k: 'Retail', s: { en: 'Project', ko: '프로젝트' } },
  { k: 'Olist', s: { en: 'Project', ko: '프로젝트' } },
];
// 2 = primary evidence, 1 = supporting
const ROWS = [
  { t: { en: 'Forecasting & time series', ko: '수요 예측 · 시계열' }, s: { en: 'Demand and race-pace forecasting, walk-forward backtests, calibrated ranges', ko: '수요·레이스 페이스 예측, 워크포워드 백테스트, 보정된 예측 구간' }, v: [2, 0, 2, 0, 0, 0] },
  { t: { en: 'Statistical analysis', ko: '통계 분석' }, s: { en: 'Rank correlation, bootstrap intervals, weighted regression, association vs cause', ko: '순위 상관, 부트스트랩 구간, 가중 회귀, 연관성과 인과의 구분' }, v: [1, 0, 2, 1, 0, 2] },
  { t: { en: 'Machine learning & validation', ko: '머신러닝 · 검증' }, s: { en: 'Gradient boosting, linear models, stratified and time-based CV, selection on business cost', ko: '그래디언트 부스팅, 선형 모델, 층화·시간 기반 교차검증, 비즈니스 비용 기준 모델 선택' }, v: [2, 0, 2, 2, 0, 0] },
  { t: { en: 'Data engineering & warehousing', ko: '데이터 엔지니어링 · 웨어하우스' }, s: { en: 'PostgreSQL and DuckDB warehouses, Parquet, star schemas, data-quality gates', ko: 'PostgreSQL·DuckDB 웨어하우스, Parquet, 스타 스키마, 데이터 품질 게이트' }, v: [2, 2, 2, 0, 2, 1] },
  { t: { en: 'Applied AI & LLM systems', ko: '응용 AI · LLM 시스템' }, s: { en: 'Tool-using agents, Text-to-SQL RAG, grounding rules, automatic evaluation', ko: '도구 사용 에이전트, Text-to-SQL RAG, 근거 규칙, 자동 평가' }, v: [2, 0, 2, 0, 0, 0] },
  { t: { en: 'APIs, deployment & quality', ko: 'API · 배포 · 품질' }, s: { en: 'FastAPI, Django / DRF, Docker, CI, pytest', ko: 'FastAPI, Django / DRF, Docker, CI, pytest' }, v: [0, 2, 2, 2, 1, 0] },
  { t: { en: 'Analytics & BI communication', ko: '분석 · BI 커뮤니케이션' }, s: { en: 'SQL analysis, KPI design, dashboards (d3, HTML, Streamlit)', ko: 'SQL 분석, KPI 설계, 대시보드 (d3, HTML, Streamlit)' }, v: [2, 0, 0, 1, 2, 2] },
];
const TOOLS = [
  [{ en: 'Data', ko: '데이터' }, 'Python · SQL (PostgreSQL, DuckDB, SQLite) · pandas · NumPy · Parquet'],
  [{ en: 'Statistics', ko: '통계' }, 'statsmodels (OLS, WLS) · SciPy · bootstrap · Spearman · conformal · Monte Carlo'],
  [{ en: 'Machine learning', ko: '머신러닝' }, 'scikit-learn · XGBoost · LightGBM · K-Means · PyTorch'],
  [{ en: 'Applied AI', ko: '응용 AI' }, { en: 'LLM agents & tool calling (Claude API, Ollama) · Text-to-SQL RAG · evaluation', ko: 'LLM 에이전트·도구 호출 (Claude API, Ollama) · Text-to-SQL RAG · 자동 평가' }],
  [{ en: 'Engineering', ko: '엔지니어링' }, 'FastAPI · Django / DRF · Docker · GitHub Actions · pytest · Ruff'],
  [{ en: 'Apps & visuals', ko: '앱 · 시각화' }, { en: 'Streamlit · d3.js · matplotlib · HTML dashboards · OpenCV · Tesseract', ko: 'Streamlit · d3.js · matplotlib · HTML 대시보드 · OpenCV · Tesseract' }],
];

export const special = {
  id: 'special',
  sec: { en: 'Specializations', ko: '전문 분야' },
  chapter: CH.profile,
  body: () => {
    const cols = `48mm repeat(${COLS.length}, 1fr)`;
    return `
  ${head({
    no: '01',
    eyebrow: { en: 'Specializations and evidence', ko: '전문 분야와 근거' },
    title: { en: 'Seven areas of strength, each backed by work you can check.', ko: '일곱 가지 강점, 모두 확인할 수 있는 작업으로 뒷받침합니다.' },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1fr 78mm;gap:11mm">
    <div class="matrix">
      <div class="matrix__row matrix__row--head" style="grid-template-columns:${cols}">
        <span class="label">${L({ en: 'Capability', ko: '역량' })}</span>
        ${COLS.map((c) => `<span class="matrix__col"><b>${c.k}</b>${L(c.s)}</span>`).join('')}
      </div>
      ${ROWS.map(
        (r) => `<div class="matrix__row" style="grid-template-columns:${cols}">
          <div class="matrix__cap"><b>${L(r.t)}</b><span>${L(r.s)}</span></div>
          ${r.v.map((x) => (x ? `<span class="dot dot--${x === 2 ? 'full' : 'part'}"></span>` : '<span></span>')).join('')}
        </div>`,
      ).join('')}
      <p class="small muted mt-s" style="display:flex;gap:5mm;align-items:center">
        <span><span class="dot dot--full" style="display:inline-block;vertical-align:-0.5mm;margin-right:1.4mm"></span>${L({ en: 'main evidence', ko: '주요 근거' })}</span>
        <span><span class="dot dot--part" style="display:inline-block;vertical-align:-0.5mm;margin-right:1.4mm"></span>${L({ en: 'supporting', ko: '보조 근거' })}</span>
        <span>${L({ en: 'Jobs: owner-reported (CV) · Projects: public repositories', ko: '직무: 이력서 기재 · 프로젝트: 공개 저장소' })}</span>
      </p>
    </div>
    <div class="stack">
      ${label({ en: 'Tools, listed only where work shows them', ko: '작업으로 입증한 도구' })}
      ${TOOLS.map(([k, v]) => `<div class="rule-top"><p class="h4" style="font-size:8.4pt">${L(k)}</p><p class="small mt-s">${v}</p></div>`).join('')}
      <p class="small muted">${L({ en: 'The CV lists my full skill set; this page keeps to skills with evidence in a project or a job.', ko: '전체 보유 기술은 이력서에 있으며, 이 페이지에는 프로젝트나 직무로 입증된 기술만 담았습니다.' })}</p>
    </div>
  </div>`;
  },
};

/* ------------------------------------------------------------------ 6 · KVENTS */
const [KV, TX, ASL] = jobs;

export const kvents = {
  id: 'kvents',
  sec: { en: 'Experience · CHUST KVENTS', ko: '경력 · CHUST KVENTS' },
  chapter: CH.experience,
  body: () => {
    const j = L(KV);
    return `
  ${head({
    no: '02',
    eyebrow: { en: 'Professional experience · 2023.01 – 2026.03', ko: '경력 · 2023.01 – 2026.03' },
    title: {
      en: 'One warehouse for scattered retail data, then forecasting, segmentation and an AI assistant on top.',
      ko: '흩어진 소매 데이터를 하나의 웨어하우스로 모으고, 그 위에 수요 예측, 세그먼테이션, AI 어시스턴트를 구축했습니다.',
    },
  })}
  <div class="grid mt-m" style="grid-template-columns:1fr 70mm;gap:10mm;align-items:start">
    <div>
      <div style="display:flex;align-items:baseline;gap:4mm;flex-wrap:wrap">
        <p class="h3">${j.role}</p><p class="label" style="color:var(--ink)">${j.org}</p><p class="small muted">${j.place}</p>
      </div>
      <p class="mt-s">${j.summary}</p>
      <div class="mt-m" style="display:grid;grid-template-columns:44mm 6mm 46mm 6mm 1fr;align-items:center">
        ${node({ t: { en: 'Sources', ko: '데이터 원천' }, s: { en: '3 stores · online platforms · head office', ko: '매장 3곳 · 온라인 플랫폼 · 본사' } })}
        ${arrow()}
        ${node({ t: { en: 'PostgreSQL warehouse', ko: 'PostgreSQL 웨어하우스' }, s: { en: 'Automated Python/SQL ingestion of sales, purchasing and stock', ko: 'Python·SQL 수집 자동화: 판매·구매·재고' }, cls: 'node--hi' })}
        ${arrow()}
        <div style="display:grid;gap:1.6mm">
          ${node({ t: { en: 'SKU-level forecasting', ko: 'SKU 단위 수요 예측' }, s: { en: 'XGBoost, LightGBM · seasonality, vendor lead times · expanding-window CV', ko: 'XGBoost, LightGBM · 계절성, 공급업체 리드타임 · 확장 윈도우 교차검증' } })}
          ${node({ t: { en: 'RFM / K-Means segmentation', ko: 'RFM / K-Means 세그먼테이션' }, s: { en: 'with price elasticity models, for stock distribution', ko: '가격 탄력성 모델과 함께, 재고 배분 최적화' } })}
          ${node({ t: { en: 'Text-to-SQL RAG assistant', ko: 'Text-to-SQL RAG 어시스턴트' }, s: { en: 'Read-only · Python, LLM APIs · natural-language questions on inventory, sales, margins', ko: '읽기 전용 · Python, LLM API · 재고·판매·이익률 자연어 조회' } })}
        </div>
      </div>
      <div class="rule-top mt-m">
        ${label({ en: 'What I did (from my CV, word for word)', ko: '주요 업무 (이력서 원문)' })}
        ${list(j.points, 'small mt-s')}
      </div>
    </div>
    <div class="stack">
      <div style="display:flex;justify-content:space-between;align-items:center">${label({ en: 'Outcomes', ko: '성과' })}${badge('reported', REPORTED)}</div>
      <div class="stats stats--rule" style="grid-template-columns:1fr;gap:3.6mm">
        ${stat('31% → 25%', { en: 'WAPE against a seasonal-naive baseline, expanding-window CV', ko: '계절성 나이브 기준 대비 WAPE, 확장 윈도우 교차검증' }, { size: 'l' })}
        ${stat('~20%', { en: 'fewer stockouts', ko: '품절 감소' }, { size: 's' })}
        ${stat('+4–8%', { en: 'gross margin from better stock distribution', ko: '재고 배분 최적화로 매출총이익률 향상' }, { size: 's' })}
        ${stat('15–20+ h', { en: 'reporting hours saved every week', ko: '주간 보고 업무 절감' }, { size: 's' })}
        ${stat('$7M', { en: 'in combined assets unified in one warehouse', ko: '하나의 웨어하우스로 통합한 자산 규모' }, { size: 's' })}
      </div>
      ${chips(j.skills)}
    </div>
  </div>`;
  },
};

/* ------------------------------------------------------------------ 7 · TEXTILE, ASL, education */
export const textile = {
  id: 'textile',
  sec: { en: 'Experience · earlier roles', ko: '경력 · 이전 직무' },
  chapter: CH.experience,
  body: () => {
    const t = L(TX);
    const a = L(ASL);
    const edu = L(person.education);
    return `
  ${head({
    no: '02',
    eyebrow: { en: 'Professional experience · 2020 – 2022', ko: '경력 · 2020 – 2022' },
    title: {
      en: 'Before data science: backend systems that kept production and stock data correct.',
      ko: '데이터 사이언스 이전: 생산·재고 데이터를 정확하게 지킨 백엔드 시스템.',
    },
    dek: {
      en: 'This is why my models ship: APIs, schemas, transactions and tests are part of how I build data products.',
      ko: '제 모델이 실제로 배포되는 이유입니다. API, 스키마, 트랜잭션, 테스트는 데이터 제품을 만드는 방식의 일부입니다.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1fr 1fr;gap:12mm">
    <div class="stack">
      <div class="rule-top--ink">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="h3">${t.role}</p><p class="mono small" style="color:var(--warm-ink)">${periodOf(TX)}</p></div>
        <p class="label mt-s" style="color:var(--ink)">${t.org} · <span class="muted">${t.place}</span></p>
      </div>
      <p>${t.summary}</p>
      ${flow([
        { t: { en: 'Yarn intake', ko: '원사 입고' } },
        { t: { en: 'Production', ko: '생산' }, s: { en: 'defect rates', ko: '불량률' } },
        { t: { en: 'Export', ko: '수출' } },
      ])}
      <p class="small muted">${L({ en: 'Tracked end to end by Django/DRF APIs on normalized PostgreSQL schemas.', ko: '정규화된 PostgreSQL 스키마 위의 Django/DRF API로 전 과정을 추적.' })}</p>
      ${list(t.points, 'small')}
      <div style="display:flex;justify-content:space-between;align-items:center" class="mt-m">${label({ en: 'Outcomes', ko: '성과' })}${badge('reported', REPORTED)}</div>
      <div class="stats stats--rule" style="grid-template-columns:repeat(3,1fr)">
        ${stat('40–60%', { en: 'faster reporting queries', ko: '리포팅 쿼리 속도 개선' }, { size: 's' })}
        ${stat('−25%', { en: 'warehouse mismatches', ko: '창고 재고 불일치' }, { size: 's' })}
        ${stat('10–15+ h', { en: 'saved every week', ko: '주당 절감 시간' }, { size: 's' })}
      </div>
    </div>
    <div class="stack-l">
      <div class="stack">
        <div class="rule-top--ink">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="h3">${a.role}</p><p class="mono small" style="color:var(--warm-ink)">${periodOf(ASL)}</p></div>
          <p class="label mt-s" style="color:var(--ink)">${a.org} · <span class="muted">${a.place}</span></p>
        </div>
        <p>${a.summary}</p>
        ${list(a.points, 'small')}
        ${chips(a.skills)}
      </div>
      <div class="stack">
        <div class="rule-top--ink">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="h3">${edu.school}</p><p class="mono small" style="color:var(--warm-ink)">${person.education.ko.period}</p></div>
          <p class="label mt-s" style="color:var(--ink)">${edu.place}</p>
        </div>
        <p>${edu.degree}</p>
        <p class="small muted">${L({ en: 'Focus', ko: '전공 중점' })}: ${edu.focus}</p>
      </div>
      <div class="panel">
        <p class="h4">${L({ en: 'What carried over into data science', ko: '데이터 사이언스로 이어진 역량' })}</p>
        <p class="small mt-s">${L({
          en: 'Normalized schemas and indexing, atomic transactions, input validation, role-based permissions and tested endpoints. The same habits run through the projects in this portfolio: read-only serving, validated inputs and CI on every push.',
          ko: '정규화된 스키마와 인덱싱, 원자적 트랜잭션, 입력 검증, 역할 기반 권한, 테스트된 엔드포인트. 같은 습관이 이 포트폴리오의 프로젝트에도 이어집니다. 읽기 전용 서비스, 검증된 입력, 푸시마다 실행되는 CI.',
        })}</p>
      </div>
    </div>
  </div>`;
  },
};

function periodOf(j) {
  // English periods read "May 2021 – Jul 2022"; the Korean CV uses "2021.05 – 2022.07": print the Korean form in both.
  return j.ko.period;
}

/* ------------------------------------------------------------------ 8 · projects overview */
const CARDS = [
  {
    id: 'telco',
    no: '02',
    t: { en: 'Telco Customer Churn', ko: '통신사 고객 이탈 예측' },
    k: { en: 'Classification · cost-based model choice', ko: '분류 · 비용 기준 모델 선택' },
    r: { en: `Recall ${F.telco.recall}: ${F.telco.caught} of ${F.telco.churners} leaving customers caught, chosen over a more accurate model that missed more than half of them`, ko: `재현율 ${F.telco.recall}: 이탈 고객 ${F.telco.churners}명 중 ${F.telco.caught}명 탐지. 절반 이상을 놓친 더 정확한 모델 대신 선택` },
    d: { en: 'IBM sample · 7,043 fictional customers', ko: 'IBM 샘플 · 가상 고객 7,043명' },
    tone: 'steel',
  },
  {
    id: 'retail',
    no: '03',
    t: { en: 'Retail Commercial Intelligence', ko: '리테일 커머셜 인텔리전스' },
    k: { en: 'Data modelling · data quality · scale', ko: '데이터 모델링 · 데이터 품질 · 규모' },
    r: { en: '59.1M rows end to end in 84 s, peak memory cut from 8.8 GB to 2.6 GB', ko: '5,910만 행을 84초에 처리, 최대 메모리 8.8 GB → 2.6 GB' },
    d: { en: 'Synthetic, M5-shaped data · results illustrative', ko: 'M5 형태 합성 데이터 · 결과는 예시' },
    tone: 'brick',
  },
  {
    id: 'olist',
    no: '04',
    t: { en: 'Olist Marketplace', ko: 'Olist 마켓플레이스' },
    k: { en: 'SQL-first analysis · live dashboard', ko: 'SQL 중심 분석 · 라이브 대시보드' },
    r: { en: 'Reviews track the on-time rate (r = 0.78) more than delivery days (r = −0.53)', ko: '리뷰는 배송 일수(r = −0.53)보다 정시 배송률(r = 0.78)과 더 밀접' },
    d: { en: 'Public dataset · 99,441 orders, 2016–2018', ko: '공개 데이터셋 · 주문 99,441건, 2016–2018' },
    tone: 'willow',
  },
];

export const projects = {
  id: 'projects',
  sec: { en: 'Selected projects', ko: '주요 프로젝트' },
  chapter: CH.projects,
  body: (P) => `
  ${head({
    no: '03',
    eyebrow: { en: 'Selected projects', ko: '주요 프로젝트' },
    title: {
      en: 'Four projects, one standard: a real problem, a defensible decision and evidence you can open.',
      ko: '네 개의 프로젝트, 하나의 기준: 실제 문제, 근거 있는 의사결정, 직접 열어 볼 수 있는 증거.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.25fr 1fr;gap:7mm">
    <a href="#p-f1" class="panel" style="background:var(--coffee);color:#eee6d9;text-decoration:none;display:flex;flex-direction:column;padding:6mm">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <span class="label" style="color:#e6bd5f">01 · ${L({ en: 'Flagship project', ko: '대표 프로젝트' })}</span>
        <span class="mono" style="font-size:6.6pt;color:#bfae9d">p. ${String(P.f1).padStart(2, '0')} – ${String(P.f1 + 10).padStart(2, '0')}</span>
      </div>
      <p style="font-family:var(--f-head);font-size:${ctx.lang === 'ko' ? '19pt;font-weight:600;letter-spacing:-0.03em' : '24pt'};line-height:1.1;margin-top:4mm;color:#eee6d9">${L({ en: 'F1 Pace Intelligence', ko: 'F1 페이스 인텔리전스' })}</p>
      <p class="small" style="color:#ddd0c1;margin-top:2mm">${L({ en: 'Forecasting · uncertainty · applied AI', ko: '예측 · 불확실성 · 응용 AI' })}</p>
      <div style="margin-top:4mm;border:0.25mm solid rgb(238 230 217 / 0.3);border-radius:1mm;padding:1.2mm;height:62mm;overflow:hidden"><img src="${IMG('f1-pitwall.jpg')}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:top left"></div>
      <p style="margin-top:4mm;color:#ddd0c1">${L({
        en: 'A complete forecasting product on public Formula 1 data: pipeline and warehouse, statistical research, a validated forecaster with calibrated ranges, a strategy model, a read-only API and app, and an AI assistant graded by an exam.',
        ko: '공개 Formula 1 데이터로 만든 완결된 예측 제품: 파이프라인과 웨어하우스, 통계 연구, 보정된 구간을 갖춘 검증된 예측 모델, 전략 모델, 읽기 전용 API와 앱, 시험으로 채점하는 AI 어시스턴트.',
      })}</p>
      <div class="stats mt-auto" style="grid-template-columns:repeat(3,1fr);gap:4mm;padding-top:4mm">
        ${[
          [D.errQ, { en: `race-pace error (best baseline ${D.bestBaseQ})`, ko: `레이스 페이스 오차 (최고 베이스라인 ${D.bestBaseQ})` }],
          [`${D.covQ}%`, { en: 'results inside 80% ranges', ko: '80% 구간 안의 실제 결과' }],
          ['50 / 50', { en: 'AI exam questions passed', ko: 'AI 시험 통과' }],
        ]
          .map(([v, l]) => `<div style="border-top:0.4mm solid #dba12c;padding-top:2.4mm"><div class="stat__v" style="color:#eee6d9;font-size:17pt">${v}</div><div class="stat__l" style="color:#ddd0c1">${L(l)}</div></div>`)
          .join('')}
      </div>
    </a>
    <div style="display:grid;grid-template-rows:repeat(3,1fr);gap:5mm">
      ${CARDS.map(
        (c) => `<a href="#p-${c.id}" class="panel tone-${c.tone}" style="background:var(--tint);text-decoration:none;color:var(--ink);display:grid;grid-template-columns:1fr auto;gap:1mm 6mm;padding:4.4mm 5mm">
          <div>
            <span class="label" style="color:var(--tone-ink)">${c.no} · ${L(c.k)}</span>
            <p style="font-family:var(--f-head);font-size:${ctx.lang === 'ko' ? '13.5pt;font-weight:600;letter-spacing:-0.025em' : '15.5pt'};line-height:1.15;margin-top:2mm">${L(c.t)}</p>
            <p class="small" style="margin-top:2mm">${L(c.r)}</p>
            <p class="small muted" style="margin-top:1.4mm">${L(c.d)}</p>
          </div>
          <span class="mono" style="font-size:6.6pt;color:var(--ink-3)">p. ${String(P[c.id]).padStart(2, '0')}</span>
        </a>`,
      ).join('')}
    </div>
  </div>`,
};

export const introPages = [cover, glance, contents, profile, special, kvents, textile, projects];
