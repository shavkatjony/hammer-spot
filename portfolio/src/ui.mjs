/**
 * Building blocks for the portfolio pages: language pick, components, HTML charts, diagrams, cover art.
 * All copy is authored in this repository (trusted); values from outside are escaped with esc().
 */

export const ctx = { lang: 'en' };

/** Pick the current language from { en, ko } (a plain string is used as is). */
export const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[ctx.lang] ?? v.en : v);

export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const join = (xs, sep = '') => xs.filter(Boolean).join(sep);

/* ------------------------------------------------------------------ text pieces */

export const eyebrow = (no, text) =>
  `<p class="eyebrow">${no ? `<span class="eyebrow__no">§ ${no}</span>` : ''}<span>${L(text)}</span></p>`;

/** Page head: eyebrow, action title (the page's takeaway), optional dek. `level` 1 for section openers. */
export function head({ no, eyebrow: eb, title, dek, level = 2, id }) {
  const h = `h${level}`;
  return `<header class="phead">${eb ? eyebrow(no, eb) : ''}<${h} class="title"${id ? ` id="${id}"` : ''}>${L(title)}</${h}>${
    dek ? `<p class="dek">${L(dek)}</p>` : ''
  }</header>`;
}

export const label = (t, cls = '') => `<p class="label ${cls}">${L(t)}</p>`;

export function stat(v, l, { src, size = '', cls = '' } = {}) {
  return `<div class="stat ${size ? `stat--${size}` : ''} ${cls}"><div class="stat__v">${L(v)}</div><div class="stat__l">${L(l)}</div>${
    src ? `<div class="stat__src">${L(src)}</div>` : ''
  }</div>`;
}

export function decision({ k, t, why, cls = '' }) {
  return `<div class="decision ${cls}"><p class="decision__k">${L(k)}</p><p class="decision__t">${L(t)}</p>${
    why ? (Array.isArray(why) ? why : [why]).map((w) => `<p>${L(w)}</p>`).join('') : ''
  }</div>`;
}

/** A framed screenshot or chart from the project ("plate"). height in mm (null = natural). */
export function plate({ src, alt, no, caption, height, contain = false, position, cls = '' }) {
  const style = height ? `height:${height}mm` : '';
  const pos = position ? ` style="object-position:${position}"` : '';
  return `<figure class="plate ${cls}"><div class="plate__frame ${contain ? 'plate__frame--contain' : ''}" style="${style}"><img src="${src}" alt="${esc(
    L(alt),
  )}"${pos}></div>${
    caption ? `<figcaption>${no ? `<span class="plate__no">${L({ en: 'Plate', ko: '도판' })} ${no}</span>` : ''}<span>${L(caption)}</span></figcaption>` : ''
  }</figure>`;
}

export const chips = (xs, cls = '') => `<div class="chips ${cls}">${xs.map((x) => `<span class="chip">${L(x)}</span>`).join('')}</div>`;

export function meta(rows) {
  return `<dl class="meta">${rows.map(([k, v]) => `<dt>${L(k)}</dt><dd>${L(v)}</dd>`).join('')}</dl>`;
}

export function links(items) {
  return `<p class="links">${items.map(([t, href]) => `<a href="${href}">${L(t)}</a>`).join('')}</p>`;
}

export const badge = (kind, text) => `<span class="badge badge--${kind}">${L(text)}</span>`;

export const PUBLIC = { en: 'Public repository', ko: '공개 저장소' };
export const REPORTED = { en: 'Reported outcome', ko: '실무 성과 (본인 기재)' };

export function callout(k, body, cls = '') {
  return `<div class="callout ${cls}"><p class="callout__k">${L(k)}</p><div class="mt-s">${L(body)}</div></div>`;
}

export const list = (xs, cls = '') => `<ul class="list ${cls}">${xs.map((x) => `<li>${L(x)}</li>`).join('')}</ul>`;

/* ------------------------------------------------------------------ charts (HTML, print-safe) */

/**
 * Horizontal bars, one series: the row the story is about is highlighted, the rest are context.
 * rows: [{ label, sub?, value, display, hi }]; ticks: values on the scale, placed where they belong.
 */
