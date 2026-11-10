// @ts-check
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTarget, extractFeatures, matchSign, poseToLandmarks, placeHand, viewToCamera } from '../../src/core/index.js';
import { ALPHABET, STATIC_IDS, getSign } from '../../src/signs/alphabet.js';
import { mulberry32, poseToCamera, uniform } from './helpers.js';

/** @typedef {import('../../src/signs/alphabet.js').Sign} Sign */
/** @typedef {import('../../src/core/handModel.js').HandPose} HandPose */

const STATIC = ALPHABET.filter((s) => s.kind === 'static');
const TARGETS = new Map(STATIC.map((s) => [s.id, buildTarget(s)]));

/** @param {string} id */
const sign = (id) => /** @type {Sign} */ (getSign(id));

/** @param {HandPose} pose @param {import('../../src/core/handModel.js').Orientation} o @param {'right'|'left'} [hand] */
const features = (pose, o, hand = 'right') => {
  const f = extractFeatures(poseToCamera(pose, o, hand), hand);
  assert.ok(f);
  return f;
};

test('every static sign matches its own pose, right and left hand', () => {
  for (const s of STATIC) {
    for (const hand of /** @type {const} */ (['right', 'left'])) {
      const r = matchSign(features(s.pose, s.orientation, hand), /** @type {any} */ (TARGETS.get(s.id)));
      assert.ok(r.ok, `${s.letter} (${hand}) not ok: ${JSON.stringify(r.fingers)} ${JSON.stringify(r.orientation)}`);
      assert.ok(r.score >= 0.95, `${s.letter} (${hand}) score ${r.score}`);
      assert.equal(r.hint, null);
    }
  }
});

test('every static sign rejects every other static sign except declared confusables', () => {
  /** @type {string[]} */
  const confusions = [];
  /** @type {string[]} */
  const undeclared = [];
  for (const a of STATIC) {
    for (const b of STATIC) {
      if (a === b) continue;
      const r = matchSign(features(b.pose, b.orientation), /** @type {any} */ (TARGETS.get(a.id)));
      if (!r.ok) continue;
      confusions.push(`${b.letter}→${a.letter}`);
      if (!(a.confusable ?? []).includes(b.id)) undeclared.push(`${b.letter} accepted as ${a.letter}`);
    }
  }
  console.log(`confusions (pose→target): ${confusions.length ? confusions.join(', ') : 'none'}`);
  assert.deepEqual(undeclared, []);
});

test('confusable lists are symmetric and only name static signs', () => {
  for (const s of ALPHABET) {
    for (const other of s.confusable ?? []) {
      assert.ok(STATIC_IDS.includes(other), `${s.id} lists unknown ${other}`);
      assert.ok((sign(other).confusable ?? []).includes(s.id), `${other} does not list ${s.id}`);
    }
  }
});

/** @param {HandPose} pose @param {() => number} rnd @param {number} deg @returns {HandPose} */
function jitterPose(pose, rnd, deg) {
  const n = () => uniform(rnd, -deg, deg);
  /** @param {import('../../src/core/handModel.js').FingerPose} f */
  const finger = (f) => ({ mcp: f.mcp + n(), pip: f.pip + n(), dip: f.dip + n(), spread: (f.spread ?? 0) + n() });
  const t = pose.thumb;
  return {
    thumb: { radial: t.radial + n(), palmar: t.palmar + n(), mcp: t.mcp + n(), ip: t.ip + n(), roll: (t.roll ?? 0) + n() },
    index: finger(pose.index),
    middle: finger(pose.middle),
    ring: finger(pose.ring),
    pinky: finger(pose.pinky),
  };
}

test('static signs survive ±8° joint noise and 1.5% landmark jitter in 95% of 200 trials', () => {
  const rnd = mulberry32(1234);
  /** @type {string[]} */
  const report = [];
  for (const s of STATIC) {
    const target = /** @type {any} */ (TARGETS.get(s.id));
    let ok = 0;
    for (let i = 0; i < 200; i++) {
      const hand = i % 2 ? 'left' : 'right';
      const view = placeHand(poseToLandmarks(jitterPose(s.pose, rnd, 8)), s.orientation, { handedness: hand });
      const noisy = view.map((p) => ({
        x: p.x + uniform(rnd, -0.015, 0.015),
        y: p.y + uniform(rnd, -0.015, 0.015),
        z: p.z + uniform(rnd, -0.015, 0.015),
      }));
      const f = extractFeatures(viewToCamera(noisy), hand);
      if (f && matchSign(f, target).ok) ok++;
    }
    report.push(`${s.letter} ${ok}`);
    assert.ok(ok >= 190, `${s.letter}: only ${ok}/200 ok`);
  }
  console.log(`noise pass counts /200: ${report.join(', ')}`);
});

