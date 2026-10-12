/**
 * Build an internal URL that respects Astro's `base` (e.g. "/" or "/personalweb/").
 * Always use this for internal links and public assets; never hard-code "/".
 */
const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

export function url(path = ''): string {
  return BASE + path.replace(/^\/+/, '');
}

/** Allow only http(s) and mailto links to be rendered from content. */
export function safeHref(href: string): string {
  try {
    const u = new URL(href);
    if (u.protocol === 'https:' || u.protocol === 'http:' || u.protocol === 'mailto:') return u.href;
  } catch {
    /* fall through */
  }
  throw new Error(`Unsafe or invalid external URL in content: ${href}`);
}

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href);
}
