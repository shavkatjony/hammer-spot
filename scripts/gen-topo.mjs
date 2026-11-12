// Generates src/assets/textures/topo.svg: nested, irregular contour rings that read as
// geological survey lines. Deterministic (seeded) so the artwork is stable between builds.
import { writeFileSync } from 'node:fs';

let seed = 20261012;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const W = 1600, H = 1000;
const hills = [
  { cx: 1180, cy: 330, rings: 14, base: 34, step: 27 },
  { cx: 300, cy: 760, rings: 11, base: 26, step: 30 },
  { cx: 820, cy: 1080, rings: 9, base: 60, step: 34 },
];

function ring(cx, cy, r, harmonics) {
  const pts = [];
  const n = 40;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    let rr = r;
    for (const h of harmonics) rr += h.a * r * Math.sin(h.k * t + h.p);
    pts.push([cx + rr * Math.cos(t) * 1.35, cy + rr * Math.sin(t)]);
  }
  // Catmull-Rom -> cubic Bezier, closed
  let d = `M${pts[0][0].toFixed(0)} ${pts[0][1].toFixed(0)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${p2[0].toFixed(0)} ${p2[1].toFixed(0)}`;
  }
  return d + 'Z';
}

let paths = '';
for (const h of hills) {
  const base = [
    { k: 2, a: 0.09, p: rand() * 6.28 },
    { k: 3, a: 0.06, p: rand() * 6.28 },
    { k: 5, a: 0.025, p: rand() * 6.28 },
  ];
  for (let i = 0; i < h.rings; i++) {
    const r = h.base + i * h.step;
    // harmonics drift slowly outward so rings are not concentric copies
    const hs = base.map((b) => ({ k: b.k, a: b.a * (1 + i * 0.05), p: b.p + i * 0.07 * (rand() - 0.3) }));
    const major = i % 5 === 4;
    paths += `<path d="${ring(h.cx, h.cy, r, hs)}"${major ? ' class="m"' : ''}/>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><style>path{fill:none;stroke:#7a6a52;stroke-width:1;vector-effect:non-scaling-stroke}.m{stroke-width:1.6}</style>${paths}</svg>`;
writeFileSync(new URL('../src/assets/textures/topo.svg', import.meta.url), svg);
console.log('topo.svg', svg.length, 'bytes');
