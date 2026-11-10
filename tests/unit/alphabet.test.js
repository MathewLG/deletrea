// @ts-check
import test from 'node:test';
import assert from 'node:assert/strict';
import { ALPHABET, STATIC_IDS, VALIDATION_STATUS, getSign, wordToSigns } from '../../src/signs/alphabet.js';

const SOURCE_KEYS = ['DAK', 'CIC', 'CIC-Z', 'CIC-26', 'CRUZ', 'UAQ', 'UAEH', 'BUAP', 'MDPI', 'UV', 'PADI-26a', 'PADI-26b', 'PDI', 'MAN', 'AME', 'ROB', 'INDEPEDI', 'WIKI', 'LIFE'];

test('27 entries in alphabetical order with Ñ after N, 21 static', () => {
  assert.equal(ALPHABET.length, 27);
  assert.deepEqual(
    ALPHABET.map((s) => s.letter).join(''),
    'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
  );
  assert.equal(STATIC_IDS.length, 21);
  assert.deepEqual(
    ALPHABET.filter((s) => s.kind === 'dynamic').map((s) => s.id),
    ['j', 'k', 'enie', 'q', 'x', 'z'],
  );
  assert.equal(new Set(ALPHABET.map((s) => s.id)).size, 27);
  assert.equal(getSign('enie')?.letter, 'Ñ');
  assert.equal(VALIDATION_STATUS, 'sin validar');
});

test('every entry has description, confidence, sources and a well-formed pose', () => {
  for (const s of ALPHABET) {
    assert.ok(s.description.length > 20, s.id);
    assert.ok(!/[—–]/.test(s.description + (s.movement ?? '')), `${s.id} has a dash character`);
    assert.ok(['alta', 'media', 'baja'].includes(s.confidence), s.id);
    assert.ok(s.sources.length > 0 && s.sources.every((k) => SOURCE_KEYS.includes(k)), s.id);
    assert.equal(Boolean(s.movement), s.kind === 'dynamic', `${s.id} movement text`);
    for (const f of ['index', 'middle', 'ring', 'pinky']) {
      const p = /** @type {any} */ (s.pose)[f];
      assert.ok([p.mcp, p.pip, p.dip].every(Number.isFinite), `${s.id}.${f}`);
    }
    const t = s.pose.thumb;
    assert.ok([t.radial, t.palmar, t.mcp, t.ip].every(Number.isFinite), `${s.id}.thumb`);
    const o = s.orientation;
    assert.ok(Math.abs(o.palmar.x * o.distal.x + o.palmar.y * o.distal.y + o.palmar.z * o.distal.z) < 1e-6, `${s.id} orientation not orthogonal`);
  }
});

test('wordToSigns handles accents, ñ and unknown letters', () => {
  const r = wordToSigns('Ñandú José');
  assert.deepEqual(
    r.map((x) => x.char).join(''),
    'ñandujose',
  );
  assert.equal(r[0].sign?.id, 'enie');
  assert.ok(r.every((x) => x.sign !== null));
  assert.equal(r[4].sign?.id, 'u');

  // Decomposed input (n + combining tilde) is the same word.
  assert.equal(wordToSigns('Ño')[0].sign?.id, 'enie');

  const odd = wordToSigns('ß-1 a');
  assert.deepEqual(
    odd.map((x) => [x.char, x.sign?.id ?? null]),
    [
      ['ß', null],
      ['a', 'a'],
    ],
  );
  assert.deepEqual(wordToSigns(''), []);
});
