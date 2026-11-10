import { expect, test } from './fixtures.js';

test.describe('alphabet', () => {
  test('shows 27 cells, 6 tagged "con movimiento"', async ({ page }) => {
    await page.goto('/#/alfabeto');
    const grid = page.getByTestId('alphabet-grid');
    await expect(grid.locator('[data-testid^="letter-cell-"]')).toHaveCount(27);
    await expect(grid.getByText('con movimiento', { exact: true })).toHaveCount(6);
    for (const id of ['j', 'k', 'enie', 'q', 'x', 'z']) {
      await expect(page.getByTestId(`letter-cell-${id}`)).toContainText('con movimiento');
    }
  });

  test('clicking A opens its letter screen with description and validation notice', async ({ page }) => {
    await page.goto('/#/alfabeto');
    await page.getByTestId('letter-cell-a').click();
    await expect(page).toHaveURL(/#\/letra\/a$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letra A');
    await expect(page.getByText('Cierra la mano en puño y deja el pulgar estirado', { exact: false })).toBeVisible();
    await expect(page.getByTestId('validation-notice')).toBeVisible();
    await expect(page.getByTestId('validation-notice')).toContainText('aún no han sido revisadas por personas Sordas');
  });
});

test.describe('letter screen', () => {
  test('a static letter links to a practice of that letter', async ({ page }) => {
    await page.goto('/#/letra/a');
    const practice = page.getByRole('link', { name: 'Practicar esta letra' });
    await expect(practice).toHaveAttribute('href', '#/practica?letras=a');
    await practice.click();
    await expect(page).toHaveURL(/#\/practica\?letras=a$/);
    await expect(page.getByText('Vas a practicar: A.')).toBeVisible();
  });

  test('a letter with movement shows its movement and no practice button', async ({ page }) => {
    await page.goto('/#/letra/j');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letra J');
    await expect(page.getByRole('heading', { name: 'Movimiento' })).toBeVisible();
    await expect(page.getByText('Con la punta del meñique dibuja una J en el aire', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Practicar esta letra' })).toHaveCount(0);
  });

  test('previous and next links move through the alphabet', async ({ page }) => {
    await page.goto('/#/letra/a');
    await page.getByRole('link', { name: 'Letra siguiente: B' }).click();
    await expect(page).toHaveURL(/#\/letra\/b$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letra B');
    await page.getByRole('link', { name: 'Letra anterior: A' }).click();
    await expect(page).toHaveURL(/#\/letra\/a$/);
    // Wraps around at the start.
    await page.getByRole('link', { name: 'Letra anterior: Z' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letra Z');
  });

  test('arrow keys on the hand canvas rotate without throwing', async ({ page }) => {
    await page.goto('/#/letra/a');
    const canvas = page.getByRole('img', { name: /Mano haciendo la letra A/ });
    await canvas.focus();
    await expect(canvas).toBeFocused();
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft']) await page.keyboard.press(key);
    await page.getByRole('button', { name: 'Ver de frente' }).click();
    // The fixture fails the test on any page error raised by the handlers.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letra A');
  });
});
