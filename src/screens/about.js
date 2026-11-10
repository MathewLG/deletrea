// @ts-check
import { VALIDATION_STATUS } from '../signs/alphabet.js';
import { h } from '../ui/dom.js';
import { S, VALIDATION_URL } from '../ui/strings.js';
import { screenTitle } from './shared.js';

/** @type {import('./shared.js').Screen} */
export function aboutScreen(root) {
  const a = S.about;
  root.append(
    h(
      'div',
      { class: 'cells' },
      h('div', { class: 'cell cell--title' }, screenTitle(a.h1)),
      h('section', { class: 'cell prose' }, h('h2', { text: a.what.title }), h('p', { text: a.what.p1 }), h('p', { text: a.what.p2 })),
      h(
        'section',
        { class: 'cell prose cell--deep' },
        h('h2', { text: a.language.title }),
        h('p', { text: a.language.p1 }),
        h('p', { text: a.language.p2 }),
        h('p', { text: a.language.p3 }),
        h('p', { text: a.language.p4 }),
      ),
      h(
        'section',
        { class: 'cell prose' },
        h('h2', { text: a.privacy.title }),
        h('p', { text: a.privacy.p1 }),
        h('p', { text: a.privacy.p2 }),
        h('p', { class: 'quiet', text: a.privacy.p3 }),
      ),
      h(
        'section',
        { class: 'cell prose', 'data-testid': 'validation-notice' },
        h('h2', { text: a.validation.title }),
        h('p', { class: 'notice__status', text: S.validation.status(VALIDATION_STATUS) }),
        h('p', { text: a.validation.p1 }),
        h('ul', { class: 'plain-list' }, a.validation.limits.map((t) => h('li', { text: t }))),
        h('p', { text: a.validation.help }),
        h('p', {}, h('a', { href: VALIDATION_URL, rel: 'noopener', text: a.validation.link })),
      ),
      h('section', { class: 'cell prose' }, h('h2', { text: a.credits.title }), h('ul', { class: 'plain-list' }, a.credits.items.map((t) => h('li', { text: t })))),
    ),
  );
  return { title: S.titles.about };
}
