import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, matchEitherSide } from '../../src/practice/session.js';
import { buildTarget, extractFeatures } from '../../src/core/index.js';
import { poseToCamera } from './helpers.js';
import { ALPHABET, getSign } from '../../src/signs/alphabet.js';
import { OPEN_HAND, synthesize, wrongPose } from '../../src/sources/synthetic.js';

/** @typedef {import('../../src/signs/alphabet.js').Sign} Sign */

/** @param {string} id */
const sign = (id) => {
  const s = getSign(id);
  assert.ok(s, `sign ${id} exists`);
  return /** @type {Sign} */ (s);
};

/** @param {import('../../src/core/index.js').HandPose} pose @param {Sign} s @param {number} t */
const frame = (pose, s, t) => ({ t, world: synthesize(pose, s.orientation).world, image: null, handedness: /** @type {'right'} */ ('right') });

/**
 * Feeds frames at 30 fps and returns every view.
 * @param {ReturnType<typeof createSession>} session
 * @param {(t: number) => import('../../src/sources/camera.js').HandFrame} make
 * @param {number} fromMs @param {number} toMs
 */
function feed(session, make, fromMs, toMs) {
  const views = [];
  for (let t = fromMs; t <= toMs; t += 33) views.push(session.onFrame(make(t)));
  return views;
}

test('a held correct pose reaches success and counts as done', () => {
  const s = sign('b');
  const session = createSession({ signs: [s, sign('l')] });
  const views = feed(session, (t) => frame(s.pose, s, t), 0, 1500);
  const phases = new Set(views.map((v) => v.phase));
  assert.ok(phases.has('holding'), 'passes through holding');
  const last = views[views.length - 1];
  assert.equal(last.phase, 'success');
  assert.equal(last.hold, 1);
  assert.deepEqual(last.tally.done, ['b']);
  // Success persists until next(), and keeps matching so the live hand stays coloured.
  const after = session.onFrame(frame(s.pose, s, 1600));
  assert.equal(after.phase, 'success');
  assert.equal(after.hold, 1);
  assert.ok(after.match?.ok, 'match still reported in success');
  session.next();
  assert.equal(session.current().sign.id, 'l');
  assert.equal(session.current().index, 1);
});

test('holding needs time: a single correct frame is not success', () => {
  const s = sign('v');
  const session = createSession({ signs: [s] });
  const v = session.onFrame(frame(s.pose, s, 0));
  assert.notEqual(v.phase, 'success');
});

test('a wrong pose gives adjusting with a hint and no success', () => {
  const s = sign('b');
  const session = createSession({ signs: [s] });
  const wrong = wrongPose(s);
  const views = feed(session, (t) => frame(wrong, s, t), 0, 1500);
  const last = views[views.length - 1];
  assert.equal(last.phase, 'adjusting');
  assert.ok(last.hint, 'hint present');
  assert.equal(typeof last.hint.code, 'string');
  assert.ok(last.match && !last.match.ok);
  assert.ok(views.every((v) => v.phase !== 'success'));
});

test('an open hand against A gives a hint', () => {
  const s = sign('a');
  const session = createSession({ signs: [s] });
  const views = feed(session, (t) => frame(OPEN_HAND, s, t), 0, 600);
  assert.ok(views[views.length - 1].hint);
});

test('no hand gives no-hand and resets the hold', () => {
  const s = sign('b');
  const session = createSession({ signs: [s] });
  feed(session, (t) => frame(s.pose, s, t), 0, 400);
  const v = session.onFrame({ t: 433, world: null, image: null, handedness: null });
  assert.equal(v.phase, 'no-hand');
  assert.equal(v.hold, 0);
  // After a long gap the hold starts over instead of completing immediately.
  const again = session.onFrame(frame(s.pose, s, 1200));
  assert.notEqual(again.phase, 'success');
});

test('skip records the letter and moves on', () => {
  const session = createSession({ signs: [sign('a'), sign('b')] });
  session.skip();
  assert.equal(session.current().sign.id, 'b');
  assert.deepEqual(session.peek().tally.skipped, ['a']);
});

test('dynamic letters go to observe and are never scored', () => {
  const j = sign('j');
  assert.equal(j.kind, 'dynamic');
  const session = createSession({ signs: [j, sign('b')] });
  const views = feed(session, (t) => frame(j.pose, j, t), 0, 1500);
  assert.ok(views.every((v) => v.phase === 'observe'));
  assert.ok(views.every((v) => v.match === null));
  session.next();
  const v = session.peek();
  assert.deepEqual(v.tally.observed, ['j']);
  assert.deepEqual(v.tally.done, []);
});

