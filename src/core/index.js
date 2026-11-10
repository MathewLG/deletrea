// @ts-check
export { FINGERS, FINGER_LANDMARKS, poseToLandmarks, placeHand, viewToCamera, lerpPose } from './handModel.js';
export { extractFeatures } from './features.js';
export { buildTarget, matchSign, ramp, THRESHOLDS } from './match.js';
export { createLandmarkSmoother } from './filter.js';
export { createHoldDetector } from './hold.js';

/** @typedef {import('./vec.js').Vec3} Vec3 */
/** @typedef {import('./handModel.js').FingerName} FingerName */
/** @typedef {import('./handModel.js').FingerPose} FingerPose */
/** @typedef {import('./handModel.js').ThumbPose} ThumbPose */
/** @typedef {import('./handModel.js').HandPose} HandPose */
/** @typedef {import('./handModel.js').Orientation} Orientation */
/** @typedef {import('./features.js').Features} Features */
/** @typedef {import('./match.js').Target} Target */
/** @typedef {import('./match.js').MatchResult} MatchResult */
/** @typedef {import('./match.js').Hint} Hint */
