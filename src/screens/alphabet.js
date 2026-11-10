// @ts-check
import { createHandView } from '../render/handView.js';
import { signView } from '../render/signPose.js';
import { ALPHABET } from '../signs/alphabet.js';
import { h } from '../ui/dom.js';
import { S } from '../ui/strings.js';
import { letterHref, screenTitle, validationNotice } from './shared.js';

/** @type {import('./shared.js').Screen} */
export function alphabetScreen(root) {
  /** @type {Map<Element, import('../signs/alphabet.js').Sign>} */
  const pending = new Map();
  /** @type {ReturnType<typeof createHandView>[]} */
  const views = [];

  const grid = h(
    'ul',
    { class: 'alpha-grid', 'data-testid': 'alphabet-grid' },
    ALPHABET.map((sign) => {
      const moving = sign.kind === 'dynamic';
      const canvas = h('canvas', { class: 'alpha-cell__hand', 'aria-hidden': 'true' });
      pending.set(canvas, sign);
      return h(
        'li',
        { class: 'alpha-grid__item' },
        h(
          'a',
          {
            class: 'alpha-cell',
            href: letterHref(sign.id),
            'data-testid': `letter-cell-${sign.id}`,
            'aria-label': S.alphabet.cellLabel(sign.letter, moving),
          },
          h('span', { class: 'alpha-cell__letter', text: sign.letter }),
          canvas,
          moving ? h('span', { class: 'tag', text: S.alphabet.moving }) : null,
        ),
      );
    }),
  );

  root.append(
    h(
      'div',
      { class: 'cells cells--wide' },
      h(
        'div',
        { class: 'cell cell--title' },
        screenTitle(S.alphabet.h1),
        h('p', { class: 'lead', text: S.alphabet.lead }),
        h('p', { class: 'quiet', text: S.alphabet.mirror }),
      ),
      h('div', { class: 'cell cell--flush' }, grid),
      validationNotice(),
    ),
  );

  // Draw each small hand only when its cell scrolls into view.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const sign = pending.get(e.target);
        if (!sign) continue;
        pending.delete(e.target);
        io.unobserve(e.target);
        const view = createHandView(/** @type {HTMLCanvasElement} */ (e.target), { mirror: true, minBox: 2.2 });
        view.setLandmarks(signView(sign));
        views.push(view);
      }
    },
    { rootMargin: '200px 0px' },
  );
  for (const el of pending.keys()) io.observe(el);

  return {
    title: S.titles.alphabet,
    destroy() {
      io.disconnect();
      for (const v of views) v.destroy();
    },
  };
}
