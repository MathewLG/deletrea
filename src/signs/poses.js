// @ts-check

/** @typedef {import('../core/handModel.js').FingerPose} FingerPose */
/** @typedef {import('../core/handModel.js').ThumbPose} ThumbPose */
/** @typedef {import('../core/handModel.js').Orientation} Orientation */

/** @param {number} mcp @param {number} pip @param {number} dip @param {number} [spread] @returns {FingerPose} */
export const finger = (mcp, pip, dip, spread = 0) => ({ mcp, pip, dip, spread });

/** @param {number} radial @param {number} palmar @param {number} mcp @param {number} ip @param {number} [roll] @returns {ThumbPose} */
export const thumb = (radial, palmar, mcp, ip, roll = 0) => ({ radial, palmar, mcp, ip, roll });

// Spreads that make each straight finger continue the wrist-to-knuckle ray, so a relaxed open hand reads as zero flexion.
export const NATURAL_SPREAD = Object.freeze({ index: 15.6, middle: 2.3, ring: -10.2, pinky: -23.7 });

// Spreads that close the fan so neighbouring fingertips sit about one finger width apart.
export const TOGETHER = Object.freeze({ index: -2, middle: 0, ring: 2, pinky: 4 });

/** Closed into the fist. @param {number} [spread] */
export const closed = (spread = 0) => finger(85, 100, 60, spread);

/** @param {keyof typeof TOGETHER} name */
export const straightTogether = (name) => finger(0, 0, 0, TOGETHER[name]);

/** @type {Record<string, Orientation>} */
export const ORIENT = {
  front: { palmar: { x: 0, y: 0, z: 1 }, distal: { x: 0, y: 1, z: 0 } },
  // Palm turned toward the body midline and the camera at once, so the opening of C and O faces the viewer.
  diagonal: { palmar: { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 }, distal: { x: 0, y: 1, z: 0 } },
  sideways: { palmar: { x: 1, y: 0, z: 0 }, distal: { x: 0, y: 1, z: 0 } },
  // Back of the hand to the viewer, fingers pointing toward the body midline, thumb up.
  backSideways: { palmar: { x: 0, y: 0, z: -1 }, distal: { x: 1, y: 0, z: 0 } },
  // Back of the hand to the viewer, fingers hanging down.
  backDown: { palmar: { x: 0, y: 0, z: -1 }, distal: { x: 0, y: -1, z: 0 } },
};
