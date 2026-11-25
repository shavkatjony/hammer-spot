/**
 * Interface text in both languages: labels, buttons, headings and short sentences written into components.
 * Facts (jobs, skills, projects) live in site.ts (English) and ko.ts (Korean), not here.
 */
import type { Lang } from '../lib/i18n';
import type { Status } from './site';

const en = {
  skip: 'Skip to content',
  newTab: ' (opens in a new tab)',
  ogAlt: (name: string, title: string) => `${name}, ${title}: portfolio opening screen over a desert horizon.`,
  knowsAbout: ['Data science', 'Machine learning', 'Statistical modelling', 'Forecasting', 'Applied AI', 'SQL', 'Python'],

  nav: {
    primary: 'Primary',
    home: (name: string) => `${name}, home`,
    links: { experience: 'Experience', work: 'Work', notes: 'Notes', toolkit: 'Toolkit', about: 'About', contact: 'Contact' },
    cvEn: 'CV · English (PDF)',
    cvKo: ['CV · ', '한국어', ' (PDF)'] as [string, string, string],
    dark: 'Dark theme',
    menu: 'Menu',
    language: 'Language',
    langNames: { en: 'English', ko: '한국어' },
    langShort: { en: 'EN', ko: '한국어' },
  },

  cv: {
    button: 'Download CV',
    nav: 'CV',
    menu: 'Choose the CV language',
    head: 'Choose language',
    pdf: 'PDF',
  },

  status: { Complete: 'Complete', Working: 'Working', 'In development': 'In development', Archived: 'Archived' } as Record<Status, string>,

  hero: {
    viewWork: 'View selected work',
    profiles: 'Profiles',
    github: 'GitHub profile',
    linkedin: 'LinkedIn profile',
    email: (h: string) => `Email ${h}`,
    open: (scope: string, city: string, country: string) =>
      `${scope.charAt(0).toUpperCase()}${scope.slice(1)} · Based in ${city}, ${country}`,
    portrait: (name: string) => `Portrait of ${name}`,
    monogram: (name: string) => `${name}, monogram`,
    skills: 'Technical skills',
  },

  xp: {
    title: 'Experience',
    dek: (total: string) =>
      `${total} of professional experience, plus a backend internship: data science and machine learning, built on a foundation in backend development.`,
    skillsUsed: 'Skills used',
  },

  work: {
    title: 'Selected work',
    dek: 'Four featured projects, led by my flagship, DPEC. Each has a full case study: the problem, the data, how it was built, what the numbers say and where it falls short. Every number links back to the code or report it comes from.',
    alsoCv: 'Also in computer vision',
    more: 'More work',
    repo: 'Repository',
  },

  pf: {
    flagship: 'Flagship project',
    demonstrates: 'What it demonstrates',
    part: 'My part',
    result: 'Result',
    methods: 'Methods',
    stack: 'Stack',
    read: 'Read the case study',
  },

  notes: {
    title: 'Field notes',
    dek: 'Seven observations from the projects: what the data or the tests actually showed, each linked to the file it comes from. Working notes, not published articles.',
    obs: 'Obs.',
    source: 'Source: ',
  },

  tk: {
    title: 'Toolkit',
    dek: 'The skill groups from the top of the page, each linked to the projects and jobs that show it, followed by open-source projects I studied.',
    demonstrated: 'Demonstrated in projects and work',
    numbers: 'Project numbers:',
    job: 'Job (see Experience)',
    chip: (index: string, title: string) => `${index} ${title}, case study`,
    usedAt: (job: string) => `Used at ${job}, see Experience`,
    also: 'Also in my toolkit:',
    studied: 'Open source studied',
  },

  about: {
    title: 'About',
    lead: (name: string) =>
      `I’m ${name}, a data scientist and applied ML engineer in Busan, working across statistical modelling, machine learning and data engineering. I studied Integrated Business Management at Dong-A University, where statistics and econometrics pulled me toward data.`,
    body: (org: string) =>
      `I started in backend development, building Python tooling and then Django APIs and PostgreSQL schemas for two companies in Chust. I then spent three years as a data scientist and applied ML engineer at ${org}, where I built a PostgreSQL warehouse, SKU-level demand forecasting and a Text-to-SQL assistant. I take a problem from data preparation and analysis through modelling, evaluation and delivery: reproducible pipelines, data-quality checks, models chosen against baselines, and evaluation on data the model never saw. My flagship project, DPEC, forecasts Formula 1 race pace from public timing data; its README traces every number to its source.`,
    close: 'I’d rather show than tell: the code, the tests, the write-ups and the limits of each project, stated plainly.',
    record: 'Record',
    experience: 'Experience',
    roles: (n: number, total: string) =>
      `${total} of professional experience, from backend development to data science (${['no', 'one', 'two', 'three', 'four', 'five', 'six'][n] ?? n} roles, including an internship)`,
    education: 'Education',
    projects: 'Independent projects',
    projectsTitle: 'Five projects with case studies',
    academic: 'Academic project',
    academicTitle: 'Lotte World Busan visitor review mining',
    academicSub: 'Dong-A University team project · KH Coder, descriptive statistics',
    lookingFor: 'Looking for',
    note: (scope: string, city: string, visa: string) => `Open to ${scope}. Based in ${city}. Visa: ${visa}.`,
    cvEn: 'CV in English →',
    cvKo: '한국어 이력서',
    interests: 'Professional interests',
    languages: 'Languages',
  },

  contact: {
    title: 'Contact',
    line: 'Hiring for data science or machine learning? Email is the quickest way to reach me.',
    note: (city: string, country: string, visa: string, scope: string) =>
      `${city}, ${country} (KST, UTC+9) · Visa: ${visa}. Open to ${scope}. There is no contact form, so nothing you send is stored by this site.`,
    emailMe: 'Email me',
    cvEn: 'CV · English',
    cvKo: ['CV · ', '한국어'] as [string, string],
    personalSite: 'Personal website',
    soon: 'coming soon',
  },

  footer: {
    correspondence: 'Correspondence',
    profiles: 'Contact and profiles',
    index: 'Index',
    site: 'Site',
    links: { experience: 'Experience', work: 'Selected work', notes: 'Field notes', toolkit: 'Toolkit' },
    licence: 'Licence',
    licenceText: (year: string, name: string) =>
      [`Site code is released under the `, `. Text, case studies, images and the CV are © ${year} ${name}, all rights reserved.`] as [string, string],
    revised: 'Last revised',
    top: 'Back to top ↑',
  },

  rail: ['Opening', 'Experience', 'Work', 'Notes', 'Toolkit', 'About', 'Contact'],

  cs: {
    titleSuffix: 'Case study',
    all: 'All case studies',
    allWork: 'All work',
    crumb: (i: string) => `Case study ${i}`,
    details: 'Project details',
    onPage: 'On this page',
    contents: 'Contents',
    evidence: 'Repository and demo',
    stack: 'Stack',
    methods: 'Methods',
    more: 'More case studies',
    prev: '← Previous',
    next: 'Next →',
  },

  fig: { plate: 'Plate', fig: 'Fig.', table: 'Table.', built: 'Built', planned: 'Planned', data: 'View data table' },

  nf: {
    title: 'Not found',
    kicker: 'Error 404 · coordinates unknown',
    h1: 'Nothing here but sand.',
    lead: 'The page you were looking for has drifted. Try the selected work, or start from the top.',
    work: 'Selected work →',
    home: 'Home →',
  },
};

