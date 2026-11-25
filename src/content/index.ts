/**
 * Content for one language. English comes straight from site.ts; Korean is site.ts with the words
 * from ko.ts laid over it, so numbers, links and evidence are never duplicated.
 * Components call getContent(getLang(Astro.url)).
 */
import * as en from './site';
import * as ko from './ko';
import type { Lang } from '../lib/i18n';
import type { Project } from './site';

function check(ok: unknown, what: string): asserts ok {
  if (!ok) throw new Error(`src/content/ko.ts is out of sync with site.ts: ${what}`);
}
const same = (a: unknown[] | undefined, b: unknown[] | undefined, what: string) =>
  check((a?.length ?? 0) === (b?.length ?? 0), `${what} (${a?.length ?? 0} in English, ${b?.length ?? 0} in Korean)`);

const EN = {
  identity: { ...en.identity, nameLocal: '' },
  education: en.education as { school: string; place: string; degree: string; year: string; period: string; focus: string }[],
  experience: en.experience,
  languages: en.languages,
  targetRoles: en.targetRoles,
  interests: en.interests,
  skillGroups: en.skillGroups,
  projects: en.projects,
  moreWork: en.moreWork,
  archive: en.archive,
  notes: en.notes,
  toolkit: en.toolkit,
  meta: en.meta,
};
type Base = typeof EN;
export type Content = Base & { primaryProjects: Project[]; secondaryProjects: Project[] };

function project(p: Project): Project {
  const k = ko.projectsKo[p.slug];
  check(k, `no Korean text for project "${p.slug}"`);
  same(p.metrics, k.metrics, `${p.slug} metrics`);
  same(p.links, k.links, `${p.slug} links`);
  same(p.demonstrates, k.demonstrates, `${p.slug} demonstrates`);
  return {
    ...p,
    title: k.title,
    short: k.short,
    kicker: k.kicker,
    statusNote: p.statusNote ? k.statusNote ?? p.statusNote : undefined,
    demonstrates: k.demonstrates ?? p.demonstrates,
    problem: k.problem,
    contribution: k.contribution,
    result: k.result,
    metrics: p.metrics.map((m, i) => ({ ...m, label: k.metrics[i] })),
    methods: k.methods,
    links: p.links.map((l, i) => ({ ...l, label: k.links[i] })),
    privateNote: k.privateNote ?? p.privateNote,
    caseStudy: {
      summary: k.caseStudy.summary,
      sections: p.caseStudy.sections.map((s) => {
        const ks = k.caseStudy.sections[s.id];
        check(ks, `${p.slug} section "${s.id}"`);
        same(s.body, ks.body, `${p.slug} ${s.id} paragraphs`);
        same(s.list, ks.list, `${p.slug} ${s.id} list`);
        return { ...s, title: ks.title, body: ks.body, list: ks.list };
      }),
    },
  };
}

function korean(): Base {
  const k = ko.identityKo;
  same(en.archive, ko.archiveKo, 'archive');
  same(en.toolkit.studied, ko.studiedKo, 'open source studied');
  same(en.education, ko.educationKo, 'education');
  same(en.languages, ko.languagesKo, 'languages');
  return {
    identity: {
      ...en.identity,
      nameLocal: k.nameLocal,
      title: k.title,
      positioning: k.positioning,
      headline: k.headline,
      headlineEmphasis: k.headlineEmphasis,
      statement: k.statement,
      location: { ...en.identity.location, city: k.city, country: k.country },
      availability: { ...en.identity.availability, short: k.short, scope: k.scope },
      visaDetail: k.visaDetail,
      experienceTotal: k.experienceTotal,
    },
    education: en.education.map((e, i) => ({ ...e, ...ko.educationKo[i] })),
    experience: en.experience.map((x) => {
      const t = ko.experienceKo[x.org];
      check(t, `no Korean text for job "${x.org}"`);
      same(x.points, t.points, `${x.org} bullets`);
      return { ...x, ...t };
    }),
    languages: ko.languagesKo,
    targetRoles: ko.targetRolesKo,
    interests: ko.interestsKo,
    skillGroups: en.skillGroups.map((g) => ({
      ...g,
      title: ko.skillGroupTitlesKo[g.id] ?? g.title,
      skills: g.skills.map((s) => {
        if (s.note) check(ko.skillNotesKo[s.note], `skill note "${s.note}"`);
        return {
          ...s,
          name: ko.skillNamesKo[s.name] ?? s.name,
          note: s.note ? ko.skillNotesKo[s.note] : undefined,
          extra: s.extra ? { ...s.extra, label: ko.extraLabelsKo[s.extra.label] ?? s.extra.label } : undefined,
        };
      }),
    })),
    projects: en.projects.map(project),
    moreWork: { ...en.moreWork, ...ko.moreWorkKo },
    archive: en.archive.map((a, i) => {
      const t = ko.archiveKo[i];
      return {
        ...a,
        title: t.title,
        meta: t.meta,
        text: t.text,
        image: a.image ? { ...a.image, alt: t.alt ?? a.image.alt } : null,
        privateNote: a.privateNote ? t.privateNote ?? a.privateNote : a.privateNote,
      };
    }),
    notes: en.notes.map((n) => {
      const t = ko.notesKo[n.id];
      check(t, `no Korean text for note "${n.id}"`);
      return { ...n, ...t };
    }),
    toolkit: { studied: en.toolkit.studied.map((t, i) => ({ ...t, ...ko.studiedKo[i] })) },
    meta: { ...en.meta, ...ko.metaKo },
  };
}

const withTiers = (c: Base): Content => ({
  ...c,
  primaryProjects: c.projects.filter((p) => p.tier === 'primary'),
  secondaryProjects: c.projects.filter((p) => p.tier === 'secondary'),
});

const cache: Partial<Record<Lang, Content>> = {};
export function getContent(lang: Lang): Content {
  return (cache[lang] ??= withTiers(lang === 'ko' ? korean() : EN));
}

/* Language-independent values, re-exported for convenience. */
export { email, social, personalSite, resume, heroSkills, skillLabel } from './site';
export type { Project, SkillGroup, Skill, FigureId, Status, Job } from './site';
