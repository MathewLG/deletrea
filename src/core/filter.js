// @ts-check

/** @typedef {import('./vec.js').Vec3} Vec3 */

/** @param {number} cutoff @param {number} dt seconds */
const alpha = (cutoff, dt) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

/**
 * One Euro filter (Casiez et al. 2012) applied independently to every coordinate.
 * @param {{minCutoff?: number, beta?: number, dCutoff?: number}} [opts]
 * @returns {{ push(points: Vec3[], tMs: number): Vec3[], reset(): void }}
 */
export function createLandmarkSmoother(opts = {}) {
  const minCutoff = opts.minCutoff ?? 1.2;
  const beta = opts.beta ?? 0.02;
  const dCutoff = opts.dCutoff ?? 1.0;
  /** @type {Float64Array|null} */
  let x = null;
  /** @type {Float64Array|null} */
  let dx = null;
  let lastT = 0;
  let count = 0;

  return {
    push(points, tMs) {
      if (!points) {
        x = null;
        return points;
      }
      const raw = new Float64Array(points.length * 3);
      points.forEach((p, i) => {
        raw[i * 3] = p.x;
        raw[i * 3 + 1] = p.y;
        raw[i * 3 + 2] = p.z;
      });
      const dt = (tMs - lastT) / 1000;
      if (!x || !dx || points.length !== count || !(dt > 0)) {
        // A first frame, a changed point count or a non-advancing clock has no usable history.
        x = raw;
        dx = new Float64Array(raw.length);
        count = points.length;
      } else {
        const aD = alpha(dCutoff, dt);
        for (let i = 0; i < raw.length; i++) {
          const d = (raw[i] - x[i]) / dt;
          dx[i] += aD * (d - dx[i]);
          const a = alpha(minCutoff + beta * Math.abs(dx[i]), dt);
          x[i] += a * (raw[i] - x[i]);
        }
      }
      lastT = tMs;
      const out = x;
      return points.map((_, i) => ({ x: out[i * 3], y: out[i * 3 + 1], z: out[i * 3 + 2] }));
    },
    reset() {
      x = null;
      dx = null;
    },
  };
}
