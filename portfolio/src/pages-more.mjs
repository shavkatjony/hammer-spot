/**
 * Pages 20–30: Telco, Retail and Olist (three pages each), additional work, contact.
 */
import { L, ctx, head, stat, decision, plate, chips, meta, links, badge, list, node, flow, arrow, label, bars, pairBars, callout } from './ui.mjs';
import { F, links as LK, periods, person, short } from './facts.mjs';
import { CH } from './pages-intro.mjs';

const IMG = (n) => `../assets/img/${n}`;
const QR = (n) => `../assets/qr/${n}`;
const T = F.telco;
const R = F.retail;
const O = F.olist;

const proj = (no, name) => ({ en: `Project ${no} · ${name.en}`, ko: `프로젝트 ${no} · ${name.ko}` });
const TELCO = { en: 'Telco Customer Churn', ko: '통신사 고객 이탈 예측' };
const RETAIL = { en: 'Retail Commercial Intelligence', ko: '리테일 커머셜 인텔리전스' };
const OLIST = { en: 'Olist Marketplace', ko: 'Olist 마켓플레이스' };
const eb = (name, t) => ({ en: `${name.en} · ${t.en}`, ko: `${name.ko} · ${t.ko}` });

/* ================================================================== TELCO */
const telcoOpen = {
  id: 'telco',
  sec: proj('02', TELCO),
  chapter: CH.projects,
  tone: 'steel',
  body: () => `
  <div class="grid fill" style="grid-template-columns:1fr 84mm;gap:10mm">
    <div style="display:flex;flex-direction:column">
      ${head({
        no: '03',
        eyebrow: { en: 'Project 02 · Classification', ko: '프로젝트 02 · 분류' },
        title: { en: 'Telco Customer Churn: choosing the model that misses the fewest customers who are about to leave.', ko: '통신사 고객 이탈 예측: 떠나려는 고객을 가장 적게 놓치는 모델을 고르다.' },
      })}
      <div class="grid mt-l" style="grid-template-columns:1fr 1fr;gap:8mm">
        <div class="stack">
          ${label({ en: 'Problem', ko: '문제' })}
          <p>${L({ en: 'A carrier loses recurring revenue with every cancellation, and winning a customer back costs more than keeping one. The retention team needs a ranked list of who to call, early enough to act.', ko: '통신사는 해지가 일어날 때마다 반복 매출을 잃고, 고객을 되찾는 비용은 유지하는 비용보다 큽니다. 고객 유지팀에는 조치할 수 있을 만큼 이른 시점에, 누구에게 연락할지 순위가 매겨진 목록이 필요합니다.' })}</p>
        </div>
        <div class="stack">
          ${label({ en: 'The decision that framed it', ko: '방향을 정한 의사결정' })}
          <p>${L({ en: 'A missed churner is lost revenue; a false alarm costs one call. So ROC-AUC and churn recall were fixed as the selection criteria before any model was trained, and accuracy came last.', ko: '놓친 이탈 고객은 잃어버린 매출이고, 오경보의 비용은 전화 한 통입니다. 그래서 모델 학습 전에 ROC-AUC와 이탈 재현율을 선택 기준으로 정했고, 정확도는 마지막에 두었습니다.' })}</p>
        </div>
      </div>
      <div class="stats stats--rule mt-l" style="grid-template-columns:repeat(3,1fr);gap:6mm">
        ${stat(T.auc, { en: 'ROC-AUC on the held-out test split', ko: '홀드아웃 테스트 ROC-AUC' }, { size: 'l' })}
        ${stat(T.recall, { en: `recall: ${T.caught} of ${T.churners} churners caught`, ko: `재현율: 이탈 고객 ${T.churners}명 중 ${T.caught}명 탐지` }, { size: 'l' })}
        ${stat(T.tests, { en: 'test functions, run in CI on every push', ko: '푸시마다 CI에서 실행되는 테스트 함수' }, { size: 'l' })}
      </div>
      <p class="label mt-l">${L({ en: 'Approach', ko: '접근 방법' })}</p>
      <div class="mt-s">${flow([
        { t: { en: 'Clean', ko: '정제' }, s: { en: 'TotalCharges blanks fixed', ko: 'TotalCharges 빈 값 처리' } },
        { t: { en: 'Features', ko: '피처' }, s: { en: 'add-on count, tenure group', ko: '부가 서비스 수, 가입 기간 그룹' } },
        { t: { en: '3 classifiers', ko: '분류기 3종' }, s: { en: 'stratified 5-fold CV', ko: '층화 5-fold 교차검증' } },
        { t: { en: 'Select', ko: '선택' }, s: { en: 'on ROC-AUC and recall', ko: 'ROC-AUC와 재현율 기준' }, cls: 'node--hi' },
        { t: { en: 'Serve', ko: '서빙' }, s: { en: 'one Pipeline · app + API', ko: '하나의 Pipeline · 앱 + API' } },
      ])}</div>
      <div class="mt-auto">${meta([
        [{ en: 'Period', ko: '기간' }, { en: `${periods.telco} · independent project`, ko: `${periods.telco} · 개인 프로젝트` }],
        [{ en: 'Data', ko: '데이터' }, { en: `IBM Telco Customer Churn sample: ${T.customers} customers of a fictional company, ${T.churnRate} churned`, ko: `IBM Telco Customer Churn 샘플: 가상 기업의 고객 ${T.customers}명, ${T.churnRate} 이탈` }],
        [{ en: 'Stack', ko: '기술 스택' }, 'Python · pandas · scikit-learn · FastAPI · Streamlit · pytest · GitHub Actions'],
        [{ en: 'Links', ko: '링크' }, links([[{ en: 'Live app', ko: '라이브 앱' }, LK.telco.app], [{ en: 'Source code', ko: '소스 코드' }, LK.telco.repo], [{ en: 'Findings report', ko: '분석 결과 보고서' }, LK.telco.findings], [{ en: 'Model card', ko: '모델 카드' }, LK.telco.modelCard]])],
      ])}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr;gap:4mm;align-content:start">
      ${plate({
        src: IMG('telco-form.jpg'),
        alt: { en: 'The Streamlit churn predictor form', ko: 'Streamlit 이탈 예측기 입력 화면' },
        no: 'VIII',
        height: 104,
        caption: { en: 'The Streamlit predictor scoring a high-risk profile (month-to-month, fibre optic, 3 months’ tenure).', ko: '고위험 프로필(월 단위 계약, 광섬유, 가입 3개월)을 평가하는 Streamlit 예측기.' },
      })}
      ${plate({
        src: IMG('telco-result.jpg'),
        alt: { en: 'Prediction result: 87.7% churn probability and a recommended action', ko: '예측 결과: 이탈 확률 87.7%와 권장 조치' },
        height: 30,
        caption: { en: 'Result: 87.7% churn probability, “High”, with a recommended retention action.', ko: '결과: 이탈 확률 87.7%, “High”, 그리고 권장 유지 조치.' },
      })}
    </div>
  </div>`,
};

const CVNAMES = { lr: { en: 'Logistic regression', ko: '로지스틱 회귀' }, gb: { en: 'Gradient boosting (HistGB)', ko: '그래디언트 부스팅 (HistGB)' }, rf: { en: 'Random forest', ko: '랜덤 포레스트' } };
const cvChart = () =>
  pairBars(
    [...T.cv].sort((a, b) => b.rec - a.rec).map((r) => ({
      label: CVNAMES[r.key],
      hi: r.chosen,
      a: { value: r.acc, display: r.acc.toFixed(3) },
      b: { value: r.rec, display: r.rec.toFixed(3) },
    })),
    [
      { title: { en: 'Accuracy', ko: '정확도' }, max: 1, ticks: [0, 0.5, 1], fmt: (v) => v.toFixed(1) },
      { title: { en: 'Recall (churners caught)', ko: '재현율 (탐지한 이탈 고객)' }, max: 1, ticks: [0, 0.5, 1], fmt: (v) => v.toFixed(1) },
    ],
    { labelW: 40 },
  );

