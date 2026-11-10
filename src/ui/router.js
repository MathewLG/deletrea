// @ts-check

/**
 * @typedef {Object} Route
 * @property {string} path            e.g. '/letra/a'
 * @property {string[]} segments      e.g. ['letra', 'a']
 * @property {URLSearchParams} query  query inside the hash, e.g. '#/practica?letras=a,b'
 */

/** @param {string} hash @returns {Route} */
export function parseHash(hash) {
  let raw = hash.replace(/^#/, '');
  if (!raw.startsWith('/')) raw = `/${raw}`;
  const q = raw.indexOf('?');
  const pathPart = q === -1 ? raw : raw.slice(0, q);
  const queryPart = q === -1 ? '' : raw.slice(q + 1);
  let path = pathPart.replace(/\/+$/, '') || '/';
  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep the raw path; an undecodable hash simply matches no route.
  }
  return {
    path,
    segments: path.split('/').filter(Boolean),
    query: new URLSearchParams(queryPart),
  };
}

/**
 * Reads a flag from the page query (?fuente=sintetica) or the hash query (#/practica?fuente=sintetica).
 * @param {string} name
 * @returns {string|null}
 */
export function pageParam(name) {
  const fromSearch = new URLSearchParams(location.search).get(name);
  if (fromSearch !== null) return fromSearch;
  return parseHash(location.hash).query.get(name);
}

/** @param {string} path e.g. '#/alfabeto' */
export function navigate(path) {
  if (location.hash === path) window.dispatchEvent(new Event('hashchange'));
  else location.hash = path;
}

/**
 * @param {(route: Route) => void} onRoute
 * @returns {() => void} stop
 */
export function startRouter(onRoute) {
  const handler = () => onRoute(parseHash(location.hash));
  window.addEventListener('hashchange', handler);
  handler();
  return () => window.removeEventListener('hashchange', handler);
}
