// @ts-check
import { poseToLandmarks, placeHand, viewToCamera } from './handModel.js';
import { extractFeatures } from './features.js';
import { angleDeg, distance } from './vec.js';

/** @typedef {import('./vec.js').Vec3} Vec3 */
/** @typedef {import('./handModel.js').FingerName} FingerName */
/** @typedef {import('./handModel.js').HandPose} HandPose */
/** @typedef {import('./handModel.js').Orientation} Orientation */
/** @typedef {import('./features.js').Features} Features */
/** @typedef {import('../signs/alphabet.js').Sign} Sign */
/** @typedef {{code: string, finger?: FingerName, other?: FingerName}} Hint */
/**
 * @typedef {Object} MatchResult
 * @property {boolean} ok                       all five fingers and orientation ok
 * @property {number} score                     0..1, mean of the six part scores
 * @property {Record<FingerName,{score:number, ok:boolean}>} fingers
 * @property {{score:number, ok:boolean}} orientation
 * @property {Hint|null} hint                   the one most useful correction, null when ok
 */
/** @typedef {'index'|'middle'|'ring'|'pinky'} CurlFinger */
/**
 * @typedef {Object} Target
 * @property {string} id
 * @property {Features} features
 * @property {{a: CurlFinger, b: CurlFinger, gap: number}[]} pairs   adjacent pairs extended in the target
 * @property {CurlFinger} contactFinger         target fingertip nearest the thumb tip
 * @property {number} contactDistance
 * @property {Partial<Record<FingerName|'orientation', number>>} tolerance
 * @property {boolean} looseOrientation
 */

/** @type {CurlFinger[]} */
const CURL = ['index', 'middle', 'ring', 'pinky'];
/** @type {Record<CurlFinger, number>} */
const TIP = { index: 8, middle: 12, ring: 16, pinky: 20 };
/** @type {[CurlFinger, CurlFinger][]} */
const ADJACENT = [
  ['index', 'middle'],
  ['middle', 'ring'],
  ['ring', 'pinky'],
];

export const THRESHOLDS = Object.freeze({
  curl: [18, 48],
  pair: [0.15, 0.35],
  thumbPos: [0.2, 0.5],
  thumbContact: [0.22, 0.5],
  palmar: [50, 85],
  distal: [40, 75],
  looseWiden: 25,
  extendedBelow: 60,
  ok: 0.5,
});

/** 1 when e ≤ full, 0 when e ≥ zero, linear between. @param {number} e @param {number} full @param {number} zero */
export const ramp = (e, full, zero) => (e <= full ? 1 : e >= zero ? 0 : (zero - e) / (zero - full));

/**
 * @param {Sign} sign
 * @returns {Target}
 */
export function buildTarget(sign) {
  const view = placeHand(poseToLandmarks(sign.pose), sign.orientation);
  const features = /** @type {Features} */ (extractFeatures(viewToCamera(view), 'right'));
  const L = features.local;
  const pairs = [];
  for (const [a, b] of ADJACENT) {
    const fa = features.angles[a];
    const fb = features.angles[b];
    if (fa.mcp + fa.pip < THRESHOLDS.extendedBelow && fb.mcp + fb.pip < THRESHOLDS.extendedBelow) {
      pairs.push({ a, b, gap: L[TIP[a]].x - L[TIP[b]].x });
    }
  }
  let contactFinger = CURL[0];
  let contactDistance = Infinity;
  for (const f of CURL) {
    const d = distance(L[4], L[TIP[f]]);
    if (d < contactDistance) {
      contactDistance = d;
      contactFinger = f;
    }
  }
  return {
    id: sign.id,
    features,
    pairs,
    contactFinger,
    contactDistance,
    tolerance: sign.tolerance ?? {},
    looseOrientation: Boolean(sign.looseOrientation),
  };
}

/**
 * @param {Features} features
 * @param {Target} target
 * @returns {MatchResult}
 */