const telcoDecision = {
  id: 'telco-decision',
  sec: proj('02', TELCO),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: eb(TELCO, { en: 'Model selection', ko: '모델 선택' }),
    title: { en: 'The most accurate model would have missed more than half of the customers who left.', ko: '가장 정확한 모델은 떠난 고객의 절반 이상을 놓쳤을 것입니다.' },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.25fr 1fr;gap:11mm">
    <div style="display:flex;flex-direction:column">
      <p class="chart-k">${L({ en: '5-fold stratified cross-validation on the training split', ko: '학습 데이터의 층화 5-fold 교차검증' })}</p>
      ${cvChart()}
      <p class="chart-note">${L({ en: 'Source: reports/model_comparison.csv. All three models use class_weight="balanced".', ko: '출처: reports/model_comparison.csv. 세 모델 모두 class_weight="balanced" 적용.' })}</p>
      <div class="grid mt-l" style="grid-template-columns:1fr 1fr;gap:7mm">
        ${decision({
          k: { en: 'Decision', ko: '의사결정' },
          t: { en: 'Select on ROC-AUC and recall, not accuracy.', ko: '정확도가 아니라 ROC-AUC와 재현율로 선택한다.' },
          why: { en: `At a ${T.churnRate} base rate, predicting “nobody leaves” scores ${T.nobody} accuracy and catches no one. The random forest looked best on accuracy (0.788) and was the worst model for the job (recall 0.465).`, ko: `기본 이탈률이 ${T.churnRate}일 때 “아무도 떠나지 않는다”고 예측하면 정확도 ${T.nobody}를 얻지만 아무도 찾지 못합니다. 랜덤 포레스트는 정확도(0.788)에서는 가장 좋아 보였지만 이 업무에는 가장 나쁜 모델이었습니다(재현율 0.465).` },
        })}
        <div class="stack">
          ${label({ en: 'Risk bands order the risk', ko: '위험 등급이 위험 순서를 반영' })}
          ${bars(
            [
              { label: { en: 'High', ko: '높음' }, value: T.bands.high, display: `≈ ${T.bands.high}%`, hi: true },
              { label: { en: 'Medium', ko: '중간' }, value: T.bands.medium, display: `${T.bands.medium}%` },
              { label: { en: 'Low', ko: '낮음' }, value: T.bands.low, display: `${T.bands.low}%` },
            ],
            { max: 100, labelW: 13 },
          )}
          <p class="chart-note">${L({ en: 'Observed churn rate by risk band on the test split. Bands: High ≥ 0.60, Medium ≥ 0.35, Low below; the cut-offs are business choices.', ko: '테스트 데이터에서 위험 등급별 실제 이탈률. 등급: 높음 ≥ 0.60, 중간 ≥ 0.35, 낮음은 그 미만이며, 기준값은 비즈니스 판단으로 정합니다.' })}</p>
        </div>
      </div>
      <div class="rule-top mt-auto">
        <p class="h4">${L({ en: 'Retention levers, framed as A/B tests', ko: 'A/B 테스트로 검증할 고객 유지 방안' })}</p>
        <div class="mt-s">${meta([
          [{ en: 'Contracts', ko: '계약' }, { en: 'move month-to-month customers to 1- or 2-year plans (the strongest signal)', ko: '월 단위 고객을 1년·2년 약정으로 전환 (가장 강한 신호)' }],
          [{ en: 'Onboarding', ko: '온보딩' }, { en: 'outreach in the first 3–6 months, where churn concentrates', ko: '이탈이 몰리는 가입 후 3–6개월 안에 먼저 연락' }],
          [{ en: 'Fibre', ko: '광섬유' }, { en: 'review fibre-optic pricing and support for new fibre users', ko: '광섬유 요금과 신규 가입자 지원 점검' }],
          [{ en: 'Engagement', ko: '참여' }, { en: 'bundle security and tech support; move payers off electronic check', ko: '보안·기술 지원 묶음 제공, 전자 수표 결제 고객의 결제 수단 전환 유도' }],
        ])}</div>
      </div>
    </div>
    <div class="stack">
      <p class="chart-k">${L({ en: `Outcomes for ${T.test} held-out customers at threshold 0.50`, ko: `임계값 0.50에서 홀드아웃 고객 ${T.test}명의 결과` })}</p>
      <div class="cm">
        <span></span><span class="cm__h">${L({ en: 'Flagged as churn', ko: '이탈로 표시' })}</span><span class="cm__h">${L({ en: 'Not flagged', ko: '표시 안 함' })}</span>
        <span class="cm__h cm__rh">${L({ en: `Churned (${T.churners})`, ko: `실제 이탈 (${T.churners})` })}</span>
        <div class="cm__c cm__c--good"><b>${T.cm.tp}</b><span>${L({ en: 'caught in time', ko: '제때 발견' })}</span></div>
        <div class="cm__c cm__c--bad"><b>${T.cm.fn}</b><span>${L({ en: 'missed: lost revenue', ko: '놓침: 매출 손실' })}</span></div>
        <span class="cm__h cm__rh">${L({ en: 'Stayed (1,035)', ko: '실제 잔류 (1,035)' })}</span>
        <div class="cm__c cm__c--cost"><b>${T.cm.fp}</b><span>${L({ en: 'one unneeded call each', ko: '불필요한 전화 1통씩' })}</span></div>
        <div class="cm__c"><b>${T.cm.tn}</b><span>${L({ en: 'correctly left alone', ko: '올바르게 제외' })}</span></div>
      </div>
      <p class="chart-note">${L({ en: `Logistic regression on the test split, used once after selection: ROC-AUC ${T.auc}, recall ${T.recall}, precision ${T.precision}, F1 ${T.f1}, accuracy ${T.acc}. The counts reproduce that accuracy exactly.`, ko: `모델 선택 후 단 한 번 사용한 테스트 데이터에서의 로지스틱 회귀: ROC-AUC ${T.auc}, 재현율 ${T.recall}, 정밀도 ${T.precision}, F1 ${T.f1}, 정확도 ${T.acc}. 이 수치로 정확도가 정확히 재현됩니다.` })}</p>
      <div class="panel mt-m">
        <p class="h4">${L({ en: 'From a score to a worklist', ko: '점수에서 업무 목록으로' })}</p>
        <p class="small mt-s">${L({ en: 'For every customer, src/predict.py returns a churn probability, a risk band and a suggested action, so the retention team can work the list from the top.', ko: 'src/predict.py는 고객마다 이탈 확률, 위험 등급, 권장 조치를 반환합니다. 고객 유지팀은 목록을 위에서부터 처리하면 됩니다.' })}</p>
      </div>
      <div class="rule-top mt-m">
        <p class="h4">${L({ en: 'What drives churn (associations, not causes)', ko: '이탈과 연관된 요인 (인과가 아닌 연관성)' })}</p>
        <p class="small mt-s">${L({ en: 'Month-to-month contracts, short tenure, high-priced fibre-optic plans, electronic-check payment, and no tech-support or online-security add-ons.', ko: '월 단위 계약, 짧은 가입 기간, 고가의 광섬유 요금제, 전자 수표 결제, 기술 지원·온라인 보안 부가 서비스 미가입.' })}</p>
      </div>
    </div>
  </div>`,
};

const telcoEng = {
  id: 'telco-eng',
  sec: proj('02', TELCO),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: eb(TELCO, { en: 'Engineering and limits', ko: '엔지니어링과 한계' }),
    title: { en: 'One pipeline object from training to serving, so the app and the API cannot drift apart.', ko: '학습부터 서비스까지 하나의 파이프라인 객체. 앱과 API가 서로 어긋날 수 없습니다.' },
  })}
  <div class="mt-l">
    <div style="display:grid;grid-template-columns:1fr 5mm 1.5fr 5mm 1fr 5mm 1fr;align-items:center">
      ${node({ t: { en: 'Raw customer input', ko: '원본 고객 입력' }, s: { en: 'validated against one shared schema (RAW_INPUT_SCHEMA)', ko: '하나의 공유 스키마(RAW_INPUT_SCHEMA)로 검증' } })}
      ${arrow()}
      ${node({ t: { en: 'scikit-learn Pipeline, saved once', ko: '한 번 저장한 scikit-learn Pipeline' }, s: { en: 'clean → scale and one-hot → model. The object saved by src/train.py is the object that serves predictions.', ko: '정제 → 스케일링·원-핫 인코딩 → 모델. src/train.py가 저장한 객체가 그대로 예측을 제공합니다.' }, cls: 'node--hi' })}
      ${arrow()}
      ${node({ t: 'src/predict.py', s: { en: 'probability, risk band, suggested action', ko: '확률, 위험 등급, 권장 조치' } })}
      ${arrow()}
      <div style="display:grid;gap:1.6mm">
        ${node({ t: { en: 'Streamlit app', ko: 'Streamlit 앱' }, s: { en: 'interactive predictor', ko: '대화형 예측기' } })}
        ${node({ t: 'FastAPI', s: { en: 'GET /health · POST /predict · invalid input → 422', ko: 'GET /health · POST /predict · 잘못된 입력 → 422' } })}
      </div>
    </div>
  </div>
  <div class="grid fill mt-xl" style="grid-template-columns:1fr 1fr 1fr;gap:9mm">
    <div class="stack">
      ${decision({
        k: { en: 'Data-quality decision', ko: '데이터 품질 의사결정' },
        t: { en: `${T.blanks} blank TotalCharges were not missing values.`, ko: `빈 TotalCharges ${T.blanks}개는 결측값이 아니었다.` },
        why: { en: 'All belonged to customers with tenure = 0: legitimately $0. They were set to zero instead of being dropped or imputed, which would have invented a problem.', ko: '모두 가입 기간이 0인 고객이었고, 정당한 $0입니다. 삭제하거나 대체하는 대신 0으로 설정했습니다. 그렇게 하지 않았다면 없는 문제를 만들어 냈을 것입니다.' },
      })}
      <div class="rule-top">
        <p class="h4">${L({ en: 'Tested like software', ko: '소프트웨어처럼 테스트' })}</p>
        <p class="small mt-s">${L({ en: `${T.tests} test functions cover preprocessing, prediction and the API, run by GitHub Actions on every push to main and every pull request.`, ko: `전처리, 예측, API를 다루는 테스트 함수 ${T.tests}개를 main 푸시와 풀 리퀘스트마다 GitHub Actions에서 실행합니다.` })}</p>
      </div>
    </div>
    <div class="stack">
      ${label({ en: 'Limits, stated in the model card', ko: '모델 카드에 밝힌 한계' })}
      ${list([
        { en: `Scores are not calibrated rates: balanced class weights push them up (mean predicted ${T.meanPred} vs an actual churn rate of ${T.actual}). Use them to rank, and calibrate before any expected-revenue maths.`, ko: `점수는 보정된 확률이 아닙니다. 클래스 가중치 균형화로 높게 나옵니다(예측 평균 ${T.meanPred}, 실제 이탈률 ${T.actual}). 순위에만 쓰고, 기대 매출 계산 전에는 보정이 필요합니다.` },
        { en: 'At the 0.50 threshold about half of flagged customers would have stayed: right for a cheap call, wrong for an expensive discount. The threshold should follow retention cost and capacity.', ko: '임계값 0.50에서는 표시된 고객의 약 절반이 실제로는 남았을 것입니다. 저렴한 전화에는 맞지만 비싼 할인에는 맞지 않으며, 임계값은 유지 비용과 처리 용량에 따라 정해야 합니다.' },
        { en: 'A small, fictional, single-snapshot sample: no time-to-churn and no drift monitoring.', ko: '작은 가상 데이터, 단일 시점 샘플: 이탈까지의 시간 정보와 드리프트 모니터링이 없습니다.' },
        { en: 'gender and SeniorCitizen are model inputs, and the model has not been audited for group fairness.', ko: 'gender와 SeniorCitizen이 모델 입력에 포함되어 있으며, 그룹 공정성 감사는 아직 하지 않았습니다.' },
      ], 'small')}
    </div>
    <div class="stack">
      ${label({ en: 'What this project shows', ko: '이 프로젝트가 보여 주는 것' })}
      ${chips([
        { en: 'Metric chosen by business cost', ko: '비즈니스 비용 기준 지표 선택' },
        { en: 'Stratified CV', ko: '층화 교차검증' },
        { en: 'Leak-free pipeline', ko: '누수 없는 파이프라인' },
        { en: 'Model serving', ko: '모델 서빙' },
        { en: 'API with validation', ko: '검증 포함 API' },
        { en: 'CI tests', ko: 'CI 테스트' },
        { en: 'Model card', ko: '모델 카드' },
      ])}
      <div class="panel mt-auto">
        <p class="h4">${L({ en: 'Lesson', ko: '교훈' })}</p>
        <p class="small mt-s">${L({ en: 'At a 26.5% base rate, accuracy is the wrong headline. Pick the metric that prices a miss correctly, before training anything.', ko: '기본 이탈률이 26.5%일 때 정확도는 잘못된 대표 지표입니다. 무엇을 학습하기 전에, 놓친 사례의 비용을 올바르게 반영하는 지표부터 정해야 합니다.' })}</p>
      </div>
    </div>
  </div>`,
};

