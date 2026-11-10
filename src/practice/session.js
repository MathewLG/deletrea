// @ts-check
/**
 * Practice session controller (SPEC section 10). Pure: no DOM, testable in Node.
 */
import { buildTarget, createHoldDetector, createLandmarkSmoother, extractFeatures, matchSign } from '../core/index.js';

/** @typedef {import('../signs/alphabet.js').Sign} Sign */
/** @typedef {import('../core/index.js').MatchResult} MatchResult */
/** @typedef {import('../core/index.js').Hint} Hint */
/** @typedef {import('../core/index.js').Target} Target */
/** @typedef {import('../sources/camera.js').HandFrame} HandFrame */
/** @typedef {'no-hand'|'adjusting'|'holding'|'success'|'observe'|'finished'} Phase */
/**
 * @typedef {Object} Tally
 * @property {string[]} done       static letters held correctly
 * @property {string[]} skipped
 * @property {string[]} observed   letters with movement that were shown, never scored
 */
/**
 * @typedef {Object} SessionView
 * @property {Phase} phase
 * @property {MatchResult|null} match
 * @property {number} hold            0..1
 * @property {Hint|null} hint
 * @property {Tally} tally
 * @property {import('../core/index.js').Features|null} [features]   for the ?debug=1 overlay
 */

/**
 * Matches against the target, trying both sides when the hand's shape cannot tell them apart.
 * The tracker's left/right label is not used: the docs disagree on whether it assumes a mirrored image.
 * @param {import('../core/vec.js').Vec3[]} world
 * @param {Target} target
 * @returns {{features: import('../core/index.js').Features, match: MatchResult}|null}
 */
export function matchEitherSide(world, target) {
  const features = extractFeatures(world, null);
  if (!features) return null;
  const first = { features, match: matchSign(features, target) };
  if (features.handednessConfident) return first;
  const otherSide = features.handedness === 'right' ? 'left' : 'right';
  const otherFeatures = /** @type {import('../core/index.js').Features} */ (extractFeatures(world, null, { force: otherSide }));
  const second = { features: otherFeatures, match: matchSign(otherFeatures, target) };
  if (second.match.ok !== first.match.ok) return second.match.ok ? second : first;
  return second.match.score > first.match.score ? second : first;
}

/**
 * @param {{signs: Sign[], now?: () => number, holdMs?: number, graceMs?: number}} opts
 */
export function createSession({ signs, now = () => Date.now(), holdMs, graceMs }) {
  if (!Array.isArray(signs) || signs.length === 0) throw new Error('createSession needs at least one sign');
  const smoother = createLandmarkSmoother();
  const hold = createHoldDetector({ holdMs, graceMs });
  /** @type {Map<string, Target>} */
  const targets = new Map();
  let index = 0;
  let finished = false;
  let succeeded = false;
  /** @type {Tally} */
  let tally = { done: [], skipped: [], observed: [] };

  /** @param {Sign} sign */
  const targetFor = (sign) => {
    let t = targets.get(sign.id);
    if (!t) {
      t = buildTarget(sign);
      targets.set(sign.id, t);
    }
    return t;
  };

  function resetLetter() {
    smoother.reset();
    hold.reset();
    succeeded = false;
  }

  function advance() {
    resetLetter();
    if (index + 1 >= signs.length) finished = true;
    else index++;
  }

  const copyTally = () => ({ done: [...tally.done], skipped: [...tally.skipped], observed: [...tally.observed] });

  /**
   * @param {Phase} phase @param {Partial<SessionView>} [rest]
   * @returns {SessionView}
   */
  const view = (phase, rest = {}) => ({ phase, match: null, hold: 0, hint: null, ...rest, tally: copyTally() });

  return {
    current() {
      return { index, total: signs.length, sign: signs[index] };
    },

    /** @param {HandFrame} frame @returns {SessionView} */
    onFrame(frame) {
      if (finished) return view('finished');
      const sign = signs[index];
      if (sign.kind === 'dynamic') return view('observe');
      const t = Number.isFinite(frame?.t) ? frame.t : now();
      if (!frame?.world) {
        smoother.reset();
        if (succeeded) return view('success', { hold: 1 });
        hold.update(false, t);
        return view('no-hand');
      }
      const smoothed = smoother.push(frame.world, t);
      const best = matchEitherSide(smoothed, targetFor(sign));
      if (!best) {
        if (succeeded) return view('success', { hold: 1 });
        hold.update(false, t);
        return view('no-hand');
      }
      const { features, match } = best;
      // Keep matching after success so the live hand keeps its finger colours until the screen advances.
      if (succeeded) return view('success', { match, hold: 1, features });
      const h = hold.update(match.ok, t);
      if (h.done) {
        succeeded = true;
        if (!tally.done.includes(sign.id)) tally.done.push(sign.id);
        return view('success', { match, hold: 1, features });
      }
      return view(match.ok || h.progress > 0 ? 'holding' : 'adjusting', {
        match,
        hold: h.progress,
        hint: match.ok ? null : match.hint,
        features,
      });
    },

    /** The current state without a new frame (for rendering after skip/next). @returns {SessionView} */
    peek() {
      if (finished) return view('finished');
      const sign = signs[index];
      if (sign.kind === 'dynamic') return view('observe');
      if (succeeded) return view('success', { hold: 1 });
      return view('no-hand');
    },

    skip() {
      if (finished) return;
      const id = signs[index].id;
      if (!succeeded && !tally.skipped.includes(id)) tally.skipped.push(id);
      advance();
    },

    next() {
      if (finished) return;
      const sign = signs[index];
      if (sign.kind === 'dynamic' && !tally.observed.includes(sign.id)) tally.observed.push(sign.id);
      advance();
    },

    /** End early: whatever was not reached stays out of the tally. */
    finish() {
      if (finished) return;
      const sign = signs[index];
      if (succeeded && !tally.done.includes(sign.id)) tally.done.push(sign.id);
      resetLetter();
      finished = true;
    },

    restart() {
      index = 0;
      finished = false;
      tally = { done: [], skipped: [], observed: [] };
      resetLetter();
    },

    isFinished: () => finished,
  };
}
