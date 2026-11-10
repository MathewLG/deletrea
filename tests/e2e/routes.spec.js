import { APP_ORIGIN, ROUTES, expect, test } from './fixtures.js';

test.describe('every route', () => {
  for (const route of ROUTES) {
    test(`${route} loads with an h1 and no errors`, async ({ page }) => {
      await page.goto(`/${route}`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByTestId('nav')).toBeVisible();
    });
  }

  test('unknown route shows the 404 cell with a link home', async ({ page }) => {
    await page.goto('/#/no-existe');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página no existe');
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByRole('link', { name: 'Practicar con mi cámara' })).toBeVisible();
  });
});

test.describe('content security policy', () => {
  test('meta CSP connect-src lists only self, jsDelivr and Google storage', async ({ page }) => {
    await page.goto('/');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toBeTruthy();
    const directives = Object.fromEntries(
      String(csp)
        .split(';')
        .map((d) => d.trim().split(/\s+/))
        .filter((parts) => parts[0])
        .map(([name, ...values]) => [name, values]),
    );
    expect(directives['connect-src']?.slice().sort()).toEqual(
      ["'self'", 'https://cdn.jsdelivr.net', 'https://storage.googleapis.com'].sort(),
    );
  });

  test('loading every route requests nothing outside the app origin', async ({ page }) => {
    /** @type {string[]} */
    const foreign = [];
    page.on('request', (req) => {
      const url = req.url();
      if (/^https?:/.test(url) && new URL(url).origin !== APP_ORIGIN) foreign.push(url);
    });
    for (const route of ROUTES) {
      await page.goto(`/${route}`);
      await expect(page.locator('h1')).toBeVisible();
      await page.waitForLoadState('networkidle');
    }
    expect(foreign).toEqual([]);
  });
});
