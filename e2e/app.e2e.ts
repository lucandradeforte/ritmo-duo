import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const selectLucas = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Lucas/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Pronto para manter o ritmo?' }),
  ).toBeVisible();
};

const startLucasWorkout = async (page: Page) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Iniciar treino' }).click();
  await expect(page).toHaveURL(/#\/active$/);
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

test('retoma a série registrada após recarregar o aplicativo', async ({ page }) => {
  await startLucasWorkout(page);

  await page.getByLabel('Carga da série 1').fill('10');
  await page.getByLabel('Repetições da série 1').fill('8');
  await page.getByLabel('RIR da série 1').fill('3');
  await page.getByRole('button', { name: 'Concluir série 1' }).click();
  await expect(page.getByRole('button', { name: 'Série 1 concluída' })).toBeVisible();

  await page.reload();
  const recoveryDialog = page.getByRole('dialog', { name: 'Treino em andamento' });
  await expect(recoveryDialog).toBeVisible();
  await recoveryDialog.getByRole('button', { name: 'Continuar treino' }).click();

  await expect(page.getByLabel('Carga da série 1')).toHaveValue('10');
  await expect(page.getByLabel('Repetições da série 1')).toHaveValue('8');
  await expect(page.getByLabel('RIR da série 1')).toHaveValue('3');
  await expect(page.getByRole('button', { name: 'Série 1 concluída' })).toBeVisible();
});

test('mantém as sessões independentes ao alternar o modo dupla', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Iniciar em modo dupla' }).click();
  await expect(page).toHaveURL(/#\/active$/);

  const profileSwitcher = page.getByRole('group', { name: 'Alternar pessoa' });
  const lucasButton = profileSwitcher.getByRole('button', { name: /Lucas/ });
  const geovannaButton = profileSwitcher.getByRole('button', { name: /Geovanna/ });

  await expect(lucasButton).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Carga da série 1').fill('10');
  await page.getByLabel('Repetições da série 1').fill('8');
  await page.getByLabel('RIR da série 1').fill('3');
  await page.getByRole('button', { name: 'Concluir série 1' }).click();

  await geovannaButton.click();
  await expect(geovannaButton).toHaveAttribute('aria-pressed', 'true');
  await expect(lucasButton).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByLabel('Carga da série 1')).toHaveValue('');

  await lucasButton.click();
  await expect(page.getByLabel('Carga da série 1')).toHaveValue('10');
});

test('abre o exemplo do exercício por cima da ficha e retorna à ficha', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Treinos' }).click();
  await page.getByRole('button', { name: 'Ver ficha' }).first().click();

  const workoutDetail = page.getByRole('dialog', { name: /Treino A/ });
  await expect(workoutDetail).toBeVisible();
  await workoutDetail
    .getByRole('button', { name: 'Ver exemplo de execução de Agachamento goblet para banco' })
    .click();

  const exerciseDetail = page.getByRole('dialog', { name: /Agachamento goblet para banco/ });
  await expect(exerciseDetail.getByRole('heading', { name: 'Configuração' })).toBeVisible();
  await exerciseDetail.getByRole('button', { name: 'Fechar' }).click();
  await expect(workoutDetail.getByRole('heading', { name: 'Exercícios e cardio' })).toBeVisible();
});

test('não apresenta violações automatizadas de acessibilidade na tela inicial nos dois temas', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await selectLucas(page);

  const lightResults = await new AxeBuilder({ page }).analyze();
  expect(lightResults.violations).toEqual([]);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Pronto para manter o ritmo?' }),
  ).toBeVisible();

  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations).toEqual([]);
});
