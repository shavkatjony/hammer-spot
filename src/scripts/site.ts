/**
 * Site-wide behaviour. Everything here is progressive: the site is fully readable
 * and navigable without it.
 */
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- theme toggle ---------- */
function initTheme() {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!btn) return;
  const sync = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    const meta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    meta.forEach((m) => (m.content = dark ? '#1d1915' : '#eae1cf'));
  };
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
    sync();
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
  sync();
}

/* ---------- navigation ---------- */
function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!nav) return;

  // solid background once the page has scrolled
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !menu) return;
  const close = (focusToggle = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    if (focusToggle) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    if (open) menu.querySelector<HTMLAnchorElement>('a')?.focus();
  });
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close(true);
  });
  // close if the layout grows past the mobile breakpoint
  matchMedia('(min-width: 52.01rem)').addEventListener('change', (m) => m.matches && close());
}

/* ---------- reveals ---------- */
function initReveals() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    root.classList.add('reveal-ready');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
  root.classList.add('reveal-ready');
}

/* ---------- low-rate parallax for marked images ---------- */
function initParallax() {
  if (reduceMotion.matches || !matchMedia('(pointer: fine)').matches) return;
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!items.length) return;
  const rate = parseFloat(getComputedStyle(root).getPropertyValue('--parallax')) || 0.06;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const offset = (r.top + r.height / 2 - vh / 2) * -rate;
      el.style.setProperty('translate', `0 ${offset.toFixed(1)}px`);
    }
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ---------- sun rail ---------- */
function initSunRail() {
  const rail = document.querySelector<HTMLElement>('[data-sun-rail]');
  const sun = rail?.querySelector<HTMLElement>('[data-sun]');
  if (!rail || !sun) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const h = rail.clientHeight - 11;
    sun.style.transform = `translateY(${(p * h).toFixed(1)}px)`;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ---------- hero 3D scene (lazy, guarded) ---------- */
function canUseWebGL(allowSoftware: boolean): boolean {
  try {
    const c = document.createElement('canvas');
    const attrs = { failIfMajorPerformanceCaveat: !allowSoftware };
    const gl = (c.getContext('webgl2', attrs) || c.getContext('webgl', attrs)) as WebGLRenderingContext | null;
    if (!gl) return false;
    // Software rasterisers (SwiftShader, llvmpipe) can't run the scene smoothly: keep the static desert.
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // release the probe context
    if (!allowSoftware && /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer)) return false;
    return true;
  } catch {
    return false;
  }
}

function deviceTier(): 'high' | 'low' {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 760;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 8;
  return coarse || small || cores <= 4 || mem <= 4 ? 'low' : 'high';
}

function initHeroScene() {
  const host = document.querySelector<HTMLElement>('[data-hero-scene]');
  const section = document.querySelector<HTMLElement>('[data-hero]');
  if (!host || !section) return;

  const params = new URLSearchParams(location.search);
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  // ?static forces the SVG scene; ?3d=force allows software GL (used for headless testing)
  const allowSoftware = params.get('3d') === 'force';
  if (params.has('static') || conn?.saveData || !canUseWebGL(allowSoftware)) return;

  const playIntro = !root.classList.contains('intro-seen');
  const run = () =>
    import('./hero-scene')
      .then(({ createHeroScene }) => {
        const handle = createHeroScene({
          host,
          section,
          tier: deviceTier(),
          reducedMotion: reduceMotion.matches,
          playIntro,
          allowSoftware,
        });
        window.addEventListener('pagehide', (e) => {
          if (!e.persisted) handle.dispose();
        });
      })
      .catch(() => {
        /* WebGL unavailable or too slow: the static scene stays. */
      });

  const idle = (fn: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 250);
  if (document.readyState === 'complete') idle(run);
  else window.addEventListener('load', () => idle(run), { once: true });
}

/* ---------- intro: only once per session ---------- */
function markIntroSeen() {
  if (!document.querySelector('[data-hero]')) return;
  setTimeout(() => {
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* ignore */
    }
  }, 1500);
}

initTheme();
initNav();
initReveals();
initParallax();
initSunRail();
initHeroScene();
markIntroSeen();
