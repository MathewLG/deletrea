// @ts-check
import { h } from '../ui/dom.js';
import { S } from '../ui/strings.js';
import { screenTitle } from './shared.js';

/** @type {import('./shared.js').Screen} */
export function notFoundScreen(root) {
  root.append(
    h(
      'div',
      { class: 'cells' },
      h(
        'div',
        { class: 'cell cell--title' },
        screenTitle(S.notFound.h1),
        h('p', { text: S.notFound.body }),
        h('a', { class: 'btn btn--secondary', href: '#/', text: S.notFound.home }),
      ),
    ),
  );
  return { title: S.titles.notFound };
}
