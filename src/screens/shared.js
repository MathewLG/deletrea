// @ts-check
/** Pieces several screens share. */
import { VALIDATION_STATUS } from '../signs/alphabet.js';
import { h } from '../ui/dom.js';
import { S } from '../ui/strings.js';

/**
 * @typedef {Object} ScreenContext
 * @property {import('../ui/router.js').Route} route
 * @property {(path: string) => void} navigate
 */
/** @typedef {{title: string, destroy?: () => void}} ScreenHandle */
/** @typedef {(root: HTMLElement, ctx: ScreenContext) => ScreenHandle} Screen */

/**
 * The screen title. tabindex -1 lets the router move focus here on navigation.
 * @param {string|Node} content @param {string} [cls]
 */
export const screenTitle = (content, cls = '') => h('h1', { class: ['screen-title', cls], tabindex: '-1' }, content);

/** "Not yet validated by Deaf LSM users", shown wherever signs are taught. */
export function validationNotice() {
  return h(
    'aside',
    { class: 'cell notice', 'data-testid': 'validation-notice', 'aria-label': S.validation.status(VALIDATION_STATUS) },
    h('p', { class: 'notice__status', text: S.validation.status(VALIDATION_STATUS) }),
    h('p', { class: 'notice__text' }, S.validation.text, ' ', h('a', { href: '#/acerca', text: S.validation.link })),
  );
}

/** @param {string} id */
export const letterHref = (id) => `#/letra/${encodeURIComponent(id)}`;

/** @param {string[]} ids */
export const practiceHref = (ids) => `#/practica?letras=${ids.map(encodeURIComponent).join(',')}`;
