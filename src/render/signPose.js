// @ts-check
import { lerpPose, placeHand, poseToLandmarks } from '../core/index.js';
import { prefersReducedMotion } from '../ui/dom.js';

/** @typedef {import('../core/index.js').HandPose} HandPose */
/** @typedef {import('../core/index.js').Orientation} Orientation */
/** @typedef {import('../core/index.js').Vec3} Vec3 */
/** @typedef {import('../signs/alphabet.js').Sign} Sign */
/** @typedef {ReturnType<typeof import('./handView.js').createHandView>} HandView */

/**
 * View-frame landmarks of a handshape in an orientation (right hand).
 * @param {HandPose} pose @param {Orientation} orientation
 * @returns {Vec3[]}
 */
export function poseView(pose, orientation) {
  return placeHand(poseToLandmarks(pose), orientation);
}

/** @param {Sign} sign */
export const signView = (sign) => poseView(sign.pose, sign.orientation);

/** @param {Orientation} a @param {Orientation} b @param {number} t @returns {Orientation} */
function lerpOrientation(a, b, t) {
  /** @param {Vec3} p @param {Vec3} q */
  const mix = (p, q) => {
    const v = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: p.z + (q.z - p.z) * t };
    const l = Math.hypot(v.x, v.y, v.z);
    // Opposite vectors cancel halfway; nudge so placeHand still gets a direction.
    return l > 1e-3 ? { x: v.x / l, y: v.y / l, z: v.z / l } : { x: 0.01, y: 0, z: 1 };
  };
  const palmar = mix(a.palmar, b.palmar);
  const distal = mix(a.distal, b.distal);
  // Keep distal from collapsing onto palmar mid-tween.
  if (Math.abs(palmar.x * distal.x + palmar.y * distal.y + palmar.z * distal.z) > 0.98) return t < 0.5 ? a : b;
  return { palmar, distal };
}

/** @param {number} t */
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Eases a hand view from one handshape to the next (DESIGN.md: 300 ms). Instant under reduced motion.
 * @param {HandView} view
 * @param {{duration?: number, state?: () => import('./handView.js').HandState}} [opts]
 */
export function createPoseTween(view, opts = {}) {
  const duration = opts.duration ?? 300;
  /** @type {{pose: HandPose, orientation: Orientation}|null} */
  let shown = null;
  let raf = 0;

  /** @param {HandPose} pose @param {Orientation} orientation */
  function paint(pose, orientation) {
    shown = { pose, orientation };
    view.setLandmarks(poseView(pose, orientation), opts.state ? opts.state() : {});
  }

  return {
    /** @param {HandPose} pose @param {Orientation} orientation @param {{instant?: boolean}} [o] */
    to(pose, orientation, o = {}) {
      cancelAnimationFrame(raf);
      const from = shown;
      if (!from || o.instant || prefersReducedMotion() || duration <= 0) {
        paint(pose, orientation);
        return;
      }
      const start = performance.now();
      const step = (/** @type {number} */ now) => {
        const t = Math.min(1, (now - start) / duration);
        const k = easeInOut(t);
        paint(lerpPose(from.pose, pose, k), lerpOrientation(from.orientation, orientation, k));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    },
    /** Repaint the current shape, e.g. after the finger state changed. */
    refresh() {
      if (shown) paint(shown.pose, shown.orientation);
    },
    stop() {
      cancelAnimationFrame(raf);
    },
  };
}
