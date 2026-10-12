import type { APIRoute } from 'astro';
import { projects, meta } from '../content/site';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const paths = ['', 'resume/', ...projects.map((p) => `work/${p.slug}/`)];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map((p) => `  <url><loc>${new URL(url(p), site).href}</loc><lastmod>${meta.updated}</lastmod></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
