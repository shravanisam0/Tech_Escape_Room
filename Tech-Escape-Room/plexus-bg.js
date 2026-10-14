/**
 * plexus-bg.js — Interactive plexus / constellation network background
 * ────────────────────────────────────────────────────────────────────
 * Drop-in, framework-agnostic, single-file module.
 *
 * Usage:
 *   <script src="plexus-bg.js"></script>
 *
 *   Or as ES module:
 *     import { mountPlexus, unmountPlexus } from './plexus-bg.js';
 *     mountPlexus();            // starts
 *     unmountPlexus();          // tears down
 *
 * React / Next.js:
 *   useEffect(() => { mountPlexus(); return unmountPlexus; }, []);
 *
 * Vue (Options API):
 *   mounted() { mountPlexus(); }, beforeUnmount() { unmountPlexus(); }
 */

;(function (root, factory) {
  // UMD: works as <script>, CommonJS, or ES module
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    const api = factory();
    root.mountPlexus   = api.mountPlexus;
    root.unmountPlexus = api.unmountPlexus;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

/* ═══════════════════════════════════════════════════════════════════
   CONFIGURATION — tweak any value here
   ═══════════════════════════════════════════════════════════════════ */
const CFG = {
  // ── Nodes ──────────────────────────────────────────────────────
  nodeCountDesktop:   100,      // target count on large screens
  nodeCountMobile:    50,       // target count on narrow screens
  mobileBreakpoint:   640,      // px — below this use mobile count

  // ── Colors ─────────────────────────────────────────────────────
  bgColor:            '#010302',
  colorDim:           [15, 61, 30],    // #0f3d1e  — forest green (RGB)
  colorBright:        [124, 255, 107],  // #7CFF6B  — lime green  (RGB)
  colorRadiant:       [200, 255, 220],  // near-white green core

  // ── Connections ────────────────────────────────────────────────
  maxLinkDist:        170,      // px — max distance to draw a line
  lineWidthNear:      1.2,      // px — line width at z = 1
  lineWidthFar:       0.35,     // px — line width at z = 0
  lineAlphaMax:       0.45,     // line opacity at distance = 0
  lineAlphaMin:       0.0,      // line opacity at distance = maxLinkDist

  // ── Depth of field ─────────────────────────────────────────────
  nodeSizeNear:       3.0,      // px radius at z = 1 (nearest)
  nodeSizeFar:        0.8,      // px radius at z = 0 (farthest)
  glowRadiusNear:     14,       // px glow at z = 1
  glowRadiusFar:      3,        // px glow at z = 0
  glowAlphaNear:      0.55,
  glowAlphaFar:       0.08,

  // ── Drift ──────────────────────────────────────────────────────
  driftSpeed:         0.15,     // px/frame base speed
  driftWrap:          true,     // false → bounce; true → wrap at edges

  // ── Cursor radiance ────────────────────────────────────────────
  radianceRadius:     120,      // px — how close cursor must be to a node
  radianceTopN:       4,        // brighten closest N nodes (incl. nearest)
  radianceEaseIn:     0.12,     // lerp factor for brightening
  radianceEaseOut:    0.05,     // lerp factor for dimming back
  radianceGlowMult:   3.0,     // glow radius multiplier when radiant
  radianceSizeMult:   2.2,     // node size multiplier when radiant

  // ── Magnifying lens ────────────────────────────────────────────
  lensRadius:         180,      // px — radius of the fisheye effect
  lensMagnification:  0.55,     // 0..1 — how far nodes are pushed outward
  lensFollowFactor:   0.12,     // lerp speed of lens toward real cursor

  // ── Performance ────────────────────────────────────────────────
  spatialGridCellSize: 180,     // px — grid cell for neighbour lookup
};

/* ═══════════════════════════════════════════════════════════════════
   INTERNAL STATE
   ═══════════════════════════════════════════════════════════════════ */
let canvas, ctx;
let dpr = 1;
let W = 0, H = 0;              // CSS pixels
let nodes = [];
let running = false;
let rafId = null;
let reducedMotion = false;

// Cursor / touch
let cursorScreen  = { x: -9999, y: -9999 };  // real input position
let cursorSmooth  = { x: -9999, y: -9999 };  // lerped lens centre
let cursorActive  = false;                     // is pointer in window?
let cursorFade    = 0;                         // 0..1 easing for lens
const CURSOR_FADE_IN  = 0.08;
const CURSOR_FADE_OUT = 0.04;

// Spatial hash
let grid = {};
let gridCols = 0, gridRows = 0;

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

/** Hermite smoothstep */
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Linear interpolation */
function lerp(a, b, t) { return a + (b - a) * t; }

/** Distance² */
function dist2(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy;
}

/** RGB array + alpha → rgba string */
function rgba(c, a) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

/** Blend two RGB arrays by t ∈ [0,1] */
function lerpColor(a, b, t) {
  return [
    lerp(a[0], b[0], t) | 0,
    lerp(a[1], b[1], t) | 0,
    lerp(a[2], b[2], t) | 0,
  ];
}

/* ═══════════════════════════════════════════════════════════════════
   NODE FACTORY
   ═══════════════════════════════════════════════════════════════════ */
function createNode(x, y) {
  const z = Math.random();   // 0 = far, 1 = near
  const angle = Math.random() * Math.PI * 2;
  const speed = (0.3 + Math.random() * 0.7) * CFG.driftSpeed;
  return {
    x, y, z,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radiance: 0,              // 0..1 current glow multiplier
    // pre-computed per-z values (updated once)
    baseSize:  0,
    baseGlow:  0,
    baseAlpha: 0,
    baseColor: null,
    baseLineW: 0,
  };
}

function computeNodeDepth(n) {
  const z = n.z;
  n.baseSize  = lerp(CFG.nodeSizeFar,  CFG.nodeSizeNear,  z);
  n.baseGlow  = lerp(CFG.glowRadiusFar, CFG.glowRadiusNear, z);
  n.baseAlpha = lerp(CFG.glowAlphaFar, CFG.glowAlphaNear, z);
  n.baseColor = lerpColor(CFG.colorDim, CFG.colorBright, z);
  n.baseLineW = lerp(CFG.lineWidthFar, CFG.lineWidthNear, z);
}

function populateNodes() {
  const count = W < CFG.mobileBreakpoint
    ? CFG.nodeCountMobile
    : CFG.nodeCountDesktop;
  nodes = [];
  for (let i = 0; i < count; i++) {
    const n = createNode(Math.random() * W, Math.random() * H);
    computeNodeDepth(n);
    nodes.push(n);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SPATIAL HASH
   ═══════════════════════════════════════════════════════════════════ */
function buildGrid() {
  grid = {};
  const cell = CFG.spatialGridCellSize;
  gridCols = Math.ceil(W / cell) + 1;
  gridRows = Math.ceil(H / cell) + 1;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const cx = (n.x / cell) | 0;
    const cy = (n.y / cell) | 0;
    const key = cy * gridCols + cx;
    if (grid[key]) grid[key].push(i);
    else grid[key] = [i];
  }
}

function* neighbourIndices(nx, ny) {
  const cell = CFG.spatialGridCellSize;
  const cx = (nx / cell) | 0;
  const cy = (ny / cell) | 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const key = (cy + dy) * gridCols + (cx + dx);
      const bucket = grid[key];
      if (bucket) {
        for (let k = 0; k < bucket.length; k++) yield bucket[k];
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   LENS DISPLACEMENT
   ═══════════════════════════════════════════════════════════════════ */
function applyLens(px, py) {
  if (cursorFade < 0.001) return { x: px, y: py };
  const dx = px - cursorSmooth.x;
  const dy = py - cursorSmooth.y;
  const d  = Math.sqrt(dx * dx + dy * dy);
  const r  = CFG.lensRadius;
  if (d >= r || d < 0.01) return { x: px, y: py };

  // smoothstep falloff: full magnification at centre, zero at edge
  const strength = smoothstep(r, 0, d) * CFG.lensMagnification * cursorFade;
  const push = strength * (r - d);    // displacement magnitude
  const nx = dx / d, ny = dy / d;     // unit vector away from cursor
  return {
    x: px + nx * push,
    y: py + ny * push,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   UPDATE
   ═══════════════════════════════════════════════════════════════════ */
function update() {
  // ── Cursor smoothing & fade ───────────────────────────────────
  if (cursorActive) {
    cursorSmooth.x = lerp(cursorSmooth.x, cursorScreen.x, CFG.lensFollowFactor);
    cursorSmooth.y = lerp(cursorSmooth.y, cursorScreen.y, CFG.lensFollowFactor);
    cursorFade = lerp(cursorFade, 1, CURSOR_FADE_IN);
  } else {
    cursorFade = lerp(cursorFade, 0, CURSOR_FADE_OUT);
  }

  // ── Drift ─────────────────────────────────────────────────────
  if (!reducedMotion) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (CFG.driftWrap) {
        if (n.x < -20) n.x += W + 40;
        else if (n.x > W + 20) n.x -= W + 40;
        if (n.y < -20) n.y += H + 40;
        else if (n.y > H + 20) n.y -= H + 40;
      } else {
        if (n.x < 0 || n.x > W) n.vx = -n.vx;
        if (n.y < 0 || n.y > H) n.vy = -n.vy;
        n.x = Math.max(0, Math.min(W, n.x));
        n.y = Math.max(0, Math.min(H, n.y));
      }
    }
  }

  // ── Radiance — find closest nodes to cursor ───────────────────
  // First decay all
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].radiance = lerp(nodes[i].radiance, 0, CFG.radianceEaseOut);
  }

  if (cursorActive && cursorFade > 0.01) {
    // Collect candidates within radiance radius
    const rr = CFG.radianceRadius * CFG.radianceRadius;
    const candidates = [];  // {idx, d2}
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const d2val = dist2(n.x, n.y, cursorScreen.x, cursorScreen.y);
      if (d2val < rr) {
        candidates.push({ idx: i, d2: d2val });
      }
    }
    // Sort by distance, pick topN
    candidates.sort((a, b) => a.d2 - b.d2);
    const topN = Math.min(CFG.radianceTopN, candidates.length);
    for (let k = 0; k < topN; k++) {
      const n = nodes[candidates[k].idx];
      const closeness = 1 - Math.sqrt(candidates[k].d2) / CFG.radianceRadius;
      const target = closeness * (1 - k * 0.2);  // nearest → strongest
      n.radiance = lerp(n.radiance, Math.max(target, 0), CFG.radianceEaseIn);
    }
  }

  buildGrid();
}

/* ═══════════════════════════════════════════════════════════════════
   DRAW
   ═══════════════════════════════════════════════════════════════════ */
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const maxD2 = CFG.maxLinkDist * CFG.maxLinkDist;

  // Pre-compute lens-displaced positions
  const lx = new Float64Array(nodes.length);
  const ly = new Float64Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    const p = applyLens(nodes[i].x, nodes[i].y);
    lx[i] = p.x;
    ly[i] = p.y;
  }

  // ── Lines ─────────────────────────────────────────────────────
  const drawn = new Set();
  for (let i = 0; i < nodes.length; i++) {
    const ni = nodes[i];
    for (const j of neighbourIndices(ni.x, ni.y)) {
      if (j <= i) continue;
      const key = i * nodes.length + j;
      if (drawn.has(key)) continue;
      drawn.add(key);

      const nj = nodes[j];
      const d2val = dist2(ni.x, ni.y, nj.x, nj.y);
      if (d2val > maxD2) continue;

      const d = Math.sqrt(d2val);
      const distFade = 1 - d / CFG.maxLinkDist;
      const avgZ = (ni.z + nj.z) * 0.5;
      const avgRad = Math.max(ni.radiance, nj.radiance);

      let alpha = lerp(CFG.lineAlphaMin, CFG.lineAlphaMax, distFade) * (0.3 + avgZ * 0.7);
      alpha += avgRad * 0.5;
      alpha = Math.min(alpha, 0.85);

      const lineW = lerp(CFG.lineWidthFar, CFG.lineWidthNear, avgZ) + avgRad * 1.5;

      const col = lerpColor(
        lerpColor(CFG.colorDim, CFG.colorBright, avgZ),
        CFG.colorRadiant,
        avgRad * 0.6
      );

      ctx.beginPath();
      ctx.moveTo(lx[i], ly[i]);
      ctx.lineTo(lx[j], ly[j]);
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = lineW;
      ctx.stroke();
    }
  }

  // ── Nodes ─────────────────────────────────────────────────────
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const px = lx[i], py = ly[i];
    const rad = n.radiance;

    const sizeMult = 1 + rad * (CFG.radianceSizeMult - 1);
    const r = n.baseSize * sizeMult;

    // Glow halo
    const glowR = n.baseGlow * (1 + rad * (CFG.radianceGlowMult - 1));
    const glowAlpha = n.baseAlpha + rad * 0.6;
    const glowCol = lerpColor(n.baseColor, CFG.colorRadiant, rad * 0.7);

    if (glowR > 1) {
      const grad = ctx.createRadialGradient(px, py, r * 0.5, px, py, glowR);
      grad.addColorStop(0, rgba(glowCol, glowAlpha));
      grad.addColorStop(1, rgba(glowCol, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core dot
    const coreCol = lerpColor(n.baseColor, CFG.colorRadiant, rad);
    ctx.fillStyle = rgba(coreCol, 0.7 + n.z * 0.3 + rad * 0.3);
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION LOOP
   ═══════════════════════════════════════════════════════════════════ */
function tick() {
  if (!running) return;
  update();
  draw();
  rafId = requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════════════════
   RESIZE
   ═══════════════════════════════════════════════════════════════════ */
function resize() {
  dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  populateNodes();
  buildGrid();
}

/* ═══════════════════════════════════════════════════════════════════
   EVENT HANDLERS
   ═══════════════════════════════════════════════════════════════════ */
function onMouseMove(e) {
  cursorScreen.x = e.clientX;
  cursorScreen.y = e.clientY;
  cursorActive = true;
}
function onMouseLeave() {
  cursorActive = false;
}
function onTouchStart(e) {
  if (e.touches.length > 0) {
    cursorScreen.x = e.touches[0].clientX;
    cursorScreen.y = e.touches[0].clientY;
    cursorActive = true;
  }
}
function onTouchMove(e) {
  if (e.touches.length > 0) {
    cursorScreen.x = e.touches[0].clientX;
    cursorScreen.y = e.touches[0].clientY;
    cursorActive = true;
  }
}
function onTouchEnd() {
  cursorActive = false;
}
function onVisibilityChange() {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  } else if (running) {
    rafId = requestAnimationFrame(tick);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════════ */
function mountPlexus(containerEl) {
  if (canvas) return;   // already mounted

  // Detect prefers-reduced-motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion = mq.matches;
  mq.addEventListener('change', (e) => { reducedMotion = e.matches; });

  // Create canvas
  canvas = document.createElement('canvas');
  canvas.id = 'plexus-bg';
  Object.assign(canvas.style, {
    position: 'fixed',
    top:      '0',
    left:     '0',
    width:    '100%',
    height:   '100%',
    zIndex:   '-1',
    pointerEvents: 'none',
    background: CFG.bgColor,
  });

  const target = containerEl || document.body;
  target.prepend(canvas);
  ctx = canvas.getContext('2d');

  // Size + populate
  resize();

  // Events
  window.addEventListener('resize',  resize);
  window.addEventListener('mousemove',  onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove',  onTouchMove,  { passive: true });
  window.addEventListener('touchend',   onTouchEnd);
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Start loop
  running = true;
  rafId = requestAnimationFrame(tick);
}

function unmountPlexus() {
  running = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

  window.removeEventListener('resize', resize);
  window.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseleave', onMouseLeave);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  document.removeEventListener('visibilitychange', onVisibilityChange);

  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  canvas = null;
  ctx = null;
  nodes = [];
}

/* ═══════════════════════════════════════════════════════════════════
   AUTO-MOUNT (when loaded as a plain <script>)
   ═══════════════════════════════════════════════════════════════════ */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountPlexus());
  } else {
    mountPlexus();
  }
}

return { mountPlexus, unmountPlexus };

});
