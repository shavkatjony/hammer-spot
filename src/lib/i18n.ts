/**
 * Two languages: English at the site root, Korean under /ko/.
 * Every component reads the language from the page URL, so one component serves both.
 */
import { url } from './url';

export type Lang = 'en' | 'ko';
export const LANGS: Lang[] = ['en', 'ko'];

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

/** The path after the site base, without a leading slash: "", "work/telco-churn/", "ko/", "ko/work/…". */
function rest(u: URL): string {
  const p = u.pathname;
  return (p.startsWith(BASE) ? p.slice(BASE.length) : p.replace(/^\/+/, '')).replace(/^\/+/, '');
}

export function getLang(u: URL): Lang {
  const r = rest(u);
  return r === 'ko' || r.startsWith('ko/') ? 'ko' : 'en';
}

/** Internal page link in a given language: lurl('ko', '#work') -> "/ko/#work". Assets use url() instead. */
export function lurl(lang: Lang, path = ''): string {
  return url((lang === 'ko' ? 'ko/' : '') + path.replace(/^\/+/, ''));
}

/** The same page in the other language (the 404 page points at the home page). */
export function altHref(u: URL, to: Lang): string {
  let r = rest(u);
  if (r === 'ko' || r.startsWith('ko/')) r = r.replace(/^ko\/?/, '');
  if (r.startsWith('404')) r = '';
  return lurl(to, r);
}

/** BCP 47 tags for <html lang> and hreflang. */
export const htmlLang: Record<Lang, string> = { en: 'en', ko: 'ko' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', ko: 'ko_KR' };
