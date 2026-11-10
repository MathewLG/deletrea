// @ts-check
/**
 * Tiny element builder. Styling goes through classes only: the CSP forbids inline style
 * attributes, so `style` is rejected here on purpose.
 */

/** @typedef {string|number|Node|null|undefined|false} Child */
/** @typedef {Record<string, unknown>} Attrs */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {Element} el
 * @param {Attrs} attrs
 */
function applyAttrs(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'style') throw new Error('Inline styles are not allowed (CSP). Use a class.');
    if (key === 'class') {
      el.setAttribute('class', Array.isArray(value) ? value.filter(Boolean).join(' ') : String(value));
    } else if (key === 'text') {
      el.textContent = String(value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), /** @type {EventListener} */ (value));
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

/**
 * @param {Element} el
 * @param {Child[]} children
 */
function appendChildren(el, children) {
  for (const c of children.flat(/** @type {1} */ (Infinity))) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Attrs} [attrs]
 * @param {...(Child|Child[])} children
 * @returns {HTMLElementTagNameMap[K]}
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  applyAttrs(el, attrs);
  appendChildren(el, /** @type {Child[]} */ (children));
  return el;
}

/**
 * @param {string} tag
 * @param {Attrs} [attrs]
 * @param {...(Child|Child[])} children
 * @returns {SVGElement}
 */
export function svg(tag, attrs = {}, ...children) {
  const el = /** @type {SVGElement} */ (document.createElementNS(SVG_NS, tag));
  applyAttrs(el, attrs);
  appendChildren(el, /** @type {Child[]} */ (children));
  return el;
}

/** @param {Element} el */
export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
}

/** Text only screen readers hear. @param {string} text */
export const srOnly = (text) => h('span', { class: 'sr-only', text });

/** @returns {boolean} */
export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let uid = 0;
/** @param {string} prefix */
export const uniqueId = (prefix) => `${prefix}-${++uid}`;
