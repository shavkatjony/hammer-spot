/**
 * Pages 9–19: F1 Pace Intelligence (flagship). Facts from the project README, model card and numbers check.
 */
import { L, esc, ctx, head, stat, decision, plate, chips, meta, links, list, node, flow, arrow, label, bars, pairBars, segbar, dotrows, callout } from './ui.mjs';
import { F, links as LK, periods, dpecDemonstrates } from './facts.mjs';
import { CH } from './pages-intro.mjs';

const IMG = (n) => `../assets/img/${n}`;
const D = F.dpec;
const SEC = { en: 'Project 01 · F1 Pace Intelligence', ko: '프로젝트 01 · F1 페이스 인텔리전스' };
const page = (id, body, extra = {}) => ({ id, sec: SEC, chapter: CH.projects, body, ...extra });
const EB = (t) => ({ en: `F1 Pace Intelligence · ${t.en}`, ko: `F1 페이스 인텔리전스 · ${t.ko}` });

const DLINKS = [
  [{ en: 'Live app', ko: '라이브 앱' }, LK.dpec.app],
  [{ en: 'Source code', ko: '소스 코드' }, LK.dpec.repo],
  [{ en: 'Model card', ko: '모델 카드' }, LK.dpec.modelCard],
  [{ en: 'Numbers check', ko: '수치 검증' }, LK.dpec.numbers],
];

/* ------------------------------------------------------------------ 9 · opener */
const opener = page(
  'f1',
  (P) => `
  <div class="grid fill" style="grid-template-columns:94mm 1fr;gap:10mm">
    <div style="display:flex;flex-direction:column">
      <p class="eyebrow"><span class="eyebrow__no">§ 03</span><span>${L({ en: 'Project 01 · Flagship', ko: '프로젝트 01 · 대표 프로젝트' })}</span></p>
      <h2 class="title" style="font-size:${ctx.lang === 'ko' ? '28pt' : '36pt'};line-height:1.02;margin-top:4mm">${L({ en: 'F1 Pace Intelligence', ko: 'F1 페이스 인텔리전스' })}</h2>
      <p class="dek" style="font-size:${ctx.lang === 'ko' ? '10.4pt' : '11.4pt'}">${L({
        en: 'A complete forecasting product on public Formula 1 timing data. I built it solo, from the first download to the deployed app, and proved it on races the model never saw.',
        ko: '공개 Formula 1 타이밍 데이터로 만든 완결된 예측 제품입니다. 첫 데이터 다운로드부터 배포된 앱까지 혼자 구축했고, 모델이 한 번도 보지 못한 레이스로 성능을 입증했습니다.',
      })}</p>
      <div class="mt-l">${meta([
        [{ en: 'Period', ko: '기간' }, { en: `${periods.dpec} · ${D.commits} commits`, ko: `${periods.dpec} · 커밋 ${D.commits}개` }],
        [{ en: 'Role', ko: '역할' }, { en: 'Solo, end to end: data, research, modelling, backend, AI, release', ko: '1인 개발, 전 과정: 데이터, 연구, 모델링, 백엔드, AI, 릴리스' }],
        [{ en: 'Data', ko: '데이터' }, { en: `Public F1 timing, 2022 Bahrain GP – 2026 Singapore GP (${D.weekendsAll} race weekends)`, ko: `공개 F1 타이밍 데이터, 2022 바레인 GP – 2026 싱가포르 GP (레이스 주말 ${D.weekendsAll}개)` }],
        [{ en: 'Stack', ko: '기술 스택' }, 'Python · DuckDB SQL · Parquet · statsmodels · FastAPI · Docker · Claude API / Ollama · pytest · GitHub Actions'],
      ])}</div>
      <div class="mt-auto">${links(DLINKS)}</div>
    </div>
    <div style="display:flex;flex-direction:column;min-height:0">
      ${plate({
        src: IMG('f1-pitwall.jpg'),
        alt: { en: 'The DPEC pit wall app on the 2025 Singapore Grand Prix', ko: '2025 싱가포르 그랑프리의 DPEC 피트 월 앱' },
        no: 'I',
        height: 72,
        caption: {
          en: 'The public copy on the 2025 Singapore GP: each car’s forecast after qualifying (○), its 80% range and the real result (◆). 19 of 20 landed inside. Right: the tyres each car used.',
          ko: '2025 싱가포르 GP의 공개 버전: 예선 후 각 차량의 예측(○), 80% 예측 구간, 실제 결과(◆). 20대 중 19대가 구간 안. 오른쪽: 각 차량의 타이어.',
        },
      })}
      <div class="mt-m">
        <p class="label" style="color:var(--warm-ink)">${L({ en: 'What it demonstrates', ko: '보여 주는 역량' })}</p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.6mm 5mm;margin-top:2.4mm">
          ${L(dpecDemonstrates).map((d, i) => `<p class="small" style="color:var(--ink);border-top:0.25mm solid var(--rule);padding-top:1.4mm"><span class="mono" style="color:var(--warm-ink);font-size:6.6pt;margin-right:1.6mm">0${i + 1}</span>${d}</p>`).join('')}
        </div>
      </div>
      <div class="mt-l">
        <p class="label" style="color:var(--warm-ink)">${L({ en: 'Inside this case study', ko: '이 케이스 스터디의 구성' })}</p>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1.4mm 5mm;margin-top:2.4mm">
          ${[
            ['f1-problem', { en: 'The problem', ko: '문제 정의' }],
            ['f1-arch', { en: 'Architecture', ko: '아키텍처' }],
            ['f1-data', { en: 'Data engineering', ko: '데이터 엔지니어링' }],
            ['f1-research', { en: 'Research', ko: '연구' }],
            ['f1-validation', { en: 'Validation', ko: '검증' }],
            ['f1-results', { en: 'Results', ko: '결과' }],
            ['f1-strategy', { en: 'Strategy model', ko: '전략 모델' }],
            ['f1-product', { en: 'Product', ko: '제품' }],
            ['f1-ai', { en: 'Applied AI', ko: '응용 AI' }],
            ['f1-eng', { en: 'Engineering & limits', ko: '엔지니어링과 한계' }],
          ]
            .map(([id, t]) => `<a href="#p-${id}" class="small" style="display:flex;gap:1.6mm;align-items:baseline;color:var(--ink);text-decoration:none;border-top:0.25mm solid var(--rule);padding-top:1.4mm"><span class="mono" style="color:var(--gold);font-size:6.6pt">p.${String(P[id]).padStart(2, '0')}</span><span>${L(t)}</span></a>`)
            .join('')}
        </div>
      </div>
      <div class="stats stats--rule mt-auto" style="grid-template-columns:1.3fr repeat(4,1fr);gap:5mm">
        ${stat(D.errQ, { en: `race-pace error after qualifying (best of 5 baselines: ${D.bestBaseQ})`, ko: `예선 후 레이스 페이스 오차 (베이스라인 5개 중 최고 ${D.bestBaseQ})` })}
        ${stat(`${D.covQ}%`, { en: 'of real results inside the 80% ranges', ko: '80% 예측 구간 안에 든 실제 결과' })}
        ${stat(`${D.stop.model}%`, { en: `pit-stop counts matched (always one stop: ${D.stop.base}%)`, ko: `피트스톱 횟수 일치 ("항상 1스톱" ${D.stop.base}%)` })}
        ${stat('50 / 50', { en: 'AI exam questions passed, incl. 5 traps', ko: 'AI 시험 통과 (함정 문항 5개 포함)' })}
        ${stat(D.tests, { en: `tests in CI · ${D.checks} data checks per build`, ko: `CI 테스트 · 빌드마다 데이터 검사 ${D.checks}개` })}
      </div>
    </div>
  </div>`,
  { theme: 'dark' },
);

/* ------------------------------------------------------------------ 10 · problem */
const QUESTIONS = [
  { w: { en: 'Before', ko: '레이스 전' }, q: { en: 'How fast will each car be over the whole race?', ko: '레이스 전체 거리에서 각 차량은 얼마나 빠를까?' }, s: { en: 'Race pace: median clean race lap, as % behind the fastest car', ko: '레이스 페이스: 클린 레이스 랩 중앙값, 가장 빠른 차량 대비 %' } },
  { w: { en: 'Before', ko: '레이스 전' }, q: { en: 'How sure can we be?', ko: '얼마나 확신할 수 있을까?' }, s: { en: 'An 80% range and three chances: best pace, top-3 pace, beating the teammate', ko: '80% 예측 구간과 세 가지 확률: 최고 페이스, 상위 3위 페이스, 팀 동료 상대 우위' } },
  { w: { en: 'Before', ko: '레이스 전' }, q: { en: 'What should the team do?', ko: '팀은 무엇을 해야 할까?' }, s: { en: 'How many pit stops, and roughly when', ko: '피트스톱은 몇 번, 대략 언제' } },
  { w: { en: 'After', ko: '레이스 후' }, q: { en: 'Was the forecast right?', ko: '예측은 맞았는가?' }, s: { en: 'Scored against the official result', ko: '공식 결과로 채점' } },
  { w: { en: 'After', ko: '레이스 후' }, q: { en: 'Where did the time go?', ko: '시간은 어디서 잃었는가?' }, s: { en: 'Gaps split into pace, tyres and traffic', ko: '격차를 페이스·타이어·트래픽으로 분해' } },
];

