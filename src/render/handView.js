// @ts-check
/**
 * Flat "codex" drawing of a hand from 21 landmarks: palm shape plus five finger
 * strokes, each with a constant ink contour around a flat fill (DESIGN.md, "The hand drawing").
 */

/** @typedef {import('../core/index.js').Vec3} Vec3 */
/** @typedef {'thumb'|'index'|'middle'|'ring'|'pinky'} FingerName */
/** @typedef {{fingers?: Partial<Record<FingerName, boolean>>, aspect?: number}} HandState */
/** @typedef {{x:number, y:number, d:number}} P3   screen px, y down, d toward the viewer */

/** @type {FingerName[]} */
const FINGER_ORDER = ['thumb', 'index', 'middle', 'ring', 'pinky'];

/** @type {Record<FingerName, number[]>} */
const CHAINS = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

// Radius at each joint of the chain, in palm lengths. About 0.2 palm wide, narrowing toward the tip.
/** @type {Record<FingerName, number[]>} */
const RADII = {
  thumb: [0.13, 0.118, 0.106, 0.094],
  index: [0.104, 0.097, 0.09, 0.083],
  middle: [0.108, 0.1, 0.093, 0.085],
  ring: [0.1, 0.094, 0.087, 0.08],
  pinky: [0.09, 0.084, 0.078, 0.072],
};

const PALM_ROUND = 0.085;
const PALM_HALF_THICK = 0.07;
const FOREARM_LEN = 0.62;
const FOREARM_HALF_W = 0.29;
const COPLANAR = 0.1;

/** @typedef {{ink:string, bone:string, fillOk:string, red:string, ochre:string}} Palette */
/** @type {Palette|null} */
let palette = null;

/** Read once: the canvas cannot use CSS variables directly. */
function getPalette() {
  if (palette) return palette;
  const cs = getComputedStyle(document.documentElement);
  /** @param {string} name @param {string} fallback */
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  palette = {
    ink: v('--ink', '#1E1916'),
    bone: v('--bone', '#FBF6EA'),
    fillOk: v('--turquoise-fill', '#3FA9A6'),
    red: v('--red', '#A3271F'),
    ochre: v('--ochre', '#D39A2C'),
  };
  return palette;
}

/* ---------- small vector helpers on P3 ---------- */

/** @param {P3} a @param {P3} b @returns {P3} */
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, d: a.d - b.d });
/** @param {P3} a @param {P3} b @returns {P3} */
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, d: a.d + b.d });
/** @param {P3} a @param {number} s @returns {P3} */
const mul = (a, s) => ({ x: a.x * s, y: a.y * s, d: a.d * s });
/** @param {P3} a @param {P3} b */
const dot = (a, b) => a.x * b.x + a.y * b.y + a.d * b.d;
/** @param {P3} a @param {P3} b @returns {P3} */
const cross = (a, b) => ({ x: a.y * b.d - a.d * b.y, y: a.d * b.x - a.x * b.d, d: a.x * b.y - a.y * b.x });
/** @param {P3} a */
const len = (a) => Math.hypot(a.x, a.y, a.d);
/** @param {P3} a @param {P3} [fallback] @returns {P3} */
const norm = (a, fallback = { x: 0, y: -1, d: 0 }) => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : fallback;
};

/* ---------- 2D geometry ---------- */

/** Andrew's monotone chain; returns counter-clockwise hull (in y-down screen space). @param {{x:number,y:number}[]} pts */
function convexHull(pts) {
  const p = pts.map((q) => ({ x: q.x, y: q.y })).sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  /** @param {{x:number,y:number}} o @param {{x:number,y:number}} a @param {{x:number,y:number}} b */
  const turn = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  /** @type {{x:number,y:number}[]} */
  const lower = [];
  for (const q of p) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  /** @type {{x:number,y:number}[]} */
  const upper = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/**
 * Adds the convex hull grown by r (straight edges, round corners) to the current path.
 * @param {CanvasRenderingContext2D} ctx @param {{x:number,y:number}[]} hull @param {number} r
 */
function pathRoundedHull(ctx, hull, r) {
  const n = hull.length;
  if (n === 0) return;
  if (n < 3) {
    // Degenerate hull (a segment or a point): a capsule.
    const a = hull[0];
    const b = hull[n - 1];
    pathCapsule(ctx, a.x, a.y, r, b.x, b.y, r);
    return;
  }
  // The hull is counter-clockwise in raw coordinates, so the outward normal of edge a->b is (ey, -ex)
  // and its angle increases from one edge to the next: arcs go with anticlockwise = false.
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const a = hull[i];
    const b = hull[(i + 1) % n];
    const n0 = Math.atan2(-(a.x - prev.x), a.y - prev.y);
    const n1 = Math.atan2(-(b.x - a.x), b.y - a.y);
    if (i === 0) ctx.moveTo(a.x + Math.cos(n0) * r, a.y + Math.sin(n0) * r);
    ctx.arc(a.x, a.y, r, n0, n1, false);
    ctx.lineTo(b.x + Math.cos(n1) * r, b.y + Math.sin(n1) * r);
  }
  ctx.closePath();
}

