// @ts-check
import { poseToLandmarks, placeHand, viewToCamera } from '../../src/core/handModel.js';

/** @typedef {import('../../src/core/vec.js').Vec3} Vec3 */
/** @typedef {import('../../src/core/handModel.js').HandPose} HandPose */
/** @typedef {import('../../src/core/handModel.js').Orientation} Orientation */

/** Deterministic PRNG so every run sees the same random poses. @param {number} seed */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {() => number} rnd @param {number} lo @param {number} hi */
export const uniform = (rnd, lo, hi) => lo + (hi - lo) * rnd();

/**
 * Sign pose to camera-frame landmarks, the shape MediaPipe hands to the app.
 * @param {HandPose} pose
 * @param {Orientation} orientation
 * @param {'right'|'left'} [handedness]
 */
export function poseToCamera(pose, orientation, handedness = 'right') {
  return viewToCamera(placeHand(poseToLandmarks(pose), orientation, { handedness }));
}

/** @param {() => number} rnd @returns {HandPose} */
export function randomPose(rnd) {
  const f = () => ({
    mcp: uniform(rnd, 0, 90),
    pip: uniform(rnd, 0, 100),
    dip: uniform(rnd, 0, 70),
    spread: uniform(rnd, -15, 15),
  });
  return {
    thumb: {
      radial: uniform(rnd, 0, 90),
      palmar: uniform(rnd, 0, 60),
      mcp: uniform(rnd, 0, 80),
      ip: uniform(rnd, 0, 80),
      roll: uniform(rnd, -30, 90),
    },
    index: f(),
    middle: f(),
    ring: f(),
    pinky: f(),
  };
}

/** @param {() => number} rnd @returns {{m: number[][]}} random proper rotation (QR of a random matrix) */
export function randomRotation(rnd) {
  const q = [uniform(rnd, -1, 1), uniform(rnd, -1, 1), uniform(rnd, -1, 1), uniform(rnd, -1, 1)];
  const n = Math.hypot(...q);
  const [w, x, y, z] = q.map((v) => v / n);
  return {
    m: [
      [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
      [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
      [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
    ],
  };
}

/** @param {{m:number[][]}} r @param {Vec3} p @returns {Vec3} */
export const rotate = (r, p) => ({
  x: r.m[0][0] * p.x + r.m[0][1] * p.y + r.m[0][2] * p.z,
  y: r.m[1][0] * p.x + r.m[1][1] * p.y + r.m[1][2] * p.z,
  z: r.m[2][0] * p.x + r.m[2][1] * p.y + r.m[2][2] * p.z,
});