// A pair counts as confusable when a noisy pose of one passes as the other often enough that a learner would notice.
test('pairs confused under noise more than 10% of the time are declared confusable', () => {
  const rnd = mulberry32(99);
  /** @type {string[]} */
  const rates = [];
  /** @type {string[]} */
  const undeclared = [];
  for (const b of STATIC) {
    const samples = [];
    for (let i = 0; i < 200; i++) {
      const view = placeHand(poseToLandmarks(jitterPose(b.pose, rnd, 8)), b.orientation);
      const noisy = view.map((p) => ({
        x: p.x + uniform(rnd, -0.015, 0.015),
        y: p.y + uniform(rnd, -0.015, 0.015),
        z: p.z + uniform(rnd, -0.015, 0.015),
      }));
      samples.push(extractFeatures(viewToCamera(noisy), 'right'));
    }
    for (const a of STATIC) {
      if (a === b) continue;
      const target = /** @type {any} */ (TARGETS.get(a.id));
      const hits = samples.filter((f) => f && matchSign(f, target).ok).length;
      if (!hits) continue;
      rates.push(`${b.letter}→${a.letter} ${((100 * hits) / 200).toFixed(0)}%`);
      if (hits > 20 && !(a.confusable ?? []).includes(b.id)) undeclared.push(`${b.letter}→${a.letter}`);
    }
  }
  console.log(`noisy cross-acceptance (pose→target): ${rates.join(', ') || 'none'}`);
  assert.deepEqual(undeclared, []);
});

test('hints point at the useful correction', () => {
  const a = sign('a');
  const open = {
    thumb: { radial: 45, palmar: 10, mcp: 0, ip: 0 },
    index: { mcp: 0, pip: 0, dip: 0, spread: 15 },
    middle: { mcp: 0, pip: 0, dip: 0, spread: 2 },
    ring: { mcp: 0, pip: 0, dip: 0, spread: -10 },
    pinky: { mcp: 0, pip: 0, dip: 0, spread: -24 },
  };
  const rOpen = matchSign(features(open, a.orientation), /** @type {any} */ (TARGETS.get('a')));
  assert.equal(rOpen.ok, false);
  assert.ok(rOpen.hint);
  assert.ok(['index', 'middle', 'ring', 'pinky'].includes(rOpen.hint.finger ?? ''), JSON.stringify(rOpen.hint));
  assert.ok(['curl_more', 'bend_knuckle', 'bend_tip'].includes(rOpen.hint.code), JSON.stringify(rOpen.hint));

  const v = sign('v');
  const rVU = matchSign(features(v.pose, v.orientation), /** @type {any} */ (TARGETS.get('u')));
  assert.equal(rVU.ok, false);
  assert.deepEqual(rVU.hint, { code: 'together', finger: 'index', other: 'middle' });

  const b = sign('b');
  const away = { palmar: { x: 0, y: 0, z: -1 }, distal: { x: 0, y: 1, z: 0 } };
  const rAway = matchSign(features(b.pose, away), /** @type {any} */ (TARGETS.get('b')));
  assert.equal(rAway.ok, false);
  assert.equal(rAway.hint?.code, 'palm_to_camera');

  const u = sign('u');
  const rUV = matchSign(features(u.pose, u.orientation), /** @type {any} */ (TARGETS.get('v')));
  assert.equal(rUV.hint?.code, 'apart');

  const sideways = { palmar: { x: 0, y: 0, z: 1 }, distal: { x: 1, y: 0, z: 0 } };
  const rSide = matchSign(features(b.pose, sideways), /** @type {any} */ (TARGETS.get('b')));
  assert.equal(rSide.hint?.code, 'point_up');

  const s = sign('s');
  const rSA = matchSign(features(s.pose, s.orientation), /** @type {any} */ (TARGETS.get('a')));
  assert.equal(rSA.ok, false);
  assert.equal(rSA.hint?.finger, 'thumb');
  assert.match(rSA.hint?.code ?? '', /^thumb_/);
});

test('score is the mean of six part scores', () => {
  const b = sign('b');
  const r = matchSign(features(sign('d').pose, b.orientation), /** @type {any} */ (TARGETS.get('b')));
  const parts = Object.values(r.fingers).reduce((s, p) => s + p.score, 0) + r.orientation.score;
  assert.ok(Math.abs(r.score - parts / 6) < 1e-12);
});

test('B with only the pinky curled gives a curl hint on the pinky, not a thumb hint', () => {
  const b = sign('b');
  const pose = { ...b.pose, pinky: { ...b.pose.pinky, mcp: 70, pip: 90, dip: 50 } };
  const r = matchSign(features(pose, b.orientation), /** @type {any} */ (TARGETS.get('b')));
  assert.equal(r.ok, false);
  assert.equal(r.hint?.finger, 'pinky', JSON.stringify(r.hint));
  assert.ok(['curl_less', 'straighten_knuckle', 'straighten_tip'].includes(r.hint?.code ?? ''), JSON.stringify(r.hint));
});