/* ================================================================== RETAIL */
const retailOpen = {
  id: 'retail',
  sec: proj('03', RETAIL),
  chapter: CH.projects,
  body: () => `
  <div class="grid fill" style="grid-template-columns:1fr 1.05fr;gap:10mm">
    <div style="display:flex;flex-direction:column">
      ${head({
        no: '03',
        eyebrow: { en: 'Project 03 · Data modelling', ko: '프로젝트 03 · 데이터 모델링' },
        title: { en: 'Retail Commercial Intelligence: a governed data model that tells management where to look first.', ko: '리테일 커머셜 인텔리전스: 경영진이 어디부터 봐야 하는지 알려 주는 관리된 데이터 모델.' },
      })}
      <p class="mt-m">${L({ en: 'Commercial and category leadership asks one question: what changed, why, and what should we do about it? The goal was a triage list ranked by impact, not a wall of charts. Descriptive and diagnostic by design; no forecasting.', ko: '상품·카테고리 경영진의 질문은 하나입니다. 무엇이 바뀌었고, 왜 바뀌었으며, 무엇을 해야 하는가? 목표는 차트로 가득한 화면이 아니라 영향도 순으로 정렬된 우선순위 목록이었습니다. 범위는 의도적으로 기술·진단 분석이며, 예측은 포함하지 않습니다.' })}</p>
      ${callout(
        { en: 'Synthetic data, stated up front', ko: '합성 데이터임을 먼저 밝힙니다' },
        `<p class="small">${L({ en: 'Built and tested on synthetic, M5-shaped data. The mechanics are real; the business numbers on screen are illustrative and must be regenerated from the real Kaggle M5 files before they are presented as insight. Switching to the real files is one config change.', ko: 'M5 형태의 합성 데이터로 구축하고 테스트했습니다. 동작 방식은 실제이지만 화면의 비즈니스 수치는 예시이며, 인사이트로 제시하기 전에 실제 Kaggle M5 파일로 다시 생성해야 합니다. 실제 파일로 전환하려면 설정 하나만 바꾸면 됩니다.' })}</p>`,
        'callout--warn mt-m',
      )}
      <div class="stats stats--rule mt-l" style="grid-template-columns:repeat(4,1fr);gap:4mm">
        ${stat(R.rows, { en: 'rows in the full-size stress test (generated)', ko: '전체 크기 스트레스 테스트 행 수 (생성 데이터)' })}
        ${stat(`${R.peakAfter} GB`, { en: `peak memory, down from ${R.peakBefore} GB`, ko: `최대 메모리, ${R.peakBefore} GB에서 감소` })}
        ${stat(`${R.timeAfter} s`, { en: 'end-to-end build', ko: '전체 빌드 시간' })}
        ${stat(R.checks, { en: 'data-quality checks gating the build', ko: '빌드를 통제하는 데이터 품질 검사' })}
      </div>
      <div class="mt-auto">${meta([
        [{ en: 'Period', ko: '기간' }, { en: `${periods.retail} · independent project`, ko: `${periods.retail} · 개인 프로젝트` }],
        [{ en: 'Stack', ko: '기술 스택' }, { en: 'Python · DuckDB SQL · Parquet · Make · HTML dashboard', ko: 'Python · DuckDB SQL · Parquet · Make · HTML 대시보드' }],
        [{ en: 'Links', ko: '링크' }, links([[{ en: 'Live dashboard', ko: '라이브 대시보드' }, LK.retail.dashboard], [{ en: 'Source code', ko: '소스 코드' }, LK.retail.repo], [{ en: 'Architecture notes', ko: '아키텍처 문서' }, LK.retail.architecture]])],
      ])}</div>
    </div>
    <div style="display:flex;flex-direction:column;justify-content:center">
      ${plate({
        src: IMG('retail-tower.jpg'),
        alt: { en: 'Executive Control Tower with KPI tiles, contribution by category and ranked exception segments', ko: 'KPI 타일, 카테고리별 기여도, 순위가 매겨진 예외 세그먼트로 구성된 Executive Control Tower' },
        no: 'IX',
        height: 108,
        contain: true,
        caption: { en: 'Page 1, Executive Control Tower: what changed (KPIs, like-for-like), why (contribution by category) and where to look (exception segments ranked by priority score). Rendered by the pipeline from the synthetic sample.', ko: '1페이지 Executive Control Tower: 무엇이 바뀌었는지(KPI, 동일 조건 비교), 왜(카테고리별 기여도), 어디를 봐야 하는지(우선순위 점수로 정렬한 예외 세그먼트). 합성 샘플로 파이프라인이 생성.' },
      })}
    </div>
  </div>`,
};