const problem = page(
  'f1-problem',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'The problem', ko: '문제 정의' }),
    title: {
      en: 'Forecast a race before it happens, with public data only, and prove it on races the model never saw.',
      ko: '공개 데이터만으로 레이스 결과를 미리 예측하고, 모델이 보지 못한 레이스로 그 성능을 입증한다.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.15fr 1fr 1fr;gap:9mm">
    <div>
      ${label({ en: 'Five questions the system answers', ko: '시스템이 답하는 다섯 가지 질문' })}
      <div class="mt-m">
        ${QUESTIONS.map(
          (q, i) => `<div style="display:grid;grid-template-columns:7mm 1fr;gap:3mm;padding:2.3mm 0;border-top:0.22mm solid var(--rule)">
            <span class="num-chip" style="width:6mm;height:6mm">${i + 1}</span>
            <div><p class="mono" style="font-size:5.9pt;letter-spacing:0.12em;color:var(--warm-ink);text-transform:uppercase">${L(q.w)}</p><p class="h4" style="margin-top:0.8mm">${L(q.q)}</p><p class="small muted" style="margin-top:0.6mm">${L(q.s)}</p></div>
          </div>`,
        ).join('')}
      </div>
    </div>
    <div class="stack">
      ${label({ en: 'Why it is hard', ko: '어려운 이유' })}
      <div class="stats stats--rule" style="grid-template-columns:1fr;gap:4mm">
        ${stat(`${D.clean.all}%`, { en: `of laps show a car’s real pace (${D.clean.race}% in races, ${D.clean.quali}% in qualifying). The rest must be identified and set aside.`, ko: `의 랩만 차량의 실제 페이스를 보여 줍니다(결승 ${D.clean.race}%, 예선 ${D.clean.quali}%). 나머지는 찾아내 제외해야 합니다.` }, { size: 'l' })}
      </div>
      ${list([
        { en: '<b>Not public:</b> fuel loads, setups, tyre temperatures and pressures, engine modes; in 2026 also the battery (ERS) and active-aero state.', ko: '<b>비공개 정보:</b> 연료 탑재량, 셋업, 타이어 온도와 압력, 엔진 모드. 2026년에는 배터리(ERS)와 액티브 에어로 상태까지.' },
        { en: '<b>Little to go on:</b> up to three practice sessions and one qualifying before each race.', ko: '<b>부족한 근거:</b> 레이스 전 최대 세 번의 연습 주행과 한 번의 예선뿐.' },
        { en: '<b>Moving source:</b> since October 2026 F1 timing data needs a paid login.', ko: '<b>바뀐 데이터 환경:</b> 2026년 10월부터 F1 타이밍 데이터에 유료 로그인이 필요.' },
      ], 'small')}
    </div>
    <div class="stack">
      ${label({ en: 'Why it matters beyond F1', ko: 'F1 너머의 의미' })}
      <p class="serif-lead" style="font-size:${ctx.lang === 'ko' ? '11pt' : '12.4pt'}">${L({ en: 'Formula 1 is the setting, not the point.', ko: 'Formula 1은 무대일 뿐, 핵심은 아닙니다.' })}</p>
      <p class="small">${L({
        en: 'The same problem appears in demand, energy, logistics and manufacturing forecasting: data that arrives over time, noisy and incomplete; a few weak early signals; and a plan that has to be made before the outcome is known.',
        ko: '같은 문제가 수요, 에너지, 물류, 제조 예측에서도 나타납니다. 시간에 따라 쌓이는 잡음 많고 불완전한 데이터, 몇 가지 약한 초기 신호, 그리고 결과를 알기 전에 세워야 하는 계획.',
      })}</p>
      <div class="panel mt-m">
        <p class="h4">${L({ en: 'Team DPEC', ko: 'Team DPEC' })}</p>
        <p class="small mt-s">${L({
          en: 'To keep the work concrete, the system acts as the analytics office of one imaginary team that adopts the two Mercedes cars. It forecasts every car; strategy advice and debriefs are written for “our” two.',
          ko: '작업을 구체적으로 만들기 위해, 시스템은 두 대의 메르세데스 차량을 자기 팀으로 삼은 가상 팀의 분석실 역할을 합니다. 모든 차량을 예측하고, 전략 조언과 디브리프는 “우리” 두 대를 위해 작성합니다.',
        })}</p>
      </div>
      <div class="mt-auto">${chips([
        { en: 'Data engineering', ko: '데이터 엔지니어링' },
        { en: 'Analytics & statistics', ko: '분석 · 통계' },
        { en: 'Forecasting & ML', ko: '예측 · ML' },
        { en: 'ML engineering', ko: 'ML 엔지니어링' },
        { en: 'Backend', ko: '백엔드' },
        { en: 'Applied AI', ko: '응용 AI' },
      ])}<p class="small muted mt-s">${L({ en: 'Organised as six disciplines, each with its own document: what exists, how it is tested, where it falls short.', ko: '여섯 분야로 나누어 진행했고, 분야마다 구현 내용·테스트 방법·한계를 정리한 문서가 있습니다.' })}</p></div>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 11 · architecture */
const lane = (k, d, content) =>
  `<div class="lane"><div class="lane__k"><p class="label">${L(k)}</p><p>${L(d)}</p></div><div>${content}</div></div>`;

const architecture = page(
  'f1-arch',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Architecture', ko: '아키텍처' }),
    title: {
      en: 'One system, four layers. Data flows one way, models see only the past, serving only reads.',
      ko: '하나의 시스템, 네 개의 계층. 데이터는 한 방향으로 흐르고, 모델은 과거만 보며, 서비스는 읽기만 합니다.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1fr 62mm;gap:10mm">
    <div style="display:grid;gap:6mm;align-content:start">
      ${lane({ en: 'Data', ko: '데이터' }, { en: 'Downloaded once, never edited', ko: '한 번만 내려받고, 수정하지 않음' }, flow([
        { t: { en: 'Official F1 timing', ko: '공식 F1 타이밍' }, s: { en: 'through FastF1', ko: 'FastF1 경유' } },
        { t: { en: 'Raw store', ko: '원본 저장소' }, s: { en: 'Parquet + SHA-256 per file', ko: '파일별 Parquet + SHA-256' }, m: D.rawGb },
        { t: { en: 'DuckDB warehouse', ko: 'DuckDB 웨어하우스' }, s: { en: `${D.tables} tables from plain SQL`, ko: `순수 SQL로 만든 테이블 ${D.tables}개` }, m: `≈ ${D.whMb}`, cls: 'node--hi' },
        { t: { en: 'Data checks', ko: '데이터 검사' }, s: { en: 'after every build', ko: '빌드마다 실행' }, m: `${D.checks} ${L({ en: 'checks', ko: '개' })}` },
      ]))}
      ${lane({ en: 'Models', ko: '모델' }, { en: 'Refitted on earlier races only', ko: '이전 레이스만으로 재학습' }, flow([
        { t: { en: 'Forecaster', ko: '예측 모델' }, s: { en: 'shared weighted regression · 80% ranges · chances', ko: '공유 가중 회귀 · 80% 구간 · 확률' }, cls: 'node--hi' },
        { t: { en: 'Strategy', ko: '전략' }, s: { en: 'tyre wear, pit loss · 1-, 2-, 3-stop plans', ko: '타이어 마모, 피트 손실 · 1·2·3스톱 계획' } },
        { t: { en: 'Public record', ko: '공개 기록' }, s: { en: 'frozen before the race, scored after', ko: '레이스 전 고정, 레이스 후 채점' } },
        { t: { en: 'Debrief', ko: '디브리프' }, s: { en: 'where the time went', ko: '시간을 어디서 잃었는가' } },
      ]))}
      ${lane({ en: 'Product', ko: '제품' }, { en: 'Read-only: visitors can’t change anything', ko: '읽기 전용: 방문자는 아무것도 바꿀 수 없음' }, flow([
        { t: { en: 'AI race engineer', ko: 'AI 레이스 엔지니어' }, s: { en: `${D.tools} read-only tools · Claude API or Ollama`, ko: `읽기 전용 도구 ${D.tools}개 · Claude API 또는 Ollama` } },
        { t: 'FastAPI', s: { en: 'read-only service', ko: '읽기 전용 서비스' }, m: `${D.endpoints} ${L({ en: 'endpoints', ko: '개 엔드포인트' })}` },
        { t: { en: 'Pit wall web app', ko: '피트 월 웹 앱' }, s: { en: `${D.windows} linked windows · ${D.layouts} layouts · no framework`, ko: `연결된 창 ${D.windows}개 · 레이아웃 ${D.layouts}개 · 프레임워크 없음` } },
      ]))}
      ${lane({ en: 'Release', ko: '릴리스' }, { en: 'The public copy', ko: '공개 버전' }, flow([
        { t: { en: 'Data snapshot', ko: '데이터 스냅샷' }, s: { en: 'on a GitHub release', ko: 'GitHub 릴리스에 포함' } },
        { t: { en: 'Docker image', ko: 'Docker 이미지' }, s: { en: 'built, started and checked in CI', ko: 'CI에서 빌드·실행·검증' } },
        { t: 'GitHub Container Registry', s: 'ghcr.io' },
        { t: 'Render', s: { en: 'read-only public copy', ko: '읽기 전용 공개 버전' } },
      ]))}
    </div>
    <div class="stack">
      ${label({ en: 'Rules that hold it together', ko: '설계를 지탱하는 규칙' })}
      ${[
        [{ en: 'Data flows one way', ko: '데이터는 한 방향으로' }, { en: 'Raw files are never edited; the warehouse can be deleted and rebuilt from them at any time.', ko: '원본 파일은 수정하지 않으며, 웨어하우스는 언제든 지우고 원본에서 다시 만들 수 있습니다.' }],
        [{ en: 'Models only see the past', ko: '모델은 과거만 본다' }, { en: 'Every forecast and strategy call uses races strictly before the one it is about.', ko: '모든 예측과 전략 판단은 해당 레이스보다 엄격히 이전의 레이스만 사용합니다.' }],
        [{ en: 'Serving only reads', ko: '서비스는 읽기만' }, { en: 'The API opens the warehouse read-only, the assistant’s tools can’t write, and the public copy makes no live AI calls.', ko: 'API는 웨어하우스를 읽기 전용으로 열고, 어시스턴트 도구는 쓰기가 불가능하며, 공개 버전은 실시간 AI 호출을 하지 않습니다.' }],
        [{ en: 'One settings file', ko: '하나의 설정 파일' }, { en: 'Every threshold lives in config/dpec.yaml; runs are reproducible byte for byte.', ko: '모든 임계값은 config/dpec.yaml 한 곳에 있고, 실행 결과는 바이트 단위로 재현됩니다.' }],
      ]
        .map(([t, d]) => `<div class="rule-top"><p class="h4">${L(t)}</p><p class="small mt-s">${L(d)}</p></div>`)
        .join('')}
      <div class="panel mt-auto">
        <p class="h4">${L({ en: `${D.adrs} decision records, ${D.cases} research case studies`, ko: `의사결정 기록 ${D.adrs}개, 연구 케이스 스터디 ${D.cases}개` })}</p>
        <p class="small mt-s">${L({ en: 'Every design choice and its trade-off is written down.', ko: '모든 설계 선택과 그 트레이드오프를 문서로 남겼습니다.' })}</p>
        <div class="mt-s">${links([[{ en: 'Architecture', ko: '아키텍처' }, LK.dpec.architecture], [{ en: 'Decision records', ko: '의사결정 기록' }, LK.dpec.decisions]])}</div>
      </div>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 12 · data engineering */
const data = page(
  'f1-data',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Data engineering', ko: '데이터 엔지니어링' }),
    title: {
      en: 'A warehouse that can explain every lap, and the problems it caught in the official feed.',
      ko: '모든 랩을 설명할 수 있는 웨어하우스, 그리고 공식 데이터에서 찾아낸 문제들.',
    },
  })}
  <div class="stats stats--rule mt-l" style="grid-template-columns:repeat(6,1fr);gap:5mm">
    ${stat(D.sessions, { en: 'sessions, 2022–2026', ko: '세션, 2022–2026' }, { size: 's' })}
    ${stat(D.laps, { en: 'laps, each with a reason code', ko: '랩, 모두 사유 코드 보유' }, { size: 's' })}
    ${stat(D.weather, { en: 'weather readings', ko: '날씨 기록' }, { size: 's' })}
    ${stat(D.rawGb, { en: 'raw Parquet, SHA-256 per file', ko: '원본 Parquet, 파일별 SHA-256' }, { size: 's' })}
    ${stat(D.tables, { en: `tables, about ${D.whMb}, rebuilt from SQL`, ko: `테이블, 약 ${D.whMb}, SQL로 재구축` }, { size: 's' })}
    ${stat(D.checks, { en: 'checks after every build', ko: '빌드마다 실행되는 검사' }, { size: 's' })}
  </div>
  <div class="grid fill mt-l" style="grid-template-columns:1fr 1fr 1fr;gap:9mm">
    <div>
      <p class="chart-k">${L({ en: 'Laps that show a car’s real pace', ko: '실제 페이스를 보여 주는 랩의 비율' })}</p>
      ${bars(
        [
          { label: { en: 'All laps', ko: '전체 랩' }, value: D.clean.all, display: `${D.clean.all}%`, hi: true },
          { label: { en: 'Race laps', ko: '결승 랩' }, value: D.clean.race, display: `${D.clean.race}%` },
          { label: { en: 'Qualifying laps', ko: '예선 랩' }, value: D.clean.quali, display: `${D.clean.quali}%` },
        ],
        { max: 100, labelW: 28, ticks: [0, 25, 50, 75, 100], fmt: (v) => `${v}%` },
      )}
      <p class="small mt-m">${L({
        en: `Every lap gets one reason code: <span class="mono">clean</span>, or the first of ${D.rules} rules it breaks, in a fixed order: pit laps, the first lap, red flags, safety cars, yellow flags, deleted times, wet tyres, laps slower than 107% of the session’s clean median, and a few more.`,
        ko: `모든 랩에는 사유 코드가 하나씩 붙습니다. <span class="mono">clean</span> 또는 정해진 순서의 규칙 ${D.rules}개 중 처음 어긴 규칙입니다. 피트 랩, 첫 랩, 레드 플래그, 세이프티 카, 옐로 플래그, 삭제된 기록, 웨트 타이어, 세션 클린 랩 중앙값의 107%보다 느린 랩 등.`,
      })}</p>
      <p class="small muted mt-s">${L({ en: 'Wet races flag themselves: Japan 2022 and São Paulo 2024 have no clean race laps at all.', ko: '비가 온 레이스는 스스로 드러납니다. 2022 일본과 2024 상파울루에는 클린 레이스 랩이 하나도 없습니다.' })}</p>
    </div>
    <div class="stack">
      ${label({ en: 'Found in the official feed, fixed in the pipeline', ko: '공식 데이터에서 찾아 파이프라인에서 해결한 문제' })}
      ${list([
        { en: 'Sprint-qualifying results without driver IDs', ko: '드라이버 ID가 없는 스프린트 예선 결과' },
        { en: '2026 practice sessions without team names', ko: '팀 이름이 없는 2026 연습 주행 세션' },
        { en: 'Teams renamed between seasons, fixed with an ID map', ko: '시즌 사이에 바뀐 팀 이름, ID 매핑으로 해결' },
        { en: 'A track-temperature sensor that sometimes reads exactly 0 °C, now treated as missing', ko: '가끔 정확히 0 °C를 기록하는 노면 온도 센서, 결측으로 처리' },
        { en: 'A race that got shorter: Montreal, 70 laps until 2025, 68 in 2026', ko: '짧아진 레이스: 몬트리올, 2025년까지 70랩, 2026년 68랩' },
      ], 'small')}
      ${decision({
        k: { en: 'Decision', ko: '의사결정' },
        t: { en: 'Store raw once, rebuild everything else from plain SQL.', ko: '원본은 한 번만 저장하고, 나머지는 모두 순수 SQL로 다시 만든다.' },
        why: {
          en: 'Every number traces back to a file and a query. Each SQL check returns the rows that break its rule, so a failure points straight at the bad data. Downloads resume safely after an interruption.',
          ko: '모든 수치를 파일과 쿼리까지 추적할 수 있습니다. 각 SQL 검사는 규칙을 어긴 행을 반환하므로 실패가 곧바로 문제 데이터를 가리킵니다. 다운로드는 중단되어도 안전하게 이어집니다.',
        },
      })}
    </div>
    <div style="display:flex;flex-direction:column">
      ${plate({
        src: IMG('f1-telemetry.png'),
        alt: { en: 'Two qualifying laps at Bahrain 2024 aligned by distance', ko: '거리 기준으로 정렬한 2024 바레인 예선 랩 두 개' },
        no: 'II',
        height: 76,
        contain: true,
        caption: {
          en: 'Telemetry in the local app: two Bahrain 2024 qualifying laps (Verstappen, Leclerc) aligned by distance, with the time gap along the lap.',
          ko: '로컬 앱의 텔레메트리: 거리 기준으로 정렬한 2024 바레인 예선 랩 두 개(베르스타펜, 르클레르)와 랩 전체의 시간 차이.',
        },
      })}
      <p class="small mt-m">${L({
        en: 'Race pace, fuel-corrected tyre wear, track evolution, practice long runs and pit-stop cost are each defined once, in SQL, and everything downstream reads those tables.',
        ko: '레이스 페이스, 연료 보정 타이어 마모, 트랙 변화, 연습 주행 롱런, 피트스톱 비용을 SQL로 한 번씩만 정의하고, 이후 모든 단계는 그 테이블을 읽습니다.',
      })}</p>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 13 · research */
const research = page(
  'f1-research',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Research before modelling', ko: '모델링 전 연구' }),
    title: {
      en: 'Research came first: the data, not intuition, chose the model’s inputs.',
      ko: '연구가 먼저였습니다. 모델의 입력은 직관이 아니라 데이터가 정했습니다.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.3fr 1fr;gap:11mm">
    <div style="display:flex;flex-direction:column">
      <p class="chart-k">${L({ en: 'Which pre-race signal predicts Sunday’s race pace?', ko: '어떤 레이스 전 신호가 일요일 레이스 페이스를 예측할까?' })}</p>
      ${plate({
        src: IMG('f1-practice-vs-race.png'),
        alt: { en: 'Box plot of per-weekend Spearman correlation with race pace', ko: '주말별 레이스 페이스와의 Spearman 상관 상자 그림' },
        no: 'III',
        height: 92,
        contain: true,
        caption: {
          en: `Spearman correlation with race pace, one value per dry weekend (${D.dryWeekends} weekends, 2022–2026). Figure from the project’s research report.`,
          ko: `레이스 페이스와의 Spearman 상관, 건조 노면 주말마다 하나의 값(${D.dryWeekends}개 주말, 2022–2026). 프로젝트 연구 보고서의 그림.`,
        },
      })}
      <div class="stats stats--rule mt-l" style="grid-template-columns:repeat(3,1fr);gap:5mm">
        ${stat(D.spearmanQ, { en: 'median Spearman, qualifying', ko: 'Spearman 중앙값, 예선' }, { size: 'l' })}
        ${stat(D.spearmanP, { en: 'median Spearman, practice long runs', ko: 'Spearman 중앙값, 연습 주행 롱런' }, { size: 'l' })}
        ${stat(`${D.ciLo} … ${D.ciHi}`, { en: 'bootstrap 95% interval for the difference: not luck', ko: '차이의 부트스트랩 95% 구간: 우연이 아님' }, { size: 's' })}
      </div>
    </div>
    <div class="stack">
      ${decision({
        k: { en: 'Decision', ko: '의사결정' },
        t: { en: 'Build the forecaster on qualifying and recent form. Practice long runs are not among its inputs.', ko: '예측 모델은 예선과 최근 폼을 기반으로 만든다. 연습 주행 롱런은 입력에서 제외한다.' },
        why: { en: 'Practice long runs look like race stints, but over 86 dry weekends they predicted race pace far less well than qualifying, so they stayed out of the model.', ko: '연습 주행 롱런은 레이스 주행과 비슷해 보이지만, 건조 노면 86개 주말에서 예선보다 레이스 페이스를 훨씬 덜 예측했기 때문에 모델에서 제외했습니다.' },
      })}
      ${label({ en: 'Two more findings that shaped the system', ko: '시스템을 바꾼 두 가지 발견' })}
      <div class="rule-top">
        <p class="h4">${L({ en: 'Practice overstates race tyre wear', ko: '연습 주행은 레이스 타이어 마모를 과대평가한다' })}</p>
        <p class="small mt-s">${L({
          en: `Bahrain 2024: practice suggested ${D.wearPractice} s lost per lap of tyre age; the race showed ${D.wearRace} s. So the strategy model forecasts race wear from practice <i>and</i> the circuit’s history, never from practice alone.`,
          ko: `2024 바레인: 연습 주행에서는 타이어 사용 랩당 ${D.wearPractice}초 손실, 레이스에서는 ${D.wearRace}초. 그래서 전략 모델은 연습 주행과 서킷의 과거 기록을 함께 써서 레이스 마모를 예측하고, 연습 주행만으로는 예측하지 않습니다.`,
        })}</p>
      </div>
      <div class="rule-top">
        <p class="h4">${L({ en: 'Tracks get quicker during a session', ko: '세션이 진행될수록 트랙은 빨라진다' })}</p>
        <p class="small mt-s">${L({
          en: `In all ${D.evoSessions} reliable qualifying sessions, lap times fell as the session went on, by a median of ${D.evoRate} every 10 minutes.`,
          ko: `신뢰할 수 있는 예선 세션 ${D.evoSessions}개 모두에서 세션이 진행될수록 랩 타임이 줄었고, 그 폭은 10분마다 중앙값 ${D.evoRate}였습니다.`,
        })}</p>
      </div>
      <div class="mt-m">${chips(['Spearman', { en: 'Bootstrap intervals', ko: '부트스트랩 구간' }, { en: 'Fuel-corrected wear', ko: '연료 보정 마모' }, { en: 'Track evolution', ko: '트랙 변화' }])}</div>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 14 · validation design */
const WEEKS = [0.42, 0.52, 0.62, 0.72, 0.82];
/** Verbatim from the repository (tests/dpec/test_forecasting.py). */
const LEAK_TEST = `def test_walk_forward_never_sees_the_future():
    table = fake_table()
    before = walk_forward(table, baselines.BASELINES)
    changed = table.copy()
    future = changed["round"] >= 5
    changed.loc[future, TARGET] = 99.0  # rewrite what happened in rounds 5 and 6
    after = walk_forward(changed, baselines.BASELINES)
    early = before["round"] < 5
    pd.testing.assert_frame_equal(before[early], after[early])  # rounds 2-4: not one guess moved`;
const pyHighlight = (code) =>
  code
    .split('\n')
    .map((line) => {
      const i = line.indexOf('  # ');
      const [src, cmt] = i >= 0 ? [line.slice(0, i), line.slice(i)] : [line, ''];
      const body = esc(src)
        .replace(/^def (\w+)/, '<span class="code__k">def</span> <b>$1</b>')
        .replace(/&quot;(\w+)&quot;/g, (m) => `<span class="code__s">${m}</span>`);
      return body + (cmt ? `<span class="code__c">${esc(cmt)}</span>` : '');
    })
    .join('\n');

const validation = page(
  'f1-validation',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Forecasting and validation', ko: '예측과 검증' }),
    title: {
      en: 'Validated as if it were live: refitted before every weekend, judged on two seasons it never touched.',
      ko: '실전처럼 검증했습니다. 매 주말 전에 다시 학습하고, 한 번도 건드리지 않은 두 시즌으로 평가했습니다.',
    },
  })}
  <div class="grid mt-l" style="grid-template-columns:1.25fr 1fr;gap:11mm">
    <div>
      <p class="chart-k">${L({ en: 'How the seasons were used', ko: '시즌별 데이터 사용 방식' })}</p>
      <div class="tl">
        <div class="tl__bar" style="grid-template-columns:1fr 2fr 2fr">
          <div class="tl__seg" style="background:var(--pumice)"><b>${L({ en: 'History', ko: '과거 데이터' })}</b><span class="muted">${L({ en: 'training data only', ko: '학습용으로만 사용' })}</span></div>
          <div class="tl__seg" style="background:var(--tint-gold)"><b>${L({ en: 'Development', ko: '개발' })}</b><span class="muted">${L({ en: 'every setting chosen here', ko: '모든 설정을 여기서 결정' })}</span></div>
          <div class="tl__seg" style="background:var(--series);color:#fff"><b>${L({ en: 'Held out: reported', ko: '홀드아웃: 보고 대상' })}</b><span style="opacity:.88">${L({ en: `${D.heldOut} weekends · ${D.driverRaces} driver-races`, ko: `주말 ${D.heldOut}개 · 드라이버-레이스 ${D.driverRaces}건` })}</span></div>
        </div>
        <div class="tl__years" style="grid-template-columns:1fr 2fr 2fr"><span>2022</span><span>2023 – 2024</span><span>2025 – 2026 · ${L({ en: 'used for no choice', ko: '어떤 결정에도 사용 안 함' })}</span></div>
      </div>
      <p class="chart-k mt-l">${L({ en: 'Expanding window: before each weekend, the model sees only the races before it', ko: '확장 윈도우: 매 주말 전, 모델은 그 이전 레이스만 봅니다' })}</p>
      <div class="wf">
        ${WEEKS.map(
          (w, i) => `<span class="wf__label">${L({ en: 'Weekend', ko: '주말' })} ${['k', 'k+1', 'k+2', 'k+3', 'k+4'][i]}</span>
          <div class="wf__track"><span class="wf__train" style="flex:0 0 calc(${(w * 100).toFixed(0)}% - 4mm)"></span><span class="wf__test"></span><span class="wf__future"></span></div>`,
        ).join('')}
      </div>
      <div class="wf__legend mt-m">
        <span><i style="background:var(--tint-gold)"></i>${L({ en: 'Refit on earlier races only', ko: '이전 레이스로만 재학습' })}</span>
        <span><i style="background:var(--series)"></i>${L({ en: 'Forecast after practice, then after qualifying; scored after the race', ko: '연습 주행 후, 예선 후 예측. 레이스 후 채점' })}</span>
        <span><i style="background:repeating-linear-gradient(135deg, var(--rule) 0 1mm, transparent 1mm 2mm)"></i>${L({ en: 'The future: hidden in code', ko: '미래: 코드에서 숨김' })}</span>
      </div>
      <div class="stats stats--rule mt-l" style="grid-template-columns:repeat(4,1fr);gap:5mm">
        ${stat(D.heldOut, { en: 'held-out race weekends', ko: '홀드아웃 레이스 주말' }, { size: 's' })}
        ${stat(D.driverRaces, { en: 'driver-races scored', ko: '채점한 드라이버-레이스' }, { size: 's' })}
        ${stat('2', { en: 'forecasts per weekend', ko: '주말당 예측 횟수' }, { size: 's' })}
        ${stat('5', { en: 'baselines to beat', ko: '넘어야 할 베이스라인' }, { size: 's' })}
      </div>
    </div>
    <div class="stack">
      <div class="rule-top--ink"><p class="h4">${L({ en: 'One shared model', ko: '하나의 공유 모델' })}</p><p class="small mt-s">${L({ en: 'A weighted regression (statsmodels WLS) for every track and year, with at most three inputs. Simple on purpose.', ko: '모든 서킷과 연도에 쓰는 가중 회귀(statsmodels WLS), 입력은 최대 3개. 의도적으로 단순하게.' })}</p></div>
      <div class="rule-top--ink"><p class="h4">${L({ en: 'Ranges from its own errors (split-conformal)', ko: '자신의 오차로 만든 구간 (split-conformal)' })}</p>
        <p class="formula mt-s">${L({ en: '80% range = forecast ± q<sub>80</sub>( |error| over the previous 10 forecast weekends )', ko: '80% 구간 = 예측 ± q<sub>80</sub>( 직전 10개 예측 주말의 |오차| )' })}</p>
        <p class="small mt-s">${L({ en: 'The ranges widen when the model has been wrong lately, and narrow when it has not.', ko: '최근에 많이 틀렸다면 구간이 넓어지고, 그렇지 않으면 좁아집니다.' })}</p></div>
      <div class="rule-top--ink"><p class="h4">${L({ en: 'Chances by simulation', ko: '시뮬레이션으로 확률 계산' })}</p><p class="small mt-s">${L({ en: `Best race pace, top-3 pace and beating the teammate, from ${D.stop.draws} simulated race orders.`, ko: `최고 레이스 페이스, 상위 3위 페이스, 팀 동료 상대 우위 확률을 레이스 순위 ${D.stop.draws}회 시뮬레이션으로 계산.` })}</p></div>
      ${callout(
        { en: 'Lesson: a leaky baseline beat every honest model', ko: '교훈: 누수가 있는 베이스라인이 모든 정직한 모델을 이겼다' },
        `<p class="small">${L({
          en: `Copying a teammate’s pace from the same race, under a random row split, scored ${D.leaky}: better than any real forecaster, and useless before a race. Walk-forward evaluation by race date, with future columns hidden in code, turned leakage into a test failure.`,
          ko: `무작위 행 분할에서 같은 레이스의 팀 동료 페이스를 그대로 쓰면 ${D.leaky}로 어떤 실제 예측 모델보다 좋았지만, 레이스 전에는 쓸 수 없는 값입니다. 레이스 날짜 기준 워크포워드 평가와 코드에서 미래 열을 숨기는 방식으로 누수를 테스트 실패로 바꾸었습니다.`,
        })}</p>`,
        'callout--warn',
      )}
    </div>
  </div>
  <div class="grid mt-auto" style="grid-template-columns:1.62fr 1fr;gap:11mm;align-items:end">
    <pre class="code" aria-label="${L({ en: 'Leakage test from the repository', ko: '저장소의 누수 테스트' })}">${pyHighlight(LEAK_TEST)}</pre>
    <div class="rule-top--ink">
      <p class="label">tests/dpec/test_forecasting.py</p>
      <p class="h4 mt-s">${L({ en: 'The leakage guard is a test, not a promise', ko: '누수 방지는 약속이 아니라 테스트입니다' })}</p>
      <p class="small mt-s">${L({ en: 'Rewrite what happened in later rounds and run the backtest again: not one earlier forecast may move. A second test makes any forecaster that reads the day’s answer fail with an error. Both run in CI on every push.', ko: '이후 라운드의 결과를 바꾼 뒤 백테스트를 다시 실행해도, 그 이전 예측은 하나도 바뀌면 안 됩니다. 두 번째 테스트는 당일 정답을 읽으려는 예측 모델을 오류로 실패시킵니다. 두 테스트 모두 push할 때마다 CI에서 실행됩니다.' })}</p>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 15 · results */
const NAMES = {
  shared: { en: 'Shared model (DPEC)', ko: '공유 모델 (DPEC)' },
  team: { en: 'Team form', ko: '팀 폼' },
  last: { en: 'Last race', ko: '직전 레이스' },
  peryear: { en: 'A model per year', ko: '연도별 모델' },
  signal: { en: 'The signal as is', ko: '신호 그대로' },
  none: { en: 'No signal', ko: '신호 없음' },
};
const forecasterChart = () =>
  pairBars(
    [...D.table].sort((a, b) => a.q - b.q).map((r) => ({
      label: NAMES[r.key],
      hi: r.ours,
      a: { value: r.p, display: `${r.p.toFixed(3)}%` },
      b: { value: r.q, display: `${r.q.toFixed(3)}%` },
    })),
    [
      { title: { en: 'After practice', ko: '연습 주행 후' }, max: 1.1, ticks: [0, 0.5, 1], fmt: (v) => `${v}%` },
      { title: { en: 'After qualifying', ko: '예선 후' }, max: 1.1, ticks: [0, 0.5, 1], fmt: (v) => `${v}%` },
    ],
    { labelW: 36 },
  );

const results = page(
  'f1-results',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Results', ko: '결과' }),
    title: {
      en: `On ${D.heldOut} held-out weekends it beat every baseline, and its ranges meant what they said.`,
      ko: `홀드아웃 ${D.heldOut}개 주말에서 모든 베이스라인을 이겼고, 예측 구간은 표시한 그대로 맞았습니다.`,
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.6fr 1fr;gap:11mm">
    <div style="display:flex;flex-direction:column">
      <p class="chart-k">${L({ en: 'Mean absolute race-pace error, % of a lap time (lower is better)', ko: '레이스 페이스 평균 절대 오차, 랩타임 대비 % (낮을수록 좋음)' })}</p>
      ${forecasterChart()}
      <p class="chart-note">${L({ en: `Shared model after qualifying: ${D.errQ}, about ${D.errQs} a lap. Source: project README, verified in the numbers check.`, ko: `예선 후 공유 모델: ${D.errQ}, 랩당 약 ${D.errQs}. 출처: 프로젝트 README, 수치 검증 문서로 확인.` })}</p>
      <div class="callout mt-m" style="align-self:stretch">
        <p class="callout__k">${L({ en: 'Where it does not win', ko: '이기지 못한 부분' })}</p>
        ${list([
          { en: `A separate model for each year orders drivers slightly better after qualifying (median Spearman ${D.perYearRho} vs ${D.sharedRho}).`, ko: `연도별 별도 모델이 예선 후 드라이버 순위를 조금 더 잘 맞힙니다(Spearman 중앙값 ${D.perYearRho} 대 ${D.sharedRho}).` },
          { en: `First five races under the 2026 rules: simpler methods did as well or better, and only ${D.newRulesCov} of real paces fell inside the after-practice ranges. The ranges caught up a few races later.`, ko: `2026 규정 첫 5개 레이스: 더 단순한 방법이 비슷하거나 더 나았고, 연습 주행 후 구간 안에 든 실제 페이스는 ${D.newRulesCov}에 그쳤습니다. 몇 레이스 뒤 구간이 따라잡았습니다.` },
          { en: 'The chances are a little too flat: favourites make the top 3 more often than the model says.', ko: '확률이 다소 평평해서, 우승 후보가 모델 예상보다 더 자주 상위 3위에 듭니다.' },
          { en: `Beating the teammate is barely better than a coin flip (Brier ${D.teammateBrier} vs ${D.coinBrier}).`, ko: `팀 동료를 이길 확률은 동전 던지기보다 조금 나은 수준입니다(Brier ${D.teammateBrier} 대 ${D.coinBrier}).` },
        ], 'small mt-s')}
      </div>
      <div class="mt-auto" style="padding-top:3mm">${decision({
        k: { en: 'Why this matters', ko: '왜 중요한가' },
        t: { en: 'A forecast is only useful if its uncertainty is honest.', ko: '불확실성이 정직할 때만 예측은 쓸모가 있습니다.' },
        why: { en: 'An 80% range should contain the real result about 80% of the time. On the held-out races it did, so a planner can act on the range, not just the point.', ko: '80% 구간이 홀드아웃 레이스에서 실제로 약 80%를 담았으므로, 점 예측이 아닌 구간으로 계획할 수 있습니다.' },
      })}</div>
    </div>
    <div class="stack-l">
      <div>
        <p class="chart-k">${L({ en: 'Coverage: real results inside the 80% ranges (target 80%)', ko: '커버리지: 80% 구간 안에 든 실제 결과 (목표 80%)' })}</p>
        ${dotrows(
          [
            { label: { en: 'After practice', ko: '연습 주행 후' }, v: D.covP },
            { label: { en: 'After qualifying', ko: '예선 후' }, v: D.covQ },
          ],
          { min: 70, max: 90, target: 80, ticks: [70, 75, 80, 85, 90], labelW: 26 },
        )}
        <p class="chart-note">${L({ en: 'The vertical line marks 80%. Each range comes from the model’s own recent errors.', ko: '세로선이 80%입니다. 각 구간은 모델 자신의 최근 오차로 만듭니다.' })}</p>
      </div>
      <div class="stats stats--rule" style="grid-template-columns:1fr 1fr;gap:5mm">
        ${stat(D.brier, { en: `Brier score, top-3 chance after qualifying (no information: ${D.brierBase})`, ko: `예선 후 상위 3위 확률의 Brier 점수 (정보 없음: ${D.brierBase})` })}
        ${stat(D.dryErr, { en: `error of the live code path, replayed on ${D.dryRuns} races of 2026: exactly the backtest’s`, ko: `2026년 ${D.dryRuns}개 레이스를 실제 서비스 코드로 재현한 오차, 백테스트와 정확히 일치` })}
      </div>
      <div class="mt-auto">
        <p class="chart-k">${L({ en: `What each input is worth: error after qualifying with one input removed (${D.ablation.weekends} weekends, 2023–26)`, ko: `입력별 기여도: 입력 하나를 뺐을 때 예선 후 오차 (${D.ablation.weekends}개 주말, 2023–26)` })}</p>
        ${bars(
          [
            { label: { en: 'Full model', ko: '전체 모델' }, value: D.ablation.full, display: `${D.ablation.full.toFixed(3)}%`, hi: true },
            { label: { en: 'No team form', ko: '팀 폼 제외' }, value: D.ablation.team, display: `${D.ablation.team.toFixed(3)}%` },
            { label: { en: 'No qualifying gap', ko: '예선 격차 제외' }, value: D.ablation.quali, display: `${D.ablation.quali.toFixed(3)}%` },
            { label: { en: 'No recency weights', ko: '최근 가중치 제외' }, value: D.ablation.recency, display: `${D.ablation.recency.toFixed(3)}%` },
            { label: { en: 'No driver vs team', ko: '팀 내 비교 제외' }, value: D.ablation.dvt, display: `${D.ablation.dvt.toFixed(3)}%` },
          ],
          { max: 0.7, labelW: 30, ticks: [0, 0.2, 0.4, 0.6], fmt: (v) => `${v}%` },
        )}
        <p class="chart-note">${L({ en: 'Team form carries most of the signal; every other input adds a little. Source: model card.', ko: '신호의 대부분은 팀 폼에서 나오고, 나머지 입력은 조금씩 보탭니다. 출처: 모델 카드.' })}</p>
      </div>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 16 · strategy */
const strategy = page(
  'f1-strategy',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Strategy model', ko: '전략 모델' }),
    title: {
      en: 'A strategy model that makes a call only when the evidence is clear, and says so when it isn’t.',
      ko: '근거가 분명할 때만 판단하고, 그렇지 않으면 그렇다고 말하는 전략 모델.',
    },
  })}
  <div class="mt-l">
    <div style="display:grid;grid-template-columns:1fr 5mm 1fr 5mm 1fr 5mm 1.1fr 5mm 1fr;align-items:center">
      ${node({ t: { en: 'Race tyre wear', ko: '레이스 타이어 마모' }, s: { en: 'forecast from practice and the circuit’s history', ko: '연습 주행과 서킷 과거 기록으로 예측' } })}
      ${arrow()}
      ${node({ t: { en: 'Pit-stop cost', ko: '피트스톱 비용' }, s: { en: 'time lost in the pit lane at this circuit', ko: '이 서킷의 피트 레인 손실 시간' } })}
      ${arrow()}
      ${node({ t: { en: '1-, 2-, 3-stop plans', ko: '1·2·3스톱 계획' }, s: { en: `each costed over ${D.stop.draws} draws of tyre wear`, ko: `타이어 마모를 ${D.stop.draws}회 추출해 각각 비용 계산` }, cls: 'node--hi' })}
      ${arrow()}
      ${node({ t: { en: `Cheapest in ≥ ${D.stop.threshold} of draws?`, ko: `추출의 ${D.stop.threshold} 이상에서 가장 저렴한가?` }, s: { en: 'the clarity rule', ko: '명확성 규칙' } })}
      ${arrow()}
      <div style="display:grid;gap:1.6mm">
        ${node({ t: { en: 'Yes: the call', ko: '예: 판단 제시' }, s: { en: 'stops and rough window', ko: '스톱 횟수와 대략적 시점' } })}
        ${node({ t: { en: 'No: “no clear decision”', ko: '아니요: “명확한 결정 없음”' }, s: { en: 'abstain instead of guessing', ko: '추측 대신 판단 보류' }, cls: 'node--plan' })}
      </div>
    </div>
  </div>
  <div class="grid fill mt-l" style="grid-template-columns:1fr 1.35fr;gap:10mm">
    <div class="stack">
      <p class="chart-k">${L({ en: `Stop count matched what most of the top 10 did (${D.stop.races} dry races since 2023, each replayed with only earlier data)`, ko: `상위 10위 다수가 선택한 스톱 횟수와 일치한 비율 (2023년 이후 건조 노면 레이스 ${D.stop.races}개, 각각 이전 데이터만으로 재현)` })}</p>
      ${pairBars(
        [
          { label: { en: 'Strategy model', ko: '전략 모델' }, hi: true, a: { value: D.stop.model, display: `${D.stop.model}%` }, b: { value: D.stop.clearModel, display: `${D.stop.clearModel}%` } },
          { label: { en: 'Always one stop', ko: '항상 1스톱' }, a: { value: D.stop.base, display: `${D.stop.base}%` }, b: { value: D.stop.clearBase, display: `${D.stop.clearBase}%` } },
        ],
        [
          { title: { en: 'All races', ko: '전체 레이스' }, max: 100, ticks: [0, 50, 100], fmt: (v) => `${v}%` },
          { title: { en: 'When the call was clear', ko: '판단이 명확했을 때' }, max: 100, ticks: [0, 50, 100], fmt: (v) => `${v}%` },
        ],
        { labelW: 27 },
      )}
      ${decision({
        k: { en: 'Decision', ko: '의사결정' },
        t: { en: 'Abstain instead of guessing.', ko: '추측하지 말고 판단을 보류한다.' },
        why: { en: `If no plan is cheapest in at least ${D.stop.threshold} of the draws, the model answers “no clear decision”. Uncertainty becomes an explicit output, not a hidden coin flip.`, ko: `어느 계획도 추출의 ${D.stop.threshold} 이상에서 가장 저렴하지 않으면 모델은 “명확한 결정 없음”이라고 답합니다. 불확실성이 숨겨진 동전 던지기가 아니라 명시적인 출력이 됩니다.` },
      })}
    </div>
    <div class="stack">
      ${plate({
        src: IMG('f1-public-record.jpg'),
        alt: { en: 'The public record window with the 2026 dry runs', ko: '2026 드라이 런이 보이는 공개 기록 창' },
        no: 'IV',
        height: 62,
        caption: {
          en: 'The public record (2026 dry runs, labelled “replayed afterwards”): stop calls, including “no clear decision: 1 or 2 stops”, each scored after the race.',
          ko: '공개 기록(2026 드라이 런, “replayed afterwards” 표시): “명확한 결정 없음: 1 또는 2스톱”을 포함한 스톱 판단과 레이스 후 채점 결과.',
        },
      })}
      <div class="rule-top">
        <p class="h4">${L({ en: 'Score only what public data can check', ko: '공개 데이터로 확인 가능한 것만 채점' })}</p>
        <p class="small mt-s">${L({ en: 'The predicted tyre wear, the number of stops, and whether real first stops fell inside the predicted window. Never “did the plan win”: the other plans were never raced, so that claim cannot be checked.', ko: '예측한 타이어 마모, 스톱 횟수, 실제 첫 스톱이 예측 시점 범위 안에 들었는지만 채점합니다. “그 계획이 이겼는가”는 채점하지 않습니다. 다른 계획은 실제로 달려 본 적이 없으므로 확인할 수 없기 때문입니다.' })}</p>
      </div>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 17 · product */
const product = page(
  'f1-product',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Product', ko: '제품' }),
    title: {
      en: 'A product, not a notebook: a read-only API, a pit wall of linked windows and a debrief that explains misses.',
      ko: '노트북이 아니라 제품: 읽기 전용 API, 연결된 창으로 이루어진 피트 월, 빗나간 예측을 설명하는 디브리프.',
    },
  })}
  <div class="grid mt-m" style="grid-template-columns:96mm 1fr;gap:9mm">
    ${plate({
      src: IMG('f1-race-pace.jpg'),
      alt: { en: 'The local app on the 2024 Bahrain Grand Prix, strategy layout', ko: '2024 바레인 그랑프리의 로컬 앱, 전략 레이아웃' },
      no: 'V',
      height: 84,
      caption: { en: 'The local app on the 2024 Bahrain GP: race-pace forecast with ranges and chances, laps and long runs, weather and track evolution, and the tyres each car used.', ko: '2024 바레인 GP의 로컬 앱: 구간과 확률이 붙은 레이스 페이스 예측, 랩과 롱런, 날씨와 트랙 변화, 각 차량의 타이어.' },
    })}
    <div class="stack">
      <div class="stats stats--rule" style="grid-template-columns:repeat(3,1fr);gap:5mm">
        ${stat(D.endpoints, { en: 'read-only FastAPI endpoints', ko: '읽기 전용 FastAPI 엔드포인트' }, { size: 's' })}
        ${stat(D.windows, { en: `linked windows, ${D.layouts} layouts: plain HTML, CSS and JavaScript modules`, ko: `연결된 창, 레이아웃 ${D.layouts}개: 순수 HTML·CSS·JavaScript 모듈` }, { size: 's' })}
        ${stat('1', { en: 'codebase for the local app and the public copy', ko: '로컬 앱과 공개 버전이 공유하는 코드베이스' }, { size: 's' })}
      </div>
      <div class="rule-top">
        <p class="h4">${L({ en: 'Public copy, on purpose', ko: '의도적으로 설계한 공개 버전' })}</p>
        <p class="small mt-s">${L({
          en: 'A dated snapshot to the 2026 Singapore GP, served read-only from a Docker image on Render’s free plan (it sleeps after 15 minutes; 0.1 CPU, 512 MB). Live AI chat is switched off, so visitors can’t change anything or run up a bill.',
          ko: '2026 싱가포르 GP까지의 날짜가 표시된 스냅샷을 Render 무료 플랜의 Docker 이미지로 읽기 전용 제공합니다(15분 후 절전, 0.1 CPU, 512 MB). 실시간 AI 채팅은 꺼 두어 방문자가 데이터를 바꾸거나 비용을 발생시킬 수 없습니다.',
        })}</p>
      </div>
      <div class="panel">
        <p class="h4">${L({ en: 'The debrief explains a miss', ko: '디브리프로 빗나간 예측 설명하기' })}</p>
        <p class="small mt-s">${L({
          en: `Singapore 2026: Russell was ${D.debrief.sg} a lap off Leclerc’s race pace. About ${D.debrief.sgPace} of that was pace and about ${D.debrief.sgTraffic} was traffic: he qualified 6th but started 19th, and spent ${D.debrief.within} of those laps within 1.5 s of a car ahead.`,
          ko: `2026 싱가포르: 러셀은 르클레르보다 레이스 페이스가 랩당 ${D.debrief.sg} 느렸습니다. 그중 약 ${D.debrief.sgPace}는 페이스, 약 ${D.debrief.sgTraffic}는 트래픽 때문이었습니다. 예선 6위였지만 19위로 출발했고, 해당 랩의 ${D.debrief.within}를 앞차와 1.5초 이내에서 달렸습니다.`,
        })}</p>
      </div>
    </div>
  </div>
  <div class="grid mt-m" style="grid-template-columns:186mm 1fr;gap:7mm;align-items:start">
    ${plate({ src: IMG('f1-debrief.jpg'), alt: { en: 'The debrief window', ko: '디브리프 창' }, height: 49, contain: true })}
    <div class="stack-s">
      <p class="plate__no">${L({ en: 'Plate', ko: '도판' })} VI</p>
      <p class="small">${L({
        en: `The debrief, Bahrain 2024, Russell vs Leclerc. Left: the ${D.debrief.q} qualifying gap split by kind of track section. Right: the race gap of ${D.debrief.r} a lap over ${D.debrief.laps} clean laps, split into pace, tyre age and traffic, with 80% bootstrap ranges.`,
        ko: `디브리프, 2024 바레인, 러셀 대 르클레르. 왼쪽: 예선 격차 ${D.debrief.q}를 트랙 구간 유형별로 분해. 오른쪽: 클린 랩 ${D.debrief.laps}개의 레이스 격차 랩당 ${D.debrief.r}를 페이스·타이어 사용 기간·트래픽으로 나누고 80% 부트스트랩 구간 표시.`,
      })}</p>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 18 · applied AI */