test('finishing a session gives the right tally', () => {
  const [a, j, b, l] = [sign('a'), sign('j'), sign('b'), sign('l')];
  const session = createSession({ signs: [a, j, b, l] });
  // A: held correctly.
  let t = 0;
  let views = feed(session, (tt) => frame(a.pose, a, tt), t, t + 1500);
  assert.equal(views[views.length - 1].phase, 'success');
  session.next();
  // J: observed.
  assert.equal(session.onFrame(frame(j.pose, j, 1600)).phase, 'observe');
  session.next();
  // B: skipped.
  session.skip();
  // L: held correctly, then the session ends.
  t = 5000;
  views = feed(session, (tt) => frame(l.pose, l, tt), t, t + 1500);
  assert.equal(views[views.length - 1].phase, 'success');
  session.next();
  const end = session.onFrame(frame(l.pose, l, 7000));
  assert.equal(end.phase, 'finished');
  assert.deepEqual(end.tally, { done: ['a', 'l'], skipped: ['b'], observed: ['j'] });
  assert.equal(session.isFinished(), true);
});

test('finish() ends early and restart() clears everything', () => {
  const session = createSession({ signs: [sign('a'), sign('b'), sign('c')] });
  session.skip();
  session.finish();
  assert.equal(session.peek().phase, 'finished');
  assert.deepEqual(session.peek().tally.skipped, ['a']);
  session.restart();
  assert.equal(session.current().index, 0);
  assert.deepEqual(session.peek().tally, { done: [], skipped: [], observed: [] });
});

test('every static sign reaches success from its own pose', () => {
  for (const s of ALPHABET.filter((x) => x.kind === 'static')) {
    const session = createSession({ signs: [s] });
    const views = feed(session, (t) => frame(s.pose, s, t), 0, 1500);
    assert.equal(views[views.length - 1].phase, 'success', `letter ${s.letter}`);
  }
});

test('rejects an empty sign list', () => {
  assert.throws(() => createSession({ signs: [] }));
});

test('the success frame itself carries the match with hold 1', () => {
  const s = sign('b');
  const session = createSession({ signs: [s] });
  const views = feed(session, (t) => frame(s.pose, s, t), 0, 1500);
  const first = views.find((v) => v.phase === 'success');
  assert.ok(first);
  assert.equal(first.hold, 1);
  assert.ok(first.match?.ok);
  for (const v of views.slice(views.indexOf(first))) {
    assert.equal(v.phase, 'success');
    assert.ok(v.match?.ok);
    assert.equal(v.hold, 1);
  }
  // Losing the hand during success keeps success but has nothing to colour.
  const gone = session.onFrame({ t: 1600, world: null, image: null, handedness: null });
  assert.equal(gone.phase, 'success');
  assert.equal(gone.match, null);
});

test('a B pose passes as a right or a left hand whatever the tracker label says', () => {
  const b = sign('b');
  const target = buildTarget(b);
  for (const hand of /** @type {const} */ (['right', 'left'])) {
    const world = poseToCamera(b.pose, b.orientation, hand);
    const f = extractFeatures(world, null);
    assert.ok(f && !f.handednessConfident, `${hand}: a flat B should be inconclusive by shape`);
    const best = matchEitherSide(world, target);
    assert.ok(best?.match.ok, `${hand}: matchEitherSide not ok`);
    for (const label of /** @type {const} */ (['right', 'left', null])) {
      const session = createSession({ signs: [b] });
      let last = session.onFrame({ t: 0, world, image: null, handedness: label });
      for (let t = 33; t <= 1500; t += 33) last = session.onFrame({ t, world, image: null, handedness: label });
      assert.equal(last.phase, 'success', `${hand} hand with label ${label}`);
    }
  }
});

test('a curled hand uses the side its shape shows, not the label', () => {
  const a = sign('a');
  const world = poseToCamera(a.pose, a.orientation, 'left');
  const f = extractFeatures(world, 'right');
  assert.ok(f?.handednessConfident);
  assert.equal(f?.handedness, 'left');
  assert.equal(extractFeatures(world, 'right', { force: 'right' })?.handedness, 'right');
});

test('a session completes at 5 fps', () => {
  const s = sign('b');
  const session = createSession({ signs: [s] });
  let last = session.onFrame(frame(s.pose, s, 0));
  for (let t = 200; t <= 3000 && last.phase !== 'success'; t += 200) last = session.onFrame(frame(s.pose, s, t));
  assert.equal(last.phase, 'success');
});