/**
 * A tapered capsule: circles of radius ra at a and rb at b joined by their outer tangents.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} ax @param {number} ay @param {number} ra
 * @param {number} bx @param {number} by @param {number} rb
 */
function pathCapsule(ctx, ax, ay, ra, bx, by, rb) {
  const dx = bx - ax;
  const dy = by - ay;
  const dl = Math.hypot(dx, dy);
  if (dl <= Math.abs(ra - rb) + 1e-6) {
    const big = ra >= rb ? { x: ax, y: ay, r: ra } : { x: bx, y: by, r: rb };
    ctx.moveTo(big.x + big.r, big.y);
    ctx.arc(big.x, big.y, big.r, 0, Math.PI * 2);
    return;
  }
  const base = Math.atan2(dy, dx);
  // Angle of the tangent point measured from the a->b axis.
  const off = Math.acos((ra - rb) / dl);
  ctx.moveTo(ax + Math.cos(base + off) * ra, ay + Math.sin(base + off) * ra);
  ctx.arc(ax, ay, ra, base + off, base - off + Math.PI * 2, false);
  ctx.arc(bx, by, rb, base - off, base + off, false);
  ctx.closePath();
}

/* ---------- figure construction ---------- */

/** @typedef {(ctx: CanvasRenderingContext2D, grow: number) => void} Shape   adds one closed subpath grown by `grow` px */
/**
 * @typedef {Object} Part
 * @property {'forearm'|'palm'|FingerName} name
 * @property {number} depth
 * @property {Shape[]} shapes
 * @property {string} fill
 * @property {P3} [tip]
 * @property {P3} [tipDir]
 * @property {number} [tipR]
 */

/**
 * Builds the drawable parts from 21 screen-space points.
 * @param {P3[]} P
 * @param {{fingers?: Partial<Record<FingerName, boolean>>}} state
 * @param {Palette} pal
 */
function buildFigure(P, state, pal) {
  const L = len(sub(P[9], P[0])) || 1;
  const distal = norm(sub(P[9], P[0]));
  const across = sub(P[5], P[17]);
  const radial = norm(sub(across, mul(distal, dot(across, distal))), { x: 1, y: 0, d: 0 });
  const normal = norm(cross(radial, distal), { x: 0, y: 0, d: 1 });

  /** Hull of the points pushed both ways along the palm normal, so an edge-on palm keeps some body. */
  const slabHull = (/** @type {P3[]} */ pts, /** @type {number} */ halfThick) => {
    const t = mul(normal, halfThick * L);
    return convexHull(pts.flatMap((p) => [add(p, t), sub(p, t)]));
  };

  const wristR = add(add(P[0], mul(radial, 0.25 * L)), mul(distal, 0.02 * L));
  const wristU = add(sub(P[0], mul(radial, 0.23 * L)), mul(distal, 0.02 * L));
  const palmPts = [wristR, wristU, P[1], P[5], P[9], P[13], P[17]];
  const palmHull = slabHull(palmPts, PALM_HALF_THICK);
  const palmR = PALM_ROUND * L;
  /** @type {Part} */
  const palm = {
    name: 'palm',
    depth: palmPts.reduce((s, p) => s + p.d, 0) / palmPts.length,
    fill: pal.bone,
    shapes: [(ctx, g) => pathRoundedHull(ctx, palmHull, palmR + g)],
  };

  const hw = mul(radial, FOREARM_HALF_W * L);
  /** A straight slice of the forearm between t0 and t1 palm lengths below the wrist. */
  const slice = (/** @type {number} */ t0, /** @type {number} */ t1) => {
    const a = sub(P[0], mul(distal, t0 * L));
    const b = sub(P[0], mul(distal, t1 * L));
    return slabHull([add(a, hw), sub(a, hw), add(b, hw), sub(b, hw)], 0.12);
  };
  const forearmHull = slice(0, FOREARM_LEN);
  /** @type {Part} */
  const forearm = {
    name: 'forearm',
    depth: -Infinity,
    fill: pal.bone,
    shapes: [(ctx, g) => pathRoundedHull(ctx, forearmHull, Math.max(0.01, g))],
  };

  /** @type {Part[]} */
  const fingers = FINGER_ORDER.map((name) => {
    const radii = RADII[name].map((r) => r * L);
    const pts = CHAINS[name].map((i) => P[i]);
    // Pull the last circle back so the drawn tip ends near the landmark instead of beyond it.
    const tipDir = norm(sub(pts[3], pts[2]));
    const tip = sub(pts[3], mul(tipDir, radii[3] * 0.7));
    const centers = [pts[0], pts[1], pts[2], tip];
    /** @type {Shape[]} */
    const shapes = [0, 1, 2].map((k) => (ctx, g) => {
      const a = centers[k];
      const b = centers[k + 1];
      pathCapsule(ctx, a.x, a.y, radii[k] + g, b.x, b.y, radii[k + 1] + g);
    });
    return {
      name,
      depth: (pts[1].d + pts[2].d + pts[3].d) / 3,
      fill: state.fingers?.[name] ? pal.fillOk : pal.bone,
      shapes,
      tip,
      tipDir,
      tipR: radii[3],
    };
  });

  return { L, palm, forearm, fingers, palmHull, palmR, bands: [slice(0.07, 0.21), slice(0.21, 0.33)] };
}

