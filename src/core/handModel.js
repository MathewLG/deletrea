// @ts-check
import { add, cross, dot, normalize, scale, sub, v3, DEG } from './vec.js';

/** @typedef {import('./vec.js').Vec3} Vec3 */
/** @typedef {'thumb'|'index'|'middle'|'ring'|'pinky'} FingerName */
/** @typedef {{mcp:number,pip:number,dip:number,spread?:number}} FingerPose  degrees */
/** @typedef {{radial:number,palmar:number,mcp:number,ip:number,roll?:number}} ThumbPose  degrees */
/** @typedef {{thumb:ThumbPose,index:FingerPose,middle:FingerPose,ring:FingerPose,pinky:FingerPose}} HandPose */
/** @typedef {{palmar:Vec3,distal:Vec3}} Orientation  view frame, right hand */

/** @type {FingerName[]} */
export const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];

/** @type {Record<FingerName, number[]>} */
export const FINGER_LANDMARKS = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

/** Skeleton of the canonical right hand, palm units (SPEC 5.1). */
export const SKELETON = Object.freeze({
  thumbCmc: v3(0.24, 0.18, 0.08),
  mcp: {
    index: v3(0.26, 0.93, 0),
    middle: v3(0.04, 1.0, 0),
    ring: v3(-0.17, 0.94, 0),
    pinky: v3(-0.36, 0.82, 0),
  },
  bones: {
    thumb: [0.42, 0.33, 0.27],
    index: [0.42, 0.25, 0.2],
    middle: [0.46, 0.29, 0.21],
    ring: [0.43, 0.27, 0.2],
    pinky: [0.33, 0.2, 0.18],
  },
});

const PALMAR = v3(0, 0, 1);

/**
 * Forward kinematics: joint angles to 21 landmarks in the hand frame.
 * @param {HandPose} pose
 * @returns {Vec3[]}
 */
export function poseToLandmarks(pose) {
  /** @type {Vec3[]} */
  const pts = new Array(21);
  pts[0] = v3(0, 0, 0);

  const t = pose.thumb;
  const r = t.radial * DEG;
  const p = t.palmar * DEG;
  const dm = v3(Math.sin(r) * Math.cos(p), Math.cos(r) * Math.cos(p), Math.sin(p));
  const roll = (t.roll ?? 0) * DEG;
  const b0 = v3(-Math.cos(roll), 0, Math.sin(roll));
  let b = sub(b0, scale(dm, dot(b0, dm)));
  b = dot(b, b) < 1e-10 ? PALMAR : normalize(b);
  const [t1, t2, t3] = SKELETON.bones.thumb;
  /** @param {number} phi */
  const thumbDir = (phi) => add(scale(dm, Math.cos(phi)), scale(b, Math.sin(phi)));
  pts[1] = SKELETON.thumbCmc;
  pts[2] = add(pts[1], scale(dm, t1));
  pts[3] = add(pts[2], scale(thumbDir(t.mcp * DEG), t2));
  pts[4] = add(pts[3], scale(thumbDir((t.mcp + t.ip) * DEG), t3));

  for (const name of /** @type {const} */ (['index', 'middle', 'ring', 'pinky'])) {
    const f = pose[name];
    const s = (f.spread ?? 0) * DEG;
    const d0 = v3(Math.sin(s), Math.cos(s), 0);
    const [l1, l2, l3] = SKELETON.bones[name];
    const idx = FINGER_LANDMARKS[name];
    const phis = [f.mcp, f.mcp + f.pip, f.mcp + f.pip + f.dip].map((a) => a * DEG);
    const lens = [l1, l2, l3];
    pts[idx[0]] = SKELETON.mcp[name];
    for (let k = 0; k < 3; k++) {
      const dir = add(scale(d0, Math.cos(phis[k])), scale(PALMAR, Math.sin(phis[k])));
      pts[idx[k + 1]] = add(pts[idx[k]], scale(dir, lens[k]));
    }
  }
  return pts;
}

/**
 * Places hand-frame points in the view frame. A left hand is the right-hand placement mirrored in X.
 * @param {Vec3[]} local
 * @param {Orientation} o
 * @param {{handedness?: 'right'|'left'}} [opts]
 * @returns {Vec3[]}
 */
export function placeHand(local, o, opts = {}) {
  const palmar = normalize(o.palmar);
  // Re-orthogonalise distal so slightly inconsistent sign data still yields a rigid placement.
  const distal = normalize(sub(o.distal, scale(palmar, dot(o.distal, palmar))));
  const radial = cross(distal, palmar);
  const mirror = opts.handedness === 'left' ? -1 : 1;
  return local.map((p) => {
    const w = add(add(scale(radial, p.x), scale(distal, p.y)), scale(palmar, p.z));
    return v3(w.x * mirror, w.y, w.z);
  });
}

/**
 * View frame to MediaPipe camera frame.
 * @param {Vec3[]} points
 * @param {{scale?: number}} [opts]
 * @returns {Vec3[]}
 */
export function viewToCamera(points, opts = {}) {
  const s = opts.scale ?? 0.09;
  return points.map((p) => v3(p.x * s, -p.y * s, -p.z * s));
}

/**
 * @param {HandPose} a
 * @param {HandPose} b
 * @param {number} t
 * @returns {HandPose}
 */
export function lerpPose(a, b, t) {
  /** @param {number|undefined} x @param {number|undefined} y */
  const m = (x, y) => (x ?? 0) + ((y ?? 0) - (x ?? 0)) * t;
  /** @param {FingerPose} fa @param {FingerPose} fb @returns {FingerPose} */
  const finger = (fa, fb) => ({
    mcp: m(fa.mcp, fb.mcp),
    pip: m(fa.pip, fb.pip),
    dip: m(fa.dip, fb.dip),
    spread: m(fa.spread, fb.spread),
  });
  return {
    thumb: {
      radial: m(a.thumb.radial, b.thumb.radial),
      palmar: m(a.thumb.palmar, b.thumb.palmar),
      mcp: m(a.thumb.mcp, b.thumb.mcp),
      ip: m(a.thumb.ip, b.thumb.ip),
      roll: m(a.thumb.roll, b.thumb.roll),
    },
    index: finger(a.index, b.index),
    middle: finger(a.middle, b.middle),
    ring: finger(a.ring, b.ring),
    pinky: finger(a.pinky, b.pinky),
  };
}
