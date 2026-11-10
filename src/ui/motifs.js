// @ts-check
/**
 * Codex motifs from DESIGN.md, built as SVG in the DOM. Colours come from CSS classes,
 * never from inline styles, so the CSP stays strict.
 */
import { svg, uniqueId } from './dom.js';

/**
 * Stepped fret (greca escalonada): the single header rule. One repeating unit, tiled by a pattern.
 * @returns {SVGElement}
 */
export function fretRule() {
  const id = uniqueId('fret');
  return svg(
    'svg',
    { class: 'fret', width: '100%', height: '18', 'aria-hidden': 'true', focusable: 'false' },
    svg(
      'defs',
      {},
      svg(
        'pattern',
        { id, width: '36', height: '18', patternUnits: 'userSpaceOnUse' },
        // A rising step followed by a squared hook, the classic xicalcoliuhqui rhythm.
        svg('path', { class: 'fret__line', d: 'M0 15 H6 V11 H11 V7 H16 V3 H30 V12 H22 V7 H26' }),
      ),
    ),
    svg('rect', { class: 'fret__edge', x: '0', y: '0', width: '100%', height: '2' }),
    svg('rect', { class: 'fret__fill', x: '0', y: '0', width: '100%', height: '18', fill: `url(#${id})` }),
    svg('rect', { class: 'fret__edge', x: '0', y: '16', width: '100%', height: '2' }),
  );
}

/**
 * Speech scroll (voluta): the curl that means speech in the codices. Ochre inside an ink contour.
 * @param {{draw?: boolean}} [opts] draw: animate the curl drawing itself (400 ms)
 * @returns {SVGElement}
 */
export function speechScroll(opts = {}) {
  const d = 'M10 62 C 8 40, 20 18, 42 14 C 60 11, 68 28, 60 38 C 53 47, 40 42, 42 33 C 44 26, 53 28, 51 33';
  return svg(
    'svg',
    {
      class: ['voluta', opts.draw && 'voluta--draw'],
      viewBox: '0 0 72 72',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    svg('path', { class: 'voluta__ink', d, pathLength: '1' }),
    svg('path', { class: 'voluta__fill', d, pathLength: '1' }),
  );
}

/**
 * Places a speech scroll so it starts at a fingertip and curls away from the hand.
 * Position goes through CSS custom properties (CSSOM), which the CSP allows.
 * @param {Element} el the scroll's svg, styled with .voluta--anchored
 * @param {{x:number, y:number, side: 1|-1, w:number, h:number}|null} anchor CSS px within its container
 */
export function anchorScroll(el, anchor) {
  const node = /** @type {SVGElement} */ (el);
  node.classList.toggle('is-hidden', !anchor);
  if (!anchor) return;
  const size = node.getBoundingClientRect().width || 48;
  // Keep the curl inside the frame when the tip is near the top edge.
  const y = Math.max(anchor.y, size * 0.9);
  const flip = anchor.side < 0 ? true : anchor.x + size > anchor.w;
  node.classList.toggle('voluta--flip', flip);
  node.style.setProperty('--sx', `${anchor.x}px`);
  node.style.setProperty('--sy', `${y}px`);
}

/**
 * Maya bar-and-dot numeral (vigesimal, highest place on top). Decorative companion to the
 * plain number, which is always shown next to it, so it is hidden from assistive technology.
 * @param {number} value non-negative integer
 * @returns {SVGElement}
 */
export function barDotNumeral(value) {
  const n = Math.max(0, Math.floor(value));
  /** @type {number[]} */
  const places = [];
  let rest = n;
  do {
    places.unshift(rest % 20);
    rest = Math.floor(rest / 20);
  } while (rest > 0);

  const W = 30;
  const DOT_R = 3;
  const BAR_H = 6;
  const GAP = 3;
  const PLACE_GAP = 8;
  const SCALE = 1.2;
  /** @type {SVGElement[]} */
  const parts = [];
  let y = 0;
  places.forEach((digit, i) => {
    if (i > 0) y += PLACE_GAP;
    if (digit === 0) {
      // Zero drawn as a plain closed oval: a neutral mark, not a copied glyph.
      parts.push(svg('ellipse', { class: 'numeral__zero', cx: W / 2, cy: y + 5, rx: 11, ry: 4 }));
      y += 10;
      return;
    }
    const dots = digit % 5;
    const bars = Math.floor(digit / 5);
    if (dots) {
      const span = dots * DOT_R * 2 + (dots - 1) * GAP;
      let x = (W - span) / 2 + DOT_R;
      for (let k = 0; k < dots; k++) {
        parts.push(svg('circle', { class: 'numeral__mark', cx: x, cy: y + DOT_R, r: DOT_R }));
        x += DOT_R * 2 + GAP;
      }
      y += DOT_R * 2 + (bars ? GAP : 0);
    }
    for (let k = 0; k < bars; k++) {
      parts.push(svg('rect', { class: 'numeral__mark', x: 2, y, width: W - 4, height: BAR_H }));
      y += BAR_H + (k < bars - 1 ? GAP : 0);
    }
  });
  return svg(
    'svg',
    {
      class: 'numeral',
      viewBox: `-1 -1 ${W + 2} ${y + 2}`,
      // Fixed scale, so one dot stays dot-sized instead of stretching to the box.
      width: ((W + 2) * SCALE).toFixed(1),
      height: ((y + 2) * SCALE).toFixed(1),
      'aria-hidden': 'true',
      focusable: 'false',
    },
    ...parts,
  );
}

/**
 * Hold ring: an ochre band inside an ink contour that fills as the sign is held.
 * Progress is set with the CSS custom property --hold (0..1).
 * @returns {SVGElement}
 */
export function holdRing() {
  return svg(
    'svg',
    { class: 'hold-ring', viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false' },
    svg('circle', { class: 'hold-ring__ink', cx: 50, cy: 50, r: 44 }),
    svg('circle', { class: 'hold-ring__track', cx: 50, cy: 50, r: 44 }),
    svg('circle', { class: 'hold-ring__fill', cx: 50, cy: 50, r: 44, pathLength: '1' }),
  );
}