/**
 * Ink first at the grown size, then the flat fill: a constant contour around flat colour.
 * Each shape is filled on its own so a finger folding over itself never leaves a winding hole.
 * @param {CanvasRenderingContext2D} ctx @param {Part} part @param {number} c @param {string} ink
 */
function paintPart(ctx, part, c, ink) {
  ctx.fillStyle = ink;
  for (const s of part.shapes) {
    ctx.beginPath();
    s(ctx, c);
    ctx.fill();
  }
  ctx.fillStyle = part.fill;
  for (const s of part.shapes) {
    ctx.beginPath();
    s(ctx, 0);
    ctx.fill();
  }
}

/**
 * Small ink bead at the tip of a finger that matches the target, so "correct" is not colour alone.
 * @param {CanvasRenderingContext2D} ctx @param {Part} f @param {boolean} on @param {string} ink @param {number} L
 */
function paintBead(ctx, f, on, ink, L) {
  if (!on || !f.tip || !f.tipDir) return;
  const r = Math.max(1.6, L * 0.036);
  const at = sub(f.tip, mul(f.tipDir, (f.tipR ?? 0) * 0.15));
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
}

/**
 * Paints one figure. Order: forearm, fingers behind the palm, palm, fingers level with the palm
 * (clipped to outside the palm so they join it without a seam), fingers in front, far to near.
 * @param {CanvasRenderingContext2D} ctx
 * @param {P3[]} P
 * @param {{fingers?: Partial<Record<FingerName, boolean>>}} state
 * @param {{cuff: boolean, cuffAccent: boolean, forearm: boolean}} opts
 */
function paintFigure(ctx, P, state, opts) {
  const pal = getPalette();
  const fig = buildFigure(P, state, pal);
  const { L } = fig;
  const c = Math.min(4.5, Math.max(1.25, L * 0.03));
  /** @param {Part} f */
  const on = (f) => Boolean(state.fingers?.[/** @type {FingerName} */ (f.name)]);

  if (opts.forearm) {
    paintPart(ctx, fig.forearm, c, pal.ink);
    if (opts.cuff) {
      [pal.red, opts.cuffAccent ? pal.ochre : pal.bone].forEach((color, i) => {
        ctx.beginPath();
        pathRoundedHull(ctx, fig.bands[i], 0.01);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = c;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = pal.ink;
        ctx.stroke();
      });
    }
  }

  /** @type {Part[]} */ const behind = [];
  /** @type {Part[]} */ const level = [];
  /** @type {Part[]} */ const front = [];
  for (const f of fig.fingers) {
    const rel = (f.depth - fig.palm.depth) / L;
    // A finger marked correct keeps its whole contour, so its turquoise is always enclosed in ink.
    (rel < -COPLANAR ? behind : rel > COPLANAR || on(f) ? front : level).push(f);
  }
  /** @param {Part} a @param {Part} b */
  const byDepth = (a, b) => a.depth - b.depth;

  for (const f of behind.sort(byDepth)) {
    paintPart(ctx, f, c, pal.ink);
    paintBead(ctx, f, on(f), pal.ink, L);
  }
  paintPart(ctx, fig.palm, c, pal.ink);
  if (level.length) {
    // Fingers level with the palm join it without a seam: paint them over the palm, then
    // repaint the palm's flat fill (no ink) so their outlines vanish inside the palm.
    for (const f of level.sort(byDepth)) paintPart(ctx, f, c, pal.ink);
    ctx.fillStyle = pal.bone;
    ctx.beginPath();
    pathRoundedHull(ctx, fig.palmHull, fig.palmR);
    ctx.fill();
    for (const f of level) paintBead(ctx, f, on(f), pal.ink, L);
  }
  for (const f of front.sort(byDepth)) {
    paintPart(ctx, f, c, pal.ink);
    paintBead(ctx, f, on(f), pal.ink, L);
  }
}

