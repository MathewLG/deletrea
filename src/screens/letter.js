// @ts-check
import { createHandView } from '../render/handView.js';
import { signView } from '../render/signPose.js';
import { ALPHABET, getSign } from '../signs/alphabet.js';
import { h } from '../ui/dom.js';
import { S, SOURCE_NAMES, listJoin } from '../ui/strings.js';
import { notFoundScreen } from './notFound.js';
import { letterHref, practiceHref, screenTitle, validationNotice } from './shared.js';

/** @type {import('./shared.js').Screen} */
export function letterScreen(root, ctx) {
  const id = ctx.route.segments[1] ?? '';
  const sign = getSign(id === 'ñ' ? 'enie' : id);
  if (!sign) return notFoundScreen(root, ctx);

  const i = ALPHABET.indexOf(sign);
  const prev = ALPHABET[(i - 1 + ALPHABET.length) % ALPHABET.length];
  const next = ALPHABET[(i + 1) % ALPHABET.length];
  const moving = sign.kind === 'dynamic';

  const canvas = h('canvas', {
    class: 'hand-canvas hand-canvas--large',
    'aria-label': S.letter.handLabel(sign.letter, sign.description),
  });
  const resetBtn = h('button', { type: 'button', class: 'btn btn--quiet', text: S.letter.resetView });

  const sources = sign.sources.map((k) => SOURCE_NAMES[k] ?? k);
  const confusable = (sign.confusable ?? [])
    .map((cid) => getSign(cid)?.letter)
    .filter((l) => typeof l === 'string');
  const doubleNote = sign.id === 'l' ? S.letter.double.l : sign.id === 'r' ? S.letter.double.r : null;

  root.append(
    h(
      'div',
      { class: 'cells' },
      h(
        'div',
        { class: 'cell cell--title letter-head' },
        screenTitle(h('span', {}, h('span', { class: 'sr-only', text: S.letter.srPrefix }), sign.letter), 'target-letter'),
        moving ? h('span', { class: 'tag', text: S.alphabet.moving }) : null,
      ),
      h(
        'div',
        { class: 'cell cell--stage letter-stage' },
        canvas,
        h('div', { class: 'letter-stage__controls' }, h('p', { class: 'quiet', text: S.letter.rotateHelp }), resetBtn),
      ),
      h(
        'div',
        { class: 'cell prose' },
        h('h2', { text: S.letter.howTo }),
        h('p', { text: sign.description }),
        moving && sign.movement
          ? [h('h3', { text: S.letter.movement }), h('p', { text: sign.movement }), h('p', { class: 'quiet', text: S.letter.movingNote })]
          : null,
        doubleNote ? h('p', { text: doubleNote }) : null,
        h('p', { class: 'quiet', text: S.letter.mirror }),
      ),
      h(
        'div',
        { class: 'cell prose' },
        h('h2', { text: S.letter.evidence }),
        h('p', { text: sign.confidenceNote ?? S.letter.confidence[sign.confidence] }),
        h('p', { text: S.letter.sources(listJoin(sources)) }),
        confusable.length ? h('p', { text: S.letter.confusable(listJoin(confusable)) }) : null,
      ),
      moving
        ? null
        : h('div', { class: 'cell cell--actions' }, h('a', { class: 'btn btn--primary btn--wide', href: practiceHref([sign.id]), text: S.letter.practice })),
      h(
        'nav',
        { class: 'cell pager', 'aria-label': S.alphabet.h1 },
        h('a', { class: 'pager__link', href: letterHref(prev.id), 'aria-label': S.letter.prevLabel(prev.letter) }, h('span', { class: 'pager__dir', text: S.letter.prev }), h('span', { class: 'pager__letter', text: prev.letter })),
        h('a', { class: 'pager__link pager__link--mid', href: '#/alfabeto', text: S.alphabet.h1 }),
        h('a', { class: 'pager__link pager__link--end', href: letterHref(next.id), 'aria-label': S.letter.nextLabel(next.letter) }, h('span', { class: 'pager__dir', text: S.letter.next }), h('span', { class: 'pager__letter', text: next.letter })),
      ),
      validationNotice(),
    ),
  );

  const view = createHandView(canvas, { mirror: true, interactive: true, cuff: true });
  view.setLandmarks(signView(sign));
  resetBtn.addEventListener('click', () => view.setRotation(0, 0));

  return { title: S.titles.letter(sign.letter), destroy: () => view.destroy() };
}