const retailArch = {
  id: 'retail-arch',
  sec: proj('03', RETAIL),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: eb(RETAIL, { en: 'Architecture and governance', ko: '아키텍처와 거버넌스' }),
    title: { en: 'Every table states its grain, and every build passes a quality gate before anyone sees a number.', ko: '모든 테이블은 그레인을 명시하고, 모든 빌드는 누군가 수치를 보기 전에 품질 게이트를 통과합니다.' },
  })}
  <div class="mt-l">
    ${flow([
      { t: { en: 'Raw M5 CSVs', ko: '원본 M5 CSV' }, s: { en: 'daily unit sales (wide), weekly prices, event/SNAP calendar', ko: '일별 판매량(wide), 주별 가격, 이벤트/SNAP 달력' } },
      { t: { en: 'Python reshape', ko: 'Python 변환' }, s: { en: 'wide → long, streamed store by store', ko: 'wide → long, 매장 단위 스트리밍' } },
      { t: { en: 'Parquet staging', ko: 'Parquet 스테이징' }, s: { en: 'typed, validated, columnar', ko: '타입 지정, 검증, 컬럼 기반' } },
      { t: { en: 'DuckDB SQL model', ko: 'DuckDB SQL 모델' }, s: { en: 'staging → dimensions → facts → marts', ko: '스테이징 → 디멘션 → 팩트 → 마트' }, cls: 'node--hi' },
      { t: { en: 'Quality gate', ko: '품질 게이트' }, s: { en: `${R.checks} checks; hard failures stop the build`, ko: `검사 ${R.checks}개, 치명적 실패 시 빌드 중단` } },
      { t: { en: 'Metrics engine', ko: '지표 엔진' }, s: { en: 'YoY, contribution, exceptions, HHI', ko: '전년 대비, 기여도, 예외, HHI' } },
      { t: { en: 'Dashboards', ko: '대시보드' }, s: { en: 'self-contained HTML (live)', ko: '독립 실행형 HTML (공개 중)' } },
    ])}
  </div>
  <div class="grid fill mt-xl" style="grid-template-columns:repeat(3,1fr);gap:8mm">
    ${decision({ k: { en: 'Governance 1', ko: '거버넌스 1' }, t: { en: 'State the grain.', ko: '그레인을 명시한다.' }, why: { en: '<span class="mono">fact_daily_sales</span> is one row per item × store × date. A stated grain is what makes the duplicate check and every join safe.', ko: '<span class="mono">fact_daily_sales</span>는 품목 × 매장 × 날짜당 한 행입니다. 명시된 그레인이 있어야 중복 검사와 모든 조인이 안전해집니다.' } })}
    ${decision({ k: { en: 'Governance 2', ko: '거버넌스 2' }, t: { en: 'Name what a number really is.', ko: '수치가 실제로 무엇인지 이름 붙인다.' }, why: { en: 'Units × price is labelled Estimated Sales Value, not revenue, because M5 has no refunds, tax or cost of goods.', ko: 'M5에는 환불, 세금, 매출원가가 없으므로 판매량 × 가격은 매출이 아니라 추정 판매 금액(Estimated Sales Value)으로 표시합니다.' } })}
    ${decision({ k: { en: 'Governance 3', ko: '거버넌스 3' }, t: { en: 'Fail loudly, warn softly.', ko: '치명적이면 멈추고, 경미하면 경고한다.' }, why: { en: 'Unique grain, referential integrity, impossible values and null keys fail the build; price coverage and calendar continuity only warn.', ko: '고유 그레인, 참조 무결성, 불가능한 값, null 키 위반은 빌드를 실패시키고, 가격 커버리지와 달력 연속성은 경고만 합니다.' } })}
    <div class="stack" style="grid-column:span 2">
      ${label({ en: 'From numbers to a triage list', ko: '수치에서 우선순위 목록으로' })}
      <div class="panel" style="display:grid;grid-template-columns:auto 1fr;gap:3mm 6mm;align-items:center">
        <p style="font-family:var(--f-sans);font-weight:600;font-size:13pt;color:var(--ink);letter-spacing:-0.01em">Impact × Magnitude × Confidence</p>
        <p class="small">${L({ en: 'Every store × category gets at most one signal (growth, deterioration or price risk), ranked by this transparent priority score.', ko: '매장 × 카테고리마다 최대 하나의 신호(성장, 악화, 가격 위험)를 부여하고, 이 투명한 우선순위 점수로 순위를 매깁니다.' })}</p>
      </div>
      ${list([
        { en: 'Growth is like-for-like against the same window a year earlier.', ko: '성장률은 1년 전 같은 기간과 동일 조건으로 비교합니다.' },
        { en: 'Contribution analysis splits the change by category and store.', ko: '기여도 분석으로 변화를 카테고리와 매장별로 분해합니다.' },
        { en: 'Concentration uses an adaptive top-k share and the HHI.', ko: '집중도는 적응형 상위 k 비중과 HHI로 측정합니다.' },
        { en: 'Price–demand links are reported as association only.', ko: '가격과 수요의 관계는 연관성으로만 보고합니다.' },
      ], 'small')}
    </div>
    <div class="stack">
      ${label({ en: 'Questions it answers', ko: '답하는 질문' })}
      ${list([
        { en: 'Where is demand growing or deteriorating, and which products and stores drive it?', ko: '수요는 어디서 성장하거나 악화되며, 어떤 상품과 매장이 이끄는가?' },
        { en: 'How do price moves relate to demand?', ko: '가격 변화는 수요와 어떤 관계인가?' },
        { en: 'How exposed is the business to a few products or stores?', ko: '소수 상품이나 매장에 대한 의존도는?' },
      ], 'small')}
    </div>
  </div>`,
};

const retailScale = {
  id: 'retail-scale',
  sec: proj('03', RETAIL),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: eb(RETAIL, { en: 'Scale engineering', ko: '대용량 엔지니어링' }),
    title: { en: `Profiled before optimising: peak memory from ${R.peakBefore} GB to ${R.peakAfter} GB on ${R.rows} rows, and faster, not slower.`, ko: `최적화 전에 먼저 프로파일링: ${R.rows === '59.1M' ? '5,910만' : R.rows} 행에서 최대 메모리 ${R.peakBefore} GB → ${R.peakAfter} GB, 속도는 오히려 빨라졌습니다.` },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.1fr 1fr;gap:12mm">
    <div style="display:flex;flex-direction:column">
      <p class="chart-k">${L({ en: `End-to-end build at full M5 shape: ${R.series} series × ${R.days} days`, ko: `M5 전체 크기 빌드: 시계열 ${R.series}개 × ${R.days}일` })}</p>
      ${pairBars(
        [
          { label: { en: 'First version', ko: '첫 버전' }, a: { value: R.peakBefore, display: `${R.peakBefore} GB` }, b: { value: R.timeBefore, display: `${R.timeBefore} s` } },
          { label: { en: 'Final', ko: '최종' }, hi: true, a: { value: R.peakAfter, display: `${R.peakAfter} GB` }, b: { value: R.timeAfter, display: `${R.timeAfter} s` } },
        ],
        [
          { title: { en: 'Peak memory', ko: '최대 메모리' }, max: 9, ticks: [0, 3, 6, 9], fmt: (v) => `${v} GB` },
          { title: { en: 'Wall time', ko: '실행 시간' }, max: 110, ticks: [0, 50, 100], fmt: (v) => `${v} s` },
        ],
        { labelW: 24 },
      )}
      <p class="chart-note">${L({ en: 'Intel i9 MacBook Pro. Source: docs/architecture.md in the project repository.', ko: 'Intel i9 MacBook Pro. 출처: 프로젝트 저장소의 docs/architecture.md.' })}</p>
      <div class="mt-l">
        ${label({ en: 'Four changes, each measured on its own', ko: '각각 따로 측정한 네 가지 변경' })}
        <div class="mt-m" style="display:grid;grid-template-columns:1fr 1fr;gap:3mm">
          ${[
            { en: 'Stream the reshape store by store instead of one big melt', ko: '한 번의 큰 melt 대신 매장 단위로 스트리밍 변환' },
            { en: 'Categorical encoding for every text column (ingestion alone: 4.9 → 1.8 GB, 83 → 45 s)', ko: '모든 텍스트 열을 범주형으로 인코딩 (수집 단계만: 4.9 → 1.8 GB, 83 → 45초)' },
            { en: 'Run ingestion in its own process', ko: '데이터 수집을 별도 프로세스에서 실행' },
            { en: `Cap DuckDB at ${R.cap} so it spills to disk`, ko: `DuckDB 메모리를 ${R.cap}로 제한해 디스크로 스필` },
          ]
            .map((t, i) => `<div class="panel" style="display:grid;grid-template-columns:7mm 1fr;gap:2mm;align-items:start;padding:3mm 3.4mm"><span class="num-chip" style="width:6mm;height:6mm">${i + 1}</span><p class="small">${L(t)}</p></div>`)
            .join('')}
        </div>
      </div>
      <div class="stats stats--rule mt-m" style="grid-template-columns:repeat(4,1fr);gap:5mm">
        ${stat(R.series, { en: 'item-store series', ko: '품목-매장 시계열' }, { size: 's' })}
        ${stat(R.days, { en: 'days per series', ko: '시계열당 일수' }, { size: 's' })}
        ${stat(R.rows, { en: 'rows end to end', ko: '처리한 전체 행' }, { size: 's' })}
        ${stat(R.cap, { en: 'DuckDB memory cap', ko: 'DuckDB 메모리 제한' }, { size: 's' })}
      </div>
      <div class="mt-auto rule-top--ink">
        ${label({ en: 'Why each piece', ko: '각 구성 요소를 고른 이유' })}
        <div class="mt-m">${meta([
          [{ en: 'Reshape', ko: '변환' }, { en: 'pandas, streamed by store with categoricals', ko: 'pandas, 범주형 인코딩과 매장 단위 스트리밍' }],
          [{ en: 'Staging', ko: '스테이징' }, { en: 'Parquet: columnar and typed; DuckDB reads it zero-copy', ko: 'Parquet: 열 기반·타입 지정, DuckDB가 복사 없이 읽음' }],
          [{ en: 'Model', ko: '모델' }, { en: 'DuckDB SQL: runs the real SQL with no server to install', ko: 'DuckDB SQL: 서버 설치 없이 실제 SQL 실행' }],
          [{ en: 'Rebuild', ko: '재빌드' }, { en: 'Makefile + config.yaml: make all rebuilds everything from one settings file', ko: 'Makefile + config.yaml: 설정 파일 하나와 make all로 전체 재빌드' }],
        ])}</div>
      </div>
    </div>
    <div class="stack">
      ${decision({
        k: { en: 'Lesson', ko: '교훈' },
        t: { en: 'Profile first, then change one thing at a time.', ko: '먼저 프로파일링하고, 한 번에 하나씩 바꾼다.' },
        why: { en: 'Inside DuckDB the memory peak came from the full-key duplicate-grain check, a 59M-group aggregate. Capping DuckDB at 1.5 GB cost no wall time at all: the guess would have been wrong.', ko: 'DuckDB 내부의 메모리 최고점은 전체 키 중복 그레인 검사(5,900만 그룹 집계)에서 나왔습니다. DuckDB를 1.5 GB로 제한해도 실행 시간은 전혀 늘지 않았습니다. 짐작으로 고쳤다면 틀렸을 것입니다.' },
      })}
      <div class="rule-top">
        <p class="h4">${L({ en: 'Built for the real data size', ko: '실제 데이터 크기에 맞춘 설계' })}</p>
        <p class="small mt-s">${L({ en: `The model follows the shape of the M5 (Walmart) data: ${R.states} states, ${R.stores} stores, ${R.realSeries} item-store series. The stress test generated data at full size so the real files fit on an 8 GB laptop.`, ko: `데이터 모델은 M5(Walmart) 데이터의 형태를 따릅니다: ${R.states}개 주, ${R.stores}개 매장, 품목-매장 시계열 ${R.realSeries}개. 스트레스 테스트는 전체 크기로 데이터를 생성해, 실제 파일이 8 GB 노트북에서 처리되도록 했습니다.` })}</p>
      </div>
      ${label({ en: 'Limits and next steps', ko: '한계와 다음 단계' })}
      ${list([
        { en: 'The numbers in the repository are not business findings; regenerate them from the real M5 files first.', ko: '저장소의 수치는 비즈니스 결과가 아니므로, 먼저 실제 M5 파일로 다시 생성해야 합니다.' },
        { en: 'The Tableau Public edition is specified in a build guide but not yet published; the HTML edition is live.', ko: 'Tableau Public 버전은 빌드 가이드로 정리했지만 아직 공개하지 않았고, HTML 버전은 공개되어 있습니다.' },
        { en: 'Next: unit tests for the metric functions (growth windows, contribution, priority score).', ko: '다음 단계: 지표 함수(성장 구간, 기여도, 우선순위 점수)의 단위 테스트.' },
      ], 'small')}
      <div class="panel mt-auto">
        <p class="h4">${L({ en: 'Left out on purpose', ko: '의도적으로 넣지 않은 것' })}</p>
        <p class="small mt-s">${L({ en: 'No forecasting model, no cloud warehouse, no orchestration framework (Airflow), no second BI tool. Each would add surface area without strengthening the core: raw operational data to a governed model to a decision.', ko: '예측 모델, 클라우드 웨어하우스, 오케스트레이션 프레임워크(Airflow), 두 번째 BI 도구는 넣지 않았습니다. 모두 표면적만 늘릴 뿐, 원천 운영 데이터에서 관리된 모델을 거쳐 의사결정에 이르는 핵심을 강화하지 않기 때문입니다.' })}</p>
      </div>
    </div>
  </div>`,
};

