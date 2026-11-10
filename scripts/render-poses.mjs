// Contact sheet of every sign's pose, drawn in mirror view, for checking handshapes by eye
// against the research images. Also prints thumb contact distances for the letters that need one.
// Usage: node scripts/render-poses.mjs   → tmp/poses.svg, tmp/poses.png (if sharp is available)
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { poseToLandmarks, placeHand, FINGER_LANDMARKS } from '../src/core/handModel.js';
import { ALPHABET } from '../src/signs/alphabet.js';

/** @typedef {import('../src/core/vec.js').Vec3} Vec3 */
/** @typedef {import('../src/signs/alphabet.js').Sign} Sign */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'tmp');

const COLS = 7;
const CELL_W = 220;
const CELL_H = 250;
const PX = 78; // pixels per palm unit, fixed so hand sizes are comparable across cells
/** @type {Record<string, number>} */
const RADIUS = { thumb: 0.1, index: 0.09, middle: 0.095, ring: 0.088, pinky: 0.078 };

/** @param {Vec3} a @param {Vec3} b */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Closest distance between segments p1q1 and p2q2. @param {Vec3} p1 @param {Vec3} q1 @param {Vec3} p2 @param {Vec3} q2 */
function segDist(p1, q1, p2, q2) {
  /** @param {Vec3} a @param {Vec3} b */
  const s = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  /** @param {Vec3} a @param {Vec3} b */
  const d = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const d1 = s(q1, p1);
  const d2 = s(q2, p2);
  const r = s(p1, p2);
  const a = d(d1, d1);
  const e = d(d2, d2);
  const f = d(d2, r);
  const c = d(d1, r);
  const b = d(d1, d2);
  const den = a * e - b * b;
  /** @param {number} x */
  const clamp = (x) => Math.min(1, Math.max(0, x));
  let u = den > 1e-12 ? clamp((b * f - c * e) / den) : 0;
  let t = (b * u + f) / e;
  if (t < 0) {
    t = 0;
    u = clamp(-c / a);
  } else if (t > 1) {
    t = 1;
    u = clamp((b - c) / a);
  }
  const P = { x: p1.x + d1.x * u, y: p1.y + d1.y * u, z: p1.z + d1.z * u };
  const Q = { x: p2.x + d2.x * t, y: p2.y + d2.y * t, z: p2.z + d2.z * t };
  return dist(P, Q);
}

/** Thumb clearance: smallest gap between the thumb's two phalanges and any finger bone, skipping contact bones. */
/** @param {Vec3[]} L @param {string[]} skip */
function thumbClearance(L, skip) {
  let min = Infinity;
  let where = '';
  for (const [name, ix] of Object.entries(FINGER_LANDMARKS)) {
    if (name === 'thumb') continue;
    for (let k = 0; k < 3; k++) {
      if (skip.includes(`${name}${k}`)) continue;
      for (const [a, b] of [
        [2, 3],
        [3, 4],
      ]) {
        const g = segDist(L[a], L[b], L[ix[k]], L[ix[k + 1]]);
        if (g < min) {
          min = g;
          where = `${name} bone ${k + 1}`;
        }
      }
    }
  }
  return { min, where };
}

// Which contact each letter needs, measured in the hand frame (palm units).
/** @type {Record<string, {label: string, fn: (L: Vec3[]) => number, skip: string[]}>} */
const CONTACTS = {
  d: { label: 'thumb tip to middle tip', fn: (L) => dist(L[4], L[12]), skip: ['middle2', 'ring2', 'pinky2'] },
  e: { label: 'thumb tip to nearest fingertip (no contact required)', fn: (L) => Math.min(...[8, 12, 16, 20].map((i) => dist(L[4], L[i]))), skip: [] },
  f: { label: 'thumb tip to index tip', fn: (L) => dist(L[4], L[8]), skip: ['index2'] },
  o: { label: 'thumb tip to index tip', fn: (L) => dist(L[4], L[8]), skip: ['index2', 'middle2'] },
  p: { label: 'thumb distal bone to middle proximal bone', fn: (L) => segDist(L[9], L[10], L[4], L[3]) , skip: ['middle0'] },
  k: { label: 'thumb distal bone to middle proximal bone', fn: (L) => segDist(L[9], L[10], L[4], L[3]), skip: ['middle0'] },
  t: { label: 'thumb tip to index-middle knuckle gap', fn: (L) => dist(L[4], mid(L[6], L[10])), skip: ['index0', 'index1', 'middle0'] },
  w: { label: 'thumb tip to pinky tip', fn: (L) => dist(L[4], L[20]), skip: ['pinky2', 'pinky1'] },
};
/** @param {Vec3} a @param {Vec3} b */
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 });

