// @ts-check
/**
 * Synthetic source: a drawn hand that plays a short practice loop per target with no camera.
 * Powers "Probar sin cámara" and the browser tests (SPEC section 8).
 */
import { lerpPose, placeHand, poseToLandmarks, viewToCamera } from '../core/index.js';

/** @typedef {import('../core/index.js').HandPose} HandPose */
/** @typedef {import('../core/index.js').Orientation} Orientation */
/** @typedef {import('../core/index.js').Vec3} Vec3 */
/** @typedef {import('../signs/alphabet.js').Sign} Sign */
/** @typedef {import('./camera.js').HandFrame} HandFrame */
/** @typedef {import('./camera.js').SourceState} SourceState */
/** @typedef {{pose: HandPose, orientation: Orientation} | null} ScriptStep */
/** @typedef {(elapsedMs: number, sign: Sign, ctx: {fast: boolean}) => ScriptStep} SyntheticScript */

/** Image aspect ratio of the simulated camera. */
export const SYNTHETIC_ASPECT = 4 / 3;

/** @type {HandPose} */
export const OPEN_HAND = {
  thumb: { radial: 70, palmar: 10, mcp: 8, ip: 5, roll: 0 },
  index: { mcp: 4, pip: 4, dip: 2, spread: 12 },
  middle: { mcp: 4, pip: 4, dip: 2, spread: 2 },
  ring: { mcp: 4, pip: 4, dip: 2, spread: -8 },
  pinky: { mcp: 4, pip: 4, dip: 2, spread: -18 },
};

/** @param {number} t */
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * The same handshape with one non-thumb finger flipped between curled and extended,
 * so the loop shows a real correction.
 * @param {Sign} sign
 * @returns {HandPose}
 */
export function wrongPose(sign) {
  // Never the middle finger: raising it alone from a fist is an offensive gesture.
  const names = /** @type {const} */ (['index', 'ring', 'pinky']);
  const pick = names[sign.id.charCodeAt(0) % names.length];
  const f = sign.pose[pick];
  const curled = f.mcp + f.pip > 90;
  return {
    ...sign.pose,
    [pick]: curled ? { mcp: 5, pip: 5, dip: 3, spread: f.spread } : { mcp: 85, pip: 100, dip: 60, spread: f.spread },
  };
}

/**
 * Default loop: open hand, move to a pose with one wrong finger, hold it, correct it, hold the sign.
 * `fast` reaches the correct pose within 300 ms and holds.
 * @type {SyntheticScript}
 */
export const defaultScript = (ms, sign, { fast }) => {
  const o = sign.orientation;
  if (fast || sign.kind === 'dynamic') {
    return { pose: lerpPose(OPEN_HAND, sign.pose, ease(ms / 250)), orientation: o };
  }
  const wrong = wrongPose(sign);
  if (ms < 500) return { pose: OPEN_HAND, orientation: o };
  if (ms < 1300) return { pose: lerpPose(OPEN_HAND, wrong, ease((ms - 500) / 800)), orientation: o };
  if (ms < 2600) return { pose: wrong, orientation: o };
  if (ms < 3200) return { pose: lerpPose(wrong, sign.pose, ease((ms - 2600) / 600)), orientation: o };
  return { pose: sign.pose, orientation: o };
};

/**
 * Small, deterministic joint wobble so the drawing looks alive.
 * @param {HandPose} pose @param {number} ms @param {number} amp degrees
 * @returns {HandPose}
 */
function wobble(pose, ms, amp) {
  if (!amp) return pose;
  const s = (/** @type {number} */ k) => Math.sin(ms / 530 + k * 1.7) * amp;
  /** @param {import('../core/index.js').FingerPose} f @param {number} k */
  const fin = (f, k) => ({ ...f, mcp: f.mcp + s(k), pip: f.pip + s(k + 0.5) });
  return {
    thumb: { ...pose.thumb, mcp: pose.thumb.mcp + s(0.2) },
    index: fin(pose.index, 1),
    middle: fin(pose.middle, 2),
    ring: fin(pose.ring, 3),
    pinky: fin(pose.pinky, 4),
  };
}

/**
 * World landmarks (camera frame, metres) plus image landmarks from a pinhole projection
 * with the hand about 45 cm in front of the camera.
 * @param {HandPose} pose @param {Orientation} orientation @param {number} ms
 * @returns {{world: Vec3[], image: Vec3[]}}
 */
export function synthesize(pose, orientation, ms = 0) {
  const world = viewToCamera(placeHand(poseToLandmarks(pose), orientation, { handedness: 'right' }));
  const F = 1.1;
  const D = 0.45;
  const cx = (world[0].x + world[9].x) / 2;
  const cy = (world[0].y + world[9].y) / 2;
  const swayX = Math.sin(ms / 1900) * 0.006;
  const swayY = Math.cos(ms / 2300) * 0.004;
  const image = world.map((p) => {
    const Z = D + p.z;
    return {
      x: 0.5 + (F * (p.x - cx + swayX)) / Z,
      y: 0.52 + (F * SYNTHETIC_ASPECT * (p.y - cy + swayY)) / Z,
      z: ((p.z - world[0].z) * F) / D,
    };
  });
  return { world, image };
}

/**
 * @param {{
 *   getTarget: () => Sign|null,
 *   onFrame: (f: HandFrame) => void,
 *   onState: (s: SourceState) => void,
 *   script?: SyntheticScript,
 *   fast?: boolean,
 * }} opts
 */
export function createSyntheticSource({ getTarget, onFrame, onState, script = defaultScript, fast = false }) {
  let raf = 0;
  let running = false;
  /** @type {Sign|null} */
  let current = null;
  let since = 0;

  /** @param {number} now */
  function tick(now) {
    raf = 0;
    if (!running) return;
    const sign = getTarget();
    if (sign !== current) {
      current = sign;
      since = now;
    }
    if (!sign) {
      onFrame({ t: now, world: null, image: null, handedness: null });
    } else {
      const step = script(now - since, sign, { fast });
      if (!step) {
        onFrame({ t: now, world: null, image: null, handedness: null });
      } else {
        const { world, image } = synthesize(wobble(step.pose, now, fast ? 0 : 1.5), step.orientation, now);
        onFrame({ t: now, world, image, handedness: 'right' });
      }
    }
    if (running) raf = requestAnimationFrame(tick);
  }

  return {
    async start() {
      if (running) return;
      running = true;
      current = null;
      onState('running');
      raf = requestAnimationFrame(tick);
    },
    stop() {
      if (!running) return;
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      onState('stopped');
    },
    aspect: () => SYNTHETIC_ASPECT,
  };
}
