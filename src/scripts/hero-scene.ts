/**
 * Hero desert diorama (progressive enhancement).
 *
 * - Lazy-loaded only after the page is idle, and only when WebGL works and Save-Data is off.
 * - Renders on demand: during the intro, pointer easing, scroll changes and theme changes.
 *   On capable desktops a sparse dust layer animates at ~30 fps while the hero is visible.
 * - Stops rendering when the hero is off-screen or the tab is hidden.
 * - Shadow maps are recomputed only when the light moves.
 * - Quality adapts: lower geometry/DPR on touch, small or low-memory devices, and again
 *   if early frames are slow.
 * - Any failure leaves the static SVG scene underneath untouched.
 */
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';

export type Tier = 'high' | 'low';

export interface HeroSceneOptions {
  host: HTMLElement; // positioned container; the canvas fills it
  section: HTMLElement; // the hero section, for scroll progress + visibility
  tier: Tier;
  reducedMotion: boolean;
  playIntro: boolean;
  allowSoftware?: boolean;
}

export interface HeroSceneHandle {
  dispose(): void;
}

/* ------------------------------------------------------------------ */
/* Deterministic value noise                                           */
/* ------------------------------------------------------------------ */
function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
function noise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = smooth(xf), v = smooth(yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

/** Wind-shaped transverse dunes: gentle windward slope, steep slip face, varied crests. */
function duneHeight(x: number, z: number): number {
  const warp = noise(x * 0.011, z * 0.011) * 16 + noise(x * 0.035 + 7.3, z * 0.035 - 2.1) * 4;
  const u = (z * 0.86 - x * 0.42 + warp) / 24;
  const cell = Math.floor(u);
  const f = u - cell;
  const profile = f < 0.78 ? smooth(f / 0.78) : 1 - smooth((f - 0.78) / 0.22);
  const crest = 0.55 + 0.45 * (noise(cell * 1.7, x * 0.02) * 0.5 + 0.5);
  let h = profile * 4.6 * crest;
  h += noise(x * 0.018, z * 0.018) * 1.6;
  h += noise(x * 0.0045 + 3, z * 0.0045) * 5.5;
  return h;
}

function cssColor(el: HTMLElement, name: string, fallback: string): Color {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const c = new Color();
  try {
    c.setStyle(v || fallback);
  } catch {
    c.setStyle(fallback);
  }
  return c;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function createHeroScene(opts: HeroSceneOptions): HeroSceneHandle {
  const { host, section, tier, reducedMotion } = opts;
  const high = tier === 'high';
  // Low tier (touch, small or low-memory devices) gets one composed still frame: no intro dolly,
  // no pointer parallax, no scroll-driven re-rendering. Re-renders only on resize or theme change.
  const still = reducedMotion || !high;
  const playIntro = opts.playIntro && !still;
  const pointerFine = matchMedia('(pointer: fine)').matches && !still;

  /* ---------- renderer ---------- */
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: high ? 'high-performance' : 'low-power',
    failIfMajorPerformanceCaveat: !opts.allowSoftware,
  });
  const maxDpr = high ? 1.75 : 1.5;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');

  /* ---------- scene ---------- */
  const scene = new Scene();
  const sky = new Color();
  scene.background = sky;
  const fog = new Fog(sky, 40, 300);
  scene.fog = fog;

  const camera = new PerspectiveCamera(34, 1, 0.1, 420);

  // Terrain
  const seg = high ? 230 : 130;
  const size = 300;
  const terrainGeo = new PlaneGeometry(size, size, seg, seg);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, 0, -size / 2 + 42);
  const pos = terrainGeo.attributes.position as BufferAttribute;
  const heights = new Float32Array(pos.count);
  let minH = Infinity, maxH = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const h = duneHeight(pos.getX(i), pos.getZ(i));
    heights[i] = h;
    pos.setY(i, h);
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
  }
  terrainGeo.computeVertexNormals();
  const colors = new Float32Array(pos.count * 3);
  terrainGeo.setAttribute('color', new BufferAttribute(colors, 3));
  const terrainMat = new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  const terrain = new Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  scene.add(terrain);

  // Monolith + fragment: the scene's scale anchor
  const stoneMat = new MeshStandardMaterial({ roughness: 0.92, metalness: 0 });
  const monoGeo = new BoxGeometry(2.3, 22, 1.3, 2, 12, 2);
  const mp = monoGeo.attributes.position as BufferAttribute;
  for (let i = 0; i < mp.count; i++) {
    const y = mp.getY(i);
    // weathering: slight taper and irregular erosion of the edges
    const taper = 1 - (y + 11) / 22 * 0.12;
    mp.setX(i, mp.getX(i) * taper + noise(i * 0.37, y * 0.3) * 0.08);
    mp.setZ(i, mp.getZ(i) * taper + noise(y * 0.4, i * 0.21) * 0.06);
  }
  monoGeo.computeVertexNormals();
  const monolith = new Mesh(monoGeo, stoneMat);
  monolith.rotation.set(0.02, -0.5, -0.07);
  monolith.castShadow = true;
  scene.add(monolith);
  const fragGeo = new BoxGeometry(1.8, 4.2, 1.6);
  const fragment = new Mesh(fragGeo, stoneMat);
  fragment.rotation.set(0.32, 0.6, 0.42);
  fragment.castShadow = true;
  scene.add(fragment);

  // Sun disc (unfogged), sits behind the light direction
  const sunMat = new MeshBasicMaterial({ fog: false });
  const sun = new Mesh(new CircleGeometry(10, 48), sunMat);
  scene.add(sun);

  // Lights
  const hemi = new HemisphereLight(0xffffff, 0x000000, 0.6);
  scene.add(hemi);
  const key = new DirectionalLight(0xffffff, 2.7);
  key.castShadow = true;
  key.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024);
  const sc = key.shadow.camera;
  sc.left = -80;
  sc.right = 80;
  sc.top = 80;
  sc.bottom = -80;
  sc.near = 1;
  sc.far = 320;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.35;
  key.target.position.set(0, 0, -50);
  scene.add(key, key.target);

  // Dust: sparse and only on capable desktops
  let dust: Points | null = null;
  const dustCount = high && pointerFine ? 220 : 0;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSpeed = new Float32Array(dustCount);
  if (dustCount) {
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (hash(i, 1) - 0.5) * 70;
      dustPos[i * 3 + 1] = 0.6 + hash(i, 2) * 9;
      dustPos[i * 3 + 2] = -40 + hash(i, 3) * 62;
      dustSpeed[i] = 0.5 + hash(i, 4) * 1.1;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(dustPos, 3));
    dust = new Points(g, new PointsMaterial({ size: 0.075, transparent: true, opacity: 0.5, depthWrite: false }));
    scene.add(dust);
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    sky.copy(cssColor(section, '--scene-sky', '#e6d8bc'));
    fog.color.copy(sky);
    const sand = cssColor(section, '--scene-sand', '#d8bd90');
    const sandDark = cssColor(section, '--scene-sand-dark', '#b48f62');
    const tmp = new Color();
    for (let i = 0; i < pos.count; i++) {
      const t = clamp01((heights[i] - minH) / (maxH - minH));
      // crests a touch lighter, troughs a touch deeper; never a visible banding
      tmp.copy(sandDark).lerp(sand, 0.45 + t * 0.55);
      const j = noise(pos.getX(i) * 0.15, pos.getZ(i) * 0.15) * 0.025;
      colors[i * 3] = tmp.r + j;
      colors[i * 3 + 1] = tmp.g + j;
      colors[i * 3 + 2] = tmp.b + j;
    }
    (terrainGeo.attributes.color as BufferAttribute).needsUpdate = true;
    stoneMat.color.copy(cssColor(section, '--scene-stone', '#3b2f25'));
    sunMat.color.copy(cssColor(section, '--scene-sun', '#f4e6c6'));
    key.color.copy(cssColor(section, '--scene-light', '#ffd9a6'));
    hemi.color.copy(cssColor(section, '--scene-hemi-sky', '#f1e2c4'));
    hemi.groundColor.copy(cssColor(section, '--scene-hemi-ground', '#8c6a4b'));
    if (dust) (dust.material as PointsMaterial).color.copy(cssColor(section, '--scene-dust', '#f6ead2'));
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    key.intensity = dark ? 1.8 : 3.2;
    hemi.intensity = dark ? 0.45 : 0.72;
    renderer.toneMappingExposure = dark ? 0.95 : 1.02;
    renderer.shadowMap.needsUpdate = true;
    invalidate();
  }

  /* ---------- camera rig ---------- */
  const restPos = new Vector3(0, 6.4, 26);
  const restTarget = new Vector3(0, 6.9, -90);
  const introPos = new Vector3(-3, 14.5, 52);
  const introTarget = new Vector3(0, 2.5, -90);
  const camPos = new Vector3();
  const camTarget = new Vector3();
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scrollP = 0;
  let lastScrollP = -1;
  let introStart = -1;
  const INTRO_MS = 2600;

  // Composition depends on aspect: landscape keeps the monolith and sun in the empty sky on
  // the left (text sits right); portrait puts them low and right of centre, below the copy.
  const sunBase = new Vector3();
  let lightAz = -0.42;
  function layout(aspect: number) {
    const portrait = aspect < 0.8;
    const [x, z, sc] = portrait ? [9, -112, 0.5] : [-21, -104, 0.44];
    monolith.scale.setScalar(sc);
    monolith.position.set(x, duneHeight(x, z) + 9.4 * sc, z);
    fragment.scale.setScalar(sc * 1.4);
    fragment.position.set(x + 4, duneHeight(x + 4, z + 3) + 0.9 * sc, z + 3);
    if (portrait) sunBase.set(52, 13, -330);
    else sunBase.set(-126, 5, -330);
    // Key light rakes from the side the sun is on, lower and wider than the disc itself,
    // so the near dunes keep lit faces instead of sitting in full backlight.
    lightAz = portrait ? 0.85 : -0.78;
    restTarget.y = portrait ? 11.5 : 6.9;
    introTarget.y = portrait ? 7 : 2.5;
    lastScrollP = -1; // force light + shadow refresh
  }

  function placeSunAndLight(p: number) {
    // As the visitor scrolls, the sun sinks and the light rakes lower: longer shadows.
    const elev = 0.23 - p * 0.12;
    const dir = new Vector3(Math.sin(lightAz) * Math.cos(elev), Math.sin(elev), -Math.cos(lightAz) * Math.cos(elev));
    key.position.copy(key.target.position).addScaledVector(dir, 140);
    sun.position.set(sunBase.x, sunBase.y - p * 7, sunBase.z);
    sun.lookAt(camera.position);
    renderer.shadowMap.needsUpdate = true;
  }

  function updateCamera(now: number): boolean {
    let moving = false;
    let t = 1;
    if (introStart >= 0) {
      t = clamp01((now - introStart) / INTRO_MS);
      if (t < 1) moving = true;
      else introStart = -1;
    }
    const e = easeOutCubic(t);
    camPos.copy(introPos).lerp(restPos, e);
    camTarget.copy(introTarget).lerp(restTarget, e);

    // bounded pointer parallax (desktop only)
    if (pointerFine) {
      const k = 0.06;
      pointer.sx += (pointer.x - pointer.sx) * k;
      pointer.sy += (pointer.y - pointer.sy) * k;
      if (Math.abs(pointer.x - pointer.sx) > 0.0005 || Math.abs(pointer.y - pointer.sy) > 0.0005) moving = true;
      camPos.x += pointer.sx * 1.6;
      camPos.y += -pointer.sy * 0.45;
      camTarget.x += pointer.sx * 0.5;
    }

    // scroll: drift up slightly and lower the gaze toward the sand
    camPos.y += scrollP * 1.6;
    camTarget.y -= scrollP * 7;

    camera.position.copy(camPos);
    camera.lookAt(camTarget);
    return moving;
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the horizon composition stable on tall/narrow screens
    camera.fov = w / h < 0.8 ? 46 : w / h < 1.2 ? 40 : 34;
    camera.updateProjectionMatrix();
    layout(w / h);
    invalidate();
  }

  /* ---------- loop ---------- */
  let raf = 0;
  let running = false;
  let visible = true;
  let dirty = true;
  let lastTime = performance.now();
  let lastDust = 0;
  let frames = 0;
  let slowFrames = 0;
  let first = true;
  let ready = false; // set once shaders are compiled

  function invalidate() {
    dirty = true;
    start();
  }
  function start() {
    if (ready && !running && visible && !document.hidden) {
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    if (scrollP !== lastScrollP) {
      placeSunAndLight(scrollP);
      lastScrollP = scrollP;
      dirty = true;
    }
    let active = updateCamera(now);

    if (dust && !still) {
      const arr = dust.geometry.attributes.position as BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        let x = dustPos[i * 3] + dustSpeed[i] * dt;
        if (x > 35) x = -35;
        dustPos[i * 3] = x;
        dustPos[i * 3 + 1] += Math.sin(now * 0.0004 + i) * 0.002;
      }
      arr.needsUpdate = true;
      if (now - lastDust > 33) {
        lastDust = now;
        dirty = true;
      }
      active = true;
    }

    if (active || dirty) {
      const t0 = performance.now();
      renderer.render(scene, camera);
      dirty = false;
      if (first) {
        first = false;
        // First-frame budget: a device that needs > 250 ms for one frame keeps the static scene.
        if (performance.now() - t0 > 250) {
          dispose();
          return;
        }
        canvas.classList.add('is-ready');
      }
      // adaptive quality: watch the first frames
      if (frames < 50) {
        frames++;
        if (dt > 0.03 || performance.now() - t0 > 22) slowFrames++;
        if (frames === 50 && slowFrames > 20) degrade();
      }
    }

    if (active || dirty) raf = requestAnimationFrame(frame);
    else running = false;
  }

  function degrade() {
    dpr = 1;
    renderer.setPixelRatio(1);
    if (dust) {
      scene.remove(dust);
      dust.geometry.dispose();
      (dust.material as PointsMaterial).dispose();
      dust = null;
    }
    resize();
  }

  /* ---------- events ---------- */
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    start();
  };
  const onScroll = () => {
    if (still) return;
    const r = section.getBoundingClientRect();
    scrollP = clamp01(-r.top / Math.max(1, r.height));
    if (scrollP !== lastScrollP) start();
  };
  const onVisibility = () => (document.hidden ? stop() : invalidate());
  const onTheme = () => applyTheme();
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate();
    else stop();
  });
  const ro = new ResizeObserver(resize);
  const onLost = (e: Event) => {
    e.preventDefault();
    dispose();
  };

  if (pointerFine) window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('themechange', onTheme);
  canvas.addEventListener('webglcontextlost', onLost);
  io.observe(section);
  ro.observe(host);

  /* ---------- go ---------- */
  host.appendChild(canvas);
  applyTheme();
  resize();
  onScroll();
  placeSunAndLight(scrollP);
  lastScrollP = scrollP;
  updateCamera(performance.now());
  // Compile shaders off the critical path where KHR_parallel_shader_compile is available;
  // otherwise compile synchronously on the next idle moment (same cost the first render would pay).
  const compiled = renderer.extensions.has('KHR_parallel_shader_compile')
    ? renderer.compileAsync(scene, camera).catch(() => undefined)
    : new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          renderer.compile(scene, camera);
          resolve();
        }),
      );
  compiled.then(() => {
    if (disposed) return;
    ready = true;
    if (playIntro) introStart = performance.now();
    invalidate();
  });

  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('themechange', onTheme);
    io.disconnect();
    ro.disconnect();
    terrainGeo.dispose();
    terrainMat.dispose();
    monoGeo.dispose();
    fragGeo.dispose();
    stoneMat.dispose();
    sun.geometry.dispose();
    sunMat.dispose();
    if (dust) {
      dust.geometry.dispose();
      (dust.material as PointsMaterial).dispose();
    }
    renderer.dispose();
    canvas.remove(); // the static SVG scene underneath remains
  }

  return { dispose };
}
