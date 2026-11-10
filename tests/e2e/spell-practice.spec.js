import { expect, gumCalls, stubGetUserMedia, test } from './fixtures.js';

test.describe('spelling', () => {
  test('"Sol" previews S, O, L and leads to a practice of them', async ({ page }) => {
    await page.goto('/#/deletrear');
    const input = page.getByLabel('Escribe una palabra o tu nombre');
    await expect(input).toHaveAttribute('data-testid', 'spell-input');
    await input.fill('Sol');
    await expect(page.getByRole('list', { name: 'Letras' }).locator('.spell-cell__letter')).toHaveText(['S', 'O', 'L']);
    await page.getByTestId('spell-go').click();
    await expect(page).toHaveURL(/#\/practica\?letras=s,o,l$/);
    await expect(page.getByText('Vas a practicar: S, O y L.')).toBeVisible();
  });

  test('"año 3" keeps the Ñ and reports the skipped character', async ({ page }) => {
    await page.goto('/#/deletrear');
    await page.getByTestId('spell-input').fill('año 3');
    await expect(page.getByRole('list', { name: 'Letras' }).locator('.spell-cell__letter')).toHaveText(['A', 'Ñ', 'O']);
    await expect(page.getByText('se omiten: 3')).toBeVisible();
  });
});

test.describe('practice with the synthetic source', () => {
  test('two static letters reach success, advance and finish', async ({ page }) => {
    await page.goto('/#/practica?letras=a,b&fuente=sintetica&rapido=1');
    const target = page.getByTestId('target-letter');
    const hint = page.getByTestId('hint');
    await expect(page.getByTestId('stage')).toBeVisible();
    await expect(target).toHaveText('A');
    await expect(hint).toHaveText('Esa es la A', { timeout: 10_000 });
    await expect(target).toHaveText('B', { timeout: 10_000 });
    await expect(hint).toHaveText('Esa es la B', { timeout: 10_000 });
    const finished = page.getByTestId('practice-finished');
    await expect(finished).toBeVisible({ timeout: 10_000 });
    await expect(finished.locator('dt', { hasText: 'Hiciste' }).locator('+ dd')).toHaveText('A y B');
    await expect(finished.locator('dt', { hasText: 'Saltaste' }).locator('+ dd')).toHaveText('Ninguna');
  });

  test('focus never falls to body when success hides a focused button and the letter advances', async ({ page }) => {
    await page.goto('/#/practica?letras=a,b,c&fuente=sintetica&rapido=1');
    const hint = page.getByTestId('hint');
    const activeTag = () => page.evaluate(() => document.activeElement?.tagName ?? 'none');
    // Skip is focused when success hides it.
    await page.getByTestId('btn-skip').focus();
    await expect(hint).toHaveText('Esa es la A', { timeout: 10_000 });
    expect(await activeTag()).not.toBe('BODY');
    // Next is focused when auto-advance hides it.
    await page.getByTestId('btn-next').focus();
    await expect(page.getByTestId('target-letter')).toHaveText('B', { timeout: 10_000 });
    expect(await activeTag()).not.toBe('BODY');
    await expect(hint).toHaveText('Esa es la B', { timeout: 10_000 });
    expect(await activeTag()).not.toBe('BODY');
  });

  test('skipping a letter is recorded as skipped', async ({ page }) => {
    // Without rapido the synthetic hand holds a wrong pose for over two seconds, so skip lands first.
    await page.goto('/#/practica?letras=a,b&fuente=sintetica');
    await expect(page.getByTestId('target-letter')).toHaveText('A');
    await page.getByTestId('btn-skip').click();
    await expect(page.getByTestId('target-letter')).toHaveText('B');
    await page.getByTestId('btn-finish').click();
    const finished = page.getByTestId('practice-finished');
    await expect(finished).toBeVisible();
    await expect(finished.locator('dt', { hasText: 'Saltaste' }).locator('+ dd')).toHaveText('A');
  });

  test('a dynamic letter shows the observe state with "Continuar"', async ({ page }) => {
    await page.goto('/#/practica?letras=j&fuente=sintetica&rapido=1');
    await expect(page.getByTestId('target-letter')).toHaveText('J');
    const cont = page.getByTestId('btn-next');
    await expect(cont).toBeVisible();
    await expect(cont).toHaveText('Continuar');
    await expect(page.getByTestId('btn-skip')).toBeHidden();
    await expect(page.getByTestId('hint')).toContainText('dibuja una J en el aire');
    await cont.click();
    const finished = page.getByTestId('practice-finished');
    await expect(finished).toBeVisible();
    await expect(finished.locator('dt', { hasText: 'Solo viste' }).locator('+ dd')).toHaveText('J');
  });
});

test.describe('practice intro and camera errors', () => {
  test('intro shows both buttons and makes no camera request', async ({ page }) => {
    await stubGetUserMedia(page);
    await page.goto('/#/practica');
    await expect(page.getByRole('heading', { name: 'Antes de empezar' })).toBeVisible();
    await expect(page.getByTestId('btn-start-camera')).toHaveText('Activar cámara');
    await expect(page.getByTestId('btn-demo')).toHaveText('Probar sin cámara');
    expect(await gumCalls(page)).toBe(0);
  });

  test('a denied camera shows the denied state and a way to try without it', async ({ page }) => {
    await stubGetUserMedia(page, { reject: 'NotAllowedError' });
    await page.goto('/#/practica?letras=a');
    await page.getByTestId('btn-start-camera').click();
    await expect(page.getByRole('alert')).toContainText('No hay permiso para usar la cámara');
    expect(await gumCalls(page)).toBe(1);
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    await page.getByTestId('btn-demo').click();
    await expect(page.getByTestId('stage')).toBeVisible();
    await expect(page.getByTestId('target-letter')).toHaveText('A');
    expect(await gumCalls(page)).toBe(1);
  });
});
