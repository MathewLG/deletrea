// @ts-check
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHoldDetector, createLandmarkSmoother } from '../../src/core/index.js';
import { mulberry32, uniform } from './helpers.js';

test('hold completes after holdMs of continuous ok', () => {
  const h = createHoldDetector({ holdMs: 700, graceMs: 180 });
  let last = { progress: 0, done: false };
  for (let t = 0; t <= 690; t += 30) {
    last = h.update(true, t);
    assert.equal(last.done, false, `done too early at ${t}`);
  }
  assert.ok(Math.abs(last.progress - 690 / 700) < 1e-9);
  last = h.update(true, 720);
  assert.deepEqual(last, { progress: 1, done: true });
});

/** Feeds frames every 30 ms over [from, to] and returns the last result. */
function run(/** @type {ReturnType<typeof createHoldDetector>} */ h, /** @type {number} */ from, /** @type {number} */ to, /** @type {boolean} */ ok) {
  let r = { progress: 0, done: false };
  for (let t = from; t <= to; t += 30) r = h.update(ok, t);
  return r;
}

test('a short gap pauses progress instead of counting it', () => {
  const h = createHoldDetector();
  run(h, 1000, 1330, true);
  assert.ok(Math.abs(h.update(true, 1350).progress - 350 / 700) < 1e-9);
  const inGap = run(h, 1380, 1500, false);
  assert.ok(Math.abs(inGap.progress - 350 / 700) < 1e-9, 'paused during the gap');
  // The first ok frame after a gap only restarts counting; the gap itself is not credited.
  assert.ok(Math.abs(h.update(true, 1520).progress - 350 / 700) < 1e-9);
  assert.equal(run(h, 1550, 1850, true).done, false);
  assert.equal(h.update(true, 1880).done, true);
});

test('only 520 ms of ok frames does not complete a 700 ms hold', () => {
  const h = createHoldDetector({ holdMs: 700, graceMs: 180 });
  // 0..300 ok (300 ms), a 150 ms dropout, then 450..670 ok (220 ms): 520 ms held, 800 ms of wall time.
  let r = run(h, 0, 300, true);
  r = h.update(false, 400);
  r = h.update(true, 450);
  for (let t = 470; t <= 670; t += 20) r = h.update(true, t);
  for (let t = 690; t <= 800; t += 20) r = h.update(false, t);
  assert.equal(r.done, false);
  assert.ok(Math.abs(r.progress - 520 / 700) < 1e-9, `progress ${r.progress}`);
});

test('completes at 5 fps with every frame ok', () => {
  const h = createHoldDetector({ holdMs: 700, graceMs: 180 });
  let r = { progress: 0, done: false };
  let t = 0;
  for (; t <= 5000 && !r.done; t += 200) r = h.update(true, t);
  assert.equal(r.done, true);
  // Each 200 ms step credits at most 100 ms.
  assert.equal(t - 200, 1400);
});

test('a gap longer than graceMs drops progress back to 0', () => {
  const h = createHoldDetector({ holdMs: 700, graceMs: 180 });
  run(h, 0, 390, true);
  assert.equal(run(h, 420, 600, false).progress, 0);
  assert.equal(h.update(true, 630).progress, 0);
  assert.equal(run(h, 660, 1320, true).done, false);
  assert.equal(run(h, 1350, 1350, true).done, true);
});

test('a long silence restarts the hold, with or without a not-ok frame in it', () => {
  const h = createHoldDetector({ holdMs: 700, graceMs: 180 });
  h.update(true, 0);
  h.update(true, 100);
  h.update(false, 133);
  assert.deepEqual(h.update(true, 1200), { progress: 0, done: false });

  // No frames at all, as when the page is hidden.
  const s = createHoldDetector({ holdMs: 700, graceMs: 180 });
  run(s, 0, 390, true);
  assert.deepEqual(s.update(true, 2000), { progress: 0, done: false });
});

test('hold reset clears a finished hold', () => {
  const h = createHoldDetector({ holdMs: 100 });
  h.update(true, 0);
  assert.equal(h.update(true, 100).done, true);
  h.reset();
  assert.deepEqual(h.update(false, 200), { progress: 0, done: false });
});

const frame = (/** @type {number} */ v) => Array.from({ length: 21 }, (_, i) => ({ x: v + i, y: -v, z: 2 * v }));

test('smoother passes the first frame through and converges on a still hand', () => {
  const s = createLandmarkSmoother();
  assert.deepEqual(s.push(frame(1), 0), frame(1));
  let out = frame(1);
  for (let t = 33; t < 3000; t += 33) out = s.push(frame(2), t);
  assert.ok(Math.abs(out[0].x - 2) < 1e-3 && Math.abs(out[20].z - 4) < 1e-3);
});

test('smoother removes jitter on a still hand but follows fast motion', () => {
  const rnd = mulberry32(5);
  const s = createLandmarkSmoother();
  let rawVar = 0;
  let outVar = 0;
  for (let k = 0; k < 300; k++) {
    const n = uniform(rnd, -0.01, 0.01);
    const out = s.push([{ x: n, y: 0, z: 0 }], k * 33);
    if (k > 30) {
      rawVar += n * n;
      outVar += out[0].x * out[0].x;
    }
  }
  assert.ok(outVar < rawVar / 4, `jitter not reduced: ${outVar} vs ${rawVar}`);

  // A fast move raises the cutoff (beta term), so the lag after 300 ms stays small.
  const f = createLandmarkSmoother();
  let out = f.push([{ x: 0, y: 0, z: 0 }], 0);
  for (let k = 1; k <= 10; k++) out = f.push([{ x: k * 10, y: 0, z: 0 }], k * 33);
  assert.ok(100 - out[0].x < 40, `lag ${100 - out[0].x}`);
});

test('smoother reset forgets history', () => {
  const s = createLandmarkSmoother();
  s.push(frame(0), 0);
  s.push(frame(0), 33);
  s.reset();
  assert.deepEqual(s.push(frame(5), 66), frame(5));
});
