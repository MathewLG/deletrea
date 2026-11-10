import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, luminance, parseHex, parseTokens } from '../../scripts/contrast.mjs';

test('black on white is 21:1', () => {
  assert.equal(contrastRatio('#000000', '#ffffff').toFixed(2), '21.00');
});

test('#777777 on white is 4.48:1 (just under AA)', () => {
  assert.equal(contrastRatio('#777777', '#ffffff').toFixed(2), '4.48');
});

test('ratio is symmetric and identical colors give 1:1', () => {
  assert.equal(contrastRatio('#123456', '#fedcba'), contrastRatio('#fedcba', '#123456'));
  assert.equal(contrastRatio('#abcdef', '#abcdef'), 1);
});

test('luminance extremes and short hex', () => {
  assert.equal(luminance('#000'), 0);
  assert.equal(luminance('#fff'), 1);
  assert.deepEqual(parseHex('#f0a'), [255, 0, 170]);
});

test('invalid hex throws', () => {
  assert.throws(() => parseHex('#12'), /Invalid hex/);
});

test('parseTokens reads custom properties', () => {
  const t = parseTokens(':root { --paper: #F3EADA; --ink: #1E1916; --size: 4px; }');
  assert.deepEqual(t, { '--paper': '#F3EADA', '--ink': '#1E1916' });
});