/* ================================================================== OLIST */
const olistOpen = {
  id: 'olist',
  sec: proj('04', OLIST),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: { en: 'Project 04 · SQL-first analysis', ko: '프로젝트 04 · SQL 중심 분석' },
    title: { en: 'Olist Marketplace: what late deliveries cost a marketplace, answered in SQL across 99,441 orders.', ko: 'Olist 마켓플레이스: 배송 지연이 마켓플레이스에 주는 비용을 주문 99,441건의 SQL 분석으로 답하다.' },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.35fr 1fr;gap:10mm">
    <div style="display:flex;flex-direction:column;min-height:0">
      ${plate({
        src: IMG('olist-dashboard.jpg'),
        alt: { en: 'The live Olist dashboard: on-time orders average 4.29 stars against 1.73 for 8+ days late', ko: 'Olist 라이브 대시보드: 정시 주문 평균 4.29점, 8일 이상 지연 1.73점' },
        no: 'X',
        height: 98,
        caption: { en: 'The live dashboard (plain HTML and d3 on GitHub Pages). Every number is rebuilt from the raw Kaggle files; filter by year, state and category and share a view by its link.', ko: '라이브 대시보드(GitHub Pages의 순수 HTML과 d3). 모든 수치는 원본 Kaggle 파일에서 다시 생성되며, 연도·주·카테고리로 필터링하고 화면을 링크로 공유할 수 있습니다.' },
      })}
      <div class="mt-auto">${meta([
        [{ en: 'Period', ko: '기간' }, { en: `${periods.olist} · independent project`, ko: `${periods.olist} · 개인 프로젝트` }],
        [{ en: 'Data', ko: '데이터' }, { en: `Public Olist dataset: ${O.tables} tables, Sept 2016 – Oct 2018, ${O.customers} customers`, ko: `공개 Olist 데이터셋: 테이블 ${O.tables}개, 2016년 9월 – 2018년 10월, 고객 ${O.customers}명` }],
        [{ en: 'Stack', ko: '기술 스택' }, 'SQL (SQLite) · Python · pandas · matplotlib · d3.js · GitHub Pages'],
        [{ en: 'Links', ko: '링크' }, links([[{ en: 'Live dashboard', ko: '라이브 대시보드' }, LK.olist.dashboard], [{ en: 'Source code', ko: '소스 코드' }, LK.olist.repo], [{ en: 'Findings report', ko: '분석 결과 보고서' }, LK.olist.findings]])],
      ])}</div>
    </div>
    <div class="stack">
      <p>${L({ en: 'A marketplace lives on repeat customers and good reviews. The question was whether Olist has either, and which operational lever moves satisfaction most. A deliberately model-free analysis: SQL does the heavy lifting, and the output is a short list of decisions.', ko: '마켓플레이스는 재구매 고객과 좋은 리뷰로 유지됩니다. 질문은 Olist에 둘 중 하나라도 있는지, 그리고 만족도를 가장 크게 움직이는 운영 요인은 무엇인지였습니다. 의도적으로 모델 없이 진행한 분석으로, SQL이 핵심 작업을 맡고 결과물은 짧은 의사결정 목록입니다.' })}</p>
      <div class="stats stats--rule" style="grid-template-columns:1fr;gap:3.6mm">
        ${stat(O.reorder, { en: 'of customers ever order again', ko: '재구매한 적이 있는 고객' }, { size: 'l' })}
        ${stat('4.29 → 1.73', { en: 'average stars, on time → 8+ days late', ko: '평균 별점, 정시 → 8일 이상 지연' })}
        ${stat('r = 0.78', { en: 'on-time rate vs review across 27 states (delivery days: r = −0.53)', ko: '27개 주의 정시 배송률과 리뷰의 상관 (배송 일수: r = −0.53)' })}
      </div>
    </div>
  </div>`,
};

const STARS = { ontime: { en: 'On time or early', ko: '정시 또는 조기' }, late13: { en: '1–3 days late', ko: '1–3일 지연' }, late47: { en: '4–7 days late', ko: '4–7일 지연' }, late8: { en: '8+ days late', ko: '8일 이상 지연' } };
const nf = new Intl.NumberFormat('en-US');

const olistFindings = {
  id: 'olist-findings',
  sec: proj('04', OLIST),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: eb(OLIST, { en: 'Findings', ko: '분석 결과' }),
    title: { en: 'Customers punish broken promises more than slow ones.', ko: '고객은 느린 배송보다 지켜지지 않은 약속에 더 엄격합니다.' },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1fr 1fr 1fr;gap:9mm">
    <div class="stack">
      <p class="chart-k">${L({ en: 'Average review (1–5) by delivery timeliness', ko: '배송 정시성별 평균 리뷰 (1–5)' })}</p>
      ${bars(
        O.stars.map((s, i) => ({ label: STARS[s.key], sub: { en: `${nf.format(s.n)} orders`, ko: `주문 ${nf.format(s.n)}건` }, value: s.v, display: s.v.toFixed(2), hi: i === 0 || i === 3 })),
        { max: 5, labelW: 27, ticks: [0, 1, 2, 3, 4, 5] },
      )}
      <p class="small">${L({ en: 'Late delivery shows the strongest association with poor reviews: each band of lateness goes with roughly one star less.', ko: '배송 지연은 낮은 리뷰와 가장 강한 연관성을 보입니다. 지연 구간이 한 단계 늘 때마다 별점이 약 1점씩 낮아집니다.' })}</p>
    </div>
    <div class="stack">
      <p class="chart-k">${L({ en: 'Across 27 states: what tracks the average review?', ko: '27개 주: 평균 리뷰와 함께 움직이는 것은?' })}</p>
      ${bars(
        [
          { label: { en: 'On-time rate', ko: '정시 배송률' }, value: 0.78, display: 'r = 0.78', hi: true },
          { label: { en: 'Delivery days', ko: '배송 일수' }, value: 0.53, display: 'r = −0.53' },
        ],
        { max: 1, labelW: 27, ticks: [0, 0.5, 1], fmt: (v) => `|r| ${v}` },
      )}
      <p class="small">${L({ en: 'Slow is not late. The slowest states are in the north (Roraima 29.4 days, Amapá 27.2, Amazonas 26.4, against a 12.6-day average), yet Amapá and Amazonas arrive on time about 96% of the time because their estimates are long, and both average above 4.1 stars (small samples: 68 and 147 orders).', ko: '느린 것과 늦은 것은 다릅니다. 가장 느린 주는 북부입니다(호라이마 29.4일, 아마파 27.2일, 아마조나스 26.4일, 평균 12.6일). 하지만 아마파와 아마조나스는 배송 예정일이 길게 잡혀 있어 약 96%가 정시에 도착하고, 두 주 모두 평균 별점이 4.1점 이상입니다(표본이 작음: 68건, 147건).' })}</p>
      <p class="small muted">${L({ en: 'Broken promises sit where the volume is: Rio de Janeiro (12,698 orders, 86.5% on time, 3.90 stars) and the Northeast (Alagoas 76.1%, Maranhão 80.3% on time).', ko: '약속이 깨지는 곳은 물량이 많은 곳입니다. 리우데자네이루(주문 12,698건, 정시 86.5%, 별점 3.90)와 북동부(알라고아스 76.1%, 마라냥 80.3% 정시).' })}</p>
      ${plate({
        src: IMG('olist-states.png'),
        alt: { en: 'The 15 slowest Brazilian states by average delivery days', ko: '평균 배송 일수 기준 가장 느린 브라질 15개 주' },
        no: 'XII',
        height: 44,
        contain: true,
        caption: { en: 'Notebook figure: the 15 slowest states by average delivery days.', ko: '노트북 그림: 평균 배송 일수 기준 가장 느린 15개 주.' },
      })}
    </div>
    <div class="stack">
      ${plate({
        src: IMG('olist-cohorts.png'),
        alt: { en: 'Repeat-purchase rate by monthly acquisition cohort, flat at 3–5%', ko: '월별 유입 코호트의 재구매율, 3–5%로 평탄' },
        no: 'XI',
        height: 46,
        contain: true,
        caption: { en: 'Retention by acquisition cohort: flat at 3–5% from early 2017. The early spike is a one-customer cohort.', ko: '유입 코호트별 리텐션: 2017년 초부터 3–5%로 평탄. 초기 급등은 고객 1명뿐인 코호트입니다.' },
      })}
      <div class="rule-top">
        <p class="h4">${L({ en: 'A one-time-purchase marketplace', ko: '일회성 구매 중심의 마켓플레이스' })}</p>
        <p class="small mt-s">${L({ en: `${O.reorder} of customers ever order again and ${O.atRisk} are already At Risk or Churned.`, ko: `재구매 고객은 ${O.reorder}뿐이고, ${O.atRisk}는 이미 이탈 위험(At Risk) 또는 이탈(Churned) 상태입니다.` })}</p>
      </div>
      <div class="rule-top">
        <p class="h4">${L({ en: 'Where seller support should start', ko: '판매자 지원을 시작할 곳' })}</p>
        <p class="small mt-s">${L({ en: `No seller dominates (the largest makes ${O.sellers.largest} of item revenue), but ${O.sellers.top} of ${O.sellers.all} sellers (${O.sellers.share}) make 80% of it.`, ko: `지배적인 판매자는 없지만(최대 판매자가 상품 매출의 ${O.sellers.largest}), 판매자 ${O.sellers.all}명 중 ${O.sellers.top}명(${O.sellers.share})이 매출의 80%를 차지합니다.` })}</p>
      </div>
    </div>
  </div>
  <p class="small muted mt-m">${L({ en: 'All findings are associations in 2016–2018 data, not measured causal effects.', ko: '모든 결과는 2016–2018년 데이터에서의 연관성이며, 측정된 인과 효과가 아닙니다.' })}</p>`,
};

