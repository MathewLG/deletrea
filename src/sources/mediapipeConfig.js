// @ts-check
/**
 * Pinned to 0.10.33 on purpose: later 1.x releases state that they send usage metrics to Google.
 * These are the only third-party hosts the CSP in index.html allows (SPEC section 2).
 */
export const MEDIAPIPE_VERSION = '0.10.33';
export const MEDIAPIPE_MODULE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs`;
export const MEDIAPIPE_WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
export const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