export function bars(rows, { max, labelW = 44, ticks, fmt = (v) => String(v) } = {}) {
  const m = max ?? Math.max(...rows.map((r) => r.value));
  const frac = (v) => Math.max(0, Math.min(1, v / m));
  const body = rows
    .map((r) => {
      const w = Math.max(0.005, frac(r.value));
      return `<div class="bars__label${r.hi ? ' bars__row-hi' : ''}">${L(r.label)}${r.sub ? `<small>${L(r.sub)}</small>` : ''}</div>
      <div class="bars__track${r.hi ? ' bars__row-hi' : ''}"><span class="bars__bar" style="width:calc((100% - 15mm) * ${w.toFixed(4)})"></span><span class="bars__v">${L(
        r.display ?? String(r.value),
      )}</span></div>`;
    })
    .join('');
  const axis = ticks
    ? `<div class="bars__axis">${ticks.map((t) => `<span style="left:${(frac(t) * 100).toFixed(2)}%">${fmt(t)}</span>`).join('')}</div>`
    : '';
  return `<div class="bars" style="--label-w:${labelW}mm">${body}${axis}</div>`;
}

/**
 * Two measures for the same rows, side by side: one label column, then one bar column per measure,
 * each with its own scale. rows: [{ label, hi, a: { value, display }, b: { value, display } }]
 */
export function pairBars(rows, cols, { labelW = 32 } = {}) {
  const track = (c, v) => {
    const f = Math.max(0.005, Math.min(1, v.value / c.max));
    return `<span class="bars__bar" style="width:calc((100% - 15mm) * ${f.toFixed(4)})"></span><span class="bars__v">${L(v.display ?? String(v.value))}</span>`;
  };
  const head = `<span></span>${cols.map((c) => `<p class="chart-t" style="margin:0">${L(c.title)}</p>`).join('')}`;
  const body = rows
    .map(
      (r) => `<div class="bars__label${r.hi ? ' bars__row-hi' : ''}">${L(r.label)}</div>${[r.a, r.b]
        .map((v, i) => `<div class="bars__track${r.hi ? ' bars__row-hi' : ''}">${track(cols[i], v)}</div>`)
        .join('')}`,
    )
    .join('');
  const axes = `<span></span>${cols
    .map(
      (c) =>
        `<div class="bars__axis" style="grid-column:auto">${(c.ticks ?? [])
          .map((t) => `<span style="left:${((t / c.max) * 100).toFixed(2)}%">${(c.fmt ?? String)(t)}</span>`)
          .join('')}</div>`,
    )
    .join('')}`;
  return `<div class="bars" style="grid-template-columns:${labelW}mm 1fr 1fr;column-gap:5mm">${head}${body}${axes}</div>`;
}

/** One value per row on a shared percentage scale, with a target line across the rows. */
export function dotrows(rows, { min, max, target, ticks, labelW = 30 }) {
  const pos = (v) => `${(((v - min) / (max - min)) * 100).toFixed(2)}%`;
  const body = rows
    .map(
      (r) => `<div class="dotrows__label">${L(r.label)}</div><div class="dotrows__track">
        <span class="dotrows__target" style="left:${pos(target)}"></span>
        <span class="dotrows__dot" style="left:${pos(r.v)}"></span>
        <span class="dotrows__v" style="left:${pos(r.v)}">${r.v}%</span></div>`,
    )
    .join('');
  const axis = `<div class="dotrows__axis">${ticks.map((t) => `<span style="left:${pos(t)}">${t}%</span>`).join('')}</div>`;
  return `<div class="dotrows" style="--label-w:${labelW}mm">${body}<span></span>${axis}</div>`;
}

/** One whole split into parts (tall segmented bar), labels inside when they fit. */
export function segbar(parts, { total } = {}) {
  const t = total ?? parts.reduce((s, p) => s + p.n, 0);
  const seg = parts
    .map((p) => `<span style="flex:${p.n} 1 0;background:${p.color}">${p.n}</span>`)
    .join('');
  const legend = parts.map((p) => `<span><i style="background:${p.color}"></i>${L(p.label)} · ${p.n}</span>`).join('');
  return `<div class="seg" role="img" aria-label="${t}">${seg}</div><div class="seg-legend">${legend}</div>`;
}