const olistRigour = {
  id: 'olist-rigour',
  sec: proj('04', OLIST),
  chapter: CH.projects,
  body: () => `
  ${head({
    no: '03',
    eyebrow: eb(OLIST, { en: 'Method and limits', ko: '방법과 한계' }),
    title: { en: 'Definitions fixed before any number was trusted, and a published correction when one was wrong.', ko: '어떤 수치도 믿기 전에 정의부터 고정했고, 틀린 수치는 공개적으로 바로잡았습니다.' },
  })}
  <div class="mt-l">
    ${flow([
      { t: { en: 'Raw CSVs', ko: '원본 CSV' }, s: { en: `${O.tables} tables from Kaggle`, ko: `Kaggle 테이블 ${O.tables}개` } },
      { t: 'SQLite', s: 'src/create_db.py' },
      { t: { en: '6 SQL files', ko: 'SQL 파일 6개' }, s: { en: 'CTEs, window functions, cohorts', ko: 'CTE, 윈도우 함수, 코호트' }, cls: 'node--hi' },
      { t: { en: 'Notebook', ko: '노트북' }, s: { en: 'question → SQL → chart → insight → recommendation', ko: '질문 → SQL → 차트 → 인사이트 → 권고' } },
      { t: { en: 'Live dashboard', ko: '라이브 대시보드' }, s: { en: 'd3 on GitHub Pages, rebuilt by src/build_web_data.py', ko: 'GitHub Pages의 d3, src/build_web_data.py로 재생성' } },
    ])}
  </div>
  <div class="grid fill mt-xl" style="grid-template-columns:1.1fr 1fr 1fr;gap:9mm">
    <div class="stack">
      ${label({ en: 'Definitions fixed first', ko: '먼저 고정한 정의' })}
      ${list([
        { en: 'Delivery metrics use only delivered orders with a delivery date; otherwise NULLs corrupt every average.', ko: '배송 지표는 배송 완료되고 배송일이 있는 주문만 사용합니다. 그렇지 않으면 NULL이 모든 평균을 왜곡합니다.' },
        { en: 'Customers are counted by customer_unique_id (the person), not the per-order customer_id.', ko: '고객은 주문별 customer_id가 아니라 사람 단위인 customer_unique_id로 셉니다.' },
        { en: 'Revenue is item price, not payment totals, so freight and shared orders aren’t double-counted.', ko: '매출은 결제 총액이 아닌 상품 가격 기준이므로 운송비와 공유 주문이 이중 계산되지 않습니다.' },
        { en: 'Reviews are averaged per order first, because a few orders have more than one.', ko: '일부 주문에는 리뷰가 둘 이상 있으므로, 리뷰는 주문별로 먼저 평균을 냅니다.' },
        { en: 'Recency is measured against the last date in the data (Oct 2018), not today.', ko: '최근성은 오늘이 아니라 데이터의 마지막 날짜(2018년 10월) 기준입니다.' },
      ], 'small')}
    </div>
    <div class="stack">
      ${decision({
        k: { en: 'Self-correction', ko: '스스로 바로잡기' },
        t: { en: 'Check the denominator.', ko: '분모를 확인하라.' },
        why: [
          { en: `My first seller-concentration figure divided item revenue by total payments, which include freight, and reported ${O.sellers.wrong} for the top 15.`, ko: `처음 계산한 판매자 집중도는 상품 매출을 운송비가 포함된 총결제액으로 나누어 상위 15개 판매자 비중을 ${O.sellers.wrong}로 보고했습니다.` },
          { en: `Like for like it is ${O.sellers.top15}, and it overturned my “long tail carries the business” conclusion. The correction is published in the findings.`, ko: `같은 기준으로 계산하면 ${O.sellers.top15}이고, 이 수정으로 “롱테일이 사업을 지탱한다”는 제 결론이 뒤집혔습니다. 수정 내용은 분석 결과 보고서에 공개했습니다.` },
        ],
      })}
      <div class="stats stats--rule" style="grid-template-columns:1fr 1fr;gap:5mm">
        ${stat(O.sellers.wrong, { en: 'first figure (wrong denominator)', ko: '처음 수치 (잘못된 분모)' }, { size: 's' })}
        ${stat(O.sellers.top15, { en: 'corrected, like for like', ko: '수정한 수치 (같은 기준)' }, { size: 's' })}
      </div>
    </div>
    <div class="stack">
      ${label({ en: 'Limits', ko: '한계' })}
      ${list([
        { en: 'The data ends in October 2018: findings describe 2016–2018, not today’s marketplace.', ko: '데이터는 2018년 10월에 끝나므로, 결과는 현재가 아닌 2016–2018년을 설명합니다.' },
        { en: 'No acquisition-cost data, so “retention is low” is a strong signal but not a full ROI case.', ko: '고객 획득 비용 데이터가 없어 “리텐션이 낮다”는 강한 신호이지만 완전한 ROI 근거는 아닙니다.' },
        { en: 'Lateness, region and carrier are tangled together: the drop in reviews is an association.', ko: '지연, 지역, 배송사가 얽혀 있어 리뷰 하락은 연관성입니다.' },
        { en: 'Reviews are voluntary (selection bias); the northern states are small samples.', ko: '리뷰는 자발적이어서 선택 편향이 있고, 북부 주는 표본이 작습니다.' },
      ], 'small')}
      <div class="panel mt-auto">
        <p class="h4">${L({ en: 'Next', ko: '다음 단계' })}</p>
        <p class="small mt-s">${L({ en: 'Segment by product category and region to separate “late because far” from “late because of the seller or handling”.', ko: '상품 카테고리와 지역별로 세분화해 “멀어서 늦은 경우”와 “판매자나 처리 과정 때문에 늦은 경우”를 구분합니다.' })}</p>
      </div>
    </div>
  </div>`,
};