export function matchSign(features, target) {
  const T = THRESHOLDS;
  const tol = target.tolerance;
  const L = features.local;
  const TL = target.features.local;

  /** @type {Record<string, {score:number, ok:boolean}>} */
  const fingers = {};
  /** @type {Record<string, Hint>} */
  const fingerHints = {};
  /** Scores used only to pick the hint; differs from `fingers` where another part is the real cause. */
  /** @type {Record<string, number>} */
  const hintRank = {};

  for (const f of CURL) {
    const k = tol[f] ?? 1;
    const a = features.angles[f];
    const t = target.features.angles[f];
    const dm = a.mcp - t.mcp;
    const dp = a.pip - t.pip;
    const dd = a.dip - t.dip;
    const e = Math.sqrt((dm * dm + dp * dp + 0.5 * dd * dd) / 2.5);
    const score = ramp(e, T.curl[0] * k, T.curl[1] * k);
    fingers[f] = { score, ok: score >= T.ok };
    const am = Math.abs(dm);
    const ap = Math.abs(dp);
    const ad = Math.abs(dd);
    let code;
    if (am >= ap && am >= ad) code = dm > 0 ? 'straighten_knuckle' : 'bend_knuckle';
    else if (ap >= ad) code = dp > 0 ? 'curl_less' : 'curl_more';
    else code = dd > 0 ? 'straighten_tip' : 'bend_tip';
    fingerHints[f] = { code, finger: f };
  }

  for (const pair of target.pairs) {
    const k = Math.max(tol[pair.a] ?? 1, tol[pair.b] ?? 1);
    const gap = L[TIP[pair.a]].x - L[TIP[pair.b]].x;
    const d = gap - pair.gap;
    const score = ramp(Math.abs(d), T.pair[0] * k, T.pair[1] * k);
    let code;
    if (d < 0) code = 'apart';
    else code = pair.gap < 0 ? 'cross' : 'together';
    for (const f of [pair.a, pair.b]) {
      if (score < fingers[f].score) {
        fingers[f] = { score, ok: score >= T.ok };
        fingerHints[f] = { code, finger: pair.a, other: pair.b };
      }
    }
  }

  {
    const k = tol.thumb ?? 1;
    const tip = L[4];
    const ttip = TL[4];
    const posScore = ramp(distance(tip, ttip), T.thumbPos[0] * k, T.thumbPos[1] * k);
    const cf = target.contactFinger;
    const dContact = distance(tip, L[TIP[cf]]) - target.contactDistance;
    const contactScore = ramp(Math.abs(dContact), T.thumbContact[0] * k, T.thumbContact[1] * k);
    const score = Math.min(posScore, contactScore);
    fingers.thumb = { score, ok: score >= T.ok };
    // A finger moving toward the thumb shrinks the contact distance without the thumb being wrong, so the
    // hint should go to that finger. `ok` still uses the full score.
    if (contactScore < posScore && dContact < 0) hintRank.thumb = posScore;
    if (contactScore < posScore && dContact > 0) {
      fingerHints.thumb = { code: 'thumb_touch', finger: 'thumb', other: cf };
    } else {
      const ex = ttip.x - tip.x;
      const ey = ttip.y - tip.y;
      const ez = ttip.z - tip.z;
      const ax = Math.abs(ex);
      const ay = Math.abs(ey);
      const az = Math.abs(ez);
      let code;
      if (ax >= ay && ax >= az) code = ex > 0 ? 'thumb_away' : 'thumb_toward_palm';
      else if (ay >= az) code = ey > 0 ? 'thumb_up' : 'thumb_down';
      else code = ez > 0 ? 'thumb_front' : 'thumb_back';
      fingerHints.thumb = { code, finger: 'thumb' };
    }
  }

  const o = features.orientation;
  const to = target.features.orientation;
  const widen = target.looseOrientation ? T.looseWiden : 0;
  const ko = tol.orientation ?? 1;
  const palmarScore = ramp(angleDeg(o.palmar, to.palmar), (T.palmar[0] + widen) * ko, (T.palmar[1] + widen) * ko);
  const distalScore = ramp(angleDeg(o.distal, to.distal), (T.distal[0] + widen) * ko, (T.distal[1] + widen) * ko);
  const oScore = Math.min(palmarScore, distalScore);
  const orientation = { score: oScore, ok: oScore >= T.ok };

  const typedFingers = /** @type {Record<FingerName,{score:number, ok:boolean}>} */ (fingers);
  const order = /** @type {FingerName[]} */ (['thumb', 'index', 'middle', 'ring', 'pinky']);
  const ok = orientation.ok && order.every((f) => typedFingers[f].ok);
  const score = (order.reduce((s, f) => s + typedFingers[f].score, 0) + oScore) / 6;

  /** @type {Hint|null} */
  let hint = null;
  if (!ok) {
    if (!orientation.ok) {
      hint = { code: palmarScore <= distalScore ? palmHint(to.palmar) : pointHint(to.distal) };
    } else {
      /** @param {FingerName} f */
      const rank = (f) => hintRank[f] ?? typedFingers[f].score;
      let worst = order[0];
      for (const f of order) if (rank(f) < rank(worst)) worst = f;
      hint = fingerHints[worst];
    }
  }
  return { ok, score, fingers: typedFingers, orientation, hint };
}

/** @param {Vec3} palmar */
function palmHint(palmar) {
  const ax = Math.abs(palmar.x);
  const az = Math.abs(palmar.z);
  if (az >= ax && az >= Math.abs(palmar.y)) return palmar.z > 0 ? 'palm_to_camera' : 'palm_to_self';
  return 'palm_sideways';
}

/** @param {Vec3} distal */
function pointHint(distal) {
  if (Math.abs(distal.y) >= Math.abs(distal.x) && Math.abs(distal.y) >= Math.abs(distal.z)) {
    return distal.y > 0 ? 'point_up' : 'point_down';
  }
  return 'point_side';
}
