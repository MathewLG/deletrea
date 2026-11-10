// @ts-check
import { createHandView } from '../render/handView.js';
import { createPoseTween } from '../render/signPose.js';
import { getSign } from '../signs/alphabet.js';
import { h, prefersReducedMotion } from '../ui/dom.js';
import { anchorScroll, speechScroll } from '../ui/motifs.js';
import { S } from '../ui/strings.js';
import { screenTitle, validationNotice } from './shared.js';

const HOLD_MS = 1600;
const MOVE_MS = 650;

/** @type {import('./shared.js').Screen} */
export function homeScreen(root) {
  const word = S.home.word.split('');
  const signs = word.map((ch) => getSign(ch.toLowerCase())).filter((s) => s !== undefined);

  const canvas = h('canvas', { class: 'hand-canvas', role: 'img' });
  const current = h('span', { class: 'home-hand__letter', 'aria-hidden': 'true' });
  const wordEl = h(
    'span',
    { class: 'home-hand__word', 'aria-hidden': 'true' },
    word.map((ch) => h('span', { class: 'home-hand__char', text: ch })),
  );
  const chars = /** @type {HTMLElement[]} */ ([...wordEl.children]);
  const scroll = speechScroll();
  scroll.classList.add('voluta--anchored');

  root.append(
    h(
      'div',
      { class: 'cells' },
      h('div', { class: 'cell cell--title' }, screenTitle(S.home.h1), h('p', { class: 'lead', text: S.home.lead })),
      h(
        'div',
        { class: 'cell cell--stage home-hand' },
        h('div', { class: 'home-hand__figure' }, canvas, scroll),
        h('div', { class: 'home-hand__side' }, h('span', { class: 'home-hand__caption', text: S.home.spelling }), current, wordEl),
      ),
      h(
        'div',
        { class: 'cell cell--actions' },
        h('a', { class: 'btn btn--primary btn--wide', href: '#/practica', text: S.home.start }),
        h(
          'p',
          { class: 'link-row' },
          h('a', { href: '#/alfabeto', text: S.home.seeAlphabet }),
          h('a', { href: '#/deletrear', text: S.home.spellWord }),
        ),
        h('p', { class: 'quiet', text: S.home.privacy }),
      ),
      validationNotice(),
    ),
  );

  const view = createHandView(canvas, { mirror: true, cuff: true, cuffAccent: false, onDraw: (a) => anchorScroll(scroll, a) });
  const tween = createPoseTween(view, { duration: MOVE_MS });
  let i = 0;
  let timer = 0;
  let visible = true;
  let destroyed = false;

  function show(/** @type {number} */ k, /** @type {boolean} */ instant) {
    const sign = signs[k];
    if (!sign) return;
    tween.to(sign.pose, sign.orientation, { instant });
    current.textContent = sign.letter;
    chars.forEach((c, n) => c.classList.toggle('is-current', n === k));
    canvas.setAttribute('aria-label', S.home.handLabel(sign.letter));
  }

  function schedule() {
    clearTimeout(timer);
    if (destroyed || !visible || document.hidden || prefersReducedMotion()) return;
    timer = window.setTimeout(() => {
      i = (i + 1) % signs.length;
      show(i, false);
      schedule();
    }, HOLD_MS + MOVE_MS);
  }

  show(0, true);
  schedule();

  // The loop pauses off screen and in background tabs (DESIGN.md, Motion).
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    schedule();
  });
  io.observe(canvas);
  const onVis = () => schedule();
  document.addEventListener('visibilitychange', onVis);

  return {
    title: S.titles.home,
    destroy() {
      destroyed = true;
      clearTimeout(timer);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      tween.stop();
      view.destroy();
    },
  };
}
