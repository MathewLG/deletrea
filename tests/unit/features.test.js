// @ts-check
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFeatures, poseToLandmarks, placeHand, viewToCamera } from '../../src/core/index.js';
import { distance } from '../../src/core/vec.js';
import { mulberry32, randomPose, randomRotation, rotate, uniform } from './helpers.js';

const FRONT = { palmar: { x: 0, y: 0, z: 1 }, distal: { x: 0, y: 1, z: 0 } };

/** @param {import('../../src/core/features.js').Features} a @param {import('../../src/core/features.js').Features} b */
function assertSameShape(a, b, tol = 1e-6) {
  a.local.forEach((p, i) => assert.ok(distance(p, b.local[i]) < tol, `landmark ${i} moved by ${distance(p, b.local[i])}`));
  for (const name of /** @type {const} */ (['index', 'middle', 'ring', 'pinky'])) {
    for (const j of /** @type {const} */ (['mcp', 'pip', 'dip'])) {
      assert.ok(Math.abs(a.angles[name][j] - b.angles[name][j]) < 1e-4, `${name}.${j}`);
    }
  }
  assert.ok(Math.abs(a.angles.thumb.mcp - b.angles.thumb.mcp) < 1e-4);
  assert.ok(Math.abs(a.angles.thumb.ip - b.angles.thumb.ip) < 1e-4);
}

test('returns null for anything that is not 21 finite points', () => {
  assert.equal(extractFeatures([]), null);
  const pts = viewToCamera(placeHand(poseToLandmarks(randomPose(mulberry32(9))), FRONT));
  assert.equal(extractFeatures(pts.slice(0, 20)), null);
  assert.equal(extractFeatures(pts.map((p, i) => (i === 7 ? { ...p, y: NaN } : p))), null);
});

test('features are invariant to rotation, translation and uniform scale', () => {
  const rnd = mulberry32(2024);
  for (let i = 0; i < 40; i++) {
    const pose = randomPose(rnd);
    const base = viewToCamera(placeHand(poseToLandmarks(pose), FRONT));
    const ref = extractFeatures(base, 'right');
    assert.ok(ref);
    const r = randomRotation(rnd);
    const s = uniform(rnd, 0.3, 3);
    const t = { x: uniform(rnd, -1, 1), y: uniform(rnd, -1, 1), z: uniform(rnd, -1, 1) };
    const moved = base.map((p) => {
      const q = rotate(r, p);
      return { x: q.x * s + t.x, y: q.y * s + t.y, z: q.z * s + t.z };
    });
    const f = extractFeatures(moved, 'right');
    assert.ok(f);
    assert.equal(f.handedness, ref.handedness);
    assertSameShape(f, ref);
  }
});

test('a mirrored hand is detected as left and has the same canonical shape', () => {
  const rnd = mulberry32(77);
  for (let i = 0; i < 40; i++) {
    const pose = randomPose(rnd);
    // Random poses always carry some curl, which is what the handedness test reads.
    const right = viewToCamera(placeHand(poseToLandmarks(pose), FRONT));
    const left = right.map((p) => ({ x: -p.x, y: p.y, z: p.z }));
    const fr = extractFeatures(right, null);
    const fl = extractFeatures(left, null);
    assert.ok(fr && fl);
    assert.equal(fr.handedness, 'right');
    assert.equal(fl.handedness, 'left');
    assertSameShape(fl, fr);
    assert.ok(distance(fl.orientation.palmar, fr.orientation.palmar) < 1e-6);
    assert.ok(distance(fl.orientation.distal, fr.orientation.distal) < 1e-6);
  }
});

test('handedness falls back to the hint when the hand is flat', () => {
  const flat = {
    thumb: { radial: 90, palmar: -5, mcp: 0, ip: 0 },
    index: { mcp: 0, pip: 0, dip: 0 },
    middle: { mcp: 0, pip: 0, dip: 0 },
    ring: { mcp: 0, pip: 0, dip: 0 },
    pinky: { mcp: 0, pip: 0, dip: 0 },
  };
  const pts = viewToCamera(placeHand(poseToLandmarks(flat), FRONT));
  assert.equal(extractFeatures(pts, 'left')?.handedness, 'left');
  assert.equal(extractFeatures(pts, null)?.handedness, 'right');
});
