// @ts-check
import { angleDeg, cross, distance, dot, isFiniteVec, normalize, scale, sub, v3 } from './vec.js';

/** @typedef {import('./vec.js').Vec3} Vec3 */
/** @typedef {import('./handModel.js').Orientation} Orientation */
/** @typedef {{mcp:number,pip:number,dip:number}} FingerAngles */
/**
 * @typedef {Object} Features
 * @property {'right'|'left'} handedness
 * @property {boolean} handednessConfident      false when the hand is too flat to tell its side from its shape
 * @property {number} palmLength
 * @property {Vec3[]} local                     canonical right-hand points, palm units
 * @property {{index:FingerAngles, middle:FingerAngles, ring:FingerAngles, pinky:FingerAngles, thumb:{mcp:number,ip:number}}} angles
 * @property {Orientation} orientation
 */

const CURL_FINGERS = /** @type {const} */ ([
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
]);

// 0.15 was too narrow: a flat hand with slightly hyperextended fingers sums below zero, and the noise tests
// flipped near-flat hands. Inside the margin the shape cannot tell the side, so session.js tries both.
export const HANDEDNESS_MARGIN = 0.6;

/**
 * @param {Vec3[]} world  21 landmarks, camera frame
 * @param {'right'|'left'|null} [handednessHint]  used only when the shape is inconclusive
 * @param {{force?: 'right'|'left'}} [opts]  skip the inference and canonicalise as this side
 * @returns {Features|null}
 */
export function extractFeatures(world, handednessHint = null, opts = {}) {
  if (!Array.isArray(world) || world.length !== 21 || !world.every(isFiniteVec)) return null;
  const P = world.map((p) => v3(p.x, -p.y, -p.z));
  const palmLength = distance(P[9], P[0]);
  if (palmLength < 1e-9) return null;

  const distal = normalize(sub(P[9], P[0]));
  const across = sub(P[5], P[17]);
  const radial = normalize(sub(across, scale(distal, dot(across, distal))));
  const n = cross(radial, distal);

  /** @param {Vec3} p @param {Vec3} palmar */
  const toLocal = (p, palmar) => {
    const d = sub(p, P[0]);
    return v3(dot(d, radial) / palmLength, dot(d, distal) / palmLength, dot(d, palmar) / palmLength);
  };

  // Fingers only curl toward the palm, so their summed palmar excursion reveals which side the palm is on.
  let sum = 0;
  for (const [mcp, ...rest] of CURL_FINGERS) {
    const base = dot(sub(P[mcp], P[0]), n);
    for (const k of rest) sum += (dot(sub(P[k], P[0]), n) - base) / palmLength;
  }
  sum += dot(sub(P[3], P[0]), n) / palmLength + dot(sub(P[4], P[0]), n) / palmLength;

  const handednessConfident = Math.abs(sum) > HANDEDNESS_MARGIN;
  /** @type {'right'|'left'} */
  let handedness;
  if (opts.force) handedness = opts.force;
  else if (handednessConfident) handedness = sum > 0 ? 'right' : 'left';
  else handedness = handednessHint ?? 'right';

  const palmar = handedness === 'right' ? n : scale(n, -1);
  const local = P.map((p) => toLocal(p, palmar));

  /** @param {number} a @param {number} b @param {number} c */
  const joint = (a, b, c) => angleDeg(sub(P[b], P[a]), sub(P[c], P[b]));
  /** @param {number[]} f */
  const finger = (f) => ({ mcp: joint(0, f[0], f[1]), pip: joint(f[0], f[1], f[2]), dip: joint(f[1], f[2], f[3]) });

  const mx = handedness === 'left' ? -1 : 1;
  return {
    handedness,
    handednessConfident,
    palmLength,
    local,
    angles: {
      index: finger([5, 6, 7, 8]),
      middle: finger([9, 10, 11, 12]),
      ring: finger([13, 14, 15, 16]),
      pinky: finger([17, 18, 19, 20]),
      thumb: { mcp: joint(1, 2, 3), ip: joint(2, 3, 4) },
    },
    orientation: {
      palmar: v3(palmar.x * mx, palmar.y, palmar.z),
      distal: v3(distal.x * mx, distal.y, distal.z),
    },
  };
}
