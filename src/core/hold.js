// @ts-check

// A frame vouches for at most this much hold time, so a slow or stalled camera cannot finish a hold in a few frames.
const STEP_CAP_MS = 100;

/**
 * Counts how long a match has been held, forgiving short dropouts from the tracker.
 * Held time grows only between consecutive ok frames. A not-ok gap within the grace pauses progress;
 * a longer one resets it.
 * @param {{holdMs?: number, graceMs?: number}} [opts]
 * @returns {{ update(ok: boolean, tMs: number): {progress: number, done: boolean}, reset(): void }}
 */
export function createHoldDetector(opts = {}) {
  const holdMs = opts.holdMs ?? 700;
  const graceMs = opts.graceMs ?? 180;
  let held = 0;
  /** @type {number|null} time of the last ok frame */
  let lastOkT = null;
  let prevOk = false;
  let done = false;

  const result = () => ({ progress: done ? 1 : Math.min(held / holdMs, 0.999), done });

  return {
    update(ok, tMs) {
      if (done) return { progress: 1, done: true };
      if (ok) {
        if (lastOkT !== null) {
          const dt = Math.max(0, tMs - lastOkT);
          if (prevOk) {
            // Silence between two ok frames: the capped step is credited, the rest is unknown and counts as a gap.
            if (dt - STEP_CAP_MS > graceMs) held = 0;
            else held += Math.min(dt, STEP_CAP_MS);
          } else if (dt > graceMs) {
            held = 0;
          }
        }
        lastOkT = tMs;
        prevOk = true;
        if (held >= holdMs) done = true;
      } else {
        prevOk = false;
        if (lastOkT !== null && tMs - lastOkT > graceMs) {
          held = 0;
          lastOkT = null;
        }
      }
      return result();
    },
    reset() {
      held = 0;
      lastOkT = null;
      prevOk = false;
      done = false;
    },
  };
}
