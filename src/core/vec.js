// @ts-check

/** @typedef {{x:number,y:number,z:number}} Vec3 */

/** @param {number} x @param {number} y @param {number} z @returns {Vec3} */
export const v3 = (x, y, z) => ({ x, y, z });

/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });

/** @param {Vec3} a @param {number} s @returns {Vec3} */
export const scale = (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s });

/** @param {Vec3} a @param {Vec3} b */
export const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
export const cross = (a, b) => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

/** @param {Vec3} a */
export const length = (a) => Math.hypot(a.x, a.y, a.z);

/** @param {Vec3} a @param {Vec3} b */
export const distance = (a, b) => length(sub(a, b));

/** @param {Vec3} a @returns {Vec3} */
export const normalize = (a) => {
  const l = length(a);
  return l > 1e-12 ? scale(a, 1 / l) : { x: 0, y: 0, z: 0 };
};

/** Angle between two vectors in degrees; 0 when either is degenerate. @param {Vec3} a @param {Vec3} b */
export const angleDeg = (a, b) => {
  const la = length(a);
  const lb = length(b);
  if (la < 1e-12 || lb < 1e-12) return 0;
  const c = Math.min(1, Math.max(-1, dot(a, b) / (la * lb)));
  return (Math.acos(c) * 180) / Math.PI;
};

/** @param {Vec3} a @param {Vec3} b @param {number} t @returns {Vec3} */
export const lerp = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});

/** @param {unknown} p @returns {p is Vec3} */
export const isFiniteVec = (p) =>
  typeof p === 'object' &&
  p !== null &&
  Number.isFinite(/** @type {Vec3} */ (p).x) &&
  Number.isFinite(/** @type {Vec3} */ (p).y) &&
  Number.isFinite(/** @type {Vec3} */ (p).z);

export const DEG = Math.PI / 180;