/* ---------- view object ---------- */

/** @typedef {{x: number, y: number, side: 1|-1, w: number, h: number}} TipAnchor   CSS px within the canvas */

/**
 * The highest fingertip on screen and which side of the hand it leans to: where a speech
 * scroll leaving the hand should start.
 * @param {P3[]} P @param {number} w @param {number} h @returns {TipAnchor}
 */
function tipAnchor(P, w, h) {
  // Top of the drawn hand, not just the tips: in a fist the fingertips sit inside the palm.
  const chains = [[2, 3, 4], [6, 7, 8], [10, 11, 12], [14, 15, 16], [18, 19, 20]];
  const highest = (/** @type {number[]} */ ids) => ids.map((i) => P[i]).reduce((a, b) => (b.y < a.y ? b : a));
  let top = highest(chains.flat());
  const L = Math.hypot(P[9].x - P[0].x, P[9].y - P[0].y) || 1;
  // Prefer the index finger when it is nearly as high: the curl reads as speech from a pointing finger.
  const index = highest(chains[1]);
  if (index.y - top.y < 0.3 * L) top = index;
  const cx = (P[0].x + P[9].x) / 2;
  // Start just outside the finger's contour.
  return { x: top.x, y: top.y - 0.12 * L, side: top.x >= cx ? 1 : -1, w, h };
}

/** One observer for every view keeps many grid canvases cheap. */
/** @type {ResizeObserver|null} */
let sharedResize = null;
/** @type {WeakMap<Element, () => void>} */
const resizeHandlers = new WeakMap();
function observeResize(/** @type {HTMLCanvasElement} */ el, /** @type {() => void} */ fn) {
  if (typeof ResizeObserver === 'undefined') return;
  if (!sharedResize) {
    sharedResize = new ResizeObserver((entries) => {
      for (const e of entries) resizeHandlers.get(e.target)?.();
    });
  }
  resizeHandlers.set(el, fn);
  sharedResize.observe(el);
}
function unobserveResize(/** @type {HTMLCanvasElement} */ el) {
  resizeHandlers.delete(el);
  sharedResize?.unobserve(el);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   mirror?: boolean, interactive?: boolean, cuff?: boolean, forearm?: boolean, minBox?: number,
 *   cuffAccent?: boolean,
 *   onDraw?: (anchor: TipAnchor|null) => void,
 * }} [opts]
 */