const ai = page(
  'f1-ai',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Applied AI', ko: '응용 AI' }),
    title: {
      en: 'An AI race engineer that must cite a tool for every number, graded by a 50-question exam.',
      ko: '모든 수치의 출처 도구를 밝혀야 하는 AI 레이스 엔지니어, 50문항 시험으로 채점합니다.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.2fr 1fr;gap:10mm">
    <div style="display:flex;flex-direction:column;min-height:0">
      ${plate({
        src: IMG('f1-race-engineer.jpg'),
        alt: { en: 'The race engineer window with a recorded exam answer', ko: '기록된 시험 답변이 보이는 레이스 엔지니어 창' },
        no: 'VII',
        height: 60,
        caption: {
          en: 'A recorded exam answer: the 2024 Bahrain call was 1 stop, and the answer says plainly that it turned out wrong (the race ran 2 stops), naming the tool behind every number.',
          ko: '기록된 시험 답변: 2024 바레인의 판단은 1스톱이었고, 답변은 그 판단이 틀렸다고(실제로는 2스톱) 분명히 말하며 모든 수치의 출처 도구를 밝힙니다.',
        },
      })}
      <div class="mt-l">
        <p class="chart-k">${L({ en: `The exam: ${D.exam.total} questions, answers computed from the warehouse at run time`, ko: `시험: ${D.exam.total}문항, 정답은 실행 시점에 웨어하우스에서 계산` })}</p>
        ${segbar([
          { label: { en: 'Lookups', ko: '조회' }, n: D.exam.lookup, color: '#2e6a9e' },
          { label: { en: 'Comparisons', ko: '비교' }, n: D.exam.compare, color: '#4f82ab' },
          { label: { en: 'Forecast', ko: '예측' }, n: D.exam.forecast, color: '#45596a' },
          { label: { en: 'Decision', ko: '결정' }, n: D.exam.decision, color: '#6b5e78' },
          { label: { en: 'Trap (must refuse)', ko: '함정 (거절해야 함)' }, n: D.exam.trap, color: '#a9553a' },
        ])}
      </div>
      <div class="mt-auto rule-top--ink">
        ${label({ en: 'How an answer is graded', ko: '채점 방식' })}
        <div class="mt-m">${meta([
          [{ en: 'Right number', ko: '정확한 수치' }, { en: 'recomputed by SQL or a tool call at grading time; must match within a set tolerance (0.01 by default)', ko: '채점 시점에 SQL이나 도구 호출로 정답을 다시 계산하며, 정해진 허용 오차(기본 0.01) 안에서 일치해야 합니다' }],
          [{ en: 'Looked it up', ko: '도구 조회' }, { en: '100% of non-trap answers called at least one tool', ko: '함정 문항을 제외한 답변의 100%가 도구를 한 번 이상 호출했습니다' }],
          [{ en: 'Traps', ko: '함정 문항' }, { en: 'fuel loads and ERS modes are not public; only an answer that says so passes', ko: '연료량과 ERS 모드는 공개되지 않은 데이터이므로, 그렇다고 답해야만 통과합니다' }],
          [{ en: 'Pass rule', ko: '통과 기준' }, { en: 'a question passes only when every one of its checks passes', ko: '문항의 모든 검사를 통과해야 정답으로 인정합니다' }],
        ])}</div>
      </div>
    </div>
    <div class="stack">
      ${label({ en: 'How an answer is made', ko: '답변이 만들어지는 과정' })}
      <div style="display:grid;gap:0">
        ${node({ t: { en: 'Question', ko: '질문' }, s: { en: 'e.g. “How many stops did our tyre decision call for at Bahrain 2024?”', ko: '예: “2024 바레인에서 우리 타이어 결정은 몇 스톱이었나?”' } })}
        ${arrow('down')}
        ${node({ t: { en: 'LLM chooses tools', ko: 'LLM이 도구 선택' }, s: { en: 'Claude API, or a local model on Ollama: two interchangeable providers', ko: 'Claude API 또는 Ollama 로컬 모델: 교체 가능한 두 공급자' } })}
        ${arrow('down')}
        ${node({ t: { en: `My code runs ${D.tools} read-only tools`, ko: `제 코드가 읽기 전용 도구 ${D.tools}개 실행` }, s: { en: 'tables · guarded SQL (SELECT only, known tables, row limit) · lap and race splits · forecasts · tyre decision · public record · data status', ko: '테이블 목록 · 보호된 SQL (SELECT만, 알려진 테이블만, 행 수 제한) · 랩·레이스 분할 · 예측 · 타이어 결정 · 공개 기록 · 데이터 상태' }, cls: 'node--hi' })}
        ${arrow('down')}
        ${node({ t: { en: 'Grounded answer', ko: '근거 있는 답변' }, s: { en: 'every number names its tool; fuel loads or engine modes get “not public”', ko: '모든 수치에 출처 도구 표시, 연료량·엔진 모드는 “공개되지 않음”' } })}
      </div>
      <div class="stats stats--rule mt-auto" style="grid-template-columns:repeat(4,1fr);gap:3.6mm">
        ${stat('50/50', { en: `passed, ${L(D.exam.date)}`, ko: `통과, ${L(D.exam.date)}` }, { size: 's' })}
        ${stat(D.exam.calls, { en: 'tool calls in the run', ko: '회 도구 호출' }, { size: 's' })}
        ${stat(D.exam.median, { en: 'median per question', ko: '문항당 중앙값' }, { size: 's' })}
        ${stat(`≈ ${D.exam.cost}`, { en: 'for the whole run', ko: '전체 실행 비용' }, { size: 's' })}
      </div>
      <p class="small muted">${L({ en: 'A project test set I wrote, not an independent benchmark. Because answers are recomputed from the data on every run, the exam can’t go stale.', ko: '독립 벤치마크가 아니라 제가 작성한 프로젝트 테스트 세트입니다. 정답을 실행할 때마다 데이터에서 다시 계산하므로 시험이 낡지 않습니다.' })}</p>
    </div>
  </div>`,
);

/* ------------------------------------------------------------------ 19 · engineering and limits */
const CODEMAP = [
  ['src/telemetry_core/ · sql/', { en: 'reusable data layer (download, warehouse, lap alignment) · the SQL for the warehouse and its checks', ko: '재사용 데이터 계층(다운로드, 웨어하우스, 랩 정렬) · 웨어하우스와 검사용 SQL' }],
  ['src/dpec/', { en: 'forecasting, strategy, public record, debrief, AI assistant, API, publishing', ko: '예측, 전략, 공개 기록, 디브리프, AI 어시스턴트, API, 배포' }],
  ['web/app/ · config/', { en: 'the pit wall web app · every setting, local and public', ko: '피트 월 웹 앱 · 로컬·공개 버전의 모든 설정' }],
  ['tests/ · evals/', { en: `${D.tests} tests on fake data · the AI exam’s 50 questions`, ko: `가짜 데이터 테스트 ${D.tests}개 · AI 시험 50문항` }],
  ['reports/ · docs/', { en: 'scores, research, exam runs, numbers check · ADRs, workstreams, Korean guides', ko: '점수, 연구, 시험 결과, 수치 검증 · ADR, 분야별 문서, 한국어 가이드' }],
];
const engineering = page(
  'f1-eng',
  () => `
  ${head({
    no: '03',
    eyebrow: EB({ en: 'Engineering and scope', ko: '엔지니어링과 범위' }),
    title: {
      en: 'Engineered to be checked: tests, a guarded public record, a reproducible release, and an honest scope.',
      ko: '검증할 수 있게 만들었습니다. 테스트, 보호된 공개 기록, 재현 가능한 릴리스, 그리고 정직한 범위.',
    },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1fr 1fr;gap:11mm">
    <div class="stack">
      ${label({ en: 'On every push', ko: '푸시할 때마다' })}
      ${flow([
        { t: 'GitHub Actions', s: { en: 'push or pull request', ko: '푸시 또는 PR' } },
        { t: { en: `${D.tests} tests + Ruff`, ko: `테스트 ${D.tests}개 + Ruff` }, s: { en: 'fake data, no internet', ko: '가짜 데이터, 인터넷 없이' }, cls: 'node--hi' },
        { t: { en: 'Ledger guard', ko: '기록 보호' }, s: { en: `rejects a forecast < ${D.deadline} min before the race, or any change to a frozen file`, ko: `레이스 ${D.deadline}분 전 이후 도착한 예측이나 고정 파일 변경을 거부` } },
      ])}
      ${label({ en: 'On every release', ko: '릴리스할 때마다' })}
      ${flow([
        { t: { en: 'Build image', ko: '이미지 빌드' }, s: { en: 'Docker, data snapshot inside', ko: 'Docker, 데이터 스냅샷 포함' } },
        { t: { en: 'Start and check', ko: '실행 후 검증' }, s: { en: 'behaves like the public copy: read-only, live chat off', ko: '공개 버전과 동일: 읽기 전용, 실시간 채팅 끔' } },
        { t: { en: 'Push', ko: '푸시' }, s: 'GHCR → Render' },
      ])}
      <div class="stats stats--rule mt-s" style="grid-template-columns:repeat(3,1fr);gap:5mm">
        ${stat(D.commits, { en: `commits, ${periods.dpec}`, ko: `커밋, ${periods.dpec}` }, { size: 's' })}
        ${stat(D.adrs, { en: 'architecture decision records', ko: '아키텍처 의사결정 기록(ADR)' }, { size: 's' })}
        ${stat(D.cases, { en: 'research case studies, plus an experiment register', ko: '연구 케이스 스터디와 실험 기록부' }, { size: 's' })}
      </div>
      ${label({ en: 'Codebase map', ko: '코드베이스 구조' })}
      <div class="codemap">${CODEMAP.map(([k, v]) => `<code>${k}</code><span>${L(v)}</span>`).join('')}</div>
    </div>
    <div class="stack">
      ${label({ en: 'What was live, and what wasn’t', ko: '실시간이었던 것과 아니었던 것' })}
      <div style="display:grid;grid-template-columns:24mm 1fr 1fr;border-top:0.4mm solid var(--ink)">
        ${[
          [{ en: 'Backtest', ko: '백테스트' }, { en: 'after the races, earlier data only', ko: '레이스 후, 이전 데이터만 사용' }, { en: `the results in this section (${D.stop.races} dry races since 2023)`, ko: `이 장의 결과 (2023년 이후 건조 노면 ${D.stop.races}개)` }],
          [{ en: 'Dry runs', ko: '드라이 런' }, { en: 'after the races, through the live code', ko: '레이스 후, 실제 서비스 코드로' }, { en: `live path = tested path (${D.dryRuns} races of 2026)`, ko: `실제 경로 = 테스트 경로 (2026년 ${D.dryRuns}개 레이스)` }],
          [{ en: 'Live record', ko: '실시간 기록' }, { en: 'before the race, frozen on GitHub', ko: '레이스 전, GitHub에 고정' }, { en: '0 weekends so far', ko: '현재까지 0회' }],
        ]
          .map(
            ([a, b, c], i) =>
              `<p class="h4" style="padding:2.4mm 0;border-bottom:0.22mm solid var(--rule)">${L(a)}</p><p class="small" style="padding:2.4mm 2mm;border-bottom:0.22mm solid var(--rule)">${L(b)}</p><p class="small" style="padding:2.4mm 0;border-bottom:0.22mm solid var(--rule);${i === 2 ? 'color:var(--warm-ink);font-weight:600' : ''}">${L(c)}</p>`,
          )
          .join('')}
      </div>
      <p class="small">${L({ en: 'The project freezes each forecast in public before the race. Since October 2026 F1’s timing data needs a paid login, so none could be frozen in time; restarting needs F1TV Access or a source such as OpenF1.', ko: '예측을 레이스 전에 공개적으로 고정하도록 설계했습니다. 2026년 10월부터 F1 타이밍 데이터에 유료 로그인이 필요해져 제때 고정할 수 없었고, 다시 시작하려면 F1TV Access나 OpenF1 같은 데이터 소스가 필요합니다.' })}</p>
      ${label({ en: 'Limits, stated plainly', ko: '분명히 밝히는 한계' })}
      ${list([
        { en: `<b>Public data only.</b> Where the model needs a private effect it estimates it (fuel: an assumed ${D.fuel} per lap) and never reports an estimate as a measurement.`, ko: `<b>공개 데이터만 사용.</b> 비공개 요인이 필요하면 추정하고(연료: 랩당 ${D.fuel}로 가정), 추정치를 측정값으로 보고하지 않습니다.` },
        { en: '<b>Simple models on purpose.</b> One regression with at most three inputs; no weather, upgrades or penalties; wet races and finishing positions are not forecast.', ko: '<b>의도적으로 단순한 모델.</b> 입력 최대 3개의 회귀 하나. 날씨, 업그레이드, 페널티는 입력에서 제외. 우천 레이스와 최종 순위는 예측하지 않음.' },
        { en: '<b>Not a team tool.</b> Real teams have far more data. The project measures how far public data can go, and says where it stops.', ko: '<b>팀용 도구가 아님.</b> 실제 팀은 훨씬 많은 데이터를 가집니다. 이 프로젝트는 공개 데이터가 어디까지 갈 수 있는지 측정하고, 어디서 멈추는지 밝힙니다.' },
      ], 'small')}
      <div class="panel mt-auto">
        <p class="h4">${L({ en: 'Read further in the repository', ko: '저장소에서 더 읽기' })}</p>
        <div class="mt-s">${links([
          [{ en: 'Model card', ko: '모델 카드' }, LK.dpec.modelCard],
          [{ en: 'Numbers check', ko: '수치 검증' }, LK.dpec.numbers],
          [{ en: 'Architecture', ko: '아키텍처' }, LK.dpec.architecture],
          [{ en: 'Decision records', ko: '의사결정 기록(ADR)' }, LK.dpec.decisions],
          [{ en: 'Research report', ko: '연구 보고서' }, LK.dpec.research],
          [{ en: 'AI exam report', ko: 'AI 시험 보고서' }, LK.dpec.exam],
          [{ en: 'Korean guide', ko: '한국어 가이드' }, LK.dpec.koGuide],
        ])}</div>
      </div>
    </div>
  </div>`,
);

export const f1Pages = [opener, problem, architecture, data, research, validation, results, strategy, product, ai, engineering];
