// @ts-check
import { aboutScreen } from './screens/about.js';
import { alphabetScreen } from './screens/alphabet.js';
import { homeScreen } from './screens/home.js';
import { letterScreen } from './screens/letter.js';
import { notFoundScreen } from './screens/notFound.js';
import { practiceScreen } from './screens/practice.js';
import { spellScreen } from './screens/spell.js';
import { h } from './ui/dom.js';
import { fretRule } from './ui/motifs.js';
import { navigate, startRouter } from './ui/router.js';
import { installViolationLog } from './ui/security.js';
import { S } from './ui/strings.js';

/** @typedef {import('./screens/shared.js').Screen} Screen */
/** @typedef {import('./screens/shared.js').ScreenHandle} ScreenHandle */

installViolationLog();

/** @type {{key: string, href: string, label: string, match: (seg: string) => boolean}[]} */
const NAV = [
  { key: 'practica', href: '#/practica', label: S.nav.practice, match: (s) => s === 'practica' },
  { key: 'alfabeto', href: '#/alfabeto', label: S.nav.alphabet, match: (s) => s === 'alfabeto' || s === 'letra' },
  { key: 'deletrear', href: '#/deletrear', label: S.nav.spell, match: (s) => s === 'deletrear' },
  { key: 'acerca', href: '#/acerca', label: S.nav.about, match: (s) => s === 'acerca' },
];

/** @param {string[]} segments @returns {Screen} */
function pick(segments) {
  const [first = '', second] = segments;
  if (first === '' && !second) return homeScreen;
  if (first === 'alfabeto' && !second) return alphabetScreen;
  if (first === 'letra' && second && segments.length === 2) return letterScreen;
  if (first === 'practica' && !second) return practiceScreen;
  if (first === 'deletrear' && !second) return spellScreen;
  if (first === 'acerca' && !second) return aboutScreen;
  return notFoundScreen;
}

function buildShell() {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const main = document.getElementById('main');
  if (!header || !nav || !main) throw new Error('index.html is missing #header, #nav or #main');

  header.append(
    h('a', { class: 'skip-link', href: '#main', text: S.skipToContent }),
    h('div', { class: 'masthead' }, h('a', { class: 'wordmark', href: '#/', 'aria-label': S.homeLink, text: S.appName })),
    fretRule(),
  );
  // The skip link targets #main, which a hash router would treat as a route; handle it here.
  header.querySelector('.skip-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    main.focus();
  });

  nav.setAttribute('aria-label', S.nav.label);
  nav.setAttribute('data-testid', 'nav');
  const links = NAV.map((item) => h('a', { class: 'nav__link', href: item.href, text: item.label }));
  nav.append(h('ul', { class: 'nav__list' }, links.map((a) => h('li', {}, a))));
  return { main, links };
}

const { main, links } = buildShell();
/** @type {ScreenHandle|null} */
let active = null;
let first = true;

startRouter((route) => {
  try {
    active?.destroy?.();
  } catch (err) {
    console.warn('Screen cleanup failed', err);
  }
  active = null;
  main.replaceChildren();
  const screenEl = h('div', { class: 'screen' });
  main.append(screenEl);
  active = pick(route.segments)(screenEl, { route, navigate });
  document.title = active.title;

  const seg = route.segments[0] ?? '';
  NAV.forEach((item, i) => {
    if (item.match(seg)) links[i].setAttribute('aria-current', 'page');
    else links[i].removeAttribute('aria-current');
  });

  // On first load keep the browser's natural focus; on navigation move it to the new screen's h1.
  if (!first) {
    window.scrollTo(0, 0);
    /** @type {HTMLElement|null} */ (screenEl.querySelector('h1'))?.focus();
  }
  first = false;
});