/** Values on a percentage scale against a target line (e.g. coverage of 80% ranges). */
export function dotscale(items, { min, max, target, targetLabel }) {
  const pos = (v) => `${(((v - min) / (max - min)) * 100).toFixed(2)}%`;
  const ticks = [];
  for (let v = min; v <= max; v += 5) ticks.push(`<span>${v}%</span>`);
  return `<div class="dotscale"><div class="dotscale__line"></div>
    <div class="dotscale__target" style="left:${pos(target)}"><span>${L(targetLabel)}</span></div>
    ${items.map((it) => `<div class="dotscale__dot" style="left:${pos(it.v)}"><span>${L(it.label)}</span></div>`).join('')}
    <div class="dotscale__ticks">${ticks.join('')}</div></div>`;
}

/* ------------------------------------------------------------------ diagrams */

const ARROW = `<svg viewBox="0 0 16 12" aria-hidden="true"><path d="M1 6h12M9 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const arrow = (dir = 'right') => `<span class="arrow${dir === 'down' ? ' arrow--down' : ''}">${ARROW}</span>`;

/** A node: title, sub text, optional mono metric line. */
export function node({ t, s, m, cls = '' }) {
  return `<div class="node ${cls}"><p class="node__t">${L(t)}</p>${s ? `<p class="node__s">${L(s)}</p>` : ''}${
    m ? `<p class="node__m">${L(m)}</p>` : ''
  }</div>`;
}

/** Nodes in a row with arrows between them. */
export function flow(nodes, { gap } = {}) {
  return `<div class="flow"${gap ? ` style="gap:${gap}"` : ''}>${nodes.map((n) => (typeof n === 'string' ? n : node(n))).join(arrow())}</div>`;
}

/* ------------------------------------------------------------------ cover art: the website's static desert */

/**
 * The same seeded dune generator as the website's static hero (src/components/DuneFallback.astro),
 * so the cover shows the site's own landscape.
 */
export function dunes({ colors, sun = '#dba12c', sunAt = [980, 134], sunR = 30 } = {}) {
  const W = 1600;
  const H = 440;
  let seed = 4242;
  const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const layers = [
    { base: 148, amp: 18, min: 260, max: 420, cls: 'far' },
    { base: 206, amp: 34, min: 340, max: 560, cls: 'mid' },
    { base: 282, amp: 58, min: 420, max: 700, cls: 'near' },
    { base: 380, amp: 82, min: 560, max: 900, cls: 'front' },
  ];
  const f = (n) => n.toFixed(1);
  const c = { far: '#d9d6d1', mid: '#dccbb4', near: '#cdb196', front: '#b8957b', ridge: '#7d6a5c', ...colors };
  const out = layers.map((l) => {
    const pts = [];
    let x = -160 - rnd() * 140;
    let crest = false;
    while (x < W + 260) {
      const span = l.min + rnd() * (l.max - l.min);
      if (crest) {
        x += span * 0.34;
        pts.push({ x, y: l.base + rnd() * 6 });
      } else {
        x += span * 0.66;
        pts.push({ x, y: l.base - l.amp * (0.5 + rnd() * 0.5) });
      }
      crest = !crest;
    }
    let ridge = `M-220 ${f(l.base)} `;
    let prev = { x: -220, y: l.base };
    for (const p of pts) {
      const rising = p.y < prev.y;
      const c1x = prev.x + (p.x - prev.x) * (rising ? 0.45 : 0.18);
      const c1y = rising ? prev.y : prev.y + (p.y - prev.y) * 0.1;
      const c2x = prev.x + (p.x - prev.x) * (rising ? 0.8 : 0.55);
      ridge += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(p.y)} ${f(p.x)} ${f(p.y)} `;
      prev = p;
    }
    const fill = `${ridge}L${W + 260} ${H + 40} L-220 ${H + 40} Z`;
    return { fill, ridge, cls: l.cls };
  });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <circle cx="${sunAt[0]}" cy="${sunAt[1]}" r="${sunR}" fill="${sun}"/>
    ${out
      .map(
        (b) =>
          `<path d="${b.fill}" fill="${c[b.cls]}"/><path d="${b.ridge}" fill="none" stroke="${c.ridge}" stroke-width="1.1" opacity="${
            b.cls === 'front' ? 0.7 : 0.45
          }"/>`,
      )
      .join('')}
  </svg>`;
}
