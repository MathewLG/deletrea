// Shared fixture: every test fails on console errors, uncaught page errors
// or Content-Security-Policy violations, collected during the whole test.
import { test as base, expect } from 'playwright/test';

export const APP_ORIGIN = 'http://localhost:4173';

/** Routes every screen-level test walks through. */
export const ROUTES = ['#/', '#/alfabeto', '#/letra/a', '#/letra/j', '#/deletrear', '#/acerca', '#/practica', '#/no-existe'];

export const test = base.extend({
  /** Problems seen so far; tests may read it, teardown asserts it is empty. */
  problems: [
    async ({ page }, use) => {
      /** @type {string[]} */
      const problems = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
      });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      await page.exposeBinding('__reportCspViolation', (_source, v) => {
        problems.push(`securitypolicyviolation: ${v.directive} blocked ${v.uri}`);
      });
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (e) => {
          // @ts-ignore binding exposed by the fixture
          window.__reportCspViolation({ directive: e.effectiveDirective || e.violatedDirective, uri: e.blockedURI || '(inline)' });
        });
      });
      await use(problems);
      expect(problems, 'console errors, page errors or CSP violations').toEqual([]);
    },
    { auto: true },
  ],
});

/**
 * Replace navigator.mediaDevices.getUserMedia before the app loads. Calls are
 * counted in window.__gumCalls. With `reject`, the promise rejects with a
 * DOMException of that name; otherwise it never settles (no real camera).
 * @param {import('playwright/test').Page} page
 * @param {{reject?: string}} [opts]
 */
export async function stubGetUserMedia(page, opts = {}) {
  await page.addInitScript((rejectName) => {
    // @ts-ignore test-only global
    window.__gumCalls = 0;
    const fake = () => {
      // @ts-ignore test-only global
      window.__gumCalls += 1;
      if (rejectName) return Promise.reject(new DOMException('Denied by test stub', rejectName));
      return new Promise(() => {});
    };
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
    }
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: fake, configurable: true, writable: true });
  }, opts.reject ?? null);
}

/** @param {import('playwright/test').Page} page */
export const gumCalls = (page) => page.evaluate(() => /** @type {any} */ (window).__gumCalls);

export { expect };
