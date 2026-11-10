// @ts-check
import test from 'node:test';
import assert from 'node:assert/strict';
import { poseToLandmarks, placeHand, viewToCamera, lerpPose, FINGER_LANDMARKS } from '../../src/core/index.js';
import { extractFeatures } from '../../src/core/features.js';
import { NATURAL_SPREAD } from '../../src/signs/poses.js';
import { distance } from '../../src/core/vec.js';
import { mulberry32, randomPose } from './helpers.js';

const CHAINS = Object.values(FINGER_LANDMARKS).map((ix) => [ix[0] === 1 ? 1 : ix[0], ...ix.slice(1)]);

/** @param {import('../../src/core/vec.js').Vec3[]} pts */
const boneLengths = (pts) => CHAINS.flatMap((c) => c.slice(1).map((k, i) => distance(pts[c[i]], pts[k])));

test('hand model returns 21 finite points', () => {
  const pts = poseToLandmarks(randomPose(mulberry32(1)));
  assert.equal(pts.length, 21);
  for (const p of pts) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
});

test('bone lengths are identical across 50 random poses', () => {
  const rnd = mulberry32(42);
  const ref = boneLengths(poseToLandmarks(randomPose(rnd)));
  assert.deepEqual(
    ref.map((l) => Math.round(l * 100) / 100),
    [0.42, 0.33, 0.27, 0.42, 0.25, 0.2, 0.46, 0.29, 0.21, 0.43, 0.27, 0.2, 0.33, 0.2, 0.18],
  );
  for (let i = 0; i < 50; i++) {
    const lens = boneLengths(poseToLandmarks(randomPose(rnd)));
    lens.forEach((l, k) => assert.ok(Math.abs(l - ref[k]) < 1e-9, `bone ${k} changed length`));
  }
});

test('open hand measures under 5 degrees at every joint', () => {
  const s = NATURAL_SPREAD;
  const pose = {
    thumb: { radial: 40, palmar: 10, mcp: 0, ip: 0 },
    index: { mcp: 0, pip: 0, dip: 0, spread: s.index },
    middle: { mcp: 0, pip: 0, dip: 0, spread: s.middle },
    ring: { mcp: 0, pip: 0, dip: 0, spread: s.ring },
    pinky: { mcp: 0, pip: 0, dip: 0, spread: s.pinky },
  };
  const front = { palmar: { x: 0, y: 0, z: 1 }, distal: { x: 0, y: 1, z: 0 } };
  const f = extractFeatures(viewToCamera(placeHand(poseToLandmarks(pose), front)), 'right');
  assert.ok(f);
  for (const [name, a] of Object.entries(f.angles)) {
    for (const [joint, deg] of Object.entries(a)) assert.ok(deg < 5, `${name}.${joint} = ${deg.toFixed(2)}`);
  }
});

test('lerpPose hits both ends', () => {
  const rnd = mulberry32(3);
  const a = randomPose(rnd);
  const b = randomPose(rnd);
  assert.deepEqual(poseToLandmarks(lerpPose(a, b, 0)), poseToLandmarks(a));
  const end = poseToLandmarks(lerpPose(a, b, 1));
  poseToLandmarks(b).forEach((p, i) => assert.ok(distance(p, end[i]) < 1e-9));
});