/* ================================================================== ADDITIONAL WORK */
const more = {
  id: 'more',
  sec: { en: 'Additional work', ko: '기타 작업' },
  chapter: CH.more,
  body: () => `
  ${head({
    no: '04',
    eyebrow: { en: 'Additional work', ko: '기타 작업' },
    title: { en: 'Smaller pieces that widen the picture: computer vision, neural networks and statistical modelling.', ko: '역량의 폭을 보여 주는 작은 작업들: 컴퓨터 비전, 신경망, 통계 모델링.' },
  })}
  <div class="grid fill mt-l" style="grid-template-columns:1.3fr 1fr 1fr;gap:9mm">
    <div class="stack">
      <div style="display:flex;justify-content:space-between;align-items:center"><p class="h3">${L({ en: 'Paper → Data: Korean invoice scanner', ko: '종이 → 데이터: 한국어 송장 스캐너' })}</p>${badge('note', { en: 'Private · prototype', ko: '비공개 · 프로토타입' })}</div>
      ${plate({
        src: IMG('scanner-scan.jpg'),
        alt: { en: 'Five stages from invoice photo to deskewed scan', ko: '송장 사진에서 기울기 보정 스캔까지 다섯 단계' },
        height: 30,
        contain: true,
      })}
      ${plate({ src: IMG('scanner-match.jpg'), alt: { en: 'Keypoint matching and registration onto the template', ko: '특징점 매칭과 템플릿 정합' }, height: 40, contain: true })}
      <p class="small">${L({ en: 'A crooked phone photo of a Korean paper invoice becomes a clean scan and checkable data, without training a model: OpenCV page detection and perspective correction, ORB/SIFT matching with RANSAC onto a blank template, and per-field Korean OCR with Tesseract into a CSV.', ko: '비뚤게 찍은 한국어 종이 송장 사진을 모델 학습 없이 깨끗한 스캔본과 검증 가능한 데이터로 바꿉니다. OpenCV로 페이지 검출과 원근 보정, ORB/SIFT 매칭과 RANSAC으로 빈 템플릿에 정합, Tesseract로 필드별 한국어 OCR을 수행해 CSV로 저장합니다.' })}</p>
      <div class="stats stats--rule" style="grid-template-columns:repeat(3,1fr);gap:4mm">
        ${stat('12 / 12', { en: 'fields read exactly', ko: '정확히 읽은 필드' }, { size: 's' })}
        ${stat('0.3 px', { en: 'corner error, SIFT + RANSAC', ko: '모서리 오차, SIFT + RANSAC' }, { size: 's' })}
        ${stat('+2.94°', { en: 'skew recovered of +3.00°', ko: '+3.00° 중 복원한 기울기' }, { size: 's' })}
      </div>
      <p class="small muted">${L({ en: 'Tested on one synthetic sample and tuned on that same sample, so 12/12 is not a held-out result. Code available on request.', ko: '합성 샘플 1개로 테스트하고 같은 샘플로 조정했으므로 12/12는 홀드아웃 결과가 아닙니다. 요청 시 코드 공개 가능.' })}</p>
    </div>
    <div class="stack-l">
      <div class="stack">
        <p class="h3">${L({ en: 'MNIST neural-network explorer', ko: 'MNIST 신경망 탐색기' })}</p>
        <p class="label">PyTorch · FastAPI · WebSockets</p>
        <p class="small">${L({ en: 'A small PyTorch network (784 → 256 → 128 → 64 → 10, with dropout) trained on MNIST and served by FastAPI, streaming training progress over WebSockets to a browser drawing pad.', ko: 'MNIST로 학습한 작은 PyTorch 신경망(784 → 256 → 128 → 64 → 10, 드롭아웃 포함)을 FastAPI로 제공하고, 학습 진행 상황을 WebSocket으로 브라우저 그리기 패드에 실시간 전송합니다.' })}</p>
        ${links([[{ en: 'Repository', ko: '저장소' }, LK.mnist]])}
      </div>
      <div class="stack">
        <p class="h3">${L({ en: 'Statistical modelling notebooks', ko: '통계 모델링 노트북' })}</p>
        <p class="label">statsmodels · Seaborn · SciPy</p>
        <p class="small">${L({ en: 'OLS for student GPA and used-car prices, and a logistic-regression classifier for bank marketing, with coefficient tests and diagnostics. Used-car price model: test R² 0.773, 5-fold CV mean 0.749.', ko: '학생 GPA와 중고차 가격의 OLS, 은행 마케팅 로지스틱 회귀 분류기를 계수 검정과 진단과 함께 다룹니다. 중고차 가격 모델: 테스트 R² 0.773, 5-fold 교차검증 평균 0.749.' })}</p>
        ${links([[{ en: 'Repository', ko: '저장소' }, LK.notebooks]])}
      </div>
    </div>
    <div class="stack-l">
      <div class="stack">
        <div style="display:flex;justify-content:space-between;align-items:center"><p class="h3">${L({ en: 'Seam carving from scratch', ko: '심 카빙 직접 구현' })}</p>${badge('note', { en: 'Private', ko: '비공개' })}</div>
        ${plate({ src: IMG('seam.jpg'), alt: { en: 'Plain resize, centre crop and seam carving compared', ko: '단순 크기 조정, 중앙 크롭, 심 카빙 비교' }, height: 22, contain: true })}
        <p class="small">${L({ en: 'Content-aware resizing in about 170 lines of NumPy: Sobel energy, a dynamic-programming seam checked against brute force (8 tests), and masks to protect or remove objects.', ko: 'NumPy 약 170줄로 구현한 내용 인식 크기 조정: Sobel 에너지, 완전 탐색과 대조한 동적 계획법 심(테스트 8개), 객체 보호·제거용 마스크.' })}</p>
      </div>
      <div class="stack panel">
        <p class="label" style="color:var(--warm-ink)">${L({ en: 'Academic · Dong-A University · 2023', ko: '학술 · 동아대학교 · 2023' })}</p>
        <p class="h4">${L({ en: 'Lotte World Busan: visitor review mining (team project)', ko: '롯데월드 부산: 방문객 리뷰 마이닝 (팀 프로젝트)' })}</p>
        <p class="small">${L({ en: '887 multilingual Google Maps reviews: KH Coder keyword frequency, a co-occurrence network and descriptive statistics. Pricing & discounts scored lowest (mean 1.80 / 5).', ko: '다국어 Google 지도 리뷰 887건: KH Coder 키워드 빈도, 동시 출현 네트워크, 기술 통계. 가격·할인 항목이 가장 낮은 점수(평균 1.80 / 5).' })}</p>
      </div>
    </div>
  </div>`,
};

