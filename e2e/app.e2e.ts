import { expect, test, type Page } from '@playwright/test';

const selectLucas = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Lucas/ }).click();
};

test('seleciona um perfil e inicia um treino sem erros no cliente', async ({ page }) => {
  const clientErrors: string[] = [];
  page.on('pageerror', (error) => clientErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') clientErrors.push(message.text());
  });

  await page.goto('/');

  await expect(page).toHaveTitle('Ritmo Duo');
  await expect(page.getByRole('heading', { name: 'Quem está treinando?' })).toBeVisible();

  await page.getByRole('button', { name: /Lucas/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Pronto para manter o ritmo?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar treino' }).click();

  await expect(page).toHaveURL(/#\/active$/);
  await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible();
  await expect(page.getByText(/^Treino [ABC]$/)).toBeVisible();
  expect(clientErrors).toEqual([]);
});

test('mantém o formulário de peso dentro da viewport em telas estreitas', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Progresso' }).click();

  const dateInput = page.getByLabel('Data da pesagem');
  await expect(dateInput).toBeVisible();

  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
  await expect.poll(async () => dateInput.evaluate((input) => input.getBoundingClientRect().right)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
});
