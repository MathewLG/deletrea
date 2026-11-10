import { ROUTES, expect, test } from './fixtures.js';

/** @param {import('playwright/test').Page} page */
const focused = (page) =>
  page.evaluate(() => {
    const el = /** @type {HTMLElement} */ (document.activeElement);
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      name: (el.getAttribute('aria-label') || el.textContent || '').trim(),
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
    };
  });

test.describe('keyboard', () => {
  test('Tab walks the home screen in order with visible focus; Enter navigates and focuses the h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    const expected = [
      'Saltar al contenido',
      'Deletrea, ir al inicio',
      'Practicar con mi cámara',
      'Ver el alfabeto',
      'Deletrear una palabra',
      'Cómo ayudar',
      'Practicar',
      'Alfabeto',
      'Deletrear',
      'Acerca',
    ];
    /** @type {string[]} */
    const seen = [];
    for (let i = 0; i < expected.length; i++) {
      await page.keyboard.press('Tab');
      const f = await focused(page);
      seen.push(f.name);
      expect(f.outlineStyle, `outline style on "${f.name}"`).not.toBe('none');
      expect(parseFloat(f.outlineWidth), `outline width on "${f.name}"`).toBeGreaterThan(0);
    }
    expect(seen).toEqual(expected);

    // Back to the primary button and activate it.
    for (let i = 0; i < 7; i++) await page.keyboard.press('Shift+Tab');
    expect((await focused(page)).name).toBe('Practicar con mi cámara');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/practica$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Práctica' })).toBeFocused();

    // A nav link activated by keyboard also lands focus on the new h1.
    await page.getByRole('navigation', { name: 'Secciones' }).getByRole('link', { name: 'Alfabeto' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/alfabeto$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Alfabeto' })).toBeFocused();
  });
});

for (const width of [320, 390]) {
  test.describe(`layout at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const route of [...ROUTES, '#/practica?letras=a,j&fuente=sintetica']) {
      test(`${route} has no horizontal overflow and 44px tap targets`, async ({ page }) => {
        await page.goto(`/${route}`);
        await expect(page.locator('h1')).toBeVisible();
        if (route.includes('fuente=')) await expect(page.getByTestId('stage')).toBeVisible();

        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll, 'scrollWidth must not exceed clientWidth').toBeLessThanOrEqual(overflow.client);

        const small = await page.evaluate(() =>
          [...document.querySelectorAll('button, .btn, .nav__link')]
            .filter((el) => el.getClientRects().length > 0)
            .map((el) => ({ name: (el.textContent || '').trim(), height: el.getBoundingClientRect().height }))
            .filter((t) => t.height < 44),
        );
        expect(small, 'buttons and nav links shorter than 44px').toEqual([]);
      });
    }
  });
}