export type UI = typeof en;

const ko: UI = {
  skip: '본문으로 건너뛰기',
  newTab: ' (새 탭에서 열림)',
  ogAlt: (name, title) => `${name}, ${title}: 사막의 지평선 위 포트폴리오 첫 화면.`,
  knowsAbout: ['데이터 사이언스', '머신러닝', '통계 모델링', '수요 예측', '응용 AI', 'SQL', 'Python'],

  nav: {
    primary: '주 메뉴',
    home: (name) => `${name}, 홈`,
    links: { experience: '경력', work: '프로젝트', notes: '노트', toolkit: '툴킷', about: '소개', contact: '연락처' },
    cvEn: '영문 이력서 (PDF)',
    cvKo: ['', '국문 이력서', ' (PDF)'],
    dark: '다크 모드',
    menu: '메뉴',
    language: '언어',
    langNames: { en: 'English', ko: '한국어' },
    langShort: { en: 'EN', ko: '한국어' },
  },

  cv: {
    button: '이력서 다운로드',
    nav: '이력서',
    menu: '이력서 언어 선택',
    head: '언어 선택',
    pdf: 'PDF',
  },

  status: { Complete: '완료', Working: '진행 중', 'In development': '개발 중', Archived: '보관' },

  hero: {
    viewWork: '주요 프로젝트 보기',
    profiles: '프로필',
    github: 'GitHub 프로필',
    linkedin: 'LinkedIn 프로필',
    email: (h) => `이메일 ${h}`,
    open: (scope, city, country) => `${scope} 가능 · ${country} ${city} 거주`,
    portrait: (name) => `${name} 프로필 사진`,
    monogram: (name) => `${name}, 모노그램`,
    skills: '보유 기술',
  },

  xp: {
    title: '경력',
    dek: (total) => `경력 ${total}(백엔드 인턴십 별도): 백엔드 개발을 기반으로 데이터 사이언스와 머신러닝을 수행해 왔습니다.`,
    skillsUsed: '사용 기술',
  },

  work: {
    title: '주요 프로젝트',
    dek: '대표 프로젝트 DPEC를 포함한 주요 프로젝트 4개입니다. 프로젝트마다 문제, 데이터, 구현 방법, 수치가 보여주는 것, 그리고 한계를 담은 케이스 스터디가 있으며, 모든 수치는 출처가 되는 코드나 보고서로 연결됩니다.',
    alsoCv: '컴퓨터 비전 프로젝트',
    more: '기타 작업',
    repo: '저장소',
  },

  pf: {
    flagship: '대표 프로젝트',
    demonstrates: '보여주는 역량',
    part: '담당 역할',
    result: '결과',
    methods: '방법론',
    stack: '기술 스택',
    read: '케이스 스터디 보기',
  },

  notes: {
    title: '작업 노트',
    dek: '프로젝트에서 얻은 관찰 7가지입니다. 데이터나 테스트가 실제로 보여준 내용을 출처 파일과 함께 정리했습니다. 공식 아티클이 아닌 작업 노트입니다.',
    obs: '관찰',
    source: '출처: ',
  },

  tk: {
    title: '툴킷',
    dek: '페이지 상단의 기술 그룹을 각 기술이 쓰인 프로젝트와 직무에 연결하고, 분석한 오픈소스 프로젝트를 함께 정리했습니다.',
    demonstrated: '프로젝트와 실무로 입증한 기술',
    numbers: '프로젝트 번호:',
    job: '실무 (경력 참조)',
    chip: (index, title) => `${index} ${title}, 케이스 스터디`,
    usedAt: (job) => `${job}에서 사용, 경력 참조`,
    also: '그 밖의 보유 기술:',
    studied: '분석한 오픈소스',
  },

  about: {
    title: '소개',
    lead: (name) =>
      `부산에서 통계 모델링, 머신러닝, 데이터 엔지니어링을 아우르며 일하는 데이터 사이언티스트 · 응용 ML 엔지니어 ${name}입니다. 동아대학교에서 융합경영학을 전공했고, 통계학과 계량경제학을 공부하며 데이터 분야에 이끌렸습니다.`,
    body: (org) =>
      `백엔드 개발로 시작해 추스트의 두 회사에서 Python 도구, Django API, PostgreSQL 스키마를 만들었습니다. 이후 ${org}에서 3년간 데이터 사이언티스트 · 응용 ML 엔지니어로 일하며 PostgreSQL 웨어하우스, SKU 단위 수요 예측, Text-to-SQL 어시스턴트를 구축했습니다. 데이터 준비와 분석부터 모델링, 평가, 배포까지 문제 전체를 다룹니다. 재현 가능한 파이프라인, 데이터 품질 검사, 기준 모델과 비교해 고른 모델, 모델이 보지 못한 데이터에서의 평가가 제 방식입니다. 대표 프로젝트 DPEC는 공개 타이밍 데이터로 Formula 1 레이스 페이스를 예측하며, README의 모든 수치를 출처까지 추적할 수 있습니다.`,
    close: '말보다 결과물로 보여드립니다. 각 프로젝트의 코드, 테스트, 문서, 그리고 한계를 있는 그대로 공개합니다.',
    record: '이력',
    experience: '경력',
    roles: (n, total) => `경력 ${total}, 백엔드 개발에서 데이터 사이언스까지 (인턴십 포함 ${n}개 직무)`,
    education: '학력',
    projects: '개인 프로젝트',
    projectsTitle: '케이스 스터디를 갖춘 프로젝트 5개',
    academic: '학술 프로젝트',
    academicTitle: '롯데월드 부산 방문객 리뷰 마이닝',
    academicSub: '동아대학교 팀 프로젝트 · KH Coder, 기술 통계',
    lookingFor: '희망 직무',
    note: (scope, city, visa) => `${scope} 가능. ${city} 거주. 체류자격: ${visa}.`,
    cvEn: '영문 이력서 →',
    cvKo: '국문 이력서',
    interests: '관심 분야',
    languages: '어학',
  },

  contact: {
    title: '연락처',
    line: '데이터 사이언스·머신러닝 인재를 찾고 계신가요? 이메일로 연락 주시면 가장 빠르게 답변드리겠습니다.',
    note: (city, country, visa, scope) =>
      `${country} ${city} (KST, UTC+9) · 체류자격: ${visa}. ${scope} 가능. 문의 양식이 없으므로 이 사이트는 보내신 내용을 저장하지 않습니다.`,
    emailMe: '이메일 보내기',
    cvEn: '영문 이력서',
    cvKo: ['', '국문 이력서'],
    personalSite: '개인 웹사이트',
    soon: '준비 중',
  },

  footer: {
    correspondence: '연락',
    profiles: '연락처와 프로필',
    index: '목차',
    site: '사이트',
    links: { experience: '경력', work: '주요 프로젝트', notes: '작업 노트', toolkit: '툴킷' },
    licence: '라이선스',
    licenceText: (year, name) =>
      ['사이트 코드는 ', `로 공개합니다. 텍스트, 케이스 스터디, 이미지와 이력서의 저작권은 © ${year} ${name}에게 있으며 모든 권리를 보유합니다.`],
    revised: '최종 수정',
    top: '맨 위로 ↑',
  },

  rail: ['첫 화면', '경력', '프로젝트', '노트', '툴킷', '소개', '연락처'],

  cs: {
    titleSuffix: '케이스 스터디',
    all: '모든 케이스 스터디',
    allWork: '전체 프로젝트',
    crumb: (i) => `케이스 스터디 ${i}`,
    details: '프로젝트 정보',
    onPage: '이 페이지의 내용',
    contents: '목차',
    evidence: '저장소와 데모',
    stack: '기술 스택',
    methods: '방법론',
    more: '다른 케이스 스터디',
    prev: '← 이전',
    next: '다음 →',
  },

  fig: { plate: '도판', fig: '그림', table: '표', built: '구축 완료', planned: '계획', data: '데이터 표 보기' },

  nf: {
    title: '페이지를 찾을 수 없습니다',
    kicker: '오류 404 · 좌표 불명',
    h1: '모래뿐입니다.',
    lead: '찾으시는 페이지가 바람에 날아갔습니다. 주요 프로젝트를 보시거나 첫 화면부터 시작해 보세요.',
    work: '주요 프로젝트 →',
    home: '홈 →',
  },
};

export const ui: Record<Lang, UI> = { en, ko };