/* ================================================================== CONTACT */
const contact = {
  id: 'contact',
  sec: { en: 'Contact', ko: '연락처' },
  chapter: CH.contact,
  theme: 'night',
  body: () => `
  <div class="grid fill" style="grid-template-columns:1.2fr 1fr;gap:14mm">
    <div style="display:flex;flex-direction:column">
      <p class="eyebrow"><span class="eyebrow__no">§ 05</span><span>${L({ en: 'Contact', ko: '연락처' })}</span></p>
      <h2 class="title" style="font-size:${ctx.lang === 'ko' ? '24pt' : '31pt'};line-height:1.08;margin-top:5mm">${L({
        en: 'Hiring for data science or machine learning? Email is the quickest way to reach me.',
        ko: '데이터 사이언스·머신러닝 인재를 찾고 계신가요? 이메일로 연락 주시면 가장 빠르게 답변드리겠습니다.',
      })}</h2>
      <p class="mt-xl"><a href="mailto:${LK.email}" style="font-family:var(--f-mono);font-size:13pt;color:#eee6d9;text-decoration-color:#dba12c">${LK.email}</a></p>
      <div class="mt-l">${meta([
        [{ en: 'Based in', ko: '거주' }, { en: 'Busan, South Korea (KST, UTC+9)', ko: '대한민국 부산 (KST, UTC+9)' }],
        [{ en: 'Visa', ko: '체류자격' }, person.visa],
        [{ en: 'Open to', ko: '희망 근무' }, { en: 'Full-time, part-time, project-based and remote roles', ko: '정규직, 파트타임, 프로젝트 단위, 원격 근무' }],
        [{ en: 'Profiles', ko: '프로필' }, links([['GitHub', LK.github], ['LinkedIn', LK.linkedin], ['Telegram', LK.telegram]])],
      ])}</div>
      <p class="small mt-auto" style="color:#b4c2cc">${L({
        en: 'Numbers from the four main projects can be checked in their public repositories; private work is marked as private. Employment outcomes are as stated in my CV.',
        ko: '네 가지 주요 프로젝트의 수치는 공개 저장소에서 확인할 수 있으며, 비공개 작업은 비공개로 표시했습니다. 재직 중 성과는 이력서 기재 내용입니다.',
      })}</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:6mm;justify-content:center">
      ${[
        { qr: 'site-en.svg', t: { en: 'Portfolio website', ko: '포트폴리오 웹사이트' }, s: { en: 'Case studies, code links, CV in English and Korean', ko: '케이스 스터디, 코드 링크, 영문·국문 이력서' }, href: LK.site },
        { qr: 'site-ko.svg', t: { en: 'Korean version', ko: '한국어 버전' }, s: { en: 'The same site, in Korean', ko: '같은 사이트의 한국어 버전' }, href: LK.siteKo },
      ]
        .map(
          (c) => `<a href="${c.href}" style="display:grid;grid-template-columns:24mm 1fr;gap:5mm;align-items:center;text-decoration:none;border-top:0.25mm solid rgb(238 230 217 / 0.3);padding-top:5mm">
            <span class="qr"><img src="${QR(c.qr)}" alt="QR"></span>
            <span><span class="h3" style="display:block;color:#eee6d9">${L(c.t)}</span><span class="small" style="display:block;color:#d9dfe3;margin-top:1mm">${L(c.s)}</span><span class="mono" style="display:block;font-size:7.4pt;color:#e6bd5f;margin-top:2mm">${short(c.href)}</span></span>
          </a>`,
        )
        .join('')}
      <div style="border-top:0.25mm solid rgb(238 230 217 / 0.3);padding-top:5mm">
        <p class="label" style="color:#b4c2cc">${L({ en: 'Flagship, live', ko: '대표 프로젝트, 라이브' })}</p>
        <p class="mt-s">${links([[{ en: 'F1 Pace Intelligence app', ko: 'F1 페이스 인텔리전스 앱' }, LK.dpec.app], [{ en: 'Source code', ko: '소스 코드' }, LK.dpec.repo]])}</p>
      </div>
    </div>
  </div>`,
};

export const morePages = [telcoOpen, telcoDecision, telcoEng, retailOpen, retailArch, retailScale, olistOpen, olistFindings, olistRigour, more, contact];