export function createHandView(canvas, opts = {}) {
  const mirror = opts.mirror ?? false;
  const cuff = opts.cuff ?? false;
  // Off where another ochre element already holds the screen's one accent moment.
  const cuffAccent = opts.cuffAccent ?? true;
  const forearm = opts.forearm ?? true;
  const minBox = opts.minBox ?? 2.3;
  const ctx = canvas.getContext('2d');
  /** @type {'view'|'image'|null} */
  let mode = null;
  /** @type {Vec3[]|null} */
  let points = null;
  /** @type {HandState} */
  let state = {};
  let yaw = 0;
  let pitch = 0;
  let cssW = 0;
  let cssH = 0;
  let frame = 0;
  let destroyed = false;

  function schedule() {
    if (frame || destroyed) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  }

  function resize() {
    draw();
  }

  /** @returns {P3[]|null} */
  function toScreenFromView() {
    if (!points) return null;
    const P = points;
    const cx = (P[0].x + P[9].x) / 2;
    const cy = (P[0].y + P[9].y) / 2;
    const cz = (P[0].z + P[9].z) / 2;
    const cyw = Math.cos((yaw * Math.PI) / 180);
    const syw = Math.sin((yaw * Math.PI) / 180);
    const cp = Math.cos((pitch * Math.PI) / 180);
    const sp = Math.sin((pitch * Math.PI) / 180);
    // Rotate in the view frame (yaw about Y, then pitch about X), mirror, then flip Y for the screen.
    const unit = P.map((p) => {
      const x = p.x - cx;
      const y = p.y - cy;
      const z = p.z - cz;
      const x1 = cyw * x + syw * z;
      const z1 = -syw * x + cyw * z;
      const y2 = cp * y - sp * z1;
      const z2 = sp * y + cp * z1;
      return { x: mirror ? -x1 : x1, y: -y2, d: z2 };
    });
    const L = len(sub(unit[9], unit[0])) || 1;
    // Fit using the hand plus its forearm stub so letters keep a comparable size.
    const distal = norm(sub(unit[9], unit[0]));
    const end = sub(unit[0], mul(distal, FOREARM_LEN * L));
    const xs = unit.map((p) => p.x).concat(forearm ? [end.x] : []);
    const ys = unit.map((p) => p.y).concat(forearm ? [end.y] : []);
    const pad = 0.22 * L;
    let minX = Math.min(...xs) - pad;
    let maxX = Math.max(...xs) + pad;
    let minY = Math.min(...ys) - pad;
    let maxY = Math.max(...ys) + pad;
    const box = minBox * L;
    if (maxX - minX < box) {
      const m = (minX + maxX) / 2;
      minX = m - box / 2;
      maxX = m + box / 2;
    }
    if (maxY - minY < box) {
      const m = (minY + maxY) / 2;
      minY = m - box / 2;
      maxY = m + box / 2;
    }
    const s = Math.min(cssW / (maxX - minX), cssH / (maxY - minY));
    const ox = cssW / 2 - ((minX + maxX) / 2) * s;
    const oy = cssH / 2 - ((minY + maxY) / 2) * s;
    return unit.map((p) => ({ x: p.x * s + ox, y: p.y * s + oy, d: p.d * s }));
  }

  /** @returns {P3[]|null} */
  function toScreenFromImage() {
    if (!points) return null;
    const a = state.aspect && state.aspect > 0 ? state.aspect : 4 / 3;
    // Match object-fit: cover on the video under the canvas.
    let dw;
    let dh;
    if (cssW / cssH > a) {
      dw = cssW;
      dh = cssW / a;
    } else {
      dh = cssH;
      dw = cssH * a;
    }
    const ox = (cssW - dw) / 2;
    const oy = (cssH - dh) / 2;
    return points.map((p) => ({
      x: ox + (mirror ? 1 - p.x : p.x) * dw,
      y: oy + p.y * dh,
      d: -p.z * dw,
    }));
  }

  /** Keep the backing store at CSS size times devicePixelRatio. @returns {number} the ratio in use */
  function syncSize() {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return dpr;
  }

  function draw() {
    if (!ctx || destroyed) return;
    const dpr = syncSize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!cssW || !cssH) return;
    const P = mode === 'image' ? toScreenFromImage() : toScreenFromView();
    if (!P || P.length !== 21 || !P.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.d))) {
      opts.onDraw?.(null);
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintFigure(ctx, P, state, { cuff, cuffAccent, forearm: forearm && mode === 'view' });
    opts.onDraw?.(tipAnchor(P, cssW, cssH));
  }

  /* interaction */
  /** @type {{x:number,y:number,yaw:number,pitch:number}|null} */
  let drag = null;
  /** @param {PointerEvent} e */
  const onDown = (e) => {
    drag = { x: e.clientX, y: e.clientY, yaw, pitch };
    canvas.setPointerCapture(e.pointerId);
  };
  /** @param {PointerEvent} e */
  const onMove = (e) => {
    if (!drag) return;
    setRotation(drag.yaw + (e.clientX - drag.x) * 0.6, drag.pitch - (e.clientY - drag.y) * 0.6);
  };
  const onUp = () => {
    drag = null;
  };
  /** @param {KeyboardEvent} e */
  const onKey = (e) => {
    const step = 12;
    /** @type {Record<string, [number, number]>} */
    const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    setRotation(yaw + m[0], pitch + m[1]);
  };
  if (opts.interactive) {
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.classList.add('is-rotatable');
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('keydown', onKey);
  }

  /** @param {number} y @param {number} p */
  function setRotation(y, p) {
    yaw = ((y + 540) % 360) - 180;
    pitch = Math.max(-80, Math.min(80, p));
    schedule();
  }

  observeResize(canvas, resize);

  return {
    /** @param {Vec3[]|null} view @param {HandState} [s] */
    setLandmarks(view, s = {}) {
      mode = 'view';
      points = view;
      state = s;
      schedule();
    },
    /** @param {Vec3[]|null} image @param {HandState} [s] */
    setImageLandmarks(image, s = {}) {
      mode = 'image';
      points = image;
      state = s;
      schedule();
    },
    setRotation,
    getRotation: () => ({ yaw, pitch }),
    resize,
    /** Draw now instead of on the next frame (used by tests and screenshots). */
    flush() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      draw();
    },
    destroy() {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      unobserveResize(canvas);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('keydown', onKey);
    },
  };
}