/** @param {Sign} sign @param {number} cx @param {number} cy */
function drawSign(sign, cx, cy) {
  // Two extra points give the wrist some width; the 21 landmarks alone make the palm a sliver.
  const local = [...poseToLandmarks(sign.pose), { x: 0.17, y: 0.02, z: 0 }, { x: -0.24, y: 0.04, z: 0 }];
  const view = placeHand(local, sign.orientation);
  // Mirror view: X flipped, as the app and the CICESE chart present it.
  const pts = view.map((p) => ({ x: -p.x, y: -p.y, z: p.z }));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const ox = cx - ((Math.min(...xs) + Math.max(...xs)) / 2) * PX;
  const oy = cy - ((Math.min(...ys) + Math.max(...ys)) / 2) * PX;
  /** @param {number} i */
  const P = (i) => [ox + pts[i].x * PX, oy + pts[i].y * PX];

  const items = [];
  const palm = [21, 1, 2, 5, 9, 13, 17, 22];
  items.push({
    z: palm.reduce((s, i) => s + pts[i].z, 0) / palm.length,
    svg: `<polygon points="${palm.map((i) => P(i).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="#f4f1ea" stroke="#1d1d1b" stroke-width="2.4" stroke-linejoin="round"/>`,
  });
  for (const [name, ix] of Object.entries(FINGER_LANDMARKS)) {
    const chain = name === 'thumb' ? ix : [ix[0], ix[1], ix[2], ix[3]];
    const w = RADIUS[name] * 2 * PX;
    const fill = name === 'thumb' ? '#e9c9a0' : '#ffffff';
    for (let k = 0; k < chain.length - 1; k++) {
      if (name === 'thumb' && k === 0) continue;
      const [x1, y1] = P(chain[k]);
      const [x2, y2] = P(chain[k + 1]);
      const line = `x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-linecap="round"`;
      // Distal bones get a small bias so a tip folded onto its own finger paints over it.
      items.push({
        z: (pts[chain[k]].z + pts[chain[k + 1]].z) / 2 + k * 0.002,
        svg: `<line ${line} stroke="#1d1d1b" stroke-width="${(w + 4.5).toFixed(1)}"/><line ${line} stroke="${fill}" stroke-width="${w.toFixed(1)}"/>`,
      });
    }
    const [tx, ty] = P(chain[chain.length - 1]);
    items.push({
      z: pts[chain[chain.length - 1]].z + 0.01,
      svg: `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="2.6" fill="${name === 'thumb' ? '#b5541c' : '#7a7a7a'}"/>`,
    });
  }
  items.sort((a, b) => a.z - b.z);
  return items.map((i) => i.svg).join('');
}

const rows = Math.ceil(ALPHABET.length / COLS);
const W = COLS * CELL_W;
const H = rows * CELL_H;
let body = `<rect width="${W}" height="${H}" fill="#ffffff"/>`;
ALPHABET.forEach((sign, n) => {
  const col = n % COLS;
  const row = Math.floor(n / COLS);
  const x0 = col * CELL_W;
  const y0 = row * CELL_H;
  body += `<rect x="${x0 + 4}" y="${y0 + 4}" width="${CELL_W - 8}" height="${CELL_H - 8}" fill="none" stroke="#d8d4cc"/>`;
  body += drawSign(sign, x0 + CELL_W / 2, y0 + CELL_H / 2 - 12);
  const tag = sign.kind === 'dynamic' ? ' (mov.)' : '';
  body += `<text x="${x0 + CELL_W / 2}" y="${y0 + CELL_H - 14}" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="#1d1d1b">${sign.letter}${tag}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>\n`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'poses.svg'), svg);
console.log('wrote tmp/poses.svg');

console.log('\nThumb contacts (palm units; contact wanted under ~0.15, clearance is the thumb-to-other-bone gap):');
for (const sign of ALPHABET) {
  const c = CONTACTS[sign.id];
  if (!c) continue;
  const L = poseToLandmarks(sign.pose);
  const cl = thumbClearance(L, c.skip);
  console.log(`  ${sign.letter}: ${c.label} = ${c.fn(L).toFixed(3)}   clearance ${cl.min.toFixed(3)} (${cl.where})`);
}

try {
  const require = createRequire(import.meta.url);
  const sharp = /** @type {any} */ (require('/opt/npm-tools/node_modules/sharp'));
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, 'poses.png'));
  console.log('\nwrote tmp/poses.png');
} catch (err) {
  console.log(`\nsharp unavailable (${err instanceof Error ? err.message : err}); kept the SVG only`);
}
